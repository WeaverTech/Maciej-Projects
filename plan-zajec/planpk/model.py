"""Skladanie 45-minutowych slotow w czytelne bloki zajec."""
from __future__ import annotations

import collections
import re
from dataclasses import dataclass
from datetime import date, timedelta

from .parser import SUBGROUP_RE, parse_page

DAY_ORDER = ["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."]
DAY_NAMES = {
    "pon.": "Poniedziałek", "wt.": "Wtorek", "śr.": "Środa", "czw.": "Czwartek",
    "pt.": "Piątek", "sob.": "Sobota", "niedz.": "Niedziela",
}
FORM_NAMES = {
    "W": "wykład", "C": "ćwiczenia", "L": "laboratorium", "P": "projekt",
    "S": "seminarium", "E": "egzamin", "K": "konwersatorium", "F": "lektorat",
    "e-l": "e-learning",
}
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6,
         "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12}
MONTHS_PL = {1: "stycznia", 2: "lutego", 3: "marca", 4: "kwietnia", 5: "maja",
             6: "czerwca", 7: "lipca", 8: "sierpnia", 9: "września",
             10: "października", 11: "listopada", 12: "grudnia"}


@dataclass
class Block:
    """Zajecia w danym dniu i przedziale godzin, z lista konkretnych terminow."""

    day: str
    start: str
    end: str
    minutes: int
    code: str
    subject: str
    form: str
    lecturer: str
    room: str
    groups: str
    subgroups: tuple[str, ...]
    dates: list[date]
    rhythm: str = ""

    @property
    def form_name(self):
        return FORM_NAMES.get(self.form, self.form or "?")

    @property
    def time(self):
        return f"{self.start}-{self.end}"

    def occurrences(self):
        return len(self.dates)


def minutes_of(label):
    hh, mm = label.split(".")
    return int(hh) * 60 + int(mm)


def slot_bounds(hour):
    start, end = hour.split("-")
    return minutes_of(start), minutes_of(end)


def week_to_date(week, first_year):
    """'05 X' -> date(2026, 10, 5); styczen i luty naleza do kolejnego roku."""
    day, month = week.split()
    m = ROMAN[month]
    year = first_year if m >= 9 else first_year + 1
    return date(year, m, int(day))


def format_date(d):
    return f"{d.day} {MONTHS_PL[d.month]}"


def describe_dates(dates, all_day_dates):
    """Rytm liczony w tygodniach zajęciowych, a nie w dniach.

    Semestr ma przerwy (święta, dni rektorskie), więc dwa spotkania oddalone
    o 28 dni potrafią być zwykłym rytmem co dwa tygodnie.
    """
    dates = sorted(dates)
    if len(dates) == 1:
        return f"jednorazowo {format_date(dates[0])}"

    span = f"{format_date(dates[0])} – {format_date(dates[-1])}"
    teaching = set(all_day_dates)
    covers_all = dates[0] == all_day_dates[0] and dates[-1] == all_day_dates[-1]

    if _regular_every(dates, 7, teaching):
        return (f"co tydzień ({len(dates)} spotkań)" if covers_all
                else f"co tydzień, {span} ({len(dates)} spotkań)")
    if _regular_every(dates, 14, teaching):
        return f"co 2 tygodnie, {span} ({len(dates)} spotkań)"
    return f"terminy ({len(dates)}): " + ", ".join(format_date(d) for d in dates)


def _regular_every(dates, step_days, teaching):
    """Czy terminy idą co N dni, licząc tylko tygodnie, w których w ogóle są zajęcia."""
    for earlier, later in zip(dates, dates[1:]):
        gap = (later - earlier).days
        if gap % step_days:
            return False
        skipped = [earlier + timedelta(days=step_days * k)
                   for k in range(1, gap // step_days)]
        if any(d in teaching for d in skipped):
            return False
    return True


def normalize_groups(groups):
    cleaned = []
    for g in groups:
        g = re.sub(r"\s+", " ", g).strip().strip(";")
        if g:
            cleaned.append(g)
    return "; ".join(dict.fromkeys(cleaned))


def subgroups_of(groups):
    found = []
    for g in groups:
        found.extend(SUBGROUP_RE.findall(g))
    return tuple(dict.fromkeys(found))


def _family(subgroup):
    """'GL04' -> 'GL', 'GK/P03' -> 'GK/P'."""
    return re.sub(r"\d+$", "", subgroup.upper())


def subject_name(code, legend):
    if code in legend:
        return legend[code]
    for key, value in legend.items():
        if "\n" not in key and key.startswith(code):
            return value
    return code


def teachers_legend(legend):
    """Skrot prowadzacego -> lista (nazwisko z tytulem, forma, liczba godzin)."""
    out = collections.defaultdict(list)
    for key, value in legend.items():
        if "\n" not in key:
            continue
        short, tail = key.split("\n", 1)
        parts = tail.split()
        form = parts[0] if parts else ""
        hours = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
        out[short].append((value, form, hours))
    return dict(out)


class GroupPlan:
    def __init__(self, path, first_year=2026):
        page = parse_page(path)
        self.name = page.name
        self.legend = page.legend
        self.teachers = teachers_legend(page.legend)
        self.blocks = _blocks_from_slots(page, first_year)
        self.days = [d for d in DAY_ORDER if any(b.day == d for b in self.blocks)]

    def for_day(self, day):
        return [b for b in self.blocks if b.day == day]

    def all_subgroups(self):
        found = []
        for b in self.blocks:
            found.extend(b.subgroups)
        return sorted(set(found))

    def filtered(self, keep):
        """Zajecia wspolne dla calej grupy + wybrane podgrupy.

        Rodziny podgrup (GL, GK/P, SL, SP...) sa filtrowane niezaleznie: jesli dla
        danej rodziny nic nie podano, jej zajecia zostaja w planie w komplecie.
        """
        keep = {k.upper() for k in keep}
        families = {_family(k) for k in keep}
        result = []
        for b in self.blocks:
            relevant = [s for s in b.subgroups if _family(s) in families]
            if not relevant or keep.intersection(relevant):
                result.append(b)
        return result

    def subjects(self):
        """Kod -> {nazwa, formy, prowadzacy, liczba spotkan, minuty}."""
        out = {}
        for b in self.blocks:
            entry = out.setdefault(b.code, {
                "name": b.subject, "forms": collections.Counter(),
                "lecturers": set(), "minutes": 0, "meetings": 0,
            })
            entry["forms"][b.form] += b.occurrences()
            entry["minutes"] += b.minutes * b.occurrences()
            entry["meetings"] += b.occurrences()
            if b.lecturer:
                entry["lecturers"].add(b.lecturer)
        return dict(sorted(out.items(), key=lambda kv: kv[1]["name"].lower()))


def _blocks_from_slots(page, first_year):
    hours = sorted({s.hour for s in page.slots}, key=lambda h: slot_bounds(h)[0])
    index = {h: i for i, h in enumerate(hours)}

    day_dates = collections.defaultdict(set)
    occupied = collections.defaultdict(set)
    for s in page.slots:
        if not s.week:
            continue
        when = week_to_date(s.week, first_year)
        day_dates[s.day].add(when)
        key = (s.code, s.kind, " / ".join(s.lecturers), " ".join(s.rooms),
               normalize_groups(s.groups), subgroups_of(s.groups))
        occupied[(s.day, key, when)].add(index[s.hour])

    merged = collections.defaultdict(list)
    for (day, key, when), slots in occupied.items():
        run = []
        for i in sorted(slots):
            if run and i != run[-1] + 1:
                merged[(day, key, (run[0], run[-1]))].append(when)
                run = []
            run.append(i)
        merged[(day, key, (run[0], run[-1]))].append(when)

    blocks = []
    for (day, key, span), dates in merged.items():
        code, form, lecturer, room, groups, subgroups = key
        start = hours[span[0]].split("-")[0]
        end = hours[span[1]].split("-")[1]
        blocks.append(Block(
            day=day, start=start, end=end,
            minutes=slot_bounds(hours[span[1]])[1] - slot_bounds(hours[span[0]])[0],
            code=code, subject=subject_name(code, page.legend), form=form,
            lecturer=lecturer, room=room, groups=groups, subgroups=subgroups,
            dates=sorted(dates),
        ))
    blocks.sort(key=lambda b: (DAY_ORDER.index(b.day), minutes_of(b.start), b.groups))
    for b in blocks:
        b.rhythm = describe_dates(b.dates, sorted(day_dates[b.day]))
    return blocks
