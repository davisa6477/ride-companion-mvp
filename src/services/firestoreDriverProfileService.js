import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { defaultDriverProfile } from "../config/defaultContent.js";

// ===== FIRESTORE DRIVER PROFILE SERVICE =====
// Driver profile now has its own Firestore document instead of being bundled
// into adminConfig/content. This makes profile updates independent and easier
// to secure later.

const ADMIN_CONFIG_COLLECTION = "adminConfig";
const PROFILE_DOC_ID = "profile";

export function getDriverProfileRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, PROFILE_DOC_ID);
}

function normalizeDriverProfile(profile = {}) {
  return {
    ...defaultDriverProfile,
    ...profile,
    bioTranslations: {
      ...(defaultDriverProfile.bioTranslations || {}),
      ...(profile.bioTranslations || {}),
    },
    localTipTranslations: {
      ...(defaultDriverProfile.localTipTranslations || {}),
      ...(profile.localTipTranslations || {}),
    },
  };
}

export async function getSharedDriverProfile() {
  const snapshot = await getDoc(getDriverProfileRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeDriverProfile(snapshot.data());
}

export async function saveSharedDriverProfile(profile) {
  return setDoc(
    getDriverProfileRef(),
    {
      ...normalizeDriverProfile(profile),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedDriverProfile(callback, onError) {
  return onSnapshot(
    getDriverProfileRef(),
    (snapshot) => {
      callback(snapshot.exists() ? normalizeDriverProfile(snapshot.data()) : null);
    },
    (error) => {
      console.error("Failed to listen to shared driver profile:", error);
      if (onError) onError(error);
    }
  );
}
