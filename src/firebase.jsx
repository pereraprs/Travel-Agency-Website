// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfXedHMmh4QukPdcBYuNksfN5S2A1b-dc",
  authDomain: "travel-web-1b493.firebaseapp.com",
  projectId: "travel-web-1b493",
  storageBucket: "travel-web-1b493.firebasestorage.app",
  messagingSenderId: "188146394024",
  appId: "1:188146394024:web:71e80917000c5c150bb39d",
  measurementId: "G-Y9GFTWEPZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);


const googleProvider = new GoogleAuthProvider();

export { db, auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, googleProvider, collection, addDoc, query, orderBy, onSnapshot };