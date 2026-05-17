import { useEffect, useMemo, useState } from "react";
import { Languages, MessageSquareText, RefreshCcw } from "lucide-react";
import { listenToRideSession } from "../services/rideSessionService.js";

// ===== SUPPORTED PASSENGER LANGUAGES =====
// Mirrors the passenger TranslationPage language list.
// This can be centralized later when translation architecture is modularized.
const languages = [
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

// ===== DRIVER QUICK PHRASES =====
// Kept in English internally so the driver-facing intent stays predictable.
const driverQuickPhrases = [
  "Please confirm the destination.",
  "Please wear your seatbelt.",
  "We have arrived.",
  "Do you need the temperature changed?",
  "Do you need a quiet ride?",
  "Do you need a quick stop?",
  "I do not speak this language, but I can use this translator.",
];

// ===== TEMPORARY MOCK TRANSLATIONS =====
// This is not a real translation API.
// It supports Spanish/French testing until a backend/API translation layer exists.
const mockDriverTranslations = {
  es: {
    "Please confirm the destination.": "Por favor confirme el destino.",
    "Please wear your seatbelt.": "Por favor use el cinturón de seguridad.",
    "We have arrived.": "Hemos llegado.",
    "Do you need the temperature changed?": "¿Necesita que cambie la temperatura?",
    "Do you need a quiet ride?": "¿Prefiere un viaje tranquilo?",
    "Do you need a quick stop?": "¿Necesita una parada rápida?",
    "I do not speak this language, but I can use this translator.":
      "No hablo este idioma, pero puedo usar este traductor.",
  },

  fr: {
    "Please confirm the destination.": "Veuillez confirmer la destination.",
    "Please wear your seatbelt.": "Veuillez attacher votre ceinture.",
    "We have arrived.": "Nous sommes arrivés.",
    "Do you need the temperature changed?": "Voulez-vous changer la température ?",
    "Do you need a quiet ride?": "Préférez-vous un trajet calme ?",
    "Do you need a quick stop?": "Avez-vous besoin d’un arrêt rapide ?",
    "I do not speak this language, but I can use this translator.":
      "Je ne parle pas cette langue, mais je peux utiliser ce traducteur.",
  },
};

// ===== MOCK TRANSLATION HELPER =====
// Real translation should eventually happen through a backend/API and be cached.
function mockTranslate(text, targetLanguage) {
  const trimmed = text.trim();

  if (!trimmed) return "";
  if (targetLanguage === "en") return trimmed;

  return (
    mockDriverTranslations[targetLanguage]?.[trimmed] ||
    `[Mock translation]\n${trimmed}`
  );
}

export default function DriverTranslationCard() {
  // ===== LANGUAGE / MESSAGE STATE =====
  const [language, setLanguage] = useState("en");
  const [driverText, setDriverText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  // ===== PASSENGER LANGUAGE LISTENER =====
  // Watches the ride session document so the driver console follows
  // the language selected on the passenger tablet.
  useEffect(() => {
    const unsubscribe = listenToRideSession((session) => {
      if (session?.passengerLanguage) {
        setLanguage(session.passengerLanguage);
        setTranslatedText("");
      }
    });

    return () => unsubscribe();
  }, []);

  // ===== LANGUAGE LABEL =====
  const languageLabel = useMemo(
    () =>
      languages.find((item) => item.code === language)?.label ||
      "Selected language",
    [language]
  );

  // ===== TRANSLATE DRIVER MESSAGE =====
  function translateMessage(text = driverText) {
    setTranslatedText(mockTranslate(text, language));
  }

  // ===== QUICK PHRASE HANDLER =====
  function useQuickPhrase(phrase) {
    setDriverText(phrase);
    translateMessage(phrase);
  }

  // ===== CLEAR TRANSLATION CARD =====
  function clearTranslation() {
    setDriverText("");
    setTranslatedText("");
  }

  return (
    <section className="mt-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
      {/* ===== CARD HEADER ===== */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <Languages />
          </div>

          <div>
            <h2 className="text-xl font-black">Translate</h2>

            <p className="text-sm text-white/50">
              Driver message to passenger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearTranslation}
          className="rounded-xl bg-white/10 p-3 text-white hover:bg-white/20"
          aria-label="Clear translation"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* ===== PASSENGER LANGUAGE STATUS ===== */}
      <div className="mt-4 rounded-2xl bg-white/10 p-3">
        <div className="text-xs font-black uppercase tracking-wide text-white/50">
          Passenger language
        </div>

        <div className="mt-1 text-xl font-black text-white">
          {languageLabel}
        </div>

        <div className="mt-1 text-xs font-bold text-emerald-300">
          Synced from passenger tablet
        </div>
      </div>

      {/* ===== DRIVER QUICK PHRASES ===== */}
      <div className="mt-4 grid gap-2">
        {driverQuickPhrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => useQuickPhrase(phrase)}
            className="rounded-2xl bg-white/5 p-3 text-left text-sm font-bold leading-snug text-white hover:bg-white/10"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* ===== CUSTOM DRIVER MESSAGE ===== */}
      <div className="mt-4 flex items-center gap-2 text-sm font-black text-white/60">
        <MessageSquareText size={16} />
        Custom message
      </div>

      <textarea
        value={driverText}
        onChange={(event) => setDriverText(event.target.value)}
        placeholder="Type a message in English..."
        rows={3}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white p-3 text-base text-slate-950 outline-none"
      />

      <button
        type="button"
        onClick={() => translateMessage()}
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 font-black text-slate-950"
      >
        Translate to {languageLabel}
      </button>

      {/* ===== TRANSLATED RESULT ===== */}
      <div className="mt-4 min-h-[96px] whitespace-pre-line rounded-2xl bg-slate-950 p-4 text-xl font-black leading-relaxed text-white">
        {translatedText || "Translated message appears here."}
      </div>

      {/* ===== TEMPORARY API NOTICE ===== */}
      <p className="mt-3 text-xs font-bold text-white/40">
        Mock translation only. Backend translation API will replace this later.
      </p>
    </section>
  );
}
