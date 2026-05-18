import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { defaultRequestCategories } from "../data/defaultRequests.js";

// ===== FIRESTORE REQUEST CATEGORIES SERVICE =====
// Request categories now live in their own Firestore document instead of being
// bundled into adminConfig/content.

const ADMIN_CONFIG_COLLECTION = "adminConfig";
const REQUEST_CATEGORIES_DOC_ID = "requestCategories";

export function getRequestCategoriesRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, REQUEST_CATEGORIES_DOC_ID);
}

function normalizeRequestCategories(requestCategories = {}) {
  return {
    ...defaultRequestCategories,
    ...(requestCategories || {}),
  };
}

export async function getSharedRequestCategories() {
  const snapshot = await getDoc(getRequestCategoriesRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeRequestCategories(snapshot.data().requestCategories || {});
}

export async function saveSharedRequestCategories(requestCategories = {}) {
  return setDoc(
    getRequestCategoriesRef(),
    {
      requestCategories: normalizeRequestCategories(requestCategories),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedRequestCategories(callback, onError) {
  return onSnapshot(
    getRequestCategoriesRef(),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? normalizeRequestCategories(snapshot.data().requestCategories || {})
          : null
      );
    },
    (error) => {
      console.error("Failed to listen to shared request categories:", error);
      if (onError) onError(error);
    }
  );
}
