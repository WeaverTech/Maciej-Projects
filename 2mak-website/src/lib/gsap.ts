"use client";

/**
 * Pojedynczy punkt rejestracji GSAP.
 * Każdy komponent importuje gsap / ScrollTrigger / useGSAP stąd,
 * dzięki czemu pluginy są rejestrowane dokładnie raz i tylko w przeglądarce.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
