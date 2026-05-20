import { useEffect, useRef, useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import {
  acknowledgeDriverMessage,
  listenToRideSession,
} from "../../services/rideSessionService.js";

export default function PassengerDriverMessagePopup({
  appLanguage = "en",
  t = (key) => key,
}) {
  const [driverMessage, setDriverMessage] = useState(null);
  const lastSeenMessageIdRef = useRef("");

  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  useEffect(() => {
    const unsubscribe = listenToRideSession((session) => {
      const latestMessage = session?.latestDriverMessage;

      if (!latestMessage?.id || latestMessage.acknowledged) {
        setDriverMessage(null);
        return;
      }

      if (latestMessage.id !== lastSeenMessageIdRef.current) {
        lastSeenMessageIdRef.current = latestMessage.id;
      }

      setDriverMessage(latestMessage);
    });

    return () => unsubscribe();
  }, []);

  if (!driverMessage) return null;

  const translatedMessage =
    driverMessage.translations?.[appLanguage]?.trim?.() ||
    driverMessage.translations?.en?.trim?.() ||
    driverMessage.english ||
    tr("driver_message_default", "Your driver sent you a message.");

  async function acknowledgeMessage() {
    setDriverMessage(null);

    try {
      await acknowledgeDriverMessage(driverMessage.id);
    } catch (error) {
      console.error("Failed to acknowledge driver message:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-950 p-3 text-white">
            <MessageSquareHeart size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-black uppercase tracking-[.22em] text-slate-400">
              {tr("driver_message_label", "Message from your driver")}
            </div>

            <div className="mt-3 text-3xl font-black leading-tight">
              {translatedMessage}
            </div>

            {appLanguage !== "en" && driverMessage.english && (
              <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-500">
                English: {driverMessage.english}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={acknowledgeMessage}
          className="mt-6 w-full rounded-3xl bg-slate-950 p-4 text-lg font-black text-white"
        >
          {tr("driver_message_ack", "Got it")}
        </button>
      </div>
    </div>
  );
}
