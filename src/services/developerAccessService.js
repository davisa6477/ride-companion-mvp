const DEVELOPER_SESSION_KEY = "rideCompanion.developerSession";
const DEVELOPER_CODE_KEY = "rideCompanion.developerAccessCode";

// Beta-only local developer gate.
// This keeps the Developer portal out of normal Admin workflows, but it is not
// a substitute for server-side roles/custom claims in production.
const FALLBACK_DEVELOPER_CODE = "RC-DEV-CHANGE-ME";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

export function getStoredDeveloperCode() {
  try {
    return localStorage.getItem(DEVELOPER_CODE_KEY) || FALLBACK_DEVELOPER_CODE;
  } catch {
    return FALLBACK_DEVELOPER_CODE;
  }
}

export function setStoredDeveloperCode(nextCode) {
  const normalizedCode = String(nextCode || "").trim();

  if (!normalizedCode || normalizedCode.length < 8) {
    throw new Error("Developer access code must be at least 8 characters.");
  }

  localStorage.setItem(DEVELOPER_CODE_KEY, normalizedCode);
}

export function getDeveloperSession() {
  try {
    const raw = localStorage.getItem(DEVELOPER_SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;

    if (!session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem(DEVELOPER_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function isDeveloperUnlocked() {
  return Boolean(getDeveloperSession());
}

export function verifyDeveloperAccessCode(code) {
  const storedCode = getStoredDeveloperCode();

  if (String(code || "").trim() !== storedCode) {
    return false;
  }

  localStorage.setItem(
    DEVELOPER_SESSION_KEY,
    JSON.stringify({
      unlockedAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    })
  );

  return true;
}

export function lockDeveloperPortal() {
  localStorage.removeItem(DEVELOPER_SESSION_KEY);
}
