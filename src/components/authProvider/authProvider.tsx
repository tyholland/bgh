"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { userAtom } from "@/caches/UserAtom";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  clearStoredUser,
  readStoredUser,
  writeStoredUser,
} from "@/functions/userState";
import { User } from "@/types";

const toUser = (fbUser: FirebaseUser): User => {
  const provider = fbUser.providerData[0];

  return {
    uid: fbUser.uid,
    email: fbUser.email ?? provider?.email ?? null,
    displayName: fbUser.displayName ?? provider?.displayName ?? null,
    phoneNumber: fbUser.phoneNumber ?? provider?.phoneNumber ?? null,
    photoURL: fbUser.photoURL ?? provider?.photoURL ?? null,
    providerId: provider?.providerId ?? "firebase",
  };
};

/**
 * Single source of truth for auth state. Seeds from the cached session for a
 * fast first paint, then defers to Firebase — which also clears a stale cache
 * when the real session is gone.
 */
const AuthProvider = () => {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    setUser(readStoredUser());

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      if (!fbUser) {
        clearStoredUser();
        setUser(null);
        return;
      }

      const user = toUser(fbUser);
      writeStoredUser(user);
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  return null;
};

export default AuthProvider;
