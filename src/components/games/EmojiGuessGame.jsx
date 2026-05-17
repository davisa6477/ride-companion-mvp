import { useMemo, useState } from "react";
import { Lightbulb, RefreshCcw, SkipForward } from "lucide-react";
import { emojiPuzzles } from "../../data/emojiPuzzles.js";

// ===== ARRAY SHUFFLER =====
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

// ===== GUESS NORMALIZER =====
// Removes punctuation/spaces and lowercases so guesses are forgiving.
function normalizeGuess(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// ===== ANSWER CHECKER =====
// Accepts the main answer plus any aliases listed in data/emojiPuzzles.js.
function isCorrectGuess(guess, puzzle) {
  const normalizedGuess = normalizeGuess(guess);

  const acceptedAnswers = [puzzle.answer, ...(puzzle.aliases || [])].map(
    normalizeGuess
  );

  return acceptedAnswers.includes(normalizedGuess);
}

export default function EmojiGuessGame({ t = (key) => key }) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== GAME STATE =====
  const [deck, setDeck] = useState(() => shuffle(emojiPuzzles));
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState(
    tr("emoji_start_message", "Guess the word or phrase from the emojis.")
  );
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, skipped: 0 });

  const currentPuzzle = deck[index];

  // ===== PROGRESS LABEL =====
  const progressLabel = useMemo(
    () => `${index + 1} ${tr("emoji_of", "of")} ${deck.length}`,
    [index, deck.length]
  );

  // ===== NEXT PUZZLE =====
  function nextPuzzle() {
    setGuess("");
    setRevealed(false);
    setMessage(
      tr("emoji_start_message", "Guess the word or phrase from the emojis.")
    );

    if (index + 1 >= deck.length) {
      setDeck(shuffle(emojiPuzzles));
      setIndex(0);
      return;
    }

    setIndex((current) => current + 1);
  }

  // ===== CHECK GUESS =====
  function checkGuess(event) {
    event.preventDefault();

    if (!guess.trim()) {
      setMessage(tr("emoji_type_first", "Type a guess first."));
      return;
    }

    if (isCorrectGuess(guess, currentPuzzle)) {
      setMessage(tr("emoji_correct", "Correct!"));
      setRevealed(true);
      setScore((current) => ({
        ...current,
        correct: current.correct + 1,
      }));
      return;
    }

    setMessage(
      tr("emoji_not_quite", "Not quite. Try again or reveal the answer.")
    );
  }

  // ===== SKIP PUZZLE =====
  function skipPuzzle() {
    setScore((current) => ({
      ...current,
      skipped: current.skipped + 1,
    }));

    nextPuzzle();
  }

  // ===== REVEAL ANSWER =====
  function revealAnswer() {
    setRevealed(true);
    setMessage(tr("emoji_answer_revealed", "Answer revealed."));
  }

  // ===== RESET GAME =====
  function resetGame() {
    setDeck(shuffle(emojiPuzzles));
    setIndex(0);
    setGuess("");
    setRevealed(false);
    setScore({ correct: 0, skipped: 0 });
    setMessage(
      tr("emoji_start_message", "Guess the word or phrase from the emojis.")
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 text-white">
      {/* ===== GAME HEADER / SCOREBOARD ===== */}
      <div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">
            {tr("emoji_quick_game", "Quick game")}
          </div>

          <h3 className="text-4xl font-black leading-tight">
            {tr("games_emoji", "Emoji Guess")}
          </h3>

          <p className="mt-2 max-w-xl text-sm text-white/70">
            {tr(
              "emoji_instructions",
              "Decode the emoji clue. Great for short rides."
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center text-sm font-black">
          <div>
            <div className="text-white/50">
              {tr("emoji_correct_label", "Correct")}
            </div>
            <div className="text-2xl">{score.correct}</div>
          </div>

          <div>
            <div className="text-white/50">
              {tr("emoji_skipped_label", "Skipped")}
            </div>
            <div className="text-2xl">{score.skipped}</div>
          </div>

          <div>
            <div className="text-white/50">
              {tr("emoji_puzzle_label", "Puzzle")}
            </div>
            <div className="text-lg">{progressLabel}</div>
          </div>
        </div>
      </div>

      {/* ===== PUZZLE DISPLAY ===== */}
      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white/10 p-5 text-center">
        <div className="shrink-0 text-sm font-black uppercase tracking-wide text-white/50">
          {currentPuzzle.category} · {tr("emoji_hint", "Hint")}:{" "}
          {currentPuzzle.hint}
        </div>

        <div className="mt-4 shrink-0 text-7xl leading-none md:text-8xl">
          {currentPuzzle.emoji}
        </div>

        <div className="mt-5 shrink-0 rounded-2xl bg-white/10 p-4 text-lg font-black">
          {message}
        </div>

        {revealed && (
          <div className="mt-4 shrink-0 rounded-2xl bg-emerald-300 p-4 text-3xl font-black text-emerald-950">
            {currentPuzzle.answer}
          </div>
        )}
      </div>

      {/* ===== GUESS INPUT ===== */}
      <form
        onSubmit={checkGuess}
        className="mt-4 grid shrink-0 gap-3 md:grid-cols-[1fr_auto]"
      >
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          placeholder={tr("emoji_guess_placeholder", "Type your guess...")}
          className="rounded-2xl border border-white/10 bg-white p-4 text-xl font-black text-slate-950 outline-none"
        />

        <button className="rounded-2xl bg-white px-6 py-4 text-lg font-black text-slate-950 shadow-lg">
          {tr("emoji_guess_button", "Guess")}
        </button>
      </form>

      {/* ===== GAME CONTROLS ===== */}
      <div className="mt-3 flex shrink-0 flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={revealAnswer}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
        >
          <Lightbulb size={18} />
          {tr("emoji_reveal", "Reveal")}
        </button>

        <button
          type="button"
          onClick={skipPuzzle}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
        >
          <SkipForward size={18} />
          {tr("emoji_skip", "Skip")}
        </button>

        <button
          type="button"
          onClick={nextPuzzle}
          className="rounded-2xl bg-indigo-300 px-5 py-3 text-sm font-black text-indigo-950 shadow-lg"
        >
          {tr("emoji_next", "Next")}
        </button>

        <button
          type="button"
          onClick={resetGame}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
        >
          <RefreshCcw size={18} />
          {tr("emoji_reset", "Reset")}
        </button>
      </div>
    </div>
  );
}
