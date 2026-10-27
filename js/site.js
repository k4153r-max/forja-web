(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const STATUS_URL = "https://stats.uptimerobot.com/z6bYAoGxq6";
  const STATUS_API = "https://stats.uptimerobot.com/api/getMonitorList/z6bYAoGxq6";
  const CACHE_KEY = "etemen-uptime-v2";
  const CACHE_MS = 5 * 60 * 1000;

  const formatPct = (n) => {
    if (!Number.isFinite(n)) return "";
    if (n >= 99.995) return "100%";
    return `${n.toFixed(2)}%`;
  };

  const widgetMarkup = (extraClass) => {
    const a = document.createElement("a");
    a.className = extraClass ? `uptime-widget ${extraClass}` : "uptime-widget is-ok";
    a.setAttribute("data-uptime-widget", "");
    a.href = STATUS_URL;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "Estado público de ETEMEN.cl (Monitoreo UptimeRobot)";
    a.innerHTML =
      '<span class="uptime-widget-dot" aria-hidden="true"></span>' +
      '<span class="uptime-widget-label">ETEMEN.cl</span>' +
      '<span class="uptime-widget-pct" data-uptime-pct>99.9%</span>' +
      '<span class="uptime-widget-win">OK</span>';
    return a;
  };

  const inner = document.querySelector(".nav-inner");
  if (inner && !inner.querySelector("[data-uptime-widget]")) {
    const toggle = inner.querySelector(".nav-toggle");
    inner.insertBefore(widgetMarkup(), toggle || null);
  }

  const paint = (state) => {
    document.querySelectorAll("[data-uptime-widget]").forEach((el) => {
      const pct = el.querySelector("[data-uptime-pct]");
      const win = el.querySelector(".uptime-widget-win");
      const unknown = !!state.unknown;
      el.classList.toggle("is-ok", !state.down && !unknown);
      el.classList.toggle("is-down", !!state.down);
      el.classList.toggle("is-unknown", unknown);
      if (pct) pct.textContent = state.pct || "—";
      if (win) win.textContent = state.down ? "DOWN" : (unknown ? "N/D" : "OK");
      const label = state.down
        ? "Incidencia detectada"
        : unknown
        ? "Estado no disponible"
        : "Monitoreo 24/7 · Sitio operativo";
      el.setAttribute("title", `${label} (${state.pct || "—"})`);
      el.setAttribute("aria-label", `Estado de ETEMEN.cl: ${state.pct || "—"} Uptime`);
    });
  };

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || Date.now() - parsed.t > CACHE_MS) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  };

  const SITE_MONITOR = "etemen.cl";

  const compute = (data) => {
    const monitors = Array.isArray(data) ? data : [];
    const site = monitors.find(
      (m) => String((m && m.name) || "").trim().toLowerCase() === SITE_MONITOR
    );
    if (!site) {
      return { pct: "—", ok: false, down: false, unknown: true };
    }
    const ratio = parseFloat(site["30dRatio"] && site["30dRatio"].ratio);
    const hasRatio = Number.isFinite(ratio);
    const down = !!(site.statusClass && site.statusClass !== "success");
    return { pct: hasRatio ? formatPct(ratio) : "—", ok: hasRatio, down, unknown: !hasRatio };
  };

  const cached = readCache();
  if (cached) paint(cached);

  fetch(STATUS_API)
    .then((r) => {
      if (!r.ok) throw new Error("status");
      return r.json();
    })
    .then((json) => {
      if (!json || json.status !== "ok") throw new Error("payload");
      const state = compute(json.data);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...state, t: Date.now() }));
      } catch (_) {}
      paint(state);
    })
    .catch(() => {
      paint({ pct: "—", ok: false, down: false, unknown: true });
    });

  if (!document.querySelector('script[src*="/js/visitas.js"]')) {
    const s = document.createElement("script");
    s.src = "/js/visitas.js?v=2";
    s.defer = true;
    document.body.appendChild(s);
  }
})();
