// ===== PASSENGER LOCAL DEALS / ADS PAGE =====
// Displays active local deals configured in Admin.
// Supports future manually translated headline/description fields while
// preserving original admin-entered ad content as fallback.

import PageCard from "../layout/PageCard.jsx";

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

  // ===== DYNAMIC AD TRANSLATION HELPER =====
  // Future-ready support for manually translated ad fields.
  // If an ad has headlineTranslations.es or descriptionTranslations.es,
  // the passenger page will show that text when appLanguage is "es".
  function getTranslatedAdField(ad, field) {
    const translationKey = `${field}Translations`;
    return ad?.[translationKey]?.[appLanguage]?.trim() || ad?.[field] || "";
  }

  // ===== ACTIVE ADS ONLY =====
  const activeAds = ads.filter((ad) => ad.active);

  return (
    <PageCard>
      {/* ===== PAGE HEADER ===== */}
      <h2 className="text-3xl font-black text-slate-950">
        {tr("ads_title", "Local Deals")}
      </h2>

      <p className="mt-2 text-slate-600">
        {tr(
          "ads_subtitle",
          "Passenger-friendly local businesses and promotions."
        )}
      </p>

      {/* ===== EMPTY STATE ===== */}
      {activeAds.length === 0 && (
        <div className="mt-5 rounded-3xl bg-slate-100 p-6 text-center font-bold text-slate-500">
          {tr("ads_empty", "No local deals are available right now.")}
        </div>
      )}

      {/* ===== ACTIVE AD CARDS ===== */}
      {activeAds.length > 0 && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {activeAds.map((ad) => {
            const headline = getTranslatedAdField(ad, "headline");
            const description = getTranslatedAdField(ad, "description");

            return (
              <div
                key={ad.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-2xl font-black text-slate-950">
                  {ad.businessName}
                </div>

                {headline && (
                  <div className="mt-1 text-lg font-bold text-slate-700">
                    {headline}
                  </div>
                )}

                {description && (
                  <p className="mt-3 text-slate-600">
                    {description}
                  </p>
                )}

                {ad.category && (
                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
                    {ad.category}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageCard>
  );
}
