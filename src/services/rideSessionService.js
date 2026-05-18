import { loadLocalPairedDevice } from "./devicePairingService.js";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";

// ===== CURRENT RIDE SESSION ID =====
// For the MVP, all passenger/driver sync uses one shared session document.
// Later this can become a generated ride/session ID.
const SESSION_ID = "current";

// ===== FIRESTORE REFERENCES =====

function getLocalDeviceMetadata() {
  const localDevice = loadLocalPairedDevice();

  if (!localDevice?.deviceId) {
    return {};
  }

  return {
    deviceId: localDevice.deviceId,
    deviceToken: localDevice.deviceToken || "",
    deviceType: localDevice.deviceType || "",
    deviceName: localDevice.deviceName || localDevice.deviceLabel || "",
  };
}

export function getRideSessionRef() {
  return doc(db, "rideSessions", SESSION_ID);
}

export function getRequestsCollectionRef() {
  return collection(db, "rideSessions", SESSION_ID, "requests");
}

// ===== PASSENGER REQUEST CREATION =====
// Called from the passenger Requests page.
// New requests start as pending and are displayed in the driver console.
export async function sendPassengerRequest(request) {
  return addDoc(getRequestsCollectionRef(), {
    ...request,
    status: "pending",
    deviceMetadata: getLocalDeviceMetadata(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ===== PASSENGER REQUEST STATUS UPDATE =====
// Called from the driver console to acknowledge or clear requests.
export async function updatePassengerRequestStatus(requestId, status) {
  const requestRef = doc(db, "rideSessions", SESSION_ID, "requests", requestId);

  return updateDoc(requestRef, {
    status,
    updatedAt: serverTimestamp(),
    updatedByDevice: getLocalDeviceMetadata(),
  });
}

// ===== LIVE PASSENGER REQUEST LISTENER =====
// Used by both the passenger Requests page and the driver console.
// Returns the Firestore unsubscribe function.
export function listenToPassengerRequests(callback) {
  const requestsQuery = query(
    getRequestsCollectionRef(),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(requestsQuery, (snapshot) => {
    const requests = snapshot.docs.map((requestDoc) => ({
      id: requestDoc.id,
      ...requestDoc.data(),
    }));

    callback(requests);
  });
}

// ===== PASSENGER PAGE STATUS SYNC =====
// Called from the passenger tablet whenever the visible passenger page changes.
// The driver console listens to this value through listenToRideSession().
export async function setPassengerPageStatus(pageStatus) {
  return setDoc(
    getRideSessionRef(),
    {
      passengerPage: pageStatus?.page || "home",
      passengerPageLabel: pageStatus?.label || "Home",
      passengerPageUpdatedAt: serverTimestamp(),
      passengerPageUpdatedByDevice: getLocalDeviceMetadata(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ===== PASSENGER LANGUAGE SYNC =====
// Called from the passenger Translation page.
// The driver console listens to this value through listenToRideSession().
export async function setPassengerLanguage(language) {
  return setDoc(
    getRideSessionRef(),
    {
      passengerLanguage: language,
      updatedAt: serverTimestamp(),
      updatedByDevice: getLocalDeviceMetadata(),
    },
    { merge: true }
  );
}

// ===== LIVE RIDE SESSION LISTENER =====
// Used by the driver translation card to follow passenger language changes.
export function listenToRideSession(callback) {
  return onSnapshot(getRideSessionRef(), (snapshot) => {
    callback(snapshot.data() || {});
  });
}
