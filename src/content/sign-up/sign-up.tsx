"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useSetAtom } from "jotai";
import Link from "next/link";

const SignUp = () => {
  initFirebase();
  const auth = getAuth();
  const setUser = useSetAtom(userAtom);

  const handleCreate = async () => {
    const email = "ty@heiprodigital.com";
    const password = "password";

    try {
      const userCredential = await createUserWithEmailAndPassword(
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

      trackError("Create Account", {
        code: errorCode,
        message: errorMessage,
        email,
      });
    }
  };

  return (
    <div>
      Please provide us with any feedback. Your feedback will help make our
      product stronger.
      <div>First Name</div>
      <div>Last Name</div>
      <div>Email</div>
      <div>Password</div>
      <button onClick={handleCreate}>Create Account</button>
      Already have an account. <Link href="/sign-in">Sign In</Link>
    </div>
  );
};

export default SignUp;
