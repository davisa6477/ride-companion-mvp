import { useMemo, useState } from "react";
import { RefreshCcw, Users, Cpu } from "lucide-react";

// ===== WINNING LINE DEFINITIONS =====
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// ===== WIN DETECTION =====
function getWinner(board) {
  for (const line of winningLines) {
    const [a, b, c] = line;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        player: board[a],
        line,
      };
    }
  }

  return null;
}

// ===== BOARD HELPERS =====
function getOpenSquares(board) {
  return board
    .map((value, index) => (value ? null : index))
    .filter((index) => index !== null);
}

function playerCanStillWin(board, player) {
  return winningLines.some((line) =>
    line.every((index) => board[index] === "" || board[index] === player)
  );
}

function noOneCanWin(board) {
  return !playerCanStillWin(board, "X") && !playerCanStillWin(board, "O");
}

// ===== COMPUTER MOVE LOGIC =====
// Simple strategy: win, block, center, corner, then random open square.
function getComputerMove(board) {
  const openSquares = getOpenSquares(board);

  if (openSquares.length === 0) return null;

  // Win if possible.
  for (const index of openSquares) {
    const testBoard = [...board];
    testBoard[index] = "O";

    if (getWinner(testBoard)?.player === "O") {
      return index;
    }
  }

  // Block if needed.
  for (const index of openSquares) {
    const testBoard = [...board];
    testBoard[index] = "X";

    if (getWinner(testBoard)?.player === "X") {
      return index;
    }
  }

  // Take center.
  if (!board[4]) return 4;

  // Take a corner.
  const corners = [0, 2, 6, 8].filter((index) => !board[index]);

  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Otherwise take any open square.
  return openSquares[Math.floor(Math.random() * openSquares.length)];
}

export default function TicTacToeGame({ t = (key) => key }) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== GAME MODE / BOARD STATE =====
  const [mode, setMode] = useState("computer");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [earlyTie, setEarlyTie] = useState(false);

  // ===== SCORE STATE =====
  const [score, setScore] = useState({
    x: 0,
    o: 0,
    ties: 0,
  });

  // ===== DERIVED GAME STATE =====
  const winner = useMemo(() => getWinner(board), [board]);
  const openSquares = useMemo(() => getOpenSquares(board), [board]);
  const gameOver = Boolean(winner) || openSquares.length === 0 || earlyTie;

  // ===== STATUS MESSAGE =====
  const status = useMemo(() => {
    if (winner) {
      if (mode === "computer") {
        return winner.player === "X"
          ? tr("ttt_you_win", "You win!")
          : tr("ttt_computer_wins", "Computer wins.");
      }

      return `${winner.player} ${tr("ttt_wins", "wins!")}`;
    }

    if (earlyTie) {
      return tr("ttt_early_tie", "Tie game. No one can win from here.");
    }

    if (openSquares.length === 0) {
      return tr("ttt_tie_game", "Tie game.");
    }

    if (mode === "computer") {
      return currentPlayer === "X"
        ? tr("ttt_your_turn", "Your turn.")
        : tr("ttt_computer_thinking", "Computer thinking...");
    }

    return `${currentPlayer}${tr("ttt_turn_suffix", "'s turn.")}`;
  }, [winner, earlyTie, openSquares.length, currentPlayer, mode]);

  // ===== SCORE UPDATE =====
  function updateScore(result) {
    if (result === "X") {
      setScore((current) => ({ ...current, x: current.x + 1 }));
    } else if (result === "O") {
      setScore((current) => ({ ...current, o: current.o + 1 }));
    } else {
      setScore((current) => ({ ...current, ties: current.ties + 1 }));
    }
  }

  // ===== GAME OVER CHECK =====
  function finishIfGameOver(nextBoard) {
    const nextWinner = getWinner(nextBoard);
    const nextOpenSquares = getOpenSquares(nextBoard);

    if (nextWinner) {
      updateScore(nextWinner.player);
      return true;
    }

    if (nextOpenSquares.length === 0 || noOneCanWin(nextBoard)) {
      setEarlyTie(true);
      updateScore("tie");
      return true;
    }

    return false;
  }

  // ===== RESET HELPERS =====
  function resetBoard(nextStartingPlayer = "X") {
    setBoard(Array(9).fill(""));
    setCurrentPlayer(nextStartingPlayer);
    setEarlyTie(false);
  }

  function resetScore() {
    setScore({ x: 0, o: 0, ties: 0 });
    resetBoard("X");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    resetBoard("X");
  }

  // ===== PLAYER MOVE / COMPUTER RESPONSE =====
  function makeMove(index) {
    if (board[index] || gameOver) return;
    if (mode === "computer" && currentPlayer !== "X") return;

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;

    setBoard(nextBoard);

    if (finishIfGameOver(nextBoard)) return;

    if (mode === "computer") {
      setCurrentPlayer("O");

      setTimeout(() => {
        const computerMove = getComputerMove(nextBoard);

        if (computerMove === null) return;

        const computerBoard = [...nextBoard];
        computerBoard[computerMove] = "O";

        setBoard(computerBoard);

        if (!finishIfGameOver(computerBoard)) {
          setCurrentPlayer("X");
        }
      }, 350);

      return;
    }

    setCurrentPlayer((player) => (player === "X" ? "O" : "X"));
  }

  // ===== NEW BOARD =====
  function playAgain() {
    resetBoard("X");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-5 text-white">
      {/* ===== GAME HEADER / SCOREBOARD ===== */}
      <div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">
            {tr("ttt_classic_quick_game", "Classic quick game")}
          </div>

          <h3 className="text-4xl font-black leading-tight">
            {tr("games_ttt", "Tic Tac Toe")}
          </h3>

          <p className="mt-2 max-w-xl text-sm text-white/70">
            {tr(
              "ttt_instructions",
              "Play against another passenger or the computer."
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center text-sm font-black">
          <div>
            <div className="text-white/50">
              {mode === "computer" ? tr("ttt_you", "You") : "X"}
            </div>
            <div className="text-2xl">{score.x}</div>
          </div>

          <div>
            <div className="text-white/50">
              {mode === "computer" ? tr("ttt_cpu", "CPU") : "O"}
            </div>
            <div className="text-2xl">{score.o}</div>
          </div>

          <div>
            <div className="text-white/50">{tr("ttt_ties", "Ties")}</div>
            <div className="text-2xl">{score.ties}</div>
          </div>
        </div>
      </div>

      {/* ===== MODE SELECTOR ===== */}
      <div className="mt-4 grid shrink-0 grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => changeMode("computer")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
            mode === "computer"
              ? "bg-white text-slate-950"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Cpu size={18} />
          {tr("ttt_vs_computer", "Vs Computer")}
        </button>

        <button
          type="button"
          onClick={() => changeMode("twoPlayer")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
            mode === "twoPlayer"
              ? "bg-white text-slate-950"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Users size={18} />
          {tr("ttt_two_player", "Two Player")}
        </button>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="mt-4 shrink-0 rounded-2xl bg-white/10 p-3 text-center text-xl font-black">
        {status}
      </div>

      {/* ===== GAME BOARD ===== */}
      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="grid aspect-square h-full max-h-[min(48vh,390px)] max-w-full grid-cols-3 grid-rows-3 gap-3 rounded-3xl bg-white/10 p-3">
          {board.map((square, index) => {
            const winningSquare = winner?.line.includes(index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => makeMove(index)}
                className={`flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-2xl border text-[clamp(1.4rem,4vw,2.8rem)] font-black leading-none transition ${
                  winningSquare
                    ? "border-emerald-200 bg-emerald-300 text-emerald-950"
                    : square
                      ? "border-white bg-white text-slate-950"
                      : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {square}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== GAME CONTROLS ===== */}
      <div className="mt-4 flex shrink-0 flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={playAgain}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg"
        >
          {tr("ttt_new_board", "New Board")}
        </button>

        <button
          type="button"
          onClick={resetScore}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
        >
          <RefreshCcw size={18} />
          {tr("ttt_reset_score", "Reset Score")}
        </button>
      </div>
    </div>
  );
}
