// ==========================================
// YIELDFY INTERACTIVE SCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initCopyCAToast();
  initModals();
  initVaultAppSimulation();
  initSmoothScroll();
});

/* ------------------------------------------
   1. Interactive 3D Mesh Particle Canvas
   ------------------------------------------ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
    createSphereParticles();
  }

  window.addEventListener('resize', resize);

  // Generate a 3D sphere particle structure
  function createSphereParticles() {
    particles = [];
    const count = 160;
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      particles.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        baseX: radius * Math.cos(theta) * Math.sin(phi),
        baseY: radius * Math.sin(theta) * Math.sin(phi),
        baseZ: radius * Math.cos(phi),
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#62C4A2' : '#A2D5C6'
      });
    }
  }

  // Mouse interaction
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = (e.clientX - rect.left - width / 2) * 0.001;
    mouse.targetY = (e.clientY - rect.top - height / 2) * 0.001;
  });

  let angleY = 0;
  let angleX = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    angleY += 0.004 + mouse.x * 0.02;
    angleX = mouse.y * 0.5;

    const centerX = width * 0.65;
    const centerY = height * 0.45;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    let projectedPoints = [];

    // Rotate and project points
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      // Rotate Y
      let x1 = p.baseX * cosY - p.baseZ * sinY;
      let z1 = p.baseZ * cosY + p.baseX * sinY;

      // Rotate X
      let y1 = p.baseY * cosX - z1 * sinX;
      let z2 = z1 * cosX + p.baseY * sinX;

      // Perspective projection
      let fov = 400;
      let scale = fov / (fov + z2);
      let projX = x1 * scale + centerX;
      let projY = y1 * scale + centerY;

      projectedPoints.push({ x: projX, y: projY, z: z2, scale, color: p.color, size: p.size });
    }

    // Sort by depth
    projectedPoints.sort((a, b) => b.z - a.z);

    // Draw connecting mesh lines
    ctx.lineWidth = 0.6;
    for (let i = 0; i < projectedPoints.length; i++) {
      for (let j = i + 1; j < projectedPoints.length; j++) {
        let p1 = projectedPoints[i];
        let p2 = projectedPoints[j];
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 65) {
          let alpha = (1 - dist / 65) * 0.25 * ((p1.z + 200) / 400);
          if (alpha > 0) {
            ctx.strokeStyle = `rgba(98, 196, 162, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw particle points
    for (let i = 0; i < projectedPoints.length; i++) {
      let p = projectedPoints[i];
      let alpha = Math.max(0.1, (p.z + 200) / 400);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect on front points
      if (p.z > 80 && Math.random() > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.size + 1) * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(render);
  }

  resize();
  render();
}

/* ------------------------------------------
   2. Copy CA Toast Notification
   ------------------------------------------ */
function initCopyCAToast() {
  const copyBtn = document.getElementById('copy-ca-btn');
  const toast = document.getElementById('toast');

  if (!copyBtn || !toast) return;

  copyBtn.addEventListener('click', () => {
    const dummyCA = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";
    navigator.clipboard.writeText(dummyCA).then(() => {
      showToast();
    }).catch(() => {
      showToast();
    });
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ------------------------------------------
   3. Modal Controllers
   ------------------------------------------ */
function initModals() {
  const appModal = document.getElementById('app-modal');
  const docsModal = document.getElementById('docs-modal');

  const openAppBtns = document.querySelectorAll('.open-app-modal');
  const closeAppBtn = document.getElementById('close-app-modal');

  const openDocsBtns = [document.getElementById('open-docs-btn'), document.getElementById('hero-docs-btn')].filter(Boolean);
  const openSpecBtn = document.getElementById('open-spec-btn');
  const closeDocsBtn = document.getElementById('close-docs-modal');

  openAppBtns.forEach(btn => {
    btn.addEventListener('click', () => appModal.classList.add('open'));
  });

  if (closeAppBtn) {
    closeAppBtn.addEventListener('click', () => appModal.classList.remove('open'));
  }

  openDocsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      docsModal.classList.add('open');
    });
  });

  if (openSpecBtn) {
    openSpecBtn.addEventListener('click', () => docsModal.classList.add('open'));
  }

  if (closeDocsBtn) {
    closeDocsBtn.addEventListener('click', () => docsModal.classList.remove('open'));
  }

  // Close when clicking outside content
  [appModal, docsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  });
}

/* ------------------------------------------
   4. Vault Interactive Calculator & App Demo
   ------------------------------------------ */
function initVaultAppSimulation() {
  const assetBtns = document.querySelectorAll('.asset-btn');
  const selectedSymbol = document.getElementById('selected-symbol');
  const routeVenue = document.getElementById('route-venue');
  const estReturn = document.getElementById('est-return');
  const depositInput = document.getElementById('deposit-amount');
  const maxBtn = document.getElementById('max-deposit-btn');
  const submitBtn = document.getElementById('deposit-submit-btn');

  if (!assetBtns.length) return;

  let currentAPY = 0.078;
  let currentSymbol = 'AAPL';

  assetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      assetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentSymbol = btn.dataset.asset;
      const apyStr = btn.dataset.apy;
      currentAPY = parseFloat(apyStr) / 100;
      const venue = btn.dataset.venue;

      if (selectedSymbol) selectedSymbol.textContent = currentSymbol;
      if (routeVenue) routeVenue.textContent = `${venue} (Score: ${(85 + Math.random() * 10).toFixed(1)})`;

      updateReturnEstimate();
    });
  });

  if (depositInput) {
    depositInput.addEventListener('input', updateReturnEstimate);
  }

  if (maxBtn && depositInput) {
    maxBtn.addEventListener('click', () => {
      depositInput.value = '12.50';
      updateReturnEstimate();
    });
  }

  function updateReturnEstimate() {
    if (!depositInput || !estReturn) return;
    const val = parseFloat(depositInput.value) || 0;
    const returnVal = (val * currentAPY).toFixed(3);
    const usdEquiv = (val * currentAPY * 240).toFixed(2);
    estReturn.textContent = `+${returnVal} ${currentSymbol} (~$${usdEquiv})`;
  }

  if (submitBtn) {
    let connected = false;
    submitBtn.addEventListener('click', () => {
      if (!connected) {
        submitBtn.textContent = 'Depositing...';
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
          connected = true;
          submitBtn.style.opacity = '1';
          submitBtn.textContent = 'Vault Shares Issued (0.9984 yf' + currentSymbol + ')';
          submitBtn.style.background = '#62C4A2';
          submitBtn.style.color = '#080A0D';
        }, 1200);
      } else {
        alert(`Successfully deposited into Yieldfy ${currentSymbol} ERC-4626 Vault!`);
      }
    });
  }
}

/* ------------------------------------------
   5. Smooth Scroll
   ------------------------------------------ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.startsWith('#open-')) return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
