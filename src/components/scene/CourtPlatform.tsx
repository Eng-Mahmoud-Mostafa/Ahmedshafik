"use client";

import { useMemo } from "react";
import { createCourtTexture, createGroundShadowTexture } from "./textures";

/**
 * Dark court platform with restrained markings, plus a soft baked contact
 * shadow so the figure is grounded even on devices where real-time shadows are
 * switched off.
 */
export function CourtPlatform({ shadowsEnabled = true }: { shadowsEnabled?: boolean }) {
  const { texture } = useMemo(
    () => createCourtTexture(shadowsEnabled ? 8 : 2),
    [shadowsEnabled],
  );
  const groundShadow = useMemo(() => createGroundShadowTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 3.4, 1, 1]} />
        <meshStandardMaterial map={texture} roughness={0.88} metalness={0.06} />
      </mesh>

      {/* raised platform edge */}
      <mesh position={[0, -0.035, 0]} receiveShadow>
        <boxGeometry args={[5.24, 0.07, 3.44]} />
        <meshStandardMaterial color="#080a0e" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[2.2, 1.5]} />
        <meshBasicMaterial map={groundShadow} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}