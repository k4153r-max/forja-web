/* Agenda del mostrador: se sincroniza con el selector de rubro.
   No toca nexo-flujo.js. */
(() => {
  const BOARD = {
    salon: {
      label: "Hoy · agenda",
      rows: [
        ["09:00", "Camila R.", "Color + brushing"],
        ["10:30", "Valentina M.", "Manicura rusa"],
        ["12:00", "Andrea S.", "Corte dama"],
        ["15:30", "Francisca P.", "Mechas"],
        ["17:00", "Hueco libre", "Reserva web abierta"],
      ],
    },
    barberia: {
      label: "Hoy · agenda",
      rows: [
        ["10:00", "Matías L.", "Corte + barba"],
        ["11:00", "Diego A.", "Fade"],
        ["12:30", "Nicolás V.", "Afeitado"],
        ["16:00", "Walk-in", "Sillón 2 libre"],
        ["18:00", "Tomás R.", "Corte niño"],
      ],
    },
    taller: {
      label: "Hoy · órdenes",
      rows: [
        ["08:30", "AA·BB·12", "Cambio de aceite"],
        ["10:00", "KD·19·44", "Frenos + pastillas"],
        ["13:00", "HZ·03·21", "Alineación"],
        ["15:30", "En espera", "Diagnóstico motor"],
        ["17:00", "Listo", "Notificar por WhatsApp"],
      ],
    },
    ferreteria: {
      label: "Hoy · caja",
      rows: [
        ["09:12", "Ticket 181", "Taladro 750W"],
        ["09:40", "Ticket 182", "Brocas + tornillos"],
        ["11:05", "Cuenta", "Maestro Silva · fiado"],
        ["13:20", "Stock", "Disco corte · 4 ud."],
        ["16:48", "Cierre parcial", "Efectivo + débito"],
      ],
    },
    minimarket: {
      label: "Hoy · caja",
      rows: [
        ["08:05", "Ticket 44", "Pan + leche"],
        ["09:18", "Ticket 61", "Bebida 1.5L"],
        ["12:40", "Fiado", "Doña Rosa · $4.200"],
        ["15:10", "Stock", "Queso gauda bajo"],
        ["19:02", "Ticket 128", "Cierre de turno"],
      ],
    },
    botilleria: {
      label: "Hoy · caja",
      rows: [
        ["11:20", "Ticket 22", "Pack Imperial"],
        ["13:05", "Ticket 31", "Pisco 35º"],
        ["17:40", "Combo", "Bebida + hielo"],
        ["20:10", "Ticket 78", "Cerveza 6-pack"],
        ["22:00", "Cierre", "Arqueo de caja"],
      ],
    },
  };

  const title = document.getElementById("agenda-title");
  const rowsEl = document.getElementById("agenda-rows");
  const deviceLabel = document.getElementById("device-rubro-label");
  if (!title || !rowsEl) return;

  const paint = (key) => {
    const data = BOARD[key] || BOARD.salon;
    const names = {
      salon: "salón",
      barberia: "barbería",
      taller: "taller",
      ferreteria: "ferretería",
      minimarket: "minimarket",
      botilleria: "botillería",
    };
    title.textContent = data.label;
    if (deviceLabel) deviceLabel.textContent = names[key] || key;
    rowsEl.innerHTML = data.rows.map(([t, n, s]) => (
      `<div class="agenda-row"><div class="agenda-time">${t}</div><div><strong>${n}</strong><span>${s}</span></div></div>`
    )).join("");
  };

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-rubro]");
    if (!btn) return;
    paint(btn.dataset.rubro);
  });

  paint("salon");
})();
