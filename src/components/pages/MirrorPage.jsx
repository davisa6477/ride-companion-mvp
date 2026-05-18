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
    <div className="flex justify-center">
      <PageCard
        className={`flex h-[calc(100vh-155px)] min-h-[520px] w-full max-w-[min(96vw,980px)] flex-col overflow-hidden transition-colors duration-300 md:h-[calc(100vh-170px)] ${
          active ? "bg-white" : ""
        }`}
      >
        {/* ===== PAGE HEADER ===== */}
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`${active ? "bg-white" : "bg-slate-100"} rounded-2xl p-3 text-slate-950 shadow-sm`}>
              {active ? <Camera /> : <CameraOff />}
            </div>

            <div>
              <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black leading-tight text-slate-950">
                {tr("mirror_title", "Mirror")}
              </h2>

              <p className="text-sm leading-snug text-slate-600">
                {active
                  ? tr("mirror_light_mode", "Light mode is helping brighten your face.")
                  : tr("mirror_subtitle", "Use the front camera as a quick mirror.")}
              </p>
            </div>
          </div>

          {active && (
            <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-slate-500 shadow-sm sm:block">
              {tr("mirror_screen_light", "Screen Light")}
            </div>
          )}
        </div>

        {/* ===== RESPONSIVE MIRROR PREVIEW ===== */}
        <div
          className={`mt-3 flex min-h-0 flex-1 items-center justify-center rounded-3xl transition-colors duration-300 ${
            active ? "bg-white p-4" : "bg-transparent"
          }`}
        >
          <div
            className={`relative h-full w-full overflow-hidden rounded-3xl bg-black ${
              active ? "shadow-[0_0_60px_rgba(255,255,255,0.95)]" : "shadow-inner"
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
          className="mt-3 shrink-0 rounded-3xl bg-slate-950 p-3 text-lg font-black text-white shadow-lg"
        >
          {active
            ? tr("mirror_stop", "Stop Mirror")
            : tr("mirror_start", "Start Mirror")}
        </button>
      </PageCard>
    </div>
  );
}
