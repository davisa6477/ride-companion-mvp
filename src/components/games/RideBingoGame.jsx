import { useMemo, useState } from "react";

// ===== BINGO SQUARE SOURCE ITEMS =====
// These labels are kept in English internally.
// Display text is translated through bingo_item_* keys when available.
const bingoItems = [
  "Dog in a car",
  "Motorcycle",
  "School bus",
  "Police car",
  "Tesla",
  "Road construction",
  "Fast food sign",
  "Out-of-state plate",
  "Lifted truck",
  "Railroad crossing",
  "Traffic cone",
  "Gas station",
  "Delivery truck",
  "Convertible",
  "Bicycle",
  "Jogger",
  "Billboard",
  "Car wash",
  "Coffee shop",
  "Bus stop",
  "Construction worker",
  "Emergency vehicle",
  "Drive-thru line",
  "Restaurant patio",
  "Van with ladder",
  "Pickup truck",
  "Train tracks",
  "Tow truck",
  "Car with bumper sticker",
  "Hotel sign",
  "Pharmacy sign",
  "Shopping cart",
  "Water tower",
  "Neon sign",
  "Airport sign",
  "Taxi",
  "Jeep",
  "Roundabout",
  "Road cone",
  "Yield sign",
];

// ===== WINNING LINE DEFINITIONS =====
const winningLines = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// ===== ARRAY SHUFFLER =====
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

// ===== BOARD CREATION =====
// Creates a 5x5 board with a marked free space in the center.
function makeBoard() {
  const selectedItems = shuffle(bingoItems).slice(0, 24);

  const board = [
    ...selectedItems.slice(0, 12),
    "FREE SPACE",
    ...selectedItems.slice(12),
  ];

  return board.map((label, index) => ({
    id: `${label}-${index}-${Math.random()}`,
    label,
    marked: label === "FREE SPACE",
    free: label === "FREE SPACE",
  }));
}

// ===== WIN DETECTION =====
function getWinningLine(board) {
  return winningLines.find((line) =>
    line.every((index) => board[index]?.marked)
  );
}

export default function RideBingoGame({ t = (key) => key }) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== BINGO LABEL TRANSLATION HELPER =====
  // Uses the original English label as the stable key source.
  // Missing keys safely fall back to English.
  function getBingoItemLabel(label) {
    if (label === "FREE SPACE") {
      return tr("bingo_free_space", "FREE SPACE");
    }

    return tr(`bingo_item_${label}`, label);
  }

  // ===== GAME STATE =====
  const [board, setBoard] = useState(() => makeBoard());
  const [gamesWon, setGamesWon] = useState(0);

  // ===== WINNING STATE =====
  const winningLine = useMemo(() => getWinningLine(board), [board]);
  const hasBingo = Boolean(winningLine);

  // ===== SQUARE TOGGLE =====
  function toggleSquare(index) {
    setBoard((currentBoard) =>
      currentBoard.map((square, squareIndex) => {
        if (squareIndex !== index || square.free) return square;
        return { ...square, marked: !square.marked };
      })
    );
  }

  // ===== NEW CARD =====
  function newCard() {
    setBoard(makeBoard());
  }

  // ===== CLEAR MARKS =====
  function clearMarks() {
    setBoard((currentBoard) =>
      currentBoard.map((square) => ({
        ...square,
        marked: square.free,
      }))
    );
  }

  // ===== CLAIM BINGO =====
  function celebrateBingo() {
    if (!hasBingo) return;

    setGamesWon((current) => current + 1);
    newCard();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950 p-5 text-white">
      {/* ===== GAME HEADER ===== */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">
            {tr("bingo_edition", "Rideshare edition")}
          </div>

          <h3 className="text-3xl font-black leading-tight">
            {tr("games_bingo", "Ride Bingo")}
          </h3>

          <p className="mt-1 max-w-2xl text-sm text-white/70">
            {tr(
              "bingo_instructions",
              "Tap squares when you spot things during the ride. Get five in a row."
            )}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/10 px-4 py-3 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">
            {tr("bingo_wins", "Bingos")}
          </div>

          <div className="text-3xl font-black">{gamesWon}</div>
        </div>
      </div>

      {/* ===== GAME STATUS MESSAGE ===== */}
      <div
        className={`mt-3 shrink-0 rounded-2xl p-3 text-center font-black ${
          hasBingo
            ? "bg-emerald-300 text-emerald-950"
            : "bg-white/10 text-white"
        }`}
      >
        {hasBingo
          ? tr("bingo_success", "BINGO! Five in a row.")
          : tr(
              "bingo_keep_looking",
              "Keep looking out the window and mark what you spot."
            )}
      </div>

      {/* ===== BINGO BOARD ===== */}
      <div className="mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="grid aspect-square h-[min(48vh,500px)] max-h-full max-w-full grid-cols-5 gap-2 rounded-3xl bg-white/10 p-3">
          {board.map((square, index) => {
            const isWinningSquare = winningLine?.includes(index);

            return (
              <button
                key={square.id}
                type="button"
                onClick={() => toggleSquare(index)}
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl border px-1 py-1 text-center text-[clamp(9px,1.25vh,13px)] font-black leading-tight transition ${
                  square.marked
                    ? isWinningSquare
                      ? "border-emerald-200 bg-emerald-300 text-emerald-950 shadow-lg"
                      : "border-white bg-white text-slate-950"
                    : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span className="flex max-w-full flex-wrap items-center justify-center break-words text-center">
                  {getBingoItemLabel(square.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== GAME CONTROLS ===== */}
      <div className="mt-3 flex shrink-0 flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={newCard}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg"
        >
          {tr("bingo_new_card", "New Card")}
        </button>

        <button
          type="button"
          onClick={clearMarks}
          className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
        >
          {tr("bingo_clear_marks", "Clear Marks")}
        </button>

        <button
          type="button"
          onClick={celebrateBingo}
          disabled={!hasBingo}
          className="rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-emerald-950 shadow-lg disabled:opacity-40"
        >
          {tr("bingo_claim", "Claim Bingo")}
        </button>
      </div>
    </div>
  );
}
