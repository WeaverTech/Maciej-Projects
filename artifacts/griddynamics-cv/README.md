# CV pod Grid Dynamics - Simulation Engineer (NVIDIA Omniverse, Python, Robotics)

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
