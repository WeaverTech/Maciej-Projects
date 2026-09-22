# CV uniwersalne - Maciej Tkacz

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
