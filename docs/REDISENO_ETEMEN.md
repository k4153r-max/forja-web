# ETEMEN — Rediseño de producto, marca, UX y SEO

| Campo | Valor |
|-------|--------|
| **Documento** | Design System + IA + Copy + SEO + Formulario + Plan de implementación |
| **Autor** | Antonio / ETEMEN |
| **Fecha** | 2026-08-14 |
| **Estado** | Aprobado para implementar PR1–PR7 (rev. decisiones finales) |
| **Repo** | `C:\Users\Antonio\Desktop\Proyectos\forja-web` · `k4153r-max/forja-web` |
| **Sitio** | https://etemen.cl/ · Render static `srv-d9ifoibeo5us739sr680` · Cloudflare delante |
| **CSS hoy / destino** | `css/main-v7.css` → `css/main-v8.css` |
| **Fuera** | `salon-ysabel` · app `/biblioteca/` (salvo consistencia de marca) |
| **Copia en sync** | `C:\Users\Antonio\AppData\Local\Temp\grok-Antonio\grok-design-doc-f1ee7ede.md` |

---

## Overview

Holding ETEMEN opera Nexo, indago y Hojear. El sitio estático parece SaaS (Syne/Jakarta, glow, radios 8–14). Contacto = mailto. Este spec permite reconstruir etemen.cl: brutalismo arquitectónico (Cimientos), Nexo al centro, 6 verticales SEO, form a D1, 301s de borde.

Bloques pegables (URLs, tokens, fonts, RUBROS, panel, D1, wrangler, form): **## Apéndice A — Bloques de implementación**. Este archivo es la única fuente de verdad.

**Mandato de implementación:** ejecutar **PR1–PR7 ahora** (no es un stop de diseño). Este turno solo actualiza markdown; el código va en PRs siguientes.

---

## Background (hechos)

- Home: “+6 meses”, UPTIME 99.98% no verificado, mailto, no `#flujo`.
- Hub Nexo vivo: `#categorias` (`nexo/index.html` L112, L120). **`#flujo` no existe hasta PR3.**
- Hojear: “20 títulos”, Frankenstein `hasText:false`, “Pago seguro”, Offer JSON-LD 3990.
- Catálogo: 122 fichas / 117 textos (`catalog.js`).
- Legado `/umbral/` `/nexus/` `/minimarket/` `/bodega/` = 200 + JS. Render no aplica `_redirects` si el archivo existe.
- Trial público 3 días. `PRECIOS.md` aún dice 14 (no tocar ese repo).

---

## Goals & Non-Goals

Goals: operador (no agencia); Nexo prominente; 6 verticales; portafolio = cases (**Ysabel, indago, La Parissiene**); Hojear “No solo leas. Entiende.”; Plus = waitlist $3.990; indago = infra (no en nav); `main-v8.css`; form D1 + success literal; 301 CF; ≤5 pasos al CTA; **ship PR1–PR7**.

Non-goals: no `biblioteca/` visual; no `salon-ysabel`; no cobro Plus (solo waitlist); no métricas inventadas; no anual Comercio $199.000; no uptime %; no Forja/competidores/voseo; no parentesco ni fiado de vecinos en el caso Parissiene.

---

## 1. Auditoría (síntesis)

UX/CRO: trust-bar edad, CTA genérico, form `name="email"`, portafolio = product cards. SEO: sitemap 2026-08-11 sin verticales. Mobile: nav 640 px. Consistencia: footers distintos.

### 1.7 Allowlist UI

| Ítem | UI |
|------|-----|
| 3 productos · +8.000 · +50 (no recontados) · trial 3 días · < 24 h · 48 h operativo · 24 h adaptar catálogo | Sí |
| Servicios $45.000 / setup $100.000 / anual $450.000 · Comercio $19.900 / setup desde $39.000 | Sí |
| Hojear 117/122 · Plus $3.990 **waitlist visible** | Sí |
| La Parissiene como caso piloto (sin $ de venta) | Sí — chip `PILOT` |
| 99.98% · +6 meses · operaciones · anual Comercio $199k · revenue/uptime Parissiene · PINs · parentesco · fiado de vecinos | **No** |

**Features vertical = solo hub §4.9.** Servicios: agenda, reservas web, señas/abonos, recordatorios, WhatsApp, caja, instancia. Taller +: OT, patente, km, estados. Comercio: POS, barras, tickets, fiado/cuentas, stock del día. **Stock ≠ Servicios/taller.**

---

## 2. IA

Sitemap: `/` `/nexo/` + 6 rubros `/hojear/` `/indago/` (PR4) `/portafolio/` + **3 cases** (ysabel, indago, **la-parissiene**) `/contacto/` `/biblioteca/` `/demos/` (noindex). 301 CF: `/umbral/`→`/hojear/`, `/nexus/`→`/nexo/`, `/minimarket/`→`/nexo/minimarkets/`, `/bodega/`→`/nexo/`.

Nav: Inicio · Nexo · Hojear · Casos (`/portafolio/`) · Contacto. **Sin indago** (decisión final).

### 2.4 Footer por fase

PR2: indago → indago.cl; rubros → un link `/nexo/#categorias`.  
PR3: 6 hrefs `/nexo/{slug}/`.  
PR4: indago → `/indago/`.  
PR5: footer/casos pueden listar `/portafolio/la-parissiene/` (no antes).  
PR1 no toca HTML.

### 2.4.1 Home CTAs de rubro

| Superficie | PR2 | PR3 |
|------------|-----|------|
| Hero `Elige tu rubro` | `/nexo/#categorias` | flip → `/nexo/#flujo` |
| Card Nexo `Elegir rubro` | `/nexo/#categorias` | flip → `/nexo/#flujo` |
| §8.2 | `#categorias` | mismo flip en `index.html` |

PR3 incluye esos flips **en el mismo commit** que crea `#flujo`. PR2 QA: cero hashes a ids que el destino no tenga. Home no linkea `/portafolio/la-parissiene/` hasta PR5.

Home 8 bloques. Bloque 8 = deep-link `?producto=Nexo+Trial` (nunca form). Founder = paso 03 del bloque 5.

---

## 3. Wireframes

Home móvil: `Elige tu rubro` → `/nexo/#categorias` (PR2) / `/nexo/#flujo` (PR3). Contacto = banda, no form. Hub PR3: `#flujo` 6 botones + panel. Portafolio index (PR5): 3 cases — Ysabel, indago, La Parissiene (`PILOT`).

---

## 4. Copy

Tú, neutro, sin Forja.

### 4.2–4.3 Home

H1: `Construimos y operamos productos digitales que resuelven problemas reales.`  
CTA primario: `Elige tu rubro` → `#categorias` (PR2) → `#flujo` (PR3).  
CTA secundario: `/contacto/?producto=Nexo+Trial`.  
Chips: NEXO ONLINE · INDAGO OPERATIONAL · HOJEAR AVAILABLE.  
indago “Cómo está hecho” → **indago.cl hasta PR4**.  
Tras PR5, bloque casos puede añadir card Parissiene `PILOT` (href `/portafolio/la-parissiene/`). Hasta PR5: solo Ysabel live + indago.cl.

### 4.4 Métricas

`3` · `+8.000` · `+50` · `117` · `< 24 h` · `5 min`. **Sin uptime %.**

### 4.5 Cases (pegar)

**Ysabel — Problema.** El salón anotaba las horas a mano. Líos de horario; caja y aviso al celular no estaban con la agenda.  
**Solución.** Nexo Servicios, instancia propia. Reservas en línea, aviso al celular, caja y Mercado Pago, WhatsApp operativo.  
**Implementación.** Instancia Nexo Servicios. Web ysabelaragonnw.cl. MP + WA. **Ese deploy no se modifica desde forja-web.** Sin timeline inventado.  
**Resultados.** Agenda online, MP, WA, sitio live, testimonio verbatim (`index.html` L277–284). Cero %, facturación, n° clientas.  
**Demostración.** https://www.ysabelaragonnw.cl · demo `/demos/luna/` · trial `?producto=Nexo+Servicios&rubro=Sal%C3%B3n`.

**indago — Problema.** Comparar precios exige muchas tiendas; sin histórico no se ve si la oferta es real.  
**Solución.** Producto propio: captura, histórico, alertas. Superficie indago.cl; en etemen.cl = infraestructura.  
**Implementación.** Operado por ETEMEN. Scrapeo, alertas, blog, Telegram (hechos de `index.html`).  
**Resultados.** +8.000 · +50 · Telegram · live.  
**Demostración.** `https://www.indago.cl` **solamente.** PR5 no linkea `/indago/` salvo que PR4 ya esté en prod.

#### La Parissiene — `/portafolio/la-parissiene/` (PR5)

Eyebrow: `Caso · Nexo Comercio · Piloto`  
H1: `La Parissiene`  
Chip: `PILOT`  
Fuentes: `bodega/docs/PILOTO_LA_PARISSIENE.md`, `SETUP_LA_PARISSIENE.md`, `FORJA_CEREBRO.md` (2026-07-31).  
**Prohibido en UI:** parentesco; PINs; URL de login del piloto como “abrir el local”; datos o nombres de fiado; revenue; uptime; recuento de ventas u operaciones; anual $199.000.

**Problema.** Almacén / minimarket de barrio. El mostrador necesita caja, stock y fiado en un solo sistema. Antes del piloto existía una PWA local; no había instancia de servidor Nexo Comercio para ese local.

**Solución.** Nexo Comercio (caja, stock, fiado) en una instancia propia del local, con perfil de almacén. El catálogo del negocio se carga en esa instancia. Precio de la familia: $19.900/mes · setup desde $39.000. Trial de marketing público: 3 días (el piloto interno usó otra duración de trial; **no publicar esa fecha ni esa duración en la landing**).

**Implementación.** Instancia dedicada, `INSTANCE_PROFILE=parissiene`, nombre de local **La Parissiene**. Seed del catálogo desde la PWA del almacén (`productos-iniciales.json` → **39 productos**). Instancia desplegada (2026). **No publicar PINs ni el login del piloto** (riesgo de fiado de vecinos). `salon-ysabel` no se toca.

**Resultados.** Hechos, no cifras de negocio: piloto **validado en un almacén real** (2026); **un almacén real ya usó** Nexo Comercio; catálogo del piloto = **39 productos**. No hay en los docs un recuento público de ventas, días de uso continuo, uptime ni ingresos — **omitir**.

**Demostración.** El POS del piloto no se ofrece como demo pública. Demo de rubro (local de ejemplo, no es La Parissiene): `/demos/almacen/`. Trial: `/contacto/?producto=Nexo+Almacen&rubro=Minimarket`.

### 4.6–4.9

Cómo trabaja: 01 instancia · 02 operación 5 min · 03 quien construye responde.  
Tech: Python FastAPI SQLite-por-instancia Render Cloudflare UptimeRobot MP WhatsApp.  
Demos: luna/atelier/taller/almacen/ferreteria/botilleria + onrender (**Apéndice A §A.1**). Reserva pública solo Luna/Atelier (erz6). Cold start.  
Precios: Servicios $45k / setup $100k / anual **$450.000**. Comercio **$19.900/mes** / setup **desde $39.000**. **No publicar anual Comercio $199.000.** Keep: adaptar catálogos 24 h. Qué no es: marketplace, SII, indago.

### 4.10 Verticales (implementable)

FAQ común: (2) trial 3 días sin tarjeta; (3) 48 h según info del local; (4) instancia propia, datos no se mezclan.

**Salones.** Lead: horas a mano, inasistencias, caja aparte. $45k.  
Solución: agenda + reserva web + señas/abonos + recordatorios + WhatsApp + caja + instancia. 48 h.  
Features: Agenda por hora · Reservas web · Señas/abonos · Recordatorios y WhatsApp · Caja · Instancia.  
Demo `/demos/luna/`. Trial nexus-trial-demo. Reserva erz6. Sin JPG. Caso Ysabel (link case solo post-PR5).  
FAQ1: $45.000/mes, setup $100.000, anual $450.000, trial 3 días.  
CTA: `?producto=Nexo+Servicios&rubro=Sal%C3%B3n`

**Barberías.** Lead: sillones sin turno, walk-ins vs reserva, caja suelta. *(walk-in = problema, no feature)*  
Solución: agenda por sillón; cortes/fade/barba como servicios; reservas web; señas/abonos, recordatorios y WhatsApp; caja del día; instancia. **No** “motor walk-in”.  
Features: Agenda por sillón · Reservas web · Señas / abonos · Recordatorios y WhatsApp · Caja del día · Instancia.  
Demo `/demos/atelier/`. Sin JPG. Sin caso. CTA: `?producto=Nexo+Servicios&rubro=Barber%C3%ADa`

**Talleres.** Lead: OT en cuaderno, patente/km, sin tablero.  
Solución: OT con patente, km y estados. Tablero reemplaza cuaderno. Caja del local (familia Servicios). WhatsApp. Precio Servicios. **No es Comercio: no se promete stock de repuestos.**  
Features: OT con patente · Kilometraje · Estados de la OT · Caja del local · WhatsApp · Instancia.  
Demo `/demos/taller/`. App nexus-trial-taller. JPG `/assets/demos/taller.jpg`.  
CTA: `?producto=Nexo+Taller&rubro=Taller`

**Ferreterías.** Problemas: SKU, cuentas de maestro, stock ≠ caja.  
Solución: POS, barras, tickets, cuentas de maestro; stock del día; 24 h nombres.  
Features: POS · Barras · Tickets · Cuentas de maestro / fiado · Stock del día · Instancia $19.900.  
Demo `/demos/ferreteria/`. JPG `assets/demos/ferreteria.jpg`. App bodega-trial-ferreteria-demo.  
FAQ1: $19.900/mes, setup desde $39.000, trial 3 días. **Sin anual.**  
CTA: `?producto=Nexo+Ferreteria&rubro=Ferreter%C3%ADa`

**Minimarkets.** Fila, fiado, cierre a ojo. POS rápido, barras, tickets, fiado, cierre. Demo `/demos/almacen/` + `almacen.jpg`. App bodega-trial-almacen-demo.  
Caso (solo post-PR5): La Parissiene — chip `PILOT`, link `/portafolio/la-parissiene/`. Hasta PR5 no href al case.  
CTA: `?producto=Nexo+Almacen&rubro=Minimarket`

**Botillerías.** Alta rotación, combos, stock del día. POS + barras + tickets + catálogo alta rotación + stock. Demo `/demos/botilleria/` + `botilleria.jpg`. App bodega-trial-botilleria-demo. CTA: `?producto=Nexo+Botilleria&rubro=Botiller%C3%ADa`

### 4.11 Hojear — kill-list PR4 (final)

H1: `No solo leas. Entiende.`  
Plus **visible** a **$3.990/mes** como **lista de espera**. CTA: `Avisarme cuando Plus esté disponible` → `?producto=Hojear+Plus`.  
Micro: `Plus está definido. El cobro todavía no.`  
Vitrina `hasText:true`: Sub terra, Martín Rivas, Cuentos de amor…, Quijote.

| Matar | Reemplazo |
|-------|-----------|
| Ver los 20 títulos del catálogo | Ver el catálogo → `?vista=catalogo` |
| +120 obras con lectura completa | 117 textos · 122 fichas |
| Biblioteca Digital Chilena (badge) | Hojear · Lectura y comprensión |
| Entrar a la biblioteca libre / Abrir Biblioteca Hojear | Entrar a leer |
| Cada libro … ▶ Escuchar audiolibro | Algunas fichas enlazan LibriVox |
| simulacros PAES interactivos | Quitar |
| Pago seguro · Cancela cuando quieras | Plus está definido. El cobro todavía no. |
| JSON-LD Offer 3990 | **Borrar en PR4** |
| `/biblioteca/?vista=planes` | `?producto=Hojear+Plus` |
| Frankenstein/Drácula lectura inmediata | Fuera de vitrina |
| Emojis 📖🎓👓🎧 | Texto |

### 4.13 Form — enum

Campo **`correo`** (alias server `email`). Home = deep-link, nunca form.

producto: `General` · `Nexo Trial` · `Nexo` · `Nexo Servicios` · `Nexo Taller` · `Nexo Comercio` · `Nexo Ferreteria` · `Nexo Almacen` · `Nexo Botilleria` · `Hojear` · `Hojear Plus` · `indago`.

rubro: `Salón` `Barbería` `Spa` `Taller` `Ferretería` `Minimarket` `Botillería` `Otro` `No aplica`.

Queries: genérico `Nexo+Trial`; familia `Nexo+Servicios` / `Nexo+Comercio`; selector/vertical = value + `&rubro=`. Success literal: `Mensaje recibido. Te responderemos en menos de 24 horas.`

Tabla de campos HTML: **Apéndice A §A.8**.

---

## 5. DS Cimientos

Tokens mínimos (completos en **Apéndice A §A.2**):

```css
:root {
  --carbon: #0B0B0C; --carbon-2: #141416; --ink: #F4F1EA;
  --paper: #F4F1EA; --copper: #C4894A; --copper-2: #D9A870;
  --nexo: #00C9A7; --hojear: #D95D39; --indago: #8B7CF7;
  --wrap: 1120px; --bp-nav: 640px; --radius: 0; --radius-sm: 2px; --t: 150ms;
}
.wrap { width: min(100% - 32px, var(--wrap)); margin-inline: auto; }
```

Tipo: Archivo + Source Sans 3 + IBM Plex Mono (**href en Apéndice A §A.3**). Radio 0–2. Sin glow/blur/gradiente. Chip default cobre; color de producto solo bajo `.product-block--*`. `--bp-nav: 640px`. No 12-col. `prefers-reduced-motion`. skip-link. `.btn-mm` no se porta. Chip `PILOT` = cobre chrome (no color de producto).

---

## 7. Caminos

Path A post-PR3: Home `#flujo` → Salón → Pedir trial → form → éxito. Demo = side quest.  
**Hasta PR3:** el mismo CTA → `#categorias`.

---

## 8. Prototipos

Chip: mark 6×6 cobre.  
Product block PR2: `href="/nexo/#categorias"` + comentario PR3 → `#flujo`.  
Panel `#flujo` (PR3): **HTML en Apéndice A §A.5**. Datos: **objeto `RUBROS` en Apéndice A §A.4**.

---

## API + PR6 runbook

`POST /api/contacto` JSON. Prod same-origin (sin CORS). Local: `data-api="http://127.0.0.1:8787/api/contacto"` + `wrangler dev --port 8787`. OPTIONS + Set de origins (etemen.cl, www, localhost:5500, 127.0.0.1:5500).

**Route, no Custom Domain:** `etemen.cl/api/contacto*` y `www…` en `wrangler.toml` `routes` (**Apéndice A §A.7**). Custom Domain tumba el static.

DNS **naranja** o la Route no corre (OQ 5b).

D1 `contactos` + `rate_limits` (**schema Apéndice A §A.6**). 5/hora, `CF-Connecting-IP`, SHA-256+salt. Turnstile + honeypot `empresa_web`. Persistencia > Resend.

`js/contacto.js`: disable submit; 201 success constante; 429 / error → hola@; Turnstile ausente 8 s → fallback.

No mergear form nuevo sin health 200 o fallback visible. Checklist: **Apéndice A §A.9**.

---

## Alternatives / Security / Rollout

301: **CF Bulk Redirects**, no `_redirects`. HTML legado se queda. Purge + `curl -I`.  
CSS: page-by-page. PR1 no linkea v8.  
Secrets: wrangler secret, nunca git (rotar Bearer de `CLAUDE.md` fuera de este proyecto).  
Parissiene: no PINs, no login del piloto, no fiado de vecinos.

---

## SEO (titles)

`/` ETEMEN — Software con fundamento. Nexo, indago, Hojear  
`/nexo/` Nexo — El sistema de tu local | ETEMEN  
`/nexo/salones/` Nexo para salones — Agenda y caja | ETEMEN  
`/nexo/barberias/` Nexo para barberías — Agenda por sillón | ETEMEN  
`/nexo/talleres/` Nexo para talleres — OT por patente | ETEMEN  
`/nexo/ferreterias/` Nexo para ferreterías — Caja y stock | ETEMEN  
`/nexo/minimarkets/` Nexo para minimarkets — Caja y fiado | ETEMEN  
`/nexo/botillerias/` Nexo para botillerías — Caja y rotación | ETEMEN  
`/hojear/` Hojear — No solo leas. Entiende. | ETEMEN  
`/indago/` indago — Infraestructura de precios en Chile | ETEMEN  
`/portafolio/` Casos en producción — ETEMEN  
`/portafolio/ysabel-aragon-nw/` Caso Ysabel Aragón NW — Nexo Servicios | ETEMEN  
`/portafolio/indago/` Caso indago.cl — Infraestructura de precios | ETEMEN  
`/portafolio/la-parissiene/` Caso La Parissiene — Nexo Comercio piloto | ETEMEN  
`/contacto/` Contacto — ETEMEN  

Meta Parissiene: `Piloto de Nexo Comercio en un almacén de barrio. Caja, stock y fiado en instancia propia. Sin cifras de venta.`  
H1 case: `La Parissiene`  
Hojear: borrar Offer JSON-LD en PR4. Sitemap PR7 ⊆ URLs 200 (incluir `/portafolio/la-parissiene/` cuando PR5 exista).

---

## Open Questions

GATE = default se implementa; el PR **no espera**.

1. **RESUELTO.** Publicar La Parissiene como caso piloto Nexo Comercio. Chip `PILOT`. 5 secciones solo con hechos de PILOTO / SETUP / CEREBRO. Sin parentesco, PINs, fiado de vecinos, revenue, uptime ni recuento de operaciones. URL: `/portafolio/la-parissiene/` (PR5).
2. **RESUELTO.** Hojear Plus = waitlist **visible** a **$3.990/mes**. Kill: “pago seguro”, Offer JSON-LD, simulacros interactivos, `?vista=planes`.
3. **RESUELTO.** indago **no** va en nav. Footer + `/indago/` (PR4) + home.
4. **RESUELTO.** **No** publicar anual Comercio $199.000. UI Comercio = $19.900/mes + setup desde $39.000. Anual Servicios $450.000 **sí**.
5. **RESUELTO.** No publicar uptime %. 5b. ¿DNS naranja? Verificar antes de PR6 (sigue abierto operativo).
6. ¿SPF/DKIM Resend? 7. ¿`/privacidad/`? 8. ¿`/nexo/spas/`? 9–13. OG, fonts, admin D1, testimonio Ysabel (default verbatim), ROI al final.

---

## Key Decisions

1–13. Operador; Nexo vende; 8 bloques + deep-link; 6 verticales; `/portafolio/` = casos; Cimientos; color producto acotado; allowlist; Hojear waitlist $3.990; indago ≠ 3D y **fuera de nav**; Worker+D1; HTML plano; 301 CF.  
14. **La Parissiene ON como caso piloto Comercio** (`/portafolio/la-parissiene/`, chip `PILOT`). Hechos only. Sin parentesco, PINs, fiado de vecinos, $ de venta.  
15. **`biblioteca/` y `salon-ysabel` fuera.**  
16. PRs incrementales ≠ 404s ≠ hashes muertos. **Ejecutar PR1–PR7 ahora.**  
17. 301 de borde CF.  
18. Enum + `correo` + home deep-link.  
19. CSS page-by-page.  
20. Home rubro CTAs = `/nexo/#categorias` hasta PR3; PR3 flipppea a `#flujo`.  
21. Features vertical ⊆ hub. Taller no tiene stock. Walk-in es problema, no feature.  
22. **No anual Comercio $199.000.**  
23. **No uptime %.**

---

## PR Plan

QA común: grep Forja/competidores = 0; no 99.98%; no +6 meses; no pago seguro; no $199.000 en Comercio; no parentesco/PIN/fiado en Parissiene.

### PR1 — `main-v8.css` only
Sin HTML. Tokens = Apéndice A §A.2–A.3. Effort 0.5–1 d.

### PR2 — Home
`index.html` → v8. Footer fase. **CTAs rubro = `#categorias`.** Deep-link contacto. Sin `/indago/`, sin `/nexo/{slug}/`, **sin `#flujo`**, sin `/portafolio/la-parissiene/`.  
QA: 8 bloques; 117; 0 404; **0 hashes a ids inexistentes**; skip-link; sin uptime %. Effort 1–1.5 d.

### PR3 — Hub + 6 verticales
Archivos: 6 landings + `nexo/index.html` + `js/nexo-flujo.js` (RUBROS + panel = Apéndice A §A.4–A.5) + flip footer rubros + **`index.html` `#categorias` → `#flujo`**. Comercio **sin** anual $199k. Minimarkets: caso Parissiene solo como texto “piloto” **sin href** hasta PR5 (o href en PR5).  
QA: 6×200; features ⊆ §4.9; **grep `stock de repuestos` = 0 en Servicios**; **walk-in no es feature**; **grep `199.000` = 0**; home `#flujo` existe. Effort 2–3 d.

### PR4 — Hojear + `/indago/`
Waitlist $3.990 + kill-list §4.11. Borrar Offer JSON-LD. Flip footer indago **después** de 200. Effort 1–1.5 d.

### PR5 — Cases (3)
Archivos: `portafolio/index.html`; `portafolio/ysabel-aragon-nw/`; `portafolio/indago/`; **`portafolio/la-parissiene/index.html`**. Flip home/minimarkets href al case Parissiene. Indago Demostración = **solo indago.cl** si `/indago/` aún no existe.  
QA: 3 cards; prosa §4.5; testimonio Ysabel verbatim; grep salon-ysabel = 0; Parissiene: grep parentesco/PIN/`0592`/fiado nominativo/revenue = 0; chip `PILOT`. Effort 0.5–1 d.

### PR6 — Form + Worker
Apéndice A §A.6–A.9. Route ≠ Custom Domain. Effort 1–2 d.

### PR7 — SEO + Bulk Redirects CF
No `_redirects`. Sitemap ⊆ 200 **incluyendo** `/portafolio/la-parissiene/`. Effort 0.5 d.

**Fuera de producto:** OG dedicados, self-host fonts, borrar v5/v6, rotar Bearer, demos visual, `biblioteca/`, `salon-ysabel`.

---

## Apéndice A — Bloques de implementación

Idéntico al Apéndice A de `grok-design-doc-f1ee7ede.md` (A.1 tabla demo/onrender · A.2 `:root` · A.3 Google Fonts · A.4 `RUBROS` · A.5 panel `#flujo` · A.6 D1 · A.7 wrangler Route · A.8 campos form · A.9 runbook). Implementar desde ese apéndice para no desfasar dos copias de código pegable. Resumen de reglas A.1: no publicar login `bodega-trial-la-parissiene`. Comercio sin anual $199k en precios de `RUBROS` (ya $19.900 + setup desde $39.000).
