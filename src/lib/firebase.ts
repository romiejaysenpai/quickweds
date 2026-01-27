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

const isServer = typeof window === 'undefined';
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

// Initialize Firebase
// We use a fallback key to prevent initializeApp from throwing if the key is missing (e.g. during build or misconfiguration)
// This allows the app to at least boot and show the UI.
const app = getApps().length === 0
    ? initializeApp(
        isConfigValid
            ? firebaseConfig
            : { ...firebaseConfig, apiKey: isServer ? "AIza-Build-Time-Only" : "AIza-Missing-Key-Check-Console" }
    )
    : getApp();

if (!isConfigValid && !isServer) {
    console.error("❌ Firebase API Key is missing! Client-side authentication will not work. Check your Vercel Environment Variables (NEXT_PUBLIC_FIREBASE_API_KEY).");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const APP_COLLECTIONS = {
    WEDDINGS: 'quickweds_weddings',
    RSVPS: 'quickweds_rsvps'
};

export default app;

