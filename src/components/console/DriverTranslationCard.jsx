import { useEffect, useMemo, useState } from "react";
import { Languages } from "lucide-react";
import { listenToRideSession } from "../../services/rideSessionService.js";

// ===== SUPPORTED PASSENGER LANGUAGES =====
// Mirrors the passenger TranslationPage language list.
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

export default function DriverTranslationCard() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const unsubscribe = listenToRideSession((session) => {
      if (session?.passengerLanguage) {
        setLanguage(session.passengerLanguage);
      }
    });

    return () => unsubscribe();
  }, []);

  const languageLabel = useMemo(
    () =>
      languages.find((item) => item.code === language)?.label ||
      "Selected language",
    [language]
  );

  return (
    <section className="rounded-3xl bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <Languages />
        </div>

        <div>
          <h2 className="text-xl font-black">Translation Status</h2>

          <p className="text-sm text-white/50">
            Passenger language is synced from the tablet.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/10 p-3">
        <div className="text-xs font-black uppercase tracking-wide text-white/50">
          Passenger language
        </div>

        <div className="mt-1 text-xl font-black text-white">
          {languageLabel}
        </div>

        <div className="mt-1 text-xs font-bold text-emerald-300">
          Driver message translations use this language.
        </div>
      </div>
    </section>
  );
}
