import type { FactItem, Locale, LocalizedText, SourceRef } from "./types.ts";

/** Date of birth, ISO format. Single source of truth for the age calculation. */
export const DATE_OF_BIRTH_ISO = "1994-12-07";

export const VOLLEYBALL_WORLD_PLAYER_SOURCE: SourceRef = {
  label: "Volleyball World — FIVB Men's World Championship player profile",
  url: "https://en.volleyballworld.com/volleyball/competitions/men-world-championship/players/143887",
};

export interface CompetitionEntry {
  id: string;
  competition: LocalizedText;
  year: number;
  team: LocalizedText;
  jerseyNumber: number;
  note: LocalizedText;
  sources: SourceRef[];
}

export interface ProfileContent {
  name: string;
  professionalName: string;
  nameArabic: string;
  nationality: LocalizedText;
  position: LocalizedText;
  dateOfBirthISO: string;
  dateOfBirthLabel: LocalizedText;
  heightCm: number;
  /** Competition-scoped facts, kept separate from generic profile facts. */
  competitionEntries: CompetitionEntry[];
  biography: LocalizedText;
  sources: SourceRef[];
}

export const profile: ProfileContent = {
  name: "Ahmed Said Shafik",
  professionalName: "Ahmed Shafik",
  nameArabic: "أحمد سعيد شفيق",
  nationality: { en: "Egyptian", ar: "مصري" },
  position: { en: "Outside hitter", ar: "مضرب خارج" },
  dateOfBirthISO: DATE_OF_BIRTH_ISO,
  dateOfBirthLabel: { en: "7 December 1994", ar: "٧ ديسمبر ١٩٩٤" },
  heightCm: 190,
  competitionEntries: [
    {
      id: "mwc-2025-egypt",
      competition: {
        en: "FIVB Men's World Championship 2025",
        ar: "بطولة العالم男子 ٢٠٢٥",
      },
      year: 2025,
      team: { en: "Egypt", ar: "مصر" },
      jerseyNumber: 18,
      note: {
        en: "Listed in the Egypt squad for the 2025 FIVB Men's World Championship, where the tournament roster records him wearing jersey number 18. The number applies to that competition roster.",
        ar: "مدرج ضمن قائمة منتخب مصر في بطولة العالم男子 ٢٠٢٥، حيث تسجل قائمة اللاعبين الرقم ١٨ لهذه البطولة.",
      },
      sources: [VOLLEYBALL_WORLD_PLAYER_SOURCE],
    },
  ],
  biography: {
    en: "Ahmed Said Shafik, born 7 December 1994, is an Egyptian volleyball outside hitter listed at 190 cm and also listed professionally as Ahmed Shafik. Ahmed was listed for Egypt at the 2025 FIVB Men's World Championship, where that competition's roster records him wearing jersey number 18. This page is limited to confirmed public information: club history, statistics and honours are added only once they are verified.",
    ar: "أحمد سعيد شفيق، المولود في ٧ ديسمبر ١٩٩٤، لاعب كرة طائرة مصري في مركز المضرب الخارجي، طوله ١٩٠ سم، ومدرج أيضًا باسم أحمد شفيق. وقد تم إدراجه في قائمة منتخب مصر لبطولة العالم ٢٠٢٥، حيث تسجل القائمة الرقم ١٨ لهذه البطولة. تقتصر هذه الصفحة على المعلومات العامة المؤكدة، ويضاف سجل الأندية والإحصائيات والألقاب بعد التحقق منها.",
  },
  sources: [VOLLEYBALL_WORLD_PLAYER_SOURCE],
};

/** `190` -> `{ en: "190 cm", ar: "١٩٠ سم" }`. */
export const formatHeight = (heightCm: number): LocalizedText => ({
  en: `${heightCm} cm`,
  ar: `${String(heightCm).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])} سم`,
});

/** Facts rendered in the hero strip. Values are localized, not hardcoded English. */
export const heroFacts: FactItem[] = [
  {
    id: "nationality",
    label: { en: "Nationality", ar: "الجنسية" },
    value: { en: "Egypt", ar: "مصر" },
    tone: "red",
  },
  {
    id: "position",
    label: { en: "Position", ar: "المركز" },
    value: profile.position,
    tone: "neutral",
  },
  {
    id: "height",
    label: { en: "Height", ar: "الطول" },
    value: formatHeight(profile.heightCm),
    tone: "neutral",
  },
];

/** Full player facts rendered in the profile section. */
export const profileFacts: FactItem[] = [
  ...heroFacts,
  {
    id: "date-of-birth",
    label: { en: "Date of birth", ar: "تاريخ الميلاد" },
    value: profile.dateOfBirthLabel,
    tone: "neutral",
  },
  {
    id: "name-ar",
    label: { en: "Name in Arabic", ar: "الاسم بالعربية" },
    value: { en: profile.nameArabic, ar: profile.nameArabic },
    tone: "gold",
  },
  {
    id: "professional-name",
    label: { en: "Also listed as", ar: "مدرج أيضًا باسم" },
    value: { en: profile.professionalName, ar: profile.professionalName },
    tone: "neutral",
  },
];

/** `31` -> localized `"31 years old"` / `"٣١ عامًا"`. */
export const formatAge = (age: number, locale: Locale): string => {
  if (!Number.isFinite(age)) return "—";
  const western = String(age);
  const eastern = String(age).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)] ?? d);
  return locale === "ar" ? `${eastern} عامًا` : `${western} years old`;
};

/**
 * Age in whole years, calculated from the birth date.
 *
 * @param isoBirthDate ISO `YYYY-MM-DD` birth date.
 * @param reference    Optional "today" (used by tests and deterministic rendering).
 */
export const calculateAge = (isoBirthDate: string, reference: Date = new Date()): number => {
  const [year, month, day] = isoBirthDate.split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;

  let age = reference.getFullYear() - year;
  const monthNow = reference.getMonth() + 1;
  const hasHadBirthday =
    monthNow > month || (monthNow === month && reference.getDate() >= day);

  if (!hasHadBirthday) age -= 1;
  return age;
};