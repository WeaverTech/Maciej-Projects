#!/usr/bin/env python3
"""Audyt kalendarza PDF: czy siatki pokazują dokładnie to, co jest w planie.

`plan.py sprawdz` pilnuje odczytu HTML-a (każda kolorowa komórka = odczytany slot),
`plan.py godziny` pilnuje form zajęć. Ten skrypt idzie o krok dalej i sprawdza
gotowe strony kalendarza:

  1. każdy termin z planu własnych podgrup trafia na siatkę albo na spis wyjątków,
  2. żadna kratka nie obiecuje zajęć w tygodniu, w którym ich nie ma,
  3. nic nie ginie po scaleniu wpisów (suma godzin się zgadza).

    python sprawdz_kalendarz.py
"""
from __future__ import annotations

import argparse
import collections

import kalendarz_pdf as K
from planpk.model import DAY_NAMES, minutes_of


def covers(entry, block, day):
    return (entry["day"] == block.day
            and entry["code"] == block.code
            and entry["form"] == block.form
            and entry["groups"] == K.normalize_groups(block.groups)
            and minutes_of(entry["start"]) <= minutes_of(block.start)
            and minutes_of(entry["end"]) >= minutes_of(block.end)
            and day in entry["dates"])


def audit(group, subgroups):
    data = K.prepare(group, subgroups)
    blocks, last_day_of = data["blocks"], data["last_day_of"]
    problems = []

    grids = {parity: visible for parity, _, _, visible in K.pages(data)}

    # 0. Siatka rysuje tylko dni pon-pt i godziny 7.30-21.15; nic nie może wypaść poza.
    for block in blocks:
        if block.day not in K.DAYS:
            problems.append(f"dzień poza siatką: {block.day} {block.start} {block.code}")
        if (minutes_of(block.start) < K.DAY_START
                or minutes_of(block.end) > K.DAY_END):
            problems.append(f"godzina poza siatką: {block.day} {block.start}-"
                            f"{block.end} {block.code}")

    # 1. Każde zajęcia z planu podgrup muszą być widoczne na siatce.
    checked = 0
    for block in blocks:
        for day in block.dates:
            if day == last_day_of.get(block.day):
                continue  # ostatni tydzień ma własny spis, sprawdzany niżej
            parity = K.parity_of(day)
            checked += 1
            if not any(covers(e, block, day) for e in grids[parity]):
                problems.append(
                    f"brak na siatce {parity}: {block.day} {block.start}-"
                    f"{block.end} {block.code} {block.form} {block.groups} ({day})")

    # 2. Kratka rysowana na stronie tygodnia A/B sugeruje, że zajęcia są w każdym
    #    takim tygodniu. Jeśli tak nie jest, musi mieć wypisane daty.
    teaching = collections.defaultdict(set)
    for entry in data["main"]:
        teaching[entry["day"]].update(entry["dates"])
    for parity, visible in grids.items():
        for entry in visible:
            same = {d for d in teaching[entry["day"]] if K.parity_of(d) == parity}
            missing = same - set(entry["dates"])
            says_when = any(K.short_date(d) in entry["note"] for d in entry["dates"])
            if missing and not says_when:
                problems.append(
                    f"kratka bez adnotacji o terminach {parity}: {entry['day']} "
                    f"{entry['start']} {entry['code']} (napis „{entry['note']}”) — "
                    "nie ma zajęć "
                    + ", ".join(K.short_date(d) for d in sorted(missing)))

    # 3. Ostatni tydzień: każdy termin musi być w spisie na ostatniej stronie.
    for block in blocks:
        day = last_day_of.get(block.day)
        if day not in block.dates:
            continue
        needle = f"{block.start}-{block.end}"
        if not any(needle in line and block.room in line
                   and DAY_NAMES[block.day].lower() in line
                   for line in data["squeezed_lines"]):
            problems.append(f"brak w spisie ostatniego tygodnia: {block.day} "
                            f"{block.start}-{block.end} {block.code}")

    # 4. Każdy skrócony termin, obcy wpis i e-learning musi być opisany na stronie wyjątków.
    for entry in data["main"]:
        for day, (label, _) in entry["shortened"].items():
            if not any(K.format_date(day) in line and label in line
                       and K.SHORT.get(entry["subject"], entry["subject"]) in line
                       for line in data["shortened_lines"]):
                problems.append(f"skrócony termin poza spisem: {entry['code']} "
                                f"{entry['day']} {entry['start']} ({day})")
        if entry["foreign"] and not any(entry["room"] in line
                                        for line in data["foreign_lines"]):
            problems.append(f"obcy wpis poza spisem: {entry['code']} {entry['day']}")
    for block in data["online"]:
        if not any(K.SHORT.get(block.subject, block.subject) in line
                   and K.format_date(block.dates[0]) in line
                   for line in data["online_lines"]):
            problems.append(f"e-learning poza spisem: {block.code} {block.day}")

    # 5. Scalanie wpisów nie może gubić godzin: nadwyżka siatki musi się dokładnie
    #    tłumaczyć skróconymi terminami wypisanymi na stronie wyjątków.
    def slots(start, end, count=1):
        return (minutes_of(end) - minutes_of(start)) // 45 * count

    source = sum(slots(b.start, b.end, len(b.dates)) for b in blocks)
    shown = sum(slots(e["start"], e["end"], len(e["dates"])) for e in data["main"])
    shown += sum(slots(e["start"], e["end"]) for e in data["finale"])
    documented = 0
    for entry in data["main"]:
        full = minutes_of(entry["end"]) - minutes_of(entry["start"])
        for _, covered in entry["shortened"].values():
            documented += (full - covered) // 45
    if source != shown - documented:
        problems.append(f"suma godzin lekcyjnych: źródło {source}, kalendarz {shown} "
                        f"(w tym {documented} opisanych skróceń)")
    print(f"godziny lekcyjne: źródło {source}, siatka {shown}, "
          f"z czego {documented} opisanych skróceń")

    print(f"sprawdzono {checked} wystąpień zajęć na {len(grids)} siatkach")
    for line in problems:
        print("  ✗", line)
    print(f"problemów: {len(problems)}")
    return problems


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--grupa", default="13M5")
    ap.add_argument("--podgrupy", nargs="*", default=K.MY_SUBGROUPS)
    args = ap.parse_args()
    raise SystemExit(1 if audit(args.grupa, args.podgrupy) else 0)


if __name__ == "__main__":
    main()
