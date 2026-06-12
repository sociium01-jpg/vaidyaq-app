import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

let app = null;
let auth = null;
let db = null;
let isConfigured = false;
let configError = null;

try {
  // Only initialize if the key is not the default placeholder
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = true;
  } else {
    configError = "Firebase environment variables are using default placeholder values.";
  }
} catch (err) {
  configError = err.message;
  console.warn("Firebase initialization skipped or failed:", err);
}

export { app, auth, db, isConfigured, configError, firebaseConfig };
export default app;
