/* Service worker registration.

   Production origins only. Anywhere else (a dev server, or a domain that has
   since lapsed) any worker that was registered before is torn down and its
   caches deleted, so a dead origin can never keep serving a stale copy of the
   site. That eviction is what emptied the old mosambiswas.me app.

   localhost is treated as production so the offline behaviour can actually be
   tested before it ships. */

(() => {
  if (!('serviceWorker' in navigator)) return;

  const host = location.hostname;
  const isProduction = /(^|\.)mosambiswas\.com$/.test(host);
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  if (!isProduction && !isLocal) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((reg) => reg.unregister()))
      .catch(() => {});
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
      .then((registration) => {
        registration.update();

        const notifyUpdate = () => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        };

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate();
            }
          });
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          notifyUpdate();
        }
      })
      .catch(() => {});

    /* Reload only when a new worker replaces an old one, so the page picks
       up the new files. On a first visit there is nothing stale to replace,
       and a reload there only interrupts the page (and lost the easter-egg
       claim links, /?curl and friends, for first-time visitors). */
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    });
  });
})();
