"use client";

import type { Locale } from "@/content/types";
import { dictionaryFor } from "@/i18n/dictionary";
import type { SceneTarget } from "@/lib/sections";
import { cn } from "@/lib/cn";

/**
 * HTML equivalents for every interactive hotspot in the 3D scene.
 *
 * These are the primary, always-available controls: they work without WebGL,
 * with a keyboard, and with a screen reader. Each one is a real `<button>` with
 * a 44px minimum target, reports hover and focus back up so the canvas can
 * brighten the matching cloud or set piece, and marks the open panel with
 * `aria-expanded`.
 */
export function SceneActionBar({
  labels,
  onSelect,
  onHighlight,
  locale,
  openPanel,
}: {
  labels: {
    journey: string;
    profile: string;
    beyond: string;
    trophy: string;
    trophyNote: string;
    medal: string;
    medalNote: string;
  };
  onSelect: (target: SceneTarget) => void;
  onHighlight: (target: SceneTarget["kind"] | null) => void;
  locale: Locale;
  /** Which hotspot's panel is currently open, if any. */
  openPanel?: SceneTarget["kind"] | null;
}) {
  const t = dictionaryFor(locale);

  const actions: Array<{
    key: SceneTarget["kind"];
    label: string;
    note?: string;
    accent: "red" | "gold" | "neutral";
  }> = [
    { key: "journey", label: labels.journey, accent: "red" },
    { key: "profile", label: labels.profile, accent: "red" },
    { key: "beyond", label: labels.beyond, accent: "neutral" },
    {
      key: "trophy",
      label: labels.trophy,
      note: labels.trophyNote,
      accent: "gold",
    },
    {
      key: "medal",
      label: labels.medal,
      note: labels.medalNote,
      accent: "gold",
    },
  ];

  return (
    <div className="w-full">
      {/* Heading order: the hero has no other h2, so this group label is the
          page's first h2 after the h1. Using h3 here skipped a level. */}
      <h2 className="eyebrow">{t.scene.actionsLabel}</h2>
      <p className="mt-1 text-xs text-bone-faint">{t.scene.actionsHelp}</p>
      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map((action) => {
          const open = openPanel === action.key;
          return (
            <li key={action.key}>
              <button
                type="button"
                onClick={() => onSelect({ kind: action.key })}
                onPointerEnter={() => onHighlight(action.key)}
                onPointerLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(action.key)}
                onBlur={() => onHighlight(null)}
                aria-expanded={open}
                aria-haspopup="dialog"
                className={cn(
                  // min-h-11 keeps the target at 44px, as required on touch.
                  "flex min-h-11 w-full flex-col items-start justify-center gap-0.5 rounded-xl border px-4 py-2.5 text-start transition-colors",
                  open
                    ? "border-gold/60 bg-gold/10"
                    : action.accent === "gold"
                      ? "border-gold/35 bg-gold/5 hover:bg-gold/12"
                      : action.accent === "red"
                        ? "border-egypt-red/40 bg-egypt-red/8 hover:bg-egypt-red/15"
                        : "border-charcoal-line hover:border-bone-faint hover:bg-charcoal/50",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    action.accent === "gold" ? "text-gold" : action.accent === "red" ? "text-egypt-red-soft" : "text-bone-muted",
                    open && "text-gold",
                  )}
                >
                  {action.label}
                </span>
                {action.note ? (
                  <span className="text-[0.6rem] leading-snug text-bone-faint">
                    {action.note}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}