# Grid Dynamics - Simulation Engineer (NVIDIA Omniverse, Python, Robotics)

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
