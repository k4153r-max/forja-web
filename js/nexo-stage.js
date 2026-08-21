/* El Haz: en desktop los nodos van sobre la curva; en móvil, grilla táctil. */
(() => {
  const BOARD = {
    salon: { label: "Hoy · agenda", rows: [
      ["09:00", "Camila R.", "Color + brushing"],
      ["10:30", "Valentina M.", "Manicura rusa"],
      ["12:00", "Andrea S.", "Corte dama"],
      ["15:30", "Francisca P.", "Mechas"],
      ["17:00", "Hueco libre", "Reserva web abierta"],
    ]},
    barberia: { label: "Hoy · agenda", rows: [
      ["10:00", "Matías L.", "Corte + barba"],
      ["11:00", "Diego A.", "Fade"],
      ["12:30", "Nicolás V.", "Afeitado"],
      ["16:00", "Walk-in", "Sillón 2 libre"],
      ["18:00", "Tomás R.", "Corte niño"],
    ]},
    taller: { label: "Hoy · órdenes", rows: [
      ["08:30", "AA·BB·12", "Cambio de aceite"],
      ["10:00", "KD·19·44", "Frenos + pastillas"],
      ["13:00", "HZ·03·21", "Alineación"],
      ["15:30", "En espera", "Diagnóstico motor"],
      ["17:00", "Listo", "Notificar por WhatsApp"],
    ]},
    ferreteria: { label: "Hoy · caja", rows: [
      ["09:12", "Ticket 181", "Taladro 750W"],
      ["09:40", "Ticket 182", "Brocas + tornillos"],
      ["11:05", "Cuenta", "Maestro Silva · fiado"],
      ["13:20", "Stock", "Disco corte · 4 ud."],
      ["16:48", "Cierre parcial", "Efectivo + débito"],
    ]},
    minimarket: { label: "Hoy · caja", rows: [
      ["08:05", "Ticket 44", "Pan + leche"],
      ["09:18", "Ticket 61", "Bebida 1.5L"],
      ["12:40", "Fiado", "Doña Rosa · $4.200"],
      ["15:10", "Stock", "Queso gauda bajo"],
      ["19:02", "Ticket 128", "Cierre de turno"],
    ]},
    botilleria: { label: "Hoy · caja", rows: [
      ["11:20", "Ticket 22", "Pack Imperial"],
      ["13:05", "Ticket 31", "Pisco 35º"],
      ["17:40", "Combo", "Bebida + hielo"],
      ["20:10", "Ticket 78", "Cerveza 6-pack"],
      ["22:00", "Cierre", "Arqueo de caja"],
    ]},
  };
  const NAMES = {
    salon: "salón", barberia: "barbería", taller: "taller",
    ferreteria: "ferretería", minimarket: "minimarket", botilleria: "botillería",
  };
  const STACK_MAX = 760;
  const PATH_DESKTOP = "M 6 88 C 8 30, 74 76, 94 10";
  const PATH_STACK = "M 4 56 C 28 12, 70 92, 96 40";

  const haz = document.querySelector(".haz");
  const path = document.getElementById("haz-path");
  const live = document.getElementById("haz-live");
  const pulse = document.getElementById("haz-pulse");
  const title = document.getElementById("agenda-title");
  const rowsEl = document.getElementById("agenda-rows");
  const deviceLabel = document.getElementById("device-rubro-label");
  const clock = document.getElementById("haz-clock");
  const nodes = haz ? [...haz.querySelectorAll(".rubro-option")] : [];

  const isStack = () => window.matchMedia("(max-width: " + STACK_MAX + "px)").matches;

  const applyPath = () => {
    const d = isStack() ? PATH_STACK : PATH_DESKTOP;
    [path, live, pulse].forEach((p) => { if (p) p.setAttribute("d", d); });
  };

  const clearNodePos = () => {
    nodes.forEach((btn) => {
      btn.style.left = "";
      btn.style.top = "";
    });
  };

  const screenPoint = (svgPath, pt) => {
    const ctm = svgPath.getScreenCTM();
    if (!ctm) return null;
    return {
      x: ctm.a * pt.x + ctm.c * pt.y + ctm.e,
      y: ctm.b * pt.x + ctm.d * pt.y + ctm.f,
    };
  };

  const placeNodes = () => {
    if (!haz || !path || !nodes.length) return;
    applyPath();
    if (isStack()) {
      haz.classList.add("is-stack");
      clearNodePos();
      return;
    }
    haz.classList.remove("is-stack");
    let len = 0;
    try { len = path.getTotalLength(); } catch (_) { return; }
    if (!len) return;
    const box = haz.getBoundingClientRect();
    if (!box.width || !box.height) return;
    nodes.forEach((btn, i) => {
      const t = 0.12 + (i / Math.max(nodes.length - 1, 1)) * 0.76;
      let pt;
      try { pt = path.getPointAtLength(len * t); } catch (_) { return; }
      const screen = screenPoint(path, pt);
      if (!screen) return;
      const x = ((screen.x - box.left) / box.width) * 100;
      const y = ((screen.y - box.top) / box.height) * 100;
      if (!isFinite(x) || !isFinite(y)) return;
      btn.style.left = Math.max(8, Math.min(92, x)) + "%";
      btn.style.top = Math.max(10, Math.min(88, y)) + "%";
    });
  };

  const paint = (key) => {
    const data = BOARD[key] || BOARD.salon;
    if (title) title.textContent = data.label;
    if (deviceLabel) deviceLabel.textContent = NAMES[key] || key;
    if (rowsEl) {
      rowsEl.replaceChildren(...data.rows.map(([t, n, s]) => {
        const row = document.createElement("div");
        row.className = "agenda-row";
        const time = document.createElement("div");
        time.className = "agenda-time";
        time.textContent = t;
        const body = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = n;
        const span = document.createElement("span");
        span.textContent = s;
        body.append(strong, span);
        row.append(time, body);
        return row;
      }));
    }
    if (haz && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      haz.classList.remove("is-firing");
      void haz.offsetWidth;
      haz.classList.add("is-firing");
    }
  };

  const tick = () => {
    if (!clock) return;
    try {
      clock.textContent = new Date().toLocaleTimeString("es-CL", {
        timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit",
      });
    } catch (_) {
      const d = new Date();
      clock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
  };

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-rubro]");
    if (!btn) return;
    paint(btn.dataset.rubro);
  });

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      window.requestAnimationFrame(placeNodes);
    }, 80);
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", onResize);

  window.requestAnimationFrame(placeNodes);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => window.requestAnimationFrame(placeNodes)).catch(() => {});
  }
  paint("salon");
  tick();
  setInterval(tick, 30000);
})();
