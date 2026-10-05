"use client";

import { useEffect, useMemo } from "react";
import { createVolleyballTexture, disposeTexture } from "./textures";

/**
 * Ball resting on the court beside the athlete's right foot.
 *
 * The classic 18-panel ball is approximated by a 12-band texture on a sphere,
 * with the seams darkened and a soft top-down gradient so it reads as a sphere
 * rather than a flat disc. Kept deliberately simple: it is small on screen, and
 * its job is to sit in the composition, not to be a render.
 */
export function Volleyball({
  position = [0.44, 0.108, 0.26] as [number, number, number],
  animated = true,
  segments = 32,
}: {
  position?: [number, number, number];
  animated?: boolean;
  segments?: number;
}) {
  // Built once on the client; this component never renders on the server.
  const texture = useMemo(() => createVolleyballTexture(), []);

  useEffect(() => () => disposeTexture(texture), [texture]);

  const rotation = useMemo(
    () => [0.2, animated ? 0 : 0.4, 0.1] as [number, number, number],
    [animated],
  );

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <sphereGeometry args={[0.105, segments, Math.round(segments / 2)]} />
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.55}
        metalness={0.04}
      />
    </mesh>
  );
}