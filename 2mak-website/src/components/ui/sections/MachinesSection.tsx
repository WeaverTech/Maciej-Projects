"use client";

import { useSectionReveal } from "../useSectionReveal";

/** Scena 3 — Budowa maszyn: montaż, pasowania, metrologia. */
export function MachinesSection() {
  const ref = useSectionReveal(3);

  return (
    <section
      ref={ref}
      className="absolute inset-0 flex items-center opacity-0"
    >
      <div className="ml-6 max-w-md md:ml-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          03 / Budowa maszyn
        </p>
        <h2 className="mt-3 text-3xl font-light text-blueprint md:text-4xl">
          Montaż z dokładnością pasowania
        </h2>
        <div className="tech-rule mt-4 w-full" />
        <p className="mt-5 text-left font-mono text-sm leading-relaxed text-steel-light">
          Kompletne układy mechaniczne wraz ze sterowaniem przemysłowym.
          Precyzyjny montaż z tolerancjami pasowania rzędu{" "}
          <span className="text-accent">0.016&nbsp;mm</span>, potwierdzany
          kontrolami metrologicznymi na każdym etapie budowy.
        </p>
        <ul className="mt-5 space-y-1.5 font-mono text-xs text-steel-light">
          <li>— montaż zespołów mechanicznych</li>
          <li>— integracja sterowników przemysłowych</li>
          <li>— pomiary i protokoły metrologiczne</li>
        </ul>
      </div>
    </section>
  );
}
