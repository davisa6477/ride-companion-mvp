import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { DEFAULT_DEVICE_TYPE } from "../config/deviceTypes.js";

// ===== DEVICE PAIRING SERVICE =====
// Foundation for YouTube-TV-style device pairing.
// Devices do not need Admin login. They generate a short code, Admin approves
// the code, and the device stores a paired device record locally.

const PAIRING_CODES_COLLECTION = "pairingCodes";
const PAIRED_DEVICES_COLLECTION = "pairedDevices";
const LOCAL_PAIRED_DEVICE_KEY = "rideCompanion.pairedDevice";

function createRandomCode() {
  const number = Math.floor(100000 + Math.random() * 900000);
  return String(number);
}

function createDeviceId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDeviceToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `token-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPairingCodeRef(code) {
  return doc(db, PAIRING_CODES_COLLECTION, String(code));
}

export function getPairedDeviceRef(deviceId) {
  return doc(db, PAIRED_DEVICES_COLLECTION, String(deviceId));
}

export function loadLocalPairedDevice() {
  try {
    const raw = localStorage.getItem(LOCAL_PAIRED_DEVICE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to load paired device:", error);
    return null;
  }
}

export function saveLocalPairedDevice(pairedDevice) {
  try {
    localStorage.setItem(LOCAL_PAIRED_DEVICE_KEY, JSON.stringify(pairedDevice));
  } catch (error) {
    console.error("Failed to save paired device:", error);
  }
}

export function clearLocalPairedDevice() {
  try {
    localStorage.removeItem(LOCAL_PAIRED_DEVICE_KEY);
  } catch (error) {
    console.error("Failed to clear paired device:", error);
  }
}

export async function createPairingCode({
  deviceType = DEFAULT_DEVICE_TYPE,
  deviceLabel = "",
} = {}) {
  const deviceId = createDeviceId();
  const deviceToken = createDeviceToken();
  const code = createRandomCode();
  const normalizedDeviceLabel = String(deviceLabel || "").trim();

  if (!normalizedDeviceLabel) {
    throw new Error("Device name is required.");
  }

  const pendingDevice = {
    deviceId,
    deviceToken,
    code,
    deviceType,
    deviceLabel: normalizedDeviceLabel,
    deviceName: normalizedDeviceLabel,
    status: "pending",
    configId: "default",
    createdAtMs: Date.now(),
  };

  await setDoc(getPairingCodeRef(code), {
    ...pendingDevice,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return pendingDevice;
}

export function listenToPairingCode(code, callback, onError) {
  return onSnapshot(
    getPairingCodeRef(code),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error("Failed to listen to pairing code:", error);
      if (onError) onError(error);
    }
  );
}

export function listenToPendingPairingCodes(callback, onError) {
  return onSnapshot(
    collection(db, PAIRING_CODES_COLLECTION),
    (snapshot) => {
      const pendingCodes = snapshot.docs
        .map((codeDoc) => ({
          id: codeDoc.id,
          ...codeDoc.data(),
        }))
        .filter((item) => item.status === "pending")
        .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

      callback(pendingCodes);
    },
    (error) => {
      console.error("Failed to listen to pending pairing codes:", error);
      if (onError) onError(error);
    }
  );
}


async function deletePairingCodesForDevice(deviceId) {
  if (!deviceId) return;

  const pairingQuery = query(
    collection(db, PAIRING_CODES_COLLECTION),
    where("deviceId", "==", String(deviceId))
  );

  const snapshot = await getDocs(pairingQuery);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.docs.forEach((codeDoc) => {
    batch.delete(codeDoc.ref);
  });

  await batch.commit();
}

export async function approvePairingCode(code, approvedBy = "") {
  const codeRef = getPairingCodeRef(code);
  const snapshot = await getDoc(codeRef);

  if (!snapshot.exists()) {
    throw new Error("Pairing code not found.");
  }

  const pairing = snapshot.data();

  if (!pairing.deviceId) {
    throw new Error("Pairing code is missing a device ID.");
  }

  const pairedDevice = {
    deviceId: pairing.deviceId,
    deviceToken: pairing.deviceToken || "",
    deviceType: pairing.deviceType || DEFAULT_DEVICE_TYPE,
    deviceLabel: pairing.deviceLabel || "",
    configId: pairing.configId || "default",
    approved: true,
    linkedAtMs: Date.now(),
    approvedBy,
  };

  await setDoc(getPairedDeviceRef(pairing.deviceId), {
    ...pairedDevice,
    linkedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(codeRef, {
    status: "approved",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return pairedDevice;
}

export async function rejectPairingCode(code) {
  const codeRef = getPairingCodeRef(code);
  await updateDoc(codeRef, {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}

export async function deletePairingCode(code) {
  return deleteDoc(getPairingCodeRef(code));
}

export async function cleanupPairingCodesForDevice(deviceId) {
  return deletePairingCodesForDevice(deviceId);
}

export function listenToPairedDevices(callback, onError) {
  return onSnapshot(
    collection(db, PAIRED_DEVICES_COLLECTION),
    (snapshot) => {
      const devices = snapshot.docs
        .map((deviceDoc) => ({
          id: deviceDoc.id,
          ...deviceDoc.data(),
        }))
        .sort((a, b) => (b.linkedAtMs || 0) - (a.linkedAtMs || 0));

      callback(devices);
    },
    (error) => {
      console.error("Failed to listen to paired devices:", error);
      if (onError) onError(error);
    }
  );
}

export async function removePairedDevice(deviceId) {
  // Remove both the approved paired-device record and any pairing-code
  // documents that were associated with that same device. This prevents stale
  // approved/rejected/pending codes from lingering after Admin removes a device.
  await deletePairingCodesForDevice(deviceId);
  return deleteDoc(getPairedDeviceRef(deviceId));
}

export function buildLocalPairedDeviceFromPairing(pairing) {
  return {
    deviceId: pairing.deviceId,
    deviceToken: pairing.deviceToken || "",
    deviceType: pairing.deviceType || DEFAULT_DEVICE_TYPE,
    deviceLabel: pairing.deviceLabel || "",
    configId: pairing.configId || "default",
    pairedAtMs: Date.now(),
  };
}

// ===== LOCAL PAIRED DEVICE VALIDATION =====
// Keeps a browser's local pairing from remaining trusted after Admin removes
// the pairedDevices/{deviceId} document in Firebase.
export function listenToLocalPairedDeviceValidation(callback, onError) {
  const localDevice = loadLocalPairedDevice();

  if (!localDevice?.deviceId) {
    callback({
      pairedDevice: null,
      valid: false,
      reason: "no-local-pairing",
    });

    return () => {};
  }

  return onSnapshot(
    getPairedDeviceRef(localDevice.deviceId),
    (snapshot) => {
      if (!snapshot.exists()) {
        clearLocalPairedDevice();

        callback({
          pairedDevice: null,
          valid: false,
          reason: "pairing-removed",
        });

        return;
      }

      const remoteDevice = {
        deviceId: snapshot.id,
        ...snapshot.data(),
      };

      if (
        localDevice.deviceToken &&
        remoteDevice.deviceToken &&
        localDevice.deviceToken !== remoteDevice.deviceToken
      ) {
        clearLocalPairedDevice();

        callback({
          pairedDevice: null,
          valid: false,
          reason: "pairing-token-mismatch",
        });

        return;
      }

      if (remoteDevice.approved === false) {
        clearLocalPairedDevice();

        callback({
          pairedDevice: null,
          valid: false,
          reason: "pairing-not-approved",
        });

        return;
      }

      const syncedDevice = {
        ...localDevice,
        ...remoteDevice,
        approved: true,
      };

      saveLocalPairedDevice(syncedDevice);

      callback({
        pairedDevice: syncedDevice,
        valid: true,
        reason: "paired",
      });
    },
    (error) => {
      console.error("Failed to validate local paired device:", error);
      if (onError) onError(error);
    }
  );
}
