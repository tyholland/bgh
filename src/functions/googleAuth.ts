import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/functions/firebase";
import { createUser } from "@/requests/user";
import { trackError } from "@/functions/mixpanel";

export interface GoogleSignInResult {
  user: FirebaseUser;
  isNewUser: boolean;
}

/**
 * Shared by the sign-in and sign-up pages — Google's OAuth popup doesn't
 * distinguish the two the way email/password does (separate endpoints),
 * Firebase does via `additionalUserInfo.isNewUser`. So this is the one place
 * that decides whether to also register the BGH Scout API profile, mirroring
 * what src/content/sign-up/sign-up.tsx's handleCreate does for a fresh
 * email/password account.
 */
export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  const result = await signInWithPopup(
    getFirebaseAuth(),
    new GoogleAuthProvider(),
  );
  const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;

  if (isNewUser) {
    try {
      const idToken = await result.user.getIdToken();
      await createUser(
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          phoneNumber: result.user.phoneNumber,
          photoURL: result.user.photoURL,
          providerId: result.user.providerData[0]?.providerId ?? "google.com",
        },
        idToken,
      );
    } catch (error) {
      // Non-critical, same reasoning as sign-up.tsx — the Firebase account
      // already exists, so don't block sign-in just because the API profile
      // sync failed.
      trackError(null, "Create User Profile", {
        code: (error as { code?: string }).code ?? "unknown",
        message: (error as { message?: string }).message ?? "",
        email: result.user.email,
      });
    }
  }

  return { user: result.user, isNewUser };
};
