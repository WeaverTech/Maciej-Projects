"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

/**
 * LogoMark — płaskie, minimalistyczne logo "2MaK" unoszące się w Hero.
 * Styl: techniczny line-art przypominający ścieżkę narzędzia (toolpath).
 *
 * Placeholder: napis + prostokątna ramka "toolpath". Docelowo można
 * podmienić na wyekstrudowaną ścieżkę SVG logo (SVGLoader + ExtrudeGeometry).
 */
export function LogoMark(props: React.ComponentProps<"group">) {
  const group = useRef<THREE.Group>(null);

  // Ramka logo rysowana liniami — jak ścieżka narzędzia CNC.
  const frameGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(-1.7, -0.55, 0),
      new THREE.Vector3(1.7, -0.55, 0),
      new THREE.Vector3(1.7, 0.55, 0),
      new THREE.Vector3(-1.7, 0.55, 0),
      new THREE.Vector3(-1.7, -0.55, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Subtelne "unoszenie się" logo w powietrzu hali.
    group.current.position.y =
      (props.position as [number, number, number])[1] + Math.sin(t * 0.8) * 0.08;
    group.current.rotation.y = Math.sin(t * 0.3) * 0.06;
  });

  return (
    <group {...props} ref={group}>
      <Text
        fontSize={0.72}
        letterSpacing={0.08}
        color="#b7c2cc"
        anchorX="center"
        anchorY="middle"
      >
        2MaK
      </Text>
      {/* Pomarańczowy akcent — kropka "punktu zerowego" przy logo. */}
      <mesh position={[1.45, 0.38, 0]}>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial color="#d9742b" />
      </mesh>
      <lineLoop geometry={frameGeometry}>
        <lineBasicMaterial color="#3a4048" />
      </lineLoop>
    </group>
  );
}
