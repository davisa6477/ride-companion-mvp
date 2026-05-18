// ===== US STATE ABBREVIATION MAP =====
// Used by reverse geocoding to display compact labels like "Joplin, MO".
const US_STATE_ABBREVIATIONS = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

// ===== STATE NAME FORMATTER =====
export function getStateAbbreviation(stateName) {
  return US_STATE_ABBREVIATIONS[stateName] || stateName || "";
}

// ===== DEVICE COORDINATE LOOKUP =====
// Wraps browser geolocation in a Promise for easier async/await use.
// Used by WeatherPage and LocalPage.
export function getCurrentCoordinates(options = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 300000,
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not available on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

// ===== REVERSE GEOCODING =====
// Converts latitude/longitude into a readable city/state label.
// Uses OpenStreetMap Nominatim for MVP browser-side lookup.
export async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  const data = await response.json();
  const address = data.address || {};

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.county;

  const state = address.state ? getStateAbbreviation(address.state) : "";

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;

  return "";
}

// ===== READABLE DEVICE LOCATION =====
// Returns coordinates plus a human-readable label.
// If reverse geocoding fails to produce a label, keeps the provided fallback.
export async function getReadableDeviceLocation(fallbackLabel = "near me") {
  const coordinates = await getCurrentCoordinates();

  const readableLocation = await reverseGeocode(
    coordinates.latitude,
    coordinates.longitude
  );

  return {
    ...coordinates,
    label: readableLocation || fallbackLabel,
    usedFallbackLabel: !readableLocation,
  };
}

// ===== LOCAL SEARCH LABEL BUILDER =====
// Combines an English search category with a location label for Google Maps.
// Keeping the search category in English usually gives better Maps results.
export function buildNearSearchLabel(category, locationLabel) {
  return `${category} ${locationLabel || "near me"}`;
}


// ===== FALLBACK LOCATION SETTINGS NORMALIZER =====
// Used when the device location is blocked, unavailable, or not desired.
export function getFallbackLocationSettings(appSettings = {}) {
  const defaultZipCode = String(appSettings.defaultZipCode || "64801")
    .replace(/[^0-9]/g, "")
    .slice(0, 5);

  const defaultLocationLabel =
    String(appSettings.defaultLocationLabel || "").trim() || "Joplin, MO";

  return {
    defaultZipCode: defaultZipCode || "64801",
    defaultLocationLabel,
  };
}

// ===== ZIP CODE GEOCODING =====
// Browser-side MVP lookup for a US ZIP code using the public Zippopotam.us API.
// If this fails, WeatherPage falls back to Joplin coordinates.
export async function getCoordinatesForUsZip(zipCode) {
  const cleanedZip = String(zipCode || "").replace(/[^0-9]/g, "").slice(0, 5);

  if (cleanedZip.length !== 5) {
    throw new Error("A 5-digit ZIP code is required.");
  }

  const response = await fetch(`https://api.zippopotam.us/us/${cleanedZip}`);

  if (!response.ok) {
    throw new Error("ZIP lookup failed.");
  }

  const data = await response.json();
  const place = data.places?.[0];

  if (!place?.latitude || !place?.longitude) {
    throw new Error("ZIP lookup did not return coordinates.");
  }

  return {
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    city: place["place name"] || "",
    state: place["state abbreviation"] || "",
    label:
      place["place name"] && place["state abbreviation"]
        ? `${place["place name"]}, ${place["state abbreviation"]}`
        : cleanedZip,
  };
}
