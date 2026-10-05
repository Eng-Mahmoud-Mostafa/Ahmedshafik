import {
  achievements,
  groupAchievements,
  type AchievementEntry,
} from "./achievements.ts";
import { beyondEntries } from "./beyond.ts";
import { career, type CareerEntry } from "./career.ts";
import { heroFacts, profile, profileFacts } from "./profile.ts";
import { isPubliclyRenderable, type VerifiedRecord } from "./types.ts";

/** Re-exported so panel components can type their entries without a deep import. */
export type { AchievementEntry, CareerEntry };

/**
 * Read-only projections the 3D scene panels render.
 *
 * The panels pop open over the hero, so they cannot reuse the page sections
 * without duplicating their markup. These selectors keep the filtering rules in
 * one place: every panel reads the same published records the full sections do,
 * so a panel can never show something the page would hide.
 */

const published = <T extends VerifiedRecord>(entries: T[]): T[] =>
  entries.filter(isPubliclyRenderable);

/** "My Journey" — the verified career timeline. */
export const journeyPanel = (): { entries: CareerEntry[] } => ({
  entries: published(career),
});

/** "Player Profile" — confirmed player information only. */
export const playerProfilePanel = () => ({
  facts: profileFacts,
  headlineFacts: heroFacts,
  biography: profile.biography,
  competitions: profile.competitionEntries,
  sources: profile.sources,
});

/** "Beyond the Court" — approved personal content, empty until supplied. */
export const beyondPanel = () => ({
  entries: published(beyondEntries),
});

/**
 * "Club Achievements" — opened by the trophy.
 *
 * Club records are kept apart from tournament appearances so an appearance can
 * never be counted as a club honour. The trophy is decorative set dressing, so
 * an empty result is stated outright rather than implied.
 */
export const clubAchievementsPanel = () => {
  const groups = groupAchievements(
    published(achievements).filter((entry) => entry.category === "club"),
  );

  return {
    ...groups,
    clubRecords: groups.appearances.filter((entry) => entry.category === "club"),
    /** Nothing verified as a club title or medal yet. */
    honoursUnverified: groups.titles.length === 0 && groups.medals.length === 0,
  };
};

/** "International Career" — opened by the medal. */
export const internationalCareerPanel = () => {
  const groups = groupAchievements(
    published(achievements).filter((entry) => entry.category === "international"),
  );

  return {
    ...groups,
    nationalEntries: published(career).filter((entry) => entry.category === "national"),
    /** True while nothing that is actually a title or medal is verified. */
    honoursUnverified: groups.titles.length === 0 && groups.medals.length === 0,
  };
};

