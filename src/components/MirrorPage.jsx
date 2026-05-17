import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import PageCard from "./PageCard.jsx";

export default function MirrorPage({ t = (key) => key }) {
  // ===== CAMERA REFS =====
  // videoRef receives the live camera stream.
  // streamRef lets us stop all camera tracks when the mirror is turned off.
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

      setActive(true);
    } catch (error) {
      console.error("Mirror camera failed:", error);

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
    };
  }, []);

  return (
    <div className="flex justify-center">
      <PageCard className="flex max-h-[calc(100vh-190px)] min-h-[460px] w-full max-w-[min(96vw,980px)] flex-col overflow-hidden md:max-h-[calc(100vh-210px)]">
        {/* ===== PAGE HEADER ===== */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            {active ? <Camera /> : <CameraOff />}
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

        {/* ===== RESPONSIVE MIRROR PREVIEW ===== */}
        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
          <div className="relative h-full max-h-[min(62vh,640px)] w-full overflow-hidden rounded-3xl bg-black shadow-inner">
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
          className="mt-4 shrink-0 rounded-3xl bg-slate-950 p-3 text-lg font-black text-white"
        >
          {active
            ? tr("mirror_stop", "Stop Mirror")
            : tr("mirror_start", "Start Mirror")}
        </button>
      </PageCard>
    </div>
  );
}
