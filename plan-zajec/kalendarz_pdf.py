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
                current["sessions"] += [(d, b.start, b.end) for d in b.dates]
                current["rooms"].add(b.room)
                current["lecturers"] += [w for w in b.lecturer.split(" / ") if w]
                continue
            if current:
                out.append(current)
            current = {"day": day, "code": code, "form": form, "groups": groups,
                       "start": b.start, "end": b.end, "end_min": end,
                       "subject": b.subject, "subgroups": b.subgroups,
                       "rooms": {b.room}, "dates": list(b.dates),
                       "sessions": [(d, b.start, b.end) for d in b.dates],
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


def covers_group(groups, group):
    """Czy lista odbiorców z komórki w ogóle obejmuje naszą grupę.

    Plan wydziału wstawia do planów grup wpisy wspólne (np. godzina dla przemysłu)
    podpisane sztywną listą zupełnie innych grup - warto to widzieć, a nie brać
    za swoje zajęcia.
    """
    # "13M GL04" to grupa 13M z podgrupą - liczy się tylko pierwszy człon
    parts = [p.split()[0] for p in groups.split(";") if p.strip()]
    return not parts or any(group.startswith(p) for p in parts)


def parity_of(day):
    return "A" if week_index(day) % 2 == 0 else "B"


def hhmm(minutes):
    return f"{minutes // 60}.{minutes % 60:02d}"


def shortened_dates(entry):
    """Terminy, w których zajęcia nie wypełniają całej kratki.

    Uwaga: 90-minutowy blok bywa rozpisany w źródle na dwie 45-minutowe połowy
    z różnymi prowadzącymi - to nie jest skrócenie, więc najpierw sklejamy
    przedziały z jednego dnia.
    """
    span = (minutes_of(entry["start"]), minutes_of(entry["end"]))
    by_date = collections.defaultdict(list)
    for day, start, end in entry["sessions"]:
        if day in set(entry["dates"]):
            by_date[day].append((minutes_of(start), minutes_of(end)))

    out = {}
    for day, pieces in by_date.items():
        merged = []
        for start, end in sorted(pieces):
            if merged and start <= merged[-1][1]:
                merged[-1] = (merged[-1][0], max(merged[-1][1], end))
            else:
                merged.append((start, end))
        if merged != [span]:
            out[day] = (", ".join(f"{hhmm(a)}-{hhmm(b)}" for a, b in merged),
                        sum(b - a for a, b in merged))
    return out


def span_note(entry, parity, teaching_dates):
    """Adnotacja dla zajęć, które nie trwają przez cały semestr."""
    all_weeks = sorted(d for d in teaching_dates[entry["day"]] if parity_of(d) == parity)
    mine = [d for d in entry["dates"] if d in set(all_weeks)]
    if not mine or len(mine) == len(all_weeks):
        return ""
    if mine[0] == all_weeks[0]:
        return f"do {short_date(mine[-1])}"
    if mine[-1] == all_weeks[-1]:
        return f"od {short_date(mine[0])}"
    return f"{short_date(mine[0])} – {short_date(mine[-1])}"


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
        self.dropped = []  # teksty, które nie zmieściły się w kratce

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
            "Wykrzyknik przy nazwie oznacza, że coś odbiega od reguły: nierówny rytm,",
            "termin skrócony do 45 minut albo wpis podpisany obcą grupą. Wszystkie takie",
            "przypadki są wypisane co do daty na końcu pliku.",
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
        for text in [
            "„—” oznacza, że w planie 13M5 nie ma tego laboratorium dla tej podgrupy.",
            "Liczby bywają bardzo nierówne i tak jest w źródle — np. Miernictwo to dla "
            "GL02 tylko trzy spotkania po 45 minut (27 X, 10 XI, 24 XI), a dla GL03 "
            "szesnaście godzin. Te wartości policzone są wprost z planu, ale przed "
            "wyborem podgrupy warto je potwierdzić u starosty.",
            "GL02 i GL03 występują wyłącznie w planie 13M5, natomiast GL04 jest wspólna "
            "z grupą 13M4 — te same zajęcia widnieją w obu planach.",
        ]:
            for line in wrap(c, text, self.w - 80, REGULAR, 8.5):
                c.drawString(40, y, line)
                y -= 11
            y -= 3
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
        if entry["irregular"] or entry["shortened"] or entry["foreign"]:
            name = "! " + name
        size = 5.9 if height < 26 else 6.4
        c.setFont(BOLD, size)
        name_lines = wrap(c, name, text_w, BOLD, size)
        for line in name_lines[:3]:
            c.drawString(x + pad, y, line)
            y -= size + 0.7
        if len(name_lines) > 3:
            self.dropped.append((entry, "nazwa", " ".join(name_lines[3:])))

        # W ciasnej kratce ważniejsze jest, czyje to zajęcia, niż kto je prowadzi,
        # dlatego prowadzący ustępuje miejsca podgrupie i skraca się jako pierwszy.
        c.setFont(REGULAR, size - 0.5)
        small = size - 0.5
        capacity = int((y - (y_top - height + 3)) / (small + 0.2)) + 1
        who = [w.title() for w in entry["lecturers"]]
        who_short = (who[0] + " i in." if len(who) > 1 else who[0]) if who else ""
        candidates = [
            [entry["headline"], entry["note"], ", ".join(who)],
            [entry["headline"], entry["note"], who_short],
            [entry["headline"], entry["note_short"], who_short],
            [entry["headline"], entry["note_short"]],
        ]
        chosen, lines = None, None
        for details in candidates:
            details = [d for d in details if d]
            wrapped = [line for d in details
                       for line in wrap(c, d, text_w, REGULAR, small)]
            if len(wrapped) <= capacity:
                chosen, lines = details, wrapped
                break
        if chosen is None:
            chosen = [d for d in candidates[-1] if d]
            lines = [line for d in chosen for line in wrap(c, d, text_w, REGULAR, small)]
            self.dropped.append((entry, "szczegóły", " | ".join(lines[capacity:])))
            lines = lines[:capacity]
        for line in lines:
            c.drawString(x + pad, y, line)
            y -= small + 0.2

    def exceptions(self, sections):
        c = self.c
        y = None
        for heading, intro, items in sections:
            needed = 30 + 12 * len(wrap(c, intro or "", self.w - 80, REGULAR, 9)) \
                + 11.5 * sum(len(wrap(c, t, self.w - 90, REGULAR, 9)) + 0.2 for t in items)
            if y is None or y - needed < 40:
                if y is not None:
                    c.showPage()
                c.setFont(BOLD, 15)
                c.drawString(40, self.h - 45, "Terminy, których nie widać w siatce")
                y = self.h - 75
            c.setFont(BOLD, 11)
            c.drawString(40, y, heading)
            y -= 16
            c.setFont(REGULAR, 9)
            if intro:
                for line in wrap(c, intro, self.w - 80, REGULAR, 9):
                    c.drawString(40, y, line)
                    y -= 11.5
                y -= 4
            for text in items:
                for i, line in enumerate(wrap(c, text, self.w - 90, REGULAR, 9)):
                    c.drawString(40 if i == 0 else 52, y, line)
                    y -= 11.5
                y -= 2
            y -= 12
        c.showPage()


def prepare(group, gl_variants):
    """Wszystko, co trafia do PDF-u, bez rysowania - dzięki temu audyt sprawdza to samo."""
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

    teaching_dates = collections.defaultdict(set)
    for entry in main:
        teaching_dates[entry["day"]].update(entry["dates"])
    teaching_weeks = {day: sorted({week_index(d) for d in dates})
                      for day, dates in teaching_dates.items()}

    for entry in main:
        entry["parity"] = classify(entry)
        entry["irregular"] = not is_regular(entry, entry["parity"], teaching_weeks)
        # Kratka ma jeden prostokąt, a w źródle pojedyncze terminy bywają skrócone
        # do 45 minut - takie wyjątki idą na ostatnią stronę, żeby ich nie zgubić.
        entry["shortened"] = shortened_dates(entry)
        entry["foreign"] = not covers_group(entry["groups"], group)
        entry["choice"] = choice_label(entry)
        entry["headline"] = " · ".join(
            x for x in [FORM_LABEL.get(entry["form"], entry["form"]), entry["room"]] if x)
        entry["note"] = entry["choice"] or (entry["subgroups"][0] if entry["subgroups"] else "")
        entry["note_short"] = entry["note"]
        if entry["foreign"]:
            entry["note"] = f"w źródle: {entry['groups']}"
            entry["note_short"] = "wpis wydziałowy"
        if entry["irregular"] or len(entry["dates"]) == 1:
            entry["note"] = "tylko " * (len(entry["dates"]) == 1) + ", ".join(
                short_date(d) for d in entry["dates"])
            entry["note_short"] = (entry["note"] if len(entry["dates"]) == 1
                                   else f"{len(entry['dates'])} terminów – spis na końcu")

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

    shortened_lines = []
    for entry in sorted(main, key=lambda e: (DAYS.index(e["day"]), minutes_of(e["start"]))):
        if not entry["shortened"]:
            continue
        by_time = collections.defaultdict(list)
        for day, (label, _) in entry["shortened"].items():
            by_time[label].append(day)
        for label, days in sorted(by_time.items()):
            shortened_lines.append(
                f"{DAY_NAMES[entry['day']]} {SHORT.get(entry['subject'], entry['subject'])} "
                f"({entry['form']}, {entry['groups'] or 'cała grupa'}): zamiast "
                f"{entry['start']}-{entry['end']} tylko {label} w terminach "
                + ", ".join(format_date(d) for d in sorted(days)))

    foreign_lines = []
    for entry in main:
        if entry["foreign"]:
            foreign_lines.append(
                f"{DAY_NAMES[entry['day']]} {entry['start']}-{entry['end']} · "
                f"{SHORT.get(entry['subject'], entry['subject'])} (sala {entry['room']}) "
                f"— w źródle podpisane grupami „{entry['groups']}”, a więc nie {group}. "
                f"Ten sam wpis jest w planach 31 różnych grup, więc wygląda na zajęcia "
                f"wydziałowe; warto potwierdzić, czy dotyczy Ciebie.")

    return {"plan": plan, "main": main, "finale": finale, "last_day_of": last_day_of,
            "weeks_a": weeks_a, "weeks_b": weeks_b, "choices": choices,
            "subjects": subjects, "comparison_rows": comparison_rows,
            "project_page": project_page, "irregular": irregular,
            "squeezed_lines": squeezed_lines, "shortened_lines": shortened_lines,
            "foreign_lines": foreign_lines, "teaching_dates": teaching_dates}


def pages(data, gl_variants):
    """(tytuł, podtytuły, widoczne bloki) dla każdej siatki kalendarza."""
    for gl in gl_variants:
        halves = PROJECT_HALVES.get(gl, tuple(HALF_NAME))
        for parity, label in (("A", "TYDZIEŃ A"), ("B", "TYDZIEŃ B")):
            visible = []
            for entry in data["main"]:
                if entry["parity"] not in (parity, "AB") or not shows_in(entry, gl, halves):
                    continue
                span = span_note(entry, parity, data["teaching_dates"])
                note, short = variant_note(entry, gl), entry["note_short"]
                if span and not entry["irregular"] and len(entry["dates"]) > 1:
                    note = f"{note}, {span}" if note else span
                    short = f"{short}, {span}" if short else span
                visible.append(dict(entry, note=note, note_short=short))
            example = data["weeks_a"] if parity == "A" else data["weeks_b"]
            yield gl, parity, label, example, halves, visible


def build(group, gl_variants, out_path):
    data = prepare(group, gl_variants)

    cal = Calendar(out_path, group, gl_variants)
    cal.cover(data["weeks_a"], data["weeks_b"], data["choices"], data["subjects"])
    cal.projects(data["project_page"])
    cal.comparison(data["comparison_rows"])

    for gl, parity, label, example, halves, visible in pages(data, gl_variants):
        cal.grid(f"{group} · podgrupa {gl} · {label}",
                 ["tygodnie zaczynające się: "
                  + ", ".join(short_date(d) for d in example),
                  "projekt Metody komputerowe mechaniki: "
                  + " albo ".join(f"{s} ({HALF_NAME[s]})" for s in halves)
                  + (f" — {gl} dzieli się na pół" if len(halves) > 1 else ""),
                  "projekt Podstawy niezawodności: GK/P02 albo GK/P03 "
                  "(przydziału nie widać w planie)"],
                 visible)

    cal.exceptions([
        ("Zajęcia bez równego rytmu (oznaczone „!”)", "", data["irregular"]),
        ("Pojedyncze terminy skrócone do 45 minut (oznaczone „!”)",
         "Kratka w siatce ma jedną wysokość, a plan skraca niektóre spotkania. "
         "W tych terminach zajęcia trwają krócej, niż wynika z siatki.",
         data["shortened_lines"]),
        ("Wpisy nie podpisane naszą grupą (oznaczone „!”)", "", data["foreign_lines"]),
        ("Ostatni tydzień semestru (26 I – 2 II)",
         "W ostatnim tygodniu plan jest ściśnięty: przedmioty, które normalnie idą co "
         "dwa tygodnie, dostają po 45 minut zamiast 90. Dlatego te terminy są wypisane "
         "osobno, a nie w siatce.",
         data["squeezed_lines"]),
    ])
    cal.save()
    for entry, what, text in cal.dropped:
        print(f"UWAGA: nie zmieściło się ({what}) w {entry['code']} "
              f"{entry['day']} {entry['start']}: {text}")
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
