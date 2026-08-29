# Fetch PD texts from Spanish Wikisource (plain extracts).
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "libros"
UA = "Hojear/1.0 (etemen.cl; dominio público; contacto hola@etemen.cl)"

BOOKS = {
    "sub-terra": {
        "title": "Sub terra",
        "author": "Baldomero Lillo",
        "year": "1904",
        "pages": [
            "Los_inválidos",
            "La_compuerta_número_12",
            "El_grisú",
            "El_pago",
            "El_Chiflón_del_Diablo",
            "El_pozo_(Lillo)",
            "Juan_Fariña",
            "Caza_mayor",
        ],
    },
    "martin-rivas": {
        "title": "Martín Rivas",
        "author": "Alberto Blest Gana",
        "year": "1862",
        "pages": ["Martín_Rivas"],
    },
}


class _Text(HTMLParser):
    skip_tags = {"script", "style", "table", "nav", "noscript"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip += 1
        elif self.skip == 0 and tag in {"p", "br", "div", "h1", "h2", "h3", "li", "tr"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.skip_tags and self.skip:
            self.skip -= 1
        elif self.skip == 0 and tag in {"p", "div", "h1", "h2", "h3", "li"}:
            self.parts.append("\n")

    def handle_data(self, data):
        if self.skip == 0:
            self.parts.append(data)


def html_to_text(html: str) -> str:
    parser = _Text()
    parser.feed(html)
    text = "".join(parser.parts)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # drop wikisource chrome
    drop = (
        "Ediciones de",
        "artículo enciclopédico",
        "metadatos",
        "Categoría:",
        "Índice:",
        "←",
        "→",
    )
    lines = []
    for ln in text.splitlines():
        s = ln.strip()
        if not s:
            lines.append("")
            continue
        if any(s.startswith(d) or s == d for d in drop):
            continue
        if re.fullmatch(r"\d+", s):
            continue
        lines.append(s)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


def extract(title: str) -> str:
    q = urllib.parse.urlencode(
        {
            "action": "parse",
            "page": title,
            "prop": "text",
            "format": "json",
            "disableeditsection": "1",
            "disablelimitreport": "1",
            "redirects": "1",
        }
    )
    req = urllib.request.Request(
        "https://es.wikisource.org/w/api.php?" + q,
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=90) as res:
        data = json.loads(res.read().decode("utf-8"))
    html = ((data.get("parse") or {}).get("text") or {}).get("*") or ""
    if not html:
        raise RuntimeError("missing html for " + title)
    text = html_to_text(html)
    if len(text) < 800:
        raise RuntimeError("short extract for " + title + f" ({len(text)})")
    return text


def main() -> None:
    for book_id, meta in BOOKS.items():
        chunks = [f"{meta['title']}\n{meta['author']}\n{meta['year']}\n"]
        for page in meta["pages"]:
            print("fetch", page)
            body = extract(page)
            # drop wikisource navigation leftovers
            lines = [ln.rstrip() for ln in body.splitlines()]
            chunks.append("\n".join(lines).strip())
        text = "\n\n".join(chunks).strip() + "\n"
        dest = OUT / f"{book_id}.txt"
        dest.write_text(text, encoding="utf-8")
        print("wrote", dest.name, len(text), "chars")


if __name__ == "__main__":
    main()
