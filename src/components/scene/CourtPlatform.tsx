"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SCENE_COLORS } from "./config";
import { createCourtTexture, createGroundShadowTexture, createNetTexture } from "./textures";

/**
 * Dark court platform with real volleyball markings, plus a soft baked contact
 * shadow so the figure stays grounded on devices where real-time shadows are
 * switched off.
 *
 * The marking geometry is baked into one canvas texture rather than drawn as
 * geometry: a full court drawn in lines costs two triangles instead of dozens,
 * which is what keeps this affordable on mobile.
 */
export function CourtPlatform({
  netVisible = true,
  quality = 8,
}: {
  netVisible?: boolean;
  /** Anisotropy / mip bias budget; lowered on mobile. */
  quality?: number;
}) {
  const { texture } = useMemo(() => createCourtTexture(quality), [quality]);
  const groundShadow = useMemo(() => createGroundShadowTexture(), []);
  const net = useMemo(() => createNetTexture(), []);

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

      {netVisible ? <BackgroundNet map={net} /> : null}
    </group>
  );
}

/**
 * A subdued net far behind the athlete.
 *
 * Set dressing only: it gives the court depth and reads as a stadium without
 * competing with the figure. One alpha-mapped plane, so it costs a single draw
 * call and never needs real-time transparency sorting.
 */
function BackgroundNet({ map }: { map: THREE.Texture }) {
  const posts = useMemo(() => [-2.35, 2.35] as const, []);

  return (
    <group position={[0, 0, -1.55]}>
      <mesh position={[0, 0.86, 0]}>
        <planeGeometry args={[5, 1.72]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={0.32}
          depthWrite={false}
          color="#9aa6bb"
        />
      </mesh>

      {/* top tape and posts */}
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[5, 0.05, 0.05]} />
        <meshStandardMaterial color="#2c3340" roughness={0.8} />
      </mesh>

      {posts.map((x) => (
        <mesh key={x} position={[x, 0.86, 0]} castShadow={false}>
          <cylinderGeometry args={[0.035, 0.045, 1.78, 8]} />
          <meshStandardMaterial color={SCENE_COLORS.charcoalLine} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}