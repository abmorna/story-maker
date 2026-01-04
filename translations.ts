
export type Language = 
  | 'en' | 'hi' | 'ur' | 'bn' | 'mr' | 'te' | 'ta' | 'gu' | 'kn' | 'pa'
  | 'es' | 'fr' | 'zh' | 'ja' | 'tr' | 'de' | 'it' | 'pt' | 'ru' | 'ar'
  | 'ko' | 'vi' | 'th' | 'id' | 'nl' | 'pl' | 'sv' | 'no' | 'da' | 'fi'
  | 'el' | 'he' | 'ro' | 'hu' | 'cs' | 'uk' | 'ms' | 'ml' | 'or' | 'as'
  | 'bh' | 'sa' | 'ne' | 'si' | 'my' | 'km' | 'lo' | 'am' | 'sw' | 'zu';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  sidebarTitle: string;
  storySubjectLabel: string;
  nextMoveLabel: string;
  placeholderInitial: string;
  placeholderContinue: string;
  btnStartStory: string;
  btnContinueStory: string;
  quickSuggestionsTitle: string;
  tipsTitle: string;
  tipsDesc: string;
  resetLabel: string;
  emptyTitle: string;
  emptyDesc: string;
  loadingText: string;
  alertReset: string;
  alertError: string;
  alertApiKey: string;
  newSaga: string;
  suggestions: string[];
}

export const languages: { code: Language; name: string }[] = [
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'pl', name: 'Polski (Polish)' },
  { code: 'sv', name: 'Svenska (Swedish)' },
  { code: 'no', name: 'Norsk (Norwegian)' },
  { code: 'da', name: 'Dansk (Danish)' },
  { code: 'fi', name: 'Suomi (Finnish)' },
  { code: 'el', name: 'Ελληνικά (Greek)' },
  { code: 'he', name: 'עברית (Hebrew)' },
  { code: 'ro', name: 'Română (Romanian)' },
  { code: 'hu', name: 'Magyar (Hungarian)' },
  { code: 'cs', name: 'Čeština (Czech)' },
  { code: 'uk', name: 'Українська (Ukrainian)' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'bh', name: 'भोजपुरी (Bhojpuri)' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'si', name: 'සිංහල (Sinhala)' },
  { code: 'my', name: 'မြန်မာ (Burmese)' },
  { code: 'km', name: 'ខ្មែរ (Khmer)' },
  { code: 'lo', name: 'ລາວ (Lao)' },
  { code: 'am', name: 'አማርኛ (Amharic)' },
  { code: 'sw', name: 'Kiswahili (Swahili)' },
  { code: 'zu', name: 'isiZulu (Zulu)' },
];

const enBase: Translations = {
  appTitle: "Katha Sagar",
  appSubtitle: "AI Audio Drama",
  sidebarTitle: "Story Controls",
  storySubjectLabel: "Write your story subject:",
  nextMoveLabel: "What's the next twist?",
  placeholderInitial: "e.g. A hidden treasure in an ancient fort...",
  placeholderContinue: "Write how the story should proceed...",
  btnStartStory: "Start Story",
  btnContinueStory: "Extend Story",
  quickSuggestionsTitle: "Quick Options",
  tipsTitle: "Tips",
  tipsDesc: "You can describe characters, locations, and emotions in detail.",
  resetLabel: "New Beginning",
  emptyTitle: "Katha Sagar: Global Stories",
  emptyDesc: "Step carefully... stories here gain your trust first, then steal your sleep.",
  loadingText: "Weaving words...",
  alertReset: "Do you really want to start a new story?",
  alertError: "Technical issue occurred.",
  alertApiKey: "API_KEY is not set in Vercel Settings.",
  newSaga: "A New Saga",
  suggestions: ["First night in a lonely mountain resort", "A new family moving into an old mansion", "A forgotten room locked for decades", "A city elevator stuck at midnight"]
};

export const allTranslations: Record<Language, Translations> = {
  en: enBase,
  hi: {
    ...enBase,
    appTitle: "कथा सागर",
    appSubtitle: "AI ऑडियो ड्रामा",
    sidebarTitle: "कहानी नियंत्रण",
    storySubjectLabel: "अपनी कहानी का विषय लिखें:",
    nextMoveLabel: "अगला मोड़ क्या होगा?",
    btnStartStory: "कहानी शुरू करें",
    btnContinueStory: "कहानी बढ़ाएं",
    loadingText: "शब्द बुने जा रहे हैं...",
    suggestions: ["पहाड़ों के एक सुनसान रिसॉर्ट की पहली रात", "पुरानी हवेली में शिफ्ट हुआ एक नया परिवार", "गाँव की वो कोठरी जहाँ 20 साल से ताला लगा है"]
  },
  ur: {
    ...enBase,
    appTitle: "کٹھا ساگر",
    appSubtitle: "AI آڈیو ڈرامہ",
    sidebarTitle: "کہانی کنٹرول",
    storySubjectLabel: "اپنی کہانی کا موضوع لکھیں:",
    nextMoveLabel: "اگلا موڑ کیا ہوگا؟",
    btnStartStory: "کہانی شروع کریں",
    btnContinueStory: "کہانی بڑھائیں",
    loadingText: "الفاظ بنے جا رہے ہیں...",
    suggestions: ["پہاڑوں کے ایک سنسان ریزورٹ کی پہلی رات", "پرانی حویلی میں منتقل ہونے والا ایک نیا خاندان"]
  },
  bn: {
    ...enBase,
    appTitle: "কথা সাগর",
    appSubtitle: "AI অডিও ড্রামা",
    sidebarTitle: "গল্প নিয়ন্ত্রণ",
    storySubjectLabel: "আপনার গল্পের বিষয় লিখুন:",
    nextMoveLabel: "পরবর্তী মোড় কি হবে?",
    btnStartStory: "গল্প শুরু করুন",
    btnContinueStory: "গল্প এগিয়ে নিন",
    loadingText: "শব্দ বোনা হচ্ছে...",
    suggestions: ["পাহাড়ের নির্জন রিসর্টে প্রথম রাত", "পুরানো প্রাসাদে আসা একটি নতুন পরিবার"]
  },
  es: {
    ...enBase,
    appTitle: "Katha Sagar",
    appSubtitle: "Drama de Audio IA",
    sidebarTitle: "Controles de Historia",
    storySubjectLabel: "Escribe el tema de tu historia:",
    nextMoveLabel: "¿Cuál es el siguiente giro?",
    btnStartStory: "Empezar Historia",
    btnContinueStory: "Extender Historia",
    loadingText: "Tejiendo palabras...",
    suggestions: ["Primera noche en un resort de montaña solitario", "Una nueva familia mudándose a una vieja mansión"]
  },
  fr: {
    ...enBase,
    appTitle: "Katha Sagar",
    appSubtitle: "Drame Audio IA",
    sidebarTitle: "Contrôles",
    storySubjectLabel: "Sujet de votre histoire :",
    nextMoveLabel: "Quel est le prochain rebondissement ?",
    btnStartStory: "Commencer l'histoire",
    btnContinueStory: "Continuer l'histoire",
    loadingText: "Tissage de mots...",
    suggestions: ["Première nuit dans un complexe de montagne", "Une famille emménage dans un vieux manoir"]
  },
  zh: {
    ...enBase,
    appTitle: "故事之海",
    appSubtitle: "AI 有声剧",
    sidebarTitle: "故事控制",
    storySubjectLabel: "输入你的故事主题：",
    nextMoveLabel: "下一个转折是什么？",
    btnStartStory: "开始故事",
    btnContinueStory: "延续故事",
    loadingText: "编织文字中...",
    suggestions: ["寂静山间度假村的第一晚", "搬进旧宅的新家庭"]
  },
  ja: {
    ...enBase,
    appTitle: "物語の海",
    appSubtitle: "AI オーディオドラマ",
    sidebarTitle: "ストーリー操作",
    storySubjectLabel: "物語のテーマを入力してください：",
    nextMoveLabel: "次の展開は？",
    btnStartStory: "物語を始める",
    btnContinueStory: "物語を続ける",
    loadingText: "言葉を紡いでいます...",
    suggestions: ["静かな山の山荘での初夜", "古い屋敷に引っ越してきた家族"]
  },
  tr: {
    ...enBase,
    appTitle: "Hikaye Denizi",
    appSubtitle: "AI Sesli Drama",
    sidebarTitle: "Hikaye Kontrolleri",
    storySubjectLabel: "Hikayenizin konusunu yazın:",
    nextMoveLabel: "Sıradaki ters köşe ne?",
    btnStartStory: "Hikayeyi Başlat",
    btnContinueStory: "Hikayeyi Uzat",
    loadingText: "Kelimeler örülüyor...",
    suggestions: ["Issız bir dağ evinde ilk gece", "Eski bir konağa taşınan yeni aile"]
  },
  // Add major regional language UI support
  mr: { ...enBase, appTitle: "कथा सागर", sidebarTitle: "कथा नियंत्रण", btnStartStory: "कथा सुरू करा" },
  te: { ...enBase, appTitle: "కథా సాగరం", sidebarTitle: "కథ నియంత్రణ", btnStartStory: "కథ ప్రారంభించండి" },
  ta: { ...enBase, appTitle: "கதா சாகரம்", sidebarTitle: "கதை கட்டுப்பாடு", btnStartStory: "கதையைத் தொடங்கு" },
  gu: { ...enBase, appTitle: "કથા સાગર", sidebarTitle: "વાર્તા નિયંત્રણ", btnStartStory: "વાર્તા શરૂ કરો" },
  kn: { ...enBase, appTitle: "ಕಥಾ ಸಾಗರ", sidebarTitle: "ಕಥೆಯ ನಿಯಂತ್ರಣ", btnStartStory: "ಕಥೆ ಪ್ರಾರಂಭಿಸಿ" },
  pa: { ...enBase, appTitle: "ਕਥਾ ਸਾਗਰ", sidebarTitle: "ਕਹਾਣੀ ਕੰਟਰੋਲ", btnStartStory: "ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੋ" },

  // Fallback for all other 35+ languages
  ...Object.fromEntries(
    ['de', 'it', 'pt', 'ru', 'ar', 'ko', 'vi', 'th', 'id', 'nl', 'pl', 'sv', 'no', 'da', 'fi', 'el', 'he', 'ro', 'hu', 'cs', 'uk', 'ms', 'ml', 'or', 'as', 'bh', 'sa', 'ne', 'si', 'my', 'km', 'lo', 'am', 'sw', 'zu'].map(code => [code, enBase])
  )
} as Record<Language, Translations>;
