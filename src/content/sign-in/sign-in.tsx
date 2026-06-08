"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

const SignIn = () => {
  initFirebase();
  const navigate = useRouter();
  const auth = getAuth();
  const [user, setUser] = useAtom(userAtom);
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
      setUser({
        ...user.providerData[0],
        uid: user.uid,
      });
      window.localStorage.setItem(
        "bgh.user",
        JSON.stringify({
          ...user.providerData[0],
          uid: user.uid,
        }),
      );
      window.location.href = "/";
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
    navigate.push("/home");
  }

  return (
    <div>
      <div>
        <input
          type="email"
          name="email"
          onChange={(e) => handleInputChange(e, "email")}
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          onChange={(e) => handleInputChange(e, "password")}
          placeholder="Enter your password"
          required
        />
      </div>
      <button onClick={handleSignIn}>Sign In</button>
      Don't have an account. <Link href="/sign-up">Sign Up</Link>
    </div>
  );
};

export default SignIn;
