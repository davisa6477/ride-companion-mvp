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
import {
  getSharedGuestbookEntries,
  listenToSharedGuestbookEntries,
  saveSharedGuestbookEntries,
} from "./services/firestoreGuestbookService.js";
import {
  getSharedAds,
  listenToSharedAds,
  saveSharedAds,
} from "./services/firestoreAdsService.js";
import {
  getSharedDriverProfile,
  listenToSharedDriverProfile,
  saveSharedDriverProfile,
} from "./services/firestoreDriverProfileService.js";
import {
  getSharedTipOptions,
  listenToSharedTipOptions,
  saveSharedTipOptions,
} from "./services/firestoreTipOptionsService.js";
import {
  getSharedRequestCategories,
  listenToSharedRequestCategories,
  saveSharedRequestCategories,
} from "./services/firestoreRequestCategoriesService.js";

export default function App() {
  // ===== ROUTE DETECTION =====
  const pathname = window.location.pathname;
  const isDriverConsole = pathname === "/console";
  const isAdminPage = pathname === "/admin";
  const isPassengerPage = !isDriverConsole && !isAdminPage;

  // ===== FIRESTORE WRITE SCOPE =====
  // Until Firebase Auth/security rules are added, shared Firestore writes are
  // intentionally route-scoped. Admin can write full shared content/settings.
  // Passenger pages can only write guestbook entries in the separate guestbook container.
  const canWriteFullAdminContent = isAdminPage;
  const canWriteAppSettings = isAdminPage;
  const canWriteGuestbookEntries = isAdminPage || isPassengerPage;

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
  const lastSharedGuestbookEntriesJsonRef = useRef("");
  const lastSharedAdsJsonRef = useRef("");
  const lastSharedDriverProfileJsonRef = useRef("");
  const lastSharedTipOptionsJsonRef = useRef("");
  const lastSharedRequestCategoriesJsonRef = useRef("");

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
      adminPin: sharedContent.adminPin || adminPin,
    };
  }

  function applySharedAdminContent(sharedContent) {
    const normalizedContent = normalizeSharedAdminContent(sharedContent);

    lastSharedAdminContentJsonRef.current =
      JSON.stringify(normalizedContent);

    setAdminPin(normalizedContent.adminPin);
  }

  function applySharedAppSettings(sharedSettings) {
    if (!sharedSettings) return;

    lastSharedAppSettingsJsonRef.current =
      JSON.stringify(sharedSettings);

    setAppSettings(sharedSettings);
  }

  function applySharedGuestbookEntries(sharedEntries) {
    if (!Array.isArray(sharedEntries)) return;

    lastSharedGuestbookEntriesJsonRef.current =
      JSON.stringify(sharedEntries);

    setEntries(sharedEntries);
  }

  function applySharedAds(sharedAds) {
    if (!Array.isArray(sharedAds)) return;

    lastSharedAdsJsonRef.current =
      JSON.stringify(sharedAds);

    setAds(sharedAds);
  }

  function applySharedDriverProfile(sharedProfile) {
    if (!sharedProfile) return;

    lastSharedDriverProfileJsonRef.current =
      JSON.stringify(sharedProfile);

    setDriverProfile(sharedProfile);
  }

  function applySharedTipOptions(sharedTipOptions) {
    if (!Array.isArray(sharedTipOptions)) return;

    lastSharedTipOptionsJsonRef.current =
      JSON.stringify(sharedTipOptions);

    setTipOptions(sharedTipOptions);
  }

  function applySharedRequestCategories(sharedRequestCategories) {
    if (!sharedRequestCategories) return;

    lastSharedRequestCategoriesJsonRef.current =
      JSON.stringify(sharedRequestCategories);

    setRequestCategories(sharedRequestCategories);
  }

  // ===== OPTIONAL FIRESTORE INITIAL LOAD =====
  // Local storage is still the immediate fallback. If shared Firestore content
  // exists, it replaces the local initial state after the app mounts.
  useEffect(() => {
    let mounted = true;

    async function loadSharedState() {
      try {
        const [
          sharedContent,
          sharedSettings,
          sharedGuestbookEntries,
          sharedAds,
          sharedDriverProfile,
          sharedTipOptions,
          sharedRequestCategories,
        ] = await Promise.all([
          loadSharedAdminContent(),
          loadSharedAppSettings(),
          getSharedGuestbookEntries(),
          getSharedAds(),
          getSharedDriverProfile(),
          getSharedTipOptions(),
          getSharedRequestCategories(),
        ]);

        if (!mounted) return;

        if (sharedContent) {
          applySharedAdminContent(sharedContent);
        }

        if (sharedSettings) {
          applySharedAppSettings(sharedSettings);
        }

        if (Array.isArray(sharedGuestbookEntries)) {
          applySharedGuestbookEntries(sharedGuestbookEntries);
        }

        if (Array.isArray(sharedAds) && sharedAds.length > 0) {
          applySharedAds(sharedAds);
        }

        if (sharedDriverProfile) {
          applySharedDriverProfile(sharedDriverProfile);
        }

        if (Array.isArray(sharedTipOptions)) {
          applySharedTipOptions(sharedTipOptions);
        }

        if (sharedRequestCategories) {
          applySharedRequestCategories(sharedRequestCategories);
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

    const unsubscribeGuestbook = listenToSharedGuestbookEntries((sharedEntries) => {
      if (!Array.isArray(sharedEntries)) return;
      applySharedGuestbookEntries(sharedEntries);
      setSharedStateReady(true);
    });

    const unsubscribeAds = listenToSharedAds((sharedAds) => {
      if (!Array.isArray(sharedAds)) return;
      applySharedAds(sharedAds);
      setSharedStateReady(true);
    });

    const unsubscribeDriverProfile = listenToSharedDriverProfile((sharedProfile) => {
      if (!sharedProfile) return;
      applySharedDriverProfile(sharedProfile);
      setSharedStateReady(true);
    });

    const unsubscribeTipOptions = listenToSharedTipOptions((sharedTipOptions) => {
      if (!Array.isArray(sharedTipOptions)) return;
      applySharedTipOptions(sharedTipOptions);
      setSharedStateReady(true);
    });

    const unsubscribeRequestCategories = listenToSharedRequestCategories(
      (sharedRequestCategories) => {
        if (!sharedRequestCategories) return;
        applySharedRequestCategories(sharedRequestCategories);
        setSharedStateReady(true);
      }
    );

    return () => {
      if (unsubscribeContent) unsubscribeContent();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeGuestbook) unsubscribeGuestbook();
      if (unsubscribeAds) unsubscribeAds();
      if (unsubscribeDriverProfile) unsubscribeDriverProfile();
      if (unsubscribeTipOptions) unsubscribeTipOptions();
      if (unsubscribeRequestCategories) unsubscribeRequestCategories();
    };
    // Run once. Helper functions intentionally use current state fallbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== APP SETTINGS PERSISTENCE =====
  useEffect(() => {
    saveAppSettings(appSettings);

    if (!sharedStateReady || !canWriteAppSettings) return;

    const settingsJson = JSON.stringify(appSettings);

    if (settingsJson === lastSharedAppSettingsJsonRef.current) {
      return;
    }

    lastSharedAppSettingsJsonRef.current = settingsJson;
    saveSharedAppSettingsSnapshot(appSettings);
  }, [appSettings, sharedStateReady, canWriteAppSettings]);

  // ===== DRIVER PROFILE PERSISTENCE =====
  useEffect(() => {
    saveDriverProfile(driverProfile);

    if (!sharedStateReady || !canWriteFullAdminContent) return;

    const driverProfileJson = JSON.stringify(driverProfile);

    if (driverProfileJson === lastSharedDriverProfileJsonRef.current) {
      return;
    }

    lastSharedDriverProfileJsonRef.current = driverProfileJson;
    saveSharedDriverProfile(driverProfile);
  }, [driverProfile, sharedStateReady, canWriteFullAdminContent]);

  // ===== TIP OPTIONS PERSISTENCE =====
  useEffect(() => {
    saveTipOptions(tipOptions);

    if (!sharedStateReady || !canWriteFullAdminContent) return;

    const tipOptionsJson = JSON.stringify(tipOptions);

    if (tipOptionsJson === lastSharedTipOptionsJsonRef.current) {
      return;
    }

    lastSharedTipOptionsJsonRef.current = tipOptionsJson;
    saveSharedTipOptions(tipOptions);
  }, [tipOptions, sharedStateReady, canWriteFullAdminContent]);

  // ===== ADS PERSISTENCE =====
  useEffect(() => {
    saveAds(ads);

    if (!sharedStateReady || !canWriteFullAdminContent) return;

    const adsJson = JSON.stringify(ads);

    if (adsJson === lastSharedAdsJsonRef.current) {
      return;
    }

    lastSharedAdsJsonRef.current = adsJson;
    saveSharedAds(ads);
  }, [ads, sharedStateReady, canWriteFullAdminContent]);

  // ===== GUESTBOOK PERSISTENCE =====
  useEffect(() => {
    saveGuestbookEntries(entries);

    if (!sharedStateReady || !canWriteGuestbookEntries) return;

    const entriesJson = JSON.stringify(entries);

    if (entriesJson === lastSharedGuestbookEntriesJsonRef.current) {
      return;
    }

    lastSharedGuestbookEntriesJsonRef.current = entriesJson;
    saveSharedGuestbookEntries(entries);
  }, [entries, sharedStateReady, canWriteGuestbookEntries]);

  // ===== REQUEST CATEGORIES PERSISTENCE =====
  useEffect(() => {
    saveRequestCategories(requestCategories);

    if (!sharedStateReady || !canWriteFullAdminContent) return;

    const requestCategoriesJson = JSON.stringify(requestCategories);

    if (requestCategoriesJson === lastSharedRequestCategoriesJsonRef.current) {
      return;
    }

    lastSharedRequestCategoriesJsonRef.current = requestCategoriesJson;
    saveSharedRequestCategories(requestCategories);
  }, [requestCategories, sharedStateReady, canWriteFullAdminContent]);

  // ===== ADMIN PIN PERSISTENCE =====
  useEffect(() => {
    saveAdminPin(adminPin);
  }, [adminPin]);

  // ===== SHARED FIRESTORE ADMIN CONTENT SNAPSHOT =====
  // Guestbook entries, ads, driver profile, tip options, and request categories
  // now sync through their own Firestore services. This remaining snapshot only
  // contains MVP admin PIN state until auth replaces it.
  useEffect(() => {
    if (!sharedStateReady || !canWriteFullAdminContent) return;

    const contentSnapshot = {
      adminPin,
    };

    const contentJson = JSON.stringify(contentSnapshot);

    if (contentJson === lastSharedAdminContentJsonRef.current) {
      return;
    }

    lastSharedAdminContentJsonRef.current = contentJson;
    saveSharedAdminContentSnapshot(contentSnapshot);
  }, [
    adminPin,
    sharedStateReady,
    canWriteFullAdminContent,
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
