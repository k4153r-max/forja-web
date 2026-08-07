/* Umbral — catálogo + lector in-sitio */
const books = [
  /* ── Lectura completa en Umbral ── */
  { id: 'quijote', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', type: 'Novela', genre: 'Clásico', place: 'Universal', color: 'red', year: '1605', hasText: true, desc: 'La novela fundacional en español: humor, aventura e imaginación que aún conversa con el presente.' },
  { id: 'lazarillo', title: 'Lazarillo de Tormes', author: 'Anónimo', type: 'Novela', genre: 'Clásico', place: 'Universal', color: 'yellow', year: '1554', hasText: true, desc: 'Un joven sobrevive cambiando de amo en una crítica ingeniosa a la sociedad de su tiempo.' },
  { id: 'buscon', title: 'El Buscón', author: 'Francisco de Quevedo', type: 'Novela', genre: 'Clásico', place: 'Universal', color: 'navy', year: '1626', hasText: true, desc: 'Picaresca barroca: ingenio, hambre y sátira social en la España del Siglo de Oro.' },
  { id: 'niebla', title: 'Niebla', author: 'Miguel de Unamuno', type: 'Novela', genre: 'Clásico', place: 'Universal', color: 'navy', year: '1914', hasText: true, desc: 'Una nivola inquieta que juega con la identidad, la ficción y la libertad de sus personajes.' },
  { id: 'azul', title: 'Azul...', author: 'Rubén Darío', type: 'Poesía', genre: 'Poesía', place: 'Latinoamérica', color: 'blue', year: '1888', hasText: true, desc: 'Poemas y cuentos que abren el modernismo hispanoamericano con una mirada musical y visual.' },
  { id: 'platero', title: 'Platero y yo', author: 'Juan Ramón Jiménez', type: 'Prosa poética', genre: 'Poesía', place: 'Universal', color: 'green', year: '1917', hasText: true, desc: 'Elegía lírica al burro Platero: infancia, paisaje andaluz y ternura en prosa poética.' },
  { id: 'cuentos-amor', title: 'Cuentos de amor, de locura y de muerte', author: 'Horacio Quiroga', type: 'Cuentos', genre: 'Cuentos', place: 'Latinoamérica', color: 'purple', year: '1917', hasText: true, desc: 'Relatos breves, tensos y memorables, entre la naturaleza, el deseo y el peligro.' },
  { id: 'tradiciones', title: 'Tradiciones peruanas', author: 'Ricardo Palma', type: 'Relatos', genre: 'Cuentos', place: 'Latinoamérica', color: 'brown', year: '1872', hasText: true, desc: 'Historias breves que mezclan memoria, humor e imaginación del pasado peruano.' },
  { id: 'isla-tesoro', title: 'La isla del tesoro', author: 'R. L. Stevenson', type: 'Aventura', genre: 'Aventura', place: 'Universal', color: 'green', year: '1883', hasText: true, desc: 'Un mapa, un tesoro y una tripulación donde nadie parece ser exactamente quien dice ser.' },
  { id: 'jekyll-hyde', title: 'Jekyll y Hyde', author: 'R. L. Stevenson', type: 'Misterio', genre: 'Misterio', place: 'Universal', color: 'navy', year: '1886', hasText: true, desc: 'Un experimento libera la parte más oscura de un hombre respetable.' },
  { id: 'marianela', title: 'Marianela', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'pink', year: '1878', hasText: true, desc: 'Amor, ceguera y desigualdad en la España realista de Galdós.' },
  { id: 'misericordia', title: 'Misericordia', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'brown', year: '1897', hasText: true, desc: 'Madrid popular, fe y supervivencia en una de las grandes novelas del realismo español.' },
  { id: 'fortunata-jacinta', title: 'Fortunata y Jacinta', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'red', year: '1887', hasText: true, desc: 'Dos historias de casadas: clase, deseo y la vida madrileña del siglo XIX.' },
  { id: 'desheredada', title: 'La desheredada', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'purple', year: '1881', hasText: true, desc: 'Una joven cree merecer un título nobiliario; Galdós disecciona ilusión y realidad social.' },
  { id: 'tormento', title: 'Tormento', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'pink', year: '1884', hasText: true, desc: 'Secretos, matrimonio y presión social en el Madrid galdosiano.' },
  { id: 'fontana-oro', title: 'La Fontana de Oro', author: 'Benito Pérez Galdós', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'navy', year: '1870', hasText: true, desc: 'Primera novela de Galdós: política y pasiones en el Madrid liberal.' },
  { id: 'trafalgar', title: 'Trafalgar', author: 'Benito Pérez Galdós', type: 'Novela histórica', genre: 'Historia', place: 'Universal', color: 'blue', year: '1873', hasText: true, desc: 'La batalla naval contada desde la mirada de un joven marinero: primer Episodio Nacional.' },
  { id: 'pepita-jimenez', title: 'Pepita Jiménez', author: 'Juan Valera', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'yellow', year: '1874', hasText: true, desc: 'Amor, vocación y letras en una novela de elegancia clásica andaluza.' },
  { id: 'juanita-larga', title: 'Juanita la Larga', author: 'Juan Valera', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'green', year: '1895', hasText: true, desc: 'Costumbres de pueblo, ingenio y un romance que desafía la hipocresía social.' },
  { id: 'algo-de-todo', title: 'Algo de todo', author: 'Juan Valera', type: 'Ensayo', genre: 'Ensayo', place: 'Universal', color: 'brown', year: '1883', hasText: true, desc: 'Artículos literarios y de costumbres: pensamiento en prosa clara del XIX español.' },
  { id: 'pazos-ulloa', title: 'Los pazos de Ulloa', author: 'Emilia Pardo Bazán', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'green', year: '1886', hasText: true, desc: 'Galicia rural, poder y naturalismo: una de las grandes novelas del XIX español.' },
  { id: 'la-tribuna', title: 'La Tribuna', author: 'Emilia Pardo Bazán', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'red', year: '1883', hasText: true, desc: 'Obreras de fábrica, política y emancipación en la Coruña del Sexenio Democrático.' },
  { id: 'zalacain', title: 'Zalacaín el aventurero', author: 'Pío Baroja', type: 'Novela', genre: 'Aventura', place: 'Universal', color: 'yellow', year: '1909', hasText: true, desc: 'Aventura vasca en la última guerra carlista: ritmo, humor y frontera.' },
  { id: 'antonio-azorin', title: 'Antonio Azorín', author: 'Azorín', type: 'Novela', genre: 'Ensayo', place: 'Universal', color: 'navy', year: '1903', hasText: true, desc: 'Prosa del 98: paisaje, tiempo y mirada reflexiva sobre España.' },
  { id: 'viajes-espana', title: 'Viajes por España', author: 'Pedro A. de Alarcón', type: 'Viajes', genre: 'Ensayo', place: 'Universal', color: 'blue', year: '1883', hasText: true, desc: 'Crónicas de viaje: ciudades, caminos y observación del paisaje español.' },
  { id: 'facundo', title: 'Facundo', author: 'Domingo F. Sarmiento', type: 'Ensayo', genre: 'Ensayo', place: 'Latinoamérica', color: 'red', year: '1845', hasText: true, desc: 'Civilización y barbarie: ensayo fundacional de la prosa política latinoamericana.' },
  { id: 'ariel', title: 'Ariel', author: 'José Enrique Rodó', type: 'Ensayo', genre: 'Ensayo', place: 'Latinoamérica', color: 'blue', year: '1900', hasText: true, desc: 'Ensayo modernista sobre juventud, idealismo y el destino cultural de América.' },
  { id: 'amistad-funesta', title: 'Amistad funesta', author: 'José Martí', type: 'Novela', genre: 'Novela', place: 'Latinoamérica', color: 'pink', year: '1885', hasText: true, desc: 'Única novela de Martí: pasiones, honor y sociedad en el fin de siglo.' },
  { id: 'edad-de-oro', title: 'La Edad de Oro', author: 'José Martí', type: 'Revista', genre: 'Revista', place: 'Latinoamérica', color: 'yellow', year: '1889', hasText: true, desc: 'Revista mensual de recreo e instrucción para niñas y niños de América: cuentos, historia y ciencia amable.' },
  { id: 'biografia-bolivar', title: 'Biografía del libertador Simón Bolívar', author: 'Lorenzo Campano', type: 'Biografía', genre: 'Historia', place: 'Latinoamérica', color: 'red', year: 's. XIX', hasText: true, desc: 'Relato histórico de la independencia de América del Sur y la figura de Bolívar.' },
  { id: 'historia-judios-espana', title: 'Historia de los judíos en España', author: 'Adolfo de Castro', type: 'Historia', genre: 'Historia', place: 'Universal', color: 'brown', year: '1847', hasText: true, desc: 'Investigación histórica sobre la presencia y destino de las comunidades judías en España.' },
  { id: 'hiroshima-nagasaki', title: 'Los bombardeos atómicos de Hiroshima y Nagasaki', author: 'U.S. Manhattan District', type: 'Informe', genre: 'Investigación', place: 'Universal', color: 'navy', year: '1946', hasText: true, desc: 'Informe técnico-histórico en español sobre los efectos de las bombas atómicas. Lectura de estudio e historia del siglo XX.' },
  { id: 'tupac-amaru', title: 'Relación histórica de la rebelión de Túpac Amaru', author: 'Anónimo / crónicas', type: 'Historia', genre: 'Historia', place: 'Latinoamérica', color: 'brown', year: '1780', hasText: true, desc: 'Documentos y relato de la gran rebelión indígena en el Perú colonial.' },
  { id: 'mindanao-geografia', title: 'Mindanao: su historia y geografía', author: 'José Nieto Aguilar', type: 'Geografía', genre: 'Educativo', place: 'Universal', color: 'green', year: 's. XIX–XX', hasText: true, desc: 'Tratado de historia y geografía de Mindanao: lectura educativa y de consulta.' },
  { id: 'filosofia-fundamental', title: 'Filosofía fundamental (Tomo I)', author: 'Jaime Balmes', type: 'Filosofía', genre: 'Educativo', place: 'Universal', color: 'purple', year: '1846', hasText: true, desc: 'Curso clásico de filosofía: lógica, metafísica y criterio. Ideal para estudio formal.' },
  { id: 'filosofia-fundamental-2', title: 'Filosofía fundamental (Tomo II)', author: 'Jaime Balmes', type: 'Filosofía', genre: 'Educativo', place: 'Universal', color: 'purple', year: '1846', hasText: true, desc: 'Continuación del sistema filosófico de Balmes: profundidad y claridad argumentativa.' },

  /* ── Fichas / guías (texto íntegro en preparación) ── */
  { id: 'sub-terra', title: 'Sub terra', author: 'Baldomero Lillo', type: 'Relatos', genre: 'Cuentos', place: 'Chile', color: 'blue', year: '1904', hasText: false, desc: 'Relatos del carbón, la pobreza y la dignidad humana en el Chile minero.' },
  { id: 'sub-sole', title: 'Sub sole', author: 'Baldomero Lillo', type: 'Relatos', genre: 'Cuentos', place: 'Chile', color: 'green', year: '1907', hasText: false, desc: 'Mundo rural, naturaleza y desigualdad en relatos chilenos.' },
  { id: 'martin-rivas', title: 'Martín Rivas', author: 'Alberto Blest Gana', type: 'Novela', genre: 'Novela', place: 'Chile', color: 'red', year: '1862', hasText: false, desc: 'Ambición, amor y clase en el Santiago del siglo XIX.' },
  { id: 'juana-lucero', title: 'Juana Lucero', author: "Augusto D'Halmar", type: 'Novela', genre: 'Novela', place: 'Chile', color: 'yellow', year: '1902', hasText: false, desc: 'Una joven enfrenta una ciudad marcada por las apariencias y la desigualdad.' },
  { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', type: 'Gótico', genre: 'Misterio', place: 'Universal', color: 'brown', year: '1818', hasText: false, desc: 'La criatura abandonada y la pregunta ética sobre crear vida.' },
  { id: 'dracula', title: 'Drácula', author: 'Bram Stoker', type: 'Gótico', genre: 'Misterio', place: 'Universal', color: 'pink', year: '1897', hasText: false, desc: 'Cartas y diarios en la persecución del vampiro más famoso.' },
  { id: 'dorian-gray', title: 'El retrato de Dorian Gray', author: 'Oscar Wilde', type: 'Novela', genre: 'Novela', place: 'Universal', color: 'blue', year: '1890', hasText: false, desc: 'Belleza, moral y el precio de las decisiones.' },
  { id: 'gigante-egoista', title: 'El gigante egoísta', author: 'Oscar Wilde', type: 'Cuento', genre: 'Cuentos', place: 'Universal', color: 'yellow', year: '1888', hasText: false, desc: 'Un jardín solo florece cuando se aprende a compartir.' },
  { id: 'arte-guerra', title: 'El arte de la guerra', author: 'Sun Tzu', type: 'Pensamiento', genre: 'Ensayo', place: 'Universal', color: 'red', year: 'Antigüedad', hasText: false, desc: 'Estrategia, decisión y conflicto en aforismos clásicos.' },
  { id: 'meditaciones', title: 'Meditaciones', author: 'Marco Aurelio', type: 'Pensamiento', genre: 'Ensayo', place: 'Universal', color: 'purple', year: 'Siglo II', hasText: false, desc: 'Notas sobre disciplina, tiempo y cómo vivir con incertidumbre.' },
  { id: 'leyendas', title: 'Leyendas', author: 'G. A. Bécquer', type: 'Cuentos', genre: 'Cuentos', place: 'Universal', color: 'purple', year: '1871', hasText: false, desc: 'Misterio, amor y apariciones del romanticismo español.' },
  { id: 'poesia-mistral', title: 'Poesía chilena clásica', author: 'Selección editorial', type: 'Poesía', genre: 'Poesía', place: 'Chile', color: 'pink', year: 'Colección', hasText: false, desc: 'Ruta de lectura sobre voz poética, paisaje e identidad.' }
];

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

const GENRES = ['Todos', 'Clásico', 'Novela', 'Cuentos', 'Poesía', 'Ensayo', 'Historia', 'Investigación', 'Educativo', 'Revista', 'Aventura', 'Misterio'];
const PLACES = ['todos', 'Chile', 'Latinoamérica', 'Universal'];

const readableCount = () => books.filter(b => b.hasText).length;
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
  return `<nav><div class="wrap nav-in"><a class="brand" href="${link('inicio')}"><span class="mark"></span>Umbral</a><div class="nav-links"><a href="${link('catalogo')}">Biblioteca</a><a href="${link('guias')}">Guías PAES</a><a href="${link('rutas')}">Rutas</a><a href="${link('recursos')}">Recursos</a><a class="pill" href="${link('planes')}">Umbral Plus</a></div></div></nav>`;
}
function footer() {
  return `<footer class="footer"><div class="wrap foot"><span>Umbral · Lectura dentro de la app</span><span>${readableCount()} obras con texto completo · dominio público</span></div></footer>`;
}
function bookCard(b) {
  const badge = b.hasText ? 'Leer aquí' : 'Ficha';
  return `<a class="book ${b.color}" href="${link('libro', '&libro=' + b.id)}"><small>${b.genre || b.type} · ${b.place}${b.hasText ? ' · ✓' : ''}</small><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span><i class="circle">${b.hasText ? '▶' : '↗'}</i></div><span class="book-badge">${badge}</span></a>`;
}

function home() {
  const featured = books.filter(b => b.hasText).slice(0, 8);
  return `<main>
<section class="hero"><div class="wrap">
  <span class="eyebrow">Biblioteca digital · lector propio</span>
  <h1>Lee clásicos y textos abiertos <em>dentro</em> de Umbral.</h1>
  <p class="lead">Literatura, ensayo, historia, revistas educativas e investigación en dominio público. Sin anuncios. Con progreso guardado y páginas cómodas.</p>
  <div class="actions">
    <a class="button" href="${link('catalogo')}">Abrir biblioteca <span>→</span></a>
    <a class="button alt" href="${link('leer', '&libro=edad-de-oro')}">Probar el lector (La Edad de Oro)</a>
  </div>
</div></section>
<section class="metrics"><div class="wrap">
  <div class="metric"><b>${readableCount()}</b><span>obras con lectura completa en Umbral</span></div>
  <div class="metric"><b>${books.length}</b><span>títulos en el catálogo (fichas + textos)</span></div>
  <div class="metric"><b>0</b><span>anuncios que interrumpan tu lectura</span></div>
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
    <div class="step"><b>03</b><div><strong>Vuelve después</strong><span>Umbral recuerda en qué página estabas.</span></div></div>
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
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / Biblioteca</div>
    <span class="eyebrow">Catálogo abierto</span>
    <h1 style="font-size:clamp(2.6rem,5.5vw,4.6rem);max-width:820px">Literatura, estudio e investigación en español.</h1>
    <p class="lead">${withText.length} obras se leen completas dentro de Umbral. El resto mantiene ficha y guía mientras preparamos el texto.</p>
    <div class="filters" id="filters-genre">${genres}</div>
    <div class="filters" id="filters-place">${places}
      <button class="filter" data-filter="hasText" data-mode="text">Solo lectura completa</button>
    </div>
    <div class="books" id="catalogue-books">${books.map(bookCard).join('')}</div>
    <p class="catalogue-note">Textos de dominio público (Project Gutenberg y ediciones abiertas). Se limpia el preámbulo legal y se muestra el cuerpo de la obra. Fuentes externas se citan; no reutilices material con licencia restrictiva sin revisar.</p>
  </div></main>`;
}

function bookPage(b) {
  const readBtn = b.hasText
    ? `<a class="button" href="${link('leer', '&libro=' + b.id)}">Leer en Umbral →</a>`
    : `<a class="button alt" href="${link('guia', '&libro=' + b.id)}">Ver guía (texto en preparación)</a>`;
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / <a href="${link('catalogo')}">Biblioteca</a> / ${b.title}</div>
    <section class="book-hero">
      <div class="cover ${b.color}"><small>${b.genre || b.type} · ${b.place}</small><div class="book-title">${b.title}</div><div class="book-footer"><span>${b.author}</span><span>${b.year}</span></div></div>
      <div>
        <span class="eyebrow">${b.type} · ${b.genre || ''} · ${b.place}</span>
        <h1 style="font-size:clamp(2.8rem,5.5vw,4.8rem);margin-bottom:16px">${b.title}</h1>
        <p class="meta">${b.author} · ${b.year}<br>${b.desc}</p>
        <div>
          <span class="tag">${b.hasText ? 'Lectura completa en Umbral' : 'Ficha / guía'}</span>
          <span class="tag">${b.genre || b.type}</span>
          <span class="tag">${b.place}</span>
        </div>
        <div class="actions">
          ${readBtn}
          <a class="button alt" href="${link('guia', '&libro=' + b.id)}">Estudiar con la guía</a>
          <a class="button alt" href="${audioUrl(b)}" target="_blank" rel="noopener">▶ Audiolibro (LibriVox)</a>
        </div>
        <p class="catalogue-note">${b.hasText
          ? 'El lector guarda tu página, permite cambiar tamaño y tema, y muestra un índice de capítulos cuando el texto lo permite.'
          : 'El texto íntegro de esta obra aún no está cargado en Umbral. Puedes usar la guía y recursos externos mientras tanto.'}</p>
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
        <h2 class="pend-h1">Aún no hay texto completo de «${b.title}» en Umbral.</h2>
        <p class="lead">Estamos sumando ediciones de dominio público. Mientras tanto usa la ficha y la guía.</p>
        <div class="actions pend-actions">
          <a class="button" href="${link('libro', '&libro=' + b.id)}">Volver a la ficha</a>
          <a class="button alt" href="${link('guia', '&libro=' + b.id)}">Abrir guía</a>
        </div>
      </div>
    </div></main>`;
  }
  return `<main class="page reader-page"><div class="wrap">
    <div class="reader-stage theme-paper" id="reader-stage">
      <header class="reader-topbar" id="reader-topbar">
        <a class="back" href="${link('libro', '&libro=' + b.id)}" title="Volver a la ficha">← Salir</a>
        <div class="meta-mini"><strong>${b.title}</strong> · ${b.author}</div>
        <div class="reader-tools">
          <button type="button" id="fr-toc" class="rtool" title="Índice" aria-label="Índice">☰</button>
          <button type="button" id="fr-settings" class="rtool" title="Ajustes de lectura" aria-label="Ajustes">Aa</button>
          <button type="button" id="fr-mode" class="rtool" title="Modo scroll o páginas" aria-label="Modo de lectura">↕</button>
          <button type="button" id="fr-minus" class="rtool" aria-label="Disminuir letra">A−</button>
          <span class="rtool-size" id="rtool-size">100%</span>
          <button type="button" id="fr-plus" class="rtool" aria-label="Aumentar letra">A+</button>
        </div>
      </header>
      <div class="reader-settings" id="reader-settings" hidden>
        <label>Interlineado <input type="range" id="fr-lh" min="145" max="210" value="178"></label>
        <label>Ancho <input type="range" id="fr-width" min="28" max="46" value="38"></label>
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
        <article class="reader-body mode-pages" id="reader-text" style="--read-size:1.125rem;--read-lh:1.78;--read-measure:38rem">
          <p class="reader-loading">Preparando una lectura cómoda…</p>
        </article>
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
      <p class="reader-credit">Dominio público · lectura en Umbral · tipografía optimizada para pantallas</p>
    </div>
  </div></main>`;
}

function guideList() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / Guías PAES</div>
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
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / <a href="${link('guias')}">Guías</a> / ${b.title}</div>
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
        ${b.hasText ? `<a class="button" style="margin-top:10px" href="${link('leer', '&libro=' + b.id)}">Leer en Umbral →</a>` : `<a class="button alt" style="margin-top:10px" href="${link('libro', '&libro=' + b.id)}">Ver ficha →</a>`}
      </aside>
    </section>
  </div></main>`;
}

function plans() {
  return `<main class="page"><div class="wrap">
    <span class="eyebrow">Acceso Umbral</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:760px">Lee libre. Profundiza cuando lo necesites.</h1>
    <section class="study">
      <article class="card"><h3>Umbral Libre</h3>
        <p><strong style="font:800 2.4rem var(--serif);color:#172021">$0</strong></p>
        <p>Catálogo abierto, lector in-sitio, fichas y guías de muestra.</p>
        <a class="button alt" href="${link('catalogo')}">Explorar gratis</a>
      </article>
      <aside class="card"><span class="eyebrow">Recomendado</span><h3>Umbral Plus</h3>
        <p><strong style="font:800 2.4rem var(--serif);color:#172021">$3.990</strong> · al mes</p>
        <p>Guías PAES completas, planes de lectura y colecciones nuevas.</p>
        <a class="button" href="${link('checkout')}">Continuar →</a>
      </aside>
    </section>
  </div></main>`;
}

function checkout() {
  return `<main class="page"><div class="wrap signup">
    <span class="eyebrow">Umbral Plus</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4rem)">Estás a un paso.</h1>
    <p class="lead" style="margin:auto">Al confirmar, recibes acceso Plus por correo.</p>
    <div class="card" style="margin-top:32px;text-align:left">
      <h3>Incluye</h3>
      <p>✓ Guías PAES · ✓ Planes de lectura · ✓ Colecciones nuevas</p>
      <a class="button" href="/contacto/?producto=Umbral">Solicitar acceso →</a>
    </div>
  </div></main>`;
}

function resources() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / Recursos</div>
    <span class="eyebrow">Fuentes abiertas</span>
    <h1 style="font-size:clamp(2.6rem,5vw,4.4rem);max-width:780px">De dónde salen los textos.</h1>
    <section class="study">
      <article class="card">
        <h3>Project Gutenberg (ES)</h3>
        <p>Clásicos en español de dominio público: Galdós, Unamuno, Martí, Sarmiento, Valera y más. Umbral descarga, limpia y pagina el texto para lectura cómoda.</p>
        <a class="button" href="https://www.gutenberg.org/browse/languages/es" target="_blank" rel="noopener">Explorar Gutenberg ES →</a>
      </article>
      <aside class="card">
        <h3>Memoria Chilena</h3>
        <p>Contexto e imágenes de autores chilenos. Ideal para rutas sobre realismo y sociedad.</p>
        <a class="button" href="https://www.memoriachilena.gob.cl/" target="_blank" rel="noopener">Abrir Memoria Chilena →</a>
      </aside>
    </section>
    <section class="study">
      <article class="card">
        <h3>LibriVox</h3>
        <p>Audiolibros gratuitos en español, leídos por voluntarios.</p>
        <a class="button" href="https://librivox.org/search?recorded_language=es" target="_blank" rel="noopener">Buscar en español →</a>
      </article>
      <aside class="card">
        <h3>En Umbral ahora</h3>
        <p><strong>${readableCount()} textos completos</strong> entre novela, cuento, ensayo, historia, revista educativa e investigación.</p>
        <a class="button alt" href="${link('catalogo')}">Ir al catálogo</a>
      </aside>
    </section>
  </div></main>`;
}

function routes() {
  return `<main class="page"><div class="wrap">
    <div class="crumb"><a href="${link('inicio')}">Umbral</a> / Rutas</div>
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
      <h3>Umbral Plus</h3><p>Guías completas, simulacros y packs mensuales.</p></article>
      <aside class="card"><h3>La idea</h3><p>El dominio público atrae. Las guías y la experiencia son la membresía.</p>
      <a class="button" href="${link('unete')}">Lista de espera →</a></aside>
    </section>
  </div></main>`;
}

/* ── Lector cómodo: tipografía, temas, scroll/páginas, progreso ── */
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
  const storageKey = 'umbral-read-v2:' + b.id;
  let pages = [];
  let rawParas = [];
  let idx = 0;
  let fr = 100;
  let lh = 178;
  let measure = 38;
  let theme = 'paper';
  let mode = 'scroll'; // scroll es más cómodo en web
  let chromeTimer = null;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function isHead(t) {
    if (t.length > 100) return false;
    if (/^(cap[ií]tulo|cap[\.\s]|parte\b|pr[oó]logo|ep[ií]logo|dedicatoria|libro\b|secci[óo]n|conclusi[óo]n|introducci[óo]n|acto\b|escena|tom[oa]\b|nota\b|ap[eé]ndice|advertencia|prefaci)/i.test(t)) return true;
    const u = t.replace(/[.,;:!?¡¿"'()\-—–]/g, '').trim();
    return u.length > 3 && u.length < 70 && /^[A-ZÁÉÍÓÚÑÜ0-9][A-ZÁÉÍÓÚÑÜ0-9\s.,;:!?¡¿\-—']+$/.test(u);
  }
  function applyChrome() {
    const base = 1.125 * (fr / 100);
    art.style.setProperty('--read-size', base.toFixed(3) + 'rem');
    art.style.setProperty('--read-lh', (lh / 100).toFixed(2));
    art.style.setProperty('--read-measure', measure + 'rem');
    const sz = document.getElementById('rtool-size');
    if (sz) sz.textContent = fr + '%';
    if (stage) {
      stage.className = 'reader-stage theme-' + theme;
    }
    art.classList.toggle('mode-scroll', mode === 'scroll');
    art.classList.toggle('mode-pages', mode === 'pages');
    document.getElementById('fr-mode')?.classList.toggle('active', mode === 'scroll');
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
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); }
    catch (_) { return null; }
  }
  function paraToHtml(t, withDrop) {
    if (isHead(t)) return '<h3 class="p-h">' + esc(t) + '</h3>';
    return '<p' + (withDrop ? ' class="firstbit"' : '') + '>' + esc(t) + '</p>';
  }
  function renderPage(i) {
    idx = Math.max(0, Math.min(pages.length - 1, i));
    const seg = pages[idx];
    let h = '';
    if (idx === 0) {
      h += '<div class="p-cover"><h2 class="p-chapter">' + esc(b.title) + '</h2><p class="p-author">' + esc(b.author) + ' · ' + esc(String(b.year)) + '</p></div>';
    }
    let firstP = true;
    for (const q of seg) {
      const t = q.trim();
      if (!isHead(t) && firstP && idx === 0) {
        h += paraToHtml(t, true);
        firstP = false;
      } else {
        h += paraToHtml(t, false);
        if (!isHead(t)) firstP = false;
      }
    }
    art.innerHTML = h;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    save();
  }
  function renderScroll() {
    let h = '<div class="p-cover"><h2 class="p-chapter">' + esc(b.title) + '</h2><p class="p-author">' + esc(b.author) + ' · ' + esc(String(b.year)) + '</p></div>';
    let firstP = true;
    let acc = 0;
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
      acc += seg.length;
    });
    art.innerHTML = h;
    updateProgress();
    save();
  }
  function updateProgress() {
    if (!pages.length) return;
    if (mode === 'pages') {
      metaEl.textContent = (idx + 1) + ' / ' + pages.length;
      fill.style.width = pages.length > 1 ? Math.round(((idx + 1) / pages.length) * 100) + '%' : '100%';
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === pages.length - 1;
      prevBtn.style.visibility = 'visible';
      nextBtn.style.visibility = 'visible';
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
      tocList.innerHTML = '<p class="toc-empty">Sin capítulos detectados. Desplázate o usa las flechas.</p>';
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
        if (mode === 'pages') {
          renderPage(pageFor);
        } else {
          const el = art.querySelector('[data-page="' + pageFor + '"]') || art.querySelectorAll('.p-h')[0];
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
    else renderPage(idx);
  }

  fetch('textos/' + encodeURIComponent(b.id) + '.txt')
    .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
    .then(t => {
      rawParas = t.replace(/\r\n/g, '\n').split(/\n{2,}/).map(x => x.trim()).filter(x => x.length);
      pages = [];
      let cur = [];
      let sum = 0;
      const CHARS = 2800;
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
        if (saved.mode === 'pages' || saved.mode === 'scroll') mode = saved.mode;
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
    });

  prevBtn?.addEventListener('click', () => { if (mode === 'pages') renderPage(idx - 1); });
  nextBtn?.addEventListener('click', () => { if (mode === 'pages') renderPage(idx + 1); });
  document.addEventListener('keydown', function kd(e) {
    if (view !== 'leer') return;
    if (e.key === 'ArrowRight' && mode === 'pages') { renderPage(idx + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' && mode === 'pages') { renderPage(idx - 1); e.preventDefault(); }
    else if (e.key === 'Escape') {
      location.href = link('libro', '&libro=' + b.id);
    }
  });
  window.addEventListener('scroll', () => {
    if (view !== 'leer') return;
    updateProgress();
    if (mode === 'scroll') save();
    // auto-hide chrome al bajar
    if (!topbar || !ctrl) return;
    clearTimeout(chromeTimer);
    topbar.classList.remove('is-hidden');
    ctrl.classList.remove('is-hidden');
    chromeTimer = setTimeout(() => {
      if (window.scrollY > 80) {
        topbar.classList.add('is-hidden');
        ctrl.classList.add('is-hidden');
      }
    }, 1800);
  }, { passive: true });
  // mostrar chrome al mover el mouse cerca del borde
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
    mode = mode === 'scroll' ? 'pages' : 'scroll';
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
    fr = 100; lh = 178; measure = 38; theme = 'paper'; mode = 'scroll'; idx = 0;
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
  function apply() {
    box.innerHTML = books.filter(b => {
      if (genre !== 'Todos' && (b.genre || b.type) !== genre && b.genre !== genre) return false;
      if (place !== 'todos' && b.place !== place) return false;
      if (onlyText && !b.hasText) return false;
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
        onlyText = false;
      } else if (mode === 'text') {
        onlyText = !onlyText;
        btn.classList.toggle('active', onlyText);
      }
      apply();
    });
  });
  // deep-link ?filtro=Educativo
  const filtro = new URLSearchParams(location.search).get('filtro');
  if (filtro) {
    const btn = [...document.querySelectorAll('#filters-genre .filter')].find(b => b.dataset.filter === filtro);
    if (btn) btn.click();
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
  document.title = view === 'inicio' ? 'Umbral — Lector y biblioteca' : 'Umbral — ' + (b?.title || 'Biblioteca');
  if (view === 'leer') leerLoader(b);
  if (view === 'catalogo') bindCatalogue();
  const form = document.querySelector('#join-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('#form-message').textContent = '¡Listo! Revisa tu correo para confirmar tu suscripción a Umbral.';
  });
}

render();
