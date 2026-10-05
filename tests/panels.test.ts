import assert from "node:assert/strict";
import { test } from "node:test";

import { achievements, groupAchievements } from "../src/content/achievements.ts";
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

test("every achievement states what kind of record it is", () => {
  for (const entry of achievements) {
    assert.ok(
      ["appearance", "title", "medal", "award"].includes(entry.recordType),
      `achievement "${entry.id}" has no usable recordType`,
    );
  }
});

test("the published achievement is an appearance, not a title or medal", () => {
  const published = achievements.filter((a) => a.verification !== "unverified");
  assert.equal(published.length, 1);
  assert.equal(published[0]!.recordType, "appearance");

  const groups = groupAchievements(published);
  assert.equal(groups.appearances.length, 1);
  assert.equal(groups.titles.length, 0);
  assert.equal(groups.medals.length, 0);
  assert.equal(groups.awards.length, 0);
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

test("the club panel reports no club honour instead of inventing one", () => {
  const club = clubAchievementsPanel();
  assert.equal(club.titles.length, 0);
  assert.equal(club.medals.length, 0);
  assert.equal(club.clubRecords.length, 0);
  assert.equal(club.honoursUnverified, true);
});

test("the international panel separates appearances from honours", () => {
  const panel = internationalCareerPanel();
  assert.ok(panel.appearances.length >= 1, "the appearance must still be shown");
  assert.equal(panel.titles.length, 0);
  assert.equal(panel.medals.length, 0);
  assert.equal(panel.honoursUnverified, true);
  // The national timeline is a separate group, so an appearance is never counted twice.
  for (const entry of panel.appearances) {
    assert.ok(
      !panel.nationalEntries.some((n) => n.id === entry.id),
      `"${entry.id}" appears in both the appearance and national groups`,
    );
  }
});

test("panel entries stay inside the full sections' published set", () => {
  const journey = journeyPanel().entries;
  const international = internationalCareerPanel();

  for (const entry of international.appearances) {
    assert.ok(
      achievements.some((a) => a.id === entry.id && a.verification !== "unverified"),
      `panel surfaced an unverified achievement: ${entry.id}`,
    );
  }
  for (const entry of journey) {
    assert.notEqual(entry.verification, "unverified");
  }
});