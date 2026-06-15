# -*- coding: utf-8 -*-
import os
from common import DocMaker
B = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(B, "..", "Zadanie_10")
os.makedirs(OUT, exist_ok=True)
from reportlab.lib.units import mm

# =====================================================================
# DOK. 1 — OPRACOWANIE ZADANIA 10
# =====================================================================
d = DocMaker(os.path.join(OUT, "Zadanie_10_opracowanie.pdf"),
             "Zadanie 10 — Półfabrykaty, materiał, struktura 9-fazowa",
             "Część: koło zębate walcowe o zębach prostych (m₀=3,5; z=51; α=20°). "
             "Materiał wg rysunku: S235. Rysunek wykonawczy nr 6 (A. Powrózek).",
             footer="Zadanie 10 — opracowanie")
d.title_block()

# --- 10.1 ---
d.h1("10.1. Wiedza o półfabrykatach na klasę części, której dotyczy rysunek")
d.p("Przedmiotem rysunku wykonawczego jest <b>koło zębate walcowe</b> o zębach prostych. Część należy "
    "do klasy <b>kół i tarcz</b> (części obrotowe o stosunku długości do średnicy L/D &lt; 1; tu "
    "L/D = 45/185,5 ≈ 0,24). Dla tej klasy części stosuje się następujące rodzaje półfabrykatów:")
d.bullets([
    "<b>Odkuwki matrycowe</b> — podstawowy półfabrykat kół zębatych obciążonych. Zapewniają korzystny, "
    "nieprzecięty przebieg włókien zgodny z zarysem koła, zagęszczenie struktury i wysokie własności "
    "mechaniczne. Ekonomiczne dla produkcji seryjnej i wielkoseryjnej (niski naddatek, mało odpadu).",
    "<b>Odkuwki swobodne (kute na kowadle/pod młotem)</b> — dla produkcji jednostkowej i małoseryjnej "
    "oraz dużych kół; prostsze kształty, duże naddatki, niższa dokładność, brak kosztu matrycy.",
    "<b>Pręty walcowane (krążki cięte z pręta)</b> — dla małych kół i małych serii; krążek odcina się "
    "z pręta okrągłego. Duży naddatek na całym obwodzie i konieczność wykonania otworu z pełnego — "
    "duże zużycie materiału i czasu obróbki.",
    "<b>Odlewy (staliwo, żeliwo sferoidalne)</b> — dla dużych, mniej obciążonych kół oraz kół o złożonym "
    "kształcie tarczy/piasty.",
    "<b>Konstrukcje spawane/zgrzewane</b> (wieniec + tarcza + piasta) — dla bardzo dużych kół, gdy odkucie "
    "w całości jest nieopłacalne.",
])
d.p("<b>Kryteria doboru półfabrykatu:</b> wielkość serii produkcyjnej, materiał i jego kowalność/lejność, "
    "wymiary i masa części, wymagania wytrzymałościowe i dokładnościowe, współczynnik wykorzystania "
    "materiału oraz koszt jednostkowy (w tym koszt oprzyrządowania — matryc).")
d.note("<b>Wniosek doborowy:</b> dla koła zębatego z hartowanym uzębieniem i wymaganą twardością wg rysunku, "
       "produkowanego seryjnie, najwłaściwszym półfabrykatem jest <b>odkuwka matrycowa (PF1)</b>. Dla małej "
       "serii dopuszczalna jest <b>odkuwka swobodna (PF2)</b> lub <b>krążek z pręta walcowanego (PF3)</b>. "
       "Strukturę 9-fazową opracowano dla wszystkich trzech (pkt 10.4).")

# --- 10.2 ---
d.h2("10.2. Film instruktażowy")
d.p("Treść materiału filmowego wskazanego w poleceniu (technologia kucia matrycowego / wytwarzania "
    "półfabrykatów) została uwzględniona w doborze i opisie półfabrykatów powyżej.")

# --- 10.3 materiał ---
d.h1("10.3. Materiał części — skład chemiczny i własności mechaniczne")
d.h2("Materiał wg rysunku wykonawczego: S235 (S235JR, PN-EN 10025-2, nr 1.0038)")
d.p("Na rysunku wykonawczym, w tabliczce „Materiał”, podano <b>S235</b>. Jest to niestopowa stal "
    "konstrukcyjna ogólnego przeznaczenia. Pełne oznaczenie gatunku w odmianie podstawowej: "
    "<b>S235JR</b> (R — udarność w temp. +20 °C).")
d.h3("Skład chemiczny S235JR wg PN-EN 10025-2 (analiza wytopowa, % masowe, wartości maks.)")
d.table([
    ["C (gr.≤16 mm)","C (gr.>16 mm)","Mn","P","S","N","Cu"],
    ["≤ 0,17","≤ 0,20","≤ 1,40","≤ 0,035","≤ 0,035","≤ 0,012","≤ 0,55"],
], [62*mm]*1 if False else [24*mm,24*mm,22*mm,22*mm,22*mm,22*mm,22*mm], body_align="CENTER", font=8.6)
d.h3("Własności mechaniczne S235JR (wyroby walcowane, grubość/średnica ≤ 16 mm)")
d.table([
    ["Granica plast. ReH","Wytrzymałość Rm","Wydłużenie A","Udarność KV (+20 °C)","Twardość orient."],
    ["≥ 235 MPa","360–510 MPa","≥ 26 %","≥ 27 J","≈ 110–120 HB"],
], [33*mm,33*mm,30*mm,38*mm,30*mm], body_align="CENTER", font=8.6)
d.p("<b>Charakterystyka i zastosowanie:</b> stal dobrze spawalna i obrabialna, tania, na konstrukcje "
    "i części mało obciążone, nieprzeznaczona do obróbki cieplnej utwardzającej (niska zawartość węgla).")

d.note("<b>UWAGA INŻYNIERSKA — niezgodność materiału z wymaganiami rysunku.</b> "
       "Rysunek wykonawczy wymaga twardości <b>290–300 HB</b> (uwaga 1) oraz — zgodnie ze strukturą 9-fazową — "
       "<b>hartowania uzębienia</b> (indukcyjnego/ogniowego), odpuszczania i szlifowania uzębienia (ZO17–ZO20). "
       "Stali <b>S235</b> (C ≤ 0,17 %) <b>nie da się zahartować</b> — przy tak niskiej zawartości węgla nie "
       "powstaje martenzyt, a maksymalna twardość pozostaje na poziomie ~120 HB. Wymagań 290–300 HB i "
       "hartowania powierzchniowego <b>nie można spełnić na stali S235</b>. Jest to błąd materiałowy rysunku.")

d.h2("Materiał poprawny inżyniersko (przyjęty do obróbki cieplnej): C45 — alternatywnie 41Cr4")
d.p("Aby spełnić wymóg twardości i hartowania uzębienia, koło musi być wykonane ze <b>stali ulepszalnej "
    "(hartownej)</b>. Klasycznym materiałem na koła zębate z uzębieniem hartowanym powierzchniowo jest "
    "<b>C45 (1.0503)</b>; gdy wymagana jest pewna twardość rdzenia 290–300 HB w przekroju Ø185 — "
    "<b>41Cr4 / 40H (1.7035)</b>. Oba są kowalne (PF1/PF2) i dostępne jako pręt (PF3).")
d.table([
    ["Cecha","C45 (1.0503)","41Cr4 / 40H (1.7035)"],
    ["Skład gł. (% mas.)","C 0,42–0,50; Mn 0,50–0,80; Si ≤0,40; Cr ≤0,40","C 0,38–0,45; Mn 0,60–0,90; Cr 0,90–1,20"],
    ["Rm po ulepszaniu","700–850 MPa (Ø≤16) / 630–700 (Ø<100)","900–1100 MPa"],
    ["Re po ulepszaniu","≥ 490 / 430 MPa","≥ 660 MPa"],
    ["Wydłużenie A","≥ 14–16 %","≥ 11–12 %"],
    ["Twardość rdzenia (ulep.)","≈ 210–250 HB","≈ 290–320 HB ✓ (290–300 HB)"],
    ["Twardość uzębienia (hart. ind.)","52–58 HRC","52–56 HRC"],
    ["Norma","PN-EN ISO 683-1 / EN 10083-2","PN-EN ISO 683-2 / EN 10083-3"],
], [30*mm,68*mm,66*mm], font=8.0, body_align="LEFT")
d.note("<b>Decyzja:</b> identyfikacja materiału wg rysunku = <b>S235</b> (podano powyżej skład i własności). "
       "Z uwagi na wymóg 290–300 HB i hartowania uzębienia, do faz obróbki cieplnej i doboru parametrów "
       "przyjęto materiał ulepszalny <b>C45</b> (alternatywnie 41Cr4). Obrabialność wiórowa S235 i C45 jest "
       "zbliżona, więc dobór naddatków i obrabiarek (Zad. 11–12) pozostaje ważny niezależnie od rozstrzygnięcia.",
       ok=True)

d.pagebreak()
# --- 10.3 rysunki polfabrykatow ---
d.h1("10.3 (c.d.). Rysunki poglądowe półfabrykatów z klasą dokładności (IT)")
d.p("Poniżej rysunki poglądowe dwóch półfabrykatów (po jednym rysunku na półfabrykat). Na każdym "
    "zaznaczono klasę dokładności wykonania (klasę IT). Linią przerywaną pokazano zarys gotowej części.")
d.image(os.path.join(B,"fig_pf_odkuwka.png"), 150,
        "Rys. 10.1. PF1 — odkuwka matrycowa (klasa dokładności IT15–IT16 wg PN-EN 10243-1).")
d.image(os.path.join(B,"fig_pf_pret.png"), 150,
        "Rys. 10.2. PF3 — pręt walcowany okrągły Ø200 h12 (klasa dokładności IT14–IT16 wg PN-EN 10060).")
d.h2("Zestawienie klas dokładności (IT) półfabrykatów i porównanie z wymaganiami części")
d.table([
    ["Półfabrykat","Sposób wykonania","Klasa dokładności (IT)","Chropowatość Ra","Uwagi"],
    ["PF1 — odkuwka matrycowa","kucie w matrycy","IT15–IT16 (kl. F)","Ra 12,5–25","mały naddatek, dobry przebieg włókien"],
    ["PF2 — odkuwka swobodna","kucie swobodne","IT16–IT18","Ra 25–50","duży naddatek, prod. jednostkowa"],
    ["PF3 — pręt walcowany","walcowanie na gorąco","IT14–IT16 (tol. h12–h13)","Ra 12,5–25","krążek cięty, otwór z pełnego"],
    ["Część gotowa (wybrane)","obróbka skrawaniem","Ø35 H9 = IT9; rowek 10 JS9 = IT9; uzęb. kl. 8 (PN-ISO 1328)","Ra 1,25–5","wymaga obr. wykańcz. i szlifowania"],
], [30*mm,28*mm,46*mm,22*mm,38*mm], font=7.8, body_align="LEFT")
d.p("Różnica między klasą IT półfabrykatu (IT14–IT16) a klasą IT części (IT9 dla otworu i rowka, "
    "kl. 8 uzębienia) wyznacza liczbę i rodzaj koniecznych zabiegów obróbkowych (zgrubny → średnio "
    "dokładny → wykańczający → szlifowanie), co jest podstawą doboru naddatków (Zad. 12a).")

d.pagebreak()
# --- 10.4 struktura ---
d.h1("10.4. Struktura dziewięciofazowa procesu technologicznego")
d.p("Strukturę 9-fazową opracowano dla trzech rodzajów półfabrykatów (PF1 — odkuwka matrycowa, "
    "PF2 — odkuwka swobodna, PF3 — pręt walcowany), co spełnia wymóg „minimum 2 rodzaje półfabrykatów”. "
    "Drogi technologiczne łączą się po przygotowaniu baz (Faza III). Pełny rysunek struktury — plik "
    "<b>Struktura_9_fazowa.pdf</b>.")
d.image(os.path.join(B,"fig_struktura9.png"), 250)
d.h2("Wykaz zabiegów obróbkowych (ZO)")
zo = [
    ("ZO1","odprężanie"),("ZO2","centrowanie / przygotowanie baz"),("ZO3","cięcie pręta"),
    ("ZO4","frezowanie zgrubne pow. czołowych"),("ZO5","toczenie zgrubne pow. walcowych"),
    ("ZO6","toczenie średnio dokładne pow. walcowych"),("ZO7","wiercenie otworu piasty"),
    ("ZO8","wytaczanie/frez. śr. dokł. otworu"),("ZO9","wytaczanie/frez. wykańcz. otworu"),
    ("ZO10","dłutowanie zgrubne rowka wpustowego"),("ZO11","dłutowanie śr. dokł. rowka"),
    ("ZO12","frezowanie obwiedniowe zgrubne uzębienia"),("ZO13","frez. obwiedniowe śr. dokł. uzębienia"),
    ("ZO14","wiercenie 6×Ø24 (otwory odciążające)"),("ZO15","obróbka pow. odciążających (wcięcia)"),
    ("ZO16","wykonanie faz frezem fazującym"),("ZO17","hartowanie indukcyjne uzębienia"),
    ("ZO18","hartowanie ogniowe (wariant alternatywny)"),("ZO19","odpuszczanie"),
    ("ZO20","szlifowanie uzębienia"),("ZO21","mycie / czyszczenie"),("ZO22","kontrola wymiarów"),
]
rows=[["ZO","Nazwa zabiegu","ZO","Nazwa zabiegu"]]
for i in range(0,len(zo),2):
    a=zo[i]; b=zo[i+1] if i+1<len(zo) else ("","")
    rows.append([a[0],a[1],b[0],b[1]])
d.table(rows, [14*mm,72*mm,14*mm,72*mm], font=8.0, body_align="LEFT",
        align=[(0,0,0,-1,"CENTER"),(2,0,2,-1,"CENTER")])

d.pagebreak()
# --- weryfikacja ---
d.h1("Weryfikacja Zadania 10 — zgodność ze sztuką inżynierską i zasadami obróbki")
d.p("Poniżej wynik sprawdzenia istniejącego Zadania 10 (struktura 9-fazowa + dane z rysunku).")
d.table([
    ["Lp.","Element sprawdzany","Ocena","Uwagi / zalecenie"],
    ["1","Geometria uzębienia (m,z,d,da,h)","OK","d=m·z=178,5; da=d+2m=185,5; h=2,25m≈7,9 — spójne z rysunkiem"],
    ["2","Liczba rodzajów półfabrykatów (≥2)","OK","PF1, PF2, PF3 — spełnione"],
    ["3","Kolejność faz 0–IX","OK","zgodna z modelem 9-fazowym (Feld)"],
    ["4","Materiał S235 vs 290–300 HB i hartowanie","BŁĄD","S235 niehartowalna — przyjąć C45/41Cr4 (p. 10.3)"],
    ["5","ZO2 centrowanie (nakiełki) dla tarczy","DO POPRAWY","część jest tarczą (D≫L), mocowana w uchwycie; "
                                                      "bazą jest czoło + otwór, nie nakiełki. Ø185 przekracza zakres nakiełczarek z wykazu"],
    ["6","ZO17 hart. indukcyjne + ZO18 ogniowe","DO UŚCIŚL.","to warianty alternatywne — w procesie należy wybrać JEDEN (Zad. 11)"],
    ["7","Faza VIII / powierzchniowa — pusta","OK","brak powłok/oksydowania — dopuszczalne"],
    ["8","Rowek wpustowy: 10JS8 (widok) vs 10JS9 (tabela ±0,018)","BŁĄD RYS.","±0,018 = JS9; ujednolicić oznaczenie na 10 JS9"],
    ["9","Uwaga 4: „ISO 27768-m”","BŁĄD RYS.","literówka — powinno być ISO 2768-m (PN-EN 22768-m), tol. ogólne kl. m"],
    ["10","Obróbka uzębienia przed i po hartowaniu","OK","frez. obwiedniowe (ZO12/13) przed OC, szlifowanie (ZO20) po OC — poprawnie"],
], [9*mm,52*mm,22*mm,89*mm], font=7.7, body_align="LEFT",
   align=[(0,0,0,-1,"CENTER"),(2,0,2,-1,"CENTER")])
d.note("Podsumowanie: struktura technologiczna jest zasadniczo poprawna; wymaga korekty <b>materiału</b> "
       "(S235→C45/41Cr4), <b>doprecyzowania metody hartowania</b> (jeden wariant) oraz drobnych poprawek "
       "oznaczeń na rysunku (rowek 10JS9, ISO 2768-m). Pozycja ZO2 (centrowanie) dla części tarczowej "
       "jest dyskusyjna i w wariancie wykonawczym zastąpiono ją przygotowaniem baz: planowaniem czoła i "
       "wytoczeniem otworu (Zad. 11/12).")
d.build()

# =====================================================================
# DOK. 2 — RYSUNKI POLFABRYKATOW (osobny plik PDF)
# =====================================================================
d2 = DocMaker(os.path.join(OUT,"Rysunki_polfabrykatow.pdf"),
              "Rysunki półfabrykatów — koło zębate (m=3,5; z=51)",
              "Rysunki poglądowe półfabrykatów z zaznaczoną klasą dokładności wykonania (klasą IT).",
              footer="Zadanie 10 — Rysunki półfabrykatów")
d2.title_block()
d2.h1("Półfabrykat PF1 — Odkuwka matrycowa")
d2.image(os.path.join(B,"fig_pf_odkuwka.png"), 165)
d2.bullets([
    "Sposób wykonania: kucie matrycowe na gorąco; płaszczyzna podziału w połowie szerokości.",
    "Naddatek obróbkowy: 2,0 mm na powierzchnię; pochylenia kuźnicze 6° (zewn.) / 7° (wewn.).",
    "Promienie zaokrągleń: R6 (zewnętrzne) / R3 (wewnętrzne); otwór wstępnie przebity Ø28.",
    "<b>Klasa dokładności wykonania: IT15–IT16</b> (PN-EN 10243-1, klasa F — zwykła).",
])
d2.pagebreak()
d2.h1("Półfabrykat PF3 — Pręt walcowany okrągły (krążek cięty)")
d2.image(os.path.join(B,"fig_pf_pret.png"), 165)
d2.bullets([
    "Sposób wykonania: krążek odcinany z pręta walcowanego na gorąco Ø200 (przecinarka taśmowa).",
    "Duży naddatek na powierzchni walcowej (Ø200→Ø185,5); otwór Ø35 wykonywany z pełnego.",
    "<b>Klasa dokładności wykonania: IT14–IT16</b> (tolerancja średnicy pręta h12 wg PN-EN 10060).",
])
d2.build()

# =====================================================================
# DOK. 3 — STRUKTURA 9-FAZOWA (osobny plik, poziomy A4)
# =====================================================================
d3 = DocMaker(os.path.join(OUT,"Struktura_9_fazowa.pdf"),
              "Struktura dziewięciofazowa — koło zębate (m=3,5; z=51)",
              "Struktura 9-fazowa procesu technologicznego dla 3 rodzajów półfabrykatów (PF1/PF2/PF3).",
              land=True, footer="Zadanie 10 — Struktura 9-fazowa")
d3.title_block()
d3.image(os.path.join(B,"fig_struktura9.png"), 265)
d3.small("PF1 – odkuwka matrycowa; PF2 – odkuwka swobodna; PF3 – pręt walcowany. "
         "ZO1…ZO22 – zabiegi obróbkowe (wykaz w pliku Zadanie_10_opracowanie.pdf). "
         "Drogi technologiczne łączą się po przygotowaniu baz (Faza III).")
d3.build()
print("ZADANIE 10 — gotowe")
