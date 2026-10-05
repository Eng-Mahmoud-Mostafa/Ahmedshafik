import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CAMERA_FOV,
  FRAME_CENTRE,
  computeFrame,
} from "../src/components/scene/framing.ts";
import {
  CLOUD_ANCHORS,
  FIGURE_BOUNDS,
  SCENE_ANCHORS,
  SCENE_WORLD_OFFSET_Y,
} from "../src/components/scene/config.ts";

/**
 * The composition requirements, asserted numerically.
 *
 * The brief is specific: the clouds and set pieces must not collide with the
 * figure, must stay clear of the nav and headlines, and the whole thing must
 * read as one image. Those are projection statements, so they are projected here
 * against the same camera solve the canvas uses rather than eyeballed.
 *
 * The projection maths mirrors three.js, so the Node run needs no WebGL.
 */
function project(
  position: readonly [number, number, number],
  aspect: number,
  world: readonly [number, number, number],
) {
  const [cx, cy, cz] = position;
  const tx = FRAME_CENTRE.x;
  const ty = FRAME_CENTRE.y;
  const tz = FRAME_CENTRE.z;

  let fx = tx - cx;
  let fy = ty - cy;
  let fz = tz - cz;
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl;
  fy /= fl;
  fz /= fl;

  let rx = -fz;
  let rz = fx;
  const rl = Math.hypot(rx, rz) || 1;
  rx /= rl;
  rz /= rl;

  const ux = -rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy;

  const dx = world[0] - cx;
  const dy = world[1] - cy;
  const dz = world[2] - cz;

  const viewZ = -(dx * fx + dy * fy + dz * fz);
  const viewX = dx * rx + dz * rz;
  const viewY = dx * ux + dy * uy + dz * uz;

  const tan = Math.tan((CAMERA_FOV * Math.PI) / 180 / 2);
  // `viewZ` is negative in front of the camera (three.js convention), so the
  // depth used for the divide is its magnitude.
  const ndcX = viewX / (-viewZ * tan * aspect);
  const ndcY = viewY / (-viewZ * tan);

  return { xPct: ((ndcX + 1) / 2) * 100, yPct: ((1 - ndcY) / 2) * 100 };
}

/** Local scene coordinates → world coordinates, matching the canvas's world group. */
function at(x: number, y: number, z: number): [number, number, number] {
  return [x, y + SCENE_WORLD_OFFSET_Y, z];
}

const ASPECTS = [4 / 5, 3 / 4, 1, 16 / 9];

/** Everything that must be on screen, and must not be clipped. */
const FEATURE_POINTS: Record<string, [number, number, number]> = {
  "cloud: my journey": at(CLOUD_ANCHORS.journey.x, CLOUD_ANCHORS.journey.y, CLOUD_ANCHORS.journey.z),
  "cloud: player profile": at(CLOUD_ANCHORS.profile.x, CLOUD_ANCHORS.profile.y, CLOUD_ANCHORS.profile.z),
  "cloud: beyond the court": at(CLOUD_ANCHORS.beyond.x, CLOUD_ANCHORS.beyond.y, CLOUD_ANCHORS.beyond.z),
  trophy: at(SCENE_ANCHORS.trophy.x, SCENE_ANCHORS.trophy.y, SCENE_ANCHORS.trophy.z),
  medal: at(SCENE_ANCHORS.medal.x, SCENE_ANCHORS.medal.y, SCENE_ANCHORS.medal.z),
  ball: at(SCENE_ANCHORS.ball.x, SCENE_ANCHORS.ball.y, SCENE_ANCHORS.ball.z),
  crown: at(0, FIGURE_BOUNDS.crownY, 0),
  "left hand": at(SCENE_ANCHORS.leftHand.x, SCENE_ANCHORS.leftHand.y, SCENE_ANCHORS.leftHand.z),
  "right hand": at(SCENE_ANCHORS.rightHand.x, SCENE_ANCHORS.rightHand.y, SCENE_ANCHORS.rightHand.z),
};

/** How wide a given span of metres reads, as a percentage of the frame's width. */
function projectedWidthPct(
  frame: ReturnType<typeof computeFrame>,
  aspect: number,
  anchor: { x: number; y: number; z: number },
  span: number,
): number {
  const left = project(frame.position, aspect, at(anchor.x - span / 2, anchor.y, anchor.z));
  const right = project(frame.position, aspect, at(anchor.x + span / 2, anchor.y, anchor.z));
  return right.xPct - left.xPct;
}

test("every feature is inside the frame at every stage aspect", () => {
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    for (const [name, point] of Object.entries(FEATURE_POINTS)) {
      const p = project(frame.position, aspect, point);
      assert.ok(
        p.xPct > 2 && p.xPct < 98,
        `aspect ${aspect.toFixed(2)}: ${name} x=${p.xPct.toFixed(1)}% is at the frame edge`,
      );
      assert.ok(
        p.yPct > 2 && p.yPct < 98,
        `aspect ${aspect.toFixed(2)}: ${name} y=${p.yPct.toFixed(1)}% is at the frame edge`,
      );
    }
  }
});

test("the set pieces sit above the hands, not across them", () => {
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    const trophy = project(frame.position, aspect, FEATURE_POINTS.trophy!);
    const medal = project(frame.position, aspect, FEATURE_POINTS.medal!);
    const leftHand = project(frame.position, aspect, FEATURE_POINTS["left hand"]!);
    const rightHand = project(frame.position, aspect, FEATURE_POINTS["right hand"]!);

    // "Above" means higher on screen, which is a smaller y percentage.
    assert.ok(
      trophy.yPct < leftHand.yPct - 5,
      `aspect ${aspect.toFixed(2)}: the trophy overlaps the left hand`,
    );
    assert.ok(
      medal.yPct < rightHand.yPct - 5,
      `aspect ${aspect.toFixed(2)}: the medal overlaps the right hand`,
    );
  }
});

test("the clouds clear the head", () => {
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    const crown = project(frame.position, aspect, FEATURE_POINTS.crown!);

    for (const key of ["cloud: my journey", "cloud: player profile", "cloud: beyond the court"]) {
      const cloud = project(frame.position, aspect, FEATURE_POINTS[key]!);
      assert.ok(
        cloud.yPct < crown.yPct - 6,
        `aspect ${aspect.toFixed(2)}: ${key} sits on the head (${cloud.yPct.toFixed(1)}% vs ${crown.yPct.toFixed(1)}%)`,
      );
    }
  }
});

test("the clouds read as three, spread across the frame rather than stacked", () => {
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    const left = project(frame.position, aspect, FEATURE_POINTS["cloud: my journey"]!);
    const centre = project(frame.position, aspect, FEATURE_POINTS["cloud: player profile"]!);
    const right = project(frame.position, aspect, FEATURE_POINTS["cloud: beyond the court"]!);

    assert.ok(
      left.xPct < centre.xPct && centre.xPct < right.xPct,
      `aspect ${aspect.toFixed(2)}: clouds are not left to right`,
    );
    // The gap is measured against the clouds' own on-screen size rather than a
    // fixed percentage, because a wider viewport shows more world across the
    // same frame and would shrink the percentage without the clouds moving.
    const cloudWidthPct = projectedWidthPct(frame, aspect, CLOUD_ANCHORS.profile, 0.46);
    assert.ok(
      centre.xPct - left.xPct > cloudWidthPct,
      `aspect ${aspect.toFixed(2)}: the left and centre clouds overlap horizontally`,
    );
    assert.ok(
      right.xPct - centre.xPct > cloudWidthPct,
      `aspect ${aspect.toFixed(2)}: the centre and right clouds overlap horizontally`,
    );
    // The centre cloud is the highest of the three.
    assert.ok(centre.yPct < left.yPct, `aspect ${aspect.toFixed(2)}: centre cloud is not highest`);
    assert.ok(centre.yPct < right.yPct, `aspect ${aspect.toFixed(2)}: centre cloud is not highest`);
  }
});

test("the clouds stay clear of the top edge where the frame border sits", () => {
  // Enough headroom that no cloud is cut and none collides with the stage border.
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    const centre = project(frame.position, aspect, FEATURE_POINTS["cloud: player profile"]!);
    assert.ok(
      centre.yPct > 5,
      `aspect ${aspect.toFixed(2)}: the highest cloud is within ${centre.yPct.toFixed(1)}% of the top edge`,
    );
  }
});

test("the figure's feet and the ball stay inside the bottom of the frame", () => {
  for (const aspect of ASPECTS) {
    const frame = computeFrame(aspect);
    const ball = project(frame.position, aspect, FEATURE_POINTS.ball!);
    assert.ok(
      ball.yPct < 96,
      `aspect ${aspect.toFixed(2)}: the ball is cut off at the bottom (${ball.yPct.toFixed(1)}%)`,
    );
  }
});