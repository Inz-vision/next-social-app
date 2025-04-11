// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "next-social-app-inz.firebaseapp.com",
  projectId: "next-social-app-inz",
  storageBucket: "next-social-app-inz.firebasestorage.app",
  messagingSenderId: "332328687200",
  appId: "1:332328687200:web:8b4f3dcd341728277c1505"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);