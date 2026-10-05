---
typ: mapa
zaktualizowano: 2026-10-05
---

# Mapa - punkt wejścia

Pierwsza notatka, którą otwierasz. Trzymaj ją krótką: to spis tego, co aktywne,
a nie spis wszystkiego.

## Aktywne projekty

- [[scara-isaac-sim|SCARA w Isaac Sim]]
- *(dopisz kolejne - maksymalnie 5 naraz)*

## Obszary

- *(np. ASTOR, studia PK, nauka ROS 2, finanse)*

## Rytuały

- **Codziennie, 5 min:** dziennik z szablonu `90-szablony/szablon-dziennik.md`
- **Niedziela, 20-30 min:** opróżnij `00-skrzynka` do zera, przejrzyj projekty
- **Koniec miesiąca:** zamknij skończone projekty do `40-archiwum`, zrób jeden artefakt

## Zasady, o których najłatwiej zapomnieć

1. Zapis jest tani, porządkowanie zbiorcze. Nie kategoryzuj w trakcie łapania.
2. Tytuł notatki to zdanie twierdzące, nie hasło.
3. Linkuj zamiast tagować.
4. Notatka bez przewidywanego zastosowania to kandydat do kosza, nie do archiwum.

## Przegląd tygodniowy - checklista

- [ ] Skrzynka pusta
- [ ] Każdy aktywny projekt ma zapisany następny krok
- [ ] Projekty skończone przeniesione do archiwum
- [ ] Wybrany priorytet na nadchodzący tydzień

## Opcjonalnie: automatyczna lista projektów

Z wtyczką Dataview listę aktywnych projektów można generować samemu sobie - wstaw blok
kodu z językiem `dataview` i zapytaniem:

    TABLE status, nastepny-krok, termin
    FROM "10-projekty"
    WHERE typ = "projekt" AND status != "zamkniety"
    SORT termin ASC

Bez wtyczki wystarczy lista ręczna powyżej - i tak aktualizujesz ją przy przeglądzie
tygodniowym.
