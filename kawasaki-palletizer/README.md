# Kawasaki Palletizer 3

Aplikacja do projektowania paletyzacji worków i kartonów oraz generowania kodu Kawasaki AS.
Układasz produkty na planszy 2D względem fizycznej palety, wybierasz narożnik BASE i kierunki osi,
definiujesz warstwy A/B i chwytak, a program na bieżąco waliduje układ i generuje gotowy szablon programu AS.

Wersja 3 jest napisana od nowa (TypeScript + React) na podstawie wersji 2.3 (Python + PySide6).
Działa w przeglądarce, **w całości lokalnie i offline** – niczego nie wysyła do sieci.

## Najszybszy start – jeden plik

Plik [`release/KawasakiPalletizer.html`](release/KawasakiPalletizer.html) to kompletna aplikacja.
Skopiuj go na komputer i otwórz dwuklikiem w Chrome lub Edge. Nie wymaga instalacji, serwera ani internetu.

Projekt jest zapisywany automatycznie w pamięci przeglądarki, a przyciskiem **Zapisz** (Ctrl+S) trafia do pliku `.json`.

## Uruchomienie ze źródeł

Wymagany Node.js 22 lub nowszy.

```bash
cd kawasaki-palletizer
npm install
npm run dev          # wersja deweloperska, http://localhost:5173
```

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` | serwer deweloperski z odświeżaniem na żywo |
| `npm run build` | wersja produkcyjna do katalogu `dist/` |
| `npm run build:standalone` | jeden samodzielny plik `release/KawasakiPalletizer.html` |
| `npm run check` | lint + kontrola typów + testy jednostkowe i komponentowe |
| `npm run test:e2e` | testy end-to-end w prawdziwej przeglądarce (Playwright) |

## Jak pracować z programem

Lewa szyna prowadzi przez pięć kroków, które można przechodzić w dowolnej kolejności:

1. **Paleta** – wymiary, narożnik BASE (A/B/C/D), kierunki +X i +Y, test przeliczenia punktu.
2. **Produkt** – worek lub karton, wymiary, przyrost warstwy, limity wystawania i nakładania, przekładki.
3. **Warstwy** – liczba warstw, warstwa B (powiązana z A obrotem o 180° albo edytowana niezależnie), porównanie A/B.
4. **Chwytak** – tryb pojedynczy lub podwójny, sygnały sekcji, czasy, edytor cykli pobrań.
5. **Robot** – nazwy programu i punktów, prędkości, wysokości, orientacja narzędzia.

Środek ekranu ma trzy widoki (klawisze `1`, `2`, `3`):

- **Układ 2D** – edytor warstwy: przeciąganie z przyciąganiem do krawędzi i siatki, zaznaczanie ramką,
  miarka, ustalanie kolejności klikaniem, generator układów.
- **Stos 3D** – podgląd całego ładunku z animacją układania produkt po produkcie.
- **Kod AS** – podgląd programu z kolorowaniem składni, kopiowaniem, zapisem do pliku i listą kontrolną.

Prawy panel pokazuje właściwości zaznaczenia, kolejność odkładania i wyniki walidacji.
Kliknięcie problemu na liście zaznacza produkty, których dotyczy.

### Skróty klawiszowe

Pełna lista jest w programie pod klawiszem `?`. Najważniejsze:

| Skrót | Działanie |
| --- | --- |
| `N` | dodaj produkt |
| `R` / `Shift+R` | obróć zaznaczone o 90° / −90° |
| strzałki / `Shift`+strzałki | przesuń o 1 mm / 10 mm |
| `Delete`, `Backspace` | usuń zaznaczone |
| `Ctrl+Z` / `Ctrl+Y` | cofnij / ponów |
| `Ctrl+C` / `Ctrl+V` / `Ctrl+D` | kopiuj / wklej / duplikuj |
| `V` / `M` / `O` | narzędzie: wskaźnik / miarka / kolejność |
| `G` | generator układów |
| `F` | dopasuj widok |
| `Ctrl+S` / `Ctrl+O` / `Ctrl+E` | zapisz projekt / otwórz / zapisz kod AS |

## Zgodność z wersją 2.x

Pliki projektu z Kawasaki Palletizer 2.x (format 3) otwierają się bezpośrednio – program migruje je do formatu 4.
Dla takich projektów instrukcje programu AS są takie same jak w wersji 2.3 – dochodzi tylko nagłówek
z komentarzami. Potwierdzają to testy porównujące wynik znak po znaku z oryginalnym generatorem.

## Ważne

Wygenerowany kod AS jest **szablonem stanowiskowym**. Przed uruchomieniem na robocie zweryfikuj BASE, TCP,
orientację narzędzia, sygnały, limity osi, wysokość bezpieczną i trajektorię. Walidacja 2D nie zastępuje
analizy kolizji robota i chwytaka. Szczegóły: [`docs/AS_EXPORT_GUIDE.md`](docs/AS_EXPORT_GUIDE.md).

## Dokumentacja

- [`AGENTS.md`](AGENTS.md) – zasady domenowe i reguły pracy nad kodem,
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – budowa aplikacji,
- [`docs/AS_EXPORT_GUIDE.md`](docs/AS_EXPORT_GUIDE.md) – generator kodu AS,
- [`docs/TESTING.md`](docs/TESTING.md) – testy,
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) – historia zmian,
- [`docs/ROADMAP.md`](docs/ROADMAP.md) – plany.
