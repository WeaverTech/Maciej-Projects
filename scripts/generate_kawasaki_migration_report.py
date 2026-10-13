from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "kawasaki-migration-report"
FILENAME = "Raport_migracja_Kawasaki_D_do_E_F"
FONT_REGULAR = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
ACCENT = "1F4E79"
HEADER_FILL = "DCE6F1"
NUMBERED_ITEM = re.compile(r"^\d+\. ")

pdfmetrics.registerFont(TTFont(FONT_REGULAR, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


TITLE = "Wymiana robota Kawasaki z kontrolerem serii D na ten sam model z kontrolerem serii E lub F"
SUBTITLE = "Co da się przenieść ze starego kontrolera, co trzeba wykonać od nowa i na co uważać"
META = [
    ("Data", "13.10.2026"),
    ("Przygotował", "[imię i nazwisko]"),
    ("Status", "Analiza na podstawie dokumentacji Kawasaki i źródeł praktyków; do potwierdzenia w serwisie Kawasaki przed zakupem"),
]

# Each block: (kind, payload). Kinds: h1, h2, p, bullets, table, note.
CONTENT: list[tuple] = [
    ("h1", "1. Podsumowanie"),
    ("bullets", [
        "Przy wymianie robota razem z kontrolerem na ten sam model ramienia da się przenieść prawie całą aplikację: "
        "programy AS i programy blokowe, wszystkie zmienne (punkty, liczby, teksty), dane pomocnicze oraz większość "
        "danych systemowych.",
        "Nie wolno wczytywać pełnego backupu z kontrolera D. Zawiera on dane robota (model, numer seryjny, zerowanie, "
        "parametry serwo), które nadpisałyby fabryczną konfigurację nowego ramienia. Dane przenosi się selektywnie, "
        "poleceniami SAVE/P, /L, /R, /S, /A i /SYS, które istnieją zarówno w D, jak i w E/F.",
        "Od nowa trzeba wykonać część sprzętową: okablowanie wejść/wyjść i obwodów bezpieczeństwa, konfigurację "
        "fieldbusa (również po stronie PLC) oraz zamówienie opcji płatnych na nowym kontrolerze.",
        "Programy pojadą prawie poprawnie, ale nowy egzemplarz ramienia ma własne zerowanie i nigdy nie stanie "
        "idealnie w miejscu starego. Krytyczne punkty trzeba sprawdzić i douczyć.",
        "Ten sam model ramienia rzeczywiście występuje w kilku generacjach: MX350L/MX420L/MX500N/MX700N (D, E, F04) "
        "oraz ZX300S (D, E, F02). Dla innych rodzin (np. seria FS) następcą jest inny model (seria RS).",
        "Warianty robotów z kontrolerem D zakończyły produkcję głównie w latach 2010-2014. Kawasaki gwarantuje części "
        "przez maksymalnie 10 lat od zakończenia produkcji, więc dla większości robotów z D to okno już minęło. "
        "Większość wariantów z kontrolerem E wycofano w latach 2019-2024, więc nowy zakup to w praktyce kontroler F.",
    ]),

    ("h1", "2. Założenia analizowanego scenariusza"),
    ("bullets", [
        "Obecnie: robot Kawasaki z kontrolerem serii D (np. D2x/D3x/D4x/D7x).",
        "Docelowo: ten sam model ramienia z nowym kontrolerem serii E lub F, dostarczony jako para z fabryki.",
        "Stanowisko się nie zmienia: robot stoi w tym samym miejscu, ma ten sam chwytak, te same urządzenia "
        "peryferyjne i ten sam program.",
    ]),

    ("h1", "3. Czy „ten sam model ramienia” jest dostępny z kontrolerem E lub F"),
    ("p", "Kawasaki sprzedaje ramię i kontroler jako parę. Kod modelu zawiera oznaczenie kontrolera, np. MX420L_D24 "
          "(z kontrolerem D) i MX420L_E24 (z kontrolerem E). Z oficjalnej listy wycofanych modeli i stron kontrolerów "
          "wynika:"),
    ("table", ["Rodzina ramion", "Z kontrolerem D", "Z kontrolerem E", "Z kontrolerem F (obecnie)"], [
        ["MX350L, MX420L, MX500N, MX700N", "tak", "tak", "tak, F04"],
        ["ZX300S", "tak", "tak (E02)", "tak, F02"],
        ["ZX130S/L, ZX165U, ZX200S", "tak", "tak (E02)", "nie ma na liście F02; seria Z ogólnie w instrukcji F0x - do potwierdzenia"],
        ["MT (np. MT400N)", "tak", "tak", "seria MT w specyfikacji F02 - do potwierdzenia dla konkretnego modelu"],
        ["FS (np. FS010N, FS020N)", "tak", "nie", "nie; następca to seria RS (np. RS010N, RS020N)"],
    ], [3.4, 2.4, 2.4, 5.8]),
    ("note", "Źródła: lista wycofanych modeli Kawasaki (08.2023), strony produktów F02, F04 i E02, specyfikacja F0x. "
             "Gdy „ten sam model” jest następcą, przed zamówieniem trzeba porównać karty katalogowe: zakresy osi, "
             "zasięg, wymiary podstawy i kołnierza."),

    ("h1", "4. Dostępność części dla kontrolerów D i E"),
    ("table", ["Generacja", "Zakończenie produkcji wariantów robot+kontroler", "Gwarancja części (zasada Kawasaki: do 10 lat)"], [
        ["D", "głównie 03.2010-01.2014 (pojedyncze modele 2015-2022)", "dla większości modeli minęła w latach 2020-2024"],
        ["E (E1x-E4x i inne)", "głównie 2019-02.2024", "orientacyjnie do 2029-2034"],
        ["F", "aktualna generacja", "aktualnie produkowana"],
    ], [3.0, 6.0, 7.0]),
    ("p", "Kawasaki deklaruje, że będzie starać się dostarczać części także po tym okresie, ale nie gwarantuje "
          "dostępności, a terminy dostaw mogą się wydłużać. Kawasaki Robotics wprost zaleca modernizację robotów "
          "z kontrolerami A, B, C i D, bo części do nich nie są już dostarczane. Wybór kontrolera E przy nowym zakupie "
          "oznacza generację w większości już wycofaną; E ma sens głównie przy ujednolicaniu parku maszyn i tylko po "
          "potwierdzeniu dostępności u dystrybutora."),

    ("h1", "5. Co przenosi się ze starego kontrolera"),
    ("p", "Kontroler D i kontrolery E/F mają te same polecenia zapisu poszczególnych typów danych. Każdy typ można "
          "zapisać do osobnego pliku i wczytać osobno poleceniem LOAD."),
    ("table", ["Dane", "Polecenie", "Ocena", "Uwagi"], [
        ["Programy AS i programy blokowe", "SAVE/P", "Przenosi się", "Język AS jest zgodny wstecz. KRterm pokaże przy wczytywaniu linie, których nowy kontroler nie przyjmie."],
        ["Punkty (zmienne pozycji)", "SAVE/L", "Przenosi się", "Wartości przechodzą 1:1, ale nowy egzemplarz ramienia wymaga sprawdzenia punktów (rozdział 7)."],
        ["Zmienne liczbowe", "SAVE/R", "Przenosi się", "Liczniki, parametry, przesunięcia."],
        ["Zmienne tekstowe", "SAVE/S", "Przenosi się", "Uwaga na teksty ze znakami sterującymi z PLC - potrafią uszkodzić zapis."],
        ["Dane pomocnicze", "SAVE/A", "Przenosi się, sprawdzić", "Pozycja domowa, limity osi, ustawienia chwytaka i obciążenia, strefy pracy, ustawienia programów blokowych."],
        ["Dane systemowe", "SAVE/SYS", "Częściowo", "Sygnały dedykowane i przełączniki systemowe w większości zgodne; konfiguracja fieldbusa zwykle nie."],
        ["Ekran operatorski (Interface Panel)", "część pełnego backupu", "Częściowo", "Wczytuje się, ale nie zawsze jako wierna kopia. Wartości pól ustawianych przez BITS się nie przenoszą - zrobić zdjęcia ekranów."],
        ["Program K-Logic (sterownik programowy)", "osobny", "Do sprawdzenia", "E ma opcję KLogic; dla F potwierdzić dostępność opcji i zgodność programu."],
        ["Dane robota", "SAVE/ROB", "NIE przenosić", "Model, numer seryjny, zerowanie i parametry serwo nowego ramienia są ustawione fabrycznie."],
        ["Pełny backup", "SAVE", "NIE wczytywać w całości", "Zawiera dane robota. Można go użyć jako archiwum i źródło do wycięcia sekcji z panelem, programami i zmiennymi."],
    ], [3.6, 2.4, 2.6, 7.4]),
    ("note", "Praktyczna metoda przy przejściu z D na E opisana przez praktyków: zrobić kopię pliku pełnego backupu, "
             "usunąć z niej wszystko powyżej sekcji danych panelu (MFP) i wczytać resztę. Przenosi to panel, programy, "
             "zmienne i teksty bez ryzyka nadpisania danych robota."),

    ("h1", "6. Co trzeba wykonać od nowa"),
    ("table", ["Obszar", "Kontroler D", "Kontroler F (E podobnie, szczegóły w tekście)", "Co zrobić"], [
        ["Wejścia/wyjścia ogólne", "32 we / 32 wy standardowo (karta 1HW/1GW, złącza 37-pin D-sub), opcjonalnie 64/96/128", "32 we / 32 wy standardowo, do 64/64 w szafie i 128/128 z remote I/O", "Spisać mapę sygnałów, przygotować nowe przewody lub listwy przyłączeniowe do nowych złączy."],
        ["Obwody bezpieczeństwa", "obwody sprzętowe (E-stop, drzwi, praca ręczna)", "wersja A (opcja Cubic-S) lub B (opcja CoreCubic-S); obwód do kat. 4 / PL e", "Przepiąć, zwalidować funkcje bezpieczeństwa i zaktualizować ocenę ryzyka stanowiska."],
        ["Fieldbus", "DeviceNet, PROFIBUS-DP, INTERBUS, CC-Link, EtherNet/IP, ControlNet (opcje)", "moduł opcjonalny (slave na złączu XAB, master na karcie PCIe); osobna instrukcja 90210-1326", "Zamówić moduł, wgrać nowy plik konfiguracyjny (GSD/EDS/GSDML) w PLC i zmapować sygnały od nowa."],
        ["Pendant", "pendant serii D", "nowy pendant GenII (port USB, inny ekran)", "Przejrzeć i poprawić ekran operatorski; przeszkolić operatorów."],
        ["Opcje płatne", "np. fieldbus, śledzenie przenośnika, spawanie", "zamawiane osobno", "Spisać wszystkie opcje aktywne w D i zamówić odpowiedniki."],
        ["Zapis danych", "PC (KRterm/KCwin przez RS-232C lub Ethernet), karta PCMCIA", "USB, Ethernet, CFast", "Przygotować sposób zgrania danych z D przed demontażem."],
    ], [2.6, 4.1, 4.6, 4.7]),
    ("p", "PROFINET i CANopen były dostępne w kontrolerze E, ale nie w D. Jeśli stanowisko używa sieci, której nie ma "
          "w ofercie dla F (np. INTERBUS, ControlNet), trzeba zmienić sieć lub dodać bramkę."),

    ("h1", "7. Punkty i kalibracja nowego ramienia"),
    ("p", "Nowy robot tego samego modelu ma tę samą kinematykę, ale własne, fabryczne zerowanie. Do tego nie da się "
          "go zamontować co do dziesiątych części milimetra w miejscu starego. Dlatego:"),
    ("bullets", [
        "Przed demontażem starego robota najechać narzędziem na kilka stałych punktów w celi (np. bazy przyrządów) "
        "i zapisać ich pozycje.",
        "Po montażu nowego robota najechać na te same punkty. Jeśli błąd jest stały dla wszystkich punktów, korygować "
        "go raz (BASE albo przesunięcie punktów), a nie douczaniem każdego punktu osobno.",
        "Na koniec sprawdzić na małej prędkości wszystkie programy i douczyć krytyczne punkty: pobranie, odłożenie, "
        "wejścia w maszynę i strefy kolizji.",
        "neoROSET wczytuje pełny backup z prawdziwego kontrolera D, D+, E i F, pozwala podmienić model robota bez "
        "zmiany układu stanowiska, przesuwać i lustrzanie kopiować punkty oraz porównywać tekst programów. "
        "Pozwala to sprawdzić zasięg i kolizje przed demontażem.",
    ]),

    ("h1", "8. D na E czy D na F"),
    ("table", ["Kryterium", "D na E", "D na F"], [
        ["Dostępność nowych robotów", "większość wariantów wycofana w latach 2019-2024", "aktualna generacja"],
        ["Podobieństwo do D", "większe: podobna architektura i obsługa", "mniejsze: nowy pendant, inne złącza, mniejsza szafa"],
        ["Przenoszenie programów i danych", "tak samo (SAVE/P, /L, /R, /S, /A, /SYS)", "tak samo"],
        ["Horyzont części", "orientacyjnie do 2029-2034", "najdłuższy"],
        ["Rekomendacja", "tylko przy ujednolicaniu parku maszyn i po potwierdzeniu dostępności", "domyślny wybór"],
    ], [4.0, 6.0, 6.0]),

    ("h1", "9. Procedura krok po kroku"),
    ("bullets", [
        "1. Zrobić pełny backup kontrolera D jako archiwum oraz osobne pliki: programy, punkty, zmienne liczbowe, "
        "teksty, dane pomocnicze i dane systemowe.",
        "2. Spisać: mapę wejść/wyjść, konfigurację fieldbusa, TOOL i BASE, przełączniki systemowe, aktywne opcje; "
        "zrobić zdjęcia ekranów panelu operatorskiego.",
        "3. Zapisać pozycje punktów referencyjnych w celi (rozdział 7).",
        "4. Opcjonalnie: wczytać backup do neoROSET, podmienić robota na nowy model i sprawdzić zasięg oraz kolizje.",
        "5. Zamontować nowy robot i kontroler, przepiąć wejścia/wyjścia oraz obwody bezpieczeństwa.",
        "6. Wczytać programy i zmienne, potem dane pomocnicze i systemowe. Każdy błąd wczytywania sprawdzić ręcznie.",
        "7. Skonfigurować fieldbus po obu stronach, poprawić ekran operatorski.",
        "8. Skorygować układ współrzędnych na podstawie punktów referencyjnych.",
        "9. Przejechać wszystkie programy na małej prędkości, douczyć krytyczne punkty, zwalidować funkcje "
        "bezpieczeństwa.",
        "10. Zrobić pełny backup nowego kontrolera i zaktualizować dokumentację stanowiska.",
    ]),
    ("p", "Wskazówka praktyków: kontrolery E i F mają szybszy procesor, więc ciasne pętle w programach PC i w "
          "programie głównym warto spowolnić krótkim TWAIT (np. TWAIT 0.02), żeby kontroler pozostawał responsywny."),

    ("h1", "10. Ryzyka"),
    ("table", ["Ryzyko", "Skutek", "Jak ograniczyć"], [
        ["Wczytanie pełnego backupu z D", "nadpisanie danych nowego robota, błędne pozycje", "wczytywać tylko wybrane typy danych"],
        ["Niespisana mapa I/O lub fieldbusa", "długi rozruch, błędy komunikacji z PLC", "dokumentacja i zdjęcia przed demontażem"],
        ["Pominięte opcje płatne", "brak funkcji po uruchomieniu", "lista opcji z kontrolera D przy zamówieniu"],
        ["Inny model niż zakładany", "inne zakresy osi i zasięg", "porównanie kart katalogowych, symulacja w neoROSET"],
        ["Zmiana układu bezpieczeństwa", "niezgodność z oceną ryzyka", "walidacja i aktualizacja dokumentacji"],
        ["Utrata danych z D (stary nośnik, bateria)", "brak programów do przeniesienia", "backup na PC z wyprzedzeniem"],
    ], [5.0, 5.2, 5.8]),

    ("h1", "11. Weryfikacja i korekty wcześniejszych informacji"),
    ("bullets", [
        "Korekta: kontrolery F0x mają standardowo 32 wejścia i 32 wyjścia (do 64/64 w szafie, 128/128 z remote I/O), "
        "a nie 16, jak wynikało z wypowiedzi na forum.",
        "Korekta: typ modułu fieldbus w F (HMS CompactCom) pochodził z forum i nie znalazłem go w dokumentacji "
        "Kawasaki. Potwierdzone jest tylko, że to opcjonalny moduł na złączu XAB (slave) lub karta PCIe (master).",
        "Doprecyzowanie: „ten sam model ramienia” z nowszym kontrolerem istnieje dla części rodzin (MX, ZX300S). "
        "Dla innych jest to następca, którego kartę katalogową trzeba porównać.",
        "Potwierdzone w dokumentacji: polecenia SAVE/P, /L, /R, /S, /A, /SYS i /ROB w kontrolerach D i F; "
        "zachowanie płytki Arm ID (wybór strony ramienia lub kontrolera); E0x jako poprzednik F0x; wersje A/B "
        "kontrolerów F0x; wczytywanie backupów D, D+, E i F w neoROSET.",
        "Oparte na doświadczeniu praktyków (forum robot-forum.com), nie na dokumentacji Kawasaki: metoda wycinania "
        "sekcji z backupu, nieprzenoszenie wartości BITS na panelu, wskazówka z TWAIT, ocena zgodności danych "
        "pomocniczych i systemowych.",
    ]),

    ("h1", "12. Do potwierdzenia w serwisie Kawasaki przed zakupem"),
    ("bullets", [
        "Dokładny model docelowy (kod z oznaczeniem kontrolera) i jego zgodność wymiarowa ze starym ramieniem.",
        "Dostępność wybranego wariantu z kontrolerem E, jeśli ten wariant jest brany pod uwagę.",
        "Dostępność potrzebnej sieci fieldbus i opcji (np. K-Logic) dla kontrolera F.",
        "Wersja kontrolera F (A z Cubic-S albo B z CoreCubic-S) - nie każde ramię współpracuje z wersją B.",
        "Czy Kawasaki oferuje usługę lub narzędzie do konwersji danych z D na F.",
    ]),

    ("h1", "13. Źródła"),
    ("p", "Dokumentacja i strony Kawasaki:"),
    ("bullets", [
        "Lista wycofanych modeli i zasada dostaw części (08.2023): kawasakirobotics.com/uploads/sites/2/2023/08/202308product-discontinuation-list.pdf",
        "Retired Models (części do 10 lat): kawasakirobotics.com/products/retired-models/",
        "Specyfikacja kontrolerów F0x: kawasakirobotics.com/uploads/sites/2/2022/01/F0x-E-1-1.pdf",
        "Instrukcja instalacji F0x: kawasakirobotics.com/uploads/sites/2/2022/01/F0x_Series_Controller-Installation_and_Connection_Manual-E-4.pdf",
        "Strony kontrolerów F02, F04 i E02: kawasakirobotics.com (sekcja Controllers)",
        "AS Language Reference Manual, kontroler F (90209-1025) i kontroler D - polecenia SAVE/LOAD",
        "General Fieldbus I/O Usage Manual, kontrolery D/E (90210-1184)",
        "Arm ID Board Instruction Manual, kontroler D (90210-1174) i E (90210-1246)",
        "Specyfikacja kontrolerów D70/D4x (broszura Kawasaki)",
        "neoROSET Operation Manual oraz broszura neoROSET: kawasakirobotics.com/uploads/sites/2/2026/02/neoROSET_EN_no.2645.pdf",
        "Komunikat Kawasaki o kontrolerach E jako następcy D (29.09.2008): global.kawasaki.com",
        "Kawasaki Robotics, „Tips for an Industrial Robotics Upgrade or Retrofit”: kawasakirobotics.com/blog/",
    ]),
    ("p", "Źródła praktyków (robot-forum.com, wątki 38312, 49046, 43051, 41303, 36020) - wykorzystane tylko jako "
          "uzupełnienie i oznaczone w rozdziale 11."),
]


def set_cell_fill(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear")
    shading.set(qn("w:color"), "auto")
    shading.set(qn("w:fill"), fill)
    tc_pr.append(shading)


def build_docx() -> Path:
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Cm(21.0), Cm(29.7)
    for side in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(section, side, Cm(2.0))

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10)

    title = doc.add_paragraph()
    run = title.add_run(TITLE)
    run.bold = True
    run.font.size = Pt(17)
    run.font.color.rgb = RGBColor.from_string(ACCENT)
    subtitle = doc.add_paragraph()
    subtitle.add_run(SUBTITLE).font.size = Pt(11)
    for label, value in META:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.add_run(f"{label}: ").bold = True
        p.add_run(value)
    doc.add_paragraph()

    for kind, *payload in CONTENT:
        if kind == "h1":
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            r = p.add_run(payload[0])
            r.bold = True
            r.font.size = Pt(13)
            r.font.color.rgb = RGBColor.from_string(ACCENT)
        elif kind == "p":
            doc.add_paragraph(payload[0])
        elif kind == "note":
            p = doc.add_paragraph()
            r = p.add_run(payload[0])
            r.italic = True
            r.font.size = Pt(9)
        elif kind == "bullets":
            for item in payload[0]:
                if NUMBERED_ITEM.match(item):
                    doc.add_paragraph(NUMBERED_ITEM.sub("", item), style="List Number")
                else:
                    doc.add_paragraph(item, style="List Bullet")
        elif kind == "table":
            header, rows, widths = payload
            table = doc.add_table(rows=1, cols=len(header))
            table.style = "Table Grid"
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            for i, text in enumerate(header):
                cell = table.rows[0].cells[i]
                cell.text = ""
                r = cell.paragraphs[0].add_run(text)
                r.bold = True
                r.font.size = Pt(9)
                set_cell_fill(cell, HEADER_FILL)
            for row in rows:
                cells = table.add_row().cells
                for i, text in enumerate(row):
                    cells[i].text = ""
                    cells[i].paragraphs[0].add_run(text).font.size = Pt(9)
            total = sum(widths)
            for row in table.rows:
                for i, cell in enumerate(row.cells):
                    cell.width = Cm(17.0 * widths[i] / total)
            doc.add_paragraph()

    path = OUT_DIR / f"{FILENAME}.docx"
    doc.save(path)
    return path


def build_pdf() -> Path:
    path = OUT_DIR / f"{FILENAME}.pdf"
    accent = colors.HexColor(f"#{ACCENT}")
    styles = {
        "title": ParagraphStyle("title", fontName=FONT_BOLD, fontSize=16, leading=20, textColor=accent, spaceAfter=6),
        "subtitle": ParagraphStyle("subtitle", fontName=FONT_REGULAR, fontSize=10.5, leading=14, spaceAfter=8),
        "meta": ParagraphStyle("meta", fontName=FONT_REGULAR, fontSize=8.5, leading=11),
        "h1": ParagraphStyle("h1", fontName=FONT_BOLD, fontSize=12, leading=15, textColor=accent, spaceBefore=10, spaceAfter=5),
        "p": ParagraphStyle("p", fontName=FONT_REGULAR, fontSize=9, leading=12.5, spaceAfter=5, alignment=TA_LEFT),
        "note": ParagraphStyle("note", fontName=FONT_REGULAR, fontSize=8, leading=10.5, textColor=colors.HexColor("#444444"), spaceAfter=6),
        "cell": ParagraphStyle("cell", fontName=FONT_REGULAR, fontSize=7.8, leading=10),
        "cellh": ParagraphStyle("cellh", fontName=FONT_BOLD, fontSize=7.8, leading=10),
    }

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont(FONT_REGULAR, 7.5)
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawString(2 * cm, 1.2 * cm, "Migracja robota Kawasaki z kontrolera D na E/F")
        canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Strona {doc_.page}")
        canvas.restoreState()

    story = [Paragraph(TITLE, styles["title"]), Paragraph(SUBTITLE, styles["subtitle"])]
    for label, value in META:
        story.append(Paragraph(f"<font name='{FONT_BOLD}'>{label}:</font> {value}", styles["meta"]))
    story.append(Spacer(1, 8))

    width = A4[0] - 4 * cm
    pending_heading = None
    for kind, *payload in CONTENT:
        if kind == "h1":
            pending_heading = Paragraph(payload[0], styles["h1"])
            continue
        if kind in ("p", "note"):
            block = [Paragraph(payload[0], styles[kind])]
        elif kind == "bullets":
            numbered = all(NUMBERED_ITEM.match(item) for item in payload[0])
            indent = 18 if numbered else 14
            items = [
                ListItem(Paragraph(NUMBERED_ITEM.sub("", item) if numbered else item, styles["p"]), leftIndent=indent)
                for item in payload[0]
            ]
            list_options = {"bulletType": "1", "bulletFormat": "%s."} if numbered else {"bulletType": "bullet", "start": "•"}
            block = [ListFlowable(
                items,
                bulletFontName=FONT_REGULAR,
                bulletFontSize=8.5,
                leftIndent=indent,
                **list_options,
            )]
        elif kind == "table":
            header, rows, widths = payload
            total = sum(widths)
            data = [[Paragraph(h, styles["cellh"]) for h in header]]
            data += [[Paragraph(c, styles["cell"]) for c in row] for row in rows]
            table = Table(data, colWidths=[width * w / total for w in widths], repeatRows=1)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(f"#{HEADER_FILL}")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9AA5B1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            block = [table, Spacer(1, 6)]
        else:
            continue
        if pending_heading is not None:
            story.append(KeepTogether([pending_heading, block[0]]))
            story.extend(block[1:])
            pending_heading = None
        else:
            story.extend(block)

    SimpleDocTemplate(
        str(path), pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title=TITLE, author="",
    ).build(story, onFirstPage=footer, onLaterPages=footer)
    return path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(build_docx())
    print(build_pdf())


if __name__ == "__main__":
    main()
