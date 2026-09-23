# Plan implementacji — interaktywna strona "2MaK"

One-pager typu scrollytelling: jedna ciągła scena 3D (wirtualna hala montażowa),
w której scroll użytkownika steruje przelotem kamery między stanowiskami.

## 1. Stack

| Warstwa | Technologia |
| --- | --- |
| Framework | Next.js (App Router, TypeScript) |
| Silnik 3D | three.js + @react-three/fiber + @react-three/drei |
| Postprocessing | @react-three/postprocessing (Depth of Field, winieta) |
| Scroll / animacje | GSAP + ScrollTrigger (`@gsap/react` dla cyklu życia Reacta) |
| UI | Tailwind CSS v4 (warstwa HTML `fixed` nad canvasem) |

## 2. Architektura

```
┌───────────────────────────────────────────────┐
│ <main>                                        │
│  ├─ <Experience/>   fixed, z-0  — Canvas 3D   │
│  ├─ <UIOverlay/>    fixed, z-10 — sekcje HTML │
│  └─ <div spacer/>   600vh — fizyczna wysokość │
└───────────────────────────────────────────────┘
```

Kluczowe decyzje:

- **Jedno źródło prawdy dla scenariusza** — `src/lib/sceneConfig.ts` definiuje
  waypointy kamery (pozycja + target + FOV) i wagi scrolla każdej sceny.
  Z tych samych zakresów korzysta rig kamery **i** fade-in/out sekcji HTML,
  więc obraz i tekst nie mogą się rozjechać.
- **Most GSAP ↔ R3F bez re-renderów** — `src/lib/scrollState.ts` to mutowalny
  obiekt; GSAP tweenuje jego pola (`scaraExplode`, `dofIntensity`, `progress`),
  a komponenty 3D czytają je w `useFrame`. Zero setState przy 60 fps.
- **Damping kamery** — ScrollTrigger ze `scrub: true` pisze wartości docelowe
  do proxy, a `useFrame` dogania je z wygładzeniem niezależnym od FPS
  (`1 - exp(-λ·dt)`). Skokowy scroll kółkiem = nadal filmowy ruch.
- **UI nad canvasem** — kontener overlay ma `pointer-events-none`,
  elementy interaktywne (menu, formularz) `pointer-events-auto`,
  dzięki czemu scroll "przechodzi" przez warstwę HTML.

## 3. Mapa scen (scroll 0 → 1)

| Zakres* | Scena | Kamera | 3D | UI |
| --- | --- | --- | --- | --- |
| 0.00–0.11 | 0 Hero | statyczny szeroki kąt na halę | logo 2MaK (line-art, floating) | H1 "Precyzja w każdym wymiarze", hamburger, pulsujące "Eksploruj" |
| 0.11–0.30 | 1 CAD | wjazd w głąb do stanowiska 1 | wireframe detalu (turntable) | tekst fade-in z lewej: CAD + symulacje kinematyczne |
| 0.30–0.59 | 2 Druk 3D | dojazd do robota SCARA | **Exploded View**: `scaraExplode` 0→1, PET-G oddziela się od wałków węglowych | opis FDM / SLA / MJF (z prawej) |
| 0.59–0.81 | 3 Maszyny | obrót ~90° wokół stanowiska | `scaraExplode` 1→0 (złożenie zjeżdża się), szafa sterownicza + PLC | montaż, tolerancje 0.016 mm, metrologia |
| 0.81–1.00 | 4 Kontakt | wzniesienie, widok z lotu ptaka | `dofIntensity` 0→1 (rozmycie DoF) | formularz "Szybka wycena" + Drag & Drop .step/.stl |

\* zakresy wynikają z wag w `sceneConfig.ts` (scena 2 ma większą wagę —
Exploded View potrzebuje przestrzeni scrollowej) i są liczone
przez `computeSceneRanges()`.

## 4. Struktura plików

```
2mak-website/
├── public/
│   └── models/                 # docelowe assety .glb (scara.glb, hala.glb…)
├── src/
│   ├── app/
│   │   ├── api/quote/route.ts  # POST — odbiór zgłoszeń wyceny (multipart)
│   │   ├── globals.css         # paleta 2MaK (@theme), animacje pomocnicze
│   │   ├── layout.tsx          # fonty Inter + Roboto Mono, metadata PL
│   │   └── page.tsx            # Experience + UIOverlay + spacer 600vh
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Experience.tsx          # <Canvas>, mgła, kompozycja sceny
│   │   │   ├── CameraRig.tsx           # GSAP ScrollTrigger → kamera (serce projektu)
│   │   │   ├── WorkshopEnvironment.tsx # hala: podłoga, słupy, światła punktowe
│   │   │   ├── PostFX.tsx              # DepthOfField + winieta
│   │   │   └── models/
│   │   │       ├── LogoMark.tsx        # logo 2MaK (Scena 0)
│   │   │       ├── CadWireframe.tsx    # detal wireframe (Scena 1)
│   │   │       ├── ScaraRobot.tsx      # SCARA + Exploded View (Sceny 2–3)
│   │   │       └── MachineStation.tsx  # szafa + PLC (Scena 3)
│   │   └── ui/
│   │       ├── UIOverlay.tsx           # kontener warstwy HTML
│   │       ├── Header.tsx              # logo + hamburger menu
│   │       ├── useSectionReveal.ts     # hook fade-in/out sekcji wg zakresów scen
│   │       ├── QuickQuoteForm.tsx      # Drag & Drop + walidacja + submit
│   │       └── sections/
│   │           ├── HeroSection.tsx
│   │           ├── CadSection.tsx
│   │           ├── PrintSection.tsx
│   │           ├── MachinesSection.tsx
│   │           └── ContactSection.tsx
│   └── lib/
│       ├── gsap.ts             # jednorazowa rejestracja pluginów GSAP
│       ├── sceneConfig.ts      # waypointy kamery + wagi scrolla (reżyseria)
│       └── scrollState.ts      # mutowalny most GSAP → useFrame
└── IMPLEMENTATION_PLAN.md
```

## 5. Exploded View — kontrakt na assety 3D

Mechanizm (`ScaraRobot.tsx`): każda część ma `closedPosition` (pivot w stanie
złożonym) i `explodeOffset` (wektor rozsunięcia wzdłuż osi montażowej).
Pozycja w klatce = `closed + offset * ease(scaraExplode)`.

Wymagania wobec pliku `scara.glb` (dla grafika 3D):

1. Każdy ruchomy element (podstawa, wałki, obudowa kolumny, ramiona,
   łożysko przegubu, oś Z, efektor) = **osobny mesh** o czytelnej nazwie
   (`Base`, `ColumnShaftL`, `Arm1`…).
2. **Pivot/Origin każdego mesha w pozycji złożonej** — transformacje
   "zapieczone" (Apply All Transforms) poza pozycją; skala = 1.
3. Osie lokalne zgodne z osiami montażowymi (wałek wysuwa się po własnym Y).
4. Eksport: glTF 2.0 `.glb`, kompresja Draco/Meshopt, tekstury ≤ 2048 px,
   docelowo < 3–5 MB na model.

Migracja z placeholderów: `useGLTF("/models/scara.glb")` → mapowanie
`nodes.<Nazwa>` na wpisy tabeli `PARTS` (komentarz w `ScaraRobot.tsx`).

## 6. Kolejność wdrożenia

1. **Fundament (zrobione w tym repo)** — scaffold Next.js, Tailwind v4
   z paletą 2MaK, rejestracja GSAP, `sceneConfig` + `scrollState`.
2. **Rdzeń 3D (zrobione, na placeholderach)** — Canvas, hala ze światłami,
   CameraRig ze scrubbowanym timeline'em, SCARA z Exploded View, PostFX.
3. **Warstwa UI (zrobione)** — Header/hamburger, 5 sekcji z `useSectionReveal`,
   formularz wyceny + endpoint `/api/quote`.
4. **Assety produkcyjne** — podmiana placeholderów na `.glb` (hala, detal CAD,
   SCARA wg kontraktu z pkt 5); bake świateł do lightmap jeśli FPS spadnie.
5. **Backend wyceny** — storage plików (S3/R2), notyfikacja e-mail (Resend),
   rate limiting + Turnstile w `/api/quote`.
6. **Polish** — `prefers-reduced-motion` (wyłączenie scrubu, statyczne kadry),
   fallback bez WebGL, wariant mobilny (uproszczone światła, DPR ≤ 1.5),
   Lighthouse / bundle-size budget, testy E2E scrolla (Playwright).

## 7. Ryzyka i mitygacje

- **Wydajność mobile** — DoF jest kosztowny: poniżej progu FPS wyłączyć
  `PostFX`, ograniczyć `dpr`, uprościć cienie (już: `dpr=[1,2]`, 3 spoty).
- **Rozjazd scroll ↔ kamera przy resize** — `invalidateOnRefresh` +
  `ScrollTrigger.refresh()` na resize (zaimplementowane w CameraRig).
- **Duże pliki od klientów** — limit 50 MB/plik i 5 plików po stronie
  klienta i serwera; docelowo presigned upload bezpośrednio do storage,
  żeby nie przepuszczać binariów przez funkcję serwerową.
