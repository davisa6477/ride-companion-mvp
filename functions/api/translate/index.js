import { errorResponse, jsonResponse, requireMethod } from "../_shared.js";

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

const LANGUAGE_MAP = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
  zh: "zh-CN",
  ar: "ar",
  vi: "vi",
  ko: "ko",
  ja: "ja",
  hi: "hi",
};

function normalizeLanguage(code, fallback = "en") {
  return LANGUAGE_MAP[code] || code || fallback;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function onRequest(context) {
  const methodError = requireMethod(context.request, ["POST"]);
  if (methodError) return methodError;

  const body = await readJsonBody(context.request);
  const text = String(body.text || "").trim();
  const sourceLanguage = normalizeLanguage(body.sourceLanguage || "en", "en");
  const targetLanguage = normalizeLanguage(body.targetLanguage || "", "");

  if (!text) {
    return errorResponse("Text is required.", 400);
  }

  if (!targetLanguage) {
    return errorResponse("Target language is required.", 400);
  }

  // MyMemory documents q as max 500 bytes. Keep room for UTF-8 text.
  if (new TextEncoder().encode(text).length > 500) {
    return errorResponse("Text is too long for this translation endpoint. Keep it under 500 bytes.", 400);
  }

  if (sourceLanguage === targetLanguage) {
    return jsonResponse({
      ok: true,
      provider: "none",
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      match: 1,
    });
  }

  const url = new URL(MYMEMORY_ENDPOINT);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);
  url.searchParams.set("mt", "1");

  // Optional Cloudflare env values:
  // MYMEMORY_EMAIL adds de= email contact parameter.
  // MYMEMORY_KEY adds key= authenticated key parameter.
  if (context.env?.MYMEMORY_EMAIL) {
    url.searchParams.set("de", context.env.MYMEMORY_EMAIL);
  }

  if (context.env?.MYMEMORY_KEY) {
    url.searchParams.set("key", context.env.MYMEMORY_KEY);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      return errorResponse("MyMemory request failed.", response.status, payload);
    }

    const translatedText = payload?.responseData?.translatedText;

    if (!translatedText) {
      return errorResponse("MyMemory did not return translated text.", 502, payload);
    }

    return jsonResponse({
      ok: true,
      provider: "mymemory",
      translatedText,
      sourceLanguage,
      targetLanguage,
      match: payload?.responseData?.match ?? null,
      quotaFinished: payload?.quotaFinished ?? null,
      responseStatus: payload?.responseStatus ?? null,
    });
  } catch (error) {
    return errorResponse("Translation API failed.", 500, error?.message || null);
  }
}
