# -*- coding: utf-8 -*-
"""Lote curado ES (Gutenberg) + intento de textos chilenos de dominio público."""
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

# gid, slug, title, author, year, genre, color, place, desc
LOTE = [
    (60464, "arbol-ciencia", "El árbol de la ciencia", "Pío Baroja", "1911", "Novela", "navy", "Universal", "Andrés Hurtado, medicina y desencanto."),
    (43432, "la-busca", "La busca", "Pío Baroja", "1904", "Novela", "brown", "Universal", "Madrid pobre: la lucha por la vida."),
    (47057, "shanti-andia", "Las inquietudes de Shanti Andía", "Pío Baroja", "1911", "Aventura", "blue", "Universal", "Marino vasco, mar y memoria."),
    (40544, "aurora-roja", "Aurora roja", "Pío Baroja", "1904", "Novela", "red", "Universal", "Anarquismo y taller en Madrid."),
    (14944, "la-barraca", "La barraca", "Vicente Blasco Ibáñez", "1898", "Novela", "green", "Universal", "Huerta valenciana, tierra y venganza."),
    (26983, "sangre-y-arena", "Sangre y arena", "Vicente Blasco Ibáñez", "1908", "Novela", "red", "Universal", "Un torero, la fama y la caída."),
    (24536, "cuatro-jinetes", "Los cuatro jinetes del apocalipsis", "Vicente Blasco Ibáñez", "1916", "Novela", "navy", "Universal", "Una familia partida por la Gran Guerra."),
    (41746, "flor-de-mayo", "Flor de mayo", "Vicente Blasco Ibáñez", "1895", "Novela", "blue", "Universal", "Pescadores del Grao de Valencia."),
    (16670, "la-catedral", "La catedral", "Vicente Blasco Ibáñez", "1903", "Novela", "purple", "Universal", "Toledo, clero y rebelión."),
    (23236, "mare-nostrum", "Mare nostrum", "Vicente Blasco Ibáñez", "1918", "Novela", "blue", "Universal", "El Mediterráneo en guerra."),
    (29506, "sombrero-tres-picos", "El sombrero de tres picos", "Pedro A. de Alarcón", "1874", "Novela", "yellow", "Universal", "El corregidor, el molinero y Frasquita."),
    (23600, "la-gaviota", "La gaviota", "Fernán Caballero", "1849", "Novela", "pink", "Universal", "Costumbres andaluzas y una voz de pueblo."),
    (15725, "dona-perfecta", "Doña Perfecta", "Benito Pérez Galdós", "1876", "Novela", "red", "Universal", "Orbajosa: fe, poder y un forastero."),
    (58059, "madre-naturaleza", "La madre naturaleza", "Emilia Pardo Bazán", "1887", "Novela", "green", "Universal", "Segunda parte de Los pazos de Ulloa."),
    (58643, "calderon-teatro-3", "Teatro selecto (III)", "Pedro Calderón de la Barca", "Siglo de Oro", "Teatro", "navy", "Universal", "Calderón: continuación del teatro selecto."),
    (63328, "calderon-teatro-4", "Teatro selecto (IV)", "Pedro Calderón de la Barca", "Siglo de Oro", "Teatro", "navy", "Universal", "Calderón: cierre del teatro selecto."),
    (66262, "los-suenos-2", "Los Sueños (vol. II)", "Francisco de Quevedo", "1627", "Clásico", "navy", "Universal", "Más visiones satíricas del mundo al revés."),
    (47650, "prosas-profanas", "Prosas profanas", "Rubén Darío", "1896", "Poesía", "blue", "Latinoamérica", "Cisnes, versalles y modernismo."),
    (50365, "los-raros", "Los raros", "Rubén Darío", "1896", "Ensayo", "purple", "Latinoamérica", "Retratos de escritores que Darío admiraba."),
    (57955, "entremeses-cervantes", "Los entremeses", "Miguel de Cervantes", "1615", "Teatro", "yellow", "Universal", "Piezas breves: el retablo, el juez de los divorcios."),
    (73486, "corazon", "Corazón", "Edmondo De Amicis", "1886", "Educativo", "red", "Universal", "Diario de un niño: escuela, patria y piedad."),
    (70984, "orillas-del-sar", "En las orillas del Sar", "Rosalía de Castro", "1884", "Poesía", "green", "Universal", "Último libro en castellano de Rosalía."),
    (62691, "el-criticon-1", "El criticón (tomo I)", "Baltasar Gracián", "1651", "Clásico", "brown", "Universal", "Alegoría barroca: Andrenio y Critilo."),
    (57303, "divina-comedia-es", "La Divina Comedia", "Dante Alighieri", "1320", "Poesía", "red", "Universal", "Infierno, Purgatorio y Paraíso en español."),
    (64775, "lusiadas-es", "Los Lusíadas", "Luís de Camões", "1572", "Poesía", "blue", "Universal", "La epopeya portuguesa en castellano."),
    (66591, "asno-de-oro", "El asno de oro", "Apuleyo", "s. II", "Novela", "copper", "Universal", "Lucio, la magia y el asno."),
    (21143, "fabulas-esopo-1", "Fábulas de Esopo (I)", "Esopo", "Antigüedad", "Cuentos", "green", "Universal", "Fábulas clásicas en español."),
    (63509, "edipo-rey", "Edipo rey; Edipo en Colona; Antígona", "Sófocles", "s. V a.C.", "Teatro", "navy", "Universal", "Tebas: culpa, exilio y Antígona."),
    (68443, "aristofanes-1", "Comedias (I)", "Aristófanes", "s. V a.C.", "Teatro", "yellow", "Universal", "Los Acarnienses, los Caballeros, las Nubes."),
    (20011, "pequeneces", "Pequeñeces", "Luis Coloma", "1891", "Novela", "pink", "Universal", "La sociedad madrileña vista por un jesuita."),
    (28929, "el-criterio", "El criterio", "Jaime Balmes", "1845", "Ensayo", "purple", "Universal", "Cómo pensar con orden, según Balmes."),
    (67481, "valores-literarios", "Los valores literarios", "Azorín", "1913", "Ensayo", "navy", "Universal", "Crítica y paisaje de la literatura española."),
    (76793, "marcela", "Marcela, o ¿a cuál de los tres?", "Manuel Bretón de los Herreros", "1831", "Teatro", "yellow", "Universal", "Comedia de enredos y pretendientes."),
    (77235, "muerete-y-veras", "Muérete ¡y verás...!", "Manuel Bretón de los Herreros", "1837", "Teatro", "green", "Universal", "Farsa sobre la fama póstuma."),
    (25807, "poemas-dario", "Poemas", "Rubén Darío", "s. XIX–XX", "Poesía", "blue", "Latinoamérica", "Selección poética de Darío."),
    (41575, "juvenilla", "Juvenilla", "Miguel Cané", "1884", "Ensayo", "brown", "Latinoamérica", "El colegio y la juventud porteña."),
]


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def quality_ok(text: str) -> bool:
    if len(text) < 4000:
        return False
    if text.count("\ufffd") > 20:
        return False
    accents = len(re.findall(r"[áéíóúñÁÉÍÓÚÑ]", text))
    return accents >= 20


def main() -> None:
    TEXTOS.mkdir(exist_ok=True)
    src = CATALOG.read_text(encoding="utf-8")
    existing = set(re.findall(r"id:'([^']+)'", src))
    extras = []
    ok = fail = skip = 0
    for gid, slug, title, author, year, genre, color, place, desc in LOTE:
        if slug in existing:
            print(f"skip catalog {slug}")
            skip += 1
            continue
        path = TEXTOS / f"{slug}.txt"
        print(f"→ {gid} {title}")
        if path.exists() and path.stat().st_size > 4000:
            clean = path.read_text(encoding="utf-8", errors="replace")
            print("  file exists")
        else:
            raw = imp.gutenberg_text(gid)
            if not raw:
                print("  FAIL download")
                fail += 1
                continue
            clean = imp.clean_gutenberg(raw)
            if not quality_ok(clean):
                print(f"  FAIL quality len={len(clean)} fffd={clean.count(chr(0xfffd))}")
                fail += 1
                continue
            path.write_text(clean, encoding="utf-8")
            print(f"  OK {path.stat().st_size // 1024}KB")
            time.sleep(0.35)
        extras.append(
            " {"
            f" id:'{slug}', title:'{js_escape(title)}', author:'{js_escape(author)}',"
            f" type:'{genre}', genre:'{genre}', place:'{place}', color:'{color}',"
            f" year:'{year}', hasText:true, license:'Dominio público',"
            f" source:'Project Gutenberg #{gid}', desc:'{js_escape(desc)}', lang:'es' "
            "},"
        )
        existing.add(slug)
        ok += 1

    if extras:
        src = src.replace("];\nconst CATALOG_STATS", "\n".join(extras) + "\n];\nconst CATALOG_STATS")
    ids = re.findall(r"id:'([^']+)'", src)
    readable = len(re.findall(r"hasText:true", src))
    chile = len(re.findall(r"place:'Chile'", src))
    oer = len(re.findall(r"license:'CC BY 4.0'", src))
    src = re.sub(
        r"const CATALOG_STATS = \{[^}]+\};",
        f"const CATALOG_STATS = {{ total: {len(ids)}, readable: {readable}, chile: {chile}, oer: {oer} }};",
        src,
    )
    CATALOG.write_text(src, encoding="utf-8")
    print(f"\nOK {ok}  skip {skip}  fail {fail}  cat {len(ids)}/{readable}")


if __name__ == "__main__":
    main()
