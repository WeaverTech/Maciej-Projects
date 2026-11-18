"""Pobieranie stron planu z serwera Wydzialu Mechanicznego PK."""
from __future__ import annotations

import re
import time
import urllib.request
from pathlib import Path

DEFAULT_BASE = "https://podzial.mech.pk.edu.pl/stacjonarne/archiwum/2026-2027/zima"
GROUP_FILE_RE = re.compile(r"^\d{2}[A-Z]\d\.htm$")


def _get(url, retries=4):
    last = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=30) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001 - sieć bywa kapryśna
            last = exc
            time.sleep(2 ** attempt)
    raise RuntimeError(f"nie udało się pobrać {url}: {last}")


def group_names(base=DEFAULT_BASE):
    raw = _get(f"{base}/index.xml").decode("cp1250", errors="replace")
    names = re.findall(r'<gro href="([^"]+)"', raw)
    return [n[:-4] for n in names if GROUP_FILE_RE.match(n)]


def download(base=DEFAULT_BASE, out_dir="dane", only=None):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    names = only or group_names(base)
    for name in names:
        target = out / f"{name}.htm"
        target.write_bytes(_get(f"{base}/{name}.htm"))
    return [out / f"{n}.htm" for n in names]
