"use client";

import { Header } from "./Header";
import { HeroSection } from "./sections/HeroSection";
import { CadSection } from "./sections/CadSection";
import { PrintSection } from "./sections/PrintSection";
import { MachinesSection } from "./sections/MachinesSection";
import { ContactSection } from "./sections/ContactSection";

/**
 * UIOverlay — warstwa HTML nałożona na Canvas 3D (absolutne pozycjonowanie).
 *
 * Każda sekcja jest przypięta (pinned) przez własny ScrollTrigger do
 * odpowiedniego zakresu scrolla i wykonuje fade-in / fade-out, podczas gdy
 * kamera 3D dojeżdża do właściwego stanowiska hali. `pointer-events-none`
 * na kontenerze + `pointer-events-auto` na interaktywnych elementach
 * pozwala scrollować "przez" overlay.
 */
export function UIOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <Header />
      <HeroSection />
      <CadSection />
      <PrintSection />
      <MachinesSection />
      <ContactSection />
    </div>
  );
}
