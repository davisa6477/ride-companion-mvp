import { useRef, useState } from "react";
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

  // ===== START FRONT CAMERA MIRROR =====
  async function startMirror() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActive(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Mirror camera failed:", error);

      setErrorMessage(
        tr("mirror_error", "Camera access could not be started.")
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

  return (
    <PageCard>
      {/* ===== PAGE HEADER ===== */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3">
          {active ? <Camera /> : <CameraOff />}
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-950">
            {tr("mirror_title", "Mirror")}
          </h2>

          <p className="text-slate-600">
            {tr("mirror_subtitle", "Use the front camera as a quick mirror.")}
          </p>
        </div>
      </div>

      {/* ===== MIRROR PREVIEW ===== */}
      <div className="mt-5 overflow-hidden rounded-3xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full scale-x-[-1] object-cover"
        />
      </div>

      {/* ===== CAMERA ERROR MESSAGE ===== */}
      {errorMessage && (
        <div className="mt-4 rounded-2xl bg-rose-100 p-4 font-bold text-rose-900">
          {errorMessage}
        </div>
      )}

      {/* ===== START / STOP CONTROL ===== */}
      <button
        type="button"
        onClick={active ? stopMirror : startMirror}
        className="mt-5 w-full rounded-3xl bg-slate-950 p-4 text-xl font-black text-white"
      >
        {active
          ? tr("mirror_stop", "Stop Mirror")
          : tr("mirror_start", "Start Mirror")}
      </button>
    </PageCard>
  );
}
