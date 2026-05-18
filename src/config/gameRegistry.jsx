import { gameModules } from "../components/games/modules/index.jsx";
import { hydrateImportedGameModules } from "../services/importedGameModulesService.js";

// ===== GAME REGISTRY =====
// All in-house game modules are bundled with the app.
// Developer-imported manifests can expose bundled components as catalog modules.

function isValidGameModule(module) {
  return Boolean(
    module &&
      module.id &&
      module.Component &&
      module.titleKey &&
      module.fallbackTitle
  );
}

export function getBaseGameRegistry(importedModules = []) {
  return [
    ...gameModules,
    ...hydrateImportedGameModules(importedModules),
  ]
    .filter(isValidGameModule)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export const baseGameRegistry = getBaseGameRegistry();

export function getDefaultGameModuleSettings(importedModules = []) {
  return getBaseGameRegistry(importedModules).map((game, index) => {
    const installedByDefault = game.installedByDefault ?? !game.catalogOnlyByDefault;

    return {
      id: game.id,
      installed: installedByDefault,
      enabled:
        installedByDefault && game.enabled !== false,
      order: typeof game.order === "number" ? game.order : (index + 1) * 10,
    };
  });
}

export function getConfiguredGameRegistry(settings = [], importedModules = []) {
  const settingsById = new Map(
    (Array.isArray(settings) ? settings : []).map((setting) => [
      setting.id,
      setting,
    ])
  );

  return getBaseGameRegistry(importedModules)
    .map((game, index) => {
      const setting = settingsById.get(game.id);
      const installedByDefault = game.installedByDefault ?? !game.catalogOnlyByDefault;
      const installed = setting?.installed ?? installedByDefault;

      return {
        ...game,
        installed,
        enabled: setting?.enabled ?? (installed && game.enabled !== false),
        order:
          typeof setting?.order === "number"
            ? setting.order
            : typeof game.order === "number"
            ? game.order
            : (index + 1) * 10,
      };
    })
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getInstalledGameRegistry(settings = [], importedModules = []) {
  return getConfiguredGameRegistry(settings, importedModules).filter(
    (game) => game.installed !== false
  );
}

export function getAvailableGameCatalog(settings = [], importedModules = []) {
  return getConfiguredGameRegistry(settings, importedModules).filter(
    (game) => game.installed === false
  );
}

export function applyGameModuleSettings(settings = [], importedModules = []) {
  return getInstalledGameRegistry(settings, importedModules).filter(
    (game) => game.enabled !== false
  );
}

export const gameRegistry = applyGameModuleSettings(getDefaultGameModuleSettings());

export const defaultGameId = gameRegistry[0]?.id || "trivia";
