# -*- coding: utf-8 -*-
"""
import-revistas.py — Ingesta y formateo de fascículos y revistas históricas para Hojear.

Soporta fuentes:
1. Internet Archive (vía IA identifier / API metadata + OCR text)
2. Project Gutenberg (vía Gutenberg book ID)
3. Archivos locales o URLs directas

Uso:
  python import-revistas.py --batch               # Importa el lote curado predefinido
  python import-revistas.py --ia <identifier>     # Importa un fascículo desde Internet Archive
  python import-revistas.py --gutenberg <id>     # Importa una revista desde Project Gutenberg
  python import-revistas.py --list                # Muestra las revistas en el catálogo
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

# Soporte UTF-8 en stdout de Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parents[1]
TEXTOS = ROOT / "libros"
CATALOG = ROOT / "catalog.js"
UA = "HojearRevistas/1.0 (+https://etemen.cl; hola@etemen.cl; educational library)"

# Lote inicial curado de revistas históricas y fascículos
REVISTAS_CURADAS = [
    {
        "source_type": "gutenberg",
        "source_id": "10020",
        "slug": "strand-magazine-1894-01",
        "title": "The Strand Magazine (Vol. VII, Nº 37)",
        "author": "George Newnes (Ed.)",
        "year": "1894",
        "place": "Universal",
        "color": "navy",
        "lang": "en",
        "desc": "Revista ilustrada británica de 1894 con relatos, reportajes y misterio.",
    },
    {
        "source_type": "ia",
        "source_id": "WeirdTalesV02N02192309",
        "slug": "weird-tales-1923-09",
        "title": "Weird Tales (Vol. 2, Nº 2 — Sep 1923)",
        "author": "Edwin Baird (Ed.)",
        "year": "1923",
        "place": "Universal",
        "color": "purple",
        "lang": "en",
        "desc": "Edición clásica de la legendaria revista de horror, fantasía y ciencia ficción.",
    },
    {
        "source_type": "gutenberg",
        "source_id": "52408",
        "slug": "wide-world-magazine-1909-03",
        "title": "The Wide World Magazine (Vol. 22, Nº 132)",
        "author": "Varios autores",
        "year": "1909",
        "place": "Universal",
        "color": "green",
        "lang": "en",
        "desc": "Crónicas de viajes, relatos de expediciones y aventuras alrededor del mundo.",
    },
    {
        "source_type": "gutenberg",
        "source_id": "52909",
        "slug": "pansy-magazine-1887-11",
        "title": "The Pansy Magazine (Noviembre 1887)",
        "author": "Isabella Macdonald Alden",
        "year": "1887",
        "place": "Universal",
        "color": "yellow",
        "lang": "en",
        "desc": "Revista ilustrada del siglo XIX con cuentos infantiles, grabados y lecciones morales.",
    }
]


def js_escape(s: str) -> str:
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").strip()


def fetch_url(url: str, timeout: int = 30) -> str | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            for enc in ("utf-8", "latin-1", "cp1252", "iso-8859-1"):
                try:
                    return data.decode(enc)
                except UnicodeDecodeError:
                    continue
            return data.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [ERROR] Fallo al descargar {url}: {e}")
        return None


def fetch_gutenberg_text(gid: str | int) -> str | None:
    urls = [
        f"https://www.gutenberg.org/files/{gid}/{gid}-0.txt",
        f"https://www.gutenberg.org/files/{gid}/{gid}.txt",
        f"https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt",
    ]
    for url in urls:
        text = fetch_url(url)
        if text and len(text) > 2000:
            return clean_gutenberg(text)
    return None


def clean_gutenberg(raw: str) -> str:
    start_markers = [
        r"\*\*\* START OF TH(IS|E) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*",
        r"\*\*\* START OF THIS PROJECT GUTENBERG",
        r"\*\*\*START OF THE PROJECT GUTENBERG",
    ]
    for m in start_markers:
        match = re.search(m, raw, re.IGNORECASE)
        if match:
            raw = raw[match.end():]
            break

    end_markers = [
        r"\*\*\* END OF TH(IS|E) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*",
        r"\*\*\* END OF THIS PROJECT GUTENBERG",
        r"End of the Project Gutenberg",
        r"End of Project Gutenberg",
    ]
    for m in end_markers:
        match = re.search(m, raw, re.IGNORECASE)
        if match:
            raw = raw[:match.start()]
            break

    raw = raw.replace("\r\n", "\n").replace("\r", "\n")
    raw = re.sub(r"\n{4,}", "\n\n\n", raw)
    return raw.strip()


def fetch_ia_magazine(identifier: str) -> tuple[str | None, dict]:
    meta_url = f"https://archive.org/metadata/{identifier}"
    meta_str = fetch_url(meta_url)
    if not meta_str:
        return None, {}
    
    meta_json = json.loads(meta_str)
    files = meta_json.get("files", [])
    metadata = meta_json.get("metadata", {})
    
    txt_file = None
    for f in files:
        name = f.get("name", "")
        if name.endswith("_djvu.txt") or (name.endswith(".txt") and not name.endswith("_meta.txt")):
            txt_file = name
            break
            
    if not txt_file:
        print(f"  [AVISO] No se encontró .txt OCR para {identifier}.")
        return None, metadata

    file_url = f"https://archive.org/download/{identifier}/{urllib.parse.quote(txt_file)}"
    print(f"  -> Descargando texto OCR: {file_url}")
    text = fetch_url(file_url, timeout=60)
    if text:
        text = clean_ocr_text(text, metadata)
    return text, metadata


def clean_ocr_text(raw: str, metadata: dict) -> str:
    raw = raw.replace("\r\n", "\n").replace("\r", "\n")
    
    # Si hay bloques típicos de anuncios al inicio del escaneo (ej. ADVERTISEMENT, coupon, etc.)
    # intentar ubicar el primer encabezado relevante o tabla de contenidos
    ad_pattern = re.search(r"\n\s*(?:ADVERTISEMENT|ADVERTISEMENTS|Contents\b|Table of Contents\b|ÍNDICE\b|SUMARIO\b|CHAPTER ONE\b|CAPÍTULO I\b|EDITORIAL\b)", raw, re.IGNORECASE)
    if ad_pattern and ad_pattern.start() < 3000:
        match_str = ad_pattern.group(0).strip().upper()
        if "ADVERTISEMENT" in match_str:
            # Buscar después del bloque de anuncios
            post_ad = re.search(r"\n\s*(?:Contents\b|Table of Contents\b|ÍNDICE\b|SUMARIO\b|CHAPTER ONE\b|CAPÍTULO I\b|EDITORIAL\b|[A-Z\s]{4,30}\n\s*By\s+[A-Z])", raw[ad_pattern.end():], re.IGNORECASE)
            if post_ad:
                raw = raw[ad_pattern.end() + post_ad.start():]
        elif any(k in match_str for k in ("CONTENTS", "ÍNDICE", "SUMARIO", "CHAPTER", "CAPÍTULO", "EDITORIAL")):
            raw = raw[ad_pattern.start():]

    lines = raw.split("\n")
    cleaned_lines = []
    for line in lines:
        s = line.strip()
        # Omitir números de página aislados o artefactos de OCR muy cortos
        if re.match(r"^(\d+|[IVXLCDM]+|\.{3,}|\_{3,}|\*|\-)$", s):
            continue
        cleaned_lines.append(line)
        
    text = "\n".join(cleaned_lines)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    
    title = metadata.get("title", "Revista Histórica")
    year = metadata.get("year", metadata.get("date", ""))
    creator = metadata.get("creator", "Varios autores")
    
    header = [
        title,
        f"{creator} · {year}".strip(" · "),
        "Dominio público / Archivo histórico",
        "",
        "       *       *       *       *       *",
        "",
        ""
    ]
    return "\n".join(header) + text.strip()


def register_in_catalog(item: dict) -> bool:
    src = CATALOG.read_text(encoding="utf-8")
    slug = item["slug"]
    
    if re.search(rf"id:\s*'{re.escape(slug)}'", src):
        print(f"  [SKIP] '{slug}' ya está registrado en catalog.js")
        return False

    entry = (
        f"  {{ id:'{slug}', title:'{js_escape(item['title'])}', "
        f"author:'{js_escape(item['author'])}', type:'Revista', genre:'Revista', "
        f"place:'{item.get('place', 'Universal')}', color:'{item.get('color', 'copper')}', "
        f"year:'{item.get('year', 's. XX')}', hasText:true, license:'{item.get('license', 'Dominio público')}', "
        f"source:'{js_escape(item.get('source', 'Archivo histórico'))}', "
        f"desc:'{js_escape(item.get('desc', 'Fascículo de revista histórica.'))}', "
        f"lang:'{item.get('lang', 'es')}' }},"
    )

    if "];\nconst CATALOG_STATS" in src:
        src = src.replace("];\nconst CATALOG_STATS", entry + "\n];\nconst CATALOG_STATS")
    elif "];" in src:
        src = src.replace("];", entry + "\n];")

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
    print(f"  [OK] Registrado en catalog.js (Total: {len(ids)}, Legibles: {readable})")
    return True


def import_item(item: dict) -> bool:
    slug = item["slug"]
    target_path = TEXTOS / f"{slug}.txt"
    stype = item.get("source_type", "gutenberg")
    sid = item["source_id"]

    print(f"\nProcesando: {item['title']} ({slug}) desde {stype}:{sid}")

    if target_path.exists() and target_path.stat().st_size > 1000:
        print(f"  [INFO] Archivo {target_path.name} ya existe ({target_path.stat().st_size // 1024} KB)")
        register_in_catalog(item)
        return True

    text = None
    if stype == "gutenberg":
        text = fetch_gutenberg_text(sid)
        if not item.get("source"):
            item["source"] = f"Project Gutenberg #{sid}"
    elif stype == "ia":
        text, meta = fetch_ia_magazine(sid)
        if not item.get("source"):
            item["source"] = f"Internet Archive ({sid})"

    if not text or len(text) < 1000:
        print(f"  [FAIL] No se pudo obtener texto suficiente para {slug}")
        return False

    TEXTOS.mkdir(parents=True, exist_ok=True)
    target_path.write_text(text, encoding="utf-8")
    print(f"  [GUARDADO] {target_path.name} ({target_path.stat().st_size // 1024} KB)")
    
    register_in_catalog(item)
    return True


def list_magazines():
    src = CATALOG.read_text(encoding="utf-8")
    matches = re.findall(r"\{\s*id:'([^']+)'.*?title:'([^']+)'.*?genre:'([^']+)'.*?\}", src)
    revistas = [m for m in matches if m[2] == "Revista"]
    print(f"\nRevistas y fascículos en Hojear ({len(revistas)}):\n")
    for rid, rtitle, rgenre in revistas:
        print(f"  - [{rid}] {rtitle}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Importador de revistas históricas para Hojear")
    parser.add_argument("--batch", action="store_true", help="Importar lote curado de revistas")
    parser.add_argument("--ia", type=str, help="Identificador de Internet Archive")
    parser.add_argument("--gutenberg", type=str, help="ID de Project Gutenberg")
    parser.add_argument("--slug", type=str, help="Slug único para el archivo")
    parser.add_argument("--title", type=str, help="Título del fascículo/revista")
    parser.add_argument("--author", type=str, default="Varios autores", help="Autor / Editor")
    parser.add_argument("--year", type=str, default="s. XX", help="Año de publicación")
    parser.add_argument("--place", type=str, default="Universal", help="Lugar (Chile/Latinoamérica/Universal)")
    parser.add_argument("--color", type=str, default="copper", help="Color para la ficha (copper/navy/purple/green/red/yellow)")
    parser.add_argument("--lang", type=str, default="es", help="Idioma (es/en/etc)")
    parser.add_argument("--desc", type=str, default="Fascículo de revista histórica.", help="Descripción breve")
    parser.add_argument("--list", action="store_true", help="Listar revistas registradas")

    args = parser.parse_args()

    if args.list:
        list_magazines()
        return

    if args.batch:
        print(f"Iniciando importación del lote curado ({len(REVISTAS_CURADAS)} revistas)...")
        for item in REVISTAS_CURADAS:
            import_item(item)
            time.sleep(0.5)
        print("\nLote procesado exitosamente.")
        return

    if args.ia:
        slug = args.slug or f"ia-{args.ia.lower()}"
        item = {
            "source_type": "ia",
            "source_id": args.ia,
            "slug": slug,
            "title": args.title or f"Revista {args.ia}",
            "author": args.author,
            "year": args.year,
            "place": args.place,
            "color": args.color,
            "lang": args.lang,
            "desc": args.desc,
            "source": f"Internet Archive ({args.ia})",
        }
        import_item(item)
        return

    if args.gutenberg:
        slug = args.slug or f"pg-{args.gutenberg}"
        item = {
            "source_type": "gutenberg",
            "source_id": args.gutenberg,
            "slug": slug,
            "title": args.title or f"Gutenberg Revista #{args.gutenberg}",
            "author": args.author,
            "year": args.year,
            "place": args.place,
            "color": args.color,
            "lang": args.lang,
            "desc": args.desc,
            "source": f"Project Gutenberg #{args.gutenberg}",
        }
        import_item(item)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
