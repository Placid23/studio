import admin from 'firebase-admin';

// Use the project ID from the provided config as a fallback
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aetherassist-naysg';
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aetherassist-naysg.firebasestorage.app';

if (!admin.apps.length) {
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
    // Fallback: Initialize with just project ID and storage bucket.
    // This allows the SDK to pick up credentials from the environment (ADC) 
    // if running on Google Cloud / Firebase App Hosting.
    admin.initializeApp({
      projectId: projectId,
      storageBucket: storageBucket,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
