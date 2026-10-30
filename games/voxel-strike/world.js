'use strict';
// =====================================================================
// Voxel Strike — the world: blocks, pixel textures, arena generation,
// chunk meshes with soft corner shadows, ray casts and collisions.
// =====================================================================
const VS = window.VS = {};
const W = VS.W = 72, H = VS.H = 30, D = VS.D = 72, CH = VS.CH = 16;
const B = VS.B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, BRICK: 4, PLANK: 5, LOG: 6, LEAVES: 7, SAND: 8, CRATE: 9, METAL: 10, CONCRETE: 11 };
// tiles: [top, side, bottom] in the texture atlas · hp: bullets needed to break it (0 = bullets can't) · color: debris colour
const BLOCKS = VS.BLOCKS = {
  1: { t: [0, 1, 2], hp: 0, color: 0x5f9f35 }, 2: { t: [2, 2, 2], hp: 0, color: 0x866043 },
  3: { t: [3, 3, 3], hp: 0, color: 0x7d7d7d }, 4: { t: [4, 4, 4], hp: 0, color: 0xa04637 },
  5: { t: [5, 5, 5], hp: 6, color: 0xb08a55 }, 6: { t: [7, 6, 7], hp: 10, color: 0x6b4f2e },
  7: { t: [8, 8, 8], hp: 1, color: 0x3f8a2f }, 8: { t: [9, 9, 9], hp: 0, color: 0xdccf8f },
  9: { t: [10, 10, 10], hp: 4, color: 0x9a6b3a }, 10: { t: [11, 11, 11], hp: 0, color: 0x6e737c, hard: true },
  11: { t: [12, 12, 12], hp: 0, color: 0xb9b9b4 }
};

// small seeded random generator so every player builds the same map from the same seed
const rng = VS.rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
VS.hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// ---------------------------------------------------------------------
// texture atlas: 4×4 tiles of 16×16 pixel art, drawn in code
// ---------------------------------------------------------------------
VS.makeAtlas = function () {
  const S = 16, N = 4, c = document.createElement('canvas'); c.width = c.height = S * N;
  const g = c.getContext('2d'), r = rng(1234);
  const px = (tile, x, y, col) => { g.fillStyle = col; g.fillRect((tile % N) * S + x, Math.floor(tile / N) * S + y, 1, 1); };
  const sh = (rgb, f) => `rgb(${rgb.map(v => Math.max(0, Math.min(255, Math.round(v * f)))).join(',')})`;
  const noise = (tile, rgb, amt) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) px(tile, x, y, sh(rgb, 1 - amt + r() * amt * 2)); };
  const GR = [95, 159, 53], DI = [134, 96, 67];
  noise(0, GR, 0.16);                                                        // grass top
  noise(1, DI, 0.18); for (let x = 0; x < S; x++) { const h = 3 + Math.floor(r() * 3); for (let y = 0; y < h; y++) px(1, x, y, sh(GR, 0.85 + r() * 0.3)); }
  noise(2, DI, 0.2);                                                         // dirt
  noise(3, [125, 125, 128], 0.12); for (let k = 0; k < 14; k++) px(3, Math.floor(r() * S), Math.floor(r() * S), sh([90, 90, 94], 1)); // stone
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {                   // brick
    const off = Math.floor(y / 4) % 2 ? 4 : 0, mortar = y % 4 === 3 || (x + off) % 8 === 7;
    px(4, x, y, mortar ? sh([205, 198, 186], 0.92 + r() * 0.08) : sh([165, 72, 55], 0.82 + r() * 0.3));
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {                   // planks
    const line = y % 4 === 3, seam = (x + (Math.floor(y / 4) * 5)) % 16 === 0;
    px(5, x, y, line || seam ? sh([120, 88, 50], 1) : sh([182, 142, 88], 0.88 + r() * 0.2));
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) px(6, x, y, sh([104, 78, 46], (x % 4 === 0 ? 0.75 : 0.95) + r() * 0.15)); // log side
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {                   // log top rings
    const d = Math.hypot(x - 7.5, y - 7.5); px(7, x, y, d > 7 ? sh([104, 78, 46], 0.9) : sh([176, 140, 90], Math.floor(d) % 3 === 0 ? 0.8 : 1));
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) px(8, x, y, r() < 0.12 ? sh([30, 70, 25], 1) : sh([63, 138, 47], 0.75 + r() * 0.4)); // leaves
  noise(9, [220, 207, 143], 0.08);                                           // sand
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {                   // crate
    const edge = x < 2 || y < 2 || x > 13 || y > 13, diag = Math.abs(x - y) < 1.5 || Math.abs(x + y - 15) < 1.5;
    px(10, x, y, edge ? sh([110, 74, 38], 0.9 + r() * 0.1) : diag ? sh([128, 88, 46], 0.95) : sh([170, 120, 66], 0.9 + r() * 0.15));
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {                   // metal plate
    const rivet = (x === 2 || x === 13) && (y === 2 || y === 13), edge = x === 0 || y === 0 || x === 15 || y === 15;
    px(11, x, y, rivet ? '#c9ced6' : edge ? sh([80, 84, 92], 1) : sh([110, 115, 124], 0.93 + r() * 0.1));
  }
  noise(12, [185, 185, 180], 0.06);                                          // concrete
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  return tex;
};

// ---------------------------------------------------------------------
// the world grid
// ---------------------------------------------------------------------
class World {
  constructor(seed) {
    this.seed = seed; this.data = new Uint8Array(W * H * D); this.hp = new Map();
    this.changes = new Map();          // every block changed during the round (sent to players who join late)
    this.dirty = new Set(); this.meshes = new Map(); this.spawns = [];
    generate(this);
    for (let cx = 0; cx < W / CH; cx++) for (let cz = 0; cz < Math.ceil(D / CH); cz++) this.dirty.add(cx + ',' + cz);
  }
  get(x, y, z) { if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return 0; return this.data[(y * D + z) * W + x]; }
  raw(x, y, z, b) { this.data[(y * D + z) * W + x] = b; }
  solid(x, y, z) {                     // for collisions: the arena edge is a wall, the sky is open
    if (y < 0) return true; if (y >= H) return false;
    if (x < 0 || z < 0 || x >= W || z >= D) return true;
    return this.data[(y * D + z) * W + x] !== 0;
  }
  set(x, y, z, b) {
    if (x < 0 || y < 1 || z < 0 || x >= W || y >= H || z >= D) return false;
    this.raw(x, y, z, b); this.hp.delete(x + ',' + y + ',' + z); this.changes.set(x + ',' + y + ',' + z, b);
    const cx = Math.floor(x / CH), cz = Math.floor(z / CH);
    this.dirty.add(cx + ',' + cz);
    if (x % CH === 0) this.dirty.add((cx - 1) + ',' + cz); if (x % CH === CH - 1) this.dirty.add((cx + 1) + ',' + cz);
    if (z % CH === 0) this.dirty.add(cx + ',' + (cz - 1)); if (z % CH === CH - 1) this.dirty.add(cx + ',' + (cz + 1));
    return true;
  }
  // bullets chip away at crates, planks, logs and leaves
  damageBlock(x, y, z, n) {
    const b = this.get(x, y, z), def = BLOCKS[b]; if (!def || !def.hp) return false;
    const k = x + ',' + y + ',' + z, left = (this.hp.has(k) ? this.hp.get(k) : def.hp) - n;
    if (left > 0) { this.hp.set(k, left); return false; }
    this.set(x, y, z, 0); return true;
  }
  // grenades blow a round hole (the metal floor and arena walls survive)
  explode(cx, cy, cz, r) {
    const out = [];
    for (let x = Math.floor(cx - r); x <= cx + r; x++) for (let y = Math.max(1, Math.floor(cy - r)); y <= cy + r; y++) for (let z = Math.floor(cz - r); z <= cz + r; z++) {
      const b = this.get(x, y, z); if (!b || BLOCKS[b].hard) continue;
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 + (z + 0.5 - cz) ** 2 <= r * r) { out.push([x, y, z, b]); this.set(x, y, z, 0); }
    }
    return out;
  }
  // DDA ray march through the grid → first solid block, its face normal and the distance
  raycast(o, d, max) {
    let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z);
    const sx = Math.sign(d.x), sy = Math.sign(d.y), sz = Math.sign(d.z);
    const tdx = sx ? Math.abs(1 / d.x) : Infinity, tdy = sy ? Math.abs(1 / d.y) : Infinity, tdz = sz ? Math.abs(1 / d.z) : Infinity;
    let tx = sx ? ((sx > 0 ? x + 1 - o.x : o.x - x) * tdx) : Infinity, ty = sy ? ((sy > 0 ? y + 1 - o.y : o.y - y) * tdy) : Infinity, tz = sz ? ((sz > 0 ? z + 1 - o.z : o.z - z) * tdz) : Infinity;
    let t = 0, nx = 0, ny = 0, nz = 0;
    while (t <= max) {
      const b = (x < 0 || z < 0 || x >= W || z >= D || y >= H) ? 0 : (y < 0 ? B.METAL : this.data[(y * D + z) * W + x]);
      if (b) return { x, y, z, b, nx, ny, nz, dist: t };
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; nx = -sx; ny = 0; nz = 0; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; nx = 0; ny = -sy; nz = 0; }
      else { z += sz; t = tz; tz += tdz; nx = 0; ny = 0; nz = -sz; }
      if (y < -1 || y > H + 1 || x < -2 || z < -2 || x > W + 1 || z > D + 1) return null;
    }
    return null;
  }
  // is there a clear line between two points?
  clear(a, b) {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length(); if (len < 0.01) return true;
    d.divideScalar(len); const h = this.raycast(a, d, len); return !h;
  }
  // move a box (feet position, half width, height) through the world, one axis at a time
  move(p, v, dt, hw, ht) {
    const res = { ground: false, wall: false, ceil: false };
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)) * dt / 0.35));
    const sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      for (const ax of ['y', 'x', 'z']) {
        const dv = v[ax] * sdt; if (!dv) continue;
        p[ax] += dv;
        const x0 = Math.floor(p.x - hw), x1 = Math.floor(p.x + hw - 1e-6), y0 = Math.floor(p.y), y1 = Math.floor(p.y + ht - 1e-6), z0 = Math.floor(p.z - hw), z1 = Math.floor(p.z + hw - 1e-6);
        let hit = false;
        for (let x = x0; x <= x1 && !hit; x++) for (let y = y0; y <= y1 && !hit; y++) for (let z = z0; z <= z1 && !hit; z++) if (this.solid(x, y, z)) hit = true;
        if (!hit) continue;
        if (ax === 'y') { if (dv < 0) { p.y = y0 + 1; res.ground = true; } else { p.y = y1 - ht; res.ceil = true; } }
        else if (ax === 'x') { p.x = dv > 0 ? x1 - hw : x0 + 1 + hw; res.wall = true; }
        else { p.z = dv > 0 ? z1 - hw : z0 + 1 + hw; res.wall = true; }
        v[ax] = 0;
      }
    }
    return res;
  }
  boxFree(x, y, z, hw, ht) {
    for (let bx = Math.floor(x - hw); bx <= Math.floor(x + hw - 1e-6); bx++) for (let by = Math.floor(y); by <= Math.floor(y + ht - 1e-6); by++) for (let bz = Math.floor(z - hw); bz <= Math.floor(z + hw - 1e-6); bz++) if (this.solid(bx, by, bz)) return false;
    return true;
  }
  groundAt(x, z) { for (let y = H - 1; y > 0; y--) if (this.get(x, y, z)) return y + 1; return 1; }
}
VS.World = World;

// ---------------------------------------------------------------------
// arena generator: rolling grass, buildings with doors / windows / roofs,
// crate cover, trees and a metal wall around the edge
// ---------------------------------------------------------------------
function generate(w) {
  const r = rng(w.seed), hm = new Int16Array(W * D);
  const lattice = (step) => { const gw = Math.ceil(W / step) + 2, gd = Math.ceil(D / step) + 2, v = []; for (let i = 0; i < gw * gd; i++) v.push(r()); return (x, z) => {
    const fx = x / step, fz = z / step, ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz, s = (t) => t * t * (3 - 2 * t);
    const a = v[iz * gw + ix], b = v[iz * gw + ix + 1], c = v[(iz + 1) * gw + ix], d = v[(iz + 1) * gw + ix + 1];
    return (a + (b - a) * s(tx)) + ((c + (d - c) * s(tx)) - (a + (b - a) * s(tx))) * s(tz); }; };
  const n1 = lattice(14), n2 = lattice(6), n3 = lattice(10);
  for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) {
    const h = 4 + Math.round(n1(x, z) * 3 + n2(x, z) * 1.2 - 1.6); hm[z * W + x] = h;
    w.raw(x, 0, z, B.METAL);
    for (let y = 1; y < h; y++) w.raw(x, y, z, y < h - 2 ? B.STONE : B.DIRT);
    w.raw(x, h, z, n3(x, z) > 0.72 ? B.SAND : B.GRASS);
  }
  const used = [];                                        // rectangles taken by buildings
  const free = (x0, z0, x1, z1, m) => used.every(u => x1 + m < u[0] || x0 - m > u[2] || z1 + m < u[1] || z0 - m > u[3]);
  const mats = [B.BRICK, B.CONCRETE, B.PLANK, B.STONE, B.BRICK];
  for (let tries = 0, built = 0; tries < 80 && built < 9; tries++) {
    const bw = 7 + Math.floor(r() * 7), bd = 7 + Math.floor(r() * 7);
    const x0 = 4 + Math.floor(r() * (W - bw - 8)), z0 = 4 + Math.floor(r() * (D - bd - 8)), x1 = x0 + bw - 1, z1 = z0 + bd - 1;
    if (!free(x0, z0, x1, z1, 4)) continue;
    used.push([x0, z0, x1, z1]); built++;
    let top = 0; for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) top = Math.max(top, hm[z * W + x]);
    const y0 = top + 1, mat = mats[Math.floor(r() * mats.length)], floors = r() < 0.4 ? 2 : 1, wh = floors * 4;
    for (let x = x0 - 1; x <= x1 + 1; x++) for (let z = z0 - 1; z <= z1 + 1; z++) {   // level the ground and lay a floor
      for (let y = 1; y < y0; y++) w.raw(x, y, z, B.STONE);
      w.raw(x, y0 - 1, z, (x < x0 || x > x1 || z < z0 || z > z1) ? B.GRASS : B.CONCRETE);
      for (let y = y0; y < H; y++) w.raw(x, y, z, 0);
      hm[z * W + x] = y0 - 1;
    }
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
      const edge = x === x0 || x === x1 || z === z0 || z === z1;
      for (let y = y0; y < y0 + wh; y++) if (edge) w.raw(x, y, z, mat);
      w.raw(x, y0 + wh, z, B.STONE);                                          // roof
      if (edge) w.raw(x, y0 + wh + 1, z, mat);                                // low wall around the roof
      if (floors === 2) w.raw(x, y0 + 4, z, B.PLANK);                          // upper floor
    }
    // windows along every wall, on each storey
    for (let f = 0; f < floors; f++) {
      const wy = y0 + f * 4 + 1;
      for (let x = x0 + 2; x < x1 - 1; x += 3) { w.raw(x, wy, z0, 0); w.raw(x, wy + 1, z0, 0); w.raw(x, wy, z1, 0); w.raw(x, wy + 1, z1, 0); }
      for (let z = z0 + 2; z < z1 - 1; z += 3) { w.raw(x0, wy, z, 0); w.raw(x0, wy + 1, z, 0); w.raw(x1, wy, z, 0); w.raw(x1, wy + 1, z, 0); }
    }
    // doors (2 wide, 2 tall) on two opposite sides
    const dx = x0 + Math.floor(bw / 2) - 1, dz = z0 + Math.floor(bd / 2) - 1;
    for (let k = 0; k < 2; k++) for (let y = y0; y < y0 + 2; y++) {
      if (r() < 0.5) { w.raw(dx + k, y, z0, 0); w.raw(dx + k, y, z1, 0); } else { w.raw(x0, y, dz + k, 0); w.raw(x1, y, dz + k, 0); }
    }
    // stairs up the outside of one wall to the roof, and inside to the upper floor
    const run = wh + 1, side = r() < 0.5;
    if (side && bw >= run + 1) for (let k = 0; k < run; k++) for (let y = y0; y <= y0 + k; y++) { w.raw(x0 + k, y, z0 - 1, B.PLANK); w.raw(x0 + k, y + 1, z0 - 1, 0); w.raw(x0 + k, y + 2, z0 - 1, 0); }
    else if (bd >= run + 1) for (let k = 0; k < run; k++) for (let y = y0; y <= y0 + k; y++) { w.raw(x1 + 1, y, z0 + k, B.PLANK); w.raw(x1 + 1, y + 1, z0 + k, 0); w.raw(x1 + 1, y + 2, z0 + k, 0); }
    if (side && bw >= run + 1) { w.raw(x0 + run - 1, y0 + wh + 1, z0, 0); w.raw(x0 + run - 2, y0 + wh + 1, z0, 0); }
    else if (bd >= run + 1) { w.raw(x1, y0 + wh + 1, z0 + run - 1, 0); w.raw(x1, y0 + wh + 1, z0 + run - 2, 0); }
    if (floors === 2) for (let k = 0; k < 4; k++) {
      for (let y = y0; y <= y0 + k; y++) w.raw(x1 - 1 - k, y, z1 - 1, B.PLANK);
      w.raw(x1 - 1 - k, y0 + 4, z1 - 1, 0); w.raw(x1 - 1 - k, y0 + 4, z1 - 2, 0);
    }
    // a few crates inside
    for (let k = 0; k < 2; k++) { const cx = x0 + 2 + Math.floor(r() * (bw - 4)), cz = z0 + 2 + Math.floor(r() * (bd - 4)); if (!w.get(cx, y0, cz)) w.raw(cx, y0, cz, B.CRATE); }
  }
  // crate stacks for cover
  for (let k = 0; k < 34; k++) {
    const x = 3 + Math.floor(r() * (W - 6)), z = 3 + Math.floor(r() * (D - 6)); if (!free(x, z, x, z, 1)) continue;
    const h = hm[z * W + x] + 1, tall = 1 + Math.floor(r() * 3), wide = r() < 0.5;
    for (let y = 0; y < tall; y++) { w.raw(x, h + y, z, B.CRATE); if (wide && y === 0 && x + 1 < W - 2 && hm[z * W + x + 1] + 1 === h) w.raw(x + 1, h, z, B.CRATE); }
  }
  // trees
  for (let k = 0; k < 16; k++) {
    const x = 4 + Math.floor(r() * (W - 8)), z = 4 + Math.floor(r() * (D - 8)); if (!free(x - 2, z - 2, x + 2, z + 2, 1)) continue;
    const h = hm[z * W + x] + 1, th = 4 + Math.floor(r() * 2);
    for (let y = 0; y < th; y++) w.raw(x, h + y, z, B.LOG);
    for (let ox = -2; ox <= 2; ox++) for (let oz = -2; oz <= 2; oz++) for (let oy = -1; oy <= 1; oy++) {
      if (Math.abs(ox) + Math.abs(oz) + Math.max(0, oy) * 2 > 3 || (ox === 0 && oz === 0 && oy < 1)) continue;
      if (!w.get(x + ox, h + th + oy, z + oz)) w.raw(x + ox, h + th + oy, z + oz, B.LEAVES);
    }
    w.raw(x, h + th + 1, z, B.LEAVES);
    used.push([x - 2, z - 2, x + 2, z + 2]);
  }
  // metal wall around the arena
  for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) if (x === 0 || z === 0 || x === W - 1 || z === D - 1) for (let y = 1; y < 12; y++) w.raw(x, y, z, B.METAL);
  // spawn points: standing room on solid ground
  for (let tries = 0; w.spawns.length < 48 && tries < 3000; tries++) {
    const x = 2 + Math.floor(r() * (W - 4)), z = 2 + Math.floor(r() * (D - 4)), y = w.groundAt(x, z);
    const under = w.get(x, y - 1, z); if (y > 1 && y < H - 3 && !w.get(x, y, z) && !w.get(x, y + 1, z) && (under === B.GRASS || under === B.SAND)) w.spawns.push(new THREE.Vector3(x + 0.5, y, z + 0.5));
  }
}

// ---------------------------------------------------------------------
// chunk meshing: only faces next to air, with ambient-occlusion shading
// ---------------------------------------------------------------------
const FACES = [
  { d: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], s: 1, shade: 0.8 },
  { d: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], s: 1, shade: 0.8 },
  { d: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 0, shade: 1 },
  { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 2, shade: 0.55 },
  { d: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], s: 1, shade: 0.9 },
  { d: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], s: 1, shade: 0.7 }
];
for (const f of FACES) {                         // make sure every quad faces outwards (counter-clockwise)
  const [a, b, c] = f.c, u = b.map((v, i) => v - a[i]), v = c.map((q, i) => q - a[i]);
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (n[0] * f.d[0] + n[1] * f.d[1] + n[2] * f.d[2] < 0) f.c.reverse();
  f.axis = f.d[0] ? 0 : f.d[1] ? 1 : 2; f.t = [0, 1, 2].filter(i => i !== f.axis);
}
const AO = [0.42, 0.62, 0.8, 1];

World.prototype.buildChunk = function (cx, cz) {
  const pos = [], uv = [], col = [], idx = [], T = 1 / 4, E = 0.5 / 64;
  const solidN = (x, y, z) => this.get(x, y, z) ? 1 : 0;
  for (let x = cx * CH; x < Math.min(W, cx * CH + CH); x++) for (let z = cz * CH; z < Math.min(D, cz * CH + CH); z++) for (let y = 0; y < H; y++) {
    const b = this.data[(y * D + z) * W + x]; if (!b) continue;
    const def = BLOCKS[b];
    for (const f of FACES) {
      const nx = x + f.d[0], ny = y + f.d[1], nz = z + f.d[2];
      if (this.get(nx, ny, nz) || ny < 0) continue;
      const tile = def.t[f.s], u0 = (tile % 4) * T + E, v1 = 1 - Math.floor(tile / 4) * T - E, u1 = u0 + T - 2 * E, v0 = v1 - T + 2 * E;
      const base = pos.length / 3, aos = [];
      for (const c of f.c) {
        pos.push(x + c[0], y + c[1], z + c[2]);
        let U, V; if (f.axis === 1) { U = c[0]; V = c[2]; } else { U = f.axis === 0 ? c[2] : c[0]; V = c[1]; }
        uv.push(U ? u1 : u0, V ? v1 : v0);
        const o1 = [0, 0, 0], o2 = [0, 0, 0]; o1[f.t[0]] = c[f.t[0]] ? 1 : -1; o2[f.t[1]] = c[f.t[1]] ? 1 : -1;
        const s1 = solidN(nx + o1[0], ny + o1[1], nz + o1[2]), s2 = solidN(nx + o2[0], ny + o2[1], nz + o2[2]);
        const cc = solidN(nx + o1[0] + o2[0], ny + o1[1] + o2[1], nz + o1[2] + o2[2]);
        const ao = s1 && s2 ? 0 : 3 - (s1 + s2 + cc); aos.push(ao);
        const l = AO[ao] * f.shade; col.push(l, l, l);
      }
      if (aos[0] + aos[2] < aos[1] + aos[3]) idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
      else idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};
// rebuild the chunks that changed (a few per frame so explosions don't stutter)
World.prototype.flush = function (scene, mat, max) {
  let n = 0;
  for (const k of [...this.dirty]) {
    if (n++ >= (max || 99)) break;
    this.dirty.delete(k);
    const [cx, cz] = k.split(',').map(Number); if (cx < 0 || cz < 0 || cx * CH >= W || cz * CH >= D) continue;
    const old = this.meshes.get(k); if (old) { scene.remove(old); old.geometry.dispose(); }
    const m = new THREE.Mesh(this.buildChunk(cx, cz), mat); m.matrixAutoUpdate = false; scene.add(m); this.meshes.set(k, m);
  }
};
World.prototype.dispose = function (scene) { for (const m of this.meshes.values()) { scene.remove(m); m.geometry.dispose(); } this.meshes.clear(); };
