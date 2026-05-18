// ===== GAME MODULE FRAME =====
// Optional helper for future games. Existing games can keep their own internal
// layout, but new games should use this to match the standardized game card.

export default function GameModuleFrame({ children, className = "" }) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-3xl p-5 ${className}`}
    >
      {children}
    </div>
  );
}
