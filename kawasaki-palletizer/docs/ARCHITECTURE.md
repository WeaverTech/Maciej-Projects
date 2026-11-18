# Architektura

## Stos

- TypeScript, React 19, Vite
- Tailwind CSS 4 (kolory jako zmienne CSS, motyw jasny i ciemny)
- Zustand + immer (stan aplikacji, cofanie i ponawianie)
- three.js (podgląd 3D stosu, ładowany dopiero przy wejściu w widok)
- vitest + Testing Library (testy jednostkowe i komponentowe), Playwright (testy end-to-end)
- JSON jako format projektu (wersja formatu 4)

Aplikacja nie ma części serwerowej. Wszystko działa w przeglądarce; wersja „standalone” to jeden plik HTML.

## Warstwy

```
src/core/     logika domenowa – czyste funkcje, bez Reacta i bez stanu aplikacji
src/state/    magazyn projektu, historia, autozapis, pliki, log diagnostyczny
src/ui/       interfejs: układ okna, edytor 2D, panele, okna dialogowe, widoki
```

Zależności idą tylko w jedną stronę: `ui → state → core`.

### `src/core/`

| Plik | Zakres |
| --- | --- |
| `types.ts`, `defaults.ts` | model projektu: paleta, produkt, pozycja, warstwa, robot, przekładki |
| `geometry.ts` | transformacja plansza → BASE, kąt O, obrysy, wystawanie, nakładanie, tolerancja `EPS` |
| `layers.ts` | obrót A → B o 180°, synchronizacja powiązanej warstwy B, porównanie A/B, numeracja |
| `gripper.ts` | parsowanie i walidacja cykli pobrań, sygnały sekcji, automatyczne parowanie |
| `generator.ts` | generator układów (rzędy, kolumny, układy mieszane 0°/90°) |
| `snapping.ts` | przyciąganie do krawędzi palety, sąsiadów i siatki wraz z liniami pomocniczymi |
| `validation.ts` | walidacja projektu – zwraca listę problemów z zakresem, wagą i propozycją naprawy |
| `asExport.ts` | generator kodu Kawasaki AS |
| `asValidator.ts` | kontrola struktury wygenerowanego kodu (bloki, ASCII, długość linii) |
| `projectIo.ts` | zapis i odczyt JSON, migracja z formatu 3 (wersje 2.x) |
| `stats.ts` | liczba produktów, wysokość ładunku, wypełnienie warstwy |

### `src/state/`

- `store.ts` – magazyn Zustand: projekt, zaznaczenie, narzędzie, widok, historia cofania
  (scalanie kolejnych zmian tego samego pola, transakcje dla gestów), powiadomienia, okna dialogowe.
- `actions.ts` – operacje na plikach: nowy projekt, otwarcie, zapis, kopiowanie i zapis kodu AS.
- `persistence.ts` – autozapis projektu i ustawień w `localStorage`.
- `fileAccess.ts` – File System Access API z awaryjnym pobieraniem pliku i `<input type="file">`.
- `diagnostics.ts` – log zdarzeń i błędów dostępny w oknie „Diagnostyka”.

### `src/ui/`

- `layout/` – pasek górny, szyna kroków z panelami ustawień, prawy panel, pasek stanu.
- `canvas/` – edytor 2D w SVG: przesuwanie i skalowanie widoku, przeciąganie z przyciąganiem,
  zaznaczanie ramką, miarka, narzędzie kolejności.
- `panels/` – paleta, produkt, warstwy, chwytak, robot, zaznaczenie, kolejność, walidacja.
- `dialogs/` – generator układów, edytor cykli, skróty, diagnostyka, potwierdzenia.
- `views/` – widok kodu AS oraz podgląd 3D stosu.
- `kit.tsx` – wspólne kontrolki (przyciski, pola, przełączniki, okno dialogowe, menu).
- `PrintReport.tsx` – „Karta paletyzacji” widoczna tylko na wydruku (Plik → Drukuj kartę).

## Przepływ danych

Interfejs wywołuje akcje magazynu, które zmieniają `Project`. Edytor 2D, podgląd 3D i panele renderują `Project`.
Walidator czyta `Project` i zwraca problemy. Eksporter czyta `Project` i generuje tekst AS.
Interfejs nie jest źródłem prawdy – nie przechowuje własnej kopii geometrii.

Każdy widok jest zamknięty w granicy błędu: wyjątek w jednym widoku trafia do logu i nie zamyka aplikacji.

## Układ współrzędnych

- Plansza: początek w lewym dolnym rogu palety, X w prawo, Y w górę, jednostką jest milimetr.
- Obrót produktu jest dodatni przeciwnie do ruchu wskazówek zegara, patrząc z góry.
- BASE: `toBase()` przelicza punkt planszy na układ robota na podstawie narożnika i kierunków +X / +Y.
  Zmiana narożnika lub osi nie zmienia położenia produktów na planszy.

## Format projektu

Format 4 używa nazw pól w camelCase i zawiera pole `version`. Pliki formatu 3 (snake_case, wersje 2.x) są
migrowane przy otwarciu: warstwa B będąca dokładnym obrotem A zostaje powiązana, a orientacja przechodzi
w tryb zgodności z 2.3, żeby kod AS nie zmienił się bez wiedzy użytkownika. Pliki z nowszego formatu
są odrzucane z czytelnym komunikatem.
