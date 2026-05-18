import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";

// ===== FIRESTORE TIP OPTIONS SERVICE =====
// Direct tip options now live in their own Firestore document instead of being
// bundled into adminConfig/content.

const ADMIN_CONFIG_COLLECTION = "adminConfig";
const TIP_OPTIONS_DOC_ID = "tipOptions";

export function getTipOptionsRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, TIP_OPTIONS_DOC_ID);
}

function normalizeTipOptions(tipOptions = []) {
  if (!Array.isArray(tipOptions)) return [];

  return tipOptions.map((option) => ({
    id: String(option.id || Date.now()),
    platform: String(option.platform || "").trim(),
    label: String(option.label || "").trim(),
    url: String(option.url || "").trim(),
  }));
}

export async function getSharedTipOptions() {
  const snapshot = await getDoc(getTipOptionsRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeTipOptions(snapshot.data().tipOptions || []);
}

export async function saveSharedTipOptions(tipOptions = []) {
  return setDoc(
    getTipOptionsRef(),
    {
      tipOptions: normalizeTipOptions(tipOptions),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedTipOptions(callback, onError) {
  return onSnapshot(
    getTipOptionsRef(),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? normalizeTipOptions(snapshot.data().tipOptions || [])
          : null
      );
    },
    (error) => {
      console.error("Failed to listen to shared tip options:", error);
      if (onError) onError(error);
    }
  );
}
