const ALLOW = new Set([
  "https://etemen.cl",
  "https://www.etemen.cl",
  "https://forja-web-ur0v.onrender.com",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

const BOT_UA = /bot|crawl|spider|preview|scan|headless|wget|curl|python-requests|facebookexternalhit|slurp|bingpreview|uptimerobot|monitor/i;
const VISIT_KINDS = new Set(["page", "leer", "escuchar"]);

const PATH_REDIRECTS = [
  [/^\/umbral(\/|$)/i, "https://etemen.cl/hojear/"],
  [/^\/nexus(\/|$)/i, "https://etemen.cl/nexo/"],
  [/^\/minimarket(\/|$)/i, "https://etemen.cl/nexo/minimarkets/"],
  [/^\/bodega(\/|$)/i, "https://etemen.cl/nexo/"],
];

function pathRedirect(url) {
  for (const [re, dest] of PATH_REDIRECTS) {
    if (!re.test(url.pathname)) continue;
    const next = new URL(dest);
    next.search = url.search;
    return Response.redirect(next.toString(), 301);
  }
  return null;
}

const PRODUCTOS = new Set([
  "General",
  "Nexo Trial",
  "Nexo",
  "Nexo Servicios",
  "Nexo Taller",
  "Nexo Comercio",
  "Nexo Ferreteria",
  "Nexo Almacen",
  "Nexo Botilleria",
  "Hojear",
  "Hojear Plus",
  "indago",
]);

const RUBROS = new Set([
  "Salón",
  "Barbería",
  "Spa",
  "Taller",
  "Ferretería",
  "Minimarket",
  "Botillería",
  "Otro",
  "No aplica",
  "",
]);

function cors(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && ALLOW.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${ip}|${salt || "dev"}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function todaySantiago() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function cleanPath(raw) {
  let p = String(raw || "/").split("?")[0].split("#")[0];
  try { p = decodeURIComponent(p); } catch (_) {}
  p = p.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) p = "/" + p;
  if (p.includes("..")) return "/";
  p = p.slice(0, 80);
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
}

function cleanLibro(raw) {
  const id = String(raw || "").toLowerCase().trim();
  return /^[a-z0-9-]{1,64}$/.test(id) ? id : "";
}

function cleanKind(raw) {
  const k = String(raw || "page").toLowerCase();
  return VISIT_KINDS.has(k) ? k : "page";
}

async function readJson(request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await request.json(); } catch (_) { return {}; }
  }
  try {
    const t = await request.text();
    return t ? JSON.parse(t) : {};
  } catch (_) {
    return {};
  }
}

async function bumpVisit(env, { path, kind, libro, visitor }) {
  const day = todaySantiago();
  const sitePath = "__all__";

  const seenPath = await env.DB.prepare(
    "SELECT 1 AS ok FROM visitas_visto WHERE day = ? AND path = ? AND visitor = ?"
  ).bind(day, path, visitor).first();
  const seenSite = await env.DB.prepare(
    "SELECT 1 AS ok FROM visitas_visto WHERE day = ? AND path = ? AND visitor = ?"
  ).bind(day, sitePath, visitor).first();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO visitas_dia (day, path, hits, uniques) VALUES (?, ?, 1, ?)
       ON CONFLICT(day, path) DO UPDATE SET hits = hits + 1, uniques = uniques + excluded.uniques`
    ).bind(day, path, seenPath ? 0 : 1),
    env.DB.prepare(
      `INSERT INTO visitas_dia (day, path, hits, uniques) VALUES (?, ?, 1, ?)
       ON CONFLICT(day, path) DO UPDATE SET hits = hits + 1, uniques = uniques + excluded.uniques`
    ).bind(day, sitePath, seenSite ? 0 : 1),
  ]);

  if (!seenPath) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO visitas_visto (day, path, visitor) VALUES (?, ?, ?)"
    ).bind(day, path, visitor).run();
  }
  if (!seenSite) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO visitas_visto (day, path, visitor) VALUES (?, ?, ?)"
    ).bind(day, sitePath, visitor).run();
  }

  if (libro) {
    await env.DB.prepare(
      `INSERT INTO visitas_libro (book_id, kind, hits) VALUES (?, ?, 1)
       ON CONFLICT(book_id, kind) DO UPDATE SET hits = hits + 1`
    ).bind(libro, kind).run();
  }
}

async function visitStats(env, { path, libro }) {
  const day = todaySantiago();
  const all = await env.DB.prepare(
    "SELECT COALESCE(SUM(hits), 0) AS hits FROM visitas_dia WHERE path = ?"
  ).bind("__all__").first();
  const hoy = await env.DB.prepare(
    "SELECT hits, uniques FROM visitas_dia WHERE day = ? AND path = ?"
  ).bind(day, "__all__").first();

  const out = {
    ok: true,
    total: Number(all && all.hits) || 0,
    hoy: Number(hoy && hoy.hits) || 0,
    unicos_hoy: Number(hoy && hoy.uniques) || 0,
  };

  if (path) {
    const pAll = await env.DB.prepare(
      "SELECT COALESCE(SUM(hits), 0) AS hits FROM visitas_dia WHERE path = ?"
    ).bind(path).first();
    const pHoy = await env.DB.prepare(
      "SELECT hits FROM visitas_dia WHERE day = ? AND path = ?"
    ).bind(day, path).first();
    out.path = path;
    out.path_hits = Number(pAll && pAll.hits) || 0;
    out.path_hoy = Number(pHoy && pHoy.hits) || 0;
  }

  if (libro) {
    const rows = await env.DB.prepare(
      "SELECT kind, hits FROM visitas_libro WHERE book_id = ?"
    ).bind(libro).all();
    const map = { page: 0, leer: 0, escuchar: 0 };
    for (const row of (rows && rows.results) || []) map[row.kind] = Number(row.hits) || 0;
    out.libro = libro;
    out.page = map.page;
    out.leer = map.leer;
    out.escuchar = map.escuchar;
  }

  return out;
}

async function visitResumen(env) {
  const base = await visitStats(env, {});
  const day = todaySantiago();
  const pages = await env.DB.prepare(
    `SELECT path,
            SUM(hits) AS hits,
            SUM(CASE WHEN day = ? THEN hits ELSE 0 END) AS hoy
     FROM visitas_dia
     WHERE path != '__all__'
     GROUP BY path
     ORDER BY hits DESC
     LIMIT 30`
  ).bind(day).all();
  const books = await env.DB.prepare(
    `SELECT book_id AS id,
            SUM(CASE WHEN kind = 'leer' THEN hits ELSE 0 END) AS leer,
            SUM(CASE WHEN kind = 'escuchar' THEN hits ELSE 0 END) AS escuchar,
            SUM(CASE WHEN kind = 'page' THEN hits ELSE 0 END) AS page
     FROM visitas_libro
     GROUP BY book_id
     ORDER BY (leer + escuchar + page) DESC
     LIMIT 30`
  ).all();
  base.paginas = ((pages && pages.results) || []).map((r) => ({
    path: r.path,
    hits: Number(r.hits) || 0,
    hoy: Number(r.hoy) || 0,
  }));
  base.libros = ((books && books.results) || []).map((r) => ({
    id: r.id,
    leer: Number(r.leer) || 0,
    escuchar: Number(r.escuchar) || 0,
    page: Number(r.page) || 0,
  }));
  return base;
}

async function handleVisita(request, env, url, origin) {
  if (request.method === "GET" && url.pathname.endsWith("/health")) {
    let db = false;
    try {
      await env.DB.prepare("SELECT 1").first();
      db = true;
    } catch (_) {}
    return json({ ok: true, db }, 200, origin);
  }

  if (request.method === "GET") {
    try {
      if (url.searchParams.get("resumen") === "1") {
        return json(await visitResumen(env), 200, origin);
      }
      const path = url.searchParams.get("path") ? cleanPath(url.searchParams.get("path")) : "";
      const libro = cleanLibro(url.searchParams.get("libro"));
      return json(await visitStats(env, { path, libro }), 200, origin);
    } catch (_) {
      return json({ ok: false }, 500, origin);
    }
  }

  if (request.method !== "POST") return json({ ok: false }, 405, origin);

  const ua = request.headers.get("User-Agent") || "";
  if (BOT_UA.test(ua)) return json({ ok: true, skip: true }, 200, origin);

  const body = await readJson(request);
  const path = cleanPath(body.path || url.searchParams.get("path") || "/");
  const kind = cleanKind(body.kind);
  const libro = cleanLibro(body.libro);
  const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const visitor = await hashIp(`${ip}|${todaySantiago()}`, env.IP_SALT);
  const ipHour = await hashIp(`v|${ip}`, env.IP_SALT);
  const windowStart = new Date().toISOString().slice(0, 13) + ":00:00";

  try {
    await env.DB.prepare(
      `INSERT INTO rate_limits (ip_hash, window_start, hits) VALUES (?, ?, 1)
       ON CONFLICT(ip_hash, window_start) DO UPDATE SET hits = hits + 1`
    ).bind(ipHour, windowStart).run();
    const rl = await env.DB.prepare(
      "SELECT hits FROM rate_limits WHERE ip_hash = ? AND window_start = ?"
    ).bind(ipHour, windowStart).first();
    if (rl && rl.hits > 80) return json({ ok: true, skip: true }, 200, origin);

    await bumpVisit(env, { path, kind, libro, visitor });
    return json(await visitStats(env, { path, libro }), 200, origin);
  } catch (_) {
    return json({ ok: false }, 500, origin);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    const bounced = pathRedirect(url);
    if (bounced) return bounced;

    if (request.method === "OPTIONS") {
      if (origin && !ALLOW.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (
      url.pathname.startsWith("/api/visita") ||
      url.pathname === "/visita" ||
      url.pathname.startsWith("/visita/")
    ) {
      return handleVisita(request, env, url, origin);
    }

    if (request.method === "GET" && url.pathname.endsWith("/health")) {
      let db = false;
      try {
        await env.DB.prepare("SELECT 1").first();
        db = true;
      } catch (_) {}
      return json({ ok: true, db }, 200, origin);
    }

    if (request.method !== "POST") return json({ ok: false }, 405, origin);

    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json({ ok: false, error: "invalid_json" }, 400, origin);
    }

    const nombre = String(body.nombre || "").trim().slice(0, 120);
    const correo = String(body.correo || body.email || "").trim().slice(0, 254);
    const empresa = String(body.empresa || "").trim().slice(0, 160);
    const rubro = String(body.rubro || "").trim();
    const producto = String(body.producto || "").trim();
    const mensaje = String(body.mensaje || "").trim().slice(0, 4000);
    const honeypot = String(body.empresa_web || "");
    const token = String(body["cf-turnstile-response"] || "");

    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const ipHash = await hashIp(ip, env.IP_SALT);
    const windowStart = new Date().toISOString().slice(0, 13) + ":00:00";

    await env.DB.prepare(
      `INSERT INTO rate_limits (ip_hash, window_start, hits) VALUES (?, ?, 1)
       ON CONFLICT(ip_hash, window_start) DO UPDATE SET hits = hits + 1`
    ).bind(ipHash, windowStart).run();

    const rl = await env.DB.prepare(
      "SELECT hits FROM rate_limits WHERE ip_hash = ? AND window_start = ?"
    ).bind(ipHash, windowStart).first();
    if (rl && rl.hits > 5) return json({ ok: false, error: "rate" }, 429, origin);

    if (honeypot) {
      await env.DB.prepare(
        `INSERT INTO contactos (nombre, correo, empresa, rubro, producto, mensaje, ip_hash, user_agent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'spam')`
      ).bind(nombre || "-", correo || "-", empresa, rubro, producto || "General", mensaje || "-", ipHash, request.headers.get("User-Agent") || "").run();
      return json({ ok: true }, 201, origin);
    }

    if (!nombre || !correo || !mensaje) return json({ ok: false, error: "required" }, 400, origin);
    if (!PRODUCTOS.has(producto)) return json({ ok: false, error: "producto" }, 400, origin);
    if (!RUBROS.has(rubro)) return json({ ok: false, error: "rubro" }, 400, origin);

    let turnstileOk = 0;
    if (env.TURNSTILE_SECRET && token) {
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
      });
      const out = await verify.json();
      turnstileOk = out.success ? 1 : 0;
    } else if (!env.TURNSTILE_SECRET) {
      turnstileOk = 1;
    }

    await env.DB.prepare(
      `INSERT INTO contactos (nombre, correo, empresa, rubro, producto, mensaje, ip_hash, user_agent, turnstile_ok, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'nuevo')`
    ).bind(nombre, correo, empresa, rubro, producto, mensaje, ipHash, request.headers.get("User-Agent") || "", turnstileOk).run();

    let notifyOk = 0;
    if (env.RESEND_API_KEY) {
      try {
        const mail = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ETEMEN <hola@etemen.cl>",
            to: [env.NOTIFY_TO || "hola@etemen.cl"],
            subject: `[ETEMEN] ${producto} — ${nombre}`,
            text: `Nombre: ${nombre}\nCorreo: ${correo}\nEmpresa: ${empresa}\nRubro: ${rubro}\nProducto: ${producto}\n\n${mensaje}`,
          }),
        });
        notifyOk = mail.ok ? 1 : 0;
      } catch (_) {
        notifyOk = 0;
      }
      await env.DB.prepare(
        "UPDATE contactos SET notify_ok = ? WHERE id = (SELECT MAX(id) FROM contactos WHERE correo = ?)"
      ).bind(notifyOk, correo).run();
    }

    return json({ ok: true }, 201, origin);
  },
};
