"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The accessible dialog every scene hotspot opens, and the panel chrome around it.
 *
 * Shared by all five panels so the behaviour and layout are identical everywhere:
 *
 * - `role="dialog"` + `aria-modal`, labelled by its own heading and described by
 *   its own scrolling body, so a screen reader announces what opened.
 * - Escape closes.
 * - Tab is trapped inside the panel while it is open, wrapping at both ends.
 * - Focus moves to the close button on open and returns to the control that
 *   opened it on close.
 * - Page scrolling is locked while open and the previous overflow value is
 *   restored exactly, so nothing behind the dialog shifts.
 * - The body scrolls inside the height-capped panel rather than the page, which
 *   keeps a long panel usable on a short mobile viewport.
 *
 * Written against the DOM rather than a component library so the markup, the
 * focus order and the RTL behaviour stay inspectable.
 */
export function SceneDialog({
  open,
  onClose,
  title,
  eyebrow,
  closeLabel,
  footer,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow: string;
  closeLabel: string;
  /** Links onward to the full section, so a panel is never a dead end. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const panelId = `${generatedId}-panel`;
  const bodyId = `${generatedId}-body`;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Focus handling lives in one place. It keys off `open` only, so re-renders
  // while the dialog is open never steal focus back to the close button.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === closeRef.current,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      // Wrap at both ends so focus can never escape to the page behind.
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Focus restoration is deliberately last, so it happens after the panel is
      // removed and the original trigger is focusable again.
      restoreRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/*
        The backdrop is a real button so it is dismissible by click and reachable
        by keyboard, but it is removed from the tab order and hidden from
        assistive technology: Escape and the visible close button are the
        announced ways to dismiss.
      */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/88 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        aria-describedby={bodyId}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-charcoal-line bg-charcoal shadow-2xl sm:max-h-[86vh] sm:rounded-2xl",
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-charcoal-line px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            {/*
              `autoFocus` is deliberately not used: focus is moved by the effect
              above, so where focus lands is one decision made in one place.
            */}
            <h2
              id={`${panelId}-title`}
              className="display-headline mt-2 text-2xl text-bone sm:text-3xl"
            >
              {title}
            </h2>
          </div>
          <SceneDialogClose
            ref={closeRef}
            onClose={onClose}
            label={closeLabel}
          />
        </header>

        <div
          id={bodyId}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8"
        >
          {children}
        </div>

        {footer ? (
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-charcoal-line px-6 py-4 sm:px-8">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The close control every panel shows.
 *
 * 44px square, so it meets the same touch-target minimum as the scene controls
 * that open it.
 */
export function SceneDialogClose({
  ref,
  onClose,
  label,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  onClose: () => void;
  label: string;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-charcoal-line text-bone-muted transition-colors hover:border-gold hover:text-gold focus-visible:border-gold focus-visible:text-gold"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ✕
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * State for a single open panel.
 *
 * Opening one panel closes any other, so two dialogs can never be stacked.
 * `toggle` is what the scene hotspots use, which also lets a second click on the
 * same hotspot dismiss the panel.
 */
export function useExclusivePanel<T extends string>(initial: T | null = null) {
  const [open, setOpen] = useState<T | null>(initial);

  const show = useCallback((next: T) => setOpen(next), []);
  const close = useCallback(() => setOpen(null), []);
  const toggle = useCallback(
    (next: T) => setOpen((current) => (current === next ? null : next)),
    [],
  );

  return { open, show, close, toggle };
}