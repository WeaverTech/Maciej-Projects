#!/usr/bin/env python3
"""Kalendarz zajęć 13M5 jako PDF: siatka tydzień A / tydzień B dla każdej podgrupy GL.

    python kalendarz_pdf.py                 # wygenerowane/Plan_13M5_kalendarz.pdf
    python kalendarz_pdf.py --grupa 13M5 --gl GL02 GL03 GL04
"""
from __future__ import annotations

import argparse
import collections
from datetime import date, timedelta
from pathlib import Path

from reportlab.lib.colors import HexColor, black
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from planpk.model import (DAY_NAMES, GroupPlan, format_date, minutes_of)

ROOT = Path(__file__).resolve().parent

# wbudowana Helvetica nie ma polskich znaków
FONTS = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("Plan", FONTS / "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Plan-Bold", FONTS / "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("Plan", normal="Plan", bold="Plan-Bold")
REGULAR, BOLD = "Plan", "Plan-Bold"
# poniedziałek pierwszego tygodnia semestru; rytm co 2 tygodnie liczymy od tej daty
ANCHOR = date(2026, 9, 28)
ROMAN_MONTH = {9: "IX", 10: "X", 11: "XI", 12: "XII", 1: "I", 2: "II"}

DAYS = ["pon.", "wt.", "śr.", "czw.", "pt."]
DAY_START, DAY_END = 7 * 60 + 30, 21 * 60 + 15

SHORT = {
    "Programowanie obrabiarek CNC w systemach CAD/CAM": "Obrabiarki CNC (CAD/CAM)",
    "Systemy informatyczne do zarządzania i technicznego przygotowania produkcji":
        "Systemy inform. zarządzania i TPP",
    "Komputerowe wspomaganie badań eksperymentalnych": "Komput. wspomaganie badań",
    "Programowanie zaawansowanych systemów pomiarowych 3D": "Systemy pomiarowe 3D",
    "Maszyny drogowe i urządzenia transportowe": "Maszyny drog. i urz. transportowe",
    "GODZINA DLA PRZEMYSŁU": "Godzina dla przemysłu",
}
PALETTE = ["#BFD8F2", "#CDEBC5", "#F7D9A8", "#E6CDEA", "#F9C9C4", "#C6E8E4",
           "#EBE3AC", "#D8D2C4", "#C9D6F0", "#F2CFE1", "#CFE7B8", "#F0D6B8",
           "#D5E3F7", "#E3D5F7", "#F7E3D5"]
CHOICE_FAMILIES = ("GK/P", "SL", "SP")
FORM_LABEL = {"W": "wykład", "C": "ćwicz.", "L": "lab.", "P": "PROJEKT",
              "S": "sem.", "F": "lektorat", "K": "konwers."}

# Podgrupy projektowe 13M5 (SP01 = "P01", SP02 = "P02") przypisane do podgrup GL.
# To nie wynika z planu - plan podaje same numery podgrup - tylko z zapowiedzianego
# podziału: GL02 i połowa GL03 idzie na P01, druga połowa GL03 i GL04 na P02.
PROJECT_HALVES = {"GL02": ("SP01",), "GL03": ("SP01", "SP02"), "GL04": ("SP02",)}
HALF_NAME = {"SP01": "P01", "SP02": "P02"}


def week_index(day):
    return (day - ANCHOR).days // 7


def short_date(day):
    return f"{day.day} {ROMAN_MONTH[day.month]}"


def normalize_groups(groups):
    """'13B1; 13L; 13M' i '13B1; 13M; 13L' to ta sama lista odbiorców."""
    return "; ".join(sorted(part.strip() for part in groups.split(";") if part.strip()))


def merge_blocks(blocks):
    """Jedne zajęcia to jedna kratka.

    W źródle te same zajęcia bywają rozbite na kilka wpisów: bo w połowie semestru
    zmienia się prowadzący albo bo pojedynczy termin jest skrócony do 45 minut.
    Sklejamy wpisy o tym samym przedmiocie, formie i podgrupie, które w danym dniu
    zachodzą na siebie czasowo.
    """
    buckets = collections.defaultdict(list)
    for b in blocks:
        buckets[(b.day, b.code, b.form, normalize_groups(b.groups))].append(b)

    out = []
    for (day, code, form, groups), items in buckets.items():
        items.sort(key=lambda b: (minutes_of(b.start), minutes_of(b.end)))
        current = None
        for b in items:
            start, end = minutes_of(b.start), minutes_of(b.end)
            if current and start < current["end_min"]:
                current["end_min"] = max(current["end_min"], end)
                current["end"] = b.end if end > minutes_of(current["end"]) else current["end"]
                current["dates"] += b.dates
                current["rooms"].add(b.room)
                current["lecturers"] += [w for w in b.lecturer.split(" / ") if w]
                continue
            if current:
                out.append(current)
            current = {"day": day, "code": code, "form": form, "groups": groups,
                       "start": b.start, "end": b.end, "end_min": end,
                       "subject": b.subject, "subgroups": b.subgroups,
                       "rooms": {b.room}, "dates": list(b.dates),
                       "lecturers": [w for w in b.lecturer.split(" / ") if w]}
        if current:
            out.append(current)

    for entry in out:
        entry["dates"] = sorted(set(entry["dates"]))
        entry["lecturers"] = list(dict.fromkeys(entry["lecturers"]))
        entry["room"] = " / ".join(sorted(r for r in entry["rooms"] if r))
    return out


def classify(entry):
    """'A', 'B' albo 'AB' - w których tygodniach zajęcia się odbywają."""
    parities = {week_index(d) % 2 for d in entry["dates"]}
    if len(parities) == 2:
        return "AB"
    return "A" if parities == {0} else "B"


def is_regular(entry, parity, teaching_weeks):
    """Czy terminy idą równo, licząc tylko tygodnie, w których tego dnia są zajęcia.

    Semestr ma dziury (2 listopada, święta), więc odstęp 28 dni potrafi być
    zwykłym rytmem co dwa tygodnie.
    """
    available = [w for w in teaching_weeks[entry["day"]]
                 if parity == "AB" or w % 2 == week_index(entry["dates"][0]) % 2]
    position = {w: i for i, w in enumerate(available)}
    steps = {position[week_index(b)] - position[week_index(a)]
             for a, b in zip(entry["dates"], entry["dates"][1:])}
    return steps <= {1}


def choice_label(entry):
    for sub in entry["subgroups"]:
        if sub.startswith(CHOICE_FAMILIES):
            return sub
    return ""


def wrap(c, text, width, font, size):
    return simpleSplit(text, font, size, width)


def shows_in(entry, gl, halves):
    """Czy blok trafia na stronę danej podgrupy GL."""
    subs = entry["subgroups"]
    if not subs:
        return True
    project = [s for s in subs if s in HALF_NAME]
    if project:
        return bool(set(project) & set(halves))
    return gl in subs or any(s.startswith(CHOICE_FAMILIES) for s in subs)


def variant_note(entry, gl):
    """Dopisek w kratce - dla projektów mówi wprost, czyj to termin."""
    choice = entry["choice"]
    if entry["note"] != choice:  # nierówny rytm - w kratce ważniejsze są daty
        return entry["note"]
    if choice in HALF_NAME:
        half = HALF_NAME[choice]
        if gl == "GL03":
            return f"{choice} = {half}, połowa GL03"
        return f"{choice} = {half}, czyli {gl}"
    if choice.startswith("GK/P"):
        return f"{choice} albo drugi termin"
    return entry["note"]


class Calendar:
    def __init__(self, path, group, gl_variants):
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.w, self.h = A4
        self.group = group
        self.gl_variants = gl_variants
        self.colors = {}

    def color_for(self, code):
        if code not in self.colors:
            self.colors[code] = HexColor(PALETTE[len(self.colors) % len(PALETTE)])
        return self.colors[code]

    def save(self):
        self.c.save()

    # --- strony ---------------------------------------------------------

    def cover(self, weeks_a, weeks_b, choices, subjects):
        c = self.c
        c.setFont(BOLD, 22)
        c.drawString(40, self.h - 60, f"Plan zajęć {self.group}")
        c.setFont(REGULAR, 11)
        c.drawString(40, self.h - 80, "semestr zimowy 2026/2027, Wydział Mechaniczny PK")

        y = self.h - 115
        c.setFont(BOLD, 12)
        c.drawString(40, y, "Jak czytać")
        y -= 16
        c.setFont(REGULAR, 9.5)
        for line in [
            "Zajęcia idą w dwutygodniowym rytmie, dlatego każdy wariant ma dwie siatki:",
            "TYDZIEŃ A i TYDZIEŃ B. Wystarczy sprawdzić w spisie poniżej, którego typu",
            "jest bieżący tydzień, i patrzeć na odpowiednią stronę.",
            "",
            "Każda podgrupa laboratoryjna GL ma własną parę stron - wybierz swoją, kiedy",
            "już będziesz wiedział, w której jesteś. Reszta zajęć jest identyczna.",
            "",
            "Bloki obrysowane linią przerywaną to zajęcia do wyboru: chodzisz tylko na jeden",
            "termin z danej rodziny (SP i GK/P - projekt, SL - laboratorium). Projekty mają",
            "w kratce dopisek PROJEKT i osobną stronę ze wszystkimi terminami.",
            "Wykrzyknik przy nazwie oznacza, że terminy nie układają się w równy rytm",
            "i trzeba je sprawdzić w spisie na ostatniej stronie.",
        ]:
            c.drawString(40, y, line)
            y -= 13

        y -= 8
        c.setFont(BOLD, 12)
        c.drawString(40, y, "Które tygodnie są typu A, a które B")
        y -= 16
        c.setFont(BOLD, 9.5)
        c.drawString(40, y, "Tydzień A:")
        c.setFont(REGULAR, 9.5)
        y = self._date_list(weeks_a, 110, y)
        y -= 4
        c.setFont(BOLD, 9.5)
        c.drawString(40, y, "Tydzień B:")
        c.setFont(REGULAR, 9.5)
        y = self._date_list(weeks_b, 110, y)

        y -= 14
        c.setFont(BOLD, 12)
        c.drawString(40, y, "Zajęcia do wyboru")
        y -= 16
        c.setFont(REGULAR, 9.5)
        for family, options in choices.items():
            c.drawString(40, y, f"{family}:")
            for text in options:
                c.drawString(110, y, text)
                y -= 12
            y -= 3

        y -= 6
        c.setFont(BOLD, 12)
        c.drawString(40, y, "Przedmioty")
        y -= 15
        c.setFont(REGULAR, 8.5)
        for name, people in subjects:
            text = f"{name} — {people}" if people else name
            for i, line in enumerate(wrap(c, text, self.w - 90, REGULAR, 8.5)):
                c.drawString(40 if i == 0 else 52, y, line)
                y -= 11
        c.showPage()

    def _date_list(self, dates, x, y):
        line = ""
        for d in dates:
            candidate = f"{line}, {format_date(d)}" if line else format_date(d)
            if self.c.stringWidth(candidate, REGULAR, 9.5) > self.w - x - 45:
                self.c.drawString(x, y, line)
                y -= 12
                line = format_date(d)
            else:
                line = candidate
        if line:
            self.c.drawString(x, y, line)
            y -= 12
        return y

    def projects(self, project_entries):
        """Wszystkie projekty osobno - łatwo je przeoczyć w gęstej siatce."""
        c = self.c
        c.setFont(BOLD, 15)
        c.drawString(40, self.h - 45, "Projekty")
        y = self.h - 68
        c.setFont(REGULAR, 9)
        for line in wrap(c, "W planie 13M5 są dwa przedmioty z projektem i każdy z nich "
                            "ma dwa terminy do wyboru — chodzi się tylko na jeden. "
                            "W siatkach projekty są obrysowane linią przerywaną.",
                         self.w - 80, REGULAR, 9):
            c.drawString(40, y, line)
            y -= 12
        y -= 10

        for subject, code, options in project_entries:
            c.setFont(BOLD, 11)
            c.drawString(40, y, subject)
            y -= 15
            c.setFont(REGULAR, 9)
            for sub, when, room, who, rhythm, who_goes in options:
                c.setFillColor(self.color_for(code))
                c.rect(40, y - 2, 8, 8, stroke=0, fill=1)
                c.setFillColor(black)
                c.setFont(BOLD, 9)
                c.drawString(54, y, sub)
                c.setFont(REGULAR, 9)
                c.drawString(110, y, f"{when}, sala {room}")
                y -= 11
                c.drawString(110, y, f"{who}, {rhythm}")
                y -= 11
                if who_goes:
                    c.setFont(BOLD, 9)
                    c.drawString(110, y, who_goes)
                    c.setFont(REGULAR, 9)
                    y -= 11
                y -= 4
            y -= 6

        c.setFont(BOLD, 11)
        c.drawString(40, y, "Który projekt jest Twój")
        y -= 15
        c.setFont(REGULAR, 9)
        for line in wrap(c, "Zapowiedziany podział na połowy — GL02 i połowa GL03 na P01, "
                            "druga połowa GL03 i GL04 na P02 — dotyczy podgrup SP01 i SP02, "
                            "bo tylko one są wewnętrznymi podgrupami 13M5. Tak są "
                            "poustawiane siatki: strona GL02 pokazuje sam SP01, strona GL04 "
                            "sam SP02, a strona GL03 oba, bo GL03 dzieli się na pół.",
                         self.w - 80, REGULAR, 9):
            c.drawString(40, y, line)
            y -= 12
        y -= 6
        for line in wrap(c, "Podgrup GK/P plan nie wiąże z numerami GL: GK/P01 to cała grupa "
                            "13M4, a 13M5 dzieli się na GK/P02 i GK/P03. Jeżeli obowiązują "
                            "te same połowy co przy SP, to razem z P01 idzie jeden z tych "
                            "terminów, a z P02 drugi — najpewniej kolejno GK/P02 i GK/P03, "
                            "ale to jedyna rzecz w tym pliku, której nie da się wyczytać z "
                            "planu. Dlatego oba terminy GK/P są na każdej siatce.",
                         self.w - 80, REGULAR, 9):
            c.drawString(40, y, line)
            y -= 12
        c.showPage()

    def comparison(self, rows):
        """Tabela: które laboratoria ma która podgrupa GL."""
        c = self.c
        c.setFont(BOLD, 15)
        c.drawString(40, self.h - 45, "Czym różnią się podgrupy GL")
        c.setFont(REGULAR, 9)
        y = self.h - 68
        for line in wrap(c, "Podział na podgrupy nie jest jednakowy dla wszystkich "
                            "przedmiotów: część laboratoriów prowadzona jest tylko dla "
                            "jednej podgrupy. Poniżej widać, ile godzin lekcyjnych "
                            "laboratorium przypada na daną podgrupę w każdym przedmiocie.",
                         self.w - 80, REGULAR, 9):
            c.drawString(40, y, line)
            y -= 12
        y -= 10

        columns = [gl for gl in self.gl_variants]
        x_name, x_first, col_w = 40, 330, 60
        c.setFont(BOLD, 9)
        c.drawString(x_name, y, "Laboratorium")
        for i, gl in enumerate(columns):
            c.drawCentredString(x_first + i * col_w + col_w / 2, y, gl)
        y -= 4
        c.setStrokeColor(HexColor("#9AA1AA"))
        c.line(x_name, y, x_first + len(columns) * col_w, y)
        y -= 13

        c.setFont(REGULAR, 9)
        for name, hours in rows:
            c.drawString(x_name, y, name[:60])
            for i, gl in enumerate(columns):
                value = hours.get(gl)
                c.drawCentredString(x_first + i * col_w + col_w / 2, y,
                                    f"{value} godz." if value else "—")
            y -= 13
        y -= 8
        c.setFont(REGULAR, 8.5)
        for line in wrap(c, "„—" + "” oznacza, że w planie 13M5 nie ma tego laboratorium "
                             "dla tej podgrupy. Jeśli trafisz do takiej podgrupy, warto "
                             "potwierdzić termin u starosty — to może być zajęcia "
                             "przypisane do drugiej grupy dziekańskiej.",
                         self.w - 80, REGULAR, 8.5):
            c.drawString(40, y, line)
            y -= 11
        c.showPage()

    def grid(self, title, subtitles, entries):
        c = self.c
        left, right = 34, self.w - 20
        top = self.h - 74 - 11 * (len(subtitles) - 1)
        bottom = 40
        hour_col = 34
        col_w = (right - left - hour_col) / len(DAYS)
        minutes = DAY_END - DAY_START
        scale = (top - bottom) / minutes

        c.setFont(BOLD, 15)
        c.drawString(left, self.h - 42, title)
        c.setFont(REGULAR, 9)
        for i, line in enumerate(subtitles):
            c.drawString(left, self.h - 56 - i * 11, line)

        # nagłówki dni
        c.setFont(BOLD, 10)
        for i, day in enumerate(DAYS):
            x = left + hour_col + i * col_w
            c.setFillColor(HexColor("#E9ECF2"))
            c.rect(x, top, col_w, 16, stroke=0, fill=1)
            c.setFillColor(black)
            c.drawCentredString(x + col_w / 2, top + 4.5, DAY_NAMES[day])

        # godziny
        c.setFont(REGULAR, 7)
        for hour in range(8, 22):
            y = top - (hour * 60 - DAY_START) * scale
            if y < bottom:
                continue
            c.setStrokeColor(HexColor("#D5D9E0"))
            c.setLineWidth(0.4)
            c.line(left + hour_col, y, right, y)
            c.setFillColor(HexColor("#7A8189"))
            c.drawRightString(left + hour_col - 4, y - 2.5, f"{hour}:00")
        c.setFillColor(black)

        # ramka i pionowe linie
        c.setStrokeColor(HexColor("#9AA1AA"))
        c.setLineWidth(0.7)
        c.rect(left + hour_col, bottom, right - left - hour_col, top - bottom, fill=0)
        for i in range(1, len(DAYS)):
            x = left + hour_col + i * col_w
            c.line(x, bottom, x, top)

        for day_index, day in enumerate(DAYS):
            todays = [e for e in entries if e["day"] == day]
            for entry, lane, lanes in self._lanes(todays):
                self._draw_entry(entry, left + hour_col + day_index * col_w,
                                 col_w, lane, lanes, top, scale)
        c.showPage()

    def _lanes(self, entries):
        """Nakładające się zajęcia dzielą szerokość kolumny."""
        entries = sorted(entries, key=lambda e: (minutes_of(e["start"]), e["end"]))
        groups, current = [], []
        for entry in entries:
            if current and minutes_of(entry["start"]) >= max(
                    minutes_of(e["end"]) for e in current):
                groups.append(current)
                current = []
            current.append(entry)
        if current:
            groups.append(current)
        for group in groups:
            for lane, entry in enumerate(group):
                yield entry, lane, len(group)

    def _draw_entry(self, entry, x0, col_w, lane, lanes, top, scale):
        c = self.c
        start, end = minutes_of(entry["start"]), minutes_of(entry["end"])
        y_top = top - (start - DAY_START) * scale
        height = (end - start) * scale
        width = col_w / lanes
        x = x0 + lane * width

        c.setFillColor(self.color_for(entry["code"]))
        c.setStrokeColor(HexColor("#5B6470"))
        c.setLineWidth(0.9 if entry["choice"] else 0.5)
        c.setDash([2.2, 1.6] if entry["choice"] else [])
        c.rect(x + 1, y_top - height + 1, width - 2, height - 2, fill=1, stroke=1)
        c.setDash([])

        pad = 2.6
        text_w = width - 2 * pad - 1
        c.setFillColor(black)
        y = y_top - height + 1 + height - pad - 4.6

        name = SHORT.get(entry["subject"], entry["subject"])
        if entry["irregular"]:
            name = "! " + name
        size = 5.9 if height < 26 else 6.4
        c.setFont(BOLD, size)
        for line in wrap(c, name, text_w, BOLD, size)[:3]:
            c.drawString(x + pad, y, line)
            y -= size + 0.7

        c.setFont(REGULAR, size - 0.5)
        details = [entry["headline"]]
        if entry["lecturers"]:
            details.append(", ".join(w.title() for w in entry["lecturers"][:2]))
        if entry["note"]:
            details.append(entry["note"])
        for detail in details:
            for line in wrap(c, detail, text_w, REGULAR, size - 0.5)[:2]:
                if y < y_top - height + 3:
                    return
                c.drawString(x + pad, y, line)
                y -= size + 0.2

    def exceptions(self, irregular, squeezed):
        c = self.c
        c.setFont(BOLD, 15)
        c.drawString(40, self.h - 45, "Terminy, których nie widać w siatce")
        y = self.h - 75

        c.setFont(BOLD, 11)
        c.drawString(40, y, "Zajęcia bez równego rytmu (oznaczone „!”)")
        y -= 16
        c.setFont(REGULAR, 9)
        for text in irregular:
            for i, line in enumerate(wrap(c, text, self.w - 90, REGULAR, 9)):
                c.drawString(40 if i == 0 else 52, y, line)
                y -= 11.5
            y -= 2

        y -= 10
        c.setFont(BOLD, 11)
        c.drawString(40, y, "Ostatni tydzień semestru (26 I – 2 II)")
        y -= 16
        c.setFont(REGULAR, 9)
        for line in wrap(c, "W ostatnim tygodniu plan jest ściśnięty: przedmioty, które "
                            "normalnie idą co dwa tygodnie, dostają po 45 minut zamiast 90. "
                            "Dlatego te terminy są wypisane osobno, a nie w siatce.",
                         self.w - 80, REGULAR, 9):
            c.drawString(40, y, line)
            y -= 11.5
        y -= 6
        for text in squeezed:
            for i, line in enumerate(wrap(c, text, self.w - 90, REGULAR, 9)):
                c.drawString(40 if i == 0 else 52, y, line)
                y -= 11.5
        c.showPage()


def build(group, gl_variants, out_path):
    plan = GroupPlan(ROOT / "dane" / f"{group}.htm")
    entries = merge_blocks(plan.blocks)

    # ostatni dzień zajęć w każdym dniu tygodnia jest w planie ściśnięty do 45-minutowych
    # slotów (dwa przedmioty dzielą jeden blok) - trzymamy go poza siatką
    last_day_of = {}
    for entry in entries:
        current = last_day_of.get(entry["day"])
        latest = entry["dates"][-1]
        if current is None or latest > current:
            last_day_of[entry["day"]] = latest

    main = []
    for entry in entries:
        regular = [d for d in entry["dates"] if d != last_day_of[entry["day"]]]
        if regular:
            main.append(dict(entry, dates=regular))

    # ostatni tydzień bierzemy z niescalonych wpisów, żeby zachować skrócone godziny
    finale = [{"day": b.day, "date": last_day_of[b.day], "start": b.start, "end": b.end,
               "subject": b.subject, "form": b.form, "groups": b.groups, "room": b.room}
              for b in plan.blocks if last_day_of[b.day] in b.dates]

    teaching_weeks = collections.defaultdict(set)
    for entry in main:
        for day in entry["dates"]:
            teaching_weeks[entry["day"]].add(week_index(day))
    teaching_weeks = {day: sorted(weeks) for day, weeks in teaching_weeks.items()}

    for entry in main:
        entry["parity"] = classify(entry)
        entry["irregular"] = not is_regular(entry, entry["parity"], teaching_weeks)
        entry["choice"] = choice_label(entry)
        entry["headline"] = " · ".join(
            x for x in [FORM_LABEL.get(entry["form"], entry["form"]), entry["room"]] if x)
        entry["note"] = entry["choice"] or (entry["subgroups"][0] if entry["subgroups"] else "")
        if entry["irregular"] or len(entry["dates"]) == 1:
            entry["note"] = "tylko " * (len(entry["dates"]) == 1) + ", ".join(
                short_date(d) for d in entry["dates"])

    weeks = sorted({week_index(d) for e in main for d in e["dates"]})
    weeks_a = [ANCHOR + timedelta(weeks=w) for w in weeks if w % 2 == 0]
    weeks_b = [ANCHOR + timedelta(weeks=w) for w in weeks if w % 2 == 1]

    choices = collections.defaultdict(list)
    for entry in sorted(main, key=lambda e: (e["choice"], DAYS.index(e["day"]))):
        if not entry["choice"]:
            continue
        family = entry["choice"].rstrip("0123456789")
        label = (f"{entry['choice']} – {SHORT.get(entry['subject'], entry['subject'])}, "
                 f"{DAY_NAMES[entry['day']].lower()} {entry['start']}-{entry['end']}, "
                 f"sala {entry['room']}")
        if label not in choices[family]:
            choices[family].append(label)

    subjects = []
    for code, info in plan.subjects().items():
        people = ", ".join(sorted(p.title() for p in info["lecturers"]))
        subjects.append((SHORT.get(info["name"], info["name"]), people))

    lab_hours = collections.defaultdict(dict)
    for b in plan.blocks:
        for sub in b.subgroups:
            if sub in gl_variants:
                name = SHORT.get(b.subject, b.subject)
                slots = round(b.minutes / 45) * len(b.dates)
                lab_hours[name][sub] = lab_hours[name].get(sub, 0) + slots
    comparison_rows = sorted(lab_hours.items())

    goes_to = collections.defaultdict(list)
    for gl, halves in PROJECT_HALVES.items():
        for half in halves:
            goes_to[half].append(gl if len(halves) == 1 else f"połowa {gl}")

    projects = collections.defaultdict(list)
    for entry in sorted(main, key=lambda e: (DAYS.index(e["day"]), minutes_of(e["start"]))):
        if entry["form"] != "P":
            continue
        sub = entry["choice"] or (entry["subgroups"][0] if entry["subgroups"] else "—")
        projects[(SHORT.get(entry["subject"], entry["subject"]), entry["code"])].append((
            sub,
            f"{DAY_NAMES[entry['day']].lower()} {entry['start']}-{entry['end']}",
            entry["room"],
            ", ".join(w.title() for w in entry["lecturers"]) or "prowadzący nieprzypisany",
            f"{len(entry['dates'])} spotkań, "
            + ("co tydzień" if entry["parity"] == "AB" else f"tydzień {entry['parity']}"),
            f"idzie na to: {', '.join(goes_to[sub])}" if sub in goes_to else "",
        ))
    project_page = [(name, code, options) for (name, code), options in projects.items()]

    cal = Calendar(out_path, group, gl_variants)
    cal.cover(weeks_a, weeks_b, choices, subjects)
    cal.projects(project_page)
    cal.comparison(comparison_rows)

    for gl in gl_variants:
        halves = PROJECT_HALVES.get(gl, tuple(HALF_NAME))
        for parity, label in (("A", "TYDZIEŃ A"), ("B", "TYDZIEŃ B")):
            visible = [dict(e, note=variant_note(e, gl))
                       for e in main
                       if e["parity"] in (parity, "AB") and shows_in(e, gl, halves)]
            example = weeks_a if parity == "A" else weeks_b
            cal.grid(f"{group} · podgrupa {gl} · {label}",
                     ["tygodnie zaczynające się: "
                      + ", ".join(short_date(d) for d in example),
                      "projekt Metody komputerowe mechaniki: "
                      + " albo ".join(f"{s} ({HALF_NAME[s]})" for s in halves)
                      + (f" — {gl} dzieli się na pół" if len(halves) > 1 else ""),
                      "projekt Podstawy niezawodności: GK/P02 albo GK/P03 "
                      "(przydziału nie widać w planie)"],
                     visible)

    irregular = []
    for entry in sorted(main, key=lambda e: (DAYS.index(e["day"]), minutes_of(e["start"]))):
        if not entry["irregular"]:
            continue
        irregular.append(
            f"{DAY_NAMES[entry['day']]} {entry['start']}-{entry['end']} · "
            f"{SHORT.get(entry['subject'], entry['subject'])} "
            f"({entry['form']}, {entry['groups'] or 'cała grupa'}, sala {entry['room']}): "
            + ", ".join(format_date(d) for d in entry["dates"]))

    squeezed_lines = []
    for entry in sorted(finale, key=lambda e: (e["date"], minutes_of(e["start"]))):
        squeezed_lines.append(
            f"{format_date(entry['date'])} ({DAY_NAMES[entry['day']].lower()}) "
            f"{entry['start']}-{entry['end']} · "
            f"{SHORT.get(entry['subject'], entry['subject'])} "
            f"({entry['form']}, {entry['groups'] or 'cała grupa'}, sala {entry['room']})")
    cal.exceptions(irregular, squeezed_lines)
    cal.save()
    return out_path


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--grupa", default="13M5")
    ap.add_argument("--gl", nargs="*", default=["GL02", "GL03", "GL04"])
    ap.add_argument("--out", default=None)
    args = ap.parse_args()
    out = Path(args.out or ROOT / "wygenerowane" / f"Plan_{args.grupa}_kalendarz.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)
    print("zapisano", build(args.grupa, args.gl, out))


if __name__ == "__main__":
    main()
