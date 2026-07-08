"use client";

import { useSectionReveal } from "../useSectionReveal";
import { QuickQuoteForm } from "../QuickQuoteForm";

/**
 * Scena 4 — Finalizacja i Kontakt.
 * Kamera jest w widoku "z lotu ptaka" z aktywnym Depth of Field,
 * a nad rozmytą sceną pojawia się sekcja kontaktowa z modułem
 * "Szybka wycena" (Drag & Drop plików .step / .stl).
 */
export function ContactSection() {
  const ref = useSectionReveal(4);

  return (
    <section
      ref={ref}
      className="absolute inset-0 flex items-center justify-center overflow-y-auto opacity-0"
    >
      <div className="pointer-events-auto mx-6 grid w-full max-w-5xl gap-10 py-24 md:grid-cols-2 md:gap-16">
        {/* Kolumna 1 — dane kontaktowe */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            04 / Kontakt
          </p>
          <h2 className="mt-3 text-3xl font-light text-blueprint md:text-5xl">
            Zrealizujmy Twój projekt
          </h2>
          <div className="tech-rule mt-4 w-full" />

          <div className="mt-8 space-y-4 font-mono text-sm text-steel-light">
            <a
              href="mailto:kontakt@2mak.pl"
              className="block transition-colors hover:text-accent"
            >
              kontakt@2mak.pl
            </a>
            <a
              href="https://instagram.com/2mak"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-accent"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              @2mak — zobacz nasze realizacje
            </a>
          </div>

          <p className="mt-10 max-w-sm font-mono text-xs leading-relaxed text-steel">
            Wgraj model w formularzu obok — przeanalizujemy geometrię
            i&nbsp;odezwiemy się z wyceną oraz rekomendacją technologii.
          </p>
        </div>

        {/* Kolumna 2 — formularz szybkiej wyceny */}
        <QuickQuoteForm />
      </div>
    </section>
  );
}
