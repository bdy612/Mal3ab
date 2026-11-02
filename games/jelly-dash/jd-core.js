// Jelly Dash (سباق الجيلي) — core: helpers, sound, the 3D world, jellies and their wobbly physics
'use strict';

// ------------------------------------------------------------------ helpers
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const TAU = Math.PI * 2;
const damp = (k, dt) => 1 - Math.exp(-k * dt);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
function mulberry(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hashStr = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const hash01 = (n) => { let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const iso = (n) => '⁨' + n + '⁩';   // a name inside a sentence keeps its own direction
const uid = () => Math.random().toString(36).slice(2, 10);

// ------------------------------------------------------------------ saved data (jelly-dash-*)
const store = {
  get(k, d) { try { const v = localStorage.getItem('jelly-dash-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('jelly-dash-' + k, JSON.stringify(v)); } catch (e) {} }
};
const SET = Object.assign({ snd: 1, mus: 1, sens: 1, diff: 1, len: 4, field: 12, pdiff: 1, q: 1 }, store.get('settings', {}) || {});
const saveSet = () => store.set('settings', SET);
const STATS = Object.assign({ crowns: 0, shows: 0, rounds: 0, quals: 0, finals: 0, falls: 0, best: {} }, store.get('stats', {}) || {});
if (!STATS.best || typeof STATS.best !== 'object') STATS.best = {};
const saveStats = () => store.set('stats', STATS);
const LOOK = Object.assign({ c: 0, k: 1 }, store.get('look', {}) || {});

// candy colours and costumes
const COLORS = [0xff5d8f, 0xffa23a, 0xffd93d, 0x8bd450, 0x3ddbb0, 0x4cc9f0, 0x5b7cfa, 0x9b6bff, 0xf15bb5, 0xff7070, 0xfff0cf, 0xa0704f];
const COLOR_KEYS = ['strawberry', 'tangerine', 'lemon', 'lime', 'mint', 'sky', 'blueberry', 'grape', 'bubblegum', 'watermelon', 'vanilla', 'cocoa'];
const COSTUMES = [
  { k: 'none' }, { k: 'party' }, { k: 'bow' }, { k: 'antenna' }, { k: 'cat' },
  { k: 'chef', need: ['quals', 5] }, { k: 'sprout', need: ['shows', 3] }, { k: 'bunny', need: ['quals', 12] },
  { k: 'prop', need: ['crowns', 1] }, { k: 'phones', need: ['finals', 3] }, { k: 'tophat', need: ['crowns', 3] }, { k: 'halo', need: ['crowns', 6] }
];
const unlocked = (i) => { const c = COSTUMES[i]; if (!c) return false; const n = c.need; return !n || (STATS[n[0]] | 0) >= n[1]; };
const hexs = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0');
function shadeC(n, k) {   // k < 0 darker, k > 0 lighter
  let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

// ------------------------------------------------------------------ sound (WebAudio synth)
const Snd = (() => {
  let ctx = null, master = null, sfx = null, musG = null, noiseBuf = null, musTimer = null, musMode = '', nextT = 0, step = 0;
  const last = {};
  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
        sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(master);
        musG = ctx.createGain(); musG.gain.value = 0; musG.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f0, f1, dur, type, vol, delay, dest) {
    const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, f0, f1, delay, dest, type) {
    const t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type || 'lowpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfx); s.start(t); s.stop(t + dur + 0.05);
  }
  const arp = (ns, gap, type, vol, len) => ns.forEach((f, i) => tone(f, f, len || 0.22, type || 'triangle', vol || 0.16, i * gap));
  const S = {
    jump: () => tone(290, 640, 0.15, 'sine', 0.2),
    land: () => { noise(0.1, 0.16, 700, 160); tone(160, 90, 0.09, 'sine', 0.14); },
    dive: () => { noise(0.24, 0.13, 2400, 500, 0, null, 'bandpass'); tone(520, 240, 0.2, 'triangle', 0.08); },
    grab: () => tone(680, 920, 0.07, 'square', 0.06),
    steal: () => { tone(620, 1240, 0.12, 'triangle', 0.18); tone(930, 1560, 0.14, 'triangle', 0.14, 0.08); },
    bonk: () => { tone(190, 60, 0.28, 'sine', 0.34); tone(1000, 1500, 0.07, 'square', 0.05); noise(0.12, 0.12, 900, 200); },
    boing: () => { tone(180, 760, 0.26, 'sine', 0.22); tone(360, 1200, 0.2, 'triangle', 0.06, 0.03); },
    bump: () => tone(240, 170, 0.08, 'sine', 0.1),
    tick: () => tone(660, 660, 0.13, 'square', 0.1),
    go: () => { tone(880, 880, 0.4, 'square', 0.12); tone(1320, 1320, 0.4, 'triangle', 0.1); },
    qual: () => arp([523, 659, 784, 1047, 1319], 0.08, 'triangle', 0.16, 0.3),
    elim: () => arp([392, 330, 262, 196], 0.16, 'sawtooth', 0.07, 0.34),
    crown: () => { arp([523, 659, 784, 1047], 0.11, 'square', 0.08, 0.3); arp([784, 988, 1175, 1568], 0.11, 'triangle', 0.12, 0.42); tone(1568, 1568, 0.9, 'triangle', 0.1, 0.5); },
    tile: () => { noise(0.16, 0.1, 500, 140); tone(230, 120, 0.12, 'triangle', 0.06); },
    splash: () => { noise(0.45, 0.24, 1400, 160); tone(300, 90, 0.4, 'sine', 0.12); },
    fall: () => tone(760, 140, 0.65, 'sine', 0.16),
    ui: () => tone(520, 720, 0.06, 'triangle', 0.12),
    pop: () => tone(420, 940, 0.08, 'sine', 0.18),
    respawn: () => { tone(400, 800, 0.18, 'sine', 0.14); tone(800, 1200, 0.15, 'sine', 0.08, 0.1); },
    whistle: () => { tone(1800, 2200, 0.14, 'sine', 0.12); tone(2200, 1700, 0.25, 'sine', 0.12, 0.14); }
  };
  // a tiny bouncy music loop (bass + plucks + hats)
  const PROG = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
  function musTick() {
    if (!ctx || !musMode) return;
    const spb = musMode === 'play' ? 60 / 132 / 2 : 60 / 100 / 2;
    while (nextT < ctx.currentTime + 0.25) {
      const bar = (step >> 3) % 4, s8 = step % 8, ch = PROG[bar], t0 = nextT - ctx.currentTime;
      if (t0 >= -0.02) {
        const d = Math.max(0, t0);
        if (s8 % 4 === 0) tone(ch[0] / 2, ch[0] / 2, 0.28, 'triangle', 0.22, d, musG);
        if (s8 % 4 === 2) tone(ch[0] / 2 * 1.5, ch[0] / 2 * 1.5, 0.18, 'triangle', 0.14, d, musG);
        if (musMode === 'play' || s8 % 2 === 0) { const nn = ch[(step * 7 + bar) % 3] * (s8 > 4 ? 2 : 1); if ((step * 5 + bar * 3) % 3 !== 1) tone(nn, nn, 0.12, 'square', 0.035, d, musG); }
        if (musMode === 'play' && s8 % 2 === 1) noise(0.04, 0.05, 9000, 6000, d, musG, 'highpass');
      }
      nextT += spb; step++;
    }
  }
  return {
    ensure,
    play(n, vol) {
      if (!SET.snd || !ensure() || !S[n]) return;
      const now = performance.now(); if (last[n] && now - last[n] < 45) return; last[n] = now;
      if (vol != null && vol < 0.999) { const prev = sfx.gain.value; sfx.gain.value = Math.max(0.05, vol); try { S[n](); } catch (e) {} sfx.gain.value = prev; return; }
      try { S[n](); } catch (e) {}
    },
    music(mode) {
      if (!SET.mus || !SET.snd) mode = '';
      if (mode === musMode) return;
      musMode = mode;
      if (!mode) { if (musG && ctx) musG.gain.setTargetAtTime(0, ctx.currentTime, 0.2); return; }
      if (!ensure()) return;
      musG.gain.setTargetAtTime(mode === 'play' ? 0.42 : 0.3, ctx.currentTime, 0.4);
      nextT = ctx.currentTime + 0.05;
      if (!musTimer) musTimer = setInterval(musTick, 90);
    },
    get mode() { return musMode; }
  };
})();

// ------------------------------------------------------------------ renderer + shared art
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(0xbfe3ff);
const QUAL = { pr: Math.min(window.devicePixelRatio || 1, 1.6), floor: 0.7 };

function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (rep !== false) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return t;
}
const TEX = {};
function patTex(pat, c1, c2) {
  const key = pat + c1 + '_' + c2; if (TEX[key]) return TEX[key];
  const A = hexs(c1), Bc = hexs(c2);
  let t;
  if (pat === 'tile') t = canvasTex(128, 128, (g) => {
    g.fillStyle = A; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(6, 6, 116, 116);
    g.strokeStyle = Bc; g.globalAlpha = 0.55; g.lineWidth = 5; g.strokeRect(3, 3, 122, 122);
    g.globalAlpha = 0.18; g.fillStyle = Bc; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(30 + i * 34, 30 + (i % 2) * 60, 7, 0, TAU); g.fill(); }
  });
  else if (pat === 'stripe') t = canvasTex(64, 64, (g) => {
    g.fillStyle = A; g.fillRect(0, 0, 64, 64); g.fillStyle = Bc;
    for (let i = -64; i < 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 0); g.lineTo(i + 16 - 64, 64); g.lineTo(i - 64, 64); g.closePath(); g.fill(); }
  });
  else if (pat === 'dots') t = canvasTex(64, 64, (g) => {
    g.fillStyle = A; g.fillRect(0, 0, 64, 64); g.fillStyle = Bc;
    for (const [x, y] of [[16, 16], [48, 48], [48, 16], [16, 48]]) { g.beginPath(); g.arc(x, y, (x + y) % 32 ? 5 : 8, 0, TAU); g.fill(); }
  });
  else if (pat === 'check') t = canvasTex(64, 64, (g) => { g.fillStyle = A; g.fillRect(0, 0, 64, 64); g.fillStyle = Bc; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); });
  else if (pat === 'ring') t = canvasTex(128, 128, (g) => {
    g.fillStyle = A; g.fillRect(0, 0, 128, 128); g.strokeStyle = Bc; g.lineWidth = 10;
    for (let r = 14; r < 90; r += 26) { g.beginPath(); g.arc(64, 64, r, 0, TAU); g.stroke(); }
  }, false);
  else if (pat === 'swirl') t = canvasTex(128, 128, (g) => {
    g.fillStyle = A; g.fillRect(0, 0, 128, 128); g.strokeStyle = Bc; g.lineWidth = 12; g.beginPath();
    for (let a = 0; a < TAU * 3.2; a += 0.1) { const r = a * 6.2; const x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }, false);
  else t = canvasTex(8, 8, (g) => { g.fillStyle = A; g.fillRect(0, 0, 8, 8); });
  return (TEX[key] = t);
}
const MATS = {};
function candyMat(c, pat, c2, shiny) {
  const key = c + '|' + (pat || '') + '|' + (c2 || 0) + '|' + (shiny ? 1 : 0); if (MATS[key]) return MATS[key];
  const o = pat ? { map: patTex(pat, c, c2 == null ? shadeC(c, 0.35) : c2) } : { color: c };
  return (MATS[key] = shiny ? new THREE.MeshPhongMaterial(Object.assign({ shininess: 60, specular: 0x555555 }, o)) : new THREE.MeshLambertMaterial(o));
}
// world-sized UVs on boxes / cylinders, so patterns keep their size on long pieces
function boxGeo(w, h, d, ts) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, s = 1 / (ts || 2);
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] * s, uv.getY(k) * dims[f][1] * s); }
  return g;
}
function cylGeo(r, h, seg, ts, r2) {
  const g = new THREE.CylinderGeometry(r, r2 == null ? r : r2, h, seg || 24, 1), uv = g.attributes.uv, s = 1 / (ts || 2), torso = (seg + 1) * 2;
  for (let k = 0; k < uv.count; k++) {
    if (k < torso) uv.setXY(k, uv.getX(k) * Math.max(1, Math.round(TAU * r * s)), uv.getY(k) * Math.max(0.5, h * s));
    else uv.setXY(k, (uv.getX(k) - 0.5) * 2 * r * s, (uv.getY(k) - 0.5) * 2 * r * s);
  }
  return g;
}

// sky dome, candy sea, lights — one set per scene
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(0x5cb8ff) }, mid: { value: new THREE.Color(0xcde9ff) }, bot: { value: new THREE.Color(0xffc1e3) } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, bot, smoothstep(0.0, -0.25, h)); gl_FragColor = vec4(c, 1.0); }'
});
const skyGeo = new THREE.SphereGeometry(420, 24, 14);
const cloudGeo = new THREE.SphereGeometry(1, 12, 8);
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x555566 });
function dressScene(scene, seed, focus) {
  scene.fog = new THREE.Fog(0xd8e6ff, 80, 300);
  const sky = new THREE.Mesh(skyGeo, skyMat); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky); scene.userData.sky = sky;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshLambertMaterial({ map: (() => { const t = patTex('dots', 0xff9fd2, 0xffc7e6); t.repeat.set(160, 160); return t; })() }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -46; scene.add(sea);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffb8dc, 0.82));
  const sun = new THREE.DirectionalLight(0xffffff, 0.78); sun.position.set(18, 40, -10); sun.castShadow = true;
  const sm = SET.q ? 2048 : 1024; sun.shadow.mapSize.set(sm, sm);
  const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 140; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
  scene.add(sun); scene.add(sun.target); scene.userData.sun = sun;
  // puffy clouds around
  const r = mulberry(seed || 7), f = focus || { x: 0, z: 60, span: 120 };
  for (let i = 0; i < 16; i++) {
    const grp = new THREE.Group(), n = 3 + (r() * 3 | 0);
    for (let k = 0; k < n; k++) { const m = new THREE.Mesh(cloudGeo, cloudMat); const s = 3 + r() * 4; m.scale.set(s * 1.3, s * 0.8, s); m.position.set((k - n / 2) * 4.2, r() * 2, r() * 3); grp.add(m); }
    const side = r() < 0.5 ? -1 : 1, low = r() < 0.4;
    grp.position.set(f.x + side * (45 + r() * 90), low ? -28 - r() * 8 : 18 + r() * 40, f.z + (r() - 0.5) * (f.span + 160));
    grp.rotation.y = r() * TAU; scene.add(grp);
  }
  return sun;
}

// ------------------------------------------------------------------ jelly model
const JG = {
  body: new THREE.CapsuleGeometry(0.44, 0.52, 6, 18), eye: new THREE.SphereGeometry(0.15, 16, 12), pupil: new THREE.SphereGeometry(0.08, 12, 8),
  shine: new THREE.SphereGeometry(0.03, 6, 4), foot: new THREE.SphereGeometry(0.17, 12, 8), arm: new THREE.CapsuleGeometry(0.1, 0.2, 4, 8),
  cheek: new THREE.SphereGeometry(0.07, 10, 6), cone: new THREE.ConeGeometry(0.2, 0.5, 16), ball: new THREE.SphereGeometry(0.08, 10, 8),
  tailSeg: new THREE.SphereGeometry(0.12, 10, 8), crownG: null
};
const eyeMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 90 });
const pupilMat = new THREE.MeshPhongMaterial({ color: 0x1b1530, shininess: 120 });
const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff7aa8, transparent: true, opacity: 0.55, depthWrite: false });
const BODY = {}, DARK = {};
const bodyMat = (c) => BODY[c] || (BODY[c] = new THREE.MeshPhongMaterial({ color: c, shininess: 70, specular: 0x777777, emissive: shadeC(c, -0.82) }));
const darkMat = (c) => DARK[c] || (DARK[c] = new THREE.MeshPhongMaterial({ color: shadeC(c, -0.28), shininess: 40 }));
const plainMat = (c, o) => new THREE.MeshPhongMaterial(Object.assign({ color: c, shininess: 50 }, o || {}));
const HATMAT = {};
const hatMat = (c, pat, c2) => { const k = c + (pat || '') + (c2 || ''); return HATMAT[k] || (HATMAT[k] = pat ? new THREE.MeshPhongMaterial({ map: patTex(pat, c, c2), shininess: 40 }) : plainMat(c)); };

function crownMesh(scale) {
  const g = new THREE.Group(), gold = hatMat(0xffc531);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.2, 10, 1, true), new THREE.MeshPhongMaterial({ color: 0xffc531, shininess: 100, side: THREE.DoubleSide, emissive: 0x553300 }));
  g.add(band);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; const s = new THREE.Mesh(JG.cone, gold); s.scale.set(0.35, 0.42, 0.35); s.position.set(Math.sin(a) * 0.22, 0.2, Math.cos(a) * 0.22); g.add(s);
    const gem = new THREE.Mesh(JG.ball, hatMat([0xff4d6d, 0x4cc9f0, 0x8bd450][i % 3])); gem.scale.setScalar(0.55); gem.position.set(Math.sin(a) * 0.255, 0.0, Math.cos(a) * 0.255); g.add(gem); }
  g.scale.setScalar(scale || 1); return g;
}
function costumeMesh(k, col) {
  const g = new THREE.Group(), name = (COSTUMES[k] || COSTUMES[0]).k;
  const add = (geo, mat, x, y, z, sx, sy, sz, rx, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); m.rotation.set(rx || 0, 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  const sphere = JG.ball, cyl = (r, h, s) => new THREE.CylinderGeometry(r, r, h, s || 16);
  if (name === 'party') { add(JG.cone, hatMat(0xffd93d, 'stripe', 0xff5d8f), 0.05, 0.22, 0, 0.75, 0.85, 0.75, 0, -0.18); add(sphere, hatMat(0xffffff), 0.1, 0.46, 0, 1.1); }
  else if (name === 'bow') { add(JG.cone, hatMat(0xff4d8d, 'dots', 0xffffff), 0.17, 0.02, 0.05, 0.6, 0.5, 0.6, 0, -Math.PI / 2); add(JG.cone, hatMat(0xff4d8d, 'dots', 0xffffff), -0.17, 0.02, 0.05, 0.6, 0.5, 0.6, 0, Math.PI / 2); add(sphere, hatMat(0xff4d8d), 0, 0.02, 0.05, 1.1); g.position.x = 0.12; g.rotation.z = -0.35; }
  else if (name === 'antenna') { add(cyl(0.025, 0.42, 6), hatMat(0x333333), 0, 0.2, 0, 1); add(sphere, hatMat(0xffd93d, null), 0, 0.44, 0, 1.4).material = new THREE.MeshPhongMaterial({ color: 0xffe14d, emissive: 0x997700 }); }
  else if (name === 'cat') { add(JG.cone, bodyMat(col), 0.2, 0.06, 0, 0.6, 0.55, 0.45, 0, -0.35); add(JG.cone, bodyMat(col), -0.2, 0.06, 0, 0.6, 0.55, 0.45, 0, 0.35); add(JG.cone, hatMat(0xffa3c4), 0.2, 0.05, 0.05, 0.35, 0.38, 0.2, 0, -0.35); add(JG.cone, hatMat(0xffa3c4), -0.2, 0.05, 0.05, 0.35, 0.38, 0.2, 0, 0.35); }
  else if (name === 'chef') { add(cyl(0.21, 0.24), hatMat(0xffffff), 0, 0.08, 0, 1); add(new THREE.SphereGeometry(0.28, 14, 10), hatMat(0xffffff), 0, 0.3, 0, 1, 0.7, 1); }
  else if (name === 'sprout') { add(cyl(0.02, 0.2, 6), hatMat(0x3b9d3b), 0, 0.08, 0, 1); add(new THREE.SphereGeometry(0.13, 10, 8), hatMat(0x6fd34a), 0.11, 0.2, 0, 1, 0.35, 0.6, 0, -0.5); add(new THREE.SphereGeometry(0.13, 10, 8), hatMat(0x6fd34a), -0.11, 0.2, 0, 1, 0.35, 0.6, 0, 0.5); }
  else if (name === 'bunny') { for (const s of [1, -1]) { add(JG.arm, hatMat(0xffffff), s * 0.13, 0.25, 0, 0.75, 1.35, 0.6, 0, -s * 0.18); add(JG.arm, hatMat(0xffa3c4), s * 0.13, 0.25, 0.04, 0.4, 1.1, 0.25, 0, -s * 0.18); } }
  else if (name === 'prop') { add(new THREE.SphereGeometry(0.3, 14, 8, 0, TAU, 0, Math.PI / 2), hatMat(0x4cc9f0, 'stripe', 0xffd93d), 0, -0.08, 0, 1, 0.75, 1); add(cyl(0.02, 0.16, 6), hatMat(0x555555), 0, 0.2, 0, 1);
    const p = new THREE.Group(); p.position.y = 0.28; for (const s of [0, Math.PI / 2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.07), hatMat(s ? 0xff5d8f : 0x8bd450)); b.rotation.y = s; p.add(b); } g.add(p); g.userData.spin = p; }
  else if (name === 'phones') { const arc = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.045, 6, 18, Math.PI), hatMat(0x2b2d42)); arc.position.y = -0.2; g.add(arc); for (const s of [1, -1]) add(cyl(0.13, 0.1), hatMat(0xff5d8f), s * 0.45, -0.24, 0, 1, 1, 1, 0, Math.PI / 2); }
  else if (name === 'tophat') { add(cyl(0.34, 0.03, 20), hatMat(0x222233), 0, 0, 0, 1); add(cyl(0.2, 0.34), hatMat(0x222233), 0, 0.18, 0, 1); add(cyl(0.205, 0.07), hatMat(0xff4d6d), 0, 0.06, 0, 1); g.rotation.z = 0.12; }
  else if (name === 'halo') { const h = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 24), new THREE.MeshPhongMaterial({ color: 0xffe46b, emissive: 0xaa8800, shininess: 100 })); h.rotation.x = Math.PI / 2; h.position.y = 0.28; g.add(h); g.userData.float = h; }
  return g;
}
function makeJellyMesh(col, cos) {
  const root = new THREE.Group(), wob = new THREE.Group(), spin = new THREE.Group(), parts = new THREE.Group();
  root.add(wob); wob.add(spin); spin.position.y = 0.72; spin.add(parts); parts.position.y = -0.72;
  const body = new THREE.Mesh(JG.body, bodyMat(col)); body.position.y = 0.72; body.castShadow = true; parts.add(body);
  const eyes = [];
  for (const s of [1, -1]) {
    const e = new THREE.Group(); e.position.set(s * 0.155, 1.06, 0.355); e.rotation.y = s * 0.28;
    const w = new THREE.Mesh(JG.eye, eyeMat); w.scale.set(1, 1.2, 0.62); e.add(w);
    const p = new THREE.Mesh(JG.pupil, pupilMat); p.position.set(-s * 0.01, -0.01, 0.075); p.scale.set(1, 1.15, 0.6); e.add(p);
    const sh = new THREE.Mesh(JG.shine, shineMat); sh.position.set(0.03, 0.05, 0.13); e.add(sh);
    parts.add(e); eyes.push(e);
    const ch = new THREE.Mesh(JG.cheek, cheekMat); ch.position.set(s * 0.27, 0.9, 0.33); ch.scale.set(1, 0.6, 0.4); parts.add(ch);
  }
  const arms = [];
  for (const s of [1, -1]) { const a = new THREE.Group(); a.position.set(s * 0.43, 0.74, 0.02); const m = new THREE.Mesh(JG.arm, bodyMat(col)); m.position.y = -0.14; m.castShadow = true; a.add(m); a.rotation.z = s * 0.45; parts.add(a); arms.push(a); }
  const feet = [];
  for (const s of [1, -1]) { const f = new THREE.Mesh(JG.foot, darkMat(col)); f.scale.set(1, 0.62, 1.25); f.position.set(s * 0.19, 0.08, 0.05); f.castShadow = true; root.add(f); feet.push(f); }
  const hat = costumeMesh(cos | 0, col); hat.position.y += 1.38; parts.add(hat);
  // a candy ribbon tail (shown in the tail round)
  const tail = new THREE.Group(); tail.position.set(0, 0.62, -0.42); tail.visible = false; parts.add(tail);
  const tcol = [0xff5d8f, 0xffd93d, 0x8bd450, 0x4cc9f0, 0x9b6bff];
  let prev = tail; const segs = [];
  for (let i = 0; i < 5; i++) { const sgrp = new THREE.Group(); sgrp.position.z = i ? -0.2 : 0; const m = new THREE.Mesh(JG.tailSeg, new THREE.MeshPhongMaterial({ color: tcol[i], emissive: shadeC(tcol[i], -0.6), shininess: 80 })); m.scale.setScalar(1 - i * 0.1); sgrp.add(m); prev.add(sgrp); prev = sgrp; segs.push(sgrp); }
  return { root, wob, spin, parts, body, eyes, arms, feet, hat, tail, segs, crown: null, blinkT: 2 + Math.random() * 3 };
}
// name tag above a jelly
function tagSprite(name, col) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  g.font = '700 30px "Segoe UI", Tahoma, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(244, g.measureText(name).width + 34);
  g.fillStyle = 'rgba(20,16,40,.62)'; const x0 = 128 - w / 2; g.beginPath(); g.moveTo(x0 + 16, 8); g.arcTo(x0 + w, 8, x0 + w, 56, 16); g.arcTo(x0 + w, 56, x0, 56, 16); g.arcTo(x0, 56, x0, 8, 16); g.arcTo(x0, 8, x0 + w, 8, 16); g.fill();
  g.fillStyle = hexs(col); g.beginPath(); g.arc(x0 + 16, 32, 7, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.fillText(name, 128 + 6, 33, 200);
  const t = new THREE.CanvasTexture(c); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(2.4, 0.6, 1); s.renderOrder = 20; return s;
}

// ------------------------------------------------------------------ the world: colliders + course builder
// A collider is a box (type 0) or a vertical cylinder (type 1) with a full rotation; moving ones get a fn(T, state) on the shared round clock.
const W = { scene: null, sun: null, cols: [], dyn: [], hits: [], tiles: [], hexMs: [], cps: [], spawn: null, finish: null, path: [], killY: -14, view: 0, def: null,
  slime: null, slimeM: null, crown: null, T: 0, dtObs: 1 / 60, ai: 'path', arena: null, time: 120, geos: [], anim: [], auto: null, fallDelay: 0.7 };
function setAxes(c, rx, ry, rz) {
  const a = Math.cos(rx), b = Math.sin(rx), cc = Math.cos(ry), d = Math.sin(ry), e = Math.cos(rz), f = Math.sin(rz);
  const ce = cc * e, cf = cc * f, de = d * e, df = d * f;
  c.ax[0] = ce + df * b; c.ax[1] = a * f; c.ax[2] = cf * b - de;
  c.ay[0] = de * b - cf; c.ay[1] = a * e; c.ay[2] = df + ce * b;
  c.az[0] = a * d; c.az[1] = -b; c.az[2] = a * cc;
}
function newCol(type, x, y, z, hx, hy, hz, o) {
  o = o || {};
  const c = { type, hx, hy, hz, c: [x, y, z], ax: [1, 0, 0], ay: [0, 1, 0], az: [0, 0, 1], pc: [x, y, z], pax: [1, 0, 0], pay: [0, 1, 0], paz: [0, 0, 1],
    br: type ? Math.hypot(hx, hy) : Math.hypot(hx, hy, hz), base: { x, y, z, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 }, rot: [o.rx || 0, o.ry || 0, o.rz || 0],
    fn: o.fn || null, hit: o.hit || 0, bump: o.bump || 0, on: !o.noCol, mesh: null, tile: -1, slip: o.slip || 0, nobot: !!o.nobot };
  setAxes(c, c.rot[0], c.rot[1], c.rot[2]); for (let i = 0; i < 3; i++) { c.pax[i] = c.ax[i]; c.pay[i] = c.ay[i]; c.paz[i] = c.az[i]; }
  if (!o.noCol) W.cols.push(c);
  if (c.fn) W.dyn.push(c);
  if (c.hit) W.hits.push(c);
  return c;
}
const ST = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
function poseAt(c, T, out) {   // out = { c:[], ax:[], ay:[], az:[] } — where a moving piece is at time T (bots look ahead with it)
  const b = c.base; ST.x = b.x; ST.y = b.y; ST.z = b.z; ST.rx = b.rx; ST.ry = b.ry; ST.rz = b.rz;
  if (c.fn) c.fn(T, ST, c);
  out.c[0] = ST.x; out.c[1] = ST.y; out.c[2] = ST.z; setAxes(out, ST.rx, ST.ry, ST.rz);
  return ST;
}
function updateDyn(T, dt, jump) {
  for (const c of W.dyn) {
    for (let i = 0; i < 3; i++) { c.pc[i] = c.c[i]; c.pax[i] = c.ax[i]; c.pay[i] = c.ay[i]; c.paz[i] = c.az[i]; }
    const s = poseAt(c, T, c);
    c.rot[0] = s.rx; c.rot[1] = s.ry; c.rot[2] = s.rz;
    if (jump) for (let i = 0; i < 3; i++) { c.pc[i] = c.c[i]; c.pax[i] = c.ax[i]; c.pay[i] = c.ay[i]; c.paz[i] = c.az[i]; }
    if (c.mesh) { c.mesh.position.set(c.c[0], c.c[1], c.c[2]); c.mesh.rotation.set(s.rx, s.ry, s.rz); }
  }
  W.dtObs = Math.max(1 / 240, dt);
}
// carry a point along with a moving piece from last frame to this one
function carryPt(c, p) {
  const dx = p.x - c.pc[0], dy = p.y - c.pc[1], dz = p.z - c.pc[2];
  const lx = dx * c.pax[0] + dy * c.pax[1] + dz * c.pax[2], ly = dx * c.pay[0] + dy * c.pay[1] + dz * c.pay[2], lz = dx * c.paz[0] + dy * c.paz[1] + dz * c.paz[2];
  p.x = c.c[0] + c.ax[0] * lx + c.ay[0] * ly + c.az[0] * lz;
  p.y = c.c[1] + c.ax[1] * lx + c.ay[1] * ly + c.az[1] * lz;
  p.z = c.c[2] + c.ax[2] * lx + c.ay[2] * ly + c.az[2] * lz;
}
const PV = { x: 0, y: 0, z: 0 };
function pointVel(c, x, y, z) { PV.x = x; PV.y = y; PV.z = z; carryPt(c, PV); const k = 1 / W.dtObs; PV.x = (PV.x - x) * k; PV.y = (PV.y - y) * k; PV.z = (PV.z - z) * k; return PV; }

const HIT = { nx: 0, ny: 0, nz: 0, d: 0 };
function sphHit(c, px, py, pz, r) {
  const dx = px - c.c[0], dy = py - c.c[1], dz = pz - c.c[2], ax = c.ax, ay = c.ay, az = c.az;
  const lx = dx * ax[0] + dy * ax[1] + dz * ax[2], ly = dx * ay[0] + dy * ay[1] + dz * ay[2], lz = dx * az[0] + dy * az[1] + dz * az[2];
  let qx, qy, qz, nlx, nly, nlz, depth;
  const hy = c.hy; qy = ly < -hy ? -hy : ly > hy ? hy : ly;
  if (c.type === 0) {
    const hx = c.hx, hz = c.hz;
    qx = lx < -hx ? -hx : lx > hx ? hx : lx; qz = lz < -hz ? -hz : lz > hz ? hz : lz;
    const ex = lx - qx, ey = ly - qy, ez = lz - qz, d2 = ex * ex + ey * ey + ez * ez;
    if (d2 > 1e-10) { if (d2 >= r * r) return false; const d = Math.sqrt(d2); nlx = ex / d; nly = ey / d; nlz = ez / d; depth = r - d; }
    else {
      const pX = hx - Math.abs(lx), pY = hy - Math.abs(ly), pZ = hz - Math.abs(lz);
      if (pY <= pX && pY <= pZ) { nlx = 0; nly = ly >= 0 ? 1 : -1; nlz = 0; depth = pY + r; }
      else if (pX <= pZ) { nlx = lx >= 0 ? 1 : -1; nly = 0; nlz = 0; depth = pX + r; }
      else { nlx = 0; nly = 0; nlz = lz >= 0 ? 1 : -1; depth = pZ + r; }
    }
  } else {
    const R = c.hx, hd = Math.sqrt(lx * lx + lz * lz);
    if (hd > R) { qx = lx / hd * R; qz = lz / hd * R; } else { qx = lx; qz = lz; }
    const ex = lx - qx, ey = ly - qy, ez = lz - qz, d2 = ex * ex + ey * ey + ez * ez;
    if (d2 > 1e-10) { if (d2 >= r * r) return false; const d = Math.sqrt(d2); nlx = ex / d; nly = ey / d; nlz = ez / d; depth = r - d; }
    else {
      const pv = hy - Math.abs(ly), pr = R - hd;
      if (pv <= pr) { nlx = 0; nly = ly >= 0 ? 1 : -1; nlz = 0; depth = pv + r; }
      else { nlx = hd > 1e-6 ? lx / hd : 1; nly = 0; nlz = hd > 1e-6 ? lz / hd : 0; depth = pr + r; }
    }
  }
  HIT.nx = ax[0] * nlx + ay[0] * nly + az[0] * nlz; HIT.ny = ax[1] * nlx + ay[1] * nly + az[1] * nlz; HIT.nz = ax[2] * nlx + ay[2] * nly + az[2] * nlz; HIT.d = depth;
  return true;
}
// highest walkable top under (x, z) that is not above yMax — bots use it to see gaps and steps
function groundY(x, z, yMax) {
  let best = -1e9;
  for (const c of W.cols) {
    if (!c.on || c.hit || c.nobot) continue;
    const dx = x - c.c[0], dz = z - c.c[2]; if (dx * dx + dz * dz > c.br * c.br + 1) continue;
    let top;
    if (c.type === 1) { if (dx * dx + dz * dz > c.hx * c.hx) continue; top = c.c[1] + c.hy; }
    else {
      if (c.ay[1] < 0.6) continue;
      const lx = dx * c.ax[0] + dz * c.ax[2], lz = dx * c.az[0] + dz * c.az[2];
      if (Math.abs(lx) > c.hx || Math.abs(lz) > c.hz) continue;
      top = c.c[1] + c.ay[1] * c.hy + c.ax[1] * lx + c.az[1] * lz;
    }
    if (top <= yMax && top > best) best = top;
  }
  return best;
}
const TMPC = { type: 0, hx: 0, hy: 0, hz: 0, c: [0, 0, 0], ax: [1, 0, 0], ay: [0, 1, 0], az: [0, 0, 1] };
function dangerAt(x, y, z, r, T) {   // would a moving obstacle be at this point at time T?
  for (const c of W.hits) {
    const dx = x - c.c[0], dz = z - c.c[2], rr = c.br + r + 3; if (dx * dx + dz * dz > rr * rr) continue;
    TMPC.type = c.type; TMPC.hx = c.hx; TMPC.hy = c.hy; TMPC.hz = c.hz; poseAt(c, T, TMPC);
    if (sphHit(TMPC, x, y, z, r)) return c;
  }
  return null;
}

// ------------------------------------------------------------------ particles (one draw call)
const PART = (() => {
  const MAX = 1400, pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3), sz = new Float32Array(MAX), al = new Float32Array(MAX), sh = new Float32Array(MAX);
  const vel = new Float32Array(MAX * 3), life = new Float32Array(MAX), age = new Float32Array(MAX), grav = new Float32Array(MAX), size0 = new Float32Array(MAX);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('alpha', new THREE.BufferAttribute(al, 1)); geo.setAttribute('shape', new THREE.BufferAttribute(sh, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { scale: { value: 400 } },
    vertexShader: 'attribute float size; attribute float alpha; attribute float shape; attribute vec3 color; varying vec3 vC; varying float vA; varying float vS; uniform float scale; void main(){ vC = color; vA = alpha; vS = shape; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * scale / max(0.5, -mv.z); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vC; varying float vA; varying float vS; void main(){ vec2 p = gl_PointCoord - 0.5; float d = vS > 0.5 ? max(abs(p.x), abs(p.y)) * 1.1 : length(p); if (d > 0.5) discard; float e = vS > 0.5 ? 1.0 : smoothstep(0.5, 0.25, d); gl_FragColor = vec4(vC * (vS > 0.5 ? 1.0 : 1.1), vA * e); }'
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5;
  let n = 0;
  const C = new THREE.Color();
  function emit(x, y, z, count, colors, o) {
    o = o || {};
    for (let k = 0; k < count; k++) {
      let i = n; if (i >= MAX) { i = Math.floor(Math.random() * MAX); } else n++;
      const sp = (o.spd || 4) * (0.4 + Math.random() * 0.8), a = Math.random() * TAU, u = o.up == null ? 0.6 : o.up;
      const vy = (Math.random() * (1 - u) + u) * sp, hz = Math.sqrt(Math.max(0, sp * sp - vy * vy));
      pos[i * 3] = x + (Math.random() - 0.5) * (o.spread || 0.3); pos[i * 3 + 1] = y + (Math.random() - 0.5) * (o.spread || 0.3) * 0.5; pos[i * 3 + 2] = z + (Math.random() - 0.5) * (o.spread || 0.3);
      vel[i * 3] = Math.cos(a) * hz; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = Math.sin(a) * hz;
      C.set(Array.isArray(colors) ? colors[(Math.random() * colors.length) | 0] : colors);
      col[i * 3] = C.r; col[i * 3 + 1] = C.g; col[i * 3 + 2] = C.b;
      life[i] = (o.life || 0.8) * (0.6 + Math.random() * 0.7); age[i] = 0; grav[i] = o.grav == null ? 9 : o.grav; size0[i] = (o.size || 0.3) * (0.6 + Math.random() * 0.8); sh[i] = o.square ? 1 : 0;
    }
  }
  function update(dt) {
    for (let i = 0; i < n; i++) {
      age[i] += dt; const t = age[i] / life[i];
      if (t >= 1) { n--; if (i !== n) { for (const arr of [pos, vel, col]) { arr[i * 3] = arr[n * 3]; arr[i * 3 + 1] = arr[n * 3 + 1]; arr[i * 3 + 2] = arr[n * 3 + 2]; } life[i] = life[n]; age[i] = age[n]; grav[i] = grav[n]; size0[i] = size0[n]; sh[i] = sh[n]; } i--; continue; }
      vel[i * 3 + 1] -= grav[i] * dt; const drag = 1 - Math.min(1, dt * 1.2); vel[i * 3] *= drag; vel[i * 3 + 2] *= drag;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      al[i] = t < 0.1 ? t * 10 : 1 - (t - 0.1) / 0.9; sz[i] = size0[i] * (sh[i] ? 1 : 1 - t * 0.4);
    }
    geo.setDrawRange(0, n);
    for (const k of ['position', 'color', 'size', 'alpha', 'shape']) geo.attributes[k].needsUpdate = true;
  }
  function clear() { n = 0; geo.setDrawRange(0, 0); }
  return { pts, emit, update, clear, mat };
})();
const CONFETTI = [0xff5d8f, 0xffd93d, 0x8bd450, 0x4cc9f0, 0x9b6bff, 0xffa23a, 0xffffff];

// ------------------------------------------------------------------ jelly physics
const PHYS = { run: 7.4, accG: 48, accA: 17, grav: 27, jump: 10.3, diveH: 10.6, diveV: 5.2, maxFall: 36 };
const SPH = [[0.5, 0.5], [1.12, 0.42]];   // feet + head spheres [height, radius]
const HOOK = { fall: null, tile: null, land: null, knock: null, finish: null, slimed: null, crown: null };
function newJelly(o) {
  const j = Object.assign({ id: uid(), name: '', col: 0, cos: 0, bot: false, kind: 'bot', lvl: 1, spd: 1,
    pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, grounded: false, gObj: null, st: 0, stT: 0, getup: 0.35, jbuf: 0, coyote: 0, knockCD: 0, inv: 0, slowT: 0,
    dead: 0, out: false, fin: false, gone: false, cp: 0, tail: false, tailImm: 0, grabbing: false, grabT: null, grabCD: 0, sq: 0, sqv: 0, lean: 0, leanZ: 0, tumbleA: 0, spinV: 0,
    walk: 0, fx: 0, buf: [], ai: { x: 0, z: 0, jump: false, dive: false, grab: false }, aiS: null, finT: 0, hideT: 0, visible: true, lastLand: 0, prog: 0 }, o);
  const cc = COLORS[j.col % COLORS.length];
  j.m = makeJellyMesh(cc, j.cos);
  j.color = cc;
  return j;
}
function freeJelly(j) { if (j.m && j.m.root.parent) j.m.root.parent.remove(j.m.root); if (j.tag && j.tag.parent) j.tag.parent.remove(j.tag); }
function setJellyPos(j, x, y, z, yaw) { j.pos.set(x, y, z); j.vel.set(0, 0, 0); j.yaw = yaw || 0; j.st = 0; j.grounded = false; }

function collideJelly(j) {
  j.grounded = false; j.gObj = null;
  for (let it = 0; it < 2; it++) for (let s = 0; s < 2; s++) {
    const off = SPH[s][0], r = SPH[s][1];
    for (let i = 0; i < W.cols.length; i++) {
      const c = W.cols[i]; if (!c.on) continue;
      const px = j.pos.x, py = j.pos.y + off, pz = j.pos.z;
      const dx = px - c.c[0], dy = py - c.c[1], dz = pz - c.c[2], rr = c.br + r;
      if (dx * dx + dy * dy + dz * dz > rr * rr) continue;
      if (!sphHit(c, px, py, pz, r)) continue;
      const nx = HIT.nx, ny = HIT.ny, nz = HIT.nz;
      j.pos.x += nx * HIT.d; j.pos.y += ny * HIT.d; j.pos.z += nz * HIT.d;
      const vn = j.vel.x * nx + j.vel.y * ny + j.vel.z * nz;
      if (vn < 0) { j.vel.x -= nx * vn; j.vel.y -= ny * vn; j.vel.z -= nz * vn; }
      if (ny > 0.55 && s === 0) { j.grounded = true; j.gObj = c; }
      if (c.tile >= 0 && ny > 0.5 && HOOK.tile) HOOK.tile(c.tile, j);
      if (c.bump && vn < 1) {
        j.vel.x += nx * c.bump; j.vel.z += nz * c.bump; j.vel.y = Math.max(j.vel.y, 4 + ny * c.bump * 0.5);
        if (j.knockCD <= 0) { j.knockCD = 0.25; if (HOOK.knock) HOOK.knock(j, 'boing'); }
      }
      if (c.hit && j.knockCD <= 0 && j.inv <= 0 && !j.fin) {
        const v = pointVel(c, px, py, pz), sp = Math.hypot(v.x, v.y, v.z);
        if (sp > 2.4) knock(j, v.x, v.y, v.z, nx, ny, nz, sp);
      }
    }
  }
}
function knock(j, vx, vy, vz, nx, ny, nz, sp) {
  const k = 1.15; let hx = vx * k + nx * 3, hz = vz * k + nz * 3; const hm = Math.hypot(hx, hz), cap = 15; if (hm > cap) { hx *= cap / hm; hz *= cap / hm; }
  j.vel.x = hx; j.vel.z = hz; j.vel.y = Math.max(5 + Math.min(4, sp * 0.25), vy + 4 + Math.max(0, ny) * 3);
  j.st = 2; j.stT = 0; j.knockCD = 0.55; j.grounded = false; j.spinV = (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 5); j.grabbing = false; j.grabT = null;
  if (HOOK.knock) HOOK.knock(j, 'bonk');
}
// one step of a jelly that this device simulates (the player, or a bot)
function simJelly(j, inp, dt) {
  if (j.out || j.gone) return;
  if (j.dead > 0) { j.dead -= dt; if (j.dead <= 0 && HOOK.respawn) HOOK.respawn(j); return; }
  j.stT += dt; j.knockCD -= dt; j.inv -= dt; j.slowT -= dt; j.tailImm -= dt; j.grabCD -= dt;
  j.jbuf = inp.jump ? 0.13 : j.jbuf - dt;
  j.coyote = j.grounded ? 0.11 : j.coyote - dt;
  if (j.grounded && j.gObj && j.gObj.fn) carryPt(j.gObj, j.pos);
  if (j.st === 0 && !j.fin) {
    let mx = inp.x || 0, mz = inp.z || 0; const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
    j.grabbing = !!inp.grab;
    const spd = PHYS.run * j.spd * (j.slowT > 0 ? 0.45 : 1) * (j.grabbing ? 0.62 : 1);
    let dx = mx * spd - j.vel.x, dz = mz * spd - j.vel.z; const dl = Math.hypot(dx, dz), acc = (j.grounded ? PHYS.accG : PHYS.accA) * dt;
    if (dl > acc) { dx *= acc / dl; dz *= acc / dl; }
    j.vel.x += dx; j.vel.z += dz;
    if (m > 0.15) j.yaw += angDiff(j.yaw, Math.atan2(mx, mz)) * damp(14, dt);
    if (j.jbuf > 0 && j.coyote > 0) {
      j.vel.y = PHYS.jump; j.coyote = 0; j.jbuf = 0; j.grounded = false; j.gObj = null; j.sqv += 4.5;
      if (HOOK.jump) HOOK.jump(j);
    } else if (inp.dive) {
      const hs = Math.hypot(j.vel.x, j.vel.z), s = Math.max(PHYS.diveH, hs + 2.2);
      j.vel.x = Math.sin(j.yaw) * s; j.vel.z = Math.cos(j.yaw) * s; j.vel.y = j.grounded ? PHYS.diveV : Math.max(j.vel.y + 2.2, 3.4);
      j.st = 1; j.stT = 0; j.grounded = false; j.gObj = null; j.grabbing = false;
      if (HOOK.dive) HOOK.dive(j);
    }
  } else {
    j.grabbing = false;
    const fr = (j.grounded ? (j.st === 1 ? 9 : j.st === 2 ? 6 : 14) : 0.5) * dt, hs = Math.hypot(j.vel.x, j.vel.z);
    if (hs > 0) { const k = Math.max(0, hs - fr) / hs; j.vel.x *= k; j.vel.z *= k; }
  }
  if (j.st === 1) { if (j.grounded && j.stT > 0.1) { j.st = 3; j.stT = 0; j.getup = 0.3; } }
  else if (j.st === 2) { if ((j.grounded && j.stT > 0.95) || j.stT > 3.2) { j.st = 3; j.stT = 0; j.getup = 0.38; } }
  else if (j.st === 3) { if (j.stT > j.getup) j.st = 0; }
  j.vel.y = Math.max(j.vel.y - PHYS.grav * dt, -PHYS.maxFall);
  const vy0 = j.vel.y, wasG = j.grounded, n = dt > 1 / 100 ? 2 : 1, h = dt / n;
  for (let k = 0; k < n; k++) { j.pos.x += j.vel.x * h; j.pos.y += j.vel.y * h; j.pos.z += j.vel.z * h; collideJelly(j); }
  if (!wasG && j.grounded && vy0 < -5) { j.sqv -= Math.min(7, -vy0 * 0.35); if (HOOK.land) HOOK.land(j, -vy0); }
  if (j.pos.y < W.killY && HOOK.fall) HOOK.fall(j);
}
// squash, stretch, lean, tumble, feet, arms, eyes — for every jelly (also remote ones)
function animJelly(j, dt, t) {
  const m = j.m, r = m.root;
  if (!j.visible) { r.visible = false; return; }
  r.visible = true;
  r.position.copy(j.pos); r.rotation.y = j.yaw;
  // squash spring
  j.sqv += (-j.sq * 120 - j.sqv * 9) * dt; j.sq += j.sqv * dt; j.sq = clamp(j.sq, -0.38, 0.45);
  const air = !j.grounded ? clamp(j.vel.y * 0.012, -0.08, 0.1) : 0, br = Math.sin(t * 3 + j.fx) * 0.015;
  const s = j.sq + air + br; m.wob.scale.set(1 - s * 0.55, 1 + s, 1 - s * 0.55);
  // lean from speed
  const hs = Math.hypot(j.vel.x, j.vel.z), fwd = (j.vel.x * Math.sin(j.yaw) + j.vel.z * Math.cos(j.yaw));
  let tx = clamp(fwd * 0.035, -0.2, 0.3), tz = 0;
  if (j.st === 1) tx = 1.38;
  if (j.st === 2) { j.tumbleA += j.spinV * dt * (j.grounded ? 0.25 : 1); if (j.grounded) j.tumbleA = lerp(j.tumbleA, Math.round(j.tumbleA / Math.PI) * Math.PI + Math.PI / 2, damp(6, dt)); tx = j.tumbleA; }
  else { j.tumbleA = 0; }
  if (j.st === 3) tx = lerp(j.lean, 0, damp(10, dt));
  if (j.grabbing) tx = 0.32;
  j.lean = lerp(j.lean, tx, damp(j.st === 2 ? 30 : 12, dt)); j.leanZ = lerp(j.leanZ, tz, damp(10, dt));
  m.spin.rotation.x = j.lean; m.spin.rotation.z = j.leanZ;
  // feet + arms
  const moving = j.grounded && hs > 0.8 && j.st === 0;
  j.walk += dt * (moving ? 6 + hs * 1.6 : 0); if (!moving) j.walk = lerp(j.walk, Math.round(j.walk / Math.PI) * Math.PI, damp(8, dt));
  const sw = Math.sin(j.walk), ft = m.feet, lying = j.st === 1 || j.st === 2;
  ft[0].visible = ft[1].visible = !lying;
  ft[0].position.z = 0.05 + sw * 0.22; ft[1].position.z = 0.05 - sw * 0.22; ft[0].position.y = 0.08 + Math.max(0, sw) * 0.12; ft[1].position.y = 0.08 + Math.max(0, -sw) * 0.12;
  if (!j.grounded && !lying) { ft[0].position.y = ft[1].position.y = 0.16; ft[0].position.z = 0.15; ft[1].position.z = -0.05; }
  const a = m.arms;
  if (j.grabbing || j.st === 1) { a[0].rotation.set(-1.75, 0, 0.12); a[1].rotation.set(-1.75, 0, -0.12); }
  else if (!j.grounded || j.st === 2) { a[0].rotation.set(0, 0, 2.2 + Math.sin(t * 18) * 0.3); a[1].rotation.set(0, 0, -2.2 - Math.sin(t * 18) * 0.3); }
  else { a[0].rotation.set(-sw * 0.6 * Math.min(1, hs / 4), 0, 0.45); a[1].rotation.set(sw * 0.6 * Math.min(1, hs / 4), 0, -0.45); }
  // blink
  m.blinkT -= dt; const bl = m.blinkT < 0.09 ? 0.12 : 1; if (m.blinkT < 0) m.blinkT = 2 + Math.random() * 3.5;
  const dz = j.st === 2 ? 0.25 : 1; m.eyes[0].scale.y = m.eyes[1].scale.y = bl * dz;
  // costume extras
  if (m.hat.userData.spin) m.hat.userData.spin.rotation.y += dt * (8 + hs * 3);
  if (m.hat.userData.float) m.hat.userData.float.position.y = 0.28 + Math.sin(t * 3) * 0.04;
  // tail ribbon
  m.tail.visible = !!j.tail;
  if (j.tail) for (let i = 0; i < m.segs.length; i++) { const g = m.segs[i]; g.rotation.y = Math.sin(t * 7 - i * 0.8 + j.fx) * 0.35; g.rotation.x = -0.2 + Math.sin(t * 5 - i) * 0.12 + (j.grounded ? 0 : 0.3); }
  // respawn blink
  m.body.visible = !(j.inv > 0 && Math.floor(t * 14) % 2 === 0);
}
