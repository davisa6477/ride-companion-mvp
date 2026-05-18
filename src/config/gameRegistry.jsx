import { gameModules } from "../components/games/modules/index.jsx";

// ===== GAME REGISTRY =====
// The Games page now reads plug-and-play game modules.
// Individual game metadata lives beside each module in:
// components/games/modules/*GameModule.jsx
//
// Add/remove/swap games by editing the module list, not GamesPage.jsx.

function isValidGameModule(module) {
  return Boolean(
    module &&
      module.id &&
      module.Component &&
      module.titleKey &&
      module.fallbackTitle
  );
}

export const gameRegistry = gameModules
  .filter((module) => module.enabled !== false)
  .filter(isValidGameModule)
  .sort((a, b) => (a.order || 999) - (b.order || 999));

export const defaultGameId = gameRegistry[0]?.id || "trivia";
