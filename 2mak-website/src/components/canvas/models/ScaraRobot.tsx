"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

/**
 * ScaraRobot — rzeczywisty model robota SCARA (SCARA_FRAME_V2) z efektem
 * "Exploded View", sterowanym scrollem.
 *
 * Asset: public/models/scara.glb — konwersja ze złożenia STEP (Fusion 360)
 * przez OpenCascade, zoptymalizowana (simplify + quantize + meshopt,
 * ~16 MB STEP → ~1.2 MB GLB). Hierarchia i nazwy komponentów złożenia
 * są zachowane, dzięki czemu każda część rozsuwa się osobno.
 *
 * === Jak działa Exploded View ===
 * 1. Po załadowaniu GLB zbieramy listę części: bezpośrednie dzieci roota
 *    (rama: profile alu, płyty, wałki, NEMA17...) oraz — drugi poziom —
 *    dzieci podzespołu ramienia ("ar, ..."): przekładnie cykloidalne,
 *    płyty osi, śruby.
 * 2. Każda część dostaje wektor rozsunięcia: reguły nazwane dla kluczowych
 *    komponentów (ramię zsuwa się z prowadnic, silnik i płyty po osi
 *    pionowej), a dla reszty kierunek promieniowy od środka złożenia.
 * 3. GSAP (CameraRig) tweenuje `scrollState.scaraExplode` 0..1 zgodnie
 *    ze scrollem (Scena 2: rozsuwanie, Scena 3: składanie).
 * 4. `useFrame` co klatkę ustawia: position = base + offset * ease(t) —
 *    czysta mutacja transformacji Three.js, zero re-renderów Reacta.
 *
 * Uwaga: model z Fusion jest w układzie Z-up (mm→m), stąd rotacja -90°
 * wokół X i skala dobrana do wirtualnej hali.
 */

const MODEL_URL = "/models/scara.glb";
const MODEL_SCALE = 3;

interface ExplodingPart {
  object: THREE.Object3D;
  /** Pozycja części w stanie złożonym (lokalna, względem rodzica). */
  base: THREE.Vector3;
  /** Wektor rozsunięcia w przestrzeni lokalnej rodzica (metry modelu). */
  offset: THREE.Vector3;
}

/** Easing rozsuwania — łagodne wejście/wyjście mimo liniowego scrubu. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Reguły rozsunięcia dla komponentów ramy (poziom 1).
 * Nazwy są sanityzowane przez GLTFLoader (spacje → "_", ":" usunięte),
 * dlatego dopasowujemy po fragmentach.
 */
function frameOffset(obj: THREE.Object3D, center: THREE.Vector3): THREE.Vector3 {
  const n = obj.name;

  // Całe ramię SCARA zsuwa się z pionowych prowadnic w bok.
  if (n.startsWith("ar,")) return new THREE.Vector3(0.34, 0, 0.1);
  // Silnik osi Z + mocowanie — w górę, wzdłuż osi napędu.
  if (n.includes("NEMA17") || n.includes("Nema_17"))
    return new THREE.Vector3(0, 0, 0.3);
  if (n.includes("Shaft_Plate_Top")) return new THREE.Vector3(0, 0, 0.22);
  if (n.includes("Shaft_Plate")) return new THREE.Vector3(0, 0, -0.18);
  // Wałki prowadnic 8 mm — wysuwają się wzdłuż własnej osi (pion).
  if (n.includes("ugo")) return new THREE.Vector3(0, 0, 0.4); // "Długość"
  // Koła pasowe GT2 i nakrętki wałka — wzdłuż osi wałka.
  if (n.includes("GT2") || n.includes("locking_nut"))
    return new THREE.Vector3(0, -0.2, 0);

  // Domyślnie: promieniowo od środka złożenia (profile ramy, wsporniki...).
  const dir = obj.position.clone().sub(center);
  dir.z *= 0.4; // spłaszczamy kierunek, żeby rama rozchodziła się na boki
  if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
  return dir.normalize().multiplyScalar(0.16);
}

/** Reguły rozsunięcia wewnątrz podzespołu ramienia (poziom 2). */
function armOffset(obj: THREE.Object3D, center: THREE.Vector3): THREE.Vector3 {
  const n = obj.name;

  // Drugi człon ramienia (Axis2) — dalej wzdłuż wysięgu.
  if (n.includes("Axis2")) return new THREE.Vector3(0.18, 0, 0.05);
  // Przekładnie cykloidalne — w dół, wzdłuż osi przegubów.
  if (n.includes("Cycloidal")) return new THREE.Vector3(0, 0, -0.14);
  if (n.includes("Axis1_Plate_Top")) return new THREE.Vector3(0, 0, 0.1);
  if (n.includes("Axis1_Plate_Btm")) return new THREE.Vector3(0, 0, -0.1);
  // Śruby i nakrętki — delikatnie, promieniowo.
  const isFastener = n.includes("ruba") || n.includes("Nakr");
  const dir = obj.position.clone().sub(center);
  if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
  return dir.normalize().multiplyScalar(isFastener ? 0.07 : 0.1);
}

function centroidOf(objects: THREE.Object3D[]) {
  const c = new THREE.Vector3();
  objects.forEach((o) => c.add(o.position));
  return c.divideScalar(Math.max(objects.length, 1));
}

export function ScaraRobot(props: React.ComponentProps<"group">) {
  const { scene } = useGLTF(MODEL_URL);
  const partsRef = useRef<ExplodingPart[]>([]);

  useMemo(() => {
    // Materiały z Fusion mają tylko baseColor (domyślny metallic=1 dałby
    // "czarny chrom" w ciemnej hali) — nadajemy im matowy, techniczny PBR.
    const seen = new Set<THREE.Material>();
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const m = o.material as THREE.MeshStandardMaterial;
      if (m && !seen.has(m)) {
        seen.add(m);
        m.metalness = 0.35;
        m.roughness = 0.55;
      }
    });

    // Poziom 1: bezpośrednie dzieci roota złożenia (rama + podzespół ramienia).
    const root = scene.children[0] ?? scene;
    const frameParts = root.children;
    const frameCenter = centroidOf(frameParts);

    const parts: ExplodingPart[] = frameParts.map((obj) => ({
      object: obj,
      base: obj.position.clone(),
      offset: frameOffset(obj, frameCenter),
    }));

    // Poziom 2: wnętrze podzespołu ramienia ("ar, ...").
    const arm = frameParts.find((o) => o.name.startsWith("ar,"));
    if (arm) {
      const armCenter = centroidOf(arm.children);
      arm.children.forEach((obj) => {
        parts.push({
          object: obj,
          base: obj.position.clone(),
          offset: armOffset(obj, armCenter),
        });
      });
    }

    partsRef.current = parts;
  }, [scene]);

  useFrame(() => {
    const t = easeInOutCubic(
      THREE.MathUtils.clamp(scrollState.scaraExplode, 0, 1)
    );
    for (const { object, base, offset } of partsRef.current) {
      object.position.set(
        base.x + offset.x * t,
        base.y + offset.y * t,
        base.z + offset.z * t
      );
    }
  });

  return (
    <group {...props}>
      {/* Z-up (Fusion) → Y-up (three.js); lekki obrót frontem do kamery. */}
      <group rotation={[-Math.PI / 2, 0, 0.6]} scale={MODEL_SCALE}>
        {/* Wycentrowanie złożenia względem punktu wstawienia grupy. */}
        <group position={[-0.2, 0.08, 0]}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
