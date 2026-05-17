import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { fallbackTriviaQuestions } from "../../data/trivia.js";

const SAVED_TRIVIA_KEY = "ride-companion-saved-trivia";

// ===== HTML ENTITY DECODER =====
// Open Trivia DB returns encoded HTML entities. This converts them to readable text.
function decodeHtml(value) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = value;
  return textArea.value;
}

// ===== ARRAY SHUFFLER =====
// Used for answer order and fallback/saved question order.
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// ===== WEB TRIVIA NORMALIZER =====
// Converts Open Trivia DB question shape into the app's local question shape.
function normalizeWebQuestion(item) {
  const answer = decodeHtml(item.correct_answer);
  const incorrectAnswers = item.incorrect_answers.map(decodeHtml);

  return {
    question: decodeHtml(item.question),
    answer,
    options: shuffle([answer, ...incorrectAnswers]),
  };
}

// ===== SAVED TRIVIA CACHE =====
// Cached trivia lets the game continue to work if the web source is unavailable.
function getSavedTrivia() {
  try {
    const saved = localStorage.getItem(SAVED_TRIVIA_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveTrivia(questions) {
  try {
    localStorage.setItem(SAVED_TRIVIA_KEY, JSON.stringify(questions));
  } catch {
    // Ignore local storage failures.
  }
}

export default function TriviaGame({ t = (key) => key }) {
  // ===== GAME DATA STATE =====
  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("Backup");
  const [loading, setLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  // ===== GAMEPLAY STATE =====
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== ROUND RESET =====
  function resetRoundState() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setGameFinished(false);
  }

  // ===== TRIVIA LOADING PIPELINE =====
  // First tries Open Trivia DB.
  // If that fails, uses saved web trivia.
  // If nothing is saved, uses built-in fallback questions.
  async function loadTriviaQuestions() {
    setLoading(true);
    setLoadMessage("");

    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );

      if (!response.ok) {
        throw new Error("Trivia service unavailable");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No trivia questions returned");
      }

      const normalizedQuestions = data.results.map(normalizeWebQuestion);

      setQuestions(normalizedQuestions);
      saveTrivia(normalizedQuestions);
      setSource("Open Trivia DB");
      resetRoundState();
    } catch (error) {
      console.error("Failed to load web trivia:", error);

      const savedTrivia = getSavedTrivia();

      if (Array.isArray(savedTrivia) && savedTrivia.length > 0) {
        setQuestions(shuffle(savedTrivia).slice(0, 10));
        setSource("Saved");
        setLoadMessage(
          tr(
            "trivia_saved_source",
            "Could not load new trivia, so saved trivia is being used."
          )
        );
      } else {
        setQuestions(shuffle(fallbackTriviaQuestions).slice(0, 10));
        setSource("Backup");
        setLoadMessage(
          tr(
            "trivia_backup_source",
            "Could not load web trivia, so backup questions are being used."
          )
        );
      }

      resetRoundState();
    } finally {
      setLoading(false);
    }
  }

  // ===== MANUAL REFRESH / PLAY AGAIN =====
  function resetGame() {
    loadTriviaQuestions();
  }

  // ===== INITIAL LOAD =====
  useEffect(() => {
    loadTriviaQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== CURRENT QUESTION =====
  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex]
  );

  // ===== ANSWER SELECTION =====
  function chooseAnswer(answer) {
    if (showAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);
    setShowAnswer(true);

    if (answer === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  }

  // ===== NEXT QUESTION / FINISH =====
  function nextQuestion() {
    if (currentIndex >= questions.length - 1) {
      setGameFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowAnswer(false);
  }

  // ===== EMPTY / LOADING STATE =====
  if (!currentQuestion) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-white p-6 text-center">
        <div>
          <div className="text-2xl font-black text-slate-950">
            {loading
              ? tr("trivia_loading", "Loading trivia...")
              : tr("trivia_no_questions", "No trivia questions available.")}
          </div>

          <button
            type="button"
            onClick={resetGame}
            className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            {tr("trivia_try_again", "Try Again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* ===== TRIVIA HEADER ===== */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">
              {tr("trivia_question", "Question")} {currentIndex + 1} /{" "}
              {questions.length}
            </div>

            <div className="text-sm font-bold text-slate-500">
              {tr("trivia_score", "Score")}: {score}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
              {tr("trivia_source", "Source")}: {source}
            </div>

            <button
              type="button"
              onClick={resetGame}
              disabled={loading}
              className="rounded-2xl bg-slate-950 p-3 text-white disabled:opacity-40"
              aria-label={tr("trivia_refresh", "Refresh trivia")}
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        {/* ===== FALLBACK / SAVED SOURCE MESSAGE ===== */}
        {loadMessage && (
          <div className="mb-3 rounded-2xl bg-amber-100 p-3 text-sm font-black text-amber-900">
            {loadMessage}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {/* ===== QUESTION CARD ===== */}
          <div className="relative flex h-[170px] items-center justify-center overflow-hidden rounded-3xl bg-slate-950 px-5 py-4 text-center shadow-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div
                  className="mx-auto flex max-w-full items-center justify-center overflow-hidden text-balance px-2 text-center font-black leading-tight text-white"
                  style={{
                    fontSize:
                      currentQuestion.question.length > 120
                        ? "1.1rem"
                        : currentQuestion.question.length > 80
                          ? "1.35rem"
                          : "1.6rem",
                    maxHeight: "125px",
                  }}
                >
                  {currentQuestion.question}
                </div>

                <div className="mt-3 min-h-[24px] text-sm font-bold text-emerald-300">
                  {showAnswer
                    ? `${tr("trivia_answer", "Answer")}: ${
                        currentQuestion.answer
                      }`
                    : ""}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ===== ANSWER BUTTONS ===== */}
          <div className="mt-3 grid flex-1 gap-2">
            {currentQuestion.options.map((answer) => {
              const isCorrect =
                showAnswer && answer === currentQuestion.answer;

              const isIncorrect =
                showAnswer &&
                answer === selectedAnswer &&
                answer !== currentQuestion.answer;

              return (
                <button
                  key={answer}
                  type="button"
                  onClick={() => chooseAnswer(answer)}
                  disabled={showAnswer}
                  className={`rounded-2xl px-4 py-3 text-center text-sm font-black leading-snug transition ${
                    isCorrect
                      ? "bg-emerald-500 text-white"
                      : isIncorrect
                        ? "bg-rose-500 text-white"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {/* ===== NEXT / FINISH BUTTON ===== */}
          <button
            type="button"
            onClick={nextQuestion}
            disabled={!showAnswer}
            className="mt-3 rounded-2xl bg-slate-950 py-3 text-base font-black text-white disabled:opacity-40"
          >
            {currentIndex >= questions.length - 1
              ? tr("trivia_finish", "Finish")
              : tr("trivia_next", "Next Question")}
          </button>
        </div>
      </div>

      {/* ===== FINAL SCORE MODAL ===== */}
      {gameFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-3xl font-black text-slate-950">
              {tr("trivia_complete", "Trivia Complete")}
            </div>

            <div className="mt-3 text-lg font-bold text-slate-600">
              {tr("trivia_final_score", "Final Score")}
            </div>

            <div className="mt-2 text-6xl font-black text-slate-950">
              {score}/{questions.length}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-lg font-black text-white"
            >
              {tr("trivia_play_again", "Play Again")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
