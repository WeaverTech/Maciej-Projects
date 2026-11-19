#!/usr/bin/env python3
"""Analiza logu z testu RTPM Z-chase (program AS zc_report).

Wejscie: tekst wklejony z terminala neoROSET/KRterm. Skrypt sam wycina
sekcje miedzy znacznikami "---- BEGIN CSV ----" i "---- END CSV ----",
wiec nie trzeba czyscic logu recznie.

Uzycie:
    python3 zc_analyze.py log.csv
    python3 zc_analyze.py log_rtpm.csv --freq 0.5 --plot
    python3 zc_analyze.py log_rtpm.csv --compare log_std.csv
"""

from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass

BEGIN = "BEGIN CSV"
END = "END CSV"


@dataclass
class Log:
    name: str
    t: list[float]
    tgt: list[float]
    act: list[float]
    dz: list[float]

    @property
    def err(self) -> list[float]:
        return [a - b for a, b in zip(self.tgt, self.act)]

    @property
    def dt(self) -> float:
        if len(self.t) < 2:
            return 0.0
        return (self.t[-1] - self.t[0]) / (len(self.t) - 1)


def read_log(path: str) -> Log:
    rows = []
    inside = False
    seen_marker = False
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        for raw in handle:
            line = raw.strip()
            if BEGIN in line:
                inside, seen_marker = True, True
                continue
            if END in line:
                inside = False
                continue
            if seen_marker and not inside:
                continue
            fields = [f.strip() for f in line.split(";")]
            if len(fields) < 4:
                continue
            try:
                rows.append([float(f) for f in fields[:4]])
            except ValueError:
                continue  # naglowek albo smieci z terminala

    if not rows:
        sys.exit(f"{path}: nie znalazlem zadnych probek")

    return Log(
        name=path,
        t=[r[0] for r in rows],
        tgt=[r[1] for r in rows],
        act=[r[2] for r in rows],
        dz=[r[3] for r in rows],
    )


def max_speed(t: list[float], v: list[float]) -> float:
    """Najwieksza chwilowa predkosc [mm/s], po lekkim wygladzeniu."""
    speeds = []
    for i in range(2, len(v)):
        dt = t[i] - t[i - 2]
        if dt > 1e-6:
            speeds.append(abs(v[i] - v[i - 2]) / dt)
    return max(speeds) if speeds else 0.0


def lag_by_correlation(log: Log, max_lag_s: float = 2.0) -> tuple[float, float]:
    """Opoznienie nadazania z korelacji wzajemnej celu i pozycji.

    Zwraca (opoznienie [s], wspolczynnik korelacji dla tego opoznienia).
    """
    n = len(log.t)
    dt = log.dt
    if n < 8 or dt <= 0:
        return 0.0, 0.0

    tgt_mean = sum(log.tgt) / n
    act_mean = sum(log.act) / n
    tgt = [x - tgt_mean for x in log.tgt]
    act = [x - act_mean for x in log.act]

    best_shift, best_corr = 0, -2.0
    for shift in range(0, int(max_lag_s / dt) + 1):
        a = tgt[: n - shift]
        b = act[shift:]
        num = sum(x * y for x, y in zip(a, b))
        den = math.sqrt(sum(x * x for x in a) * sum(y * y for y in b))
        if den <= 1e-9:
            continue
        corr = num / den
        if corr > best_corr:
            best_shift, best_corr = shift, corr
    return best_shift * dt, best_corr


def _solve3(m: list[list[float]], rhs: list[float]) -> list[float] | None:
    a = [row[:] + [rhs[i]] for i, row in enumerate(m)]
    for col in range(3):
        pivot = max(range(col, 3), key=lambda r: abs(a[r][col]))
        if abs(a[pivot][col]) < 1e-12:
            return None
        a[col], a[pivot] = a[pivot], a[col]
        for row in range(3):
            if row == col:
                continue
            factor = a[row][col] / a[col][col]
            for k in range(col, 4):
                a[row][k] -= factor * a[col][k]
    return [a[i][3] / a[i][i] for i in range(3)]


def fit_sine(t: list[float], v: list[float], freq: float) -> tuple[float, float] | None:
    """Dopasowuje A*sin(wt)+B*cos(wt)+C. Zwraca (amplituda, faza [deg])."""
    w = 2 * math.pi * freq
    basis = [[math.sin(w * x), math.cos(w * x), 1.0] for x in t]
    m = [[sum(b[i] * b[j] for b in basis) for j in range(3)] for i in range(3)]
    rhs = [sum(b[i] * y for b, y in zip(basis, v)) for i in range(3)]
    sol = _solve3(m, rhs)
    if sol is None:
        return None
    amp = math.hypot(sol[0], sol[1])
    phase = math.degrees(math.atan2(sol[1], sol[0]))
    return amp, phase


def report(log: Log, freq: float | None) -> None:
    err = [abs(e) for e in log.err]
    n = len(err)
    print(f"\n=== {log.name} ===")
    print(f"probek                : {n}")
    print(f"okres probkowania     : {log.dt * 1000:.1f} ms")
    print(f"czas testu            : {log.t[-1] - log.t[0]:.2f} s")
    print(f"uchyb max             : {max(err):.3f} mm")
    print(f"uchyb sredni          : {sum(err) / n:.3f} mm")
    print(f"uchyb RMS             : {math.sqrt(sum(e * e for e in err) / n):.3f} mm")
    print(f"zakres celu           : {min(log.tgt):.1f} .. {max(log.tgt):.1f} mm")
    print(f"zakres narzedzia      : {min(log.act):.1f} .. {max(log.act):.1f} mm")
    print(f"max predkosc celu     : {max_speed(log.t, log.tgt):.1f} mm/s")
    print(f"max predkosc korekty  : {max_speed(log.t, log.act):.1f} mm/s")
    print(f"max |dz| wystawione   : {max(abs(d) for d in log.dz):.3f} mm")

    lag, corr = lag_by_correlation(log)
    print(f"opoznienie (korelacja): {lag * 1000:.0f} ms (r = {corr:.3f})")

    if freq:
        fit_t = fit_sine(log.t, log.tgt, freq)
        fit_a = fit_sine(log.t, log.act, freq)
        if fit_t and fit_a and fit_t[0] > 1e-6:
            gain = fit_a[0] / fit_t[0]
            dphase = (fit_t[1] - fit_a[1] + 180) % 360 - 180
            print(f"wzmocnienie przy {freq} Hz: {gain:.3f} ({20 * math.log10(max(gain, 1e-9)):+.1f} dB)")
            print(f"przesuniecie fazy     : {dphase:.1f} deg = {dphase / 360 / freq * 1000:.0f} ms")


def plot(logs: list[Log]) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        sys.exit("brak matplotlib - zainstaluj (pip install matplotlib) albo pomin --plot")

    fig, axes = plt.subplots(2, 1, sharex=True, figsize=(11, 7))
    for log in logs:
        axes[0].plot(log.t, log.tgt, "--", label=f"cel ({log.name})")
        axes[0].plot(log.t, log.act, label=f"narzedzie ({log.name})")
        axes[1].plot(log.t, log.err, label=log.name)
    axes[0].set_ylabel("Z [mm]")
    axes[0].legend(fontsize=8)
    axes[0].grid(True, alpha=0.3)
    axes[1].set_ylabel("uchyb [mm]")
    axes[1].set_xlabel("czas [s]")
    axes[1].legend(fontsize=8)
    axes[1].grid(True, alpha=0.3)
    fig.suptitle("RTPM Z-chase: nadazanie za uciekajacym punktem")
    fig.tight_layout()
    plt.show()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("log", help="plik z logiem (wklejony zrzut z terminala)")
    parser.add_argument("--compare", help="drugi log do porownania, np. przebieg bez RTPM")
    parser.add_argument("--freq", type=float, help="czestotliwosc [Hz] dla trybu 1 (sinus)")
    parser.add_argument("--plot", action="store_true", help="wykres (wymaga matplotlib)")
    args = parser.parse_args()

    logs = [read_log(args.log)]
    if args.compare:
        logs.append(read_log(args.compare))

    for log in logs:
        report(log, args.freq)

    if len(logs) == 2:
        e1 = sum(abs(e) for e in logs[0].err) / len(logs[0].err)
        e2 = sum(abs(e) for e in logs[1].err) / len(logs[1].err)
        if e1 > 1e-9:
            print(f"\nsredni uchyb {logs[1].name} / {logs[0].name}: {e2 / e1:.2f}x")

    if args.plot:
        plot(logs)


if __name__ == "__main__":
    main()
