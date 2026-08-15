const ALLOW = new Set([
  "https://etemen.cl",
  "https://www.etemen.cl",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (!ALLOW.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(origin) });
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
