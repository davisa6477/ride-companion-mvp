import RideBingoGame from "../RideBingoGame.jsx";

const rideBingoGameModule = {
  id: "bingo",
  enabled: true,
  order: 30,
  titleKey: "games_bingo",
  fallbackTitle: "Ride Bingo",
  descriptionKey: "games_bingo_sub",
  fallbackDescription: "Spot ride moments and mark the card.",
  Component: RideBingoGame,
};

export default rideBingoGameModule;
