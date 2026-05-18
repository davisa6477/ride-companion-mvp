import { gameModules } from "../components/games/modules/index.jsx";

// ===== GAME REGISTRY =====
// The Games page reads plug-and-play game modules.
// Admin can activate/deactivate and reorder installed modules through
// gameModuleSettings, without editing GamesPage.jsx.

function isValidGameModule(module) {
  return Boolean(
    module &&
      module.id &&
      module.Component &&
      module.titleKey &&
      module.fallbackTitle
  );
}

export const baseGameRegistry = gameModules
  .filter(isValidGameModule)
  .sort((a, b) => (a.order || 999) - (b.order || 999));

export function getDefaultGameModuleSettings() {
  return baseGameRegistry.map((game, index) => ({
    id: game.id,
    enabled: game.enabled !== false,
    order: typeof game.order === "number" ? game.order : (index + 1) * 10,
  }));
}

export function applyGameModuleSettings(settings = []) {
  const settingsById = new Map(
    (Array.isArray(settings) ? settings : []).map((setting) => [
      setting.id,
      setting,
    ])
  );

  return baseGameRegistry
    .map((game, index) => {
      const setting = settingsById.get(game.id);

      return {
        ...game,
        enabled: setting?.enabled ?? game.enabled !== false,
        order:
          typeof setting?.order === "number"
            ? setting.order
            : typeof game.order === "number"
            ? game.order
            : (index + 1) * 10,
      };
    })
    .filter((game) => game.enabled !== false)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export const gameRegistry = applyGameModuleSettings(getDefaultGameModuleSettings());

export const defaultGameId = gameRegistry[0]?.id || "trivia";
