"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useSetAtom } from "jotai";
import Link from "next/link";

const SignIn = () => {
  initFirebase();
  const auth = getAuth();
  const setUser = useSetAtom(userAtom);

  const handleSignIn = async () => {
    const email = "ty@heiprodigital.com";
    const password = "password";

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
  return (
    <div>
      <div>Email</div>
      <div>Password</div>
      <button onClick={handleSignIn}>Sign In</button>
      Don't have an account. <Link href="/sign-up">Sign Up</Link>
    </div>
  );
};

export default SignIn;
