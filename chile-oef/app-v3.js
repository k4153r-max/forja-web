(() => {
  "use strict";

  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.fly.dev/v1";
  const FETCH_TIMEOUT_MS = 12000;
  const MAX_ATTEMPTS = 2;
  const RETRY_DELAY_MS = 1500;
  const MAP_CELL_LIMIT = 1000;
  const CHILE_BOUNDS = [[-55.9, -76.8], [-17.4, -66.2]];
  const CHILE_MAX_BOUNDS = [[-58.5, -82], [-15.5, -62]];
  const DAY_MS = 86400000;
  const USGS_BASE =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
    "&minlatitude=-56&maxlatitude=-17&minlongitude=-78&maxlongitude=-66" +
    "&minmagnitude=4.5&orderby=time&limit=300";

  const ZONES = [
    { name: "Norte Grande", maxLat: -17.4, minLat: -26 },
    { name: "Norte Chico", maxLat: -26, minLat: -32 },
    { name: "Zona Central", maxLat: -32, minLat: -37 },
    { name: "Zona Sur", maxLat: -37, minLat: -44 },
    { name: "Zona Austral", maxLat: -44, minLat: -56 },
  ];

  const TRENCH_LINE = [
    [-18, -71.6], [-20, -71.7], [-23, -71.8], [-27, -72.2],
    [-30, -72.7], [-33, -72.8], [-38, -74.5], [-45, -76.5], [-50, -77.2],
  ];

  const state = {
    map: null,
    activityLayer: null,
    placeLayer: null,
    quakeLayer: null,
    notableLayer: null,
    trenchLayer: null,
    radarLayer: null,
    radarTimer: null,
    cells: [],
    places: [],
    quakes: [],
    notableEvents: [],
    model: null,
    runId: null,
    firstMapFit: true,
    layers: { activity: true, cities: true, recent: true, notable: false, trench: false },
  };

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fmtInt = (value) => new Intl.NumberFormat("es-CL").format(value);

  function fmtDate(value, options = {}) {
    if (!value) return "sin dato";
    return new Date(value).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Santiago",
      ...options,
    });
  }

  function fmtDateTime(value) {
    if (!value) return "sin dato";
    return new Date(value).toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago",
    });
  }

  function formatChance(probability) {
    if (probability == null || !Number.isFinite(Number(probability))) return "sin dato";
    const value = Number(probability);
    if (value <= 0) return "≈ 0%";
    const percent = value * 100;
    const decimal = percent >= 1 ? 1 : 2;
    const percentText = percent.toFixed(decimal).replace(".", ",") + "%";
    if (percent >= 0.01) return percentText;
    return "1 en " + fmtInt(Math.max(2, Math.round(1 / value)));
  }

  function cleanPlace(place) {
    if (!place) return "Chile";
    return place
      .replace(/^\d+\s*km\s+[A-Z]{1,3}\s+of\s+/i, "")
      .replace(/\s+Earthquake$/i, "")
      .replace(/^2010\s+/i, "")
      .replace(/,?\s+Chile$/i, ", Chile")
      .replace(/^,\s*/, "")
      .trim();
  }

  function timeAgo(timestamp) {
    const elapsed = Math.max(0, Date.now() - Number(timestamp));
    const hours = Math.floor(elapsed / 3600000);
    if (hours < 1) return "hace menos de 1 h";
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${Math.floor(hours / 24)} d`;
  }

  function zoneForLatitude(latitude) {
    return ZONES.find((zone) => latitude <= zone.maxLat && latitude > zone.minLat) || ZONES[4];
  }

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
  }

  function reportProblem(area, error) {
    console.warn(`chile-oef ${area}`, error);
    const message = $("global-message");
    if (!message) return;
    message.hidden = false;
    message.textContent = `${area}: no se pudo cargar esta fuente. El resto del tablero sigue disponible.`;
  }

  async function fetchJson(url, options = {}) {
    const attempts = options.attempts ?? MAX_ATTEMPTS;
    const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const detail = Array.isArray(body.detail)
            ? body.detail.map((item) => item.msg).filter(Boolean).join("; ")
            : body.detail;
          const error = new Error(detail || `HTTP ${response.status}`);
          error.retryable = response.status >= 500;
          throw error;
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.retryable === false || attempt === attempts - 1) break;
        await sleep(RETRY_DELAY_MS);
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError;
  }

  function apiGet(path, params = {}, options = {}) {
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
    return fetchJson(url, options);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderCatalog(summary) {
    setText("catalog-total", fmtInt(summary.total_events));
    setText("catalog-range", `${new Date(summary.earliest_event_time).getFullYear()}–${new Date(summary.latest_event_time).getFullYear()}`);
    setText("catalog-updated", `Último evento incorporado: ${fmtDate(summary.latest_event_time)}`);
    state.notableEvents = (summary.top_magnitude_events || []).filter((event) => event.magnitude >= 8);
    if (state.layers.notable) paintNotableEvents();
  }

  function renderModel(model) {
    state.model = model;
    setText("model-mc", `M${model.mc_value.toFixed(1)}`);
    setText("model-b", model.b_value.toFixed(3));
    setText("model-window", `${fmtDate(model.completeness_window_start)} – ${fmtDate(model.completeness_window_end)}`);
    setText(
      "model-summary",
      `ETAS espacio-temporal ajustado con ${fmtInt(model.completeness_event_count)} eventos; ` +
      `${fmtInt(model.events_at_or_above_mc)} sobre la magnitud de completitud.`,
    );
    const stateElement = $("model-state");
    stateElement.textContent = model.converged ? "Ajuste convergente" : "Ajuste no convergente";
    stateElement.dataset.state = model.converged ? "ok" : "warning";
    $("btn-charts").disabled = false;
  }

  function rankedCells(cells) {
    const sorted = cells
      .filter((cell) => Number(cell.probability_at_least_one) > 0)
      .slice()
      .sort((a, b) => a.probability_at_least_one - b.probability_at_least_one);
    return sorted.map((cell, index) => ({
      cell,
      rank: sorted.length < 2 ? 1 : index / (sorted.length - 1),
    }));
  }

  function ensureActivityLayerClass() {
    if (window.ChileOefActivityLayer) return window.ChileOefActivityLayer;
    window.ChileOefActivityLayer = L.Layer.extend({
      initialize(cells) {
        this._cells = cells || [];
      },
      onAdd(leafletMap) {
        this._map = leafletMap;
        this._canvas = L.DomUtil.create("canvas", "oef-grid-canvas");
        this._canvas.setAttribute("aria-hidden", "true");
        leafletMap.getPanes().overlayPane.appendChild(this._canvas);
        this._reset = () => this._redraw();
        leafletMap.on("moveend zoom viewreset resize", this._reset);
        this._redraw();
      },
      onRemove(leafletMap) {
        leafletMap.off("moveend zoom viewreset resize", this._reset);
        if (this._canvas) L.DomUtil.remove(this._canvas);
      },
      setCells(cells) {
        this._cells = cells || [];
        this._redraw();
      },
      _redraw() {
        if (!this._map || !this._canvas) return;
        const size = this._map.getSize();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._canvas.width = Math.round(size.x * dpr);
        this._canvas.height = Math.round(size.y * dpr);
        this._canvas.style.width = `${size.x}px`;
        this._canvas.style.height = `${size.y}px`;
        const context = this._canvas.getContext("2d");
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, size.x, size.y);

        rankedCells(this._cells)
          .filter((item) => item.rank >= 0.45)
          .forEach(({ cell, rank }) => {
            const t = (rank - 0.45) / 0.55;
            const half = 0.055;
            const northwest = this._map.latLngToContainerPoint([
              cell.center_latitude + half,
              cell.center_longitude - half,
            ]);
            const southeast = this._map.latLngToContainerPoint([
              cell.center_latitude - half,
              cell.center_longitude + half,
            ]);
            const width = Math.max(1.5, Math.abs(southeast.x - northwest.x));
            const height = Math.max(1.5, Math.abs(southeast.y - northwest.y));
            context.fillStyle = t < 0.55
              ? `rgba(0, 191, 214, ${0.12 + t * 0.28})`
              : t < 0.82
                ? `rgba(244, 183, 64, ${0.28 + t * 0.2})`
                : `rgba(237, 92, 92, ${0.48 + (t - 0.82) * 0.8})`;
            context.fillRect(
              Math.min(northwest.x, southeast.x),
              Math.min(northwest.y, southeast.y),
              width,
              height,
            );
          });
      },
    });
    return window.ChileOefActivityLayer;
  }

  function ensureMap() {
    if (state.map) return state.map;
    if (!window.L) throw new Error("Leaflet no está disponible");
    state.map = L.map("oef-map", {
      zoomControl: false,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 10,
      maxBounds: CHILE_MAX_BOUNDS,
      maxBoundsViscosity: 0.9,
    });
    L.control.zoom({ position: "bottomright" }).addTo(state.map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO',
      subdomains: "abcd",
      maxZoom: 10,
    }).addTo(state.map);
    state.map.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
    return state.map;
  }

  function paintHeat(cells) {
    state.cells = cells || [];
    const map = ensureMap();
    const visible = state.layers.activity ? state.cells : [];
    if (!state.activityLayer) {
      const ActivityLayer = ensureActivityLayerClass();
      state.activityLayer = new ActivityLayer(visible).addTo(map);
    } else {
      state.activityLayer.setCells(visible);
    }
    requestAnimationFrame(() => {
      map.invalidateSize();
      if (state.firstMapFit) {
        map.fitBounds(CHILE_BOUNDS, { padding: [10, 10] });
        state.firstMapFit = false;
      }
    });
  }

  function popupBlock(title, lines) {
    const wrap = createElement("div", "map-popup");
    wrap.appendChild(createElement("strong", "map-popup__title", title));
    lines.forEach((line) => wrap.appendChild(createElement("span", "map-popup__line", line)));
    return wrap;
  }

  function paintPlaces() {
    const map = ensureMap();
    if (state.placeLayer) map.removeLayer(state.placeLayer);
    state.placeLayer = null;
    if (!state.layers.cities) return;
    state.placeLayer = L.layerGroup();
    state.places.forEach((place) => {
      if (place.probability_at_least_one == null) return;
      const marker = L.circleMarker([place.latitude, place.longitude], {
        radius: 5,
        weight: 1.5,
        color: "#f4f1ea",
        fillColor: "#f4b740",
        fillOpacity: 0.9,
      });
      marker.bindPopup(popupBlock(place.name, [
        `Estimación 7 días: ${formatChance(place.probability_at_least_one)}`,
        `Radio de lectura: ${Math.round(place.radius_km)} km`,
        "Pronóstico puntual sin calibración operacional.",
      ]));
      marker.addTo(state.placeLayer);
    });
    state.placeLayer.addTo(map);
  }

  function paintQuakes(quakes = state.quakes) {
    const map = ensureMap();
    if (state.quakeLayer) map.removeLayer(state.quakeLayer);
    state.quakeLayer = null;
    if (!state.layers.recent) return;
    state.quakeLayer = L.layerGroup();
    quakes.forEach((quake) => {
      const ageDays = (Date.now() - quake.time) / DAY_MS;
      const marker = L.circleMarker([quake.lat, quake.lon], {
        radius: Math.max(3, (quake.mag - 4) * 3.1),
        weight: 1,
        color: "#081016",
        fillColor: ageDays < 2 ? "#ed5c5c" : ageDays < 7 ? "#f4b740" : "#00bfd6",
        fillOpacity: 0.88,
      });
      marker.bindPopup(popupBlock(`M ${quake.mag.toFixed(1)}`, [
        cleanPlace(quake.place),
        fmtDateTime(quake.time),
        quake.depth == null ? "Profundidad sin dato" : `Profundidad: ${quake.depth.toFixed(1)} km`,
        "Fuente: USGS",
      ]));
      marker.addTo(state.quakeLayer);
    });
    state.quakeLayer.addTo(map);
  }

  function paintNotableEvents() {
    const map = ensureMap();
    if (state.notableLayer) map.removeLayer(state.notableLayer);
    state.notableLayer = null;
    if (!state.layers.notable) return;
    state.notableLayer = L.layerGroup();
    state.notableEvents.forEach((event) => {
      const marker = L.circleMarker([event.latitude, event.longitude], {
        radius: Math.max(9, (event.magnitude - 7) * 10),
        weight: 2,
        color: "#ed5c5c",
        fillColor: "#ed5c5c",
        fillOpacity: 0.24,
      });
      marker.bindPopup(popupBlock(`M ${event.magnitude.toFixed(1)} · ${fmtDate(event.event_time)}`, [
        cleanPlace(event.place),
        "Evento histórico del catálogo CHILE-OEF.",
      ]));
      marker.addTo(state.notableLayer);
    });
    state.notableLayer.addTo(map);
  }

  function paintTrench() {
    const map = ensureMap();
    if (state.trenchLayer) map.removeLayer(state.trenchLayer);
    state.trenchLayer = null;
    if (!state.layers.trench) return;
    state.trenchLayer = L.polyline(TRENCH_LINE, {
      color: "#b07cff",
      weight: 2,
      opacity: 0.8,
      dashArray: "7 7",
    }).bindPopup(popupBlock("Fosa de subducción", [
      "Trazado esquemático para orientación visual; no es cartografía oficial.",
    ])).addTo(map);
  }

  function renderPlaces(places) {
    state.places = places || [];
    const list = $("city-list");
    list.replaceChildren();
    state.places
      .slice()
      .sort((a, b) => (b.probability_at_least_one || 0) - (a.probability_at_least_one || 0))
      .forEach((place) => {
        const button = createElement("button", "city-row");
        button.type = "button";
        button.appendChild(createElement("span", "city-name", place.name));
        button.appendChild(createElement("span", "city-chance", formatChance(place.probability_at_least_one)));
        button.setAttribute("aria-label", `${place.name}: ${formatChance(place.probability_at_least_one)}. Centrar en el mapa.`);
        button.addEventListener("click", () => {
          ensureMap().setView([place.latitude, place.longitude], 7);
        });
        list.appendChild(button);
      });
    paintPlaces();
  }

  function renderZones(cells) {
    const values = new Map(ZONES.map((zone) => [zone.name, 0]));
    cells.forEach((cell) => {
      const zone = zoneForLatitude(cell.center_latitude);
      values.set(zone.name, Math.max(values.get(zone.name), cell.probability_at_least_one || 0));
    });
    const maxValue = Math.max(...values.values(), 1e-12);
    const list = $("zone-list");
    list.replaceChildren();
    ZONES.forEach((zone) => {
      const score = Math.round((values.get(zone.name) / maxValue) * 100);
      const row = createElement("div", "zone-row");
      row.appendChild(createElement("span", "zone-name", zone.name));
      const track = createElement("span", "zone-track");
      const fill = createElement("span", "zone-fill");
      fill.style.width = `${score}%`;
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(createElement("span", "zone-score", `${score}`));
      row.setAttribute("aria-label", `${zone.name}: índice relativo ${score} de 100`);
      row.setAttribute("role", "meter");
      row.setAttribute("aria-valuemin", "0");
      row.setAttribute("aria-valuemax", "100");
      row.setAttribute("aria-valuenow", String(score));
      list.appendChild(row);
    });
  }

  function renderRecent(quakes) {
    state.quakes = quakes;
    const list = $("recent-list");
    list.replaceChildren();
    quakes.slice(0, 8).forEach((quake) => {
      const button = createElement("button", "event-row");
      button.type = "button";
      const magnitude = createElement("span", "event-mag", `M${quake.mag.toFixed(1)}`);
      const detail = createElement("span", "event-detail");
      detail.appendChild(createElement("strong", "event-place", cleanPlace(quake.place)));
      detail.appendChild(createElement("span", "event-time", timeAgo(quake.time)));
      button.append(magnitude, detail);
      button.addEventListener("click", () => ensureMap().setView([quake.lat, quake.lon], 7));
      button.setAttribute("aria-label", `M ${quake.mag.toFixed(1)}, ${cleanPlace(quake.place)}, ${timeAgo(quake.time)}. Centrar en el mapa.`);
      list.appendChild(button);
    });
    setText("usgs-updated", quakes.length ? `${fmtInt(quakes.length)} eventos M≥4,5 · últimos 30 días` : "Sin eventos en la consulta");
    paintQuakes();
  }

  function populateMagnitudeSelect(detail) {
    const select = $("mag-select");
    const bins = (detail.magnitude_bins || []).filter((bin) => bin.lower >= 5);
    const signature = bins.map((bin) => `${bin.lower}:${bin.upper}`).join("|");
    if (select.dataset.signature !== signature) {
      select.replaceChildren();
      bins.forEach((bin) => {
        const option = document.createElement("option");
        option.value = String(bin.lower);
        option.textContent = bin.upper ? `M ${bin.lower.toFixed(1)}–${bin.upper.toFixed(1)}` : `M ${bin.lower.toFixed(1)}+`;
        select.appendChild(option);
      });
      select.dataset.signature = signature;
    }
    select.value = String(detail.selected_magnitude_lower);
    select.disabled = false;
  }

  async function loadForecast(runId, magnitudeLower = 5) {
    state.runId = runId;
    const select = $("mag-select");
    select.disabled = true;
    setText("map-status", "Actualizando lectura…");
    $("forecast-state").dataset.state = "loading";
    $("forecast-state").textContent = "Cargando pronóstico";
    try {
      const placesPromise = apiGet(
        `/forecasts/${runId}/places`,
        { magnitude_lower: magnitudeLower, radius_km: 40 },
        { attempts: 1, timeoutMs: 35000 },
      ).then((value) => ({ value }), (error) => ({ error }));
      const detail = await apiGet(
        `/forecasts/${runId}`,
        { magnitude_lower: magnitudeLower, limit: MAP_CELL_LIMIT },
        { attempts: 1, timeoutMs: 20000 },
      );
      populateMagnitudeSelect(detail);
      paintHeat(detail.cells || []);
      renderZones(detail.cells || []);
      const selectedBin = (detail.magnitude_bins || []).find((bin) => bin.lower === detail.selected_magnitude_lower);
      const magnitudeLabel = selectedBin && selectedBin.upper
        ? `M ${selectedBin.lower.toFixed(1)}–${selectedBin.upper.toFixed(1)}`
        : `M ${detail.selected_magnitude_lower.toFixed(1)}+`;
      setText("legend-mag", magnitudeLabel);
      setText("map-status", `${magnitudeLabel} · ${fmtInt(detail.cells.length)} celdas de mayor tasa`);
      setText("forecast-updated", `Emitido ${fmtDateTime(detail.issued_at)} · válido hasta ${fmtDateTime(detail.validity_end)}`);

      const isCurrent = new Date(detail.validity_end).getTime() >= Date.now();
      const stateElement = $("forecast-state");
      stateElement.textContent = isCurrent ? "Vigencia activa" : "Pronóstico vencido";
      stateElement.dataset.state = isCurrent ? "ok" : "warning";
      setText(
        "calibration-note",
        detail.calibration_status === "uncalibrated_point_forecast"
          ? "Pronóstico puntual sin calibración operacional. Úsalo sólo para comparar patrones relativos."
          : `Estado de calibración: ${detail.calibration_status}.`,
      );
      const placesResult = await placesPromise;
      if (placesResult.value) renderPlaces(placesResult.value.places || []);
      else reportProblem("Lecturas por ciudad", placesResult.error);
    } catch (error) {
      $("forecast-state").textContent = "Pronóstico no disponible";
      $("forecast-state").dataset.state = "error";
      setText("map-status", "El mapa base sigue disponible");
      reportProblem("Pronóstico ETAS", error);
    } finally {
      select.disabled = false;
    }
  }

  async function loadUsgs() {
    const start = new Date(Date.now() - 30 * DAY_MS).toISOString().slice(0, 10);
    const payload = await fetchJson(`${USGS_BASE}&starttime=${start}`, { attempts: 2 });
    return (payload.features || []).map((feature) => {
      const coordinates = feature.geometry?.coordinates || [];
      const properties = feature.properties || {};
      return {
        id: feature.id,
        lon: Number(coordinates[0]),
        lat: Number(coordinates[1]),
        depth: coordinates[2] == null ? null : Number(coordinates[2]),
        mag: Number(properties.mag),
        time: Number(properties.time),
        place: properties.place || "Chile",
      };
    }).filter((quake) => Number.isFinite(quake.lat) && Number.isFinite(quake.lon) && Number.isFinite(quake.mag));
  }

  function stopRadar(restore = true) {
    if (state.radarTimer) clearInterval(state.radarTimer);
    state.radarTimer = null;
    if (state.radarLayer && state.map) state.map.removeLayer(state.radarLayer);
    state.radarLayer = null;
    const button = $("btn-radar");
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Reproducir 30 días";
    if (restore) paintQuakes();
  }

  function playRadar() {
    if (state.radarTimer) {
      stopRadar();
      return;
    }
    if (!state.quakes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paintQuakes();
      return;
    }
    const map = ensureMap();
    if (state.quakeLayer) map.removeLayer(state.quakeLayer);
    state.quakeLayer = null;
    state.radarLayer = L.layerGroup().addTo(map);
    const ordered = state.quakes.slice().sort((a, b) => a.time - b.time);
    let index = 0;
    const button = $("btn-radar");
    button.setAttribute("aria-pressed", "true");
    button.textContent = "Detener reproducción";
    state.radarTimer = setInterval(() => {
      const quake = ordered[index];
      L.circleMarker([quake.lat, quake.lon], {
        radius: Math.max(3, (quake.mag - 4) * 3.1),
        color: "#081016",
        fillColor: "#f4b740",
        fillOpacity: 0.9,
        weight: 1,
      }).addTo(state.radarLayer);
      setText("map-status", `${fmtDateTime(quake.time)} · M${quake.mag.toFixed(1)}`);
      index += 1;
      if (index >= ordered.length) stopRadar();
    }, Math.max(80, Math.floor(7000 / ordered.length)));
  }

  function renderGRChart() {
    if (!state.model) return;
    const model = state.model;
    const chart = $("gr-chart");
    const width = 760;
    const height = 360;
    const pad = { left: 70, right: 24, top: 24, bottom: 54 };
    const start = Math.ceil(model.mc_value * 2) / 2;
    const magnitudes = Array.from({ length: Math.floor((8.5 - start) * 2) + 1 }, (_, index) => start + index * 0.5);
    const values = magnitudes.map((magnitude) =>
      model.events_at_or_above_mc * Math.pow(10, -model.b_value * (magnitude - model.mc_value))
    );
    const maxLog = Math.ceil(Math.log10(Math.max(...values)));
    const minLog = Math.floor(Math.log10(Math.max(0.001, Math.min(...values))));
    const x = (magnitude) => pad.left + ((magnitude - start) / Math.max(0.5, 8.5 - start)) * (width - pad.left - pad.right);
    const y = (value) => pad.top + ((maxLog - Math.log10(Math.max(value, 0.001))) / Math.max(1, maxLog - minLog)) * (height - pad.top - pad.bottom);
    const path = magnitudes.map((magnitude, index) => `${index ? "L" : "M"}${x(magnitude).toFixed(1)},${y(values[index]).toFixed(1)}`).join(" ");
    const yTicks = Array.from({ length: maxLog - minLog + 1 }, (_, index) => minLog + index);

    chart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="gr-chart-title gr-chart-desc">
        <title id="gr-chart-title">Curva Gutenberg–Richter del modelo actual</title>
        <desc id="gr-chart-desc">Frecuencia acumulada estimada por magnitud, con b igual a ${model.b_value.toFixed(3)}.</desc>
        ${yTicks.map((tick) => {
          const py = y(Math.pow(10, tick));
          return `<line class="chart-grid" x1="${pad.left}" y1="${py}" x2="${width - pad.right}" y2="${py}" />` +
            `<text class="chart-label" x="${pad.left - 12}" y="${py + 4}" text-anchor="end">10^${tick}</text>`;
        }).join("")}
        ${magnitudes.map((magnitude) => `<text class="chart-label" x="${x(magnitude)}" y="${height - 22}" text-anchor="middle">${magnitude.toFixed(1)}</text>`).join("")}
        <line class="chart-axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" />
        <line class="chart-axis" x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" />
        <path class="chart-line" d="${path}" />
        ${magnitudes.map((magnitude, index) => `<circle class="chart-point" cx="${x(magnitude)}" cy="${y(values[index])}" r="4" />`).join("")}
        <text class="chart-axis-title" x="${width / 2}" y="${height - 3}" text-anchor="middle">Magnitud</text>
        <text class="chart-axis-title" transform="translate(16 ${height / 2}) rotate(-90)" text-anchor="middle">Eventos acumulados del ajuste</text>
      </svg>`;
    setText("gr-caption", `Modelo actual: b = ${model.b_value.toFixed(3)} ± ${model.b_value_standard_error?.toFixed(3) || "s/d"}; Mc = ${model.mc_value.toFixed(2)}.`);
  }

  function bindControls() {
    const layerPairs = [
      ["tog-activity", "activity", () => state.activityLayer?.setCells(state.layers.activity ? state.cells : [])],
      ["tog-cities", "cities", paintPlaces],
      ["tog-recent", "recent", () => paintQuakes()],
      ["tog-notable", "notable", paintNotableEvents],
      ["tog-trench", "trench", paintTrench],
    ];
    layerPairs.forEach(([id, key, render]) => {
      $(id).addEventListener("change", (event) => {
        state.layers[key] = event.target.checked;
        render();
      });
    });
    $("mag-select").addEventListener("change", (event) => {
      if (state.runId) loadForecast(state.runId, Number(event.target.value));
    });
    $("btn-radar").addEventListener("click", playRadar);
    $("btn-print").addEventListener("click", () => window.print());
    $("btn-charts").addEventListener("click", () => {
      renderGRChart();
      $("chart-modal").showModal();
    });
    $("btn-close-chart").addEventListener("click", () => $("chart-modal").close());
    $("chart-modal").addEventListener("click", (event) => {
      if (event.target === $("chart-modal")) $("chart-modal").close();
    });
    window.addEventListener("resize", () => state.map?.invalidateSize());
  }

  async function init() {
    bindControls();
    try {
      ensureMap();
    } catch (error) {
      reportProblem("Mapa", error);
    }

    const [catalogResult, modelResult, runsResult, usgsResult] = await Promise.allSettled([
      apiGet("/catalog/summary"),
      apiGet("/seismicity/model-summary"),
      apiGet("/forecasts", { limit: 1 }),
      loadUsgs(),
    ]);

    if (catalogResult.status === "fulfilled") renderCatalog(catalogResult.value);
    else reportProblem("Catálogo", catalogResult.reason);

    if (modelResult.status === "fulfilled") renderModel(modelResult.value);
    else reportProblem("Modelo", modelResult.reason);

    if (usgsResult.status === "fulfilled") renderRecent(usgsResult.value);
    else reportProblem("Sismos USGS", usgsResult.reason);

    if (runsResult.status === "fulfilled" && runsResult.value.data?.length) {
      await loadForecast(runsResult.value.data[0].id, 5);
    } else if (runsResult.status === "rejected") {
      reportProblem("Pronóstico ETAS", runsResult.reason);
      $("forecast-state").textContent = "Pronóstico no disponible";
      $("forecast-state").dataset.state = "error";
    } else {
      $("forecast-state").textContent = "Sin pronósticos publicados";
      $("forecast-state").dataset.state = "warning";
    }
  }

  init();
})();
