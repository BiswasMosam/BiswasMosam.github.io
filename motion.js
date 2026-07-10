/* ============================================================
   MOSAM BISWAS — PORTFOLIO v6 · MOTION
   The forge: inertial scroll · velocity shear · letter cascades ·
   word staggers · live marquee · magnetic buttons · counters
   Hand-rolled, no libraries.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const docEl = document.documentElement;
  docEl.classList.add('has-motion');

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /* ---------- Split display lines into letters (hero + contact) ---------- */

  const splitLetters = (container) => {
    if (!container) return;
    let i = 0;
    container.querySelectorAll('.hero__line').forEach((line) => {
      const word = line.querySelector('.hero__word');
      if (!word) return;
      const text = word.textContent;
      word.textContent = '';
      for (const ch of text) {
        const span = document.createElement('span');
        span.className = 'hero__ltr';
        span.style.setProperty('--i', i++);
        span.textContent = ch;
        word.appendChild(span);
      }
      line.classList.add('is-split');
    });
  };

  splitLetters(document.querySelector('.hero__name'));
  splitLetters(document.querySelector('.contact__title'));

  /* the split changes rendered width — refit the display lines now */
  if (typeof window.__refitHero === 'function') window.__refitHero();

  /* ---------- Split section titles into words ---------- */

  const splitWords = (root) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const w = document.createElement('span');
            w.className = 'w';
            w.style.setProperty('--i', i++);
            w.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(root);
    root.classList.add('is-split');
  };

  document.querySelectorAll('.sec-head__title').forEach(splitWords);

  /* ---------- Staggered entrances: work rows + photo strip ---------- */

  const workList = document.getElementById('workList');
  if (workList) {
    workList.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      io.observe(workList);
    } else {
      workList.classList.add('is-in');
    }
  }

  document.querySelectorAll('.photo__strip figure').forEach((fig, i) => {
    fig.style.setProperty('--i', i);
  });

  /* ---------- Stat counters ---------- */

  document.querySelectorAll('.about__stat-num').forEach((el) => {
    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const finalText = node.textContent;
    const target = parseInt(finalText, 10);
    if (Number.isNaN(target)) return;
    const pad = finalText.length;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const DURATION = 1200;
      const step = (now) => {
        const progress = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(eased * target)).padStart(pad, '0');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- Magnetic buttons ---------- */

  if (finePointer) {
    document.querySelectorAll('.btn, .menu-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${(dx * 0.26).toFixed(1)}px, ${(dy * 0.34).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Inertial wheel scroll (desktop) ---------- */

  let scrollTarget = window.scrollY;
  let scrollCurrent = window.scrollY;
  let lastWritten = window.scrollY;
  let maxScroll = 0;

  const refreshMaxScroll = () => {
    maxScroll = Math.max(docEl.scrollHeight - window.innerHeight, 0);
  };
  refreshMaxScroll();

  const scrollLocked = () =>
    document.body.classList.contains('menu-open') ||
    document.body.style.overflow === 'hidden';

  if (finePointer) {
    docEl.classList.add('smooth');

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || scrollLocked()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      scrollTarget = clamp(scrollTarget + delta, 0, maxScroll);
    }, { passive: false });

    /* Anchor links glide on the same easing instead of jumping */
    document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        refreshMaxScroll();
        scrollTarget = clamp(el.getBoundingClientRect().top + window.scrollY, 0, maxScroll);
        history.pushState(null, '', `#${id}`);
      });
    });
  }

  /* ---------- Velocity-driven layer: shear, marquee, header, progress ---------- */

  const skewTargets = [
    document.querySelector('.hero__name'),
    ...document.querySelectorAll('#projects .sec-head, #about .sec-head'),
    document.querySelector('.work-list'),
    document.getElementById('research'),
    document.getElementById('photography'),
    document.querySelector('.contact__hero')
  ].filter(Boolean);

  const heroLines = document.querySelectorAll('.hero__name .hero__line');
  const heroScrollHint = document.querySelector('.hero__scroll');
  const siteHead = document.getElementById('siteHead');
  const progressBar = document.getElementById('progressBar');
  const marquee = document.querySelector('.marquee');
  const marqueeTrack = document.querySelector('.marquee__track');

  let marqueeHalf = 0;
  let marqueeX = 0;
  if (marquee && marqueeTrack && marqueeTrack.children.length) {
    marquee.classList.add('is-js');
    marqueeHalf = marqueeTrack.children[0].offsetWidth;
  }

  window.addEventListener('resize', () => {
    refreshMaxScroll();
    if (marqueeTrack && marqueeTrack.children.length) {
      marqueeHalf = marqueeTrack.children[0].offsetWidth;
    }
  });

  let lastY = window.scrollY;
  let velocity = 0;
  let lastTime = performance.now();
  let frame = 0;
  let skewed = false;

  const loop = (now) => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    frame++;

    if (frame % 30 === 0) refreshMaxScroll();

    /* Inertial scroll write */
    if (finePointer) {
      const actual = window.scrollY;
      if (Math.abs(actual - lastWritten) > 1.5) {
        /* keyboard / scrollbar / native jump — resync, don't fight it */
        scrollTarget = scrollCurrent = actual;
      }
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.11;
      if (Math.abs(scrollTarget - scrollCurrent) > 0.4) {
        window.scrollTo(0, scrollCurrent);
      }
      lastWritten = window.scrollY;
    }

    const y = window.scrollY;
    const raw = y - lastY;
    lastY = y;
    velocity += (raw - velocity) * 0.12;

    /* Shear: the page leans into its own momentum */
    const deg = clamp(velocity * 0.055, -3.4, 3.4);
    if (Math.abs(deg) > 0.03) {
      const t = `skewY(${deg.toFixed(3)}deg)`;
      skewTargets.forEach((el) => { el.style.transform = t; });
      skewed = true;
    } else if (skewed) {
      skewTargets.forEach((el) => { el.style.transform = ''; });
      skewed = false;
    }

    /* Hero lines drift apart as you leave */
    if (heroLines.length === 2 && y < window.innerHeight * 1.5) {
      const drift = Math.min(y * 0.16, 220);
      heroLines[0].style.transform = `translate3d(${-drift.toFixed(1)}px,0,0)`;
      heroLines[1].style.transform = `translate3d(${drift.toFixed(1)}px,0,0)`;
    }

    if (heroScrollHint) {
      heroScrollHint.classList.toggle('is-gone', y > 80);
    }

    /* Header hides on the way down, returns on the way up */
    if (siteHead) {
      if (velocity > 5 && y > 280 && !document.body.classList.contains('menu-open')) {
        siteHead.classList.add('is-hidden');
      } else if (velocity < -2 || y < 280) {
        siteHead.classList.remove('is-hidden');
      }
    }

    /* Scroll progress */
    if (progressBar && maxScroll > 0) {
      progressBar.style.transform = `scaleX(${clamp(y / maxScroll, 0, 1).toFixed(4)})`;
    }

    /* Marquee rides the scroll — speeds up, reverses when you backtrack */
    if (marqueeTrack && marqueeHalf > 0) {
      const speed = 42 + clamp(velocity * 60 * 0.16, -860, 860);
      marqueeX = (marqueeX + speed * dt) % marqueeHalf;
      if (marqueeX < 0) marqueeX += marqueeHalf;
      marqueeTrack.style.transform = `translate3d(${(-marqueeX).toFixed(1)}px,0,0)`;
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
})();
