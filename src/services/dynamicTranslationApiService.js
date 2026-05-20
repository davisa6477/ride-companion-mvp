import { apiPost } from "./apiClient.js";

export async function translateDriverMessage({
  text,
  targetLanguage,
  sourceLanguage = "en",
}) {
  const trimmedText = String(text || "").trim();

  if (!trimmedText) {
    return {
      translatedText: "",
      sourceLanguage,
      targetLanguage,
      provider: "none",
    };
  }

  if (!targetLanguage || targetLanguage === sourceLanguage) {
    return {
      translatedText: trimmedText,
      sourceLanguage,
      targetLanguage: sourceLanguage,
      provider: "none",
    };
  }

  return apiPost("/translate", {
    text: trimmedText,
    sourceLanguage,
    targetLanguage,
  });
}
