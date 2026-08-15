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
TEXTOS = ROOT / "textos"
CATALOG = ROOT / "catalog.js"

FIXES = [
    ("filosofia-fundamental-2", 16132),
    ("historia-judios-espana", 33885),
    ("ariel", 22899),
]


def quality(text: str):
    return text.count("\ufffd"), len(re.findall(r"[áéíóúñÁÉÍÓÚÑ]", text))


def main():
    src = CATALOG.read_text(encoding="utf-8")
    for slug, gid in FIXES:
        path = TEXTOS / f"{slug}.txt"
        print(f"→ {slug} #{gid}")
        raw = imp.gutenberg_text(gid)
        if not raw:
            print("  FAIL download")
            continue
        clean = imp.clean_gutenberg(raw)
        fffd, acc = quality(clean)
        print(f"  {len(clean)} chars fffd={fffd} acc={acc} head={clean[:80]!r}")
        if len(clean) < 4000 or fffd > 20 or acc < 30:
            print("  FAIL quality")
            continue
        path.write_text(clean, encoding="utf-8")
        print(f"  OK {path.stat().st_size // 1024}KB")
        src = re.sub(
            rf"(id:'{re.escape(slug)}'.*?source:')([^']*)(')",
            rf"\1Project Gutenberg #{gid}\3",
            src,
            count=1,
            flags=re.S,
        )
        time.sleep(0.35)
    CATALOG.write_text(src, encoding="utf-8")


if __name__ == "__main__":
    main()
