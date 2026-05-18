import { useState } from "react";
import { MapPin } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";

export default function GuestbookPage({
  entries = [],
  setEntries,
  t = (key) => key,
}) {
  // ===== FORM STATE =====
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== SUBMIT GUESTBOOK ENTRY =====
  // New entries are saved as unapproved so the driver can moderate them in /admin.
  function submitEntry(e) {
    e.preventDefault();

    if (!name.trim() || !message.trim()) return;

    const createdAtMs = Date.now();

    setEntries([
      {
        id: String(createdAtMs),
        createdAtMs,
        name: name.trim(),
        city: city.trim(),
        message: message.trim(),
        approved: false,
      },
      ...entries,
    ]);

    setName("");
    setCity("");
    setMessage("");
  }

  // ===== APPROVED ENTRIES ONLY =====
  // The passenger page only displays messages approved in the admin panel.
  const approvedEntries = entries.filter((entry) => entry.approved);

  return (
    <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
      {/* ===== GUESTBOOK SUBMISSION FORM ===== */}
      <PageCard>
        <h2 className="text-3xl font-black text-slate-950">
          {tr("guestbook_title", "Leave a note")}
        </h2>

        <p className="mt-2 text-slate-600">
          {tr(
            "guestbook_subtitle",
            "Messages appear after driver approval."
          )}
        </p>

        <form onSubmit={submitEntry} className="mt-5 grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr(
              "guestbook_name",
              "First name or nickname"
            )}
            className="rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200"
          />

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={tr(
              "guestbook_city",
              "City/state optional"
            )}
            className="rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tr(
              "guestbook_message",
              "Your message"
            )}
            rows={5}
            className="rounded-2xl border border-slate-200 p-4 text-lg outline-none focus:ring-4 focus:ring-slate-200"
          />

          <button
            type="submit"
            className="rounded-2xl bg-slate-950 p-4 text-lg font-black text-white shadow-lg"
          >
            {tr(
              "guestbook_submit",
              "Submit for Approval"
            )}
          </button>
        </form>
      </PageCard>

      {/* ===== APPROVED RIDE WALL ===== */}
      <PageCard>
        <h2 className="text-3xl font-black text-slate-950">
          {tr("guestbook_wall", "Ride Wall")}
        </h2>

        <div className="mt-5 grid max-h-[520px] gap-3 overflow-auto pr-2">
          {approvedEntries.length === 0 ? (
            <div className="rounded-2xl bg-slate-100 p-5 text-slate-500">
              {tr(
                "guestbook_empty",
                "No approved notes yet. Be the first!"
              )}
            </div>
          ) : (
            approvedEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl bg-slate-100 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black text-slate-950">
                    {entry.name}
                  </div>

                  {entry.city && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      {entry.city}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-slate-700">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </PageCard>
    </div>
  );
}
