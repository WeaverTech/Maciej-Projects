# Testowanie

## Polecenia

```bash
npm run check        # oxlint + kontrola typów + vitest
npm run test:e2e     # Playwright (sam uruchamia serwer deweloperski)
```

Testy end-to-end domyślnie używają zainstalowanego Chrome. Bez niego: `npx playwright install chromium`
i `PW_CHANNEL= npm run test:e2e`.

## Testy rdzenia (`tests/core/`)

- transformacje każdego narożnika BASE i wszystkie dozwolone kierunki osi,
- odrzucenie osi równoległych,
- kąt O w trybie BASE i w trybie zgodności, korekta kąta,
- obrót A do B, synchronizacja powiązanej warstwy B, porównanie A/B,
- obrys produktu po obrocie 90°,
- wystawanie i nakładanie w granicy oraz poza limitem, brak fałszywych błędów `0.0 mm`,
- Z warstw i przekładek,
- zapis/odczyt JSON, migracja formatu 3, odrzucenie nowszego formatu i uszkodzonych plików,
- chwyt pojedynczy i podwójny, brakujące i powtórzone produkty w cyklach,
- generator układów, przyciąganie,
- eksport AS i walidator AS.

### Zgodność z wersją 2.3

`tests/fixtures/legacy/*.json` zawiera projekty wraz z wynikami oryginalnego programu w Pythonie
(kod AS, walidacja geometrii, cykle, porównanie A/B, transformacje). `tests/core/legacy.test.ts` wymaga,
żeby nowa implementacja dawała dokładnie te same wyniki (kod AS porównywany bez nagłówka z komentarzami). Pliki wygenerował skrypt `gen_fixtures.py`
uruchomiony na źródłach wersji 2.3.

## Testy stanu i komponentów (`tests/state/`, `tests/ui/`)

Magazyn (historia cofania, scalanie zmian, transakcje, schowek, warstwa B), start aplikacji,
panele, okna dialogowe, blokowanie pól sekcji 2 w trybie pojedynczym.

## Testy end-to-end (`e2e/app.spec.ts`)

- start aplikacji i projekt przykładowy,
- generator układów,
- dodaj / obróć / przesuń / usuń, Delete i Backspace,
- przyciąganie przy przeciąganiu,
- zaznaczanie ramką i Ctrl+A,
- miarka P1/P2, Esc i prawy przycisk myszy,
- kolejność ustalana klikaniem,
- warstwa B: powiązanie i odłączenie,
- chwytak pojedynczy i podwójny, edytor cykli,
- odświeżanie walidacji,
- widok kodu AS, kopiowanie i zapis,
- zapis i odczyt projektu,
- autozapis po przeładowaniu strony,
- podgląd 3D i animacja,
- ciemny motyw i skróty.

## Test ręczny przed wydaniem

Zbudować `npm run build:standalone`, otworzyć `release/KawasakiPalletizer.html` z dysku w Chrome lub Edge
na ekranie 1920×1080 przy skalowaniu 100% oraz 150% i przejść scenariusz: generator → edycja → warstwa B →
chwytak podwójny → podgląd 3D → kod AS → zapis i ponowne otwarcie projektu.
