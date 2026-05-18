import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase.js";

// ===== FIRESTORE GUESTBOOK SERVICE =====
// Guestbook entries now live as per-entry Firestore documents.
// This is safer than storing all entries in one array document because future
// rules can allow passengers to create pending entries without letting them
// overwrite or approve other entries.

const GUESTBOOK_ENTRIES_COLLECTION = "guestbookEntries";

// Legacy Phase 11 container. Kept only for migration/fallback reads.
const LEGACY_GUESTBOOK_COLLECTION = "guestbook";
const LEGACY_ENTRIES_DOC_ID = "entries";

export function getGuestbookEntriesCollectionRef() {
  return collection(db, GUESTBOOK_ENTRIES_COLLECTION);
}

export function getGuestbookEntryRef(entryId) {
  return doc(db, GUESTBOOK_ENTRIES_COLLECTION, String(entryId));
}

function getLegacyGuestbookEntriesRef() {
  return doc(db, LEGACY_GUESTBOOK_COLLECTION, LEGACY_ENTRIES_DOC_ID);
}

function normalizeGuestbookEntry(entry = {}) {
  const id = String(entry.id || Date.now());

  return {
    id,
    name: String(entry.name || "").trim(),
    city: String(entry.city || "").trim(),
    message: String(entry.message || "").trim(),
    approved: Boolean(entry.approved),
    createdAtMs:
      typeof entry.createdAtMs === "number"
        ? entry.createdAtMs
        : Number(entry.id) || Date.now(),
  };
}

function sortGuestbookEntries(entries = []) {
  return [...entries].sort((a, b) => {
    const aTime = a.createdAtMs || Number(a.id) || 0;
    const bTime = b.createdAtMs || Number(b.id) || 0;
    return bTime - aTime;
  });
}

// ===== GUESTBOOK READ =====
export async function getSharedGuestbookEntries() {
  const entriesSnapshot = await getDocs(
    query(getGuestbookEntriesCollectionRef(), orderBy("createdAtMs", "desc"))
  );

  const entries = entriesSnapshot.docs.map((entryDoc) => ({
    id: entryDoc.id,
    ...entryDoc.data(),
  }));

  if (entries.length > 0) {
    return sortGuestbookEntries(entries);
  }

  // Legacy fallback: if Phase 11 data exists, read it so no entries are lost.
  const legacySnapshot = await getDoc(getLegacyGuestbookEntriesRef());

  if (!legacySnapshot.exists()) {
    return null;
  }

  return sortGuestbookEntries(legacySnapshot.data().entries || []);
}

// ===== GUESTBOOK WRITE =====
// Current App wiring still saves the full entries array. This function writes
// each entry as its own document and removes documents that are no longer in
// the array, which preserves existing Admin approve/delete behavior.
export async function saveSharedGuestbookEntries(entries = []) {
  const normalizedEntries = sortGuestbookEntries(
    entries.map((entry) => normalizeGuestbookEntry(entry))
  );

  const currentSnapshot = await getDocs(getGuestbookEntriesCollectionRef());
  const nextIds = new Set(normalizedEntries.map((entry) => String(entry.id)));

  const batch = writeBatch(db);

  normalizedEntries.forEach((entry) => {
    batch.set(
      getGuestbookEntryRef(entry.id),
      {
        ...entry,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  currentSnapshot.docs.forEach((entryDoc) => {
    if (!nextIds.has(entryDoc.id)) {
      batch.delete(entryDoc.ref);
    }
  });

  await batch.commit();
}

// ===== GUESTBOOK LISTENER =====
export function listenToSharedGuestbookEntries(callback, onError) {
  const entriesQuery = query(
    getGuestbookEntriesCollectionRef(),
    orderBy("createdAtMs", "desc")
  );

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((entryDoc) => ({
        id: entryDoc.id,
        ...entryDoc.data(),
      }));

      callback(sortGuestbookEntries(entries));
    },
    (error) => {
      console.error("Failed to listen to shared guestbook entries:", error);
      if (onError) onError(error);
    }
  );
}

// ===== SINGLE ENTRY HELPERS =====
// Not wired into the UI yet, but useful for future security-rule-friendly
// passenger submit and admin moderation flows.
export async function createSharedGuestbookEntry(entry) {
  const normalizedEntry = normalizeGuestbookEntry({
    ...entry,
    id: entry.id || Date.now(),
    approved: false,
  });

  await setDoc(getGuestbookEntryRef(normalizedEntry.id), {
    ...normalizedEntry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return normalizedEntry;
}

export async function updateSharedGuestbookEntry(entryId, patch) {
  return setDoc(
    getGuestbookEntryRef(entryId),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteSharedGuestbookEntry(entryId) {
  return deleteDoc(getGuestbookEntryRef(entryId));
}
