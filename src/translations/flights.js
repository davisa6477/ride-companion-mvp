// ===== FLIGHT CHECKER TRANSLATIONS =====
// Static text used by FlightCheckerPage.jsx.
// Flight numbers and FlightAware URLs remain dynamic and untranslated.
const flights = {
  en: {
    flights_title: "Flight Checker",
    flights_subtitle:
      "Generate a QR code passengers can scan on their own phone.",
    flights_qr_title: "Flight status QR",
    flights_enter: "Enter a flight number",
    flights_help:
      "Use the airline code plus number, such as AA123, DL456, UA789, or WN101.",
    flights_placeholder: "Example: AA123",
    flights_button: "Show Flight QR Code",
    flights_error:
      "Enter an airline code and flight number, like AA123 or DL456.",
    flights_scan_help:
      "Scan with your phone to check this flight outside the ride tablet. This keeps the passenger screen locked in kiosk mode.",
    flights_empty_title: "QR code will appear here",
    flights_empty_sub:
      "Passengers scan the code with their own phone instead of opening another app on the tablet.",
  },

  es: {
    flights_title: "Verificador de vuelos",
    flights_subtitle:
      "Genere un código QR que los pasajeros puedan escanear con su propio teléfono.",
    flights_qr_title: "QR de estado del vuelo",
    flights_enter: "Ingrese un número de vuelo",
    flights_help:
      "Use el código de la aerolínea y el número, como AA123, DL456, UA789 o WN101.",
    flights_placeholder: "Ejemplo: AA123",
    flights_button: "Mostrar código QR del vuelo",
    flights_error:
      "Ingrese un código de aerolínea y número de vuelo, como AA123 o DL456.",
    flights_scan_help:
      "Escanee con su teléfono para revisar este vuelo fuera de la tableta del viaje. Esto mantiene la pantalla del pasajero en modo kiosco.",
    flights_empty_title: "El código QR aparecerá aquí",
    flights_empty_sub:
      "Los pasajeros escanean el código con su propio teléfono en lugar de abrir otra app en la tableta.",
  },

  fr: {
    flights_title: "Vérificateur de vols",
    flights_subtitle:
      "Générez un QR code que les passagers peuvent scanner avec leur propre téléphone.",
    flights_qr_title: "QR de statut du vol",
    flights_enter: "Entrez un numéro de vol",
    flights_help:
      "Utilisez le code de la compagnie et le numéro, comme AA123, DL456, UA789 ou WN101.",
    flights_placeholder: "Exemple : AA123",
    flights_button: "Afficher le QR code du vol",
    flights_error:
      "Entrez un code de compagnie et un numéro de vol, comme AA123 ou DL456.",
    flights_scan_help:
      "Scannez avec votre téléphone pour consulter ce vol hors de la tablette du trajet. Cela garde l’écran passager en mode kiosque.",
    flights_empty_title: "Le QR code apparaîtra ici",
    flights_empty_sub:
      "Les passagers scannent le code avec leur propre téléphone au lieu d’ouvrir une autre application sur la tablette.",
  },
};

export default flights;
