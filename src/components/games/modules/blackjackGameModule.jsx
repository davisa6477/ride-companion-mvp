import BlackjackGame from "../BlackjackGame.jsx";

const blackjackGameModule = {
  id: "blackjack",
  enabled: true,
  order: 20,
  titleKey: "games_blackjack",
  fallbackTitle: "Blackjack",
  descriptionKey: "games_blackjack_sub",
  fallbackDescription: "Classic card game against the dealer.",
  Component: BlackjackGame,
};

export default blackjackGameModule;
