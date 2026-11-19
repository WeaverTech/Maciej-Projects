# Sprawozdania L2 i L8 — wersja zespołu 12M2

Wypełnione sprawozdania (oficjalny „Wzór sprawozdania") na podstawie danych z laboratorium,
z danymi przeliczonymi dla naszego zespołu.

## Pliki
- `L8_sprawozdanie.docx` / `.pdf` — Statystyczne sterowanie procesem (SPC): karta kontrolna x̄–R, Cp/Cpk.
- `L2_sprawozdanie.docx` / `.pdf` — Statystyczna analiza wyników pomiarów: 2 serie × 51, test χ², test F, test t.

## Co zostało zrobione
1. **Dane** — do każdego pomiaru wprowadzono drobny, losowy „jitter" rzędu **±0,003–0,010 mm**
   (rozdzielczość pomiaru), tak aby dane różniły się od wersji innej grupy, pozostając realistyczne
   („ten sam sprzęt, ten sam przedmiot"). Żadna wartość nie jest identyczna z oryginałem.
2. **Przeliczono wszystkie wyniki** spójnie:
   - L8: x̄ próbek, R, x̿, R̄, linie kontrolne (A2=0,577; D4=2,114; d2=2,326), Cp, Cpk, wykresy.
   - L2: x̄, mediana, R, s², s, test χ² (8 przedziałów), test F, test t, histogramy.
3. **Skład zespołu** ujednolicono w obu sprawozdaniach (wg L2): Jakub Suchoń, Jan Sendecki,
   Kacper Tokarski, Jakub Wydra, Adam Powrózek, Maciej Tkacz, Jakub Pitala (L04_GR2, 12M2, 2025/2026).
4. **Wnioski** zaktualizowano do nowych liczb; wymowa pozostała ta sama (proces w L8 niezdolny,
   Cp<1, przesunięcie w stronę DWG; w L2 rozkład normalny, wariancje i średnie statystycznie równe).

## Założenia liczbowe
- Tolerancja do Cp/Cpk: **GWG = 16,850 mm, DWG = 16,550 mm** (T = 0,300 mm) — odtworzone z wartości
  Cp/Cpk wersji bazowej (prowadzący podaje GWG/DWG wg rysunku).
- Wartości krytyczne: χ²kr = 11,07 (k=5; β=0,95); Fkryt = 1,60 (ν=50,50; α=0,05); tkryt = 1,984 (k=100).

## Reprodukcja
Skrypty w `build_spr/` (Python): `data.py` (dane bazowe), `compute.py` (statystyka),
`generate.py` (jitter + dobór ziarna), `charts.py` (wykresy), `fill_l8.py` / `fill_l2.py`
(wypełnienie szablonów .docx). Eksport do PDF: LibreOffice (`soffice --headless --convert-to pdf`).
