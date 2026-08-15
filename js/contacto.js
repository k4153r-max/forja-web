(() => {
  const SUCCESS = "Mensaje recibido. Te responderemos en menos de 24 horas.";
  const PRODUCTOS = [
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
  ];

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  const productoSel = form.querySelector("[name=producto]");
  const rubroSel = form.querySelector("[name=rubro]");
  if (productoSel && params.get("producto")) {
    const want = params.get("producto").replace(/\+/g, " ");
    const match = Array.from(productoSel.options).find((o) => o.value === want);
    if (match) productoSel.value = match.value;
  }
  if (rubroSel && params.get("rubro")) {
    const want = params.get("rubro").replace(/\+/g, " ");
    const opt = Array.from(rubroSel.options).find((o) => o.value === want);
    if (opt) rubroSel.value = opt.value;
  }

  const box = form.parentElement;
  const err = document.createElement("p");
  err.className = "form-error";
  err.hidden = true;
  form.appendChild(err);

  const endpoint =
    form.dataset.api ||
    (location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "/api/contacto"
      : "https://api.etemen.cl/api/contacto");

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    err.hidden = true;
    const btn = form.querySelector("[type=submit]");
    if (btn) btn.disabled = true;

    const data = new FormData(form);
    const payload = {
      nombre: String(data.get("nombre") || "").trim(),
      correo: String(data.get("correo") || data.get("email") || "").trim(),
      empresa: String(data.get("empresa") || "").trim(),
      rubro: String(data.get("rubro") || "").trim(),
      producto: String(data.get("producto") || "General").trim(),
      mensaje: String(data.get("mensaje") || "").trim(),
      empresa_web: String(data.get("empresa_web") || ""),
      "cf-turnstile-response": String(data.get("cf-turnstile-response") || ""),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        const done = document.createElement("div");
        done.className = "contact-success";
        done.innerHTML = `<h2>Recibido.</h2><p>${SUCCESS}</p>`;
        form.replaceWith(done);
        return;
      }
      if (res.status === 429) {
        err.textContent = "Demasiados intentos. Espera una hora o escribe a hola@etemen.cl.";
      } else {
        err.textContent = "No se pudo enviar. Escríbenos a hola@etemen.cl.";
      }
      err.hidden = false;
    } catch (_) {
      err.textContent = "No se pudo enviar. Escríbenos a hola@etemen.cl.";
      err.hidden = false;
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();
