# -*- coding: utf-8 -*-
import math, statistics as st
import data as D

def phi(u):
    """Funkcja Laplace'a Phi(u) = P(0<Z<u) = 0.5*erf(u/sqrt2)."""
    return 0.5 * math.erf(u / math.sqrt(2))

# ---------- L2: statystyki opisowe ----------
def series_stats(xs):
    n = len(xs)
    mean = sum(xs) / n
    sxs = sorted(xs)
    med = sxs[(n - 1) // 2] if n % 2 else (sxs[n//2-1]+sxs[n//2])/2
    R = max(xs) - min(xs)
    var = sum((x - mean) ** 2 for x in xs) / (n - 1)
    s = math.sqrt(var)
    return dict(n=n, mean=mean, median=med, R=R, var=var, s=s)

# ---------- L2: test chi2 (8 przedzialow, multiplikatory 1.15/0.75/0.3) ----------
MULT = [1.15, 0.75, 0.30]
def chi2_test(xs):
    s = series_stats(xs); n=s['n']; xb=s['mean']; sd=s['s']
    ks = [-1e9, -MULT[0], -MULT[1], -MULT[2], 0.0, MULT[2], MULT[1], MULT[0], 1e9]
    bounds = [xb + k*sd if abs(k)<1e8 else (math.inf if k>0 else -math.inf) for k in ks]
    rows=[]; chi=0.0
    for i in range(8):
        lo, hi = bounds[i], bounds[i+1]
        mi = sum(1 for x in xs if (lo <= x < hi) or (i==7 and x==hi))
        u_lo = -math.inf if i==0 else ks[i]
        u_hi =  math.inf if i==7 else ks[i+1]
        Plo = -0.5 if u_lo==-math.inf else phi(u_lo)
        Phi_ = 0.5 if u_hi==math.inf else phi(u_hi)
        Pi = Phi_ - Plo
        nPi = n*Pi
        comp = (mi - nPi)**2 / nPi
        chi += comp
        rows.append(dict(i=i+1, mi=mi, Pi=Pi, nPi=nPi, comp=comp, lo=lo, hi=hi))
    return chi, rows, s

def f_test(s1, s2):
    v1, v2 = s1['var'], s2['var']
    F = max(v1, v2)/min(v1, v2)
    return F

def t_test(s1, s2):
    num = s1['mean'] - s2['mean']
    den = math.sqrt(s1['var']/s1['n'] + s2['var']/s2['n'])
    return num/den

# ---------- L8: karta x-R, Cp, Cpk ----------
def l8_stats(samples):
    rows=[]
    for smp in samples:
        m=sum(smp)/len(smp); mx=max(smp); mn=min(smp); R=mx-mn
        rows.append(dict(mean=m, mx=mx, mn=mn, R=R))
    xbb=sum(r['mean'] for r in rows)/len(rows)   # x bar bar
    Rb=sum(r['R'] for r in rows)/len(rows)        # R bar
    UCLx=xbb + D.A2*Rb; LCLx=xbb - D.A2*Rb
    UCLr=D.D4*Rb; LCLr=D.D3*Rb
    Sproc=Rb/D.D2
    T=D.GWG-D.DWG
    Cp=T/(6*Sproc)
    Cpk=min((D.GWG-xbb), (xbb-D.DWG))/(3*Sproc)
    return dict(rows=rows, xbb=xbb, Rb=Rb, UCLx=UCLx, LCLx=LCLx, UCLr=UCLr,
                LCLr=LCLr, Sproc=Sproc, Cp=Cp, Cpk=Cpk)

if __name__ == "__main__":
    print("==== WALIDACJA NA DANYCH ORYGINALNYCH (grupa 2) ====")
    L=l8_stats(D.L8_ORIG)
    print(f"L8: x== {L['xbb']:.3f} (oczek. 16,632)  R-= {L['Rb']:.3f} (0,131)")
    print(f"    UCLx {L['UCLx']:.4f} (16,7076)  LCLx {L['LCLx']:.4f} (16,5564)")
    print(f"    UCLr {L['UCLr']:.4f} (0,2769)   Sproc {L['Sproc']:.5f}")
    print(f"    Cp {L['Cp']:.3f} (0,888)  Cpk {L['Cpk']:.3f} (0,485)")
    for tag,xs,exp in [("S1",D.L2_S1_ORIG,"m16,642 me16,639 R0,137 s2 0,0011 s0,033"),
                       ("S2",D.L2_S2_ORIG,"m16,639 me16,639 R0,178 s2 0,0017 s0,041")]:
        s=series_stats(xs)
        print(f"L2 {tag}: mean {s['mean']:.3f} med {s['median']:.3f} R {s['R']:.3f} "
              f"s2 {s['var']:.4f} s {s['s']:.3f}   [{exp}]")
    s1=series_stats(D.L2_S1_ORIG); s2=series_stats(D.L2_S2_ORIG)
    print(f"F = {f_test(s1,s2):.3f} (0,~1,55-1,58)   t = {t_test(s1,s2):.4f} (0,451)")
    c1,_,_=chi2_test(D.L2_S1_ORIG); c2,_,_=chi2_test(D.L2_S2_ORIG)
    print(f"chi2 S1 = {c1:.2f} (1,51)   chi2 S2 = {c2:.2f} (4,57)")
