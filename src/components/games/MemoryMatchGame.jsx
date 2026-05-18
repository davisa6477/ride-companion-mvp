import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";

const tileSource = ["🚗", "🎵", "☕", "🌟", "🧩", "📍", "🎒", "🚦"];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeTiles() {
  return shuffle([...tileSource, ...tileSource]).map((value, index) => ({
    id: `${value}-${index}-${Math.random()}`,
    value,
    matched: false,
  }));
}

export default function MemoryMatchGame({ t = (key) => key }) {
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  const [tiles, setTiles] = useState(() => makeTiles());
  const [selectedIds, setSelectedIds] = useState([]);
  const [moves, setMoves] = useState(0);

  const matchedCount = useMemo(
    () => tiles.filter((tile) => tile.matched).length,
    [tiles]
  );

  const complete = matchedCount === tiles.length;

  function resetGame() {
    setTiles(makeTiles());
    setSelectedIds([]);
    setMoves(0);
  }

  function chooseTile(tile) {
    if (tile.matched || selectedIds.includes(tile.id) || selectedIds.length >= 2) {
      return;
    }

    const nextSelected = [...selectedIds, tile.id];
    setSelectedIds(nextSelected);

    if (nextSelected.length !== 2) return;

    setMoves((current) => current + 1);

    const [firstId, secondId] = nextSelected;
    const firstTile = tiles.find((item) => item.id === firstId);
    const secondTile = tiles.find((item) => item.id === secondId);

    if (firstTile?.value === secondTile?.value) {
      window.setTimeout(() => {
        setTiles((currentTiles) =>
          currentTiles.map((item) =>
            item.id === firstId || item.id === secondId
              ? { ...item, matched: true }
              : item
          )
        );
        setSelectedIds([]);
      }, 350);
      return;
    }

    window.setTimeout(() => {
      setSelectedIds([]);
    }, 750);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-5 text-white">
      <div className="shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-white/50">
          {tr("memory_quick_game", "Quick game")}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-4xl font-black leading-tight">
              {tr("games_memory", "Memory Match")}
            </h3>

            <p className="mt-2 max-w-xl text-sm text-white/70">
              {tr(
                "memory_instructions",
                "Flip tiles and match the pairs before the ride ends."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-3 text-center text-sm font-black">
            <div>
              <div className="text-white/50">{tr("memory_moves", "Moves")}</div>
              <div className="text-2xl">{moves}</div>
            </div>
            <div>
              <div className="text-white/50">{tr("memory_pairs", "Pairs")}</div>
              <div className="text-2xl">{matchedCount / 2}/8</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-4 gap-2">
        {tiles.map((tile) => {
          const revealed = tile.matched || selectedIds.includes(tile.id);

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => chooseTile(tile)}
              className={`flex min-h-0 items-center justify-center rounded-2xl border text-4xl font-black transition ${
                revealed
                  ? "border-white/30 bg-white text-slate-950"
                  : "border-white/10 bg-white/10 text-transparent hover:bg-white/20"
              }`}
              aria-label={revealed ? tile.value : "Hidden memory tile"}
            >
              {revealed ? tile.value : "?"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid shrink-0 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-2xl bg-white/10 p-3 text-sm font-bold text-white/75">
          {complete
            ? tr("memory_complete", "Nice! You found every pair.")
            : tr("memory_status", "Find two matching tiles.")}
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950"
        >
          <RefreshCcw size={16} />
          {tr("memory_new_game", "New Game")}
        </button>
      </div>
    </div>
  );
}
