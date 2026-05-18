// ===== SHARED PAGE CARD WRAPPER =====
// Used across passenger/admin pages to provide consistent rounded white cards.
// className allows each page to add layout, height, or background overrides.
export default function PageCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
