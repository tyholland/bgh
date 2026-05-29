"use client";

import { userAtom } from "@/caches/UserAtom";
import { initFirebase } from "@/functions/firebase";
import { trackError, trackIdentity } from "@/functions/mixpanel";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useSetAtom } from "jotai";

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
      <button onClick={handleSignIn}>Create Account</button>
    </div>
  );
};

export default SignIn;
