// ===== PASSENGER LOCAL PLACES PAGE =====
// Generates Google Maps search QR codes for nearby places.
// Passenger-facing labels translate, while Google Maps search values remain English for better results.

import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import PageCard from "../layout/PageCard.jsx";
import {
  buildNearSearchLabel,
  getReadableDeviceLocation,
} from "../../utils/location.js";

// ===== GOOGLE MAPS QR URL BUILDER =====
// Keeps the QR target as a normal Google Maps search URL.
function buildGoogleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

export default function LocalPage({ t = (key) => key }) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== LOCAL CATEGORY CONFIGURATION =====
  // Labels are translated for passengers.
  // Values remain English because they are used for Google Maps search quality.
  const localCategories = [
    {
      id: "food",
      label: tr("local_food", "Food"),
      descriptor: tr("local_food_desc", "Restaurants, coffee, quick bites"),
      searches: [
        { label: tr("local_search_food", "Food"), value: "food" },
        {
          label: tr("local_search_restaurants", "Restaurants"),
          value: "restaurants",
        },
        { label: tr("local_search_coffee", "Coffee"), value: "coffee" },
        {
          label: tr("local_search_latenightfood", "Late night food"),
          value: "late night food",
        },
      ],
    },
    {
      id: "shopping",
      label: tr("local_shopping", "Shopping"),
      descriptor: tr("local_shopping_desc", "Stores, malls, essentials"),
      searches: [
        { label: tr("local_search_shopping", "Shopping"), value: "shopping" },
        { label: tr("local_search_stores", "Stores"), value: "stores" },
        { label: tr("local_search_pharmacy", "Pharmacy"), value: "pharmacy" },
        {
          label: tr("local_search_convenience", "Convenience store"),
          value: "convenience store",
        },
      ],
    },
    {
      id: "entertainment",
      label: tr("local_entertainment", "Entertainment"),
      descriptor: tr("local_entertainment_desc", "Movies, music, activities"),
      searches: [
        {
          label: tr("local_search_entertainment", "Entertainment"),
          value: "entertainment",
        },
        {
          label: tr("local_search_movies", "Movie theater"),
          value: "movie theater",
        },
        {
          label: tr("local_search_music", "Live music"),
          value: "live music",
        },
        {
          label: tr("local_search_thingstodo", "Things to do"),
          value: "things to do",
        },
      ],
    },
    {
      id: "nightlife",
      label: tr("local_nightlife", "Nightlife"),
      descriptor: tr("local_nightlife_desc", "Bars, lounges, late spots"),
      searches: [
        { label: tr("local_search_bars", "Bars"), value: "bars" },
        {
          label: tr("local_search_nightlife", "Nightlife"),
          value: "nightlife",
        },
        {
          label: tr("local_search_cocktails", "Cocktails"),
          value: "cocktails",
        },
        {
          label: tr("local_search_latenight", "Late night"),
          value: "late night",
        },
      ],
    },
    {
      id: "travel",
      label: tr("local_travel", "Travel"),
      descriptor: tr("local_travel_desc", "Hotels, airport, transportation"),
      searches: [
        { label: tr("local_search_hotels", "Hotels"), value: "hotels" },
        { label: tr("local_search_airport", "Airport"), value: "airport" },
        {
          label: tr("local_search_gas", "Gas station"),
          value: "gas station",
        },
        {
          label: tr("local_search_carrental", "Car rental"),
          value: "car rental",
        },
      ],
    },
    {
      id: "essentials",
      label: tr("local_essentials", "Essentials"),
      descriptor: tr("local_essentials_desc", "ATMs, pharmacies, supplies"),
      searches: [
        { label: tr("local_search_atm", "ATM"), value: "ATM" },
        { label: tr("local_search_pharmacy", "Pharmacy"), value: "pharmacy" },
        {
          label: tr("local_search_grocery", "Grocery store"),
          value: "grocery store",
        },
        {
          label: tr("local_search_urgentcare", "Urgent care"),
          value: "urgent care",
        },
      ],
    },
  ];

  // ===== CATEGORY / SEARCH STATE =====
  const [selectedCategory, setSelectedCategory] = useState(localCategories[0]);
  const [selectedSearch, setSelectedSearch] = useState(
    localCategories[0].searches[0].value
  );

  // ===== TRANSLATED LOCATION FALLBACK =====
  // Passenger-facing fallback label when device location is unavailable.
  // Google Maps still receives the English search value from selectedSearch.
  const nearMeLabel = tr("local_near_me", "near me");

  // ===== LOCATION STATE =====
  const [locationLabel, setLocationLabel] = useState(nearMeLabel);
  const [locationStatus, setLocationStatus] = useState(
    tr("local_location_loading", "Trying device location...")
  );
  const [locationReady, setLocationReady] = useState(false);

  // ===== DEVICE LOCATION LOAD =====
  // Uses readable location when available; falls back to the translated near-me label.
  useEffect(() => {
    let mounted = true;

    async function loadLocationLabel() {
      try {
        const location = await getReadableDeviceLocation(nearMeLabel);

        if (!mounted) return;

        setLocationLabel(location.label || nearMeLabel);

        setLocationStatus(
          location.usedFallbackLabel
            ? tr("local_general_search", "Using a general nearby search.")
            : `${tr("local_searching_around", "Searching around")} ${
                location.label
              }.`
        );
      } catch {
        if (!mounted) return;

        setLocationLabel(nearMeLabel);
        setLocationStatus(
          tr(
            "local_location_unavailable",
            "Location unavailable. QR searches will use near me."
          )
        );
      } finally {
        if (mounted) setLocationReady(true);
      }
    }

    loadLocationLabel();

    return () => {
      mounted = false;
    };
  }, [nearMeLabel]);

  // ===== CATEGORY SELECTION =====
  function chooseCategory(category) {
    setSelectedCategory(category);
    setSelectedSearch(category.searches[0].value);
  }

  // ===== SELECTED SEARCH LABEL =====
  // Display translated label while keeping Google Maps query value in English.
  const selectedSearchLabel =
    selectedCategory.searches.find((search) => search.value === selectedSearch)
      ?.label || selectedSearch;

  // ===== QR SEARCH LABEL / URL =====
  const searchLabel = useMemo(
    () => buildNearSearchLabel(selectedSearch, locationLabel),
    [selectedSearch, locationLabel]
  );

  const searchUrl = useMemo(
    () => buildGoogleMapsSearchUrl(searchLabel),
    [searchLabel]
  );

  return (
    <PageCard className="min-h-[520px]">
      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <MapPin />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {tr("local_title", "Local Places")}
            </h2>

            <p className="text-slate-600">
              {tr(
                "local_subtitle",
                "Find nearby food, shopping, entertainment, and essentials."
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
          {locationStatus}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        {/* ===== CATEGORY CARDS ===== */}
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {localCategories.map((category) => {
              const active = selectedCategory.id === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => chooseCategory(category)}
                  className={`rounded-3xl border p-4 text-center transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xl font-black">{category.label}</div>

                  <div
                    className={`mt-1 text-sm ${
                      active ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {category.descriptor}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== QR SEARCH PANEL ===== */}
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/50">
            <Search size={16} />
            {tr("local_phone_search", "Search with your phone")}
          </div>

          <h3 className="mt-3 text-3xl font-black leading-tight">
            {selectedCategory.label} {locationLabel}
          </h3>

          <p className="mt-3 text-white/70">
            {tr(
              "local_pick_search",
              "Pick a search type, then scan the QR code with your phone."
            )}
          </p>

          {/* ===== SEARCH TYPE BUTTONS ===== */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {selectedCategory.searches.map((search) => (
              <button
                key={search.value}
                type="button"
                onClick={() => setSelectedSearch(search.value)}
                className={`rounded-2xl px-4 py-3 text-center text-sm font-black transition ${
                  selectedSearch === search.value
                    ? "bg-white text-slate-950"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {search.label}
              </button>
            ))}
          </div>

          {/* ===== QR CODE ===== */}
          <div className="mt-6 flex flex-col items-center rounded-3xl bg-white p-6 text-slate-950">
            <QRCodeSVG value={searchUrl} size={220} />

            <div className="mt-4 text-center text-xl font-black">
              {selectedSearchLabel} {locationLabel}
            </div>

            <p className="mt-2 text-center text-sm text-slate-600">
              {tr(
                "local_privacy",
                "For convenience and privacy, scan with your phone to continue."
              )}
            </p>
          </div>

          {!locationReady && (
            <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm font-bold text-white/70">
              {tr(
                "local_loading",
                "Location is still loading. The QR code will update automatically if a city is found."
              )}
            </div>
          )}
        </div>
      </div>
    </PageCard>
  );
}
