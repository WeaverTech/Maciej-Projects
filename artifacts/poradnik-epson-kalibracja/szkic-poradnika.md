# [SZKIC] Kalibracja kamery w systemie wizyjnym EPSON Vision Guide 8.0

> Szkic roboczy. `[ZRZUT nn]` = miejsce na zrzut ekranu (`image01.png`, …), `[SPRAWDZIĆ]` = nazwa
> lub zachowanie do potwierdzenia na stanowisku. Główny przykład: kamera **Fixed Downward**
> (nieruchoma, patrząca w dół) + robot SCARA. Sekcja o pozostałych typach montażu jest opcjonalna.

**Propozycje tytułu:**
- Kalibracja kamery w systemie wizyjnym EPSON Vision Guide 8.0 krok po kroku
- Roboty przemysłowe EPSON: kalibracja kamery w środowisku RC+ 8
- Jak skalibrować kamerę z robotem EPSON? Vision Guide 8.0 w praktyce

---

## Ramka: Z tego artykułu dowiesz się:

- jak przygotować stanowisko i kamerę do kalibracji z robotem EPSON,
- jak przeprowadzić kalibrację kamery w Vision Guide 8.0 i ocenić jej wyniki,
- jak wykorzystać skalibrowaną kamerę w programie SPEL+ do wyznaczania pozycji obiektów.

---

Dzięki temu poradnikowi dowiesz się, jak połączyć układ współrzędnych kamery z układem współrzędnych
robota EPSON. Bez tego kroku kamera potrafi jedynie powiedzieć, w którym miejscu obrazu (w pikselach)
znajduje się obiekt, a robot nie ma jak przełożyć tej informacji na ruch. Przejdziemy przez przygotowanie
stanowiska, kreator kalibracji, uczenie punktów i interpretację wyników, a na koniec sprawdzimy kalibrację
prostym programem, w którym robot dojeżdża do obiektów wskazanych przez kamerę.

Jeśli dopiero zaczynasz pracę z systemem wizyjnym EPSON, warto najpierw zapoznać się z artykułem
[Symulacja systemu wizyjnego w środowisku EPSON RC+ 8](https://www.astor.com.pl/poradnikautomatyka/symulacja-systemu-wizyjnego-w-srodowisku-epson-rc-8/),
w którym opisano tworzenie projektu, dodawanie kamery i pierwszych sekwencji.

## Po co kalibrować kamerę?

Obraz z kamery to dla robota tylko siatka pikseli. Informacja „obiekt znajduje się w punkcie (512, 384)”
nie mówi nic o tym, gdzie robot ma ustawić chwytak. Kalibracja wyznacza zależność pomiędzy pikselami
obrazu a współrzędnymi robota w milimetrach - uwzględnia skalę (ile milimetrów przypada na jeden piksel),
obrót kamery względem osi robota oraz położenie kamery na stanowisku.

Dopiero po kalibracji wynik sekwencji wizyjnej można odczytać bezpośrednio we współrzędnych robota
(**RobotXYU**) i użyć w poleceniu ruchu. To podstawa aplikacji pick and place, sortowania detali z taśmy,
podawania elementów ze stołu wibracyjnego czy korekcji położenia detalu w chwytaku.

Warto pamiętać, że kalibracja jest ważna tylko dla konkretnego ustawienia. Zmiana wysokości kamery,
ostrości, przysłony, obiektywu albo wysokości płaszczyzny roboczej oznacza konieczność jej powtórzenia.

## Potrzebne urządzenia i oprogramowanie

Do wykonania kalibracji opisanej w artykule wykorzystano:

- robota EPSON [MODEL, np. SCARA GX4] z kontrolerem [RC700-A / RC800],
- system wizyjny [CV2 / PV1 / kamera GigE] z obiektywem [OGNISKOWA],
- oprogramowanie EPSON RC+ [WERSJA] z modułem Vision Guide 8.0, które można pobrać bezpłatnie ze
  [strony internetowej ASTOR](https://www.astor.com.pl/oferta/robotyzacja/roboty-przemyslowe/oprogramowanie-narzedziowe/epson-rc.html),
- wzorzec kalibracyjny - płytkę z dziewięcioma znacznikami ułożonymi w siatce 3×3 [OPIS/ZDJĘCIE],
- końcówkę roboczą ze szpicem (lub chwytak z dobrze wyznaczonym punktem TCP).

Szczegółowe informacje o podłączeniu sprzętu można znaleźć w dokumentacji producenta
(*Vision Guide 8.0 Software* oraz *Vision Guide 8.0 Hardware & Setup*).

## Przygotowanie stanowiska

Jakość kalibracji zależy w dużej mierze od tego, co zrobimy, zanim w ogóle otworzymy kreator.
Przed rozpoczęciem należy:

- ustawić kamerę na docelowej wysokości i zablokować jej mocowanie,
- ustawić ostrość i przysłonę obiektywu, a następnie zablokować pierścienie,
- dobrać oświetlenie tak, aby znaczniki wzorca były wyraźnie widoczne i nie odbijały światła,
- położyć wzorzec na tej samej wysokości, na której będą leżały detale,
- wyznaczyć offset narzędzia (**Tool**) - kalibracja jest tak dokładna, jak dokładnie robot zna położenie
  swojego TCP.

`[ZRZUT 01: zdjęcie stanowiska - kamera nad stołem, wzorzec, robot]`

Istotnym jest, aby wzorzec zajmował jak największą część pola widzenia kamery. Znaczniki rozmieszczone
tylko w środku kadru dadzą poprawne wyniki w środku obrazu, ale na jego brzegach błąd będzie rósł.

## Sekwencja wyszukująca znaczniki

Kalibracja wymaga sekwencji, która znajdzie na obrazie wszystkie dziewięć znaczników wzorca.
W oknie **Vision** tworzymy nową sekwencję przyciskiem: `[IKONA]` i nadajemy jej nazwę, np. **CalTarget**.

`[ZRZUT 02: okno New Sequence]`

Dodajemy do niej instrukcję **Blob** [lub **Geometric** - SPRAWDZIĆ, co lepiej działa z naszym wzorcem]
i rozciągamy okno wyszukiwania na cały obraz. Parametr **NumberToFind** ustawiamy na **9**.

`[ZRZUT 03: sekwencja z 9 znalezionymi znacznikami]`

Po wciśnięciu **Run** wszystkie znaczniki powinny zostać obrysowane na zielono. Jeśli któregoś brakuje,
należy poprawić oświetlenie lub parametry instrukcji (np. **ThresholdLow**/**ThresholdHigh** dla Blob),
zanim przejdziemy dalej.

## Tworzenie kalibracji

Nową kalibrację dodajemy w oknie **Vision** przyciskiem: `[IKONA New Calibration]`

`[ZRZUT 04: kreator - nazwa i kamera]`

Nadajemy kalibracji nazwę (np. **CamCal1**) i wybieramy kamerę, której ma dotyczyć. Klikamy **Next**.

Następnie wybieramy sposób montażu kamery (**CameraOrientation**). Do dyspozycji mamy [SPRAWDZIĆ listę w RC+ 8]:

- **Fixed Downward** - kamera nieruchoma, patrząca w dół na stół roboczy,
- **Fixed Upward** - kamera nieruchoma, patrząca w górę, robot przenosi detal nad nią,
- **Mobile J2 / J4 / J5 / J6** - kamera zamontowana na ramieniu robota,
- **Standalone** - kalibracja samej kamery do milimetrów, bez powiązania z robotem.

W naszym przypadku wybieramy **Fixed Downward**, numer robota oraz narzędzie (**RobotTool**), którym
będziemy uczyć punktów.

`[ZRZUT 05: kreator - orientacja, robot, tool]`

Klikamy **Finish**. Nowa kalibracja pojawi się w drzewie projektu, a w oknie właściwości zobaczymy
jej parametry.

`[ZRZUT 06: właściwości kalibracji]`

Najważniejsze z nich to:

- **TargetSequence** - sekwencja szukająca znaczników, u nas **CalTarget**,
- **RobotTool** / **RobotLocal** - narzędzie i układ lokalny, w którym będą podawane wyniki,
- **ReferenceType** - sposób uczenia punktów odniesienia [SPRAWDZIĆ, czy dotyczy Fixed Downward],
- **Lamp**, **LampDelay**, **MotionDelay**, **RobotSpeed**, **RobotAccel** - parametry oświetlenia
  i ruchów wykonywanych podczas kalibracji [SPRAWDZIĆ nazwy].

## Uczenie punktów kalibracyjnych

Klikamy **Teach Points**. Otworzy się okno z podglądem kamery, na którym zaznaczony jest znacznik,
którego aktualnie uczymy.

`[ZRZUT 07: okno Teach Points - punkt 1 z 9]`

Proces polega na tym, że podjeżdżamy końcówką roboczą robota dokładnie nad środek wskazanego znacznika
i klikamy **Teach**. Czynność powtarzamy dla wszystkich dziewięciu punktów, w kolejności wskazanej przez
program.

`[ZRZUT 08: jog robota nad znacznikiem - zdjęcie szpica nad punktem]`

Warto tu zauważyć, że kolejność punktów wynika z tego, w jakiej kolejności sekwencja zwraca znalezione
obiekty [SPRAWDZIĆ: parametr **Sort**]. Przed uczeniem warto upewnić się, który znacznik jest „pierwszy”,
żeby nie pomylić punktów. Uczenie należy wykonywać na tej samej wysokości (Z), na której robot będzie
później pobierał detale, a do precyzyjnego dojazdu najlepiej przełączyć jog na mały krok.

`[ZRZUT 09: wszystkie punkty nauczone]`

## Kalibracja i ocena wyników

Po nauczeniu wszystkich punktów klikamy **Calibrate**. Vision Guide uruchomi sekwencję **CalTarget**,
powiąże pozycje znaczników na obrazie z nauczonymi pozycjami robota i wyświetli okno z wynikami.

`[ZRZUT 10: okno wyników kalibracji]`

Na co zwrócić uwagę [SPRAWDZIĆ dokładne nazwy pól]:

- **XmmPerPixel**, **YmmPerPixel** - ile milimetrów przypada na jeden piksel; obie wartości powinny być
  zbliżone, duża różnica sugeruje przechyloną kamerę lub źle nauczony punkt,
- **XTilt**, **YTilt** - przechylenie kamery względem płaszczyzny roboczej,
- **XAvgError**, **YAvgError**, **XMaxError**, **YMaxError** - średni i maksymalny błąd dopasowania w mm.

Jak interpretować błąd? Dobrym punktem odniesienia jest dokładność, jakiej wymaga aplikacja, oraz
rozdzielczość kamery: błąd rzędu jednego-dwóch pikseli (czyli np. [X] mm przy naszej konfiguracji) jest
wynikiem dobrym. Jeśli błąd maksymalny wyraźnie odstaje od średniego, najczęściej oznacza to jeden źle
nauczony punkt - wystarczy go nauczyć ponownie i powtórzyć **Calibrate**.

`[ZRZUT 11: przykład złej kalibracji - jeden punkt odstaje (opcjonalnie)]`

Kalibrację akceptujemy przyciskiem **OK** [SPRAWDZIĆ] i zapisujemy projekt.

## Przypisanie kalibracji do sekwencji

Aby sekwencja zwracała wyniki we współrzędnych robota, w jej właściwościach ustawiamy parametr
**Calibration** na nazwę naszej kalibracji (**CamCal1**).

`[ZRZUT 12: właściwość Calibration sekwencji roboczej]`

Od tej chwili obiekty znalezione przez sekwencję mają wypełnione wyniki **RobotXYU** (pozycja w układzie
robota) oraz **CameraXYU** (pozycja w układzie kamery, w mm), a nie tylko **PixelXYU**.

`[ZRZUT 13: zakładka Results - RobotX, RobotY, RobotU]`

## Weryfikacja kalibracji w programie

Najprostszym sprawdzeniem jest program, który uruchamia sekwencję, odczytuje pozycję obiektu we
współrzędnych robota i podjeżdża nad nią końcówką roboczą.

`[ZRZUT 14: program w edytorze RC+]`

```
Function main
	Motor On
	Power Low
	Speed 20
	Accel 20, 20

	Boolean found
	Real x, y, u
	Integer i, number_found

	Go P_HOME
	VRun FindParts
	VGet FindParts.Geom1.NumberFound, number_found
	Print "Found ", number_found, " parts."

	For i = 1 To number_found
		VGet FindParts.Geom1.RobotXYU(i), found, x, y, u
		If found Then
			P10 = XY(x, y, Z_CHECK, u)
			Print "Part ", i, ": ", P10
			Jump P10
			Wait 1
		EndIf
	Next

	Go P_HOME
	Motor Off
Fend
```

Na początku program włącza silniki w trybie niskiej mocy i z ograniczoną prędkością - przy pierwszym
teście kalibracji to rozsądne zabezpieczenie. Polecenie **Go P_HOME** odsuwa robota tak, aby nie zasłaniał
kamerze widoku. **VRun FindParts** uruchamia sekwencję roboczą, a **VGet** z parametrem **NumberFound**
zwraca liczbę znalezionych obiektów.

W pętli **For** dla każdego obiektu odczytujemy wynik **RobotXYU(i)**. Zwraca on cztery wartości:
informację, czy obiekt został znaleziony, oraz jego współrzędne X, Y i kąt obrotu U w układzie robota.
Funkcja **XY()** tworzy z nich punkt, przy czym wysokość Z podajemy sami (**Z_CHECK** - stała
z wysokością kilka milimetrów nad detalem, dobrana do stanowiska). **Jump** przenosi robota nad obiekt
ruchem z podniesieniem osi Z.

[SPRAWDZIĆ: czy w RC+ 8 wygodniej `Real`/`Boolean`, i składnię stałej Z - np. `#define Z_CHECK -50`]

`[ZRZUT 15: wynik w oknie Run + zdjęcie szpica nad detalem]`

Jeśli końcówka trafia w środek detali w każdej części pola widzenia, kalibracja jest poprawna. Jeśli
trafia dobrze w środku kadru, a myli się na brzegach, warto sprawdzić rozmieszczenie znaczników wzorca
i wysokość, na jakiej uczyliśmy punkty.

## Pozostałe typy kalibracji (opcjonalnie)

**Mobile** - kamera zamontowana na ramieniu robota. Uczymy jednego punktu odniesienia (końcówka robota
dokładnie nad znacznikiem), a następnie pozycji kamery nad znacznikiem; robot sam przesuwa kamerę tak,
aby znacznik pojawił się w dziewięciu miejscach kadru [SPRAWDZIĆ przebieg w RC+ 8]. Należy pamiętać,
że później zdjęcia trzeba wykonywać z tej samej wysokości, z której kalibrowaliśmy.

**Fixed Upward** - kamera patrzy w górę, a robot przenosi nad nią detal lub znacznik trzymany w chwytaku.
Typowo służy do korekcji położenia detalu w chwytaku przed odłożeniem [SPRAWDZIĆ: **TwoRefPoints**].

`[ZRZUT 16-17: schemat lub zdjęcia obu konfiguracji]`

## Najczęstsze problemy

- **Sekwencja wzorca nie znajduje wszystkich znaczników** - poprawić oświetlenie, kontrast, okno wyszukiwania.
- **Duży błąd maksymalny przy małym średnim** - jeden punkt nauczony niedokładnie, nauczyć go ponownie.
- **Robot trafia obok obiektów, równomiernie w jedną stronę** - niewłaściwy offset narzędzia lub
  wybrany inny **Tool** niż przy kalibracji.
- **Błąd rośnie wraz z odległością od środka kadru** - wzorzec zbyt mały, perspektywa, zniekształcenia
  obiektywu lub różnica wysokości między wzorcem a detalami.
- **Kalibracja „przestała działać”** - ktoś poruszył kamerę, ostrość lub przysłonę; powtórzyć kalibrację.

`[FILM: robot kolejno dojeżdża do detali wskazanych przez kamerę (opcjonalnie)]`

---

## Ramka autora

Autor artykułu:

**Maciej Tkacz**

Inżynier Robotyk ASTOR

[opcjonalnie: druga linia, np. uczelnia / specjalizacja]
