# Grid Dynamics Robotics Lab - pakiet aplikacyjny

Stan weryfikacji: **11 listopada 2026**, odpytane bezpośrednio z
`griddynamics.com/careers/vacancy/<id>`.

## Pliki

| Plik | Kiedy |
|---|---|
| `Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.pdf` | domyślny wybór. Układ z Twojego wcześniejszego CV: granatowy pasek, daty w kolumnie, zdjęcie i krótka lista po prawej. Treść jest aktualna, po angielsku. |
| `Maciej_Tkacz_CV_GridDynamics_Simulation_ATS.pdf` | gdy formularz chce prostego pliku |
| `application_griddynamics.md` | list do zgłoszenia, wiadomość do rekruterki, pytania na rozmowę |

Wersje `.docx` leżą obok.

## Przełącznik Isaac Sim: obecnie WYŁĄCZONY

W `scripts/generate_griddynamics_sim_cv.py` jest flaga `ISAAC_PORT_DONE`. Przy `False`
**CV nie stawia żadnej tezy o Isaac Sim poza uczciwym „w trakcie"**. Po zaimportowaniu SCARA
do Isaac Sim ustaw ją na `True` i wygeneruj pakiet ponownie - wtedy CV i list mówią o tym
jako o zrobionej rzeczy.

**To jest najważniejsze działanie przed wysłaniem zgłoszenia.** Zakres na jeden weekend,
mniej więcej 10-15 godzin:

1. Wynajmij GPU z rdzeniami RT na kilka godzin (RunPod L40S ~0,79 USD/h, RTX 4090 ~0,34 USD/h).
   Całość zmieści się w kilku dolarach. Karty A100 i H100 **nie są wspierane**.
2. Zaimportuj SCARA: `urdf_import.py` z `--robot-type Manipulator`,
   `--collision-type "Convex Decomposition"`, `--joint-drive-type force`,
   `--joint-target-type position` i `--ros-package`, żeby rozwiązać ścieżki `package://`.
3. Ustaw articulation root, napędy przegubów i prawdziwe masy oraz bezwładności z CAD.
4. Napisz skrypt w Pythonie, który przejeżdża parametryzowaną trajektorię.
5. Nagraj 60 sekund wideo, wrzuć kod na GitHuba, opisz w pięciu zdaniach, co zadziałało,
   a co nie.
6. Ustaw flagę na `True`, przegeneruj, wyślij.

Bez tego aplikujesz z widoczną dziurą w jedynym miejscu, w którym ogłoszenie 65335 Cię odsiewa.
Z tym - trafiasz w komplet wymagań.

## Dlaczego celem jest 65335, a nie ogłoszenie z LinkedIna

Przysłane ogłoszenie to **Robotics Simulation Engineer, vacancy 65625**, Kraków, Mid-Senior.
Jego twarde wymagania to: komercyjne doświadczenie w robotyce lub autonomii ze specjalizacją
w symulacji, ROS 2 do podłączania oprogramowania robota do symulatora, silny Python **i** C++,
orkiestracja scenariuszy w silnikach workflow, testy SIL/HIL oraz uruchamianie symulacji
wsadowo i rozproszenie. Spełniasz dwa z sześciu.

Przy okazji sprawdzania tego ogłoszenia wyszło na jaw, że Grid Dynamics ma **osiem żywych
ogłoszeń robotyczno-symulacyjnych** w tej rodzinie, i jedno z nich wygląda zupełnie inaczej.

**Vacancy 65335, Robotics Engineer (Simulation), Robotics Lab**, Dresden / Central Europe
Remote. Pełna lista wymagań:

| Wymaganie | Ty |
|---|---|
| Strong Python programming skills | tak, komercyjnie, skrypty logiki symulacji |
| NVIDIA Isaac Sim | **brak** |
| NVIDIA Omniverse | **brak** |
| Unity, Unreal Engine **or similar simulation platforms** | Visual Components, 2 lata komercyjnie |
| Understanding of Physics-based simulation | tak |
| Mechanical systems | student MiBM, to jest Twój kierunek |
| 3D environments | tak |
| Experience working with CAD models or 3D assets | SolidWorks, Inventor, Fusion, AutoCAD |

A zadania w tym ogłoszeniu to niemal spis treści Twojego CV: *„Validate and tune physical
parameters, kinematics, and constraints"*, *„Create Python scripts for automation and simulation
logic"*, *„Work with CAD models and integrate them into simulation environments"*,
*„Maintain version-controlled simulation assets"*.

Czego w tym ogłoszeniu **nie ma**: progu lat doświadczenia, ROS 2, C++, niemieckiego.
Dla porównania siostrzane ogłoszenie 65341 („Junior Robotics Engineer", też Drezno) wymaga
magistra, 2+ lat uruchamiania robotów przemysłowych **i niemieckiego C1/C2** - mimo słowa
„Junior" w tytule jest trudniejsze. Warto o tym wiedzieć, żeby nie pomylić tych dwóch.

Zostaje jedna realna luka: **Isaac Sim i Omniverse**. Stąd weekend opisany wyżej.

## Wizja Epsona i Kawasaki - co zmienia, a czego nie

Dopisane z Twojego opisu, bez dorzucania nazw produktów, których nie podałeś. W CV i w liście
jest: system wizyjny Epsona w RC+, system wizyjny Kawasaki, kalibracja, modele obiektów i
strojenie wyszukiwania, kolejki, kilka różnych obiektów na feederze naraz, oraz pętla wizyjna
odpalona też w symulatorze RC+.

**To wzmacnia 65335.** Ogłoszenie prosi o strojenie parametrów fizycznych, kinematyki i
ograniczeń oraz o współpracę z ludźmi od robotyki. Kalibracja kamera-robot i wizja w pętli
symulatora to dokładnie ten rodzaj roboty: zamykasz pętlę między tym, co widzi kamera, a tym,
co robi maszyna, i widziałeś tę pętlę po obu stronach.

**To nie otwiera 65625.** Ogłoszenie z LinkedIna nadal wymaga komercyjnego ROS 2, orkiestracji
scenariuszy, SIL/HIL i symulacji na skalę. Wizja przemysłowa jest sąsiednia, nie jest tym
wymaganiem.

**To nie jest wejście na 65624, Rendering & Sensor Simulation Engineer** (Kraków, żywe
11.11.2026). Tamte wymagania to programowanie grafiki: Unreal Engine 5, Omniverse RTX, C++,
CUDA, Vulkan albo OpenGL, shadery, oraz modelowanie kamery, LiDAR-u i radaru razem z szumem
sensorycznym. Twoja wizja to aplikacja na robocie. Ich wizja to silnik renderujący, który ma
udawać sensor. Inna praca.

## Pluginy w Visual Components

Dopisane z Twojego opisu. Kiedy komórka wymagała zachowania, którego nie dało się ustawić
wbudowanymi opcjami, pisałeś własne pluginy i funkcje w Pythonie. W CV i w liście jest to
dokładnie na tym poziomie ogólności. Nie wymyśliłem, jakich zjawisk dotyczyły.

Dla 65335 to jest trafienie w punkt *„Create Python scripts for automation and simulation
logic"*, i to w mocniejszej wersji: nie tylko używałeś API, tylko rozszerzałeś narzędzie,
kiedy wbudowane klocki się kończyły.

## Testy dla klientów i CODESYS

Dopisane z Twojego opisu pracy w ASTOR. W CV i w liście jest: sterowniki Astraada w CODESYS,
ekrany HMI, Ethernet/IP i PROFINET, oraz test pod konkretny projekt klienta — najpierw
w symulacji, potem szybkie stanowisko z prawdziwym robotem w wybranej konfiguracji, na końcu
raport z danymi i z całą procedurą.

Nie dopisałem innych protokołów. Napisałeś „i resztę tych rzeczy” przy Ethernet/IP i PROFINET.
W CV są tylko te dwa. Jak dojdziesz Modbus, EtherCAT albo OPC UA, dopiszę je nazwami.

Dla 65335 ten akapit jest mocniejszy niż sam CODESYS. Oni chcą kogoś, kto stroi symulację
i wie, co z niej zostaje na prawdziwej maszynie. Ty to robisz jako procedurę dla klienta,
z raportem na końcu.

## Jak to CV jest ustawione

Fakty biorę tylko z tego, co sam opisujesz. Reszta to kolejność i język:

1. **Tytuł i profil mówią „Simulation Engineer", nie „Robotics Engineer".** Rekrutujesz się
   do Robotics Lab na rolę symulacyjną, więc na górze stoi to, co robisz komercyjnie od dwóch lat.
2. **Punkty z „What I bring" są ustawione w kolejności ich listy wymagań** - fizyka, Python,
   CAD-to-sim, strojenie parametrów. Rekruter przechodzi po liście i odhacza.
3. **Wykształcenie mechaniczne podane jako argument techniczny, nie formalny.** Sformułowanie
   o parametrach wyprowadzanych, a nie dobieranych na oko, jest celowe: w zespole symulacyjnym
   to jest realna różnica, a Ty naprawdę tak pracujesz.
4. **Programowanie robotów, wizja i uruchamianie stanowisk wystawione jako przewaga
   symulacyjna.** Większość inżynierów symulacji nigdy nie skalibrowała kamery do robota ani
   nie uruchamiała fizycznej maszyny, więc nie wie, gdzie model kłamie. Ty wiesz.
5. **SCARA przeramowany pod tę rolę.** Nie jako „fajny projekt hobbystyczny", tylko jako
   jedyny powód, dla którego możesz zrobić zmierzone porównanie symulacji z rzeczywistością:
   masz CAD, prawdziwe masy, model kinematyczny i maszynę.
6. **Luka narzędziowa powiedziana wprost, w CV i w liście.** Przy zespole, w którym Director
   Physical AI Labs ma doktorat, uczciwe nazwanie tego jest mocniejsze niż ukrywanie.

Wycięty: staż web-devowy z 2021.

## Kontekst, który warto mieć w głowie

Ta praktyka u nich jest **nowa i rośnie szybko**, co działa na Twoją korzyść, bo zespoły
budowane od zera zatrudniają szerzej niż dojrzałe:

- pierwsze komercyjne wdrożenie Physical AI zamknięte w pierwszym kwartale 2026,
- **przejęcie Ekumen** (firma robotyczna z dekadą doświadczenia w ROS) w maju 2026,
- partnerstwo z **Doosan Robotics** i biuro inżynieryjne w **Dreźnie** w drugim kwartale 2026,
- status **NVIDIA Solution Advisor Partner**, platforma GAIN for Physical AI na stosie NVIDII,
- **Physical AI Lab w Gdańsku otwarty publicznym meetupem 4 listopada 2026**, czyli tydzień temu,
- ogłoszenie na Principal Engineera mówi o zespole **sześciu inżynierów** - czyli skala,
  na której jeden dobry człowiek robi różnicę.

Krakowski staż robotyczny (vacancy 64359, 32 zł/h brutto, 6 miesięcy) **wygasł 31 października**
i jest zamknięty, mimo że na portalach pośredniczących nadal wisi. Grid Dynamics prowadzi
jednak w Krakowie staże w czterech innych dziedzinach, więc ten prawdopodobnie wróci.

Płace, dla kalibracji: jedyna publikowana stawka w tej rodzinie ogłoszeń to Lead Simulation
& Autonomy Systems Architect na JustJoin.IT - **35 070-41 750 zł netto+VAT** na B2B. Glassdoor
dla Grid Dynamics Kraków: Software Engineer 14-18 tys., Senior 18-23 tys. Liczby krążące po
agregatorach („180-280 tys. zł") są **zmyślone przez te serwisy**, nie publikowane przez firmę.

Proces rekrutacji według ich własnej odpowiedzi na GoWork: rozmowa HR, rozmowa techniczna,
rozmowa nietechniczna, plus sprawdzenie angielskiego. Tryb hybrydowy 3 dni w biurze.
Biuro w Krakowie: al. 3 Maja 9.
