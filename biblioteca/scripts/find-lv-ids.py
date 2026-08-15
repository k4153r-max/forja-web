# -*- coding: utf-8 -*-
import re
import urllib.request

PAGES = {
    "frankenstein": "https://librivox.org/frankenstein-el-moderno-prometeo-by-mary-wollstonecraft-shelley/",
    "martin-fierro": "https://librivox.org/el-gaucho-martin-fierro-by-jose-hernandez/",
    "corazon": "https://librivox.org/cuore-by-edmondo-de-amicis/",
    "pepita-jimenez": "https://librivox.org/search?search_form=advanced&title=Pepita&language=6",
}

def main():
    for hid, url in PAGES.items():
        req = urllib.request.Request(url, headers={"User-Agent": "Hojear/1.0"})
        try:
            html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
        except Exception as e:
            print(hid, "ERR", e)
            continue
        ids = sorted(set(re.findall(r"/rss/(\d+)", html)))
        lang = re.search(r"Language:\s*</[^>]+>\s*([^<\n]+)", html)
        print(hid, "rss", ids, "lang", lang.group(1).strip() if lang else "?")

if __name__ == "__main__":
    main()
