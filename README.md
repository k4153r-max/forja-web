# ETEMEN Web

> **Cerebro maestro (toda la operación ETEMEN / Nexo):**  
> `C:\Users\Antonio\Desktop\FORJA_CEREBRO.md` — leer y actualizar al cerrar trabajo.

Sitio principal del holding **ETEMEN Studio** y del producto **Nexo**.

- **No** es el sistema operativo del salón (eso es `nexus` app).
- **No** toca `salon-ysabel` / Ysabel Aragón NW.

## Marca

- Holding: **ETEMEN** (del *Etemenanki*: «la casa del fundamento del cielo y la tierra»)
- Lema: *Fundamento sólido. Productos extraordinarios.*
- Nav tagline: **Fundamento** (no “Estudio”)
- Design system: `css/main.css` v5 “Ziggurat”
- Logo: `assets/logos/etemen-mark*.svg` + lockups · ver `assets/logos/BRAND.md`

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

```bash
python -m http.server 5500
# o
npx serve .
```

Abre http://localhost:5500

## Deploy (Render Free)

1. Repo GitHub `k4153r-max/forja-web`
2. Render → **Static Site** · publish directory `.`
3. O Blueprint `render.yaml`

## Configurar después

- [ ] Correo real en `contacto/index.html` (`hola@etemen.cl`)
- [ ] Dominio `etemen.cl` / `etemen.studio`
- [ ] OG image propia con el monograma nuevo
