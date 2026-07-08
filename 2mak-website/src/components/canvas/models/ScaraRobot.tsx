"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

/**
 * ScaraRobot — model prototypowego robota SCARA z efektem "Exploded View".
 *
 * === Jak działa Exploded View ===
 * 1. Każda ruchoma część złożenia to ODDZIELNY mesh/grupa z własnym
 *    punktem zerowym (pivot) w pozycji "złożonej" (`closedPosition`).
 * 2. Dla każdej części definiujemy `explodeOffset` — wektor rozsunięcia
 *    wzdłuż jej osi montażowej (elementy PET-G rozchodzą się promieniowo,
 *    wałki z włókna węglowego wysuwają się wzdłuż własnych osi).
 * 3. GSAP (CameraRig) tweenuje pojedynczą wartość `scrollState.scaraExplode`
 *    w zakresie 0..1 zgodnie ze scrollem (Scena 2: 0→1, Scena 3: 1→0).
 * 4. `useFrame` co klatkę interpoluje pozycję każdej części:
 *       position = closedPosition + explodeOffset * easedProgress
 *    — bez re-renderów Reacta, czysta mutacja transformacji Three.js.
 *
 * === Wersja docelowa (asset .glb) ===
 * Ten sam mechanizm działa 1:1 z plikiem GLTF: zamiast proceduralnych
 * meshy używamy `useGLTF("/models/scara.glb")` i mapujemy `nodes.<NazwaMesha>`
 * na wpisy PARTS (patrz komentarz na końcu pliku). Warunek z briefu:
 * każdy ruchomy element w pliku .glb musi być osobnym meshem
 * z poprawnym pivotem.
 */

interface ScaraPart {
  name: string;
  /** Pozycja części w stanie złożonym (lokalnie, względem grupy robota). */
  closedPosition: [number, number, number];
  /** Wektor rozsunięcia wzdłuż osi montażowej tej części. */
  explodeOffset: [number, number, number];
  /** Opcjonalny dodatkowy obrót podczas rozsuwania (rad) — dodaje dynamiki. */
  explodeRotation?: [number, number, number];
  geometry: "cylinder" | "box";
  /** Argumenty geometrii placeholderowej. */
  args: number[];
  /** 'petg' = wydruk FDM (matowy), 'carbon' = wałek węglowy (ciemny połysk). */
  material: "petg" | "carbon" | "steel" | "accent";
}

/**
 * Rozpiska złożenia. Kolejność od podstawy w górę:
 * podstawa → kolumna (wałki) → ramię 1 → przegub → ramię 2 → oś Z → efektor.
 */
const PARTS: ScaraPart[] = [
  {
    name: "base",
    closedPosition: [0, 0.1, 0],
    explodeOffset: [0, -0.35, 0], // podstawa osiada w dół
    geometry: "box",
    args: [1.1, 0.2, 0.9],
    material: "petg",
  },
  {
    name: "column-shaft-l",
    closedPosition: [-0.18, 0.75, 0],
    explodeOffset: [-0.55, 0.25, 0], // wałek wysuwa się w bok i w górę
    geometry: "cylinder",
    args: [0.045, 0.045, 1.1, 24],
    material: "carbon",
  },
  {
    name: "column-shaft-r",
    closedPosition: [0.18, 0.75, 0],
    explodeOffset: [0.55, 0.25, 0],
    geometry: "cylinder",
    args: [0.045, 0.045, 1.1, 24],
    material: "carbon",
  },
  {
    name: "column-housing",
    closedPosition: [0, 0.75, 0],
    explodeOffset: [0, 0.55, 0], // obudowa PET-G unosi się nad wałkami
    explodeRotation: [0, Math.PI / 6, 0],
    geometry: "box",
    args: [0.5, 1.05, 0.45],
    material: "petg",
  },
  {
    name: "arm-1",
    closedPosition: [0.55, 1.32, 0],
    explodeOffset: [0.85, 0.4, 0], // ramię odchodzi wzdłuż swojej osi
    geometry: "box",
    args: [1.15, 0.16, 0.3],
    material: "petg",
  },
  {
    name: "joint-bearing",
    closedPosition: [1.1, 1.32, 0],
    explodeOffset: [1.05, 0.85, 0], // łożysko przegubu — osobny mesh
    explodeRotation: [Math.PI / 2, 0, 0],
    geometry: "cylinder",
    args: [0.11, 0.11, 0.22, 24],
    material: "steel",
  },
  {
    name: "arm-2",
    closedPosition: [1.62, 1.28, 0],
    explodeOffset: [1.35, 0.15, 0.45],
    geometry: "box",
    args: [0.95, 0.13, 0.24],
    material: "petg",
  },
  {
    name: "z-axis-shaft",
    closedPosition: [2.05, 1.05, 0],
    explodeOffset: [1.5, -0.35, 0.75], // oś Z wysuwa się wzdłuż pionu
    geometry: "cylinder",
    args: [0.035, 0.035, 0.75, 20],
    material: "carbon",
  },
  {
    name: "effector",
    closedPosition: [2.05, 0.62, 0],
    explodeOffset: [1.65, -0.75, 1.0], // efektor — akcent pomarańczowy
    geometry: "cylinder",
    args: [0.09, 0.05, 0.18, 20],
    material: "accent",
  },
];

/** Easing rozsuwania — łagodne wejście/wyjście mimo liniowego scrubu. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const MATERIALS: Record<ScaraPart["material"], THREE.MeshStandardMaterial> = {
  // PET-G: matowy wydruk FDM (delikatna szorstkość warstw).
  petg: new THREE.MeshStandardMaterial({
    color: "#5b636d",
    roughness: 0.75,
    metalness: 0.1,
  }),
  // Włókno węglowe: bardzo ciemne, satynowy połysk.
  carbon: new THREE.MeshStandardMaterial({
    color: "#15171a",
    roughness: 0.35,
    metalness: 0.6,
  }),
  steel: new THREE.MeshStandardMaterial({
    color: "#9aa3ad",
    roughness: 0.4,
    metalness: 0.9,
  }),
  // Zgaszony techniczny pomarańcz — wyłącznie kluczowe detale.
  accent: new THREE.MeshStandardMaterial({
    color: "#d9742b",
    roughness: 0.5,
    metalness: 0.3,
  }),
};

export function ScaraRobot(props: React.ComponentProps<"group">) {
  const partRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Prekomputacja wektorów, by nie alokować obiektów w pętli renderowania.
  const vectors = useMemo(
    () =>
      PARTS.map((p) => ({
        closed: new THREE.Vector3(...p.closedPosition),
        offset: new THREE.Vector3(...p.explodeOffset),
        rotation: new THREE.Euler(...(p.explodeRotation ?? [0, 0, 0])),
      })),
    []
  );

  useFrame(() => {
    const t = easeInOutCubic(THREE.MathUtils.clamp(scrollState.scaraExplode, 0, 1));

    PARTS.forEach((_, i) => {
      const mesh = partRefs.current[i];
      if (!mesh) return;
      const { closed, offset, rotation } = vectors[i];

      // position = closedPosition + explodeOffset * t
      mesh.position.set(
        closed.x + offset.x * t,
        closed.y + offset.y * t,
        closed.z + offset.z * t
      );
      mesh.rotation.set(rotation.x * t, rotation.y * t, rotation.z * t);
    });
  });

  return (
    <group {...props}>
      {PARTS.map((part, i) => (
        <mesh
          key={part.name}
          name={part.name}
          ref={(el) => {
            partRefs.current[i] = el;
          }}
          position={part.closedPosition}
          material={MATERIALS[part.material]}
          castShadow
          receiveShadow
        >
          {part.geometry === "cylinder" ? (
            <cylinderGeometry
              args={part.args as [number, number, number, number]}
            />
          ) : (
            <boxGeometry args={part.args as [number, number, number]} />
          )}
        </mesh>
      ))}
    </group>
  );
}

/*
 * === Migracja na finalny asset .glb ===
 *
 * import { useGLTF } from "@react-three/drei";
 *
 * const { nodes } = useGLTF("/models/scara.glb");
 * // nodes.Base, nodes.ColumnShaftL, nodes.Arm1, ... — nazwy meshy z Blendera.
 * // Zastępujemy <mesh geometry=...> przez:
 * //   <mesh geometry={(nodes.Arm1 as THREE.Mesh).geometry}
 * //         material={(nodes.Arm1 as THREE.Mesh).material} ... />
 * // `closedPosition` odczytujemy z nodes.<X>.position (pivot z pliku),
 * // a `explodeOffset` pozostaje zdefiniowany tutaj — to decyzja reżyserska.
 * //
 * // useGLTF.preload("/models/scara.glb");
 */
