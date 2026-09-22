# -*- coding: utf-8 -*-
import os
from common import DocMaker
from reportlab.lib.units import mm
B = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(B, "..", "Zadanie_11")
os.makedirs(OUT, exist_ok=True)

d = DocMaker(os.path.join(OUT, "Zadanie_11_opracowanie.pdf"),
             "Zadanie 11 — Wybór wariantu procesu i dobór obrabiarek",
             "Część: koło zębate (m0=3,5; z=51). Wybór jednego wariantu procesu technologicznego "
             "oraz dobór rodzaju obrabiarek (stanowisk) do poszczególnych zabiegów.",
             footer="Zadanie 11")
d.title_block()

d.h1("11.1. Film instruktażowy")
d.p("Treść materiału filmowego (warianty procesów obróbki, kryteria wyboru) wykorzystano przy wyborze "
    "wariantu procesu i doborze obrabiarek (punkty 11.2 i 11.3).")

d.h1("11.2. Wybór wariantu procesu technologicznego")
d.p("Struktura 9-fazowa (Zadanie 10) zawiera trzy drogi technologiczne odpowiadające trzem "
    "półfabrykatom (PF1 — odkuwka matrycowa, PF2 — odkuwka swobodna, PF3 — pręt walcowany). "
    "Do dalszej realizacji wybrano <b>jeden</b> wariant.")
d.h2("Wariant wybrany: PF3 — pręt walcowany; hartowanie indukcyjne uzębienia")
d.p("Uzasadnienie wyboru:")
d.bullets([
    "<b>Wielkość serii</b> — dla produkcji jednostkowej/małoseryjnej (typowej dla zadania "
    "projektowego) nie opłaca się kosztownej matrycy; krążek z pręta walcowanego jest najtańszym "
    "i najszybciej dostępnym półfabrykatem.",
    "<b>Dostępny park maszynowy</b> — wykaz obrabiarek obejmuje przecinarki, nakiełczarki, tokarki, "
    "frezarki/centra i szlifierki, czyli komplet maszyn potrzebnych dla procesu opartego na pręcie "
    "(cięcie pręta → toczenie → obróbka otworu i uzębienia).",
    "<b>Hartowanie indukcyjne</b> zamiast ogniowego (ZO17 zamiast ZO18) — nagrzewanie selektywne tylko "
    "uzębienia, mała strefa wpływu ciepła, małe odkształcenia, powtarzalność i łatwa automatyzacja; "
    "to współczesny standard utwardzania uzębień. Z dwóch wariantów hartowania w strukturze wybrano "
    "jeden — indukcyjny.",
])
d.note("Dla produkcji <b>seryjnej</b> korzystniejszy byłby wariant <b>PF1 — odkuwka matrycowa</b> "
       "(mniejszy naddatek, lepszy przebieg włókien, krótszy czas obróbki) — patrz Zadanie 10. "
       "Niezależnie od wyboru półfabrykatu materiał musi być stalą ulepszalną (C45/41Cr4), bo wymagane "
       "jest hartowanie uzębienia i twardość 290–300 HB (S235 z rysunku jest błędna).")
d.landscape_image(os.path.join(B,"fig_grupowanie.png"), 255,
        "Rys. 11.1. Wybrany wariant (PF3) zaznaczony na strukturze; węzły szare — droga niewybrana.")

d.h1("11.3. Dobór rodzaju obrabiarki (stanowiska) do zadań obróbkowych")
d.p("Dla wybranego wariantu (pręt walcowany) zestawiono zadania obróbkowe i dobrane obrabiarki. "
    "Tam, gdzie to możliwe, wskazano konkretną maszynę z udostępnionego wykazu obrabiarek; zabiegi "
    "specjalistyczne (uzębienie, rowek, obróbka cieplna), dla których w wykazie brak maszyny, oznaczono "
    "„poza wykazem” z podaniem właściwego typu obrabiarki.")
hdr = ["Nr","Nazwa zadania (zabieg)","Rodzaj obrabiarki (stanowiska)","Maszyna z wykazu"]
rows = [hdr,
 ["1","Przecinać pręt Ø200 na krążki (ZO3)","przecinarka taśmowa","BEE-250 (max Ø250)"],
 ["2","Planować zgrubnie powierzchnie czołowe (ZO4)","tokarka uniwersalna kłowa","TUJ-50M"],
 ["3","Toczyć zgrubnie powierzchnię walcową Ø (ZO5)","tokarka uniwersalna kłowa","TUJ-50M"],
 ["4","Toczyć średnio dokł. pow. walc., czoła, piastę (ZO6)","tokarka NC kłowa","TKX 50NS1"],
 ["5","Wiercić otwór piasty z pełnego (ZO7)","wiertarka prom. / tokarka NC","poza wykazem / TKX 50NS1"],
 ["6","Wytaczać otwór Ø35 H9 — śr.dokł. + wykańcz. (ZO8, ZO9)","tokarka NC kłowa","TKX 50NS1"],
 ["7","Toczyć powierzchnie odciążające — wcięcia (ZO15)","tokarka NC kłowa","TKX 50NS1"],
 ["8","Toczyć fazy 0,875×45° (ZO16)","tokarka NC kłowa","TKX 50NS1"],
 ["9","Dłutować rowek wpustowy 10 JS9 (ZO10, ZO11)","dłutownica pionowa do rowków","poza wykazem"],
 ["10","Frezować obwiedniowo uzębienie m=3,5; z=51 (ZO12, ZO13)","frezarka obwiedniowa","poza wykazem"],
 ["11","Wiercić 6×Ø24 (otwory odciążające) (ZO14)","pionowe centrum obróbkowe CNC","Arrow 500 / FYM 63NMS"],
 ["12","Hartować indukcyjnie uzębienie (ZO17)","hartownica indukcyjna","poza wykazem (stan. OC)"],
 ["13","Odpuszczać (ZO19)","piec do odpuszczania","poza wykazem (stan. OC)"],
 ["14","Szlifować uzębienie (ZO20)","szlifierka do uzębień (kół zębatych)","poza wykazem"],
 ["15","Myć / czyścić (ZO21)","myjnia przemysłowa","poza wykazem"],
 ["16","Kontrolować wymiary (ZO22)","stanowisko pomiarowe / WMP","poza wykazem"],
]
d.table(rows, [8*mm,68*mm,55*mm,38*mm], font=7.7, body_align="LEFT",
        align=[(0,0,0,-1,"CENTER")])
d.note("<b>Uwagi do doboru (zasady obróbki skrawaniem):</b> część jest tarczą (D ≫ L) mocowaną w "
       "<b>uchwycie 3-szczękowym</b>, dlatego powierzchnie czołowe i walcowe obrabia się <b>toczeniem "
       "(planowaniem)</b>, a nie frezowaniem; w strukturze zabieg „frezowanie czół” zrealizowano jako "
       "planowanie na tokarce. Centrowanie (ZO2) pominięto — dla tarczy nie stosuje się obróbki w kłach, "
       "a średnica Ø200 i tak przekracza zakres nakiełczarek z wykazu (NPF-120N: do Ø130).")

d.pagebreak()
d.h1("Parametry techniczne dobranych obrabiarek z wykazu")
d.p("Zestawienie parametrów maszyn, na podstawie których dokonano wyboru (wykaz obrabiarek).")
d.h3("BEE-250 — przecinarka taśmowa (Bielska Fabryka Obrabiarek)")
d.table([["Parametr","Wartość"],
 ["Max średnica cięcia","Ø250 mm → wystarcza dla pręta Ø200"],
 ["Wymiar taśmy tnącej","25 × 0,9 × 3950 mm"],
 ["Prędkość skrawania taśmy","25 ÷ 125 m/min"],
 ["Moc / imadło / posuw","1,9 kW / hydrauliczne / hydrauliczny"]],
 [55*mm,110*mm], font=8.2, body_align="LEFT")
d.h3("TUJ-50M — tokarka uniwersalna kłowa (ZM Tarnów)")
d.table([["Parametr","Wartość"],
 ["Max Ø toczenia nad suportem / nad łożem","Ø370 / Ø560 mm → tarcza Ø185,5 mieści się"],
 ["Max długość toczenia w kłach","2000 mm"],
 ["Prędkość obrotowa wrzeciona","20 ÷ 1600 obr/min (stopniowa)"],
 ["Moc / liczba gniazd imaka / nóż","11 kW / 4 / 25×25 mm"]],
 [62*mm,103*mm], font=8.2, body_align="LEFT")
d.h3("TKX 50NS1 — tokarka NC kłowa")
d.table([["Parametr","Wartość"],
 ["Max Ø toczenia nad suportem / nad łożem","Ø250 / Ø280 mm"],
 ["Prędkość obrotowa wrzeciona","56 ÷ 1800 obr/min (bezstopniowa)"],
 ["Moc / głowica narzędziowa","17 kW / 8-pozycyjna"],
 ["Posuw roboczy / szybki","0 ÷ 1000 / 6000 mm/min"]],
 [62*mm,103*mm], font=8.2, body_align="LEFT")
d.h3("Arrow 500 — pionowe centrum obróbkowe CNC (Cincinnati Milacron)")
d.table([["Parametr","Wartość"],
 ["Powierzchnia robocza stołu","520 × 700 mm"],
 ["Przesuwy X / Y / Z","510 / 510 / 510 mm"],
 ["Prędkość obrotowa wrzeciona / gniazdo","60 ÷ 6000 obr/min / ISO 40"],
 ["Moc / posuw szybki","5,5 kW / 24000 mm/min"]],
 [62*mm,103*mm], font=8.2, body_align="LEFT")
d.small("Screeny maszyn oraz pełne dane techniczne — zgodnie z udostępnionym wykazem obrabiarek "
        "(WYKAZ OBRABIAREK, oprac. dr inż. M. Kwatera, mgr inż. D. Warżołek).")
d.build()
print("ZADANIE 11 — gotowe")
