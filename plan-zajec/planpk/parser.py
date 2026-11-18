"""Parser stron planu zajec Plansoft (podzial.mech.pk.edu.pl).

Strona grupy to jedna wielka tabela HTML:
  * wiersz naglowkowy dnia zawiera daty kolejnych tygodni semestru,
  * kazdy kolejny wiersz to jeden 45-minutowy slot (np. 9.15-10.00),
  * komorka zajec ma atrybut BGCOLOR i rowspan rowny liczbie zajmowanych slotow,
  * dwie ostatnie kolumny to legenda: kod przedmiotu / skrot prowadzacego -> pelna nazwa.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup

DAYS = ["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."]

# etykieta podgrupy w komorce, np. "13M GL04", "13M GK/P03", "13M5 SL02"
SUBGROUP_RE = re.compile(r"\b(?:G[A-Z]/?[A-Z]?\d{2}|S[A-Z]/?[A-Z]?\d{2})\b")
GROUP_RE = re.compile(r"^\d{2}[A-ZĄĆĘŁŃÓŚŹŻ]\d?(?:\s|;|$)")
# kod przedmiotu bywa pisany mieszana wielkoscia liter i z interpunkcja,
# np. BEPRIERB, MDiUr, ZaMoB, ZTII(
CODE_RE = re.compile(r"^\S{2,}$")
HOUR_RE = re.compile(r"^\d{1,2}\.\d{2}-\d{1,2}\.\d{2}$")
WEEK_RE = re.compile(r"^\d{2} [IVX]+$")


@dataclass
class Slot:
    """Pojedynczy 45-minutowy slot zajec w konkretnym tygodniu."""

    code: str
    kind: str
    lecturers: list[str]
    rooms: list[str]
    groups: list[str]
    day: str
    hour: str
    week: str
    column: int


@dataclass
class Page:
    name: str
    slots: list[Slot] = field(default_factory=list)
    legend: dict[str, str] = field(default_factory=dict)


def _build_grid(table):
    """Rozwija tabele z rowspan/colspan w siatke (row, col) -> (komorka, czy_poczatek)."""
    rows = table.find_all("tr", recursive=False)
    grid: dict[tuple[int, int], tuple[object, bool]] = {}
    for r, tr in enumerate(rows):
        c = 0
        for td in tr.find_all(["td", "th"], recursive=False):
            while (r, c) in grid:
                c += 1
            rowspan = _int_attr(td, "rowspan")
            colspan = _int_attr(td, "colspan")
            for dr in range(rowspan):
                for dc in range(colspan):
                    grid[(r + dr, c + dc)] = (td, dr == 0 and dc == 0)
            c += colspan
    return grid, len(rows)


def _int_attr(td, name, default=1):
    try:
        return int(td.get(name, default))
    except (TypeError, ValueError):
        return default


def _text(td):
    return td.get_text("\n", strip=True).replace("\xa0", " ").strip()


NAME_RE = re.compile(r"[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ\.\-]* "
                     r"[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ\.\- ]*")


def _is_person(text):
    """Nazwisko i imie wielkimi literami; komorka moze zawierac kilka osob po srednikach."""
    if any(ch.isdigit() for ch in text):
        return False
    return all(NAME_RE.fullmatch(part.strip()) for part in text.split(";") if part.strip())


def _parse_class_cell(td):
    """Rozbija tresc komorki zajec na kod, forme, prowadzacych, sale i grupy."""
    parts = [p.replace("\xa0", " ").strip() for p in td.stripped_strings]
    parts = [p for p in parts if p]
    if not parts or not CODE_RE.match(parts[0]):
        return None

    code, kind, rest = parts[0], (parts[1] if len(parts) > 1 else ""), parts[2:]
    lecturers, rooms, groups = [], [], []
    for part in rest:
        if GROUP_RE.match(part) or SUBGROUP_RE.search(part):
            groups.append(part)
        elif _is_person(part):
            lecturers.extend(p.strip() for p in part.split(";") if p.strip())
        else:
            rooms.append(part)
    return code, kind, lecturers, rooms, groups


def parse_page(path):
    html = open(path, encoding="utf-8", errors="replace").read()
    soup = BeautifulSoup(html, "lxml")
    # naglowek to <B><Center>13M5</B></Center> - parsery HTML gubia tu tresc,
    # wiec bierzemy ja wprost z tekstu strony
    header = re.search(r"<B><Center>([^<]+)</B>", html, re.I)
    page = Page(name=header.group(1).strip() if header else Path(path).stem)

    table = soup.find("table")
    if table is None:
        return page
    grid, nrows = _build_grid(table)
    ncols = max(c for _, c in grid) + 1

    day = None
    hour = None
    week_columns: dict[int, str] = {}
    cache: dict[int, object] = {}

    for r in range(nrows):
        starts = [(c, grid[(r, c)][0]) for c in range(ncols)
                  if (r, c) in grid and grid[(r, c)][1]]

        for _, td in starts:
            text = _text(td)
            if text in DAYS:
                day = text
                week_columns = {}
            elif HOUR_RE.match(text):
                hour = text

        dates = [(c, _text(td)) for c, td in starts if WEEK_RE.match(_text(td))]
        if len(dates) >= 3:
            week_columns = dict(dates)

        for _, td in starts:
            if td.has_attr("mergewith") and _text(td):
                full = BeautifulSoup(re.sub(r"\d+$", "", td["mergewith"]), "lxml")
                full = full.get_text(" ", strip=True)
                if full:
                    page.legend[_text(td)] = full

        for c in range(ncols):
            if (r, c) not in grid:
                continue
            td, _ = grid[(r, c)]
            # puste bgcolor maja komorki informacyjne (np. "Brak zajęć")
            if not td.get("bgcolor") or day is None or hour is None:
                continue
            if id(td) not in cache:
                cache[id(td)] = _parse_class_cell(td)
            parsed = cache[id(td)]
            if parsed is None:
                continue
            code, kind, lecturers, rooms, groups = parsed
            page.slots.append(Slot(code=code, kind=kind, lecturers=lecturers,
                                   rooms=rooms, groups=groups, day=day, hour=hour,
                                   week=week_columns.get(c, ""), column=c))
    return page
