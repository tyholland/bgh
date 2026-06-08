"use client";

import { jobAtom } from "@/caches/JobsAtom";
import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import * as S from "./sign-in.style";

const SignIn = () => {
  initFirebase();
  const auth = getAuth();
  const [user, setUser] = useAtom(userAtom);
  const jobData = useAtomValue(jobAtom);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");

  const handleSignIn = async () => {
    const email = userEmail;
    const password = userPassword;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const { user } = userCredential;

      trackIdentity(user.uid, user.email);
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
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Sign In", {
        code: errorCode,
        message: errorMessage,
        email,
      });
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
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
  };

  if (!!user) {
    window.location.href = "/";
  }

  return (
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
      <S.Button onClick={handleSignIn}>Sign In</S.Button>
      <S.SignUp>
        Don't have an account. <Link href="/sign-up">Sign Up</Link>
      </S.SignUp>
    </S.Wrapper>
  );
};

export default SignIn;
