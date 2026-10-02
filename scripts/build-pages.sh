#!/usr/bin/env bash
# Build para Cloudflare Pages: copia el sitio estático a dist/ sin archivos internos.
# Uso: bash scripts/build-pages.sh   (Pages: build command = este script, output = dist)
# No hay framework ni build real; solo se filtra lo que NO debe publicarse
# (CLAUDE.md, docs, código del Worker, scripts, etc.).
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=dist
rm -rf "$OUT"
mkdir -p "$OUT"

tar -cf - \
  --exclude="./$OUT" \
  --exclude=./.git \
  --exclude=./.github \
  --exclude=./.gitignore \
  --exclude=./.wrangler \
  --exclude='*/.wrangler' \
  --exclude=./node_modules \
  --exclude=./api \
  --exclude=./keepalive \
  --exclude=./docs \
  --exclude=./scripts \
  --exclude=./biblioteca/scripts \
  --exclude=./render.yaml \
  --exclude=./fetch_python.py \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='*.md' \
  . | tar -xf - -C "$OUT"

# Sanity checks: los archivos internos no deben quedar publicados.
for f in CLAUDE.md render.yaml api docs keepalive; do
  if [ -e "$OUT/$f" ]; then echo "ERROR: $f quedó en $OUT" >&2; exit 1; fi
done
for f in index.html _headers 404.html; do
  if [ ! -e "$OUT/$f" ]; then echo "ERROR: falta $OUT/$f" >&2; exit 1; fi
done

echo "OK: $(find "$OUT" -type f | wc -l) archivos en $OUT/ ($(du -sh "$OUT" | cut -f1))"
