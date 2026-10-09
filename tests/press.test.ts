import assert from "node:assert/strict";
import { test } from "node:test";

import { press, publishedPressKinds } from "../src/content/press.ts";

/**
 * The press grid derives its filter chips from the content, so these assertions
 * make sure it never advertises a category with nothing behind it.
 */

test("advertised press filters match the kinds actually present", () => {
  const advertised = publishedPressKinds(press).slice().sort();
  const present = [...new Set(press.map((entry) => entry.kind))].sort();
  assert.deepEqual(advertised, present);
});

test("an interview filter is never advertised while no interview exists", () => {
  assert.equal(
    press.some((entry) => entry.kind === "interview"),
    false,
  );
  assert.equal(publishedPressKinds(press).includes("interview"), false);
});

test("video entries link to the official highlights page", () => {
  const videos = press.filter((entry) => entry.kind === "video");
  assert.ok(videos.length >= 1, "expected at least one official highlight link");
  for (const video of videos) {
    assert.match(video.url, /volleyballworld\.com/);
  }
});
