/**
 * Scene configuration.
 *
 * `NEXT_PUBLIC_ATHLETE_MODEL_URL` is optional. When it is empty the scene
 * renders the built-in stylised athlete and **no network request for a model
 * file is made at all**, so a missing asset can never produce a 404.
 */
export const ATHLETE_MODEL_URL = (
  process.env.NEXT_PUBLIC_ATHLETE_MODEL_URL ?? ""
).trim();

export const hasAthleteModel = ATHLETE_MODEL_URL.length > 0;

/** Palette shared by the scene so lighting and materials stay coherent. */
export const SCENE_COLORS = {
  skin: "#b3815f",
  skinShadow: "#8f6247",
  kit: "#ce1126",
  kitDark: "#7d0c18",
  kitTrim: "#f6f2ea",
  shorts: "#141821",
  shoe: "#efe9df",
  hair: "#1b1512",
  gold: "#c9a44d",
  goldDark: "#8c6f2b",
  bone: "#f6f2ea",
  cloud: "#cfd6e2",
  court: "#0b0d12",
  courtLine: "#f6f2ea",
  charcoalLine: "#262b36",
  floodlight: "#fff6e6",
  rim: "#ce1126",
} as const;

/**
 * Where the scene's set pieces sit, in metres inside the world group.
 *
 * Declared here rather than inline in the components so the light trails, the
 * entrance animation and the framing bounds all reference the same positions and
 * cannot drift apart.
 */
export const SCENE_ANCHORS = {
  athlete: { x: 0, y: 0, z: 0 },
  /** Hand positions, used to anchor the achievement light trails. */
  leftHand: { x: -0.62, y: 0.98, z: 0.16 },
  rightHand: { x: 0.62, y: 0.98, z: 0.16 },
  trophy: { x: -0.63, y: 1.44, z: 0.05 },
  medal: { x: 0.64, y: 1.36, z: 0.06 },
  ball: { x: 0.44, y: 0.108, z: 0.26 },
} as const;

/**
 * The three thought clouds, in the same coordinates.
 *
 * Declared alongside `SCENE_ANCHORS` for the same reason: the camera framing
 * bounds are computed from these positions, so they have to be readable from one
 * place rather than only inside the component that draws them.
 */
export const CLOUD_ANCHORS = {
  journey: { x: -0.52, y: 2.19, z: 0.06 },
  profile: { x: 0, y: 2.42, z: -0.02 },
  beyond: { x: 0.54, y: 2.22, z: 0.04 },
} as const;

/** Top of the athlete's head, and the ball on the floor — the other two extremes. */
export const FIGURE_BOUNDS = { crownY: 1.83, soleY: 0 } as const;

/** The world group's vertical offset, applied to everything inside the scene. */
export const SCENE_WORLD_OFFSET_Y = -1.25;