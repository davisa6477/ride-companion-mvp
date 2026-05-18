// ===== SECURITY STATUS COPY =====
// Central text for MVP security warnings shown in Admin.
// This is intentionally visible so beta testers/admin users understand that
// the local PIN is a UI gate, not backend authorization.

export const securityStatus = {
  mode: "MVP local PIN",
  severity: "warning",
  title: "MVP Security Notice",
  message:
    "Firebase Admin sign-in protects backend writes, and the local PIN acts as a secondary screen lock for this browser. Paired devices can be removed from Admin and will be deactivated automatically.",
  nextStep:
    "Beta checklist: keep Firebase rules current, verify device pairing/removal, and use the local PIN as a secondary lock—not primary security.",
};
