import { useEffect, useMemo, useState } from "react";
import {
  Gamepad2,
  HandCoins,
  MapPin,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";

const DEFAULT_SLIDE_MS = 7000;

export default function PassengerAttractMode({
  visible = false,
  onDismiss,
  onNavigate,
  driverName = "",
  featuredAd = null,
  t = (key) => key,
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  const slides = useMemo(
    () => [
      {
        id: "welcome",
        icon: Sparkles,
        eyebrow: tr("attract_welcome_eyebrow", "Welcome"),
        title: tr(
          "attract_welcome_title",
          "Feel free to use me during your trip."
        ),
        body: tr(
          "attract_welcome_body",
          "Play a quick game, find local spots, send a request, or just explore while you ride."
        ),
        actionLabel: tr("attract_welcome_action", "Start exploring"),
        actionPage: "home",
      },
      {
        id: "local",
        icon: MapPin,
        eyebrow: tr("attract_local_eyebrow", "Local spots"),
        title: tr(
          "attract_local_title",
          "Looking for a place to shop or have dinner tonight?"
        ),
        body: tr(
          "attract_local_body",
          "Search nearby restaurants, stores, coffee, gas, entertainment, and more from the tablet."
        ),
        actionLabel: tr("attract_local_action", "Search local spots"),
        actionPage: "local",
      },
      {
        id: "games",
        icon: Gamepad2,
        eyebrow: tr("attract_games_eyebrow", "Ride games"),
        title: tr("attract_games_title", "Want something quick to play?"),
        body: tr(
          "attract_games_body",
          "Try trivia, bingo, emoji guessing, cards, or other ride-friendly games."
        ),
        actionLabel: tr("attract_games_action", "Play a game"),
        actionPage: "games",
      },
      {
        id: "requests",
        icon: MessageSquareHeart,
        eyebrow: tr("attract_requests_eyebrow", "Need something?"),
        title: tr("attract_requests_title", "Send a quick ride request."),
        body: tr(
          "attract_requests_body",
          "Need the temperature adjusted, a stop, quiet time, or help with comfort? Tap Requests."
        ),
        actionLabel: tr("attract_requests_action", "Send request"),
        actionPage: "requests",
      },
      {
        id: "tips",
        icon: HandCoins,
        eyebrow: tr("attract_tips_eyebrow", "Enjoying your trip?"),
        title: tr("attract_tips_title", "Please consider tipping your driver."),
        body: tr(
          "attract_tips_body",
          "You can tip through your ride app, or use this tablet to tip directly if your driver has direct tips set up."
        ),
        actionLabel: tr("attract_tips_action", "Tip options"),
        actionPage: "home",
      },
    ],
    [t]
  );

  const effectiveSlides = useMemo(() => {
    if (!featuredAd?.businessName && !featuredAd?.headline) return slides;

    return [
      ...slides.slice(0, 2),
      {
        id: "featured-deal",
        icon: MapPin,
        eyebrow: tr("attract_deal_eyebrow", "Featured deal"),
        title: featuredAd.businessName || tr("attract_deal_title", "Local deal"),
        body:
          featuredAd.headline ||
          featuredAd.description ||
          tr("attract_deal_body", "Check out today’s featured local offer."),
        actionLabel: tr("attract_deal_action", "View deals"),
        actionPage: "ads",
      },
      ...slides.slice(2),
    ];
  }, [featuredAd, slides, t]);

  const activeSlide = effectiveSlides[slideIndex % effectiveSlides.length];
  const Icon = activeSlide?.icon || Sparkles;

  useEffect(() => {
    if (!visible) {
      setSlideIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % effectiveSlides.length);
    }, DEFAULT_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [visible, effectiveSlides.length]);

  useEffect(() => {
    if (!visible) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onDismiss?.();
        return;
      }

      onDismiss?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onDismiss]);

  if (!visible || !activeSlide) return null;

  function goToPage(page) {
    onNavigate?.(page);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/95 p-5 text-white backdrop-blur"
      onPointerDown={onDismiss}
    >
      <div
        className="relative flex min-h-[min(74vh,620px)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-2xl"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-[2rem] bg-white p-5 text-slate-950 shadow-lg">
            <Icon size={58} />
          </div>

          <div className="text-sm font-black uppercase tracking-[.35em] text-cyan-200/80">
            {activeSlide.eyebrow}
          </div>

          <h1 className="mt-4 max-w-4xl text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[.95]">
            {activeSlide.title}
          </h1>

          <p className="mt-6 max-w-3xl text-balance text-[clamp(1.1rem,2vw,1.7rem)] font-bold leading-relaxed text-white/70">
            {activeSlide.body}
          </p>

          {driverName && (
            <div className="mt-5 rounded-full bg-white/10 px-5 py-2 text-sm font-black text-white/60">
              {tr("attract_driver_label", "Your driver")}: {driverName}
            </div>
          )}
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex justify-center gap-2 sm:justify-start">
            {effectiveSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSlideIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === slideIndex % effectiveSlides.length
                    ? "w-10 bg-cyan-200"
                    : "w-3 bg-white/25"
                }`}
                aria-label={`Show ${slide.eyebrow}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => goToPage(activeSlide.actionPage)}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg"
            >
              {activeSlide.actionLabel}
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white"
            >
              {tr("attract_dismiss", "Use tablet")}
            </button>
          </div>
        </div>

        <div className="relative mt-4 text-center text-xs font-bold uppercase tracking-[.25em] text-white/35">
          {tr("attract_tap_anywhere", "Tap anywhere to begin")}
        </div>
      </div>
    </div>
  );
}
