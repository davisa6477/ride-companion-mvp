// ===== STANDARD GAME SHELL =====
// Every game renders inside this same frame so game sizing stays predictable.
// Width stays at the current game card width. Height matches the current
// workable Mirror card height so tablet/kiosk page frames are consistent.
export default function GameShell({ children }) {
  return (
    <div className="mx-auto h-full w-full max-w-[900px]">
      <div className="relative h-full min-h-0 overflow-hidden rounded-3xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
