export type ProgrammingLanguage = "python" | "javascript" | "java" | "c" | "cpp";

export interface ProgrammingLanguageOption {
  id: ProgrammingLanguage;
  label: string;
  nativeName?: string;
  icon?: string;
  badge: string;
  description: string;
  accentColor: string;
}

export const PROGRAMMING_LANGUAGES: ProgrammingLanguageOption[] = [
  {
    id: "python",
    label: "Python",
    badge: "v3.11",
    description: "Algorithmic & Expressive",
    accentColor: "#38bdf8",
  },
  {
    id: "javascript",
    label: "JavaScript",
    badge: "Node.js",
    description: "Modern Async & Web",
    accentColor: "#facc15",
  },
  {
    id: "cpp",
    label: "C++",
    badge: "C++20",
    description: "High-Performance & STL",
    accentColor: "#818cf8",
  },
  {
    id: "java",
    label: "Java",
    badge: "Java 21",
    description: "Typed OOP & Enterprise",
    accentColor: "#f97316",
  },
  {
    id: "c",
    label: "C",
    badge: "C17",
    description: "Low-level & Pointers",
    accentColor: "#94a3b8",
  },
];

export interface SarvamVoiceLanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  region: string;
  icon?: string;
  accentColor: string;
}

/**
 * All Sarvam AI Voice TTS supported Indic languages + Indian English
 */
export const SARVAM_INDIC_LANGUAGES: SarvamVoiceLanguageOption[] = [
  {
    code: "en-IN",
    label: "Indian English",
    nativeLabel: "English (IN)",
    region: "Pan-India / International",
    accentColor: "#38bdf8",
  },
  {
    code: "hi-IN",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    region: "Northern & Central India",
    accentColor: "#f59e0b",
  },
  {
    code: "bn-IN",
    label: "Bengali",
    nativeLabel: "বাংলা",
    region: "West Bengal & Tripura",
    accentColor: "#10b981",
  },
  {
    code: "ta-IN",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    region: "Tamil Nadu & Puducherry",
    accentColor: "#ec4899",
  },
  {
    code: "te-IN",
    label: "Telugu",
    nativeLabel: "తెలుగు",
    region: "Andhra Pradesh & Telangana",
    accentColor: "#8b5cf6",
  },
  {
    code: "kn-IN",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ",
    region: "Karnataka",
    accentColor: "#06b6d4",
  },
  {
    code: "ml-IN",
    label: "Malayalam",
    nativeLabel: "മലയാളം",
    region: "Kerala & Lakshadweep",
    accentColor: "#14b8a6",
  },
  {
    code: "mr-IN",
    label: "Marathi",
    nativeLabel: "मराठी",
    region: "Maharashtra",
    accentColor: "#f97316",
  },
  {
    code: "gu-IN",
    label: "Gujarati",
    nativeLabel: "ગુજરાતી",
    region: "Gujarat",
    accentColor: "#eab308",
  },
  {
    code: "pa-IN",
    label: "Punjabi",
    nativeLabel: "ਪੰਜਾਬੀ",
    region: "Punjab",
    accentColor: "#ef4444",
  },
  {
    code: "od-IN",
    label: "Odia",
    nativeLabel: "ଓଡ଼ିଆ",
    region: "Odisha",
    accentColor: "#a855f7",
  },
];

export function getProgrammingLanguageOption(
  id?: string
): ProgrammingLanguageOption {
  const match = PROGRAMMING_LANGUAGES.find((item) => item.id === id);
  return match ?? PROGRAMMING_LANGUAGES[0];
}

export function getSarvamLanguageOption(
  code?: string
): SarvamVoiceLanguageOption {
  const match = SARVAM_INDIC_LANGUAGES.find((item) => item.code === code);
  return match ?? SARVAM_INDIC_LANGUAGES[0];
}
