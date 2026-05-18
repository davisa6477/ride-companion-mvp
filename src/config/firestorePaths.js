// ===== FIRESTORE PATH CONSTANTS =====
// Central reference for Firestore collection/document paths.
// This file does not change behavior yet; it prepares future service cleanup.

export const FIRESTORE_PATHS = {
  rideSessions: "rideSessions",
  currentSessionId: "current",
  requests: "requests",
  adminConfig: "adminConfig",
  adminContentDocId: "content",
  appSettingsDocId: "settings",
  guestbook: "guestbook",
  guestbookEntriesDocId: "entries",
};
