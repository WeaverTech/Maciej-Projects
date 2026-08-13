# Prima-Hydro – strona firmowa z konfiguratorem węży hydraulicznych

Nowoczesna, modułowa aplikacja SPA dla firmy **Prima-Hydro** (zakuwanie węży hydraulicznych
dla rolnictwa, budownictwa i przemysłu).

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router + Lucide React

## Uruchomienie

```bash
npm install
npm run dev      # serwer deweloperski
npm run build    # build produkcyjny
npm run preview  # podgląd builda
```

## Hosting na GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` publikuje stronę po każdym pushu na `main`.

1. Zmerguj PR do `main`.
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Adres: `https://weavertech.github.io/Maciej-Projects/`

## Funkcjonalności

- **Strona główna** (`/`) – industrialny design (ciemna stal, pomarańcz, żółć ostrzegawcza),
  header z danymi kontaktowymi, hero, sekcje usług i branż.
- **Interaktywny konfigurator** – 5 kroków: typ węża (1SN / 2SN / 4SP wg EN 853/856),
  średnica DN6–DN25, długość i ilość, końcówki A/B (DKOL, DKOS, DKR, ORFS; proste / 45° / 90°)
  oraz kąt skręcenia końcówek. Stały panel podglądu specyfikacji z **wyceną brutto na żywo**
  (mockowany cennik w `src/data/catalog.ts`, logika w `src/lib/pricing.ts`).
- **Formularz zamówienia** – imię, nazwisko, telefon, NIP (opcjonalny) z walidacją;
  wysyłka zapisuje zamówienie w globalnym stanie (Zustand + persist w `localStorage`).
- **Panel administratora** (`/admin`) – karty zamówień z danymi klienta, pełną specyfikacją,
  wyceną i zarządzaniem statusem (Nowe → W realizacji → Gotowe), filtry i statystyki.

## Struktura projektu

```
src/
├── components/
│   ├── layout/        # Header, Footer
│   ├── home/          # Hero, Services
│   ├── configurator/  # Configurator + kroki, podgląd specyfikacji, formularz
│   ├── admin/         # OrderCard, StatusBadge
│   └── ui/            # współdzielone elementy (OptionButton)
├── pages/             # HomePage (/), AdminPage (/admin)
├── store/             # orderStore – globalny stan zamówień (Zustand)
├── data/              # catalog.ts – dane techniczne i mockowany cennik
└── lib/               # pricing.ts – logika wyceny (netto / VAT / brutto)
```
