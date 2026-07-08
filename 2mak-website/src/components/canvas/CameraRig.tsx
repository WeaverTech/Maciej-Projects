"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  INITIAL_CAMERA,
  SCENES,
  computeSceneRanges,
} from "@/lib/sceneConfig";
import { scrollState } from "@/lib/scrollState";

/**
 * CameraRig — serce scrollytellingu.
 *
 * Architektura:
 *  1. GSAP timeline (poza Reactem) tweenuje ZWYKŁE obiekty-proxy
 *     (`camProxy`, `targetProxy`, `scrollState`) — nie dotyka kamery
 *     bezpośrednio i nie wywołuje re-renderów.
 *  2. ScrollTrigger ze `scrub` mapuje pozycję scrolla dokumentu
 *     na postęp timeline'u (0..1).
 *  3. `useFrame` co klatkę przepisuje wartości proxy na kamerę R3F
 *     z dodatkowym wygładzeniem (damping), dzięki czemu nawet skokowy
 *     scroll (kółko myszy) daje filmowy, płynny przelot.
 *
 * Punkt patrzenia (`target`) jest animowany NIEZALEŻNIE od pozycji,
 * co pozwala np. w Scenie 3 wykonać obrót kamery o 90° wokół stanowiska.
 */
export function CameraRig() {
  // Proxy tweenowane przez GSAP (wartości "docelowe" dla danej pozycji scrolla).
  const camProxy = useRef({
    x: INITIAL_CAMERA.position[0],
    y: INITIAL_CAMERA.position[1],
    z: INITIAL_CAMERA.position[2],
    fov: INITIAL_CAMERA.fov,
  });
  const targetProxy = useRef({
    x: INITIAL_CAMERA.target[0],
    y: INITIAL_CAMERA.target[1],
    z: INITIAL_CAMERA.target[2],
  });

  // Wygładzone (dampowane) wartości faktycznie ustawiane na kamerze.
  const smoothedPos = useRef(new THREE.Vector3(...INITIAL_CAMERA.position));
  const smoothedTarget = useRef(new THREE.Vector3(...INITIAL_CAMERA.target));

  useGSAP(() => {
    const ranges = computeSceneRanges(); // [hero, scena1..scena4]

    // Jeden master-timeline o umownym czasie trwania 1 (postęp 0..1).
    const tl = gsap.timeline({
      defaults: { ease: "none" }, // przy scrub easing daje sam damping w useFrame
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true, // twarde przypięcie timeline'u do scrolla
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        },
      },
    });

    // --- Sceny 1..4: przelot kamery między waypointami --------------------
    SCENES.forEach((scene, i) => {
      const { start, end } = ranges[i + 1]; // ranges[0] to Hero (kamera stoi)
      const duration = end - start;

      tl.to(
        camProxy.current,
        {
          x: scene.camera.position[0],
          y: scene.camera.position[1],
          z: scene.camera.position[2],
          fov: scene.camera.fov,
          duration,
        },
        start
      );
      tl.to(
        targetProxy.current,
        {
          x: scene.camera.target[0],
          y: scene.camera.target[1],
          z: scene.camera.target[2],
          duration,
        },
        start
      );
    });

    // --- Scena 2: rozsunięcie SCARA (Exploded View) -----------------------
    // Rozsuwanie zajmuje środkowe 80% zakresu sceny 2.
    const s2 = ranges[2];
    tl.to(
      scrollState,
      {
        scaraExplode: 1,
        duration: (s2.end - s2.start) * 0.8,
      },
      s2.start + (s2.end - s2.start) * 0.1
    );

    // --- Scena 3: złożenie zjeżdża się z powrotem -------------------------
    const s3 = ranges[3];
    tl.to(
      scrollState,
      {
        scaraExplode: 0,
        duration: (s3.end - s3.start) * 0.6,
      },
      s3.start
    );

    // --- Scena 4: wznoszenie + narastające rozmycie (Depth of Field) ------
    const s4 = ranges[4];
    tl.to(
      scrollState,
      {
        dofIntensity: 1,
        duration: s4.end - s4.start,
      },
      s4.start
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  });

  useFrame((state, delta) => {
    // Kamera pobierana wewnątrz pętli renderowania — mutacje transformacji
    // obiektów Three.js w useFrame to standardowy wzorzec R3F.
    const camera = state.camera as THREE.PerspectiveCamera;

    // Damping niezależny od FPS: alpha = 1 - exp(-lambda * dt).
    const alpha = 1 - Math.exp(-5.5 * delta);

    smoothedPos.current.lerp(
      new THREE.Vector3(
        camProxy.current.x,
        camProxy.current.y,
        camProxy.current.z
      ),
      alpha
    );
    smoothedTarget.current.lerp(
      new THREE.Vector3(
        targetProxy.current.x,
        targetProxy.current.y,
        targetProxy.current.z
      ),
      alpha
    );

    camera.position.copy(smoothedPos.current);
    camera.lookAt(smoothedTarget.current);

    if (Math.abs(camera.fov - camProxy.current.fov) > 0.01) {
      camera.fov += (camProxy.current.fov - camera.fov) * alpha;
      camera.updateProjectionMatrix();
    }
  });

  // Po zmianie rozmiaru okna ScrollTrigger musi przeliczyć zakresy.
  useGSAP(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  return null;
}
