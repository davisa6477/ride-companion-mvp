import triviaGameModule from "./triviaGameModule.jsx";
import blackjackGameModule from "./blackjackGameModule.jsx";
import rideBingoGameModule from "./rideBingoGameModule.jsx";
import emojiGuessGameModule from "./emojiGuessGameModule.jsx";
import ticTacToeGameModule from "./ticTacToeGameModule.jsx";

// ===== PLUG-AND-PLAY GAME MODULE LIST =====
// To add a game:
// 1. Create a game component in components/games.
// 2. Create a module file beside these examples.
// 3. Import it here and add it to gameModules.
//
// To remove/hide a game:
// - Set enabled: false in its module, or remove it from this list.

export const gameModules = [
  triviaGameModule,
  blackjackGameModule,
  rideBingoGameModule,
  emojiGuessGameModule,
  ticTacToeGameModule,
];
