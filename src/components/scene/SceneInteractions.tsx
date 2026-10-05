"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/content/types";
import { dictionaryFor } from "@/i18n/dictionary";
import type { SceneTarget } from "@/lib/sections";

/**
 * Accessible panel opened by the "Beyond the Court" cloud.
 *
 * Stage one has no approved personal content, so it renders a designed empty
 * state rather than placeholder text. Implemented as a labelled dialog with
 * Escape handling and focus restoration.
 */
export function BeyondCourtPanel({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}) {
  const t = dictionaryFor(locale);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="beyond-court-title"
        aria-describedby="beyond-court-body"
        className="relative w-full max-w-lg rounded-2xl border border-charcoal-line bg-charcoal p-7 shadow-2xl sm:p-9"
      >
        <p className="eyebrow">{t.scene.beyondTitle}</p>
        <h2
          id="beyond-court-title"
          className="display-headline mt-3 text-3xl text-bone"
        >
          {t.scene.beyondEmptyTitle}
        </h2>
        <p
          id="beyond-court-body"
          className="mt-4 text-sm leading-relaxed text-bone-muted"
        >
          {t.scene.beyondEmptyBody}
        </p>
        <div className="mt-7 flex items-center gap-4">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-charcoal-line px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:border-gold hover:text-gold"
          >
            {t.scene.beyondClose}
          </button>
          <p className="text-xs text-bone-faint">{t.scene.characterNote}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * HTML equivalents for every interactive hotspot in the 3D scene.
 *
 * These are the primary, always-available controls: they work without WebGL,
 * with a keyboard, and with a screen reader.
 */
export function SceneActionBar({
  labels,
  onSelect,
  locale,
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
  locale: Locale;
}) {
  const t = dictionaryFor(locale);

  const actions: Array<{
    key: string;
    label: string;
    note?: string;
    target: SceneTarget;
    accent: "red" | "gold" | "neutral";
  }> = [
    { key: "journey", label: labels.journey, target: { kind: "journey" }, accent: "red" },
    { key: "profile", label: labels.profile, target: { kind: "profile" }, accent: "red" },
    { key: "beyond", label: labels.beyond, target: { kind: "beyond" }, accent: "neutral" },
    {
      key: "trophy",
      label: labels.trophy,
      note: labels.trophyNote,
      target: { kind: "trophy" },
      accent: "gold",
    },
    {
      key: "medal",
      label: labels.medal,
      note: labels.medalNote,
      target: { kind: "medal" },
      accent: "gold",
    },
  ];

  return (
    <div className="w-full">
      <h3 className="eyebrow">{t.scene.actionsLabel}</h3>
      <p className="mt-1 text-xs text-bone-faint">{t.scene.actionsHelp}</p>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {actions.map((action) => (
          <li key={action.key}>
            <button
              type="button"
              onClick={() => onSelect(action.target)}
              className={
                action.accent === "gold"
                  ? "rounded-full border border-gold/35 bg-gold/5 px-4 py-2 text-start text-xs font-semibold text-gold transition-colors hover:bg-gold/12"
                  : action.accent === "red"
                    ? "rounded-full border border-egypt-red/40 bg-egypt-red/8 px-4 py-2 text-start text-xs font-semibold text-egypt-red-soft transition-colors hover:bg-egypt-red/15"
                    : "rounded-full border border-charcoal-line px-4 py-2 text-start text-xs font-semibold text-bone-muted transition-colors hover:border-bone-faint hover:text-bone"
              }
            >
              {action.label}
              {action.note ? (
                <span className="block text-[0.6rem] font-normal text-bone-faint">
                  {action.note}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}