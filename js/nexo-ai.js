/* nexo-ai.js — Asistente IA de rubro para Nexo
   Llama a /api/nexo-ai en el Cloudflare Worker (la key NVIDIA vive como secret de Wrangler) */
(() => {
  const AI_ENDPOINT = "https://api.etemen.cl/api/nexo-ai";

  const input   = document.getElementById("ai-rubro-input");
  const btn     = document.getElementById("ai-rubro-btn");
  const respDiv = document.getElementById("ai-rubro-response");

  if (!input || !btn || !respDiv) return;

  async function consultar() {
    const query = input.value.trim();
    if (!query) { input.focus(); return; }

    btn.disabled = true;
    btn.textContent = "Consultando…";
    respDiv.hidden = false;
    respDiv.classList.add("loading");
    respDiv.textContent = "Analizando tu negocio";

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "ai_error");

      respDiv.classList.remove("loading");
      respDiv.textContent = data.texto;

      if (data.rubro) {
        const tab = document.querySelector(`[data-rubro="${data.rubro}"]`);
        if (tab) {
          setTimeout(() => {
            tab.click();
            document.getElementById("flujo")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 400);
        }
      }
    } catch (_) {
      respDiv.classList.remove("loading");
      respDiv.textContent = "No se pudo conectar con el asistente. Intenta de nuevo.";
    }

    btn.disabled = false;
    btn.textContent = "Consultar →";
  }

  btn.addEventListener("click", consultar);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") consultar(); });
})();
