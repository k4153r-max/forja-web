# 301 de borde — etemen.cl

Render no aplica `_redirects` si el HTML del path existe.
`/umbral/`, `/nexus/`, `/minimarket/` y `/bodega/` se quedan como red de seguridad (meta refresh).

Crear **Cloudflare Bulk Redirects** (o Redirect Rules) en la zona `etemen.cl`:

| Origen | Destino | Código |
|--------|---------|--------|
| `https://etemen.cl/umbral` | `https://etemen.cl/hojear/` | 301 |
| `https://etemen.cl/umbral/` | `https://etemen.cl/hojear/` | 301 |
| `https://etemen.cl/nexus` | `https://etemen.cl/nexo/` | 301 |
| `https://etemen.cl/nexus/` | `https://etemen.cl/nexo/` | 301 |
| `https://etemen.cl/minimarket` | `https://etemen.cl/nexo/minimarkets/` | 301 |
| `https://etemen.cl/minimarket/` | `https://etemen.cl/nexo/minimarkets/` | 301 |
| `https://etemen.cl/bodega` | `https://etemen.cl/nexo/` | 301 |
| `https://etemen.cl/bodega/` | `https://etemen.cl/nexo/` | 301 |

Después: purge cache y `curl -I` debe devolver 301 desde el borde.
