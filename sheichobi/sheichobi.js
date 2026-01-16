// All photos collection - will be loaded from photos.json
let allPhotos = [];

// Categorize photos by orientation
const horizontalPhotos = [];
const verticalPhotos = [];

// Fallback photos if JSON fails to load
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

// Load photos from JSON file
async function loadPhotoList() {
  try {
    const response = await fetch('photos.json');
    if (response.ok) {
      allPhotos = await response.json();
      console.log(`Loaded ${allPhotos.length} photos from photos.json`);
    } else {
      throw new Error('Failed to load photos.json');
    }
  } catch (error) {
    console.warn('Could not load photos.json, using fallback list:', error);
    allPhotos = fallbackPhotos;
  }
  categorizeImages();
}

// Function to check if image is horizontal or vertical
function categorizeImages() {
  let loadedCount = 0;
  const totalImages = allPhotos.length;

  allPhotos.forEach(photoSrc => {
    const img = new Image();
    img.onload = function() {
      if (this.width >= this.height) {
        horizontalPhotos.push(photoSrc);
      } else {
        verticalPhotos.push(photoSrc);
      }
      
      loadedCount++;
      if (loadedCount === totalImages) {
        initializeMarquees();
      }
    };
    img.onerror = function() {
      loadedCount++;
      if (loadedCount === totalImages) {
        initializeMarquees();
      }
    };
    img.src = photoSrc;
  });
}

// Initialize all marquee sections
function initializeMarquees() {
  // Distribute horizontal photos across 3 marquees
  const horizontalSet1 = horizontalPhotos.filter((_, i) => i % 3 === 0);
  const horizontalSet2 = horizontalPhotos.filter((_, i) => i % 3 === 1);
  const horizontalSet3 = horizontalPhotos.filter((_, i) => i % 3 === 2);

  createMarquee('marquee-1', horizontalSet1.length > 0 ? horizontalSet1 : allPhotos.slice(0, 10));
  createMarquee('marquee-2', horizontalSet2.length > 0 ? horizontalSet2 : allPhotos.slice(10, 20));
  createMarquee('marquee-3', horizontalSet3.length > 0 ? horizontalSet3 : allPhotos.slice(20, 30));
  createMarquee('marquee-vertical', verticalPhotos.length > 0 ? verticalPhotos : allPhotos.slice(0, 10));
}

// Create marquee content
function createMarquee(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Duplicate the photos array to create seamless loop
  const extendedPhotos = [...photos, ...photos];

  extendedPhotos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'marquee-item';
    item.innerHTML = `<img src="${photo}" alt="Photo ${index + 1}" loading="lazy">`;
    item.onclick = function() {
      openModal(item.querySelector('img'));
    };
    container.appendChild(item);
  });
}

// Modal functions
function openModal(img) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');

  modalImg.src = img.src;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event.target.classList.contains('modal') || event.target.classList.contains('close-modal')) {
    document.getElementById('photoModal').classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('photoModal');
  if (modal.classList.contains('active') && e.key === 'Escape') {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Pause marquee on hover
document.addEventListener('DOMContentLoaded', function() {
  // Load photos and start
  loadPhotoList();

  // Add hover pause functionality to all marquee containers
  const marqueeContainers = document.querySelectorAll('.marquee-container');
  marqueeContainers.forEach(container => {
    container.addEventListener('mouseenter', function() {
      const track = this.querySelector('.marquee-track');
      if (track) {
        track.style.animationPlayState = 'paused';
      }
    });

    container.addEventListener('mouseleave', function() {
      const track = this.querySelector('.marquee-track');
      if (track) {
        track.style.animationPlayState = 'running';
      }
    });
  });
});