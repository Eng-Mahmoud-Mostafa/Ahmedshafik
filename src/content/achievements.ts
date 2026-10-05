import type {
  AchievementRecordType,
  LocalizedText,
  SourceRef,
  VerificationStatus,
} from "./types.ts";
import { VOLLEYBALL_WORLD_PLAYER_SOURCE } from "./profile.ts";

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
  /**
   * Whether this is a tournament appearance or an actual honour.
   *
   * Required rather than optional: a record that does not state which it is must
   * not be rendered, because the alternative is a selection being read as a win.
   */
  recordType: AchievementRecordType;
  verification: VerificationStatus;
  sources: SourceRef[];
}

/**
 * Stage two still publishes squad-selection records only.
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
    recordType: "appearance",
    verification: "verified",
    sources: [VOLLEYBALL_WORLD_PLAYER_SOURCE],
  },
];

/** Record types grouped for the scene panels, which must not blur them together. */
export interface AchievementGroups {
  appearances: AchievementEntry[];
  titles: AchievementEntry[];
  medals: AchievementEntry[];
  awards: AchievementEntry[];
}

/**
 * Splits published records by what they actually are.
 *
 * A group being empty is a fact the UI states plainly rather than papering over,
 * so no panel can imply a title or a medal that does not exist.
 */
export const groupAchievements = (entries: AchievementEntry[]): AchievementGroups => {
  const byType = (type: AchievementRecordType): AchievementEntry[] =>
    entries.filter((entry) => entry.recordType === type);

  return {
    appearances: byType("appearance"),
    titles: byType("title"),
    medals: byType("medal"),
    awards: byType("award"),
  };
};