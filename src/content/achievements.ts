import type { LocalizedText, SourceRef, VerificationStatus } from "./types.ts";

export type AchievementCategory = "club" | "international" | "individual";

export const achievementCategories: AchievementCategory[] = [
  "international",
  "club",
  "individual",
];

export interface AchievementEntry {
  id: string;
  /** Competition or event title, scoped so it reads unambiguously. */
  title: LocalizedText;
  /** Short qualifier, e.g. "Listed in the tournament squad". */
  context: LocalizedText;
  year: number;
  category: AchievementCategory;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * Stage one publishes squad-selection records only.
 *
 * These are the confirmed public facts. No titles, medals, club honours or
 * individual awards are listed, because none have been verified yet, and the
 * decorative 3D trophy and medal are explicitly not tied to these entries.
 */
export const achievements: AchievementEntry[] = [
  {
    id: "mwc-2025-squad",
    title: {
      en: "Egypt — 2025 FIVB Men's World Championship squad",
      ar: "قائمة منتخب مصر لبطولة العالم ٢٠٢٥",
    },
    context: {
      en: "Confirmed squad selection, listed with jersey number 18 for that competition.",
      ar: "اختيار قائمة مؤكد، مسجل بالرقم ١٨ في تلك البطولة.",
    },
    year: 2025,
    category: "international",
    verification: "verified",
    sources: [
      {
        label: "Volleyball World — Men's World Championship player profile",
        url: "https://en.volleyballworld.com/volleyball/competitions/men-world-championship/players/143887",
      },
    ],
  },
];