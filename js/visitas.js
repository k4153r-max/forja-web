(() => {
  const API = "https://api.etemen.cl/api/visita";
  const live = /(?:^|\.)etemen\.cl$|(?:^|\.)onrender\.com$/.test(location.hostname) && location.hostname !== "api.etemen.cl";
  const fmt = (n) => new Intl.NumberFormat("es-CL").format(n);

  function ping(opts) {
    if (!live || navigator.webdriver) return Promise.resolve(null);
    const kind = (opts && opts.kind) || "page";
    const libro = (opts && opts.libro) || "";
    const path = (opts && opts.path) || location.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
    const key = "etemen-v1:" + kind + ":" + path + ":" + libro;
    try {
      if (!(opts && opts.force)) {
        if (sessionStorage.getItem(key)) return Promise.resolve(null);
        sessionStorage.setItem(key, "1");
      }
    } catch (_) {}
    const body = JSON.stringify({ path, kind, libro });
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  function paintTotal(data) {
    const d = data;
    const go = (payload) => {
      if (!payload || !payload.ok || !payload.total) return;
      const txt = fmt(payload.total) + (payload.total === 1 ? " visita" : " visitas");
      document.querySelectorAll("[data-visitas]").forEach((el) => {
        el.textContent = txt;
        el.hidden = false;
      });
    };
    if (d) {
      go(d);
      return;
    }
    fetch(API)
      .then((r) => (r.ok ? r.json() : null))
      .then(go)
      .catch(() => {});
  }

  function paintLibro(el, libro) {
    if (!el || !libro) return;
    fetch(API + "?libro=" + encodeURIComponent(libro))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || !d.ok) return;
        const parts = [];
        if (d.leer) parts.push(fmt(d.leer) + (d.leer === 1 ? " lectura" : " lecturas"));
        if (d.escuchar) parts.push(fmt(d.escuchar) + (d.escuchar === 1 ? " escucha" : " escuchas"));
        if (!parts.length && d.page) parts.push(fmt(d.page) + (d.page === 1 ? " visita" : " visitas"));
        if (!parts.length) return;
        el.textContent = parts.join(" · ");
        el.hidden = false;
      })
      .catch(() => {});
  }

  function injectFooter() {
    const bottom = document.querySelector(".footer-bottom");
    if (bottom && !bottom.querySelector("[data-visitas]")) {
      const s = document.createElement("span");
      s.setAttribute("data-visitas", "");
      s.hidden = true;
      bottom.appendChild(s);
    }
  }

  window.etemenVisitas = { ping, paintTotal, paintLibro, fmt };

  if (document.querySelector(".footer-bottom") || document.querySelector("[data-visitas]")) {
    injectFooter();
    ping({ kind: "page" }).then((d) => paintTotal(d || undefined));
  }
})();
