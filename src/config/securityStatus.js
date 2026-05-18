// ===== SECURITY STATUS COPY =====
// Central text for MVP security warnings shown in Admin.
// This is intentionally visible so beta testers/admin users understand that
// the local PIN is a UI gate, not backend authorization.

export const securityStatus = {
  mode: "MVP local PIN",
  severity: "warning",
  title: "MVP Security Notice",
  message:
    "Firebase Auth support has been added for Admin identity, but Firestore rules are not tightened yet. The local PIN is still a browser UI gate during this transition.",
  nextStep:
    "Next production step: create the Admin user in Firebase Auth, then publish restrictive Firestore rules in the next phase.",
};
