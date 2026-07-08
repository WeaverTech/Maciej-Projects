"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Wirtualna hala montażowa — industrialne tło całej podróży kamery.
 *
 * Estetyka: grafit / antracyt / matowa stal + punktowe oświetlenie
 * wyciągające detale stanowisk (zgodnie z wytycznymi wizualnymi).
 * Geometria jest proceduralna (placeholder) — docelowo można ją
 * zastąpić zoptymalizowanym `.glb` hali, zachowując te same światła.
 */
export function WorkshopEnvironment() {
  const steelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2b2f36",
        roughness: 0.85,
        metalness: 0.5,
      }),
    []
  );

  // Pozycje słupów konstrukcyjnych hali wzdłuż osi przelotu kamery.
  const pillars = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let z = 8; z >= -12; z -= 4) {
      list.push([-6, 2.5, z], [6, 2.5, z]);
    }
    return list;
  }, []);

  return (
    <group>
      {/* Podłoga hali — matowa stal z lekkim odbiciem świateł punktowych. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#1c1f24" roughness={0.9} metalness={0.4} />
      </mesh>

      {/* Techniczna siatka na podłodze (rysunek warsztatowy). */}
      <gridHelper
        args={[40, 40, "#3a4048", "#22262c"]}
        position={[0, 0.01, -2]}
      />

      {/* Słupy konstrukcyjne. */}
      {pillars.map((p, i) => (
        <mesh key={i} position={p} material={steelMaterial} castShadow>
          <boxGeometry args={[0.35, 5, 0.35]} />
        </mesh>
      ))}

      {/* Bardzo słabe światło ogólne — hala ma pozostać mroczna. */}
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#3a4048", "#101216", 0.25]} />

      {/* Światła punktowe nad stanowiskami (Hero / CAD / SCARA / maszyny). */}
      <spotLight
        position={[0, 7, 5]}
        angle={0.5}
        penumbra={0.6}
        intensity={90}
        color="#dfe6ee"
        castShadow
      />
      <spotLight
        position={[-2, 5, 3.5]}
        angle={0.45}
        penumbra={0.7}
        intensity={55}
        color="#cfd9e4"
      />
      <spotLight
        position={[0.5, 6, -4.5]}
        angle={0.5}
        penumbra={0.6}
        intensity={80}
        color="#e8eef5"
        castShadow
      />
      {/* Akcent — zgaszony pomarańcz odbity od stanowiska maszyn. */}
      <pointLight position={[3.5, 1.5, -5.5]} intensity={8} color="#d9742b" />
    </group>
  );
}
