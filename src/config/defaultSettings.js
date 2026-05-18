// ===== DEFAULT APP SETTINGS =====
// Centralized defaults for app-wide settings that are not page content.
// These are still local-first until settings move to Firestore.

export const defaultAppSettings = {
  // Global fallback location used when device location is unavailable/denied.
  // Future admin UI will allow this to be changed.
  defaultZipCode: "64801",
  defaultLocationLabel: "Joplin, MO",
};
