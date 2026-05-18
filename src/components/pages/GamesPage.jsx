import { useEffect, useMemo, useState } from "react";
import { Gamepad2 } from "lucide-react";

import PageCard from "../layout/PageCard.jsx";
import GameShell from "../layout/GameShell.jsx";
import { applyGameModuleSettings, defaultGameId } from "../../config/gameRegistry.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";

export default function GamesPage({ t = (key) => key, gameModuleSettings = [] }) {
  const [selectedGame, setSelectedGame] = useState(defaultGameId);

  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== TRANSLATED GAME NAV ITEMS =====
  // Game definitions live in config/gameRegistry.jsx.
  const games = useMemo(
    () =>
      applyGameModuleSettings(gameModuleSettings).map((game) => ({
        ...game,
        title: tr(game.titleKey, game.fallbackTitle),
        description: tr(game.descriptionKey, game.fallbackDescription),
      })),
    [t, gameModuleSettings]
  );

  const selectedGameConfig =
    games.find((game) => game.id === selectedGame) || games[0];

  const SelectedGame = selectedGameConfig?.Component;

  useEffect(() => {
    if (games.length > 0 && !games.some((game) => game.id === selectedGame)) {
      setSelectedGame(games[0].id);
    }
  }, [games, selectedGame]);

  return (
    <div className={`grid gap-5 lg:grid-cols-[240px_1fr] ${PAGE_FRAME_CLASS}`}>
      <aside className="h-full min-h-0">
        <PageCard className="flex h-full min-h-0 flex-col overflow-hidden">
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

          <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
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
        <GameShell>
          {SelectedGame ? (
            <SelectedGame t={t} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl bg-slate-950 p-6 text-center text-white">
              <div>
                <div className="text-2xl font-black">
                  {tr("games_none_available", "No games available")}
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {tr(
                    "games_none_available_sub",
                    "Add or enable a game module to show it here."
                  )}
                </p>
              </div>
            </div>
          )}
        </GameShell>
      </section>
    </div>
  );
}
