import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import PageCard from "./PageCard.jsx";
import { fallbackTriviaQuestions } from "../data/trivia.js";

const SAVED_TRIVIA_KEY = "ride-companion-saved-trivia";

function decodeHtml(value) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = value;
  return textArea.value;
}

function shuffleArray(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeTriviaQuestion(item) {
  const answer = decodeHtml(item.correct_answer);
  const incorrect = item.incorrect_answers.map(decodeHtml);

  return {
    question: decodeHtml(item.question),
    answer,
    options: shuffleArray([answer, ...incorrect]),
  };
}

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
    // Ignore storage errors.
  }
}

export default function TriviaPage() {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [questions, setQuestions] = useState(fallbackTriviaQuestions);
  const [source, setSource] = useState("Built-in backup questions");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const current = questions[index];

  async function loadWebTrivia() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");

      if (!response.ok) {
        throw new Error("Trivia service unavailable");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No questions returned");
      }

      const normalizedQuestions = data.results.map(normalizeTriviaQuestion);

      setQuestions(normalizedQuestions);
      saveTrivia(normalizedQuestions);
      setIndex(0);
      setSelectedAnswer("");
      setShowAnswer(false);
      setSource("Open Trivia Database");
    } catch {
      const savedTrivia = getSavedTrivia();

      if (savedTrivia && Array.isArray(savedTrivia) && savedTrivia.length > 0) {
        setQuestions(savedTrivia);
        setSource("Saved web trivia");
        setErrorMessage("Could not load new web trivia, so saved trivia is being used.");
      } else {
        setQuestions(fallbackTriviaQuestions);
        setSource("Built-in backup questions");
        setErrorMessage("Could not load web trivia, so backup questions are being used.");
      }

      setIndex(0);
      setSelectedAnswer("");
      setShowAnswer(false);
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    setShowAnswer(false);
    setSelectedAnswer("");
    setIndex((index + 1) % questions.length);
  }

  function chooseAnswer(option) {
    setSelectedAnswer(option);
    setShowAnswer(true);
  }

  useEffect(() => {
    loadWebTrivia();
  }, []);

  return (
    <PageCard className="min-h-[520px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <Star />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950">Ride Trivia</h2>
            <p className="text-slate-600">Source: {source}</p>
          </div>
        </div>

        <button
          onClick={loadWebTrivia}
          disabled={loading}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh Trivia"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 rounded-3xl bg-slate-950 p-8 text-white">
        <div className="text-sm font-bold uppercase tracking-wide text-white/50">
          Question {index + 1} of {questions.length}
        </div>

        <div className="mt-3 text-3xl font-black leading-tight md:text-4xl">
          {current.question}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = showAnswer && option === current.answer;
            const isWrong = showAnswer && isSelected && option !== current.answer;

            return (
              <button
                key={option}
                onClick={() => chooseAnswer(option)}
                className={`rounded-2xl p-4 text-left text-lg font-black transition ${
                  isCorrect
                    ? "bg-emerald-300 text-slate-950"
                    : isWrong
                      ? "bg-rose-300 text-slate-950"
                      : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-2xl font-black text-slate-950">
            Answer: {current.answer}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={nextQuestion}
          className="rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white"
        >
          Next Question
        </button>

        <p className="text-sm text-slate-500">
          Web trivia loads automatically when available. Saved trivia is used offline.
        </p>
      </div>
    </PageCard>
  );
}