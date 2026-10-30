// Chrono Courier — deterministic tick engine (no DOM). Used by the game and by the test scripts.
// Every loop the world resets and every self (old loops replay their recorded inputs, the newest is live)
// acts in the same 0.2 s ticks. Same inputs => same result, always.
(function (root) {
  'use strict';
  const TICKS = 50, TICK_MS = 200, FRAG_DELAY = 3, SWITCH_DUR = 10, CONV_EVERY = 2;
  const DX = [0, 0, 1, 0, -1], DY = [0, -1, 0, 1, 0];
  const K = { FLOOR: 0, WALL: 1, PIT: 2, GOAL: 3, PLATE: 4, DOOR: 5, SWITCH: 6, CONV: 7, FRAG: 8, DOOM: 9, LASER: 10, SLOT: 11, FILLED: 12 };
  // actions: 0 wait, 1 up, 2 right, 3 down, 4 left, 5 interact (drop / pick up)
  const DEFS = {
    '#': { k: K.WALL }, '.': { k: K.FLOOR }, '~': { k: K.PIT }, ' ': { k: K.PIT },
    'S': { k: K.FLOOR, spawn: 1 }, 'P': { k: K.FLOOR, pkg: 1 }, 'G': { k: K.GOAL },
    'a': { k: K.PLATE, ch: 0 }, 'b': { k: K.PLATE, ch: 1 }, 'c': { k: K.PLATE, ch: 2 },
    'A': { k: K.DOOR, ch: 0 }, 'B': { k: K.DOOR, ch: 1 }, 'C': { k: K.DOOR, ch: 2 },
    '1': { k: K.SWITCH, ch: 0 }, '2': { k: K.SWITCH, ch: 1 }, '3': { k: K.SWITCH, ch: 2 },
    'X': { k: K.FLOOR, crate: 1 },
    '^': { k: K.CONV, dir: 1 }, '>': { k: K.CONV, dir: 2 }, 'v': { k: K.CONV, dir: 3 }, '<': { k: K.CONV, dir: 4 },
    '%': { k: K.FRAG }, '*': { k: K.DOOM, at: 25 },
  };

  // ---------------------------------------------------------------- levels
  // par = loops for 3 stars; each extra loop costs a star; maxLoops = par + 2
  const LEVELS = [
    { id: 1, par: 1, map: [
      '############',
      '#S.....#...#',
      '#.####.#.#.#',
      '#....#...#G#',
      '####.#####.#',
      '#P.........#',
      '############'] },
    { id: 2, par: 2, map: [
      '###########',
      '#a..#..P..#',
      '#...A.....#',
      '#S..#....G#',
      '###########'] },
    { id: 3, par: 1, map: [
      '#############',
      '#S...#...~..#',
      '#..X.A...~..#',
      '#....#.X.~.G#',
      '#a...#..P~..#',
      '#############'] },
    { id: 4, par: 2, map: [
      '##############',
      '#1S.P........#',
      '#.##########.#',
      '#.#.......GA.#',
      '#.##########.#',
      '#............#',
      '##############'] },
    { id: 5, par: 2, map: [
      '############',
      '#S...#....G#',
      '#.##.#.###.#',
      'L..........#',
      '#.##.#.###.#',
      '#P...#.....#',
      '############'], defs: { L: { k: K.LASER, dir: 2 } } },
    { id: 6, par: 1, map: [
      '#############',
      '#S...P.#....#',
      '#.##.v.#.##.#',
      '#.##.v.#....#',
      '#....v>=>>G.#',
      '#.##.~.#....#',
      '#############'], defs: { P: { k: K.CONV, dir: 3, pkg: 1 }, '=': { k: K.SLOT, dir: 2 } } },
    { id: 7, par: 1, map: [
      '###########',
      '#~~~~~~...#',
      '#P..~~~.X.#',
      '#...%%X..S#',
      '#~~~~~~...#',
      '#~~~~~~.G.#',
      '###########'] },
    { id: 8, par: 2, map: [
      '##########',
      '#P..#~~~~#',
      '#..v#~~~~#',
      '#%#=######',
      '#..v.....#',
      '#S.v...#G#',
      '##########'], defs: { '=': { k: K.SLOT, dir: 3 } } },
    { id: 9, par: 2, map: [
      '#############',
      '#S..#.....P.#',
      '#...A.......#',
      '#a..#..X....#',
      '#####.###.###',
      'L.........G.#',
      '#############'], defs: { L: { k: K.LASER, dir: 2 } } },
    { id: 10, par: 3, map: [
      '#############',
      '#a....S.....#',
      '#.#########.#',
      '#.#########.#',
      'L...........#',
      '######A######',
      '#P....G.....#',
      '#############'], defs: { L: { k: K.LASER, dir: 2 } } },
    { id: 11, par: 2, map: [
      '##############',
      '#P....#~~~#..#',
      '#.##..#~~~#..#',
      '#.#S..****...#',
      '#.##..#~~~#.G#',
      '#...>>>>>>=>.#',
      '##############'], defs: { '*': { k: K.DOOM, at: 15 }, '=': { k: K.SLOT, dir: 2 } } },
    { id: 12, par: 2, map: [
      '#############',
      '#S....#.....#',
      '#..X..A..b..#',
      '#a....#.....#',
      '#########B###',
      '#P.........G#',
      '#############'] },
    { id: 13, par: 2, map: [
      '#######L#####',
      '#S..#.....#.#',
      '#...A..P..B.#',
      '#a..#.....#.#',
      '###########G#',
      '#############'], defs: { L: { k: K.LASER, dir: 3, ch: 0 }, B: { k: K.DOOR, ch: 0, inv: 1 } } },
    { id: 14, par: 3, map: [
      '#############',
      '#a.++.S.....#',
      '#.####.####.#',
      'L...........#',
      '#########A###',
      '#G***B.P...##',
      '#############'], defs: { L: { k: K.LASER, dir: 2 }, B: { k: K.DOOR, ch: 0, inv: 1 }, '*': { k: K.DOOM, at: 30 }, '+': { k: K.DOOM, at: 12 } } },
  ];

  // ---------------------------------------------------------------- parsing
  function parse(L) {
    const rows = L.map, H = rows.length, W = Math.max(...rows.map(r => r.length)), n = W * H;
    const lv = {
      id: L.id, par: L.par, maxLoops: L.maxLoops || L.par + 2, W, H, n,
      kind: new Int8Array(n), ch: new Int8Array(n).fill(-1), dir: new Int8Array(n), at: new Int16Array(n), dur: new Int16Array(n), inv: new Int8Array(n),
      spawn: null, pkg: null, crates: [], doors: [], plates: [], switches: [], lasers: [], frags: [], dooms: [], goals: [], convs: [], dyn: [],
      doorIdx: new Int16Array(n).fill(-1), fragIdx: new Int16Array(n).fill(-1),
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = rows[y][x] || '#', i = y * W + x;
      const d = Object.assign({}, DEFS[c], (L.defs || {})[c]);
      if (d.k === undefined) throw new Error('level ' + L.id + ': unknown tile "' + c + '"');
      lv.kind[i] = d.k;
      if (d.ch !== undefined) lv.ch[i] = d.ch;
      if (d.dir) lv.dir[i] = d.dir;
      if (d.inv) lv.inv[i] = 1;
      if (d.k === K.DOOM) lv.at[i] = d.at || 25;
      if (d.k === K.SWITCH) lv.dur[i] = d.dur || SWITCH_DUR;
      if (d.spawn) lv.spawn = { x, y };
      if (d.pkg) lv.pkg = { x, y };
      if (d.crate) lv.crates.push({ x, y });
      if (d.k === K.DOOR) { lv.doorIdx[i] = lv.doors.length; lv.doors.push(i); }
      if (d.k === K.PLATE) lv.plates.push(i);
      if (d.k === K.SWITCH) lv.switches.push(i);
      if (d.k === K.LASER) lv.lasers.push(i);
      if (d.k === K.FRAG) { lv.fragIdx[i] = lv.frags.length; lv.frags.push(i); }
      if (d.k === K.DOOM) lv.dooms.push(i);
      if (d.k === K.GOAL) lv.goals.push(i);
      if (d.k === K.CONV || d.k === K.SLOT) lv.convs.push(i);
      if (d.k === K.FRAG || d.k === K.DOOM || d.k === K.PIT) lv.dyn.push(i);
    }
    if (!lv.spawn || !lv.pkg) throw new Error('level ' + L.id + ': needs S and P');
    return lv;
  }

  // ---------------------------------------------------------------- world
  function newWorld(lv, nBots) {
    const w = {
      t: 0, ground: Int8Array.from(lv.kind), frag: new Int8Array(lv.frags.length).fill(-1), bots: [],
      crates: lv.crates.map(c => ({ x: c.x, y: c.y, px: c.x, py: c.y, alive: 1 })),
      pkg: { x: lv.pkg.x, y: lv.pkg.y, px: lv.pkg.x, py: lv.pkg.y, s: 0, by: -1 },   // s: 0 lying, 1 carried, 2 lost, 3 delivered
      timers: [0, 0, 0], tmax: [1, 1, 1], chan: [0, 0, 0], open: new Uint8Array(lv.doors.length), swOcc: new Uint8Array(lv.switches.length),
      beams: [], ev: [], won: false, wonAt: -1,
    };
    for (let i = 0; i < nBots; i++) w.bots.push({ x: lv.spawn.x, y: lv.spawn.y, px: lv.spawn.x, py: lv.spawn.y, dir: 3, dead: 0, carry: 0, moved: 0 });
    settle(lv, w, true);
    return w;
  }

  function clone(w) {
    return {
      t: w.t, ground: w.ground.slice(), frag: w.frag.slice(), bots: w.bots.map(b => Object.assign({}, b)), crates: w.crates.map(c => Object.assign({}, c)),
      pkg: Object.assign({}, w.pkg), timers: w.timers.slice(), tmax: w.tmax.slice(), chan: w.chan.slice(), open: w.open.slice(), swOcc: w.swOcc.slice(),
      beams: w.beams, ev: [], won: w.won, wonAt: w.wonAt,
    };
  }

  const inB = (lv, x, y) => x >= 0 && y >= 0 && x < lv.W && y < lv.H;
  function crateAt(w, x, y) { for (let i = 0; i < w.crates.length; i++) { const c = w.crates[i]; if (c.alive && c.x === x && c.y === y) return i; } return -1; }
  function wreckAt(w, x, y) { for (const b of w.bots) if (b.dead === 1 && b.x === x && b.y === y) return true; return false; }
  function bodyAt(w, x, y) { for (const b of w.bots) if (b.dead <= 1 && b.x === x && b.y === y) return true; return false; }
  function liveAt(w, x, y) { for (const b of w.bots) if (b.dead === 0 && b.x === x && b.y === y) return true; return false; }
  const pkgAt = (w, x, y) => w.pkg.s === 0 && w.pkg.x === x && w.pkg.y === y;
  function weightAt(w, x, y) { return bodyAt(w, x, y) || crateAt(w, x, y) >= 0; }   // presses plates / switches
  function closedDoor(lv, w, i) { const d = lv.doorIdx[i]; return d >= 0 && w.ground[i] === K.DOOR && !w.open[d]; }

  // 'ok' | 'fall' | false
  function botCanEnter(lv, w, x, y, conveyed) {
    if (!inB(lv, x, y)) return false;
    const i = y * lv.W + x, k = w.ground[i];
    if (k === K.WALL || k === K.LASER || k === K.SLOT) return false;
    if (closedDoor(lv, w, i)) return false;
    if (crateAt(w, x, y) >= 0 || wreckAt(w, x, y)) return false;
    if (k === K.PIT) return conveyed ? 'fall' : false;
    return 'ok';
  }
  function crateCanEnter(lv, w, x, y) {
    if (!inB(lv, x, y)) return false;
    const i = y * lv.W + x, k = w.ground[i];
    if (k === K.WALL || k === K.LASER || k === K.SLOT) return false;
    if (closedDoor(lv, w, i)) return false;
    if (crateAt(w, x, y) >= 0 || bodyAt(w, x, y) || pkgAt(w, x, y)) return false;
    return true;
  }
  function pkgCanEnter(lv, w, x, y) {
    if (!inB(lv, x, y)) return false;
    const i = y * lv.W + x, k = w.ground[i];
    if (k === K.WALL || k === K.LASER) return false;
    if (closedDoor(lv, w, i)) return false;
    if (crateAt(w, x, y) >= 0 || wreckAt(w, x, y)) return false;
    return true;
  }
  function moveCrate(lv, w, ci, x, y) {
    const c = w.crates[ci]; c.x = x; c.y = y;
    const i = y * lv.W + x;
    if (w.ground[i] === K.PIT) { c.alive = 0; w.ground[i] = K.FILLED; w.ev.push({ e: 'fill', x, y }); }
  }
  function loseBot(w, bi, how) {
    const b = w.bots[bi]; if (b.dead === 2) return;
    if (b.carry) { b.carry = 0; if (how === 'fry') { w.pkg.s = 0; w.pkg.by = -1; w.pkg.x = b.x; w.pkg.y = b.y; } else { w.pkg.s = 2; w.pkg.by = -1; w.ev.push({ e: 'lost', x: b.x, y: b.y }); } }
    b.dead = how === 'fry' ? 1 : 2;
    w.ev.push({ e: how, b: bi, x: b.x, y: b.y });
  }
  function tryPick(w, bi) {
    const b = w.bots[bi];
    if (b.dead || b.carry || !pkgAt(w, b.x, b.y)) return false;
    b.carry = 1; w.pkg.s = 1; w.pkg.by = bi; w.ev.push({ e: 'pick', b: bi, x: b.x, y: b.y }); return true;
  }

  function collapse(lv, w, i) {
    const x = i % lv.W, y = (i / lv.W) | 0;
    w.ground[i] = K.PIT; w.ev.push({ e: 'collapse', x, y });
    for (let b = 0; b < w.bots.length; b++) {
      const bot = w.bots[b];
      if (bot.x !== x || bot.y !== y) continue;
      if (bot.dead === 0) loseBot(w, b, 'fall');
      else if (bot.dead === 1) { bot.dead = 2; w.ev.push({ e: 'fall', b, x, y, wreck: 1 }); }
    }
    const ci = crateAt(w, x, y);
    if (ci >= 0) { w.crates[ci].alive = 0; w.ground[i] = K.FILLED; w.ev.push({ e: 'fill', x, y }); }
    if (pkgAt(w, x, y)) { w.pkg.s = 2; w.ev.push({ e: 'lost', x, y }); }
  }

  // plates, switches, doors, lasers, delivery (end of every tick; also once at the start)
  function settle(lv, w, init) {
    const plate = [0, 0, 0];
    for (const i of lv.plates) if (weightAt(w, i % lv.W, (i / lv.W) | 0)) plate[lv.ch[i]] = 1;
    for (let s = 0; s < lv.switches.length; s++) {
      const i = lv.switches[s], occ = weightAt(w, i % lv.W, (i / lv.W) | 0) ? 1 : 0;
      if (occ && !w.swOcc[s] && !init) { const c = lv.ch[i]; w.timers[c] = lv.dur[i]; w.tmax[c] = lv.dur[i]; w.ev.push({ e: 'switch', ch: c, x: i % lv.W, y: (i / lv.W) | 0 }); }
      w.swOcc[s] = occ;
    }
    for (let c = 0; c < 3; c++) {
      const on = plate[c] || w.timers[c] > 0 ? 1 : 0;
      if (on !== w.chan[c] && !init && plate[c] && !w.chan[c]) w.ev.push({ e: 'plate', ch: c });
      w.chan[c] = on;
    }
    for (let d = 0; d < lv.doors.length; d++) {
      const i = lv.doors[d], x = i % lv.W, y = (i / lv.W) | 0;
      let o = (w.chan[lv.ch[i]] ? 1 : 0) ^ lv.inv[i];
      if (!o && (bodyAt(w, x, y) || crateAt(w, x, y) >= 0 || pkgAt(w, x, y))) o = 1;   // jammed
      if (o !== w.open[d] && !init) w.ev.push({ e: 'door', x, y, open: o, ch: lv.ch[i] });
      w.open[d] = o;
    }
    const beams = [];
    for (const i of lv.lasers) {
      const ch = lv.ch[i];
      const on = ch < 0 ? true : (w.chan[ch] ? !!lv.inv[i] : !lv.inv[i]);
      const x0 = i % lv.W, y0 = (i / lv.W) | 0, dir = lv.dir[i];
      if (!on) { beams.push({ x0, y0, x1: x0, y1: y0, dir, on: false, hit: 0, ch }); continue; }
      let x = x0, y = y0, hit = 0;
      for (;;) {
        const nx = x + DX[dir], ny = y + DY[dir];
        if (!inB(lv, nx, ny)) break;
        const j = ny * lv.W + nx, k = w.ground[j];
        if (k === K.WALL || k === K.LASER || k === K.SLOT || closedDoor(lv, w, j) || crateAt(w, nx, ny) >= 0) { hit = 1; x = nx; y = ny; break; }
        x = nx; y = ny;
        if (bodyAt(w, nx, ny)) {
          hit = 2;
          for (let b = 0; b < w.bots.length; b++) { const bot = w.bots[b]; if (bot.dead === 0 && bot.x === nx && bot.y === ny) loseBot(w, b, 'fry'); }
          break;
        }
      }
      beams.push({ x0, y0, x1: x, y1: y, dir, on: true, hit, ch });   // beam covers the tiles between (x0,y0) exclusive and (x1,y1); hit 1 = stopped short of (x1,y1)
    }
    w.beams = beams;
    // delivery
    if (!w.won && w.pkg.s !== 2) {
      let px = -1, py = -1;
      if (w.pkg.s === 0) { px = w.pkg.x; py = w.pkg.y; }
      else if (w.pkg.s === 1) { const b = w.bots[w.pkg.by]; if (b && b.dead === 0) { px = b.x; py = b.y; } }
      if (px >= 0 && w.ground[py * lv.W + px] === K.GOAL) { w.pkg.s = 3; w.pkg.x = px; w.pkg.y = py; w.won = true; w.wonAt = w.t; w.ev.push({ e: 'deliver', x: px, y: py }); for (const b of w.bots) b.carry = 0; }
    }
  }

  // advance one tick. acts[i] = action of bot i (oldest loop first, live self last)
  function step(lv, w, acts) {
    w.ev = [];
    const tick = w.t;
    for (const b of w.bots) { b.px = b.x; b.py = b.y; b.moved = 0; }
    for (const c of w.crates) { c.px = c.x; c.py = c.y; }
    w.pkg.px = w.pkg.x; w.pkg.py = w.pkg.y;
    for (let c = 0; c < 3; c++) if (w.timers[c] > 0) w.timers[c]--;

    // 1. walking / pushing
    for (let bi = 0; bi < w.bots.length; bi++) {
      const b = w.bots[bi]; if (b.dead) continue;
      const a = acts[bi] | 0;
      if (a < 1 || a > 4) continue;
      b.dir = a;
      const nx = b.x + DX[a], ny = b.y + DY[a];
      const ci = inB(lv, nx, ny) ? crateAt(w, nx, ny) : -1;
      if (ci >= 0) {
        const cx = nx + DX[a], cy = ny + DY[a];
        if (crateCanEnter(lv, w, cx, cy) && !closedDoor(lv, w, ny * lv.W + nx)) {
          moveCrate(lv, w, ci, cx, cy); b.x = nx; b.y = ny; b.moved = 1;
          w.ev.push({ e: 'push', b: bi, x: cx, y: cy });
        } else w.ev.push({ e: 'bump', b: bi });
      } else if (botCanEnter(lv, w, nx, ny, false) === 'ok') { b.x = nx; b.y = ny; b.moved = 1; w.ev.push({ e: 'step', b: bi }); }
      else w.ev.push({ e: 'bump', b: bi });
    }
    // 2. interact + auto pick-up when stepping onto the package
    for (let bi = 0; bi < w.bots.length; bi++) {
      const b = w.bots[bi]; if (b.dead) continue;
      if ((acts[bi] | 0) === 5) {
        if (b.carry) { b.carry = 0; w.pkg.s = 0; w.pkg.by = -1; w.pkg.x = b.x; w.pkg.y = b.y; w.ev.push({ e: 'drop', b: bi, x: b.x, y: b.y }); }
        else tryPick(w, bi);
      } else if (b.moved) tryPick(w, bi);
    }
    for (const b of w.bots) if (b.carry) { w.pkg.x = b.x; w.pkg.y = b.y; }

    // 2b. a closed door or crate can't hold the package: a lying package blocks crates (handled in crateCanEnter)

    // 3. conveyors (every CONV_EVERY ticks)
    if (tick % CONV_EVERY === CONV_EVERY - 1 && lv.convs.length) {
      const onConv = (x, y) => { const k = w.ground[y * lv.W + x]; return k === K.CONV || k === K.SLOT; };
      const movers = [];
      if (w.pkg.s === 0 && onConv(w.pkg.x, w.pkg.y)) movers.push({ t: 'p' });
      w.crates.forEach((c, ci) => { if (c.alive && onConv(c.x, c.y)) movers.push({ t: 'c', i: ci }); });
      w.bots.forEach((b, bi) => { if (!b.dead && onConv(b.x, b.y)) movers.push({ t: 'b', i: bi }); });
      for (let pass = 0; pass < 4 && movers.some(m => !m.done); pass++) {
        for (const m of movers) {
          if (m.done) continue;
          const o = m.t === 'p' ? w.pkg : m.t === 'c' ? w.crates[m.i] : w.bots[m.i];
          if (m.t !== 'p' && (m.t === 'c' ? !o.alive : o.dead)) { m.done = 1; continue; }
          const d = lv.dir[o.y * lv.W + o.x], nx = o.x + DX[d], ny = o.y + DY[d];
          if (m.t === 'p') {
            if (pkgCanEnter(lv, w, nx, ny)) {
              o.x = nx; o.y = ny; m.done = 1;
              if (w.ground[ny * lv.W + nx] === K.PIT) { o.s = 2; w.ev.push({ e: 'lost', x: nx, y: ny }); }
            } else if (crateAt(w, nx, ny) < 0) m.done = 1;
          } else if (m.t === 'c') {
            if (crateCanEnter(lv, w, nx, ny)) { moveCrate(lv, w, m.i, nx, ny); m.done = 1; }
            else if (crateAt(w, nx, ny) < 0 && !(w.pkg.s === 0 && w.pkg.x === nx && w.pkg.y === ny && movers[0].t === 'p' && !movers[0].done)) m.done = 1;
          } else {
            const r = botCanEnter(lv, w, nx, ny, true);
            if (r) {
              o.x = nx; o.y = ny; o.moved = 1; m.done = 1;
              if (o.carry) { w.pkg.x = nx; w.pkg.y = ny; }
              if (r === 'fall') loseBot(w, m.i, 'fall');
              else tryPick(w, m.i);
            } else if (crateAt(w, nx, ny) < 0) m.done = 1;
          }
        }
      }
      if (movers.length) w.ev.push({ e: 'conv' });
    }

    // 4. collapsing floor
    for (let f = 0; f < lv.frags.length; f++) {
      const i = lv.frags[f];
      if (w.ground[i] !== K.FRAG) continue;
      if (w.frag[f] > 0) { w.frag[f]--; if (w.frag[f] === 0) collapse(lv, w, i); }
      else if (w.frag[f] < 0) {
        const x = i % lv.W, y = (i / lv.W) | 0;
        if (bodyAt(w, x, y) || crateAt(w, x, y) >= 0 || pkgAt(w, x, y) || (w.pkg.s === 1 && w.pkg.x === x && w.pkg.y === y)) { w.frag[f] = FRAG_DELAY; w.ev.push({ e: 'crack', x, y }); }
      }
    }
    for (const i of lv.dooms) if (w.ground[i] === K.DOOM && tick + 1 >= lv.at[i]) collapse(lv, w, i);

    // 5. plates, switches, doors, lasers, delivery
    w.t = tick + 1;
    settle(lv, w, false);
    return w;
  }

  // full-loop helper: recs = array of action arrays (one per self). Returns the final world (stops early on delivery).
  function run(lv, recs, opts) {
    const w = newWorld(lv, recs.length), hist = opts && opts.history ? [clone(w)] : null;
    for (let t = 0; t < TICKS && !w.won; t++) {
      step(lv, w, recs.map(r => r[t] | 0));
      if (hist) hist.push(clone(w));
    }
    if (hist) w.history = hist;
    return w;
  }
  const CODE = { '.': 0, u: 1, r: 2, d: 3, l: 4, x: 5, U: 1, R: 2, D: 3, L: 4, X: 5 };
  // "rrdd..x" style strings -> action arrays (digits repeat the next char: 5. = five waits)
  function decode(s) {
    const out = []; let rep = '';
    for (const ch of s.replace(/\s+/g, '')) {
      if (/[0-9]/.test(ch)) { rep += ch; continue; }
      const n = rep ? parseInt(rep, 10) : 1; rep = '';
      for (let i = 0; i < n; i++) out.push(CODE[ch] | 0);
    }
    while (out.length < TICKS) out.push(0);
    return out.slice(0, TICKS);
  }

  function key(lv, w) {
    let s = w.t + '|';
    for (const b of w.bots) s += b.x + ',' + b.y + ',' + b.dead + b.carry + ';';
    const cs = []; for (const c of w.crates) if (c.alive) cs.push(c.x * 64 + c.y);
    cs.sort((a, b) => a - b); s += cs.join(',') + '|' + w.pkg.x + ',' + w.pkg.y + ',' + w.pkg.s + '|';
    for (const i of lv.dyn) s += w.ground[i];
    s += '|' + w.frag.join(',') + '|' + w.timers.join(',') + '|' + w.swOcc.join('') + w.open.join('');
    return s;
  }

  const api = { TICKS, TICK_MS, FRAG_DELAY, SWITCH_DUR, CONV_EVERY, DX, DY, K, DEFS, LEVELS, parse, newWorld, clone, step, run, decode, key,
    crateAt, bodyAt, liveAt, wreckAt, pkgAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CCEngine = api;
})(typeof window !== 'undefined' ? window : this);
