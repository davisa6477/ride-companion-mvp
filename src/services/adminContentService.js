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

export {
  saveDriverProfile,
  saveTipOptions,
  saveAds,
  saveGuestbookEntries,
  saveRequestCategories,
  saveAdminPin,
};
