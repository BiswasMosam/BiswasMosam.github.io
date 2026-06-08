let allPhotos = [];
let activePhotos = [];
let activeIndex = 0;
let activeFilter = 'all';
let visibleCount = 12;

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 9;

const fallbackPhotos = [
  'Photographs/street1.webp', 'Photographs/street2.webp', 'Photographs/street3.webp',
  'Photographs/street4.webp', 'Photographs/street5.webp', 'Photographs/street6.webp',
  'Photographs/street7.webp', 'Photographs/street8.webp', 'Photographs/street9.webp',
  'Photographs/street10.webp', 'Photographs/street11.webp', 'Photographs/street12.webp',
  'Photographs/street13.webp', 'Photographs/street14.webp',
  'Photographs/mono1.webp', 'Photographs/mono2.webp', 'Photographs/mono3.webp',
  'Photographs/mono4.webp', 'Photographs/mono5.webp', 'Photographs/mono6.webp',
  'Photographs/mono7.webp', 'Photographs/mono8.webp', 'Photographs/mono9.webp',
  'Photographs/mono10.webp',
  'Photographs/trad1.webp', 'Photographs/trad2.webp', 'Photographs/trad3.webp',
  'Photographs/trad4.webp', 'Photographs/trad5.webp', 'Photographs/trad6.webp',
  'Photographs/trad7.webp'
];

const categoryLabels = {
  all: 'All',
  mono: 'Monochrome',
  street: 'Street',
  trad: 'Tradition'
};

const frameLayout = [
  { x: '-34vw', y: '-42%', z: '-120px', rx: '2deg', ry: '18deg', rz: '-7deg', ratio: '4 / 5', speed: '8s' },
  { x: '-12vw', y: '-52%', z: '110px', rx: '-3deg', ry: '-12deg', rz: '4deg', ratio: '3 / 4', speed: '7s' },
  { x: '10vw', y: '-45%', z: '-40px', rx: '4deg', ry: '16deg', rz: '8deg', ratio: '5 / 4', speed: '9s' },
  { x: '25vw', y: '-20%', z: '170px', rx: '-4deg', ry: '-16deg', rz: '-4deg', ratio: '4 / 5', speed: '7.5s' },
  { x: '-28vw', y: '-2%', z: '160px', rx: '3deg', ry: '20deg', rz: '5deg', ratio: '5 / 4', speed: '8.5s' },
  { x: '-4vw', y: '-4%', z: '260px', rx: '-2deg', ry: '-5deg', rz: '-1deg', ratio: '4 / 5', speed: '7.8s' },
  { x: '18vw', y: '7%', z: '20px', rx: '5deg', ry: '13deg', rz: '7deg', ratio: '3 / 4', speed: '9.5s' },
  { x: '-16vw', y: '30%', z: '-30px', rx: '-4deg', ry: '14deg', rz: '-6deg', ratio: '4 / 3', speed: '8.8s' },
  { x: '7vw', y: '34%', z: '120px', rx: '3deg', ry: '-15deg', rz: '4deg', ratio: '5 / 4', speed: '7.2s' }
];

async function loadPhotoList() {
  try {
    const response = await fetch('photos.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load photos.json');
    }
    allPhotos = normalizePhotos(await response.json());
  } catch (error) {
    console.warn('Using fallback photo list:', error);
    allPhotos = normalizePhotos(fallbackPhotos);
  }

  activePhotos = [...allPhotos];
  updateMetrics();
  renderHeroScene();
  renderCollections();
  renderFilters();
  renderGallery(true);
  bindHeroTilt();
  bindModalControls();
  bindLoadMore();
}

function normalizePhotos(rawPhotos) {
  return rawPhotos
    .map((item, index) => normalizePhoto(item, index))
    .filter(Boolean);
}

function normalizePhoto(item, index) {
  const src = typeof item === 'string' ? item : item?.src;
  if (!src) return null;

  const category = (typeof item === 'object' && item.category)
    ? item.category.toLowerCase()
    : inferCategory(src);

  return {
    src,
    category,
    title: typeof item === 'object' && item.title ? item.title : getPhotoTitle(src, category),
    featured: typeof item === 'object' ? Boolean(item.featured) : false
  };
}

function inferCategory(src) {
  const fileName = src.split('/').pop().toLowerCase().replace(/\.[^.]+$/, '');
  const prefix = fileName.match(/^[a-z]+/)?.[0];
  return prefix || 'misc';
}

function getCategoryLabel(category) {
  if (categoryLabels[category]) return categoryLabels[category];

  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Photograph';
}

function getPhotoTitle(src, category = inferCategory(src)) {
  const fileName = src.split('/').pop().replace(/\.[^.]+$/, '');
  const number = fileName.replace(/[^\d]/g, '');

  if (number) {
    return `${getCategoryLabel(category)} ${number.padStart(2, '0')}`;
  }

  return fileName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getCollectionData() {
  const categories = [...new Set(allPhotos.map(photo => photo.category))].sort((a, b) => {
    const preferredOrder = ['street', 'mono', 'trad'];
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);

    if (aIndex >= 0 || bIndex >= 0) {
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    }

    return getCategoryLabel(a).localeCompare(getCategoryLabel(b));
  });

  return categories.map(category => {
    const photos = allPhotos.filter(photo => photo.category === category);
    return {
      category,
      label: getCategoryLabel(category),
      count: photos.length,
      cover: photos[0]?.src
    };
  });
}

function renderHeroScene() {
  const scene = document.getElementById('photoScene');
  if (!scene) return;

  const featured = getFeaturedPhotos();
  scene.innerHTML = '';

  featured.forEach((photo, index) => {
    const layout = frameLayout[index];
    const frame = document.createElement('button');
    frame.type = 'button';
    frame.className = 'floating-frame';
    frame.setAttribute('aria-label', `Open ${photo.title}`);
    frame.style.setProperty('--x', layout.x);
    frame.style.setProperty('--y', layout.y);
    frame.style.setProperty('--z', layout.z);
    frame.style.setProperty('--rx', layout.rx);
    frame.style.setProperty('--ry', layout.ry);
    frame.style.setProperty('--rz', layout.rz);
    frame.style.setProperty('--ratio', layout.ratio);
    frame.style.setProperty('--float-speed', layout.speed);
    frame.style.setProperty('--float-delay', `${index * -0.72}s`);
    frame.innerHTML = `
      <span class="floating-frame__inner">
        <img src="${photo.src}" alt="${photo.title}" loading="${index < 3 ? 'eager' : 'lazy'}">
      </span>
    `;
    frame.addEventListener('click', () => openModalByPhoto(photo));
    scene.appendChild(frame);
  });
}

function getFeaturedPhotos() {
  const explicitlyFeatured = allPhotos.filter(photo => photo.featured);

  if (explicitlyFeatured.length >= frameLayout.length) {
    return explicitlyFeatured.slice(0, frameLayout.length);
  }

  const balanced = [];
  const collections = getCollectionData().map(collection => (
    allPhotos.filter(photo => photo.category === collection.category)
  ));
  const maxLength = Math.max(...collections.map(collection => collection.length), 0);

  for (let index = 0; index < maxLength && balanced.length < frameLayout.length; index++) {
    collections.forEach(collection => {
      if (collection[index] && balanced.length < frameLayout.length) {
        balanced.push(collection[index]);
      }
    });
  }

  return [...new Set([...explicitlyFeatured, ...balanced])].slice(0, frameLayout.length);
}

function renderCollections() {
  const grid = document.getElementById('collectionGrid');
  if (!grid) return;

  const collections = getCollectionData();
  const allCover = getFeaturedPhotos()[0]?.src || allPhotos[0]?.src;
  const cards = [
    { category: 'all', label: 'All Work', count: allPhotos.length, cover: allCover },
    ...collections
  ];

  grid.innerHTML = '';

  cards.forEach(collection => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'collection-card';
    card.classList.toggle('active', activeFilter === collection.category);
    card.setAttribute('aria-label', `View ${collection.label} collection`);
    card.innerHTML = `
      <img src="${collection.cover}" alt="" loading="lazy">
      <span class="collection-card__content">
        <span class="collection-card__count">${String(collection.count).padStart(2, '0')} Frames</span>
        <span class="collection-card__title">${collection.label}</span>
        <span class="collection-card__meta">
          <span>Open Collection</span>
          <span>${collection.category === 'all' ? 'Archive' : 'Series'}</span>
        </span>
      </span>
    `;
    card.addEventListener('click', () => {
      setActiveFilter(collection.category);
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    grid.appendChild(card);
  });
}

function renderFilters() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;

  const filters = [
    { category: 'all', label: 'All' },
    ...getCollectionData().map(collection => ({
      category: collection.category,
      label: collection.label
    }))
  ];

  filterBar.innerHTML = '';

  filters.forEach(filter => {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.type = 'button';
    button.dataset.filter = filter.category;
    button.textContent = filter.label;
    button.classList.toggle('active', activeFilter === filter.category);
    button.addEventListener('click', () => setActiveFilter(filter.category));
    filterBar.appendChild(button);
  });
}

function setActiveFilter(category) {
  activeFilter = category;
  visibleCount = INITIAL_VISIBLE_COUNT;
  renderCollections();
  renderFilters();
  renderGallery(true);
}

function getFilteredPhotos() {
  return activeFilter === 'all'
    ? [...allPhotos]
    : allPhotos.filter(photo => photo.category === activeFilter);
}

function renderGallery(resetIndex = false) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  activePhotos = getFilteredPhotos();
  const visiblePhotos = activePhotos.slice(0, visibleCount);
  grid.innerHTML = '';

  visiblePhotos.forEach((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'photo-card';
    card.setAttribute('aria-label', `Open ${photo.title}`);
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.title}" loading="lazy">
      <span class="photo-caption">
        <span>${photo.title}</span>
        <span>${getCategoryLabel(photo.category)}</span>
      </span>
    `;
    card.addEventListener('click', () => openModal(index));
    grid.appendChild(card);
  });

  if (resetIndex) activeIndex = 0;
  updateGalleryStatus(visiblePhotos.length);
  updateLoadMoreButton();
}

function updateGalleryStatus(visibleTotal) {
  const status = document.getElementById('galleryStatus');
  if (!status) return;

  const label = activeFilter === 'all' ? 'All Collections' : getCategoryLabel(activeFilter);
  status.textContent = `${label} / ${visibleTotal} of ${activePhotos.length}`;
}

function bindLoadMore() {
  const loadMoreButton = document.getElementById('loadMoreButton');
  if (!loadMoreButton) return;

  loadMoreButton.addEventListener('click', () => {
    visibleCount += LOAD_MORE_COUNT;
    renderGallery();
  });
}

function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById('loadMoreButton');
  const footer = loadMoreButton?.closest('.gallery-footer');
  if (!loadMoreButton || !footer) return;

  const remaining = Math.max(activePhotos.length - visibleCount, 0);
  footer.classList.toggle('hidden', remaining === 0);
  loadMoreButton.textContent = remaining > 0 ? `Load ${Math.min(remaining, LOAD_MORE_COUNT)} More` : 'All Loaded';
}

function bindHeroTilt() {
  const hero = document.querySelector('.hero');
  const scene = document.getElementById('photoScene');

  if (!hero || !scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let bounds = hero.getBoundingClientRect();
  let targetTiltX = 0;
  let targetTiltY = -8;
  let tiltFrame = null;

  const applyTilt = () => {
    scene.style.setProperty('--tilt-y', `${targetTiltY}deg`);
    scene.style.setProperty('--tilt-x', `${targetTiltX}deg`);
    tiltFrame = null;
  };

  const scheduleTilt = () => {
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(applyTilt);
  };

  const refreshBounds = () => {
    bounds = hero.getBoundingClientRect();
  };

  hero.addEventListener('pointerenter', refreshBounds);

  hero.addEventListener('pointermove', event => {
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    targetTiltY = -8 + x * 12;
    targetTiltX = y * -8;
    scheduleTilt();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    targetTiltY = -8;
    targetTiltX = 0;
    scheduleTilt();
  });

  window.addEventListener('resize', refreshBounds, { passive: true });
}

function openModalByPhoto(photo) {
  const index = activePhotos.findIndex(item => item.src === photo.src);

  if (index >= 0) {
    openModal(index);
    return;
  }

  activePhotos = [...allPhotos];
  activeIndex = allPhotos.findIndex(item => item.src === photo.src);
  showModalPhoto(activePhotos[activeIndex]);
}

function openModal(index) {
  activeIndex = index;
  showModalPhoto(activePhotos[activeIndex]);
}

function showModalPhoto(photo = activePhotos[activeIndex]) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');

  if (!modal || !modalImg || !photo) return;

  modalImg.src = photo.src;
  modalImg.alt = photo.title;
  modalCaption.textContent = `${photo.title} / ${getCategoryLabel(photo.category)}`;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.getElementById('photoModal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function showAdjacentPhoto(direction) {
  if (!activePhotos.length) return;
  activeIndex = (activeIndex + direction + activePhotos.length) % activePhotos.length;
  showModalPhoto();
}

function bindModalControls() {
  const modal = document.getElementById('photoModal');
  const closeButton = document.querySelector('.modal-close');
  const prevButton = document.querySelector('.modal-prev');
  const nextButton = document.querySelector('.modal-next');

  closeButton?.addEventListener('click', closeModal);
  prevButton?.addEventListener('click', () => showAdjacentPhoto(-1));
  nextButton?.addEventListener('click', () => showAdjacentPhoto(1));

  modal?.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (!modal?.classList.contains('active')) return;

    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') showAdjacentPhoto(-1);
    if (event.key === 'ArrowRight') showAdjacentPhoto(1);
  });
}

function updateMetrics() {
  const photoCount = document.getElementById('photoCount');
  const collectionCount = document.getElementById('collectionCount');

  if (photoCount) {
    photoCount.textContent = String(allPhotos.length).padStart(2, '0');
  }

  if (collectionCount) {
    collectionCount.textContent = String(getCollectionData().length).padStart(2, '0');
  }
}

document.addEventListener('DOMContentLoaded', loadPhotoList);
