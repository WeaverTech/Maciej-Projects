# Opracowanie technologiczne — Zadania 10–12

**Część:** koło zębate walcowe o zębach prostych — moduł m₀ = 3,5; liczba zębów z = 51;
kąt przyporu α = 20°; średnica podziałowa d = 178,5; wierzchołkowa d_a = 185,5; szerokość 45;
otwór Ø35 H9; rowek wpustowy 10 JS9; 6 × Ø24 (otwory odciążające).
Rysunek wykonawczy nr 6 (A. Powrózek, Politechnika Krakowska, WM KKMiSK, 2025/2026).

## Zawartość

### Zadanie 10
- `Zadanie_10/Zadanie_10_opracowanie.pdf` — wiedza o półfabrykatach, materiał (skład + własności),
  klasy IT półfabrykatów oraz **weryfikacja** istniejącego Zadania 10.
- `Zadanie_10/Rysunki_polfabrykatow.pdf` — rysunki poglądowe półfabrykatów (PF1 odkuwka matrycowa,
  PF3 pręt walcowany) z zaznaczoną klasą dokładności (IT).
- `Zadanie_10/Struktura_9_fazowa.pdf` — struktura dziewięciofazowa dla PF1/PF2/PF3.

### Zadanie 11
- `Zadanie_11/Zadanie_11_opracowanie.pdf` — wybór wariantu procesu (PF3 — pręt walcowany,
  hartowanie indukcyjne) oraz tabela doboru obrabiarek do zabiegów + parametry maszyn z wykazu.

### Zadanie 12
- `Zadanie_12/Zadanie_12a_naddatki_i_rysunek.pdf` — naddatki obróbkowe (całkowite i międzyoperacyjne)
  + rysunek wykonawczy półfabrykatu (krążek z pręta Ø200).
- `Zadanie_12/Zadanie_12b_operacje_karta.pdf` — grupowanie zabiegów w operacje, karta technologiczna,
  dobór oprzyrządowania przedmiotowego i obrabiarek.

### Pliki źródłowe
- `build/` — skrypty generujące PDF (Python: reportlab + matplotlib), rysunki (`fig_*.png`) oraz
  kopia rysunku wykonawczego części (`rysunek_wykonawczy_zrodlo.pdf`).
  Generowanie: `cd build && python3 gen_z10.py && python3 gen_zad11.py && python3 gen_z12.py`.

## Najważniejsze ustalenia inżynierskie (do uwagi prowadzącego)

1. **Niezgodność materiałowa (kluczowa).** Rysunek podaje materiał **S235** oraz wymaga twardości
   **290–300 HB** i hartowania uzębienia (struktura: ZO17–ZO20). Stali S235 (C ≤ 0,17 %) **nie da się
   zahartować** — do spełnienia tych wymagań konieczna jest stal ulepszalna: **C45** (alternatywnie
   **41Cr4/40H** dla pewnej twardości 290–300 HB). W opracowaniu identyfikujemy materiał wg rysunku
   (S235, ze składem i własnościami), a do obróbki cieplnej przyjmujemy C45/41Cr4.
2. **Hartowanie:** ZO17 (indukcyjne) i ZO18 (ogniowe) to warianty alternatywne — wybrano **indukcyjne**.
3. **Centrowanie (ZO2)** — dla części tarczowej (D ≫ L) zbędne; bazowanie na czole i otworze
   (Ø200 przekracza też zakres nakiełczarek z wykazu).
4. **Drobne poprawki rysunku:** rowek 10 JS8 (widok) vs 10 JS9 (tabela ±0,018) → ujednolicić na
   **10 JS9**; uwaga „ISO 27768-m” → poprawnie **ISO 2768-m (PN-EN 22768-m)**.
5. **Dobór obrabiarek:** w udostępnionym wykazie brak frezarki obwiedniowej, dłutownicy do rowków,
   wiertarki i szlifierki do uzębień — te maszyny dobrano spoza wykazu (oznaczone „poza wykazem”),
   pozostałe (przecinarka, tokarki, centrum) wybrano z wykazu.

> Pliki Visio (.vsdx): w środowisku Linux wygenerowano równoważne, edytowalne rysunki struktury
> (matplotlib → PNG/PDF). Źródła w `build/figures.py` umożliwiają modyfikację.
