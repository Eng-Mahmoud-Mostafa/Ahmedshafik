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
 * name and visible caption both say so. Clicking it opens the achievements
 * section, which lists verified records only.
 */
export function Trophy({
  position,
  label,
  caption,
  onSelect,
  animated = true,
  detail = 24,
}: {
  position: [number, number, number];
  label: string;
  caption: string;
  onSelect: (target: SceneTarget) => void;
  animated?: boolean;
  detail?: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !group.current) return;
    const t = clock.getElapsedTime();
    group.current.position.y = position[1] + Math.sin(t * 1.1) * 0.018;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.28;
  });

  const gold = (
    <meshStandardMaterial
      color={SCENE_COLORS.gold}
      roughness={0.24}
      metalness={0.92}
    />
  );

  return (
    <group ref={group} position={position}>
      {/* base */}
      <mesh position={[0, -0.11, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 0.035, detail]} />
        {gold}
      </mesh>
      <mesh position={[0, -0.075, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.05, 0.04, detail]} />
        {gold}
      </mesh>
      {/* stem */}
      <mesh position={[0, -0.035, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.022, 0.05, detail]} />
        {gold}
      </mesh>
      {/* bowl */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.018, 0.09, detail, 1, true]} />
        {gold}
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.061, 0.006, 6, detail]} />
        {gold}
      </mesh>
      {/* handles */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.062, 0.015, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.036, 0.007, 6, detail]} />
          {gold}
        </mesh>
      ))}

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect({ kind: "trophy" });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.15, 12, 10]} />
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
    </group>
  );
}

/**
 * Stylised gold medal.
 *
 * Decorative set dressing only — see `Trophy`. It links to the verified 2025
 * international entry in the career timeline.
 */
export function Medal({
  position,
  label,
  caption,
  onSelect,
  animated = true,
  detail = 20,
}: {
  position: [number, number, number];
  label: string;
  caption: string;
  onSelect: (target: SceneTarget) => void;
  animated?: boolean;
  detail?: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !group.current) return;
    const t = clock.getElapsedTime() + 0.6;
    group.current.position.y = position[1] + Math.sin(t * 1.25) * 0.02;
    group.current.rotation.z = Math.sin(t * 0.7) * 0.22;
  });

  return (
    <group ref={group} position={position}>
      {/* ribbon */}
      <mesh position={[0, 0.075, -0.004]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[0.085, 0.14]} />
        <meshStandardMaterial color={SCENE_COLORS.kitDark} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>

      {/* disc */}
      <mesh position={[0, -0.01, 0.006]} rotation={[0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.052, 0.012, detail]} />
        <meshStandardMaterial
          color={SCENE_COLORS.gold}
          roughness={0.22}
          metalness={0.94}
        />
      </mesh>
      <mesh position={[0, -0.01, 0.013]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.038, 0.005, 6, detail]} />
        <meshStandardMaterial
          color={SCENE_COLORS.goldDark}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect({ kind: "medal" });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.13, 12, 10]} />
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
    </group>
  );
}