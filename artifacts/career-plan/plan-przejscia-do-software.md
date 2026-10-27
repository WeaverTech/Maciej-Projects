# Plan przejścia z automatyki do robotyki software'owej

Stan na 27 października 2026. Wszystkie liczby pochodzą z żywych ogłoszeń, raportu płacowego
Hays Polska 2026, rocznego raportu No Fluff Jobs 2025/2026 albo dokumentacji producentów.
Przy każdej liczbie podane jest źródło. Tam, gdzie dane są niepewne, jest to zaznaczone.

---

## 1. Diagnoza w jednym zdaniu

**Dystans między Twoją obecną pensją a stawkami 20-30 tys. zł nie wynika z braku stażu,
tylko z tego, w której gałęzi rynku jesteś.**

Dowód liczbowy. Hays Polska 2026, sekcja „Produkcja i inżynieria", podaje dla **Automation
Engineera z 3-5 letnim stażem** widełki 10 000 / 12 000 / 14 000 zł brutto na UoP. To jest
sufit Twojej obecnej ścieżki po kilku latach pracy. Tymczasem w ogłoszeniach żywych dzisiaj:

| Firma | Rola | Stawka | Forma |
|---|---|---|---|
| Spyrosoft | Lead ROS Engineer, w pełni zdalnie | **190-200 zł/h** (~32-34 tys./mies.) | B2B |
| Spyrosoft | ROS Engineer, w pełni zdalnie | **150-185 zł/h** (~25-31 tys./mies.) | B2B |
| Robotec.ai | Senior C++ (symulacja, Isaac Sim, ROS 2) | **19 000-26 000 zł** netto+VAT | B2B |
| Unikie | Senior Robotics Simulation Engineer (ROS 2/Gazebo) | **180-240 tys. zł/rok** (~15-20 tys./mies.) | etat |
| Grid Dynamics | Simulation Engineer (Omniverse) — wygasłe, ale pasmo znane | **22 000-26 000 zł** | B2B |
| **Robotec.ai** | **Mid C++** | **13 500-19 000 zł** netto+VAT | **B2B** |

Ostatni wiersz jest najważniejszy w całym dokumencie. **Mid na B2B w robotyce software'owej
płaci więcej niż senior w automatyce przemysłowej na etacie.** Nie musisz czekać na staż.
Musisz zmienić gałąź.

Twoja intuicja o NVIDII była dobra, ale kolejność jest odwrotna, niż myślisz. O tym w punkcie 3.

---

## 2. Co dokładnie Cię blokuje

Przejrzałem kilkanaście żywych ogłoszeń w tej gałęzi. Blokada jest jedna i powtarza się
w każdym z nich:

> **ROS 2 — komercyjnie, nie z tutoriali.**

Spyrosoft pisze wprost „commercial ROS 1 *and* ROS 2". Unikie wymaga „ROS 2 + Gazebo hands-on".
Grid Dynamics wymaga integracji ROS 2 z symulatorem. Botz żąda „ROS 2 on real projects,
not tutorials". To nie jest miękkie oczekiwanie, to jest filtr w pierwszym sicie CV.

Czego **nie** brakuje Ci tak bardzo, jak myślisz:

- **Isaac Sim / Omniverse** — ważne, ale w ogłoszeniach prawie zawsze jako „advantage",
  nie „required". Grid Dynamics to wymaga, Unikie, A1 Sorter i Körber jako atut.
  **To jest mnożnik, nie bilet wstępu.**
- **Doświadczenie z cyfrowymi bliźniakami** — masz dwa lata komercyjnie. NODE Robotics
  i Persona AI wprost proszą o „digital twin concepts and tooling". Ty to robisz, tylko
  w Visual Components zamiast w Isaac Simie. **To nie jest zmiana zawodu, to zmiana toolchainu
  w tym samym zawodzie** — i tak trzeba to opisywać w CV.
- **Kinematyka, mechanika, CAD, integracja hardware-software** — masz, i to w ilości,
  która jest rzadka wśród ludzi od ROS-a. Persona AI wprost pyta o „ability to create and
  manage 3D simulation assets — meshes, materials, collision geometry, articulation
  definitions". To jest Twoja codzienność.

Dodatkowe braki, tanie do nadrobienia, wymieniane niemal w każdym ogłoszeniu: **Linux jako
środowisko pracy** (pracujesz w świecie Windows: Visual Components, SolidWorks),
**Docker**, **Git na poziomie zespołowym**, **CI/CD**, **nowoczesny C++**. Razem to jest około
80-100 godzin i w dużej mierze zrobi się samo przy projekcie z punktu 4.

---

## 3. Odpowiedź na Twoje pytanie o NVIDIĘ

Dobrze wyczułeś kierunek, ale odwróć kolejność: **najpierw ROS 2, potem Isaac Sim.**
Trzy powody.

Po pierwsze, arytmetyka ogłoszeń. Każda rola, która płaci powyżej pasma Haysa, wymaga ROS 2.
Isaac Sim pojawia się jako atut *w tych samych ogłoszeniach*. Samo Isaac Sim bez ROS-a
nie otwiera żadnych drzwi, ROS bez Isaaca otwiera większość.

Po drugie, sprzęt. Oficjalne minimum dla Isaac Sim 6.2 to **RTX 4080, 16 GB VRAM i 32 GB RAM**
([wymagania NVIDII](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/requirements.html)).
Karty bez rdzeni RT nie są wspierane w ogóle, łącznie z A100 i H100. Na 8 GB VRAM uruchomisz
import URDF i prostą scenę z jednym ramieniem przy 1080p i jednym monitorze, ale nie zrobisz
generowania danych syntetycznych ani treningu w Isaac Lab. Moderator NVIDII odpowiada na takie
zgłoszenia zdaniem, że karta jest poniżej minimum.

**Nie kupuj z tego powodu karty graficznej.** Wynajmij GPU na godziny: RunPod L40S kosztuje
0,79-1,09 USD/h, AWS g6e.xlarge 1,86 USD/h z gotowym darmowym obrazem Isaac Sim. Cały projekt
z punktu 4 zmieści się w 25-40 godzinach czasu GPU, czyli **około 20-45 USD łącznie**.
Całość ROS-a, Gazebo i pracy ze sprzętem robisz lokalnie, bez żadnego GPU.

Po trzecie, kolejność nauki ma sens techniczny: Isaac Sim rozmawia z robotem przez ROS 2,
więc ucząc się Isaaca bez ROS-a uczysz się połowy interfejsu.

**Jedna pułapka wersji, która może Cię kosztować tydzień.** Isaac Sim 6.2 oficjalnie wspiera
tylko ROS 2 Humble i Jazzy i **nie wspiera Ubuntu 26.04**. Najnowszy ROS 2 LTS (Lyrical)
wymaga 26.04. Czyli jedyna kombinacja, w której wszystko działa razem, to:

> **Ubuntu 24.04 + ROS 2 Jazzy + Gazebo Harmonic + Isaac Sim 6.2**

Jazzy ma wsparcie do maja 2029. Umiejętność wyjaśnienia tego wyboru na rozmowie
(„wybrałem Jazzy, a nie Lyrical, bo Isaac Sim nie wspiera jeszcze Ubuntu 26.04") jest warta
więcej niż jakikolwiek certyfikat z tego dokumentu.

**O certyfikatach NVIDII, żeby zamknąć temat.** Przejrzałem katalog szkoleń NVIDIA z
października 2026: **wszystkie darmowe kursy robotyczne i Isaac/Omniverse mają w rubryce
„Certificate" wpis N/A.** Płatne za 30 USD też. Jedyne szkolenie Isaac z certyfikatem kosztuje
**500 USD**. Jedyny egzamin certyfikacyjny w tej kategorii to **NCP-OUSD (OpenUSD), 200 USD** —
i to jest certyfikat z pipeline'u 3D, nie z robotyki. Rób darmowe kursy, bo treść jest dobra
(szczególnie dwugodzinny *Software-in-the-Loop Testing for Robots With OpenUSD, Isaac Sim and
ROS* — dokładnie Twój temat). **Nie wydawaj ani złotówki na certyfikat, zanim nie będzie
publicznego repozytorium.**

---

## 4. Twoja nieuczciwa przewaga: ramię SCARA

To jest sedno planu i rzecz, której nie ma żaden inny kandydat.

Zbudowałeś fizyczne ramię SCARA: CAD, druk, silniki NEMA, sterowniki TMC/DRV, mikrokontroler,
własna kinematyka prosta i odwrotna w Pythonie i C++, przetestowana na sprzęcie. Masz do niego
model CAD, czyli **prawdziwe masy i tensory bezwładności**.

Ogłoszenia w tej gałęzi pytają o jedną rzecz, której nikt nie potrafi udowodnić: **sim-to-real**.
Unikie punktuje „experience comparing simulation behaviour with physical-system behaviour".
Botz chce kogoś, kto „can tell us exactly where the reality gap bit you". Prawie każdy kandydat
ma symulację albo robota. **Ty możesz mieć jedno i drugie i zmierzoną różnicę między nimi.**

Projekt: **przeniesienie Twojego SCARA do ROS 2 i zmierzenie rozjazdu między symulacją
a rzeczywistością.**

Punkt wyjścia do przeczytania przed napisaniem pierwszej linijki:
[ICube-Robotics/scara_tutorial_ros2](https://github.com/ICube-Robotics/scara_tutorial_ros2) —
Apache 2.0, Ubuntu 24.04 + Jazzy, URDF SCARA, własny hardware interface, własny kontroler,
Gazebo. To jest niemal dokładnie Twój projekt. Przeczytaj w całości, a potem napisz swój
pod swój sprzęt, nie forkuj.

### Kamienie milowe i realny nakład pracy w godzinach

| | Etap | Godziny | Trudność |
|---|---|---|---|
| M0 | Ubuntu 24.04, Jazzy, colcon, Docker, Git | 12-20 | konfiguracja |
| M1 | ROS 2 do poziomu roboczego (węzły, tematy, akcje, launch, TF2) | 40-60 | średnia |
| M2 | URDF/xacro SCARA z **prawdziwymi bezwładnościami z CAD** | 15-25 | konfiguracja, ale patrz pułapki |
| M3 | Gazebo Harmonic + `gz_ros2_control` + strojenie | 20-30 | konfiguracja |
| M5c | **Enkodery AS5600 na osie** + firmware + kalibracja | 15-30 | średnia |
| M5 | Własny `SystemInterface` w C++ + protokół szeregowy + wątki | 40-70 | **trudne** |
| M8 | Docker, GitHub Actions, pytest, README z wykresami | 25-40 | konfiguracja + pisanie |
| M6 | Isaac Sim: import URDF→USD, mostek ROS 2 | 20-35 | konfiguracja, +10-15 h przy słabym GPU |
| M7 | **Walidacja sim-to-real: trajektorie pobudzające, rosbag, identyfikacja, metryki** | 30-50 | **trudne i w tym jest cała wartość** |
| M4 | MoveIt 2 dla 4 stopni swobody | 25-45 | **trudne, patrz pułapki** |
| M4b | *(opcja)* własna analityczna wtyczka IK + benchmark | 20-35 | **trudne, ale masz już tę matematykę** |

**Całość rdzenia (M0-M8 z enkoderami): około 230-375 godzin.**

**Wersja minimalna, około 120-160 godzin**, dająca jakieś 80% sygnału rekrutacyjnego:
M0 + M1 + M2 + M3 + M5 + M8, z krótkim demem importu do Isaac Sim i podstawowym porównaniem
błędu rzeczywistość-Gazebo.

**Kolejność ma znaczenie: rób M5 przed M4.** Działający interfejs sprzętowy jest w CV wart
więcej niż konfiguracja MoveIt, a problem IK dla czterech stopni swobody jest najbardziej
prawdopodobnym miejscem, w którym utkniesz na długo i stracisz zapał. Najpierw niech robot
ruszy pod `ros2_control`, opublikuj to, dopiero potem MoveIt.

**Opublikuj repozytorium po M8, zanim projekt będzie „skończony".** Działający, otestowany
interfejs sprzętowy do własnoręcznie zbudowanego ramienia to już jest mocne portfolio, a dzięki
wcześniejszej publikacji masz o czym rozmawiać na rozmowach, kontynuując pracę.

### Pułapki, które realnie zjadają tygodnie

Spisuję je, bo każda z nich jest udokumentowana i kosztowna:

**Bezwładności w URDF.** Skopiowane `ixx=iyy=izz=1.0` jest 100-1000× za duże dla drukowanej
części — symulacja będzie wyglądać dobrze i nie przewidywać niczego, a nastawy strojone
w symulacji będą błędne na sprzęcie. Masa zero oznacza, że Gazebo po cichu wyrzuca ogniwo
z fizyki. Tensor musi być **względem środka masy**, a SolidWorks i Inventor często podają
go względem początku układu części — bez poprawki Steinera jest błędny o `m·d²`. Musi też
spełniać nierówność trójkąta (`ixx + iyy ≥ izz` i permutacje), inaczej dostaniesz drgania
i NaN zamiast błędu. **Masz CAD, więc możesz to zrobić dobrze, a większość ludzi nie może —
to jest wyróżnik, nie formalność.**

**MoveIt 2 przy czterech stopniach swobody.** Domyślny solver KDL tego nie potrafi, a komunikat
błędu jest mylący, bo przychodzi z planera: `Unable to sample any valid states for goal tree`.
Ludzie tracą na tym dni. Co gorsza, `setPositionTarget()` **nie wystarcza** — wypełnia domyślną
orientację, której Twoje ramię i tak nie osiągnie. Trzeba ustawić `position_only_ik: true`
w `kinematics.yaml`. Dla IKFast typ `TranslationZAxisAngle4D` daje dla SCARA
`success rate: 0.000000`; poprawny jest `TranslationXAxisAngleZNorm4D` plus
`SetLocalToolDirection([1,0,0])`. Najprostsze wyjście to `pick_ik` z `rotation_scale: 0.0`.
**Najbardziej imponujące wyjście to napisanie własnej analitycznej wtyczki IK — a Ty tę
matematykę masz już zaimplementowaną i sprawdzoną na sprzęcie.**

**Blokujący odczyt szeregowy w `read()`.** Pętla kontrolera ma przy 100 Hz dziesięć milisekund
na wszystko. Blokujący odczyt się w tym nie mieści. Poprawne rozwiązania: osobny wątek odbiorczy
z `realtime_tools::RealtimeBuffer` i nieblokującym try-lockiem, albo komponent asynchroniczny
(`is_async: true`), albo poinformowanie menedżera przez
`expect_blocking_read_write: true`. Dla ramienia na porcie szeregowym uczciwe jest 50-100 Hz.

**Silniki krokowe są otwartą pętlą.** Jeśli jako stan zgłaszasz pozycję zadaną, symulacja
i rzeczywistość zgodzą się idealnie i nie będzie to znaczyło nic. **Jeśli masz zrobić jeden
zakup sprzętowy, to enkodery, nie karta graficzna.** Cztery AS5600 kosztują grosze i bez nich
cały punkt M7 traci sens.

**Isaac Sim.** Importer URDF został przepisany w wersji 6 na pipeline pythonowy, więc tutoriale
sprzed 6.0 odwołują się do usuniętych API. Flaga `--ros-package nazwa:ścieżka` jest konieczna
do rozwiązania `package://` w ścieżkach siatek. Domyślny `--collision-type "Convex Hull"` jest
zły dla ogniwa z otworem — potrzebujesz `Convex Decomposition`. Bez `--joint-drive-type force`
dostaniesz robota bez napędów, czyli zwiotczałego. Przy mostku `topic_based_ros2_control`
ustaw `sum_wrapped_joint_states: true`, bo Isaac zgłasza kąty zawijane z 2π na −2π i przeguby
będą skakać.

### Jak wygląda wiarygodna walidacja sim-to-real

To jest część, którą pomija 99% projektów portfolio, i dlatego jest warta najwięcej.

Isaac Sim 6.1 dodał, a 6.2 dopracował,
[rozszerzenie System Identification](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/robot_setup/ext_isaacsim_robot_setup_sysid.html),
zrobione dokładnie pod to zadanie: wczytuje **ROS 2 bagi i MCAP**, liczy residua na pozycji,
prędkości, momencie i pozie końcówki, optymalizuje parametry napędów, bezwładności i **opóźnień
komend**, i obsługuje podział na zbiór uczący i walidacyjny.

Deliverable, który bym zbudował: pakiet `scara_validation`, który generuje trajektorie
pobudzające (zamiatanie sinusoidalne na przegub, multisinus, ruch sprzężony wieloprzegubowy,
plus realistyczny cykl pick and place), **puszcza te same trajektorie przez cztery backendy
jednym plikiem launch z argumentem `backend:=`** — mock, Gazebo, Isaac Sim, prawdziwe ramię —
nagrywa rosbagi, a potem liczy w pandas błąd RMS i maksymalny na przegub, czas ustalania,
przeregulowanie i błąd kartezjański końcówki, i rysuje nałożone przebiegi przed i po
identyfikacji.

Na końcu ma paść jedno zdanie:

> *„Po identyfikacji parametrów błąd RMS na zbiorze walidacyjnym między Isaac Sim a sprzętem
> spadł z X° do Y°, a błąd pozycji końcówki z A mm do B mm."*

To jedno zdanie z wykresami pod spodem jest warte więcej niż wszystkie certyfikaty razem wzięte.

Dwie rzeczy, których nie wolno zrobić. **Nie raportuj błędu na tych samych danych, na których
stroiłeś** — trzymaj trajektorię walidacyjną z boku. I **sprawdź najpierw opóźnienia, nie
fizykę**: na robocie na porcie szeregowym duża część pozornego rozjazdu to latencja i jitter,
a nie model dynamiki. Uczciwe napisanie w README, które parametry są źle uwarunkowane i czemu,
robi lepsze wrażenie niż ukrycie tego.

---

## 5. Gdzie aplikować równolegle, zaczynając w tym tygodniu

Nie czekaj z aplikowaniem na skończenie projektu. **Najtańszy sposób na zdobycie komercyjnego
ROS 2 to dostać za to pensję.**

**Priorytet pierwszy — najwyższa oczekiwana wartość w stosunku do obecnych umiejętności:**

- **Robotec.ai, Mid C++ Software Engineer, Warszawa hybrydowo, 13 500-19 000 zł B2B.**
  Wymagania w ogłoszeniu to tylko C++, Linux, Git, CI/CD. Firma robi cyfrowe bliźniaki
  i platformy symulacyjne na Isaac Sim, O3DE i ROS 2 — czyli dokładnie to, do czego zmierzasz.
  Twój SCARA z kinematyką w C++ to realny dowód. **To jest jedyna rola z całej listy, którą
  możesz wygrać dzisiaj, a która jest już podwyżką.** Przy stu osobach w firmie polityka
  hybrydowa bywa negocjowalna, warto zapytać.
- **Grid Dynamics, Kraków.** Mają Robotics Lab w Twoim mieście, otwarty **Senior Robotics
  Simulation Engineer** (za wysoko na teraz) oraz **Robotics Engineer Intern w Krakowie**.
  Staż jest poniżej Twojego poziomu i pensji, ale to najtańsze drzwi do laboratorium Physical AI
  na miejscu. Pasmo wygasłej siostrzanej roli to 22-26 tys. zł. Napisz na obie.

**Priorytet drugi — aplikacje spontaniczne, bo rynek tych ról prawie nie ogłasza:**

- **SimulateFirst (Drezno + Wrocław).** Certyfikowany partner **Visual Components** od 2012,
  robi symulacje komórek robotycznych, programowanie offline dla ABB/KUKA/Fanuc/UR i wirtualne
  uruchomienia przez OPC UA i TwinCAT. Deklarują, że prowadzili całe projekty zdalnie dla
  klientów z USA, Szwecji, Francji, Danii i Portugalii, a typowy projekt trwa 1-4 tygodnie.
  **Mają otwarte stałe zaproszenie do aplikowania, a Ty masz dwa lata komercyjnie w ich
  głównym narzędziu, co w Polsce jest rzadkie.** To najlepsza aplikacja spontaniczna w kraju,
  i potencjalnie model projektowy obok studiów.
- **A1 Sorter, Gliwice.** Mają wydzielony **Zespół Cyfrowego Bliźniaka** z rolami Senior Digital
  Twin Engineer, Digital Twin Developer i Simulation & 3D Visualization Developer. Ogłoszenia
  są w tej chwili zamknięte, jedno pasmo z agregatora to 180-300 tys. zł rocznie. Aplikuj
  spontanicznie.
- **Valiant TMS, Gliwice.** Centrum inżynieryjno-symulacyjne, 40+ osób, nazwane stanowiska
  „OLP & Simulation Engineer". Wymagania w ich ogłoszeniu są **poniżej** Twojego poziomu
  (technikum, angielski A2/B1). Byłbyś nadkwalifikowany po stronie symulacji.
- **Alstom Wrocław/Katowice** — prowadzą programowanie offline w Visual Components.

**Czego nie brać, mimo że wygląda dobrze:**

- **E80 Group, Kraków** — PLC/AGV, junior-mid, w Twoim mieście, technicznie w zasięgu.
  Ale ogłoszenie mówi o **200-250 dniach delegacji rocznie**. To jest nie do pogodzenia
  z kończeniem studiów.
- **Sii, Senior Simulation Engineer, zdalnie na całą Polskę** — będzie Ci wyskakiwać w każdym
  wyszukiwaniu i to pułapka: to jest MES i wytrzymałościówka (Abaqus, HyperMesh, ANSA),
  zupełnie inna dziedzina, plus wymóg 5 lat.
- **1dea, Simulator Engineer, 25-50 tys. zł, Kraków** — najwyższe pasmo z całego raportu,
  pod tytułem „symulacja", i to jest modelowanie układów scalonych w SystemC/TLM. Inna branża.
- **Spyrosoft ROS Engineer, Unikie, Botz** — zablokowane na komercyjnym ROS 2. To są cele
  na za 18 miesięcy, nie na teraz. Zapisz je sobie.

**Jedna ważna uwaga o rynku.** Sprawdziłem: na No Fluff Jobs **nie ma dzisiaj ani jednego**
żywego ogłoszenia na frazy `virtual commissioning`, `digital twin`, `Tecnomatix`, `Emulate3D`
ani `offline programming`. Na Pracuj.pl zero wyników dla `process simulate`, `visual components`,
`wirtualne uruchomienie`, `plant simulation`, `omniverse` i `cyfrowy bliźniak`. Role
z SoftServe, które Ci się podobały (**Middle i Senior Process Simulation Engineer**), **wygasły**
— senior 18 października. To jest powracająca rekrutacja, więc warto obserwować, ale:

> **Nie planuj kariery wokół czekania, aż pojawi się właściwe ogłoszenie. W tej gałęzi
> jest ich w Polsce kilka na raz. Bezpośrednie, imienne odezwanie się do ośmiu firm z tej
> listy jest skuteczniejsze niż przeglądanie portali.**

---

## 6. ROSCon Global 2027 w Krakowie, 12-14 października 2027

Najważniejszy pojedynczy fakt w tym dokumencie po stronie okazji.

Główna światowa konferencja deweloperów ROS przyjeżdża do Twojego miasta. Call for proposals
na 2027 jeszcze nie jest opublikowany; w 2026 terminy to były warsztaty 5 kwietnia, prelekcje
26 kwietnia, plus stypendium wyjazdowe. ROSCon przyjmuje **lightning talki (10 minut)**,
a organizatorzy wprost zachęcają prelegentów do przywożenia robotów.

Prelekcja „walidacja sim-to-real samodzielnie zbudowanego ramienia SCARA w ros2_control
i Isaac Sim" to dokładnie ten format. **Zbuduj projekt tak, żeby był gotowy do pokazania
w pierwszym kwartale 2027, i wyślij zgłoszenie.** To jest najtańszy możliwy wpis do CV,
sala pełna europejskich firm robotycznych, które rekrutują, i okazja, która nie powtórzy się
w Krakowie szybko. Drugie podejście: **ROSCon UK 2027, Bristol, 5-7 lipca** — w 2026 przyjęli
20 lightning talków z 52 zgłoszeń.

Nawet samo pojechanie się opłaca. Wystąpienie jest warte więcej niż wszystkie płatne certyfikaty
z tego dokumentu razem wzięte.

---

## 7. Czego się uczyć, a na co nie tracić czasu

**Materiały, które realnie warto (kolejność ma znaczenie):**

- [Articulated Robotics](https://articulatedrobotics.xyz/) Josha Newansa — darmowe, i to jest
  **najlepsze wyjaśnienie dokładnie Twojego problemu**: `ros2_control` z mikrokontrolerem po
  porcie szeregowym, najpierw w symulacji, potem na sprzęcie, na Jazzy.
- [Oficjalne tutoriale ROS 2 Jazzy](https://docs.ros.org/en/jazzy/Tutorials.html) — podstawy
  i TF2, nie do pominięcia.
- [control.ros.org](https://control.ros.org/jazzy/index.html), zwłaszcza *Writing a Hardware
  Component* i przykłady `ros2_control_demos`.
- Edouard Renard, kurs *ROS 2 for Beginners (Jazzy, 2026)* na Udemy — 13 h, 4,7★ z ~6900 ocen.
  Cena katalogowa 85 USD, ale **praktycznie zawsze jest przecena do ~18-23 USD, nigdy nie płać
  pełnej**. Uczy „co wpisać", nie „jak to działa pod spodem", i dla kogoś, kto już programuje,
  to jest dobry kompromis — skraca nudne rusztowanie.
- The Construct, **39,97 EUR/mies., świadomie na jeden lub dwa miesiące**, żeby przerobić
  kursy *ROS2 Control Framework*, *URDF for Robot Modeling in ROS2* i *ROS2 Manipulation Basics*.
  Darmowy tier daje *Linux for Robotics* i *C++ for Robotics*.
- Darmowe ścieżki NVIDII: [Physical AI Learning](https://docs.nvidia.com/learning/physical-ai/index.html)
  i [Learn OpenUSD](https://docs.nvidia.com/learn-openusd/latest/) (8 modułów, ~13 h).
  Dobre na wieczory, kiedy nie masz siły debugować.

**Na co nie wydawać pieniędzy:**

- Robotics Developer Masterclass w The Construct (4999-7699 EUR). Za te pieniądze lepsza
  jest karta 16 GB plus bilet na ROSCon.
- Szkolenie *NVIDIA Isaac for Accelerated Robotics* (500 USD) — dobra treść, zła kolejność.
  Tylko jeśli zapłaci pracodawca.
- Certyfikat NCP-OUSD (200 USD) — ewentualnie, ale **po** opublikowaniu repozytorium
  i najlepiej z kodem rabatowym 50% z webinaru NVIDII.
- Odznaki „ROS Developer" od The Construct — znaczą coś tylko wewnątrz ich ekosystemu.
  Oni sami piszą na swoim blogu, że publiczne projekty liczą się bardziej niż certyfikaty.

**Darmowe rzeczy o realnej wartości rekrutacyjnej:**

- **Wkład do open source w ekosystemie ROS 2.** `ros2_control` ma
  [kurowaną listę zadań dla nowych](https://control.ros.org/master/doc/contributing/contributing.html)
  i otwarte „good first issue" (m.in. nieścisły opis metody init w `JointLimiterInterface`
  i udokumentowanie zachowania ograniczeń przegubów). Będziesz i tak siedział w tym kodzie przy
  M5. **MoveIt 2 jest teraz nietypowo chłonny na pomoc**, bo PickNik przesunął główne siły
  do MoveIt Pro i zostawił rosnący backlog oraz publiczne wezwanie o maintainerów — a luka
  w dokumentacji o konfiguracji dla ramion poniżej 6 stopni swobody, przez którą przejdziesz
  w M4, jest **idealnym** pierwszym wkładem. Zasada: po każdej trudnej rzeczy, którą
  rozgryziesz, jeden PR do dokumentacji.

---

## 8. Co zrobić w tym tygodniu

1. **Zamów cztery enkodery AS5600.** Kosztują grosze, a bez nich punkt M7 nie ma sensu.
2. **Postaw Ubuntu 24.04 z ROS 2 Jazzy** — dual boot albo osobny dysk, nie maszyna wirtualna.
3. **Wyślij aplikację do Robotec.ai na Mid C++** i do Grid Dynamics w Krakowie. Dzisiaj,
   nie po skończeniu projektu.
4. **Wyślij aplikację spontaniczną do SimulateFirst** — Visual Components to ich główne
   narzędzie, a Ty masz w nim dwa lata komercyjnie.
5. **Przeczytaj `scara_tutorial_ros2` od początku do końca.**
6. **Kup kurs Renarda na przecenie** i zacznij M1 wieczorami.

Dwie rzeczy do przemyślenia, których nie rozstrzygnę za Ciebie. Po pierwsze: ASTOR jest
dystrybutorem Kawasaki i robi cyfrowe bliźniaki, więc **możesz spróbować przeforsować tam
projekt na ROS 2 albo Isaac Sim przy stanowiskach demo** i zdobyć komercyjne doświadczenie bez
zmiany pracy. To nie rozwiąże problemu pensji, ale skraca drogę. Po drugie: sprawdź w swojej
umowie zapisy o pracy dodatkowej, zanim weźmiesz cokolwiek na B2B obok etatu.

---

## 9. Realistyczna trajektoria

Bez obiecywania terminów, bo zależą od tego, ile wieczorów faktycznie znajdziesz:

- **Teraz:** górna część pasma juniora, ~22 miesiące stażu. Hays dla automatyki: 10-14 tys. zł
  brutto na UoP przy 3-5 latach, czyli to jest sufit, pod który idziesz obecną ścieżką.
- **Po M0-M5 i opublikowaniu repo (~150 h):** realny kandydat na mid C++ / robotyka
  software'owa na B2B, pasmo **13 500-19 000 zł** netto+VAT. To jest potwierdzone żywym
  ogłoszeniem Robotec.ai, nie moje oszacowanie.
- **Po pełnym M0-M8 z walidacją sim-to-real i rokiem komercyjnego ROS 2:** pasmo
  **19 000-26 000 zł** B2B (Robotec.ai senior) albo **150-185 zł/h zdalnie** (Spyrosoft),
  a z Isaac Simem w portfolio także **22-26 tys. zł** (Grid Dynamics).

Zdalne role w tej gałęzi są **wyłącznie po stronie ROS-a i software'u**. Programowanie offline
i wirtualne uruchomienia są z natury na miejscu albo w delegacji, bo kalibracja odbywa się przy
komórce — 200-250 dni delegacji w ogłoszeniu E80 to skrajna ilustracja tej zasady. **Jeśli
zależy Ci na zdalnej pracy obok studiów, to jest dodatkowy argument za ROS-em, a nie za
Process Simulate.**
