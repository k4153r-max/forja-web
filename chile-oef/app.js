(() => {
  "use strict";

  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.onrender.com/v1";
  const FETCH_TIMEOUT_MS = 20000;
  const COLD_START_RETRY_MS = 6000;
  const MAX_RETRIES = 5;
  const MAP_CELL_LIMIT = 5000;
  const MAULE_DATE = "2010-02-27";

  // Recorte ajustado a Chile continental para que el país llene el mapa.
  const VIEW = { minLat: -55.8, maxLat: -17.2, minLon: -76.4, maxLon: -66.0 };

  const ZONES = [
    { name: "Norte Grande", maxLat: -17.4, minLat: -26.0 },
    { name: "Norte Chico", maxLat: -26.0, minLat: -32.0 },
    { name: "Zona Central", maxLat: -32.0, minLat: -37.0 },
    { name: "Zona Sur", maxLat: -37.0, minLat: -44.0 },
    { name: "Zona Austral", maxLat: -44.0, minLat: -56.0 },
  ];

  const CITIES = [
    { name: "Arica", lat: -18.48, lon: -70.31 },
    { name: "Iquique", lat: -20.21, lon: -70.15 },
    { name: "Antofagasta", lat: -23.65, lon: -70.40 },
    { name: "La Serena", lat: -29.90, lon: -71.25 },
    { name: "Santiago", lat: -33.45, lon: -70.67 },
    { name: "Concepción", lat: -36.83, lon: -73.05 },
    { name: "Valdivia", lat: -39.81, lon: -73.25 },
    { name: "Pto. Montt", lat: -41.47, lon: -72.94 },
    { name: "Coyhaique", lat: -45.57, lon: -72.07 },
    { name: "Pta. Arenas", lat: -53.16, lon: -70.91 },
  ];

  // Contorno simplificado de Chile continental (lon, lat), sentido horario
  // desde Arica: costa del Pacífico hacia el sur y frontera andina de vuelta.
  const CHILE_MAIN = [
    [-70.32, -17.50], [-70.38, -18.48], [-70.18, -20.22], [-70.18, -21.45],
    [-70.28, -22.45], [-70.40, -23.65], [-70.48, -25.40], [-70.85, -27.35],
    [-71.32, -29.90], [-71.52, -31.63], [-71.63, -32.78], [-71.63, -33.58],
    [-71.98, -34.40], [-72.42, -35.33], [-72.70, -36.00], [-73.12, -36.83],
    [-73.40, -37.60], [-73.42, -38.73], [-73.40, -39.82], [-73.18, -40.60],
    [-72.95, -41.47], [-72.82, -42.20], [-72.85, -43.20], [-73.05, -44.60],
    [-73.40, -45.50], [-73.80, -46.60], [-74.40, -47.70], [-74.55, -48.80],
    [-74.20, -50.10], [-73.40, -51.30], [-72.30, -52.10], [-71.20, -52.70],
    [-70.93, -53.16], [-70.10, -53.00], [-69.20, -52.50], [-68.70, -52.40],
    [-68.65, -51.60], [-70.40, -50.80], [-71.80, -49.40], [-72.20, -48.20],
    [-72.10, -46.80], [-71.85, -45.57], [-71.80, -44.00], [-71.75, -42.80],
    [-71.70, -41.50], [-71.75, -40.20], [-71.70, -39.00], [-71.40, -37.80],
    [-71.00, -36.50], [-70.55, -35.20], [-70.15, -34.00], [-70.05, -33.45],
    [-70.15, -32.20], [-69.95, -30.80], [-69.80, -29.50], [-69.50, -27.80],
    [-68.80, -26.40], [-68.35, -24.80], [-68.20, -23.00], [-68.00, -21.90],
    [-68.50, -20.40], [-69.20, -18.80], [-69.48, -17.50],
  ];

  const CHILOE = [
    [-73.92, -41.78], [-73.52, -41.85], [-73.48, -42.35],
    [-73.55, -43.12], [-73.95, -43.35], [-74.25, -42.55], [-74.15, -41.95],
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

  let lastCells = [];
  let resizeTimer = 0;

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

  function intensityLabel(intensity) {
    if (intensity >= 0.75) return "La más alta";
    if (intensity >= 0.45) return "Alta";
    if (intensity >= 0.2) return "Media";
    return "Más baja";
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function heatColor(t) {
    const x = Math.max(0, Math.min(1, t));
    let r;
    let g;
    let b;
    if (x < 0.4) {
      const u = x / 0.4;
      r = lerp(28, 107, u);
      g = lerp(58, 163, u);
      b = lerp(82, 201, u);
    } else if (x < 0.75) {
      const u = (x - 0.4) / 0.35;
      r = lerp(107, 196, u);
      g = lerp(163, 137, u);
      b = lerp(201, 74, u);
    } else {
      const u = (x - 0.75) / 0.25;
      r = lerp(196, 255, u);
      g = lerp(137, 178, u);
      b = lerp(74, 107, u);
    }
    return [Math.round(r), Math.round(g), Math.round(b)];
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
    el.textContent =
      "Estamos cargando los datos. Si tarda, espera un minuto y recarga la página.";
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
      const isMaule = (event.event_time || "").slice(0, 10) === MAULE_DATE;
      if (isMaule) tr.className = "notable";
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
      const summary = await loadHeroStats();
      renderCatalog(summary);
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
      const dl = document.getElementById("model-kv");
      setKv(dl, [
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

  function project(lat, lon, w, h, pad) {
    const x =
      pad.left +
      ((lon - VIEW.minLon) / (VIEW.maxLon - VIEW.minLon)) * (w - pad.left - pad.right);
    const y =
      pad.top +
      ((VIEW.maxLat - lat) / (VIEW.maxLat - VIEW.minLat)) * (h - pad.top - pad.bottom);
    return [x, y];
  }

  function drawPolygon(ctx, ring, w, h, pad, fill, stroke) {
    if (!ring.length) return;
    ctx.beginPath();
    ring.forEach(([lon, lat], index) => {
      const [x, y] = project(lat, lon, w, h, pad);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  function sizeCanvas(canvas) {
    const wrap = canvas.parentElement;
    const cssW = Math.max(280, wrap.clientWidth);
    const cssH = Math.round(cssW * 1.72);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: cssW, h: cssH };
  }

  function drawMap(cells) {
    const canvas = document.getElementById("oef-map");
    if (!canvas) return;
    const { ctx, w, h } = sizeCanvas(canvas);
    const pad = { top: 12, right: 14, bottom: 12, left: 14 };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#081018";
    ctx.fillRect(0, 0, w, h);

    drawPolygon(ctx, CHILE_MAIN, w, h, pad, "#141c26", null);
    drawPolygon(ctx, CHILOE, w, h, pad, "#141c26", null);

    if (cells.length) {
      const logs = cells.map((cell) => Math.log10(cell.probability_at_least_one + 1e-12));
      const minLog = Math.min(...logs);
      const maxLog = Math.max(...logs);
      const span = Math.max(maxLog - minLog, 0.15);
      const [x0] = project(0, 0, w, h, pad);
      const [x1] = project(0, 0.1, w, h, pad);
      const [, y0] = project(0, 0, w, h, pad);
      const [, y1] = project(0.1, 0, w, h, pad);
      const cellW = Math.max(2.2, Math.abs(x1 - x0) * 1.35);
      const cellH = Math.max(2.2, Math.abs(y1 - y0) * 1.15);

      cells.forEach((cell, index) => {
        const t = (logs[index] - minLog) / span;
        if (t < 0.08) return;
        const [x, y] = project(cell.center_latitude, cell.center_longitude, w, h, pad);
        const [r, g, b] = heatColor(t);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.22 + t * 0.7})`;
        ctx.fillRect(x - cellW / 2, y - cellH / 2, cellW, cellH);
      });
    }

    drawPolygon(ctx, CHILE_MAIN, w, h, pad, "rgba(20,28,38,.28)", "rgba(244,241,234,.55)");
    drawPolygon(ctx, CHILOE, w, h, pad, "rgba(20,28,38,.28)", "rgba(244,241,234,.55)");

    ctx.font = "600 11px 'Source Sans 3', sans-serif";
    ctx.textBaseline = "middle";
    for (const city of CITIES) {
      const [x, y] = project(city.lat, city.lon, w, h, pad);
      ctx.beginPath();
      ctx.fillStyle = "rgba(244,241,234,.9)";
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
      const onLeft = city.lon > -70.4;
      ctx.textAlign = onLeft ? "right" : "left";
      ctx.fillStyle = "rgba(244,241,234,.82)";
      ctx.fillText(city.name, x + (onLeft ? -6 : 6), y);
    }

    if (!cells.length) {
      ctx.fillStyle = "rgba(244,241,234,.7)";
      ctx.font = "14px 'Source Sans 3', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No hay datos para esta magnitud", w / 2, h / 2);
    }
  }

  async function loadForecast(runId, magnitudeLower) {
    const detail = await apiGet(`/forecasts/${runId}`, {
      limit: MAP_CELL_LIMIT,
      magnitude_lower: magnitudeLower,
    });
    lastCells = detail.cells || [];

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
      ["Puntos pintados", fmtInt(lastCells.length)],
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

    drawMap(lastCells);

    const zoneMax = new Map();
    for (const cell of lastCells) {
      const zone = zoneForLatitude(cell.center_latitude);
      const current = zoneMax.get(zone) || 0;
      if (cell.probability_at_least_one > current) {
        zoneMax.set(zone, cell.probability_at_least_one);
      }
    }
    const ranked = ZONES.map((zone) => zone.name)
      .filter((name) => zoneMax.has(name))
      .sort((a, b) => zoneMax.get(b) - zoneMax.get(a));
    const maxZoneProb = ranked.length ? zoneMax.get(ranked[0]) : 0;

    const zoneList = document.getElementById("fc-zone-list");
    zoneList.innerHTML = "";
    if (!ranked.length) {
      const p = document.createElement("p");
      p.className = "plain-note";
      p.textContent = "No hay datos suficientes para esta magnitud.";
      zoneList.appendChild(p);
    }
    for (const name of ranked) {
      const intensity = maxZoneProb > 0 ? zoneMax.get(name) / maxZoneProb : 0;
      const row = document.createElement("div");
      row.className = "zone-row";
      const nameEl = document.createElement("span");
      nameEl.className = "zone-name";
      nameEl.textContent = name;
      const track = document.createElement("span");
      track.className = "zone-bar-track";
      const fill = document.createElement("span");
      fill.className = "zone-bar-fill";
      fill.style.width = Math.max(8, intensity * 100) + "%";
      track.appendChild(fill);
      const level = document.createElement("span");
      level.className = "zone-level";
      level.textContent = intensityLabel(intensity);
      row.appendChild(nameEl);
      row.appendChild(track);
      row.appendChild(level);
      zoneList.appendChild(row);
    }

    document.getElementById("forecast-loading").style.display = "none";
    document.getElementById("forecast-content").style.display = "block";
  }

  async function initForecast() {
    try {
      const list = await apiGet("/forecasts", { limit: 1 });
      if (!list.data.length) {
        document.getElementById("forecast-loading").textContent =
          "Todavía no hay un mapa publicado.";
        return;
      }
      const runId = list.data[0].id;
      await loadForecast(runId);
      const select = document.getElementById("mag-select");
      select.addEventListener("change", () => {
        loadForecast(select.dataset.runId, parseFloat(select.value)).catch((error) =>
          showError("forecast-error", error)
        );
      });
    } catch (error) {
      document.getElementById("forecast-loading").style.display = "none";
      showError("forecast-error", error);
    }
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawMap(lastCells), 120);
  });

  loadCatalog();
  loadModelSummary();
  initForecast();
})();
