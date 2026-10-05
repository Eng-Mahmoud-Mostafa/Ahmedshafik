"use client";

import { Suspense } from "react";
import type { Locale } from "@/content/types";
import { useIsMobileViewport, usePrefersReducedMotion, useWebGLSupport } from "@/lib/media";
import type { SceneTarget } from "@/lib/sections";
import type { SceneLabels } from "./AthleteScene";
import { AthleteScene } from "./AthleteScene";
import { SceneActionBar } from "./SceneInteractions";
import { SceneFallback, SceneLoading } from "./SceneStatus";

export interface SceneStageProps {
  labels: SceneLabels;
  onSelect: (target: SceneTarget) => void;
  locale: Locale;
  loadingTitle: string;
  loadingHint: string;
  unsupportedTitle: string;
  unsupportedBody: string;
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
  className,
}: SceneStageProps) {
  const webglSupport = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsMobileViewport();

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-3xl border border-charcoal-line bg-gradient-to-b from-ink via-ink-soft to-charcoal/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(206,17,38,0.18),transparent_60%)]"
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

      <SceneActionBar labels={labels} onSelect={onSelect} locale={locale} />
    </div>
  );
}