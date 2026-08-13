"use client";

import { useState } from "react";
import { computeSceneRanges } from "@/lib/sceneConfig";

/**
 * Pozycje w menu wskazują indeksy scen (1..4) — sekcje HTML są `fixed`,
 * więc zamiast kotwic #id przewijamy dokument do początku zakresu
 * scrolla danej sceny (te same zakresy, których używa CameraRig).
 */
const MENU_ITEMS = [
  { label: "Projektowanie CAD", sceneIndex: 1 },
  { label: "Druk 3D", sceneIndex: 2 },
  { label: "Budowa maszyn", sceneIndex: 3 },
  { label: "Kontakt", sceneIndex: 4 },
];

export function Header() {
  const [open, setOpen] = useState(false);

  const scrollToScene = (sceneIndex: number) => {
    const ranges = computeSceneRanges();
    const { start, end } = ranges[sceneIndex];
    const scrollLength =
      document.documentElement.scrollHeight - window.innerHeight;
    // Celujemy w ~70% zakresu sceny — kamera stoi już przy stanowisku.
    window.scrollTo({
      top: scrollLength * (start + (end - start) * 0.7),
      behavior: "smooth",
    });
    setOpen(false);
  };

  return (
    <header className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="font-mono text-lg tracking-widest text-blueprint"
      >
        2MaK<span className="text-accent">.</span>
      </button>

      {/* Hamburger */}
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`h-px w-6 bg-blueprint transition-transform duration-300 ${
            open ? "translate-y-[3.5px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-px w-6 bg-blueprint transition-transform duration-300 ${
            open ? "-translate-y-[3.5px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Pełnoekranowe menu */}
      <nav
        className={`fixed inset-0 z-40 flex flex-col items-start justify-center gap-6 bg-graphite/95 px-10 backdrop-blur-sm transition-opacity duration-300 md:px-24 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollToScene(item.sceneIndex)}
            className="group flex items-baseline gap-4 font-mono text-2xl text-blueprint transition-colors hover:text-accent md:text-4xl"
          >
            <span className="text-sm text-steel-light">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
