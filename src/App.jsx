import { useEffect, useMemo, useRef, useState } from "react";
import NavButton from "./components/layout/NavButton.jsx";
import { passengerNavItems } from "./config/navItems.js";
import HomePage from "./components/pages/HomePage.jsx";
import GuestbookPage from "./components/pages/GuestbookPage.jsx";
import AdsPage from "./components/pages/AdsPage.jsx";
import LocalPage from "./components/pages/LocalPage.jsx";
import GamesPage from "./components/pages/GamesPage.jsx";
import WeatherPage from "./components/pages/WeatherPage.jsx";
import RequestsPage from "./components/pages/RequestsPage.jsx";
import FlightCheckerPage from "./components/pages/FlightCheckerPage.jsx";
import MirrorPage from "./components/pages/MirrorPage.jsx";
import TranslationPage from "./components/pages/TranslationPage.jsx";
import AdminPage from "./components/admin/AdminPage.jsx";
import DriverConsolePage from "./components/console/DriverConsolePage.jsx";

import { createTranslator } from "./data/translations.js";
import { setPassengerLanguage } from "./services/rideSessionService.js";
// ===== ADMIN CONTENT SERVICE =====
import {
  loadAdminContent,
  loadSharedAdminContent,
  saveSharedAdminContentSnapshot,
  subscribeToSharedAdminContent,
  saveDriverProfile,
  saveTipOptions,
  saveAds,
  saveGuestbookEntries,
  saveRequestCategories,
  saveAdminPin,
} from "./services/adminContentService.js";
import {
  loadAppSettings,
  loadSharedAppSettings,
  saveSharedAppSettingsSnapshot,
  subscribeToSharedAppSettings,
  saveAppSettings,
} from "./services/appSettingsService.js";

export default function App() {
  // ===== ROUTE DETECTION =====
  const pathname = window.location.pathname;
  const isDriverConsole = pathname === "/console";
  const isAdminPage = pathname === "/admin";

  // ===== ADMIN-MANAGED CONTENT INITIAL LOAD =====
  const initialAdminContent = useMemo(() => loadAdminContent(), []);

  // ===== APP SETTINGS INITIAL LOAD =====
  const initialAppSettings = useMemo(() => loadAppSettings(), []);

  // ===== PASSENGER UI STATE =====
  const [page, setPage] = useState("home");
  const [appLanguage, setAppLanguage] = useState("en");

  // ===== APP SETTINGS STATE =====
  const [appSettings, setAppSettings] = useState(() => initialAppSettings);

  // ===== FIRESTORE SYNC STATE =====
  // Prevents the local fallback/default state from overwriting Firestore before
  // the initial shared load attempt finishes.
  const [sharedStateReady, setSharedStateReady] = useState(false);
  const lastSharedAdminContentJsonRef = useRef("");
  const lastSharedAppSettingsJsonRef = useRef("");

  // ===== GUESTBOOK STATE =====
  const [entries, setEntries] = useState(() => initialAdminContent.entries);

  // ===== ADS STATE =====
  const [ads, setAds] = useState(() => initialAdminContent.ads);

  // ===== ADMIN PIN STATE =====
  const [adminPin, setAdminPin] = useState(() => initialAdminContent.adminPin);

  // ===== REQUEST CATEGORIES STATE =====
  const [requestCategories, setRequestCategories] = useState(
    () => initialAdminContent.requestCategories
  );

  // ===== DRIVER PROFILE STATE =====
  const [driverProfile, setDriverProfile] = useState(
    () => initialAdminContent.driverProfile
  );

  // ===== TIP OPTIONS STATE =====
  const [tipOptions, setTipOptions] = useState(
    () => initialAdminContent.tipOptions
  );

  // ===== TRANSLATION SETUP =====
  const t = useMemo(() => createTranslator(appLanguage), [appLanguage]);

  // ===== DERIVED DISPLAY DATA =====
  const featuredAd = useMemo(() => ads.find((ad) => ad.active), [ads]);

  // ===== SHARED STATE NORMALIZERS =====
  function normalizeSharedAdminContent(sharedContent = {}) {
    return {
      entries: sharedContent.entries || [],
      ads: sharedContent.ads || [],
      adminPin: sharedContent.adminPin || adminPin,
      requestCategories: sharedContent.requestCategories || {},
      driverProfile: sharedContent.driverProfile || driverProfile,
      tipOptions: sharedContent.tipOptions || [],
    };
  }

  function applySharedAdminContent(sharedContent) {
    const normalizedContent = normalizeSharedAdminContent(sharedContent);

    lastSharedAdminContentJsonRef.current =
      JSON.stringify(normalizedContent);

    setEntries(normalizedContent.entries);
    setAds(normalizedContent.ads);
    setAdminPin(normalizedContent.adminPin);
    setRequestCategories(normalizedContent.requestCategories);
    setDriverProfile(normalizedContent.driverProfile);
    setTipOptions(normalizedContent.tipOptions);
  }

  function applySharedAppSettings(sharedSettings) {
    if (!sharedSettings) return;

    lastSharedAppSettingsJsonRef.current =
      JSON.stringify(sharedSettings);

    setAppSettings(sharedSettings);
  }

  // ===== OPTIONAL FIRESTORE INITIAL LOAD =====
  // Local storage is still the immediate fallback. If shared Firestore content
  // exists, it replaces the local initial state after the app mounts.
  useEffect(() => {
    let mounted = true;

    async function loadSharedState() {
      try {
        const [sharedContent, sharedSettings] = await Promise.all([
          loadSharedAdminContent(),
          loadSharedAppSettings(),
        ]);

        if (!mounted) return;

        if (sharedContent) {
          applySharedAdminContent(sharedContent);
        }

        if (sharedSettings) {
          applySharedAppSettings(sharedSettings);
        }
      } catch (error) {
        console.error("Failed to load shared Firestore state:", error);
      } finally {
        if (mounted) {
          setSharedStateReady(true);
        }
      }
    }

    loadSharedState();

    return () => {
      mounted = false;
    };
    // Run once on mount. Local values are immediate fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== LIVE FIRESTORE ADMIN CONTENT / SETTINGS SYNC =====
  // Keeps passenger tablets and other open Admin pages current without refresh.
  // Remote snapshots are remembered so the local persistence effects below do
  // not immediately write the same snapshot back to Firestore.
  useEffect(() => {
    const unsubscribeContent = subscribeToSharedAdminContent((sharedContent) => {
      if (!sharedContent) return;
      applySharedAdminContent(sharedContent);
      setSharedStateReady(true);
    });

    const unsubscribeSettings = subscribeToSharedAppSettings((sharedSettings) => {
      if (!sharedSettings) return;
      applySharedAppSettings(sharedSettings);
      setSharedStateReady(true);
    });

    return () => {
      if (unsubscribeContent) unsubscribeContent();
      if (unsubscribeSettings) unsubscribeSettings();
    };
    // Run once. Helper functions intentionally use current state fallbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== APP SETTINGS PERSISTENCE =====
  useEffect(() => {
    saveAppSettings(appSettings);

    if (!sharedStateReady) return;

    const settingsJson = JSON.stringify(appSettings);

    if (settingsJson === lastSharedAppSettingsJsonRef.current) {
      return;
    }

    lastSharedAppSettingsJsonRef.current = settingsJson;
    saveSharedAppSettingsSnapshot(appSettings);
  }, [appSettings, sharedStateReady]);

  // ===== DRIVER PROFILE PERSISTENCE =====
  useEffect(() => {
    saveDriverProfile(driverProfile);
  }, [driverProfile]);

  // ===== TIP OPTIONS PERSISTENCE =====
  useEffect(() => {
    saveTipOptions(tipOptions);
  }, [tipOptions]);

  // ===== ADS PERSISTENCE =====
  useEffect(() => {
    saveAds(ads);
  }, [ads]);

  // ===== GUESTBOOK PERSISTENCE =====
  useEffect(() => {
    saveGuestbookEntries(entries);
  }, [entries]);

  // ===== REQUEST CATEGORIES PERSISTENCE =====
  useEffect(() => {
    saveRequestCategories(requestCategories);
  }, [requestCategories]);

  // ===== ADMIN PIN PERSISTENCE =====
  useEffect(() => {
    saveAdminPin(adminPin);
  }, [adminPin]);

  // ===== SHARED FIRESTORE ADMIN CONTENT SNAPSHOT =====
  // Local saves above remain the immediate fallback. Once the initial shared
  // load attempt finishes, any admin-managed content change writes one combined
  // snapshot to Firestore for other devices to load later.
  useEffect(() => {
    if (!sharedStateReady) return;

    const contentSnapshot = {
      entries,
      ads,
      adminPin,
      requestCategories,
      driverProfile,
      tipOptions,
    };

    const contentJson = JSON.stringify(contentSnapshot);

    if (contentJson === lastSharedAdminContentJsonRef.current) {
      return;
    }

    lastSharedAdminContentJsonRef.current = contentJson;
    saveSharedAdminContentSnapshot(contentSnapshot);
  }, [
    entries,
    ads,
    adminPin,
    requestCategories,
    driverProfile,
    tipOptions,
    sharedStateReady,
  ]);

  // ===== PASSENGER SCREEN AUTO-RESET =====
  useEffect(() => {
    if (isDriverConsole || isAdminPage) return undefined;

    const resetDelay = 5 * 60 * 1000;
    let resetTimer;

    function resetPassengerScreenTimer() {
      clearTimeout(resetTimer);

      resetTimer = setTimeout(() => {
        setPage("home");
        setAppLanguage("en");

        setPassengerLanguage("en").catch((error) => {
          console.error("Failed to reset passenger language:", error);
        });
      }, resetDelay);
    }

    const activityEvents = ["click", "touchstart", "keydown"];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetPassengerScreenTimer);
    });

    resetPassengerScreenTimer();

    return () => {
      clearTimeout(resetTimer);

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetPassengerScreenTimer);
      });
    };
  }, [isDriverConsole, isAdminPage]);

  // ===== DRIVER CONSOLE ROUTE =====
  if (isDriverConsole) {
    return <DriverConsolePage />;
  }

  // ===== ADMIN ROUTE =====
  if (isAdminPage) {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-slate-950 md:p-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-5 text-white">
            <div className="text-sm font-bold uppercase tracking-[.25em] text-white/50">
              Driver Administration
            </div>

            <div className="text-3xl font-black">
              Ride Companion Admin
            </div>
          </header>

          <AdminPage
            entries={entries}
            setEntries={setEntries}
            ads={ads}
            setAds={setAds}
            adminPin={adminPin}
            setAdminPin={setAdminPin}
            requestCategories={requestCategories}
            setRequestCategories={setRequestCategories}
            driverProfile={driverProfile}
            setDriverProfile={setDriverProfile}
            tipOptions={tipOptions}
            setTipOptions={setTipOptions}
            appSettings={appSettings}
            setAppSettings={setAppSettings}
          />
        </div>
      </main>
    );
  }


  function navLabel(item) {
    const translated = t(item.labelKey);
    return translated === item.labelKey ? item.fallbackLabel : translated;
  }

  // ===== PASSENGER APP SHELL =====
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 text-white">
            <div className="text-2xl font-black leading-tight md:text-3xl">
              Ride Companion MVP
            </div>

            <div className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-white/60">
              Passenger
            </div>
          </div>

          <nav
            className="grid gap-2 rounded-3xl bg-white/10 p-2 backdrop-blur"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))" }}
          >
            {passengerNavItems.map((item) => (
              <NavButton
                key={item.id}
                active={page === item.id}
                icon={item.icon}
                label={navLabel(item)}
                onClick={() => setPage(item.id)}
              />
            ))}
          </nav>
        </header>

        {page === "home" && (
          <HomePage
            setPage={setPage}
            featuredAd={featuredAd}
            driverProfile={driverProfile}
            tipOptions={tipOptions}
            appLanguage={appLanguage}
            t={t}
          />
        )}

        {page === "local" && <LocalPage t={t} appSettings={appSettings} />}

        {page === "guestbook" && (
          <GuestbookPage entries={entries} setEntries={setEntries} t={t} />
        )}

        {page === "ads" && <AdsPage ads={ads} t={t} />}

        {page === "games" && <GamesPage t={t} />}

        {page === "weather" && <WeatherPage t={t} appSettings={appSettings} />}

        {page === "requests" && (
          <RequestsPage requestCategories={requestCategories} t={t} />
        )}

        {page === "flights" && <FlightCheckerPage t={t} />}

        {page === "mirror" && <MirrorPage t={t} />}

        {page === "translate" && (
          <TranslationPage
            appLanguage={appLanguage}
            setAppLanguage={setAppLanguage}
            t={t}
          />
        )}
      </div>
    </main>
  );
}
