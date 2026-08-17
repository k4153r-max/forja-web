(() => {
  "use strict";

  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.onrender.com/v1";
  const FETCH_TIMEOUT_MS = 20000;
  const COLD_START_RETRY_MS = 6000;
  const MAX_RETRIES = 5;
  const MAP_CELL_LIMIT = 8000;
  const MAULE_DATE = "2010-02-27";
  const CHILE_BOUNDS = [
    [-55.9, -76.8],
    [-17.4, -66.2],
  ];
  const CHILE_MAX_BOUNDS = [
    [-58.5, -82],
    [-15.5, -62],
  ];

  const ZONES = [
    { name: "Norte Grande", maxLat: -17.4, minLat: -26.0 },
    { name: "Norte Chico", maxLat: -26.0, minLat: -32.0 },
    { name: "Zona Central", maxLat: -32.0, minLat: -37.0 },
    { name: "Zona Sur", maxLat: -37.0, minLat: -44.0 },
    { name: "Zona Austral", maxLat: -44.0, minLat: -56.0 },
  ];

  const MAG_LABELS = {
    "3-4": "Sismos suaves (magnitud 3 a 4)",
    "4-5": "Sismos leves (magnitud 4 a 5)",
    "5-6": "Sismos medianos (magnitud 5 a 6)",
    "6-7": "Sismos fuertes (magnitud 6 a 7)",
    "7+": "Sismos muy fuertes (magnitud 7 o más)",
  };

  const HORIZON_LABELS = {
    PT6H: "las próximas 6 horas",
    P1D: "el próximo día",
    P3D: "los próximos 3 días",
    P7D: "los próximos 7 días",
  };

  let map = null;
  let gridLayer = null;
  let placeLayer = null;

  const fmtInt = (n) => new Intl.NumberFormat("es-CL").format(n);
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });
  const fmtDateTime = (iso) =>
    new Date(iso).toLocaleString("es-CL", {
      year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });

  function binKey(bin) {
    return bin.upper ? `${bin.lower}-${bin.upper}` : `${bin.lower}+`;
  }

  function binLabel(bin) {
    return MAG_LABELS[binKey(bin)] || (
      bin.upper ? `Magnitud ${bin.lower} a ${bin.upper}` : `Magnitud ${bin.lower} o más`
    );
  }

  function cleanPlace(place) {
    if (!place) return "Chile";
    return place
      .replace(/^\d+\s*km\s+[A-Z]{1,3}\s+of\s+/i, "")
      .replace(/\s+Earthquake$/i, "")
      .replace(/^2010\s+/i, "")
      .replace(/\s+Chile$/i, ", Chile")
      .replace(/^,\s*/, "")
      .trim();
  }

  function zoneForLatitude(lat) {
    const zone = ZONES.find((item) => lat <= item.maxLat && lat > item.minLat);
    return zone ? zone.name : "Zona Austral";
  }

  function formatChance(probability) {
    if (probability == null) return "sin dato";
    const percent = probability * 100;
    const oneIn = Math.max(2, Math.round(1 / probability));
    const oneInText = "1 en " + new Intl.NumberFormat("es-CL").format(oneIn);
    if (percent >= 1) return percent.toFixed(1).replace(".", ",") + "%";
    if (percent >= 0.01) return percent.toFixed(2).replace(".", ",") + "% · " + oneInText;
    return oneInText;
  }

  function intensityLabel(intensity) {
    if (intensity >= 0.75) return "La más alta";
    if (intensity >= 0.45) return "Alta";
    if (intensity >= 0.2) return "Media";
    return "Más baja";
  }

  async function apiGet(path, params) {
    const url = new URL(API_BASE + path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, value);
      }
    }
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || `HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        clearTimeout(timer);
        lastError = error;
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, COLD_START_RETRY_MS));
        }
      }
    }
    throw lastError;
  }

  function showError(containerId, error) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.style.display = "block";
    el.textContent = "Estamos cargando los datos. Si tarda, espera un minuto y recarga la página.";
    if (error) console.warn("chile-oef", error);
  }

  function setKv(dl, pairs) {
    dl.innerHTML = "";
    for (const [label, value] of pairs) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      dl.appendChild(dt);
      dl.appendChild(dd);
    }
  }

  async function loadHeroStats() {
    try {
      const [summary, model] = await Promise.all([
        apiGet("/catalog/summary"),
        apiGet("/seismicity/model-summary").catch(() => null),
      ]);
      document.getElementById("s-total").textContent = fmtInt(summary.total_events);
      const earliestYear = summary.earliest_event_time
        ? new Date(summary.earliest_event_time).getFullYear()
        : "—";
      const latestYear = summary.latest_event_time
        ? new Date(summary.latest_event_time).getFullYear()
        : "—";
      document.getElementById("s-range").textContent = `${earliestYear}–${latestYear}`;
      if (model) {
        document.getElementById("s-mc").textContent = "Magnitud " + model.mc_value.toFixed(0) + " o más";
      }
      return summary;
    } catch (error) {
      document.getElementById("s-total").textContent = "—";
      document.getElementById("s-range").textContent = "—";
      document.getElementById("s-mc").textContent = "—";
      throw error;
    }
  }

  function renderCatalog(summary) {
    const counts = summary.magnitude_type_counts || [];
    const maxCount = Math.max(1, ...counts.map((row) => row.count));
    const bars = document.getElementById("mag-type-bars");
    bars.innerHTML = "";
    for (const row of counts.slice(0, 8)) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;align-items:center;gap:10px;font-size:.82rem;margin-bottom:8px";
      const type = document.createElement("span");
      type.style.cssText = "width:54px;font-family:ui-monospace,monospace;color:var(--muted)";
      type.textContent = row.magnitude_type || "sin tipo";
      const track = document.createElement("span");
      track.style.cssText = "flex:1;height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden";
      const fill = document.createElement("span");
      fill.style.cssText = `display:block;height:100%;width:${(100 * row.count) / maxCount}%;background:var(--oef)`;
      track.appendChild(fill);
      const count = document.createElement("span");
      count.style.cssText = "width:62px;text-align:right;color:var(--muted)";
      count.textContent = fmtInt(row.count);
      wrap.appendChild(type);
      wrap.appendChild(track);
      wrap.appendChild(count);
      bars.appendChild(wrap);
    }

    const tbody = document.getElementById("top-events");
    tbody.innerHTML = "";
    for (const event of summary.top_magnitude_events) {
      const tr = document.createElement("tr");
      if ((event.event_time || "").slice(0, 10) === MAULE_DATE) tr.className = "notable";
      const dateTd = document.createElement("td");
      dateTd.textContent = fmtDate(event.event_time);
      const magTd = document.createElement("td");
      magTd.innerHTML = `<span class="mag-pill">${event.magnitude.toFixed(1)}</span>`;
      const placeTd = document.createElement("td");
      placeTd.textContent = cleanPlace(event.place);
      tr.appendChild(dateTd);
      tr.appendChild(magTd);
      tr.appendChild(placeTd);
      tbody.appendChild(tr);
    }

    document.getElementById("catalog-loading").style.display = "none";
    document.getElementById("catalog-content").style.display = "block";
  }

  async function loadCatalog() {
    try {
      renderCatalog(await loadHeroStats());
    } catch (error) {
      document.getElementById("catalog-loading").style.display = "none";
      showError("catalog-error", error);
    }
  }

  async function loadModelSummary() {
    try {
      const model = await apiGet("/seismicity/model-summary");
      document.getElementById("model-summary").textContent =
        `Se entrenó con ${fmtInt(model.completeness_event_count)} terremotos reales ` +
        `ocurridos entre ${fmtDate(model.completeness_window_start)} y ` +
        `${fmtDate(model.completeness_window_end)}, un período que incluye el de Maule ` +
        `de 2010. El mapa muestra sismos de magnitud ${model.mc_value.toFixed(0)} o más.`;
      setKv(document.getElementById("model-kv"), [
        ["Tipo de magnitud", model.magnitude_type],
        ["Mc", model.mc_value.toFixed(2)],
        ["Ventana", fmtDate(model.completeness_window_start) + " – " + fmtDate(model.completeness_window_end)],
        ["Eventos en la ventana", fmtInt(model.completeness_event_count)],
        ["b-value", model.b_value.toFixed(3) + " ± " + (model.b_value_standard_error?.toFixed(3) ?? "—")],
        ["Eventos ≥ Mc", fmtInt(model.events_at_or_above_mc)],
        ["μ / día", model.mu_per_day.toExponential(3)],
        ["k0", model.k0.toExponential(3)],
        ["α", model.alpha.toFixed(3)],
        ["c (horas)", (model.c_days * 24).toFixed(2)],
        ["p", model.p_exponent.toFixed(3)],
        ["d0 (km)", model.d0_km.toFixed(1)],
        ["q", model.q_exponent.toFixed(3)],
        ["Convergencia", model.converged ? "sí" : "no"],
      ]);
      document.getElementById("model-loading").style.display = "none";
      document.getElementById("model-content").style.display = "block";
    } catch (error) {
      document.getElementById("model-loading").textContent =
        "No se pudo cargar esta parte. El mapa de arriba sí debería funcionar.";
    }
  }

  function rankedCells(cells) {
    const sorted = cells
      .filter((cell) => cell.probability_at_least_one > 0)
      .sort((a, b) => a.probability_at_least_one - b.probability_at_least_one);
    return sorted.map((cell, index) => ({
      cell,
      rank: sorted.length < 2 ? 1 : index / (sorted.length - 1),
    }));
  }

  const ActivityLayer = L.Layer.extend({
    initialize(cells) {
      this._cells = cells || [];
    },
    onAdd(leafletMap) {
      this._map = leafletMap;
      this._canvas = L.DomUtil.create("canvas", "oef-grid-canvas");
      this._canvas.style.position = "absolute";
      this._canvas.style.pointerEvents = "none";
      leafletMap.getPanes().overlayPane.appendChild(this._canvas);
      this._onReset = () => this._redraw();
      leafletMap.on("moveend zoom viewreset resize", this._onReset);
      this._redraw();
    },
    onRemove(leafletMap) {
      leafletMap.off("moveend zoom viewreset resize", this._onReset);
      if (this._canvas) L.DomUtil.remove(this._canvas);
      this._canvas = null;
    },
    setCells(next) {
      this._cells = next || [];
      this._redraw();
    },
    _redraw() {
      const leafletMap = this._map;
      if (!leafletMap || !this._canvas) return;
      const size = leafletMap.getSize();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const topLeft = leafletMap.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);
      this._canvas.width = Math.round(size.x * dpr);
      this._canvas.height = Math.round(size.y * dpr);
      this._canvas.style.width = size.x + "px";
      this._canvas.style.height = size.y + "px";
      const ctx = this._canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.x, size.y);

      const ranked = rankedCells(this._cells).filter((item) => item.rank >= 0.55);
      for (const item of ranked) {
        const { cell, rank } = item;
        const t = (rank - 0.55) / 0.45;
        const half = 0.055;
        const a = leafletMap.latLngToContainerPoint([
          cell.center_latitude + half,
          cell.center_longitude - half,
        ]);
        const b = leafletMap.latLngToContainerPoint([
          cell.center_latitude - half,
          cell.center_longitude + half,
        ]);
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.max(1.6, Math.abs(b.x - a.x));
        const h = Math.max(1.6, Math.abs(b.y - a.y));
        let fill;
        if (t < 0.45) fill = `rgba(80,140,180,${0.18 + t * 0.25})`;
        else if (t < 0.78) fill = `rgba(196,137,74,${0.32 + t * 0.28})`;
        else fill = `rgba(255,190,110,${0.55 + (t - 0.78) * 0.8})`;
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
      }
    },
  });

  function ensureMap() {
    if (map) {
      map.invalidateSize();
      return map;
    }
    if (!window.L) throw new Error("no se pudo cargar el mapa");

    map = L.map("oef-map", {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 9,
      maxBounds: CHILE_MAX_BOUNDS,
      maxBoundsViscosity: 0.9,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO',
      subdomains: "abcd",
      maxZoom: 9,
    }).addTo(map);

    const legend = L.control({ position: "bottomleft" });
    legend.onAdd = () => {
      const box = L.DomUtil.create("div", "oef-map-legend");
      box.innerHTML =
        "<strong>Actividad relativa</strong>" +
        "<div class=\"heat-bar\"></div>" +
        "<div style=\"display:flex;justify-content:space-between\"><span>Menos</span><span>Más</span></div>";
      return box;
    };
    legend.addTo(map);

    map.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
    return map;
  }

  function paintHeat(cells) {
    const leafletMap = ensureMap();
    if (!gridLayer) {
      gridLayer = new ActivityLayer(cells);
      gridLayer.addTo(leafletMap);
    } else {
      gridLayer.setCells(cells);
    }
    requestAnimationFrame(() => {
      leafletMap.invalidateSize();
      leafletMap.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
      if (gridLayer && gridLayer._redraw) gridLayer._redraw();
    });
  }

  function paintPlaces(places) {
    const leafletMap = ensureMap();
    if (placeLayer) {
      leafletMap.removeLayer(placeLayer);
      placeLayer = null;
    }
    placeLayer = L.layerGroup();
    for (const place of places) {
      if (place.probability_at_least_one == null) continue;
      const marker = L.circleMarker([place.latitude, place.longitude], {
        radius: 5,
        weight: 1,
        color: "#f4f1ea",
        fillColor: "#c4894a",
        fillOpacity: 0.9,
      });
      marker.bindTooltip(
        `<strong>${place.name}</strong><br>${formatChance(place.probability_at_least_one)}`,
        { direction: "top", offset: [0, -6], opacity: 0.95 }
      );
      marker.on("click", () => leafletMap.setView([place.latitude, place.longitude], 8));
      marker.addTo(placeLayer);
    }
    placeLayer.addTo(leafletMap);
  }

  function renderPlaces(payload) {
    const list = document.getElementById("city-list");
    if (!list) return;
    const places = [...(payload.places || [])].sort((a, b) => {
      const pa = a.probability_at_least_one ?? -1;
      const pb = b.probability_at_least_one ?? -1;
      return pb - pa;
    });
    list.innerHTML = "";
    for (const place of places) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "city-row";
      row.innerHTML = `<span class="city-name"></span><span class="city-chance"></span>`;
      row.querySelector(".city-name").textContent = place.name;
      row.querySelector(".city-chance").textContent = formatChance(place.probability_at_least_one);
      row.addEventListener("click", () => {
        if (!map) return;
        map.setView([place.latitude, place.longitude], 8);
      });
      list.appendChild(row);
    }
  }

  function renderZones(cells) {
    const mass = new Map(ZONES.map((zone) => [zone.name, 0]));
    for (const cell of cells) {
      const zone = zoneForLatitude(cell.center_latitude);
      mass.set(zone, (mass.get(zone) || 0) + cell.probability_at_least_one);
    }
    const ranked = ZONES.map((zone) => zone.name)
      .filter((name) => mass.get(name) > 0)
      .sort((a, b) => mass.get(b) - mass.get(a));
    const maxMass = ranked.length ? mass.get(ranked[0]) : 0;
    const zoneList = document.getElementById("fc-zone-list");
    zoneList.innerHTML = "";
    if (!ranked.length) {
      const p = document.createElement("p");
      p.className = "plain-note";
      p.textContent = "No hay datos suficientes para esta magnitud.";
      zoneList.appendChild(p);
      return;
    }
    for (const name of ranked) {
      const intensity = maxMass > 0 ? mass.get(name) / maxMass : 0;
      const row = document.createElement("div");
      row.className = "zone-row";
      row.innerHTML =
        `<span class="zone-name"></span>` +
        `<span class="zone-bar-track"><span class="zone-bar-fill"></span></span>` +
        `<span class="zone-level"></span>`;
      row.querySelector(".zone-name").textContent = name;
      row.querySelector(".zone-bar-fill").style.width = Math.max(8, intensity * 100) + "%";
      row.querySelector(".zone-level").textContent = intensityLabel(intensity);
      zoneList.appendChild(row);
    }
  }

  async function loadForecast(runId, magnitudeLower) {
    const detail = await apiGet(`/forecasts/${runId}`, {
      limit: MAP_CELL_LIMIT,
      magnitude_lower: magnitudeLower,
    });
    const cells = detail.cells || [];
    const selectedBin = detail.magnitude_bins.find(
      (bin) => bin.lower === detail.selected_magnitude_lower
    ) || { lower: detail.selected_magnitude_lower, upper: null };

    document.getElementById("fc-summary").textContent =
      `${binLabel(selectedBin)}, para ${HORIZON_LABELS[detail.horizon_id] || "los próximos días"}. ` +
      `Actualizado el ${fmtDate(detail.issued_at)}.`;

    setKv(document.getElementById("fc-kv"), [
      ["Emitido", fmtDateTime(detail.issued_at)],
      ["Válido desde", fmtDateTime(detail.validity_start)],
      ["Válido hasta", fmtDateTime(detail.validity_end)],
      ["Mc de referencia", detail.reference_magnitude.toFixed(2)],
      ["b-value usado", detail.b_value_used.toFixed(3)],
      ["Celdas en la grilla", fmtInt(detail.cell_count_total)],
      ["Puntos pintados", fmtInt(cells.length)],
    ]);

    const select = document.getElementById("mag-select");
    if (select.dataset.populated !== detail.id) {
      select.innerHTML = "";
      for (const bin of detail.magnitude_bins) {
        const opt = document.createElement("option");
        opt.value = bin.lower;
        opt.textContent = binLabel(bin);
        if (bin.lower < detail.reference_magnitude) {
          opt.disabled = true;
          opt.textContent += " — no se puede mostrar con confianza";
        }
        select.appendChild(opt);
      }
      select.dataset.populated = detail.id;
      select.dataset.runId = runId;
    }
    select.value = String(detail.selected_magnitude_lower);

    document.getElementById("forecast-loading").style.display = "none";
    document.getElementById("forecast-content").style.display = "block";
    paintHeat(cells);
    renderZones(cells);
    try {
      const places = await apiGet(`/forecasts/${runId}/places`, {
        magnitude_lower: detail.selected_magnitude_lower,
      });
      renderPlaces(places);
      paintPlaces(places.places || []);
    } catch (error) {
      const list = document.getElementById("city-list");
      if (list) list.textContent = "No se pudieron cargar las ciudades.";
      console.warn("chile-oef places", error);
    }
  }

  async function initForecast() {
    try {
      const list = await apiGet("/forecasts", { limit: 1 });
      if (!list.data.length) {
        document.getElementById("forecast-loading").textContent = "Todavía no hay un mapa publicado.";
        return;
      }
      const runId = list.data[0].id;
      await loadForecast(runId);
      document.getElementById("mag-select").addEventListener("change", (event) => {
        loadForecast(event.target.dataset.runId, parseFloat(event.target.value)).catch((error) =>
          showError("forecast-error", error)
        );
      });
    } catch (error) {
      document.getElementById("forecast-loading").style.display = "none";
      showError("forecast-error", error);
    }
  }

  loadCatalog();
  loadModelSummary();
  initForecast();
})();
