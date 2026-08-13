#!/usr/bin/env python3
"""Uzupelnia karte technologiczna kola zebatego.

Nie zmienia formatki: na oryginalny PDF nanosi wylacznie teksty w pustych
miejscach komorek:
  * kolumna 'Stanowisko'        -> model obrabiarki (tekst wysrodkowany w komorce),
  * kolumna 'Pomoce warsztatowe'-> dopisek narzedzi skrawajacych (dolna czesc komorki).

Tekst jest centrowany i odsuniety od krawedzi komorek (padding), aby nic nie
nachodzilo na linie tabeli.
"""
import fitz  # PyMuPDF

SRC = "karta_technologiczna_oryginal.pdf"
DST = "karta_technologiczna_uzupelniona.pdf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FNAME = "dejavu"

# Granice kolumn (odczytane z geometrii tabeli) i marginesy wewnetrzne.
STAN_X0, STAN_X1 = 78.8, 159.6
POM_X0, POM_X1 = 394.5, 490.0
PAD = 3.0

# Numery operacji -> (strona, y srodka numeru) - do przypisania do wiersza.
ROWS = {
    "5": (0, 173), "10": (0, 243), "15": (0, 312), "20": (0, 405),
    "25": (0, 520), "30": (0, 601), "35": (0, 694),
    "40": (1, 55), "45": (1, 116), "50": (1, 174), "55": (1, 244), "60": (1, 325),
}

# Stanowisko (model maszyny). Operacje 40/45/50/55 - nazwa stanowiska (poza katalogiem).
STANOWISKO = {
    "5":  "BFO\nPrzecinarka taśmowa\nautomatyczna BEE 250",
    "10": "JAFO\nFrezarka uniwersalna\nwspornikowa FWF-32J2",
    "15": "CHOFUM\nTokarka uchwytowa\nTZC-32N1",
    "20": "CHOFUM\nTokarka uchwytowa\nTZC-32N1",
    "25": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(przyrząd do dłutowania\n+ podzielnica)",
    "30": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    "35": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    "40": "Stanowisko hartowania\npłomieniowego",
    "45": "Piec do odpuszczania",
    "50": "Szlifierka do uzębień",
    "55": "Myjnia przemysłowa",
    "60": "IOS\nWspółrzędnościowa\nmaszyna pomiarowa\nMP 700E",
}

# Dopisek narzedzi skrawajacych / oprzyrzadowania w kolumnie "Pomoce warsztatowe".
POMOCE = {
    "5":  "Taśma tnąca bimetalowa\n25×0,9×3950",
    "10": "Frez nasadzany walcowo-\nczołowy NFCb + trzpień",
    "15": "Nóż tokarski składany do\ntoczenia zewn. (PAFANA,\nsyst. P) + imak TZC-32N1",
    "20": "Wiertło kręte NWKc;\nnóż wytaczak składany\n(PAFANA, tocz. wewn.);\nrozwiertak masz. NRTc",
    "25": "Nóż dłutowniczy do\nrowka wpustowego",
    "30": "Frez modułowy krążkowy\nNFMb + trzpień frezarski",
    "35": "Wiertło kręte NWKa; frez\ntrzpieniowy NFPb;\npogłębiacz stożkowy NWSa",
}

STAN_FS, POM_FS, LH = 6.2, 5.6, 1.18


def hlines(page, xmid):
    """Wartosci y poziomych linii tabeli przecinajacych dana kolumne (xmid)."""
    ys = []
    for d in page.get_drawings():
        for it in d["items"]:
            if it[0] == "l":
                a, b = it[1], it[2]
                if abs(a.y - b.y) < 0.6 and min(a.x, b.x) - 1 <= xmid <= max(a.x, b.x) + 1 \
                        and abs(a.x - b.x) > 60:
                    ys.append(round((a.y + b.y) / 2, 1))
            elif it[0] == "re":
                r = it[1]
                if r.x0 - 1 <= xmid <= r.x1 + 1 and (r.x1 - r.x0) > 60:
                    ys += [round(r.y0, 1), round(r.y1, 1)]
    ys = sorted(ys)
    out = []
    for y in ys:
        if not out or y - out[-1] > 2.0:
            out.append(y)
    return out


def cell_bounds(seps, ymid):
    top = max((y for y in seps if y < ymid), default=ymid - 20)
    bot = min((y for y in seps if y > ymid), default=ymid + 20)
    return top, bot


def text_used_height(text, width, fontsize):
    tmp = fitz.open()
    pg = tmp.new_page(width=width + 20, height=3000)
    pg.insert_font(fontname=FNAME, fontfile=FONT)
    free = pg.insert_textbox(fitz.Rect(0, 0, width, 3000), text,
                             fontname=FNAME, fontsize=fontsize, lineheight=LH)
    tmp.close()
    return 3000 - free


def pomoce_text_bottom(page, top, bot):
    """Dolna krawedz juz wpisanych przyrzadow w komorce 'Pomoce'."""
    maxy = top
    for w in page.get_text("words"):
        if 388.0 <= w[0] <= POM_X1 and top + 1 <= w[1] < bot - 1:
            maxy = max(maxy, w[3])
    return maxy


def full_row_bounds(seps, ymid_list, ymid):
    """Pelny wiersz operacji (od linii nad numerem do linii nad nastepna operacja)."""
    top = max((y for y in seps if y < ymid), default=ymid - 20)
    nexts = [m for m in ymid_list if m > ymid]
    if nexts:
        bot = max((y for y in seps if y < min(nexts)), default=max(seps))
    else:
        bot = max((y for y in seps if y > ymid), default=ymid + 20)
    return top, bot


def main():
    doc = fitz.open(SRC)
    for page in doc:
        page.insert_font(fontname=FNAME, fontfile=FONT)

    seps = {p: hlines(doc[p], (STAN_X0 + STAN_X1) / 2) for p in range(doc.page_count)}

    # --- Kolumna STANOWISKO: tekst wysrodkowany w komorce ---
    width = STAN_X1 - STAN_X0 - 2 * PAD
    for op, text in STANOWISKO.items():
        pno, ymid = ROWS[op]
        page = doc[pno]
        top, bot = cell_bounds(seps[pno], ymid)
        used = text_used_height(text, width, STAN_FS)
        y0 = top + max(PAD, (bot - top - used) / 2)
        page.insert_textbox(
            fitz.Rect(STAN_X0 + PAD, y0, STAN_X1 - PAD, bot - PAD + 1), text,
            fontname=FNAME, fontsize=STAN_FS, align=fitz.TEXT_ALIGN_CENTER, lineheight=LH,
        )

    # --- Kolumna POMOCE: narzedzia skrawajace w dolnej, wolnej czesci wiersza ---
    pwidth = POM_X1 - POM_X0 - 2 * PAD
    ymids_by_page = {}
    for o, (pp, ym) in ROWS.items():
        ymids_by_page.setdefault(pp, []).append(ym)
    for op, text in POMOCE.items():
        pno, ymid = ROWS[op]
        page = doc[pno]
        top, bot = full_row_bounds(seps[pno], ymids_by_page[pno], ymid)
        meas_bot = pomoce_text_bottom(page, top, bot)
        used = text_used_height(text, pwidth, POM_FS)
        # dol wiersza (pusty pasek), ale nigdy ponad juz wpisane przyrzady pomiarowe
        y0 = max(meas_bot + 5, bot - PAD - used)
        page.insert_textbox(
            fitz.Rect(POM_X0 + PAD, y0, POM_X1 - PAD, bot - PAD + 1), text,
            fontname=FNAME, fontsize=POM_FS, align=fitz.TEXT_ALIGN_LEFT, lineheight=LH,
        )

    doc.save(DST, deflate=True)
    print("Zapisano:", DST)


if __name__ == "__main__":
    main()
