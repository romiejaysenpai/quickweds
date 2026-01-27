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
const app = getApps().length === 0
    ? initializeApp(
        isConfigValid
            ? firebaseConfig
            : (isServer
                ? { ...firebaseConfig, apiKey: "AIza-Build-Time-Only" }
                : firebaseConfig)
    )
    : getApp();

if (!isConfigValid && !isServer) {
    console.error("❌ Firebase API Key is missing! Check your Vercel/Local environment variables.");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const APP_COLLECTIONS = {
    WEDDINGS: 'quickweds_weddings',
    RSVPS: 'quickweds_rsvps'
};

export default app;

