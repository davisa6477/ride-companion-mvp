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

function mergeLanguage(language) {
  return {
    ...navigation[language],
    ...home[language],
    ...requests[language],
    ...games[language],
    ...ads[language],
    ...mirror[language],
    ...shared[language],
    ...weather[language],
    ...flights[language],
    ...guestbook[language],
    ...local[language],
    ...tips[language],
    ...translate[language],
  };
}

// ===== TRANSLATION MATRIX =====
// English remains the master fallback language.
export const translations = {
  en: mergeLanguage("en"),
  es: mergeLanguage("es"),
  fr: mergeLanguage("fr"),
  de: mergeLanguage("de"),
  pt: mergeLanguage("pt"),
  zh: mergeLanguage("zh"),
  ar: mergeLanguage("ar"),
  vi: mergeLanguage("vi"),
  ko: mergeLanguage("ko"),
  ja: mergeLanguage("ja"),
  hi: mergeLanguage("hi"),
};

// ===== TRANSLATOR FACTORY =====
// Fallback order:
// 1. selected language value
// 2. English value
// 3. raw key
export function createTranslator(language = "en") {
  return function translate(key) {
    return translations[language]?.[key] || translations.en[key] || key;
  };
}
