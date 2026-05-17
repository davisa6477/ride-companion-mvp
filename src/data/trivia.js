// ===== FALLBACK TRIVIA QUESTIONS =====
// These are used when Open Trivia DB and saved web trivia are unavailable.
// TriviaGame.jsx expects each item to include: question, answer, and options.
export const fallbackTriviaQuestions = [
  {
    question: "Which U.S. highway is famously associated with Joplin, Missouri?",
    answer: "Route 66",
    options: ["Route 66", "Highway 1", "I-95", "The Blue Ridge Parkway"],
  },

  {
    question: "What is the name for a group of crows?",
    answer: "A murder",
    options: ["A murder", "A parliament", "A herd", "A chorus"],
  },

  {
    question: "What planet is known as the Red Planet?",
    answer: "Mars",
    options: ["Mars", "Venus", "Jupiter", "Mercury"],
  },
];
