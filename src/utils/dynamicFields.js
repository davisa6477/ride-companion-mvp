// ===== DYNAMIC FIELD TRANSLATION HELPERS =====
// Dynamic/admin-entered content should prefer a manually supplied translation
// for the selected passenger language, then fall back to the default English field.
//
// Expected shape:
// {
//   headline: "Free appetizer with entrée",
//   headlineTranslations: {
//     es: "Aperitivo gratis con plato principal"
//   }
// }

export function getTranslatedField(
  record,
  field,
  language = "en",
  fallbackValue = ""
) {
  if (!record || !field) return fallbackValue || "";

  const defaultValue = record[field] || fallbackValue || "";

  if (!language || language === "en") {
    return defaultValue;
  }

  const translationMap = record[`${field}Translations`];

  if (!translationMap || typeof translationMap !== "object") {
    return defaultValue;
  }

  const translatedValue = translationMap[language];

  return typeof translatedValue === "string" && translatedValue.trim()
    ? translatedValue.trim()
    : defaultValue;
}

export function setTranslatedFieldValue(record, field, language, value) {
  if (!record || !field || !language || language === "en") {
    return record;
  }

  return {
    ...record,
    [`${field}Translations`]: {
      ...(record[`${field}Translations`] || {}),
      [language]: value,
    },
  };
}

export function hasTranslatedField(record, field, language = "en") {
  if (!record || !field || !language || language === "en") return true;

  const translationMap = record[`${field}Translations`];
  const translatedValue = translationMap?.[language];

  return typeof translatedValue === "string" && translatedValue.trim().length > 0;
}
