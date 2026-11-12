"""Build the Epson camera-calibration guide as DOCX and PDF from poradnik.md."""

from __future__ import annotations

import html
import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    HRFlowable,
    Image as RLImage,
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "artifacts" / "poradnik-epson-kalibracja" / "poradnik.md"
OUT_DIR = SRC.parent
BASE = OUT_DIR
STEM = "Kalibracja_kamery_EPSON_Vision_Guide"

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVuBold", italic="DejaVu", boldItalic="DejaVuBold")

NOTE_BG = "FFF4D6"


def parse(md: str) -> list[dict]:
    lines = md.splitlines()
    blocks: list[dict] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("# "):
            blocks.append({"type": "h1", "text": line[2:].strip()})
        elif line.startswith("### "):
            blocks.append({"type": "h3", "text": line[4:].strip()})
        elif line.startswith("## "):
            blocks.append({"type": "h2", "text": line[3:].strip()})
        elif line.startswith("> "):
            parts = []
            while i < len(lines) and lines[i].startswith(">"):
                parts.append(lines[i].lstrip(">").strip())
                i += 1
            blocks.append({"type": "note", "text": " ".join(p for p in parts if p)})
            continue
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(set(c) <= set("-: ") for c in cells):
                    rows.append(cells)
                i += 1
            blocks.append({"type": "table", "rows": rows})
            continue
        elif line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:].strip())
                i += 1
            blocks.append({"type": "ul", "items": items})
            continue
        elif re.match(r"\d+\. ", line):
            items = []
            while i < len(lines) and re.match(r"\d+\. ", lines[i]):
                items.append(re.sub(r"^\d+\. ", "", lines[i]).strip())
                i += 1
            blocks.append({"type": "ol", "items": items})
            continue
        elif line.startswith("!["):
            match = re.match(r"!\[(.*?)\]\((.*?)\)", line.strip())
            blocks.append({"type": "img", "alt": match.group(1), "src": match.group(2)})
        elif line.strip() == "---":
            blocks.append({"type": "hr"})
        else:
            blocks.append({"type": "p", "text": line.strip()})
        i += 1
    return blocks


INLINE = re.compile(r"(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))")


def iter_inline(text: str):
    pos = 0
    for match in INLINE.finditer(text):
        if match.start() > pos:
            yield ("text", text[pos : match.start()])
        token = match.group(0)
        if token.startswith("**"):
            yield ("bold", token[2:-2])
        else:
            label, url = re.match(r"\[([^\]]+)\]\(([^)]+)\)", token).groups()
            yield ("link", label, url)
        pos = match.end()
    if pos < len(text):
        yield ("text", text[pos:])


def xml_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def to_rl(text: str) -> str:
    out = []
    for part in iter_inline(text):
        if part[0] == "text":
            out.append(xml_escape(part[1]))
        elif part[0] == "bold":
            out.append(f"<b>{xml_escape(part[1])}</b>")
        else:
            out.append(f'<link href="{part[2]}" color="blue">{xml_escape(part[1])}</link>')
    return "".join(out)


def shade_cell(cell, hex_color: str) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tc_pr.append(shd)


def set_run_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color is not None:
        run.font.color.rgb = color


def add_inline(paragraph, text, size=11, color=None):
    for part in iter_inline(text):
        if part[0] == "link":
            add_hyperlink(paragraph, part[1], part[2], size)
            continue
        run = paragraph.add_run(part[1] if part[0] == "text" else part[1])
        set_run_font(run, size=size, bold=part[0] == "bold", color=color)


def add_hyperlink(paragraph, text, url, size=11):
    part = paragraph.part
    rel_id = part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rel_id)
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    r_pr.append(color)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(underline)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(size * 2))
    r_pr.append(sz)
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), "Calibri")
    r_fonts.set(qn("w:hAnsi"), "Calibri")
    r_pr.append(r_fonts)
    run.append(r_pr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    run.append(text_el)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def image_size(path: Path, max_w_cm: float) -> tuple[float, float]:
    with PILImage.open(path) as im:
        w, h = im.size
    # Dialog screenshots stay narrower than full RC+ windows.
    width = 11.5 if w < 900 else max_w_cm
    height = width * h / w
    if height > 18:
        height = 18
        width = height * w / h
    return width, height


def add_page_number(paragraph):
    run = paragraph.add_run()
    set_run_font(run, size=9, color=RGBColor(0x66, 0x66, 0x66))

    def fld(kind):
        el = OxmlElement("w:fldChar")
        el.set(qn("w:fldCharType"), kind)
        return el

    begin = fld("begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    end = fld("end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(end)


def build_docx(blocks: list[dict], dest: Path) -> None:
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(1.8)
    section.right_margin = Cm(1.8)
    section.top_margin = Cm(1.7)
    section.bottom_margin = Cm(1.7)
    content_w = 17.4

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.12

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number(footer)

    for block in blocks:
        kind = block["type"]
        if kind == "h1":
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(12)
            add_inline(p, block["text"], size=20)
            for run in p.runs:
                run.bold = True
        elif kind in ("h2", "h3"):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14 if kind == "h2" else 10)
            p.paragraph_format.space_after = Pt(6)
            add_inline(p, block["text"], size=15 if kind == "h2" else 13)
            for run in p.runs:
                run.bold = True
        elif kind == "note":
            table = doc.add_table(rows=1, cols=1)
            cell = table.cell(0, 0)
            shade_cell(cell, NOTE_BG)
            cell.paragraphs[0].clear()
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            add_inline(p, block["text"], size=10)
            doc.add_paragraph().paragraph_format.space_after = Pt(4)
        elif kind == "p":
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(8)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            add_inline(p, block["text"])
            if block["text"].startswith("Z tego artykułu") or block["text"].startswith("Autor") or block["text"].startswith("**Maciej"):
                p.paragraph_format.keep_with_next = True
        elif kind in ("ul", "ol"):
            style = "List Bullet" if kind == "ul" else "List Number"
            for item in block["items"]:
                p = doc.add_paragraph(style=style)
                p.paragraph_format.space_after = Pt(2)
                add_inline(p, item)
        elif kind == "img":
            path = BASE / block["src"]
            w, h = image_size(path, content_w)
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(10)
            run = p.add_run()
            run.add_picture(str(path), width=Cm(w), height=Cm(h))
        elif kind == "table":
            rows = block["rows"]
            table = doc.add_table(rows=len(rows), cols=len(rows[0]))
            table.style = "Table Grid"
            for r, row in enumerate(rows):
                for c, value in enumerate(row):
                    cell = table.cell(r, c)
                    cell.paragraphs[0].clear()
                    p = cell.paragraphs[0]
                    add_inline(p, value, size=10)
                    if r == 0 or c == 0:
                        for run in p.runs:
                            run.bold = True
            doc.add_paragraph().paragraph_format.space_after = Pt(4)
        elif kind == "hr":
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.keep_with_next = True
            p_pr = p._p.get_or_add_pPr()
            p_bdr = OxmlElement("w:pBdr")
            bottom = OxmlElement("w:bottom")
            bottom.set(qn("w:val"), "single")
            bottom.set(qn("w:sz"), "6")
            bottom.set(qn("w:space"), "1")
            bottom.set(qn("w:color"), "CCCCCC")
            p_bdr.append(bottom)
            p_pr.append(p_bdr)

    core = doc.core_properties
    core.title = "Kalibracja kamery w systemie wizyjnym EPSON Vision Guide"
    core.author = "Maciej Tkacz"
    core.category = "Poradnik Automatyka"
    doc.save(dest)


def build_pdf(blocks: list[dict], dest: Path) -> None:
    styles = {
        "h1": ParagraphStyle(
            "h1", fontName="DejaVuBold", fontSize=18, leading=22, textColor=colors.black, spaceAfter=10
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="DejaVuBold",
            fontSize=14,
            leading=18,
            textColor=colors.black,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName="DejaVuBold",
            fontSize=12,
            leading=16,
            textColor=colors.black,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", fontName="DejaVu", fontSize=10.5, leading=14.5, alignment=TA_JUSTIFY, spaceAfter=8
        ),
        "note": ParagraphStyle("note", fontName="DejaVu", fontSize=9, leading=12.5, textColor=colors.HexColor("#3D3208")),
        "li": ParagraphStyle("li", fontName="DejaVu", fontSize=10.5, leading=14, leftIndent=0),
        "th": ParagraphStyle("th", fontName="DejaVuBold", fontSize=9, leading=12, textColor=colors.black),
        "td": ParagraphStyle("td", fontName="DejaVu", fontSize=9, leading=12),
        "tdb": ParagraphStyle("tdb", fontName="DejaVuBold", fontSize=9, leading=12),
    }
    story = []
    author_group = None
    for block in blocks:
        kind = block["type"]
        target = author_group if author_group is not None else story
        if kind in ("h1", "h2", "h3"):
            target.append(Paragraph(to_rl(block["text"]), styles[kind]))
        elif kind == "note":
            inner = Paragraph(to_rl(block["text"]), styles["note"])
            table = Table([[inner]], colWidths=[17.2 * cm])
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF4D6")),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                        ("TOPPADDING", (0, 0), (-1, -1), 8),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                        ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2C56A")),
                    ]
                )
            )
            target.append(table)
            target.append(Spacer(1, 8))
        elif kind == "p":
            target.append(Paragraph(to_rl(block["text"]), styles["body"]))
        elif kind in ("ul", "ol"):
            items = []
            for item in block["items"]:
                items.append(ListItem(Paragraph(to_rl(item), styles["li"]), leftIndent=12))
            target.append(
                ListFlowable(
                    items,
                    bulletType="1" if kind == "ol" else "bullet",
                    start="1" if kind == "ol" else "•",
                    leftIndent=16,
                    bulletFontName="DejaVu",
                    bulletFontSize=10,
                    spaceBefore=2,
                    spaceAfter=8,
                )
            )
        elif kind == "img":
            path = BASE / block["src"]
            w, h = image_size(path, 17.2)
            img = RLImage(str(path), width=w * cm, height=h * cm)
            img.hAlign = "CENTER"
            target.append(CondPageBreak(h * cm + 12))
            target.append(img)
            target.append(Spacer(1, 10))
        elif kind == "table":
            rows = block["rows"]
            data = []
            for r, row in enumerate(rows):
                styled = []
                for c, value in enumerate(row):
                    style = styles["th"] if r == 0 else (styles["tdb"] if c == 0 else styles["td"])
                    styled.append(Paragraph(to_rl(value) or " ", style))
                data.append(styled)
            col_w = [5.2 * cm, 6.0 * cm, 6.0 * cm]
            table = Table(data, colWidths=col_w, hAlign="LEFT")
            table.setStyle(
                TableStyle(
                    [
                        ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]
                )
            )
            target.append(table)
            target.append(Spacer(1, 8))
        elif kind == "hr":
            author_group = []
            if story and isinstance(story[-1], Paragraph):
                author_group.append(story.pop())
            author_group.append(Spacer(1, 6))
            author_group.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor("#CCCCCC")))
            author_group.append(Spacer(1, 8))
    if author_group:
        story.append(KeepTogether(author_group))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("DejaVu", 8)
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawCentredString(A4[0] / 2, 1.0 * cm, str(doc.page))
        canvas.restoreState()

    pdf = SimpleDocTemplate(
        str(dest),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="Kalibracja kamery w systemie wizyjnym EPSON Vision Guide",
        author="Maciej Tkacz",
    )
    pdf.build(story, onFirstPage=footer, onLaterPages=footer)


def to_html(text: str) -> str:
    parts = []
    for part in iter_inline(text):
        if part[0] == "text":
            parts.append(html.escape(part[1]))
        elif part[0] == "bold":
            parts.append(f"<strong>{html.escape(part[1])}</strong>")
        else:
            parts.append(f'<a href="{html.escape(part[2], quote=True)}">{html.escape(part[1])}</a>')
    return "".join(parts)


def spacer(px: int) -> str:
    return (
        f'<!-- wp:spacer {{"height":"{px}px"}} -->\n'
        f'<div style="height:{px}px" aria-hidden="true" class="wp-block-spacer"></div>\n'
        f"<!-- /wp:spacer -->"
    )


def build_wp(blocks: list[dict], dest: Path) -> None:
    chunks = [
        "<!-- Bloki Gutenberga. Obrazki wskazują pliki z folderu zrzuty/. Po wgraniu do biblioteki mediów podmień src. -->"
    ]
    for block in blocks:
        kind = block["type"]
        if kind == "h1":
            continue
        if kind == "h2":
            chunks.append(spacer(50))
            chunks.append(
                "<!-- wp:heading -->\n"
                f"<h2 class=\"wp-block-heading\">{to_html(block['text'])}</h2>\n"
                "<!-- /wp:heading -->"
            )
        elif kind == "h3":
            chunks.append(spacer(30))
            chunks.append(
                "<!-- wp:heading {\"level\":3} -->\n"
                f"<h3 class=\"wp-block-heading\">{to_html(block['text'])}</h3>\n"
                "<!-- /wp:heading -->"
            )
        elif kind == "p":
            chunks.append(
                "<!-- wp:paragraph -->\n"
                f"<p>{to_html(block['text'])}</p>\n"
                "<!-- /wp:paragraph -->"
            )
        elif kind in ("ul", "ol"):
            tag = "ul" if kind == "ul" else "ol"
            ordered = ' {"ordered":true}' if kind == "ol" else ""
            items = "\n".join(f"<li>{to_html(item)}</li>" for item in block["items"])
            chunks.append(
                f"<!-- wp:list{ordered} -->\n"
                f'<{tag} class="wp-block-list">\n{items}\n</{tag}>\n'
                "<!-- /wp:list -->"
            )
        elif kind == "img":
            name = Path(block["src"]).name
            chunks.append(spacer(30))
            chunks.append(
                '<!-- wp:image {"align":"center","sizeSlug":"full"} -->\n'
                f'<figure class="wp-block-image aligncenter size-full"><img src="{html.escape(name)}" alt=""/></figure>\n'
                "<!-- /wp:image -->"
            )
            chunks.append(spacer(30))
        elif kind == "table":
            rows = []
            for r, row in enumerate(block["rows"]):
                cell = "th" if r == 0 else "td"
                inner = "".join(f"<{cell}>{to_html(value)}</{cell}>" for value in row)
                rows.append(f"<tr>{inner}</tr>")
            body = "\n".join(rows)
            chunks.append(
                "<!-- wp:table -->\n"
                f'<figure class="wp-block-table"><table><tbody>\n{body}\n</tbody></table></figure>\n'
                "<!-- /wp:table -->"
            )
        elif kind == "hr":
            chunks.append(spacer(40))
    dest.write_text("\n\n".join(chunks) + "\n", encoding="utf-8")


def main() -> None:
    blocks = parse(SRC.read_text(encoding="utf-8"))
    docx_path = OUT_DIR / f"{STEM}.docx"
    pdf_path = OUT_DIR / f"{STEM}.pdf"
    build_docx(blocks, docx_path)
    build_pdf(blocks, pdf_path)
    wp_path = OUT_DIR / "poradnik-wordpress.html"
    build_wp(blocks, wp_path)
    print(docx_path, docx_path.stat().st_size)
    print(pdf_path, pdf_path.stat().st_size)
    print(wp_path, wp_path.stat().st_size)


if __name__ == "__main__":
    main()
