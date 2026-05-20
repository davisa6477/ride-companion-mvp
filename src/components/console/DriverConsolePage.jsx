import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Menu,
  MessageSquareHeart,
  Monitor,
  Send,
  Settings,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  listenToPassengerRequests,
  listenToRideSession,
  sendDriverMessageToPassenger,
  updatePassengerRequestStatus,
} from "../../services/rideSessionService.js";
import DriverTranslationCard from "./DriverTranslationCard.jsx";
import { translateDriverMessage } from "../../services/dynamicTranslationApiService.js";

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

const CONSOLE_SOUND_KEY = "rideCompanion.consoleSoundEnabled";
const CONSOLE_SOUND_SETTINGS_KEY = "rideCompanion.consoleSoundSettings";

const DEFAULT_SOUND_SETTINGS = {
  soundType: "soft",
  volume: 0.7,
  requestEnabled: true,
  guestbookEnabled: true,
  tipEnabled: true,
};

function loadConsoleSoundEnabled() {
  try {
    return localStorage.getItem(CONSOLE_SOUND_KEY) === "true";
  } catch {
    return false;
  }
}

function saveConsoleSoundEnabled(enabled) {
  try {
    localStorage.setItem(CONSOLE_SOUND_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore local storage errors.
  }
}

function loadConsoleSoundSettings() {
  try {
    const raw = localStorage.getItem(CONSOLE_SOUND_SETTINGS_KEY);
    return {
      ...DEFAULT_SOUND_SETTINGS,
      ...(raw ? JSON.parse(raw) : {}),
    };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

function saveConsoleSoundSettings(settings) {
  try {
    localStorage.setItem(
      CONSOLE_SOUND_SETTINGS_KEY,
      JSON.stringify({
        ...DEFAULT_SOUND_SETTINGS,
        ...settings,
      })
    );
  } catch {
    // Ignore local storage errors.
  }
}

const DRIVER_MESSAGE_TEMPLATES = [
  {
    key: "driver_ok",
    english: "Okay, no problem.",
    translations: {
      es: "Está bien, no hay problema.",
      fr: "D’accord, pas de problème.",
      de: "Okay, kein Problem.",
      pt: "Tudo bem, sem problema.",
      zh: "好的，没问题。",
      ar: "حسنًا، لا مشكلة.",
      vi: "Được rồi, không vấn đề gì.",
      ko: "알겠습니다, 문제없어요.",
      ja: "わかりました。問題ありません。",
      hi: "ठीक है, कोई समस्या नहीं।",
    },
  },
  {
    key: "driver_one_moment",
    english: "One moment, please.",
    translations: {
      es: "Un momento, por favor.",
      fr: "Un instant, s’il vous plaît.",
      de: "Einen Moment bitte.",
      pt: "Um momento, por favor.",
      zh: "请稍等。",
      ar: "لحظة من فضلك.",
      vi: "Vui lòng chờ một chút.",
      ko: "잠시만 기다려 주세요.",
      ja: "少々お待ちください。",
      hi: "कृपया एक क्षण प्रतीक्षा करें।",
    },
  },
  {
    key: "driver_safe_delay",
    english: "I saw your request. I’ll respond when it is safe.",
    translations: {
      es: "Vi su solicitud. Responderé cuando sea seguro.",
      fr: "J’ai vu votre demande. Je répondrai quand ce sera sécuritaire.",
      de: "Ich habe Ihre Anfrage gesehen. Ich antworte, sobald es sicher ist.",
      pt: "Vi sua solicitação. Responderei quando for seguro.",
      zh: "我看到了您的请求。安全时我会回复。",
      ar: "رأيت طلبك. سأرد عندما يكون ذلك آمنًا.",
      vi: "Tôi đã thấy yêu cầu của bạn. Tôi sẽ phản hồi khi an toàn.",
      ko: "요청을 확인했습니다. 안전할 때 답변하겠습니다.",
      ja: "リクエストを確認しました。安全な時に対応します。",
      hi: "मैंने आपका अनुरोध देखा है। सुरक्षित होने पर जवाब दूँगा।",
    },
  },
  {
    key: "driver_route_app",
    english: "For route or destination changes, please use your ride app.",
    translations: {
      es: "Para cambios de ruta o destino, use la aplicación del viaje.",
      fr: "Pour modifier l’itinéraire ou la destination, veuillez utiliser votre application de course.",
      de: "Für Routen- oder Zieländerungen verwenden Sie bitte Ihre Fahrten-App.",
      pt: "Para alterar rota ou destino, use o aplicativo da viagem.",
      zh: "如需更改路线或目的地，请使用您的叫车应用。",
      ar: "لتغيير المسار أو الوجهة، يرجى استخدام تطبيق الرحلة.",
      vi: "Để đổi tuyến đường hoặc điểm đến, vui lòng dùng ứng dụng chuyến đi.",
      ko: "경로나 목적지 변경은 승차 앱을 사용해 주세요.",
      ja: "ルートや目的地の変更は配車アプリをご利用ください。",
      hi: "मार्ग या गंतव्य बदलने के लिए कृपया अपनी राइड ऐप का उपयोग करें।",
    },
  },
  {
    key: "driver_thank_you",
    english: "Thank you, I appreciate it!",
    translations: {
      es: "¡Gracias, lo aprecio mucho!",
      fr: "Merci, j’apprécie beaucoup !",
      de: "Danke, ich weiß das zu schätzen!",
      pt: "Obrigado, eu agradeço!",
      zh: "谢谢，我很感激！",
      ar: "شكرًا لك، أقدّر ذلك!",
      vi: "Cảm ơn, tôi rất trân trọng!",
      ko: "감사합니다, 정말 고맙습니다!",
      ja: "ありがとうございます。感謝します！",
      hi: "धन्यवाद, मैं इसकी सराहना करता हूँ!",
    },
  },
];


const DRIVER_QUICK_TRANSLATION_TEMPLATES = [
  {
    key: "driver_confirm_destination",
    english: "Please confirm the destination.",
    translations: {
      es: "Por favor confirme el destino.",
      fr: "Veuillez confirmer la destination.",
      de: "Bitte bestätigen Sie das Ziel.",
      pt: "Por favor, confirme o destino.",
      zh: "请确认目的地。",
      ar: "يرجى تأكيد الوجهة.",
      vi: "Vui lòng xác nhận điểm đến.",
      ko: "목적지를 확인해 주세요.",
      ja: "目的地を確認してください。",
      hi: "कृपया गंतव्य की पुष्टि करें।",
    },
  },
  {
    key: "driver_seatbelt",
    english: "Please wear your seatbelt.",
    translations: {
      es: "Por favor use el cinturón de seguridad.",
      fr: "Veuillez attacher votre ceinture.",
      de: "Bitte legen Sie den Sicherheitsgurt an.",
      pt: "Por favor, use o cinto de segurança.",
      zh: "请系好安全带。",
      ar: "يرجى ربط حزام الأمان.",
      vi: "Vui lòng thắt dây an toàn.",
      ko: "안전벨트를 착용해 주세요.",
      ja: "シートベルトを締めてください。",
      hi: "कृपया सीटबेल्ट लगाएँ।",
    },
  },
  {
    key: "driver_arrived",
    english: "We have arrived.",
    translations: {
      es: "Hemos llegado.",
      fr: "Nous sommes arrivés.",
      de: "Wir sind angekommen.",
      pt: "Chegamos.",
      zh: "我们到了。",
      ar: "لقد وصلنا.",
      vi: "Chúng ta đã đến nơi.",
      ko: "도착했습니다.",
      ja: "到着しました。",
      hi: "हम पहुँच गए हैं।",
    },
  },
  {
    key: "driver_temperature",
    english: "Do you need the temperature changed?",
    translations: {
      es: "¿Necesita que cambie la temperatura?",
      fr: "Voulez-vous changer la température ?",
      de: "Möchten Sie die Temperatur ändern?",
      pt: "Você quer mudar a temperatura?",
      zh: "您需要调节温度吗？",
      ar: "هل تريد تغيير درجة الحرارة؟",
      vi: "Bạn có cần chỉnh nhiệt độ không?",
      ko: "온도를 조절해 드릴까요?",
      ja: "温度を変えましょうか？",
      hi: "क्या आपको तापमान बदलवाना है?",
    },
  },
  {
    key: "driver_quiet_ride",
    english: "Do you need a quiet ride?",
    translations: {
      es: "¿Prefiere un viaje tranquilo?",
      fr: "Préférez-vous un trajet calme ?",
      de: "Möchten Sie eine ruhige Fahrt?",
      pt: "Você prefere uma viagem tranquila?",
      zh: "您需要安静的行程吗？",
      ar: "هل تريد رحلة هادئة؟",
      vi: "Bạn có muốn chuyến đi yên tĩnh không?",
      ko: "조용한 운행을 원하시나요?",
      ja: "静かな乗車をご希望ですか？",
      hi: "क्या आप शांत यात्रा चाहते हैं?",
    },
  },
  {
    key: "driver_quick_stop",
    english: "Do you need a quick stop?",
    translations: {
      es: "¿Necesita una parada rápida?",
      fr: "Avez-vous besoin d’un arrêt rapide ?",
      de: "Brauchen Sie einen kurzen Stopp?",
      pt: "Você precisa de uma parada rápida?",
      zh: "您需要短暂停靠吗？",
      ar: "هل تحتاج إلى توقف سريع؟",
      vi: "Bạn có cần dừng nhanh không?",
      ko: "잠깐 정차가 필요하신가요?",
      ja: "少し停車が必要ですか？",
      hi: "क्या आपको एक छोटी रुकावट चाहिए?",
    },
  },
  {
    key: "driver_translator_notice",
    english: "I do not speak this language, but I can use this translator.",
    translations: {
      es: "No hablo este idioma, pero puedo usar este traductor.",
      fr: "Je ne parle pas cette langue, mais je peux utiliser ce traducteur.",
      de: "Ich spreche diese Sprache nicht, aber ich kann diesen Übersetzer benutzen.",
      pt: "Eu não falo este idioma, mas posso usar este tradutor.",
      zh: "我不会说这种语言，但我可以使用这个翻译器。",
      ar: "أنا لا أتحدث هذه اللغة، لكن يمكنني استخدام هذا المترجم.",
      vi: "Tôi không nói ngôn ngữ này, nhưng tôi có thể dùng trình dịch này.",
      ko: "저는 이 언어를 말하지 못하지만 번역기를 사용할 수 있습니다.",
      ja: "この言語は話せませんが、この翻訳機を使えます。",
      hi: "मैं यह भाषा नहीं बोलता, लेकिन इस अनुवादक का उपयोग कर सकता हूँ।",
    },
  },
];

const ALL_DRIVER_MESSAGE_TEMPLATES = [
  ...DRIVER_MESSAGE_TEMPLATES,
  ...DRIVER_QUICK_TRANSLATION_TEMPLATES,
];

const CONSOLE_SECTIONS = [
  {
    id: "communication",
    label: "Communication",
    icon: MessageSquareHeart,
    description: "Requests and driver messages",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Sound and system configuration",
  },
];

export default function DriverConsolePage() {
  // ===== LIVE REQUEST STATE =====
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consoleError, setConsoleError] = useState("");
  const [driverMessageStatus, setDriverMessageStatus] = useState("");
  const [customDriverMessage, setCustomDriverMessage] = useState("");
  const [customMessageTranslating, setCustomMessageTranslating] = useState(false);
  const [rideSession, setRideSession] = useState({});
  const [consoleSection, setConsoleSection] = useState("communication");
  const [menuOpen, setMenuOpen] = useState(false);

  // ===== CONSOLE SOUND STATE =====
  const [soundEnabled, setSoundEnabled] = useState(() => loadConsoleSoundEnabled());
  const [soundReady, setSoundReady] = useState(false);
  const [soundSettings, setSoundSettings] = useState(() =>
    loadConsoleSoundSettings()
  );
  const audioContextRef = useRef(null);
  const lastNotificationIdRef = useRef("");

  // ===== CONSOLE SOUND HELPERS =====
  function updateSoundSetting(field, value) {
    const nextSettings = {
      ...soundSettings,
      [field]: value,
    };

    setSoundSettings(nextSettings);
    saveConsoleSoundSettings(nextSettings);
  }

  function notificationTypeEnabled(type) {
    if (type === "request") return soundSettings.requestEnabled;
    if (type === "guestbook") return soundSettings.guestbookEnabled;
    if (type === "tip") return soundSettings.tipEnabled;

    return true;
  }

  function initializeSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        setConsoleError("This browser does not support console notification sound.");
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      audioContextRef.current.resume?.();
      saveConsoleSoundEnabled(true);
      setSoundEnabled(true);
      setSoundReady(true);
      playNotificationSound("enabled");
    } catch (error) {
      console.error("Failed to initialize notification sound:", error);
      setConsoleError("Could not enable notification sound on this device.");
    }
  }

  function disableSound() {
    saveConsoleSoundEnabled(false);
    setSoundEnabled(false);
    setSoundReady(false);
  }

  function playNotificationSound(type = "general") {
    if (!soundEnabled && type !== "enabled") return;
    if (type !== "enabled" && !notificationTypeEnabled(type)) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!audioContextRef.current && AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }

      const context = audioContextRef.current;
      if (!context) return;

      context.resume?.();

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      const baseVolume = Math.max(
        0.05,
        Math.min(1, Number(soundSettings.volume) || DEFAULT_SOUND_SETTINGS.volume)
      );

      const frequency =
        type === "request"
          ? 880
          : type === "guestbook"
          ? 660
          : type === "tip"
          ? 1046
          : 784;

      oscillator.type = soundSettings.soundType === "bright" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now);

      const attackVolume =
        soundSettings.soundType === "subtle"
          ? 0.11
          : soundSettings.soundType === "bright"
          ? 0.28
          : 0.2;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(attackVolume * baseVolume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.3);

      if (type === "tip") {
        const secondOscillator = context.createOscillator();
        const secondGain = context.createGain();

        secondOscillator.type =
          soundSettings.soundType === "bright" ? "triangle" : "sine";
        secondOscillator.frequency.setValueAtTime(1318, now + 0.12);

        secondGain.gain.setValueAtTime(0.0001, now + 0.12);
        secondGain.gain.exponentialRampToValueAtTime(0.18 * baseVolume, now + 0.14);
        secondGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        secondOscillator.connect(secondGain);
        secondGain.connect(context.destination);
        secondOscillator.start(now + 0.12);
        secondOscillator.stop(now + 0.42);
      }
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  }

  function testNotificationSound() {
    if (!soundEnabled) {
      initializeSound();
      return;
    }

    playNotificationSound("enabled");
  }

  // ===== PASSENGER REQUEST LISTENER =====
  useEffect(() => {
    const unsubscribe = listenToPassengerRequests((liveRequests) => {
      setRequests(liveRequests);
      setLoading(false);
      setConsoleError("");
    });

    return () => unsubscribe();
  }, []);

  // ===== RIDE SESSION LISTENER =====
  useEffect(() => {
    const unsubscribe = listenToRideSession((session) => {
      setRideSession(session || {});
    });

    return () => unsubscribe();
  }, []);

  // ===== CONSOLE NOTIFICATION SOUND LISTENER =====
  useEffect(() => {
    const notification = rideSession.latestConsoleNotification;

    if (!notification?.id) return;

    if (!lastNotificationIdRef.current) {
      lastNotificationIdRef.current = notification.id;
      return;
    }

    if (lastNotificationIdRef.current === notification.id) return;

    lastNotificationIdRef.current = notification.id;
    playNotificationSound(notification.type);
  }, [rideSession.latestConsoleNotification]);

  // ===== VISIBLE REQUEST FILTERING =====
  const visibleRequests = useMemo(
    () => requests.filter((request) => request.status !== "cleared"),
    [requests]
  );

  const pendingCount = visibleRequests.filter(
    (request) => request.status === "pending"
  ).length;

  const activeSection = CONSOLE_SECTIONS.find(
    (section) => section.id === consoleSection
  );

  // ===== DRIVER → PASSENGER MESSAGE =====
  async function sendDriverMessage(template) {
    setDriverMessageStatus("");

    try {
      await sendDriverMessageToPassenger(template);
      setDriverMessageStatus(`Sent: ${template.english}`);
    } catch (error) {
      console.error("Failed to send driver message:", error);
      setDriverMessageStatus("Could not send driver message.");
    }
  }

  async function sendCustomDriverMessage() {
    const trimmedMessage = customDriverMessage.trim();
    const passengerLanguage = rideSession.passengerLanguage || "en";

    if (!trimmedMessage) {
      setDriverMessageStatus("Type a message before sending.");
      return;
    }

    setCustomMessageTranslating(true);
    setDriverMessageStatus(
      passengerLanguage === "en"
        ? "Sending typed message..."
        : `Translating typed message to ${passengerLanguage}...`
    );

    try {
      let translations = {};

      if (passengerLanguage !== "en") {
        const translation = await translateDriverMessage({
          text: trimmedMessage,
          targetLanguage: passengerLanguage,
          sourceLanguage: "en",
        });

        translations = {
          [passengerLanguage]: translation.translatedText || trimmedMessage,
        };
      }

      await sendDriverMessage({
        key: "driver_custom",
        english: trimmedMessage,
        translations,
      });

      setCustomDriverMessage("");
    } catch (error) {
      console.error("Failed to translate typed message:", error);

      await sendDriverMessage({
        key: "driver_custom",
        english: trimmedMessage,
        translations: {},
      });

      setDriverMessageStatus(
        "Translation failed; sent the original typed message instead."
      );
    } finally {
      setCustomMessageTranslating(false);
    }
  }

  // ===== REQUEST ACTIONS =====
  async function acknowledgeRequest(id) {
    try {
      await updatePassengerRequestStatus(id, "acknowledged");
    } catch (error) {
      console.error("Failed to acknowledge request:", error);
      setConsoleError("Could not acknowledge request.");
    }
  }

  async function clearRequest(id) {
    try {
      await updatePassengerRequestStatus(id, "cleared");
    } catch (error) {
      console.error("Failed to clear request:", error);
      setConsoleError("Could not clear request.");
    }
  }

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

  function selectConsoleSection(sectionId) {
    setConsoleSection(sectionId);
    setMenuOpen(false);
  }

  function renderConsoleMenu() {
    return (
      <div className="absolute right-0 top-14 z-30 w-72 rounded-3xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
        {CONSOLE_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = consoleSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => selectConsoleSection(section.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${
                active ? "bg-white text-slate-950" : "text-white hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              <div>
                <div className="text-sm font-black">{section.label}</div>
                <div className={`text-xs ${active ? "text-slate-500" : "text-white/45"}`}>
                  {section.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderHeader() {
    return (
      <header className="mb-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.2em] text-white/50">
              Driver Console
            </div>

            <h1 className="mt-1 text-2xl font-black leading-tight">
              {activeSection?.label || "Ride Companion"}
            </h1>

            <p className="mt-1 text-sm text-white/60">
              {activeSection?.description || "Live passenger console."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={soundEnabled ? disableSound : initializeSound}
              className={`rounded-2xl p-3 ${
                soundEnabled
                  ? "bg-emerald-300 text-emerald-950"
                  : "bg-white/10 text-white/50"
              }`}
              title={soundEnabled ? "Notification sound enabled" : "Enable notification sound"}
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20"
              title="Console menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>

            {menuOpen && renderConsoleMenu()}
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
            <div className="text-2xl font-black">{visibleRequests.length}</div>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
              Sync
            </div>
            <div className="text-sm font-black text-emerald-300">Live</div>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <div className="rounded-2xl bg-white/10 p-3">
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

          <div className="rounded-2xl bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                  Latest Alert
                </div>

                <div className="truncate text-sm font-black text-white/80">
                  {rideSession.latestConsoleNotification?.label || "No alerts yet"}
                </div>

                {rideSession.latestConsoleNotification?.message && (
                  <div className="truncate text-xs text-white/45">
                    {rideSession.latestConsoleNotification.message}
                  </div>
                )}
              </div>

              <div
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                  soundEnabled
                    ? "bg-emerald-300 text-emerald-950"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {soundEnabled ? "Sound On" : "Tap Sound"}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  function renderRequestsPanel() {
    return (
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
    );
  }

  function renderDriverMessagesPanel() {
    return (
      <section className="mt-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
        <div>
          <h2 className="text-xl font-black">Driver Messages</h2>
          <p className="text-sm text-white/50">
            Send a popup to the passenger tablet. Presets use manual translations; typed messages use MyMemory when possible.
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          {ALL_DRIVER_MESSAGE_TEMPLATES.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => sendDriverMessage(template)}
              className="rounded-2xl bg-white/10 p-3 text-left text-sm font-black text-white hover:bg-white/20"
            >
              {template.english}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white/5 p-3">
          <label className="text-xs font-black uppercase tracking-wide text-white/50">
            Type message to passenger
          </label>

          <textarea
            value={customDriverMessage}
            onChange={(event) => setCustomDriverMessage(event.target.value)}
            placeholder="Type a short message..."
            rows={3}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 p-3 text-sm font-bold text-white outline-none placeholder:text-white/30"
          />

          <button
            type="button"
            onClick={sendCustomDriverMessage}
            disabled={customMessageTranslating}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-cyan-950 disabled:opacity-60"
          >
            <Send size={16} />
            {customMessageTranslating ? "Translating..." : "Send Typed Message"}
          </button>

          <div className="mt-2 text-xs font-bold text-white/40">
            Typed messages are translated through the backend MyMemory scaffold when the passenger language is not English. If translation fails, the original message is sent.
          </div>
        </div>

        {driverMessageStatus && (
          <div className="mt-3 rounded-2xl bg-white/5 p-3 text-sm font-bold text-white/60">
            {driverMessageStatus}
          </div>
        )}

        {rideSession.latestDriverMessage?.id && (
          <div className="mt-3 rounded-2xl bg-white/5 p-3 text-xs font-bold text-white/45">
            Latest passenger message:{" "}
            <span className="text-white/70">
              {rideSession.latestDriverMessage.acknowledged
                ? "Acknowledged"
                : "Waiting for passenger acknowledgment"}
            </span>
          </div>
        )}
      </section>
    );
  }

  function renderCommunicationSection() {
    return (
      <>
        {renderRequestsPanel()}

        <div className="mt-4">
          <DriverTranslationCard />
        </div>

        {renderDriverMessagesPanel()}
      </>
    );
  }

  function renderSoundSettingsPanel() {
    return (
      <section className="rounded-3xl bg-white/10 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black">Notification Sounds</h2>
            <p className="text-sm text-white/50">
              Configure sounds for this console device.
            </p>
          </div>

          <button
            type="button"
            onClick={testNotificationSound}
            className="rounded-xl bg-cyan-300 px-3 py-2 text-sm font-black text-cyan-950 shadow-lg"
          >
            Test Sound
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-white/70">
              Sound style
              <select
                value={soundSettings.soundType}
                onChange={(event) =>
                  updateSoundSetting("soundType", event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-slate-950 p-3 text-white outline-none"
              >
                <option value="soft">Soft</option>
                <option value="bright">Bright</option>
                <option value="subtle">Subtle</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold text-white/70">
              Volume: {Math.round((soundSettings.volume || 0) * 100)}%
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={soundSettings.volume}
                onChange={(event) =>
                  updateSoundSetting("volume", Number(event.target.value))
                }
                className="h-10"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["requestEnabled", "Requests"],
              ["guestbookEnabled", "Guestbook"],
              ["tipEnabled", "Tip links"],
            ].map(([field, label]) => (
              <label
                key={field}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3 text-sm font-black"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(soundSettings[field])}
                  onChange={(event) =>
                    updateSoundSetting(field, event.target.checked)
                  }
                  className="h-5 w-5"
                />
              </label>
            ))}
          </div>

          <div className="rounded-2xl bg-white/5 p-3 text-xs font-bold text-white/45">
            Tip alerts mean the passenger opened a tip link. External payment completion cannot be verified from here.
          </div>
        </div>
      </section>
    );
  }

  function renderSystemStatusPanel() {
    return (
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
            <span
              className={`font-black ${
                soundEnabled ? "text-emerald-300" : "text-white/60"
              }`}
            >
              {soundEnabled
                ? `${soundSettings.soundType} / ${Math.round(
                    (soundSettings.volume || 0) * 100
                  )}%`
                : "Tap speaker"}
            </span>
          </div>
        </div>
      </section>
    );
  }

  function renderSettingsSection() {
    return (
      <>
        {renderSoundSettingsPanel()}
        {renderSystemStatusPanel()}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-4">
      <div className="mx-auto max-w-md">
        {renderHeader()}

        {consoleSection === "communication"
          ? renderCommunicationSection()
          : renderSettingsSection()}
      </div>
    </main>
  );
}
