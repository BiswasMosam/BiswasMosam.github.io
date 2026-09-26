/* /cv/ in a browser: turn the terminal résumé back into a page.

   The page's own bytes are the résumé with ANSI colour codes (see cv.css for
   why). This reads them out of <pre id="cv">, keeps the colours as classes,
   links the URLs, fits the 78 columns to the window, and adds a bar that
   says how to get the same thing in a terminal. Vanilla, no libraries. */

(() => {
  'use strict';

  const pre = document.getElementById('cv');
  if (!pre) return;

  const COMMAND = 'curl -L mosambiswas.com/cv';

  /* The escape sequence that hides the HTML from terminals leaves its opener
     behind as a loose text node in <body>. */
  [...document.body.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  });

  const raw = pre.textContent
    .replace(/\x1b\][^\x07]*\x07/g, '')
    .replace(/\x07/g, '')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '');

  /* ---- colour codes to classes ---- */

  /* xterm's 256 colour palette, for any code beyond the two the résumé uses
     (202 is the site's vermilion, 245 its dim ink, both mapped in cv.css). */
  const xterm = (n) => {
    const basic = ['#000', '#cd3131', '#0dbc79', '#e5e510', '#2472c8', '#bc3fbc', '#11a8cd', '#e5e5e5',
      '#666', '#f14c4c', '#23d18b', '#f5f543', '#3b8eea', '#d670d6', '#29b8db', '#fff'];
    if (n < 16) return basic[n];
    if (n > 231) {
      const v = 8 + (n - 232) * 10;
      return `rgb(${v},${v},${v})`;
    }
    const i = n - 16;
    const level = (x) => (x ? 55 + x * 40 : 0);
    return `rgb(${level(Math.floor(i / 36))},${level(Math.floor(i / 6) % 6)},${level(i % 6)})`;
  };

  let bold = false;
  let fg = null;

  const apply = (params) => {
    const codes = params === '' ? [0] : params.split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) { bold = false; fg = null; }
      else if (c === 1) bold = true;
      else if (c === 22) bold = false;
      else if (c === 39) fg = null;
      else if (c >= 30 && c <= 37) fg = c - 30;
      else if (c >= 90 && c <= 97) fg = c - 90 + 8;
      else if (c === 38 && codes[i + 1] === 5) { fg = codes[i + 2]; i += 2; }
      else if (c === 38 && codes[i + 1] === 2) { fg = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`; i += 4; }
    }
  };

  const LINK = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

  const span = (text) => {
    const el = document.createElement('span');
    if (bold) el.classList.add('b');
    if (fg === 202 || fg === 245) el.classList.add('c' + fg);
    else if (typeof fg === 'number') el.style.color = xterm(fg);
    else if (fg) el.style.color = fg;

    /* Links keep the colour of the text they sit in. */
    let last = 0;
    text.replace(LINK, (match, _g, at) => {
      el.append(text.slice(last, at));
      const a = document.createElement('a');
      a.href = match.includes('@') && !match.startsWith('http') ? 'mailto:' + match : match;
      if (a.href.startsWith('http') && !a.href.includes('mosambiswas.com')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.textContent = match;
      el.append(a);
      last = at + match.length;
      return match;
    });
    el.append(text.slice(last));
    return el;
  };

  const SGR = /\x1b\[([0-9;]*)m/g;
  const text = document.createElement('div');
  text.id = 'cv';

  raw.split('\n').forEach((row) => {
    const line = document.createElement('div');
    line.className = row.includes('█') ? 'l fig' : 'l';
    let last = 0;
    let m;
    SGR.lastIndex = 0;
    while ((m = SGR.exec(row))) {
      if (m.index > last) line.append(span(row.slice(last, m.index)));
      apply(m[1]);
      last = SGR.lastIndex;
    }
    if (last < row.length) line.append(span(row.slice(last)));
    text.append(line);
  });

  const prompt = document.createElement('div');
  prompt.className = 'l';
  prompt.innerHTML = '\n<span class="c202">~ $</span> <span class="prompt"></span>';
  text.append(prompt);

  /* ---- the bar ---- */

  const bar = document.createElement('header');
  bar.className = 'cv-bar';

  const home = document.createElement('a');
  home.href = '/';
  home.textContent = 'Mosam Biswas · résumé, terminal edition';

  const right = document.createElement('div');
  right.className = 'cv-bar__right';

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'cv-copy';
  copy.title = 'Copy, then paste it into a terminal';
  const setLabel = (done) => {
    copy.textContent = '';
    const b = document.createElement('b');
    b.textContent = '$ ';
    copy.append(b, done ? 'copied, now paste it in a terminal' : COMMAND);
  };
  setLabel(false);
  copy.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(COMMAND).then(() => {
      setLabel(true);
      setTimeout(() => setLabel(false), 1800);
    }).catch(() => {});
  });

  const full = document.createElement('a');
  full.href = '/resume.html';
  full.textContent = 'The designed one ↗';

  right.append(copy, full);
  bar.append(home, right);

  const wrap = document.createElement('main');
  wrap.className = 'cv-text';
  wrap.append(text);

  pre.replaceWith(bar, wrap);

  /* ---- fit 78 columns to the window ---- */

  /* Measured on a throwaway span each time: left in the page, a 78 column
     line at 100px would widen the document and scroll it sideways. */
  const fit = () => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:pre;font-size:100px';
    probe.textContent = 'M'.repeat(78);
    text.append(probe);
    const at100 = probe.getBoundingClientRect().width;
    probe.remove();
    const room = wrap.clientWidth - parseFloat(getComputedStyle(wrap).paddingLeft) * 2;
    if (!at100) return;
    text.style.fontSize = Math.max(7, Math.min(15, (room / at100) * 100)) + 'px';
  };
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts) document.fonts.ready.then(fit);

  document.documentElement.classList.add('cv-ready');
})();
