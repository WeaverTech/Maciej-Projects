"""Parser stron planu zajec Plansoft (podzial.mech.pk.edu.pl).

Strona grupy to jedna wielka tabela HTML:
  * wiersz naglowkowy dnia zawiera daty kolejnych tygodni semestru,
  * kazdy kolejny wiersz to jeden 45-minutowy slot (np. 9.15-10.00),
    ostatni wiersz dnia jest podpisany "e-learning" i nie ma godzin,
  * komorka zajec ma atrybut BGCOLOR i rowspan rowny liczbie zajmowanych slotow,
  * gdy w jednym slocie sa zajecia rownolegle (np. laboratorium GL02 i GL03),
    komorka tygodnia zawiera zagniezdzona tabelke z kilkoma komorkami zajec,
  * dwie ostatnie kolumny to legenda: naprzemiennie wiersz przedmiotu
    (kod -> pelna nazwa) i wiersze prowadzacych (skrot, forma, liczba godzin).

Komorka zajec nie podaje formy zajec - trzeba ja wziac z legendy przedmiotu.
"""
from __future__ import annotations

import collections
import itertools
import re
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup

DAYS = ["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."]
ELEARNING = "e-learning"

# etykieta podgrupy w komorce, np. "13M GL04", "13M GK/P03", "13M5 SL02"
SUBGROUP_RE = re.compile(r"\b(?:G[A-ZĄĆĘŁŃÓŚŹŻ]/?[A-ZĄĆĘŁŃÓŚŹŻ]?\d{2}"
                         r"|S[A-ZĄĆĘŁŃÓŚŹŻ]/?[A-ZĄĆĘŁŃÓŚŹŻ]?\d{2})\b")
GROUP_RE = re.compile(r"^\d{2}[A-ZĄĆĘŁŃÓŚŹŻ]\d?(?:\s|;|$)")
# kod przedmiotu bywa pisany mieszana wielkoscia liter i z interpunkcja,
# np. BEPRIERB, MDiUr, ZaMoB, ZTII(
CODE_RE = re.compile(r"^\S{2,}$")
HOUR_RE = re.compile(r"^\d{1,2}\.\d{2}-\d{1,2}\.\d{2}$")
WEEK_RE = re.compile(r"^\d{2} [IVX]+$")
# wiersz legendy z prowadzacym: "ZiDa\nL 45", czasem bez skrotu: "W 26"
STAFF_RE = re.compile(rf"^(?:(\S+)\n)?(W|C|L|P|K|S|E|F|{ELEARNING})\s+(\d+)$")
# sala jest podana razem z budynkiem: "A535 A", "E07.C3 E"
BUILDING_RE = re.compile(r"\s+[A-ZĄĆĘŁŃÓŚŹŻ]$")


@dataclass
class Staff:
    """Wiersz legendy: prowadzacy z forma zajec i liczba godzin w semestrze."""

    short: str
    name: str
    form: str
    hours: int


@dataclass
class Course:
    """Przedmiot z legendy: kod, pelna nazwa i prowadzacy."""

    code: str
    name: str
    staff: list[Staff] = field(default_factory=list)

    def forms_of(self, lecturer):
        """Formy, w jakich dana osoba prowadzi ten przedmiot (kolejnosc z legendy)."""
        wanted = _plain_name(lecturer)
        found = [s.form for s in self.staff if _plain_name(s.name) == wanted]
        return list(dict.fromkeys(found))

    def all_forms(self):
        return list(dict.fromkeys(s.form for s in self.staff))

    def title_of(self, lecturer):
        """Nazwisko z tytulem naukowym, np. 'dr inz. Stawiarski Adam'."""
        wanted = _plain_name(lecturer)
        for s in self.staff:
            if _plain_name(s.name) == wanted:
                return s.name
        return ""


@dataclass
class Slot:
    """Pojedynczy 45-minutowy slot zajec w konkretnym tygodniu."""

    code: str
    form: str
    lecturers: list[str]
    rooms: list[str]
    groups: list[str]
    day: str
    hour: str
    week: str
    column: int

    @property
    def elearning(self):
        return self.hour == ELEARNING


@dataclass
class Page:
    name: str
    slots: list[Slot] = field(default_factory=list)
    courses: list[Course] = field(default_factory=list)

    def course_of(self, code):
        for course in self.courses:
            if course.code.startswith(code):
                return course
        for course in self.courses:
            if course.code.upper().startswith(code.upper()):
                return course
        return None


def _plain_name(text):
    """'dr inz. Stawiarski Adam' i 'STAWIARSKI ADAM' -> ten sam klucz."""
    text = re.sub(r"\b(?:prof|dr|hab|mgr|inż|lic|st|wykł|sztuki|arch)\b\.?", " ", text,
                  flags=re.IGNORECASE)
    return re.sub(r"[^\wĄĆĘŁŃÓŚŹŻąćęłńóśźż]+", " ", text).strip().upper()


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


def timetable(soup):
    """Glowna tabela planu: ta, ktorej komorki zawieraja nazwy dni tygodnia."""
    for table in soup.find_all("table"):
        if any(_text(td) in DAYS for td in table.find_all("td")):
            return table
    return None


def class_cells(td):
    """Komorki zajec w danej kratce siatki.

    Zwykle kratka sama jest komorka zajec; przy zajeciach rownoleglych zawiera
    zagniezdzona tabelke z kilkoma komorkami.
    """
    if td.get("bgcolor"):
        return [td]
    return [inner for inner in td.find_all("td") if inner.get("bgcolor")]


NAME_RE = re.compile(r"[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ\.\-]* "
                     r"[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ\.\- ]*")


def _is_person(text):
    """Nazwisko i imie wielkimi literami; komorka moze zawierac kilka osob po srednikach."""
    if any(ch.isdigit() for ch in text):
        return False
    return all(NAME_RE.fullmatch(part.strip()) for part in text.split(";") if part.strip())


def _room(text):
    return BUILDING_RE.sub("", text).strip()


def _parse_class_cell(td):
    """Rozbija tresc komorki zajec na kod, prowadzacych, sale i grupy.

    Uklad komorki: kod przedmiotu, prowadzacy, grupa/podgrupa, sala z budynkiem.
    Prowadzacy albo sala moga byc pominiete (np. e-learning, wychowanie fizyczne).
    """
    parts = [p.replace("\xa0", " ").strip() for p in td.stripped_strings]
    parts = [p for p in parts if p]
    if not parts or not CODE_RE.match(parts[0]):
        return None

    code, rest = parts[0], parts[1:]
    lecturers, rooms, groups = [], [], []
    for part in rest:
        if GROUP_RE.match(part) or SUBGROUP_RE.search(part):
            groups.append(part)
        elif _is_person(part):
            lecturers.extend(p.strip() for p in part.split(";") if p.strip())
        else:
            rooms.append(_room(part))
    return code, lecturers, rooms, groups


def _resolve_form(course, lecturers, groups, elearning):
    """Forma zajec: legenda przedmiotu + podpowiedz z oznaczenia podgrupy.

    W komorce planu nie ma formy zajec. Legenda podaje, w jakich formach kazda
    osoba prowadzi dany przedmiot - jesli jest tylko jedna, sprawa jest zamknieta.
    Gdy ta sama osoba ma wyklad i cwiczenia praktyczne, rozstrzyga podgrupa:
    wpis z podgrupa to zajecia w podgrupie, wpis bez podgrupy - wyklad.
    Domysl bywa myllacy, gdy cala grupa ma i wyklad, i cwiczenia - poprawia go
    potem `_reconcile_forms` na podstawie liczby godzin z legendy.
    """
    if course is None:
        return ELEARNING if elearning else ""
    candidates = []
    for lecturer in lecturers:
        candidates += course.forms_of(lecturer)
    candidates = list(dict.fromkeys(candidates)) or course.all_forms()
    if not candidates:
        return ""
    if len(candidates) == 1:
        return candidates[0]
    if elearning and ELEARNING in candidates:
        return ELEARNING

    split = any(SUBGROUP_RE.search(g) for g in groups)
    preferred = [f for f in candidates if (f != "W") == split]
    return (preferred or candidates)[0]


MAX_UNITS = 12


def _unit_key(slot):
    """Zajecia tego samego przedmiotu, dnia, podgrupy i sali to jedna pozycja planu."""
    return (slot.day, tuple(slot.groups), tuple(slot.rooms), slot.elearning)


def _reconcile_forms(page):
    """Koryguje formy zajec tak, by zgadzaly sie z liczba godzin z legendy.

    Legenda podaje, ile 45-minutowych godzin kazda osoba ma w danej formie.
    Jesli rozpoznane formy daja inne sumy, szukamy takiego przypisania form do
    pozycji planu, ktore trafia w godziny z legendy i najmniej odbiega od
    pierwszego rozpoznania. Gdy takiego przypisania nie ma (strona grupy pokazuje
    tylko czesc podgrup rocznika, wiec godziny nie musza sie domykac), zostaje
    pierwsze rozpoznanie.
    """
    for course in page.courses:
        mine = [s for s in page.slots
                if len(s.lecturers) == 1 and page.course_of(s.code) is course]
        by_lecturer = collections.defaultdict(list)
        for slot in mine:
            by_lecturer[_plain_name(slot.lecturers[0])].append(slot)

        for lecturer, slots in by_lecturer.items():
            wanted = {s.form: s.hours for s in course.staff
                      if _plain_name(s.name) == lecturer}
            if len(wanted) < 2:
                continue
            units = collections.defaultdict(list)
            for slot in slots:
                units[_unit_key(slot)].append(slot)
            if len(units) > MAX_UNITS:
                continue
            best = _best_assignment(list(units.values()), wanted)
            if best is None:
                continue
            for group, form in zip(units.values(), best):
                for slot in group:
                    slot.form = form


def _best_assignment(units, wanted):
    """Przypisanie form do pozycji planu: trafia w godziny, zmienia jak najmniej."""
    forms = sorted(wanted)
    if sum(len(u) for u in units) != sum(wanted.values()):
        return None
    best = None
    for combination in itertools.product(forms, repeat=len(units)):
        totals = collections.Counter()
        for unit, form in zip(units, combination):
            totals[form] += len(unit)
        if any(totals[f] != h for f, h in wanted.items()):
            continue
        kept = sum(1 for unit, form in zip(units, combination) if unit[0].form == form)
        if best is None or kept > best[0]:
            best = (kept, combination)
    return best[1] if best else None


def _parse_legend(grid, nrows, ncols):
    """Legenda z prawej strony tabeli: wiersz przedmiotu, potem jego prowadzacy."""
    courses: list[Course] = []
    for r in range(nrows):
        for c in range(ncols):
            if (r, c) not in grid or not grid[(r, c)][1]:
                continue
            td = grid[(r, c)][0]
            if not td.has_attr("mergewith"):
                continue
            key = _text(td)
            if not key:
                continue
            paired = BeautifulSoup(re.sub(r"\d+$", "", td["mergewith"]), "lxml")
            paired = paired.get_text(" ", strip=True)
            match = STAFF_RE.match(key)
            if match and courses:
                short, form, hours = match.groups()
                courses[-1].staff.append(
                    Staff(short=short or "", name=paired, form=form, hours=int(hours)))
            elif paired:
                courses.append(Course(code=key, name=paired))
    return courses


def parse_page(path):
    html = open(path, encoding="utf-8", errors="replace").read()
    soup = BeautifulSoup(html, "lxml")
    header = soup.find("h2")
    page = Page(name=_text(header) if header else Path(path).stem)

    table = timetable(soup)
    if table is None:
        return page
    grid, nrows = _build_grid(table)
    ncols = max(c for _, c in grid) + 1
    page.courses = _parse_legend(grid, nrows, ncols)

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
            elif HOUR_RE.match(text) or text == ELEARNING:
                hour = text

        dates = [(c, _text(td)) for c, td in starts if WEEK_RE.match(_text(td))]
        if len(dates) >= 3:
            week_columns = dict(dates)

        for c in range(ncols):
            if (r, c) not in grid or day is None or hour is None:
                continue
            for td in class_cells(grid[(r, c)][0]):
                if id(td) not in cache:
                    cache[id(td)] = _parse_class_cell(td)
                parsed = cache[id(td)]
                if parsed is None:
                    continue
                code, lecturers, rooms, groups = parsed
                form = _resolve_form(page.course_of(code), lecturers, groups,
                                     hour == ELEARNING)
                page.slots.append(Slot(code=code, form=form, lecturers=lecturers,
                                       rooms=rooms, groups=groups, day=day, hour=hour,
                                       week=week_columns.get(c, ""), column=c))
    _reconcile_forms(page)
    return page
