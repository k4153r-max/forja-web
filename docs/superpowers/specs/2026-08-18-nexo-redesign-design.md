# Nexo — rediseño "Libro de caja"

**Fecha:** 2026-08-18
**Estado:** aprobado por el usuario (dirección + secciones), pendiente de implementación
**Alcance:** solo `/nexo/` (`nexo/index.html`, `css/nexo-v1.css`, `js/nexo-flujo.js`). No toca home, Hojear, indago ni CHILE-OEF.

## Contexto y motivación

El diseño vigente de Nexo ("Industrial Utilitarian", cobre sobre carbón)
llegó de otra sesión y el usuario lo rechazó explícitamente por sentirse
genérico: *"todos los que hacen web con una IA quedan igual... quiero
algo totalmente diferente, algo innovador, rupturista"*. Contradice
además la propia guía de marca (`assets/logos/BRAND.md`), que documenta
el teal `#00C9A7` como acento oficial de Nexo dentro de Cimientos.

A partir de esta conversación, el usuario decidió algo más amplio: cada
producto ETEMEN (Nexo, Hojear, indago, CHILE-OEF) debe tener una
identidad visual **100% independiente** entre sí. El único ADN
compartido pasa a ser la disciplina del logo (mark plano, un solo tono,
sin gradientes ni glow) — no una paleta ni tipografía compartida. Esto
reemplaza a Cimientos como sistema unificador para los productos
(el home de ETEMEN como "índice" queda fuera de este cambio por ahora).

Dado el tamaño de esa decisión, se decidió descomponerla: este documento
cubre **solo Nexo**, el primer producto en pasar por el ciclo completo.
Los demás productos se rediseñarán en ciclos propios, después.

Se usó la skill `frontend-design` para generar direcciones que evitaran
los 3 defaults genéricos de diseño con IA que la propia skill nombra
(crema+serif+terracota / negro+acento ácido / periódico con líneas
finas) — el diseño actual de Nexo es una instancia casi literal del
segundo default.

## Dirección elegida: "Libro de caja"

Ancla el diseño en el objeto real que Nexo viene a reemplazar: el
cuaderno de cuentas y el talonario de boletas que ya usa cualquier local
chileno. No es una metáfora decorativa — la cuadrícula de cuaderno y el
rollo de papel de boleta son estructura real de la página, no fondo.

Se descartaron dos alternativas presentadas y no elegidas:
- **"Letrero pintado a mano"** — más rupturista visualmente, pero
  arriesgaba leerse poco serio para un producto que maneja pagos reales.
- **"Turno / Ficha"** (dispensador de números) — la más juguetona
  estructuralmente, pero se alejaba demasiado de "esto maneja tu caja".

### Tokens de diseño

| Token | Valor | Uso |
|---|---|---|
| `--nexo-paper` | `#EFEBE3` | Fondo (papel reciclado grisáceo, no el crema genérico) |
| `--nexo-ink` | `#1C1A17` | Texto principal |
| `--nexo-ledger-red` | `#B8332F` | Pérdidas, descuentos negativos, urgencia |
| `--nexo-ledger-blue` | `#2B4570` | Ahorros, confirmaciones, acento primario |
| `--nexo-rule` | `rgba(28,26,23,.12)` | Líneas de cuaderno (estructurales, no decorativas) |
| `--nexo-paper-2` | `#E4DFD3` | Superficie elevada (tarjetas) |

**Tipografía:**
- Display / ticket: **Special Elite** (typewriter con textura de
  desgaste real — evoca boleta térmica vieja). Uso restringido: títulos
  de sección, montos del ticket, headline.
- Cuerpo: **IBM Plex Sans** — legible, sin personalidad prestada de otro
  producto del sitio.
- Datos/timestamps: IBM Plex Mono (cara utilitaria neutra, ya se usa en
  todo el sitio como workhorse — no aporta ni resta identidad).

Ninguna de las tres se comparte como "familia de marca" con Hojear
(Newsreader/Archivo) ni con el home (Archivo/Source Sans) — Plex Mono se
repite solo como utilidad de datos, no como elección de personalidad.

## Estructura por sección

### Hero
Sin headline gigante genérico. El fondo es la cuadrícula/líneas de
cuaderno dibujadas por CSS (`repeating-linear-gradient` con
`--nexo-rule`, no una imagen/textura fotográfica), y esas mismas líneas
son la estructura real donde se alinea el contenido — no un patrón
decorativo detrás de una tarjeta flotante. El titular se trata como una
anotación escrita a mano sobre la primera línea del cuaderno. Mantiene
el `btn-row` con los dos CTA existentes (`#flujo`, `#precios`).

### Selector de rubro (`#flujo`)
Se preservan íntegros los hooks que usa `js/nexo-flujo.js`:
`[data-rubro-selector]`, `#rubro-panel`, `[data-panel-familia]`,
`[data-panel-titulo]`, `[data-panel-precio]`, `[data-panel-trial]`,
`[data-panel-demo]`, `[data-panel-app]`. Solo cambia el estilo visual:
las opciones de rubro pasan de "tabs" industriales a pestañas de
talonario (recorte diagonal superior, apiladas).

### Simulador POS → rollo de papel real
`#pos-receipt-lines` deja de ser una tarjeta con líneas y se convierte
en un rollo de papel de impresora que crece hacia abajo a medida que
`renderPOS()` agrega `.pos-receipt-line`: borde inferior dentado
(perforado, vía `clip-path` o `mask` con dientes repetidos), ancho fijo
angosto, cada línea con fuente Special Elite. Mismos IDs
(`#pos-receipt-lines`, `#pos-total-val`, `#pos-add-items`,
`#pos-pay-btn`) — cero cambios de JS en `renderPOS`/`updateAddButtons`/
`select`/el listener de `posPayBtn`.

### Calculadora de ROI (nueva, real)
`js/nexo-flujo.js` ya tiene `calcROI()` completo apuntando a
`#range-citas`, `#range-stock`, `#roi-val-res` — nunca tuvo HTML
correspondiente (hallazgo de esta misma sesión). Se agrega el HTML real
esta vez: dos sliders ("citas perdidas al mes", "horas de desorden de
stock a la semana") + un resultado en rojo/azul contable según el signo
("cuánto pierdes sin Nexo" vs "cuánto te ahorras"). Ningún cambio de JS
necesario, solo el markup que faltaba.

### Precios (`#precios`)
Las tarjetas de precio se rediseñan como "hojas de talonario": borde de
desgarre (zigzag) en el borde superior, mismo contenido/copy existente
("Por confirmar", lista de bullets, CTA de contacto) — no se inventan
cifras nuevas.

### Footer
Se mantiene la estructura de links existente (Productos, Nexo por
Rubro, Empresa), solo se re-skinnea con los tokens nuevos.

## Contenido / copy

Sin cambios de fondo en el copy existente (ya es factual, sin cifras
inventadas). Se revisa tono siguiendo la guía de `frontend-design`:
voz activa, nombrar cosas por lo que la persona controla ("cobra en
caja", no "procesa transacciones"). Cualquier copy nuevo (labels de la
calculadora de ROI) sigue el mismo criterio.

## Accesibilidad y responsive

- Contraste tinta `#1C1A17` sobre papel `#EFEBE3`: se verifica ratio
  AA antes de cerrar implementación.
- Foco de teclado visible en todos los controles interactivos
  (selector de rubro, botones de agregar producto al ticket, sliders
  de ROI).
- `prefers-reduced-motion` respetado en cualquier animación del rollo
  de papel (crecer/asentarse al agregar un ítem).
- Mobile: el rollo de papel del ticket pasa a ancho completo, el
  selector de rubro pasa a scroll horizontal (ya es el patrón actual).

## Archivos afectados

- `css/nexo-v1.css` — reescritura completa de tokens y componentes.
- `nexo/index.html` — reestructura de markup por sección (hero, rollo
  de papel, ROI nuevo, tarjetas de precio); mismos `id`/`data-*` donde
  el JS los necesita.
- `js/nexo-flujo.js` — sin cambios de lógica; se verifica que los
  nuevos hooks de ROI (`#range-citas`, `#range-stock`, `#roi-val-res`)
  existan en el HTML nuevo.
- Fuentes: agregar `Special Elite` e `IBM Plex Sans` al `<link>` de
  Google Fonts de `nexo/index.html` (Plex Mono ya está cargado
  globalmente).
- Assets: `assets/logos/nexo-mark.svg` (ya existe, plano, cobre —
  revisar si el cobre sigue calzando con la paleta roja/azul nueva o
  si el mark necesita un ajuste de color menor).

## Fuera de alcance

- Home, Hojear, indago, CHILE-OEF — quedan para ciclos de diseño
  propios y futuros.
- No se toca `js/nexo-flujo.js` más allá de verificar los hooks de
  ROI — su lógica de datos (`RUBROS`, `renderPOS`, `updateAddButtons`,
  `select`) es correcta y no es parte de este rediseño visual.
- No se inventan cifras de precio ni de ROI que no vengan ya del
  cálculo existente (`calcROI`) o del copy ya aprobado.
