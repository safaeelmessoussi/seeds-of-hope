import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "AIzaSyDyCxXnuHHA2XDT6V_TMmVyGH7OclfPFVQ",
    authDomain: "seeds-of-hope-51cb7.firebaseapp.com",
    projectId: "seeds-of-hope-51cb7",
    storageBucket: "seeds-of-hope-51cb7.firebasestorage.app",
    messagingSenderId: "681366711410",
    appId: "1:681366711410:web:d19e12133f0ec25c1ca6eb",
    measurementId: "G-DP6GCK3N11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
auth.languageCode = 'ar'; // Force Arabic for auth emails
export const storage = getStorage(app);
