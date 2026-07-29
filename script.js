// ── Mobile nav toggle ─────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

// ── Scroll-reveal ──────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ── Active nav-link highlighting ──────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

// ── Hero knowledge-graph canvas ───────────────────────────────
// Signature element: nodes = knowledge assets, edges = the
// connections an AI system draws between them. Lines pulse with
// traveling light to suggest retrieval/synthesis happening live.
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, edges;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width * devicePixelRatio;
    h = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    buildGraph();
  }

  function buildGraph() {
    const count = w < 900 ? 13 : 20;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      r: (Math.random() * 2 + 1.4) * devicePixelRatio,
    }));
    edges = [];
    nodes.forEach((n, i) => {
      nodes.forEach((m, j) => {
        if (j <= i) return;
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 260 * devicePixelRatio) edges.push({ a: i, b: j, offset: Math.random() });
      });
    });
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    edges.forEach(e => {
      const a = nodes[e.a], b = nodes[e.b];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const maxD = 260 * devicePixelRatio;
      if (d > maxD) return;
      const alpha = (1 - d / maxD) * 0.35;
      ctx.strokeStyle = `rgba(73,232,210,${alpha})`;
      ctx.lineWidth = devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      if (!reduceMotion) {
        e.offset = (e.offset + 0.0028) % 1;
        const px = a.x + (b.x - a.x) * e.offset;
        const py = a.y + (b.y - a.y) * e.offset;
        ctx.fillStyle = `rgba(139,123,240,${Math.min(alpha * 2.4, 0.9)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(238,241,248,0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();
