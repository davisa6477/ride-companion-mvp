import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase.js";

// ===== FIREBASE ADMIN AUTH SERVICE =====
// Phase 17A adds Firebase Auth as an Admin identity boundary.
// Firestore rules are not tightened in this phase, so the existing local PIN
// remains as a secondary/beta gate until Phase 17B.

export function listenToFirebaseAdminAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

export async function signInFirebaseAdmin(email, password) {
  const credential = await signInWithEmailAndPassword(
    auth,
    String(email || "").trim(),
    password
  );

  return credential.user;
}

export async function signOutFirebaseAdmin() {
  return signOut(auth);
}

export function getFirebaseAdminEmail(user) {
  return user?.email || "";
}
