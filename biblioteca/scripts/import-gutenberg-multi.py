# -*- coding: utf-8 -*-
"""Importa textos de dominio público de Project Gutenberg (varios idiomas)."""
from __future__ import annotations

import csv
import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXTOS = ROOT / "libros"
CATALOG = ROOT / "catalog.js"
CACHE = Path.home() / "AppData" / "Local" / "Temp" / "pg_catalog.csv"
UA = "HojearImport/1.1 (+https://etemen.cl; hola@etemen.cl; educational library)"

# id, slug, title, author, year, genre, color, lang, desc
CURATED = [
    # English
    (1342, "pride-prejudice", "Pride and Prejudice", "Jane Austen", "1813", "Novela", "pink", "en", "Wit, class and marriage in Regency England."),
    (84, "frankenstein-en", "Frankenstein", "Mary Shelley", "1818", "Misterio", "navy", "en", "Science, creation and responsibility."),
    (345, "dracula-en", "Dracula", "Bram Stoker", "1897", "Misterio", "navy", "en", "The original English epistolary novel."),
    (11, "alice-wonderland", "Alice's Adventures in Wonderland", "Lewis Carroll", "1865", "Aventura", "yellow", "en", "A dream logic classic."),
    (12, "looking-glass", "Through the Looking-Glass", "Lewis Carroll", "1871", "Aventura", "yellow", "en", "The sequel to Wonderland."),
    (1661, "sherlock-holmes", "The Adventures of Sherlock Holmes", "Arthur Conan Doyle", "1892", "Misterio", "navy", "en", "Twelve cases of Holmes and Watson."),
    (2701, "moby-dick", "Moby-Dick", "Herman Melville", "1851", "Novela", "blue", "en", "Obsession and the white whale."),
    (1260, "jane-eyre", "Jane Eyre", "Charlotte Brontë", "1847", "Novela", "purple", "en", "A governess, a secret, a voice."),
    (768, "wuthering-heights", "Wuthering Heights", "Emily Brontë", "1847", "Novela", "brown", "en", "Love and storm on the moors."),
    (174, "dorian-gray", "The Picture of Dorian Gray", "Oscar Wilde", "1890", "Novela", "purple", "en", "Beauty, portrait and decay."),
    (120, "treasure-island-en", "Treasure Island", "R. L. Stevenson", "1883", "Aventura", "green", "en", "Map, mutiny and buried gold."),
    (43, "jekyll-hyde-en", "Strange Case of Dr Jekyll and Mr Hyde", "R. L. Stevenson", "1886", "Misterio", "navy", "en", "The double life, in English."),
    (46, "christmas-carol", "A Christmas Carol", "Charles Dickens", "1843", "Cuentos", "red", "en", "Scrooge and the three spirits."),
    (98, "tale-two-cities", "A Tale of Two Cities", "Charles Dickens", "1859", "Novela", "red", "en", "London, Paris, revolution."),
    (1400, "great-expectations", "Great Expectations", "Charles Dickens", "1861", "Novela", "brown", "en", "Pip, Magwitch and Estella."),
    (76, "huckleberry-finn", "Adventures of Huckleberry Finn", "Mark Twain", "1884", "Novela", "green", "en", "The river, the raft, the lie of society."),
    (74, "tom-sawyer", "The Adventures of Tom Sawyer", "Mark Twain", "1876", "Aventura", "yellow", "en", "Mississippi boyhood."),
    (55, "wizard-of-oz", "The Wonderful Wizard of Oz", "L. Frank Baum", "1900", "Aventura", "green", "en", "Kansas, the road, the Emerald City."),
    (36, "war-of-the-worlds", "The War of the Worlds", "H. G. Wells", "1898", "Misterio", "navy", "en", "Martian invasion."),
    (35, "time-machine", "The Time Machine", "H. G. Wells", "1895", "Misterio", "navy", "en", "The future, Eloi and Morlocks."),
    (219, "heart-of-darkness", "Heart of Darkness", "Joseph Conrad", "1899", "Novela", "navy", "en", "The river and the station."),
    (1952, "yellow-wallpaper", "The Yellow Wallpaper", "Charlotte Perkins Gilman", "1892", "Cuentos", "yellow", "en", "A short, sharp study of confinement."),
    (25344, "scarlet-letter", "The Scarlet Letter", "Nathaniel Hawthorne", "1850", "Novela", "red", "en", "Sin and community in Puritan New England."),
    (64317, "great-gatsby", "The Great Gatsby", "F. Scott Fitzgerald", "1925", "Novela", "yellow", "en", "Jazz Age desire. U.S. public domain since 2021."),
    (16, "peter-pan", "Peter Pan", "J. M. Barrie", "1911", "Aventura", "green", "en", "Neverland."),
    (135, "persuasion", "Persuasion", "Jane Austen", "1817", "Novela", "pink", "en", "Second chances."),
    (161, "sense-sensibility", "Sense and Sensibility", "Jane Austen", "1811", "Novela", "pink", "en", "Two sisters, two temperaments."),
    (844, "being-earnest", "The Importance of Being Earnest", "Oscar Wilde", "1895", "Teatro", "yellow", "en", "A trivial comedy for serious people."),
    (829, "gulliver", "Gulliver's Travels", "Jonathan Swift", "1726", "Aventura", "blue", "en", "Satire in four voyages."),
    (205, "walden", "Walden", "Henry David Thoreau", "1854", "Ensayo", "green", "en", "A year by the pond."),
    (23, "douglass-narrative", "Narrative of the Life of Frederick Douglass", "Frederick Douglass", "1845", "Historia", "brown", "en", "An American slave, written by himself."),
    (5200, "metamorphosis-en", "Metamorphosis", "Franz Kafka", "1915", "Novela", "navy", "en", "Gregor Samsa wakes changed."),
    (1184, "monte-cristo-en", "The Count of Monte Cristo", "Alexandre Dumas", "1844", "Aventura", "red", "en", "Prison, treasure, return."),
    (996, "quixote-en", "Don Quixote", "Miguel de Cervantes", "1605", "Clásico", "yellow", "en", "Ormsby English translation."),
    (6130, "iliad-en", "The Iliad", "Homer", "Antigüedad", "Poesía", "copper", "en", "Wrath of Achilles. Butler translation."),
    (1727, "odyssey-en", "The Odyssey", "Homer", "Antigüedad", "Poesía", "blue", "en", "The long way home. Butler translation."),
    (1497, "republic-plato", "The Republic", "Plato", "Antigüedad", "Ensayo", "purple", "en", "Justice, the city, the cave."),
    (514, "little-women", "Little Women", "Louisa May Alcott", "1868", "Novela", "pink", "en", "The March sisters."),
    (2591, "grimm-fairy-tales", "Grimm's Fairy Tales", "Jacob and Wilhelm Grimm", "1812", "Cuentos", "green", "en", "English telling of the Kinder- und Hausmärchen."),
    (2814, "dubliners", "Dubliners", "James Joyce", "1914", "Cuentos", "green", "en", "Fifteen stories of Dublin."),
    # French
    (4650, "candide-fr", "Candide", "Voltaire", "1759", "Novela", "yellow", "fr", "Conte philosophique."),
    (14155, "madame-bovary", "Madame Bovary", "Gustave Flaubert", "1857", "Novela", "pink", "fr", "Emma Bovary et le désir provincial."),
    (17989, "notre-dame", "Notre-Dame de Paris", "Victor Hugo", "1831", "Novela", "brown", "fr", "Quasimodo, Esmeralda, la cathédrale."),
    (17489, "miserables-1", "Les Misérables (Tome I)", "Victor Hugo", "1862", "Novela", "navy", "fr", "Jean Valjean. Premier tome."),
    (1250, "monte-cristo-fr", "Le Comte de Monte-Cristo", "Alexandre Dumas", "1844", "Aventura", "red", "fr", "Le château d'If et la vengeance."),
    (799, "trois-mousquetaires", "Les Trois Mousquetaires", "Alexandre Dumas", "1844", "Aventura", "blue", "fr", "D'Artagnan et les mousquetaires."),
    (2419, "pere-goriot", "Le Père Goriot", "Honoré de Balzac", "1835", "Novela", "brown", "fr", "Paris, pension Vauquer."),
    (14287, "voyage-centre-terre", "Voyage au centre de la Terre", "Jules Verne", "1864", "Aventura", "green", "fr", "Lidenbrock, Axel, le cratère."),
    (5097, "vingt-mille-lieues", "Vingt mille lieues sous les mers", "Jules Verne", "1870", "Aventura", "blue", "fr", "Le Nautilus."),
    # German
    (2229, "faust-de", "Faust", "Johann Wolfgang von Goethe", "1808", "Teatro", "navy", "de", "Der Tragödie erster Teil."),
    (4367, "verwandlung-de", "Die Verwandlung", "Franz Kafka", "1915", "Novela", "navy", "de", "Gregor Samsa."),
    (2407, "leiden-werther", "Die Leiden des jungen Werther", "Johann Wolfgang von Goethe", "1774", "Novela", "pink", "de", "Briefe eines unglücklichen Liebenden."),
    (6079, "nathan-weise", "Nathan der Weise", "Gotthold Ephraim Lessing", "1779", "Teatro", "yellow", "de", "Parabel der Ringe."),
    (21000, "zarathustra", "Also sprach Zarathustra", "Friedrich Nietzsche", "1883", "Ensayo", "purple", "de", "Ein Buch für Alle und Keinen."),
    # Italian
    (1012, "divina-commedia", "La Divina Commedia", "Dante Alighieri", "1320", "Poesía", "red", "it", "Inferno, Purgatorio, Paradiso."),
    (500, "pinocchio", "Le avventure di Pinocchio", "Carlo Collodi", "1883", "Aventura", "yellow", "it", "Il burattino."),
    (35155, "promessi-sposi", "I Promessi Sposi", "Alessandro Manzoni", "1827", "Novela", "brown", "it", "Renzo e Lucia."),
    (47332, "decameron", "Decameron", "Giovanni Boccaccio", "1353", "Cuentos", "copper", "it", "Cento novelle."),
    # Portuguese
    (3333, "lusiadas", "Os Lusíadas", "Luís de Camões", "1572", "Poesía", "blue", "pt", "A epopeia portuguesa."),
    (55752, "dom-casmurro", "Dom Casmurro", "Machado de Assis", "1899", "Novela", "navy", "pt", "Bentinho, Capitu, o ciúme."),
    (54829, "memorias-bras-cubas", "Memórias Póstumas de Brás Cubas", "Machado de Assis", "1881", "Novela", "brown", "pt", "Um defunto autor."),
    (55682, "alienista", "O Alienista", "Machado de Assis", "1882", "Novela", "green", "pt", "A Casa Verde."),
    # Latin
    (10657, "bello-gallico", "Commentarii de Bello Gallico", "Gaius Iulius Caesar", "s. I a.C.", "Historia", "red", "la", "De bello Gallico."),
    (227, "aeneid-la", "Aeneis", "P. Vergilius Maro", "s. I a.C.", "Poesía", "copper", "la", "Arma virumque cano."),
    (1974, "metamorphoses-ovid", "Metamorphoseon libri", "P. Ovidius Naso", "8 d.C.", "Poesía", "purple", "la", "Mutatas dicere formas."),
]


def fetch(url: str, timeout: int = 90) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            if r.status == 200:
                return r.read()
    except Exception:
        return None
    return None


def gutenberg_text(gid: int) -> str | None:
    urls = [
        f"https://www.gutenberg.org/files/{gid}/{gid}-0.txt",
        f"https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt",
        f"https://www.gutenberg.org/files/{gid}/{gid}-8.txt",
        f"https://www.gutenberg.org/ebooks/{gid}.txt.utf-8",
    ]
    for u in urls:
        raw = fetch(u)
        if raw and len(raw) > 4000:
            for enc in ("utf-8-sig", "utf-8", "latin-1"):
                try:
                    return raw.decode(enc)
                except UnicodeDecodeError:
                    continue
    return None


def clean_gutenberg(text: str) -> str:
    start = re.search(r"(?m)^\*\*\* START OF (THIS|THE) PROJECT GUTENBERG EBOOK.*$", text)
    if start:
        text = text[start.end() :]
    end = re.search(r"(?m)^\*\*\* END OF (THIS|THE) PROJECT GUTENBERG EBOOK.*$", text)
    if end:
        text = text[: end.start()]
    return text.replace("\r\n", "\n").strip()


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def add_lang_to_existing(src: str) -> str:
    def repl(m):
        body = m.group(0)
        if re.search(r"\blang:'", body):
            return body
        return body[:-2] + ", lang:'es' }"

    return re.sub(r"\{ id:'[^']+'.*?\n?.*?\}", repl, src, flags=re.S)


def main() -> None:
    TEXTOS.mkdir(exist_ok=True)
    imported = []
    for gid, slug, title, author, year, genre, color, lang, desc in CURATED:
        path = TEXTOS / f"{slug}.txt"
        print(f"→ [{lang}] {gid} {title}")
        if path.exists() and path.stat().st_size > 4000:
            print("  exists")
            imported.append((slug, title, author, year, genre, color, lang, desc, gid, True))
            continue
        raw = gutenberg_text(gid)
        if not raw:
            print("  FAIL download")
            continue
        clean = clean_gutenberg(raw)
        if len(clean) < 6000:
            print(f"  FAIL short ({len(clean)})")
            continue
        path.write_text(clean, encoding="utf-8")
        print(f"  OK {path.stat().st_size // 1024}KB")
        imported.append((slug, title, author, year, genre, color, lang, desc, gid, True))
        time.sleep(0.35)

    src = CATALOG.read_text(encoding="utf-8")
    src = add_lang_to_existing(src)

    existing_ids = set(re.findall(r"id:'([^']+)'", src))
    extras = []
    for slug, title, author, year, genre, color, lang, desc, gid, ok in imported:
        if slug in existing_ids:
            continue
        extras.append(
            " {"
            f" id:'{slug}', title:'{js_escape(title)}', author:'{js_escape(author)}',"
            f" type:'{genre}', genre:'{genre}', place:'Universal', color:'{color}',"
            f" year:'{year}', hasText:true, license:'Dominio público',"
            f" source:'Project Gutenberg #{gid}', desc:'{js_escape(desc)}', lang:'{lang}' "
            "},"
        )
    if extras:
        src = src.replace("];\nconst CATALOG_STATS", ",\n".join(extras) + "\n];\nconst CATALOG_STATS")

    # recount
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
    print(f"\nCatálogo: {len(ids)} fichas / {readable} textos. Nuevos: {len(extras)}")
    (TEXTOS / "_lote-multi-manifest.json").write_text(
        json.dumps(
            [{"id": x[0], "lang": x[6], "gutenberg": x[8]} for x in imported],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
