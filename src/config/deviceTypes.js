// ===== DEVICE TYPES =====
// Used by the pairing flow so Admin can approve known device roles without
// giving every device an Admin login.

export const DEVICE_TYPES = {
  passengerTablet: {
    id: "passengerTablet",
    label: "Passenger Tablet",
    description: "Reads passenger-safe content and submits requests/guestbook notes.",
  },
  driverConsole: {
    id: "driverConsole",
    label: "Driver Console",
    description: "Displays and manages passenger requests/status during a ride.",
  },
};

export const DEFAULT_DEVICE_TYPE = DEVICE_TYPES.passengerTablet.id;
