"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { SceneTarget } from "@/lib/sections";
import { SCENE_COLORS } from "./config";

/**
 * Stylised gold cup.
 *
 * Decorative set dressing only: it carries no award claim, and its accessible
 * name and visible caption both say so. Clicking it opens the Club Achievements
 * panel, which states plainly that no club title or medal is verified.
 *
 * Geometry is a lathe-style stack of cylinders and tori — a wider base, a
 * narrow stem, a flared bowl, a rim and two handles — rather than a single
 * primitive, so it reads as a cup at a glance.
 */
export function Trophy({
  position,
  label,
  caption,
  onSelect,
  animated = true,
  detail = 24,
  /** 1 = settled, 0 = still arriving from below. Drives the entrance. */
  enter = 1,
}: {
  position: readonly [number, number, number];
  label: string;
  caption: string;
  onSelect: (target: SceneTarget) => void;
  animated?: boolean;
  detail?: number;
  enter?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !group.current || !inner.current) return;
    const t = clock.getElapsedTime();
    // Bob offset only — the outer group already holds the absolute position.
    group.current.position.y = Math.sin(t * 1.1) * 0.018;
    inner.current.rotation.y = Math.sin(t * 0.5) * 0.28;
  });

  return (
    // The outer group carries the entrance lift, so the idle bob never fights it.
    <group position={[position[0], position[1] - (1 - enter) * 0.42, position[2]]}>
      <group ref={group}>
        <group ref={inner}>
          {/* weighted base, then a step, then the stem */}
          <mesh position={[0, -0.115, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.058, 0.082, 0.03, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.goldDark}
              roughness={0.34}
              metalness={0.9}
            />
          </mesh>
          <mesh position={[0, -0.082, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.052, 0.04, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.26}
              metalness={0.92}
            />
          </mesh>
          <mesh position={[0, -0.045, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.026, 0.05, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.24}
              metalness={0.92}
            />
          </mesh>

          {/* flared bowl */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.019, 0.095, detail, 1, true]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.24}
              metalness={0.92}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* inner bowl surface, so the cup is not hollow-looking from above */}
          <mesh position={[0, -0.018, 0]}>
            <cylinderGeometry args={[0.02, 0.014, 0.02, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.goldDark}
              roughness={0.42}
              metalness={0.85}
            />
          </mesh>
          {/* rim */}
          <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.067, 0.007, 8, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.22}
              metalness={0.94}
            />
          </mesh>

          {/* handles: a torus pair rotated into the vertical plane */}
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.07, 0.02, 0]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <torusGeometry args={[0.036, 0.0075, 8, Math.max(10, Math.round(detail / 2))]} />
              <meshStandardMaterial
                color={SCENE_COLORS.gold}
                roughness={0.26}
                metalness={0.92}
              />
            </mesh>
          ))}
        </group>

        <SceneHotspot label={label} caption={caption} radius={0.15} onSelect={() => onSelect({ kind: "trophy" })} />
      </group>
    </group>
  );
}

/**
 * Stylised gold medal.
 *
 * Decorative set dressing only — see `Trophy`. It opens the International Career
 * panel, where appearances are labelled as appearances and the medal's
 * non-award status is stated.
 */
export function Medal({
  position,
  label,
  caption,
  onSelect,
  animated = true,
  detail = 20,
  enter = 1,
}: {
  position: readonly [number, number, number];
  label: string;
  caption: string;
  onSelect: (target: SceneTarget) => void;
  animated?: boolean;
  detail?: number;
  enter?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !group.current || !inner.current) return;
    const t = clock.getElapsedTime() + 0.6;
    group.current.position.y = Math.sin(t * 1.25) * 0.02;
    inner.current.rotation.z = Math.sin(t * 0.7) * 0.22;
  });

  return (
    <group position={[position[0], position[1] - (1 - enter) * 0.42, position[2]]}>
      <group ref={group}>
        <group ref={inner}>
          {/* ribbon: two straps meeting at the disc */}
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.028, 0.082, -0.004]}
              rotation={[0, 0, side * 0.12]}
            >
              <planeGeometry args={[0.042, 0.15]} />
              <meshStandardMaterial
                color={SCENE_COLORS.kitDark}
                side={THREE.DoubleSide}
                roughness={0.7}
              />
            </mesh>
          ))}
          {/* ribbon bar */}
          <mesh position={[0, 0.152, -0.004]}>
            <boxGeometry args={[0.092, 0.014, 0.012]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>

          {/* disc, with a raised inner ring so it does not read as a flat coin */}
          <mesh position={[0, -0.012, 0.006]} rotation={[0.1, 0, 0]} castShadow>
            <cylinderGeometry args={[0.054, 0.054, 0.014, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.gold}
              roughness={0.22}
              metalness={0.94}
            />
          </mesh>
          <mesh position={[0, -0.012, 0.015]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.036, 0.006, 8, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.goldDark}
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>
          <mesh position={[0, -0.019, 0.008]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.004, detail]} />
            <meshStandardMaterial
              color={SCENE_COLORS.goldDark}
              roughness={0.34}
              metalness={0.88}
            />
          </mesh>
        </group>

        <SceneHotspot label={label} caption={caption} radius={0.13} onSelect={() => onSelect({ kind: "medal" })} />
      </group>
    </group>
  );
}

/**
 * The invisible pick target plus the visible caption for one set piece.
 *
 * Shared by the trophy and the medal so hover, click and the "not an award"
 * caption are defined once — the caption is what stops the geometry from
 * reading as a claim.
 */
function SceneHotspot({
  label,
  caption,
  radius,
  onSelect,
}: {
  label: string;
  caption: string;
  radius: number;
  onSelect: () => void;
}) {
  return (
    <>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[radius, 12, 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <Html center distanceFactor={4.6} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
        <span className="flex flex-col items-center gap-1">
          <span
            className="block rounded-full border border-gold/40 bg-ink/80 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.14em] whitespace-nowrap text-gold uppercase backdrop-blur-sm rtl:tracking-normal"
            title={caption}
          >
            {label}
          </span>
          <span className="block max-w-[11rem] text-center text-[0.5rem] leading-tight text-bone-faint/80">
            {caption}
          </span>
        </span>
      </Html>
    </>
  );
}