/* Easter egg tracker, shared by every page on www.mosambiswas.com, the
   project pages under it included (PixelShift, Fill.ai): they are the same
   origin, so they share this browser's localStorage.

     window.eggs.find(id)      mark an egg found; the first time, a small
                               note says which one and how many are left
     window.eggs.found()       { id: when } for everything found so far
     window.eggs.reset()       forget them all (the /help page offers this)
     window.eggs.contextMenu() replace the right-click menu with ours

   The list below is the whole collection, in the order /help shows it.
   Adding an egg means adding it here and on /help. Styles are injected so
   the note looks the same on any page, whatever that page's own CSS is.
   Vanilla, no libraries. */

(() => {
  'use strict';

  const EGGS = [
    ['konami', 'The Konami code'],
    ['whisper', 'The bubble whispers'],
    ['lens', 'The lens'],
    ['sleep', 'The bubble falls asleep'],
    ['words', 'Type a word'],
    ['rightclick', 'Right-click'],
    ['console', 'A note in the console'],
    ['print', 'Print the homepage'],
    ['source', 'A portrait in the source'],
    ['humans', 'humans.txt'],
    ['lost', 'A terminal on the 404'],
    ['bots', 'Bots get answers'],
    ['safelight', 'The darkroom safelight'],
    ['rgb', 'PixelShift, split'],
    ['fillai', 'Fill.ai, once more'],
    ['curl', 'The résumé, by curl']
  ];
  const KEY = 'mb:eggs';

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  };

  const write = (found) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(found));
    } catch (e) { /* private mode: the game just doesn't keep score */ }
  };

  /* ---------- styles for the note and the menu ---------- */

  const css = `
    .mb-egg { position: fixed; right: 16px; bottom: 16px; z-index: 2147483000; display: flex; flex-direction: column;
      gap: 4px; min-width: 230px; max-width: calc(100vw - 32px); padding: 14px 16px 13px; background: #0b0b0a; color: #edebe4;
      border: 1px solid #ff5227; font: 500 15px/1.35 Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif;
      opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1); }
    .mb-egg.is-on { opacity: 1; transform: none; pointer-events: auto; }
    .mb-egg__k { font: 400 11px/1.3 'Space Mono', ui-monospace, Menlo, Consolas, monospace; letter-spacing: .12em;
      text-transform: uppercase; color: #ff5227; }
    .mb-egg strong { font-weight: 700; }
    .mb-egg a { margin-top: 4px; color: rgba(237,235,228,.62); font-size: 13px; text-decoration: none; }
    .mb-egg a:hover { color: #edebe4; }
    .mb-menu { position: fixed; z-index: 2147483001; min-width: 220px; padding: 6px 0; background: #0b0b0a; color: #edebe4;
      border: 1px solid rgba(237,235,228,.18); box-shadow: 0 18px 40px rgba(0,0,0,.45);
      font: 500 14px/1.3 Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif; }
    .mb-menu[hidden] { display: none; }
    .mb-menu__hd { padding: 8px 14px 9px; margin-bottom: 4px; border-bottom: 1px solid rgba(237,235,228,.12);
      font: 400 11px/1.3 'Space Mono', ui-monospace, Menlo, Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; color: #ff5227; }
    .mb-menu__it { display: flex; justify-content: space-between; gap: 18px; width: 100%; padding: 8px 14px; color: inherit;
      background: none; border: 0; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
    .mb-menu__it span { color: rgba(237,235,228,.45); font-size: 12px; }
    .mb-menu__it:hover, .mb-menu__it:focus-visible { outline: none; background: #ff5227; color: #0b0b0a; }
    .mb-menu__it:hover span, .mb-menu__it:focus-visible span { color: #0b0b0a; }
    @media print { .mb-egg, .mb-menu { display: none !important; } }
  `;
  let styled = false;
  const style = () => {
    if (styled) return;
    styled = true;
    const el = document.createElement('style');
    el.textContent = css;
    document.head.append(el);
  };

  /* ---------- the "egg found" note ---------- */

  let note = null;
  let noteTimer = 0;

  const announce = (id) => {
    const at = EGGS.findIndex(([key]) => key === id);
    const count = Object.keys(read()).length;
    style();
    if (!note) {
      note = document.createElement('div');
      note.className = 'mb-egg';
      note.setAttribute('role', 'status');
      document.body.append(note);
    }
    note.textContent = '';
    const k = document.createElement('span');
    k.className = 'mb-egg__k';
    k.textContent = `Easter egg found · ${String(count).padStart(2, '0')} / ${EGGS.length}`;
    const name = document.createElement('strong');
    name.textContent = at >= 0 ? EGGS[at][1] : id;
    note.append(k, name);
    if (!location.pathname.startsWith('/help')) {
      const link = document.createElement('a');
      link.href = '/help/';
      link.textContent = count === EGGS.length ? 'That is all of them. Take a bow →' : 'See how many are left →';
      note.append(link);
    }
    note.classList.remove('is-on');
    void note.offsetWidth;
    note.classList.add('is-on');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => note.classList.remove('is-on'), 5500);
  };

  const find = (id) => {
    if (!EGGS.some(([key]) => key === id)) return false;
    const found = read();
    if (found[id]) return false;
    found[id] = new Date().toISOString();
    write(found);
    window.dispatchEvent(new CustomEvent('egg:found', { detail: { id } }));
    if (document.body) announce(id);
    else document.addEventListener('DOMContentLoaded', () => announce(id), { once: true });
    return true;
  };

  const reset = () => {
    write({});
    window.dispatchEvent(new CustomEvent('egg:found', { detail: { id: null } }));
  };

  /* ---------- a right-click menu of our own ---------- */

  const contextMenu = () => {
    let menu = null;
    let openedAt = 0;

    const close = () => {
      if (menu) menu.hidden = true;
    };

    const build = () => {
      style();
      menu = document.createElement('div');
      menu.className = 'mb-menu';
      menu.setAttribute('role', 'menu');
      menu.hidden = true;
      menu.innerHTML = `
        <p class="mb-menu__hd">Nice try.</p>
        <a class="mb-menu__it" role="menuitem" href="https://github.com/BiswasMosam/BiswasMosam.github.io" target="_blank" rel="noopener noreferrer">View the source <span>↗</span></a>
        <a class="mb-menu__it" role="menuitem" href="/humans.txt">Credits <span>humans.txt</span></a>
        <button class="mb-menu__it" role="menuitem" type="button" data-copy>Copy my email <span>@</span></button>
        <a class="mb-menu__it" role="menuitem" href="/help/">Easter eggs <span>${Object.keys(read()).length} / ${EGGS.length}</span></a>`;
      document.body.append(menu);

      menu.querySelector('[data-copy]').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const done = (text) => {
          btn.firstChild.textContent = text + ' ';
          setTimeout(close, 700);
          setTimeout(() => { btn.firstChild.textContent = 'Copy my email '; }, 900);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText('mosambiswas999@gmail.com').then(() => done('Copied'), () => done('mosambiswas999@gmail.com'));
        } else {
          done('mosambiswas999@gmail.com');
        }
      });

      menu.addEventListener('keydown', (e) => {
        const items = [...menu.querySelectorAll('.mb-menu__it')];
        const at = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const next = (at + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
          items[next].focus();
        } else if (e.key === 'Escape' || e.key === 'Tab') {
          close();
        }
      });
    };

    document.addEventListener('contextmenu', (e) => {
      /* Text fields keep the real menu: paste, spelling, the lot. */
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      if (!menu) build();
      const count = menu.querySelector('a[href="/help/"] span');
      count.textContent = `${Object.keys(read()).length} / ${EGGS.length}`;
      menu.hidden = false;
      openedAt = window.scrollY;
      const w = menu.offsetWidth;
      const h = menu.offsetHeight;
      menu.style.left = Math.min(e.clientX, window.innerWidth - w - 8) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - h - 8) + 'px';
      menu.querySelector('.mb-menu__it').focus({ preventScroll: true });
      find('rightclick');
      count.textContent = `${Object.keys(read()).length} / ${EGGS.length}`;
    });

    document.addEventListener('pointerdown', (e) => {
      if (menu && !menu.hidden && !menu.contains(e.target)) close();
    });
    /* A real scroll closes it; the tail of a smooth scroll still settling
       when the menu opens doesn't. */
    window.addEventListener('scroll', () => {
      if (menu && !menu.hidden && Math.abs(window.scrollY - openedAt) > 40) close();
    }, { passive: true });
    window.addEventListener('resize', close);
    window.addEventListener('blur', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };

  window.eggs = {
    list: EGGS.map(([id, name]) => ({ id, name })),
    found: read,
    find,
    reset,
    contextMenu
  };
})();
