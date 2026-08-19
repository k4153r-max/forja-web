/**
 * ETEMEN — Interactive Cyber Matrix & Web Showcase Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initCyberCanvas();
  initProjectFilters();
  initEstimatorCalculator();
});

/* ==========================================================================
   1. Dynamic Cyber Canvas Particle & Grid Engine
   ========================================================================== */
function initCyberCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 22), 65);

  const mouse = { x: width / 2, y: height / 2 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.8 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(157, 78, 221, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
    ctx.lineWidth = 1;
    const gridSize = 60;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Connect particles near mouse and near each other
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 130) * 0.22;
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.stroke();
        }
      }

      // Connect to mouse
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 160) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        const malpha = (1 - mdist / 160) * 0.35;
        ctx.strokeStyle = `rgba(157, 78, 221, ${malpha})`;
        ctx.stroke();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. Project Showcase Filter Controller
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.cyber-filter-btn');
  const projectCards = document.querySelectorAll('.cyber-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. Terminal Project Estimator & WhatsApp Brief Generator
   ========================================================================== */
function initEstimatorCalculator() {
  const typeInputs = document.querySelectorAll('input[name="project_type"]');
  const featureInputs = document.querySelectorAll('input[name="features"]');
  const speedInputs = document.querySelectorAll('input[name="timeline"]');

  const priceElem = document.getElementById('est-price-val');
  const timeElem = document.getElementById('est-time-val');
  const summaryElem = document.getElementById('est-summary-items');
  const submitBtn = document.getElementById('est-submit-btn');

  if (!priceElem || !submitBtn) return;

  function calculate() {
    let basePrice = 280000; // CLP base
    let days = 5;
    let selectedTypeLabel = 'Sitio Web Corporativo';
    let selectedFeatures = [];

    // Type check
    typeInputs.forEach(inp => {
      if (inp.checked) {
        basePrice = parseInt(inp.dataset.price || basePrice);
        days = parseInt(inp.dataset.days || days);
        selectedTypeLabel = inp.dataset.label || selectedTypeLabel;
      }
    });

    // Features check
    featureInputs.forEach(inp => {
      if (inp.checked) {
        basePrice += parseInt(inp.dataset.price || 0);
        days += parseInt(inp.dataset.days || 0);
        selectedFeatures.push(inp.dataset.label);
      }
    });

    // Speed / Timeline multiplier
    speedInputs.forEach(inp => {
      if (inp.checked) {
        const mult = parseFloat(inp.dataset.multiplier || 1.0);
        basePrice = Math.round(basePrice * mult);
        if (mult > 1.0) days = Math.max(3, Math.round(days * 0.6));
      }
    });

    // Format CLP currency
    const formattedPrice = '$' + basePrice.toLocaleString('es-CL');

    priceElem.textContent = formattedPrice;
    timeElem.textContent = `${days}–${days + 3} Días Hábiles`;

    // Update summary list
    let html = `<li><span>Tipo de Proyecto:</span> <span>${selectedTypeLabel}</span></li>`;
    if (selectedFeatures.length) {
      html += `<li><span>Módulos:</span> <span>${selectedFeatures.length} Seleccionados</span></li>`;
    }
    html += `<li><span>Optimizaciones:</span> <span>SEO + 100/100 Speed</span></li>`;
    summaryElem.innerHTML = html;

    // Update WhatsApp Link
    const msg = `Hola ETEMEN! Me interesa cotizar un proyecto web a medida con las siguientes especificaciones:
- *Tipo:* ${selectedTypeLabel}
- *Módulos:* ${selectedFeatures.join(', ') || 'Ninguno adicional'}
- *Estimado:* ${formattedPrice} (${days} días)
Por favor contáctenme para revisar detalles.`;

    const encodedMsg = encodeURIComponent(msg);
    submitBtn.href = `https://wa.me/56994782026?text=${encodedMsg}`;
  }

  typeInputs.forEach(i => i.addEventListener('change', calculate));
  featureInputs.forEach(i => i.addEventListener('change', calculate));
  speedInputs.forEach(i => i.addEventListener('change', calculate));

  calculate();
}
