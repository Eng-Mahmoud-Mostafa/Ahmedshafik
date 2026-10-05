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
  kit: "#ce1126",
  kitDark: "#7d0c18",
  shoe: "#efe9df",
  hair: "#1b1512",
  gold: "#c9a44d",
  goldDark: "#8c6f2b",
  bone: "#f6f2ea",
  cloud: "#cfd6e2",
} as const;