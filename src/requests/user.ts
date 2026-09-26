import { User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface UserProfilePayload {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
}

const toProfilePayload = (user: User): UserProfilePayload => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  phoneNumber: user.phoneNumber,
  photoURL: user.photoURL,
  providerId: user.providerId,
});

/**
 * Registers a freshly created Firebase account with the BGH Scout API, which
 * owns the user profile store. `idToken` authenticates the caller as the
 * user being created — the API must verify it server-side rather than
 * trusting the `uid` in the body.
 */
export const createUser = async (user: User, idToken: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot create user.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(toProfilePayload(user)),
  });

  if (!res.ok) {
    throw new Error(`Create user API responded with ${res.status}`);
  }
};

/**
 * Syncs profile changes to the BGH Scout API after they've already been
 * applied in Firebase. `idToken` must belong to `user.uid` — the API rejects
 * a token/uid mismatch rather than trusting the body.
 */
export const updateUser = async (user: User, idToken: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot update user.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/users/${user.uid}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(toProfilePayload(user)),
  });

  if (!res.ok) {
    throw new Error(`Update user API responded with ${res.status}`);
  }
};
