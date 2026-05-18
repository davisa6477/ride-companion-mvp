// ===== ADMIN AUTH SERVICE =====
// Lightweight browser-local admin gate for MVP/beta.
// This is not a replacement for Firebase Auth or Firestore security rules.
// It hardens the current PIN gate until backend auth is added.

export const ADMIN_MAX_FAILED_ATTEMPTS = 5;
export const ADMIN_LOCKOUT_MS = 2 * 60 * 1000;
export const ADMIN_SESSION_MS = 15 * 60 * 1000;

export function getLockoutRemainingMs(lockedUntil = 0) {
  return Math.max(0, lockedUntil - Date.now());
}

export function isAdminLockedOut(lockedUntil = 0) {
  return getLockoutRemainingMs(lockedUntil) > 0;
}

export function formatLockoutTime(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function verifyAdminPin({
  enteredPin,
  adminPin,
  failedAttempts = 0,
  lockedUntil = 0,
}) {
  if (isAdminLockedOut(lockedUntil)) {
    return {
      success: false,
      failedAttempts,
      lockedUntil,
      message: `Too many attempts. Try again in ${formatLockoutTime(
        getLockoutRemainingMs(lockedUntil)
      )}.`,
    };
  }

  if (String(enteredPin) === String(adminPin)) {
    return {
      success: true,
      failedAttempts: 0,
      lockedUntil: 0,
      sessionExpiresAt: Date.now() + ADMIN_SESSION_MS,
      message: "",
    };
  }

  const nextFailedAttempts = failedAttempts + 1;

  if (nextFailedAttempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
    const nextLockedUntil = Date.now() + ADMIN_LOCKOUT_MS;

    return {
      success: false,
      failedAttempts: 0,
      lockedUntil: nextLockedUntil,
      message: `Too many incorrect attempts. Admin is locked for ${formatLockoutTime(
        ADMIN_LOCKOUT_MS
      )}.`,
    };
  }

  const attemptsRemaining = ADMIN_MAX_FAILED_ATTEMPTS - nextFailedAttempts;

  return {
    success: false,
    failedAttempts: nextFailedAttempts,
    lockedUntil: 0,
    message: `Incorrect PIN. ${attemptsRemaining} attempt${
      attemptsRemaining === 1 ? "" : "s"
    } remaining before lockout.`,
  };
}

export function getAdminSessionRemainingMs(sessionExpiresAt = 0) {
  return Math.max(0, sessionExpiresAt - Date.now());
}
