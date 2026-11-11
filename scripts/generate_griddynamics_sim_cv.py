"""Generate the Grid Dynamics Robotics Lab application package (vacancy 65335 / 59381).

Standalone: shares no state with the other CV generators, so running it never touches
the SoftServe / Red Sky / Inbolt / Maus / universal packages or the older Grid Dynamics one.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Inches, Pt, RGBColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

OUT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "griddynamics-robotics-lab"
PORTRAIT = Path(__file__).resolve().parent / "assets" / "portrait.jpg"
FONT_REGULAR = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
ACCENT = "1F4E79"

pdfmetrics.registerFont(TTFont(FONT_REGULAR, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

# Flip to True ONLY after the SCARA has actually been imported into Isaac Sim / OpenUSD and
# driven by a Python script, then regenerate. Until then the CV makes no Isaac Sim claim at all.
# See README.md - doing this is roughly 10-15 hours and is the single highest-value action
# before applying, because Isaac Sim is the only real gap against vacancy 65335.
ISAAC_PORT_DONE = False

NAME = "Maciej Tkacz"
TITLE = "Simulation Engineer - Physics-Based Robot Simulation, CAD-to-Sim, Python"

CONTACT = [
    "maciek01110@gmail.com",
    "+48 881 912 125",
    "Krakow, Poland",
    "Polish citizen (EU) - no sponsorship needed",
    "English C1 | Polish native",
]

ISAAC_PROFILE = (
    " I have ported that arm into Isaac Sim through the URDF-to-OpenUSD pipeline and drive it "
    "from Python, which is where I am taking this experience next."
    if ISAAC_PORT_DONE
    else " I am now moving this work onto the OpenUSD and Isaac Sim pipeline, which is the "
    "toolchain rather than the discipline that is new to me."
)

PROFILE = (
    "Simulation engineer with two years of commercial experience building physics-based robot "
    "simulations and digital twins of production systems, scripting simulation logic in Python, "
    "and turning CAD models into working simulation assets. Mechanical Engineering student at "
    "Cracow University of Technology, so the physical parameters, kinematics and constraints I "
    "tune in a simulator are quantities I understand from first principles rather than numbers I "
    "adjust until the scene looks right. Currently a Robotics Engineer at ASTOR, programming "
    "Kawasaki and Epson industrial robots and their vision systems, building digital twins of "
    "production lines and commissioning the physical stations those twins describe - so I "
    "routinely see where a simulation and the real machine disagree. I also designed, built and "
    "programmed a SCARA "
    "robotic arm from scratch, including its forward and inverse kinematics, and validated the "
    "control software against the physical arm." + ISAAC_PROFILE
)

ISAAC_SKILL = (
    "NVIDIA Isaac Sim and OpenUSD: URDF-to-USD import of my own SCARA arm, articulation and "
    "joint-drive setup, collision geometry, and Python-driven motion - a self-directed port of a "
    "real robot I built, not a tutorial scene."
    if ISAAC_PORT_DONE
    else "NVIDIA Isaac Sim and OpenUSD: currently in progress on my own hardware - porting the "
    "SCARA arm I built into USD and driving it from Python. I would rather state this accurately "
    "than claim commercial hours I do not have."
)

STRENGTHS = [
    "Physics-based simulation, commercially: two years building robot workcell simulations and digital twins for automotive production, covering robot motion, process logic, collision checking, reach validation and cycle behaviour before anything was built physically.",
    "Python inside the simulator, including my own plugins: scripted simulation behaviour, automated scene and process setup, and optimized simulation performance through Visual Components' Python API. When a cell needed behaviour the built-in options could not express, I wrote plugins and functions for it rather than simplifying the process to fit the tool.",
    "CAD to simulation asset: SolidWorks, Autodesk Inventor, Fusion 360 and AutoCAD. I prepare, simplify and optimize 3D geometry specifically for simulation use - reducing mesh complexity, fixing collision geometry, and keeping assets usable rather than merely accurate.",
    "Validating and tuning physical parameters: kinematics, joint constraints, gear ratios, masses and inertias derived from CAD rather than guessed. My mechanical engineering coursework covers dynamic systems modelling, control and analytical mechanics.",
    "Where simulation meets the real machine: I program Kawasaki and Epson robots and commission the physical stations, so I see the gap between a model and the hardware regularly - which is the part of this discipline that cannot be learned from a simulator alone.",
    "Robot vision, on the station and in the simulator: the Epson vision system in RC+ and the Kawasaki vision system. Camera and robot calibration, object models and search setup tuned so detection holds up, part queues, and several different objects on a feeder at the same time. I have also run the Epson vision loop inside the RC+ simulator.",
    ISAAC_SKILL,
    "Working practice: Git-based version control of simulation assets and code, technical documentation of simulation workflows, and direct communication of assumptions and constraints to client engineers.",
]

PROJECT_TITLE = "SCARA Robotic Arm - designed, built, programmed and measured"
PROJECT_SUBTITLE = "Personal R&D project"
PROJECT = [
    "Designed the complete machine: mechanical concept, CAD, kinematic layout and gear ratios, selection of NEMA stepper actuators and TMC/DRV drivers, microcontroller electronics and wiring.",
    "Implemented forward and inverse kinematics in Python and C++ and validated the control software against the physical arm rather than only against the model.",
    "Designed every printed part for stiffness and assembly in PET-G and carbon-fibre reinforced material, iterating through repeated print, assemble and test cycles.",
    "The reason this matters for a simulation role: I own both halves of the comparison. I have the CAD, the real masses and inertias, the kinematic model and the physical machine, which makes a measured sim-to-real study possible rather than hypothetical.",
]

JOBS = [
    {
        "role": "Robotics Engineer",
        "company": "ASTOR",
        "location": "Krakow, Poland",
        "date": "Jul 2026 - present",
        "items": [
            "Build digital twins of production lines and robot simulations, validating reach, motion sequences and process behaviour before physical implementation.",
            "Program Kawasaki and Epson robots, including vision-guided applications: calibration, object models and search setup, part queues, and several different objects on a feeder at the same time.",
            "Run the Epson vision loop inside the RC+ simulator as well as on the station, and do the same class of vision work on the Kawasaki vision system.",
            "Design, build and commission demonstration stations presenting these robots in different applications - mechanical assembly, hardware-software integration, programming and bring-up.",
            "Test and troubleshoot robot cells end to end, across mechanics, electrics and robot software.",
        ],
    },
    {
        "role": "Application Engineer",
        "company": "AIAutomation",
        "location": "Poland",
        "date": "Jan 2025 - May 2026",
        "items": [
            "Built robotics simulations and digital twins of production workcells in Visual Components for automotive clients.",
            "Wrote Python scripts, plugins and functions inside Visual Components: automation and process logic where the built-in options were enough, and custom behaviour where they were not.",
            "Developed robot paths, motion sequences, process logic, collision checking and cycle flows; validated processes virtually before implementation.",
            "Prepared and optimized workcell layouts and 3D geometry for simulation use, working from CAD in SolidWorks and Autodesk Inventor.",
            "Worked from customer documentation and engineering standards, and presented simulation assumptions, constraints and improvement proposals directly to client engineers.",
        ],
    },
    {
        "role": "3D Printing and CAD Design Specialist",
        "company": "Cubic Inch Additive Manufacturing",
        "location": "Piaseczno, Poland",
        "date": "Jun 2023 - Aug 2023",
        "items": [
            "Designed and optimized CAD models in Fusion 360 and Autodesk Inventor for additive manufacturing.",
            "Ran FDM, MJF and SLA printers in production: process parameters, post-processing and quality control.",
            "Coordinated production tasks in a 10-person team, balancing quality, manufacturability and deadlines.",
        ],
    },
    {
        "role": "Robotics and 3D Printing Intern",
        "company": "ASTOR Robotics Center",
        "location": "Krakow, Poland",
        "date": "May 2022",
        "items": [
            "Assembled mechanical hardware and 3D-printed components for Kawasaki robots and Astorino robot platforms.",
            "Programmed Kawasaki robots via teach pendant and wrote basic motion programs.",
        ],
    },
]

EDUCATION = [
    "Cracow University of Technology - Mechanical Engineering, Engineer's degree in progress (Oct 2024 - present). Coursework: dynamic systems modelling, automation and control, analytical mechanics, mechatronics.",
    "PKMechPower Student Research Group, Mechanical Section - CAD and 3D-printed parts for a student vehicle, optimized for mass and strength.",
    "Zespol Szkol Informatycznych, Kielce - Software Technician diploma (Sep 2019 - Apr 2024).",
]

CERTIFICATES = [
    "Kawasaki robot operation and programming - integrator course with certificate, ASTOR Robotics Center.",
    "Epson industrial robot programming - certified course.",
    "Python programming courses, plus self-directed Python and C++ development in robotics and simulation projects.",
]

SIDEBAR_ISAAC = (
    ["Isaac Sim / OpenUSD", "USD asset pipeline"] if ISAAC_PORT_DONE else ["Isaac Sim (in progress)"]
)

SIDEBAR = {
    "Contact": [
        "maciek01110@gmail.com",
        "+48 881 912 125",
        "Krakow, Poland",
    ],
    "Eligibility": ["Polish citizen (EU)", "No sponsorship needed"],
    "Languages": ["Polish - native", "English - C1"],
    "Simulation": [
        "Visual Components",
        "Python plugins in VC",
        "Digital twins",
        "Physics-based simulation",
        "Collision checking",
        "Cycle & process validation",
        "Kinematics & constraints",
    ]
    + SIDEBAR_ISAAC,
    "Code": ["Python", "C++ / Arduino C", "Git", "MATLAB basics", "ROS (personal projects)"],
    "CAD & 3D": [
        "SolidWorks",
        "Autodesk Inventor",
        "Fusion 360",
        "AutoCAD",
        "Mesh & collision prep",
        "FDM / SLA / MJF printing",
    ],
    "Vision": [
        "Epson vision in RC+",
        "Kawasaki vision",
        "Calibration",
        "Object models & search",
        "Part queues",
        "Multi-part feeder",
        "Vision-in-the-loop, RC+",
    ],
    "Robots": ["Kawasaki", "Epson", "Self-built SCARA"],
}

CONSENT = (
    "I consent to the processing of my personal data for the purpose of this recruitment process."
)


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def shade(cell, fill: str) -> None:
    element = OxmlElement("w:shd")
    element.set(qn("w:val"), "clear")
    element.set(qn("w:fill"), fill)
    cell._tc.get_or_add_tcPr().append(element)


def doc_defaults(doc: Document) -> None:
    section = doc.sections[0]
    section.top_margin = Cm(1.3)
    section.bottom_margin = Cm(1.2)
    section.left_margin = Cm(1.4)
    section.right_margin = Cm(1.4)
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(9.5)


def doc_heading(container, text: str, size: float = 10.5) -> None:
    p = container.add_paragraph()
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text.upper())
    run.bold = True
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(ACCENT)


def doc_bullets(container, items: Iterable[str]) -> None:
    for item in items:
        p = container.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(1.5)
        p.paragraph_format.left_indent = Cm(0.35)
        p.add_run(item)


def build_ats_docx() -> Path:
    doc = Document()
    doc_defaults(doc)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(NAME)
    run.bold = True
    run.font.size = Pt(20)
    run.font.color.rgb = RGBColor.from_string(ACCENT)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(TITLE)
    run.bold = True
    run.font.size = Pt(10)

    p = doc.add_paragraph(" | ".join(CONTACT))
    p.paragraph_format.space_after = Pt(2)

    doc_heading(doc, "Profile")
    doc.add_paragraph(PROFILE)

    doc_heading(doc, "What I bring")
    doc_bullets(doc, STRENGTHS)

    doc_heading(doc, "Selected project")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(1)
    p.add_run(f"{PROJECT_TITLE} | {PROJECT_SUBTITLE}").bold = True
    doc_bullets(doc, PROJECT)

    doc_heading(doc, "Experience")
    for job in JOBS:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(1)
        p.add_run(job["role"]).bold = True
        p.add_run(f" | {job['company']}, {job['location']} | {job['date']}")
        doc_bullets(doc, job["items"])

    doc_heading(doc, "Education")
    doc_bullets(doc, EDUCATION)

    doc_heading(doc, "Certificates")
    doc_bullets(doc, CERTIFICATES)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    run = p.add_run(CONSENT)
    run.font.size = Pt(7)

    path = OUT_DIR / "Maciej_Tkacz_CV_GridDynamics_Simulation_ATS.docx"
    doc.save(path)
    return path


def build_visual_docx() -> Path:
    doc = Document()
    doc_defaults(doc)

    header = doc.add_table(rows=1, cols=1)
    header.alignment = WD_TABLE_ALIGNMENT.CENTER
    hcell = header.cell(0, 0)
    shade(hcell, "003C73")
    p = hcell.paragraphs[0]
    run = p.add_run(NAME)
    run.bold = True
    run.font.size = Pt(20)
    run.font.color.rgb = RGBColor(255, 255, 255)
    p2 = hcell.add_paragraph(TITLE)
    p2.runs[0].font.color.rgb = RGBColor(255, 255, 255)
    p2.runs[0].font.size = Pt(9)

    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(4.7)
    table.columns[1].width = Inches(2.0)
    left = table.cell(0, 0)
    right = table.cell(0, 1)
    left.width = Inches(4.7)
    right.width = Inches(2.0)
    right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    shade(right, "F3F4F6")
    photo = right.paragraphs[0]
    photo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    photo.add_run().add_picture(str(PORTRAIT), width=Inches(1.35))

    doc_heading(left, "Profile")
    left.add_paragraph(PROFILE)

    doc_heading(left, "What I bring")
    doc_bullets(left, STRENGTHS)

    doc_heading(left, "Selected project")
    p = left.add_paragraph()
    p.add_run(f"{PROJECT_TITLE} | {PROJECT_SUBTITLE}").bold = True
    doc_bullets(left, PROJECT)

    doc_heading(left, "Experience")
    for job in JOBS:
        p = left.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.add_run(job["role"]).bold = True
        p.add_run(f" | {job['company']}, {job['location']} | {job['date']}")
        doc_bullets(left, job["items"])

    doc_heading(left, "Education")
    doc_bullets(left, EDUCATION)

    doc_heading(left, "Certificates")
    doc_bullets(left, CERTIFICATES)

    for heading, items in SIDEBAR.items():
        doc_heading(right, heading, size=9.5)
        doc_bullets(right, items)

    doc_heading(right, "Consent", size=9.5)
    c = right.add_paragraph(CONSENT)
    c.runs[0].font.size = Pt(7)

    path = OUT_DIR / "Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.docx"
    doc.save(path)
    return path


def build_ats_pdf() -> Path:
    path = OUT_DIR / "Maciej_Tkacz_CV_GridDynamics_Simulation_ATS.pdf"
    left, top, bottom = 2.0 * cm, A4[1] - 1.8 * cm, 1.6 * cm
    width = A4[0] - 2.0 * cm - left
    c = canvas.Canvas(str(path), pagesize=A4)
    y = top

    def ensure(needed: float) -> None:
        nonlocal y
        if y - needed < bottom:
            c.showPage()
            y = top

    def heading(text: str) -> None:
        nonlocal y
        ensure(22)
        y -= 6
        c.setFont(FONT_BOLD, 9.6)
        c.setFillColorRGB(0.12, 0.31, 0.47)
        c.drawString(left, y, text.upper())
        y -= 3
        c.setStrokeColorRGB(0.12, 0.31, 0.47)
        c.setLineWidth(0.6)
        c.line(left, y, left + width, y)
        y -= 9
        c.setFillColorRGB(0, 0, 0)

    def text(body: str, size: float = 8.7, font: str = FONT_REGULAR, leading: float = 10.9) -> None:
        nonlocal y
        for line in wrap(body, font, size, width):
            ensure(leading)
            c.setFont(font, size)
            c.drawString(left, y, line)
            y -= leading

    def bullet(body: str, size: float = 8.7, leading: float = 10.9) -> None:
        nonlocal y
        for index, line in enumerate(wrap(body, FONT_REGULAR, size, width - 10)):
            ensure(leading)
            c.setFont(FONT_REGULAR, size)
            if index == 0:
                c.drawString(left, y, "\u2022")
            c.drawString(left + 10, y, line)
            y -= leading
        y -= 1

    c.setFont(FONT_BOLD, 19)
    c.setFillColorRGB(0.12, 0.31, 0.47)
    c.drawString(left, y, NAME)
    y -= 15
    c.setFillColorRGB(0, 0, 0)
    c.setFont(FONT_BOLD, 9.6)
    c.drawString(left, y, TITLE)
    y -= 12
    text(" | ".join(CONTACT), size=7.8, leading=9.6)

    heading("Profile")
    text(PROFILE)
    heading("What I bring")
    for item in STRENGTHS:
        bullet(item)
    heading("Selected project")
    text(f"{PROJECT_TITLE} | {PROJECT_SUBTITLE}", size=8.9, font=FONT_BOLD)
    for item in PROJECT:
        bullet(item)
    heading("Experience")
    for job in JOBS:
        text(f"{job['role']} | {job['company']}, {job['location']} | {job['date']}",
             size=8.9, font=FONT_BOLD)
        for item in job["items"]:
            bullet(item)
        y -= 2
    heading("Education")
    for item in EDUCATION:
        bullet(item)
    heading("Certificates")
    for item in CERTIFICATES:
        bullet(item)
    y -= 4
    text(CONSENT, size=6.8, leading=8)
    c.save()
    return path


def date_rail(date: str) -> tuple[str, str]:
    months = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
        "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
    }

    def one(part: str) -> str:
        part = part.strip()
        if part.lower() == "present":
            return "present"
        bits = part.split()
        if len(bits) == 2 and bits[0] in months:
            return f"{bits[1]}-{months[bits[0]]}"
        return part

    if " - " in date:
        start, end = date.split(" - ", 1)
        return one(start), one(end)
    return one(date), ""


def build_visual_pdf() -> Path:
    """Visual CV in the two-column layout of the earlier personal CV.

    Navy name bar, dates in a rail, photo and a short skill list on the right.
    The ATS file stays single-column. This one is the document a person reads.
    """
    path = OUT_DIR / "Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.pdf"
    page_w, page_h = A4
    navy = (0 / 255, 60 / 255, 115 / 255)
    ink = (0.13, 0.14, 0.16)
    muted = (0.35, 0.38, 0.42)
    side_bg = (0.945, 0.949, 0.953)

    main_x = 1.15 * cm
    side_w = 5.05 * cm
    margin_r = 0.7 * cm
    side_x = page_w - margin_r - side_w
    gap = 0.38 * cm
    main_w = side_x - gap - main_x
    date_w = 1.62 * cm
    text_x = main_x + date_w + 0.18 * cm
    text_w = main_x + main_w - text_x
    header_h = 2.05 * cm
    bottom = 1.05 * cm

    isaac = "Isaac Sim / OpenUSD" if ISAAC_PORT_DONE else "Isaac Sim (in progress)"
    side_groups = [
        ("Contact", [
            "maciek01110@gmail.com",
            "+48 881 912 125",
            "Krakow, Poland",
            "EU citizen, no sponsorship",
        ]),
        ("Languages", ["Polish - native", "English - C1"]),
        ("Simulation", [
            "Visual Components",
            "Python plugins in VC",
            "Digital twins",
            "Physics-based simulation",
            isaac,
        ]),
        ("Vision", [
            "Epson vision in RC+",
            "Kawasaki vision",
            "Calibration and search",
            "Queues, multi-part feeder",
        ]),
        ("Code", ["Python", "C++", "Git"]),
        ("CAD", ["SolidWorks", "Inventor", "Fusion 360", "AutoCAD"]),
        ("Robots", ["Kawasaki", "Epson", "Self-built SCARA"]),
    ]

    c = canvas.Canvas(str(path), pagesize=A4)
    y = 0.0
    first_page = True

    def paint_chrome() -> None:
        nonlocal y
        c.setFillColorRGB(*navy)
        c.rect(0, page_h - header_h, page_w, header_h, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1)
        if first_page:
            c.setFont(FONT_BOLD, 18)
            c.drawString(main_x, page_h - 0.78 * cm, NAME)
            title_y = page_h - 1.22 * cm
            c.setFont(FONT_REGULAR, 8)
            for line in wrap(TITLE, FONT_REGULAR, 8, main_w):
                c.drawString(main_x, title_y, line)
                title_y -= 10
        else:
            c.setFont(FONT_BOLD, 12)
            c.drawString(main_x, page_h - 1.15 * cm, NAME)
        c.setFillColorRGB(*side_bg)
        c.rect(side_x - 0.18 * cm, 0, page_w - side_x + 0.18 * cm, page_h - header_h, stroke=0, fill=1)
        c.setFillColorRGB(*muted)
        c.setFont(FONT_REGULAR, 6.1)
        consent_y = 0.42 * cm
        for line in wrap(CONSENT, FONT_REGULAR, 6.1, main_w):
            c.drawString(main_x, consent_y, line)
            consent_y -= 7.4
        y = page_h - header_h - 0.42 * cm

    def draw_sidebar() -> None:
        if not PORTRAIT.exists():
            return
        diameter = 3.15 * cm
        cx = side_x + side_w / 2 - 0.05 * cm
        cy = page_h - header_h - 0.38 * cm - diameter / 2
        c.saveState()
        clip = c.beginPath()
        clip.circle(cx, cy, diameter / 2)
        c.clipPath(clip, stroke=0, fill=0)
        c.drawImage(
            ImageReader(str(PORTRAIT)),
            cx - diameter / 2,
            cy - diameter / 2,
            diameter,
            diameter,
            mask="auto",
        )
        c.restoreState()
        side_y = cy - diameter / 2 - 0.38 * cm
        inner_x = side_x + 0.22 * cm
        inner_w = side_w - 0.55 * cm
        for heading, items in side_groups:
            c.setFillColorRGB(*navy)
            c.setFont(FONT_BOLD, 9)
            c.drawString(inner_x, side_y, heading)
            side_y -= 2.4
            c.setStrokeColorRGB(*navy)
            c.setLineWidth(0.6)
            c.line(inner_x, side_y, inner_x + 1.15 * cm, side_y)
            side_y -= 10
            c.setFillColorRGB(*ink)
            c.setFont(FONT_REGULAR, 7.5)
            for item in items:
                for line in wrap(item, FONT_REGULAR, 7.5, inner_w):
                    c.drawString(inner_x, side_y, line)
                    side_y -= 9.2
                side_y -= 1.2
            side_y -= 5

    def new_page() -> None:
        nonlocal first_page
        c.showPage()
        first_page = False
        paint_chrome()

    def ensure(needed: float) -> None:
        if y - needed < bottom:
            new_page()

    def section(label: str, reserve: float = 150) -> None:
        nonlocal y
        # Keep the heading with the entry that follows it.
        if y - reserve < bottom:
            new_page()
        y -= 8
        c.setFillColorRGB(*navy)
        c.setFont(FONT_BOLD, 11.5)
        c.drawString(main_x, y, label)
        y -= 3.5
        c.setStrokeColorRGB(*navy)
        c.setLineWidth(0.8)
        c.line(main_x, y, main_x + main_w, y)
        y -= 11
        c.setFillColorRGB(*ink)

    def paragraph(body: str, size: float = 8.3, leading: float = 10.8) -> None:
        nonlocal y
        for line in wrap(body, FONT_REGULAR, size, main_w):
            ensure(leading)
            c.setFillColorRGB(*ink)
            c.setFont(FONT_REGULAR, size)
            c.drawString(main_x, y, line)
            y -= leading
        y -= 2

    def entry(start: str, end: str, title: str, subtitle: str, bullets: list[str]) -> None:
        nonlocal y
        title_lines = wrap(title, FONT_BOLD, 9.1, text_w)
        sub_lines = wrap(subtitle, FONT_REGULAR, 8, text_w) if subtitle else []
        wrapped = [wrap(item, FONT_REGULAR, 8.05, text_w - 10) for item in bullets]
        height = 11 * len(title_lines) + 10 * len(sub_lines) + 6
        height += sum(9.8 * len(lines) + 2 for lines in wrapped)
        if y - height < bottom and y < page_h - header_h - 1.2 * cm:
            new_page()
        top_y = y
        c.setFillColorRGB(*muted)
        c.setFont(FONT_REGULAR, 7.5)
        c.drawString(main_x, top_y, start)
        if end:
            c.drawString(main_x, top_y - 9, "\u2013 " + end)
        c.setFillColorRGB(*ink)
        c.setFont(FONT_BOLD, 9.1)
        for line in title_lines:
            c.drawString(text_x, y, line)
            y -= 11
        if sub_lines:
            c.setFillColorRGB(*muted)
            c.setFont(FONT_REGULAR, 8)
            for line in sub_lines:
                c.drawString(text_x, y, line)
                y -= 10
        c.setFillColorRGB(*ink)
        for lines in wrapped:
            for index, line in enumerate(lines):
                ensure(10)
                c.setFont(FONT_REGULAR, 8.05)
                if index == 0:
                    c.drawString(text_x, y, "\u2022")
                c.drawString(text_x + 9, y, line)
                y -= 9.8
            y -= 1.4
        y -= 6

    paint_chrome()
    draw_sidebar()

    section("Profile")
    paragraph(PROFILE)

    section("Experience")
    for job in JOBS:
        start, end = date_rail(job["date"])
        entry(start, end, job["role"], f"{job['company']}, {job['location']}", job["items"])

    section("Selected project", reserve=210)
    entry("Personal", "R&D", PROJECT_TITLE, PROJECT_SUBTITLE, PROJECT)

    section("Education")
    entry(
        "2024-10", "present",
        "Mechanical Engineering, Engineer's degree",
        "Cracow University of Technology, Krakow",
        ["In progress. Coursework: dynamic systems modelling, automation and control, analytical mechanics, mechatronics."],
    )
    entry(
        "", "",
        "PKMechPower, Mechanical Section",
        "Student research group, Cracow University of Technology",
        ["CAD and 3D-printed parts for a student vehicle, optimized for mass and strength."],
    )
    entry(
        "2019-09", "2024-04",
        "Software Technician",
        "Zespol Szkol Informatycznych, Kielce",
        [],
    )

    section("Certificates")
    entry("2022-05", "", "Kawasaki robot operation and programming", "Integrator course with certificate, ASTOR Robotics Center.", [])
    entry("", "", "Epson industrial robot programming", "Certified course.", [])
    entry("", "", "Python", "Courses, plus self-directed Python and C++ in robotics and simulation projects.", [])

    c.save()
    return path


def write_messages() -> Path:
    path = OUT_DIR / "application_griddynamics.md"
    path.write_text(
        """# Grid Dynamics Robotics Lab - aplikacja

## Cel: ogłoszenie 65335, nie 65625

- **Aplikuj:** [Robotics Engineer (Simulation), vacancy 65335](https://www.griddynamics.com/careers/vacancy/65335)
  - Dresden / Central Europe Remote. Potwierdzone jako **żywe** 11.11.2026.
- **Drugi strzał:** [Middle / Senior Robotics Simulation Engineer, vacancy 59381](https://www.griddynamics.com/careers/vacancy/59381), Rumunia, wymaga 1+ roku z Isaac Sim/Unity/Unreal.
- **Nie aplikuj na ślepo** na [65625](https://www.griddynamics.com/careers/vacancy/65625) - to ogłoszenie, które znalazłeś. Zamiast tego napisz bezpośrednio (niżej).
- Ścieżka awaryjna z ich własnej strony kariery: **jobs@griddynamics.com** przyjmuje zgłoszenia spontaniczne.

---

## 1. List do zgłoszenia na 65335

> Subject: Robotics Engineer (Simulation), 65335 - two years of commercial physics-based robot simulation
>
> Hello,
>
> I am applying for the Robotics Engineer (Simulation) role in the Robotics Lab.
>
> For the last two years my commercial work has been exactly the four things your essential
> functions list. I build physics-based simulations and digital twins of robotic production
> systems; I validate and tune kinematics, joint constraints and physical parameters; I write
> the Python that drives simulation logic and automates scene and process setup, including
> plugins and functions of my own when Visual Components' built-in options could not express the
> behaviour the cell needed; and I take CAD
> models and turn them into simulation assets, which in practice means simplifying geometry,
> fixing collision meshes and keeping assets usable rather than merely accurate. I did this at
> AIAutomation for automotive production workcells, and I do it now at ASTOR building digital
> twins of production lines.
>
> Two things I would add that are less common in a simulation CV. First, I am a Mechanical
> Engineering student, so masses, inertias, gear ratios and dynamic behaviour are quantities I
> derive rather than numbers I nudge until the scene looks plausible. Second, I also program
> Kawasaki and Epson industrial robots and commission the physical stations, so I regularly see
> where a model and the real machine disagree - which is the part of simulation work that a
> simulator alone will not teach. That includes vision. I run the Epson vision system inside
> RC+ and the Kawasaki vision system: calibration, the object models the camera searches for,
> tuning that search so detection holds up, part queues, and several different objects on a
> feeder at once. I have also run the Epson vision loop inside the RC+ simulator, so that
> closed loop is something I have exercised in simulation as well as on the station.
>
> Separately, I designed, built and programmed a SCARA robotic arm from scratch: CAD,
> 3D-printed structure, stepper drives and drivers, microcontroller electronics, and my own
> forward and inverse kinematics in Python and C++, validated against the physical arm. I have
> the CAD, the real masses, the kinematic model and the machine itself, which makes a measured
> comparison between simulation and hardware possible rather than hypothetical. ISAAC_SENTENCE
>
> On the one gap in your list: my commercial simulation hours are in Visual Components rather
> than Omniverse. The discipline transfers directly - physics, kinematics, constraints, Python
> scripting and CAD-to-sim are the same work - but I would rather tell you plainly which
> toolchain my hours are in than let you find out on the first call.
>
> I am based in Krakow, a Polish citizen so no permit is needed anywhere in the EU, and my
> English is C1. CV attached.
>
> Best regards,
> Maciej Tkacz
> maciek01110@gmail.com | +48 881 912 125

**ISAAC_SENTENCE** - wstaw po zrobieniu weekendu z Isaac Sim (patrz README):

> I have now imported it into Isaac Sim through the URDF-to-OpenUSD pipeline, set up the
> articulation and joint drives, and drive it from a Python script - repository and a short
> video here: LINK.

Jeśli weekendu nie było, **usuń to zdanie**, nie zastępuj go niczym miękkim.

---

## 2. Wiadomość bezpośrednia na LinkedIn - Olivera Kralj

22 października opublikowała post o tworzeniu dedykowanego zespołu symulacyjnego dla globalnego
producenta maszyn ciężkich, z wprost zaproszeniem: *„feel free to reach out directly"*.
Napisała też, że zespół jest **otwarty na etat i na B2B**. To nie jest zimny kontakt - to
odpowiedź na jej własne zaproszenie.

> Hi Olivera, I saw your post about the simulation engineering team you're building for the
> heavy-equipment programme. I'm a simulation engineer in Krakow with two years of commercial
> physics-based robot simulation and digital twin work, Python inside Visual Components
> including plugins I wrote when the built-in options ran out, plus vision-guided Epson and
> Kawasaki applications - calibration, object search,
> part queues, multi-part feeders - including the Epson vision loop inside the RC+ simulator.
>
> I've applied for the Robotics Lab Simulation Engineer role (65335). I can see I'm not there
> yet for the scenario-framework role in the migration pod - my ROS 2 is from my own projects,
> not production. I'd rather say that than waste your time. But given how fast the practice is
> growing, I'd like to be on your radar, and I'd welcome a short conversation about where
> someone with my mix would fit. Maciej

**Dlaczego to działa:** mała firma potrafi ukryć niedopasowanie, duży konsulting nie - ale
rekruter, który właśnie obsadza osiem etatów naraz, docenia kandydata, który sam prawidłowo
ocenia, na którą rolę pasuje. To jest rzadkie i zapada w pamięć.

**Zapasowe kontakty, wszystkie publiczne:**
- **Dawid Warchol** - Lead Talent Acquisition Specialist, Kraków, prowadzi tamtejszą rekrutację.
- **Krzysztof Dubel** - Physical AI Lab Lead, Trójmiasto.
- **Paweł Irzyk** - Senior Robotic Control Engineer, Kraków.

Nie pisz do wszystkich naraz. Jedna osoba, tydzień ciszy, potem następna.

---

## 3. Pytania, które warto zadać na rozmowie

Pokazują, że rozumiesz ich biznes, a nie tylko chcesz pracy:

- Czy zespół Robotics Lab i pod migracyjny do Omniverse to jedna organizacja, czy dwie osobne?
  (Z ogłoszeń wynika, że dwie - greenfield „AI-first simulation platform" i migracja istniejącej
  platformy z Unreal Engine 5.)
- Jak w praktyce wygląda u Was podział między Isaac Sim a Isaac Lab - czy symulacja fizyki
  i trening polityk to te same osoby?
- Jak wygląda ścieżka od symulacji do walidacji na prawdziwej maszynie? Pytam, bo u siebie
  programuję i uruchamiam realne stanowiska i to jest część, która mnie najbardziej interesuje.
- Czy przewidujecie ponowne otwarcie stażu robotycznego w Krakowie?

---

## 4. Czego nie robić

- **Nie zgaduj nazwy klienta.** Grid Dynamics nigdy publicznie go nie nazwał - mówi tylko
  „leading global construction and industrial equipment manufacturer". Padają w sieci typowania,
  ale wpisanie nazwy w list to ryzyko bez żadnej korzyści.
- **Nie wpisuj Isaac Sim ani Omniverse do umiejętności, dopóki czegoś w nich nie zrobisz.**
  Rekrutuje tu zespół, który te narzędzia zna na wylot, a Director Physical AI Labs ma doktorat.
  Sprawdzą to jednym pytaniem.
- **Nie pisz, że ROS 2 znasz komercyjnie.** Nie znasz.
- **Nie aplikuj na wszystkie osiem ogłoszeń.** Dwa dopasowane zgłoszenia plus jedna
  przemyślana wiadomość działają, osiem zgłoszeń z tego samego adresu wygląda na spam.
""",
        encoding="utf-8",
    )
    return path


def write_readme() -> Path:
    path = OUT_DIR / "README.md"
    isaac_state = "WŁĄCZONY" if ISAAC_PORT_DONE else "WYŁĄCZONY"
    path.write_text(
        f"""# Grid Dynamics Robotics Lab - pakiet aplikacyjny

Stan weryfikacji: **11 listopada 2026**, odpytane bezpośrednio z
`griddynamics.com/careers/vacancy/<id>`.

## Pliki

| Plik | Kiedy |
|---|---|
| `Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.pdf` | domyślny wybór. Układ z Twojego wcześniejszego CV: granatowy pasek, daty w kolumnie, zdjęcie i krótka lista po prawej. Treść jest aktualna, po angielsku. |
| `Maciej_Tkacz_CV_GridDynamics_Simulation_ATS.pdf` | gdy formularz chce prostego pliku |
| `application_griddynamics.md` | list do zgłoszenia, wiadomość do rekruterki, pytania na rozmowę |

Wersje `.docx` leżą obok.

## Przełącznik Isaac Sim: obecnie {isaac_state}

W `scripts/generate_griddynamics_sim_cv.py` jest flaga `ISAAC_PORT_DONE`. Przy `False`
**CV nie stawia żadnej tezy o Isaac Sim poza uczciwym „w trakcie"**. Po zaimportowaniu SCARA
do Isaac Sim ustaw ją na `True` i wygeneruj pakiet ponownie - wtedy CV i list mówią o tym
jako o zrobionej rzeczy.

**To jest najważniejsze działanie przed wysłaniem zgłoszenia.** Zakres na jeden weekend,
mniej więcej 10-15 godzin:

1. Wynajmij GPU z rdzeniami RT na kilka godzin (RunPod L40S ~0,79 USD/h, RTX 4090 ~0,34 USD/h).
   Całość zmieści się w kilku dolarach. Karty A100 i H100 **nie są wspierane**.
2. Zaimportuj SCARA: `urdf_import.py` z `--robot-type Manipulator`,
   `--collision-type "Convex Decomposition"`, `--joint-drive-type force`,
   `--joint-target-type position` i `--ros-package`, żeby rozwiązać ścieżki `package://`.
3. Ustaw articulation root, napędy przegubów i prawdziwe masy oraz bezwładności z CAD.
4. Napisz skrypt w Pythonie, który przejeżdża parametryzowaną trajektorię.
5. Nagraj 60 sekund wideo, wrzuć kod na GitHuba, opisz w pięciu zdaniach, co zadziałało,
   a co nie.
6. Ustaw flagę na `True`, przegeneruj, wyślij.

Bez tego aplikujesz z widoczną dziurą w jedynym miejscu, w którym ogłoszenie 65335 Cię odsiewa.
Z tym - trafiasz w komplet wymagań.

## Dlaczego celem jest 65335, a nie ogłoszenie z LinkedIna

Przysłane ogłoszenie to **Robotics Simulation Engineer, vacancy 65625**, Kraków, Mid-Senior.
Jego twarde wymagania to: komercyjne doświadczenie w robotyce lub autonomii ze specjalizacją
w symulacji, ROS 2 do podłączania oprogramowania robota do symulatora, silny Python **i** C++,
orkiestracja scenariuszy w silnikach workflow, testy SIL/HIL oraz uruchamianie symulacji
wsadowo i rozproszenie. Spełniasz dwa z sześciu.

Przy okazji sprawdzania tego ogłoszenia wyszło na jaw, że Grid Dynamics ma **osiem żywych
ogłoszeń robotyczno-symulacyjnych** w tej rodzinie, i jedno z nich wygląda zupełnie inaczej.

**Vacancy 65335, Robotics Engineer (Simulation), Robotics Lab**, Dresden / Central Europe
Remote. Pełna lista wymagań:

| Wymaganie | Ty |
|---|---|
| Strong Python programming skills | tak, komercyjnie, skrypty logiki symulacji |
| NVIDIA Isaac Sim | **brak** |
| NVIDIA Omniverse | **brak** |
| Unity, Unreal Engine **or similar simulation platforms** | Visual Components, 2 lata komercyjnie |
| Understanding of Physics-based simulation | tak |
| Mechanical systems | student MiBM, to jest Twój kierunek |
| 3D environments | tak |
| Experience working with CAD models or 3D assets | SolidWorks, Inventor, Fusion, AutoCAD |

A zadania w tym ogłoszeniu to niemal spis treści Twojego CV: *„Validate and tune physical
parameters, kinematics, and constraints"*, *„Create Python scripts for automation and simulation
logic"*, *„Work with CAD models and integrate them into simulation environments"*,
*„Maintain version-controlled simulation assets"*.

Czego w tym ogłoszeniu **nie ma**: progu lat doświadczenia, ROS 2, C++, niemieckiego.
Dla porównania siostrzane ogłoszenie 65341 („Junior Robotics Engineer", też Drezno) wymaga
magistra, 2+ lat uruchamiania robotów przemysłowych **i niemieckiego C1/C2** - mimo słowa
„Junior" w tytule jest trudniejsze. Warto o tym wiedzieć, żeby nie pomylić tych dwóch.

Zostaje jedna realna luka: **Isaac Sim i Omniverse**. Stąd weekend opisany wyżej.

## Wizja Epsona i Kawasaki - co zmienia, a czego nie

Dopisane z Twojego opisu, bez dorzucania nazw produktów, których nie podałeś. W CV i w liście
jest: system wizyjny Epsona w RC+, system wizyjny Kawasaki, kalibracja, modele obiektów i
strojenie wyszukiwania, kolejki, kilka różnych obiektów na feederze naraz, oraz pętla wizyjna
odpalona też w symulatorze RC+.

**To wzmacnia 65335.** Ogłoszenie prosi o strojenie parametrów fizycznych, kinematyki i
ograniczeń oraz o współpracę z ludźmi od robotyki. Kalibracja kamera-robot i wizja w pętli
symulatora to dokładnie ten rodzaj roboty: zamykasz pętlę między tym, co widzi kamera, a tym,
co robi maszyna, i widziałeś tę pętlę po obu stronach.

**To nie otwiera 65625.** Ogłoszenie z LinkedIna nadal wymaga komercyjnego ROS 2, orkiestracji
scenariuszy, SIL/HIL i symulacji na skalę. Wizja przemysłowa jest sąsiednia, nie jest tym
wymaganiem.

**To nie jest wejście na 65624, Rendering & Sensor Simulation Engineer** (Kraków, żywe
11.11.2026). Tamte wymagania to programowanie grafiki: Unreal Engine 5, Omniverse RTX, C++,
CUDA, Vulkan albo OpenGL, shadery, oraz modelowanie kamery, LiDAR-u i radaru razem z szumem
sensorycznym. Twoja wizja to aplikacja na robocie. Ich wizja to silnik renderujący, który ma
udawać sensor. Inna praca.

## Pluginy w Visual Components

Dopisane z Twojego opisu. Kiedy komórka wymagała zachowania, którego nie dało się ustawić
wbudowanymi opcjami, pisałeś własne pluginy i funkcje w Pythonie. W CV i w liście jest to
dokładnie na tym poziomie ogólności. Nie wymyśliłem, jakich zjawisk dotyczyły.

Dla 65335 to jest trafienie w punkt *„Create Python scripts for automation and simulation
logic"*, i to w mocniejszej wersji: nie tylko używałeś API, tylko rozszerzałeś narzędzie,
kiedy wbudowane klocki się kończyły.

## Jak to CV jest ustawione

Fakty biorę tylko z tego, co sam opisujesz. Reszta to kolejność i język:

1. **Tytuł i profil mówią „Simulation Engineer", nie „Robotics Engineer".** Rekrutujesz się
   do Robotics Lab na rolę symulacyjną, więc na górze stoi to, co robisz komercyjnie od dwóch lat.
2. **Punkty z „What I bring" są ustawione w kolejności ich listy wymagań** - fizyka, Python,
   CAD-to-sim, strojenie parametrów. Rekruter przechodzi po liście i odhacza.
3. **Wykształcenie mechaniczne podane jako argument techniczny, nie formalny.** Sformułowanie
   o parametrach wyprowadzanych, a nie dobieranych na oko, jest celowe: w zespole symulacyjnym
   to jest realna różnica, a Ty naprawdę tak pracujesz.
4. **Programowanie robotów, wizja i uruchamianie stanowisk wystawione jako przewaga
   symulacyjna.** Większość inżynierów symulacji nigdy nie skalibrowała kamery do robota ani
   nie uruchamiała fizycznej maszyny, więc nie wie, gdzie model kłamie. Ty wiesz.
5. **SCARA przeramowany pod tę rolę.** Nie jako „fajny projekt hobbystyczny", tylko jako
   jedyny powód, dla którego możesz zrobić zmierzone porównanie symulacji z rzeczywistością:
   masz CAD, prawdziwe masy, model kinematyczny i maszynę.
6. **Luka narzędziowa powiedziana wprost, w CV i w liście.** Przy zespole, w którym Director
   Physical AI Labs ma doktorat, uczciwe nazwanie tego jest mocniejsze niż ukrywanie.

Wycięty: staż web-devowy z 2021.

## Kontekst, który warto mieć w głowie

Ta praktyka u nich jest **nowa i rośnie szybko**, co działa na Twoją korzyść, bo zespoły
budowane od zera zatrudniają szerzej niż dojrzałe:

- pierwsze komercyjne wdrożenie Physical AI zamknięte w pierwszym kwartale 2026,
- **przejęcie Ekumen** (firma robotyczna z dekadą doświadczenia w ROS) w maju 2026,
- partnerstwo z **Doosan Robotics** i biuro inżynieryjne w **Dreźnie** w drugim kwartale 2026,
- status **NVIDIA Solution Advisor Partner**, platforma GAIN for Physical AI na stosie NVIDII,
- **Physical AI Lab w Gdańsku otwarty publicznym meetupem 4 listopada 2026**, czyli tydzień temu,
- ogłoszenie na Principal Engineera mówi o zespole **sześciu inżynierów** - czyli skala,
  na której jeden dobry człowiek robi różnicę.

Krakowski staż robotyczny (vacancy 64359, 32 zł/h brutto, 6 miesięcy) **wygasł 31 października**
i jest zamknięty, mimo że na portalach pośredniczących nadal wisi. Grid Dynamics prowadzi
jednak w Krakowie staże w czterech innych dziedzinach, więc ten prawdopodobnie wróci.

Płace, dla kalibracji: jedyna publikowana stawka w tej rodzinie ogłoszeń to Lead Simulation
& Autonomy Systems Architect na JustJoin.IT - **35 070-41 750 zł netto+VAT** na B2B. Glassdoor
dla Grid Dynamics Kraków: Software Engineer 14-18 tys., Senior 18-23 tys. Liczby krążące po
agregatorach („180-280 tys. zł") są **zmyślone przez te serwisy**, nie publikowane przez firmę.

Proces rekrutacji według ich własnej odpowiedzi na GoWork: rozmowa HR, rozmowa techniczna,
rozmowa nietechniczna, plus sprawdzenie angielskiego. Tryb hybrydowy 3 dni w biurze.
Biuro w Krakowie: al. 3 Maja 9.
""",
        encoding="utf-8",
    )
    return path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for item in (
        build_ats_docx(),
        build_visual_docx(),
        build_ats_pdf(),
        build_visual_pdf(),
        write_messages(),
        write_readme(),
    ):
        print(item.relative_to(OUT_DIR.parents[1]))


if __name__ == "__main__":
    main()
