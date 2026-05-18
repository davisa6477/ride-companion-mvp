import { useState } from "react";
import { MapPin } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { createSharedGuestbookEntry } from "../../services/firestoreGuestbookService.js";
import { sendConsoleNotification } from "../../services/rideSessionService.js";

export default function GuestbookPage({
  entries = [],
  setEntries,
  t = (key) => key,
}) {
  // ===== FORM STATE =====
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== SUBMIT GUESTBOOK ENTRY =====
  // New entries are saved as unapproved so the driver can moderate them in /admin.
  async function submitEntry(e) {
    e.preventDefault();

    if (!name.trim() || !message.trim() || submitting) return;

    const createdAtMs = Date.now();

    const pendingEntry = {
      id: String(createdAtMs),
      createdAtMs,
      name: name.trim(),
      city: city.trim(),
      message: message.trim(),
      approved: false,
    };

    setSubmitting(true);
    setSubmitStatus("");

    // Optimistic local update keeps the passenger screen responsive. Firestore
    // listener will reconcile the final shared entry list.
    setEntries([pendingEntry, ...entries]);

    try {
      await createSharedGuestbookEntry(pendingEntry);

      await sendConsoleNotification({
        type: "guestbook",
        label: "Guestbook Entry",
        message: `${pendingEntry.name} left a guestbook note.`,
      });

      setName("");
      setCity("");
      setMessage("");
      setSubmitStatus(
        tr("guestbook_submit_success", "Thanks! Your note is waiting for approval.")
      );
    } catch (error) {
      console.error("Failed to submit guestbook entry:", error);
      setSubmitStatus(
        tr("guestbook_submit_error", "Could not submit the note. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ===== APPROVED ENTRIES ONLY =====
  // The passenger page only displays messages approved in the admin panel.
  const approvedEntries = entries.filter((entry) => entry.approved);

  return (
    <div className={`grid gap-5 lg:grid-cols-[.9fr_1.1fr] ${PAGE_FRAME_CLASS}`}>
      {/* ===== GUESTBOOK SUBMISSION FORM ===== */}
      <PageCard className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <h2 className="text-3xl font-black text-slate-950">
            {tr("guestbook_title", "Leave a note")}
          </h2>

          <p className="mt-2 text-slate-600">
            {tr(
              "guestbook_subtitle",
              "Messages appear after driver approval."
            )}
          </p>
        </div>

        <form onSubmit={submitEntry} className="mt-5 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
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
            disabled={submitting}
            className="rounded-2xl bg-slate-950 p-4 text-lg font-black text-white shadow-lg disabled:opacity-50"
          >
            {submitting
              ? tr("guestbook_submitting", "Submitting...")
              : tr("guestbook_submit", "Submit for Approval")}
          </button>

          {submitStatus && (
            <div className="rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
              {submitStatus}
            </div>
          )}
        </form>
      </PageCard>

      {/* ===== APPROVED RIDE WALL ===== */}
      <PageCard className="flex h-full min-h-0 flex-col overflow-hidden">
        <h2 className="shrink-0 text-3xl font-black text-slate-950">
          {tr("guestbook_wall", "Ride Wall")}
        </h2>

        <div className="mt-5 grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-2">
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
