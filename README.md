# ETEMEN Web (ex-Forja Web)

> **Cerebro maestro (toda la operación ETEMEN/Nexo):**  
> `C:\Users\Antonio\Desktop\FORJA_CEREBRO.md` — leer y actualizar al cerrar trabajo.

Sitio principal del holding **ETEMEN Studio** y del producto **Nexo**.

- **No** es el sistema operativo del salón (eso es `nexus` app).
- **No** toca `salon-ysabel` / Ysabel Aragón NW.

## Estructura

```
forja-web/
  index.html           → ETEMEN Studio (home)
  nexus/index.html     → Landing Nexo
  demos/               → Hub + webs de prueba de salones
    luna/ atelier/ aura/
  contacto/            → Contacto
  css/main.css · demos.css
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

- [ ] Correo real en `contacto/index.html` (`data-mailto` y texto `hola@etemen.cl`)
- [ ] Dominio `etemen.cl` / `etemen.studio` cuando existan
- [ ] Precios definitivos en `/nexus/`
- [ ] OG image propia

