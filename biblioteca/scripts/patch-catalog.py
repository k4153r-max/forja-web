# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "catalog.js"
src = p.read_text(encoding="utf-8")
src = src.replace("},,", "},")

repls = [
    (
        "id:'pinocchio', title:'Le avventure di Pinocchio', author:'Carlo Collodi', type:'Aventura', genre:'Aventura', place:'Universal', color:'yellow', year:'1883', hasText:true, license:'Dominio público', source:'Project Gutenberg #500', desc:'Il burattino.', lang:'it'",
        "id:'pinocchio', title:'The Adventures of Pinocchio', author:'Carlo Collodi', type:'Aventura', genre:'Aventura', place:'Universal', color:'yellow', year:'1883', hasText:true, license:'Dominio público', source:'Project Gutenberg #500', desc:'English translation of Collodi.', lang:'en'",
    ),
    (
        "id:'promessi-sposi', title:'I Promessi Sposi', author:'Alessandro Manzoni', type:'Novela', genre:'Novela', place:'Universal', color:'brown', year:'1827', hasText:true, license:'Dominio público', source:'Project Gutenberg #35155', desc:'Renzo e Lucia.', lang:'it'",
        "id:'promessi-sposi', title:'The Betrothed', author:'Alessandro Manzoni', type:'Novela', genre:'Novela', place:'Universal', color:'brown', year:'1827', hasText:true, license:'Dominio público', source:'Project Gutenberg #35155', desc:'English translation of I Promessi Sposi.', lang:'en'",
    ),
    (
        "id:'alienista', title:'O Alienista', author:'Machado de Assis', type:'Novela', genre:'Novela', place:'Universal', color:'green', year:'1882', hasText:true, license:'Dominio público', source:'Project Gutenberg #55682', desc:'A Casa Verde.', lang:'pt'",
        "id:'alienista', title:'Quincas Borba', author:'Machado de Assis', type:'Novela', genre:'Novela', place:'Universal', color:'green', year:'1891', hasText:true, license:'Dominio público', source:'Project Gutenberg #55682', desc:'Humanitas e o cão Quincas Borba.', lang:'pt'",
    ),
    ("source:'Project Gutenberg #135'", "source:'Project Gutenberg #105'"),
    ("source:'Project Gutenberg #17989', desc:'Quasimodo", "source:'Project Gutenberg #19657', desc:'Quasimodo"),
    ("source:'Project Gutenberg #1250'", "source:'Project Gutenberg #17989'"),
    ("source:'Project Gutenberg #4367'", "source:'Project Gutenberg #22367'"),
    ("source:'Project Gutenberg #6079'", "source:'Project Gutenberg #9186'"),
    ("source:'Project Gutenberg #21000'", "source:'Project Gutenberg #7205'"),
    ("source:'Project Gutenberg #10657'", "source:'Project Gutenberg #218'"),
]
for a, b in repls:
    src = src.replace(a, b)

src = re.sub(r"\n \{ id:'metamorphoses-ovid'.*?\},?", "", src)
src = re.sub(r"\n \{ id:'decameron'.*?\},?", "", src)

extras = """
 { id:'ovid-metamorphoses-en', title:'The Metamorphoses', author:'Ovid', type:'Poesía', genre:'Poesía', place:'Universal', color:'purple', year:'8 d.C.', hasText:true, license:'Dominio público', source:'Project Gutenberg #21765', desc:'English translation of Ovid, books I-VII.', lang:'en' },
 { id:'pinocchio-it', title:'Le avventure di Pinocchio', author:'Carlo Collodi', type:'Aventura', genre:'Aventura', place:'Universal', color:'yellow', year:'1883', hasText:true, license:'Dominio público', source:'Project Gutenberg #52484', desc:'Storia di un burattino.', lang:'it' },
 { id:'promessi-sposi-it', title:'I Promessi Sposi', author:'Alessandro Manzoni', type:'Novela', genre:'Novela', place:'Universal', color:'brown', year:'1827', hasText:true, license:'Dominio público', source:'Project Gutenberg #45334', desc:'Renzo e Lucia, in italiano.', lang:'it' },
"""
src = src.replace("];\nconst CATALOG_STATS", extras + "];\nconst CATALOG_STATS")

ids = re.findall(r"id:'([^']+)'", src)
readable = len(re.findall(r"hasText:true", src))
chile = len(re.findall(r"place:'Chile'", src))
oer = len(re.findall(r"license:'CC BY 4.0'", src))
src = re.sub(
    r"const CATALOG_STATS = \{[^}]+\}",
    f"const CATALOG_STATS = {{ total: {len(ids)}, readable: {readable}, chile: {chile}, oer: {oer} }}",
    src,
)
p.write_text(src, encoding="utf-8")
print("ids", len(ids), "readable", readable, "double", src.count("},,"))
print({k: src.count(f"lang:'{k}'") for k in ["es", "en", "fr", "de", "it", "pt", "la"]})
