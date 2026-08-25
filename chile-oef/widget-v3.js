(() => {
  "use strict";

  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.fly.dev/v1";
  const REFRESH_MS = 15 * 60 * 1000;
  const TIMEOUT_MS = 35000;
  const USGS_QUERY =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
    "&minlatitude=-56&maxlatitude=-17&minlongitude=-78&maxlongitude=-66" +
    "&minmagnitude=4.5&orderby=time&limit=1";
  const CITY_ORDER = ["Santiago", "Valparaíso", "La Serena", "Concepción", "Antofagasta"];

  const STYLES = `
    :host {
      display: block;
      width: 100%;
      color-scheme: dark;
      font-family: Archivo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    .widget {
      width: 100%;
      color: #e8f0f3;
      background: #071017;
      border: 1px solid #28414c;
      border-radius: 4px;
      padding: 14px;
      line-height: 1.35;
      font-size: 12px;
    }
    .head, .latest-main, .city, .links {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .head { border-bottom: 1px solid #203640; padding-bottom: 10px; margin-bottom: 10px; }
    .brand { display: inline-flex; align-items: center; gap: 7px; color: #f5f8f9; font-size: 13px; font-weight: 800; text-decoration: none; }
    .mark { width: 9px; height: 9px; background: #00bfd6; border-radius: 1px; }
    .status {
      color: #8bd8e2;
      border: 1px solid #315664;
      background: #0c1d25;
      border-radius: 999px;
      padding: 3px 7px;
      font: 700 9px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace;
      letter-spacing: .04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .status[data-state="warning"] { color: #f4b740; border-color: #665329; }
    .latest { background: #0b1820; border: 1px solid #203640; padding: 9px 10px; margin-bottom: 11px; }
    .label { display: block; color: #8aa0aa; font: 700 9px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 5px; }
    .mag { color: #f4b740; font-size: 15px; font-weight: 800; white-space: nowrap; }
    .place { min-width: 90px; flex: 1; overflow: hidden; color: #f5f8f9; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
    .time { color: #8aa0aa; font: 10px ui-monospace, "SFMono-Regular", Consolas, monospace; white-space: nowrap; }
    .cities { display: grid; gap: 4px; margin-bottom: 11px; }
    .city { min-height: 29px; background: #0b1820; border-left: 2px solid #28414c; padding: 5px 8px; }
    .city-name { color: #dce6e9; font-weight: 600; }
    .probability { color: #8bd8e2; font: 700 11px ui-monospace, "SFMono-Regular", Consolas, monospace; white-space: nowrap; }
    .foot { border-top: 1px solid #203640; padding-top: 9px; color: #8aa0aa; font-size: 10px; }
    .links { align-items: flex-start; margin-bottom: 4px; }
    a { color: #8bd8e2; }
    a:hover { color: #d5f8fc; }
    a:focus-visible { outline: 2px solid #00bfd6; outline-offset: 2px; }
    .note { line-height: 1.45; }
    @media (max-width: 360px) {
      .head, .latest-main, .links { align-items: flex-start; flex-direction: column; }
      .status { white-space: normal; }
    }
  `;

  function formatChance(probability) {
    if (probability == null || !Number.isFinite(Number(probability))) return "sin dato";
    const value = Number(probability);
    if (value <= 0) return "≈ 0%";
    const percent = value * 100;
    if (percent >= 0.01) return percent.toFixed(percent >= 1 ? 1 : 2).replace(".", ",") + "%";
    return "1 en " + new Intl.NumberFormat("es-CL").format(Math.max(2, Math.round(1 / value)));
  }

  function cleanPlace(place) {
    if (!place) return "Chile";
    return place
      .replace(/^\d+\s*km\s+[A-Z]{1,3}\s+of\s+/i, "")
      .replace(/\s+Earthquake$/i, "")
      .replace(/,?\s+Chile$/i, ", Chile")
      .replace(/^,\s*/, "")
      .trim();
  }

  function timeAgo(value) {
    const hours = Math.floor(Math.max(0, Date.now() - new Date(value).getTime()) / 3600000);
    if (hours < 1) return "< 1 h";
    if (hours < 24) return `${hours} h`;
    return `${Math.floor(hours / 24)} d`;
  }

  async function getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  class ChileOefWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.refreshTimer = null;
    }

    connectedCallback() {
      this.render();
      this.loadData();
      this.refreshTimer = setInterval(() => this.loadData(), REFRESH_MS);
    }

    disconnectedCallback() {
      if (this.refreshTimer) clearInterval(this.refreshTimer);
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>
        <section class="widget" aria-label="Resumen sísmico experimental CHILE-OEF">
          <header class="head">
            <a class="brand" href="https://etemen.cl/chile-oef/" target="_blank" rel="noopener noreferrer">
              <span class="mark" aria-hidden="true"></span><span>CHILE-OEF</span>
            </a>
            <span class="status" id="status" data-state="loading">Cargando datos</span>
          </header>
          <div class="latest">
            <span class="label">Último evento M≥4,5 · USGS</span>
            <div class="latest-main">
              <span class="mag" id="magnitude">M—</span>
              <span class="place" id="place">Consultando…</span>
              <span class="time" id="time"></span>
            </div>
          </div>
          <span class="label">Estimación ETAS · 7 días · M5,0–6,0</span>
          <div class="cities" id="cities" aria-live="polite"></div>
          <footer class="foot">
            <div class="links">
              <span>Oficial: <a href="https://www.csn.uchile.cl/" target="_blank" rel="noopener noreferrer">CSN</a> · <a href="https://www.senapred.cl/" target="_blank" rel="noopener noreferrer">SENAPRED</a></span>
              <a href="https://etemen.cl/chile-oef/" target="_blank" rel="noopener noreferrer">Abrir mapa →</a>
            </div>
            <div class="note">Investigación experimental. Pronóstico puntual sin calibración operacional; no predice terremotos.</div>
          </footer>
        </section>`;
      this.renderCities([]);
    }

    setStatus(text, state = "ok") {
      const element = this.shadowRoot.getElementById("status");
      element.textContent = text;
      element.dataset.state = state;
    }

    renderCities(places) {
      const byName = new Map(places.map((place) => [place.name, place]));
      const container = this.shadowRoot.getElementById("cities");
      container.replaceChildren();
      CITY_ORDER.forEach((name) => {
        const place = byName.get(name);
        const row = document.createElement("div");
        row.className = "city";
        const cityName = document.createElement("span");
        cityName.className = "city-name";
        cityName.textContent = name;
        const probability = document.createElement("span");
        probability.className = "probability";
        probability.textContent = place ? formatChance(place.probability_at_least_one) : "—";
        row.append(cityName, probability);
        container.appendChild(row);
      });
    }

    renderQuake(payload) {
      const feature = payload.features?.[0];
      if (!feature) return;
      const properties = feature.properties || {};
      this.shadowRoot.getElementById("magnitude").textContent = Number.isFinite(properties.mag) ? `M${properties.mag.toFixed(1)}` : "M—";
      this.shadowRoot.getElementById("place").textContent = cleanPlace(properties.place);
      this.shadowRoot.getElementById("time").textContent = timeAgo(properties.time);
    }

    async loadForecastPlaces() {
      const list = await getJson(`${API_BASE}/forecasts?limit=1`);
      const run = list.data?.[0];
      if (!run) throw new Error("sin pronóstico publicado");
      const places = await getJson(`${API_BASE}/forecasts/${run.id}/places?magnitude_lower=5&radius_km=40`);
      this.renderCities(places.places || []);
      const current = new Date(run.validity_end).getTime() >= Date.now();
      this.setStatus(current ? "ETAS vigente" : "ETAS vencido", current ? "ok" : "warning");
    }

    async loadData() {
      this.setStatus("Actualizando", "loading");
      const quakePromise = getJson(USGS_QUERY)
        .then((payload) => this.renderQuake(payload))
        .catch((error) => console.warn("CHILE-OEF widget · USGS", error));
      const forecastPromise = this.loadForecastPlaces();
      const [, forecast] = await Promise.allSettled([quakePromise, forecastPromise]);
      if (forecast.status === "rejected") {
        console.warn("CHILE-OEF widget · forecast", forecast.reason);
        this.setStatus("Datos parciales", "warning");
      }
    }
  }

  if (!customElements.get("chile-oef-widget")) {
    customElements.define("chile-oef-widget", ChileOefWidget);
  }

  function mountWidget() {
    const root = document.getElementById("oef-widget-root");
    if (root && !root.querySelector("chile-oef-widget")) root.appendChild(document.createElement("chile-oef-widget"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
  else mountWidget();
})();
