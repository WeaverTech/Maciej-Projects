"""Generate the Maus Robotics application package (EN only).

Standalone on purpose: it shares no state with the other CV generators, so running
it never touches the SoftServe / Red Sky / Inbolt / Grid Dynamics / universal packages.
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

OUT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "maus-robotics-cv"
FONT_REGULAR = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
ACCENT = "1F4E79"

pdfmetrics.registerFont(TTFont(FONT_REGULAR, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


NAME = "Maciej Tkacz"
TITLE = "Robotics Engineer - Hardware, Control Software and Rapid Prototyping"

CONTACT = [
    "maciek01110@gmail.com",
    "+48 881 912 125",
    "Krakow, Poland - open to relocating to Basel",
    "Polish citizen (EU) - no permit sponsorship needed",
    "English C1 | Driving licence B",
]

PROFILE = (
    "I build machines end to end and write the software that runs them. As a personal project I "
    "designed and built a SCARA robotic arm from scratch: mechanics in CAD, 3D-printed structure, "
    "NEMA stepper drives with TMC/DRV drivers, microcontroller electronics, and Python/C++ control "
    "software with forward and inverse kinematics. I now do the same commercially as a Robotics "
    "Engineer at ASTOR, where I program Kawasaki and Epson industrial robots, build digital twins "
    "of production lines, and design, build and commission demonstration stations - machines whose "
    "entire job is to run reliably in front of an audience, without a technician standing next to "
    "them. Mechanical Engineering student at Cracow University of Technology and certified Software "
    "Technician, so the mechanics, the electronics and the code come from the same person."
)

STRENGTHS = [
    "Whole machines, not parts: mechanical concept and CAD, 3D-printed structure, actuator and driver selection, microcontroller electronics, wiring, assembly and bring-up. One complete robot built alone, plus robot cells built and commissioned professionally.",
    "Control software on real hardware: Python and C++ for robot motion and hardware interaction, forward and inverse kinematics verified against the physical arm, Arduino/C for low-level control, Python scripting for automation. ROS from personal projects, self-taught rather than commercial.",
    "Industrial robots: Kawasaki and Epson - certified courses, teach pendant, motion programs, complete application cycles, cell testing and commissioning.",
    "CAD and additive manufacturing: Fusion 360, SolidWorks, Autodesk Inventor, AutoCAD, plus FDM, SLA and MJF run in a production shop with process parameters, post-processing and quality control. I know the difference between a part that prints and a part that prints the same way a hundred times.",
    "Simulating before building: digital twins of production lines and robot cells - reach, motion sequences, collisions and cycle behaviour validated before anything is cut, printed or wired. A cheap way to kill a bad iteration early.",
    "How I work: I take a problem across mechanics, electrics and software until it actually runs, and I would rather build the next iteration than write a report about the last one.",
]

PROJECT_TITLE = "SCARA Robotic Arm - designed, built and programmed from scratch"
PROJECT_SUBTITLE = "Personal R&D project"
PROJECT = [
    "Took the arm from a blank page to a working machine: mechanical concept, CAD, kinematic layout and gear ratios, selection of NEMA stepper actuators and TMC/DRV drivers, microcontroller electronics and wiring.",
    "Wrote the control software in Python and C++, implementing forward and inverse kinematics and testing it against the physical arm rather than only on paper.",
    "Designed every printed part for stiffness and assembly in PET-G and carbon-fibre reinforced material, iterating through repeated print, assemble and test cycles.",
    "Debugged the machine as a whole - the point where mechanics, electronics and software fail each other is the part no course prepares you for, and the part I enjoy most.",
]

JOBS = [
    {
        "role": "Robotics Engineer",
        "company": "ASTOR",
        "location": "Krakow, Poland",
        "date": "Jul 2026 - present",
        "items": [
            "Design, build and commission demonstration stations presenting Kawasaki and Epson robots in different applications - mechanical assembly, hardware-software integration, programming and bring-up. These machines have to work in front of customers, repeatedly, on demand.",
            "Program Kawasaki and Epson industrial robots: motion programs, teach pendant work and complete application cycles.",
            "Build digital twins of production lines and robot simulations, validating reach, motion sequences and process behaviour before anything is built physically.",
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
            "Developed robot paths, motion sequences, process logic, collision checking and cycle flows, and optimized workcell layouts and 3D geometry.",
            "Worked from customer documentation and engineering standards, and presented assumptions and improvement proposals directly to client engineers.",
        ],
    },
    {
        "role": "3D Printing and CAD Design Specialist",
        "company": "Cubic Inch Additive Manufacturing",
        "location": "Piaseczno, Poland",
        "date": "Jun 2023 - Aug 2023",
        "items": [
            "Ran FDM, MJF and SLA printers in a production environment: process parameters, post-processing and quality control.",
            "Designed and optimized CAD models in Fusion 360 and Autodesk Inventor for additive manufacturing.",
            "Supported the introduction of a new SLA technology, documenting tests and technical observations.",
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
            "Programmed Kawasaki robots using teach pendant workflows and wrote basic motion programs.",
            "Tested robot and workstation operation.",
        ],
    },
]

EDUCATION = [
    "Cracow University of Technology - Mechanical Engineering, Engineer's degree in progress (Oct 2024 - present). Coursework: dynamic systems modelling, automation and control, analytical mechanics, mechatronics.",
    "PKMechPower Student Research Group, Mechanical Section - CAD and 3D-printed parts for a student vehicle, including driver seat and brake-system components, optimized for mass and strength.",
    "Zespol Szkol Informatycznych, Kielce - Software Technician diploma (Sep 2019 - Apr 2024).",
]

CERTIFICATES = [
    "Kawasaki robot operation and programming - integrator course with certificate, ASTOR Robotics Center.",
    "Epson industrial robot programming - certified course.",
    "Python programming courses, plus self-directed Python and C++ development in robotics and automation projects.",
]

SIDEBAR = {
    "Contact": [
        "maciek01110@gmail.com",
        "+48 881 912 125",
        "Krakow, Poland",
        "Open to relocating to Basel",
    ],
    "Eligibility": [
        "Polish citizen (EU)",
        "No sponsorship needed",
    ],
    "Languages": ["Polish - native", "English - C1"],
    "Build Stack": [
        "Python",
        "C++ / Arduino C",
        "Forward & inverse kinematics",
        "NEMA steppers, TMC/DRV",
        "Arduino / ESP32-class MCUs",
        "Fusion 360",
        "SolidWorks",
        "Autodesk Inventor",
        "FDM / SLA / MJF printing",
        "PET-G, carbon-fibre filament",
        "Kawasaki & Epson robots",
        "Visual Components",
        "ROS (personal projects)",
        "Git",
    ],
    "Keywords": [
        "Prototype to working machine",
        "Hardware-software integration",
        "Robot control software",
        "Rapid iteration",
        "Design for 3D printing",
        "Commissioning & bring-up",
        "Digital twins",
    ],
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

    path = OUT_DIR / "Maciej_Tkacz_CV_MausRobotics_ATS.docx"
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

    path = OUT_DIR / "Maciej_Tkacz_CV_MausRobotics_Visual.docx"
    doc.save(path)
    return path


class Page:
    def __init__(self, path: Path, left: float, right_edge: float, top: float, bottom: float):
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.left = left
        self.right_edge = right_edge
        self.top = top
        self.bottom = bottom
        self.y = top

    def space(self, needed: float) -> None:
        if self.y - needed < self.bottom:
            self.c.showPage()
            self.y = self.top

    def heading(self, text: str, x: float, width: float, size: float = 9.6) -> None:
        self.space(20)
        self.y -= 5
        self.c.setFont(FONT_BOLD, size)
        self.c.setFillColorRGB(0.12, 0.31, 0.47)
        self.c.drawString(x, self.y, text.upper())
        self.y -= 3
        self.c.setStrokeColorRGB(0.12, 0.31, 0.47)
        self.c.setLineWidth(0.6)
        self.c.line(x, self.y, x + width, self.y)
        self.y -= 8
        self.c.setFillColorRGB(0, 0, 0)

    def text(self, body: str, x: float, width: float, size: float = 8.7,
             font: str = FONT_REGULAR, leading: float = 10.9) -> None:
        for line in wrap(body, font, size, width):
            self.space(leading)
            self.c.setFont(font, size)
            self.c.drawString(x, self.y, line)
            self.y -= leading

    def bullet(self, body: str, x: float, width: float, size: float = 8.7,
               leading: float = 10.9) -> None:
        lines = wrap(body, FONT_REGULAR, size, width - 10)
        for index, line in enumerate(lines):
            self.space(leading)
            self.c.setFont(FONT_REGULAR, size)
            if index == 0:
                self.c.drawString(x, self.y, "\u2022")
            self.c.drawString(x + 10, self.y, line)
            self.y -= leading
        self.y -= 1

    def save(self) -> None:
        self.c.save()


def build_ats_pdf() -> Path:
    path = OUT_DIR / "Maciej_Tkacz_CV_MausRobotics_ATS.pdf"
    left, right_edge, top, bottom = 2.0 * cm, A4[0] - 2.0 * cm, A4[1] - 1.8 * cm, 1.6 * cm
    width = right_edge - left
    page = Page(path, left, right_edge, top, bottom)

    page.c.setFont(FONT_BOLD, 19)
    page.c.setFillColorRGB(0.12, 0.31, 0.47)
    page.c.drawString(left, page.y, NAME)
    page.y -= 15
    page.c.setFillColorRGB(0, 0, 0)
    page.c.setFont(FONT_BOLD, 9.6)
    page.c.drawString(left, page.y, TITLE)
    page.y -= 12
    page.text(" | ".join(CONTACT), left, width, size=7.8, leading=9.6)

    page.heading("Profile", left, width)
    page.text(PROFILE, left, width)

    page.heading("What I bring", left, width)
    for item in STRENGTHS:
        page.bullet(item, left, width)

    page.heading("Selected project", left, width)
    page.text(f"{PROJECT_TITLE} | {PROJECT_SUBTITLE}", left, width, size=8.9, font=FONT_BOLD)
    for item in PROJECT:
        page.bullet(item, left, width)

    page.heading("Experience", left, width)
    for job in JOBS:
        header = f"{job['role']} | {job['company']}, {job['location']} | {job['date']}"
        page.text(header, left, width, size=8.9, font=FONT_BOLD)
        for item in job["items"]:
            page.bullet(item, left, width)
        page.y -= 2

    page.heading("Education", left, width)
    for item in EDUCATION:
        page.bullet(item, left, width)

    page.heading("Certificates", left, width)
    for item in CERTIFICATES:
        page.bullet(item, left, width)

    page.y -= 4
    page.text(CONSENT, left, width, size=6.8, leading=8)
    page.save()
    return path


def build_visual_pdf() -> Path:
    path = OUT_DIR / "Maciej_Tkacz_CV_MausRobotics_Visual.pdf"
    margin = 1.5 * cm
    side_width = 5.2 * cm
    gap = 0.55 * cm
    side_x = margin
    main_x = margin + side_width + gap
    main_width = A4[0] - margin - main_x
    top = A4[1] - 1.4 * cm
    bottom = 1.5 * cm

    c = canvas.Canvas(str(path), pagesize=A4)

    def sidebar(page_top: float) -> None:
        c.setFillColorRGB(0.95, 0.965, 0.98)
        c.rect(margin - 0.3 * cm, bottom - 0.3 * cm,
               side_width + 0.6 * cm, page_top - bottom + 0.9 * cm, stroke=0, fill=1)
        c.setFillColorRGB(0, 0, 0)

    sidebar(top)

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

    def side_heading(text: str) -> None:
        nonlocal side_y
        side_y -= 5
        c.setFont(FONT_BOLD, 8.2)
        c.setFillColorRGB(0.12, 0.31, 0.47)
        c.drawString(side_x, side_y, text.upper())
        side_y -= 8
        c.setFillColorRGB(0, 0, 0)

    def side_item(text: str, size: float = 7.6) -> None:
        nonlocal side_y
        for line in wrap(text, FONT_REGULAR, size, side_width - 8):
            c.setFont(FONT_REGULAR, size)
            c.drawString(side_x + 6, side_y, line)
            side_y -= 9.0
        side_y -= 0.6

    for heading, items in SIDEBAR.items():
        side_heading(heading)
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
            sidebar(top)
            y = top

    def main_heading(text: str) -> None:
        nonlocal y
        ensure(22)
        y -= 6
        c.setFont(FONT_BOLD, 9.4)
        c.setFillColorRGB(0.12, 0.31, 0.47)
        c.drawString(main_x, y, text.upper())
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
        lines = wrap(body, FONT_REGULAR, size, main_width - 10)
        for index, line in enumerate(lines):
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


def write_application_message() -> Path:
    path = OUT_DIR / "application_maus_robotics.md"
    path.write_text(
        """# Maus Robotics - Open Application

Formularz prosi dokładnie o trzy rzeczy: dane, CV i **dwa zdania o tym, dlaczego pasujesz**.
Poniżej masz gotowe dwa zdania, dłuższą wersję mailową oraz notkę na LinkedIn.

Link do formularza: https://mausrobotics.com/en/jobs/open-application
Kontakt bezpośredni: contact@mausrobotics.com | +41 78 963 08 08
Founder (robotyka, PhD EPFL): robert@mausrobotics.com

---

## 1. Dwa zdania do formularza - wersja do wklejenia

> I designed and built a SCARA robotic arm from scratch - CAD, 3D-printed structure, stepper
> drives, microcontroller electronics and Python/C++ control code with inverse kinematics -
> and I now do the same commercially as a Robotics Engineer at ASTOR, where I program Kawasaki
> and Epson robots and build the demonstration stations that have to run flawlessly in front of
> customers. That is the job you are describing: a machine that has to work on a Saturday
> afternoon at the Rhine, built by someone who can do the mechanics, the electronics and the
> code himself.

Dlaczego tak: druga połowa cytuje ich własne zdanie ze strony z ofertami. Mała firma to zauważy.

---

## 2. Wersja mailowa - Open Application

Rola "Open Application" mówi wprost: *"Tell us what you'd do here"*. Dlatego ten list nie jest
prośbą o pracę, tylko propozycją konkretnej roli.

> Subject: Open application - robotics engineer who builds the whole machine
>
> Hi Robert, hi Marten,
>
> I am applying through your open application rather than the two internship roles, because
> I am already working commercially in robotics and I think I would be more useful to you as
> a full member of the team than as an intern - but I am open to how you want to structure
> a start.
>
> What I do: I build machines end to end and write the software that runs them. As a personal
> project I designed and built a SCARA robotic arm from scratch - CAD, 3D-printed structure,
> NEMA steppers with TMC/DRV drivers, microcontroller electronics, and Python/C++ control
> software with forward and inverse kinematics tested against the physical arm. Professionally
> I am a Robotics Engineer at ASTOR, where I program Kawasaki and Epson industrial robots,
> build digital twins of production lines, and design, build and commission demonstration
> stations. Those stations exist to run in front of customers, on demand, without a technician
> hovering over them - which is a smaller version of your problem: a machine that has to work
> on a Saturday afternoon at the Rhine.
>
> What I would do at Maus, concretely:
>
> 1. Own a module of the robot from CAD through printed parts, wiring and control code, and
>    iterate it fast - that is one person instead of a handover between three.
> 2. Help make the machine buildable more than once. I ran FDM, SLA and MJF printers in a
>    production shop, working with process parameters, post-processing and quality control,
>    so I know the difference between a part that prints and a part that prints the same way
>    a hundred times. That is exactly the gap between your prototype and your tenth unit.
> 3. Kill bad iterations before they cost hardware. Building digital twins and validating
>    reach, motion sequences and collisions before anything is built is my day job, and on
>    a small team that is hours saved per week, not a nice-to-have.
> 4. Be the person who debugs across domains. Most faults on a machine like yours sit exactly
>    where mechanics, electronics and software meet, and that is where I am most comfortable.
>
> On your requirements: Python and C++ yes, Fusion 360 and SolidWorks yes, 3D printing yes,
> including carbon-fibre reinforced PET-G. ROS I know from my own robotics projects, but I have
> not used it commercially, and I would rather tell you that than let you find out in week two.
>
> I am a Mechanical Engineering student at Cracow University of Technology and a certified
> Software Technician - the mechanics and the code come from the same background, which is
> unusual and, on a five-person hardware team, useful. I am a Polish citizen, so no permit
> sponsorship is needed, and I am ready to relocate to Basel. English C1.
>
> My CV is attached. If it is easier, I am happy to just walk you through the SCARA build on
> a call - photos, code and all the things that went wrong.
>
> Best regards,
> Maciej Tkacz
> maciek01110@gmail.com | +48 881 912 125

---

## 3. Krótka notka na LinkedIn (limit 300 znaków)

> Hi Robert - I'm applying through Maus Robotics' open application. I built a SCARA arm from
> scratch (CAD, 3D print, steppers, Python/C++ inverse kinematics) and now build and program
> robot demo stations at ASTOR. I'd like to do that for a machine people actually use.
> Maciej Tkacz

---

## Zanim wyślesz - cztery rzeczy

1. **Zdjęcia i wideo SCARA.** To jest najmocniejszy element całej aplikacji, a firma
   pięcioosobowa oceni go w 30 sekund. Wrzuć na GitHuba albo do jednego folderu w chmurze:
   kod, kilka zdjęć złożonego ramienia, model CAD i krótkie nagranie ruchu. Wklej link do
   maila. Bez tego pierwsze zdanie listu jest deklaracją, z linkiem jest dowodem.
2. **Relokacja do Bazylei.** Wpisałem ją w CV i w list, bo mówiłeś, że chcesz pracować za
   granicą. Jeśli to na tym etapie nie jest pewne, powiedz - wytnę to zdanie, bo lepiej nie
   obiecywać przeprowadzki, której nie chcesz.
3. **Okres wypowiedzenia w ASTOR.** Nie podałem żadnej daty dostępności, bo jej nie znam.
   Dopisz jedno zdanie, jeśli wiesz, od kiedy realnie możesz zacząć.
4. **Niemiecki.** Nie wpisałem go nigdzie, bo nie znam Twojego poziomu, a oni piszą, że
   dostawcy i lokalizacje mówią po niemiecku. Jeśli masz cokolwiek, nawet A2, warto dodać
   jedno zdanie - u nich to plus, a nie wymóg.
""",
        encoding="utf-8",
    )
    return path


def write_readme() -> Path:
    path = OUT_DIR / "README.md"
    path.write_text(
        """# CV pod Maus Robotics - Open Application

Pakiet wyłącznie pod tę jedną aplikację. Generuje go osobny skrypt
`scripts/generate_maus_cv.py`, który nie rusza pozostałych pakietów CV.

## Pliki

| Plik | Kiedy |
|---|---|
| `Maciej_Tkacz_CV_MausRobotics_Visual.pdf` | **domyślny wybór** - pięć osób, żadnego ATS, czyta to człowiek |
| `Maciej_Tkacz_CV_MausRobotics_ATS.pdf` | jeśli formularz wymaga prostego, jednokolumnowego pliku |
| `application_maus_robotics.md` | dwa zdania do formularza, pełny list mailowy, notka na LinkedIn |

Wersje `.docx` leżą obok, gdybyś chciał coś dopisać ręcznie.

## Jak to CV jest podkręcone - i gdzie jest granica

Podkręcenie polega tu na kolejności i na języku, nie na dopisywaniu faktów.

**Co zostało wzmocnione:**

1. **Projekt SCARA stoi przed doświadczeniem zawodowym.** W normalnym CV to byłby dodatek na
   końcu. Tutaj jest sekcją numer dwa, bo Maus wprost pisze: *"You've shipped a working
   prototype, demo, or product and taken initiative beyond coursework"*. Cała ich lista
   bonusów - Python, ROS 2, CAD w Fusion, druk 3D - to jest opis tego projektu.
2. **Stanowiska demo z ASTOR wyciągnięte na pierwszy punkt obecnej pracy.** To jest
   najmocniejsza, a jednocześnie całkowicie prawdziwa analogia w całej aplikacji: budujesz
   maszyny, których jedynym zadaniem jest działać bezbłędnie przed publicznością. Oni opisują
   swój produkt jako *"a machine that has to work on a Saturday afternoon at the Rhine"*.
   To jest ten sam problem w mniejszej skali.
3. **Cubic Inch przestawione z "drukowałem na drukarkach" na powtarzalność produkcji.**
   Parametry procesu, post-processing i kontrola jakości to dokładnie to, czego potrzeba przy
   przejściu od jednego prototypu do dziesiątek sztuk - a to jest wprost zakres jednej z ich
   ról. W poprzednich CV ten punkt był pobocznym epizodem.
4. **Symulacje ustawione jako oszczędność czasu, nie jako kompetencja.** Dla startupu cyfrowy
   bliźniak nie jest wartością sam w sobie; wartością jest to, że nie budujesz złej wersji.
   Tak to jest napisane.
5. **Ton dopasowany do ich strony.** Piszą *"We're not theoretical thinkers - we execute"*,
   więc CV jest w pierwszej osobie, czynne i bez korporacyjnej waty.
6. **Obywatelstwo UE w nagłówku.** Sami piszą, że nie sponsorują pozwoleń dla krajów trzecich.
   To dla nich realne kryterium odsiewu, więc odpowiedź jest widoczna od razu.

**Czego świadomie nie ma:**

- **ROS 2 jako umiejętność.** Jest wpisany, ale dokładnie tak, jak jest naprawdę: z projektów
  własnych, nie komercyjnie. U nich to tylko bonus, a nie wymóg, więc kłamstwo nic by nie dało,
  a founder z doktoratem z robotyki na EPFL sprawdzi to jednym pytaniem.
- **Niemiecki.** Brak wpisu, bo nie znam Twojego poziomu.
- **Zmyślonych liczb** - udźwigu, liczby osi, czasów cyklu, dokładności powtarzalności SCARA.
  Nie podałeś ich, a przy tym founderze byłby to najgorszy możliwy moment na zaokrąglanie.
- **Stażu z 2021 w web devie.** Wycięty - miesiąc w JavaScripcie rozcieńcza robotyczne CV.

## Czego ta aplikacja naprawdę potrzebuje

Nie kolejnej wersji CV, tylko **linku do SCARA**. Kod na GitHubie, kilka zdjęć złożonego
ramienia, model CAD i krótkie nagranie ruchu. Przy pięcioosobowym zespole i founderze po
doktoracie z robotyki jedno wideo działającej maszyny waży więcej niż każde zdanie
w tym dokumencie.
""",
        encoding="utf-8",
    )
    return path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    created = [
        build_ats_docx(),
        build_visual_docx(),
        build_ats_pdf(),
        build_visual_pdf(),
        write_application_message(),
        write_readme(),
    ]
    for item in created:
        print(item.relative_to(OUT_DIR.parents[1]))


if __name__ == "__main__":
    main()
