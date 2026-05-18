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

// ===== PASSENGER NAVIGATION REGISTRY =====
// Controls passenger nav order, translation keys, fallback labels, and icons.
// Add/remove passenger pages here instead of editing App.jsx nav setup.
export const passengerNavItems = [
  { id: "home", labelKey: "nav_home", fallbackLabel: "Home", icon: Home },
  { id: "local", labelKey: "nav_local", fallbackLabel: "Local", icon: MapPin },
  {
    id: "guestbook",
    labelKey: "nav_guestbook",
    fallbackLabel: "Guestbook",
    icon: MessageSquareHeart,
  },
  { id: "ads", labelKey: "nav_deals", fallbackLabel: "Deals", icon: Store },
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
