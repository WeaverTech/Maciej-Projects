#!/usr/bin/env python3
"""Uzupelnia kolumne 'Stanowisko' w karcie technologicznej kola zebatego.

Nie zmienia formatki: na oryginalny PDF nanosi wylacznie teksty w pustych
komorkach kolumny 'Stanowisko' (kolumna 2). Dobor obrabiarek wylacznie z
katalogu '9.1.1 Elektroniczny katalog obrabiarek - polskie obrabiarki do metali'.
"""
import fitz  # PyMuPDF

SRC = "karta_technologiczna_oryginal.pdf"
DST = "karta_technologiczna_uzupelniona.pdf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Granice kolumny "Stanowisko" (w punktach), odczytane z geometrii tabeli.
COL_X0, COL_X1 = 79.5, 159.0

# Pozycje (strona, y-gora wiersza operacji) odczytane z numerow operacji.
ROWS = {
    "5":  (0, 166.5),
    "10": (0, 236.2),
    "15": (0, 305.9),
    "20": (0, 398.5),
    "25": (0, 513.8),
    "30": (0, 594.9),
    "35": (0, 687.4),
    "40": (1, 48.5),
    "45": (1, 109.3),
    "50": (1, 167.6),
    "55": (1, 237.3),
    "60": (1, 318.4),
}

# Dobor stanowiska (model maszyny z katalogu) dla kazdej operacji.
STANOWISKO = {
    "5":  "BFO\nPrzecinarka taśmowa\nautomatyczna BEE 250",
    "10": "JAFO\nFrezarka uniwersalna\nwspornikowa FWF-32J2",
    "15": "CHOFUM\nTokarka uchwytowa\nTZC-32N1",
    "20": "CHOFUM\nTokarka uchwytowa\nTZC-32N1",
    "25": "JAFO\nFrezarka uniwersalna\nFWF-32J2 (przyrząd\ndo dłutowania +\npodzielnica)",
    "30": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    "35": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    # Operacje poza zakresem katalogu obrabiarek skrawających:
    "40": "Stanowisko hartowania\npłomieniowego",
    "45": "Piec do odpuszczania",
    "50": "Szlifierka do uzębień",
    "55": "Myjnia przemysłowa",
    "60": "IOS\nWspółrzędnościowa\nmaszyna pomiarowa\nMP 700E",
}


# Kolumna "Pomoce warsztatowe" (x-zakres) oraz dopisywane narzedzia skrawajace
# i oprzyrzadowanie z katalogow narzedziowych (frezy, noze, wiertla, rozwiertaki,
# oprzyrzadowanie). Tekst nanoszony w dolnej, wolnej czesci komorki - pod juz
# wpisanymi przyrzadami pomiarowymi/mocujacymi (formatka bez zmian).
POM_X0, POM_X1 = 396.5, 488.0

# (strona, y-start) - miejsce rozpoczecia dopisku w dolnej czesci komorki.
POM_POS = {
    "5":  (0, 207), "10": (0, 272), "15": (0, 340), "20": (0, 436),
    "25": (0, 557), "30": (0, 626), "35": (0, 724),
}

POMOCE = {
    "5":  "Taśma tnąca bimetalowa\n25×0,9×3950",
    "10": "Frez nasadzany walcowo-\nczołowy NFCb + trzpień",
    "15": "Nóż tokarski składany do\ntoczenia zewn. (PAFANA,\nsyst. P) + imak TZC-32N1",
    "20": "Wiertło kręte NWKc;\nnóż wytaczak składany\n(PAFANA, tocz. wewn.);\nrozwiertak masz. NRTc",
    "25": "Nóż dłutowniczy do rowka\nwpustowego (do przyrządu\ndo dłutowania)",
    "30": "Frez modułowy krążkowy\nNFMb + trzpień frezarski",
    "35": "Wiertło kręte NWKa; frez\ntrzpieniowy NFPb; pogłębiacz\nstożkowy NWSa (fazowanie)",
}


def main():
    doc = fitz.open(SRC)
    for page in doc:
        page.insert_font(fontname="dejavu", fontfile=FONT)
    # Kolumna STANOWISKO
    for op, text in STANOWISKO.items():
        pno, y0 = ROWS[op]
        page = doc[pno]
        rect = fitz.Rect(COL_X0 + 1.0, y0 - 0.5, COL_X1 - 1.0, y0 + 80)
        page.insert_textbox(
            rect, text, fontname="dejavu", fontsize=6.0,
            align=fitz.TEXT_ALIGN_LEFT, lineheight=1.05,
        )
    # Kolumna POMOCE WARSZTATOWE - dopisek narzedzi skrawajacych
    for op, text in POMOCE.items():
        pno, ys = POM_POS[op]
        page = doc[pno]
        rect = fitz.Rect(POM_X0, ys, POM_X1, ys + 60)
        page.insert_textbox(
            rect, text, fontname="dejavu", fontsize=5.5,
            align=fitz.TEXT_ALIGN_LEFT, lineheight=1.05,
        )
    doc.save(DST, deflate=True)
    print("Zapisano:", DST)


if __name__ == "__main__":
    main()
