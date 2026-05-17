// ===== WEATHER PAGE TRANSLATIONS =====
// Static text used by WeatherPage.jsx. Weather condition labels are still generated in the component.
const weather = {
  en: {
    weather_title: "Local Weather",
    weather_subtitle:
      "Uses device location when available, with a Joplin fallback for preview/testing.",
    weather_loading: "Loading weather",
    weather_refresh: "Refresh Weather",
    weather_error: "Could not load weather right now.",
    weather_fallback_message:
      "Using Joplin, MO fallback weather because device location is unavailable in preview.",
    weather_location_blocked:
      "Location permission was blocked or unavailable, so Joplin, MO fallback weather is being shown.",
    weather_current_location: "Current device location",
    weather_feels_like: "Feels like",
    weather_today: "Today",
    weather_high: "High",
    weather_low: "Low",
    weather_rain: "Rain",
    weather_chance: "chance",
    weather_current_precip: "Current precipitation",
    weather_wind: "Wind",
    weather_loading_subtitle:
      "Trying device location first. If unavailable, Joplin fallback weather will appear.",
    weather_footer:
      "Weather data is loaded from Open-Meteo. Device location is used only to request local conditions and is not saved.",
  },

  es: {
    weather_title: "Clima local",
    weather_subtitle:
      "Usa la ubicación del dispositivo cuando está disponible, con Joplin como respaldo para pruebas.",
    weather_loading: "Cargando clima",
    weather_refresh: "Actualizar clima",
    weather_error: "No se pudo cargar el clima en este momento.",
    weather_fallback_message:
      "Usando el clima de respaldo de Joplin, MO porque la ubicación del dispositivo no está disponible.",
    weather_location_blocked:
      "El permiso de ubicación fue bloqueado o no está disponible, así que se muestra el clima de Joplin, MO.",
    weather_current_location: "Ubicación actual del dispositivo",
    weather_feels_like: "Sensación térmica",
    weather_today: "Hoy",
    weather_high: "Máxima",
    weather_low: "Mínima",
    weather_rain: "Lluvia",
    weather_chance: "probabilidad",
    weather_current_precip: "Precipitación actual",
    weather_wind: "Viento",
    weather_loading_subtitle:
      "Intentando usar la ubicación del dispositivo primero. Si no está disponible, aparecerá el clima de Joplin.",
    weather_footer:
      "Los datos del clima se cargan desde Open-Meteo. La ubicación del dispositivo solo se usa para solicitar condiciones locales y no se guarda.",
  },

  fr: {
    weather_title: "Météo locale",
    weather_subtitle:
      "Utilise la localisation de l’appareil si disponible, avec Joplin comme solution de secours pour les tests.",
    weather_loading: "Chargement de la météo",
    weather_refresh: "Actualiser la météo",
    weather_error: "Impossible de charger la météo pour le moment.",
    weather_fallback_message:
      "Météo de secours de Joplin, MO utilisée car la localisation de l’appareil n’est pas disponible.",
    weather_location_blocked:
      "L’autorisation de localisation est bloquée ou indisponible, donc la météo de Joplin, MO est affichée.",
    weather_current_location: "Localisation actuelle de l’appareil",
    weather_feels_like: "Ressenti",
    weather_today: "Aujourd’hui",
    weather_high: "Max",
    weather_low: "Min",
    weather_rain: "Pluie",
    weather_chance: "de chance",
    weather_current_precip: "Précipitations actuelles",
    weather_wind: "Vent",
    weather_loading_subtitle:
      "Tentative d’utilisation de la localisation de l’appareil. Si elle est indisponible, la météo de Joplin apparaîtra.",
    weather_footer:
      "Les données météo proviennent d’Open-Meteo. La localisation de l’appareil est utilisée uniquement pour demander les conditions locales et n’est pas enregistrée.",
  },
};

export default weather;