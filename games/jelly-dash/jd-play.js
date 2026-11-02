// Jelly Dash — the show: rounds, input, cameras, split-screen, menus, HUD and the main loop
'use strict';

const G = { type: '', screen: 'menu', paused: false, clock: 0, ents: [], byId: new Map(), views: [], round: null, uiPh: '', uiSerial: -1, touch: false,
  fps: 60, ftAvg: 16, prT: 0, testInp: null, statDone: {}, endDone: '', duoNames: ['', ''], p2c: 5, lastT: 0, spIdx: 0, menuOn: true, cdLast: 99 };
let S = null;   // the show (the host's copy is the truth; everyone else mirrors it)
const INTRO = 7.2, RES = 7.5, MAXH = 8;
const now = () => G.type === 'online' ? NET.now() : G.clock;
const amHost = () => G.type !== 'online' || NET.isHost();
const ZERO = { x: 0, z: 0, jump: false, dive: false, grab: false };
const isFinal = (k) => k === 'frace' || k === 'fsurv';
const fieldOf = (id) => S && S.field.find(f => f.id === id);
const nameOf = (f) => !f ? '?' : (typeof f.n === 'string' && f.n[0] === '~') ? t('jd_b' + (+f.n.slice(1) % 14)) : String(f.n || '?');
const mineIds = () => G.type === 'duo' ? ['p1', 'p2'] : G.type === 'online' ? [NET.me] : ['p1'];
const isMine = (id) => mineIds().includes(id);
function myName() { let n = ''; try { n = (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) {} return String(n || store.get('name', '') || t('jd_you')).slice(0, 16); }
function shuffle(a, r) { r = r || Math.random; for (let i = a.length - 1; i > 0; i--) { const k = (r() * (i + 1)) | 0; [a[i], a[k]] = [a[k], a[i]]; } return a; }
const setText = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
let toastT = 0;
function toast(msg, sec) { const el = $('toast'); el.textContent = msg; el.hidden = false; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { el.style.opacity = 0; setTimeout(() => { el.hidden = true; }, 300); }, (sec || 2.4) * 1000); }

// ------------------------------------------------------------------ show plan
function makePlan(n, len, r) {
  const F = n <= 4 ? 2 : n <= 7 ? 3 : 4, R1 = Math.max(0, Math.min(len - 1, n - F));
  const counts = [n]; for (let i = 1; i <= R1; i++) counts.push(Math.round(n * Math.pow(F / n, i / R1)));
  for (let i = 1; i <= R1; i++) counts[i] = Math.min(counts[i - 1] - 1, Math.max(counts[i], F + (R1 - i)));
  const fin = r() < 0.5 ? 'crown' : 'tilefin';
  if (!R1) return { plan: [fin], quota: [1] };
  const first = r() < 0.5 ? 'gaunt' : 'hexhop', other = first === 'gaunt' ? 'hexhop' : 'gaunt';
  let mid = shuffle(['slime', 'sweep', 'tail', 'tiles', other], r).slice(0, R1 - 1);
  for (let i = 1; i < mid.length; i++) if (ROUND[mid[i]].kind === 'surv' && ROUND[mid[i - 1]].kind === 'surv') { const k = mid.findIndex((x, q) => q > i && ROUND[x].kind !== 'surv'); if (k > 0) [mid[i], mid[k]] = [mid[k], mid[i]]; }
  return { plan: [first, ...mid, fin], quota: counts.slice(1).concat([1]) };
}
// humans first (their colour if free), bots fill the rest of the field
function buildField(humans, total, diff, r) {
  const used = new Set(), field = [];
  for (const h of humans) { let c = (h.c | 0) % 12; while (used.has(c) && used.size < 12) c = (c + 1) % 12; used.add(c); field.push({ id: h.id, n: h.n, c, k: h.k | 0, b: 0, sd: 0, out: -1 }); }
  const free = shuffle(COLORS.map((_, i) => i).filter(i => !used.has(i)), r), names = shuffle([...Array(14).keys()], r);
  for (let i = 0; field.length < total; i++) field.push({ id: 'b' + i + '_' + ((r() * 1e6) | 0).toString(36), n: '~' + names[i % 14], c: free[i % free.length] | 0, k: (r() * COSTUMES.length) | 0, b: 1, sd: 0, out: -1, lv: diff });
  return field;
}
function newShow(type, humans, cfg) {
  const r = mulberry((Math.random() * 1e9) | 0);
  const field = buildField(humans, Math.max(humans.length, cfg.field), cfg.diff, r);
  let p;
  if (cfg.prac) { const k = ROUND[cfg.prac].kind, n = field.length; p = { plan: [cfg.prac], quota: [isFinal(k) ? 1 : k === 'tail' ? Math.floor(n / 2) : k === 'surv' ? Math.ceil(n / 2) : Math.ceil(n * 0.6)] }; }
  else p = makePlan(field.length, cfg.len, r);
  return { sid: uid(), type, cfg, field, plan: p.plan, quota: p.quota, prac: cfg.prac || '', ri: -1, serial: (S && S.serial || 0) + 1, ph: 'pre', t0: 0, tEnd: 0, ord: [], q: [], o: [], tails: [], imm: {}, win: '', seed: 1, qn: 1 };
}

// ------------------------------------------------------------------ host side (solo, same-device, or the online host)
function hostStartRound(idx) {
  const alive = S.field.filter(f => f.out < 0).map(f => f.id);
  if (alive.length <= 2 && idx < S.plan.length - 1) idx = S.plan.length - 1;
  const def = ROUND[S.plan[idx]];
  S.ri = idx; S.serial++; S.seed = (Math.random() * 1e9) | 0;
  S.ord = shuffle(alive.slice(), mulberry(S.seed));
  S.qn = isFinal(def.kind) ? 1 : clamp(S.quota[idx] | 0, 1, Math.max(1, alive.length - 1));
  S.q = []; S.o = []; S.imm = {}; S.win = ''; S.tEnd = 0;
  S.tails = def.kind === 'tail' ? shuffle(S.ord.slice(), mulberry(S.seed + 7)).slice(0, S.qn) : [];
  S.t0 = now() + INTRO; S.ph = 'play';
  showChanged(true);
}
function hostEv(e) {
  if (!S || S.ph !== 'play' || (e.r != null && e.r !== S.serial)) return;
  const def = ROUND[S.plan[S.ri]], id = e.id; if (!S.ord.includes(id) || now() - S.t0 < -0.3) return;
  if (e.k === 'fin') { if (S.q.includes(id) || S.o.includes(id) || (def.kind !== 'race' && def.kind !== 'frace')) return; S.q.push(id); }
  else if (e.k === 'out') { if (S.q.includes(id) || S.o.includes(id)) return; S.o.push(id); }
  else if (e.k === 'grab') {
    const to = e.to; if (def.kind !== 'tail' || !S.tails.includes(to) || S.tails.includes(id) || (S.imm[to] || 0) > now()) return;
    S.tails[S.tails.indexOf(to)] = id; S.imm[id] = now() + 1.4;
  } else return;
  showChanged();
}
function hostTick() {
  if (!S || !amHost()) return;
  const t = now();
  if (S.ph === 'play') {
    const T = t - S.t0; if (T < 0) return;
    const def = ROUND[S.plan[S.ri]], left = S.ord.filter(id => !S.o.includes(id)), running = left.filter(id => !S.q.includes(id));
    let end = T > def.time;
    if (def.kind === 'race') end = end || S.q.length >= S.qn || !running.length;
    else if (def.kind === 'frace') end = end || S.q.length >= 1 || !running.length;
    else if (def.kind === 'surv') end = end || left.length <= S.qn;
    else if (def.kind === 'fsurv') end = end || left.length <= 1;
    if (end) hostEndRound();
  } else if (S.ph === 'res' && t - S.tEnd > RES) {
    const alive = S.field.filter(f => f.out < 0);
    if (S.prac || S.win || alive.length <= 1 || S.ri >= S.plan.length - 1) { S.ph = 'end'; if (!S.win && alive.length === 1) S.win = alive[0].id; showChanged(); }
    else hostStartRound(S.ri + 1);
  }
}
function hostEndRound() {
  const def = ROUND[S.plan[S.ri]], left = S.ord.filter(id => !S.o.includes(id));
  let q;
  if (def.kind === 'race') q = S.q.slice(0, S.qn);
  else if (def.kind === 'surv') q = left;
  else if (def.kind === 'tail') q = S.tails.slice();
  else if (def.kind === 'frace') {
    q = S.q.slice(0, 1);
    if (!q.length) { let best = null, bz = -1e9; for (const id of left) { const j = G.byId.get(id); if (j && j.pos.z + j.pos.y > bz) { bz = j.pos.z + j.pos.y; best = id; } } if (best) q = [best]; }
  } else {
    q = left.slice(0, 1);
    if (left.length > 1) { let best = left[0], by = -1e9; for (const id of left) { const j = G.byId.get(id); if (j && j.pos.y > by) { by = j.pos.y; best = id; } } q = [best]; }
    if (!q.length && S.o.length) q = [S.o[S.o.length - 1]];
  }
  if (!q.length && S.ord.length && !isFinal(def.kind)) q = [S.ord[0]];
  S.q = q; S.ph = 'res'; S.tEnd = now();
  if (!S.prac) for (const f of S.field) if (S.ord.includes(f.id) && !q.includes(f.id)) f.out = S.ri;
  if (isFinal(def.kind) && !S.prac) S.win = q[0] || '';
  showChanged();
}
// the host changed the show: everyone (including itself) applies it
function showChanged(newRound) {
  if (G.type === 'online') NET.sendShow();
  if (newRound || !G.round || G.round.serial !== S.serial) beginRound(); else syncRound();
}
function applyShow(ns) {   // a client receives the host's show
  if (!ns || !Array.isArray(ns.field)) return;
  const fresh = !S || S.sid !== ns.sid || S.serial !== ns.serial || !G.round;
  S = ns;
  if (S.ph === 'pre') return;
  if (fresh && (S.ph === 'play' || S.ph === 'res')) beginRound();
  else if (G.round) syncRound();
  if (S.ph === 'end' && !G.round) { G.round = { serial: S.serial, def: ROUND[S.plan[S.ri]] || JD_ROUNDS[0], fake: true }; }
}
function report(k, id, extra) {
  const e = Object.assign({ k, id, r: S && S.serial }, extra || {});
  if (amHost()) hostEv(e); else NET.ev(e);
}

// ------------------------------------------------------------------ building a round on this device
function teardownWorld() {
  for (const j of G.ents) freeJelly(j);
  G.ents = []; G.byId.clear();
  if (W.scene) { for (const g of W.geos) g.dispose(); for (const m of W.hexMs) { if (m.material) m.material.dispose(); } }
  Object.assign(W, { scene: null, sun: null, cols: [], dyn: [], hits: [], tiles: [], hexMs: [], cps: [], spawn: null, finish: null, path: [], killY: -14, view: 0, def: null,
    slime: null, slimeM: null, crown: null, T: 0, ai: 'path', arena: null, geos: [], anim: [], auto: null, fallDelay: 0.7, slimeY: -99, regrow: 0 });
  PART.clear();
}
function buildWorld(def, seed) {
  teardownWorld();
  const scene = new THREE.Scene(); W.scene = scene; W.def = def; W.time = def.time;
  const B = makeBuilder(scene, seed); def.build(B);
  if (W.auto) W.tiles.forEach((tl, i) => { tl.auto = W.auto.start + hash01(i * 31 + (seed | 0)) * W.auto.span; });
  W.sun = dressScene(scene, seed, { x: 0, z: (def.kind === 'race' || def.kind === 'frace') ? 80 : 0, span: (def.kind === 'race' || def.kind === 'frace') ? 180 : 40 });
  scene.add(PART.pts);
  updateDyn(-INTRO, 1 / 60, true);
}
function spawnAt(i, n, j) {
  const s = W.spawn; if (!s) { j.pos.set(0, 1, 0); return; }
  if (s.kind === 'grid') {
    const cols = Math.min(6, Math.max(3, Math.ceil(n / 2))), c = i % cols, r = (i / cols) | 0;
    setJellyPos(j, s.x + (c - (cols - 1) / 2) * 2.2, s.y + 0.05, s.z + s.d / 2 - 0.8 - r * 2.3, W.view);
  } else {
    const a = i / n * TAU + 0.3, r = i % 2 ? s.r1 : (s.r0 + s.r1) / 2, x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
    setJellyPos(j, x, s.y + 0.05, z, Math.atan2(s.x - x, s.z - z));
  }
}
function kindFor(f) {
  if (G.type === 'online') { if (f.id === NET.me && !f.sd) return 'p'; if ((f.b || f.sd) && amHost()) return 'bot'; return 'remote'; }
  return f.b ? 'bot' : 'p';
}
function addEnt(f, i, n) {
  const j = newJelly({ id: f.id, name: nameOf(f), col: f.c, cos: f.k, bot: !!f.b, fx: Math.random() * 6 });
  j.kind = kindFor(f);
  spawnAt(i, n, j);
  if (j.kind === 'bot') botInit(j, f.b ? (f.lv == null ? 1 : f.lv) : 1, mulberry(hashStr(f.id) + S.seed));
  W.scene.add(j.m.root);
  j.tag = tagSprite(j.name, j.color); W.scene.add(j.tag);
  const vi = mineIds().indexOf(f.id); j.tag.layers.set(vi >= 0 ? vi + 1 : 0);
  G.ents.push(j); G.byId.set(f.id, j);
  return j;
}
function beginRound() {
  const def = ROUND[S.plan[S.ri]]; if (!def) return;
  buildWorld(def, S.seed);
  S.ord.forEach((id, i) => { const f = fieldOf(id); if (f) addEnt(f, i, S.ord.length); });
  G.round = { serial: S.serial, def, t0: S.t0, cd: 99, go: 0, stamp: false, resShown: false, statDone: false };
  G.uiPh = ''; G.cdLast = 99; G.lastT = now() - S.t0;
  setupViews();
  syncRound();
  enterPlayUI();
  // stats: reaching a final
  if (!S.prac && isFinal(def.kind) && G.type !== 'online' || (G.type === 'online' && isFinal(def.kind) && S.ord.includes(NET.me))) {
    const k = 'f' + S.sid + S.serial; if (!G.statDone[k]) { G.statDone[k] = 1; for (const id of mineIds()) if (S.ord.includes(id)) STATS.finals++; saveStats(); }
  }
}
// mirror the host's lists onto the jellies
function syncRound() {
  if (!G.round || !S) return;
  for (const j of G.ents) {
    const f = fieldOf(j.id);
    if (f && G.type === 'online') {   // seats change hands (a player left, or came back)
      const want = kindFor(f);
      if (want !== j.kind) {
        if (want === 'bot') { botInit(j, f.b ? (f.lv == null ? 1 : f.lv) : 1); j.buf = []; j.dead = 0; }
        if (want === 'remote') { j.buf = []; }
        if (want === 'p') { j.buf = []; j.vel.set(0, 0, 0); j.st = 0; }
        j.kind = want;
      }
    }
    if (S.o.includes(j.id) && !j.out) markOut(j, true);
    if (S.q.includes(j.id) && !j.fin && (W.def.kind === 'race' || W.def.kind === 'frace')) markFin(j);
    const had = j.tail; j.tail = S.tails.includes(j.id);
    if (W.def.kind === 'tail' && had !== j.tail && j.visible) {
      PART.emit(j.pos.x, j.pos.y + 1, j.pos.z, 18, j.tail ? CONFETTI : [0xffffff, 0xaaaaaa], { spd: 5, life: 0.6, size: 0.25 });
      if (isMine(j.id)) Snd.play(j.tail ? 'steal' : 'bonk');
    }
  }
}
function markOut(j, fromHost) {
  if (j.out) return;
  j.out = true;
  if (j.visible) PART.emit(j.pos.x, j.pos.y + 0.8, j.pos.z, 24, [j.color, 0xffffff], { spd: 5, life: 0.7, size: 0.3 });
  j.visible = false;
  if (isMine(j.id)) { Snd.play('elim'); }
}
function markFin(j) {
  if (j.fin && j.finAt) return;
  j.fin = true; j.finAt = now();
  PART.emit(j.pos.x, j.pos.y + 1.2, j.pos.z, 40, CONFETTI, { spd: 7, life: 1.2, size: 0.28, square: true, up: 0.7 });
  if (isMine(j.id)) Snd.play('qual');
}

// ------------------------------------------------------------------ hooks from the physics
const slimeY = (T) => { const s = W.slime; if (!s) return -999; const k = Math.max(0, T - s.delay); return s.y0 + s.v * k + 0.5 * s.a * k * k; };
const nearCam = (j) => { let d = 1e9; for (const v of G.views) d = Math.min(d, v.cam.position.distanceTo(j.pos)); return d; };
HOOK.fall = (j) => {
  if (j.dead > 0 || j.out) return;
  const k = W.def.kind;
  if (isMine(j.id)) { Snd.play('fall'); STATS.falls++; }
  if (k === 'surv' || k === 'fsurv' || W.slime) { if (!j.sentOut) { j.sentOut = true; j.visible = false; report('out', j.id); } return; }
  j.dead = 0.85; j.visible = false;
};
HOOK.respawn = (j) => {
  let cp = W.cps[clamp(j.cp, 0, W.cps.length - 1)];
  if (!cp) cp = { x: 0, y: 0, z: 0, w: 4, d: 4 };
  const r = Math.random;
  if (cp.ring) { const a = r() * TAU, rr = lerp(cp.ring[0], cp.ring[1], r()); setJellyPos(j, cp.x + Math.cos(a) * rr, cp.y + 0.3, cp.z + Math.sin(a) * rr, Math.atan2(-Math.cos(a), -Math.sin(a))); }
  else setJellyPos(j, cp.x + (r() - 0.5) * cp.w * 0.8, cp.y + 0.3, cp.z + (r() - 0.5) * cp.d * 0.5, W.view);
  j.inv = 1.3; j.visible = true; j.dead = 0;
  if (j.aiS) botResetPath(j);
  if (W.slime && cp.y < W.slimeY + 0.6 && !j.sentOut) { j.sentOut = true; j.visible = false; report('out', j.id); return; }
  if (isMine(j.id)) { Snd.play('respawn'); const v = G.views.find(v => v.id === j.id); if (v) v.snap = true; }
  PART.emit(j.pos.x, j.pos.y + 0.6, j.pos.z, 14, [0xffffff, j.color], { spd: 3, life: 0.6, size: 0.3 });
};
HOOK.tile = (i, j) => {
  const tl = W.tiles[i]; if (!tl || tl.st !== 0) return;
  const dx = j.pos.x - tl.x, dz = j.pos.z - tl.z; if (dx * dx + dz * dz > 0.6) return;   // only the tile under the middle of the jelly
  tl.st = 1; tl.tt = W.T;
  if (G.type === 'online') NET.tile(i, W.T);
  if (nearCam(j) < 14) Snd.play('tile', 0.6);
};
HOOK.land = (j, v) => { PART.emit(j.pos.x, j.pos.y + 0.05, j.pos.z, Math.min(12, 3 + v | 0), [0xffffff, 0xffe8f4], { spd: 2.2, up: 0.2, life: 0.4, size: 0.32, grav: 2 }); if (isMine(j.id)) Snd.play('land'); };
HOOK.jump = (j) => { if (isMine(j.id)) Snd.play('jump'); PART.emit(j.pos.x, j.pos.y + 0.05, j.pos.z, 4, 0xffffff, { spd: 1.6, up: 0.1, life: 0.3, size: 0.28, grav: 1 }); };
HOOK.dive = (j) => { if (isMine(j.id)) Snd.play('dive'); };
HOOK.knock = (j, kind) => {
  const d = nearCam(j);
  if (kind === 'bonk') { PART.emit(j.pos.x, j.pos.y + 1.3, j.pos.z, 10, [0xffe14d, 0xffffff], { spd: 4, life: 0.5, size: 0.26, square: true }); if (d < 16) Snd.play('bonk', isMine(j.id) ? 1 : 0.5); if (isMine(j.id)) shake(j.id, 0.35); }
  else if (d < 16) Snd.play('boing', isMine(j.id) ? 1 : 0.5);
};
function localChecks(j) {
  if (j.out || j.dead > 0 || j.fin || S.ph !== 'play' || W.T < 0) return;
  for (let k = j.cp + 1; k < W.cps.length; k++) { const c = W.cps[k]; if (Math.abs(j.pos.x - c.x) < c.w / 2 + 1.5 && Math.abs(j.pos.z - c.z) < c.d / 2 + 0.6 && j.pos.y > c.y - 1.2) j.cp = k; }
  const F = W.finish;
  if (F && !j.sentFin && j.pos.x > F.x0 && j.pos.x < F.x1 && j.pos.y > F.y0 && j.pos.y < F.y1 && j.pos.z > F.z0 && j.pos.z < F.z1) { j.sentFin = true; j.finT = W.T; markFin(j); report('fin', j.id, { t: W.T }); }
  const C = W.crown;
  if (C && !j.sentFin) { const dx = j.pos.x - C.x, dy = j.pos.y + 1.0 - C.y, dz = j.pos.z - C.z; if (dx * dx + dy * dy + dz * dz < (j.grabbing ? 2.1 : 1.65) ** 2) { j.sentFin = true; j.finT = W.T; markFin(j); report('fin', j.id, { t: W.T }); } }
  if (W.slime && !j.sentOut && j.pos.y + 0.25 < W.slimeY) {
    j.sentOut = true; j.visible = false; PART.emit(j.pos.x, W.slimeY, j.pos.z, 30, [0x9ef03f, 0xf06ad8, 0xffffff], { spd: 6, life: 0.8, size: 0.35 });
    if (nearCam(j) < 20) Snd.play('splash'); report('out', j.id);
  }
}

// ------------------------------------------------------------------ the moving world
const TMPO = new THREE.Object3D(), TCOL = new THREE.Color(), WHITE = new THREE.Color(0xffffff);
function updateTiles(T, dt) {
  if (!W.tiles.length) return;
  const dirty = new Set();
  for (const tl of W.tiles) {
    if (tl.st === 0 && T >= tl.auto) { tl.st = 1; tl.tt = tl.auto; }
    if (tl.st === 1) {
      const k = clamp((T - tl.tt) / tl.fall, 0, 1);
      if (T - tl.tt >= tl.fall) { tl.st = 2; tl.c.on = false; tl.fy = 0; tl.fv = 0; }
      const s = 0.07 * k; TMPO.position.set(tl.x + Math.sin(T * 61 + tl.ii) * s, tl.y - 0.4 - k * 0.08, tl.z + Math.cos(T * 53 + tl.ii) * s); TMPO.rotation.set(0, 0, 0); TMPO.scale.setScalar(1); TMPO.updateMatrix();
      tl.im.setMatrixAt(tl.ii, TMPO.matrix); TCOL.copy(tl.col).lerp(WHITE, 0.25 + k * 0.5); tl.im.setColorAt(tl.ii, TCOL); dirty.add(tl.im);
    } else if (tl.st === 2) {
      tl.fv += 22 * dt; tl.fy += tl.fv * dt;
      const sc = Math.max(0.001, 1 - tl.fy / 14);
      TMPO.position.set(tl.x, tl.y - 0.4 - tl.fy, tl.z); TMPO.rotation.set(tl.fy * 0.08, 0, tl.fy * 0.05); TMPO.scale.setScalar(sc); TMPO.updateMatrix();
      tl.im.setMatrixAt(tl.ii, TMPO.matrix); dirty.add(tl.im);
      if (sc <= 0.001) tl.st = 3;
    } else if (tl.st === 3 && W.regrow && T >= tl.tt + tl.fall + W.regrow) {   // race tiles grow back
      tl.st = 0; tl.c.on = true; tl.back = T; TMPO.position.set(tl.x, tl.y - 0.4, tl.z); TMPO.rotation.set(0, 0, 0); TMPO.scale.setScalar(1); TMPO.updateMatrix();
      tl.im.setMatrixAt(tl.ii, TMPO.matrix); tl.im.setColorAt(tl.ii, tl.col); dirty.add(tl.im);
    }
  }
  for (const im of dirty) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
}
function applyTile(i, tt) {
  const tl = W.tiles[i]; if (!tl || !isFinite(tt) || (tl.back && tt < tl.back)) return;
  if (tl.st === 0) { tl.st = 1; tl.tt = tt; } else if (tl.st === 1 && tt < tl.tt) tl.tt = tt;
}
function updateWorldExtras(T, dt) {
  if (W.slime) { W.slimeY = slimeY(T); if (W.slimeM) { W.slimeM.position.y = W.slimeY; W.slimeM.material.uniforms.t.value = T; } if (Math.random() < dt * 6) { const x = (Math.random() - 0.5) * 30, z = (G.views[0] ? G.views[0].tz : 60) + (Math.random() - 0.3) * 40; PART.emit(x, W.slimeY + 0.1, z, 2, [0xb8ff5a, 0xff8ae6], { spd: 1.5, up: 0.9, life: 0.7, size: 0.4, grav: 3 }); } }
  if (W.crown) { const C = W.crown; C.fn(T, C); C.m.position.set(C.x, C.y, C.z); C.m.rotation.y = T * 1.6; if (Math.random() < dt * 8) PART.emit(C.x, C.y, C.z, 1, [0xfff3a0, 0xffffff], { spd: 1.2, life: 0.9, size: 0.25, grav: -1, spread: 1.6 }); }
  for (const f of W.anim) f(T);
}

// ------------------------------------------------------------------ remote jellies (interpolated)
function pushState(j, s) {   // s: { ts (s), x, y, z, vx, vy, vz, yaw, st, g, gr, d, iv }
  const b = j.buf; if (b.length && s.ts <= b[b.length - 1].ts) return;
  b.push(s); if (b.length > 30) b.splice(0, b.length - 30);
}
function remoteStep(j, dt) {
  const b = j.buf; if (!b.length || j.out) return;
  const gap = b.length > 1 ? b[b.length - 1].ts - b[b.length - 2].ts : 0.08;   // big rooms send less often → stay a little further behind
  const rt = now() - clamp(gap * 1.5, 0.12, 0.3); let a = b[0], c = null;
  for (let i = b.length - 1; i >= 0; i--) if (b[i].ts <= rt) { a = b[i]; c = b[i + 1] || null; break; }
  let x, y, z, yaw;
  if (c) { const k = clamp((rt - a.ts) / Math.max(0.001, c.ts - a.ts), 0, 1); x = lerp(a.x, c.x, k); y = lerp(a.y, c.y, k); z = lerp(a.z, c.z, k); yaw = a.yaw + angDiff(a.yaw, c.yaw) * k; }
  else { const e = clamp(rt - a.ts, 0, 0.25); x = a.x + a.vx * e; y = a.g ? a.y : a.y + a.vy * e - 13 * e * e; z = a.z + a.vz * e; yaw = a.yaw; }
  const was = j.grounded;
  if (Math.hypot(x - j.pos.x, z - j.pos.z) > 6) j.pos.set(x, y, z);
  else j.pos.set(lerp(j.pos.x, x, damp(25, dt)), lerp(j.pos.y, y, damp(25, dt)), lerp(j.pos.z, z, damp(25, dt)));
  j.vel.set(a.vx, a.vy, a.vz); j.yaw = yaw; j.st = a.st; j.grounded = a.g; j.grabbing = a.gr; j.inv = a.iv ? 0.3 : 0;
  if (!was && j.grounded) j.sqv -= 3;
  if (a.st === 2 && j.spinV === 0) j.spinV = 9; if (a.st !== 2) j.spinV = 0;
  if (!j.fin) j.visible = !a.d;
  while (b.length > 2 && b[1].ts < rt - 0.5) b.shift();
}

// ------------------------------------------------------------------ jellies bumping and grabbing each other
function jellyPush() {
  const E = G.ents;
  for (let i = 0; i < E.length; i++) {
    const a = E[i]; if (!a.visible || a.out) continue;
    for (let k = i + 1; k < E.length; k++) {
      const b = E[k]; if (!b.visible || b.out || (a.kind === 'remote' && b.kind === 'remote')) continue;
      const dy = b.pos.y - a.pos.y; if (Math.abs(dy) > 1.25) continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d2 = dx * dx + dz * dz; if (d2 > 0.81 || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), ov = 0.9 - d, nx = dx / d, nz = dz / d;
      const ra = a.kind === 'remote' ? 0 : b.kind === 'remote' ? 1 : 0.5, rb = b.kind === 'remote' ? 0 : a.kind === 'remote' ? 1 : 0.5;
      a.pos.x -= nx * ov * ra; a.pos.z -= nz * ov * ra; b.pos.x += nx * ov * rb; b.pos.z += nz * ov * rb;
      const rv = (b.vel.x - a.vel.x) * nx + (b.vel.z - a.vel.z) * nz;
      if (rv < 0) { if (ra) { a.vel.x += nx * rv * 0.5; a.vel.z += nz * rv * 0.5; } if (rb) { b.vel.x -= nx * rv * 0.5; b.vel.z -= nz * rv * 0.5; } }
    }
  }
}
function grabs() {
  for (const j of G.ents) {
    if (j.kind === 'remote' || !j.grabbing || j.grabCD > 0 || j.out || j.fin || !j.visible) continue;
    let best = null, bd = 1.55; const sx = Math.sin(j.yaw), sz = Math.cos(j.yaw);
    for (const o of G.ents) {
      if (o === j || o.out || !o.visible || o.dead > 0 || o.fin) continue;
      const dx = o.pos.x - j.pos.x, dz = o.pos.z - j.pos.z; if (Math.abs(o.pos.y - j.pos.y) > 1.3) continue;
      const d = Math.hypot(dx, dz); if (d > bd || d < 1e-4) continue; if ((dx * sx + dz * sz) / d < 0.3) continue;
      best = o; bd = d;
    }
    if (!best) continue;
    j.grabCD = 0.3;
    if (best.kind !== 'remote') best.slowT = 0.4; else if (G.type === 'online') NET.ev({ k: 'slow', to: best.id });
    if (W.def.kind === 'tail' && best.tail && !j.tail) report('grab', j.id, { to: best.id });
    if (isMine(j.id)) Snd.play('grab');
  }
}

// ------------------------------------------------------------------ input
const KEYS = {}, PRESS = {};
let mouseDown = false, lastMX = 0, lastMY = 0, mouseGrab = false;
const canvas = $('c');
const typing = () => { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'SELECT' || a.tagName === 'TEXTAREA'); };
addEventListener('keydown', (e) => {
  if (typing()) return;
  if (!KEYS[e.code]) PRESS[e.code] = true; KEYS[e.code] = true;
  if (G.screen === 'play' && (e.code === 'Space' || e.code.startsWith('Arrow'))) e.preventDefault();
  if ((e.code === 'Escape' || e.code === 'KeyP') && (G.screen === 'play' || G.screen === 'pause')) togglePause();
});
addEventListener('keyup', (e) => { KEYS[e.code] = false; });
addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; mouseDown = false; });
const camOK = () => G.screen === 'play' && G.type !== 'duo' && G.views[0];
canvas.addEventListener('mousedown', (e) => {
  Snd.ensure();
  if (!camOK()) return;
  if (!G.touch && document.pointerLockElement !== canvas && e.button === 0) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (er) {} }
  else if (document.pointerLockElement === canvas && e.button === 0) mouseGrab = true;
  mouseDown = true; lastMX = e.clientX; lastMY = e.clientY;
});
addEventListener('mouseup', (e) => { mouseDown = false; if (e.button === 0) mouseGrab = false; });
addEventListener('mousemove', (e) => {
  if (!camOK()) return;
  const v = G.views[0], k = 0.0026 * SET.sens;
  if (document.pointerLockElement === canvas) { v.yaw -= e.movementX * k; v.pitch = clamp(v.pitch + e.movementY * k, -0.2, 1.25); v.man = 1; }
  else if (mouseDown && !G.touch) { v.yaw -= (e.clientX - lastMX) * k * 1.4; v.pitch = clamp(v.pitch + (e.clientY - lastMY) * k * 1.4, -0.2, 1.25); lastMX = e.clientX; lastMY = e.clientY; v.man = 1; }
});
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement !== canvas && G.screen === 'play' && G.type !== 'online' && !G.paused && S && S.ph === 'play') togglePause(true); });
canvas.addEventListener('wheel', (e) => { const v = G.views[0]; if (v && G.screen === 'play') { v.dist = clamp(v.dist + Math.sign(e.deltaY) * 0.7, 5, 14); e.preventDefault(); } }, { passive: false });
// touch: joystick, buttons, drag to look
const TCH = { sid: null, sx: 0, sy: 0, x: 0, y: 0, look: null, lx: 0, ly: 0, held: {}, press: {} };
function setTouchMode(on) { if (G.touch === on) return; G.touch = on; refreshTouch(); }
addEventListener('touchstart', () => setTouchMode(true), { passive: true, capture: true });
addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') setTouchMode(false); }, true);
const stick = $('stick'), knob = $('knob');
stick.addEventListener('pointerdown', (e) => { e.preventDefault(); TCH.sid = e.pointerId; const r = stick.getBoundingClientRect(); TCH.sx = r.left + r.width / 2; TCH.sy = r.top + r.height / 2; try { stick.setPointerCapture(e.pointerId); } catch (er) {} moveStick(e); });
stick.addEventListener('pointermove', (e) => { if (e.pointerId === TCH.sid) moveStick(e); });
const endStick = (e) => { if (e.pointerId !== TCH.sid) return; TCH.sid = null; TCH.x = TCH.y = 0; knob.style.transform = ''; };
stick.addEventListener('pointerup', endStick); stick.addEventListener('pointercancel', endStick);
function moveStick(e) { let dx = e.clientX - TCH.sx, dy = e.clientY - TCH.sy; const m = Math.hypot(dx, dy), R = 52; if (m > R) { dx *= R / m; dy *= R / m; } TCH.x = dx / R; TCH.y = -dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`; }
for (const [id, k] of [['bJump', 'jump'], ['bDive', 'dive'], ['bGrab', 'grab']]) {
  const b = $(id);
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); Snd.ensure(); TCH.held[k] = true; TCH.press[k] = true; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (er) {} });
  const up = () => { TCH.held[k] = false; b.classList.remove('held'); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
}
canvas.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch' || TCH.look != null) return; TCH.look = e.pointerId; TCH.lx = e.clientX; TCH.ly = e.clientY; });
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== TCH.look) return; const v = G.views[0]; if (!v) return; const k = 0.0062 * SET.sens;
  v.yaw -= (e.clientX - TCH.lx) * k; v.pitch = clamp(v.pitch + (e.clientY - TCH.ly) * k, -0.2, 1.25); TCH.lx = e.clientX; TCH.ly = e.clientY; v.man = 1;
});
const endLook = (e) => { if (e.pointerId === TCH.look) TCH.look = null; };
canvas.addEventListener('pointerup', endLook); canvas.addEventListener('pointercancel', endLook);
function padsNow() { try { return [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean); } catch (e) { return []; } }
const PADPREV = {};
function padFor(vi) { const p = padsNow(); if (G.type === 'duo') { if (p.length === 1) return vi === 1 ? p[0] : null; return p[vi] || null; } return vi === 0 ? p[0] || null : null; }
// what one player wants this frame, turned into a world direction
function readInput(v, dt) {
  if (G.testInp && v.i === 0) { const ti = G.testInp, o = { x: 0, z: 0, jump: !!ti.jump, dive: !!ti.dive, grab: !!ti.grab }; const f = toWorld(v, ti.x || 0, ti.y || 0); o.x = f[0]; o.z = f[1]; if (ti.once) G.testInp = Object.assign({}, ti, { jump: false, dive: false }); return o; }
  let ix = 0, iy = 0, jump = false, dive = false, grab = false, rot = 0;
  const K = KEYS, P = PRESS;
  if (G.type === 'duo') {
    if (v.i === 0) { ix = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0); iy = (K.KeyW ? 1 : 0) - (K.KeyS ? 1 : 0); jump = !!P.Space; dive = !!P.ShiftLeft; grab = !!K.KeyE; rot = (K.KeyQ ? 1 : 0) - (K.KeyR ? 1 : 0); }
    else { ix = (K.ArrowRight ? 1 : 0) - (K.ArrowLeft ? 1 : 0); iy = (K.ArrowUp ? 1 : 0) - (K.ArrowDown ? 1 : 0); jump = !!(P.Enter || P.NumpadEnter || P.Numpad0); dive = !!(P.ShiftRight || P.Numpad1); grab = !!(K.Slash || K.ControlRight || K.Numpad2); rot = (K.Comma ? 1 : 0) - (K.Period ? 1 : 0); }
  } else if (v.i === 0) {
    ix = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0); iy = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0);
    jump = !!P.Space; dive = !!(P.ShiftLeft || P.ShiftRight || P.KeyC); grab = !!(K.KeyE || K.KeyF || mouseGrab); rot = (K.KeyQ ? 1 : 0) - (K.KeyR ? 1 : 0);
    if (TCH.x || TCH.y) { ix = TCH.x; iy = TCH.y; }
    if (TCH.press.jump) jump = true; if (TCH.press.dive) dive = true; if (TCH.held.grab) grab = true;
  }
  const gp = padFor(v.i);
  if (gp) {
    const ax = gp.axes || [], bt = gp.buttons || [], pv = PADPREV[gp.index] || (PADPREV[gp.index] = {});
    const dz = (a) => Math.abs(a) > 0.18 ? a : 0;
    if (dz(ax[0]) || dz(ax[1])) { ix = dz(ax[0]); iy = -dz(ax[1]); }
    const bp = (i) => bt[i] && bt[i].pressed, edge = (i) => { const p = bp(i), was = pv[i]; pv[i] = p; return p && !was; };
    if (edge(0)) jump = true; if (edge(1)) dive = true; if (bp(2) || bp(7)) grab = true; if (edge(9)) togglePause();
    if (dz(ax[2])) { v.yaw -= dz(ax[2]) * dt * 2.6 * SET.sens; v.man = 1; } if (dz(ax[3])) v.pitch = clamp(v.pitch + dz(ax[3]) * dt * 1.8, -0.2, 1.25);
  }
  if (rot) { v.yaw += rot * dt * 2.4; v.man = 1; }
  const w = toWorld(v, ix, iy);
  return { x: w[0], z: w[1], jump, dive, grab };
}
function toWorld(v, ix, iy) { const s = Math.sin(v.yaw), c = Math.cos(v.yaw); return [s * iy - c * ix, c * iy + s * ix]; }
function clearPress() { for (const k in PRESS) delete PRESS[k]; TCH.press = {}; }

// ------------------------------------------------------------------ cameras, split-screen, rendering
function setupViews() {
  const ids = mineIds(), host = $('vps'); host.innerHTML = '';
  G.views = ids.map((id, i) => {
    const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 700); cam.layers.set(0);
    for (let k = 0; k < ids.length; k++) if (k !== i) cam.layers.enable(k + 1);
    const el = document.createElement('div'); el.className = 'vp';
    el.innerHTML = '<div class="who"><i></i><span></span></div><div class="st"></div><div class="big2"></div><div class="stp"></div>';
    host.appendChild(el);
    const j = G.byId.get(id), y0 = j ? j.pos : { x: 0, y: 0, z: 0 };
    return { i, id, cam, yaw: W.view, pitch: 0.36, dist: 8.6, tx: y0.x, ty: y0.y + 1.3, tz: y0.z, spec: '', el, snap: true, man: 0, shake: 0, who: el.querySelector('.who'), st: el.querySelector('.st'), big: el.querySelector('.big2'), stp: el.querySelector('.stp') };
  });
  for (const v of G.views) { const f = fieldOf(v.id); v.who.hidden = G.type !== 'duo'; if (f) { v.who.querySelector('i').style.background = hexs(COLORS[f.c]); v.who.querySelector('span').textContent = nameOf(f); } }
  layoutViews();
}
function viewRects() {
  const w = innerWidth, h = innerHeight;
  if (G.views.length < 2) return [[0, 0, w, h]];
  return w >= h ? [[0, 0, w / 2, h], [w / 2, 0, w / 2, h]] : [[0, 0, w, h / 2], [0, h / 2, w, h / 2]];
}
function layoutViews() {
  const R = viewRects();
  G.views.forEach((v, i) => { const r = R[i]; Object.assign(v.el.style, { left: r[0] + 'px', top: r[1] + 'px', width: r[2] + 'px', height: r[3] + 'px' }); v.cam.aspect = r[2] / Math.max(1, r[3]); v.cam.updateProjectionMatrix(); v.rect = r; });
}
function shake(id, a) { const v = G.views.find(v => v.id === id); if (v) v.shake = Math.max(v.shake, a); }
function focusOf(v) {
  const j = G.byId.get(v.id);
  if (j && !j.out && j.visible && !(j.fin && now() - j.finAt > 1.6)) { v.spec = ''; return j; }
  if (j && j.dead > 0) return j;
  let list = G.ents.filter(e => !e.out && e.visible && !(e.fin && now() - e.finAt > 1.6));
  if (!list.length) list = G.ents.filter(e => e.visible);
  if (!list.length) return j || null;
  let s = list.find(e => e.id === v.spec);
  if (!s) { list.sort((a, b) => (b.bot ? 0 : 1) - (a.bot ? 0 : 1)); s = list[0]; v.spec = s.id; v.snap = true; }
  return s;
}
function spectateStep(d) {
  const v = G.views[0]; if (!v) return;
  const list = G.ents.filter(e => !e.out && e.visible && !(e.fin && now() - e.finAt > 1.6)); if (!list.length) return;
  const i = list.findIndex(e => e.id === v.spec); v.spec = list[(i + d + list.length) % list.length].id; v.snap = true; Snd.play('ui');
}
function updateCam(v, dt) {
  const j = focusOf(v); if (!j) return;
  const tx = j.pos.x, ty = j.pos.y + 1.3, tz = j.pos.z;
  const mine = j.id === v.id && j.kind === 'p';
  if (v.snap) { v.tx = tx; v.ty = ty; v.tz = tz; v.snap = false; if (!mine) v.yaw = W.view; }
  v.tx = lerp(v.tx, tx, damp(12, dt)); v.tz = lerp(v.tz, tz, damp(12, dt)); v.ty = lerp(v.ty, ty, damp(j.grounded ? 9 : 4, dt));
  // auto-follow behind a moving jelly when nobody steers the camera (touch, same-device, spectating)
  const auto = G.type === 'duo' || G.touch || !mine;
  const hs = Math.hypot(j.vel.x, j.vel.z);
  if (auto && hs > 2 && j.st === 0) { const want = Math.atan2(j.vel.x, j.vel.z), d = angDiff(v.yaw, want); if (Math.abs(d) < 2.4) v.yaw += d * dt * (mine ? 0.9 : 1.6) * Math.min(1, hs / 6); }
  v.man = Math.max(0, v.man - dt);
  const cp = Math.cos(v.pitch), sp = Math.sin(v.pitch), s = Math.sin(v.yaw), c = Math.cos(v.yaw);
  let x = v.tx - s * v.dist * cp, y = v.ty + v.dist * sp + 0.6, z = v.tz - c * v.dist * cp;
  if (W.slime && y < W.slimeY + 1) y = W.slimeY + 1;
  if (v.shake > 0) { v.shake -= dt; const a = v.shake * 0.35; x += (Math.random() - 0.5) * a; y += (Math.random() - 0.5) * a; }
  v.cam.position.set(x, y, z); v.cam.lookAt(v.tx + s * 1.5, v.ty + 0.3, v.tz + c * 1.5);
}
function renderWorld() {
  const sun = W.sun; if (!sun || !G.views.length) return;
  let fx = 0, fz = 0, fy = 0; for (const v of G.views) { fx += v.tx; fz += v.tz; fy += v.ty; } const n = G.views.length; fx /= n; fz /= n; fy /= n;
  const sp = n > 1 ? Math.min(60, Math.max(34, Math.hypot(G.views[0].tx - G.views[1].tx, G.views[0].tz - G.views[1].tz) * 0.6 + 30)) : 34;
  const sc = sun.shadow.camera; if (sc.right !== sp) { sc.left = -sp; sc.right = sp; sc.top = sp; sc.bottom = -sp; sc.updateProjectionMatrix(); }
  sun.position.set(fx + 18, fy + 40, fz - 10); sun.target.position.set(fx, fy, fz); sun.target.updateMatrixWorld();
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  const H = innerHeight;
  renderer.setScissorTest(n > 1);
  for (const v of G.views) {
    const r = v.rect || [0, 0, innerWidth, H];
    W.scene.userData.sky.position.copy(v.cam.position);
    PART.mat.uniforms.scale.value = r[3] * 0.9 * renderer.getPixelRatio();
    renderer.setViewport(r[0], H - r[1] - r[3], r[2], r[3]); renderer.setScissor(r[0], H - r[1] - r[3], r[2], r[3]);
    renderer.render(W.scene, v.cam);
    renderer.shadowMap.needsUpdate = false;
  }
  renderer.setScissorTest(false);
}

// ------------------------------------------------------------------ one frame of a round
function roundFrame(dt) {
  const T = now() - S.t0; W.T = T;
  const jump = Math.abs(T - G.lastT - dt) > 0.4; G.lastT = T;
  updateDyn(T, dt, jump);
  updateTiles(T, dt); updateWorldExtras(T, dt);
  const playing = S.ph === 'play' && T >= 0;
  for (const j of G.ents) {
    if (j.kind === 'p') { const v = G.views.find(v => v.id === j.id); const inp = v ? readInput(v, dt) : ZERO; simJelly(j, playing ? inp : ZERO, dt); if (playing) localChecks(j); }
    else if (j.kind === 'bot') { const inp = playing ? botStep(j, dt, T, G.ents) : ZERO; simJelly(j, inp, dt); if (playing) localChecks(j); }
    else remoteStep(j, dt);
    if (j.fin && j.visible && W.def.kind !== 'tail' && now() - j.finAt > 1.6) { j.visible = false; PART.emit(j.pos.x, j.pos.y + 0.8, j.pos.z, 16, CONFETTI, { spd: 4, life: 0.8, size: 0.25, square: true }); }
  }
  if (playing) { jellyPush(); grabs(); }
  const t = now();
  for (const j of G.ents) { animJelly(j, dt, t); if (j.tag) { j.tag.visible = j.visible; j.tag.position.set(j.pos.x, j.pos.y + 2.25, j.pos.z); } }
  if (!G.menuOn) PART.update(dt);
  if (G.type === 'online') NET.tick(dt);
  hostTick();
  for (const v of G.views) updateCam(v, dt);
  roundUI(T);
}

// ------------------------------------------------------------------ menu backdrop (also the winner's podium)
const MENU = (() => {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, 0.1, 700);
  const sun = dressScene(scene, 3, { x: 0, z: 0, span: 30 }); sun.shadow.camera.left = sun.shadow.camera.bottom = -14; sun.shadow.camera.right = sun.shadow.camera.top = 14; sun.shadow.camera.updateProjectionMatrix(); sun.position.set(8, 20, 6);
  const plat = new THREE.Mesh(cylGeo(7, 1.2, 48, 2), candyMat(CC.pink, 'ring', 0xffffff)); plat.position.y = -0.6; plat.receiveShadow = true; scene.add(plat);
  const ped = new THREE.Mesh(cylGeo(1.3, 0.5, 32, 2), candyMat(CC.lemon, 'stripe', CC.orange, true)); ped.position.set(0, 0.25, 2.2); ped.castShadow = ped.receiveShadow = true; scene.add(ped);
  const B = { rnd: mulberry(5) }; const tmpScene = scene;
  const ms = { scene, cam, jellies: [], mine: null, t: 0, mode: 'menu', crown: null, win: null };
  const mb = makeBuilder(tmpScene, 11); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; mb.sweet(['lolly', 'donut', 'cupcake', 'gum', 'cane'][i % 5], Math.cos(a) * 16, -2 + (i % 3) * 3, Math.sin(a) * 16, 1.5 + (i % 2) * 0.6, a); }
  W.anim.length = 0; W.geos.length = 0;
  for (let i = 0; i < 7; i++) {
    const j = newJelly({ col: (i * 5 + 2) % 12, cos: (i * 3 + 1) % COSTUMES.length, fx: i });
    j.mm = { a: i / 7 * TAU, r: 4.6 + (i % 2) * 0.9, vy: 0, hop: Math.random() * 2, sp: 0.25 + Math.random() * 0.2 };
    j.grounded = true; scene.add(j.m.root); ms.jellies.push(j);
  }
  ms.setMine = (c, k) => { if (ms.mine) scene.remove(ms.mine.m.root); ms.mine = newJelly({ col: c, cos: k }); ms.mine.grounded = true; ms.mine.pos.set(0, 0.5, 2.2); ms.mine.mm = { vy: 0, hop: 1.5 }; scene.add(ms.mine.m.root); };
  ms.setWinner = (f) => {
    if (ms.win) scene.remove(ms.win.m.root); ms.win = null; if (!f) return;
    ms.win = newJelly({ col: f.c, cos: 0 }); ms.win.grounded = true; ms.win.pos.set(0, 0.5, 2.2); ms.win.mm = { vy: 0, hop: 0.5 };
    const cr = crownMesh(1.15); cr.position.y = 1.5; ms.win.m.parts.add(cr); scene.add(ms.win.m.root);
  };
  ms.update = (dt) => {
    ms.t += dt; const t = ms.t;
    const list = ms.jellies.concat(ms.mode === 'end' ? [ms.win] : [ms.mine]).filter(Boolean);
    for (const j of list) {
      const m = j.mm; m.hop -= dt;
      if (j !== ms.mine && j !== ms.win) { m.a += dt * m.sp; j.pos.x = Math.cos(m.a) * m.r; j.pos.z = Math.sin(m.a) * m.r; j.yaw = -m.a + Math.PI; j.vel.set(-Math.sin(m.a) * m.sp * m.r, m.vy, Math.cos(m.a) * m.sp * m.r); }
      else { j.yaw = ms.mode === 'custom' ? Math.sin(t * 0.7) * 0.9 : Math.sin(t * 0.5) * 0.35; j.vel.set(0, m.vy, 0); }
      if (m.hop <= 0 && j.grounded) { m.vy = 5 + Math.random() * 3; j.grounded = false; j.sqv += 4; m.hop = 1 + Math.random() * 2.2; if (ms.mode === 'end' && j === ms.win) { m.vy = 7; m.hop = 0.9; PART.emit(0, 3, 2.2, 26, CONFETTI, { spd: 6, life: 1.4, size: 0.1, square: true }); } }
      const base = (j === ms.mine || j === ms.win) ? 0.5 : 0;
      if (!j.grounded) { m.vy -= 22 * dt; j.pos.y += m.vy * dt; if (j.pos.y <= base) { j.pos.y = base; j.grounded = true; j.sqv -= Math.min(6, -m.vy * 0.4); m.vy = 0; } }
      animJelly(j, dt, t);
      if (j !== ms.mine && j !== ms.win && ms.mode !== 'menu') j.m.root.visible = false;   // keep the stage clear for your jelly / the winner
    }
    if (ms.mine) ms.mine.m.root.visible = ms.mode !== 'end'; if (ms.win) ms.win.m.root.visible = ms.mode === 'end';
    const w = innerWidth, h = innerHeight; cam.aspect = w / h; cam.fov = w < h ? 62 : 50; cam.updateProjectionMatrix();
    if (ms.mode === 'custom') { cam.position.set(Math.sin(t * 0.2) * 0.6, 1.7, 2.2 + (w < h ? 8 : 6.5)); cam.lookAt(0, w < h ? -1.4 : -0.5, 2.2); }
    else if (ms.mode === 'end') { cam.position.set(Math.sin(t * 0.3) * 1.5, 2.2, 2.2 + 6.2); cam.lookAt(0, w < h ? -0.6 : 0.2, 2.2); }
    else { const a = t * 0.08; cam.position.set(Math.sin(a) * 14, 5.2, Math.cos(a) * 14); cam.lookAt(0, w < h ? 2.6 : 0.6, 0); }
  };
  ms.render = () => { scene.userData.sky.position.copy(cam.position); PART.mat.uniforms.scale.value = innerHeight * 0.9 * renderer.getPixelRatio(); renderer.shadowMap.autoUpdate = true; renderer.setViewport(0, 0, innerWidth, innerHeight); renderer.render(scene, cam); };
  return ms;
})();
MENU.setMine(COLORS[LOOK.c] ? LOOK.c : 0, unlocked(LOOK.k) ? LOOK.k : 1);

// ------------------------------------------------------------------ screens
const SCREENS = ['menu', 'custom', 'how', 'stats', 'prac', 'duo', 'online', 'lobby', 'pause', 'res', 'end'];
function show(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
  G.screen = id || 'play';
  const inGame = !!G.round && (G.screen === 'play' || G.screen === 'pause' || G.screen === 'res');
  $('topbar').hidden = inGame || G.screen === 'play';
  $('hud').hidden = !G.round || G.round.fake || G.screen === 'end' || (!inGame && G.screen !== 'res');
  MENU.mode = id === 'custom' ? 'custom' : id === 'end' ? 'end' : 'menu';
  G.menuOn = !G.round || G.round.fake || id === 'end' || (!inGame && id !== 'res' && id !== 'pause');
  if (G.menuOn) { PART.clear(); MENU.scene.add(PART.pts); }
  if (id && document.pointerLockElement) try { document.exitPointerLock(); } catch (e) {}
  refreshTouch();
  if (window.Mal3abPopButtons) setTimeout(() => window.Mal3abPopButtons(), 0);
}
function refreshTouch() {
  const me = G.views[0] && G.byId.get(G.views[0].id);
  $('touch').hidden = !(G.touch && G.screen === 'play' && G.type !== 'duo' && me && me.kind === 'p' && !me.out && !me.fin);
}
function enterPlayUI() { if (G.screen !== 'pause') show(''); $('hud').hidden = false; $('topbar').hidden = true; Snd.music('play'); refreshTouch(); }
function backToMenu() {
  if (G.type === 'online') NET.leave();
  teardownWorld(); S = null; G.round = null; G.type = ''; G.paused = false; G.views = []; $('vps').innerHTML = '';
  $('intro').hidden = true; show('menu'); renderMenu(); Snd.music('menu');
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
}
function togglePause(force) {
  if (G.screen === 'pause') { if (force === true) return; show(''); G.paused = false; $('hud').hidden = false; refreshTouch(); return; }
  if (G.screen !== 'play') return;
  G.paused = G.type !== 'online'; show('pause'); $('hud').hidden = false;
  setText($('pauseNote'), G.type === 'online' ? t('jd_pauseOnline') : '');
  renderPause();
}
function renderPause() {
  $('sens').value = SET.sens;
  setText($('bMus'), (SET.mus ? '🎵 ' : '🔇 ') + t('jd_music'));
  setText($('bQual'), t(SET.q ? 'jd_qHigh' : 'jd_qFast'));
}
const opt = (v, txt, cur) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${esc(txt)}</option>`;
const diffOpts = (cur) => [0, 1, 2].map(i => opt(i, t('jd_d' + i), cur)).join('');
function renderMenu() {
  const L = $('logo'); const w = t('jd_title').split(' ');
  L.innerHTML = getLang() === 'ar' ? `<span class="l1">${esc(t('jd_title'))}</span>` : w.map((x, i) => `<span class="l${i + 1}">${esc(x)}</span>`).join(' ');
  $('sDiff').innerHTML = diffOpts(SET.diff);
  $('sLen').innerHTML = [3, 4, 5].map(n => opt(n, t('jd_rounds', { n }), SET.len)).join('');
  $('sField').innerHTML = [6, 8, 10, 12].map(n => opt(n, t('jd_jellies', { n }), SET.field)).join('');
  $('pDiff').innerHTML = diffOpts(SET.pdiff);
  $('dDiff').innerHTML = diffOpts(SET.diff); $('dLen').innerHTML = [3, 4, 5].map(n => opt(n, t('jd_rounds', { n }), SET.len)).join('');
  setText($('crownN'), String(STATS.crowns)); $('crownBar').title = t('jd_crowns');
  $('sndBtn').textContent = SET.snd ? '🔊' : '🔇';
  $('langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية';
  $('onName').placeholder = t('jd_you');
  $('n1').placeholder = t('jd_player', { n: 1 }); $('n2').placeholder = t('jd_player', { n: 2 });
  if (!$('custom').hidden) renderCustom();
  if (!$('stats').hidden) renderStats();
  if (!$('how').hidden) renderHow();
  if (!$('prac').hidden) renderPrac();
  if (!$('duo').hidden) renderDuo();
  if (!$('pause').hidden) renderPause();
  if (!$('lobby').hidden && (typeof NET !== 'undefined')) NET.renderLobby();
}
function renderCustom() {
  $('swatches').innerHTML = COLORS.map((c, i) => `<button class="sw${LOOK.c === i ? ' on' : ''}" style="--c:${hexs(c)}" data-c="${i}" title="${esc(t('jd_c_' + COLOR_KEYS[i]))}"></button>`).join('');
  const ICO = ['🚫', '🥳', '🎀', '📡', '🐱', '👨‍🍳', '🌱', '🐰', '🚁', '🎧', '🎩', '😇'];
  $('costumes').innerHTML = COSTUMES.map((c, i) => {
    const ok = unlocked(i), need = c.need ? t('jd_need_' + c.need[0], { n: c.need[1] }) : '';
    return `<button class="cos${LOOK.k === i ? ' on' : ''}${ok ? '' : ' lock'}" data-k="${i}"><b>${ok ? ICO[i] : '🔒'}</b>${esc(t('jd_cos_' + c.k))}${ok ? '' : `<small>${esc(need)}</small>`}</button>`;
  }).join('');
}
$('swatches').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; LOOK.c = +b.dataset.c; store.set('look', LOOK); MENU.setMine(LOOK.c, LOOK.k); renderCustom(); Snd.play('pop'); };
$('costumes').onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b) return; const k = +b.dataset.k; if (!unlocked(k)) { Snd.play('bump'); toast(t('jd_locked')); return; } LOOK.k = k; store.set('look', LOOK); MENU.setMine(LOOK.c, LOOK.k); renderCustom(); Snd.play('pop'); };
function renderHow() {
  const k = (s) => s.split(' ').map(x => `<kbd>${esc(x)}</kbd>`).join(' ');
  $('howBody').innerHTML = `
    <div><h3>⌨️ ${esc(t('jd_hKeys'))}</h3>${k('W A S D')} ${esc(t('jd_move'))}<br>${k('Space')} ${esc(t('jd_jump'))} · ${k('Shift')} ${esc(t('jd_dive'))}<br>${k('E')} / 🖱️ ${esc(t('jd_grab'))} · 🖱️ ${esc(t('jd_look'))}<br>${k('Esc')} ${esc(t('jd_pause'))}</div>
    <div><h3>📱 ${esc(t('jd_hTouch'))}</h3>${esc(t('jd_hTouchD'))}</div>
    <div><h3>👯 ${esc(t('jd_duo'))}</h3>${esc(t('jd_p1'))}: ${k('W A S D')} ${k('Space')} ${k('L-Shift')} ${k('E')} ${k('Q')}${k('R')}<br>${esc(t('jd_p2'))}: ${k('← ↑ → ↓')} ${k('Enter')} ${k('R-Shift')} ${k('/')} ${k(',')}${k('.')}<br>🎮 ${esc(t('jd_hPads'))}</div>
    <div><h3>🏁 ${esc(t('jd_hShow'))}</h3>${esc(t('jd_hShowD'))}</div>
    <div><h3>🎪 ${esc(t('jd_hRounds'))}</h3>${JD_ROUNDS.filter(r => r.id !== 'tilefin').map(r => `${r.ico} <b>${esc(t('jd_r_' + r.id))}</b> — ${esc(t('jd_k_' + r.kind))}`).join('<br>')}</div>
    <div><h3>💡 ${esc(t('jd_hTips'))}</h3>${esc(t('jd_hTipsD'))}</div>`;
}
function renderStats() {
  const items = [['👑', STATS.crowns, 'jd_crowns'], ['🎪', STATS.shows, 'jd_shows'], ['🏁', STATS.rounds, 'jd_roundsPlayed'], ['✅', STATS.quals, 'jd_quals'], ['⭐', STATS.finals, 'jd_finals'], ['💫', STATS.falls, 'jd_falls']];
  $('statBody').innerHTML = items.map(([e, n, k]) => `<div><b>${e} ${n | 0}</b><span>${esc(t(k))}</span></div>`).join('');
  const best = JD_ROUNDS.filter(r => r.kind === 'race' && STATS.best[r.id]).map(r => `${r.ico} ${esc(t('jd_r_' + r.id))}: <b style="color:var(--accent)">${STATS.best[r.id].toFixed(2)}s</b>`);
  $('bestBody').innerHTML = best.length ? esc(t('jd_bestTimes')) + '<br>' + best.join(' · ') : esc(t('jd_noBest'));
}
function renderPrac() {
  $('pracList').innerHTML = JD_ROUNDS.map(r => `<button class="rcard" data-r="${r.id}"><b>${r.ico}</b><span>${esc(t('jd_r_' + r.id))}</span><span class="kind ${r.kind}">${esc(t('jd_k_' + r.kind))}</span>${STATS.best[r.id] ? `<small>⏱ ${STATS.best[r.id].toFixed(2)}s</small>` : ''}</button>`).join('');
}
function renderDuo() {
  $('duoCols').innerHTML = COLORS.map((c, i) => `<button class="sw${G.p2c === i ? ' on' : ''}" style="--c:${hexs(c)};width:30px;height:30px" data-c="${i}"></button>`).join('');
  $('duoKeys').innerHTML = esc(t('jd_duoKeys'));
}
$('duoCols').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; G.p2c = +b.dataset.c; renderDuo(); Snd.play('pop'); };

// menu buttons
const on = (id, f) => { $(id).onclick = (e) => { Snd.ensure(); Snd.play('ui'); f(e); }; };
on('bSolo', () => { SET.diff = +$('sDiff').value; SET.len = +$('sLen').value; SET.field = +$('sField').value; saveSet(); startLocal('solo'); });
on('bDuo', () => { $('n1').value = G.duoNames[0] || store.get('n1', '') || ''; $('n2').value = G.duoNames[1] || store.get('n2', '') || ''; $('duoMsg').textContent = ''; if (G.p2c === LOOK.c) G.p2c = (LOOK.c + 5) % 12; show('duo'); renderDuo(); });
on('bDuoBack', () => show('menu'));
on('bDuoGo', () => {
  const a = $('n1').value.trim(), b = $('n2').value.trim();
  if (!a || !b) { $('duoMsg').textContent = t('jd_needNames'); (a ? $('n2') : $('n1')).focus(); return; }
  if (a === b) { $('duoMsg').textContent = t('jd_sameNames'); return; }
  G.duoNames = [a.slice(0, 16), b.slice(0, 16)]; store.set('n1', a); store.set('n2', b);
  SET.diff = +$('dDiff').value; SET.len = +$('dLen').value; saveSet(); startLocal('duo');
});
on('bOnline', () => { $('onName').value = store.get('name', '') || myName(); $('onMsg').textContent = ''; show('online'); });
on('bOnBack', () => show('menu'));
on('bPrac', () => { show('prac'); renderPrac(); });
on('bPracBack', () => show('menu'));
$('pracList').onclick = (e) => { const b = e.target.closest('[data-r]'); if (!b) return; Snd.ensure(); Snd.play('ui'); SET.pdiff = +$('pDiff').value; saveSet(); startLocal('practice', b.dataset.r); };
on('bCustom', () => { show('custom'); renderCustom(); });
on('bCustomOk', () => show('menu'));
on('bHow', () => { G.howBack = G.screen; show('how'); renderHow(); });
on('bHowOk', () => { if (G.howBack === 'pause') { show('pause'); $('hud').hidden = false; renderPause(); } else show('menu'); });
on('bPHow', () => { G.howBack = 'pause'; show('how'); renderHow(); });
on('bStats', () => { show('stats'); renderStats(); });
on('bStatsOk', () => show('menu'));
on('bResume', () => togglePause());
on('bQuit', () => backToMenu());
on('bMus', () => { SET.mus = SET.mus ? 0 : 1; saveSet(); Snd.music(SET.mus ? (G.round ? 'play' : 'menu') : ''); renderPause(); });
on('bQual', () => { SET.q = SET.q ? 0 : 1; saveSet(); applyQuality(); renderPause(); });
$('sens').oninput = () => { SET.sens = +$('sens').value; saveSet(); };
on('bPause', () => togglePause());
on('sndBtn', () => { SET.snd = SET.snd ? 0 : 1; saveSet(); $('sndBtn').textContent = SET.snd ? '🔊' : '🔇'; Snd.music(SET.snd ? 'menu' : ''); });
$('langBtn').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
on('bSpPrev', () => spectateStep(-1)); on('bSpNext', () => spectateStep(1));
on('bSpLeave', () => backToMenu());
document.addEventListener('langchange', () => { renderMenu(); if (G.round && G.round.def) { G.uiPh = ''; } for (const j of G.ents) { const f = fieldOf(j.id); if (f && j.bot && j.tag) { const nm = nameOf(f); if (nm !== j.name) { j.name = nm; W.scene.remove(j.tag); const tg = tagSprite(nm, j.color); tg.layers.mask = j.tag.layers.mask; j.tag = tg; W.scene.add(tg); } } } });

// start a show on this device (solo / same-device / practice)
function startLocal(type, prac) {
  if (G.type === 'online') NET.leave();
  G.type = type === 'practice' ? 'practice' : type; G.paused = false; G.clock = 0; S = null;
  const humans = type === 'duo'
    ? [{ id: 'p1', n: G.duoNames[0], c: LOOK.c, k: LOOK.k }, { id: 'p2', n: G.duoNames[1], c: G.p2c, k: (LOOK.k + 3) % 5 }]
    : [{ id: 'p1', n: myName(), c: LOOK.c, k: LOOK.k }];
  const cfg = type === 'practice' ? { diff: SET.pdiff, len: 1, field: 10, prac } : { diff: SET.diff, len: SET.len, field: type === 'duo' ? Math.max(6, SET.field) : SET.field };
  S = newShow(type, humans, cfg);
  G.statDone = {}; G.endDone = '';
  hostStartRound(0);
}

// ------------------------------------------------------------------ in-round UI
const KIND_NOTE = { race: 'jd_qRace', surv: 'jd_qSurv', tail: 'jd_qTail', frace: 'jd_qFrace', fsurv: 'jd_qFsurv' };
let hudTick = 0;
function roundUI(T) {
  const def = W.def; if (!def || !S) return;
  const intro = $('intro'), inIntro = S.ph === 'play' && T < -3 && G.screen !== 'pause';
  if (inIntro && (intro.hidden || G.uiPh !== 'intro' + S.serial)) {
    G.uiPh = 'intro' + S.serial;
    setText($('inEm'), def.ico);
    setText($('inRn'), S.prac ? t('jd_prac') : isFinal(def.kind) ? t('jd_finalRound') : t('jd_roundN', { n: S.ri + 1, m: S.plan.length }));
    setText($('inName'), t('jd_r_' + def.id)); setText($('inDesc'), t('jd_rd_' + def.id));
    const kk = $('inKind'); kk.className = 'kind ' + def.kind; setText(kk, t('jd_k_' + def.kind));
    setText($('inQ'), t(KIND_NOTE[def.kind], { n: S.qn, m: S.ord.length }));
    intro.hidden = false; Snd.play('whistle');
  }
  if (!inIntro && !intro.hidden) intro.hidden = true;
  // countdown + GO
  for (const v of G.views) {
    let big = '';
    if (S.ph === 'play' && T >= -3 && T < 0) big = String(Math.ceil(-T));
    else if (S.ph === 'play' && T >= 0 && T < 0.9) big = t('jd_go');
    if (v.big.textContent !== big) { v.big.textContent = big; v.big.classList.remove('pop'); void v.big.offsetWidth; if (big) v.big.classList.add('pop'); }
  }
  const cd = S.ph === 'play' && T >= -3 && T < 0 ? Math.ceil(-T) : T >= 0 ? 0 : 99;
  if (cd !== G.cdLast) { if (cd > 0 && cd < 4) Snd.play('tick'); else if (cd === 0 && G.cdLast < 4) Snd.play('go'); G.cdLast = cd; }
  // results flow
  if (S.ph === 'res' && G.uiPh !== 'res' + S.serial) onResults();
  if (S.ph === 'end' && G.uiPh !== 'end' + S.serial) onEnd();
  if (S.ph === 'res' && !$('res').hidden) setText($('resNext'), S.prac ? '' : t('jd_nextIn', { n: Math.max(0, Math.ceil(RES - (now() - S.tEnd))) }));
  if (S.ph === 'res' && $('res').hidden && G.screen !== 'pause' && now() - S.tEnd > 2.6) showResList();
  hudTick -= 1; if (hudTick > 0) return; hudTick = 6;
  // top bar
  setText($('hIc'), def.ico); setText($('hName'), t('jd_r_' + def.id));
  const left = Math.max(0, def.time - Math.max(0, T)), mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  setText($('hTime'), S.ph === 'play' ? mm + ':' + String(ss).padStart(2, '0') : '');
  const alive = S.ord.filter(id => !S.o.includes(id)).length;
  let ct = '';
  if (def.kind === 'race') ct = '✅ ' + S.q.length + '/' + S.qn;
  else if (def.kind === 'surv') ct = '💚 ' + alive + ' → ' + S.qn;
  else if (def.kind === 'tail') ct = '🎀 ' + S.tails.length;
  else if (def.kind === 'fsurv') ct = '💚 ' + alive;
  else ct = '👑';
  setText($('hCount'), ct);
  // per player status
  let spec = false;
  for (const v of G.views) {
    const j = G.byId.get(v.id); let st = '';
    if (!j) { st = G.type === 'online' ? t('jd_lateJoin') : ''; spec = true; }
    else if (j.out) { st = t('jd_outWatch'); spec = true; }
    else if (j.fin && def.kind !== 'tail') { st = def.kind === 'frace' ? t('jd_gotCrown') : t('jd_qualified'); spec = now() - j.finAt > 1.6; }
    else if (def.kind === 'tail' && S.ph === 'play' && T >= 0) st = j.tail ? t('jd_haveTail') : t(G.touch ? 'jd_grabTailT' : 'jd_grabTail');
    else if (W.slime && S.ph === 'play' && T >= 0 && j.pos.y - W.slimeY < 4) st = t('jd_slimeNear');
    if (S.ph !== 'play') st = '';
    setText(v.st, st);
  }
  const sp = $('spec'); const showSpec = spec && S.ph === 'play' && G.views.length === 1;
  sp.hidden = !showSpec;
  if (showSpec) { const f = G.byId.get(G.views[0].spec); setText($('spName'), f ? f.name : ''); }
  refreshTouch();
}
function onResults() {
  G.uiPh = 'res' + S.serial;
  const def = W.def || ROUND[S.plan[S.ri]];
  // stats for this device's players
  const sk = 'r' + S.sid + S.serial;
  if (!G.statDone[sk]) {
    G.statDone[sk] = 1;
    for (const id of mineIds()) if (S.ord.includes(id) && !S.prac) { STATS.rounds++; if (S.q.includes(id)) STATS.quals++; }
    if (S.prac && def.kind === 'race') { const j = G.byId.get('p1'); if (j && j.sentFin && S.q.includes('p1')) { const b = STATS.best[def.id]; if (!b || j.finT < b) { STATS.best[def.id] = Math.round(j.finT * 100) / 100; G.newBest = true; } } }
    saveStats();
  }
  for (const v of G.views) {
    if (!S.ord.includes(v.id)) continue;
    const ok = S.q.includes(v.id), fin = isFinal(def.kind), win = fin && ok && !S.prac;
    v.stp.innerHTML = `<div class="stamp ${win ? 'win' : ok ? 'ok' : 'no'}">${esc(win ? t('jd_youWon') : ok ? t('jd_qualified2') : t('jd_eliminated'))}</div>`;
    setTimeout(() => { v.stp.innerHTML = ''; }, 2500);
  }
  const me = mineIds().filter(id => S.ord.includes(id));
  if (me.some(id => S.q.includes(id))) { Snd.play(isFinal(def.kind) ? 'crown' : 'qual'); for (const id of me) { const j = G.byId.get(id); if (j && S.q.includes(id)) PART.emit(j.pos.x, j.pos.y + 1.5, j.pos.z, 60, CONFETTI, { spd: 8, life: 1.5, size: 0.28, square: true }); } }
  else if (me.length) Snd.play('elim');
}
function showResList() {
  if (S.ph !== 'res') return;
  const def = ROUND[S.plan[S.ri]];
  setText($('resT'), def.ico + ' ' + t('jd_r_' + def.id));
  setText($('resP'), isFinal(def.kind) ? '' : t('jd_resP', { n: S.q.length, m: S.ord.length }));
  const order = S.q.concat(S.ord.filter(id => !S.q.includes(id)));
  $('resList').innerHTML = order.map(id => { const f = fieldOf(id), ok = S.q.includes(id); return `<span class="jc ${ok ? 'ok' : 'no'}${isMine(id) ? ' me' : ''}"><i style="background:${hexs(COLORS[f ? f.c : 0])}"></i>${ok ? '✓ ' : ''}${esc(nameOf(f))}</span>`; }).join('');
  $('resBtns').innerHTML = '';
  if (!S.prac) { const b = document.createElement('button'); b.className = 'btn sec small'; b.textContent = t('jd_quit'); b.onclick = () => backToMenu(); $('resBtns').appendChild(b); }
  show('res'); $('hud').hidden = false;
}
function onEnd() {
  G.uiPh = 'end' + S.serial;
  $('intro').hidden = true;
  const def = ROUND[S.plan[S.ri]], win = fieldOf(S.win), mineWin = S.win && isMine(S.win);
  const ek = 'e' + S.sid;
  if (!G.statDone[ek] && !S.prac) {
    G.statDone[ek] = 1;
    for (const id of mineIds()) if (fieldOf(id)) STATS.shows++;
    if (mineWin) { STATS.crowns++; if (G.type === 'solo') { STATS.soloWins = (STATS.soloWins | 0) + 1; try { if (window.Mal3abBest) Mal3abBest('jellydash', STATS.soloWins); } catch (e) {} } }
    saveStats(); setText($('crownN'), String(STATS.crowns));
    try { if (window.Mal3abHistory && Mal3abHistory.add) Mal3abHistory.add({ game: 'jelly-dash', result: mineWin ? 'win' : 'loss' }); } catch (e) {}
  }
  const btns = $('endBtns'); btns.innerHTML = '';
  const add = (txt, cls, f) => { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.textContent = txt; b.onclick = () => { Snd.play('ui'); f(); }; btns.appendChild(b); };
  if (S.prac) {
    const me = G.byId.get('p1'), ok = S.q.includes('p1');
    setText($('endEm'), ok ? '🎉' : '💫');
    setText($('endT'), ok ? t('jd_qualified2') : t('jd_eliminated'));
    let p = t('jd_r_' + def.id);
    if (ok && def.kind === 'race' && me && me.finT) p += ' — ⏱ ' + me.finT.toFixed(2) + 's' + (G.newBest ? ' ' + t('jd_newBest') : '');
    G.newBest = false; setText($('endP'), p);
    add(t('jd_retry'), '', () => startLocal('practice', S.prac)); add(t('jd_other'), 'sec', () => { backToMenu(); show('prac'); renderPrac(); }); add(t('jd_menu'), 'sec', backToMenu);
    MENU.setWinner(null); MENU.mode = 'menu';
  } else {
    setText($('endEm'), '👑');
    setText($('endT'), mineWin ? (G.type === 'duo' ? t('jd_wonName', { p: iso(nameOf(win)) }) : t('jd_youWonCrown')) : win ? t('jd_wonName', { p: iso(nameOf(win)) }) : t('jd_noWinner'));
    const mine = mineIds().map(id => fieldOf(id)).filter(Boolean);
    setText($('endP'), mineWin ? t('jd_crownsNow', { n: STATS.crowns }) : mine.length ? mine.map(f => t('jd_outIn', { p: iso(nameOf(f)), n: f.out + 1 })).join(' · ') : '');
    if (G.type === 'online') NET.endButtons(add);
    else { add(t('jd_again'), '', () => startLocal(G.type)); add(t('jd_menu'), 'sec', backToMenu); }
    MENU.setWinner(win || null);
    if (mineWin) Snd.play('crown');
  }
  show('end');
  if (MENU.mode === 'end') for (let i = 0; i < 3; i++) PART.emit(0, 3, 2.2, 40, CONFETTI, { spd: 7, life: 1.6, size: 0.11, square: true });
}

// ------------------------------------------------------------------ quality + resize
function applyQuality() {
  QUAL.max = Math.min(window.devicePixelRatio || 1, SET.q ? 1.6 : 1.1);
  QUAL.pr = QUAL.max; renderer.setPixelRatio(QUAL.pr); resize();
}
function resize() { renderer.setPixelRatio(QUAL.pr); renderer.setSize(innerWidth, innerHeight, false); layoutViews(); }
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 150));

// ------------------------------------------------------------------ main loop
let lastTs = 0, fpsAcc = 0, fpsN = 0, adaptT = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const raw = lastTs ? (ts - lastTs) / 1000 : 1 / 60; lastTs = ts;
  const dt = clamp(raw, 0, 0.05);
  fpsAcc += raw; fpsN++; if (fpsAcc > 1) { G.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  // keep 60 fps: lower the resolution a little when frames get slow, raise it back when there is room
  G.ftAvg = lerp(G.ftAvg, raw * 1000, 0.05); adaptT += raw;
  if (adaptT > 2 && !document.hidden) { adaptT = 0; if (G.ftAvg > 21 && QUAL.pr > QUAL.floor) { QUAL.pr = Math.max(QUAL.floor, QUAL.pr - 0.15); resize(); } else if (G.ftAvg < 14 && QUAL.pr < (QUAL.max || 1.6) - 0.01) { QUAL.pr = Math.min(QUAL.max || 1.6, QUAL.pr + 0.1); resize(); } }
  if (!G.paused) G.clock += dt;
  if (G.round && !G.round.fake && S && W.scene && !G.paused) { try { roundFrame(dt); } catch (e) { console.error(e); } }
  else if (G.type === 'online' && (typeof NET !== 'undefined')) NET.tick(dt);
  if (G.menuOn || !W.scene) { MENU.update(dt); PART.update(dt); MENU.render(); }
  else renderWorld();
  clearPress();
}

function boot() {
  applyQuality();
  document.body.classList.toggle('ar', getLang() === 'ar');
  G.touch = matchMedia('(pointer: coarse)').matches;
  MENU.scene.add(PART.pts);
  renderMenu(); show('menu');
  requestAnimationFrame(frame);
  const best = () => { try { if (window.Mal3abBest) Mal3abBest('jellydash', STATS.soloWins | 0); } catch (e) {} };
  best(); if (window.Mal3abReady) setTimeout(best, 500); else document.addEventListener('mal3abready', () => setTimeout(best, 500), { once: true });
  // after the account's cloud save loads, re-read stats
  addEventListener('storage', () => { Object.assign(STATS, store.get('stats', {}) || {}); Object.assign(LOOK, store.get('look', {}) || {}); setText($('crownN'), String(STATS.crowns)); });
  addEventListener('pointerdown', () => { Snd.ensure(); if (!Snd.mode && !G.round) Snd.music('menu'); }, { once: true });
}

// ------------------------------------------------------------------ test / automation hooks
window.JellyDash = {
  get state() {
    const me = G.views[0] && G.byId.get(G.views[0].id);
    return { type: G.type, screen: G.screen, ph: S && S.ph, ri: S ? S.ri : -1, round: S && S.plan[S.ri], plan: S && S.plan.slice(), T: +W.T.toFixed(2), serial: S && S.serial, ents: G.ents.length,
      alive: S ? S.ord.filter(id => !S.o.includes(id)).length : 0, q: S ? S.q.slice() : [], o: S ? S.o.slice() : [], qn: S && S.qn, win: S && S.win, tails: S && S.tails.slice(), fps: Math.round(G.fps), pr: QUAL.pr,
      me: me ? { id: me.id, x: +me.pos.x.toFixed(2), y: +me.pos.y.toFixed(2), z: +me.pos.z.toFixed(2), st: me.st, out: me.out, fin: me.fin, cp: me.cp, kind: me.kind, grounded: me.grounded, tail: me.tail } : null,
      kinds: G.ents.map(j => j.kind).join(''), field: S ? S.field.length : 0, out: S ? S.field.filter(f => f.out >= 0).length : 0, net: (typeof NET !== 'undefined') ? NET.info() : null };
  },
  show: () => S, ents: () => G.ents, W, G, ROUND, STATS,
  startSolo(o) { o = o || {}; SET.diff = o.diff == null ? 1 : o.diff; SET.len = o.len || 4; SET.field = o.field || 12; startLocal('solo'); return this.state; },
  startPractice(id, d) { SET.pdiff = d == null ? 1 : d; startLocal('practice', id); return this.state; },
  startDuo(a, b) { G.duoNames = [a || 'Ahmed', b || 'Sara']; startLocal('duo'); return this.state; },
  skipIntro() { if (S && amHost() && S.ph === 'play' && now() - S.t0 < 0) { const d = S.t0 - now() - 0.05; S.t0 -= d; if (G.round) G.round.t0 = S.t0; G.lastT = now() - S.t0; if (G.type === 'online') NET.sendShow(); } },
  setInput(o) { G.testInp = o || null; },
  me() { return G.views[0] && G.byId.get(G.views[0].id); },
  teleport(x, y, z) { const j = this.me(); if (j) { j.pos.set(x, y, z); j.vel.set(0, 0, 0); } },
  endRound() { if (S && amHost() && S.ph === 'play') hostEndRound(); },
  nextPhase() { if (S && amHost() && S.ph === 'res') S.tEnd = now() - RES - 1; },
  eliminateMe() { const j = this.me(); if (j && !j.out) report('out', j.id); },
  winRound() {   // test helper: make the player win this round whatever its kind
    const j = this.me(); if (!j || !S || S.ph !== 'play') return;
    const k = ROUND[S.plan[S.ri]].kind;
    if (k === 'race' || k === 'frace') return this.finishMe();
    if (k === 'tail') { if (!S.tails.includes(j.id)) { S.tails[0] = j.id; showChanged(); } return hostEndRound(); }
    for (const id of S.ord) if (id !== j.id && !S.o.includes(id) && (k === 'fsurv' || S.ord.length - S.o.length > S.qn)) hostEv({ k: 'out', id, r: S.serial });
  },
  finishMe() { const j = this.me(); if (j && !j.sentFin) { j.sentFin = true; j.finT = W.T; markFin(j); report('fin', j.id, { t: W.T }); } },
  fastForward(sec) { if (!S || G.type === 'online') return; const step = 1 / 30; for (let i = 0; i < sec / step; i++) { G.clock += step; roundFrame(step); if (S.ph !== 'play') break; } return this.state; },
  backToMenu, togglePause, spectateStep
};
