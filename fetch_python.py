import urllib.request
import sys

url = "https://www.gutenberg.org/files/58221/58221-0.txt"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
try:
    with urllib.request.urlopen(req, timeout=15) as response:
        html = response.read()
        with open("biblioteca/libros/odisea-es.txt", "wb") as f:
            f.write(html)
        print("Success")
except Exception as e:
    print("Error:", e)
