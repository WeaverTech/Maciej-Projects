.PROGRAM zc_init()
; ====================================================================
; RTPM Z-CHASE  -  stanowisko testowe "uciekajacego punktu" w osi Z
; Robot: Kawasaki serii CP (paletyzator), symulacja neoROSET
; Plik jest ASCII - AS nie przyjmuje polskich znakow diakrytycznych.
;
; Programy w tym pliku:
;   zc_init      - parametry testu (edytuj tutaj)
;   zc_gen       - PC task 2: generator uciekajacego punktu w Z
;   zc_log       - PC task 3: rejestrator zadana/rzeczywista
;   zc_send      - JEDYNE miejsce zalezne od opcji RTPM
;   zc_main      - test wlasciwy z RTPM (ruch nosny + korekta Z)
;   zc_main_std  - test odniesienia bez opcji RTPM (poscig LMOVE)
;   zc_report    - zrzut logu w formacie CSV na terminal
;   zc_stop      - awaryjne zatrzymanie zadan PC
;
; Uruchomienie:  >EXECUTE zc_main       lub  >EXECUTE zc_main_std
; ====================================================================
;
; ---- wybor profilu ruchu celu -------------------------------------
; 1 = sinus            (pomiar pasma: tlumienie amplitudy i opoznienie)
; 2 = schodek          (pomiar maksymalnej predkosci nadazania)
; 3 = uciekajacy punkt (cel ucieka, gdy robot sie zbliza)
  zc.mode = 3
  zc.dt = 0.02              ; okres generatora [s]
  zc.ttest = 30             ; czas trwania testu [s]
;
; ---- profil 1: sinus ----------------------------------------------
  zc.amp = 10               ; amplituda [mm]
  zc.freq = 0.5             ; czestotliwosc [Hz]
;
; ---- profil 2: schodek --------------------------------------------
  zc.stepdz = 5             ; wysokosc schodka [mm]
  zc.stepdt = 2             ; odstep miedzy schodkami [s]
;
; ---- profil 3: uciekajacy punkt -----------------------------------
  zc.vflee = 40             ; predkosc ucieczki celu [mm/s]
  zc.gap = 15               ; dystans, przy ktorym cel zaczyna uciekac [mm]
  zc.zup = 60               ; gorny kraniec wedrowki celu wzgl. Z0 [mm]
  zc.zdn = -60              ; dolny kraniec wedrowki celu wzgl. Z0 [mm]
;
; ---- ograniczniki korekty (chronia przed E1092 i E1118) -----------
  zc.lim = 80               ; maksymalna wartosc |korekty| [mm]
  zc.rate = 2.0             ; maksymalny przyrost korekty na cykl [mm]
;                           ; zc.rate/zc.dt = predkosc korekty [mm/s]
;
; ---- ruch nosny (carrier) -----------------------------------------
  zc.xamp = 250             ; amplituda przejazdu w X [mm]
  zc.fcar = 0.1             ; czestotliwosc przejazdu w X [Hz] (tylko std)
  zc.vcar = 300             ; predkosc [mm/s], wymaga ABS.SPEED ON
  zc.acc = 50               ; ACCURACY [mm] - zlewanie segmentow w CP
  zc.seg = 10               ; min. dlugosc segmentu w zc_main_std [mm]
;                           ; za male segmenty zalewaja planer i konczy
;                           ; sie to bledem E1117 (process time over)
;
; ---- rejestrator ---------------------------------------------------
  zc.lmax = 600             ; liczba probek (600 x 0.05 s = 30 s)
  zc.ldt = 0.05             ; okres probkowania [s]
;
; ---- zmienne robocze (nie zmieniac) --------------------------------
  zc.t0 = TIMER(0)
  zc.run = 0
  zc.dz = 0
  zc.dzsent = 0
  zc.tgt = 0
  zc.act = 0
  zc.err = 0
  zc.dir = 1
  zc.nrange = 0
  zl.n = 0
.END

.PROGRAM zc_gen()
; --------------------------------------------------------------------
; PC task: generator "uciekajacego punktu" w osi Z.
; Zadanie liczy tor celu i korekte, ale sam jej nie wykonuje -
; korekta trafia do zc_send (RTPM) albo do zc_main_std (poscig LMOVE).
; Wystawia:
;   zc.tgt - bezwzgledne Z celu [mm]
;   zc.dz  - korekta wzgledem toru nominalnego [mm], po ograniczeniach
;   zc.act - biezace Z narzedzia [mm]
;   zc.err - uchyb nadazania (cel - narzedzie) [mm]
; Instrukcje ruchu sa w zadaniach PC zabronione (blad E1095), dlatego
; ten program tylko liczy.
; --------------------------------------------------------------------
  zc.tgt = zc.z0
  zc.dz = 0
  zc.dir = 1
  .tlast = zc.t0
  WHILE zc.run == 1 DO
    TWAIT zc.dt
    .now = TIMER(0)
    .t = .now-zc.t0
    zc.act = DZ(HERE)
    CASE zc.mode OF
      VALUE 1:
        zc.tgt = zc.z0+zc.amp*SIN(360*zc.freq*.t)
      VALUE 2:
        IF (.now-.tlast) >= zc.stepdt THEN
          .tlast = .now
          zc.tgt = zc.tgt+zc.stepdz*zc.dir
        END
      ANY
;       Cel ucieka dopiero wtedy, gdy robot podejdzie blizej niz zc.gap.
;       Dzieki temu w logu widac cykl: dogonienie - ucieczka - nawrot.
        IF ABS(zc.tgt-zc.act) < zc.gap THEN
          zc.tgt = zc.tgt+zc.dir*zc.vflee*zc.dt
        END
    END
;   Odbicie od krancow zakresu, zeby cel nie uciekl poza obszar roboczy.
    IF zc.tgt > (zc.z0+zc.zup) THEN
      zc.tgt = zc.z0+zc.zup
      zc.dir = -1
    END
    IF zc.tgt < (zc.z0+zc.zdn) THEN
      zc.tgt = zc.z0+zc.zdn
      zc.dir = 1
    END
;   Ogranicznik amplitudy korekty.
    .d = zc.tgt-zc.z0
    .d = MAXVAL(MINVAL(.d,zc.lim),-zc.lim)
;   Ogranicznik predkosci narastania korekty.
    .d = MAXVAL(MINVAL(.d,zc.dz+zc.rate),zc.dz-zc.rate)
    zc.dz = .d
    zc.err = zc.tgt-zc.act
    CALL zc_send(zc.dz)
  END
.END

.PROGRAM zc_send(.dz)
; --------------------------------------------------------------------
; JEDYNE MIEJSCE ZALEZNE OD OPCJI RTPM.
;
; Wpisz tutaj instrukcje przekazania korekty z manuala opcji
; (90210-1333 "Real Time Path Modification by User Input").
; Sprawdz w manualu, czy opcja przyjmuje korekte:
;   - bezwzgledna  (calkowite przesuniecie wzgledem toru nauczonego):
;         przekaz  0, 0, .dz
;   - przyrostowa  (delta na cykl):
;         przekaz  0, 0, .dz-zc.dzsent
;
; UWAGA dla serii CP: to paletyzator, narzedzie jest zawsze pionowe,
; wiec realizowalne sa wylacznie korekty X, Y, Z oraz obrot wokol Z.
; Zadanie korekty w RX/RY konczy sie bledem konfiguracji (E1089).
;
; Dopoki opcja nie jest wpieta, procedura tylko zapamietuje wartosc,
; a caly rig dziala w trybie odniesienia (zc_main_std).
; --------------------------------------------------------------------
  zc.dzsent = .dz
.END

.PROGRAM zc_log()
; --------------------------------------------------------------------
; PC task: rejestrator. Probkuje niezaleznie od generatora, zeby log
; pokazywal rzeczywiste nadazanie, a nie tylko zamiary generatora.
; --------------------------------------------------------------------
  zl.n = 0
  WHILE zc.run == 1 DO
    TWAIT zc.ldt
    IF zl.n < zc.lmax THEN
      zl.n = zl.n+1
      zl.t[zl.n] = TIMER(0)-zc.t0
      zl.tgt[zl.n] = zc.tgt
      zl.act[zl.n] = DZ(HERE)
      zl.dz[zl.n] = zc.dz
    END
;   Podglad na panelu operatora - wymaga okna zdefiniowanego w
;   funkcji pomocniczej 0509. Odkomentuj, jesli okno 1 jest wolne.
;   IFPWOVERWRITE 1 1,1,1 = $ENCODE(/F8.2,zc.tgt),$ENCODE(/F8.2,zc.err)
  END
.END

.PROGRAM zc_main()
; --------------------------------------------------------------------
; Test wlasciwy z RTPM.
; Robot jedzie powolnym ruchem nosnym w osi X miedzy dwoma punktami
; wyliczonymi wzgledem pozy startowej, a opcja RTPM nadklada na ten tor
; korekte w Z pochodzaca z zc_gen. Zadna poza nie musi byc nauczona -
; punkt odniesienia to biezaca poza robota.
;
; Przed uruchomieniem ustaw robota mniej wiecej w srodku obszaru
; roboczego, z zapasem +/- (zc.lim + zc.zup) w osi Z.
; --------------------------------------------------------------------
  CALL zc_init
  POINT zc.home = HERE
  zc.z0 = DZ(zc.home)
  POINT zc.pa = SHIFT(zc.home BY zc.xamp,0,0)
  POINT zc.pb = SHIFT(zc.home BY -zc.xamp,0,0)
  IF INRANGE(zc.pa) <> 0 THEN
    TYPE "Punkt zc.pa poza zakresem - zmniejsz zc.xamp lub przestaw robota."
    STOP
  END
  IF INRANGE(zc.pb) <> 0 THEN
    TYPE "Punkt zc.pb poza zakresem - zmniejsz zc.xamp lub przestaw robota."
    STOP
  END
  ABS.SPEED ON
  SPEED zc.vcar ALWAYS
  ACCURACY zc.acc ALWAYS
  CP ON
  zc.t0 = TIMER(0)
  zc.run = 1
  PCEXECUTE 2: zc_gen,1
  PCEXECUTE 3: zc_log,1
;
; --- TUTAJ WLACZ RTPM (instrukcja z manuala opcji) -------------------
; np.  <instrukcja RTPM ON>
;
  TIMER (1) = 0
  WHILE TIMER(1) < zc.ttest DO
    LMOVE zc.pa
    LMOVE zc.pb
  END
  BREAK
;
; --- TUTAJ WYLACZ RTPM ----------------------------------------------
; np.  <instrukcja RTPM OFF>
;
  zc.run = 0
  TWAIT 1
  LMOVE zc.home
  BREAK
  CALL zc_report
.END

.PROGRAM zc_main_std()
; --------------------------------------------------------------------
; Test odniesienia BEZ opcji RTPM.
; Robot goni uciekajacy punkt ciagiem krotkich ruchow LMOVE. Kolejny
; LMOVE jest wystawiany dopiero, gdy bufor planera sie zwolni, wiec
; czestotliwosc korekty jest ograniczona czasem segmentu - i wlasnie ta
; roznica wzgledem zc_main pokazuje, co daje RTPM.
;
; Ten wariant dziala na golym AS, bez zadnych opcji, wiec nadaje sie
; do sprawdzenia calego rigu (generator, log, raport) zanim opcja RTPM
; zostanie odblokowana w kontrolerze.
; --------------------------------------------------------------------
  CALL zc_init
  POINT zc.home = HERE
  zc.z0 = DZ(zc.home)
  ABS.SPEED ON
  SPEED zc.vcar ALWAYS
  ACCURACY zc.acc ALWAYS
  CP ON
  zc.t0 = TIMER(0)
  zc.run = 1
  zc.nrange = 0
  PCEXECUTE 2: zc_gen,1
  PCEXECUTE 3: zc_log,1
  POINT zc.p = zc.home
  .xlast = 0
  .zlast = 0
  TIMER (1) = 0
  WHILE TIMER(1) < zc.ttest DO
    .x = zc.xamp*SIN(360*zc.fcar*TIMER(1))
;   Nowy segment dopiero po przesunieciu celu o zc.seg - inaczej petla
;   wystawia mikroruchy szybciej, niz planer jest w stanie je przyjac.
    IF (ABS(.x-.xlast)+ABS(zc.dz-.zlast)) >= zc.seg THEN
      POINT zc.p = SHIFT(zc.home BY .x,0,zc.dz)
      IF INRANGE(zc.p) == 0 THEN
        .xlast = .x
        .zlast = zc.dz
        LMOVE zc.p
      ELSE
        zc.nrange = zc.nrange+1
      END
    ELSE
      TWAIT zc.dt
    END
  END
  BREAK
  zc.run = 0
  TWAIT 1
  LMOVE zc.home
  BREAK
  IF zc.nrange > 0 THEN
    TYPE "Pominietych pozycji poza zakresem: ",zc.nrange
  END
  CALL zc_report
.END

.PROGRAM zc_report()
; --------------------------------------------------------------------
; Zrzut logu na terminal w formacie CSV (separator srednik).
; Zaznacz wynik w KRterm / oknie terminala neoROSET, wklej do pliku
; log.csv i przepusc przez tools/zc_analyze.py.
; --------------------------------------------------------------------
  .emax = 0
  .esum = 0
  .esq = 0
  TYPE "---- BEGIN CSV ----"
  TYPE "t;z_tgt;z_act;dz;err"
  FOR .i = 1 TO zl.n
    .e = zl.tgt[.i]-zl.act[.i]
    .emax = MAXVAL(.emax,ABS(.e))
    .esum = .esum+ABS(.e)
    .esq = .esq+.e*.e
    TYPE /F8.3,zl.t[.i],";",/F9.3,zl.tgt[.i],";",/F9.3,zl.act[.i],";",/F9.3,zl.dz[.i],";",/F9.3,.e
  END
  TYPE "---- END CSV ----"
  IF zl.n > 0 THEN
    TYPE "Probek: ",zl.n," tryb: ",zc.mode
    TYPE "Uchyb max [mm]: ",/F9.3,.emax
    TYPE "Uchyb sredni [mm]: ",/F9.3,.esum/zl.n
    TYPE "Uchyb RMS [mm]: ",/F9.3,SQRT(.esq/zl.n)
  END
.END

.PROGRAM zc_stop()
; --------------------------------------------------------------------
; Awaryjne zatrzymanie zadan PC (np. po przerwaniu testu przez HOLD).
; --------------------------------------------------------------------
  zc.run = 0
  PCABORT 2:
  PCABORT 3:
  TYPE "Zadania PC zatrzymane."
.END
