"use client";

import { cn } from "@/lib/cn";

/**
 * Static placeholder shown while the WebGL bundle loads.
 *
 * Purely presentational — it intentionally contains no animation beyond a slow
 * CSS pulse, which reduced-motion preferences disable globally.
 */
export function SceneLoading({
  title,
  hint,
  className,
}: {
  title: string;
  hint: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-5 rounded-3xl border border-charcoal-line bg-charcoal/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative h-28 w-20" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-[50%] bg-egypt-red/15 blur-md animate-pulse" />
        <div className="absolute left-1/2 top-0 h-24 w-10 -translate-x-1/2 rounded-full bg-gradient-to-b from-charcoal-raised to-transparent animate-pulse" />
        <div className="absolute left-1/2 top-24 h-px w-32 -translate-x-1/2 bg-charcoal-line" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold tracking-[0.24em] text-bone uppercase rtl:tracking-normal">
          {title}
        </p>
        <p className="text-xs text-bone-faint">{hint}</p>
      </div>
    </div>
  );
}

/**
 * Rendered when WebGL is unavailable. Everything the scene communicates is
 * available as text elsewhere on the page, so this stays informative.
 */
export function SceneFallback({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex h-full w-full flex-col justify-end gap-4 rounded-3xl border border-charcoal-line bg-gradient-to-b from-charcoal/20 to-charcoal/80 p-8",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="h-px w-16 bg-gradient-to-r from-egypt-red to-transparent rtl:bg-gradient-to-l"
      />
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-bone">{title}</h3>
        <p className="max-w-sm text-sm leading-relaxed text-bone-muted">{body}</p>
      </div>
    </div>
  );
}