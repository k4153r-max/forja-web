# -*- coding: utf-8 -*-
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXTOS = ROOT / "textos"
CATALOG = ROOT / "catalog.js"


def parse_catalog():
    src = CATALOG.read_text(encoding="utf-8")
    entries = []
    for m in re.finditer(r"\{ id:'([^']+)'(.*?)\}", src, re.S):
        eid, body = m.group(1), m.group(2)
        if "hasText:true" not in body:
            continue
        lang = "es"
        lm = re.search(r"lang:'([^']+)'", body)
        if lm:
            lang = lm.group(1)
        src_s = ""
        sm = re.search(r"source:'([^']+)'", body)
        if sm:
            src_s = sm.group(1)
        gid = None
        gm = re.search(r"#(\d+)", src_s)
        if gm:
            gid = int(gm.group(1))
        title = ""
        tm = re.search(r"title:'((?:\\'|[^'])*)'", body)
        if tm:
            title = tm.group(1).replace("\\'", "'")
        entries.append(
            {"id": eid, "lang": lang, "source": src_s, "gid": gid, "title": title}
        )
    return entries


def score_file(path: Path):
    raw = path.read_bytes()
    try:
        t = raw.decode("utf-8")
        utf_ok = True
    except UnicodeDecodeError:
        t = raw.decode("utf-8", errors="replace")
        utf_ok = False
    n_fffd = t.count("\ufffd")
    n_moji = len(re.findall(r"Ã.|Â.|â€|ðŸ", t))
    n_accents = len(re.findall(r"[áéíóúñÁÉÍÓÚÑüÜ¡¿]", t))
    return {
        "utf_ok": utf_ok,
        "fffd": n_fffd,
        "moji": n_moji,
        "accents": n_accents,
        "size": path.stat().st_size,
        "head": t[:120].replace("\n", " "),
    }


def main():
    entries = parse_catalog()
    es = [e for e in entries if e["lang"] == "es"]
    print(f"ES con texto: {len(es)}")
    fffd, moji, missing, ok, no_accent = [], [], [], [], []
    for e in es:
        p = TEXTOS / f"{e['id']}.txt"
        if not p.exists():
            missing.append(e)
            continue
        s = score_file(p)
        rec = {**e, **s}
        if s["fffd"] > 0 or not s["utf_ok"]:
            fffd.append(rec)
        elif s["moji"] > 8:
            moji.append(rec)
        elif s["accents"] < 20 and s["size"] > 8000:
            no_accent.append(rec)
        else:
            ok.append(rec)

    print(f"\n=== ROTOS (U+FFFD / decode) {len(fffd)} ===")
    for r in sorted(fffd, key=lambda x: -x["fffd"]):
        print(
            f"{r['fffd']:5} fffd  {r['id']:36} {r['size']//1024:4}KB  gid={r['gid']}  {r['title'][:50]}"
        )

    print(f"\n=== MOJIBAKE {len(moji)} ===")
    for r in sorted(moji, key=lambda x: -x["moji"]):
        print(f"{r['moji']:5} moji  {r['id']:36} {r['title'][:50]}")

    print(f"\n=== POCOS ACENTOS {len(no_accent)} ===")
    for r in sorted(no_accent, key=lambda x: x["accents"])[:25]:
        print(
            f"{r['accents']:5} acc   {r['id']:36} {r['size']//1024:4}KB  {r['title'][:50]}"
        )

    print(f"\nOK: {len(ok)}  missing files: {len(missing)}")
    for e in missing[:20]:
        print("  missing", e["id"])


if __name__ == "__main__":
    main()
