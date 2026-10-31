'use strict';
// =====================================================================
// Deck of Dungeons — simulation (heroes, structures, combos), board rendering and sound
// =====================================================================
(function () {
const DD = window.__DD, A = DD.art;
const G = DD.game = {};
const MW = 13, MH = 9, N = MW * MH;
const idx = (x, y) => y * MW + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rand = Math.random;
const R8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const R4A = [[1, 0], [0, 1], [0, -1], [-1, 0]], R4B = [[1, 0], [0, -1], [0, 1], [-1, 0]];
const T_ROCK = 0, T_FLOOR = 1, T_GATE = 2, T_VAULT = 3, T_CHASM = 4;
G.MW = MW; G.MH = MH;

const S = G.S = {
  mode: 'menu', paused: false, speed: 1, run: null, act: 0,
  terr: new Array(N).fill(0), grid: new Array(N).fill(null), structs: [], mons: [], heroes: [], proj: [], parts: [], texts: [], bolts: [], rings: [], links: [],
  spawnQ: [], spawnT: 0, fieldV: null, fieldE: null, fieldDV: null, fieldDE: null, E: [0, 4], V: [12, 4],
  shake: 0, time: 0, wt: 0, uid: 1, demo: false, version: 0, boss: null, rel: {}, scale: { hp: 1, sp: 1, dmg: 1, loot: 1 }, waveTotal: 0, sel: -1, hover: null, focus: null
};
G.on = { waveEnd() {}, defeat() {}, toast() {}, combo() {}, hud() {}, boss() {} };
const has = (r) => !!S.rel[r];
G.refreshRelics = () => { S.rel = {}; if (S.run) for (const r of S.run.relics) S.rel[r] = true; };

// ---------------------------------------------------------------- audio (WebAudio synth)
const AU = DD.audio = { ctx: null, on: true, music: true, last: {}, master: null, mgain: null };
AU.init = () => {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    AU.ctx = new (window.AudioContext || window.webkitAudioContext)();
    AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.on ? 0.55 : 0; AU.master.connect(AU.ctx.destination);
    AU.mgain = AU.ctx.createGain(); AU.mgain.gain.value = AU.music ? 0.5 : 0; AU.mgain.connect(AU.master);
    const len = AU.ctx.sampleRate; AU.nbuf = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate); const d = AU.nbuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AU.startMusic();
  } catch (e) { AU.ctx = null; }
};
AU.setOn = (v) => { AU.on = v; if (AU.master) AU.master.gain.value = v ? 0.55 : 0; };
AU.setMusic = (v) => { AU.music = v; if (AU.mgain) AU.mgain.gain.value = v ? 0.5 : 0; };
function tone(f, dur, type, vol, f2, delay, dest) {
  const c = AU.ctx; if (!c) return; const t0 = c.currentTime + (delay || 0);
  const o = c.createOscillator(), g = c.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || AU.master); o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, vol, freq, ftype, delay, f2) {
  const c = AU.ctx; if (!c) return; const t0 = c.currentTime + (delay || 0);
  const s = c.createBufferSource(); s.buffer = AU.nbuf; const fl = c.createBiquadFilter(); fl.type = ftype || 'lowpass'; fl.frequency.setValueAtTime(freq || 2000, t0);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  const g = c.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl); fl.connect(g); g.connect(AU.master); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
}
const SFX = {
  click: () => tone(660, 0.05, 'square', 0.05),
  select: () => { tone(520, 0.06, 'triangle', 0.08); tone(780, 0.06, 'triangle', 0.06, 0, 0.04); },
  place: () => { tone(140, 0.18, 'square', 0.12, 60); noise(0.15, 0.12, 900); },
  bad: () => tone(160, 0.16, 'sawtooth', 0.08, 110),
  arrow: () => noise(0.06, 0.05, 4000, 'highpass'),
  fire: () => noise(0.3, 0.08, 1400, 'lowpass', 0, 300),
  frost: () => { tone(1800, 0.12, 'sine', 0.04); tone(2400, 0.1, 'sine', 0.03, 0, 0.03); },
  zap: () => { tone(900, 0.1, 'sawtooth', 0.05, 200); noise(0.08, 0.05, 6000, 'highpass'); },
  poison: () => tone(300, 0.12, 'sine', 0.05, 180),
  pit: () => { tone(300, 0.4, 'triangle', 0.09, 60); },
  slam: () => { tone(90, 0.2, 'square', 0.12, 40); noise(0.18, 0.12, 500); },
  hit: () => tone(220, 0.05, 'square', 0.04, 150),
  spikes: () => { noise(0.05, 0.06, 3000, 'highpass'); tone(400, 0.05, 'square', 0.03, 200); },
  die: () => { tone(440, 0.22, 'square', 0.06, 110); },
  coin: () => { tone(1320, 0.07, 'square', 0.04); tone(1760, 0.1, 'square', 0.04, 0, 0.06); },
  steal: () => { tone(500, 0.12, 'square', 0.07, 380); tone(380, 0.18, 'square', 0.07, 250, 0.1); },
  escape: () => { tone(300, 0.3, 'sawtooth', 0.06, 120); },
  horn: () => { tone(110, 0.9, 'sawtooth', 0.08, 98); tone(165, 0.9, 'sawtooth', 0.05, 147); },
  clear: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, 0, i * 0.09)),
  combo: () => [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.05)),
  boss: () => { tone(55, 1.4, 'sawtooth', 0.12, 45); tone(82, 1.4, 'sawtooth', 0.07, 70); noise(1.0, 0.06, 300); },
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', 0.08, 0, i * 0.13)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.06, 0, i * 0.2)),
  spell: () => { tone(400, 0.25, 'sine', 0.07, 1200); noise(0.2, 0.05, 2000, 'bandpass'); },
  boom: () => { tone(80, 0.4, 'square', 0.12, 30); noise(0.5, 0.18, 1200, 'lowpass', 0, 100); },
  freeze: () => { tone(2600, 0.2, 'sine', 0.04, 1800); noise(0.15, 0.04, 7000, 'highpass'); },
  heal: () => { tone(700, 0.2, 'sine', 0.035, 1000); },
  scorch: () => noise(0.25, 0.06, 900, 'bandpass', 0, 2500),
  dig: () => noise(0.07, 0.07, 700, 'bandpass'),
  page: () => noise(0.08, 0.04, 2500, 'bandpass'),
  draw: () => { noise(0.05, 0.04, 3000, 'bandpass'); tone(900, 0.04, 'triangle', 0.03); }
};
AU.play = (name) => {
  if (!AU.ctx || !AU.on || !SFX[name]) return; const now = performance.now();
  if (AU.last[name] && now - AU.last[name] < 60) return; AU.last[name] = now; try { SFX[name](); } catch (e) {}
};
// online: while G.fxOut is an array, visual effects and sounds are recorded so the Keeper's page can replay them on the Heroes' page
G.fxOut = null;
const r2 = (v) => Math.round(v * 100) / 100;
function rec(e) { const o = G.fxOut; if (!o || o.length >= 240) return; if (e[0] === 's' && o.some(q => q[0] === 's' && q[1] === e[1])) return; o.push(e); }
AU.startMusic = () => {   // slow dark ambience: a soft drone and sparse bell notes
  if (AU.mtimer || !AU.ctx) return;
  const scale = [0, 3, 5, 7, 10, 12, 15], base = 110;
  let bar = 0;
  const tick = () => {
    if (!AU.ctx || AU.ctx.state !== 'running') return;
    const root = [0, -2, -4, -5][bar % 4]; bar++;
    tone(base * Math.pow(2, root / 12) / 2, 3.9, 'sawtooth', 0.025, 0, 0, AU.mgain);
    tone(base * Math.pow(2, (root + 7) / 12) / 2, 3.9, 'triangle', 0.02, 0, 0, AU.mgain);
    for (let i = 0; i < 3; i++) if (Math.random() < 0.7) tone(base * 2 * Math.pow(2, (root + scale[Math.floor(Math.random() * scale.length)]) / 12), 1.4, 'sine', 0.03, 0, i * 1.3 + Math.random() * 0.3, AU.mgain);
  };
  AU.mtimer = setInterval(tick, 4000); setTimeout(tick, 200);
};
const sfx = (n) => { AU.play(n); if (G.fxOut) rec(['s', n]); };
G.sfx = sfx;

// ---------------------------------------------------------------- map & path fields
G.loadMap = (act) => {
  S.act = act; const rows = DD.MAPS[act].rows;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const ch = rows[y][x];
    S.terr[idx(x, y)] = ch === '#' ? T_ROCK : ch === '.' ? T_FLOOR : ch === 'E' ? T_GATE : ch === 'V' ? T_VAULT : T_CHASM;
    if (ch === 'E') S.E = [x, y]; if (ch === 'V') S.V = [x, y];
  }
  S.grid.fill(null); S.structs = []; S.mons = []; S.heroes = []; S.proj = []; S.parts = []; S.texts = []; S.bolts = []; S.rings = []; S.links = [];
  S.spawnQ = []; S.boss = null; computeFields(); S.version++; S.terrainDirty = true;
};
const walkCost = (j, dwarf) => {
  const t = S.terr[j]; if (t === T_ROCK || t === T_CHASM) return -1;
  const s = S.grid[j]; if (s && s.id === 'collapse') return dwarf ? 5 : -1; return 1;
};
function field(tx, ty, dwarf) {
  const f = new Float32Array(N).fill(1e9), t0 = idx(tx, ty); f[t0] = 0;
  if (!dwarf) {   // BFS
    const q = [t0];
    for (let qi = 0; qi < q.length; qi++) { const i = q[qi], x = i % MW, y = (i / MW) | 0; for (const [dx, dy] of R4A) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const j = idx(nx, ny); if (f[j] < 1e9 || walkCost(j) < 0) continue; f[j] = f[i] + 1; q.push(j); } }
    return f;
  }
  const done = new Uint8Array(N);
  for (;;) {
    let bi = -1, bv = 1e9; for (let i = 0; i < N; i++) if (!done[i] && f[i] < bv) { bv = f[i]; bi = i; }
    if (bi < 0) break; done[bi] = 1; const x = bi % MW, y = (bi / MW) | 0;
    for (const [dx, dy] of R4A) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const j = idx(nx, ny), c = walkCost(j, true); if (c < 0) continue; if (bv + c < f[j]) f[j] = bv + c; }
  }
  return f;
}
function computeFields() {
  S.fieldV = field(S.V[0], S.V[1]); S.fieldE = field(S.E[0], S.E[1]);
  S.fieldDV = field(S.V[0], S.V[1], true); S.fieldDE = field(S.E[0], S.E[1], true);
  if (S.ctl && S.ctl.flag) flagFields();
}
G.computeFields = computeFields;
function walkField(x, y, f) {   // follow a distance field downhill from (x, y)
  const out = []; let guard = 0;
  while (guard++ < 200) { out.push([x, y]); const v = f[idx(x, y)]; if (v === 0 || v >= 1e9) break; let bx = -1, by = -1, bv = v; for (const [dx, dy] of R4A) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && f[idx(nx, ny)] < bv) { bv = f[idx(nx, ny)]; bx = nx; by = ny; } } if (bx < 0) break; x = bx; y = by; }
  return out;
}
G.pathTiles = () => walkField(S.E[0], S.E[1], S.fieldV);   // current main route entrance -> vault (for drawing)
G.routeTiles = () => {   // the Heroes' planned route: entrance -> route flag -> vault
  const c = S.ctl; if (!c || !c.flag || !c.fN) return G.pathTiles();
  return walkField(S.E[0], S.E[1], c.fN).concat(walkField(c.flag[0], c.flag[1], S.fieldV).slice(1));
};

// ---------------------------------------------------------------- player-controlled heroes (online mode)
// S.ctl exists during an online match. While S.ctl.ai is false a real player leads the heroes:
// they choose who goes in next, plant a route flag the party walks through, and trigger the abilities below.
const CMD_CD = G.CMD_CD = { heal: 7, scorch: 6, charge: 14, boss: 8, retreat: 2 };
const AUTO_SEND = G.AUTO_SEND = 3.5, SEND_GAP = 0.45;
G.newCtl = (goal) => (S.ctl = { flag: null, fN: null, fD: null, cd: { heal: 0, scorch: 0, charge: 0, boss: 0, retreat: 0 }, sendCd: 0, ai: false, goal: goal || 100 });
const ctlOn = () => !!S.ctl && !S.ctl.ai;
G.ctlOn = ctlOn;
function flagFields() {
  const c = S.ctl, j = idx(c.flag[0], c.flag[1]);
  if (walkCost(j) < 0) { c.flag = null; c.fN = c.fD = null; return; }   // a collapse landed on the flag
  c.fN = field(c.flag[0], c.flag[1]); c.fD = field(c.flag[0], c.flag[1], true);
  if (c.fN[idx(S.E[0], S.E[1])] >= 1e9) { c.flag = null; c.fN = c.fD = null; }
}
G.setFlag = (x, y) => {   // x < 0 removes the flag; returns true when the flag changed
  const c = S.ctl; if (!c) return false;
  if (x == null || x < 0) { c.flag = null; c.fN = c.fD = null; }
  else {
    if (!inb(x, y) || S.terr[idx(x, y)] !== T_FLOOR || walkCost(idx(x, y)) < 0) return false;
    c.flag = [x, y]; flagFields(); if (!c.flag) return false;
  }
  for (const h of S.heroes) if (h.state === 'in') h.via = false;
  return true;
};

// ---------------------------------------------------------------- cards
G.stats = (id, up) => Object.assign({}, DD.CARDS[id].st, up ? DD.CARDS[id].up : {});
G.cost = (card) => {
  const c = DD.CARDS[card.id]; let cost = card.up && c.up.cost !== undefined ? c.up.cost : c.cost;
  if (S.run && has('echoStone') && !S.run.echoUsed) cost = 0; return cost;
};
const lvlMul = (s) => 1 + 0.5 * (s.lvl - 1);
function comboPartners(id, x, y) {   // combos a new piece `id` at (x, y) would form with its neighbours
  const out = [];
  for (const c of DD.COMBOS) {
    const isA = c.a === id, isB = c.b.includes(id); if (!isA && !isB) continue;
    for (const [dx, dy] of R8) {
      const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const s = S.grid[idx(nx, ny)]; if (!s) continue;
      if ((isA && c.b.includes(s.id)) || (isB && s.id === c.a)) out.push({ combo: c.id, x: nx, y: ny, col: c.col });
    }
  }
  return out;
}
G.comboPartners = comboPartners;
function recomputeCombos() {
  const before = new Set(S.links.map(l => l.key));
  for (const s of S.structs) { s.fx = {}; s.drum = 0; }
  S.links = [];
  for (const s of S.structs) for (const c of DD.COMBOS) {
    if (c.a !== s.id) continue;
    for (const [dx, dy] of R8) {
      const nx = s.x + dx, ny = s.y + dy; if (!inb(nx, ny)) continue; const p = S.grid[idx(nx, ny)]; if (!p || !c.b.includes(p.id)) continue;
      s.fx[c.id] = true; p.fx[c.id] = true;
      if (c.id === 'warDrums') p.drum = Math.max(p.drum, s.st.pct * lvlMul(s));
      S.links.push({ key: c.id + ':' + idx(s.x, s.y) + '-' + idx(nx, ny), combo: c.id, ax: s.x, ay: s.y, bx: nx, by: ny, col: c.col, g: c.g, born: S.time });
    }
  }
  const fresh = S.links.filter(l => !before.has(l.key));
  for (const l of S.links) if (before.has(l.key)) l.born = -10;
  return fresh;
}
G.recomputeCombos = recomputeCombos;
function heroOnTile(x, y) { return S.heroes.some(h => !h.dead && ((Math.floor(h.x) === x && Math.floor(h.y) === y) || (h.tx === x && h.ty === y))); }
function pathOkWith(j) {   // would a collapse at tile j keep every route open?
  const old = S.grid[j]; S.grid[j] = { id: 'collapse' };
  const fv = field(S.V[0], S.V[1]), fe = field(S.E[0], S.E[1]);
  S.grid[j] = old;
  if (fv[idx(S.E[0], S.E[1])] >= 1e9) return false;
  for (const h of S.heroes) { if (h.dead) continue; const i = idx(Math.floor(h.x), Math.floor(h.y)); if ((h.state === 'in' ? fv : fe)[i] >= 1e9) return false; }
  return true;
}
// can hand card #hi be played at (x, y)?  -> { ok, err, empower, combos }
G.canPlay = (hi, x, y) => {
  const run = S.run; if (!run) return { ok: false };
  const card = run.hand[hi]; if (!card) return { ok: false };
  const C = DD.CARDS[card.id], cost = G.cost(card);
  const res = { ok: false, err: '', empower: 0, combos: [], cost };
  if (run.mana < cost) { res.err = 'dd_noMana'; return res; }
  if (C.place === 'none') { if (card.id === 'ritual' && run.vault <= G.stats('ritual', card.up).l) { res.err = 'dd_noLoot'; return res; } res.ok = true; return res; }
  if (x == null || !inb(x, y)) return res;
  const j = idx(x, y), t = S.terr[j], s = S.grid[j];
  if (C.place === 'target') { if (S.mode !== 'wave') { res.err = 'dd_waveOnly'; return res; } res.ok = true; return res; }
  if (t === T_GATE || t === T_VAULT || t === T_CHASM) { res.err = 'dd_special'; return res; }
  if (C.place === 'rock') { if (t !== T_ROCK) { res.err = 'dd_needRock'; return res; } }
  else if (t !== T_FLOOR) { res.err = 'dd_needFloor'; return res; }
  if (s) {
    if (s.id === card.id && C.kind !== 'room') { if (s.lvl >= 3) { res.err = 'dd_maxLvl'; return res; } res.ok = true; res.empower = s.lvl + 1; return res; }
    res.err = 'dd_occupied'; return res;
  }
  if (card.id === 'collapse') {
    if (heroOnTile(x, y)) { res.err = 'dd_heroThere'; return res; }
    if (!pathOkWith(j)) { res.err = 'dd_blocks'; return res; }
  }
  res.ok = true; res.combos = comboPartners(card.id, x, y);
  return res;
};
// play a card; returns the canPlay result (ok=false on failure)
G.play = (hi, x, y) => {
  const r = G.canPlay(hi, x, y); if (!r.ok) { sfx('bad'); return r; }
  const run = S.run, card = run.hand[hi], C = DD.CARDS[card.id];
  run.mana -= r.cost; if (has('echoStone')) run.echoUsed = true;
  run.hand.splice(hi, 1); run.discard.push(card); run.stats.cards++;
  if (C.kind === 'spell') { castSpell(card, x, y); S.version++; return r; }
  const j = idx(x, y);
  if (r.empower) {
    const s = S.grid[j]; s.lvl = r.empower; if (card.up && !s.up) { s.up = true; s.st = G.stats(s.id, true); }
    if (s.mon) refreshMon(s);
    burst(x + 0.5, y + 0.5, 22, '#ffcc33', 3, 0.7, 0.09, -1, true); textK(x + 0.5, y + 0.2, 'dd_lvl', { n: s.lvl }, '#ffcc33', 1.1); sfx('place'); sfx('combo');
  } else {
    const s = { uid: S.uid++, id: card.id, kind: C.kind, x, y, lvl: 1, up: !!card.up, st: G.stats(card.id, card.up), cd: 0.3, cd2: 0, dis: 0, anim: 0, fx: {}, drum: 0, ang: 0, blast: 1.5, born: S.time };
    S.grid[j] = s; S.structs.push(s);
    if (C.kind === 'monster') { s.mon = makeMon(card.id, x, y, s, false); S.mons.push(s.mon); }
    if (card.id === 'collapse') { computeFields(); dust(x + 0.5, y + 0.5); S.shake = Math.max(S.shake, 0.25); }
    if (card.id === 'well') run.wells = (run.wells || 0) + s.st.n;
    burst(x + 0.5, y + 0.5, 14, DD.KINDS[C.kind].col, 2.2, 0.5, 0.07, -1, true); sfx('place');
  }
  const fresh = recomputeCombos();
  if (fresh.length) { run.stats.combos += fresh.length; G.on.combo([...new Set(fresh.map(f => f.combo))]); sfx('combo'); for (const l of fresh) burst((l.ax + l.bx) / 2 + 0.5, (l.ay + l.by) / 2 + 0.5, 18, l.col, 2.5, 0.8, 0.08, -0.5, true); }
  S.version++; return r;
};
function castSpell(card, x, y) {
  const st = G.stats(card.id, card.up), run = S.run, cx = x + 0.5, cy = y + 0.5;
  sfx('spell');
  if (card.id === 'fireball') {
    for (const h of S.heroes) if (!h.dead && dist(h.x, h.y, cx, cy) <= st.rad) hurt(h, st.d, 'fire');
    burst(cx, cy, 60, '#ff7a2f', 4.5, 0.8, 0.12, -1, true); burst(cx, cy, 30, '#ffd23a', 3, 0.5, 0.08, -1, true); ring(cx, cy, st.rad, '#ff9a3a'); S.shake = Math.max(S.shake, 0.6); sfx('boom');
  } else if (card.id === 'nova') {
    for (const h of S.heroes) if (!h.dead && dist(h.x, h.y, cx, cy) <= st.rad) freeze(h, st.t, true);
    burst(cx, cy, 50, '#9be7ff', 4, 0.7, 0.08, 0, true); ring(cx, cy, st.rad, '#c8f4ff'); sfx('freeze');
  } else if (card.id === 'rust') {
    for (const h of S.heroes) if (!h.dead && dist(h.x, h.y, cx, cy) <= st.rad) { h.rust = st.t; textK(h.x, h.y - 0.5, 'dd_rusted', 0, '#ff9a4a', 0.8); }
    burst(cx, cy, 40, '#d8803a', 3, 0.8, 0.08, 0.5, false); ring(cx, cy, st.rad, '#ff9a4a');
  } else if (card.id === 'ritual') {
    run.vault -= st.l; run.mana += st.n; text(S.V[0] + 0.5, S.V[1], '-' + st.l, '#ff6a6a', 1); burst(S.V[0] + 0.5, S.V[1] + 0.5, 30, '#b47bff', 3, 0.8, 0.08, -1, true);
  } else if (card.id === 'scheme') {
    G.draw(st.n);
  } else if (card.id === 'hoard') {
    run.vault += st.n; coinsTo(S.E[0] + 0.5, S.E[1] + 0.5, 10); text(S.V[0] + 0.5, S.V[1], '+' + st.n, '#ffcc33', 1.1); sfx('coin');
  }
}
G.draw = (n) => {
  const run = S.run;
  for (let i = 0; i < n; i++) {
    if (run.hand.length >= 10) break;
    if (!run.draw.length) { if (!run.discard.length) break; run.draw = shuffle(run.discard); run.discard = []; }
    run.hand.push(run.draw.pop());
  }
  sfx('draw');
};
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
G.shuffle = shuffle;
function removeStruct(s) {
  S.grid[idx(s.x, s.y)] = null; S.structs = S.structs.filter(o => o !== s);
  if (s.mon) { s.mon.gone = true; }
  if (s.id === 'well' && S.run) S.run.wells = Math.max(0, (S.run.wells || 0) - s.st.n);
  computeFields(); recomputeCombos(); S.version++;
}

// ---------------------------------------------------------------- monsters
function makeMon(type, x, y, s, temp) {
  const base = DD.CARDS[type === 'minislime' ? 'slime' : type];
  const st = s ? s.st : base.st, m = s ? lvlMul(s) : 1;
  let hp = st.hp * m, dmg = st.d * m, blk = st.blk;
  if (type === 'minislime') { hp = st.hp * 0.35; dmg = st.d * 0.6; blk = 1; }
  if (has('boneRing')) hp *= 1.4;
  return { id: S.uid++, type, x: x + 0.5, y: y + 0.5, hp, maxHp: hp, dmg, rate: st.r, blk, cd: 0.5, dead: false, reviveT: 0, engaged: 0, s, temp, life: temp ? 15 : 0, split: false, anim: rand() * 6, flash: 0, src: null };
}
function refreshMon(s) {
  const m = s.mon, st = s.st, mul = lvlMul(s); let hp = st.hp * mul; if (has('boneRing')) hp *= 1.4;
  const frac = m.dead ? 1 : m.hp / m.maxHp; m.maxHp = hp; m.hp = hp * frac; m.dmg = st.d * mul;
}
function monDie(m) {
  m.dead = true; m.engaged = 0; for (const h of S.heroes) if (h.fight === m) h.fight = null;
  const col = m.type === 'golem' ? '#8c8a9c' : m.type === 'skeleton' ? '#ece6d6' : '#4fd36b';
  burst(m.x, m.y, 18, col, 2.4, 0.6, 0.08, 1.5, false); sfx('die');
  if (m.temp) { m.gone = true; return; }
  const fast = has('boneRing') ? 0.5 : 1;
  if (m.type === 'slime' && !m.split) {
    m.split = true;
    for (const o of [-0.22, 0.22]) { const k = makeMon('minislime', Math.floor(m.x), Math.floor(m.y), null, true); k.x = m.x + o; k.y = m.y + o * 0.5; k.life = 999; k.hp = k.maxHp = m.maxHp * 0.35; k.dmg = m.dmg * 0.6; k.toxic = m.s && m.s.fx.toxicSplash; S.mons.push(k); }
  }
  m.reviveT = (m.type === 'skeleton' ? m.s.st.t : m.type === 'golem' ? 18 : 14) * fast;
}
function updateMon(m, dt) {
  m.anim += dt; if (m.flash > 0) m.flash -= dt;
  if (m.temp) { m.life -= dt; if (m.life <= 0) { m.gone = true; burst(m.x, m.y, 10, '#c58bff', 1.5, 0.5, 0.06, -1, true); for (const h of S.heroes) if (h.fight === m) h.fight = null; return; } }
  if (m.dead) { m.reviveT -= dt; if (m.reviveT <= 0) { m.dead = false; m.hp = m.maxHp; burst(m.x, m.y, 14, '#c58bff', 1.6, 0.6, 0.07, -1, true); } return; }
  const s = m.s;
  if (s && s.dis > 0) return;
  if (s && s.fx.magmaGolem) m.hp = Math.min(m.maxHp, m.hp + 6 * dt);
  if (s && s.fx.toxicSplash) m.hp = Math.min(m.maxHp, m.hp + 4 * dt);
  m.cd -= dt; if (m.cd > 0) return;
  const drum = 1 + (s ? s.drum : 0) / 100;
  if (m.type === 'golem') {
    const near = S.heroes.filter(h => !h.dead && dist(h.x, h.y, m.x, m.y) < 0.95);
    if (!near.length) return;
    m.cd = m.rate; m.slam = 0.3; S.shake = Math.max(S.shake, 0.18); sfx('slam');
    for (const h of near) {
      hurt(h, m.dmg * drum, s && s.fx.magmaGolem ? 'fire' : 'phys');
      if (!h.dead) { stun(h, 0.4); if (s && s.fx.magmaGolem) burn(h, 8, 3); }
    }
    burst(m.x, m.y + 0.3, 16, s && s.fx.magmaGolem ? '#ff7a2f' : '#a09cb2', 2.5, 0.4, 0.07, 1, false);
  } else {
    let tg = null, bd = 0.85;
    for (const h of S.heroes) { if (h.dead) continue; const d = h.fight === m ? 0 : dist(h.x, h.y, m.x, m.y); if (d < bd) { bd = d; tg = h; } }
    if (!tg) return;
    m.cd = m.rate; m.atk = 0.2;
    hurt(tg, m.dmg * drum, 'phys'); sfx('hit');
    if (m.type !== 'skeleton' && !tg.dead) { tg.slimed = 1.5; if (m.toxic || (s && s.fx.toxicSplash)) poison(tg, 6, 4); burst(tg.x, tg.y, 6, '#6fe388', 1.5, 0.4, 0.06, 1, false); }
  }
}

// ---------------------------------------------------------------- heroes
function spawnHero(cls, x, y) {
  const d = DD.HEROES[cls], sc = S.scale;
  const hp = d.hp * sc.hp;
  const h = {
    id: S.uid++, cls, def: d, x: x + 0.5, y: y + 0.5, cx: x, cy: y, tx: null, ty: null, hp, maxHp: hp, sp: d.sp * sc.sp, ar: d.ar, dmg: d.dmg * sc.dmg,
    loot: Math.round(d.loot * sc.loot), state: 'in', carry: 0, fight: null, atkCd: 0.6, burn: null, poison: [], chill: 0, chillT: 0, chillSlow: 0.4,
    frozen: 0, frozenImm: 0, stun: 0, wet: 0, rust: 0, blind: 0, grab: 0, slimed: 0, grabbed: [], dig: 0, digTile: -1, abilT: 2 + rand() * 2, abil2T: 6,
    charge: 0, boss: !!d.boss, size: d.size || (cls === 'dwarf' ? 0.9 : 1), enraged: false, flip: false, walk: rand() * 4, flash: 0, dotAcc: 0, dotT: 0,
    ox: (rand() - 0.5) * 0.22, oy: (rand() - 0.5) * 0.22, floodSlow: 0, chillAcc: 0, aura: false, dead: false, moving: false, born: S.time
  };
  S.heroes.push(h);
  if (h.boss) { S.boss = h; S.shake = 0.8; sfx('boss'); G.on.boss(h); }
  return h;
}
G.spawnHero = spawnHero;
function fieldOf(h) {
  const dw = h.def.dig, c = S.ctl;
  if (c && c.flag && !h.via && !c.ai) {   // player route: walk to the flag first, then on to the goal
    if (h.cx === c.flag[0] && h.cy === c.flag[1]) h.via = true;
    else { const f = dw ? c.fD : c.fN; if (f && f[idx(h.cx, h.cy)] < 1e9) return f; h.via = true; }
  }
  return h.state === 'in' ? (dw ? S.fieldDV : S.fieldV) : (dw ? S.fieldDE : S.fieldE);
}
function pickNext(h) {
  const f = fieldOf(h), cv = f[idx(h.cx, h.cy)];
  if (cv === 0) return false;
  let best = -1, bv = cv;
  for (const [dx, dy] of (h.id % 2 ? R4A : R4B)) { const nx = h.cx + dx, ny = h.cy + dy; if (!inb(nx, ny)) continue; const v = f[idx(nx, ny)]; if (v < bv - 1e-6) { bv = v; best = idx(nx, ny); } }
  if (best < 0) return false;
  const s = S.grid[best];
  if (s && s.id === 'collapse') { if (h.def.dig) { h.dig = 2.4; h.digTile = best; textK(h.x, h.y - 0.6, 'dd_dig', 0, '#e8c07a', 0.75); return true; } return false; }
  h.tx = best % MW; h.ty = (best / MW) | 0; return true;
}
function speedMul(h) {
  if (h.frozen > 0 || h.stun > 0 || h.grab > 0 || h.fight || h.dig > 0) return 0;
  let m = 1;
  if (h.chill > 0) m *= 1 - h.chillSlow;
  if (h.floodSlow > 0) m *= 1 - h.floodSlow;
  if (h.slimed > 0) m *= 0.7;
  if (h.carry > 0 && has('chains')) m *= 0.65;
  if (h.charge > 0) m = Math.max(m, 1) * 3;
  if (h.enraged) m *= 1.4;
  return m;
}
function hurt(h, amt, type, dot) {
  if (h.dead || amt <= 0) return 0;
  let m = 1;
  if (type === 'phys') m *= 1 - (h.rust > 0 ? 0 : h.ar);
  else if (type === 'fire') m *= (1 - (h.def.fireRes || 0)) * (has('emberHeart') ? 1.35 : 1);
  else if (type === 'poison') m *= has('plague') ? 1.5 : 1;
  else if (type === 'frost' && h.wet > 0) m *= 1.5;
  if (h.rust > 0) m *= 1.25;
  if (h.aura) m *= 0.85;
  if (h.charge > 0) m *= 0.6;
  const d = amt * m; if (d <= 0) { if (!dot && type === 'fire') text(h.x, h.y - 0.6, '0', '#888', 0.6); return 0; }
  h.hp -= d; if (S.run) S.run.stats.dmg = (S.run.stats.dmg || 0) + d;
  if (dot) h.dotAcc += d;
  else { h.flash = 0.12; if (d >= 6) text(h.x + (rand() - 0.5) * 0.3, h.y - 0.55, Math.round(d) + '', DMGCOL[type] || '#fff', d >= 40 ? 1 : 0.75); }
  if (h.hp <= 0) killHero(h);
  return d;
}
G.hurt = hurt;
const DMGCOL = { phys: '#f4f0e6', fire: '#ff9a3a', frost: '#9be7ff', poison: '#8cff5a', shock: '#ffe85a', true: '#ff6aa0' };
function stun(h, t) { h.stun = Math.max(h.stun, h.boss ? t * 0.5 : t); }
function burn(h, dps, t) { if (!h.burn || h.burn.dps <= dps) h.burn = { dps, t }; else h.burn.t = Math.max(h.burn.t, t); }
function poison(h, dps, t) { const p = h.poison; if (p.length < 3) p.push({ dps, t }); else { p.sort((a, b) => a.t - b.t); p[0] = { dps, t }; } }
function freeze(h, t, force) {
  if (!force && h.frozenImm > 0) return;
  let d = t * (has('frostCrown') ? 1.5 : 1); if (h.boss) d *= 0.5;
  h.frozen = Math.max(h.frozen, d); h.frozenImm = h.frozen + 1.2; h.chill = 0;
  if (t) textK(h.x, h.y - 0.7, 'dd_frozen', 0, '#c8f4ff', 0.75); sfx('freeze');
  burst(h.x, h.y, 10, '#c8f4ff', 1.8, 0.4, 0.06, 0, true);
}
function chill(h, slow, t) {
  if (h.frozen > 0 || h.frozenImm > 0) return;
  h.chill = Math.min(3, h.chill + 1); h.chillT = 2.5; h.chillSlow = Math.max(h.chillSlow * (h.chill > 1 ? 1 : 0), slow);
  if (h.chill >= (has('frostCrown') ? 2 : 3)) freeze(h, t);
}
const t = (k, v) => window.t(k, v);
G.tt = t;
function killHero(h) {
  if (h.dead) return; h.dead = true;
  if (h.fight) h.fight = null;
  sfx('die');
  const col = { squire: '#4f7cc4', rogue: '#2f5d3a', knight: '#c9d1de', cleric: '#ece6d6', mage: '#3d47c9', dwarf: '#d9772b', paladin: '#ffcc33' }[h.cls] || '#ff4d6d';
  burst(h.x, h.y, h.boss ? 70 : 16, col, h.boss ? 4 : 2.2, h.boss ? 1.2 : 0.6, 0.08, 1.2, false);
  burst(h.x, h.y - 0.2, 6, '#e8e2ff', 0.8, 1.0, 0.06, -1.2, true);
  if (h === S.boss) { S.boss = null; S.shake = 1; sfx('boom'); }
  if (S.demo || !S.run) return;
  const run = S.run;
  const bounty = Math.round(h.def.bounty * (1 + S.act * 0.25)) + (has('ledger') ? 2 : 0);
  run.vault += bounty; run.bountyWave = (run.bountyWave || 0) + bounty; run.stats.kills++;
  coinsTo(h.x, h.y, Math.min(8, 1 + Math.floor(bounty / 2)));
  if (h.carry > 0) { run.vault += h.carry; run.stats.recovered += h.carry; textK(h.x, h.y - 0.9, 'dd_recovered', { n: h.carry }, '#ffcc33', 0.95); coinsTo(h.x, h.y, 10); sfx('coin'); h.carry = 0; }
  // necromancy: rise as one of our skeletons
  for (const s of S.structs) {
    if (s.id !== 'smage' || !s.fx.necromancy || s.dis > 0) continue;
    if (dist(h.x, h.y, s.x + 0.5, s.y + 0.5) > rangeOf(s)) continue;
    const mine = S.mons.filter(m => m.src === s && !m.gone).length; if (mine >= 4) break;
    const k = makeMon('skeleton', Math.floor(h.x), Math.floor(h.y), null, true); k.x = h.x; k.y = h.y; k.src = s; S.mons.push(k);
    burst(h.x, h.y, 16, '#c58bff', 2, 0.7, 0.07, -1, true); break;
  }
}
function steal(h) {
  const run = S.run;
  let amt = h.loot * (has('vaultDoor') ? 0.7 : 1); amt = Math.round(amt);
  if (S.demo || !run) amt = 0; else { amt = Math.min(run.vault, amt); run.vault -= amt; }
  h.carry = amt; h.state = 'flee'; h.via = false;
  if (amt > 0) { text(S.V[0] + 0.5, S.V[1] + 0.1, '-' + amt, '#ff6a6a', 1.1); burst(S.V[0] + 0.5, S.V[1] + 0.5, 14, '#ffcc33', 2.5, 0.6, 0.08, 2, false); sfx('steal'); S.shake = Math.max(S.shake, 0.3); S.vaultHit = 0.4; rec(['v']); }
}
function escape(h) {
  h.gone = true; if (h.retreated && S.run) S.run.stats.retreated = (S.run.stats.retreated || 0) + 1;
  if (h.carry > 0 && S.run) { S.run.stats.stolen += h.carry; textK(h.x, h.y - 0.5, 'dd_escaped', { n: h.carry }, '#ff6a6a', 0.9); sfx('escape'); }
  if (h === S.boss) S.boss = null;
}
function enterTile(h, x, y) {
  h.cx = x; h.cy = y;
  const s = S.grid[idx(x, y)];
  if (s && s.kind === 'trap' && h.cls === 'rogue' && s.dis <= 0 && h.blind <= 0 && rand() < h.def.disarm) {
    s.dis = 6; textK(x + 0.5, y + 0.1, 'dd_disarmed', 0, '#ffe27a', 0.8); burst(x + 0.5, y + 0.5, 8, '#ffe27a', 1.5, 0.4, 0.06, 0, true); sfx('click');
  }
  if (!h.boss) for (const [dx, dy] of [[0, 0], ...R8]) {
    const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const g = S.grid[idx(nx, ny)];
    if (g && g.id === 'gold' && g.dis <= 0 && !h.grabbed.includes(g.uid)) { h.grabbed.push(g.uid); h.grab = g.st.t; h.grabT = g.st.t; g.anim = 0.6; break; }
  }
}
function updateHero(h, dt) {
  h.flash -= dt; if (h.frozen > 0) h.frozen -= dt; if (h.frozenImm > 0) h.frozenImm -= dt; if (h.stun > 0) h.stun -= dt;
  if (h.wet > 0) h.wet -= dt; if (h.rust > 0) h.rust -= dt; if (h.blind > 0) h.blind -= dt; if (h.grab > 0) h.grab -= dt; if (h.slimed > 0) h.slimed -= dt;
  if (h.chillT > 0) { h.chillT -= dt; if (h.chillT <= 0) h.chill = 0; }
  if (h.charge > 0) h.charge -= dt; if (h.pitT > 0) h.pitT -= dt; if (h.retreat > 0) h.retreat -= dt;
  if (h.floodSlow > 0) h.floodSlow = Math.max(0, h.floodSlow - dt * 2);
  // damage over time
  if (h.burn) { hurt(h, h.burn.dps * dt, 'fire', true); h.burn.t -= dt; if (h.burn.t <= 0) h.burn = null; }
  if (h.poison.length) { let dps = 0; for (const p of h.poison) { dps += p.dps; p.t -= dt; } h.poison = h.poison.filter(p => p.t > 0); hurt(h, dps * dt, 'poison', true); }
  if (h.dead) return;
  h.dotT -= dt; if (h.dotT <= 0) { h.dotT = 0.55; if (h.dotAcc >= 1) { text(h.x + (rand() - 0.5) * 0.3, h.y - 0.5, Math.round(h.dotAcc) + '', h.burn ? '#ff9a3a' : h.poison.length ? '#8cff5a' : '#ff9a3a', 0.6); h.dotAcc = 0; } }
  ability(h, dt); if (h.dead || h.gone) return;
  // fighting a monster
  if (h.fight) {
    const m = h.fight;
    if (m.dead || m.gone) h.fight = null;
    else if (h.frozen <= 0 && h.stun <= 0) { h.atkCd -= dt; if (h.atkCd <= 0) { h.atkCd = h.boss ? 1.2 : 1; m.hp -= h.dmg; m.flash = 0.1; h.swing = 0.2; if (m.hp <= 0) monDie(m); } }
  }
  if (h.swing > 0) h.swing -= dt;
  // digging
  if (h.dig > 0 && h.frozen <= 0 && h.stun <= 0) {
    h.dig -= dt; if (Math.random() < dt * 6) { dust(h.digTile % MW + 0.5, ((h.digTile / MW) | 0) + 0.5, 3); sfx('dig'); }
    if (h.dig <= 0) { const s = S.grid[h.digTile]; if (s && s.id === 'collapse') { removeStruct(s); dust(s.x + 0.5, s.y + 0.5); S.shake = Math.max(S.shake, 0.3); } h.digTile = -1; }
  }
  // movement
  const sp = h.sp * speedMul(h); h.moving = false;
  if (sp > 0) {
    if (h.tx == null) {
      const goalIn = h.state === 'in' && h.cx === S.V[0] && h.cy === S.V[1], goalOut = h.state === 'flee' && h.cx === S.E[0] && h.cy === S.E[1];
      if (goalIn) { steal(h); }
      else if (goalOut) { escape(h); return; }
      pickNext(h);
    }
    if (h.tx != null) {
      const tx = h.tx + 0.5, ty = h.ty + 0.5, dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy), step = sp * dt;
      const sdx = L.portrait ? dy : dx; if (Math.abs(sdx) > 0.001) h.flip = sdx < 0;
      if (d <= step) { h.x = tx; h.y = ty; const nx = h.tx, ny = h.ty; h.tx = h.ty = null; enterTile(h, nx, ny); }
      else { h.x += dx / d * step; h.y += dy / d * step; }
      h.moving = true; h.walk += dt * sp * 2.2;
      if (h.boss && rand() < dt * 3) S.shake = Math.max(S.shake, 0.08);
    }
  }
  // meet a monster: stop and fight it
  if (!h.fight && h.charge <= 0 && h.dig <= 0 && !(h.retreat > 0)) {
    for (const m of S.mons) {
      if (m.dead || m.gone || m.engaged >= m.blk) continue;
      if (dist(h.x, h.y, m.x, m.y) < 0.62) { h.fight = m; m.engaged++; break; }
    }
  }
}
function clericHeal(h, frac, rad, always) {
  let healed = false;
  for (const o of S.heroes) if (!o.dead && dist(o.x, o.y, h.x, h.y) < rad && o.hp < o.maxHp) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * frac); healed = true; burst(o.x, o.y, 5, '#9affb0', 1, 0.6, 0.06, -1.5, true); }
  if (healed || always) { ring(h.x, h.y, rad, '#9affb0'); sfx('heal'); }
  return healed;
}
function mageScorch(h, rg) {   // fire at the nearest working trap/tower/monster; false when nothing is in range
  let best = null, bd = rg;
  for (const s of S.structs) { if (s.id === 'collapse' || s.dis > 0) continue; if (s.mon && s.mon.dead) continue; const d = dist(h.x, h.y, s.x + 0.5, s.y + 0.5); if (d < bd) { bd = d; best = s; } }
  if (!best) return false;
  h.cast = 0.4;
  S.proj.push({ kind: 'scorch', x: h.x, y: h.y - 0.3, tsx: best.x + 0.5, tsy: best.y + 0.5, s: best, sp: 5, dmg: 35 * S.scale.dmg, life: 3 });
  sfx('scorch'); return true;
}
function bossPower(h) {
  const c = h.cls;
  if (c === 'brannoc') { h.charge = 1.4; h.fight = null; text(h.x, h.y - 1, '!!', '#ffcc33', 1.2); sfx('horn'); }
  else if (c === 'vexa') {
    ring(h.x, h.y, 2.5, '#e070ff'); sfx('boom'); S.shake = Math.max(S.shake, 0.5);
    for (const s of S.structs) { if (s.id === 'collapse') continue; if (dist(h.x, h.y, s.x + 0.5, s.y + 0.5) <= 2.5) { s.dis = Math.max(s.dis, 3); if (s.mon && !s.mon.dead) { s.mon.hp -= 50 * S.scale.dmg; if (s.mon.hp <= 0) monDie(s.mon); } } }
    burst(h.x, h.y, 60, '#e070ff', 4, 0.8, 0.1, 0, true);
  } else if (c === 'aldric') { for (let i = 0; i < 2; i++) { const k = spawnHero('squire', h.cx, h.cy); k.x = h.x + (rand() - 0.5) * 0.4; k.y = h.y + (rand() - 0.5) * 0.4; k.state = h.state; k.via = h.via; } ring(h.x, h.y, 1.5, '#ffcc33'); sfx('horn'); }
}
function ability(h, dt) {
  if (h.frozen > 0 || h.stun > 0) return;
  h.abilT -= dt;
  const c = h.cls, man = ctlOn();   // man: a player triggers cleric / mage / boss powers by hand
  if (c === 'cleric' && h.abilT <= 0) {
    h.abilT = 3; if (man || h.blind > 0) return;
    clericHeal(h, h.def.heal, 2);
  } else if (c === 'mage' && h.abilT <= 0) {
    if (man || h.blind > 0) { h.abilT = 1; return; }
    if (!mageScorch(h, 2.5)) { h.abilT = 0.6; return; }
    h.abilT = h.def.scorch;
  } else if (c === 'brannoc' && h.abilT <= 0) {
    h.abilT = 7; if (!man) bossPower(h);
  } else if (c === 'vexa') {
    if (h.abilT <= 0) { h.abilT = 6; if (!man) bossPower(h); }
    h.abil2T -= dt;
    if (h.abil2T <= 0 && !h.fight) {
      h.abil2T = 9; burst(h.x, h.y, 30, '#c03aff', 2.5, 0.6, 0.08, 0, true);
      for (let i = 0; i < 3; i++) { h.tx = h.ty = null; const ok = pickNext(h); if (!ok || h.tx == null) break; h.x = h.tx + 0.5; h.y = h.ty + 0.5; h.cx = h.tx; h.cy = h.ty; h.tx = h.ty = null; if ((h.state === 'in' && h.cx === S.V[0] && h.cy === S.V[1])) break; }
      burst(h.x, h.y, 30, '#e070ff', 2.5, 0.6, 0.08, 0, true); sfx('spell');
    }
  } else if (c === 'aldric') {
    if (h.abilT <= 0) { h.abilT = 9; if (!man) bossPower(h); }
    if (!h.enraged && h.hp < h.maxHp * 0.5) { h.enraged = true; h.hp += h.maxHp * 0.1; text(h.x, h.y - 1.1, '!!!', '#ff4d6d', 1.4); S.shake = 1; sfx('boss'); burst(h.x, h.y, 50, '#ff4d6d', 3.5, 0.8, 0.1, 0, true); }
  }
}
// a party command from the Heroes player -> { ok, err }
G.heroCmd = (k) => {
  const c = S.ctl; if (!ctlOn() || S.mode !== 'wave' || !(k in CMD_CD)) return { ok: false, err: '' };
  if (c.cd[k] > 0) return { ok: false, err: 'dd_oCooldown' };
  const live = S.heroes.filter(h => !h.dead && !h.gone), free = (h) => h.frozen <= 0 && h.stun <= 0;
  let ok = false, err = '';
  if (k === 'heal') {
    for (const h of live) if (h.cls === 'cleric' && free(h) && h.blind <= 0) { clericHeal(h, 0.3, 2.2, true); ok = true; }
    if (!ok) err = 'dd_oNoCleric';
  } else if (k === 'scorch') {
    let any = false;
    for (const h of live) if (h.cls === 'mage' && free(h) && h.blind <= 0) { any = true; if (mageScorch(h, 3)) ok = true; }
    if (!ok) err = any ? 'dd_oNoTarget' : 'dd_oNoMage';
  } else if (k === 'charge') {
    for (const h of live) if (!h.boss && free(h)) { h.charge = 1.5; h.fight = null; text(h.x, h.y - 0.8, '!!', '#ffcc33', 0.9); ok = true; }
    if (ok) sfx('horn'); else err = 'dd_oNoHeroes';
  } else if (k === 'boss') {
    const b = S.boss; if (b && !b.dead && !b.gone) { bossPower(b); ok = true; } else err = 'dd_oNoBoss';
  } else if (k === 'retreat') {
    for (const h of live) if (h.state === 'in') { h.state = 'flee'; h.via = true; h.fight = null; h.retreat = 1.5; h.retreated = true; h.tx = h.ty = null; text(h.x, h.y - 0.7, '«', '#c9d1de', 0.9); ok = true; }
    if (ok) sfx('escape'); else err = 'dd_oNoHeroes';
  }
  if (ok) c.cd[k] = CMD_CD[k];
  return { ok, err };
};
// the Heroes player picks which hero walks in next (queued a moment apart)
G.sendHero = (cls) => {
  if (!ctlOn() || S.mode !== 'wave') return false;
  const Q = S.spawnQ, i = Q.findIndex(q => !q.now && q.cls === cls); if (i < 0) return false;
  const [e] = Q.splice(i, 1); e.now = true;
  let j = 0; while (j < Q.length && Q[j].now) j++;
  Q.splice(j, 0, e); return true;
};

// ---------------------------------------------------------------- structures
function rangeOf(s) { return s.st.rg + (has('eagleEye') && s.kind === 'tower' ? 0.6 : 0) + (s.fx.arcaneFocus ? 1 : 0); }
function dmgOf(s) { return s.st.d * lvlMul(s) * (1 + s.drum / 100) * (s.fx.arcaneFocus ? 1.4 : 1); }
G.rangeOf = rangeOf; G.dmgOf = dmgOf;
const trapMul = (s) => lvlMul(s) * (has('whetstone') ? 1.3 : 1);
function onTile(x, y) { return S.heroes.filter(h => !h.dead && Math.floor(h.x) === x && Math.floor(h.y) === y && h.charge <= 0); }
function near(x, y, r) { return S.heroes.filter(h => !h.dead && Math.abs(Math.floor(h.x) - x) <= r && Math.abs(Math.floor(h.y) - y) <= r); }
function pickTarget(s, rg) {
  const cx = s.x + 0.5, cy = s.y + 0.5; let best = null, bs = 1e9;
  for (const h of S.heroes) {
    if (h.dead) continue; const d = dist(h.x, h.y, cx, cy); if (d > rg) continue;
    const i = idx(Math.floor(h.x), Math.floor(h.y));
    const sc = h.carry > 0 ? -1000 + S.fieldE[i] : (h.state === 'flee' ? -500 + S.fieldE[i] : S.fieldV[i]);
    if (sc < bs) { bs = sc; best = h; }
  }
  return best;
}
function updateStruct(s, dt) {
  if (s.anim > 0) s.anim -= dt;
  if (s.dis > 0) { s.dis -= dt; if (rand() < dt * 8) S.parts.push({ x: s.x + 0.3 + rand() * 0.4, y: s.y + 0.4 + rand() * 0.3, vx: 0, vy: -0.6, life: 0.6, max: 0.6, col: rand() < 0.5 ? '#ff7a2f' : '#5a4a50', size: 0.07, g: 0, add: rand() < 0.5 }); return; }
  const cx = s.x + 0.5, cy = s.y + 0.5;
  switch (s.id) {
    case 'archer': case 'smage': case 'ballista': case 'dragon': case 'storm': {
      s.cd -= dt; if (s.cd > 0) return;
      const rg = rangeOf(s), tg = pickTarget(s, rg); if (!tg) { s.cd = 0.1; return; }
      s.cd = s.st.r; s.anim = 0.25; s.ang = Math.atan2(tg.y - cy, tg.x - cx);
      const dmg = dmgOf(s);
      if (s.id === 'archer') { S.proj.push({ kind: 'arrow', x: cx, y: cy - 0.45, h: tg, sp: 9, dmg, fire: !!s.fx.fireArrows, life: 2 }); sfx(s.fx.fireArrows ? 'fire' : 'arrow'); }
      else if (s.id === 'smage') { S.proj.push({ kind: 'frostbolt', x: cx, y: cy - 0.55, h: tg, sp: 6, dmg, life: 2 }); sfx('frost'); }
      else if (s.id === 'ballista') {
        const a = Math.atan2(tg.y - cy, tg.x - cx);
        S.proj.push({ kind: 'bolt', x: cx, y: cy - 0.2, dx: Math.cos(a), dy: Math.sin(a), sp: 13, dmg, range: rg + 0.6, gone: 0, hit: [], frost: !!s.fx.frostBolt, life: 2 }); sfx('arrow'); sfx('hit');
      } else if (s.id === 'dragon') {
        const px = tg.x, py = tg.y;
        breath(cx, cy, px, py);
        for (const h of S.heroes) if (!h.dead && dist(h.x, h.y, px, py) <= 1.1) { const m = s.fx.dragonsHoard && h.grab > 0 ? 2 : 1; hurt(h, dmg * m, 'fire'); if (!h.dead) burn(h, s.st.b * lvlMul(s), 3); }
        sfx('fire');
      } else if (s.id === 'storm') {
        let jumps = s.st.n + (s.fx.conduction ? 2 : 0) + (has('stormJar') ? 1 : 0), d = dmg * (has('stormJar') ? 1.25 : 1);
        let cur = tg, px = cx, py = cy - 0.8; const hit = [];
        while (cur && jumps-- >= 0) {
          hit.push(cur); bolt(px, py, cur.x, cur.y - 0.2, 0.18, '#ffe85a');
          hurt(cur, d * (s.fx.conduction && cur.wet > 0 ? 2 : 1), 'shock'); burst(cur.x, cur.y - 0.2, 5, '#fff6b0', 1.5, 0.25, 0.05, 0, true);
          px = cur.x; py = cur.y - 0.2; d *= 0.8;
          let nb = null, nd = 1.7; for (const h of S.heroes) { if (h.dead || hit.includes(h)) continue; const dd = dist(h.x, h.y, px, py); if (dd < nd) { nd = dd; nb = h; } }
          cur = nb;
        }
        sfx('zap');
      }
      return;
    }
    case 'spikes': {
      s.cd -= dt; if (s.cd > 0) return;
      const hs = onTile(s.x, s.y); if (!hs.length) return;
      s.cd = s.st.r; s.anim = 0.3; sfx('spikes');
      for (const h of hs) { let d = s.st.d * trapMul(s); if (s.fx.shatter && (h.chill > 0 || h.frozen > 0)) { d *= 3; burst(h.x, h.y, 10, '#c8f4ff', 2.2, 0.4, 0.07, 1, true); if (h.frozen > 0) h.frozen = 0; } hurt(h, d, 'phys'); }
      return;
    }
    case 'lava': {
      const hs = onTile(s.x, s.y);
      for (const h of hs) { hurt(h, s.st.d * trapMul(s) * dt, 'fire', true); if (!h.dead) burn(h, s.st.b * trapMul(s), s.st.t); }
      return;
    }
    case 'frost': {
      for (const h of onTile(s.x, s.y)) {
        if (s.fx.flashFreeze && h.wet > 0 && h.frozen <= 0 && h.frozenImm <= 0) { freeze(h, s.st.t * 1.6); continue; }
        h.chillAcc += dt; if (h.chillAcc >= 0.42) { h.chillAcc = 0; chill(h, s.st.s / 100, s.st.t); }
      }
      return;
    }
    case 'gas': {
      s.cd -= dt;
      if (s.cd <= 0) { s.cd = 0.5; for (const h of near(s.x, s.y, 1)) poison(h, s.st.d * trapMul(s), s.st.t * (has('plague') ? 1.3 : 1)); }
      if (rand() < dt * 10) S.parts.push({ x: cx + (rand() - 0.5) * 1.6, y: cy + (rand() - 0.5) * 1.6, vx: (rand() - 0.5) * 0.3, vy: -0.25, life: 1.4, max: 1.4, col: s.fx.gasBlast ? '#c8d84a' : '#7adf4a', size: 0.22, g: 0, add: false, puff: true });
      if (s.fx.gasBlast) { s.blast -= dt; if (s.blast <= 0) { const hs = near(s.x, s.y, 1); if (hs.length) { s.blast = 3; for (const h of hs) hurt(h, 30 * trapMul(s), 'fire'); burst(cx, cy, 40, '#ffb347', 4, 0.6, 0.1, -0.5, true); burst(cx, cy, 20, '#ff5a2a', 2.5, 0.5, 0.12, 0, true); S.shake = Math.max(S.shake, 0.35); sfx('boom'); } else s.blast = 0.2; } }
      return;
    }
    case 'pit': {
      if (s.cd > 0) { s.cd -= dt; return; }
      const hs = onTile(s.x, s.y).filter(h => h.stun <= 0 && !(h.pitT > 0)); if (!hs.length) return;
      const h = hs[0], mul = s.fx.spikedPit ? 2 : 1;
      hurt(h, s.st.d * trapMul(s) * mul * (h.boss ? 0.5 : 1), 'true'); if (!h.dead) { stun(h, s.st.t); h.pitT = 2.5; h.fall = 0.5; }
      s.cd = s.st.cd / (s.fx.spikedPit ? 2 : 1); s.anim = 0.4; sfx('pit'); dust(cx, cy, 6);
      return;
    }
    case 'flood': {
      for (const h of onTile(s.x, s.y)) { h.wet = s.st.t; h.floodSlow = Math.max(h.floodSlow, s.st.s / 100); }
      if (s.fx.steam) {
        s.cd2 -= dt; if (rand() < dt * 9) S.parts.push({ x: cx + (rand() - 0.5) * 1.4, y: cy + (rand() - 0.5) * 1.2, vx: 0, vy: -0.5, life: 1, max: 1, col: '#e6ecff', size: 0.2, g: 0, add: false, puff: true });
        if (s.cd2 <= 0) { s.cd2 = 0.5; for (const h of near(s.x, s.y, 1)) { hurt(h, 5 * lvlMul(s), 'fire', true); h.blind = 1.5; } }
      }
      return;
    }
    case 'crypt': {
      s.cd -= dt; if (s.cd > 0) return; s.cd = s.st.t * (has('boneRing') ? 0.6 : 1);
      const mine = S.mons.filter(m => m.src === s && !m.gone && !m.dead).length; if (mine >= s.st.n) return;
      const spots = R8.map(([dx, dy]) => [s.x + dx, s.y + dy]).filter(([x, y]) => inb(x, y) && S.terr[idx(x, y)] === T_FLOOR && !(S.grid[idx(x, y)] && S.grid[idx(x, y)].id === 'collapse'));
      if (!spots.length) return;
      const [x, y] = spots[Math.floor(rand() * spots.length)], k = makeMon('skeleton', x, y, null, true); k.life = 999; k.src = s; S.mons.push(k);
      burst(x + 0.5, y + 0.5, 14, '#7aff9a', 1.8, 0.6, 0.07, -1, true); bolt(cx, cy - 0.3, x + 0.5, y + 0.4, 0.3, '#7aff9a');
      return;
    }
  }
}
function updateProj(p, dt) {
  p.life -= dt; if (p.life <= 0) { p.dead = true; return; }
  if (p.kind === 'bolt') {
    const st = p.sp * dt; p.x += p.dx * st; p.y += p.dy * st; p.gone += st;
    for (const h of S.heroes) { if (h.dead || p.hit.includes(h.id)) continue; if (dist(h.x, h.y - 0.1, p.x, p.y) < 0.42) { p.hit.push(h.id); hurt(h, p.dmg, 'phys'); if (p.frost && !h.dead) freeze(h, 1, true); burst(h.x, h.y, 6, '#e8eef8', 1.8, 0.3, 0.05, 0, false); } }
    if (p.gone > p.range) p.dead = true;
    return;
  }
  let tx, ty;
  if (p.kind === 'scorch') { tx = p.tsx; ty = p.tsy; }
  else { if (p.h && !p.h.dead) { p.tx = p.h.x; p.ty = p.h.y - 0.2; } tx = p.tx; ty = p.ty; if (tx == null) { p.dead = true; return; } }
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), st = p.sp * dt;
  p.ang = Math.atan2(dy, dx);
  if (p.kind === 'frostbolt' && rand() < 0.6) S.parts.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.3, max: 0.3, col: '#9be7ff', size: 0.07, g: 0, add: true });
  if (p.kind === 'arrow' && p.fire && rand() < 0.7) S.parts.push({ x: p.x, y: p.y, vx: 0, vy: -0.3, life: 0.3, max: 0.3, col: rand() < 0.5 ? '#ff7a2f' : '#ffd23a', size: 0.07, g: 0, add: true });
  if (p.kind === 'scorch' && rand() < 0.8) S.parts.push({ x: p.x, y: p.y, vx: 0, vy: -0.2, life: 0.35, max: 0.35, col: '#ff9a3a', size: 0.09, g: 0, add: true });
  if (d > st) { p.x += dx / d * st; p.y += dy / d * st; return; }
  p.dead = true;
  if (p.kind === 'scorch') {
    const s = p.s; if (!S.structs.includes(s)) return;
    if (s.mon) { if (!s.mon.dead) { s.mon.hp -= p.dmg; s.mon.flash = 0.15; if (s.mon.hp <= 0) monDie(s.mon); } }
    else s.dis = Math.max(s.dis, 4);
    burst(tx, ty, 18, '#ff7a2f', 2, 0.5, 0.08, -0.5, true); sfx('fire');
    return;
  }
  const h = p.h; if (!h || h.dead) return;
  if (h.def.dodge && p.kind === 'arrow' && rand() < h.def.dodge) { textK(h.x, h.y - 0.6, 'dd_dodge', 0, '#c8c8d8', 0.6); return; }
  if (p.kind === 'arrow') {
    if (p.fire) { hurt(h, p.dmg * (h.ar > 0 ? 3 : 1), 'fire'); if (!h.dead) burn(h, 3, 2); if (h.ar > 0) burst(h.x, h.y, 8, '#ffb347', 2, 0.35, 0.07, -0.5, true); }
    else hurt(h, p.dmg, 'phys');
  } else if (p.kind === 'frostbolt') {
    hurt(h, p.dmg, 'frost'); if (!h.dead) chill(h, 0.4, 1.2); burst(h.x, h.y - 0.2, 6, '#9be7ff', 1.4, 0.3, 0.05, 0, true);
  }
}

// ---------------------------------------------------------------- waves
G.waveDef = (act, w, dread) => {
  const groups = DD.WAVES[act][w].map(([c, n]) => [c, DD.HEROES[c].boss ? n : n + Math.floor((dread || 0) / 3)]);
  return groups;
};
G.startWave = () => {
  const run = S.run; if (!run || S.mode !== 'build') return false;
  const groups = G.waveDef(run.act, run.wave, run.dread), dread = run.dread;
  const gi = run.act * DD.WAVES_PER_ACT + run.wave;
  S.scale = { hp: [1, 1.6, 2.25][run.act] * (1 + 0.07 * run.wave) * (1 + 0.12 * dread), sp: 1 + 0.02 * dread, dmg: [1, 1.35, 1.75][run.act], loot: 1 + 0.25 * run.act };
  const list = [];
  for (const [c, n] of groups) { if (DD.HEROES[c].boss) { list.push({ cls: c, k: 0.6 }); continue; } for (let i = 0; i < n; i++) list.push({ cls: c, k: (i + 0.5) / n + (c.charCodeAt(0) % 7) * 0.004 }); }
  list.sort((a, b) => a.k - b.k);
  const gap = [1.15, 1.0, 0.88][run.act] * (1 - 0.03 * dread);
  S.spawnQ = list.map((e, i) => ({ cls: e.cls, gap: DD.HEROES[e.cls].boss || (list[i + 1] && DD.HEROES[list[i + 1].cls].boss) ? 2.6 : gap * (0.85 + rand() * 0.3) }));
  S.waveTotal = list.length; S.spawnT = 0.8; S.wt = 0; S.mode = 'wave'; run.bountyWave = 0; run.globalWave = gi;
  if (S.ctl) { for (const k in S.ctl.cd) S.ctl.cd[k] = 0; S.ctl.sendCd = 0; if (ctlOn()) S.spawnT = AUTO_SEND; }
  sfx('horn'); S.version++;
  return true;
};
G.resetBoard = () => {   // between waves: monsters revive, temp minions vanish, nothing disabled
  S.heroes = []; S.proj = []; S.bolts = []; S.boss = null;
  S.mons = S.mons.filter(m => !m.temp && !m.gone);
  for (const s of S.structs) { s.dis = 0; s.cd = 0.3; s.blast = 1.5; if (s.mon) { s.mon.dead = false; s.mon.hp = s.mon.maxHp; s.mon.split = false; s.mon.engaged = 0; } }
};
G.step = (dt) => {
  const run = S.run;
  S.wt += dt; if (run) run.stats.time += dt;
  const c = S.ctl;
  if (c) { for (const k in c.cd) if (c.cd[k] > 0) c.cd[k] = Math.max(0, c.cd[k] - dt); if (c.sendCd > 0) c.sendCd -= dt; }
  if (S.spawnQ.length) {
    S.spawnT -= dt;
    if (ctlOn()) {   // player sends heroes; if they wait too long the next one walks in by itself
      if ((S.spawnQ[0].now && c.sendCd <= 0) || S.spawnT <= 0) { const q = S.spawnQ.shift(); spawnHero(q.cls, S.E[0], S.E[1]); c.sendCd = SEND_GAP; S.spawnT = AUTO_SEND; }
    } else if (S.spawnT <= 0) { const q = S.spawnQ.shift(); spawnHero(q.cls, S.E[0], S.E[1]); S.spawnT = q.gap; }
  }
  // paladin aura
  const pals = S.heroes.filter(h => h.cls === 'paladin' && !h.dead);
  for (const h of S.heroes) h.aura = pals.some(p => dist(p.x, p.y, h.x, h.y) < 1.6);
  for (const m of S.mons) m.engaged = 0;
  for (const h of S.heroes) if (h.fight && !h.fight.dead) h.fight.engaged++;
  for (const h of S.heroes) if (!h.dead && !h.gone) updateHero(h, dt);
  for (const s of S.structs) updateStruct(s, dt);
  for (const m of S.mons) if (!m.gone) updateMon(m, dt);
  for (const p of S.proj) updateProj(p, dt);
  S.proj = S.proj.filter(p => !p.dead);
  S.heroes = S.heroes.filter(h => !h.dead && !h.gone);
  S.mons = S.mons.filter(m => !m.gone);
  if (S.demo) { if (!S.spawnQ.length && S.heroes.length < 3) S.spawnQ.push({ cls: ['squire', 'rogue', 'knight', 'cleric', 'mage'][Math.floor(rand() * 5)], gap: 2.5 }); return; }
  if (S.mode !== 'wave' || !run) return;
  if (c && run.stats.stolen >= c.goal) { S.mode = 'over'; sfx('lose'); G.on.defeat('loot'); return; }   // online: heroes escaped with enough loot
  if (run.vault <= 0 && !S.heroes.some(h => h.carry > 0)) { run.vault = 0; S.mode = 'over'; sfx('lose'); G.on.defeat('vault'); return; }
  if (!S.spawnQ.length && !S.heroes.length) { S.mode = 'between'; sfx('clear'); G.on.waveEnd(); }
};
G.heroesLeft = () => S.spawnQ.length + S.heroes.length;

// place a piece without paying for it (save restore, demo)
G.placeRaw = (id, x, y, lvl, up) => {
  const C = DD.CARDS[id]; if (!C || !inb(x, y) || S.grid[idx(x, y)]) return null;
  const s = { uid: S.uid++, id, kind: C.kind, x, y, lvl: lvl || 1, up: !!up, st: G.stats(id, up), cd: 0.3, cd2: 0, dis: 0, anim: 0, fx: {}, drum: 0, ang: 0, blast: 1.5, born: -10 };
  S.grid[idx(x, y)] = s; S.structs.push(s);
  if (C.kind === 'monster') { s.mon = makeMon(id, x, y, s, false); S.mons.push(s.mon); }
  return s;
};
G.structAt = (x, y) => inb(x, y) ? S.grid[idx(x, y)] : null;
G.terrAt = (x, y) => inb(x, y) ? S.terr[idx(x, y)] : -1;
// demo dungeon for the title screen
G.demo = () => {
  S.run = null; S.rel = {}; G.loadMap(0); S.demo = true; S.mode = 'menu'; S.scale = { hp: 1.6, sp: 1, dmg: 1, loot: 0 };
  const put = (id, x, y) => G.placeRaw(id, x, y, 1, false);
  put('lava', 3, 3); put('archer', 4, 4); put('spikes', 7, 3); put('frost', 8, 3); put('archer', 6, 4); put('gas', 9, 5); put('slime', 9, 4); put('smage', 8, 2); put('collapse', 3, 5);
  computeFields(); recomputeCombos(); for (const l of S.links) l.born = -10;
};

// ---------------------------------------------------------------- particles & text
function burst(x, y, n, col, spd, life, size, grav, add) {
  rec(['b', r2(x), r2(y), n, col, spd, life, size, grav || 0, add ? 1 : 0]);
  for (let i = 0; i < n && S.parts.length < 900; i++) { const a = rand() * Math.PI * 2, v = spd * (0.3 + rand() * 0.7); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (grav < 0 ? 0.5 : 0), life: life * (0.5 + rand() * 0.5), max: life, col, size: size * (0.6 + rand() * 0.8), g: grav || 0, add }); }
}
G.burst = burst;
function dust(x, y, n) { burst(x, y, n || 22, '#8a8090', 2, 0.7, 0.12, 1.5, false); burst(x, y, (n || 22) / 2, '#5a5060', 1.2, 1, 0.18, -0.3, false); }
function ring(x, y, r, col) { rec(['r', r2(x), r2(y), r, col]); S.rings.push({ x, y, r, col, life: 0.5, max: 0.5 }); }
function addText(x, y, str, col, size) { if (!str) return; S.texts.push({ x, y, str, col, life: 0.9, max: 0.9, size: size || 0.8 }); if (S.texts.length > 70) S.texts.shift(); }
function text(x, y, str, col, size) { if (!str) return; rec(['t', r2(x), r2(y), str, col, size || 0.8]); addText(x, y, str, col, size); }
function textK(x, y, key, vars, col, size) { rec(['k', r2(x), r2(y), key, vars || 0, col, size]); addText(x, y, t(key, vars || undefined), col, size); }   // localized on each page
function bolt(ax, ay, bx, by, life, col) { rec(['l', r2(ax), r2(ay), r2(bx), r2(by), life, col]); S.bolts.push({ ax, ay, bx, by, life, col }); }
function breath(cx, cy, px, py) {   // dragon fire cone
  rec(['f', r2(cx), r2(cy), r2(px), r2(py)]);
  for (let i = 0; i < 26; i++) { const k = rand(); S.parts.push({ x: cx + (px - cx) * k * 0.3, y: cy - 0.2 + (py - cy) * k * 0.3, vx: (px - cx) * (1.6 + rand()) + (rand() - 0.5), vy: (py - cy) * (1.6 + rand()) + (rand() - 0.5), life: 0.45, max: 0.45, col: rand() < 0.5 ? '#ff7a2f' : '#ffd23a', size: 0.12, g: 0, add: true }); }
}
G.text = text; G.addText = addText; G.ring = ring; G.bolt = bolt; G.breath = breath;
function coinsTo(x, y, n) { rec(['c', r2(x), r2(y), n]); for (let i = 0; i < n; i++) S.parts.push({ coin: true, x: x + (rand() - 0.5) * 0.3, y: y + (rand() - 0.5) * 0.3, vx: (rand() - 0.5) * 2.5, vy: -1.5 - rand() * 1.5, life: 1.2 + i * 0.04, max: 1.2 + i * 0.04, col: '#ffcc33', size: 0.1, g: 0, add: false }); }
G.coinsTo = coinsTo;
G.fx = (dt) => {
  S.time += dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.2);
  if (S.vaultHit > 0) S.vaultHit -= dt;
  const vx = S.V[0] + 0.5, vy = S.V[1] + 0.5;
  for (const p of S.parts) {
    p.life -= dt;
    if (p.coin) { const k = 1 - p.life / p.max; if (k > 0.35) { p.x += (vx - p.x) * Math.min(1, dt * 6); p.y += (vy - p.y) * Math.min(1, dt * 6); if (dist(p.x, p.y, vx, vy) < 0.15) { p.life = 0; S.vaultPing = 0.15; } } else { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 4 * dt; } continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= 1 - dt * 2; if (!p.puff) p.vy *= 1 - dt * 1.5;
  }
  S.parts = S.parts.filter(p => p.life > 0);
  for (const tx of S.texts) { tx.life -= dt; tx.y -= dt * 0.7; }
  S.texts = S.texts.filter(tx => tx.life > 0);
  for (const b of S.bolts) b.life -= dt; S.bolts = S.bolts.filter(b => b.life > 0);
  for (const r of S.rings) r.life -= dt; S.rings = S.rings.filter(r => r.life > 0);
  if (S.vaultPing > 0) S.vaultPing -= dt;
};

// ---------------------------------------------------------------- rendering
let L = { T: 48, ox: 0, oy: 0, portrait: false, bw: MW * 48, bh: MH * 48, W: 800, H: 600, dpr: 1 };
G.setLayout = (l) => { L = l; S.terrainDirty = true; };
G.layout = () => L;
const P = (x, y) => L.portrait ? [L.ox + y * L.T, L.oy + x * L.T] : [L.ox + x * L.T, L.oy + y * L.T];
G.P = P;
G.tileAt = (sx, sy) => {
  let x = (sx - L.ox) / L.T, y = (sy - L.oy) / L.T; if (L.portrait) [x, y] = [y, x];
  x = Math.floor(x); y = Math.floor(y); return inb(x, y) ? { x, y } : null;
};
G.heroAt = (sx, sy) => {
  let best = null, bd = L.T * 0.55;
  for (const h of S.heroes) { const [px, py] = P(h.x + h.ox, h.y + h.oy); const d = Math.hypot(px - sx, py - sy + L.T * 0.15); if (d < bd) { bd = d; best = h; } }
  return best;
};
const floorCache = {}, rockCache = {}, chasmCache = {};
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
let terrain = null;
function screenBelow(x, y) { return L.portrait ? [x + 1, y] : [x, y + 1]; }
function screenAbove(x, y) { return L.portrait ? [x - 1, y] : [x, y - 1]; }
const walkT = (x, y) => inb(x, y) && S.terr[idx(x, y)] !== T_ROCK;
function buildTerrain() {
  const dpr = L.dpr, T = L.T;
  if (!terrain) terrain = document.createElement('canvas');
  terrain.width = Math.ceil(L.W * dpr); terrain.height = Math.ceil(L.H * dpr);
  const g = terrain.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, L.W, L.H);
  const act = S.act, pal = A.PAL[act];
  // outer frame
  const fx = L.ox - T * 0.18, fy = L.oy - T * 0.18, fw = L.bw + T * 0.36, fh = L.bh + T * 0.36;
  g.fillStyle = '#05040a'; g.fillRect(fx - 2, fy - 2, fw + 4, fh + 4); g.fillStyle = '#2a2436'; g.fillRect(fx, fy, fw, fh); g.fillStyle = '#05040a'; g.fillRect(L.ox - 2, L.oy - 2, L.bw + 4, L.bh + 4);
  g.fillStyle = '#ffb703'; for (const [cx, cy] of [[fx, fy], [fx + fw, fy], [fx, fy + fh], [fx + fw, fy + fh]]) g.fillRect(cx - 3, cy - 3, 6, 6);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const tt = S.terr[idx(x, y)], [sx, sy] = P(x, y), rx = Math.round(sx), ry = Math.round(sy), rw = Math.round(sx + T) - rx, rh = Math.round(sy + T) - ry, hs = hash(x, y);
    if (tt === T_ROCK) {
      const [bx, by] = screenBelow(x, y), face = walkT(bx, by) ? 1 : 0, key = act + ':' + (hs % 6) + ':' + face;
      const spr = rockCache[key] || (rockCache[key] = A.rockTile(act, hs % 6, face)); g.drawImage(spr, rx, ry, rw, rh);
    } else if (tt === T_CHASM) {
      const key = act + ':' + (hs % 4); g.drawImage(chasmCache[key] || (chasmCache[key] = A.chasmTile(act, hs % 4)), rx, ry, rw, rh);
    } else {
      const key = act + ':' + (hs % 10); g.drawImage(floorCache[key] || (floorCache[key] = A.floorTile(act, hs % 10)), rx, ry, rw, rh);
      const [ax, ay] = screenAbove(x, y);
      if (!walkT(ax, ay)) { const gr = g.createLinearGradient(0, ry, 0, ry + rh * 0.4); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(rx, ry, rw, rh * 0.4); }
      const [lx, ly] = L.portrait ? [x, y - 1] : [x - 1, y], [qx, qy] = L.portrait ? [x, y + 1] : [x + 1, y];
      if (!walkT(lx, ly)) { const gr = g.createLinearGradient(rx, 0, rx + rw * 0.22, 0); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(rx, ry, rw * 0.22, rh); }
      if (!walkT(qx, qy)) { const gr = g.createLinearGradient(rx + rw, 0, rx + rw * 0.78, 0); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(rx + rw * 0.78, ry, rw * 0.22, rh); }
      if (tt === T_GATE) g.drawImage(A.gateSprite, rx, ry, rw, rh);
    }
  }
  // torches on wall faces
  S.torches = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (S.terr[idx(x, y)] !== T_ROCK) continue; const [bx, by] = screenBelow(x, y); if (!walkT(bx, by)) continue;
    if (hash(x + 3, y + 7) % 5 === 0) S.torches.push([x, y]);
  }
  S.terrainDirty = false;
}
let vign = null, vignKey = '';
G.render = (ctx) => {
  if (S.terrainDirty || !terrain) buildTerrain();
  const T = L.T, W = L.W, H = L.H, tm = S.time, pal = A.PAL[S.act];
  ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
  const bgg = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.7); bgg.addColorStop(0, 'rgba(60,40,90,0.25)'); bgg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = bgg; ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (S.shake > 0) ctx.translate((rand() - 0.5) * S.shake * T * 0.25, (rand() - 0.5) * S.shake * T * 0.25);
  ctx.drawImage(terrain, 0, 0, W, H);
  // chasm glow / lava river
  for (let i = 0; i < N; i++) if (S.terr[i] === T_CHASM && S.act === 1) { const x = i % MW, y = (i / MW) | 0, [sx, sy] = P(x, y); ctx.fillStyle = `rgba(255,${120 + Math.sin(tm * 2 + x + y) * 40 | 0},20,${0.25 + 0.15 * Math.sin(tm * 3 + x * 2)})`; ctx.fillRect(sx, sy, T, T); }
  drawVault(ctx);
  // floor pieces
  for (const s of S.structs) if (!A.TALL[s.id] && s.kind !== 'monster' && s.id !== 'collapse') drawFloorPiece(ctx, s);
  // main route hint while building
  if (S.mode === 'build' || S.mode === 'menu' || (S.showFlag && S.ctl && S.ctl.flag)) drawRoute(ctx);
  drawLinks(ctx);
  if (S.sel >= 0 && S.run) drawPlacement(ctx);
  // depth-sorted sprites
  const list = [];
  for (const s of S.structs) if (A.TALL[s.id] || s.id === 'collapse') { const [, sy] = P(s.x + 0.5, s.y + 0.5); list.push([sy + T * 0.5, 0, s]); }
  for (const m of S.mons) { const [, sy] = P(m.x, m.y); list.push([sy + T * 0.3, 1, m]); }
  for (const h of S.heroes) { const [, sy] = P(h.x + h.ox, h.y + h.oy); list.push([sy + T * 0.32, 2, h]); }
  list.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of list) { if (k === 0) drawTall(ctx, o); else if (k === 1) drawMon(ctx, o); else drawHero(ctx, o); }
  drawLinkIcons(ctx);
  drawFlag(ctx);
  drawProj(ctx);
  // particles
  for (const p of S.parts) {
    const [sx, sy] = P(p.x, p.y), a = clamp(p.life / p.max, 0, 1), sz = Math.max(1.5, p.size * T);
    if (p.coin) { ctx.fillStyle = '#ffcc33'; ctx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz); ctx.fillStyle = '#fff6c8'; ctx.fillRect(sx - sz / 2, sy - sz / 2, sz / 2, sz / 2); continue; }
    ctx.globalAlpha = p.puff ? a * 0.35 : a; ctx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
    ctx.fillStyle = p.col; const s2 = p.puff ? sz * (1.5 - a * 0.5) : sz; ctx.fillRect(sx - s2 / 2, sy - s2 / 2, s2, s2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  for (const r of S.rings) { const [sx, sy] = P(r.x, r.y), k = 1 - r.life / r.max; ctx.strokeStyle = r.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = Math.max(2, T * 0.06); ctx.beginPath(); ctx.arc(sx, sy, r.r * T * (0.3 + 0.7 * k), 0, Math.PI * 2); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (const b of S.bolts) drawBolt(ctx, b);
  drawLights(ctx);
  // HP bars & status
  for (const m of S.mons) if (!m.dead && m.hp < m.maxHp) { const [sx, sy] = P(m.x, m.y); bar(ctx, sx, sy - T * (m.type === 'golem' ? 0.62 : 0.5), T * 0.55, m.hp / m.maxHp, '#5fdc7a'); }
  for (const h of S.heroes) drawHeroUI(ctx, h);
  // floating text
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const tx of S.texts) {
    const [sx, sy] = P(tx.x, tx.y), a = clamp(tx.life / tx.max * 1.6, 0, 1), fs = Math.max(11, T * 0.32 * tx.size);
    ctx.globalAlpha = a; ctx.font = `900 ${fs}px "Trebuchet MS", Tahoma, sans-serif`; ctx.lineWidth = Math.max(2, fs * 0.22); ctx.strokeStyle = '#0b0712'; ctx.strokeText(tx.str, sx, sy); ctx.fillStyle = tx.col; ctx.fillText(tx.str, sx, sy);
  }
  ctx.globalAlpha = 1;
  if (S.hover && S.sel < 0 && S.focus) drawFocus(ctx);
  ctx.restore();
  // vignette
  const vk = W + 'x' + H;
  if (vk !== vignKey) { vignKey = vk; vign = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); vign.addColorStop(0, 'rgba(0,0,0,0)'); vign.addColorStop(1, 'rgba(0,0,0,0.55)'); }
  ctx.fillStyle = vign; ctx.fillRect(0, 0, W, H);
};
function bar(ctx, cx, y, w, f, col) {
  const h = Math.max(3, L.T * 0.075); ctx.fillStyle = '#0b0712'; ctx.fillRect(cx - w / 2 - 1, y - 1, w + 2, h + 2); ctx.fillStyle = '#3a1520'; ctx.fillRect(cx - w / 2, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(cx - w / 2, y, w * clamp(f, 0, 1), h);
}
function drawVault(ctx) {
  const T = L.T, [sx, sy] = P(S.V[0], S.V[1]), run = S.run, loot = run ? run.vault : 100;
  const gl = ctx.createRadialGradient(sx + T / 2, sy + T / 2, 2, sx + T / 2, sy + T / 2, T * 1.3); gl.addColorStop(0, `rgba(255,200,60,${0.35 + (S.vaultPing > 0 ? 0.2 : 0)})`); gl.addColorStop(1, 'rgba(255,200,60,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gl; ctx.fillRect(sx - T, sy - T, T * 3, T * 3); ctx.globalCompositeOperation = 'source-over';
  const piles = clamp(Math.ceil(loot / 25), 0, 8), j = S.vaultHit > 0 ? (rand() - 0.5) * T * 0.05 : 0;
  for (let i = 0; i < piles; i++) { const a = i * 2.4, rr = T * (0.12 + 0.05 * (i % 3)); const px = sx + T / 2 + Math.cos(a) * rr * 1.4 + j, py = sy + T * 0.72 + Math.sin(a) * rr * 0.5; ctx.fillStyle = '#b8862a'; ctx.fillRect(px - T * 0.11, py - T * 0.05, T * 0.22, T * 0.08); ctx.fillStyle = '#ffcc33'; ctx.fillRect(px - T * 0.09, py - T * 0.09, T * 0.18, T * 0.06); }
  ctx.drawImage(A.vaultSprite, Math.round(sx + T * 0.12 + j), Math.round(sy + T * 0.02), Math.round(T * 0.76), Math.round(T * 0.76));
  if (Math.floor(tm() * 3) % 4 === 0 && loot > 0) { ctx.fillStyle = '#fff'; const k = hash(Math.floor(tm() * 3), 1) % 5; ctx.fillRect(sx + T * (0.25 + k * 0.1), sy + T * 0.35, 2, 2); }
}
const tm = () => S.time;
function drawRoute(ctx) {
  const fl = S.showFlag && S.ctl && S.ctl.flag, T = L.T, path = fl ? G.routeTiles() : G.pathTiles(); if (path.length < 2) return;
  ctx.fillStyle = fl ? 'rgba(110,190,255,0.32)' : 'rgba(255,183,3,0.20)';
  for (let i = 1; i < path.length - 1; i++) { const [x, y] = path[i], [sx, sy] = P(x + 0.5, y + 0.5), ph = (tm() * 2 - i * 0.35) % 1; const s = T * (0.08 + 0.05 * (ph < 0 ? ph + 1 : ph)); ctx.fillRect(sx - s, sy - s, s * 2, s * 2); }
}
function drawFlag(ctx) {   // the Heroes player's route flag (only drawn on the Heroes page)
  const c = S.ctl; if (!S.showFlag || !c || !c.flag) return;
  const T = L.T, [sx, sy] = P(c.flag[0], c.flag[1]), wv = Math.sin(tm() * 5) * T * 0.04;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(sx + T * 0.4, sy + T * 0.84, T * 0.18, T * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2614'; ctx.fillRect(Math.round(sx + T * 0.37), Math.round(sy + T * 0.1), Math.max(2, Math.round(T * 0.06)), Math.round(T * 0.74));
  ctx.beginPath(); ctx.moveTo(sx + T * 0.43, sy + T * 0.12); ctx.lineTo(sx + T * 0.84, sy + T * 0.25 + wv); ctx.lineTo(sx + T * 0.43, sy + T * 0.42); ctx.closePath();
  ctx.fillStyle = '#5ab8ff'; ctx.fill(); ctx.lineWidth = Math.max(1.5, T * 0.035); ctx.strokeStyle = '#0b0712'; ctx.stroke();
  ctx.fillStyle = '#e8f4ff'; ctx.fillRect(Math.round(sx + T * 0.5), Math.round(sy + T * 0.22 + wv * 0.5), Math.max(2, Math.round(T * 0.08)), Math.max(2, Math.round(T * 0.08)));
}
function drawLinks(ctx) {
  const T = L.T;
  for (const l of S.links) {
    const [ax, ay] = P(l.ax + 0.5, l.ay + 0.5), [bx, by] = P(l.bx + 0.5, l.by + 0.5), age = tm() - l.born;
    ctx.strokeStyle = l.col; ctx.globalAlpha = 0.45 + 0.2 * Math.sin(tm() * 4) + (age < 1 ? 0.5 * (1 - age) : 0); ctx.lineWidth = Math.max(2, T * 0.06);
    ctx.setLineDash([T * 0.12, T * 0.1]); ctx.lineDashOffset = -tm() * T * 0.6; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}
function drawLinkIcons(ctx) {
  const T = L.T;
  for (const l of S.links) {
    const [ax, ay] = P(l.ax + 0.5, l.ay + 0.5), [bx, by] = P(l.bx + 0.5, l.by + 0.5), mx = (ax + bx) / 2, my = (ay + by) / 2, age = tm() - l.born;
    const r = T * 0.16 * (age < 0.6 ? 1 + (0.6 - age) : 1);
    diamond(ctx, mx, my, r, '#0b0712', l.col); ctx.drawImage(A.glyph(l.g, l.col), Math.round(mx - r * 0.7), Math.round(my - r * 0.7), Math.round(r * 1.4), Math.round(r * 1.4));
  }
}
function diamond(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = Math.max(1.5, L.T * 0.035); ctx.strokeStyle = stroke; ctx.stroke(); }
// valid tiles for the selected card, with combo diamonds, and a ghost at the hovered tile
let placeCache = { key: '', ok: [] };
G.placements = () => {
  const run = S.run, key = S.version + ':' + S.sel + ':' + run.mana + ':' + S.mode + ':' + run.hand.length + ':' + (S.mode === 'wave' ? Math.floor(S.wt * 2) : 0);
  if (placeCache.key === key) return placeCache.ok;
  const ok = []; for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const r = G.canPlay(S.sel, x, y); if (r.ok) ok.push({ x, y, r }); }
  placeCache = { key, ok }; return ok;
};
function drawPlacement(ctx) {
  const T = L.T, card = S.run.hand[S.sel]; if (!card) return;
  const C = DD.CARDS[card.id]; if (C.place === 'none') return;
  const pulse = 0.5 + 0.5 * Math.sin(tm() * 5), col = DD.KINDS[C.kind].col;
  if (C.place !== 'target') for (const { x, y, r } of G.placements()) {
    const [sx, sy] = P(x, y);
    ctx.fillStyle = r.empower ? 'rgba(255,204,51,0.16)' : 'rgba(150,255,190,0.07)'; ctx.fillRect(sx + 1, sy + 1, T - 2, T - 2);
    ctx.strokeStyle = r.empower ? '#ffcc33' : col; ctx.globalAlpha = 0.45 + 0.4 * pulse; ctx.lineWidth = Math.max(1.5, T * 0.045);
    const a = T * 0.12, b = T * 0.24, q = T * 0.88; ctx.beginPath();
    ctx.moveTo(sx + a, sy + b); ctx.lineTo(sx + a, sy + a); ctx.lineTo(sx + b, sy + a); ctx.moveTo(sx + q - (b - a), sy + a); ctx.lineTo(sx + q, sy + a); ctx.lineTo(sx + q, sy + b);
    ctx.moveTo(sx + q, sy + q - (b - a)); ctx.lineTo(sx + q, sy + q); ctx.lineTo(sx + q - (b - a), sy + q); ctx.moveTo(sx + b, sy + q); ctx.lineTo(sx + a, sy + q); ctx.lineTo(sx + a, sy + q - (b - a)); ctx.stroke(); ctx.globalAlpha = 1;
    const cs = [...new Set(r.combos.map(c => c.col))];
    cs.forEach((c, i) => diamond(ctx, sx + T * (0.22 + i * 0.2), sy + T * 0.22, T * 0.1 * (0.9 + 0.2 * pulse), c, '#0b0712'));
  }
  const hv = S.hover; if (!hv) return;
  const [sx, sy] = P(hv.x, hv.y), r = G.canPlay(S.sel, hv.x, hv.y);
  if (C.place === 'target') {
    const rad = G.stats(card.id, card.up).rad * T; ctx.strokeStyle = r.ok ? col : '#ff4d6d'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(sx + T / 2, sy + T / 2, rad, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = r.ok ? 'rgba(255,200,80,0.12)' : 'rgba(255,60,80,0.12)'; ctx.fill(); ctx.globalAlpha = 1; return;
  }
  if (!r.ok) { ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2; ctx.strokeRect(sx + 3, sy + 3, T - 6, T - 6); ctx.beginPath(); ctx.moveTo(sx + T * 0.3, sy + T * 0.3); ctx.lineTo(sx + T * 0.7, sy + T * 0.7); ctx.moveTo(sx + T * 0.7, sy + T * 0.3); ctx.lineTo(sx + T * 0.3, sy + T * 0.7); ctx.stroke(); return; }
  ctx.globalAlpha = 0.6 + 0.2 * pulse;
  const fake = { id: card.id, kind: C.kind, x: hv.x, y: hv.y, lvl: 1, st: G.stats(card.id, card.up), fx: {}, dis: 0, anim: 0, ang: 0, ghost: true };
  if (A.TALL[card.id] || card.id === 'collapse') drawTall(ctx, fake); else if (C.kind === 'monster') drawMon(ctx, { type: card.id, x: hv.x + 0.5, y: hv.y + 0.5, anim: tm(), hp: 1, maxHp: 1 }); else drawFloorPiece(ctx, fake);
  ctx.globalAlpha = 1;
  if (C.kind === 'tower') { const rg = (fake.st.rg + (has('eagleEye') ? 0.6 : 0) + (r.combos.some(c => c.combo === 'arcaneFocus') ? 1 : 0)) * T; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(sx + T / 2, sy + T / 2, rg, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(92,184,255,0.07)'; ctx.fill(); ctx.globalAlpha = 1; }
  for (const c of r.combos) { const [px, py] = P(c.x + 0.5, c.y + 0.5); ctx.strokeStyle = c.col; ctx.lineWidth = Math.max(3, T * 0.08); ctx.globalAlpha = 0.6 + 0.4 * pulse; ctx.beginPath(); ctx.moveTo(sx + T / 2, sy + T / 2); ctx.lineTo(px, py); ctx.stroke(); ctx.globalAlpha = 1; diamond(ctx, px, py, T * 0.16, c.col, '#0b0712'); }
}
function drawFocus(ctx) {   // range of a hovered/tapped tower
  const f = S.focus; if (!f || f.kind !== 'tower') return;
  const T = L.T, [sx, sy] = P(f.x + 0.5, f.y + 0.5); ctx.strokeStyle = '#5cb8ff'; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, rangeOf(f) * T, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(92,184,255,0.06)'; ctx.fill(); ctx.globalAlpha = 1;
}
function drawFloorPiece(ctx, s) {
  const T = L.T, [sx, sy] = P(s.x, s.y), t0 = tm(), cx = sx + T / 2, cy = sy + T / 2;
  const dis = s.dis > 0;
  switch (s.id) {
    case 'lava': {
      ctx.fillStyle = '#3a1a10'; ctx.fillRect(sx + T * 0.06, sy + T * 0.1, T * 0.88, T * 0.8);
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, T * 0.48); g.addColorStop(0, dis ? '#7a4a3a' : '#ffd23a'); g.addColorStop(0.5, dis ? '#5a2a1a' : '#ff6a1a'); g.addColorStop(1, dis ? '#3a1a10' : '#a8200a');
      ctx.fillStyle = g; ctx.fillRect(sx + T * 0.12, sy + T * 0.16, T * 0.76, T * 0.68);
      if (!dis) for (let i = 0; i < 3; i++) { const ph = (t0 * 0.8 + i * 0.37 + s.x * 0.1) % 1, bx = sx + T * (0.25 + ((i * 0.31 + s.y * 0.17) % 0.5)), by = sy + T * (0.7 - ph * 0.4); ctx.fillStyle = '#fff0a8'; const bs = T * 0.07 * (1 - ph); ctx.fillRect(bx, by, bs, bs); }
      break;
    }
    case 'flood': {
      ctx.fillStyle = '#16264a'; ctx.fillRect(sx + T * 0.04, sy + T * 0.04, T * 0.92, T * 0.92); ctx.fillStyle = '#2a5aa8'; ctx.fillRect(sx + T * 0.08, sy + T * 0.08, T * 0.84, T * 0.84);
      ctx.fillStyle = '#8ac8ff'; for (let i = 0; i < 3; i++) { const ph = (t0 * 0.35 + i / 3) % 1; ctx.fillRect(sx + T * (0.15 + ((i * 0.37) % 0.5) + Math.sin(t0 + i) * 0.05), sy + T * (0.15 + ph * 0.7), T * 0.25, Math.max(1, T * 0.04)); }
      break;
    }
    case 'frost': {
      const a = dis ? 0.25 : 0.55 + 0.35 * Math.sin(t0 * 3 + s.x);
      ctx.fillStyle = '#0e2236'; ctx.fillRect(sx + T * 0.1, sy + T * 0.1, T * 0.8, T * 0.8);
      ctx.strokeStyle = `rgba(127,211,255,${a})`; ctx.lineWidth = Math.max(2, T * 0.06); ctx.strokeRect(sx + T * 0.18, sy + T * 0.18, T * 0.64, T * 0.64);
      ctx.fillStyle = `rgba(200,244,255,${a})`; ctx.fillRect(cx - T * 0.04, sy + T * 0.26, T * 0.08, T * 0.48); ctx.fillRect(sx + T * 0.26, cy - T * 0.04, T * 0.48, T * 0.08);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4); ctx.fillRect(-T * 0.03, -T * 0.2, T * 0.06, T * 0.4); ctx.fillRect(-T * 0.2, -T * 0.03, T * 0.4, T * 0.06); ctx.restore();
      break;
    }
    case 'pit': ctx.drawImage(A.struct('pit', s.cd > 0 ? 1 : 0), sx, sy, T, T); break;
    case 'spikes': ctx.drawImage(A.struct('spikes', s.anim > 0 || s.ghost ? 1 : 0), sx, sy, T, T); break;
    case 'gold': ctx.drawImage(A.struct('gold', (Math.floor(t0 * 2 + s.x) % 3 === 0) ? 1 : 0), sx, sy - (s.anim > 0 ? T * 0.05 : 0), T, T); break;
    default: ctx.drawImage(A.struct(s.id, 0), sx, sy, T, T);
  }
  if (dis) { ctx.fillStyle = 'rgba(10,6,14,0.45)'; ctx.fillRect(sx, sy, T, T); ctx.drawImage(A.glyph(s.id === 'gold' ? 'flame' : 'gear', '#ffe27a'), Math.round(cx - T * 0.15), Math.round(cy - T * 0.15), Math.round(T * 0.3), Math.round(T * 0.3)); }
  pips(ctx, s, sx, sy);
}
function pips(ctx, s, sx, sy) {
  const T = L.T; if (s.ghost) return;
  for (let i = 1; i < s.lvl; i++) diamond(ctx, sx + T * (0.86 - (i - 1) * 0.16), sy + T * 0.86, T * 0.07, '#ffcc33', '#0b0712');
  if (s.up) { ctx.fillStyle = '#5fdc7a'; ctx.fillRect(sx + T * 0.08, sy + T * 0.8, T * 0.12, T * 0.04); ctx.fillRect(sx + T * 0.12, sy + T * 0.76, T * 0.04, T * 0.12); }
}
function drawTall(ctx, s) {
  const T = L.T, [sx, sy] = P(s.x, s.y);
  if (s.id === 'collapse') { ctx.drawImage(A.struct('collapse', 0), Math.round(sx), Math.round(sy - T * 0.08), T, T); return; }
  const fr = (s.id === 'archer' && s.fx.fireArrows) || (s.id === 'smage' && s.anim > 0) || (s.id === 'dragon' && s.anim > 0) || (s.id === 'storm' && Math.floor(tm() * 6) % 2) || (s.id === 'well' && Math.floor(tm() * 2) % 2) || (s.id === 'banner' && Math.floor(tm() * 2.5) % 2) || (s.id === 'crypt' && Math.floor(tm() * 1.5) % 2) ? 1 : 0;
  const spr = A.struct(s.id, fr), h = T * 1.5, bump = s.anim > 0 && s.kind === 'tower' ? T * 0.03 : 0;
  ctx.drawImage(spr, Math.round(sx), Math.round(sy + T - h + bump), Math.round(T), Math.round(h));
  if (s.id === 'ballista') {
    ctx.save(); ctx.translate(sx + T / 2, sy + T * 0.18); let a = s.ang; if (L.portrait) a = Math.PI / 2 - a; ctx.rotate(a);
    const rec = s.anim > 0 ? -T * 0.08 : 0; ctx.drawImage(A.ballistaArm, -T * 0.5 + rec, -T * 0.22, T, T * 0.44); ctx.restore();
  }
  if (s.id === 'archer' && s.fx.fireArrows && !s.ghost) { const f = Math.floor(tm() * 8) % 2; ctx.fillStyle = f ? '#ffd23a' : '#ff7a2f'; ctx.fillRect(sx + T * 0.72, sy - T * 0.38 - f * 2, T * 0.1, T * 0.14); }
  if (s.dis > 0) { ctx.fillStyle = 'rgba(10,6,14,0.5)'; ctx.fillRect(sx, sy + T - h, T, h); ctx.drawImage(A.glyph('flame', '#ff9a3a'), Math.round(sx + T * 0.3), Math.round(sy + T * 0.05), Math.round(T * 0.4), Math.round(T * 0.4)); }
  pips(ctx, s, sx, sy);
}
function shadow(ctx, sx, sy, w) { ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(sx, sy, w * 0.42, w * 0.14, 0, 0, Math.PI * 2); ctx.fill(); }
function drawMon(ctx, m) {
  const T = L.T, [sx, sy] = P(m.x, m.y);
  const w = T * ({ golem: 0.95, slime: 0.8, skeleton: 0.78, minislime: 0.6 }[m.type] || 0.8);
  if (m.dead) {
    ctx.globalAlpha = 0.5; const ty = m.type === 'golem' ? 'collapse' : null;
    if (ty) ctx.drawImage(A.struct('collapse', 0), sx - w * 0.35, sy - w * 0.2, w * 0.7, w * 0.7);
    else { ctx.fillStyle = m.type === 'skeleton' ? '#ece6d6' : '#2f9a48'; ctx.fillRect(sx - w * 0.3, sy + w * 0.05, w * 0.6, w * 0.12); }
    ctx.globalAlpha = 1;
    const k = 1 - m.reviveT / ((m.type === 'skeleton' ? m.s.st.t : m.type === 'golem' ? 18 : 14) * (has('boneRing') ? 0.5 : 1));
    ctx.strokeStyle = '#c58bff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, T * 0.22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k, 0, 1)); ctx.stroke();
    return;
  }
  const f = m.type === 'golem' ? (m.slam > 0 ? 1 : 0) : (Math.floor(m.anim * 2.5) % 2);
  if (m.slam > 0) m.slam -= 1 / 60;
  const spr = A.mon(m.type, f), h = w * spr.height / 16;
  shadow(ctx, sx, sy + T * 0.3, w);
  const temp = m.temp && m.type === 'skeleton';
  if (temp) ctx.globalAlpha = 0.85;
  ctx.drawImage(spr, Math.round(sx - w / 2), Math.round(sy + T * 0.32 - h), Math.round(w), Math.round(h));
  if (m.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6; ctx.drawImage(A.tint(spr, '#ffffff'), Math.round(sx - w / 2), Math.round(sy + T * 0.32 - h), Math.round(w), Math.round(h)); ctx.globalCompositeOperation = 'source-over'; }
  if (temp) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; ctx.drawImage(A.tint(spr, '#c58bff'), Math.round(sx - w / 2), Math.round(sy + T * 0.32 - h), Math.round(w), Math.round(h)); ctx.globalCompositeOperation = 'source-over'; }
  ctx.globalAlpha = 1;
  if (m.s && m.s.dis > 0) { ctx.drawImage(A.glyph('flame', '#ff9a3a'), Math.round(sx - T * 0.15), Math.round(sy - T * 0.55), Math.round(T * 0.3), Math.round(T * 0.3)); }
  if (m.s) pips(ctx, m.s, sx - T / 2, sy - T / 2);
}
const TINT = {};
A.tint = (spr, col) => {
  const k = spr.width + 'x' + spr.height + col + (spr._id || (spr._id = Math.random().toString(36).slice(2)));
  if (TINT[k]) return TINT[k];
  const c = document.createElement('canvas'); c.width = spr.width; c.height = spr.height; const g = c.getContext('2d'); g.drawImage(spr, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  return (TINT[k] = c);
};
function drawHero(ctx, h) {
  const T = L.T, [sx, sy] = P(h.x + h.ox, h.y + h.oy), w = T * 0.8 * h.size, hh = w * 18 / 16;
  const fr = h.moving ? Math.floor(h.walk * 2) % 2 : 0, spr = A.hero(h.cls, fr);
  const bob = h.moving ? Math.abs(Math.sin(h.walk * Math.PI)) * w * 0.05 : 0, fall = h.fall > 0 ? (h.fall -= 1 / 60, h.fall * T * 0.3) : 0;
  shadow(ctx, sx, sy + T * 0.32, w * (h.boss ? 1.1 : 0.9));
  if (h.boss) { const gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, T); gl.addColorStop(0, h.enraged ? 'rgba(255,60,90,0.35)' : 'rgba(255,200,80,0.22)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(sx - T, sy - T, T * 2, T * 2); }
  ctx.save(); ctx.translate(Math.round(sx), Math.round(sy + T * 0.32 - bob + fall)); if (h.flip) ctx.scale(-1, 1);
  if (h.swing > 0) ctx.rotate(0.12);
  if (h.fall > 0) ctx.globalAlpha = 0.6;
  ctx.drawImage(spr, Math.round(-w / 2), Math.round(-hh), Math.round(w), Math.round(hh));
  const over = h.flash > 0 ? ['#ffffff', 0.7] : h.frozen > 0 ? ['#9be7ff', 0.5] : h.rust > 0 ? ['#d8803a', 0.3] : h.chill > 0 ? ['#7fd3ff', 0.25] : h.poison.length ? ['#7adf4a', 0.2] : h.charge > 0 ? ['#ffcc33', 0.35] : null;
  if (over) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = over[1]; ctx.drawImage(A.tint(spr, over[0]), Math.round(-w / 2), Math.round(-hh), Math.round(w), Math.round(hh)); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  ctx.restore();
  if (h.frozen > 0) { ctx.fillStyle = 'rgba(160,230,255,0.35)'; ctx.fillRect(sx - w * 0.45, sy + T * 0.32 - hh * 0.95, w * 0.9, hh * 0.95); ctx.strokeStyle = 'rgba(230,250,255,0.9)'; ctx.lineWidth = 1.5; ctx.strokeRect(sx - w * 0.45, sy + T * 0.32 - hh * 0.95, w * 0.9, hh * 0.95); }
  if (h.burn && rand() < 0.5) S.parts.push({ x: h.x + (rand() - 0.5) * 0.3, y: h.y - 0.2 + (rand() - 0.5) * 0.3, vx: 0, vy: -0.8, life: 0.4, max: 0.4, col: rand() < 0.5 ? '#ff7a2f' : '#ffd23a', size: 0.08, g: 0, add: true });
  if (h.poison.length && rand() < 0.15) S.parts.push({ x: h.x + (rand() - 0.5) * 0.3, y: h.y - 0.2, vx: 0, vy: -0.5, life: 0.6, max: 0.6, col: '#8cff5a', size: 0.06, g: 0, add: true });
  if (h.wet > 0 && rand() < 0.12) S.parts.push({ x: h.x + (rand() - 0.5) * 0.3, y: h.y - 0.2, vx: 0, vy: 0.6, life: 0.4, max: 0.4, col: '#8ac8ff', size: 0.05, g: 2, add: false });
}
function drawHeroUI(ctx, h) {
  const T = L.T, [sx, sy] = P(h.x + h.ox, h.y + h.oy), w = T * 0.8 * h.size, top = sy + T * 0.32 - w * 18 / 16;
  if (h.hp < h.maxHp || h.boss) bar(ctx, sx, top - T * 0.12, T * (h.boss ? 0.8 : 0.55), h.hp / h.maxHp, h.boss ? '#ff4d6d' : '#ff6a6a');
  if (h.ar > 0 && h.rust <= 0) ctx.drawImage(A.glyph('shield', '#c9d1de'), Math.round(sx - T * 0.38), Math.round(top - T * 0.2), Math.round(T * 0.18), Math.round(T * 0.18));
  if (h.carry > 0) { const b = Math.sin(tm() * 6) * T * 0.03; ctx.drawImage(A.glyph('sack', '#ffcc33'), Math.round(sx - T * 0.13), Math.round(top - T * 0.42 + b), Math.round(T * 0.26), Math.round(T * 0.26)); }
  if (h.stun > 0 && h.frozen <= 0) for (let i = 0; i < 3; i++) { const a = tm() * 5 + i * 2.1; ctx.fillStyle = '#ffe27a'; ctx.fillRect(sx + Math.cos(a) * T * 0.2 - 2, top - T * 0.05 + Math.sin(a) * T * 0.06, 4, 4); }
  if (h.grab > 0) { ctx.drawImage(A.glyph('coin', '#ffcc33'), Math.round(sx + T * 0.14), Math.round(top), Math.round(T * 0.2), Math.round(T * 0.2)); }
  if (h.dig > 0) { ctx.drawImage(A.glyph('gear', '#e8c07a'), Math.round(sx + T * 0.14), Math.round(top), Math.round(T * 0.2), Math.round(T * 0.2)); }
  if (h.blind > 0) { ctx.fillStyle = 'rgba(230,236,255,0.5)'; ctx.fillRect(sx - T * 0.15, top + T * 0.12, T * 0.3, T * 0.06); }
}
function drawProj(ctx) {
  const T = L.T;
  for (const p of S.proj) {
    const [sx, sy] = P(p.x, p.y);
    if (p.kind === 'arrow' || p.kind === 'bolt') {
      let a = p.kind === 'bolt' ? Math.atan2(p.dy, p.dx) : p.ang || 0; if (L.portrait) a = Math.PI / 2 - a;
      const len = p.kind === 'bolt' ? T * 0.5 : T * 0.3;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); ctx.fillStyle = p.kind === 'bolt' ? '#7a5230' : (p.fire ? '#ff9a3a' : '#c8b08a'); ctx.fillRect(-len / 2, -1.5, len, 3);
      ctx.fillStyle = p.fire ? '#ffd23a' : '#e8eef8'; ctx.fillRect(len / 2 - 4, -3, 5, 6); ctx.fillStyle = p.frost ? '#9be7ff' : '#d8d0bc'; ctx.fillRect(-len / 2, -3, 4, 6); ctx.restore();
    } else if (p.kind === 'frostbolt') { ctx.fillStyle = '#7fd3ff'; ctx.fillRect(sx - T * 0.08, sy - T * 0.08, T * 0.16, T * 0.16); ctx.fillStyle = '#e8fbff'; ctx.fillRect(sx - T * 0.04, sy - T * 0.04, T * 0.08, T * 0.08); }
    else if (p.kind === 'scorch') { ctx.fillStyle = '#ff7a2f'; ctx.fillRect(sx - T * 0.08, sy - T * 0.08, T * 0.16, T * 0.16); ctx.fillStyle = '#ffd23a'; ctx.fillRect(sx - T * 0.04, sy - T * 0.04, T * 0.08, T * 0.08); }
  }
}
function drawBolt(ctx, b) {
  const [ax, ay] = P(b.ax, b.ay), [bx, by] = P(b.bx, b.by), T = L.T;
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = b.col; ctx.lineWidth = Math.max(2, T * 0.05); ctx.globalAlpha = clamp(b.life * 6, 0, 1);
  ctx.beginPath(); ctx.moveTo(ax, ay); const n = 6; for (let i = 1; i < n; i++) { const k = i / n; ctx.lineTo(ax + (bx - ax) * k + (rand() - 0.5) * T * 0.25, ay + (by - ay) * k + (rand() - 0.5) * T * 0.25); } ctx.lineTo(bx, by); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function glow(ctx, x, y, r, col, a) { const [sx, sy] = P(x, y), R = r * L.T, g = ctx.createRadialGradient(sx, sy, 1, sx, sy, R); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(sx - R, sy - R, R * 2, R * 2); }
function drawLights(ctx) {
  const T = L.T, t0 = tm(), pal = A.PAL[S.act];
  ctx.globalCompositeOperation = 'lighter';
  const tc = S.act === 2 ? 'rgba(106,240,208,A)' : S.act === 1 ? 'rgba(255,122,42,A)' : 'rgba(255,170,70,A)';
  for (const [x, y] of S.torches || []) {
    const [bx, by] = screenBelow(x, y), fx = (x + bx) / 2 + 0.5, fy = (y + by) / 2 + 0.5;
    const fl = 0.22 + 0.06 * Math.sin(t0 * 9 + x * 3) + 0.04 * Math.sin(t0 * 23 + y);
    glow(ctx, fx, fy, 1.6, tc, fl);
  }
  for (const s of S.structs) {
    if (s.dis > 0) continue;
    if (s.id === 'lava') glow(ctx, s.x + 0.5, s.y + 0.5, 1.2, 'rgba(255,110,30,A)', 0.28 + 0.06 * Math.sin(t0 * 3 + s.x));
    else if (s.id === 'frost') glow(ctx, s.x + 0.5, s.y + 0.5, 0.9, 'rgba(120,210,255,A)', 0.18);
    else if (s.id === 'well') glow(ctx, s.x + 0.5, s.y + 0.3, 1, 'rgba(160,100,255,A)', 0.25);
    else if (s.id === 'crypt') glow(ctx, s.x + 0.5, s.y + 0.5, 0.9, 'rgba(100,255,140,A)', 0.18);
    else if (s.id === 'storm') glow(ctx, s.x + 0.5, s.y - 0.1, 0.8, 'rgba(255,240,100,A)', 0.2 + 0.1 * Math.sin(t0 * 11));
    else if (s.id === 'gas') glow(ctx, s.x + 0.5, s.y + 0.5, 1.2, 'rgba(120,255,60,A)', 0.1);
  }
  for (let i = 0; i < N; i++) if (S.terr[i] === T_CHASM && S.act === 1) glow(ctx, (i % MW) + 0.5, ((i / MW) | 0) + 0.5, 1, 'rgba(255,90,20,A)', 0.12);
  glow(ctx, S.E[0] + 0.5, S.E[1] + 0.5, 1.4, 'rgba(180,200,255,A)', 0.16);
  ctx.globalCompositeOperation = 'source-over';
  // torch flames
  for (const [x, y] of S.torches || []) {
    const [sx, sy] = P(x, y); let fx = sx + T * 0.5, fy = sy + T * 0.66;
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(fx - T * 0.04, fy, T * 0.08, T * 0.16);
    const f = Math.floor(t0 * 10 + x) % 3, c1 = S.act === 2 ? '#6af0d0' : '#ff9a3a', c2 = S.act === 2 ? '#d0fff4' : '#ffe27a';
    ctx.fillStyle = c1; ctx.fillRect(fx - T * 0.06, fy - T * (0.12 + f * 0.02), T * 0.12, T * (0.14 + f * 0.02)); ctx.fillStyle = c2; ctx.fillRect(fx - T * 0.025, fy - T * 0.06, T * 0.05, T * 0.07);
  }
}
})();
