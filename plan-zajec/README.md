# Plan zajęć 13M5 – podgrupy GL04, SL02, GK/P03, SP02

Semestr zimowy 2026/2027, Wydział Mechaniczny PK, grupa **13M5**.

Oficjalny plan
([podzial.mech.pk.edu.pl](https://podzial.mech.pk.edu.pl/stacjonarne/archiwum/2026-2027/zima/index.xml))
to jedna wielka tabela: kolumny to kolejne tygodnie semestru, wiersze to 45-minutowe sloty,
a w komórkach siedzą skróty. Te skrypty zamieniają to na plan dzień po dniu:
godziny, przedmiot, forma zajęć, **podgrupa**, sala, prowadzący i konkretne daty spotkań.

Plan jest zawężony do jednego przydziału podgrup — tego z `MY_SUBGROUPS` w
`kalendarz_pdf.py`. Terminy pozostałych podgrup nie trafiają do wyników; zajęcia
wspólne dla całej grupy i całego rocznika zostają.

| Podgrupa | Co obejmuje |
| --- | --- |
| `GL04` | laboratoria całego rocznika 13M (8 przedmiotów) |
| `SL02` | laboratorium komputerowego wspomagania badań, wydzielone wewnątrz 13M5 |
| `GK/P03` | projekt z podstaw niezawodności (podgrupy rocznika) |
| `SP02` | projekt z metod komputerowych mechaniki, wydzielony wewnątrz 13M5 |

Skąd to przypisanie: `GL04` i `GK/P03` (grupa projektowa 03) są w planie wprost.
Numer 02 grupy ćwiczeniowej odnosi się do podziału wewnątrz 13M5, a ten występuje
w planie jako `SL02` (laboratorium) i `SP02` (projekt) — dlatego oba dostają numer 02.
Plan podaje przy zajęciach same numery podgrup, bez informacji, kto do której należy,
więc gdyby któryś numer okazał się inny, wystarczy podać go przy generowaniu:

```bash
python kalendarz_pdf.py --podgrupy GL04 SL02 GK/P03 SP01
```

## Co jest w katalogu

| Ścieżka | Zawartość |
| --- | --- |
| `wygenerowane/moj-plan-13M5.pdf` | **kalendarz do druku i na telefon**: siatka tydzień A / tydzień B |
| `wygenerowane/moj-plan-13M5.md` | ten sam plan dzień po dniu, z terminami spotkań |
| `wygenerowane/moj-plan-13M5.ics` | ten sam plan jako kalendarz (Google Calendar, Outlook) |
| `plan.py` | narzędzie wiersza poleceń (pobieranie, generowanie, podgląd, kontrole) |
| `kalendarz_pdf.py` | generator kalendarza PDF |
| `sprawdz_kalendarz.py` | audyt gotowego kalendarza (czy siatki pokazują dokładnie to, co jest w planie) |
| `planpk/parser.py` | odczyt tabeli HTML (rowspan, kolumny tygodni, legenda kodów i form) |
| `planpk/model.py` | scalanie slotów w bloki zajęć i rozpoznawanie rytmu (co tydzień / co 2 tygodnie) |
| `planpk/eksport.py` | eksport do Markdown i do kalendarza ICS |

## Odświeżenie planu

```bash
pip install -r requirements.txt

python plan.py pobierz 13M5             # pobiera stronę grupy do dane/
python kalendarz_pdf.py                 # kalendarz PDF
python plan.py pokaz 13M5 --podgrupy GL04 SL02 GK/P03 SP02 \
    --md wygenerowane/moj-plan-13M5.md --ics wygenerowane/moj-plan-13M5.ics

# kontrole
python plan.py sprawdz 13M5             # czy każda komórka planu została odczytana
python plan.py godziny 13M5             # czy formy zajęć zgadzają się z legendą
python sprawdz_kalendarz.py             # czy kalendarz PDF zgadza się z planem

# co dokładnie jest w danym tygodniu (przydatne, bo połowa zajęć jest co 2 tygodnie)
python plan.py tydzien 13M5 2026-10-05 --podgrupy GL04 SL02 GK/P03 SP02
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
| `GK/P01`–`GK/P06` | podgrupy konwersatoryjno-projektowe całego rocznika, np. `13M GK/P03` |
| `SL01`–`SL03` | podgrupy laboratoryjne wydzielone wewnątrz jednej grupy, np. `13M5 SL02` |
| `SP01`, `SP02` | podgrupy projektowe wewnątrz jednej grupy, np. `13M5 SP02` |
| brak oznaczenia | zajęcia dla całej grupy albo dla kilku grup naraz (wtedy są wymienione, np. `13M4; 13M5`) |

Kluczowe: numer podgrupy laboratoryjnej jest przypisany do **rocznika**, a nie do grupy.
Jedna grupa dziekańska rozpada się na 2–3 podgrupy laboratoryjne, dlatego w pełnym
planie grupy widać wpisy dla kilku różnych `GLxx` — obowiązują tylko te z własnym numerem.

Formy zajęć: `W` – wykład, `C` – ćwiczenia, `L` – laboratorium, `P` – projekt,
`K` – konwersatorium, `S` – seminarium.

## Kalendarz PDF

Zajęcia idą w rytmie dwutygodniowym, więc jedna siatka tygodnia nie wystarcza. PDF ma
dwie siatki: **tydzień A** i **tydzień B** (na stronie tytułowej jest spis, który tydzień
jest którego typu). Bloki obrysowane linią przerywaną to zajęcia w podgrupie — reszta
grupy ma wtedy ten sam przedmiot w innym terminie. Przy zajęciach bez równego rytmu
wypisane są konkretne daty, a projekty mają osobną stronę, bo w gęstej siatce łatwo je
przeoczyć.

## Skąd się bierze forma zajęć

Komórka planu podaje kod przedmiotu, prowadzącego, podgrupę i salę — ale **nie formę
zajęć**. Forma jest w legendzie z prawej strony tabeli: dla każdego przedmiotu wypisani
są prowadzący z formą i liczbą 45-minutowych godzin w semestrze (np. `ZiDa L 45`,
`ZiDa W 15`). Parser dopasowuje prowadzącego z komórki do legendy; jeśli ta sama osoba
prowadzi przedmiot w dwóch formach, rozstrzyga oznaczenie podgrupy (wpis z podgrupą to
zajęcia w podgrupie, wpis bez podgrupy — wykład), a na końcu `plan.py godziny`
weryfikuje sumy: dla 13M5 wszystkie 39 pozycji legendy zgadzają się co do godziny.

## Kontrola poprawności

Trzy poziomy kontroli, każda kończy się kodem wyjścia różnym od zera, gdy coś się nie zgadza:

- `plan.py sprawdz` — poziom HTML-a: liczba kolorowych komórek w źródle musi się równać
  liczbie odczytanych slotów. Dla wszystkich 78 grup wydziału: 0 niezgodności.
- `plan.py godziny` — poziom form zajęć: liczba odczytanych godzin każdego prowadzącego
  musi się równać liczbie z legendy. Dla 13M5: 0 różnic. Dla części pozostałych grup
  różnice zostają, bo w ich planach legenda wymienia zajęcia, których w siatce nie ma
  (albo cała grupa ma z jedną osobą i wykład, i ćwiczenia w tej samej sali i tym samym
  dniu — wtedy z planu nie wynika, który termin jest który).
- `sprawdz_kalendarz.py` — poziom gotowego PDF-u. Sprawdza, że każde z 198 wystąpień
  zajęć trafia na siatkę tygodnia właściwego typu, że żadna kratka nie obiecuje zajęć
  w tygodniu, w którym ich nie ma, że każdy skrócony termin, wpis podpisany obcą grupą
  i termin e-learningowy jest wypisany na stronie wyjątków, że nic nie wypada poza ramy
  siatki (dni pon–pt, godziny 7.30–21.15) oraz że suma godzin lekcyjnych zgadza się
  co do slotu: źródło 461, siatka 469, różnica 8 to opisane skrócenia.

Generator PDF-u dodatkowo zgłasza na stdout każdy tekst, który nie zmieścił się w kratce.

## Uwagi o danych źródłowych

- Plan na serwerze uczelni jest aktualizowany i bywa publikowany od nowa w zmienionym
  układzie strony — wystarczy ponowić `pobierz` i wygenerować pliki jeszcze raz.
- Ostatni tydzień semestru (26 I – 2 II) jest w źródle rysowany pojedynczymi
  45-minutowymi slotami: dwa przedmioty, które normalnie występują naprzemiennie co dwa
  tygodnie, dostają wtedy po pół bloku. Kalendarz wypisuje ten tydzień co do terminu
  na osobnej stronie.
- Ten sam przedmiot bywa prowadzony przez kilka osób w różnych terminach — takie wpisy
  są w Markdownie rozbite na osobne wiersze, bo różnią się prowadzącym. Bywa też, że
  jeden 90-minutowy blok jest rozpisany na dwie 45-minutowe połowy z różnymi
  prowadzącymi; to nie jest skrócenie zajęć i kalendarz nie traktuje tego jako wyjątku.
- Poza ostatnim tygodniem zdarzają się pojedyncze terminy skrócone do 45 minut.
  Kratka w siatce ma jedną wysokość, więc takie terminy są wypisane co do daty
  na stronie wyjątków.
- Zajęcia e-learningowe stoją w źródle w osobnym wierszu pod danym dniem, bez godziny.
  W siatce ich nie ma, są na stronie wyjątków; w kalendarzu ICS to wpisy całodniowe.
  W planie 13M5 jest jeden taki termin: wykład z podstaw robotyki 12 października.
- Wpis „Godzina dla przemysłu” (środa 11.00–12.30) jest w planie 13M5 podpisany
  grupami `12A; 12B1; 12I1; 12K; 12L; 12M; 12S` i występuje identycznie w kilkudziesięciu
  planach — wygląda na zajęcia wydziałowe. Kalendarz go pokazuje, ale z adnotacją.
