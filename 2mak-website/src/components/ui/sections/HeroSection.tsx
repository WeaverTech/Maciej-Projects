"use client";

import { useSectionReveal } from "../useSectionReveal";

/** Scena 0 — Hero: nagłówek + pulsująca ikona scrolla "Eksploruj". */
export function HeroSection() {
  const ref = useSectionReveal(0);

  return (
    <section
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center"
    >
      <h1 className="max-w-3xl px-6 text-4xl font-light tracking-tight text-blueprint md:text-6xl">
        Precyzja w każdym wymiarze
      </h1>
      <p className="mt-4 max-w-md px-6 font-mono text-sm text-steel-light">
        Projektowanie CAD · Druk 3D · Budowa maszyn
      </p>

      <div className="mt-14 flex flex-col items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-steel-light">
          Eksploruj
        </span>
        <svg
          className="animate-scroll-pulse h-6 w-6 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
