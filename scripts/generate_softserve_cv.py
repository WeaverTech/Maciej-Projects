from __future__ import annotations

import copy
from pathlib import Path
from typing import Iterable

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Inches, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


OUT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "softserve-cv"
REDSKY_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "redsky-cv"
INBOLT_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "inbolt-cv"
UNIVERSAL_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "universal-cv"
GRID_DIR = Path(__file__).resolve().parents[1] / "artifacts" / "griddynamics-cv"
FONT_REGULAR = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"

pdfmetrics.registerFont(TTFont(FONT_REGULAR, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont(FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


PROFILE_EN = (
    "Mechanical Engineering student at Cracow University of Technology and certified Software "
    "Technician combining CAD/mechanical design with Python/C++ programming, robotic simulation "
    "and hands-on prototyping. Currently a Robotics Engineer at ASTOR, programming Kawasaki and "
    "Epson robots, building digital twins of production lines and designing and building robot "
    "demonstration stations. Earlier commercial experience creating robotics simulations and "
    "digital twins in Visual Components for automotive production environments. Built an end-to-end "
    "SCARA robotic arm prototype covering CAD, FDM printing, actuator/driver selection, "
    "electronics, control software and hardware-software integration. Interested in automation, "
    "mobile/industrial robotics, drones and simulation-driven development."
)

PROFILE_PL = (
    "Student Mechaniki i Budowy Maszyn na Politechnice Krakowskiej oraz Technik Programista, "
    "łączący projektowanie CAD/mechaniczne z programowaniem w Pythonie/C++, symulacjami robotycznymi "
    "i praktycznym prototypowaniem. Obecnie pracuję jako Inżynier Robotyk w ASTOR, gdzie programuję "
    "roboty Kawasaki i Epson, buduję cyfrowe bliźniaki linii produkcyjnych oraz projektuję i buduję "
    "stanowiska demonstracyjne z robotami. Wcześniej zdobyłem komercyjne doświadczenie w tworzeniu "
    "symulacji robotycznych i cyfrowych bliźniaków w Visual Components dla środowisk produkcyjnych "
    "branży Automotive. Zrealizowałem end-to-end prototyp robota SCARA obejmujący CAD, druk FDM, dobór "
    "napędów i sterowników, elektronikę, oprogramowanie sterujące oraz integrację hardware-software. "
    "Interesuję się automatyką, robotyką mobilną/przemysłową, dronami i rozwojem systemów z użyciem symulacji."
)


CV_EN = {
    "filename": "Maciej_Tkacz_CV_SoftServe_EN",
    "lang": "en",
    "outdir": OUT_DIR,
    "name": "Maciej Tkacz",
    "title": "Junior Robotics / Simulation Engineer",
    "contact": [
        "Email: maciek01110@gmail.com",
        "Phone: +48 881 912 125",
        "Location: Krakow, Poland",
        "Polish: native | English: C1",
        "Driving licence: category B",
    ],
    "profile_title": "Professional Profile",
    "profile": PROFILE_EN,
    "sections": [
        {
            "title": "Key Skills",
            "items": [
                "Robotics simulation & digital twins: Visual Components, robot workcells, robot paths, process logic, collision checks, cycle flows and layout optimization.",
                "Programming: Python, C++, Arduino/C, JavaScript basics; automation scripts, calculation scripts, hardware-control experiments and technical troubleshooting.",
                "Robotics & control: kinematics fundamentals, motion basics, sensing concepts, control systems, dynamic systems modelling, automation, mechatronics and analytical mechanics coursework; industrial robot programming (Kawasaki, Epson - certified courses).",
                "Simulation exposure: MATLAB at university; ROS self-study in personal robotics projects; strong willingness to learn Gazebo, Isaac Sim and similar tools.",
                "CAD & prototyping: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; rapid prototyping with FDM, SLA and MJF; design for additive manufacturing and reverse engineering.",
                "Hardware-software integration: NEMA stepper motors, TMC/DRV motor drivers, Arduino/ESP32-class microcontroller and single-board platforms, wiring, testing and iterative debugging of electromechanical prototypes.",
                "Teamwork: technical documentation, communication with engineering teams and collaborative problem solving in interdisciplinary environments.",
            ],
        },
        {
            "title": "Selected Robotics Project",
            "subtitle": "SCARA Robotic Arm Prototype | Personal R&D Project",
            "items": [
                "Designed and built an end-to-end SCARA robotic arm prototype, covering mechanical concept, CAD modelling, kinematic layout, selection of NEMA stepper actuators and TMC/DRV drivers, microcontroller electronics and wiring.",
                "Optimized components for 3D printing, including PET-G and carbon-fibre reinforced materials, with focus on stiffness, assembly constraints and rapid iteration.",
                "Developed Python/C++ control software for motion and hardware-interaction experiments, applying forward/inverse kinematics and control-system fundamentals.",
                "Integrated mechanical, electronic and software subsystems through iterative assembly, testing and debugging, gaining practical hardware-software integration experience.",
            ],
        },
        {
            "title": "Professional Experience",
            "jobs": [
                {
                    "role": "Robotics Engineer",
                    "company": "ASTOR, Krakow",
                    "date": "Jul 2026 - present",
                    "items": [
                        "Program Kawasaki and Epson industrial robots, from motion programs and teach pendant work to complete application cycles.",
                        "Build digital twins of production lines and robot simulations, validating reach, motion sequences and process behaviour before physical implementation.",
                        "Design, prepare and build demonstration stations presenting Kawasaki and Epson robots across different applications - mechanical assembly, hardware-software integration, programming and commissioning.",
                        "Test and troubleshoot robot cells end to end, working across mechanics, electrics and robot software.",
                    ],
                },
                {
                    "role": "Application Engineer",
                    "company": "AIAutomation",
                    "date": "Jan 2025 - May 2026",
                    "items": [
                        "Created robotics simulations and digital twins of production workcells in Visual Components for automotive clients.",
                        "Developed Python scripts for process optimization and for improving simulation behaviour and performance.",
                        "Developed robot logic, motion sequences, robot paths, collision checks, cycle flows and virtual process validation.",
                        "Optimized workcell layouts and 3D geometry for simulation needs, using SolidWorks and Autodesk Inventor.",
                        "Analyzed customer documentation, engineering standards and technical specifications to support solution concepts aligned with production requirements.",
                        "Collaborated with engineers and stakeholders, communicating simulation assumptions, constraints and improvement proposals.",
                    ],
                },
                {
                    "role": "3D Printing and CAD Design Specialist",
                    "company": "Cubic Inch Additive Manufacturing, Piaseczno",
                    "date": "Jun 2023 - Aug 2023",
                    "items": [
                        "Operated and serviced FDM, MJF and SLA 3D printers, supervising process parameters, post-processing and quality control.",
                        "Designed and optimized CAD models in Fusion 360 and Autodesk Inventor for additive manufacturing and rapid prototyping.",
                        "Supported implementation testing for a new SLA technology, documenting progress and technical observations.",
                        "Coordinated production tasks in a 10-person project team, balancing quality, manufacturability and delivery constraints.",
                    ],
                },
                {
                    "role": "Robotics and 3D Printing Intern",
                    "company": "ASTOR Robotics Center, Krakow",
                    "date": "May 2022",
                    "items": [
                        "Assembled mechanical equipment and 3D-printed components for Kawasaki robots and Astorino educational robot platforms.",
                        "Programmed Kawasaki industrial robots using teach pendant workflows and created basic robot motion programs.",
                        "Tested robot and workstation operation, gaining practical exposure to robot setup, safety and hardware integration.",
                    ],
                },
                {
                    "role": "Web Application Development Intern",
                    "company": "Souczek Design Studio Reklamy i Druku, Kielce",
                    "date": "Jul 2021",
                    "items": [
                        "Solved technical problems in JavaScript, including implementation of an interactive order form.",
                        "Tested and deployed web functionality in a team environment according to customer guidelines.",
                    ],
                },
            ],
        },
        {
            "title": "Education",
            "items": [
                "Cracow University of Technology - Mechanical Engineering, Engineer's degree in progress (Oct 2024 - present). Relevant coursework: dynamic systems modelling, automation/control, analytical mechanics and mechatronics.",
                "PKMechPower Student Research Group, Mechanical Section - CAD and 3D printing tasks, including driver seat and brake-system components; mass and strength-oriented design optimization.",
                "Zespol Szkol Informatycznych im. gen. Jozefa Hauke-Bosaka, Kielce - Software Technician (Sep 2019 - Apr 2024).",
            ],
        },
        {
            "title": "Certificates",
            "items": [
                "Kawasaki robot operation and programming - integrator course with certificate, ASTOR Robotics Center (May 2022).",
                "Epson industrial robot programming - certified course.",
                "Python programming courses and self-directed Python/C++ development in robotics and automation projects.",
            ],
        },
    ],
    "sidebar": {
        "Contact": [
            "maciek01110@gmail.com",
            "+48 881 912 125",
            "Krakow, Poland",
        ],
        "Languages": ["Polish - native", "English - C1"],
        "Technical Stack": [
            "Python",
            "C++ / Arduino C",
            "Kawasaki & Epson robots",
            "Visual Components",
            "MATLAB basics",
            "ROS self-study",
            "SolidWorks",
            "Autodesk Inventor",
            "Fusion 360",
            "AutoCAD",
            "FDM / SLA / MJF",
            "Digital twins",
            "Hardware-software integration",
        ],
        "Robotics Keywords": [
            "Robotic manipulators",
            "SCARA prototype",
            "Robot paths",
            "Collision checking",
            "Control systems",
            "Dynamic systems",
            "Rapid prototyping",
        ],
    },
    "consent": "I hereby consent to the processing of my personal data for the purpose of the current recruitment process.",
}


CV_PL = {
    "filename": "Maciej_Tkacz_CV_SoftServe_PL",
    "lang": "pl",
    "outdir": OUT_DIR,
    "name": "Maciej Tkacz",
    "title": "Junior Robotics / Simulation Engineer",
    "contact": [
        "E-mail: maciek01110@gmail.com",
        "Telefon: +48 881 912 125",
        "Lokalizacja: Kraków",
        "Język angielski: C1",
        "Prawo jazdy: kat. B",
    ],
    "profile_title": "Profil zawodowy",
    "profile": PROFILE_PL,
    "sections": [
        {
            "title": "Kluczowe umiejętności",
            "items": [
                "Symulacje robotyczne i digital twins: Visual Components, gniazda zrobotyzowane, ścieżki ruchu robotów, logika procesu, wykrywanie kolizji, cykle pracy i optymalizacja layoutu.",
                "Programowanie: Python, C++, Arduino/C, podstawy JavaScript; skrypty automatyzujące, obliczeniowe, do sterowania hardware'em i rozwiązywania problemów technicznych.",
                "Robotyka i sterowanie: podstawy kinematyki, ruchu, sensoryki, układów sterowania, modelowania układów dynamicznych, automatyki, mechatroniki i mechaniki analitycznej; programowanie robotów przemysłowych (Kawasaki, Epson - kursy z certyfikatami).",
                "Narzędzia symulacyjne: MATLAB na studiach; ROS rozwijany samodzielnie w projektach robotycznych; gotowość do nauki Gazebo, Isaac Sim i podobnych środowisk.",
                "CAD i prototypowanie: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; rapid prototyping w FDM, SLA i MJF; projektowanie pod technologie przyrostowe i inżynieria odwrotna.",
                "Integracja hardware-software: silniki krokowe NEMA, sterowniki TMC/DRV, platformy mikrokontrolerowe klasy Arduino/ESP32 i komputery jednopłytkowe, okablowanie, testowanie i iteracyjne debugowanie prototypów elektromechanicznych.",
                "Praca zespołowa: dokumentacja techniczna, komunikacja z zespołami inżynieryjnymi i rozwiązywanie problemów w środowisku interdyscyplinarnym.",
            ],
        },
        {
            "title": "Wybrany projekt robotyczny",
            "subtitle": "Prototyp ramienia robota SCARA | Projekt własny R&D",
            "items": [
                "Zaprojektowanie i budowa end-to-end prototypu ramienia SCARA: koncepcja mechaniczna, modelowanie CAD, układ kinematyczny, dobór napędów krokowych NEMA i sterowników TMC/DRV, elektronika mikrokontrolerowa i okablowanie.",
                "Optymalizacja części pod druk 3D, w tym PET-G i materiały wzmacniane włóknem węglowym, z naciskiem na sztywność, montaż i szybkie iteracje konstrukcji.",
                "Tworzenie oprogramowania sterującego w Pythonie/C++ do eksperymentów z ruchem i komunikacją z hardware'em, z wykorzystaniem podstaw kinematyki prostej/odwrotnej i sterowania.",
                "Integracja podsystemów mechanicznych, elektronicznych i software'owych poprzez iteracyjny montaż, testowanie i debugowanie.",
            ],
        },
        {
            "title": "Doświadczenie zawodowe",
            "jobs": [
                {
                    "role": "Inżynier Robotyk",
                    "company": "ASTOR, Kraków",
                    "date": "07.2026 - obecnie",
                    "items": [
                        "Programowanie robotów przemysłowych Kawasaki i Epson - od programów ruchu i pracy na teach pendancie po kompletne cykle aplikacyjne.",
                        "Budowa cyfrowych bliźniaków linii produkcyjnych i symulacji robotów, weryfikacja zasięgów, sekwencji ruchu i zachowania procesu przed wdrożeniem fizycznym.",
                        "Projektowanie, przygotowanie i budowa stanowisk demo prezentujących roboty Kawasaki i Epson w różnych aplikacjach - montaż mechaniczny, integracja hardware-software, programowanie i uruchomienie.",
                        "Testowanie i diagnostyka stanowisk zrobotyzowanych end-to-end, na styku mechaniki, elektryki i oprogramowania robotów.",
                    ],
                },
                {
                    "role": "Application Engineer",
                    "company": "AIAutomation",
                    "date": "01.2025 - 05.2026",
                    "items": [
                        "Tworzenie symulacji robotycznych i cyfrowych bliźniaków gniazd produkcyjnych w Visual Components dla klientów z branży Automotive.",
                        "Pisanie skryptów w Pythonie do optymalizacji procesów oraz usprawniania działania i wydajności symulacji.",
                        "Przygotowywanie logiki pracy robotów, sekwencji ruchu, ścieżek, kontroli kolizji, cykli produkcyjnych i wirtualnej walidacji procesu.",
                        "Optymalizacja layoutów stanowisk oraz geometrii 3D na potrzeby symulacji z użyciem SolidWorks i Autodesk Inventor.",
                        "Analiza dokumentacji klienta, standardów inżynieryjnych i specyfikacji technicznych w celu wsparcia koncepcji rozwiązań zgodnych z wymaganiami produkcyjnymi.",
                        "Współpraca z inżynierami i interesariuszami oraz komunikowanie założeń, ograniczeń i propozycji usprawnień w symulacji.",
                    ],
                },
                {
                    "role": "Specjalista ds. Druku 3D i Projektowania CAD",
                    "company": "Cubic Inch Additive Manufacturing, Piaseczno",
                    "date": "06.2023 - 08.2023",
                    "items": [
                        "Obsługa i serwis drukarek 3D FDM, MJF i SLA: nadzór nad parametrami procesu, post-processing i kontrola jakości.",
                        "Projektowanie i optymalizacja modeli CAD w Fusion 360 i Autodesk Inventor pod technologie przyrostowe oraz rapid prototyping.",
                        "Wsparcie wdrożeniowe nowej technologii SLA poprzez testy, dokumentowanie postępów i obserwacji technicznych.",
                        "Koordynacja zadań produkcyjnych w 10-osobowym zespole projektowym z uwzględnieniem jakości, wytwarzalności i terminowości.",
                    ],
                },
                {
                    "role": "Praktykant ds. Robotyki i Druku 3D",
                    "company": "ASTOR Robotics Center, Kraków",
                    "date": "05.2022",
                    "items": [
                        "Montaż osprzętu mechanicznego i komponentów drukowanych 3D do robotów Kawasaki oraz edukacyjnych platform Astorino.",
                        "Programowanie robotów przemysłowych Kawasaki z wykorzystaniem teach pendanta oraz tworzenie podstawowych programów ruchu.",
                        "Testowanie działania robotów i stanowisk, zdobywanie praktycznej wiedzy z zakresu konfiguracji, bezpieczeństwa i integracji hardware'u.",
                    ],
                },
                {
                    "role": "Stażysta ds. Tworzenia Aplikacji Webowych",
                    "company": "Souczek Design Studio Reklamy i Druku, Kielce",
                    "date": "07.2021",
                    "items": [
                        "Rozwiązywanie problemów technicznych w JavaScript, w tym wdrożenie interaktywnego formularza zamówień.",
                        "Testowanie i wdrażanie funkcjonalności webowych w zespole zgodnie z wytycznymi klienta.",
                    ],
                },
            ],
        },
        {
            "title": "Wykształcenie",
            "items": [
                "Politechnika Krakowska im. Tadeusza Kościuszki - Mechanika i Budowa Maszyn, studia inżynierskie w toku (10.2024 - obecnie). Istotne obszary: modelowanie układów dynamicznych, automatyka/sterowanie, mechanika analityczna i mechatronika.",
                "Koło Naukowe PKMechPower, Sekcja Mechaniczna - zadania konstrukcyjne w CAD i druku 3D, m.in. projekt fotela kierowcy i podzespołów układu hamulcowego; optymalizacja pod kątem masy i wytrzymałości.",
                "Zespół Szkół Informatycznych im. gen. Józefa Hauke-Bosaka w Kielcach - Technik programista (09.2019 - 04.2024).",
            ],
        },
        {
            "title": "Certyfikaty",
            "items": [
                "Obsługa i programowanie robotów Kawasaki - kurs dla integratorów z certyfikatem, ASTOR Robotics Center (05.2022).",
                "Programowanie robotów przemysłowych Epson - kurs z certyfikatem.",
                "Kursy programowania w Pythonie oraz samodzielny rozwój w Python/C++ w projektach robotycznych i automatyzacyjnych.",
            ],
        },
    ],
    "sidebar": {
        "Kontakt": [
            "maciek01110@gmail.com",
            "+48 881 912 125",
            "Kraków",
        ],
        "Języki": ["Polski - ojczysty", "Angielski - C1"],
        "Stack techniczny": [
            "Python",
            "C++ / Arduino C",
            "Roboty Kawasaki i Epson",
            "Visual Components",
            "Podstawy MATLAB",
            "ROS - samodzielna nauka",
            "SolidWorks",
            "Autodesk Inventor",
            "Fusion 360",
            "AutoCAD",
            "FDM / SLA / MJF",
            "Digital twins",
            "Integracja hardware-software",
        ],
        "Słowa kluczowe": [
            "Manipulatory robotyczne",
            "Prototyp SCARA",
            "Ścieżki robotów",
            "Kontrola kolizji",
            "Układy sterowania",
            "Układy dynamiczne",
            "Rapid prototyping",
        ],
    },
    "consent": "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu prowadzenia obecnego postępowania rekrutacyjnego.",
}


PROFILE_REDSKY_EN = (
    "Hands-on robotics builder: Mechanical Engineering student at Cracow University of Technology "
    "and certified Software Technician who takes electromechanical systems from concept to working "
    "prototype. Currently a Robotics Engineer at ASTOR, where I program Kawasaki and Epson robots "
    "and design, build and commission robot demonstration stations showing those robots in "
    "different applications. Earlier commercial experience creating robotics simulations and "
    "digital twins in Visual Components for automotive production. Independently designed and "
    "built a SCARA robotic arm - "
    "CAD, 3D-printed structure, NEMA stepper actuators with TMC/DRV drivers, microcontroller "
    "electronics and Python/C++ control software. Pragmatic, fast-iteration prototyping mindset "
    "and strong interest in physical AI and robotics automation. Fluent Polish, English C1; "
    "available full-time thanks to a flexible study schedule."
)

PROFILE_REDSKY_PL = (
    "Praktyczny inżynier-konstruktor robotyki: student Mechaniki i Budowy Maszyn na Politechnice "
    "Krakowskiej oraz Technik Programista, prowadzący układy elektromechaniczne od koncepcji do "
    "działającego prototypu. Obecnie Inżynier Robotyk w ASTOR, gdzie programuję roboty Kawasaki i "
    "Epson oraz projektuję, buduję i uruchamiam stanowiska demonstracyjne pokazujące te roboty w "
    "różnych aplikacjach. Wcześniej komercyjne doświadczenie w tworzeniu symulacji robotycznych i "
    "cyfrowych bliźniaków w Visual Components dla produkcji Automotive. Samodzielnie zaprojektowałem i "
    "zbudowałem ramię robota SCARA - CAD, konstrukcja drukowana 3D, napędy krokowe NEMA ze "
    "sterownikami TMC/DRV, elektronika mikrokontrolerowa oraz oprogramowanie sterujące w "
    "Pythonie/C++. Pragmatyczne, szybkie prototypowanie i silne zainteresowanie physical AI oraz "
    "automatyzacją. Dostępność w pełnym wymiarze dzięki możliwości dostosowania toku studiów."
)

REDSKY_SKILLS_EN = [
    "Hands-on prototyping & hardware: end-to-end electromechanical builds - CAD design (SolidWorks, Inventor, Fusion 360), 3D printing (FDM/SLA/MJF), component sourcing and selection (NEMA steppers, TMC/DRV drivers, microcontrollers), assembly, wiring and bring-up testing.",
    "Mechatronics & control: kinematics, control systems, dynamic systems modelling, automation and mechatronics coursework; industrial robot programming (Kawasaki, Epson - certified courses, teach pendant).",
    "Programming: Python, C++, Arduino/C; hardware-control code, automation and calculation scripts, iterative debugging of electromechanical prototypes.",
    "Robotics software & simulation: Visual Components digital twins (robot paths, collision checks, cycle flows, layout optimization); ROS self-study; MATLAB at university; simulation-to-real validation mindset.",
    "Rapid iteration & ownership: personal R&D projects taken from concept to working prototype; reverse engineering; technical documentation; pragmatic build-test-improve approach.",
    "Collaboration: fluent Polish (native) and English (C1); teamwork in interdisciplinary engineering environments.",
]

REDSKY_SKILLS_PL = [
    "Praktyczne prototypowanie i hardware: kompletne konstrukcje elektromechaniczne - projekt CAD (SolidWorks, Inventor, Fusion 360), druk 3D (FDM/SLA/MJF), dobór i pozyskiwanie komponentów (silniki krokowe NEMA, sterowniki TMC/DRV, mikrokontrolery), montaż, okablowanie i testy uruchomieniowe.",
    "Mechatronika i sterowanie: kinematyka, układy sterowania, modelowanie układów dynamicznych, automatyka i mechatronika na studiach; programowanie robotów przemysłowych (Kawasaki, Epson - kursy z certyfikatami, teach pendant).",
    "Programowanie: Python, C++, Arduino/C; kod sterujący hardware'em, skrypty automatyzujące i obliczeniowe, iteracyjne debugowanie prototypów elektromechanicznych.",
    "Oprogramowanie robotyczne i symulacje: cyfrowe bliźniaki w Visual Components (ścieżki robotów, kontrola kolizji, cykle pracy, optymalizacja layoutu); ROS we własnym zakresie; MATLAB na studiach; podejście simulation-to-real.",
    "Szybka iteracja i odpowiedzialność: projekty własne R&D od koncepcji do działającego prototypu; inżynieria odwrotna; dokumentacja techniczna; pragmatyczne podejście buduj-testuj-poprawiaj.",
    "Współpraca: polski (ojczysty) i angielski (C1); praca zespołowa w interdyscyplinarnych środowiskach inżynierskich.",
]

CV_REDSKY_EN = copy.deepcopy(CV_EN)
CV_REDSKY_EN.update(
    {
        "filename": "Maciej_Tkacz_CV_RedSky_EN",
        "outdir": REDSKY_DIR,
        "title": "Junior Robotics Engineer - Prototyping & Simulation",
        "profile": PROFILE_REDSKY_EN,
    }
)
CV_REDSKY_EN["sections"][0]["items"] = REDSKY_SKILLS_EN
CV_REDSKY_EN["sidebar"]["Robotics Keywords"] = [
    "Mechatronics",
    "Kinematics",
    "Motion control",
    "Stepper drives (NEMA, TMC/DRV)",
    "Embedded electronics",
    "ROS (self-study)",
    "Digital twins",
    "Rapid prototyping",
]

CV_REDSKY_PL = copy.deepcopy(CV_PL)
CV_REDSKY_PL.update(
    {
        "filename": "Maciej_Tkacz_CV_RedSky_PL",
        "outdir": REDSKY_DIR,
        "title": "Junior Robotics Engineer - prototypowanie i symulacje",
        "profile": PROFILE_REDSKY_PL,
    }
)
CV_REDSKY_PL["sections"][0]["items"] = REDSKY_SKILLS_PL
CV_REDSKY_PL["sidebar"]["Słowa kluczowe"] = [
    "Mechatronika",
    "Kinematyka",
    "Sterowanie ruchem",
    "Napędy krokowe (NEMA, TMC/DRV)",
    "Elektronika embedded",
    "ROS (własne projekty)",
    "Digital twins",
    "Rapid prototyping",
]


PROFILE_INBOLT_EN = (
    "Robotics application engineering profile: Mechanical Engineering student at Cracow University "
    "of Technology and certified Software Technician. Currently a Robotics Engineer at ASTOR, "
    "programming Kawasaki and Epson robots, building digital twins of production lines and "
    "deploying robot demonstration stations across different applications. Earlier Application "
    "Engineer experience in robotics simulation and digital twins (Visual Components) for "
    "automotive clients, including "
    "Python scripting for process optimization and simulation improvements. Certified courses in "
    "industrial robot programming (Kawasaki, Epson). Built a SCARA robotic arm from scratch - CAD, "
    "3D printing, stepper drives, microcontroller electronics and Python/C++ control software. "
    "Strong CAD modelling and 3D-printing background. Native Polish, English C1; based in Poland, "
    "available full-time and open to extensive travel to customer sites."
)

PROFILE_INBOLT_PL = (
    "Profil inżyniera aplikacyjnego robotyki: student Mechaniki i Budowy Maszyn na Politechnice "
    "Krakowskiej oraz Technik Programista. Obecnie Inżynier Robotyk w ASTOR - programowanie robotów "
    "Kawasaki i Epson, budowa cyfrowych bliźniaków linii produkcyjnych oraz uruchamianie stanowisk "
    "demonstracyjnych z robotami w różnych aplikacjach. Wcześniej doświadczenie na stanowisku Application "
    "Engineer w symulacjach robotycznych i cyfrowych bliźniakach (Visual Components) dla klientów "
    "Automotive, w tym pisanie skryptów w Pythonie do optymalizacji procesów i usprawniania "
    "symulacji. Certyfikowane kursy programowania robotów przemysłowych (Kawasaki, Epson). Od "
    "podstaw zbudowane ramię robota SCARA - CAD, druk 3D, napędy krokowe, elektronika "
    "mikrokontrolerowa i oprogramowanie sterujące w Pythonie/C++. Mocny warsztat CAD i druku 3D. "
    "Polski ojczysty, angielski C1; baza w Polsce, dostępność w pełnym wymiarze i gotowość do "
    "częstych podróży do klientów."
)

INBOLT_SKILLS_EN = [
    "Industrial robot programming: Kawasaki and Epson robots (certified courses) - teach pendant workflows, motion programs and robot cell testing; fast learner of FANUC, ABB and UR environments.",
    "Python: solid scripting skills - process-optimization and simulation-improvement scripts in Visual Components, automation and calculation tools; C++ and Arduino/C for hardware control.",
    "Robotics simulation & digital twins: Visual Components workcells for automotive clients - robot paths, collision checks, cycle flows, layout optimization and virtual process validation.",
    "Customer-facing engineering: working with client documentation and automotive engineering standards; communicating simulation assumptions and improvement proposals to engineers and stakeholders.",
    "CAD modelling & 3D printing: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; FDM/SLA/MJF rapid prototyping, design for manufacturing and reverse engineering.",
    "Systems integration: SCARA arm built end-to-end (mechanics, electronics, software); hardware-software integration, testing and iterative debugging.",
    "Work style: proactive, autonomous and quality-focused; native Polish, English C1; open to extensive travel to customer sites.",
]

INBOLT_SKILLS_PL = [
    "Programowanie robotów przemysłowych: roboty Kawasaki i Epson (kursy z certyfikatami) - teach pendant, programy ruchu i testy stanowisk zrobotyzowanych; szybka adaptacja do środowisk FANUC, ABB i UR.",
    "Python: solidne umiejętności skryptowe - skrypty optymalizujące procesy i usprawniające symulacje w Visual Components, narzędzia automatyzujące i obliczeniowe; C++ i Arduino/C do sterowania hardware'em.",
    "Symulacje robotyczne i digital twins: gniazda w Visual Components dla klientów Automotive - ścieżki robotów, kontrola kolizji, cykle pracy, optymalizacja layoutu i wirtualna walidacja procesu.",
    "Praca z klientem: analiza dokumentacji i standardów inżynieryjnych Automotive; komunikowanie założeń symulacji i propozycji usprawnień inżynierom i interesariuszom.",
    "CAD i druk 3D: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; rapid prototyping FDM/SLA/MJF, projektowanie pod produkcję i inżynieria odwrotna.",
    "Integracja systemów: ramię SCARA zbudowane end-to-end (mechanika, elektronika, software); integracja hardware-software, testy i iteracyjne debugowanie.",
    "Styl pracy: proaktywność, samodzielność i dbałość o jakość; polski ojczysty, angielski C1; gotowość do częstych podróży do zakładów klientów.",
]

CV_INBOLT_EN = copy.deepcopy(CV_EN)
CV_INBOLT_EN.update(
    {
        "filename": "Maciej_Tkacz_CV_Inbolt_EN",
        "outdir": INBOLT_DIR,
        "title": "Robotics Application Engineer",
        "profile": PROFILE_INBOLT_EN,
    }
)
CV_INBOLT_EN["sections"][0]["items"] = INBOLT_SKILLS_EN
CV_INBOLT_EN["sidebar"]["Robotics Keywords"] = [
    "Industrial robots (Kawasaki, Epson)",
    "Robot deployment & testing",
    "Digital twins",
    "Robot paths & collisions",
    "Python scripting",
    "CAD & 3D printing",
    "Automotive standards",
    "Customer collaboration",
]

CV_INBOLT_PL = copy.deepcopy(CV_PL)
CV_INBOLT_PL.update(
    {
        "filename": "Maciej_Tkacz_CV_Inbolt_PL",
        "outdir": INBOLT_DIR,
        "title": "Robotics Application Engineer",
        "profile": PROFILE_INBOLT_PL,
    }
)
CV_INBOLT_PL["sections"][0]["items"] = INBOLT_SKILLS_PL
CV_INBOLT_PL["sidebar"]["Słowa kluczowe"] = [
    "Roboty przemysłowe (Kawasaki, Epson)",
    "Wdrożenia i testy robotów",
    "Digital twins",
    "Ścieżki i kolizje robotów",
    "Skrypty Python",
    "CAD i druk 3D",
    "Standardy Automotive",
    "Współpraca z klientem",
]


PROFILE_UNIVERSAL_EN = (
    "Robotics engineer combining industrial robot programming with simulation and hands-on machine "
    "building. Currently a Robotics Engineer at ASTOR, where I program Kawasaki and Epson robots, "
    "build digital twins of production lines and robot simulations, and design and build "
    "demonstration stations presenting those robots across different applications. Previously an "
    "Application Engineer at AIAutomation, creating robotics simulations and digital twins of "
    "production workcells in Visual Components for automotive clients, including Python scripts for "
    "process optimization. Mechanical Engineering student at Cracow University of Technology and "
    "certified Software Technician, so mechanics, electronics and code come from the same "
    "background. Designed and built a SCARA robotic arm end-to-end - CAD, 3D printing, stepper "
    "drives, microcontroller electronics and Python/C++ control software with forward and inverse "
    "kinematics. Based in Krakow, available full-time, Polish native, English C1."
)

PROFILE_UNIVERSAL_PL = (
    "Inżynier robotyk łączący programowanie robotów przemysłowych z symulacją i praktyczną budową "
    "maszyn. Obecnie Inżynier Robotyk w ASTOR, gdzie programuję roboty Kawasaki i Epson, buduję "
    "cyfrowe bliźniaki linii produkcyjnych i symulacje robotów oraz projektuję i buduję stanowiska "
    "demonstracyjne prezentujące te roboty w różnych aplikacjach. Wcześniej Application Engineer w "
    "AIAutomation - symulacje robotyczne i cyfrowe bliźniaki gniazd produkcyjnych w Visual "
    "Components dla klientów Automotive, w tym skrypty w Pythonie do optymalizacji procesów. "
    "Student Mechaniki i Budowy Maszyn na Politechnice Krakowskiej i Technik Programista - "
    "mechanika, elektronika i kod pochodzą u mnie z tego samego przygotowania. Zaprojektowałem i "
    "zbudowałem end-to-end ramię robota SCARA: CAD, druk 3D, napędy krokowe, elektronika "
    "mikrokontrolerowa i oprogramowanie sterujące w Pythonie/C++ z kinematyką prostą i odwrotną. "
    "Baza w Krakowie, dostępność w pełnym wymiarze, polski ojczysty, angielski C1."
)

UNIVERSAL_SKILLS_EN = [
    "Industrial robot programming: Kawasaki and Epson robots - teach pendant workflows, motion programs, complete application cycles, cell testing and commissioning; certified integrator course (ASTOR Robotics Center) and Epson programming course.",
    "Robotics simulation & digital twins: digital twins of production lines and workcells, robot paths and motion sequences, process logic, collision checking, cycle flows, layout optimization and virtual validation before physical implementation; Visual Components used commercially for automotive clients.",
    "Programming: Python (automation, process optimization, simulation scripting, calculations, data processing), C++ and Arduino/C for hardware control, JavaScript basics; iterative debugging and technical troubleshooting.",
    "Robot cells & demonstration systems: design, assembly, integration, programming and commissioning of robot stations presenting industrial robots in different applications, across mechanics, electrics and robot software.",
    "Mechanical design & CAD: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; design for manufacturing and additive manufacturing, reverse engineering, geometry preparation for simulation.",
    "Prototyping & electromechanics: FDM, SLA and MJF 3D printing including PET-G and carbon-fibre reinforced materials; NEMA stepper motors, TMC/DRV drivers, Arduino/ESP32-class microcontrollers, wiring and bring-up testing.",
    "Engineering fundamentals: kinematics, control systems, dynamic systems modelling, mechatronics and analytical mechanics from university; MATLAB from coursework and ROS from personal robotics projects.",
    "Working style: technical documentation, communication with engineers, customers and stakeholders, and independent problem solving in interdisciplinary teams; Polish native, English C1, driving licence category B.",
]

UNIVERSAL_SKILLS_PL = [
    "Programowanie robotów przemysłowych: roboty Kawasaki i Epson - praca na teach pendancie, programy ruchu, kompletne cykle aplikacyjne, testy i uruchomienia stanowisk; kurs integratorski z certyfikatem (ASTOR Robotics Center) oraz kurs programowania robotów Epson.",
    "Symulacje robotyczne i cyfrowe bliźniaki: cyfrowe bliźniaki linii produkcyjnych i gniazd, ścieżki i sekwencje ruchu robotów, logika procesu, wykrywanie kolizji, cykle pracy, optymalizacja layoutu i wirtualna walidacja przed wdrożeniem fizycznym; Visual Components wykorzystywany komercyjnie dla klientów Automotive.",
    "Programowanie: Python (automatyzacja, optymalizacja procesów, skrypty symulacyjne, obliczenia, przetwarzanie danych), C++ i Arduino/C do sterowania hardware'em, podstawy JavaScript; iteracyjne debugowanie i diagnostyka techniczna.",
    "Stanowiska zrobotyzowane i demonstracyjne: projektowanie, montaż, integracja, programowanie i uruchamianie stanowisk prezentujących roboty przemysłowe w różnych aplikacjach, na styku mechaniki, elektryki i oprogramowania robotów.",
    "Projektowanie mechaniczne i CAD: SolidWorks, Autodesk Inventor, Fusion 360, AutoCAD; projektowanie pod produkcję i technologie przyrostowe, inżynieria odwrotna, przygotowanie geometrii pod symulację.",
    "Prototypowanie i elektromechanika: druk 3D FDM, SLA i MJF, w tym PET-G i materiały wzmacniane włóknem węglowym; silniki krokowe NEMA, sterowniki TMC/DRV, mikrokontrolery klasy Arduino/ESP32, okablowanie i testy uruchomieniowe.",
    "Podstawy inżynierskie: kinematyka, układy sterowania, modelowanie układów dynamicznych, mechatronika i mechanika analityczna ze studiów; MATLAB z zajęć i ROS z projektów własnych.",
    "Styl pracy: dokumentacja techniczna, komunikacja z inżynierami, klientami i interesariuszami oraz samodzielne rozwiązywanie problemów w zespołach interdyscyplinarnych; polski ojczysty, angielski C1, prawo jazdy kat. B.",
]

UNIVERSAL_STACK_EN = [
    "Kawasaki robots",
    "Epson robots",
    "Visual Components",
    "Digital twins",
    "Python",
    "C++ / Arduino C",
    "SolidWorks",
    "Autodesk Inventor",
    "Fusion 360",
    "AutoCAD",
    "FDM / SLA / MJF",
    "MATLAB basics",
    "ROS (personal projects)",
    "Hardware-software integration",
]

UNIVERSAL_STACK_PL = [
    "Roboty Kawasaki",
    "Roboty Epson",
    "Visual Components",
    "Cyfrowe bliźniaki",
    "Python",
    "C++ / Arduino C",
    "SolidWorks",
    "Autodesk Inventor",
    "Fusion 360",
    "AutoCAD",
    "FDM / SLA / MJF",
    "Podstawy MATLAB",
    "ROS - projekty własne",
    "Integracja hardware-software",
]

CV_UNIVERSAL_EN = copy.deepcopy(CV_EN)
CV_UNIVERSAL_EN.update(
    {
        "filename": "Maciej_Tkacz_CV_EN",
        "outdir": UNIVERSAL_DIR,
        "title": "Robotics Engineer - Industrial Robot Programming, Simulation & Digital Twins",
        "profile": PROFILE_UNIVERSAL_EN,
    }
)
CV_UNIVERSAL_EN["sections"][0]["items"] = UNIVERSAL_SKILLS_EN
CV_UNIVERSAL_EN["sidebar"]["Technical Stack"] = UNIVERSAL_STACK_EN
CV_UNIVERSAL_EN["sidebar"]["Robotics Keywords"] = [
    "Industrial robot programming",
    "Digital twins of production lines",
    "Robot simulation",
    "Robot cell commissioning",
    "Demonstration stations",
    "Kinematics & robot paths",
    "Hardware-software integration",
    "Rapid prototyping",
]

CV_UNIVERSAL_PL = copy.deepcopy(CV_PL)
CV_UNIVERSAL_PL.update(
    {
        "filename": "Maciej_Tkacz_CV_PL",
        "outdir": UNIVERSAL_DIR,
        "title": "Inżynier Robotyk - programowanie robotów, symulacje i cyfrowe bliźniaki",
        "profile": PROFILE_UNIVERSAL_PL,
    }
)
CV_UNIVERSAL_PL["sections"][0]["items"] = UNIVERSAL_SKILLS_PL
CV_UNIVERSAL_PL["sidebar"]["Stack techniczny"] = UNIVERSAL_STACK_PL
CV_UNIVERSAL_PL["sidebar"]["Słowa kluczowe"] = [
    "Programowanie robotów przemysłowych",
    "Cyfrowe bliźniaki linii produkcyjnych",
    "Symulacje robotów",
    "Uruchamianie stanowisk",
    "Stanowiska demonstracyjne",
    "Kinematyka i ścieżki robotów",
    "Integracja hardware-software",
    "Rapid prototyping",
]


# Flip to True once the Isaac Sim / USD port of the SCARA arm has actually been started,
# then regenerate. Until then the CV describes it as a planned next step, not work in progress.
ISAAC_PORT_STARTED = False

GRID_ISAAC_PROFILE_EN = (
    "I am learning the USD/Isaac Sim pipeline and porting that SCARA arm into it."
    if ISAAC_PORT_STARTED
    else "My next project is rebuilding that SCARA arm inside a USD-based simulator to compare "
    "simulated and real behaviour."
)

GRID_ISAAC_PROFILE_PL = (
    "uczę się pipeline'u USD/Isaac Sim i przenoszę do niego to ramię SCARA."
    if ISAAC_PORT_STARTED
    else "moim kolejnym projektem jest odtworzenie tego ramienia SCARA w symulatorze opartym na "
    "USD, aby porównać zachowanie symulowane i rzeczywiste."
)

GRID_ISAAC_SKILL_EN = (
    "Simulation stack in progress: self-directed learning of NVIDIA Isaac Sim / Omniverse and the USD asset pipeline, with my own SCARA arm as the porting target; ROS from personal robotics projects; MATLAB from university."
    if ISAAC_PORT_STARTED
    else "Simulation stack roadmap: moving into NVIDIA Isaac Sim / Omniverse and the USD asset pipeline, with my own SCARA arm as the planned porting target; ROS from personal robotics projects; MATLAB from university."
)

GRID_ISAAC_SKILL_PL = (
    "Stack symulacyjny w budowie: samodzielna nauka NVIDIA Isaac Sim / Omniverse i pipeline'u USD, z własnym ramieniem SCARA jako celem migracji; ROS z projektów własnych; MATLAB ze studiów."
    if ISAAC_PORT_STARTED
    else "Kierunek rozwoju stacku: wejście w NVIDIA Isaac Sim / Omniverse i pipeline USD, z własnym ramieniem SCARA jako planowanym celem migracji; ROS z projektów własnych; MATLAB ze studiów."
)

GRID_ISAAC_PROJECT_EN = (
    "Currently using this arm as the subject of a USD/Isaac Sim port, to compare simulated and real behaviour on the same motion sequences."
    if ISAAC_PORT_STARTED
    else "Planned next step: porting this arm into a USD-based simulator to run identical motion sequences in simulation and on the physical machine and compare the results."
)

GRID_ISAAC_PROJECT_PL = (
    "Obecnie to ramię jest przedmiotem migracji do USD/Isaac Sim, w celu porównania zachowania symulowanego i rzeczywistego na tych samych sekwencjach ruchu."
    if ISAAC_PORT_STARTED
    else "Planowany kolejny krok: przeniesienie ramienia do symulatora opartego na USD, aby uruchomić identyczne sekwencje ruchu w symulacji i na fizycznej maszynie oraz porównać wyniki."
)

GRID_ISAAC_STACK_EN = (
    ["Isaac Sim / Omniverse (learning)", "USD asset pipeline (learning)"]
    if ISAAC_PORT_STARTED
    else ["Isaac Sim / Omniverse (next step)", "USD asset pipeline (next step)"]
)

GRID_ISAAC_STACK_PL = (
    ["Isaac Sim / Omniverse - w nauce", "Pipeline USD - w nauce"]
    if ISAAC_PORT_STARTED
    else ["Isaac Sim / Omniverse - kolejny krok", "Pipeline USD - kolejny krok"]
)

PROFILE_GRID_EN = (
    "Simulation engineer profile built on commercial physics-based simulation of mechanical and "
    "robotic systems - and on building the physical machines those simulations describe. "
    "Currently a Robotics Engineer at ASTOR, building digital twins of production lines and robot "
    "simulations, programming Kawasaki and Epson robots, and designing and commissioning robot "
    "demonstration stations, so I see both the model and the machine it is supposed to match. "
    "Previously an Application Engineer at AIAutomation for a year and a half: digital twins of "
    "production workcells for automotive clients, validating and tuning kinematics, joint limits, "
    "reach and motion constraints, integrating customer CAD models into the simulation "
    "environment, and writing Python scripts that automate simulation logic and improve "
    "simulation performance. Mechanical Engineering student at Cracow University of Technology "
    "(dynamic systems modelling, control, analytical mechanics) and certified Software Technician, "
    "so the physics side and the scripting side come from the same background. I also designed "
    "and built a SCARA robotic arm end-to-end, which gives me a machine of my own to validate "
    "simulated behaviour against. My simulation stack so far is Visual Components rather than "
    "Omniverse. " + GRID_ISAAC_PROFILE_EN + " Based in Krakow, available full-time."
)

PROFILE_GRID_PL = (
    "Profil inżyniera symulacji oparty na komercyjnej pracy z symulacją fizyczną układów "
    "mechanicznych i robotycznych - oraz na budowaniu maszyn, które te symulacje opisują. "
    "Obecnie Inżynier Robotyk w ASTOR: buduję cyfrowe bliźniaki linii produkcyjnych i symulacje "
    "robotów, programuję roboty Kawasaki i Epson oraz projektuję i uruchamiam stanowiska "
    "demonstracyjne, więc widzę jednocześnie model i maszynę, z którą ma się zgadzać. Wcześniej "
    "przez półtora roku Application Engineer w AIAutomation: cyfrowe bliźniaki gniazd "
    "produkcyjnych dla klientów Automotive, walidacja i strojenie kinematyki, limitów przegubów, "
    "zasięgów i ograniczeń ruchu, integracja modeli CAD klienta do środowiska symulacyjnego oraz "
    "skrypty w Pythonie automatyzujące logikę symulacji i poprawiające jej wydajność. Student "
    "Mechaniki i Budowy Maszyn na Politechnice Krakowskiej (modelowanie układów dynamicznych, "
    "automatyka, mechanika analityczna) i Technik Programista - strona fizyczna i skryptowa "
    "pochodzą u mnie z tego samego przygotowania. Zaprojektowałem i zbudowałem też end-to-end "
    "ramię robota SCARA, czyli mam własną maszynę do weryfikowania zachowania symulacji. Mój "
    "dotychczasowy stack to Visual Components, nie Omniverse; " + GRID_ISAAC_PROFILE_PL
    + " Baza w Krakowie, dostępność w pełnym wymiarze."
)

GRID_SKILLS_EN = [
    "Python for simulation: scripting simulation logic and behaviour, process-optimization scripts, automation of repetitive simulation tasks, calculation and data-processing tools; C++ and Arduino/C for hardware-level control.",
    "Physics-based simulation of mechanical systems: validating and tuning kinematics, joint limits, reach, collisions and motion constraints; university coursework in dynamic systems modelling, control, mechatronics and analytical mechanics.",
    "CAD models inside simulation environments: preparing, cleaning and optimizing 3D geometry from SolidWorks, Autodesk Inventor, Fusion 360 and AutoCAD for use in simulation, balancing visual fidelity against simulation performance.",
    "Robotics simulation & digital twins: digital twins of production lines and workcells - robot paths, process logic, collision checking, cycle flows, layout optimization and virtual validation before physical implementation; Visual Components used commercially for automotive clients.",
    "Sim-to-real grounding: I program, build and commission the physical robot cells I also model, and I designed and built a SCARA arm I control in Python/C++ - a direct reference for simulated kinematics, gear ratios, joint limits and actuator behaviour.",
    GRID_ISAAC_SKILL_EN,
    "Engineering practice: version control with Git, technical documentation of simulation workflows, assumptions and constraints, and work with customer documentation and engineering standards.",
    "Industrial robots: Kawasaki and Epson programming - certified courses, teach pendant workflows, application cycles and robot cell testing.",
]

GRID_SKILLS_PL = [
    "Python w symulacji: skryptowanie logiki i zachowania symulacji, skrypty optymalizujące procesy, automatyzacja powtarzalnych zadań symulacyjnych, narzędzia obliczeniowe i do przetwarzania danych; C++ i Arduino/C do sterowania hardware'em.",
    "Symulacja fizyczna układów mechanicznych: walidacja i strojenie kinematyki, limitów przegubów, zasięgów, kolizji i ograniczeń ruchu; na studiach modelowanie układów dynamicznych, automatyka, mechatronika i mechanika analityczna.",
    "Modele CAD w środowiskach symulacyjnych: przygotowanie, czyszczenie i optymalizacja geometrii 3D z SolidWorks, Autodesk Inventor, Fusion 360 i AutoCAD pod użycie w symulacji, z równoważeniem wierności wizualnej i wydajności.",
    "Symulacje robotyczne i cyfrowe bliźniaki: bliźniaki linii produkcyjnych i gniazd - ścieżki robotów, logika procesu, wykrywanie kolizji, cykle pracy, optymalizacja layoutu i wirtualna walidacja przed wdrożeniem fizycznym; Visual Components wykorzystywany komercyjnie dla klientów Automotive.",
    "Odniesienie sim-to-real: programuję, buduję i uruchamiam te same stanowiska, które modeluję, a dodatkowo zaprojektowałem i zbudowałem ramię SCARA sterowane w Pythonie/C++ - bezpośredni punkt odniesienia dla symulowanej kinematyki, przełożeń, limitów przegubów i zachowania napędów.",
    GRID_ISAAC_SKILL_PL,
    "Warsztat inżynierski: wersjonowanie w Git, dokumentacja techniczna workflow symulacyjnego, założeń i ograniczeń, praca z dokumentacją klienta i standardami inżynieryjnymi.",
    "Roboty przemysłowe: programowanie robotów Kawasaki i Epson - kursy z certyfikatami, praca na teach pendancie, cykle aplikacyjne i testy stanowisk.",
]

GRID_ASTOR_EN = [
    "Build digital twins of production lines and robot simulations, validating reach, motion sequences and process behaviour before physical implementation.",
    "Program Kawasaki and Epson industrial robots, so the motion I model in simulation is motion I also implement and verify on the physical machine.",
    "Design, build and commission robot demonstration stations presenting Kawasaki and Epson robots in different applications - mechanical assembly, hardware-software integration, programming and bring-up.",
    "Work across mechanics, electrics and robot software when testing and troubleshooting robot cells, which is where simulated and real behaviour get compared in practice.",
]

GRID_ASTOR_PL = [
    "Budowa cyfrowych bliźniaków linii produkcyjnych i symulacji robotów, weryfikacja zasięgów, sekwencji ruchu i zachowania procesu przed wdrożeniem fizycznym.",
    "Programowanie robotów przemysłowych Kawasaki i Epson - ruch, który modeluję w symulacji, wdrażam i weryfikuję również na fizycznej maszynie.",
    "Projektowanie, budowa i uruchamianie stanowisk demonstracyjnych prezentujących roboty Kawasaki i Epson w różnych aplikacjach - montaż mechaniczny, integracja hardware-software, programowanie i rozruch.",
    "Praca na styku mechaniki, elektryki i oprogramowania robotów przy testach i diagnostyce stanowisk - tam w praktyce porównuje się zachowanie symulowane z rzeczywistym.",
]

GRID_AIA_EN = [
    "Built and maintained physics-based simulations and digital twins of production workcells in Visual Components for automotive clients.",
    "Validated and tuned robot kinematics, reach, joint limits, motion constraints and collision behaviour so that simulated cells matched real production requirements.",
    "Integrated customer CAD models from SolidWorks and Autodesk Inventor into the simulation environment, preparing and optimizing 3D geometry for simulation use and performance.",
    "Developed Python scripts to automate simulation logic, optimize processes and improve simulation behaviour and performance.",
    "Implemented robot logic, motion sequences, robot paths, cycle flows and virtual process validation, and optimized workcell layouts.",
    "Documented simulation assumptions, constraints and workflows, and analyzed customer documentation and engineering standards to keep simulated behaviour aligned with the physical process.",
]

GRID_AIA_PL = [
    "Budowa i utrzymanie symulacji fizycznych oraz cyfrowych bliźniaków gniazd produkcyjnych w Visual Components dla klientów Automotive.",
    "Walidacja i strojenie kinematyki robotów, zasięgów, limitów przegubów, ograniczeń ruchu i zachowań kolizyjnych, tak aby symulowane gniazda odpowiadały rzeczywistym wymaganiom produkcyjnym.",
    "Integracja modeli CAD klienta z SolidWorks i Autodesk Inventor do środowiska symulacyjnego, przygotowanie i optymalizacja geometrii 3D pod użycie w symulacji i jej wydajność.",
    "Pisanie skryptów w Pythonie automatyzujących logikę symulacji, optymalizujących procesy oraz poprawiających działanie i wydajność symulacji.",
    "Implementacja logiki pracy robotów, sekwencji ruchu, ścieżek, cykli produkcyjnych i wirtualnej walidacji procesu oraz optymalizacja layoutów gniazd.",
    "Dokumentowanie założeń, ograniczeń i workflow symulacyjnego oraz analiza dokumentacji klienta i standardów inżynieryjnych pod kątem zgodności symulacji z procesem fizycznym.",
]

GRID_SCARA_EN = [
    "Designed and built an end-to-end SCARA robotic arm: mechanical concept, CAD modelling, kinematic layout, gear ratios, selection of NEMA stepper actuators and TMC/DRV drivers, microcontroller electronics and wiring.",
    "Defined and verified the physical parameters that drive simulated behaviour - link geometry, joint limits, gear ratios and actuator torque - against the assembled machine.",
    "Developed Python/C++ control software implementing forward and inverse kinematics, giving a real measurement point for comparing modelled and physical motion.",
    "Optimized components for 3D printing, including PET-G and carbon-fibre reinforced materials, with focus on stiffness, assembly constraints and rapid iteration.",
    GRID_ISAAC_PROJECT_EN,
]

GRID_SCARA_PL = [
    "Zaprojektowanie i budowa end-to-end ramienia robota SCARA: koncepcja mechaniczna, modelowanie CAD, układ kinematyczny, przełożenia, dobór napędów krokowych NEMA i sterowników TMC/DRV, elektronika mikrokontrolerowa i okablowanie.",
    "Zdefiniowanie i weryfikacja parametrów fizycznych decydujących o zachowaniu w symulacji - geometrii członów, limitów przegubów, przełożeń i momentów napędów - na zmontowanej maszynie.",
    "Oprogramowanie sterujące w Pythonie/C++ z kinematyką prostą i odwrotną, co daje realny punkt pomiarowy do porównywania ruchu modelowanego i fizycznego.",
    "Optymalizacja części pod druk 3D, w tym PET-G i materiały wzmacniane włóknem węglowym, z naciskiem na sztywność, montaż i szybkie iteracje.",
    GRID_ISAAC_PROJECT_PL,
]

GRID_STACK_EN = [
    "Python",
    "C++ / Arduino C",
    "Visual Components",
    "Physics-based simulation",
    *GRID_ISAAC_STACK_EN,
    "ROS (personal projects)",
    "MATLAB basics",
    "SolidWorks",
    "Autodesk Inventor",
    "Fusion 360",
    "AutoCAD",
    "Git",
    "Kawasaki & Epson robots",
]

GRID_STACK_PL = [
    "Python",
    "C++ / Arduino C",
    "Visual Components",
    "Symulacja fizyczna",
    *GRID_ISAAC_STACK_PL,
    "ROS - projekty własne",
    "Podstawy MATLAB",
    "SolidWorks",
    "Autodesk Inventor",
    "Fusion 360",
    "AutoCAD",
    "Git",
    "Roboty Kawasaki i Epson",
]

CV_GRID_EN = copy.deepcopy(CV_EN)
CV_GRID_EN.update(
    {
        "filename": "Maciej_Tkacz_CV_GridDynamics_EN",
        "outdir": GRID_DIR,
        "title": "Simulation Engineer - Robotics & Physics-Based Simulation",
        "profile": PROFILE_GRID_EN,
    }
)
CV_GRID_EN["sections"][0]["items"] = GRID_SKILLS_EN
CV_GRID_EN["sections"][1]["title"] = "Selected Simulation & Robotics Project"
CV_GRID_EN["sections"][1]["subtitle"] = (
    "SCARA Robotic Arm - Physical Prototype and Kinematic Model | Personal R&D Project"
)
CV_GRID_EN["sections"][1]["items"] = GRID_SCARA_EN
CV_GRID_EN["sections"][2]["jobs"][0]["items"] = GRID_ASTOR_EN
CV_GRID_EN["sections"][2]["jobs"][1]["items"] = GRID_AIA_EN
CV_GRID_EN["sidebar"]["Technical Stack"] = GRID_STACK_EN
CV_GRID_EN["sidebar"]["Robotics Keywords"] = [
    "Physics-based simulation",
    "Kinematics & constraints",
    "CAD-to-simulation pipeline",
    "Digital twins",
    "Python simulation scripting",
    "Sim-to-real validation",
    "Simulation workflow documentation",
    "Version-controlled assets",
]

CV_GRID_PL = copy.deepcopy(CV_PL)
CV_GRID_PL.update(
    {
        "filename": "Maciej_Tkacz_CV_GridDynamics_PL",
        "outdir": GRID_DIR,
        "title": "Simulation Engineer - robotyka i symulacja fizyczna",
        "profile": PROFILE_GRID_PL,
    }
)
CV_GRID_PL["sections"][0]["items"] = GRID_SKILLS_PL
CV_GRID_PL["sections"][1]["title"] = "Wybrany projekt symulacyjno-robotyczny"
CV_GRID_PL["sections"][1]["subtitle"] = (
    "Ramię robota SCARA - fizyczny prototyp i model kinematyczny | Projekt własny R&D"
)
CV_GRID_PL["sections"][1]["items"] = GRID_SCARA_PL
CV_GRID_PL["sections"][2]["jobs"][0]["items"] = GRID_ASTOR_PL
CV_GRID_PL["sections"][2]["jobs"][1]["items"] = GRID_AIA_PL
CV_GRID_PL["sidebar"]["Stack techniczny"] = GRID_STACK_PL
CV_GRID_PL["sidebar"]["Słowa kluczowe"] = [
    "Symulacja fizyczna",
    "Kinematyka i ograniczenia",
    "CAD w symulacji",
    "Cyfrowe bliźniaki",
    "Skrypty Python w symulacji",
    "Walidacja sim-to-real",
    "Dokumentacja workflow",
    "Wersjonowanie assetów",
]


def set_doc_defaults(doc: Document) -> None:
    section = doc.sections[0]
    section.top_margin = Cm(1.3)
    section.bottom_margin = Cm(1.2)
    section.left_margin = Cm(1.4)
    section.right_margin = Cm(1.4)
    styles = doc.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"].font.size = Pt(9)
    for style_name in ("Heading 1", "Heading 2", "Heading 3"):
        styles[style_name].font.name = "Aptos"
        styles[style_name].font.color.rgb = RGBColor(31, 78, 121)


def add_doc_heading(paragraph, text: str, size: int, bold: bool = True, color: str = "1F4E79") -> None:
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)


def add_doc_bullets(container, items: Iterable[str], style: str = "List Bullet") -> None:
    for item in items:
        p = container.add_paragraph(style=style)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.left_indent = Cm(0.35)
        p.add_run(item)


def add_section_doc(doc_or_cell, title: str) -> None:
    p = doc_or_cell.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    add_doc_heading(p, title.upper(), 10)


def build_ats_docx(cv: dict) -> Path:
    doc = Document()
    set_doc_defaults(doc)

    name = doc.add_paragraph()
    name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_doc_heading(name, cv["name"], 20)
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.add_run(cv["title"]).bold = True
    contact = doc.add_paragraph(" | ".join(cv["contact"]))
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    contact.runs[0].font.size = Pt(8)

    add_section_doc(doc, cv["profile_title"])
    doc.add_paragraph(cv["profile"])

    for section in cv["sections"]:
        add_section_doc(doc, section["title"])
        if "subtitle" in section:
            p = doc.add_paragraph()
            p.add_run(section["subtitle"]).bold = True
        if "items" in section:
            add_doc_bullets(doc, section["items"])
        if "jobs" in section:
            for job in section["jobs"]:
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(3)
                r = p.add_run(job["role"])
                r.bold = True
                p.add_run(f" | {job['company']} | {job['date']}")
                add_doc_bullets(doc, job["items"])

    consent = doc.add_paragraph(cv["consent"])
    consent.runs[0].font.size = Pt(7)

    path = cv["outdir"] / f"{cv['filename']}_ATS.docx"
    doc.save(path)
    return path


def shade_cell(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def build_visual_docx(cv: dict) -> Path:
    doc = Document()
    set_doc_defaults(doc)
    section = doc.sections[0]
    section.left_margin = Cm(1.1)
    section.right_margin = Cm(1.1)

    header = doc.add_table(rows=1, cols=1)
    header.alignment = WD_TABLE_ALIGNMENT.CENTER
    hcell = header.cell(0, 0)
    shade_cell(hcell, "F2F6FA")
    p = hcell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_doc_heading(p, cv["name"], 20)
    p2 = hcell.add_paragraph(cv["title"])
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.runs[0].bold = True

    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(4.7)
    table.columns[1].width = Inches(2.0)
    left = table.cell(0, 0)
    right = table.cell(0, 1)
    right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    shade_cell(right, "F2F6FA")

    add_section_doc(left, cv["profile_title"])
    left.add_paragraph(cv["profile"])

    for section_data in cv["sections"]:
        if section_data["title"] in ("Key Skills", "Kluczowe umiejętności"):
            continue
        add_section_doc(left, section_data["title"])
        if "subtitle" in section_data:
            p = left.add_paragraph()
            p.add_run(section_data["subtitle"]).bold = True
        if "items" in section_data:
            add_doc_bullets(left, section_data["items"])
        if "jobs" in section_data:
            for job in section_data["jobs"]:
                p = left.add_paragraph()
                p.paragraph_format.space_before = Pt(3)
                p.add_run(job["role"]).bold = True
                p.add_run(f" | {job['company']} | {job['date']}")
                add_doc_bullets(left, job["items"])

    for heading, items in cv["sidebar"].items():
        add_section_doc(right, heading)
        add_doc_bullets(right, items)

    add_section_doc(right, "Consent" if cv["lang"] == "en" else "Zgoda")
    c = right.add_paragraph(cv["consent"])
    c.runs[0].font.size = Pt(7)

    path = cv["outdir"] / f"{cv['filename']}_Visual.docx"
    doc.save(path)
    return path


def split_text(text: str, font: str, size: int, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


class PdfWriter:
    def __init__(self, path: Path):
        self.path = path
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.width, self.height = A4
        self.margin = 1.45 * cm
        self.y = self.height - self.margin

    def ensure(self, needed: float) -> None:
        if self.y - needed < self.margin:
            self.c.showPage()
            self.y = self.height - self.margin

    def text(self, text: str, x: float, width: float, size: int = 9, font: str = FONT_REGULAR, leading: float = 11, color=colors.black):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        lines = split_text(text, font, size, width)
        self.ensure(len(lines) * leading + 2)
        for line in lines:
            self.c.drawString(x, self.y, line)
            self.y -= leading
        return len(lines)

    def heading(self, text: str, x: float, width: float):
        self.ensure(22)
        self.y -= 5
        self.c.setFillColor(colors.HexColor("#1F4E79"))
        self.c.setFont(FONT_BOLD, 10)
        self.c.drawString(x, self.y, text.upper())
        self.y -= 4
        self.c.setStrokeColor(colors.HexColor("#1F4E79"))
        self.c.line(x, self.y, x + width, self.y)
        self.y -= 10

    def bullet(self, text: str, x: float, width: float):
        bullet_width = 10
        lines = split_text(text, FONT_REGULAR, 8.6, width - bullet_width)
        self.ensure(len(lines) * 10 + 2)
        self.c.setFillColor(colors.black)
        self.c.setFont(FONT_REGULAR, 8.6)
        self.c.drawString(x, self.y, "-")
        self.c.drawString(x + bullet_width, self.y, lines[0])
        self.y -= 10
        for line in lines[1:]:
            self.c.drawString(x + bullet_width, self.y, line)
            self.y -= 10
        self.y -= 1

    def save(self):
        self.c.save()


def build_ats_pdf(cv: dict) -> Path:
    path = cv["outdir"] / f"{cv['filename']}_ATS.pdf"
    pdf = PdfWriter(path)
    x = pdf.margin
    width = pdf.width - 2 * pdf.margin

    pdf.c.setFillColor(colors.HexColor("#1F4E79"))
    pdf.c.setFont(FONT_BOLD, 20)
    pdf.c.drawCentredString(pdf.width / 2, pdf.y, cv["name"])
    pdf.y -= 18
    pdf.c.setFillColor(colors.black)
    pdf.c.setFont(FONT_BOLD, 11)
    pdf.c.drawCentredString(pdf.width / 2, pdf.y, cv["title"])
    pdf.y -= 15
    pdf.c.setFont(FONT_REGULAR, 8)
    pdf.c.drawCentredString(pdf.width / 2, pdf.y, " | ".join(cv["contact"]))
    pdf.y -= 12

    pdf.heading(cv["profile_title"], x, width)
    pdf.text(cv["profile"], x, width, size=8.8, leading=10.5)

    for section in cv["sections"]:
        pdf.heading(section["title"], x, width)
        if "subtitle" in section:
            pdf.text(section["subtitle"], x, width, size=9, font=FONT_BOLD, leading=11)
        for item in section.get("items", []):
            pdf.bullet(item, x, width)
        for job in section.get("jobs", []):
            pdf.text(f"{job['role']} | {job['company']} | {job['date']}", x, width, size=9, font=FONT_BOLD, leading=11)
            for item in job["items"]:
                pdf.bullet(item, x, width)

    pdf.y -= 5
    pdf.text(cv["consent"], x, width, size=6.8, leading=8)
    pdf.save()
    return path


def draw_sidebar(c: canvas.Canvas, cv: dict, x: float, y: float, width: float):
    c.setFillColor(colors.HexColor("#F2F6FA"))
    c.rect(x - 0.25 * cm, 0, width + 0.5 * cm, A4[1], stroke=0, fill=1)
    current_y = y
    for heading, items in cv["sidebar"].items():
        c.setFillColor(colors.HexColor("#1F4E79"))
        c.setFont(FONT_BOLD, 9)
        c.drawString(x, current_y, heading.upper())
        current_y -= 10
        c.setStrokeColor(colors.HexColor("#1F4E79"))
        c.line(x, current_y, x + width, current_y)
        current_y -= 10
        c.setFillColor(colors.black)
        c.setFont(FONT_REGULAR, 7.6)
        for item in items:
            lines = split_text(item, FONT_REGULAR, 7.6, width - 7)
            c.drawString(x, current_y, "-")
            c.drawString(x + 7, current_y, lines[0])
            current_y -= 9
            for line in lines[1:]:
                c.drawString(x + 7, current_y, line)
                current_y -= 9
            current_y -= 1
        current_y -= 7


def build_visual_pdf(cv: dict) -> Path:
    path = cv["outdir"] / f"{cv['filename']}_Visual.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    page_w, page_h = A4
    margin = 1.15 * cm
    sidebar_w = 5.15 * cm
    gap = 0.55 * cm
    main_x = margin
    sidebar_x = page_w - margin - sidebar_w
    main_w = sidebar_x - gap - main_x

    draw_sidebar(c, cv, sidebar_x, page_h - margin - 58, sidebar_w)
    c.setFillColor(colors.HexColor("#1F4E79"))
    c.setFont(FONT_BOLD, 20)
    c.drawString(main_x, page_h - margin, cv["name"])
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(colors.black)
    c.drawString(main_x, page_h - margin - 16, cv["title"])
    c.setStrokeColor(colors.HexColor("#1F4E79"))
    c.line(main_x, page_h - margin - 25, sidebar_x - gap, page_h - margin - 25)

    y = page_h - margin - 42

    def ensure_local(needed):
        nonlocal y
        if y - needed < margin:
            c.showPage()
            draw_sidebar(c, cv, sidebar_x, page_h - margin, sidebar_w)
            y = page_h - margin

    def heading_local(text):
        nonlocal y
        ensure_local(23)
        y -= 4
        c.setFillColor(colors.HexColor("#1F4E79"))
        c.setFont(FONT_BOLD, 9.5)
        c.drawString(main_x, y, text.upper())
        y -= 4
        c.setStrokeColor(colors.HexColor("#1F4E79"))
        c.line(main_x, y, main_x + main_w, y)
        y -= 10

    def write_local(text, size=8.3, font=FONT_REGULAR, leading=9.8):
        nonlocal y
        lines = split_text(text, font, size, main_w)
        ensure_local(len(lines) * leading + 2)
        c.setFont(font, size)
        c.setFillColor(colors.black)
        for line in lines:
            c.drawString(main_x, y, line)
            y -= leading
        y -= 1

    def bullet_local(text):
        nonlocal y
        lines = split_text(text, FONT_REGULAR, 8.1, main_w - 10)
        ensure_local(len(lines) * 9.4 + 3)
        c.setFont(FONT_REGULAR, 8.1)
        c.setFillColor(colors.black)
        c.drawString(main_x, y, "-")
        c.drawString(main_x + 10, y, lines[0])
        y -= 9.4
        for line in lines[1:]:
            c.drawString(main_x + 10, y, line)
            y -= 9.4
        y -= 1

    heading_local(cv["profile_title"])
    write_local(cv["profile"])

    for section in cv["sections"]:
        if section["title"] in ("Key Skills", "Kluczowe umiejętności"):
            continue
        heading_local(section["title"])
        if "subtitle" in section:
            write_local(section["subtitle"], size=8.4, font=FONT_BOLD, leading=10)
        for item in section.get("items", []):
            bullet_local(item)
        for job in section.get("jobs", []):
            write_local(f"{job['role']} | {job['company']} | {job['date']}", size=8.4, font=FONT_BOLD, leading=10)
            for item in job["items"]:
                bullet_local(item)

    heading_local("Consent" if cv["lang"] == "en" else "Zgoda")
    write_local(cv["consent"], size=6.8, leading=8)
    c.save()
    return path


def write_recruiter_messages() -> Path:
    path = OUT_DIR / "recruiter_messages_softserve.md"
    path.write_text(
        """# Wiadomości do rekrutera - SoftServe Junior Robotics Engineer

## Polish

Dzień dobry,

przesyłam aplikację na stanowisko Junior Robotics Engineer. Jako student Mechaniki i Budowy Maszyn oraz Technik Programista łączę praktyczne projektowanie mechaniczne z programowaniem i symulacjami robotycznymi. Obecnie pracuję jako Inżynier Robotyk w ASTOR, gdzie programuję roboty Kawasaki i Epson, buduję cyfrowe bliźniaki linii produkcyjnych oraz projektuję i buduję stanowiska demonstracyjne z robotami. Wcześniej zdobyłem komercyjne doświadczenie w tworzeniu symulacji robotycznych i cyfrowych bliźniaków w Visual Components, w tym pracy ze ścieżkami ruchu robotów, logiką procesu, wykrywaniem kolizji i optymalizacją layoutu.

W projektach własnych zaprojektowałem i zbudowałem prototyp ramienia robota SCARA, obejmujący CAD, druk 3D, dobór napędów i sterowników, elektronikę oraz kod sterujący w Pythonie/C++. Chętnie rozwinę te kompetencje w zespole Robotics Group przy projektach z zakresu symulacji, prototypowania i integracji systemów robotycznych.

Chętnie opowiem więcej o moich projektach podczas rozmowy.

Pozdrawiam,
Maciej Tkacz

## English

Hello,

I would like to apply for the Junior Robotics Engineer position. As a Mechanical Engineering student and certified Software Technician, I combine hands-on mechanical design with programming and robotics simulation. I currently work as a Robotics Engineer at ASTOR, programming Kawasaki and Epson robots, building digital twins of production lines and designing and building robot demonstration stations. Earlier I gained commercial experience creating robotic simulations and digital twins in Visual Components, including robot paths, process logic, collision checking and layout optimization.

In my personal projects, I designed and built a SCARA robotic arm prototype covering CAD, 3D printing, actuator and driver selection, electronics, and Python/C++ control software. I would be glad to further develop these skills within the Robotics Group, especially in simulation, prototyping and hardware-software integration of robotic systems.

I would be happy to discuss my projects and motivation in more detail.

Best regards,
Maciej Tkacz
""",
        encoding="utf-8",
    )
    return path


def write_redsky_linkedin_message() -> Path:
    path = REDSKY_DIR / "linkedin_message_redsky.md"
    path.write_text(
        """# Wiadomość LinkedIn - Red Sky, Robotic Engineer (Robotics Automation)

Oferta celuje w profil senior/founding engineer (5+ lat doświadczenia), dlatego wiadomość
jest świadomie szczera co do etapu kariery i gra kartą "hands-on buildera" oraz pytaniem
o miejsce dla juniora w tym lub innych projektach Red Sky.

## Wersja pełna (PL) - po zaakceptowaniu zaproszenia lub InMail

Dzień dobry,

piszę w sprawie ogłoszenia Robotic Engineer (Robotics Automation) w startupie budowanym
przez Red Sky. Od razu uczciwie zaznaczę: wiem, że rola celuje w osoby z 5+ latami
doświadczenia, a ja jestem na wcześniejszym etapie. Odzywam się mimo to, bo profil
"hands-on buildera" to dokładnie to, co robię na co dzień - i chcę zapytać, czy w tym
projekcie lub innych inicjatywach Red Sky jest też przestrzeń dla ambitnego inżyniera
na poziomie junior/mid.

W skrócie o mnie:
- obecnie Inżynier Robotyk w ASTOR (od 07.2026) - programowanie robotów Kawasaki i Epson,
  cyfrowe bliźniaki linii produkcyjnych oraz projektowanie, budowa i uruchamianie stanowisk
  demonstracyjnych prezentujących te roboty w różnych aplikacjach,
- komercyjne doświadczenie w symulacjach robotycznych i cyfrowych bliźniakach
  (Visual Components, klienci Automotive; 01.2025-05.2026) - ścieżki robotów, kolizje,
  cykle produkcyjne, optymalizacja layoutów,
- własny projekt R&D: ramię SCARA zbudowane od zera - CAD, druk 3D, napędy krokowe NEMA,
  sterowniki TMC/DRV, elektronika mikrokontrolerowa, kod sterujący w Pythonie/C++,
- kurs integratorski robotów Kawasaki (teach pendant), rapid prototyping FDM/SLA/MJF,
- student Mechaniki i Budowy Maszyn (PK) z dyplomem Technika Programisty; angielski C1,
- dostępność w pełnym wymiarze - mam możliwość dostosowania toku studiów.

Jeśli uzna Pani, że to ma sens, chętnie prześlę CV i opowiem o projektach. Będę też
wdzięczny za informację, czy Red Sky planuje role juniorskie w obszarze robotyki.

Pozdrawiam,
Maciej Tkacz
maciek01110@gmail.com | 881 912 125

## Wersja krótka (PL) - notatka do zaproszenia (limit 300 znaków)

Dzień dobry, piszę ws. roli Robotic Engineer (startup z Red Sky). Jestem na etapie
junior/mid, ale to profil buildera: w ASTOR programuję roboty Kawasaki/Epson i buduję
stanowiska demo, wcześniej symulacje w Visual Components, do tego własne ramię SCARA.
Czy jest miejsce dla juniora? Maciej Tkacz

## Full version (EN)

Hello,

I am reaching out about the Robotic Engineer (Robotics Automation) role at the startup
being built with Red Sky. Let me be upfront: I know the role targets engineers with 5+
years of experience, and I am at an earlier stage of my career. I am writing anyway
because the hands-on builder profile is exactly what I do every day - and I would like
to ask whether there is room in this project, or other Red Sky initiatives, for an
ambitious junior/mid-level engineer.

Briefly about me:
- currently a Robotics Engineer at ASTOR (since Jul 2026) - programming Kawasaki and
  Epson robots, building digital twins of production lines, and designing, building and
  commissioning demonstration stations that show those robots in different applications,
- commercial experience creating robotics simulations and digital twins
  (Visual Components, automotive clients; Jan 2025 - May 2026) - robot paths, collision
  checks, production cycles, layout optimization,
- personal R&D project: a SCARA robotic arm built from scratch - CAD, 3D printing,
  NEMA stepper actuators, TMC/DRV drivers, microcontroller electronics and Python/C++
  control software,
- Kawasaki industrial robot integrator course (teach pendant), rapid prototyping with
  FDM/SLA/MJF,
- Mechanical Engineering student (Cracow University of Technology) and certified
  Software Technician; fluent Polish, English C1,
- available full-time thanks to a flexible study schedule.

If this sounds relevant, I would be happy to send my CV and talk about my projects.
I would also appreciate knowing whether Red Sky plans any junior robotics roles.

Best regards,
Maciej Tkacz
maciek01110@gmail.com | +48 881 912 125
""",
        encoding="utf-8",
    )
    return path


def write_inbolt_linkedin_message() -> Path:
    path = INBOLT_DIR / "linkedin_message_inbolt.md"
    path.write_text(
        """# LinkedIn message - Inbolt, Robotics Application Engineer (Poland)

Inbolt is a French company (Paris HQ) and the first recruitment call is with an
HQ recruiter, so the primary message is in English. A Polish version is included
as a fallback. The short note fits LinkedIn's 300-character connection-request limit.

## Full version (EN) - InMail or after connecting

Hello,

I am reaching out about the Robotics Application Engineer (Poland) role at Inbolt.
The position maps closely to what I do day to day. I currently work as a Robotics
Engineer at ASTOR, programming Kawasaki and Epson industrial robots, building digital
twins of production lines, and designing, building and commissioning demonstration
stations that show those robots in different applications - which is essentially
application engineering: making a robot work for a specific use case and presenting it.
Before that I was an Application Engineer at AIAutomation, building robotics simulations
and digital twins in Visual Components for automotive clients - robot paths, collision
checking, cycle flows and layout optimization - and writing Python scripts for process
optimization and improving simulation behaviour.

Beyond that, I am hands-on with robot hardware:
- certified courses in industrial robot programming (Kawasaki integrator course at
  ASTOR Robotics Center, and Epson robot programming),
- a SCARA robotic arm designed and built from scratch (CAD, 3D printing, stepper
  drives, microcontroller electronics, Python/C++ control software),
- strong CAD modelling (SolidWorks, Inventor, Fusion 360) and 3D printing
  (FDM/SLA/MJF) - I noticed both are listed as desirable for this role.

I am based in Poland (Krakow), a native Polish speaker with C1 English, available
full-time thanks to a flexible study schedule, and open to extensive travel to
customer sites - the customer-facing side of application engineering is the part
I enjoy most. Vision-guided robotics is exactly the direction I want to grow in,
and Inbolt's real-time 3D-vision guidance is a product I would be genuinely excited
to deploy.

I would be glad to send my CV and talk about how I could support Inbolt's
deployments in Poland and across Europe.

Best regards,
Maciej Tkacz
maciek01110@gmail.com | +48 881 912 125

## Short connection note (EN, max 300 characters)

Hello, I'm reaching out about the Robotics Application Engineer (Poland) role. I program
Kawasaki and Epson robots at ASTOR and build robot demo stations; previously Visual
Components digital twins for automotive plus Python scripting. Based in PL, open to
travel. Maciej Tkacz

## Wersja pełna (PL)

Dzień dobry,

piszę w sprawie roli Robotics Application Engineer (Poland) w Inbolt. To stanowisko
mocno pokrywa się z moją codzienną pracą. Obecnie jestem Inżynierem Robotykiem w ASTOR,
gdzie programuję roboty przemysłowe Kawasaki i Epson, buduję cyfrowe bliźniaki linii
produkcyjnych oraz projektuję, buduję i uruchamiam stanowiska demonstracyjne pokazujące
te roboty w różnych aplikacjach - czyli w praktyce robię application engineering:
doprowadzam robota do działania w konkretnym zastosowaniu i prezentuję to rozwiązanie.
Wcześniej jako Application Engineer w AIAutomation tworzyłem symulacje robotyczne
i cyfrowe bliźniaki w Visual Components dla klientów Automotive - ścieżki robotów,
kontrola kolizji, cykle produkcyjne, optymalizacja layoutów - oraz pisałem skrypty
w Pythonie do optymalizacji procesów i usprawniania działania symulacji.

Poza tym pracuję praktycznie z hardware'em robotów:
- certyfikowane kursy programowania robotów przemysłowych (kurs integratorski
  Kawasaki w ASTOR Robotics Center oraz programowanie robotów Epson),
- ramię SCARA zaprojektowane i zbudowane od zera (CAD, druk 3D, napędy krokowe,
  elektronika mikrokontrolerowa, sterowanie w Pythonie/C++),
- mocny warsztat CAD (SolidWorks, Inventor, Fusion 360) i druku 3D (FDM/SLA/MJF) -
  obie rzeczy są wpisane w ogłoszeniu jako mile widziane.

Mieszkam w Polsce (Kraków), polski to mój język ojczysty, angielski C1. Jestem
dostępny w pełnym wymiarze dzięki możliwości dostosowania toku studiów i jestem
gotowy na częste podróże do zakładów klientów - praca z klientem to część application
engineeringu, którą lubię najbardziej. Robotyka sterowana wizyjnie to dokładnie
kierunek, w którym chcę się rozwijać.

Chętnie prześlę CV i porozmawiam o tym, jak mógłbym wesprzeć wdrożenia Inbolt
w Polsce i Europie.

Pozdrawiam,
Maciej Tkacz
maciek01110@gmail.com | 881 912 125
""",
        encoding="utf-8",
    )
    return path


def write_grid_application_message() -> Path:
    path = GRID_DIR / "application_message_griddynamics.md"
    path.write_text(
        """# Grid Dynamics - Simulation Engineer (NVIDIA Omniverse, Python, Robotics)

Rola jest oznaczona jako Mid-Senior i wisi od trzech miesięcy przy bardzo małej liczbie
aplikacji, a jej lista wymagań jest odwrócona: narzędzia (Isaac Sim, Omniverse, Unity,
Unreal) są twarde, a domena (symulacje robotyczne, ROS, CAD) jest "nice to have".
Dlatego wiadomość jest zbudowana tak, żeby najpierw uderzyć w obowiązki - bo tam masz
realne pokrycie - a lukę narzędziową postawić samemu, zanim zrobi to rekruter.

**Nie pisz, że znasz Omniverse ani Isaac Sim.** Rozmowę techniczną prowadzą inżynierowie
robotyki i to jest jedyne pytanie, które na pewno padnie.

## Wersja pełna (EN) - formularz aplikacyjny, e-mail lub InMail

Hello,

I am applying for the Simulation Engineer position in your Robotics Lab in Krakow.

Your list of responsibilities describes what I do commercially. I currently work as a
Robotics Engineer at ASTOR, where I build digital twins of production lines and robot
simulations, program Kawasaki and Epson industrial robots, and design, build and
commission demonstration stations that show those robots in real applications. Before
that I spent a year and a half as an Application Engineer at AIAutomation building
digital twins of production workcells in Visual Components for automotive clients:
validating and tuning kinematics, reach, joint limits and motion constraints so the
simulated cell matched the real process; integrating customer CAD models from SolidWorks
and Inventor into the simulation environment and optimizing that geometry for simulation
performance; writing Python scripts to automate simulation logic; and documenting
simulation assumptions and workflows for engineers and stakeholders.

The part I would emphasise is that I am on both sides of the model. I build the digital
twin and I also physically build, program and commission the cell, so I routinely see
where a simulation stops matching the machine - which is exactly the "validate and tune
physical parameters, kinematics, and constraints" part of your posting.

I want to be direct about the gap, because it is the one in your job title: my simulation
work has been in Visual Components, not in Omniverse or Isaac Sim, and I have not used
Unity or Unreal professionally. What I bring instead is the part that takes longer to
learn than a tool - understanding how a mechanical system behaves, why a simulated
kinematic chain diverges from the real one, and how to make CAD geometry usable inside a
simulator. I am a Mechanical Engineering student at Cracow University of Technology, so
dynamic systems modelling, control and analytical mechanics are coursework rather than
something I picked up from documentation.

I am also closing that gap with something concrete rather than a course. I designed and
built a SCARA robotic arm from scratch - CAD, 3D printing, NEMA steppers and TMC/DRV
drivers, microcontroller electronics, and Python/C++ control code with forward and inverse
kinematics - and I am porting it into a USD-based simulator so I can run the same motion
sequence in simulation and on the physical arm and compare the results. Very few
candidates for simulation roles have both the model and the machine, and I would rather
show you that than claim tool experience I do not have.

I am based in Krakow, native Polish, English C1. I would be glad to walk you through the
SCARA project and the simulation work behind it.

Best regards,
Maciej Tkacz
maciek01110@gmail.com | +48 881 912 125

## Krótka notka na LinkedIn (EN, limit 300 znaków)

Hello, I'm applying for the Simulation Engineer role in your Krakow Robotics Lab. I build
digital twins of production lines and program Kawasaki/Epson robots at ASTOR; previously
physics-based robot simulation in Visual Components. Learning Isaac Sim via my own SCARA
arm. Maciej Tkacz

## Wersja pełna (PL)

Dzień dobry,

składam aplikację na stanowisko Simulation Engineer w Państwa Robotics Lab w Krakowie.

Lista obowiązków w ogłoszeniu opisuje to, co robię komercyjnie. Obecnie pracuję jako
Inżynier Robotyk w ASTOR, gdzie buduję cyfrowe bliźniaki linii produkcyjnych i symulacje
robotów, programuję roboty przemysłowe Kawasaki i Epson oraz projektuję, buduję
i uruchamiam stanowiska demonstracyjne pokazujące te roboty w realnych aplikacjach.
Wcześniej przez półtora roku jako Application Engineer w AIAutomation budowałem cyfrowe
bliźniaki gniazd produkcyjnych w Visual Components dla klientów Automotive: walidacja
i strojenie kinematyki, zasięgów, limitów przegubów i ograniczeń ruchu, tak aby symulowane
gniazdo odpowiadało rzeczywistemu procesowi; integracja modeli CAD klienta z SolidWorks
i Inventora do środowiska symulacyjnego oraz optymalizacja tej geometrii pod wydajność
symulacji; skrypty w Pythonie automatyzujące logikę symulacji; dokumentowanie założeń
i workflow symulacyjnego.

Rzecz, którą chciałbym podkreślić: jestem po obu stronach modelu. Buduję cyfrowego
bliźniaka i jednocześnie fizycznie buduję, programuję i uruchamiam stanowisko, więc na
bieżąco widzę, w którym miejscu symulacja przestaje zgadzać się z maszyną - a to dokładnie
punkt "validate and tune physical parameters, kinematics, and constraints" z ogłoszenia.

Chcę powiedzieć wprost o luce, bo jest nią tytuł stanowiska: pracowałem w Visual
Components, a nie w Omniverse czy Isaac Sim, i nie używałem zawodowo Unity ani Unreal.
To, co wnoszę, to część, której nauka trwa dłużej niż nauka narzędzia - rozumienie, jak
zachowuje się układ mechaniczny, dlaczego symulowany łańcuch kinematyczny rozjeżdża się
z rzeczywistym i jak przygotować geometrię CAD do użycia w symulatorze. Jestem studentem
Mechaniki i Budowy Maszyn na Politechnice Krakowskiej, więc modelowanie układów
dynamicznych, automatyka i mechanika analityczna to u mnie program studiów.

Tę lukę zamykam czymś konkretnym, a nie kursem. Od zera zaprojektowałem i zbudowałem
ramię robota SCARA - CAD, druk 3D, silniki NEMA i sterowniki TMC/DRV, elektronika
mikrokontrolerowa oraz kod sterujący w Pythonie/C++ z kinematyką prostą i odwrotną -
i przenoszę je do symulatora opartego na USD, żeby uruchomić tę samą sekwencję ruchu
w symulacji i na fizycznym ramieniu, a następnie porównać wyniki.

Mieszkam w Krakowie, polski ojczysty, angielski C1. Chętnie opowiem o projekcie SCARA
i o pracy symulacyjnej, która za nim stoi.

Pozdrawiam,
Maciej Tkacz
maciek01110@gmail.com | 881 912 125

## Zanim wyślesz - dwie rzeczy do sprawdzenia

1. **Zdania o migracji SCARA do USD/Isaac Sim.** W liście powyżej brzmią jak działanie
   w toku i są prawdziwe dopiero wtedy, gdy projekt ruszył. W samym CV domyślnie są
   sformułowane ostrożniej ("planowany kolejny krok"), bo CV czyta się dosłownie.
   Jeśli zaczniesz projekt, w `scripts/generate_softserve_cv.py` ustaw
   `ISAAC_PORT_STARTED = True` i wygeneruj pakiet ponownie - CV samo przejdzie na wersję
   "w nauce". Jeśli nie zaczniesz, usuń te zdania z listu.
2. **Czy w AIAutomation robiłeś analizy czasu cyklu i weryfikację zasięgów robota jako
   osobne zadanie?** Jeśli tak, to materiał na mocny dodatkowy punkt - pytałem o to
   wcześniej i nie mam odpowiedzi, dlatego tego nie dopisuję.
""",
        encoding="utf-8",
    )
    return path


def write_grid_readme() -> Path:
    path = GRID_DIR / "README.md"
    path.write_text(
        """# CV pod Grid Dynamics - Simulation Engineer (NVIDIA Omniverse, Python, Robotics)

Osobny wariant CV pod tę ofertę. Różni się od pozostałych pakietów nie kosmetycznie, tylko
kolejnością i słownictwem: całość jest przepisana pod obowiązki z ogłoszenia, bo tam masz
realne pokrycie, a nie pod tytuł stanowiska, w którym masz lukę.

## Pliki

| Plik | Kiedy używać |
|---|---|
| `Maciej_Tkacz_CV_GridDynamics_EN_ATS.pdf` | domyślny wybór - formularz aplikacyjny, ATS |
| `Maciej_Tkacz_CV_GridDynamics_EN_Visual.pdf` | wysyłka bezpośrednio do człowieka |
| `Maciej_Tkacz_CV_GridDynamics_PL_*` | gdyby rekrutacja szła po polsku (Robotics Lab jest w Krakowie) |
| `application_message_griddynamics.md` | list aplikacyjny EN/PL + krótka notka na LinkedIn |

Wersje `.docx` są obok, jeśli chcesz coś dopisać ręcznie.

## Co zostało zmienione względem CV uniwersalnego

1. **Tytuł: Simulation Engineer.** Słowo "junior" nie pada nigdzie - oferta jest oznaczona
   jako Mid-Senior i nie ma sensu podpowiadać rekruterowi odrzucenia.
2. **Python na pierwszym miejscu w umiejętnościach**, bo jest pierwszym wymaganiem oferty.
   Opisany jako "Python for simulation", nie jako ogólne programowanie.
3. **Nowa kategoria "Physics-based simulation of mechanical systems"** - dokładnie pierwszy
   punkt ich obowiązków ("validate and tune physical parameters, kinematics, and
   constraints"). Podpięte pod nią przedmioty ze studiów: modelowanie układów dynamicznych,
   automatyka, mechanika analityczna.
4. **Osobna kategoria "CAD models inside simulation environments"** - u nich to samodzielny
   punkt obowiązków, a u Ciebie była to codzienność w AIAutomation.
5. **Doświadczenie przepisane ich językiem.** Te same fakty, inne nagłówki: walidacja
   i strojenie kinematyki, zasięgów i ograniczeń; integracja modeli CAD do symulacji;
   skrypty Python automatyzujące logikę symulacji; dokumentowanie założeń i workflow.
6. **Obecna praca w ASTOR ustawiona jako argument sim-to-real.** Budujesz cyfrowego
   bliźniaka i jednocześnie fizycznie stawiasz i uruchamiasz stanowisko - to rzadkie
   połączenie i w tej ofercie jest to Twój najmocniejszy pojedynczy argument.
7. **Projekt SCARA przestawiony z "budowy robota" na "prototyp fizyczny + model
   kinematyczny"**, z naciskiem na parametry fizyczne: geometria członów, przełożenia,
   limity przegubów, momenty.
8. **Git i dokumentacja workflow** dodane jawnie, bo oferta wymienia wersjonowanie assetów
   i dokumentowanie logiki symulacji.

## Czego celowo NIE ma w tym CV

Nie ma Omniverse, Isaac Sim, Unity ani Unreal jako umiejętności. Jest tylko jasno
oznaczona pozycja opisująca, że to kolejny krok w nauce.

To nie jest ostrożność na wszelki wypadek. To jedyne twarde wymaganie tej oferty i jest
w tytule stanowiska, więc pytanie o nie padnie w pierwszych minutach rozmowy technicznej
z inżynierami z Robotics Lab. Wpisanie tego do CV zamienia aplikację, w której masz
przewagę domenową i uczciwą lukę, w aplikację, która wypada z gry na jednym pytaniu -
i zamyka firmę na przyszłość, bo Grid Dynamics ma w Krakowie więcej ról.

Prawdziwe wzmocnienie tej aplikacji nie jest w CV, tylko w projekcie: import SCARA do
Isaac Sim przez USD, przeguby i limity, skrypt w Pythonie z tą samą kinematyką co na
fizycznym robocie, jedno porównanie sim-to-real i repozytorium na GitHubie. Wtedy
"kolejny krok" w CV staje się linkiem do działającego rezultatu. Zakres jest opisany
w `artifacts/job-search/README.md`, sekcja "Projekt, który decyduje".

Gdy projekt ruszy, ustaw `ISAAC_PORT_STARTED = True` w `scripts/generate_softserve_cv.py`
i wygeneruj pakiet ponownie - sformułowania w CV zmienią się z "planowany krok" na "w nauce".

## Gdzie aplikować

- justjoin.it: https://justjoin.it/job-offer/grid-dynamics-poland-simulation-engineer-nvidia-omniverse-python-robotics--krakow-ai
- LinkedIn: https://www.linkedin.com/jobs/view/4418163132/
- Wariant Dresden / Central Europe Remote: https://www.griddynamics.com/careers/discover-openings

Warto złożyć aplikację również na wariant zdalny/Dresden - to ta sama rola, inny rynek
kandydatów.
""",
        encoding="utf-8",
    )
    return path


def write_universal_outreach_message() -> Path:
    path = UNIVERSAL_DIR / "outreach_message.md"
    path.write_text(
        """# Wiadomość otwierająca do rekrutera - wersja uniwersalna

Do wysyłki, gdy nie odpowiadasz na konkretne ogłoszenie, tylko pytasz o wakaty: InMail na
LinkedIn, mail na adres rekrutacyjny firmy, kontakt na targach. Załącz
`Maciej_Tkacz_CV_EN_ATS.pdf` albo wersję PL, zależnie od języka rozmowy.

Podmień tylko nazwę firmy i jedno zdanie o tym, dlaczego akurat ona - reszta jest gotowa.

## E-mail / InMail (EN)

Subject: Robotics engineer (Kawasaki/Epson, simulation) - open to opportunities

Hello,

I am reaching out to ask whether you currently have openings for a robotics or simulation
engineer at [FIRMA].

I work as a Robotics Engineer at ASTOR, where I program Kawasaki and Epson industrial
robots, build digital twins of production lines and robot simulations, and design and
build demonstration stations that present those robots in different applications - so I
cover the path from a simulated cell to a physically built and commissioned one. Before
that I was an Application Engineer at AIAutomation, creating robotics simulations and
digital twins of production workcells in Visual Components for automotive clients,
including Python scripts for process optimization.

My background is unusual in that the mechanical and the software side come from the same
place: I am a Mechanical Engineering student at Cracow University of Technology and a
certified Software Technician. Outside work I designed and built a SCARA robotic arm
end-to-end - CAD, 3D printing, NEMA steppers and TMC/DRV drivers, microcontroller
electronics, and Python/C++ control software with forward and inverse kinematics.

I am based in Krakow and available full-time, as I can arrange my study schedule around
work. Polish is my native language and my English is C1, and I am open to travel and to
relocation within the EU.

I am attaching my CV. If there is anything open now or coming up, I would be glad to talk.

Best regards,
Maciej Tkacz
maciek01110@gmail.com | +48 881 912 125

## Krótka notka do zaproszenia na LinkedIn (EN, limit 300 znaków)

Hello, I'm a robotics engineer at ASTOR - Kawasaki/Epson programming, digital twins of
production lines and building robot demo stations. Previously robot simulation in Visual
Components for automotive. I'd like to connect and ask about openings at [FIRMA]. Maciej Tkacz

## E-mail / InMail (PL)

Temat: Inżynier robotyk (Kawasaki/Epson, symulacje) - pytanie o możliwości współpracy

Dzień dobry,

piszę z pytaniem, czy w [FIRMA] są obecnie otwarte rekrutacje na stanowiska związane
z robotyką lub symulacjami.

Pracuję jako Inżynier Robotyk w ASTOR, gdzie programuję roboty przemysłowe Kawasaki
i Epson, buduję cyfrowe bliźniaki linii produkcyjnych i symulacje robotów oraz projektuję
i buduję stanowiska demonstracyjne prezentujące te roboty w różnych aplikacjach - czyli
przechodzę całą drogę od stanowiska w symulacji do fizycznie zbudowanego i uruchomionego.
Wcześniej jako Application Engineer w AIAutomation tworzyłem symulacje robotyczne
i cyfrowe bliźniaki gniazd produkcyjnych w Visual Components dla klientów Automotive,
w tym skrypty w Pythonie do optymalizacji procesów.

Moje przygotowanie jest o tyle nietypowe, że strona mechaniczna i programistyczna
pochodzą z tego samego miejsca: jestem studentem Mechaniki i Budowy Maszyn na Politechnice
Krakowskiej i Technikiem Programistą. Poza pracą zaprojektowałem i zbudowałem od zera
ramię robota SCARA - CAD, druk 3D, silniki krokowe NEMA i sterowniki TMC/DRV, elektronika
mikrokontrolerowa oraz kod sterujący w Pythonie/C++ z kinematyką prostą i odwrotną.

Mieszkam w Krakowie i jestem dostępny w pełnym wymiarze, bo mam możliwość dostosowania
toku studiów do pracy. Angielski C1, jestem otwarty na wyjazdy i na relokację w UE.

Załączam CV. Jeśli jest coś otwartego teraz lub planowanego, chętnie porozmawiam.

Pozdrawiam,
Maciej Tkacz
maciek01110@gmail.com | 881 912 125
""",
        encoding="utf-8",
    )
    return path


def write_universal_readme() -> Path:
    path = UNIVERSAL_DIR / "README.md"
    path.write_text(
        """# CV uniwersalne - Maciej Tkacz

Wersja bazowa, nieprzypisana do żadnej konkretnej oferty. Używaj jej wszędzie tam, gdzie
nie ma sensu robić osobnego wariantu: szybka aplikacja, wiadomość do rekrutera, portale
pracy, targi, prośba znajomego o CV.

## Które pliki wysyłać

| Plik | Kiedy |
|---|---|
| `Maciej_Tkacz_CV_EN_ATS.pdf` | domyślny wybór: formularze aplikacyjne, systemy ATS, firmy międzynarodowe |
| `Maciej_Tkacz_CV_EN_Visual.pdf` | wysyłka bezpośrednio do człowieka (rekruter, hiring manager) |
| `Maciej_Tkacz_CV_PL_ATS.pdf` | polskie oferty, pracuj.pl, rekrutacje prowadzone po polsku |
| `Maciej_Tkacz_CV_PL_Visual.pdf` | polska rekrutacja, kontakt bezpośredni |

Wersje `.docx` leżą obok - użyj ich, jeśli chcesz coś dopisać ręcznie.

Jeśli nie wiesz, którą wybrać: **`Maciej_Tkacz_CV_EN_ATS.pdf`**. Wersja ATS jest prosta
jednokolumnowa i nigdy nie rozsypie się w parserze, a wersja Visual ma dwie kolumny i lepiej
wygląda, gdy czyta ją człowiek.

## Co nowego w tej wersji

Dodane obecne stanowisko: **Inżynier Robotyk, ASTOR, Kraków, od 07.2026** - programowanie
robotów Kawasaki i Epson, cyfrowe bliźniaki linii produkcyjnych i symulacje robotów oraz
projektowanie i budowa stanowisk demonstracyjnych prezentujących roboty w różnych
aplikacjach. To stanowisko trafiło też do wszystkich wcześniejszych wariantów CV
(SoftServe, Red Sky, Inbolt), bo zmienia się fakt, a nie dopasowanie do oferty.

Kolejność umiejętności w tej wersji jest inna niż w wariantach pod konkretne oferty:
na pierwszym miejscu jest programowanie robotów przemysłowych, na drugim symulacje i
cyfrowe bliźniaki. To dwie rzeczy, za które rynek płaci najwięcej w Twoim profilu i które
teraz robisz jednocześnie.

## Dwie rzeczy do sprawdzenia przed wysłaniem

1. **Nazwa stanowiska w ASTOR.** Wpisałem "Inżynier Robotyk" / "Robotics Engineer", bo nie
   znam Twojego tytułu z umowy. Jeśli w dokumentach masz inaczej (np. "Inżynier Aplikacyjny",
   "Specjalista ds. robotyki"), popraw to w pliku `.docx` albo napisz, a wygeneruję ponownie.
2. **Czy AIAutomation faktycznie skończyło się w 05.2026?** W CV jest przerwa czerwiec 2026,
   a ASTOR zaczyna się w lipcu. Jeden miesiąc nikogo nie zdziwi, ale jeśli daty są inne, daj znać.

## Jak z tego robić wersje pod oferty

Nie nadpisuj tego pliku pod konkretną ofertę - lepiej zrobić osobny wariant, tak jak
w katalogach `softserve-cv`, `redsky-cv` i `inbolt-cv`. Wszystko generuje jeden skrypt:
`scripts/generate_softserve_cv.py`. Nowy wariant to kopia CV bazowego z podmienionym
profilem, listą umiejętności i słowami kluczowymi.
""",
        encoding="utf-8",
    )
    return path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REDSKY_DIR.mkdir(parents=True, exist_ok=True)
    INBOLT_DIR.mkdir(parents=True, exist_ok=True)
    UNIVERSAL_DIR.mkdir(parents=True, exist_ok=True)
    GRID_DIR.mkdir(parents=True, exist_ok=True)
    created = []
    for cv in (
        CV_UNIVERSAL_EN,
        CV_UNIVERSAL_PL,
        CV_EN,
        CV_PL,
        CV_REDSKY_EN,
        CV_REDSKY_PL,
        CV_INBOLT_EN,
        CV_INBOLT_PL,
        CV_GRID_EN,
        CV_GRID_PL,
    ):
        created.append(build_ats_docx(cv))
        created.append(build_visual_docx(cv))
        created.append(build_ats_pdf(cv))
        created.append(build_visual_pdf(cv))
    created.append(write_recruiter_messages())
    created.append(write_redsky_linkedin_message())
    created.append(write_inbolt_linkedin_message())
    created.append(write_universal_outreach_message())
    created.append(write_universal_readme())
    created.append(write_grid_application_message())
    created.append(write_grid_readme())
    for path in created:
        print(path.relative_to(OUT_DIR.parents[1]))


if __name__ == "__main__":
    main()
