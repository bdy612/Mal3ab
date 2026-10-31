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
  p_fan: 'مروحة', p_turntable: 'قاعدة بتلف', p_wheel: 'عجلة', p_light: 'نور', p_lightp: 'نور صغير', p_blink: 'نور بيرمش',
  bb_online: 'أونلاين', bb_onTitle: '🌐 ابنوا مع بعض', bb_onDesc: 'اعمل غرفة وابعت الكود أو اللينك لصاحبك — كل اللي يدخل بيبني في نفس المكان في نفس الوقت.', bb_create: '➕ اعمل غرفة', bb_join: 'ادخل', bb_code: 'الكود', bb_copyLink: '🔗 انسخ اللينك', bb_copied: 'اتنسخ ✓', bb_leave: 'اخرج من الغرفة', bb_room: 'الغرفة', bb_players: 'اللي بيبنوا', bb_joined: '{p} دخل يبني معاك', bb_left: '{p} خرج', bb_codeHint: 'اكتب كود من ٤ حروف', bb_you: 'إنت'
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
  p_fan: 'Fan', p_turntable: 'Turntable', p_wheel: 'Wheel', p_light: 'Light', p_lightp: 'Small light', p_blink: 'Blinking light',
  bb_online: 'Online', bb_onTitle: '🌐 Build together', bb_onDesc: 'Make a room and send the code or link to a friend — everyone in it builds in the same place at the same time.', bb_create: '➕ Create room', bb_join: 'Join', bb_code: 'Code', bb_copyLink: '🔗 Copy link', bb_copied: 'Copied ✓', bb_leave: 'Leave room', bb_room: 'Room', bb_players: 'Builders', bb_joined: '{p} joined to build with you', bb_left: '{p} left', bb_codeHint: 'Type a 4-letter code', bb_you: 'you'
});
// new parts, electrics and interaction
addStrings({
  bb_cat_bricks: '🧱 طوب', bb_cat_shapes: '🔺 أشكال', bb_cat_moving: '⚙ متحركة', bb_cat_electric: '⚡ كهربا', bb_cat_inter: '👆 تفاعلية',
  bb_g_windows: 'شبابيك وإزاز وسور', bb_g_wedges: 'مثلثات', bb_g_motors: 'موتورات', bb_g_spin: 'تروس وعجل', bb_g_mech: 'مكابس ومفصلات',
  bb_g_power: 'بطاريات وأسلاك', bb_g_lights: 'أنوار', bb_g_logic: 'منطق', bb_g_controls: 'مفاتيح وزراير', bb_g_doors: 'أبواب وبوابات',
  bb_p_half: 'نص طوبة', bb_p_wplate: 'لوح مثلث', bb_p_curve: 'مايلة مدورة', bb_p_ridge: 'سقف جمالون', bb_p_semi: 'نص دايرة', bb_p_glass: 'لوح إزاز', bb_p_gate: 'بوابة',
  bb_p_axle: 'محور', bb_p_motorx: 'موتور جانبي', bb_p_piston: 'مكبس', bb_p_hinge: 'مفصلة', bb_p_battery: 'بطارية', bb_p_wire: 'سلك', bb_p_cable: 'طوبة سلك',
  bb_p_switch: 'مفتاح', bb_p_button: 'زرار', bb_p_lever: 'دراع', bb_p_lamp: 'لمبة', bb_p_inverter: 'عاكس', bb_p_timer: 'تايمر',
  bb_use: 'E / دوس عشان تستخدمه', bb_on: 'شغال', bb_off: 'مطفي', bb_open: 'مفتوح', bb_closed: 'مقفول', bb_powered: '⚡ فيه كهربا', bb_unpowered: 'مفيش كهربا',
  bb_speed: 'سرعة {n}', bb_reverse: 'عكسي', bb_stopped: 'واقف', bb_pressed: 'اتداس', bb_mode_play: 'وضع اللعب',
  bb_hint_play_pc: 'كليك أو E على المفاتيح والزراير والأبواب والموتورات عشان تستخدمها · ⏸ يرجّعك للبناء',
  bb_hint_play_touch: 'دوس على المفاتيح والزراير والأبواب والموتورات عشان تستخدمها · ⏸ يرجّعك للبناء',
  bb_hint_mech: 'المكبس بيطلّع اللي فوقه لفوق، والمفصلة بتقلب اللي فوقها. لو مش متوصلين بكهربا بيتحركوا لوحدهم، ولو متوصلين بيستنوا الكهربا. دوس على الموتور في وضع اللعب يغيّر السرعة والاتجاه.',
  bb_hint_elec: 'بطارية ← سلك ← مفتاح ← لمبة: القطع لازم تلمس بعض. دوس ▶ شغّل وبعدين دوس على المفتاح. العاكس بيطلّع كهربا من قدّام لما مفيش كهربا داخلاله من ورا، والتايمر بيقطّع الكهربا ويرجّعها.',
  bb_hint_inter: 'في وضع اللعب ▶ دوس على الباب يتفتح، والدراع يتقلب، والزرار يدّي كهربا ثانية. لو وصّلت الباب بالكهربا بيتفتح لوحده.',
  bb_yes: 'أيوه', bb_no: 'لأ'
}, {
  bb_cat_bricks: '🧱 Bricks', bb_cat_shapes: '🔺 Shapes', bb_cat_moving: '⚙ Moving', bb_cat_electric: '⚡ Electric', bb_cat_inter: '👆 Interactive',
  bb_g_windows: 'Windows, Glass & Fences', bb_g_wedges: 'Wedges', bb_g_motors: 'Motors', bb_g_spin: 'Gears & Wheels', bb_g_mech: 'Pistons & Hinges',
  bb_g_power: 'Power & Wires', bb_g_lights: 'Lights', bb_g_logic: 'Logic', bb_g_controls: 'Switches & Buttons', bb_g_doors: 'Doors & Gates',
  bb_p_half: 'Half Brick', bb_p_wplate: 'Wedge Plate', bb_p_curve: 'Curved Slope', bb_p_ridge: 'Roof Ridge', bb_p_semi: 'Half Round', bb_p_glass: 'Glass Panel', bb_p_gate: 'Gate',
  bb_p_axle: 'Axle', bb_p_motorx: 'Side Motor', bb_p_piston: 'Piston', bb_p_hinge: 'Hinge', bb_p_battery: 'Battery', bb_p_wire: 'Wire', bb_p_cable: 'Wire Brick',
  bb_p_switch: 'Switch', bb_p_button: 'Push Button', bb_p_lever: 'Lever', bb_p_lamp: 'Lamp', bb_p_inverter: 'Inverter', bb_p_timer: 'Timer',
  bb_use: 'E / Tap To Use', bb_on: 'On', bb_off: 'Off', bb_open: 'Open', bb_closed: 'Closed', bb_powered: '⚡ Powered', bb_unpowered: 'No Power',
  bb_speed: 'Speed {n}', bb_reverse: 'Reverse', bb_stopped: 'Stopped', bb_pressed: 'Pressed', bb_mode_play: 'Play Mode',
  bb_hint_play_pc: 'Click or press E on switches, buttons, doors and motors to use them · ⏸ goes back to building',
  bb_hint_play_touch: 'Tap switches, buttons, doors and motors to use them · ⏸ goes back to building',
  bb_hint_mech: 'A piston lifts whatever is built on it, a hinge tips it up. Without wires they move on their own; wired up, they wait for power. Tap a motor in Play mode to change its speed and direction.',
  bb_hint_elec: 'Battery → wire → switch → lamp: the pieces have to touch. Press ▶ Play, then tap the switch. An inverter powers its front when its back has no power; a timer switches power on and off.',
  bb_hint_inter: 'In Play mode ▶ tap a door to open it, flip a lever, or press a button for a second of power. Wire a door to power and it opens by itself.',
  bb_yes: 'Yes', bb_no: 'No'
});

// ---------------------------------------------------------------------
// pieces and colours
// ---------------------------------------------------------------------
const PLATE = 0.4, SIZE = 32, HALF = SIZE / 2;
const COLORS = [
  ['#c91a09'], ['#0055bf'], ['#f2cd37'], ['#237841'], ['#a5ca18'], ['#f4f4f4'], ['#1b2a34'], ['#a0a5a9'], ['#6c6e68'], ['#fe8a18'],
  ['#583927'], ['#e4cd9e'], ['#0a3463'], ['#36aebf'], ['#fc97ac'], ['#8320b7'], ['#720e0f'], ['#e8f4f8', 0.42], ['#5a93db', 0.55], ['#e3302a', 0.55], ['#f5cd2f', 0.55],
  // added later: new colours go on the end so saved colour numbers keep their meaning
  ['#184632'], ['#958a73'], ['#078bc9'], ['#923978'], ['#ff698f'], ['#a95500'], ['#f8bb3d'], ['#9b9a5a'], ['#e1d5ed'], ['#aa7f2e'], ['#3f3691'], ['#ffc995'],
  ['#84b68d', 0.55], ['#f08f1c', 0.55], ['#aee9ef', 0.5], ['#a5a5cb', 0.5]
];
const COLOR_ORDER = COLORS.map((c, i) => i).sort((a, b) => (COLORS[a][1] ? 1 : 0) - (COLORS[b][1] ? 1 : 0) || a - b);   // solid colours first, see-through last
const BASES = [3, 7, 1, 11, 5, 21, 22];
// kind → [id prefix, group]; groups sit under the category tabs
const KINDS = {
  brick: ['b', 'bricks'], tall: ['h', 'bricks'], plate: ['p', 'plates'], tile: ['t', 'tiles'], rtile: ['o', 'tiles'], slope: ['s', 'slopes'], islope: ['i', 'slopes'],
  round: ['r', 'round'], rplate: ['q', 'round'], cone: ['c', 'round'], dome: ['d', 'round'], pillar: ['l', 'round'],
  arch: ['a', 'arches'], window: ['w', 'windows'], door: ['n', 'doors'], fence: ['f', 'windows'], technic: ['x', 'technic'],
  motor: ['m', 'motors'], gear: ['g', 'spin'], fan: ['v', 'spin'], turntable: ['u', 'spin'], wheel: ['e', 'spin'], light: ['y', 'lights'], lightp: ['k', 'lights'], blink: ['z', 'lights'],
  // new kinds (two-letter id prefixes)
  half: ['hb', 'bricks'], wplate: ['wp', 'wedges'], curve: ['cv', 'slopes'], ridge: ['rg', 'slopes'], semi: ['sm', 'round'], glass: ['gl', 'windows'], gate: ['gt', 'doors'],
  axle: ['ax', 'spin'], motorx: ['mx', 'motors'], piston: ['ps', 'mech'], hinge: ['hg', 'mech'],
  battery: ['bt', 'power'], wire: ['wr', 'power'], cable: ['cb', 'power'], lamp: ['lp', 'lights'], inverter: ['nt', 'logic'], timer: ['tm', 'logic'],
  switch: ['sw', 'controls'], button: ['bn', 'controls'], lever: ['lv', 'controls']
};
const NEWK = { half: 1, wplate: 1, curve: 1, ridge: 1, semi: 1, glass: 1, gate: 1, axle: 1, motorx: 1, piston: 1, hinge: 1, battery: 1, wire: 1, cable: 1, lamp: 1, inverter: 1, timer: 1, switch: 1, button: 1, lever: 1 };
// [group, category tab, label key]
const GROUPS = [['bricks', 'bricks', 'bb_bricks'], ['plates', 'bricks', 'bb_plates'], ['tiles', 'bricks', 'bb_tiles'], ['technic', 'bricks', 'bb_technic'], ['windows', 'bricks', 'bb_g_windows'],
  ['slopes', 'shapes', 'bb_slopes'], ['wedges', 'shapes', 'bb_g_wedges'], ['round', 'shapes', 'bb_round'], ['arches', 'shapes', 'bb_arches'],
  ['motors', 'moving', 'bb_g_motors'], ['spin', 'moving', 'bb_g_spin'], ['mech', 'moving', 'bb_g_mech'],
  ['power', 'electric', 'bb_g_power'], ['lights', 'electric', 'bb_g_lights'], ['logic', 'electric', 'bb_g_logic'],
  ['controls', 'inter', 'bb_g_controls'], ['doors', 'inter', 'bb_g_doors']];
const CAT = {}; for (const [g, c] of GROUPS) CAT[g] = c;
const TABS = ['bricks', 'shapes', 'moving', 'electric', 'inter'];
const catOf = (p) => CAT[KINDS[p.kind][1]];
const SYMMETRIC = { gear: 1, fan: 1, turntable: 1, round: 1, rplate: 1, rtile: 1, cone: 1, dome: 1, pillar: 1, lightp: 1, piston: 1, lamp: 1, button: 1, cable: 1 };
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
// --- added: more shapes, moving parts, electrics and interactive parts ---
each('half', [[1, 1], [1, 2], [1, 4], [2, 2], [2, 4]], 2);
each('wplate', [[2, 2], [3, 3], [2, 4], [4, 4]], 1);
each('curve', [[1, 2], [2, 2], [1, 4], [2, 4]], 3); each('ridge', [[1, 2], [2, 2], [4, 2]], 3);
P('round', 4, 4, 3); P('cone', 2, 2, 6); P('cone', 4, 4, 9); P('semi', 1, 2, 3); P('semi', 2, 4, 3);
P('glass', 1, 2, 6); P('glass', 1, 4, 9); P('glass', 1, 6, 15);
P('door', 1, 2, 15); P('gate', 1, 4, 6); P('gate', 1, 6, 6);
P('wheel', 1, 4, 10); each('axle', [[1, 2], [1, 4], [1, 6], [1, 8]], 1);
P('motorx', 2, 2, 3); P('piston', 1, 1, 3); P('piston', 2, 2, 3); P('hinge', 2, 2, 1); P('hinge', 4, 2, 1);
P('battery', 2, 2, 3); P('battery', 1, 2, 3); each('wire', [[1, 1], [1, 2], [1, 4], [1, 8], [2, 2]], 1); P('cable', 1, 1, 3);
P('lamp', 1, 1, 3, { glow: 1 }); P('lamp', 2, 2, 3, { glow: 1 }); P('inverter', 1, 1, 1); P('timer', 1, 1, 1);
P('switch', 1, 2, 2); P('button', 1, 1, 2); P('lever', 1, 2, 1);
const partName = (p) => t((NEWK[p.kind] ? 'bb_p_' : 'p_') + p.kind);
const KIND_N = {}; for (const p of PARTS) KIND_N[p.kind] = (KIND_N[p.kind] || 0) + 1;
const label = (p) => p.kind === 'gear' ? p.teeth + 'T' : NEWK[p.kind] && KIND_N[p.kind] === 1 ? partName(p) : p.w + '×' + p.d;

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
  rubber: std({ color: '#1c1c1e', roughness: 0.9 }), metal: std({ color: '#9aa0a6', metalness: 0.55, roughness: 0.35 }), yellow: std({ color: '#f2cd37' }), brown: std({ color: '#6b4426' }),
  copper: std({ color: '#b87333', metalness: 0.5, roughness: 0.35 }), copperOn: std({ color: '#ffb347', emissive: '#ff7a00', emissiveIntensity: 0.9 }),
  ledOff: std({ color: '#5a1414', emissive: '#2a0000', emissiveIntensity: 0.4 }), ledOn: std({ color: '#3dff6a', emissive: '#22ff55', emissiveIntensity: 1 }),
  red: std({ color: '#d01012' }), white: std({ color: '#f4f4f4' })
};
const ghostOk = std({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.4 });
const ghostBad = std({ color: '#ff3b3b', transparent: true, opacity: 0.45, depthWrite: false });
ghostOk.emissiveIntensity = 0.35;
const ghostLine = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95, depthTest: false });

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
// a 2D footprint in the (x, z) plane, pushed up to height H
const upX = (sh, H) => { const g = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false, curveSegments: 18 }); g.rotateX(Math.PI / 2); g.translate(0, H, 0); return g; };
const cyZ = (r, len, seg, x, y, z) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2).translate(x, y, z);
const shapeOf = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; };
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
  // o.tag names a part that moves with the piece's state (door, rocker, led…); o.ng leaves it out of the ghost
  const extra = (geo, mat, spin, pivot, o) => extras.push({ geo, mat, spin: spin || null, pivot: pivot || null, tag: (o && o.tag) || null, ng: !!(o && o.ng) });
  switch (p.kind) {
    case 'brick': case 'tall': case 'plate': case 'light': case 'half':
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
    case 'cone': body.push(cy(0.17, w / 2 - 0.03, H, 24, w / 2, H / 2, d / 2)); body.push(cy(0.16, 0.16, 0.17, 14, w / 2, H + 0.085, d / 2)); break;
    case 'wplate': body.push(upX(shapeOf([[e, e], [w - e, e], [e, d - e]]), H)); studs(body, w, d, H, (i, j) => (i + 0.5) / w + (j + 0.5) / d > 0.85); break;
    case 'curve': {
      const sh = new THREE.Shape(); sh.moveTo(e, 0); sh.lineTo(d - e, 0); sh.lineTo(d - e, H);
      sh.absellipse(d - e, 0.24, d - 2 * e, H - 0.24, Math.PI / 2, Math.PI, false); sh.lineTo(e, 0); body.push(prism(sh, w)); break;
    }
    case 'ridge': body.push(prism(shapeOf([[e, 0], [d - e, 0], [d - e, 0.24], [d / 2 + 0.12, H], [d / 2 - 0.12, H], [e, 0.24]]), w)); break;
    case 'semi': {
      const r = d / 2 - e, sh = new THREE.Shape(); sh.moveTo(e, e); sh.absarc(e, d / 2, r, -Math.PI / 2, Math.PI / 2, false); sh.closePath();
      body.push(upX(sh, H)); studs(body, w, d, H, (i, j) => Math.hypot(i + 0.5, j + 0.5 - d / 2) > r - 0.2); break;
    }
    case 'glass': {
      const ph = H - 0.68, py = 0.38 + ph / 2;
      body.push(bx(w - 0.04, 0.38, d - 0.04, w / 2, 0.19, d / 2), bx(w - 0.04, 0.3, d - 0.04, w / 2, H - 0.15, d / 2));
      for (const z of [0.12, d - 0.12]) body.push(bx(0.3, ph, 0.2, w / 2, py, z));
      studs(body, w, d, H); extra(bx(0.08, ph, d - 0.36, w / 2, py, d / 2), 'glass'); break;
    }
    case 'gate': {
      body.push(bx(0.4, H, 0.36, 0.5, H / 2, 0.2)); body.push(stud(0, 0, H));
      const L = d - 0.46, z0 = 0.42, n = d * 2 - 1, g = [bx(0.14, 0.2, L, 0.5, 0.45, z0 + L / 2), bx(0.14, 0.2, L, 0.5, H - 0.35, z0 + L / 2)];
      for (let k = 0; k < n; k++) g.push(bx(0.12, H - 0.5, 0.16, 0.5, 0.25 + (H - 0.5) / 2, z0 + 0.12 + k * (L - 0.24) / (n - 1)));
      extra(merge(g), 'own', null, [0.5, 0, 0.4], { tag: 'door' }); break;
    }
    case 'axle':
      for (const z of [0.07, d - 0.07]) body.push(cyZ(0.2, 0.12, 12, 0.5, 0.2, z));
      extra(merge([bx(0.34, 0.1, d - 0.2, 0.5, 0.2, d / 2), bx(0.1, 0.34, d - 0.2, 0.5, 0.2, d / 2)]), 'own', 'z', [0.5, 0.2, d / 2]); break;
    case 'motorx':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H);
      extra(bx(w, 0.22, d, w / 2, 0.55, d / 2), 'yellow'); extra(cyZ(0.38, 0.06, 20, w / 2, H / 2, d), 'dark');
      extra(merge([bx(0.55, 0.13, 0.2, w / 2, H / 2, d + 0.1), bx(0.13, 0.55, 0.2, w / 2, H / 2, d + 0.1)]), 'metal', 'z', [w / 2, H / 2, d]); break;
    case 'piston': {
      const hh = H - 0.4, head = [bx(w - 0.04, 0.39, d - 0.04, w / 2, hh + 0.195, d / 2)]; studs(head, w, d, H);
      body.push(bx(w - 0.04, hh, d - 0.04, w / 2, hh / 2, d / 2)); extra(bx(w, 0.16, d, w / 2, hh * 0.5, d / 2), 'yellow');
      extra(merge(head), 'own', null, [w / 2, hh, d / 2], { tag: 'head' });
      extra(cy(0.17 * w, 0.17 * w, 1, 14, w / 2, hh + 0.5, d / 2), 'metal', null, [w / 2, hh, d / 2], { tag: 'rod', ng: 1 }); break;
    }
    case 'hinge': {
      const flap = [bx(w - 0.04, H - 0.14, d - 0.06, w / 2, 0.14 + (H - 0.14) / 2, d / 2 - 0.01)]; studs(flap, w, d, H);
      body.push(bx(w - 0.04, 0.12, d - 0.04, w / 2, 0.06, d / 2)); extra(cyX(0.16, w - 0.1, 12, w / 2, 0.22, d - 0.15), 'metal');
      extra(merge(flap), 'own', null, [w / 2, H, d], { tag: 'flap' }); break;
    }
    case 'battery': {
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H); extra(bx(w, 0.3, d, w / 2, H - 0.25, d / 2), 'copper');
      const s = 0.32, bolt = shapeOf([[0.15, 1], [-0.45, -0.1], [-0.05, -0.1], [-0.15, -1], [0.45, 0.1], [0.05, 0.1]].map(([z, y]) => [d / 2 + z * s, 0.45 + y * s]));
      const g = new THREE.ExtrudeGeometry(bolt, { depth: w + 0.02, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(w + 0.01, 0, 0); extra(g, 'yellow'); break;
    }
    case 'wire':
      body.push(bx(w - 0.04, H - 0.04, d - 0.04, w / 2, (H - 0.04) / 2, d / 2));
      extra(merge([bx(0.2, 0.05, d - 0.16, w / 2, H - 0.03, d / 2)].concat(w > 1 ? [bx(w - 0.16, 0.05, 0.2, w / 2, H - 0.03, d / 2)] : [])), 'copper', null, null, { tag: 'copper' }); break;
    case 'cable':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); studs(body, w, d, H);
      extra(merge([bx(w, 0.1, d, w / 2, H * 0.3, d / 2), bx(w, 0.1, d, w / 2, H * 0.7, d / 2)]), 'copper', null, null, { tag: 'copper' }); break;
    case 'lamp': {
      if (w === 1) body.push(new THREE.SphereGeometry(0.36, 20, 14).translate(0.5, 0.68, 0.5));
      else body.push(new THREE.SphereGeometry(w / 2 - 0.14, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2).translate(w / 2, 0.3, d / 2));
      extra(cy(w / 2 - 0.06, w / 2 - 0.03, 0.32, 20, w / 2, 0.16, d / 2), 'dark'); break;
    }
    case 'inverter': case 'timer':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2));
      if (p.kind === 'inverter') { extra(upX(shapeOf([[0.25, 0.2], [0.75, 0.2], [0.5, 0.66]]), 0.04).translate(0, H, 0), 'white'); extra(cy(0.09, 0.09, 0.06, 10, 0.5, H + 0.03, 0.82), 'ledOff', null, null, { tag: 'led' }); }
      else {
        extra(cy(0.34, 0.34, 0.04, 20, 0.5, H + 0.02, 0.5), 'white'); extra(cy(0.06, 0.06, 0.06, 8, 0.88, H + 0.03, 0.88), 'ledOff', null, null, { tag: 'led' });
        extra(bx(0.05, 0.03, 0.28, 0.5, H + 0.055, 0.63), 'dark', null, [0.5, H, 0.5], { tag: 'hand' });
      }
      break;
    case 'switch': {
      const hb = 0.5; body.push(bx(w - 0.04, hb, d - 0.04, w / 2, hb / 2, d / 2));
      extra(bx(0.56, 0.18, d * 0.6, w / 2, hb + 0.09, d / 2), 'dark', null, [w / 2, hb, d / 2], { tag: 'rocker' });
      extra(cy(0.09, 0.09, 0.06, 10, w / 2, hb + 0.03, 0.17), 'ledOff', null, null, { tag: 'led' }); break;
    }
    case 'button': {
      const hb = 0.45; body.push(bx(w - 0.04, hb, d - 0.04, w / 2, hb / 2, d / 2));
      extra(cy(0.32, 0.32, 0.22, 20, w / 2, hb + 0.11, d / 2), 'red', null, [w / 2, hb, d / 2], { tag: 'cap' }); break;
    }
    case 'lever':
      body.push(bx(w - 0.04, H, d - 0.04, w / 2, H / 2, d / 2)); extra(cyX(0.13, 0.5, 10, w / 2, H, d / 2), 'metal');
      extra(cy(0.05, 0.05, 0.9, 8, w / 2, H + 0.45, d / 2), 'metal', null, [w / 2, H, d / 2], { tag: 'stick' });
      extra(new THREE.SphereGeometry(0.14, 12, 8).translate(w / 2, H + 0.92, d / 2), 'red', null, [w / 2, H, d / 2], { tag: 'stick' }); break;
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
      const dp = [0.5, 0, 0.425], dt = { tag: 'door' };   // the door leaf swings on its left edge
      extra(bx(0.14, H - 0.55, d - 0.85, 0.5, (H - 0.55) / 2 + 0.02, d / 2), 'brown', null, dp, dt);
      extra(bx(0.2, 0.12, 0.12, 0.5, H * 0.45, d - 0.75), 'metal', null, dp, dt);
      extra(bx(0.16, (H - 0.55) * 0.35, (d - 0.85) * 0.6, 0.5, H * 0.72, d / 2), 'glass', null, dp, dt);
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
    if (x.pivot) { const pv = new V3(x.pivot[0] - w / 2, x.pivot[1], x.pivot[2] - d / 2); geo.translate(-pv.x, -pv.y, -pv.z); return { geo, mat: x.mat, spin: x.spin, pivot: pv, tag: x.tag, ng: x.ng }; }
    return { geo, mat: x.mat, spin: null, pivot: null, tag: x.tag, ng: x.ng };
  }) };
  out.body.computeBoundingSphere();
  // the whole outline for the see-through "ghost"
  out.ghost = merge([out.body.clone(), ...out.extras.filter(x => !x.ng).map(x => x.pivot ? x.geo.clone().translate(x.pivot.x, x.pivot.y, x.pivot.z) : x.geo.clone())]);
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
const ON = { ch: null, code: '', ready: false, me: Math.random().toString(36).slice(2, 10), peers: new Map(), joinedW: 0, synced: false };
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
  root.castShadow = root.receiveShadow = true; root.userData = { b, baseMat: mat, spin: [], tags: {}, cur: {}, tagsAny: false, glow: p.glow ? { mat, blink: !!p.blink } : null };
  for (const x of g.extras) {
    const m = new THREE.Mesh(x.geo, x.mat === 'own' ? mats[b.c] : FIX[x.mat]); m.castShadow = x.mat !== 'glass'; m.receiveShadow = true;
    if (x.pivot) {
      const pv = new THREE.Object3D(); pv.position.copy(x.pivot); pv.userData.rest = x.pivot.clone(); pv.add(m); root.add(pv);
      if (x.spin) root.userData.spin.push({ obj: pv, axis: x.spin, mult: p.kind === 'fan' ? 3 : 1 });
    } else root.add(m);
    if (x.tag) { (root.userData.tags[x.tag] = root.userData.tags[x.tag] || []).push(m); root.userData.tagsAny = true; }
  }
  return root;
}
// piece state (switch on, door open, motor speed…): b.s, saved as an optional 8th field
const DEF = { motor: { on: 1, sp: 1, dir: 1 }, motorx: { on: 1, sp: 1, dir: 1 }, piston: { on: 1 }, hinge: { on: 1 }, lamp: { on: 1 }, light: { on: 1 }, lightp: { on: 1 }, blink: { on: 1 },
  switch: { on: 0 }, lever: { on: 0 }, door: { on: 0 }, gate: { on: 0 }, timer: { sp: 1 } };
const kindOf = (b) => BY[b.p].kind;
function initState(b, s) {
  const d = DEF[kindOf(b)]; if (!d) { b.s = null; return; }
  b.s = Object.assign({}, d);
  if (s && typeof s === 'object') for (const k in d) if (typeof s[k] === 'number' && isFinite(s[k])) b.s[k] = k === 'sp' ? clamp(Math.round(s[k]), 1, 3) : k === 'dir' ? (s[k] < 0 ? -1 : 1) : (s[k] ? 1 : 0);
}
function stateOut(b) { const d = DEF[kindOf(b)]; if (!d || !b.s) return null; for (const k in d) if (b.s[k] !== d[k]) return Object.assign({}, b.s); return null; }
const arrOf = (b) => { const a = [b.p, b.c, b.x, b.y, b.z, b.r, b.u], s = stateOut(b); if (s) a.push(s); return a; };
function addBrick(b) { b.id = nextId++; b.u = b.u || ON.me + '-' + b.id; initState(b, b.s); S.bricks.push(b); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.set(k, b.id); b.mesh = meshFor(b); vis(b, null); scene.add(b.mesh); dirty = true; return b; }
function removeBrick(b) { const i = S.bricks.indexOf(b); if (i < 0) return; S.bricks.splice(i, 1); for (const k of cells(BY[b.p], b.x, b.y, b.z, b.r)) S.occ.delete(k); scene.remove(b.mesh); anim.delete(b); dirty = true; }
function remesh(b) { scene.remove(b.mesh); b.mesh = meshFor(b); vis(b, null); scene.add(b.mesh); dirty = true; }
const serial = () => ({ v: 1, base: S.base, b: S.bricks.map(arrOf) });
function load(data) {
  for (const b of [...S.bricks]) removeBrick(b);
  if (!data) data = { b: [] };
  setBase(data.base != null && COLORS[data.base] ? data.base : 3);
  for (const a of data.b || []) if (BY[a[0]] && COLORS[a[1]] && fits(BY[a[0]], a[2], a[3], a[4], a[5])) addBrick({ p: a[0], c: a[1], x: a[2], y: a[3], z: a[4], r: a[5], u: a[6], s: a[7] });
  status();
}
function setBase(i) { S.base = i; baseMat.color.set(COLORS[i][0]); dirty = true; }

const undoStack = [], redoStack = [];
function snapshot() { undoStack.push(JSON.stringify(serial())); if (undoStack.length > 80) undoStack.shift(); redoStack.length = 0; }
function undo() { if (!undoStack.length) return; redoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(undoStack.pop())); changed(); netState(); }
function redo() { if (!redoStack.length) return; undoStack.push(JSON.stringify(serial())); S.held = null; load(JSON.parse(redoStack.pop())); changed(); netState(); }
let saveT = 0;
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(() => lsSet('bricks-current', Object.assign(serial(), { name: S.name })), 700); }
function changed() { status(); saveSoon(); toolbar(); if (S.play) setupMotion(); }

// ---------------------------------------------------------------------
// moving parts and electricity (only while ▶ Play is on)
//  · motors turn whatever sits on them, gears turn the gears next to them,
//    wheels and axles turn when a motor is built into the same model,
//    a turntable / piston / hinge carries everything built on top of it
//  · power: batteries feed every wire / closed switch they touch (a BFS over
//    touching pieces, 20 times a second). A lamp, motor, piston, hinge or door
//    that touches an electric piece is "wired" and only works when powered;
//    one that isn't wired just works on its own.
// ---------------------------------------------------------------------
const centre = (b) => { const p = BY[b.p], [fw, fd] = dims(p, b.r); return { x: b.x + fw / 2, z: b.z + fd / 2, y: b.y, top: b.y + p.h }; };
const overlap = (a, b) => { const [aw, ad] = dims(BY[a.p], a.r), [bw, bd] = dims(BY[b.p], b.r); return a.x < b.x + bw && b.x < a.x + aw && a.z < b.z + bd && b.z < a.z + ad; };
const DRIVEN = { gear: 1, fan: 1, turntable: 1 }, ROLL = { wheel: 1, axle: 1 }, MOTOR = { motor: 1, motorx: 1 };
const EL = { battery: 1, wire: 1, cable: 1, switch: 1, lever: 1, button: 1, inverter: 1, timer: 1 };
const CONS = { lamp: 1, light: 1, lightp: 1, blink: 1, motor: 1, motorx: 1, piston: 1, hinge: 1, door: 1, gate: 1 };
const FRONT = [[0, 1], [-1, 0], [0, -1], [1, 0]];   // world (dx, dz) of a piece's local +z for each rotation
const PISTON = 6 * PLATE;                            // a piston lifts two bricks
const LIGHT_CAP = touchMode ? 4 : 8;
let SIM = null, LIVE = new Set(), riders = [], playT = 0, nextTick = 0, plights = [];
const motorAng = new Map(), anim = new Set();
const timerOn = (b) => Math.floor(playT * [1, 2, 4][((b.s && b.s.sp) || 1) - 1]) % 2 === 0;
function neighbours(b) {   // ids of the pieces touching b's faces
  const p = BY[b.p], [fw, fd] = dims(p, b.r), out = new Set();
  const look = (x, y, z) => { const id = S.occ.get(key(x, y, z)); if (id && id !== b.id) out.add(id); };
  for (let i = 0; i < fw; i++) for (let j = 0; j < fd; j++) { look(b.x + i, b.y - 1, b.z + j); look(b.x + i, b.y + p.h, b.z + j); }
  for (let k = 0; k < p.h; k++) {
    for (let i = 0; i < fw; i++) { look(b.x + i, b.y + k, b.z - 1); look(b.x + i, b.y + k, b.z + fd); }
    for (let j = 0; j < fd; j++) { look(b.x - 1, b.y + k, b.z + j); look(b.x + fw, b.y + k, b.z + j); }
  }
  return out;
}
// what each motor drives: id → { m: motor id, w: speed ratio, ph: phase }
function computeDrive(byId) {
  const M = new Map(), funcs = S.bricks.filter(b => DRIVEN[kindOf(b)]), q = [];
  for (const b of S.bricks) { const k = kindOf(b); if (MOTOR[k]) M.set(b.id, { m: b.id, w: 1, ph: 0 }); if (k === 'motor') q.push(b); }
  while (q.length) {
    const a = q.shift(), pa = BY[a.p], ca = centre(a), sa = M.get(a.id);
    for (const b of funcs) {
      const pb = BY[b.p]; if (M.has(b.id)) continue;
      const cb = centre(b), sameAxle = Math.abs(ca.x - cb.x) < 0.01 && Math.abs(ca.z - cb.z) < 0.01;
      if (overlap(a, b) && ((pa.kind === 'motor' && cb.y === ca.top) || (pa.kind !== 'motor' && sameAxle && (cb.y === ca.top || cb.top === ca.y)))) { M.set(b.id, { m: sa.m, w: sa.w, ph: sa.ph }); q.push(b); continue; }
      if (pa.kind === 'gear' && pb.kind === 'gear' && ca.y === cb.y && Math.abs(Math.hypot(ca.x - cb.x, ca.z - cb.z) - (pa.w + pb.w) / 2) < 0.2) {
        const alpha = Math.atan2(-(cb.z - ca.z), cb.x - ca.x), ratio = pa.teeth / pb.teeth;
        M.set(b.id, { m: sa.m, w: -sa.w * ratio, ph: -sa.ph * ratio + alpha * (1 + ratio) + Math.PI + Math.PI / pb.teeth }); q.push(b);
      }
    }
  }
  // wheels and axles turn when a motor is built into the same model (touching pieces)
  if (S.bricks.some(b => ROLL[kindOf(b)])) {
    const seen = new Map(), qq = [];
    for (const b of S.bricks) if (MOTOR[kindOf(b)]) { seen.set(b.id, b.id); qq.push(b); }
    while (qq.length) {
      const b = qq.shift(), p = BY[b.p], [fw, fd] = dims(p, b.r), m = seen.get(b.id);
      for (let i = -1; i <= fw; i++) for (let j = -1; j <= fd; j++) for (let k = -1; k <= p.h; k++) {
        if (i >= 0 && i < fw && j >= 0 && j < fd && k >= 0 && k < p.h) continue;
        const id = S.occ.get(key(b.x + i, b.y + k, b.z + j)); if (id && !seen.has(id)) { seen.set(id, m); qq.push(byId.get(id)); }
      }
    }
    for (const b of S.bricks) if (ROLL[kindOf(b)] && seen.has(b.id) && !M.has(b.id)) M.set(b.id, { m: seen.get(b.id), w: kindOf(b) === 'wheel' ? 1.4 : 1, ph: 0 });
  }
  return M;
}
// turntables, pistons and hinges carry the pieces stacked on them
function computeCarriers(drive) {
  const list = [];
  for (const c of S.bricks) {
    const k = kindOf(c); if (!((k === 'turntable' && drive.has(c.id)) || k === 'piston' || k === 'hinge')) continue;
    const p = BY[c.p], set = new Set();
    let layer = S.bricks.filter(b => b !== c && b.y === c.y + p.h && overlap(c, b));
    while (layer.length) {
      const next = [];
      for (const b of layer) if (!set.has(b)) { set.add(b); next.push(...S.bricks.filter(o => !set.has(o) && o !== c && o.y === b.y + BY[b.p].h && overlap(b, o))); }
      layer = next;
    }
    c.mesh.updateMatrixWorld(true);
    const car = { c, k, items: [...set], T: new THREE.Matrix4() };
    if (k === 'turntable') { const cc = centre(c); car.pivot = new V3(cc.x - HALF, 0, cc.z - HALF); }
    if (k === 'hinge') { car.pivot = c.mesh.localToWorld(new V3(0, p.h * PLATE - 0.01, p.d / 2)); car.axis = new V3(1, 0, 0).applyQuaternion(c.mesh.quaternion); }
    list.push(car);
  }
  list.sort((a, b) => a.c.y - b.c.y);
  const R = new Map();
  for (const car of list) for (const b of car.items) { let r = R.get(b); if (!r) R.set(b, r = { b, pos: b.mesh.position.clone(), q: b.mesh.quaternion.clone(), cars: [] }); r.cars.push(car); }
  riders = [...R.values()];
  return list;
}
function resetRiders() { for (const r of riders) { r.b.mesh.position.copy(r.pos); r.b.mesh.quaternion.copy(r.q); } riders = []; }
function setupMotion() {
  resetRiders();
  const byId = new Map(S.bricks.map(b => [b.id, b])), elec = S.bricks.filter(b => EL[kindOf(b)]), adj = new Map(), wired = new Set();
  for (const b of elec) { const n = neighbours(b); adj.set(b.id, n); for (const id of n) { const o = byId.get(id); if (o && CONS[kindOf(o)]) wired.add(id); } }
  const drive = computeDrive(byId);
  SIM = { byId, elec, adj, wired, drive, carriers: computeCarriers(drive),
    motors: S.bricks.filter(b => MOTOR[kindOf(b)]), movers: S.bricks.filter(b => kindOf(b) === 'piston' || kindOf(b) === 'hinge'),
    glows: S.bricks.filter(b => BY[b.p].glow), tagged: S.bricks.filter(b => b.mesh.userData.tagsAny) };
  for (const b of SIM.movers) b.ext = b.ext || 0;
  powerTick(); dirty = true;
}
function powerTick() {
  if (!SIM) return;
  const prev = LIVE, next = new Set(), q = [], { byId, adj } = SIM, now = performance.now();
  const conducts = (n) => { const k = kindOf(n); if (k === 'switch' || k === 'lever') return !!n.s.on; if (k === 'button') return (n.press || 0) > now; if (k === 'timer') return timerOn(n); return k === 'wire' || k === 'cable' || k === 'battery'; };
  const reach = (n) => {
    if (!n || next.has(n.id)) return; const k = kindOf(n);
    if (CONS[k]) { next.add(n.id); return; }
    if (EL[k] && k !== 'inverter' && conducts(n)) { next.add(n.id); q.push(n); }
  };
  for (const b of SIM.elec) {
    const k = kindOf(b);
    if (k === 'battery' || (k === 'timer' && timerOn(b))) reach(b);
    else if (k === 'inverter') {   // NOT gate: input behind it, output in front of it
      const [dx, dz] = FRONT[b.r], at = (x, z) => byId.get(S.occ.get(key(x, b.y, z)));
      const inp = at(b.x - dx, b.z - dz); b.out = !(inp && prev.has(inp.id));
      if (b.out) reach(at(b.x + dx, b.z + dz));
    }
  }
  while (q.length) { const a = q.shift(); for (const id of adj.get(a.id) || []) reach(byId.get(id)); }
  LIVE = next;
}
const isOn = (b) => !!b.s && !!b.s.on && (!SIM || !SIM.wired.has(b.id) || LIVE.has(b.id));   // works on its own, or waits for power when wired
// pieces whose look follows their state (switch rocker, door leaf, piston head…)
const ease = (cur, tgt, dt, sp) => dt == null ? tgt : cur + (tgt - cur) * Math.min(1, dt * sp);
function vis(b, dt) {
  const u = b.mesh && b.mesh.userData; if (!u || !u.tagsAny) return false;
  const k = kindOf(b), tg = u.tags, s = b.s || {}, play = S.play && !!SIM, live = play && LIVE.has(b.id);
  let moving = false;
  const go = (name, tgt, sp) => { const c = u.cur[name] == null ? tgt : u.cur[name]; let v = ease(c, tgt, dt, sp || 12); if (Math.abs(v - tgt) < 0.003) v = tgt; u.cur[name] = v; if (v !== tgt) moving = true; return v; };
  const piv = (name) => (tg[name] || []).map(m => m.parent);
  const setMat = (name, mat) => { for (const m of tg[name] || []) m.material = mat; };
  switch (k) {
    case 'switch': { const a = go('a', s.on ? -0.26 : 0.26); for (const o of piv('rocker')) o.rotation.x = a; setMat('led', s.on ? FIX.ledOn : FIX.ledOff); break; }
    case 'lever': { const a = go('a', s.on ? -0.7 : 0.7); for (const o of piv('stick')) o.rotation.x = a; break; }
    case 'button': { const pr = (b.press || 0) > performance.now(), y = go('y', pr ? -0.14 : 0, 20); for (const o of piv('cap')) o.position.y = o.userData.rest.y + y; if (pr) moving = true; break; }
    case 'door': case 'gate': { const open = s.on || (play && SIM.wired.has(b.id) && live); const a = go('a', open ? -1.5 : 0, 6); for (const o of piv('door')) o.rotation.y = a; break; }
    case 'piston': { const e = (play ? b.ext || 0 : 0) * PISTON; for (const o of piv('head')) o.position.y = o.userData.rest.y + e; for (const o of piv('rod')) { o.scale.y = Math.max(0.001, e); o.visible = e > 0.01; } break; }
    case 'hinge': { const a = (play ? b.ext || 0 : 0) * Math.PI / 2; for (const o of piv('flap')) o.rotation.x = a; break; }
    case 'wire': case 'cable': setMat('copper', live ? FIX.copperOn : FIX.copper); break;
    case 'inverter': setMat('led', play && b.out ? FIX.ledOn : FIX.ledOff); break;
    case 'timer': setMat('led', play && timerOn(b) ? FIX.ledOn : FIX.ledOff); for (const o of piv('hand')) o.rotation.y = play ? -playT * [1, 2, 4][(s.sp || 1) - 1] * Math.PI : 0; break;
  }
  return moving;
}
function lightPool(on) {
  for (const L of plights) scene.remove(L); plights = [];
  if (!on) return;
  const n = Math.min(LIGHT_CAP, S.bricks.filter(b => BY[b.p].glow).length);
  for (let i = 0; i < n; i++) { const L = new THREE.PointLight(0xffffff, 0, 7, 1.6); scene.add(L); plights.push(L); }
}
function setPlay(on) {
  if (on && S.held) cancelHeld();
  S.play = on; document.body.classList.toggle('playing', on);
  if (on) { nextTick = playT; LIVE = new Set(); setupMotion(); lightPool(true); tone(520, 0.08); setTimeout(() => tone(780, 0.08), 90); if (touchMode) toast(t('bb_hint_play_touch')); }
  else {
    resetRiders(); lightPool(false); SIM = null; LIVE = new Set();
    for (const b of S.bricks) { const u = b.mesh.userData; if (u.glow) u.glow.mat.emissiveIntensity = 0.25; if (u.tagsAny) { b.ext = 0; anim.add(b); } }
    dirty = true;
  }
  toolbar(); status(); refreshHover();
}
const tmA = new THREE.Matrix4(), tmB = new THREE.Matrix4(), tmM = new THREE.Matrix4(), tmS = new V3(), ONE = new V3(1, 1, 1);
const thOf = (b) => { const d = SIM.drive.get(b.id); return d ? d.w * (motorAng.get(d.m) || 0) + d.ph : 0; };
function animate(dt) {
  if (!S.play || !SIM) { if (anim.size) { for (const b of [...anim]) if (!vis(b, dt)) anim.delete(b); dirty = true; } return; }
  playT += dt; anim.clear();
  if (playT >= nextTick) { nextTick = playT + 0.05; powerTick(); }
  for (const b of SIM.motors) { const s = b.s; b.run = isOn(b); if (b.run) motorAng.set(b.id, (motorAng.get(b.id) || 0) + dt * Math.PI * 2 * 0.4 * s.sp * s.dir); }
  for (const [id, d] of SIM.drive) {
    const b = SIM.byId.get(id); if (!b || !b.mesh.userData.spin.length) continue;
    const A = motorAng.get(d.m) || 0; for (const sp of b.mesh.userData.spin) sp.obj.rotation[sp.axis] = (d.w * A + d.ph) * sp.mult;
  }
  for (const b of SIM.movers) {   // unwired: goes up and down by itself; wired: up while powered
    const wired = SIM.wired.has(b.id), tgt = b.s.on && (wired ? LIVE.has(b.id) : Math.floor(playT / 2.5) % 2 === 0) ? 1 : 0, e = b.ext || 0;
    b.ext = tgt > e ? Math.min(tgt, e + dt * 1.1) : Math.max(tgt, e - dt * 1.1);
  }
  const lit = [];
  for (const b of SIM.glows) {
    const u = b.mesh.userData; let on = isOn(b); if (on && u.glow.blink) on = Math.floor(playT * 2.5) % 2 === 0;
    u.glow.mat.emissiveIntensity = on ? 1.3 : 0.06; if (on) lit.push(b);
  }
  for (const b of SIM.tagged) vis(b, dt);
  for (const car of SIM.carriers) {
    if (car.k === 'turntable') car.T.makeTranslation(car.pivot.x, 0, car.pivot.z).multiply(tmA.makeRotationY(thOf(car.c))).multiply(tmB.makeTranslation(-car.pivot.x, 0, -car.pivot.z));
    else if (car.k === 'piston') car.T.makeTranslation(0, (car.c.ext || 0) * PISTON, 0);
    else car.T.makeTranslation(car.pivot.x, car.pivot.y, car.pivot.z).multiply(tmA.makeRotationAxis(car.axis, (car.c.ext || 0) * Math.PI / 2)).multiply(tmB.makeTranslation(-car.pivot.x, -car.pivot.y, -car.pivot.z));
  }
  for (const r of riders) { tmM.identity(); for (const car of r.cars) tmM.multiply(car.T); tmM.multiply(tmA.compose(r.pos, r.q, ONE)); tmM.decompose(r.b.mesh.position, r.b.mesh.quaternion, tmS); }
  for (let i = 0; i < plights.length; i++) {   // a few real lights follow the lamps that are on
    const L = plights[i], b = lit[i];
    if (b) { L.intensity = 1.1; L.color.set(COLORS[b.c][0]); b.mesh.getWorldPosition(L.position); L.position.y += BY[b.p].h * PLATE * 0.6; } else L.intensity = 0;
  }
  dirty = true;
}

// ---------------------------------------------------------------------
// using things: switches, levers, buttons, doors, motors, pistons, lamps
// (click / tap in Play mode, or E on PC in either mode)
// ---------------------------------------------------------------------
const USABLE = { switch: 1, lever: 1, button: 1, door: 1, gate: 1, motor: 1, motorx: 1, piston: 1, hinge: 1, lamp: 1, light: 1, lightp: 1, blink: 1, timer: 1 };
const usable = (b) => !!(b && USABLE[kindOf(b)]);
const MODES = [[1, 1, 1], [1, 2, 1], [1, 3, 1], [1, 1, -1], [0, 1, 1]];   // motor: on, speed, direction
function stateText(b) {
  const k = kindOf(b), s = b.s || {};
  if (k === 'button') return t('bb_pressed');
  if (MOTOR[k]) return !s.on ? t('bb_stopped') : (s.dir < 0 ? t('bb_reverse') + ' · ' : '') + t('bb_speed', { n: s.sp });
  if (k === 'timer') return t('bb_speed', { n: s.sp });
  if (k === 'door' || k === 'gate') return t(s.on ? 'bb_open' : 'bb_closed');
  return t(s.on ? 'bb_on' : 'bb_off');
}
const powerText = (b) => S.play && SIM && (SIM.wired.has(b.id) || EL[kindOf(b)]) ? ' · ' + t(LIVE.has(b.id) ? 'bb_powered' : 'bb_unpowered') : '';
function useBrick(b, remote) {
  if (!usable(b)) return false;
  const k = kindOf(b), s = b.s;
  if (k === 'button') b.press = performance.now() + 1000;
  else if (MOTOR[k]) { const i = MODES.findIndex(m => m[0] === s.on && m[1] === s.sp && m[2] === s.dir), m = MODES[(i + 1) % MODES.length]; s.on = m[0]; s.sp = m[1]; s.dir = m[2]; }
  else if (k === 'timer') s.sp = s.sp % 3 + 1;
  else s.on = s.on ? 0 : 1;
  anim.add(b); dirty = true;
  if (S.play) powerTick();
  if (!remote) {
    tone(k === 'button' ? 660 : s && s.on ? 880 : 440, 0.06);
    toast(partName(BY[b.p]) + ': ' + stateText(b));
    netSend('use', { u: b.u, s: b.s, press: k === 'button' ? 1 : 0 });
    refreshHover();
  }
  saveSoon();
  return true;
}
function useTarget() {
  const pt = FLY.locked ? centrePt() : lastPt; if (!pt) return null;
  const hit = hitAt(pt[0], pt[1]), b = hit && brickOf(hit.object); return usable(b) ? b : null;
}
let hintB = null;
function useHint(b, cx, cy) {
  const el = $('usehint'); hintB = b || null; if (!el) return;
  if (!b || touchMode || !$('modal').hidden) { el.hidden = true; return; }
  el.innerHTML = `<b>${esc(partName(BY[b.p]))}</b> · ${esc(stateText(b) + powerText(b))}<br><span>${esc(t('bb_use'))}</span>`; el.hidden = false;
  const x = FLY.locked ? innerWidth / 2 : cx, y = FLY.locked ? innerHeight / 2 + 20 : cy + 20;
  el.style.left = clamp(x - el.offsetWidth / 2, 6, innerWidth - el.offsetWidth - 6) + 'px'; el.style.top = clamp(y, 6, innerHeight - el.offsetHeight - 6) + 'px';
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
    camera.position.copy(FLY.pos); camera.rotation.set(FLY.pitch, FLY.yaw, 0); camera.updateMatrixWorld(); dirty = true; return;
  }
  cam.phi = clamp(cam.phi, 0.12, 1.5); cam.r = clamp(cam.r, 5, 110);
  cam.target.x = clamp(cam.target.x, -HALF - 4, HALF + 4); cam.target.z = clamp(cam.target.z, -HALF - 4, HALF + 4); cam.target.y = clamp(cam.target.y, 0, 40);
  camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
  camera.lookAt(cam.target); camera.updateMatrixWorld(); dirty = true;
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
  if (!ghost || ghost.userData.p !== p.id) {
    if (ghost) scene.remove(ghost);
    ghost = new THREE.Mesh(build(p).ghost, ghostOk); ghost.userData.p = p.id; ghost.renderOrder = 2; scene.add(ghost);
    // a bright outline around the preview so it stands out on any colour
    const g = ghost.geometry; g.computeBoundingBox(); const bb = g.boundingBox, sz = bb.getSize(new V3()), c = bb.getCenter(new V3());
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(sz.x + 0.04, sz.y + 0.04, sz.z + 0.04)), ghostLine);
    edge.position.copy(c); edge.renderOrder = 3; ghost.add(edge);
  }
  if (!tg) { ghost.visible = false; dirty = true; return; }
  const [fw, fd] = dims(p, r);
  ghost.visible = true; ghost.position.set(tg.x - HALF + fw / 2, tg.y * PLATE + 0.005, tg.z - HALF + fd / 2); ghost.rotation.y = SYMMETRIC[p.kind] ? 0 : -r * Math.PI / 2;
  ghost.material = tg.ok ? ghostOk : ghostBad; if (tg.ok) { ghostOk.color.set(COLORS[curColor()][0]); ghostOk.emissive.set(COLORS[curColor()][0]); }
  ghostLine.color.set(tg.ok ? '#ffffff' : '#ff3b3b');
  dirty = true;
}
function setHoverMesh(m) {
  if (hoverMesh === m) return;
  if (hoverMesh && hoverMesh.userData.b) hoverMesh.material = hoverMesh.userData.baseMat;
  hoverMesh = m; if (m && m.userData.b) m.material = hiMats[m.userData.b.c]; dirty = true;
}
const placing = () => !S.play && (S.tool === 'build' || (S.tool === 'move' && S.held));
const centrePt = () => { const r = canvas.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
function updateHover(cx, cy) {
  lastPt = [cx, cy];
  const hit = hitAt(cx, cy), hb = hit && brickOf(hit.object), ub = usable(hb) ? hb : null;
  if (placing()) { setHoverMesh(null); hover = hit ? targetFor(hit) : null; setGhost(hover); }
  else { if (ghost) { ghost.visible = false; dirty = true; } hover = null; setHoverMesh(S.play ? (ub ? ub.mesh : null) : (hb ? hb.mesh : null)); }
  useHint(ub, cx, cy);
}
function refreshHover() { if (FLY.locked) updateHover(...centrePt()); else if (lastPt) updateHover(lastPt[0], lastPt[1]); else useHint(null); }

// ---------------------------------------------------------------------
// actions
// ---------------------------------------------------------------------
function remember(id) { S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 9); lsSet('bricks-recent', S.recent); quickbar(); }
function click(cx, cy) {
  audio(); updateHover(cx, cy);
  if (S.play) { const b = hoverMesh && hoverMesh.userData.b; if (!useBrick(b)) tone(200, 0.05); return; }   // Play mode: click / tap uses things
  if (placing()) {
    if (!hover || !hover.ok) { tone(180, 0.08); return; }
    snapshot();
    netAdd(addBrick({ p: curPart().id, c: curColor(), x: hover.x, y: hover.y, z: hover.z, r: curRot(), s: S.held ? S.held.s : null }));
    click3(); remember(curPart().id); if (S.held) S.held = null;
    changed(); refreshHover(); return;
  }
  const b = hoverMesh && hoverMesh.userData.b; if (!b) return;
  if (S.tool === 'move') { snapshot(); setHoverMesh(null); S.held = { p: b.p, c: b.c, r: b.r, s: b.s, from: [b.x, b.y, b.z] }; removeBrick(b); netSend('rm', { u: b.u }); tone(520, 0.05); changed(); refreshHover(); }
  else if (S.tool === 'paint') { if (b.c === S.color) return; snapshot(); setHoverMesh(null); b.c = S.color; remesh(b); netSend('paint', { u: b.u, c: b.c }); tone(700, 0.05); changed(); refreshHover(); }
  else if (S.tool === 'delete') deleteAt(cx, cy);
  else if (S.tool === 'pick') { S.part = BY[b.p]; S.color = b.c; S.rot = b.r; S.tab = catOf(S.part); remember(b.p); setTool('build'); renderParts(); renderColors(); tone(880, 0.05); }
}
function deleteAt(cx, cy) {
  audio();
  if (S.play) return;
  if (S.held) { cancelHeld(); return; }
  const hit = hitAt(cx, cy), b = hit && brickOf(hit.object); if (!b) return;
  snapshot(); setHoverMesh(null); removeBrick(b); netSend('rm', { u: b.u }); tone(300, 0.06); changed(); refreshHover();
}
function cancelHeld() {
  if (!S.held) return; const h = S.held, p = BY[h.p];
  if (h.from && fits(p, h.from[0], h.from[1], h.from[2], h.r)) netAdd(addBrick({ p: h.p, c: h.c, x: h.from[0], y: h.from[1], z: h.from[2], r: h.r, s: h.s }));
  S.held = null; undoStack.pop(); changed(); refreshHover();
}
function rotate() { if (S.held) S.held.r = (S.held.r + 1) % 4; else S.rot = (S.rot + 1) % 4; tone(600, 0.03); refreshHover(); }
function setTool(tl) { if (S.play) setPlay(false); if (S.held && tl !== 'move') cancelHeld(); S.tool = tl; toolbar(); status(); refreshHover(); }
function choosePart(id) { if (!BY[id]) return; if (S.play) setPlay(false); if (S.held) cancelHeld(); S.part = BY[id]; S.rot = 0; S.tab = catOf(S.part); if (S.tool !== 'build') setTool('build'); renderParts(); quickbar(); refreshHover(); tone(800, 0.03); }
function cycleColor(dir) { const i = COLOR_ORDER.indexOf(S.color); S.color = COLOR_ORDER[(i + dir + COLOR_ORDER.length) % COLOR_ORDER.length]; if (S.held) S.held.c = S.color; renderColors(); renderParts(); quickbar(); refreshHover(); }

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
  FLY.yaw -= e.movementX * 0.0024; FLY.pitch = clamp(FLY.pitch - e.movementY * 0.0024, -1.55, 1.55); placeCamera(); FLY.look = true;
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
canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !FLY.locked && !pointers.size) { if (ghost) ghost.visible = false; setHoverMesh(null); useHint(null); dirty = true; } });
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
  else if (k === 'e' || k === 'tab') { e.preventDefault(); const ub = k === 'e' ? useTarget() : null; if (ub) { audio(); useBrick(ub); } else if (FLY.locked) document.exitPointerLock(); }
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
     <button class="tool ${ON.code ? 'on' : ''}" data-act="online"><b>🌐</b><span>${ON.code ? ON.code + ' · ' + (ON.peers.size + 1) : t('bb_online')}</span></button>
     <button class="tool" data-act="saves"><b>🗂</b><span>${t('bb_saves')}</span></button>
     <button class="tool" data-act="photo"><b>📷</b><span>${t('bb_photo')}</span></button>
     <button class="tool" data-act="clear"><b>🧹</b><span>${t('bb_clear')}</span></button>`;
}
$('tools').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; audio();
  if (b.dataset.tool) return setTool(b.dataset.tool);
  const a = b.dataset.act;
  if (a === 'rotate') rotate(); if (a === 'undo') undo(); if (a === 'redo') redo(); if (a === 'saves') openSaves(); if (a === 'photo') photo(); if (a === 'play') setPlay(!S.play);
  if (a === 'clear' && S.bricks.length) ask(t('bb_confirmClear'), () => { snapshot(); load({ base: S.base, b: [] }); changed(); netState(); });
  if (a === 'online') openOnline();
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
  // new parts
  const rect = (x, y, w, h, fill) => { g.fillStyle = fill; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.strokeRect(x, y, w, h); };
  const poly = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.5; g.stroke(); };
  const line = (x1, y1, x2, y2, st, lw) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = st; g.lineWidth = lw; g.lineCap = 'round'; g.stroke(); };
  const bolt = (cx, cy, s, fill) => poly([[0.15, -1], [-0.45, 0.1], [-0.05, 0.1], [-0.15, 1], [0.45, -0.1], [0.05, -0.1]].map(([x, y]) => [cx + x * s, cy + y * s]), fill);
  const done = () => c.toDataURL();
  switch (k) {
    case 'battery': rect(12, 10, 32, 40, col); rect(22, 5, 12, 5, '#9aa0a6'); bolt(28, 30, 14, '#f2cd37'); return done();
    case 'wire': { const s = Math.min(44 / Math.max(p.w, p.d), 16), ww = p.w * s, dd = p.d * s; rect((N - ww) / 2, (N - dd) / 2, ww, dd, col); line(28, (N - dd) / 2 + 3, 28, (N + dd) / 2 - 3, '#d98a3a', 4); if (p.w > 1) line((N - ww) / 2 + 3, 28, (N + ww) / 2 - 3, 28, '#d98a3a', 4); return done(); }
    case 'cable': rect(16, 8, 24, 40, col); rect(14, 18, 28, 4, '#d98a3a'); rect(14, 34, 28, 4, '#d98a3a'); return done();
    case 'switch': rect(8, 26, 40, 20, col); g.save(); g.translate(28, 26); g.rotate(-0.28); rect(-13, -8, 26, 8, '#26282c'); g.restore(); circle(14, 36, 3.5, '#3dff6a'); return done();
    case 'button': rect(10, 30, 36, 18, col); g.beginPath(); g.ellipse(28, 27, 12, 6, 0, 0, 7); g.fillStyle = '#d01012'; g.fill(); rect(16, 20, 24, 7, '#d01012'); g.beginPath(); g.ellipse(28, 20, 12, 5, 0, 0, 7); g.fillStyle = '#ff4d4d'; g.fill(); return done();
    case 'lever': rect(8, 38, 40, 10, col); line(28, 40, 40, 12, '#9aa0a6', 4); circle(40, 12, 6, '#d01012', 'rgba(0,0,0,.4)'); return done();
    case 'lamp': { const gr = g.createRadialGradient(28, 22, 2, 28, 22, 20); gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 56, 46); circle(28, 24, 13, null, 'rgba(0,0,0,.25)'); rect(20, 40, 16, 9, '#26282c'); return done(); }
    case 'inverter': rect(8, 8, 40, 40, col); poly([[16, 38], [40, 38], [28, 16]], '#f4f4f4'); circle(28, 12, 4, '#3dff6a', 'rgba(0,0,0,.4)'); return done();
    case 'timer': rect(8, 8, 40, 40, col); circle(28, 28, 15, '#f4f4f4', 'rgba(0,0,0,.3)'); line(28, 28, 28, 17, '#26282c', 3); line(28, 28, 35, 31, '#26282c', 2); circle(43, 43, 3, '#3dff6a'); return done();
    case 'piston': rect(12, 30, 32, 20, col); rect(10, 38, 36, 4, '#f2cd37'); rect(24, 14, 8, 16, '#9aa0a6'); rect(8, 6, 40, 9, col); return done();
    case 'hinge': rect(6, 40, 44, 7, col); g.save(); g.translate(48, 40); g.rotate(-0.65); rect(-42, -8, 42, 8, col); g.restore(); circle(48, 40, 5, '#9aa0a6', 'rgba(0,0,0,.4)'); return done();
    case 'motorx': rect(6, 10, 34, 36, col); rect(6, 30, 34, 6, '#f2cd37'); circle(44, 28, 9, '#26282c'); rect(42, 20, 4, 16, '#9aa0a6'); rect(36, 26, 16, 4, '#9aa0a6'); return done();
    case 'axle': g.save(); g.translate(28, 28); g.rotate(-0.785); rect(-24, -3.5, 48, 7, col); rect(-26, -6, 4, 12, '#26282c'); rect(22, -6, 4, 12, '#26282c'); g.restore(); return done();
    case 'gate': { const s = Math.min(46 / p.d, 46 / (p.h * 0.4)), wd = p.d * s, ht = p.h * 0.4 * s, ox = (N - wd) / 2, oy = (N - ht) / 2; rect(ox, oy, 0.4 * s, ht, col); rect(ox + 0.5 * s, oy + ht * 0.15, wd - 0.6 * s, ht * 0.14, col); rect(ox + 0.5 * s, oy + ht * 0.7, wd - 0.6 * s, ht * 0.14, col); for (let i = 1; i < p.d * 2; i++) rect(ox + 0.4 * s + i * (wd - 0.6 * s) / (p.d * 2), oy + ht * 0.1, 3, ht * 0.8, col); return done(); }
    case 'glass': { const s = Math.min(46 / p.d, 46 / (p.h * 0.4)), wd = p.d * s, ht = p.h * 0.4 * s, ox = (N - wd) / 2, oy = (N - ht) / 2; rect(ox, oy, wd, ht, col); g.fillStyle = '#bfe3ff'; g.fillRect(ox + 4, oy + 5, wd - 8, ht - 10); line(ox + 8, oy + ht - 10, ox + wd * 0.5, oy + 9, 'rgba(255,255,255,.8)', 2); return done(); }
    case 'wplate': { const s = Math.min(44 / Math.max(p.w, p.d), 18), ox = (N - p.w * s) / 2, oy = (N - p.d * s) / 2; poly([[ox, oy], [ox + p.w * s, oy], [ox, oy + p.d * s]], col); for (let i = 0; i < p.w; i++) for (let j = 0; j < p.d; j++) if ((i + 0.5) / p.w + (j + 0.5) / p.d <= 0.85) circle(ox + (i + 0.5) * s, oy + (j + 0.5) * s, s * 0.3, 'rgba(255,255,255,.28)', 'rgba(0,0,0,.3)'); return done(); }
    case 'semi': { const s = Math.min(44 / p.d, 22), r = p.d / 2 * s, ox = 28 - r / 2, oy = 28; g.beginPath(); g.arc(ox, oy, r, -Math.PI / 2, Math.PI / 2); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke(); return done(); }
    case 'curve': case 'ridge': { const s = Math.min(44 / Math.max(p.w, p.d), 18), ww = p.w * s, dd = p.d * s, ox = (N - ww) / 2, oy = (N - dd) / 2; rect(ox, oy, ww, dd, col);
      const gr = g.createLinearGradient(0, oy, 0, oy + dd); if (k === 'ridge') { gr.addColorStop(0, 'rgba(0,0,0,.3)'); gr.addColorStop(0.5, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(0,0,0,.3)'); } else { gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(255,255,255,.3)'); }
      g.fillStyle = gr; g.fillRect(ox, oy, ww, dd); return done(); }
  }
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
const TAB_HINT = { moving: ['bb_hint_func', 'bb_hint_mech'], electric: ['bb_hint_elec'], inter: ['bb_hint_inter'] };
function partBtn(p) { return `<button class="part ${S.part === p && !S.held ? 'on' : ''}" data-part="${p.id}" title="${esc(partName(p) + ' ' + label(p))}"><img src="${icon(p, S.color)}" alt=""><span>${esc(label(p))}</span></button>`; }
function renderParts() {
  $('tabs').innerHTML = TABS.map(k => `<button class="tab ${S.tab === k ? 'on' : ''}" data-tab="${k}">${t('bb_cat_' + k)}</button>`).join('');
  $('parts').innerHTML = GROUPS.filter(g => g[1] === S.tab).map(([g, , lk]) => `<div class="ph">${t(lk)}</div>` + PARTS.filter(p => KINDS[p.kind][1] === g).map(partBtn).join('')).join('') +
    (TAB_HINT[S.tab] || []).map(k => `<p class="fhint">${t(k)}</p>`).join('');
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { S.tab = b.dataset.tab; renderParts(); $('parts').scrollTop = 0; $('parts').scrollLeft = 0; } });
$('parts').addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (b) choosePart(b.dataset.part); });
function renderColors() {
  $('colors').innerHTML = COLOR_ORDER.map(i => { const [hex, a] = COLORS[i]; return `<button class="sw ${S.color === i ? 'on' : ''} ${a ? 'trans' : ''}" data-c="${i}" style="--c:${hex}"></button>`; }).join('');
  $('bases').innerHTML = BASES.map(i => `<button class="sw small ${S.base === i ? 'on' : ''}" data-b="${i}" style="--c:${COLORS[i][0]}"></button>`).join('');
}
$('colors').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; S.color = +b.dataset.c; if (S.held) S.held.c = S.color; renderColors(); renderParts(); quickbar(); refreshHover(); });
$('bases').addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; snapshot(); setBase(+b.dataset.b); renderColors(); changed(); netSend('base', { c: S.base }); });
function quickbar() {
  const q = $('quick'); if (!q) return;
  q.innerHTML = S.recent.map((id, i) => `<button class="qs ${S.part.id === id && !S.held ? 'on' : ''}" data-q="${id}" title="${esc(partName(BY[id]) + ' ' + label(BY[id]))}"><img src="${icon(BY[id], S.color)}" alt=""><i>${i + 1}</i></button>`).join('') +
    `<span class="qc" style="--c:${COLORS[S.color][0]}" title="C / V"></span>`;
}
$('quick') && $('quick').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) choosePart(b.dataset.q); });
function status() {
  let hint;
  if (S.play) hint = t(touchMode ? 'bb_hint_play_touch' : 'bb_hint_play_pc');
  else if (S.held) hint = t('bb_holding');
  else if (touchMode) hint = S.tool === 'build' ? t('bb_hint_touch') : t('bb_hint_' + S.tool);
  else hint = FLY.locked ? t('bb_hint_locked', { tool: t('bb_' + S.tool) }) : t('bb_hint_pc');
  $('status').innerHTML = `<b>${t('bb_count', { n: S.bricks.length })}</b>${S.play ? `<b class="pm">▶ ${t('bb_mode_play')}</b>` : ''}<span>${hint}</span>`;
}
const pops = () => { if (window.Mal3abPopButtons) try { window.Mal3abPopButtons(); } catch (e) {} };   // 🏠 + 💬 bar in every popup
function ask(text, yes, no) {   // our own yes / no popup (instead of confirm) so it gets the 🏠 💬 bar too
  if (FLY.locked) document.exitPointerLock();
  useHint(null); $('modal').hidden = false;
  $('modal').innerHTML = `<div class="box" data-m3pop><p class="ask">${esc(text)}</p><div class="row"><span class="sp"></span><button class="btn sec" id="askNo">${t('bb_no')}</button><button class="btn" id="askYes">${t('bb_yes')}</button></div></div>`;
  $('askNo').onclick = () => { $('modal').hidden = true; if (no) no(); };
  $('askYes').onclick = () => { $('modal').hidden = true; yes(); };
  pops();
}

// saved builds ("bricks-saves" is synced to the Mal3ab account)
function savesList() { return lsGet('bricks-saves', {}); }
function openSaves() {
  if (FLY.locked) document.exitPointerLock();
  const list = savesList(), ids = Object.keys(list).sort((a, b) => list[b].t - list[a].t);
  useHint(null); $('modal').hidden = false;
  $('modal').innerHTML = `<div class="box" data-m3pop><h2>🗂 ${t('bb_saves')}</h2>
    <div class="row"><input id="saveName" maxlength="40" placeholder="${t('bb_name')}" value="${esc(S.name)}"><button class="btn" id="doSave">${t('bb_saveAs')}</button></div>
    <div class="list">${ids.length ? ids.map(id => `<div class="item"><div><b>${esc(list[id].name || t('bb_untitled'))}</b><small>${t('bb_count', { n: ((list[id].data && list[id].data.b) || []).length })} · ${new Date(list[id].t).toLocaleDateString()}</small></div>
      <button class="btn small" data-load="${id}">${t('bb_load')}</button><button class="btn small sec" data-del="${id}">${t('bb_del')}</button></div>`).join('') : `<p class="muted">${t('bb_empty')}</p>`}</div>
    <div class="row"><button class="btn sec" id="doNew">${t('bb_new')}</button><span class="sp"></span><button class="btn sec" id="doClose">${t('bb_close')}</button></div></div>`;
  $('doClose').onclick = () => $('modal').hidden = true;
  $('doSave').onclick = () => {
    const name = $('saveName').value.trim() || t('bb_untitled'), all = savesList();
    const id = Object.keys(all).find(k => all[k].name === name) || 's' + Date.now().toString(36);
    all[id] = { name, t: Date.now(), data: serial() }; S.name = name;
    if (lsSet('bricks-saves', all)) { $('doSave').textContent = t('bb_saved'); setTimeout(openSaves, 700); changed(); }
  };
  $('doNew').onclick = () => { snapshot(); S.name = ''; load({ base: S.base, b: [] }); changed(); netState(); $('modal').hidden = true; };
  $('modal').querySelectorAll('[data-load]').forEach(b => b.onclick = () => { const it = savesList()[b.dataset.load]; if (!it) return; snapshot(); S.name = it.name; load(it.data); changed(); netState(); $('modal').hidden = true; });
  $('modal').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const it = savesList()[b.dataset.del]; if (!it) return;
    ask(t('bb_confirmDel', { p: it.name }), () => { const all = savesList(); delete all[b.dataset.del]; lsSet('bricks-saves', all); openSaves(); }, openSaves);
  });
  pops();
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
// building together online: a Supabase broadcast room "bricks-CODE".
// Every change is sent to everyone; someone joining gets the whole build.
// ---------------------------------------------------------------------
function netSend(ev, p) { if (ON.ch && ON.ready) ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p) }); }
function netAdd(b) { if (b) netSend('add', { b: arrOf(b) }); }
function netState() { netSend('state', { data: serial() }); }
const myName = () => (window.Auth && Auth.name && Auth.name()) || 'Builder';
const peerColor = (id) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0; return [0, 1, 2, 3, 9, 13, 14, 15][Math.abs(h) % 8]; };
function tagSprite(text, hex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 48; const g = c.getContext('2d');
  g.font = 'bold 26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(250, g.measureText(text).width + 26); g.fillStyle = 'rgba(15,18,32,.75)'; if (g.roundRect) { g.beginPath(); g.roundRect(128 - w / 2, 5, w, 38, 12); g.fill(); } else g.fillRect(128 - w / 2, 5, w, 38);
  g.fillStyle = hex; g.fillText(text, 128, 25);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })); sp.scale.set(3, 0.56, 1); sp.position.y = 1.1; return sp;
}
function peerOf(id, name) {
  let pr = ON.peers.get(id);
  if (!pr) {
    const col = COLORS[peerColor(id)][0], g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), std({ color: col })); g.add(head);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.05), std({ color: '#1b2a34' })); eye.position.set(0, 0.1, -0.42); g.add(eye);
    pr = { name: name || '…', g, t: performance.now(), tag: null }; pr.tag = tagSprite(pr.name, col); g.add(pr.tag); scene.add(g); ON.peers.set(id, pr);
    toast(t('bb_joined', { p: pr.name })); toolbar();
  }
  if (name && name !== pr.name) { pr.name = name; pr.g.remove(pr.tag); pr.tag = tagSprite(name, COLORS[peerColor(id)][0]); pr.g.add(pr.tag); }
  return pr;
}
function dropPeer(id) { const pr = ON.peers.get(id); if (!pr) return; scene.remove(pr.g); ON.peers.delete(id); toast(t('bb_left', { p: pr.name })); toolbar(); dirty = true; }
function onNet(ev, p) {
  if (!p || p.id === ON.me) return;
  if (ev === 'hello') {
    peerOf(p.id, p.n);
    if (p.req) { netSend('hello', { n: myName() }); if (performance.now() - ON.joinedW > 1500) netSend('state', { to: p.id, data: serial() }); }
    return;
  }
  if (ev === 'bye') { dropPeer(p.id); return; }
  if (ev === 'cam') { const pr = peerOf(p.id, p.n); pr.t = performance.now(); pr.g.position.fromArray(p.p); pr.g.rotation.y = p.y || 0; dirty = true; return; }
  if (ev === 'state') {
    if (p.to && p.to !== ON.me) return;
    if (p.to) { if (ON.synced) return; ON.synced = true; snapshot(); }
    S.held = null; setHoverMesh(null); load(p.data); changed(); refreshHover(); return;
  }
  if (ev === 'add') {
    const a = p.b; if (S.bricks.some(b => b.u === a[6]) || !BY[a[0]] || !COLORS[a[1]]) return;
    if (fits(BY[a[0]], a[2], a[3], a[4], a[5])) { addBrick({ p: a[0], c: a[1], x: a[2], y: a[3], z: a[4], r: a[5], u: a[6], s: a[7] }); changed(); refreshHover(); }
    return;
  }
  const b = p.u && S.bricks.find(x => x.u === p.u);
  if (ev === 'rm' && b) { if (hoverMesh === b.mesh) setHoverMesh(null); removeBrick(b); changed(); refreshHover(); }
  if (ev === 'paint' && b && COLORS[p.c]) { if (hoverMesh === b.mesh) setHoverMesh(null); b.c = p.c; remesh(b); changed(); }
  if (ev === 'base' && COLORS[p.c]) { setBase(p.c); renderColors(); changed(); }
  if (ev === 'use' && b) { if (p.s && b.s) initState(b, p.s); if (p.press) b.press = performance.now() + 1000; anim.add(b); if (S.play) powerTick(); dirty = true; saveSoon(); if (hintB === b) refreshHover(); }   // someone flipped a switch, opened a door…
}
function joinRoom(code) {
  leaveRoom(true);
  if (!window.sb) return;
  ON.code = code; ON.ready = false; ON.synced = false; ON.joinedW = performance.now();
  const ch = sb.channel('bricks-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of ['hello', 'bye', 'cam', 'state', 'add', 'rm', 'paint', 'base', 'use']) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => { if (st === 'SUBSCRIBED') { ON.ready = true; netSend('hello', { n: myName(), req: true }); } });
  ON.ch = ch; history.replaceState(null, '', location.pathname + '?room=' + code); toolbar(); status();
  window.Mal3abShareLink = () => inviteLink(code);
}
function leaveRoom(quiet) {
  if (ON.ch) { netSend('bye', {}); try { sb.removeChannel(ON.ch); } catch (e) {} }
  for (const id of [...ON.peers.keys()]) { const pr = ON.peers.get(id); scene.remove(pr.g); }
  ON.peers.clear(); ON.ch = null; ON.ready = false; ON.code = ''; window.Mal3abShareLink = null;
  if (!quiet) { history.replaceState(null, '', location.pathname); toolbar(); status(); }
}
const inviteLink = (code) => location.href.split('?')[0].split('#')[0] + '?room=' + code;
window.Mal3abPrepareInvite = async () => { if (!ON.code) { if (!await canGoOnline()) return null; joinRoom(newCode()); } return inviteLink(ON.code); };   // chat invite: build together right here
const newCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
function copyText(text, btn) { const done = () => { const o = btn.textContent; btn.textContent = t('bb_copied'); setTimeout(() => btn.textContent = o, 1200); }; if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); }
async function canGoOnline() { return !window.Mal3abVersion || await Mal3abVersion.ok(); }
function openOnline() {
  if (FLY.locked) document.exitPointerLock();
  $('modal').hidden = false;
  if (ON.code) {
    $('modal').innerHTML = `<div class="box" data-m3pop><h2>${t('bb_onTitle')}</h2>
      <div class="row"><span>${t('bb_room')}:</span><b class="big">${ON.code}</b><span class="sp"></span><button class="btn small" id="onLink">${t('bb_copyLink')}</button></div>
      <div class="list"><b>${t('bb_players')}</b><div class="item"><div><b>${esc(myName())}</b><small>${t('bb_you')}</small></div></div>${[...ON.peers.values()].map(pr => `<div class="item"><div><b>${esc(pr.name)}</b></div></div>`).join('')}</div>
      <div class="row"><button class="btn sec" id="onLeave">${t('bb_leave')}</button><span class="sp"></span><button class="btn sec" id="onClose">${t('bb_close')}</button></div></div>`;
    $('onLink').onclick = (e) => copyText(inviteLink(ON.code), e.target);
    $('onLeave').onclick = () => { leaveRoom(); $('modal').hidden = true; };
  } else {
    $('modal').innerHTML = `<div class="box" data-m3pop><h2>${t('bb_onTitle')}</h2><p class="muted">${t('bb_onDesc')}</p>
      <button class="btn" id="onCreate">${t('bb_create')}</button>
      <div class="row"><input id="onCode" maxlength="6" placeholder="${t('bb_code')}" style="text-transform:uppercase;letter-spacing:3px;text-align:center;font-weight:700"><button class="btn sec" id="onJoin">${t('bb_join')}</button></div>
      <div class="muted" id="onMsg"></div>
      <div class="row"><span class="sp"></span><button class="btn sec" id="onClose">${t('bb_close')}</button></div></div>`;
    $('onCreate').onclick = async () => { if (!await canGoOnline()) return; joinRoom(newCode()); openOnline(); };
    $('onJoin').onclick = async () => { const c = $('onCode').value.trim().toUpperCase(); if (c.length < 4) { $('onMsg').textContent = t('bb_codeHint'); return; } if (!await canGoOnline()) return; joinRoom(c); openOnline(); };
  }
  $('onClose').onclick = () => $('modal').hidden = true;
  useHint(null); pops();
}
let toastEl = null, toastT = 0;
function toast(text) {   // one toast at a time: a new message replaces the old one
  if (!toastEl || !toastEl.isConnected) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
  toastEl.textContent = text; clearTimeout(toastT); toastT = setTimeout(() => { if (toastEl) toastEl.remove(); toastEl = null; }, 3000);
}
let camSendW = 0;
function netTick() {
  if (!ON.ch || !ON.ready) return;
  const now = performance.now();
  if (now > camSendW) { camSendW = now + 250; netSend('cam', { n: myName(), p: camera.position.toArray().map(v => +v.toFixed(2)), y: +(touchMode ? cam.theta + Math.PI : FLY.yaw).toFixed(2) }); }
  for (const [id, pr] of ON.peers) if (now - pr.t > 15000) dropPeer(id);
}
addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });

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
    ['m2x2', 8, 24, 0, 24, 0], ['g16', 7, 24, 3, 24, 0], ['g8', 2, 26, 3, 25, 0], ['g24', 0, 21, 3, 24, 0], ['v1x1', 1, 26, 4, 25, 0], ['z1x1', 0, 27, 0, 27, 0],
    ['bt2x2', 0, 3, 0, 24, 0], ['sw1x2', 5, 5, 0, 24, 0], ['wr1x4', 6, 6, 0, 24, 1], ['lp1x1', 2, 10, 0, 24, 0]];
  load({ base: 3, b: demo.filter(a => BY[a[0]]) });
}
renderAll(); resize(); placeCamera(); orbitToFly(); placeCamera();
let last = performance.now();
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (canvas.clientWidth && (canvas.width !== Math.floor(canvas.clientWidth * renderer.getPixelRatio()))) resize();
  // the see-through preview follows the crosshair while you look around or fly
  if ((flyStep(dt) || FLY.look) && FLY.locked) refreshHover(); FLY.look = false;
  animate(dt); netTick();
  if (!dirty) return; dirty = false; renderer.render(scene, camera);
}
requestAnimationFrame(frame);
const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam) { const go = async () => { if (await canGoOnline()) joinRoom(roomParam.toUpperCase()); }; if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(() => { if (!ON.code) go(); }, 4000); } }
window.BB = window.BrickBuilder = { ghost: () => ghost, ON, joinRoom, leaveRoom, S, BY, PARTS, COLORS, addBrick, removeBrick, load, serial, hitAt, click, deleteAt, setTool, rotate, undo, redo, setPlay, FLY,
  motion: () => SIM ? SIM.drive : new Map(), riders: () => riders, sim: () => SIM, live: () => LIVE, motorAng: (b) => motorAng.get(b.id) || 0, powered: (b) => LIVE.has(b.id), isOn,
  useBrick, usable, stateOut, kindOf, onNet, choosePart, onePerKind: () => { const o = {}; for (const p of PARTS) if (!o[p.kind]) o[p.kind] = p.id; return o; } };   // for testing
})();
