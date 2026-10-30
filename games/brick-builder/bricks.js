'use strict';
// =====================================================================
// Brick Builder — pick up building bricks and snap them together on a baseplate.
//  bricks, plates, tiles, slopes and round pieces · 21 colours · rotate, move,
//  paint, copy, delete · undo / redo · saved creations (synced to your Mal3ab account)
// =====================================================================
(function () {
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const touchMode = matchMedia('(pointer: coarse)').matches;

addStrings({
  bb_title: 'مكعبات البناء', bb_build: 'بناء', bb_move: 'تحريك', bb_paint: 'تلوين', bb_pick: 'نسخ', bb_delete: 'مسح',
  bb_rotate: 'لف', bb_undo: 'تراجع', bb_redo: 'إعادة', bb_clear: 'مسح الكل', bb_saves: 'إبداعاتي', bb_photo: 'صورة',
  bb_bricks: 'طوب', bb_plates: 'ألواح', bb_tiles: 'بلاط', bb_slopes: 'مايلة', bb_round: 'دوائر', bb_colors: 'الألوان', bb_base: 'القاعدة',
  bb_count: '{n} قطعة', bb_confirmClear: 'تمسح كل القطع؟ (تقدر ترجع بـ تراجع)', bb_saveAs: '💾 احفظ', bb_name: 'اسم الإبداع', bb_load: 'افتح', bb_del: 'مسح',
  bb_new: '➕ جديد', bb_empty: 'لسه مفيش إبداعات محفوظة', bb_saved: 'اتحفظ ✓', bb_untitled: 'من غير اسم', bb_close: 'قفل', bb_confirmDel: 'تمسح "{p}"؟',
  bb_hint_build: 'اضغط عشان تحط القطعة · R تلف · اسحب عشان تلف الكاميرا · العجلة للزووم',
  bb_hint_move: 'اضغط على قطعة عشان تمسكها، وبعدين اضغط مكان ما عايز تحطها',
  bb_hint_paint: 'اضغط على أي قطعة عشان تلونها باللون المختار', bb_hint_pick: 'اضغط على قطعة عشان تاخد نفس شكلها ولونها',
  bb_hint_delete: 'اضغط على أي قطعة عشان تشيلها', bb_hint_touch: 'دوس عشان تحط · اسحب بصباع للف · بصباعين للزووم والتحريك',
  bb_holding: 'ماسك قطعة — دوس مكان ما عايز تحطها (Esc يرجّعها)', bb_hidden: '🙈 خبّي القطع', bb_shown: '👁 القطع'
}, {
  bb_title: 'Brick Builder', bb_build: 'Build', bb_move: 'Move', bb_paint: 'Paint', bb_pick: 'Copy', bb_delete: 'Delete',
  bb_rotate: 'Rotate', bb_undo: 'Undo', bb_redo: 'Redo', bb_clear: 'Clear all', bb_saves: 'My builds', bb_photo: 'Photo',
  bb_bricks: 'Bricks', bb_plates: 'Plates', bb_tiles: 'Tiles', bb_slopes: 'Slopes', bb_round: 'Round', bb_colors: 'Colours', bb_base: 'Baseplate',
  bb_count: '{n} pieces', bb_confirmClear: 'Remove every piece? (Undo brings them back)', bb_saveAs: '💾 Save', bb_name: 'Build name', bb_load: 'Open', bb_del: 'Delete',
  bb_new: '➕ New', bb_empty: 'No saved builds yet', bb_saved: 'Saved ✓', bb_untitled: 'Untitled', bb_close: 'Close', bb_confirmDel: 'Delete "{p}"?',
  bb_hint_build: 'Click to place · R rotates · drag to turn the camera · wheel to zoom',
  bb_hint_move: 'Click a piece to pick it up, then click where it should go',
  bb_hint_paint: 'Click any piece to paint it the chosen colour', bb_hint_pick: 'Click a piece to take its shape and colour',
  bb_hint_delete: 'Click any piece to remove it', bb_hint_touch: 'Tap to place · one finger turns · two fingers zoom and move',
  bb_holding: 'Holding a piece — click where it should go (Esc puts it back)', bb_hidden: '🙈 Hide', bb_shown: '👁 Pieces'
});

// ---------------------------------------------------------------------
// pieces and colours
// ---------------------------------------------------------------------
const PLATE = 0.4, SIZE = 32, HALF = SIZE / 2;
const COLORS = [
  ['#c91a09'], ['#0055bf'], ['#f2cd37'], ['#237841'], ['#a5ca18'], ['#f4f4f4'], ['#1b2a34'], ['#a0a5a9'], ['#6c6e68'], ['#fe8a18'],
  ['#583927'], ['#e4cd9e'], ['#0a3463'], ['#36aebf'], ['#fc97ac'], ['#8320b7'], ['#720e0f'], ['#e8f4f8', 0.42], ['#5a93db', 0.55], ['#e3302a', 0.55], ['#f5cd2f', 0.55]
];
const BASES = [3, 7, 1, 11, 5];                        // baseplate colours to choose from
const KIND_TAB = { brick: 'bricks', plate: 'plates', tile: 'tiles', slope: 'slopes', round: 'round', rplate: 'round', cone: 'round' };
const PARTS = [], BY = {};
const P = (kind, w, d, h) => { const p = { id: { brick: 'b', plate: 'p', tile: 't', slope: 's', round: 'r', rplate: 'q', cone: 'c' }[kind] + w + 'x' + d, kind, w, d, h }; PARTS.push(p); BY[p.id] = p; };
for (const [w, d] of [[1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [1, 8], [2, 2], [2, 3], [2, 4], [2, 6], [2, 8]]) P('brick', w, d, 3);
for (const [w, d] of [[1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [2, 2], [2, 3], [2, 4], [2, 6], [4, 4], [4, 6], [6, 6], [8, 8]]) P('plate', w, d, 1);
for (const [w, d] of [[1, 1], [1, 2], [1, 4], [2, 2], [2, 4]]) P('tile', w, d, 1);
for (const [w, d] of [[1, 2], [2, 2], [4, 2], [1, 3], [2, 3]]) P('slope', w, d, 3);
P('round', 1, 1, 3); P('round', 2, 2, 3); P('rplate', 1, 1, 1); P('rplate', 2, 2, 1); P('cone', 1, 1, 3);

// ---------------------------------------------------------------------
// 3D scene
// ---------------------------------------------------------------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchMode ? 1.5 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 0.72));
const sun = new THREE.DirectionalLight(0xffffff, 0.82); sun.position.set(16, 34, 12); sun.castShadow = true;
sun.shadow.mapSize.set(touchMode ? 1024 : 2048, touchMode ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun); const fill = new THREE.DirectionalLight(0xdfe8ff, 0.28); fill.position.set(-20, 12, -16); scene.add(fill);
function resize() { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
addEventListener('resize', resize);

const mats = COLORS.map(([hex, a]) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.3, metalness: 0, transparent: !!a, opacity: a || 1, depthWrite: !a }));
const hiMats = COLORS.map(([hex, a]) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.3, emissive: 0x335577, emissiveIntensity: 0.6, transparent: !!a, opacity: a || 1 }));
const ghostOk = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.4 });
const ghostBad = new THREE.MeshStandardMaterial({ color: '#ff3b3b', transparent: true, opacity: 0.45, depthWrite: false });

// geometry for each piece, merged into one mesh (body + studs)
const geoCache = {};
function merge(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return g;
}
function partGeo(p) {
  if (geoCache[p.id]) return geoCache[p.id];
  const H = p.h * PLATE - 0.01, list = [];
  const add = (g, x, y, z) => { g.translate(x, y, z); list.push(g.index ? g.toNonIndexed() : g); };
  const stud = (i, j, top) => add(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 16), i + 0.5, top + 0.085, j + 0.5);
  if (p.kind === 'brick' || p.kind === 'plate' || p.kind === 'tile') {
    add(new THREE.BoxGeometry(p.w - 0.04, H, p.d - 0.04), p.w / 2, H / 2, p.d / 2);
    if (p.kind !== 'tile') for (let i = 0; i < p.w; i++) for (let j = 0; j < p.d; j++) stud(i, j, H);
  } else if (p.kind === 'slope') {
    const sh = new THREE.Shape(), e = 0.02, lip = PLATE * 0.6;
    sh.moveTo(e, 0); sh.lineTo(p.d - e, 0); sh.lineTo(p.d - e, H); sh.lineTo(p.d - 1, H); sh.lineTo(e, lip); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: p.w - 0.04, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(p.w - 0.02, 0, 0);
    g.deleteAttribute('uv'); list.push(g.index ? g.toNonIndexed() : g);
    for (let i = 0; i < p.w; i++) stud(i, p.d - 1, H);
  } else if (p.kind === 'round' || p.kind === 'rplate') {
    add(new THREE.CylinderGeometry(p.w / 2 - 0.03, p.w / 2 - 0.03, H, 28), p.w / 2, H / 2, p.d / 2);
    for (let i = 0; i < p.w; i++) for (let j = 0; j < p.d; j++) stud(i, j, H);
  } else if (p.kind === 'cone') {
    add(new THREE.CylinderGeometry(0.17, 0.47, H, 24), 0.5, H / 2, 0.5);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.17, 14), 0.5, H + 0.085, 0.5);
  }
  for (const g of list) for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  const g = merge(list); g.translate(-p.w / 2, 0, -p.d / 2); g.computeBoundingSphere(); g.computeBoundingBox();
  return (geoCache[p.id] = g);
}

// baseplate with studs
const baseMat = new THREE.MeshStandardMaterial({ color: COLORS[3][0], roughness: 0.45 });
const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 0.32, SIZE), baseMat); baseMesh.position.y = -0.16; baseMesh.receiveShadow = true; scene.add(baseMesh);
const baseStuds = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 12), baseMat, SIZE * SIZE);
{ const m = new THREE.Matrix4(); let i = 0; for (let x = 0; x < SIZE; x++) for (let z = 0; z < SIZE; z++) { m.makeTranslation(x - HALF + 0.5, 0.085, z - HALF + 0.5); baseStuds.setMatrixAt(i++, m); } }
baseStuds.receiveShadow = true; scene.add(baseStuds);
const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.18 })); shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = -0.33; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

// ---------------------------------------------------------------------
// the build: every piece also fills cells in a grid (studs × plates)
// ---------------------------------------------------------------------
const S = { bricks: [], occ: new Map(), tool: 'build', part: BY.b2x4, color: 0, rot: 0, base: 3, held: null, tab: 'bricks', name: '' };
let nextId = 1, dirty = true;
const dims = (p, r) => r % 2 ? [p.d, p.w] : [p.w, p.d];
const key = (x, y, z) => x + ',' + y + ',' + z;
function cells(p, x, y, z, r) { const [fw, fd] = dims(p, r), out = []; for (let i = 0; i < fw; i++) for (let j = 0; j < fd; j++) for (let k = 0; k < p.h; k++) out.push(key(x + i, y + k, z + j)); return out; }
function fits(p, x, y, z, r) {
  const [fw, fd] = dims(p, r); if (x < 0 || z < 0 || x + fw > SIZE || z + fd > SIZE || y < 0 || y + p.h > 300) return false;
  for (const k of cells(p, x, y, z, r)) if (S.occ.has(k)) return false;
  return true;
}
function meshFor(b) {
  const p = BY[b.p], [fw, fd] = dims(p, b.r), m = new THREE.Mesh(partGeo(p), mats[b.c]);
  m.position.set(b.x - HALF + fw / 2, b.y * PLATE, b.z - HALF + fd / 2); m.rotation.y = -b.r * Math.PI / 2;
  m.castShadow = true; m.receiveShadow = true; m.userData.b = b; return m;
}
function addBrick(b) { b.id = nextId++; S.bricks.push(b); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.set(k, b.id); b.mesh = meshFor(b); scene.add(b.mesh); dirty = true; return b; }
function removeBrick(b) { const i = S.bricks.indexOf(b); if (i < 0) return; S.bricks.splice(i, 1); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.delete(k); scene.remove(b.mesh); dirty = true; }
const serial = () => ({ v: 1, base: S.base, b: S.bricks.map(b => [b.p, b.c, b.x, b.y, b.z, b.r]) });
function load(data) {
  for (const b of [...S.bricks]) removeBrick(b);
  if (!data) data = { b: [] };
  setBase(data.base != null ? data.base : 3);
  for (const a of data.b || []) if (BY[a[0]] && COLORS[a[1]] && fits(BY[a[0]], a[2], a[3], a[4], a[5])) addBrick({ p: a[0], c: a[1], x: a[2], y: a[3], z: a[4], r: a[5] });
  status();
}
function setBase(i) { S.base = i; baseMat.color.set(COLORS[i][0]); dirty = true; }

// undo / redo keep whole snapshots (simple and safe)
const undoStack = [], redoStack = [];
function snapshot() { undoStack.push(JSON.stringify(serial())); if (undoStack.length > 80) undoStack.shift(); redoStack.length = 0; }
function undo() { if (!undoStack.length) return; redoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(undoStack.pop())); changed(); }
function redo() { if (!redoStack.length) return; undoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(redoStack.pop())); changed(); }
let saveT = 0;
function changed() { status(); clearTimeout(saveT); saveT = setTimeout(() => lsSet('bricks-current', Object.assign(serial(), { name: S.name })), 700); toolbar(); }

// ---------------------------------------------------------------------
// camera: orbit / zoom / pan
// ---------------------------------------------------------------------
const cam = { target: new THREE.Vector3(0, 1, 0), r: 40, theta: -Math.PI * 0.8, phi: 0.95 };
function placeCamera() {
  cam.phi = clamp(cam.phi, 0.12, 1.5); cam.r = clamp(cam.r, 5, 110);
  cam.target.x = clamp(cam.target.x, -HALF - 4, HALF + 4); cam.target.z = clamp(cam.target.z, -HALF - 4, HALF + 4); cam.target.y = clamp(cam.target.y, 0, 40);
  camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
  camera.lookAt(cam.target); dirty = true;
}
function orbit(dx, dy) { cam.theta -= dx * 0.008; cam.phi -= dy * 0.008; placeCamera(); }
function pan(dx, dy) {
  const k = cam.r * 0.0016, right = new THREE.Vector3(Math.cos(cam.theta), 0, -Math.sin(cam.theta)), fwd = new THREE.Vector3(Math.sin(cam.theta), 0, Math.cos(cam.theta));
  cam.target.addScaledVector(right, -dx * k).addScaledVector(fwd, -dy * k); placeCamera();
}
function zoom(f) { cam.r *= f; placeCamera(); }

// ---------------------------------------------------------------------
// pointing at things
// ---------------------------------------------------------------------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let ghost = null, hover = null, hoverMesh = null, lastPt = null;
function hitAt(cx, cy) {
  const r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([baseMesh, ...S.bricks.map(b => b.mesh)], false);
  return hits[0] || null;
}
const curPart = () => S.held ? BY[S.held.p] : S.part, curRot = () => S.held ? S.held.r : S.rot, curColor = () => S.held ? S.held.c : S.color;
function targetFor(hit) {
  const p = curPart(), r = curRot(), [fw, fd] = dims(p, r);
  const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld), hb = hit.object.userData.b, pt = hit.point.clone();
  let y, side = false;
  if (n.y > 0.5) y = hb ? hb.y + BY[hb.p].h : 0;
  else if (n.y < -0.5) { if (!hb) return null; y = hb.y - p.h; }
  else { if (!hb) return null; side = true; pt.addScaledVector(n, 0.5); y = hb.y; }
  const cx = Math.floor(pt.x + HALF), cz = Math.floor(pt.z + HALF);
  let x = cx - Math.floor((fw - 1) / 2), z = cz - Math.floor((fd - 1) / 2);
  if (side) { if (n.x > 0.5) x = cx; else if (n.x < -0.5) x = cx - fw + 1; if (n.z > 0.5) z = cz; else if (n.z < -0.5) z = cz - fd + 1; }
  x = clamp(x, 0, SIZE - fw); z = clamp(z, 0, SIZE - fd);
  let ok = fits(p, x, y, z, r);
  if (!ok && n.y > 0.5) for (let yy = y + 1; yy < y + 60; yy++) if (fits(p, x, yy, z, r)) { y = yy; ok = true; break; }   // stack on the tallest piece underneath
  return { x, y, z, ok };
}
function setGhost(tg) {
  const p = curPart(), r = curRot();
  if (!ghost || ghost.userData.p !== p.id) { if (ghost) scene.remove(ghost); ghost = new THREE.Mesh(partGeo(p), ghostOk); ghost.userData.p = p.id; ghost.renderOrder = 2; scene.add(ghost); }
  if (!tg) { ghost.visible = false; dirty = true; return; }
  const [fw, fd] = dims(p, r);
  ghost.visible = true; ghost.position.set(tg.x - HALF + fw / 2, tg.y * PLATE + 0.005, tg.z - HALF + fd / 2); ghost.rotation.y = -r * Math.PI / 2;
  ghost.material = tg.ok ? ghostOk : ghostBad; if (tg.ok) ghostOk.color.set(COLORS[curColor()][0]);
  dirty = true;
}
function setHoverMesh(m) {
  if (hoverMesh === m) return;
  if (hoverMesh && hoverMesh.userData.b) hoverMesh.material = mats[hoverMesh.userData.b.c];
  hoverMesh = m; if (m && m.userData.b) m.material = hiMats[m.userData.b.c]; dirty = true;
}
const placing = () => S.tool === 'build' || (S.tool === 'move' && S.held);
function updateHover(cx, cy) {
  lastPt = [cx, cy];
  const hit = hitAt(cx, cy);
  if (placing()) { setHoverMesh(null); hover = hit ? targetFor(hit) : null; setGhost(hover); }
  else { if (ghost) { ghost.visible = false; dirty = true; } hover = null; setHoverMesh(hit && hit.object.userData.b ? hit.object : null); }
}
function refreshHover() { if (lastPt) updateHover(lastPt[0], lastPt[1]); }

// ---------------------------------------------------------------------
// actions
// ---------------------------------------------------------------------
function click(cx, cy) {
  audio(); updateHover(cx, cy);
  if (placing()) {
    if (!hover || !hover.ok) { tone(180, 0.08); return; }
    snapshot();
    addBrick({ p: curPart().id, c: curColor(), x: hover.x, y: hover.y, z: hover.z, r: curRot() });
    click3(); if (S.held) S.held = null;
    changed(); refreshHover(); return;
  }
  const b = hoverMesh && hoverMesh.userData.b; if (!b) return;
  if (S.tool === 'move') { snapshot(); setHoverMesh(null); S.held = { p: b.p, c: b.c, r: b.r, from: [b.x, b.y, b.z] }; removeBrick(b); tone(520, 0.05); changed(); refreshHover(); }
  else if (S.tool === 'paint') { if (b.c === S.color) return; snapshot(); b.c = S.color; b.mesh.material = hiMats[b.c]; tone(700, 0.05); changed(); }
  else if (S.tool === 'delete') { snapshot(); setHoverMesh(null); removeBrick(b); tone(300, 0.06); changed(); refreshHover(); }
  else if (S.tool === 'pick') { S.part = BY[b.p]; S.color = b.c; S.rot = b.r; S.tab = KIND_TAB[S.part.kind]; setTool('build'); renderParts(); renderColors(); tone(880, 0.05); }
}
function cancelHeld() {
  if (!S.held) return; const h = S.held, p = BY[h.p];
  if (h.from && fits(p, h.from[0], h.from[1], h.from[2], h.r)) addBrick({ p: h.p, c: h.c, x: h.from[0], y: h.from[1], z: h.from[2], r: h.r });
  S.held = null; undoStack.pop(); changed(); refreshHover();
}
function rotate() { if (S.held) S.held.r = (S.held.r + 1) % 4; else S.rot = (S.rot + 1) % 4; tone(600, 0.03); refreshHover(); }
function setTool(t) { if (S.held && t !== 'move') cancelHeld(); S.tool = t; toolbar(); status(); refreshHover(); }

// sounds: little plastic clicks
let AC = null;
function audio() { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return AC; }
function tone(f, len) { if (!audio()) return; const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len); o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + len + 0.02); }
function click3() { tone(1400, 0.03); setTimeout(() => tone(900, 0.04), 30); }

// ---------------------------------------------------------------------
// mouse, touch and keyboard
// ---------------------------------------------------------------------
const pointers = new Map(); let gest = null, pinch = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) gest = { x: e.clientX, y: e.clientY, b: e.button, moved: false, shift: e.shiftKey, touch: e.pointerType !== 'mouse' };
  else { gest = null; const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
});
canvas.addEventListener('pointermove', (e) => {
  const prev = pointers.get(e.pointerId);
  if (!prev) { if (e.pointerType === 'mouse') updateHover(e.clientX, e.clientY); return; }
  const dx = e.clientX - prev.x, dy = e.clientY - prev.y; prev.x = e.clientX; prev.y = e.clientY;
  if (pointers.size >= 2 && pinch) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinch.d > 0) zoom(pinch.d / Math.max(d, 1)); pan(mx - pinch.mx, my - pinch.my); pinch = { d, mx, my }; return;
  }
  if (!gest) return;
  if (!gest.moved && Math.hypot(e.clientX - gest.x, e.clientY - gest.y) > (gest.touch ? 10 : 5)) gest.moved = true;
  if (gest.moved) { if (gest.b === 1 || gest.shift) pan(dx, dy); else orbit(dx, dy); }
  else if (e.pointerType === 'mouse') updateHover(e.clientX, e.clientY);
});
const up = (e) => {
  pointers.delete(e.pointerId);
  if (gest && !gest.moved && pointers.size === 0) { if (gest.b === 0) click(e.clientX, e.clientY); else if (gest.b === 2) rotate(); }
  if (pointers.size < 2) pinch = null; if (pointers.size === 0) gest = null;
  if (e.pointerType === 'mouse') updateHover(e.clientX, e.clientY);
};
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); gest = null; pinch = null; });
canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !pointers.size) { if (ghost) ghost.visible = false; setHoverMesh(null); dirty = true; } });
canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1); }, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (ctrl && k === 'y') { e.preventDefault(); redo(); return; }
  if (ctrl) return;
  if (k === 'r') rotate();
  else if (k === 'b') setTool('build'); else if (k === 'm') setTool('move'); else if (k === 'p') setTool('paint'); else if (k === 'i') setTool('pick');
  else if (k === 'x' || k === 'delete') setTool('delete');
  else if (k === 'escape') { if (S.held) cancelHeld(); else setTool('build'); }
  else if (k === 'arrowleft') orbit(-30, 0); else if (k === 'arrowright') orbit(30, 0); else if (k === 'arrowup') orbit(0, -20); else if (k === 'arrowdown') orbit(0, 20);
  else if (k === '+' || k === '=') zoom(0.9); else if (k === '-') zoom(1.1);
});

// ---------------------------------------------------------------------
// panels
// ---------------------------------------------------------------------
const TOOLS = [['build', '🧱'], ['move', '✋'], ['paint', '🎨'], ['pick', '💧'], ['delete', '🗑']];
function toolbar() {
  $('tools').innerHTML = TOOLS.map(([k, ic]) => `<button class="tool ${S.tool === k ? 'on' : ''}" data-tool="${k}" title="${t('bb_' + k)}"><b>${ic}</b><span>${t('bb_' + k)}</span></button>`).join('') +
    `<i class="sep"></i><button class="tool" data-act="rotate" title="${t('bb_rotate')} (R)"><b>↻</b><span>${t('bb_rotate')}</span></button>
     <button class="tool" data-act="undo" ${undoStack.length ? '' : 'disabled'} title="${t('bb_undo')} (Ctrl+Z)"><b>↶</b><span>${t('bb_undo')}</span></button>
     <button class="tool" data-act="redo" ${redoStack.length ? '' : 'disabled'} title="${t('bb_redo')} (Ctrl+Y)"><b>↷</b><span>${t('bb_redo')}</span></button>
     <i class="sep"></i><button class="tool" data-act="saves"><b>🗂</b><span>${t('bb_saves')}</span></button>
     <button class="tool" data-act="photo"><b>📷</b><span>${t('bb_photo')}</span></button>
     <button class="tool" data-act="clear"><b>🧹</b><span>${t('bb_clear')}</span></button>`;
}
$('tools').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; audio();
  if (b.dataset.tool) return setTool(b.dataset.tool);
  const a = b.dataset.act;
  if (a === 'rotate') rotate(); if (a === 'undo') undo(); if (a === 'redo') redo(); if (a === 'saves') openSaves(); if (a === 'photo') photo();
  if (a === 'clear' && S.bricks.length && confirm(t('bb_confirmClear'))) { snapshot(); load({ base: S.base, b: [] }); changed(); }
});
function iconFor(p, color) {
  const c = document.createElement('canvas'), N = 56; c.width = c.height = N; const g = c.getContext('2d');
  const [w, d] = [p.w, p.d], s = Math.min(44 / Math.max(w, d), 18), ox = (N - w * s) / 2, oy = (N - d * s) / 2, col = COLORS[color][0];
  g.fillStyle = col; g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5;
  if (p.kind === 'round' || p.kind === 'rplate' || p.kind === 'cone') { g.beginPath(); g.arc(N / 2, N / 2, w * s / 2, 0, 7); g.fill(); g.stroke(); }
  else {
    g.fillRect(ox, oy, w * s, d * s); g.strokeRect(ox, oy, w * s, d * s);
    if (p.kind === 'slope') { const gr = g.createLinearGradient(0, oy, 0, oy + (d - 1) * s); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(255,255,255,.18)'); g.fillStyle = gr; g.fillRect(ox, oy, w * s, (d - 1) * s); }
    if (p.kind === 'tile') { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(ox + 2, oy + 2, w * s - 4, 3); }
  }
  if (p.kind !== 'tile') {
    const rows = p.kind === 'slope' ? [d - 1] : [...Array(d).keys()], r = s * 0.3;
    for (let i = 0; i < w; i++) for (const j of rows) {
      if (p.kind === 'cone' && (i || j)) continue;
      g.beginPath(); g.arc(ox + (i + 0.5) * s, oy + (j + 0.5) * s, p.kind === 'cone' ? r * 0.6 : r, 0, 7); g.fillStyle = 'rgba(255,255,255,.28)'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.stroke();
    }
  }
  if (p.h === 3 && p.kind !== 'slope' && p.kind !== 'cone') { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(ox, oy + d * s, w * s, 3); }
  return c.toDataURL();
}
function renderParts() {
  const tabs = ['bricks', 'plates', 'tiles', 'slopes', 'round'];
  $('tabs').innerHTML = tabs.map(k => `<button class="tab ${S.tab === k ? 'on' : ''}" data-tab="${k}">${t('bb_' + k)}</button>`).join('');
  $('parts').innerHTML = PARTS.filter(p => KIND_TAB[p.kind] === S.tab).map(p =>
    `<button class="part ${S.part === p && !S.held ? 'on' : ''}" data-part="${p.id}"><img src="${iconFor(p, S.color)}" alt=""><span>${p.w}×${p.d}</span></button>`).join('');
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { S.tab = b.dataset.tab; renderParts(); } });
$('parts').addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (!b) return; if (S.held) cancelHeld(); S.part = BY[b.dataset.part]; S.rot = 0; if (S.tool !== 'build') setTool('build'); renderParts(); refreshHover(); tone(800, 0.03); });
function renderColors() {
  $('colors').innerHTML = COLORS.map(([hex, a], i) => `<button class="sw ${S.color === i ? 'on' : ''} ${a ? 'trans' : ''}" data-c="${i}" style="--c:${hex}"></button>`).join('');
  $('bases').innerHTML = BASES.map(i => `<button class="sw small ${S.base === i ? 'on' : ''}" data-b="${i}" style="--c:${COLORS[i][0]}"></button>`).join('');
}
$('colors').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; S.color = +b.dataset.c; if (S.held) S.held.c = S.color; renderColors(); renderParts(); refreshHover(); });
$('bases').addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; snapshot(); setBase(+b.dataset.b); renderColors(); changed(); });
function status() {
  const hint = S.held ? t('bb_holding') : touchMode && S.tool === 'build' ? t('bb_hint_touch') : t('bb_hint_' + S.tool);
  $('status').innerHTML = `<b>${t('bb_count', { n: S.bricks.length })}</b><span>${hint}</span>`;
}

// saved builds ("bricks-saves" is synced to the Mal3ab account)
function savesList() { return lsGet('bricks-saves', {}); }
function openSaves() {
  const list = savesList(), ids = Object.keys(list).sort((a, b) => list[b].t - list[a].t);
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="box"><h2>🗂 ${t('bb_saves')}</h2>
    <div class="row"><input id="saveName" maxlength="40" placeholder="${t('bb_name')}" value="${esc(S.name)}"><button class="btn" id="doSave">${t('bb_saveAs')}</button></div>
    <div class="list">${ids.length ? ids.map(id => `<div class="item"><div><b>${esc(list[id].name || t('bb_untitled'))}</b><small>${t('bb_count', { n: (list[id].data.b || []).length })} · ${new Date(list[id].t).toLocaleDateString()}</small></div>
      <button class="btn small" data-load="${id}">${t('bb_load')}</button><button class="btn small sec" data-del="${id}">${t('bb_del')}</button></div>`).join('') : `<p class="muted">${t('bb_empty')}</p>`}</div>
    <div class="row"><button class="btn sec" id="doNew">${t('bb_new')}</button><span class="sp"></span><button class="btn sec" id="doClose">${t('bb_close')}</button></div></div>`;
  $('doClose').onclick = () => $('modal').hidden = true;
  $('doSave').onclick = () => {
    const name = $('saveName').value.trim() || t('bb_untitled'), all = savesList();
    let id = Object.keys(all).find(k => all[k].name === name) || 's' + Date.now().toString(36);
    all[id] = { name, t: Date.now(), data: serial() }; S.name = name;
    if (lsSet('bricks-saves', all)) { $('doSave').textContent = t('bb_saved'); setTimeout(openSaves, 700); changed(); }
  };
  $('doNew').onclick = () => { snapshot(); S.name = ''; load({ base: S.base, b: [] }); changed(); $('modal').hidden = true; };
  $('modal').querySelectorAll('[data-load]').forEach(b => b.onclick = () => { const it = savesList()[b.dataset.load]; if (!it) return; snapshot(); S.name = it.name; load(it.data); changed(); $('modal').hidden = true; });
  $('modal').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const all = savesList(), it = all[b.dataset.del]; if (!it || !confirm(t('bb_confirmDel', { p: it.name }))) return; delete all[b.dataset.del]; lsSet('bricks-saves', all); openSaves(); });
}
$('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') $('modal').hidden = true; });
function photo() {
  const gv = ghost && ghost.visible; if (ghost) ghost.visible = false; setHoverMesh(null);
  renderer.render(scene, camera);
  const out = document.createElement('canvas'); out.width = canvas.width; out.height = canvas.height; const g = out.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, out.height); gr.addColorStop(0, '#dfe9f7'); gr.addColorStop(1, '#a9bbd6'); g.fillStyle = gr; g.fillRect(0, 0, out.width, out.height);
  g.drawImage(canvas, 0, 0);
  const a = document.createElement('a'); a.download = (S.name || 'brick-build') + '.png'; a.href = out.toDataURL('image/png'); a.click();
  if (ghost) ghost.visible = gv; dirty = true; tone(1200, 0.06);
}

// ---------------------------------------------------------------------
// start
// ---------------------------------------------------------------------
function renderAll() { toolbar(); renderParts(); renderColors(); status(); if (window.applyLang) applyLang(); }
document.addEventListener('langchange', renderAll);
$('lang').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
const cur = lsGet('bricks-current', null);
if (cur && cur.b && cur.b.length) { S.name = cur.name || ''; load(cur); }
else {                               // a little starter house so the plate isn't empty
  const demo = [
    ['p6x6', 11, 13, 0, 13, 0],                                                        // floor
    ['b1x2', 0, 13, 1, 13, 1], ['b1x2', 0, 17, 1, 13, 1], ['b1x6', 0, 13, 1, 18, 1], ['b1x4', 0, 13, 1, 14, 0], ['b1x4', 0, 18, 1, 14, 0],
    ['b1x6', 0, 13, 4, 13, 1], ['b1x6', 0, 13, 4, 18, 1], ['b1x1', 0, 13, 4, 14, 0], ['b1x2', 18, 13, 4, 15, 0], ['b1x1', 0, 13, 4, 17, 0],
    ['b1x1', 0, 18, 4, 14, 0], ['b1x2', 18, 18, 4, 15, 0], ['b1x1', 0, 18, 4, 17, 0],
    ['p6x6', 8, 13, 7, 13, 0],                                                         // ceiling
    ['s4x2', 1, 13, 8, 13, 0], ['s2x2', 1, 17, 8, 13, 0], ['s4x2', 1, 13, 8, 17, 2], ['s2x2', 1, 17, 8, 17, 2], ['b2x6', 1, 13, 8, 15, 1],
    ['t2x2', 7, 15, 0, 11, 0], ['t2x2', 7, 15, 0, 9, 0], ['t2x2', 7, 15, 0, 7, 0],     // path
    ['r1x1', 10, 8, 0, 9, 0], ['r1x1', 10, 8, 3, 9, 0], ['r2x2', 3, 7, 6, 8, 0], ['c1x1', 3, 8, 9, 9, 0],   // tree
    ['q1x1', 0, 21, 0, 12, 0], ['q1x1', 2, 22, 0, 14, 0], ['q1x1', 14, 21, 0, 15, 0], ['q1x1', 15, 11, 0, 11, 0]];
  load({ base: 3, b: demo.filter(a => BY[a[0]]) });
}
renderAll(); resize(); placeCamera();
function frame() { requestAnimationFrame(frame); if (canvas.clientWidth && (canvas.width !== Math.floor(canvas.clientWidth * renderer.getPixelRatio()))) resize(); if (!dirty) return; dirty = false; renderer.render(scene, camera); }
requestAnimationFrame(frame);
window.BB = { S, addBrick, load, serial, hitAt, click, setTool, rotate, undo, redo, BY };   // for testing
})();
