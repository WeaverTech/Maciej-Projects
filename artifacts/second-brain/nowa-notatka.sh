#!/usr/bin/env bash
# Szybki zapis do skrzynki second braina.
#
#   ./nowa-notatka.sh "limit prądu na osi 2 trzeba zbić do 1.2 A, inaczej gubi kroki"
#   ./nowa-notatka.sh                       # otwiera pustą notatkę w $EDITOR
#
# Vault poza repo: export SECOND_BRAIN_DIR=~/second-brain

set -euo pipefail

# Bez locale UTF-8 sed traktuje polskie znaki bajtowo i nazwy plików wychodzą dziwne.
if ! locale charmap 2>/dev/null | grep -qi 'utf-\?8'; then
    for kandydat in C.UTF-8 en_US.UTF-8 pl_PL.UTF-8; do
        if locale -a 2>/dev/null | grep -qix "${kandydat/UTF-8/utf8}"; then
            export LC_ALL="$kandydat"
            break
        fi
    done
fi

vault="${SECOND_BRAIN_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vault}"
inbox="$vault/00-skrzynka"

if [[ ! -d "$inbox" ]]; then
    echo "Nie znalazłem skrzynki: $inbox" >&2
    echo "Ustaw SECOND_BRAIN_DIR na katalog vaulta." >&2
    exit 1
fi

tresc="${*:-}"
stempel="$(date +%Y-%m-%d-%H%M%S)"

if [[ -n "$tresc" ]]; then
    # Tytuł pliku z pierwszych słów treści, żeby dało się go rozpoznać na liście.
    slug="$(printf '%s' "$tresc" \
        | sed -e 's/[ĄąĀā]/a/g' -e 's/[Ććĉ]/c/g' -e 's/[Ęę]/e/g' -e 's/[Łł]/l/g' \
              -e 's/[Ńń]/n/g' -e 's/[Óó]/o/g' -e 's/[Śś]/s/g' -e 's/[ŹźŻż]/z/g' \
        | tr '[:upper:]' '[:lower:]' \
        | sed -e 's/[^a-z0-9]\+/-/g' -e 's/^-//' -e 's/-$//' \
        | cut -c1-50)"
    plik="$inbox/$stempel-${slug:-notatka}.md"
else
    plik="$inbox/$stempel-notatka.md"
fi

{
    echo "---"
    echo "typ: skrzynka"
    echo "utworzono: $(date +%Y-%m-%d)"
    echo "---"
    echo
    if [[ -n "$tresc" ]]; then
        echo "$tresc"
    fi
} > "$plik"

echo "$plik"

if [[ -z "$tresc" && -n "${EDITOR:-}" ]]; then
    "$EDITOR" "$plik"
fi
