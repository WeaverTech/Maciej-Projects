# Jak zbudować second brain

Przewodnik + gotowy szkielet do skopiowania. Stan: 05.10.2026.

Second brain to zewnętrzna pamięć robocza: jedno miejsce, w którym lądują notatki,
wnioski z pracy, fragmenty kodu, decyzje i materiały do nauki - zorganizowane tak,
żebyś **znalazł je wtedy, gdy są potrzebne**, a nie wtedy, gdy przypadkiem na nie trafisz.

---

## Krótka odpowiedź

Pięć kroków, w tej kolejności. Reszta dokumentu to rozwinięcie.

1. **Wybierz jedno narzędzie i przestań je wybierać.** Rekomendacja dla Ciebie: Obsidian
   (pliki `.md` na dysku) + repozytorium git. Powód niżej.
2. **Zrób jedną skrzynkę wejściową.** Wszystko, co łapiesz, ląduje w jednym miejscu bez
   zastanawiania się nad kategorią. Sortujesz później, nie w trakcie.
3. **Podziel resztę według tego, do czego Ci to służy, a nie czym jest tematycznie:**
   projekty / obszary / zasoby / archiwum (PARA).
4. **Raz w tygodniu opróżnij skrzynkę** (20-30 minut). To jedyny rytuał, bez którego
   system umiera.
5. **Wymuszaj wyjście.** Notatka, z której nigdy nic nie powstaje, jest kosztem. Co
   miesiąc zamień coś z notatek w konkret: README projektu, wpis na LinkedIn, punkt w CV,
   gotową odpowiedź na rozmowę rekrutacyjną.

Najczęstszy błąd: ludzie spędzają tydzień na budowaniu systemu i zero minut na używaniu go.
Szkielet w katalogu `vault/` istnieje właśnie po to, żebyś ten tydzień pominął.

---

## Czym to nie jest

- **To nie jest archiwum wszystkiego.** Jeśli coś znajdziesz w 30 sekund w Google albo
  w dokumentacji, nie zapisujesz tego. Zapisujesz to, co było trudne do znalezienia,
  albo to, co **Ty** z tego wywnioskowałeś.
- **To nie jest system do nauki zamiast nauki.** Notatka z kursu ROS 2 nie zastąpi
  uruchomienia node'a.
- **To nie jest hobby.** Jeśli po miesiącu spędzasz więcej czasu na porządkowaniu niż
  na pisaniu, system jest za skomplikowany - usuń połowę.

---

## Krok 1: narzędzie

| Narzędzie | Za | Przeciw |
|---|---|---|
| **Obsidian** | zwykłe pliki `.md` na dysku, działa offline, linkowanie i graf, darmowy do użytku prywatnego, wersjonowanie przez git | synchronizacja na telefon wymaga konfiguracji (Obsidian Sync płatny albo git/chmura) |
| Logseq | świetny do codziennego dziennika i outline'owania | słabszy do długich dokumentów, wolniejszy rozwój |
| Notion | bazy danych, tabele, udostępnianie, dobre na telefonie | treść zamknięta w chmurze, wolny przy dużej ilości danych, eksport jest brzydki |
| Zwykłe pliki + edytor + git | zero zależności, pełna kontrola | brak backlinków i wyszukiwania pełnotekstowego "od ręki" |

**Dla Ciebie: Obsidian.** Trzy powody, które wynikają z tego, jak już pracujesz:
pliki markdown trzymasz w repo (`artifacts/` to w praktyce zalążek second braina),
masz git w palcach, a notatki techniczne (kod, parametry, zrzuty z symulacji) żyją
lepiej w plikach niż w bazie w chmurze.

Synchronizacja: desktop + git (wtyczka Obsidian Git robi auto-commit co X minut).
Na telefonie wystarczy na start sam capture - może to być nawet domyślna aplikacja
notatek, z której raz dziennie przeklejasz do skrzynki.

**Nie migruj narzędzi przez pierwsze pół roku.** Migracja to najprzyjemniejsza forma
prokrastynacji w tym temacie.

---

## Krok 2: struktura (PARA)

Folder opisuje **zastosowanie**, nie temat. Temat ogarniają linki i wyszukiwarka.

| Folder | Co tam trafia | Kryterium |
|---|---|---|
| `00-skrzynka` | wszystko świeże, nieposortowane | domyślne miejsce zapisu |
| `10-projekty` | rzeczy z terminem i zdefiniowanym końcem | "da się to zamknąć?" |
| `20-obszary` | zobowiązania bez końca: praca, studia, zdrowie, finanse | "muszę to utrzymywać w dobrym stanie" |
| `30-zasoby` | materiały referencyjne i notatki ze źródeł | "może się kiedyś przydać" |
| `40-archiwum` | zamknięte projekty i nieaktualne obszary | "skończone albo porzucone" |
| `50-notatki` | notatki trwałe - Twoje własne wnioski | "to jest moja myśl, nie cudza" |
| `90-szablony` | szablony notatek | - |

Dlaczego nie foldery tematyczne (`robotyka/`, `python/`, `studia/`): po pół roku każda
notatka pasuje do trzech folderów naraz i zaczynasz podejmować decyzję przy każdym zapisie.
PARA ma jedno pytanie - "czy pracuję nad tym teraz?" - i dlatego nie blokuje.

Twoje projekty i obszary na dziś wyglądają mniej więcej tak:

- **Projekty:** SCARA w Isaac Sim, aplikacje o pracę (Inbolt / SoftServe / Grid Dynamics),
  praca inżynierska, konkretne stanowisko demo w ASTOR.
- **Obszary:** ASTOR (bieżąca robota), studia na PK, nauka ROS 2, finanse, kondycja.
- **Zasoby:** notatki z dokumentacji Kawasaki/Epson, Visual Components, USD/Isaac Sim,
  linki i artykuły.

---

## Krok 3: przepływ

Cztery etapy. Każda notatka przechodzi je w tej kolejności, choć większość zatrzymuje
się na drugim - i to jest w porządku.

**1. Łapanie (capture) - sekundy.**
Jedno miejsce, zero kategoryzowania. Zasada filtra: zapisuję, jeśli to **zaskakujące,
użyteczne w konkretnym projekcie, trudne do ponownego znalezienia albo osobiste**
(mój wniosek, moja liczba, mój błąd). Reszta leci.

Co u Ciebie warto łapać codziennie, a dziś prawdopodobnie ginie:
- co się zepsuło na stanowisku i **dlaczego** (to jest materiał na rozmowę techniczną),
- parametry, które trzeba było dobrać metodą prób (prądy silników, limity przegubów,
  tolerancje wydruku),
- różnice między symulacją a rzeczywistością - czyli dokładnie to, o co pyta Grid Dynamics,
- pytania, na które nie znałeś odpowiedzi.

**2. Porządkowanie (organize) - raz w tygodniu.**
Przenosisz ze skrzynki do PARA. Pytanie przy każdej notatce brzmi: "do którego mojego
projektu albo obszaru to się przyda?". Jeśli do żadnego - `30-zasoby` albo kosz.

**3. Destylacja (distill) - przy ponownym dotknięciu notatki.**
Za każdym razem, gdy wracasz do notatki, zostawiasz ją odrobinę bardziej gotową do użycia:
pogrubiasz najważniejsze zdanie, dopisujesz podsumowanie na górze, wycinasz zbędne.
Nie robisz tego od razu przy zapisie - to marnotrawstwo, bo do 80% notatek nigdy nie wrócisz.

**4. Wyjście (express) - cel całej zabawy.**
Notatki mają się zamieniać w artefakty. U Ciebie: README projektu SCARA, post na LinkedIn,
odpowiedź "opowiedz o swoim najważniejszym projekcie", punkt w CV, dokumentacja stanowiska
w ASTOR, rozdział pracy inżynierskiej.

---

## Krok 4: jak pisać notatki, żeby były używalne

- **Jedna notatka = jedna myśl.** Łatwiej ją potem wkleić w nowy kontekst.
- **Tytuł jako zdanie twierdzące.** Nie "Isaac Sim - import", tylko
  "Import CAD do Isaac Sim idzie przez USD i gubi układy współrzędnych przegubów".
  Po pół roku tytuł sam mówi, co w środku.
- **Własnymi słowami.** Skopiowany cytat to materiał, nie wiedza. Zostaw cytat w notatce
  źródłowej, a w notatce trwałej napisz, co z niego wynika.
- **Linkuj, nie taguj.** Link do konkretnej notatki niesie znaczenie; tag `#robotyka`
  po roku obejmie 400 notatek i przestanie cokolwiek znaczyć. Trzymaj maksymalnie
  kilkanaście tagów statusowych (`#do-przerobienia`, `#dowod-do-cv`).
- **Zawsze zapisz źródło i datę.** Bez tego notatka techniczna jest bezużyteczna, bo nie
  wiesz, której wersji oprogramowania dotyczy.
- **Notatki o kodzie trzymaj z działającym snippetem.** Trzy linijki, które faktycznie
  działały, są warte więcej niż akapit opisu.

---

## Krok 5: rytuały

| Kiedy | Ile | Co robisz |
|---|---|---|
| Codziennie, na koniec pracy | 5 min | dziennik: co zrobiłem, co się zacięło, czego nie wiem |
| Raz w tygodniu (np. niedziela) | 20-30 min | opróżnij skrzynkę, przejrzyj aktywne projekty, wybierz priorytety na tydzień |
| Raz w miesiącu | 45 min | zamknij skończone projekty do archiwum, wybierz jedną notatkę i zrób z niej artefakt |
| Raz na kwartał | 1 h | przegląd obszarów: czy to nadal moje cele, czy coś trzeba wyrzucić |

Jeśli masz wybrać tylko jeden - wybierz tygodniowy. Codzienny dziennik jest drugi
w kolejności i w Twoim przypadku najbardziej opłacalny, bo zamienia codzienną robotę
w ASTOR w materiał dowodowy.

---

## Dlaczego akurat Tobie to się opłaci

Z `artifacts/job-search/README.md` wynika jeden konkretny wniosek: masz doświadczenie,
ale brakuje Ci **dowodów** - GitHub pusty, projekt SCARA nigdzie nie opisany, sim-to-real
nieudokumentowane. To nie jest problem z pamięcią ani z umiejętnościami. To problem
z brakiem nawyku zapisywania tego, co i tak robisz.

Second brain rozwiązuje dokładnie to:

| Wejście (5 min dziennie) | Wyjście (po kwartale) |
|---|---|
| dziennik ze stanowisk w ASTOR | gotowe historie projektowe na rozmowę techniczną |
| notatki o rozbieżnościach symulacja/rzeczywistość | sekcja "co zwalidowałem" w README projektu SCARA |
| zapisane błędy i ich przyczyny | odpowiedzi na "opowiedz o trudnym problemie" |
| notatki z nauki ROS 2 / Isaac Sim | publiczne repo i post, który widzi rekruter |
| log aplikacji i rozmów | wiedza, co działa w rekrutacji, a co nie |

Zacznij od jednego projektu: **SCARA w Isaac Sim**. Masz go już jako notatkę przykładową
w `vault/10-projekty/scara-isaac-sim.md`.

---

## Pierwszy tydzień - plan

- **Dzień 1 (30 min).** Zainstaluj Obsidian, skopiuj `vault/` jako nowy vault, włącz
  wtyczki core: Daily notes, Templates (folder szablonów: `90-szablony`), Backlinks,
  Graph view. Zapisz pierwszą notatkę w skrzynce.
- **Dzień 2 (20 min).** Wypisz swoje projekty i obszary - po jednej notatce na każdy,
  z szablonu. Nie więcej niż 5 projektów naraz.
- **Dni 3-6 (5 min dziennie).** Tylko dziennik. Nic nie porządkuj.
- **Dzień 7 (30 min).** Pierwszy przegląd tygodniowy. Opróżnij skrzynkę do zera.
- **Koniec pierwszego miesiąca.** Wybierz jedną rzecz z notatek i zamień ją w artefakt
  publiczny. Jeśli nie umiesz - system zbiera złe rzeczy, popraw filtr łapania.

---

## Pułapki

1. **Kolekcjonowanie zamiast myślenia.** 300 zapisanych artykułów i zero własnych zdań
   to nie second brain, tylko zakładki.
2. **Rozbudowa systemu.** Każdy nowy status, tag i automatyzacja to koszt stały. Dodawaj
   dopiero wtedy, gdy brak czegoś realnie zaboli.
3. **Oglądanie materiałów o produktywności.** Jeden przewodnik (ten) w zupełności wystarczy.
4. **Perfekcyjne porządkowanie przy zapisie.** Zapis ma być tani. Porządek robi się zbiorczo.
5. **Dwa systemy naraz.** Jeśli zostawisz notatki jednocześnie w Notion, w telefonie
   i w zeszycie, nie ufasz żadnemu i przestajesz szukać.
6. **Brak przeglądu.** System bez przeglądu tygodniowego zamienia się w śmietnik w 3-4 tygodnie.

---

## Co jest w tym katalogu

```
second-brain/
├── README.md              <- ten przewodnik
├── nowa-notatka.sh        <- szybkie dorzucenie notatki do skrzynki z terminala
└── vault/                 <- gotowy szkielet do otwarcia w Obsidianie
    ├── 00-mapa.md         <- punkt wejścia, pierwsza notatka do otwarcia
    ├── 00-skrzynka/
    ├── 10-projekty/       <- + wypełniony przykład: SCARA w Isaac Sim
    ├── 20-obszary/
    ├── 30-zasoby/
    ├── 40-archiwum/
    ├── 50-notatki/        <- + wypełniony przykład notatki trwałej
    └── 90-szablony/       <- 5 szablonów: dziennik, projekt, obszar, źródło, notatka trwała
```

**Jak zacząć:** skopiuj katalog `vault/` tam, gdzie chcesz trzymać notatki (np.
`~/second-brain`), w Obsidianie wybierz "Open folder as vault" i wskaż tę kopię.
Przykładowe notatki nadpisz swoimi albo usuń - są po to, żeby pokazać konwencję.

Jeśli chcesz wersjonować notatki w gicie, zrób z tego **osobne repozytorium**,
nie podkatalog tego repo: notatki prywatne nie powinny trafić do publicznego profilu.

**Szybki zapis z terminala:**

```bash
./nowa-notatka.sh "limit prądu na osi 2 trzeba było zbić do 1.2 A, inaczej gubi kroki"
```

Skrypt tworzy plik z datą w `vault/00-skrzynka/` (albo w katalogu wskazanym zmienną
`SECOND_BRAIN_DIR`, jeśli przeniesiesz vault poza repo).
