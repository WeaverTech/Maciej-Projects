# Adaptacyjna wysokość pobierania płyt ze stosu (Kawasaki CP, neoROSET)

Robot pobiera płyty ze stosu, którego wysokość zmienia się w trakcie produkcji, bo
w różnych momentach dokładane są nowe płyty. Dalmierz siedzi na kiści, w osi TCP.
Wymaganie klienta: maksymalna wydajność, więc **żadnych zatrzymań** — ani `BREAK`,
ani dwelli, ani czekania na czujnik. Wysokość punktu pobrania ma się dopasowywać
w trakcie ruchu i być ustalona najpóźniej na 50 cm nad stosem.

Testy na stanowisku pokazały, że **włączenie opcji RTPM działa jak `BREAK`** —
robot przystaje. To zresztą i tak było niewłaściwe narzędzie do tego zadania,
o czym niżej. Rozwiązanie w `as/plate.as` nie używa żadnej opcji i nie zawiera
ani jednego `BREAK` w części wydajnościowej.

## Zawartość

| Plik | Rola |
| --- | --- |
| `as/plate.as` | **rozwiązanie właściwe**: adaptacyjna wysokość pobrania bez zatrzymań, z symulatorem dalmierza |
| `as/plate_min.as` | ten sam kod bez komentarzy, do wczytania do sterownika |
| `as/zchase.as` | wcześniejszy test funkcji RTPM (generator, logger, raport) |
| `as/zstack.as` | pomiar wysokości stosu dalmierzem na postoju + test powtarzalności |
| `tools/zc_analyze.py` | analiza logu CSV ze starego testu RTPM; do `plate.as` niepotrzebna |

`plate.as` sprawdza się w całości w neoROSET — wynik wychodzi na terminal jako
gotowa tabela, bez żadnych narzędzi zewnętrznych.

`plate_min.as` zawiera dokładnie ten sam kod, tylko bez komentarzy. Nazwy
programów i zmiennych są identyczne, więc **nie wczytuj obu plików do jednego
kontrolera** — drugi nadpisze pierwszy. Opis, co robi który program i jak
strojić parametry, jest w `plate.as` oraz w tym dokumencie.

---

# `plate.as` — jak to działa

## Dlaczego bez RTPM

To nie jest zadanie śledzenia ruchomego celu, tylko **późnego wiązania punktu**.
Stos nie rusza się podczas zjazdu robota — płyta zostaje dołożona *między*
cyklami, a nie w ciągu tych kilkuset milisekund, kiedy robot schodzi. Wystarczy
więc, żeby współrzędna Z punktu docelowego została ustalona najpóźniej jak się da,
ale wciąż zanim planer zatwierdzi ostatni segment ruchu. To jest czysty AS.

RTPM zarabia na siebie tam, gdzie cel ucieka *w trakcie* ruchu: śledzenie
przenośnika, spoiny, kompensacja ruchomego podłoża. Tutaj byłoby armatą na wróbla
— i jeszcze taką, która zatrzymuje robota.

## Trzy kroki cyklu

1. **Pomiar w locie.** Robot zjeżdża nad stos jednym długim ruchem. Przez cały ten
   czas zadanie PC `pl_probe` próbkuje dalmierz co 10 ms i uaktualnia estymatę
   szczytu. Zadanie ruchu nigdy na nic nie czeka — czyta gotową liczbę.
2. **Zamrożenie na 50 cm.** Gdy zmierzona odległość spadnie do `pl.zcom`
   (domyślnie 500 mm), próbki przestają być przyjmowane. Poniżej tej wysokości
   punkt pobrania jest już ustalony, dokładnie tak, jak wymaga tego aplikacja.
3. **Łańcuch segmentów zamiast jednego ruchu.** Ostatnie 500 mm jest podzielone na
   `pl.nseg` segmentów sklejanych przez `CP ON` + `ACCURACY`, z których każdy jest
   wystawiany z aktualną estymatą. Segmenty leżą na jednej prostej, więc nic tu nie
   jest ścinane i robot nie zwalnia między nimi — a punkt docelowy jest wiązany tak
   późno, jak pozwala wyprzedzenie planera. Nawet gdyby planer zdążył zaplanować
   pierwszy segment ze starą wartością, kolejne ściągają tor do właściwej wysokości.

Nigdzie w cyklu nie ma `BREAK`, `SWAIT` ani `TWAIT`. Dlatego bufor planera nigdy
się nie opróżnia i robot nie zwalnia. Jedyny `BREAK` w pliku jest po ostatnim
cyklu, żeby doczekać końca ruchu przed ubiciem zadań PC.

## Uruchomienie w neoROSET

1. Wstaw do sceny robota serii CP i ustaw go **wysoko nad środkiem stosu**, z
   zapasem w dół co najmniej 1,2 m i z zapasem `pl.xpl` (900 mm) w bok w osi X.
   Ta poza jest punktem odniesienia dla całej geometrii — niczego nie trzeba uczyć.
2. Wczytaj `as/plate.as` do wirtualnego kontrolera.
3. Tryb `REPEAT`, moc silników ON, **prędkość monitora 100 %**. Mimo `ABS.SPEED ON`
   prędkość programowa 1500 mm/s obowiązuje tylko wtedy, gdy prędkość maksymalna
   pomnożona przez prędkość monitora jest od niej większa — przy niskim monitorze
   robot pojedzie wolniej i pomiar wydajności wyjdzie nieprawdziwy.
4. `>EXECUTE pl_cycle`

Dalmierza nie ma jeszcze na stanowisku, więc jego rolę pełni zadanie PC `pl_sim`:
utrzymuje wirtualny stos, dokłada na niego płyty co `pl.tadd` sekund i zwraca
odległość obarczoną szumem, kwantyzacją do rozdzielczości czujnika i opóźnieniem
toru pomiarowego. To jedyny program, którego na stanowisku się nie uruchamia.

Podgląd wizualny: włącz rysowanie śladu TCP. Przy `pl.adapt = 1` widać, że dno
zjazdu wędruje razem ze stosem, a przy `pl.adapt = 0` tor jest zawsze taki sam.

## Co pokazuje raport

Po ostatnim cyklu `pl_report` wypisuje na terminal tabelę i podsumowanie:

| Kolumna | Znaczenie |
| --- | --- |
| `t_cykl` | czas między kolejnymi pobraniami, mierzony przez zadanie PC na rzeczywistym ruchu, a nie na przepływie programu |
| `szczyt` | prawdziwa wysokość szczytu stosu z symulatora |
| `estym` | wysokość, którą wyliczył estymator i która poszła do ostatniego segmentu |
| `blad` | o ile TCP minęło się z prawdziwym szczytem — dokładność całego układu |
| `v_min` | najmniejsza prędkość TCP w cyklu |
| `t_wolno` | łączny czas w cyklu z prędkością poniżej `pl.vslow` |

Dwie rzeczy do sprawdzenia:

- **Brak zatrzymań** — `v_min` wyraźnie większe od zera i `t_wolno` bliskie zeru.
- **Brak straty wydajności** — średni czas cyklu taki sam jak w przebiegu
  odniesienia. Puść raz z `pl.adapt = 0` (stały punkt pobrania, bez pomiaru)
  i porównaj tę jedną liczbę.

Pierwszy cykl jest z raportu pomijany: robot startuje z postoju, więc jego `v_min`
i czas cyklu niczego nie mówią.

W kolumnie `blad` zobaczysz stały dodatni offset mniej więcej równy `pl.accp`.
To nie jest błąd pomiaru, tylko ścięcie naroża na zawrocie: przy `ACCURACY 3` robot
zawraca 3 mm nad zadanym punktem. Zmniejszenie `pl.accp` zbija ten offset, ale
obniża `v_min` — i to jest właśnie ten kompromis, który trzeba świadomie wybrać.

## Eksperymenty, które warto puścić

| Zmiana | Co zobaczysz |
| --- | --- |
| `pl.tau = 0` | błąd rośnie wprost z prędkością zjazdu — to najłatwiejsza do przeoczenia pułapka całego układu (patrz niżej) |
| `pl.adapt = 0` | punkt pobrania stały, błąd rośnie z każdą dołożoną płytą; czas cyklu do porównania |
| `pl.vfast` 1000 / 2000 / 3000 | przy poprawnym `pl.tau` błąd nie powinien zależeć od prędkości |
| `pl.nseg` 1 vs 5 | przy 1 segmencie punkt jest wiązany wcześniej; jeśli wynik się pogarsza, znaczy, że planer wyprzedza głębiej niż o jeden ruch |
| `pl.accp` 1 / 3 / 20 | wymiana dokładności na `v_min` |
| `pl.thru` > 0 | pobranie w przelocie: zawrót zamienia się w płaskie U i `v_min` przestaje siadać, kosztem ruchu poziomego w chwili zetknięcia z płytą |
| `pl.nadd`, `pl.tadd` | jak szybko stos może rosnąć, zanim estymator przestanie nadążać |

## Opóźnienie toru pomiarowego — najważniejszy parametr

Czujnik plus magistrala plus cykl zadania PC dają opóźnienie `pl.tau`. Odczyt, który
przychodzi teraz, opisuje sytuację sprzed `pl.tau` sekund, kiedy TCP było wyżej.
Bez poprawki wynik zależy od prędkości zjazdu, i to bardzo: przy 30 ms opóźnienia
i zjeździe 3000 mm/s to 90 mm błędu. `pl_probe` liczy prędkość pionową sama i
odejmuje `vz * pl.tau`, przez co błąd znika.

Na stanowisku `pl.tau` trzeba **zmierzyć, a nie oszacować**. Najprościej tak: puść
kilka cykli przy `pl.tau = 0` i przy dwóch różnych `pl.vfast`. Błąd jest wtedy
liniowy względem prędkości, a jego nachylenie to dokładnie `pl.tau`.

## Co się zmienia, gdy przyjedzie prawdziwy dalmierz

Jeden program, `pl_read`, i nic poza tym. Ma ustawić `pl.d` na odległość TCP od
powierzchni w milimetrach. Reszta pliku nie wie, skąd ta liczba pochodzi.

Dla EtherNet/IP i dla zwykłego PLC kod jest ten sam, bo w obu przypadkach wartość
ląduje w obrazie wejść sterownika i czyta się ją jednakowo:

```
pl.d = BITS(pl.sig,16)/10.0
```

Wyjście analogowe wymagałoby karty ADC (osobna opcja), więc jeśli będzie wybór,
warto celować w wariant z wartością na magistrali. Poza `pl_read` zmienia się tylko
tyle, że `pl_sim` przestaje być uruchamiany, a w `pl_watch`, w miejscu wykrycia
zawrotu, wchodzi `SIGNAL` załączający chwytak.

Trzy stałe do skalibrowania na stanowisku: `pl.hoff` (offset czujnika względem TCP,
raz, na wzorcu o znanej wysokości), `pl.tau` (jak wyżej) oraz `pl.dmin` / `pl.dmax`
z karty katalogowej czujnika.

## Ograniczenia, o których trzeba wiedzieć

- **Okno pomiarowe musi być dość długie.** Liczba próbek na zjazd to
  `(wysokość startu nad stosem − pl.zcom) / pl.vfast / pl.pdt`. Przy domyślnych
  wartościach wychodzi około 20. Poniżej mniej więcej 10 estymata przestaje być
  wiarygodna — wtedy albo zacznij zjazd wyżej, albo obniż `pl.zcom`.
- **Pomiar jest korektą modelu, nie jedynym źródłem prawdy.** Odchyłka większa niż
  `pl.tol` (200 mm) jest odrzucana, a przy braku świeżych próbek robot jedzie na
  modelu. Zły odczyt może pogorszyć pozycję o `pl.tol`, ale nie wbije robota w stos.
- **Płyty dokładane w trakcie zjazdu to problem kolizyjny, którego ten program nie
  rozwiąże.** Estymata jest zamrażana 500 mm nad stosem; jeśli w tym czasie stos
  urośnie, robot uderzy. Na to potrzebna jest blokada po stronie podajnika.
- **Zawrót o 180 stopni oznacza, że pionowa składowa prędkości musi przejść przez
  zero.** To nie jest postój i nie kosztuje czasu cyklu, ale `v_min` będzie małe.
  Jeśli ma być inaczej, trzeba pobierać w przelocie (`pl.thru`), a to wymaga
  podatnej przyssawki.
- Symulator neoROSET nie odwzorowuje twardych gwarancji czasu rzeczywistego.
  Wyniki traktuj jako charakterystykę jakościową i porównanie wariantów.

## Parametry (`pl_init`)

| Zmienna | Domyślnie | Znaczenie |
| --- | --- | --- |
| `pl.adapt` | 1 | 1 = wysokość z dalmierza, 0 = stały punkt (przebieg odniesienia) |
| `pl.zcom` | 500 mm | wysokość zamrożenia estymaty nad stosem |
| `pl.nseg` | 5 | liczba segmentów zjazdu poniżej zamrożenia |
| `pl.tol` | 200 mm | maksymalna korekta względem modelu |
| `pl.vfast` | 1500 mm/s | prędkość; zawsze z jednostką `MM/S`, inaczej AS czyta procenty (E0106) |
| `pl.acc` | 150 mm | `ACCURACY` na trasie |
| `pl.accp` | 3 mm | `ACCURACY` w punkcie pobrania |
| `pl.thru` | 0 mm | odsunięcie w X dla pobrania w przelocie |
| `pl.tau` | 0,03 s | opóźnienie toru pomiarowego |
| `pl.pdt` | 0,01 s | okres próbkowania estymatora |
| `pl.alfa` | 0,35 | filtr wykładniczy estymaty |
| `pl.grip` | 5 mm | wysokość TCP nad szczytem w chwili pobrania |
| `pl.vslow` | 40 mm/s | poniżej tej prędkości uznajemy, że robot stoi |

---

# Wcześniejszy test funkcji RTPM

Poniższa część dokumentu opisuje stanowisko `zchase.as`, którym sprawdzana była
sama funkcja RTPM, oraz `zstack.as` — pomiar wysokości stosu na postoju. Do
`plate.as` nie są potrzebne; zostają jako opis tego, skąd wzięły się powyższe
wnioski, i jako narzędzie diagnostyczne, gdyby ktoś chciał jeszcze raz podejść
do samej opcji.

Jedna rzecz warta sprawdzenia przy okazji, bo jest tania: jeżeli postój przy RTPM
występuje **raz, w miejscu włączenia opcji**, to instrukcja włączająca opróżnia
bufor planera i obejściem jest włączenie RTPM w pozycji bazowej, gdzie postój nic
nie kosztuje, i trzymanie go włączonego przez cały cykl z korektą zerową poza
zjazdem. Jeżeli natomiast postój powtarza się za każdym razem w miejscu, gdzie
korekta zaczyna napływać, to interpolator głoduje na danych (potwierdzi to błąd
E1090) i w tej konfiguracji opcja po prostu nie wyrobi.

## Programy w `as/zchase.as`

| Program | Rola |
| --- | --- |
| `zc_init` | parametry testu — jedyne miejsce do edycji przy strojeniu |
| `zc_gen` | PC task 2 — generator uciekającego punktu w Z |
| `zc_log` | PC task 3 — próbkowanie zadanej i rzeczywistej pozycji |
| `zc_send` | **jedyne miejsce zależne od opcji RTPM** |
| `zc_main` | test właściwy: ruch nośny w X + korekta RTPM w Z |
| `zc_main_std` | test odniesienia bez opcji: pościg ciągiem krótkich `LMOVE` |
| `zc_report` | zrzut logu CSV + statystyki na terminal |
| `zc_stop` | awaryjne ubicie zadań PC |

Żadnej pozy nie trzeba uczyć — punktem odniesienia jest bieżąca poza robota
(`POINT zc.home = HERE`), a punkty skrajne ruchu nośnego liczone są przez `SHIFT`.
Przed startem sprawdzane są one przez `INRANGE`, więc program nie ruszy, jeśli
robot stoi za blisko krańca obszaru.

## Trzy profile ruchu celu (`zc.mode`)

1. **Sinus** — `z = z0 + A·sin(2πft)`. Podstawowy pomiar pasma. Puszczasz serię
   przebiegów dla `zc.freq` = 0.1 / 0.2 / 0.5 / 1.0 Hz przy stałej amplitudzie i
   patrzysz, przy której częstotliwości wzmocnienie spada poniżej ~0.7 (−3 dB).
   To jest realne pasmo korekty RTPM w tej konfiguracji.
2. **Schodek** — skok o `zc.stepdz` co `zc.stepdt` sekund. Pokazuje maksymalną
   prędkość narastania korekty i to, przy jakim skoku kontroler zgłosi
   przekroczenie limitu (E1092).
3. **Uciekający punkt** (domyślny) — cel rusza w górę dopiero wtedy, gdy robot
   podejdzie bliżej niż `zc.gap`, odbija się od krańców `zc.zup` / `zc.zdn` i
   przelatuje obok robota w drugą stronę. Efekt: robot goni punkt, punkt ucieka,
   a w logu widać powtarzalny cykl dogonienie → ucieczka → nawrót. To wariant
   najbardziej „widowiskowy” i najlepszy do pokazania działania, ale do liczb
   lepszy jest sinus, bo ma znaną częstotliwość.

## Uruchomienie w neoROSET

1. Wstaw do sceny robota serii CP i ustaw go **mniej więcej w środku obszaru
   roboczego**, z zapasem w osi Z co najmniej `zc.lim + zc.zup` (domyślnie 140 mm)
   w górę i w dół oraz `zc.xamp` (250 mm) na boki.
2. Wczytaj `as/zchase.as` do wirtualnego kontrolera (Load / Import AS).
3. Tryb `REPEAT`, moc silników ON, prędkość monitora ustaw na 50 % (przy
   `ABS.SPEED ON` prędkość programowa 300 mm/s i tak obowiązuje).
4. **Najpierw przebieg odniesienia, bez RTPM:**

   ```
   >EXECUTE zc_main_std
   ```

   Ten wariant działa na gołym AS, bez żadnych opcji. Sprawdza cały rig
   (generator, logger, raport) i daje punkt odniesienia dla porównania.
5. Skopiuj z terminala blok między `---- BEGIN CSV ----` a `---- END CSV ----`
   do pliku `log_std.csv`.
6. **Potem przebieg z RTPM:** uzupełnij `zc_send` oraz miejsca oznaczone
   `TUTAJ WLACZ/WYLACZ RTPM` w `zc_main` (patrz niżej) i uruchom:

   ```
   >EXECUTE zc_main
   ```

7. Porównaj:

   ```
   python3 tools/zc_analyze.py log_rtpm.csv --compare log_std.csv --plot
   ```

Podgląd wizualny: włącz w neoROSET rysowanie śladu TCP — przy działającym RTPM
tor w płaszczyźnie XZ przestaje być linią prostą i zaczyna falować, mimo że
program wykonuje tylko `LMOVE` między dwoma punktami o tym samym Z.

## Co ustawić na teach pendancie

Rig nie wymaga żadnej konfiguracji na TP: nie ma uczonych poz, nie używa sygnałów
I/O ani panelu operatora. Zostaje tylko normalne przygotowanie do uruchomienia —
tryb `REPEAT`, teach lock zwolniony, moc silników ON, skasowane błędy i prędkość
monitora. Prędkość monitora ma znaczenie, mimo `ABS.SPEED ON`: prędkość programowa
obowiązuje tylko wtedy, gdy `prędkość maksymalna × prędkość monitora` jest od niej
większa. Przy 300 mm/s i monitorze ustawionym na kilka procent robot pojedzie
wolniej, niż zakłada test, i pomiar nadążania wyjdzie zbyt optymistyczny.

Trzy rzeczy, które warto sprawdzić, bo psują wynik po cichu:

- **`TOOL` i `BASE`.** `DZ(HERE)` zwraca Z aktualnego TCP w układzie bazowym, więc
  jeśli `BASE` jest przesunięty albo obrócony, „oś Z” w logu nie jest pionem.
  Do testu najprościej mieć `BASE` zerowy (`>BASE NULL`) i świadomie wybrane
  narzędzie — samo `TOOL` nie zmienia kierunku Z, ale przesuwa punkt, którego
  wysokość mierzysz.
- **Gdzie ląduje log.** `TYPE` pisze na terminal (okno terminala neoROSET / KRterm),
  nie na TP — na pendancie CSV się nie pojawi. Dodatkowo przełącznik systemowy
  `MESSAGES` musi być ON (domyślnie jest; sprawdzisz przez `>SWITCH MESSAGES`).
- **Układ, w którym RTPM nakłada korektę.** Jeżeli opcja pozwala wybrać między
  układem bazowym a narzędzia, dla tego testu ma być bazowy. W CP oś narzędzia
  jest równoległa do Z bazowego, więc korekta w układzie narzędzia też pójdzie
  pionowo — ale z odwróconym znakiem, bo narzędzie patrzy w dół. Objaw jest
  jednoznaczny: robot zamiast gonić punkt, ucieka od niego w przeciwną stronę.

Podgląd na samym pendancie jest możliwy, ale wymaga zdefiniowania okna tekstowego
w funkcji pomocniczej 0509 — wtedy odkomentuj linię `IFPWOVERWRITE` w `zc_log`.

## Co trzeba uzupełnić — `zc_send`

Składni instrukcji samej opcji nie ma w podręczniku AS Language Reference
(sprawdziłem manuale sterowników E i F — jest tam tylko lista błędów RTPM,
E1090–E1093 i E6533). Instrukcje są opisane w osobnym manualu opcji
**90210-1333 „Real Time Path Modification by User Input”**. Dlatego cały rig jest
zbudowany tak, że zależność od opcji siedzi w jednym, trzylinijkowym programie
`zc_send` — reszta (generator, ograniczniki, logger, analiza) jest od opcji
niezależna.

Przy wpinaniu instrukcji sprawdź w manualu opcji jedną rzecz, która zmienia
wszystko: czy korekta jest **bezwzględna** (całkowite przesunięcie względem toru
nauczonego), czy **przyrostowa** (delta na cykl). Rig wystawia obie postaci:

- bezwzględna → przekaż `0, 0, .dz`
- przyrostowa → przekaż `0, 0, .dz-zc.dzsent`

Jeśli pomylisz te dwie konwencje, korekta albo się scałkuje i ucieknie w limit,
albo w ogóle nie ruszy — objaw jest na tyle charakterystyczny, że od razu widać,
która wersja jest poprawna.

### Jak ustalić prawdziwą nazwę instrukcji

Nie zgaduj nazwy — sterownik potrafi ją wypisać sam. Z terminala:

```
>HELP/P          lista instrukcji programowych (opcjonalnie z literą, np. HELP/P R)
>HELP/F          lista funkcji
>HELP/SW         lista przełączników systemowych
>HELP/PPC        instrukcje dopuszczalne w zadaniach PC
>ID              wersja oprogramowania sterownika
```

Listy pochodzą z tablicy słów kluczowych **tego** sterownika, więc pokazują dokładnie
to, co jest w nim zainstalowane. Jeśli instrukcji RTPM nie ma na żadnej z nich,
to rozszerzenia AS tej opcji po prostu w tym sterowniku nie ma i żadna składnia
nie zadziała.

Warto przy tym rozróżnić dwie klasy błędów, bo mówią o zupełnie różnych problemach:

- **P0109 „Invalid statement”** to błąd parsera, zgłaszany już przy wpisywaniu lub
  wczytywaniu kroku. Znaczy tyle, że AS nie zna takiego słowa kluczowego — czyli
  albo nazwa instrukcji jest zła, albo opcji nie ma w oprogramowaniu sterownika.
- **„Option is not set up”** i błędy z serii E to błędy wykonania. Pojawiają się
  dopiero wtedy, gdy instrukcja jest rozpoznana, ale opcja nie jest odblokowana
  albo dane korekty są nie do przyjęcia.

Innymi słowy: dopóki widzisz P0109, problem jest po stronie nazwy/instalacji, a nie
licencji ani parametrów.

## Ograniczenia serii CP

CP to paletyzator: cztery osie, kołnierz zawsze pionowy. Fizycznie realizowalne
są tylko korekty **X, Y, Z i obrót wokół Z**. Zadanie korekty w RX/RY skończy się
błędem konfiguracji (E1089 — „Cannot do linear motion in current configuration”),
niezależnie od tego, czy RTPM je przyjmie. Test jest celowo zbudowany na osi Z,
bo dla paletyzatora to jedyna oś, w której korekta ma sens procesowy
(dopasowanie wysokości odkładania warstwy, kompensacja ugięcia palety).

Warto też trzymać test w środkowej części obszaru — przy dużych korektach blisko
krańców łatwo trafić na ograniczenie sprzężenia Jt2/Jt3 (E1120).

## Parametry warte strojenia (`zc_init`)

| Zmienna | Domyślnie | Znaczenie |
| --- | --- | --- |
| `zc.mode` | 3 | profil celu: 1 sinus, 2 schodek, 3 uciekający punkt |
| `zc.dt` | 0.02 s | okres generatora; poniżej ~0.01 s zadanie PC przestaje wyrabiać |
| `zc.lim` | 80 mm | maksymalna korekta — pierwszy kandydat do sprawdzenia, gdzie leży limit opcji |
| `zc.rate` | 2.0 mm/cykl | limit prędkości korekty (2 mm / 0.02 s = 100 mm/s) |
| `zc.vflee` | 40 mm/s | jak szybko ucieka punkt |
| `zc.gap` | 15 mm | dystans wyzwalający ucieczkę |
| `zc.vcar` | 300 mm/s | prędkość ruchu nośnego w X |
| `zc.acc` | 50 mm | `ACCURACY` — im większe, tym gładsze zlewanie segmentów w CP |
| `zc.seg` | 10 mm | minimalna długość segmentu w `zc_main_std` (tylko wariant odniesienia) |

`zc.lim` i `zc.rate` są celowo zachowawcze. Chronią przed E1092 („Modulation data
is over limit”) i E1118 („Command value for JtXX suddenly changed”) — czyli przed
sytuacją, w której test wywala się na błędzie zamiast pokazać charakterystykę.
Właściwy sposób znalezienia granic to podnoszenie ich krokami aż do pierwszego
błędu, a nie zgadywanie.

## Interpretacja wyników

`zc_analyze.py` liczy:

- **uchyb max / średni / RMS** — o ile robot spóźnia się za punktem,
- **opóźnienie z korelacji wzajemnej** — działa dla każdego profilu, rozdzielczość
  równa okresowi próbkowania (50 ms),
- **wzmocnienie i przesunięcie fazy** (przy `--freq`) — dopasowanie sinusa metodą
  najmniejszych kwadratów do celu i do pozycji rzeczywistej; to jest najdokładniejszy
  pomiar opóźnienia, bo nie jest kwantowany okresem próbkowania,
- **maksymalną prędkość celu i osiągniętą prędkość korekty** — jeśli druga jest
  wyraźnie mniejsza od pierwszej, uderzasz w limit prędkości korekty, a nie w pasmo.

Sens porównania obu wariantów: w `zc_main_std` korekta może wejść dopiero na
granicy segmentu, więc opóźnienie jest związane z czasem segmentu (`zc.seg`
podzielone przez `zc.vcar`) i głębokością bufora planera — rośnie, gdy zwiększysz
`zc.seg`, i to jest dobry test na to, czy pomiar w ogóle mierzy to, co trzeba:
przy `zc.seg` 10 → 30 mm opóźnienie wariantu odniesienia powinno wyraźnie urosnąć,
a opóźnienie RTPM nie powinno się zmienić, bo tam korekta wchodzi w interpolatorze,
a nie między segmentami. Jeżeli obie liczby zmieniają się tak samo, to znak, że
korekta w ogóle nie dociera do interpolatora — najpierw sprawdź konwencję korekty
w `zc_send`, a potem czy opcja jest faktycznie odblokowana.

## Typowe błędy

| Objaw | Przyczyna |
| --- | --- |
| E0106 „Value is out of range” na kroku z `SPEED` | prędkość podana bez jednostki — AS czyta samą liczbę jako procenty, więc `SPEED 300` to 300 %; musi być `SPEED zc.vcar MM/S ALWAYS` |
| P0109 „Invalid statement” przy instrukcji RTPM | parser nie zna tego słowa kluczowego — zła nazwa instrukcji albo brak rozszerzenia AS opcji w sterowniku; sprawdź `>HELP/P` |
| „Step format incorrect” przy wczytywaniu pliku | to samo co wyżej, tylko wychodzi podczas `LOAD` — wybierz zakomentowanie kroku i popraw go w edytorze |
| „Option is not set up” | opcja RTPM nie jest odblokowana w wirtualnym kontrolerze — wymaga licencji od Kawasaki, samo neoROSET jej nie doda |
| E1090 „External modulation data is not input” | RTPM włączony, ale nic nie przychodzi — generator nie wystartował albo `zc_send` jest puste |
| E1091 / E1092 | dane korekty poza dopuszczalnym zakresem — zmniejsz `zc.lim` / `zc.rate` |
| E1093 „Incorrect motion instruction to execute modulate motion” | RTPM włączony przy instrukcji ruchu, która go nie obsługuje — korekta musi lecieć na ruchu liniowym/CP |
| E1095 | próba wykonania instrukcji ruchu w zadaniu PC — generator ma tylko liczyć |
| E6533 „No RTPM board” | konfiguracja celuje w wariant sprzętowy (czujnik łuku), nie w wariant „by user input” |

## Zastosowanie docelowe: pomiar wysokości stosu warstw

Jeżeli dalmierz na kiści ma służyć do znajdowania wysokości stosu przy
paletyzacji, to warto się zatrzymać nad jednym pytaniem, zanim pójdą pieniądze
na opcję: **RTPM prawdopodobnie nie jest do tego potrzebny.** Stos nie rusza się
w trakcie odkładania warstwy. Zmienia wysokość między cyklami, a nie w czasie
ruchu, więc korekta sprowadza się do przesunięcia punktu odłożenia przed ruchem
(`POINT put = SHIFT(put BY 0,0,dz)`) — a to działa na gołym AS, bez żadnej opcji.

RTPM zarabia na siebie wtedy, gdy cel ucieka *podczas* ruchu: śledzenie
przenośnika, śledzenie spoiny, praca siłowa, kompensacja ruchomego podłoża.
Do wysokości warstwy to armata na wróbla — i dlatego test „uciekającego punktu”
z `zchase.as` jest dobrym testem samej funkcji RTPM, ale **nie** jest testem
Twojej aplikacji. Dla niej rozstrzygająca jest powtarzalność pomiaru, a nie pasmo
korekty. Do tego służy `zstack.as`.

Geometria wychodzi tu wyjątkowo wygodnie: w CP kołnierz jest zawsze pionowy, więc
wiązka dalmierza jest równoległa do Z bazowego i wysokość szczytu to zwykłe
odejmowanie, `z_szczytu = DZ(HERE) - offset`. Żadnych obrotów ani przeliczeń
układów — `offset` kalibrujesz raz, na wzorcu o znanej wysokości.

### Co decyduje o wyborze rozwiązania: interfejs czujnika

| Interfejs dalmierza | Co potrzebne po stronie sterownika |
| --- | --- |
| wyjście przełączające (próg) | nic — zwykłe wejście dwustanowe, `SIG()` / `SWAIT` |
| odległość jako słowo na magistrali (PLC, fieldbus) | nic — `BITS(pierwszy_sygnal, 16)` czyta słowo jako liczbę |
| wyjście analogowe | karta wejść analogowych (osobna opcja; błędy E1000/E1001 dotyczą właśnie ADC) |
| Ethernet / port szeregowy | opcja TCP/IP lub RS-232 |

Dwa pierwsze warianty nie wymagają żadnej opcji, więc jeśli tylko dalmierz je ma,
to jest najkrótsza droga do działającego układu.

### Jak działa `zstack.as`

Robot zjeżdża powoli w dół, a zadanie PC (`zs_watch`) czeka na sygnał z czujnika
i zatrzymuje ruch instrukcją `BRAKE` — to jedyna instrukcja ruchu dozwolona
w zadaniach PC i właśnie po to jest. Pozycja odczytywana jest tuż przed
zatrzymaniem, więc zawiera możliwie mało drogi hamowania.

I tu jest sedno dokładności: pozycja po `BRAKE` to pozycja **zatrzymania**, a nie
pozycja zadziałania czujnika. Różnica to droga hamowania plus opóźnienie jednego
cyklu zadania PC, i rośnie wprost z prędkością przejazdu. Dlatego `zs_repeat`
powtarza pomiar `zs.n` razy i podaje rozrzut oraz odchylenie standardowe —
i dlatego warto go przepuścić przy kilku wartościach `zs.vsearch`. Jeśli wynik
zależy od prędkości, dominuje hamowanie i masz dwa wyjścia: zwolnić przejazd albo
sięgnąć po `HSENSESET` / `HSENSE` (też opcja, ale inna i znacznie bardziej
typowa), które zatrzaskują pozę w chwili zbocza sygnału, niezależnie od tego, ile
robot jeszcze przejedzie zanim stanie.

Uruchomienie: ustaw robota nad stosem i `>EXECUTE zs_repeat`.

## Uwaga o pomiarach w symulacji

Wszystkie czasy w logu pochodzą z zegara kontrolera (`TIMER(0)`), nie z zegara
PC-ta, więc są odporne na to, że symulacja chodzi wolniej lub szybciej od czasu
rzeczywistego. Mimo to wyniki z neoROSET traktuj jako charakterystykę
jakościową — kolejność wielkości i porównanie wariantów są miarodajne,
ale twardych gwarancji czasu rzeczywistego symulator nie odwzorowuje.
