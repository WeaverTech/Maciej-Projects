# Instrukcja dla agentów AI i programistów

## Cel

Kawasaki Palletizer to lokalna aplikacja (TypeScript + React, działa w przeglądarce, także z jednego pliku HTML)
do projektowania paletyzacji worków i kartonów oraz generowania kodu Kawasaki AS. Interfejs jest po polsku.
Użytkownik projektuje geometrię względem fizycznej palety, wybiera narożnik BASE i kierunki osi, definiuje
warstwy A/B oraz konfigurację chwytaka jedno- lub dwusekcyjnego.

## Najważniejsze zasady domenowe

1. Pozycja produktu w edytorze oznacza środek prostokątnego obrysu produktu.
2. BASE znajduje się w wybranym narożniku górnej powierzchni palety.
3. Geometria warstwy jest niezależna od formatu Kawasaki AS.
4. Warstwa B może być obrotem warstwy A o 180° względem środka palety. Powiązana warstwa B (`link: 'rot180'`)
   jest tylko do odczytu i odświeża się po każdej zmianie A.
5. W trybie pojedynczym każdy produkt ma osobny cykl pobrania i używa sekcji chwytaka 1.
6. W trybie podwójnym dwa produkty mogą być pobrane jednocześnie, lecz każdy musi mieć inną sekcję chwytaka.
7. Kod AS jest szablonem stanowiskowym. Nie wolno zakładać, że można go uruchomić bez weryfikacji BASE, TCP,
   orientacji, sygnałów, limitów oraz trajektorii.
8. Nie zmieniaj konwencji narożników bez migracji plików projektu:
   - A: lewy górny,
   - B: prawy górny,
   - C: prawy dolny,
   - D: lewy dolny.
9. Kartony nigdy nie mogą wystawać ani się nakładać. Worki mogą – w granicach limitów produktu.

## Priorytety zmian

1. Stabilność i testy regresyjne.
2. Prawidłowość transformacji i kodu AS.
3. Czytelna walidacja.
4. Ergonomia edytora 2D.
5. Dopiero później nowe funkcje automatyczne.

## Reguły implementacyjne

- Logika modeli, geometrii i eksportu mieszka w `src/core/` i nie importuje Reacta ani stanu aplikacji.
  Nie implementuj jej w obsłudze przycisków.
- Jedynym źródłem prawdy jest `Project` w magazynie (`src/state/store.ts`). Widoki tylko go renderują.
- Wszystkie wartości geometrii są przechowywane w milimetrach.
- Do porównań geometrii używaj tolerancji `EPS` z `src/core/geometry.ts`, nigdy `value > 0` bez EPS.
- Zmiana narożnika BASE lub osi nie może fizycznie przesuwać produktów na planszy. Zmienia tylko transformację wyjściową.
- Każda zmiana projektu przechodzi przez akcję magazynu, żeby trafiła do historii cofania.
  Gesty ciągłe (przeciąganie) grupuj transakcją, wpisy z pól formularza scalaj kluczem.
- Każda nowa funkcja interfejsu wymaga testu otwarcia i podstawowej interakcji (Testing Library lub Playwright).
- Każdy nieobsłużony błąd ma trafiać do logu diagnostycznego (`src/state/diagnostics.ts`).
- Nie usuwaj zgodności zapisu JSON bez podniesienia `FORMAT_VERSION` i migracji w `src/core/projectIo.ts`.
- Kod AS musi być czystym ASCII. Teksty użytkownika przechodzą przez `toAscii`.
- Kod AS dla projektów z wersji 2.x (bez nagłówka z komentarzami) musi pozostać zgodny znak po znaku z plikami w `tests/fixtures/legacy/`.
- Elementy interfejsu buduj z `src/ui/kit.tsx` i kolorów z `src/index.css` (jasny i ciemny motyw).

## Kryteria ukończenia zmiany

- `npm run check` przechodzi (lint bez ostrzeżeń, kontrola typów, testy).
- `npm run test:e2e` przechodzi.
- `npm run build:standalone` buduje `release/KawasakiPalletizer.html`, a plik otwiera się z dysku.
- Generator, edytor cykli i widok kodu AS otwierają się bez wyjątku.
- Dodanie, obrót, przeciąganie, usunięcie i zapis projektu działają.
- Walidacja nie pokazuje błędów `0.0 mm` wynikających z szumu zmiennoprzecinkowego.
- Eksport AS jest sprawdzony na przykładzie trybu pojedynczego i podwójnego.

## Znane ryzyka

- Składnia i dostępne instrukcje AS mogą różnić się między kontrolerami Kawasaki.
- Aplikacja przelicza tylko kąt O. Składowe A i T punktów są zawsze równe 0.
- Produkty typu worek są uproszczone do prostokątnego obrysu 2D.
- Walidacja 2D nie zastępuje analizy kolizji robota i chwytaka.
- Zapis „w miejscu” wymaga File System Access API (Chrome, Edge). W innych przeglądarkach plik jest pobierany.
