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

## Fuentes usadas en el catálogo

| Origen | Uso |
|--------|-----|
| Project Gutenberg ES | Clásicos, ensayo, historia, filosofía |
| Internet Archive (DP) | *Sub terra*, *Sub sole*, *Martín Rivas* |
| Hojear OER CC BY 4.0 | Guías de estudio (`oer-*.txt`) |

## Regenerar `catalog.js`

Tras añadir TXT nuevos, regenera el catálogo con el generador de sesión o actualiza entradas a mano en `catalog.js` (cargado antes de `app.js`).
