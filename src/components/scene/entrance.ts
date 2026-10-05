/**
 * The hero scene's entrance sequence.
 *
 * Four beats, in order: the court and its lights, the athlete, the thought
 * clouds, then the trophy and medal moving into position. Driven by wall-clock
 * timers rather than `useFrame`, because a frame loop is not guaranteed to run
 * (reduced motion uses `frameloop="demand"`, and some embedded webviews never
 * paint at all) — a timer-driven sequence still completes in every environment.
 */

export type EntranceStage = "court" | "athlete" | "clouds" | "trophies" | "settled";

/** Order the beats appear in. Exported so tests assert against one source. */
export const ENTRANCE_ORDER: readonly EntranceStage[] = [
  "court",
  "athlete",
  "clouds",
  "trophies",
  "settled",
] as const;

/** How long each beat takes before the next one starts, in ms. */
export const ENTRANCE_BEAT_MS: readonly number[] = [140, 420, 300, 320] as const;

/** When the scene is considered fully settled, in ms. */
export const ENTRANCE_TOTAL_MS = ENTRANCE_BEAT_MS.reduce((sum, ms) => sum + ms, 0);

/**
 * Which beat the scene should be showing `elapsed` ms after it started.
 *
 * Returns `"settled"` for negative input so a scene mounted late — or one that
 * starts mid-sequence because a tab was backgrounded — never renders an empty
 * stage.
 */
export function entranceStageAt(elapsed: number): EntranceStage {
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= ENTRANCE_TOTAL_MS) {
    return "settled";
  }

  let cursor = 0;
  for (let index = 0; index < ENTRANCE_BEAT_MS.length; index += 1) {
    if (elapsed < cursor + ENTRANCE_BEAT_MS[index]!) {
      return ENTRANCE_ORDER[index]!;
    }
    cursor += ENTRANCE_BEAT_MS[index]!;
  }

  return "settled";
}

/**
 * A 0..1 reveal factor for one beat, used to drive entrances and exits.
 *
 * `beat` is clamped, so a value outside 0..1 is treated as fully in or fully
 * out rather than producing a scale beyond the intended bounds.
 */
export function revealAmount(progress: number): number {
  if (!Number.isFinite(progress)) return 1;
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  // Smootherstep: gentle at both ends, so nothing snaps into place.
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

/** Milliseconds at which each beat begins, for scheduling timers. */
export function entranceBeatOffsets(): number[] {
  const offsets: number[] = [];
  let cursor = 0;
  for (const ms of ENTRANCE_BEAT_MS) {
    offsets.push(cursor);
    cursor += ms;
  }
  return offsets;
}

/** Which parts of the scene are visible at a given beat. */
export interface EntranceVisibility {
  court: boolean;
  athlete: boolean;
  clouds: boolean;
  trophies: boolean;
}

/**
 * Maps a beat to the elements visible at that moment.
 *
 * Stated once, here, so every element agrees about the order: the court is always
 * first, and each later element appears only once its own beat has been reached.
 */
export function visibilityFor(stage: EntranceStage): EntranceVisibility {
  const index = ENTRANCE_ORDER.indexOf(stage);
  const reached = (name: EntranceStage): boolean => index >= ENTRANCE_ORDER.indexOf(name);

  return {
    court: reached("court"),
    athlete: reached("athlete"),
    clouds: reached("clouds"),
    trophies: reached("trophies"),
  };
}