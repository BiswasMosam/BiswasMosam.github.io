// Photo collections
const photoCollections = {
  'photo-walks': [
    'Photographs/street1.jpg', 'Photographs/street2.jpg', 'Photographs/street3.jpg',
    'Photographs/street4.jpg', 'Photographs/street5.jpg', 'Photographs/street6.jpg',
    'Photographs/street7.jpg', 'Photographs/street8.jpg', 'Photographs/street9.jpg',
    'Photographs/street10.jpg', 'Photographs/street11.jpg', 'Photographs/street12.jpg',
    'Photographs/street13.jpg', 'Photographs/street14.jpg'
  ],
  'friendly-shoots': [
    'Photographs/mono1.jpg', 'Photographs/mono2.jpg', 'Photographs/mono3.jpg',
    'Photographs/mono4.jpg', 'Photographs/mono5.jpg', 'Photographs/mono6.jpg',
    'Photographs/mono7.jpg', 'Photographs/mono8.jpg', 'Photographs/mono9.jpg',
    'Photographs/mono10.jpg'
  ],
  'event-shoots': [
    'Photographs/trad1.jpg', 'Photographs/trad2.jpg', 'Photographs/trad3.jpg',
    'Photographs/trad4.jpg', 'Photographs/trad5.jpg', 'Photographs/trad6.jpg',
    'Photographs/trad7.jpg'
  ]
};

// Slideshow state
const slideshowState = {
  'photo-walks': { currentIndex: 0, interval: null },
  'friendly-shoots': { currentIndex: 0, interval: null },
  'event-shoots': { currentIndex: 0, interval: null }
};

const SLIDE_DURATION = 3000; // 3 seconds per slide
const instaLink = document.getElementById('insta-link-fixed');

// Initialize slideshows and grids
function initializeSection(sectionId) {
  const photos = photoCollections[sectionId];
  const slideshowContainer = document.getElementById(`slideshow-${sectionId}`);
  slideshowContainer.innerHTML = '';
  photos.forEach((photo, index) => {
    const slide = document.createElement('div');
    slide.className = `slide ${index === 0 ? 'active' : ''}`;
    slide.innerHTML = `<img src="${photo}" alt="${sectionId} Photo ${index + 1}" onclick="openModal(this)">`;
    slideshowContainer.appendChild(slide);
  });

  const gridContainer = document.getElementById(`grid-${sectionId}`);
  gridContainer.innerHTML = '';
  photos.forEach((photo, index) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.innerHTML = `<img src="${photo}" alt="${sectionId} Photo ${index + 1}" onclick="openModal(this)">`;
    gridContainer.appendChild(gridItem);
  });
}

// Show specific slide with zoom effect
function showSlide(sectionId, index) {
  const slides = document.querySelectorAll(`#slideshow-${sectionId} .slide`);
  const state = slideshowState[sectionId];

  if (slides[state.currentIndex]) {
    slides[state.currentIndex].classList.add('zoom-out');
  }

  slides.forEach(slide => {
    slide.classList.remove('active');
    slide.classList.remove('zoom-out');
  });

  setTimeout(() => {
    if (slides[index]) {
      slides[index].classList.add('active');
      state.currentIndex = index;
    }
  }, 100);
}

// Next slide
function nextSlide(sectionId) {
  const photos = photoCollections[sectionId];
  const state = slideshowState[sectionId];
  const nextIndex = (state.currentIndex + 1) % photos.length;
  showSlide(sectionId, nextIndex);
}

// Start slideshow
function startSlideshow(sectionId) {
  const state = slideshowState[sectionId];
  if (state.interval) clearInterval(state.interval);

  state.interval = setInterval(() => {
    nextSlide(sectionId);
  }, SLIDE_DURATION);
}

// Stop slideshow
function stopSlideshow(sectionId) {
  const state = slideshowState[sectionId];
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
}

// Section navigation
function showSection(sectionId) {
  Object.keys(photoCollections).forEach(id => {
    document.getElementById(id).style.display = 'none';
    stopSlideshow(id);
  });

  document.getElementById(sectionId).style.display = 'block';

  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab[data-section="${sectionId}"]`).classList.add('active');

  setTimeout(() => {
    startSlideshow(sectionId);
  }, 300);
}

// Modal functions
function openModal(img) {
  var modal = document.getElementById('photoModal');
  var modalImg = document.getElementById('modalImg');

  modalImg.src = img.src;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (instaLink) instaLink.classList.add('hide');
}

function closeModal(event) {
  if (event.target.classList.contains('modal') || event.target.classList.contains('close-modal')) {
    document.getElementById('photoModal').classList.remove('active');
    document.body.style.overflow = '';
    if (instaLink) instaLink.classList.remove('hide');
  }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('photoModal');
  if (modal.classList.contains('active') && e.key === 'Escape') {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (instaLink) instaLink.classList.remove('hide');
  }
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  Object.keys(photoCollections).forEach(sectionId => {
    initializeSection(sectionId);
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
    });
  });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href === '#contact') {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  showSection('photo-walks');
});