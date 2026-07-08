"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * MachineStation — Scena 3: otoczenie gotowego układu mechanicznego.
 * Placeholder: szafa sterownicza + sterowniki przemysłowe (PLC) z diodami.
 * Docelowo do zastąpienia assetem .glb stanowiska.
 */
export function MachineStation(props: React.ComponentProps<"group">) {
  const cabinetMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#262a30",
        roughness: 0.6,
        metalness: 0.7,
      }),
    []
  );

  return (
    <group {...props}>
      {/* Szafa sterownicza. */}
      <mesh position={[0, 0.9, 0]} material={cabinetMaterial} castShadow>
        <boxGeometry args={[0.9, 1.8, 0.5]} />
      </mesh>

      {/* Rząd sterowników przemysłowych (moduły na szynie DIN). */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.25 + i * 0.25, 1.25, 0.27]}>
          <mesh>
            <boxGeometry args={[0.2, 0.3, 0.06]} />
            <meshStandardMaterial color="#3a4048" roughness={0.5} />
          </mesh>
          {/* Dioda statusu — jedyny dopuszczalny akcent kolorystyczny. */}
          <mesh position={[0, 0.09, 0.035]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshBasicMaterial color={i === 1 ? "#d9742b" : "#5f6a75"} />
          </mesh>
        </group>
      ))}

      {/* Stół montażowy obok szafy. */}
      <mesh position={[-1.4, 0.45, 0.2]} material={cabinetMaterial} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.9]} />
      </mesh>
      {[-0.7, 0.7].map((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[-1.4 + x, 0.2, 0.2 + z]}
            material={cabinetMaterial}
          >
            <boxGeometry args={[0.06, 0.42, 0.06]} />
          </mesh>
        ))
      )}
    </group>
  );
}
