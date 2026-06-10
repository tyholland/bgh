"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useAtom } from "jotai";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import * as S from "./sign-up.style";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import CronJob from "@/components/cronJob/cronJob";

const SignUp = () => {
  initFirebase();
  const auth = getAuth();
  const [user, setUser] = useAtom(userAtom);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleCreate = async () => {
    const email = userEmail;
    const password = userPassword;
    setIsDisabled(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const { user } = userCredential;

      try {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });
      } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        trackError("Update Account", {
          code: errorCode,
          message: errorMessage,
          email,
          displayName: `${firstName} ${lastName}`,
        });
      }

      trackIdentity(user.uid, user.email);
      window.localStorage.setItem(
        "bgh.user",
        JSON.stringify({
          ...user.providerData[0],
          uid: user.uid,
          displayName: `${firstName} ${lastName}`,
        }),
      );
      setUser({
        ...user.providerData[0],
        uid: user.uid,
        displayName: `${firstName} ${lastName}`,
      });
      window.location.href = "/";
    } catch (error: any) {
      setIsDisabled(false);
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Create Account", {
        code: errorCode,
        message: errorMessage,
        email,
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
      case "firstName":
        setFirstName(val);
        break;
      case "lastName":
        setLastName(val);
        break;
      case "email":
        setUserEmail(val);
        break;
      case "password":
        setUserPassword(val);
        break;
      default:
        setFirstName(val);
        break;
    }

    setIsDisabled(!userEmail || !userPassword || !firstName || !lastName);
  };

  if (!!user && typeof window !== "undefined") {
    window.location.href = "/";
  }

  return (
    <>
      <CronJob />
      <S.Wrapper>
        <div>
          <S.Input
            type="text"
            name="firstName"
            onChange={(e) => handleInputChange(e, "firstName")}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <S.Input
            type="text"
            name="lastName"
            onChange={(e) => handleInputChange(e, "lastName")}
            placeholder="Enter your last name"
            required
          />
        </div>
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
        <S.Button onClick={handleCreate} disabled={isDisabled}>
          Create Account
        </S.Button>
        <S.SignIn>
          Already have an account. <Link href="/sign-in">Sign In</Link>
        </S.SignIn>
      </S.Wrapper>
    </>
  );
};

export default SignUp;
