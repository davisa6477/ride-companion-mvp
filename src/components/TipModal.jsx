import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function TipModal({
  tipOptions = [],
  onClose,
  t = (key) => key,
}) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== AVAILABLE TIP OPTIONS =====
  // Only show options that have both a platform name and URL configured in /admin.
  const availableOptions = useMemo(
    () =>
      tipOptions.filter(
        (option) => option.platform?.trim() && option.url?.trim()
      ),
    [tipOptions]
  );

  // ===== SELECTED TIP OPTION STATE =====
  const [selectedId, setSelectedId] = useState(
    availableOptions[0]?.id || ""
  );

  const selectedOption =
    availableOptions.find((option) => option.id === selectedId) ||
    availableOptions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        {/* ===== MODAL HEADER ===== */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {tr("tips_title", "Tip Now")}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {tr(
                "tips_subtitle",
                "Direct tips are optional and separate from the rideshare or delivery platform. Thank you for supporting your driver."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
          >
            {tr("tips_close", "Close")}
          </button>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {availableOptions.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900">
            {tr(
              "tips_none",
              "No direct tipping options are set up yet."
            )}
          </div>
        ) : (
          <>
            {/* ===== TIP PLATFORM SELECTOR ===== */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {availableOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`rounded-2xl border p-4 text-center transition ${
                    selectedOption?.id === option.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-lg font-black">
                    {option.platform}
                  </div>

                  {option.label && (
                    <div className="mt-1 text-sm opacity-75">
                      {option.label}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* ===== SELECTED TIP QR CODE ===== */}
            {selectedOption && (
              <div className="mt-6 flex flex-col items-center rounded-3xl bg-slate-100 p-6">
                <div className="rounded-2xl bg-white p-4 shadow">
                  <QRCodeSVG
                    value={selectedOption.url}
                    size={230}
                  />
                </div>

                <a
                  href={selectedOption.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 rounded-2xl bg-slate-950 px-6 py-3 font-black text-white"
                >
                  {tr("tips_open", "Open")}{" "}
                  {selectedOption.platform}
                </a>

                <p className="mt-4 max-w-md text-center text-sm text-slate-600">
                  {tr(
                    "tips_scan_help",
                    "Scan the code or tap the button. Your phone may open the matching payment app automatically."
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
