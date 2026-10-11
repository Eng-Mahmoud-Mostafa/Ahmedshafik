"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import type { Locale } from "@/content/types";
import { useIsMobileViewport, usePrefersReducedMotion, useWebGLSupport } from "@/lib/media";
import type { SceneTarget } from "@/lib/sections";
import type { SceneLabels } from "./AthleteScene";
import { AthleteScene } from "./AthleteScene";
import { SceneActionBar } from "./SceneInteractions";
import { SceneFallback, SceneLoading } from "./SceneStatus";
import { useEntranceSequence } from "./useEntranceSequence";

export interface SceneStageProps {
  labels: SceneLabels;
  onSelect: (target: SceneTarget) => void;
  locale: Locale;
  loadingTitle: string;
  loadingHint: string;
  unsupportedTitle: string;
  unsupportedBody: string;
  /** Which hotspot the visitor is pointing at, so the canvas can echo it. */
  highlighted: SceneTarget["kind"] | null;
  /** Fires as the visitor hovers or focuses an HTML scene control. */
  onHighlight: (target: SceneTarget["kind"] | null) => void;
  /** Which hotspot's panel is open, so its control can report the state. */
  openPanel: SceneTarget["kind"] | null;
  className?: string;
}

/**
 * Gates the WebGL canvas safely.
 *
 * Order of precedence:
 * 1. capability unknown -> static loading placeholder
 * 2. WebGL unavailable  -> designed fallback (the rest of the page still
 *    carries every fact the scene communicates)
 * 3. WebGL available    -> the R3F canvas, with an inner Suspense boundary so
 *    asset loading shows the same placeholder rather than an empty frame
 *
 * Imported dynamically with `ssr: false`, so three.js never runs on the server.
 */
export function SceneStage({
  labels,
  onSelect,
  locale,
  loadingTitle,
  loadingHint,
  unsupportedTitle,
  unsupportedBody,
  highlighted,
  onHighlight,
  openPanel,
  className,
}: SceneStageProps) {
  const webglSupport = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsMobileViewport();
  const stage = useEntranceSequence(reducedMotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreen = useOffscreen(containerRef);
  const hidden = useDocumentHidden();
  const paused = offscreen || hidden;

  return (
    <div className={className} ref={containerRef}>
      <div className="relative overflow-hidden rounded-3xl border border-charcoal-line bg-gradient-to-b from-ink via-ink-soft to-charcoal/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(206,17,38,0.18),transparent_60%)]"
        />
        {/* Stadium rig hint behind the figure: two soft pools of floodlight. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_22%_0%,rgba(255,246,230,0.09),transparent_55%),radial-gradient(ellipse_at_78%_0%,rgba(255,246,230,0.07),transparent_55%)]"
        />
        <div className="relative aspect-4/5 w-full sm:aspect-3/4 lg:aspect-4/5">
          {webglSupport === null ? (
            <SceneLoading
              title={loadingTitle}
              hint={loadingHint}
              className="h-full rounded-none border-0"
            />
          ) : webglSupport ? (
            <Suspense
              fallback={
                <SceneLoading
                  title={loadingTitle}
                  hint={loadingHint}
                  className="h-full rounded-none border-0"
                />
              }
            >
              <AthleteScene
                labels={labels}
                onSelect={onSelect}
                reducedMotion={reducedMotion}
                lowPower={lowPower}
                stage={stage}
                highlighted={highlighted}
                paused={paused}
              />
            </Suspense>
          ) : (
            <SceneFallback
              title={unsupportedTitle}
              body={unsupportedBody}
              className="h-full rounded-none border-0"
            />
          )}
        </div>
      </div>

      <SceneActionBar
        labels={labels}
        onSelect={onSelect}
        onHighlight={onHighlight}
        locale={locale}
        openPanel={openPanel}
      />
    </div>
  );
}

/**
 * True while the stage is scrolled out of view.
 *
 * Passed to the canvas as `frameloop="never"`, so an off-screen hero stops
 * rendering entirely instead of burning frames nobody can see.
 *
 * Defaults to `false` (visible) and only flips after an observer has actually
 * reported, so a missing IntersectionObserver — or one whose callbacks never
 * run — leaves the scene rendering rather than blanking it.
 */
function useOffscreen(ref: RefObject<HTMLDivElement | null>): boolean {
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setOffscreen(!entry.isIntersecting);
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return offscreen;
}

/**
 * True while the browser tab is hidden.
 *
 * Combined with the off-screen check above, a backgrounded tab stops rendering
 * entirely instead of animating a scene nobody can see — which is the single
 * biggest avoidable battery and CPU cost on mobile. The listener is removed on
 * unmount, and a missing `visibilitychange` simply leaves the scene running.
 */
function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return hidden;
}