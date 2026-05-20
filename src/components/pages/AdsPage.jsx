// ===== PASSENGER LOCAL DEALS / ADS PAGE =====
// Displays active local deals configured in Admin.
// Supports future manually translated headline/description fields while
// preserving original admin-entered ad content as fallback.

import { useEffect, useMemo, useState } from "react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { getTranslatedField } from "../../utils/dynamicFields.js";
import { translateRuntimeFields } from "../../services/runtimeDynamicTranslationService.js";

export default function AdsPage({
  ads = [],
  appLanguage = "en",
  t = (key) => key,
}) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== ACTIVE ADS ONLY =====
  const activeAds = useMemo(() => ads.filter((ad) => ad.active), [ads]);
  const [runtimeAdTranslations, setRuntimeAdTranslations] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function translateAdsForTablet() {
      if (!appLanguage || appLanguage === "en" || activeAds.length === 0) {
        setRuntimeAdTranslations({});
        return;
      }

      try {
        const translatedEntries = await Promise.all(
          activeAds.map(async (ad) => [
            ad.id,
            await translateRuntimeFields(
              ad,
              ["businessName", "headline", "description", "category"],
              appLanguage
            ),
          ])
        );

        if (!cancelled) {
          setRuntimeAdTranslations(Object.fromEntries(translatedEntries));
        }
      } catch (error) {
        console.error("Runtime ad translation failed:", error);

        if (!cancelled) {
          setRuntimeAdTranslations({});
        }
      }
    }

    translateAdsForTablet();

    return () => {
      cancelled = true;
    };
  }, [activeAds, appLanguage]);

  return (
    <PageCard className={`${PAGE_FRAME_CLASS} flex min-h-0 flex-col overflow-hidden`}>
      {/* ===== PAGE HEADER ===== */}
      <div className="shrink-0">
        <h2 className="text-3xl font-black text-slate-950">
          {tr("ads_title", "Local Deals")}
        </h2>

        <p className="mt-2 text-slate-600">
          {tr(
            "ads_subtitle",
            "Passenger-friendly local businesses and promotions."
          )}
        </p>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">

      {/* ===== EMPTY STATE ===== */}
      {activeAds.length === 0 && (
        <div className="rounded-3xl bg-slate-100 p-6 text-center font-bold text-slate-500">
          {tr("ads_empty", "No local deals are available right now.")}
        </div>
      )}

      {/* ===== ACTIVE AD CARDS ===== */}
      {activeAds.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {activeAds.map((ad) => {
            const runtimeFields = runtimeAdTranslations[ad.id] || {};
            const businessName =
              runtimeFields.businessName ||
              getTranslatedField(ad, "businessName", appLanguage);
            const headline =
              runtimeFields.headline || getTranslatedField(ad, "headline", appLanguage);
            const description =
              runtimeFields.description ||
              getTranslatedField(ad, "description", appLanguage);
            const category =
              runtimeFields.category || getTranslatedField(ad, "category", appLanguage);

            return (
              <div
                key={ad.id}
                className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="min-w-0 break-words text-2xl font-black leading-tight text-slate-950">
                  {businessName}
                </div>

                {headline && (
                  <div className="mt-1 min-w-0 break-words text-lg font-bold leading-snug text-slate-700">
                    {headline}
                  </div>
                )}

                {description && (
                  <p className="mt-3 min-w-0 break-words text-slate-600">
                    {description}
                  </p>
                )}

                {category && (
                  <div className="mt-4 inline-flex max-w-full break-words rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
                    {category}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </PageCard>
  );
}
