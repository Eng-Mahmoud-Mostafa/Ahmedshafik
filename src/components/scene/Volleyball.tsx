"use client";

import { useEffect, useMemo } from "react";
import { createVolleyballTexture, disposeTexture } from "./textures";

/** Ball resting on the court beside the athlete's right foot. */
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
    <mesh position={position} rotation={rotation} castShadow>
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