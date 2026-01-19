import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// In a real production environment, you would use service account JSON or environment variables.
// For now, we will initialize with the Project ID and assume the environment has default credentials
// or we will use a placeholder structure for the user to fill.

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "call2proposal-generator",
};

if (!getApps().length) {
    initializeApp({
        projectId: firebaseAdminConfig.projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${firebaseAdminConfig.projectId}.firebasestorage.app`
    });
}

export const db = getFirestore();
export const storage = getStorage();

// We'll use a specific root collection for this app to avoid mixing with 'call2proposal'
export const APP_COLLECTIONS = {
    WEDDINGS: 'quickweds_weddings',
    RSVPS: 'quickweds_rsvps'
};
