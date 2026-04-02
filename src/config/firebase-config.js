import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase project credentials here
// Go to Firebase Console > Project Settings to find these values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "expense-tracker-3ee56.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "expense-tracker-3ee56",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "expense-tracker-3ee56.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
