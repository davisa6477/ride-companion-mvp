// ===== PASSENGER NAV BUTTON =====
// Used by App.jsx to render each passenger navigation item.
// The icon component is passed in as Icon, while label is already translated upstream.
export default function NavButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition ${
        active
          ? "bg-white text-slate-950 shadow"
          : "text-white/80 hover:bg-white/10"
      }`}
    >
      <Icon size={21} />

      <span className="w-full truncate text-xs font-bold leading-tight">
        {label}
      </span>
    </button>
  );
}
