# Grid Dynamics Robotics Lab - aplikacja

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
> For client projects I use that same order on purpose: the trial runs in simulation first,
> then I build a quick station around the real robot in the configuration we are considering
> and repeat it, and the deliverable is a report with the measurements and the procedure.
> On the control side of those cells I program Astraada PLCs in CODESYS, the HMI screens,
> and Ethernet/IP and PROFINET.
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
