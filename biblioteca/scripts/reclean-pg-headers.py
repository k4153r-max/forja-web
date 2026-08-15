# -*- coding: utf-8 -*-
"""Quita preámbulo y colofón legal de Gutenberg (inglés) de los TXT."""
from __future__ import annotations

import re
from pathlib import Path

TEXTOS = Path(__file__).resolve().parents[1] / "textos"

START_RE = re.compile(
    r"(?m)^\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*\n?"
)
END_RE = re.compile(
    r"(?m)^\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*"
)
META_END_RE = re.compile(
    r"(?is)^This eBook is for the use of anyone anywhere.*?"
    r"(?:Language:\s*[^\n]+\n|Credits:\s*[^\n]+\n(?:[ \t]+[^\n]+\n)*)+"
)
PRODUCED_RE = re.compile(
    r"(?is)^(?:</?pre>\s*)*(?:Produced by|E-text prepared by)[^\n]*(?:\n[ \t][^\n]+)*\n+"
)
FOOTER_RE = re.compile(
    r"(?s)\n[ \t]*This eBook is for the use of anyone anywhere.*\Z"
)


def clean(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"^</?pre>\s*", "", text)
    m = START_RE.search(text)
    if m:
        text = text[m.end() :]
    elif text.lstrip().startswith("This eBook"):
        m2 = META_END_RE.search(text)
        if m2:
            text = text[m2.end() :]
        else:
            # corta el bloque inicial hasta la primera línea vacía tras Title/Author
            cut = re.search(r"\n{2,}", text[:4000])
            if cut:
                text = text[cut.end() :]
    m = END_RE.search(text)
    if m:
        text = text[: m.start()]
    else:
        text = FOOTER_RE.sub("", text)
    text = PRODUCED_RE.sub("", text.lstrip())
    text = text.replace("\ufffd", "")
    return text.strip() + "\n"


def main():
    changed = 0
    for path in sorted(TEXTOS.glob("*.txt")):
        if path.name.startswith("_"):
            continue
        old = path.read_text(encoding="utf-8", errors="replace")
        new = clean(old)
        if new == old:
            continue
        if len(new) < 2000:
            print(f"SKIP short after clean {path.name} {len(new)}")
            continue
        # no borrar más del 40% salvo que fuera boilerplate enorme
        if len(new) < len(old) * 0.55:
            print(f"SKIP too aggressive {path.name} {len(old)}→{len(new)}")
            continue
        path.write_text(new, encoding="utf-8")
        print(f"clean {path.name:40} {len(old)}→{len(new)}")
        changed += 1
    print(f"\nActualizados: {changed}")


if __name__ == "__main__":
    main()
