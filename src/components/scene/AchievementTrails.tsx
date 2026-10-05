"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_COLORS } from "./config";

/**
 * Restrained light trails that connect each set piece down to the hand it floats
 * above.
 *
 * Decorative only, and deliberately cheap: one thin tube per side with a slowly
 * scrolling additive gradient, no particles and no reflections. Opacity is kept
 * low so it reads as stadium light catching the edges rather than a laser effect.
 */
export function AchievementTrails({
  animated,
  lowPower,
  leftHand,
  rightHand,
  trophy,
  medal,
}: {
  animated: boolean;
  lowPower: boolean;
  leftHand: readonly [number, number, number];
  rightHand: readonly [number, number, number];
  trophy: readonly [number, number, number];
  medal: readonly [number, number, number];
}) {
  return (
    <group>
      <Trail
        from={trophy}
        to={leftHand}
        colour={SCENE_COLORS.gold}
        animated={animated}
        detail={lowPower ? 10 : 22}
        sway={lowPower ? 0.004 : 0.012}
      />
      <Trail
        from={medal}
        to={rightHand}
        colour={SCENE_COLORS.gold}
        animated={animated}
        detail={lowPower ? 10 : 22}
        sway={-0.01}
      />
    </group>
  );
}

/** One curved filament between two points. */
function Trail({
  from,
  to,
  colour,
  animated,
  detail,
  sway,
}: {
  from: readonly [number, number, number];
  to: readonly [number, number, number];
  colour: string;
  animated: boolean;
  detail: number;
  sway: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  // Built once: a quadratic bow so the filament hangs rather than running
  // dead straight between the two anchors.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3(
      (from[0] + to[0]) / 2 + sway,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2 + 0.03,
    ),
    new THREE.Vector3(to[0], to[1], to[2]),
  ]);

  useFrame(({ clock }) => {
    if (!animated) return;
    const t = clock.getElapsedTime();
    // A slow brightness breath, well under the threshold of distraction.
    if (material.current) {
      material.current.opacity = 0.16 + Math.sin(t * 0.8) * 0.06;
    }
  });

  return (
    <mesh ref={mesh} castShadow={false} receiveShadow={false}>
      <tubeGeometry args={[curve, detail, 0.0045, 6, false]} />
      <meshBasicMaterial
        ref={material}
        color={colour}
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}