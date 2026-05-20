import { useEffect, useMemo, useState } from "react";
import { Languages, MessageSquareText, RefreshCcw } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { setPassengerLanguage } from "../../services/rideSessionService.js";
import { translateDriverMessage } from "../../services/dynamicTranslationApiService.js";
import {
  sendConsoleNotification,
  sendPassengerRequest,
} from "../../services/rideSessionService.js";
import { translateRuntimeText } from "../../services/runtimeDynamicTranslationService.js";

// ===== SUPPORTED PASSENGER LANGUAGES =====
// This list controls the dropdown in the passenger translation helper.
const supportedLanguages = [
  { code: "en", label: "English", lang: "en", dir: "ltr" },
  { code: "es", label: "Spanish", lang: "es", dir: "ltr" },
  { code: "fr", label: "French", lang: "fr", dir: "ltr" },
  { code: "de", label: "German", lang: "de", dir: "ltr" },
  { code: "pt", label: "Portuguese", lang: "pt", dir: "ltr" },
  { code: "zh", label: "Chinese", lang: "zh-CN", dir: "ltr" },
  { code: "ar", label: "Arabic", lang: "ar", dir: "rtl" },
  { code: "vi", label: "Vietnamese", lang: "vi", dir: "ltr" },
  { code: "ko", label: "Korean", lang: "ko", dir: "ltr" },
  { code: "ja", label: "Japanese", lang: "ja", dir: "ltr" },
  { code: "hi", label: "Hindi", lang: "hi", dir: "ltr" },
];


const TRANSLATION_UI_TEXT = {
  title: "Translation Helper",
  subtitle:
    "Choose your language. The tablet and driver console will follow your selection.",
  backToEnglish: "Back to English",
  passengerLanguage: "Passenger language",
  currentSetup: "Current setup",
  keyboardNote:
    "Keyboard language is controlled by the tablet’s operating system. This page can hint the text language to the browser, but passengers may need to switch keyboards from the on-screen keyboard.",
  requestsNote:
    "Quick needs like temperature, music, windows, stops, and comfort are now handled in the Requests tab.",
  passengerToDriver: "Passenger → Driver",
  typeOnly:
    "Type a custom message. The English version can be sent to the driver console.",
  typeIn: "Type in",
  translateToEnglish: "Translate to English",
  translating: "Translating...",
  translatingBeforeSend: "Translating before sending...",
  sendToDriver: "Send to Driver",
  sending: "Sending...",
  englishResult: "English message appears here.",
  privacyNote:
    "Short messages translate best. If translation is unavailable, the original text can still be sent.",
  syncError: "Could not sync language to driver console.",
  apiFailed: "Translation failed. Showing the original message instead.",
  sendEmpty: "Type and translate a message before sending.",
  sendSuccess: "Message sent to the driver console.",
  sendError: "Could not send message to the driver console.",
};

export default function TranslationPage({
  appLanguage = "en",
  setAppLanguage = () => {},
  t = (key) => key,
}) {
  // ===== TRANSLATION PAGE STATE =====
  const [selectedLanguage, setSelectedLanguage] = useState(appLanguage || "en");
  const [passengerText, setPassengerText] = useState("");
  const [englishResult, setEnglishResult] = useState("");
  const [lastTranslatedPassengerText, setLastTranslatedPassengerText] = useState("");
  const [syncError, setSyncError] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [translating, setTranslating] = useState(false);
  const [sendingToDriver, setSendingToDriver] = useState(false);
  const [runtimeUiText, setRuntimeUiText] = useState({});

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  function uiText(key) {
    return runtimeUiText[key] || tr(`translate_${key}`, TRANSLATION_UI_TEXT[key]);
  }

  // ===== SELECTED LANGUAGE METADATA =====
  const selectedLanguageConfig = useMemo(
    () =>
      supportedLanguages.find((language) => language.code === selectedLanguage) ||
      supportedLanguages[0],
    [selectedLanguage]
  );

  const selectedLanguageLabel = selectedLanguageConfig.label;
  const selectedInputLang = selectedLanguageConfig.lang || selectedLanguage;
  const selectedTextDirection = selectedLanguageConfig.dir || "ltr";

  // ===== RUNTIME UI TEXT TRANSLATION =====
  // Some newer Translation-tab helper text may not exist in the static dictionary yet.
  // Translate those labels on the tablet so the whole tab follows the passenger language.
  useEffect(() => {
    let cancelled = false;

    async function translateTranslationTabText() {
      if (!selectedLanguage || selectedLanguage === "en") {
        setRuntimeUiText({});
        return;
      }

      try {
        const translatedEntries = await Promise.all(
          Object.entries(TRANSLATION_UI_TEXT).map(async ([key, value]) => [
            key,
            await translateRuntimeText(value, selectedLanguage),
          ])
        );

        if (!cancelled) {
          setRuntimeUiText(Object.fromEntries(translatedEntries));
        }
      } catch (error) {
        console.error("Runtime translation tab text translation failed:", error);

        if (!cancelled) {
          setRuntimeUiText({});
        }
      }
    }

    translateTranslationTabText();

    return () => {
      cancelled = true;
    };
  }, [selectedLanguage]);

  // ===== KEEP LOCAL PAGE STATE IN SYNC WITH APP LANGUAGE =====
  useEffect(() => {
    setSelectedLanguage(appLanguage || "en");
  }, [appLanguage]);

  // ===== APPLY PASSENGER LANGUAGE =====
  // Updates local app language and syncs the selection to Firestore for the driver console.
  async function applyLanguage(nextLanguage) {
    setSyncError("");
    setSendStatus("");
    setSelectedLanguage(nextLanguage);
    setAppLanguage(nextLanguage);

    try {
      await setPassengerLanguage(nextLanguage);
    } catch (error) {
      console.error("Failed to sync passenger language:", error);

      setSyncError(
        tr(
          "translate_sync_error",
          TRANSLATION_UI_TEXT.syncError
        )
      );
    }
  }

  // ===== RESET TO ENGLISH =====
  function resetEnglish() {
    applyLanguage("en");
    setPassengerText("");
    setEnglishResult("");
    setLastTranslatedPassengerText("");
    setSendStatus("");
  }

  // ===== PASSENGER TEXT TO ENGLISH =====
  async function translatePassengerTextToEnglish({ showError = true } = {}) {
    const trimmedText = passengerText.trim();

    if (!trimmedText) {
      setEnglishResult("");
      setLastTranslatedPassengerText("");
      setSendStatus("");
      return "";
    }

    if (selectedLanguage === "en") {
      setEnglishResult(trimmedText);
      setLastTranslatedPassengerText(trimmedText);
      return trimmedText;
    }

    try {
      const translation = await translateDriverMessage({
        text: trimmedText,
        sourceLanguage: selectedLanguage,
        targetLanguage: "en",
      });

      const translatedText = translation?.translatedText || trimmedText;

      setEnglishResult(translatedText);
      setLastTranslatedPassengerText(trimmedText);

      return translatedText;
    } catch (error) {
      console.error("Passenger-to-English translation failed:", error);

      setEnglishResult(trimmedText);
      setLastTranslatedPassengerText(trimmedText);

      if (showError) {
        setSyncError(
          tr(
            "translate_api_failed",
            TRANSLATION_UI_TEXT.apiFailed
          )
        );
      }

      return trimmedText;
    }
  }

  async function translateToEnglish() {
    setTranslating(true);
    setSyncError("");
    setSendStatus("");

    try {
      await translatePassengerTextToEnglish({ showError: true });
    } finally {
      setTranslating(false);
    }
  }

  // ===== SEND TRANSLATED MESSAGE TO DRIVER CONSOLE =====
  async function sendTranslatedMessageToDriver() {
    const originalText = passengerText.trim();

    setSendStatus("");

    if (!originalText) {
      setSendStatus(uiText("sendEmpty"));
      return;
    }

    setSendingToDriver(true);

    try {
      let englishText = englishResult.trim();

      // If the passenger changed the text after translating, or if they tap
      // Send to Driver without tapping Translate first, translate automatically.
      if (!englishText || lastTranslatedPassengerText !== originalText) {
        setSendStatus(uiText("translatingBeforeSend"));
        englishText = await translatePassengerTextToEnglish({ showError: false });
      }

      const finalEnglishText = englishText || originalText;

      await sendPassengerRequest({
        category: "Translation",
        type: "translation",
        message: finalEnglishText,
        originalMessage: originalText,
        originalLanguage: selectedLanguage,
        originalLanguageLabel: selectedLanguageLabel,
      });

      await sendConsoleNotification({
        type: "request",
        label: "Passenger Translation",
        message: finalEnglishText,
      });

      setSendStatus(uiText("sendSuccess"));
      setPassengerText("");
      setEnglishResult("");
      setLastTranslatedPassengerText("");
    } catch (error) {
      console.error("Failed to send translated message to driver:", error);
      setSendStatus(uiText("sendError"));
    } finally {
      setSendingToDriver(false);
    }
  }

  return (
    <PageCard className={`${PAGE_FRAME_CLASS} flex min-h-0 flex-col overflow-hidden`}>
      {/* ===== PAGE HEADER ===== */}
      <div className="shrink-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <Languages />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-950">
                {uiText("title")}
              </h2>

              <p className="text-slate-600">
                {uiText("subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetEnglish}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            <RefreshCcw size={18} />
            {uiText("backToEnglish")}
          </button>
        </div>

        {syncError && (
          <div className="mt-4 rounded-2xl bg-rose-100 p-4 text-sm font-black text-rose-900">
            {syncError}
          </div>
        )}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          {/* ===== LANGUAGE SELECTION ===== */}
          <section className="grid content-start gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <label className="text-sm font-black uppercase tracking-wide text-slate-500">
                {uiText("passengerLanguage")}
              </label>

              <select
                value={selectedLanguage}
                onChange={(event) => applyLanguage(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-lg font-bold outline-none focus:ring-4 focus:ring-slate-200"
              >
                {supportedLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-sm font-black uppercase tracking-wide text-white/50">
                {uiText("currentSetup")}
              </div>

              <div className="mt-2 text-3xl font-black">
                {selectedLanguageLabel}
              </div>

              <p className="mt-3 text-sm font-bold leading-relaxed text-white/60">
                {uiText("keyboardNote")}
              </p>
            </div>

            <div className="rounded-3xl bg-emerald-50 p-5 text-sm font-bold leading-relaxed text-emerald-900">
              {uiText("requestsNote")}
            </div>
          </section>

          {/* ===== PASSENGER TO DRIVER TRANSLATION PANEL ===== */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <MessageSquareText />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950">
                  {uiText("passengerToDriver")}
                </h3>

                <p className="text-sm text-slate-500">
                  {uiText("typeOnly")}
                </p>
              </div>
            </div>

            <textarea
              value={passengerText}
              onChange={(event) => {
                setPassengerText(event.target.value);
                setSendStatus("");
              }}
              placeholder={`${uiText("typeIn")} ${selectedLanguageLabel}...`}
              rows={6}
              lang={selectedInputLang}
              dir={selectedTextDirection}
              autoCapitalize="sentences"
              autoCorrect="on"
              className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200"
            />

            <button
              type="button"
              onClick={translateToEnglish}
              disabled={translating}
              className="mt-3 w-full rounded-2xl bg-slate-950 p-4 text-lg font-black text-white disabled:opacity-50"
            >
              {translating
                ? uiText("translating")
                : uiText("translateToEnglish")}
            </button>

            <button
              type="button"
              onClick={sendTranslatedMessageToDriver}
              disabled={sendingToDriver || (!englishResult.trim() && !passengerText.trim())}
              className="mt-3 w-full rounded-2xl bg-emerald-500 p-4 text-lg font-black text-white shadow-lg disabled:opacity-50"
            >
              {sendingToDriver ? uiText("sending") : uiText("sendToDriver")}
            </button>

            {sendStatus && (
              <div className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm font-black text-slate-700">
                {sendStatus}
              </div>
            )}

            <div className="mt-4 min-h-[140px] whitespace-pre-line rounded-2xl bg-slate-950 p-5 text-2xl font-black leading-relaxed text-white">
              {englishResult ||
                uiText("englishResult")}
            </div>

            <p className="mt-3 text-xs font-bold text-slate-400">
              {uiText("privacyNote")}
            </p>
          </section>
        </div>
      </div>
    </PageCard>
  );
}
