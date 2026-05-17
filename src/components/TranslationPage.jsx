import { useEffect, useMemo, useState } from "react";
import { Languages, MessageSquareText, RefreshCcw } from "lucide-react";
import PageCard from "./PageCard.jsx";
import { setPassengerLanguage } from "../services/rideSessionService.js";

// ===== SUPPORTED PASSENGER LANGUAGES =====
// This list controls the dropdown in the passenger translation helper.
// The app-wide supportedLanguages list can be centralized later if needed.
const supportedLanguages = [
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

// ===== QUICK QUESTION SOURCE PHRASES =====
// These remain English internally so the driver-facing result stays predictable.
const passengerQuickQuestions = [
  "Can you make it cooler?",
  "Can you make it warmer?",
  "Can you lower the music?",
  "Can you open the window?",
  "Can you close the window?",
  "Can I make a quick stop?",
  "I feel car sick.",
  "How much longer is the ride?",
  "Are we going to the right place?",
  "I need help communicating.",
];

// ===== TEMPORARY MOCK TRANSLATIONS =====
// This is not a real translation API.
// It allows Spanish/French quick-question testing until a backend/API layer exists.
const mockPassengerTranslations = {
  es: {
    "Can you make it cooler?": "¿Puede ponerlo más fresco?",
    "Can you make it warmer?": "¿Puede ponerlo más caliente?",
    "Can you lower the music?": "¿Puede bajar la música?",
    "Can you open the window?": "¿Puede abrir la ventana?",
    "Can you close the window?": "¿Puede cerrar la ventana?",
    "Can I make a quick stop?": "¿Puedo hacer una parada rápida?",
    "I feel car sick.": "Me siento mareado.",
    "How much longer is the ride?": "¿Cuánto falta para llegar?",
    "Are we going to the right place?": "¿Vamos al lugar correcto?",
    "I need help communicating.": "Necesito ayuda para comunicarme.",
  },

  fr: {
    "Can you make it cooler?": "Pouvez-vous mettre un peu plus frais ?",
    "Can you make it warmer?": "Pouvez-vous mettre un peu plus chaud ?",
    "Can you lower the music?": "Pouvez-vous baisser la musique ?",
    "Can you open the window?": "Pouvez-vous ouvrir la fenêtre ?",
    "Can you close the window?": "Pouvez-vous fermer la fenêtre ?",
    "Can I make a quick stop?": "Puis-je faire un arrêt rapide ?",
    "I feel car sick.": "J’ai le mal des transports.",
    "How much longer is the ride?": "Combien de temps reste-t-il ?",
    "Are we going to the right place?": "Allons-nous au bon endroit ?",
    "I need help communicating.": "J’ai besoin d’aide pour communiquer.",
  },
};

// ===== MOCK TRANSLATION HELPERS =====
// Real dynamic translation should eventually happen through a backend/API,
// then be cached/stored so the passenger screen stays fast.
function mockTranslatePassengerToEnglish(text, passengerLanguage) {
  const trimmed = text.trim();

  if (!trimmed) return "";

  const matchingEnglishPhrase = passengerQuickQuestions.find(
    (phrase) => mockPassengerTranslations[passengerLanguage]?.[phrase] === trimmed
  );

  if (matchingEnglishPhrase) return matchingEnglishPhrase;

  return `[Mock English translation]\n${trimmed}`;
}

function mockTranslateEnglishToPassenger(text, passengerLanguage) {
  const trimmed = text.trim();

  if (!trimmed) return "";

  return (
    mockPassengerTranslations[passengerLanguage]?.[trimmed] ||
    `[Mock passenger-language translation]\n${trimmed}`
  );
}

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

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== SELECTED LANGUAGE LABEL =====
  const selectedLanguageLabel = useMemo(
    () =>
      supportedLanguages.find((language) => language.code === selectedLanguage)
        ?.label || "Selected language",
    [selectedLanguage]
  );

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

  // ===== QUICK QUESTION HANDLER =====
  function useQuickQuestion(question) {
    const passengerLanguageText =
      selectedLanguage === "en"
        ? question
        : mockTranslateEnglishToPassenger(question, selectedLanguage);

    setPassengerText(passengerLanguageText);
    setEnglishResult(question);
  }

  // ===== PASSENGER TEXT TO ENGLISH =====
  function translateToEnglish() {
    const result =
      selectedLanguage === "en"
        ? passengerText.trim()
        : mockTranslatePassengerToEnglish(passengerText, selectedLanguage);

    setEnglishResult(result);
  }

  return (
    <div className="grid gap-5">
      {/* ===== PAGE HEADER ===== */}
      <PageCard>
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
                  "translate_subtitle",
                  "Choose your language and send simple questions to the driver."
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
      </PageCard>

      {/* ===== LANGUAGE SELECTION ===== */}
      <PageCard>
        <div className="grid gap-4 md:grid-cols-[280px_1fr] md:items-end">
          <div>
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

          <div className="rounded-2xl bg-slate-100 p-4">
            <div className="text-sm font-black uppercase tracking-wide text-slate-500">
              {tr("translate_current_setup", "Current setup")}
            </div>

            <div className="mt-1 text-2xl font-black text-slate-950">
              {selectedLanguageLabel} → English
            </div>
          </div>
        </div>
      </PageCard>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        {/* ===== PASSENGER TO DRIVER TRANSLATION PANEL ===== */}
        <PageCard>
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
                  "translate_type_or_tap",
                  "Type or tap a question. The English version appears for the driver."
                )}
              </p>
            </div>
          </div>

          <textarea
            value={passengerText}
            onChange={(event) => setPassengerText(event.target.value)}
            placeholder={`${tr("translate_type_in", "Type in")} ${selectedLanguageLabel}...`}
            rows={5}
            className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200"
          />

          <button
            type="button"
            onClick={translateToEnglish}
            className="mt-3 w-full rounded-2xl bg-slate-950 p-4 text-lg font-black text-white"
          >
            {tr("translate_to_english", "Translate to English")}
          </button>

          <div className="mt-4 min-h-[120px] whitespace-pre-line rounded-2xl bg-slate-950 p-5 text-2xl font-black leading-relaxed text-white">
            {englishResult ||
              tr("translate_english_result", "English message appears here.")}
          </div>
        </PageCard>

        {/* ===== QUICK QUESTIONS ===== */}
        <PageCard>
          <h3 className="text-2xl font-black text-slate-950">
            {tr("translate_quick_questions", "Passenger quick questions")}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {tr(
              "translate_quick_questions_subtitle",
              "Tap one to show the driver what you need."
            )}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {passengerQuickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => useQuickQuestion(question)}
                className="min-h-[72px] rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-black leading-snug text-slate-800 transition hover:bg-slate-100"
              >
                {selectedLanguage === "en"
                  ? question
                  : mockTranslateEnglishToPassenger(question, selectedLanguage)}
              </button>
            ))}
          </div>
        </PageCard>
      </div>

      {/* ===== TEMPORARY API NOTICE ===== */}
      <PageCard>
        <div className="rounded-2xl bg-amber-100 p-4 text-sm font-bold text-amber-900">
          {tr(
            "translate_api_notice",
            "Translation API is not connected yet. Language selection now syncs to the driver console."
          )}
        </div>
      </PageCard>
    </div>
  );
}
