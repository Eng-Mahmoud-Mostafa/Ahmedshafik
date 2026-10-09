import assert from "node:assert/strict";
import { test } from "node:test";

import { clampIndex, nextIndex, prevIndex } from "../src/lib/lightbox.ts";

/**
 * The lightbox's next/previous wrapping is the only part of the gallery with
 * real logic, and it is the part that breaks silently. These run without a DOM.
 */

test("next wraps from the last image back to the first", () => {
  assert.equal(nextIndex(0, 3), 1);
  assert.equal(nextIndex(1, 3), 2);
  assert.equal(nextIndex(2, 3), 0);
});

test("previous wraps from the first image back to the last", () => {
  assert.equal(prevIndex(0, 3), 2);
  assert.equal(prevIndex(1, 3), 0);
  assert.equal(prevIndex(2, 3), 1);
});

test("an empty gallery never produces a negative or NaN index", () => {
  assert.equal(nextIndex(0, 0), 0);
  assert.equal(prevIndex(0, 0), 0);
  assert.equal(clampIndex(5, 0), 0);
  assert.equal(clampIndex(Number.NaN, 4), 0);
});

test("indices are clamped to the list bounds", () => {
  assert.equal(clampIndex(-3, 4), 0);
  assert.equal(clampIndex(9, 4), 3);
  assert.equal(clampIndex(2, 4), 2);
});
