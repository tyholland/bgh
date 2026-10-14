"use client";

import { userAtom } from "@/caches/UserAtom";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  trackError,
  trackEvent,
  trackIdentity,
  trackPage,
} from "@/functions/mixpanel";
import { createUser } from "@/requests/user";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./sign-up.style";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import { getSafeRedirect } from "@/functions/safeRedirect";
import { signInWithGoogle } from "@/functions/googleAuth";
import GoogleIcon from "@/svg/GoogleIcon";

const SignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const user = useAtomValue(userAtom);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);

  useEffect(() => {
    trackPage(user, "Sign Up", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  const handleCreate = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const name = `${firstName} ${lastName}`.trim();

    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        userEmail,
        userPassword,
      );

      try {
        await updateProfile(fbUser, { displayName: name });
      } catch (error) {
        trackError(user, "Update Account", {
          code: (error as { code?: string }).code ?? "unknown",
          message: (error as { message?: string }).message ?? "",
          email: userEmail,
          displayName: name,
        });
      }

      try {
        const idToken = await fbUser.getIdToken();
        await createUser(
          {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: firstName,
            phoneNumber: fbUser.phoneNumber,
            photoURL: fbUser.photoURL,
            providerId: fbUser.providerData[0]?.providerId ?? "firebase",
          },
          idToken,
        );
      } catch (error) {
        trackError(user, "Create User Profile", {
          code: (error as { code?: string }).code ?? "unknown",
          message: (error as { message?: string }).message ?? "",
          email: userEmail,
        });
      }

      trackIdentity(fbUser.uid, userEmail, name);
      trackEvent(null, "Account Creation", {
        type: "new account",
        email: userEmail,
        name,
      });

      router.replace(redirectTo);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "unknown";
      const message = (error as { message?: string }).message ?? "";

      trackError(user, "Create Account", { code, message, email: userEmail });
      setErrorMsg(code);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setErrorMsg(null);

    try {
      const { user: fbUser, isNewUser } = await signInWithGoogle();

      trackIdentity(fbUser.uid, fbUser.email || "", fbUser.displayName || "");
      trackEvent(null, isNewUser ? "Account Creation" : "Sign In", {
        type: "google",
        email: fbUser.email || "",
      });

      router.replace(redirectTo);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "unknown";

      setIsGoogleSubmitting(false);

      // The user closing the popup or opening a second one isn't an error
      // worth surfacing — just let them try again.
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      const message = (error as { message?: string }).message ?? "";
      trackError(user, "Create Account", { code, message, type: "google" });
      setErrorMsg(code);
    }
  };

  const isDisabled =
    isSubmitting || !userEmail || !userPassword || !firstName || !lastName;

  return (
    <>
      <S.Wrapper>
        <S.VisuallyHidden>Sign Up | BGH Scout</S.VisuallyHidden>
        <S.GoogleButton
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting}
        >
          <GoogleIcon />
          {isGoogleSubmitting ? "Signing Up..." : "Continue with Google"}
        </S.GoogleButton>
        <S.Divider>
          <span>or</span>
        </S.Divider>
        <div>
          <S.Input
            type="text"
            name="firstName"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFirstName(e.target.value)
            }
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <S.Input
            type="text"
            name="lastName"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLastName(e.target.value)
            }
            placeholder="Enter your last name"
            required
          />
        </div>
        <div>
          <S.Input
            type="email"
            name="email"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUserEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <S.Input
            type="password"
            name="password"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUserPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
          />
        </div>
        {errorMsg && <ErrorBlock error={errorMsg} />}
        <S.Button onClick={handleCreate} disabled={isDisabled}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </S.Button>
        <S.SignIn>
          Already have an account.{" "}
          <Link
            href={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
          >
            Sign In
          </Link>
        </S.SignIn>
      </S.Wrapper>
    </>
  );
};

export default SignUp;
