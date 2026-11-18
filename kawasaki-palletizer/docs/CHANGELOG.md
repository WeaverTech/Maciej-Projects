# Historia zmian

## 3.0

Aplikacja napisana od nowa w TypeScript i React. Działa w przeglądarce, także z jednego pliku HTML bez instalacji.

Nowe:
- interfejs prowadzący krok po kroku (paleta → produkt → warstwy → chwytak → robot), motyw jasny i ciemny,
- podgląd 3D całego stosu z animacją układania,
- cofanie i ponawianie, kopiuj / wklej / duplikuj, zaznaczanie ramką, przesuwanie strzałkami,
- przyciąganie z widocznymi liniami pomocniczymi,
- powiązana warstwa B, która sama podąża za zmianami warstwy A,
- przekładki: wpływ na wysokość stosu i kod AS, opcjonalne wywołanie podprogramu,
- kąt O liczony w układzie BASE (z trybem zgodności z 2.3) i stała korekta kąta,
- walidacja na żywo z podświetleniem produktów i naprawą jednym kliknięciem,
- widok kodu AS z kolorowaniem składni i listą kontrolną przed uruchomieniem,
- karta paletyzacji do wydruku,
- autozapis i odtwarzanie sesji,
- format projektu 4 z migracją plików z wersji 2.x.

Bez zmian: konwencja narożników A/B/C/D, kierunki osi, format cykli chwytaka oraz instrukcje kodu AS
dla projektów z wersji 2.x (doszedł tylko nagłówek z komentarzami).

## 2.3
- walidacja po wejściu w zakładkę,
- graficzna miarka P1/P2 z instrukcją w pasku stanu,
- dynamiczne wyłączanie drugiej sekcji chwytaka,
- narożniki A/B/C/D oraz oznaczenie BASE,
- wybór kierunków +X/+Y,
- uproszczony pasek narzędzi.

## 2.2
- testy GUI i diagnostyka,
- walidator AS,
- porównanie A/B,
- testowa transformacja punktu,
- inteligentne przyciąganie.

## 2.1
- nowoczesny jasny styl,
- walidacja ciągła,
- większy generator.

## 2.0
- pakiet funkcji edytora, chwytaka, generatora i eksportu AS.
