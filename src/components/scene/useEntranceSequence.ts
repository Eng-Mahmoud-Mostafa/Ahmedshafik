"use client";

import { useEffect, useState } from "react";
import type { SceneTarget } from "@/lib/sections";
import {
  ENTRANCE_BEAT_MS,
  ENTRANCE_ORDER,
  entranceBeatOffsets,
  type EntranceStage,
} from "./entrance";

export { visibilityFor, type EntranceVisibility } from "./entrance";

/**
 * Tracks the entrance sequence for the scene.
 *
 * Timers advance one stage at a time rather than reading a frame clock, so the
 * sequence completes even when no rendering loop runs. Reduced motion resolves to
 * `"settled"` at the return rather than by resetting state, so flipping the
 * preference never causes a render loop.
 */
export function useEntranceSequence(reducedMotion: boolean): EntranceStage {
  const [stage, setStage] = useState<EntranceStage>(ENTRANCE_ORDER[0]!);

  useEffect(() => {
    if (reducedMotion) return;

    const offsets = entranceBeatOffsets();
    const timers = offsets.slice(1).map((offset, index) =>
      setTimeout(
        () => setStage(ENTRANCE_ORDER[index + 1]!),
        offset + (ENTRANCE_BEAT_MS[index] ?? 0),
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return reducedMotion ? "settled" : stage;
}

/** Maps a scene hotspot to the panel it opens. */
export const targetToPanel = (
  target: SceneTarget,
): "journey" | "profile" | "beyond" | "trophy" | "medal" => target.kind;