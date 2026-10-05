"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SCENE_COLORS } from "./config";

/**
 * Development placeholder athlete.
 *
 * A stylised figure assembled from primitives with roughly 7.5-head
 * proportions. It is deliberately **not** a likeness of Ahmed Said Shafik and is
 * replaced by the GLB model once `NEXT_PUBLIC_ATHLETE_MODEL_URL` is set (see
 * `AthleteModel.tsx`).
 *
 * Measurements are in metres for a ~1.9 m figure:
 * ankle 0.09 · knee 0.49 · hip 0.90 · waist 1.10 · chest 1.30 · shoulder 1.47 ·
 * neck base 1.55 · head centre 1.71 · crown 1.83
 *
 * Two proportion rules keep the read athletic rather than doll-like: the leg is
 * roughly half the total height with the knee break at the midpoint, and the
 * shoulder span is about two head-widths wider than the hips. Limbs taper toward
 * their joints, and joint spheres sit at each break so the silhouette has no
 * visible gaps when the arms extend.
 */
export function PlaceholderAthlete({
  detailed = true,
  /** 0 = fully emerged, 1 = fully lowered. Drives the entrance animation. */
  enterOffset = 0,
}: {
  detailed?: boolean;
  enterOffset?: number;
}) {
  const seg = detailed ? 18 : 9;
  const skin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.skin,
        roughness: 0.66,
        metalness: 0.03,
      }),
    [],
  );
  const skinDeep = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.skinShadow,
        roughness: 0.7,
        metalness: 0.03,
      }),
    [],
  );
  const kit = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.kit,
        roughness: 0.52,
        metalness: 0.06,
      }),
    [],
  );
  const kitDark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.kitDark,
        roughness: 0.56,
        metalness: 0.05,
      }),
    [],
  );
  const shorts = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.shorts,
        roughness: 0.72,
        metalness: 0.02,
      }),
    [],
  );
  const trim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.kitTrim,
        roughness: 0.6,
      }),
    [],
  );
  const gold = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SCENE_COLORS.gold,
        roughness: 0.3,
        metalness: 0.85,
      }),
    [],
  );

  return (
    // The whole figure settles from below as the entrance sequence runs.
    <group position={[0, -enterOffset, 0]}>
      {/* ---------------------------------------------------------------- legs */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.098, 0, 0]}>
          {/* thigh: hip 0.90 -> knee 0.49 */}
          <mesh position={[0, 0.695, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.088, 0.234, 4, seg]} />
            <primitive object={skin} attach="material" />
          </mesh>

          <mesh position={[0, 0.49, 0]} castShadow>
            <sphereGeometry args={[0.072, seg, Math.round(seg * 0.7)]} />
            <primitive object={skinDeep} attach="material" />
          </mesh>

          {/* shin: knee 0.49 -> ankle 0.09 */}
          <mesh position={[0, 0.29, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.062, 0.276, 4, seg]} />
            <primitive object={skin} attach="material" />
          </mesh>

          {/* knee pad — reads as volleyball kit rather than a bare figure */}
          <mesh position={[0, 0.515, 0.052]} castShadow>
            <sphereGeometry args={[0.055, Math.round(seg * 0.8), 8]} />
            <primitive object={skinDeep} attach="material" />
          </mesh>

          {/* sock */}
          <mesh position={[0, 0.145, 0]} castShadow>
            <cylinderGeometry args={[0.058, 0.052, 0.11, seg]} />
            <primitive object={trim} attach="material" />
          </mesh>

          {/* shoe: sole, upper and a gold flash, so the foot reads as footwear */}
          <group position={[0, 0.045, 0.05]} rotation={[0, side * 0.08, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.104, 0.05, 0.258]} />
              <meshStandardMaterial color="#c9c2b6" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.042, 0]} castShadow>
              <boxGeometry args={[0.1, 0.062, 0.24]} />
              <meshStandardMaterial color={SCENE_COLORS.shoe} roughness={0.42} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.055, -0.03]}>
              <boxGeometry args={[0.104, 0.014, 0.05]} />
              <primitive object={gold} attach="material" />
            </mesh>
          </group>
        </group>
      ))}

      {/* ------------------------------------------------------- shorts and hips */}
      <mesh position={[0, 0.9, 0]} scale={[1, 1, 0.76]} castShadow receiveShadow>
        <capsuleGeometry args={[0.165, 0.14, 5, seg]} />
        <primitive object={shorts} attach="material" />
      </mesh>

      {/* shorts leg openings, angled outward to suggest a stance */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.1, 0.79, 0.004]}
          rotation={[0, 0, side * 0.1]}
          castShadow
        >
          <cylinderGeometry args={[0.104, 0.096, 0.15, Math.round(seg * 0.9)]} />
          <primitive object={shorts} attach="material" />
        </mesh>
      ))}

      {/* waistband */}
      <mesh position={[0, 1.098, 0]} scale={[1, 1, 0.78]} castShadow>
        <cylinderGeometry args={[0.181, 0.181, 0.05, seg]} />
        <primitive object={kitDark} attach="material" />
      </mesh>

      {/* --------------------------------------------------------------- torso */}
      {/* Lats flare wider than the waist, which is what makes the torso read as
          athletic rather than cylindrical. */}
      <mesh position={[0, 1.29, 0]} scale={[1.06, 1, 0.68]} castShadow receiveShadow>
        <capsuleGeometry args={[0.186, 0.1, 6, seg]} />
        <primitive object={kit} attach="material" />
      </mesh>
      <mesh position={[0, 1.4, 0]} scale={[1.14, 0.7, 0.66]} castShadow>
        <capsuleGeometry args={[0.19, 0.06, 5, seg]} />
        <primitive object={kit} attach="material" />
      </mesh>

      {/* gold side piping down the jersey */}
      <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.152, 0.006, 6, seg]} />
        <primitive object={gold} attach="material" />
      </mesh>

      {/* jersey number panel on the chest, kept flat so it reads from the front */}
      <mesh position={[0, 1.31, 0.128]} rotation={[-0.06, 0, 0]}>
        <planeGeometry args={[0.13, 0.15]} />
        <primitive object={trim} attach="material" />
      </mesh>

      {/* ------------------------------------------------------------ shoulders */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.193, 1.452, 0]}
          scale={[1.08, 0.84, 0.88]}
          castShadow
        >
          <sphereGeometry args={[0.086, seg, Math.round(seg * 0.7)]} />
          <primitive object={kit} attach="material" />
        </mesh>
      ))}

      {/* ----------------------------------------------------------------- neck */}
      <mesh position={[0, 1.558, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.14, seg]} />
        <primitive object={skinDeep} attach="material" />
      </mesh>

      {/* ----------------------------------------------------------------- head */}
      <group position={[0, 1.712, 0]}>
        <mesh scale={[0.9, 1.12, 1]} castShadow>
          <sphereGeometry args={[0.112, seg, seg]} />
          <primitive object={skin} attach="material" />
        </mesh>

        {/* jaw / chin mass */}
        <mesh position={[0, -0.055, 0.012]} scale={[0.86, 0.7, 0.96]}>
          <sphereGeometry args={[0.086, seg, Math.round(seg * 0.7)]} />
          <primitive object={skinDeep} attach="material" />
        </mesh>

        {/* hair cap */}
        <mesh position={[0, 0.006, -0.004]}>
          <sphereGeometry
            args={[0.115, seg, Math.round(seg * 0.8), 0, Math.PI * 2, 0, Math.PI * 0.54]}
          />
          <meshStandardMaterial color={SCENE_COLORS.hair} roughness={0.85} />
        </mesh>

        {/* ears */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.1, -0.005, 0]} scale={[0.5, 1, 0.7]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <primitive object={skinDeep} attach="material" />
          </mesh>
        ))}

        {/* eyes */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.042, 0.012, 0.098]}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshStandardMaterial color="#120f0d" roughness={0.4} />
          </mesh>
        ))}

        {/* brows */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.045, 0.043, 0.096]}
            rotation={[0, 0, side * -0.12]}
          >
            <boxGeometry args={[0.044, 0.008, 0.012]} />
            <meshStandardMaterial color={SCENE_COLORS.hair} roughness={0.85} />
          </mesh>
        ))}

        {/* nose */}
        <mesh position={[0, -0.018, 0.104]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.018, 0.05, 8]} />
          <primitive object={skinDeep} attach="material" />
        </mesh>
      </group>

      {/* ----------------------------------------------------------------- arms */}
      <Arm side={-1} seg={seg} skin={skin} skinDeep={skinDeep} kit={kit} />
      <Arm side={1} seg={seg} skin={skin} skinDeep={skinDeep} kit={kit} />
    </group>
  );
}

/**
 * One arm in the "hands slightly extended, palms up" pose.
 *
 * The upper arm hangs out and down from the shoulder and the forearm turns back
 * out, so the hands end up beside the hips rather than forward — the open,
 * welcoming read the concept calls for, without the arms looking raised.
 *
 * The palm is oriented by building an orthonormal basis from the forearm's world
 * direction and the world up vector, so the palm always faces up without
 * hand-tuned Euler angles.
 */
function Arm({
  side,
  seg,
  skin,
  skinDeep,
  kit,
}: {
  side: -1 | 1;
  seg: number;
  skin: THREE.Material;
  skinDeep: THREE.Material;
  kit: THREE.Material;
}) {
  const forearmRef = useRef<THREE.Group>(null);
  const handRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const forearm = forearmRef.current;
    const hand = handRef.current;
    if (!forearm || !hand) return;

    forearm.updateWorldMatrix(true, false);
    const worldQuaternion = new THREE.Quaternion();
    forearm.getWorldQuaternion(worldQuaternion);

    // Direction from elbow to wrist.
    const forward = new THREE.Vector3(0, -1, 0)
      .applyQuaternion(worldQuaternion)
      .normalize();

    const yAxis = forward.clone().negate(); // hand points away from the elbow
    const zAxis = new THREE.Vector3(0, 1, 0); // palm normal, facing up
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

    hand.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis),
    );
  }, []);

  return (
    // Shoulder out and down; the forearm group below swings it back open.
    <group position={[side * 0.207, 1.462, 0]} rotation={[-0.1, 0, side * 0.22]}>
      {/* deltoid */}
      <mesh castShadow>
        <sphereGeometry args={[0.076, seg, Math.round(seg * 0.7)]} />
        <primitive object={skin} attach="material" />
      </mesh>

      {/* upper arm: 0.32 total */}
      <mesh position={[0, -0.16, 0]} castShadow>
        <capsuleGeometry args={[0.056, 0.208, 4, seg]} />
        <primitive object={skin} attach="material" />
      </mesh>

      {/* jersey sleeve */}
      <mesh position={[0, -0.035, 0]} scale={[1, 1, 0.94]} castShadow>
        <capsuleGeometry args={[0.064, 0.03, 4, seg]} />
        <primitive object={kit} attach="material" />
      </mesh>

      <group ref={forearmRef} position={[0, -0.32, 0]} rotation={[-0.14, 0, side * 0.46]}>
        {/* elbow */}
        <mesh castShadow>
          <sphereGeometry args={[0.052, seg, Math.round(seg * 0.7)]} />
          <primitive object={skinDeep} attach="material" />
        </mesh>

        {/* forearm: 0.27 total */}
        <mesh position={[0, -0.135, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.174, 4, seg]} />
          <primitive object={skin} attach="material" />
        </mesh>

        <group ref={handRef} position={[0, -0.27, 0]}>
          {/* palm: flattened along local Z so ±Z is the palm normal */}
          <mesh scale={[1, 1.45, 0.42]} castShadow>
            <sphereGeometry args={[0.055, seg, seg]} />
            <primitive object={skin} attach="material" />
          </mesh>
          {/* fingers mass */}
          <mesh position={[0, -0.062, 0]} scale={[0.94, 0.5, 0.36]}>
            <sphereGeometry args={[0.05, seg, Math.round(seg * 0.7)]} />
            <primitive object={skinDeep} attach="material" />
          </mesh>
          {/* thumb */}
          <mesh position={[side * -0.042, -0.006, 0.018]} rotation={[0, 0, side * 0.7]}>
            <capsuleGeometry args={[0.014, 0.03, 3, 8]} />
            <primitive object={skin} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}