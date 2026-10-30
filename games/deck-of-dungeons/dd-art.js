'use strict';
// =====================================================================
// Deck of Dungeons — procedural pixel art (heroes, monsters, towers, rooms, traps, tiles, icons)
// Every sprite is drawn once into a tiny canvas and scaled up with smoothing off.
// =====================================================================
(function () {
const DD = window.__DD = window.__DD || {};
const A = DD.art = {};

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
A.rng = rng;
function shade(hex, f) {   // f > 0 lighter, f < 0 darker
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
A.shade = shade;
// draw into a fresh canvas; fn(r) where r(x, y, w, h, color)
function sprite(w, h, fn, outlineCol) {
  const c = cv(w, h), g = c.getContext('2d');
  const r = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  fn(r, g);
  if (outlineCol !== null) outline(c, outlineCol || '#0b0712');
  return c;
}
function outline(c, col) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h), p = d.data;
  const n = parseInt(col.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && p[(y * w + x) * 4 + 3] > 40;
  const add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) add.push(x, y);
  for (let i = 0; i < add.length; i += 2) { const k = (add[i + 1] * w + add[i]) * 4; p[k] = R; p[k + 1] = G; p[k + 2] = B; p[k + 3] = 255; }
  g.putImageData(d, 0, 0);
}

// ---------------------------------------------------------------- heroes (16 × 18, facing right)
const SKIN = '#f0c09a', SKIN2 = '#c48a6a', EYE = '#1b1020', STEEL = '#c9d1de', STEEL2 = '#8a94a8', GOLD = '#ffcc33', GOLD2 = '#b8862a', WOOD = '#7a5230';
function legs(r, f, col, boot, short) {
  const y = short ? 15 : 15;
  if (f === 0) { r(5, y, 2, 2, col); r(9, y, 2, 2, col); r(5, 17, 2, 1, boot); r(9, 17, 2, 1, boot); }
  else { r(6, y, 2, 2, col); r(8, y, 2, 1, col); r(6, 17, 2, 1, boot); r(8, 16, 2, 1, boot); }
}
function torso(r, col, dark, belt) { r(4, 10, 8, 5, col); r(4, 10, 1, 5, dark); r(11, 10, 1, 5, dark); if (belt) r(4, 13, 8, 1, belt); r(3, 10, 1, 4, dark); r(12, 10, 1, 3, col); }
function face(r, x0) { r(5, 4, 7, 6, SKIN); r(5, 8, 7, 2, SKIN2); r(10, 6, 1, 2, EYE); }
const W = {
  sword: (r) => { r(13, 3, 1, 8, '#e8eef8'); r(14, 4, 1, 6, '#9aa6ba'); r(12, 11, 3, 1, GOLD); r(13, 12, 1, 2, WOOD); },
  dagger: (r) => { r(13, 8, 1, 4, '#e8eef8'); r(12, 12, 3, 1, GOLD2); r(13, 13, 1, 1, WOOD); },
  staff: (r, orb) => { r(13, 3, 1, 15, WOOD); r(12, 0, 3, 3, orb); r(12, 0, 1, 1, '#ffffff'); },
  mace: (r) => { r(13, 7, 1, 7, WOOD); r(12, 4, 3, 3, GOLD); r(13, 3, 1, 1, GOLD); r(11, 5, 1, 1, GOLD2); r(14, 5, 1, 1, GOLD2); },
  pick: (r) => { r(13, 5, 1, 10, WOOD); r(10, 4, 5, 1, STEEL); r(10, 5, 1, 1, STEEL2); r(14, 5, 1, 1, STEEL2); },
  hammer: (r) => { r(13, 6, 1, 9, WOOD); r(11, 3, 4, 3, GOLD); r(11, 5, 4, 1, GOLD2); },
  great: (r) => { r(13, 0, 2, 11, '#eef3ff'); r(14, 1, 1, 9, '#a7b2c8'); r(11, 11, 5, 1, GOLD); r(13, 12, 2, 2, '#6b2a2a'); }
};
function shieldBack(r, col, emb, rim) { r(1, 9, 4, 6, col); r(1, 9, 4, 1, rim || shade(col, 0.3)); r(2, 15, 2, 1, col); r(2, 11, 2, 2, emb); }
const HERO_DRAW = {
  squire(r, f) {
    legs(r, f, '#5a4030', '#2e211a'); torso(r, '#4f7cc4', '#35589a', '#6b4426'); face(r);
    r(5, 2, 7, 3, '#8a5a32'); r(4, 4, 8, 1, '#6b4426'); r(4, 5, 2, 3, '#6b4426');
    shieldBack(r, '#9a6a3a', '#d9b25a'); W.sword(r);
  },
  rogue(r, f) {
    legs(r, f, '#2a3a2e', '#151d17'); torso(r, '#2f5d3a', '#1d3a24', '#5a3a22');
    r(4, 2, 8, 8, '#2f5d3a'); r(4, 2, 2, 8, '#1d3a24'); r(8, 5, 4, 4, SKIN2); r(10, 6, 1, 1, '#ffe27a'); r(8, 8, 4, 1, '#1d3a24');
    r(2, 10, 2, 6, '#1d3a24'); W.dagger(r);
  },
  knight(r, f) {
    legs(r, f, STEEL2, '#4a5266'); torso(r, '#aab4c6', '#7c879c', '#5a4030'); r(6, 10, 4, 3, '#3a5ab8'); r(7, 10, 2, 3, '#e8e2d0');
    r(5, 2, 7, 8, STEEL); r(5, 2, 1, 8, STEEL2); r(6, 2, 6, 1, '#e8eef8'); r(8, 6, 4, 1, EYE); r(9, 8, 1, 1, STEEL2); r(11, 8, 1, 1, STEEL2);
    r(7, 0, 3, 2, '#d43a3a'); r(6, 1, 1, 1, '#a82a2a');
    shieldBack(r, '#3a5ab8', '#e8e2d0', '#6a8ae0'); W.sword(r);
  },
  cleric(r, f) {
    legs(r, f, '#b8b09c', '#6b6252'); torso(r, '#ece6d6', '#b8b09c', GOLD2); r(7, 10, 1, 3, GOLD); r(6, 11, 3, 1, GOLD);
    r(4, 2, 8, 8, '#ece6d6'); r(4, 2, 2, 8, '#b8b09c'); r(8, 4, 4, 5, SKIN); r(8, 7, 4, 2, SKIN2); r(10, 5, 1, 2, EYE); r(4, 9, 8, 1, GOLD);
    r(7, 1, 2, 1, GOLD); W.mace(r);
  },
  mage(r, f) {
    legs(r, f, '#262c8a', '#141844'); torso(r, '#3d47c9', '#262c8a', GOLD); r(4, 14, 8, 1, '#262c8a');
    r(5, 5, 7, 5, SKIN); r(5, 8, 7, 2, SKIN2); r(10, 6, 1, 1, EYE); r(9, 8, 3, 3, '#e8e8f0'); r(10, 10, 2, 2, '#e8e8f0');
    r(6, 0, 3, 1, '#3d47c9'); r(5, 1, 5, 1, '#3d47c9'); r(5, 2, 6, 1, '#3d47c9'); r(4, 3, 8, 1, GOLD); r(3, 4, 10, 1, '#262c8a'); r(9, 1, 1, 1, '#ffe27a');
    W.staff(r, '#ff6a2a');
  },
  dwarf(r, f) {
    legs(r, f, '#5a4030', '#2e211a'); r(3, 10, 10, 5, '#8a6a4a'); r(3, 10, 1, 5, '#5a4030'); r(3, 13, 10, 1, '#3a2a1a'); r(2, 10, 1, 4, '#5a4030');
    r(5, 3, 7, 3, '#9aa3b5'); r(5, 3, 7, 1, '#c9d1de'); r(3, 2, 2, 2, '#ece6d6'); r(12, 2, 2, 2, '#ece6d6'); r(3, 1, 1, 1, '#ece6d6'); r(13, 1, 1, 1, '#ece6d6');
    r(6, 6, 6, 2, SKIN); r(10, 6, 1, 1, EYE); r(5, 8, 8, 5, '#d9772b'); r(6, 13, 6, 1, '#d9772b'); r(5, 8, 1, 4, '#a8561c');
    W.pick(r);
  },
  paladin(r, f) {
    legs(r, f, '#d6cfb8', '#8a7a50'); torso(r, '#e8e2d0', '#b8b09c', GOLD); r(6, 10, 4, 3, GOLD); r(7, 11, 2, 1, '#fff6c8');
    r(5, 2, 7, 8, GOLD); r(5, 2, 1, 8, GOLD2); r(6, 2, 6, 1, '#fff0a8'); r(8, 6, 4, 1, '#3a2a10'); r(7, 0, 3, 2, '#f4f4ff');
    shieldBack(r, '#f0ecdf', GOLD, '#ffffff'); W.hammer(r);
  },
  brannoc(r, f) {
    r(1, 9, 3, 8, '#9e1f2b'); r(1, 16, 2, 1, '#7a1520');
    legs(r, f, STEEL2, '#4a5266'); torso(r, '#aab4c6', '#7c879c', '#5a4030'); r(6, 10, 4, 4, '#b3243a'); r(7, 11, 2, 2, GOLD);
    r(5, 2, 7, 8, STEEL); r(5, 2, 1, 8, STEEL2); r(8, 6, 4, 1, EYE); r(6, 0, 5, 2, GOLD); r(6, 2, 6, 1, GOLD2);
    r(0, 8, 5, 7, '#b3243a'); r(0, 8, 5, 1, GOLD); r(1, 10, 3, 3, GOLD); r(1, 15, 3, 1, '#b3243a'); W.sword(r);
  },
  vexa(r, f) {
    legs(r, f, '#4a1a7a', '#24083e'); torso(r, '#7b2fbf', '#4a1a7a', '#ffcc33'); r(4, 14, 8, 1, '#4a1a7a');
    r(4, 5, 2, 7, '#f0eaff'); r(5, 5, 7, 5, SKIN); r(5, 8, 7, 2, SKIN2); r(10, 6, 1, 1, '#c03aff');
    r(7, 0, 2, 1, '#7b2fbf'); r(6, 1, 4, 1, '#7b2fbf'); r(5, 2, 6, 1, '#7b2fbf'); r(4, 3, 8, 1, '#7b2fbf'); r(3, 4, 10, 1, '#4a1a7a');
    r(6, 2, 1, 1, '#ffe27a'); r(9, 3, 1, 1, '#ffe27a'); W.staff(r, '#e070ff');
  },
  aldric(r, f) {
    r(1, 9, 3, 8, '#9e1f2b'); r(1, 16, 2, 1, '#7a1520');
    legs(r, f, GOLD2, '#5a4010'); torso(r, '#e0b84a', '#a8832a', '#6b2a2a'); r(6, 10, 4, 4, '#9e1f2b'); r(7, 11, 2, 2, GOLD);
    face(r); r(5, 3, 7, 2, '#6b4426'); r(4, 4, 2, 5, '#6b4426'); r(8, 8, 4, 3, '#6b4426'); r(9, 7, 2, 1, '#6b4426');
    r(5, 1, 7, 2, GOLD); r(5, 0, 1, 1, GOLD); r(8, 0, 1, 1, GOLD); r(11, 0, 1, 1, GOLD); r(8, 1, 1, 1, '#ff3a5a'); r(6, 1, 1, 1, '#3aa0ff');
    W.great(r);
  }
};
const heroCache = {};
A.hero = (cls, f) => {
  const k = cls + f; if (heroCache[k]) return heroCache[k];
  return (heroCache[k] = sprite(16, 18, (r) => HERO_DRAW[cls](r, f)));
};

// ---------------------------------------------------------------- monsters
const MON_DRAW = {
  golem(r, f) {
    const c = '#7d7a8c', d = '#5a576a', l = '#a09cb2';
    if (f === 1) { r(1, 1, 3, 6, d); r(12, 1, 3, 6, d); } else { r(1, 5, 3, 7, d); r(12, 5, 3, 7, d); r(1, 11, 3, 2, c); r(12, 11, 3, 2, c); }
    r(3, 4, 10, 9, c); r(3, 4, 10, 1, l); r(3, 4, 1, 9, d); r(5, 0, 6, 5, l); r(5, 4, 6, 1, d);
    r(6, 2, 1, 1, '#7ff3ff'); r(9, 2, 1, 1, '#7ff3ff'); r(6, 7, 1, 3, d); r(9, 8, 2, 1, d); r(4, 10, 2, 1, '#5fa060'); r(10, 5, 2, 1, '#5fa060');
    r(4, 13, 3, 3, d); r(9, 13, 3, 3, d);
  },
  slime(r, f) {
    const c = '#4fd36b', d = '#2f9a48';
    if (f === 0) { r(5, 5, 6, 1, c); r(4, 6, 8, 1, c); r(3, 7, 10, 6, c); r(2, 10, 12, 4, c); r(2, 13, 12, 1, d); r(5, 7, 2, 2, '#c8ffd4'); r(6, 9, 1, 2, '#10301a'); r(9, 9, 1, 2, '#10301a'); }
    else { r(5, 7, 6, 1, c); r(3, 8, 10, 1, c); r(2, 9, 12, 5, c); r(1, 11, 14, 3, c); r(1, 13, 14, 1, d); r(4, 9, 2, 2, '#c8ffd4'); r(6, 10, 1, 2, '#10301a'); r(9, 10, 1, 2, '#10301a'); }
  },
  minislime(r, f) {
    const c = '#6fe388', d = '#2f9a48';
    const y = f ? 1 : 0; r(5, 9 + y, 6, 1, c); r(4, 10 + y, 8, 3 - y, c); r(4, 13, 8, 1, d); r(5, 10 + y, 1, 1, '#c8ffd4'); r(6, 11, 1, 1, '#10301a'); r(9, 11, 1, 1, '#10301a');
  },
  skeleton(r, f) {
    const b = '#ece6d6', d = '#a8a090';
    if (f === 0) { r(6, 13, 1, 4, b); r(9, 13, 1, 4, b); } else { r(7, 13, 1, 4, b); r(8, 13, 1, 3, b); }
    r(6, 12, 4, 1, d); r(7, 8, 1, 4, b); r(5, 8, 5, 1, b); r(5, 10, 5, 1, b); r(4, 8, 1, 3, d); r(10, 8, 1, 3, b);
    r(5, 2, 6, 5, b); r(5, 6, 6, 1, d); r(6, 4, 2, 2, EYE); r(9, 4, 1, 2, EYE); r(7, 4, 1, 1, '#ff3a3a'); r(6, 7, 4, 1, b);
    r(11, 4, 1, 7, '#b0a090'); r(10, 10, 3, 1, '#7a5a3a'); r(1, 8, 3, 4, '#6a4a2a'); r(2, 9, 1, 2, '#a07a4a');
  }
};
const monCache = {};
A.mon = (type, f) => { const k = type + f; return monCache[k] || (monCache[k] = sprite(16, type === 'skeleton' ? 18 : 16, (r) => MON_DRAW[type](r, f))); };

// ---------------------------------------------------------------- towers & rock rooms (16 × 24: rows 8..23 sit on the tile, 0..7 stick up above it)
const STONE = '#6e6a7e', STONE2 = '#4e4a5e', STONE3 = '#8c88a0';
function stoneBase(r, y0, x0, w) { r(x0, y0, w, 24 - y0, STONE); r(x0, y0, w, 1, STONE3); r(x0, y0, 1, 24 - y0, STONE2); for (let y = y0 + 3; y < 23; y += 3) r(x0 + 1, y, w - 2, 1, STONE2); for (let y = y0 + 1; y < 23; y += 6) { r(x0 + 4, y, 1, 2, STONE2); r(x0 + w - 4, y + 3, 1, 2, STONE2); } }
const STRUCT_DRAW = {
  archer(r, f) {
    stoneBase(r, 9, 3, 10); r(2, 7, 12, 3, STONE3); r(2, 9, 12, 1, STONE2); r(2, 5, 2, 2, STONE3); r(7, 5, 2, 2, STONE3); r(12, 5, 2, 2, STONE3);
    r(7, 13, 2, 4, '#1b1020'); r(7, 14, 2, 2, f ? '#ffb347' : '#3a2440');
    r(5, 1, 4, 5, '#2f6a3a'); r(6, 2, 3, 2, SKIN); r(8, 2, 1, 1, EYE); r(10, 0, 1, 6, WOOD); r(11, 1, 1, 1, WOOD); r(11, 4, 1, 1, WOOD); r(9, 3, 1, 1, '#ece6d6');
  },
  smage(r, f) {
    r(4, 13, 8, 11, '#d8d0bc'); r(4, 13, 8, 1, '#f0ead8'); r(4, 13, 1, 11, '#a8a090'); r(5, 16, 2, 2, EYE); r(9, 19, 2, 2, EYE); r(6, 21, 4, 1, '#a8a090');
    r(5, 5, 6, 8, '#4b2a7a'); r(5, 5, 1, 8, '#2e1850'); r(4, 11, 8, 2, '#4b2a7a'); r(6, 2, 4, 4, '#ece6d6'); r(5, 1, 6, 2, '#4b2a7a'); r(4, 3, 2, 3, '#4b2a7a');
    r(7, 3, 1, 1, '#7fd3ff'); r(9, 3, 1, 1, '#7fd3ff'); r(12, 1, 1, 12, '#b0a090'); r(11, 0, 3, 2, f ? '#e0f6ff' : '#7fd3ff');
  },
  ballista(r) { stoneBase(r, 14, 2, 12); r(4, 11, 8, 3, WOOD); r(4, 11, 8, 1, '#a07a4a'); r(5, 14, 2, 1, '#3a2a1a'); r(9, 14, 2, 1, '#3a2a1a'); },
  dragon(r, f) {
    stoneBase(r, 15, 3, 10);
    const c = '#4e6a5a', d = '#33483d', l = '#6e8c7a';
    r(3, 6, 9, 9, c); r(3, 6, 9, 1, l); r(3, 6, 1, 9, d); r(10, 9, 5, 4, c); r(10, 12, 5, 2, d); r(12, 9, 3, 1, l);
    r(2, 3, 2, 4, '#e8e2d0'); r(6, 3, 2, 4, '#e8e2d0'); r(2, 2, 1, 1, '#e8e2d0'); r(6, 2, 1, 1, '#e8e2d0');
    r(8, 8, 2, 2, f ? '#ffe27a' : '#ff7a2f'); r(13, 11, 2, 1, f ? '#ffb347' : '#2a1a14'); r(11, 13, 1, 1, '#e8e2d0'); r(13, 13, 1, 1, '#e8e2d0');
  },
  storm(r, f) {
    r(5, 5, 6, 19, '#6b4a2a'); r(5, 5, 1, 19, '#4a3018'); r(6, 5, 4, 1, '#8a6a4a');
    for (const y of [8, 14, 20]) { r(6, y, 1, 1, '#ffe85a'); r(9, y, 1, 1, '#ffe85a'); r(7, y + 2, 2, 1, '#2a1a0a'); }
    r(2, 10, 3, 2, '#8a6a4a'); r(11, 10, 3, 2, '#8a6a4a'); r(1, 9, 2, 1, '#8a6a4a'); r(13, 9, 2, 1, '#8a6a4a');
    r(6, 1, 4, 4, f ? '#fff6b0' : '#ffe85a'); r(7, 0, 2, 1, '#ffe85a'); r(6, 1, 1, 1, '#ffffff');
  },
  well(r, f) {
    r(2, 1, 1, 13, WOOD); r(13, 1, 1, 13, WOOD); r(1, 0, 14, 2, '#8a5a32'); r(1, 2, 14, 1, '#5a3a1a'); r(7, 2, 1, 6, '#5a3a1a'); r(6, 8, 3, 2, '#5a3a1a');
    r(2, 12, 12, 10, STONE); r(2, 12, 12, 1, STONE3); r(2, 12, 1, 10, STONE2); r(2, 16, 12, 1, STONE2); r(2, 20, 12, 1, STONE2); r(6, 12, 1, 4, STONE2); r(10, 17, 1, 3, STONE2);
    r(3, 11, 10, 2, f ? '#c89bff' : '#9b5cff'); r(5, 11, 2, 1, '#e8d8ff');
  },
  banner(r, f) {
    r(3, 0, 2, 24, '#5a3a1a'); r(3, 0, 1, 24, '#7a5230'); r(2, 0, 4, 1, GOLD); r(2, 21, 4, 3, STONE);
    const o = f ? 1 : 0; r(5, 2, 9, 11, '#b3243a'); r(5, 2, 9, 1, '#d84a5a'); r(5, 13, 3, 1 + o, '#b3243a'); r(11, 13, 3, 2 - o, '#b3243a');
    r(8, 5, 3, 3, '#ece6d6'); r(8, 8, 3, 1, '#ece6d6'); r(8, 6, 1, 1, EYE); r(10, 6, 1, 1, EYE); r(7, 10, 5, 1, GOLD);
  },
  crypt(r, f) {
    r(2, 8, 12, 16, STONE); r(2, 8, 12, 1, STONE3); r(2, 8, 1, 16, STONE2); r(3, 6, 10, 2, STONE3); r(5, 4, 6, 2, STONE3); r(7, 2, 2, 2, STONE3);
    r(5, 12, 6, 12, '#120c18'); r(6, 11, 4, 1, '#120c18'); r(6, 14, 4, 6, f ? '#3a8a4a' : '#2a6a3a'); r(7, 15, 2, 3, '#7aff9a');
    r(6, 8, 4, 3, '#ece6d6'); r(6, 9, 1, 1, EYE); r(9, 9, 1, 1, EYE); r(2, 22, 12, 2, STONE2);
  },
  // floor pieces (16 × 16)
  collapse(r) {
    const R = (x, y, w, h, c) => r(x, y, w, h, c);
    R(1, 8, 6, 6, '#6a6070'); R(1, 8, 6, 1, '#8a8090'); R(6, 4, 7, 8, '#7a7080'); R(6, 4, 7, 1, '#9a90a0'); R(6, 4, 1, 8, '#5a5060');
    R(9, 10, 6, 5, '#5e5464'); R(9, 10, 6, 1, '#7e7484'); R(3, 2, 4, 4, '#847a8c'); R(3, 2, 4, 1, '#a49aac'); R(2, 13, 4, 2, '#4e4454');
    R(8, 7, 2, 1, '#3e3444'); R(11, 12, 2, 1, '#3e3444'); R(4, 11, 1, 1, '#3e3444');
  },
  gold(r, f) {
    r(3, 10, 10, 4, GOLD2); r(4, 9, 8, 1, GOLD); r(5, 8, 6, 1, GOLD); r(6, 7, 4, 1, GOLD); r(4, 10, 8, 2, GOLD); r(7, 6, 2, 1, '#fff0a8');
    r(5, 9, 1, 1, '#fff6c8'); r(9, 8, 1, 1, '#fff6c8'); r(10, 11, 1, 1, '#ff3a5a'); r(6, 11, 1, 1, '#3aa0ff'); r(2, 13, 2, 1, GOLD); r(12, 12, 2, 1, GOLD);
    if (f) { r(11, 4, 1, 3, '#ffffff'); r(10, 5, 3, 1, '#ffffff'); }
  },
  spikes(r, f) {
    r(2, 2, 12, 12, '#3a3546'); r(2, 2, 12, 1, '#55506a'); r(2, 13, 12, 1, '#26222f');
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
      const px = 4 + x * 3, py = 4 + y * 3;
      if (f) { r(px, py - 2, 1, 3, '#e8eef8'); r(px + 1, py - 1, 1, 2, '#9aa6ba'); r(px, py - 3, 1, 1, '#ffffff'); }
      else r(px, py, 2, 1, '#15121c');
    }
  },
  gas(r) {
    r(3, 3, 10, 10, '#4a4a3a'); r(3, 3, 10, 1, '#6a6a52'); r(3, 12, 10, 1, '#2a2a20');
    for (let x = 4; x < 12; x += 2) r(x, 5, 1, 6, '#1a1a12'); r(4, 7, 8, 1, '#5a5a46'); r(6, 4, 4, 1, '#8cff5a');
  },
  pit(r, f) {
    r(2, 3, 12, 11, '#544c62'); r(3, 2, 10, 1, '#544c62'); r(3, 14, 10, 1, '#544c62'); r(2, 3, 12, 1, '#746c82');
    r(3, 4, 10, 9, f ? '#2a1a30' : '#05030a'); r(4, 3, 8, 1, f ? '#2a1a30' : '#05030a'); r(4, 13, 8, 1, f ? '#2a1a30' : '#05030a');
    if (f) { r(3, 6, 10, 1, '#7a5230'); r(3, 9, 10, 1, '#7a5230'); r(3, 12, 10, 1, '#7a5230'); }
    else { r(5, 10, 1, 2, '#e8eef8'); r(9, 9, 1, 3, '#e8eef8'); r(7, 11, 1, 1, '#9aa6ba'); }
  }
};
const structCache = {};
A.TALL = { archer: 1, smage: 1, ballista: 1, dragon: 1, storm: 1, well: 1, banner: 1, crypt: 1 };
A.struct = (id, f) => {
  const k = id + (f || 0); if (structCache[k]) return structCache[k];
  const tall = A.TALL[id];
  return (structCache[k] = sprite(16, tall ? 24 : 16, (r) => STRUCT_DRAW[id](r, f || 0)));
};
A.ballistaArm = sprite(16, 7, (r) => { r(1, 0, 2, 7, WOOD); r(2, 0, 1, 1, '#a07a4a'); r(2, 6, 1, 1, '#a07a4a'); r(3, 3, 11, 1, '#5a3a1a'); r(12, 2, 3, 3, '#c9d1de'); r(14, 3, 1, 1, '#ffffff'); r(3, 0, 1, 1, '#d8d0bc'); r(3, 6, 1, 1, '#d8d0bc'); });

// spell art (16 × 16)
const SPELL_DRAW = {
  fireball(r) { r(5, 4, 7, 8, '#ff7a2f'); r(4, 6, 9, 4, '#ff7a2f'); r(6, 6, 4, 4, '#ffd23a'); r(7, 7, 2, 2, '#fff6c8'); r(2, 7, 2, 2, '#ff5a2a'); r(1, 9, 2, 1, '#c03a1a'); r(3, 11, 2, 1, '#ff5a2a'); r(9, 2, 2, 2, '#ff9a3a'); },
  nova(r) { r(7, 1, 2, 14, '#9be7ff'); r(1, 7, 14, 2, '#9be7ff'); r(3, 3, 2, 2, '#7fd3ff'); r(11, 3, 2, 2, '#7fd3ff'); r(3, 11, 2, 2, '#7fd3ff'); r(11, 11, 2, 2, '#7fd3ff'); r(6, 6, 4, 4, '#e8fbff'); r(5, 1, 1, 1, '#9be7ff'); r(10, 1, 1, 1, '#9be7ff'); r(5, 14, 1, 1, '#9be7ff'); r(10, 14, 1, 1, '#9be7ff'); },
  rust(r) { r(3, 2, 10, 9, '#aab4c6'); r(4, 11, 8, 2, '#aab4c6'); r(6, 13, 4, 1, '#aab4c6'); r(3, 2, 10, 1, '#d8e0ee'); r(5, 4, 3, 3, '#c0602a'); r(9, 7, 3, 4, '#a84a1a'); r(6, 9, 2, 2, '#d8803a'); r(8, 3, 1, 8, '#2a1a14'); r(7, 6, 1, 3, '#2a1a14'); },
  ritual(r) { r(4, 9, 8, 5, '#2a1a3a'); r(3, 13, 10, 1, '#4b2a7a'); r(5, 6, 6, 4, '#ece6d6'); r(6, 7, 1, 1, EYE); r(9, 7, 1, 1, EYE); r(1, 8, 2, 6, '#ece6d6'); r(13, 8, 2, 6, '#ece6d6'); r(1, 6, 2, 2, '#c58bff'); r(13, 6, 2, 2, '#c58bff'); r(6, 2, 4, 3, '#b47bff'); r(7, 1, 2, 1, '#e8d8ff'); },
  scheme(r) { r(3, 3, 10, 10, '#e8d8b0'); r(2, 2, 12, 2, '#c8b080'); r(2, 12, 12, 2, '#c8b080'); r(5, 5, 6, 1, '#7a5a3a'); r(5, 7, 5, 1, '#7a5a3a'); r(5, 9, 6, 1, '#7a5a3a'); r(9, 10, 3, 3, '#c0303a'); r(10, 11, 1, 1, '#ff8a8a'); },
  hoard(r) { r(2, 7, 12, 7, '#7a4a22'); r(2, 7, 12, 1, '#a0682e'); r(2, 10, 12, 1, GOLD2); r(7, 9, 2, 3, GOLD); r(3, 4, 10, 3, GOLD); r(4, 3, 8, 1, '#fff0a8'); r(5, 5, 1, 1, '#ff3a5a'); r(10, 5, 1, 1, '#3aa0ff'); }
};
const spellCache = {};
A.spell = (id) => spellCache[id] || (spellCache[id] = sprite(16, 16, (r) => SPELL_DRAW[id](r)));

// ---------------------------------------------------------------- glyphs (8 × 8 icons: '#' colour, '+' highlight, '-' shade)
const GLYPHS = {
  flame: ['...#....', '...##...', '..###.#.', '.#####..', '.##+###.', '##+++##.', '.#+++##.', '..####..'],
  shard: ['....#...', '...##...', '..#+#...', '..#+##..', '.##+##..', '.#+###..', '..####..', '...##...'],
  snow: ['...#....', '.#.#.#..', '..###...', '#######.', '..###...', '.#.#.#..', '...#....', '........'],
  drop: ['...#....', '...#....', '..###...', '..###...', '.##+##..', '.#+###..', '.#####..', '..###...'],
  burst: ['#..#..#.', '.#.#.#..', '..###...', '###+###.', '..###...', '.#.#.#..', '#..#..#.', '........'],
  swirl: ['.#..#...', '#..#..#.', '.#..#..#', '#..#..#.', '.#..#..#', '..#..#..', '.#..#...', '........'],
  bolt: ['....##..', '...##...', '..##....', '.######.', '....##..', '...##...', '..##....', '.#......'],
  skull: ['..####..', '.######.', '#..##..#', '#..##..#', '.######.', '..####..', '..#.#.#.', '........'],
  spike: ['........', '..#...#.', '..#...#.', '.###.###', '.###.###', '########', '########', '........'],
  orb: ['..####..', '.#++###.', '#++#####', '#+######', '########', '#######-', '.#####-.', '..####..'],
  coin: ['..####..', '.##++##.', '##+##-##', '##+##-##', '##+##-##', '##+---##', '.######.', '..####..'],
  drum: ['.#....#.', '..#..#..', '.######.', '#++++++#', '#-#--#-#', '#--##--#', '#-#--#-#', '.######.'],
  gem: ['..####..', '.#+##-#.', '#++##--#', '########', '.#+##-#.', '..#+#-..', '...##...', '........'],
  crown: ['........', '#..#..#.', '##.#.##.', '#######.', '#+#+#+#.', '#######.', '........', '........'],
  eye: ['........', '..####..', '.#....#.', '#..##..#', '#..##..#', '.#....#.', '..####..', '........'],
  shield: ['.######.', '#++####-', '#+#####-', '#+#####-', '.#####-.', '.#####-.', '..###-..', '...#-...'],
  card: ['.######.', '#++++++#', '#+####+#', '#+#..#+#', '#+#..#+#', '#+####+#', '#++++++#', '.######.'],
  chain: ['.##.....', '#..#....', '#..##...', '.##..##.', '....#..#', '....#..#', '.....##.', '........'],
  heart: ['.##.##..', '#######.', '#+#####.', '#######.', '.#####..', '..###...', '...#....', '........'],
  boot: ['...###..', '...###..', '...###..', '...###..', '..####..', '.######.', '########', '........'],
  sack: ['..#.#...', '...#....', '..###...', '.#####..', '##+####.', '#+#####.', '#######.', '.#####..'],
  sword: ['......##', '.....###', '....###.', '.#.###..', '..###...', '..##....', '.#..#...', '#.......'],
  clock: ['..####..', '.#.#..#.', '#..#...#', '#..###.#', '#......#', '.#....#.', '..####..', '........'],
  star: ['...#....', '...#....', '..###...', '#######.', '.#####..', '..###...', '.##.##..', '.#...#..'],
  play: ['.#......', '.##.....', '.###....', '.####...', '.###....', '.##.....', '.#......', '........'],
  pause: ['........', '.##.##..', '.##.##..', '.##.##..', '.##.##..', '.##.##..', '.##.##..', '........'],
  ff: ['........', '#...#...', '##..##..', '###.###.', '##..##..', '#...#...', '........', '........'],
  book: ['.######.', '#+#####.', '#+#--##.', '#+#####.', '#+#--##.', '#+#####.', '#######.', '.#......'],
  gear: ['...##...', '.######.', '.##..##.', '###..###', '###..###', '.##..##.', '.######.', '...##...'],
  cross: ['...##...', '...##...', '.######.', '.######.', '...##...', '...##...', '...##...', '........'],
  door: ['..####..', '.#----#.', '#------#', '#------#', '#----+-#', '#------#', '#------#', '########'],
  sound: ['...#....', '..##..#.', '####.#..', '####.#.#', '####.#..', '..##..#.', '...#....', '........'],
  mute: ['...#....', '..##....', '####.#.#', '####..#.', '####.#.#', '..##....', '...#....', '........'],
  note: ['...####.', '...#..#.', '...#..#.', '...#..#.', '.###.##.', '####.##.', '.##.....', '........'],
  trophy: ['########', '#.####.#', '.######.', '..####..', '...##...', '...##...', '..####..', '.######.']
};
const glyphCache = {};
A.glyph = (name, col) => {
  const k = name + col; if (glyphCache[k]) return glyphCache[k];
  const rows = GLYPHS[name] || GLYPHS.star, hi = shade(col, 0.55), lo = shade(col, -0.4);
  return (glyphCache[k] = sprite(8, 8, (r) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') r(x, y, 1, 1, col); else if (ch === '+') r(x, y, 1, 1, hi); else if (ch === '-') r(x, y, 1, 1, lo); })), null));
};
// glyph as an <img> data URL (scaled ×3 with a dark outline so it reads on any background)
const gUrl = {};
A.glyphURL = (name, col) => {
  const k = name + col; if (gUrl[k]) return gUrl[k];
  const g = A.glyph(name, col), c = cv(10, 10), x = c.getContext('2d'); x.drawImage(g, 1, 1); outline(c, '#0b0712');
  const big = cv(30, 30), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, 30, 30);
  return (gUrl[k] = big.toDataURL());
};
A.gimg = (name, col, cls) => `<img class="gl ${cls || ''}" src="${A.glyphURL(name, col)}" alt="">`;

// ---------------------------------------------------------------- card / hero icons for the DOM
const artUrl = {};
A.cardArt = (id) => {
  if (artUrl[id]) return artUrl[id];
  const card = DD.CARDS[id], K = DD.KINDS[card.kind];
  const c = cv(48, 48), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const grd = g.createRadialGradient(24, 26, 4, 24, 26, 30); grd.addColorStop(0, shade(K.dark, 0.25)); grd.addColorStop(1, '#0d0a16');
  g.fillStyle = grd; g.fillRect(0, 0, 48, 48);
  let s, sc = 2, ox, oy;
  if (card.kind === 'spell') s = A.spell(id);
  else if (card.kind === 'monster') s = A.mon(id, 0);
  else if (id === 'flood' || id === 'lava' || id === 'frost') s = A.floorFx(id);
  else s = A.struct(id, id === 'spikes' ? 1 : 0);
  if (s.height > 20) sc = 1.75;
  ox = Math.round(24 - s.width * sc / 2); oy = Math.round(25 - s.height * sc / 2);
  g.drawImage(s, ox, oy, s.width * sc, s.height * sc);
  return (artUrl[id] = c.toDataURL());
};
A.heroIcon = (cls) => {
  const k = 'h_' + cls; if (artUrl[k]) return artUrl[k];
  const c = cv(36, 40), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(A.hero(cls, 0), 2, 2, 32, 36);
  return (artUrl[k] = c.toDataURL());
};
A.monIcon = (type) => {
  const k = 'm_' + type; if (artUrl[k]) return artUrl[k];
  const s = A.mon(type, 0), c = cv(36, 40), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(s, 2, 40 - s.height * 2 - 2, 32, s.height * 2);
  return (artUrl[k] = c.toDataURL());
};
// static icon for the procedural floor traps (used on cards)
A.floorFx = (id) => sprite(16, 16, (r) => {
  if (id === 'lava') { r(1, 2, 14, 12, '#3a1a10'); r(2, 3, 12, 10, '#c0301a'); r(3, 4, 10, 8, '#ff6a1a'); r(5, 5, 6, 5, '#ffb347'); r(7, 6, 2, 2, '#fff0a8'); r(10, 9, 2, 2, '#ffd23a'); r(4, 10, 2, 1, '#ffd23a'); }
  if (id === 'flood') { r(1, 2, 14, 12, '#1a2a4a'); r(2, 3, 12, 10, '#2a5aa8'); r(3, 5, 4, 1, '#8ac8ff'); r(8, 8, 5, 1, '#8ac8ff'); r(4, 11, 3, 1, '#5a9ae0'); r(10, 4, 2, 1, '#5a9ae0'); }
  if (id === 'frost') { r(3, 2, 10, 12, '#0e2236'); r(2, 3, 12, 10, '#0e2236'); r(4, 3, 8, 1, '#7fd3ff'); r(4, 12, 8, 1, '#7fd3ff'); r(3, 4, 1, 8, '#7fd3ff'); r(12, 4, 1, 8, '#7fd3ff'); r(7, 5, 2, 6, '#c8f4ff'); r(5, 7, 6, 2, '#c8f4ff'); r(5, 5, 1, 1, '#9be7ff'); r(10, 10, 1, 1, '#9be7ff'); }
});

// ---------------------------------------------------------------- tiles
A.PAL = [
  { floor: '#4d4b68', seam: '#2b2a40', rock: '#15131e', rockHi: '#211e2e', face: '#3f3b5e', faceHi: '#59547c', faceLo: '#29263e', torch: '#ffb347', mist: '#7a5cff', bg: '#0a0912' },
  { floor: '#5c443b', seam: '#33221e', rock: '#190e0c', rockHi: '#271714', face: '#57342b', faceHi: '#74463b', faceLo: '#3a201b', torch: '#ff7a2a', mist: '#ff4a1a', bg: '#100605' },
  { floor: '#4b3e60', seam: '#2a2038', rock: '#130e1a', rockHi: '#1f1729', face: '#43325c', faceHi: '#5d4a7c', faceLo: '#2d2142', torch: '#6af0d0', mist: '#40ffd0', bg: '#08060c' }
];
A.floorTile = (act, seed) => sprite(16, 16, (r) => {
  const P = A.PAL[act], R = rng(seed * 7919 + act * 31);
  r(0, 0, 16, 16, P.seam);
  const slabs = [[0, 0, 8, 8], [8, 0, 8, 8], [0, 8, 8, 8], [8, 8, 8, 8]];
  if (R() < 0.35) slabs.splice(0, 2, [0, 0, 16, 8]); else if (R() < 0.3) slabs.splice(2, 2, [0, 8, 16, 8]);
  for (const [x, y, w, h] of slabs) {
    const c = shade(P.floor, (R() - 0.5) * 0.14);
    r(x, y, w - 1, h - 1, c); r(x, y, w - 1, 1, shade(c, 0.1)); r(x, y + h - 2, w - 1, 1, shade(c, -0.12));
  }
  for (let i = 0; i < 8; i++) r(Math.floor(R() * 16), Math.floor(R() * 16), 1, 1, shade(P.floor, (R() - 0.5) * 0.35));
  if (R() < 0.25) { let x = 2 + Math.floor(R() * 10), y = 2 + Math.floor(R() * 10); for (let i = 0; i < 4; i++) { r(x, y, 1, 1, P.seam); x += R() < 0.5 ? 1 : 0; y += 1; } }
  const deco = R();
  if (deco < (act === 2 ? 0.14 : 0.06)) { const x = 3 + Math.floor(R() * 8), y = 4 + Math.floor(R() * 8); r(x, y, 4, 1, '#bdb6a2'); r(x - 1, y - 1, 1, 1, '#bdb6a2'); r(x + 4, y + 1, 1, 1, '#bdb6a2'); }
  else if (deco < 0.09) { const x = 4 + Math.floor(R() * 7), y = 4 + Math.floor(R() * 7); r(x, y, 3, 2, '#bdb6a2'); r(x, y + 2, 1, 1, '#bdb6a2'); r(x + 2, y + 2, 1, 1, '#bdb6a2'); r(x, y, 1, 1, '#1b1020'); r(x + 2, y, 1, 1, '#1b1020'); }
}, null);
// rock: dark rough top, plus a lit brick front face (`face`) when floor lies below on screen
A.rockTile = (act, seed, face) => sprite(16, 16, (r) => {
  const P = A.PAL[act], R = rng(seed * 104729 + act * 17 + (face ? 5 : 0));
  r(0, 0, 16, 16, P.rock);
  const top = face ? 10 : 16;
  for (let i = 0; i < 7; i++) { const w = 2 + Math.floor(R() * 3), h = 1 + Math.floor(R() * 2), x = Math.floor(R() * (16 - w)), y = Math.floor(R() * Math.max(1, top - h)); r(x, y, w, h, P.rockHi); r(x, y, w, 1, shade(P.rockHi, 0.15)); }
  for (let i = 0; i < 6; i++) r(Math.floor(R() * 16), Math.floor(R() * top), 1, 1, shade(P.rock, 0.45));
  if (act === 1 && R() < 0.2) { const x = 2 + Math.floor(R() * 11); r(x, 2, 1, 3, '#ff6a1a'); r(x + 1, 4, 1, 2, '#c0301a'); }
  if (act === 2 && R() < 0.15) { const x = 2 + Math.floor(R() * 10); r(x, 3, 2, 2, '#40c0a0'); r(x, 3, 1, 1, '#a0fff0'); }
  if (face) {
    r(0, 10, 16, 6, P.face); r(0, 10, 16, 1, P.faceHi);
    r(0, 12, 16, 1, P.faceLo); r(0, 14, 16, 1, P.faceLo);
    const o = Math.floor(R() * 4); for (let x = o; x < 16; x += 5) r(x, 11, 1, 1, P.faceLo); for (let x = o + 2; x < 16; x += 5) r(x, 13, 1, 1, P.faceLo);
    r(0, 15, 16, 1, shade(P.faceLo, -0.35));
  }
}, null);
A.chasmTile = (act, seed) => sprite(16, 16, (r) => {
  const R = rng(seed * 31 + 3);
  if (act === 1) { r(0, 0, 16, 16, '#5a1206'); r(1, 1, 14, 14, '#a8280a'); for (let i = 0; i < 6; i++) r(Math.floor(R() * 14) + 1, Math.floor(R() * 14) + 1, 2, 1, '#ff7a1a'); }
  else { r(0, 0, 16, 16, '#030207'); for (let i = 0; i < 4; i++) r(Math.floor(R() * 16), Math.floor(R() * 16), 1, 1, '#2a1a40'); }
}, null);
A.vaultSprite = sprite(16, 16, (r) => {
  r(2, 6, 12, 8, '#7a4a22'); r(2, 6, 12, 1, '#a0682e'); r(2, 9, 12, 1, GOLD2); r(2, 6, 1, 8, '#5a3414'); r(13, 6, 1, 8, '#5a3414');
  r(7, 8, 2, 3, GOLD); r(7, 9, 2, 1, '#3a2a10'); r(1, 3, 14, 3, '#8a5a2a'); r(1, 3, 14, 1, '#b07a3a'); r(3, 13, 10, 1, '#3a2010');
});
A.gateSprite = sprite(16, 16, (r) => {
  r(1, 0, 14, 16, '#3a3546'); r(1, 0, 14, 1, '#5a5468'); r(3, 2, 10, 14, '#08060c'); r(4, 1, 8, 1, '#08060c');
  for (let x = 4; x < 13; x += 2) r(x, 2, 1, 6, '#6a6478'); r(3, 7, 10, 1, '#6a6478'); r(3, 2, 10, 1, '#4a4458');
}, null);
})();
