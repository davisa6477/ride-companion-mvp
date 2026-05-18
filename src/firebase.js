import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ===== FIREBASE CLIENT CONFIG =====
// This config connects the passenger tablet and driver console to the same Firebase project.
// Firebase web config is client-side app configuration; access/security should be controlled
// through Firebase rules and future auth, not by hiding this object in the frontend.
const firebaseConfig = {
  apiKey: "AIzaSyDskU2jdEWKSs5gc-jPQ6JTGVAFtNOaJs8",
  authDomain: "ride-companion-mvp.firebaseapp.com",
  projectId: "ride-companion-mvp",
  storageBucket: "ride-companion-mvp.firebasestorage.app",
  messagingSenderId: "544816446844",
  appId: "1:544816446844:web:3f8ab2c264f24a0ec2b8f9",
};

// ===== FIREBASE APP INSTANCE =====
const app = initializeApp(firebaseConfig);

// ===== FIRESTORE DATABASE EXPORT =====
// Used by rideSessionService.js for passenger requests and language sync.
export const db = getFirestore(app);

// ===== FIREBASE AUTH EXPORT =====
// Used by Admin auth service for email/password admin login.
export const auth = getAuth(app);
