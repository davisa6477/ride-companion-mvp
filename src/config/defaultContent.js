// ===== DEFAULT APP CONTENT =====
// Centralized defaults for admin-managed content.
// Storage behavior is unchanged; these values are still used as local fallbacks
// until admin-managed content is moved to Firestore.

export const DEFAULT_ADMIN_PIN = "1234";

// ===== DEFAULT GUESTBOOK DATA =====
export const defaultGuestbookEntries = [
  {
    id: 101,
    name: "Sam",
    city: "Joplin, MO",
    message: "Great ride and clean setup!",
    approved: true,
  },
];

// ===== DRIVER PROFILE DEFAULTS =====
export const defaultDriverProfile = {
  name: "Aaron",
  bio: "Welcome aboard. I hope you have a comfortable ride — feel free to check out local deals, trivia, weather, or send a quick ride request.",
  localTip: "Ask me about good local food spots if you're visiting Joplin.",
  photo: "",

  // ===== MANUAL DYNAMIC TRANSLATIONS =====
  bioTranslations: {
    es: "",
    fr: "",
  },
  localTipTranslations: {
    es: "",
    fr: "",
  },
};
