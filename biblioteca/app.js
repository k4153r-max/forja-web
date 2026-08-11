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

const GENRES = ['Todos', 'Clásico', 'Novela', 'Cuentos', 'Poesía', 'Teatro', 'Ensayo', 'Historia', 'Investigación', 'Educativo', 'Revista', 'Aventura', 'Misterio'];
const PLACES = ['todos', 'Chile', 'Latinoamérica', 'Universal'];

const readableCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.hasText).length;
const chileCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.hasText && b.place === 'Chile').length;
const oerCount = () => (typeof books !== 'undefined' ? books : []).filter(b => b.license && String(b.license).indexOf('CC') === 0).length;
const q = new URLSearchParams(location.search);
let view = q.get('vista') || 'inicio';
let selected = q.get('libro') || 'quijote';

const link = (vista, extra = '') => `?vista=${vista}${extra}`;
const audioUrl = b => {
  const direct = {
    lazarillo: 'https://librivox.org/lazarillo-de-tormes/',
    frankenstein: 'https://librivox.org/frankenstein-el-moderno-prometeo-by-mary-wollstonecraft-shelley/',
    quijote: 'https://librivox.org/don-quijote-vol-1-by-miguel-de-cervantes-saavedra/'
  };
  return direct[b.id] || `https://librivox.org/search?title=${encodeURIComponent(b.title)}&recorded_language=es`;
};

function nav() {
  return `<nav><div class="wrap nav-in"><a class="brand" href="${link('inicio')}"><img class="brand-logo" src="/assets/logos/hojear-mark-light.svg" width="30" height="30" alt="">Hojear</a><div class="nav-links"><a href="${link('catalogo')}">Biblioteca</a><a href="${link('guias')}">Guías PAES</a><a href="${link('rutas')}">Rutas</a><a href="${link('recursos')}">Recursos</a><a class="pill" href="${link('planes')}">Hojear Plus</a></div></div></nav>`;
}
function footer() {
  return `<footer class="footer"><div class="wrap foot"><span>Hojear · Lectura dentro de la app</span><span>${readableCount()} textos · ${chileCount()} Chile · ${oerCount()} OER CC</span></div></footer>`;
}
function bookCard(b) {
  const badge = b.hasText ? (b.license && String(b.license).indexOf('CC') === 0 ? 'OER' : 'Leer') : 'Ficha';
  const lic = b.license ? ` · ${b.license}` : '';
  return `<a class="book ${b.color}" href="${link('libro', '&libro=' + b.id)}"><small>${b.genre || b.type} · ${b.place}${b.hasText ? ' · ✓' : ''}${lic}</small><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span><i class="circle">${b.hasText ? '▶' : '↗'}</i></div><span class="book-badge">${badge}</span></a>`;
}

function home() {
  const featured = books.filter(b => b.hasText).slice(0, 8);
  return `<main>
<section class="hero"><div class="wrap">
  <span class="eyebrow">Biblioteca digital · lector propio</span>
  <h1>Lee clásicos, Chile y material de estudio <em>dentro</em> de Hojear.</h1>
  <p class="lead">Dominio público (Gutenberg, Archive), clásicos chilenos y guías educativas CC BY. Sin anuncios. Lectura por hojas.</p>
  <div class="actions">
    <a class="button" href="${link('catalogo')}">Abrir biblioteca <span>→</span></a>
    <a class="button alt" href="${link('leer', '&libro=sub-terra')}">Leer Sub terra (Chile)</a>
    <a class="button alt" href="${link('catalogo')}&filtro=Educativo">Material educativo CC</a>
  </div>
</div></section>
<section class="metrics"><div class="wrap">
  <div class="metric"><b>${readableCount()}</b><span>textos completos para leer aquí</span></div>
  <div class="metric"><b>${chileCount()}</b><span>obras de Chile con texto</span></div>
  <div class="metric"><b>${oerCount()}</b><span>guías OER · licencia CC BY 4.0</span></div>
</div></section>
<section class="section"><div class="wrap">
  <div class="head"><div><span class="eyebrow">Lectura inmediata</span><h2>Empieza por cualquiera de estas obras.</h2></div>
  <a class="text-link" href="${link('catalogo')}">Ver catálogo completo →</a></div>
  <div class="books">${featured.map(bookCard).join('')}</div>
</div></section>
<section class="guide-band"><div class="wrap guide-grid">
  <div><span class="eyebrow" style="color:#e7a83d">Cómo leer aquí</span>
  <h2>Un lector pensado para quedarse.</h2>
  <p>Páginas numeradas, tamaño de letra, temas papel / noche / sepia, índice de capítulos y progreso que se guarda en tu navegador.</p>
  <a class="button" style="background:#e7a83d;color:#172021" href="${link('catalogo')}&filtro=Educativo">Ver educativos e investigación →</a></div>
  <div class="steps">
    <div class="step"><b>01</b><div><strong>Elige un título</strong><span>Filtra por género, región o “con texto”.</span></div></div>
    <div class="step"><b>02</b><div><strong>Lee por páginas</strong><span>Flechas del teclado, barra de progreso e índice.</span></div></div>
    <div class="step"><b>03</b><div><strong>Vuelve después</strong><span>Hojear recuerda en qué página estabas.</span></div></div>
  </div>
</div></section>
</main>`;
}

function catalogue() {
  const withText = books.filter(b => b.hasText);
  const genres = GENRES.map(g =>
    `<button class="filter${g === 'Todos' ? ' active' : ''}" data-filter="${g}" data-mode="genre">${g}</button>`
  ).join('');
  const places = PLACES.map(p =>
    `<button class="filter" data-filter="${p}" data-mode="place">${p === 'todos' ? 'Todas las regiones' : p}</button>`
  ).join('');
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / Biblioteca</div>
    <span class="eyebrow">Catálogo abierto</span>
    <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);max-width:820px">Literatura, estudio e investigación en español.</h1>
    <p class="lead">${withText.length} textos completos · ${chileCount()} de Chile · ${oerCount()} OER (CC BY). Filtra por género, región o licencia.</p>
    <div class="filters" id="filters-genre">${genres}</div>
    <div class="filters" id="filters-place">${places}
      <button class="filter" data-filter="hasText" data-mode="text">Solo lectura completa</button>
      <button class="filter" data-filter="oer" data-mode="license">Solo OER (CC)</button>
    </div>
    <div class="books" id="catalogue-books">${books.map(bookCard).join('')}</div>
    <p class="catalogue-note">Fuentes: Project Gutenberg (dominio público), Internet Archive (clásicos chilenos), material original Hojear bajo <strong>CC BY 4.0</strong>. Script de importación: <code>biblioteca/scripts/import-gutenberg.ps1</code>. Siempre revisa la licencia antes de reutilizar fuera de Hojear.</p>
  </div></main>`;
}

function bookPage(b) {
  const readBtn = b.hasText
    ? `<a class="button" href="${link('leer', '&libro=' + b.id)}">Leer en Hojear →</a>`
    : `<a class="button alt" href="${link('guia', '&libro=' + b.id)}">Ver guía (texto en preparación)</a>`;
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / <a href="${link('catalogo')}">Biblioteca</a> / ${b.title}</div>
    <section class="book-hero">
      <div class="cover ${b.color}"><small>${b.genre || b.type} · ${b.place}</small><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span><span>${b.year}</span></div></div>
      <div>
        <span class="eyebrow">${b.type} · ${b.genre || ''} · ${b.place}</span>
        <h1 style="font-size:clamp(2.8rem,5.5vw,4.8rem);margin-bottom:16px">${b.title}</h1>
        <p class="meta">${b.author} · ${b.year}<br>${b.desc}</p>
        <div>
          <span class="tag">${b.hasText ? 'Lectura completa en Hojear' : 'Ficha / guía'}</span>
          <span class="tag">${b.genre || b.type}</span>
          <span class="tag">${b.place}</span>
          ${b.license ? `<span class="tag">${b.license}</span>` : ''}
        </div>
        ${b.source ? `<p class="catalogue-note" style="margin-top:12px"><strong>Fuente:</strong> ${b.source}</p>` : ''}
        <div class="actions">
          ${readBtn}
          <a class="button alt" href="${link('guia', '&libro=' + b.id)}">Estudiar con la guía</a>
          <a class="button alt" href="${audioUrl(b)}" target="_blank" rel="noopener">▶ Audiolibro (LibriVox)</a>
        </div>
        <p class="catalogue-note">${b.hasText
          ? 'El lector guarda tu página, permite cambiar tamaño y tema, y muestra un índice de capítulos cuando el texto lo permite.'
          : 'El texto íntegro de esta obra aún no está cargado en Hojear. Puedes usar la guía y recursos externos mientras tanto.'}</p>
      </div>
    </section>
  </div></main>`;
}

function internalReader(b) {
  if (!b.hasText) {
    return `<main class="page"><div class="wrap">
      <div class="crumb"><a href="${link('catalogo')}">Biblioteca</a> / ${b.title}</div>
      <div class="pend">
        <div class="pend-mark">⏳</div>
        <span class="eyebrow">En preparación</span>
        <h2 class="pend-h1">Aún no hay texto completo de «${b.title}» en Hojear.</h2>
        <p class="lead">Estamos sumando ediciones de dominio público. Mientras tanto usa la ficha y la guía.</p>
        <div class="actions pend-actions">
          <a class="button" href="${link('libro', '&libro=' + b.id)}">Volver a la ficha</a>
          <a class="button alt" href="${link('guia', '&libro=' + b.id)}">Abrir guía</a>
        </div>
      </div>
    </div></main>`;
  }
  return `<main class="page reader-page"><div class="wrap">
    <div class="reader-stage theme-paper mode-book" id="reader-stage">
      <header class="reader-topbar" id="reader-topbar">
        <a class="back" href="${link('libro', '&libro=' + b.id)}" title="Volver a la ficha">← Salir</a>
        <div class="meta-mini"><strong>${b.title}</strong> · ${b.author}</div>
        <div class="reader-tools">
          <button type="button" id="fr-toc" class="rtool" title="Índice" aria-label="Índice">☰</button>
          <button type="button" id="fr-settings" class="rtool" title="Ajustes de lectura" aria-label="Ajustes">Aa</button>
          <button type="button" id="fr-mode" class="rtool active" title="Libro o scroll" aria-label="Modo de lectura">📖</button>
          <button type="button" id="fr-minus" class="rtool" aria-label="Disminuir letra">A−</button>
          <span class="rtool-size" id="rtool-size">100%</span>
          <button type="button" id="fr-plus" class="rtool" aria-label="Aumentar letra">A+</button>
        </div>
      </header>
      <div class="reader-settings" id="reader-settings" hidden>
        <label>Interlineado <input type="range" id="fr-lh" min="145" max="210" value="178"></label>
        <label>Ancho hoja <input type="range" id="fr-width" min="28" max="46" value="38"></label>
        <div class="theme-pills" role="group" aria-label="Tema">
          <button type="button" class="theme-pill active" data-theme="paper" title="Papel" aria-label="Tema papel"></button>
          <button type="button" class="theme-pill" data-theme="sepia" title="Sepia" aria-label="Tema sepia"></button>
          <button type="button" class="theme-pill" data-theme="mist" title="Niebla" aria-label="Tema niebla"></button>
          <button type="button" class="theme-pill" data-theme="night" title="Noche" aria-label="Tema noche"></button>
        </div>
      </div>
      <div class="reader-shell" id="reader-shell">
        <aside class="reader-toc" id="reader-toc" hidden>
          <div class="toc-head">Índice</div>
          <div class="toc-list" id="toc-list"><p class="toc-empty">Se genera al cargar…</p></div>
        </aside>
        <div>
          <article class="reader-body mode-book" id="reader-text" style="--read-size:1.125rem;--read-lh:1.78;--read-measure:38rem">
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
          <p class="book-hint" id="book-hint">Clic en el borde de la hoja · flechas ← → · desliza en móvil</p>
        </div>
      </div>
      <div class="read-ctrl" id="read-ctrl" hidden>
        <button type="button" class="read-btn" id="read-prev" aria-label="Anterior">‹</button>
        <div class="read-mid">
          <div class="read-progress" id="read-bar"><span class="read-fill" id="read-fill"></span></div>
          <span class="read-meta" id="read-meta"></span>
        </div>
        <button type="button" class="read-btn" id="read-next" aria-label="Siguiente">›</button>
      </div>
      <div class="reader-foot-links">
        <a class="simple-btn" href="${link('guia', '&libro=' + b.id)}">Guía de estudio</a>
        <a class="simple-btn" href="${audioUrl(b)}" target="_blank" rel="noopener">Audiolibro</a>
        <button type="button" class="simple-btn" id="read-reset">Reiniciar progreso</button>
      </div>
      <p class="reader-credit">Dominio público · lectura en hojas · Hojear</p>
    </div>
  </div></main>`;
}

function guideList() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / Guías PAES</div>
    <span class="eyebrow">Estudiar sin apagar la lectura</span>
    <h1 style="font-size:clamp(2.8rem,5.5vw,4.8rem);max-width:800px">Guías que te ayudan a pensar, no a copiar.</h1>
    <p class="lead">Contexto, personajes, ideas y práctica.</p>
    <div class="guide-list">${guides.map((g, i) =>
      `<article class="guide-card"><b>${String(i + 1).padStart(2, '0')}</b><div><h3>${g[1]}</h3><p>${g[2]}</p></div>
      <a class="simple-btn" href="${link('guia', '&libro=' + g[0])}">Abrir guía →</a></article>`
    ).join('')}</div>
  </div></main>`;
}

function guidePage(b) {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / <a href="${link('guias')}">Guías</a> / ${b.title}</div>
    <span class="eyebrow">Guía de lectura</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">${b.title}, para entenderla de verdad.</h1>
    <p class="lead">Estructura simple para clase, PAES o lectura personal.</p>
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
        <h3>En tu ficha</h3>
        <p><strong>Autor:</strong><br>${b.author}</p>
        <p><strong>Género:</strong><br>${b.genre || b.type}</p>
        <p><strong>Origen:</strong><br>${b.place}</p>
        ${b.hasText ? `<a class="button" style="margin-top:10px" href="${link('leer', '&libro=' + b.id)}">Leer en Hojear →</a>` : `<a class="button alt" style="margin-top:10px" href="${link('libro', '&libro=' + b.id)}">Ver ficha →</a>`}
      </aside>
    </section>
  </div></main>`;
}

function plans() {
  return `<main class="page"><div class="wrap">
    <span class="eyebrow">Acceso Hojear</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">Lee libre. Profundiza cuando lo necesites.</h1>
    <section class="study">
      <article class="card"><h3>Hojear Libre</h3>
        <p><strong style="font:800 2.4rem var(--serif);color:#172021">$0</strong></p>
        <p>Catálogo abierto, lector in-sitio, fichas y guías de muestra.</p>
        <a class="button alt" href="${link('catalogo')}">Explorar gratis</a>
      </article>
      <aside class="card"><span class="eyebrow">Recomendado</span><h3>Hojear Plus</h3>
        <p><strong style="font:800 2.4rem var(--serif);color:#172021">$3.990</strong> · al mes</p>
        <p>Guías PAES completas, planes de lectura y colecciones nuevas.</p>
        <a class="button" href="${link('checkout')}">Continuar →</a>
      </aside>
    </section>
  </div></main>`;
}

function checkout() {
  return `<main class="page"><div class="wrap signup">
    <span class="eyebrow">Hojear Plus</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4rem)">Estás a un paso.</h1>
    <p class="lead" style="margin:auto">Al confirmar, recibes acceso Plus por correo.</p>
    <div class="card" style="margin-top:32px;text-align:left">
      <h3>Incluye</h3>
      <p>✓ Guías PAES · ✓ Planes de lectura · ✓ Colecciones nuevas</p>
      <a class="button" href="/contacto/?producto=Hojear">Solicitar acceso →</a>
    </div>
  </div></main>`;
}

function resources() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / Recursos</div>
    <span class="eyebrow">Fuentes abiertas y legales</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:780px">De dónde salen los textos.</h1>
    <section class="study">
      <article class="card">
        <h3>Project Gutenberg (ES)</h3>
        <p>Clásicos en español de dominio público. Hojear importa con el script <code>import-gutenberg.ps1</code>, limpia el preámbulo legal y pagina el texto.</p>
        <a class="button" href="https://www.gutenberg.org/browse/languages/es" target="_blank" rel="noopener">Gutenberg ES →</a>
      </article>
      <aside class="card">
        <h3>Chile · Archive + Memoria</h3>
        <p><em>Sub terra</em>, <em>Sub sole</em>, <em>Martín Rivas</em> y cuentos populares chilenos desde Internet Archive / dominio público. Contexto en Memoria Chilena.</p>
        <a class="button" href="${link('catalogo')}&filtro=Chile">Ver obras de Chile →</a>
      </aside>
    </section>
    <section class="study">
      <article class="card">
        <h3>OER · Creative Commons</h3>
        <p>${oerCount()} guías de estudio originales Hojear bajo <strong>CC BY 4.0</strong>: narrador, conflicto, símbolo, contexto, poesía, argumentación PAES y citas.</p>
        <a class="button" href="${link('catalogo')}&filtro=Educativo">Abrir educativos →</a>
      </article>
      <aside class="card">
        <h3>Otras fuentes recomendadas</h3>
        <p>Wikisource ES · Biblioteca Virtual Miguel de Cervantes · BNE (dominio público) · OpenStax / LibreTexts (OER, muchas en inglés) · LibriVox (audio).</p>
        <a class="button alt" href="${link('leer','&libro=oer-cita')}">Leer guía de licencias →</a>
      </aside>
    </section>
    <p class="catalogue-note">Catálogo actual: <strong>${readableCount()}</strong> textos legibles de ${books.length} fichas. No se copian libros con copyright vigente.</p>
  </div></main>`;
}

function routes() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Hojear</a> / Rutas</div>
    <span class="eyebrow">Elige por interés</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:780px">Rutas listas para empezar a leer.</h1>
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
      <article class="card"><h3>Plan gratuito</h3><p>Catálogo, lector y guías de muestra.</p>
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
  let idx = 0; // índice de hoja izquierda del pliego (par)
  let fr = 100;
  let lh = 178;
  let measure = 38;
  let theme = 'paper';
  let mode = 'book'; // book | scroll
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
    return isMobileBook() ? 1 : 2;
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
    const sz = document.getElementById('rtool-size');
    if (sz) sz.textContent = fr + '%';
    if (stage) {
      stage.className = 'reader-stage theme-' + theme + ' mode-' + mode;
    }
    art.classList.toggle('mode-scroll', mode === 'scroll');
    art.classList.toggle('mode-book', mode === 'book');
    document.getElementById('fr-mode')?.classList.toggle('active', mode === 'book');
    document.getElementById('fr-mode') && (document.getElementById('fr-mode').textContent = mode === 'book' ? '📖' : '↕');
    if (hint) hint.hidden = mode !== 'book';
    document.querySelectorAll('.theme-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.theme === theme);
    });
    const lhEl = document.getElementById('fr-lh');
    const wEl = document.getElementById('fr-width');
    if (lhEl) lhEl.value = String(lh);
    if (wEl) wEl.value = String(measure);
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
      // Migrar progreso de la marca anterior (Umbral)
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
    // force reflow
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
  function renderBook(i, withAnim) {
    const step = spreadStep();
    const maxIdx = Math.max(0, pages.length - 1);
    // en desktop idx es par (hoja izquierda)
    if (step === 2) i = Math.floor(i / 2) * 2;
    idx = Math.max(0, Math.min(maxIdx, i));

    const paint = () => {
      if (isMobileBook()) {
        // una sola hoja (derecha visible)
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
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'auto' });
      save();
    };

    if (withAnim) {
      animateFlip(withAnim).then(paint);
    } else {
      paint();
    }
  }
  function goNext() {
    if (mode !== 'book' || flipping) return;
    const step = spreadStep();
    if (idx + step >= pages.length) return;
    renderBook(idx + step, 'next');
  }
  function goPrev() {
    if (mode !== 'book' || flipping) return;
    const step = spreadStep();
    if (idx <= 0) return;
    renderBook(idx - step, 'prev');
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
    prevBtn.style.visibility = 'visible';
    nextBtn.style.visibility = 'visible';
    if (mode === 'book') {
      const step = spreadStep();
      const shown = isMobileBook() ? 1 : Math.min(2, pages.length - idx);
      const end = Math.min(pages.length, idx + (isMobileBook() ? 1 : 2));
      metaEl.textContent = isMobileBook()
        ? (idx + 1) + ' / ' + pages.length
        : (idx + 1) + (pages[idx + 1] ? '–' + (idx + 2) : '') + ' / ' + pages.length;
      fill.style.width = pages.length > 1 ? Math.round((end / pages.length) * 100) + '%' : '100%';
      prevBtn.disabled = idx <= 0;
      nextBtn.disabled = idx + step >= pages.length;
    } else {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      metaEl.textContent = pct + '% leído';
      fill.style.width = pct + '%';
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
    }
  }
  function buildToc() {
    const toc = [];
    rawParas.forEach((p, pi) => {
      if (isHead(p.trim())) toc.push({ title: p.trim().slice(0, 80), para: pi });
    });
    if (!tocList) return;
    if (!toc.length) {
      tocList.innerHTML = '<p class="toc-empty">Sin capítulos detectados. Pasa las hojas con las flechas.</p>';
      return;
    }
    tocList.innerHTML = toc.map((t, i) =>
      `<button type="button" class="toc-item" data-para="${t.para}">${String(i + 1).padStart(2, '0')} · ${esc(t.title)}</button>`
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
        if (mode === 'book') {
          renderBook(pageFor, false);
        } else {
          const el = art.querySelector('[data-page="' + pageFor + '"]');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (window.innerWidth < 860 && tocPanel) {
          tocPanel.hidden = true;
          shell?.classList.remove('with-toc');
        }
      });
    });
  }
  function showContent() {
    if (mode === 'scroll') renderScroll();
    else renderBook(idx, false);
  }

  fetch('textos/' + encodeURIComponent(b.id) + '.txt')
    .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
    .then(t => {
      rawParas = t.replace(/\r\n/g, '\n').split(/\n{2,}/).map(x => x.trim()).filter(x => x.length);
      pages = [];
      let cur = [];
      let sum = 0;
      // hojas más cortas = sensación de libro real
      const CHARS = isMobileBook() ? 1600 : 1400;
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
        art.innerHTML = '<p class="reader-loading">No se encontró el texto completo de este título.</p>';
        return;
      }
      const saved = loadSaved();
      if (saved) {
        if (typeof saved.fr === 'number') fr = saved.fr;
        if (typeof saved.lh === 'number') lh = saved.lh;
        if (typeof saved.measure === 'number') measure = saved.measure;
        if (saved.theme) theme = saved.theme;
        if (saved.mode === 'book' || saved.mode === 'scroll') mode = saved.mode;
        // migrar modes viejos
        if (saved.mode === 'pages') mode = 'book';
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

  prevBtn?.addEventListener('click', () => { if (mode === 'book') goPrev(); });
  nextBtn?.addEventListener('click', () => { if (mode === 'book') goNext(); });
  document.getElementById('book-hit-left')?.addEventListener('click', goPrev);
  document.getElementById('book-hit-right')?.addEventListener('click', goNext);

  document.addEventListener('keydown', function kd(e) {
    if (view !== 'leer') return;
    if (mode === 'book') {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { goNext(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { goPrev(); e.preventDefault(); }
    }
    if (e.key === 'Escape') location.href = link('libro', '&libro=' + b.id);
  });

  // swipe en móvil
  bookOpen?.addEventListener('touchstart', e => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  bookOpen?.addEventListener('touchend', e => {
    if (touchX == null || mode !== 'book') return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) goNext();
    else goPrev();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (view === 'leer' && mode === 'book') renderBook(idx, false);
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
  document.getElementById('fr-lh')?.addEventListener('input', e => { lh = parseInt(e.target.value, 10) || 178; applyChrome(); save(); });
  document.getElementById('fr-width')?.addEventListener('input', e => { measure = parseInt(e.target.value, 10) || 38; applyChrome(); save(); });
  document.getElementById('fr-settings')?.addEventListener('click', () => {
    if (!settings) return;
    const open = settings.hasAttribute('hidden');
    if (open) { settings.removeAttribute('hidden'); settings.classList.add('open'); }
    else { settings.setAttribute('hidden', ''); settings.classList.remove('open'); }
    document.getElementById('fr-settings')?.classList.toggle('active', open);
  });
  document.getElementById('fr-mode')?.addEventListener('click', () => {
    mode = mode === 'book' ? 'scroll' : 'book';
    applyChrome();
    showContent();
    save();
  });
  document.getElementById('fr-toc')?.addEventListener('click', () => {
    if (!tocPanel || !shell) return;
    const open = tocPanel.hidden;
    tocPanel.hidden = !open;
    shell.classList.toggle('with-toc', open);
    document.getElementById('fr-toc')?.classList.toggle('active', open);
  });
  document.querySelectorAll('.theme-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      theme = pill.dataset.theme || 'paper';
      applyChrome();
      save();
    });
  });
  document.getElementById('read-reset')?.addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    fr = 100; lh = 178; measure = 38; theme = 'paper'; mode = 'book'; idx = 0;
    applyChrome();
    showContent();
    window.scrollTo(0, 0);
  });
}

function bindCatalogue() {
  const box = document.querySelector('#catalogue-books');
  if (!box) return;
  let genre = 'Todos';
  let place = 'todos';
  let onlyText = false;
  let onlyOer = false;
  function apply() {
    box.innerHTML = books.filter(b => {
      if (genre !== 'Todos' && (b.genre || b.type) !== genre && b.genre !== genre) return false;
      if (place !== 'todos' && b.place !== place) return false;
      if (onlyText && !b.hasText) return false;
      if (onlyOer && !(b.license && String(b.license).indexOf('CC') === 0)) return false;
      return true;
    }).map(bookCard).join('') || '<p class="catalogue-note">No hay títulos con ese filtro.</p>';
  }
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const f = btn.dataset.filter;
      if (mode === 'genre') {
        document.querySelectorAll('#filters-genre .filter').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        genre = f;
      } else if (mode === 'place') {
        document.querySelectorAll('#filters-place .filter').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        place = f;
      } else if (mode === 'text') {
        onlyText = !onlyText;
        btn.classList.toggle('active', onlyText);
      } else if (mode === 'license') {
        onlyOer = !onlyOer;
        btn.classList.toggle('active', onlyOer);
      }
      apply();
    });
  });
  const filtro = new URLSearchParams(location.search).get('filtro');
  if (filtro) {
    if (filtro === 'Chile') {
      const btn = [...document.querySelectorAll('#filters-place .filter')].find(b => b.dataset.filter === 'Chile');
      if (btn) btn.click();
    } else {
      const btn = [...document.querySelectorAll('#filters-genre .filter')].find(b => b.dataset.filter === filtro);
      if (btn) btn.click();
    }
  }
}

function render() {
  const b = books.find(x => x.id === selected) || books[0];
  document.body.classList.remove('reading-mode');
  const page =
    view === 'catalogo' ? catalogue() :
    view === 'libro' ? bookPage(b) :
    view === 'leer' ? internalReader(b) :
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
  document.title = view === 'inicio' ? 'Hojear — Lector y biblioteca' : 'Hojear — ' + (b?.title || 'Biblioteca');
  if (view === 'leer') leerLoader(b);
  if (view === 'catalogo') bindCatalogue();
  const form = document.querySelector('#join-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('#form-message').textContent = '¡Listo! Revisa tu correo para confirmar tu suscripción a Hojear.';
  });
}

render();
