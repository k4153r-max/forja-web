# -*- coding: utf-8 -*-
"""Re-descarga textos ES con U+FFFD desde Gutenberg UTF-8."""
from __future__ import annotations

import csv
import importlib.util
import os
import re
import time
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "imp", Path(__file__).with_name("import-gutenberg-multi.py")
)
imp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)

ROOT = Path(__file__).resolve().parents[1]
TEXTOS = ROOT / "textos"
CATALOG = ROOT / "catalog.js"
PG_CSV = Path(os.environ.get("TEMP", "/tmp")) / "pg_catalog.csv"

# slug -> (title keywords, author keywords)
NEED = {
    "fortunata-jacinta": (["fortunata", "jacinta"], ["galdos", "galdós", "perez"]),
    "tormento": (["tormento"], ["galdos", "galdós", "perez"]),
    "pazos-ulloa": (["pazos", "ulloa"], ["pardo", "bazan"]),
    "facundo": (["facundo"], ["sarmiento"]),
    "misericordia": (["misericordia"], ["galdos", "galdós", "perez"]),
    "viajes-espana": (["viajes por espa"], ["pardo", "bazan"]),
    "juanita-larga": (["juanita la larga"], ["valera"]),
    "la-tribuna": (["la tribuna"], ["pardo", "bazan"]),
    "amistad-funesta": (["amistad funesta"], ["marti", "martí"]),
    "edad-de-oro": (["edad de oro"], ["marti", "martí"]),
    "filosofia-fundamental-2": (["filosofia fundamental"], ["balmes"]),
    "historia-judios-espana": (["judios", "judíos"], ["amador"]),
    "pepita-jimenez": (["pepita"], ["valera"]),
    "buscon": (["buscon", "buscón", "historia de la vida del buscon"], ["quevedo"]),
    "mindanao-geografia": (["mindanao"], []),
    "antonio-azorin": (["antonio azorin", "antonio azorín"], ["martinez", "az<fim-middle>orin"]),
    "ariel": (["ariel"], ["rodo", "rodó"]),
    "biografia-bolivar": (["bolivar", "bolívar"], ["campano"]),
}

# IDs known / preferred when the catalog has several volumes
PREFERRED = {
    "fortunata-jacinta": 17013,
    "ariel": 22849,
}


def load_pg():
    rows = []
    with PG_CSV.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row.get("Type") != "Text":
                continue
            if row.get("Language") != "es":
                continue
            rows.append(row)
    return rows


def pick_id(slug: str, rows) -> int | None:
    if slug in PREFERRED:
        return PREFERRED[slug]
    titles, authors = NEED[slug]
    scored = []
    for row in rows:
        title = (row.get("Title") or "").lower()
        auth = (row.get("Authors") or "").lower()
        if not any(t in title for t in titles):
            continue
        if authors and not any(a in auth for a in authors):
            # allow title-only if very specific
            if len(titles[0]) < 10:
                continue
        try:
            gid = int(row["Text#"])
        except (KeyError, ValueError):
            continue
        scored.append((gid, row.get("Title"), row.get("Authors")))
    if not scored:
        return None
    # prefer shorter title (main work, not "comentarios")
    scored.sort(key=lambda x: len(x[1] or ""))
    print(f"  candidates {slug}:")
    for g, t, a in scored[:6]:
        print(f"    #{g} {t} / {a}")
    return scored[0][0]


def quality(text: str) -> tuple[int, int]:
    return text.count("\ufffd"), len(re.findall(r"[áéíóúñÁÉÍÓÚÑ]", text))


def main():
    rows = load_pg()
    print(f"PG ES texts: {len(rows)}")
    report = []
    for slug, _need in NEED.items():
        path = TEXTOS / f"{slug}.txt"
        old = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
        old_fffd, old_acc = quality(old)
        gid = pick_id(slug, rows)
        print(f"→ {slug} gid={gid} old_fffd={old_fffd} old_acc={old_acc}")
        if not gid:
            report.append((slug, None, "NO_ID", old_fffd, 0, 0))
            continue
        raw = imp.gutenberg_text(gid)
        if not raw:
            report.append((slug, gid, "DOWNLOAD_FAIL", old_fffd, 0, 0))
            print("  FAIL download")
            continue
        clean = imp.clean_gutenberg(raw)
        new_fffd, new_acc = quality(clean)
        print(f"  new {len(clean)} chars fffd={new_fffd} acc={new_acc}")
        if len(clean) < 4000:
            report.append((slug, gid, "TOO_SHORT", old_fffd, new_fffd, new_acc))
            print("  FAIL short")
            continue
        if new_fffd > 20 and new_fffd >= old_fffd * 0.5:
            report.append((slug, gid, "STILL_BAD", old_fffd, new_fffd, new_acc))
            print("  FAIL still damaged")
            continue
        if new_acc < 30:
            report.append((slug, gid, "NO_ACCENTS", old_fffd, new_fffd, new_acc))
            print("  FAIL few accents — maybe wrong language")
            continue
        path.write_text(clean, encoding="utf-8")
        print(f"  OK wrote {path.stat().st_size // 1024}KB")
        report.append((slug, gid, "OK", old_fffd, new_fffd, new_acc))
        time.sleep(0.4)

    # patch catalog sources
    src = CATALOG.read_text(encoding="utf-8")
    for slug, gid, status, *_ in report:
        if status != "OK" or not gid:
            continue
        src = re.sub(
            rf"(id:'{re.escape(slug)}'.*?source:')([^']*)(')",
            rf"\1Project Gutenberg #{gid}\3",
            src,
            count=1,
            flags=re.S,
        )
    CATALOG.write_text(src, encoding="utf-8")

    print("\n=== RESUMEN ===")
    for row in report:
        print(f"{row[2]:14} {row[0]:28} gid={row[1]} fffd {row[3]}→{row[4]} acc={row[5]}")


if __name__ == "__main__":
    main()
