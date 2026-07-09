<div align="center">

# MOSAM BISWAS<sup>©</sup>

`PORTFOLIO — VOL. 05` · `AI / ML — FULL-STACK — PHOTOGRAPHY` · `NAVI MUMBAI, IN`

**How [mosambiswas.com](https://www.mosambiswas.com) is built — the typography, the palette,<br/>the hand-rolled code, and the *bubbles*.**

[![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=ff5227&up_message=online&url=https%3A%2F%2Fwww.mosambiswas.com&style=flat-square)](https://www.mosambiswas.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-edebe4?style=flat-square)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/JS_dependencies-0kb-ff5227?style=flat-square)](#06--performance-pwa--care)

[🌐 Live](https://www.mosambiswas.com) · [📧 Contact](https://www.mosambiswas.com#contact) · [📸 SheiChobi](https://www.mosambiswas.com/sheichobi/sheichobi.html) · [📄 Tech doc (PDF)](Portfolio-Technical-Documentation.pdf)

</div>

---

## `(01) — OVERVIEW & STACK` — Zero *frameworks*

The whole site is three hand-written files — `index.html`, `style.css`, `main.js` — served as static pages. No build step, no bundler, no icon packs. Every interaction is written from scratch.

The only external dependency is Google Fonts. Everything else — the cursor, the reveals, the preloader, the parallax — is vanilla JavaScript inside a single IIFE with `'use strict'`, gated behind capability checks (`pointer: fine`, `prefers-reduced-motion`) so the site degrades gracefully on touch devices, slow connections, and with JavaScript disabled.

| | |
|---|---|
| `FRONTEND` | Pure HTML5, CSS3 (~1,450 lines), Vanilla JS (~450 lines) — no libraries |
| `HOSTING` | GitHub Pages + custom domain via CNAME (www.mosambiswas.com) |
| `PWA` | manifest.json + service worker: offline cache, SKIP_WAITING auto-update, reload on controllerchange |
| `SEO` | JSON-LD (WebSite + Person), Open Graph, Twitter cards, sitemap.xml, robots.txt, canonical URL |
| `A11Y` | Semantic HTML, skip-link, sr-only h1, focus-visible rings, reduced-motion support, no-JS fallback |
| `LICENSE` | MIT — open as a template for other portfolios |

```
BiswasMosam.github.io/
├── index.html          # one page, five sections, ASCII-art easter egg
├── style.css           # the whole design system
├── main.js             # preloader · cursor · reveals · parallax · clock
├── service-worker.js   # offline + silent updates
├── certificates.html   # certificate gallery + modal
└── sheichobi/          # photography portfolio ("that picture" in Bengali)
```

<div align="center">

**09** projects listed · **01** IEEE publication · **100** Lighthouse perf · **0kb** JS dependencies

</div>

---

## `(02) — TYPOGRAPHY` — Type is the *interface*

Four Google Fonts, each with a strict role. Display type is fitted **edge-to-edge by JavaScript**: `fitLines()` measures each hero word at 100px, then scales the font-size by the ratio of line width to word width — re-run on font load and debounced resize, so "MOSAM" and "BISWAS" always touch both margins.

| Typeface | Role | Details |
|---|---|---|
| **Syne 700–800** | `DISPLAY — HEADINGS, HERO, MARQUEE` | Uppercase, tracking −0.02em, line-height 0.92–1.05. The loud voice. |
| ***Instrument Serif*** | `ACCENT — EM WORDS, SECRET LAYERS` | Italic only, often in vermilion. Marks everything human or hidden. |
| **Manrope 400–600** | `BODY — PARAGRAPHS, FACTS, LEDES` | 1rem / 1.6 line-height, dimmed to 58% ink for long text. |
| `Space Mono` | `LABELS — .MONO UTILITY CLASS` | 0.72rem, uppercase, +0.14em tracking. Indexes, clocks, whispers. |

**Editorial devices** — Section headers follow a fixed grammar: a numbered mono label `(01) — Selected Work` above a Syne title where one word slips into *serif italic*. Nav links carry superscript counts (Work <sup>09</sup>), the second hero line renders as **outline text** via `-webkit-text-stroke` with a solid-color `@supports` fallback, and hairlines — 1px at 14% ink — rule every section like a printed spread.

---

## `(03) — COLOR & DESIGN SYSTEM` — Warm black, *one accent*

The palette is deliberately narrow: a warm near-black, a warm off-white, and a single vermilion. Everything in between is the same ink at reduced alpha — so the page reads like one material lit at different intensities, never a rainbow of grays.

| Swatch | Value | Token |
|---|---|---|
| ![#0b0b0a](https://img.shields.io/badge/-%20-0b0b0a?style=flat-square) | `#0b0b0a` | `--bg` |
| ![#131311](https://img.shields.io/badge/-%20-131311?style=flat-square) | `#131311` | `--bg-2` |
| ![#edebe4](https://img.shields.io/badge/-%20-edebe4?style=flat-square) | `#edebe4` | `--ink` |
| ![dim](https://img.shields.io/badge/-%20-8a8983?style=flat-square) | ink · 58% | `--ink-dim` |
| ![faint](https://img.shields.io/badge/-%20-55544f?style=flat-square) | ink · 34% | `--ink-faint` |
| ![#ff5227](https://img.shields.io/badge/-%20-ff5227?style=flat-square) | `#ff5227` | `--accent` |

```css
:root {
  --bg: #0b0b0a;  --bg-2: #131311;  --ink: #edebe4;
  --line: rgba(237, 235, 228, 0.14);      /* hairline grid */
  --accent: #ff5227;                      /* the only color */
  --pad: clamp(1.25rem, 4vw, 4rem);       /* fluid gutters */
  --ease: cubic-bezier(0.22, 1, 0.36, 1); /* one shared easing */
}
```

| | |
|---|---|
| `HAIRLINES` | 1px borders at 14% ink separate every section, row and fact — the "printed grid" feel |
| `FLUID SCALE` | Every size is a clamp() — hero name clamp(3.4rem, 15.5vw, 15rem), section titles clamp(2.4rem, 6vw, 4.6rem) |
| `ONE EASING` | A single expo-out curve (0.22, 1, 0.36, 1) drives reveals, hovers, menu, preloader — motion feels like one hand |
| `FILM GRAIN` | Fixed full-screen SVG feTurbulence noise (data-URI) at 4.5% opacity — analog texture, zero image requests |
| `BLEND MODES` | Header and cursor use mix-blend-mode: difference, staying legible over any background |
| `SELECTION` | ::selection inverts to vermilion — even highlighting text is on-brand; scrollbars hidden site-wide |

---

## `(04) — THE BUBBLES` — A cursor that *talks*

One 12px dot follows the pointer through a lerp loop (`x += (target − x) × 0.22`, per animation frame). It never stays a dot: it morphs into *whisper pills* and a *reading lens* depending on what — even which *word* — you hover.

### `MODE 1 — WHISPER`

Any element with a `data-whisper` attribute makes the dot stretch into an ink-colored caption pill with a Space Mono aside. It reacts to **separate words**: in "Developer, researcher, photographer" each word carries its own whisper (*"me, when a keyboard is in reach"*, *"me, when a question won't let go"*, *"me, when the light gets good"*). A `||` in the attribute separates variants that cycle on every re-hover. The pill drifts 26px above the pointer, flips below near the top edge, and clamps itself inside the viewport near the sides. Width is measured from the label + 36px.

### `MODE 2 — LENS`

Paragraphs marked `data-secret` hold two layers: the visible text and a hidden `.secret__layer` — the same thought rewritten candidly, in accent-orange Instrument Serif italic. Over these, the bubble becomes a 78px-radius transparent circle with a vermilion border, and the hidden layer is revealed through a per-frame `clip-path: circle(r at x y)` that tracks the cursor — a reading glass that shows what the page really thinks. Radius eases at 0.16/frame, so the lens breathes open and closed.

```js
/* one rAF loop drives everything */
x += (targetX - x) * 0.22;              // dot follows with inertia
pillOffY += (offTarget - pillOffY) * 0.2; // whisper drift (26px up, −34 near top)
lensR += (lensTargetR - lensR) * 0.16;    // lens radius easing → 78px
layer.style.clipPath = `circle(${lensR}px at ${x - rect.left}px ${y - rect.top}px)`;
```

Links grow the dot to a 52px halo in `mix-blend-mode: difference`; links with their own whisper show the pill instead. The whole system mounts only on fine pointers and switches off under `prefers-reduced-motion` — mobile falls back to the native cursor, nothing breaks.

---

## `(05) — TECHNIQUES & MICRO-INTERACTIONS` — Alive in the *details*

| | |
|---|---|
| `PRELOADER` | A counter eases 00 → 100 with cubic ease-out over 1s (rAF), then the curtain slides up with translateY(−100%) and the masked hero type reveals |
| `TYPE REVEAL` | Hero words sit at translateY(112%) inside overflow-hidden lines; loading flips them to 0 with a 0.12s stagger — the classic masked reveal, no library |
| `SCROLL REVEALS` | IntersectionObserver (threshold 0.12, −6% bottom margin) adds .is-in once per element; gated behind an html.js class so no-JS users see everything instantly |
| `WORK ROWS` | Hover inverts each row via a ::before that scaleY's from bottom, flipping text to background color while the index digit turns vermilion and the title slides 10px |
| `PROJECT PREVIEW` | A cursor-following card (lerp 0.12) shows a vertical strip of 9 gradient figures; hovering row n translates the strip by n × −100% — desktop only |
| `PARALLAX` | Images with data-parallax get translateY(offset × −speed) + scale(1.12) from a scroll-throttled rAF, skipping anything off-screen |
| `MARQUEE` | Pure CSS: a duplicated track animating translateX(−50%) over 36s — infinite skills ticker with zero JS |
| `LIVE CLOCK` | Intl.DateTimeFormat pinned to Asia/Kolkata ticks every second in header and footer — the site knows what time it is at home |
| `COPY EMAIL` | navigator.clipboard with an execCommand('copy') textarea fallback; the button flips to "Copied ✓" for 1.4s |
| `MENU` | Fullscreen overlay slides down with staggered per-link delays (0.10s → 0.34s); Escape closes, body scroll locks |
| `CERT MODAL` | Certificates open in a dimmed dialog (rgba(8,8,7,0.96)); close by ×, backdrop click, or Escape — the × rotates 90° on hover |
| `PORTRAIT` | About photo is sticky and grayscale(1); hovering restores color — a small reward for reading |

**Easter eggs** — A console signature greets anyone who opens DevTools (*"thanks for peeking under the hood"*), a giant ASCII-art portrait hides in an HTML comment at the end of index.html, the résumé whispers *"aka Janam Kundali"*, and the footer credit insists — correctly — that *"even this bubble is handmade."*

---

## `(06) — PERFORMANCE, PWA & CARE` — Fast by *subtraction*

| | |
|---|---|
| `ZERO DEPS` | No framework, no icon font, no analytics script — the only third-party bytes are four Google Fonts with preconnect hints |
| `GPU MOTION` | Every animation is transform/opacity only — reveals, marquee, parallax, cursor — so nothing forces layout or paint |
| `RAF DISCIPLINE` | Scroll and mousemove handlers are passive and coalesced into requestAnimationFrame; resize work is debounced |
| `IMAGES` | Photography ships as WebP with lazy loading + async decoding; previews are CSS gradients instead of images |
| `SERVICE WORKER` | Caches the shell for offline visits; new deploys post SKIP_WAITING and the page reloads once on controllerchange — updates are silent |
| `REDUCED MOTION` | prefers-reduced-motion collapses all animation to 0.01ms, kills the cursor and marquee, and shows content immediately |
| `NO-JS` | Reveal styles only apply under an html.js flag set by script — without JavaScript the site is simply… all visible |
| `RESULT` | 100 Lighthouse performance, sub-second loads, installable as a PWA |

---

## `(07) — RUN IT LOCALLY`

All you need is a browser — no dependencies, no build tools.

```bash
git clone https://github.com/BiswasMosam/BiswasMosam.github.io.git
cd BiswasMosam.github.io

# open directly, or serve:
python -m http.server 8000   # → http://localhost:8000
```

Contributions and issues are welcome — fork, branch, PR. Licensed under **MIT**; feel free to use this as inspiration or a template for your own portfolio.

---

<div align="center">

## `(—) COLOPHON` — LET'S *talk*

**[mosambiswas999@gmail.com](mailto:mosambiswas999@gmail.com)**

`GITHUB` [BiswasMosam](https://github.com/BiswasMosam) · `LINKEDIN` [mosambiswas](https://linkedin.com/in/mosambiswas) · `INSTAGRAM` [mosam.999](https://www.instagram.com/mosam.999) · `G.DEV` [MosamBiswas](https://g.dev/MosamBiswas)

`© 2026 MOSAM BISWAS` — `DESIGNED & BUILT BY HAND`

</div>
