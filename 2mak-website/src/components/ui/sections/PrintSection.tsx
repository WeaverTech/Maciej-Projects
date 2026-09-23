"use client";

import { useSectionReveal } from "../useSectionReveal";

/** Scena 2 — Druk 3D i prototypowanie (towarzyszy Exploded View robota). */
export function PrintSection() {
  const ref = useSectionReveal(2);

  return (
    <section
      ref={ref}
      className="absolute inset-0 flex items-center justify-end opacity-0"
    >
      <div className="mr-6 max-w-md md:mr-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          02 / Druk 3D i prototypowanie
        </p>
        <h2 className="mt-3 text-3xl font-light text-blueprint md:text-4xl">
          Technologie przyrostowe
        </h2>
        <div className="tech-rule mt-4 w-full" />
        <p className="mt-5 text-left font-mono text-sm leading-relaxed text-steel-light">
          FDM, SLA i MJF — technologię i materiał dobieramy do funkcji
          detalu, nie odwrotnie. Konstrukcje hybrydowe łączą wydruki
          z&nbsp;PET-G z wałkami z włókna węglowego, jak w prezentowanym
          prototypie robota SCARA.
        </p>
        <ul className="mt-5 space-y-1.5 font-mono text-xs text-steel-light">
          <li>— FDM: PET-G, ABS, PA-CF — części funkcjonalne</li>
          <li>— SLA: żywice — detale wysokiej rozdzielczości</li>
          <li>— MJF: PA12 — krótkie serie produkcyjne</li>
        </ul>
      </div>
    </section>
  );
}
