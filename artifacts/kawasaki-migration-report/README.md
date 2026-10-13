# Raport: wymiana robota Kawasaki z kontrolerem D na ten sam model z kontrolerem E lub F

Raport dla kierownika o tym, ile da się przenieść ze starego kontrolera D, gdy robot
wymieniany jest razem z kontrolerem na ten sam model ramienia z kontrolerem E lub F,
a stanowisko, chwytak i program zostają bez zmian.

## Pliki

| Plik | Kiedy używać |
|---|---|
| `Raport_migracja_Kawasaki_D_do_E_F.pdf` | do pokazania lub wysłania kierownikowi |
| `Raport_migracja_Kawasaki_D_do_E_F.docx` | gdy trzeba coś dopisać ręcznie (np. imię i nazwisko w nagłówku) |

Oba pliki generuje `scripts/generate_kawasaki_migration_report.py`
(`pip install python-docx reportlab`, potem `python3 scripts/generate_kawasaki_migration_report.py`).

## Najważniejsze wnioski

1. Programy, punkty, zmienne, dane pomocnicze i większość danych systemowych przenoszą się
   poleceniami SAVE/P, /L, /R, /S, /A, /SYS - istnieją one zarówno w D, jak i w E/F.
2. Pełnego backupu z D nie wolno wczytać w całości, bo nadpisałby dane nowego ramienia
   (SAVE/ROB: model, zerowanie, parametry serwo).
3. Od nowa: okablowanie I/O i bezpieczeństwa, fieldbus (także po stronie PLC), opcje płatne,
   ekran operatorski do sprawdzenia, korekta punktów na podstawie punktów referencyjnych.
4. Ten sam model ramienia istnieje w kilku generacjach tylko dla części rodzin
   (np. MX, ZX300S). Dla innych jest następca o innych parametrach.
5. Większość wariantów E jest już wycofana, a okres dostaw części dla D w większości minął,
   więc domyślnym wyborem jest F.

## Przed prezentacją

- Wpisać swoje imię i nazwisko w polu "Przygotował" (w `.docx` albo w stałej `META` w skrypcie).
- Punkty z rozdziału 12 trzeba potwierdzić w serwisie Kawasaki przed zamówieniem.
- Rozdział 11 rozdziela fakty z dokumentacji Kawasaki od praktyki opisanej na forach.
