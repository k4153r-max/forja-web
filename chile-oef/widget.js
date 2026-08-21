(() => {
  "use strict";

  const API_BASE = "https://chile-oef-api.onrender.com/v1";
  const USGS_QUERY =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
    "&minlatitude=-56&maxlatitude=-17&minlongitude=-78&maxlongitude=-66" +
    "&minmagnitude=4.5&orderby=time&limit=5";

  const DEFAULT_CITIES = [
    { name: "Santiago", lat: -33.45, lon: -70.66 },
    { name: "Valparaíso", lat: -33.04, lon: -71.61 },
    { name: "Coquimbo / La Serena", lat: -29.95, lon: -71.33 },
    { name: "Concepción", lat: -36.82, lon: -73.05 },
    { name: "Antofagasta", lat: -23.65, lon: -70.40 }
  ];

  function formatChance(prob) {
    if (prob == null || isNaN(prob)) return "sin dato";
    const pct = prob * 100;
    if (pct >= 1) return `${pct.toFixed(1)}%`;
    if (pct <= 0.0001) return "<0.01%";
    const oneInN = Math.round(1 / prob);
    return `1 en ${new Intl.NumberFormat("es-CL").format(oneInN)}`;
  }

  function cleanPlace(place) {
    if (!place) return "Chile";
    return place
      .replace(/^\d+\s*km\s+[A-Z]{1,3}\s+of\s+/i, "")
      .replace(/\s+Earthquake$/i, "")
      .replace(/\s+Chile$/i, ", Chile")
      .replace(/^,\s*/, "")
      .trim();
  }

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "hace instantes";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  }

  const STYLES = @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .chile-oef-w-box {
      box-sizing: border-box;
      width: 100%;
      font-family: 'Archivo', sans-serif;
      background: #03060a;
      color: #e2f1f8;
      border: 1px solid rgba(0,229,255,0.2);
      border-radius: 6px;
      padding: 14px;
      line-height: 1.35;
      font-size: 12px;
    }
    .w-head {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      border-bottom: 1px solid rgba(0,229,255,0.1); padding-bottom: 8px; margin-bottom: 10px;
    }
    .w-title {
      display: flex; align-items: center; gap: 6px; font-weight: 700;
      font-size: 13px; color: #e2f1f8; text-decoration: none;
    }
    .w-title .mark {
      width: 8px; height: 8px; background: #00e5ff; border-radius: 2px; flex-shrink: 0;
    }
    .w-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; text-transform: uppercase;
      background: rgba(107,163,201,0.12); color: #00e5ff; border: 1px solid rgba(107,163,201,0.3);
      padding: 2px 6px; border-radius: 3px; white-space: nowrap;
    }
    .w-badge .dot {
      width: 5px; height: 5px; border-radius: 50%; background: #00e5ff; animation: w-pulse 2s infinite; flex-shrink: 0;
    }
    @keyframes w-pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

    .w-latest {
      background: #141416; border: 1px solid rgba(0,229,255,0.1); border-radius: 4px;
      padding: 8px 10px; margin-bottom: 10px;
    }
    .w-latest-l { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #8a8a93; }
    .w-latest-val { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 3px; flex-wrap: wrap; }
    .w-mag { font-weight: 800; font-size: 14px; color: #c4894a; white-space: nowrap; }
    .w-loc { font-weight: 600; color: #e2f1f8; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 100px; }
    .w-time { font-size: 10px; color: #8a8a93; white-space: nowrap; }

    .w-section-l { font-size: 10px; font-weight: 600; color: #8a8a93; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .03em; }
    .w-city-grid { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .w-city-row {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      background: #141416; border: 1px solid rgba(0,229,255,0.1); padding: 5px 8px; border-radius: 4px;
    }
    .w-city-name { font-weight: 500; font-size: 11px; color: #e2f1f8; }
    .w-city-prob { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; font-weight: 700; color: #00e5ff; white-space: nowrap; }

    .w-foot {
      font-size: 10px; color: #8a8a93; border-top: 1px solid rgba(0,229,255,0.1);
      padding-top: 8px; display: flex; flex-direction: column; gap: 3px;
    }
    .w-foot-links { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .w-foot a { color: #00e5ff; text-decoration: none; }
    .w-foot a:hover { text-decoration: underline; }
  `;

  class ChileOefWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
      this.loadData();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>
        <div class="chile-oef-w-box">
          <div class="w-head">
            <a href="https://etemen.cl/chile-oef/" target="_blank" rel="noopener" class="w-title">
              <span class="mark"></span>
              <span>CHILE-OEF</span>
            </a>
            <span class="w-badge"><span class="dot"></span> ETAS 7d (M≥5.0)</span>
          </div>

          <div class="w-latest" id="w-latest-box">
            <div class="w-latest-l">Último sismo relevante (USGS)</div>
            <div class="w-latest-val">
              <span class="w-mag" id="w-mag">...</span>
              <span class="w-loc" id="w-loc">Cargando...</span>
              <span class="w-time" id="w-time"></span>
            </div>
          </div>

          <div class="w-section-l">Probabilidad estimada 7 días (M≥5.0):</div>
          <div class="w-city-grid" id="w-city-grid">
            ${DEFAULT_CITIES.map(c => `
              <div class="w-city-row">
                <span class="w-city-name">${c.name}</span>
                <span class="w-city-prob">...</span>
              </div>
            `).join('')}
          </div>

          <div class="w-foot">
            <div class="w-foot-links">
              <span>Oficiales: <a href="https://www.csn.uchile.cl/" target="_blank" rel="noopener">CSN</a> · <a href="https://www.senapred.cl/" target="_blank" rel="noopener">SENAPRED</a></span>
              <a href="https://etemen.cl/chile-oef/" target="_blank" rel="noopener">Mapa completo →</a>
            </div>
            <div>Investigación experimental. No predice terremotos.</div>
          </div>
        </div>
      `;
    }

    async loadData() {
      // 1. Fetch USGS latest quake
      try {
        const res = await fetch(USGS_QUERY);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const first = data.features[0];
            const mag = first.properties.mag ? `M ${first.properties.mag.toFixed(1)}` : "M --";
            const loc = cleanPlace(first.properties.place);
            const timeStr = timeAgo(first.properties.time);
            
            const magEl = this.shadowRoot.getElementById("w-mag");
            const locEl = this.shadowRoot.getElementById("w-loc");
            const timeEl = this.shadowRoot.getElementById("w-time");
            if (magEl) magEl.textContent = mag;
            if (locEl) locEl.textContent = loc;
            if (timeEl) timeEl.textContent = timeStr;
          }
        }
      } catch (e) {
        console.warn("CHILE-OEF Widget: error USGS feed", e);
      }

      // 2. Fetch CHILE-OEF forecast
      try {
        const res = await fetch(`${API_BASE}/forecasts/latest`);
        if (res.ok) {
          const forecast = await res.json();
          if (forecast && forecast.cells) {
            this.updateCityProbabilities(forecast.cells);
          }
        }
      } catch (e) {
        console.warn("CHILE-OEF Widget: error API forecast", e);
      }
    }

    updateCityProbabilities(cells) {
      const gridEl = this.shadowRoot.getElementById("w-city-grid");
      if (!gridEl) return;

      const html = DEFAULT_CITIES.map(city => {
        let bestDist = Infinity;
        let bestCell = null;
        for (const cell of cells) {
          const dLat = cell.lat - city.lat;
          const dLon = cell.lon - city.lon;
          const dist = dLat * dLat + dLon * dLon;
          if (dist < bestDist) {
            bestDist = dist;
            bestCell = cell;
          }
        }

        let probStr = "sin dato";
        if (bestCell) {
          const p = (bestCell.bins && (bestCell.bins["5-6"] || bestCell.bins["5+"])) || bestCell.rate;
          probStr = formatChance(p);
        }

        return `
          <div class="w-city-row">
            <span class="w-city-name">${city.name}</span>
            <span class="w-city-prob">${probStr}</span>
          </div>
        `;
      }).join('');

      gridEl.innerHTML = html;
    }
  }

  if (!customElements.get('chile-oef-widget')) {
    customElements.define('chile-oef-widget', ChileOefWidget);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("oef-widget-root");
    if (root && !root.hasChildNodes()) {
      const widget = document.createElement("chile-oef-widget");
      root.appendChild(widget);
    }
  });
})();


