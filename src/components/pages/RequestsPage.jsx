// ===== PASSENGER REQUESTS PAGE =====
// Allows passengers to send quick mid-ride requests to the driver console.
// Uses Firestore through rideSessionService.js for live request sync.
// Default request labels can translate; admin-created custom labels fall back to their saved text.

import { useEffect, useMemo, useState } from "react";
import PageCard from "../layout/PageCard.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import { categoryDescriptions } from "../../data/defaultRequests.js";
import {
  listenToPassengerRequests,
  sendPassengerRequest,
} from "../../services/rideSessionService.js";

// ===== REQUEST TIME DISPLAY =====
// Keeps Firestore timestamps readable for the passenger status cards.
function formatRequestTime(timestamp) {
  if (!timestamp?.toDate) return "Just now";

  const date = timestamp.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestsPage({
  requestCategories = {},
  t = (key) => key,
}) {
  // ===== LOCAL UI STATE =====
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [liveRequests, setLiveRequests] = useState([]);
  const [sendError, setSendError] = useState("");
  const [sendingRequest, setSendingRequest] = useState("");

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== REQUEST TEXT TRANSLATION HELPERS =====
  // Static/default request text can be translated with request_category_* and request_item_* keys.
  // Custom admin-created request text falls back to the original English/custom phrase.
  function getCategoryLabel(category) {
    return tr(`request_category_${category}`, category);
  }

  function getCategoryDescription(category) {
    return tr(
      `request_category_description_${category}`,
      categoryDescriptions[category] ||
        tr("requests_default_category", "Passenger requests")
    );
  }

  function getRequestItemLabel(item) {
    return tr(`request_item_${item}`, item);
  }

  // ===== LIVE REQUEST LISTENER =====
  useEffect(() => {
    const unsubscribe = listenToPassengerRequests((requests) => {
      setLiveRequests(requests);
    });

    return () => unsubscribe();
  }, []);

  // ===== REQUEST STATUS FILTERING =====
  const visibleRequests = useMemo(
    () => liveRequests.filter((request) => request.status !== "cleared"),
    [liveRequests]
  );

  const latestVisibleRequest = visibleRequests[0];

  // ===== SEND PASSENGER REQUEST =====
  async function sendRequest(item) {
    setSendError("");
    setSendingRequest(item);

    try {
      await sendPassengerRequest({
        category: selectedCategory,
        message: item,
      });

      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to send request:", error);

      setSendError(
        tr(
          "requests_error",
          "Could not send request. Please try again."
        )
      );
    } finally {
      setSendingRequest("");
    }
  }

  // ===== STATUS BADGE HELPERS =====
  function getStatusStyles(status) {
    if (status === "acknowledged") {
      return "bg-emerald-100 text-emerald-900";
    }

    return "bg-amber-100 text-amber-900";
  }

  function getStatusLabel(status) {
    if (status === "acknowledged") {
      return tr("requests_acknowledged", "Acknowledged");
    }

    return tr("requests_pending", "Pending");
  }

  return (
    <>
      <PageCard className={`${PAGE_FRAME_CLASS} flex min-h-0 flex-col overflow-hidden`}>
        {/* ===== PAGE HEADER ===== */}
        <div className="shrink-0 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {tr("requests_title", "Mid-Ride Requests")}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {tr(
                "requests_subtitle",
                "Quick passenger requests designed to minimize distraction."
              )}
            </p>
          </div>

          {latestVisibleRequest && (
            <div
              className={`rounded-2xl px-4 py-2 text-sm font-black shadow ${getStatusStyles(
                latestVisibleRequest.status
              )}`}
            >
              {getStatusLabel(latestVisibleRequest.status)}:{" "}
              {getRequestItemLabel(latestVisibleRequest.message)}
            </div>
          )}
        </div>

        {sendError && (
          <div className="mt-4 shrink-0 rounded-2xl bg-rose-100 p-4 text-sm font-black text-rose-900">
            {sendError}
          </div>
        )}

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          {/* ===== LIVE REQUEST STATUS CARDS ===== */}
          {visibleRequests.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                {tr("requests_status_title", "Request Status")}
              </h3>

              <p className="text-sm text-slate-500">
                {tr(
                  "requests_status_subtitle",
                  "Driver updates appear here automatically."
                )}
              </p>
            </div>
          </div>

              <div className="grid gap-3 md:grid-cols-2">
                {visibleRequests.slice(0, 4).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">
                    {request.category
                      ? getCategoryLabel(request.category)
                      : tr("requests_request", "Request")}
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusStyles(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </div>
                </div>

                <div className="mt-3 text-lg font-black text-slate-950">
                  {getRequestItemLabel(request.message)}
                </div>

                <div className="mt-2 text-sm font-bold text-slate-500">
                  {formatRequestTime(request.createdAt)}
                </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===== REQUEST CATEGORY GRID ===== */}
          <div className={`${visibleRequests.length > 0 ? "mt-4" : ""} grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
            {Object.entries(requestCategories).map(([category]) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center shadow-sm transition hover:bg-slate-100"
          >
            <div className="text-xl font-black leading-tight text-slate-950">
              {getCategoryLabel(category)}
            </div>

            <div className="mt-2 text-sm font-medium text-slate-500">
              {getCategoryDescription(category)}
            </div>
            </button>
          ))}
          </div>
        </div>
      </PageCard>

      {/* ===== REQUEST SELECTION MODAL ===== */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black text-slate-950">
                  {getCategoryLabel(selectedCategory)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {tr(
                    "requests_select_request",
                    "Select a request below."
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
              >
                {tr("requests_cancel", "Cancel")}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(requestCategories[selectedCategory] || []).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendRequest(item)}
                  disabled={sendingRequest === item}
                  className="flex min-h-[92px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-base font-black leading-snug text-slate-800 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {sendingRequest === item
                    ? tr("requests_sending", "Sending...")
                    : getRequestItemLabel(item)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
