# forja-web — etemen.cl

Sitio estático del estudio ETEMEN. HTML/CSS/JS puro, sin framework.

## Deploy
- **Plataforma**: Render (plan free, servicio estático)
- **URL producción**: https://etemen.cl
- **Service ID**: `srv-d9ifoibeo5us739sr680`
- **Auto-deploy no confiable** — disparar manualmente vía API:
  ```powershell
  Invoke-RestMethod -Uri "https://api.render.com/v1/services/srv-d9ifoibeo5us739sr680/deploys" -Method POST -Headers @{ "Authorization" = "Bearer rnd_USREVf2EstA8kQQGARaRvtEwCeqG"; "Accept" = "application/json" }
  ```
- Cloudflare está delante — cachea CSS y SVGs agresivamente
  - Fix CSS: renombrar archivo (`main-v7.css`, `main-v8.css`…) y actualizar `<link>` en HTML
  - Fix SVG: renombrar archivo (`etemen-mark-v2.svg`, `v3`...) y actualizar `src` en HTML
  - Fix crítico: poner CSS en `<style>` inline en el `<head>` — HTML siempre es fresco

## Estructura de páginas
```
index.html          → etemen.cl (landing principal)
nexo/index.html     → etemen.cl/nexo/
contacto/index.html → etemen.cl/contacto/
portafolio/         → etemen.cl/portafolio/
demos/              → etemen.cl/demos/ (atelier, aura, luna)
```

## CSS
- Archivo vivo: `css/main-v8.css` (cache-bust: renombrar al cambiar estilos globales)
- Tipografías: Archivo + Source Sans 3 + IBM Plex Mono
- Paleta Cimientos: carbono `#0B0B0C` · tinta `#F4F1EA` · cobre `#C4894A`
- Nexo `#00C9A7` · Hojear `#D95D39` · indago `#8B7CF7` — solo en superficies de producto
- Radio 0–2 px. Sin glow ni blur.
- **Trial unificado:** 3 días gratis en todo el sitio
- Spec: `docs/REDISENO_ETEMEN.md`

## Logos
- **ETEMEN mark**: `assets/logos/etemen-mark-v2.svg` — bloque cobre rx=8, E en espacio negativo
- **Nexo mark**: `assets/logos/nexo-mark.svg` — curva bezier, nodo origen → nodo destino
- **Favicon**: `assets/favicon.svg` — bloque cobre rx=4, 32x32
- Todas las páginas usan `etemen-mark-v2.svg` en navbar y footer

## Estructura home (index.html) — tono confianza / solidez
1. Nav
2. Hero — "Software con base firme…" + status badge + trust-bar (métricas)
3. Productos — Nexo + indago
4. Operación — monitoreo · datos propios · responsabilidad directa
5. En producción — Ysabel Aragón NW + indago.cl (evidencia)
6. Testimonio — Ysabel Aragón
7. Founder — Antonio + compromisos (precio fijo, 24h, trial)
8. FAQ — 5 preguntas, sin letra chica
9. CTA — canales formales (formulario + hola@etemen.cl)
10. Footer — status badge + link estado del sistema

## Monitoreo
- UptimeRobot: 5 monitores, check cada 5 min — status page https://stats.uptimerobot.com/z6bYAoGxq6
- Widget de uptime en nav (y hero de home): API pública `https://stats.uptimerobot.com/api/getMonitorList/z6bYAoGxq6`, promedio 30 días, CSS `main-v9.css`
- Contador de visitas: Worker Route `/api/visita*` + D1. Panel interno `/visitas/` (noindex). No Custom Domain.
- **cron-job.org** keep-alive (cada 1 min, TZ America/Santiago) — verificado 2026-08-02:
  - `8117675` Indago API → `https://indago-api.onrender.com/health` (enabled, OK)
  - `8203623` Nexo demo → `https://nexus-trial-demo.onrender.com/health` (enabled, OK)
  - API: `https://api.cron-job.org/` Bearer key en Console → Settings (**no commitear**)
  - Nexo `/health` debe ser público en repo `nexus` (si 302 a login, el cron falla status 4)

---

## Estado infraestructura ETEMEN (actualizado 2026-08-25)

### Decisiones tomadas

- **chile-oef cancelado como producto/investigación** (decisión de Antonio, 2026-08-25) —
  fuera del nicho de ETEMEN. **Corrección 2026-08-26: la nota de abajo decía que el repo de
  GitHub y el proyecto Neon estaban borrados — es falso, nunca se ejecutó (o se revirtió sin
  documentar).** Verificado en vivo el 2026-08-26: el repo `k4153r-max/chile-oef` sigue activo
  con CI corriendo, y el proyecto Neon `broad-firefly-79273260` sigue activo y en uso real
  (llegó a superar su cuota de storage del plan free ese mismo día).
  - Antonio decidió explícitamente **mantener vivo solo el bot de Telegram** de alertas
    sísmicas (`telegram-alerts.yml`, USGS M≥4.0 cada 10 min) — no el resto del proyecto
    (dashboard científico, pipeline CSEP, roadmap de fases). El repo y el proyecto Neon
    siguen existiendo porque el bot los necesita para correr.
  - El dashboard público estático (`forja-web/chile-oef/`) sí se borró de verdad — por eso no
    hay ya ningún link a `/chile-oef/` en este sitio (ver `index.html` y
    `desarrollo-web/index.html`, limpiados 2026-08-26).
  - Servicio Render `chile-oef-api` — este si se dio de baja (chile-oef ya había migrado a
    Fly.io antes de la cancelación; Render quedó como legado sin tráfico).
  - **Si se vuelve a tocar el repo `chile-oef`**: es mantenimiento mínimo del bot, no retomar
    el roadmap de investigación (ETAS/CSEP fases 3-8) salvo que Antonio lo pida explícito —
    `docs/PROJECT_STATE.md` de ese repo todavía está escrito como si fuera investigación activa
    de pleno derecho, desactualizado tras esta decisión (pendiente corregir ahí también).

### Arquitectura final ✅

| Plataforma | Qué va ahí | Estado |
|---|---|---|
| **Render** | Solo `etemen.cl` estático (`srv-d9ifoibeo5us739sr680`) | ✅ Único servicio — NO tocar |
| **Fly.io** | Todos los backends Python | ✅ Migrado |

### Apps en Fly.io (todas migradas)

| App | Estado |
|---|---|
| `etemen-nexus` | suspended (duerme, despierta con tráfico) |
| `nexus-trial-demo` | suspended |
| `nexus-trial-taller` | suspended |
| `nexus-trial-unas` | suspended |
| `nexus-dpb7` | suspended |
| `bodega-trial-almacen-demo` | suspended |
| `bodega-trial-ferreteria-demo` | deployed |
| `bodega-trial-botilleria-demo` | suspended |
| `bodega-trial-la-parissiene` | suspended |

### Decisiones permanentes

- **chile-oef cancelado** (2026-08-25) — fuera del nicho. Render + Neon + GitHub borrados.
- No tocar el estático Etemen en Render.
- cron-job.org keep-alive: actualizar URLs de Render → Fly.io si aún apuntan al viejo dominio.

### Flyctl

- Instalado en `~\.fly\bin`
- Auth: usar `$env:FLY_ACCESS_TOKEN` en cada comando (token en Fly.io dashboard → Tokens)

