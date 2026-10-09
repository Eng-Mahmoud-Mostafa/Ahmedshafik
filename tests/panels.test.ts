import assert from "node:assert/strict";
import { test } from "node:test";

import {
  achievements,
  archiveGroups,
  groupAchievements,
} from "../src/content/achievements.ts";
import { beyondEntries } from "../src/content/beyond.ts";
import {
  beyondPanel,
  clubAchievementsPanel,
  internationalCareerPanel,
  journeyPanel,
  playerProfilePanel,
} from "../src/content/panels.ts";

/**
 * The scene panels are the only place a visitor is told something about a title,
 * a medal or his personal life, so these assertions guard the two ways that could
 * go wrong: an appearance being read as a win, and unapproved material leaking
 * into a panel.
 */

const isPublished = (entry: { verification: string }): boolean =>
  entry.verification !== "unverified";

test("every achievement states what kind of record it is", () => {
  for (const entry of achievements) {
    assert.ok(
      ["appearance", "title", "medal", "award"].includes(entry.recordType),
      `achievement "${entry.id}" has no usable recordType`,
    );
  }
});

test("grouping never moves a record between categories", () => {
  const groups = groupAchievements(achievements);
  const regrouped = [
    ...groups.appearances,
    ...groups.titles,
    ...groups.medals,
    ...groups.awards,
  ];
  assert.deepEqual(
    regrouped.map((e) => e.id).sort(),
    achievements.map((e) => e.id).sort(),
  );
});

test("the public archive partitions every record into exactly one group", () => {
  const published = achievements.filter(isPublished);
  const groups = archiveGroups(published);
  const regrouped = [
    ...groups.clubTitles,
    ...groups.nationalResults,
    ...groups.individualAwards,
    ...groups.internationalAppearances,
  ];
  assert.deepEqual(
    regrouped.map((e) => e.id).sort(),
    published.map((e) => e.id).sort(),
    "an archive record was dropped or counted twice",
  );
});

test("a squad selection is never grouped as a title or a medal", () => {
  const byType = groupAchievements(achievements);
  const byCategory = archiveGroups(achievements);
  const honours = [
    ...byType.titles,
    ...byType.medals,
    ...byCategory.clubTitles,
    ...byCategory.nationalResults,
  ];
  for (const entry of honours) {
    assert.notEqual(entry.recordType, "appearance", `"${entry.id}" is an appearance`);
  }
});

test("the journey panel carries the verified career timeline", () => {
  const { entries } = journeyPanel();
  assert.ok(entries.length >= 1, "the journey panel must not be empty");
  for (const entry of entries) {
    assert.notEqual(entry.verification, "unverified");
    assert.ok(entry.sources.length > 0, `journey entry "${entry.id}" cites no source`);
  }
});

test("the profile panel exposes confirmed facts only", () => {
  const panel = playerProfilePanel();
  assert.ok(panel.competitions.length >= 1);
  for (const competition of panel.competitions) {
    assert.ok(competition.sources.length > 0, `"${competition.id}" cites no source`);
  }
  // Jersey numbers are scoped to a competition and must not leak to a career-wide claim.
  assert.ok(panel.competitions.every((c) => c.year >= 2000));
  assert.ok(panel.sources.length > 0);
});

test("beyond the court publishes nothing until it is approved", () => {
  assert.deepEqual(beyondEntries, []);
  assert.equal(beyondPanel().entries.length, 0);
});

test("the club panel shows the verified club titles and stops reporting them missing", () => {
  const club = clubAchievementsPanel();
  assert.ok(club.titles.length >= 1, "a verified club title should be shown");
  assert.equal(club.honoursUnverified, false);
  for (const entry of club.titles) {
    assert.equal(entry.category, "club");
    assert.ok(entry.sources.length > 0, `club title "${entry.id}" cites no source`);
  }
});

test("the international panel separates appearances from honours and awards", () => {
  const panel = internationalCareerPanel();
  assert.ok(panel.appearances.length >= 1, "an appearance must be shown");
  assert.ok(panel.titles.length >= 1, "a national title should be shown");
  assert.ok(panel.medals.length >= 1, "a national medal should be shown");
  assert.ok(panel.awards.length >= 1, "an individual award should be shown");
  assert.equal(panel.honoursUnverified, false);

  // Every appearance really is an appearance.
  for (const entry of panel.appearances) {
    assert.equal(entry.recordType, "appearance");
  }
  // The national timeline is a separate group, so an appearance is never counted twice.
  for (const entry of panel.appearances) {
    assert.ok(
      !panel.nationalEntries.some((n) => n.id === entry.id),
      `"${entry.id}" appears in both the appearance and national groups`,
    );
  }
});

test("individual awards are never folded into a title or medal group", () => {
  const panel = internationalCareerPanel();
  for (const award of panel.awards) {
    assert.equal(award.category, "individual");
    assert.ok(!panel.titles.some((entry) => entry.id === award.id));
    assert.ok(!panel.medals.some((entry) => entry.id === award.id));
  }
});

test("panel entries stay inside the full sections' published set", () => {
  const journey = journeyPanel().entries;
  const international = internationalCareerPanel();
  const published = new Set(achievements.filter(isPublished).map((a) => a.id));

  for (const entry of [
    ...international.appearances,
    ...international.titles,
    ...international.medals,
    ...international.awards,
  ]) {
    assert.ok(published.has(entry.id), `panel surfaced an unverified achievement: ${entry.id}`);
  }
  for (const entry of journey) {
    assert.notEqual(entry.verification, "unverified");
  }
});
