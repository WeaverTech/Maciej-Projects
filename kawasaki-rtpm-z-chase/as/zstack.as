.PROGRAM zs_init()
; ====================================================================
; ZSTACK - wyszukiwanie wysokosci stosu warstw dalmierzem na kisci
; Robot: Kawasaki serii CP (paletyzator), neoROSET
; Plik ASCII - AS nie przyjmuje polskich znakow diakrytycznych.
;
; Wariant bez zadnych opcji: robot zjezdza powoli w dol, a zadanie PC
; pilnuje sygnalu z dalmierza i w momencie zadzialania zatrzymuje ruch
; instrukcja BRAKE (jedyna instrukcja ruchu dozwolona w zadaniu PC).
;
; Programy:
;   zs_init    - parametry
;   zs_watch   - PC task 4: nadzor sygnalu + zatrzymanie ruchu
;   zs_search  - jeden przejazd pomiarowy, wynik w zs.ztop
;   zs_repeat  - test powtarzalnosci: N pomiarow + statystyka
;
; Uruchomienie:  >EXECUTE zs_repeat
; ====================================================================
;
; ---- dalmierz ------------------------------------------------------
  zs.sig = 1001             ; nr wejscia z wyjscia przelaczajacego czujnika
  zs.off = 100              ; odleglosc TCP od mierzonego punktu w chwili
;                           ; zadzialania czujnika [mm]; do skalibrowania
;                           ; na znanej wysokosci wzorcowej
;
; ---- zakres szukania (wzgledem pozy startowej) ---------------------
  zs.zstart = 200           ; start szukania, powyzej spodziewanego szczytu
  zs.zend = -400            ; koniec szukania, ponizej spodziewanego szczytu
;
; ---- predkosci -----------------------------------------------------
  zs.vfast = 300            ; dojazd nad stos [mm/s]
  zs.vsearch = 20           ; przejazd pomiarowy [mm/s] - patrz uwaga nizej
;                           ; droga hamowania po BRAKE rosnie z predkoscia
;                           ; i wchodzi wprost w blad pomiaru
;
; ---- test powtarzalnosci -------------------------------------------
  zs.n = 10                 ; liczba powtorzen
;
; ---- zmienne robocze -----------------------------------------------
  zs.hit = 0
  zs.zhit = 0
  zs.ztop = 0
.END

.PROGRAM zs_watch()
; --------------------------------------------------------------------
; PC task: czeka na sygnal z dalmierza i zatrzymuje ruch.
; Pozycja jest odczytywana PRZED zatrzymaniem, zeby zawierala jak
; najmniej drogi hamowania - ale i tak zostaje opoznienie jednego
; cyklu zadania PC. Przy 20 mm/s to ulamek milimetra, przy 200 mm/s
; juz kilka milimetrow. Stad wolny przejazd pomiarowy.
; --------------------------------------------------------------------
  SWAIT zs.sig
  zs.zhit = DZ(HERE)
  zs.hit = 1
  BRAKE
.END

.PROGRAM zs_search()
; --------------------------------------------------------------------
; Jeden przejazd pomiarowy. Poza odniesienia (zs.home) musi byc
; ustawiona przez program wywolujacy.
; Wynik: zs.ztop - wysokosc szczytu stosu w ukladzie bazowym [mm]
;        zs.hit  - 1 gdy wykryto, 0 gdy nie
; --------------------------------------------------------------------
  POINT zs.p0 = SHIFT(zs.home BY 0,0,zs.zstart)
  POINT zs.p1 = SHIFT(zs.home BY 0,0,zs.zend)
  IF INRANGE(zs.p1) <> 0 THEN
    TYPE "Koniec zakresu szukania poza zasiegiem - popraw zs.zend."
    zs.hit = 0
    RETURN
  END
  ABS.SPEED ON
  ACCURACY 1 ALWAYS
  SPEED zs.vfast MM/S ALWAYS
  LMOVE zs.p0
  BREAK
  IF SIG(zs.sig) THEN
    TYPE "Czujnik aktywny juz na starcie - podnies zs.zstart."
    zs.hit = 0
    RETURN
  END
  zs.hit = 0
  zs.zhit = 0
  PCEXECUTE 4: zs_watch,1
  TWAIT 0.1
  SPEED zs.vsearch MM/S ALWAYS
  LMOVE zs.p1
  BREAK
  PCABORT 4:
  IF zs.hit == 0 THEN
    TYPE "Nie wykryto stosu w zadanym zakresie."
    RETURN
  END
  zs.ztop = zs.zhit-zs.off
.END

.PROGRAM zs_repeat()
; --------------------------------------------------------------------
; Test powtarzalnosci pomiaru - to jest wlasciwy test dla tej aplikacji.
; Nie interesuje nas pasmo korekty, tylko rozrzut wyniku pomiaru tej
; samej, nieruchomej warstwy. Rozrzut przeklada sie 1:1 na dokladnosc
; odkladania, wiec to on decyduje, czy uklad sie nadaje.
;
; Warto powtorzyc przy kilku wartosciach zs.vsearch - jesli wynik
; zalezy od predkosci przejazdu, dominuje droga hamowania i trzeba albo
; zwolnic, albo siegnac po HSENSESET/HSENSE (opcja), ktore zatrzaskuja
; poze w chwili zbocza sygnalu, niezaleznie od hamowania.
; --------------------------------------------------------------------
  CALL zs_init
  POINT zs.home = HERE
  .sum = 0
  .sq = 0
  .cnt = 0
  .zmin = 0
  .zmax = 0
  FOR .i = 1 TO zs.n
    CALL zs_search
    IF zs.hit == 1 THEN
      .cnt = .cnt+1
      .sum = .sum+zs.ztop
      .sq = .sq+zs.ztop*zs.ztop
      IF .cnt == 1 THEN
        .zmin = zs.ztop
        .zmax = zs.ztop
      END
      .zmin = MINVAL(.zmin,zs.ztop)
      .zmax = MAXVAL(.zmax,zs.ztop)
      TYPE "pomiar ",/F3.0,.i,"  z_szczytu [mm] = ",/F9.3,zs.ztop
    END
  END
  SPEED zs.vfast MM/S ALWAYS
  LMOVE zs.home
  BREAK
  IF .cnt > 1 THEN
    .sr = .sum/.cnt
    TYPE "udanych pomiarow: ",/F3.0,.cnt," z ",/F3.0,zs.n
    TYPE "srednia [mm]: ",/F9.3,.sr
    TYPE "rozrzut max-min [mm]: ",/F9.3,.zmax-.zmin
    TYPE "odchylenie std [mm]: ",/F9.3,SQRT(.sq/.cnt-.sr*.sr)
  END
.END
