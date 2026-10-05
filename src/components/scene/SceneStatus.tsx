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
      {/*
        A simplified silhouette of the scene: the figure, its court line and the
        two light pools. Static, so it costs nothing and still communicates what
        is about to appear.
      */}
      <div className="relative h-32 w-24" aria-hidden="true">
        <div className="absolute inset-x-[-2.5rem] top-0 h-16 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,246,230,0.10),transparent_60%),radial-gradient(ellipse_at_75%_0%,rgba(255,246,230,0.08),transparent_60%)]" />
        <div className="absolute inset-x-[-3rem] bottom-3 h-px bg-charcoal-line" />
        <div className="absolute bottom-4 left-1/2 h-24 w-11 -translate-x-1/2 rounded-t-[2.25rem] bg-gradient-to-b from-egypt-red/45 to-transparent animate-pulse" />
        <div className="absolute bottom-4 left-1/2 h-16 w-6 -translate-x-1/2 rounded-full bg-charcoal-raised animate-pulse" />
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
 * Rendered when WebGL is unavailable or the scene failed to load.
 *
 * A designed static fallback rather than an error message: it keeps the same
 * composition language as the canvas so the hero does not collapse, and every
 * fact the scene would have communicated is available as text elsewhere on the
 * page and through the action buttons underneath.
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
        "flex h-full w-full flex-col justify-between gap-4 rounded-3xl border border-charcoal-line bg-gradient-to-b from-charcoal/20 to-charcoal/80 p-8",
        className,
      )}
    >
      {/*
        The composition, drawn in CSS: court line, light pools, a figure
        silhouette with the trophy and medal above the hands. Presentational
        only — the real information is in the copy below and the action bar.
      */}
      <div className="relative flex-1" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_28%_0%,rgba(255,246,230,0.09),transparent_58%),radial-gradient(ellipse_at_74%_0%,rgba(255,246,230,0.07),transparent_58%)]" />

        <div className="absolute inset-x-0 bottom-[38%] h-px bg-charcoal-line/70" />

        {/* figure */}
        <div className="absolute bottom-[38%] left-1/2 h-[52%] w-[7.5rem] -translate-x-1/2">
          <div className="absolute inset-x-2 top-0 h-16 rounded-t-[2.5rem] bg-egypt-red/35" />
          <div className="absolute inset-x-4 top-14 h-16 rounded-full bg-charcoal-raised/80" />
          <div className="absolute inset-x-3 top-24 h-16 rounded-full bg-egypt-red/25" />
        </div>

        {/* thought clouds */}
        <div className="absolute left-1/2 top-[6%] flex -translate-x-1/2 gap-3">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="block size-4 rounded-full bg-bone/20"
              style={{ marginTop: index === 1 ? "-0.4rem" : 0 }}
            />
          ))}
        </div>

        {/* trophy and medal above the hands */}
        <div className="absolute inset-x-[22%] top-[36%] flex justify-between">
          <span className="block size-3 rounded-t-full bg-gold/70" />
          <span className="block size-3 rounded-full bg-gold/70" />
        </div>

        {/* ball at the feet */}
        <span className="absolute bottom-[33%] left-[62%] block size-3 rounded-full bg-bone/35" />
      </div>

      <div className="space-y-2">
        <div
          aria-hidden="true"
          className="h-px w-16 bg-gradient-to-r from-egypt-red to-transparent rtl:bg-gradient-to-l"
        />
        <h3 className="font-display text-lg font-semibold text-bone">{title}</h3>
        <p className="max-w-sm text-sm leading-relaxed text-bone-muted">{body}</p>
      </div>
    </div>
  );
}