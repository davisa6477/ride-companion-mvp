import BlackjackGame from "../BlackjackGame.jsx";

const blackjackGameModule = {
  id: "blackjack",
  enabled: true,
  order: 20,
  titleKey: "games_blackjack",
  fallbackTitle: "Blackjack",
  descriptionKey: "games_blackjack_sub",
  fallbackDescription: "Classic card game against the dealer.",
  translationKeys: [
  "games_blackjack",
  "games_blackjack_sub",
  "blackjack_deal",
  "blackjack_hit",
  "blackjack_stand",
  "blackjack_split",
  ],
  Component: BlackjackGame,
};

export default blackjackGameModule;
