# Generator Kawasaki AS

Implementacja: `src/core/asExport.ts`. Kod jest szablonem stanowiskowym, a nie gotowym programem produkcyjnym.

## Założenie BASE

Punkt bazowy jest nauczony w wybranym narożniku górnej powierzchni palety. Punkty są generowane względem BASE:

`POINT wa_cel[1] = poczatekpal+TRANS(X,Y,Z,O,0,0)`

X i Y to środek produktu przeliczony z planszy do układu BASE, Z to „Z pierwszej warstwy”.

## Orientacja (kąt O)

Ustawienie w kroku **Robot**:

- **Względem osi BASE** (domyślne dla nowych projektów) – kąt produktu jest przeliczany do układu BASE,
  więc uwzględnia wybrany narożnik i kierunki +X / +Y. Przy osiach tworzących układ lewoskrętny kierunek obrotu się odwraca.
- **Jak w wersji 2.3** – do kodu trafia kąt z planszy bez przeliczenia. Ten tryb jest ustawiany automatycznie
  dla projektów otwartych z wersji 2.x, żeby wynik nie zmienił się po migracji.

Do wyniku dodawana jest stała korekta kąta O (np. przy chwytaku zamontowanym pod kątem). Składowe A i T są zawsze równe 0.
Panel pokazuje tabelę „obrót na planszy → kąt O”, którą warto porównać ze stanowiskiem.

## Warstwy

Warstwa A i B mają osobne tablice punktów (`wa_cel`, `wb_cel`). W pętli właściwa tablica jest wybierana przez `.j MOD 2`.
Bez warstwy B wszystkie warstwy używają `wa_cel`.

## Wysokość

- `.z_offset = (.j-1)*.wyswarstwy`
- `.z_safe = safe_height+.z_offset`
- odkładanie: `SHIFT(cel[n] BY 0,0,.z_offset)`
- najazd: `SHIFT(cel[n] BY 0,0,.z_safe)`

## Przekładki

Włączone przekładki o niezerowej grubości podnoszą kolejne warstwy:

- co warstwę: `.z_offset = (.j-1)*.wyswarstwy+(.j-1)*.grubprzekl`
- co N warstw: `.z_offset = (.j-1)*.wyswarstwy+INT((.j-1)/N)*.grubprzekl`

Jeśli podano nazwę podprogramu, w miejscu przekładki generowane jest `CALL nazwa`. Bez nazwy w kodzie
zostaje komentarz przypominający o uzupełnieniu trajektorii pobrania przekładki.

## Sygnały chwytaka

Pole sygnału jest argumentem instrukcji SIGNAL, np. `12,-13` daje `SIGNAL 12,-13`.

### Pojedynczy

Pobranie, sekcja 1 ON, przejazd, odkładanie, sekcja 1 OFF.

### Podwójny

W jednym pobraniu włączane są obie przypisane sekcje. Przy każdym punkcie odkładania wyłączana jest
wyłącznie sekcja przypisana do produktu. Cykle zapisuje się jako `1=1,2=2;3=1,4=2`
(`produkt=sekcja`, cykle rozdzielone średnikiem) albo ustawia w edytorze cykli.

## Nagłówek i znaki

Program zaczyna się komentarzami z nazwą projektu, parametrami i ostrzeżeniem o weryfikacji.
Cały kod jest w ASCII: polskie litery i znaki typograficzne w nazwie projektu są zamieniane na odpowiedniki.

## Kiedy kod nie powstaje

Eksport jest zablokowany, gdy warstwa A jest pusta, osie +X i +Y nie są prostopadłe albo cykle chwytaka
są niepoprawne. Widok kodu pokazuje wtedy listę przyczyn zamiast programu.

## Weryfikacja przed robotem

- model i wersja kontrolera,
- składnia POINT/TRANS/SHIFT,
- orientacja BASE i TCP,
- znaki osi i kąt O,
- sygnały fizyczne,
- `WEIGHT`,
- limity osi,
- JMOVE/LMOVE,
- wysokość bezpieczna,
- trajektoria bezkolizyjna.
