import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, Monitor, Trash2, User } from "lucide-react";
import {
  listenToPassengerRequests,
  listenToRideSession,
  updatePassengerRequestStatus,
} from "../../services/rideSessionService.js";
import DriverTranslationCard from "./DriverTranslationCard.jsx";

// ===== REQUEST TIME DISPLAY =====
// Converts Firestore timestamps into compact driver-console time labels.
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

function formatPageUpdatedTime(timestamp) {
  if (!timestamp?.toDate) return "Waiting for tablet...";

  return timestamp.toDate().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DriverConsolePage() {
  // ===== LIVE REQUEST STATE =====
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consoleError, setConsoleError] = useState("");
  const [rideSession, setRideSession] = useState({});

  // ===== PASSENGER REQUEST LISTENER =====
  // Keeps the driver console synced with Firestore passenger requests.
  useEffect(() => {
    const unsubscribe = listenToPassengerRequests((liveRequests) => {
      setRequests(liveRequests);
      setLoading(false);
      setConsoleError("");
    });

    return () => unsubscribe();
  }, []);

  // ===== RIDE SESSION LISTENER =====
  // Tracks passenger tablet page/status metadata for the driver.
  useEffect(() => {
    const unsubscribe = listenToRideSession((session) => {
      setRideSession(session || {});
    });

    return () => unsubscribe();
  }, []);

  // ===== VISIBLE REQUEST FILTERING =====
  // Cleared requests stay in Firestore history but disappear from the active console.
  const visibleRequests = useMemo(
    () => requests.filter((request) => request.status !== "cleared"),
    [requests]
  );

  const pendingCount = visibleRequests.filter(
    (request) => request.status === "pending"
  ).length;

  // ===== ACKNOWLEDGE REQUEST =====
  async function acknowledgeRequest(id) {
    try {
      await updatePassengerRequestStatus(id, "acknowledged");
    } catch (error) {
      console.error("Failed to acknowledge request:", error);
      setConsoleError("Could not acknowledge request.");
    }
  }

  // ===== CLEAR SINGLE REQUEST =====
  async function clearRequest(id) {
    try {
      await updatePassengerRequestStatus(id, "cleared");
    } catch (error) {
      console.error("Failed to clear request:", error);
      setConsoleError("Could not clear request.");
    }
  }

  // ===== CLEAR ALL VISIBLE REQUESTS =====
  async function clearAll() {
    try {
      await Promise.all(
        visibleRequests.map((request) =>
          updatePassengerRequestStatus(request.id, "cleared")
        )
      );
    } catch (error) {
      console.error("Failed to clear all requests:", error);
      setConsoleError("Could not clear all requests.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-4">
      <div className="mx-auto max-w-md">
        {/* ===== CONSOLE HEADER / LIVE COUNTS ===== */}
        <header className="mb-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.2em] text-white/50">
                Driver Console
              </div>

              <h1 className="mt-1 text-2xl font-black leading-tight">
                Ride Companion
              </h1>

              <p className="mt-1 text-sm text-white/60">
                Live passenger request console.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <Bell
                className={pendingCount > 0 ? "text-amber-300" : "text-white/40"}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                Pending
              </div>

              <div className="text-2xl font-black">{pendingCount}</div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                Visible
              </div>

              <div className="text-2xl font-black">
                {visibleRequests.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                Sync
              </div>

              <div className="text-sm font-black text-emerald-300">
                Live
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <Monitor size={18} className="text-cyan-200" />
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                    Tablet Page
                  </div>

                  <div className="truncate text-lg font-black text-cyan-200">
                    {rideSession.passengerPageLabel || "Waiting for tablet"}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wide text-white/40">
                {formatPageUpdatedTime(rideSession.passengerPageUpdatedAt)}
              </div>
            </div>
          </div>
        </header>

        {/* ===== PASSENGER REQUEST PANEL ===== */}
        <section className="rounded-3xl bg-white/10 p-4 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Passenger Requests</h2>

              <p className="text-sm text-white/50">
                Requests from the passenger tablet appear here.
              </p>
            </div>

            <button
              type="button"
              onClick={clearAll}
              disabled={visibleRequests.length === 0}
              className="rounded-xl bg-rose-400 px-3 py-2 text-sm font-black text-rose-950 shadow-lg disabled:opacity-40"
            >
              Clear
            </button>
          </div>

          {consoleError && (
            <div className="mb-3 rounded-2xl bg-rose-300 p-3 text-sm font-black text-rose-950">
              {consoleError}
            </div>
          )}

          {/* ===== REQUEST LIST ===== */}
          <div className="grid gap-3">
            {loading ? (
              <div className="rounded-2xl bg-white/5 p-8 text-center text-white/50">
                Loading requests...
              </div>
            ) : visibleRequests.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-8 text-center text-white/50">
                No active requests.
              </div>
            ) : (
              visibleRequests.map((request) => (
                <div key={request.id} className="rounded-2xl bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white/60">
                      {request.category || request.type || "Request"}
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                        request.status === "pending"
                          ? "bg-amber-300 text-amber-950"
                          : "bg-emerald-300 text-emerald-950"
                      }`}
                    >
                      {request.status || "pending"}
                    </div>
                  </div>

                  <div className="mt-3 text-xl font-black leading-tight">
                    {request.message || "Passenger request"}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
                    <Clock3 size={15} />
                    {formatRequestTime(request.createdAt)}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => acknowledgeRequest(request.id)}
                      disabled={request.status === "acknowledged"}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-3 py-3 text-sm font-black text-emerald-950 shadow-lg disabled:opacity-40"
                    >
                      <CheckCircle2 size={17} />
                      Ack
                    </button>

                    <button
                      type="button"
                      onClick={() => clearRequest(request.id)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm font-black text-white hover:bg-white/20"
                    >
                      <Trash2 size={17} />
                      Clear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ===== DRIVER TRANSLATION STATUS / LANGUAGE SYNC ===== */}
        <DriverTranslationCard />

        {/* ===== DRIVER / SYSTEM STATUS PANEL ===== */}
        <section className="mt-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <User />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-white/50">
                Driver
              </div>

              <div className="text-xl font-black">Aaron</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3">
              <span>Passenger Tablet</span>
              <span className="min-w-0 truncate text-right font-black text-emerald-300">
                {rideSession.passengerPageLabel || "Connected"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
              <span>Realtime Sync</span>
              <span className="font-black text-emerald-300">Firestore</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
              <span>Notifications</span>
              <span className="font-black text-white/60">Planned</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
