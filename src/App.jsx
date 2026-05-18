import { useEffect, useMemo, useState } from "react";
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
          setEntries(sharedContent.entries || []);
          setAds(sharedContent.ads || []);
          setAdminPin(sharedContent.adminPin || adminPin);
          setRequestCategories(sharedContent.requestCategories || {});
          setDriverProfile(sharedContent.driverProfile || driverProfile);
          setTipOptions(sharedContent.tipOptions || []);
        }

        if (sharedSettings) {
          setAppSettings(sharedSettings);
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

  // ===== APP SETTINGS PERSISTENCE =====
  useEffect(() => {
    saveAppSettings(appSettings);

    if (!sharedStateReady) return;

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

    saveSharedAdminContentSnapshot({
      entries,
      ads,
      adminPin,
      requestCategories,
      driverProfile,
      tipOptions,
    });
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
