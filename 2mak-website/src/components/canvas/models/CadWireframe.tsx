"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * CadWireframe — Scena 1: unosząca się siatka przestrzenna detalu,
 * symulująca widok ze środowiska projektowego CAD.
 *
 * Placeholder: TorusKnot w trybie wireframe + wolna rotacja "turntable".
 * Docelowo: wireframe rzeczywistego detalu z .glb (EdgesGeometry
 * daje czystszy efekt "rysunku technicznego" niż wireframe trójkątów).
 */
export function CadWireframe(props: React.ComponentProps<"group">) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.25; // turntable jak w CAD
    group.current.position.y =
      (props.position as [number, number, number])[1] +
      Math.sin(state.clock.elapsedTime * 0.9) * 0.05;
  });

  return (
    <group {...props} ref={group}>
      <mesh>
        <torusKnotGeometry args={[0.45, 0.16, 140, 20]} />
        <meshBasicMaterial color="#8b939e" wireframe transparent opacity={0.55} />
      </mesh>
      {/* Oś układu współrzędnych detalu — akcent inżynieryjny. */}
      <axesHelper args={[0.7]} />
    </group>
  );
}
