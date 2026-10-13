# Źródła i odwołania do raportu „Wymiana robota Kawasaki z kontrolerem D na E/F”

Plik wewnętrzny. Do każdego twierdzenia z raportu podaje dokument, rozdział, stronę i krótki
cytat w oryginale, żeby dało się to szybko sprawdzić samemu. Numeracja punktów odpowiada
rozdziałom raportu.

Stan na 13.10.2026. Wszystkie pliki PDF zostały pobrane i przeszukane, a strony WWW Kawasaki
odczytane w tym dniu.

## Jak czytać oznaczenia

| Oznaczenie | Znaczenie |
|---|---|
| **DOK** | potwierdzone wprost w dokumencie lub na stronie Kawasaki |
| **DOK-CZ** | dokumentacja potwierdza część twierdzenia, reszta wynika z innego źródła (opisane przy punkcie) |
| **FORUM** | tylko doświadczenie praktyków z robot-forum.com, brak w dokumentacji Kawasaki |
| **WŁASNE** | wniosek inżynierski lub wyliczenie z danych, bez bezpośredniego cytatu |
| **SKORYGOWANE** | wcześniejsza wersja raportu była błędna, poprawiona po tej weryfikacji |

„s. 5-30” oznacza numer wydrukowany na stronie instrukcji. „PDF s. 111” oznacza numer strony
w pliku PDF. Przy instrukcjach podaję oba, bo się różnią.

---

## Lista dokumentów

### Dokumenty Kawasaki (PDF)

| ID | Dokument | Nr / wydanie | Link |
|---|---|---|---|
| K1 | Lista wycofanych modeli i zasady dostaw części | 08.2023, 6 stron | https://kawasakirobotics.com/uploads/sites/2/2023/08/202308product-discontinuation-list.pdf |
| K3 | Standard Specifications, F01/F02/F03/F04 Controller | 90152-0091DEE, wyd. 5 (13.11.2023) | https://kawasakirobotics.com/uploads/sites/2/2022/01/F0x-E-1-1.pdf |
| K4 | F0x Series Controller, Installation and Connection Manual | 90202-1252DEH, wyd. 8 (03.2026) | https://kawasakirobotics.com/uploads/sites/2/2022/01/F0x_Series_Controller-Installation_and_Connection_Manual-E-4.pdf |
| K5 | F Series Controller, AS Language Reference Manual | 90209-1025DEB, wyd. 2 (06.2019) | https://www.robowizard.ru/storage/app/media/october-webinar/90209-1025DEB_F%20Controller%20AS%20Language%20Reference%20Manual.pdf (kopia u dystrybutora) |
| K6 | D Series Controller, AS Language Reference Manual | 90209-1017 (wyd. DEB/DED/DEE) | https://www.scribd.com/doc/92216565/D-Controller-As-Language-Reference-Manual-deb oraz https://manualzz.com/doc/30651297/kawasaki-d-robot-controller-reference-manual (kopie tekstowe) |
| K7 | Arm ID Board Instruction Manual, D Series Controller | 90210-1174DEA, wyd. 1 (09.2002) | https://www.astor.com.pl/wsparcie/dokumentacja-techniczna/pobierz/Kawasaki/Roboty%20przemys%C5%82owe/Seria%20Z/Podr%C4%99czniki/90210-1174DEA-Arm-ID-Board-Instr-Man.pdf |
| K8 | General Fieldbus I/O Usage Manual, D/E Series Controller | 90210-1184DEK, wyd. 11 (05.2015) | https://download.astor.com.pl/dokumentacja/Kawasaki/Roboty%20przemys%C5%82owe/Seria%20M/Podr%C4%99czniki/90210-1184DEK-General-Fieldbus-IO-Usage-Manual(D-E-series).pdf |
| K9 | neoROSET Operation Manual | 90210-1515DED | https://www.scribd.com/document/917241124/NeoROSET-Operation-Manual-E (kopia tekstowa) |
| K10 | Broszura neoROSET | Cat. No. 2645, 07.2026 | https://kawasakirobotics.com/uploads/sites/2/2026/02/neoROSET_EN_no.2645.pdf |
| K14 | Katalog „Kawasaki Robot” (cała oferta) | Cat. No. 3L2521, 09.2025 | https://kawasakirobotics.com/uploads/sites/2/2026/03/TRanbo-7_EN_20250723.pdf |
| K15 | Broszura „D Controller” (Kawasaki Robotics USA) | 6 stron | https://pdf.directindustry.com/pdf/kawasaki-robotics-gmbh/d-controller/18836-24989.html |
| K16 | D Series Controller, Installation and Connection Manual (D30/32/33/34) | numer nieczytelny w kopii | https://www.scribd.com/document/835174248/D-Series-Controller-Installation-Conn-Manual (kopia tekstowa) |

Dokumenty K7 i K8 leżą na serwerze dokumentacji ASTOR, więc jest do nich dostęp z firmy.
K5, K6, K9 i K16 to kopie z serwisów zewnętrznych. Treść jest oryginalna (nagłówki i numery
Kawasaki), ale do prezentacji lepiej mieć egzemplarz z dokumentacji dostarczonej z robotem.

### Strony WWW Kawasaki

| ID | Strona | Link |
|---|---|---|
| K2 | Retired Models | https://kawasakirobotics.com/products/retired-models/ |
| K11 | Kontroler F02 (globalna, UK, EMEA) | https://kawasakirobotics.com/products-controllers/f02/ , https://kawasakirobotics.com/uk/products-controllers/f02/ , https://kawasakirobotics.com/emea/products-controllers/f02/ |
| K12 | Kontroler F04 (globalna, EU-Africa) | https://kawasakirobotics.com/products-controllers/f04/ , https://kawasakirobotics.com/eu-africa/products-controllers/f04/ |
| K13 | Kontrolery E02 i E04 | https://kawasakirobotics.com/products-controllers/e02/ , https://kawasakirobotics.com/products-controllers/e04/ |
| K17 | Blog: „Tips for an Industrial Robotics Upgrade or Retrofit” (14.09.2024) | https://kawasakirobotics.com/blog/tips-for-an-industrial-robotics-upgrade-or-retrofit/ |
| K18 | Komunikat prasowy „Kawasaki Introduces New E Series Robot Controllers” (29.09.2008) | https://global.kawasaki.com/en/corp/newsroom/news/detail/ba_c3080929_2.html |
| K19 | Historia Kawasaki, dział Robot | https://global.kawasaki.com/en/history/business/robot.html |

### Forum praktyków (robot-forum.com)

| ID | Wątek | Link |
|---|---|---|
| F1 | 38312 „installation of new robot” (FS10N z D na RS010N) | https://www.robot-forum.com/robotforum/thread/38312/ |
| F2 | 36020 „Spin Control” (przenoszenie danych C na E) | https://www.robot-forum.com/robotforum/thread/36020/ |
| F3 | 43051 „Kawasaki Backup Script” | https://www.robot-forum.com/robotforum/thread/43051/ |
| F4 | 49046 „F controller vs E controller” | https://www.robot-forum.com/robotforum/thread/49046/ |
| F5 | 41303 „Switching controllers between robots” | https://www.robot-forum.com/robotforum/thread/41303/ |

---

## 1. Podsumowanie

Punkty podsumowania są streszczeniem rozdziałów 3–7. Źródła podaję przy rozdziałach. Skrót:

| Twierdzenie | Gdzie | Status |
|---|---|---|
| Programy, zmienne, dane pomocnicze i systemowe da się przenieść | rozdz. 5 niżej | DOK (polecenia), FORUM (ocena zgodności) |
| Nie wczytywać pełnego backupu, przenosić selektywnie | rozdz. 5, punkty 5.6–5.8 | DOK-CZ |
| Od nowa: I/O, bezpieczeństwo, fieldbus, opcje | rozdz. 6 | DOK |
| Nowe ramię ma własne zerowanie | rozdz. 7, punkt 7.1 | DOK |
| Ten sam model w kilku generacjach | rozdz. 3 | DOK |
| Daty wycofania D/E i 10 lat części | rozdz. 4 | DOK + WŁASNE (wyliczenie) |

---

## 2. Założenia

Założenia scenariusza (ten sam model, to samo stanowisko) pochodzą z Twojego opisu. Nie wymagają
źródła.

---

## 3. Czy „ten sam model ramienia” jest dostępny z E lub F

**3.1. Kod modelu zawiera oznaczenie kontrolera (np. MX420L_D24, MX420L_E24).** DOK
- K1, PDF s. 1, „How to find the Robot Model”, oraz PDF s. 4: pozycje `MX420L_D24` (2014/01)
  i `MX420L_E24` (2020/01).

**3.2. MX350L / MX420L / MX500N / MX700N: D, E i F04.** DOK
- D i E: K1, PDF s. 4. Warianty `MX350L_D24/D34/D44`, `MX420L_D24/D34/D44`,
  `MX500N_D24/D34/D44`, `MX700N_D24` oraz warianty E14–E44 każdego z nich.
- E: K13, strona E04: „Supported Robots MX350L, MX420L, MX500N, MX700N”.
- F: K12, strona F04 (globalna): „Supported Robots MXP710L, MXP410X, MX350L, MX420L, MX500N, MX700N”.
- F: K3, s. 2, poz. 1 „Model (Main available robot)”, kolumna F04: „MX, MXP (excluding MXP360)”.

**3.3. ZX130L, ZX165U, ZX200S, ZX300S: D, E i F02.** DOK, SKORYGOWANE
- D i E: K1, PDF s. 5–6. Na przykład `ZX300S_D22/D32/D42` (2014/01) i `ZX300S_E12…E42`,
  `ZX165U_D22…D42`, `ZX200S_D22…D42`, `ZX130L_D22…D42`.
- E: K13, strona E02: „ZX130L, ZX165U, ZX200S, ZX300S”.
- F: K11, globalna strona F02: „… ZX130L, BXP210L, ZX165U, ZX200S, BTP210L, ZX300S, MT400N, BA013L”.
- F: K4, s. 31 (PDF s. 37), rozdz. 3, tabela „External power supply connection capacity”.
  Wiersz F02 controller zawiera „Z Series” i „MT Series”.
- Korekta: pierwsza wersja raportu mówiła, że ZX130/165/200 „nie ma na liście F02”. To
  wynikało z wersji EMEA strony F02, która wymienia tylko „ZX200U, ZX300S”. Globalna
  i brytyjska wersja je wymieniają.

**3.4. ZX130S tylko na brytyjskiej wersji strony F02.** DOK, do potwierdzenia
- K11, wersja UK: „… BT200L, ZX130S, ZX130L, ZX165U, ZX200S, ZX300S, MT400N”.
  Na stronie globalnej ZX130S nie ma.

**3.5. MT400N: D, E i F02.** DOK, SKORYGOWANE
- D i E: K1, PDF s. 4. `MT400N_D22`, `MT400N_D32` (2014/01), `MT400N_E12…E42`.
- F: K11, globalna strona F02: „MT400N”. K3, s. 2, poz. 1, kolumna F02: „BX/BT/MT”.
- Korekta: wcześniej było „do potwierdzenia”, teraz potwierdzone.

**3.6. Seria FS była tylko z kontrolerami C i D, nie było jej z E.** DOK
- K1, PDF s. 2–3. Wszystkie pozycje `FS…` mają końcówki `_C…`, `_D…` albo `_PC…`. Nie ma
  ani jednej `_E…`.

**3.7. Następcą serii FS jest seria R (RS).** DOK-CZ
- K19, rok 2008: „The R series further improved upon the superior performance of its
  predecessor, the F series.”
- F1, post #1: wymiana „old FS10N robot … with a new RS010N model” w tej samej celi. To
  praktyka, nie dokument.

**3.8. Regionalne strony F02 różnią się listą ramion.** DOK
- K11: wersja globalna, UK i EMEA mają trzy różne listy „Supported Robots”.

**3.9. Gdy model jest następcą, trzeba porównać karty katalogowe.** WŁASNE

---

## 4. Dostępność części

**4.1. Części do 10 lat od zakończenia produkcji, bez gwarancji po tym okresie, terminy mogą się wydłużać.** DOK
- K1, PDF s. 1, „Remarks”: „Replacement parts for the affected models shall be supplied for up
  to 10 years after the date of discontinuation.” Dalej: „… could result in Kawasaki being
  unable to provide parts …” i „… delivery lead-times may increased.”
- K2: ten sam tekst w sekcji „REPLACEMENT PARTS”.

**4.2. Warianty z kontrolerem D wycofano głównie w latach 03.2010–01.2014, pojedyncze w 2015–2022.** DOK + WŁASNE
- K1, PDF s. 2–6. Zliczyłem wszystkie 184 pozycje z kontrolerem D: 2010 (69), 2011 (1),
  2012 (13), 2013 (31), 2014 (65), 2015 (1), 2018 (3), 2022 (1). Najwcześniej 2010/03,
  najpóźniej 2022/01. 178 ze 184 pozycji przypada na lata 2010–2014.

**4.3. Dla większości robotów z D okres dostaw części minął w latach 2020–2024.** WŁASNE
- Wyliczenie: daty z punktu 4.2 plus 10 lat z punktu 4.1.

**4.4. Warianty z kontrolerem E wycofano głównie w latach 2019–02.2024.** DOK + WŁASNE
- K1, PDF s. 2–6, 280 pozycji z kontrolerem E. Na lata 2019–2024 przypada 224 (80%):
  2019 (38), 2020 (88), 2021 (28), 2022 (19), 2023 (3), 2024 (48). Najpóźniej 2024/02.

**4.5. Okres części dla E orientacyjnie do 2029–2034.** WŁASNE (punkt 4.4 plus 10 lat)

**4.6. Kawasaki wprost pisze, że części do kontrolerów A, B, C i D nie są już dostarczane.** DOK
- K17: „if a customer has a robot with A, B, C or D series controllers from Kawasaki
  Robotics, while the current controllers are E and F series, the older controller parts are no
  longer supplied by the company.”

**4.7. F to aktualna generacja.** DOK
- K11/K12: „The F controllers are new generation of Kawasaki controllers …”.

**4.8. E przy nowym zakupie ma sens tylko przy ujednolicaniu parku maszyn.** WŁASNE

---

## 5. Co przenosi się ze starego kontrolera

**5.1. Kontroler D i F mają te same polecenia SAVE/P, /L, /R, /S, /A, /SYS i /ROB.** DOK
- D: K6, rozdz. 5.3 „Program and Data Storage Commands”, lista poleceń na s. 5-29, składnia
  i opis na s. 5-29–5-32. „SAVE/A * Saves auxiliary information. SAVE/SYS * Saves system data.
  SAVE/ROB * Saves robot data.”
- F: K5, rozdz. 5.3, s. 5-29 (PDF s. 110): ta sama lista plus `SAVE/OPLOG`, `SAVE/ALLLOG`,
  `SAVE/FULL`, `SAVE/STG`. Składnia na s. 5-32 (PDF s. 113), opis każdego przełącznika na
  s. 5-33–5-34 (PDF s. 114–115).

**5.2. Każdy typ danych idzie do osobnego pliku.** DOK
- K5, s. 5-30 (PDF s. 111): „The commands SAVE/P, SAVE/L, SAVE/R, SAVE/S, SAVE/SYS store each
  data type … in separate files.” To samo zdanie jest w K6 przy SAVE.
- K5, s. 5-33 (PDF s. 114): rozszerzenia plików: `.PG` program, `.LC` punkty, `.RV` liczby,
  `.ST` teksty, `.AU` dane pomocnicze, `.SY` dane systemowe, `.RB` dane robota.

**5.3. LOAD przerywa się, jeśli program o tej nazwie już jest w pamięci.** DOK
- K5, rozdz. 5.3, LOAD, s. 5-35 (PDF s. 116): „Attempting to load a program name that already
  exists in memory results in error, and execution of the LOAD command is aborted.”

**5.4. Zmienne (punkty, liczby, teksty) o tej samej nazwie są nadpisywane bez ostrzeżenia.** DOK
- K5, s. 5-35 (PDF s. 116): „When loading a pose variable, real variable, or string variable
  name that already exists in memory, the data in the memory is overwritten without any warning.
  (Programs are not overwritten.)”

**5.5. LOAD/Q pozwala wczytywać selektywnie.** DOK
- K5, s. 5-35 (PDF s. 116): „For LOAD command with /Q, the following message appears before
  loading each system data or program: Load? (1:Yes, 0:No, 2:Load all, 3:Exit)”.
- D: K6, rozdz. 5.3, `LOAD/Q` (indeks poleceń, s. 5-34).

**5.6. SAVE/ROB zapisuje dane specyficzne dla robota.** DOK
- K5, s. 5-34 (PDF s. 115): „5. SAVE/ROB Stores the data pertaining specifically to the robot
  (robot data).” K6 ma to samo zdanie w rozdz. 5.3.

**5.7. Dane robota to model, numer seryjny i zerowanie.** DOK-CZ
- K7, rozdz. 6.1 „Controller Start-up Screen1”, s. 17 (PDF s. 22). Ekran pokazuje
  „Robot name”, „Num of axes”, „Serial No.” oraz „ZEROING … OFFSET” osobno dla strony
  ramienia i kontrolera.
- Wcześniej w raporcie były też „parametry serwo”. Nie znalazłem tego w dokumentacji, więc
  usunąłem to z raportu.

**5.8. Pełnego backupu nie wolno wczytywać w całości, bo zawiera dane robota.** DOK-CZ
- Dokumentacja: K5, s. 5-30, i K6 opisują samo `SAVE` jako zapis pięciu typów danych:
  „Using the SAVE command alone stores all the five data types in one file.” Pięć typów to
  program, punkty, liczby, teksty i dane systemowe. Dane robota nie są tu wymienione wprost.
- Praktyka:
  - K9, rozdz. 4.6.1 „Adding robots”, „Using all save data (AS file)”, s. 54: „If there are
    items in the robot data that do not need to be loaded, deselect the items …”. Okno
    wczytywania pliku .as pokazuje dane robota do odznaczenia.
  - F1, post #7: „delete everything in the file down till the MFP-data … without risking to
    screw up any robot data”.
  - F3, post #4: „Do not load a backup from a different robot onto another expecting to
    'clone' it, you will experience a world of pain if you do.”
- Wniosek z raportu jest właściwy. Uzasadnienie, że plik zawiera dane robota, pochodzi jednak
  z praktyki i z neoROSET, a nie z opisu polecenia SAVE.

**5.9. Metoda praktyków: usunąć z kopii backupu wszystko powyżej sekcji MFP i wczytać resztę.** FORUM
- F1, post #7 (20.05.2021): „When changing from D to E, you can take a backup og the old one and
  delete everything in the file down till the MFP-data. Then you have a copy of MFP, pg's, vars,
  strings etc. without risking to screw up any robot data.”

**5.10. Wartości pól panelu ustawiane przez BITS się nie przenoszą, zrobić zdjęcia ekranów.** FORUM
- F1, post #7: „If the old MFP uses input/output fields with BITS-command, remember that those
  values is NOT transferred, so screenshot it before changing.”

**5.11. Ocena zgodności danych pomocniczych, systemowych i panelu.** FORUM
- F2, post #4 (10.09.2020), o przenoszeniu z C na E: „User Data such as programs, locations and
  variables, no problems. Generally Robot Data is not advisable … System Data is relatively
  compatible, such as dedicated signals, system switches, but not sure about fieldbus … Aux Data
  is relatively compatible, such as home locations, axis limits, clamp functions, workspaces,
  Block program settings, Interface Panel will transfer, but may not be an identical copy …”
- Z tego wpisu pochodzi lista zawartości danych pomocniczych w tabeli raportu (pozycja domowa,
  limity osi, chwytak, strefy pracy, programy blokowe).

**5.12. Program w AS potrzebuje razem z kodem także swoich zmiennych.** FORUM (wspiera tabelę)
- F1, post #2 i #4 (kwakisaki): „SAVE/P allprogs … would create a file called allprogs.pg and just
  contain program code … you would have to set all the variable values again”.

**5.13. K-Logic: D miał K-Logic, F0x ma opcję Software PLC.** DOK, zgodność do potwierdzenia
- D: K15, sekcja „Expandable platform simplifies system upgrades”: „A built-in sequencer, using
  Kawasaki K-Logic, is also available …”.
- F0x: K3, s. 3, poz. 20 „Options”, wiersz „Others”: „Field BUS (Master, Slave), Software PLC”.
- Nie znalazłem dokumentu, który mówi, czy program K-Logic z D da się wczytać do F0x.

---

## 6. Co trzeba wykonać od nowa

**6.1. D: 32 wejścia / 32 wyjścia na karcie 1GW/1HW, złącza CN2 (wyjścia) i CN4 (wejścia), 37-pin D-sub.** DOK-CZ
- K16, rozdz. 8.2 „Connection of DI/O General Purpose Signal”, s. 33–34: „connectors CN2 and CN4
  on the 1GW board” i „Connector CN2 DC-37S-N (JAE) or equivalent, CN4 DC-37P-N (JAE) or
  equivalent” (DC-37 to 37-pinowe D-sub).
- Liczba 32/32 na kartę: potwierdzają to forum (wątki 37153 i 41607: „1GW or 1HW board contains
  32 Outputs (CN2) and 32 Inputs (CN4)”) i instrukcja External I/O kontrolerów C (90204-1008,
  „32 input and 32 output channels per I/O board”). Instrukcji External I/O dla D nie
  zdobyłem w PDF.
- Więcej kart I/O w D: w pierwszej wersji raportu było „opcjonalnie 64/96/128”. Nie mam na
  to dokumentu D, więc w raporcie zostało tylko „więcej z dodatkowymi kartami”.

**6.2. F0x: 32/32 standardowo, do 64/64 w szafie, 128/128 z remote I/O.** DOK
- K3, s. 2, poz. 6 „I/O signals”: „General-purpose I/O sig.: Input 32, Output 32”.
- K3, s. 4, przypis *3: „Max. number of General purpose I/O Input(64)/Output(64) In-cabinet” oraz
  „Input(128)/Output(128) In-cabinet + Remote I/O”.

**6.3. F0x: opcjonalne złącze I/O to też 37-pin D-sub, ale pinout trzeba porównać.** DOK + do potwierdzenia
- K3, s. 3, poz. 20, wiersz „I/O signal connector”: „D-SUB 37 pin (male, female) with cover”.
- K4, rozdz. 8.2 „General Purpose Signal Connection”, s. 79 (PDF s. 85): „For details of
  connection, see the "External I/O Manual."” Tej instrukcji (90204-1029) nie mam, więc
  przypisania pinów nie porównałem.
- F4, post #2: „External safety and IO wiring is not as physically easy as previous
  controllers.”

**6.4. Bezpieczeństwo F0x: wersja A (Cubic-S) lub B (CoreCubic-S), obwód do kat. 4 / PL e.** DOK
- K3, s. 2, poz. 18 „Safety Circuit”: „Category: 4, Performance Level: e (EN ISO13849-1) *2”.
- K3, s. 4, przypis *2: „Category and Performance level (PL) are determined by the whole system
  and conditions.”
- K3, s. 4, przypis *11: „There are two types of F0x controllers: A-type and B-type. A-type is
  compatible with "Cubic-S" … B-type is compatible with "CoreCubic-S" … Some robot models are
  incompatible with the B-type controller …”.
- K12 (F04 EU): „The safety circuit of the F01/02/03/04 controller satisfies ISO 13849-1 PLe,
  Category 4, IEC 61508 SIL 3.”

**6.5. Obwody bezpieczeństwa w D są sprzętowe.** DOK
- K16, rozdz. 8.3 „Connection of DI/O Hardware Dedicated Signal” (spis treści, s. 34).

**6.6. Fieldbus w D: DeviceNet, PROFIBUS, INTERBUS, EtherNet/IP, Modbus-TCP, CC-Link.** DOK, SKORYGOWANE
- K8, dodatek X „Product Code List”, tabela X3 „Fieldbus interface board”, s. X-2 (PDF s. 269).
  Kolumna „D” ma znak ○ dla DeviceNet (slave/master), PROFIBUS (slave/master), INTERBUS
  (slave/master), EtherNet/IP (slave/master), Modbus-TCP (server) i CC-Link (slave/master).
- K15: „compatible with a variety of Fieldbus I/O systems such as DeviceNet, Allen Bradley Remote
  I/O, CC-Link, Profibus, Interbus-S”.
- Korekta: wcześniej w raporcie przy D był ControlNet. To było błędne, patrz punkt 6.7.

**6.7. PROFINET, CANopen, ControlNet, EtherCAT i CC-Link IE były tylko w E.** DOK
- K8, tabela X3, s. X-2 (PDF s. 269): CANopen, PROFInet IO, ControlNet, EtherCAT i CC-Link/IE
  mają „×” w kolumnie D i „○” w kolumnie E.
- K8, spis treści, PDF s. 10–11, i nagłówki dodatków: „Appendix F CANopen (E Controller)”,
  „Appendix G PROFInet (E Controller)”, „Appendix H ControlNet (E Controller)”, „Appendix J
  EtherCAT (E Controller)” (s. J-1, PDF s. 252).
- K8, „Preface”, s. i (PDF s. 2): „Most parts of this function are the same between D series
  controller and E series controller. Different parts are described with / (slash) …”.

**6.8. Pliki konfiguracyjne sieci dla PLC (GSD/EDS/GSDML).** DOK
- K8: EDS dla DeviceNet w rozdz. A3.3.2, s. A-6; GSD dla PROFIBUS w rozdz. B4.3.3, s. B-14
  (PDF s. 129); GSDML dla PROFINET w rozdz. G4.3.1, s. G-12.

**6.9. F0x: fieldbus slave jako moduł na złączu XAB, master jako karta PCIe.** DOK
- K4, rozdz. 8.8 „Fieldbus Connection (Optional)”, s. 80 (PDF s. 86): „Adding the fieldbus
  communication module (optional) to the XAB connector on top of the servo board (2FB board) …
  For details, see the "General Fieldbus I/O Usage Manual."”
- K3, s. 4, przypis *5: „Up to 3 option slots, including 2 slots that can be used for the PCIe
  board … Field bus (Master) : PCIe board”.
- Instrukcja „General Fieldbus I/O Usage Manual” dla F ma numer 90210-1326. Numer jest na
  liście instrukcji w instrukcji instalacji F60 (90202-1183DEG, „Manuals Referenced in This
  Manual”). Sama instrukcja nie jest publicznie dostępna.

**6.10. Sieci w ofercie dla F60: CC-Link, CC-Link IE, DeviceNet, EtherNet/IP, EtherCAT, PROFIBUS-DP, PROFINET (bez INTERBUS).** DOK, dla F0x do potwierdzenia
- K14, s. 2 („01”), tabela opcji kontrolera F60: „CC-Link slave, CC-Link IE slave, DeviceNet
  master/slave, Ethernet/IP master/slave, EtherCAT master/slave, PROFIBUS-DP master/slave,
  PROFINET master/slave”.
- To lista dla F60. Specyfikacja F0x (K3) mówi tylko „Field BUS (Master, Slave)” bez listy
  sieci. Dlatego w raporcie jest „trzeba potwierdzić dostępność dla F0x”.
- K11 (F02): „Supports various fieldbuses”.

**6.11. Typ modułu fieldbus w F (HMS CompactCom).** FORUM, niepotwierdzone
- F4, post #2 (13.07.2024): „I think uses HMS CompactCom 40 adapters for fieldbus connectivity.”
  Autor sam pisze „I think”. W dokumentach K3 i K4 nie ma nazwy modułu.

**6.12. Pendant: F ma nowy pendant GenII z portem USB.** DOK
- K11/K12: „Together with the GenII teach pendant …”.
- K4, rozdz. 3.2 „External Appearance of TP”, s. 29 (PDF s. 35): na rysunku „USB connector”.
- K3, s. 2, poz. 14 „External interface”: „USB2.0: 1 ports (Teach pendant)”.

**6.13. Opcje płatne zamawiane osobno (np. fieldbus, śledzenie przenośnika, spawanie).** DOK
- K3, s. 3, poz. 20 „Options”: m.in. „Conveyor Synchronization”, „Field BUS (Master, Slave)”,
  „Software PLC”. K3, s. 2, poz. 19: „Arc welding I/F … (Standard for Arc-welding robot)”.

**6.14. Zapis danych w D: PC (KRterm/KCwin przez RS-232C lub Ethernet), karta PC.** DOK
- K6, rozdz. 2.4.2 „External Memory Devices”, s. 2-7: „save programs, variables and pose
  information in the robot memory, PC card, floppy disk, or computer hard disk”.
- K6, rozdz. 2.5 „Installing Terminal Software (KRterm)”: „Connecting the computer and the
  controller using the RS-232C cable … An Ethernet connection enables multiple computers to
  control multiple robots.”

**6.15. Zapis danych w F: USB, Ethernet, CFast.** DOK
- K5, s. 5-16 (PDF s. 97) i s. 5-35: „USB#1 and USB#2 indicate the controller front USB slot …
  writing "CFast¥" before the file name can specify the file on the CFast in the controller.”
- K4, rozdz. 8.5 „PC Connection”, s. 79 (PDF s. 85): „Connect a PC onto which KRterm/KCwin32 …
  to the RS-232C port … KRterm/KCwin TCPIP … to the Ethernet port”.

---

## 7. Punkty i kalibracja

**7.1. Nowe ramię ma własne zerowanie, a kontroler przy starcie pyta, którą wersję danych użyć.** DOK
- K7, rozdz. 6.1 „Controller Start-up Screen1”, s. 17 (PDF s. 22). Ekran pojawia się m.in.
  „2. In case of replacing the robot.” Opcje:
  - „Input 1 when selecting "Arm side". In this case, the system starts using the model data
    saved in the Arm ID Board (including zeroing data).”
  - „Input 2 when selecting "Controller side" …”
- Uwaga: K7 to instrukcja dla D i dotyczy płytki Arm ID, która była w D opcją („Arm ID Board
  (Option)”, K7, s. 1). Przy wymianie całej pary robot + kontroler ten wybór zwykle nie wystąpi,
  bo oba przychodzą z fabryki z danymi tego samego ramienia.

**7.2. Praktyka wyboru strony Arm ID przy wymianie samego robota albo samego kontrolera.** FORUM
- F5: „swap out old robot with new robot. Power up, choose arm id question to use controller side
  for robot model and zeroing information …”.

**7.3. Robota nie da się zamontować co do dziesiątych milimetra; procedura z punktami referencyjnymi i korektą BASE.** WŁASNE (praktyka inżynierska)

**7.4. neoROSET wczytuje pełny backup z D, D+, E i F.** DOK
- K9, rozdz. 4.6.1 „Adding robots”, „Using all save data (AS file)”, s. 54: „Controllers that
  support loading are the F, E, D+, and D controllers.”
- K9, rozdz. 1.3 „Compatible Robots and Controllers”, s. 6: „eight units for F, E, D, D+
  controllers”.
- K10, PDF s. 4: „By loading the save data from the actual robot controller, you can recreate the
  on-site system on neoROSET.”

**7.5. neoROSET podmienia model robota bez zmiany układu.** DOK
- K9, rozdz. 4.9.4 „Replace”, s. 71: „The robot will be replaced with no change in the layout.
  However, replacement between multi arms and single arms is not supported.”
- K10, PDF s. 4: „by replacing robot models, model selection can be easily performed when
  updating aging robots.”

**7.6. neoROSET przesuwa i lustrzanie kopiuje punkty.** DOK
- K10, PDF s. 4: „Teaching points can be converted using the shift and mirror copy functions …”.

**7.7. neoROSET porównuje dane kontrolera z danymi w projekcie.** DOK, SKORYGOWANE
- K9, rozdz. 5.6.5 „Synchronize”, s. 141–142: „Comparison data … In this dialog, [Controller Data]
  and [Local Data] can be compared. Differences in the data are indicated with red and green
  background …”.
- Korekta: wcześniej było „porównywać tekst programów”. Funkcja porównuje dane kontrolera
  z danymi projektu, a nie dwa dowolne programy.
- Zastrzeżenie z K9, Q7, s. 189: „neoROSET uses controller internal default values. Note that
  settings will be different if the customer has custom …”.

**7.8. Przy innym modelu ramienia punkty joint trzeba douczyć. Praktycy przeliczają je przed backupem na transformacje.** FORUM
- F1, post #7: „you only need to re-teach all the positions that are i "joint" since they will be
  different. All the transformation values is the same … I would convert the "joint" position
  in the FS10 to transformation, before backing it up, and the convert them back to joint when
  they are in the RS10.”

---

## 8. D na E czy D na F

| Wiersz tabeli | Źródło | Status |
|---|---|---|
| E: większość wariantów wycofana 2019–2024 | punkt 4.4 | DOK |
| F: aktualna generacja | punkt 4.7 | DOK |
| E podobniejsze do D | K18: „The E Series has been developed by advancing the performance of their predecessor D Series” | DOK-CZ (stopień podobieństwa to WŁASNE) |
| F: nowy pendant, inne złącza, mniejsza szafa | punkt 6.12; K12: „30% reduction in both volume and mass”; F4 post #2 | DOK + FORUM |
| Przenoszenie danych tak samo | punkt 5.1 | DOK |
| F0x jest następcą E0x | K12 (F04, EU-Africa): „As a successor model of the E0x controller, the F controller has been renewed and evolved …” | DOK |
| Rekomendacja | — | WŁASNE |

---

## 9. Procedura krok po kroku

Procedura to synteza rozdziałów 5–7.

| Krok | Podstawa |
|---|---|
| 1. Backup całości i osobnych plików | punkty 5.1, 5.2 |
| 2. Mapa I/O, fieldbus, przełączniki, opcje, zdjęcia panelu | punkt 5.10; F1 post #7: „Take pictures of the signal allocation … Check system switches in "advanced/system switches"” |
| 3. Punkty referencyjne | punkt 7.3 (WŁASNE) |
| 4. neoROSET | punkty 7.4–7.6 |
| 5. Montaż i przepięcie | punkty 6.1–6.5 |
| 6. Wczytanie danych | punkty 5.3–5.5, 5.9 |
| 7. Fieldbus i panel | punkty 6.6–6.10, 5.10 |
| 8. Korekta współrzędnych | punkt 7.3 (WŁASNE) |
| 9. Test, douczenie, walidacja bezpieczeństwa | punkt 6.4, przypis *2 |
| 10. Backup nowego kontrolera | punkt 5.1 |

**9.1. TWAIT 0.02 w pętlach po przejściu na E.** FORUM
- F1, post #7: „When going to E-controller, its a good idea to put a TWAIT (like TWAIT 0.02) in
  every loop: In the autostart's and in you main pg (if there is no job). This will make it A LOT
  more responsive.”
- Rozszerzenie na F to WŁASNE. Podstawa: K11/K12, „the performance of the latest CPU has been
  greatly improved”.

---

## 10. Ryzyka

Tabela ryzyk wynika z rozdziałów 3–7. Najważniejsze podstawy:

| Ryzyko | Podstawa |
|---|---|
| Wczytanie pełnego backupu z D | punkt 5.8; F3 post #4 |
| Niespisana mapa I/O lub fieldbusa | punkty 6.1–6.10; F1 post #7 |
| Pominięte opcje płatne | punkt 6.13 |
| Inny model niż zakładany | punkty 3.7–3.9, 7.8 |
| Zmiana układu bezpieczeństwa | punkt 6.4 |
| Utrata danych z D | WŁASNE |

---

## 11. Weryfikacja i korekty

| Korekta | Podstawa |
|---|---|
| F0x ma 32/32 I/O, nie 16 | punkt 6.2 |
| Moduł HMS CompactCom niepotwierdzony | punkt 6.11 |
| ControlNet nie był dostępny w D | punkt 6.7 |
| ZX130L/165U/200S i MT400N są na liście F02 | punkty 3.3, 3.5 |
| Opis SAVE (pięć typów) a dane robota w pliku backupu | punkt 5.8 |
| neoROSET: porównanie danych kontrolera, nie tekstu programów | punkt 7.7 |
| Usunięte uwagi bez źródła: „znaki sterujące z PLC psują zapis tekstów”, „KRterm pokaże linie, których kontroler nie przyjmie”, „parametry serwo w danych robota”, „opcjonalnie 64/96/128 I/O w D” | brak źródła; zastąpione punktami 5.3, 5.4, 5.7 i 6.1 |

---

## 12. Do potwierdzenia w serwisie Kawasaki

Te punkty zostały w raporcie jako otwarte, bo publiczna dokumentacja ich nie rozstrzyga:

| Pytanie | Dlaczego otwarte |
|---|---|
| Dokładny kod modelu docelowego | punkt 3.8, regionalne strony się różnią |
| Dostępność wariantu z E | punkt 4.4 |
| Sieć fieldbus dla F0x (zwłaszcza INTERBUS, AB Remote I/O) | punkty 6.9, 6.10; instrukcja 90210-1326 niedostępna |
| Software PLC zamiast K-Logic | punkt 5.13 |
| Pinout złącza I/O F0x względem 1HW/1GW | punkt 6.3 |
| Wersja A/B kontrolera dla danego ramienia | punkt 6.4, przypis *11 |
| Usługa konwersji D na F | K17 opisuje usługę „upgrade/retrofit” z symulacją („For a fee, the tech will also run full simulations with different robot models”), ale nie konwersję danych |

---

## Dokumenty, których nie udało się zdobyć

Te dokumenty rozstrzygnęłyby otwarte punkty. Warto o nie poprosić w Kawasaki albo poszukać
w wewnętrznej dokumentacji ASTOR:

- General Fieldbus I/O Usage Manual dla F: **90210-1326** (lista sieci dla F0x).
- External I/O Manual dla F: **90204-1029** (pinout złączy I/O).
- External I/O Manual dla kontrolera D (maksymalna liczba kart I/O).
- Arm ID Board Instruction Manual dla E: 90210-1246 (cytowany w pierwszej wersji raportu, nie
  sprawdzony w tej weryfikacji, więc usunięty ze źródeł).
