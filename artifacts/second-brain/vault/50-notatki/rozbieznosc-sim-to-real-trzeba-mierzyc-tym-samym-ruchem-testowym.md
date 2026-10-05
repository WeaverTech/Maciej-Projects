---
typ: notatka
utworzono: 2026-10-05
zrodlo: własna obserwacja z pracy nad cyfrowymi bliźniakami
---

# Rozbieżność sim-to-real ma wartość dowodową dopiero wtedy, gdy mierzysz ten sam ruch testowy

> Notatka przykładowa - pokazuje konwencję notatki trwałej. Zastąp ją swoją,
> z własnymi pomiarami.

Zdanie "symulacja zachowuje się inaczej niż robot" nic nie znaczy, bo każdy to wie.
Znaczenie pojawia się, gdy masz **jeden zdefiniowany ruch testowy**, powtórzony w obu
środowiskach, i liczbę opisującą różnicę. Dopiero wtedy można mówić o przyczynie:
inne parametry fizyczne, uproszczony model tarcia, inna rampa przyspieszenia w sterowniku
albo błąd w geometrii po imporcie CAD.

Praktyczny wniosek: ruch testowy definiuj **zanim** zaczniesz stroić symulację. Inaczej
nieświadomie dobierzesz ruch, w którym symulacja akurat wygląda dobrze.

To jest też różnica między "robiłem symulacje" a "walidowałem symulacje" - czyli dokładnie
to, o co pytają ogłoszenia wymagające "validate and tune physical parameters, kinematics
and constraints".

## Dowód / przykład

<!-- Tu wstawiasz konkret: ruch testowy, warunki pomiaru, wynik. Przykład struktury: -->

- Ruch testowy: `[opisz - np. przejazd między dwoma punktami, stała prędkość]`
- Mierzone: `[czas cyklu / odchyłka pozycji końcówki / przeregulowanie]`
- Symulacja: `[wartość]` | Fizyczny robot: `[wartość]` | Różnica: `[wartość]`
- Hipoteza przyczyny: `[np. brak modelu tarcia w przegubie 2]`

## Powiązane

- [[scara-isaac-sim]]
