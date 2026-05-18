// ===== PASSENGER WEATHER PAGE =====
// Shows local weather using device location when available.
// Falls back to the configured preview/default location when device location is blocked or unavailable.

import React, { useEffect, useState } from "react";
import { CloudRain, CloudSun, Thermometer } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import {
  getCoordinatesForUsZip,
  getFallbackLocationSettings,
  getReadableDeviceLocation,
} from "../../utils/location.js";

// ===== WEATHER CONDITION LABELS =====
// These are dynamic weather-code labels from Open-Meteo.
// They can be translated later with weather_condition_* keys if desired.
function describeWeather(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };

  return descriptions[code] || "Weather conditions unavailable";
}

// ===== WEATHER VISUAL STYLE MAP =====
// Maps Open-Meteo weather codes to panel colors/icons.
function getWeatherVisual(code) {
  if ([0, 1].includes(code)) {
    return {
      panel: "from-sky-400 via-blue-500 to-indigo-700",
      icon: (
        <CloudSun
          size={150}
          className="absolute right-6 top-6 text-white/25"
        />
      ),
      glow: "bg-yellow-200/40",
    };
  }

  if ([2, 3].includes(code)) {
    return {
      panel: "from-slate-500 via-slate-700 to-slate-950",
      icon: (
        <CloudSun
          size={150}
          className="absolute right-6 top-6 text-white/20"
        />
      ),
      glow: "bg-white/20",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      panel: "from-zinc-300 via-slate-500 to-slate-800",
      icon: (
        <CloudSun
          size={150}
          className="absolute right-6 top-6 text-white/20"
        />
      ),
      glow: "bg-white/20",
    };
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      panel: "from-cyan-700 via-blue-900 to-slate-950",
      icon: (
        <CloudRain
          size={150}
          className="absolute right-6 top-6 text-white/25"
        />
      ),
      glow: "bg-cyan-200/20",
    };
  }

  if ([71, 73, 75].includes(code)) {
    return {
      panel: "from-sky-100 via-slate-300 to-slate-600",
      icon: (
        <CloudSun
          size={150}
          className="absolute right-6 top-6 text-white/35"
        />
      ),
      glow: "bg-white/40",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      panel: "from-violet-950 via-slate-950 to-black",
      icon: (
        <CloudRain
          size={150}
          className="absolute right-6 top-6 text-white/25"
        />
      ),
      glow: "bg-yellow-300/20",
    };
  }

  return {
    panel: "from-slate-800 via-slate-900 to-slate-950",
    icon: (
      <CloudSun
        size={150}
        className="absolute right-6 top-6 text-white/20"
      />
    ),
    glow: "bg-white/10",
  };
}

export default function WeatherPage({ t = (key) => key, appSettings = {} }) {
  // ===== WEATHER STATE =====
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationLabel, setLocationLabel] = useState("Local weather");

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== ADMIN CONFIGURED FALLBACK LOCATION =====
  const fallbackLocation = getFallbackLocationSettings(appSettings);

  // ===== WEATHER API FETCH =====
  async function fetchWeather(latitude, longitude, label) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Weather service unavailable");
    }

    const data = await response.json();

    setWeather({
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      wind: Math.round(data.current.wind_speed_10m),
      precipitation: data.current.precipitation,
      description: describeWeather(data.current.weather_code),
      code: data.current.weather_code,
      high: Math.round(data.daily.temperature_2m_max[0]),
      low: Math.round(data.daily.temperature_2m_min[0]),
      rainChance: data.daily.precipitation_probability_max[0],
    });

    setLocationLabel(label);
  }

  // ===== FALLBACK LOCATION WEATHER =====
  async function loadFallbackWeather(message) {
    try {
      let fallbackCoordinates;

      try {
        fallbackCoordinates = await getCoordinatesForUsZip(
          fallbackLocation.defaultZipCode
        );
      } catch {
        // Hard fallback if the configured ZIP cannot be geocoded.
        fallbackCoordinates = {
          latitude: 37.0842,
          longitude: -94.5133,
          label: "Joplin, MO",
        };
      }

      const fallbackLabel =
        fallbackLocation.defaultLocationLabel ||
        fallbackCoordinates.label ||
        fallbackLocation.defaultZipCode ||
        "Joplin, MO";

      await fetchWeather(
        fallbackCoordinates.latitude,
        fallbackCoordinates.longitude,
        fallbackLabel
      );

      setErrorMessage(
        message ||
          `${tr(
            "weather_fallback_message",
            "Using fallback weather because device location is unavailable."
          )} ${fallbackLabel}.`
      );
    } catch {
      setErrorMessage(
        tr("weather_error", "Could not load weather right now.")
      );
    } finally {
      setLoading(false);
    }
  }

  // ===== LOCAL DEVICE WEATHER LOAD =====
  async function loadLocalWeather() {
    setLoading(true);
    setErrorMessage("");

    try {
      const location = await getReadableDeviceLocation(
        tr("weather_current_location", "Current device location")
      );

      await fetchWeather(
        location.latitude,
        location.longitude,
        location.label
      );
    } catch {
      await loadFallbackWeather(
        tr(
          "weather_location_blocked",
          "Location permission was blocked or unavailable, so saved ride-area weather is being shown."
        )
      );
      return;
    } finally {
      setLoading(false);
    }
  }

  // ===== INITIAL WEATHER LOAD =====
  useEffect(() => {
    loadLocalWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visual = weather ? getWeatherVisual(weather.code) : null;

  return (
    <PageCard className={`${PAGE_FRAME_CLASS} flex min-h-0 flex-col overflow-hidden`}>
      {/* ===== PAGE HEADER ===== */}
      <div className="shrink-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <CloudSun />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {tr("weather_title", "Local Weather")}
            </h2>

            <p className="text-slate-600">
              {tr(
                "weather_subtitle",
                "Uses device location when available, with the saved ride-area fallback when needed."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadLocalWeather}
          disabled={loading}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-50"
        >
          {loading
            ? tr("weather_loading", "Loading...")
            : tr("weather_refresh", "Refresh Weather")}
        </button>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
      {/* ===== ERROR / FALLBACK MESSAGE ===== */}
      {errorMessage && (
        <div className="rounded-2xl bg-amber-100 p-4 font-bold text-amber-900">
          {errorMessage}
        </div>
      )}

      {/* ===== WEATHER CONTENT ===== */}
      {weather && visual ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-xl ${visual.panel}`}
          >
            <div
              className={`absolute -left-12 -top-12 h-44 w-44 rounded-full blur-2xl ${visual.glow}`}
            />

            {visual.icon}

            <div className="relative z-10">
              <div className="text-sm font-bold uppercase tracking-wide text-white/60">
                {locationLabel}
              </div>

              <div className="mt-3 flex items-end gap-3">
                <div className="text-7xl font-black drop-shadow-lg">
                  {weather.temp}°
                </div>

                <div className="pb-3 text-xl font-bold text-white/80">
                  {tr("weather_feels_like", "Feels like")}{" "}
                  {weather.feelsLike}°
                </div>
              </div>

              <div className="mt-5 text-3xl font-black drop-shadow">
                {weather.description}
              </div>
            </div>
          </div>

          {/* ===== WEATHER DETAIL CARDS ===== */}
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <Thermometer size={16} /> {tr("weather_today", "Today")}
              </div>

              <div className="mt-2 text-3xl font-black text-slate-950">
                {tr("weather_high", "High")} {weather.high}° /{" "}
                {tr("weather_low", "Low")} {weather.low}°
              </div>
            </div>

            <div className="rounded-3xl bg-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <CloudRain size={16} /> {tr("weather_rain", "Rain")}
              </div>

              <div className="mt-2 text-3xl font-black text-slate-950">
                {weather.rainChance}% {tr("weather_chance", "chance")}
              </div>

              <div className="mt-1 text-slate-600">
                {tr("weather_current_precip", "Current precipitation")}:{" "}
                {weather.precipitation} in
              </div>
            </div>

            <div className="rounded-3xl bg-slate-100 p-5">
              <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {tr("weather_wind", "Wind")}
              </div>

              <div className="mt-2 text-3xl font-black text-slate-950">
                {weather.wind} mph
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== LOADING STATE ===== */
        <div className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-3xl bg-slate-950 p-6 text-center text-white">
          <CloudSun size={72} className="mb-4 opacity-70" />

          <h3 className="text-3xl font-black">
            {tr("weather_loading", "Loading weather")}
          </h3>

          <p className="mt-2 max-w-md text-white/60">
            {tr(
              "weather_loading_subtitle",
              "Trying device location first. If unavailable, saved ride-area weather will appear."
            )}
          </p>
        </div>
      )}

      {/* ===== DATA PRIVACY NOTE ===== */}
      <p className="mt-4 text-sm text-slate-500">
        {tr(
          "weather_footer",
          "Weather data is loaded from Open-Meteo. Device location is used only to request local conditions and is not saved."
        )}
      </p>
      </div>
    </PageCard>
  );
}
