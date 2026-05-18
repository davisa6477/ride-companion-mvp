import { defaultAppSettings } from "../config/defaultSettings.js";

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
