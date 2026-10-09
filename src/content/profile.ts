import type { FactItem, Locale, LocalizedText, SourceRef } from "./types.ts";
import { VOLLEYBALL_WORLD_PLAYER_SOURCE } from "./sources.ts";

/** Date of birth, ISO format. Single source of truth for the age calculation. */
export const DATE_OF_BIRTH_ISO = "1994-12-07";

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
        ar: "بطولة العالم للرجال ٢٠٢٥",
      },
      year: 2025,
      team: { en: "Egypt", ar: "مصر" },
      jerseyNumber: 18,
      note: {
        en: "Played for Egypt at the 2025 FIVB Men's World Championship, where the tournament roster records him wearing jersey number 18. The number applies to that competition roster only.",
        ar: "شارك مع منتخب مصر في بطولة العالم للرجال ٢٠٢٥، حيث تسجل قائمة اللاعبين الرقم ١٨ له. ويخص هذا الرقم قائمة هذه البطولة فقط.",
      },
      sources: [VOLLEYBALL_WORLD_PLAYER_SOURCE],
    },
  ],
  biography: {
    en: "Ahmed Said Shafik (Arabic: أحمد سعيد شفيق), born 7 December 1994, is an Egyptian volleyball outside hitter listed at 190 cm. He has represented Egypt since 2015 and is also registered internationally as Ahmed Shafik. His senior club career began at Al Ahly SC in the Egyptian league in 2015, and in the 2024/25 season he played for Al Swehly (Asswehly) in Libya, where he won the Men's African Volleyball Club Championship and was named the tournament's Most Valuable Player. He joined Al-Ula in Saudi Arabia for the 2025/26 season. In September 2025 he was part of the Egypt squad at the FIVB Men's World Championship and scored 18 points in their opening 3-1 win over Iran. With Egypt he also won the 2015 and 2023 Men's African Championships and was named Best Outside Hitter in the 2023 Dream Team, alongside a silver medal at the 2017 African Championship. Every club, competition and honour on this site is recorded with a source; nothing is published without one.",
    ar: "أحمد سعيد شفيق، من مواليد ٧ ديسمبر ١٩٩٤، لاعب كرة طائرة مصري في مركز المضرب الخارجي، طوله ١٩٠ سم. يمثل منتخب مصر منذ عام ٢٠١٥، ويُسجَّل دوليًا أيضًا باسم أحمد شفيق. بدأ مسيرته مع الأندية في صفوف النادي الأهلي بالدوري المصري عام ٢٠١٥، ولعب في موسم ٢٠٢٤/٢٥ لصالح نادي السويحلي (أسويهلي) في ليبيا، حيث أحرز لقب بطولة إفريقيا للأندية للكرة الطائرة واختير أفضل لاعب في البطولة، ثم انتقل إلى نادي العُلا في السعودية لموسم ٢٠٢٥/٢٦. وفي سبتمبر ٢٠٢٥ كان ضمن قائمة منتخب مصر في بطولة العالم للرجال وسجّل ١٨ نقطة في الفوز الافتتاحي على إيران ٣-١. كما أحرز مع المنتخب لقب بطولة إفريقيا للرجال عامي ٢٠١٥ و٢٠٢٣، واختير أفضل مضرب خارجي في التشكيلة المثالية عام ٢٠٢٣، إلى جانب الميدالية الفضية في بطولة إفريقيا ٢٠١٧. وتُدرج هنا كل معلومة عن الأندية والمشاركات والألقاب مع مصدرها، ولا يُنشر أي محتوى دون مصدر.",
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
    id: "club",
    label: { en: "Current club", ar: "النادي الحالي" },
    value: {
      en: "Al-Ula, Saudi Arabia — 2025/26",
      ar: "العُلا، السعودية — ٢٠٢٥/٢٦",
    },
    tone: "gold",
  },
  {
    id: "name-ar",
    label: { en: "Name in Arabic", ar: "الاسم بالعربية" },
    value: { en: profile.nameArabic, ar: profile.nameArabic },
    tone: "neutral",
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
