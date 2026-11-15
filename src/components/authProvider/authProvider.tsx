"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { userAtom } from "@/caches/UserAtom";
import { subscriptionStatusAtom } from "@/caches/SubscriptionAtom";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  clearStoredUser,
  readStoredUser,
  writeStoredUser,
} from "@/functions/userState";
import {
  clearStoredSubscriptionStatus,
  readStoredSubscriptionStatus,
  writeStoredSubscriptionStatus,
} from "@/functions/subscriptionState";
import { getUser } from "@/requests/user";
import { trackError } from "@/functions/mixpanel";
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
  const setSubscriptionStatus = useSetAtom(subscriptionStatusAtom);

  useEffect(() => {
    setUser(readStoredUser());
    // Same reasoning as readStoredUser above — a fresh page load remounts
    // this component, and GET /v1/users/:uid takes a moment. Without seeding
    // from cache, hasActiveAccess() would see the atom's null default and
    // treat an already-subscribed user as blocked for that whole window.
    setSubscriptionStatus(readStoredSubscriptionStatus());

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      if (!fbUser) {
        clearStoredUser();
        clearStoredSubscriptionStatus();
        setUser(null);
        setSubscriptionStatus(null);
        return;
      }

      const user = toUser(fbUser);
      writeStoredUser(user);
      setUser(user);

      // Best-effort — a failed/slow fetch just leaves subscriptionStatusAtom
      // at whatever the cache seeded above (or null), which hasActiveAccess()
      // treats as "no access" (fail closed) rather than block sign-in on it.
      fbUser
        .getIdToken()
        .then((idToken) => getUser(user.uid, idToken))
        .then((profile) => {
          writeStoredSubscriptionStatus(profile.subscriptionStatus);
          setSubscriptionStatus(profile.subscriptionStatus);
        })
        .catch((err) => {
          trackError(user, "Load Subscription Status", {
            message: (err as { message?: string }).message ?? "",
          });
        });
    });

    return () => unsubscribe();
  }, [setUser, setSubscriptionStatus]);

  return null;
};

export default AuthProvider;
