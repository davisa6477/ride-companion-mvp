import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { getDefaultGameModuleSettings } from "../config/gameRegistry.jsx";

const LOCAL_GAME_MODULE_SETTINGS_KEY = "rideCompanion.gameModuleSettings";
const ADMIN_CONFIG_COLLECTION = "adminConfig";
const GAME_MODULES_DOC_ID = "gameModules";

export function getGameModulesRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, GAME_MODULES_DOC_ID);
}

export function normalizeGameModuleSettings(settings = [], importedModules = []) {
  const defaults = getDefaultGameModuleSettings(importedModules);
  const settingsById = new Map(
    (Array.isArray(settings) ? settings : []).map((setting) => [
      setting.id,
      setting,
    ])
  );

  return defaults.map((defaultSetting) => {
    const setting = settingsById.get(defaultSetting.id);

    const installed = setting?.installed ?? defaultSetting.installed ?? true;

    return {
      id: defaultSetting.id,
      installed,
      enabled: setting?.enabled ?? (installed && defaultSetting.enabled),
      order:
        typeof setting?.order === "number"
          ? setting.order
          : defaultSetting.order,
    };
  });
}

export function loadGameModuleSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_GAME_MODULE_SETTINGS_KEY);
    return normalizeGameModuleSettings(raw ? JSON.parse(raw) : []);
  } catch (error) {
    console.error("Failed to load game module settings:", error);
    return normalizeGameModuleSettings([]);
  }
}

export function saveGameModuleSettings(settings = []) {
  try {
    localStorage.setItem(
      LOCAL_GAME_MODULE_SETTINGS_KEY,
      JSON.stringify(normalizeGameModuleSettings(settings))
    );
  } catch (error) {
    console.error("Failed to save game module settings:", error);
  }
}

export async function getSharedGameModuleSettings(importedModules = []) {
  const snapshot = await getDoc(getGameModulesRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeGameModuleSettings(snapshot.data().gameModules || [], importedModules);
}

export async function saveSharedGameModuleSettings(settings = [], importedModules = []) {
  return setDoc(
    getGameModulesRef(),
    {
      gameModules: normalizeGameModuleSettings(settings, importedModules),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedGameModuleSettings(callback, onError, importedModules = []) {
  return onSnapshot(
    getGameModulesRef(),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? normalizeGameModuleSettings(snapshot.data().gameModules || [], importedModules)
          : null
      );
    },
    (error) => {
      console.error("Failed to listen to shared game module settings:", error);
      if (onError) onError(error);
    }
  );
}
