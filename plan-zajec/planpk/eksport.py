"""Generowanie czytelnego planu: Markdown + kalendarz ICS."""
from __future__ import annotations

import collections
from datetime import datetime, timedelta

from .model import (DAY_NAMES, FORM_NAMES, GroupPlan, family_of, format_date,
                    minutes_of)

SUBGROUP_HELP = {
    "GL": "podgrupa laboratoryjna całego rocznika (np. `13M GL04`)",
    "GK/P": "podgrupa konwersatoryjno-projektowa całego rocznika (np. `13M GK/P03`)",
    "SL": "podgrupa laboratoryjna wydzielona wewnątrz jednej grupy (np. `13M5 SL02`)",
    "SP": "podgrupa projektowa wydzielona wewnątrz jednej grupy (np. `13M5 SP02`)",
    "SK": "podgrupa konwersatoryjna wydzielona wewnątrz jednej grupy",
}


def _escape(text):
    return text.replace("|", "\\|")


def _who(block):
    return block.groups or "cała grupa"


def markdown(plan: GroupPlan, blocks=None, title_suffix=""):
    blocks = plan.blocks if blocks is None else blocks
    lines = [f"# Plan zajęć – {plan.name}{title_suffix}", ""]
    lines += [
        f"Semestr zimowy 2026/2027, Wydział Mechaniczny PK. "
        f"Liczba pozycji w planie: {len(blocks)}.", "",
        "Formy zajęć: " + ", ".join(f"**{k}** – {v}" for k, v in FORM_NAMES.items()
                                    if any(b.form == k for b in blocks)) + ".", "",
    ]

    subgroups = sorted({s for b in blocks for s in b.subgroups})
    if subgroups:
        lines += ["Podgrupy występujące w tym planie: "
                  + ", ".join(f"`{s}`" for s in subgroups) + ".", ""]

    for day in plan.days:
        day_blocks = [b for b in blocks if b.day == day]
        if not day_blocks:
            continue
        total = sum(b.minutes * b.occurrences() for b in day_blocks) // 60
        timed = [b for b in day_blocks if not b.elearning]
        last = max((b.end for b in timed), key=minutes_of, default="")
        hours = (f"Zajęcia od {timed[0].start} do {last}, łącznie"
                 if timed else "Same zajęcia e-learningowe,")
        lines += [f"## {DAY_NAMES[day]}", "",
                  f"{hours} {total} godzin zegarowych w semestrze.", "",
                  "| Godziny | Przedmiot | Forma | Grupa / podgrupa | Sala | Prowadzący | Terminy |",
                  "| --- | --- | --- | --- | --- | --- | --- |"]
        for b in day_blocks:
            lines.append(
                f"| {b.time} | {_escape(b.subject)} | {b.form_name} | "
                f"{_escape(_who(b))} | {_escape(b.room) or '—'} | "
                f"{_escape(b.lecturer.title()) or '—'} | {b.rhythm} |")
        lines.append("")

    lines += ["## Przedmioty", "",
              "| Przedmiot | Kod | Formy (liczba spotkań) | Prowadzący |",
              "| --- | --- | --- | --- |"]
    for code, info in plan.subjects(blocks).items():
        forms = ", ".join(f"{FORM_NAMES.get(f, f)} ×{n}"
                          for f, n in sorted(info["forms"].items()))
        people = ", ".join(sorted(p.title() for p in info["lecturers"])) or "—"
        lines.append(f"| {_escape(info['name'])} | `{code}` | {forms} | {_escape(people)} |")
    lines.append("")

    lines += ["## Jak czytać oznaczenia podgrup", ""]
    families = {family_of(s) for b in blocks for s in b.subgroups}
    for prefix, desc in SUBGROUP_HELP.items():
        if prefix in families:
            lines.append(f"- `{prefix}xx` – {desc}")
    lines += ["", "Wpis bez oznaczenia podgrupy oznacza zajęcia dla całej grupy "
                  "(albo dla całego rocznika, jeśli wymieniono kilka grup).", ""]
    return "\n".join(lines)


def ics(plan: GroupPlan, blocks=None, name=None):
    blocks = plan.blocks if blocks is None else blocks
    stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    out = ["BEGIN:VCALENDAR", "VERSION:2.0",
           f"PRODID:-//plan-zajec-pk//{name or plan.name}//PL",
           "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
           f"X-WR-CALNAME:Plan {name or plan.name}",
           "X-WR-TIMEZONE:Europe/Warsaw",
           "BEGIN:VTIMEZONE", "TZID:Europe/Warsaw",
           "BEGIN:STANDARD", "DTSTART:19701025T030000",
           "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
           "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "END:STANDARD",
           "BEGIN:DAYLIGHT", "DTSTART:19700329T020000",
           "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
           "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "END:DAYLIGHT",
           "END:VTIMEZONE"]

    for i, b in enumerate(blocks):
        if not b.elearning:
            sh, sm = divmod(minutes_of(b.start), 60)
            eh, em = divmod(minutes_of(b.end), 60)
        for j, day in enumerate(b.dates):
            uid = f"{plan.name}-{i}-{j}-{day.isoformat()}@plan-zajec-pk"
            summary = f"{b.subject} ({b.form})"
            if b.elearning:
                summary += " e-learning"
            if b.subgroups:
                summary += " " + " ".join(b.subgroups)
            description = "; ".join(x for x in [
                f"Kod: {b.code}",
                f"Forma: {b.form_name}" + (" (e-learning)" if b.elearning else ""),
                f"Prowadzący: {b.lecturer.title()}" if b.lecturer else "",
                f"Grupa: {b.groups}" if b.groups else "",
            ] if x)
            # e-learning nie ma w planie godziny - wpis na cały dzień
            when = ([f"DTSTART;VALUE=DATE:{day:%Y%m%d}",
                     f"DTEND;VALUE=DATE:{day + timedelta(days=1):%Y%m%d}"]
                    if b.elearning else
                    [f"DTSTART;TZID=Europe/Warsaw:{day:%Y%m%d}T{sh:02d}{sm:02d}00",
                     f"DTEND;TZID=Europe/Warsaw:{day:%Y%m%d}T{eh:02d}{em:02d}00"])
            out += [
                "BEGIN:VEVENT", f"UID:{uid}", f"DTSTAMP:{stamp}", *when,
                f"SUMMARY:{_ics_escape(summary)}",
                f"LOCATION:{_ics_escape(b.room)}",
                f"DESCRIPTION:{_ics_escape(description)}",
                "END:VEVENT",
            ]
    out.append("END:VCALENDAR")
    return "\r\n".join(_fold(line) for line in out) + "\r\n"


def _fold(line, limit=73):
    """Zawijanie długich linii wymagane przez RFC 5545."""
    data = line.encode("utf-8")
    if len(data) <= limit:
        return line
    chunks, current = [], b""
    for char in line:
        encoded = char.encode("utf-8")
        if len(current) + len(encoded) > limit:
            chunks.append(current.decode("utf-8"))
            current = b""
            limit = 72
        current += encoded
    chunks.append(current.decode("utf-8"))
    return "\r\n ".join(chunks)


def _ics_escape(text):
    return (text.replace("\\", "\\\\").replace(";", "\\;")
                .replace(",", "\\,").replace("\n", "\\n"))


def overview(plans):
    """Zbiorcze zestawienie grup i ich podgrup."""
    lines = ["# Grupy w planie – semestr zimowy 2026/2027", "",
             "Wydział Mechaniczny PK, studia stacjonarne.", "",
             "| Grupa | Dni z zajęciami | Pozycji w planie | Podgrupy |",
             "| --- | --- | --- | --- |"]
    for plan in plans:
        days = ", ".join(DAY_NAMES[d].lower() for d in plan.days)
        subs = ", ".join(f"`{s}`" for s in plan.all_subgroups()) or "—"
        lines.append(f"| [{plan.name}](grupy/{plan.name}.md) | {days} | "
                     f"{len(plan.blocks)} | {subs} |")
    lines.append("")
    return "\n".join(lines)
