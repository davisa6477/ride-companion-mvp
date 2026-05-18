// ===== SECURITY STATUS COPY =====
// Central text for MVP security warnings shown in Admin.
// This is intentionally visible so beta testers/admin users understand that
// the local PIN is a UI gate, not backend authorization.

export const securityStatus = {
  mode: "MVP local PIN",
  severity: "warning",
  title: "MVP Security Notice",
  message:
    "Firebase Admin sign-in is now required before the local PIN can unlock Admin. Firestore rules still need to be tightened so the backend enforces the same protection.",
  nextStep:
    "Next production step: publish restrictive Firestore rules so protected writes require Firebase Auth on the backend.",
};
