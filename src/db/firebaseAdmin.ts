import "server-only";
import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ) as string,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
};

const adminApp: App = !getApps().length ? initializeApp(adminConfig) : getApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
