# 301 de borde — etemen.cl

Render no aplica `_redirects` si el HTML del path existe.
`/umbral/`, `/nexus/`, `/minimarket/` y `/bodega/` tienen meta refresh de respaldo.

## Qué hay hoy (2026-08-15)

El Worker `etemen-contacto` tiene rutas `etemen.cl/{umbral,nexus,minimarket,bodega}*` y responde **301**.
Por O2O con Render esas rutas **no disparan en el apex** (`etemen.cl/...` sigue en 200).
En `www.etemen.cl/umbral/` el 301 **sí** llega a `/hojear/`.

El OAuth de Wrangler solo tiene `zone:read`. No puede crear Single Redirects ni Page Rules.

## Falta en el dashboard (2 min)

[dash.cloudflare.com](https://dash.cloudflare.com) → zona `etemen.cl` → **Rules → Redirect Rules → Create rule**.

Cuatro reglas, 301, “Preserve query string” apagado:

| Si el path | Entonces ir a |
|------------|----------------|
| empieza con `/umbral` | `https://etemen.cl/hojear/` |
| empieza con `/nexus` | `https://etemen.cl/nexo/` |
| empieza con `/minimarket` | `https://etemen.cl/nexo/minimarkets/` |
| empieza con `/bodega` | `https://etemen.cl/nexo/` |

Después: purge cache. `curl -I https://etemen.cl/umbral/` debe ser **301**, no 200.
