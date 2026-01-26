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
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (serviceAccountVar) {
        // Method 1: All-in-one JSON (Easiest & Safest)
        try {
            // Clean common Vercel/Copy-Paste issues
            const cleanedJson = serviceAccountVar
                .trim()
                .replace(/^['"]|['"]$/g, ''); // Remove accidental start/end quotes

            const serviceAccount = JSON.parse(cleanedJson);
            initializeApp({
                credential: cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`
            });
        } catch (e) {
            console.error("Critical: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Check if the variable contains a complete JSON object.", e);
        }
    } else if (clientEmail && privateKey) {
        // Method 2: Individual variables
        const cleanedKey = privateKey
            .trim()
            .replace(/^['"]|['"]$/g, '')
            .replace(/\\n/g, '\n');

        initializeApp({
            credential: cert({
                projectId: firebaseAdminConfig.projectId,
                clientEmail,
                privateKey: cleanedKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${firebaseAdminConfig.projectId}.firebasestorage.app`
        });
    } else {
        // Fallback for local dev
        initializeApp({
            projectId: firebaseAdminConfig.projectId,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${firebaseAdminConfig.projectId}.firebasestorage.app`
        });
    }
}

export const db = getFirestore();
export const storage = getStorage();

// We'll use a specific root collection for this app to avoid mixing with 'call2proposal'
export const APP_COLLECTIONS = {
    WEDDINGS: 'quickweds_weddings',
    RSVPS: 'quickweds_rsvps'
};
