"use client";

import { jobAtom } from "@/caches/JobsAtom";
import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import * as S from "./sign-up.style";

const SignUp = () => {
  initFirebase();
  const auth = getAuth();
  const [user, setUser] = useAtom(userAtom);
  const jobData = useAtomValue(jobAtom);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");

  const handleCreate = async () => {
    const email = userEmail;
    const password = userPassword;

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
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Create Account", {
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
  };

  if (!!user && typeof window !== "undefined") {
    window.location.href = "/";
  }

  return (
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
      <S.Button onClick={handleCreate}>Create Account</S.Button>
      <S.SignIn>
        Already have an account. <Link href="/sign-in">Sign In</Link>
      </S.SignIn>
    </S.Wrapper>
  );
};

export default SignUp;
