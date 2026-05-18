// ===== DRIVER ADMIN PAGE =====
// Controls admin-only passenger tablet content:
// guestbook moderation, local ads, request categories, driver profile,
// profile photo, direct tip options, and admin PIN.
// This page is intentionally kept off passenger navigation and accessed by /admin.

import React, { useEffect, useRef, useState } from "react";
import { Link, Lock, Plus, Trash2 } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import { securityStatus } from "../../config/securityStatus.js";
import { DEVICE_TYPES } from "../../config/deviceTypes.js";
import {
  approvePairingCode,
  listenToPairedDevices,
  listenToPendingPairingCodes,
  removePairedDevice,
  rejectPairingCode,
} from "../../services/devicePairingService.js";
import {
  formatLockoutTime,
  getAdminSessionRemainingMs,
  getLockoutRemainingMs,
  verifyAdminPin,
} from "../../services/adminAuthService.js";
import {
  createFirebaseAdminUser,
  getFirebaseAdminEmail,
  listenToFirebaseAdminAuth,
  signInFirebaseAdmin,
  signOutFirebaseAdmin,
} from "../../services/firebaseAdminAuthService.js";

const PAYMENT_APP_TYPES = [
  { value: "cashapp", label: "Cash App" },
  { value: "venmo", label: "Venmo" },
  { value: "paypal", label: "PayPal" },
  { value: "other", label: "Other" },
];

function cleanCashTag(value) {
  return value.trim().replace(/^\$/, "");
}

function cleanUsername(value) {
  return value.trim().replace(/^@/, "");
}

function buildTipOption(type, identifier, customPlatform, customUrl) {
  const id = Date.now();

  if (type === "cashapp") {
    const cashtag = cleanCashTag(identifier);
    if (!cashtag) return null;
    return {
      id,
      platform: "Cash App",
      label: `$${cashtag}`,
      url: `https://cash.app/$${encodeURIComponent(cashtag)}`,
    };
  }

  if (type === "venmo") {
    const username = cleanUsername(identifier);
    if (!username) return null;
    return {
      id,
      platform: "Venmo",
      label: `@${username}`,
      url: `https://venmo.com/u/${encodeURIComponent(username)}`,
    };
  }

  if (type === "paypal") {
    const paypalName = cleanUsername(identifier);
    if (!paypalName) return null;
    return {
      id,
      platform: "PayPal",
      label: `paypal.me/${paypalName}`,
      url: `https://paypal.me/${encodeURIComponent(paypalName)}`,
    };
  }

  const platform = customPlatform.trim();
  const url = customUrl.trim();

  if (!platform || !url) return null;

  return {
    id,
    platform,
    label: platform,
    url,
  };
}

export default function AdminPage({
  entries,
  setEntries,
  ads,
  setAds,
  adminPin,
  setAdminPin,
  requestCategories,
  setRequestCategories,
  driverProfile,
  setDriverProfile,
  tipOptions,
  setTipOptions,
  appSettings,
  setAppSettings,
}) {
  // ===== ADMIN LOGIN STATE =====
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(0);
  const [lockoutTick, setLockoutTick] = useState(0);

  // ===== FIREBASE ADMIN AUTH STATE =====
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(true);
  const [firebaseEmail, setFirebaseEmail] = useState("");
  const [firebasePassword, setFirebasePassword] = useState("");
  const [firebaseAuthError, setFirebaseAuthError] = useState("");
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirmPassword, setSetupConfirmPassword] = useState("");
  const [setupLocalPin, setSetupLocalPin] = useState("");
  const [setupMessage, setSetupMessage] = useState("");

  // ===== ADMIN SECTION STATE =====
  // Keeps the admin interface separated into simple internal pages instead of
  // scrolling/jumping through one long screen.
  const [adminSection, setAdminSection] = useState("guestbook");

  // ===== DEVICE PAIRING STATE =====
  const [pendingPairingCodes, setPendingPairingCodes] = useState([]);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [pairingMessage, setPairingMessage] = useState("");

  // ===== ADMIN PIN CHANGE STATE =====
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  // ===== CUSTOM REQUEST STATE =====
  const [newRequestCategory, setNewRequestCategory] = useState("Comfort");
  const [newRequestText, setNewRequestText] = useState("");

  // ===== LOCAL AD STATE =====
  const [newAd, setNewAd] = useState({
    businessName: "",
    headline: "",
    description: "",
    category: "Local",
  });

  // ===== TIP OPTION STATE =====
  const [paymentType, setPaymentType] = useState("cashapp");
  const [paymentIdentifier, setPaymentIdentifier] = useState("");
  const [customPaymentPlatform, setCustomPaymentPlatform] = useState("");
  const [customPaymentUrl, setCustomPaymentUrl] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  // ===== DRIVER CAMERA STATE =====
  const driverCameraVideoRef = useRef(null);
  const driverCameraStreamRef = useRef(null);
  const [driverCameraActive, setDriverCameraActive] = useState(false);
  const [driverCameraFacing, setDriverCameraFacing] = useState("user");
  const [driverCameraError, setDriverCameraError] = useState("");

  // ===== DRIVER PROFILE HELPERS =====
  function updateDriverProfile(field, value) {
    setDriverProfile({ ...driverProfile, [field]: value });
  }

  function updateDriverBioTranslation(language, value) {
    setDriverProfile({
      ...driverProfile,
      bioTranslations: {
        ...(driverProfile.bioTranslations || {}),
        [language]: value,
      },
    });
  }

  function updateDriverLocalTipTranslation(language, value) {
    setDriverProfile({
      ...driverProfile,
      localTipTranslations: {
        ...(driverProfile.localTipTranslations || {}),
        [language]: value,
      },
    });
  }

  // ===== APP SETTINGS HELPERS =====
  function updateAppSetting(field, value) {
    setAppSettings({
      ...appSettings,
      [field]: value,
    });
  }

  function normalizeZipCode(value) {
    return value.replace(/[^0-9]/g, "").slice(0, 5);
  }

  function handleDefaultZipChange(value) {
    updateAppSetting("defaultZipCode", normalizeZipCode(value));
  }

  function handleDriverPhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDriverProfile({ ...driverProfile, photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  async function startDriverCamera(facingMode = driverCameraFacing) {
    setDriverCameraError("");

    try {
      if (driverCameraStreamRef.current) {
        driverCameraStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      driverCameraStreamRef.current = stream;
      setDriverCameraFacing(facingMode);
      setDriverCameraActive(true);

      if (driverCameraVideoRef.current) {
        driverCameraVideoRef.current.srcObject = stream;
      }
    } catch {
      setDriverCameraError(
        "Camera access was blocked or is not available on this device."
      );
      setDriverCameraActive(false);
    }
  }

  function stopDriverCamera() {
    if (driverCameraStreamRef.current) {
      driverCameraStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      driverCameraStreamRef.current = null;
    }

    if (driverCameraVideoRef.current) {
      driverCameraVideoRef.current.srcObject = null;
    }

    setDriverCameraActive(false);
  }

  function captureDriverPhoto() {
    const video = driverCameraVideoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (driverCameraFacing === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setDriverProfile({
      ...driverProfile,
      photo: canvas.toDataURL("image/jpeg", 0.85),
    });

    stopDriverCamera();
  }

  useEffect(() => {
    return () => stopDriverCamera();
  }, []);

  // ===== FIREBASE ADMIN AUTH LISTENER =====
  useEffect(() => {
    const unsubscribe = listenToFirebaseAdminAuth((user) => {
      setFirebaseUser(user);
      setFirebaseAuthLoading(false);

      if (!user) {
        setUnlocked(false);
        setSessionExpiresAt(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // ===== DEVICE PAIRING LISTENERS =====
  useEffect(() => {
    if (!unlocked) return undefined;

    const unsubscribePending = listenToPendingPairingCodes(
      setPendingPairingCodes,
      (error) => setPairingMessage(error?.message || "Could not load pairing codes.")
    );

    const unsubscribeDevices = listenToPairedDevices(
      setPairedDevices,
      (error) => setPairingMessage(error?.message || "Could not load paired devices.")
    );

    return () => {
      if (unsubscribePending) unsubscribePending();
      if (unsubscribeDevices) unsubscribeDevices();
    };
  }, [unlocked]);

  // ===== ADMIN LOCKOUT TIMER =====
  useEffect(() => {
    if (!lockedUntil) return undefined;

    const timer = window.setInterval(() => {
      setLockoutTick((value) => value + 1);

      if (getLockoutRemainingMs(lockedUntil) <= 0) {
        setLockedUntil(0);
        setLoginError("");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  // ===== ADMIN SESSION EXPIRATION =====
  useEffect(() => {
    if (!unlocked || !sessionExpiresAt) return undefined;

    const remainingMs = getAdminSessionRemainingMs(sessionExpiresAt);

    if (remainingMs <= 0) {
      lockAdmin("Admin session expired. Please unlock again.");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      lockAdmin("Admin session expired. Please unlock again.");
    }, remainingMs);

    return () => window.clearTimeout(timer);
    // lockAdmin is intentionally defined below and only uses state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, sessionExpiresAt]);

  // ===== FIREBASE ADMIN AUTH FUNCTIONS =====
  async function createAdminIdentity(e) {
    e.preventDefault();
    setFirebaseAuthError("");
    setSetupMessage("");

    if (setupLocalPin !== adminPin) {
      setSetupMessage("Local Admin PIN is required to create the Firebase Admin account.");
      return;
    }

    if (!setupEmail.trim()) {
      setSetupMessage("Enter an admin email address.");
      return;
    }

    if (setupPassword.length < 6) {
      setSetupMessage("Firebase password must be at least 6 characters.");
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setSetupMessage("Password entries do not match.");
      return;
    }

    try {
      await createFirebaseAdminUser(setupEmail, setupPassword);
      setFirebaseEmail(setupEmail);
      setSetupPassword("");
      setSetupConfirmPassword("");
      setSetupLocalPin("");
      setSetupMessage("Firebase Admin account created and signed in.");
      setShowFirebaseSetup(false);
    } catch (error) {
      setSetupMessage(error?.message || "Could not create Firebase Admin account.");
    }
  }

  async function signInAdminIdentity(e) {
    e.preventDefault();
    setFirebaseAuthError("");

    try {
      await signInFirebaseAdmin(firebaseEmail, firebasePassword);
      setFirebasePassword("");
    } catch (error) {
      setFirebaseAuthError(
        error?.message || "Firebase Admin sign-in failed."
      );
    }
  }

  async function signOutAdminIdentity() {
    setFirebaseAuthError("");

    try {
      await signOutFirebaseAdmin();
      lockAdmin("Firebase Admin signed out. Please sign in again.");
    } catch (error) {
      setFirebaseAuthError(
        error?.message || "Firebase Admin sign-out failed."
      );
    }
  }

  // ===== LOGIN FUNCTIONS =====
  function unlock(e) {
    e.preventDefault();

    if (!firebaseAdminSignedIn) {
      setLoginError("Sign in with Firebase Admin before unlocking the local PIN.");
      setPin("");
      return;
    }

    const result = verifyAdminPin({
      enteredPin: pin,
      adminPin,
      failedAttempts,
      lockedUntil,
    });

    if (result.success) {
      setUnlocked(true);
      setLoginError("");
      setFailedAttempts(0);
      setLockedUntil(0);
      setSessionExpiresAt(result.sessionExpiresAt);
      setPin("");
      return;
    }

    setFailedAttempts(result.failedAttempts);
    setLockedUntil(result.lockedUntil);
    setLoginError(result.message);
    setPin("");
  }

  function lockAdmin(message = "") {
    setUnlocked(false);
    setPin("");

    // When used directly as an onClick handler, React passes the click event.
    // Only store actual text messages so the login screen never tries to render an event object.
    setLoginError(typeof message === "string" ? message : "");

    setSessionExpiresAt(0);
  }

  // ===== DEVICE PAIRING FUNCTIONS =====
  async function approveDevicePairing(code) {
    setPairingMessage("");

    try {
      await approvePairingCode(code, firebaseAdminEmail || "admin");
      setPairingMessage(`Pairing code ${code} approved.`);
    } catch (error) {
      setPairingMessage(error?.message || "Could not approve pairing code.");
    }
  }

  async function rejectDevicePairing(code) {
    setPairingMessage("");

    try {
      await rejectPairingCode(code);
      setPairingMessage(`Pairing code ${code} rejected.`);
    } catch (error) {
      setPairingMessage(error?.message || "Could not reject pairing code.");
    }
  }

  async function removeDevice(deviceId) {
    setPairingMessage("");

    try {
      await removePairedDevice(deviceId);
      setPairingMessage("Paired device removed.");
    } catch (error) {
      setPairingMessage(error?.message || "Could not remove paired device.");
    }
  }

  // ===== GUESTBOOK FUNCTIONS =====
  function approveEntry(id) {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, approved: true } : entry
      )
    );
  }

  function deleteEntry(id) {
    setEntries(entries.filter((entry) => entry.id !== id));
  }

  // ===== AD FUNCTIONS =====
  function addAd(e) {
    e.preventDefault();

    if (!newAd.businessName.trim() || !newAd.headline.trim()) return;

    const createdAtMs = Date.now();

    setAds([
      {
        id: String(createdAtMs),
        createdAtMs,
        ...newAd,
        active: true,
      },
      ...ads,
    ]);

    setNewAd({
      businessName: "",
      headline: "",
      description: "",
      category: "Local",
    });
  }

  function toggleAd(id) {
    setAds(
      ads.map((ad) =>
        ad.id === id ? { ...ad, active: !ad.active } : ad
      )
    );
  }

  function deleteAd(id) {
    setAds(ads.filter((ad) => ad.id !== id));
  }

  // ===== ADMIN PIN FUNCTIONS =====
  function changePin(e) {
    e.preventDefault();
    setPinMessage("");

    if (newPin.length < 4) {
      setPinMessage("Admin PIN must be at least 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage("PIN entries do not match.");
      return;
    }

    setAdminPin(newPin);
    setNewPin("");
    setConfirmPin("");
    setPinMessage("Admin PIN updated. Future backend auth can replace this local PIN gate.");
  }

  // ===== CUSTOM REQUEST FUNCTIONS =====
  function addCustomRequest() {
    const trimmedRequest = newRequestText.trim();
    if (!trimmedRequest) return;

    setRequestCategories({
      ...requestCategories,
      [newRequestCategory]: [
        ...(requestCategories[newRequestCategory] || []),
        trimmedRequest,
      ],
    });

    setNewRequestText("");
  }

  function deleteCustomRequest(category, item) {
    setRequestCategories({
      ...requestCategories,
      [category]: requestCategories[category].filter(
        (request) => request !== item
      ),
    });
  }

  // ===== TIP OPTION FUNCTIONS =====
  function addTipOption() {
    setTipMessage("");

    const newTipOption = buildTipOption(
      paymentType,
      paymentIdentifier,
      customPaymentPlatform,
      customPaymentUrl
    );

    if (!newTipOption) {
      setTipMessage("Please complete the required tipping information.");
      return;
    }

    setTipOptions([...(tipOptions || []), newTipOption]);
    setPaymentIdentifier("");
    setCustomPaymentPlatform("");
    setCustomPaymentUrl("");
    setTipMessage("Tip option added.");
  }

  function deleteTipOption(id) {
    setTipOptions((tipOptions || []).filter((option) => option.id !== id));
  }

  function getPaymentPlaceholder() {
    if (paymentType === "cashapp") return "Cashtag, for example AaronDriver";
    if (paymentType === "venmo") return "Venmo username, for example AaronDriver";
    if (paymentType === "paypal") return "PayPal.me name, for example AaronDriver";
    return "";
  }

  const lockoutRemainingMs = getLockoutRemainingMs(lockedUntil);
  const lockedOut = lockoutRemainingMs > 0;
  const sessionRemainingMinutes = Math.max(
    0,
    Math.ceil(getAdminSessionRemainingMs(sessionExpiresAt) / 60000)
  );
  const firebaseAdminEmail = getFirebaseAdminEmail(firebaseUser);
  const firebaseAdminSignedIn = Boolean(firebaseUser);

  // ===== LOCKED ADMIN LOGIN SCREEN =====
  if (!unlocked) {
    return (
      <div className="mx-auto grid max-w-2xl gap-4">
        <PageCard>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <Lock />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-950">
                Driver Admin
              </h2>
              <p className="text-sm text-slate-500">
                Firebase Admin setup/sign-in plus local PIN unlock.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-xl font-black text-amber-950">
              First-time Firebase Admin Setup
            </h3>

            <p className="mt-1 text-sm text-amber-900">
              Use this once to create the Admin email/password account after
              enabling Email/Password in Firebase Authentication.
            </p>

            <form onSubmit={createAdminIdentity} className="mt-4 grid gap-3">
              <input
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                placeholder="New admin email"
                type="email"
                autoComplete="username"
                className="rounded-2xl border border-amber-200 bg-white p-3 outline-none focus:ring-4 focus:ring-amber-100"
              />

              <input
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="New admin password"
                type="password"
                autoComplete="new-password"
                className="rounded-2xl border border-amber-200 bg-white p-3 outline-none focus:ring-4 focus:ring-amber-100"
              />

              <input
                value={setupConfirmPassword}
                onChange={(e) => setSetupConfirmPassword(e.target.value)}
                placeholder="Confirm new admin password"
                type="password"
                autoComplete="new-password"
                className="rounded-2xl border border-amber-200 bg-white p-3 outline-none focus:ring-4 focus:ring-amber-100"
              />

              <input
                value={setupLocalPin}
                onChange={(e) => setSetupLocalPin(e.target.value)}
                placeholder="Current local Admin PIN"
                type="password"
                inputMode="numeric"
                className="rounded-2xl border border-amber-200 bg-white p-3 outline-none focus:ring-4 focus:ring-amber-100"
              />

              <button className="rounded-2xl bg-amber-500 p-3 font-black text-amber-950 shadow">
                Create Firebase Admin Account
              </button>

              {setupMessage && (
                <div className="rounded-2xl bg-white p-3 text-sm font-bold text-amber-950">
                  {setupMessage}
                </div>
              )}
            </form>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xl font-black text-slate-950">
              Firebase Admin Sign-In
            </h3>

            {firebaseAuthLoading ? (
              <p className="mt-2 text-sm text-slate-500">
                Checking Firebase sign-in...
              </p>
            ) : firebaseUser ? (
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                  Signed in as {firebaseAdminEmail}
                </div>

                <button
                  type="button"
                  onClick={signOutAdminIdentity}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700"
                >
                  Sign out Firebase Admin
                </button>
              </div>
            ) : (
              <form onSubmit={signInAdminIdentity} className="mt-3 grid gap-3">
                <input
                  value={firebaseEmail}
                  onChange={(e) => setFirebaseEmail(e.target.value)}
                  placeholder="Admin email"
                  type="email"
                  autoComplete="username"
                  className="rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:ring-4 focus:ring-slate-200"
                />

                <input
                  value={firebasePassword}
                  onChange={(e) => setFirebasePassword(e.target.value)}
                  placeholder="Admin password"
                  type="password"
                  autoComplete="current-password"
                  className="rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:ring-4 focus:ring-slate-200"
                />

                <button className="rounded-2xl bg-slate-950 p-3 font-black text-white">
                  Sign in with Firebase
                </button>
              </form>
            )}

            {firebaseAuthError && (
              <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-black text-rose-900">
                {firebaseAuthError}
              </div>
            )}
          </div>

          <form onSubmit={unlock} className="mt-4 grid gap-3">
            <h3 className="text-xl font-black text-slate-950">
              Local PIN Unlock
            </h3>

            {!firebaseAdminSignedIn && (
              <div className="rounded-2xl bg-amber-100 p-3 text-sm font-black text-amber-950">
                Firebase Admin sign-in is required before Local PIN Unlock is available.
              </div>
            )}

            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter admin PIN"
              type="password"
              inputMode="numeric"
              disabled={lockedOut || !firebaseAdminSignedIn}
              className="rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
            />

            {loginError && (
              <div className="rounded-2xl bg-rose-100 p-4 text-sm font-black text-rose-900">
                {loginError}
              </div>
            )}

            <button
              disabled={lockedOut || !firebaseAdminSignedIn}
              className="rounded-2xl bg-slate-950 p-4 text-lg font-black text-white shadow-lg disabled:opacity-50"
            >
              {!firebaseAdminSignedIn
                ? "Sign in with Firebase first"
                : lockedOut
                ? `Locked ${formatLockoutTime(lockoutRemainingMs)}`
                : "Unlock Local PIN"}
            </button>

            <p className="text-sm text-slate-500">
              The local PIN remains active during this transition. Firebase Auth
              will protect Firestore writes after the rules phase.
            </p>
          </form>
        </PageCard>
      </div>
    );
  }

  const pending = entries.filter((entry) => !entry.approved);
  const approved = entries.filter((entry) => entry.approved);

  // ===== UNLOCKED ADMIN PANEL =====
  return (
    <div className="grid gap-5">
      <PageCard className="lg:col-span-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Admin Unlocked
            </h2>

            <p className="text-sm text-slate-500">
              Choose a section below. Each section opens as its own admin page.
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              Session expires in about {sessionRemainingMinutes} minute
              {sessionRemainingMinutes === 1 ? "" : "s"}.
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              Firebase Admin: {firebaseAdminEmail || "not signed in"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {firebaseUser && (
              <button
                type="button"
                onClick={signOutAdminIdentity}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700"
              >
                Sign Out Firebase
              </button>
            )}

            <button
              type="button"
              onClick={() => lockAdmin()}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
            >
              Lock Admin
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="font-black">{securityStatus.title}</div>
          <p className="mt-1">{securityStatus.message}</p>
          <p className="mt-2 font-bold">{securityStatus.nextStep}</p>
        </div>

        {/* ===== ADMIN INTERNAL PAGE NAVIGATION ===== */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-8">
          {[
            ["guestbook", "Guestbook"],
            ["pin", "PIN"],
            ["profile", "Profile"],
            ["settings", "Settings"],
            ["pairing", "Pairing"],
            ["tips", "Tips"],
            ["requests", "Requests"],
            ["ads", "Ads"],
          ].map(([sectionId, label]) => (
            <button
              key={sectionId}
              type="button"
              onClick={() => setAdminSection(sectionId)}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                adminSection === sectionId
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageCard>

      {adminSection === "guestbook" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* ===== GUESTBOOK MODERATION ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Guestbook Moderation
        </h2>

        <div className="mt-4 grid gap-3">
          {pending.length === 0 ? (
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              No pending messages.
            </div>
          ) : (
            pending.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-slate-100 p-4">
                <div className="font-black">{entry.name}</div>
                <p className="mt-1 text-slate-700">{entry.message}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => approveEntry(entry.id)}
                    className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-xl bg-white px-4 py-2 font-bold text-slate-950"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PageCard>

      {/* ===== APPROVED GUESTBOOK ENTRIES ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Approved Guestbook Entries
        </h2>

        <div className="mt-4 grid gap-3">
          {approved.length === 0 ? (
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              No approved messages.
            </div>
          ) : (
            approved.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-slate-100 p-4">
                <div className="font-black">{entry.name}</div>
                <p className="mt-1 text-slate-700">{entry.message}</p>

                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  className="mt-3 rounded-xl bg-white px-4 py-2 font-bold text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </PageCard>

        </div>
      )}

      {adminSection === "pin" && (
        <div className="mx-auto w-full max-w-2xl">
          {/* ===== ADMIN PIN SETTINGS ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Change Admin PIN
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Update the driver admin PIN for this browser.
        </p>

        <form onSubmit={changePin} className="mt-4 grid gap-3">
          <input
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="New admin PIN"
            type="password"
            inputMode="numeric"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <input
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Confirm new admin PIN"
            type="password"
            inputMode="numeric"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <button className="rounded-2xl bg-slate-950 p-3 font-black text-white">
            Update PIN
          </button>

          {pinMessage && (
            <div className="rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
              {pinMessage}
            </div>
          )}
        </form>
      </PageCard>

        </div>
      )}

      {adminSection === "profile" && (
        <div className="mx-auto w-full max-w-4xl">
          {/* ===== DRIVER PROFILE SETTINGS ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Meet Your Driver
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          These details appear on the main passenger welcome screen.
        </p>

        <div className="mt-4 grid gap-3">
          {/* ===== DRIVER PROFILE BASIC INFO ===== */}
          <input
            value={driverProfile.name}
            onChange={(e) => updateDriverProfile("name", e.target.value)}
            placeholder="Driver name"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <textarea
            value={driverProfile.bio}
            onChange={(e) => updateDriverProfile("bio", e.target.value)}
            placeholder="Short driver intro"
            rows={4}
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <input
            value={driverProfile.localTip}
            onChange={(e) => updateDriverProfile("localTip", e.target.value)}
            placeholder="Favorite local tip or recommendation"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          {/* ===== DRIVER PROFILE MANUAL TRANSLATIONS ===== */}
          <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
            <div>
              <div className="text-sm font-black text-slate-700">
                Spanish translations
              </div>
              <div className="text-xs text-slate-500">
                Optional. Passenger screen falls back to English if blank.
              </div>
            </div>

            <textarea
              value={driverProfile.bioTranslations?.es || ""}
              onChange={(e) => updateDriverBioTranslation("es", e.target.value)}
              placeholder="Spanish driver intro"
              rows={3}
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />

            <input
              value={driverProfile.localTipTranslations?.es || ""}
              onChange={(e) =>
                updateDriverLocalTipTranslation("es", e.target.value)
              }
              placeholder="Spanish local tip"
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
            <div>
              <div className="text-sm font-black text-slate-700">
                French translations
              </div>
              <div className="text-xs text-slate-500">
                Optional. Passenger screen falls back to English if blank.
              </div>
            </div>

            <textarea
              value={driverProfile.bioTranslations?.fr || ""}
              onChange={(e) => updateDriverBioTranslation("fr", e.target.value)}
              placeholder="French driver intro"
              rows={3}
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />

            <input
              value={driverProfile.localTipTranslations?.fr || ""}
              onChange={(e) =>
                updateDriverLocalTipTranslation("fr", e.target.value)
              }
              placeholder="French local tip"
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />
          </div>

          {/* ===== DRIVER PROFILE PHOTO ===== */}
          <div className="grid gap-3 rounded-2xl border border-slate-200 p-3">
            <label className="text-sm font-black text-slate-700">
              Profile photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleDriverPhotoUpload}
              className="rounded-2xl border border-slate-200 p-3 text-sm"
            />

            <div className="flex flex-wrap gap-2">
              {!driverCameraActive ? (
                <button
                  type="button"
                  onClick={() => startDriverCamera(driverCameraFacing)}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
                >
                  Take Photo
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={captureDriverPhoto}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                  >
                    Use Photo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startDriverCamera(
                        driverCameraFacing === "user"
                          ? "environment"
                          : "user"
                      )
                    }
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"
                  >
                    Switch Camera
                  </button>

                  <button
                    type="button"
                    onClick={stopDriverCamera}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"
                  >
                    Cancel Camera
                  </button>
                </>
              )}
            </div>

            {driverCameraError && (
              <div className="rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-900">
                {driverCameraError}
              </div>
            )}

            {driverCameraActive && (
              <div className="overflow-hidden rounded-2xl bg-slate-950">
                <video
                  ref={driverCameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-64 w-full object-cover ${
                    driverCameraFacing === "user" ? "scale-x-[-1]" : ""
                  }`}
                />
              </div>
            )}
          </div>

          {driverProfile.photo && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3">
              <img
                src={driverProfile.photo}
                alt="Driver preview"
                className="h-20 w-20 rounded-2xl object-cover"
              />

              <button
                type="button"
                onClick={() => updateDriverProfile("photo", "")}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>
      </PageCard>

        </div>
      )}


      {adminSection === "settings" && (
        <div className="mx-auto w-full max-w-2xl">
          {/* ===== APP SETTINGS ===== */}
          <PageCard>
            <h2 className="text-2xl font-black text-slate-950">
              App Settings
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Global settings used by passenger pages. These are still stored in
              this browser until the Firestore settings sync is added.
            </p>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-black text-slate-700">
                  Default ZIP Code
                </label>

                <input
                  value={appSettings?.defaultZipCode || ""}
                  onChange={(e) => handleDefaultZipChange(e.target.value)}
                  placeholder="64801"
                  inputMode="numeric"
                  maxLength={5}
                  className="rounded-2xl border border-slate-200 p-3 outline-none"
                />

                <p className="text-xs text-slate-500">
                  Used later as the fallback for Weather and Local when device
                  location is unavailable or denied.
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-black text-slate-700">
                  Default Location Label
                </label>

                <input
                  value={appSettings?.defaultLocationLabel || ""}
                  onChange={(e) =>
                    updateAppSetting("defaultLocationLabel", e.target.value)
                  }
                  placeholder="Joplin, MO"
                  className="rounded-2xl border border-slate-200 p-3 outline-none"
                />

                <p className="text-xs text-slate-500">
                  Passenger-facing label for the fallback location.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                Current fallback:{" "}
                <span className="font-black text-slate-950">
                  {appSettings?.defaultLocationLabel || "Joplin, MO"}
                </span>{" "}
                <span className="font-black text-slate-950">
                  {appSettings?.defaultZipCode
                    ? `(${appSettings.defaultZipCode})`
                    : ""}
                </span>
              </div>
            </div>
          </PageCard>
        </div>
      )}


      {adminSection === "pairing" && (
        <div className="mx-auto w-full max-w-5xl">
          <PageCard>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Link />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Pair Devices
                </h2>
                <p className="text-sm text-slate-500">
                  Approve passenger tablets or driver consoles without putting Admin credentials on those devices.
                </p>
              </div>
            </div>

            {pairingMessage && (
              <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
                {pairingMessage}
              </div>
            )}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Pending Pairing Codes
                </h3>

                <div className="mt-3 grid gap-3">
                  {pendingPairingCodes.length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
                      No pending pairing codes.
                    </div>
                  ) : (
                    pendingPairingCodes.map((item) => (
                      <div
                        key={item.code || item.id}
                        className="rounded-2xl bg-slate-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-2xl font-black tracking-widest text-slate-950">
                              {item.code || item.id}
                            </div>
                            <div className="mt-1 text-sm font-bold text-slate-600">
                              {DEVICE_TYPES[item.deviceType]?.label || item.deviceType}
                            </div>
                            {(item.deviceName || item.deviceLabel) && (
                              <div className="text-sm text-slate-500">
                                {item.deviceName || item.deviceLabel}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => approveDevicePairing(item.code || item.id)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => rejectDevicePairing(item.code || item.id)}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-black text-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Paired Devices
                </h3>

                <div className="mt-3 grid gap-3">
                  {pairedDevices.length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
                      No paired devices yet.
                    </div>
                  ) : (
                    pairedDevices.map((device) => (
                      <div
                        key={device.deviceId || device.id}
                        className="rounded-2xl bg-slate-100 p-4"
                      >
                        <div className="font-black text-slate-950">
                          {DEVICE_TYPES[device.deviceType]?.label || device.deviceType}
                        </div>
                        {(device.deviceName || device.deviceLabel) && (
                          <div className="text-sm text-slate-500">
                            {device.deviceName || device.deviceLabel}
                          </div>
                        )}
                        <div className="mt-1 break-all text-xs text-slate-400">
                          {device.deviceId || device.id}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDevice(device.deviceId || device.id)}
                          className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-black text-rose-700"
                        >
                          Remove Device
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </PageCard>
        </div>
      )}

      {adminSection === "tips" && (
        <div className="mx-auto w-full max-w-2xl">
          {/* ===== DIRECT TIP OPTIONS ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Direct Tip Options
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Add the payment apps you actually use. Passengers will only see the
          options listed here.
        </p>

        <div className="mt-4 grid gap-3">
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          >
            {PAYMENT_APP_TYPES.map((app) => (
              <option key={app.value} value={app.value}>
                {app.label}
              </option>
            ))}
          </select>

          {paymentType === "other" ? (
            <>
              <input
                value={customPaymentPlatform}
                onChange={(e) => setCustomPaymentPlatform(e.target.value)}
                placeholder="App or platform name"
                className="rounded-2xl border border-slate-200 p-3 outline-none"
              />

              <input
                value={customPaymentUrl}
                onChange={(e) => setCustomPaymentUrl(e.target.value)}
                placeholder="Payment link URL"
                className="rounded-2xl border border-slate-200 p-3 outline-none"
              />
            </>
          ) : (
            <input
              value={paymentIdentifier}
              onChange={(e) => setPaymentIdentifier(e.target.value)}
              placeholder={getPaymentPlaceholder()}
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />
          )}

          <button
            type="button"
            onClick={addTipOption}
            className="rounded-2xl bg-slate-950 p-3 font-black text-white"
          >
            Add Tip Option
          </button>

          {tipMessage && (
            <div className="rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
              {tipMessage}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-2">
          {(tipOptions || []).length === 0 ? (
            <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
              No direct tip options added yet.
            </div>
          ) : (
            tipOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3"
              >
                <div>
                  <div className="font-black text-slate-950">
                    {option.platform}
                  </div>

                  <div className="text-sm text-slate-500">
                    {option.label}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTipOption(option.id)}
                  className="rounded-xl bg-white p-2 text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </PageCard>

        </div>
      )}

      {adminSection === "requests" && (
        <div className="mx-auto w-full max-w-5xl">
          {/* ===== CUSTOM RIDE REQUESTS ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Custom Ride Requests
        </h2>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <select
              value={newRequestCategory}
              onChange={(e) => setNewRequestCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            >
              {Object.keys(requestCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              value={newRequestText}
              onChange={(e) => setNewRequestText(e.target.value)}
              placeholder="Add custom request"
              className="rounded-2xl border border-slate-200 p-3 outline-none"
            />

            <button
              type="button"
              onClick={addCustomRequest}
              className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"
            >
              Add
            </button>
          </div>

          <div className="grid max-h-[320px] gap-3 overflow-auto pr-2">
            {Object.entries(requestCategories).map(([category, items]) => (
              <div key={category} className="rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 text-lg font-black text-slate-950">
                  {category}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((item) => (
                    <div
                      key={`${category}-${item}`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      <span>{item}</span>

                      <button
                        type="button"
                        onClick={() => deleteCustomRequest(category, item)}
                        className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageCard>

        </div>
      )}

      {adminSection === "ads" && (
        <div className="mx-auto w-full max-w-3xl">
          {/* ===== LOCAL ADS ===== */}
      <PageCard>
        <h2 className="text-2xl font-black text-slate-950">
          Add Local Ad
        </h2>

        <form onSubmit={addAd} className="mt-4 grid gap-3">
          <input
            value={newAd.businessName}
            onChange={(e) =>
              setNewAd({ ...newAd, businessName: e.target.value })
            }
            placeholder="Business name"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <input
            value={newAd.headline}
            onChange={(e) =>
              setNewAd({ ...newAd, headline: e.target.value })
            }
            placeholder="Headline / offer"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <input
            value={newAd.category}
            onChange={(e) =>
              setNewAd({ ...newAd, category: e.target.value })
            }
            placeholder="Category"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <textarea
            value={newAd.description}
            onChange={(e) =>
              setNewAd({ ...newAd, description: e.target.value })
            }
            placeholder="Description"
            rows={3}
            className="rounded-2xl border border-slate-200 p-3 outline-none"
          />

          <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 p-3 font-black text-white">
            <Plus size={18} />
            Add Ad
          </button>
        </form>

        <div className="mt-5 grid gap-2">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3"
            >
              <button
                type="button"
                onClick={() => toggleAd(ad.id)}
                className="flex-1 text-left"
              >
                <div className="font-black text-slate-950">
                  {ad.businessName}
                </div>

                <div className="text-sm text-slate-500">
                  {ad.active ? "Active" : "Inactive"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => deleteAd(ad.id)}
                className="rounded-xl bg-white p-2 text-rose-700 hover:bg-rose-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </PageCard>
        </div>
      )}
    </div>
  );
}
