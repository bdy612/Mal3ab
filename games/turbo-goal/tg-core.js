// Turbo Goal — physics core: the arena shape, cars, ball, boost pads, kickoff spots and the bots' brains.
// Units: 1 unit ≈ 33 cm (a car is 3.6 long, the ball 5.6 wide). Fixed step 1/120 s. Nothing here draws anything.
// The arena is one signed-distance function (positive = free space), so the ball and the cars collide with the floor,
// the curved wall ramps, the walls, the ceiling, the goal boxes and the posts through the same two calls (sdf, normalAt).
(function () {
  'use strict';
  const V3 = THREE.Vector3, Q4 = THREE.Quaternion;
  // HW/HL: half width/length, H: height, RC: corner radius (seen from above), RF: floor/ceiling ramp radius,
  // GHW/GH/GD: goal half width/height/depth, GE: how far the goal box reaches into the field (flattens the ramp in the mouth)
  const A = { HW: 68, HL: 96, H: 40, RC: 22, RF: 9, GHW: 22, GH: 16, GD: 14, GE: 10, GR: 1.6, PR: 0.9 };
  const R = 2.8, GRAV = 19.5, BALL_M = 30, CAR_M = 180, BALL_MAXV = 180, BALL_MAXW = 6;
  const C = {
    HX: 1.25, HY: 0.55, HZ: 1.8, RIDE: 0.72, MAXV: 69, SUP: 66, SUP_OFF: 63, BOOST_G: 30, BOOST_AIR: 31, BRAKE: 105, COAST: 15.75,
    JUMP: 8.8, HOLD_A: 44, HOLD_T: 0.2, FLIP_WIN: 1.25, DODGE: 15, STICK: 10, USE: 33.3, FLIP_W: 10.5, FLIP_T: 0.62,
  };
  const STEP = 1 / 120;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const AX = new V3(1, 0, 0), AY = new V3(0, 1, 0), AZ = new V3(0, 0, 1);

  // ------------------------------------------------------------------ arena distance field
  function sdArena(x, y, z) {
    const qx = Math.abs(x) - (A.HW - A.RC), qz = Math.abs(z) - (A.HL - A.RC);
    const d2 = Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - A.RC;
    const wx = d2 + A.RF, wy = Math.abs(y - A.H / 2) - (A.H / 2 - A.RF);
    return -(Math.hypot(Math.max(wx, 0), Math.max(wy, 0)) + Math.min(Math.max(wx, wy), 0) - A.RF);
  }
  const GCZ = A.HL + (A.GD - A.GE) / 2, GHZ = (A.GD + A.GE) / 2;
  function sdGoal(x, y, z) {
    const r = A.GR, qx = Math.abs(x) - (A.GHW - r), qy = Math.abs(y - A.GH / 2) - (A.GH / 2 - r), qz = Math.abs(Math.abs(z) - GCZ) - (GHZ - r);
    return -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r);
  }
  function sdPosts(x, y, z) {
    const dz = Math.abs(z) - A.HL, ax = Math.abs(x);
    const dPost = Math.hypot(ax - A.GHW, y - clamp(y, 0, A.GH), dz);
    const dBar = Math.hypot(ax - Math.min(ax, A.GHW), y - A.GH, dz);
    return Math.min(dPost, dBar) - A.PR;
  }
  function sdf(x, y, z) {
    let f = sdArena(x, y, z);
    if (Math.abs(z) > A.HL - A.GE - 3 && Math.abs(x) < A.GHW + 3 && y < A.GH + 3) {
      const g = sdGoal(x, y, z); if (g > f) f = g;
      const p = sdPosts(x, y, z); if (p < f) f = p;
    }
    return f;
  }
  function normalAt(x, y, z, out) {
    const e = 0.03;
    const nx = sdf(x + e, y, z) - sdf(x - e, y, z), ny = sdf(x, y + e, z) - sdf(x, y - e, z), nz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(nx, ny, nz) || 1;
    return out.set(nx / l, ny / l, nz / l);
  }
  // a point that wandered out of the arena (should never happen) is brought back in
  function rescue(p) {
    if (sdf(p.x, p.y, p.z) > -2) return false;
    p.set(clamp(p.x, -A.HW + 6, A.HW - 6), clamp(p.y, 3, A.H - 3), clamp(p.z, -A.HL + 6, A.HL - 6));
    return true;
  }

  // ------------------------------------------------------------------ boost pads, kickoff and respawn spots
  const PADS = [];
  for (const [x, z] of [[-58, 0], [58, 0], [-54, -74], [54, -74], [-54, 74], [54, 74]]) PADS.push({ x, z, big: true });
  for (const [x, z] of [[0, 80], [28, 80], [-28, 80], [0, 60], [44, 58], [-44, 58], [18, 40], [-18, 40], [0, 22], [48, 24], [-48, 24]]) {
    PADS.push({ x, z, big: false }); PADS.push({ x: -x, z: -z, big: false });
  }
  PADS.push({ x: 26, z: 0, big: false }, { x: -26, z: 0, big: false });
  const KO = [[-37, -48], [37, -48], [-5, -70], [5, -70], [0, -84]];   // blue side; orange uses the point mirror (-x, -z)
  const KO_SETS = { 1: [[0], [1], [2], [3], [4]], 2: [[0, 1], [2, 3], [0, 4], [1, 4], [2, 1]], 3: [[0, 1, 4], [2, 3, 4], [0, 3, 4], [1, 2, 4]] };
  const RESP = [[-30, -84], [30, -84], [-12, -86], [12, -86]];

  // ------------------------------------------------------------------ bodies
  function makeBall() { return { pos: new V3(0, R, 0), vel: new V3(), w: new V3(), q: new Q4(), floorT: 0, hitSeq: 0 }; }
  function makeCar(o) {
    return {
      cid: o.cid, team: o.team | 0, name: o.name || '', kind: o.kind || 'bot', diff: o.diff || 'normal', owner: o.owner || null,
      design: o.design | 0, accent: o.accent | 0, trail: o.trail | 0,
      pos: new V3(), vel: new V3(), q: new Q4(), w: new V3(), n: new V3(0, 1, 0), jumpN: new V3(0, 1, 0), flipAx: new V3(),
      boost: 33, grounded: true, jumped: false, jumpT: 9, holding: false, dbl: false, flipT: -1, dodgeT: 9, airT: 0,
      sup: false, dead: false, demoT: 0, badT: 0, rightT: 0, hitCD: 0, boosting: false, sliding: false, jumpPrev: false, landT: 0,
      inp: { thr: 0, steer: 0, pitch: 0, roll: 0, jump: false, boost: false, slide: false },
      st: { score: 0, goals: 0, assists: 0, saves: 0, shots: 0, demos: 0, touches: 0 },
      ai: { mode: 'pos', tgt: new V3(), think: 0, seq: 0, seqT: 0, stuck: 0, rev: 0, aer: false, tBall: new V3(), cool: 0 },
    };
  }
  function placeCar(c, x, z, yaw) {
    c.pos.set(x, C.RIDE, z); c.vel.set(0, 0, 0); c.w.set(0, 0, 0); c.q.setFromAxisAngle(AY, yaw); c.n.set(0, 1, 0);
    c.grounded = true; c.jumped = false; c.dbl = false; c.flipT = -1; c.holding = false; c.airT = 0; c.badT = 0; c.rightT = 0;
    c.dead = false; c.demoT = 0; c.sup = false; c.boosting = false;
  }
  const yawTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

  // ------------------------------------------------------------------ ball
  const _bn = new V3(), _bc = new V3(), _bt = new V3(), _bd = new V3();
  // one ball step; returns the contact normal's y when it touched the arena (for "hit the floor" checks), else -2
  function ballMove(b, dt) {
    b.vel.y -= GRAV * dt;
    b.vel.multiplyScalar(1 - 0.0305 * dt);
    const sp = b.vel.length(); if (sp > BALL_MAXV) b.vel.multiplyScalar(BALL_MAXV / sp);
    b.pos.addScaledVector(b.vel, dt);
    let touch = -2;
    const f = sdf(b.pos.x, b.pos.y, b.pos.z);
    if (f < R) {
      const n = normalAt(b.pos.x, b.pos.y, b.pos.z, _bn);
      b.pos.addScaledVector(n, R - f);
      const vn = b.vel.dot(n);
      if (vn < 0) {
        const e = vn < -2.5 ? 0.6 : 0;
        // velocity of the contact point (spin included), then a friction impulse that turns slip into spin
        _bc.copy(n).multiplyScalar(-R); _bt.crossVectors(b.w, _bc).add(b.vel); _bt.addScaledVector(n, -_bt.dot(n));
        b.vel.addScaledVector(n, -(1 + e) * vn);
        const vt = _bt.length();
        if (vt > 1e-4) {
          const jt = Math.min(0.35 * (1 + e) * -vn, vt * 2 / 7);
          _bd.copy(_bt).multiplyScalar(-jt / vt);
          b.vel.add(_bd);
          _bc.crossVectors(n, _bd).multiplyScalar(-1 / (0.4 * R));
          b.w.add(_bc);
        }
        touch = n.y;
      }
    }
    const wl = b.w.length(); if (wl > BALL_MAXW) b.w.multiplyScalar(BALL_MAXW / wl);
    if (wl > 1e-5) { _bq.setFromAxisAngle(_bd.copy(b.w).multiplyScalar(1 / wl), wl * dt); b.q.premultiply(_bq); }
    if (rescue(b.pos)) b.vel.set(0, 0, 0);
    return touch;
  }
  const _bq = new Q4();

  // ------------------------------------------------------------------ car
  const _f = new V3(), _u = new V3(), _l = new V3(), _n = new V3(), _n2 = new V3(), _t = new V3(), _q = new Q4(), _q2 = new Q4(), _wl = new V3(), _qi = new Q4();
  function throttleAcc(s) { return s < 42 ? 48 - 43.2 * s / 42 : s < 42.3 ? 4.8 * (42.3 - s) / 0.3 : 0; }
  const CURV = [[0, 0.23], [15, 0.1327], [30, 0.0783], [45, 0.0458], [52.5, 0.0367], [69, 0.0293]];
  function curvature(s) {
    if (s >= 69) return 0.0293;
    for (let i = 1; i < CURV.length; i++) if (s < CURV[i][0]) { const a = CURV[i - 1], b = CURV[i], k = (s - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k; }
    return 0.0293;
  }
  function support(c, n) {   // how far the car's box reaches along n
    _t.copy(AX).applyQuaternion(c.q); let h = C.HX * Math.abs(_t.dot(n));
    _t.copy(AY).applyQuaternion(c.q); h += C.HY * Math.abs(_t.dot(n));
    _t.copy(AZ).applyQuaternion(c.q); h += C.HZ * Math.abs(_t.dot(n));
    return h;
  }
  function rotateBy(q, w, dt) {
    const wl = w.length(); if (wl < 1e-6) return;
    _q2.setFromAxisAngle(_t.copy(w).multiplyScalar(1 / wl), wl * dt); q.premultiply(_q2).normalize();
  }
  function alignUp(c, n, k) {   // turn the car so its roof faces n
    _u.copy(AY).applyQuaternion(c.q);
    if (_u.dot(n) < -0.999) return;
    _q.setFromUnitVectors(_u, n); _q2.identity().slerp(_q, k); c.q.premultiply(_q2).normalize();
  }

  function carStep(c, dt, W) {
    if (c.dead) return;
    const I = c.inp, frozen = W.frozen;
    c.jumpT += dt; c.dodgeT += dt; c.hitCD -= dt; c.landT += dt;
    const jumpPress = I.jump && !c.jumpPrev; c.jumpPrev = I.jump;
    c.boosting = !!I.boost && c.boost > 0 && !frozen;
    if (c.boosting && !W.infBoost) c.boost = Math.max(0, c.boost - C.USE * dt);
    c.sliding = !!I.slide && c.grounded;
    if (c.grounded) groundStep(c, dt, I, jumpPress, frozen);
    else airStep(c, dt, I, jumpPress, W);
    const sp = c.vel.length();
    if (sp > C.MAXV) c.vel.multiplyScalar(C.MAXV / sp);
    c.sup = c.sup ? sp > C.SUP_OFF : sp >= C.SUP;
    if (rescue(c.pos)) { c.vel.set(0, 0, 0); c.grounded = false; }
  }

  function groundStep(c, dt, I, jumpPress, frozen) {
    const n = c.n;
    alignUp(c, n, Math.min(1, dt * 18));
    const fwd = _f.copy(AZ).applyQuaternion(c.q); fwd.addScaledVector(n, -fwd.dot(n)).normalize();
    const left = _l.crossVectors(n, fwd);
    let vf = c.vel.dot(fwd), vl = c.vel.dot(left);
    const thr = frozen ? 0 : clamp(I.thr, -1, 1);
    let acc = 0;
    if (thr !== 0) {
      if (vf * thr >= 0 || Math.abs(vf) < 0.5) acc = thr * throttleAcc(Math.abs(vf));
      else acc = -Math.sign(vf) * C.BRAKE;
    } else if (!c.boosting) { const dec = C.COAST * dt; vf = Math.abs(vf) <= dec ? 0 : vf - Math.sign(vf) * dec; }
    if (c.boosting) acc += C.BOOST_G;
    vf += acc * dt;
    vl *= Math.exp(-(c.sliding ? 2.2 : 16) * dt);
    // gravity along the surface only: the car stays stuck to the floor, the ramps, the walls and the ceiling while it is fast enough
    const gf = -GRAV * fwd.y, gl = -GRAV * left.y;
    vf += gf * dt; vl += gl * dt;
    c.vel.copy(fwd).multiplyScalar(vf).addScaledVector(left, vl);
    // steering: the turn radius grows with speed; powerslide turns a bit sharper and lets the back slide out
    const yr = frozen ? 0 : -clamp(I.steer, -1, 1) * curvature(Math.abs(vf)) * vf * (c.sliding ? 1.4 : 1);
    _q.setFromAxisAngle(n, yr * dt); c.q.premultiply(_q).normalize();
    c.w.copy(n).multiplyScalar(yr);
    if (jumpPress && !frozen) {
      c.vel.addScaledVector(n, C.JUMP); c.jumpN.copy(n); c.grounded = false; c.jumped = true; c.jumpT = 0; c.holding = true;
      c.dbl = false; c.flipT = -1; c.airT = 0; c.w.set(0, 0, 0);
      c.pos.addScaledVector(c.vel, dt); return;
    }
    const speed = Math.hypot(vf, vl);
    if (n.y < 0.55 && speed < 9) {   // too slow for a wall or the ceiling: fall off
      c.grounded = false; c.jumped = false; c.airT = 0; c.vel.addScaledVector(n, 2.5); c.pos.addScaledVector(c.vel, dt); return;
    }
    const ox = c.pos.x, oy = c.pos.y, oz = c.pos.z;
    c.pos.addScaledVector(c.vel, dt);
    // nose / tail probe: a sharp surface ahead (goal walls, posts) is an obstacle, not a ramp to drive up
    const dir = vf >= 0 ? 1 : -1;
    _t.copy(c.pos).addScaledVector(fwd, dir * C.HZ * 0.95).addScaledVector(n, 0.1);
    const fp = sdf(_t.x, _t.y, _t.z);
    if (fp < 0.3) {
      const np = normalAt(_t.x, _t.y, _t.z, _n2);
      if (np.dot(n) < 0.85) {
        c.pos.addScaledVector(np, 0.3 - fp);
        const vn = c.vel.dot(np); if (vn < 0) c.vel.addScaledVector(np, -vn * 1.25);
      }
    }
    const f = sdf(c.pos.x, c.pos.y, c.pos.z);
    if (f > C.RIDE + 0.8) { c.grounded = false; c.jumped = false; c.airT = 0; return; }   // drove off an edge
    const nn = normalAt(c.pos.x, c.pos.y, c.pos.z, _n2);
    const ds = Math.hypot(c.pos.x - ox, c.pos.y - oy, c.pos.z - oz);
    const dAng = Math.acos(clamp(nn.dot(n), -1, 1));
    if (dAng > 0.02 && dAng > ds * 0.33 + 0.01) {   // a sharp corner under the car: bump off it, keep driving on the old surface
      const vn = c.vel.dot(nn); if (vn < 0) c.vel.addScaledVector(nn, -vn);
      c.pos.addScaledVector(nn, Math.max(0, C.RIDE * 0.6 - f));
    } else {
      c.pos.addScaledVector(nn, C.RIDE - f);
      n.copy(nn);
    }
  }

  function airStep(c, dt, I, jumpPress, W) {
    c.airT += dt;
    const q = c.q;
    const fwd = _f.copy(AZ).applyQuaternion(q), up = _u.copy(AY).applyQuaternion(q);
    if (c.holding) { if (I.jump && c.jumpT < C.HOLD_T) c.vel.addScaledVector(c.jumpN, C.HOLD_A * dt); else c.holding = false; }
    // second jump: a dodge when a direction is held, else a double jump (within 1.25 s of the first jump / leaving the ground)
    if (jumpPress && !c.holding && !c.dbl && !W.frozen && (c.jumped ? c.jumpT < C.FLIP_WIN : c.airT < C.FLIP_WIN)) {
      const fi = clamp(I.pitch, -1, 1), si = clamp(I.steer, -1, 1), mag = Math.hypot(fi, si);
      c.dbl = true;
      if (mag > 0.35) {
        const fx = Math.abs(fwd.y) > 0.95 ? -up.x * Math.sign(fwd.y) : fwd.x, fz = Math.abs(fwd.y) > 0.95 ? -up.z * Math.sign(fwd.y) : fwd.z;
        const fl = Math.hypot(fx, fz) || 1, hx = fx / fl, hz = fz / fl;   // forward on the ground plane; left = (hz, -hx)
        const k = mag > 1 ? 1 / mag : 1, df = fi * k, dsd = si * k;
        const vh = Math.hypot(c.vel.x, c.vel.z);
        const fImp = df >= 0 ? C.DODGE * df : C.DODGE * 1.07 * df, sImp = C.DODGE * dsd * (1 + 0.9 * vh / C.MAXV);
        c.vel.x += hx * fImp - hz * sImp; c.vel.z += hz * fImp + hx * sImp;
        c.vel.y *= 0.3; if (c.vel.y < 0) c.vel.y *= 0.5;
        c.flipT = 0; c.dodgeT = 0; c.flipAx.set(df, 0, dsd).normalize();
        W.ev && W.ev.push({ e: 'dodge', c });
      } else {
        c.vel.addScaledVector(up, C.JUMP);
        W.ev && W.ev.push({ e: 'djump', c });
      }
    }
    // rotation: a dodge spins the car for ~0.6 s, else pitch / yaw / roll follow the stick (air roll = slide + steer)
    if (c.flipT >= 0) {
      c.flipT += dt;
      if (c.flipT < C.FLIP_T) c.w.copy(c.flipAx).multiplyScalar(C.FLIP_W).applyQuaternion(q);
      else { c.flipT = -1; c.w.multiplyScalar(0.3); }
    } else {
      _qi.copy(q).invert(); _wl.copy(c.w).applyQuaternion(_qi);
      const tp = clamp(I.pitch, -1, 1), ty = I.slide ? 0 : -clamp(I.steer, -1, 1), tr = I.slide ? clamp(I.steer, -1, 1) : clamp(I.roll, -1, 1);
      _wl.x = tp ? _wl.x + (tp * 5.5 - _wl.x) * Math.min(1, 8 * dt) : _wl.x * Math.exp(-3 * dt);
      _wl.y = ty ? _wl.y + (ty * 5.5 - _wl.y) * Math.min(1, 6.5 * dt) : _wl.y * Math.exp(-3 * dt);
      _wl.z = tr ? _wl.z + (tr * 5.5 - _wl.z) * Math.min(1, 11 * dt) : _wl.z * Math.exp(-3.5 * dt);
      c.w.copy(_wl).applyQuaternion(q);
    }
    rotateBy(q, c.w, dt);
    if (c.rightT > 0) {   // self-righting after landing on the roof or a side
      c.rightT -= dt; alignUp(c, c.n, Math.min(1, dt * 9)); c.w.multiplyScalar(0.8);
    }
    const g = c.flipT >= 0 && c.flipT < 0.15 ? GRAV * 0.2 : GRAV;
    c.vel.y -= g * dt;
    if (c.boosting) c.vel.addScaledVector(_f.copy(AZ).applyQuaternion(q), C.BOOST_AIR * dt);
    c.pos.addScaledVector(c.vel, dt);
    // touching a surface: land on the wheels, or bounce off on the roof / side
    const f = sdf(c.pos.x, c.pos.y, c.pos.z);
    if (f < C.HZ + 0.3) {
      const n = normalAt(c.pos.x, c.pos.y, c.pos.z, _n);
      const h = support(c, n);
      up.copy(AY).applyQuaternion(q);
      const ud = up.dot(n), vn = c.vel.dot(n);
      if (ud > 0.6 && f < Math.max(h, C.RIDE) + 0.05 && (vn < 3 || c.airT > 0.25)) {
        c.grounded = true; c.jumped = false; c.dbl = false; c.flipT = -1; c.holding = false; c.airT = 0; c.badT = 0; c.rightT = 0; c.landT = 0;
        if (vn < 0) c.vel.addScaledVector(n, -vn);
        c.pos.addScaledVector(n, C.RIDE - f); c.n.copy(n); c.w.set(0, 0, 0);
      } else if (f < h) {
        c.pos.addScaledVector(n, h - f);
        if (vn < 0) c.vel.addScaledVector(n, -vn * 1.2);
        c.vel.multiplyScalar(1 - 1.5 * dt); c.w.multiplyScalar(0.92);
        c.badT += dt; c.n.copy(n);
        if (c.badT > 0.45 && c.rightT <= 0) { c.rightT = 0.5; c.vel.addScaledVector(n, 5.5); c.jumped = false; c.dbl = false; }
      }
    } else if (c.badT > 0) c.badT = Math.max(0, c.badT - dt * 2);
  }

  // ------------------------------------------------------------------ hits: car ↔ ball, car ↔ car
  const _lb = new V3(), _cp = new V3(), _cn = new V3(), _rb = new V3(), _rc = new V3(), _vb = new V3(), _vc = new V3(), _vr = new V3(), _nn = new V3();
  // returns null (no hit) or the contact (the ball state is changed in place)
  function carBall(c, b, applyCar) {
    if (c.dead) return null;
    const dx0 = b.pos.x - c.pos.x, dy0 = b.pos.y - c.pos.y, dz0 = b.pos.z - c.pos.z;
    if (dx0 * dx0 + dy0 * dy0 + dz0 * dz0 > 27) return null;
    _qi.copy(c.q).invert();
    _lb.set(dx0, dy0, dz0).applyQuaternion(_qi);
    const cx = clamp(_lb.x, -C.HX, C.HX), cy = clamp(_lb.y, -C.HY, C.HY), cz = clamp(_lb.z, -C.HZ, C.HZ);
    let dx = _lb.x - cx, dy = _lb.y - cy, dz = _lb.z - cz, d = Math.hypot(dx, dy, dz);
    if (d >= R) return null;
    if (d < 1e-4) { d = 0; const l = _lb.length() || 1; dx = _lb.x / l; dy = _lb.y / l; dz = _lb.z / l; } else { dx /= d; dy /= d; dz /= d; }
    const n = _cn.set(dx, dy, dz).applyQuaternion(c.q);
    _cp.set(cx, cy, cz).applyQuaternion(c.q).add(c.pos);
    const pen = R - d;
    b.pos.addScaledVector(n, pen * (applyCar ? 0.92 : 1)); if (applyCar) c.pos.addScaledVector(n, -pen * 0.08);
    _rb.copy(_cp).sub(b.pos); _vb.crossVectors(b.w, _rb).add(b.vel);
    _rc.copy(_cp).sub(c.pos); _vc.crossVectors(c.w, _rc).add(c.vel);
    _vr.copy(_vb).sub(_vc);
    const vn = _vr.dot(n);
    if (vn >= 0) return null;
    const relSpeed = Math.min(_vr.length(), 138);
    const invM = 1 / BALL_M + 1 / CAR_M, j = -(1.15) * vn / invM;
    b.vel.addScaledVector(n, j / BALL_M); if (applyCar) c.vel.addScaledVector(n, -j / CAR_M);
    // friction: slip at the contact point becomes spin
    _vr.addScaledVector(n, -vn); const vt = _vr.length();
    if (vt > 1e-3) {
      const jt = Math.min(0.4 * j, vt * BALL_M / 3.5);
      _vr.multiplyScalar(-jt / vt);
      b.vel.addScaledVector(_vr, 1 / BALL_M);
      _vc.crossVectors(_rb, _vr).multiplyScalar(1 / (0.4 * BALL_M * R * R)); b.w.add(_vc);
    }
    // the extra "kick": strongest from the car's front, aimed from the car's centre, softer upward — so where you hit it matters
    if (c.hitCD <= 0) {
      const fwd = _f.copy(AZ).applyQuaternion(c.q);
      const nn = _nn.copy(b.pos).sub(c.pos); nn.y *= 0.35; nn.normalize(); nn.addScaledVector(fwd, -0.35 * nn.dot(fwd)).normalize();
      const s = relSpeed <= 15 ? 0.65 : relSpeed <= 69 ? 0.65 - 0.1 * (relSpeed - 15) / 54 : 0.55 - 0.25 * (relSpeed - 69) / 69;
      b.vel.addScaledVector(nn, relSpeed * s);
      c.hitCD = 0.1;
    }
    const sp = b.vel.length(); if (sp > BALL_MAXV) b.vel.multiplyScalar(BALL_MAXV / sp);
    b.hitSeq++;
    return { c, power: relSpeed, x: _cp.x, y: _cp.y, z: _cp.z };
  }

  const _pa = new V3(), _pb = new V3(), _fa = new V3(), _fb = new V3(), _cn2 = new V3();
  // two cars touching: bump, or demolish when a supersonic car hits an opponent nose-first. which: 0 = move both, 1 = only a, 2 = only b
  function carCar(a, b, which) {
    if (a.dead || b.dead) return null;
    const dx0 = a.pos.x - b.pos.x, dy0 = a.pos.y - b.pos.y, dz0 = a.pos.z - b.pos.z;
    if (dx0 * dx0 + dy0 * dy0 + dz0 * dz0 > 25) return null;
    _fa.copy(AZ).applyQuaternion(a.q); _fb.copy(AZ).applyQuaternion(b.q);
    let best = 9, bx = 0, by = 0, bz = 0;
    for (let i = -1; i <= 1; i += 2) for (let k = -1; k <= 1; k += 2) {
      const x = (b.pos.x + _fb.x * 0.95 * k) - (a.pos.x + _fa.x * 0.95 * i), y = (b.pos.y + _fb.y * 0.95 * k) - (a.pos.y + _fa.y * 0.95 * i), z = (b.pos.z + _fb.z * 0.95 * k) - (a.pos.z + _fa.z * 0.95 * i);
      const d = Math.hypot(x, y, z); if (d < best) { best = d; bx = x; by = y; bz = z; }
    }
    if (best >= 2.5) return null;
    const n = _cn2.set(bx, by, bz).multiplyScalar(1 / (best || 1)), pen = 2.5 - best;   // from a to b
    const ma = which === 2 ? 0 : which === 1 ? 1 : 0.5, mb = which === 1 ? 0 : which === 2 ? 1 : 0.5;
    a.pos.addScaledVector(n, -pen * ma); b.pos.addScaledVector(n, pen * mb);
    const closing = a.vel.dot(n) - b.vel.dot(n);
    if (closing <= 0) return null;
    if (a.team !== b.team) {
      if (a.sup && _fa.dot(n) > 0.55) return { demo: b, by: a };
      if (b.sup && -_fb.dot(n) > 0.55) return { demo: a, by: b };
    }
    const j = closing * 0.65;
    if (ma) a.vel.addScaledVector(n, -j * (which ? 1 : 1));
    if (mb) b.vel.addScaledVector(n, j);
    // a nose-first bump launches the other car
    if (_fa.dot(n) > 0.5 && mb && closing > 20) { b.vel.addScaledVector(n, closing * 0.35); b.vel.y += closing * 0.12; b.grounded = false; b.airT = 0; }
    else if (-_fb.dot(n) > 0.5 && ma && closing > 20) { a.vel.addScaledVector(n, -closing * 0.35); a.vel.y += closing * 0.12; a.grounded = false; a.airT = 0; }
    return { bump: closing };
  }

  // ------------------------------------------------------------------ ball prediction (shared by every bot)
  const PRED_N = 150, PRED_DT = 1 / 60;
  function predictBall(b, out) {
    const s = out.s || (out.s = makeBall());
    s.pos.copy(b.pos); s.vel.copy(b.vel); s.w.copy(b.w);
    const P = out.p || (out.p = new Float32Array(PRED_N * 3));
    for (let i = 0; i < PRED_N; i++) { ballMove(s, PRED_DT); P[i * 3] = s.pos.x; P[i * 3 + 1] = s.pos.y; P[i * 3 + 2] = s.pos.z; }
    out.n = PRED_N; out.dt = PRED_DT;
    return out;
  }
  // will the predicted ball go into this team's goal? returns the time (s) or -1
  function threat(pred, team) {
    const P = pred.p, sz = team === 0 ? -1 : 1;
    for (let i = 0; i < pred.n; i++) {
      const z = P[i * 3 + 2] * sz;
      if (z > A.HL + R * 0.6 && Math.abs(P[i * 3]) < A.GHW + 1) return i * pred.dt;
    }
    return -1;
  }

  // ------------------------------------------------------------------ bots
  const DIFF = {
    easy: { react: 0.32, thr: 0.82, boost: 0.25, dodge: 0, reach: 3.4, aerial: false, err: 6, speed: 0.8 },
    normal: { react: 0.14, thr: 1, boost: 0.8, dodge: 0.75, reach: 7.5, aerial: false, err: 2, speed: 0.95 },
    hard: { react: 0.05, thr: 1, boost: 1, dodge: 1, reach: 8.5, aerial: true, err: 0.4, speed: 1 },
  };
  function assignRoles(W) {
    for (let team = 0; team < 2; team++) {
      const mates = W.cars.filter(c => c.team === team && !c.dead);
      if (!mates.length) continue;
      const dz = team === 0 ? 1 : -1, b = W.ball.pos;
      const cost = (c) => {
        const d = Math.hypot(b.x - c.pos.x, b.z - c.pos.z) + Math.max(0, c.pos.y - 3) * 0.5;
        const ahead = (c.pos.z - b.z) * dz;   // > 0: the car is past the ball (between it and the other goal)
        return d + (ahead > 2 ? 30 + ahead * 1.2 : 0) - c.vel.length() * 0.15;
      };
      const sorted = mates.slice().sort((x, y) => cost(x) - cost(y));
      const back = mates.slice().sort((x, y) => (x.pos.z - y.pos.z) * dz);
      for (const c of mates) c.role = 'support';
      sorted[0].role = 'attack';
      if (mates.length === 3) { const g = back.find(c => c !== sorted[0]); if (g) g.role = 'goalie'; }
    }
  }
  const _bt2 = new V3(), _bl = new V3(), _bf = new V3(), _bu = new V3(), _bm = new THREE.Matrix4(), _bo = new V3();
  function nearPad(c, W, ownHalf) {
    let best = null, bd = 1e9;
    const dz = c.team === 0 ? 1 : -1;
    PADS.forEach((p, i) => {
      if (!p.big || !W.pads[i].on) return;
      if (ownHalf && p.z * dz > 10) return;
      const d = Math.hypot(p.x - c.pos.x, p.z - c.pos.z); if (d < bd) { bd = d; best = p; }
    });
    return best && bd < 70 ? best : null;
  }
  function botThink(c, W) {
    const D = DIFF[c.diff] || DIFF.normal, ai = c.ai, b = W.ball.pos, P = W.pred.p, team = c.team;
    const dz = team === 0 ? 1 : -1, ownZ = -dz * A.HL, oppZ = dz * A.HL;
    const role = c.role || 'attack';
    if (W.phase === 'kickoff' || W.kick) {
      const mates = W.cars.filter(o => o.team === team && !o.dead);
      const taker = mates.slice().sort((x, y) => (Math.hypot(x.pos.x, x.pos.z) - Math.hypot(y.pos.x, y.pos.z)) || (x.pos.x - y.pos.x) * dz)[0];
      if (taker === c) { ai.mode = 'kick'; ai.tgt.set(0, R, 0); return; }
      const pad = nearPad(c, W, true);
      ai.mode = 'pos';
      if (pad && c.boost < 60) ai.tgt.set(pad.x, 0, pad.z); else ai.tgt.set(c.pos.x * 0.3, 0, ownZ * 0.7);
      return;
    }
    const thr = threat(W.pred, team);
    // pick the earliest predicted ball the car can get to (low enough to reach)
    const reachTime = (x, z, y) => {
      const d = Math.hypot(x - c.pos.x, z - c.pos.z);
      const sp = Math.max(c.vel.length(), 15), vmax = (c.boost > 10 ? C.MAXV : 45) * D.speed;
      _bf.copy(AZ).applyQuaternion(c.q);
      const ang = Math.acos(clamp((_bf.x * (x - c.pos.x) + _bf.z * (z - c.pos.z)) / (Math.hypot(_bf.x, _bf.z) * d + 1e-6), -1, 1));
      return d / ((sp + vmax) / 2) + ang * 0.45 + (y > 4 ? (y - 4) * 0.05 : 0);
    };
    let ix = b.x, iy = b.y, iz = b.z, found = false, it = 0;
    const maxH = D.aerial && c.boost > 30 ? 22 : D.reach + R;
    for (let i = 3; i < W.pred.n; i += 3) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], t = i * W.pred.dt;
      if (y > maxH) continue;
      if (reachTime(x, z, y) <= t) { ix = x; iy = y; iz = z; it = t; found = true; break; }
    }
    if (!found) { const i = W.pred.n - 1; ix = P[i * 3]; iy = P[i * 3 + 1]; iz = P[i * 3 + 2]; it = i * W.pred.dt; }
    if (D.err) { ix += (Math.random() - 0.5) * D.err; iz += (Math.random() - 0.5) * D.err; }
    ai.tBall.set(ix, iy, iz); ai.it = it;
    const defend = thr >= 0 && thr < 2.6;
    let mode = role;
    if (mode === 'support' && (b.z - ownZ) * dz < 55) mode = 'goalie';
    if (defend && (role !== 'support' || W.cars.filter(o => o.team === team && !o.dead).length === 1)) mode = 'clear';
    if (role === 'attack' && !defend) mode = 'ball';
    if (role === 'goalie' && Math.abs(b.z - ownZ) < 45 && Math.abs(b.x) < 40) mode = 'clear';
    if (mode !== 'ball' && mode !== 'clear' && c.boost < 30 && D.boost > 0.5) { const pad = nearPad(c, W, role === 'goalie'); if (pad) { ai.mode = 'pad'; ai.tgt.set(pad.x, 0, pad.z); return; } }
    if (mode === 'ball' || mode === 'clear') {
      // hit it toward the other goal (attack) or away from ours (clear): aim from the target through the ball
      let ax, az;
      if (mode === 'ball') { ax = ix - clamp(ix * 0.3, -A.GHW + 6, A.GHW - 6); az = iz - oppZ; }
      else { ax = ix - 0; az = iz - ownZ * 1.15; }
      const al = Math.hypot(ax, az) || 1; ax /= al; az /= al;
      const dist = Math.hypot(ix - c.pos.x, iz - c.pos.z);
      const ahead = (c.pos.z - iz) * dz;
      let off = clamp(dist * 0.32, R * 0.7, 13);
      if (mode === 'ball' && ahead > 3 && dist < 40) {   // on the wrong side of the ball: swing round it on the goal side
        const side = c.pos.x > ix ? 1 : -1;
        ai.tgt.set(ix + side * 9, 0, iz - dz * 14); ai.mode = 'pos'; ai.face = false; return;
      }
      ai.tgt.set(ix + ax * off, iy, iz + az * off); ai.mode = mode;
      ai.aer = D.aerial && iy > 9 && c.boost > 25;
      return;
    }
    if (mode === 'goalie') {
      ai.tgt.set(clamp(b.x * 0.35, -A.GHW + 5, A.GHW - 5), 0, ownZ + dz * 7); ai.mode = 'pos'; ai.face = true; return;
    }
    // support: shadow between the ball and our goal
    const sx = b.x * 0.55 + (c.pos.x > b.x ? 10 : -10), sz = b.z - dz * 30;
    ai.tgt.set(clamp(sx, -A.HW + 10, A.HW - 10), 0, clamp(sz, -A.HL + 12, A.HL - 12)); ai.mode = 'pos'; ai.face = true;
  }
  function botControl(c, W, dt) {
    const D = DIFF[c.diff] || DIFF.normal, ai = c.ai, I = c.inp;
    if (c.dead) { I.thr = I.steer = I.pitch = I.roll = 0; I.jump = I.boost = I.slide = false; return; }
    ai.think -= dt;
    if (ai.think <= 0) { ai.think = D.react * (0.7 + Math.random() * 0.6); botThink(c, W); }
    const fwd = _bf.copy(AZ).applyQuaternion(c.q), up = _bu.copy(AY).applyQuaternion(c.q);
    const left = _bl.crossVectors(up, fwd);
    const tgt = ai.tgt, b = W.ball.pos;
    _bt2.copy(tgt).sub(c.pos);
    const lz = _bt2.dot(fwd), lx = _bt2.dot(left), dist = Math.hypot(lx, lz);
    const ang = Math.atan2(lx, lz);
    const speed = c.vel.length();
    I.pitch = 0; I.roll = 0; I.slide = false;
    let thr = D.thr, steer = clamp(-ang * 2.8, -1, 1), boost = false;
    const attackish = ai.mode === 'ball' || ai.mode === 'clear' || ai.mode === 'kick';
    if (ai.mode === 'pos' || ai.mode === 'pad') {
      if (ai.mode === 'pos' && dist < 14) thr = clamp(dist / 14, 0.05, 1) * (Math.abs(ang) > 1.2 ? 0.6 : 1);
      if (ai.mode === 'pos' && dist < 3.5) thr = Math.abs(ang) < 1.5 ? 0 : 0.3;
      if (dist > 45 && Math.abs(ang) < 0.3 && c.boost > 45 && D.boost > 0.5) boost = true;
    } else {
      if (Math.abs(ang) < 0.35 && speed < C.MAXV - 2 && c.boost > 0 && Math.random() < D.boost) boost = true;
      if (ai.mode === 'kick') boost = D.boost > 0.2 || Math.random() < 0.5;
    }
    if (Math.abs(ang) > 1.55 && speed > 22 && c.grounded) I.slide = true;
    // stuck against something: back off for a moment
    if (c.grounded && speed < 3 && thr > 0.5) ai.stuck += dt; else ai.stuck = Math.max(0, ai.stuck - dt);
    if (ai.stuck > 1.2) { ai.rev = 0.7; ai.stuck = 0; }
    if (ai.rev > 0) { ai.rev -= dt; thr = -1; steer = -steer; boost = false; }
    // jumps: kickoff / close-range dodges, jump to reach a bouncing ball, simple aerials for hard bots
    const bdx = b.x - c.pos.x, bdy = b.y - c.pos.y, bdz = b.z - c.pos.z, bd = Math.hypot(bdx, bdy, bdz);
    const bAng = Math.atan2(bdx * left.x + bdy * left.y + bdz * left.z, bdx * fwd.x + bdy * fwd.y + bdz * fwd.z);
    let jump = false;
    if (ai.seq) {   // a dodge sequence in progress: jump, let go, jump again with the stick forward
      ai.seqT += dt;
      if (ai.seq === 1) { jump = ai.seqT < 0.07; if (ai.seqT > 0.1) { ai.seq = 2; ai.seqT = 0; } }
      else if (ai.seq === 2) { jump = true; I.pitch = 1; I.steer = 0; steer = clamp(-bAng * 1.5, -1, 1) * 0.5; if (ai.seqT > 0.05) { ai.seq = 3; ai.seqT = 0; } }
      else if (ai.seq === 3) { I.pitch = 1; if (ai.seqT > 0.7 || c.grounded) ai.seq = 0; }
      else if (ai.seq === 10) {   // aerial: jump, hold, then nose toward the ball and boost
        jump = ai.seqT < 0.2;
        if (ai.seqT > 0.24 && ai.seqT < 0.3) jump = true;   // second jump for height
        I.pitch = 0; steer = 0;
        if (c.grounded && ai.seqT > 0.4) ai.seq = 0;
        if (ai.seqT > 2.2) ai.seq = 0;
      }
      if (ai.seq === 2 || ai.seq === 3) { I.pitch = 1; steer = 0; }
    } else if (c.grounded && attackish && ai.cool <= 0) {
      const flat = bdy < 2.2;
      if (D.dodge > 0 && flat && bd < (ai.mode === 'kick' ? 12 : 8.5) && Math.abs(bAng) < 0.3 && speed > 22 && Math.random() < D.dodge * (ai.mode === 'kick' ? 1 : 0.35)) { ai.seq = 1; ai.seqT = 0; ai.cool = 1.5; }
      else if (bdy > 3 && bdy < D.reach && bd < 4 + bdy * 1.6 && Math.abs(bAng) < 0.5 && W.ball.vel.y < 6) { ai.seq = 10; ai.seqT = 0.15; ai.cool = 1.2; }
      else if (ai.aer && D.aerial && bdy > 9 && bd < bdy * 2.2 + 8 && Math.abs(bAng) < 0.35 && c.boost > 25) { ai.seq = 10; ai.seqT = 0; ai.cool = 2.5; }
    }
    ai.cool -= dt;
    if (!c.grounded) {
      thr = 0;
      if (ai.seq === 10 || (ai.aer && c.airT < 2)) {   // steer the nose at the ball and boost
        _bt2.copy(b).addScaledVector(W.ball.vel, 0.12).sub(c.pos).normalize();
        _q.setFromUnitVectors(fwd, _bt2); _q2.identity().slerp(_q, Math.min(1, dt * (D.aerial ? 5 : 3))); c.q.premultiply(_q2).normalize();
        boost = c.boost > 0 && fwd.dot(_bt2) > 0.8 && bdy > 1;
        c.w.multiplyScalar(0.9);
      } else if (ai.seq !== 2 && ai.seq !== 3 && c.flipT < 0) {   // land on the wheels, facing where it is going
        const vx = c.vel.x, vz = c.vel.z, vh = Math.hypot(vx, vz);
        _bt2.set(vh > 3 ? vx / vh : fwd.x, 0, vh > 3 ? vz / vh : fwd.z);
        if (_bt2.lengthSq() < 0.1) _bt2.set(0, 0, 1);
        _bt2.normalize();
        _bm.lookAt(_bo, _bt2.negate(), AY);
        _q.setFromRotationMatrix(_bm);
        c.q.slerp(_q, Math.min(1, dt * 3.2)); c.w.multiplyScalar(0.9);
      }
    }
    I.thr = thr; if (ai.seq !== 2 && ai.seq !== 3) I.steer = steer; I.boost = boost; I.jump = jump;
  }

  // ------------------------------------------------------------------ the world
  function makeWorld() {
    return { cars: [], ball: makeBall(), pads: PADS.map(() => ({ on: true, t: 0 })), frozen: false, infBoost: false, phase: 'play', ev: [], pred: {}, predT: 0, roleT: 0, t: 0 };
  }
  // one fixed step. sim: car -> should this device simulate it? (bots + local players; remote cars are moved elsewhere)
  // ballLocal: does this device move the ball; hits: which cars may touch the ball here
  function step(W, dt, opt) {
    opt = opt || {};
    W.t += dt;
    W.predT -= dt;
    if (W.predT <= 0) { W.predT = 0.08; predictBall(W.ball, W.pred); }
    W.roleT -= dt; if (W.roleT <= 0) { W.roleT = 0.25; assignRoles(W); }
    const cars = W.cars;
    for (const c of cars) {
      if (c.dead) { c.demoT -= dt; if (c.demoT <= 0 && opt.respawn !== false && (!opt.sim || opt.sim(c))) respawn(c, W); continue; }
      if (c.kind === 'bot' && (!opt.sim || opt.sim(c))) botControl(c, W, dt);
    }
    for (const c of cars) if (!c.dead && (!opt.sim || opt.sim(c))) carStep(c, dt, W);
    // car ↔ car
    for (let i = 0; i < cars.length; i++) for (let k = i + 1; k < cars.length; k++) {
      const a = cars[i], b = cars[k];
      const sa = !opt.sim || opt.sim(a), sb = !opt.sim || opt.sim(b);
      if (!sa && !sb) continue;
      const r = carCar(a, b, sa && sb ? 0 : sa ? 1 : 2);
      if (r && r.demo) {
        const may = !opt.demoOk || opt.demoOk(r.demo, r.by);
        if (may) W.ev.push({ e: 'demo', v: r.demo, by: r.by });
      } else if (r && r.bump > 15) W.ev.push({ e: 'bump', a, b, p: r.bump });
    }
    // ball
    if (opt.ballLocal !== false) {
      const t = ballMove(W.ball, dt);
      if (t > 0.7) W.ball.floorT = W.t;
      if (t > -2) { const sp = W.ball.vel.length(); if (sp > 12) W.ev.push({ e: 'wall', p: sp }); }
    }
    for (const c of cars) {
      if (c.dead || (opt.hits && !opt.hits(c))) continue;
      const h = carBall(c, W.ball, !opt.sim || opt.sim(c));
      if (h) W.ev.push({ e: 'touch', c, p: h.power, x: h.x, y: h.y, z: h.z });
    }
    // boost pads
    for (let i = 0; i < PADS.length; i++) {
      const s = W.pads[i]; if (!s.on) { if (opt.padTimers !== false) { s.t -= dt; if (s.t <= 0) s.on = true; } continue; }
      const p = PADS[i], rr = p.big ? 3.4 : 2.6;
      for (const c of cars) {
        if (c.dead || c.boost >= 100 || c.pos.y > 3.2 || (opt.sim && !opt.sim(c))) continue;
        const dx = c.pos.x - p.x, dz = c.pos.z - p.z;
        if (dx * dx + dz * dz < rr * rr) {
          s.on = false; s.t = p.big ? 10 : 4; c.boost = Math.min(100, c.boost + (p.big ? 100 : 12));
          W.ev.push({ e: 'pad', c, i, big: p.big }); break;
        }
      }
    }
  }
  function respawn(c, W) {
    const side = c.team === 0 ? 1 : -1, spots = RESP.slice().sort(() => Math.random() - 0.5);
    let s = spots[0];
    for (const q of spots) { const x = q[0] * side, z = q[1] * side; if (!W.cars.some(o => o !== c && !o.dead && Math.hypot(o.pos.x - x, o.pos.z - z) < 5)) { s = q; break; } }
    placeCar(c, s[0] * side, s[1] * side, c.team === 0 ? 0 : Math.PI);
    c.boost = 33; c.dead = false;
    W.ev.push({ e: 'respawn', c });
  }
  function demolish(c, W) { if (c.dead) return; c.dead = true; c.demoT = 3; c.vel.set(0, 0, 0); c.boosting = false; c.sup = false; }
  // kickoff: ball in the middle, cars on mirrored spots
  function kickoff(W, seed) {
    const b = W.ball; b.pos.set(0, R, 0); b.vel.set(0, 0, 0); b.w.set(0, 0, 0); b.q.identity(); b.hitSeq++;
    const rnd = mulberry(seed || (Math.random() * 1e9) | 0), pick = rnd();
    const spots = {};
    for (let team = 0; team < 2; team++) {
      const mates = W.cars.filter(c => c.team === team).sort(() => rnd() - 0.5);
      const n = Math.min(3, Math.max(1, mates.length)), sets = KO_SETS[n];
      const set = sets[Math.floor(pick * sets.length) % sets.length];
      mates.forEach((c, i) => {
        const k = set[i % set.length], sg = team === 0 ? 1 : -1;
        let x = KO[k][0] * sg, z = KO[k][1] * sg;
        if (i >= set.length) { x += (i - set.length + 1) * 6; }
        spots[c.cid] = [x, z, yawTo(x, z, 0, 0)];
      });
    }
    // same seed → same spots on every device (online), so the orange set mirrors the blue one
    for (const c of W.cars) { const s = spots[c.cid]; placeCar(c, s[0], s[1], s[2]); c.boost = 33; }
    W.pads.forEach(p => { p.on = true; p.t = 0; });
    return spots;
  }
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // is the ball on its way into a goal (straight-line + gravity check, for "shot" / "save" stats)
  function onTarget(b, goalTeam) {
    const gz = goalTeam === 0 ? -A.HL : A.HL, vz = b.vel.z;
    if ((gz - b.pos.z) * vz <= 0 || Math.abs(vz) < 4) return false;
    const t = (gz - b.pos.z) / vz; if (t > 3) return false;
    const x = b.pos.x + b.vel.x * t, y = b.pos.y + b.vel.y * t - 0.5 * GRAV * t * t;
    return Math.abs(x) < A.GHW + 1.5 && y < A.GH + 3 && y > -8;
  }

  window.TGCore = {
    A, R, GRAV, C, STEP, PADS, KO, BALL_M, CAR_M, DIFF,
    sdf, normalAt, makeBall, makeCar, placeCar, makeWorld, step, carStep, ballMove, carBall, carCar, kickoff, respawn, demolish,
    predictBall, threat, onTarget, mulberry, clamp, yawTo, rotateBy, curvature,
  };
})();
