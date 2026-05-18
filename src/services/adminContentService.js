import {
  loadDriverProfile,
  saveDriverProfile,
  loadTipOptions,
  saveTipOptions,
  loadAds,
  saveAds,
  loadGuestbookEntries,
  saveGuestbookEntries,
  loadRequestCategories,
  saveRequestCategories,
  loadAdminPin,
  saveAdminPin,
} from "./storageService.js";

import {
  DEFAULT_ADMIN_PIN,
  defaultGuestbookEntries,
  defaultDriverProfile,
} from "../config/defaultContent.js";

import { starterAds } from "../data/starterAds.js";
import { defaultRequestCategories as starterRequestCategories } from "../data/defaultRequests.js";
import {
  getSharedAdminContent,
  listenToSharedAdminContent,
  saveSharedAdminContent,
} from "./firestoreAdminService.js";

// ===== ADMIN CONTENT SERVICE =====
// Current implementation still uses localStorage through storageService.js.
// This file creates a clean boundary so the later Firestore migration can happen
// here without spreading backend logic throughout App.jsx and page components.

export function loadAdminContent() {
  return {
    entries: loadGuestbookEntries(defaultGuestbookEntries),
    ads: loadAds(starterAds),
    adminPin: loadAdminPin(DEFAULT_ADMIN_PIN),
    requestCategories: loadRequestCategories(starterRequestCategories),
    driverProfile: loadDriverProfile(defaultDriverProfile),
    tipOptions: loadTipOptions([]),
  };
}

// ===== FIRESTORE BRIDGE HELPERS =====
// These are intentionally not wired into App.jsx yet.
// Later phases will call them to load/save shared admin content while keeping
// localStorage fallback available.
export async function loadSharedAdminContent() {
  const localContent = loadAdminContent();

  try {
    const sharedContent = await getSharedAdminContent();

    if (!sharedContent) {
      return localContent;
    }

    return {
      ...localContent,
      ...sharedContent,
    };
  } catch (error) {
    console.error("Failed to load shared admin content:", error);
    return localContent;
  }
}

export async function saveSharedAdminContentSnapshot(content) {
  try {
    await saveSharedAdminContent(content);
    return true;
  } catch (error) {
    console.error("Failed to save shared admin content:", error);
    return false;
  }
}

export function subscribeToSharedAdminContent(callback, onError) {
  return listenToSharedAdminContent(callback, onError);
}

export {
  saveDriverProfile,
  saveTipOptions,
  saveAds,
  saveGuestbookEntries,
  saveRequestCategories,
  saveAdminPin,
};
