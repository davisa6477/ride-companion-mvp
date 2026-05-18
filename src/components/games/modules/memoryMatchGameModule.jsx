import MemoryMatchGame from "../MemoryMatchGame.jsx";

const memoryMatchGameModule = {
  id: "memory",
  enabled: false,
  installedByDefault: false,
  catalogOnlyByDefault: true,
  order: 60,
  priceLabel: "Available",
  titleKey: "games_memory",
  fallbackTitle: "Memory Match",
  descriptionKey: "games_memory_sub",
  fallbackDescription: "Flip tiles and match the pairs.",
  translationKeys: [
    "games_memory",
    "games_memory_sub",
    "memory_quick_game",
    "memory_instructions",
    "memory_moves",
    "memory_pairs",
    "memory_complete",
    "memory_status",
    "memory_new_game",
  ],
  Component: MemoryMatchGame,
};

export default memoryMatchGameModule;
