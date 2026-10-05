import type { BeyondEntry } from "./types.ts";

/**
 * Personal material for the "Beyond the Court" panel.
 *
 * Empty in stage two, and that is the correct state rather than a placeholder:
 * this content may only be published once the player or his management has
 * supplied and approved it. No quotes, thoughts, ambitions or personal stories
 * are invented to fill the gap — the panel renders an intentional empty state
 * that says so.
 */
export const beyondEntries: BeyondEntry[] = [];

/** True when there is approved personal content to show. */
export const hasApprovedBeyondContent = beyondEntries.length > 0;