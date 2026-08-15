(() => {
  const SUCCESS = "Lo leemos y te escribimos en menos de 24 horas hábiles.";
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

  const params = new URLSearchParams(location.search);
  if (params.get("enviado") === "1") {
    const card = document.querySelector(".contact-card");
    if (card) {
      card.innerHTML = `<div class="contact-success"><h2>Recibido.</h2><p>${SUCCESS}</p><p class="contact-hint">También te escribimos al correo que nos diste.</p></div>`;
    }
    return;
  }

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

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
        if (payload.empresa_web) {
          const done = document.createElement("div");
          done.className = "contact-success";
          done.innerHTML = `<h2>Recibido.</h2><p>${SUCCESS}</p>`;
          form.replaceWith(done);
          return;
        }
        const first = payload.nombre.split(/\s+/)[0] || "";
        const hello = first ? `Hola ${first},` : "Hola,";
        const ack = [
          hello,
          "",
          "Recibimos tu mensaje. Lo leemos y te escribimos en menos de 24 horas hábiles.",
          "",
          "No hace falta que respondas este correo. Si quieres agregar algo, responde acá o escribe a hola@etemen.cl.",
          "",
          "—",
          "ETEMEN",
          "Software con fundamento",
          "https://etemen.cl",
        ].join("\n");
        const addHidden = (name, value) => {
          let el = form.querySelector(`[name="${name}"]`);
          if (!el) {
            el = document.createElement("input");
            el.type = "hidden";
            el.name = name;
            form.appendChild(el);
          }
          el.value = value;
        };
        addHidden("email", payload.correo);
        addHidden("_replyto", payload.correo);
        addHidden("_subject", "Recibimos tu mensaje — ETEMEN");
        addHidden("_template", "box");
        addHidden("_autoresponse", ack);
        addHidden("_next", `${location.origin}/contacto/?enviado=1`);
        addHidden("_honey", "");
        form.action = "https://formsubmit.co/hola@etemen.cl";
        form.method = "POST";
        form.removeAttribute("data-contact-form");
        form.submit();
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
