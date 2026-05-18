import EmojiGuessGame from "../EmojiGuessGame.jsx";

const emojiGuessGameModule = {
  id: "emoji",
  enabled: true,
  order: 40,
  titleKey: "games_emoji",
  fallbackTitle: "Emoji Guess",
  descriptionKey: "games_emoji_sub",
  fallbackDescription: "Guess the phrase from emoji clues.",
  translationKeys: [
  "games_emoji",
  "games_emoji_sub",
  "emoji_start_message",
  "emoji_correct",
  "emoji_answer_revealed",
  ],
  Component: EmojiGuessGame,
};

export default emojiGuessGameModule;
