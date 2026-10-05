# Data Pal - AI Engineer (LLM automation, agentic coding)

Oferta: part-time 20-60 h/mies., zdalnie, B2B 30-45 EUR/h lub UoD 130-190 PLN/h.
Start: październik/listopad 2026. Aplikacje do 20.10.2026, decyzje do 27.10.2026.
Formularz: https://forms.cloud.microsoft/e/125ZD94qup | recruitment@data-pal.eu

**Stan na dziś (5.10): 89 aplikantów po dwóch dniach.** To nie jest oferta, którą składa się 19.10.

---

## 1. Co ta oferta naprawdę sprawdza

Trzy zdania z ogłoszenia definiują całą rekrutację:

1. *"We will ask for a link to something you built: a repository, a demo, or a short write-up of
   what it does and why. **That matters more to us than a CV.**"*
2. *"On that call we will ask for **15 minutes of live work with your own agent, on your own setup**.
   We want to see how you work, not to test you on a whiteboard."*
3. *"Not 'I use ChatGPT'. We mean building: agents, API integrations, automations that actually
   **run in production**."*

Z tego wynika coś nieoczywistego: **repozytorium musi być dowodem w dwóch sprawach jednocześnie**
- że umiesz dowieźć automatyzację end to end, i że umiesz pracować z agentem. Drugie jest
sprawdzane na żywo, więc projekt musi być na tyle mały, żebyś się w nim swobodnie poruszał
i mógł go rozszerzyć przy nich w 15 minut.

Ich stack: Claude Code, Azure OpenAI, Microsoft 365, Python, Alteryx.
Ich zadania: wewnętrzne narzędzia LLM, integracje przez API, **agenci pracujący na dokumentach
i na skrzynce mailowej**, dema i PoC pod rozmowy sprzedażowe.

---

## 2. Rekomendacja: jeden projekt

**Agent do obsługi zapytań ofertowych dla integratora automatyki: skrzynka -> dane
strukturalne -> dopasowanie sprzętu z cytowaniem -> szkic odpowiedzi.**

Nazwa robocza: `rfq-triage-agent`.

Przepływ:

```
e-mail z zapytaniem (treść + załączniki PDF/DOCX/XLSX)
        |
        v
  parsowanie załączników -> tekst z metadanymi (plik, strona)
        |
        v
  ekstrakcja do JSON Schema przez LLM  (udźwig, zasięg, liczba osi, branża,
        |                               środowisko, ilość, termin, budżet)
        v
  walidacja + kontrola ugruntowania (każda liczba musi istnieć w źródle)
        |
        v
  RAG po karcie katalogowej robotów -> 2-3 kandydujące modele + cytaty (plik, strona)
        |
        v
  szkic odpowiedzi do klienta + tabela porównawcza + lista brakujących informacji
        |
        v
  zapis: JSON + tabela CSV/Parquet  |  szkic w Outlooku (nie wysyłka)
        |
        v
  raport z evalu: trafność per pole, koszt per dokument, czas, taksonomia błędów
```

Dlaczego dokładnie to:

- **Trafia w dwa z pięciu ich punktów wprost**: "agents that work on documents and on the
  mailbox" oraz "build demos and proofs of concept for sales conversations". To narzędzie *jest*
  demem sprzedażowym.
- **Jest to ich własny biznes w miniaturze.** Data Pal to konsultingowa firma od danych
  i automatyzacji. Każdy ich klient ma skrzynkę pełną półstrukturalnych dokumentów, z których
  ktoś ręcznie przepisuje dane do systemu. To jest ten problem.
- **Microsoft Graph zamiast własnego IMAP-a.** Ich stack to Microsoft 365, więc "agent na
  skrzynce" znaczy Graph API. Większość z 89 kandydatów ominie Graph, bo OAuth i uprawnienia są
  nudne. Zrobienie tego to natychmiastowa wiarygodność.
- **Masz domenę, której nikt inny w tej stawce nie ma.** Karty katalogowe Kawasaki, Epsona czy
  ABB są publicznie dostępne, a Ty jesteś jedyną osobą w tej rekrutacji, która potrafi na żywo
  ocenić, czy agent dobrał robota sensownie. Na rozmowie mówisz o swoim projekcie jak inżynier,
  nie jak ktoś, kto przeszedł tutorial.
- **Jest weryfikowalny.** Ekstrakcja ma prawdę obiektywną, więc da się zrobić zbiór testowy
  i policzyć trafność. To prowadzi prosto do punktu 7, czyli do Twojego faktycznego wyróżnika.
- **Brzmi jak coś, co zbudowałeś, bo było Ci potrzebne**, a nie pod rekrutację. To najlepszy
  rodzaj projektu portfolio.

Dane: zbuduj 25-30 syntetycznych zapytań w stylu tych, które realnie krążą w branży (różny
język, bałagan w treści, część informacji tylko w załączniku, część sprzeczna, część
brakująca). **Żadnych prawdziwych maili ani dokumentów klientów ASTOR-a** - to pierwszy
i najważniejszy warunek. Syntetyczne dane są tu zaletą, nie kompromisem, bo pozwalają
świadomie zaprojektować trudne przypadki.

### Wariant zapasowy, jeśli RFQ Cię nie przekonuje

**Inbox ops agent**: agent, który raz na godzinę przegląda skrzynkę, klasyfikuje wiadomości
według reguł zapisanych w pliku konfiguracyjnym, wyciąga zobowiązania i terminy, przygotowuje
szkice odpowiedzi na powtarzalne typy i buduje dzienne podsumowanie z listą rzeczy
wymagających decyzji człowieka. Słabszy domenowo niż wariant RFQ, ale ta sama mechanika
i ta sama wartość dla nich. Nie rób obu.

---

## 3. Zakres: co musi być, a co jest nadprogramowe

Masz piętnaście dni, pracę w ASTOR i studia. Zakres trzeba trzymać brutalnie.

**Rdzeń - bez tego nie wysyłaj:**

- wczytywanie z katalogu plików `.eml` z załącznikami (offline, powtarzalne, działa bez sieci)
- parsowanie PDF/DOCX/XLSX z zachowaniem numeru strony przy każdym fragmencie tekstu
- ekstrakcja do JSON Schema z walidacją przez Pydantic i ponowieniem przy złym kształcie
- kontrola ugruntowania: każda wartość liczbowa musi dać się znaleźć w tekście źródłowym
- RAG po 15-20 kartach katalogowych, z cytatem plik + strona przy każdej rekomendacji
- szkic odpowiedzi w Markdownie + tabela wyjściowa CSV/Parquet
- **eval: 25-30 przypadków, policzony raport, zapisany w repo**
- README, które zaczyna się od problemu, nie od instalacji
- `CLAUDE.md` / `AGENTS.md` w repo
- nagranie 90-120 sekund: wejście, przebieg, wyjście

**Nadprogramowe, w tej kolejności:**

1. prawdziwe połączenie z Microsoft Graph i tworzenie szkicu w Outlooku (duży sygnał, bo ich
   stack to M365)
2. progi pewności i eskalacja do człowieka, gdy model nie jest pewny
3. drobny interfejs: FastAPI albo Streamlit, do pokazania na żywo
4. ścieżka konfiguracyjna pod Azure OpenAI
5. notatka o styku z Alteryx (punkt 9)

Jeśli zabraknie czasu, **ciąć interfejs, nigdy eval**. Ładny UI mają wszyscy. Zmierzoną
jakość prawie nikt.

---

## 4. Struktura repo

Mała, czytelna, żeby dała się ogarnąć na żywo.

```
rfq-triage-agent/
  README.md                  # problem -> rozwiązanie -> wyniki -> jak odpalić
  CLAUDE.md                  # kontekst projektu dla agenta
  AGENTS.md                  # to samo dla Cursora/Codexa, jeśli trzymasz osobno
  .cursor/rules/             # reguły projektu
  pyproject.toml
  .env.example
  Makefile                   # make run / make eval / make test
  src/rfq/
    llm.py                   # jeden interfejs, wiele dostawców (Anthropic/OpenAI/Azure)
    ingest/
      mailbox.py             # Graph API
      local.py               # katalog .eml - tryb offline
      attachments.py         # PDF/DOCX/XLSX -> fragmenty z numerem strony
    extract/
      schema.py              # Pydantic: RfqRequirements
      extractor.py           # wywołanie LLM + ponowienie + walidacja
      grounding.py           # kontrola, czy liczby istnieją w źródle
    retrieve/
      index.py               # budowa indeksu po kartach katalogowych
      search.py              # wyszukiwanie + cytaty
    reply/
      drafter.py             # szkic odpowiedzi + tabela porównawcza
      graph_draft.py         # zapis szkicu do Outlooka
    observability/
      costs.py               # tokeny, koszt, czas per przebieg
  evals/
    cases/                   # 25-30 przypadków: wejście + oczekiwane wyjście
    run_eval.py
    REPORT.md                # wynik ostatniego przebiegu, zacommitowany
  tests/
  docs/
    decisions.md             # krótkie ADR-y: co wybrałeś i czego nie
    alteryx-handoff.md
```

Dwie rzeczy, które warto zauważyć w tej strukturze:

**`llm.py` jako cienka warstwa na dostawcę.** Nie będziesz mieć łatwego dostępu do Azure
OpenAI, a oni go używają. Rozwiązanie: jeden interfejs, implementacja na Anthropic lub OpenAI,
plus ścieżka konfiguracyjna pod Azure, i **jedno uczciwe zdanie w README**, że ścieżka Azure
jest napisana, ale nietestowana z braku subskrypcji. Abstrakcja na dostawcę to sama w sobie
decyzja w stylu konsultingowym - oni zmieniają klientom chmury.

**Tryb offline na katalogu `.eml`.** Dzięki niemu `make eval` działa u nich na komputerze bez
Twoich sekretów. To różnica między "zobaczcie screenshot" a "odpalcie sobie sami".

---

## 5. Schemat ekstrakcji i kontrola halucynacji

Schemat niech będzie wąski i typowany, z jawnym `null` i polem na pewność:

```python
class RfqRequirements(BaseModel):
    customer: str | None
    industry: Literal["automotive", "food", "pharma", "logistics", "other"] | None
    application: str | None           # paletyzacja, pick and place, spawanie...
    payload_kg: float | None
    reach_mm: float | None
    axes: int | None
    cycle_time_s: float | None
    environment: list[str] = []       # washdown, cleanroom, ATEX...
    quantity: int | None
    deadline: date | None
    budget_eur: float | None
    missing_fields: list[str] = []    # czego trzeba dopytać klienta
    evidence: dict[str, Evidence]     # pole -> plik, strona, cytowany fragment
```

Pole `evidence` jest tu najważniejsze i prowadzi do kontroli ugruntowania, która jest tania
w implementacji i bardzo mocna w demie:

> Dla każdego pola liczbowego sprawdź, czy wartość faktycznie występuje w cytowanym fragmencie
> źródła. Jeśli nie - oznacz pole jako niepewne i wyrzuć je do dopytania, zamiast podawać
> klientowi wymyśloną liczbę.

Na rozmowie pokaż przypadek, w którym model się pomylił, a ta kontrola go złapała. Pokazanie
własnego mechanizmu łapania błędów modelu jest mocniejsze niż pokazanie dziesięciu udanych
przebiegów, bo dowodzi, że myślisz o produkcji, a nie o demie.

---

## 6. Eval - tu wygrywasz tę rekrutację

Z 89 aplikantów zgadywałbym, że ułamek zmierzy jakość swojego rozwiązania. Ogłoszenie wymienia
*"prompt engineering and evaluating model output quality"* jako mocny plus, a dla firmy
konsultingowej to nie jest ozdoba - to jest to, co pozwala obiecać klientowi wynik.

`evals/REPORT.md`, zacommitowany, z tabelą w tym stylu:

| Pole | Trafność | Najczęstszy błąd |
|---|---|---|
| `payload_kg` | 29/30 | jednostki: lb w jednym załączniku |
| `reach_mm` | 27/30 | zasięg poziomy vs pionowy |
| `deadline` | 24/30 | "koniec Q2" -> data |
| `industry` | 30/30 | - |
| dobór modelu (top-3 trafne) | 26/30 | pominięte wymaganie washdown |

Plus trzy liczby, których nie poda nikt inny: **koszt za dokument**, **czas przebiegu** i
**porównanie dwóch wariantów promptu albo dwóch modeli na tym samym zbiorze**. Zdanie
"wersja z podziałem ekstrakcji na dwa wywołania podniosła trafność dat z 18/30 na 24/30 przy
koszcie wyższym o 30%" jest warte więcej niż cała reszta README, bo to jest dokładnie język,
w którym rozmawia się z klientem konsultingowym.

Dorzuć krótką taksonomię błędów w `REPORT.md`: trzy, cztery kategorie i co z każdą planujesz
zrobić. To pokazuje, że projekt ma następny krok, a nie że się skończył.

---

## 7. Repo jako dowód pracy z agentem

To jest część, którą najłatwiej przegapić, a która u nich waży najwięcej. Rekrutują pod
*agentic coding*, więc samo repo powinno pokazywać, **jak** pracujesz z agentem.

- **`CLAUDE.md`** z prawdziwą treścią: cel projektu, struktura, konwencje, polecenia do
  uruchamiania testów i evalu, lista rzeczy, których agent nie powinien dotykać.
- **`Makefile`** z `make test` i `make eval`, żeby agent miał zamkniętą pętlę sprzężenia
  zwrotnego. To najważniejszy element dobrej pracy z agentem: agent może sam sprawdzić, czy
  nie zepsuł.
- **Testy od początku**, nawet proste. Bez nich agent pracuje na ślepo.
- **Sekcja w README: "How this was built with Claude Code"** - 150 słów o tym, co zlecałeś
  agentowi, gdzie musiałeś wejść ręcznie i co okazało się złym pomysłem. Ogłoszenie dosłownie
  prosi o *"a description of what you shipped"*. Uczciwe "agent dobrze radził sobie
  z parserami załączników, ale projekt schematu ekstrakcji musiałem zrobić sam, bo wymyślał
  pola, których nikt nie potrzebuje" brzmi jak ktoś, kto faktycznie tym pracuje.
- **Historia commitów** niech będzie czytelna, z sensownymi komunikatami. Oni ją otworzą.
- **`docs/decisions.md`** - pięć krótkich notatek, dlaczego takie wybory. Czytanie cudzych
  decyzji to pierwsza rzecz, którą robi się w konsultingu przy przejmowaniu projektu.

---

## 8. Zaczep na Alteryx

"Nice to have", więc wkład powinien być mały, ale jest tu nieproporcjonalnie dużo do zyskania,
bo Data Pal to **Alteryx Premier Services Partner, jeden z pięciu na świecie**. Alteryx nie
jest u nich dodatkiem, jest tożsamością firmy.

Tania wersja, jeden plik `docs/alteryx-handoff.md`:

- tabela wyjściowa z jawnym kontraktem schematu: nazwy kolumn, typy, dopuszczalne `null`,
  kodowanie, zachowanie przy ponownym przebiegu
- `.csv` oraz `.parquet` w katalogu wyjściowym, gotowe pod wejście workflow
- trzy akapity o tym, gdzie Twój pipeline powinien się kończyć, a gdzie zaczyna Alteryx:
  LLM robi nieustrukturyzowane wejście i ocenę jakości, Alteryx robi powtarzalną transformację,
  joiny i dystrybucję wyniku

Jeśli znajdziesz dwie godziny, pobierz triala Alteryx Designer i zbuduj najprostszy workflow,
który wczytuje Twój plik wyjściowy i coś z nim robi. Screenshot w README. Nie udawaj, że znasz
Alteryx - napisz "pierwszy kontakt, zbudowane na trialu w jeden wieczór". Sama inicjatywa jest
tu komunikatem.

---

## 9. Plan na piętnaście dni

Nie celuj w 20.10. Celuj w **12-13.10**. Mały zespół czyta zgłoszenia na bieżąco, a przy 89
aplikantach wysłanie w ostatnim dniu oznacza trafienie na zmęczonego czytelnika, który ma już
listę finalistów.

| Dni | Robota |
|---|---|
| 1 | Szkielet repo, `llm.py`, `CLAUDE.md`, `Makefile`, pierwszy test. Od początku pracuj w Claude Code lub w trybie agenta Cursora - to ma być nawyk, nie demo. |
| 2 | Parsowanie załączników z numerami stron. 25-30 syntetycznych zapytań + oczekiwane wyjścia. |
| 3-4 | Ekstrakcja: schemat Pydantic, prompt, ponowienia, kontrola ugruntowania. |
| 5 | `run_eval.py` + pierwszy `REPORT.md`. Zobacz pierwsze liczby - będą słabe, to normalne. |
| 6-7 | Indeks po kartach katalogowych, wyszukiwanie z cytatami, dobór modeli. |
| 8 | Szkic odpowiedzi i tabela porównawcza. Wyjście CSV/Parquet. |
| 9 | Druga iteracja na podstawie evalu. Porównaj dwa warianty promptu i zapisz wynik. |
| 10 | Microsoft Graph: odczyt skrzynki i utworzenie szkicu w Outlooku. |
| 11 | Koszty, czasy, taksonomia błędów, `docs/decisions.md`. |
| 12 | README od problemu, nagranie 90-120 s, `alteryx-handoff.md`. |
| 13 | **Wysyłka formularza.** |
| 14-15 | Bufor i przygotowanie do sesji live (punkt 11). |

---

## 10. Co wpisać w formularz

Formularz zajmuje około dziesięciu minut i pyta o link do czegoś, co zbudowałeś, oraz o to,
co to robi i dlaczego. Trzy rzeczy, które trzeba tam załatwić:

**Link**: publiczne repo na GitHubie, README z nagraniem na samej górze. Nie plik ZIP, nie
prywatne repo "dam dostęp na życzenie".

**Opis "co i dlaczego"** - zacznij od problemu, nie od technologii:

> Integratorzy automatyki dostają zapytania ofertowe mailem, w których połowa parametrów jest
> w treści, a połowa w załączonym PDF-ie, i ktoś musi to ręcznie przepisać, zanim zacznie
> cokolwiek wyceniać. Zbudowałem agenta, który czyta taką skrzynkę, wyciąga wymagania do
> ustrukturyzowanej postaci, dobiera kandydujące modele robotów z cytatem konkretnej strony
> karty katalogowej i przygotowuje szkic odpowiedzi wraz z listą rzeczy do dopytania. Nic nie
> wysyła sam. Ma zbiór 30 przypadków testowych i raport z trafnością per pole, kosztem za
> dokument i porównaniem dwóch wariantów promptu - bo bez tego nie da się powiedzieć klientowi,
> czy to działa.

**Twoje tło w jednym zdaniu**, bo to jest Twoja asymetria w tej stawce:

> Na codzień jestem inżynierem robotyki w ASTOR, gdzie programuję roboty Kawasaki i Epson
> i buduję cyfrowe bliźniaki linii produkcyjnych - ten projekt powstał, bo ten dokładny problem
> widzę w pracy, a ocena, czy agent dobrał robota sensownie, jest dla mnie weryfikowalna.

Projekt SCARA warto wspomnieć **jednym zdaniem** jako dowód dowożenia rzeczy od zera do
działania. Nie jako główny link - ta rola nie jest robotyczna i wysłanie ramienia zamiast
agenta byłoby odpowiedzią na inne pytanie.

---

## 11. Przygotowanie do piętnastu minut na żywo

*"We will ask for 15 minutes of live work with your own agent, on your own setup."* Oceniają
proces, nie wynik. Co zrobić wcześniej:

- **Zostaw sobie jedno niezrobione zadanie** w backlogu, celowo. Małe, ale prawdziwe: nowe pole
  w schemacie z obsługą w prompcie, parserze, evalu i teście. Idealny materiał na 15 minut,
  bo przechodzi przez całe repo.
- **Przećwicz je dwa razy na gałęzi testowej.** Nie żeby odegrać scenariusz, ale żeby wiedzieć,
  gdzie są pliki i ile to realnie trwa.
- **Pokazuj pętlę, nie magię**: kontekst dla agenta, mały zakres zmiany, `make test`, przeczytanie
  diffa, poprawka. Pokazanie momentu, w którym agent coś zepsuł, a Ty to wyłapałeś, jest
  mocniejsze niż gładki przebieg. Oni wiedzą, że agenty się mylą - sprawdzają, czy Ty to wiesz.
- **Mów po angielsku.** Pracują po angielsku, a to jest de facto część rozmowy.
- **Miej w zapasie zdanie o tym, czego byś agentowi nie zlecił.** Pytanie "a gdzie go nie
  używasz" jest bardzo prawdopodobne, a dobra odpowiedź istnieje: projekt schematu danych,
  decyzje o granicach systemu, cokolwiek dotykające danych klienta albo wysyłki maili.

---

## 12. Czego nie robić

- **Kolejnego "chat with your PDF" w Streamlicie.** To prześle kilkadziesiąt osób. Bez evalu,
  bez cytatów, bez skrzynki, bez kosztów - czyli bez niczego, co odróżnia zabawkę od produkcji.
- **Frameworkowego kombajnu.** LangChain plus LlamaIndex plus wektorowa baza w chmurze plus
  orkiestracja wieloagentowa na trzydziestu dokumentach wygląda jak moda, nie jak inżynieria.
  Mało zależności, dużo czytelnego kodu.
- **Wieloagentowej orkiestracji.** Modne, a przy tym zadaniu nieuzasadnione. Jeden przepływ,
  dobrze zmierzony, bije roju agentów bez testów.
- **Dotrenowywania modeli.** Nie o to pytają i to nie jest problem tej roli.
- **Prawdziwych danych ASTOR-a ani żadnego klienta.** Tylko syntetyczne. Jedna wrzucona do
  publicznego repo prawdziwa oferta klienta dyskwalifikuje Cię w firmie konsultingowej
  szybciej niż brak projektu.
- **Czekania z wysyłką do 20.10.**

---

## 13. Dwie rzeczy do sprawdzenia u siebie

**Czy faktycznie kodujesz z agentem codziennie.** To jest w ogłoszeniu jako "must have"
i będzie weryfikowane na żywo przez piętnaście minut. Jeśli dziś tak nie jest, to te piętnaście
dni budowania projektu *w* Claude Code albo w trybie agenta Cursora jest jednocześnie
zdobywaniem tej kwalifikacji - ale musi to być prawdziwa praca, nie odegrana scenka. Subskrypcję
i tak dostaniesz od nich, jeśli się uda, więc inwestycja na te dwa tygodnie jest skończona.

**Umowa z ASTOR.** Oferta to B2B albo umowa cywilnoprawna, 20-60 h miesięcznie obok etatu
i studiów - czasowo to się spina, i to jest realna zaleta tej oferty. Ale sprawdź w umowie
zapisy o pracy dodatkowej i zakazie konkurencji. Data Pal to konsulting od danych, a nie
dystrybutor automatyki, więc konfliktu branżowego raczej nie ma, natomiast klauzula
o zgodzie na dodatkowe zatrudnienie bywa niezależna od branży.
