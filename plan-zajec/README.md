# Plan zajęć WM PK w czytelnej formie

Oficjalny plan Wydziału Mechanicznego PK
([podzial.mech.pk.edu.pl](https://podzial.mech.pk.edu.pl/stacjonarne/archiwum/2026-2027/zima/index.xml))
to jedna wielka tabela: kolumny to kolejne tygodnie semestru, wiersze to 45-minutowe sloty,
a w komórkach siedzą skróty. Te skrypty zamieniają to na plan dzień po dniu:
godziny, przedmiot, forma zajęć, **podgrupa**, sala, prowadzący i konkretne daty spotkań.

## Co jest w katalogu

| Ścieżka | Zawartość |
| --- | --- |
| `plan.py` | narzędzie wiersza poleceń (pobieranie, generowanie, podgląd) |
| `planpk/parser.py` | odczyt tabeli HTML (rowspan, kolumny tygodni, legenda kodów) |
| `planpk/model.py` | scalanie slotów w bloki zajęć i rozpoznawanie rytmu (co tydzień / co 2 tygodnie) |
| `planpk/eksport.py` | eksport do Markdown i do kalendarza ICS |
| `wygenerowane/grupy/*.md` | gotowy plan każdej z 77 grup |
| `wygenerowane/kalendarze/*.ics` | kalendarze do zaimportowania (Google Calendar, Outlook) |
| `wygenerowane/README.md` | spis grup wraz z listą ich podgrup |

## Użycie

```bash
pip install -r requirements.txt

python plan.py pobierz                  # pobiera strony wszystkich grup do dane/
python plan.py pobierz 13M5 13M4        # tylko wybrane grupy
python plan.py generuj                  # Markdown dla wszystkiego, co jest w dane/
python plan.py generuj 13M5 --ics       # dodatkowo kalendarz ICS
python plan.py pokaz 13M5               # plan grupy w konsoli
python plan.py sprawdz                  # kontrola: czy każda komórka planu została odczytana

# plan przefiltrowany do własnych podgrup (zajęcia wspólne zostają)
python plan.py pokaz 13M5 --podgrupy GL04 GK/P03 SL02 SP01 \
    --md moj-plan.md --ics moj-plan.ics
```

Filtrowanie działa osobno dla każdej rodziny podgrup: podanie `GL04 GK/P03` obcina
laboratoria i projekty rocznika do tych numerów, ale zajęcia z podziałem `SL`/`SP`
zostają w komplecie, dopóki nie poda się również ich numeru.

Katalog `dane/` z pobranym HTML-em nie jest wersjonowany — odtwarza go `python plan.py pobierz`.

## Jak czytać oznaczenia grup

Nazwa grupy, np. **13M5**, to kolejno: stopień studiów (1 – inżynierskie, 4 – magisterskie),
rok studiów, kierunek (M – mechanika i budowa maszyn, A – automatyka, I – informatyka
stosowana, S – środki transportu itd.) oraz numer grupy.

W komórce zajęć obok nazwy grupy pojawia się podgrupa:

| Oznaczenie | Znaczenie |
| --- | --- |
| `GL01`–`GL06` | podgrupy laboratoryjne całego rocznika, np. `13M GL04` = czwarta podgrupa laboratoryjna rocznika 13M |
| `GK/P01`–`GK/P05` | podgrupy projektowe i ćwiczeniowe całego rocznika, np. `13M GK/P03` |
| `SL01`–`SL03` | podgrupy laboratoryjne wydzielone wewnątrz jednej grupy, np. `13M5 SL02` |
| `SP01`, `SP02` | podgrupy projektowe wewnątrz jednej grupy, np. `13M5 SP01` |
| brak oznaczenia | zajęcia dla całej grupy albo dla kilku grup naraz (wtedy są wymienione, np. `13M4; 13M5`) |

Kluczowe: numer podgrupy laboratoryjnej jest przypisany do **rocznika**, a nie do grupy.
Jedna grupa dziekańska rozpada się na 2–3 podgrupy laboratoryjne, dlatego w planie grupy
widać wpisy dla kilku różnych `GLxx` — obowiązują tylko te z własnym numerem.

Formy zajęć: `W` – wykład, `C` – ćwiczenia, `L` – laboratorium, `P` – projekt,
`K` – konwersatorium, `S` – seminarium, `e-l` – e-learning.

## Uwagi o danych źródłowych

- Ostatni tydzień semestru (kolumna z datami 26 I – 2 II) jest w źródle rysowany
  pojedynczymi 45-minutowymi slotami: dwa przedmioty, które normalnie występują
  naprzemiennie co dwa tygodnie, dostają wtedy po pół bloku. Skrypt odwzorowuje to wiernie.
- Ten sam przedmiot bywa prowadzony przez kilka osób w różnych terminach — takie wpisy
  są rozbite na osobne wiersze, bo różnią się prowadzącym.
- Plan na serwerze uczelni bywa aktualizowany; wystarczy ponowić `pobierz` i `generuj`.
