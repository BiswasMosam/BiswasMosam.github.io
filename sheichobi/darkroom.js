/* ============================================================
   SHEICHOBI — v6 · DARKROOM MOTION
   Light and optics: prints develop as they enter the bath ·
   focus-pull hover over the contact sheet · aperture lightbox
   opening from the frame you clicked · shutter blink between
   photos · grain that breathes with scroll speed.
   Hand-rolled, no libraries.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.documentElement.classList.add('has-darkroom');

  /* ---------- Collections: contact-sheet strips slide in ---------- */

  const collectionList = document.getElementById('collectionList');
  if (collectionList) {
    const indexRows = () => {
      Array.from(collectionList.children).forEach((li, i) => li.style.setProperty('--i', i));
    };
    indexRows();
    /* rows are rendered async from photos.json */
    new MutationObserver(indexRows).observe(collectionList, { childList: true });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      io.observe(collectionList);
    } else {
      collectionList.classList.add('is-in');
    }
  }

  /* ---------- Archive: every print develops in the bath ---------- */

  const grid = document.getElementById('galleryGrid');
  if (grid) {
    let devIO = null;
    if ('IntersectionObserver' in window) {
      devIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-dev');
          devIO.unobserve(entry.target);
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    }

    let batch = 0;
    const watch = (card) => {
      if (!card.classList || !card.classList.contains('photo-card')) return;
      card.style.setProperty('--d', `${(batch++ % 5) * 90}ms`);
      if (devIO) devIO.observe(card);
      else card.classList.add('is-dev');
    };

    Array.from(grid.children).forEach(watch);
    /* the grid is rebuilt on every filter / load-more */
    new MutationObserver((mutations) => {
      batch = 0;
      mutations.forEach((m) => m.addedNodes.forEach(watch));
    }).observe(grid, { childList: true });
  }

  /* ---------- Lightbox: aperture opens from the clicked frame ---------- */

  const lightbox = document.getElementById('photoModal');
  const lightboxImg = document.getElementById('modalImg');

  if (lightbox) {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.photo-card');
      if (!card) return;
      lightbox.style.setProperty('--cx', `${e.clientX}px`);
      lightbox.style.setProperty('--cy', `${e.clientY}px`);
    }, true);
  }

  /* Shutter blink whenever the photograph changes */
  if (lightboxImg && 'MutationObserver' in window) {
    new MutationObserver(() => {
      lightboxImg.classList.remove('is-blink');
      void lightboxImg.offsetWidth; /* restart the animation */
      lightboxImg.classList.add('is-blink');
    }).observe(lightboxImg, { attributes: true, attributeFilter: ['src'] });
  }

  /* ---------- Scroll: motion blur on the sheet, grain breathes ---------- */

  const noise = document.querySelector('.noise');
  let lastY = window.scrollY;
  let velocity = 0;
  let lastBlur = 0;

  const loop = () => {
    const y = window.scrollY;
    const raw = y - lastY;
    lastY = y;
    velocity += (raw - velocity) * 0.12;

    const speed = Math.abs(velocity);
    const blur = Math.min(speed * 0.045, 2.6);
    if (grid && Math.abs(blur - lastBlur) > 0.08) {
      grid.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : '';
      lastBlur = blur;
    }
    if (noise) {
      noise.style.opacity = (0.045 + Math.min(speed * 0.0011, 0.05)).toFixed(3);
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
})();
