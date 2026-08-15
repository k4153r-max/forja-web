# Scripts Hojear

## `import-gutenberg.ps1`

Importa ebooks en **español** de [Project Gutenberg](https://www.gutenberg.org/browse/languages/es) a `biblioteca/textos/`.

```powershell
cd biblioteca/scripts

# Por género (Novela, Poesia, Teatro, Educativo, Historia, Chile, …)
.\import-gutenberg.ps1 -Genre Educativo -Limit 10

# Por IDs Gutenberg concretos
.\import-gutenberg.ps1 -Ids 14765,15066,2000

# Solo listar sin descargar
.\import-gutenberg.ps1 -Genre Poesia -Limit 20 -DryRun

# Sobrescribir TXT existentes
.\import-gutenberg.ps1 -Ids 2000 -Force
```

Genera `_import-manifest.json` y un fragmento JS para revisar metadatos.

## `import-gutenberg-multi.py`

Lote curado multilingual (ES ya estaba; añade EN, FR, DE, IT, PT, LA).

```powershell
python .\import-gutenberg-multi.py
python .\fix-wrong-imports.py   # solo si un ID de Gutenberg salió equivocado
python .\patch-catalog.py
```

Cada ficha lleva `lang:'es'|'en'|'fr'|'de'|'it'|'pt'|'la'`. El catálogo filtra por idioma.

## Fuentes usadas en el catálogo

| Origen | Uso |
|--------|-----|
| Project Gutenberg ES | Clásicos, ensayo, historia, filosofía |
| Internet Archive (DP) | *Sub terra*, *Sub sole*, *Martín Rivas* |
| Hojear OER CC BY 4.0 | Guías de estudio (`oer-*.txt`) |
| Buscalibre (afiliados) | Botón “Comprar” en fichas — ediciones físicas/modernas |

## Afiliado Buscalibre

1. Regístrate: https://www.buscalibre.cl/afiliados  
2. Cuando te aprueben, en la app (consola del navegador o config):
   ```js
   localStorage.setItem('hojear-bc-aff', 'TU_ID_O_CODIGO')
   ```
3. Los enlaces usan `https://www.buscalibre.cl/libros/search?q=...&afiliado=...`  
   Si Buscalibre te da un formato de URL distinto, actualiza `buyUrl()` en `app.js`.

## Regenerar `catalog.js`

Tras añadir TXT nuevos, regenera el catálogo con el generador de sesión o actualiza entradas a mano en `catalog.js` (cargado antes de `app.js`).
