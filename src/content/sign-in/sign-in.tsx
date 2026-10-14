"use client";

import { userAtom } from "@/caches/UserAtom";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  trackError,
  trackEvent,
  trackIdentity,
  trackPage,
} from "@/functions/mixpanel";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./sign-in.style";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import ResetPwd from "@/components/reset-pwd-modal/reset-pwd-modal";
import { getSafeRedirect } from "@/functions/safeRedirect";
import { signInWithGoogle } from "@/functions/googleAuth";
import GoogleIcon from "@/svg/GoogleIcon";

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const user = useAtomValue(userAtom);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    trackPage(user, "Sign In", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { user: fbUser } = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        userEmail,
        userPassword,
      );

      trackIdentity(fbUser.uid, userEmail, fbUser.displayName || "");
      trackEvent(null, "Sign In", { type: "sign in", email: userEmail });

      router.replace(redirectTo);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "unknown";
      const message = (error as { message?: string }).message ?? "";

      trackError(user, "Sign In", { code, message, email: userEmail });
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
      trackError(user, "Sign In", { code, message, type: "google" });
      setErrorMsg(code);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "email" | "password",
  ) => {
    setErrorMsg(null);
    if (type === "password") {
      setUserPassword(e.target.value);
    } else {
      setUserEmail(e.target.value);
    }
  };

  const isDisabled = isSubmitting || !userEmail || !userPassword;

  return (
    <>
      <S.Wrapper>
        <S.VisuallyHidden>Sign In | BGH Scout</S.VisuallyHidden>
        <S.GoogleButton
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting}
        >
          <GoogleIcon />
          {isGoogleSubmitting ? "Signing In..." : "Continue with Google"}
        </S.GoogleButton>
        <S.Divider>
          <span>or</span>
        </S.Divider>
        <div>
          <S.Input
            type="email"
            name="email"
            onChange={(e) => handleInputChange(e, "email")}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <S.Input
            type="password"
            name="password"
            onChange={(e) => handleInputChange(e, "password")}
            placeholder="Enter your password"
            required
          />
        </div>
        {errorMsg && <ErrorBlock error={errorMsg} />}
        <S.Section>
          <S.Button onClick={handleSignIn} disabled={isDisabled}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </S.Button>
          <S.Button className="textBtn" onClick={() => setOpenModal(true)}>
            Forgot Password
          </S.Button>
        </S.Section>
        <S.SignUp>
          Don&apos;t have an account.{" "}
          <Link
            href={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
          >
            Sign Up
          </Link>
        </S.SignUp>
      </S.Wrapper>
      <ResetPwd openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default SignIn;
