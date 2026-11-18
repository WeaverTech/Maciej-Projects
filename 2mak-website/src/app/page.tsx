"use client";

import dynamic from "next/dynamic";
import { UIOverlay } from "@/components/ui/UIOverlay";
import { TOTAL_SCROLL_VIEWPORTS } from "@/lib/sceneConfig";

// Canvas 3D renderuje się wyłącznie w przeglądarce (WebGL, brak SSR).
const Experience = dynamic(
  () => import("@/components/canvas/Experience").then((m) => m.Experience),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative">
      {/*
        Warstwa 1 — Canvas 3D przypięty do viewportu (fixed).
        Warstwa 2 — UIOverlay: sekcje HTML przewijane "nad" sceną.
        Wysokość dokumentu (spacer) definiuje długość scrollytellingu.
      */}
      <Experience />
      <UIOverlay />

      {/* Spacer nadający stronie fizyczną wysokość scrolla. */}
      <div
        aria-hidden
        style={{ height: `${TOTAL_SCROLL_VIEWPORTS * 100}vh` }}
      />
    </main>
  );
}
