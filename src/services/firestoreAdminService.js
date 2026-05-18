import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";

// ===== FIRESTORE ADMIN CONTENT SERVICE HELPERS =====
// These helpers create the backend boundary for shared admin-managed content.
// Phase 9A only adds the helpers. App.jsx still uses localStorage-first behavior.
// Later phases will call these from adminContentService.js and appSettingsService.js.

const ADMIN_CONFIG_COLLECTION = "adminConfig";
const CONTENT_DOC_ID = "content";
const SETTINGS_DOC_ID = "settings";

// ===== FIRESTORE REFERENCES =====
export function getAdminContentRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, CONTENT_DOC_ID);
}

export function getAppSettingsRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, SETTINGS_DOC_ID);
}

// ===== ADMIN CONTENT READ/WRITE =====
// Content shape is expected to include:
// driverProfile, tipOptions, ads, entries, requestCategories, adminPin.
export async function getSharedAdminContent() {
  const snapshot = await getDoc(getAdminContentRef());
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveSharedAdminContent(content) {
  return setDoc(
    getAdminContentRef(),
    {
      ...content,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedAdminContent(callback, onError) {
  return onSnapshot(
    getAdminContentRef(),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error("Failed to listen to shared admin content:", error);
      if (onError) onError(error);
    }
  );
}


// ===== REDUCED CONTENT CLEANUP =====
// Phase 15 moved profile, ads, guestbook, tips, and request categories into
// their own containers. This helper keeps adminConfig/content from retaining
// stale legacy fields when viewed in Firebase Console.
export async function saveSharedAdminPinOnlyContent(adminPin) {
  return setDoc(
    getAdminContentRef(),
    {
      adminPin,
      // Remove legacy/containerized fields if they still exist from earlier phases.
      entries: deleteField(),
      ads: deleteField(),
      driverProfile: deleteField(),
      tipOptions: deleteField(),
      requestCategories: deleteField(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ===== APP SETTINGS READ/WRITE =====
// Settings shape is expected to include:
// defaultZipCode, defaultLocationLabel.
export async function getSharedAppSettings() {
  const snapshot = await getDoc(getAppSettingsRef());
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveSharedAppSettings(settings) {
  return setDoc(
    getAppSettingsRef(),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedAppSettings(callback, onError) {
  return onSnapshot(
    getAppSettingsRef(),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error("Failed to listen to shared app settings:", error);
      if (onError) onError(error);
    }
  );
}
