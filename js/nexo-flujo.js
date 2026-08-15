(() => {
  const RUBROS = {
    salon: {
      titulo: "Salón",
      familia: "Nexo · Servicios",
      precio: "$45.000/mes · setup $100.000",
      demo: "/demos/luna/",
      trial: "/contacto/?producto=Nexo+Servicios&rubro=Sal%C3%B3n",
      app: "https://nexus-trial-demo.onrender.com/login",
      reserva: "https://nexus-erz6.onrender.com/reservar",
    },
    barberia: {
      titulo: "Barbería",
      familia: "Nexo · Servicios",
      precio: "$45.000/mes · setup $100.000",
      demo: "/demos/atelier/",
      trial: "/contacto/?producto=Nexo+Servicios&rubro=Barber%C3%ADa",
      app: "https://nexus-trial-demo.onrender.com/login",
      reserva: "https://nexus-erz6.onrender.com/reservar",
    },
    taller: {
      titulo: "Taller",
      familia: "Nexo · Servicios",
      precio: "$45.000/mes · setup $100.000",
      demo: "/demos/taller/",
      trial: "/contacto/?producto=Nexo+Taller&rubro=Taller",
      app: "https://nexus-trial-taller.onrender.com/login",
      reserva: null,
    },
    ferreteria: {
      titulo: "Ferretería",
      familia: "Nexo · Comercio",
      precio: "$19.900/mes · setup desde $39.000",
      demo: "/demos/ferreteria/",
      trial: "/contacto/?producto=Nexo+Ferreteria&rubro=Ferreter%C3%ADa",
      app: "https://bodega-trial-ferreteria-demo.onrender.com/login",
      reserva: null,
    },
    minimarket: {
      titulo: "Minimarket",
      familia: "Nexo · Comercio",
      precio: "$19.900/mes · setup desde $39.000",
      demo: "/demos/almacen/",
      trial: "/contacto/?producto=Nexo+Almacen&rubro=Minimarket",
      app: "https://bodega-trial-almacen-demo.onrender.com/login",
      reserva: null,
    },
    botilleria: {
      titulo: "Botillería",
      familia: "Nexo · Comercio",
      precio: "$19.900/mes · setup desde $39.000",
      demo: "/demos/botilleria/",
      trial: "/contacto/?producto=Nexo+Botilleria&rubro=Botiller%C3%ADa",
      app: "https://bodega-trial-botilleria-demo.onrender.com/login",
      reserva: null,
    },
  };

  const root = document.querySelector("[data-rubro-selector]");
  const panel = document.getElementById("rubro-panel");
  if (!root || !panel) return;

  const familia = panel.querySelector("[data-panel-familia]");
  const titulo = panel.querySelector("[data-panel-titulo]");
  const precio = panel.querySelector("[data-panel-precio]");
  const trial = panel.querySelector("[data-panel-trial]");
  const demo = panel.querySelector("[data-panel-demo]");
  const app = panel.querySelector("[data-panel-app]");
  const reserva = panel.querySelector("[data-panel-reserva]");

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
    if (data.reserva) {
      reserva.href = data.reserva;
      reserva.hidden = false;
    } else {
      reserva.hidden = true;
    }
    panel.hidden = false;
  };

  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-rubro]");
    if (!btn) return;
    select(btn.dataset.rubro);
  });
})();
