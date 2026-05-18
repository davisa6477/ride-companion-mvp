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

// ===== FIRESTORE ADS / DEALS SERVICE =====
// Local deals now live as per-ad Firestore documents instead of being bundled
// into adminConfig/content. This makes ad updates independent and easier to
// secure later.

const ADS_COLLECTION = "ads";

export function getAdsCollectionRef() {
  return collection(db, ADS_COLLECTION);
}

export function getAdRef(adId) {
  return doc(db, ADS_COLLECTION, String(adId));
}

function normalizeAd(ad = {}) {
  const id = String(ad.id || Date.now());

  return {
    id,
    businessName: String(ad.businessName || "").trim(),
    headline: String(ad.headline || "").trim(),
    description: String(ad.description || "").trim(),
    category: String(ad.category || "Local").trim() || "Local",
    active: ad.active !== false,
    createdAtMs:
      typeof ad.createdAtMs === "number"
        ? ad.createdAtMs
        : Number(ad.id) || Date.now(),
    headlineTranslations: ad.headlineTranslations || {},
    descriptionTranslations: ad.descriptionTranslations || {},
  };
}

function sortAds(ads = []) {
  return [...ads].sort((a, b) => {
    const aTime = a.createdAtMs || Number(a.id) || 0;
    const bTime = b.createdAtMs || Number(b.id) || 0;
    return bTime - aTime;
  });
}

// ===== ADS READ =====
export async function getSharedAds() {
  const adsSnapshot = await getDocs(
    query(getAdsCollectionRef(), orderBy("createdAtMs", "desc"))
  );

  const ads = adsSnapshot.docs.map((adDoc) => ({
    id: adDoc.id,
    ...adDoc.data(),
  }));

  return sortAds(ads);
}

// ===== ADS WRITE =====
// Current App wiring still saves the full ads array. This function writes each
// ad as its own document and removes documents that are no longer in the array.
export async function saveSharedAds(ads = []) {
  const normalizedAds = sortAds(ads.map((ad) => normalizeAd(ad)));

  const currentSnapshot = await getDocs(getAdsCollectionRef());
  const nextIds = new Set(normalizedAds.map((ad) => String(ad.id)));

  const batch = writeBatch(db);

  normalizedAds.forEach((ad) => {
    batch.set(
      getAdRef(ad.id),
      {
        ...ad,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  currentSnapshot.docs.forEach((adDoc) => {
    if (!nextIds.has(adDoc.id)) {
      batch.delete(adDoc.ref);
    }
  });

  await batch.commit();
}

// ===== ADS LISTENER =====
export function listenToSharedAds(callback, onError) {
  const adsQuery = query(getAdsCollectionRef(), orderBy("createdAtMs", "desc"));

  return onSnapshot(
    adsQuery,
    (snapshot) => {
      const ads = snapshot.docs.map((adDoc) => ({
        id: adDoc.id,
        ...adDoc.data(),
      }));

      callback(sortAds(ads));
    },
    (error) => {
      console.error("Failed to listen to shared ads:", error);
      if (onError) onError(error);
    }
  );
}

// ===== SINGLE AD HELPERS =====
// Not wired into Admin yet, but useful for future more granular ad editing.
export async function createSharedAd(ad) {
  const normalizedAd = normalizeAd({
    ...ad,
    id: ad.id || Date.now(),
  });

  await setDoc(getAdRef(normalizedAd.id), {
    ...normalizedAd,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return normalizedAd;
}

export async function updateSharedAd(adId, patch) {
  return setDoc(
    getAdRef(adId),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteSharedAd(adId) {
  return deleteDoc(getAdRef(adId));
}
