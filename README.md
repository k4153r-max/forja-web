# Forja Web

Sitio principal del holding **Forja** y del producto **Nexo**.

- **No** es el sistema operativo del salón (eso es `nexus` app).
- **No** toca `salon-ysabel` / Ysabel Aragón NW.

## Estructura

```
forja-web/
  index.html        → Forja (home)
  nexus/index.html  → Landing Nexo
  contacto/         → Contacto
  css/main.css
  js/main.js
  assets/
```

## Local

Cualquier servidor estático en la raíz del proyecto:

```bash
# Python
python -m http.server 5500

# o con npx
npx serve .
```

Abre http://localhost:5500

## Deploy (Render Free)

1. Sube este repo a GitHub (ej. `k4153r-max/forja-web`).
2. Render → **New Static Site** → conecta el repo.
3. Publish directory: `.` (raíz)
4. Plan: Free

O usa el `render.yaml` con Blueprint.

## Configurar después

- [ ] Correo real en `contacto/index.html` (`data-mailto` y texto `hola@forja.cl`)
- [ ] Dominio `forja.cl` / `usenexo.cl` cuando existan
- [ ] Precios definitivos en `/nexus/`
- [ ] OG image propia
