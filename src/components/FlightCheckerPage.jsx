// ===== PASSENGER FLIGHT CHECKER PAGE =====
// Generates a QR code for flight status lookup so passengers can continue on their own phone.
// This keeps the passenger tablet from opening external flight-tracking sites directly.

import React, { useMemo, useState } from "react";
import { Plane, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import PageCard from "./PageCard.jsx";

export default function FlightCheckerPage({ t = (key) => key }) {
  // ===== FLIGHT INPUT STATE =====
  const [flightNumber, setFlightNumber] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== FLIGHT NUMBER NORMALIZATION =====
  // Converts passenger input like "aa 123" into "AA123".
  function normalizeFlight(value) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  // ===== FLIGHTAWARE QR URL =====
  const flightUrl = useMemo(() => {
    if (!selectedFlight) return "";

    return `https://www.flightaware.com/live/flight/${selectedFlight}`;
  }, [selectedFlight]);

  // ===== QR GENERATION HANDLER =====
  function prepareFlightQr(e) {
    e.preventDefault();

    const normalized = normalizeFlight(flightNumber);

    if (normalized.length < 3) {
      setErrorMessage(
        tr(
          "flights_error",
          "Enter an airline code and flight number, like AA123 or DL456."
        )
      );

      setSelectedFlight("");
      return;
    }

    setErrorMessage("");
    setSelectedFlight(normalized);
  }

  return (
    <PageCard className="min-h-[520px]">
      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <Plane />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {tr("flights_title", "Flight Checker")}
            </h2>

            <p className="text-slate-600">
              {tr(
                "flights_subtitle",
                "Generate a QR code passengers can scan on their own phone."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.85fr]">
        {/* ===== FLIGHT INPUT PANEL ===== */}
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="text-sm font-bold uppercase tracking-wide text-white/50">
            {tr("flights_qr_title", "Flight status QR")}
          </div>

          <h3 className="mt-3 text-4xl font-black leading-tight">
            {tr("flights_enter", "Enter a flight number")}
          </h3>

          <p className="mt-3 text-white/70">
            {tr(
              "flights_help",
              "Use the airline code plus number, such as AA123, DL456, UA789, or WN101."
            )}
          </p>

          <form onSubmit={prepareFlightQr} className="mt-6 grid gap-3">
            <input
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder={tr("flights_placeholder", "Example: AA123")}
              className="rounded-2xl border border-white/10 bg-white p-4 text-2xl font-black uppercase tracking-wide text-slate-950 outline-none focus:ring-4 focus:ring-white/20"
            />

            <button
              type="submit"
              className="rounded-2xl bg-white p-4 text-lg font-black text-slate-950 shadow-lg"
            >
              {tr("flights_button", "Show Flight QR Code")}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-amber-100 p-4 font-bold text-amber-900">
              {errorMessage}
            </div>
          )}
        </div>

        {/* ===== QR DISPLAY PANEL ===== */}
        <div className="rounded-3xl bg-slate-100 p-6">
          {flightUrl ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600 shadow">
                <QrCode size={16} /> {selectedFlight}
              </div>

              <div className="rounded-3xl bg-white p-5 shadow">
                <QRCodeSVG value={flightUrl} size={230} />
              </div>

              <p className="mt-5 max-w-sm text-sm font-medium text-slate-600">
                {tr(
                  "flights_scan_help",
                  "Scan with your phone to check this flight outside the ride tablet. This keeps the passenger screen locked in kiosk mode."
                )}
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center text-slate-500">
              <QrCode size={72} className="mb-4 opacity-50" />

              <h3 className="text-2xl font-black text-slate-700">
                {tr("flights_empty_title", "QR code will appear here")}
              </h3>

              <p className="mt-2 max-w-sm">
                {tr(
                  "flights_empty_sub",
                  "Passengers scan the code with their own phone instead of opening another app on the tablet."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageCard>
  );
}
