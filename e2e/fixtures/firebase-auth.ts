import type { Page, Route } from "@playwright/test";

// Stands in for Firebase Auth in e2e tests. The app talks to Firebase's
// Identity Toolkit REST API directly from the browser (that's what the
// `firebase/auth` client SDK does under the hood), so we intercept those
// well-known endpoints with page.route() instead of running a real project
// or the Firebase emulator suite.
//
// Endpoint shapes/error codes below are taken from the installed SDK
// (node_modules/@firebase/auth) rather than guessed — in particular
// INVALID_LOGIN_CREDENTIALS -> auth/invalid-credential and
// EMAIL_EXISTS -> auth/email-already-in-use, which src/constants.ts maps to
// the user-facing copy the sign-in/sign-up specs assert on.

export interface FakeUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
}

interface MockFirebaseAuthOptions {
  users?: FakeUser[];
}

const idTokenFor = (user: FakeUser) => `fake-id-token-${user.uid}`;
const refreshTokenFor = (user: FakeUser) => `fake-refresh-token-${user.uid}`;

const fulfillJson = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

const fulfillError = (route: Route, message: string, status = 400) =>
  fulfillJson(route, status, {
    error: { code: status, message, errors: [{ message }] },
  });

const fulfillUser = (route: Route, user: FakeUser, kind: string) =>
  fulfillJson(route, 200, {
    kind,
    localId: user.uid,
    email: user.email,
    displayName: user.displayName,
    idToken: idTokenFor(user),
    refreshToken: refreshTokenFor(user),
    expiresIn: "3600",
    registered: true,
  });

/**
 * Registers route mocks for every Identity Toolkit / Secure Token endpoint
 * the app's sign-in, sign-up, sign-out, forgot-password, and profile-update
 * flows use. `options.users` seeds accounts that "already exist" so a test
 * can sign in against them; accounts created via the sign-up form during the
 * test are added to the same in-memory store automatically.
 */
export const mockFirebaseAuth = async (
  page: Page,
  options: MockFirebaseAuthOptions = {},
) => {
  const usersByEmail = new Map<string, FakeUser>(
    (options.users ?? []).map((user) => [user.email, user]),
  );
  let nextUid = 1000;

  const findByIdToken = (idToken: string | undefined) =>
    [...usersByEmail.values()].find((user) => idTokenFor(user) === idToken);

  await page.route(
    "**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword*",
    async (route) => {
      const body = route.request().postDataJSON() as {
        email: string;
        password: string;
      };
      const user = usersByEmail.get(body.email);

      if (!user || user.password !== body.password) {
        return fulfillError(route, "INVALID_LOGIN_CREDENTIALS");
      }

      return fulfillUser(route, user, "identitytoolkit#VerifyPasswordResponse");
    },
  );

  await page.route(
    "**/identitytoolkit.googleapis.com/v1/accounts:signUp*",
    async (route) => {
      const body = route.request().postDataJSON() as {
        email: string;
        password: string;
      };

      if (usersByEmail.has(body.email)) {
        return fulfillError(route, "EMAIL_EXISTS");
      }

      const user: FakeUser = {
        uid: `uid-${nextUid++}`,
        email: body.email,
        password: body.password,
        displayName: "",
      };
      usersByEmail.set(body.email, user);

      return fulfillUser(route, user, "identitytoolkit#SignupNewUserResponse");
    },
  );

  await page.route(
    "**/identitytoolkit.googleapis.com/v1/accounts:update*",
    async (route) => {
      const body = route.request().postDataJSON() as {
        idToken?: string;
        displayName?: string;
        password?: string;
      };
      const user = findByIdToken(body.idToken);

      if (!user) return fulfillError(route, "INVALID_ID_TOKEN");

      if (body.displayName !== undefined) user.displayName = body.displayName;
      if (body.password) user.password = body.password;

      return fulfillUser(route, user, "identitytoolkit#SetAccountInfoResponse");
    },
  );

  await page.route(
    "**/identitytoolkit.googleapis.com/v1/accounts:lookup*",
    async (route) => {
      const body = route.request().postDataJSON() as { idToken?: string };
      const user = findByIdToken(body.idToken);

      if (!user) return fulfillError(route, "INVALID_ID_TOKEN");

      return fulfillJson(route, 200, {
        kind: "identitytoolkit#GetAccountInfoResponse",
        users: [
          {
            localId: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: true,
            providerUserInfo: [
              {
                providerId: "password",
                email: user.email,
                displayName: user.displayName,
              },
            ],
          },
        ],
      });
    },
  );

  await page.route(
    "**/identitytoolkit.googleapis.com/v1/accounts:sendOobCode*",
    async (route) => {
      const body = route.request().postDataJSON() as { email?: string };

      return fulfillJson(route, 200, {
        kind: "identitytoolkit#GetOobConfirmationCodeResponse",
        email: body.email,
      });
    },
  );

  await page.route(
    "**/securetoken.googleapis.com/v1/token*",
    async (route) => {
      const user = [...usersByEmail.values()][0];
      if (!user) return fulfillError(route, "TOKEN_EXPIRED");

      return fulfillJson(route, 200, {
        access_token: idTokenFor(user),
        id_token: idTokenFor(user),
        refresh_token: refreshTokenFor(user),
        expires_in: "3600",
        token_type: "Bearer",
        user_id: user.uid,
        project_id: "e2e-fake-project",
      });
    },
  );

  return { usersByEmail };
};
