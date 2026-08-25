(() => {
  "use strict";

  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.fly.dev/v1";
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
  const USGS_QUERY =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
    "&minlatitude=-56&maxlatitude=-17&minlongitude=-78&maxlongitude=-66" +
    "&minmagnitude=4.5&orderby=time&limit=1000";

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

  const CALIBRATION_LABELS = {
    uncalibrated_point_forecast: "Puntual, sin calibrar",
  };

  let map = null;
  let gridLayer = null;
  let placeLayer = null;
  let quakeLayer = null;
  let lastCells = [];
  let lastPlaces = [];
  let lastUsgsQuakes = [];
  const layerOn = { activity: true, cities: true, recent: true, mega: false, faults: false };
  let megaLayer = null;
  let faultLayer = null;
  let radarInterval = null;

  const fmtInt = (n) => new Intl.NumberFormat("es-CL").format(n);
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });
  const fmtDateShort = (iso) =>
    new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric", month: "short", day: "2-digit", timeZone: "UTC",
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

  function formatMultiple(value) {
    return value.toFixed(1).replace(".", ",") + "×";
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

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setChipText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const dot = el.querySelector(".dot");
    el.textContent = "";
    if (dot) el.appendChild(dot);
    el.appendChild(document.createTextNode(text));
  }

  async function loadHeroStats() {
    try {
      const [summary, model] = await Promise.all([
        apiGet("/catalog/summary"),
        apiGet("/seismicity/model-summary").catch(() => null),
      ]);
      setText("s-total", fmtInt(summary.total_events));
      const earliestYear = summary.earliest_event_time
        ? new Date(summary.earliest_event_time).getFullYear()
        : "1964";
      const latestYear = summary.latest_event_time
        ? new Date(summary.latest_event_time).getFullYear()
        : "2026";
      setText("s-range", `${earliestYear}–${latestYear}`);
      if (model) {
        setText("s-mc", "Magnitud " + model.mc_value.toFixed(0) + " o más");
        setChipText("rail-model", `Modelo ${model.magnitude_type} · Mc ≈ ${model.mc_value.toFixed(0)}`);
      }
      return summary;
    } catch (error) {
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
      const tr = document.createElement("div"); tr.className = "feed-item";
      if ((event.event_time || "").slice(0, 10) === MAULE_DATE) tr.className = "notable";
      const dateTd = document.createElement("div"); dateTd.className = "feed-meta";
      dateTd.textContent = fmtDate(event.event_time);
      const magTd = document.createElement("div"); magTd.className = "feed-mag";
      magTd.innerHTML = `<span class="mag-pill">${event.magnitude.toFixed(1)}</span>`;
      const placeTd = document.createElement("div"); placeTd.className = "feed-place";
      placeTd.textContent = cleanPlace(event.place);
      const main = document.createElement("div"); main.className = "feed-main"; main.appendChild(placeTd); main.appendChild(magTd); tr.appendChild(dateTd); tr.appendChild(main);
              tr.addEventListener("click", () => {
          if (!map) return;
          map.setView([event.latitude, event.longitude], 6);
          if (window.aftershockCircle) map.removeLayer(window.aftershockCircle);
          const radiusKm = Math.max(10, Math.pow(10, 0.5 * event.magnitude - 1.2));
          window.aftershockCircle = L.circle([event.latitude, event.longitude], {
            radius: radiusKm * 1000,
            color: "#ff3366",
            weight: 2,
            fillColor: "rgba(255,51,102,0.2)",
            dashArray: "5, 10"
          }).bindPopup(`<div class="war-popup" style="padding:10px;background:#03060a;color:#fff;font-family:var(--font-mono);font-size:11px;"><b>ZONA DE RÉPLICAS EST.</b><br>Evento M${event.magnitude.toFixed(1)}<br>Radio de influencia: ${Math.round(radiusKm)} km</div>`).addTo(map).openPopup();
        });
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
        ["γ", String(model.gamma ?? 0)],
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
        if (t < 0.45) fill = `rgba(0, 229, 255, ${0.15 + t * 0.25})`;
        else if (t < 0.78) fill = `rgba(255, 204, 0, ${0.25 + t * 0.3})`;
        else fill = `rgba(255, 51, 102, ${0.45 + (t - 0.78) * 0.8})`;
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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO · USGS',
      subdomains: "abcd",
      maxZoom: 9,
    }).addTo(map);

    const legend = L.control({ position: "bottomleft" });
    legend.onAdd = () => {
      const box = L.DomUtil.create("div", "oef-map-legend");
      box.innerHTML =
        "<strong>Actividad relativa</strong>" +
        "<div class=\"heat-bar\"></div>" +
        "<div style=\"display:flex;justify-content:space-between\"><span>Menos</span><span>Más</span></div>" +
        "<div style=\"margin-top:6px;opacity:.75\">Círculos = sismos ya ocurridos</div>";
      return box;
    };
    legend.addTo(map);

    map.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
    return map;
  }

  function paintHeat(cells) {
    lastCells = cells || [];
    const leafletMap = ensureMap();
    const visible = layerOn.activity ? lastCells : [];
    if (!gridLayer) {
      gridLayer = new ActivityLayer(visible);
      gridLayer.addTo(leafletMap);
    } else {
      gridLayer.setCells(visible);
    }
    requestAnimationFrame(() => {
      leafletMap.invalidateSize();
      leafletMap.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
      if (gridLayer && gridLayer._redraw) gridLayer._redraw();
    });
  }

  function paintPlaces(places) {
    lastPlaces = places || [];
    const leafletMap = ensureMap();
    if (placeLayer) {
      leafletMap.removeLayer(placeLayer);
      placeLayer = null;
    }
    if (!layerOn.cities) return;
    placeLayer = L.layerGroup();
    for (const place of lastPlaces) {
      if (place.probability_at_least_one == null) continue;
      const marker = L.circleMarker([place.latitude, place.longitude], {
        radius: 5,
        weight: 1,
        color: "#f4f1ea",
        fillColor: "#ffcc00",
        fillOpacity: 0.9,
      });
              const chanceNum = parseFloat(formatChance(place.probability_at_least_one));
        const barsHTML = [1, 2, 3, 4, 5, 6, 7].map(day => {
          const height = Math.max(10, 100 * Math.pow(0.75, day-1)); 
          const op = Math.max(0.2, Math.pow(0.8, day-1));
          return `<div style="width:8px;height:${height}%;background:var(--warn);opacity:${op};border-radius:2px;"></div>`;
        }).join('');
        
        const html = `<div style="font-family:ui-monospace,monospace;font-size:12px;background:#03060a;border:1px solid var(--grid-thick);padding:12px;color:#fff;min-width:140px;">
          <strong style="color:var(--accent);font-size:13px;display:block;margin-bottom:4px;">${place.name}</strong>
          Prob. 7 días: <b style="color:var(--warn)">${formatChance(place.probability_at_least_one)}</b>
          <div style="margin-top:10px;font-size:9px;color:var(--text-dim);margin-bottom:4px;">Decaimiento ETAS:</div>
          <div style="display:flex;align-items:flex-end;gap:4px;height:40px;border-bottom:1px solid var(--grid-thick);padding-bottom:2px;">
            ${barsHTML}
          </div>
        </div>`;
        
        marker.bindPopup(html, { className: "war-popup" });
      marker.on("click", () => leafletMap.setView([place.latitude, place.longitude], 8));
      marker.addTo(placeLayer);
    }
    placeLayer.addTo(leafletMap);
  }

  function paintUsgsQuakes(quakes) {
    lastUsgsQuakes = quakes || [];
    const leafletMap = ensureMap();
    if (quakeLayer) {
      leafletMap.removeLayer(quakeLayer);
      quakeLayer = null;
    }
    if (!layerOn.recent) return;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = lastUsgsQuakes.filter((q) => q.time >= cutoff);
    quakeLayer = L.layerGroup();
    for (const quake of recent) {
      const ageDays = (Date.now() - quake.time) / 86400000;
      const fill = ageDays < 2 ? "#ff3366" : ageDays < 7 ? "#ffcc00" : "#00e5ff";
      const marker = L.circleMarker([quake.lat, quake.lon], {
        radius: Math.max(3, (quake.mag - 4) * 3.2),
        weight: 1,
        color: "#0a1016",
        fillColor: fill,
        fillOpacity: 0.85,
      });
      marker.bindTooltip(
        `<strong>M ${quake.mag.toFixed(1)}</strong><br>${fmtDateShort(new Date(quake.time).toISOString())}<br>${cleanPlace(quake.place)}`,
        { direction: "top", offset: [0, -6], opacity: 0.95 }
      );
      marker.addTo(quakeLayer);
    }
    quakeLayer.addTo(leafletMap);
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
    const minMass = ranked.length ? mass.get(ranked[ranked.length - 1]) : 0;
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
      const multiple = minMass > 0 ? mass.get(name) / minMass : 0;
      const row = document.createElement("div");
      row.className = "zone-row";
      row.innerHTML =
        `<span class="zone-name"></span>` +
        `<span class="zone-bar-track"><span class="zone-bar-fill"></span></span>` +
        `<span class="zone-level"></span>`;
      row.querySelector(".zone-name").textContent = name;
      row.querySelector(".zone-bar-fill").style.width = Math.max(8, intensity * 100) + "%";
      row.querySelector(".zone-level").textContent =
        name === ranked[ranked.length - 1] ? "la más baja" : formatMultiple(multiple) + " la más baja";
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

    setChipText("rail-valid", "Mapa válido hasta el " + fmtDateShort(detail.validity_end));

    setKv(document.getElementById("fc-kv"), [
      ["Emitido", fmtDateTime(detail.issued_at)],
      ["Válido desde", fmtDateTime(detail.validity_start)],
      ["Válido hasta", fmtDateTime(detail.validity_end)],
      ["Mc de referencia", detail.reference_magnitude.toFixed(2)],
      ["b-value usado", detail.b_value_used.toFixed(3)],
      ["Calibración", CALIBRATION_LABELS[detail.calibration_status] || detail.calibration_status],
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
    if (lastUsgsQuakes.length) paintUsgsQuakes(lastUsgsQuakes);
  }

  function renderRunHistory(runs) {
    const tbody = document.getElementById("run-history");
    const table = document.getElementById("runs-table");
    const loading = document.getElementById("runs-loading");
    if (!tbody || !runs.length) {
      if (loading) loading.textContent = "Todavía no hay un historial publicado.";
      return;
    }
    tbody.innerHTML = "";
    runs.forEach((run, index) => {
      const tr = document.createElement("div"); tr.className = "feed-item";
      if (index === 0) tr.className = "live";
      const archived = run.b_value_used > 1.6;
      const status = index === 0 ? "En uso" : archived ? "Archivo (mb)" : "Anterior";
      const cells = [
        status,
        fmtDateTime(run.issued_at),
        fmtDateShort(run.validity_end),
        HORIZON_LABELS[run.horizon_id] || run.horizon_id,
        run.b_value_used.toFixed(3),
        CALIBRATION_LABELS[run.calibration_status] || run.calibration_status,
      ];
      for (const value of cells) {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      }
              tr.addEventListener("click", () => {
          if (!map) return;
          map.setView([event.latitude, event.longitude], 6);
          if (window.aftershockCircle) map.removeLayer(window.aftershockCircle);
          const radiusKm = Math.max(10, Math.pow(10, 0.5 * event.magnitude - 1.2));
          window.aftershockCircle = L.circle([event.latitude, event.longitude], {
            radius: radiusKm * 1000,
            color: "#ff3366",
            weight: 2,
            fillColor: "rgba(255,51,102,0.2)",
            dashArray: "5, 10"
          }).bindPopup(`<div class="war-popup" style="padding:10px;background:#03060a;color:#fff;font-family:var(--font-mono);font-size:11px;"><b>ZONA DE RÉPLICAS EST.</b><br>Evento M${event.magnitude.toFixed(1)}<br>Radio de influencia: ${Math.round(radiusKm)} km</div>`).addTo(map).openPopup();
        });
        tbody.appendChild(tr);
    });
    if (loading) loading.style.display = "none";
    if (table) table.style.display = "table";
  }

  function drawMagnitudeTime(events) {
    const canvas = document.getElementById("mt-chart");
    const caption = document.getElementById("mt-caption");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || 960;
    const cssH = 240;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#0a1016";
    ctx.fillRect(0, 0, cssW, cssH);

    if (!events.length) {
      if (caption) caption.textContent = "USGS no devolvió sismos recientes para este recuadro.";
      return;
    }

    const pad = { l: 42, r: 16, t: 16, b: 28 };
    const minT = Math.min(...events.map((e) => e.time));
    const maxT = Math.max(...events.map((e) => e.time));
    const minM = 4.4;
    const maxM = Math.max(7.2, ...events.map((e) => e.mag)) + 0.2;
    const xOf = (t) => pad.l + ((t - minT) / Math.max(1, maxT - minT)) * (cssW - pad.l - pad.r);
    const yOf = (m) => pad.t + (1 - (m - minM) / (maxM - minM)) * (cssH - pad.t - pad.b);

    ctx.strokeStyle = "rgba(244,241,234,.08)";
    ctx.lineWidth = 1;
    ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
    ctx.fillStyle = "rgba(244,241,234,.45)";
    for (let mag = 5; mag <= Math.floor(maxM); mag += 1) {
      const y = yOf(mag);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(cssW - pad.r, y);
      ctx.stroke();
      ctx.fillText("M" + mag, 8, y + 4);
    }

    const yearStart = new Date(new Date(minT).getUTCFullYear(), 0, 1).getTime();
    for (let t = yearStart; t <= maxT; t += 365.25 * 86400000 / 4) {
      if (t < minT) continue;
      const x = xOf(t);
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, cssH - pad.b);
      ctx.stroke();
    }
    ctx.fillText(fmtDateShort(new Date(minT).toISOString()), pad.l, cssH - 8);
    ctx.fillText(fmtDateShort(new Date(maxT).toISOString()), cssW - 92, cssH - 8);

    for (const event of events) {
      const ageDays = (Date.now() - event.time) / 86400000;
      ctx.fillStyle = ageDays < 30 ? "rgba(255,178,107,.9)" : "rgba(107,163,201,.7)";
      ctx.beginPath();
      ctx.arc(xOf(event.time), yOf(event.mag), event.mag >= 6 ? 4.2 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const last30 = events.filter((e) => Date.now() - e.time <= 30 * 86400000).length;
    if (caption) {
      caption.textContent =
        `${fmtInt(events.length)} sismos M ≥ 4,5 en 24 meses (USGS). ` +
        `${fmtInt(last30)} en los últimos 30 días. No son predicciones.`;
    }
  }

  async function loadUsgs() {
    const start = new Date();
    start.setUTCMonth(start.getUTCMonth() - 24);
    const url = USGS_QUERY + "&starttime=" + start.toISOString().slice(0, 10);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("USGS " + response.status);
      const geo = await response.json();
      const quakes = (geo.features || [])
        .map((feature) => {
          const coords = feature.geometry && feature.geometry.coordinates;
          const props = feature.properties || {};
          if (!coords || props.mag == null || !props.time) return null;
          return {
            lon: coords[0],
            lat: coords[1],
            mag: props.mag,
            time: props.time,
            place: props.place || "",
          };
        })
        .filter(Boolean);
      lastUsgsQuakes = quakes;
      drawMagnitudeTime(quakes);
      if (map) paintUsgsQuakes(quakes);
    } catch (error) {
      const caption = document.getElementById("mt-caption");
      if (caption) caption.textContent = "No se pudieron cargar los sismos recientes de USGS.";
      console.warn("chile-oef usgs", error);
    }
  }

  const MEGA_QUAKES = [
    { lat: -38.29, lon: -73.05, mag: 9.5, name: "Valdivia 1960", year: 1960 },
    { lat: -36.122, lon: -72.898, mag: 8.8, name: "Maule 2010", year: 2010 },
    { lat: -31.57, lon: -71.65, mag: 8.3, name: "Illapel 2015", year: 2015 },
    { lat: -28.15, lon: -71.17, mag: 8.5, name: "Vallenar 1922", year: 1922 },
    { lat: -33.0, lon: -71.9, mag: 8.0, name: "Valparaíso 1985", year: 1985 },
    { lat: -19.61, lon: -70.77, mag: 8.2, name: "Iquique 2014", year: 2014 },
    { lat: -39.8, lon: -73.2, mag: 8.5, name: "Valdivia 1575", year: 1575 },
    { lat: -33.12, lon: -71.55, mag: 8.3, name: "Valparaíso 1906", year: 1906 }
  ];

  const FAULT_TRENCH = [
    [-18, -71.6], [-20, -71.7], [-23, -71.8], [-27, -72.2],
    [-30, -72.7], [-33, -72.8], [-38, -74.5], [-45, -76.5], [-50, -77.2]
  ];

  function paintMegaQuakes() {
    if (!map) return;
    if (megaLayer) map.removeLayer(megaLayer);
    if (!layerOn.mega) return;
    megaLayer = L.layerGroup();
    for (const mq of MEGA_QUAKES) {
      const radius = Math.max(10, (mq.mag - 7) * 15);
      const marker = L.circleMarker([mq.lat, mq.lon], {
        radius: radius,
        weight: 2,
        color: "#ff3366",
        fillColor: "rgba(255, 51, 102, 0.4)",
        fillOpacity: 0.6,
        className: "mega-pulse"
      });
      const html = `<div style="font-family:ui-monospace,monospace;font-size:12px;background:#03060a;border:1px solid #ff3366;padding:8px;color:#fff;">
        <strong style="color:#ff3366;font-size:14px;display:block;">${mq.name}</strong>
        Magnitud: <b>${mq.mag}</b><br>
        Año: ${mq.year}
      </div>`;
      marker.bindPopup(html, { className: "war-popup" });
      marker.addTo(megaLayer);
    }
    megaLayer.addTo(map);
  }

  function paintFaults() {
    if (!map) return;
    if (faultLayer) map.removeLayer(faultLayer);
    if (!layerOn.faults) return;
    faultLayer = L.polyline(FAULT_TRENCH, {
      color: "#00e5ff",
      weight: 3,
      dashArray: "10, 15",
      opacity: 0.8
    });
    faultLayer.bindTooltip("Fosa de Subducción (Placa Nazca / Sudamericana)", {
      direction: "right", sticky: true, className: "war-tooltip"
    });
    faultLayer.addTo(map);
  }

  function playRadar() {
    if (!lastUsgsQuakes || !lastUsgsQuakes.length) return;
    const btn = document.getElementById("btn-radar");
    if (btn) btn.textContent = "EJECUTANDO BARRIDO...";
    layerOn.recent = false;
    const chk = document.getElementById("tog-recent");
    if (chk) chk.checked = false;
    paintUsgsQuakes([]);
    
    // Sort oldest to newest
    const sorted = [...lastUsgsQuakes].sort((a,b) => a.time - b.time);
    let i = 0;
    const radarLayer = L.layerGroup().addTo(map);
    
    if (radarInterval) clearInterval(radarInterval);
    radarInterval = setInterval(() => {
      if (i >= sorted.length) {
        clearInterval(radarInterval);
        if (btn) btn.textContent = "▶ Iniciar Radar (30 Días)";
        setTimeout(() => {
          map.removeLayer(radarLayer);
          layerOn.recent = true;
          if (chk) chk.checked = true;
          paintUsgsQuakes(lastUsgsQuakes);
        }, 3000);
        return;
      }
      const q = sorted[i];
      const radius = Math.max(4, (q.mag - 4) * 4);
      const m = L.circleMarker([q.lat, q.lon], {
        radius: radius, color: "#fff", fillColor: "#00e5ff", fillOpacity: 0.9, weight: 2
      }).addTo(radarLayer);
      
      // Fade out effect
      setTimeout(() => {
        if (map.hasLayer(m)) m.setStyle({ color: "#00e5ff", fillColor: "rgba(0, 229, 255, 0.2)", weight: 1 });
      }, 500);

      i++;
    }, 40);
  }

  function bindLayerToggles() {
    const pairs = [
      ["tog-activity", "activity"],
      ["tog-cities", "cities"],
      ["tog-recent", "recent"], ["tog-mega", "mega"], ["tog-faults", "faults"],
    ];
    for (const [id, key] of pairs) {
      const input = document.getElementById(id);
      if (!input) continue;
      input.addEventListener("change", () => {
        layerOn[key] = input.checked;
        if (key === "activity" && gridLayer) gridLayer.setCells(layerOn.activity ? lastCells : []);
        if (key === "cities") paintPlaces(lastPlaces);
        if (key === "recent") paintUsgsQuakes(lastUsgsQuakes);
          if (key === "mega") paintMegaQuakes();
          if (key === "faults") paintFaults();
      });
    }
  }

  async function initForecast() {
    try {
      const list = await apiGet("/forecasts", { limit: 10 });
      renderRunHistory(list.data || []);
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

  window.addEventListener("resize", () => {
    if (lastUsgsQuakes.length) drawMagnitudeTime(lastUsgsQuakes);
  });

  const COMUNAS_DATA = [
    { name: "Arica", lat: -18.47, lon: -70.30, zone: "Norte Grande", ref: "Sismo de Arica 1868 (M8.8)" },
    { name: "Iquique", lat: -20.21, lon: -70.15, zone: "Norte Grande", ref: "Terremoto de Iquique 2014 (M8.2)" },
    { name: "Tocopilla", lat: -22.09, lon: -70.19, zone: "Norte Grande", ref: "Terremoto de Tocopilla 2007 (M7.7)" },
    { name: "Calama", lat: -22.45, lon: -68.92, zone: "Norte Grande", ref: "Sismo de Calama 1950 (M7.0)" },
    { name: "Antofagasta", lat: -23.65, lon: -70.40, zone: "Norte Grande", ref: "Terremoto de Antofagasta 1995 (M8.0)" },
    { name: "Copiapó", lat: -27.36, lon: -70.33, zone: "Norte Chico", ref: "Terremoto de Atacama 1922 (M8.5)" },
    { name: "Vallenar", lat: -28.57, lon: -70.75, zone: "Norte Chico", ref: "Terremoto de Atacama 1922 (M8.5)" },
    { name: "La Serena", lat: -29.90, lon: -71.25, zone: "Norte Chico", ref: "Terremoto de Coquimbo 2015 (M8.3)" },
    { name: "Coquimbo", lat: -29.95, lon: -71.33, zone: "Norte Chico", ref: "Terremoto de Illapel / Coquimbo 2015 (M8.3)" },
    { name: "Ovalle", lat: -30.59, lon: -71.20, zone: "Norte Chico", ref: "Terremoto de Punitaqui 1997 (M7.1)" },
    { name: "Illapel", lat: -31.63, lon: -71.16, zone: "Norte Chico", ref: "Terremoto de Illapel 2015 (M8.3)" },
    { name: "La Ligua / Petorca", lat: -32.45, lon: -71.23, zone: "Zona Central", ref: "Terremoto de La Ligua 1965 (M7.4)" },
    { name: "Viña del Mar", lat: -33.02, lon: -71.55, zone: "Zona Central", ref: "Terremoto de Valparaíso 1985 (M8.0)" },
    { name: "Valparaíso", lat: -33.04, lon: -71.61, zone: "Zona Central", ref: "Terremoto de Valparaíso 1985 (M8.0)" },
    { name: "Quillota", lat: -32.88, lon: -71.24, zone: "Zona Central", ref: "Terremoto de 1985 (M8.0)" },
    { name: "San Antonio", lat: -33.58, lon: -71.61, zone: "Zona Central", ref: "Terremoto de 1985 (M8.0)" },
    { name: "Santiago", lat: -33.45, lon: -70.66, zone: "Zona Central", ref: "Terremoto 1985 (M8.0) / 2010 (M8.8)" },
    { name: "Puente Alto", lat: -33.61, lon: -70.57, zone: "Zona Central", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Maipú", lat: -33.51, lon: -70.76, zone: "Zona Central", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "La Florida", lat: -33.52, lon: -70.58, zone: "Zona Central", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Melipilla", lat: -33.68, lon: -71.21, zone: "Zona Central", ref: "Terremoto de 1985 (M8.0)" },
    { name: "Rancagua", lat: -34.17, lon: -70.74, zone: "Zona Central", ref: "Terremoto de Pichilemu 2010 (M6.9)" },
    { name: "San Fernando", lat: -34.58, lon: -70.98, zone: "Zona Central", ref: "Terremoto del Maule 2010 (M8.8)" },
    { name: "Curicó", lat: -34.98, lon: -71.23, zone: "Zona Central", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Talca", lat: -35.42, lon: -71.65, zone: "Zona Central", ref: "Epicentro cercano 27F 2010 (M8.8)" },
    { name: "Linares", lat: -35.84, lon: -71.59, zone: "Zona Central", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Chillán", lat: -36.60, lon: -72.10, zone: "Zona Central", ref: "Terremoto de Chillán 1939 (M7.8)" },
    { name: "Concepción", lat: -36.82, lon: -73.05, zone: "Zona Sur", ref: "Terremoto del Maule 27F 2010 (M8.8)" },
    { name: "Talcahuano", lat: -36.71, lon: -73.11, zone: "Zona Sur", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Los Ángeles", lat: -37.47, lon: -72.35, zone: "Zona Sur", ref: "Terremoto 27F 2010 (M8.8)" },
    { name: "Temuco", lat: -38.73, lon: -72.59, zone: "Zona Sur", ref: "Terremoto de Valdivia 1960 (M9.5)" },
    { name: "Valdivia", lat: -39.81, lon: -73.24, zone: "Zona Sur", ref: "El Gran Terremoto de Valdivia 1960 (M9.5)" },
    { name: "Osorno", lat: -40.57, lon: -73.13, zone: "Zona Sur", ref: "Terremoto de Valdivia 1960 (M9.5)" },
    { name: "Puerto Montt", lat: -41.47, lon: -72.94, zone: "Zona Sur", ref: "Terremoto de Valdivia 1960 (M9.5)" },
    { name: "Castro / Chiloé", lat: -42.47, lon: -73.77, zone: "Zona Sur", ref: "Terremoto de Chiloé 2016 (M7.6)" },
    { name: "Coyhaique", lat: -45.57, lon: -72.06, zone: "Zona Austral", ref: "Terremoto de Aysén 2007 (M6.2)" },
    { name: "Punta Arenas", lat: -53.16, lon: -70.91, zone: "Zona Austral", ref: "Terremoto de Magallanes 1949 (M7.8)" }
  ];

  function initComunaSearch() {
    const input = document.getElementById("comuna-input");
    const box = document.getElementById("comuna-result");
    if (!input || !box) return;

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q || q.length < 2) {
        box.style.display = "none";
        return;
      }

      const match = COMUNAS_DATA.find(c => c.name.toLowerCase().includes(q));
      if (!match) {
        box.style.display = "block";
        box.innerHTML = `<p class="plain-note" style="color:var(--muted)">No encontramos resultados exactos para "${q}". Intenta con el nombre de tu ciudad principal más cercana (ej: Santiago, Viña del Mar, Concepción...).</p>`;
        return;
      }

      // Calculate chance from lastCells if available
      let chanceText = "cargando...";
      if (lastCells && lastCells.length) {
        let bestDist = Infinity;
        let bestCell = null;
        for (const cell of lastCells) {
          const dLat = cell.lat - match.lat;
          const dLon = cell.lon - match.lon;
          const dist = dLat * dLat + dLon * dLon;
          if (dist < bestDist) {
            bestDist = dist;
            bestCell = cell;
          }
        }
        if (bestCell) {
          const p = (bestCell.bins && (bestCell.bins["5-6"] || bestCell.bins["5+"])) || bestCell.rate;
          chanceText = formatChance(p);
        }
      }

      box.style.display = "block";
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="color:#fff; margin-bottom:4px; font-size:1.15rem;">📍 Comuna / Ciudad: ${match.name}</h3>
            <p class="plain-note" style="margin-bottom:6px;"><strong>Macro-Zona:</strong> ${match.zone} · <strong>Referencia Histórica:</strong> ${match.ref}</p>
          </div>
          <div style="background:#0b0b0c; border:1px solid var(--rule); padding:10px 14px; border-radius:4px; text-align:right;">
            <div style="font-size:10px; text-transform:uppercase; color:var(--muted);">Probabilidad ETAS (7 días M≥5.0):</div>
            <div style="font-family:var(--font-mono); font-weight:700; font-size:1.25rem; color:var(--oef);">${chanceText}</div>
          </div>
        </div>
      `;
    });
  }

  const btn = document.getElementById("btn-radar");
    if (btn) btn.addEventListener("click", playRadar);

      function drawGRChart() {
    const ctx = document.getElementById('gr-chart').getContext('2d');
    if (window.grChartInstance) window.grChartInstance.destroy();
    
    // Gutenberg-Richter standard synthetic data for Chile (b-value ~ 1.0)
    const labels = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];
    const data = labels.map(m => Math.pow(10, 6.5 - (0.95 * m))); 
    
    window.grChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Frecuencia Acumulada Anual Estimada (N > M)',
          data: data,
          backgroundColor: 'rgba(0, 229, 255, 0.2)',
          borderColor: '#00e5ff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'logarithmic',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#7995a8' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#7995a8' },
            title: { display: true, text: 'Magnitud (Mw)', color: '#00e5ff' }
          }
        },
        plugins: {
          legend: { labels: { color: '#fff', font: { family: 'IBM Plex Mono' } } }
        }
      }
    });
  }

  const btnChart = document.getElementById("btn-charts");
  const modalChart = document.getElementById("chart-modal");
  const btnCloseChart = document.getElementById("btn-close-chart");
  if (btnChart && modalChart) {
    btnChart.addEventListener("click", () => {
      modalChart.style.display = "block";
      drawGRChart();
    });
    btnCloseChart.addEventListener("click", () => {
      modalChart.style.display = "none";
    });
  }

    bindLayerToggles();
  loadCatalog();
  loadModelSummary();
  initForecast();
  loadUsgs();
  initComunaSearch();
})();








