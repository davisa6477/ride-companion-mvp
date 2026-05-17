// ===== SHARED GAME DISPLAY SHELL =====
// Used by GamesPage.jsx to wrap the currently selected game.
// Keeps game layouts consistent and prevents oversized game content from spilling out.
export default function GameShell({ children }) {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="relative h-[min(68vh,620px)] min-h-[520px] overflow-hidden rounded-3xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
