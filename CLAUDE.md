# forja-web — etemen.cl

Sitio estático del estudio ETEMEN. HTML/CSS/JS puro, sin framework.

## Deploy

- **Plataforma:** Render (servicio estático).
- **URL producción:** https://etemen.cl
- **Service ID:** `srv-d9ifoibeo5us739sr680`
- El auto-deploy no siempre ha sido confiable. Disparar deploy desde el panel o
  con una credencial obtenida del gestor de secretos; nunca documentar tokens en
  este repositorio.
- Cloudflare puede cachear CSS y SVG agresivamente. Versionar el nombre del
  recurso y actualizar sus referencias cuando sea necesario.

## Estructura de páginas

```text
index.html          → etemen.cl
nexo/index.html     → etemen.cl/nexo/
contacto/index.html → etemen.cl/contacto/
portafolio/         → etemen.cl/portafolio/
demos/              → etemen.cl/demos/
chile-oef/          → dashboard estático de CHILE-OEF
```

## Diseño

- Archivo global vivo: `css/main-v8.css`; versionar el nombre al cambiar estilos
  que Cloudflare pueda cachear.
- Tipografías: Archivo + Source Sans 3 + IBM Plex Mono.
- Paleta Cimientos: carbono `#0B0B0C`, tinta `#F4F1EA`, cobre `#C4894A`.
- Nexo `#00C9A7`, Hojear `#D95D39`, indago `#8B7CF7`; usar solo en superficies
  de producto.
- Radio 0–2 px. Sin glow ni blur.
- Trial unificado: 3 días.
- Spec: `docs/REDISENO_ETEMEN.md`.

## Monitoreo

- UptimeRobot: cinco monitores cada cinco minutos.
- Contador de visitas: Worker Route `/api/visita*` + D1; panel `/visitas/` con
  `noindex`.
- Los secretos de UptimeRobot, cron-job.org, Cloudflare, Render y Neon pertenecen
  al gestor del proveedor y no deben versionarse.

---

## Memoria sesión 2026-08-24 — migración de infraestructura ETEMEN

### Contexto verificado

- `https://etemen.cl` responde HTTP 200: no tocar ni migrar en esta fase.
- `https://chile-oef-api.onrender.com/v1/health` responde HTTP 503.
- El backend está en `k4153r-max/chile-oef`; `chile-oef/` en este repositorio es
  únicamente el dashboard estático.
- Arquitectura objetivo: sitio estático en Render, PostgreSQL en Neon y backends
  Python en Fly.io.

### Arquitectura objetivo

| Plataforma | Responsabilidad | Estado |
|---|---|---|
| Render | `etemen.cl` estático | Activo; no tocar |
| Neon | PostgreSQL | CHILE-OEF activo; contraseña rotada |
| Fly.io | Backends Python | CHILE-OEF, 5 Nexo y 4 Bodega desplegados |

### CHILE-OEF

- Repositorio: `k4153r-max/chile-oef`.
- `Dockerfile`, `.dockerignore` y `fly.toml` están versionados en el repositorio.
- Región objetivo: `gru` (São Paulo), cercana a Neon `aws-sa-east-1`.
- El release ejecuta `alembic upgrade head` y verifica `/v1/health` contra la DB.
- La imagen `chile-oef:fly-migration` construyó correctamente.
- Producción: `https://chile-oef-api.fly.dev`; `/v1/health` confirma API y DB
  saludables con versión `0.1.0`.
- Una máquina `shared-cpu-1x` de 512 MB en configuración estable, con
  autoapagado/autoinicio y cero máquinas mínimas permanentemente activas.
- Volumen cifrado `chile_oef_data` de 1 GB montado en `/app/data`; los nueve
  artefactos USGS crudos sobreviven despliegues.
- Catálogo productivo cargado: 74.403 eventos USGS (1964-01-26 a 2026-08-24),
  nueve particiones, sin fallos. La línea científica `mwc` está en ajuste y aún
  no debe declararse promovida.
- Worker `chile-oef-keepalive` desplegado en
  `https://chile-oef-keepalive.etemen.workers.dev`, con ping cada minuto a Fly.

### Seguridad

- Una clave de Neon, una URL PostgreSQL con contraseña y un token de Render se
  publicaron anteriormente en este archivo.
- Sus valores se retiraron de la versión de trabajo, pero permanecen en el
  historial de Git y deben considerarse comprometidos.
- La contraseña PostgreSQL de Neon fue rotada y la antigua clave API `Prueba`
  fue revocada el 2026-08-25. La nueva URL existe exclusivamente como secreto
  `CHILE_OEF_DATABASE_URL` en Fly.io.
- El token de Render que apareció en el historial aún debe revocarse desde el
  panel del proveedor (Render no ofrece endpoint para revocarlo); no reutilizarlo.
- Limpiar el historial requiere coordinación y no sustituye la rotación.

### Nexo y Bodega

- Migración completada el 2026-08-25 a Fly `gru`, con una app y un volumen
  cifrado `app_data` de 1 GB por instancia; SQLite persiste entre reinicios.
- Nexo: `nexus-trial-demo`, `nexus-trial-taller`, `nexus-trial-unas`,
  `nexus-dpb7` y `etemen-nexus` (el nombre global `nexus` no estaba disponible).
- Bodega: `bodega-trial-almacen-demo`, `bodega-trial-botilleria-demo`,
  `bodega-trial-ferreteria-demo` y `bodega-trial-la-parissiene`.
- Todas pasaron `/health`; las públicas pasaron login y persistencia. Los demos
  genéricos Nexo/Taller se renovaron hasta 2026-10-31; `unas` conserva su fecha.
- `etemen.cl` ya publica enlaces Fly. Los 10 backends Render suspendidos (los
  nueve anteriores más CHILE-OEF) se eliminaron tras verificar reemplazos. En
  Render queda únicamente el sitio estático ETEMEN.

### Próximos pasos

1. Finalizar ETAS `mwc`, cargar Slab2/CHAF y clasificar tectónica.
2. Ejecutar las evaluaciones walk-forward homogénea/adaptativa alineadas y
   `assess-model-promotion`; no promover sin resultado `promote`.
3. Restaurar CHILE-OEF a 512 MB/autoapagado y revocar manualmente el token de
   Render expuesto desde Account Settings.

### No rehacer

- No eliminar ETEMEN estático de Render.
- No tocar `salon-ysabel` ni su despliegue.
- No mezclar tipos de magnitud en CHILE-OEF.
- No presentar IAS como peligro ni como probabilidad de un gran terremoto.
- No modificar el campeón científico sin superar la compuerta de promoción.
