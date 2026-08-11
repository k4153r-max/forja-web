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
- Design system: `css/main-v7.css` “Etemenanki / Fundamento”
- Logo: `assets/logos/etemen-mark*.svg` + lockups · ver `assets/logos/BRAND.md`
- Trial Nexo: **3 días** (unificado en home, nexo, demos y contacto)

## Estructura

```
forja-web/
  index.html           → ETEMEN (home)
  nexo/                → Landing Nexo
  hojear/              → Landing Hojear
  biblioteca/          → App Hojear (lector)
  demos/               → Hub + micrositios por rubro
  contacto/            → Contacto
  portafolio/          → Portafolio
  css/main-v7.css · demos.css
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

- [x] Correo `hola@etemen.cl` en contacto
- [x] Dominio `etemen.cl`
- [ ] OG image dedicada por producto (hoy: logo ETEMEN / nexo-icon)
- [ ] Backend de formulario (hoy: mailto + fallback)
