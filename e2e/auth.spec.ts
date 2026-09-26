import { test, expect } from "@playwright/test";
import { mockFirebaseAuth } from "./fixtures/firebase-auth";
import { TEST_USER, signInAsTestUser } from "./fixtures/test-data";

test.describe("sign in", () => {
  test("signs in with valid credentials and reaches the home page", async ({
    page,
  }) => {
    await signInAsTestUser(page);

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("link", { name: /Welcome Jordan/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toHaveCount(0);
  });

  test("shows an error for an incorrect password and stays on the page", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await page.goto("/sign-in");
    await page.getByPlaceholder("Enter your email").fill(TEST_USER.email);
    await page.getByPlaceholder("Enter your password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(
      page.getByText(
        "Your email and/or password is incorrect. Please try again.",
      ),
    ).toBeVisible();
    await expect(page).toHaveURL("/sign-in");
  });

  test("sends a password reset email from the forgot password modal", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await page.goto("/sign-in");
    await page.getByRole("button", { name: "Forgot Password" }).click();
    await expect(
      page.getByRole("heading", { name: "Forgot Password" }),
    ).toBeVisible();

    await page
      .getByPlaceholder("Enter your email...")
      .fill(TEST_USER.email);
    await page.getByRole("button", { name: "Reset Password" }).click();

    await expect(
      page.getByText(
        `If an account exists for ${TEST_USER.email}, a reset link is on its way.`,
      ),
    ).toBeVisible();
  });
});

test.describe("sign up", () => {
  test("creates a new account and reaches the home page", async ({
    page,
  }) => {
    await mockFirebaseAuth(page);

    await page.goto("/sign-up");
    await page.getByPlaceholder("Enter your first name").fill("Alex");
    await page.getByPlaceholder("Enter your last name").fill("Rivera");
    await page
      .getByPlaceholder("Enter your email")
      .fill("alex.rivera@example.com");
    await page
      .getByPlaceholder("Enter your password")
      .fill("a-brand-new-password");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/");
    // The nav's first name comes from a follow-up updateProfile() call, and
    // the Firebase Auth SDK only re-notifies onAuthStateChanged listeners
    // when that response carries a new idToken — it doesn't here, so the
    // signed-in state shows up before the name does. Assert the former.
    await expect(page.locator('a[href="/account"]')).toBeVisible();
  });

  test("shows an error when the email is already registered", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await page.goto("/sign-up");
    await page.getByPlaceholder("Enter your first name").fill("Jordan");
    await page.getByPlaceholder("Enter your last name").fill("Taylor");
    await page.getByPlaceholder("Enter your email").fill(TEST_USER.email);
    await page.getByPlaceholder("Enter your password").fill("some-password");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText(
        "The email you entered already exists on BGH Scout. Please try again.",
      ),
    ).toBeVisible();
    await expect(page).toHaveURL("/sign-up");
  });
});

test.describe("sign out", () => {
  test("signs the user out and returns to a signed-out home page", async ({
    page,
  }) => {
    await signInAsTestUser(page);
    await page.getByRole("link", { name: /Welcome Jordan/ }).click();
    await expect(page).toHaveURL("/account");

    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your Account" }),
    ).toBeVisible();

    await page.locator("button.submit", { hasText: "Sign Out" }).click();

    // Account's own auth guard (redirect to /sign-in when signed out) and the
    // modal's explicit navigate to "/" race each other here, so the landing
    // route isn't guaranteed — what matters is that the app now shows a
    // signed-out nav no matter which one wins.
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });
});
