import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDVnc5GUNBKn2_a15D1CDKtWhJl4XmxYWk",
  authDomain: "aetherassist-naysg.firebaseapp.com",
  projectId: "aetherassist-naysg",
  storageBucket: "aetherassist-naysg.firebasestorage.app",
  messagingSenderId: "1070438516617",
  appId: "1:1070438516617:web:de026dac934f2332310358"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
