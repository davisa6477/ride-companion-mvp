import { useState } from "react";
import { Gamepad2 } from "lucide-react";

import PageCard from "../layout/PageCard.jsx";
import GameShell from "../layout/GameShell.jsx";
import TriviaGame from "../games/TriviaGame.jsx";
import BlackjackGame from "../games/BlackjackGame.jsx";
import RideBingoGame from "../games/RideBingoGame.jsx";
import EmojiGuessGame from "../games/EmojiGuessGame.jsx";
import TicTacToeGame from "../games/TicTacToeGame.jsx";

export default function GamesPage({ t = (key) => key }) {
  const [selectedGame, setSelectedGame] = useState("trivia");

  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  const games = [
    {
      id: "trivia",
      title: tr("games_trivia", "Ride Trivia"),
      description: tr("games_trivia_sub", "Quick trivia for short rides."),
    },
    {
      id: "blackjack",
      title: tr("games_blackjack", "Blackjack"),
      description: tr(
        "games_blackjack_sub",
        "Classic card game against the dealer."
      ),
    },
    {
      id: "bingo",
      title: tr("games_bingo", "Ride Bingo"),
      description: tr("games_bingo_sub", "Spot ride moments and mark the card."),
    },
    {
      id: "emoji",
      title: tr("games_emoji", "Emoji Guess"),
      description: tr("games_emoji_sub", "Guess the phrase from emoji clues."),
    },
    {
      id: "tictactoe",
      title: tr("games_ttt", "Tic Tac Toe"),
      description: tr(
        "games_ttt_sub",
        "Play against a friend or the computer."
      ),
    },
  ];

  function renderGame() {
    if (selectedGame === "blackjack") return <BlackjackGame t={t} />;
    if (selectedGame === "bingo") return <RideBingoGame t={t} />;
    if (selectedGame === "emoji") return <EmojiGuessGame t={t} />;
    if (selectedGame === "tictactoe") return <TicTacToeGame t={t} />;
    return <TriviaGame t={t} />;
  }

  return (
    <div className="grid h-[calc(100vh-155px)] min-h-[520px] gap-5 md:h-[calc(100vh-170px)] lg:grid-cols-[240px_1fr]">
      <aside>
        <PageCard className="flex h-full min-h-0 flex-col overflow-hidden lg:sticky lg:top-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <Gamepad2 />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                {tr("games_title", "Games")}
              </h2>
              <p className="text-sm text-slate-500">
                {tr("games_subtitle", "Pick something to play.")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-hidden">
            {games.map((game) => {
              const active = selectedGame === game.id;

              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`min-h-0 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                      : "border-slate-200 bg-slate-50 text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-[clamp(0.9rem,1.15vw,1rem)] font-black leading-tight">
                    {game.title}
                  </div>

                  <div
                    className={`mt-1 text-[clamp(0.68rem,0.9vw,0.78rem)] leading-snug ${
                      active ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {game.description}
                  </div>
                </button>
              );
            })}
          </div>
        </PageCard>
      </aside>

      <section className="min-h-0 min-w-0">
        <GameShell>{renderGame()}</GameShell>
      </section>
    </div>
  );
}
