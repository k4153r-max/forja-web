(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  const onScroll = () => {
    if (!nav) return;
    // account for live-strip above sticky nav
    nav.classList.toggle("scrolled", window.scrollY > 12);
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
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 0.05}s`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const nombre = (data.get("nombre") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const producto = (data.get("producto") || "General").toString();
      const mensaje = (data.get("mensaje") || "").toString().trim();
      const subject = encodeURIComponent(`[ETEMEN] ${producto} — ${nombre || "Consulta"}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nEmail: ${email}\nProducto: ${producto}\n\n${mensaje}`
      );
      const to = form.dataset.mailto || "hola@etemen.cl";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();
