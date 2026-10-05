import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ENTRANCE_BEAT_MS,
  ENTRANCE_ORDER,
  ENTRANCE_TOTAL_MS,
  entranceBeatOffsets,
  entranceStageAt,
  revealAmount,
} from "../src/components/scene/entrance.ts";
import { visibilityFor } from "../src/components/scene/entrance.ts";

/**
 * The entrance has to be readable as a sequence from a pure function, because it
 * is driven by wall-clock timers rather than the frame loop — so these assertions
 * pin the ordering rather than any timing implementation detail.
 */

test("the entrance order is court, athlete, clouds, then the set pieces", () => {
  assert.deepEqual(ENTRANCE_ORDER, [
    "court",
    "athlete",
    "clouds",
    "trophies",
    "settled",
  ]);
});

test("each beat starts after the previous one has finished", () => {
  const offsets = entranceBeatOffsets();
  assert.equal(offsets.length, ENTRANCE_ORDER.length - 1);
  assert.equal(offsets[0], 0);
  for (let i = 1; i < offsets.length; i += 1) {
    assert.ok(offsets[i]! > offsets[i - 1]!, "beats must not share a start time");
  }
  assert.equal(offsets[offsets.length - 1]! + ENTRANCE_BEAT_MS[offsets.length - 1]!, ENTRANCE_TOTAL_MS);
});

test("the stage at a given time is the beat in progress", () => {
  assert.equal(entranceStageAt(0), "court");

  const offsets = entranceBeatOffsets();
  assert.equal(entranceStageAt(offsets[1]! - 1), "court");
  assert.equal(entranceStageAt(offsets[1]!), "athlete");
  assert.equal(entranceStageAt(offsets[2]! - 1), "athlete");
  assert.equal(entranceStageAt(offsets[2]!), "clouds");
  assert.equal(entranceStageAt(offsets[3]! - 1), "clouds");
  assert.equal(entranceStageAt(offsets[3]!), "trophies");

  assert.equal(entranceStageAt(ENTRANCE_TOTAL_MS), "settled");
  assert.equal(entranceStageAt(ENTRANCE_TOTAL_MS + 5000), "settled");
});

test("a bad time never renders an empty stage", () => {
  for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(entranceStageAt(bad), "settled");
  }
});

test("elements appear cumulatively, so nothing is shown before its beat", () => {
  assert.deepEqual(visibilityFor("court"), {
    court: true,
    athlete: false,
    clouds: false,
    trophies: false,
  });
  assert.deepEqual(visibilityFor("athlete"), {
    court: true,
    athlete: true,
    clouds: false,
    trophies: false,
  });
  assert.deepEqual(visibilityFor("clouds"), {
    court: true,
    athlete: true,
    clouds: true,
    trophies: false,
  });
  assert.deepEqual(visibilityFor("trophies"), {
    court: true,
    athlete: true,
    clouds: true,
    trophies: true,
  });
  assert.deepEqual(visibilityFor("settled"), {
    court: true,
    athlete: true,
    clouds: true,
    trophies: true,
  });
});

test("the reveal factor is bounded and eases at both ends", () => {
  assert.equal(revealAmount(0), 0);
  assert.equal(revealAmount(1), 1);
  assert.equal(revealAmount(2), 1);
  assert.equal(revealAmount(-1), 0);
  assert.equal(revealAmount(Number.NaN), 1);

  // Monotonic, and never outside 0..1.
  let previous = 0;
  for (let step = 0; step <= 20; step += 1) {
    const value = revealAmount(step / 20);
    assert.ok(value >= previous, `reveal went backwards at ${step / 20}`);
    assert.ok(value >= 0 && value <= 1, `reveal out of range: ${value}`);
    previous = value;
  }

  // Gentler than linear near the start: the first sliver should not jump.
  assert.ok(revealAmount(0.2) < 0.2, "reveal should ease in rather than start linearly");
});