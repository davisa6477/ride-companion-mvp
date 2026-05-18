import TriviaGame from "../components/games/TriviaGame.jsx";
import BlackjackGame from "../components/games/BlackjackGame.jsx";
import RideBingoGame from "../components/games/RideBingoGame.jsx";
import EmojiGuessGame from "../components/games/EmojiGuessGame.jsx";
import TicTacToeGame from "../components/games/TicTacToeGame.jsx";

// ===== GAME REGISTRY =====
// Controls game order, labels, descriptions, and rendered component.
// Add/remove/swap games here instead of editing GamesPage.jsx branching logic.
export const gameRegistry = [
  {
    id: "trivia",
    titleKey: "games_trivia",
    fallbackTitle: "Ride Trivia",
    descriptionKey: "games_trivia_sub",
    fallbackDescription: "Quick trivia for short rides.",
    Component: TriviaGame,
  },
  {
    id: "blackjack",
    titleKey: "games_blackjack",
    fallbackTitle: "Blackjack",
    descriptionKey: "games_blackjack_sub",
    fallbackDescription: "Classic card game against the dealer.",
    Component: BlackjackGame,
  },
  {
    id: "bingo",
    titleKey: "games_bingo",
    fallbackTitle: "Ride Bingo",
    descriptionKey: "games_bingo_sub",
    fallbackDescription: "Spot ride moments and mark the card.",
    Component: RideBingoGame,
  },
  {
    id: "emoji",
    titleKey: "games_emoji",
    fallbackTitle: "Emoji Guess",
    descriptionKey: "games_emoji_sub",
    fallbackDescription: "Guess the phrase from emoji clues.",
    Component: EmojiGuessGame,
  },
  {
    id: "tictactoe",
    titleKey: "games_ttt",
    fallbackTitle: "Tic Tac Toe",
    descriptionKey: "games_ttt_sub",
    fallbackDescription: "Play against a friend or the computer.",
    Component: TicTacToeGame,
  },
];

export const defaultGameId = gameRegistry[0]?.id || "trivia";
