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
from reportlab.pdfgen import canvas

OUT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "griddynamics-robotics-lab"
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
    "Kawasaki and Epson industrial robots, building digital twins of production lines and "
    "commissioning the physical stations those twins describe - so I routinely see where a "
    "simulation and the real machine disagree. I also designed, built and programmed a SCARA "
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
    "Python for simulation logic and automation: scripted simulation behaviour, automated repetitive scene and process setup, and optimized simulation performance through a simulator's Python API. This is the single largest part of my commercial work.",
    "CAD to simulation asset: SolidWorks, Autodesk Inventor, Fusion 360 and AutoCAD. I prepare, simplify and optimize 3D geometry specifically for simulation use - reducing mesh complexity, fixing collision geometry, and keeping assets usable rather than merely accurate.",
    "Validating and tuning physical parameters: kinematics, joint constraints, gear ratios, masses and inertias derived from CAD rather than guessed. My mechanical engineering coursework covers dynamic systems modelling, control and analytical mechanics.",
    "Where simulation meets the real machine: I program Kawasaki and Epson robots and commission the physical stations, so I see the gap between a model and the hardware regularly - which is the part of this discipline that cannot be learned from a simulator alone.",
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
            "Program Kawasaki and Epson industrial robots: motion programs, teach pendant work and complete application cycles.",
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
            "Wrote Python scripts to automate simulation logic, optimize processes and improve simulation performance.",
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
    shade(hcell, "F2F6FA")
    p = hcell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(NAME)
    run.bold = True
    run.font.size = Pt(20)
    run.font.color.rgb = RGBColor.from_string(ACCENT)
    p2 = hcell.add_paragraph(TITLE)
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.runs[0].bold = True

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
    shade(right, "F2F6FA")

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


def build_visual_pdf() -> Path:
    path = OUT_DIR / "Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.pdf"
    margin = 1.5 * cm
    side_width = 5.2 * cm
    gap = 0.55 * cm
    side_x = margin
    main_x = margin + side_width + gap
    main_width = A4[0] - margin - main_x
    top = A4[1] - 1.4 * cm
    bottom = 1.5 * cm

    c = canvas.Canvas(str(path), pagesize=A4)

    def sidebar() -> None:
        c.setFillColorRGB(0.95, 0.965, 0.98)
        c.rect(margin - 0.3 * cm, bottom - 0.3 * cm,
               side_width + 0.6 * cm, top - bottom + 0.9 * cm, stroke=0, fill=1)
        c.setFillColorRGB(0, 0, 0)

    sidebar()

    y = top
    c.setFillColorRGB(0.12, 0.31, 0.47)
    c.setFont(FONT_BOLD, 18)
    c.drawString(main_x, y, NAME)
    y -= 14
    c.setFillColorRGB(0, 0, 0)
    c.setFont(FONT_BOLD, 9)
    for line in wrap(TITLE, FONT_BOLD, 9, main_width):
        c.drawString(main_x, y, line)
        y -= 11
    y -= 2

    side_y = top

    def side_heading(t: str) -> None:
        nonlocal side_y
        side_y -= 5
        c.setFont(FONT_BOLD, 8.2)
        c.setFillColorRGB(0.12, 0.31, 0.47)
        c.drawString(side_x, side_y, t.upper())
        side_y -= 8
        c.setFillColorRGB(0, 0, 0)

    def side_item(t: str, size: float = 7.4) -> None:
        nonlocal side_y
        for line in wrap(t, FONT_REGULAR, size, side_width - 8):
            c.setFont(FONT_REGULAR, size)
            c.drawString(side_x + 6, side_y, line)
            side_y -= 8.8
        side_y -= 0.6

    for heading_text, items in SIDEBAR.items():
        side_heading(heading_text)
        for item in items:
            side_item(item)
    side_heading("Consent")
    for line in wrap(CONSENT, FONT_REGULAR, 6.2, side_width - 8):
        c.setFont(FONT_REGULAR, 6.2)
        c.drawString(side_x + 6, side_y, line)
        side_y -= 7.4

    def ensure(needed: float) -> None:
        nonlocal y
        if y - needed < bottom:
            c.showPage()
            sidebar()
            y = top

    def main_heading(t: str) -> None:
        nonlocal y
        ensure(22)
        y -= 6
        c.setFont(FONT_BOLD, 9.4)
        c.setFillColorRGB(0.12, 0.31, 0.47)
        c.drawString(main_x, y, t.upper())
        y -= 3
        c.setStrokeColorRGB(0.12, 0.31, 0.47)
        c.setLineWidth(0.6)
        c.line(main_x, y, main_x + main_width, y)
        y -= 8
        c.setFillColorRGB(0, 0, 0)

    def main_text(body: str, size: float = 8.6, font: str = FONT_REGULAR,
                  leading: float = 10.7) -> None:
        nonlocal y
        for line in wrap(body, font, size, main_width):
            ensure(leading)
            c.setFont(font, size)
            c.drawString(main_x, y, line)
            y -= leading

    def main_bullet(body: str, size: float = 8.6, leading: float = 10.7) -> None:
        nonlocal y
        for index, line in enumerate(wrap(body, FONT_REGULAR, size, main_width - 10)):
            ensure(leading)
            c.setFont(FONT_REGULAR, size)
            if index == 0:
                c.drawString(main_x, y, "\u2022")
            c.drawString(main_x + 10, y, line)
            y -= leading
        y -= 1

    main_heading("Profile")
    main_text(PROFILE)
    main_heading("What I bring")
    for item in STRENGTHS:
        main_bullet(item)
    main_heading("Selected project")
    main_text(f"{PROJECT_TITLE} | {PROJECT_SUBTITLE}", size=8.8, font=FONT_BOLD)
    for item in PROJECT:
        main_bullet(item)
    main_heading("Experience")
    for job in JOBS:
        main_text(f"{job['role']} | {job['company']}, {job['location']} | {job['date']}",
                  size=8.8, font=FONT_BOLD)
        for item in job["items"]:
            main_bullet(item)
        y -= 2
    main_heading("Education")
    for item in EDUCATION:
        main_bullet(item)
    main_heading("Certificates")
    for item in CERTIFICATES:
        main_bullet(item)
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
> the Python that drives simulation logic and automates scene and process setup; and I take CAD
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
> simulator alone will not teach.
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
> physics-based robot simulation and digital twin work, Python simulation scripting and
> CAD-to-sim, plus industrial robot programming and commissioning on the hardware side.
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
| `Maciej_Tkacz_CV_GridDynamics_Simulation_Visual.pdf` | domyślny wybór |
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

## Jak to CV jest ustawione

Nie dopisałem ani jednego faktu. Zmieniła się optyka:

1. **Tytuł i profil mówią „Simulation Engineer", nie „Robotics Engineer".** Rekrutujesz się
   do Robotics Lab na rolę symulacyjną, więc na górze stoi to, co robisz komercyjnie od dwóch lat.
2. **Punkty z „What I bring" są ustawione w kolejności ich listy wymagań** - fizyka, Python,
   CAD-to-sim, strojenie parametrów. Rekruter przechodzi po liście i odhacza.
3. **Wykształcenie mechaniczne podane jako argument techniczny, nie formalny.** Sformułowanie
   o parametrach wyprowadzanych, a nie dobieranych na oko, jest celowe: w zespole symulacyjnym
   to jest realna różnica, a Ty naprawdę tak pracujesz.
4. **Programowanie robotów i uruchamianie stanowisk wystawione jako przewaga symulacyjna.**
   Większość inżynierów symulacji nigdy nie uruchamiała fizycznej maszyny, więc nie wie, gdzie
   model kłamie. Ty wiesz i to jest wyróżnik, a nie bagaż z poprzedniej branży.
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
