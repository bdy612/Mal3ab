// Jelly Dash — the course builder and the rounds (every moving piece runs on the shared round clock T)
'use strict';

const CC = { pink: 0xff8cc6, rose: 0xff5d8f, mint: 0x6ee7c5, lemon: 0xffe36e, sky: 0x7cc7ff, lilac: 0xb9a4ff, orange: 0xffad5c, cream: 0xfff6e8, berry: 0xe8447a, grape: 0x8f6bff, teal: 0x2ed1a8, white: 0xffffff, red: 0xff4d6d };
const frac = (x) => x - Math.floor(x);
// a punch: fast out, hold, slow back, rest
function punchExt(u) { if (u < 0.1) { const k = u / 0.1; return 1 - (1 - k) * (1 - k); } if (u < 0.42) return 1; if (u < 0.8) { const k = (u - 0.42) / 0.38; return 1 - k * k * (3 - 2 * k); } return 0; }

function makeBuilder(scene, seed) {
  const rnd = mulberry(seed || 1);
  const addMesh = (geo, mat, cast, recv) => { const m = new THREE.Mesh(geo, mat); m.castShadow = !!cast; m.receiveShadow = recv !== false; m.rotation.order = 'YXZ'; scene.add(m); W.geos.push(geo); return m; };
  const mat = (c, pat, c2, shiny) => typeof c === 'object' ? c : candyMat(c, pat, c2, shiny);
  const B = {
    rnd, C: CC, mat,
    box(x, y, z, w, h, d, m, o) {
      o = o || {};
      const c = newCol(0, x, y, z, w / 2, h / 2, d / 2, o);
      if (!o.noMesh) { c.mesh = addMesh(boxGeo(w, h, d, o.ts), mat(m == null ? CC.cream : m), o.cast != null ? o.cast : !!o.fn || h > 1.5, true); c.mesh.position.set(x, y, z); c.mesh.rotation.set(c.rot[0], c.rot[1], c.rot[2]); }
      return c;
    },
    cyl(x, y, z, r, h, m, o) {
      o = o || {};
      const c = newCol(1, x, y, z, r, h / 2, r, o);
      if (!o.noMesh) { c.mesh = addMesh(cylGeo(r, h, o.seg || 28, o.ts, o.r2), mat(m == null ? CC.cream : m), o.cast != null ? o.cast : !!o.fn || h > 1.5, true); c.mesh.position.set(x, y, z); c.mesh.rotation.set(0, c.rot[1], 0); }
      return c;
    },
    deco(geo, m, x, y, z, rx, ry, rz, cast) { const me = addMesh(geo, mat(m), cast, false); me.position.set(x, y, z); me.rotation.set(rx || 0, ry || 0, rz || 0); return me; },
    floor(x0, x1, z0, z1, top, m, o) { o = o || {}; const th = o.th || 1.4; return B.box((x0 + x1) / 2, top - th / 2, (z0 + z1) / 2, x1 - x0, th, z1 - z0, m, o); },
    ramp(x0, x1, z0, z1, y0, y1, m, o) {
      o = o || {}; if (z1 < z0) { [z0, z1] = [z1, z0]; [y0, y1] = [y1, y0]; }
      const th = o.th || 1.2, L = Math.hypot(z1 - z0, y1 - y0), a = Math.atan2(y1 - y0, z1 - z0);
      return B.box((x0 + x1) / 2, (y0 + y1) / 2 - Math.cos(a) * th / 2, (z0 + z1) / 2 + Math.sin(a) * th / 2, x1 - x0, th, L, m, Object.assign({ rx: -a }, o));
    },
    // a candy-cane bar spinning around a post
    bar(x, y, z, len, speed, phase, o) {
      o = o || {}; const th = o.th || 0.56, base = o.base == null ? y - 0.75 : o.base, ang = o.angle || ((T) => phase + speed * T);
      const c = newCol(0, x, y, z, len / 2, th / 2, th / 2, { fn: (T, s) => { s.ry = ang(T); }, hit: 1 });
      const g = new THREE.CylinderGeometry(th / 2, th / 2, len, 14, 1); g.rotateZ(Math.PI / 2);
      const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * len * 0.8);
      c.mesh = addMesh(g, candyMat(o.c || CC.red, 'stripe', 0xffffff, true), true, true);
      for (const s of [-1, 1]) { const cap = addMesh(new THREE.SphereGeometry(th * 0.62, 12, 8), candyMat(o.c || CC.red, null, null, true), true); cap.position.set(s * len / 2, 0, 0); scene.remove(cap); c.mesh.add(cap); }
      if (o.post !== false) {
        const ph = y - base + 0.55; B.cyl(x, base + ph / 2, z, 0.5, ph, candyMat(CC.lemon, 'stripe', CC.orange, true), { cast: true });
        const hub = B.cyl(x, y, z, 0.85, 0.9, candyMat(CC.grape, 'dots', CC.lilac, true), { fn: (T, s) => { s.ry = ang(T); }, cast: true }); hub.nobot = true;
      }
      return c;
    },
    // a block that punches out from the side of the track (side = -1 left edge, 1 right edge)
    piston(side, edge, top, z, reach, o) {
      o = o || {}; const w = o.w || 6, h = o.h || 2.4, d = o.d || 2.6, P = o.period || 2.8, ph = o.phase || 0;
      const x0 = side * (edge + w / 2 + 0.2);
      const c = B.box(x0, top + h / 2, z, w, h, d, candyMat(o.c || CC.grape, 'tile', CC.lilac, true), { fn: (T, s) => { s.x = x0 - side * reach * punchExt(frac(T / P + ph)); }, hit: 1, cast: true });
      // a smiling bumper face on the punching end
      const face = addMesh(new THREE.CylinderGeometry(Math.min(h, d) * 0.38, Math.min(h, d) * 0.38, 0.12, 20), candyMat(CC.lemon, 'ring', CC.orange), false); face.rotation.set(0, 0, Math.PI / 2); scene.remove(face); face.position.set(-side * (w / 2 + 0.05), 0, 0); c.mesh.add(face);
      B.box(side * (edge + w + 1.3), top + h / 2, z, 1.6, h + 1.2, d + 1, candyMat(CC.pink, 'stripe', CC.white), { cast: true });
      return c;
    },
    seesaw(x, top, z, w, d, amp, P, ph, m) {
      const c = B.box(x, top - 0.4, z, w, 0.8, d, m || candyMat(CC.lemon, 'stripe', CC.orange), { fn: (T, s) => { s.rz = amp * Math.sin(TAU * (T / P + ph)); }, cast: true });
      const piv = addMesh(new THREE.ConeGeometry(1.1, 2.6, 4), candyMat(CC.grape), false, false); piv.position.set(x, top - 2.2, z); piv.rotation.set(Math.PI, Math.PI / 4, 0);
      return c;
    },
    disc(x, top, z, r, speed, o) {
      o = o || {}; const th = o.th || 1;
      const c = B.cyl(x, top - th / 2, z, r, th, candyMat(o.c || CC.mint, 'ring', o.c2 || CC.white), { fn: (T, s) => { s.ry = speed * T; }, cast: false });
      const n = o.bumps | 0;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, rb = r * 0.6;
        B.cyl(x, top + 0.5, z, 0.45, 1, candyMat(CC.rose, 'dots', CC.white, true), { fn: (T, s) => { const a = speed * T + a0; s.x = x + Math.cos(a) * rb; s.z = z - Math.sin(a) * rb; }, bump: 5.5, cast: true });
      }
      return c;
    },
    mover(x, top, z, w, d, axis, amp, P, ph, m) {
      return B.box(x, top - 0.45, z, w, 0.9, d, m || candyMat(CC.sky, 'tile', CC.white), { fn: (T, s) => { s[axis] += amp * Math.sin(TAU * (T / P + ph)); }, cast: true });
    },
    bumper(x, top, z, r, h) { return B.cyl(x, top + (h || 1.2) / 2, z, r, h || 1.2, candyMat(CC.rose, 'dots', CC.white, true), { bump: 11, cast: true }); },
    // hex tiles that drop after someone steps on them
    hexes(list, top, o) {
      o = o || {}; const R = o.R || 1.15, col = new THREE.Color(o.c || CC.pink), geo = new THREE.CylinderGeometry(R * 0.97, R * 0.88, 0.8, 6, 1);
      W.geos.push(geo);
      const im = new THREE.InstancedMesh(geo, new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 50 }), list.length);
      im.castShadow = true; im.receiveShadow = true; scene.add(im);
      const dum = new THREE.Object3D();
      list.forEach(([x, z], k) => {
        const i = W.tiles.length, c = newCol(1, x, top - 0.4, z, R * 0.985, 0.4, R * 0.985, {});
        c.tile = i;
        const cl = col.clone().offsetHSL(0, 0, ((k * 7) % 5 - 2) * 0.025);
        W.tiles.push({ x, y: top, z, st: 0, tt: 0, c, im, ii: k, col: cl, fy: 0, fall: o.fall || W.fallDelay, auto: Infinity, layer: o.layer || 0 });
        dum.position.set(x, top - 0.4, z); dum.updateMatrix(); im.setMatrixAt(k, dum.matrix); im.setColorAt(k, cl);
      });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      W.hexMs.push(im);
      return im;
    },
    hexRect(x0, x1, z0, z1, R, keep) {
      const dx = Math.sqrt(3) * R + 0.07, dz = 1.5 * R + 0.06, out = [];
      for (let row = 0, z = z0 + R; z <= z1 - R * 0.6; row++, z += dz) for (let x = x0 + (row % 2 ? dx / 2 : 0) + dx / 2 - 0.2; x <= x1 - dx / 2 + 0.4; x += dx) if (!keep || keep(x, z)) out.push([x, z]);
      return out;
    },
    hexDisk(cx, cz, rad, R, keep) { return B.hexRect(cx - rad - 2, cx + rad + 2, cz - rad - 2, cz + rad + 2, R, (x, z) => Math.hypot(x - cx, z - cz) <= rad && (!keep || keep(x, z))); },
    start(x, top, z, w, d) { W.spawn = { x, y: top, z, w, d, kind: 'grid' }; W.cps.push({ x, y: top, z, w, d }); },
    ring(x, top, z, r0, r1) { W.spawn = { x, y: top, z, r0, r1, kind: 'ring' }; W.cps.push({ x, y: top, z, w: r1, d: r1, ring: [r0, r1] }); },
    cp(x, top, z, w, d) {
      W.cps.push({ x, y: top, z, w, d });
      for (const s of [-1, 1]) {   // little flag posts
        const px = x + s * (w / 2 + 1.2);
        B.deco(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), candyMat(CC.white), px, top + 1.5, z - d / 2, 0, 0, 0, true);
        B.deco(new THREE.BoxGeometry(0.06, 0.8, 1.2), candyMat(CC.mint, 'check', CC.white), px, top + 2.55, z - d / 2 + 0.62, 0, 0, 0, false);
      }
    },
    finish(x, top, z, w) {
      W.finish = { x0: x - w / 2 - 0.6, x1: x + w / 2 + 0.6, y0: top - 1, y1: top + 6, z0: z, z1: z + 6 };
      for (const s of [-1, 1]) B.box(x + s * (w / 2 + 0.6), top + 2.6, z, 1.1, 5.2, 1.1, candyMat(CC.rose, 'stripe', CC.white, true), { cast: true });
      B.deco(new THREE.BoxGeometry(w + 2.4, 1.1, 0.9), candyMat(0x222233, 'check', 0xffffff), x, top + 5.6, z, 0, 0, 0, true);
      B.deco(new THREE.BoxGeometry(w, 0.05, 1.2), candyMat(0x222233, 'check', 0xffffff), x, top + 0.03, z + 0.4, 0, 0, 0, false);
    },
    path(nodes) { W.path = nodes.map(n => ({ x: n[0], y: n[1], z: n[2], w: n[3] == null ? 2 : n[3], f: n[4] || '' })); },
    slime(o) {
      W.slime = o;
      const geo = new THREE.PlaneGeometry(140, 420, 1, 1); geo.rotateX(-Math.PI / 2); W.geos.push(geo);
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        transparent: true, uniforms: { t: { value: 0 } },
        vertexShader: 'varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform float t; varying vec2 vW; void main(){ float a = sin(vW.x * 0.35 + t * 1.7) * cos(vW.y * 0.3 - t * 1.3) + sin((vW.x + vW.y) * 0.17 + t); vec3 c = mix(vec3(0.62, 0.95, 0.25), vec3(0.95, 0.4, 0.85), 0.25 + 0.2 * a); c += smoothstep(0.85, 1.3, a) * 0.35; gl_FragColor = vec4(c, 0.86); }'
      }));
      m.position.set(0, o.y0, 140); m.renderOrder = 2; scene.add(m); W.slimeM = m;
    },
    crown(x, y, z, fn) {
      const m = crownMesh(2.2); m.position.set(x, y, z); scene.add(m);
      m.traverse(o => { if (o.isMesh) o.castShadow = true; });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, opacity: 0.22, depthWrite: false })); m.add(glow);
      W.crown = { x, y, z, bx: x, by: y, bz: z, fn, m };
    },
    set(o) { Object.assign(W, o); },
    // giant sweets floating around the course (no collisions)
    scatter(z0, z1, n, o) {
      o = o || {}; const near = o.near || 16;
      const kinds = ['lolly', 'donut', 'gum', 'cane', 'lolly', 'cupcake'];
      for (let i = 0; i < n; i++) {
        const k = kinds[(rnd() * kinds.length) | 0], side = rnd() < 0.5 ? -1 : 1, x = (o.cx || 0) + side * (near + rnd() * 30), z = z0 + rnd() * (z1 - z0), y = -8 + rnd() * 22, s = 1.6 + rnd() * 2.4;
        B.sweet(k, x, y, z, s, rnd() * TAU);
      }
    },
    sweet(k, x, y, z, s, ry) {
      const col = [CC.rose, CC.mint, CC.lemon, CC.sky, CC.lilac, CC.orange][(rnd() * 6) | 0];
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g);
      const put = (geo, m, px, py, pz, rx, rz) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.rotation.set(rx || 0, 0, rz || 0); g.add(me); W.geos.push(geo); return me; };
      if (k === 'lolly') { put(new THREE.CylinderGeometry(0.12, 0.12, 4, 8), candyMat(CC.white), 0, -2, 0); put(new THREE.CylinderGeometry(1.4, 1.4, 0.45, 28), candyMat(col, 'swirl', 0xffffff), 0, 0.6, 0, Math.PI / 2); }
      else if (k === 'donut') { put(new THREE.TorusGeometry(1.1, 0.5, 12, 24), candyMat(col, 'dots', 0xffffff), 0, 0, 0, 1.1); }
      else if (k === 'gum') { put(new THREE.SphereGeometry(1.1, 16, 10, 0, TAU, 0, Math.PI / 2), candyMat(col, null, null, true), 0, 0, 0); put(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 16), candyMat(shadeC(col, -0.15)), 0, -0.2, 0); }
      else if (k === 'cane') { const m2 = candyMat(CC.red, 'stripe', 0xffffff); put(new THREE.CylinderGeometry(0.3, 0.3, 4, 10), m2, 0, -1, 0); put(new THREE.TorusGeometry(0.8, 0.3, 8, 14, Math.PI), m2, -0.8, 1, 0); }
      else { put(new THREE.CylinderGeometry(1, 0.75, 1.1, 16), candyMat(col, 'stripe', 0xffffff), 0, 0, 0); put(new THREE.SphereGeometry(1.05, 16, 10, 0, TAU, 0, Math.PI / 2), candyMat(CC.cream, 'dots', CC.rose), 0, 0.5, 0); put(new THREE.SphereGeometry(0.25, 8, 6), candyMat(CC.red, null, null, true), 0, 1.6, 0); }
      W.anim.push((T) => { g.position.y = y + Math.sin(T * 0.5 + x) * 0.6; g.rotation.y = ry + T * 0.05; });
    }
  };
  return B;
}

// ------------------------------------------------------------------ the rounds
// kind: race (first N through the finish), surv (last N standing), tail (hold a tail at the end), frace / fsurv (finals)
const JD_ROUNDS = (() => {
  const F = (c, c2) => candyMat(c, 'tile', c2 || 0xffffff);
  const rail = (B, x, z0, z1, top, c) => B.box(x, top + 0.45, (z0 + z1) / 2, 0.6, 0.9, z1 - z0, candyMat(c || CC.rose, 'stripe', 0xffffff, true));
  const R = [];

  // 1 — Sugar Rush: spinning bars, seesaws, spinning discs, punching walls
  R.push({ id: 'gaunt', kind: 'race', ico: '🍬', time: 150, build(B) {
    B.set({ killY: -14, view: 0, ai: 'path' });
    B.floor(-9, 9, -7, 9, 0, F(CC.pink)); B.start(0, 0, -1.5, 13, 8);
    B.floor(-9, 9, 9, 34, 0, F(CC.sky)); rail(B, -9.3, 9, 34, 0); rail(B, 9.3, 9, 34, 0);
    B.bar(-4.5, 0.75, 14.2, 8.4, 1.5, 0); B.bar(4.5, 0.75, 14.2, 8.4, -1.5, 0.8); B.bar(0, 0.75, 22.4, 8.4, 1.8, 1.2); B.bar(-4.5, 0.75, 30.2, 8.4, -1.9, 2.3); B.bar(4.5, 0.75, 30.2, 8.4, 1.9, 0.4);
    B.floor(-9, 9, 34, 40, 0, F(CC.mint)); B.cp(0, 0, 37, 13, 4);
    for (const [z, ph] of [[46.3, 0], [60.7, 0.3]]) { B.seesaw(-4.4, 0, z, 7.6, 12, 0.21, 4.6, ph); B.seesaw(4.4, 0, z, 7.6, 12, 0.21, 4.6, ph + 0.5); }
    B.floor(-9, 9, 68.5, 76, 0, F(CC.lemon, CC.orange)); B.cp(0, 0, 72, 13, 5);
    B.disc(-3, 0, 81, 4.3, 0.8, { bumps: 1 }); B.disc(3.4, 0, 89.4, 4.3, -0.95, { bumps: 2, c: CC.sky }); B.disc(-2.4, 0, 97.8, 4.3, 1.1, { bumps: 2, c: CC.lilac });
    B.floor(-7, 7, 103.5, 130, 0, F(CC.lilac));
    for (const [z, side, ph] of [[107.5, -1, 0], [112, 1, 0.3], [116.5, -1, 0.6], [121, 1, 0.15], [125.5, -1, 0.45]]) B.piston(side, 7, 0, z, 7.2, { phase: ph, period: 2.6 });
    B.floor(-9, 9, 130, 136, 0, F(CC.pink)); B.cp(0, 0, 133, 13, 4);
    B.ramp(-6, 6, 136, 150, 0, 3, F(CC.sky));
    B.floor(-8, 8, 150, 163, 3, F(CC.mint)); B.bar(0, 3.75, 154, 12, 1.7, 0.6);
    B.finish(0, 3, 157.5, 13);
    B.path([[0, 0, -1, 5], [0, 0, 9, 6], [0, 0, 33.5, 6], [0, 0, 39, 5], [[-4.4, 4.4], 0, 41, 1.6], [[-4.4, 4.4], 0, 51.8, 1.4], [[-4.4, 4.4], 0, 55.2, 1.6], [[-4.4, 4.4], 0, 66.2, 1.4], [0, 0, 70, 5], [-1.5, 0, 75.6, 3], [-3, 0, 81, 1.5], [3.4, 0, 89.4, 1.5], [-2.4, 0, 97.8, 1.5], [0, 0, 104.4, 2], [3.2, 0, 107.5, 1], [-3.2, 0, 112, 1], [3.2, 0, 116.5, 1], [-3.2, 0, 121, 1], [3.2, 0, 125.5, 1], [0, 0, 129.5, 2], [0, 0, 135, 4], [0, 3, 150.6, 4], [0, 3, 160, 4]]);
    B.scatter(-10, 170, 30);
  } });

  // 2 — Honey Hex: tiles that crumble, sliding platforms, more tiles
  R.push({ id: 'hexhop', kind: 'race', ico: '🍯', time: 150, build(B) {
    B.set({ killY: -14, view: 0, ai: 'path', fallDelay: 0.9, regrow: 4 });
    B.floor(-9, 9, -7, 9, 0, F(CC.lemon, CC.orange)); B.start(0, 0, -1.5, 13, 8);
    B.hexes(B.hexRect(-9, 9, 9.6, 34.4, 1.15, (x, z) => Math.hypot(x, z - 22) > 2.4), 0, { c: CC.orange, fall: 0.9 });
    B.cyl(0, -0.5, 22, 2, 1, F(CC.grape)); B.bar(0, 0.75, 22, 13, 1.25, 0, { base: 0 });
    B.floor(-9, 9, 35, 41, 0, F(CC.mint)); B.cp(0, 0, 38, 13, 4);
    [[45, 0], [51, 0.27], [57, 0.55], [63, 0.8]].forEach(([z, ph], i) => { B.mover(-4.4, 0, z, 4.6, 4.3, 'x', 2.6, 4.2 + i * 0.35, ph); B.mover(4.4, 0, z, 4.6, 4.3, 'x', 2.6, 4.2 + i * 0.35, ph); });
    B.floor(-9, 9, 66.6, 73, 0, F(CC.sky)); B.cp(0, 0, 69.8, 13, 4);
    const rr = mulberry(91);
    B.hexes(B.hexRect(-9, 9, 73.6, 99, 1.15, (x, z) => rr() > 0.1 && Math.hypot(x + 4.5, z - 80) > 2 && Math.hypot(x - 4.5, z - 91) > 2), 0, { c: CC.lilac, fall: 0.6 });
    B.cyl(-4.5, -0.5, 80, 1.8, 1, F(CC.pink)); B.bar(-4.5, 0.75, 80, 9, 1.6, 0, { base: 0, c: CC.teal });
    B.cyl(4.5, -0.5, 91, 1.8, 1, F(CC.pink)); B.bar(4.5, 0.75, 91, 9, -1.6, 1, { base: 0, c: CC.teal });
    B.floor(-9, 9, 99.6, 112, 0, F(CC.pink)); B.finish(0, 0, 104, 15);
    B.path([[0, 0, -1, 5], [0, 0, 9, 6], [0, 0, 34.5, 6], [0, 0, 40.5, 5], [[-4.4, 4.4], 0, 45, 1.2], [[-4.4, 4.4], 0, 51, 1.2], [[-4.4, 4.4], 0, 57, 1.2], [[-4.4, 4.4], 0, 63, 1.2], [0, 0, 67.6, 4], [0, 0, 72.6, 5], [0, 0, 99.5, 6], [0, 0, 107, 5]]);
    B.scatter(-10, 120, 26);
  } });

  // 3 — Slime Escape: climb while the slime rises
  R.push({ id: 'slime', kind: 'race', ico: '🟢', time: 160, build(B) {
    B.set({ killY: -30, view: 0, ai: 'path' });
    B.slime({ y0: -4, delay: 5, v: 0.45, a: 0.004 });
    B.floor(-8, 8, -7, 8, 0, F(CC.mint)); B.start(0, 0, -1.5, 12, 8);
    B.ramp(-7, 7, 8, 28, 0, 4, F(CC.sky));
    B.floor(-8, 8, 28, 44, 4, F(CC.pink)); B.bar(-3.9, 4.75, 32.6, 7.6, 1.5, 0, { base: 4 }); B.bar(3.9, 4.75, 39.6, 7.6, -1.7, 1, { base: 4 });
    for (let i = 0; i < 5; i++) B.floor(-7, 7, 44 + i * 3, 47 + i * 3, 5.2 + i * 1.2, F(i % 2 ? CC.lemon : CC.orange, CC.white));
    B.floor(-8, 8, 59, 68, 10, F(CC.lilac)); B.cp(0, 10, 63.5, 12, 6);
    B.seesaw(-3.7, 10, 75, 7, 12, 0.22, 4.2, 0); B.seesaw(3.7, 10, 75, 7, 12, 0.22, 4.2, 0.5);
    B.floor(-8, 8, 82, 87, 10, F(CC.pink));
    B.ramp(-6, 6, 87, 104, 10, 16, F(CC.sky)); B.bumper(-3, 12.2, 95, 0.7); B.bumper(3, 12.2, 97.5, 0.7);
    B.floor(-8, 8, 104, 112, 16, F(CC.mint)); B.cp(0, 16, 108, 12, 6);
    B.mover(0, 16.8, 115.5, 5.6, 4.4, 'x', 3, 5.6, 0); B.mover(0, 17.6, 121, 5.6, 4.4, 'x', 3, 6, 0.4); B.mover(0, 18.4, 126.5, 5.6, 4.4, 'x', 3, 6.4, 0.75);
    B.floor(-8, 8, 129.4, 137, 19.2, F(CC.lemon, CC.orange)); B.cp(0, 19.2, 133, 12, 5); B.ramp(-6.5, 6.5, 137, 139, 19.2, 20, F(CC.lemon, CC.orange));
    B.floor(-6.5, 6.5, 139, 156, 20, F(CC.lilac));
    for (const [z, s, ph] of [[141, -1, 0], [145.5, 1, 0.35], [150, -1, 0.65], [153.5, 1, 0.1]]) B.piston(s, 6.5, 20, z, 6.8, { phase: ph, period: 2.6, w: 5.4 });
    B.ramp(-6, 6, 156, 168, 20, 24, F(CC.pink));
    B.floor(-8, 8, 168, 178, 24, F(CC.mint)); B.finish(0, 24, 171.5, 13);
    B.path([[0, 0, -1, 4], [0, 0, 8, 5], [0, 4, 28.5, 5], [0, 4, 43.5, 5], [0, 5.2, 45.5, 4], [0, 6.4, 48.5, 4], [0, 7.6, 51.5, 4], [0, 8.8, 54.5, 4], [0, 10, 57.5, 4], [0, 10, 61, 5], [[-3.6, 3.6], 10, 68.6, 1.4], [[-3.6, 3.6], 10, 81, 1.2], [0, 10, 84, 4], [0, 16, 104.5, 4], [0, 16, 111.6, 3], [0, 16.8, 115.5, 0.6], [0, 17.6, 121, 0.6], [0, 18.4, 126.5, 0.6], [0, 19.2, 130.5, 4], [3.4, 20, 141, 1], [-3.4, 20, 145.5, 1], [3.4, 20, 150, 1], [-3.4, 20, 153.5, 1], [0, 20, 155.5, 2.5], [0, 24, 168.6, 4], [0, 24, 175, 4]]);
    B.scatter(-10, 190, 26, { near: 18 });
  } });

  // 4 — Big Whisk: dodge the spinning sweepers (survival)
  R.push({ id: 'sweep', kind: 'surv', ico: '🌀', time: 75, build(B) {
    B.set({ killY: -8, view: 0, ai: 'sweep', arena: { x: 0, z: 0, r: 13 } });
    B.cyl(0, -1, 0, 13.2, 2, candyMat(CC.pink, 'ring', CC.white), { seg: 48 });
    B.cyl(0, -2.6, 0, 12.4, 1.4, candyMat(CC.rose), { noCol: true, seg: 48 });
    const lowA = (T) => 0.75 * T + 0.0068 * T * T, hiA = (T) => Math.PI / 2 - (0.55 * T + 0.0052 * T * T);
    B.bar(0, 0.62, 0, 26.6, 0, 0, { angle: lowA, base: 0, th: 0.6, c: CC.red });
    B.bar(0, 2.25, 0, 22, 0, 0, { angle: hiA, post: false, th: 0.6, c: CC.teal });
    B.cyl(0, 1.5, 0, 0.7, 3, candyMat(CC.lemon, 'stripe', CC.orange, true), { cast: true });
    B.ring(0, 0, 0, 5, 10);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; B.sweet(i % 2 ? 'lolly' : 'gum', Math.cos(a) * 32, -4 + (i % 3) * 5, Math.sin(a) * 32, 2.6, a); }
  } });

  // 5 — Crumble Cake: three layers of falling tiles (survival)
  const tileBuild = (fin) => (B) => {
    const fall = fin ? 0.95 : 1.1;
    B.set({ killY: -24, view: 0, ai: 'tiles', arena: { x: 0, z: 0, r: 12 }, auto: { start: fin ? 30 : 40, span: fin ? 75 : 90 } });
    [[0, CC.pink], [-7, CC.mint], [-14, CC.lemon]].forEach(([y, c], li) => B.hexes(B.hexDisk(0, 0, 11.8 + li * 0.7, 0.9), y, { c, R: 0.9, fall, layer: li }));
    B.ring(0, 0, 0, 3.5, 9.5);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; B.sweet(['cupcake', 'lolly', 'donut'][i % 3], Math.cos(a) * 30, -10 + (i % 3) * 6, Math.sin(a) * 30, 2.8, a); }
  };
  R.push({ id: 'tiles', kind: 'surv', ico: '🧁', time: 90, build: tileBuild(false) });

  // 6 — Ribbon Grab: hold a candy tail when the time runs out
  R.push({ id: 'tail', kind: 'tail', ico: '🎀', time: 60, build(B) {
    B.set({ killY: -10, view: 0, ai: 'tail', arena: { x: 0, z: 0, r: 13.5, sq: 14.5 } });
    B.floor(-15, 15, -15, 15, 0, F(CC.lilac));
    for (const [x, z, w, d] of [[0, -15.4, 31.6, 0.8], [0, 15.4, 31.6, 0.8], [-15.4, 0, 0.8, 30], [15.4, 0, 0.8, 30]]) B.box(x, 0.8, z, w, 1.6, d, candyMat(CC.rose, 'stripe', 0xffffff, true));
    for (const [x, z] of [[-10, -10], [10, 10]]) { B.floor(x - 3, x + 3, z - 3, z + 3, 1.6, F(CC.mint)); }
    B.ramp(-12.5, -7.5, -4, -7, 0, 1.6, F(CC.sky)); B.ramp(7.5, 12.5, 4, 7, 0, 1.6, F(CC.sky));
    for (const [x, z] of [[10, -10], [-10, 10]]) B.floor(x - 3, x + 3, z - 3, z + 3, 0.6, F(CC.lemon, CC.orange));
    B.bumper(-6, 0, 0, 0.9); B.bumper(6, 0, 0, 0.9); B.bumper(0, 0, -6, 0.9); B.bumper(0, 0, 6, 0.9);
    B.cyl(0, -0.4, 0, 3.4, 0.8, candyMat(CC.pink, 'ring', CC.white)); B.bar(0, 0.62, 0, 7, 1.1, 0, { base: 0 });
    B.ring(0, 0, 0, 7, 12.5);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; B.sweet(['lolly', 'cane', 'donut', 'gum'][i % 4], Math.cos(a) * 30, -6 + (i % 3) * 6, Math.sin(a) * 30, 2.6, a); }
  } });

  // 7 — Crown Summit: the final race — grab the floating crown
  R.push({ id: 'crown', kind: 'frace', ico: '👑', time: 180, build(B) {
    B.set({ killY: -14, view: 0, ai: 'path' });
    B.floor(-9, 9, -7, 8, 0, F(CC.rose)); B.start(0, 0, -1.5, 13, 8);
    B.floor(-9, 9, 8, 26, 0, F(CC.sky)); B.bar(-4.5, 0.75, 13, 8.4, 1.9, 0); B.bar(4.5, 0.75, 13, 8.4, -1.9, 1); B.bar(0, 0.75, 21.4, 8.4, 2.1, 1.5);
    B.disc(-3, 1.5, 30.5, 4, 1.2, { bumps: 2 }); B.disc(3, 3, 38.5, 4, -1.3, { c: CC.sky, bumps: 2 }); B.disc(-2, 4.5, 46.3, 4, 1.5, { c: CC.lilac, bumps: 2 });
    B.floor(-8, 8, 50.8, 57, 4.5, F(CC.mint)); B.cp(0, 4.5, 54, 12, 4);
    B.floor(-6.5, 6.5, 57, 77, 4.5, F(CC.lilac));
    for (const [z, s, ph] of [[60.5, -1, 0], [64.5, 1, 0.3], [68.5, -1, 0.6], [72.5, 1, 0.1], [76, -1, 0.45]]) B.piston(s, 6.5, 4.5, z, 6.6, { phase: ph, period: 2.4, w: 5.4 });
    B.floor(-8, 8, 77, 83, 4.5, F(CC.pink)); B.cp(0, 4.5, 80, 12, 4);
    B.seesaw(-3.7, 4.5, 90, 7, 12, 0.24, 4, 0); B.seesaw(3.7, 4.5, 90, 7, 12, 0.24, 4, 0.5);
    B.floor(-8, 8, 96.8, 101, 4.5, F(CC.lemon, CC.orange));
    for (let i = 0; i < 3; i++) B.floor(-6, 6, 101 + i * 3, 104 + i * 3, 5.5 + i * 1.0, F(i % 2 ? CC.mint : CC.sky));
    B.cyl(0, 8.5 - 0.7, 119, 8.5, 1.4, candyMat(CC.rose, 'ring', CC.white), { seg: 40 }); B.cp(0, 8.5, 113, 10, 3);
    B.bar(0, 9.25, 119, 14, 1.15, 0.8, { base: 8.5, th: 0.55 });
    B.crown(0, 11.6, 119, (T, c) => { const a = T * 0.45; c.x = Math.cos(a) * 3.8; c.z = 119 + Math.sin(a) * 3.8; c.y = 11.55 + Math.sin(T * 2) * 0.25; });
    B.path([[0, 0, -1, 5], [0, 0, 8, 6], [0, 0, 25.5, 6], [-3, 1.5, 30.5, 1.4], [3, 3, 38.5, 1.4], [-2, 4.5, 46.3, 1.4], [0, 4.5, 51.6, 5], [0, 4.5, 56.5, 3], [3.2, 4.5, 60.5, 1], [-3.2, 4.5, 64.5, 1], [3.2, 4.5, 68.5, 1], [-3.2, 4.5, 72.5, 1], [3.2, 4.5, 76, 1], [0, 4.5, 78, 3], [0, 4.5, 82.6, 4], [[-3.6, 3.6], 4.5, 84.6, 1.3], [[-3.6, 3.6], 4.5, 96.2, 1.2], [0, 4.5, 99, 4], [0, 5.5, 102.5, 3], [0, 6.5, 105.5, 3], [0, 7.5, 108.5, 3], [0, 8.5, 112.5, 3], [0, 8.5, 119, 0, 'crown']]);
    B.scatter(-10, 135, 26);
  } });

  R.push({ id: 'tilefin', kind: 'fsurv', ico: '🎂', time: 160, build: tileBuild(true) });
  return R;
})();
const ROUND = Object.fromEntries(JD_ROUNDS.map(r => [r.id, r]));
