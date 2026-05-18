import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";

// ===== FIRESTORE GUESTBOOK SERVICE =====
// Guestbook entries now live in their own Firestore container instead of being
// bundled into adminConfig/content. This makes future security rules cleaner.

const GUESTBOOK_COLLECTION = "guestbook";
const ENTRIES_DOC_ID = "entries";

export function getGuestbookEntriesRef() {
  return doc(db, GUESTBOOK_COLLECTION, ENTRIES_DOC_ID);
}

export async function getSharedGuestbookEntries() {
  const snapshot = await getDoc(getGuestbookEntriesRef());

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data().entries || [];
}

export async function saveSharedGuestbookEntries(entries = []) {
  return setDoc(
    getGuestbookEntriesRef(),
    {
      entries,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedGuestbookEntries(callback, onError) {
  return onSnapshot(
    getGuestbookEntriesRef(),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data().entries || [] : null);
    },
    (error) => {
      console.error("Failed to listen to shared guestbook entries:", error);
      if (onError) onError(error);
    }
  );
}
