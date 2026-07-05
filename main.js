/* ============================================================
   MOSAM BISWAS — PORTFOLIO v5
   Preloader · reveals · cursor · work preview · parallax ·
   clock · menu · copy email · certificate modal
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Preloader ---------- */

  const preloader = document.getElementById('preloader');
  const preloaderCount = document.getElementById('preloaderCount');

  const finishLoading = () => {
    document.body.classList.add('is-loaded');
  };

  if (!preloader || prefersReduced) {
    finishLoading();
  } else {
    const DURATION = 1000;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (preloaderCount) {
        preloaderCount.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      }
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(finishLoading, 150);
      }
    };

    requestAnimationFrame(tick);
  }

  /* ---------- Fit display lines edge-to-edge ---------- */

  const fitLines = () => {
    document.querySelectorAll('.hero__line').forEach((line) => {
      const word = line.querySelector('.hero__word');
      if (!word) return;
      line.style.fontSize = '100px';
      const width = word.getBoundingClientRect().width;
      if (width > 0) {
        line.style.fontSize = `${(100 * line.clientWidth / width).toFixed(2)}px`;
      } else {
        line.style.fontSize = '';
      }
    });
  };

  fitLines();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitLines);
  }

  let fitResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(fitResizeTimer);
    fitResizeTimer = setTimeout(fitLines, 120);
  });

  /* ---------- Scroll reveals ---------- */

  const revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Custom cursor ---------- */

  const cursor = document.getElementById('cursor');

  if (cursor && finePointer && !prefersReduced) {
    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let cursorRafActive = false;

    const renderCursor = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorRafActive) {
        cursorRafActive = true;
        x = targetX;
        y = targetY;
        cursor.classList.add('is-visible');
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest('a, button, [data-cursor]');
      cursor.classList.toggle('is-link', Boolean(interactive));
    });

    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
  }

  /* ---------- Local time (IST) ---------- */

  const clocks = document.querySelectorAll('[data-clock]');

  if (clocks.length) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const updateClocks = () => {
      const now = formatter.format(new Date());
      clocks.forEach((el) => { el.textContent = now; });
    };

    updateClocks();
    setInterval(updateClocks, 1000);
  }

  /* ---------- Fullscreen menu ---------- */

  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');

  if (menuBtn && menuOverlay) {
    const menuLabel = menuBtn.querySelector('[data-menu-label]');

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuOverlay.setAttribute('aria-hidden', String(!open));
      if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
    };

    menuBtn.addEventListener('click', () => {
      setMenu(!document.body.classList.contains('menu-open'));
    });

    menuOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    });
  }

  /* ---------- Work list: cursor-following preview ---------- */

  const workList = document.getElementById('workList');
  const workPreview = document.getElementById('workPreview');
  const workPreviewStrip = document.getElementById('workPreviewStrip');

  if (workList && workPreview && workPreviewStrip && finePointer && !prefersReduced) {
    let previewX = 0;
    let previewY = 0;
    let previewTargetX = 0;
    let previewTargetY = 0;
    let previewRaf = null;

    const renderPreview = () => {
      previewX += (previewTargetX - previewX) * 0.12;
      previewY += (previewTargetY - previewY) * 0.12;
      workPreview.style.left = `${previewX}px`;
      workPreview.style.top = `${previewY}px`;
      previewRaf = requestAnimationFrame(renderPreview);
    };

    workList.addEventListener('mousemove', (e) => {
      previewTargetX = Math.min(e.clientX + 28, window.innerWidth - workPreview.offsetWidth - 16);
      previewTargetY = e.clientY - workPreview.offsetHeight / 2;
    }, { passive: true });

    workList.addEventListener('mouseenter', (e) => {
      previewX = previewTargetX = e.clientX + 28;
      previewY = previewTargetY = e.clientY - workPreview.offsetHeight / 2;
      if (!previewRaf) previewRaf = requestAnimationFrame(renderPreview);
    });

    workList.addEventListener('mouseleave', () => {
      workPreview.classList.remove('is-active');
      if (previewRaf) {
        cancelAnimationFrame(previewRaf);
        previewRaf = null;
      }
    });

    workList.querySelectorAll('.work-row').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        const index = Number(row.dataset.preview || 0);
        workPreviewStrip.style.transform = `translateY(${index * -100}%)`;
        workPreview.classList.add('is-active');
      });
    });
  }

  /* ---------- Parallax images ---------- */

  const parallaxImages = Array.from(document.querySelectorAll('[data-parallax]'));

  if (parallaxImages.length && !prefersReduced) {
    let parallaxScheduled = false;

    const renderParallax = () => {
      parallaxScheduled = false;
      const viewportCenter = window.innerHeight / 2;

      parallaxImages.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

        const speed = parseFloat(img.dataset.parallax) || 0.1;
        const offset = (rect.top + rect.height / 2 - viewportCenter) * -speed;
        img.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.12)`;
      });
    };

    const requestParallax = () => {
      if (!parallaxScheduled) {
        parallaxScheduled = true;
        requestAnimationFrame(renderParallax);
      }
    };

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    requestParallax();
  }

  /* ---------- Copy email ---------- */

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    const originalText = label ? label.textContent : '';

    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      if (!text) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const temp = document.createElement('textarea');
          temp.value = text;
          temp.setAttribute('readonly', '');
          temp.style.position = 'absolute';
          temp.style.left = '-9999px';
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }

        if (label) {
          label.textContent = 'Copied ✓';
          setTimeout(() => { label.textContent = originalText; }, 1400);
        }
      } catch {
        /* clipboard unavailable — mailto link still works */
      }
    });
  });

  /* ---------- Certificate modal ---------- */

  const certModal = document.getElementById('certModal');
  const certModalImg = document.getElementById('certModalImg');
  const certModalClose = document.getElementById('certModalClose');

  if (certModal && certModalImg) {
    const openModal = (src) => {
      certModalImg.src = src;
      certModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      certModal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-cert-open]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-cert-open')));
    });

    if (certModalClose) certModalClose.addEventListener('click', closeModal);

    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ---------- Console signature ---------- */

  console.log(
    '%cMosam Biswas%c — thanks for peeking under the hood.\nmosambiswas999@gmail.com',
    'font-size:16px; font-weight:bold;',
    'font-size:12px; opacity:0.7;'
  );
})();
