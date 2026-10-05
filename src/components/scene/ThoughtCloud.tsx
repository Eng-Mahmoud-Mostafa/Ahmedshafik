"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { SceneTarget } from "@/lib/sections";
import { CLOUD_ANCHORS, SCENE_COLORS } from "./config";

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
  /** 1 = settled, 0 = not yet visible. Drives the entrance. */
  enter?: number;
  /** 0..1 highlight, driven by the HTML controls so hover state matches. */
  highlight?: number;
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
 * Labelled with drei `<Html>` for a crisp, readable caption and clickable both in
 * 3D and through the equivalent HTML button rendered beside the canvas. The
 * translucent material brightens slightly when highlighted so the hover and
 * selected states are visible on the canvas as well as on the control.
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
  enter = 1,
  highlight = 0,
}: CloudProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const direction = slot === "left" ? -1 : slot === "right" ? 1 : 0;

  // The entrance lifts the cloud up into place and grows it from 60% of size.
  const lift = (1 - enter) * 0.34;
  const emphasis = Math.max(highlight, hovered ? 1 : 0);

  useFrame(({ clock }) => {
    if (!animated || !group.current) return;
    const t = clock.getElapsedTime() + phase;
    // Offsets only. The outer group already carries the absolute position from
    // the props, so writing an absolute value here would add it a second time
    // and push the cloud twice as high and twice as far out.
    group.current.position.y = Math.sin(t * 0.8) * 0.022;
    group.current.position.x = Math.sin(t * 0.45) * 0.016 * (direction === 0 ? 1 : direction);
  });

  const opacity = (0.24 + emphasis * 0.16) * enter;

  return (
    <group position={[position[0], position[1] - lift, position[2]]} scale={scale}>
      <group ref={group} visible={enter > 0.01}>
        {PUFFS.map(([x, y, z], index) => (
          <mesh
            key={index}
            position={[x * SPACING, y * SPACING, z * SPACING]}
            scale={(1 + index * 0.02) * (0.6 + 0.4 * enter)}
          >
            <sphereGeometry args={[RADIUS, 14, 12]} />
            <meshPhysicalMaterial
              color={SCENE_COLORS.cloud}
              transparent
              opacity={opacity}
              roughness={0.35}
              metalness={0}
              transmission={0}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/*
          Hit area: one invisible sphere makes the whole cloud clickable. It
          carries the hover state that brightens the cloud and shows a focus
          ring in the caption.
        */}
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            onSelect(target);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
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
          visible={enter > 0.6}
        >
          <span
            className={[
              "block max-w-[9rem] rounded-full border px-3 py-1 text-[0.6rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase backdrop-blur-sm rtl:tracking-normal",
              "transition-colors duration-200",
              emphasis > 0.5
                ? "border-gold/60 bg-ink/90 text-gold"
                : "border-charcoal-line bg-ink/80 text-bone",
            ].join(" ")}
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
  enter = 1,
  highlighted,
}: {
  labels: { journey: string; profile: string; beyond: string };
  onSelect: (target: SceneTarget) => void;
  animated: boolean;
  lowPower: boolean;
  enter?: number;
  /** Which hotspot the visitor is currently pointing at or has selected. */
  highlighted?: SceneTarget["kind"] | null;
}) {
  // One cloud in at a time as well as one group at a time, so the entrance reads
  // as a sequence rather than three things arriving together.
  const staggered = (index: number): number =>
    Math.max(0, Math.min(1, (enter - index * 0.22) / (1 - 0.44)));

  return (
    <group>
      <ThoughtCloud
        slot="left"
        position={[CLOUD_ANCHORS.journey.x, CLOUD_ANCHORS.journey.y, CLOUD_ANCHORS.journey.z]}
        label={labels.journey}
        target={{ kind: "journey" }}
        onSelect={onSelect}
        phase={0}
        animated={animated}
        scale={lowPower ? 0.92 : 1}
        enter={staggered(0)}
        highlight={highlighted === "journey" ? 1 : 0}
      />
      <ThoughtCloud
        slot="center"
        position={[CLOUD_ANCHORS.profile.x, CLOUD_ANCHORS.profile.y, CLOUD_ANCHORS.profile.z]}
        label={labels.profile}
        target={{ kind: "profile" }}
        onSelect={onSelect}
        phase={1.1}
        animated={animated}
        scale={lowPower ? 0.86 : 0.96}
        enter={staggered(1)}
        highlight={highlighted === "profile" ? 1 : 0}
      />
      <ThoughtCloud
        slot="right"
        position={[CLOUD_ANCHORS.beyond.x, CLOUD_ANCHORS.beyond.y, CLOUD_ANCHORS.beyond.z]}
        label={labels.beyond}
        target={{ kind: "beyond" }}
        onSelect={onSelect}
        phase={2.2}
        animated={animated}
        scale={lowPower ? 0.9 : 0.98}
        enter={staggered(2)}
        highlight={highlighted === "beyond" ? 1 : 0}
      />
    </group>
  );
}