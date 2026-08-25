(() => {
  const RUBROS = {
    salon: {
      titulo: "Salones & Spas",
      familia: "Nexo · Servicios",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/luna/",
      trial: "/contacto/?producto=Nexo+Servicios&rubro=Sal%C3%B3n",
      app: "https://nexus-trial-demo.fly.dev/login",
      reserva: "https://etemen-nexus.fly.dev/reservar",
      items: [
        { name: "Corte Dama + Brushing", price: 25000 },
        { name: "Manicura Rusa (Ysabel)", price: 18000 },
        { name: "Tintura Cabello Nº6", price: 22000 },
        { name: "Abono Reserva Webpay", price: -10000 },
      ]
    },
    barberia: {
      titulo: "Barberías",
      familia: "Nexo · Servicios",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/atelier/",
      trial: "/contacto/?producto=Nexo+Servicios&rubro=Barber%C3%ADa",
      app: "https://nexus-trial-demo.fly.dev/login",
      reserva: "https://etemen-nexus.fly.dev/reservar",
      items: [
        { name: "Corte Barba + Perfilado", price: 16000 },
        { name: "Lavado + Peinado Pomada", price: 8000 },
        { name: "Cerveza Cortesía Local", price: 0 },
        { name: "Abono Seña WhatsApp", price: -5000 },
      ]
    },
    taller: {
      titulo: "Talleres Mecánicos",
      familia: "Nexo · Servicios",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/taller/",
      trial: "/contacto/?producto=Nexo+Taller&rubro=Taller",
      app: "https://nexus-trial-taller.fly.dev/login",
      reserva: null,
      items: [
        { name: "Cambio Aceite 10W40 + Filtro", price: 42000 },
        { name: "Alineación y Balanceo 4R", price: 28000 },
        { name: "Revision Frenos y Pastillas", price: 15000 },
        { name: "Descuento Cliente Frecuente", price: -5000 },
      ]
    },
    ferreteria: {
      titulo: "Ferreterías",
      familia: "Nexo · Comercio",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/ferreteria/",
      trial: "/contacto/?producto=Nexo+Ferreteria&rubro=Ferreter%C3%ADa",
      app: "https://bodega-trial-ferreteria-demo.fly.dev/login",
      reserva: null,
      items: [
        { name: "Taladro Percutor 750W", price: 49900 },
        { name: "Juego Brocas Concreto 5u", price: 6500 },
        { name: "Disco Corte Metal 4 1/2", price: 1200 },
        { name: "Tornillos Madera 100u", price: 2800 },
      ]
    },
    minimarket: {
      titulo: "Minimarkets & Almacenes",
      familia: "Nexo · Comercio",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/almacen/",
      trial: "/contacto/?producto=Nexo+Almacen&rubro=Minimarket",
      app: "https://bodega-trial-almacen-demo.fly.dev/login",
      reserva: null,
      items: [
        { name: "Bebida Coca-Cola 1.5L", price: 2200 },
        { name: "Pan Marraqueta 1kg", price: 1950 },
        { name: "Queso Gauda LAMINADO 250g", price: 3400 },
        { name: "Leche Entera 1L", price: 1150 },
      ]
    },
    botilleria: {
      titulo: "Botillerías",
      familia: "Nexo · Comercio",
      precio: "Precio por confirmar · A consultar por local",
      demo: "/demos/botilleria/",
      trial: "/contacto/?producto=Nexo+Botilleria&rubro=Botiller%C3%ADa",
      app: "https://bodega-trial-botilleria-demo.fly.dev/login",
      reserva: null,
      items: [
        { name: "Pack Cerveza Imperial 6x355cc", price: 7990 },
        { name: "Pisco Especial 35º 750cc", price: 8490 },
        { name: "Hielo Bolsa 2.5kg", price: 2500 },
        { name: "Bebida Tónica 1.5L", price: 1800 },
      ]
    },
  };

  let currentItems = [...RUBROS.salon.items];
  let ticketCount = 1042;

  const root = document.querySelector("[data-rubro-selector]");
  const panel = document.getElementById("rubro-panel");
  if (!root || !panel) return;

  const familia = panel.querySelector("[data-panel-familia]");
  const titulo = panel.querySelector("[data-panel-titulo]");
  const precio = panel.querySelector("[data-panel-precio]");
  const trial = panel.querySelector("[data-panel-trial]");
  const demo = panel.querySelector("[data-panel-demo]");
  const app = panel.querySelector("[data-panel-app]");

  const posReceipt = document.getElementById("pos-receipt-lines");
  const posTotalEl = document.getElementById("pos-total-val");
  const posAddContainer = document.getElementById("pos-add-items");
  const posPayBtn = document.getElementById("pos-pay-btn");

  const renderPOS = () => {
    if (!posReceipt || !posTotalEl) return;
    let total = 0;
    posReceipt.innerHTML = "";
    currentItems.forEach((it, idx) => {
      total += it.price;
      const line = document.createElement("div");
      line.className = "pos-receipt-line";
      const isDiscount = it.price < 0;
      line.innerHTML = `<span>${it.name}</span><span style="${isDiscount ? 'color:var(--nexo-mint)' : ''}">${it.price.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</span>`;
      posReceipt.appendChild(line);
    });
    posTotalEl.textContent = total.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  };

  const updateAddButtons = (key) => {
    if (!posAddContainer) return;
    const data = RUBROS[key];
    posAddContainer.innerHTML = "";
    data.items.slice(0, 4).forEach((it) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pos-item-btn";
      btn.innerHTML = `<span>+ ${it.name}</span><strong>$${Math.abs(it.price).toLocaleString()}</strong>`;
      btn.addEventListener("click", () => {
        currentItems.push(it);
        renderPOS();
      });
      posAddContainer.appendChild(btn);
    });
  };

  const select = (key) => {
    const data = RUBROS[key];
    if (!data) return;
    root.querySelectorAll(".rubro-option").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.rubro === key ? "true" : "false");
    });
    familia.textContent = data.familia;
    titulo.textContent = data.titulo;
    precio.textContent = data.precio;
    trial.href = data.trial;
    demo.href = data.demo;
    if (data.app) {
      app.href = data.app;
      app.hidden = false;
    } else {
      app.hidden = true;
    }

    currentItems = [...data.items];
    renderPOS();
    updateAddButtons(key);
    panel.hidden = false;
  };

  if (posPayBtn) {
    posPayBtn.addEventListener("click", () => {
      ticketCount++;
      const currentTotal = posTotalEl ? posTotalEl.textContent : "$0";
      alert(`✅ ¡TICKET № ${ticketCount} REGISTRADO EN CAJA NEXO!\n\nMonto Cobrado: ${currentTotal}\nMedio de Pago: Webpay / Transbank / Efectivo\nNotificación enviada por WhatsApp al cliente.`);
      currentItems = [];
      renderPOS();
    });
  }

  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-rubro]");
    if (!btn) return;
    select(btn.dataset.rubro);
  });

  // Calculadora de ROI / Ahorro (page-cro)
  const rangeCitas = document.getElementById("range-citas");
  const rangeStock = document.getElementById("range-stock");
  const roiVal = document.getElementById("roi-val-res");

  const calcROI = () => {
    if (!rangeCitas || !rangeStock || !roiVal) return;
    const citasPerdidas = parseInt(rangeCitas.value, 10) || 0;
    const horasDesorden = parseFloat(rangeStock.value) || 0;
    // Estimado: cita promedio $20.000 CLP + hora perdida $12.000 CLP x 20 días laborales
    const perdidaCitas = citasPerdidas * 20000;
    const perdidaHoras = horasDesorden * 12000 * 20;
    const totalPerdidaMes = perdidaCitas + perdidaHoras;
    const ahorroNeto = Math.max(0, totalPerdidaMes - 45000);
    roiVal.textContent = ahorroNeto.toLocaleString("es-CL", { style: "currency", currency: "CLP" }) + " / mes";
  };

  if (rangeCitas && rangeStock) {
    rangeCitas.addEventListener("input", calcROI);
    rangeStock.addEventListener("input", calcROI);
    calcROI();
  }

  // Inicializar Salón
  select("salon");
})();
