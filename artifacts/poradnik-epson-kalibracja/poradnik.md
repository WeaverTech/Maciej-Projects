# Kalibracja kamery w systemie wizyjnym EPSON Vision Guide

Kamera wisi nad robotem EPSON SCARA i patrzy w dół, na podświetlaną płytkę. Na płytce jest dziewięć punktów. Robot dojeżdża do nich końcówką, a Vision Guide liczy z tego skalę, pole widzenia, pochylenie i błąd.

Kto chce najpierw poklikać to samo bez stanowiska, ma artykuł [Symulacja systemu wizyjnego w środowisku EPSON RC+ 8](https://www.astor.com.pl/poradnikautomatyka/symulacja-systemu-wizyjnego-w-srodowisku-epson-rc-8/). Tutaj robot jest prawdziwy. Kontroler wpięty po USB.

## Po co ta kalibracja

Kamera widzi piksele. Robot jeździ w milimetrach. Bez przeliczenia jedno z drugim nie gada.

Punkt w pikselu (400, 300) nie mówi, ile odjechać w X ani w Y. Kalibracja robi z pikseli milimetry. Jak punkty uczymy robotem, obraz dostaje też układ stanowiska.

Po niej Blob oddaje **CameraX** i **CameraY** w mm. Pick and place bierze te liczby i jedzie w miejsce, które zobaczyła kamera.

Kalibracja siedzi na konkretnym ustawieniu. Ktoś trąci kamerę, przekręci ostrość albo położy detale wyżej niż płytkę, i wczorajsze liczby już nie pasują. Robimy ją od nowa.

## Co jest na stanowisku

- EPSON RC+ z Vision Guide, połączenie **USB**,
- SCARA **T6-B602S**, w programie robot **1, MNP01**,
- kamera **Camera 1**,
- podajnik **Part Feeder 1**, podświetlenie od spodu,
- płytka, dziewięć ciemnych punktów, siatka 3×3.

Płytka zajmuje prawie cały kadr. Punkty dochodzą do brzegów, więc błąd widać też przy krawędzi obrazu.

## Sekwencja, która znajduje punkty

Kalibracja potrzebuje sekwencji, która złapie wszystkie dziewięć kropek. Nowa sekwencja, okno **Vision**.

W **New Vision Sequence** wpisujemy **BlobSeq**, kamera **1. Camera 1**. Pole kopiowania zostawiamy puste. **OK**.

![Nowa sekwencja: BlobSeq, kamera Camera 1](zrzuty/01-nowa-sekwencja.jpg)

Zaraz wyskakuje **Part Feeder Backlight**. Płytka leży na podświetleniu, więc bierzemy **Part Feeder 1** i **OK**. Przy starcie sekwencji podświetlenie się włączy. Kropki będą ciemne na jasnym tle, Blob ma wtedy łatwo.

![Podajnik z podświetleniem: Part Feeder 1](zrzuty/02-podswietlenie-podajnika.jpg)

W sekwencji jeden obiekt, **Blob**, nazwa **Blob01**. Po prawej schemat: **BlobSeq** i **Step 1**. Niebieska ramka na obrazie to okno szukania. Rozciągamy je na całą płytkę. Wszystkie dziewięć punktów ma być w środku.

![Sekwencja BlobSeq, okno na całą płytkę](zrzuty/04-sekwencja-blob.jpg)

We właściwościach **NumberToFind** stawiamy na **All**. Pole robi się czerwone, bo to już nie jest wartość domyślna. Chcemy każdą kropkę. **MinArea** 25 pikseli, **MaxArea** 200000, czyli odsiewamy pył i jakąś wielką plamę od kabla. **Graphics** na **All**, niech rysuje to, co znalazł.

Odpalamy. Na liście **Result 1 of 9**. U nas pierwszy punkt wyszedł tak: **Found** True, **Area** 585 pikseli, **Angle** −68,390°, **CameraX** 243,536 mm, **CameraY** 211,256 mm. Dziewiątka na liczniku znaczy, że płytka jest cała. Można iść dalej.

![Blob01, NumberToFind = All, wynik 1 z 9](zrzuty/03-wlasciwosci-blob.jpg)

## Nowa kalibracja

W drzewie projektu, gałąź **Vision**: sekwencje **BlobSeq**, **Kalibracja**, **DuzyLens** i **MalyDetal**, a pod spodem **Calibrations** z kalibracją **Calibr**. W rogu RC+ połączenie stoi na **USB**.

![Drzewo projektu: sekwencje i kalibracje](zrzuty/05-projekt-vision.jpg)

Nową kalibrację otwiera przycisk na pasku **Vision**. Na zrzucie jest obwiedziony czerwoną ramką.

![Przycisk nowej kalibracji](zrzuty/06-przycisk-kalibracji.jpg)

### Krok 1. Nazwa

Kreator ma 11 kroków. W **General** nazwa **Kalibracja**, kamera **1. Camera 1**. Kopiowania z innej kalibracji nie ruszamy. **Next**.

![Kreator, krok 1: nazwa Kalibracja](zrzuty/07-kreator-nazwa.jpg)

### Krok 2. Jak kamera stoi

**Camera Usage & Orientation**.

**Standalone Camera** to kamera sama dla siebie. **Robot Camera** przypina kalibrację do robota. Na liście jest **1, MNP01**. Montaż:

- **Fixed looking upward**, nieruchoma, patrzy w górę,
- **Fixed looking downward**, nieruchoma, patrzy w dół,
- **Mounted on joint 2**,
- **Mounted on joint 4**.

Na tym zrzucie zaznaczone jest **Robot Camera** i **Fixed looking downward**. Obok podgląd: statyw nad SCARA, oś Z w dół, na stole osie X i Y.

![Kreator, krok 2: Robot Camera, Fixed looking downward](zrzuty/08-kreator-orientacja.jpg)

### Krok 3. Czym szukamy kropek

**Target Sequence**: **BlobSeq**.

W nagłówku tego okna stoi już **Camera Orientation: Standalone**. Krok 2 pokazuje inny wybór, a podsumowanie na końcu zapisuje właśnie Standalone. Przy powtarzaniu u siebie w kroku 2 zaznaczamy to, co ma zostać w podsumowaniu.

![Kreator, krok 3: sekwencja BlobSeq](zrzuty/09-kreator-sekwencja.jpg)

Kroki 4–7 i krok 10 idą na **Next**. Na zrzutach są tylko te, w których coś ustawiamy.

### Krok 8. Dystorsja i pochylenie

**Lens Distortion & Camera Tilt Compensation**. Zaznaczamy **Enable lens distortion and camera tilt compensation**, a **Dist Correction Target Sequence** to **BlobSeq**.

Program bierze płytkę z kadru i prostuje zniekształcenie obiektywu oraz pochylenie kamery. Przy brzegu obrazu skala lubi uciekać, więc haczyk zostaje włączony.

![Kreator, krok 8: korekcja dystorsji, sekwencja BlobSeq](zrzuty/10-kreator-dystorsja.jpg)

### Krok 9. Światło

**Light Control**. **Calibration lamp on delay** zostaje **0**, **Calibration lamp output bit** zostaje **None**.

Osobnej lampy nie ma. Świeci podajnik, ten sam co w **BlobSeq**. Wyjście dla kamery patrzącej w górę jest szare. Nas nie dotyczy.

![Kreator, krok 9: bez lampy kalibracyjnej](zrzuty/11-kreator-swiatlo.jpg)

### Krok 11. Co się zapisuje

Ostatni ekran:

- **Camera:** 1. Camera 1,
- **Camera Orientation:** Standalone,
- **Reference Type:** Taught Points,
- **Target Sequence:** BlobSeq.

**Taught Points** znaczy tyle, że współrzędne bierzemy z robota. Dojeżdżamy do kropek sami. **Finish**. Kalibracja **Kalibracja** wpada do projektu.

![Kreator, krok 11: podsumowanie](zrzuty/12-kreator-podsumowanie.jpg)

## Uczenie punktów

Na dole okna **Vision** jest pasek **Calibration: Kalibracja**. **Teach Points** się świeci. **Calibrate** jest szary, punktów jeszcze nie ma.

![Teach Points aktywny, Calibrate wyszarzony](zrzuty/13-teach-points.jpg)

Klikamy **Teach Points**. Z lewej obraz i napis, dokąd jechać. Z prawej lista kroków. Z boku **Jog**:

- **Motor: On**, **Power: Low**. Silniki chodzą, moc mała. Przy uczeniu tak zostaje.
- Robot **1, MNP01, T6-B602S**, **Tool 0**, **Arm 0**.
- Układ **World**. Żyją **X**, **Y**, **Z** i **U**. **V** i **W** są szare, bo T6 to SCARA.
- **Jog Distance**: **Continuous**, **Long**, **Medium**, **Short**.

Do podjazdu wystarczy **High** i ruch ciągły. Ostatnie milimetry lepiej na **Short**. Inaczej końcówka przeskakuje kropkę.

![Jog przy punkcie Top Left, moc Low](zrzuty/14-jog.jpg)

Kolejność narzuca program:

1. **Top Left**,
2. **Top Center**,
3. **Top Right**,
4. **Right Center**,
5. **Center**,
6. **Left Center**,
7. **Bottom Left**,
8. **Bottom Center**,
9. **Bottom Right**, schowany pod spodem listy. Trzeba przewinąć.

Jedziemy tam, gdzie każe niebieski napis, i **Teach**. Ramię wchodzi w kadr. Ma wejść. Program zapisuje pozycję robota w chwili, gdy końcówka stoi na kropce. Nauczony krok robi się zielony.

Pierwszy jest lewy górny.

![Dojazd do Top Left](zrzuty/15-punkt-top-left.jpg)

Po nim program woła **Top Center**. **Teach Step 1** jest już zielony.

![Top Left nauczony, dojazd do Top Center](zrzuty/16-punkt-top-center.jpg)

W połowie listy zielone są kroki od **Top Left** do **Right Center**. Teraz środek, **Center**.

![Cztery punkty nauczone, dojazd do środka](zrzuty/17-punkt-center.jpg)

Wszystko zielone, nad obrazem **All calibration points are now taught.** **Finish** i wracamy do sekwencji.

![Wszystkie punkty nauczone](zrzuty/18-wszystkie-punkty.jpg)

## Wynik

**Calibrate** jest już aktywny, **Teach Points** zgasł. Klikamy **Calibrate**. Rusza **BlobSeq**, u góry widać **Calibration in cycle**. Po chwili okno **Calibration Complete**.

**Previous values** puste. Pierwszy raz, nie ma z czym porównać. W **New values**:

| | X | Y |
|---|---|---|
| mm na piksel | 0,2049 | 0,2039 |
| błąd maksymalny | 0,3824 | 0,7339 |
| błąd średni | 0,0135 | 0,0085 |
| pochylenie | 1,09 | 2,03 |

**FOV**: **327,83 mm × 244,68 mm**.

![Calibration Complete, pierwsza kalibracja](zrzuty/19-wynik.jpg)

X i Y prawie się zgadzają. Około 0,20 mm na piksel. Pochylenie małe: trochę ponad stopień w X, dwa stopnie w Y.

Średni błąd to setne milimetra. Poniżej piksela. Maksimum, 0,73 mm w Y, to najgorsza z dziewięciu kropek. Jak komuś mało, uczy ten punkt jeszcze raz i klika **Calibrate**. Stare liczby wskakują do **Previous values** i widać, czy jest lepiej.

**OK** zapisuje.

Powtórka należy się, gdy kamera się ruszy, zmieni się ostrość albo przysłona, albo detale leżą wyżej niż płytka z uczenia.

---

Autor artykułu:

**Maciej Tkacz**

Inżynier Robotyk, ASTOR
