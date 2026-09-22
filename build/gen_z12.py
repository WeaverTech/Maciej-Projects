# -*- coding: utf-8 -*-
import os
from common import DocMaker
from reportlab.lib.units import mm
B = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(B, "..", "Zadanie_12")
os.makedirs(OUT, exist_ok=True)

# =====================================================================
# ZADANIE 12a — NADDATKI + RYSUNEK WYKONAWCZY POLFABRYKATU
# =====================================================================
d = DocMaker(os.path.join(OUT, "Zadanie_12a_naddatki_i_rysunek.pdf"),
             "Zadanie 12a — Naddatki obróbkowe i rysunek wykonawczy półfabrykatu",
             "Część: koło zębate (m0=3,5; z=51). Wariant wybrany (Zad. 11): półfabrykat — "
             "krążek z pręta walcowanego Ø200; materiał ulepszalny (C45/41Cr4).",
             footer="Zadanie 12a")
d.title_block()

d.h1("12a.1. Film instruktażowy")
d.p("Treść materiału filmowego (zasady doboru naddatków obróbkowych) wykorzystano w punkcie 12a.2.")

d.h1("12a.2. Naddatki obróbkowe na przedmiot obrabiany")
d.p("Naddatek obróbkowy to warstwa materiału usuwana w obróbce, aby z półfabrykatu uzyskać wymiar "
    "gotowy w wymaganej dokładności i chropowatości. Naddatek całkowity dzieli się na naddatki "
    "międzyoperacyjne (na kolejne zabiegi: zgrubny → średnio dokładny → wykańczający → szlifowanie). "
    "Wartości przyjęto na podstawie normatywów technologicznych (Poradnik technologa; tablice naddatków "
    "dla toczenia, wytaczania i szlifowania) oraz tolerancji walcowanego pręta (PN-EN 10060).")

d.h2("a) Naddatki całkowite (od półfabrykatu Ø200 do części gotowej)")
d.table([
 ["Powierzchnia","Wymiar gotowy","Wymiar półfabrykatu","Naddatek na stronę","Uwaga"],
 ["Walcowa zewn. (wierzchołkowa da)","Ø185,5","Ø200 (pręt h12)","7,25 mm","duży — wada pręta"],
 ["Powierzchnie czołowe (2×)","45 (szerokość)","49","2,0 mm / czoło","planowanie"],
 ["Otwór piasty","Ø35 H9","z pełnego (Ø0)","—","wiercenie + wytaczanie"],
 ["Piasta zewn.","Ø59,5","z materiału","—","wytaczanie czołowe wcięć"],
 ["Boki zębów (po hartowaniu)","wg PN-ISO 1328 kl.8","po frez. obwiedniowym","0,15 mm / bok","naddatek na szlifowanie"],
], [44*mm,28*mm,32*mm,26*mm,28*mm], font=7.9, body_align="LEFT")

d.h2("b) Naddatki międzyoperacyjne — powierzchnia walcowa zewnętrzna (Ø185,5)")
d.table([
 ["Zabieg","Obrabiarka","Wymiar po zabiegu","Naddatek usuwany (na stronę)","Klasa IT / Ra"],
 ["Pręt (półfabrykat)","—","Ø200 h12","—","IT12 / Ra 25"],
 ["Toczenie zgrubne (ZO5)","TUJ-50M","Ø188,5","5,75 mm","IT12 / Ra 12,5"],
 ["Toczenie średnio dokł. (ZO6)","TKX 50NS1","Ø186,1","1,2 mm","IT10 / Ra 6,3"],
 ["Toczenie wykańczające (ZO6)","TKX 50NS1","Ø185,5","0,3 mm","IT9 / Ra 3,2"],
], [40*mm,26*mm,30*mm,34*mm,28*mm], font=7.9, body_align="LEFT")

d.h2("c) Naddatki międzyoperacyjne — otwór piasty Ø35 H9")
d.table([
 ["Zabieg","Obrabiarka","Wymiar po zabiegu","Naddatek (na średnicy)","Klasa IT / Ra"],
 ["Wiercenie z pełnego (ZO7)","tokarka NC / wiertarka","Ø33","Ø33","IT12 / Ra 12,5"],
 ["Wytaczanie średnio dokł. (ZO8)","TKX 50NS1","Ø34,5","1,5 mm","IT10 / Ra 6,3"],
 ["Wytaczanie wykańczające (ZO9)","TKX 50NS1","Ø35 H9","0,5 mm","IT9 / Ra 1,25"],
], [40*mm,30*mm,30*mm,30*mm,28*mm], font=7.9, body_align="LEFT")

d.h2("d) Naddatki międzyoperacyjne — powierzchnie czołowe (szer. 45)")
d.table([
 ["Zabieg","Obrabiarka","Wymiar po zabiegu","Naddatek (na stronę)","Klasa IT / Ra"],
 ["Krążek (po cięciu)","BEE-250","49","—","IT14 / Ra 25"],
 ["Planowanie zgrubne (ZO4)","TUJ-50M","46","1,5 mm / czoło","IT12 / Ra 12,5"],
 ["Planowanie średnio dokł. (ZO6)","TKX 50NS1","45","0,5 mm / czoło","IT10 / Ra 2,5"],
], [40*mm,28*mm,30*mm,32*mm,28*mm], font=7.9, body_align="LEFT")

d.note("<b>Uwaga (zasady obróbki skrawaniem):</b> kolejność zabiegów zgrubny→wykańczający zapewnia "
       "stopniową poprawę dokładności i chropowatości oraz odprężenie naprężeń po obróbce zgrubnej. "
       "Uzębienie frezuje się obwiedniowo z naddatkiem 0,15 mm/bok, a po hartowaniu indukcyjnym "
       "szlifuje na gotowo (usuwa odkształcenia hartownicze i naddatek). Bardzo duży naddatek na "
       "średnicy (7,25 mm) potwierdza, że dla serii korzystniejsza jest odkuwka matrycowa.")

d.pagebreak()
d.h1("12a.3. Rysunek wykonawczy półfabrykatu")
d.p("Rysunek wykonawczy wybranego półfabrykatu (krążek z pręta walcowanego Ø200) z naniesionymi "
    "naddatkami, tolerancjami i zarysem części gotowej (linia przerywana).")
d.image(os.path.join(B,"fig_rys_pret_wykonawczy.png"), 175)
d.small("Pełnowymiarowy rysunek w formacie A3 — patrz plik graficzny. Materiał wg rysunku: S235; "
        "do hartowania uzębienia przyjęto stal ulepszalną C45/41Cr4 (p. Zad. 10).")
d.build()
print("ZADANIE 12a — gotowe")

# =====================================================================
# ZADANIE 12b — GRUPOWANIE, KARTA TECHNOLOGICZNA, OPRZYRZADOWANIE, OBRABIARKI
# =====================================================================
d2 = DocMaker(os.path.join(OUT, "Zadanie_12b_operacje_karta.pdf"),
              "Zadanie 12b — Operacje technologiczne, karta i dobór obrabiarek",
              "Część: koło zębate (m0=3,5; z=51). Grupowanie zabiegów w operacje, karta "
              "technologiczna, dobór oprzyrządowania i obrabiarek (wariant: pręt walcowany).",
              footer="Zadanie 12b")
d2.title_block()

d2.h1("12b.1. Grupowanie zabiegów w operacje technologiczne")
d2.p("Zabiegi obróbkowe (ZO) z wybranego wariantu pogrupowano w operacje technologiczne (Op.05…Op.45) "
     "na strukturze stopniowo-fazowej. Kryterium grupowania: ta sama obrabiarka i to samo zamocowanie "
     "(zasada koncentracji zabiegów — minimalizacja liczby zamocowań i błędów ustawienia). Numeracja "
     "operacji co 5 (wg PN-N-01225).")
d2.landscape_image(os.path.join(B,"fig_grupowanie.png"), 255,
        "Rys. 12.1. Struktura stopniowo-fazowa z pogrupowaniem zabiegów w operacje (wariant PF3).")
d2.table([
 ["Operacja","Zabiegi (ZO)","Zamocowanie / zasada"],
 ["Op.05 Przecinanie","ZO3","pręt w imadle przecinarki"],
 ["Op.10 Toczenie zgrubne","ZO4, ZO5","uchwyt 3-szcz. — mocowanie I"],
 ["Op.15 Toczenie kształtujące i wykańczające","ZO6, ZO7, ZO8, ZO9, ZO15, ZO16","uchwyt 3-szcz. — przewrócenie; koncentracja zabiegów na tokarce NC"],
 ["Op.20 Dłutowanie rowka","ZO10, ZO11","trzpień / przyrząd do rowka"],
 ["Op.25 Frezowanie uzębienia","ZO12, ZO13","trzpień frezarski + przyrząd podziałowy"],
 ["Op.30 Wiercenie otworów","ZO14","przyrząd wiertarski z płytą podziałową"],
 ["Op.35 Obróbka cieplna","ZO17, ZO19","wzbudnik / piec"],
 ["Op.40 Szlifowanie uzębienia","ZO20","trzpień + kły"],
 ["Op.45 Mycie i kontrola","ZO21, ZO22","stanowisko pomiarowe"],
], [50*mm,52*mm,63*mm], font=8.0, body_align="LEFT")

d2.pagebreak()
d2.h1("12b.2. Karta technologiczna i dobór oprzyrządowania przedmiotowego")
d2.p("Karta technologiczna procesu obróbki koła zębatego (wariant: pręt walcowany Ø200). Dla każdej "
     "operacji dobrano obrabiarkę, oprzyrządowanie (uchwyt/przyrząd) oraz narzędzia.")
karta = [
 ["Nr op.","Nazwa operacji","Obrabiarka / stanowisko","Oprzyrządowanie przedmiotowe","Narzędzia"],
 ["05","Przecinanie pręta na krążki","Przecinarka taśmowa BEE-250","Imadło hydrauliczne, zderzak długości","Piła taśmowa 25×0,9"],
 ["10","Toczenie zgrubne (planowanie czoła, Ø zewn.)","Tokarka uniw. kłowa TUJ-50M","Uchwyt 3-szczękowy samocentrujący","Nóż tokarski składany (CNMG), nóż czołowy"],
 ["15","Toczenie kształtujące/wykańczające: czoła, Ø, piasta, otwór Ø35H9, wcięcia, fazy","Tokarka NC kłowa TKX 50NS1","Uchwyt 3-szcz. szczęki miękkie, kieł obrotowy","Noże tokarskie i do wytaczania, wiertło Ø33, nóż do faz"],
 ["20","Dłutowanie rowka wpustowego 10 JS9","Dłutownica pionowa (poza wykazem)","Przyrząd do dłutowania, trzpień Ø35","Nóż dłutowniczy b=10"],
 ["25","Frezowanie obwiedniowe uzębienia m=3,5; z=51","Frezarka obwiedniowa (poza wykazem)","Trzpień frezarski + przyrząd podziałowy","Frez ślimakowy (obwiedniowy) m=3,5; α=20°"],
 ["30","Wiercenie 6×Ø24 (otwory odciążające)","Centrum CNC Arrow 500","Przyrząd wiertarski z płytą podziałową (6×)","Wiertło kręte Ø24"],
 ["35","Hartowanie indukcyjne uzębienia + odpuszczanie","Hartownica indukcyjna + piec","Wzbudnik dopasowany do uzębienia","—"],
 ["40","Szlifowanie uzębienia na gotowo","Szlifierka do uzębień (poza wykazem)","Trzpień + kły","Ściernica profilowa/tarczowa"],
 ["45","Mycie i kontrola końcowa","Myjnia + stanowisko pomiarowe / WMP","Przyrząd kontrolny, sprawdziany","Mikrometr, średnicówka, wałeczki pomiarowe"],
]
d2.table(karta, [11*mm,44*mm,33*mm,38*mm,34*mm], font=7.2, body_align="LEFT",
         align=[(0,0,0,-1,"CENTER")])
d2.note("<b>Zasady doboru oprzyrządowania:</b> część tarczowa mocowana w <b>uchwycie 3-szczękowym "
        "samocentrującym</b> (bazowanie na powierzchni walcowej i czole). Po wykonaniu otworu Ø35H9 "
        "kolejne operacje (uzębienie, szlifowanie) bazują na <b>otworze i czole</b> (trzpień), co "
        "zapewnia zachowanie współosiowości uzębienia z otworem (baza obróbkowa = baza konstrukcyjna).")

d2.pagebreak()
d2.h1("12b.3. Dobór obrabiarek do operacji obróbki skrawaniem")
d2.p("Obrabiarki dobrano z udostępnionego wykazu na podstawie wymiarów części (Ø185,5 × 45; otwór "
     "Ø35) i mocy. Poniżej zestawienie wraz z parametrami decydującymi o wyborze.")
d2.table([
 ["Operacja","Obrabiarka (wykaz)","Parametr decydujący","Sprawdzenie"],
 ["Op.05 Przecinanie","Przecinarka taśmowa BEE-250","max Ø cięcia Ø250","Ø200 < Ø250 — OK"],
 ["Op.10 Toczenie zgrubne","Tokarka TUJ-50M","Ø nad suportem Ø370; 11 kW","Ø185,5 < Ø370 — OK"],
 ["Op.15 Toczenie kszt./wykańcz.","Tokarka NC TKX 50NS1","Ø nad suportem Ø250; 17 kW; głow. 8","Ø185,5 < Ø250 — OK"],
 ["Op.30 Wiercenie 6×Ø24","Centrum CNC Arrow 500","stół 520×700; ISO 40; 6000 obr/min","podziałka Ø99,8 — OK"],
 ["Op.20 Dłutowanie rowka","dłutownica (poza wykazem)","brak w wykazie","do uzupełnienia"],
 ["Op.25 Frez. uzębienia","frezarka obwiedniowa (poza wykazem)","brak w wykazie","do uzupełnienia"],
 ["Op.40 Szlif. uzębienia","szlifierka do uzębień (poza wykazem)","w wykazie tylko szlif. do wałków","do uzupełnienia"],
], [40*mm,42*mm,42*mm,30*mm], font=7.7, body_align="LEFT")
d2.p("Pełne dane techniczne (screeny) maszyn z wykazu zestawiono w opracowaniu Zadania 11 "
     "(rozdział „Parametry techniczne dobranych obrabiarek z wykazu”).")
d2.note("<b>Wniosek końcowy (zgodność z zasadami obróbki skrawaniem):</b> proces jest spójny — "
        "kolejność zgrubna→wykańczająca, obróbka uzębienia przed hartowaniem i szlifowanie po "
        "hartowaniu, koncentracja zabiegów na tokarce NC, bazowanie na otworze i czole. Maszyny do "
        "uzębienia, rowka i szlifowania uzębień należy dobrać spoza udostępnionego wykazu "
        "(obwiedniówka, dłutownica, szlifierka do kół zębatych), gdyż wykaz ich nie zawiera.", ok=True)
d2.build()
print("ZADANIE 12b — gotowe")
