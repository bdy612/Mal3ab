// Turbo Goal — everything that is drawn: the arena (floor, curved ramps, glass walls and ceiling, goals, stands),
// the low-poly cars, the ball, boost pads, blob shadows and one shared particle system. All art is procedural.
(function () {
  'use strict';
  const T = window.TGCore, A = T.A, R = T.R;
  const TEAM = [0x2d7dff, 0xff7a1a], TEAM_GLOW = [0x5aa2ff, 0xffa04a];
  const ACCENTS = [0xf4f6ff, 0x1b1e28, 0xffd23f, 0x7cf05a, 0x33e1ff, 0xff4fb3, 0x9d6bff, 0xff3b3b, 0xb8c0d0];
  const TRAILS = [[1, 0.55, 0.12], [0.3, 0.85, 1], [0.45, 1, 0.25], [0.7, 0.4, 1], [1, 0.4, 0.75]];
  const DESIGNS = 4;

  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.anisotropy = 4;
    return t;
  }

  // ------------------------------------------------------------------ arena
  function floorTexture() {
    const W = 1024, H = Math.round(1024 * A.HL / A.HW);
    return canvasTex(W, H, (g) => {
      const sx = W / (2 * A.HW), sz = H / (2 * A.HL), X = (x) => (x + A.HW) * sx, Z = (z) => (z + A.HL) * sz;
      const grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#0d2550'); grd.addColorStop(0.42, '#121a33'); grd.addColorStop(0.58, '#1f1a2e'); grd.addColorStop(1, '#4a2410');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      // mown stripes
      for (let i = 0; i < 24; i++) { if (i % 2) continue; g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(0, i * H / 24, W, H / 24); }
      // hex dots
      g.fillStyle = 'rgba(255,255,255,0.035)';
      for (let y = 0; y < H; y += 18) for (let x = (y / 18) % 2 ? 9 : 0; x < W; x += 18) { g.beginPath(); g.arc(x, y, 1.6, 0, 6.3); g.fill(); }
      g.lineCap = 'round';
      const line = (col, w) => { g.strokeStyle = col; g.lineWidth = w; };
      // glowing lines
      for (const pass of [[10, 0.12], [3.5, 0.85]]) {
        g.globalAlpha = pass[1];
        line('#e8f0ff', pass[0]);
        g.beginPath(); g.moveTo(X(-A.HW + 10), Z(0)); g.lineTo(X(A.HW - 10), Z(0)); g.stroke();
        g.beginPath(); g.arc(X(0), Z(0), 18 * sx, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(X(0), Z(0), 1.4 * sx, 0, Math.PI * 2); g.stroke();
        for (const s of [-1, 1]) {
          line(s < 0 ? '#8fc0ff' : '#ffc08a', pass[0]);
          const zg = s * A.HL, zb = s * (A.HL - 24);
          g.beginPath(); g.moveTo(X(-A.GHW - 10), Z(s * (A.HL - A.RF))); g.lineTo(X(-A.GHW - 10), Z(zb)); g.lineTo(X(A.GHW + 10), Z(zb)); g.lineTo(X(A.GHW + 10), Z(s * (A.HL - A.RF))); g.stroke();
          g.beginPath(); g.arc(X(0), Z(zb), 12 * sx, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : Math.PI * 2); g.stroke();
          g.beginPath(); g.moveTo(X(-A.GHW), Z(zg)); g.lineTo(X(A.GHW), Z(zg)); g.stroke();
        }
      }
      g.globalAlpha = 1;
      // team logos: a chevron on each half
      for (const s of [-1, 1]) {
        g.save(); g.translate(X(0), Z(s * 46)); g.scale(sx, sz); if (s > 0) g.rotate(Math.PI);
        g.fillStyle = s < 0 ? 'rgba(90,162,255,0.18)' : 'rgba(255,160,74,0.18)';
        for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(-10, 4 + k * 7); g.lineTo(0, -4 + k * 7); g.lineTo(10, 4 + k * 7); g.lineTo(10, 8 + k * 7); g.lineTo(0, 0 + k * 7); g.lineTo(-10, 8 + k * 7); g.closePath(); g.fill(); }
        g.restore();
      }
    });
  }
  const gridTex = () => canvasTex(64, 64, (g) => { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2; g.strokeRect(1, 1, 62, 62); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(30, 30, 4, 4); }, true);
  const hexTex = () => canvasTex(128, 74, (g, w, h) => {
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2;
    const r = 21, hx = (x, y) => { g.beginPath(); for (let i = 0; i <= 6; i++) { const a = Math.PI / 3 * i; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.stroke(); };
    hx(0, 0); hx(64, 0); hx(128, 0); hx(32, 37); hx(96, 37); hx(0, 74); hx(64, 74); hx(128, 74);
  }, true);
  const rampTex = () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#9aa6c8'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#8590b3'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
    g.strokeStyle = '#d5dcf2'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 125, 125);
  }, true);
  const crowdTex = () => canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#0a0d1a'; g.fillRect(0, 0, w, h);
    const cols = ['#5aa2ff', '#ffa04a', '#ffffff', '#ffd23f', '#ff6b9d', '#7cf05a', '#9aa3c7'];
    for (let y = 6; y < h; y += 12) for (let x = 4; x < w; x += 9) {
      if (Math.random() < 0.12) continue;
      g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.globalAlpha = 0.35 + Math.random() * 0.5;
      g.beginPath(); g.arc(x + Math.random() * 3, y + Math.random() * 3, 2.6, 0, 6.3); g.fill();
    }
    g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,0,0.5)'; for (let y = 0; y < h; y += 24) g.fillRect(0, y, w, 3);
  }, true);

  function perimeter() {   // the arena outline seen from above (counter-clockwise), with samples exactly at the goal posts
    const P = [], hw = A.HW - A.RC, hl = A.HL - A.RC;
    const straight = (x0, z0, x1, z1, nx, nz, extra) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.ceil(len / 6)), ts = [];
      for (let i = 0; i < n; i++) ts.push(i / n);
      for (const e of extra || []) ts.push(e);
      ts.sort((a, b) => a - b);
      for (const t of ts) P.push({ x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, nx, nz });
    };
    const arc = (cx, cz, a0) => { for (let i = 0; i < 10; i++) { const a = a0 + (Math.PI / 2) * i / 10; P.push({ x: cx + A.RC * Math.cos(a), z: cz + A.RC * Math.sin(a), nx: Math.cos(a), nz: Math.sin(a) }); } };
    const gt = (x0, x1) => [(A.GHW - x0) / (x1 - x0), (-A.GHW - x0) / (x1 - x0), (0 - x0) / (x1 - x0)].filter(t => t > 0 && t < 1);
    straight(hw, A.HL, -hw, A.HL, 0, 1, gt(hw, -hw)); arc(-hw, hl, Math.PI / 2);
    straight(-A.HW, hl, -A.HW, -hl, -1, 0); arc(-hw, -hl, Math.PI);
    straight(-hw, -A.HL, hw, -A.HL, 0, -1, gt(-hw, hw)); arc(hw, -hl, Math.PI * 1.5);
    straight(A.HW, -hl, A.HW, hl, 1, 0); arc(hw, hl, 0);
    return P;
  }
  function profile(part) {   // [inset, y] along the wall cross-section
    const out = [], RF = A.RF;
    if (part === 'low') { for (let k = 0; k <= 8; k++) { const a = (Math.PI / 2) * k / 8; out.push([RF * (1 - Math.sin(a)), RF * (1 - Math.cos(a))]); } out.push([0, A.GH]); }
    else { out.push([0, A.GH], [0, 24], [0, A.H - RF]); for (let k = 1; k <= 8; k++) { const a = Math.PI / 2 - (Math.PI / 2) * k / 8; out.push([RF * (1 - Math.sin(a)), A.H - RF + RF * Math.cos(a)]); } }
    return out;
  }
  function shellGeometry(part) {
    const P = perimeter(), F = profile(part), pos = [], col = [], uv = [], idx = [];
    const cB = new THREE.Color(TEAM_GLOW[0]), cO = new THREE.Color(TEAM_GLOW[1]), cM = new THREE.Color(0xc8d2ff), tmp = new THREE.Color();
    let su = 0; const us = [0];
    for (let i = 1; i <= P.length; i++) { const a = P[i - 1], b = P[i % P.length]; su += Math.hypot(b.x - a.x, b.z - a.z); us.push(su); }
    let sv = 0; const vs = [0];
    for (let j = 1; j < F.length; j++) { sv += Math.hypot(F[j][0] - F[j - 1][0], F[j][1] - F[j - 1][1]); vs.push(sv); }
    for (let i = 0; i <= P.length; i++) {
      const p = P[i % P.length];
      const k = p.z / A.HL; tmp.copy(cM).lerp(k < 0 ? cB : cO, Math.min(1, Math.abs(k) * 1.4));
      for (let j = 0; j < F.length; j++) {
        pos.push(p.x - p.nx * F[j][0], F[j][1], p.z - p.nz * F[j][0]);
        col.push(tmp.r, tmp.g, tmp.b); uv.push(us[i] / 4, vs[j] / 4);
      }
    }
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const mouth = Math.abs(a.nz) > 0.99 && Math.abs(b.nz) > 0.99 && Math.abs(a.x) <= A.GHW + 0.01 && Math.abs(b.x) <= A.GHW + 0.01;
      for (let j = 0; j < F.length - 1; j++) {
        if (mouth && F[j + 1][1] <= A.GH + 0.01) continue;
        const v0 = i * F.length + j, v1 = (i + 1) * F.length + j;
        idx.push(v0, v1, v0 + 1, v1, v1 + 1, v0 + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  function roundRectShape(hw, hl, r) {
    const s = new THREE.Shape();
    s.moveTo(-hw + r, -hl); s.lineTo(hw - r, -hl); s.absarc(hw - r, -hl + r, r, -Math.PI / 2, 0); s.lineTo(hw, hl - r); s.absarc(hw - r, hl - r, r, 0, Math.PI / 2);
    s.lineTo(-hw + r, hl); s.absarc(-hw + r, hl - r, r, Math.PI / 2, Math.PI); s.lineTo(-hw, -hl + r); s.absarc(-hw + r, -hl + r, r, Math.PI, Math.PI * 1.5);
    return s;
  }
  function flatGeometry(hw, hl, r, y, uvFull) {
    const g = new THREE.ShapeGeometry(roundRectShape(hw, hl, r), 12);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getY(i);
      p.setXYZ(i, x, y, z);
      if (uvFull) uv.setXY(i, (x + A.HW) / (2 * A.HW), 1 - (z + A.HL) / (2 * A.HL)); else uv.setXY(i, x / 4, z / 4);
    }
    g.computeVertexNormals();
    if (y < 1) { g.index.array.reverse(); g.index.needsUpdate = true; }
    g.computeVertexNormals();
    return g;
  }

  function buildArena(scene) {
    const grp = new THREE.Group(); scene.add(grp);
    const floorTex = floorTexture(); floorTex.flipY = true;
    const floor = new THREE.Mesh(flatGeometry(A.HW - A.RF + 0.02, A.HL - A.RF + 0.02, A.RC - A.RF, 0, true), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, metalness: 0.05 }));
    grp.add(floor);
    // the ramps (solid) and the glass walls and ceiling (see-through, glowing grid)
    const rt = rampTex(); rt.repeat.set(1, 1);
    const low = new THREE.Mesh(shellGeometry('low'), new THREE.MeshStandardMaterial({ map: rt, vertexColors: true, roughness: 0.7, metalness: 0.15, side: THREE.DoubleSide }));
    grp.add(low);
    const hiG = shellGeometry('high');
    grp.add(new THREE.Mesh(hiG, new THREE.MeshBasicMaterial({ color: 0x1a2a55, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })));
    const ht = hexTex(); ht.repeat.set(0.5, 0.5);
    grp.add(new THREE.Mesh(hiG, new THREE.MeshBasicMaterial({ map: ht, vertexColors: true, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })));
    const ceilT = gridTex(); ceilT.repeat.set(1 / 3, 1 / 3);
    grp.add(new THREE.Mesh(flatGeometry(A.HW - A.RF, A.HL - A.RF, A.RC - A.RF, A.H, false), new THREE.MeshBasicMaterial({ map: ceilT, color: 0x6c7fc0, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })));
    // glowing strip where the ramp meets the wall
    const P = perimeter(), stripPts = P.map(p => new THREE.Vector3(p.x, A.RF + 0.05, p.z)); stripPts.push(stripPts[0].clone());
    for (const s of [-1, 1]) {
      const pts = stripPts.filter(p => p.z * s > 0);
      const geo = new THREE.BufferGeometry().setFromPoints(pts.sort((a, b) => Math.atan2(a.x, a.z * s) - Math.atan2(b.x, b.z * s)));
      grp.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: TEAM_GLOW[s < 0 ? 0 : 1] })));
    }
    // fill the sides of the ramp where it stops at the goal mouth
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 8; k++) { const a = (Math.PI / 2) * k / 8; pts.push(new THREE.Vector3(sx * A.GHW, A.RF * (1 - Math.cos(a)), sz * (A.HL - A.RF * (1 - Math.sin(a))))); }
      const corner = new THREE.Vector3(sx * A.GHW, 0, sz * A.HL), pos = [];
      for (let k = 0; k < 8; k++) pos.push(corner.x, corner.y, corner.z, pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      grp.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x8b97bb, side: THREE.DoubleSide, roughness: 0.8 })));
    }
    // goals
    const goalMats = [];
    for (let team = 0; team < 2; team++) {
      const s = team === 0 ? -1 : 1, col = TEAM[team], glow = TEAM_GLOW[team];
      const g = new THREE.Group(); grp.add(g);
      const zIn = s * A.HL, zBack = s * (A.HL + A.GD), zm = (zIn + zBack) / 2;
      const net = gridTex(); net.repeat.set(A.GHW / 1.5, A.GH / 3);
      const netMat = new THREE.MeshBasicMaterial({ map: net, color: glow, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      const back = new THREE.Mesh(new THREE.PlaneGeometry(A.GHW * 2, A.GH), netMat); back.position.set(0, A.GH / 2, zBack); g.add(back);
      const sideMat = netMat.clone(); sideMat.map = net.clone(); sideMat.map.repeat.set(A.GD / 3, A.GH / 3); sideMat.map.needsUpdate = true;
      for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(A.GD, A.GH), sideMat); m.rotation.y = Math.PI / 2; m.position.set(sx * A.GHW, A.GH / 2, zm); g.add(m); }
      const topMat = netMat.clone(); topMat.map = net.clone(); topMat.map.repeat.set(A.GHW / 1.5, A.GD / 3); topMat.map.needsUpdate = true;
      const top = new THREE.Mesh(new THREE.PlaneGeometry(A.GHW * 2, A.GD), topMat); top.rotation.x = Math.PI / 2; top.position.set(0, A.GH, zm); g.add(top);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(A.GHW * 2, A.GH, A.GD), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }));
      glass.position.set(0, A.GH / 2, zm); g.add(glass);
      const gf = new THREE.Mesh(new THREE.PlaneGeometry(A.GHW * 2, A.GD), new THREE.MeshStandardMaterial({ color: 0x141a2e, emissive: col, emissiveIntensity: 0.35, roughness: 0.9 }));
      gf.rotation.x = -Math.PI / 2; gf.position.set(0, 0.01, zm); g.add(gf);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: glow, emissiveIntensity: 0.9, roughness: 0.4 });
      for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(A.PR, A.PR, A.GH, 10), frameMat); p.position.set(sx * A.GHW, A.GH / 2, zIn); g.add(p); }
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(A.PR, A.PR, A.GHW * 2 + A.PR * 2, 10), frameMat); bar.rotation.z = Math.PI / 2; bar.position.set(0, A.GH, zIn); g.add(bar);
      const lineM = new THREE.Mesh(new THREE.PlaneGeometry(A.GHW * 2, 0.6), new THREE.MeshBasicMaterial({ color: glow })); lineM.rotation.x = -Math.PI / 2; lineM.position.set(0, 0.03, zIn); g.add(lineM);
      goalMats.push({ net: netMat, frame: frameMat, floor: gf.material });
    }
    // stands with a crowd behind the glass
    const ct = crowdTex();
    const standMat = (rx, ry) => { const m = new THREE.MeshBasicMaterial({ map: ct.clone(), color: 0xaab4d8 }); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; return m; };
    // simple stands: tilted boxes of seats behind each wall
    const seats = [
      { w: 2 * A.HL + 20, x: A.HW + 22, z: 0, ry: Math.PI / 2 }, { w: 2 * A.HL + 20, x: -A.HW - 22, z: 0, ry: -Math.PI / 2 },
      { w: 2 * A.HW + 20, x: 0, z: A.HL + A.GD + 20, ry: 0 }, { w: 2 * A.HW + 20, x: 0, z: -A.HL - A.GD - 20, ry: Math.PI },
    ];
    for (const s of seats) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w, 52), standMat(s.w / 50, 3));
      const o = new THREE.Object3D(); o.position.set(s.x, 16, s.z); o.rotation.y = s.ry; grp.add(o);
      m.rotation.x = -0.75; m.rotation.y = Math.PI; o.add(m);
    }
    // a dark bowl around everything
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(260, 200, 140, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x070914, side: THREE.BackSide }));
    bowl.position.y = 40; grp.add(bowl);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), new THREE.MeshBasicMaterial({ color: 0x090c18 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; grp.add(ground);
    // light bars on the ceiling edge
    for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 1.2), new THREE.MeshBasicMaterial({ color: 0xe8eeff }));
      bar.position.set(k * 36, A.H + 6, s * (A.HL - 10)); grp.add(bar);
    }
    return { grp, goalMats };
  }

  // ------------------------------------------------------------------ boost pads
  function buildPads(scene) {
    const list = [];
    const bigBase = new THREE.CylinderGeometry(2.6, 2.9, 0.3, 10), orbG = new THREE.IcosahedronGeometry(1.05, 0), smallG = new THREE.CylinderGeometry(1.35, 1.5, 0.16, 10);
    const ringG = new THREE.TorusGeometry(2.2, 0.16, 6, 20);
    for (const p of T.PADS) {
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
      if (p.big) {
        const base = new THREE.Mesh(bigBase, new THREE.MeshStandardMaterial({ color: 0x232838, emissive: 0xff8a1a, emissiveIntensity: 0.25 })); base.position.y = 0.15; g.add(base);
        const ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0xffa640 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.32; g.add(ring);
        const orb = new THREE.Mesh(orbG, new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff9a1a, emissiveIntensity: 1.3, flatShading: true })); orb.position.y = 2.3; g.add(orb);
        list.push({ g, base, ring, orb, big: true });
      } else {
        const disc = new THREE.Mesh(smallG, new THREE.MeshStandardMaterial({ color: 0x2a2e3a, emissive: 0xffc14a, emissiveIntensity: 0.9 })); disc.position.y = 0.08; g.add(disc);
        list.push({ g, disc, big: false });
      }
    }
    return list;
  }
  function updatePads(list, states, t) {
    list.forEach((p, i) => {
      const on = states[i].on;
      if (p.big) {
        p.orb.visible = on; p.orb.rotation.y = t * 1.8; p.orb.position.y = 2.3 + Math.sin(t * 2.4 + i) * 0.25;
        p.ring.material.color.setHex(on ? 0xffa640 : 0x443322); p.base.material.emissiveIntensity = on ? 0.4 : 0.05;
      } else p.disc.material.emissiveIntensity = on ? 0.9 + Math.sin(t * 4 + i) * 0.2 : 0.06;
    });
  }

  // ------------------------------------------------------------------ cars
  function extrudeProfile(pts, width, bevel) {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 1, steps: 1 });
    g.translate(0, 0, -width / 2); g.rotateY(-Math.PI / 2);
    return g;
  }
  const DESIGN = [
    { // Comet: a wedge
      body: [[-1.85, -0.32], [1.92, -0.32], [1.98, -0.08], [1.25, 0.18], [0.35, 0.3], [-1.25, 0.42], [-1.85, 0.4]], bw: 2.3,
      cab: [[0.45, 0.28], [-0.2, 0.74], [-1.0, 0.77], [-1.42, 0.41]], cw: 1.62, wr: 0.45, wing: { z: -1.7, y: 0.72, w: 2.2, d: 0.42 }, stripe: true,
    },
    { // Bulldog: a chunky truck
      body: [[-1.8, -0.32], [1.82, -0.32], [1.88, 0.14], [1.45, 0.36], [-1.8, 0.46]], bw: 2.4,
      cab: [[0.95, 0.34], [0.55, 0.98], [-1.45, 0.98], [-1.6, 0.44]], cw: 2.0, wr: 0.5, bar: true, stripe: true,
    },
    { // Stinger: long and low with a big wing
      body: [[-1.9, -0.32], [2.02, -0.32], [2.08, -0.14], [0.65, 0.18], [-1.0, 0.27], [-1.9, 0.3]], bw: 2.2,
      cab: [[0.32, 0.18], [-0.38, 0.55], [-1.1, 0.56], [-1.42, 0.27]], cw: 1.4, wr: 0.42, wing: { z: -1.75, y: 0.95, w: 2.4, d: 0.55 }, fins: true,
    },
    { // Hornet: a buggy with a roll cage
      body: [[-1.6, -0.26], [1.72, -0.26], [1.82, 0.06], [0.85, 0.24], [-1.6, 0.32]], bw: 2.0,
      cab: [[0.5, 0.24], [0.1, 0.5], [-1.0, 0.5], [-1.2, 0.3]], cw: 1.3, wr: 0.56, cage: true,
    },
  ];
  const wheelG = new THREE.CylinderGeometry(1, 1, 0.42, 12); wheelG.rotateZ(Math.PI / 2);
  const rimG = new THREE.CylinderGeometry(0.55, 0.55, 0.44, 6); rimG.rotateZ(Math.PI / 2);
  const flameG = new THREE.ConeGeometry(0.36, 1.8, 8, 1, true); flameG.rotateX(-Math.PI / 2); flameG.translate(0, 0, -0.9);
  const flameIG = new THREE.ConeGeometry(0.2, 1.1, 6, 1, true); flameIG.rotateX(-Math.PI / 2); flameIG.translate(0, 0, -0.55);
  function makeCarMesh(o) {
    const D = DESIGN[(o.design | 0) % DESIGNS], team = o.team | 0;
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: TEAM[team], metalness: 0.35, roughness: 0.42, flatShading: true });
    const acc = ACCENTS[(o.accent | 0) % ACCENTS.length];
    const accMat = new THREE.MeshStandardMaterial({ color: acc, metalness: 0.3, roughness: 0.5, flatShading: true });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0d1220, metalness: 0.7, roughness: 0.15, flatShading: true });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x15171d, roughness: 0.8 });
    const body = new THREE.Mesh(extrudeProfile(D.body, D.bw, 0.06), bodyMat); g.add(body);
    const cab = new THREE.Mesh(extrudeProfile(D.cab, D.cw, 0.04), glassMat); g.add(cab);
    if (D.stripe) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 3.4), accMat); st.position.set(0, 0.36, 0.1); st.rotation.x = -0.05; g.add(st); }
    if (D.wing) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(D.wing.w, 0.08, D.wing.d), accMat); w.position.set(0, D.wing.y, D.wing.z); g.add(w);
      for (const sx of [-1, 1]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, D.wing.y - 0.3, 0.2), darkMat); s.position.set(sx * 0.7, (D.wing.y + 0.3) / 2, D.wing.z); g.add(s); }
    }
    if (D.fins) for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.9), accMat); f.position.set(sx * 1.18, 0.95, -1.75); g.add(f); }
    if (D.bar) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 0.2), accMat); b.position.set(0, -0.05, 1.98); g.add(b); }
    if (D.cage) {
      for (const sx of [-1, 1]) for (const z of [0.3, -1.05]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), accMat); r.position.set(sx * 0.68, 0.72, z); g.add(r); }
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.1, 0.1), accMat); t1.position.set(0, 1.03, 0.3); g.add(t1);
      const t2 = t1.clone(); t2.position.z = -1.05; g.add(t2);
      for (const sx of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.45), accMat); t.position.set(sx * 0.68, 1.03, -0.37); g.add(t); }
    }
    // lights
    const hl = new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), tl = new THREE.MeshBasicMaterial({ color: 0xff2a3a });
    for (const sx of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.05), hl); h.position.set(sx * 0.72, -0.02, D.body[2][0] + 0.02); g.add(h);
      const tt = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.17, 0.06), tl); tt.position.set(sx * 0.72, 0.14, D.body[0][0] - 0.04); g.add(tt);
      const dif = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.08), darkMat); dif.position.set(sx * 0.62, -0.2, D.body[0][0] - 0.03); g.add(dif);
    }
    // wheels: front ones on pivots so they can steer
    const wheels = [], pivots = [], rimMat = new THREE.MeshStandardMaterial({ color: acc, metalness: 0.6, roughness: 0.3, flatShading: true });
    const wx = D.bw / 2 - 0.08, wy = C_WY(D.wr);
    for (const [x, z, front] of [[wx, 1.2, 1], [-wx, 1.2, 1], [wx, -1.18, 0], [-wx, -1.18, 0]]) {
      const pv = new THREE.Group(); pv.position.set(x, wy, z); g.add(pv);
      const w = new THREE.Mesh(wheelG, darkMat); w.scale.set(1, D.wr, D.wr); pv.add(w);
      const r = new THREE.Mesh(rimG, rimMat); r.scale.set(1, D.wr, D.wr); w.add(r);
      wheels.push(w); if (front) pivots.push(pv);
    }
    // boost nozzle + flame
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x3a3f4c, metalness: 0.8, roughness: 0.3 })); noz.rotation.x = Math.PI / 2; noz.position.set(0, 0.05, D.body[0][0] - 0.1); g.add(noz);
    const tc = TRAILS[(o.trail | 0) % TRAILS.length];
    const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tc[0], tc[1], tc[2]), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const flame = new THREE.Mesh(flameG, flameMat); flame.position.copy(noz.position); flame.position.z -= 0.12; g.add(flame);
    const flameIn = new THREE.Mesh(flameIG, new THREE.MeshBasicMaterial({ color: 0xfff4d0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); flameIn.position.copy(flame.position); g.add(flameIn);
    flame.visible = flameIn.visible = false;
    return { g, wheels, pivots, flame, flameIn, bodyMat, tail: new THREE.Vector3(0, 0.05, D.body[0][0] - 0.4), trail: tc, spin: 0 };
  }
  function C_WY(r) { return -T.C.RIDE + r; }
  function updateCarMesh(m, c, dt, t) {
    const fwdSpeed = c.vel.dot(_fz.set(0, 0, 1).applyQuaternion(c.q));
    m.spin += fwdSpeed * dt / 0.48;
    for (const w of m.wheels) w.rotation.x = m.spin;
    const st = -(c.inp ? c.inp.steer || 0 : 0) * 0.42;
    for (const p of m.pivots) p.rotation.y += (st - p.rotation.y) * Math.min(1, dt * 12);
    const on = c.boosting && !c.dead;
    m.flame.visible = m.flameIn.visible = on;
    if (on) { const k = 0.85 + Math.sin(t * 60 + c.pos.x) * 0.15; m.flame.scale.set(k, k, 0.8 + Math.random() * 0.5); m.flameIn.scale.set(1, 1, 0.8 + Math.random() * 0.4); }
  }
  const _fz = new THREE.Vector3();

  // ------------------------------------------------------------------ ball
  function makeBallMesh() {
    const geo = new THREE.IcosahedronGeometry(R, 2);
    const base = new THREE.IcosahedronGeometry(1, 0), bp = base.attributes.position, verts = [];
    for (let i = 0; i < bp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(bp, i).normalize(); if (!verts.some(u => u.distanceTo(v) < 1e-3)) verts.push(v); }
    const p = geo.attributes.position, col = [], v = new THREE.Vector3(), cen = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      cen.set(0, 0, 0); for (let k = 0; k < 3; k++) cen.add(v.fromBufferAttribute(p, i + k)); cen.normalize();
      const dark = verts.some(u => u.dot(cen) > 0.955);
      const c = dark ? [0.13, 0.15, 0.22] : [0.93, 0.95, 1];
      for (let k = 0; k < 3; k++) col.push(c[0], c[1], c[2]);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.35, metalness: 0.15, emissive: 0x223355, emissiveIntensity: 0.25 }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0x9fc4ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(R * 4.2, R * 4.2, 1);
    const g = new THREE.Group(); g.add(m); g.add(glow);
    return { g, m, glow };
  }
  let _glow = null;
  function glowTex() {
    if (_glow) return _glow;
    _glow = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    return _glow;
  }
  let _shadow = null;
  function makeShadow(size) {
    if (!_shadow) _shadow = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(0.6, 'rgba(0,0,0,0.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: _shadow, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 1;
    return m;
  }

  // ------------------------------------------------------------------ particles (one pool, additive points)
  function makeParticles(scene, N) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(size, 1)); geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { scale: { value: 400 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float size; attribute float alpha; attribute vec3 color; varying vec3 vC; varying float vA; uniform float scale; void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * scale / max(0.5, -mv.z); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d); if (r > 0.25) discard; gl_FragColor = vec4(vC, vA * (1.0 - r * 4.0)); }',
    });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
    const P = { pts, mat, N, n: 0, vel: new Float32Array(N * 3), life: new Float32Array(N), max: new Float32Array(N), s0: new Float32Array(N), drag: new Float32Array(N), grav: new Float32Array(N), next: 0 };
    P.emit = (x, y, z, vx, vy, vz, life, sz, r, g, b, drag, grav) => {
      const i = P.next; P.next = (P.next + 1) % N;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vy; P.vel[i * 3 + 2] = vz;
      col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b; P.life[i] = life; P.max[i] = life; P.s0[i] = sz; size[i] = sz; alpha[i] = 1;
      P.drag[i] = drag || 0; P.grav[i] = grav || 0;
    };
    P.burst = (x, y, z, n, speed, life, sz, color, grav, spread) => {
      for (let k = 0; k < n; k++) {
        let dx = Math.random() * 2 - 1, dy = Math.random() * 2 - 1, dz = Math.random() * 2 - 1; const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
        const s = speed * (0.3 + Math.random() * 0.7), c = Array.isArray(color[0]) ? color[(Math.random() * color.length) | 0] : color;
        P.emit(x + dx * (spread || 0), y + dy * (spread || 0), z + dz * (spread || 0), dx * s, dy * s, dz * s, life * (0.5 + Math.random() * 0.5), sz * (0.6 + Math.random() * 0.8), c[0], c[1], c[2], 1.5, grav || 0);
      }
    };
    P.update = (dt) => {
      for (let i = 0; i < N; i++) {
        if (P.life[i] <= 0) { if (alpha[i]) alpha[i] = 0; continue; }
        P.life[i] -= dt; const k = Math.max(0, P.life[i] / P.max[i]);
        const d = Math.exp(-P.drag[i] * dt);
        P.vel[i * 3] *= d; P.vel[i * 3 + 1] = P.vel[i * 3 + 1] * d - P.grav[i] * dt; P.vel[i * 3 + 2] *= d;
        pos[i * 3] += P.vel[i * 3] * dt; pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
        alpha[i] = k; size[i] = P.s0[i] * (0.4 + 0.6 * k);
      }
      geo.attributes.position.needsUpdate = geo.attributes.alpha.needsUpdate = geo.attributes.size.needsUpdate = geo.attributes.color.needsUpdate = true;
    };
    P.clear = () => { P.life.fill(0); alpha.fill(0); geo.attributes.alpha.needsUpdate = true; };
    return P;
  }

  window.TGRender = { TEAM, TEAM_GLOW, ACCENTS, TRAILS, DESIGNS, buildArena, buildPads, updatePads, makeCarMesh, updateCarMesh, makeBallMesh, makeShadow, makeParticles, glowTex };
})();
