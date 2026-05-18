// ===== SECURITY STATUS COPY =====
// Central text for MVP security warnings shown in Admin.
// This is intentionally visible so beta testers/admin users understand that
// the local PIN is a UI gate, not backend authorization.

export const securityStatus = {
  mode: "MVP local PIN",
  severity: "warning",
  title: "MVP Security Notice",
  message:
    "The Admin PIN protects this screen in the browser, but it is not Firebase Auth and does not enforce Firestore security rules. Use this for beta/testing only until backend auth is added.",
  nextStep:
    "Next production step: add Firebase Auth/admin claims and publish restrictive Firestore rules.",
};
