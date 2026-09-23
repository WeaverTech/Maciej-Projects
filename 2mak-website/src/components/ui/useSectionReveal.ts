"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { computeSceneRanges } from "@/lib/sceneConfig";

/**
 * useSectionReveal — synchronizuje widoczność sekcji HTML z zakresem
 * scrolla jej sceny 3D (te same zakresy, których używa CameraRig).
 *
 * `sceneIndex`: 0 = Hero, 1..4 = Sceny 1..4.
 *
 * Sekcja robi fade-in gdy kamera dojeżdża do stanowiska (ostatnie 40%
 * dojazdu) i fade-out gdy rusza dalej — z wyjątkiem ostatniej sceny,
 * która pozostaje widoczna (sekcja kontaktowa).
 */
export function useSectionReveal(sceneIndex: number) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const ranges = computeSceneRanges();
      const { start, end } = ranges[sceneIndex];
      const isLast = sceneIndex === ranges.length - 1;
      const isFirst = sceneIndex === 0;

      const scrollLength = () =>
        document.documentElement.scrollHeight - window.innerHeight;

      // Fade-in: końcówka dojazdu kamery do stanowiska.
      const fadeInStart = isFirst ? 0 : start + (end - start) * 0.45;
      const fadeInEnd = isFirst ? 0.001 : start + (end - start) * 0.75;

      gsap.fromTo(
        el,
        { autoAlpha: isFirst ? 1 : 0, y: isFirst ? 0 : 40 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          immediateRender: true,
          scrollTrigger: {
            start: () => scrollLength() * fadeInStart,
            end: () => scrollLength() * fadeInEnd,
            scrub: true,
          },
        }
      );

      // Fade-out: kamera opuszcza stanowisko (poza ostatnią sekcją).
      if (!isLast) {
        const nextRange = ranges[sceneIndex + 1];
        gsap.to(el, {
          autoAlpha: 0,
          y: -30,
          ease: "none",
          scrollTrigger: {
            start: () => scrollLength() * nextRange.start,
            end: () =>
              scrollLength() *
              (nextRange.start + (nextRange.end - nextRange.start) * 0.3),
            scrub: true,
          },
        });
      }
    },
    { scope: ref }
  );

  return ref;
}
