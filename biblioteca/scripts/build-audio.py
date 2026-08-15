# -*- coding: utf-8 -*-
"""Build biblioteca/audio.js from known LibriVox project IDs."""
import html as htmlmod
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://librivox.org/api/feed/audiobooks/"

# Only exact matches to Hojear book ids. Do not map lookalikes.
PROJECTS = {
    "lazarillo": [3579],
    "quijote": [567, 1378],
    "platero": [9920],
    "dona-perfecta": [20514],
    "niebla": [11412],
    "marianela": [16285],
    "misericordia": [14874],
    "pazos-ulloa": [10541],
    "fuente-ovejuna": [13341],
    "novelas-ejemplares": [4369],
    "el-si-de-las-ninas": [20704],
    "isla-tesoro": [10139],
    "trafalgar": [3275],
    "frankenstein": [11119],
    "martin-fierro": [8509],
}

def get(params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(API + "?" + q, headers={"User-Agent": "Hojear/1.0"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))

def fetch_id(lv_id):
    data = get({"id": str(lv_id), "format": "json", "extended": "1"})
    books = data.get("books") or []
    return books[0] if books else None

def clean_title(raw):
    t = htmlmod.unescape(str(raw or ""))
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t or "Capítulo"

def tracks_from(book, prefix=""):
    out = []
    for s in book.get("sections") or []:
        url = (s.get("listen_url") or "").replace("http://", "https://")
        if not url:
            continue
        title = clean_title(s.get("title"))
        if prefix:
            title = prefix + title
        out.append({
            "t": title[:120],
            "u": url,
            "s": int(s.get("playtime") or 0),
        })
    return out

def main():
    catalog = {}
    for hid, ids in PROJECTS.items():
        tracks = []
        credit = []
        for i, lv in enumerate(ids):
            book = fetch_id(lv)
            time.sleep(0.3)
            if not book:
                print("missing", hid, lv)
                continue
            prefix = ""
            if len(ids) > 1:
                prefix = f"Parte {i + 1} · "
            tracks.extend(tracks_from(book, prefix))
            credit.append(book.get("url_librivox") or "")
            print(hid, lv, book.get("title"), len(book.get("sections") or []), book.get("language"))
        if tracks:
            catalog[hid] = {
                "tracks": tracks,
                "src": credit[0] if credit else "",
            }
    out = Path(__file__).resolve().parents[1] / "audio.js"
    body = (
        "/* Hojear audio — pistas LibriVox / Archive.org, dominio público. */\n"
        "const hojearAudio = "
        + json.dumps(catalog, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    out.write_text(body, encoding="utf-8")
    print("wrote", out, "books", len(catalog), "tracks", sum(len(v["tracks"]) for v in catalog.values()))

if __name__ == "__main__":
    main()
