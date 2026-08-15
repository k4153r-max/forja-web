# -*- coding: utf-8 -*-
"""Match Hojear catalog titles to LibriVox Spanish projects."""
import json
import re
import time
import urllib.parse
import urllib.request

API = "https://librivox.org/api/feed/audiobooks/"

KNOWN = {
    "lazarillo": ["Lazarillo"],
    "quijote": ["Don Quijote", "Don Quixote"],
    "platero": ["Platero"],
    "dona-perfecta": ["Dona Perfecta", "Doña Perfecta"],
    "corazon": ["Cuore", "Corazon"],
    "martin-fierro": ["Martin Fierro", "Martín Fierro"],
    "frankenstein": ["Frankenstein"],
    "niebla": ["Niebla"],
    "marianela": ["Marianela"],
    "misericordia": ["Misericordia"],
    "pepita-jimenez": ["Pepita"],
    "pazos-ulloa": ["Pazos de Ulloa"],
    "la-regenta": ["La Regenta"],
    "fuente-ovejuna": ["Fuenteovejuna", "Fuente Ovejuna"],
    "novelas-ejemplares": ["Novelas ejemplares"],
    "el-si-de-las-ninas": ["sí de las niñas", "si de las ninas"],
    "buscon": ["Buscón", "Buscon"],
    "ariel": ["Ariel"],
    "facundo": ["Facundo"],
    "azul": ["Azul"],
    "martin-rivas": ["Martín Rivas", "Martin Rivas"],
    "sub-terra": ["Sub terra", "Subterra"],
    "cuentos-amor": ["Cuentos de amor"],
    "isla-tesoro": ["isla del tesoro", "Treasure Island"],
    "jekyll-hyde": ["Jekyll"],
    "trafalgar": ["Trafalgar"],
    "fortunata-jacinta": ["Fortunata"],
    "nazarin": ["Nazarín", "Nazarin"],
    "romancero-gitano": ["Romancero gitano"],
    "cantos-vida-esperanza": ["Cantos de vida"],
    "libro-buen-amor": ["Libro de buen amor"],
    "platero": ["Platero y yo"],
}

def get(params):
    q = urllib.parse.urlencode(params)
    url = API + "?" + q
    req = urllib.request.Request(url, headers={"User-Agent": "Hojear/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def search(title):
    try:
        data = get({
            "title": title,
            "format": "json",
            "extended": "1",
            "limit": "20",
        })
    except Exception as e:
        return [], str(e)
    return data.get("books") or [], None

def is_es(book):
    lang = (book.get("language") or "").lower()
    return "spanish" in lang or lang in ("es", "español", "espanol")

seen = {}
for hid, queries in KNOWN.items():
    print("==", hid)
    for q in queries:
        books, err = search(q)
        if err:
            print("  ERR", q, err)
            continue
        for b in books:
            if not is_es(b):
                continue
            bid = b.get("id")
            if (hid, bid) in seen:
                continue
            seen[(hid, bid)] = True
            secs = b.get("sections") or []
            print(f"  LV {bid} | {b.get('title')} | {b.get('language')} | {len(secs)} tracks | {b.get('url_librivox')}")
        time.sleep(0.4)
