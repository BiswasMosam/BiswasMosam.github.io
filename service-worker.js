/* Offline-first service worker for mosambiswas.com.

   The point of this worker is a room with no internet: the whole portfolio,
   including the resume, the certificates and the type it is set in, has to be
   on the phone before the network disappears. So the shell below is precached
   in full at install time rather than filled in as pages happen to be visited.

   Bump VERSION on every deploy. The name change is what evicts the old cache. */

const VERSION = 'v14';
const CACHE = `mosam-biswas-portfolio-${VERSION}`;

/* Everything needed to render all four pages with the network switched off.
   Precached atomically: if one entry is wrong the install fails loudly rather
   than leaving a half-usable app that only breaks once you are offline. */
const SHELL = [
  '/',
  '/index.html',
  '/resume.html',
  '/certificates.html',
  '/sheichobi/sheichobi.html',

  '/style.css',
  '/fonts.css',
  '/sheichobi/sheichobi.css',

  '/main.js',
  '/sw-register.js',
  '/motion.js',
  '/shader.js',
  '/cert-motion.js',
  '/sheichobi/sheichobi.js',
  '/sheichobi/darkroom.js',

  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/screenshots/wide-work.jpg',
  '/screenshots/narrow-work.jpg',
  '/profile.jpg',
  '/sheichobi/logos/favicon.svg',
  '/sheichobi/photos.json',

  '/MosamBiswasResume.pdf',
  '/MosamBiswasResume-BW.pdf',
  '/ResearchPaper.pdf',

  '/fonts/instrument-serif-400-italic-latin-ext.woff2',
  '/fonts/instrument-serif-400-italic-latin.woff2',
  '/fonts/manrope-400-latin-ext.woff2',
  '/fonts/manrope-400-latin.woff2',
  '/fonts/manrope-500-latin-ext.woff2',
  '/fonts/manrope-500-latin.woff2',
  '/fonts/manrope-600-latin-ext.woff2',
  '/fonts/manrope-600-latin.woff2',
  '/fonts/space-mono-400-latin-ext.woff2',
  '/fonts/space-mono-400-latin.woff2',
  '/fonts/syne-600-latin-ext.woff2',
  '/fonts/syne-600-latin.woff2',
  '/fonts/syne-700-latin-ext.woff2',
  '/fonts/syne-700-latin.woff2',
  '/fonts/syne-800-latin-ext.woff2',
  '/fonts/syne-800-latin.woff2'
];

/* Heavier images. Worth having offline, but never worth failing the install
   over, so these are added one at a time and allowed to fail. */
const MEDIA = [
  '/certificates/Internship-Sedna.png',
  '/certificates/SIH.png',
  '/certificates/cert1.png',
  '/certificates/cert2.png',
  '/certificates/cert3.png',
  '/certificates/cert4.png',
  '/certificates/cert5.png',
  '/certificates/cert6.png',
  '/certificates/cert7.png',
  '/certificates/research-photo.png',
  '/certificates/samsung-innovation-campus.png',

  '/sheichobi/Photographs/con8.webp',
  '/sheichobi/Photographs/mono2.webp',
  '/sheichobi/Photographs/port2.webp',
  '/sheichobi/Photographs/street1.webp',
  '/sheichobi/Photographs/wild5.webp'
];

/* Gallery thumbnails are read from photos.json instead of being listed here,
   so adding photographs to the gallery does not mean editing this file. The
   full size photographs are deliberately left out: they are roughly 40 MB and
   are cached individually as they are opened. */
const galleryThumbs = async () => {
  try {
    const res = await fetch('/sheichobi/photos.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const photos = await res.json();
    return photos.map((p) => '/sheichobi/' + p.replace('Photographs/', 'Photographs/thumbs/'));
  } catch {
    return [];
  }
};

const addAllSettled = (cache, urls) =>
  Promise.allSettled(urls.map((url) => cache.add(url)));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const thumbs = await galleryThumbs();
    await addAllSettled(cache, MEDIA.concat(thumbs));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Network first: the newest deploy wins whenever there is a network, and the
   cache is what is left when there is not. */
const networkFirst = async (request, isNavigation) => {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    /* An offline deep link to a page that was never cached still gets the
       portfolio rather than the browser's dinosaur. */
    if (isNavigation) {
      const home = await caches.match('/index.html');
      if (home) return home;
    }
    throw err;
  }
};

/* Cache first: fonts, images and PDFs do not change without a redeploy, and a
   redeploy changes the cache name. */
const cacheFirst = async (request) => {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200 && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const request = event.request;

  /* Leave the contact form's POST, and anything else that is not a plain GET,
     entirely alone. */
  if (request.method !== 'GET') return;

  /* Third party requests are none of this worker's business. */
  if (new URL(request.url).origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate' || request.destination === 'document';
  const isCode = request.destination === 'script' || request.destination === 'style';

  if (isNavigation || isCode) {
    event.respondWith(networkFirst(request, isNavigation));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
