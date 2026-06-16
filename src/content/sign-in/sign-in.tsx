"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import {
  trackError,
  trackEvent,
  trackIdentity,
  trackPage,
} from "@/functions/mixpanel";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAtom } from "jotai";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./sign-in.style";
import ErrorBlock from "@/components/errorBlock/errorBlock";

const SignIn = () => {
  initFirebase();
  const auth = getAuth();
  const [user, setUser] = useAtom(userAtom);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleSignIn = async () => {
    const email = userEmail;
    const password = userPassword;
    setIsDisabled(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const { user } = userCredential;

      trackIdentity(user.uid, email, user.displayName || "");

      setTimeout(() => {
        trackEvent("Sign In", {
          type: "sign in",
          email: email,
        });

        window.localStorage.setItem(
          "bgh.user",
          JSON.stringify({
            ...user.providerData[0],
            uid: user.uid,
          }),
        );

        setUser({
          ...user.providerData[0],
          uid: user.uid,
        });
      }, 2000);

      setTimeout(() => {
        window.location.href = "/";
      }, 7000);
    } catch (error: any) {
      setIsDisabled(false);
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Sign In", {
        code: errorCode,
        message: errorMessage,
        email: email,
      });

      setErrorMsg(errorCode);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    setErrorMsg(null);
    const val = e.target.value;

    switch (type) {
      case "email":
        setUserEmail(val);
        break;
      case "password":
        setUserPassword(val);
        break;
      default:
        setUserEmail(val);
        break;
    }

    setIsDisabled(!userEmail || !userPassword);
  };

  useEffect(() => {
    trackPage("Sign In", window.location.href);
  }, []);

  if (!!user && typeof window !== "undefined") {
    window.location.href = "/";
  }

  return (
    <>
      <S.Wrapper>
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
        <S.Button onClick={handleSignIn} disabled={isDisabled}>
          Sign In
        </S.Button>
        <S.SignUp>
          Don't have an account. <Link href="/sign-up">Sign Up</Link>
        </S.SignUp>
      </S.Wrapper>
    </>
  );
};

export default SignIn;
