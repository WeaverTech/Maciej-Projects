# -*- coding: utf-8 -*-
"""Rysunki techniczne (matplotlib) do opracowan technologicznych."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from matplotlib.patches import Rectangle, FancyArrowPatch, Circle, FancyBboxPatch, Polygon, Arc
from matplotlib.lines import Line2D
import numpy as np

FP = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
fm.fontManager.addfont(FP)
matplotlib.rcParams["font.family"] = "DejaVu Sans"
matplotlib.rcParams["axes.unicode_minus"] = False

NAVY = "#1f3864"; BLUE = "#2e5496"; LBLUE = "#d6e0f0"; AMBER = "#fff2cc"
GREEN = "#548235"; RED = "#c00000"; GREY = "#595959"; HATCH = "#7f7f7f"

# ---------- geometria gotowego kola ----------
DA = 185.5; DF = 169.7; DPITCH = 178.5
BORE = 35.0; HUB = 59.5; PCD = 99.8; RIM_IN = 140.0
W = 45.0; WEB = 16.0


def _dimline(ax, x0, y0, x1, y1, text, off=0, fs=8, color="k", ext=True, tpos=0.5, va="center", ha="center"):
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle="<->", color=color, lw=0.9, shrinkA=0, shrinkB=0))
    tx = x0 + (x1 - x0) * tpos; ty = y0 + (y1 - y0) * tpos
    ax.text(tx, ty, text, fontsize=fs, ha=ha, va=va, color=color,
            bbox=dict(boxstyle="round,pad=0.12", fc="white", ec="none", alpha=0.9))


# =========================================================
# 1. ODKUWKA MATRYCOWA (rysunek pogladowy) — polprzekroj
# =========================================================
def fig_pf_odkuwka(path):
    fig, ax = plt.subplots(figsize=(7.4, 5.4))
    of = 2.0
    Bf = W + 2*of            # 49
    Rout = DA/2 + of         # ~95 -> Ø190
    Rhub = (HUB+4)/2         # piasta z naddatkiem
    Rbore = (BORE-7)/2       # otwor przebity Ø28
    rec_r_out = (RIM_IN-4)/2 # do ~Ø136
    rec_w = (Bf-WEB)/2       # glebokosc wglebienia czolowego
    # pelny przekroj osiowy (gora i dol)
    ax.add_patch(Rectangle((-Bf/2,-Rout), Bf, 2*Rout, fill=False, lw=1.9))
    ax.add_patch(Rectangle((-Bf/2,-Rbore), Bf, 2*Rbore, facecolor="white", edgecolor="k", lw=1.9))
    # wglebienia czolowe (4 naroza)
    for sx in (-1,1):
        x0 = (Bf/2-rec_w) if sx>0 else -Bf/2
        for sy in (1,-1):
            y0 = Rhub if sy>0 else -rec_r_out
            ax.add_patch(Rectangle((x0,y0), rec_w, rec_r_out-Rhub, facecolor="white", edgecolor="k", lw=1.5))
    # przegroda
    ax.add_patch(Rectangle((-WEB/2,-Rhub), WEB, 2*Rhub, fill=False, lw=1.3))
    # kreskowanie (wieniec + piasta)
    for r0,r1 in [(rec_r_out,Rout),(-Rout,-rec_r_out)]:
        ax.add_patch(Rectangle((-Bf/2,r0), Bf, r1-r0, facecolor="none", edgecolor=HATCH, hatch="////", lw=0))
    for r0,r1 in [(Rbore,Rhub),(-Rhub,-Rbore)]:
        ax.add_patch(Rectangle((-WEB/2,r0), WEB, r1-r0, facecolor="none", edgecolor=HATCH, hatch="////", lw=0))
    # zarys gotowy kreskowo
    ax.add_patch(Rectangle((-W/2,-DA/2), W, DA, fill=False, lw=1.0, ls=(0,(5,3)), ec=GREEN))
    ax.add_patch(Rectangle((-W/2,-BORE/2), W, BORE, fill=False, lw=1.0, ls=(0,(5,3)), ec=GREEN))
    # os
    ax.plot([-Bf/2-14, Bf/2+18],[0,0], color="k", lw=0.7, ls=(0,(8,3,1,3)))
    # wymiary
    _dimline(ax, -Bf/2, Rout+10, Bf/2, Rout+10, "B = 49  (45 +2×2)", fs=8)
    _dimline(ax, Bf/2+16, -Rout, Bf/2+16, Rout, "Ø190\n(Ø185,5+2×2)", fs=8, ha="left")
    _dimline(ax, -Bf/2-7, -Rbore, -Bf/2-7, Rbore, "Ø28\nprzebity", fs=7.2, ha="right")
    # plaszczyzna podzialu
    ax.plot([0,0],[-Rout-6, Rout+6], color=RED, lw=1.0, ls=(0,(4,2)))
    ax.text(0, Rout+13, "pł. podziału", fontsize=7.5, ha="center", color=RED, fontweight="bold")
    ax.annotate("pochylenia 6°/7°", xy=(Bf/2-2,Rhub+6), xytext=(Bf/2+6,-Rout+4),
                fontsize=7.3, color=BLUE, ha="left", arrowprops=dict(arrowstyle="->", color=BLUE, lw=0.8))
    ax.annotate("R4–R8", xy=(-Bf/2,Rout), xytext=(-Bf/2-20,Rout+8),
                fontsize=7.3, color=BLUE, ha="right", arrowprops=dict(arrowstyle="->", color=BLUE, lw=0.8))
    ax.annotate("naddatek 2 mm/pow.", xy=(W/2,(BORE/2+DA/2)/2), xytext=(W/2+10,DA/2-2),
                fontsize=7.3, color=GREEN, ha="left", arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    ax.text(-Bf/2-20, -Rout-16, "— — —  zarys części gotowej (po obróbce)", color=GREEN, fontsize=7.6, ha="left")
    ax.text(-Bf/2-20, -Rout-26, "Klasa dokładności wykonania: IT15–IT16  (PN-EN 10243-1, kl. F)",
            color=NAVY, fontsize=8.2, ha="left", fontweight="bold")
    ax.set_title("PF1 — Odkuwka matrycowa (rysunek poglądowy, przekrój osiowy)",
                 fontsize=10.5, color=NAVY, fontweight="bold")
    ax.set_xlim(-Bf/2-40, Bf/2+40); ax.set_ylim(-Rout-32, Rout+22)
    ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(); fig.savefig(path, dpi=200, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


# =========================================================
# 2. PRET WALCOWANY (rysunek pogladowy)
# =========================================================
def fig_pf_pret(path):
    fig, ax = plt.subplots(figsize=(7.2, 4.2))
    D = 200.0; L = 49.0
    of = (D-DA)/2
    ax.add_patch(Rectangle((-L/2, -D/2), L, D, fill=False, lw=1.8))
    # gotowa czesc kreskowo
    ax.add_patch(Rectangle((-W/2, -DA/2), W, DA, fill=False, lw=1.0, ls=(0,(5,3)), ec=GREEN))
    ax.add_patch(Rectangle((-W/2, -BORE/2), W, BORE, fill=False, lw=1.0, ls=(0,(5,3)), ec=GREEN))
    ax.plot([-L/2-12, L/2+12],[0,0], color="k", lw=0.7, ls=(0,(8,3,1,3)))
    _dimline(ax, -L/2, D/2+12, L/2, D/2+12, "L = 49 (45 + 2×2 +odcinek na przecinarce)", fs=8)
    _dimline(ax, L/2+16, -D/2, L/2+16, D/2, "Ø200 h12\n(pręt walc. PN-EN 10060)", fs=8, ha="left")
    ax.text(-L/2, -D/2-16, "— — —  zarys części gotowej (Ø185,5 ; otwór Ø35)", color=GREEN, fontsize=7.6, ha="left")
    ax.text(-L/2, -D/2-26, "Klasa dokładności wykonania: IT14–IT16 (śr. pręta wg PN-EN 10060, tol. h12)",
            color=NAVY, fontsize=8.2, ha="left", fontweight="bold")
    ax.annotate("duży naddatek (Ø200→Ø185,5);\notwór Ø35 z pełnego — wiercony/toczony",
                xy=(0, DA/2), xytext=(L/2+4, D/2-30), fontsize=7.2, color=GREEN, ha="left",
                arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    ax.set_title("PF3 — Pręt walcowany okrągły (odcinek, rysunek poglądowy)",
                 fontsize=10.5, color=NAVY, fontweight="bold")
    ax.set_xlim(-L/2-26, L/2+40); ax.set_ylim(-D/2-32, D/2+24)
    ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(); fig.savefig(path, dpi=200, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


# =========================================================
# 3. STRUKTURA 9-FAZOWA
# =========================================================
PHASES = [
    ("Faza 0", "Półfabrykat"),
    ("Faza I", "Obróbka cieplna\nwłasnościowa"),
    ("Faza II", "Przygot. kształtu\nwyjściowego"),
    ("Faza III", "Przygot. baz\ngłów. i pomocn."),
    ("Faza IV", "Obróbka kształtu\npodstawowego"),
    ("Faza V", "Obr. na gotowo\npow. uzup. 1-go rz."),
    ("Faza VI", "Obr. na gotowo\npow. uzup. 2-go rz."),
    ("Faza VII", "Obr. cieplna/ch.-c.\npowierzchniowa"),
    ("Faza VIII", "Obr. wymiar.-kszt.\nostateczna"),
    ("Faza IX", "Operacje\nuzupełniające"),
]

ZO_LEGEND = [
    ("ZO1", "odprężanie"), ("ZO2", "centrowanie / przygotowanie baz (planowanie czół + nakiełki)"),
    ("ZO3", "cięcie pręta"), ("ZO4", "frezowanie zgrubne powierzchni czołowych"),
    ("ZO5", "toczenie zgrubne powierzchni walcowych"), ("ZO6", "toczenie średnio dokładne pow. walcowych"),
    ("ZO7", "wiercenie otworu piasty"), ("ZO8", "frezowanie/wytaczanie średnio dokł. otworu piasty"),
    ("ZO9", "frezowanie/wytaczanie wykańczające otworu piasty"), ("ZO10", "dłutowanie zgrubne rowka wpustowego"),
    ("ZO11", "dłutowanie średnio dokł. rowka wpustowego"), ("ZO12", "frezowanie obwiedniowe zgrubne uzębienia"),
    ("ZO13", "frezowanie obwiedniowe średnio dokł. uzębienia"), ("ZO14", "wiercenie 6×Ø24 (otwory odciążające)"),
    ("ZO15", "frezowanie/toczenie pow. odciążających (wcięcia)"), ("ZO16", "wykonanie faz frezem fazującym"),
    ("ZO17", "hartowanie indukcyjne uzębienia"), ("ZO18", "hartowanie ogniowe (wariant alternatywny)"),
    ("ZO19", "odpuszczanie"), ("ZO20", "szlifowanie uzębienia"),
    ("ZO21", "mycie / czyszczenie"), ("ZO22", "kontrola wymiarów"),
]

# rozmieszczenie wezlow: (label, faza_index, y_level)
NODES = {
    "PF1": (0, 3.2), "PF2": (0, 2.2), "PF3": (0, 1.0),
    "ZO1": (1, 2.2), "ZO2": (2, 2.6), "ZO3": (2, 1.0),
    "ZO4": (3, 1.8), "ZO5": (3, 1.0),
    "ZO6": (4, 3.4), "ZO7": (4, 2.6), "ZO8": (4, 1.8), "ZO9": (4, 1.0),
    "ZO10": (4, 0.2), "ZO11": (4, -0.6), "ZO12": (4, -1.4), "ZO13": (4, -2.2),
    "ZO14": (5, 1.0), "ZO15": (5, 0.0),
    "ZO16": (6, 0.5),
    "ZO17": (7, 1.4), "ZO18": (7, 0.4), "ZO19": (7, -0.6),
    "ZO20": (8, 0.4),
    "ZO21": (9, 1.0), "ZO22": (9, 0.0),
}
EDGES = [
    ("PF1","ZO1"),("PF2","ZO1"),("ZO1","ZO2"),("PF3","ZO3"),
    ("ZO2","ZO4"),("ZO3","ZO4"),("ZO4","ZO5"),
    ("ZO5","ZO6"),("ZO6","ZO7"),("ZO7","ZO8"),("ZO8","ZO9"),
    ("ZO9","ZO10"),("ZO10","ZO11"),("ZO11","ZO12"),("ZO12","ZO13"),
    ("ZO13","ZO14"),("ZO14","ZO15"),("ZO15","ZO16"),
    ("ZO16","ZO17"),("ZO16","ZO18"),("ZO17","ZO19"),("ZO18","ZO19"),
    ("ZO19","ZO20"),("ZO20","ZO21"),("ZO21","ZO22"),
]


def _struct_base(ax, grouping=False):
    colw = 3.0
    ymin, ymax = -3.0, 4.4
    # kolumny faz
    for i,(ph,desc) in enumerate(PHASES):
        x0 = i*colw
        ax.add_patch(Rectangle((x0, ymin), colw, ymax-ymin, fill=False, lw=0.8, ec="#888"))
        ax.add_patch(Rectangle((x0, ymax), colw, 1.5, facecolor=LBLUE, ec="#888", lw=0.8))
        ax.text(x0+colw/2, ymax+1.15, ph, ha="center", va="center", fontsize=8.6, fontweight="bold", color=NAVY)
        ax.text(x0+colw/2, ymax+0.5, desc, ha="center", va="center", fontsize=6.6, color="#333")
    def pos(label):
        fi, yl = NODES[label]
        return (fi*colw + colw/2, yl)
    # krawedzie
    for a,b in EDGES:
        xa,ya = pos(a); xb,yb = pos(b)
        ax.annotate("", xy=(xb,yb), xytext=(xa,ya),
                    arrowprops=dict(arrowstyle="-|>", color=BLUE, lw=1.3,
                                    shrinkA=11, shrinkB=11))
    # wezly
    for label,(fi,yl) in NODES.items():
        x = fi*colw + colw/2
        is_pf = label.startswith("PF")
        fc = AMBER if is_pf else "white"
        ec = AMBER_BD if is_pf else BLUE
        c = Circle((x, yl), 0.42, facecolor=fc, edgecolor=ec, lw=1.3, zorder=5)
        ax.add_patch(c)
        ax.text(x, yl, label, ha="center", va="center", fontsize=6.7,
                fontweight="bold", color=NAVY if is_pf else "#111", zorder=6)
    ax.set_xlim(-0.2, len(PHASES)*colw+0.2)
    ax.set_ylim(ymin-0.3, ymax+1.7)
    ax.set_aspect("equal"); ax.axis("off")
    AMBER_BD_=AMBER_BD


AMBER_BD = "#bf9000"


def fig_struktura9(path):
    fig, ax = plt.subplots(figsize=(15.5, 7.2))
    _struct_base(ax)
    # legenda PF
    ax.text(0.0, -3.7, "PF1 – odkuwka matrycowa     PF2 – odkuwka swobodna     PF3 – pręt walcowany",
            fontsize=8.4, color=NAVY, fontweight="bold")
    ax.set_title("Struktura dziewięciofazowa procesu technologicznego — koło zębate (dla PF1/PF2/PF3)",
                 fontsize=12, color=NAVY, fontweight="bold", pad=24)
    fig.tight_layout(); fig.savefig(path, dpi=170, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


# =========================================================
# 4. STRUKTURA STOPNIOWO-FAZOWA Z GRUPOWANIEM W OPERACJE
# =========================================================
# grupowanie: operacja -> lista ZO  (WARIANT WYBRANY: pret walcowany PF3, hart. indukcyjne)
OPERACJE = [
    ("Op.05","cięcie",["ZO3"], "#fde9d9"),
    ("Op.10","tok.zgr",["ZO4","ZO5"], "#e2efda"),
    ("Op.15","tok.kszt",["ZO6","ZO7","ZO8","ZO9","ZO15","ZO16"], "#ddebf7"),
    ("Op.20","rowek",["ZO10","ZO11"], "#f8cbad"),
    ("Op.25","uzęb.",["ZO12","ZO13"], "#d9e1f2"),
    ("Op.30","otwory",["ZO14"], "#e2f0d9"),
    ("Op.35","hart.",["ZO17","ZO19"], "#fce4d6"),
    ("Op.40","szlif.",["ZO20"], "#dbe5f1"),
    ("Op.45","kontr.",["ZO21","ZO22"], "#ededed"),
]
# trasa wariantu pretowego (kolejnosc technologiczna)
ROUTE_PRET = ["PF3","ZO3","ZO4","ZO5","ZO6","ZO7","ZO8","ZO9","ZO10","ZO11",
              "ZO12","ZO13","ZO14","ZO15","ZO16","ZO17","ZO19","ZO20","ZO21","ZO22"]
EDGES_PRET = [(ROUTE_PRET[i],ROUTE_PRET[i+1]) for i in range(len(ROUTE_PRET)-1)]


def fig_grupowanie(path):
    fig, ax = plt.subplots(figsize=(15.8, 8.2))
    colw = 3.0
    # mapowanie ZO -> (operacja, kolor)
    zo2op = {}
    for opname, short, zos, color in OPERACJE:
        for z in zos:
            zo2op[z] = (opname, color)
    # rysuj baze z kolorowaniem wezlow
    ymin, ymax = -3.0, 4.4
    for i,(ph,desc) in enumerate(PHASES):
        x0=i*colw
        ax.add_patch(Rectangle((x0,ymin),colw,ymax-ymin,fill=False,lw=0.8,ec="#888"))
        ax.add_patch(Rectangle((x0,ymax),colw,1.5,facecolor=LBLUE,ec="#888",lw=0.8))
        ax.text(x0+colw/2,ymax+1.15,ph,ha="center",va="center",fontsize=8.6,fontweight="bold",color=NAVY)
        ax.text(x0+colw/2,ymax+0.5,desc,ha="center",va="center",fontsize=6.6,color="#333")
    def pos(label):
        fi,yl=NODES[label]; return (fi*colw+colw/2, yl)
    route=set(ROUTE_PRET)
    for a,b in EDGES_PRET:
        xa,ya=pos(a); xb,yb=pos(b)
        ax.annotate("",xy=(xb,yb),xytext=(xa,ya),
                    arrowprops=dict(arrowstyle="-|>",color=BLUE,lw=1.4,shrinkA=12,shrinkB=12))
    for label,(fi,yl) in NODES.items():
        x=fi*colw+colw/2
        in_route = label in route
        if label.startswith("PF"):
            fc=AMBER if in_route else "#f3f3f3"; ec=AMBER_BD if in_route else "#bbb"
        elif in_route:
            op,fc = zo2op.get(label,("","white")); ec=RED
        else:
            fc="#f3f3f3"; ec="#bbb"
        c=Circle((x,yl),0.44,facecolor=fc,edgecolor=ec,lw=1.5,zorder=5)
        ax.add_patch(c)
        ax.text(x,yl,label,ha="center",va="center",fontsize=6.6,fontweight="bold",
                color="#111" if in_route else "#aaa",zorder=6)
    ax.set_xlim(-0.2,len(PHASES)*colw+0.2); ax.set_ylim(ymin-1.4,ymax+1.7)
    ax.set_aspect("equal"); ax.axis("off")
    # legenda operacji (kolory)
    leg_txt = {
        "Op.05":"ZO3 — przecinanie pręta (przecinarka)",
        "Op.10":"ZO4,ZO5 — toczenie zgrubne (planow. czół + Ø)",
        "Op.15":"ZO6,7,8,9,15,16 — toczenie kształt./wykańcz. + otwór + wcięcia + fazy",
        "Op.20":"ZO10,ZO11 — rowek wpustowy (dłutowanie)",
        "Op.25":"ZO12,ZO13 — uzębienie (frez. obwiedniowe)",
        "Op.30":"ZO14 — wiercenie 6×Ø24",
        "Op.35":"ZO17,ZO19 — hart. indukcyjne + odpuszczanie",
        "Op.40":"ZO20 — szlifowanie uzębienia",
        "Op.45":"ZO21,ZO22 — mycie + kontrola",
    }
    x=0.2; y=ymin-1.0; i=0
    for opname,short,zos,color in OPERACJE:
        col = i % 2
        xx = 0.2 + col*7.8
        yy = ymin-0.7 - (i//2)*0.62
        ax.add_patch(Rectangle((xx,yy-0.16),0.42,0.36,facecolor=color,edgecolor=RED,lw=1.0))
        ax.text(xx+0.6,yy,f"{opname}: {leg_txt[opname]}",fontsize=7.6,va="center",color="#222")
        i+=1
    ax.text(0.0, ymin-0.2, "Węzły szare = droga niewybrana (półfabrykat odkuwka, PF1/PF2). Kolor węzła = operacja technologiczna.",
            fontsize=7.4, color="#777")
    ax.set_title("Struktura stopniowo-fazowa z pogrupowaniem zabiegów w operacje technologiczne (WARIANT WYBRANY: pręt walcowany PF3)",
                 fontsize=11, color=NAVY, fontweight="bold", pad=22)
    fig.tight_layout(); fig.savefig(path, dpi=170, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


# =========================================================
# 5. RYSUNEK WYKONAWCZY POLFABRYKATU (ODKUWKA) — szczegolowy
# =========================================================
def fig_rys_polfabrykat(path):
    fig = plt.figure(figsize=(11.7, 8.3))
    ax = fig.add_axes([0.04, 0.16, 0.92, 0.78])
    Bf = 49.0; Rout = 95.0; Rbore = 14.0   # Ø190, Ø28
    Rhub = (HUB+4)/2; rec_r_out=(RIM_IN-4)/2; rec_w=(Bf-WEB)/2
    draft=6
    # polprzekroj gorny + dolny (pelny przekroj)
    for s in (1,-1):
        ax.add_patch(Rectangle((-Bf/2, s*Rbore if s>0 else -Rout), Bf, Rout-Rbore, fill=False, lw=0))  # placeholder
    # pelny przekroj: prostokat zewn Ø190 x 49 z otworem Ø28 i wglebieniami
    ax.add_patch(Rectangle((-Bf/2,-Rout), Bf, 2*Rout, fill=False, lw=2.0))
    ax.add_patch(Rectangle((-Bf/2,-Rbore), Bf, 2*Rbore, facecolor="white", edgecolor="k", lw=2.0))  # otwor
    # wglebienia czolowe (gora i dol, lewo i prawo)
    for sx in (-1,1):
        for sy in (1,-1):
            x0 = (Bf/2-rec_w) if sx>0 else -Bf/2
            y0 = Rhub if sy>0 else -rec_r_out
            ax.add_patch(Rectangle((x0, y0 if sy>0 else -rec_r_out), rec_w, (rec_r_out-Rhub),
                         facecolor="white", edgecolor="k", lw=1.6))
    # kreskowanie materialu (uproszczone) na przekroju gornym wieniec
    ax.add_patch(Rectangle((-Bf/2, Rhub), Bf, Rout-Rhub, fill=False, lw=0))
    # hatch wieniec
    rh = Rectangle((-Bf/2, rec_r_out), Bf, Rout-rec_r_out, facecolor="none", edgecolor=HATCH, hatch="////", lw=0)
    ax.add_patch(rh)
    rh2 = Rectangle((-Bf/2, -Rout), Bf, Rout-rec_r_out, facecolor="none", edgecolor=HATCH, hatch="////", lw=0)
    ax.add_patch(rh2)
    # piasta hatch (srodek)
    ax.add_patch(Rectangle((-WEB/2, Rbore), WEB, Rhub-Rbore, facecolor="none", edgecolor=HATCH, hatch="////", lw=0))
    ax.add_patch(Rectangle((-WEB/2, -Rhub), WEB, Rhub-Rbore, facecolor="none", edgecolor=HATCH, hatch="////", lw=0))
    # przegroda (web) miedzy wglebieniami
    ax.add_patch(Rectangle((-WEB/2, -Rhub), WEB, 2*Rhub, fill=False, lw=1.4))
    # zarys gotowy kreskowo
    ax.add_patch(Rectangle((-W/2,-DA/2), W, DA, fill=False, lw=1.0, ls=(0,(6,3)), ec=GREEN))
    ax.add_patch(Rectangle((-W/2,-BORE/2), W, BORE, fill=False, lw=1.0, ls=(0,(6,3)), ec=GREEN))
    # os
    ax.plot([-Bf/2-20, Bf/2+34],[0,0], color="k", lw=0.7, ls=(0,(8,3,1,3)))
    # plaszczyzna podzialu
    ax.plot([0,0],[-Rout-10, Rout+10], color=RED, lw=1.0, ls=(0,(5,2)))
    ax.text(0, Rout+12, "płaszczyzna podziału matrycy", color=RED, fontsize=8, ha="center", fontweight="bold")
    # wymiary
    _dimline(ax, -Bf/2, -Rout-14, Bf/2, -Rout-14, "49  +2,1/−1,1", fs=8.6)
    _dimline(ax, Bf/2+16, -Rout, Bf/2+16, Rout, "Ø190\n+2,4/−1,2", fs=8.4, ha="left", tpos=0.86)
    _dimline(ax, Bf/2+44, -Rhub, Bf/2+44, Rhub, "Ø63,5", fs=8.2, ha="left", tpos=0.5)
    _dimline(ax, -Bf/2-9, -Rbore, -Bf/2-9, Rbore, "Ø28", fs=8.2, ha="right")
    _dimline(ax, -Bf/2-34, -rec_r_out, -Bf/2-34, rec_r_out, "Ø136", fs=8.0, ha="right")
    _dimline(ax, -WEB/2, -Rout-26, WEB/2, -Rout-26, "16", fs=8.2)
    # adnotacje
    ax.annotate("pochylenie zewn. 6°", xy=(Bf/2, Rout*0.7), xytext=(Bf/2+2, Rout+2),
                fontsize=7.6, color=BLUE, arrowprops=dict(arrowstyle="->", color=BLUE, lw=0.8))
    ax.annotate("pochylenie wewn. 7°", xy=(WEB/2, Rhub+6), xytext=(WEB/2+10, Rhub+24),
                fontsize=7.6, color=BLUE, arrowprops=dict(arrowstyle="->", color=BLUE, lw=0.8))
    ax.annotate("R6 (zaokrąglenia zewn.)", xy=(-Bf/2, Rout), xytext=(-Bf/2-18, Rout+6),
                fontsize=7.4, color=BLUE, ha="right", arrowprops=dict(arrowstyle="->", color=BLUE, lw=0.8))
    ax.annotate("naddatek 2 mm/pow.", xy=(W/2,(BORE/2+DA/2)/2), xytext=(W/2+8, DA/2+12),
                fontsize=7.6, color=GREEN, ha="left", arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    ax.text(-Bf/2-20, -Rout-30, "— — —  zarys przedmiotu obrobionego na gotowo",
            color=GREEN, fontsize=8, ha="left")
    ax.set_xlim(-Bf/2-58, Bf/2+78); ax.set_ylim(-Rout-42, Rout+22)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("RYSUNEK WYKONAWCZY PÓŁFABRYKATU — Odkuwka matrycowa koła zębatego (przekrój osiowy)",
                 fontsize=11.5, color=NAVY, fontweight="bold")

    # ---- tabliczka + tabela wymagan ----
    axt = fig.add_axes([0.50, 0.015, 0.46, 0.14]); axt.axis("off")
    rows = [
        ["Materiał:", "S235 (rys.) / C45 dla OC*", "Masa odk.:", "≈ 8,0 kg"],
        ["Norma:", "PN-EN 10243-1, kl. F", "Kl. dokł.:", "IT15–IT16"],
        ["Naddatek:", "2,0 mm / powierzchnię", "Pochyl.:", "6° / 7°"],
        ["Promienie:", "R6 zewn. / R3 wewn.", "Podziałka:", "1:2 (A3)"],
    ]
    t = axt.table(cellText=rows, cellLoc="left", loc="center",
                  colWidths=[0.17,0.40,0.17,0.26])
    t.auto_set_font_size(False); t.set_fontsize(8.0); t.scale(1,1.5)
    for (r,c),cell in t.get_celld().items():
        cell.set_edgecolor("#888"); cell.set_linewidth(0.6)
        if c in (0,2): cell.get_text().set_fontweight("bold"); cell.get_text().set_color(NAVY)
    axb = fig.add_axes([0.04,0.015,0.42,0.12]); axb.axis("off")
    axb.text(0,0.85,"*Uwaga inżynierska:", fontsize=8.2, fontweight="bold", color=RED)
    axb.text(0,0.45,"Rys. wykonawczy podaje S235; dla twardości 290–300 HB i hartowania\n"
                    "indukcyjnego uzębienia konieczna stal ulepszalna (C45 / 41Cr4).",
             fontsize=7.6, color="#333")
    fig.savefig(path, dpi=180, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


# =========================================================
# 6. RYSUNEK WYKONAWCZY POLFABRYKATU — KRAZEK Z PRETA (wariant wybrany)
# =========================================================
def fig_rys_pret_wykonawczy(path):
    fig = plt.figure(figsize=(11.7, 8.3))
    ax = fig.add_axes([0.05, 0.20, 0.90, 0.74])
    D = 200.0; L = 49.0
    R = D/2
    # przekroj osiowy krazka (prostokat L x D) + otwor? - pret pelny (bez otworu)
    ax.add_patch(Rectangle((-L/2,-R), L, D, fill=False, lw=2.0))
    # kreskowanie materialu
    ax.add_patch(Rectangle((-L/2,-R), L, D, facecolor="none", edgecolor=HATCH, hatch="////", lw=0))
    # zarys gotowy kreskowo (OD Ø185,5 i otwor Ø35, szer 45)
    ax.add_patch(Rectangle((-W/2,-DA/2), W, DA, fill=False, lw=1.1, ls=(0,(6,3)), ec=GREEN))
    ax.add_patch(Rectangle((-W/2,-BORE/2), W, BORE, fill=False, lw=1.1, ls=(0,(6,3)), ec=GREEN))
    # os
    ax.plot([-L/2-22,L/2+30],[0,0], color="k", lw=0.7, ls=(0,(8,3,1,3)))
    # wymiary
    _dimline(ax, -L/2, R+12, L/2, R+12, "L = 49  (45 + 2×2)", fs=9)
    _dimline(ax, L/2+16, -R, L/2+16, R, "Ø200 h12  (−1,15)", fs=9, ha="left", tpos=0.86)
    _dimline(ax, -L/2-10, -DA/2, -L/2-10, DA/2, "Ø185,5\n(gotowa)", fs=8.0, ha="right", tpos=0.5)
    _dimline(ax, -W/2, -R-12, W/2, -R-12, "45 (gotowa)", fs=8.0)
    # naddatki adnotacje
    ax.annotate("naddatek na Ø: (200−185,5)/2 = 7,25 mm/stronę", xy=(0, DA/2),
                xytext=(L/2+4, R-18), fontsize=7.6, color=GREEN, ha="left",
                arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    ax.annotate("naddatek na czoło 2 mm/stronę", xy=(W/2, 0),
                xytext=(L/2+4, -R+30), fontsize=7.6, color=GREEN, ha="left",
                arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    ax.annotate("otwór Ø35 wykonany z pełnego\n(wiercenie + wytaczanie)", xy=(0,0),
                xytext=(-L/2-20, -R-2), fontsize=7.4, color=GREEN, ha="left",
                arrowprops=dict(arrowstyle="->", color=GREEN, lw=0.8))
    # powierzchnia ciecia Ra
    ax.text(-L/2-22, R-6, "Ra 25 (pow. cięcia)", fontsize=7.4, color=BLUE, ha="left")
    ax.text(-L/2-22, -R-26, "— — —  zarys przedmiotu obrobionego na gotowo", color=GREEN, fontsize=8, ha="left")
    ax.set_xlim(-L/2-46, L/2+80); ax.set_ylim(-R-34, R+22)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("RYSUNEK WYKONAWCZY PÓŁFABRYKATU — Krążek z pręta walcowanego Ø200 (wariant wybrany, przekrój osiowy)",
                 fontsize=10.8, color=NAVY, fontweight="bold")
    # tabela
    axt = fig.add_axes([0.50, 0.02, 0.46, 0.16]); axt.axis("off")
    rows = [
        ["Materiał:", "S235 (rys.) / C45 dla OC*", "Masa:", "≈ 12,1 kg"],
        ["Półfabrykat:", "pręt walc. Ø200 h12 PN-EN 10060", "Kl. dokł.:", "IT14–IT16"],
        ["Nadd. Ø:", "7,25 mm / stronę", "Nadd. czoło:", "2,0 mm/str."],
        ["Dł. krążka:", "49 mm (+ rzaz ~2 mm)", "Podziałka:", "1:2 (A3)"],
    ]
    t = axt.table(cellText=rows, cellLoc="left", loc="center", colWidths=[0.18,0.42,0.18,0.22])
    t.auto_set_font_size(False); t.set_fontsize(8.0); t.scale(1,1.5)
    for (r,c),cell in t.get_celld().items():
        cell.set_edgecolor("#888"); cell.set_linewidth(0.6)
        if c in (0,2): cell.get_text().set_fontweight("bold"); cell.get_text().set_color(NAVY)
    axb = fig.add_axes([0.05,0.02,0.42,0.14]); axb.axis("off")
    axb.text(0,0.85,"*Uwaga inżynierska:", fontsize=8.2, fontweight="bold", color=RED)
    axb.text(0,0.35,"Rys. wykonawczy podaje S235; dla 290–300 HB i hartowania\n"
                    "indukcyjnego uzębienia konieczna stal ulepszalna (C45 / 41Cr4).\n"
                    "Pręt = duży naddatek; dla serii korzystniejsza odkuwka matrycowa.",
             fontsize=7.5, color="#333")
    fig.savefig(path, dpi=180, bbox_inches="tight"); plt.close(fig)
    print("FIG:", path)


if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv)>1 else "."
    fig_pf_odkuwka(f"{out}/fig_pf_odkuwka.png")
    fig_pf_pret(f"{out}/fig_pf_pret.png")
    fig_struktura9(f"{out}/fig_struktura9.png")
    fig_grupowanie(f"{out}/fig_grupowanie.png")
    fig_rys_polfabrykat(f"{out}/fig_rys_polfabrykat.png")
    fig_rys_pret_wykonawczy(f"{out}/fig_rys_pret_wykonawczy.png")
