import admin from 'firebase-admin';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'novastream-qkr40';
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'novastream-qkr40.firebasestorage.app';

// Robust initialization for server environments
if (!admin.apps.length) {
  try {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: storageBucket,
      });
    } else {
      // Automatic Discovery for Google Cloud environments
      admin.initializeApp({
        projectId: projectId,
        storageBucket: storageBucket,
      });
    }
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
