'use strict';
// =====================================================================
// Echoes of the Spire — simulation: resonators, harmonies, the beat clock,
// shadow creatures, waves and the roguelike run (acts, boons, relics, saves)
// =====================================================================
const KEY_PROFILE = 'echoes-spire-profile', KEY_RUN = 'echoes-spire-run', KEY_SETTINGS = 'echoes-spire-settings';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
const ui = (name, ...a) => { if (window.UI && UI[name]) return UI[name](...a); };

const G = {
  phase: 'menu', paused: false, speed: 1, t: 0,
  map: null, res: [], enemies: [], rings: [], beams: [], parts: [], texts: [], barriers: [], groups: [], chords: [], links: [], grand: [],
  dmgBy: {}, step: 0, stepAcc: 0, bpm: 92, audioLead: 0, beatT: 0, beatN: 0, shake: 0, flash: 0, aurora: 0, heal: 0,
  act: 1, wave: 1, hp: START_HP, maxHp: START_HP, shards: START_SHARDS, score: 0, kills: 0,
  relics: [], relicSet: new Set(), unlocked: ['bell', 'harp'], attune: { bell: 0, harp: 0, hum: 0, ward: 0, echo: 0 },
  asc: 0, orient: 'p', draftsTaken: 0, spawnQ: [], spawnIdx: 0, waveStep: 0, boss: null, later: [], sparkles: 0, codaCd: 0,
  profile: null, settings: null, draft: null, nextAct: false, endless: false, leaks: 0, fresh: true,
};
let RES_ID = 1, EN_ID = 1;
const has = (id) => G.relicSet.has(id);
const mapAct = () => Math.min(G.act, 3);
const actDef = () => ACTS[Math.min(G.act, 4) - 1];
const gIndex = () => (G.act <= 3 ? (G.act - 1) * WAVES_PER_ACT + G.wave : 18 + G.wave);
const isBossWave = () => (G.act <= 3 ? G.wave === WAVES_PER_ACT : G.wave % 5 === 0);
const ACT_HP = [1, 1.5, 2.3, 2.6];
const hpScale = (g) => Math.pow(1.12, g - 1) * (1 + 0.02 * (g - 1)) * ACT_HP[Math.min(3, Math.ceil(g / WAVES_PER_ACT) - 1)] * (g > 18 ? Math.pow(1.05, g - 18) : 1) * (1 + 0.15 * G.asc);
const curBpm = () => actDef().bpm + (has('metronome') ? 10 : 0);
const barDur = () => (60 / G.bpm) * 4;
const costOf = (role) => Math.round(ROLES[role].cost * (has('luthier') ? 0.85 : 1));
const upgCost = (r) => (r.lvl >= 3 ? null : Math.round(ROLES[r.role].cost * UPG[r.lvl - 1] * (has('luthier') ? 0.85 : 1)));
const sellValue = (r) => (r.fresh && G.phase === 'build' ? r.invested : Math.floor(r.invested * SELL));
const linkR = (r) => 150 * (r.role === 'echo' ? 1.4 : 1) * (has('chamber') ? 1.25 : 1);
const rangeOf = (r) => ROLES[r.role].range * (r.rangeM || 1);

function loadProfile() {
  G.profile = Object.assign({ best: null, runs: 0, wins: 0, kills: 0, ascMax: 0, codex: [], seen: [], tut: 0 }, lsGet(KEY_PROFILE, {}));
  G.settings = Object.assign({ mute: false }, lsGet(KEY_SETTINGS, {}));
}
const saveProfile = () => lsSet(KEY_PROFILE, G.profile);
const saveSettings = () => lsSet(KEY_SETTINGS, G.settings);

// ---------------------------------------------------------------- harmony analysis
function analyze(list) {
  const n = list.length, adj = Array.from({ length: n }, () => []), links = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = list[i], b = list[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d <= Math.max(linkR(a), linkR(b))) {
      adj[i].push(j); adj[j].push(i);
      links.push({ i, j, a, b, d, uni: a.note === b.note, fifth: a.note !== b.note && isFifth(a.note, b.note), echo: a.role === 'echo' || b.role === 'echo' });
    }
  }
  const par = list.map((_, i) => i), find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
  for (const l of links) if (l.uni) par[find(l.i)] = find(l.j);
  const gm = new Map();
  for (let i = 0; i < n; i++) { const r = find(i); if (!gm.has(r)) gm.set(r, []); gm.get(r).push(i); }
  const groups = [...gm.values()].filter(g => g.length >= 2);
  const chords = [], used = new Set();
  const linked = (i, j) => adj[i].includes(j);
  for (let i = 0; i < n; i++) for (const j of adj[i]) {
    if (j <= i || list[i].note === list[j].note) continue;
    for (const k of adj[j]) {
      if (k <= j || !linked(i, k)) continue;
      const ns = [list[i].note, list[j].note, list[k].note];
      if (ns[2] === ns[0] || ns[2] === ns[1]) continue;
      for (const id in CHORDS) if (CHORDS[id].notes.every(x => ns.includes(x))) {
        const cx = (list[i].x + list[j].x + list[k].x) / 3, cy = (list[i].y + list[j].y + list[k].y) / 3;
        if (used.has(i) || used.has(j) || used.has(k)) continue;           // a resonator joins one chord at most
        if (chords.some(c => c.type === id && dist2(c.cx, c.cy, cx, cy) < 120 * 120)) continue;
        chords.push({ type: id, idx: [i, j, k], cx, cy }); used.add(i); used.add(j); used.add(k);
      }
    }
  }
  const grand = [];
  for (let i = 0; i < n; i++) {
    const s = new Set([list[i].note]); for (const j of adj[i]) s.add(list[j].note);
    if (s.size === 5 && !grand.some(g => dist2(list[g].x, list[g].y, list[i].x, list[i].y) < 170 * 170)) grand.push(i);
  }
  return { adj, links, groups, chords, grand };
}
// which harmony kinds a layout has (for the codex and for the placement preview)
function harmonyKinds(an, list) {
  const k = new Set();
  for (const g of an.groups) k.add(g.length === 2 ? 'shield' : 'blast');
  if (an.links.some(l => l.fifth)) k.add('fifth');
  for (const c of an.chords) k.add(c.type);
  if (an.grand.length) k.add('grand');
  return k;
}

function makeBarrier(a, b, old) {
  const key = Math.min(a.id, b.id) + '-' + Math.max(a.id, b.id);
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L; if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
  const cx = mx + nx * L * 0.12, cy = my + ny * L * 0.12, pts = [];
  for (let k = 0; k <= 10; k++) { const t = k / 10, u = 1 - t; pts.push({ x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y }); }
  const cross = [];
  G.map.paths.forEach((p, pi) => {
    for (let i = 0; i < p.pts.length - 1; i++) for (let k = 0; k < pts.length - 1; k++) {
      const h = segIntersect(p.pts[i].x, p.pts[i].y, p.pts[i + 1].x, p.pts[i + 1].y, pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y);
      if (h) cross.push({ p: pi, s: p.cum[i] + h.t * (p.cum[i + 1] - p.cum[i]) });
    }
  });
  let max = 60 * (1 + 0.75 * ((a.lvl + b.lvl) / 2 - 1));
  for (const e of [a, b]) if (e.role === 'ward') max *= 1 + ROLES.ward.shield[e.lvl - 1];
  if (has('aegis')) max *= 1.75;
  return { key, a, b, pts, cx, cy, cross, max, hp: old ? Math.min(max, (old.hp / old.max) * max) : max, down: old ? old.down : 0, hitT: -9, flash: 0, note: a.note };
}
const barrierOn = (B) => B.down <= 0 && !B.a.silenced && !B.b.silenced && B.a.retune <= 0 && B.b.retune <= 0;

// recompute links, groups, shields, chords and every resonator's multipliers
function rebuild() {
  const list = G.res, an = analyze(list);
  G.links = an.links;
  for (const r of list) { r.amp = 0; r.rangeM = 1; r.fifths = 0; r.chordSet = new Set(); r.group = null; }
  an.adj.forEach((nb, i) => { list[i].nb = nb.map(j => list[j]); });
  for (const l of an.links) {
    for (const [src, dst] of [[l.a, l.b], [l.b, l.a]]) if (src.role === 'echo' && dst.role !== 'echo') { dst.amp += ROLES.echo.amp[src.lvl - 1]; dst.rangeM += 0.12; }
    if (l.fifth) { l.a.fifths++; l.b.fifths++; }
  }
  const oldB = new Map(G.barriers.map(b => [b.key, b]));
  G.barriers = []; G.groups = [];
  for (const idx of an.groups) {
    const mem = idx.map(i => list[i]);
    if (mem.length === 2) {
      const key = Math.min(mem[0].id, mem[1].id) + '-' + Math.max(mem[0].id, mem[1].id);
      const B = makeBarrier(mem[0], mem[1], oldB.get(key));
      G.barriers.push(B); mem.forEach(m => { m.group = { size: 2, barrier: B }; });
    } else {
      const gr = { mem, note: mem[0].note, size: mem.length, cx: mem.reduce((s, m) => s + m.x, 0) / mem.length, cy: mem.reduce((s, m) => s + m.y, 0) / mem.length };
      G.groups.push(gr); mem.forEach(m => { m.group = gr; });
    }
  }
  const cr = 135 * (has('series') ? 1.5 : 1);
  G.chords = an.chords.map(c => { const mem = c.idx.map(i => list[i]); mem.forEach(m => m.chordSet.add(c.type)); return { type: c.type, mem, cx: c.cx, cy: c.cy, r: cr }; });
  G.grand = an.grand.map(i => list[i]);
  for (const r of list) {
    const R = ROLES[r.role];
    let m = R.mul[r.lvl - 1] * (1 + 0.15 * G.attune[r.role]);
    if (r.role === 'bell' && has('fork')) m *= 1.25;
    if (r.lvl === 3 && has('overtone')) m *= 1.35;
    m *= 1 + 0.12 * Math.min(2, r.fifths);
    m *= 1 + Math.min(1, r.amp);
    if (r.chordSet.has('radiant')) m *= 1.15;
    if (r.group && r.group.size === 2) m *= 1.1;
    r.mult = m;
    r.rangeM = Math.min(1.36, r.rangeM) * (r.role === 'harp' && has('ears') ? 1.3 : 1);
  }
  if (G.phase === 'build' || G.phase === 'wave') {
    for (const k of harmonyKinds(an, list)) if (!G.profile.codex.includes(k)) { G.profile.codex.push(k); saveProfile(); ui('discover', k); }
  }
  ui('structure');
}

// ---------------------------------------------------------------- resonators
function placeRes(role, note, sock, opts) {
  opts = opts || {};
  const s = G.map.sockets[sock];
  if (!s || s.res) return null;
  const cost = opts.free ? 0 : costOf(role);
  if (G.shards < cost) return null;
  G.shards -= cost;
  const r = { id: RES_ID++, role, note, lvl: opts.lvl || 1, sock, x: s.x, y: s.y, invested: opts.invested != null ? opts.invested : cost, fireT: 0, retune: 0, silenced: false, silenceT: 0, mult: 1, rangeM: 1, born: G.t, fresh: G.phase === 'build' && !opts.free, muteT: 0 };
  s.res = r; G.res.push(r);
  if (!opts.quiet) rebuild();
  return r;
}
function removeRes(r) {
  const s = G.map.sockets[r.sock]; if (s && s.res === r) s.res = null;
  G.res = G.res.filter(x => x !== r);
}
function sellRes(r) {
  const v = sellValue(r); G.shards += v; removeRes(r); rebuild();
  burst(r.x, r.y - 10, NOTES[r.note].rgb, 14, 90);
  ESAudio.sfx('sell', r.note); persist();
  return v;
}
function upgradeRes(r) {
  const c = upgCost(r); if (c == null || G.shards < c) return false;
  G.shards -= c; r.invested += c; r.lvl++; rebuild();
  burst(r.x, r.y - 14, NOTES[r.note].rgb, 18, 120); addRing(r.x, r.y, 46, NOTES[r.note].rgb, 0, 'fx', { dur: 0.4 });
  ESAudio.sfx('upgrade', r.note); persist();
  return true;
}
function retuneRes(r, note) {
  if (r.note === note) return;
  r.note = note; if (G.phase === 'wave') r.retune = 16;
  rebuild(); burst(r.x, r.y - 14, NOTES[note].rgb, 10, 70); ESAudio.sfx('retune', note); persist();
}

// ---------------------------------------------------------------- effects
function addRing(x, y, max, rgb, dmg, kind, o) {
  o = o || {};
  G.rings.push({ x, y, r: 3, max, rgb, dmg, kind, hit: new Set(), t: 0, dur: o.dur || 0.34, alpha: o.alpha == null ? 1 : o.alpha, push: o.push || 0, stun: o.stun || 0, lw: o.lw || 0 });
}
function burst(x, y, rgb, n, spd, kind) {
  if (G.parts.length > 700) n = Math.min(n, 4);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, v = (0.3 + Math.random() * 0.7) * (spd || 80);
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0, max: 0.5 + Math.random() * 0.6, rgb, s: 1.5 + Math.random() * 2.5, k: kind || 'spark' });
  }
}
function smoke(x, y, n, s) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = 10 + Math.random() * 40; G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, life: 0, max: 0.6 + Math.random() * 0.5, rgb: '20,10,40', s: (s || 6) * (0.6 + Math.random() * 0.8), k: 'smoke' }); }
}
function floatText(x, y, txt, col, size) { G.texts.push({ x, y, txt, col: col || '#fff', t: 0, size: size || 13 }); }
function shake(v) { G.shake = Math.max(G.shake, v); }

// ---------------------------------------------------------------- the beat
function onStep(over) {
  const s = G.step++, st = s & 15, bar = s >> 4;
  const now = ESAudio.now(), when = Math.max(now + 0.005, now + 0.07 + G.audioLead - over / (G.curSpeed || 1));
  if (st % 4 === 0) { G.beatT = 1; G.beatN = st >> 2; }
  const live = G.phase === 'wave';
  const A = actDef(), bd = barDur();
  bed(st, bar, when, live, A, bd);
  if (G.phase === 'over') return;
  if (live) {
    G.waveStep++;
    while (G.spawnIdx < G.spawnQ.length && G.spawnQ[G.spawnIdx].st <= G.waveStep) { const q = G.spawnQ[G.spawnIdx++]; spawnEnemy(q.type, q.path); }
    if (st === 0) bossBar(bar);
    if (st === 0 && bar % 2 === 0) for (const e of G.enemies) if (!e.dead && e.def.heal) mournerHeal(e);
  }
  for (const B of G.barriers) if (B.down > 0 && --B.down === 0) { B.hp = B.max * 0.6; B.flash = 1; }
  updateSilence();
  const notes = new Map();
  const queue = (role, note, oct, v) => { const k = role + note + '_' + oct; const e = notes.get(k); if (e) e.v += v; else notes.set(k, { role, note, oct, v }); };
  for (const r of G.res) {
    if (r.retune > 0) { r.retune--; continue; }
    const R = ROLES[r.role], lv = r.lvl - 1;
    const rot = r.role === 'harp' ? (r.sock % 2) * (lv === 0 ? 2 : 1) : 0;
    if (!R.pat[lv].includes((st - rot + 16) % 16)) continue;
    if (r.role === 'ward' && bar % R.every[lv] !== 0) continue;
    if (r.silenced) { r.muteT = 1; continue; }
    fire(r, live, 1);
    queue(r.role, r.note, R.oct, 1);
  }
  if (st === 0) {
    for (const gr of G.groups) if (bar % 2 === 0) groupBlast(gr, live, when);
    const sr = 95 * (has('spiresong') ? 1.4 : 1);
    addRing(0, 0, sr, '220,230,255', live ? (5 + 0.4 * gIndex()) * (has('spiresong') ? 3 : 1) : 0, 'spire', { alpha: live ? 0.7 : 0.3, dur: 0.4 });
    queue('spire', A.prog[bar % 4], 5, 0.5);
    if (live) {
      if (G.codaCd > 0) G.codaCd--;
      const rad = G.chords.filter(c => c.type === 'radiant' && c.mem.some(m => !m.silenced));
      if (bar % 2 === 0 && rad.length && G.hp < G.maxHp) {
        const h = Math.min(2, rad.length) + (has('series') ? 1 : 0);
        G.hp = Math.min(G.maxHp, G.hp + h); G.heal = 1; ESAudio.heal(when);
        for (const c of rad) for (let i = 0; i < 10; i++) G.parts.push({ x: c.cx, y: c.cy, tx: 0, ty: -40, life: 0, max: 0.9 + Math.random() * 0.4, rgb: CHORDS.radiant.rgb, s: 2.5, k: 'home', d: Math.random() * 0.3 });
        floatText(0, -130, '+' + h, '#ffe08a', 16);
      }
      if (bar % 4 === 0 && G.grand.length) auroraStrike(when);
      if (bar % 8 === 0 && has('golden') && G.res.length) { for (const r of G.res) if (!r.silenced && r.role !== 'echo') fire(r, true, 2); G.flash = Math.max(G.flash, 0.35); G.flashCol = '255,224,138'; }
    }
  }
  if (G.sparkles > 0) { ESAudio.sparkle(when); G.sparkles = 0; }
  const vol = live ? 1 : G.phase === 'menu' ? 0.5 : 0.6;
  for (const v of notes.values()) ESAudio.voice(v.role, v.note, v.oct, when, Math.min(2.2, Math.sqrt(v.v)) * vol, bd);
}
function bed(st, bar, when, live, A, bd) {
  const root = A.prog[bar % 4];
  if (st === 0) { ESAudio.pad(root, when, bd, live ? 1 : 0.75); if (live) ESAudio.bass(root, when, bd * 0.6, 1); }
  if (live) {
    const boss = !!G.boss;
    if (st === 0 || st === 8 || (G.act >= 3 && st === 11) || (boss && (st === 6 || st === 14))) ESAudio.kick(when, st === 0 ? 1 : 0.75);
    if (st === 4 || st === 12) ESAudio.clap(when, 0.8);
    if (st % 2 === 0) ESAudio.hat(when, st % 4 === 2 ? 1 : 0.45); else if (boss || G.act >= 2) ESAudio.hat(when, 0.22);
    if (st === 10) ESAudio.bass(root, when, bd * 0.2, 0.6);
  } else if (G.phase !== 'over' && st % 4 === 2) ESAudio.shaker(when, 0.7);
}

function fire(r, live, extra) {
  const R = ROLES[r.role], lv = r.lvl - 1, rgb = NOTES[r.note].rgb;
  r.fireT = 1;
  const range = R.range * r.rangeM, dmg = R.dmg * r.mult * extra;
  switch (r.role) {
    case 'bell': addRing(r.x, r.y, range, rgb, live ? dmg : 0, 'bell', { alpha: live ? 1 : 0.32 }); break;
    case 'harp': {
      if (!live) break;
      const tg = pickTarget(r.x, r.y, range); if (!tg) break;
      zap(r.x, r.y - 22, tg, dmg, rgb);
      let last = tg; const hit = new Set([tg]);
      for (let c = 0; c < R.chain[lv] + (has('strings') ? 1 : 0); c++) {
        let nx = null, nd = 95 * 95;
        for (const e of G.enemies) { if (e.dead || hit.has(e)) continue; const d = dist2(e.x, e.y, last.x, last.y); if (d < nd) { nd = d; nx = e; } }
        if (!nx) break; zap(last.x, last.y, nx, dmg * 0.7, rgb); hit.add(nx); last = nx;
      }
      break;
    }
    case 'hum': addRing(r.x, r.y, range, rgb, live ? dmg * (has('frost') ? 2 : 1) : 0, 'hum', { alpha: live ? 0.55 : 0.22, dur: 0.75 }); break;
    case 'ward': addRing(r.x, r.y, range, rgb, live ? dmg : 0, 'ward', { push: live ? R.push[lv] : 0, alpha: live ? 1 : 0.32, dur: 0.45 }); break;
    case 'echo': for (let i = 0; i < 4; i++) G.parts.push({ x: r.x + (Math.random() - 0.5) * 24, y: r.y - 18, vx: (Math.random() - 0.5) * 12, vy: -30 - Math.random() * 20, life: 0, max: 1.2, rgb, s: 2, k: 'spark' }); break;
  }
  if (Math.random() < (live ? 0.35 : 0.5)) G.parts.push({ x: r.x + (Math.random() - 0.5) * 10, y: r.y - 30, vx: (Math.random() - 0.5) * 14, vy: -26, life: 0, max: 1.3, rgb, s: 9, k: 'note' });
}
function zap(x, y, e, dmg, rgb) {
  G.beams.push({ x1: x, y1: y, x2: e.x, y2: e.y - (e.fly ? 16 : 4), rgb, t: 0, seed: Math.random() * 10 });
  hurt(e, dmg, 'harp'); burst(e.x, e.y, rgb, 4, 60);
}
function pickTarget(x, y, range) {
  let best = null, br = 1e9;
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (dist2(e.x, e.y, x, y) > (range + e.r) * (range + e.r)) continue;
    if (e.rem < br) { br = e.rem; best = e; }
  }
  return best;
}
function groupBlast(gr, live, when) {
  const act = gr.mem.filter(m => !m.silenced && m.retune <= 0);
  if (act.length < 3) return;
  const size = Math.min(gr.size, 6), rgb = NOTES[gr.note].rgb;     // bigger choirs stop growing past six voices
  const R = (115 + 14 * (size - 3)) * (has('choir') ? 1.3 : 1);
  const stun = 1.0 + 0.1 * (size - 3) + (has('choir') ? 0.5 : 0);
  const lvl = gr.mem.reduce((s, m) => s + [1, 1.5, 2.2][m.lvl - 1], 0) / gr.size;
  addRing(gr.cx, gr.cy, R, rgb, live ? 8 * size * lvl : 0, 'blast', { stun: live ? stun : 0, dur: 0.5, alpha: live ? 1 : 0.3 });
  if (live) { addRing(gr.cx, gr.cy, R * 0.7, rgb, 0, 'fx', { dur: 0.6 }); shake(2.5); burst(gr.cx, gr.cy, rgb, 16, 160); }
  ESAudio.blast(gr.note, when, size, !live);
}
function auroraStrike(when) {
  const g = gIndex(), dmg = (18 + 4 * g) * Math.min(2, 1 + 0.5 * (G.grand.length - 1));
  G.aurora = 1; ESAudio.aurora(when, barDur());
  let n = 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const src = G.grand[n % G.grand.length]; n++;
    if (n < 40) G.beams.push({ x1: src.x, y1: src.y - 20, x2: e.x, y2: e.y, rgb: NOTES[n % 5].rgb, t: 0, seed: Math.random() * 10, w: 2 });
    hurt(e, dmg, 'aurora'); stunE(e, 0.4);
  }
}
function updateSilence() {
  const hush = G.enemies.filter(e => !e.dead && e.def.silence), rad = has('velvet') ? 0.5 : 1;
  for (const r of G.res) {
    let s = r.silenceT > 0; if (r.silenceT > 0) r.silenceT--;
    if (!s) for (const h of hush) if (dist2(r.x, r.y, h.x, h.y) < (h.def.silence * rad) ** 2) { s = true; break; }
    r.silenced = s;
  }
}

// ---------------------------------------------------------------- shadow creatures
function spawnEnemy(type, pi, o) {
  o = o || {};
  if (G.enemies.length > 160 && !ENEMIES[type].boss) return null;
  const def = ENEMIES[type], p = G.map.paths[pi], g = gIndex(), hp = def.hp * hpScale(g) * (o.hpMul || 1);
  const e = {
    id: EN_ID++, type, def, hp, max: hp, path: pi, d: o.d || 0, x: p.pts[0].x, y: p.pts[0].y, ang: 0,
    spd: def.spd * (1 + Math.min(0.25, 0.012 * g)) * (1 + 0.03 * G.asc), slow: 0, stun: 0, hitT: 0, block: null, dead: false,
    hint: { i: 0 }, ph: Math.random() * 6.283, rem: p.len, born: G.t, fly: !!def.fly, hex: false, r: def.r, pushT: 0,
  };
  if (e.fly) { e.fx0 = p.start.x; e.fy0 = p.start.y; e.flen = Math.hypot(p.start.x, p.start.y) - SPIRE_R; e.f = 0; e.rem = e.flen; }
  pathAt(p, e.d, e, e.hint);
  if (e.fly) { e.x = e.fx0; e.y = e.fy0; }
  G.enemies.push(e);
  if (def.boss) { G.boss = e; ui('bossBar', e); ESAudio.sfx('boss'); shake(7); ui('banner', ui('bossName', type), ui('bossLine', type)); }
  if (!o.d && !G.profile.seen.includes(type)) { G.profile.seen.push(type); saveProfile(); ui('newEnemy', type); }
  burst(e.x, e.y, '150,90,255', 6, 70);
  return e;
}
function hurt(e, dmg, kind) {
  if (e.dead || dmg <= 0) return;
  let m = 1;
  if (e.hex) m *= 1.35;
  if (e.def.armor && kind !== 'harp' && kind !== 'aurora') m *= 1 - e.def.armor;
  if (e.def.shell) m *= e.stun > 0 ? 1.4 : e.def.shell;
  const dealt = Math.min(e.hp, dmg * m); G.dmgBy[kind] = (G.dmgBy[kind] || 0) + dealt;
  e.hp -= dmg * m; e.hitT = 0.12;
  if (e.def.boss && kind === 'blast') floatText(e.x, e.y - e.r - 10, Math.round(dmg * m), '#fff', 12);
  if (e.hp <= 0) kill(e);
}
// stuns have diminishing returns: a creature that was just stunned shrugs off most of the next one
function stunE(e, s) {
  let v = s * (e.def.boss ? 0.4 : 1) * (e.stunCd > 0 ? 0.3 : 1);
  if (v > e.stun) { G.stunT = (G.stunT || 0) + v - Math.max(0, e.stun); e.stun = v; e.stunCd = v + 1.6; }
}
function pushE(e, amt) { if (e.fly) return; amt *= e.def.boss ? 0.2 : 1; e.d = Math.max(0, e.d - amt); e.block = null; e.pushT = 0.25; }
function kill(e) {
  e.dead = true;
  const gold = Math.round(e.def.gold * (has('magnet') ? 1.3 : 1));
  G.shards += gold; G.kills++; G.score += gold * 2;
  smoke(e.x, e.y, e.def.boss ? 30 : 6, e.r * 0.7);
  burst(e.x, e.y, '170,120,255', e.def.boss ? 60 : 9, e.def.boss ? 260 : 110);
  for (let i = 0; i < (e.def.boss ? 14 : 2); i++) G.parts.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 60, life: 0, max: 0.9, rgb: '127,245,255', s: 3, k: 'shard' });
  ESAudio.sfx('death'); G.sparkles++;
  if (e.def.split) for (let k = 0; k < e.def.split; k++) { const c = spawnEnemy('skitter', e.path, { d: Math.max(1, e.d + (k - 1) * 9), hpMul: 1 }); if (c) c.stun = 0.25; }
  if (e.def.boss) {
    shake(14); G.flash = 0.6; G.flashCol = '255,255,255'; G.boss = null; ui('bossBar', null);
    floatText(e.x, e.y - 40, '+' + gold + ' ◆', '#7ff5ff', 18); ui('banner', t('es_bossDown'), '');
  }
}
function reachSpire(e) {
  e.dead = true; e.leaked = true;
  G.hp = Math.max(0, G.hp - e.def.dmg); G.leaks++;
  shake(e.def.boss ? 12 : 5); G.flash = Math.max(G.flash, 0.55); G.flashCol = '255,60,110';
  ESAudio.sfx('hit'); burst(0, -40, '255,90,140', 16, 140);
  floatText(0, -150, '-' + e.def.dmg, '#ff6f91', 18);
  if (has('coda') && G.codaCd <= 0) { addRing(0, 0, 210, '255,255,255', 0, 'blast', { stun: 1.5, dur: 0.5 }); G.codaCd = 4; }
  if (e === G.boss) { G.boss = null; ui('bossBar', null); }
  if (G.hp <= 0 && G.phase === 'wave') lose();
}
function mournerHeal(m) {
  addRing(m.x, m.y, 95, '90,255,160', 0, 'fx', { dur: 0.5, alpha: 0.6 });
  for (const e of G.enemies) if (!e.dead && e !== m && !e.def.boss && dist2(e.x, e.y, m.x, m.y) < 95 * 95) e.hp = Math.min(e.max, e.hp + e.max * m.def.heal);
}
function bossBar(bar) {
  const b = G.boss; if (!b || b.dead) return;
  if (b.type === 'maw' && bar % 2 === 0) { for (let k = 0; k < 2; k++) spawnEnemy('wisp', b.path, { d: Math.max(1, b.d + (k ? 12 : -12)), hpMul: 0.8 }); burst(b.x, b.y, '150,90,255', 12, 120); }
  else if (b.type === 'discord' && bar % 2 === 0) {
    addRing(b.x, b.y, 170, '255,80,120', 0, 'discord', { dur: 0.7 }); ESAudio.sfx('dissonance'); shake(4);
    for (const r of G.res) if (dist2(r.x, r.y, b.x, b.y) < 170 * 170) r.silenceT = has('velvet') ? 8 : 16;
    for (const B of G.barriers) if (dist2(B.cx, B.cy, b.x, b.y) < 190 * 190 && B.down <= 0) { B.hp -= B.max * 0.5; B.flash = 1; if (B.hp <= 0) breakBarrier(B); }
  } else if (b.type === 'leviathan' && bar % 2 === 1) { for (let k = 0; k < 3; k++) spawnEnemy('skitter', b.path, { d: Math.max(1, b.d - 30 - k * 10) }); }
}
function breakBarrier(B) {
  B.hp = 0; B.down = 32; B.flash = 1;
  for (const p of B.pts) burst(p.x, p.y - 10, NOTES[B.note].rgb, 3, 120);
  ESAudio.sfx('shatter'); shake(3);
  for (const e of G.enemies) if (e.block === B) e.block = null;
}

function updateEnemies(dt) {
  const hums = G.res.filter(r => r.role === 'hum' && !r.silenced && r.retune <= 0).map(r => ({ x: r.x, y: r.y, rr: rangeOf(r), s: ROLES.hum.slow[r.lvl - 1] + (has('frost') ? 0.15 : 0) }));
  const areas = G.chords.filter(c => c.type !== 'radiant' && c.mem.some(m => !m.silenced));
  for (const e of G.enemies) {
    if (e.dead) continue;
    let slow = 0, hex = false;
    for (const h of hums) if (dist2(e.x, e.y, h.x, h.y) <= (h.rr + e.r) ** 2) slow = Math.max(slow, h.s);
    for (const c of areas) if (dist2(e.x, e.y, c.cx, c.cy) <= c.r * c.r) { if (c.type === 'sus') slow = 1 - (1 - slow) * 0.7; else hex = true; }
    if (e.def.boss) slow *= 0.5;
    e.slow = Math.min(0.75, slow); e.hex = hex;
    e.hitT = Math.max(0, e.hitT - dt); e.pushT = Math.max(0, e.pushT - dt); if (e.stunCd > 0) e.stunCd -= dt;
    if (e.stun > 0) { e.stun -= dt; continue; }
    const sp = e.spd * (1 - e.slow);
    if (e.fly) {
      e.f += (sp * dt) / e.flen;
      const ux = -e.fx0 / (e.flen + SPIRE_R), uy = -e.fy0 / (e.flen + SPIRE_R), w = Math.sin(e.f * Math.PI * 4 + e.ph) * 26 * (1 - e.f);
      const px = e.fx0 + ux * e.f * e.flen - uy * w, py = e.fy0 + uy * e.f * e.flen + ux * w;
      e.ang = Math.atan2(py - e.y, px - e.x); e.x = px; e.y = py; e.rem = (1 - e.f) * e.flen;
      if (e.f >= 1) reachSpire(e);
      continue;
    }
    const p = G.map.paths[e.path];
    if (e.block) {
      if (barrierOn(e.block) && e.block.hp > 0) { e.block.hp -= e.def.bdps * dt; e.block.hitT = G.t; if (e.block.hp <= 0) breakBarrier(e.block); e.ang += 0; continue; }
      e.block = null;
    }
    let nd = e.d + sp * dt, stopAt = null, stopB = null;
    for (const B of G.barriers) {
      if (!barrierOn(B)) continue;
      for (const c of B.cross) {
        if (c.p !== e.path) continue;
        if (e.d + e.r < c.s + 0.01 && nd + e.r >= c.s) {
          if (e.def.boss) { breakBarrier(B); break; }
          if (stopAt == null || c.s < stopAt) { stopAt = c.s; stopB = B; }
        }
      }
    }
    if (stopB) { nd = stopAt - e.r; e.block = stopB; stopB.flash = Math.max(stopB.flash, 0.6); }
    e.d = Math.max(e.d, nd);
    pathAt(p, e.d, e, e.hint);
    e.rem = p.len - e.d;
    if (e.d >= p.len - 1) reachSpire(e);
  }
  G.enemies = G.enemies.filter(e => !e.dead);
}

// ---------------------------------------------------------------- frame update
function update(dt) {
  G.t += dt;
  for (let i = G.later.length - 1; i >= 0; i--) if (G.t >= G.later[i].t) { const f = G.later[i].fn; G.later.splice(i, 1); f(); }
  G.stepAcc += dt;
  const sd = 60 / G.bpm / 4;
  let guard = 0;
  while (G.stepAcc >= sd && guard++ < 8) { G.stepAcc -= sd; onStep(G.stepAcc); }
  if (guard >= 8) G.stepAcc = 0;
  if (G.enemies.length) updateEnemies(dt);
  for (const g of G.rings) {
    g.t += dt; const k = Math.min(1, g.t / g.dur); g.r = g.max * (1 - (1 - k) * (1 - k));
    if ((g.dmg > 0 || g.stun > 0 || g.push > 0) && k < 1) {
      for (const e of G.enemies) {
        if (e.dead || g.hit.has(e.id)) continue;
        if (dist2(e.x, e.y, g.x, g.y) <= (g.r + e.r) * (g.r + e.r)) {
          g.hit.add(e.id);
          if (g.dmg > 0) hurt(e, g.dmg, g.kind);
          if (g.stun > 0 && !e.dead) { stunE(e, g.stun); }
          if (g.push > 0 && !e.dead) pushE(e, g.push);
        }
      }
    }
  }
  G.rings = G.rings.filter(g => g.t < g.dur + 0.35);
  for (const b of G.beams) b.t += dt;
  G.beams = G.beams.filter(b => b.t < 0.22);
  for (const p of G.parts) {
    p.life += dt;
    if (p.k === 'home') { const k = clamp((p.life - (p.d || 0)) / p.max, 0, 1); if (p.sx == null) { p.sx = p.x; p.sy = p.y; } const e = k * k * (3 - 2 * k); p.x = lerp(p.sx, p.tx, e) + Math.sin(k * 9 + p.max * 20) * 12 * (1 - k); p.y = lerp(p.sy, p.ty, e) - Math.sin(k * Math.PI) * 50; continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.k === 'smoke') { p.vx *= 0.94; p.vy *= 0.94; } else if (p.k === 'shard') { p.vy += 140 * dt; } else if (p.k === 'note') { p.vx *= 0.98; } else { p.vx *= 0.92; p.vy = p.vy * 0.92 + 10 * dt; }
  }
  G.parts = G.parts.filter(p => p.life < p.max + (p.d || 0));
  if (G.parts.length > 450) G.parts.splice(0, G.parts.length - 450);
  for (const x of G.texts) { x.t += dt; x.y -= 22 * dt; }
  G.texts = G.texts.filter(x => x.t < 1.1);
  for (const B of G.barriers) {
    B.flash = Math.max(0, B.flash - dt * 2.5);
    if (B.down <= 0 && G.t - B.hitT > 1.2 && B.hp < B.max) B.hp = Math.min(B.max, B.hp + B.max * (has('aegis') ? 0.12 : 0.07) * dt);
  }
  for (const r of G.res) { r.fireT = Math.max(0, r.fireT - dt * 4); r.muteT = Math.max(0, r.muteT - dt * 2); }
  G.beatT = Math.max(0, G.beatT - dt * 3); G.shake = Math.max(0, G.shake - dt * 18); G.flash = Math.max(0, G.flash - dt * 1.6);
  G.aurora = Math.max(0, G.aurora - dt * 0.9); G.heal = Math.max(0, G.heal - dt * 1.5);
  if (G.phase === 'wave' && G.spawnIdx >= G.spawnQ.length && G.enemies.length === 0) waveCleared();
}

// ---------------------------------------------------------------- waves & run flow
function buildWave() {
  const g = gIndex(), boss = isBossWave(), A = actDef(), nP = G.map.paths.length;
  const rng = makeRng(G.seed * 7 + g * 131 + G.asc);
  const pool = A.pool.filter(tp => FIRST_WAVE[tp] <= g || G.act === 4);
  const W = { wisp: 3, skitter: 2, brute: 1.2, splitter: 1, moth: 1.4, hush: 0.9, mourner: 0.8 };
  const newest = pool.filter(tp => FIRST_WAVE[tp] === g);
  let budget = (9 + g * 4.4) * [1, 1.15, 1.3, 1.35][Math.min(4, G.act) - 1] * (g > 18 ? Math.pow(1.06, g - 18) : 1) * (boss ? 0.55 : 1);
  const q = [];
  let tStep = 0, pi = rng.int(nP), first = true;
  while (budget > 0.5) {
    let type;
    if (first && newest.length) type = newest[0];
    else { let tot = 0; for (const tp of pool) tot += W[tp]; let x = rng.next() * tot; type = pool[0]; for (const tp of pool) { x -= W[tp]; if (x <= 0) { type = tp; break; } } }
    first = false;
    const def = ENEMIES[type];
    const gb = Math.min(budget, rng.range(4, 9) + g * 0.35);
    const count = Math.max(1, Math.round(gb / def.threat));
    const spread = rng.next() < 0.38;
    for (let k = 0; k < count; k++) q.push({ st: tStep + k * def.gap, type, path: spread ? (pi + k) % nP : pi });
    budget -= count * def.threat;
    tStep += Math.max(8, Math.round(count * def.gap * rng.range(0.45, 0.85)));
    tStep = Math.ceil(tStep / 2) * 2;
    pi = (pi + 1 + (nP > 2 ? rng.int(nP - 1) : 0)) % nP;
  }
  if (boss) q.push({ st: 24, type: G.act <= 3 ? A.boss : BOSSES[(Math.floor(G.wave / 5) - 1) % 3], path: rng.int(nP) });
  q.sort((a, b) => a.st - b.st);
  return q;
}
function wavePreview() {   // counts per path for the upcoming wave
  const q = buildWave(), per = G.map.paths.map(() => ({}));
  for (const s of q) per[s.path][s.type] = (per[s.path][s.type] || 0) + 1;
  return per;
}
function startWave() {
  if (G.phase !== 'build') return false;
  persist();
  G.phase = 'wave'; G.spawnQ = buildWave(); G.spawnIdx = 0;
  const s0 = G.step, s1 = Math.ceil(s0 / 16) * 16;
  G.waveStep = -(s1 - s0 + 1);
  for (const r of G.res) r.fresh = false;
  ESAudio.sfx('wave'); ESAudio.musicLevel(0.95);
  ui('banner', waveTitle(), isBossWave() ? t('es_bossWave') : '');
  ui('phase');
  return true;
}
function waveTitle() { return G.act <= 3 ? t('es_waveN', { n: G.wave, m: WAVES_PER_ACT }) : t('es_endlessN', { n: G.wave }); }
function waveCleared() {
  const g = gIndex(), boss = isBossWave();
  let bonus = 20 + 4 * g, interest = 0;
  if (has('savings')) { interest = Math.min(40, Math.floor(G.shards * 0.15)); bonus += interest; }
  G.shards += bonus; G.score += 50 * g + (boss ? 500 : 0);
  G.phase = 'cleared'; G.boss = null; ui('bossBar', null);
  ESAudio.sfx('clear'); ESAudio.musicLevel(0.8);
  ui('banner', t('es_cleared'), '+' + bonus + ' ◆');
  ui('phase');
  if (G.act <= 3) G.profile.best = bestOf(G.profile.best, runSummary());
  G.later.push({ t: G.t + 1.6, fn: () => {
    if (G.phase !== 'cleared') return;
    if (boss && G.act === 3) victory();
    else openDraft(boss);
  } });
}
function openDraft(relicOnly) {
  G.phase = 'draft'; G.nextAct = relicOnly && G.act < 3; G.draft = rollBoons(relicOnly);
  ui('phase'); ui('draft');
}
function rollBoons(relicOnly) {
  const rng = G.rng, out = [];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rng.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const freeRelics = shuffle(RELICS.filter(r => !G.relicSet.has(r.id)).map(r => r.id));
  if (relicOnly) {
    freeRelics.slice(0, 3).forEach(id => out.push({ kind: 'relic', id }));
    while (out.length < 3) out.push(out.length === 1 ? { kind: 'repair', n: 6 } : { kind: 'shards', n: 120 });
    return out;
  }
  const locked = ROLE_ORDER.filter(r => !G.unlocked.includes(r));
  const c = [];
  if (locked.length) c.push({ kind: 'unlock', role: locked[rng.int(Math.min(2, locked.length))], w: G.draftsTaken < 2 ? 1000 : 2.4 });
  freeRelics.slice(0, 2).forEach(id => c.push({ kind: 'relic', id, w: 1.1 }));
  c.push({ kind: 'shards', n: 40 + 20 * mapAct() + 3 * gIndex(), w: 1 });
  if (G.hp < G.maxHp) c.push({ kind: 'repair', n: 5, w: G.hp < G.maxHp * 0.6 ? 2.5 : 0.8 });
  shuffle(G.unlocked.slice()).slice(0, 2).forEach(role => c.push({ kind: 'attune', role, w: 0.9 }));
  while (out.length < 3 && c.length) {
    let tot = 0; for (const x of c) tot += x.w; let r = rng.next() * tot, k = 0;
    for (; k < c.length - 1; k++) { r -= c[k].w; if (r <= 0) break; }
    out.push(c.splice(k, 1)[0]);
  }
  return out;
}
function pickBoon(i) {
  if (G.phase !== 'draft' || !G.draft || !G.draft[i]) return false;
  const b = G.draft[i];
  if (b.kind === 'unlock' && !G.unlocked.includes(b.role)) { G.unlocked.push(b.role); ui('toast', t('es_unlocked', { p: t('es_r_' + b.role) })); }
  else if (b.kind === 'relic') {
    G.relics.push(b.id); G.relicSet.add(b.id);
    if (b.id === 'heart') { G.maxHp += 6; G.hp += 6; }
    if (b.id === 'metronome') { G.bpm = curBpm(); ESAudio.setTempo(G.bpm); }
  } else if (b.kind === 'shards') G.shards += b.n;
  else if (b.kind === 'repair') { G.hp = Math.min(G.maxHp, G.hp + b.n); ESAudio.sfx('repair'); }
  else if (b.kind === 'attune') G.attune[b.role]++;
  G.draftsTaken++; G.draft = null; ESAudio.sfx('pick');
  if (G.nextAct) { G.nextAct = false; advanceAct(); }
  else { G.wave++; G.phase = 'build'; rebuild(); ui('phase'); persist(); }
  return true;
}
function advanceAct() {
  const refund = G.res.reduce((s, r) => s + r.invested, 0);
  G.shards += refund; G.act++; G.wave = 1; G.hp = Math.min(G.maxHp, G.hp + 5);
  G.res = []; G.barriers = []; G.groups = []; G.chords = []; G.links = []; G.enemies = [];
  loadMap();
  G.phase = 'build'; ui('phase'); ui('act');
  if (refund) ui('toast', t('es_refund', { n: refund }));
  persist();
}
function victory() {
  G.phase = 'won';
  const P = G.profile; P.wins++; P.ascMax = Math.max(P.ascMax, Math.min(10, G.asc + 1));
  P.best = bestOf(P.best, Object.assign(runSummary(), { won: true })); saveProfile();
  ESAudio.sfx('victory'); G.flash = 0.8; G.flashCol = '255,240,200';
  for (let i = 0; i < 80; i++) burst(0, -60, NOTES[i % 5].rgb, 1, 260);
  lsDel(KEY_RUN);
  G.later.push({ t: G.t + 1.2, fn: () => ui('victory') });
  ui('phase');
}
function goEndless() {
  if (G.phase !== 'won') return;
  G.act = 4; G.wave = 1; G.endless = true; G.bpm = curBpm(); ESAudio.setTempo(G.bpm);
  G.phase = 'build'; rebuild(); ui('phase'); ui('act'); persist();
}
function lose() {
  G.phase = 'over';
  const P = G.profile; P.best = bestOf(P.best, runSummary()); P.kills += G.kills; saveProfile();
  lsDel(KEY_RUN);
  ESAudio.sfx('defeat'); ESAudio.musicLevel(0.5);
  for (let i = 0; i < 70; i++) G.parts.push({ x: (Math.random() - 0.5) * 30, y: -Math.random() * 110, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 200, life: 0, max: 1.4 + Math.random(), rgb: '210,220,255', s: 3 + Math.random() * 3, k: 'shard' });
  shake(16); G.flash = 0.9; G.flashCol = '255,60,110'; G.spireBroken = true;
  for (const e of G.enemies) { smoke(e.x, e.y, 4, e.r * 0.7); e.dead = true; }       // the shadows take the spire and fade away
  G.enemies = []; G.spawnIdx = G.spawnQ.length; G.boss = null; ui('bossBar', null);
  G.later.push({ t: G.t + 1.8, fn: () => ui('gameover') });
  ui('phase');
}
function runSummary() { return { score: G.score, g: gIndex(), act: G.act, wave: G.wave, asc: G.asc, endless: G.act === 4 ? G.wave : 0, won: false, date: Date.now() }; }
function bestOf(a, b) { if (!a) return b; return b.score > a.score || (b.score === a.score && b.g >= a.g) ? Object.assign({}, b, { won: b.won || a.won }) : Object.assign({}, a, { won: a.won || b.won }); }

function pickOrient() {
  const w = innerWidth, h = innerHeight - (innerWidth < 761 ? 180 : 150), a = w / Math.max(1, h);
  return a < 0.82 ? 'p' : a > 1.25 ? 'l' : 's';
}
function loadMap() {
  G.map = genMap(G.seed, mapAct(), G.orient);
  G.bpm = curBpm(); ESAudio.setTempo(G.bpm);
  G.staticDirty = true; rebuild();
}
function resetWorld() {
  G.res = []; G.enemies = []; G.rings = []; G.beams = []; G.parts = []; G.texts = []; G.barriers = []; G.groups = []; G.chords = []; G.links = []; G.grand = [];
  G.later = []; G.boss = null; G.spireBroken = false; G.flash = 0; G.shake = 0; G.aurora = 0;
}
function newRun(o) {
  o = o || {};
  const seed = o.seed != null ? o.seed >>> 0 : (Math.random() * 4294967295) >>> 0;
  resetWorld();
  Object.assign(G, {
    seed, rng: makeRng(seed ^ 0x5bd1e995), act: 1, wave: 1, hp: START_HP, maxHp: START_HP, shards: START_SHARDS, score: 0, kills: 0,
    relics: [], relicSet: new Set(), unlocked: ['bell', 'harp'], attune: { bell: 0, harp: 0, hum: 0, ward: 0, echo: 0 },
    asc: o.asc || 0, orient: o.orient || pickOrient(), draftsTaken: 0, spawnQ: [], spawnIdx: 0, phase: 'build', paused: false,
    draft: null, nextAct: false, endless: false, leaks: 0, codaCd: 0,
  });
  G.profile.runs++; saveProfile();
  loadMap(); ui('phase'); ui('act'); persist();
}
function persist() {
  if (G.phase !== 'build') return;
  lsSet(KEY_RUN, {
    v: 1, seed: G.seed, rs: G.rng.s, act: G.act, wave: G.wave, hp: G.hp, maxHp: G.maxHp, shards: G.shards, score: G.score, kills: G.kills,
    relics: G.relics, unlocked: G.unlocked, attune: G.attune, asc: G.asc, orient: G.orient, drafts: G.draftsTaken, endless: G.endless,
    res: G.res.map(r => [r.role, r.note, r.lvl, r.sock, r.invested]),
  });
}
function savedRun() { const s = lsGet(KEY_RUN, null); return s && s.v === 1 && s.seed != null ? s : null; }
function continueRun() {
  const s = savedRun(); if (!s) return false;
  resetWorld();
  Object.assign(G, {
    seed: s.seed, rng: makeRng(0), act: s.act, wave: s.wave, hp: s.hp, maxHp: s.maxHp, shards: s.shards, score: s.score, kills: s.kills,
    relics: s.relics.slice(), relicSet: new Set(s.relics), unlocked: s.unlocked.slice(), attune: Object.assign({ bell: 0, harp: 0, hum: 0, ward: 0, echo: 0 }, s.attune),
    asc: s.asc || 0, orient: s.orient || 'p', draftsTaken: s.drafts || 0, endless: !!s.endless, phase: 'build', paused: false, draft: null, nextAct: false, spawnQ: [], spawnIdx: 0,
  });
  G.rng.s = s.rs >>> 0;
  G.map = genMap(G.seed, mapAct(), G.orient); G.bpm = curBpm(); ESAudio.setTempo(G.bpm); G.staticDirty = true;
  for (const [role, note, lvl, sock, inv] of s.res) { const r = placeRes(role, note, sock, { free: true, lvl, invested: inv, quiet: true }); if (r) r.fresh = false; }
  rebuild(); ui('phase'); ui('act');
  return true;
}
// the title screen: a quiet demo island where a few resonators play a little tune
function menuScene() {
  resetWorld();
  G.phase = 'menu'; G.act = 1; G.wave = 1; G.relicSet = new Set(); G.relics = []; G.attune = { bell: 0, harp: 0, hum: 0, ward: 0, echo: 0 }; G.asc = 0;
  G.seed = 20261030; G.orient = pickOrient();
  G.map = genMap(G.seed, 2, G.orient); G.bpm = 88; ESAudio.setTempo(88); G.staticDirty = true;
  const socks = G.map.sockets.slice().sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  const plan = [['bell', 0], ['harp', 3], ['bell', 2], ['echo', 4], ['harp', 1], ['bell', 3], ['hum', 0], ['harp', 2], ['ward', 4]];
  let k = 0;
  for (const s of socks) {
    if (k >= plan.length) break;
    if (G.res.some(r => dist2(r.x, r.y, s.x, s.y) < 95 * 95)) continue;
    const r = placeRes(plan[k][0], plan[k][1], s.i, { free: true, quiet: true }); if (r && plan[k][0] === 'harp') r.lvl = 2; k++;
  }
  rebuild(); ui('phase');
}
