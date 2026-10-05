"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { GuaranteedResizeObserver } from "@/lib/measure";
import type { SceneTarget } from "@/lib/sections";
import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  computeFrame,
} from "./framing";
import { SCENE_ANCHORS, SCENE_COLORS } from "./config";
import { AchievementTrails } from "./AchievementTrails";
import { AthleteModel } from "./AthleteModel";
import { CourtPlatform } from "./CourtPlatform";
import { Volleyball } from "./Volleyball";
import { ThoughtClouds } from "./ThoughtCloud";
import { Medal, Trophy } from "./Trophy";
import { revealAmount, type EntranceStage } from "./entrance";

export interface SceneLabels {
  journey: string;
  profile: string;
  beyond: string;
  trophy: string;
  trophyNote: string;
  medal: string;
  medalNote: string;
}

export interface AthleteSceneProps {
  labels: SceneLabels;
  onSelect: (target: SceneTarget) => void;
  reducedMotion: boolean;
  lowPower: boolean;
  /** Which beat of the entrance sequence the scene is showing. */
  stage: EntranceStage;
  /** Hotspot the visitor is pointing at, so the canvas can echo the hover. */
  highlighted: SceneTarget["kind"] | null;
  /** True while the section is off screen; rendering is paused. */
  paused: boolean;
}

/**
 * Renders one frame synchronously on demand.
 *
 * R3F only advances frames from `requestAnimationFrame`, which never fires in
 * environments that have no rendering loop (headless verification, some
 * embedded webviews). This lets the scene still be painted on demand instead of
 * waiting for a frame that will never arrive.
 */
export function useForcedFrame(): () => void {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  return useCallback(() => gl.render(scene, camera), [gl, scene, camera]);
}

/**
 * Keeps the whole composition framed at any canvas aspect ratio.
 *
 * The stage changes aspect at breakpoints, so the camera distance is solved from
 * the live viewport rather than fixed. Runs in a layout effect so the camera is
 * already correct for the first painted frame instead of jumping afterwards.
 *
 * Pointer-driven parallax is layered on top of the solved position rather than
 * replacing it: the solved frame is the composition, and the pointer only adds a
 * few centimetres of depth. The offset is damped toward the pointer target so it
 * can never produce an abrupt camera move, and it is zero for reduced motion and
 * on coarse pointers, where there is no cursor to track and a still frame is
 * kinder to the battery.
 */
function UseFramedCamera({
  parallax,
}: {
  parallax: { x: number; y: number };
}) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const solved = useRef<{ x: number; y: number; z: number } | null>(null);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    if (!Number.isFinite(aspect) || aspect <= 0) return;

    const { position, centre } = computeFrame(aspect);
    solved.current = { x: position[0], y: position[1], z: position[2] };

    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(centre[0], centre[1], centre[2]);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }, [camera, size.width, size.height]);

  useFrame((state) => {
    const base = solved.current;
    if (!base) return;

    // Damped follow: never more than a few centimetres per frame, so the camera
    // drifts rather than snapping.
    const targetX = base.x + parallax.x;
    const targetY = base.y + parallax.y;
    const active = state.camera;

    active.position.x += (targetX - active.position.x) * 0.06;
    active.position.y += (targetY - active.position.y) * 0.06;
    active.updateMatrixWorld();
  });

  return null;
}

/**
 * Draws one frame whenever the scene changes.
 *
 * R3F's `frameloop="always"` paints from its own `requestAnimationFrame` loop,
 * which covers a normal browser on its own. It is not enough on its own though:
 * where the rendering loop never runs (headless verification, some embedded
 * webviews) the canvas would sit blank even though the whole scene is built, and
 * with `frameloop="demand"` (reduced motion) nothing would ever be painted until
 * something invalidated it. One explicit synchronous paint per change makes a
 * visible frame unconditional — which is also what makes the staged entrance
 * sequence visible in those environments, since each beat is a state change.
 */
function OnDemandPaint({ deps }: { deps: unknown }) {
  const render = useForcedFrame();

  useEffect(() => {
    render();
  }, [render, deps]);

  return null;
}

/**
 * Gentle idle movement for the whole athlete: a slow breath, a slight weight
 * shift and a small head turn. Disabled entirely for reduced motion.
 */
function AthleteRig({
  animated,
  detailed,
  enter,
}: {
  animated: boolean;
  detailed: boolean;
  enter: number;
}) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!rig.current || !body.current) return;

    if (!animated) {
      // Reduced motion: hold the entrance position, no idle.
      return;
    }

    const t = clock.getElapsedTime();
    rig.current.position.y = Math.sin(t * 0.9) * 0.008;
    rig.current.rotation.y = Math.sin(t * 0.22) * 0.055;
    // Weight shift across the hips.
    rig.current.rotation.z = Math.sin(t * 0.5) * 0.012;
    // Breathing.
    body.current.scale.set(1, 1 + Math.sin(t * 1.5) * 0.006, 1);
  });

  return (
    <group ref={rig}>
      <group ref={body} visible={enter > 0.01}>
        <AthleteModel detailed={detailed} enterOffset={0} />
      </group>
    </group>
  );
}

/** Slow drift on the resting ball, also disabled for reduced motion. */
function DriftingBall({
  animated,
  lowPower,
  enter,
}: {
  animated: boolean;
  lowPower: boolean;
  enter: number;
}) {
  const mesh = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.position.y = 0.108 + Math.abs(Math.sin(t * 0.7)) * 0.012;
    mesh.current.rotation.y = t * 0.18;
  });

  return (
    <group
      ref={mesh}
      position={[SCENE_ANCHORS.ball.x, SCENE_ANCHORS.ball.y, SCENE_ANCHORS.ball.z]}
      visible={enter > 0.01}
    >
      <Volleyball animated={animated} segments={lowPower ? 18 : 32} />
    </group>
  );
}

function SceneContents({
  labels,
  onSelect,
  reducedMotion,
  lowPower,
  stage,
  highlighted,
  paused,
}: AthleteSceneProps) {
  const animated = !reducedMotion;

  // Entrance factors, one per beat.
  const court = stage === "court" ? 0.001 : 1;
  const athleteIn = revealAmount(stage === "court" ? 0 : stage === "athlete" ? 0.35 : 1);
  const cloudsIn = revealAmount(stage === "athlete" ? 0 : stage === "clouds" ? 0.5 : 1);
  const trophiesIn = revealAmount(stage === "clouds" ? 0 : stage === "trophies" ? 0.5 : 1);

  const trailIn = trophiesIn;
  const parallax = useParallax({ reducedMotion, lowPower, paused });

  const { leftHand, rightHand, trophy, medal } = SCENE_ANCHORS;

  return (
    <>
      <OnDemandPaint deps={`${stage}:${highlighted}:${paused}`} />

      {/* --------------------------------------------------------- lighting */}
      <ambientLight intensity={0.42} color="#c7d2e8" />
      <hemisphereLight
        intensity={0.35}
        color="#93a4c4"
        groundColor="#05060a"
        position={[0, 3, 0]}
      />
      {/* key light — soft stadium floodlight from front-right */}
      <directionalLight
        position={[2.6, 4.2, 2.4]}
        intensity={1.5}
        color={SCENE_COLORS.floodlight}
        castShadow={!lowPower}
        shadow-mapSize-width={lowPower ? 512 : 1024}
        shadow-mapSize-height={lowPower ? 512 : 1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0008}
      />
      {/* restrained red rim light from behind-left */}
      <spotLight
        position={[-3.2, 2.6, -2.6]}
        angle={0.85}
        penumbra={1}
        intensity={26}
        distance={12}
        color={SCENE_COLORS.rim}
      />
      {/* low gold bounce for the metallic accents */}
      <pointLight position={[1.6, 0.6, 2.2]} intensity={5} distance={7} color={SCENE_COLORS.gold} />

      {/* A single warm flood from above the athlete reads as the stadium rig. */}
      <spotLight
        position={[0, 4.6, 0.6]}
        angle={0.7}
        penumbra={1}
        intensity={18}
        distance={11}
        color="#ffe9c4"
      />

      {/* ------------------------------------------------------------- world */}
      <group position={[0, -1.25, 0]}>
        <group visible={court > 0} scale={revealAmount(court)}>
          <CourtPlatform netVisible={!lowPower} quality={lowPower ? 2 : 8} />
        </group>

        {lowPower ? null : (
          <ContactShadows
            position={[0, 0.004, 0]}
            opacity={0.5}
            scale={4.2}
            blur={2.4}
            far={1.6}
            resolution={lowPower ? 256 : 512}
            frames={1}
            color="#000000"
          />
        )}

        <AthleteRig animated={animated} detailed={!lowPower} enter={athleteIn} />
        <DriftingBall animated={animated} lowPower={lowPower} enter={athleteIn} />

        {/* Restrained light trails: set piece down to the hand above it. */}
        {trailIn > 0.01 ? (
          <AchievementTrails
            animated={animated}
            lowPower={lowPower}
            leftHand={[leftHand.x, leftHand.y, leftHand.z]}
            rightHand={[rightHand.x, rightHand.y, rightHand.z]}
            trophy={[trophy.x, trophy.y, trophy.z]}
            medal={[medal.x, medal.y, medal.z]}
          />
        ) : null}

        <Trophy
          position={[trophy.x, trophy.y, trophy.z]}
          label={labels.trophy}
          caption={labels.trophyNote}
          onSelect={onSelect}
          animated={animated}
          detail={lowPower ? 12 : 24}
          enter={trophiesIn}
        />
        <Medal
          position={[medal.x, medal.y, medal.z]}
          label={labels.medal}
          caption={labels.medalNote}
          onSelect={onSelect}
          animated={animated}
          detail={lowPower ? 10 : 20}
          enter={trophiesIn}
        />

        <ThoughtClouds
          labels={{ journey: labels.journey, profile: labels.profile, beyond: labels.beyond }}
          onSelect={onSelect}
          animated={animated}
          lowPower={lowPower}
          enter={cloudsIn}
          highlighted={highlighted}
        />
      </group>

      <AdaptiveDpr pixelated />
      <UseFramedCamera parallax={parallax} />
    </>
  );
}

/** Largest pointer parallax offset, in metres. Deliberately tiny. */
export const PARALLAX_RANGE = 0.13;

/**
 * Tracks the pointer for gentle camera depth.
 *
 * Listens on the window rather than the canvas so the whole hero responds, and
 * never calls `preventDefault`, so page scrolling is untouched: there is no
 * scroll trapping anywhere in the scene. Returns a zero offset — and registers
 * no listener at all — for reduced motion, coarse pointers and off-screen state.
 */
function useParallax({
  reducedMotion,
  lowPower,
  paused,
}: {
  reducedMotion: boolean;
  lowPower: boolean;
  paused: boolean;
}): { x: number; y: number } {
  const disabled = reducedMotion || lowPower || paused;
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;

    const onMove = (event: PointerEvent) => {
      // Touch and pen have no hover position to track, so they are ignored.
      if (event.pointerType !== "mouse") return;
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      setPointer({ x: nx * PARALLAX_RANGE, y: -ny * PARALLAX_RANGE * 0.6 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [disabled]);

  return disabled ? ZERO : pointer;
}

const ZERO = { x: 0, y: 0 };

/**
 * The WebGL canvas.
 *
 * Loaded client-side only (see `SceneStage.tsx`), so it never runs on the server
 * and cannot cause hydration mismatches.
 */
export function AthleteScene(props: AthleteSceneProps) {
  const { reducedMotion, lowPower, paused } = props;

  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      shadows={!lowPower}
      frameloop={paused ? "never" : reducedMotion ? "demand" : "always"}
      // `react-use-measure` inside `Canvas` only ever receives its size from a
      // ResizeObserver callback, so the wrapper keeps a guaranteed first
      // measurement available. Without it the canvas stays 300x150 and R3F
      // never builds the scene at all.
      resize={{ polyfill: GuaranteedResizeObserver }}
      camera={{ fov: CAMERA_FOV, near: CAMERA_NEAR, far: CAMERA_FAR }}
      gl={{
        antialias: !lowPower,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
      // Tells the renderer the element is decorative, so assistive technology
      // skips it and the interactive equivalents below stay the only controls.
      role="presentation"
    >
      <SceneContents {...props} />
    </Canvas>
  );
}