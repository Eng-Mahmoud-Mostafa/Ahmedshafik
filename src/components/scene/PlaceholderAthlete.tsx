"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { SCENE_COLORS } from "./config";

/**
 * Development placeholder athlete.
 *
 * This is a stylised figure assembled from primitives with roughly 7.5-head
 * proportions. It is deliberately **not** a likeness of Ahmed Said Shafik and
 * is replaced by the GLB model once `NEXT_PUBLIC_ATHLETE_MODEL_URL` is set
 * (see `AthleteModel.tsx`).
 *
 * Measurements are in metres for a ~1.9 m figure:
 * ankle 0.09 · knee 0.49 · hip 0.90 · waist 1.10 · chest 1.30 · shoulder 1.47 ·
 * neck base 1.55 · head centre 1.71 · crown 1.83
 */
export function PlaceholderAthlete({ detailed = true }: { detailed?: boolean }) {
  const seg = detailed ? 16 : 8;

  return (
    <group>
      {/* ---------------------------------------------------------------- legs */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.098, 0, 0]}>
          {/* thigh: hip 0.90 -> knee 0.49 */}
          <mesh position={[0, 0.695, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.088, 0.234, 4, seg]} />
            <meshStandardMaterial
              color={SCENE_COLORS.skin}
              roughness={0.68}
              metalness={0.04}
            />
          </mesh>

          <mesh position={[0, 0.49, 0]} castShadow>
            <sphereGeometry args={[0.072, seg, Math.round(seg * 0.7)]} />
            <meshStandardMaterial
              color={SCENE_COLORS.skin}
              roughness={0.68}
            />
          </mesh>

          {/* shin: knee 0.49 -> ankle 0.09 */}
          <mesh position={[0, 0.29, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.062, 0.276, 4, seg]} />
            <meshStandardMaterial
              color={SCENE_COLORS.skin}
              roughness={0.68}
              metalness={0.04}
            />
          </mesh>

          {/* shoe */}
          <mesh position={[0, 0.045, 0.052]} rotation={[0, side * 0.08, 0]} castShadow>
            <boxGeometry args={[0.104, 0.088, 0.262]} />
            <meshStandardMaterial
              color={SCENE_COLORS.shoe}
              roughness={0.42}
              metalness={0.06}
            />
          </mesh>
        </group>
      ))}

      {/* -------------------------------------------------------------- pelvis */}
      <mesh position={[0, 0.9, 0]} scale={[1, 1, 0.76]} castShadow receiveShadow>
        <capsuleGeometry args={[0.165, 0.14, 5, seg]} />
        <meshStandardMaterial
          color={SCENE_COLORS.kitDark}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* waistband */}
      <mesh position={[0, 1.098, 0]} scale={[1, 1, 0.78]} castShadow>
        <cylinderGeometry args={[0.181, 0.181, 0.05, seg]} />
        <meshStandardMaterial color={SCENE_COLORS.kit} roughness={0.55} />
      </mesh>

      {/* --------------------------------------------------------------- torso */}
      <mesh position={[0, 1.3, 0]} scale={[1, 1, 0.68]} castShadow receiveShadow>
        <capsuleGeometry args={[0.186, 0.09, 6, seg]} />
        <meshStandardMaterial
          color={SCENE_COLORS.kit}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* gold side piping on the jersey */}
      <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
        <torusGeometry args={[0.148, 0.006, 6, seg]} />
        <meshStandardMaterial
          color={SCENE_COLORS.gold}
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* -------------------------------------------------------------- shoulders */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.185, 1.455, 0]}
          scale={[1.05, 0.82, 0.86]}
          castShadow
        >
          <sphereGeometry args={[0.086, seg, Math.round(seg * 0.7)]} />
          <meshStandardMaterial color={SCENE_COLORS.kit} roughness={0.55} />
        </mesh>
      ))}

      {/* ----------------------------------------------------------------- neck */}
      <mesh position={[0, 1.558, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.14, seg]} />
        <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.7} />
      </mesh>

      {/* ----------------------------------------------------------------- head */}
      <group position={[0, 1.712, 0]}>
        <mesh scale={[0.9, 1.12, 1]} castShadow>
          <sphereGeometry args={[0.112, seg, seg]} />
          <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.72} />
        </mesh>

        {/* jaw / chin mass */}
        <mesh position={[0, -0.055, 0.012]} scale={[0.86, 0.7, 0.96]}>
          <sphereGeometry args={[0.086, seg, Math.round(seg * 0.7)]} />
          <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.72} />
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
            <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.75} />
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
          <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.72} />
        </mesh>
      </group>

      {/* ----------------------------------------------------------------- arms */}
      <Arm side={-1} seg={seg} />
      <Arm side={1} seg={seg} />
    </group>
  );
}

/**
 * One arm in the "hands slightly extended, palms up" pose.
 *
 * The palm is oriented by building an orthonormal basis from the forearm's
 * world direction and the world up vector, so the palm always faces up without
 * hand-tuned Euler angles.
 */
function Arm({ side, seg }: { side: -1 | 1; seg: number }) {
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
    <group position={[side * 0.2, 1.47, 0]} rotation={[-0.16, 0, side * 0.4]}>
      {/* deltoid */}
      <mesh castShadow>
        <sphereGeometry args={[0.076, seg, Math.round(seg * 0.7)]} />
        <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.68} />
      </mesh>

      {/* upper arm: 0.32 total */}
      <mesh position={[0, -0.16, 0]} castShadow>
        <capsuleGeometry args={[0.056, 0.208, 4, seg]} />
        <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.66} />
      </mesh>

      {/* jersey sleeve */}
      <mesh position={[0, -0.035, 0]} scale={[1, 1, 0.94]} castShadow>
        <capsuleGeometry args={[0.064, 0.03, 4, seg]} />
        <meshStandardMaterial color={SCENE_COLORS.kit} roughness={0.55} />
      </mesh>

      <group ref={forearmRef} position={[0, -0.32, 0]} rotation={[-0.2, 0, side * 0.62]}>
        {/* elbow */}
        <mesh castShadow>
          <sphereGeometry args={[0.052, seg, Math.round(seg * 0.7)]} />
          <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.66} />
        </mesh>

        {/* forearm: 0.27 total */}
        <mesh position={[0, -0.135, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.174, 4, seg]} />
          <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.66} />
        </mesh>

        <group ref={handRef} position={[0, -0.27, 0]}>
          {/* palm: flattened along local Z so ±Z is the palm normal */}
          <mesh scale={[1, 1.45, 0.42]} castShadow>
            <sphereGeometry args={[0.055, seg, seg]} />
            <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.7} />
          </mesh>
          {/* fingers mass */}
          <mesh position={[0, -0.062, 0]} scale={[0.94, 0.5, 0.36]}>
            <sphereGeometry args={[0.05, seg, Math.round(seg * 0.7)]} />
            <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.7} />
          </mesh>
          {/* thumb */}
          <mesh position={[side * -0.042, -0.006, 0.018]} rotation={[0, 0, side * 0.7]}>
            <capsuleGeometry args={[0.014, 0.03, 3, 8]} />
            <meshStandardMaterial color={SCENE_COLORS.skin} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}