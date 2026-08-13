#!/usr/bin/env python3
"""Poprawa kolumny 'Stanowisko' w karcie zad12bV2.

Zmienia WYLACZNIE operacje, ktore wymagaja maszyny specjalnej (a nie frezarki
z przystawka):
  * op 25  - dlutowanie rowka wpustowego -> Dlutownica (maszyna dedykowana),
  * op 30  - frezowanie obwiedniowe uzebienia -> Frezarka obwiedniowa do uzebien.
Pozostale komorki pozostaja bez zmian (zamalowanie + nadpisanie tylko 2 pol).
"""
import fitz

SRC = "zad12bV2_oryginal.pdf"
DST = "karta_technologiczna_zad12bV2_poprawiona.pdf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FNAME = "dejavu"

STAN_X0, STAN_X1 = 83.0, 163.8
PAD = 3.0
FS, LH = 7.2, 1.15

# (strona, gora podpasma, dol podpasma, tekst zamalowania, nowy tekst)
ZMIANY = [
    (0, 429.9, 477.4, "Dłutownica"),
    (0, 499.9, 538.2, "Frezarka\nobwiedniowa\ndo uzębień"),
]


def text_used_height(text, width, fontsize):
    tmp = fitz.open()
    pg = tmp.new_page(width=width + 20, height=3000)
    pg.insert_font(fontname=FNAME, fontfile=FONT)
    free = pg.insert_textbox(fitz.Rect(0, 0, width, 3000), text,
                             fontname=FNAME, fontsize=fontsize, lineheight=LH)
    tmp.close()
    return 3000 - free


def main():
    doc = fitz.open(SRC)
    for page in doc:
        page.insert_font(fontname=FNAME, fontfile=FONT)
    width = STAN_X1 - STAN_X0 - 2 * PAD
    for pno, top, bot, text in ZMIANY:
        page = doc[pno]
        # zamalowanie starego wpisu (bez naruszania linii tabeli)
        page.draw_rect(fitz.Rect(STAN_X0 + 1.0, top + 0.6, STAN_X1 - 1.0, bot - 0.5),
                       color=None, fill=(1, 1, 1))
        # nowy wpis - wysrodkowany w komorce
        used = text_used_height(text, width, FS)
        y0 = top + max(PAD, (bot - top - used) / 2)
        page.insert_textbox(
            fitz.Rect(STAN_X0 + PAD, y0, STAN_X1 - PAD, bot - PAD + 1), text,
            fontname=FNAME, fontsize=FS, align=fitz.TEXT_ALIGN_CENTER, lineheight=LH,
        )
    doc.save(DST, deflate=True)
    print("Zapisano:", DST)


if __name__ == "__main__":
    main()
