// ===== DEFAULT PASSENGER REQUEST CATEGORIES =====
// These are the built-in request categories shown on the passenger Requests page.
// Admin-created custom requests are persisted separately through storageService.js.
export const defaultRequestCategories = {
  Comfort: [
    "Cooler temperature",
    "Warmer temperature",
    "Lower fan speed",
    "Higher fan speed",
    "Window cracked open",
    "Window closed",
  ],

  "Audio / Atmosphere": [
    "Lower music volume",
    "Raise music volume",
    "Different music style",
    "Quiet ride preferred",
    "Conversation okay",
  ],

  "Device / Charging": [
    "Need phone charger",
    "Need different charging cable",
    "Battery low warning",
    "Device overheating",
  ],

  "Ride Assistance": [
    "Feeling car sick",
    "Need fresh air",
    "Need restroom soon",
    "Need tissue/napkin",
    "Need water",
  ],

  "Ride Communication": [
    "Pickup/dropoff clarification",
    "Wrong turn concern",
    "Quick stop question",
    "Change destination question",
  ],

  "Accessibility / Comfort": [
    "Hearing difficulty",
    "Need extra time",
    "Sensory sensitivity",
  ],

  "Safety / Priority": [
    "Please stop at next safe location",
    "Feeling unwell",
    "Emergency assistance needed",
  ],
};

// ===== DEFAULT CATEGORY DESCRIPTIONS =====
// Used as short subtitles under request category cards.
// Translation keys can override these display strings in the Requests page.
export const categoryDescriptions = {
  Comfort: "Temperature & airflow",
  "Audio / Atmosphere": "Music & conversation",
  "Device / Charging": "Phone & power help",
  "Ride Assistance": "Comfort assistance",
  "Ride Communication": "Ride questions",
  "Accessibility / Comfort": "Accessibility options",
  "Safety / Priority": "Urgent ride needs",
};
