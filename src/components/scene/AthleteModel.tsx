"use client";

import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { hasAthleteModel, ATHLETE_MODEL_URL } from "./config";
import { PlaceholderAthlete } from "./PlaceholderAthlete";

/**
 * Loads the configured GLB and normalises it for the scene.
 *
 * The clone stops the cached scene being mutated, and the normalisation pass
 * makes an externally supplied model behave like the built-in one: shadows
 * enabled, roughly 1.9 m tall and standing on y = 0. Without the height
 * normalisation a model authored at a different scale would float above or sink
 * through the court.
 */
function LoadedAthleteModel({ url, enterOffset }: { url: string; enterOffset: number }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const copy = scene.clone(true);

    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);

    // TARGET_HEIGHT matches the placeholder's ~1.83 m standing height.
    const TARGET_HEIGHT = 1.83;
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    copy.scale.setScalar(scale);
    copy.position.set(-centre.x * scale, -box.min.y * scale - enterOffset, -centre.z * scale);

    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return copy;
  }, [scene, enterOffset]);

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
 * With `NEXT_PUBLIC_ATHLETE_MODEL_URL` set, the GLB is used. With it unset, the
 * stylised placeholder renders and nothing is fetched — there is no attempt to
 * load a file that does not exist.
 *
 * **No custom model has been supplied for this project**, so the placeholder is
 * what currently ships. It is intentionally stylised and must not be presented as
 * an accurate likeness.
 */
export function AthleteModel({
  detailed = true,
  enterOffset = 0,
}: {
  detailed?: boolean;
  enterOffset?: number;
}) {
  const placeholder = <PlaceholderAthlete detailed={detailed} enterOffset={enterOffset} />;

  if (!hasAthleteModel) return placeholder;

  return (
    <ModelErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <LoadedAthleteModel url={ATHLETE_MODEL_URL} enterOffset={enterOffset} />
      </Suspense>
    </ModelErrorBoundary>
  );
}