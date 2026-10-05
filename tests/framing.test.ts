import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CAMERA_FOV,
  FRAME_CENTRE,
  FRAME_PADDING,
  SCENE_CONTENT_BOUNDS,
  computeFrame,
} from "../src/components/scene/framing.ts";

/**
 * Minimal perspective projection matching three.js, so the assertions test the
 * framing maths without pulling three.js into the Node test run.
 */
function project(
  position: readonly [number, number, number],
  aspect: number,
  world: readonly [number, number, number],
) {
  const [cx, cy, cz] = position;
  const [tx, ty, tz] = world;

  // Build a look-at basis.
  let fx = tx - cx;
  let fy = ty - cy;
  let fz = tz - cz;
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl;
  fy /= fl;
  fz /= fl;

  // right = normalize(cross(forward, worldUp)) with worldUp = (0, 1, 0)
  let rx = -fz;
  let rz = fx;
  const rl = Math.hypot(rx, rz) || 1;
  rx /= rl;
  rz /= rl;
  const ry = 0;

  // up = cross(right, forward)
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;

  const dx = world[0] - cx;
  const dy = world[1] - cy;
  const dz = world[2] - cz;

  const viewZ = -(dx * fx + dy * fy + dz * fz);
  const viewX = dx * rx + dy * ry + dz * rz;
  const viewY = dx * ux + dy * uy + dz * uz;

  const halfFov = (CAMERA_FOV * Math.PI) / 180 / 2;
  const tan = Math.tan(halfFov);
  const ndcX = viewX / (viewZ * tan * aspect);
  const ndcY = viewY / (viewZ * tan);

  return { xPct: ((ndcX + 1) / 2) * 100, yPct: ((1 - ndcY) / 2) * 100, viewZ };
}

/** Every corner of the content box, so clipping on any axis is caught. */
const CORNERS: Array<[number, number, number]> = [
  [SCENE_CONTENT_BOUNDS.minX, SCENE_CONTENT_BOUNDS.minY, 0],
  [SCENE_CONTENT_BOUNDS.maxX, SCENE_CONTENT_BOUNDS.minY, 0],
  [SCENE_CONTENT_BOUNDS.minX, SCENE_CONTENT_BOUNDS.maxY, 0],
  [SCENE_CONTENT_BOUNDS.maxX, SCENE_CONTENT_BOUNDS.maxY, 0],
  [FRAME_CENTRE.x, SCENE_CONTENT_BOUNDS.minY, 0.2],
  [FRAME_CENTRE.x, SCENE_CONTENT_BOUNDS.maxY, -0.2],
];

/** The stage aspects declared in `SceneStage.tsx`. */
const ASPECTS = [
  { name: "aspect-4/5", value: 4 / 5 },
  { name: "aspect-3/4", value: 3 / 4 },
  { name: "aspect-1/1", value: 1 },
  { name: "wide desktop", value: 16 / 9 },
];

test("all scene content stays inside the frame at every stage aspect", () => {
  for (const { name, value } of ASPECTS) {
    const frame = computeFrame(value);
    for (const corner of CORNERS) {
      const p = project(frame.position, value, corner);
      assert.ok(
        p.xPct >= -0.5 && p.xPct <= 100.5,
        `${name}: corner ${corner.join(",")} x=${p.xPct.toFixed(1)}% outside frame`,
      );
      assert.ok(
        p.yPct >= -0.5 && p.yPct <= 100.5,
        `${name}: corner ${corner.join(",")} y=${p.yPct.toFixed(1)}% outside frame`,
      );
    }
  }
});

test("the content box is centred in the frame", () => {
  for (const { name, value } of ASPECTS) {
    const frame = computeFrame(value);
    const xs: number[] = [];
    const ys: number[] = [];
    for (const corner of CORNERS) {
      const p = project(frame.position, value, corner);
      xs.push(p.xPct);
      ys.push(p.yPct);
    }
    const xCentre = (Math.min(...xs) + Math.max(...xs)) / 2;
    const yCentre = (Math.min(...ys) + Math.max(...ys)) / 2;

    // Height is the limiting axis on the portrait stages, so the fit is exact
    // there and only loosens on wide viewports.
    const tolerance = frame.widthLimited ? 2 : 0.5;
    assert.ok(
      Math.abs(xCentre - 50) <= tolerance,
      `${name}: content x centre ${xCentre.toFixed(1)}%`,
    );
    assert.ok(
      Math.abs(yCentre - 50) <= tolerance,
      `${name}: content y centre ${yCentre.toFixed(1)}%`,
    );
  }
});

test("framing leaves breathing room rather than cropping to the edge", () => {
  for (const { name, value } of ASPECTS) {
    const frame = computeFrame(value);
    const ys: number[] = [];
    for (const corner of CORNERS) ys.push(project(frame.position, value, corner).yPct);

    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const span = bottom - top;

    assert.ok(span < 100, `${name}: content spans ${span.toFixed(1)}% of the height`);
    const margin = (100 - span) / 2;
    assert.ok(
      margin >= 3,
      `${name}: only ${margin.toFixed(1)}% margin top and bottom`,
    );
  }
});

test("height governs the fit across the stage aspects, so the framing is stable", () => {
  // The content box is taller than it is wide, so on the portrait stages the
  // vertical fit is always the tighter constraint. That is the desired
  // behaviour: the figure must never be cropped to chase a wider viewport.
  const distances = ASPECTS.map(({ value }) => {
    const frame = computeFrame(value);
    return Math.hypot(
      frame.position[0] - FRAME_CENTRE.x,
      frame.position[1] - FRAME_CENTRE.y,
      frame.position[2] - FRAME_CENTRE.z,
    );
  });

  for (const { name } of ASPECTS) {
    assert.equal(computeFrame(ASPECTS.find((a) => a.name === name)!.value).widthLimited, false);
  }

  const spread = Math.max(...distances) - Math.min(...distances);
  assert.ok(spread < 1e-9, `distance should not drift between aspects (spread ${spread})`);
});

test("an extremely narrow viewport is limited by width and backs off further", () => {
  const tall = computeFrame(0.4);
  const standard = computeFrame(4 / 5);

  assert.equal(tall.widthLimited, true);
  const distance = (p: readonly [number, number, number]) =>
    Math.hypot(p[0] - FRAME_CENTRE.x, p[1] - FRAME_CENTRE.y, p[2] - FRAME_CENTRE.z);

  assert.ok(distance(tall.position) > distance(standard.position));
});

test("padding is applied and the camera never sits inside the subject", () => {
  const frame = computeFrame(4 / 5);

  assert.ok(FRAME_PADDING > 1, "padding must leave room around the content");

  const distance = Math.hypot(
    frame.position[0] - FRAME_CENTRE.x,
    frame.position[1] - FRAME_CENTRE.y,
    frame.position[2] - FRAME_CENTRE.z,
  );
  assert.ok(distance > 2.5, `camera too close: ${distance.toFixed(2)}m`);
});

test("a degenerate aspect falls back instead of producing NaN", () => {
  for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const frame = computeFrame(bad);
    assert.ok(
      frame.position.every((n) => Number.isFinite(n)),
      `position should stay finite for aspect ${bad}`,
    );
  }
});