// ===== PASSENGER HOME PAGE =====
// Displays driver profile, manual driver text translations, featured ad,
// direct tipping modal entry point, and quick navigation buttons.

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareHeart, QrCode, ShieldCheck, Store } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import TipModal from "../shared/TipModal.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { getTranslatedField } from "../../utils/dynamicFields.js";

export default function HomePage({
  setPage,
  featuredAd,
  driverProfile,
  tipOptions,
  appLanguage = "en",
  t = (key) => key,
}) {
  // ===== TIP MODAL STATE =====
  const [tipModalOpen, setTipModalOpen] = useState(false);

  // ===== TIP OPTION AVAILABILITY =====
  const hasTipOptions = tipOptions.some(
    (option) => option.platform?.trim() && option.url?.trim()
  );

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== DYNAMIC FIELD TRANSLATION FALLBACKS =====
  // Prefer manually supplied selected-language text, otherwise default to the
  // English/admin-entered field.
  const translatedBio = getTranslatedField(driverProfile, "bio", appLanguage);
  const translatedLocalTip = getTranslatedField(
    driverProfile,
    "localTip",
    appLanguage
  );

  const featuredBusinessName = getTranslatedField(
    featuredAd,
    "businessName",
    appLanguage
  );
  const featuredHeadline = getTranslatedField(featuredAd, "headline", appLanguage);
  const featuredDescription = getTranslatedField(
    featuredAd,
    "description",
    appLanguage
  );

  return (
    <div className={`grid gap-5 lg:grid-cols-[1.2fr_.8fr] ${PAGE_FRAME_CLASS}`}>
      {/* ===== DRIVER WELCOME CARD ===== */}
      <PageCard className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-white to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-full min-h-0 flex-col justify-between"
        >
          <div className="min-h-0 flex-1">
            <div className="shrink-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                <ShieldCheck size={18} />
                {tr("home_welcome_badge", "Welcome to your ride")}
              </div>

              <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl bg-slate-200 shadow-inner">
                  {driverProfile.photo ? (
                    <img
                      src={driverProfile.photo}
                      alt="Driver profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShieldCheck size={56} className="text-slate-400" />
                  )}
                </div>

                <div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-950 xl:text-5xl">
                    {tr("home_meet", "Meet")}{" "}
                    {driverProfile.name || tr("home_driver", "Your Driver")}
                  </h1>
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-[calc(100%-12rem)] overflow-y-auto pr-1">
              <p className="max-w-2xl text-lg leading-relaxed text-slate-700 xl:text-xl">
                {translatedBio ||
                  tr(
                    "home_default_bio",
                    "Relax, play some trivia, check out local deals, or leave a note in the guestbook."
                  )}
              </p>

              {translatedLocalTip && (
                <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="text-xs font-bold uppercase tracking-wide text-white/50">
                    {tr("home_local_tip", "Driver's local tip")}
                  </div>

                  <div className="mt-1 font-bold">
                    {translatedLocalTip}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== HOME QUICK ACTION BUTTONS ===== */}
          <div className="mt-5 grid shrink-0 gap-3 sm:grid-cols-3">
            <button
              onClick={() => setPage("guestbook")}
              className="rounded-2xl bg-slate-950 p-4 text-left text-white shadow-lg"
            >
              <MessageSquareHeart className="mb-3" />

              <div className="font-bold">
                {tr("home_guestbook", "Sign Guestbook")}
              </div>

              <div className="text-sm text-white/70">
                {tr("home_guestbook_sub", "Leave a friendly note")}
              </div>
            </button>

            <button
              onClick={() => setPage("ads")}
              className="rounded-2xl bg-slate-950 p-4 text-left text-white shadow-lg"
            >
              <Store className="mb-3" />

              <div className="font-bold">
                {tr("home_local_deals", "Local Deals")}
              </div>

              <div className="text-sm text-white/70">
                {tr("home_local_deals_sub", "See nearby offers")}
              </div>
            </button>

            <button
              onClick={() => setPage("requests")}
              className="rounded-2xl bg-slate-950 p-4 text-left text-white shadow-lg"
            >
              <MessageSquareHeart className="mb-3" />

              <div className="font-bold">
                {tr("home_requests", "Ride Requests")}
              </div>

              <div className="text-sm text-white/70">
                {tr("home_requests_sub", "Ask for comfort help")}
              </div>
            </button>
          </div>
        </motion.div>
      </PageCard>

      <div className="grid h-full min-h-0 content-start gap-5 overflow-y-auto pr-1">
        {/* ===== TIPS / REVIEWS CARD ===== */}
        <PageCard className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <QrCode />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                {tr("home_tips_reviews", "Tips & Reviews")}
              </h2>

              <p className="text-slate-600">
                {tr(
                  "home_tips_reviews_sub",
                  "Optional direct tips, separate from the gig platform."
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTipModalOpen(true)}
            disabled={!hasTipOptions}
            className="mt-5 w-full rounded-3xl bg-slate-950 p-4 text-center text-xl font-black text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500"
          >
            {hasTipOptions
              ? tr("home_tip_now", "Tip Now")
              : tr("home_tip_unavailable", "Tips Not Set Up Yet")}
          </button>

          <p className="mt-3 text-center text-sm text-slate-500">
            {tr(
              "home_tip_footer",
              "Thank you! Direct tips are completely optional and handled outside the rideshare or delivery app."
            )}
          </p>
        </PageCard>

        {/* ===== FEATURED LOCAL DEAL CARD ===== */}
        {featuredAd && (
          <PageCard className="min-w-0 shrink-0 overflow-hidden">
            <div className="mb-2 min-w-0 break-words text-xs font-bold uppercase tracking-wide text-slate-500">
              {tr("home_featured_deal", "Featured local deal")}
            </div>

            <h3 className="min-w-0 break-words text-2xl font-black leading-tight text-slate-950">
              {featuredBusinessName}
            </h3>

            <p className="mt-1 min-w-0 break-words font-bold leading-snug text-slate-700">
              {featuredHeadline}
            </p>

            <p className="mt-2 min-w-0 break-words text-slate-600">
              {featuredDescription}
            </p>
          </PageCard>
        )}
      </div>

      {/* ===== DIRECT TIP MODAL ===== */}
      {tipModalOpen && (
        <TipModal
          tipOptions={tipOptions}
          onClose={() => setTipModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}
