"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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
import { AthleteModel } from "./AthleteModel";
import { CourtPlatform } from "./CourtPlatform";
import { Volleyball } from "./Volleyball";
import { ThoughtClouds } from "./ThoughtCloud";
import { Medal, Trophy } from "./Trophy";

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
 */
function UseFramedCamera() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    if (!Number.isFinite(aspect) || aspect <= 0) return;

    const { position, centre } = computeFrame(aspect);
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(centre[0], centre[1], centre[2]);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }, [camera, size.width, size.height]);

  return null;
}

/**
 * Gentle idle movement for the whole athlete: a slow breath, a slight weight
 * shift and a small head turn. Disabled entirely for reduced motion.
 */
/**
 * Draws one frame on mount and whenever the scene changes.
 *
 * R3F's `frameloop="always"` paints from its own `requestAnimationFrame` loop,
 * which covers a normal browser on its own. It is not enough on its own
 * though: where the rendering loop never runs (headless verification, some
 * embedded webviews) the canvas would sit blank even though the whole scene is
 * built, and with `frameloop="demand"` (reduced motion) nothing would ever be
 * painted until something invalidated it. One explicit synchronous paint makes
 * a visible frame unconditional.
 */
function OnDemandPaint() {
  const render = useForcedFrame();

  useEffect(() => {
    render();
  }, [render]);

  return null;
}

function AthleteRig({ animated, detailed }: { animated: boolean; detailed: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !rig.current || !body.current) return;
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
      <group ref={body}>
        <AthleteModel detailed={detailed} />
      </group>
    </group>
  );
}

/** Slow drift on the resting ball, also disabled for reduced motion. */
function DriftingBall({ animated, lowPower }: { animated: boolean; lowPower: boolean }) {
  const mesh = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animated || !mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.position.y = 0.108 + Math.abs(Math.sin(t * 0.7)) * 0.012;
    mesh.current.rotation.y = t * 0.18;
  });

  return (
    <group ref={mesh} position={[0.44, 0.108, 0.26]}>
      <Volleyball animated={animated} segments={lowPower ? 18 : 32} />
    </group>
  );
}

function SceneContents({
  labels,
  onSelect,
  reducedMotion,
  lowPower,
}: AthleteSceneProps) {
  const animated = !reducedMotion;

  return (
    <>
      <OnDemandPaint />

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
        color="#fdf7ec"
        castShadow={!lowPower}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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
        color="#ce1126"
      />
      {/* low gold bounce for the metallic accents */}
      <pointLight position={[1.6, 0.6, 2.2]} intensity={5} distance={7} color="#c9a44d" />

      {/* ------------------------------------------------------------- world */}
      <group position={[0, -1.25, 0]}>
        <CourtPlatform shadowsEnabled={!lowPower} />

        {lowPower ? null : (
          <ContactShadows
            position={[0, 0.004, 0]}
            opacity={0.5}
            scale={4.2}
            blur={2.4}
            far={1.6}
            resolution={512}
            frames={1}
            color="#000000"
          />
        )}

        <AthleteRig animated={animated} detailed={!lowPower} />
        <DriftingBall animated={animated} lowPower={lowPower} />

        <Trophy
          position={[-0.63, 1.44, 0.05]}
          label={labels.trophy}
          caption={labels.trophyNote}
          onSelect={onSelect}
          animated={animated}
          detail={lowPower ? 12 : 24}
        />
        <Medal
          position={[0.64, 1.36, 0.06]}
          label={labels.medal}
          caption={labels.medalNote}
          onSelect={onSelect}
          animated={animated}
          detail={lowPower ? 10 : 20}
        />

        <ThoughtClouds
          labels={{ journey: labels.journey, profile: labels.profile, beyond: labels.beyond }}
          onSelect={onSelect}
          animated={animated}
          lowPower={lowPower}
        />
      </group>

      <AdaptiveDpr pixelated />
      <UseFramedCamera />
    </>
  );
}

/**
 * The WebGL canvas.
 *
 * Loaded client-side only (see `SceneStage.tsx`), so it never runs on the
 * server and cannot cause hydration mismatches.
 */
export function AthleteScene(props: AthleteSceneProps) {
  const { reducedMotion, lowPower } = props;

  return (
    <Canvas
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      shadows={!lowPower}
      frameloop={reducedMotion ? "demand" : "always"}
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