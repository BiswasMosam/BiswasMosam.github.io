/* ============================================================
   MOSAM BISWAS — PORTFOLIO v6 · EMBER FIELD
   Full-page WebGL fragment shader: domain-warped smoke in bone,
   vermilion embers on the ridges. Breathes with the page —
   strong in the hero, quiet mid-read, flaring at LET'S TALK.
   The field leans toward the cursor bubble. No libraries.
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('field');
  if (!canvas) return;
  if (prefersReduced) {
    canvas.remove();
    return;
  }

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });
  if (!gl) {
    canvas.remove();
    return;
  }

  const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;   /* canvas px, y-up */
uniform float uMspd;    /* smoothed cursor speed 0..1.2 */
uniform float uEnergy;  /* section energy + scroll velocity */
uniform float uBurst;   /* preloader ignition, decays */

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p = rot * p;
    amp *= 0.5;
  }
  return v;
}

void main() {
  float mn = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / mn;
  vec2 m = (uMouse - 0.5 * uRes) / mn;
  float t = uTime * 0.055;

  float md = length(p - m);
  float hand = exp(-md * md * 7.0) * (0.30 + uMspd * 0.9);

  /* Domain-warped smoke */
  vec2 q = vec2(fbm(p * 1.7 + t), fbm(p * 1.7 - t * 0.8 + 4.7));
  vec2 r = vec2(
    fbm(p * 1.7 + 2.3 * q + vec2(1.7, 9.2) + t * 0.55),
    fbm(p * 1.7 + 2.3 * q + vec2(8.3, 2.8) - t * 0.4)
  );
  r -= (p - m) * exp(-md * 2.6) * 0.4; /* the field leans toward the cursor */
  float f = fbm(p * 1.7 + 2.1 * r);

  float energy = uEnergy + uBurst + hand;

  vec3 base = vec3(0.043, 0.043, 0.040); /* #0b0b0a */
  vec3 col = base;

  /* Bone smoke */
  col += vec3(0.93, 0.92, 0.89) * (f * f * f) * 0.13 * (0.35 + 0.65 * energy);

  /* Vermilion embers on the ridges */
  float ridge = smoothstep(0.50, 0.86, f * (0.55 + 0.45 * q.x));
  col += vec3(1.0, 0.32, 0.15) * ridge * 0.42 * energy;

  /* Warm undertone in the folds */
  col += vec3(0.23, 0.08, 0.03) * (q.y * q.y) * 0.14 * energy;

  /* Vignette keeps the edges editorial-black */
  float vig = smoothstep(1.35, 0.30, length(p));
  col = mix(base, col, vig);

  /* Dither against banding */
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}`;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    canvas.remove();
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(program);

  /* Fullscreen triangle */
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uni = {
    res: gl.getUniformLocation(program, 'uRes'),
    time: gl.getUniformLocation(program, 'uTime'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    mspd: gl.getUniformLocation(program, 'uMspd'),
    energy: gl.getUniformLocation(program, 'uEnergy'),
    burst: gl.getUniformLocation(program, 'uBurst')
  };

  /* Render at reduced resolution — the field is soft by nature */
  let scale = 0.5 * Math.min(window.devicePixelRatio || 1, 1.5);

  const resize = () => {
    canvas.width = Math.max(Math.round(window.innerWidth * scale), 2);
    canvas.height = Math.max(Math.round(window.innerHeight * scale), 2);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  /* State */
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMX = mouseX;
  let targetMY = mouseY;
  let mspd = 0;
  let energy = 1.0;
  let burst = 0;
  let ignited = false;
  let velocity = 0;
  let lastY = window.scrollY;

  window.addEventListener('mousemove', (e) => {
    targetMX = e.clientX;
    targetMY = e.clientY;
  }, { passive: true });

  /* Adaptive quality: if frames run long, drop resolution once more */
  let frameCount = 0;
  let slowFrames = 0;
  let degraded = false;
  let lastNow = performance.now();
  const start = lastNow;

  const frame = (now) => {
    const dt = now - lastNow;
    lastNow = now;
    frameCount++;

    if (!degraded && frameCount > 90 && dt > 0 && dt < 500) {
      if (dt > 27) slowFrames++; else slowFrames = Math.max(slowFrames - 1, 0);
      if (slowFrames > 45) {
        degraded = true;
        scale *= 0.65;
        resize();
      }
    }

    /* Scroll energy: hero and contact glow, the middle stays quiet */
    const y = window.scrollY;
    const raw = y - lastY;
    lastY = y;
    velocity += (raw - velocity) * 0.1;

    const vh = window.innerHeight;
    const max = Math.max(document.documentElement.scrollHeight - vh, 1);
    const heroE = clamp(1 - y / (vh * 0.9), 0, 1);
    const tailE = clamp((y - (max - vh * 1.15)) / (vh * 0.85), 0, 1);
    const velE = Math.min(Math.abs(velocity) * 0.02, 0.5);
    const targetEnergy = 0.2 + 0.85 * Math.max(heroE, tailE) + velE;
    energy += (targetEnergy - energy) * 0.04;

    /* Ignition when the preloader lifts */
    if (!ignited && document.body.classList.contains('is-loaded')) {
      ignited = true;
      burst = 1.4;
    }
    burst *= 0.982;

    /* Cursor warmth */
    const prevX = mouseX;
    const prevY = mouseY;
    mouseX += (targetMX - mouseX) * 0.07;
    mouseY += (targetMY - mouseY) * 0.07;
    const moved = Math.hypot(mouseX - prevX, mouseY - prevY) / vh;
    mspd += (Math.min(moved * 30, 1.2) - mspd) * 0.06;

    gl.uniform2f(uni.res, canvas.width, canvas.height);
    gl.uniform1f(uni.time, (now - start) / 1000);
    gl.uniform2f(uni.mouse, mouseX * scale, canvas.height - mouseY * scale);
    gl.uniform1f(uni.mspd, mspd);
    gl.uniform1f(uni.energy, energy);
    gl.uniform1f(uni.burst, burst);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
})();
