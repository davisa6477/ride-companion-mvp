// ===== PASSENGER TRANSLATION PAGE TRANSLATIONS =====
// Static text used by TranslationPage.jsx. Quick question mock translations live in the component for now.
const translate = {
  en: {
    translate_title: "Translation Helper",
    translate_subtitle:
      "Choose your language and send simple questions to the driver.",
    reset_english: "Back to English",
    translate_language_label: "Passenger language",
    translate_current_setup: "Current setup",
    translate_passenger_to_driver: "Passenger → Driver",
    translate_type_or_tap:
      "Type or tap a question. The English version appears for the driver.",
    translate_type_in: "Type in",
    translate_to_english: "Translate to English",
    translate_english_result: "English message appears here.",
    translate_quick_questions: "Passenger quick questions",
    translate_quick_questions_subtitle:
      "Tap one to show the driver what you need.",
    translate_api_notice:
      "Translation API is not connected yet. Language selection now syncs to the driver console.",
    translate_sync_error: "Could not sync language to driver console.",
  },

  es: {
    translate_title: "Ayuda de traducción",
    translate_subtitle:
      "Elija su idioma y envíe preguntas simples al conductor.",
    reset_english: "Volver a inglés",
    translate_language_label: "Idioma del pasajero",
    translate_current_setup: "Configuración actual",
    translate_passenger_to_driver: "Pasajero → Conductor",
    translate_type_or_tap:
      "Escriba o toque una pregunta. La versión en inglés aparece para el conductor.",
    translate_type_in: "Escriba en",
    translate_to_english: "Traducir al inglés",
    translate_english_result: "El mensaje en inglés aparecerá aquí.",
    translate_quick_questions: "Preguntas rápidas del pasajero",
    translate_quick_questions_subtitle:
      "Toque una para mostrarle al conductor lo que necesita.",
    translate_api_notice:
      "La API de traducción aún no está conectada. La selección de idioma ahora se sincroniza con la consola del conductor.",
    translate_sync_error:
      "No se pudo sincronizar el idioma con la consola del conductor.",
  },

  fr: {
    translate_title: "Aide à la traduction",
    translate_subtitle:
      "Choisissez votre langue et envoyez des questions simples au chauffeur.",
    reset_english: "Retour à l’anglais",
    translate_language_label: "Langue du passager",
    translate_current_setup: "Configuration actuelle",
    translate_passenger_to_driver: "Passager → Chauffeur",
    translate_type_or_tap:
      "Tapez ou touchez une question. La version anglaise apparaît pour le chauffeur.",
    translate_type_in: "Écrire en",
    translate_to_english: "Traduire en anglais",
    translate_english_result: "Le message en anglais apparaîtra ici.",
    translate_quick_questions: "Questions rapides du passager",
    translate_quick_questions_subtitle:
      "Touchez une question pour montrer au chauffeur ce dont vous avez besoin.",
    translate_api_notice:
      "L’API de traduction n’est pas encore connectée. Le choix de langue se synchronise maintenant avec la console du chauffeur.",
    translate_sync_error:
      "Impossible de synchroniser la langue avec la console du chauffeur.",
  },
  de: {
    translate_title: "Übersetzungshilfe",
    translate_subtitle: "Wählen Sie Ihre Sprache und senden Sie einfache Fragen an den Fahrer.",
    reset_english: "Zurück zu Englisch",
    translate_language_label: "Sprache des Fahrgasts",
    translate_current_setup: "Aktuelle Einstellung",
    translate_passenger_to_driver: "Fahrgast → Fahrer",
    translate_type_or_tap: "Tippen Sie eine Frage ein oder wählen Sie eine aus. Die englische Version erscheint für den Fahrer.",
    translate_type_in: "Schreiben auf",
    translate_to_english: "Ins Englische übersetzen",
    translate_english_result: "Die englische Nachricht erscheint hier.",
    translate_quick_questions: "Schnelle Fragen des Fahrgasts",
    translate_quick_questions_subtitle: "Tippen Sie eine an, um dem Fahrer zu zeigen, was Sie brauchen.",
    translate_api_notice: "Die Übersetzungs-API ist noch nicht verbunden. Die Sprachauswahl wird jetzt mit der Fahrerkonsole synchronisiert.",
    translate_sync_error: "Die Sprache konnte nicht mit der Fahrerkonsole synchronisiert werden.",
  },

  pt: {
    translate_title: "Ajuda de tradução",
    translate_subtitle: "Escolha seu idioma e envie perguntas simples ao motorista.",
    reset_english: "Voltar para inglês",
    translate_language_label: "Idioma do passageiro",
    translate_current_setup: "Configuração atual",
    translate_passenger_to_driver: "Passageiro → Motorista",
    translate_type_or_tap: "Digite ou toque em uma pergunta. A versão em inglês aparece para o motorista.",
    translate_type_in: "Digite em",
    translate_to_english: "Traduzir para inglês",
    translate_english_result: "A mensagem em inglês aparecerá aqui.",
    translate_quick_questions: "Perguntas rápidas do passageiro",
    translate_quick_questions_subtitle: "Toque em uma para mostrar ao motorista o que você precisa.",
    translate_api_notice: "A API de tradução ainda não está conectada. A seleção de idioma agora sincroniza com o console do motorista.",
    translate_sync_error: "Não foi possível sincronizar o idioma com o console do motorista.",
  },

  zh: {
    translate_title: "翻译助手",
    translate_subtitle: "选择您的语言，并向司机发送简单问题。",
    reset_english: "返回英语",
    translate_language_label: "乘客语言",
    translate_current_setup: "当前设置",
    translate_passenger_to_driver: "乘客 → 司机",
    translate_type_or_tap: "输入或点击一个问题。英文版本会显示给司机。",
    translate_type_in: "输入语言",
    translate_to_english: "翻译成英语",
    translate_english_result: "英文消息将显示在这里。",
    translate_quick_questions: "乘客快捷问题",
    translate_quick_questions_subtitle: "点击一项，让司机知道您需要什么。",
    translate_api_notice: "翻译 API 尚未连接。语言选择现在会同步到司机控制台。",
    translate_sync_error: "无法将语言同步到司机控制台。",
  },

  ar: {
    translate_title: "مساعد الترجمة",
    translate_subtitle: "اختر لغتك وأرسل أسئلة بسيطة إلى السائق.",
    reset_english: "العودة إلى الإنجليزية",
    translate_language_label: "لغة الراكب",
    translate_current_setup: "الإعداد الحالي",
    translate_passenger_to_driver: "الراكب → السائق",
    translate_type_or_tap: "اكتب سؤالًا أو اضغط على سؤال. ستظهر النسخة الإنجليزية للسائق.",
    translate_type_in: "اكتب باللغة",
    translate_to_english: "ترجمة إلى الإنجليزية",
    translate_english_result: "ستظهر الرسالة الإنجليزية هنا.",
    translate_quick_questions: "أسئلة سريعة للراكب",
    translate_quick_questions_subtitle: "اضغط على سؤال لإظهار ما تحتاجه للسائق.",
    translate_api_notice: "واجهة برمجة تطبيقات الترجمة غير متصلة بعد. اختيار اللغة يتزامن الآن مع لوحة السائق.",
    translate_sync_error: "تعذرت مزامنة اللغة مع لوحة السائق.",
  },

  vi: {
    translate_title: "Trợ giúp dịch thuật",
    translate_subtitle: "Chọn ngôn ngữ của bạn và gửi câu hỏi đơn giản cho tài xế.",
    reset_english: "Quay lại tiếng Anh",
    translate_language_label: "Ngôn ngữ hành khách",
    translate_current_setup: "Thiết lập hiện tại",
    translate_passenger_to_driver: "Hành khách → Tài xế",
    translate_type_or_tap: "Nhập hoặc chạm vào một câu hỏi. Bản tiếng Anh sẽ hiển thị cho tài xế.",
    translate_type_in: "Nhập bằng",
    translate_to_english: "Dịch sang tiếng Anh",
    translate_english_result: "Tin nhắn tiếng Anh sẽ xuất hiện ở đây.",
    translate_quick_questions: "Câu hỏi nhanh của hành khách",
    translate_quick_questions_subtitle: "Chạm vào một câu để cho tài xế biết bạn cần gì.",
    translate_api_notice: "API dịch thuật chưa được kết nối. Lựa chọn ngôn ngữ hiện đồng bộ với bảng điều khiển tài xế.",
    translate_sync_error: "Không thể đồng bộ ngôn ngữ với bảng điều khiển tài xế.",
  },

  ko: {
    translate_title: "번역 도우미",
    translate_subtitle: "언어를 선택하고 운전자에게 간단한 질문을 보내세요.",
    reset_english: "영어로 돌아가기",
    translate_language_label: "승객 언어",
    translate_current_setup: "현재 설정",
    translate_passenger_to_driver: "승객 → 운전자",
    translate_type_or_tap: "질문을 입력하거나 탭하세요. 영어 버전이 운전자에게 표시됩니다.",
    translate_type_in: "입력 언어",
    translate_to_english: "영어로 번역",
    translate_english_result: "영어 메시지가 여기에 표시됩니다.",
    translate_quick_questions: "승객 빠른 질문",
    translate_quick_questions_subtitle: "필요한 내용을 운전자에게 보여주려면 하나를 탭하세요.",
    translate_api_notice: "번역 API는 아직 연결되지 않았습니다. 언어 선택은 이제 운전자 콘솔과 동기화됩니다.",
    translate_sync_error: "언어를 운전자 콘솔과 동기화할 수 없습니다.",
  },

  ja: {
    translate_title: "翻訳ヘルパー",
    translate_subtitle: "言語を選び、ドライバーに簡単な質問を送信します。",
    reset_english: "英語に戻す",
    translate_language_label: "乗客の言語",
    translate_current_setup: "現在の設定",
    translate_passenger_to_driver: "乗客 → ドライバー",
    translate_type_or_tap: "質問を入力するかタップしてください。英語版がドライバーに表示されます。",
    translate_type_in: "入力言語",
    translate_to_english: "英語に翻訳",
    translate_english_result: "英語のメッセージがここに表示されます。",
    translate_quick_questions: "乗客のクイック質問",
    translate_quick_questions_subtitle: "必要なことをドライバーに示すには、いずれかをタップしてください。",
    translate_api_notice: "翻訳 API はまだ接続されていません。言語選択はドライバーコンソールに同期されます。",
    translate_sync_error: "言語をドライバーコンソールに同期できませんでした。",
  },

  hi: {
    translate_title: "अनुवाद सहायक",
    translate_subtitle: "अपनी भाषा चुनें और ड्राइवर को सरल प्रश्न भेजें।",
    reset_english: "अंग्रेज़ी पर वापस जाएँ",
    translate_language_label: "यात्री की भाषा",
    translate_current_setup: "वर्तमान सेटअप",
    translate_passenger_to_driver: "यात्री → ड्राइवर",
    translate_type_or_tap: "कोई प्रश्न लिखें या टैप करें। अंग्रेज़ी संस्करण ड्राइवर को दिखाई देगा।",
    translate_type_in: "इस भाषा में लिखें",
    translate_to_english: "अंग्रेज़ी में अनुवाद करें",
    translate_english_result: "अंग्रेज़ी संदेश यहाँ दिखाई देगा।",
    translate_quick_questions: "यात्री के त्वरित प्रश्न",
    translate_quick_questions_subtitle: "ड्राइवर को अपनी ज़रूरत दिखाने के लिए किसी एक पर टैप करें।",
    translate_api_notice: "अनुवाद API अभी कनेक्ट नहीं है। भाषा चयन अब ड्राइवर कंसोल से सिंक होता है।",
    translate_sync_error: "भाषा को ड्राइवर कंसोल से सिंक नहीं किया जा सका।",
  },

};

export default translate;