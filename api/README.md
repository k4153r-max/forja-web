# API ETEMEN — Cloudflare Worker + D1

El sitio sigue estático en Render. Este Worker intercepta `/api/contacto` y `/api/visita` **antes** del origen.

## Visitas

Host del Worker: `https://api.etemen.cl` (Custom Domain). El apex `/api/*` no intercepta por O2O con Render.

- `POST https://api.etemen.cl/api/visita` — suma 1 (sin IP en claro; un hash por día).
- `GET https://api.etemen.cl/api/visita` — `{ total, hoy, unicos_hoy }`
- `GET https://api.etemen.cl/api/visita?libro=lazarillo` — lecturas / escuchas
- `GET https://api.etemen.cl/api/visita?resumen=1` — páginas y libros
- Panel: `https://etemen.cl/visitas/` (noindex)

No se cuentan bots evidentes. El mismo visitante no suma de nuevo la misma página en la misma sesión.

## Nunca

- No crear un **Custom Domain** del Worker sobre `etemen.cl`. Eso reemplaza el sitio entero.
- Usar solo `routes` en `wrangler.toml`.
- DNS de `etemen.cl` y `www` en **nube naranja**.

## Alta

```bash
cd api
npx wrangler d1 create etemen-contactos
# pegar database_id en wrangler.toml
npx wrangler d1 execute etemen-contactos --file=schema.sql --remote
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put IP_SALT
npx wrangler deploy
```

## Local

```bash
npx wrangler d1 execute etemen-contactos --file=schema.sql --local
npx wrangler dev --port 8787
```

El form en producción usa `https://api.etemen.cl/api/contacto`.
Para local, añade `data-api="http://127.0.0.1:8787/api/contacto"` al `<form>`.

`GET /api/contacto/health` debe devolver `{ ok: true, db: true }` antes de depender del form.
Si el Worker no está desplegado, el HTML muestra el fallback a hola@etemen.cl.

## Aviso por correo

Cada envío válido se guarda en D1 y se manda a Gmail con `EMAIL` (Email Routing).
`hola@etemen.cl` también reenvía a ese destino. Reply-To = correo del visitante.

El acuse al visitante va por **FormSubmit** (gratis, sin Workers Paid):
después de guardar en D1, el form hace POST nativo a `formsubmit.co/hola@etemen.cl`
con `_autoresponse` ETEMEN y vuelve a `/contacto/?enviado=1`.

La primera vez hay que activar el form: FormSubmit manda un link a `hola@etemen.cl` (cae en Gmail). Un clic y queda.
