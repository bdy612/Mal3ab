'use strict';
// =====================================================================
// Echoes of the Spire — floating-island maps (seeded) + their pre-rendered static layer
// World units: the map is a W×H rectangle centred on the spire at (0, 0).
// =====================================================================
const SOCK = 56;            // socket spacing (hex grid)
const SPIRE_R = 78;         // paths end at this radius
const ROAD_W = 38;

function valueNoise(seed) {
  const h = (x, y) => { let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), xf), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), xf), yf);
  };
}

// polyline helpers -------------------------------------------------------
function makePath(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, cum, len: cum[cum.length - 1] };
}
// position + heading at arc length d (hint = segment index cache to make it O(1) for walkers)
function pathAt(p, d, out, hint) {
  d = clamp(d, 0, p.len);
  let i = hint && hint.i ? Math.min(hint.i, p.pts.length - 2) : 0;
  while (i > 0 && p.cum[i] > d) i--;
  while (i < p.pts.length - 2 && p.cum[i + 1] < d) i++;
  if (hint) hint.i = i;
  const a = p.pts[i], b = p.pts[i + 1], seg = (p.cum[i + 1] - p.cum[i]) || 1, t = (d - p.cum[i]) / seg;
  out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t; out.ang = Math.atan2(b.y - a.y, b.x - a.x);
  return out;
}
function distToPath(p, x, y) {
  let best = 1e9;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i], b = p.pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / l2, 0, 1), d = dist2(x, y, a.x + dx * t, a.y + dy * t);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}
function segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {     // → t along AB, u along CD, or null
  const r1 = bx - ax, r2 = by - ay, s1 = dx - cx, s2 = dy - cy, den = r1 * s2 - r2 * s1;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((cx - ax) * s2 - (cy - ay) * s1) / den, u = ((cx - ax) * r2 - (cy - ay) * r1) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { t, u } : null;
}
function catmull(pts, per) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function resample(pts, step) {
  const p = makePath(pts), out = [], o = {};
  for (let d = 0; d < p.len; d += step) { pathAt(p, d, o); out.push({ x: o.x, y: o.y }); }
  out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
  return out;
}

// ------------------------------------------------------------------------
function genMap(seed, act, orient) {
  const A = ACTS[Math.min(act, 4) - 1];
  const [W, H] = orient === 'p' ? [740, 1120] : orient === 'l' ? [1180, 740] : [960, 960];
  const nP = A.paths;
  let best = null;
  for (let attempt = 0; attempt < 14; attempt++) {
    const rng = makeRng(seed * 31 + act * 977 + attempt * 7919);
    let base;
    if (orient === 'p') base = -Math.PI / 2 + rng.range(-0.35, 0.35);
    else if (orient === 'l') base = (nP === 2 ? Math.PI : Math.PI * 0.75) + rng.range(-0.3, 0.3);
    else base = rng.next() * Math.PI * 2;
    if (nP === 4 && orient !== 's') base = (orient === 'p' ? -Math.PI / 2 : Math.PI) + rng.range(-0.15, 0.15);
    const amp = (attempt < 7 ? 1 : 0.55) * rng.range(55, 105);
    const paths = [];
    for (let i = 0; i < nP; i++) {
      const ang = base + (i * Math.PI * 2) / nP + rng.range(-0.22, 0.22);
      const cx = Math.cos(ang), cy = Math.sin(ang), hw = W / 2 - 24, hh = H / 2 - 24;
      const k = Math.min(Math.abs(cx) > 1e-6 ? hw / Math.abs(cx) : 1e9, Math.abs(cy) > 1e-6 ? hh / Math.abs(cy) : 1e9);
      const S = { x: cx * k, y: cy * k }, E = { x: cx * SPIRE_R, y: cy * SPIRE_R };
      const px = -cy, py = cx, ph = rng.next() * 6.28, fr = rng.range(0.9, 1.6), a = amp * (rng.next() < 0.5 ? -1 : 1);
      const wp = [S];
      const n = 6;
      for (let j = 1; j < n; j++) {
        const t = j / n, taper = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.8) * (1 - t * 0.45);
        const off = a * Math.sin(ph + j * fr) * taper;
        wp.push({ x: clamp(lerp(S.x, E.x, t) + px * off, -W / 2 + 50, W / 2 - 50), y: clamp(lerp(S.y, E.y, t) + py * off, -H / 2 + 50, H / 2 - 50) });
      }
      wp.push({ x: cx * (SPIRE_R + 30), y: cy * (SPIRE_R + 30) }, E);
      const pts = resample(catmull(wp, 10), 6);
      const path = makePath(pts); path.ang = ang; path.start = S;
      paths.push(path);
    }
    // paths must keep their distance from each other (room for islands between them)
    let minD = 1e9;
    for (let i = 0; i < nP; i++) for (let j = i + 1; j < nP; j++) {
      for (const a of paths[i].pts) {
        if (Math.hypot(a.x, a.y) < 170) continue;
        for (let k = 0; k < paths[j].pts.length; k += 2) { const b = paths[j].pts[k]; if (Math.hypot(b.x, b.y) < 170) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < minD) minD = d; }
      }
    }
    if (!best || minD > best.minD) best = { paths, minD };
    if (minD >= 130) break;
  }
  const paths = best.paths;
  const rng = makeRng(seed * 13 + act * 101 + 5);
  const noise = valueNoise(seed + act * 17);
  const dPath = (x, y) => { let m = 1e9; for (const p of paths) m = Math.min(m, distToPath(p, x, y)); return m; };

  // sockets on a hex grid next to the paths
  const cand = [];
  const rowH = SOCK * 0.866;
  for (let j = 0, y = -H / 2 + 36; y <= H / 2 - 30; j++, y += rowH) {
    for (let x = -W / 2 + 34 + (j % 2 ? SOCK / 2 : 0); x <= W / 2 - 30; x += SOCK) {
      const dc = Math.hypot(x, y); if (dc < 104) continue;
      const dp = dPath(x, y); if (dp < 42 || dp > 190) continue;
      cand.push({ x, y, dp, dc, n: noise(x / 190 + 3.1, y / 190 + 7.7) });
    }
  }
  const keep = cand.filter(c => c.n > 0.4 || (c.dp < 80 && c.n > 0.26) || c.dc < 175);
  const has = new Set(keep);
  for (const p of paths) {                        // every stretch of road must be defendable
    for (let d = 40; d < p.len - 30; d += 64) {
      const o = pathAt(p, d, {});
      const near = [...has].filter(c => dist2(c.x, c.y, o.x, o.y) < 125 * 125).length;
      if (near < 3) cand.filter(c => !has.has(c)).sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y)).slice(0, 3 - near).forEach(c => has.add(c));
    }
  }
  const sockets = [...has].sort((a, b) => a.y - b.y || a.x - b.x).map((c, i) => ({ i, x: c.x, y: c.y, res: null }));

  // island blobs = union of circles around the sockets + satellite rocks
  const circles = [];
  for (const s of sockets) {
    circles.push({ x: s.x, y: s.y, r: 33 + rng.next() * 6, main: true, rot: rng.next() * 6.28, j: Array.from({ length: 11 }, () => rng.range(0.86, 1.1)) });
    if (rng.next() < 0.45) {
      const a = rng.next() * 6.28, d = rng.range(22, 34), x = s.x + Math.cos(a) * d, y = s.y + Math.sin(a) * d, r = rng.range(16, 25);
      if (dPath(x, y) > r + ROAD_W / 2 + 2 && Math.hypot(x, y) > 100 + r) circles.push({ x, y, r, rot: rng.next() * 6.28, j: Array.from({ length: 9 }, () => rng.range(0.8, 1.12)) });
    }
  }
  const islets = [];      // tiny decorative floating rocks in the void
  for (let k = 0; k < 40; k++) {
    const x = rng.range(-W / 2 + 20, W / 2 - 20), y = rng.range(-H / 2 + 20, H / 2 - 20), r = rng.range(5, 13);
    if (dPath(x, y) < r + 30 || Math.hypot(x, y) < 130) continue;
    if (circles.some(c => dist2(c.x, c.y, x, y) < (c.r + r + 14) ** 2)) continue;
    islets.push({ x, y, r, ph: rng.next() * 6.28 });
  }
  const crystals = [];    // decorative crystal clusters on island edges
  for (const c of circles) {
    if (rng.next() > 0.5) continue;
    const a = rng.next() * 6.28, x = c.x + Math.cos(a) * c.r * 0.72, y = c.y + Math.sin(a) * c.r * 0.6;
    if (sockets.some(s => dist2(s.x, s.y, x, y) < 22 * 22) || dPath(x, y) < ROAD_W / 2 + 8) continue;
    crystals.push({ x, y, n: rng.int(5), h: rng.range(8, 16), k: 1 + rng.int(3) });
  }
  return { seed, act, orient, W, H, paths, sockets, circles, islets, crystals, deco: rng.next() * 1000 };
}

// ------------------------------------------------------------------------
// static layer: background, islands, roads, spire platform — rendered once per resize
function renderStatic(map, view, cw, ch, dpr) {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(cw * dpr)); cv.height = Math.max(1, Math.round(ch * dpr));
  const g = cv.getContext('2d');
  const rng = makeRng(Math.floor(map.deco) + 3);
  // background
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = g.createRadialGradient(view.ox, view.oy, 0, view.ox, view.oy, Math.max(cw, ch) * 0.8);
  bg.addColorStop(0, '#221a4d'); bg.addColorStop(0.45, '#120f2e'); bg.addColorStop(1, '#06060f');
  g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
  const neb = ['120,80,255', '255,90,170', '60,200,255', '150,255,200', '255,180,90'];
  for (let i = 0; i < 7; i++) {
    const x = rng.next() * cw, y = rng.next() * ch, r = (0.25 + rng.next() * 0.35) * Math.max(cw, ch), c = neb[i % neb.length];
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},${0.07 + rng.next() * 0.05})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
  }
  for (let i = 0; i < (cw * ch) / 2600; i++) {
    const x = rng.next() * cw, y = rng.next() * ch, s = rng.next() < 0.92 ? rng.range(0.4, 1.1) : rng.range(1.2, 2);
    g.fillStyle = `rgba(${rng.next() < 0.3 ? '200,190,255' : '255,255,255'},${rng.range(0.25, 0.85)})`;
    g.fillRect(x, y, s, s);
  }
  // world
  const s = view.s;
  g.setTransform(dpr * s, 0, 0, dpr * s, dpr * view.ox, dpr * view.oy);
  // islands = union of jagged rock polygons (one per socket circle)
  const union = (list, dy, grow) => {
    g.beginPath();
    for (const c of list) {
      const n = c.j.length;
      for (let k = 0; k <= n; k++) { const a = c.rot + (k / n) * Math.PI * 2, rr = (c.r + grow) * c.j[k % n]; const x = c.x + Math.cos(a) * rr, y = c.y + dy + Math.sin(a) * rr; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath();
    }
  };
  // islets (tiny floating rocks)
  for (const it of map.islets) {
    g.fillStyle = '#140c2a'; g.beginPath(); g.moveTo(it.x - it.r, it.y + 2); g.lineTo(it.x, it.y + it.r * 2.2); g.lineTo(it.x + it.r, it.y + 2); g.fill();
    g.fillStyle = '#2c2a5e'; g.beginPath(); g.ellipse(it.x, it.y, it.r, it.r * 0.7, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(170,150,255,0.35)'; g.lineWidth = 1.2; g.stroke();
  }
  const isl = map.circles;
  // hanging rock spikes under the islands
  g.fillStyle = '#100a22';
  for (const c of isl) {
    if (!c.main) continue;
    if (isl.some(o => o !== c && o.y > c.y + c.r * 0.6 && Math.abs(o.x - c.x) < c.r * 0.7)) continue;
    const tip = c.y + c.r + 22 + rng.next() * 26;
    g.beginPath(); g.moveTo(c.x - c.r * 0.75, c.y + c.r * 0.4 + 14); g.lineTo(c.x + rng.range(-6, 6), tip); g.lineTo(c.x + c.r * 0.75, c.y + c.r * 0.4 + 14); g.fill();
    if (rng.next() < 0.6) { const ox = rng.range(-0.55, 0.55) * c.r; g.beginPath(); g.moveTo(c.x + ox - 7, c.y + c.r * 0.6 + 12); g.lineTo(c.x + ox, tip - 10 - rng.next() * 10); g.lineTo(c.x + ox + 7, c.y + c.r * 0.6 + 12); g.fill(); }
  }
  // underside
  const ug = g.createLinearGradient(0, -map.H / 2, 0, map.H / 2); ug.addColorStop(0, '#1d1240'); ug.addColorStop(1, '#130b2c');
  union(isl, 15, 0); g.fillStyle = ug; g.fill();
  union(isl, 8, 0); g.fillStyle = '#24184d'; g.fill();
  // glowing rim + top
  union(isl, 0, 2.5); g.fillStyle = 'rgba(176,156,255,0.6)'; g.fill();
  const tg = g.createRadialGradient(0, 0, 50, 0, 0, Math.max(map.W, map.H) * 0.7);
  tg.addColorStop(0, '#3a3a86'); tg.addColorStop(0.5, '#2c2f6e'); tg.addColorStop(1, '#23285a');
  union(isl, 0, 0); g.fillStyle = tg; g.fill();
  // surface facets + moss sparkles
  g.save(); union(isl, 0, -1); g.clip();
  for (const c of isl) {
    for (let k = 0; k < 3; k++) {
      const a = rng.next() * 6.28, d = rng.next() * c.r * 0.7, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d, z = rng.range(6, 14);
      g.fillStyle = rng.next() < 0.5 ? 'rgba(160,190,255,0.06)' : 'rgba(20,10,50,0.16)';
      g.beginPath(); g.moveTo(x, y - z); g.lineTo(x + z * 0.9, y + z * 0.4); g.lineTo(x - z * 0.8, y + z * 0.6); g.fill();
    }
  }
  for (let k = 0; k < isl.length * 3; k++) {
    const c = isl[rng.int(isl.length)], a = rng.next() * 6.28, d = rng.next() * c.r, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    g.fillStyle = `rgba(${rng.pick(['127,245,255', '255,150,210', '190,255,170'])},${rng.range(0.25, 0.6)})`;
    g.beginPath(); g.arc(x, y, rng.range(0.8, 1.8), 0, Math.PI * 2); g.fill();
  }
  // soft top highlight
  const hl = g.createLinearGradient(0, -map.H / 2, 0, map.H / 2); hl.addColorStop(0, 'rgba(255,255,255,0.05)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; g.fillRect(-map.W, -map.H, map.W * 2, map.H * 2);
  g.restore();
  // decorative crystals
  for (const c of map.crystals) drawCrystalCluster(g, c.x, c.y, c.h, c.k, NOTES[c.n].rgb, rng);
  // roads (floating bridges of pale stone)
  g.lineJoin = 'round'; g.lineCap = 'round';
  const roadPath = (p, dy) => { g.beginPath(); g.moveTo(p.pts[0].x, p.pts[0].y + dy); for (let i = 1; i < p.pts.length; i++) g.lineTo(p.pts[i].x, p.pts[i].y + dy); };
  for (const p of map.paths) { roadPath(p, 11); g.strokeStyle = '#0d0820'; g.lineWidth = ROAD_W; g.stroke(); }
  for (const p of map.paths) { roadPath(p, 5); g.strokeStyle = '#3a2f6a'; g.lineWidth = ROAD_W; g.stroke(); }
  for (const p of map.paths) { roadPath(p, 0); g.strokeStyle = 'rgba(200,185,255,0.55)'; g.lineWidth = ROAD_W + 3; g.stroke(); }
  for (const p of map.paths) { roadPath(p, 0); g.strokeStyle = '#6b5fa8'; g.lineWidth = ROAD_W - 1; g.stroke(); }
  for (const p of map.paths) { roadPath(p, 0); g.strokeStyle = '#7d71b9'; g.lineWidth = ROAD_W - 12; g.stroke(); }
  for (const p of map.paths) {      // paving stones
    const o = {};
    for (let d = 8; d < p.len - 4; d += 15) {
      pathAt(p, d, o); const px = -Math.sin(o.ang), py = Math.cos(o.ang);
      g.strokeStyle = 'rgba(40,28,80,0.32)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(o.x + px * (ROAD_W / 2 - 3), o.y + py * (ROAD_W / 2 - 3)); g.lineTo(o.x - px * (ROAD_W / 2 - 3), o.y - py * (ROAD_W / 2 - 3)); g.stroke();
    }
    roadPath(p, 0); g.setLineDash([3, 14]); g.strokeStyle = 'rgba(230,220,255,0.5)'; g.lineWidth = 3; g.stroke(); g.setLineDash([]);
  }
  // spire platform
  const R = 100;
  g.fillStyle = '#100a22'; g.beginPath(); g.moveTo(-R * 0.8, 30); g.lineTo(-10, R + 78); g.lineTo(14, R + 60); g.lineTo(R * 0.8, 30); g.fill();
  g.fillStyle = '#1d1240'; g.beginPath(); g.ellipse(0, 18, R, R * 0.92, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(200,185,255,0.7)'; g.beginPath(); g.arc(0, 0, R + 3, 0, Math.PI * 2); g.fill();
  const pg = g.createRadialGradient(0, -20, 10, 0, 0, R); pg.addColorStop(0, '#5a58b0'); pg.addColorStop(0.7, '#3a3a86'); pg.addColorStop(1, '#2b2c6c');
  g.fillStyle = pg; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(220,210,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 14, 0, Math.PI * 2); g.stroke();
  g.setLineDash([10, 8]); g.beginPath(); g.arc(0, 0, R - 24, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * (R - 14), Math.sin(a) * (R - 14)); g.lineTo(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4)); g.stroke(); }
  return cv;
}

function drawCrystalCluster(g, x, y, h, k, rgb, rng) {
  for (let i = 0; i < k; i++) {
    const ox = (i - (k - 1) / 2) * 5 + (rng ? rng.range(-1.5, 1.5) : 0), hh = h * (i === Math.floor(k / 2) ? 1 : 0.65), w = 3.2;
    const gr = g.createLinearGradient(x + ox, y - hh, x + ox, y);
    gr.addColorStop(0, `rgba(255,255,255,0.95)`); gr.addColorStop(0.35, `rgba(${rgb},0.85)`); gr.addColorStop(1, `rgba(${rgb},0.25)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x + ox, y - hh); g.lineTo(x + ox + w, y - hh + 4); g.lineTo(x + ox + w * 0.8, y); g.lineTo(x + ox - w * 0.8, y); g.lineTo(x + ox - w, y - hh + 4); g.closePath(); g.fill();
  }
}
