# Plan zajęć 13M5 w czytelnej formie

Semestr zimowy 2026/2027, Wydział Mechaniczny PK, grupa **13M5**.

Oficjalny plan
([podzial.mech.pk.edu.pl](https://podzial.mech.pk.edu.pl/stacjonarne/archiwum/2026-2027/zima/index.xml))
to jedna wielka tabela: kolumny to kolejne tygodnie semestru, wiersze to 45-minutowe sloty,
a w komórkach siedzą skróty. Te skrypty zamieniają to na plan dzień po dniu:
godziny, przedmiot, forma zajęć, **podgrupa**, sala, prowadzący i konkretne daty spotkań.

## Co jest w katalogu

| Ścieżka | Zawartość |
| --- | --- |
| `wygenerowane/Plan_13M5_kalendarz.pdf` | **kalendarz do druku i na telefon**: siatka tydzień A / tydzień B osobno dla podgrup GL02, GL03 i GL04 |
| `wygenerowane/grupy/13M5.md` | pełny plan grupy, ze wszystkimi podgrupami |
| `wygenerowane/grupy/13M5-GL04-GKP03.md` | plan zawężony do podgrup `GL04` i `GK/P03` |
| `wygenerowane/kalendarze/*.ics` | te same dwa plany jako kalendarz (Google Calendar, Outlook) |
| `plan.py` | narzędzie wiersza poleceń (pobieranie, generowanie, podgląd) |
| `kalendarz_pdf.py` | generator kalendarza PDF |
| `sprawdz_kalendarz.py` | audyt gotowego kalendarza (czy siatki pokazują dokładnie to, co jest w planie) |
| `planpk/parser.py` | odczyt tabeli HTML (rowspan, kolumny tygodni, legenda kodów) |
| `planpk/model.py` | scalanie slotów w bloki zajęć i rozpoznawanie rytmu (co tydzień / co 2 tygodnie) |
| `planpk/eksport.py` | eksport do Markdown i do kalendarza ICS |

## Odświeżenie planu

```bash
pip install -r requirements.txt

python plan.py pobierz 13M5             # pobiera stronę grupy do dane/
python plan.py generuj 13M5 --ics       # Markdown + kalendarz ICS
python kalendarz_pdf.py                 # kalendarz PDF (siatka A/B dla GL02, GL03, GL04)
python plan.py pokaz 13M5               # plan w konsoli
python plan.py sprawdz 13M5             # kontrola: czy każda komórka planu została odczytana
python sprawdz_kalendarz.py             # kontrola: czy kalendarz PDF zgadza się z planem

# co dokładnie jest w danym tygodniu (przydatne, bo połowa zajęć jest co 2 tygodnie)
python plan.py tydzien 13M5 2026-10-05 --podgrupy GL04 GK/P03 SL02 SP01

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

## Kalendarz PDF

Zajęcia idą w rytmie dwutygodniowym, więc jedna siatka tygodnia nie wystarcza. PDF ma
dla każdej podgrupy GL dwie strony: **tydzień A** i **tydzień B** (na stronie tytułowej
jest spis, który tydzień jest którego typu). Bloki obrysowane linią przerywaną to zajęcia
do wyboru z rodziny `GK/P`, `SL` lub `SP`, a przy zajęciach bez równego rytmu wypisane są
konkretne daty.

Podział rocznika na podgrupy laboratoryjne nie jest jednakowy dla wszystkich przedmiotów
— osobna strona pokazuje, ile godzin laboratorium przypada na `GL02`, `GL03` i `GL04`
w każdym przedmiocie.

### Projekty

Osobna strona zbiera wszystkie cztery terminy projektów, bo w gęstej siatce łatwo je
przeoczyć. Siatki uwzględniają zapowiedziany podział 13M5 na połowy: `GL02` i połowa
`GL03` chodzą na `SP01` (P01), druga połowa `GL03` i `GL04` na `SP02` (P02) — stąd
`PROJECT_HALVES` w `kalendarz_pdf.py`. Tego przypisania nie da się wyczytać z planu,
który podaje same numery podgrup, więc strona `GL03` pokazuje oba terminy.

Podgrupy `GK/P` projektu z podstaw niezawodności nie są powiązane z numerami `GL`:
`GK/P01` to cała grupa 13M4, a 13M5 dzieli się na `GK/P02` i `GK/P03`. Oba terminy
zostają więc na każdej siatce.

## Kontrola poprawności

Dwa poziomy kontroli, obie kończą się kodem wyjścia różnym od zera, gdy coś się nie zgadza:

- `plan.py sprawdz` — poziom HTML-a: liczba kolorowych komórek w źródle musi się równać
  liczbie odczytanych slotów. Dla wszystkich 77 grup: 0 niezgodności.
- `sprawdz_kalendarz.py` — poziom gotowego PDF-u. Sprawdza, że każde z 647 wystąpień
  zajęć trafia na siatkę właściwej podgrupy w tygodniu właściwego typu, że żadna kratka
  nie obiecuje zajęć w tygodniu, w którym ich nie ma, że każdy skrócony termin i każdy
  wpis podpisany obcą grupą jest wypisany na stronie wyjątków, że nic nie wypada poza
  ramy siatki (dni pon–pt, godziny 7.30–21.15) oraz że suma godzin lekcyjnych zgadza się
  co do slotu: źródło 660, siatka 683, różnica 23 to opisane skrócenia.

Generator PDF-u dodatkowo zgłasza na stdout każdy tekst, który nie zmieścił się w kratce.

## Uwagi o danych źródłowych

- Ostatni tydzień semestru (kolumna z datami 26 I – 2 II) jest w źródle rysowany
  pojedynczymi 45-minutowymi slotami: dwa przedmioty, które normalnie występują
  naprzemiennie co dwa tygodnie, dostają wtedy po pół bloku. Skrypt odwzorowuje to wiernie.
- Ten sam przedmiot bywa prowadzony przez kilka osób w różnych terminach — takie wpisy
  są rozbite na osobne wiersze, bo różnią się prowadzącym. Bywa też, że jeden
  90-minutowy blok jest rozpisany na dwie 45-minutowe połowy z różnymi prowadzącymi;
  to nie jest skrócenie zajęć i kalendarz nie traktuje tego jako wyjątku.
- Poza ostatnim tygodniem zdarzają się pojedyncze terminy skrócone do 45 minut
  (np. napędy dla `GL03` w czwartki zwykle zaczynają się o 17.00, a nie o 16.15).
  Kratka w siatce ma jedną wysokość, więc takie terminy są wypisane co do daty
  na stronie wyjątków.
- Wpis „Godzina dla przemysłu” (środa 11.00–12.30) jest w planie 13M5 podpisany
  grupami `12A; 12B1; 12I1` i występuje identycznie w 31 planach — wygląda na
  zajęcia wydziałowe. Kalendarz go pokazuje, ale z adnotacją.
- Liczba godzin laboratorium bywa mocno nierówna między podgrupami i tak jest
  w źródle — np. Miernictwo to dla `GL02` trzy spotkania po 45 minut, a dla `GL03`
  szesnaście godzin lekcyjnych.
- Plan na serwerze uczelni bywa aktualizowany; wystarczy ponowić `pobierz` i `generuj`.
