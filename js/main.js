(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  // Contact form: mailto fallback (sin backend aún)
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const nombre = (data.get("nombre") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const producto = (data.get("producto") || "General").toString();
      const mensaje = (data.get("mensaje") || "").toString().trim();
      const subject = encodeURIComponent(`[Forja] ${producto} — ${nombre || "Consulta"}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nEmail: ${email}\nProducto: ${producto}\n\n${mensaje}`
      );
      // Cambia este correo cuando tengas uno de Forja
      const to = form.dataset.mailto || "hola@forja.cl";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();
