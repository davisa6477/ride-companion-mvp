import TriviaGame from "../components/games/TriviaGame.jsx";
import BlackjackGame from "../components/games/BlackjackGame.jsx";
import RideBingoGame from "../components/games/RideBingoGame.jsx";
import EmojiGuessGame from "../components/games/EmojiGuessGame.jsx";
import TicTacToeGame from "../components/games/TicTacToeGame.jsx";
import MemoryMatchGame from "../components/games/MemoryMatchGame.jsx";

// ===== SAFE IMPORTABLE GAME COMPONENTS =====
// Developer-imported manifests can only use components listed here.
// This keeps imports from executing arbitrary remote code in the passenger app.
export const importableGameComponents = {
  trivia: TriviaGame,
  blackjack: BlackjackGame,
  bingo: RideBingoGame,
  emoji: EmojiGuessGame,
  tictactoe: TicTacToeGame,
  memoryMatch: MemoryMatchGame,
};

export function getImportableComponent(componentKey) {
  return importableGameComponents[componentKey] || null;
}

export const importableComponentKeys = Object.keys(importableGameComponents);
