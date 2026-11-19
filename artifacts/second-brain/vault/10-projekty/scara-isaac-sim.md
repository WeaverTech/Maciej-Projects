---
typ: projekt
status: aktywny
termin: 2026-12-31
obszar: nauka symulacji / rekrutacja
nastepny-krok: wyeksportować SCARA z CAD do STEP i sprawdzić, czy importer URDF/USD przyjmuje model
utworzono: 2026-10-05
---

# SCARA w Isaac Sim - cyfrowy bliźniak własnego robota z walidacją sim-to-real

> Notatka przykładowa. Pokazuje, jak wypełniony projekt wygląda w praktyce -
> nadpisz ją swoimi danymi albo usuń.

## Po czym poznam, że skończone

Publiczne repozytorium zawiera plik USD mojego SCARA, skrypt sterujący ruchem w Isaac Sim
i porównanie tego samego ruchu w symulacji oraz na fizycznym robocie, z opisem rozbieżności.

## Dlaczego to robię

Zamyka jedyną poważną lukę w aplikacjach na stanowiska symulacyjne (Grid Dynamics,
SoftServe 88766) i jest dowodem na "sim-to-real", którego prawie żaden kandydat nie ma -
bo mało kto ma jednocześnie model CAD i fizycznego robota na biurku.
Szczegóły uzasadnienia: `artifacts/job-search/README.md`, sekcja "Projekt, który decyduje".

## Następny krok

Eksport z CAD do STEP i próba importu - zanim zacznę cokolwiek skryptować, muszę wiedzieć,
czy geometria w ogóle wchodzi i w jakich jednostkach.

## Kroki

- [ ] Eksport CAD → STEP, import do Isaac Sim (ścieżka przez USD)
- [ ] Definicja przegubów, osi i limitów zgodna z fizycznym robotem
- [ ] Skrypt w Pythonie z tą samą kinematyką prostą/odwrotną, co w kodzie robota
- [ ] Ten sam ruch testowy w symulacji i na fizycznym robocie, nagranie obu
- [ ] Pomiar rozbieżności + notatka o przyczynach
- [ ] README, zdjęcia, dwa nagrania, publikacja repo

## Dziennik projektu

<!-- Data + jedno zdanie dziennie. To jest surowiec na README i na rozmowę techniczną. -->

- *2026-10-05* - projekt założony, zakres minimalny ustalony na podstawie ogłoszeń.

## Wnioski

<!-- Uzupełniasz przy zamykaniu projektu. -->

## Powiązane

- [[rozbieznosc-sim-to-real-trzeba-mierzyc-tym-samym-ruchem-testowym]]
