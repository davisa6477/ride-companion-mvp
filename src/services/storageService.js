// ===== LOCAL STORAGE KEYS =====
// These keys preserve admin/passenger configuration in the current browser.
// This is MVP local persistence, not cloud/user-account persistence.
const STORAGE_KEYS = {
  DRIVER_PROFILE: "ridecompanion_driver_profile",
  TIP_OPTIONS: "ridecompanion_tip_options",
  ADS: "ridecompanion_ads",
  GUESTBOOK: "ridecompanion_guestbook",
  REQUEST_CATEGORIES: "ridecompanion_request_categories",
  ADMIN_PIN: "ridecompanion_admin_pin",
};

// ===== ADMIN PIN PERSISTENCE =====
export function loadAdminPin(defaultPin = "1234") {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    return saved || defaultPin;
  } catch (error) {
    console.error("Failed to load admin PIN:", error);
    return defaultPin;
  }
}

export function saveAdminPin(pin) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
  } catch (error) {
    console.error("Failed to save admin PIN:", error);
  }
}

// ===== REQUEST CATEGORIES PERSISTENCE =====
export function loadRequestCategories(defaultCategories = {}) {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUEST_CATEGORIES);
    return saved ? JSON.parse(saved) : defaultCategories;
  } catch (error) {
    console.error("Failed to load request categories:", error);
    return defaultCategories;
  }
}

export function saveRequestCategories(categories) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.REQUEST_CATEGORIES,
      JSON.stringify(categories)
    );
  } catch (error) {
    console.error("Failed to save request categories:", error);
  }
}

// ===== GUESTBOOK PERSISTENCE =====
export function loadGuestbookEntries(defaultEntries = []) {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GUESTBOOK);
    return saved ? JSON.parse(saved) : defaultEntries;
  } catch (error) {
    console.error("Failed to load guestbook entries:", error);
    return defaultEntries;
  }
}

export function saveGuestbookEntries(entries) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.GUESTBOOK,
      JSON.stringify(entries)
    );
  } catch (error) {
    console.error("Failed to save guestbook entries:", error);
  }
}

// ===== LOCAL ADS PERSISTENCE =====
export function loadAds(defaultAds = []) {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADS);
    return saved ? JSON.parse(saved) : defaultAds;
  } catch (error) {
    console.error("Failed to load ads:", error);
    return defaultAds;
  }
}

export function saveAds(ads) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  } catch (error) {
    console.error("Failed to save ads:", error);
  }
}

// ===== DRIVER PROFILE PERSISTENCE =====
// Merges saved profile data with defaults so new fields can be added later
// without breaking older saved profiles.
export function loadDriverProfile(defaultProfile) {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVER_PROFILE);

    if (!saved) return defaultProfile;

    return {
      ...defaultProfile,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error("Failed to load driver profile:", error);
    return defaultProfile;
  }
}

export function saveDriverProfile(profile) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.DRIVER_PROFILE,
      JSON.stringify(profile)
    );
  } catch (error) {
    console.error("Failed to save driver profile:", error);
  }
}

// ===== TIP OPTIONS PERSISTENCE =====
export function loadTipOptions(defaultOptions = []) {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TIP_OPTIONS);
    return saved ? JSON.parse(saved) : defaultOptions;
  } catch (error) {
    console.error("Failed to load tip options:", error);
    return defaultOptions;
  }
}

export function saveTipOptions(options) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TIP_OPTIONS,
      JSON.stringify(options)
    );
  } catch (error) {
    console.error("Failed to save tip options:", error);
  }
}
