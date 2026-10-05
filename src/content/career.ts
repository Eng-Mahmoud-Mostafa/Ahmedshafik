import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";
import { VOLLEYBALL_WORLD_PLAYER_SOURCE } from "./profile.ts";

export type CareerCategory = "club" | "national" | "education";

export interface CareerEntry {
  id: string;
  /** Sort key — newest first when sorted descending by `period`. */
  period: string;
  periodLabel: LocalizedText;
  title: LocalizedText;
  organisation: LocalizedText;
  detail: LocalizedText;
  category: CareerCategory;
  /** Optional competition-scoped extra fact, e.g. a roster jersey number. */
  highlight?: LocalizedText;
  verification: VerificationStatus;
  sources: SourceRef[];
}

export const career: CareerEntry[] = [
  {
    id: "egypt-mwc-2025",
    period: "2025",
    periodLabel: { en: "2025", ar: "٢٠٢٥" },
    title: { en: "Egypt national team", ar: "منتخب مصر" },
    organisation: {
      en: "FIVB Men's World Championship",
      ar: "بطولة العالم男子",
    },
    detail: {
      en: "Listed in the Egypt squad for the 2025 FIVB Men's World Championship. The competition roster records jersey number 18, which applies to this tournament roster only.",
      ar: "مدرج ضمن قائمة منتخب مصر في بطولة العالم男子 ٢٠٢٥، حيث تسجل قائمة اللاعبين الرقم ١٨ لهذه البطولة، ويطبق هذا الرقم على قائمة هذه البطولة فقط.",
    },
    highlight: { en: "Jersey number 18", ar: "الرقم ١٨" },
    category: "national",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_PLAYER_SOURCE],
  },
];

/**
 * Rows that are intentionally not published yet.
 *
 * They exist so the shape of the timeline is obvious for whoever fills it in
 * next. `isPubliclyRenderable()` filters them out of the rendered page, so
 * nothing unverified can leak into the UI.
 */
export const pendingCareerEntries: CareerEntry[] = [
  {
    id: "club-history",
    period: "",
    periodLabel: { en: "Club career", ar: "المسيرة" },
    title: { en: "Club history", ar: "سجل الأندية" },
    organisation: { en: "To be confirmed", ar: "بانتظار التأكيد" },
    detail: {
      en: "Club history has not been supplied or verified yet.",
      ar: "لم يتم توفير أو التحقق من سجل الأندية بعد.",
    },
    category: "club",
    verification: "unverified",
    sources: [],
  },
];

export const careerCategories: CareerCategory[] = ["national", "club", "education"];