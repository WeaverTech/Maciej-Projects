"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, DepthOfField, Vignette } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { scrollState } from "@/lib/scrollState";

/**
 * PostFX — postprocessing całej sceny.
 *
 * Depth of Field aktywuje się w Scenie 4 ("obraz lekko się rozmywa"):
 * GSAP tweenuje `scrollState.dofIntensity` (0..1), a my co klatkę
 * skalujemy bokeh — dzięki temu rozmycie narasta płynnie ze scrollem.
 */
export function PostFX() {
  const dofRef = useRef<DepthOfFieldEffect>(null);

  useFrame(() => {
    if (!dofRef.current) return;
    dofRef.current.bokehScale = scrollState.dofIntensity * 4.5;
  });

  return (
    <EffectComposer>
      <DepthOfField
        ref={dofRef}
        focusDistance={0.02}
        focalLength={0.05}
        bokehScale={0}
      />
      {/* Winieta wzmacnia industrialny, "warsztatowy" klimat kadru. */}
      <Vignette eskil={false} offset={0.2} darkness={0.75} />
    </EffectComposer>
  );
}
