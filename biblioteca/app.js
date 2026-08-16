/* Hojear — app (catálogo en catalog.js) */
const guides = [
  ['sub-terra', 'Sub terra: minería, naturalismo y desigualdad', 'Contexto social, narrador, símbolos y preguntas de análisis.'],
  ['martin-rivas', 'Martín Rivas: clase, ciudad y ascenso social', 'Personajes, conflicto central y lectura del Chile del siglo XIX.'],
  ['juana-lucero', 'Juana Lucero: identidad, ciudad y desigualdad', 'Protagonista, entorno y tensiones sociales.'],
  ['cuentos-amor', 'Quiroga: tensión, atmósfera y desenlace', 'Pistas y fuerza de un cuento breve.'],
  ['frankenstein', 'Frankenstein: ciencia, ética y monstruos', 'Qué hace humano a un personaje y cómo argumentarlo.'],
  ['dracula', 'Drácula: miedo, forma epistolar y deseo', 'Novela con múltiples voces.'],
  ['jekyll-hyde', 'Jekyll y Hyde: doble identidad y misterio', 'Secreto, narrador y transformación.'],
  ['isla-tesoro', 'La isla del tesoro: aventura y decisiones', 'Narrador, viaje del héroe y lealtad.'],
  ['quijote', 'Don Quijote: imaginación, humor y aventura', 'Pares de personajes y parodia.'],
  ['lazarillo', 'Lazarillo: crítica social y picaresca', 'Narrador protagonista, ironía y supervivencia.'],
  ['niebla', 'Niebla: identidad, ficción y libertad', 'Metaficción sin perder el hilo.'],
  ['facundo', 'Facundo: civilización y barbarie', 'Ensayo político y figuras de la pampa.'],
  ['ariel', 'Ariel: idealismo y juventud americana', 'Ideas de Rodó para el debate cultural.'],
  ['pazos-ulloa', 'Los pazos de Ulloa: naturalismo gallego', 'Poder rural, personajes y ambiente.']
];

const GENRE_ORDER = ['Novela', 'Cuentos', 'Poesía', 'Teatro', 'Ensayo', 'Historia', 'Clásico', 'Aventura', 'Misterio', 'Educativo', 'Revista', 'Investigación'];
const PLACES = ['Chile', 'Latinoamérica', 'Universal'];
const LANG_LABEL = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português', la: 'Latín' };
const bookLang = b => b.lang || 'es';
const langsInCatalog = () => {
  const seen = new Set((typeof books !== 'undefined' ? books : []).map(bookLang));
  return Object.keys(LANG_LABEL).filter(k => seen.has(k));
};
const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const bookHay = b => fold([b.title, b.author, b.genre, b.type, b.place, LANG_LABEL[bookLang(b)], b.desc, b.year].join(' '));
const bookGenre = b => b.genre || b.type || 'Otros';
const genresInCatalog = () => {
  const seen = new Set((typeof books !== 'undefined' ? books : []).map(bookGenre));
  return [...GENRE_ORDER.filter(g => seen.has(g)), ...[...seen].filter(g => !GENRE_ORDER.includes(g)).sort()];
};
const countWhere = pred => (typeof books !== 'undefined' ? books : []).filter(pred).length;

/** Afiliados Buscalibre (Chile). Tras aprobación, pega el ID en localStorage:
 *  localStorage.setItem('hojear-bc-aff', 'TU_ID')
 *  o define HOJEAR_BC_AFFILIATE_ID abajo. */
const HOJEAR_BC_AFFILIATE_ID = (typeof localStorage !== 'undefined' && localStorage.getItem('hojear-bc-aff')) || '';
const BC_SEARCH = 'https://www.buscalibre.cl/libros/search';

const readableCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.hasText).length;
const chileCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.hasText && b.place === 'Chile').length;
const oerCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.license && String(b.license).indexOf('CC') === 0).length;
const q = new URLSearchParams(location.search);
let view = q.get('vista') || 'inicio';
let selected = q.get('libro') || 'quijote';

const link = (vista, extra = '') => `?vista=${vista}${extra}`;
const audioPack = id => (typeof hojearAudio !== 'undefined' && hojearAudio[id]) || null;
const hasAudio = b => !!(audioPack(b && b.id) && audioPack(b.id).tracks && audioPack(b.id).tracks.length);
const escapeHtml = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtTime = sec => {
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
/** Link de compra Buscalibre (edición física / moderna). */
const buyUrl = b => {
  if (b.buyUrl) return b.buyUrl;
  const qstr = encodeURIComponent(`${b.title} ${b.author}`.trim());
  let url = `${BC_SEARCH}?q=${qstr}`;
  // Parámetro genérico; el panel de afiliados de Buscalibre puede dar links con tracking propio.
  if (HOJEAR_BC_AFFILIATE_ID) {
    url += `&afiliado=${encodeURIComponent(HOJEAR_BC_AFFILIATE_ID)}`;
  }
  return url;
};
const buyBtn = b =>
  `<a class="button alt buy-bc" href="${buyUrl(b)}" target="_blank" rel="noopener sponsored">Comprar el libro</a>`;

function nav() {
  return `<nav><div class="wrap nav-in"><a class="brand" href="${link('inicio')}"><img class="brand-logo" src="/assets/logos/hojear-mark.svg" width="30" height="30" alt="">Hojear</a><button type="button" class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">Menú</button><div class="nav-links"><a href="${link('catalogo')}">Libros</a><a href="${link('guias')}">Guías</a><a class="pill" href="/contacto/?producto=Hojear+Plus">Plus</a></div></div></nav>`;
}
function bindNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
}
function footer() {
  return `<footer class="footer"><div class="wrap foot"><span>Hojear · ETEMEN</span><span data-visitas hidden></span><span><a href="${link('catalogo')}">Libros</a> · <a href="${link('guias')}">Guías</a> · <a href="/contacto/?producto=Hojear+Plus">Plus</a></span></div></footer>`;
}
function bookCard(b) {
  const dest = b.hasText ? link('leer', '&libro=' + b.id) : link('libro', '&libro=' + b.id);
  return `<a class="book ${b.color || 'brown'}" href="${dest}"><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span></div></a>`;
}

function home() {
  const featured = books.filter(b => b.hasText).slice(0, 8);
  return `<main>
<section class="hero"><div class="wrap">
  <span class="eyebrow">Hojear</span>
  <h1>Lee un libro.<br><em>Gratis.</em></h1>
  <p class="lead">Busca un título o un autor. Toca el libro y lee.</p>
  <form class="home-search" action="" method="get">
    <input type="hidden" name="vista" value="catalogo">
    <label class="visually-hidden" for="home-q">Buscar un libro</label>
    <input id="home-q" name="q" type="search" placeholder="Busca un título o un autor" autocomplete="off">
    <button type="submit" class="button">Buscar</button>
  </form>
  <div class="actions">
    <a class="button" href="${link('catalogo')}">Ver los libros</a>
    <a class="button alt" href="${link('leer', '&libro=sub-terra')}">Empezar con Sub terra</a>
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="head"><div><span class="eyebrow">Para empezar</span><h2>Toca uno y lee.</h2></div>
  <a class="text-link" href="${link('catalogo')}">Ver todos →</a></div>
  <div class="stack"><div class="books">${featured.map(bookCard).join('')}</div><div class="shelf-plank" aria-hidden="true"></div></div>
</div></section>
</main>`;
}

function chip(mode, filter, title, extraClass = '') {
  return `<button type="button" class="chip ${extraClass}" data-mode="${mode}" data-filter="${filter}" aria-pressed="false">${title}</button>`;
}
function catalogue() {
  return `<main class="page cat"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / Libros</div>
    <h1 class="cat-h1">Libros</h1>
    <p class="lead">Escribe un nombre o elige un grupo.</p>
    <label class="cat-search">
      <span class="visually-hidden">Buscar un libro</span>
      <input id="cat-q" type="search" placeholder="Busca un título o un autor" autocomplete="off" spellcheck="false">
    </label>
    <div class="chips" id="filters-quick">
      ${chip('reset', 'todos', 'Todos', 'active')}
      ${chip('lang', 'es', 'En español')}
      ${chip('place', 'Chile', 'Chile')}
      ${chip('genre', 'Novela', 'Novela')}
      ${chip('genre', 'Cuentos', 'Cuentos')}
      ${chip('genre', 'Poesía', 'Poesía')}
      ${chip('audio', 'audio', 'Con audio')}
    </div>
    <p class="cat-count" id="cat-count"></p>
    <div id="catalogue-books"></div>
  </div></main>`;
}

function bookPage(b) {
  const readBtn = b.hasText
    ? `<a class="button" href="${link('leer', '&libro=' + b.id)}">Leer</a>`
    : `<a class="button alt" href="${link('catalogo')}">Volver a los libros</a>`;
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / <a href="${link('catalogo')}">Libros</a> / ${b.title}</div>
    <section class="book-hero">
      <div class="cover ${b.color}"><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span></div></div>
      <div>
        <h1 style="font-size:clamp(2.4rem,5vw,4rem);margin-bottom:12px">${b.title}</h1>
        <p class="meta">${b.author}${b.year ? ' · ' + b.year : ''}<br>${b.desc || ''}</p>
        <p class="libro-hits" id="libro-hits" hidden></p>
        <div class="actions">
          ${readBtn}
          ${hasAudio(b) ? `<a class="button alt" href="${link('escuchar', '&libro=' + b.id)}">Escuchar</a>` : ''}
          ${buyBtn(b)}
        </div>
      </div>
    </section>
  </div></main>`;
}

function internalReader(b) {
  if (!b.hasText) {
    return `<main class="page"><div class="wrap">
      <div class="crumb"><a href="${link('catalogo')}">Libros</a> / ${b.title}</div>
      <div class="pend">
        <div class="pend-mark">⏳</div>
        <span class="eyebrow">Aún no</span>
        <h2 class="pend-h1">Este libro todavía no se puede leer aquí.</h2>
        <p class="lead">Elige otro o abre la guía de «${b.title}».</p>
        <div class="actions pend-actions">
          <a class="button" href="${link('catalogo')}">Ver los libros</a>
          <a class="button alt" href="${link('guia', '&libro=' + b.id)}">Abrir guía</a>
        </div>
      </div>
    </div></main>`;
  }
  return `<main class="page reader-page"><div class="wrap">
    <div class="reader-stage theme-paper mode-page" id="reader-stage">
      <header class="reader-topbar" id="reader-topbar">
        <a class="back" href="${link('catalogo')}" title="Volver a los libros">← Libros</a>
        <a class="meta-mini" href="${link('libro', '&libro=' + b.id)}"><strong>${b.title}</strong></a>
        <div class="reader-tools">
          ${hasAudio(b) ? `<button type="button" id="fr-audio-toggle" class="rtool" title="Escuchar audio flotante" aria-label="Escuchar audio">🎧 Audio</button>` : ''}
          <button type="button" id="fr-settings" class="rtool" title="Letra y pantalla" aria-label="Letra y pantalla">Aa</button>
        </div>
      </header>
      <div class="reader-settings" id="reader-settings" hidden>
        <div class="set-row">
          <span>Letra</span>
          <button type="button" id="fr-minus" class="rtool" aria-label="Letra más chica">A−</button>
          <button type="button" id="fr-plus" class="rtool" aria-label="Letra más grande">A+</button>
        </div>
        <div class="set-row">
          <span>Pantalla</span>
          <div class="theme-choice" role="group" aria-label="Pantalla">
            <button type="button" class="theme-choice-btn active" data-theme="paper">Clara</button>
            <button type="button" class="theme-choice-btn" data-theme="sepia">Sepia</button>
            <button type="button" class="theme-choice-btn" data-theme="night">Noche</button>
          </div>
        </div>
        <div class="set-row">
          <span>Vista</span>
          <div class="theme-choice" role="group" aria-label="Modo de lectura">
            <button type="button" class="mode-choice-btn active" data-mode="page">Página única</button>
            <button type="button" class="mode-choice-btn" data-mode="book">Doble hoja</button>
            <button type="button" class="mode-choice-btn" data-mode="scroll">Scroll</button>
          </div>
        </div>
        <div class="reader-toc-inline" id="reader-toc" hidden>
          <div class="toc-head">Capítulos</div>
          <div class="toc-list" id="toc-list"></div>
        </div>
        <div class="set-links">
          ${hasAudio(b) ? `<a class="simple-btn" href="${link('escuchar', '&libro=' + b.id)}">Página de Audio</a>` : ''}
          <a class="simple-btn" href="${link('guia', '&libro=' + b.id)}">Guía</a>
          <button type="button" class="simple-btn" id="read-reset">Empezar de nuevo</button>
        </div>
      </div>
      <button type="button" class="reader-side-btn side-prev" id="reader-side-prev" aria-label="Página anterior">‹</button>
      <button type="button" class="reader-side-btn side-next" id="reader-side-next" aria-label="Página siguiente">›</button>
      <div class="reader-shell" id="reader-shell">
        <div>
          <article class="reader-body mode-page" id="reader-text" style="--read-size:1.125rem;--read-lh:1.78;--read-measure:42rem">
            <p class="reader-loading">Abriendo el libro…</p>
          </article>
          <div class="book-desk" id="book-desk" aria-label="Libro abierto">
            <div class="book-open" id="book-open">
              <button type="button" class="book-hit book-hit-left" id="book-hit-left" aria-label="Página anterior"></button>
              <button type="button" class="book-hit book-hit-right" id="book-hit-right" aria-label="Página siguiente"></button>
              <div class="book-leaf leaf-left">
                <div class="leaf-inner" id="leaf-left"><p class="reader-loading">…</p></div>
                <span class="leaf-num" id="leaf-num-l"></span>
              </div>
              <div class="book-spine" aria-hidden="true"></div>
              <div class="book-leaf leaf-right">
                <div class="leaf-inner" id="leaf-right"><p class="reader-loading">…</p></div>
                <span class="leaf-num" id="leaf-num-r"></span>
              </div>
            </div>
          </div>
          <p class="book-hint" id="book-hint">Toca las flechas o los bordes para pasar</p>
        </div>
      </div>
      ${hasAudio(b) ? `
      <div class="reader-audio-bar" id="reader-audio-bar" hidden>
        <audio id="fr-audio-el" preload="metadata"></audio>
        <div class="rab-row">
          <div class="rab-info" id="rab-info"><strong>Audio</strong></div>
          <div class="rab-controls">
            <button type="button" class="rab-btn" id="rab-back15" title="Rebobinar 15s">−15s</button>
            <button type="button" class="rab-btn play-btn" id="rab-play" title="Reproducir / Pausa">▶</button>
            <button type="button" class="rab-btn" id="rab-fwd15" title="Avanzar 15s">+15s</button>
            <button type="button" class="rab-btn" id="rab-speed" title="Velocidad">1x</button>
            <button type="button" class="rab-btn" id="rab-close" title="Ocultar audio">✕</button>
          </div>
        </div>
        <div class="rab-progress">
          <span id="rab-cur">0:00</span>
          <input type="range" id="rab-seek" min="0" max="1000" value="0" aria-label="Avance del audio">
          <span id="rab-dur">0:00</span>
        </div>
      </div>
      ` : ''}
      <div class="read-ctrl" id="read-ctrl" hidden>
        <button type="button" class="read-btn" id="read-prev" aria-label="Anterior">‹</button>
        <div class="read-mid">
          <div class="read-progress" id="read-bar"><span class="read-fill" id="read-fill"></span></div>
          <span class="read-meta" id="read-meta"></span>
        </div>
        <button type="button" class="read-btn" id="read-next" aria-label="Siguiente">›</button>
      </div>
      <p class="reader-credit">Hojear</p>
    </div>
  </div></main>`;
}

function guideList() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / Guías</div>
    <span class="eyebrow">Guías</span>
    <h1 style="font-size:clamp(2.8rem,5.5vw,4.8rem);max-width:800px">Para entender el libro.</h1>
    <p class="lead">Qué pasa, quién habla y qué preguntarte.</p>
    <div class="guide-list">${guides.map((g, i) =>
      `<article class="guide-card"><b>${String(i + 1).padStart(2, '0')}</b><div><h3>${g[1]}</h3><p>${g[2]}</p></div>
      <a class="simple-btn" href="${link('guia', '&libro=' + g[0])}">Abrir guía →</a></article>`
    ).join('')}</div>
  </div></main>`;
}

function guidePage(b) {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / <a href="${link('guias')}">Guías</a> / ${b.title}</div>
    <span class="eyebrow">Guía</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">${b.title}</h1>
    <p class="lead">Para entender el libro, no para copiar.</p>
    <section class="study">
      <article class="card">
        <h3>Antes de leer</h3>
        <p>${b.desc}</p>
        <p><strong>Fíjate en:</strong> quién cuenta la historia, qué desea el personaje principal y qué obstáculo transforma su camino.</p>
        <h3 style="margin-top:30px">Preguntas para pensar</h3>
        <div class="question">01 · ¿Cuál es el conflicto que pone en movimiento la obra?</div>
        <div class="question">02 · ¿Qué crítica o tensión de su época aparece?</div>
        <div class="question">03 · Elige un símbolo y explica qué representa.</div>
        <div class="question">04 · ¿Qué cambia al final?</div>
      </article>
      <aside class="card">
        <h3>El libro</h3>
        <p><strong>Autor:</strong><br>${b.author}</p>
        <p><strong>Tipo:</strong><br>${b.genre || b.type}</p>
        <p><strong>De:</strong><br>${b.place}</p>
        ${b.hasText ? `<a class="button" style="margin-top:10px" href="${link('leer', '&libro=' + b.id)}">Leer</a>` : `<a class="button alt" style="margin-top:10px" href="${link('catalogo')}">Ver los libros</a>`}
        <div style="margin-top:12px">${buyBtn(b)}</div>
      </aside>
    </section>
  </div></main>`;
}

function plans() {
  return `<main class="page"><div class="wrap">
    <span class="eyebrow">Acceso</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">Lee libre. Plus llega después.</h1>
    <section class="study">
      <article class="card"><h3>Hojear Libre</h3>
        <p><strong style="font:500 2.4rem var(--serif);color:var(--gold)">$0</strong></p>
        <p>Libros, lector y guías. Sin anuncios.</p>
        <a class="button alt" href="${link('catalogo')}">Ver los libros</a>
      </article>
      <aside class="card"><span class="eyebrow">Lista de espera</span><h3>Hojear Plus</h3>
        <p><strong style="font:500 2.4rem var(--serif);color:var(--gold)">$3.990</strong> · al mes</p>
        <p>Todavía no se cobra. Te avisamos cuando esté listo.</p>
        <a class="button" href="/contacto/?producto=Hojear+Plus">Avisarme</a>
      </aside>
    </section>
  </div></main>`;
}

function checkout() {
  return `<main class="page"><div class="wrap signup">
    <span class="eyebrow">Hojear Plus</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4rem)">Aún no hay cobro.</h1>
    <p class="lead" style="margin:auto">Déjanos un correo. Te avisamos cuando Plus esté disponible.</p>
    <div class="card" style="margin-top:32px;text-align:left">
      <a class="button" href="/contacto/?producto=Hojear+Plus">Avisarme</a>
    </div>
  </div></main>`;
}

function resources() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / Fuentes</div>
    <span class="eyebrow">Fuentes</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:780px">De dónde salen los libros.</h1>
    <section class="study">
      <article class="card">
        <h3>Libros libres</h3>
        <p>Clásicos que ya se pueden publicar. Gutenberg, Wikisource y archivos públicos.</p>
        <a class="button" href="${link('catalogo')}">Ver los libros</a>
      </article>
      <aside class="card">
        <h3>Chile</h3>
        <p><em>Sub terra</em>, <em>Martín Rivas</em> y otros textos chilenos.</p>
        <a class="button" href="${link('catalogo')}&filtro=Chile">Ver Chile</a>
      </aside>
    </section>
    <section class="study">
      <article class="card">
        <h3>Comprar el libro</h3>
        <p>Si quieres el libro en papel, hay un botón <strong>Comprar el libro</strong> en cada título.</p>
        <a class="button" href="https://www.buscalibre.cl/" target="_blank" rel="noopener sponsored">Ir a Buscalibre</a>
      </article>
      <aside class="card">
        <h3>Escuchar</h3>
        <p>En varios clásicos el audio se oye aquí mismo, sin salir de Hojear.</p>
        <a class="button alt" href="${link('escuchar', '&libro=lazarillo')}">Probar con Lazarillo</a>
      </aside>
    </section>
  </div></main>`;
}

function routes() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / Rutas</div>
    <span class="eyebrow">Por dónde empezar</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:780px">Cuatro caminos fáciles.</h1>
    <section class="study">
      <article class="card"><h3>Clásicos hispanos</h3>
        <p><em>Quijote</em>, <em>Lazarillo</em>, <em>El Buscón</em>, <em>Niebla</em>.</p>
        <a class="button" href="${link('leer', '&libro=quijote')}">Empezar con el Quijote →</a>
      </article>
      <aside class="card"><h3>América que piensa</h3>
        <p><em>Facundo</em>, <em>Ariel</em>, <em>La Edad de Oro</em>, <em>Azul...</em></p>
        <a class="button" href="${link('leer', '&libro=ariel')}">Leer Ariel →</a>
      </aside>
    </section>
    <section class="study">
      <article class="card"><h3>Realismo español</h3>
        <p>Galdós y Pardo Bazán: <em>Marianela</em>, <em>Misericordia</em>, <em>Los pazos de Ulloa</em>.</p>
        <a class="button" href="${link('leer', '&libro=marianela')}">Abrir Marianela →</a>
      </article>
      <aside class="card"><h3>Estudio e investigación</h3>
        <p>Filosofía de Balmes, geografía histórica, informe Hiroshima y biografías.</p>
        <a class="button" href="${link('catalogo')}">Filtrar educativos →</a>
      </aside>
    </section>
  </div></main>`;
}

function join() {
  return `<main class="page"><div class="wrap signup">
    <span class="eyebrow">Lista de espera</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4rem)">Una mejor forma de acercarse a los libros.</h1>
    <form class="form" id="join-form"><input aria-label="Tu correo" type="email" required placeholder="tu@correo.cl"><button type="submit">Quiero leer</button></form>
    <p id="form-message" class="catalogue-note">Demo: luego se conecta a una lista real.</p>
  </div></main>`;
}

function how() {
  return `<main class="page"><div class="wrap">
    <span class="eyebrow">Producto</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">Gratis para entrar. Útil para volver.</h1>
    <section class="study">
      <article class="card"><h3>Plan gratuito</h3><p>Libros, lector y guías.</p>
      <h3>Hojear Plus</h3><p>Guías completas, simulacros y packs mensuales.</p></article>
      <aside class="card"><h3>La idea</h3><p>El dominio público atrae. Las guías y la experiencia son la membresía.</p>
      <a class="button" href="${link('unete')}">Lista de espera →</a></aside>
    </section>
  </div></main>`;
}

/* ── Lector: libro por hojas (default) + scroll opcional ── */
function leerLoader(b) {
  const art = document.getElementById('reader-text');
  if (!art) return;
  document.body.classList.add('reading-mode');
  const stage = document.getElementById('reader-stage');
  const shell = document.getElementById('reader-shell');
  const topbar = document.getElementById('reader-topbar');
  const settings = document.getElementById('reader-settings');
  const ctrl = document.getElementById('read-ctrl');
  const prevBtn = document.getElementById('read-prev');
  const nextBtn = document.getElementById('read-next');
  const metaEl = document.getElementById('read-meta');
  const fill = document.getElementById('read-fill');
  const tocList = document.getElementById('toc-list');
  const tocPanel = document.getElementById('reader-toc');
  const bookOpen = document.getElementById('book-open');
  const leafL = document.getElementById('leaf-left');
  const leafR = document.getElementById('leaf-right');
  const numL = document.getElementById('leaf-num-l');
  const numR = document.getElementById('leaf-num-r');
  const hint = document.getElementById('book-hint');
  const storageKey = 'hojear-read-v1:' + b.id;
  let pages = [];
  let rawParas = [];
  let idx = 0; // índice de página o pliego
  let fr = 100;
  let lh = 178;
  let measure = 42;
  let theme = 'paper';
  let mode = 'page'; // page (Focus Única) | book (Doble hoja) | scroll (Scroll)
  let chromeTimer = null;
  let flipping = false;
  let touchX = null;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function isHead(t) {
    if (t.length > 100) return false;
    if (/^(cap[ií]tulo|cap[\.\s]|parte\b|pr[oó]logo|ep[ií]logo|dedicatoria|libro\b|secci[óo]n|conclusi[óo]n|introducci[óo]n|acto\b|escena|tom[oa]\b|nota\b|ap[eé]ndice|advertencia|prefaci)/i.test(t)) return true;
    const u = t.replace(/[.,;:!?¡¿"'()\-—–]/g, '').trim();
    return u.length > 3 && u.length < 70 && /^[A-ZÁÉÍÓÚÑÜ0-9][A-ZÁÉÍÓÚÑÜ0-9\s.,;:!?¡¿\-—']+$/.test(u);
  }
  function isMobileBook() {
    return window.innerWidth < 860;
  }
  function spreadStep() {
    return (mode === 'book' && !isMobileBook()) ? 2 : 1;
  }
  function applyChrome() {
    const base = 1.125 * (fr / 100);
    art.style.setProperty('--read-size', base.toFixed(3) + 'rem');
    art.style.setProperty('--read-lh', (lh / 100).toFixed(2));
    art.style.setProperty('--read-measure', measure + 'rem');
    if (bookOpen) {
      bookOpen.style.setProperty('--read-size', base.toFixed(3) + 'rem');
      bookOpen.style.setProperty('--read-lh', (lh / 100).toFixed(2));
    }
    if (stage) {
      stage.className = 'reader-stage theme-' + theme + ' mode-' + mode;
    }
    art.classList.remove('mode-scroll', 'mode-book', 'mode-page');
    art.classList.add('mode-' + mode);
    document.querySelectorAll('.theme-choice-btn').forEach(p => {
      p.classList.toggle('active', p.dataset.theme === theme);
    });
    document.querySelectorAll('.mode-choice-btn').forEach(p => {
      p.classList.toggle('active', p.dataset.mode === mode);
    });
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ page: idx, fr, lh, measure, theme, mode, scrollY: window.scrollY }));
    } catch (_) {}
  }
  function loadSaved() {
    try {
      const cur = localStorage.getItem(storageKey);
      if (cur) return JSON.parse(cur);
      const legacyKeys = ['umbral-read-v3:' + b.id, 'Umbral-read-v3:' + b.id];
      for (const k of legacyKeys) {
        const old = localStorage.getItem(k);
        if (old) {
          localStorage.setItem(storageKey, old);
          try { localStorage.removeItem(k); } catch (_) {}
          return JSON.parse(old);
        }
      }
      return null;
    } catch (_) { return null; }
  }
  function paraToHtml(t, withDrop) {
    if (isHead(t)) return '<h3 class="p-h">' + esc(t) + '</h3>';
    return '<p' + (withDrop ? ' class="firstbit"' : '') + '>' + esc(t) + '</p>';
  }
  function pageHtml(pageIndex, isFirstOverall) {
    if (pageIndex < 0 || pageIndex >= pages.length) {
      return '<div class="leaf-empty">—</div>';
    }
    const seg = pages[pageIndex];
    let h = '';
    if (pageIndex === 0 && isFirstOverall) {
      h += '<div class="p-cover"><h2 class="p-chapter">' + esc(b.title) + '</h2><p class="p-author">' + esc(b.author) + ' · ' + esc(String(b.year)) + '</p></div>';
    }
    let firstP = pageIndex === 0;
    for (const q of seg) {
      const t = q.trim();
      if (!isHead(t) && firstP) {
        h += paraToHtml(t, pageIndex === 0);
        firstP = false;
      } else {
        h += paraToHtml(t, false);
        if (!isHead(t)) firstP = false;
      }
    }
    return h || '<div class="leaf-empty">—</div>';
  }
  function animateFlip(dir) {
    if (!bookOpen || flipping) return Promise.resolve();
    flipping = true;
    bookOpen.classList.remove('is-flipping-next', 'is-flipping-prev');
    void bookOpen.offsetWidth;
    bookOpen.classList.add(dir === 'next' ? 'is-flipping-next' : 'is-flipping-prev');
    return new Promise(res => {
      setTimeout(() => {
        bookOpen.classList.remove('is-flipping-next', 'is-flipping-prev');
        flipping = false;
        res();
      }, 480);
    });
  }
  function renderContent(i, withAnim) {
    const isTwoCol = (mode === 'book' && !isMobileBook());
    const step = isTwoCol ? 2 : 1;
    const maxIdx = Math.max(0, pages.length - 1);
    if (isTwoCol) i = Math.floor(i / 2) * 2;
    idx = Math.max(0, Math.min(maxIdx, i));

    const paint = () => {
      if (mode === 'page') {
        art.innerHTML = pageHtml(idx, true);
      } else if (mode === 'book') {
        if (isMobileBook()) {
          if (leafL) leafL.innerHTML = '';
          if (leafR) leafR.innerHTML = pageHtml(idx, true);
          if (numL) numL.textContent = '';
          if (numR) numR.textContent = String(idx + 1);
        } else {
          if (leafL) leafL.innerHTML = pageHtml(idx, true);
          if (leafR) leafR.innerHTML = pageHtml(idx + 1, true);
          if (numL) numL.textContent = pages[idx] ? String(idx + 1) : '';
          if (numR) numR.textContent = pages[idx + 1] ? String(idx + 2) : '';
        }
      }
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'auto' });
      save();
    };

    if (withAnim && mode === 'book') {
      animateFlip(withAnim).then(paint);
    } else {
      paint();
    }
  }
  function goNext() {
    if (mode === 'scroll' || flipping) return;
    const step = (mode === 'book' && !isMobileBook()) ? 2 : 1;
    if (idx + step >= pages.length) return;
    renderContent(idx + step, 'next');
  }
  function goPrev() {
    if (mode === 'scroll' || flipping) return;
    const step = (mode === 'book' && !isMobileBook()) ? 2 : 1;
    if (idx <= 0) return;
    renderContent(idx - step, 'prev');
  }
  function renderScroll() {
    let h = '<div class="p-cover"><h2 class="p-chapter">' + esc(b.title) + '</h2><p class="p-author">' + esc(b.author) + ' · ' + esc(String(b.year)) + '</p></div>';
    let firstP = true;
    pages.forEach((seg, pi) => {
      if (pi > 0) h += '<hr class="page-break" data-page="' + pi + '">';
      for (const q of seg) {
        const t = q.trim();
        if (!isHead(t) && firstP) {
          h += paraToHtml(t, true);
          firstP = false;
        } else {
          h += paraToHtml(t, false);
          if (!isHead(t)) firstP = false;
        }
      }
    });
    art.innerHTML = h;
    updateProgress();
    save();
  }
  function updateProgress() {
    if (!pages.length) return;
    const sidePrev = document.getElementById('reader-side-prev');
    const sideNext = document.getElementById('reader-side-next');
    prevBtn.style.visibility = 'visible';
    nextBtn.style.visibility = 'visible';
    const totalWords = rawParas.reduce((acc, p) => acc + (p.trim().split(/\s+/).length || 0), 0);
    const estMin = Math.max(1, Math.ceil(totalWords / 200));

    if (mode === 'page' || mode === 'book') {
      const isTwoCol = (mode === 'book' && !isMobileBook());
      const step = isTwoCol ? 2 : 1;
      const end = Math.min(pages.length, idx + step);
      metaEl.textContent = (isTwoCol
        ? (idx + 1) + (pages[idx + 1] ? '–' + (idx + 2) : '') + ' / ' + pages.length
        : (idx + 1) + ' / ' + pages.length) + ' · ~' + estMin + ' min';
      fill.style.width = pages.length > 1 ? Math.round((end / pages.length) * 100) + '%' : '100%';
      prevBtn.disabled = idx <= 0;
      nextBtn.disabled = idx + step >= pages.length;
      if (sidePrev) {
        sidePrev.style.display = mode === 'page' ? 'flex' : 'none';
        sidePrev.disabled = idx <= 0;
      }
      if (sideNext) {
        sideNext.style.display = mode === 'page' ? 'flex' : 'none';
        sideNext.disabled = idx + step >= pages.length;
      }
    } else {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      metaEl.textContent = pct + '% leído · ~' + estMin + ' min';
      fill.style.width = pct + '%';
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
      if (sidePrev) sidePrev.style.display = 'none';
      if (sideNext) sideNext.style.display = 'none';
    }
  }
  function buildToc() {
    const toc = [];
    rawParas.forEach((p, pi) => {
      if (isHead(p.trim())) toc.push({ title: p.trim().slice(0, 80), para: pi });
    });
    if (!tocList) return;
    if (!toc.length) {
      tocList.innerHTML = '';
      if (tocPanel) tocPanel.hidden = true;
      return;
    }
    if (tocPanel) tocPanel.hidden = false;
    tocList.innerHTML = toc.map((t, i) =>
      `<button type="button" class="toc-item" data-para="${t.para}">${esc(t.title)}</button>`
    ).join('');
    tocList.querySelectorAll('.toc-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const para = parseInt(btn.dataset.para, 10);
        let acc = 0;
        let pageFor = 0;
        for (let p = 0; p < pages.length; p++) {
          if (para >= acc && para < acc + pages[p].length) { pageFor = p; break; }
          acc += pages[p].length;
          pageFor = p;
        }
        renderContent(pageFor, false);
        if (settings) {
          settings.setAttribute('hidden', '');
          settings.classList.remove('open');
        }
        document.getElementById('fr-settings')?.classList.remove('active');
      });
    });
  }
  function showContent() {
    if (mode === 'scroll') renderScroll();
    else renderContent(idx, false);
  }

  fetch('libros/' + encodeURIComponent(b.id) + '.txt')
    .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
    .then(t => {
      const CHARS = isMobileBook() ? 1600 : 1400;
      const splitLong = (block) => {
        if (block.length <= CHARS) return [block];
        const out = [];
        const parts = block.split(/(?<=[\.\!\?…»"'])\s+|\n+/).map(s => s.trim()).filter(Boolean);
        let buf = '';
        const flush = () => { if (buf) { out.push(buf); buf = ''; } };
        for (const part of parts.length ? parts : [block]) {
          if ((buf + ' ' + part).trim().length > CHARS) {
            flush();
            if (part.length > CHARS) {
              for (let i = 0; i < part.length; i += CHARS) out.push(part.slice(i, i + CHARS));
            } else buf = part;
          } else {
            buf = buf ? (buf + ' ' + part) : part;
          }
        }
        flush();
        return out.length ? out : [block];
      };
      const blocks = t.replace(/\r\n/g, '\n').split(/\n{2,}/).map(x => x.trim()).filter(x => x.length);
      rawParas = [];
      for (const b0 of blocks) rawParas.push(...splitLong(b0));
      pages = [];
      let cur = [];
      let sum = 0;
      for (const p of rawParas) {
        if (cur.length && sum + p.length > CHARS) {
          pages.push(cur);
          cur = [];
          sum = 0;
        }
        cur.push(p);
        sum += p.length;
      }
      if (cur.length) pages.push(cur);
      if (!pages.length) {
        art.innerHTML = '<p class="reader-loading">No se pudo abrir este libro. Elige otro.</p>';
        return;
      }
      const saved = loadSaved();
      if (saved) {
        if (typeof saved.fr === 'number') fr = saved.fr;
        theme = (saved.theme === 'night' || saved.theme === 'sepia') ? saved.theme : 'paper';
        mode = (saved.mode === 'book' || saved.mode === 'scroll' || saved.mode === 'page') ? saved.mode : 'page';
        if (typeof saved.page === 'number') idx = saved.page;
      }
      applyChrome();
      buildToc();
      ctrl.hidden = false;
      showContent();
      if (mode === 'scroll' && saved && typeof saved.scrollY === 'number') {
        requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
      }
    })
    .catch(() => {
      art.innerHTML = '<p class="reader-loading">No se pudo cargar el texto. Comprueba la conexión.</p>';
      if (leafR) leafR.innerHTML = '<p class="reader-loading">No se pudo cargar el texto.</p>';
    });

  // Mini reproductor flotante dentro del lector
  const packAudio = audioPack(b.id);
  const audioToggle = document.getElementById('fr-audio-toggle');
  const audioBar = document.getElementById('reader-audio-bar');
  const frAudio = document.getElementById('fr-audio-el');
  const rabPlay = document.getElementById('rab-play');
  const rabBack15 = document.getElementById('rab-back15');
  const rabFwd15 = document.getElementById('rab-fwd15');
  const rabSpeed = document.getElementById('rab-speed');
  const rabClose = document.getElementById('rab-close');
  const rabInfo = document.getElementById('rab-info');
  const rabSeek = document.getElementById('rab-seek');
  const rabCur = document.getElementById('rab-cur');
  const rabDur = document.getElementById('rab-dur');

  if (packAudio && frAudio && audioBar) {
    const audioKey = 'hojear-audio-v1:' + b.id;
    let trackIdx = 0;
    let seeking = false;
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    let speedIdx = 0;

    function saveAudioState() {
      try { localStorage.setItem(audioKey, JSON.stringify({ i: trackIdx, t: frAudio.currentTime || 0 })); } catch (_) {}
    }

    function loadTrack(n, autoPlay) {
      trackIdx = Math.max(0, Math.min(packAudio.tracks.length - 1, n));
      const tr = packAudio.tracks[trackIdx];
      frAudio.src = tr.u;
      frAudio.playbackRate = speeds[speedIdx];
      if (rabInfo) rabInfo.innerHTML = `<strong>Cap. ${trackIdx + 1}/${packAudio.tracks.length}</strong> ${esc(tr.t)}`;
      if (rabDur) rabDur.textContent = fmtTime(tr.s);
      if (autoPlay) frAudio.play().catch(() => {});
      saveAudioState();
    }

    try {
      const savedA = JSON.parse(localStorage.getItem(audioKey) || 'null');
      if (savedA && typeof savedA.i === 'number') trackIdx = savedA.i;
      loadTrack(trackIdx, false);
      if (savedA && typeof savedA.t === 'number' && savedA.t > 2) {
        const jump = () => { frAudio.currentTime = savedA.t; frAudio.removeEventListener('loadedmetadata', jump); };
        frAudio.addEventListener('loadedmetadata', jump);
      }
    } catch (_) { loadTrack(0, false); }

    audioToggle?.addEventListener('click', () => {
      const isHidden = audioBar.hasAttribute('hidden');
      if (isHidden) {
        audioBar.removeAttribute('hidden');
        audioToggle.classList.add('active');
        if (frAudio.paused) frAudio.play().catch(() => {});
      } else {
        audioBar.setAttribute('hidden', '');
        audioToggle.classList.remove('active');
      }
    });

    rabClose?.addEventListener('click', () => {
      audioBar.setAttribute('hidden', '');
      audioToggle?.classList.remove('active');
      frAudio.pause();
    });

    rabPlay?.addEventListener('click', () => {
      if (frAudio.paused) frAudio.play().catch(() => {});
      else frAudio.pause();
    });

    frAudio.addEventListener('play', () => { if (rabPlay) rabPlay.textContent = '⏸'; audioToggle?.classList.add('active'); });
    frAudio.addEventListener('pause', () => { if (rabPlay) rabPlay.textContent = '▶'; saveAudioState(); });

    frAudio.addEventListener('timeupdate', () => {
      if (seeking) return;
      const d = frAudio.duration || packAudio.tracks[trackIdx].s || 0;
      if (rabSeek && d) rabSeek.value = String(Math.round((frAudio.currentTime / d) * 1000));
      if (rabCur) rabCur.textContent = fmtTime(frAudio.currentTime);
      if (rabDur && d) rabDur.textContent = fmtTime(d);
    });

    rabSeek?.addEventListener('input', () => { seeking = true; });
    rabSeek?.addEventListener('change', () => {
      const d = frAudio.duration || packAudio.tracks[trackIdx].s || 0;
      if (d) frAudio.currentTime = (parseInt(rabSeek.value, 10) / 1000) * d;
      seeking = false;
      saveAudioState();
    });

    rabBack15?.addEventListener('click', () => {
      frAudio.currentTime = Math.max(0, frAudio.currentTime - 15);
      saveAudioState();
    });
    rabFwd15?.addEventListener('click', () => {
      frAudio.currentTime = Math.min(frAudio.duration || 0, frAudio.currentTime + 15);
      saveAudioState();
    });

    rabSpeed?.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      const spd = speeds[speedIdx];
      frAudio.playbackRate = spd;
      rabSpeed.textContent = spd + 'x';
    });

    frAudio.addEventListener('ended', () => {
      if (trackIdx + 1 < packAudio.tracks.length) loadTrack(trackIdx + 1, true);
      else saveAudioState();
    });
  }

  prevBtn?.addEventListener('click', () => { if (mode !== 'scroll') goPrev(); });
  nextBtn?.addEventListener('click', () => { if (mode !== 'scroll') goNext(); });
  document.getElementById('reader-side-prev')?.addEventListener('click', goPrev);
  document.getElementById('reader-side-next')?.addEventListener('click', goNext);
  document.getElementById('book-hit-left')?.addEventListener('click', goPrev);
  document.getElementById('book-hit-right')?.addEventListener('click', goNext);

  document.addEventListener('keydown', function kd(e) {
    if (view !== 'leer') return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (mode === 'page' || mode === 'book') {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { goNext(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { goPrev(); e.preventDefault(); }
    }
    if (e.key === 't' || e.key === 'T') {
      const order = ['paper', 'sepia', 'night'];
      theme = order[(order.indexOf(theme) + 1) % order.length];
      applyChrome();
      save();
    }
    if ((e.key === 'm' || e.key === 'M' || e.key === 'a' || e.key === 'A') && hasAudio(b)) {
      document.getElementById('fr-audio-toggle')?.click();
      e.preventDefault();
    }
    if (e.key === '+' || e.key === '=') {
      fr = Math.min(150, fr + 10); applyChrome(); save();
    }
    if (e.key === '-') {
      fr = Math.max(80, fr - 10); applyChrome(); save();
    }
    if (e.key === 'Escape') location.href = link('catalogo');
  });

  // swipe en móvil
  bookOpen?.addEventListener('touchstart', e => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  art.addEventListener('touchstart', e => {
    if (mode === 'page') touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  
  const handleTouchEnd = e => {
    if (touchX == null || mode === 'scroll') return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) goNext();
    else goPrev();
  };
  bookOpen?.addEventListener('touchend', handleTouchEnd, { passive: true });
  art.addEventListener('touchend', handleTouchEnd, { passive: true });

  window.addEventListener('resize', () => {
    if (view === 'leer' && mode !== 'scroll') renderContent(idx, false);
  });

  window.addEventListener('scroll', () => {
    if (view !== 'leer') return;
    updateProgress();
    if (mode === 'scroll') save();
    if (!topbar || !ctrl) return;
    clearTimeout(chromeTimer);
    topbar.classList.remove('is-hidden');
    ctrl.classList.remove('is-hidden');
    chromeTimer = setTimeout(() => {
      if (window.scrollY > 80 && mode === 'scroll') {
        topbar.classList.add('is-hidden');
        ctrl.classList.add('is-hidden');
      }
    }, 1800);
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    if (view !== 'leer' || !topbar || !ctrl) return;
    if (e.clientY < 70 || e.clientY > window.innerHeight - 80) {
      topbar.classList.remove('is-hidden');
      ctrl.classList.remove('is-hidden');
    }
  });

  document.getElementById('fr-minus')?.addEventListener('click', () => { fr = Math.max(80, fr - 10); applyChrome(); save(); });
  document.getElementById('fr-plus')?.addEventListener('click', () => { fr = Math.min(150, fr + 10); applyChrome(); save(); });
  document.getElementById('fr-settings')?.addEventListener('click', () => {
    if (!settings) return;
    const open = settings.hasAttribute('hidden');
    if (open) { settings.removeAttribute('hidden'); settings.classList.add('open'); }
    else { settings.setAttribute('hidden', ''); settings.classList.remove('open'); }
    document.getElementById('fr-settings')?.classList.toggle('active', open);
  });
  document.querySelectorAll('.theme-choice-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      const t = pill.dataset.theme;
      theme = (t === 'night' || t === 'sepia') ? t : 'paper';
      applyChrome();
      save();
    });
  });
  document.querySelectorAll('.mode-choice-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      const m = pill.dataset.mode;
      mode = (m === 'book' || m === 'scroll' || m === 'page') ? m : 'page';
      applyChrome();
      showContent();
      save();
    });
  });
  document.getElementById('read-reset')?.addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    fr = 100; lh = 178; measure = 42; theme = 'paper'; mode = 'page'; idx = 0;
    applyChrome();
    showContent();
    window.scrollTo(0, 0);
  });
  if (hint) {
    setTimeout(() => { if (hint) hint.hidden = true; }, 5000);
  }
}

function bindCatalogue() {
  const box = document.querySelector('#catalogue-books');
  const countEl = document.querySelector('#cat-count');
  const qEl = document.querySelector('#cat-q');
  if (!box) return;
  const params = new URLSearchParams(location.search);
  const state = { genre: 'Todos', place: 'todos', lang: 'todos', onlyText: false, onlyOer: false, onlyAudio: false, q: (params.get('q') || '').trim() };

  const match = b => {
    if (state.q && !bookHay(b).includes(fold(state.q))) return false;
    if (state.genre !== 'Todos' && bookGenre(b) !== state.genre) return false;
    if (state.place !== 'todos' && b.place !== state.place) return false;
    if (state.lang !== 'todos' && bookLang(b) !== state.lang) return false;
    if (state.onlyText && !b.hasText) return false;
    if (state.onlyOer && !(b.license && String(b.license).indexOf('CC') === 0)) return false;
    if (state.onlyAudio && !hasAudio(b)) return false;
    return true;
  };
  const paint = () => {
    document.querySelectorAll('.chip').forEach(btn => {
      const mode = btn.dataset.mode;
      const f = btn.dataset.filter;
      const on = mode === 'reset'
        ? state.genre === 'Todos' && state.place === 'todos' && state.lang === 'todos' && !state.onlyText && !state.onlyOer && !state.onlyAudio
        : mode === 'genre' ? state.genre === f
        : mode === 'place' ? state.place === f
        : mode === 'lang' ? state.lang === f
        : mode === 'text' ? state.onlyText
        : mode === 'license' ? state.onlyOer
        : mode === 'audio' ? state.onlyAudio
        : false;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };
  const apply = () => {
    const list = books.filter(match).sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'es', { sensitivity: 'base' }));
    if (!list.length) {
      box.innerHTML = '<p class="catalogue-note">No hay libros con eso. Prueba otra búsqueda o pulsa Todos.</p>';
    } else {
      box.innerHTML = `<div class="stack"><div class="books">${list.map(bookCard).join('')}</div><div class="shelf-plank" aria-hidden="true"></div></div>`;
    }
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'libro' : 'libros'}`;
    paint();
  };

  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const f = btn.dataset.filter;
      if (mode === 'reset') {
        state.genre = 'Todos'; state.place = 'todos'; state.lang = 'todos';
        state.onlyText = false; state.onlyOer = false; state.onlyAudio = false;
      } else if (mode === 'genre') state.genre = state.genre === f ? 'Todos' : f;
      else if (mode === 'place') state.place = state.place === f ? 'todos' : f;
      else if (mode === 'lang') state.lang = state.lang === f ? 'todos' : f;
      else if (mode === 'text') state.onlyText = !state.onlyText;
      else if (mode === 'license') state.onlyOer = !state.onlyOer;
      else if (mode === 'audio') state.onlyAudio = !state.onlyAudio;
      apply();
    });
  });
  let t = 0;
  if (qEl) {
    qEl.value = state.q;
    qEl.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = qEl.value.trim(); apply(); }, 80);
    });
  }

  const filtro = params.get('filtro');
  if (filtro) {
    if (filtro === 'Chile' || filtro === 'Latinoamérica' || filtro === 'Universal') state.place = filtro;
    else if (LANG_LABEL[filtro]) state.lang = filtro;
    else if (filtro === 'hasText') state.onlyText = true;
    else if (filtro === 'audio') state.onlyAudio = true;
    else if (filtro === 'oer' || filtro === 'OER' || filtro === 'Educativo') {
      if (filtro === 'Educativo') state.genre = 'Educativo';
      else state.onlyOer = true;
    } else state.genre = filtro;
  }
  apply();
}

function listenPage(b) {
  const pack = audioPack(b.id);
  if (!pack) {
    return `<main class="page"><div class="wrap">
      <div class="crumb"><a href="${link('catalogo')}">Libros</a> / ${b.title}</div>
      <span class="eyebrow">Audio</span>
      <h1 style="font-size:clamp(2.4rem,5vw,4rem);max-width:760px">Este libro todavía no se puede escuchar aquí.</h1>
      <p class="lead">Puedes leerlo, o elegir otro con audio.</p>
      <div class="actions">
        ${b.hasText ? `<a class="button" href="${link('leer', '&libro=' + b.id)}">Leer</a>` : ''}
        <a class="button alt" href="${link('catalogo')}">Ver los libros</a>
      </div>
    </div></main>`;
  }
  const n = pack.tracks.length;
  return `<main class="page listen-page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Inicio</a> / <a href="${link('catalogo')}">Libros</a> / <a href="${link('libro', '&libro=' + b.id)}">${b.title}</a> / Escuchar</div>
    <span class="eyebrow">Escuchar</span>
    <h1 class="listen-h1">${b.title}</h1>
    <p class="lead">${b.author}${b.year ? ' · ' + b.year : ''}</p>
    <p class="libro-hits" id="libro-hits" hidden></p>
    <div class="au-box">
      <audio id="au-el" preload="metadata"></audio>
      <button type="button" class="au-play" id="au-play">Escuchar</button>
      <p class="au-now" id="au-now"></p>
      <input id="au-seek" class="au-seek" type="range" min="0" max="1000" value="0" aria-label="Avance">
      <div class="au-times"><span id="au-cur">0:00</span><span id="au-dur">0:00</span></div>
      <div class="au-skip">
        <button type="button" class="button alt" id="au-prev">« Anterior</button>
        <button type="button" class="button alt" id="au-back15">−15s</button>
        <button type="button" class="button alt" id="au-fwd15">+15s</button>
        <button type="button" class="button alt" id="au-next">Siguiente »</button>
        <button type="button" class="au-speed-btn" id="au-speed" title="Velocidad de reproducción">1x</button>
      </div>
    </div>
    <p class="au-count">${n} ${n === 1 ? 'capítulo' : 'capítulos'}</p>
    <ol class="au-list" id="au-list"></ol>
    <p class="catalogue-note">Se escucha aquí. Lectura libre de voluntarios (LibriVox).</p>
    <div class="actions">
      ${b.hasText ? `<a class="button" href="${link('leer', '&libro=' + b.id)}">Leer el libro</a>` : ''}
      ${buyBtn(b)}
    </div>
  </div></main>`;
}

function bindListen(b) {
  const pack = audioPack(b.id);
  const audio = document.getElementById('au-el');
  const playBtn = document.getElementById('au-play');
  const seek = document.getElementById('au-seek');
  const nowEl = document.getElementById('au-now');
  const curEl = document.getElementById('au-cur');
  const durEl = document.getElementById('au-dur');
  const list = document.getElementById('au-list');
  const back15 = document.getElementById('au-back15');
  const fwd15 = document.getElementById('au-fwd15');
  const speedBtn = document.getElementById('au-speed');
  if (!pack || !audio || !playBtn || !list) return;
  const tracks = pack.tracks;
  const key = 'hojear-audio-v1:' + b.id;
  let i = 0;
  let seeking = false;
  const speeds = [1, 1.25, 1.5, 2, 0.75];
  let speedIdx = 0;

  function paintList() {
    list.innerHTML = tracks.map((tr, n) =>
      `<li><button type="button" class="au-item${n === i ? ' active' : ''}" data-i="${n}"><span class="au-item-n">${n + 1}</span><span class="au-item-t">${escapeHtml(tr.t)}</span><span class="au-item-d">${fmtTime(tr.s)}</span></button></li>`
    ).join('');
    list.querySelectorAll('.au-item').forEach(btn => {
      btn.addEventListener('click', () => load(parseInt(btn.dataset.i, 10), true));
    });
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ i, t: audio.currentTime || 0 })); } catch (_) {}
  }
  function label() {
    const tr = tracks[i];
    if (nowEl) nowEl.textContent = 'Capítulo ' + (i + 1) + ' de ' + tracks.length + ' · ' + tr.t;
    paintList();
  }
  function syncPlay() {
    playBtn.textContent = audio.paused ? 'Escuchar' : 'Pausa';
  }
  function load(n, autoplay) {
    i = Math.max(0, Math.min(tracks.length - 1, n));
    const tr = tracks[i];
    audio.src = tr.u;
    audio.playbackRate = speeds[speedIdx];
    audio.load();
    label();
    if (durEl) durEl.textContent = fmtTime(tr.s);
    if (autoplay) {
      audio.play().catch(() => {});
    }
    save();
    const activeItem = list.querySelector('.au-item.active');
    if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved.i === 'number') i = saved.i;
    load(i, false);
    if (saved && typeof saved.t === 'number' && saved.t > 2) {
      const jump = () => { audio.currentTime = saved.t; audio.removeEventListener('loadedmetadata', jump); };
      audio.addEventListener('loadedmetadata', jump);
    }
  } catch (_) {
    load(0, false);
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      const V = window.etemenVisitas;
      if (V && V.ping) {
        try {
          if (!sessionStorage.getItem('hojear-escucho:' + b.id)) {
            sessionStorage.setItem('hojear-escucho:' + b.id, '1');
            V.ping({ kind: 'escuchar', libro: b.id, path: '/biblioteca', force: true }).then(d => {
              if (d) V.paintLibro(document.getElementById('libro-hits'), b.id);
            });
          }
        } catch (_) {}
      }
    } else audio.pause();
  });

  back15?.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
    save();
  });

  fwd15?.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
    save();
  });

  speedBtn?.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    const spd = speeds[speedIdx];
    audio.playbackRate = spd;
    speedBtn.textContent = spd + 'x';
  });

  document.getElementById('au-prev')?.addEventListener('click', () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; save(); }
    else load(i - 1, true);
  });
  document.getElementById('au-next')?.addEventListener('click', () => load(i + 1, true));
  audio.addEventListener('play', syncPlay);
  audio.addEventListener('pause', syncPlay);
  audio.addEventListener('ended', () => {
    if (i + 1 < tracks.length) load(i + 1, true);
    else { syncPlay(); save(); }
  });
  audio.addEventListener('timeupdate', () => {
    if (seeking) return;
    const d = audio.duration || tracks[i].s || 0;
    if (seek && d) seek.value = String(Math.round((audio.currentTime / d) * 1000));
    if (curEl) curEl.textContent = fmtTime(audio.currentTime);
    if (durEl && d) durEl.textContent = fmtTime(d);
  });
  audio.addEventListener('pause', save);
  let tick = 0;
  audio.addEventListener('timeupdate', () => {
    tick += 1;
    if (tick % 8 === 0) save();
  });
  if (seek) {
    seek.addEventListener('input', () => { seeking = true; });
    seek.addEventListener('change', () => {
      const d = audio.duration || tracks[i].s || 0;
      if (d) audio.currentTime = (parseInt(seek.value, 10) / 1000) * d;
      seeking = false;
      save();
    });
  }
  if (navigator.mediaSession) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: b.title,
        artist: b.author,
        album: 'Hojear'
      });
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => load(i - 1, true));
      navigator.mediaSession.setActionHandler('nexttrack', () => load(i + 1, true));
      navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); save(); });
      navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15); save(); });
    } catch (_) {}
  }
}

function render() {
  const b = books.find(x => x.id === selected) || books[0];
  document.body.classList.remove('reading-mode');
  const page =
    view === 'catalogo' ? catalogue() :
    view === 'libro' ? bookPage(b) :
    view === 'leer' ? internalReader(b) :
    view === 'escuchar' ? listenPage(b) :
    view === 'guias' ? guideList() :
    view === 'guia' ? guidePage(b) :
    view === 'planes' ? plans() :
    view === 'checkout' ? checkout() :
    view === 'recursos' ? resources() :
    view === 'rutas' ? routes() :
    view === 'unete' ? join() :
    view === 'como-funciona' ? how() :
    home();
  document.querySelector('#app').innerHTML = nav() + page + footer();
  document.body.classList.toggle('lib-mode', view === 'catalogo');
  document.title = view === 'escuchar' ? 'Escuchar — ' + (b?.title || 'Hojear') : (view === 'inicio' ? 'Hojear' : (view === 'catalogo' ? 'Libros — Hojear' : 'Hojear — ' + (b?.title || 'Libros')));
  bindNav();
  if (view === 'leer') leerLoader(b);
  if (view === 'catalogo') bindCatalogue();
  if (view === 'escuchar') bindListen(b);
  const V = window.etemenVisitas;
  if (V) {
    if (view === 'leer' && b) V.ping({ kind: 'leer', libro: b.id, path: '/biblioteca' });
    else if (view === 'libro' && b) V.ping({ kind: 'page', libro: b.id, path: '/biblioteca' });
    V.paintTotal();
    if (b && (view === 'libro' || view === 'escuchar' || view === 'leer')) {
      V.paintLibro(document.getElementById('libro-hits'), b.id);
    }
  }
  const form = document.querySelector('#join-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('#form-message').textContent = '¡Listo! Revisa tu correo para confirmar tu suscripción a Hojear.';
  });
}

render();
