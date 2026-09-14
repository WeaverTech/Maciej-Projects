.PROGRAM pl_init()
; ====================================================================
; PLATE - adaptacyjna wysokosc pobierania plyt ze stosu, BEZ zatrzyman
; Robot: Kawasaki serii CP (paletyzator), symulacja neoROSET
; Plik jest ASCII - AS nie przyjmuje polskich znakow diakrytycznych.
;
; ZALOZENIE GEOMETRYCZNE
; Dalmierz siedzi w osi TCP i patrzy w dol. W serii CP kolnierz jest
; zawsze pionowy, wiec wiazka jest rownolegla do Z bazowego i wysokosc
; szczytu stosu to zwykle odejmowanie:
;       z_szczytu = DZ(HERE) + pl.hoff - odleglosc
; pl.hoff to jedyna stala do skalibrowania (raz, na wzorcu).
;
; ZASADA DZIALANIA - zjazd na pelnej predkosci, pomiar az do chwytu
;   1. Robot podjezdza nad stos i zjezdza w dol lancuchem krotkich
;      segmentow LMOVE sklejanych przez CP ON + ACCURACY. Bufor planera
;      ma skonczenie miejsc: gdy jest pelny, zadanie ruchu czeka na
;      zwolnienie slotu, ale robot jedzie dalej. Wlasnie wtedy
;      wywolywane jest pl_target ze SWIEZA estymata - punkt pobrania
;      wiaze sie tak pozno, jak pozwala interpolator, bez RTPM.
;   2. Zadanie PC caly czas czyta dalmierz. Probka jest wazna dopoki
;      czujnik jest w zakresie i TCP jest nad stosem. Nie ma zamrazania
;      na 500 mm. Pomiar milknie sam, gdy odleglosc spadnie ponizej
;      pl.dmin (czujnik traci zakres) - ostatnie milimetry daja sie
;      z estymaty, a chwytak zalacza sie, gdy TCP wejdzie w okno chwytu.
;   3. Chwytak (wyjscie pl.vac) zalacza zadanie PC po rzeczywistej
;      pozycji, nie po przeplywie programu. SIG w zadaniu ruchu poszedlby
;      za wczesnie, bo program wyprzedza robota.
;
;   W czesci wydajnosciowej nie ma BREAK, SWAIT ani TWAIT. Zadanie ruchu
;   nigdy nie czeka na czujnik - czyta gotowa estymate liczona rownolegle.
;
; PROGRAMY
;   pl_init    - parametry; jedyne miejsce do edycji przy strojeniu
;   pl_read    - JEDYNE miejsce zalezne od sprzetu: ustawia pl.d
;   pl_sim     - PC 2: wirtualny stos i wirtualny dalmierz (tylko symulacja)
;   pl_probe   - PC 3: bramkowanie, filtr, estymata szczytu
;   pl_watch   - PC 4: predkosc TCP, chwytak, statystyka
;   pl_target  - estymata -> punkt pobrania, z ogranicznikami
;   pl_grab    - zalaczenie chwytaka (z zadania PC, po pozycji TCP)
;   pl_drop    - wylaczenie chwytaka nad odkladaniem
;   pl_cycle   - test: pl.ncyc cykli pobierz-odloz
;   pl_report  - wynik na terminal
;   pl_stop    - awaryjne zatrzymanie zadan PC
;
; URUCHOMIENIE
;   ustaw robota wysoko nad srodkiem stosu i:  >EXECUTE pl_cycle
; ====================================================================
;
; ---- tryb pracy ----------------------------------------------------
  pl.adapt = 1              ; 1 = wysokosc z dalmierza
;                           ; 0 = staly punkt pobrania (przebieg odniesienia
;                           ;     do porownania czasu cyklu)
  pl.ncyc = 12              ; liczba cykli w tescie
;
; ---- geometria stanowiska (wzgledem pozy startowej) ----------------
  pl.h0 = 800               ; wirtualny szczyt stosu ponizej pozy startowej [mm]
  pl.xpl = 900              ; odsuniecie stanowiska odkladania w X [mm]
  pl.zlift = 350            ; podniesienie po pobraniu [mm]
  pl.grip = 5               ; wysokosc TCP nad szczytem w chwili pobrania [mm]
  pl.rz = 200               ; promien strefy "nad stosem" w XY [mm]
  pl.thru = 0               ; pobranie w przelocie: odsuniecie w X na poczatku
;                           ; zjazdu i na koncu podniesienia [mm].
;                           ; 0 = zwykly zjazd i powrot pionowo. Przy zawrocie
;                           ; o 180 stopni skladowa pionowa predkosci musi
;                           ; przejsc przez zero - to nie jest postoj, ale
;                           ; v_min w raporcie bedzie male. Wartosc > 0 robi
;                           ; z zawrotu plaskie U, wiec predkosc TCP nigdy nie
;                           ; siada - kosztem ruchu poziomego w chwili
;                           ; zetkniecia z plyta. Sensowne dopiero przy
;                           ; podatnej przyssawce.
;
; ---- adaptacja wysokosci -------------------------------------------
  pl.freeze = 0             ; 0 = pomiar az do utraty zakresu czujnika
;                           ;     (to jest wlasciwy tryb aplikacji)
;                           ; 1 = stare zamrozenie estymaty na pl.zcom
  pl.zcom = 500             ; uzywane TYLKO gdy pl.freeze = 1 [mm]
  pl.seglen = 80            ; dlugosc segmentu zjazdu [mm]. Bufor planera
;                           ; przyjmuje kilka LMOVE do przodu; im krotszy
;                           ; segment, tym pozniej wiaze sie punkt chwytu.
;                           ; Za krotki (ponizej ~40 mm przy 1500 mm/s)
;                           ; konczy sie bledem E1117 (process time over)
  pl.nmax = 25              ; twardy limit segmentow na zjazd
  pl.tol = 200              ; maks. korekta wzgledem modelu [mm] - poza tym
;                           ; zakresem pomiar jest uznany za bledny
  pl.pre = 40               ; zalaczenie chwytaka tyle mm NAD plyta.
;                           ; Przy przyssawce trzeba dmuchnac przed
;                           ; kontaktem; przy chwytaku mechanicznym
;                           ; ustaw 0 i polegaj na zawrocie w Z
  pl.vac = 0                ; nr wyjscia chwytaka; 0 = tylko symulacja
;                           ; (nie rusza zadnym SIG)
;
; ---- predkosci i zlewanie segmentow --------------------------------
  pl.vfast = 1500           ; predkosc [mm/s]; ZAWSZE z jednostka MM/S -
;                           ; bez niej AS czyta liczbe jako procenty (E0106)
  pl.acc = 150              ; ACCURACY na trasie [mm] - duze, zeby segmenty
;                           ; zlewaly sie bez hamowania
  pl.accp = 3               ; ACCURACY w samym punkcie pobrania [mm]
;                           ; im mniejsze, tym dokladniej, ale tym mocniej
;                           ; robot hamuje na zawrocie - to jest ten kompromis
;
; ---- dalmierz ------------------------------------------------------
  pl.sig = 1001             ; pierwsze wejscie slowa 16-bit z odlegloscia
;                           ; (uzywane w pl_read po podpieciu czujnika)
  pl.hoff = 0               ; offset czujnika wzgledem TCP [mm] (0 = w osi TCP)
  pl.dmin = 40              ; dolny kraniec zakresu pomiarowego [mm]
  pl.dmax = 1200            ; gorny kraniec zakresu pomiarowego [mm]
  pl.tau = 0.03             ; opoznienie toru pomiarowego [s] - kompensowane
;                           ; przez predkosc pionowa; ustaw 0, zeby zobaczyc,
;                           ; ile bledu wnosi brak kompensacji
  pl.pdt = 0.01             ; okres probkowania estymatora [s]; ponizej tego
;                           ; zadanie PC przestaje wyrabiac
  pl.alfa = 0.35            ; wspolczynnik filtru wykladniczego (0..1)
  pl.jump = 150             ; prog odrzucenia pojedynczego skoku [mm]
  pl.nrmax = 8              ; po tylu odrzuceniach z rzedu estymata jest
;                           ; przestawiana na nowa wartosc (realne dolozenie
;                           ; duzej liczby plyt naraz)
  pl.nmin = 6               ; tyle waznych probek, zeby estymata byla wazna
  pl.fresh = 3.0            ; po tylu sekundach bez probki estymata jest stara
;
; ---- symulator dalmierza (TYLKO neoROSET, usun na stanowisku) ------
  pl.sdt = 0.01             ; okres symulatora [s]
  pl.noise = 2.0            ; amplituda szumu pomiaru [mm]
  pl.quant = 1.0            ; rozdzielczosc czujnika [mm] (0 = bez kwantyzacji)
  pl.nbuf = 3               ; opoznienie = pl.nbuf * pl.sdt = 30 ms
  pl.thick = 20             ; grubosc plyty [mm]
  pl.tadd = 8               ; co ile sekund dokladane sa plyty [s]
  pl.nadd = 5               ; ile plyt naraz
;
; ---- nadzor predkosci ----------------------------------------------
  pl.wdt = 0.02             ; okres probkowania predkosci [s]
  pl.vslow = 40             ; ponizej tej predkosci uznajemy, ze robot stoi [mm/s]
  pl.vturn = 60             ; prog wykrycia zawrotu w Z (chwila pobrania) [mm/s]
;
; ---- zmienne robocze (nie zmieniac) --------------------------------
  pl.run = 0
  pl.d = 0
  pl.dsim = 0
  pl.ztop = 0
  pl.ztgt = 0
  pl.zpick = 0
  pl.zmod = 0
  pl.zmin = 0
  pl.xp = 0
  pl.yp = 0
  pl.n = 0
  pl.nrej = 0
  pl.ok = 0
  pl.gprev = 0
  pl.tlast = 0
  pl.hit = 0
  pl.hitf = 0
  pl.held = 0
  pl.inz = 0
  pl.vmin = 99999
  pl.tslow = 0
  pl.thit = 0
  pl.zlow = 99999
  pl.ztru = 0
  pl.zused = 0
  pl.bi = 1
  FOR .i = 1 TO pl.nbuf
    pl.buf[.i] = pl.h0
  END
.END

.PROGRAM pl_read()
; --------------------------------------------------------------------
; JEDYNE MIEJSCE ZALEZNE OD SPRZETU.
; Zadanie: ustawic pl.d = odleglosc TCP -> powierzchnia [mm].
; Reszta programu nie wie i nie musi wiedziec, skad ta liczba pochodzi.
;
; TERAZ (symulacja w neoROSET) wartosc bierze sie z pl_sim.
;
; NA STANOWISKU zastap jedyna aktywna linie ponizej jedna z tych:
;
;   odleglosc jako slowo 16-bit w obrazie wejsc (PLC albo EtherNet/IP -
;   dla AS to nie ma znaczenia, EtherNet/IP mapuje sie na zwykle wejscia),
;   wartosc w dziesiatych milimetra, pierwsze wejscie bloku = pl.sig:
;       pl.d = BITS(pl.sig,16)/10.0
;
;   to samo, ale ze skalowaniem i offsetem z karty katalogowej czujnika:
;       pl.d = BITS(pl.sig,16)*pl.scale+pl.zerod
;
;   wejscie analogowe (wymaga karty ADC - osobna opcja):
;       pl.d = ADC(pl.ch)*pl.scale+pl.zerod
;
; Jesli czujnik sygnalizuje blad pomiaru wlasna wartoscia (np. 0 albo
; 65535), nie trzeba jej tu obslugiwac - pl_probe i tak odrzuca wszystko
; poza zakresem pl.dmin..pl.dmax.
; --------------------------------------------------------------------
  pl.d = pl.dsim
.END

.PROGRAM pl_sim()
; --------------------------------------------------------------------
; PC task: wirtualny stos i wirtualny dalmierz. TYLKO DO SYMULACJI -
; na stanowisku tego programu sie nie uruchamia.
;
; Odwzorowuje cztery rzeczy, ktore w praktyce psuja pomiar:
;   - szum (deterministyczny, zeby przebiegi byly powtarzalne),
;   - kwantyzacje do rozdzielczosci czujnika,
;   - opoznienie toru pomiarowego (bufor kolowy),
;   - dokladanie plyt w losowych z punktu widzenia robota momentach.
; --------------------------------------------------------------------
  .tadd = TIMER(0)
  WHILE pl.run == 1 DO
    TWAIT pl.sdt
    .t = TIMER(0)
;   Dokladanie plyt na stos - to jest ten "dynamicznie zmieniajacy sie
;   stos", dla ktorego caly ten program powstal.
    IF (.t-.tadd) >= pl.tadd THEN
      .tadd = .t
      pl.zstack = pl.zstack+pl.thick*pl.nadd
    END
;   Stos nie moze urosnac tak, zeby wysokosc zamrozenia estymaty wyszla
;   ponad poze startowa, ani zjechac poza zasieg czujnika.
    pl.zstack = MINVAL(pl.zstack,pl.zref-200)
    pl.zstack = MAXVAL(pl.zstack,pl.zref-pl.dmax+100)
;   Pomiar idealny.
    .d = DZ(HERE)+pl.hoff-pl.zstack
;   Szum: iloczyn dwoch sinusow o niewspolmiernych czestotliwosciach.
;   Wyglada jak szum, a jest powtarzalny miedzy przebiegami.
    .d = .d+pl.noise*SIN(360*7.3*.t)*SIN(360*3.1*.t+40)
;   Kwantyzacja do rozdzielczosci czujnika. Gdyby sterownik nie znal
;   funkcji INT (blad P0109 przy wczytywaniu), ustaw pl.quant = 0 -
;   caly ten krok jest wtedy pomijany i nic innego sie nie zmienia.
    IF pl.quant > 0 THEN
      .d = pl.quant*INT(.d/pl.quant+0.5)
    END
;   Opoznienie toru pomiarowego: najpierw oddaj najstarsza wartosc, potem
;   nadpisz ja swieza. Opoznienie wychodzi dokladnie pl.nbuf*pl.sdt.
    pl.dsim = pl.buf[pl.bi]
    pl.buf[pl.bi] = .d
    pl.bi = pl.bi+1
    IF pl.bi > pl.nbuf THEN
      pl.bi = 1
    END
  END
.END

.PROGRAM pl_probe()
; --------------------------------------------------------------------
; PC task: estymator wysokosci szczytu stosu.
;
; Probkuje dalmierz przez caly czas i sam decyduje, kiedy probka jest
; wazna. Nie wymaga zadnej synchronizacji z zadaniem ruchu - bramkuje
; sie po pozycji TCP i po odleglosci, wiec zadanie ruchu nie musi mu nic
; mowic ani na nic czekac.
;
; Trzy bramki:
;   - odleglosc w zakresie pomiarowym czujnika,
;   - TCP nad stosem (w promieniu pl.rz od srodka stosu),
;   - opcjonalnie pl.freeze = 1: odrzucenie probek blizej niz pl.zcom
;     (stary tryb). Przy pl.freeze = 0 pomiar zyje az czujnik wyjdzie
;     poza pl.dmin - wtedy TCP jest juz w oknie chwytu i ostatnie
;     milimetry ida z estymaty.
; --------------------------------------------------------------------
  pl.zprev = DZ(HERE)
  WHILE pl.run == 1 DO
    TWAIT pl.pdt
    CALL pl_read
    .znow = DZ(HERE)
;   Predkosc pionowa - potrzebna do kompensacji opoznienia pomiaru.
    .vz = (.znow-pl.zprev)/pl.pdt
    pl.zprev = .znow
    .good = 1
    IF pl.d < pl.dmin THEN
      .good = 0
    END
    IF pl.d > pl.dmax THEN
      .good = 0
    END
    IF pl.freeze == 1 THEN
      IF pl.d < pl.zcom THEN
        .good = 0
      END
    END
    IF ABS(DX(HERE)-pl.xs) > pl.rz THEN
      .good = 0
    END
    IF ABS(DY(HERE)-pl.ys) > pl.rz THEN
      .good = 0
    END
;   Wejscie w okno pomiarowe: estymata startuje od nowa, od pierwszej
;   probki tego przejscia. Gdyby ciagnac wartosc z poprzedniego cyklu,
;   filtr nie zdazylby zbiec przed zamrozeniem - a stos w miedzyczasie
;   mogl podskoczyc o kilka plyt.
    IF .good == 1 THEN
      IF pl.gprev == 0 THEN
        pl.n = 0
        pl.nrej = 0
        pl.ok = 0
      END
    END
    pl.gprev = .good
    IF .good == 1 THEN
;     Odczyt pl.d pochodzi sprzed pl.tau sekund, czyli z chwili, gdy TCP
;     bylo o .vz*pl.tau wyzej. Bez tej poprawki wynik zalezy od predkosci
;     zjazdu - i to jest najlatwiejszy do przeoczenia blad w calym ukladzie.
      .z = .znow-.vz*pl.tau+pl.hoff-pl.d
      IF pl.n == 0 THEN
        pl.ztop = .z
      END
      IF ABS(.z-pl.ztop) < pl.jump THEN
        pl.ztop = pl.ztop+pl.alfa*(.z-pl.ztop)
        pl.n = pl.n+1
        pl.nrej = 0
        pl.tlast = TIMER(0)
      ELSE
;       Skok wiekszy niz prog to zaklocenie - pojedynczy odrzucamy, ale
;       jesli powtarza sie pl.nrmax razy z rzedu, to jednak jest prawda
;       i estymate trzeba przestawic, zamiast ja blokowac.
        pl.nrej = pl.nrej+1
        IF pl.nrej >= pl.nrmax THEN
          pl.ztop = .z
          pl.nrej = 0
          pl.tlast = TIMER(0)
        END
      END
      IF pl.n >= pl.nmin THEN
        pl.ok = 1
      END
    END
  END
.END

.PROGRAM pl_target()
; --------------------------------------------------------------------
; Estymata -> punkt pobrania. Wywolywane z zadania ruchu przed kazdym
; segmentem zjazdu. Nie blokuje sie i nie czeka na nic.
;
; Pomiar nie jest tu jedynym zrodlem prawdy. Jest korekta modelu, i to
; korekta ograniczona do pl.tol. Zly odczyt moze wiec pogorszyc pozycje
; o pl.tol, ale nie wbije robota w stos.
; --------------------------------------------------------------------
  .z = pl.zmod
  IF pl.adapt == 1 THEN
    IF pl.ok == 1 THEN
      IF (TIMER(0)-pl.tlast) < pl.fresh THEN
        .z = MAXVAL(MINVAL(pl.ztop,pl.zmod+pl.tol),pl.zmod-pl.tol)
      END
    END
  END
  pl.ztgt = .z
  pl.zpick = MAXVAL(.z+pl.grip,pl.zmin)
.END

.PROGRAM pl_grab()
; --------------------------------------------------------------------
; Zalaczenie chwytaka. Wolane z pl_watch, czyli z rzeczywistej pozycji
; TCP, a nie z zadania ruchu (to wyprzedza robota o bufor planera).
; --------------------------------------------------------------------
  IF pl.hitf == 1 THEN
    RETURN
  END
  IF pl.vac <> 0 THEN
    SIG pl.vac
  END
  pl.hitf = 1
  pl.held = 1
  pl.ztru = pl.zstack
  pl.zstack = pl.zstack-pl.thick
.END

.PROGRAM pl_drop()
; --------------------------------------------------------------------
; Wylaczenie chwytaka nad stanowiskiem odkladania.
; --------------------------------------------------------------------
  IF pl.held == 0 THEN
    RETURN
  END
  IF pl.vac <> 0 THEN
    SIG -pl.vac
  END
  pl.held = 0
.END

.PROGRAM pl_watch()
; --------------------------------------------------------------------
; PC task: nadzor predkosci i wykrycie chwili pobrania.
;
; To jest caly dowod na to, ze robot sie nie zatrzymuje. Zadanie liczy
; predkosc TCP co pl.wdt i zapamietuje jej minimum oraz laczny czas
; ponizej pl.vslow w kazdym cyklu. Jesli w raporcie v_min jest wyraznie
; wieksze od zera, a t_wolno bliskie zeru, to w cyklu nie ma postoju.
;
; Chwytak zalacza sie po rzeczywistej pozycji TCP, nie po programie:
;   - okno chwytu: TCP jest nad stosem i nie wyzej niz pl.pre nad plyta
;     (albo dalmierz sam wpadl w to okno, jesli jeszcze mierzy),
;   - awaryjnie: zawrot predkosci pionowej, gdyby okno zostalo
;     przegapione (czujnik wyszedl poza zakres wczesniej).
;
; Wylaczenie chwytaka: TCP nad stanowiskiem odkladania.
;
; Osiagnieta glebokosc jest brana jako minimum Z z calego przejscia nad
; stosem, a nie jako pozycja w chwili wykrycia zawrotu - detekcja z
; progiem pl.vturn wypada kilka milimetrow przed dnem i zanizalaby blad.
; Caly cykl jest zamykany dopiero przy wyjsciu ze strefy nad stosem.
; --------------------------------------------------------------------
  POINT pl.pp = HERE
  pl.vzprev = 0
  pl.thit = TIMER(0)
  WHILE pl.run == 1 DO
    TWAIT pl.wdt
    POINT pl.pn = HERE
    .dx = DX(pl.pn)-DX(pl.pp)
    .dy = DY(pl.pn)-DY(pl.pp)
    .dz = DZ(pl.pn)-DZ(pl.pp)
    .v = SQRT(.dx*.dx+.dy*.dy+.dz*.dz)/pl.wdt
    .vz = .dz/pl.wdt
    pl.vmin = MINVAL(pl.vmin,.v)
    IF .v < pl.vslow THEN
      pl.tslow = pl.tslow+pl.wdt
    END
;   Czy TCP jest nad stosem?
    .inz = 1
    IF ABS(DX(pl.pn)-pl.xs) > pl.rz THEN
      .inz = 0
    END
    IF ABS(DY(pl.pn)-pl.ys) > pl.rz THEN
      .inz = 0
    END
    IF .inz == 1 THEN
      pl.zlow = MINVAL(pl.zlow,DZ(pl.pn))
      IF pl.hitf == 0 THEN
        .zg = pl.zmod
        IF pl.ok == 1 THEN
          .zg = pl.ztop
        END
;       Okno chwytu: TCP jest juz na tyle nisko, ze chwytak siega plyty.
        IF (DZ(pl.pn)-.zg) <= (pl.grip+pl.pre) THEN
          CALL pl_grab
        END
      END
      IF pl.hitf == 0 THEN
        IF pl.vzprev < -pl.vturn THEN
          IF .vz > -pl.vturn THEN
            CALL pl_grab
          END
        END
      END
    END
;   Odlozenie: TCP nad stanowiskiem odkladania.
    .inp = 1
    IF ABS(DX(pl.pn)-pl.xp) > pl.rz THEN
      .inp = 0
    END
    IF ABS(DY(pl.pn)-pl.yp) > pl.rz THEN
      .inp = 0
    END
    IF .inp == 1 THEN
      CALL pl_drop
    END
;   Wyjscie ze strefy nad stosem = koniec cyklu.
    IF .inz == 0 THEN
      IF pl.inz == 1 THEN
        IF pl.hitf == 1 THEN
          IF pl.hit < pl.ncyc THEN
            pl.hit = pl.hit+1
            pl.zt[pl.hit] = pl.ztru
            pl.zc[pl.hit] = pl.zused
            pl.ze[pl.hit] = pl.zlow-pl.grip-pl.ztru
            pl.vm[pl.hit] = pl.vmin
            pl.ts[pl.hit] = pl.tslow
            pl.tc[pl.hit] = TIMER(0)-pl.thit
            pl.thit = TIMER(0)
;           Model na nastepny cykl - punkt wyjscia, gdyby pomiar padl.
;           W przebiegu odniesienia model zostaje staly, zeby geometria
;           cyklu sie nie zmieniala i czas cyklu byl porownywalny.
            IF pl.adapt == 1 THEN
              pl.zmod = pl.zused-pl.thick
            END
          END
        END
        pl.vmin = 99999
        pl.tslow = 0
        pl.zlow = 99999
        pl.hitf = 0
      END
    END
    pl.inz = .inz
    pl.vzprev = .vz
    POINT pl.pp = pl.pn
  END
.END

.PROGRAM pl_cycle()
; --------------------------------------------------------------------
; Test wlasciwy: pl.ncyc cykli pobierz-odloz.
;
; Ustaw robota wysoko nad srodkiem stosu - ta poza jest punktem
; odniesienia dla calej geometrii i dla wirtualnego stosu, ktory
; symulator umieszcza pl.h0 milimetrow nizej. Zadnej pozy nie trzeba
; uczyc.
;
; W czesci wydajnosciowej nie ma ani jednego BREAK - robot nie czeka
; na czujnik, nie hamuje na pomiar i nie stoi nad stosem. Jedyny BREAK
; jest po ostatnim cyklu, zeby doczekac konca ruchu przed ubiciem PC.
; --------------------------------------------------------------------
  CALL pl_init
  POINT pl.home = HERE
  pl.zref = DZ(pl.home)
  pl.xs = DX(pl.home)
  pl.ys = DY(pl.home)
;
; Wirtualny stos i model startowy. Model jest celowo przesuniety
; wzgledem prawdy o pl.thick*2, zeby bylo widac, ze pierwszy cykl
; sciaga go pomiarem, a nie ze wszystko od poczatku sie zgadza.
  pl.zstack = pl.zref-pl.h0
  pl.zmod = pl.zstack+pl.thick*2
  pl.zmin = pl.zref-pl.dmax+50
;
  POINT pl.pplace = SHIFT(pl.home BY pl.xpl,0,0)
  pl.xp = DX(pl.pplace)
  pl.yp = DY(pl.pplace)
  POINT pl.plow = SHIFT(pl.home BY 0,0,pl.zmin-pl.zref)
  IF INRANGE(pl.pplace) <> 0 THEN
    TYPE "Punkt odkladania poza zakresem - zmniejsz pl.xpl."
    STOP
  END
  IF INRANGE(pl.plow) <> 0 THEN
    TYPE "Dolny kraniec zjazdu poza zakresem - podnies robota."
    STOP
  END
;
  ABS.SPEED ON
  SPEED pl.vfast MM/S ALWAYS
  ACCURACY pl.acc ALWAYS
  CP ON
;
  pl.run = 1
  PCEXECUTE 2: pl_sim,1
  PCEXECUTE 3: pl_probe,1
  PCEXECUTE 4: pl_watch,1
; Rozbieg filtru - jedyne oczekiwanie w calym programie, przed ruchem.
  TWAIT 0.5
;
  FOR .c = 1 TO pl.ncyc
;   Zjazd nad stos lancuchem segmentow. Kazdy LMOVE jest wystawiany
;   z aktualna estymata. Gdy bufor planera jest pelny, ten WHILE czeka
;   na slot - robot jedzie dalej, a kolejny segment dostaje juz swiezszy
;   pomiar. To jest "zjezdza i caly czas sprawdza wysokosc" bez RTPM
;   i bez zwalniania.
    .zcmd = pl.zref
    .desc = 1
    .n = 0
    WHILE .desc == 1 DO
      CALL pl_target
      .n = .n+1
      .next = .zcmd-pl.seglen
      IF .next <= pl.zpick THEN
        .next = pl.zpick
        .desc = 0
        pl.zused = pl.ztgt
        ACCURACY pl.accp
      END
      IF .n >= pl.nmax THEN
        .next = pl.zpick
        .desc = 0
        pl.zused = pl.ztgt
        ACCURACY pl.accp
      END
      IF pl.zpick >= .zcmd THEN
        .next = pl.zpick
        .desc = 0
        pl.zused = pl.ztgt
        ACCURACY pl.accp
      END
      .zcmd = .next
      .den = pl.zref-pl.zpick
      IF .den < 1 THEN
        .den = 1
      END
      .x = -pl.thru*(.zcmd-pl.zpick)/.den
      POINT pl.pd = SHIFT(pl.home BY .x,0,.zcmd-pl.zref)
      LMOVE pl.pd
    END
    ACCURACY pl.acc ALWAYS
;
;   Chwytak zalacza pl_watch po pozycji TCP. Zadanie glowne nie czeka.
    POINT pl.pu = SHIFT(pl.home BY pl.thru,0,pl.zused+pl.grip+pl.zlift-pl.zref)
    LMOVE pl.pu
    LMOVE pl.pplace
    LMOVE pl.home
  END
;
; Jedyny BREAK w calym pliku, i to poza czescia wydajnosciowa: po
; ostatnim cyklu trzeba doczekac konca ruchu, zanim padna zadania PC.
  BREAK
  pl.run = 0
  TWAIT 0.3
  PCABORT 2:
  PCABORT 3:
  PCABORT 4:
  CALL pl_report
.END

.PROGRAM pl_report()
; --------------------------------------------------------------------
; Wynik na terminal neoROSET. Zadnych narzedzi zewnetrznych.
;
; Jak czytac:
;   blad      - o ile TCP minelo sie z prawdziwym szczytem stosu;
;               to jest dokladnosc calego ukladu
;   v_min     - najmniejsza predkosc TCP w cyklu; jesli jest wyraznie
;               wieksza od zera, robot sie nie zatrzymal
;   t_wolno   - laczny czas w cyklu z predkoscia ponizej pl.vslow
;   t_cyklu   - czas miedzy kolejnymi pobraniami, mierzony przez PC task
;               na rzeczywistym ruchu, a nie na przeplywie programu
;
; Pierwszy cykl jest pomijany - robot startuje z postoju i filtr dopiero
; sie rozbiega, wiec jego liczby nic nie mowia.
; --------------------------------------------------------------------
  IF pl.hit < 2 THEN
    TYPE "Za malo cykli do raportu."
    RETURN
  END
  .emax = 0
  .esum = 0
  .tsum = 0
  .vglob = 99999
  .tsl = 0
  .k = 0
  TYPE " "
  IF pl.adapt == 1 THEN
    TYPE "PLATE: wysokosc pobrania z dalmierza (pl.adapt = 1)"
  ELSE
    TYPE "PLATE: staly punkt pobrania - przebieg odniesienia (pl.adapt = 0)"
  END
  TYPE "cykl  t_cykl  szczyt   estym    blad   v_min  t_wolno"
  FOR .i = 2 TO pl.hit
    .k = .k+1
    .e = pl.ze[.i]
    .tc = pl.tc[.i]
    .zt = pl.zt[.i]
    .zc = pl.zc[.i]
    .vm = pl.vm[.i]
    .ts = pl.ts[.i]
    .emax = MAXVAL(.emax,ABS(.e))
    .esum = .esum+ABS(.e)
    .tsum = .tsum+.tc
    .tsl = .tsl+.ts
    .vglob = MINVAL(.vglob,.vm)
    TYPE /F4.0,.i,/F8.3,.tc,/F8.1,.zt,/F8.1,.zc,/F8.2,.e,/F8.1,.vm,/F9.3,.ts
  END
  TYPE " "
  TYPE "cykli w statystyce      : ",/F5.0,.k
  TYPE "sredni czas cyklu [s]   : ",/F8.3,.tsum/.k
  TYPE "blad max [mm]           : ",/F8.2,.emax
  TYPE "blad sredni [mm]        : ",/F8.2,.esum/.k
  TYPE "najmniejsze v_min [mm/s]: ",/F8.1,.vglob
  TYPE "laczny czas wolnej jazdy [s]: ",/F8.3,.tsl
  TYPE " "
  TYPE "Brak zatrzyman  = v_min wyraznie wieksze od zera, t_wolno bliskie zeru."
  TYPE "Brak straty     = sredni czas cyklu taki sam jak przy pl.adapt = 0."
.END

.PROGRAM pl_stop()
; --------------------------------------------------------------------
; Awaryjne zatrzymanie zadan PC (np. po przerwaniu testu przez HOLD).
; --------------------------------------------------------------------
  pl.run = 0
  PCABORT 2:
  PCABORT 3:
  PCABORT 4:
  TYPE "Zadania PC zatrzymane."
.END
