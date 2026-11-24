import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAXlyCZxxqFdrS5QeWX2znXvh05yMl0ieM",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "careerpilot-ai-c091b.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "careerpilot-ai-c091b",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "careerpilot-ai-c091b.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "1085946712938",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:1085946712938:web:6b1675bcbeec677848cb13",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);
