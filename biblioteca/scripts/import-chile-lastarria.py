# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import re
import time
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "imp", Path(__file__).with_name("import-gutenberg-multi.py")
)
imp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)

ROOT = Path(__file__).resolve().parents[1]
TEXTOS = ROOT / "libros"
CATALOG = ROOT / "catalog.js"

LOTE = [
    (45945, "antano-ogano", "Antaño y ogaño", "José Victorino Lastarria", "1885", "Cuentos", "brown", "Chile", "Novelas y cuentos de la vida hispanoamericana."),
    (71275, "la-america-1", "La América (Tomo I)", "José Victorino Lastarria", "1865", "Ensayo", "navy", "Chile", "Ensayo sobre América y su destino."),
]


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def main() -> None:
    src = CATALOG.read_text(encoding="utf-8")
    existing = set(re.findall(r"id:'([^']+)'", src))
    extras = []
    for gid, slug, title, author, year, genre, color, place, desc in LOTE:
        if slug in existing:
            print("skip", slug)
            continue
        print("→", gid, title)
        raw = imp.gutenberg_text(gid)
        if not raw:
            print("  FAIL download")
            continue
        clean = imp.clean_gutenberg(raw)
        print("  len", len(clean), "fffd", clean.count("\ufffd"))
        if len(clean) < 4000 or clean.count("\ufffd") > 20:
            print("  FAIL quality")
            continue
        path = TEXTOS / f"{slug}.txt"
        path.write_text(clean, encoding="utf-8")
        extras.append(
            " {"
            f" id:'{slug}', title:'{js_escape(title)}', author:'{js_escape(author)}',"
            f" type:'{genre}', genre:'{genre}', place:'{place}', color:'{color}',"
            f" year:'{year}', hasText:true, license:'Dominio público',"
            f" source:'Project Gutenberg #{gid}', desc:'{js_escape(desc)}', lang:'es' "
            "},"
        )
        print("  OK", path.stat().st_size // 1024, "KB")
        time.sleep(0.3)
    if extras:
        src = src.replace("];\nconst CATALOG_STATS", "\n".join(extras) + "\n];\nconst CATALOG_STATS")
    ids = re.findall(r"id:'([^']+)'", src)
    readable = len(re.findall(r"hasText:true", src))
    chile = len(re.findall(r"place:'Chile'", src))
    oer = len(re.findall(r"license:'CC BY 4.0'", src))
    src = re.sub(
        r"const CATALOG_STATS = \{[^}]+\}",
        f"const CATALOG_STATS = {{ total: {len(ids)}, readable: {readable}, chile: {chile}, oer: {oer} }}",
        src,
    )
    CATALOG.write_text(src, encoding="utf-8")
    print("cat", len(ids), readable, "chile", chile)


if __name__ == "__main__":
    main()
