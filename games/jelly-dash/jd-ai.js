// Jelly Dash — bots: follow the course path, jump bars and gaps, wait for punchers, hunt tails, hop between falling tiles
'use strict';

const BOTLV = [
  { spd: 0.8, react: 0.22, err: 0.3, wait: 0.45, dive: 0.1 },     // easy
  { spd: 0.87, react: 0.15, err: 0.16, wait: 0.8, dive: 0.45 },   // normal
  { spd: 0.975, react: 0.075, err: 0.045, wait: 0.95, dive: 0.85 } // hard
];
function botInit(j, lvl, r) {
  r = r || Math.random; lvl = clamp(lvl | 0, 0, 2);
  const L = BOTLV[lvl]; j.lvl = lvl; j.spd = L.spd + (r() - 0.5) * 0.05;
  j.aiS = { t: r() * 0.3, pi: 0, lat: (r() - 0.5) * 1.4, lane: r() < 0.5 ? 0 : 1, wait: 0, stuck: 0, tx: 0, tz: 0, re: 0, diveAt: 0, ti: -1, slack: 0.4 + r() * 0.6 };
  botResetPath(j);
}
function botResetPath(j) {
  const a = j.aiS; if (!a) return; const P = W.path; a.pi = 0;
  for (let i = 0; i < P.length - 1; i++) if (P[i + 1].z <= j.pos.z + 0.3 && Math.abs(P[i + 1].y - j.pos.y) < 3) a.pi = i + 1; else if (P[i + 1].z > j.pos.z + 0.3) break;
  a.wait = 0; a.stuck = 0; a.ti = -1;
}
const nodeX = (n, a) => Array.isArray(n.x) ? n.x[a.lane % n.x.length] : n.x;

function botStep(j, dt, T, ents) {
  const a = j.aiS, inp = j.ai; if (!a) return inp;
  const L = BOTLV[j.lvl] || BOTLV[1];
  inp.jump = false; inp.dive = false;
  if (a.diveAt > 0) { a.diveAt -= dt; if (a.diveAt <= 0 && !j.grounded && j.st === 0) inp.dive = true; }
  if (a.jumpIn > 0) { a.jumpIn -= dt; if (a.jumpIn <= 0 && j.st === 0) inp.jump = true; }
  if (a.boost > 0) { a.boost -= dt; const m = Math.hypot(inp.x, inp.z); if (m > 0.05 && m < 1) { inp.x /= m; inp.z /= m; } }   // keep full speed through a gap jump
  // stuck: wants to move but isn't
  const hs = Math.hypot(j.vel.x, j.vel.z);
  if (j.st === 0 && j.grounded && Math.hypot(inp.x, inp.z) > 0.5 && hs < 1.1) a.stuck += dt; else a.stuck = Math.max(0, a.stuck - dt * 2);
  a.t -= dt; if (a.t > 0) return inp;
  const tick = L.react * (0.7 + Math.random() * 0.6); a.t = tick;
  if (j.st !== 0 || j.fin || T < 0) { inp.x = inp.z = 0; inp.grab = false; return inp; }
  let tx = j.pos.x, tz = j.pos.z, mag = 1, tY = j.pos.y;
  inp.grab = false;
  if (W.ai === 'path') {
    const P = W.path; if (!P.length) return inp;
    while (a.pi < P.length - 1) {
      const nd = P[a.pi], nx = P[a.pi + 1], ndx = nodeX(nd, a), nnx = nodeX(nx, a);
      let dx = nnx - ndx, dz = nx.z - nd.z; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
      const px = j.pos.x - (nnx + a.lat * nx.w), pz = j.pos.z - nx.z;
      if ((px * dx + pz * dz > -0.45 || px * px + pz * pz < 1.2) && j.pos.y > nx.y - 2.5) { a.pi++; a.lat = (Math.random() - 0.5) * 1.6; a.wait = 0; } else break;
    }
    const ti = Math.min(a.pi + 1, P.length - 1), tn = P[ti];
    tx = nodeX(tn, a) + a.lat * tn.w; tz = tn.z; tY = tn.y;
    if (tn.f === 'crown' && W.crown) { tx = W.crown.x; tz = W.crown.z; const d = Math.hypot(tx - j.pos.x, tz - j.pos.z); if (d < 2.4 && j.grounded) { inp.jump = true; } if (d < 2.6) inp.grab = true; }
  } else if (W.ai === 'sweep' || W.ai === 'tiles') {
    const A = W.arena; a.re -= tick;
    let need = a.re <= 0 || Math.hypot(a.tx - j.pos.x, a.tz - j.pos.z) < 0.9;
    if (W.ai === 'tiles') {
      // stand still until my tile starts to shake, then hop to the safest tile next door
      const under = j.gObj && j.gObj.tile >= 0 ? W.tiles[j.gObj.tile] : null, tgt = a.ti >= 0 ? W.tiles[a.ti] : null;
      const bad = !tgt || tgt.st !== 0 || Math.abs(tgt.y - j.pos.y) > 1.5, dT = tgt ? Math.hypot(tgt.x - j.pos.x, tgt.z - j.pos.z) : 99;
      if (j.grounded && (bad || (dT < 0.6 && under && under.st !== 0) || (dT < 0.6 && !under))) {
        const wild = Math.random() < L.err * 2;
        let best = -1, bs = -1e9;
        for (let i = 0; i < W.tiles.length; i++) {
          const t = W.tiles[i]; if (t.st !== 0 || Math.abs(t.y - j.pos.y) > 1.2 || t === under) continue;
          const d = Math.hypot(t.x - j.pos.x, t.z - j.pos.z); if (d < 1.2 || d > (wild ? 5 : 2.05)) continue;
          if (Math.hypot(t.x - A.x, t.z - A.z) > A.r - 1.5) continue;
          let nb = 0; for (const o of W.tiles) if (o.st === 0 && o.layer === t.layer && Math.abs(o.x - t.x) < 1.9 && Math.abs(o.z - t.z) < 1.9) nb++;
          const sc = nb * 0.8 - d * 0.4 - Math.hypot(t.x - A.x, t.z - A.z) * 0.12 + Math.random() * (wild ? 4 : 1);
          if (sc > bs) { bs = sc; best = i; }
        }
        if (best >= 0) { a.ti = best; a.tx = W.tiles[best].x; a.tz = W.tiles[best].z; }
      }
      const t2 = a.ti >= 0 ? W.tiles[a.ti] : null, d2 = t2 ? Math.hypot(t2.x - j.pos.x, t2.z - j.pos.z) : 0;
      mag = !t2 ? 0.3 : d2 < 0.35 ? 0 : clamp(d2 / 1.2, 0.35, 0.6);
    } else {
      if (need) { const an = Math.random() * TAU, rr = 2 + Math.random() * A.r * 0.33; a.tx = A.x + Math.cos(an) * rr; a.tz = A.z + Math.sin(an) * rr; a.re = 1.5 + Math.random() * 2.5; }
      mag = 0.4 + a.slack * 0.25;
      if (Math.hypot(j.pos.x - A.x, j.pos.z - A.z) > A.r - 2.5) { a.tx = A.x; a.tz = A.z; mag = 1; }
    }
    tx = a.tx; tz = a.tz;
  } else if (W.ai === 'tail') {
    const A = W.arena; let best = null, bd = 1e9;
    for (const o of ents) { if (o === j || o.out || o.gone || !o.visible) continue; if (j.tail ? !o.tail : o.tail) { const d = Math.hypot(o.pos.x - j.pos.x, o.pos.z - j.pos.z); if (d < bd) { bd = d; best = o; } } }
    if (j.tail) {
      if (best && bd < 7) { tx = j.pos.x - (best.pos.x - j.pos.x) * 3; tz = j.pos.z - (best.pos.z - j.pos.z) * 3; }
      else { a.re -= tick; if (a.re <= 0) { a.tx = (Math.random() - 0.5) * 20; a.tz = (Math.random() - 0.5) * 20; a.re = 2; } tx = a.tx; tz = a.tz; mag = 0.6; }
      const lim = A.sq - 2.5; if (Math.abs(tx) > lim || Math.abs(tz) > lim) { tx = clamp(tx, -lim, lim) * 0.6; tz = clamp(tz, -lim, lim) * 0.6; }
    } else if (best) {
      tx = best.pos.x + best.vel.x * 0.3; tz = best.pos.z + best.vel.z * 0.3;
      if (bd < 1.9) inp.grab = true;
      if (bd < 4 && bd > 2.6 && Math.random() < L.dive * 0.25) inp.dive = true;
      if (best.pos.y > j.pos.y + 0.8 && bd < 5 && j.grounded) inp.jump = true;
    }
  }
  let dx = tx - j.pos.x, dz = tz - j.pos.z; const dl = Math.hypot(dx, dz);
  if (dl < 0.3) { mag = 0; dx = Math.sin(j.yaw); dz = Math.cos(j.yaw); if (W.ai === 'tiles') a.re = 0; }
  else { dx /= dl; dz /= dl; }
  // danger: a bar or puncher about to reach me
  const sp = PHYS.run * j.spd;
  if (j.grounded || j.coyote > 0) {
    // look ahead over the next ~half second (until my next think) for a sweeping bar at my feet
    let low = null, lowT = 0, fx = j.pos.x, fz = j.pos.z;
    const vx = (j.vel.x + dx * sp * mag) * 0.5, vz = (j.vel.z + dz * sp * mag) * 0.5;
    for (const tt of [0.12, 0.24, 0.36, 0.48]) { if (tt > tick + 0.3) break; const px = j.pos.x + vx * tt, pz = j.pos.z + vz * tt; const c = dangerAt(px, j.pos.y + 0.55, pz, 0.62, T + tt); if (c) { low = c; lowT = tt; fx = px; fz = pz; break; } }
    if (low) {
      const high = dangerAt(fx, j.pos.y + 2.1, fz, 0.5, T + lowT + 0.15);
      if (!high) { if (Math.random() > L.err) { const d = Math.max(0, lowT - 0.3 + (Math.random() - 0.5) * L.err * 0.3); if (d < 0.02) inp.jump = true; else a.jumpIn = d; } }
      else if (Math.random() < L.wait) {
        if (dangerAt(j.pos.x, j.pos.y + 1, j.pos.z, 0.7, T + 0.35)) { dx = -dx; dz = -dz; mag = 0.8; } else mag = 0;
      }
    } else if (W.ai === 'path' && Math.random() < L.wait) {
      // a puncher that will be in my way while I pass it: hold back (unless standing still is worse)
      let block = false;
      for (const d of [1.2, 2.4, 3.6]) { const px = j.pos.x + dx * d, pz = j.pos.z + dz * d, tt = T + d / sp + 0.12; if (dangerAt(px, j.pos.y + 1.1, pz, 0.75, tt) && dangerAt(px, j.pos.y + 2, pz, 0.6, tt)) { block = true; break; } }
      if (block && !dangerAt(j.pos.x, j.pos.y + 1, j.pos.z, 0.8, T + 0.3)) mag = 0;
    }
    // gaps and steps
    const g1 = Math.min(groundY(j.pos.x + dx * 0.62, j.pos.z + dz * 0.62, j.pos.y + 0.6), groundY(j.pos.x + dx * 1.1, j.pos.z + dz * 1.1, j.pos.y + 0.6));
    if (g1 < j.pos.y - 1.3 && mag > 0) {
      let land = 0;
      for (const d of [2.2, 3, 3.8, 4.6]) { const gy = groundY(j.pos.x + dx * d, j.pos.z + dz * d, j.pos.y + 1.7, T + 0.15 + d / Math.max(4, sp)); if (gy > j.pos.y - 3.5 && gy > tY - 4) { land = d; break; } }
      if (land || a.wait > 2.4) {
        if (Math.random() > L.err * 0.6) { inp.jump = true; mag = 1; a.boost = W.ai === 'tiles' ? 0.45 : 0.8; a.wait = 0; if (W.ai === 'path' && (land >= 3.8 || !land) && Math.random() < L.dive) a.diveAt = 0.26; }
      } else if (W.ai === 'tiles') { a.ti = -1; a.re = 0; dx = -dx; dz = -dz; mag = 0.4; }   // never stand still on crumbling tiles
      else { mag = 0; a.wait += tick; }
    } else {
      const g0 = groundY(j.pos.x + dx * 0.85, j.pos.z + dz * 0.85, j.pos.y + 2.2);
      if (g0 > j.pos.y + 0.32) inp.jump = true;
    }
    if (a.stuck > 0.45) { inp.jump = true; if (a.stuck > 2.4) { a.lat = (Math.random() - 0.5) * 1.8; a.stuck = 0; a.lane = 1 - a.lane; } }
    if (W.ai !== 'tiles' && Math.random() < 0.012) inp.jump = true;
  }
  inp.x = dx * mag; inp.z = dz * mag;
  return inp;
}
