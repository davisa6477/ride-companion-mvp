import TriviaGame from "../TriviaGame.jsx";

const triviaGameModule = {
  id: "trivia",
  enabled: true,
  order: 10,
  titleKey: "games_trivia",
  fallbackTitle: "Ride Trivia",
  descriptionKey: "games_trivia_sub",
  fallbackDescription: "Quick trivia for short rides.",
  translationKeys: [
  "games_trivia",
  "games_trivia_sub",
  "trivia_saved_source",
  "trivia_backup_source",
  ],
  Component: TriviaGame,
};

export default triviaGameModule;
