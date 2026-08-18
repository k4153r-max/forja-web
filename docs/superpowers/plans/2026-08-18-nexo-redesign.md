# Nexo "Libro de Caja" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el tema visual actual de `/nexo/` ("Industrial Utilitarian", cobre/carbón) por la dirección "Libro de caja" aprobada — anclada en el cuaderno de cuentas y el talonario real de un local chileno — sin romper la lógica JS existente (`js/nexo-flujo.js`) ni el contenido/copy ya aprobado.

**Architecture:** Un solo archivo CSS reescrito (`css/nexo-v1.css`) con tokens y componentes nuevos, un HTML reestructurado por sección (`nexo/index.html`) que preserva cada `id`/`data-*` que el JS consume, y una sección nueva (calculadora de ROI) que conecta HTML real a lógica JS que ya existía huérfana. Cero cambios de lógica en `js/nexo-flujo.js`.

**Tech Stack:** HTML/CSS estático (sin framework/build step), vanilla JS, Google Fonts (Special Elite, IBM Plex Sans, IBM Plex Mono ya cargado sitio-ancho), deploy vía Render (push a `master` dispara redeploy).

**Spec:** `docs/superpowers/specs/2026-08-18-nexo-redesign-design.md`

## Global Constraints

- No se cambia ninguna lógica de `js/nexo-flujo.js` salvo lo estrictamente necesario para que la calculadora de ROI (`calcROI()`, ya existente) tenga HTML real.
- Hooks que el JS consume y NO pueden cambiar de nombre/estructura: `[data-rubro-selector]`, `#rubro-panel`, `[data-panel-familia]`, `[data-panel-titulo]`, `[data-panel-precio]`, `[data-panel-trial]`, `[data-panel-demo]`, `[data-panel-app]`, `#pos-receipt-lines`, `#pos-total-val`, `#pos-add-items`, `#pos-pay-btn`, `#range-citas`, `#range-stock`, `#roi-val-res`.
- Paleta: `--nexo-paper:#EFEBE3`, `--nexo-ink:#1C1A17`, `--nexo-ledger-red:#B8332F`, `--nexo-ledger-blue:#2B4570`, `--nexo-rule:rgba(28,26,23,.12)`, `--nexo-paper-2:#E4DFD3` — valores exactos de la spec, no aproximados.
- Tipografía: display/ticket = Special Elite, cuerpo = IBM Plex Sans, datos = IBM Plex Mono (ya cargado global).
- No se inventan cifras de precio ni de ROI — el copy de precios ya aprobado se mantiene, y `calcROI()` ya calcula con sus propias constantes reales (no se tocan).
- Ningún cambio a Home, Hojear, indago, CHILE-OEF.

---

### Task 1: Fundamento — tokens CSS y tipografía

**Files:**
- Modify: `css/nexo-v1.css` (reescritura completa del bloque `:root` y estilos base: body, nav, botones)
- Modify: `nexo/index.html:34` (línea del `<link>` de Google Fonts)

**Interfaces:**
- Produces: variables CSS `--nexo-paper`, `--nexo-ink`, `--nexo-ledger-red`, `--nexo-ledger-blue`, `--nexo-rule`, `--nexo-paper-2`, `--font-display` (Special Elite), `--font-sans` (IBM Plex Sans), `--font-mono` (IBM Plex Mono) — usadas por todas las tareas siguientes.

- [ ] **Step 1: Actualizar el `<link>` de Google Fonts en `nexo/index.html`**

Reemplazar la línea 34 (fuentes actuales Archivo/Plex Mono/Source Sans) por:

```html
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Reescribir el bloque `:root` de `css/nexo-v1.css`**

```css
:root {
  --nexo-paper: #EFEBE3;
  --nexo-paper-2: #E4DFD3;
  --nexo-ink: #1C1A17;
  --nexo-ink-dim: rgba(28,26,23,.62);
  --nexo-ledger-red: #B8332F;
  --nexo-ledger-blue: #2B4570;
  --nexo-rule: rgba(28,26,23,.12);
  --nexo-rule-strong: rgba(28,26,23,.28);
  --nexo-mint: var(--nexo-ledger-blue); /* alias: js/nexo-flujo.js:110 pinta descuentos con var(--nexo-mint), que ya no existe en la paleta nueva */
  --font-display: "Special Elite", "Courier New", monospace;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; background: var(--nexo-paper); }
body {
  font-family: var(--font-sans);
  background: var(--nexo-paper);
  color: var(--nexo-ink);
  line-height: 1.6;
  min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
.wrap { width: min(1140px, calc(100% - 40px)); margin-inline: auto; position: relative; z-index: 1; }

.skip-link { position: absolute; left: 8px; top: -40px; z-index: 20; background: var(--nexo-ledger-blue); color: var(--nexo-paper); padding: 8px 12px; font-weight: 700; }
.skip-link:focus { top: 8px; }

.nav {
  position: sticky; top: 0; z-index: 20;
  background: rgba(239, 235, 227, 0.94);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--nexo-rule-strong);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; min-height: 68px; gap: 16px; }
.logo { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; color: var(--nexo-ink); }
.logo img { border-radius: 4px; }
.logo-wordmark .name { display: block; line-height: 1; }
.logo-wordmark .tagline { font-family: var(--font-mono); font-size: 10px; color: var(--nexo-ledger-blue); letter-spacing: 0.1em; text-transform: uppercase; }

.nav-links { display: flex; gap: 6px; align-items: center; font-size: 0.9rem; color: var(--nexo-ink-dim); }
.nav-links a { padding: 8px 14px; border-radius: 2px; transition: all 0.15s ease; }
.nav-links a:hover, .nav-links a.active { color: var(--nexo-ink); background: var(--nexo-paper-2); }
.nav-links .nav-cta { background: var(--nexo-ledger-blue); color: var(--nexo-paper); font-weight: 700; padding: 8px 18px; }
.nav-links .nav-cta:hover { background: #1f3352; }

.nav-toggle { display: none; appearance: none; background: var(--nexo-paper-2); border: 1px solid var(--nexo-rule-strong); color: var(--nexo-ink); padding: 8px 14px; font-family: var(--font-mono); font-size: 11px; cursor: pointer; }

.btn-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; font-family: var(--font-sans); font-size: 0.92rem; font-weight: 700; transition: all 0.15s ease; cursor: pointer; }
.btn-primary { background: var(--nexo-ledger-blue); color: var(--nexo-paper); border: 1px solid var(--nexo-ledger-blue); }
.btn-primary:hover { background: #1f3352; }
.btn-ghost { background: transparent; color: var(--nexo-ink); border: 1px solid var(--nexo-rule-strong); }
.btn-ghost:hover { background: var(--nexo-paper-2); }
.btn-sm { min-height: 38px; padding: 0 14px; font-size: 0.8rem; }

.section { padding: 80px 0; }
.section-head { margin-bottom: 36px; }
.eyebrow { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--nexo-ledger-blue); font-weight: 600; }
.section-head h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(1.8rem, 3.5vw, 2.6rem); margin-top: 6px; }

@media (max-width: 768px) {
  .nav-toggle { display: block; }
  .nav-links { display: none; position: absolute; left: 0; right: 0; top: 100%; flex-direction: column; background: var(--nexo-paper); border-bottom: 1px solid var(--nexo-rule-strong); padding: 16px; }
  .nav-links.open { display: flex; }
}
```

- [ ] **Step 3: Verificar que el sitio local sigue sirviendo sin errores de CSS**

Run: `cd /home/k4153r/forja-web && python3 -m http.server 8790 &` luego `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8790/nexo/`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: fundamento de tokens y tipografía 'Libro de caja'"
```

---

### Task 2: Hero — cuadrícula de cuaderno real + titular manuscrito

**Files:**
- Modify: `css/nexo-v1.css` (agregar `.page-hero`, `.hero-note`)
- Modify: `nexo/index.html:61-91` (sección `.page-hero`, sin cambiar `id`/`data-*` existentes)

**Interfaces:**
- Consumes: tokens de Task 1.
- Produces: clase `.page-hero` con fondo de líneas de cuaderno, usada solo en esta sección.

- [ ] **Step 1: CSS del hero con cuadrícula real como fondo**

```css
.page-hero {
  padding: 64px 0 48px;
  border-bottom: 1px solid var(--nexo-rule-strong);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 31px,
    var(--nexo-rule) 31px,
    var(--nexo-rule) 32px
  );
}
.page-hero h1 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  line-height: 1.15;
  max-width: 16ch;
  transform: rotate(-0.6deg);
}
.page-hero .lead { font-size: 1.1rem; color: var(--nexo-ink-dim); max-width: 42rem; line-height: 1.7; margin-top: 16px; }
.hero-note { font-size: 0.85rem; color: var(--nexo-ink-dim); font-family: var(--font-mono); margin: 18px 0; }
```

- [ ] **Step 2: Actualizar el markup del hero en `nexo/index.html`**

Mantener el `<img>` del logo, el `<p class="eyebrow">`, el `<h1>` y el `<p class="lead">` existentes tal cual (mismo texto), solo confirmar que el `<div style="display:flex...">` que envuelve logo+título use las clases nuevas en vez de estilos inline de la versión cobre. No tocar `.nexo-stats` todavía (Task 6).

- [ ] **Step 3: Verificar visualmente con screenshot headless**

Run:
```bash
cd /home/k4153r/forja-web
google-chrome --headless --disable-gpu --window-size=1280,900 --screenshot=/tmp/nexo-hero-check.png "http://localhost:8790/nexo/"
```
Expected: el archivo `/tmp/nexo-hero-check.png` se genera sin error; inspeccionar que el fondo tenga líneas horizontales visibles y el H1 use Special Elite.

- [ ] **Step 4: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: hero con cuadrícula de cuaderno real"
```

---

### Task 3: Selector de rubro — pestañas de talonario

**Files:**
- Modify: `css/nexo-v1.css` (`.rubro-selector`, `.rubro-option`, `.rubro-panel`)
- Modify: `nexo/index.html:94-109` (sección `#flujo`)

**Interfaces:**
- Consumes: `[data-rubro-selector]`, `#rubro-panel`, `[data-panel-*]` — deben existir con esos nombres exactos, `js/nexo-flujo.js:98-99` los busca con `document.querySelector`/`getElementById` y hace `return` silencioso si no los encuentra (la sección quedaría muda sin error visible).
- Produces: nada nuevo para otras tareas.

- [ ] **Step 1: CSS de pestañas de talonario**

```css
.rubro-selector { display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 0; border-bottom: 2px solid var(--nexo-ink); }
.rubro-option {
  font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 12px 18px; background: var(--nexo-paper-2); border: 1px solid var(--nexo-rule-strong); border-bottom: none;
  color: var(--nexo-ink-dim); cursor: pointer; clip-path: polygon(6% 0, 100% 0, 94% 100%, 0 100%);
}
.rubro-option:hover, .rubro-option[aria-selected="true"] { background: var(--nexo-paper); color: var(--nexo-ink); font-weight: 700; }
.rubro-panel { background: var(--nexo-paper); border: 1px solid var(--nexo-rule-strong); border-top: none; padding: 32px; }
.rubro-panel h3 { font-family: var(--font-display); font-weight: 400; font-size: 1.7rem; margin: 8px 0 12px; }
.rubro-panel-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 400px); gap: 24px; align-items: start; margin-top: 0; }
@media (max-width: 880px) { .rubro-panel-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Confirmar que `nexo/index.html` conserva exactos los atributos del selector**

Verificar que el bloque siga teniendo, sin renombrar:
```html
<div class="rubro-selector" data-rubro-selector role="tablist">
  <button type="button" class="rubro-option" role="tab" aria-selected="true" data-rubro="salon">Salón &amp; Spa</button>
  <!-- ...resto de botones igual, solo clases CSS nuevas si aplica... -->
</div>
```
Y el panel:
```html
<div class="rubro-panel" id="rubro-panel">
  <p class="eyebrow" data-panel-familia>Nexo Servicios</p>
  <h3 data-panel-titulo>Salones de Belleza &amp; Spas</h3>
  <p data-panel-precio>Precio por confirmar · A consultar por local</p>
  <div class="btn-row">
    <a class="btn btn-primary" data-panel-trial href="/contacto/?producto=Nexo+Trial">Pedir Trial 3 Días</a>
    <a class="btn btn-ghost" data-panel-demo href="/nexo/salones/">Ver Demo Salones</a>
    <a class="btn btn-ghost" data-panel-app hidden>Abrir App de Prueba</a>
  </div>
</div>
```

- [ ] **Step 3: Verificar en el navegador que cambiar de rubro sigue funcionando**

Run: `curl -s http://localhost:8790/nexo/ | grep -c 'data-rubro='`
Expected: `6` (los 6 botones de rubro siguen presentes)

- [ ] **Step 4: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: selector de rubro como pestañas de talonario"
```

---

### Task 4: Simulador POS — rollo de papel real

**Files:**
- Modify: `css/nexo-v1.css` (`.pos-terminal-sim`, `.pos-receipt-paper`, `.pos-receipt-line`, `.pos-add-items`, `.pos-pay-btn`)
- Modify: `nexo/index.html:125-149` (sin tocar los `id` que `renderPOS()`/`updateAddButtons()` usan)

**Interfaces:**
- Consumes: `#pos-receipt-lines`, `#pos-total-val`, `#pos-add-items`, `#pos-pay-btn` — `js/nexo-flujo.js:110-140` (`renderPOS`, `updateAddButtons`, listener de `posPayBtn`) inyecta HTML dentro de estos IDs vía `innerHTML`/`appendChild`; si el ID falta, la función hace `if (!posReceipt || !posTotalEl) return;` y la demo queda vacía sin lanzar error.
- Produces: nada nuevo.

- [ ] **Step 1: CSS del rollo de papel con borde perforado**

```css
.pos-terminal-sim { background: var(--nexo-paper-2); border: 1px solid var(--nexo-rule-strong); padding: 20px; font-family: var(--font-mono); font-size: 0.85rem; }
.pos-screen-bar { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px dashed var(--nexo-rule-strong); margin-bottom: 14px; font-size: 11px; text-transform: uppercase; color: var(--nexo-ledger-blue); font-weight: 700; }
.pos-receipt-paper {
  background: var(--nexo-paper);
  padding: 16px 14px 28px;
  min-height: 180px;
  font-family: var(--font-display);
  box-shadow: 0 6px 16px rgba(28,26,23,.12);
  position: relative;
}
.pos-receipt-paper::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: -6px; height: 12px;
  background-image: radial-gradient(circle at 6px 0, transparent 6px, var(--nexo-paper) 6px);
  background-size: 12px 12px;
  background-repeat: repeat-x;
}
.pos-receipt-line { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted var(--nexo-rule-strong); font-size: 0.8rem; }
.pos-receipt-line.total { border-top: 2px solid var(--nexo-ink); border-bottom: 0; margin-top: 8px; padding-top: 8px; font-weight: 700; }
.pos-status-badge { padding: 2px 8px; font-size: 10px; background: var(--nexo-ledger-blue); color: var(--nexo-paper); }
.pos-add-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 14px; }
.pos-item-btn { font-family: var(--font-mono); font-size: 11px; padding: 8px 10px; background: var(--nexo-paper-2); border: 1px solid var(--nexo-rule-strong); color: var(--nexo-ink); cursor: pointer; text-align: left; display: flex; justify-content: space-between; }
.pos-item-btn:hover { background: var(--nexo-paper); border-color: var(--nexo-ink); }
.pos-pay-btn { width: 100%; margin-top: 12px; font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 10px; background: var(--nexo-ledger-blue); color: var(--nexo-paper); border: 0; cursor: pointer; }
.pos-pay-btn:hover { background: #1f3352; }
```

Nota: `js/nexo-flujo.js:110` pinta las líneas con descuento usando `var(--nexo-mint)`. Task 1 ya define ese alias apuntando a `--nexo-ledger-blue`, así que no hace falta tocar el JS.

- [ ] **Step 2: Confirmar que el HTML conserva los IDs exactos**

```bash
grep -E 'id="pos-receipt-lines"|id="pos-total-val"|id="pos-add-items"|id="pos-pay-btn"' nexo/index.html
```
Expected: 4 líneas, una por cada ID.

- [ ] **Step 3: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: simulador POS como rollo de papel con borde perforado"
```

---

### Task 5: Calculadora de ROI — conectar el HTML que faltaba

**Files:**
- Modify: `nexo/index.html` (agregar sección nueva después de `#flujo`, antes de `#categorias`)
- Modify: `css/nexo-v1.css` (agregar `.roi-card`, `.roi-grid`, `.roi-control`, `.roi-result-box`)

**Interfaces:**
- Consumes: `js/nexo-flujo.js:179-197` (`calcROI`) ya escucha `input` en `#range-citas` y `#range-stock`, y escribe en `#roi-val-res` — estos tres IDs deben existir exactamente así.
- Produces: nada nuevo.

- [ ] **Step 1: HTML de la sección ROI**

Insertar como nueva `<section id="roi" class="section">` después del cierre de `#flujo` y antes de `#categorias`:

```html
<section id="roi" class="section" style="background:var(--nexo-paper-2); border-top:1px solid var(--nexo-rule-strong); border-bottom:1px solid var(--nexo-rule-strong);">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Cuánto cuesta no tener Nexo</p>
      <h2>Calcula lo que pierdes al mes</h2>
    </div>
    <div class="roi-card">
      <div class="roi-grid">
        <div>
          <div class="roi-control">
            <label for="range-citas">Citas o ventas perdidas al mes por desorganización</label>
            <input type="range" id="range-citas" min="0" max="30" value="6">
          </div>
          <div class="roi-control">
            <label for="range-stock">Horas de la semana perdidas cuadrando caja o stock</label>
            <input type="range" id="range-stock" min="0" max="15" value="3" step="0.5">
          </div>
        </div>
        <div class="roi-result-box">
          <div class="roi-lbl">Pérdida estimada al mes</div>
          <div class="roi-val" id="roi-val-res">$0 / mes</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: CSS de la sección ROI**

```css
.roi-card { background: var(--nexo-paper); border: 1px solid var(--nexo-rule-strong); padding: 32px; }
.roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
@media (max-width: 768px) { .roi-grid { grid-template-columns: 1fr; } }
.roi-control { margin-bottom: 20px; }
.roi-control label { display: block; font-family: var(--font-mono); font-size: 0.82rem; color: var(--nexo-ink-dim); margin-bottom: 8px; }
.roi-control input[type="range"] { width: 100%; accent-color: var(--nexo-ledger-blue); }
.roi-result-box { background: var(--nexo-paper-2); border: 1px dashed var(--nexo-rule-strong); padding: 24px; text-align: center; }
.roi-val { font-family: var(--font-display); font-size: 2.2rem; color: var(--nexo-ledger-red); }
.roi-lbl { font-family: var(--font-mono); font-size: 0.8rem; color: var(--nexo-ink-dim); margin-top: 4px; }
```

- [ ] **Step 3: Verificar que `calcROI()` encuentra los elementos y calcula**

Run:
```bash
cd /home/k4153r/forja-web
curl -s http://localhost:8790/nexo/ | grep -oE 'id="range-citas"|id="range-stock"|id="roi-val-res"'
```
Expected: las 3 líneas presentes. Luego abrir `http://localhost:8790/nexo/` en un navegador real (o headless con interacción), mover el slider `#range-citas`, y confirmar que `#roi-val-res` cambia de `$0 / mes` a un monto en pesos chilenos (la lógica ya existente en `calcROI()` lo calcula).

- [ ] **Step 4: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: conectar calculadora de ROI (calcROI ya existía sin HTML)"
```

---

### Task 6: Stats del hero, categorías y precios — hojas de talonario

**Files:**
- Modify: `css/nexo-v1.css` (`.nexo-stats`, `.nexo-stat-card`, `.case-grid`, `.case-card`, `.price-grid`, `.price-card`)
- Modify: `nexo/index.html:154-230` (secciones `#categorias` y `#precios`, sin cambiar el copy)

**Interfaces:**
- Consumes: tokens de Task 1. Ningún hook JS en estas secciones (son estáticas).

- [ ] **Step 1: CSS de tarjetas y precios con borde de desgarre**

```css
.nexo-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; margin-top: 32px; background: var(--nexo-rule-strong); }
.nexo-stat-card { background: var(--nexo-paper); padding: 18px; }
.nexo-stat-card .val { font-family: var(--font-display); font-size: 1.7rem; }
.nexo-stat-card .lbl { font-size: 0.82rem; color: var(--nexo-ink-dim); margin-top: 4px; font-family: var(--font-mono); }

.case-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 32px; }
.case-card { background: var(--nexo-paper); border: 1px solid var(--nexo-rule-strong); padding: 28px; }
.case-card .tag { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--nexo-ledger-blue); letter-spacing: 0.1em; display: block; margin-bottom: 10px; }
.case-card h3 { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; margin-bottom: 12px; }
.case-card p { color: var(--nexo-ink-dim); font-size: 0.95rem; line-height: 1.6; }

.price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 32px; }
.price-card {
  background: var(--nexo-paper); border: 1px solid var(--nexo-rule-strong); padding: 36px; position: relative;
  clip-path: polygon(0 12px, 4% 0, 8% 12px, 12% 0, 16% 12px, 20% 0, 24% 12px, 28% 0, 32% 12px, 36% 0, 40% 12px, 44% 0, 48% 12px, 52% 0, 56% 12px, 60% 0, 64% 12px, 68% 0, 72% 12px, 76% 0, 80% 12px, 84% 0, 88% 12px, 92% 0, 96% 12px, 100% 0, 100% 100%, 0 100%);
}
.price-card.featured { border-color: var(--nexo-ledger-blue); }
.price-card .amount { font-family: var(--font-display); font-size: 1.9rem; margin: 14px 0 20px; }
.price-card ul { list-style: none; margin: 20px 0 32px; }
.price-card ul li { padding: 10px 0; border-bottom: 1px dotted var(--nexo-rule-strong); color: var(--nexo-ink-dim); font-size: 0.95rem; }
.price-card ul li::before { content: "✓ "; color: var(--nexo-ledger-blue); font-weight: bold; }
```

- [ ] **Step 2: Confirmar que el copy de precios no cambió**

```bash
grep -c "Por confirmar" nexo/index.html
```
Expected: `2` (Servicios + Comercio, igual que antes del rediseño)

- [ ] **Step 3: Commit**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: tarjetas de categorías y precios como hojas de talonario"
```

---

### Task 7: Footer + verificación visual completa + deploy

**Files:**
- Modify: `css/nexo-v1.css` (`.footer`, `.footer-grid`)
- Modify: `nexo/index.html:233-263` (footer)

**Interfaces:**
- Consumes: tokens de Task 1. Ningún hook JS.

- [ ] **Step 1: CSS del footer**

```css
.footer { border-top: 1px solid var(--nexo-ink); padding: 56px 0 36px; background: var(--nexo-paper-2); color: var(--nexo-ink-dim); font-size: 0.88rem; }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 36px; margin-bottom: 36px; }
.footer-grid h4 { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--nexo-ledger-blue); letter-spacing: 0.12em; margin-bottom: 14px; }
.footer-grid a { display: block; padding: 5px 0; color: var(--nexo-ink-dim); }
.footer-grid a:hover { color: var(--nexo-ink); }
.footer-bottom { border-top: 1px solid var(--nexo-rule-strong); padding-top: 24px; font-size: 0.82rem; text-align: center; font-family: var(--font-mono); }
```

- [ ] **Step 2: Verificación visual de la página completa**

Run:
```bash
cd /home/k4153r/forja-web
(python3 -m http.server 8790 &) && sleep 1
google-chrome --headless --disable-gpu --window-size=1280,3200 --screenshot=/tmp/nexo-full-check.png "http://localhost:8790/nexo/"
```
Expected: screenshot generado, se revisa visualmente que: (a) no queden restos de la paleta cobre/carbón anterior, (b) el rollo de papel del POS se vea con borde perforado, (c) la sección ROI esté presente y legible, (d) las tarjetas de precio tengan el borde de desgarre.

- [ ] **Step 3: Verificar contraste de accesibilidad**

Run:
```bash
python3 -c "
def lum(hex_color):
    hex_color = hex_color.lstrip('#')
    r,g,b = [int(hex_color[i:i+2],16)/255 for i in (0,2,4)]
    def f(c): return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    r,g,b = f(r),f(g),f(b)
    return 0.2126*r+0.7152*g+0.0722*b
l1, l2 = lum('1C1A17'), lum('EFEBE3')
ratio = (max(l1,l2)+0.05)/(min(l1,l2)+0.05)
print(f'Contraste ink/paper: {ratio:.2f}:1 (AA normal texto requiere >= 4.5:1)')
"
```
Expected: ratio >= 4.5

- [ ] **Step 4: Verificar que todos los hooks JS siguen intactos (regresión final)**

```bash
cd /home/k4153r/forja-web
for hook in 'data-rubro-selector' 'id="rubro-panel"' 'data-panel-familia' 'data-panel-titulo' 'data-panel-precio' 'data-panel-trial' 'data-panel-demo' 'data-panel-app' 'id="pos-receipt-lines"' 'id="pos-total-val"' 'id="pos-add-items"' 'id="pos-pay-btn"' 'id="range-citas"' 'id="range-stock"' 'id="roi-val-res"'; do
  count=$(grep -c "$hook" nexo/index.html)
  echo "$hook: $count"
done
```
Expected: cada uno con conteo >= 1 (ninguno en 0).

- [ ] **Step 5: Commit final**

```bash
git add nexo/index.html css/nexo-v1.css
git commit -m "Nexo: footer 'Libro de caja' + verificación completa del rediseño"
```

- [ ] **Step 6: Push y deploy**

```bash
git fetch origin
git log HEAD..origin/master --oneline   # confirmar vacío antes de pushear
git push origin master
```
Luego disparar el deploy en Render (API, servicio `srv-d9ifoibeo5us739sr680`, mismo patrón usado en el rediseño de Hojear).

---

## Self-Review

**Cobertura de la spec:** hero (Task 2), selector de rubro (Task 3), POS/rollo de papel (Task 4), ROI (Task 5), precios/categorías (Task 6), footer (Task 7), tokens/tipografía (Task 1), accesibilidad/responsive (Task 7 Step 3 + media queries en cada task) — todas las secciones de la spec tienen tarea.

**Placeholders:** ninguno — cada task trae CSS/HTML real, no descripciones de "estilizar apropiadamente".

**Consistencia de nombres:** `--nexo-paper`, `--nexo-ink`, `--nexo-ledger-red`, `--nexo-ledger-blue`, `--nexo-rule`, `--nexo-paper-2` se usan igual en las 7 tareas. Los IDs/`data-*` del JS (`rubro-panel`, `pos-receipt-lines`, etc.) se repiten idénticos en cada task que los toca. `--nexo-mint` (referenciado por el JS pero no definido en la paleta nueva) se resuelve como alias en Task 1, documentado en Task 4 para que no se confunda con un bug.
