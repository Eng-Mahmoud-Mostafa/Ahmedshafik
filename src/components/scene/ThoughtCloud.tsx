"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { SceneTarget } from "@/lib/sections";
import { SCENE_COLORS } from "./config";

interface CloudProps {
  position: [number, number, number];
  label: string;
  target: SceneTarget;
  onSelect: (target: SceneTarget) => void;
  /** phase offset so the three clouds breathe out of sync */
  phase: number;
  animated: boolean;
  scale?: number;
  /** left | centre | right — drives the label side and animation direction */
  slot: "left" | "center" | "right";
}

const RADIUS = 0.105;
const SPACING = RADIUS * 0.86;

/** Sphere offsets that read as a puffy cloud once inflated. */
const PUFFS: Array<[number, number, number]> = [
  [0, 0, 0],
  [1.05, 0.08, 0],
  [-1.05, 0.06, 0],
  [0.52, 0.52, 0],
  [-0.52, 0.5, 0],
  [0.55, -0.46, 0],
  [-0.55, -0.44, 0],
  [1.35, -0.3, 0],
  [-1.35, -0.28, 0],
];

/**
 * One translucent thought cloud.
 *
 * Labelled with drei `<Html>` for a crisp, readable caption and clickable both
 * in 3D and through the equivalent HTML button rendered beside the canvas.
 */
export function ThoughtCloud({
  position,
  label,
  target,
  onSelect,
  phase,
  animated,
  scale = 1,
  slot,
}: CloudProps) {
  const group = useRef<THREE.Group>(null);
  const direction = slot === "left" ? -1 : slot === "right" ? 1 : 0;

  useFrame(({ clock }) => {
    if (!animated || !group.current) return;
    const t = clock.getElapsedTime() + phase;
    group.current.position.y = position[1] + Math.sin(t * 0.8) * 0.022;
    group.current.position.x =
      position[0] + Math.sin(t * 0.45) * 0.016 * (direction === 0 ? 1 : direction);
  });

  return (
    <group position={position} scale={scale}>
      <group ref={group}>
        {PUFFS.map(([x, y, z], index) => (
          <mesh key={index} position={[x * SPACING, y * SPACING, z * SPACING]} scale={1 + index * 0.02}>
            <sphereGeometry args={[RADIUS, 14, 12]} />
            <meshPhysicalMaterial
              color={SCENE_COLORS.cloud}
              transparent
              opacity={0.24}
              roughness={0.35}
              metalness={0}
              transmission={0}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Hit area: one invisible sphere makes the whole cloud clickable. */}
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            onSelect(target);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <sphereGeometry args={[RADIUS * 2.15, 12, 10]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Html
          center
          distanceFactor={4.2}
          zIndexRange={[12, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            className="block max-w-[9rem] rounded-full border border-charcoal-line bg-ink/80 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.14em] whitespace-nowrap text-bone uppercase backdrop-blur-sm rtl:tracking-normal"
          >
            {label}
          </span>
        </Html>
      </group>
    </group>
  );
}

/** All three clouds, positioned above the athlete's head. */
export function ThoughtClouds({
  labels,
  onSelect,
  animated,
  lowPower,
}: {
  labels: { journey: string; profile: string; beyond: string };
  onSelect: (target: SceneTarget) => void;
  animated: boolean;
  lowPower: boolean;
}) {
  return (
    <group>
      <ThoughtCloud
        slot="left"
        position={[-0.52, 2.19, 0.06]}
        label={labels.journey}
        target={{ kind: "journey" }}
        onSelect={onSelect}
        phase={0}
        animated={animated}
        scale={lowPower ? 0.92 : 1}
      />
      <ThoughtCloud
        slot="center"
        position={[0, 2.42, -0.02]}
        label={labels.profile}
        target={{ kind: "profile" }}
        onSelect={onSelect}
        phase={1.1}
        animated={animated}
        scale={lowPower ? 0.86 : 0.96}
      />
      <ThoughtCloud
        slot="right"
        position={[0.54, 2.22, 0.04]}
        label={labels.beyond}
        target={{ kind: "beyond" }}
        onSelect={onSelect}
        phase={2.2}
        animated={animated}
        scale={lowPower ? 0.9 : 0.98}
      />
    </group>
  );
}