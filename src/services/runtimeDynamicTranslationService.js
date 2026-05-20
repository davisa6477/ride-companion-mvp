import { translateDriverMessage } from "./dynamicTranslationApiService.js";

const runtimeTranslationCache = new Map();

function makeCacheKey(language, text) {
  return `${language}::${String(text || "").trim()}`;
}

export function clearRuntimeTranslationCache() {
  runtimeTranslationCache.clear();
}

export async function translateRuntimeText(text, language) {
  const trimmedText = String(text || "").trim();

  if (!trimmedText || !language || language === "en") {
    return trimmedText;
  }

  const cacheKey = makeCacheKey(language, trimmedText);

  if (runtimeTranslationCache.has(cacheKey)) {
    return runtimeTranslationCache.get(cacheKey);
  }

  const translation = await translateDriverMessage({
    text: trimmedText,
    sourceLanguage: "en",
    targetLanguage: language,
  });

  const translatedText = translation?.translatedText || trimmedText;

  runtimeTranslationCache.set(cacheKey, translatedText);

  return translatedText;
}

export async function translateRuntimeFields(record, fields = [], language = "en") {
  if (!record || !fields.length || !language || language === "en") {
    return {};
  }

  const entries = await Promise.all(
    fields.map(async (field) => {
      const defaultValue = String(record[field] || "").trim();

      if (!defaultValue) {
        return [field, ""];
      }

      // Manual/generated saved translations still win if they exist.
      const savedTranslation = record[`${field}Translations`]?.[language];

      if (typeof savedTranslation === "string" && savedTranslation.trim()) {
        return [field, savedTranslation.trim()];
      }

      const translatedValue = await translateRuntimeText(defaultValue, language);

      return [field, translatedValue];
    })
  );

  return Object.fromEntries(entries);
}
