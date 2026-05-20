import { useEffect, useMemo, useState } from "react";
import { Languages, MessageSquareText, RefreshCcw } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { setPassengerLanguage } from "../../services/rideSessionService.js";
import { translateDriverMessage } from "../../services/dynamicTranslationApiService.js";

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

export default function TranslationPage({
  appLanguage = "en",
  setAppLanguage = () => {},
  t = (key) => key,
}) {
  // ===== TRANSLATION PAGE STATE =====
  const [selectedLanguage, setSelectedLanguage] = useState(appLanguage || "en");
  const [passengerText, setPassengerText] = useState("");
  const [englishResult, setEnglishResult] = useState("");
  const [syncError, setSyncError] = useState("");
  const [translating, setTranslating] = useState(false);

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
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

  // ===== KEEP LOCAL PAGE STATE IN SYNC WITH APP LANGUAGE =====
  useEffect(() => {
    setSelectedLanguage(appLanguage || "en");
  }, [appLanguage]);

  // ===== APPLY PASSENGER LANGUAGE =====
  // Updates local app language and syncs the selection to Firestore for the driver console.
  async function applyLanguage(nextLanguage) {
    setSyncError("");
    setSelectedLanguage(nextLanguage);
    setAppLanguage(nextLanguage);

    try {
      await setPassengerLanguage(nextLanguage);
    } catch (error) {
      console.error("Failed to sync passenger language:", error);

      setSyncError(
        tr(
          "translate_sync_error",
          "Could not sync language to driver console."
        )
      );
    }
  }

  // ===== RESET TO ENGLISH =====
  function resetEnglish() {
    applyLanguage("en");
    setPassengerText("");
    setEnglishResult("");
  }

  // ===== PASSENGER TEXT TO ENGLISH =====
  async function translateToEnglish() {
    const trimmedText = passengerText.trim();

    if (!trimmedText) {
      setEnglishResult("");
      return;
    }

    if (selectedLanguage === "en") {
      setEnglishResult(trimmedText);
      return;
    }

    setTranslating(true);
    setSyncError("");

    try {
      const translation = await translateDriverMessage({
        text: trimmedText,
        sourceLanguage: selectedLanguage,
        targetLanguage: "en",
      });

      setEnglishResult(translation?.translatedText || trimmedText);
    } catch (error) {
      console.error("Passenger-to-English translation failed:", error);
      setEnglishResult(trimmedText);
      setSyncError(
        tr(
          "translate_api_failed",
          "Translation failed. Showing the original message instead."
        )
      );
    } finally {
      setTranslating(false);
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
                {tr("translate_title", "Translation Helper")}
              </h2>

              <p className="text-slate-600">
                {tr(
                  "translate_subtitle_clean",
                  "Choose your language. The tablet and driver console will follow your selection."
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetEnglish}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            <RefreshCcw size={18} />
            {tr("reset_english", "Back to English")}
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
                {tr("translate_language_label", "Passenger language")}
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
                {tr("translate_current_setup", "Current setup")}
              </div>

              <div className="mt-2 text-3xl font-black">
                {selectedLanguageLabel}
              </div>

              <p className="mt-3 text-sm font-bold leading-relaxed text-white/60">
                {tr(
                  "translate_keyboard_note",
                  "Keyboard language is controlled by the tablet’s operating system. This page can hint the text language to the browser, but passengers may need to switch keyboards from the on-screen keyboard."
                )}
              </p>
            </div>

            <div className="rounded-3xl bg-emerald-50 p-5 text-sm font-bold leading-relaxed text-emerald-900">
              {tr(
                "translate_requests_note",
                "Quick needs like temperature, music, windows, stops, and comfort are now handled in the Requests tab."
              )}
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
                  {tr("translate_passenger_to_driver", "Passenger → Driver")}
                </h3>

                <p className="text-sm text-slate-500">
                  {tr(
                    "translate_type_only",
                    "Type a custom message. The English version appears below."
                  )}
                </p>
              </div>
            </div>

            <textarea
              value={passengerText}
              onChange={(event) => setPassengerText(event.target.value)}
              placeholder={`${tr("translate_type_in", "Type in")} ${selectedLanguageLabel}...`}
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
                ? tr("translate_translating", "Translating...")
                : tr("translate_to_english", "Translate to English")}
            </button>

            <div className="mt-4 min-h-[140px] whitespace-pre-line rounded-2xl bg-slate-950 p-5 text-2xl font-black leading-relaxed text-white">
              {englishResult ||
                tr("translate_english_result", "English message appears here.")}
            </div>

            <p className="mt-3 text-xs font-bold text-slate-400">
              {tr(
                "translate_privacy_note",
                "Short messages translate best. If translation is unavailable, the original text remains visible."
              )}
            </p>
          </section>
        </div>
      </div>
    </PageCard>
  );
}
