# 2MaK — interaktywna strona scrollytelling

One-pager dla firmy inżynieryjnej 2MaK (projektowanie CAD, druk 3D, budowa
maszyn). Jedna ciągła scena 3D — wirtualna hala montażowa — w której scroll
użytkownika steruje przelotem kamery między stanowiskami.

Szczegółowy plan, mapa scen i kontrakt na assety 3D: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

## Stack

- Next.js (App Router, TypeScript)
- three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- GSAP + ScrollTrigger (synchronizacja kamery i animacji ze scrollem)
- Tailwind CSS v4

## Uruchomienie

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build     # build produkcyjny
npm run lint      # ESLint
```

## Nawigacja po kodzie

- `src/lib/sceneConfig.ts` — reżyseria: waypointy kamery i wagi scrolla scen
- `src/components/canvas/CameraRig.tsx` — GSAP ScrollTrigger → kamera
- `src/components/canvas/models/ScaraRobot.tsx` — efekt Exploded View
- `src/components/ui/QuickQuoteForm.tsx` — wycena z Drag & Drop (.step/.stl)
- `src/app/api/quote/route.ts` — endpoint przyjmujący zgłoszenia

Robot SCARA to rzeczywisty model klienta (`public/models/scara.glb`) —
skonwertowany ze złożenia STEP z Fusion 360 (OpenCascade → glTF, optymalizacja
gltf-transform: simplify + quantize + meshopt; ~16 MB STEP → ~1.2 MB GLB).
Pozostałe obiekty (hala, detal CAD, stanowisko maszyn) są proceduralnymi
placeholderami — docelowe pliki `.glb` trafiają do `public/models/`
(wymagania w planie implementacji, sekcja 5).
