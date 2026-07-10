/* ============================================================
   SHEICHOBI — PHOTOGRAPHY BY MOSAM BISWAS
   Data-driven gallery in the v5 editorial system:
   fitted hero type · collection index rows with cursor preview ·
   filterable masonry archive · keyboard lightbox
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const INITIAL_VISIBLE_COUNT = 18;
  const LOAD_MORE_COUNT = 18;

  let allPhotos = [];
  let activePhotos = [];
  let activeIndex = 0;
  let activeFilter = 'all';
  let visibleCount = INITIAL_VISIBLE_COUNT;

  const categoryLabels = {
    all: 'All',
    street: 'Street',
    port: 'Portraits',
    mono: 'Monochrome',
    con: 'Concerts',
    wild: 'Wildlife',
    trad: 'Traditions'
  };

  const categoryOrder = ['street', 'port', 'mono', 'con', 'wild', 'trad'];

  /* Used when photos.json cannot be fetched (e.g. opened from disk) */
  const fallbackPhotos = (() => {
    const list = [];
    const add = (prefix, numbers) => numbers.forEach((n) => list.push(`Photographs/${prefix}${n}.webp`));
    const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
    add('con', [...range(1, 12), ...range(14, 17)]);
    add('mono', range(1, 15));
    add('port', range(1, 7));
    list.push('Photographs/Port8.webp');
    add('port', range(9, 13));
    add('street', range(1, 11));
    add('trad', range(1, 3));
    add('wild', range(1, 10));
    list.push('Photographs/Wild11.webp');
    add('wild', range(12, 26));
    return list;
  })();

  /* ---------- Data ---------- */

  const inferCategory = (src) => {
    const fileName = src.split('/').pop().toLowerCase().replace(/\.[^.]+$/, '');
    return fileName.match(/^[a-z]+/)?.[0] || 'misc';
  };

  const getCategoryLabel = (category) => {
    if (categoryLabels[category]) return categoryLabels[category];
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPhotoTitle = (src, category) => {
    const number = src.split('/').pop().replace(/[^\d]/g, '');
    const label = getCategoryLabel(category);
    return number ? `${label} ${number.padStart(2, '0')}` : label;
  };

  /* Grid + preview use downsized copies; the lightbox loads the original */
  const getThumbSrc = (src) => src.replace(/^Photographs\//, 'Photographs/thumbs/');

  const normalizePhotos = (rawPhotos) => rawPhotos
    .map((item) => {
      const src = typeof item === 'string' ? item : item?.src;
      if (!src) return null;
      const category = (typeof item === 'object' && item.category)
        ? item.category.toLowerCase()
        : inferCategory(src);
      return { src, thumb: getThumbSrc(src), category, title: getPhotoTitle(src, category) };
    })
    .filter(Boolean);

  const createPhotoImg = (photo, alt) => {
    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => {
      img.onerror = null;
      img.src = photo.src;
    };
    return img;
  };

  const getCollections = () => {
    const categories = [...new Set(allPhotos.map((photo) => photo.category))].sort((a, b) => {
      const ai = categoryOrder.indexOf(a);
      const bi = categoryOrder.indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });

    return categories.map((category) => {
      const photos = allPhotos.filter((photo) => photo.category === category);
      return { category, label: getCategoryLabel(category), count: photos.length, cover: photos[0] };
    });
  };

  const getFilteredPhotos = () => (
    activeFilter === 'all' ? [...allPhotos] : allPhotos.filter((photo) => photo.category === activeFilter)
  );

  /* ---------- Fit display lines edge-to-edge ---------- */

  const fitLines = () => {
    document.querySelectorAll('.hero__line').forEach((line) => {
      const word = line.querySelector('.hero__word');
      if (!word) return;
      line.style.fontSize = '100px';
      word.style.letterSpacing = '';
      if (word.getBoundingClientRect().width <= 0) {
        line.style.fontSize = '';
        return;
      }
      /* Iterative fit: px-resolved letter-spacing doesn't scale with
         font-size, so corrective passes converge to the true edge. */
      let size = 100;
      for (let pass = 0; pass < 3; pass++) {
        const width = word.getBoundingClientRect().width;
        if (width <= 0) break;
        size *= line.clientWidth / width;
        line.style.fontSize = `${size.toFixed(2)}px`;
        if (Math.abs(width - line.clientWidth) < 1) break;
      }
      /* Hero lines are height-capped: short words (SHEI) would otherwise
         outgrow the viewport and push the hero foot off-screen. A capped
         word is justified back to the edges with letter-spacing. */
      const cap = window.innerHeight * 0.3;
      if (line.closest('.hero') && size > cap) {
        size = cap;
        line.style.fontSize = `${size.toFixed(2)}px`;
        const chars = (word.textContent || '').length;
        if (chars > 1) {
          word.style.letterSpacing = '0px';
          const width = word.getBoundingClientRect().width;
          const spacing = (line.clientWidth - width) / (chars - 1);
          word.style.letterSpacing = `${Math.max(spacing, 0).toFixed(2)}px`;
        }
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

  /* ---------- Hero entrance (no preloader on this page) ---------- */

  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
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
    let cursorSeen = false;
    let cursorRafActive = false;

    /* Eases toward the pointer, then parks until the next mousemove */
    const renderCursor = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2) {
        requestAnimationFrame(renderCursor);
      } else {
        cursorRafActive = false;
      }
    };

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorSeen) {
        cursorSeen = true;
        x = targetX;
        y = targetY;
        cursor.classList.add('is-visible');
      }
      if (!cursorRafActive) {
        cursorRafActive = true;
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

  /* ---------- Collections: index rows + cursor preview ---------- */

  const collectionList = document.getElementById('collectionList');
  const collectionPreview = document.getElementById('collectionPreview');
  const collectionPreviewStrip = document.getElementById('collectionPreviewStrip');

  const renderCollections = () => {
    if (!collectionList) return;
    const collections = getCollections();

    collectionList.innerHTML = '';
    if (collectionPreviewStrip) collectionPreviewStrip.innerHTML = '';

    collections.forEach((collection, index) => {
      const li = document.createElement('li');
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'collection-row';
      row.dataset.preview = String(index);
      row.setAttribute('aria-label', `View the ${collection.label} collection, ${collection.count} frames`);
      row.innerHTML = `
        <span class="collection-row__idx mono">${String(index + 1).padStart(2, '0')}</span>
        <span class="collection-row__title">${collection.label}</span>
        <span class="collection-row__count mono">${String(collection.count).padStart(2, '0')} frames</span>
        <span class="collection-row__arrow" aria-hidden="true">↓</span>
      `;
      row.addEventListener('click', () => {
        setActiveFilter(collection.category);
        document.getElementById('work')?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
      li.appendChild(row);
      collectionList.appendChild(li);

      if (collectionPreviewStrip && collection.cover) {
        const figure = document.createElement('figure');
        figure.appendChild(createPhotoImg(collection.cover, ''));
        collectionPreviewStrip.appendChild(figure);
      }
    });

    bindCollectionPreview();
  };

  let previewBound = false;

  const bindCollectionPreview = () => {
    if (previewBound || !collectionList || !collectionPreview || !collectionPreviewStrip) return;
    if (!finePointer || prefersReduced) return;
    previewBound = true;

    let previewX = 0;
    let previewY = 0;
    let previewTargetX = 0;
    let previewTargetY = 0;
    let previewRaf = null;

    const renderPreview = () => {
      previewX += (previewTargetX - previewX) * 0.12;
      previewY += (previewTargetY - previewY) * 0.12;
      collectionPreview.style.left = `${previewX}px`;
      collectionPreview.style.top = `${previewY}px`;
      previewRaf = requestAnimationFrame(renderPreview);
    };

    collectionList.addEventListener('mousemove', (e) => {
      previewTargetX = Math.min(e.clientX + 28, window.innerWidth - collectionPreview.offsetWidth - 16);
      previewTargetY = e.clientY - collectionPreview.offsetHeight / 2;
    }, { passive: true });

    collectionList.addEventListener('mouseenter', (e) => {
      previewX = previewTargetX = e.clientX + 28;
      previewY = previewTargetY = e.clientY - collectionPreview.offsetHeight / 2;
      if (!previewRaf) previewRaf = requestAnimationFrame(renderPreview);
    });

    collectionList.addEventListener('mouseleave', () => {
      collectionPreview.classList.remove('is-active');
      if (previewRaf) {
        cancelAnimationFrame(previewRaf);
        previewRaf = null;
      }
    });

    collectionList.addEventListener('mouseover', (e) => {
      const row = e.target.closest('.collection-row');
      if (!row) return;
      collectionPreviewStrip.style.transform = `translateY(${Number(row.dataset.preview || 0) * -100}%)`;
      collectionPreview.classList.add('is-active');
    });
  };

  /* ---------- Archive: filters + masonry ---------- */

  const galleryGrid = document.getElementById('galleryGrid');
  const filterBar = document.getElementById('filterBar');
  const galleryStatus = document.getElementById('galleryStatus');
  const loadMoreButton = document.getElementById('loadMoreButton');

  const renderFilters = () => {
    if (!filterBar) return;
    const filters = [{ category: 'all', label: 'All' }, ...getCollections()];

    filterBar.innerHTML = '';
    filters.forEach((filter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-button';
      button.textContent = filter.category === 'all' ? `All — ${allPhotos.length}` : `${filter.label} — ${filter.count}`;
      button.classList.toggle('active', activeFilter === filter.category);
      button.addEventListener('click', () => setActiveFilter(filter.category));
      filterBar.appendChild(button);
    });
  };

  const renderGallery = () => {
    if (!galleryGrid) return;

    activePhotos = getFilteredPhotos();
    const visiblePhotos = activePhotos.slice(0, visibleCount);

    galleryGrid.innerHTML = '';
    visiblePhotos.forEach((photo, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'photo-card';
      card.dataset.title = photo.title;
      card.setAttribute('aria-label', `Open ${photo.title}`);
      card.appendChild(createPhotoImg(photo, photo.title));
      card.addEventListener('click', () => openLightbox(index));
      galleryGrid.appendChild(card);
    });

    if (galleryStatus) {
      const label = activeFilter === 'all' ? 'All collections' : getCategoryLabel(activeFilter);
      galleryStatus.textContent = `${label} — ${visiblePhotos.length} of ${activePhotos.length}`;
    }

    if (loadMoreButton) {
      const remaining = Math.max(activePhotos.length - visibleCount, 0);
      loadMoreButton.closest('.archive__more')?.classList.toggle('hidden', remaining === 0);
      loadMoreButton.textContent = `Load ${Math.min(remaining, LOAD_MORE_COUNT)} more`;
    }
  };

  const setActiveFilter = (category) => {
    activeFilter = category;
    visibleCount = INITIAL_VISIBLE_COUNT;
    renderFilters();
    renderGallery();
  };

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      visibleCount += LOAD_MORE_COUNT;
      renderGallery();
    });
  }

  /* ---------- Lightbox ---------- */

  const lightbox = document.getElementById('photoModal');
  const lightboxImg = document.getElementById('modalImg');
  const lightboxCaption = document.getElementById('modalCaption');
  const lightboxCounter = document.getElementById('modalCounter');

  const showLightboxPhoto = () => {
    const photo = activePhotos[activeIndex];
    if (!lightbox || !lightboxImg || !photo) return;

    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    if (lightboxCaption) lightboxCaption.textContent = photo.title;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(activePhotos.length).padStart(2, '0')}`;
    }
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    activeIndex = index;
    showLightboxPhoto();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  const showAdjacentPhoto = (direction) => {
    if (!activePhotos.length) return;
    activeIndex = (activeIndex + direction + activePhotos.length) % activePhotos.length;
    showLightboxPhoto();
  };

  if (lightbox) {
    document.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => showAdjacentPhoto(-1));
    document.querySelector('.lightbox__nav--next')?.addEventListener('click', () => showAdjacentPhoto(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showAdjacentPhoto(-1);
      if (e.key === 'ArrowRight') showAdjacentPhoto(1);
    });
  }

  /* ---------- Metrics ---------- */

  const updateMetrics = () => {
    const photoCount = document.getElementById('photoCount');
    const collectionCount = document.getElementById('collectionCount');
    if (photoCount) photoCount.textContent = String(allPhotos.length).padStart(2, '0');
    if (collectionCount) collectionCount.textContent = String(getCollections().length).padStart(2, '0');
  };

  /* ---------- Boot ---------- */

  const boot = async () => {
    try {
      const response = await fetch('photos.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load photos.json');
      allPhotos = normalizePhotos(await response.json());
    } catch (error) {
      console.warn('Using fallback photo list:', error);
      allPhotos = normalizePhotos(fallbackPhotos);
    }

    activePhotos = [...allPhotos];
    updateMetrics();
    renderCollections();
    renderFilters();
    renderGallery();
  };

  /* ---------- Right-click guard ---------- */

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
