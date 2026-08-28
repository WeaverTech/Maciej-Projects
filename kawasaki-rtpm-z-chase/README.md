# RTPM Z-chase — test „uciekającego punktu” w osi Z (Kawasaki CP, neoROSET)

Stanowisko testowe do sprawdzenia funkcji RTPM (Real Time Path Modification) na
robocie serii CP w symulatorze neoROSET. Generator w zadaniu PC tworzy wirtualny
punkt, który wędruje/ucieka w osi Z, a robot ma go gonić korektą RTPM nakładaną
na wolny ruch nośny w osi X. Log z przebiegu wychodzi na terminal jako CSV i jest
przeliczany na konkretne liczby: uchyb nadążania, opóźnienie, tłumienie amplitudy.

Sedno testu nie polega na tym, żeby „ładnie się ruszało”, tylko żeby zmierzyć trzy
rzeczy, które w praktyce decydują o użyteczności RTPM: **jak szybko** korekta nadąża,
**jak duża** korekta jest jeszcze przyjmowana i **jakie opóźnienie** wnosi cała pętla.

## Zawartość

| Plik | Rola |
| --- | --- |
| `as/zchase.as` | wszystkie programy AS (generator, logger, ruch, raport) |
| `tools/zc_analyze.py` | analiza logu CSV: uchyb, opóźnienie, wzmocnienie, wykres |

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
| P0109 „Invalid statement” przy instrukcji RTPM | parser nie zna tego słowa kluczowego — zła nazwa instrukcji albo brak rozszerzenia AS opcji w sterowniku; sprawdź `>HELP/P` |
| „Step format incorrect” przy wczytywaniu pliku | to samo co wyżej, tylko wychodzi podczas `LOAD` — wybierz zakomentowanie kroku i popraw go w edytorze |
| „Option is not set up” | opcja RTPM nie jest odblokowana w wirtualnym kontrolerze — wymaga licencji od Kawasaki, samo neoROSET jej nie doda |
| E1090 „External modulation data is not input” | RTPM włączony, ale nic nie przychodzi — generator nie wystartował albo `zc_send` jest puste |
| E1091 / E1092 | dane korekty poza dopuszczalnym zakresem — zmniejsz `zc.lim` / `zc.rate` |
| E1093 „Incorrect motion instruction to execute modulate motion” | RTPM włączony przy instrukcji ruchu, która go nie obsługuje — korekta musi lecieć na ruchu liniowym/CP |
| E1095 | próba wykonania instrukcji ruchu w zadaniu PC — generator ma tylko liczyć |
| E6533 „No RTPM board” | konfiguracja celuje w wariant sprzętowy (czujnik łuku), nie w wariant „by user input” |

## Uwaga o pomiarach w symulacji

Wszystkie czasy w logu pochodzą z zegara kontrolera (`TIMER(0)`), nie z zegara
PC-ta, więc są odporne na to, że symulacja chodzi wolniej lub szybciej od czasu
rzeczywistego. Mimo to wyniki z neoROSET traktuj jako charakterystykę
jakościową — kolejność wielkości i porównanie wariantów są miarodajne,
ale twardych gwarancji czasu rzeczywistego symulator nie odwzorowuje.
