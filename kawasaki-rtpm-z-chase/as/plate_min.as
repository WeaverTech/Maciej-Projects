.PROGRAM pl_init()
  pl.adapt = 1
  pl.ncyc = 12
  pl.h0 = 800
  pl.xpl = 900
  pl.zlift = 350
  pl.grip = 5
  pl.rz = 200
  pl.thru = 0
  pl.zcom = 500
  pl.nseg = 5
  pl.tol = 200
  pl.vfast = 1500
  pl.acc = 150
  pl.accp = 3
  pl.hoff = 0
  pl.dmin = 40
  pl.dmax = 1200
  pl.tau = 0.03
  pl.pdt = 0.01
  pl.alfa = 0.35
  pl.jump = 150
  pl.nrmax = 8
  pl.nmin = 6
  pl.fresh = 3.0
  pl.sdt = 0.01
  pl.noise = 2.0
  pl.quant = 1.0
  pl.nbuf = 3
  pl.thick = 20
  pl.tadd = 8
  pl.nadd = 5
  pl.wdt = 0.02
  pl.vslow = 40
  pl.vturn = 60
  pl.run = 0
  pl.d = 0
  pl.dsim = 0
  pl.ztop = 0
  pl.ztgt = 0
  pl.zpick = 0
  pl.zmod = 0
  pl.zmin = 0
  pl.n = 0
  pl.nrej = 0
  pl.ok = 0
  pl.gprev = 0
  pl.tlast = 0
  pl.hit = 0
  pl.hitf = 0
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
  pl.d = pl.dsim
.END

.PROGRAM pl_sim()
  .tadd = TIMER(0)
  WHILE pl.run == 1 DO
    TWAIT pl.sdt
    .t = TIMER(0)
    IF (.t-.tadd) >= pl.tadd THEN
      .tadd = .t
      pl.zstack = pl.zstack+pl.thick*pl.nadd
    END
    pl.zstack = MINVAL(pl.zstack,pl.zref-pl.zcom-150)
    pl.zstack = MAXVAL(pl.zstack,pl.zref-pl.dmax+100)
    .d = DZ(HERE)+pl.hoff-pl.zstack
    .d = .d+pl.noise*SIN(360*7.3*.t)*SIN(360*3.1*.t+40)
    IF pl.quant > 0 THEN
      .d = pl.quant*INT(.d/pl.quant+0.5)
    END
    pl.dsim = pl.buf[pl.bi]
    pl.buf[pl.bi] = .d
    pl.bi = pl.bi+1
    IF pl.bi > pl.nbuf THEN
      pl.bi = 1
    END
  END
.END

.PROGRAM pl_probe()
  pl.zprev = DZ(HERE)
  WHILE pl.run == 1 DO
    TWAIT pl.pdt
    CALL pl_read
    .znow = DZ(HERE)
    .vz = (.znow-pl.zprev)/pl.pdt
    pl.zprev = .znow
    .good = 1
    IF pl.d < pl.dmin THEN
      .good = 0
    END
    IF pl.d > pl.dmax THEN
      .good = 0
    END
    IF pl.d < pl.zcom THEN
      .good = 0
    END
    IF ABS(DX(HERE)-pl.xs) > pl.rz THEN
      .good = 0
    END
    IF ABS(DY(HERE)-pl.ys) > pl.rz THEN
      .good = 0
    END
    IF .good == 1 THEN
      IF pl.gprev == 0 THEN
        pl.n = 0
        pl.nrej = 0
        pl.ok = 0
      END
    END
    pl.gprev = .good
    IF .good == 1 THEN
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

.PROGRAM pl_watch()
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
        IF pl.vzprev < -pl.vturn THEN
          IF .vz > -pl.vturn THEN
            pl.hitf = 1
            pl.ztru = pl.zstack
            pl.zstack = pl.zstack-pl.thick
          END
        END
      END
    END
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
  CALL pl_init
  POINT pl.home = HERE
  pl.zref = DZ(pl.home)
  pl.xs = DX(pl.home)
  pl.ys = DY(pl.home)
  pl.zstack = pl.zref-pl.h0
  pl.zmod = pl.zstack+pl.thick*2
  pl.zmin = pl.zref-pl.dmax+50
  POINT pl.pplace = SHIFT(pl.home BY pl.xpl,0,0)
  POINT pl.plow = SHIFT(pl.home BY 0,0,pl.zmin-pl.zref)
  IF INRANGE(pl.pplace) <> 0 THEN
    TYPE "Punkt odkladania poza zakresem - zmniejsz pl.xpl."
    STOP
  END
  IF INRANGE(pl.plow) <> 0 THEN
    TYPE "Dolny kraniec zjazdu poza zakresem - podnies robota."
    STOP
  END
  ABS.SPEED ON
  SPEED pl.vfast MM/S ALWAYS
  ACCURACY pl.acc ALWAYS
  CP ON
  pl.run = 1
  PCEXECUTE 2: pl_sim,1
  PCEXECUTE 3: pl_probe,1
  PCEXECUTE 4: pl_watch,1
  TWAIT 0.5
  FOR .c = 1 TO pl.ncyc
    CALL pl_target
    .z0 = pl.ztgt+pl.zcom
    POINT pl.pc = SHIFT(pl.home BY -pl.thru,0,.z0-pl.zref)
    LMOVE pl.pc
    FOR .i = 1 TO pl.nseg
      CALL pl_target
      .f = .i/pl.nseg
      .z = .z0+(pl.zpick-.z0)*.f
      .x = -pl.thru*(1-.f)
      POINT pl.pd = SHIFT(pl.home BY .x,0,.z-pl.zref)
      IF .i == pl.nseg THEN
        pl.zused = pl.ztgt
        ACCURACY pl.accp
      END
      LMOVE pl.pd
    END
    POINT pl.pu = SHIFT(pl.home BY pl.thru,0,pl.zpick+pl.zlift-pl.zref)
    LMOVE pl.pu
    LMOVE pl.pplace
    LMOVE pl.home
  END
  BREAK
  pl.run = 0
  TWAIT 0.3
  PCABORT 2:
  PCABORT 3:
  PCABORT 4:
  CALL pl_report
.END

.PROGRAM pl_report()
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
  pl.run = 0
  PCABORT 2:
  PCABORT 3:
  PCABORT 4:
  TYPE "Zadania PC zatrzymane."
.END
