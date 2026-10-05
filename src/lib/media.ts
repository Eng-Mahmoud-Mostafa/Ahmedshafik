"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * `useSyncExternalStore` keeps this hydration-safe: the server snapshot is
 * always `false`, and the client snapshot takes over on mount without an
 * effect-driven state update.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/** Honours the visitor's reduced-motion preference. */
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/** Narrow viewport / coarse pointer — used to lower scene complexity. */
export const useIsMobileViewport = (): boolean =>
  useMediaQuery("(max-width: 768px)");

const probeWebGL = (): boolean | null => {
  if (typeof document === "undefined") return null;

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl") ?? null;

    if (!context) return false;

    // Release the probe context so it does not count against browser limits.
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
};

/**
 * WebGL capability: `null` on the server, a boolean in the browser.
 *
 * Only used by the scene stage, which is client-only, so probing lazily during
 * the first client render is safe and avoids an effect-driven state update.
 */
export const useWebGLSupport = (): boolean | null => {
  const [supported] = useState<boolean | null>(probeWebGL);
  return supported;
};

/** Convenience hook bundling the two scene performance switches. */
export const useScenePerformance = () => {
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsMobileViewport();
  return useMemo(() => ({ reducedMotion, lowPower }), [reducedMotion, lowPower]);
};