import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculateAge,
  formatAge,
  formatHeight,
  heroFacts,
  profile,
  profileFacts,
} from "../src/content/profile.ts";
import { career, pendingCareerEntries } from "../src/content/career.ts";
import { achievements } from "../src/content/achievements.ts";
import { press } from "../src/content/press.ts";
import { media } from "../src/content/media.ts";
import { isPubliclyRenderable } from "../src/content/types.ts";

test("age is derived from the confirmed birth date", () => {
  // Local-time constructors so the assertions do not depend on the runner's timezone.
  assert.equal(calculateAge("1994-12-07", new Date(2026, 9, 5)), 31);
  // Day before the birthday in a later year.
  assert.equal(calculateAge("1994-12-07", new Date(2026, 11, 6)), 31);
  // On the birthday.
  assert.equal(calculateAge("1994-12-07", new Date(2026, 11, 7)), 32);
  assert.equal(calculateAge("1994-12-07", new Date(2024, 11, 7)), 30);
});

test("age formatting is localised", () => {
  assert.equal(formatAge(31, "en"), "31 years old");
  assert.equal(formatAge(31, "ar"), "٣١ عامًا");
});

test("profile matches the confirmed source facts", () => {
  assert.equal(profile.name, "Ahmed Said Shafik");
  assert.equal(profile.professionalName, "Ahmed Shafik");
  assert.equal(profile.nameArabic, "أحمد سعيد شفيق");
  assert.equal(profile.dateOfBirthISO, "1994-12-07");
  assert.equal(profile.heightCm, 190);
  assert.equal(profile.position.en, "Outside hitter");
  assert.equal(profile.nationality.en, "Egyptian");
});

test("jersey 18 is scoped to the 2025 World Championship", () => {
  assert.equal(profile.competitionEntries.length, 1);
  const [entry] = profile.competitionEntries;
  assert.equal(entry.jerseyNumber, 18);
  assert.equal(entry.year, 2025);
  assert.equal(entry.team.en, "Egypt");
  assert.match(entry.competition.en, /2025/);
  assert.ok(entry.sources.length > 0, "competition entry must cite a source");
});

test("every publicly rendered record is verified or owner-approved", () => {
  const publicCareer = career.filter(isPubliclyRenderable);
  assert.ok(publicCareer.length >= 1);
  for (const entry of publicCareer) {
    assert.ok(entry.sources.length > 0, `missing source for ${entry.id}`);
  }

  const publicAchievements = achievements.filter(isPubliclyRenderable);
  assert.ok(publicAchievements.length >= 1);
  for (const entry of publicAchievements) {
    assert.ok(entry.sources.length > 0, `missing source for ${entry.id}`);
  }
});

test("unverified drafts never reach the public data set", () => {
  for (const entry of pendingCareerEntries) {
    assert.equal(isPubliclyRenderable(entry), false);
  }
});

test("no media is published until real assets are supplied", () => {
  const published = media.filter(isPubliclyRenderable);
  assert.equal(published.length, 0);
});

test("every fact carries both locales, so Arabic never falls back to English", () => {
  for (const fact of [...heroFacts, ...profileFacts]) {
    for (const locale of ["en", "ar"] as const) {
      assert.ok(
        typeof fact.value[locale] === "string" && fact.value[locale].trim().length > 0,
        `fact "${fact.id}" is missing a ${locale} value`,
      );
    }
  }
});

test("Arabic fact values are not left as the English literal", () => {
  const arabicById = new Map(heroFacts.map((fact) => [fact.id, fact.value.ar]));
  assert.equal(arabicById.get("nationality"), "مصر");
  assert.equal(arabicById.get("position"), profile.position.ar);
  assert.equal(arabicById.get("height"), "١٩٠ سم");

  // Latin letters in an Arabic value mean the English string was copied through.
  const hasLatin = (value: string): boolean => /[A-Za-z]/.test(value);
  for (const fact of heroFacts) {
    assert.equal(hasLatin(fact.value.ar), false, `fact "${fact.id}" leaks English into Arabic`);
  }
});

test("height is formatted with Arabic-Indic digits for Arabic", () => {
  assert.deepEqual(formatHeight(190), { en: "190 cm", ar: "١٩٠ سم" });
  assert.deepEqual(formatHeight(198), { en: "198 cm", ar: "١٩٨ سم" });
});

test("the date-of-birth fact is localized, not pinned to the English label", () => {
  const dob = profileFacts.find((fact) => fact.id === "date-of-birth");
  assert.ok(dob);
  assert.deepEqual(dob.value, profile.dateOfBirthLabel);
  assert.equal(dob.value.ar, "٧ ديسمبر ١٩٩٤");
});

test("the archive covers every record type", () => {
  const types = new Set(achievements.map((entry) => entry.recordType));
  for (const type of ["title", "medal", "award", "appearance"] as const) {
    assert.ok(types.has(type), `no achievement of type "${type}"`);
  }
});

test("record ids are unique across the content collections", () => {
  const ids = [...career, ...achievements, ...press].map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate record id");
});

test("every published source is https and records when it was checked", () => {
  const records = [...career, ...achievements, ...press, profile];
  for (const record of records) {
    for (const source of record.sources) {
      assert.match(source.url, /^https:\/\//, `non-https source: ${source.url}`);
      assert.match(
        source.checkedISO ?? "",
        /^\d{4}-\d{2}-\d{2}$/,
        `source without a checked date: ${source.url}`,
      );
    }
  }
});

test("press entries are dated links to their original publisher", () => {
  assert.ok(press.length > 0);
  for (const entry of press) {
    assert.ok(isPubliclyRenderable(entry), `press entry not renderable: ${entry.id}`);
    assert.match(entry.url, /^https:\/\//, `press link is not https: ${entry.id}`);
    assert.match(entry.dateISO, /^\d{4}-\d{2}-\d{2}$/, `press entry has no date: ${entry.id}`);
    assert.ok(entry.outlet.trim().length > 0, `press entry has no outlet: ${entry.id}`);
    assert.ok(entry.sources.length > 0, `press entry has no source: ${entry.id}`);
  }
});

test("no localized copy leaks stray CJK characters", () => {
  // Guards the stage-three regression where "Men's World Championship" was
  // partly rendered with the Chinese word 男子.
  const CJK = /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

  const collect = (value: unknown): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(collect);
    if (value && typeof value === "object") return Object.values(value).flatMap(collect);
    return [];
  };

  const strings = collect({
    career,
    achievements,
    press,
    biography: profile.biography,
    facts: profileFacts,
  });

  for (const value of strings) {
    assert.equal(CJK.test(value), false, `CJK characters found in: ${value}`);
  }
});