/* ============================================================
   CERTIFICATES — v6 · DOSSIER MOTION
   Paper-precision: redaction-bar hero reveal · stamped features ·
   filed tile staggers · paper tilt with sheen · typewriter labels.
   Hand-rolled, no libraries.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  document.documentElement.classList.add('has-dossier');

  /* ---------- Archive tiles: filed in one by one ---------- */

  const grid = document.querySelector('.cert-grid');
  if (grid) {
    Array.from(grid.children).forEach((tile, i) => tile.style.setProperty('--i', i));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      io.observe(grid);
    } else {
      grid.classList.add('is-in');
    }
  }

  /* ---------- Section labels: typed like a filing card ---------- */

  document.querySelectorAll('.sec-head__label').forEach((label) => {
    const text = label.textContent;
    label.textContent = ' ';
    if (!('IntersectionObserver' in window)) {
      label.textContent = text;
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      let n = 0;
      const tick = () => {
        n++;
        label.textContent = text.slice(0, n) + (n < text.length ? '▌' : '');
        if (n < text.length) setTimeout(tick, 26);
      };
      tick();
    }, { threshold: 0.5 });
    io.observe(label);
  });

  /* ---------- "08 certificates" counts itself in ---------- */

  const aside = document.querySelector('#all .sec-head__aside');
  if (aside && 'IntersectionObserver' in window) {
    const match = aside.textContent.match(/^(\d+)([\s\S]*)$/);
    if (match) {
      const target = parseInt(match[1], 10);
      const pad = match[1].length;
      const suffix = match[2];
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const DURATION = 900;
        const step = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          aside.textContent = String(Math.round(eased * target)).padStart(pad, '0') + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.5 });
      io.observe(aside);
    }
  }

  /* ---------- Paper tilt + sheen (desktop) ---------- */

  if (finePointer) {
    document.querySelectorAll('.cert-feature__media, .cert-tile figure').forEach((el) => {
      el.classList.add('tilt');
      const host = el.closest('button') || el;
      host.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
      host.addEventListener('mouseleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
