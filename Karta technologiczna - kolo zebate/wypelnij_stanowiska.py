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
    "15": "CHOFUM\nCentrum tokarskie\nCT-32N",
    "20": "CHOFUM\nCentrum tokarskie\nCT-32N",
    "25": "JAFO\nFrezarka uniwersalna\nFWF-32J2 (przyrząd\ndo dłutowania +\npodzielnica)",
    "30": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    "35": "JAFO\nFrezarka uniwersalna\nFWF-32J2\n(podzielnica)",
    # Operacje poza zakresem katalogu obrabiarek skrawających:
    "40": "Brak w katalogu\n(stanowisko\nhartowania\npłomieniowego)",
    "45": "Brak w katalogu\n(piec do\nodpuszczania)",
    "50": "Brak w katalogu\n(szlifierka do\nuzębień)",
    "55": "Brak w katalogu\n(myjnia\nprzemysłowa)",
    "60": "IOS\nWspółrzędnościowa\nmaszyna pomiarowa\nMP 700E",
}


def main():
    doc = fitz.open(SRC)
    for page in doc:
        page.insert_font(fontname="dejavu", fontfile=FONT)
    for op, text in STANOWISKO.items():
        pno, y0 = ROWS[op]
        page = doc[pno]
        rect = fitz.Rect(COL_X0 + 1.0, y0 - 0.5, COL_X1 - 1.0, y0 + 80)
        page.insert_textbox(
            rect, text, fontname="dejavu", fontsize=6.0,
            align=fitz.TEXT_ALIGN_LEFT, lineheight=1.05,
        )
    doc.save(DST, deflate=True)
    print("Zapisano:", DST)


if __name__ == "__main__":
    main()
