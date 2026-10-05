"use client";

import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { hasAthleteModel, ATHLETE_MODEL_URL } from "./config";
import { PlaceholderAthlete } from "./PlaceholderAthlete";

/** Loads the configured GLB and clones it so the cached scene is never mutated. */
function LoadedAthleteModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);

  return <primitive object={clone} />;
}

/**
 * Falls back to the placeholder athlete if the model fails to load, so a bad
 * URL degrades to a working scene instead of a blank canvas.
 */
class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[scene] athlete model failed to load", error.message, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The replaceable athlete slot.
 *
 * With `NEXT_PUBLIC_ATHLETE_MODEL_URL` set, the GLB is used. With it unset,
 * the stylised placeholder renders and nothing is fetched — there is no
 * attempt to load a file that does not exist.
 */
export function AthleteModel({ detailed = true }: { detailed?: boolean }) {
  const placeholder = <PlaceholderAthlete detailed={detailed} />;

  if (!hasAthleteModel) return placeholder;

  return (
    <ModelErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <LoadedAthleteModel url={ATHLETE_MODEL_URL} />
      </Suspense>
    </ModelErrorBoundary>
  );
}