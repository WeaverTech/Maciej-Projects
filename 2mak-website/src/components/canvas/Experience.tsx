"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { WorkshopEnvironment } from "./WorkshopEnvironment";
import { LogoMark } from "./models/LogoMark";
import { CadWireframe } from "./models/CadWireframe";
import { ScaraRobot } from "./models/ScaraRobot";
import { MachineStation } from "./models/MachineStation";
import { PostFX } from "./PostFX";
import { INITIAL_CAMERA } from "@/lib/sceneConfig";

/**
 * Główny komponent sceny 3D — jedna ciągła scena (wirtualna hala montażowa).
 *
 * Canvas jest przypięty do viewportu (`fixed inset-0`), a scrollowanie
 * dokumentu nie przewija canvasa — zamiast tego CameraRig mapuje pozycję
 * scrolla na przelot kamery między stanowiskami hali.
 */
export function Experience() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        // Kamera startowa = ujęcie Hero (szeroki kąt na halę).
        camera={{
          position: INITIAL_CAMERA.position,
          fov: INITIAL_CAMERA.fov,
          near: 0.1,
          far: 120,
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        shadows
      >
        {/* Industrialna mgła — grafitowe tło "rozpuszcza" głąb hali. */}
        <color attach="background" args={["#16181c"]} />
        <fog attach="fog" args={["#16181c", 14, 55]} />

        <Suspense fallback={null}>
          {/* Reżyseria kamery sterowana scrollem (GSAP ScrollTrigger). */}
          <CameraRig />

          {/* Hala: podłoga, słupy, oświetlenie punktowe. */}
          <WorkshopEnvironment />

          {/* Scena 0 — logo 2MaK unoszące się w centrum hali. */}
          <LogoMark position={[0, 2.4, 4]} />

          {/* Scena 1 — wireframe detalu CAD na pierwszym stanowisku. */}
          <CadWireframe position={[-1.4, 1.6, 3.4]} />

          {/* Sceny 2 i 3 — robot SCARA (Exploded View) + stanowisko maszyn. */}
          <ScaraRobot position={[0, 0.55, -4.4]} />
          <MachineStation position={[2.2, 0, -4.8]} />

          {/* Scena 4 — Depth of Field sterowany scrollem. */}
          <PostFX />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
