// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Fallback config in case environment variables are missing
const fallbackConfig = {
  apiKey: "AIzaSyAVOD1MPuaTgFyYLOzRGuOV3qBLAwSJ0-M",
  authDomain: "ailawyer-8f713.firebaseapp.com",
  projectId: "ailawyer-8f713",
  storageBucket: "ailawyer-8f713.firebasestorage.app",
  messagingSenderId: "703816458018",
  appId: "1:703816458018:web:b41fd379f407be46a00f7b",
};

// Your web app's Firebase configuration using environment variables with fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
};

// Log Firebase initialization for debugging
if (typeof window !== "undefined") {
  console.log("Firebase initializing with config:", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "API_KEY_SET" : "API_KEY_MISSING",
    appId: firebaseConfig.appId ? "APP_ID_SET" : "APP_ID_MISSING",
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
