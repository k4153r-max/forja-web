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
- **cron-job.org** keep-alive (cada 1 min, TZ America/Santiago) — verificado 2026-08-02:
  - `8117675` Indago API → `https://indago-api.onrender.com/health` (enabled, OK)
  - `8203623` Nexo demo → `https://nexus-trial-demo.onrender.com/health` (enabled, OK)
  - API: `https://api.cron-job.org/` Bearer key en Console → Settings (**no commitear**)
  - Nexo `/health` debe ser público en repo `nexus` (si 302 a login, el cron falla status 4)
