"use client";

import { useSectionReveal } from "../useSectionReveal";

/** Scena 1 — Projektowanie CAD: tekst fade-in z lewej strony. */
export function CadSection() {
  const ref = useSectionReveal(1);

  return (
    <section
      ref={ref}
      className="absolute inset-0 flex items-center opacity-0"
    >
      <div className="ml-6 max-w-md md:ml-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          01 / Projektowanie CAD
        </p>
        <h2 className="mt-3 text-3xl font-light text-blueprint md:text-4xl">
          Od koncepcji do dokumentacji
        </h2>
        <div className="tech-rule mt-4 w-full" />
        <p className="mt-5 text-left font-mono text-sm leading-relaxed text-steel-light">
          Modelowanie parametryczne 3D, złożenia wieloelementowe i pełna
          dokumentacja wykonawcza. Symulacje kinematyczne pozwalają
          zweryfikować ruch mechanizmu, zanim powstanie pierwszy prototyp.
        </p>
        <ul className="mt-5 space-y-1.5 font-mono text-xs text-steel-light">
          <li>— modele bryłowe i powierzchniowe</li>
          <li>— symulacje kinematyczne mechanizmów</li>
          <li>— rysunki wykonawcze i złożeniowe</li>
        </ul>
      </div>
    </section>
  );
}
