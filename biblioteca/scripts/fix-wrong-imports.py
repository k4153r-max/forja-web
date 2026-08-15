# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "imp", Path(__file__).with_name("import-gutenberg-multi.py")
)
imp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)

FIXES = [
    (105, "persuasion", "en"),
    (22367, "verwandlung-de", "de"),
    (17989, "monte-cristo-fr", "fr"),
    (19657, "notre-dame", "fr"),
    (7205, "zarathustra", "de"),
    (9186, "nathan-weise", "de"),
    (21765, "ovid-metamorphoses-en", "en"),
    (52484, "pinocchio-it", "it"),
    (45334, "promessi-sposi-it", "it"),
    (218, "bello-gallico", "la"),
]


def main() -> None:
    imp.TEXTOS.mkdir(exist_ok=True)
    # drop wrong Ovid latin file
    bad = imp.TEXTOS / "metamorphoses-ovid.txt"
    if bad.exists():
        bad.unlink()
        print("removed metamorphoses-ovid.txt")

    for gid, slug, lang in FIXES:
        path = imp.TEXTOS / f"{slug}.txt"
        print(f"fix [{lang}] {gid} {slug}")
        raw = imp.gutenberg_text(gid)
        if not raw:
            print("  FAIL download")
            continue
        clean = imp.clean_gutenberg(raw)
        if len(clean) < 4000:
            print(f"  FAIL short {len(clean)}")
            continue
        path.write_text(clean, encoding="utf-8")
        print(f"  OK {path.stat().st_size // 1024}KB")
        head = clean[:180].replace("\n", " ")
        print("   ", head)


if __name__ == "__main__":
    main()
