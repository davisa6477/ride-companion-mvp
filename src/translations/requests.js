// ===== REQUESTS PAGE TRANSLATIONS =====
// Static text used by RequestsPage.jsx.
// Default request categories/items are included here so built-in requests can translate.
// Admin-created custom requests safely fall back to their original text.
const requests = {
  en: {
    // ===== PAGE / STATUS UI =====
    requests_title: "Mid-Ride Requests",
    requests_subtitle:
      "Quick passenger requests designed to minimize distraction.",
    requests_status_title: "Request Status",
    requests_status_subtitle: "Driver updates appear here automatically.",
    requests_acknowledged: "Acknowledged",
    requests_pending: "Pending",
    requests_request: "Request",
    requests_default_category: "Passenger requests",
    requests_select_request: "Select a request below.",
    requests_cancel: "Cancel",
    requests_sending: "Sending...",
    requests_error: "Could not send request. Please try again.",

    // ===== DEFAULT REQUEST CATEGORIES =====
    request_category_Comfort: "Comfort",
    "request_category_Audio / Atmosphere": "Audio / Atmosphere",
    "request_category_Device / Charging": "Device / Charging",
    "request_category_Ride Assistance": "Ride Assistance",
    "request_category_Ride Communication": "Ride Communication",
    "request_category_Accessibility / Comfort": "Accessibility / Comfort",
    "request_category_Safety / Priority": "Safety / Priority",

    // ===== DEFAULT REQUEST CATEGORY DESCRIPTIONS =====
    request_category_description_Comfort: "Temperature & airflow",
    "request_category_description_Audio / Atmosphere": "Music & conversation",
    "request_category_description_Device / Charging": "Phone & power help",
    "request_category_description_Ride Assistance": "Comfort assistance",
    "request_category_description_Ride Communication": "Ride questions",
    "request_category_description_Accessibility / Comfort":
      "Accessibility options",
    "request_category_description_Safety / Priority": "Urgent ride needs",

    // ===== DEFAULT REQUEST ITEMS =====
    "request_item_Cooler temperature": "Cooler temperature",
    "request_item_Warmer temperature": "Warmer temperature",
    "request_item_Lower fan speed": "Lower fan speed",
    "request_item_Higher fan speed": "Higher fan speed",
    "request_item_Window cracked open": "Window cracked open",
    "request_item_Window closed": "Window closed",
    "request_item_Lower music volume": "Lower music volume",
    "request_item_Raise music volume": "Raise music volume",
    "request_item_Different music style": "Different music style",
    "request_item_Quiet ride preferred": "Quiet ride preferred",
    "request_item_Conversation okay": "Conversation okay",
    "request_item_Need phone charger": "Need phone charger",
    "request_item_Need different charging cable":
      "Need different charging cable",
    "request_item_Battery low warning": "Battery low warning",
    "request_item_Device overheating": "Device overheating",
    "request_item_Feeling car sick": "Feeling car sick",
    "request_item_Need fresh air": "Need fresh air",
    "request_item_Need restroom soon": "Need restroom soon",
    "request_item_Need tissue/napkin": "Need tissue/napkin",
    "request_item_Need water": "Need water",
    "request_item_Pickup/dropoff clarification":
      "Pickup/dropoff clarification",
    "request_item_Wrong turn concern": "Wrong turn concern",
    "request_item_Quick stop question": "Quick stop question",
    "request_item_Change destination question": "Change destination question",
    "request_item_Hearing difficulty": "Hearing difficulty",
    "request_item_Need extra time": "Need extra time",
    "request_item_Sensory sensitivity": "Sensory sensitivity",
    "request_item_Please stop at next safe location":
      "Please stop at next safe location",
    "request_item_Feeling unwell": "Feeling unwell",
    "request_item_Emergency assistance needed":
      "Emergency assistance needed",
  },

  es: {
    // ===== PAGE / STATUS UI =====
    requests_title: "Solicitudes durante el viaje",
    requests_subtitle:
      "Solicitudes rápidas del pasajero diseñadas para reducir distracciones.",
    requests_status_title: "Estado de la solicitud",
    requests_status_subtitle:
      "Las actualizaciones del conductor aparecen aquí automáticamente.",
    requests_acknowledged: "Confirmada",
    requests_pending: "Pendiente",
    requests_request: "Solicitud",
    requests_default_category: "Solicitudes del pasajero",
    requests_select_request: "Seleccione una solicitud abajo.",
    requests_cancel: "Cancelar",
    requests_sending: "Enviando...",
    requests_error: "No se pudo enviar la solicitud. Inténtelo de nuevo.",

    // ===== DEFAULT REQUEST CATEGORIES =====
    request_category_Comfort: "Comodidad",
    "request_category_Audio / Atmosphere": "Audio / Ambiente",
    "request_category_Device / Charging": "Dispositivo / Carga",
    "request_category_Ride Assistance": "Asistencia del viaje",
    "request_category_Ride Communication": "Comunicación del viaje",
    "request_category_Accessibility / Comfort": "Accesibilidad / Comodidad",
    "request_category_Safety / Priority": "Seguridad / Prioridad",

    // ===== DEFAULT REQUEST CATEGORY DESCRIPTIONS =====
    request_category_description_Comfort: "Temperatura y flujo de aire",
    "request_category_description_Audio / Atmosphere": "Música y conversación",
    "request_category_description_Device / Charging": "Ayuda con teléfono y carga",
    "request_category_description_Ride Assistance": "Ayuda de comodidad",
    "request_category_description_Ride Communication": "Preguntas del viaje",
    "request_category_description_Accessibility / Comfort":
      "Opciones de accesibilidad",
    "request_category_description_Safety / Priority":
      "Necesidades urgentes del viaje",

    // ===== DEFAULT REQUEST ITEMS =====
    "request_item_Cooler temperature": "Temperatura más fresca",
    "request_item_Warmer temperature": "Temperatura más cálida",
    "request_item_Lower fan speed": "Bajar velocidad del ventilador",
    "request_item_Higher fan speed": "Subir velocidad del ventilador",
    "request_item_Window cracked open": "Abrir un poco la ventana",
    "request_item_Window closed": "Cerrar la ventana",
    "request_item_Lower music volume": "Bajar volumen de la música",
    "request_item_Raise music volume": "Subir volumen de la música",
    "request_item_Different music style": "Otro estilo de música",
    "request_item_Quiet ride preferred": "Prefiero un viaje tranquilo",
    "request_item_Conversation okay": "Está bien conversar",
    "request_item_Need phone charger": "Necesito cargador de teléfono",
    "request_item_Need different charging cable":
      "Necesito otro cable de carga",
    "request_item_Battery low warning": "Batería baja",
    "request_item_Device overheating": "El dispositivo se está calentando",
    "request_item_Feeling car sick": "Me estoy mareando",
    "request_item_Need fresh air": "Necesito aire fresco",
    "request_item_Need restroom soon": "Necesito baño pronto",
    "request_item_Need tissue/napkin": "Necesito pañuelo o servilleta",
    "request_item_Need water": "Necesito agua",
    "request_item_Pickup/dropoff clarification":
      "Aclaración de recogida o destino",
    "request_item_Wrong turn concern": "Creo que tomamos un giro equivocado",
    "request_item_Quick stop question": "Pregunta sobre una parada rápida",
    "request_item_Change destination question":
      "Pregunta sobre cambiar el destino",
    "request_item_Hearing difficulty": "Dificultad para oír",
    "request_item_Need extra time": "Necesito más tiempo",
    "request_item_Sensory sensitivity": "Sensibilidad sensorial",
    "request_item_Please stop at next safe location":
      "Por favor pare en el próximo lugar seguro",
    "request_item_Feeling unwell": "Me siento mal",
    "request_item_Emergency assistance needed":
      "Necesito asistencia de emergencia",
  },

  fr: {
    // ===== PAGE / STATUS UI =====
    requests_title: "Demandes pendant le trajet",
    requests_subtitle:
      "Demandes rapides du passager conçues pour limiter les distractions.",
    requests_status_title: "État de la demande",
    requests_status_subtitle:
      "Les mises à jour du chauffeur apparaissent ici automatiquement.",
    requests_acknowledged: "Confirmée",
    requests_pending: "En attente",
    requests_request: "Demande",
    requests_default_category: "Demandes du passager",
    requests_select_request: "Sélectionnez une demande ci-dessous.",
    requests_cancel: "Annuler",
    requests_sending: "Envoi...",
    requests_error: "Impossible d’envoyer la demande. Veuillez réessayer.",

    // ===== DEFAULT REQUEST CATEGORIES =====
    request_category_Comfort: "Confort",
    "request_category_Audio / Atmosphere": "Audio / Ambiance",
    "request_category_Device / Charging": "Appareil / Recharge",
    "request_category_Ride Assistance": "Assistance pendant le trajet",
    "request_category_Ride Communication": "Communication du trajet",
    "request_category_Accessibility / Comfort": "Accessibilité / Confort",
    "request_category_Safety / Priority": "Sécurité / Priorité",

    // ===== DEFAULT REQUEST CATEGORY DESCRIPTIONS =====
    request_category_description_Comfort: "Température et ventilation",
    "request_category_description_Audio / Atmosphere": "Musique et conversation",
    "request_category_description_Device / Charging":
      "Aide téléphone et recharge",
    "request_category_description_Ride Assistance": "Aide au confort",
    "request_category_description_Ride Communication": "Questions sur le trajet",
    "request_category_description_Accessibility / Comfort":
      "Options d’accessibilité",
    "request_category_description_Safety / Priority":
      "Besoins urgents du trajet",

    // ===== DEFAULT REQUEST ITEMS =====
    "request_item_Cooler temperature": "Température plus fraîche",
    "request_item_Warmer temperature": "Température plus chaude",
    "request_item_Lower fan speed": "Baisser la ventilation",
    "request_item_Higher fan speed": "Augmenter la ventilation",
    "request_item_Window cracked open": "Ouvrir légèrement la fenêtre",
    "request_item_Window closed": "Fermer la fenêtre",
    "request_item_Lower music volume": "Baisser le volume de la musique",
    "request_item_Raise music volume": "Augmenter le volume de la musique",
    "request_item_Different music style": "Changer de style de musique",
    "request_item_Quiet ride preferred": "Je préfère un trajet calme",
    "request_item_Conversation okay": "La conversation me convient",
    "request_item_Need phone charger": "J’ai besoin d’un chargeur",
    "request_item_Need different charging cable":
      "J’ai besoin d’un autre câble de charge",
    "request_item_Battery low warning": "Batterie faible",
    "request_item_Device overheating": "L’appareil surchauffe",
    "request_item_Feeling car sick": "J’ai le mal des transports",
    "request_item_Need fresh air": "J’ai besoin d’air frais",
    "request_item_Need restroom soon": "J’ai bientôt besoin de toilettes",
    "request_item_Need tissue/napkin": "J’ai besoin d’un mouchoir ou d’une serviette",
    "request_item_Need water": "J’ai besoin d’eau",
    "request_item_Pickup/dropoff clarification":
      "Clarification sur le départ ou l’arrivée",
    "request_item_Wrong turn concern": "Je pense que nous avons pris le mauvais chemin",
    "request_item_Quick stop question": "Question sur un arrêt rapide",
    "request_item_Change destination question":
      "Question sur le changement de destination",
    "request_item_Hearing difficulty": "Difficulté à entendre",
    "request_item_Need extra time": "J’ai besoin de plus de temps",
    "request_item_Sensory sensitivity": "Sensibilité sensorielle",
    "request_item_Please stop at next safe location":
      "Veuillez vous arrêter au prochain endroit sûr",
    "request_item_Feeling unwell": "Je ne me sens pas bien",
    "request_item_Emergency assistance needed":
      "Besoin d’une assistance d’urgence",
  },
};

export default requests;
