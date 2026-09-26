// Firebase web SDK setup. The NEXT_PUBLIC_* values here are the public web
// config (not secrets) — access is controlled by Firebase Auth / security rules.
import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_ID,
};

export const initFirebase = () => {
  if (getApps().length) return;
  initializeApp(firebaseConfig);
};

// Always use this to reach Firebase Auth — it guarantees the app is initialized.
export const getFirebaseAuth = (): Auth => {
  initFirebase();
  return getAuth();
};
