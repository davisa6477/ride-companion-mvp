import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { getImportableComponent, importableComponentKeys } from "../config/importableGameComponents.jsx";

const LOCAL_IMPORTED_GAME_MODULES_KEY = "rideCompanion.importedGameModules";
const ADMIN_CONFIG_COLLECTION = "adminConfig";
const IMPORTED_GAME_MODULES_DOC_ID = "importedGameModules";

export function getImportedGameModulesRef() {
  return doc(db, ADMIN_CONFIG_COLLECTION, IMPORTED_GAME_MODULES_DOC_ID);
}

export function normalizeImportedGameModuleManifest(rawManifest) {
  const manifest =
    typeof rawManifest === "string" ? JSON.parse(rawManifest) : rawManifest;

  if (!manifest || typeof manifest !== "object") {
    throw new Error("Module manifest must be a JSON object.");
  }

  const id = String(manifest.id || "").trim();
  const componentKey = String(manifest.componentKey || "").trim();

  if (!id) {
    throw new Error("Module manifest requires an id.");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error("Module id can only contain letters, numbers, dashes, and underscores.");
  }

  if (!componentKey) {
    throw new Error("Module manifest requires a componentKey.");
  }

  if (!getImportableComponent(componentKey)) {
    throw new Error(
      `Unknown componentKey "${componentKey}". Available keys: ${importableComponentKeys.join(", ")}`
    );
  }

  const fallbackTitle = String(manifest.fallbackTitle || "").trim();
  const fallbackDescription = String(manifest.fallbackDescription || "").trim();

  if (!fallbackTitle || !fallbackDescription) {
    throw new Error("Module manifest requires fallbackTitle and fallbackDescription.");
  }

  return {
    id,
    componentKey,
    enabled: Boolean(manifest.enabled),
    installedByDefault: Boolean(manifest.installedByDefault),
    catalogOnlyByDefault: manifest.catalogOnlyByDefault !== false,
    order:
      typeof manifest.order === "number" && Number.isFinite(manifest.order)
        ? manifest.order
        : 900,
    priceLabel: String(manifest.priceLabel || "Available").trim(),
    titleKey: String(manifest.titleKey || `games_${id}`).trim(),
    fallbackTitle,
    descriptionKey: String(manifest.descriptionKey || `games_${id}_sub`).trim(),
    fallbackDescription,
    translationKeys: Array.isArray(manifest.translationKeys)
      ? manifest.translationKeys.map((key) => String(key)).filter(Boolean)
      : [],
    developerNotes: String(manifest.developerNotes || "").trim(),
    importedAtMs: Date.now(),
  };
}

export function hydrateImportedGameModules(modules = []) {
  return (Array.isArray(modules) ? modules : [])
    .map((module) => {
      const Component = getImportableComponent(module.componentKey);

      if (!Component) return null;

      return {
        ...module,
        Component,
      };
    })
    .filter(Boolean);
}

export function normalizeImportedGameModules(modules = []) {
  const seen = new Set();

  return (Array.isArray(modules) ? modules : [])
    .map((module) => {
      try {
        return normalizeImportedGameModuleManifest(module);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((module) => {
      if (seen.has(module.id)) return false;
      seen.add(module.id);
      return true;
    });
}

export function loadImportedGameModules() {
  try {
    const raw = localStorage.getItem(LOCAL_IMPORTED_GAME_MODULES_KEY);
    return normalizeImportedGameModules(raw ? JSON.parse(raw) : []);
  } catch (error) {
    console.error("Failed to load imported game modules:", error);
    return [];
  }
}

export function saveImportedGameModules(modules = []) {
  try {
    localStorage.setItem(
      LOCAL_IMPORTED_GAME_MODULES_KEY,
      JSON.stringify(normalizeImportedGameModules(modules))
    );
  } catch (error) {
    console.error("Failed to save imported game modules:", error);
  }
}

export async function getSharedImportedGameModules() {
  const snapshot = await getDoc(getImportedGameModulesRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeImportedGameModules(snapshot.data().modules || []);
}

export async function saveSharedImportedGameModules(modules = []) {
  return setDoc(
    getImportedGameModulesRef(),
    {
      modules: normalizeImportedGameModules(modules),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToSharedImportedGameModules(callback, onError) {
  return onSnapshot(
    getImportedGameModulesRef(),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? normalizeImportedGameModules(snapshot.data().modules || [])
          : null
      );
    },
    (error) => {
      console.error("Failed to listen to imported game modules:", error);
      if (onError) onError(error);
    }
  );
}

export const exampleGameModuleManifest = {
  id: "memory-deluxe",
  componentKey: "memoryMatch",
  fallbackTitle: "Memory Match Deluxe",
  fallbackDescription: "A ride-friendly memory matching game.",
  titleKey: "games_memory_deluxe",
  descriptionKey: "games_memory_deluxe_sub",
  priceLabel: "Available",
  catalogOnlyByDefault: true,
  installedByDefault: false,
  enabled: false,
  order: 910,
  translationKeys: [
    "games_memory_deluxe",
    "games_memory_deluxe_sub"
  ],
  developerNotes: "This example reuses the bundled Memory Match component."
};
