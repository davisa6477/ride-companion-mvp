import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  CloudSun,
  Gamepad2,
  Home,
  Languages,
  MapPin,
  MessageSquareHeart,
  Plane,
  Store,
} from "lucide-react";

import NavButton from "./components/NavButton.jsx";
import HomePage from "./components/HomePage.jsx";
import GuestbookPage from "./components/GuestbookPage.jsx";
import AdsPage from "./components/AdsPage.jsx";
import LocalPage from "./components/LocalPage";
import GamesPage from "./components/GamesPage.jsx";
import WeatherPage from "./components/WeatherPage.jsx";
import RequestsPage from "./components/RequestsPage.jsx";
import FlightCheckerPage from "./components/FlightCheckerPage.jsx";
import MirrorPage from "./components/MirrorPage.jsx";
import TranslationPage from "./components/TranslationPage.jsx";
import AdminPage from "./components/AdminPage.jsx";
import DriverConsolePage from "./components/DriverConsolePage.jsx";

import { starterAds } from "./data/starterAds.js";
import { defaultRequestCategories as starterRequestCategories } from "./data/defaultRequests.js";
import { createTranslator } from "./data/translations.js";
import { setPassengerLanguage } from "./services/rideSessionService.js";

import {
  loadDriverProfile,
  saveDriverProfile,
  loadTipOptions,
  saveTipOptions,
  loadAds,
  saveAds,
  loadGuestbookEntries,
  saveGuestbookEntries,
  loadRequestCategories,
  saveRequestCategories,
  loadAdminPin,
  saveAdminPin,
} from "./services/storageService.js";

// ===== ADMIN DEFAULTS =====
const DEFAULT_ADMIN_PIN = "1234";

// ===== DEFAULT GUESTBOOK DATA =====
// Used only when no saved guestbook entries exist in localStorage.
const defaultGuestbookEntries = [
  {
    id: 101,
    name: "Sam",
    city: "Joplin, MO",
    message: "Great ride and clean setup!",
    approved: true,
  },
];

// ===== DRIVER PROFILE DEFAULTS =====
// Saved driver profile data merges with these defaults in storageService.js.
// Translation fields are manual admin-entered dynamic text translations.
const defaultDriverProfile = {
  name: "Aaron",
  bio: "Welcome aboard. I hope you have a comfortable ride — feel free to check out local deals, trivia, weather, or send a quick ride request.",
  localTip: "Ask me about good local food spots if you're visiting Joplin.",
  photo: "",

  bioTranslations: {
    es: "",
    fr: "",
  },

  localTipTranslations: {
    es: "",
    fr: "",
  },
};

export default function App() {
  // ===== ROUTE DETECTION =====
  // /console opens the driver console.
  // /admin opens the admin panel.
  // Everything else opens the passenger tablet shell.
  const pathname = window.location.pathname;
  const isDriverConsole = pathname === "/console";
  const isAdminPage = pathname === "/admin";

  // ===== PASSENGER UI STATE =====
  const [page, setPage] = useState("home");
  const [appLanguage, setAppLanguage] = useState("en");

  // ===== PERSISTED CONTENT STATE =====
  const [entries, setEntries] = useState(() =>
    loadGuestbookEntries(defaultGuestbookEntries)
  );

  const [ads, setAds] = useState(() => loadAds(starterAds));

  const [adminPin, setAdminPin] = useState(() =>
    loadAdminPin(DEFAULT_ADMIN_PIN)
  );

  const [requestCategories, setRequestCategories] = useState(() =>
    loadRequestCategories(starterRequestCategories)
  );

  const [driverProfile, setDriverProfile] = useState(() =>
    loadDriverProfile(defaultDriverProfile)
  );

  const [tipOptions, setTipOptions] = useState(() => loadTipOptions([]));

  // ===== TRANSLATION SETUP =====
  // t(key) returns the selected-language text when available.
  const t = useMemo(() => createTranslator(appLanguage), [appLanguage]);

  // ===== DERIVED DISPLAY DATA =====
  const featuredAd = useMemo(() => ads.find((ad) => ad.active), [ads]);

  // ===== LOCAL STORAGE PERSISTENCE =====
  useEffect(() => {
    saveDriverProfile(driverProfile);
  }, [driverProfile]);

  useEffect(() => {
    saveTipOptions(tipOptions);
  }, [tipOptions]);

  useEffect(() => {
    saveAds(ads);
  }, [ads]);

  useEffect(() => {
    saveGuestbookEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveRequestCategories(requestCategories);
  }, [requestCategories]);

  useEffect(() => {
    saveAdminPin(adminPin);
  }, [adminPin]);

  // ===== PASSENGER SCREEN AUTO-RESET =====
  // After inactivity, the passenger tablet returns to Home and English.
  // Also syncs English back to Firestore so the driver console language card resets.
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
          />
        </div>
      </main>
    );
  }

  // ===== PASSENGER NAVIGATION ITEMS =====
  // Admin is intentionally excluded from passenger navigation.
  const navItems = [
    {
      id: "home",
      labelKey: "nav_home",
      fallbackLabel: "Home",
      icon: Home,
    },
    {
      id: "local",
      labelKey: "nav_local",
      fallbackLabel: "Local",
      icon: MapPin,
    },
    {
      id: "guestbook",
      labelKey: "nav_guestbook",
      fallbackLabel: "Guestbook",
      icon: MessageSquareHeart,
    },
    {
      id: "ads",
      labelKey: "nav_deals",
      fallbackLabel: "Deals",
      icon: Store,
    },
    {
      id: "games",
      labelKey: "nav_games",
      fallbackLabel: "Games",
      icon: Gamepad2,
    },
    {
      id: "weather",
      labelKey: "nav_weather",
      fallbackLabel: "Weather",
      icon: CloudSun,
    },
    {
      id: "requests",
      labelKey: "nav_requests",
      fallbackLabel: "Requests",
      icon: MessageSquareHeart,
    },
    {
      id: "flights",
      labelKey: "nav_flights",
      fallbackLabel: "Flights",
      icon: Plane,
    },
    {
      id: "mirror",
      labelKey: "nav_mirror",
      fallbackLabel: "Mirror",
      icon: Camera,
    },
    {
      id: "translate",
      labelKey: "nav_translate",
      fallbackLabel: "Translate",
      icon: Languages,
    },
  ];

  // ===== NAV LABEL TRANSLATION FALLBACK =====
  function navLabel(item) {
    const translated = t(item.labelKey);
    return translated === item.labelKey ? item.fallbackLabel : translated;
  }

  // ===== PASSENGER APP SHELL =====
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* ===== PASSENGER HEADER / NAV ===== */}
        <header className="mb-5 flex flex-col gap-4">
          <div className="text-white">
            <div className="text-sm font-bold uppercase tracking-[.25em] text-white/50">
              Passenger Tablet
            </div>

            <div className="text-3xl font-black">
              Ride Companion MVP
            </div>
          </div>

          <nav
            className="grid gap-2 rounded-3xl bg-white/10 p-2 backdrop-blur"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            }}
          >
            {navItems.map((item) => (
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

        {/* ===== PASSENGER PAGE ROUTER ===== */}
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

        {page === "local" && <LocalPage t={t} />}

        {page === "guestbook" && (
          <GuestbookPage
            entries={entries}
            setEntries={setEntries}
            t={t}
          />
        )}

        {page === "ads" && (
          <AdsPage
            ads={ads}
            appLanguage={appLanguage}
            t={t}
          />
        )}

        {page === "games" && <GamesPage t={t} />}

        {page === "weather" && <WeatherPage t={t} />}

        {page === "requests" && (
          <RequestsPage
            requestCategories={requestCategories}
            t={t}
          />
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
