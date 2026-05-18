import TicTacToeGame from "../TicTacToeGame.jsx";

const ticTacToeGameModule = {
  id: "tictactoe",
  enabled: true,
  order: 50,
  titleKey: "games_ttt",
  fallbackTitle: "Tic Tac Toe",
  descriptionKey: "games_ttt_sub",
  fallbackDescription: "Play against a friend or the computer.",
  Component: TicTacToeGame,
};

export default ticTacToeGameModule;
