import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "YOUR_AUTH_DOMAIN",
    // projectId: "YOUR_PROJECT_ID",
    // storageBucket: "YOUR_STORAGE_BUCKET",
    // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    // appId: "YOUR_APP_ID"
    apiKey: "AIzaSyDyCxXnuHHA2XDT6V_TMmVyGH7OclfPFVQ",
    authDomain: "seeds-of-hope-51cb7.firebaseapp.com",
    projectId: "seeds-of-hope-51cb7",
    storageBucket: "seeds-of-hope-51cb7.firebasestorage.app",
    messagingSenderId: "681366711410",
    appId: "1:681366711410:web:d19e12133f0ec25c1ca6eb",
    measurementId: "G-DP6GCK3N11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
