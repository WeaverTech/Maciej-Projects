#!/usr/bin/env python3
"""Plan zajęć WM PK w czytelnej formie.

Przykłady:
    python plan.py pobierz                       # pobiera wszystkie grupy do dane/
    python plan.py generuj                       # Markdown + ICS dla wszystkich grup
    python plan.py pokaz 13M5                    # wypisuje plan w konsoli
    python plan.py pokaz 13M5 --podgrupy GL04 GK/P03 SL02 SP01
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from planpk import eksport
from planpk.model import DAY_NAMES, GroupPlan
from planpk.pobieranie import DEFAULT_BASE, download

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "dane"
OUT = ROOT / "wygenerowane"


def _pages(names=None):
    if not DATA.exists():
        sys.exit(f"brak katalogu {DATA} – uruchom najpierw: python plan.py pobierz")
    files = sorted(DATA.glob("*.htm"))
    if names:
        wanted = {n.upper() for n in names}
        files = [f for f in files if f.stem.upper() in wanted]
    return files


def cmd_pobierz(args):
    files = download(base=args.base, out_dir=DATA, only=args.grupy or None)
    print(f"pobrano {len(files)} stron do {DATA}")


def cmd_generuj(args):
    plans = [GroupPlan(p, first_year=args.rok) for p in _pages(args.grupy)]
    (OUT / "grupy").mkdir(parents=True, exist_ok=True)
    if args.ics:
        (OUT / "kalendarze").mkdir(parents=True, exist_ok=True)
    for plan in plans:
        (OUT / "grupy" / f"{plan.name}.md").write_text(
            eksport.markdown(plan), encoding="utf-8")
        if args.ics:
            (OUT / "kalendarze" / f"{plan.name}.ics").write_text(
                eksport.ics(plan), encoding="utf-8")
    if not args.grupy:
        (OUT / "README.md").write_text(eksport.overview(plans), encoding="utf-8")
    print(f"zapisano {len(plans)} planów w {OUT}")


def cmd_sprawdz(args):
    """Kontrola kompletności: każda kolorowa komórka planu musi trafić do wyniku."""
    from bs4 import BeautifulSoup

    from planpk.parser import _build_grid, parse_page

    problems = 0
    files = _pages(args.grupy)
    for path in files:
        html = path.read_text(encoding="utf-8", errors="replace")
        grid, _ = _build_grid(BeautifulSoup(html, "lxml").find("table"))
        cells = sum(1 for cell, _ in grid.values() if cell.get("bgcolor"))
        parsed = len(parse_page(path).slots)
        if cells != parsed:
            problems += 1
            print(f"{path.stem}: komórek {cells}, odczytanych {parsed}")
    print(f"sprawdzono {len(files)} grup, niezgodności: {problems}")
    return 1 if problems else 0


def cmd_pokaz(args):
    files = _pages([args.grupa])
    if not files:
        sys.exit(f"nie znaleziono grupy {args.grupa} w {DATA}")
    plan = GroupPlan(files[0], first_year=args.rok)
    blocks = plan.filtered(args.podgrupy) if args.podgrupy else plan.blocks

    print(f"== {plan.name} ==  podgrupy w planie: "
          f"{', '.join(plan.all_subgroups()) or 'brak'}")
    for day in plan.days:
        day_blocks = [b for b in blocks if b.day == day]
        if not day_blocks:
            continue
        print(f"\n{DAY_NAMES[day].upper()}")
        for b in day_blocks:
            who = b.groups or "cała grupa"
            print(f"  {b.time:<12} {b.subject[:44]:<46} {b.form_name:<13} "
                  f"{who:<16} {b.room:<8} {b.lecturer.title():<24} {b.rhythm}")

    if args.md:
        suffix = f" ({', '.join(args.podgrupy)})" if args.podgrupy else ""
        Path(args.md).write_text(eksport.markdown(plan, blocks, suffix), encoding="utf-8")
        print(f"\nzapisano {args.md}")
    if args.ics:
        Path(args.ics).write_text(eksport.ics(plan, blocks, plan.name), encoding="utf-8")
        print(f"zapisano {args.ics}")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--rok", type=int, default=2026,
                    help="rok kalendarzowy początku semestru (domyślnie 2026)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("pobierz", help="pobiera strony planu")
    p.add_argument("grupy", nargs="*", help="np. 13M5 13M4 (domyślnie wszystkie)")
    p.add_argument("--base", default=DEFAULT_BASE)
    p.set_defaults(func=cmd_pobierz)

    p = sub.add_parser("generuj", help="Markdown (opcjonalnie ICS) dla grup")
    p.add_argument("grupy", nargs="*")
    p.add_argument("--ics", action="store_true", help="dodatkowo kalendarze ICS")
    p.set_defaults(func=cmd_generuj)

    p = sub.add_parser("sprawdz", help="kontrola kompletności odczytu")
    p.add_argument("grupy", nargs="*")
    p.set_defaults(func=cmd_sprawdz)

    p = sub.add_parser("pokaz", help="wypisuje plan grupy")
    p.add_argument("grupa")
    p.add_argument("--podgrupy", nargs="*", default=[],
                   help="np. GL04 GK/P03 SL02 SP01")
    p.add_argument("--md", help="zapisz Markdown do pliku")
    p.add_argument("--ics", help="zapisz kalendarz do pliku")
    p.set_defaults(func=cmd_pokaz)

    args = ap.parse_args()
    sys.exit(args.func(args) or 0)


if __name__ == "__main__":
    main()
