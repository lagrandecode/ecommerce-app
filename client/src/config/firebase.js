// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDptokrqNhUPG1EVj1vZsf8otDmP4fX2Rk",
  authDomain: "ecommerce-app-4fbb9.firebaseapp.com",
  projectId: "ecommerce-app-4fbb9",
  storageBucket: "ecommerce-app-4fbb9.firebasestorage.app",
  messagingSenderId: "237693514854",
  appId: "1:237693514854:web:30aee7c1944e64d43069a7",
  measurementId: "G-NTB02B2WC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
export default app; 