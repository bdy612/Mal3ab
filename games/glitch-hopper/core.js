'use strict';
// =====================================================================
// Glitch Hopper — simulation core (no DOM). Deterministic fixed-step
// platformer physics + the glitch clock. Loaded by the game and by tests.
// Units: tiles and seconds. y grows downwards.
// =====================================================================
(function (root) {
  const P = {
    w: 0.66, h: 0.66,
    grav: 52, jumpV: 17.6, maxFall: 21,
    run: 7.5, iceRun: 12,
    accG: 80, decG: 95, turnG: 150, accA: 52, decA: 18, overA: 3,
    accIce: 10, decIce: 2.2,
    coyote: 0.1, buffer: 0.13, cut: 0.45,
    dur: 5, freezeDur: 3, maxCharges: 3, maxFreeze: 9, deadDelay: 0.8,
  };
  const DT = 1 / 120;
  const T = { E: 0, W: 1, R: 2, B: 3, SU: 4, SD: 5, SL: 6, SR: 7, X: 8 };
  const CH = { '#': T.W, 'R': T.R, 'B': T.B, '^': T.SU, 'v': T.SD, '<': T.SL, '>': T.SR, 'x': T.X };
  const KINDS = ['flip', 'rev', 'ghost', 'ice', 'shift'];

  const stateCache = {};
  function parseState(str) {
    str = str || 'none';
    if (stateCache[str]) return stateCache[str];
    const a = { key: str, list: [], flip: false, rev: false, ghost: false, ice: false, shift: false };
    if (str !== 'none') str.split('+').forEach(k => { if (KINDS.includes(k)) { a[k] = true; a.list.push(k); } });
    return (stateCache[str] = Object.freeze(a));
  }

  function load(lv) {
    const map = lv.map, H = map.length, W = Math.max(...map.map(r => r.length));
    const grid = new Uint8Array(W * H);
    const L = { W, H, grid, lv, start: { x: 1, y: H - 2 }, exit: { x: W - 2, y: H - 2 }, freezes: [], frags: [], checks: [], seq: (lv.seq || ['none']).map(parseState) };
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = map[r][c] || '.';
      if (CH[ch] !== undefined) grid[r * W + c] = CH[ch];
      else if (ch === 'P') L.start = { x: c, y: r };
      else if (ch === 'X') L.exit = { x: c, y: r };
      else if (ch === 'F') L.freezes.push({ x: c, y: r });
      else if (ch === '*') L.frags.push({ x: c, y: r });
      else if (ch === 'C') L.checks.push({ x: c, y: r });
    }
    L.uses = {};
    L.seq.forEach(st => st.list.forEach(k => L.uses[k] = true));
    return L;
  }

  const tile = (L, c, r) => (c < 0 || c >= L.W || r < 0 || r >= L.H) ? T.E : L.grid[r * L.W + c];
  function solidAt(s, c, r) {
    const L = s.L;
    if (c < 0 || c >= L.W) return true;           // side walls
    if (r < 0 || r >= L.H) return false;          // open top / bottom: falling out kills
    const t = L.grid[r * L.W + c];
    return t === T.W || (t === T.R && !s.active.shift) || (t === T.B && s.active.shift);
  }
  function hitSolid(s, x, y) {
    const c0 = Math.floor(x), c1 = Math.floor(x + P.w - 1e-7), r0 = Math.floor(y), r1 = Math.floor(y + P.h - 1e-7);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (solidAt(s, c, r)) return true;
    return false;
  }

  // hazard rectangle inside a tile, or null
  function hazardRect(t, c, r) {
    switch (t) {
      case T.SU: return [c + 0.14, r + 0.42, c + 0.86, r + 1];
      case T.SD: return [c + 0.14, r, c + 0.86, r + 0.58];
      case T.SL: return [c + 0.42, r + 0.14, c + 1, r + 0.86];
      case T.SR: return [c, r + 0.14, c + 0.58, r + 0.86];
      case T.X: return [c + 0.06, r + 0.06, c + 0.94, r + 0.94];
    }
    return null;
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));
  function create(L) {
    const s = {
      L, time: 0, began: false, won: false, lost: false, deaths: 0, events: [], steps: 0,
      cp: { x: L.start.x, y: L.start.y, charges: L.lv.freeze || 0, tf: L.freezes.map(() => false), tg: L.frags.map(() => false), i: -1, idx: 0 },
      active: L.seq[0],
    };
    spawn(s);
    return s;
  }
  function spawn(s) {
    const cp = s.cp, L = s.L;
    s.x = cp.x + (1 - P.w) / 2; s.y = cp.y + 1 - P.h - 1e-4; s.vx = 0; s.vy = 0;
    s.ground = false; s.coyT = 0; s.bufT = 0; s.jumping = false; s.prevJump = true; s.prevFreeze = true; s.face = 1;
    s.idx = cp.idx || 0; s.clock = 0; s.cycleOn = false; s.freezeT = 0; s.active = L.seq[s.idx];
    s.dead = false; s.deadT = 0; s.cause = '';
    s.charges = cp.charges; s.tf = cp.tf.slice(); s.tg = cp.tg.slice(); s.cpi = cp.i;
    const sw = L.lv.sweep;
    s.sweepX = sw ? Math.max(-3, s.x - (sw.back || 8)) : -1e9; s.sweepT = 0;
    s.airT = 0;
  }
  const ev = (s, type, a) => s.events.push({ type, a });
  function die(s, cause) {
    if (s.dead || s.won) return;
    s.dead = true; s.deadT = P.deadDelay; s.deaths++; s.cause = cause; ev(s, 'die', cause);
  }

  function setActive(s, st) {
    const old = s.active; s.active = st; ev(s, 'switch', st.key);
    if (old.shift !== st.shift && hitSolid(s, s.x, s.y)) {   // a block appeared inside the player: pop out or get crushed
      const offs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let d = 0.05; d <= 0.501; d += 0.05) for (const o of offs) {
        if (!hitSolid(s, s.x + o[0] * d, s.y + o[1] * d)) { s.x += o[0] * d; s.y += o[1] * d; return; }
      }
      die(s, 'crush');
    }
  }
  const approach = (v, t, d) => v < t ? Math.min(t, v + d) : Math.max(t, v - d);

  function moveX(s, dx) {
    if (!dx) return false;
    const ox = s.x; s.x += dx;
    if (!hitSolid(s, s.x, s.y)) return false;
    if (dx > 0) s.x = Math.floor(s.x + P.w - 1e-7) - P.w - 1e-6; else s.x = Math.floor(s.x) + 1 + 1e-6;
    if (hitSolid(s, s.x, s.y)) s.x = ox;
    s.vx = 0; return true;
  }
  function moveY(s, dy, gd) {
    if (!dy) return false;
    const oy = s.y; s.y += dy;
    if (!hitSolid(s, s.x, s.y)) return false;
    if (dy > 0) s.y = Math.floor(s.y + P.h - 1e-7) - P.h - 1e-6; else s.y = Math.floor(s.y) + 1 + 1e-6;
    if (hitSolid(s, s.x, s.y)) s.y = oy;
    if (Math.sign(dy) === gd) s.ground = true;
    s.vy = 0; return true;
  }

  // one fixed step. inp = { l, r, jump, freeze } (held states)
  function step(s, inp) {
    if (s.won || s.lost) return;
    const L = s.L; s.steps++;
    if (s.began) {
      s.time += DT;
      if (L.lv.limit && s.time >= L.lv.limit) { s.time = L.lv.limit; s.lost = true; ev(s, 'lose'); return; }
    }
    if (s.dead) {
      s.deadT -= DT;
      if (s.deadT <= 0) { spawn(s); ev(s, 'respawn'); }
      return;
    }
    const jumpPress = inp.jump && !s.prevJump, frzPress = inp.freeze && !s.prevFreeze;
    if (!s.cycleOn && (inp.l || inp.r || jumpPress || frzPress)) { s.cycleOn = true; s.began = true; ev(s, 'start'); }

    // ---- glitch clock
    if (s.cycleOn) {
      if (frzPress && s.charges > 0 && L.seq.length > 1) {
        s.charges--; s.freezeT = Math.min(P.maxFreeze, s.freezeT + P.freezeDur); ev(s, 'freeze');
      } else if (frzPress) ev(s, 'nofreeze');
      if (s.freezeT > 0) {
        s.freezeT -= DT; if (s.freezeT <= 0) { s.freezeT = 0; ev(s, 'thaw'); }
      } else if (L.seq.length > 1) {
        const prev = P.dur - s.clock; s.clock += DT; const rem = P.dur - s.clock;
        for (let k = 3; k >= 1; k--) if (prev > k && rem <= k) ev(s, 'tick', k);
        if (s.clock >= P.dur) {
          s.clock -= P.dur; s.idx = (s.idx + 1) % L.seq.length; setActive(s, L.seq[s.idx]);
          if (s.dead) return;
        }
      }
    }

    // ---- movement
    const a = s.active, gd = a.flip ? -1 : 1;
    let dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
    if (a.rev) dir = -dir;
    if (dir) s.face = dir;
    if (jumpPress) s.bufT = P.buffer; else s.bufT -= DT;

    const top = a.ice ? P.iceRun : P.run;
    let rate;
    if (s.ground) {
      if (a.ice) rate = dir ? P.accIce : P.decIce;
      else rate = dir ? (s.vx * dir < 0 ? P.turnG : P.accG) : P.decG;
    } else rate = dir ? P.accA : P.decA;
    if (dir && s.vx * dir > top) rate = (s.ground && !a.ice) ? P.decG : P.overA;   // keep momentum in the air / on ice
    s.vx = approach(s.vx, dir * top, rate * DT);

    s.vy += P.grav * gd * DT;
    if (s.vy * gd > P.maxFall) s.vy = P.maxFall * gd;
    if (s.ground) s.coyT = P.coyote; else s.coyT -= DT;
    if (s.bufT > 0 && s.coyT > 0) {
      s.vy = -P.jumpV * gd; s.bufT = 0; s.coyT = 0; s.jumping = true; s.ground = false; ev(s, 'jump');
    }
    if (s.jumping) {
      if (s.vy * gd >= 0) s.jumping = false;
      else if (!inp.jump) { s.vy *= P.cut; s.jumping = false; }
    }

    const wasGround = s.ground, vyBefore = s.vy;
    moveX(s, s.vx * DT);
    s.ground = false;
    moveY(s, s.vy * DT, gd);
    if (s.ground && !wasGround) ev(s, 'land', Math.abs(vyBefore));
    s.airT = s.ground ? 0 : s.airT + DT;
    s.prevJump = inp.jump; s.prevFreeze = inp.freeze;

    // ---- hazards
    const x0 = s.x + 0.1, x1 = s.x + P.w - 0.1, y0 = s.y + 0.1, y1 = s.y + P.h - 0.1;
    for (let r = Math.floor(y0); r <= Math.floor(y1); r++) for (let c = Math.floor(x0); c <= Math.floor(x1); c++) {
      const h = hazardRect(tile(L, c, r), c, r);
      if (h && x1 > h[0] && x0 < h[2] && y1 > h[1] && y0 < h[3]) { die(s, tile(L, c, r) === T.X ? 'corrupt' : 'spike'); return; }
    }
    if (s.y > L.H + 0.5 || s.y + P.h < -0.5) { die(s, 'fall'); return; }

    // ---- sweep
    const sw = L.lv.sweep;
    if (sw && s.cycleOn) {
      s.sweepT += DT;
      if (s.sweepT > sw.delay) s.sweepX += sw.speed * DT;
      if (s.x + P.w * 0.5 < s.sweepX) { die(s, 'sweep'); return; }
    }

    // ---- pickups
    const cx = s.x + P.w / 2, cy = s.y + P.h / 2;
    const near = (o, d) => Math.abs(o.x + 0.5 - cx) < d && Math.abs(o.y + 0.5 - cy) < d;
    L.freezes.forEach((o, i) => { if (!s.tf[i] && near(o, 0.72)) { s.tf[i] = true; s.charges = Math.min(P.maxCharges, s.charges + 1); ev(s, 'pick', i); } });
    L.frags.forEach((o, i) => { if (!s.tg[i] && near(o, 0.72)) { s.tg[i] = true; ev(s, 'frag', i); } });
    L.checks.forEach((o, i) => {
      if (s.cpi !== i && near(o, 0.8)) {
        s.cpi = i; s.cp = { x: o.x, y: o.y, charges: s.charges, tf: s.tf.slice(), tg: s.tg.slice(), i, idx: s.idx };
        ev(s, 'check', i);
      }
    });
    if (near(L.exit, 0.78)) { s.won = true; ev(s, 'win'); }
  }

  // light copy for search (shares the level)
  function snapshot(s) {
    const o = Object.assign({}, s);
    o.events = []; o.tf = s.tf.slice(); o.tg = s.tg.slice();
    return o;
  }
  // what the clock shows: seconds left in the current state, the next state, frozen?
  function clockInfo(s) {
    const L = s.L, n = L.seq.length;
    return { now: s.active, next: L.seq[(s.idx + 1) % n], left: n > 1 ? P.dur - s.clock : Infinity, frozen: s.freezeT, idx: s.idx, n, on: s.cycleOn };
  }

  root.GHCore = { P, DT, T, KINDS, parseState, load, create, spawn, step, snapshot, clockInfo, tile, solidAt, hitSolid, hazardRect };
})(typeof window !== 'undefined' ? window : globalThis);
