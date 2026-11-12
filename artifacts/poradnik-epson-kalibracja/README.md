# Poradnik: kalibracja kamery w systemie wizyjnym EPSON (Vision Guide 8.0 / RC+ 8)

Materiały przygotowawcze do artykułu na [Poradnik Automatyka ASTOR](https://www.astor.com.pl/poradnikautomatyka/),
pisanego w tym samym stylu co istniejące poradniki z kategorii „Automatyka w praktyce”.

| Plik | Zawartość |
|---|---|
| `poradnik.md` | **tekst artykułu** ułożony ze zrzutów, ze zdjęciami w kolejności kroków |
| `Poradnik_kalibracja_kamery_EPSON.docx` | ten sam tekst jako Word, ze zrzutami |
| `Poradnik_kalibracja_kamery_EPSON.pdf` | ten sam tekst jako PDF, ze zrzutami |
| `poradnik-wordpress.html` | ten sam tekst w blokach Gutenberga |
| `zrzuty/` | 19 kadrów nazwanych `01-`…`19-` w kolejności artykułu |
| `README.md` | analiza stylu wzorcowych artykułów i lista kontrolna |
| `szkic-poradnika.md` | wcześniejszy szkic, sprzed zrzutów |
| `szablon-wordpress.html` | puste bloki Gutenberga (wzorzec formatowania) |

---

## Artykuły wzorcowe

Przeanalizowane 09.11.2026 (treść pobrana przez WordPress REST API strony):

1. **[Symulacja systemu wizyjnego w środowisku EPSON RC+ 8](https://www.astor.com.pl/poradnikautomatyka/symulacja-systemu-wizyjnego-w-srodowisku-epson-rc-8/)**
   (Franciszek Rześny, 29.07.2025, ok. 2900 słów, ~40 grafik, 3 bloki kodu).
   **Główny wzorzec** - ten sam produkt (Vision Guide w RC+ 8), ma już krótką sekcję „Kalibracja”
   (Fixed looking downward, 9 punktów, Teach points → Calibrate). Nasz poradnik jest jej naturalnym
   rozwinięciem, więc warto do niego linkować we wstępie i nie powtarzać tworzenia projektu/kamery.
2. [Roboty przemysłowe EPSON. Podstawy RC+ Express: symulacja paletyzacji](https://www.astor.com.pl/poradnikautomatyka/roboty-przemyslowe-epson-podstawy-rc-express-symulacja-paletyzacji/)
   (Konrad Kamiński, 01.08.2025, ok. 2500 słów) - ten sam układ, bardzo gęsto przeplatany zrzutami.
3. [Konfiguracja zewnętrznego sygnału E-STOP w module CoreCubic-S robotów Kawasaki Robotics](https://www.astor.com.pl/poradnikautomatyka/konfiguracja-zewnetrznego-sygnalu-e-stop-w-module-corecubic-s-robotow-kawasaki-robotics/)
   (Kinga Dąbrowska, 16.10.2026, ok. 870 słów) - nowszy, krótszy, bardziej „instrukcyjny” wariant.

## Styl - co jest stałe we wszystkich poradnikach

### Struktura

1. **Ramka „Z tego artykułu dowiesz się:”** na samej górze - 3 punkty, każdy zaczyna się małą literą
   od „jak …”, zakończone przecinkiem, ostatni kropką. To samo zdanie trafia do zajawki (excerpt).
2. **Akapit wstępu** (2-5 zdań): co zrobimy, po co, co czytelnik będzie umiał na końcu.
3. Opcjonalna sekcja **„Po co …?”** - krótkie tło praktyczne (zastosowania, przykład z produkcji).
4. **„Potrzebne urządzenia i oprogramowanie”** - lista sprzętu/softu, link do pobrania RC+ ze strony ASTOR,
   odesłanie do dokumentacji producenta (np. *Vision Guide 8.0 Software*, *Vision Guide 8.0 Hardware & Setup*),
   wersja oprogramowania użyta w artykule.
5. **Sekcje krok po kroku** - nagłówki tylko `h2`, krótkie i rzeczownikowe
   („Dodawanie kamery”, „Kalibracja i sekwencje”, „Pierwszy program”, „Pick and Place”).
6. **Program w SPEL+** - najpierw zrzut z edytora, potem ten sam kod w bloku `code`, potem
   omówienie linijka po linijce w kilku akapitach.
7. **Weryfikacja / efekt końcowy** - wynik w oknie Run, film z realizacji albo „Po restarcie należy sprawdzić…”.
   Brak osobnej sekcji „Podsumowanie”.
8. **Ramka autora** (blok media-text, szare tło): zdjęcie, „Autor artykułu:”, imię i nazwisko w `h2`,
   stanowisko (np. „Inżynier Robotyk ASTOR”), opcjonalnie uczelnia/kierunek.

### Język i ton

- Forma **1. os. l. mnogiej**, tryb instruktażowy: „wybieramy”, „klikamy”, „przechodzimy do”, „nadajemy nazwę”.
  Zamiennie bezosobowo: „należy”, „można”, „warto”. Okazjonalnie 1. os. l. poj. autora („na początek polecam…”,
  „w moim przypadku zaokrągliłem…”) i zwrot do czytelnika na „ty” („Wcześniej utworzyłeś…”).
- Każdy krok = 1-3 zdania + zrzut ekranu. Tekst opisuje *co kliknąć* i *co się wtedy stanie*
  („Ukaże nam się wtedy komunikat…”, „Zielony kolor oblamówki wskazuje, że…”).
- Wtrącenia praktyczne i ostrzeżenia w treści akapitu, bez ramek typu „Uwaga”:
  „Istotnym zagadnieniem, na które należy zwrócić uwagę, jest…”, „Warto tu zauważyć, że…”,
  „Należy pamiętać, że…”, „Nie jest to jednak koniec.”
- Nazwy z interfejsu (angielskie, jak w programie) **pogrubione**: **Teach**, **Calibrate**, **NumberToFind**.
  Ścieżki menu pogrubione ze strzałką: **Setup -> System Configuration -> Vision -> Cameras**
  (nowszy artykuł używa `→`; wybrać jedną konwencję i trzymać się jej).
- Pierwsze użycie angielskiego terminu z polskim objaśnieniem w nawiasie: **Fixed** (nieruchoma), **Mobile** (ruchoma).
- Listy wypunktowane małą literą, elementy zakończone przecinkiem, ostatni kropką.
- Ikony z paska narzędzi wstawiane jako mała grafika w środku zdania: „…wciskając przycisk: [ikona] w górnej części ekranu.”

### Grafika i formatowanie (WordPress/Gutenberg)

- Zrzuty wyśrodkowane (`aligncenter size-full`), bez podpisów i bez numeracji „Rys. X”, pusty `alt`.
- Między akapitem a obrazem odstęp `spacer` 30 px, między dwoma obrazami lub przed nowym `h2` - 50 px,
  przed ramką autora - 60 px.
- Pliki obrazów nazwane sekwencyjnie (`image01.png`, `image02.png`, …), PNG, szerokość zwykle 600-1750 px.
  Zrzuty całego okna RC+ dla kontekstu, przycięte fragmenty dla parametrów (np. 400×300 px z jedną właściwością).
- Kod w bloku `wp-block-code` z tabulatorami, bez kolorowania składni. Uwaga: we wzorcu w kodzie trafiły się
  „drukarskie” cudzysłowy (`“Found “`) - u nas pilnować prostych `"`, żeby kod dało się skopiować.
- Film MP4 z realizacji (opcjonalnie) jako `wp-block-video` na końcu.

### Objętość

Artykuły Epson: ~2500-2900 słów i 30-40 grafik. Wariant krótki (Kawasaki E-STOP): ~900 słów, kilka grafik.
Kalibracja kamery mieści się w wariancie długim, jeśli opiszemy kilka typów montażu, albo średnim
(~1500-2000 słów), jeśli skupimy się na jednym typie + weryfikacji programem.

## Lista kontrolna przed wysłaniem

- [ ] Ramka „Z tego artykułu dowiesz się:” - 3 punkty „jak …”, spójne z zajawką.
- [ ] Wersje: RC+ (np. 8.0.x), Vision Guide 8.0, kontroler, model robota, kamera.
- [ ] Link do pobrania RC+ ze strony ASTOR i do artykułu o symulacji systemu wizyjnego.
- [ ] Każdy krok ma zrzut ekranu; ścieżki menu i nazwy przycisków pogrubione.
- [ ] Kod SPEL+ jako zrzut + blok kodu + omówienie; proste cudzysłowy; kod przetestowany na kontrolerze.
- [ ] Wyniki kalibracji pokazane na zrzucie i zinterpretowane (błąd średni/maksymalny, mm/piksel).
- [ ] Weryfikacja: robot dojeżdża do wykrytego obiektu (zrzut/film).
- [ ] Ramka autora: zdjęcie, imię i nazwisko, stanowisko.

## Do ustalenia przed pisaniem

1. **Sprzęt czy symulacja?** Wzorcowy artykuł robi kalibrację w symulatorze. Poradnik o samej kalibracji
   zyska najwięcej na prawdziwym stanowisku (rzeczywiste błędy, oświetlenie, ostrość, płytka kalibracyjna).
2. **Typ montażu kamery:** Fixed Downward (najprostszy, kontynuacja wzorca), Mobile (kamera na ramieniu, J2/J4/J6),
   Fixed Upward (kamera patrząca w górę, korekta chwytu). Propozycja: główny przykład na jednym typie,
   pozostałe krótko opisane w jednej sekcji.
3. **Konfiguracja:** model robota (SCARA / 6-osiowy), kontroler (RC700-A / RC800), sterownik wizyjny
   (CV2 / PV1 / kamera GigE na PC), obiektyw.
4. **Wzorzec kalibracyjny:** płytka z 9 znacznikami (np. wydruk z dokumentacji Vision Guide) czy pojedynczy detal.
5. **Program demonstracyjny:** sam odczyt `RobotXYU` + `Go` nad obiekt (krótko) czy pełne pick and place.
6. **Nazwy i wartości z interfejsu** oznaczone w szkicu jako `[SPRAWDZIĆ]` - potwierdzić na RC+ 8, na którym
   robimy zrzuty (nazwy właściwości mogą się różnić między wersjami).
