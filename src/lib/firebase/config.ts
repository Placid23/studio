import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBz1q7xDvA2LwMonS6r_yGBQO5oNWM_iiY",
  authDomain: "novastream-qkr40.firebaseapp.com",
  projectId: "novastream-qkr40",
  storageBucket: "novastream-qkr40.firebasestorage.app",
  messagingSenderId: "962930465000",
  appId: "1:962930465000:web:5e629a6740b4e8fcf9915d"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
