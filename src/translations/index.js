import navigation from "./navigation.js";
import home from "./home.js";
import requests from "./requests.js";
import games from "./games.js";
import ads from "./ads.js";
import mirror from "./mirror.js";
import shared from "./shared.js";
import weather from "./weather.js";
import flights from "./flights.js";
import guestbook from "./guestbook.js";
import local from "./local.js";
import tips from "./tips.js";
import translate from "./translate.js";

// ===== SUPPORTED LANGUAGE LIST =====
// This list controls language options used by translation-related UI.
// Some languages currently fall back to English until their modules are expanded.
export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "vi", label: "Vietnamese" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
];

// ===== TRANSLATION MATRIX =====
// Each language object merges page-specific modules into one lookup table.
// English is the master fallback language.
// Spanish and French currently have the broadest translation coverage.
export const translations = {
  en: {
    ...navigation.en,
    ...home.en,
    ...requests.en,
    ...games.en,
    ...ads.en,
    ...mirror.en,
    ...shared.en,
    ...weather.en,
    ...flights.en,
    ...guestbook.en,
    ...local.en,
    ...tips.en,
    ...translate.en,
  },

  es: {
    ...navigation.es,
    ...home.es,
    ...requests.es,
    ...games.es,
    ...ads.es,
    ...mirror.es,
    ...shared.es,
    ...weather.es,
    ...flights.es,
    ...guestbook.es,
    ...local.es,
    ...tips.es,
    ...translate.es,
  },

  fr: {
    ...navigation.fr,
    ...home.fr,
    ...requests.fr,
    ...games.fr,
    ...ads.fr,
    ...mirror.fr,
    ...shared.fr,
    ...weather.fr,
    ...flights.fr,
    ...guestbook.fr,
    ...local.fr,
    ...tips.fr,
    ...translate.fr,
  },

  // ===== FUTURE LANGUAGE PLACEHOLDERS =====
  // These languages currently fall back to English modules until full
  // translation files are added.
  de: {
    ...navigation.en,
    ...home.en,
  },

  pt: {
    ...navigation.en,
    ...home.en,
  },

  zh: {
    ...navigation.en,
    ...home.en,
  },

  ar: {
    ...navigation.en,
    ...home.en,
  },

  vi: {
    ...navigation.en,
    ...home.en,
  },

  ko: {
    ...navigation.en,
    ...home.en,
  },

  ja: {
    ...navigation.en,
    ...home.en,
  },

  hi: {
    ...navigation.en,
    ...home.en,
  },
};

// ===== TRANSLATOR FACTORY =====
// Returns a simple t(key) function for the selected language.
// Fallback order:
// 1. selected language value
// 2. English value
// 3. raw key
export function createTranslator(language = "en") {
  return function translate(key) {
    return translations[language]?.[key] || translations.en[key] || key;
  };
}
