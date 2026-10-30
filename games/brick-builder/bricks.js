'use strict';
// =====================================================================
// Brick Builder — pick up building bricks and snap them together on a baseplate.
//  ~130 pieces: bricks, plates, tiles, slopes, round, arches, windows, doors,
//  fences, technic, and moving parts (motor, gears, fan, turntable, wheels, lights)
//  PC: mouse looks around, WASD flies, left click builds, right click deletes,
//      middle click rotates, wheel zooms · phones: tap to place, drag to turn
// =====================================================================
(function () {
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const touchMode = matchMedia('(pointer: coarse)').matches;
const V3 = THREE.Vector3;

addStrings({
  bb_title: 'مكعبات البناء', bb_build: 'بناء', bb_move: 'تحريك', bb_paint: 'تلوين', bb_pick: 'نسخ', bb_delete: 'مسح',
  bb_rotate: 'لف', bb_undo: 'تراجع', bb_redo: 'إعادة', bb_clear: 'مسح الكل', bb_saves: 'إبداعاتي', bb_photo: 'صورة', bb_play: 'شغّل', bb_stop: 'وقّف',
  bb_bricks: 'طوب', bb_plates: 'ألواح', bb_tiles: 'بلاط', bb_slopes: 'مايلة', bb_round: 'دوائر', bb_arches: 'أقواس', bb_windows: 'شبابيك وأبواب', bb_technic: 'تكنيك', bb_func: '⚙ متحركة',
  bb_colors: 'الألوان', bb_base: 'القاعدة',
  bb_count: '{n} قطعة', bb_confirmClear: 'تمسح كل القطع؟ (تقدر ترجع بـ تراجع)', bb_saveAs: '💾 احفظ', bb_name: 'اسم الإبداع', bb_load: 'افتح', bb_del: 'مسح',
  bb_new: '➕ جديد', bb_empty: 'لسه مفيش إبداعات محفوظة', bb_saved: 'اتحفظ ✓', bb_untitled: 'من غير اسم', bb_close: 'قفل', bb_confirmDel: 'تمسح "{p}"؟',
  bb_hint_pc: 'اضغط على الشاشة وابدأ: الماوس بيلف الكاميرا · WASD تتحرك · Space/Shift لفوق ولتحت · كليك شمال بناء · كليك يمين مسح · الزرار الوسطاني لف · العجلة زووم · E القطع',
  bb_hint_locked: 'كليك شمال {tool} · يمين مسح · وسطاني لف · 1-9 القطع الأخيرة · C لون · E أو Esc للقوائم',
  bb_hint_move: 'اضغط على قطعة عشان تمسكها، وبعدين اضغط مكان ما عايز تحطها',
  bb_hint_paint: 'اضغط على أي قطعة عشان تلونها باللون المختار', bb_hint_pick: 'اضغط على قطعة عشان تاخد نفس شكلها ولونها',
  bb_hint_delete: 'اضغط على أي قطعة عشان تشيلها', bb_hint_touch: 'دوس عشان تحط · اسحب بصباع للف · بصباعين للزووم والتحريك',
  bb_hint_func: 'حط موتور ⚙ وعليه ترس أو مروحة، وجنب التروس تروس تانية، وبعدين دوس ▶ شغّل',
  bb_holding: 'ماسك قطعة — اضغط مكان ما عايز تحطها (كليك يمين يرجّعها)',
  p_brick: 'طوبة', p_tall: 'طوبة عالية', p_plate: 'لوح', p_tile: 'بلاطة', p_rtile: 'بلاطة مدورة', p_slope: 'مايلة', p_islope: 'مايلة مقلوبة', p_round: 'طوبة مدورة', p_rplate: 'لوح مدور',
  p_cone: 'مخروط', p_dome: 'قبة', p_pillar: 'عمود', p_arch: 'قوس', p_window: 'شباك', p_door: 'باب', p_fence: 'سور', p_technic: 'تكنيك', p_motor: 'موتور', p_gear: 'ترس',
  p_fan: 'مروحة', p_turntable: 'قاعدة بتلف', p_wheel: 'عجلة', p_light: 'نور', p_lightp: 'نور صغير', p_blink: 'نور بيرمش'
}, {
  bb_title: 'Brick Builder', bb_build: 'Build', bb_move: 'Move', bb_paint: 'Paint', bb_pick: 'Copy', bb_delete: 'Delete',
  bb_rotate: 'Rotate', bb_undo: 'Undo', bb_redo: 'Redo', bb_clear: 'Clear all', bb_saves: 'My builds', bb_photo: 'Photo', bb_play: 'Play', bb_stop: 'Stop',
  bb_bricks: 'Bricks', bb_plates: 'Plates', bb_tiles: 'Tiles', bb_slopes: 'Slopes', bb_round: 'Round', bb_arches: 'Arches', bb_windows: 'Windows & doors', bb_technic: 'Technic', bb_func: '⚙ Moving',
  bb_colors: 'Colours', bb_base: 'Baseplate',
  bb_count: '{n} pieces', bb_confirmClear: 'Remove every piece? (Undo brings them back)', bb_saveAs: '💾 Save', bb_name: 'Build name', bb_load: 'Open', bb_del: 'Delete',
  bb_new: '➕ New', bb_empty: 'No saved builds yet', bb_saved: 'Saved ✓', bb_untitled: 'Untitled', bb_close: 'Close', bb_confirmDel: 'Delete "{p}"?',
  bb_hint_pc: 'Click the board to start: mouse looks around · WASD moves · Space/Shift up/down · left click builds · right click deletes · middle click rotates · wheel zooms · E pieces',
  bb_hint_locked: 'Left click {tool} · right delete · middle rotate · 1-9 recent pieces · C colour · E or Esc for the menus',
  bb_hint_move: 'Click a piece to pick it up, then click where it should go',
  bb_hint_paint: 'Click any piece to paint it the chosen colour', bb_hint_pick: 'Click a piece to take its shape and colour',
  bb_hint_delete: 'Click any piece to remove it', bb_hint_touch: 'Tap to place · one finger turns · two fingers zoom and move',
  bb_hint_func: 'Put a motor ⚙ down, a gear or fan on top of it, more gears next to that gear, then press ▶ Play',
  bb_holding: 'Holding a piece — click where it should go (right click puts it back)',
  p_brick: 'Brick', p_tall: 'Tall brick', p_plate: 'Plate', p_tile: 'Tile', p_rtile: 'Round tile', p_slope: 'Slope', p_islope: 'Inverted slope', p_round: 'Round brick', p_rplate: 'Round plate',
  p_cone: 'Cone', p_dome: 'Dome', p_pillar: 'Pillar', p_arch: 'Arch', p_window: 'Window', p_door: 'Door', p_fence: 'Fence', p_technic: 'Technic brick', p_motor: 'Motor', p_gear: 'Gear',
  p_fan: 'Fan', p_turntable: 'Turntable', p_wheel: 'Wheel', p_light: 'Light', p_lightp: 'Small light', p_blink: 'Blinking light'
});

// ---------------------------------------------------------------------
// pieces and colours
// ---------------------------------------------------------------------
const PLATE = 0.4, SIZE = 32, HALF = SIZE / 2;
const COLORS = [
  ['#c91a09'], ['#0055bf'], ['#f2cd37'], ['#237841'], ['#a5ca18'], ['#f4f4f4'], ['#1b2a34'], ['#a0a5a9'], ['#6c6e68'], ['#fe8a18'],
  ['#583927'], ['#e4cd9e'], ['#0a3463'], ['#36aebf'], ['#fc97ac'], ['#8320b7'], ['#720e0f'], ['#e8f4f8', 0.42], ['#5a93db', 0.55], ['#e3302a', 0.55], ['#f5cd2f', 0.55]
];
const BASES = [3, 7, 1, 11, 5];
// kind → [id letter, tab]
const KINDS = {
  brick: ['b', 'bricks'], tall: ['h', 'bricks'], plate: ['p', 'plates'], tile: ['t', 'tiles'], rtile: ['o', 'tiles'], slope: ['s', 'slopes'], islope: ['i', 'slopes'],
  round: ['r', 'round'], rplate: ['q', 'round'], cone: ['c', 'round'], dome: ['d', 'round'], pillar: ['l', 'round'],
  arch: ['a', 'arches'], window: ['w', 'windows'], door: ['n', 'windows'], fence: ['f', 'windows'], technic: ['x', 'technic'],
  motor: ['m', 'func'], gear: ['g', 'func'], fan: ['v', 'func'], turntable: ['u', 'func'], wheel: ['e', 'func'], light: ['y', 'func'], lightp: ['k', 'func'], blink: ['z', 'func']
};
const TABS = ['bricks', 'plates', 'tiles', 'slopes', 'round', 'arches', 'windows', 'technic', 'func'];
const SYMMETRIC = { gear: 1, fan: 1, turntable: 1, round: 1, rplate: 1, rtile: 1, cone: 1, dome: 1, pillar: 1, lightp: 1 };
const PARTS = [], BY = {};
const P = (kind, w, d, h, o) => { const p = Object.assign({ id: KINDS[kind][0] + w + 'x' + d, kind, w, d, h }, o || {}); PARTS.push(p); BY[p.id] = p; };
const each = (kind, list, h) => { for (const [w, d] of list) P(kind, w, d, h); };
each('brick', [[1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [1, 8], [1, 10], [1, 12], [1, 16], [2, 2], [2, 3], [2, 4], [2, 6], [2, 8], [2, 10], [2, 12], [2, 16]], 3);
each('tall', [[1, 1], [1, 2], [1, 4], [2, 2]], 15);
each('plate', [[1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [1, 8], [1, 10], [1, 12], [2, 2], [2, 3], [2, 4], [2, 6], [2, 8], [2, 10], [2, 12], [2, 16],
  [4, 4], [4, 6], [4, 8], [4, 10], [4, 12], [6, 6], [6, 8], [6, 10], [6, 12], [8, 8], [8, 16], [16, 16]], 1);
each('tile', [[1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [1, 8], [2, 2], [2, 3], [2, 4], [2, 6], [4, 4], [6, 6]], 1);
each('rtile', [[1, 1], [2, 2]], 1);
each('slope', [[1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [4, 3], [1, 4], [2, 4]], 3);
each('islope', [[1, 2], [2, 2], [4, 2]], 3);
each('round', [[1, 1], [2, 2]], 3); each('rplate', [[1, 1], [2, 2], [4, 4]], 1); P('cone', 1, 1, 3);
P('dome', 2, 2, 3); P('dome', 4, 4, 6); P('pillar', 1, 1, 15); P('pillar', 2, 2, 15);
P('arch', 1, 4, 6); P('arch', 1, 6, 9); P('arch', 1, 8, 12);
P('window', 1, 2, 6); P('window', 1, 3, 9); P('window', 1, 4, 9); P('door', 1, 4, 18); P('fence', 1, 4, 3); P('fence', 1, 6, 3);
each('technic', [[1, 2], [1, 4], [1, 6], [1, 8], [1, 10], [1, 12], [1, 16]], 3);
P('motor', 2, 2, 3);
for (const [teeth, s] of [[8, 1], [16, 2], [24, 3], [40, 5]]) P('gear', s, s, 1, { id: 'g' + teeth, teeth });
P('fan', 1, 1, 1); P('turntable', 4, 4, 1); P('wheel', 1, 2, 5); P('wheel', 1, 3, 7);
P('light', 1, 1, 3, { glow: 1 }); P('light', 1, 2, 3, { glow: 1 }); P('lightp', 1, 1, 1, { glow: 1 }); P('blink', 1, 1, 3, { glow: 1, blink: 1 });
const label = (p) => p.kind === 'gear' ? p.teeth + 'T' : p.w + '×' + p.d;

// ---------------------------------------------------------------------
// 3D scene
// ---------------------------------------------------------------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchMode ? 1.5 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500); camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 0.72));
const sun = new THREE.DirectionalLight(0xffffff, 0.82); sun.position.set(16, 34, 12); sun.castShadow = true;
sun.shadow.mapSize.set(touchMode ? 1024 : 2048, touchMode ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun); const fill = new THREE.DirectionalLight(0xdfe8ff, 0.28); fill.position.set(-20, 12, -16); scene.add(fill);
let dirty = true;
function resize() { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
addEventListener('resize', resize);

const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.3, metalness: 0 }, o));
const mats = COLORS.map(([hex, a]) => std({ color: hex, transparent: !!a, opacity: a || 1, depthWrite: !a }));
const hiMats = COLORS.map(([hex, a]) => std({ color: hex, emissive: 0x335577, emissiveIntensity: 0.6, transparent: !!a, opacity: a || 1 }));
const FIX = {
  glass: std({ color: '#cfe8ff', transparent: true, opacity: 0.38, depthWrite: false, roughness: 0.05 }), dark: std({ color: '#26282c', roughness: 0.6 }),
  rubber: std({ color: '#1c1c1e', roughness: 0.9 }), metal: std({ color: '#9aa0a6', metalness: 0.55, roughness: 0.35 }), yellow: std({ color: '#f2cd37' }), brown: std({ color: '#6b4426' })
};
const ghostOk = std({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.4 });
const ghostBad = std({ color: '#ff3b3b', transparent: true, opacity: 0.45, depthWrite: false });

// ---------------------------------------------------------------------
// geometry for every kind of piece (built once per piece, then shared)
// body = one merged mesh in the piece colour; extras = glass, rubber, moving parts…
// ---------------------------------------------------------------------
function merge(list) {
  list = list.map(g => { g = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; });
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return g;
}
const bx = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cy = (rt, rb, h, seg, x, y, z) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
const cyX = (r, len, seg, x, y, z) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z);
const stud = (i, j, top) => cy(0.3, 0.3, 0.17, 16, i + 0.5, top + 0.085, j + 0.5);
const studs = (out, w, d, top, skip) => { for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) if (!skip || !skip(i, j)) out.push(stud(i, j, top)); };
// a 2D profile in the (z, y) plane, pushed across the width of the piece
const prism = (sh, w) => { const g = new THREE.ExtrudeGeometry(sh, { depth: w - 0.04, bevelEnabled: false, curveSegments: 18 }); g.rotateY(-Math.PI / 2); g.translate(w - 0.02, 0, 0); return g; };
function gearShape(teeth, R) {
  const s = new THREE.Shape(), step = Math.PI * 2 / teeth, ro = R + 0.07, ri = R - 0.11;
  for (let i = 0; i < teeth; i++) {
    const a = i * step, pts = [[ri, a - 0.27 * step], [ro, a - 0.13 * step], [ro, a + 0.13 * step], [ri, a + 0.27 * step]];
    pts.forEach(([r, t], k) => { const x = r * Math.cos(t), y = r * Math.sin(t); if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y); });
  }
  s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.11, 0, Math.PI * 2, true); s.holes.push(hole);
  if (R >= 1) for (let k = 0; k < 4; k++) { const h = new THREE.Path(), a = k * Math.PI / 2 + Math.PI / 4, d = R * 0.55; h.absarc(d * Math.cos(a), d * Math.sin(a), R * 0.2, 0, Math.PI * 2, true); s.holes.push(h); }
  return s;
}
const built = {};
function build(p) {
  if (built[p.id]) return built[p.id];
  const H = p.h * PLATE - 0.01, w = p.w, d = p.d, e = 0.02, body = [], extras = [];
  const extra = (geo, mat, spin, pivot) => extras.push({ geo, mat, spin: spin || null, pivot: pivot || null });
  switch (p.kind) {
    case 'brick': case 'tall': case 'plate': case 'light':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H); break;
    case 'blink': body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H); break;
    case 'tile': body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); break;
    case 'rtile': body.push(cy(w / 2 - 0.03, w / 2 - 0.03, H, 28, w / 2, H / 2, d / 2)); break;
    case 'slope': case 'islope': {
      const sh = new THREE.Shape();
      if (p.kind === 'slope') { sh.moveTo(e, 0); sh.lineTo(d - e, 0); sh.lineTo(d - e, H); sh.lineTo(d - 1, H); sh.lineTo(e, 0.24); }
      else { sh.moveTo(e, H); sh.lineTo(d - e, H); sh.lineTo(d - e, 0); sh.lineTo(d - 1, 0); sh.lineTo(e, H - 0.3); }
      sh.closePath(); body.push(prism(sh, w));
      if (p.kind === 'slope') studs(body, w, 1, H, null), body.slice(-w).forEach(g => g.translate(0, 0, d - 1)); else studs(body, w, d, H);
      break;
    }
    case 'round': case 'rplate': case 'pillar': case 'lightp':
      body.push(cy(w / 2 - 0.03, w / 2 - 0.03, H, 28, w / 2, H / 2, d / 2)); studs(body, w, d, H); break;
    case 'cone': body.push(cy(0.17, 0.47, H, 24, 0.5, H / 2, 0.5)); body.push(cy(0.16, 0.16, 0.17, 14, 0.5, H + 0.085, 0.5)); break;
    case 'dome': {
      const r = w / 2 - 0.03; body.push(cy(r, r, 0.2, 28, w / 2, 0.1, d / 2));
      body.push(new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2).translate(w / 2, 0.2, d / 2));
      body.push(cy(0.3, 0.3, 0.17, 16, w / 2, 0.2 + r + 0.05, d / 2)); break;
    }
    case 'arch': {
      const r = d / 2 - 1, hb = H - 0.4 - r, sh = new THREE.Shape();
      sh.moveTo(e, 0); sh.lineTo(1, 0); sh.lineTo(1, hb); sh.absarc(d / 2, hb, r, Math.PI, 0, true); sh.lineTo(d - 1, 0); sh.lineTo(d - e, 0); sh.lineTo(d - e, H); sh.lineTo(e, H); sh.closePath();
      body.push(prism(sh, w)); studs(body, w, d, H); break;
    }
    case 'window': {
      const sh = new THREE.Shape(); sh.moveTo(e, 0); sh.lineTo(d - e, 0); sh.lineTo(d - e, H); sh.lineTo(e, H); sh.closePath();
      const hole = new THREE.Path(); hole.moveTo(0.25, 0.25); hole.lineTo(0.25, H - 0.3); hole.lineTo(d - 0.25, H - 0.3); hole.lineTo(d - 0.25, 0.25); hole.closePath(); sh.holes.push(hole);
      body.push(prism(sh, w)); studs(body, w, d, H);
      extra(bx(0.06, H - 0.55, d - 0.5, 0.5, 0.25 + (H - 0.55) / 2, d / 2), 'glass');
      extra(bx(0.08, 0.06, d - 0.5, 0.5, 0.25 + (H - 0.55) / 2, d / 2), 'own'); extra(bx(0.08, H - 0.55, 0.06, 0.5, 0.25 + (H - 0.55) / 2, d / 2), 'own');
      break;
    }
    case 'door': {
      const sh = new THREE.Shape(); sh.moveTo(e, 0); sh.lineTo(0.4, 0); sh.lineTo(0.4, H - 0.5); sh.lineTo(d - 0.4, H - 0.5); sh.lineTo(d - 0.4, 0); sh.lineTo(d - e, 0); sh.lineTo(d - e, H); sh.lineTo(e, H); sh.closePath();
      body.push(prism(sh, w)); studs(body, w, d, H);
      extra(bx(0.14, H - 0.55, d - 0.85, 0.5, (H - 0.55) / 2 + 0.02, d / 2), 'brown');
      extra(bx(0.2, 0.12, 0.12, 0.5, H * 0.45, d - 0.75), 'metal');
      extra(bx(0.16, (H - 0.55) * 0.35, (d - 0.85) * 0.6, 0.5, H * 0.72, d / 2), 'glass');
      break;
    }
    case 'fence': {
      for (const z of [0.3, d / 2, d - 0.3]) body.push(bx(0.3, H - 0.2, 0.3, 0.5, (H - 0.2) / 2, z));
      body.push(bx(0.2, 0.16, d - 0.2, 0.5, 0.42, d / 2)); body.push(bx(0.9, 0.2, d - 0.04, 0.5, H - 0.1, d / 2)); studs(body, w, d, H); break;
    }
    case 'technic':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H);
      for (let j = 1; j < d; j++) { extra(cyX(0.23, w - 0.02, 16, w / 2, 0.62, j), 'dark'); }
      break;
    case 'motor':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2));
      extra(bx(w + 0.0, 0.22, d + 0.0, w / 2, 0.55, d / 2), 'yellow');
      extra(cy(0.32, 0.32, 0.1, 20, w / 2, H + 0.05, d / 2), 'dark');
      extra(merge([bx(0.55, 0.42, 0.13, w / 2, H + 0.3, d / 2), bx(0.13, 0.42, 0.55, w / 2, H + 0.3, d / 2)]), 'metal', 'y', [w / 2, 0, d / 2]);
      break;
    case 'gear': {
      const R = w / 2; body.push(cy(0.1, 0.1, H, 10, w / 2, H / 2, d / 2));
      const g = new THREE.ExtrudeGeometry(gearShape(p.teeth, R), { depth: 0.3, bevelEnabled: false, curveSegments: 10 });
      g.rotateX(-Math.PI / 2); g.translate(w / 2, 0.04, d / 2); extra(g, 'own', 'y', [w / 2, 0, d / 2]);
      break;
    }
    case 'fan': {
      body.push(cy(0.2, 0.24, H, 14, 0.5, H / 2, 0.5));
      const blades = [];
      for (let k = 0; k < 3; k++) blades.push(new THREE.BoxGeometry(1.25, 0.04, 0.32).rotateX(0.25).translate(0.72, H * 0.75, 0).rotateY(k * Math.PI * 2 / 3).translate(0.5, 0, 0.5));
      blades.push(cy(0.16, 0.16, 0.16, 14, 0.5, H * 0.75, 0.5)); extra(merge(blades), 'own', 'y', [0.5, 0, 0.5]);
      break;
    }
    case 'turntable': {
      body.push(cy(1.9, 1.96, 0.18, 36, 2, 0.09, 2));
      const top = [cy(1.95, 1.95, 0.2, 36, 2, 0.29, 2)];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (Math.hypot(i + 0.5 - 2, j + 0.5 - 2) < 1.6) top.push(stud(i, j, 0.39));
      extra(merge(top), 'own', 'y', [2, 0, 2]);
      break;
    }
    case 'wheel': {
      const R = d / 2 - 0.02, c = [0.5, H / 2, d / 2];
      body.push(cyX(0.14, 1.0, 10, ...c));
      const tire = new THREE.TorusGeometry(R - 0.2, 0.2, 12, 32).rotateY(Math.PI / 2).translate(...c);
      extra(tire, 'rubber', 'x', c);
      extra(merge([cyX(R * 0.42, 0.78, 20, ...c), bx(0.72, 0.13, R * 1.62, ...c), bx(0.72, R * 1.62, 0.13, ...c)]), 'own', 'x', c);
      break;
    }
  }
  // move everything so the piece is centred on its footprint
  const T = (g) => g.translate(-w / 2, 0, -d / 2);
  const out = { body: T(merge(body)), extras: extras.map(x => {
    const geo = T(x.geo.index ? x.geo.toNonIndexed() : x.geo);
    if (x.spin) { const pv = new V3(x.pivot[0] - w / 2, x.pivot[1], x.pivot[2] - d / 2); geo.translate(-pv.x, -pv.y, -pv.z); return { geo, mat: x.mat, spin: x.spin, pivot: pv }; }
    return { geo, mat: x.mat, spin: null, pivot: null };
  }) };
  out.body.computeBoundingSphere();
  // the whole outline for the see-through "ghost"
  out.ghost = merge([out.body.clone(), ...out.extras.map(x => x.pivot ? x.geo.clone().translate(x.pivot.x, x.pivot.y, x.pivot.z) : x.geo.clone())]);
  return (built[p.id] = out);
}

// baseplate with studs
const baseMat = std({ color: COLORS[3][0], roughness: 0.45 });
const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 0.32, SIZE), baseMat); baseMesh.position.y = -0.16; baseMesh.receiveShadow = true; scene.add(baseMesh);
const baseStuds = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 12), baseMat, SIZE * SIZE);
{ const m = new THREE.Matrix4(); let i = 0; for (let x = 0; x < SIZE; x++) for (let z = 0; z < SIZE; z++) { m.makeTranslation(x - HALF + 0.5, 0.085, z - HALF + 0.5); baseStuds.setMatrixAt(i++, m); } }
baseStuds.receiveShadow = true; scene.add(baseStuds);
const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShadowMaterial({ opacity: 0.18 })); shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = -0.33; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

// ---------------------------------------------------------------------
// the build: every piece also fills cells in a grid (studs × plates)
// ---------------------------------------------------------------------
const S = { bricks: [], occ: new Map(), tool: 'build', part: BY.b2x4, color: 0, rot: 0, base: 3, held: null, tab: 'bricks', name: '', play: false, recent: lsGet('bricks-recent', ['b2x4', 'b2x2', 'b1x4', 'p2x4', 's2x2', 't2x2', 'r1x1', 'g16', 'm2x2']).filter(id => BY[id]) };
let nextId = 1;
const dims = (p, r) => r % 2 ? [p.d, p.w] : [p.w, p.d];
const key = (x, y, z) => x + ',' + y + ',' + z;
function cells(p, x, y, z, r) { const [fw, fd] = dims(p, r), out = []; for (let i = 0; i < fw; i++) for (let j = 0; j < fd; j++) for (let k = 0; k < p.h; k++) out.push(key(x + i, y + k, z + j)); return out; }
function fits(p, x, y, z, r) {
  const [fw, fd] = dims(p, r); if (x < 0 || z < 0 || x + fw > SIZE || z + fd > SIZE || y < 0 || y + p.h > 300) return false;
  for (const k of cells(p, x, y, z, r)) if (S.occ.has(k)) return false;
  return true;
}
function meshFor(b) {
  const p = BY[b.p], g = build(p), [fw, fd] = dims(p, b.r);
  let mat = mats[b.c];
  if (p.glow) mat = std({ color: COLORS[b.c][0], emissive: COLORS[b.c][0], emissiveIntensity: 0.25, transparent: true, opacity: 0.88, roughness: 0.15 });
  const root = new THREE.Mesh(g.body, mat);
  root.position.set(b.x - HALF + fw / 2, b.y * PLATE, b.z - HALF + fd / 2); root.rotation.y = SYMMETRIC[p.kind] ? 0 : -b.r * Math.PI / 2;
  root.castShadow = root.receiveShadow = true; root.userData = { b, baseMat: mat, spin: [], glow: p.glow ? { mat, blink: !!p.blink } : null };
  for (const x of g.extras) {
    const m = new THREE.Mesh(x.geo, x.mat === 'own' ? mats[b.c] : FIX[x.mat]); m.castShadow = x.mat !== 'glass'; m.receiveShadow = true;
    if (x.spin) { const pv = new THREE.Object3D(); pv.position.copy(x.pivot); pv.add(m); root.add(pv); root.userData.spin.push({ obj: pv, axis: x.spin, mult: p.kind === 'fan' ? 3 : 1 }); }
    else root.add(m);
  }
  return root;
}
function addBrick(b) { b.id = nextId++; S.bricks.push(b); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.set(k, b.id); b.mesh = meshFor(b); scene.add(b.mesh); dirty = true; return b; }
function removeBrick(b) { const i = S.bricks.indexOf(b); if (i < 0) return; S.bricks.splice(i, 1); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.delete(k); scene.remove(b.mesh); dirty = true; }
function remesh(b) { scene.remove(b.mesh); b.mesh = meshFor(b); scene.add(b.mesh); dirty = true; }
const serial = () => ({ v: 1, base: S.base, b: S.bricks.map(b => [b.p, b.c, b.x, b.y, b.z, b.r]) });
function load(data) {
  for (const b of [...S.bricks]) removeBrick(b);
  if (!data) data = { b: [] };
  setBase(data.base != null ? data.base : 3);
  for (const a of data.b || []) if (BY[a[0]] && COLORS[a[1]] && fits(BY[a[0]], a[2], a[3], a[4], a[5])) addBrick({ p: a[0], c: a[1], x: a[2], y: a[3], z: a[4], r: a[5] });
  status();
}
function setBase(i) { S.base = i; baseMat.color.set(COLORS[i][0]); dirty = true; }

const undoStack = [], redoStack = [];
function snapshot() { undoStack.push(JSON.stringify(serial())); if (undoStack.length > 80) undoStack.shift(); redoStack.length = 0; }
function undo() { if (!undoStack.length) return; redoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(undoStack.pop())); changed(); }
function redo() { if (!redoStack.length) return; undoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(redoStack.pop())); changed(); }
let saveT = 0;
function changed() { status(); clearTimeout(saveT); saveT = setTimeout(() => lsSet('bricks-current', Object.assign(serial(), { name: S.name })), 700); toolbar(); if (S.play) setupMotion(); }

// ---------------------------------------------------------------------
// moving parts: motors turn whatever sits on them, gears turn the gears
// next to them, a turntable carries everything built on top of it
// ---------------------------------------------------------------------
let motion = new Map(), riders = [], playT = 0;
const centre = (b) => { const p = BY[b.p], [fw, fd] = dims(p, b.r); return { x: b.x + fw / 2, z: b.z + fd / 2, y: b.y, top: b.y + p.h }; };
const overlap = (a, b) => { const [aw, ad] = dims(BY[a.p], a.r), [bw, bd] = dims(BY[b.p], b.r); return a.x < b.x + bw && b.x < a.x + aw && a.z < b.z + bd && b.z < a.z + ad; };
const DRIVEN = { gear: 1, fan: 1, turntable: 1 };
function computeMotion() {
  const M = new Map(), funcs = S.bricks.filter(b => KINDS[BY[b.p].kind][1] === 'func'), q = [];
  for (const b of funcs) if (BY[b.p].kind === 'motor') { M.set(b.id, { w: 1, ph: 0 }); q.push(b); }
  while (q.length) {
    const a = q.shift(), pa = BY[a.p], ca = centre(a), sa = M.get(a.id);
    for (const b of funcs) {
      const pb = BY[b.p]; if (M.has(b.id) || !DRIVEN[pb.kind]) continue;
      const cb = centre(b), sameAxle = Math.abs(ca.x - cb.x) < 0.01 && Math.abs(ca.z - cb.z) < 0.01;
      if (overlap(a, b) && ((pa.kind === 'motor' && cb.y === ca.top) || (pa.kind !== 'motor' && sameAxle && (cb.y === ca.top || cb.top === ca.y)))) { M.set(b.id, { w: sa.w, ph: sa.ph }); q.push(b); continue; }
      if (pa.kind === 'gear' && pb.kind === 'gear' && ca.y === cb.y && Math.abs(Math.hypot(ca.x - cb.x, ca.z - cb.z) - (pa.w + pb.w) / 2) < 0.2) {
        const alpha = Math.atan2(-(cb.z - ca.z), cb.x - ca.x), ratio = pa.teeth / pb.teeth;
        M.set(b.id, { w: -sa.w * ratio, ph: -sa.ph * ratio + alpha * (1 + ratio) + Math.PI + Math.PI / pb.teeth }); q.push(b);
      }
    }
  }
  // wheels turn when a motor is built into the same model (touching pieces)
  const wheels = S.bricks.filter(b => BY[b.p].kind === 'wheel');
  if (wheels.length) {
    const byId = new Map(S.bricks.map(b => [b.id, b])), seen = new Set(), qq = [];
    for (const b of S.bricks) if (BY[b.p].kind === 'motor') { seen.add(b.id); qq.push(b); }
    while (qq.length) {
      const b = qq.shift(), p = BY[b.p], [fw, fd] = dims(p, b.r);
      for (let i = -1; i <= fw; i++) for (let j = -1; j <= fd; j++) for (let k = -1; k <= p.h; k++) {
        const inside = i >= 0 && i < fw && j >= 0 && j < fd && k >= 0 && k < p.h; if (inside) continue;
        const id = S.occ.get(key(b.x + i, b.y + k, b.z + j)); if (id && !seen.has(id)) { seen.add(id); qq.push(byId.get(id)); }
      }
    }
    for (const w of wheels) if (seen.has(w.id)) M.set(w.id, { w: 1.4, ph: 0 });
  }
  return M;
}
function computeRiders() {
  const out = [];
  for (const tt of S.bricks) {
    if (BY[tt.p].kind !== 'turntable' || !motion.has(tt.id)) continue;
    const set = new Set(), list = [], c = centre(tt);
    let layer = S.bricks.filter(b => b !== tt && b.y === tt.y + 1 && overlap(tt, b));
    while (layer.length) {
      const next = [];
      for (const b of layer) if (!set.has(b)) { set.add(b); list.push(b); next.push(...S.bricks.filter(o => !set.has(o) && o !== tt && o.y === b.y + BY[b.p].h && overlap(b, o))); }
      layer = next;
    }
    out.push({ tt, pivot: new V3(c.x - HALF, 0, c.z - HALF), items: list.map(b => ({ b, pos: b.mesh.position.clone(), ry: b.mesh.rotation.y })) });
  }
  return out;
}
function resetRiders() { for (const r of riders) for (const it of r.items) { it.b.mesh.position.copy(it.pos); it.b.mesh.rotation.y = it.ry; } riders = []; }
function setupMotion() { resetRiders(); motion = computeMotion(); riders = computeRiders(); dirty = true; }
function setPlay(on) {
  S.play = on;
  if (on) { setupMotion(); tone(520, 0.08); setTimeout(() => tone(780, 0.08), 90); }
  else { resetRiders(); for (const b of S.bricks) { const u = b.mesh.userData; if (u.glow) u.glow.mat.emissiveIntensity = 0.25; } dirty = true; }
  toolbar();
}
function animate(dt) {
  if (!S.play) return;
  playT += dt; const base = playT * Math.PI * 2 * 0.4;
  for (const b of S.bricks) {
    const u = b.mesh.userData, m = motion.get(b.id);
    if (m && u.spin.length) for (const s of u.spin) { const th = (m.w * base + m.ph) * s.mult; if (s.axis === 'x') s.obj.rotation.x = th; else s.obj.rotation.y = th; }
    if (u.glow) u.glow.mat.emissiveIntensity = !u.glow.blink || Math.floor(playT * 2.5) % 2 === 0 ? 1.2 : 0.08;
  }
  for (const r of riders) {
    const m = motion.get(r.tt.id), th = m.w * base + m.ph, c = Math.cos(th), s = Math.sin(th);
    for (const it of r.items) {
      const dx = it.pos.x - r.pivot.x, dz = it.pos.z - r.pivot.z;
      it.b.mesh.position.set(r.pivot.x + dx * c + dz * s, it.pos.y, r.pivot.z - dx * s + dz * c); it.b.mesh.rotation.y = it.ry + th;
    }
  }
  dirty = true;
}

// ---------------------------------------------------------------------
// camera. PC: fly around (mouse looks, WASD moves, wheel zooms)
// phones: orbit around the build (drag turns, pinch zooms)
// ---------------------------------------------------------------------
const cam = { target: new V3(0, 1, 0), r: 40, theta: -Math.PI * 0.8, phi: 0.95 };
const FLY = { pos: new V3(), yaw: 0, pitch: 0, locked: false };
function orbitToFly() {
  FLY.pos.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
  const d = cam.target.clone().sub(FLY.pos).normalize(); FLY.yaw = Math.atan2(-d.x, -d.z); FLY.pitch = Math.asin(d.y);
}
function placeCamera() {
  if (!touchMode) {
    FLY.pos.x = clamp(FLY.pos.x, -HALF - 40, HALF + 40); FLY.pos.z = clamp(FLY.pos.z, -HALF - 40, HALF + 40); FLY.pos.y = clamp(FLY.pos.y, 0.6, 90);
    camera.position.copy(FLY.pos); camera.rotation.set(FLY.pitch, FLY.yaw, 0); dirty = true; return;
  }
  cam.phi = clamp(cam.phi, 0.12, 1.5); cam.r = clamp(cam.r, 5, 110);
  cam.target.x = clamp(cam.target.x, -HALF - 4, HALF + 4); cam.target.z = clamp(cam.target.z, -HALF - 4, HALF + 4); cam.target.y = clamp(cam.target.y, 0, 40);
  camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
  camera.lookAt(cam.target); dirty = true;
}
const fwdVec = () => new V3(-Math.sin(FLY.yaw) * Math.cos(FLY.pitch), Math.sin(FLY.pitch), -Math.cos(FLY.yaw) * Math.cos(FLY.pitch));
function orbit(dx, dy) { cam.theta -= dx * 0.008; cam.phi -= dy * 0.008; placeCamera(); }
function pan(dx, dy) {
  const k = cam.r * 0.0016, right = new V3(Math.cos(cam.theta), 0, -Math.sin(cam.theta)), fwd = new V3(Math.sin(cam.theta), 0, Math.cos(cam.theta));
  cam.target.addScaledVector(right, -dx * k).addScaledVector(fwd, -dy * k); placeCamera();
}
function zoom(f) {
  if (!touchMode) { FLY.pos.addScaledVector(fwdVec(), f < 1 ? 2.2 : -2.2); placeCamera(); refreshHover(); return; }
  cam.r *= f; placeCamera();
}
const held = {};
function flyStep(dt) {
  if (touchMode) return false;
  const k = (c) => held[c] ? 1 : 0;
  const fw = k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown'), rt = k('KeyD') + k('ArrowRight') - k('KeyA') - k('ArrowLeft'), up = k('Space') - k('ShiftLeft') - k('ShiftRight');
  if (!fw && !rt && !up) return false;
  const sp = (held.ControlLeft || held.ControlRight ? 26 : 12) * dt, f = fwdVec(), r = new V3(Math.cos(FLY.yaw), 0, -Math.sin(FLY.yaw));
  FLY.pos.addScaledVector(f, fw * sp).addScaledVector(r, rt * sp); FLY.pos.y += up * sp; placeCamera(); return true;
}

// ---------------------------------------------------------------------
// pointing at things
// ---------------------------------------------------------------------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let ghost = null, hover = null, hoverMesh = null, lastPt = null;
const brickOf = (o) => { while (o && !(o.userData && o.userData.b)) o = o.parent; return o ? o.userData.b : null; };
function hitAt(cx, cy) {
  const r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([baseMesh, ...S.bricks.map(b => b.mesh)], true);
  return hits.find(h => h.object !== ghost) || null;
}
const curPart = () => S.held ? BY[S.held.p] : S.part, curRot = () => S.held ? S.held.r : S.rot, curColor = () => S.held ? S.held.c : S.color;
function targetFor(hit) {
  const p = curPart(), r = curRot(), [fw, fd] = dims(p, r);
  const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld), hb = brickOf(hit.object), pt = hit.point.clone();
  let y, side = false;
  if (n.y > 0.5) y = hb ? hb.y + BY[hb.p].h : 0;
  else if (n.y < -0.5) { if (!hb) return null; y = hb.y - p.h; }
  else { if (!hb) return null; side = true; pt.addScaledVector(n, 0.5); y = hb.y; }
  const cx = Math.floor(pt.x + HALF), cz = Math.floor(pt.z + HALF);
  let x = cx - Math.floor((fw - 1) / 2), z = cz - Math.floor((fd - 1) / 2);
  if (side) { if (n.x > 0.5) x = cx; else if (n.x < -0.5) x = cx - fw + 1; if (n.z > 0.5) z = cz; else if (n.z < -0.5) z = cz - fd + 1; }
  x = clamp(x, 0, SIZE - fw); z = clamp(z, 0, SIZE - fd);
  let ok = fits(p, x, y, z, r);
  if (!ok && n.y > 0.5) for (let yy = y + 1; yy < y + 60; yy++) if (fits(p, x, yy, z, r)) { y = yy; ok = true; break; }
  return { x, y, z, ok };
}
function setGhost(tg) {
  const p = curPart(), r = curRot();
  if (!ghost || ghost.userData.p !== p.id) { if (ghost) scene.remove(ghost); ghost = new THREE.Mesh(build(p).ghost, ghostOk); ghost.userData.p = p.id; ghost.renderOrder = 2; scene.add(ghost); }
  if (!tg) { ghost.visible = false; dirty = true; return; }
  const [fw, fd] = dims(p, r);
  ghost.visible = true; ghost.position.set(tg.x - HALF + fw / 2, tg.y * PLATE + 0.005, tg.z - HALF + fd / 2); ghost.rotation.y = SYMMETRIC[p.kind] ? 0 : -r * Math.PI / 2;
  ghost.material = tg.ok ? ghostOk : ghostBad; if (tg.ok) ghostOk.color.set(COLORS[curColor()][0]);
  dirty = true;
}
function setHoverMesh(m) {
  if (hoverMesh === m) return;
  if (hoverMesh && hoverMesh.userData.b) hoverMesh.material = hoverMesh.userData.baseMat;
  hoverMesh = m; if (m && m.userData.b) m.material = hiMats[m.userData.b.c]; dirty = true;
}
const placing = () => S.tool === 'build' || (S.tool === 'move' && S.held);
const centrePt = () => { const r = canvas.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
function updateHover(cx, cy) {
  lastPt = [cx, cy];
  const hit = hitAt(cx, cy), hb = hit && brickOf(hit.object);
  if (placing()) { setHoverMesh(null); hover = hit ? targetFor(hit) : null; setGhost(hover); }
  else { if (ghost) { ghost.visible = false; dirty = true; } hover = null; setHoverMesh(hb ? hb.mesh : null); }
}
function refreshHover() { if (FLY.locked) updateHover(...centrePt()); else if (lastPt) updateHover(lastPt[0], lastPt[1]); }

// ---------------------------------------------------------------------
// actions
// ---------------------------------------------------------------------
function remember(id) { S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 9); lsSet('bricks-recent', S.recent); quickbar(); }
function click(cx, cy) {
  audio(); updateHover(cx, cy);
  if (placing()) {
    if (!hover || !hover.ok) { tone(180, 0.08); return; }
    snapshot();
    addBrick({ p: curPart().id, c: curColor(), x: hover.x, y: hover.y, z: hover.z, r: curRot() });
    click3(); remember(curPart().id); if (S.held) S.held = null;
    changed(); refreshHover(); return;
  }
  const b = hoverMesh && hoverMesh.userData.b; if (!b) return;
  if (S.tool === 'move') { snapshot(); setHoverMesh(null); S.held = { p: b.p, c: b.c, r: b.r, from: [b.x, b.y, b.z] }; removeBrick(b); tone(520, 0.05); changed(); refreshHover(); }
  else if (S.tool === 'paint') { if (b.c === S.color) return; snapshot(); setHoverMesh(null); b.c = S.color; remesh(b); tone(700, 0.05); changed(); refreshHover(); }
  else if (S.tool === 'delete') deleteAt(cx, cy);
  else if (S.tool === 'pick') { S.part = BY[b.p]; S.color = b.c; S.rot = b.r; S.tab = KINDS[S.part.kind][1]; remember(b.p); setTool('build'); renderParts(); renderColors(); tone(880, 0.05); }
}
function deleteAt(cx, cy) {
  audio();
  if (S.held) { cancelHeld(); return; }
  const hit = hitAt(cx, cy), b = hit && brickOf(hit.object); if (!b) return;
  snapshot(); setHoverMesh(null); removeBrick(b); tone(300, 0.06); changed(); refreshHover();
}
function cancelHeld() {
  if (!S.held) return; const h = S.held, p = BY[h.p];
  if (h.from && fits(p, h.from[0], h.from[1], h.from[2], h.r)) addBrick({ p: h.p, c: h.c, x: h.from[0], y: h.from[1], z: h.from[2], r: h.r });
  S.held = null; undoStack.pop(); changed(); refreshHover();
}
function rotate() { if (S.held) S.held.r = (S.held.r + 1) % 4; else S.rot = (S.rot + 1) % 4; tone(600, 0.03); refreshHover(); }
function setTool(tl) { if (S.held && tl !== 'move') cancelHeld(); S.tool = tl; toolbar(); status(); refreshHover(); }
function choosePart(id) { if (!BY[id]) return; if (S.held) cancelHeld(); S.part = BY[id]; S.rot = 0; S.tab = KINDS[S.part.kind][1]; if (S.tool !== 'build') setTool('build'); renderParts(); quickbar(); refreshHover(); tone(800, 0.03); }
function cycleColor(dir) { S.color = (S.color + dir + COLORS.length) % COLORS.length; if (S.held) S.held.c = S.color; renderColors(); renderParts(); quickbar(); refreshHover(); }

let AC = null;
function audio() { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return AC; }
function tone(f, len) { if (!audio()) return; const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len); o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + len + 0.02); }
function click3() { tone(1400, 0.03); setTimeout(() => tone(900, 0.04), 30); }

// ---------------------------------------------------------------------
// PC controls: click the board to grab the mouse, then fly and build
// ---------------------------------------------------------------------
const lockMouse = () => { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
document.addEventListener('pointerlockchange', () => {
  FLY.locked = document.pointerLockElement === canvas;
  document.body.classList.toggle('flying', FLY.locked); if (!FLY.locked) for (const k in held) held[k] = false;
  status(); refreshHover();
});
document.addEventListener('mousemove', (e) => {
  if (!FLY.locked) return;
  FLY.yaw -= e.movementX * 0.0024; FLY.pitch = clamp(FLY.pitch - e.movementY * 0.0024, -1.55, 1.55); placeCamera();
});
document.addEventListener('mousedown', (e) => {
  if (!FLY.locked) return; e.preventDefault();
  const [cx, cy] = centrePt();
  if (e.button === 0) click(cx, cy); else if (e.button === 2) deleteAt(cx, cy); else if (e.button === 1) rotate();
});
document.addEventListener('wheel', (e) => { if (FLY.locked) { e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1); } }, { passive: false });

// mouse on the board while not flying, and every touch gesture
const pointers = new Map(); let gest = null, pinch = null;
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && !touchMode) {
    if (!FLY.locked) { audio(); e.preventDefault(); lockMouse(); }
    return;
  }
  canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) gest = { x: e.clientX, y: e.clientY, b: e.button, moved: false, shift: e.shiftKey, touch: e.pointerType !== 'mouse' };
  else { gest = null; const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && !touchMode) { if (!FLY.locked) updateHover(e.clientX, e.clientY); return; }
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
});
const up = (e) => {
  if (e.pointerType === 'mouse' && !touchMode) return;
  pointers.delete(e.pointerId);
  if (gest && !gest.moved && pointers.size === 0) { if (gest.b === 0) click(e.clientX, e.clientY); else if (gest.b === 2) deleteAt(e.clientX, e.clientY); }
  if (pointers.size < 2) pinch = null; if (pointers.size === 0) gest = null;
};
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); gest = null; pinch = null; });
canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !FLY.locked && !pointers.size) { if (ghost) ghost.visible = false; setHoverMesh(null); dirty = true; } });
canvas.addEventListener('wheel', (e) => { if (!FLY.locked) { e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1); if (lastPt) updateHover(...lastPt); } }, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('auxclick', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (ctrl && k === 'y') { e.preventDefault(); redo(); return; }
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    held[e.code] = true; if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); if (!touchMode) return;
  }
  if (ctrl) return;
  if (/^Digit[1-9]$/.test(e.code)) { const id = S.recent[+e.code.slice(5) - 1]; if (id) choosePart(id); return; }
  if (k === 'r') rotate();
  else if (k === 'c') cycleColor(1); else if (k === 'v') cycleColor(-1);
  else if (k === 'e' || k === 'tab') { e.preventDefault(); if (FLY.locked) document.exitPointerLock(); }
  else if (k === 'b') setTool('build'); else if (k === 'm') setTool('move'); else if (k === 'p') setTool('paint'); else if (k === 'i') setTool('pick');
  else if (k === 'x' || k === 'delete') setTool('delete');
  else if (k === 'g') setPlay(!S.play);
  else if (k === 'escape') { if (S.held) cancelHeld(); }
  else if (touchMode && (k === '+' || k === '=')) zoom(0.9); else if (touchMode && k === '-') zoom(1.1);
});
document.addEventListener('keyup', (e) => { held[e.code] = false; });
addEventListener('blur', () => { for (const k in held) held[k] = false; });

// ---------------------------------------------------------------------
// panels
// ---------------------------------------------------------------------
const TOOLS = [['build', '🧱'], ['move', '✋'], ['paint', '🎨'], ['pick', '💧'], ['delete', '🗑']];
function toolbar() {
  $('tools').innerHTML = TOOLS.map(([k, ic]) => `<button class="tool ${S.tool === k ? 'on' : ''}" data-tool="${k}" title="${t('bb_' + k)}"><b>${ic}</b><span>${t('bb_' + k)}</span></button>`).join('') +
    `<i class="sep"></i><button class="tool" data-act="rotate" title="${t('bb_rotate')} (R)"><b>↻</b><span>${t('bb_rotate')}</span></button>
     <button class="tool" data-act="undo" ${undoStack.length ? '' : 'disabled'} title="${t('bb_undo')} (Ctrl+Z)"><b>↶</b><span>${t('bb_undo')}</span></button>
     <button class="tool" data-act="redo" ${redoStack.length ? '' : 'disabled'} title="${t('bb_redo')} (Ctrl+Y)"><b>↷</b><span>${t('bb_redo')}</span></button>
     <i class="sep"></i><button class="tool ${S.play ? 'on' : ''}" data-act="play" title="G"><b>${S.play ? '⏸' : '▶'}</b><span>${t(S.play ? 'bb_stop' : 'bb_play')}</span></button>
     <button class="tool" data-act="saves"><b>🗂</b><span>${t('bb_saves')}</span></button>
     <button class="tool" data-act="photo"><b>📷</b><span>${t('bb_photo')}</span></button>
     <button class="tool" data-act="clear"><b>🧹</b><span>${t('bb_clear')}</span></button>`;
}
$('tools').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; audio();
  if (b.dataset.tool) return setTool(b.dataset.tool);
  const a = b.dataset.act;
  if (a === 'rotate') rotate(); if (a === 'undo') undo(); if (a === 'redo') redo(); if (a === 'saves') openSaves(); if (a === 'photo') photo(); if (a === 'play') setPlay(!S.play);
  if (a === 'clear' && S.bricks.length && confirm(t('bb_confirmClear'))) { snapshot(); load({ base: S.base, b: [] }); changed(); }
});
function iconFor(p, color) {
  const c = document.createElement('canvas'), N = 56; c.width = c.height = N; const g = c.getContext('2d');
  const col = COLORS[color][0], k = p.kind;
  const circle = (x, y, r, fill, stroke) => { g.beginPath(); g.arc(x, y, r, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); } };
  const studDots = (ox, oy, s, w, rows) => { for (let i = 0; i < w; i++) for (const j of rows) circle(ox + (i + 0.5) * s, oy + (j + 0.5) * s, s * 0.3, 'rgba(255,255,255,.28)', 'rgba(0,0,0,.3)'); };
  g.lineWidth = 1.5;
  if (k === 'gear') {
    const R = 8 + p.w * 3.4, T = p.teeth; g.beginPath();
    for (let i = 0; i < T * 2; i++) { const a = i / (T * 2) * Math.PI * 2, r = i % 2 ? R : R - 3.5; g.lineTo(28 + r * Math.cos(a), 28 + r * Math.sin(a)); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke(); circle(28, 28, 3, '#26282c'); return c.toDataURL();
  }
  if (k === 'wheel') { circle(28, 28, 22, '#1c1c1e'); circle(28, 28, 11, col, 'rgba(0,0,0,.3)'); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(26, 12, 4, 32); g.fillRect(12, 26, 32, 4); return c.toDataURL(); }
  if (k === 'fan') { g.fillStyle = col; for (let i = 0; i < 3; i++) { g.save(); g.translate(28, 28); g.rotate(i * 2.094); g.fillRect(2, -5, 22, 10); g.restore(); } circle(28, 28, 6, '#26282c'); return c.toDataURL(); }
  if (k === 'turntable') { circle(28, 28, 24, col, 'rgba(0,0,0,.35)'); circle(28, 28, 17, 'rgba(255,255,255,.15)', 'rgba(0,0,0,.25)'); g.font = '18px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('↻', 28, 34); return c.toDataURL(); }
  if (k === 'motor') { g.fillStyle = col; g.fillRect(8, 8, 40, 40); g.fillStyle = '#f2cd37'; g.fillRect(8, 30, 40, 7); g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(8, 8, 40, 40); g.fillStyle = '#9aa0a6'; g.fillRect(25, 14, 6, 14); g.fillRect(21, 18, 14, 6); return c.toDataURL(); }
  if (p.glow) { const gr = g.createRadialGradient(28, 28, 2, 28, 28, 26); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 56, 56); if (p.blink) { g.font = 'bold 14px sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('✶', 44, 16); } return c.toDataURL(); }
  // side views for tall things
  if (k === 'arch' || k === 'window' || k === 'door' || k === 'fence') {
    const s = Math.min(46 / p.d, 46 / (p.h * 0.4)), wd = p.d * s, ht = p.h * 0.4 * s, ox = (N - wd) / 2, oy = (N - ht) / 2;
    g.fillStyle = col; g.fillRect(ox, oy, wd, ht); g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(ox, oy, wd, ht);
    if (k === 'arch') { const r = (p.d / 2 - 1) * s; g.fillStyle = '#1a1f35'; g.fillRect(ox + s, oy + ht - (ht - 0.4 * s - r) - 0.5, wd - 2 * s, ht - 0.4 * s - r + 1); circle(ox + wd / 2, oy + 0.4 * s + r, r, '#1a1f35'); }
    if (k === 'window') { g.fillStyle = '#9fd2ff'; g.fillRect(ox + 0.25 * s, oy + 0.3 * s, wd - 0.5 * s, ht - 0.55 * s); }
    if (k === 'door') { g.fillStyle = '#6b4426'; g.fillRect(ox + 0.4 * s, oy + 0.5 * s, wd - 0.8 * s, ht - 0.5 * s); }
    if (k === 'fence') { g.clearRect(ox + 0.3 * s, oy + 0.3 * s, wd - 0.6 * s, ht - 0.7 * s); g.fillStyle = col; g.fillRect(ox, oy + ht * 0.55, wd, 0.2 * s); }
    return c.toDataURL();
  }
  if (k === 'tall' || k === 'pillar') {
    const s = Math.min(46 / p.d, 46 / 6), wd = p.d * s, ht = 6 * s, ox = (N - wd) / 2, oy = (N - ht) / 2;
    g.fillStyle = col; if (k === 'pillar') { g.beginPath(); g.ellipse(28, oy, wd / 2, 4, 0, 0, 7); g.fill(); } g.fillRect(ox, oy, wd, ht); g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(ox, oy, wd, ht); return c.toDataURL();
  }
  const w = p.w, d = p.d, s = Math.min(44 / Math.max(w, d), 18), ox = (N - w * s) / 2, oy = (N - d * s) / 2;
  if (k === 'round' || k === 'rplate' || k === 'cone' || k === 'rtile' || k === 'dome') {
    circle(N / 2, N / 2, w * s / 2, col, 'rgba(0,0,0,.35)');
    if (k === 'dome') circle(N / 2 - w * s * 0.15, N / 2 - w * s * 0.15, w * s * 0.18, 'rgba(255,255,255,.35)');
    if (k !== 'rtile' && k !== 'dome') studDots(ox, oy, s, w, [...Array(d).keys()]);
    return c.toDataURL();
  }
  g.fillStyle = col; g.fillRect(ox, oy, w * s, d * s); g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(ox, oy, w * s, d * s);
  if (k === 'slope' || k === 'islope') { const gr = g.createLinearGradient(0, oy, 0, oy + (d - 1) * s); gr.addColorStop(k === 'slope' ? 0 : 1, 'rgba(0,0,0,.35)'); gr.addColorStop(k === 'slope' ? 1 : 0, 'rgba(255,255,255,.18)'); g.fillStyle = gr; g.fillRect(ox, oy, w * s, (d - 1) * s); }
  if (k === 'tile') { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(ox + 2, oy + 2, w * s - 4, 3); }
  if (k !== 'tile') studDots(ox, oy, s, w, k === 'slope' ? [d - 1] : [...Array(d).keys()]);
  if (k === 'technic') for (let j = 1; j < d; j++) { g.fillStyle = '#26282c'; g.fillRect(ox + w * s - 4, oy + j * s - 3, 5, 6); }
  return c.toDataURL();
}
const iconCache = {};
const icon = (p, c) => iconCache[p.id + '/' + c] || (iconCache[p.id + '/' + c] = iconFor(p, c));
function renderParts() {
  $('tabs').innerHTML = TABS.map(k => `<button class="tab ${S.tab === k ? 'on' : ''}" data-tab="${k}">${t('bb_' + k)}</button>`).join('');
  $('parts').innerHTML = PARTS.filter(p => KINDS[p.kind][1] === S.tab).map(p =>
    `<button class="part ${S.part === p && !S.held ? 'on' : ''}" data-part="${p.id}" title="${t('p_' + p.kind)} ${label(p)}"><img src="${icon(p, S.color)}" alt=""><span>${label(p)}</span></button>`).join('') +
    (S.tab === 'func' ? `<p class="fhint">${t('bb_hint_func')}</p>` : '');
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { S.tab = b.dataset.tab; renderParts(); } });
$('parts').addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (b) choosePart(b.dataset.part); });
function renderColors() {
  $('colors').innerHTML = COLORS.map(([hex, a], i) => `<button class="sw ${S.color === i ? 'on' : ''} ${a ? 'trans' : ''}" data-c="${i}" style="--c:${hex}"></button>`).join('');
  $('bases').innerHTML = BASES.map(i => `<button class="sw small ${S.base === i ? 'on' : ''}" data-b="${i}" style="--c:${COLORS[i][0]}"></button>`).join('');
}
$('colors').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; S.color = +b.dataset.c; if (S.held) S.held.c = S.color; renderColors(); renderParts(); quickbar(); refreshHover(); });
$('bases').addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; snapshot(); setBase(+b.dataset.b); renderColors(); changed(); });
function quickbar() {
  const q = $('quick'); if (!q) return;
  q.innerHTML = S.recent.map((id, i) => `<button class="qs ${S.part.id === id && !S.held ? 'on' : ''}" data-q="${id}" title="${t('p_' + BY[id].kind)} ${label(BY[id])}"><img src="${icon(BY[id], S.color)}" alt=""><i>${i + 1}</i></button>`).join('') +
    `<span class="qc" style="--c:${COLORS[S.color][0]}" title="C / V"></span>`;
}
$('quick') && $('quick').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) choosePart(b.dataset.q); });
function status() {
  let hint;
  if (S.held) hint = t('bb_holding');
  else if (touchMode) hint = S.tool === 'build' ? t('bb_hint_touch') : t('bb_hint_' + S.tool);
  else hint = FLY.locked ? t('bb_hint_locked', { tool: t('bb_' + S.tool) }) : t('bb_hint_pc');
  $('status').innerHTML = `<b>${t('bb_count', { n: S.bricks.length })}</b><span>${hint}</span>`;
}

// saved builds ("bricks-saves" is synced to the Mal3ab account)
function savesList() { return lsGet('bricks-saves', {}); }
function openSaves() {
  if (FLY.locked) document.exitPointerLock();
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
    const id = Object.keys(all).find(k => all[k].name === name) || 's' + Date.now().toString(36);
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
function renderAll() { toolbar(); renderParts(); renderColors(); quickbar(); status(); if (window.applyLang) applyLang(); }
document.addEventListener('langchange', renderAll);
$('lang').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
const cur = lsGet('bricks-current', null);
if (cur && cur.b && cur.b.length) { S.name = cur.name || ''; load(cur); }
else {                               // a little house and a gear machine so the plate isn't empty
  const demo = [
    ['p6x6', 11, 13, 0, 13, 0],
    ['b1x2', 0, 13, 1, 13, 1], ['b1x2', 0, 17, 1, 13, 1], ['b1x6', 0, 13, 1, 18, 1], ['b1x4', 0, 13, 1, 14, 0], ['b1x4', 0, 18, 1, 14, 0],
    ['b1x6', 0, 13, 4, 13, 1], ['b1x6', 0, 13, 4, 18, 1], ['b1x1', 0, 13, 4, 14, 0], ['b1x2', 18, 13, 4, 15, 0], ['b1x1', 0, 13, 4, 17, 0],
    ['b1x1', 0, 18, 4, 14, 0], ['b1x2', 18, 18, 4, 15, 0], ['b1x1', 0, 18, 4, 17, 0],
    ['p6x6', 8, 13, 7, 13, 0],
    ['s4x2', 1, 13, 8, 13, 0], ['s2x2', 1, 17, 8, 13, 0], ['s4x2', 1, 13, 8, 17, 2], ['s2x2', 1, 17, 8, 17, 2], ['b2x6', 1, 13, 8, 15, 1],
    ['t2x2', 7, 15, 0, 11, 0], ['t2x2', 7, 15, 0, 9, 0], ['t2x2', 7, 15, 0, 7, 0],
    ['r1x1', 10, 8, 0, 9, 0], ['r1x1', 10, 8, 3, 9, 0], ['r2x2', 3, 7, 6, 8, 0], ['c1x1', 3, 8, 9, 9, 0],
    ['q1x1', 0, 21, 0, 12, 0], ['q1x1', 2, 22, 0, 14, 0], ['q1x1', 14, 21, 0, 15, 0], ['q1x1', 15, 11, 0, 11, 0],
    ['m2x2', 8, 24, 0, 24, 0], ['g16', 7, 24, 3, 24, 0], ['g8', 2, 26, 3, 25, 0], ['g24', 0, 21, 3, 24, 0], ['v1x1', 1, 26, 4, 25, 0], ['z1x1', 0, 27, 0, 27, 0]];
  load({ base: 3, b: demo.filter(a => BY[a[0]]) });
}
renderAll(); resize(); placeCamera(); orbitToFly(); placeCamera();
let last = performance.now();
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (canvas.clientWidth && (canvas.width !== Math.floor(canvas.clientWidth * renderer.getPixelRatio()))) resize();
  if (flyStep(dt) && FLY.locked) refreshHover();
  animate(dt);
  if (!dirty) return; dirty = false; renderer.render(scene, camera);
}
requestAnimationFrame(frame);
window.BB = { S, BY, PARTS, addBrick, load, serial, hitAt, click, deleteAt, setTool, rotate, undo, redo, setPlay, FLY, motion: () => motion, riders: () => riders, choosePart };   // for testing
})();
