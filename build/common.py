# -*- coding: utf-8 -*-
"""Wspolny framework do generowania dokumentow PDF (technologia maszyn).
Reportlab + fonty DejaVu (obsluga polskich znakow)."""
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether, ListFlowable, ListItem, HRFlowable,
)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DejaVu", os.path.join(FONT_DIR, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Italic", os.path.join(FONT_DIR, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Mono", os.path.join(FONT_DIR, "DejaVuSansMono.ttf")))
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVu-Bold",
                              italic="DejaVu-Italic", boldItalic="DejaVu-Bold")

NAVY = colors.HexColor("#1f3864")
BLUE = colors.HexColor("#2e5496")
LBLUE = colors.HexColor("#d6e0f0")
LLBLUE = colors.HexColor("#eaf0fa")
GREY = colors.HexColor("#595959")
LGREY = colors.HexColor("#f2f2f2")
AMBER = colors.HexColor("#fff2cc")
AMBER_BD = colors.HexColor("#bf9000")
GREEN = colors.HexColor("#548235")
RED = colors.HexColor("#c00000")


def styles():
    ss = getSampleStyleSheet()
    out = {}
    out["title"] = ParagraphStyle("title", fontName="DejaVu-Bold", fontSize=18,
                                  textColor=NAVY, leading=22, spaceAfter=4, alignment=TA_LEFT)
    out["subtitle"] = ParagraphStyle("subtitle", fontName="DejaVu", fontSize=11,
                                     textColor=GREY, leading=14, spaceAfter=10)
    out["h1"] = ParagraphStyle("h1", fontName="DejaVu-Bold", fontSize=13.5, textColor=colors.white,
                               leading=17, spaceBefore=12, spaceAfter=8, backColor=BLUE,
                               borderPadding=(5, 6, 5, 6), leftIndent=0)
    out["h2"] = ParagraphStyle("h2", fontName="DejaVu-Bold", fontSize=11.5, textColor=NAVY,
                               leading=15, spaceBefore=10, spaceAfter=4)
    out["h3"] = ParagraphStyle("h3", fontName="DejaVu-Bold", fontSize=10.3, textColor=BLUE,
                               leading=13, spaceBefore=7, spaceAfter=3)
    out["body"] = ParagraphStyle("body", fontName="DejaVu", fontSize=9.4, leading=13.4,
                                 alignment=TA_JUSTIFY, spaceAfter=5, textColor=colors.HexColor("#1a1a1a"))
    out["bodyc"] = ParagraphStyle("bodyc", parent=out["body"], alignment=TA_CENTER)
    out["small"] = ParagraphStyle("small", fontName="DejaVu", fontSize=8.0, leading=10.5,
                                  textColor=GREY, alignment=TA_LEFT, spaceAfter=3)
    out["bullet"] = ParagraphStyle("bullet", parent=out["body"], leftIndent=12, spaceAfter=2.5)
    out["cell"] = ParagraphStyle("cell", fontName="DejaVu", fontSize=8.3, leading=10.4)
    out["cellb"] = ParagraphStyle("cellb", fontName="DejaVu-Bold", fontSize=8.3, leading=10.4)
    out["cellc"] = ParagraphStyle("cellc", parent=out["cell"], alignment=TA_CENTER)
    out["cellbc"] = ParagraphStyle("cellbc", parent=out["cellb"], alignment=TA_CENTER, textColor=colors.white)
    out["cellh"] = ParagraphStyle("cellh", fontName="DejaVu-Bold", fontSize=8.4, leading=10.6,
                                  alignment=TA_CENTER, textColor=colors.white)
    out["note"] = ParagraphStyle("note", parent=out["body"], fontSize=9.2, leading=12.8,
                                 backColor=AMBER, borderColor=AMBER_BD, borderWidth=0.8,
                                 borderPadding=(6, 7, 6, 7), spaceBefore=4, spaceAfter=6)
    out["okbox"] = ParagraphStyle("okbox", parent=out["body"], fontSize=9.2, leading=12.8,
                                  backColor=colors.HexColor("#e2efda"), borderColor=GREEN,
                                  borderWidth=0.8, borderPadding=(6, 7, 6, 7), spaceBefore=4, spaceAfter=6)
    return out


class DocMaker:
    def __init__(self, path, title, subtitle, land=False, footer=""):
        self.path = path
        self.title = title
        self.subtitle_txt = subtitle
        self.footer = footer
        self.S = styles()
        self.story = []
        self.pagesize = landscape(A4) if land else A4
        self.land = land

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        w, h = canvas._pagesize
        canvas.setStrokeColor(BLUE)
        canvas.setLineWidth(1.4)
        canvas.line(15 * mm, h - 14 * mm, w - 15 * mm, h - 14 * mm)
        canvas.setFont("DejaVu", 7.5)
        canvas.setFillColor(GREY)
        canvas.drawString(15 * mm, h - 12.6 * mm, "Technologia budowy maszyn — Koło zębate (m=3,5; z=51)")
        canvas.drawRightString(w - 15 * mm, h - 12.6 * mm, self.title)
        canvas.setStrokeColor(colors.HexColor("#bfbfbf"))
        canvas.setLineWidth(0.6)
        canvas.line(15 * mm, 12 * mm, w - 15 * mm, 12 * mm)
        canvas.setFont("DejaVu", 7.3)
        canvas.drawString(15 * mm, 8.4 * mm, self.footer)
        canvas.drawRightString(w - 15 * mm, 8.4 * mm, "Strona %d" % doc.page)
        canvas.restoreState()

    def build(self):
        doc = BaseDocTemplate(self.path, pagesize=self.pagesize,
                              leftMargin=15 * mm, rightMargin=15 * mm,
                              topMargin=18 * mm, bottomMargin=15 * mm,
                              title=self.title, author="Opracowanie technologiczne")
        frame = Frame(doc.leftMargin, doc.bottomMargin,
                      doc.width, doc.height, id="main")
        pw, ph = landscape(A4)
        lframe = Frame(15 * mm, 15 * mm, pw - 30 * mm, ph - 33 * mm, id="land")
        doc.addPageTemplates([
            PageTemplate(id="P", frames=[frame], pagesize=self.pagesize,
                         onPage=self._header_footer),
            PageTemplate(id="L", frames=[lframe], pagesize=landscape(A4),
                         onPage=self._header_footer),
        ])
        doc.build(self.story)
        print("PDF:", self.path)

    def landscape_image(self, path, width_mm=255, caption=None):
        from reportlab.platypus import NextPageTemplate
        self.story.append(NextPageTemplate("L"))
        self.story.append(PageBreak())
        self.image(path, width_mm, caption)
        self.story.append(NextPageTemplate("P"))
        self.story.append(PageBreak())

    # --- helpers ---
    def title_block(self):
        self.story.append(Spacer(1, 2 * mm))
        self.story.append(Paragraph(self.title, self.S["title"]))
        self.story.append(Paragraph(self.subtitle_txt, self.S["subtitle"]))
        self.story.append(HRFlowable(width="100%", thickness=1.2, color=BLUE, spaceAfter=6))

    def h1(self, t):
        self.story.append(Paragraph(t, self.S["h1"]))

    def h2(self, t):
        self.story.append(Paragraph(t, self.S["h2"]))

    def h3(self, t):
        self.story.append(Paragraph(t, self.S["h3"]))

    def p(self, t):
        self.story.append(Paragraph(t, self.S["body"]))

    def small(self, t):
        self.story.append(Paragraph(t, self.S["small"]))

    def note(self, t, ok=False):
        self.story.append(Paragraph(t, self.S["okbox" if ok else "note"]))

    def bullets(self, items):
        lf = ListFlowable(
            [ListItem(Paragraph(it, self.S["bullet"]), value="•",
                      leftIndent=10, spaceBefore=1) for it in items],
            bulletType="bullet", bulletFontName="DejaVu", start="•",
            bulletColor=BLUE, leftIndent=8,
        )
        self.story.append(lf)
        self.story.append(Spacer(1, 3))

    def spacer(self, hmm=3):
        self.story.append(Spacer(1, hmm * mm))

    def pagebreak(self):
        self.story.append(PageBreak())

    def _mk_cell(self, text, style):
        if not isinstance(text, str):
            return text
        t = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        t = t.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
        return Paragraph(t, style)

    def table(self, data, col_widths, header=True, font=8.3, align=None,
              header_bg=BLUE, zebra=True, body_align="LEFT", hpad=3.2, vpad=2.6):
        # zawijanie tekstu w komorkach (Paragraph)
        from reportlab.lib.enums import TA_CENTER as _C, TA_LEFT as _L, TA_RIGHT as _R
        amap = {"CENTER": _C, "LEFT": _L, "RIGHT": _R}
        hstyle = ParagraphStyle("th", fontName="DejaVu-Bold", fontSize=font+0.1,
                                leading=font+2.4, alignment=_C, textColor=colors.white)
        bstyle = ParagraphStyle("td", fontName="DejaVu", fontSize=font,
                                leading=font+2.2, alignment=amap.get(body_align, _L),
                                textColor=colors.HexColor("#1a1a1a"))
        ndata = []
        for r, row in enumerate(data):
            nrow = []
            for c, cell in enumerate(row):
                st = hstyle if (header and r == 0) else bstyle
                nrow.append(self._mk_cell(cell, st))
            ndata.append(nrow)
        data = ndata
        ts = [
            ("FONTNAME", (0, 0), (-1, -1), "DejaVu"),
            ("FONTSIZE", (0, 0), (-1, -1), font),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9fb0cc")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), hpad),
            ("RIGHTPADDING", (0, 0), (-1, -1), hpad),
            ("TOPPADDING", (0, 0), (-1, -1), vpad),
            ("BOTTOMPADDING", (0, 0), (-1, -1), vpad),
            ("ALIGN", (0, 0), (-1, -1), body_align),
        ]
        if header:
            ts += [
                ("BACKGROUND", (0, 0), (-1, 0), header_bg),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "DejaVu-Bold"),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
            ]
            if zebra:
                for r in range(1, len(data)):
                    if r % 2 == 0:
                        ts.append(("BACKGROUND", (0, r), (-1, r), LLBLUE))
        if align:
            for (c0, r0, c1, r1, a) in align:
                ts.append(("ALIGN", (c0, r0), (c1, r1), a))
        t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
        t.setStyle(TableStyle(ts))
        self.story.append(t)
        self.story.append(Spacer(1, 4))

    def para_cell(self, text, bold=False, center=False, white=False):
        if white:
            return Paragraph(text, self.S["cellbc"])
        if bold and center:
            return Paragraph(text, self.S["cellbc"] if white else
                             ParagraphStyle("x", parent=self.S["cellb"], alignment=TA_CENTER))
        if bold:
            return Paragraph(text, self.S["cellb"])
        if center:
            return Paragraph(text, self.S["cellc"])
        return Paragraph(text, self.S["cell"])

    def image(self, path, width_mm, caption=None):
        from reportlab.lib.utils import ImageReader
        ir = ImageReader(path)
        iw, ih = ir.getSize()
        w = width_mm * mm
        hh = w * ih / iw
        img = Image(path, width=w, height=hh)
        img.hAlign = "CENTER"
        self.story.append(img)
        if caption:
            self.story.append(Paragraph(caption, ParagraphStyle(
                "cap", fontName="DejaVu-Italic", fontSize=8.2, textColor=GREY,
                alignment=TA_CENTER, spaceBefore=2, spaceAfter=6)))
