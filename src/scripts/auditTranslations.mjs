import { translations, supportedLanguages } from "../translations/index.js";

const ignoredKeys = new Set([
  "2d",
  "Dealer",
  "canvas",
  "textarea",
]);

const sourceKeys = new Set([
  // Keep this list small and focused: runtime JSX keys are audited during Phase 22.
  // Add keys here when new dynamically-generated translation keys are introduced.
]);

function diffLanguage(language) {
  const languageKeys = new Set(Object.keys(translations[language] || {}));
  const englishKeys = new Set(Object.keys(translations.en || {}));

  const missingFromEnglish = [...sourceKeys].filter(
    (key) => !ignoredKeys.has(key) && !englishKeys.has(key)
  );

  const missingFromLanguage = [...englishKeys].filter(
    (key) => !ignoredKeys.has(key) && !languageKeys.has(key)
  );

  return {
    language,
    missingFromEnglish,
    missingFromLanguage,
  };
}

const report = supportedLanguages.map((language) => diffLanguage(language.code));

console.table(
  report.map((item) => ({
    language: item.language,
    missingFromEnglish: item.missingFromEnglish.length,
    missingFromLanguage: item.missingFromLanguage.length,
  }))
);

for (const item of report) {
  if (item.missingFromLanguage.length > 0) {
    console.log(`\n${item.language} missing:`);
    console.log(item.missingFromLanguage.join(", "));
  }
}
