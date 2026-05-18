import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import PageCard from "../layout/PageCard.jsx";

export default function MirrorPage({ t = (key) => key }) {
  // ===== CAMERA REFS =====
  // videoRef receives the live camera stream.
  // streamRef lets us stop all camera tracks when the mirror is turned off.
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const wakeLockRef = useRef(null);

  // ===== MIRROR STATE =====
  const [active, setActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== CAMERA SUPPORT CHECK =====
  function cameraIsAvailable() {
    return Boolean(navigator.mediaDevices?.getUserMedia);
  }

  // ===== SCREEN LIGHT HELPERS =====
  // Browsers generally cannot control actual system screen brightness.
  // This light mode makes the app surface white around the camera preview and
  // requests a screen wake lock when supported so the display stays awake.
  async function requestScreenWakeLock() {
    try {
      if (!navigator.wakeLock?.request) return;
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch (error) {
      console.warn("Screen wake lock unavailable:", error);
    }
  }

  async function releaseScreenWakeLock() {
    try {
      await wakeLockRef.current?.release?.();
    } catch {
      // Ignore release errors.
    } finally {
      wakeLockRef.current = null;
    }
  }

  // ===== START FRONT CAMERA MIRROR =====
  // Must be triggered by the Start Mirror button so Android/Fully can show permission prompts.
  async function startMirror() {
    setErrorMessage("");

    if (!cameraIsAvailable()) {
      setErrorMessage(
        tr(
          "mirror_error",
          "Camera access could not be started. Check browser or kiosk camera permission."
        )
      );
      return;
    }

    try {
      // Stop any previous stream before starting a new one.
      streamRef.current?.getTracks().forEach((track) => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      await requestScreenWakeLock();
      setActive(true);
    } catch (error) {
      console.error("Mirror camera failed:", error);

      releaseScreenWakeLock();
    setActive(false);
      setErrorMessage(
        tr(
          "mirror_error",
          "Camera access could not be started. Check browser or kiosk camera permission."
        )
      );
    }
  }

  // ===== STOP CAMERA STREAM =====
  function stopMirror() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setActive(false);
  }

  // ===== CLEAN UP CAMERA ON PAGE EXIT =====
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      releaseScreenWakeLock();
    };
  }, []);

  return (
    <div
      className={`${
        active
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white p-4"
          : "flex justify-center"
      }`}
    >
      <PageCard
        className={`flex ${
          active
            ? "h-full min-h-0 w-full max-w-none rounded-none bg-white shadow-none"
            : "h-[calc(100vh-155px)] min-h-[520px] w-full max-w-[min(96vw,980px)] md:h-[calc(100vh-170px)]"
        } flex-col overflow-hidden transition-colors duration-300`}
      >
        {/* ===== PAGE HEADER ===== */}
        {!active && (
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-950 shadow-sm">
                <CameraOff />
              </div>

              <div>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black leading-tight text-slate-950">
                  {tr("mirror_title", "Mirror")}
                </h2>

                <p className="text-sm leading-snug text-slate-600">
                  {tr("mirror_subtitle", "Use the front camera as a quick mirror.")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== RESPONSIVE MIRROR PREVIEW ===== */}
        <div
          className={`flex min-h-0 flex-1 items-center justify-center transition-colors duration-300 ${
            active
              ? "bg-white p-[clamp(1.5rem,6vw,5rem)]"
              : "mt-3 rounded-3xl bg-transparent"
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-3xl bg-black ${
              active
                ? "h-[min(72vh,720px)] w-[min(78vw,900px)] shadow-[0_0_90px_rgba(255,255,255,1)]"
                : "h-full w-full shadow-inner"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full scale-x-[-1] object-cover"
            />

            {!active && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
                <CameraOff size={52} className="text-white/40" />
                <div className="text-center text-base font-bold text-white/60">
                  {tr("mirror_start", "Start Mirror")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== CAMERA ERROR MESSAGE ===== */}
        {errorMessage && (
          <div className="mt-3 shrink-0 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-900">
            {errorMessage}
          </div>
        )}

        {/* ===== START / STOP CONTROL ===== */}
        <button
          type="button"
          onClick={active ? stopMirror : startMirror}
          className={`shrink-0 rounded-3xl bg-slate-950 p-3 text-lg font-black text-white shadow-lg ${
            active
              ? "fixed bottom-5 left-1/2 z-[60] w-[min(92vw,520px)] -translate-x-1/2"
              : "mt-3"
          }`}
        >
          {active
            ? tr("mirror_stop", "Stop Mirror")
            : tr("mirror_start", "Start Mirror")}
        </button>
      </PageCard>
    </div>
  );
}
