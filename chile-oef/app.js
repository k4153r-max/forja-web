(() => {
  "use strict";

  // Updated once the FastAPI backend is deployed (see docs/PROJECT_STATE.md
  // "Deploy" section). Until then this page shows its own loading/error
  // states rather than fabricated numbers.
  const API_BASE = window.CHILE_OEF_API_BASE || "https://chile-oef-api.onrender.com/v1";
  const FETCH_TIMEOUT_MS = 15000;
  const COLD_START_RETRY_MS = 6000;
  const MAX_RETRIES = 5;

  const CHILE_BOUNDS = { minLat: -60, maxLat: -15, minLon: -82, maxLon: -62 };
  const MAULE_DATE = "2010-02-27";

  // Zonas geográficas de Chile de uso común (no una división administrativa
  // exacta), usadas solo para presentar resultados en lenguaje corriente en
  // vez de coordenadas o identificadores internos de celda.
  const ZONES = [
    { name: "Norte Grande", maxLat: -17.4, minLat: -26.0 },
    { name: "Norte Chico", maxLat: -26.0, minLat: -32.0 },
    { name: "Zona Central", maxLat: -32.0, minLat: -37.0 },
    { name: "Zona Sur", maxLat: -37.0, minLat: -44.0 },
    { name: "Zona Austral", maxLat: -44.0, minLat: -56.0 },
  ];
  const MAP_LANDMARKS = [
    { name: "Arica", lat: -18.5 },
    { name: "Antofagasta", lat: -23.6 },
    { name: "La Serena", lat: -29.9 },
    { name: "Santiago", lat: -33.4 },
    { name: "Concepción", lat: -36.8 },
    { name: "Puerto Montt", lat: -41.5 },
    { name: "Coyhaique", lat: -45.6 },
    { name: "Punta Arenas", lat: -53.2 },
  ];

  function zoneForLatitude(lat) {
    const zone = ZONES.find((z) => lat <= z.maxLat && lat > z.minLat);
    return zone ? zone.name : "Zona Austral";
  }

  function intensityLabel(intensity) {
    if (intensity >= 0.75) return "Muy alta";
    if (intensity >= 0.45) return "Alta";
    if (intensity >= 0.2) return "Media";
    return "Baja";
  }

  const fmtInt = (n) => new Intl.NumberFormat("es-CL").format(n);
  // UTC explícito: estas fechas representan un día del catálogo (00:00:00Z),
  // no un instante -- mostrarlas en huso horario local las corre un día.
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric", month: "short", day: "2-digit", timeZone: "UTC",
    });
  const fmtDateTime = (iso) =>
    new Date(iso).toLocaleString("es-CL", {
      year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });

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
        // Render's free tier sleeps after inactivity; a cold start can take
        // 30-50s. Retry with a fixed backoff rather than failing on the
        // first attempt.
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
      "No se pudo cargar (" + (error?.message || "error desconocido") + "). " +
      "El backend puede estar despertando (plan gratuito) — reintentá en un minuto.";
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
        document.getElementById("s-mc").textContent = "M" + model.mc_value.toFixed(1) + "+";
      }
      return summary;
    } catch (error) {
      document.getElementById("s-total").textContent = "s/d";
      document.getElementById("s-range").textContent = "s/d";
      document.getElementById("s-mc").textContent = "s/d";
      throw error;
    }
  }

  function renderCatalog(summary) {
    const maxCount = Math.max(...summary.magnitude_type_counts.map((r) => r.count));
    const bars = document.getElementById("mag-type-bars");
    bars.innerHTML = "";
    for (const row of summary.magnitude_type_counts.slice(0, 8)) {
      const wrap = document.createElement("div");
      wrap.className = "magbar-row";
      const type = document.createElement("span");
      type.className = "type";
      type.textContent = row.magnitude_type || "(s/tipo)";
      const track = document.createElement("span");
      track.className = "track";
      const fill = document.createElement("span");
      fill.className = "fill";
      fill.style.width = (100 * row.count) / maxCount + "%";
      track.appendChild(fill);
      const count = document.createElement("span");
      count.className = "count";
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
      dateTd.textContent = fmtDate(event.event_time) + (isMaule ? " · 27F" : "");
      const magTd = document.createElement("td");
      magTd.textContent = event.magnitude.toFixed(1) + " " + (event.magnitude_type || "");
      const placeTd = document.createElement("td");
      placeTd.textContent = event.place || "—";
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
        `El modelo actual fue entrenado con ${fmtInt(model.completeness_event_count)} ` +
        `sismos reales registrados entre ${fmtDate(model.completeness_window_start)} y ` +
        `${fmtDate(model.completeness_window_end)} — un período que incluye el terremoto ` +
        `del Maule de 2010 (27F). Solo detecta de forma confiable sismos de magnitud ` +
        `${model.mc_value.toFixed(1)} o mayor.`;
      const dl = document.getElementById("model-kv");
      setKv(dl, [
        ["Mc (completitud)", model.mc_value.toFixed(2) + " " + model.magnitude_type],
        ["Ventana Mc", fmtDate(model.completeness_window_start) + " – " + fmtDate(model.completeness_window_end)],
        ["Eventos en ventana", fmtInt(model.completeness_event_count)],
        ["b-value (Gutenberg-Richter)", model.b_value.toFixed(3) + " ± " + (model.b_value_standard_error?.toFixed(3) ?? "—")],
        ["Eventos ≥ Mc", fmtInt(model.events_at_or_above_mc)],
        ["μ (fondo, ETAS)", model.mu_per_day.toExponential(3) + " /día"],
        ["k0 (productividad)", model.k0.toExponential(3)],
        ["α (escala con magnitud)", model.alpha.toFixed(3)],
        ["c (offset Omori)", (model.c_days * 24).toFixed(2) + " h"],
        ["p (decaimiento Omori)", model.p_exponent.toFixed(3)],
        ["d0 (escala espacial)", model.d0_km.toFixed(1) + " km"],
        ["q (decaimiento espacial)", model.q_exponent.toFixed(3)],
        ["Convergencia", model.converged ? "sí" : "no"],
      ]);
      document.getElementById("model-loading").style.display = "none";
      document.getElementById("model-content").style.display = "block";
    } catch (error) {
      document.getElementById("model-loading").textContent =
        "No se pudo cargar el modelo (" + (error?.message || "error") + ").";
    }
  }

  function drawMap(cells) {
    const canvas = document.getElementById("oef-map");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const leftMargin = 92;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#101820";
    ctx.fillRect(0, 0, w, h);

    const toXY = (lat, lon) => {
      const x =
        leftMargin +
        ((lon - CHILE_BOUNDS.minLon) / (CHILE_BOUNDS.maxLon - CHILE_BOUNDS.minLon)) * (w - leftMargin - 10);
      const y = ((CHILE_BOUNDS.maxLat - lat) / (CHILE_BOUNDS.maxLat - CHILE_BOUNDS.minLat)) * h;
      return [x, y];
    };

    // Ciudades de referencia, para que el mapa se pueda leer sin necesitar
    // coordenadas -- el punto no es la geografía exacta, es la orientación.
    ctx.strokeStyle = "rgba(244,241,234,.10)";
    ctx.fillStyle = "rgba(244,241,234,.55)";
    ctx.font = "11px 'Source Sans 3', sans-serif";
    ctx.textBaseline = "middle";
    for (const place of MAP_LANDMARKS) {
      const [, y] = toXY(place.lat, CHILE_BOUNDS.minLon);
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
      ctx.fillText(place.name, 4, y);
    }

    if (!cells.length) {
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.font = "13px sans-serif";
      ctx.fillText("No hay datos suficientes para esta magnitud", leftMargin + 10, h / 2);
      return;
    }

    const maxProb = Math.max(...cells.map((c) => c.probability_at_least_one));
    for (const cell of cells) {
      const [x, y] = toXY(cell.center_latitude, cell.center_longitude);
      const intensity = maxProb > 0 ? cell.probability_at_least_one / maxProb : 0;
      const radius = 2.5 + intensity * 9;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,137,74,${0.3 + intensity * 0.6})`;
      ctx.fill();
    }
  }

  const HORIZON_LABELS = { PT6H: "las próximas 6 horas", P1D: "el próximo día", P3D: "los próximos 3 días", P7D: "los próximos 7 días" };

  async function loadForecast(runId, magnitudeLower) {
    const detail = await apiGet(`/forecasts/${runId}`, { limit: 300, magnitude_lower: magnitudeLower });

    const magLabel = detail.selected_magnitude_lower + (
      detail.magnitude_bins.find((b) => b.lower === detail.selected_magnitude_lower)?.upper
        ? ` a ${detail.magnitude_bins.find((b) => b.lower === detail.selected_magnitude_lower).upper}`
        : " o más"
    );
    document.getElementById("fc-summary").innerHTML =
      `Sismos de magnitud <strong>${magLabel}</strong>, para ` +
      `${HORIZON_LABELS[detail.horizon_id] || detail.horizon_id}. ` +
      `Calculado el ${fmtDate(detail.issued_at)}.`;

    const dl = document.getElementById("fc-kv");
    setKv(dl, [
      ["Emitido", fmtDateTime(detail.issued_at)],
      ["Válido desde", fmtDateTime(detail.validity_start)],
      ["Válido hasta", fmtDateTime(detail.validity_end)],
      ["Mc de referencia", detail.reference_magnitude.toFixed(2)],
      ["b-value usado", detail.b_value_used.toFixed(3)],
      ["Celdas totales (grilla)", fmtInt(detail.cell_count_total)],
      ["Bin mostrado", detail.selected_magnitude_lower.toFixed(1) + "+"],
    ]);

    const select = document.getElementById("mag-select");
    if (select.dataset.populated !== detail.id) {
      select.innerHTML = "";
      for (const bin of detail.magnitude_bins) {
        const opt = document.createElement("option");
        opt.value = bin.lower;
        opt.textContent = bin.upper
          ? `Magnitud ${bin.lower} a ${bin.upper}`
          : `Magnitud ${bin.lower} o más`;
        if (bin.lower < detail.reference_magnitude) {
          opt.disabled = true;
          opt.textContent += " (no detectable de forma confiable)";
        }
        select.appendChild(opt);
      }
      select.dataset.populated = detail.id;
      select.dataset.runId = runId;
    }
    select.value = String(detail.selected_magnitude_lower);

    drawMap(detail.cells);

    // Agrupar celdas en zonas en lenguaje corriente en vez de mostrar
    // identificadores internos de celda (ej. "r0364 c0133"), que no le dicen
    // nada a alguien que no conoce la grilla interna del modelo.
    const zoneMax = new Map();
    for (const cell of detail.cells) {
      const zone = zoneForLatitude(cell.center_latitude);
      const current = zoneMax.get(zone) || 0;
      if (cell.probability_at_least_one > current) zoneMax.set(zone, cell.probability_at_least_one);
    }
    const ranked = ZONES.map((z) => z.name)
      .filter((name) => zoneMax.has(name))
      .sort((a, b) => zoneMax.get(b) - zoneMax.get(a));
    const maxZoneProb = ranked.length ? zoneMax.get(ranked[0]) : 0;

    const zoneList = document.getElementById("fc-zone-list");
    zoneList.innerHTML = "";
    if (!ranked.length) {
      const p = document.createElement("p");
      p.className = "plain-note";
      p.style.marginTop = "0";
      p.textContent = "No hay datos suficientes para esta magnitud en ninguna zona.";
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
      fill.style.width = Math.max(6, intensity * 100) + "%";
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
          "Todavía no se ha emitido ningún pronóstico.";
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

  loadCatalog();
  loadModelSummary();
  initForecast();
})();
