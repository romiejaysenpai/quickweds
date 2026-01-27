import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "call2proposal-generator",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- Safety Guard for Build Time ---
// During Next.js build time (prerendering), environment variables might be missing.
// Firebase SDK throws 'auth/invalid-api-key' if apiKey is undefined.
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

if (!isConfigValid && typeof window === 'undefined') {
    console.warn("⚠️ Firebase API Key is missing. This is normal during build time if not provided, but will cause issues at runtime if not set in Vercel.");
}

// Initialize Firebase
// We provide a dummy key during build time if missing to prevent 'invalid-api-key' from crashing the build
const app = getApps().length === 0
    ? initializeApp(isConfigValid ? firebaseConfig : { ...firebaseConfig, apiKey: "AIza-Placeholder-For-Build" })
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const APP_COLLECTIONS = {
    WEDDINGS: 'quickweds_weddings',
    RSVPS: 'quickweds_rsvps'
};

export default app;

