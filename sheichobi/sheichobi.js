let allPhotos = [];
let activePhotos = [];
let activeIndex = 0;
let activeFilter = 'all';

const fallbackPhotos = [
  'Photographs/street1.jpg', 'Photographs/street2.jpg', 'Photographs/street3.jpg',
  'Photographs/street4.jpg', 'Photographs/street5.jpg', 'Photographs/street6.jpg',
  'Photographs/street7.jpg', 'Photographs/street8.jpg', 'Photographs/street9.jpg',
  'Photographs/street10.jpg', 'Photographs/street11.jpg', 'Photographs/street12.jpg',
  'Photographs/street13.jpg', 'Photographs/street14.jpg',
  'Photographs/mono1.jpg', 'Photographs/mono2.jpg', 'Photographs/mono3.jpg',
  'Photographs/mono4.jpg', 'Photographs/mono5.jpg', 'Photographs/mono6.jpg',
  'Photographs/mono7.jpg', 'Photographs/mono8.jpg', 'Photographs/mono9.jpg',
  'Photographs/mono10.jpg',
  'Photographs/trad1.jpg', 'Photographs/trad2.jpg', 'Photographs/trad3.jpg',
  'Photographs/trad4.jpg', 'Photographs/trad5.jpg', 'Photographs/trad6.jpg',
  'Photographs/trad7.jpg'
];

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
    allPhotos = await response.json();
  } catch (error) {
    console.warn('Using fallback photo list:', error);
    allPhotos = fallbackPhotos;
  }

  activePhotos = [...allPhotos];
  updatePhotoCount();
  renderHeroScene();
  renderGallery();
  bindFilters();
  bindHeroTilt();
  bindModalControls();
}

function getCategory(photo) {
  const fileName = photo.split('/').pop().toLowerCase();

  if (fileName.startsWith('mono')) return 'mono';
  if (fileName.startsWith('trad')) return 'trad';
  return 'street';
}

function getCategoryLabel(category) {
  return {
    street: 'Street',
    mono: 'Monochrome',
    trad: 'Tradition'
  }[category] || 'Photograph';
}

function getPhotoTitle(photo) {
  const fileName = photo.split('/').pop().replace(/\.[^.]+$/, '');
  const category = getCategory(photo);
  const number = fileName.replace(/[^\d]/g, '').padStart(2, '0');
  return `${getCategoryLabel(category)} ${number}`;
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
    frame.setAttribute('aria-label', `Open ${getPhotoTitle(photo)}`);
    frame.style.setProperty('--x', layout.x);
    frame.style.setProperty('--y', layout.y);
    frame.style.setProperty('--z', layout.z);
    frame.style.setProperty('--rx', layout.rx);
    frame.style.setProperty('--ry', layout.ry);
    frame.style.setProperty('--rz', layout.rz);
    frame.style.setProperty('--ratio', layout.ratio);
    frame.style.setProperty('--float-speed', layout.speed);
    frame.innerHTML = `<img src="${photo}" alt="${getPhotoTitle(photo)}" loading="${index < 3 ? 'eager' : 'lazy'}">`;
    frame.addEventListener('click', () => openModalByPhoto(photo));
    scene.appendChild(frame);
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  activePhotos = activeFilter === 'all'
    ? [...allPhotos]
    : allPhotos.filter(photo => getCategory(photo) === activeFilter);

  grid.innerHTML = '';

  activePhotos.forEach((photo, index) => {
    const category = getCategory(photo);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'photo-card';
    card.setAttribute('aria-label', `Open ${getPhotoTitle(photo)}`);
    card.innerHTML = `
      <img src="${photo}" alt="${getPhotoTitle(photo)}" loading="lazy">
      <span class="photo-caption">
        <span>${getPhotoTitle(photo)}</span>
        <span>${getCategoryLabel(category)}</span>
      </span>
    `;
    card.addEventListener('click', () => openModal(index));
    grid.appendChild(card);
  });
}

function getFeaturedPhotos() {
  const byCategory = {
    street: allPhotos.filter(photo => getCategory(photo) === 'street'),
    mono: allPhotos.filter(photo => getCategory(photo) === 'mono'),
    trad: allPhotos.filter(photo => getCategory(photo) === 'trad')
  };

  const mixed = [
    byCategory.street[0],
    byCategory.mono[0],
    byCategory.trad[0],
    byCategory.street[5],
    byCategory.trad[2],
    byCategory.mono[4],
    byCategory.street[9],
    byCategory.trad[5],
    byCategory.mono[8]
  ].filter(Boolean);

  return [...new Set(mixed)].slice(0, frameLayout.length);
}

function bindFilters() {
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('.filter-button').forEach(item => {
        item.classList.toggle('active', item === button);
      });
      renderGallery();
    });
  });
}

function bindHeroTilt() {
  const hero = document.querySelector('.hero');
  const scene = document.getElementById('photoScene');

  if (!hero || !scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  hero.addEventListener('mousemove', event => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    scene.style.setProperty('--tilt-y', `${-8 + x * 12}deg`);
    scene.style.setProperty('--tilt-x', `${y * -8}deg`);
  });

  hero.addEventListener('mouseleave', () => {
    scene.style.setProperty('--tilt-y', '-8deg');
    scene.style.setProperty('--tilt-x', '0deg');
  });
}

function openModalByPhoto(photo) {
  const index = activePhotos.indexOf(photo);

  if (index >= 0) {
    openModal(index);
    return;
  }

  activePhotos = [...allPhotos];
  activeIndex = allPhotos.indexOf(photo);
  showModalPhoto();
}

function openModal(index) {
  activeIndex = index;
  showModalPhoto();
}

function showModalPhoto() {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const photo = activePhotos[activeIndex];

  if (!modal || !modalImg || !photo) return;

  modalImg.src = photo;
  modalImg.alt = getPhotoTitle(photo);
  modalCaption.textContent = `${getPhotoTitle(photo)} / ${getCategoryLabel(getCategory(photo))}`;
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

function updatePhotoCount() {
  const photoCount = document.getElementById('photoCount');
  if (photoCount) {
    photoCount.textContent = String(allPhotos.length).padStart(2, '0');
  }
}

document.addEventListener('DOMContentLoaded', loadPhotoList);
