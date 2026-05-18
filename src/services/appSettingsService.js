import { defaultAppSettings } from "../config/defaultSettings.js";
import {
  getSharedAppSettings,
  listenToSharedAppSettings,
  saveSharedAppSettings,
} from "./firestoreAdminService.js";

const APP_SETTINGS_STORAGE_KEY = "rideCompanion.appSettings";

// ===== APP SETTINGS SERVICE =====
// Current implementation uses localStorage.
// This creates a clean boundary so settings can later move to Firestore
// without rewriting Weather, Local, Admin, or App wiring.

export function loadAppSettings() {
  try {
    const rawSettings = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return defaultAppSettings;
    }

    const parsedSettings = JSON.parse(rawSettings);

    return {
      ...defaultAppSettings,
      ...parsedSettings,
    };
  } catch (error) {
    console.error("Failed to load app settings:", error);
    return defaultAppSettings;
  }
}

export function saveAppSettings(settings) {
  try {
    localStorage.setItem(
      APP_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...defaultAppSettings,
        ...settings,
      })
    );
  } catch (error) {
    console.error("Failed to save app settings:", error);
  }
}

export function updateAppSettings(patch) {
  const currentSettings = loadAppSettings();
  const nextSettings = {
    ...currentSettings,
    ...patch,
  };

  saveAppSettings(nextSettings);
  return nextSettings;
}

// ===== FIRESTORE BRIDGE HELPERS =====
// These are intentionally not wired into App.jsx yet.
// Later phases will call them to sync settings across admin/passenger devices.
export async function loadSharedAppSettings() {
  const localSettings = loadAppSettings();

  try {
    const sharedSettings = await getSharedAppSettings();

    if (!sharedSettings) {
      return localSettings;
    }

    return {
      ...defaultAppSettings,
      ...localSettings,
      ...sharedSettings,
    };
  } catch (error) {
    console.error("Failed to load shared app settings:", error);
    return localSettings;
  }
}

export async function saveSharedAppSettingsSnapshot(settings) {
  try {
    await saveSharedAppSettings({
      ...defaultAppSettings,
      ...settings,
    });

    return true;
  } catch (error) {
    console.error("Failed to save shared app settings:", error);
    return false;
  }
}

export function subscribeToSharedAppSettings(callback, onError) {
  return listenToSharedAppSettings(callback, onError);
}
