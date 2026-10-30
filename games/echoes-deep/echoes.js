// Echoes of the Deep — a co-op sonar diving game for Mal3ab.
// One player pilots a tiny sub through pitch-black trench caves, the other runs the sonar.
// Online: Supabase Realtime broadcast room "echoes-CODE"; the pilot is the authority for the sub and the world.
(() => {
'use strict';
const $ = (id) => document.getElementById(id);

addStrings({
  ed_title: 'أصداء الأعماق', ed_tag: 'غطسة جماعية في أعمق خندق في المحيط — واحد بيسوق والتاني بيسمع',
  ed_solo: '🤿 غطّس لوحدك', ed_online: '🌐 العب مع صاحبك أونلاين', ed_how: '❔ إزاي تلعب', ed_levels: 'اختار المستوى', ed_lvl: 'مستوى {n}',
  ed_z1: 'الرصيف المنوّر', ed_z2: 'جنينة المرجان', ed_z3: 'كهوف الصدى', ed_z4: 'غابة الديدان', ed_z5: 'المداخن السودا', ed_z6: 'عرين الليفياثان',
  ed_z7: 'الأطلال الغرقانة', ed_z8: 'هاوية الصمت', ed_z9: 'معبد الأجراس', ed_z10: 'الضلوع الكبيرة', ed_z11: 'بوابة القدماء', ed_z12: 'أعمق نقطة',
  ed_pilot: 'قائد الغواصة', ed_sonar: 'مشغّل السونار', ed_diver: 'غطّاس',
  ed_pilotDesc: 'بيسوق الغواصة في الكهوف الضيقة، ومش شايف غير اللي في نور الكشاف.',
  ed_sonarDesc: 'شاشته سودا خالص — بيبعت بينج يكشف الحيطان والآثار والوحوش، ويوجّه صاحبه.',
  ed_createAs: 'اعمل غرفة بالدور ده', ed_or: '— أو ادخل غرفة صاحبك —', ed_join: 'ادخل', ed_codePh: 'الكود', ed_codeHint: 'اكتب كود الغرفة (٤ حروف)',
  ed_room: 'الغرفة', ed_copyLink: '🔗 انسخ لينك الدعوة', ed_copied: 'اتنسخ ✓', ed_waitPartner: '⏳ مستني صاحبك يدخل… ابعتله اللينك أو الكود',
  ed_you: 'إنت', ed_partner: 'صاحبك', ed_swap: '🔄 بدّلوا الأدوار', ed_start: '▶ ابدأ الغطسة', ed_waitPilot: '⏳ مستني قائد الغواصة يبدأ الغطسة…',
  ed_needPartner: 'لازم صاحبك يدخل الأول', ed_leave: 'اخرج من الغرفة', ed_back: 'رجوع', ed_full: 'الغرفة دي مليانة',
  ed_joinedP: '{p} دخل الغرفة', ed_leftP: '{p} خرج من الغرفة', ed_partnerLost: 'صاحبك فصل',
  ed_partnerLostD: 'اللعبة واقفة لحد ما يرجع. أو كمّل الغطسة لوحدك — هتقدر تبعت بينج بنفسك (Space).',
  ed_pilotLostD: 'قائد الغواصة فصل. استنى لحد ما يرجع، أو اخرج من الغرفة.',
  ed_continueSolo: 'كمّل لوحدك', ed_noNet: 'مفيش اتصال دلوقتي — جرّب تاني', ed_connecting: 'بيتصل…', ed_levelOf: 'المستوى',
  ed_hull: 'الهيكل', ed_o2: 'الأكسجين', ed_power: 'الطاقة', ed_noise: 'الدوشة', ed_depth: '{m} متر',
  ed_quiet: 'واطي', ed_medium: 'متوسط', ed_loud: 'عالي', ed_ping: 'بينج', ed_lamp: 'الكشاف', ed_boost: 'تيربو', ed_signals: 'إشارات',
  ed_s_left: 'شمال', ed_s_right: 'يمين', ed_s_up: 'اطلع لفوق', ed_s_down: 'انزل لتحت', ed_s_stop: 'اقف!', ed_s_danger: 'خطر!', ed_s_ok: 'تمام',
  ed_mGo: 'روح هنا', ed_mWarn: 'خطر', ed_mStar: 'أثر', ed_mClear: 'امسح',
  ed_paused: '⏸ اللعبة واقفة', ed_pausedBy: '{p} وقّف اللعبة', ed_resume: '▶ كمّل', ed_restart: '🔄 ابدأ المستوى من الأول', ed_quit: 'اخرج للقائمة', ed_toRoom: 'ارجعوا للغرفة',
  ed_win: 'عدّيت المستوى! 🎉', ed_final: 'وصلتوا لأعمق نقطة في المحيط! 🏆', ed_finalD: 'البوابة القديمة اتفتحت… إنتوا أول ناس توصل هنا.',
  ed_lose: 'الغواصة ضاعت 💀', ed_rHull: 'الهيكل اتكسر', ed_rO2: 'الأكسجين خلص',
  ed_next: '▶ المستوى اللي بعده', ed_retry: '🔄 حاول تاني', ed_menu: 'القائمة', ed_score: 'النقط', ed_best: 'أحسن نتيجة', ed_time: 'الوقت',
  ed_newBest: '⭐ رقم قياسي جديد!', ed_artsN: 'الآثار', ed_waitHost: '⏳ مستني القائد…',
  ed_gotArt: '👽 لقيت أثر فضائي! ({n}/{m})', ed_gotO2: '🫧 أكسجين زيادة', ed_gotPw: '⚡ طاقة زيادة',
  ed_alerted: '👂 في وحش سمعكم!', ed_lowO2: '⚠ الأكسجين قرب يخلص!', ed_noPower: '⚠ الطاقة خلصت', ed_gateFound: '◎ السونار لقى البوابة!', ed_bitten: '💥 وحش عضّ الغواصة!',
  ed_gate: 'البوابة', ed_stars: 'النجوم', ed_deepest: 'أعمق غطسة',
  ed_tipMove: 'اتحرك بالأسهم أو WASD (والماوس بيوجّه الكشاف) — انزل لتحت ودوّر على البوابة في القاع',
  ed_tipMoveT: 'حرّك الجويستيك عشان تسوق — انزل لتحت ودوّر على البوابة في القاع',
  ed_tipPing: 'دوس Space تبعت بينج وتشوف الكهف كله — و 1 / 2 / 3 بتغيّر قوته',
  ed_tipPingT: 'دوس 📡 تبعت بينج وتشوف الكهف كله',
  ed_tipSonar: 'دوس Space (أو 📡) تبعت بينج — وكليك على الخريطة يحط علامة تظهر عند صاحبك',
  ed_tipPilot: 'صاحبك على السونار هيوجّهك بالعلامات — والأرقام من 1 لـ 7 بتبعتله إشارات',
  ed_tipQuiet: 'وحش سمعك! اقف أو امشي بالراحة (دوس C أو زقّ الجويستيك سنة) ومش هيعرف يلاقيك',
  ed_h1t: '🎯 الهدف', ed_h1: 'انزلوا لآخر الخندق لحد البوابة الفضائية القديمة في القاع. في كل مستوى ٣ آثار فضائية مستخبية — لمّوها عشان تاخدوا نجوم.',
  ed_h2t: '🚢 قائد الغواصة', ed_h2: 'WASD أو الأسهم (أو الجويستيك) للحركة، والماوس بيوجّه الكشاف. Shift = تيربو، C = امشي بالراحة من غير صوت (أو زقّ الجويستيك سنة صغيرة)، L = الكشاف، والأرقام 1–7 = إشارات سريعة لصاحبك.',
  ed_h3t: '📡 مشغّل السونار', ed_h3: 'Space = بينج، و 1 / 2 / 3 = قوته. كليك على الخريطة = علامة، اسحب = سهم، وكليك على علامة يمسحها. الأسهم = اتجاهات، S = اقف، D = خطر، F = تمام.',
  ed_h4t: '👂 الوحوش عمية', ed_h4: 'بس ودانها حلوة: البينج العالي والتيربو والخبط في الحيطان بيجيبوهم. لو وحش قرّب، اقف أو امشي بالراحة خالص لحد ما يبعد.',
  ed_h5t: '🤿 لوحدك', ed_h5: 'إنت القائد والسونار مع بعض: Space = بينج و 1 / 2 / 3 = قوته، والصدى بيبان على شاشتك لثواني.',
  ed_h6t: '🫧 خلّي بالك', ed_h6: 'من الهيكل والأكسجين والطاقة. الكشاف والتيربو والبينج بياكلوا طاقة. اسطوانات الأكسجين الخضرا وخلايا الطاقة الصفرا مستخبية في الكهوف.'
}, {
  ed_title: 'Echoes of the Deep', ed_tag: 'A co-op dive into the deepest ocean trench — one steers, one listens',
  ed_solo: '🤿 Solo dive', ed_online: '🌐 Online co-op', ed_how: '❔ How to play', ed_levels: 'Choose a level', ed_lvl: 'Level {n}',
  ed_z1: 'The Glowing Shelf', ed_z2: 'Coral Gardens', ed_z3: 'Echo Caves', ed_z4: 'Tubeworm Forest', ed_z5: 'Black Smokers', ed_z6: "Leviathan's Lair",
  ed_z7: 'Sunken Ruins', ed_z8: 'The Silent Abyss', ed_z9: 'Temple of Bells', ed_z10: 'The Great Ribs', ed_z11: 'Gate of the Ancients', ed_z12: 'The Deepest Point',
  ed_pilot: 'Sub pilot', ed_sonar: 'Sonar operator', ed_diver: 'Diver',
  ed_pilotDesc: 'Steers the sub through tight caves and only sees what the lamp lights.',
  ed_sonarDesc: 'Has a pitch-black screen — pings to reveal walls, artifacts and predators, and guides the pilot.',
  ed_createAs: 'Create a room', ed_or: '— or join a friend’s room —', ed_join: 'Join', ed_codePh: 'Code', ed_codeHint: 'Type the 4-letter room code',
  ed_room: 'Room', ed_copyLink: '🔗 Copy invite link', ed_copied: 'Copied ✓', ed_waitPartner: '⏳ Waiting for your partner… send them the link or the code',
  ed_you: 'You', ed_partner: 'Partner', ed_swap: '🔄 Swap roles', ed_start: '▶ Start the dive', ed_waitPilot: '⏳ Waiting for the pilot to start the dive…',
  ed_needPartner: 'Your partner has to join first', ed_leave: 'Leave room', ed_back: 'Back', ed_full: 'That room is full',
  ed_joinedP: '{p} joined the room', ed_leftP: '{p} left the room', ed_partnerLost: 'Your partner disconnected',
  ed_partnerLostD: 'The game is paused until they come back. Or finish the dive alone — you can ping yourself (Space).',
  ed_pilotLostD: 'The pilot disconnected. Wait for them to come back, or leave the room.',
  ed_continueSolo: 'Continue solo', ed_noNet: 'No connection right now — try again', ed_connecting: 'Connecting…', ed_levelOf: 'Level',
  ed_hull: 'Hull', ed_o2: 'Oxygen', ed_power: 'Power', ed_noise: 'Noise', ed_depth: '{m} m',
  ed_quiet: 'Quiet', ed_medium: 'Medium', ed_loud: 'Loud', ed_ping: 'Ping', ed_lamp: 'Lamp', ed_boost: 'Boost', ed_signals: 'Signals',
  ed_s_left: 'Left', ed_s_right: 'Right', ed_s_up: 'Go up', ed_s_down: 'Go down', ed_s_stop: 'Stop!', ed_s_danger: 'Danger!', ed_s_ok: 'OK',
  ed_mGo: 'Go here', ed_mWarn: 'Danger', ed_mStar: 'Artifact', ed_mClear: 'Clear',
  ed_paused: '⏸ Paused', ed_pausedBy: '{p} paused the game', ed_resume: '▶ Resume', ed_restart: '🔄 Restart level', ed_quit: 'Quit to menu', ed_toRoom: 'Back to the room',
  ed_win: 'Level cleared! 🎉', ed_final: 'You reached the deepest point in the ocean! 🏆', ed_finalD: 'The ancient gate opens… you are the first ones ever to get here.',
  ed_lose: 'The sub was lost 💀', ed_rHull: 'The hull gave way', ed_rO2: 'Out of oxygen',
  ed_next: '▶ Next level', ed_retry: '🔄 Try again', ed_menu: 'Menu', ed_score: 'Score', ed_best: 'Best', ed_time: 'Time',
  ed_newBest: '⭐ New best!', ed_artsN: 'Artifacts', ed_waitHost: '⏳ Waiting for the pilot…',
  ed_gotArt: '👽 Alien artifact recovered! ({n}/{m})', ed_gotO2: '🫧 Extra oxygen', ed_gotPw: '⚡ Extra power',
  ed_alerted: '👂 Something heard you!', ed_lowO2: '⚠ Oxygen running low!', ed_noPower: '⚠ Out of power', ed_gateFound: '◎ Sonar found the gate!', ed_bitten: '💥 Something bit the sub!',
  ed_gate: 'Gate', ed_stars: 'Stars', ed_deepest: 'Deepest dive',
  ed_tipMove: 'Move with the arrows or WASD (the mouse aims the lamp) — head down and find the gate at the bottom.',
  ed_tipMoveT: 'Use the joystick to steer — head down and find the gate at the bottom.',
  ed_tipPing: 'Press Space to ping and see the whole cave — 1 / 2 / 3 change its strength.',
  ed_tipPingT: 'Tap 📡 to ping and see the whole cave.',
  ed_tipSonar: 'Press Space (or 📡) to ping — click the map to drop a marker your partner can see.',
  ed_tipPilot: 'Your sonar partner will guide you with markers — keys 1 to 7 send them signals.',
  ed_tipQuiet: 'Something heard you! Stop or creep (hold C, or nudge the joystick) and it can’t find you.',
  ed_h1t: '🎯 Goal', ed_h1: 'Dive to the bottom of the trench and reach the ancient alien gate. Each level hides 3 alien artifacts — collect them for stars.',
  ed_h2t: '🚢 Sub pilot', ed_h2: 'WASD or the arrows (or the joystick) to move, the mouse aims the lamp. Shift = boost, hold C = creep silently (or push the joystick just a little), L = lamp, keys 1–7 = quick signals to your partner.',
  ed_h3t: '📡 Sonar operator', ed_h3: 'Space = ping, 1 / 2 / 3 = strength. Click the map = marker, drag = arrow, click a marker to remove it. Arrows = directions, S = stop, D = danger, F = OK.',
  ed_h4t: '👂 Predators are blind', ed_h4: 'But they hear everything: loud pings, boosting and crashing into walls draw them in. If one gets close, stop or creep very slowly until it swims away.',
  ed_h5t: '🤿 Solo', ed_h5: 'You are pilot and sonar at once: Space = ping and 1 / 2 / 3 = strength; the echoes show on your screen for a few seconds.',
  ed_h6t: '🫧 Watch out', ed_h6: 'Keep an eye on hull, oxygen and power. The lamp, boost and pings use power. Green oxygen tanks and yellow power cells are hidden in the caves.'
});

// ---------------------------------------------------------------- utils
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const fmtTime = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const nf = (v) => Math.round(v).toLocaleString('en-US');

// ---------------------------------------------------------------- save
const SAVE_KEY = 'echoes-deep-save', SET_KEY = 'echoes-deep-settings';
const SAVE = Object.assign({ unlocked: 1, best: {}, deepest: 0 }, lsGet(SAVE_KEY, {}));
const SET = Object.assign({ mute: false }, lsGet(SET_KEY, {}));
const saveProgress = () => lsSet(SAVE_KEY, SAVE);

// ---------------------------------------------------------------- constants
const C = 32, CHC = 8, CH_M = 24, NLVL = 12, SUB_R = 13, RING_V = 950;
const PINGS = [
  { range: 300, alert: 300, cd: 0.9, cost: 4, rays: 220 },
  { range: 560, alert: 680, cd: 1.6, cost: 8, rays: 300 },
  { range: 920, alert: 1350, cd: 2.6, cost: 15, rays: 400 }];
const STR_KEYS = ['ed_quiet', 'ed_medium', 'ed_loud'];
const STR_BARS = ['<i class=on></i><i></i><i></i>', '<i class=on></i><i class=on></i><i></i>', '<i class=on></i><i class=on></i><i class=on></i>'];
const SIGS = [['left', '⬅️', '1', '←'], ['right', '➡️', '2', '→'], ['up', '⬆️', '3', '↑'], ['down', '⬇️', '4', '↓'], ['stop', '✋', '5', 'S'], ['danger', '⚠️', '6', 'D'], ['ok', '👍', '7', 'F']];
const MKS = [['go', '◆', 'ed_mGo', '#4df3ff'], ['warn', '✖', 'ed_mWarn', '#ff5d73'], ['star', '★', 'ed_mStar', '#ffd23e']];
const ST_CODE = { wander: 0, search: 1, inv: 2, hunt: 3, flee: 4 }, ST_NAME = ['wander', 'search', 'inv', 'hunt', 'flee'];

function palette(n) {
  if (n <= 2) return { rock: '#1b2b3d', rock2: '#2c4864', rim: '#6fb3d6', edge: '#a9e6ff', water: '#0e3a56', water2: '#041726', glows: ['#4df3ff', '#2fffc1', '#7aa8ff'], deco: 'coral' };
  if (n <= 4) return { rock: '#163030', rock2: '#24524b', rim: '#58c7a8', edge: '#a6ffe0', water: '#0b3439', water2: '#03151a', glows: ['#2fffc1', '#b6ff5e', '#4df3ff'], deco: 'worm' };
  if (n <= 6) return { rock: '#231e1e', rock2: '#3d2e27', rim: '#c46a3a', edge: '#ffb48a', water: '#1e1a26', water2: '#07060c', glows: ['#ff8a3d', '#ffcf5e', '#ff5e7a'], deco: 'vent' };
  if (n <= 8) return { rock: '#221a36', rock2: '#3b2d5c', rim: '#9a7aff', edge: '#dccdff', water: '#150f30', water2: '#05030f', glows: ['#b56cff', '#4df3ff', '#ff5ec8'], deco: 'crystal' };
  if (n <= 10) return { rock: '#161a31', rock2: '#272d4e', rim: '#8a96c8', edge: '#e2e6ff', water: '#0d1132', water2: '#030410', glows: ['#7aa8ff', '#e2e6ff', '#4df3ff'], deco: 'bone' };
  return { rock: '#1f1219', rock2: '#3b1d29', rim: '#d0485e', edge: '#ffc8a8', water: '#1b0a15', water2: '#060206', glows: ['#ff3d5e', '#ffd36e', '#b56cff'], deco: 'ruin' };
}
function params(n) {
  const k = (Math.min(n, NLVL) - 1) / (NLVL - 1);
  return {
    GW: 38 + Math.round(k * 8), GH: 70 + n * 6, rmin: 1.95 - k * 0.5, rmax: 3.2 - k * 0.85,
    branches: 3 + Math.round(n * 0.5), caverns: 1 + Math.floor(n / 3),
    eels: [1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6][n - 1] || 6, levis: n < 5 ? 0 : n < 9 ? 1 : 2, jellies: n < 3 ? 0 : 2 + Math.floor(n / 2),
    o2Mult: 2.4 - k * 0.85, nO2: 1 + (n > 4 ? 1 : 0) + (n > 8 ? 1 : 0), nPw: 1 + (n > 6 ? 1 : 0),
    depth0: 200 + (n - 1) * 890, span: n >= NLVL ? 1004 : 890, hunt: 158 + n * 3
  };
}

// ---------------------------------------------------------------- level generation
let L = null;   // the level being shown
function makeNoise(R, w, h) {
  const W2 = w + 2, g = new Float32Array(W2 * (h + 2));
  for (let i = 0; i < g.length; i++) g[i] = R();
  return (x, y) => {
    x = clamp(x, 0, w); y = clamp(y, 0, h);
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), k = j * W2 + i;
    return lerp(lerp(g[k], g[k + 1], sx), lerp(g[k + W2], g[k + W2 + 1], sx), sy);
  };
}
function densL(lv, x, y) {
  const fx = x / C, fy = y / C, i = Math.floor(fx), j = Math.floor(fy);
  if (i < 0 || j < 0 || i >= lv.GW || j >= lv.GH) return 1;
  const tx = fx - i, ty = fy - j, W1 = lv.GW + 1, k = j * W1 + i, v = lv.v;
  return (v[k] * (1 - tx) + v[k + 1] * tx) * (1 - ty) + (v[k + W1] * (1 - tx) + v[k + W1 + 1] * tx) * ty;
}
const dens = (x, y) => densL(L, x, y);
// marching squares: the solid part of one cell as a polygon (corners + edge crossings, clockwise)
function cellPoly(lv, i, j) {
  const W1 = lv.GW + 1, v = lv.v, x0 = i * C, y0 = j * C;
  const cs = [[x0, y0, v[j * W1 + i]], [x0 + C, y0, v[j * W1 + i + 1]], [x0 + C, y0 + C, v[(j + 1) * W1 + i + 1]], [x0, y0 + C, v[(j + 1) * W1 + i]]];
  if (cs[0][2] <= 0.5 && cs[1][2] <= 0.5 && cs[2][2] <= 0.5 && cs[3][2] <= 0.5) return null;
  const pts = [], cross = [];
  for (let k = 0; k < 4; k++) {
    const p = cs[k], q = cs[(k + 1) % 4];
    if (p[2] > 0.5) { pts.push(p[0], p[1]); cross.push(0); }
    if ((p[2] > 0.5) !== (q[2] > 0.5)) { const f = (0.5 - p[2]) / (q[2] - p[2]); pts.push(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f); cross.push(1); }
  }
  return { pts, cross };
}
function bfsCells(lv, grid, s) {
  const GW = lv.GW, N = GW * lv.GH, d = new Int32Array(N).fill(-1), q = new Int32Array(N); let h = 0, tl = 0;
  if (s < 0 || !grid[s]) return d;
  d[s] = 0; q[tl++] = s;
  while (h < tl) {
    const c = q[h++], i = c % GW;
    const nb = [i > 0 ? c - 1 : -1, i < GW - 1 ? c + 1 : -1, c - GW, c + GW];
    for (const nc of nb) if (nc >= 0 && nc < N && grid[nc] && d[nc] < 0) { d[nc] = d[c] + 1; q[tl++] = nc; }
  }
  return d;
}
function genLevel(n, seed) {
  for (let at = 0; at < 8; at++) { const lv = tryGen(n, (seed + at * 7919) >>> 0, at, false); if (lv) { lv.seed0 = seed; return lv; } }
  const lv = tryGen(n, seed, 9, true); lv.seed0 = seed; return lv;
}
function tryGen(n, seed, attempt, safe) {
  const P = params(n), R = rng(seed), GW = P.GW, GH = P.GH, W1 = GW + 1, NP = W1 * (GH + 1);
  const open = new Float32Array(NP).fill(9);
  const stamp = (cx, cy, r) => {
    const x0 = Math.max(0, Math.floor(cx - r - 1)), x1 = Math.min(GW, Math.ceil(cx + r + 1)), y0 = Math.max(0, Math.floor(cy - r - 1)), y1 = Math.min(GH, Math.ceil(cy + r + 1));
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const d = Math.hypot(i - cx, j - cy) / r, k = j * W1 + i; if (d < open[k]) open[k] = d; }
  };
  const wig = makeNoise(R, 64, 4); let wt = R() * 30;
  const carve = (ax, ay, bx, by, ra, rb, amp, store) => {
    const len = Math.hypot(bx - ax, by - ay) || 1, steps = Math.max(2, Math.ceil(len / 0.45)), nx = -(by - ay) / len, ny = (bx - ax) / len;
    for (let s = 0; s <= steps; s++) {
      const f = s / steps; wt = (wt + len / steps / 5) % 62;
      const off = (wig(wt, 1.5) - 0.5) * 2 * amp * Math.sin(Math.PI * f);
      const x = clamp(lerp(ax, bx, f) + nx * off, 2.6, GW - 2.6), y = clamp(lerp(ay, by, f) + ny * off, 2.6, GH - 2.6), r = lerp(ra, rb, f);
      stamp(x, y, r); if (store) store.push([x, y, r]);
    }
  };
  const rr = () => lerp(P.rmin, P.rmax, R());
  // the spine: switchbacks winding down the trench
  let x = GW / 2 + (R() - 0.5) * 8, y = 4.6;
  const start = [x, y]; stamp(x, y, 3.3);
  const wps = [[x, y, 2.6]]; let side = R() < 0.5 ? -1 : 1;
  while (y < GH - 11) {
    const dx = (6 + R() * 11) * side; let nx = x + dx;
    if (nx < 5 || nx > GW - 5) nx = x - dx * 0.8;
    nx = clamp(nx, 5, GW - 5);
    const ny = Math.min(GH - 9, y + 3.5 + R() * 5.5);
    wps.push([nx, ny, rr()]); x = nx; y = ny; if (R() < 0.75) side = -side;
  }
  const gate = [clamp(x + (R() - 0.5) * 4, 6, GW - 6), GH - 5.2];
  wps.push([gate[0], gate[1] - 1.2, rr()]);
  const spine = [];
  for (let k = 1; k < wps.length; k++) carve(wps[k - 1][0], wps[k - 1][1], wps[k][0], wps[k][1], wps[k - 1][2], wps[k][2], 1.6, spine);
  stamp(gate[0], gate[1], 3.6);
  // caverns with rock pillars
  const caverns = [], pillars = [];
  for (let c = 0; c < P.caverns; c++) {
    const sp = spine[Math.floor(lerp(0.2, 0.88, R()) * spine.length)], cr = 3.8 + R() * 1.8;
    const cx = clamp(sp[0], cr + 2, GW - cr - 2), cy = clamp(sp[1], cr + 2, GH - cr - 4);
    stamp(cx, cy, cr); caverns.push([cx, cy, cr]);
    if (!safe && R() < 0.65) pillars.push([cx + (R() - 0.5) * 2.4, cy + (R() - 0.5) * 2.4, 0.9 + R() * 0.7]);
  }
  // side branches ending in chambers (artifacts and supplies hide there) and dead ends
  const ends = [];
  for (let b = 0; b < P.branches + 2; b++) {
    const sp = spine[Math.floor(lerp(0.06, 0.94, R()) * spine.length)];
    const toward = R() < 0.72 ? (sp[0] < GW / 2 ? 1 : -1) : (sp[0] < GW / 2 ? -1 : 1);
    let px = sp[0], py = sp[1];
    const segs = 1 + Math.floor(R() * 2);
    for (let s = 0; s < segs; s++) {
      const nx = clamp(px + toward * (4 + R() * 7), 4, GW - 4), ny = clamp(py + (R() - 0.38) * 7, 4.5, GH - 6);
      carve(px, py, nx, ny, P.rmin * 0.95, P.rmin * (0.82 + R() * 0.3), 1.2, null); px = nx; py = ny;
    }
    const cr = 1.9 + R() * 1.1; stamp(px, py, cr); ends.push([px, py, cr]);
  }
  // density field
  const n1 = makeNoise(R, Math.ceil(GW / 4) + 2, Math.ceil(GH / 4) + 2), n2 = makeNoise(R, Math.ceil(GW / 1.6) + 2, Math.ceil(GH / 1.6) + 2);
  const amp = safe ? 0 : attempt > 4 ? 0.2 : 0.36;
  const v = new Float32Array(NP);
  for (let j = 0; j <= GH; j++) for (let i = 0; i <= GW; i++) {
    const k = j * W1 + i; let o = open[k];
    for (const p of pillars) { const d = Math.hypot(i - p[0], j - p[1]) / p[2]; if (d < 1.7) o = Math.max(o, 1.38 - d * 0.42); }
    o += (n1(i / 4, j / 4) - 0.5) * amp + (n2(i / 1.6, j / 1.6) - 0.5) * amp * 0.4;
    v[k] = (i <= 1 || j <= 1 || i >= GW - 1 || j >= GH - 1) ? 1 : smooth(0.74, 1.26, o);
  }
  const lv = { n, seed, GW, GH, W: GW * C, H: GH * C, v, P, pal: palette(n) };
  const N = GW * GH, oc = new Uint8Array(N), oc2 = new Uint8Array(N);
  // a cell is open water only if all four corners are water: then any chain of open cells is wide enough for the sub
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = j * W1 + i; oc[j * GW + i] = v[k] < 0.47 && v[k + 1] < 0.47 && v[k + W1] < 0.47 && v[k + W1 + 1] < 0.47 ? 1 : 0; }
  for (let j = 1; j < GH - 1; j++) for (let i = 1; i < GW - 1; i++) { const c = j * GW + i; oc2[c] = oc[c] && oc[c - 1] && oc[c + 1] && oc[c - GW] && oc[c + GW] ? 1 : 0; }
  lv.oc = oc; lv.oc2 = oc2;
  const cellOf = (px, py) => clamp(Math.floor(py), 0, GH - 1) * GW + clamp(Math.floor(px), 0, GW - 1);
  const sc = cellOf(start[0], start[1]), gc = cellOf(gate[0], gate[1]);
  const dist = bfsCells(lv, oc, sc);
  if (!safe && dist[gc] < 0) return null;
  lv.start = { x: start[0] * C, y: start[1] * C }; lv.gate = { x: gate[0] * C, y: gate[1] * C };
  // wall segments (with normals pointing into the water) for collisions and decorations
  lv.segs = new Array(N);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const pl = cellPoly(lv, i, j); if (!pl) continue;
    const { pts, cross } = pl, m = cross.length; let arr = null;
    for (let k = 0; k < m; k++) {
      const k2 = (k + 1) % m; if (!cross[k] || !cross[k2]) continue;
      const x1 = pts[k * 2], y1 = pts[k * 2 + 1], x2 = pts[k2 * 2], y2 = pts[k2 * 2 + 1];
      let nx = -(y2 - y1), ny = x2 - x1; const l = Math.hypot(nx, ny); if (l < 1e-3) continue; nx /= l; ny /= l;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (densL(lv, mx + nx * 3, my + ny * 3) > densL(lv, mx - nx * 3, my - ny * 3)) { nx = -nx; ny = -ny; }
      (arr || (arr = [])).push(x1, y1, x2, y2, nx, ny);
    }
    if (arr) lv.segs[j * GW + i] = arr;
  }
  // places with room around them
  const clearC = [];
  for (let j = 2; j < GH - 2; j++) for (let i = 2; i < GW - 2; i++) {
    const c = j * GW + i; if (!oc[c] || dist[c] < 0) continue;
    if (densL(lv, (i + 0.5) * C, (j + 0.5) * C) > 0.12) continue;
    if (oc[c - 1] && oc[c + 1] && oc[c - GW] && oc[c + GW] && oc[c - GW - 1] && oc[c - GW + 1] && oc[c + GW - 1] && oc[c + GW + 1]) clearC.push(c);
  }
  const cxy = (c) => [(c % GW + 0.5) * C, (Math.floor(c / GW) + 0.5) * C];
  const used = [[lv.start.x, lv.start.y], [lv.gate.x, lv.gate.y]];
  const free = (px, py, md) => used.every(u => Math.hypot(u[0] - px, u[1] - py) > md);
  const nearest = (px, py, maxD) => { let best = -1, bd = maxD; for (const c of clearC) { const p = cxy(c), d = Math.hypot(p[0] - px, p[1] - py); if (d < bd) { bd = d; best = c; } } return best; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pickFrom = (list, test) => { for (const c of list) { const p = cxy(c); if (test(p, c)) { used.push(p); return p; } } return null; };
  const endCells = shuffle(ends.map(e => nearest(e[0] * C, e[1] * C, 3.2 * C)).filter(c => c >= 0));
  const randCells = shuffle(clearC.slice());
  const place = (count, minStart, gap) => {
    const out = [];
    for (let k = 0; k < count; k++) {
      let p = pickFrom(endCells, (q, c) => dist[c] > minStart && free(q[0], q[1], gap));
      if (!p) p = pickFrom(randCells, (q, c) => dist[c] > minStart && free(q[0], q[1], gap));
      if (!p) p = pickFrom(randCells, (q) => free(q[0], q[1], C * 2));
      if (p) out.push(p);
    }
    return out;
  };
  lv.arts = place(3, 12, 7 * C).map((p, i) => ({ x: p[0], y: p[1], ph: i * 2.1 }));
  lv.picks = [...place(P.nO2, 8, 5 * C).map(p => ({ x: p[0], y: p[1], k: 'o2' })), ...place(P.nPw, 8, 5 * C).map(p => ({ x: p[0], y: p[1], k: 'pw' }))];
  // predators, spread down the trench
  lv.predSpawns = [];
  const spawn = (kind, count, f0, f1, grid) => {
    for (let k = 0; k < count; k++) {
      const ty = lerp(f0, f1, (k + 0.5) / count) * lv.H;
      const cands = randCells.filter(c => grid[c] && dist[c] > 20 && Math.abs(cxy(c)[1] - ty) < 7 * C);
      const p = pickFrom(cands, (q) => free(q[0], q[1], 5 * C)) || pickFrom(randCells.filter(c => grid[c] && dist[c] > 16), (q) => free(q[0], q[1], 3 * C));
      if (p) lv.predSpawns.push({ x: p[0], y: p[1], k: kind });
    }
  };
  spawn('eel', P.eels, n === 1 ? 0.62 : 0.3, 0.93, oc);
  spawn('levi', P.levis, 0.45, 0.9, oc2);
  // jellies drift along the main route
  lv.jellies = [];
  for (let k = 0; k < P.jellies; k++) {
    const sp = spine[Math.floor(lerp(0.15, 0.95, (k + R() * 0.8) / P.jellies) * spine.length)];
    const c = nearest(sp[0] * C + (R() - 0.5) * 60, sp[1] * C, 4 * C); if (c < 0) continue;
    const p = cxy(c); if (!free(p[0], p[1], 3 * C)) continue; used.push(p);
    lv.jellies.push({ x: p[0], y: p[1], ph: R() * TAU, hue: R() < 0.5 ? '#ff6ad5' : '#7af0ff' });
  }
  // bioluminescent algae along the walls (grouped by render chunk)
  lv.glow = new Map();
  const CW = Math.ceil(GW / CHC);
  for (let c = 0; c < N; c++) {
    const s = lv.segs[c]; if (!s) continue;
    for (let k = 0; k < s.length; k += 6) {
      if (R() > 0.15) continue;
      const f = R(), gx = lerp(s[k], s[k + 2], f) + s[k + 4] * 3, gy = lerp(s[k + 1], s[k + 3], f) + s[k + 5] * 3;
      const ck = Math.floor(gy / (CHC * C)) * CW + Math.floor(gx / (CHC * C));
      let a = lv.glow.get(ck); if (!a) lv.glow.set(ck, a = []);
      a.push({ x: gx, y: gy, c: lv.pal.glows[Math.floor(R() * lv.pal.glows.length)], ph: R() * TAU, f: 0.6 + R() * 1.6, s: 7 + R() * 9 });
    }
  }
  lv.CW = CW;
  const units = Math.max(dist[gc], 20) * C;
  lv.o2Time = clamp(units / 115 * P.o2Mult + 35, 90, 420);
  lv.spine = spine;
  return lv;
}

// ---------------------------------------------------------------- physics helpers
function rayHit(x, y, dx, dy, max, step) {
  step = step || 7; let d = 0;
  while (d < max) {
    d = Math.min(max, d + step);
    if (dens(x + dx * d, y + dy * d) > 0.5) {
      let a = d - step, b = d;
      for (let k = 0; k < 4; k++) { const m = (a + b) / 2; if (dens(x + dx * m, y + dy * m) > 0.5) b = m; else a = m; }
      return b;
    }
  }
  return -1;
}
function los(x0, y0, x1, y1) { const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy); if (d < 2) return true; return rayHit(x0, y0, dx / d, dy / d, d - 3, 10) < 0; }
// circle against the wall segments around it; returns the impact speed
function collide(o, r, bounce) {
  let imp = 0;
  for (let it = 0; it < 3; it++) {
    const ci = Math.floor(o.x / C), cj = Math.floor(o.y / C);
    let best = 0, bx = 0, by = 0;
    for (let j = cj - 1; j <= cj + 1; j++) {
      if (j < 0 || j >= L.GH) continue;
      for (let i = ci - 1; i <= ci + 1; i++) {
        if (i < 0 || i >= L.GW) continue;
        const s = L.segs[j * L.GW + i]; if (!s) continue;
        for (let k = 0; k < s.length; k += 6) {
          const x1 = s[k], y1 = s[k + 1], dx = s[k + 2] - x1, dy = s[k + 3] - y1, ll = dx * dx + dy * dy;
          let u = ll > 0 ? ((o.x - x1) * dx + (o.y - y1) * dy) / ll : 0; const inner = u > 0 && u < 1; u = u < 0 ? 0 : u > 1 ? 1 : u;
          const px = x1 + dx * u, py = y1 + dy * u, ex = o.x - px, ey = o.y - py, d = Math.hypot(ex, ey);
          if (d >= r) continue;
          let nx = s[k + 4], ny = s[k + 5], pen;
          if (inner && ex * nx + ey * ny < 0) pen = r + d;                 // the centre slipped behind this wall
          else { if (d > 1e-4) { nx = ex / d; ny = ey / d; } pen = r - d; }
          if (pen > best) { best = pen; bx = nx; by = ny; }
        }
      }
    }
    if (best <= 0) break;
    o.x += bx * best; o.y += by * best;
    const vn = o.vx * bx + o.vy * by;
    if (vn < 0) { imp = Math.max(imp, -vn); o.vx -= vn * bx * (1 + bounce); o.vy -= vn * by * (1 + bounce); }
  }
  return imp;
}
// predator path finding over open cells (8 directions, no corner cutting)
const PF = { prev: null, mark: null, q: null, gen: 0 };
function findPath(grid, x0, y0, x1, y1, cap) {
  const GW = L.GW, GH = L.GH, N = GW * GH;
  if (!PF.prev || PF.prev.length < N) { PF.prev = new Int32Array(N); PF.mark = new Uint32Array(N); PF.q = new Int32Array(N); PF.gen = 0; }
  const gen = ++PF.gen, prev = PF.prev, mark = PF.mark, q = PF.q;
  const cellAt = (x, y) => clamp(Math.floor(y / C), 0, GH - 1) * GW + clamp(Math.floor(x / C), 0, GW - 1);
  const near = (c) => { if (grid[c]) return c; const ci = c % GW, cj = Math.floor(c / GW); for (let r = 1; r <= 3; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; if (grid[j * GW + i]) return j * GW + i; } return -1; };
  const s = near(cellAt(x0, y0)), g = near(cellAt(x1, y1));
  if (s < 0 || g < 0) return [];
  const gi = g % GW, gj = Math.floor(g / GW);
  let h = 0, tl = 0, best = s, bestD = 1e9;
  mark[s] = gen; prev[s] = -1; q[tl++] = s;
  while (h < tl && tl < (cap || 3200)) {
    const c = q[h++]; if (c === g) { best = c; break; }
    const ci = c % GW, cj = Math.floor(c / GW);
    const dd = (ci - gi) * (ci - gi) + (cj - gj) * (cj - gj); if (dd < bestD) { bestD = dd; best = c; }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const ni = ci + dx, nj = cj + dy;
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const nc = nj * GW + ni; if (mark[nc] === gen || !grid[nc]) continue;
      if (dx && dy && (!grid[cj * GW + ni] || !grid[nj * GW + ci])) continue;
      mark[nc] = gen; prev[nc] = c; q[tl++] = nc;
    }
  }
  const out = []; let c = best;
  while (c >= 0 && c !== s) { out.push([(c % GW + 0.5) * C, (Math.floor(c / GW) + 0.5) * C]); c = prev[c]; }
  out.reverse();
  if (best === g && out.length) { out[out.length - 1] = [x1, y1]; }
  return out;
}
function randomOpenNear(grid, x, y, rad) {
  const GW = L.GW, GH = L.GH;
  for (let k = 0; k < 14; k++) {
    const i = Math.floor(x / C + (Math.random() - 0.5) * 2 * rad), j = Math.floor(y / C + (Math.random() - 0.5) * 2 * rad);
    if (i < 1 || j < 1 || i >= GW - 1 || j >= GH - 1 || !grid[j * GW + i]) continue;
    return [(i + 0.5) * C, (j + 0.5) * C];
  }
  return [x, y];
}

// ---------------------------------------------------------------- canvas + cached art
const cv = $('c'), ctx = cv.getContext('2d');
const dark = document.createElement('canvas'), dctx = dark.getContext('2d');
let W = 0, H = 0, DPR = 1, DK = 0.5, frameNo = 0;
let vign = null, scan = null;
const CAUSTIC = (() => {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), im = g.createImageData(N, N), k = TAU / N;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x * k, w = y * k;
    const a = Math.sin(u * 3 + Math.sin(w * 2) * 1.6) + Math.sin(w * 4 + Math.sin(u * 3) * 1.4) + Math.sin((u + w) * 2 + Math.sin(u * 5 - w * 2) * 0.9);
    let val = 1 - Math.abs(a) / 1.1; val = val < 0 ? 0 : Math.pow(val, 5);
    const i = (y * N + x) * 4; im.data[i] = 170; im.data[i + 1] = 235; im.data[i + 2] = 255; im.data[i + 3] = val * 255;
  }
  g.putImageData(im, 0, 0); return c;
})();
let causticPat = null;
const GLOWS = {};
function glowSpr(col) {
  let c = GLOWS[col]; if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.12, col); gr.addColorStop(0.35, hexA(col, 0.45)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (GLOWS[col] = c);
}
function spr(g, col, x, y, r, a) { if (a <= 0.003) return; g.globalAlpha = Math.min(1, a); g.drawImage(glowSpr(col), x - r, y - r, r * 2, r * 2); }
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  DK = DPR * 0.5; dark.width = Math.ceil(W * DK); dark.height = Math.ceil(H * DK);
  vign = document.createElement('canvas'); vign.width = 256; vign.height = 256;
  { const g = vign.getContext('2d'), gr = g.createRadialGradient(128, 128, 60, 128, 128, 182); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.75)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  scan = document.createElement('canvas'); scan.width = 4; scan.height = 4;
  { const g = scan.getContext('2d'); g.fillStyle = 'rgba(120,255,210,0.035)'; g.fillRect(0, 0, 4, 1); }
  G.cam.z = clamp(Math.min(W, H) / 620, 0.55, 1.5);
  const q = clamp(Math.round(G.cam.z * DPR * 4) / 4, 0.5, 1.75);
  if (q !== chunkQ) { chunkQ = q; CHUNKS.clear(); }
  measureOp();
}

// ---------------------------------------------------------------- rock chunks (pre-rendered, LRU cached)
const CHUNKS = new Map(); let chunkQ = 1;
let chunkBudget = 99;
function getChunk(ci, cj) {
  const key = ci * 4096 + cj; let c = CHUNKS.get(key);
  if (c && c.q === chunkQ && c.lv === L) { c.used = frameNo; return c.cv; }
  if (chunkBudget <= 0) return null;   // drawn on a later frame (far chunks sit in the dark anyway)
  chunkBudget--;
  if (!c) {
    if (CHUNKS.size > Math.max(34, (G.visChunks || 0) + 8)) { let ok = null, ou = Infinity; for (const [k, v] of CHUNKS) if (v.used < ou) { ou = v.used; ok = k; } const old = CHUNKS.get(ok); CHUNKS.delete(ok); c = { cv: old.cv }; }
    else c = { cv: document.createElement('canvas') };
    CHUNKS.set(key, c);
  }
  c.q = chunkQ; c.lv = L; c.used = frameNo; renderChunk(c.cv, ci, cj); return c.cv;
}
function renderChunk(cvs, ci, cj) {
  const S = CHC * C, M = CH_M, q = chunkQ, x0 = ci * S, y0 = cj * S, pal = L.pal, GW = L.GW;
  cvs.width = Math.ceil((S + 2 * M) * q); cvs.height = cvs.width;
  const g = cvs.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cvs.width, cvs.height);
  g.setTransform(q, 0, 0, q, (M - x0) * q, (M - y0) * q);
  const i0 = Math.max(0, ci * CHC - 1), i1 = Math.min(GW - 1, ci * CHC + CHC), j0 = Math.max(0, cj * CHC - 1), j1 = Math.min(L.GH - 1, cj * CHC + CHC);
  const rock = new Path2D(), edge = new Path2D();
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const pl = cellPoly(L, i, j); if (!pl) continue;
    const p = pl.pts; rock.moveTo(p[0], p[1]); for (let k = 2; k < p.length; k += 2) rock.lineTo(p[k], p[k + 1]); rock.closePath();
    const s = L.segs[j * GW + i]; if (s) for (let k = 0; k < s.length; k += 6) { edge.moveTo(s[k], s[k + 1]); edge.lineTo(s[k + 2], s[k + 3]); }
  }
  g.fillStyle = pal.rock; g.fill(rock);
  g.save(); g.clip(rock);
  // texture: per-cell seeded so neighbouring chunks agree
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const R = rng(hashStr(L.seed + ':' + i + ':' + j));
    for (let b = 0; b < 3; b++) {
      const bx = (i + R()) * C, by = (j + R()) * C, r = 4 + R() * 15;
      g.globalAlpha = 0.07 + R() * 0.13; g.fillStyle = R() < 0.55 ? pal.rock2 : '#000';
      g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill();
    }
    if (R() < 0.35) {
      g.globalAlpha = 0.3; g.strokeStyle = '#05070c'; g.lineWidth = 1.1; g.beginPath();
      let px = (i + R()) * C, py = (j + R()) * C; g.moveTo(px, py);
      for (let k = 0; k < 3; k++) { px += (R() - 0.5) * 22; py += (R() - 0.3) * 16; g.lineTo(px, py); }
      g.stroke();
    }
    if (pal.deco === 'vent' && R() < 0.12) { g.globalAlpha = 0.55; g.strokeStyle = '#ff7a2e'; g.lineWidth = 1.4; g.beginPath(); let px = (i + R()) * C, py = (j + R()) * C; g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (R() - 0.5) * 18; py += (R() - 0.5) * 18; g.lineTo(px, py); } g.stroke(); }
    if ((pal.deco === 'ruin' || pal.deco === 'crystal') && R() < 0.1) { g.globalAlpha = 0.4; g.strokeStyle = pal.deco === 'ruin' ? '#ffd36e' : '#4df3ff'; g.lineWidth = 1.3; const gx = (i + 0.2 + R() * 0.5) * C, gy = (j + 0.2 + R() * 0.5) * C; g.strokeRect(gx, gy, 8, 8); g.beginPath(); g.moveTo(gx + 4, gy - 4); g.lineTo(gx + 4, gy + 12); g.moveTo(gx - 3, gy + 4); g.lineTo(gx + 11, gy + 4); g.stroke(); }
  }
  g.globalAlpha = 0.22; g.strokeStyle = pal.rim; g.lineWidth = 16; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(edge);
  g.globalAlpha = 0.32; g.lineWidth = 6; g.stroke(edge);
  g.restore();
  g.globalAlpha = 0.85; g.strokeStyle = pal.edge; g.lineWidth = 1.5; g.lineCap = 'round'; g.stroke(edge);
  // decorations growing out of the walls of this chunk's own cells
  const ia = ci * CHC, ib = Math.min(GW - 1, ia + CHC - 1), ja = cj * CHC, jb = Math.min(L.GH - 1, ja + CHC - 1);
  for (let j = ja; j <= jb; j++) for (let i = ia; i <= ib; i++) {
    const s = L.segs[j * GW + i]; if (!s) continue;
    const R = rng(hashStr('d' + L.seed + ':' + i + ':' + j));
    for (let k = 0; k < s.length; k += 6) {
      const nx = s[k + 4], ny = s[k + 5], f = R(), mx = lerp(s[k], s[k + 2], f), my = lerp(s[k + 1], s[k + 3], f);
      if (ny < -0.55 && R() < 0.4) decoFloor(g, pal, mx, my, nx, ny, R);
      else if (ny > 0.6 && R() < 0.3) decoCeil(g, pal, mx, my, nx, ny, R);
      else if (R() < 0.12) { g.globalAlpha = 0.8; g.fillStyle = pal.rock2; for (let b = 0; b < 3; b++) { g.beginPath(); g.arc(mx + nx * 2 + (R() - 0.5) * 8, my + ny * 2 + (R() - 0.5) * 8, 1.5 + R() * 2, 0, TAU); g.fill(); } }
    }
  }
  g.globalAlpha = 1;
}
function decoFloor(g, pal, x, y, nx, ny, R) {
  g.globalAlpha = 0.95; g.lineCap = 'round';
  const d = pal.deco;
  if (d === 'coral') {
    const col = ['#ff7a59', '#ff5ec8', '#ffb347', '#c86bff'][Math.floor(R() * 4)];
    g.strokeStyle = col; g.lineWidth = 1.6; const h = 10 + R() * 14;
    const br = (bx, by, a, len, dep) => { const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke(); if (dep > 0) { br(ex, ey, a - 0.5, len * 0.7, dep - 1); br(ex, ey, a + 0.45, len * 0.7, dep - 1); } };
    br(x, y, Math.atan2(ny, nx) + (R() - 0.5) * 0.4, h * 0.45, 2);
  } else if (d === 'worm') {
    const nTube = 2 + Math.floor(R() * 3);
    for (let k = 0; k < nTube; k++) {
      const bx = x + (R() - 0.5) * 10, h = 8 + R() * 14, tx = bx + nx * h + (R() - 0.5) * 4, ty = y + ny * h;
      g.strokeStyle = '#e8e4d8'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(bx, y); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = '#ff3b4e'; g.beginPath(); g.arc(tx, ty, 2.6, 0, TAU); g.fill();
    }
  } else if (d === 'vent') {
    if (R() < 0.5) { const h = 12 + R() * 16; g.fillStyle = '#17110f'; g.beginPath(); g.moveTo(x - 6, y + 2); g.lineTo(x - 2.5 + nx * h, y + ny * h); g.lineTo(x + 2.5 + nx * h, y + ny * h); g.lineTo(x + 6, y + 2); g.closePath(); g.fill();
      g.fillStyle = '#ff7a2e'; g.globalAlpha = 0.8; g.beginPath(); g.arc(x + nx * h, y + ny * h, 2, 0, TAU); g.fill(); }
    else { g.fillStyle = '#e9e1cf'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + (R() - 0.5) * 12, y + ny * 2, 3, 2, 0, 0, TAU); g.fill(); } }
  } else if (d === 'crystal') {
    const col = ['#b56cff', '#4df3ff', '#ff8af0'][Math.floor(R() * 3)];
    for (let k = 0; k < 2 + Math.floor(R() * 2); k++) {
      const a = Math.atan2(ny, nx) + (R() - 0.5) * 0.9, h = 7 + R() * 13, bx = x + (R() - 0.5) * 8;
      g.fillStyle = hexA(col, 0.75); g.beginPath(); g.moveTo(bx - Math.sin(a) * 3, y + Math.cos(a) * 3); g.lineTo(bx + Math.cos(a) * h, y + Math.sin(a) * h); g.lineTo(bx + Math.sin(a) * 3, y - Math.cos(a) * 3); g.closePath(); g.fill();
    }
  } else if (d === 'bone') {
    g.strokeStyle = '#d9d4c4'; g.lineWidth = 2.2; const h = 12 + R() * 16, a = Math.atan2(ny, nx) + (R() - 0.5) * 0.5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * h * 0.6, y + Math.sin(a + 0.6) * h * 0.6, x + Math.cos(a) * h, y + Math.sin(a) * h); g.stroke();
  } else {
    g.fillStyle = '#2b1820'; const h = 10 + R() * 12; g.fillRect(x - 3, y - h, 6, h); g.fillStyle = '#ffd36e'; g.globalAlpha = 0.7; g.fillRect(x - 1, y - h + 2, 2, 2);
  }
}
function decoCeil(g, pal, x, y, nx, ny, R) {
  g.globalAlpha = 0.95; const h = 6 + R() * 16;
  g.fillStyle = pal.rock; g.beginPath(); g.moveTo(x - 5, y - 1); g.lineTo(x + nx * h * 0.2, y + ny * h); g.lineTo(x + 5, y - 1); g.closePath(); g.fill();
  if (R() < 0.4) { g.strokeStyle = hexA(pal.glows[0], 0.5); g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + 2, y); g.lineTo(x + 2 + (R() - 0.5) * 3, y + h + 10); g.stroke(); }
}

// ---------------------------------------------------------------- audio (all synthesized)
const AU = { c: null };
function auInit() {
  if (AU.c) { if (AU.c.state === 'suspended') AU.c.resume(); return; }
  const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
  try { AU.c = new A(); } catch (e) { return; }
  const c = AU.c;
  AU.out = c.createGain(); AU.out.gain.value = SET.mute ? 0 : 0.85;
  const comp = c.createDynamicsCompressor(); AU.out.connect(comp); comp.connect(c.destination);
  AU.sfx = c.createGain(); AU.sfx.connect(AU.out);
  const len = Math.floor(c.sampleRate * 2.8), ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { lp = lp * 0.82 + (Math.random() * 2 - 1) * 0.18; d[i] = lp * Math.pow(1 - i / len, 2.6) * 2.4; } }
  AU.rev = c.createConvolver(); AU.rev.buffer = ir; AU.revIn = c.createGain(); AU.revIn.gain.value = 0.7; AU.revIn.connect(AU.rev); AU.rev.connect(AU.out);
  AU.dl = c.createDelay(1); AU.dl.delayTime.value = 0.34; const fb = c.createGain(); fb.gain.value = 0.36; const dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1700;
  AU.dl.connect(dlp); dlp.connect(fb); fb.connect(AU.dl); const dOut = c.createGain(); dOut.gain.value = 0.55; dlp.connect(dOut); dOut.connect(AU.out); dOut.connect(AU.revIn);
  AU.dlIn = c.createGain(); AU.dlIn.connect(AU.dl);
  AU.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); { const d = AU.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  // engine hum + propeller bubbles
  AU.eng = c.createOscillator(); AU.eng.type = 'sawtooth'; AU.eng.frequency.value = 46; const elp = c.createBiquadFilter(); elp.type = 'lowpass'; elp.frequency.value = 230;
  AU.engG = c.createGain(); AU.engG.gain.value = 0; AU.eng.connect(elp); elp.connect(AU.engG); AU.engG.connect(AU.sfx); AU.eng.start();
  const bn = c.createBufferSource(); bn.buffer = AU.noise; bn.loop = true; const bbp = c.createBiquadFilter(); bbp.type = 'bandpass'; bbp.frequency.value = 520; bbp.Q.value = 0.9;
  AU.bubG = c.createGain(); AU.bubG.gain.value = 0; bn.connect(bbp); bbp.connect(AU.bubG); AU.bubG.connect(AU.sfx); bn.start();
  // the deep: low drone + moving rumble
  AU.ambG = c.createGain(); AU.ambG.gain.value = 0; AU.ambG.connect(AU.out);
  for (const [f, ty, v] of [[41.2, 'sine', 0.5], [61.7, 'triangle', 0.22], [82.6, 'sine', 0.12]]) { const o = c.createOscillator(); o.type = ty; o.frequency.value = f; const gg = c.createGain(); gg.gain.value = v; o.connect(gg); gg.connect(AU.ambG); o.start(); }
  const an = c.createBufferSource(); an.buffer = AU.noise; an.loop = true; const alp = c.createBiquadFilter(); alp.type = 'lowpass'; alp.frequency.value = 170; alp.Q.value = 2;
  const ang = c.createGain(); ang.gain.value = 0.9; an.connect(alp); alp.connect(ang); ang.connect(AU.ambG); an.start();
  const lfo = c.createOscillator(); lfo.frequency.value = 0.07; const lg = c.createGain(); lg.gain.value = 70; lfo.connect(lg); lg.connect(alp.frequency); lfo.start();
  AU.hiss = c.createGain(); AU.hiss.gain.value = 0; const hn = c.createBufferSource(); hn.buffer = AU.noise; hn.loop = true; const hhp = c.createBiquadFilter(); hhp.type = 'highpass'; hhp.frequency.value = 3500;
  hn.connect(hhp); hhp.connect(AU.hiss); AU.hiss.connect(AU.out); hn.start();
  AU.whaleT = 12;
}
function tone(f, dur, o) {
  o = o || {}; if (!AU.c || SET.mute) return; const c = AU.c, tm = c.currentTime + (o.delay || 0);
  const osc = c.createOscillator(), g = c.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, tm);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), tm + dur);
  const v = o.vol == null ? 0.2 : o.vol; g.gain.setValueAtTime(0.0001, tm); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), tm + (o.att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, tm + dur);
  let node = osc; if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
  node.connect(g); let out = g;
  if (o.pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); g.connect(p); out = p; }
  out.connect(AU.sfx);
  if (o.rev) { const s = c.createGain(); s.gain.value = o.rev; out.connect(s); s.connect(AU.revIn); }
  if (o.dl) { const s = c.createGain(); s.gain.value = o.dl; out.connect(s); s.connect(AU.dlIn); }
  osc.start(tm); osc.stop(tm + dur + 0.05);
}
function noiseHit(dur, o) {
  o = o || {}; if (!AU.c || SET.mute) return; const c = AU.c, tm = c.currentTime + (o.delay || 0);
  const s = c.createBufferSource(); s.buffer = AU.noise; const f = c.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.frequency.value = o.f || 900; f.Q.value = o.q || 1;
  const g = c.createGain(); g.gain.setValueAtTime(o.vol || 0.2, tm); g.gain.exponentialRampToValueAtTime(0.0001, tm + dur);
  s.connect(f); f.connect(g); g.connect(AU.sfx); if (o.rev) { const r = c.createGain(); r.gain.value = o.rev; g.connect(r); r.connect(AU.revIn); }
  s.start(tm, Math.random() * 1.5); s.stop(tm + dur + 0.05);
}
const SFX = {
  ping(s, vol) { vol = vol == null ? 1 : vol; const f = [1650, 1250, 880][s]; tone(f, 0.45 + s * 0.55, { vol: (0.14 + s * 0.07) * vol, rev: 0.5 + s * 0.3, dl: 0.35 + s * 0.2, slide: f * 0.94 }); tone(f * 2, 0.06, { vol: 0.05 * vol }); },
  blip(k) {
    if (k === 'art') { tone(1480, 0.25, { vol: 0.06, rev: 0.5 }); tone(2220, 0.3, { vol: 0.045, delay: 0.07, rev: 0.5 }); }
    else if (k === 'pred') tone(240, 0.22, { type: 'square', vol: 0.035, slide: 170, lp: 900 });
    else if (k === 'gate') { tone(196, 1.3, { vol: 0.07, rev: 0.9 }); tone(294, 1.3, { vol: 0.05, rev: 0.9, delay: 0.05 }); }
    else tone(990, 0.15, { vol: 0.035 });
  },
  clank(k) { noiseHit(0.16 + k * 0.1, { f: 700 + k * 500, q: 1.3, vol: 0.06 + k * 0.18 }); tone(200, 0.3, { type: 'triangle', slide: 80, vol: 0.05 + 0.15 * k }); if (k > 0.3) { tone(523 * 1.5, 0.8, { vol: 0.03 * k, rev: 0.6 }); tone(1187, 0.6, { vol: 0.02 * k, rev: 0.6 }); } },
  bite() { noiseHit(0.35, { ft: 'lowpass', f: 380, vol: 0.4 }); tone(120, 0.45, { type: 'sawtooth', slide: 38, vol: 0.2, lp: 500 }); SFX.clank(0.8); },
  growl(pan, vol) { tone(58 + Math.random() * 14, 1.1, { type: 'sawtooth', slide: 40, vol: 0.09 * vol, lp: 260, att: 0.25, pan, rev: 0.4 }); },
  zap() { tone(1300, 0.14, { type: 'square', slide: 280, vol: 0.05, lp: 3000 }); noiseHit(0.12, { ft: 'highpass', f: 2800, vol: 0.09 }); },
  art() { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.5, { vol: 0.07, delay: i * 0.08, rev: 0.8 })); },
  bubble() { for (let i = 0; i < 5; i++) tone(320 + Math.random() * 200, 0.12, { slide: 900 + Math.random() * 400, vol: 0.05, delay: i * 0.06 }); },
  power() { tone(300, 0.4, { type: 'square', slide: 1300, vol: 0.035, lp: 2200 }); tone(1300, 0.3, { vol: 0.04, delay: 0.32, rev: 0.4 }); },
  sig(k) {
    const P = [[[660, 0], [520, 0.11]], [[520, 0], [660, 0.11]], [[520, 0], [780, 0.1]], [[780, 0], [520, 0.1]], [[440, 0], [440, 0.14]], null, [[880, 0], [1175, 0.1]]][k];
    if (!P) { for (let i = 0; i < 3; i++) { tone(880, 0.09, { type: 'square', vol: 0.05, delay: i * 0.18, lp: 2500 }); tone(620, 0.09, { type: 'square', vol: 0.05, delay: i * 0.18 + 0.09, lp: 2500 }); } return; }
    for (const [f, d] of P) tone(f, 0.12, { type: 'triangle', vol: 0.12, delay: d });
  },
  alarm() { tone(880, 0.14, { type: 'square', vol: 0.04, lp: 2000 }); tone(660, 0.14, { type: 'square', vol: 0.04, lp: 2000, delay: 0.17 }); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.9, { vol: 0.08, delay: i * 0.1, rev: 0.9, type: 'triangle' })); },
  lose() { tone(220, 1.8, { type: 'sawtooth', slide: 45, vol: 0.12, lp: 600, rev: 0.6 }); noiseHit(1.3, { ft: 'lowpass', f: 240, vol: 0.4, rev: 0.5 }); },
  click() { tone(760, 0.05, { vol: 0.035 }); },
  mark() { tone(1200, 0.08, { vol: 0.04 }); tone(1600, 0.08, { vol: 0.03, delay: 0.05 }); },
  join() { tone(660, 0.15, { vol: 0.06 }); tone(990, 0.2, { vol: 0.06, delay: 0.12 }); },
  whale() { const f = 120 + Math.random() * 90; tone(f, 3.2, { slide: f * (0.6 + Math.random() * 0.5), vol: 0.022, rev: 1.4, att: 0.9, lp: 700 }); }
};
function audioTick(dt) {
  if (!AU.c) return; const tm = AU.c.currentTime;
  const playing = G.phase === 'play' && !G.paused;
  const pilotish = playing && G.view === 'pilot' && G.sub && G.sub.alive;
  const sp = pilotish ? Math.hypot(G.sub.vx, G.sub.vy) : 0;
  AU.engG.gain.setTargetAtTime(pilotish ? 0.012 + sp / 265 * 0.07 : 0, tm, 0.15);
  AU.eng.frequency.setTargetAtTime(40 + sp * 0.28, tm, 0.2);
  AU.bubG.gain.setTargetAtTime(pilotish ? sp / 265 * 0.05 : 0, tm, 0.2);
  AU.ambG.gain.setTargetAtTime(playing ? 0.05 : 0.03, tm, 0.8);
  AU.hiss.gain.setTargetAtTime(playing && G.view === 'sonar' ? 0.006 : 0, tm, 0.5);
  AU.whaleT -= dt; if (AU.whaleT <= 0) { AU.whaleT = 22 + Math.random() * 30; SFX.whale(); }
}

// ---------------------------------------------------------------- game state
const G = {
  phase: 'menu', mode: 'solo', role: 'solo', view: 'title', paused: false, pausedBy: '', screen: null,
  lvl: 1, time: 0, rt: 0, sub: null, preds: [], jel: [], arts: [], picks: [], noise: 0, pingStr: 1, pingCd: 0,
  pings: [], pending: [], cont: null, press: [], parts: [], snow: [], plank: [], markers: [], mkType: 0, mkId: 1,
  shake: 0, flash: 0, flashC: '255,60,60', cam: { x: 0, y: 0, z: 1, sx: 0, sy: 0 }, D: null, trail: [], oz: 1, keys: new Set(), mouse: null,
  assist: false, selLvl: 1, result: null, artsGot: 0, endT: 0, ending: null, tips: [], tipT: 0, alarmT: 0, growlT: 0, stT: 0, clankT: 0, hintQuiet: false,
  demo: null, titleL: null, autopilot: false, forced: null, opBarH: 120, stRecv: 0
};
const isTouch = () => document.body.classList.contains('touch');
const canPing = () => G.view === 'pilot' && (G.mode === 'solo' || G.assist);
const zoneName = (n) => t('ed_z' + Math.min(NLVL, n));
const depthAt = (y) => L ? Math.round(L.P.depth0 + clamp(y / L.H, 0, 1) * L.P.span) : 0;

function seedFor(n) { return G.mode === 'online' && ON.code ? hashStr('echoes:' + ON.code + ':' + n) : hashStr('echoes-solo:' + n); }
function makePred(sp, i) {
  const levi = sp.k === 'levi';
  const p = { k: sp.k, x: sp.x, y: sp.y, vx: 0, vy: 0, a: 0, st: 'wander', stT: 0, tx: sp.x, ty: sp.y, hx: sp.x, hy: sp.y, sx: sp.x, sy: sp.y, path: [], repath: 0, stuck: 0,
    cd: 0, r: levi ? 30 : 12, ph: i * 1.7, sp: levi ? { w: 32, i: 78, h: 122 + G.lvl * 2 } : { w: 48, i: 112, h: L.P.hunt }, dmg: levi ? 36 : 20, ear: levi ? 1.35 : 1,
    grid: levi ? L.oc2 : L.oc, body: [], seg: levi ? 10 : 7.5, alert: 0, vis: 0, losT: 0 };
  for (let k = 0; k < (levi ? 18 : 15); k++) p.body.push([p.x, p.y + k * 0.01]);
  return p;
}
function startLevel(n, opts) {
  opts = opts || {}; auInit();
  n = clamp(n, 1, NLVL); G.lvl = n;
  L = genLevel(n, opts.seed != null ? opts.seed : seedFor(n)); CHUNKS.clear();
  const s0 = L.start;
  G.sub = { x: s0.x, y: s0.y, vx: 0, vy: 0, aim: Math.PI / 2, face: 1, hull: 100, o2: 100, pw: 100, lamp: true, stun: 0, inv: 0, prop: 0, alive: true, lastSafe: [s0.x, s0.y] };
  G.preds = L.predSpawns.map((p, i) => makePred(p, i));
  G.jel = L.jellies.map(j => Object.assign({ cd: 0, vis: 0 }, j));
  G.arts = L.arts.map(a => Object.assign({ got: false, vis: 0 }, a));
  G.picks = L.picks.map(p => Object.assign({ got: false, vis: 0 }, p));
  G.time = 0; G.pings = []; G.pending = []; G.cont = { arts: [], picks: [], gate: 0, preds: [], jel: [] }; G.press = []; G.parts = [];
  G.markers = []; G.shake = 0; G.flash = 0; G.pingCd = 0; G.noise = 0; G.paused = false; G.result = null; G.trail = []; G.artsGot = 0; G.ending = null; G.endT = 0;
  G.alarmT = 0; G.hintQuiet = false; G.o2Warned = false; G.keys.clear(); G.stRecv = performance.now();
  G.D = { x: s0.x, y: s0.y, vx: 0, vy: 0, a: Math.PI / 2, hull: 100, o2: 100, pw: 100, n: 0, lamp: 1, rx: s0.x, ry: s0.y, rt: performance.now() };
  G.phase = 'play'; G.view = G.role === 'sonar' ? 'sonar' : 'pilot';
  G.cam.x = s0.x; G.cam.y = s0.y;
  G.tips = [];
  if (G.view === 'sonar') { if (n <= 2) G.tips.push(['ed_tipSonar', 9]); }
  else if (G.mode === 'solo') { if (n === 1) G.tips.push([isTouch() ? 'ed_tipMoveT' : 'ed_tipMove', 7], [isTouch() ? 'ed_tipPingT' : 'ed_tipPing', 8]); }
  else if (n <= 2) G.tips.push(['ed_tipPilot', 8]);
  G.tipT = 0; showTip(null);
  hideScreen(); uiMode(); hudUpdate(true);
}
function endLevel(win, reason) {
  if (G.phase !== 'play' || G.ending) return;
  const s = G.sub;
  G.ending = { win, reason: reason || (win ? '' : 'hull') }; G.endT = win ? 1.3 : 1.6;
  if (win) { SFX.win(); burst(L.gate.x, L.gate.y, 'glow', 40, '#ffd36e'); flash('255,220,120', 0.5); }
  else { s.alive = false; SFX.lose(); burst(s.x, s.y, 'debris', 26); burst(s.x, s.y, 'bub', 30); shake(22); flash('255,30,50', 0.7); }
}
function finishLevel() {
  const e = G.ending; G.ending = null; const s = G.sub, win = e.win;
  const score = win ? G.artsGot * 1000 + Math.round(s.hull) * 6 + Math.round(s.o2) * 4 + Math.max(0, Math.round(L.o2Time - G.time)) * 3 + G.lvl * 250 : G.artsGot * 250;
  const R = { win, reason: e.reason, lvl: G.lvl, arts: G.artsGot, score, time: G.time, hull: Math.max(0, Math.round(s.hull)), newBest: false, depth: depthAt(s.y) };
  recordResult(R);
  G.result = R; G.phase = 'result'; G.paused = false;
  if (G.mode === 'online' && G.role === 'pilot') netSend('end', { r: R });
  uiMode(); showScreen('result');
}
function recordResult(R) {
  SAVE.deepest = Math.max(SAVE.deepest || 0, R.depth || 0);
  if (R.win) {
    const b = SAVE.best[R.lvl] || { stars: 0, score: 0, time: 0 };
    if (R.score > b.score) { R.newBest = b.score > 0; b.score = R.score; }
    b.stars = Math.max(b.stars, R.arts); b.time = b.time ? Math.min(b.time, R.time) : R.time;
    SAVE.best[R.lvl] = b; SAVE.unlocked = Math.max(SAVE.unlocked, Math.min(NLVL, R.lvl + 1));
    if (R.lvl === NLVL) SAVE.done = true;
  }
  saveProgress();
}
function shake(v) { G.shake = Math.max(G.shake, v); }
function flash(c, a) { G.flashC = c; G.flash = Math.max(G.flash, a); }
function burst(x, y, k, n, col) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = k === 'bub' ? 20 + Math.random() * 60 : k === 'glow' ? 30 + Math.random() * 140 : 60 + Math.random() * 180;
    G.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: k === 'bub' ? 1.2 + Math.random() * 1.4 : k === 'glow' ? 0.8 + Math.random() * 0.8 : 0.4 + Math.random() * 0.6, k, s: k === 'bub' ? 1.5 + Math.random() * 3 : 1 + Math.random() * 2.5, c: col });
  }
  if (G.parts.length > 500) G.parts.splice(0, G.parts.length - 500);
}

// ---------------------------------------------------------------- simulation (solo / pilot = authority)
function soundEvent(x, y, rad, kind) {
  let alerted = 0;
  for (const p of G.preds) {
    if (p.st === 'flee') continue;
    const d = Math.hypot(p.x - x, p.y - y) / p.ear; if (d > rad) continue;
    if (d < rad * 0.4 || p.st === 'hunt') { if (p.st !== 'hunt') alerted++; p.st = 'hunt'; p.stT = 3; }
    else { if (p.st !== 'inv') alerted++; p.st = 'inv'; p.stT = 9; }
    p.tx = x; p.ty = y; p.repath = 0; p.alert = 1.6;
  }
  if (alerted) { hudAlert(); if (G.mode === 'online') netSend('ev', { k: 'alert' }); }
  return alerted;
}
function newRoam(p) {
  const base = p.st === 'search' ? [p.sx, p.sy] : [p.hx, p.hy];
  const q = randomOpenNear(p.grid, base[0], base[1], p.st === 'search' ? 4 : 8);
  p.tx = q[0]; p.ty = q[1]; p.repath = 0;
}
function predStep(p, dt) {
  const s = G.sub; p.cd -= dt; p.stT -= dt; p.alert = Math.max(0, p.alert - dt); p.repath -= dt;
  const dx = s.x - p.x, dy = s.y - p.y, d = Math.hypot(dx, dy);
  if (p.st !== 'flee' && s.alive && p.cd < 2) {
    if (d / p.ear < G.noise || d < p.r + 36) {
      if (p.st !== 'hunt') { p.alert = 1.6; p.repath = 0; if (!G.hintQuiet && G.lvl <= 3 && G.view === 'pilot') { G.hintQuiet = true; G.tips.unshift(['ed_tipQuiet', 6]); G.tipT = 0; } }
      p.st = 'hunt'; p.stT = 2.2; p.tx = s.x; p.ty = s.y;
    }
  }
  let spd = p.sp.w;
  if (p.st === 'hunt') { spd = p.sp.h; if (p.stT <= 0) { p.st = 'search'; p.stT = 5; p.sx = p.tx; p.sy = p.ty; } }
  else if (p.st === 'inv') { spd = p.sp.i; if (Math.hypot(p.tx - p.x, p.ty - p.y) < 40 || p.stT <= 0) { p.st = 'search'; p.stT = 4 + Math.random() * 2; p.sx = p.tx; p.sy = p.ty; newRoam(p); } }
  else if (p.st === 'search') { spd = p.sp.w * 1.45; if (p.stT <= 0) { p.st = 'wander'; newRoam(p); } }
  else if (p.st === 'flee') { spd = p.sp.i; if (p.stT <= 0) { p.st = 'wander'; newRoam(p); } }
  const reached = Math.hypot(p.tx - p.x, p.ty - p.y) < 30;
  if ((p.st === 'wander' || p.st === 'search') && reached) newRoam(p);
  if (p.repath <= 0) { p.path = findPath(p.grid, p.x, p.y, p.tx, p.ty); p.repath = p.st === 'hunt' ? 0.35 : 2.2; }
  while (p.path.length && Math.hypot(p.path[0][0] - p.x, p.path[0][1] - p.y) < 22) p.path.shift();
  if (p.path.length > 1 && los(p.x, p.y, p.path[1][0], p.path[1][1])) p.path.shift();
  let gx = p.tx, gy = p.ty;
  if (p.st === 'hunt' && d < 160 && los(p.x, p.y, s.x, s.y)) { gx = s.x; gy = s.y; p.path = []; }
  else if (p.path.length) { gx = p.path[0][0]; gy = p.path[0][1]; }
  const ddx = gx - p.x, ddy = gy - p.y, dd = Math.hypot(ddx, ddy) || 1;
  const want = (reached && !p.path.length && p.st !== 'hunt') ? 0 : spd;
  const k = 1 - Math.exp(-dt * (p.k === 'levi' ? 1.7 : 3.2));
  p.vx += (ddx / dd * want - p.vx) * k; p.vy += (ddy / dd * want - p.vy) * k;
  const ox = p.x, oy = p.y;
  p.x += p.vx * dt; p.y += p.vy * dt;
  collide(p, p.r * 0.55, 0.1);
  if (dens(p.x, p.y) > 0.6) { p.x = ox; p.y = oy; p.vx *= -0.3; p.vy *= -0.3; }
  const moved = Math.hypot(p.x - ox, p.y - oy);
  if (want > 0 && moved < want * dt * 0.25) p.stuck += dt; else p.stuck = Math.max(0, p.stuck - dt);
  if (p.stuck > 1.4) { p.stuck = 0; p.repath = 0; if (p.st !== 'hunt') newRoam(p); }
  if (Math.hypot(p.vx, p.vy) > 4) p.a = Math.atan2(p.vy, p.vx);
  rope(p);
  if (s.alive && d < p.r + SUB_R + 2 && p.cd <= 0 && p.st !== 'flee' && s.inv <= 0) bite(p);
}
function rope(p) {
  const B = p.body; B[0][0] = p.x; B[0][1] = p.y;
  for (let k = 1; k < B.length; k++) { const a = B[k - 1], b = B[k], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); if (d > p.seg) { b[0] = a[0] + dx / d * p.seg; b[1] = a[1] + dy / d * p.seg; } }
}
function bite(p) {
  const s = G.sub, dx = s.x - p.x, dy = s.y - p.y, d = Math.hypot(dx, dy) || 1;
  s.hull -= p.dmg; s.inv = 1.1; s.vx += dx / d * 260; s.vy += dy / d * 260;
  p.st = 'flee'; p.stT = 3.5; p.cd = 9; const q = randomOpenNear(p.grid, p.x - dx / d * 220, p.y - dy / d * 220, 3); p.tx = q[0]; p.ty = q[1]; p.repath = 0;
  shake(16); flash('255,40,60', 0.55); SFX.bite(); burst(s.x, s.y, 'debris', 14); burst(s.x, s.y, 'bub', 12);
  toast(t('ed_bitten')); if (G.mode === 'online') netSend('ev', { k: 'bite' });
  soundEvent(s.x, s.y, 220, 'bite');
}
const jelPos = (j, tm) => [j.x + Math.sin(tm * 0.31 + j.ph) * 22, j.y + Math.sin(tm * 0.47 + j.ph * 1.3) * 16];
function pilotInput() {
  let ix = 0, iy = 0, boost = false;
  const k = G.keys;
  if (k.has('KeyD') || k.has('ArrowRight')) ix += 1; if (k.has('KeyA') || k.has('ArrowLeft')) ix -= 1;
  if (k.has('KeyS') || k.has('ArrowDown')) iy += 1; if (k.has('KeyW') || k.has('ArrowUp')) iy -= 1;
  if (k.has('ShiftLeft') || k.has('ShiftRight')) boost = true;
  const creep = k.has('KeyC');
  if (JOY.active) { ix = JOY.x; iy = JOY.y; }
  if (TB.boost) boost = true;
  if (G.forced) { ix = G.forced.x; iy = G.forced.y; boost = !!G.forced.boost; }
  if (G.autopilot) { const a = autoDir(); ix = a[0]; iy = a[1]; boost = false; }
  const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  return [ix, iy, boost && !creep, creep];
}
function autoDir() {   // testing aid: swim toward the gate along a path
  const s = G.sub; G.apT = (G.apT || 0) - 1 / 60;
  if (!G.apPath || G.apT <= 0) { G.apPath = findPath(L.oc, s.x, s.y, L.gate.x, L.gate.y, 1e9); G.apT = 0.5; }
  while (G.apPath.length && Math.hypot(G.apPath[0][0] - s.x, G.apPath[0][1] - s.y) < 20) G.apPath.shift();
  const q = G.apPath[0] || [L.gate.x, L.gate.y], dx = q[0] - s.x, dy = q[1] - s.y, d = Math.hypot(dx, dy) || 1;
  return [dx / d * 0.75, dy / d * 0.75];
}
function simStep(dt) {
  const s = G.sub; G.time += dt;
  s.stun = Math.max(0, s.stun - dt); s.inv = Math.max(0, s.inv - dt); G.pingCd = Math.max(0, G.pingCd - dt);
  const [ix, iy, wantBoost, creep] = s.alive ? pilotInput() : [0, 0, false, false];
  const m = Math.hypot(ix, iy);
  const boosting = wantBoost && s.pw > 1 && m > 0.1;
  const acc = (boosting ? 640 : 370) * (s.stun > 0 ? 0.3 : 1);
  s.vx += ix * acc * dt; s.vy += iy * acc * dt;
  const maxV = boosting ? 265 : 150 * (creep ? 0.29 : clamp(m * 1.15, 0.3, 1)), sp0 = Math.hypot(s.vx, s.vy);
  if (sp0 > maxV) { const f = lerp(1, maxV / sp0, Math.min(1, dt * 5)); s.vx *= f; s.vy *= f; }
  const drag = Math.exp(-(m > 0.1 ? 0.55 : 1.9) * dt); s.vx *= drag; s.vy *= drag;
  const steps = Math.max(1, Math.ceil(Math.hypot(s.vx, s.vy) * dt / 7));
  let imp = 0;
  for (let k = 0; k < steps; k++) {
    s.x += s.vx * dt / steps; s.y += s.vy * dt / steps;
    imp = Math.max(imp, collide(s, SUB_R, 0.25));
  }
  if (dens(s.x, s.y) > 0.62) { s.x = s.lastSafe[0]; s.y = s.lastSafe[1]; s.vx *= -0.3; s.vy *= -0.3; } else { s.lastSafe[0] = s.x; s.lastSafe[1] = s.y; }
  G.clankT -= dt;
  if (imp > 40 && s.alive && G.clankT <= 0) {
    G.clankT = 0.18; const k = clamp((imp - 40) / 200, 0, 1);
    SFX.clank(k); burst(s.x, s.y, 'spark', 3 + Math.round(k * 8), '#ffd27a');
    if (imp > 95) { s.hull -= (imp - 95) * 0.1; shake(4 + k * 9); flash('255,120,60', 0.25 * k + 0.05); if (G.mode === 'online') netSend('ev', { k: 'hit' }); }
    if (imp > 55) soundEvent(s.x, s.y, 120 + imp * 1.3, 'hit');
  }
  // aim the lamp: mouse > joystick/keys
  let aimT = null;
  if (G.mouse && performance.now() - G.mouse.t < 4000 && !isTouch()) aimT = Math.atan2(G.mouse.y - (s.y - G.cam.y) * G.cam.z - H / 2, G.mouse.x - (s.x - G.cam.x) * G.cam.z - W / 2);
  else if (TB.aim) aimT = TB.aim.a;
  else if (m > 0.2) aimT = Math.atan2(iy, ix);
  if (aimT != null) s.aim += angDiff(s.aim, aimT) * Math.min(1, dt * 7);
  if (Math.abs(s.vx) > 12) s.face = s.vx > 0 ? 1 : -1; else if (Math.cos(s.aim) * s.face < -0.3) s.face = -s.face;
  s.prop += dt * (4 + Math.hypot(s.vx, s.vy) * 0.12);
  // resources
  s.o2 -= 100 / L.o2Time * dt;
  const lampOn = s.lamp && s.pw > 0.5;
  s.pw = clamp(s.pw + ((boosting ? -6 : 1) - (lampOn ? 0.5 : 0)) * dt, 0, 100);
  // noise: moving fast is loud
  const sp = Math.hypot(s.vx, s.vy);
  G.noise = !s.alive ? 0 : boosting ? 200 + Math.max(0, sp - 150) * 1.5 : sp < 48 ? 0 : (sp - 48) * 1.15;
  // propeller bubbles
  if (sp > 30 && Math.random() < sp / 300) G.parts.push({ x: s.x - s.face * 22, y: s.y + (Math.random() - 0.5) * 6, vx: -s.vx * 0.2 - s.face * 20, vy: (Math.random() - 0.5) * 20, life: 0, max: 1 + Math.random(), k: 'bub', s: 1 + Math.random() * 2 });
  for (const p of G.preds) predStep(p, dt);
  for (const j of G.jel) {
    j.cd -= dt; const [jx, jy] = jelPos(j, G.time);
    if (s.alive && j.cd <= 0 && s.inv <= 0 && Math.hypot(jx - s.x, jy - s.y) < 20 + SUB_R) {
      j.cd = 2; s.hull -= 8; s.stun = 1; s.inv = 0.6; SFX.zap(); burst(s.x, s.y, 'spark', 10, '#ff8af0'); flash('255,120,230', 0.3); shake(5);
      const dx = s.x - jx, dy = s.y - jy, d = Math.hypot(dx, dy) || 1; s.vx += dx / d * 120; s.vy += dy / d * 120;
      if (G.mode === 'online') netSend('ev', { k: 'hit' });
    }
  }
  if (s.alive) {
    G.arts.forEach((a, i) => { if (!a.got && Math.hypot(a.x - s.x, a.y - s.y) < 30) { a.got = true; G.artsGot++; SFX.art(); burst(a.x, a.y, 'glow', 26, '#d08cff'); toast(t('ed_gotArt', { n: G.artsGot, m: G.arts.length })); if (G.mode === 'online') netSend('ev', { k: 'art', i }); } });
    G.picks.forEach((p) => { if (!p.got && Math.hypot(p.x - s.x, p.y - s.y) < 28) { p.got = true; if (p.k === 'o2') { s.o2 = Math.min(100, s.o2 + 40); SFX.bubble(); toast(t('ed_gotO2')); burst(p.x, p.y, 'bub', 20); } else { s.pw = Math.min(100, s.pw + 45); SFX.power(); toast(t('ed_gotPw')); burst(p.x, p.y, 'glow', 16, '#ffd23e'); } if (G.mode === 'online') netSend('ev', { k: p.k }); } });
    for (let i = G.markers.length - 1; i >= 0; i--) { const mk = G.markers[i]; if (mk.k === 'go' && mk.x2 == null && Math.hypot(mk.x - s.x, mk.y - s.y) < 45) { G.markers.splice(i, 1); SFX.mark(); if (G.mode === 'online') netSend('mkdone', { mid: mk.id }); } }
    if (Math.hypot(L.gate.x - s.x, L.gate.y - s.y) < 48) endLevel(true);
    else if (s.hull <= 0) { s.hull = 0; endLevel(false, 'hull'); }
    else if (s.o2 <= 0) { s.o2 = 0; endLevel(false, 'o2'); }
  }
  // warnings
  G.alarmT -= dt;
  if (s.alive && (s.o2 < 18 || s.hull < 22) && G.alarmT <= 0) { G.alarmT = 1.6; SFX.alarm(); if (s.o2 < 18 && !G.o2Warned) { G.o2Warned = true; toast(t('ed_lowO2')); } }
  if (s.o2 > 30) G.o2Warned = false;
  // distant growls from hunting predators
  G.growlT -= dt;
  if (G.growlT <= 0) {
    let best = null, bd = 520; for (const p of G.preds) { if (p.st !== 'hunt' && p.st !== 'inv') continue; const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; best = p; } }
    if (best) { SFX.growl(clamp((best.x - s.x) / 300, -1, 1), 1 - bd / 560); G.growlT = 1.6 + Math.random() * 1.6; } else G.growlT = 0.6;
  }
}

// ---------------------------------------------------------------- sonar
const TRIG = {};
function trig(n) { let a = TRIG[n]; if (a) return a; a = { c: new Float32Array(n), s: new Float32Array(n) }; for (let k = 0; k < n; k++) { a.c[k] = Math.cos(k / n * TAU); a.s[k] = Math.sin(k / n * TAU); } return (TRIG[n] = a); }
function makePing(si, ox, oy) {
  const P = PINGS[si], n = P.rays, tg = trig(n), d = new Float32Array(n);
  for (let k = 0; k < n; k++) d[k] = rayHit(ox, oy, tg.c[k], tg.s[k], P.range, 8);
  // fainter returns from walls hidden behind rock: the operator sees the shape of the maze around the sub
  const ws = [], r2 = P.range * P.range, i0 = Math.max(0, Math.floor((ox - P.range) / C)), i1 = Math.min(L.GW - 1, Math.floor((ox + P.range) / C)), j0 = Math.max(0, Math.floor((oy - P.range) / C)), j1 = Math.min(L.GH - 1, Math.floor((oy + P.range) / C));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const sg = L.segs[j * L.GW + i]; if (!sg) continue;
    for (let k = 0; k < sg.length; k += 6) { const mx = (sg[k] + sg[k + 2]) / 2 - ox, my = (sg[k + 1] + sg[k + 3]) / 2 - oy, d2 = mx * mx + my * my; if (d2 < r2) ws.push(sg[k], sg[k + 1], sg[k + 2], sg[k + 3], Math.sqrt(d2)); }
  }
  G.pings.push({ x: ox, y: oy, t0: G.rt, s: si, range: P.range, n, d, w: new Float32Array(ws) });
  if (G.pings.length > 14) G.pings.shift();
  const rev = (x, y) => G.rt + Math.hypot(x - ox, y - oy) / RING_V, inR = (x, y) => Math.hypot(x - ox, y - oy) < P.range;
  G.arts.forEach((a, i) => { if (!a.got && inR(a.x, a.y)) G.pending.push({ k: 'art', i, at: rev(a.x, a.y) }); });
  G.picks.forEach((p, i) => { if (!p.got && inR(p.x, p.y)) G.pending.push({ k: 'pick', i, at: rev(p.x, p.y) }); });
  if (inR(L.gate.x, L.gate.y)) G.pending.push({ k: 'gate', at: rev(L.gate.x, L.gate.y) });
  for (const p of G.preds) if (inR(p.x, p.y)) G.pending.push({ k: 'pred', at: rev(p.x, p.y), x: p.x, y: p.y, levi: p.k === 'levi', hunt: p.st === 'hunt' || p.st === 'inv' });
  for (const j of G.jel) { const [x, y] = jelPos(j, G.time); if (inR(x, y)) G.pending.push({ k: 'jel', at: rev(x, y), x, y }); }
}
function sonarTick() {
  for (let i = G.pending.length - 1; i >= 0; i--) {
    const e = G.pending[i]; if (G.rt < e.at) continue; G.pending.splice(i, 1);
    const C2 = G.cont;
    if (e.k === 'art') { if (!C2.arts[e.i]) SFX.blip('art'); C2.arts[e.i] = G.rt; }
    else if (e.k === 'pick') { if (!C2.picks[e.i]) SFX.blip('pk'); C2.picks[e.i] = G.rt; }
    else if (e.k === 'gate') { if (!C2.gate) { SFX.blip('gate'); toast(t('ed_gateFound')); } C2.gate = G.rt; }
    else if (e.k === 'pred') { SFX.blip('pred'); C2.preds.push({ x: e.x, y: e.y, levi: e.levi, hunt: e.hunt, t: G.rt }); }
    else C2.jel.push({ x: e.x, y: e.y, t: G.rt });
  }
  const C2 = G.cont; if (!C2) return;
  if (C2.preds.length && G.rt - C2.preds[0].t > 5) C2.preds = C2.preds.filter(p => G.rt - p.t < 5);
  if (C2.jel.length && G.rt - C2.jel[0].t > 6) C2.jel = C2.jel.filter(p => G.rt - p.t < 6);
  G.pings = G.pings.filter(p => G.rt - p.t0 < 30);
}
// a ping fired by the pilot in solo / assist mode
function pilotPing(si) {
  if (si != null) setStr(si);
  if (!canPing() || G.phase !== 'play' || G.paused || !G.sub.alive) return false;
  if (G.pingCd > 0) return false;
  return applyPing(G.pingStr, false);
}
// the sub emits a ping (solo/assist from the pilot, or requested by the sonar operator online)
function applyPing(si, fromOp) {
  const P = PINGS[si], s = G.sub;
  if (s.pw < P.cost) { if (!fromOp) toast(t('ed_noPower')); return false; }
  s.pw -= P.cost; G.pingCd = P.cd;
  soundEvent(s.x, s.y, P.alert, 'ping');
  G.press.push({ x: s.x, y: s.y, t0: G.rt, r: P.range });
  SFX.ping(si, fromOp ? 0.55 : 1);
  if (!fromOp) makePing(si, s.x, s.y);
  return true;
}
function opPing(si) {
  if (si != null) setStr(si);
  if (G.view !== 'sonar' || G.phase !== 'play' || G.paused || G.pingCd > 0) return false;
  const P = PINGS[G.pingStr];
  if (G.D.pw < P.cost) { toast(t('ed_noPower')); return false; }
  G.pingCd = P.cd; G.D.pw -= P.cost;
  makePing(G.pingStr, G.D.x, G.D.y); SFX.ping(G.pingStr);
  netSend('ping', { s: G.pingStr });
  return true;
}
function setStr(i) { G.pingStr = clamp(i | 0, 0, 2); hudUpdate(true); }

// operator side: the pilot's broadcast state
function applySt(p) {
  const D = G.D, now = performance.now();
  if (Math.hypot(D.x - p.x, D.y - p.y) > 300) { D.x = p.x; D.y = p.y; }
  D.rx = p.x; D.ry = p.y; D.vx = p.vx; D.vy = p.vy; D.a = p.a; D.hull = p.h; D.o2 = p.o; D.pw = p.p; D.n = p.n; D.lamp = p.L; D.rt = now; D.f = p.f;
  G.time = p.t; G.stRecv = now;
  if (p.pr) p.pr.forEach((q, i) => { const pr = G.preds[i]; if (!pr) return; pr.rx = q[0]; pr.ry = q[1]; pr.st = ST_NAME[q[2]] || 'wander'; if (pr.x === pr.hx && pr.y === pr.hy && !pr.seen) { pr.x = q[0]; pr.y = q[1]; } pr.seen = true; });
  if (p.ar != null) G.arts.forEach((a, i) => { const got = !!(p.ar & (1 << i)); if (got && !a.got) { a.got = true; } });
  if (p.pk != null) G.picks.forEach((q, i) => { q.got = !!(p.pk & (1 << i)); });
  G.artsGot = G.arts.filter(a => a.got).length;
}
function opStep(dt) {
  const D = G.D, now = performance.now();
  G.pingCd = Math.max(0, G.pingCd - dt);
  G.time += dt;
  const age = Math.min(0.3, (now - D.rt) / 1000), tx = D.rx + D.vx * age, ty = D.ry + D.vy * age, k = 1 - Math.exp(-dt * 10);
  D.x += (tx - D.x) * k; D.y += (ty - D.y) * k;
  for (const p of G.preds) if (p.rx != null) { p.x += (p.rx - p.x) * k; p.y += (p.ry - p.y) * k; }
  G.trailT = (G.trailT || 0) - dt;
  if (G.trailT <= 0) { G.trailT = 0.4; const l = G.trail[G.trail.length - 1]; if (!l || Math.hypot(l[0] - D.x, l[1] - D.y) > 6) { G.trail.push([D.x, D.y]); if (G.trail.length > 160) G.trail.shift(); } }
}
function opEvent(p) {
  if (p.k === 'bite') { SFX.bite(); shake(12); flash('255,40,60', 0.45); toast(t('ed_bitten')); }
  else if (p.k === 'hit') { SFX.clank(0.5); shake(5); }
  else if (p.k === 'art') { SFX.art(); toast(t('ed_gotArt', { n: Math.min(3, G.artsGot + 1), m: 3 })); if (G.arts[p.i]) G.arts[p.i].got = true; G.artsGot = G.arts.filter(a => a.got).length; }
  else if (p.k === 'o2') { SFX.bubble(); toast(t('ed_gotO2')); }
  else if (p.k === 'pw') { SFX.power(); toast(t('ed_gotPw')); }
  else if (p.k === 'alert') hudAlert();
}

// ---------------------------------------------------------------- main update
function update(dt) {
  G.rt += dt; G.fdt = dt; frameNo++;
  G.shake *= Math.exp(-dt * 7); G.flash = Math.max(0, G.flash - dt * 1.4);
  if (G.phase === 'play' && !G.paused) {
    if (G.view === 'pilot') simStep(dt);
    else opStep(dt);
    if (G.ending) { G.endT -= dt; if (G.ending.win && G.view === 'pilot') { const s = G.sub; s.x += (L.gate.x - s.x) * Math.min(1, dt * 3); s.y += (L.gate.y - s.y) * Math.min(1, dt * 3); } if (G.endT <= 0) finishLevel(); }
    // tips
    if (G.tips.length) { G.tipT += dt; if (G.tipT > G.tips[0][1]) { G.tips.shift(); G.tipT = 0; } showTip(G.tips[0] ? G.tips[0][0] : null); }
  } else if (G.phase === 'menu' || G.phase === 'lobby') demoStep(dt);
  sonarTick();
  // particles
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i]; p.life += dt;
    if (p.life >= p.max) { G.parts.splice(i, 1); continue; }
    const dr = Math.exp(-dt * (p.k === 'bub' ? 1.5 : 3)); p.vx *= dr; p.vy *= dr;
    if (p.k === 'bub') p.vy -= 40 * dt; else if (p.k === 'debris') p.vy += 60 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  G.press = G.press.filter(p => G.rt - p.t0 < 1.4);
  ambientParts(dt);
  // network: the pilot streams the world ~12 Hz
  if (G.mode === 'online' && G.role === 'pilot' && G.phase === 'play' && ON.ready) { G.stT -= dt; if (G.stT <= 0) { G.stT = 0.08; sendSt(); } }
  audioTick(dt);
  G.hudT -= dt; if (G.hudT <= 0) { G.hudT = 0.1; hudUpdate(); }
}
function demoStep(dt) {
  if (!G.titleL) { G.titleL = genLevel(1, hashStr('echoes-title-3')); }
  let snap = false;
  if (L !== G.titleL) { L = G.titleL; CHUNKS.clear(); snap = true; }
  const s0 = L.start;
  if (!G.demo) { G.demo = { x: s0.x, y: s0.y + 20, vx: 0, vy: 0, aim: 0.6, face: 1, prop: 0, lamp: true, pw: 100, alive: true, inv: 0 }; snap = true; }
  const d = G.demo, tm = G.rt;
  const tx = s0.x + Math.sin(tm * 0.21) * 36, ty = s0.y + 14 + Math.sin(tm * 0.33) * 18;
  d.vx = (tx - d.x) * 2; d.vy = (ty - d.y) * 2; d.x = tx; d.y = ty;
  d.aim = Math.PI / 2 + Math.sin(tm * 0.27) * 1.25; d.face = Math.cos(d.aim) >= 0 ? 1 : -1; d.prop += dt * 6;
  if (Math.random() < 0.08) G.parts.push({ x: d.x - d.face * 22, y: d.y, vx: -d.face * 20, vy: -10, life: 0, max: 1.5, k: 'bub', s: 1 + Math.random() * 2 });
  const wide = W > 900, fx = wide ? d.x + (W * 0.3) / G.cam.z : d.x, fy = wide ? d.y + 30 : d.y + (H * 0.3) / G.cam.z;
  const kk = snap ? 1 : Math.min(1, dt * 2); G.cam.x += (fx - G.cam.x) * kk; G.cam.y += (fy - G.cam.y) * kk;
  if (Math.random() < dt * 0.25) { G.press.push({ x: d.x, y: d.y, t0: G.rt, r: 300 }); }
}
function ambientParts(dt) {
  const z = G.cam.z, hw = W / 2 / z + 60, hh = H / 2 / z + 60, cx = G.cam.x, cy = G.cam.y;
  if (G.snow.length < 130) for (let i = G.snow.length; i < 130; i++) G.snow.push({ x: cx + (Math.random() - 0.5) * 2 * hw, y: cy + (Math.random() - 0.5) * 2 * hh, s: 0.6 + Math.random() * 1.4, v: 4 + Math.random() * 10, ph: Math.random() * TAU });
  if (G.plank.length < 70) for (let i = G.plank.length; i < 70; i++) G.plank.push({ x: cx + (Math.random() - 0.5) * 2 * hw, y: cy + (Math.random() - 0.5) * 2 * hh, ph: Math.random() * TAU, f: 0, c: Math.random() < 0.7 ? '#4df3ff' : '#2fffc1' });
  const wrap = (p) => { if (p.x < cx - hw) p.x += hw * 2; else if (p.x > cx + hw) p.x -= hw * 2; if (p.y < cy - hh) p.y += hh * 2; else if (p.y > cy + hh) p.y -= hh * 2; };
  for (const p of G.snow) { p.y += p.v * dt; p.x += Math.sin(G.rt * 0.4 + p.ph) * 4 * dt; wrap(p); }
  const s = G.phase === 'play' ? G.sub : G.demo, sp = s ? Math.hypot(s.vx, s.vy) : 0;
  for (const p of G.plank) {
    p.x += Math.sin(G.rt * 0.2 + p.ph) * 5 * dt; p.y += Math.cos(G.rt * 0.17 + p.ph) * 4 * dt; p.f = Math.max(0, p.f - dt * 0.7);
    if (s && sp > 55 && Math.abs(p.x - s.x) < 60 && Math.abs(p.y - s.y) < 60 && Math.hypot(p.x - s.x, p.y - s.y) < 55) p.f = 1;
    wrap(p);
  }
}

// ---------------------------------------------------------------- rendering: pilot view
function render() {
  if (G.view === 'sonar' && G.phase !== 'menu' && G.phase !== 'lobby') drawSonar(); else drawPilot();
}
function worldTf(g, k) { const z = G.cam.z; g.setTransform(k * z, 0, 0, k * z, k * (W / 2 - (G.cam.x + G.cam.sx) * z), k * (H / 2 - (G.cam.y + G.cam.sy) * z)); }
function drawPilot() {
  const playing = G.phase === 'play' || G.phase === 'result';
  const s = playing && G.sub ? G.sub : G.demo; if (!L || !s) return;
  const z = G.cam.z, pal = L.pal, dt = G.fdt || 1 / 60;
  if (playing && G.phase === 'play') {
    const sp = 0.25, tx = s.x + Math.cos(s.aim) * 50 + s.vx * sp, ty = s.y + Math.sin(s.aim) * 40 + s.vy * sp;
    G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 4); G.cam.y += (ty - G.cam.y) * Math.min(1, dt * 4);
  }
  G.cam.sx = (Math.random() - 0.5) * G.shake; G.cam.sy = (Math.random() - 0.5) * G.shake;
  const cx = G.cam.x + G.cam.sx, cy = G.cam.y + G.cam.sy, hw = W / 2 / z, hh = H / 2 / z;
  const vx0 = cx - hw, vy0 = cy - hh, vx1 = cx + hw, vy1 = cy + hh;
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, pal.water); bg.addColorStop(1, pal.water2); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  worldTf(ctx, DPR);
  // drifting marine snow (only visible where the lamp shines)
  ctx.fillStyle = '#cfe8f5';
  for (const p of G.snow) { ctx.globalAlpha = 0.55; ctx.fillRect(p.x, p.y, p.s * 1.4, p.s * 1.4); }
  ctx.globalAlpha = 1;
  // rock
  const S = CHC * C, M = CH_M;
  G.visChunks = (Math.floor(vy1 / S) - Math.floor(vy0 / S) + 1) * (Math.floor(vx1 / S) - Math.floor(vx0 / S) + 1);
  const vis = [];
  for (let cj = Math.floor(vy0 / S); cj <= Math.floor(vy1 / S); cj++) for (let ci = Math.floor(vx0 / S); ci <= Math.floor(vx1 / S); ci++) {
    if (ci < 0 || cj < 0 || ci * CHC >= L.GW || cj * CHC >= L.GH) continue;
    vis.push([ci, cj, Math.hypot((ci + 0.5) * S - s.x, (cj + 0.5) * S - s.y)]);
  }
  vis.sort((a, b) => a[2] - b[2]); chunkBudget = 4;
  for (const [ci, cj] of vis) { const im = getChunk(ci, cj); if (im) ctx.drawImage(im, ci * S - M, cj * S - M, S + 2 * M, S + 2 * M); }
  const inView = (x, y, r) => x > vx0 - r && x < vx1 + r && y > vy0 - r && y < vy1 + r;
  const tm = G.rt;
  drawGate(ctx, L.gate.x, L.gate.y, tm);
  if (playing) {
    for (const p of G.picks) if (!p.got && inView(p.x, p.y, 30)) drawPick(ctx, p, tm);
    for (const a of G.arts) if (!a.got && inView(a.x, a.y, 40)) drawArt(ctx, a, tm);
    for (const j of G.jel) { const [x, y] = jelPos(j, G.time); if (inView(x, y, 60)) drawJel(ctx, x, y, tm, j); }
    for (const p of G.preds) if (inView(p.x, p.y, 220)) drawPred(ctx, p, tm);
  }
  for (const p of G.parts) {
    if (p.k === 'bub') { ctx.globalAlpha = 0.5 * (1 - p.life / p.max); ctx.strokeStyle = '#d8f6ff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.stroke(); }
    else if (p.k === 'debris') { ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = s === G.sub && !G.sub.alive ? '#c98a00' : pal.rock2; ctx.fillRect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2); }
  }
  ctx.globalAlpha = 1;
  if (s.alive !== false || (G.ending && G.endT > 1.35)) drawSub(ctx, s, tm);
  // caustic shimmer + volumetric lamp beam
  if (!causticPat) causticPat = ctx.createPattern(CAUSTIC, 'repeat');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.085; ctx.translate((tm * 9) % 256, (tm * 5) % 256); ctx.fillStyle = causticPat; ctx.fillRect(vx0 - 512, vy0 - 512, vx1 - vx0 + 1024, vy1 - vy0 + 1024);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.06; ctx.scale(1.7, 1.7); ctx.translate(-(tm * 6) % 256, (tm * 3) % 256); ctx.fillStyle = causticPat; ctx.fillRect(vx0 / 1.7 - 512, vy0 / 1.7 - 512, (vx1 - vx0) / 1.7 + 1024, (vy1 - vy0) / 1.7 + 1024); ctx.restore();
  const lampOn = s.lamp && s.pw > 0.5 && s.alive !== false;
  const lx = s.x + Math.cos(s.aim) * 14, ly = s.y + Math.sin(s.aim) * 10;
  const beam = lampOn ? lampPoly(lx, ly, s.aim, 360, true) : null, amb = lampPoly(s.x, s.y, 0, lampOn ? 95 : 62, false);
  if (beam) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(lx, ly, 4, lx, ly, 360); gr.addColorStop(0, 'rgba(255,236,190,0.22)'); gr.addColorStop(0.5, 'rgba(255,226,170,0.07)'); gr.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = gr; ctx.fill(beam); ctx.restore();
  }
  // darkness with holes for the lamp and a few glowing things
  dctx.setTransform(1, 0, 0, 1, 0, 0); dctx.globalCompositeOperation = 'source-over'; dctx.globalAlpha = 1;
  dctx.clearRect(0, 0, dark.width, dark.height); dctx.fillStyle = 'rgba(0,3,8,0.985)'; dctx.fillRect(0, 0, dark.width, dark.height);
  dctx.globalCompositeOperation = 'destination-out'; worldTf(dctx, DK);
  { const gr = dctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, lampOn ? 95 : 62); gr.addColorStop(0, 'rgba(0,0,0,0.88)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = gr; dctx.fill(amb); }
  if (beam) { const gr = dctx.createRadialGradient(lx, ly, 0, lx, ly, 360); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.82)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = gr; dctx.fill(beam); }
  const hole = (x, y, r, a) => { const gr = dctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = gr; dctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const visCheck = (o, x, y, range) => { if (frameNo % 6 === 0 || o.losT === undefined) o.losT = Math.hypot(x - s.x, y - s.y) < range && los(s.x, s.y, x, y) ? 1 : 0; o.vis += ((o.losT ? 1 : 0) - o.vis) * 0.15; return o.vis; };
  const gv = visCheck(L.gateVis || (L.gateVis = { vis: 0 }), L.gate.x, L.gate.y, 700);
  if (gv > 0.02 || !playing) hole(L.gate.x, L.gate.y, 170, 0.55 * (playing ? gv : 1));
  if (playing) {
    for (const a of G.arts) if (!a.got && inView(a.x, a.y, 80)) { const v = visCheck(a, a.x, a.y, 460); if (v > 0.02) hole(a.x, a.y, 80, 0.45 * v); }
    for (const j of G.jel) { const [x, y] = jelPos(j, G.time); if (inView(x, y, 60)) { const v = visCheck(j, x, y, 420); if (v > 0.02) hole(x, y, 55, 0.25 * v); } }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(dark, 0, 0, cv.width, cv.height);
  // glow layer (bioluminescence, markers, sonar echoes)
  worldTf(ctx, DPR); ctx.globalCompositeOperation = 'lighter';
  const S2 = CHC * C;
  for (let cj = Math.floor(vy0 / S2); cj <= Math.floor(vy1 / S2); cj++) for (let ci = Math.floor(vx0 / S2); ci <= Math.floor(vx1 / S2); ci++) {
    if (ci < 0 || cj < 0 || ci >= L.CW) continue; const arr = L.glow.get(cj * L.CW + ci); if (!arr) continue;
    for (const gl of arr) spr(ctx, gl.c, gl.x, gl.y, gl.s, 0.22 + 0.2 * Math.sin(tm * gl.f + gl.ph));
  }
  for (const p of G.plank) spr(ctx, p.c, p.x, p.y, 5 + p.f * 9, 0.09 + p.f * 0.8);
  spr(ctx, '#ffd36e', L.gate.x, L.gate.y, 120, (playing ? gv : 1) * (0.45 + 0.15 * Math.sin(tm * 2)));
  if (playing) {
    for (const a of G.arts) if (!a.got && a.vis > 0.02) spr(ctx, '#c56bff', a.x, a.y + Math.sin(tm * 1.6 + a.ph) * 4, 46, a.vis * (0.6 + 0.25 * Math.sin(tm * 3 + a.ph)));
    for (const p of G.picks) if (!p.got && inView(p.x, p.y, 30)) { const v = visCheck(p, p.x, p.y, 300); spr(ctx, p.k === 'o2' ? '#5dffa0' : '#ffd23e', p.x, p.y, 26, v * 0.45); }
    for (const j of G.jel) { if (j.vis > 0.02) { const [x, y] = jelPos(j, G.time); spr(ctx, j.hue, x, y, 34, j.vis * (0.45 + 0.2 * Math.sin(tm * 2.4 + j.ph))); } }
    for (const p of G.preds) if (inView(p.x, p.y, 200)) {
      const v = visCheck(p, p.x, p.y, 520); if (v < 0.02) continue;
      const col = p.k === 'levi' ? '#ff7a3d' : '#4df3ff';
      for (let k = 2; k < p.body.length; k += 3) spr(ctx, col, p.body[k][0], p.body[k][1], p.k === 'levi' ? 9 : 5, v * (0.5 + 0.3 * Math.sin(tm * 4 + k)));
      if (p.st === 'hunt') spr(ctx, '#ff3d5e', p.x, p.y, p.r * 2.2, v * 0.25);
    }
  }
  for (const p of G.parts) {
    if (p.k === 'spark') { const a = 1 - p.life / p.max; ctx.globalAlpha = a; ctx.strokeStyle = p.c || '#ffd27a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke(); }
    else if (p.k === 'glow') spr(ctx, p.c || '#c56bff', p.x, p.y, 8 * p.s, 1 - p.life / p.max);
  }
  if (s.alive !== false) { spr(ctx, '#ff3040', s.x - s.face * 18, s.y - 8, 6, 0.5 + 0.5 * Math.sin(tm * 6)); if (lampOn) spr(ctx, '#fff2c6', lx, ly, 18, 0.7); }
  // pressure rings from pings (co-op pilot hears them)
  for (const p of G.press) { const el = G.rt - p.t0, r = el * RING_V * 0.6; ctx.globalAlpha = Math.max(0, 0.22 * (1 - el / 1.4)); ctx.strokeStyle = '#bff'; ctx.lineWidth = 2 / z; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke(); }
  if (playing && canPing()) { drawEchoes(ctx, z, false); drawContactsWorld(ctx, z); }
  if (playing && G.markers.length) drawMarkersWorld(ctx, z, tm);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // screen-space overlays
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.drawImage(vign, 0, 0, W, H);
  if (playing && G.markers.length) drawMarkerArrows(ctx, s);
  if (playing && G.sub && G.sub.o2 < 18 && G.sub.alive) { ctx.globalAlpha = 0.18 + 0.12 * Math.sin(tm * 5); ctx.drawImage(vign, -W * 0.1, -H * 0.1, W * 1.2, H * 1.2); ctx.globalAlpha = 1; }
  if (G.flash > 0) { ctx.fillStyle = `rgba(${G.flashC},${G.flash * 0.5})`; ctx.fillRect(0, 0, W, H); }
}
function lampPoly(x, y, aim, range, cone) {
  const p = new Path2D(), half = 0.52;
  if (cone) {
    const n = 64, span = half + 0.3;
    p.moveTo(x, y);
    for (let k = 0; k <= n; k++) {
      const a = aim - span + (k / n) * span * 2, dA = Math.abs(angDiff(a, aim)), reach = range * smooth(half + 0.3, half - 0.08, dA);
      if (reach < 2) { p.lineTo(x, y); continue; }
      const hit = rayHit(x, y, Math.cos(a), Math.sin(a), reach, 8), r = hit < 0 ? reach : Math.min(reach, hit + 16);
      p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    p.closePath(); return p;
  }
  const n = 48;
  for (let k = 0; k <= n; k++) {
    const a = k / n * TAU, hit = rayHit(x, y, Math.cos(a), Math.sin(a), range, 7), r = hit < 0 ? range : Math.min(range, hit + 14);
    if (k === 0) p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  p.closePath(); return p;
}
function drawSub(g, s, tm) {
  g.save(); g.translate(s.x, s.y);
  const tilt = clamp((s.vy || 0) / 500, -0.25, 0.25) * s.face; g.rotate(tilt); g.scale(s.face, 1);
  if (s.inv > 0 && Math.floor(tm * 16) % 2) g.globalAlpha = 0.55;
  // propeller
  const pw = Math.abs(Math.cos(s.prop * 3)) * 9 + 1;
  g.fillStyle = '#6b4c00'; g.fillRect(-26, -1.5, 6, 3);
  g.fillStyle = '#d9d9d9'; g.beginPath(); g.ellipse(-27, 0, 2.2, pw, 0, 0, TAU); g.fill();
  // fins
  g.fillStyle = '#d68f00'; g.beginPath(); g.moveTo(-18, -4); g.lineTo(-25, -11); g.lineTo(-21, -3); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-18, 4); g.lineTo(-25, 11); g.lineTo(-21, 3); g.closePath(); g.fill();
  // hull
  const hg = g.createLinearGradient(0, -11, 0, 11); hg.addColorStop(0, '#ffd45e'); hg.addColorStop(0.5, '#ffb703'); hg.addColorStop(1, '#a86e00');
  g.fillStyle = hg; g.beginPath(); g.ellipse(0, 0, 21, 11, 0, 0, TAU); g.fill();
  // sail + periscope
  g.fillStyle = '#e59d00'; g.beginPath(); g.moveTo(-8, -9); g.lineTo(-5, -17); g.lineTo(5, -17); g.lineTo(7, -9); g.closePath(); g.fill();
  g.strokeStyle = '#7a5200'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(1, -17); g.lineTo(1, -22); g.lineTo(5, -22); g.stroke();
  // portholes
  g.fillStyle = '#103042'; g.beginPath(); g.arc(8, -1, 5, 0, TAU); g.fill();
  const pg = g.createRadialGradient(6.5, -2.5, 0.5, 8, -1, 4.5); pg.addColorStop(0, '#e6fbff'); pg.addColorStop(1, '#3fb6d8'); g.fillStyle = pg; g.beginPath(); g.arc(8, -1, 3.8, 0, TAU); g.fill();
  g.fillStyle = '#103042'; g.beginPath(); g.arc(-5, 0, 2.6, 0, TAU); g.fill(); g.fillStyle = '#7fd8f0'; g.beginPath(); g.arc(-5, 0, 1.7, 0, TAU); g.fill();
  // lamp housing
  g.fillStyle = '#3b2a00'; g.fillRect(17, 2, 6, 5); g.fillStyle = s.lamp && s.pw > 0.5 ? '#fff6d0' : '#555'; g.fillRect(21.5, 3, 2, 3);
  // rivets
  g.fillStyle = 'rgba(90,50,0,.55)'; for (let k = -14; k <= 14; k += 7) { g.beginPath(); g.arc(k, 6.5, 0.9, 0, TAU); g.fill(); }
  g.restore();
}
function drawPred(g, p, tm) {
  const B = p.body, n = B.length, levi = p.k === 'levi', R = p.r;
  const moving = Math.min(1, Math.hypot(p.vx, p.vy) / 50), amp = levi ? 7 : 4.5, P = new Array(n);
  for (let k = 0; k < n; k++) {
    const a = B[Math.max(0, k - 1)], b = B[Math.min(n - 1, k + 1)];
    let dx = a[0] - b[0], dy = a[1] - b[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const off = Math.sin(tm * (levi ? 3.2 : 6.5) - k * 0.55 + p.ph) * amp * (0.3 + 0.7 * moving) * (k / n);
    P[k] = [B[k][0] - dy * off, B[k][1] + dx * off];
  }
  g.lineCap = 'round'; g.lineJoin = 'round';
  // tail fin
  const tl = P[n - 1], tp = P[n - 2]; const ta = Math.atan2(tl[1] - tp[1], tl[0] - tp[0]);
  g.fillStyle = levi ? '#2f2431' : '#7b8796'; g.beginPath(); g.moveTo(tl[0], tl[1]); g.lineTo(tl[0] + Math.cos(ta + 0.6) * R * 1.1, tl[1] + Math.sin(ta + 0.6) * R * 1.1); g.lineTo(tl[0] + Math.cos(ta - 0.6) * R * 1.1, tl[1] + Math.sin(ta - 0.6) * R * 1.1); g.closePath(); g.fill();
  const width = (k) => Math.max(1.4, R * (levi ? 1.75 : 1.05) * Math.pow(1 - k / (n - 1), levi ? 0.55 : 0.75));
  if (!levi) {   // ribbon fin along the back
    g.strokeStyle = 'rgba(175,195,215,0.45)'; g.lineWidth = 2.2; g.beginPath();
    for (let k = 1; k < n - 1; k++) { const a = Math.atan2(P[k - 1][1] - P[k + 1][1], P[k - 1][0] - P[k + 1][0]) - Math.PI / 2, o = width(k) * 0.5 + 2.5 + Math.sin(tm * 9 + k) * 1.2; const fx = P[k][0] + Math.cos(a) * o, fy = P[k][1] + Math.sin(a) * o; if (k === 1) g.moveTo(fx, fy); else g.lineTo(fx, fy); }
    g.stroke();
  }
  for (let k = n - 1; k > 0; k--) { g.strokeStyle = levi ? '#3a2d3c' : '#8e9aaa'; g.lineWidth = width(k); g.beginPath(); g.moveTo(P[k][0], P[k][1]); g.lineTo(P[k - 1][0], P[k - 1][1]); g.stroke(); }
  for (let k = n - 1; k > 0; k--) { g.strokeStyle = levi ? '#5d4654' : '#c3ccd6'; g.lineWidth = width(k) * 0.42; g.beginPath(); g.moveTo(P[k][0], P[k][1] + width(k) * 0.18); g.lineTo(P[k - 1][0], P[k - 1][1] + width(k - 1) * 0.18); g.stroke(); }
  if (levi) { g.fillStyle = '#21181f'; for (let k = 2; k < n - 3; k += 2) { const a = Math.atan2(P[k - 1][1] - P[k][1], P[k - 1][0] - P[k][0]) - Math.PI / 2, w = width(k) * 0.5; g.beginPath(); g.moveTo(P[k][0] + Math.cos(a) * w, P[k][1] + Math.sin(a) * w); g.lineTo(P[k][0] + Math.cos(a) * (w + 9), P[k][1] + Math.sin(a) * (w + 9)); g.lineTo(P[k + 1][0] + Math.cos(a) * w, P[k + 1][1] + Math.sin(a) * w); g.closePath(); g.fill(); } }
  const ha = Math.atan2(P[0][1] - P[1][1], P[0][0] - P[1][0]);
  g.save(); g.translate(P[0][0], P[0][1]); g.rotate(ha); if (Math.cos(ha) < 0) g.scale(1, -1);
  const open = p.st === 'hunt' ? 0.4 + 0.3 * Math.sin(tm * 11) : 0.1;
  g.fillStyle = levi ? '#463644' : '#a3afbd'; g.beginPath(); g.ellipse(R * 0.35, 0, R * 1.15, R * (levi ? 0.78 : 0.62), 0, 0, TAU); g.fill();
  g.fillStyle = '#14060b'; g.beginPath(); g.moveTo(R * 0.1, R * 0.05); g.lineTo(R * 1.55, -R * open - 1); g.lineTo(R * 1.55, R * open + 2); g.closePath(); g.fill();
  g.fillStyle = '#f1ede2';
  for (let k = 0; k < (levi ? 7 : 4); k++) { const tx = R * 0.45 + k * R * (levi ? 0.15 : 0.24), yy = (tx - R * 0.1) / (R * 1.45); g.beginPath(); g.moveTo(tx, -R * open * yy - 0.5); g.lineTo(tx + 1.6, -R * open * yy + 3.5); g.lineTo(tx + 3, -R * open * yy - 0.5); g.closePath(); g.fill(); g.beginPath(); g.moveTo(tx, R * open * yy + 1.5); g.lineTo(tx + 1.6, R * open * yy - 2.5); g.lineTo(tx + 3, R * open * yy + 1.5); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(225,232,236,.9)'; g.beginPath(); g.arc(R * 0.35, -R * 0.45, R * 0.17, 0, TAU); g.fill();
  g.restore();
}
function drawJel(g, x, y, tm, j) {
  const pulse = 1 + Math.sin(tm * 2.4 + j.ph) * 0.12, r = 13 * pulse;
  g.save(); g.translate(x, y);
  g.strokeStyle = hexA(j.hue, 0.5); g.lineWidth = 1.3;
  for (let k = 0; k < 5; k++) { const bx = -9 + k * 4.5; g.beginPath(); g.moveTo(bx, 2); for (let s = 1; s <= 6; s++) g.lineTo(bx + Math.sin(tm * 2 + k + s * 0.8) * 3, 2 + s * 6); g.stroke(); }
  g.fillStyle = hexA(j.hue, 0.32); g.strokeStyle = hexA(j.hue, 0.85); g.lineWidth = 1.2;
  g.beginPath(); g.arc(0, 2, r, Math.PI, 0); for (let k = 0; k <= 6; k++) g.lineTo(r - k * r / 3, 2 + (k % 2 ? 3 : 0)); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,240,255,.5)'; g.beginPath(); g.arc(0, -3, r * 0.35, 0, TAU); g.fill();
  g.restore();
}
function drawArt(g, a, tm) {
  g.save(); g.translate(a.x, a.y + Math.sin(tm * 1.6 + a.ph) * 4);
  g.save(); g.rotate(tm * 0.7 + a.ph);
  g.fillStyle = '#2a1150'; g.beginPath(); g.moveTo(0, -17); g.lineTo(11, 0); g.lineTo(0, 17); g.lineTo(-11, 0); g.closePath(); g.fill();
  g.fillStyle = '#9b4dff'; g.beginPath(); g.moveTo(0, -17); g.lineTo(11, 0); g.lineTo(0, 3); g.closePath(); g.fill();
  g.fillStyle = '#e6a6ff'; g.beginPath(); g.moveTo(0, -17); g.lineTo(-11, 0); g.lineTo(0, 3); g.closePath(); g.fill();
  g.strokeStyle = '#f6dcff'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -17); g.lineTo(11, 0); g.lineTo(0, 17); g.lineTo(-11, 0); g.closePath(); g.stroke();
  g.restore();
  g.rotate(-tm * 1.3); g.strokeStyle = 'rgba(255,150,245,.75)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, 21, 6, 0, 0, TAU); g.stroke();
  g.fillStyle = '#ffd6fb'; g.fillRect(19, -1.5, 3, 3); g.fillRect(-22, -1.5, 3, 3);
  g.restore();
}
function drawPick(g, p, tm) {
  g.save(); g.translate(p.x, p.y + Math.sin(tm * 2 + p.x) * 2);
  if (p.k === 'o2') {
    g.fillStyle = '#1f9e5a'; g.beginPath(); g.roundRect ? g.roundRect(-6, -11, 12, 22, 5) : g.rect(-6, -11, 12, 22); g.fill();
    g.fillStyle = '#6dffad'; g.fillRect(-6, -3, 12, 4); g.fillStyle = '#c9d4d8'; g.fillRect(-3, -15, 6, 4);
    g.fillStyle = '#063'; g.font = 'bold 7px sans-serif'; g.textAlign = 'center'; g.fillText('O2', 0, 9);
  } else {
    g.fillStyle = '#c99a00'; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.lineTo(Math.cos(a) * 11, Math.sin(a) * 11); } g.closePath(); g.fill();
    g.fillStyle = '#ffe066'; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); } g.closePath(); g.fill();
    g.fillStyle = '#4a3200'; g.beginPath(); g.moveTo(1, -7); g.lineTo(-4, 1); g.lineTo(0, 1); g.lineTo(-1, 7); g.lineTo(4, -1); g.lineTo(0, -1); g.closePath(); g.fill();
  }
  g.restore();
}
function drawGate(g, x, y, tm) {
  g.save(); g.translate(x, y);
  const gr = g.createRadialGradient(0, 0, 3, 0, 0, 46); gr.addColorStop(0, '#fff6d0'); gr.addColorStop(0.25, '#ffb703'); gr.addColorStop(0.62, '#5a22c8'); gr.addColorStop(1, 'rgba(20,0,40,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,236,170,.45)'; g.lineWidth = 2;
  for (let k = 0; k < 3; k++) { g.beginPath(); for (let s = 0; s < 30; s++) { const a = tm * 1.2 + k * TAU / 3 + s * 0.2, r = 4 + s * 1.3; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); }
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * TAU + tm * 0.06; g.save(); g.rotate(a);
    g.fillStyle = L.pal.rock2; g.beginPath(); g.moveTo(48, -11); g.lineTo(64, -14); g.lineTo(64, 14); g.lineTo(48, 11); g.closePath(); g.fill();
    g.fillStyle = k % 3 ? '#ffd36e' : '#4df3ff'; g.globalAlpha = 0.6 + 0.4 * Math.sin(tm * 2 + k); g.fillRect(53, -3, 6, 2); g.fillRect(55, 1, 2, 5); g.globalAlpha = 1;
    g.restore();
  }
  g.restore();
}
function drawMarkersWorld(g, z, tm) {
  for (const m of G.markers) {
    const col = (MKS.find(q => q[0] === m.k) || MKS[0])[3];
    if (m.x2 != null) {   // arrow
      const dx = m.x2 - m.x, dy = m.y2 - m.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      g.globalAlpha = 0.85; g.strokeStyle = col; g.lineWidth = 4 / z; g.setLineDash([14 / z, 10 / z]); g.lineDashOffset = -tm * 40 / z;
      g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(m.x2 - ux * 14, m.y2 - uy * 14); g.stroke(); g.setLineDash([]);
      g.fillStyle = col; g.beginPath(); g.moveTo(m.x2, m.y2); g.lineTo(m.x2 - ux * 22 - uy * 12, m.y2 - uy * 22 + ux * 12); g.lineTo(m.x2 - ux * 22 + uy * 12, m.y2 - uy * 22 - ux * 12); g.closePath(); g.fill();
      spr(g, col, m.x2, m.y2, 30, 0.5);
      continue;
    }
    const pul = 0.5 + 0.5 * Math.sin(tm * 4 + m.id);
    spr(g, col, m.x, m.y, 40, 0.5 + pul * 0.3);
    g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 2.5 / z;
    g.beginPath(); g.arc(m.x, m.y, 14 + pul * 8, 0, TAU); g.stroke();
    g.fillStyle = col; g.font = `900 ${22 / Math.max(0.7, z)}px Segoe UI, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((MKS.find(q => q[0] === m.k) || MKS[0])[1], m.x, m.y + 1);
  }
  g.globalAlpha = 1;
}
function drawMarkerArrows(g, s) {
  const z = G.cam.z, cx = W / 2, cy = H / 2, pad = 46;
  for (const m of G.markers) {
    const mx = m.x2 != null ? m.x2 : m.x, my = m.y2 != null ? m.y2 : m.y;
    const sx = (mx - G.cam.x) * z + cx, sy = (my - G.cam.y) * z + cy;
    if (sx > pad && sx < W - pad && sy > pad + 40 && sy < H - pad) continue;
    const a = Math.atan2(sy - cy, sx - cx), kx = Math.abs(Math.cos(a)) > 1e-3 ? (W / 2 - pad) / Math.abs(Math.cos(a)) : 1e9, ky = Math.abs(Math.sin(a)) > 1e-3 ? (H / 2 - pad) / Math.abs(Math.sin(a)) : 1e9, r = Math.min(kx, ky);
    const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r, col = (MKS.find(q => q[0] === m.k) || MKS[0])[3];
    g.save(); g.translate(ex, ey); g.rotate(a); g.globalAlpha = 0.6 + 0.4 * Math.sin(G.rt * 5);
    g.fillStyle = col; g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -11); g.lineTo(-3, 0); g.lineTo(-8, 11); g.closePath(); g.fill(); g.restore();
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = '700 11px Segoe UI, Arial'; g.textAlign = 'center';
    g.fillText(Math.round(Math.hypot(mx - s.x, my - s.y) / 10) + 'm', ex - Math.cos(a) * 26, ey - Math.sin(a) * 26 + 4);
  }
}

// ---------------------------------------------------------------- rendering: sonar
const echoAlpha = (age, op) => age < 0 ? 0 : op ? (age < 0.25 ? 1 : age < 3 ? 1 - (age - 0.25) / 2.75 * 0.62 : Math.max(0, 0.38 * (1 - (age - 3) / 24))) : (age < 0.25 ? 1 : Math.max(0, 1 - (age - 0.25) / 5.5));
function drawEchoes(g, z, op) {
  const B = 6, col = op ? '#5ff5d0' : '#6ff7ff';
  g.lineCap = 'round'; g.strokeStyle = col;
  for (const pg of G.pings) {
    const el = G.rt - pg.t0, front = el * RING_V, n = pg.n, d = pg.d, tg = trig(n);
    const paths = []; for (let b = 0; b < B; b++) paths.push(new Path2D());
    const fresh = new Path2D(); let fr = false;
    const w = pg.w, wp = []; for (let b = 0; b < B; b++) wp.push(new Path2D());
    for (let k = 0; k < w.length; k += 5) {
      const dw = w[k + 4]; if (dw > front) continue;
      const al = echoAlpha(el - dw / RING_V, op) * (1 - 0.55 * dw / pg.range); if (al <= 0.02) continue;
      const b = Math.min(B - 1, Math.floor(al * B)); wp[b].moveTo(w[k], w[k + 1]); wp[b].lineTo(w[k + 2], w[k + 3]);
    }
    g.lineWidth = 1.3 / z;
    for (let b = 0; b < B; b++) { g.globalAlpha = (b + 0.5) / B * (op ? 0.5 : 0.38); g.stroke(wp[b]); }
    for (let k = 0; k < n; k++) {
      const d1 = d[k]; if (d1 < 0 || d1 > front) continue;
      const age = el - d1 / RING_V, al = echoAlpha(age, op); if (al <= 0.01) continue;
      const b = Math.min(B - 1, Math.floor(al * B)), x1 = pg.x + tg.c[k] * d1, y1 = pg.y + tg.s[k] * d1;
      const k2 = (k + 1) % n, d2 = d[k2];
      paths[b].moveTo(x1, y1);
      if (d2 >= 0 && d2 <= front && Math.abs(d2 - d1) < Math.max(26, d1 * 0.09)) paths[b].lineTo(pg.x + tg.c[k2] * d2, pg.y + tg.s[k2] * d2); else paths[b].lineTo(x1 + 0.1, y1);
      if (age < 0.3) { fresh.moveTo(x1, y1); fresh.lineTo(x1 + 0.1, y1); fr = true; }
    }
    g.lineWidth = (op ? 2.2 : 2) / z;
    for (let b = 0; b < B; b++) { g.globalAlpha = (b + 0.5) / B * (op ? 1 : 0.75); g.stroke(paths[b]); }
    if (fr) { g.globalAlpha = 1; g.lineWidth = 5 / z; g.strokeStyle = '#e8fff8'; g.stroke(fresh); g.strokeStyle = col; }
    if (front < pg.range + 40) {
      const a = Math.max(0, 1 - front / pg.range);
      g.globalAlpha = 0.65 * a; g.lineWidth = 2.5 / z; g.beginPath(); g.arc(pg.x, pg.y, Math.min(front, pg.range), 0, TAU); g.stroke();
      g.globalAlpha = 0.2 * a; g.lineWidth = 14 / z; g.beginPath(); g.arc(pg.x, pg.y, Math.max(0, Math.min(front, pg.range) - 7 / z), 0, TAU); g.stroke();
    }
  }
  g.globalAlpha = 1;
}
// contacts drawn in world coordinates (solo overlay)
function drawContactsWorld(g, z) {
  const C2 = G.cont, tm = G.rt, sz = 1 / z;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  G.arts.forEach((a, i) => { if (a.got || !C2.arts[i]) return; const pul = 0.5 + 0.5 * Math.sin(tm * 3 + i); spr(g, '#d08cff', a.x, a.y, 30 * sz + pul * 10 * sz, 0.6); diamond(g, a.x, a.y, 8 * sz, '#f0c8ff'); });
  G.picks.forEach((p, i) => { if (p.got || !C2.picks[i]) return; spr(g, p.k === 'o2' ? '#5dffa0' : '#ffd23e', p.x, p.y, 22 * sz, 0.6); });
  if (C2.gate) { g.globalAlpha = 0.7; g.strokeStyle = '#ffd36e'; g.lineWidth = 2.5 * sz; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(L.gate.x, L.gate.y, (26 + k * 14 + Math.sin(tm * 2) * 4) * sz * 1.3, 0, TAU); g.stroke(); } }
  for (const p of C2.preds) { const a = 1 - (tm - p.t) / 5; if (a <= 0) continue; spr(g, '#ff3d5e', p.x, p.y, (p.levi ? 50 : 30) * sz, a * 0.8); }
  for (const p of C2.jel) { const a = 1 - (tm - p.t) / 6; if (a > 0) spr(g, '#ff8af0', p.x, p.y, 16 * sz, a * 0.6); }
  g.globalAlpha = 1;
}
function diamond(g, x, y, r, col) { g.globalAlpha = 0.95; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.7, y); g.lineTo(x, y + r); g.lineTo(x - r * 0.7, y); g.closePath(); g.fill(); }
function sonarView() {
  const top = 50, bot = G.opBarH + 8, avail = Math.max(120, H - top - bot);
  const zs = Math.min(W, avail) / 2 / 760 * G.oz;
  return { zs, cx: W / 2, cy: top + avail / 2 };
}
function drawSonar() {
  const g = ctx, D = G.D, tm = G.rt; if (!D || !L) return;
  const { zs, cx, cy } = sonarView();
  G.cam.sx = (Math.random() - 0.5) * G.shake; G.cam.sy = (Math.random() - 0.5) * G.shake;
  const ox = cx + G.cam.sx, oy = cy + G.cam.sy;
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const bg = g.createRadialGradient(ox, oy, 10, ox, oy, Math.max(W, H) * 0.7); bg.addColorStop(0, '#031410'); bg.addColorStop(1, '#000302'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // polar grid around the sub
  g.strokeStyle = 'rgba(80,255,190,0.08)'; g.lineWidth = 1;
  for (let r = 150; r <= 1800; r += 150) { g.beginPath(); g.arc(ox, oy, r * zs, 0, TAU); g.stroke(); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * 2000, oy + Math.sin(a) * 2000); g.stroke(); }
  // idle sweep
  const sw = tm * 0.9; const sg = g.createConicGradient ? g.createConicGradient(sw, ox, oy) : null;
  if (sg) { sg.addColorStop(0, 'rgba(95,245,208,0.10)'); sg.addColorStop(0.08, 'rgba(95,245,208,0)'); sg.addColorStop(1, 'rgba(95,245,208,0)'); g.fillStyle = sg; g.beginPath(); g.arc(ox, oy, PINGS[2].range * zs, 0, TAU); g.fill(); }
  // selected ping range
  g.setLineDash([6, 8]); g.strokeStyle = 'rgba(95,245,208,0.35)'; g.beginPath(); g.arc(ox, oy, PINGS[G.pingStr].range * zs, 0, TAU); g.stroke(); g.setLineDash([]);
  // world layer
  g.setTransform(DPR * zs, 0, 0, DPR * zs, DPR * (ox - D.x * zs), DPR * (oy - D.y * zs));
  g.globalCompositeOperation = 'lighter';
  drawEchoes(g, zs, true);
  // the sub's noise: how far it carries
  if (D.n > 4) { g.globalAlpha = 0.25 + 0.15 * Math.sin(tm * 8); g.strokeStyle = '#ff5d73'; g.lineWidth = 2 / zs; g.setLineDash([5 / zs, 6 / zs]); g.beginPath(); g.arc(D.x, D.y, D.n, 0, TAU); g.stroke(); g.setLineDash([]); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // screen-space contacts
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const toS = (x, y) => [ox + (x - D.x) * zs, oy + (y - D.y) * zs];
  g.fillStyle = 'rgba(255,183,3,0.35)';
  for (let i = 0; i < G.trail.length; i++) { const [x, y] = toS(G.trail[i][0], G.trail[i][1]); g.globalAlpha = 0.15 + 0.5 * i / G.trail.length; g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); }
  g.globalAlpha = 1;
  const C2 = G.cont; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalCompositeOperation = 'lighter';
  G.picks.forEach((p, i) => { if (p.got || !C2.picks[i]) return; const [x, y] = toS(p.x, p.y), col = p.k === 'o2' ? '#5dffa0' : '#ffd23e'; spr(g, col, x, y, 16, 0.7); g.globalAlpha = 1; g.fillStyle = col; g.font = '800 11px Segoe UI, Arial'; g.fillText(p.k === 'o2' ? 'O₂' : '⚡', x, y - 14); g.fillRect(x - 2.5, y - 2.5, 5, 5); });
  G.arts.forEach((a, i) => { if (a.got || !C2.arts[i]) return; const [x, y] = toS(a.x, a.y), pul = 0.5 + 0.5 * Math.sin(tm * 3 + i); spr(g, '#d08cff', x, y, 22 + pul * 10, 0.85); diamond(g, x, y, 8, '#f6dcff'); });
  if (C2.gate) { const [x, y] = toS(L.gate.x, L.gate.y); spr(g, '#ffd36e', x, y, 34, 0.7); g.globalAlpha = 0.9; g.strokeStyle = '#ffd36e'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y, 8 + k * 7 + Math.sin(tm * 2 + k) * 1.5, 0, TAU); g.stroke(); } g.fillStyle = '#ffd36e'; g.font = '800 12px Segoe UI, Arial'; g.fillText(t('ed_gate'), x, y - 36); }
  for (const p of C2.jel) { const a = 1 - (tm - p.t) / 6; if (a <= 0) continue; const [x, y] = toS(p.x, p.y); spr(g, '#ff8af0', x, y, 9, a * 0.7); }
  for (const p of C2.preds) {
    const a = 1 - (tm - p.t) / 5; if (a <= 0) continue; const [x, y] = toS(p.x, p.y), r = (p.levi ? 30 : 13) * Math.max(0.6, zs * 2);
    spr(g, '#ff3d5e', x, y, r * 1.6, a * 0.9); g.globalAlpha = a; g.fillStyle = '#ff7085'; g.beginPath(); g.arc(x, y, p.levi ? 6 : 3.5, 0, TAU); g.fill();
    if (p.hunt) { g.fillStyle = '#ffd0d6'; g.font = '900 14px Segoe UI, Arial'; g.fillText('!', x, y - r - 2); }
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // markers (world coords → screen)
  for (const m of G.markers) {
    const col = (MKS.find(q => q[0] === m.k) || MKS[0])[3], [x, y] = toS(m.x, m.y);
    if (m.x2 != null) { const [x2, y2] = toS(m.x2, m.y2); arrow2d(g, x, y, x2, y2, col); continue; }
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 11 + Math.sin(tm * 4 + m.id) * 2, 0, TAU); g.stroke();
    g.fillStyle = col; g.font = '900 15px Segoe UI, Arial'; g.fillText((MKS.find(q => q[0] === m.k) || MKS[0])[1], x, y + 1);
  }
  if (OPP.down && OPP.down.drag) { const a = OPP.down; arrow2d(g, a.x, a.y, a.cx, a.cy, MKS[G.mkType][3], 0.6); }
  // passive sonar: something big is hunting nearby
  const ring = Math.min(W, H - G.opBarH - 50) * 0.46;
  for (const p of G.preds) {
    if (p.st !== 'hunt') continue; const d = Math.hypot(p.x - D.x, p.y - D.y); if (d > 560) continue;
    const a = Math.atan2(p.y - D.y, p.x - D.x), al = (1 - d / 560) * (0.55 + 0.45 * Math.sin(tm * 7));
    g.globalAlpha = al; g.strokeStyle = '#ff3d5e'; g.lineWidth = 6; g.beginPath(); g.arc(ox, oy, ring, a - 0.22, a + 0.22); g.stroke();
  }
  g.globalAlpha = 1;
  // the sub (transponder)
  const sa = Math.hypot(D.vx, D.vy) > 10 ? Math.atan2(D.vy, D.vx) : (D.a || 0);
  g.save(); g.translate(ox, oy);
  g.globalCompositeOperation = 'lighter'; spr(g, '#ffb703', 0, 0, 22, 0.6); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (D.lamp) { g.rotate(D.a || 0); g.fillStyle = 'rgba(255,230,160,0.10)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 360 * zs, -0.5, 0.5); g.closePath(); g.fill(); g.rotate(-(D.a || 0)); }
  g.rotate(sa); g.fillStyle = '#ffb703'; g.strokeStyle = '#1a1200'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(12, 0); g.lineTo(-8, -7); g.lineTo(-4, 0); g.lineTo(-8, 7); g.closePath(); g.fill(); g.stroke();
  g.restore();
  // scanlines + vignette + damage flash
  if (!G.scanPat) G.scanPat = g.createPattern(scan, 'repeat');
  g.fillStyle = G.scanPat; g.fillRect(0, 0, W, H);
  g.drawImage(vign, 0, 0, W, H);
  if (G.flash > 0) { g.fillStyle = `rgba(${G.flashC},${G.flash * 0.4})`; g.fillRect(0, 0, W, H); }
  if (G.phase === 'play' && performance.now() - G.stRecv > 2500 && ON.partner) { g.fillStyle = 'rgba(255,183,3,.8)'; g.font = '700 13px Segoe UI, Arial'; g.textAlign = 'center'; g.fillText(t('ed_waitHost'), W / 2, 70); }
}
function arrow2d(g, x1, y1, x2, y2, col, alpha) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  g.globalAlpha = alpha || 0.9; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - ux * 10, y2 - uy * 10); g.stroke();
  g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - ux * 14 - uy * 8, y2 - uy * 14 + ux * 8); g.lineTo(x2 - ux * 14 + uy * 8, y2 - uy * 14 - ux * 8); g.closePath(); g.fill();
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- input
const JOY = { id: null, bx: 0, by: 0, x: 0, y: 0, active: false };
const TB = { boost: false, aim: null };
const OPP = { pts: new Map(), down: null, pinch: null };
function markTouch(on) { if (document.body.classList.contains('touch') !== on) { document.body.classList.toggle('touch', on); uiMode(); } }
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('pointerdown', (e) => {
  auInit(); markTouch(e.pointerType !== 'mouse');
  if (G.phase !== 'play' || G.paused) return;
  if (G.view === 'pilot') {
    if (e.pointerType === 'mouse') return;
    if (e.clientX < W * 0.55 && JOY.id == null) {
      JOY.id = e.pointerId; JOY.bx = e.clientX; JOY.by = e.clientY; JOY.x = JOY.y = 0; JOY.active = true;
      const j = $('joy'); j.hidden = false; j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; j.firstElementChild.style.transform = '';
    } else if (TB.aim == null) TB.aim = { id: e.pointerId, a: Math.atan2(e.clientY - H / 2, e.clientX - W / 2) };
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    return;
  }
  // sonar operator: tap = marker, drag = arrow, two fingers = zoom
  OPP.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  if (OPP.pts.size === 2) { const [a, b] = [...OPP.pts.values()]; OPP.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: G.oz }; OPP.down = null; return; }
  if (e.button === 2) { removeMarkerAt(e.clientX, e.clientY, true); return; }
  OPP.down = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY, drag: false };
});
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') G.mouse = { x: e.clientX, y: e.clientY, t: performance.now() };
  if (G.view === 'pilot') {
    if (e.pointerId === JOY.id) {
      let dx = e.clientX - JOY.bx, dy = e.clientY - JOY.by; const d = Math.hypot(dx, dy), max = 56;
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      JOY.x = dx / max; JOY.y = dy / max; if (Math.hypot(JOY.x, JOY.y) < 0.15) { JOY.x = 0; JOY.y = 0; }
      $('joy').firstElementChild.style.transform = `translate(${dx}px,${dy}px)`;
    } else if (TB.aim && e.pointerId === TB.aim.id && G.sub) TB.aim.a = Math.atan2(e.clientY - ((G.sub.y - G.cam.y) * G.cam.z + H / 2), e.clientX - ((G.sub.x - G.cam.x) * G.cam.z + W / 2));
    return;
  }
  if (!OPP.pts.has(e.pointerId)) return;
  OPP.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (OPP.pinch && OPP.pts.size >= 2) { const [a, b] = [...OPP.pts.values()]; G.oz = clamp(OPP.pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / OPP.pinch.d, 0.4, 2.2); return; }
  const dn = OPP.down; if (!dn || dn.id !== e.pointerId) return;
  dn.cx = e.clientX; dn.cy = e.clientY; if (Math.hypot(dn.cx - dn.x, dn.cy - dn.y) > 16) dn.drag = true;
});
const endPtr = (e) => {
  if (e.pointerId === JOY.id) { JOY.id = null; JOY.active = false; JOY.x = JOY.y = 0; $('joy').hidden = true; }
  if (TB.aim && TB.aim.id === e.pointerId) TB.aim = null;
  if (!OPP.pts.has(e.pointerId)) return;
  OPP.pts.delete(e.pointerId); if (OPP.pts.size < 2) OPP.pinch = null;
  const dn = OPP.down; if (!dn || dn.id !== e.pointerId) return; OPP.down = null;
  if (e.type === 'pointercancel' || G.view !== 'sonar' || G.phase !== 'play') return;
  const w1 = screenToWorld(dn.x, dn.y);
  if (dn.drag) { const w2 = screenToWorld(dn.cx, dn.cy); if (Math.hypot(w2[0] - w1[0], w2[1] - w1[1]) > 30) addMarker({ k: MKS[G.mkType][0], x: w1[0], y: w1[1], x2: w2[0], y2: w2[1] }); }
  else if (!removeMarkerAt(dn.x, dn.y)) addMarker({ k: MKS[G.mkType][0], x: w1[0], y: w1[1] });
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', (e) => { if (G.view === 'sonar') { G.oz = clamp(G.oz * Math.exp(-e.deltaY * 0.0012), 0.4, 2.2); e.preventDefault(); } }, { passive: false });
function screenToWorld(x, y) { const { zs, cx, cy } = sonarView(); return [G.D.x + (x - cx) / zs, G.D.y + (y - cy) / zs]; }
function removeMarkerAt(x, y, any) {
  const { zs, cx, cy } = sonarView(); let best = -1, bd = any ? 60 : 22;
  G.markers.forEach((m, i) => { const sx = cx + ((m.x2 != null ? m.x2 : m.x) - G.D.x) * zs, sy = cy + ((m.y2 != null ? m.y2 : m.y) - G.D.y) * zs, d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = i; } });
  if (best < 0) return false;
  G.markers.splice(best, 1); sendMarkers(); SFX.click(); return true;
}
function addMarker(m) {
  m.id = G.mkId++; G.markers.push(m); if (G.markers.length > 8) G.markers.shift();
  sendMarkers(); SFX.mark();
}
function clearMarkers() { G.markers = []; sendMarkers(); SFX.click(); }
function sendMarkers() { netSend('mk', { list: G.markers.map(m => { const o = { id: m.id, k: m.k, x: Math.round(m.x), y: Math.round(m.y) }; if (m.x2 != null) { o.x2 = Math.round(m.x2); o.y2 = Math.round(m.y2); } return o; }) }); }

addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
  auInit(); markTouch(false);
  const k = e.code;
  if (k === 'Escape' || k === 'KeyP') {
    if (G.phase === 'play') { if (G.screen === 'lost') return; setPause(!G.paused, true); e.preventDefault(); }
    else if (['how', 'levels', 'online'].includes(G.screen)) showScreen('menu');
    return;
  }
  if (G.phase !== 'play' || G.paused) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(k)) e.preventDefault();
  if (e.repeat) { G.keys.add(k); return; }
  G.keys.add(k);
  if (G.view === 'pilot') {
    if (k === 'KeyL') toggleLamp();
    else if (k === 'Space') pilotPing();
    else if (/^Digit[1-7]$/.test(k)) { const d = +k.slice(5); if (canPing()) { if (d <= 3) setStr(d - 1); } else sendSig(d - 1); }
  } else {
    if (k === 'Space') opPing();
    else if (/^Digit[1-3]$/.test(k)) setStr(+k.slice(5) - 1);
    else if (k === 'ArrowLeft') sendSig(0); else if (k === 'ArrowRight') sendSig(1); else if (k === 'ArrowUp') sendSig(2); else if (k === 'ArrowDown') sendSig(3);
    else if (k === 'KeyS') sendSig(4); else if (k === 'KeyD') sendSig(5); else if (k === 'KeyF') sendSig(6);
    else if (k === 'KeyC') clearMarkers(); else if (k === 'KeyM') { G.mkType = (G.mkType + 1) % 3; buildOpBar(); }
    else if (k === 'Equal' || k === 'NumpadAdd') G.oz = clamp(G.oz * 1.2, 0.4, 2.2); else if (k === 'Minus' || k === 'NumpadSubtract') G.oz = clamp(G.oz / 1.2, 0.4, 2.2);
  }
});
addEventListener('keyup', (e) => G.keys.delete(e.code));
addEventListener('blur', () => { G.keys.clear(); TB.boost = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden && G.phase === 'play' && G.mode === 'solo' && !G.paused && !G.ending) setPause(true, true); });
function toggleLamp() { if (!G.sub) return; G.sub.lamp = !G.sub.lamp; SFX.click(); $('tLamp').classList.toggle('on', G.sub.lamp); }
function sendSig(i) {
  if (G.mode !== 'online') return;
  netSend('sig', { k: i }); SFX.sig(i);
  const b = document.querySelectorAll(G.view === 'sonar' ? '#opSig button' : '#piSig button')[i]; if (b) { b.style.borderColor = '#ffb703'; setTimeout(() => b.style.borderColor = '', 400); }
  if (G.view === 'pilot') $('piSig').classList.remove('open');
}
function showSig(i, from) {
  const S2 = SIGS[i]; if (!S2) return; const el = $('sigPop');
  el.hidden = false; el.className = S2[0] === 'danger' || S2[0] === 'stop' ? 'danger' : '';
  el.innerHTML = `<b>${S2[1]}</b><span>${esc(t('ed_s_' + S2[0]))}</span><small>${esc(from || '')}</small>`;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(showSig.tm); showSig.tm = setTimeout(() => el.hidden = true, 2400);
  SFX.sig(i);
}

// touch buttons
const holdBtn = (el, on, off) => { el.addEventListener('pointerdown', (e) => { e.preventDefault(); auInit(); markTouch(e.pointerType !== 'mouse'); on(); try { el.setPointerCapture(e.pointerId); } catch (er) {} }); for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, off); };
holdBtn($('tBoost'), () => { TB.boost = true; $('tBoost').classList.add('on'); }, () => { TB.boost = false; $('tBoost').classList.remove('on'); });
$('tLamp').addEventListener('click', () => toggleLamp());
$('tPing').addEventListener('click', () => pilotPing());
$('tStr').addEventListener('click', () => { setStr((G.pingStr + 1) % 3); SFX.click(); });
$('tSig').addEventListener('click', () => $('piSig').classList.toggle('open'));
$('opPing').addEventListener('click', () => opPing());
$('opZoom').addEventListener('click', (e) => { const b = e.target.closest('[data-z]'); if (b) G.oz = clamp(G.oz * (b.dataset.z > 0 ? 1.25 : 0.8), 0.4, 2.2); });
$('opStr').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) { setStr(+b.dataset.s); buildOpBar(); SFX.click(); } });
$('opMk').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b) return; if (b.dataset.m === 'clear') clearMarkers(); else { G.mkType = +b.dataset.m; buildOpBar(); SFX.click(); } });
const sigClick = (e) => { const b = e.target.closest('[data-sig]'); if (b) sendSig(+b.dataset.sig); };
$('opSig').addEventListener('click', sigClick); $('piSig').addEventListener('click', sigClick);
$('bPause').onclick = () => { if (G.phase === 'play' && G.screen !== 'lost') setPause(!G.paused, true); };
$('bMute').onclick = () => { SET.mute = !SET.mute; lsSet(SET_KEY, SET); auInit(); if (AU.out) AU.out.gain.value = SET.mute ? 0 : 0.85; $('bMute').textContent = SET.mute ? '🔇' : '🔊'; };
$('bLang').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');

// ---------------------------------------------------------------- HUD + UI chrome
function buildBars() {
  $('piSig').innerHTML = SIGS.map((s, i) => `<button data-sig="${i}" class="${s[0] === 'danger' ? 'danger' : ''}"><kbd>${s[2]}</kbd><b>${s[1]}</b><span>${esc(t('ed_s_' + s[0]))}</span></button>`).join('');
  $('opSig').innerHTML = SIGS.map((s, i) => `<button data-sig="${i}" class="${s[0] === 'danger' ? 'danger' : ''}"><kbd>${s[3]}</kbd><b>${s[1]}</b><span>${esc(t('ed_s_' + s[0]))}</span></button>`).join('');
  buildOpBar();
}
function buildOpBar() {
  $('opStr').innerHTML = STR_KEYS.map((k, i) => `<button data-s="${i}" class="${G.pingStr === i ? 'on' : ''}"><span class="lvb">${STR_BARS[i]}</span>${esc(t(k))}<small>${i + 1}</small></button>`).join('');
  $('opMk').innerHTML = MKS.map((m, i) => `<button data-m="${i}" class="${G.mkType === i ? 'on' : ''}" style="${G.mkType === i ? '' : 'color:' + m[3]}">${m[1]} ${esc(t(m[2]))}</button>`).join('') + `<button data-m="clear">🧹 ${esc(t('ed_mClear'))}<small>C</small></button>`;
}
function measureOp() { const el = $('opUI'); if (el && !el.hidden) G.opBarH = el.getBoundingClientRect().height || 120; }
function uiMode() {
  const play = G.phase === 'play';
  $('hud').hidden = !play; $('bPause').hidden = !play;
  $('piUI').hidden = !(play && G.view === 'pilot');
  $('opUI').hidden = !(play && G.view === 'sonar');
  document.body.classList.toggle('canping', canPing());
  document.body.classList.toggle('coop', G.mode === 'online');
  $('piSig').style.display = G.mode === 'online' && !canPing() ? '' : 'none';
  $('tSig').style.display = G.mode === 'online' && !canPing() && isTouch() ? '' : 'none';
  if (!play) { JOY.active = false; JOY.id = null; $('joy').hidden = true; TB.boost = false; TB.aim = null; }
  if (G.sub) $('tLamp').classList.toggle('on', !!G.sub.lamp);
  measureOp();
}
let hudLast = '';
function hudUpdate(force) {
  if (G.phase !== 'play' && !force) return;
  const op = G.view === 'sonar', s = op ? G.D : G.sub; if (!s || !L) return;
  const setBar = (id, v) => { const el = $(id); el.querySelector('i').style.width = clamp(v, 0, 100).toFixed(1) + '%'; el.classList.toggle('low', v < 22); };
  setBar('bHull', s.hull); setBar('bO2', s.o2); setBar('bPw', s.pw); setBar('bNoise', (op ? s.n : G.noise) / 3.72);
  $('bNoise').classList.remove('low');
  const depth = depthAt(s.y), info = `${t('ed_lvl', { n: G.lvl })}|${zoneName(G.lvl)}|${depth}|${G.artsGot}|${G.mode}|${G.view}|${ON.partner ? ON.partner.n : ''}|${G.pingStr}|${getLang()}`;
  if (info !== hudLast || force) {
    hudLast = info;
    $('hLvl').textContent = t('ed_lvl', { n: G.lvl }); $('hZone').textContent = zoneName(G.lvl);
    $('hDepth').textContent = t('ed_depth', { m: nf(depth) });
    $('hArts').textContent = '◆'.repeat(G.artsGot) + '◇'.repeat(Math.max(0, G.arts.length - G.artsGot));
    $('hRole').textContent = G.mode === 'solo' ? '🤿 ' + t('ed_solo').replace(/^\S+\s/, '') : (op ? '📡 ' + t('ed_sonar') : '🚢 ' + t('ed_pilot')) + (ON.partner ? ' · ' + ON.partner.n : '');
    $('tStr').innerHTML = `<span class="lvb">${STR_BARS[G.pingStr]}</span><small>${esc(t(STR_KEYS[G.pingStr]))}</small>`;
    buildOpBar();
  }
  $('hDepthBar').firstElementChild.style.width = (clamp(s.y / L.H, 0, 1) * 100).toFixed(1) + '%';
  const cdMax = PINGS[G.pingStr].cd, cdf = clamp(G.pingCd / cdMax, 0, 1);
  if (op) { $('opPing').querySelector('i').style.width = (cdf * 100) + '%'; $('opPing').classList.toggle('off', s.pw < PINGS[G.pingStr].cost); }
  else $('tPing').querySelector('.cd').style.height = (cdf * 100) + '%';
}
function hudAlert() {
  const el = $('hAlert'); el.textContent = t('ed_alerted'); el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(hudAlert.tm); hudAlert.tm = setTimeout(() => el.hidden = true, 1800);
}
function showTip(key) { const el = $('hTip'); if (!key) { el.hidden = true; el.dataset.k = ''; return; } if (el.dataset.k !== key) { el.dataset.k = key; el.textContent = t(key); } el.hidden = false; }
function toast(text) {
  const box = $('toasts'); const d = document.createElement('div'); d.className = 'toast'; d.textContent = text; box.appendChild(d);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => d.remove(), 2800);
}

// ---------------------------------------------------------------- screens
const scr = $('scr');
function showScreen(name) { G.screen = name; renderScreen(); }
function hideScreen() { G.screen = null; scr.hidden = true; scr.innerHTML = ''; }
function starsHtml(n) { return [0, 1, 2].map(i => `<span class="${i < n ? 'on' : ''}">◆</span>`).join(''); }
function renderScreen() {
  const nm = G.screen; if (!nm) { scr.hidden = true; return; }
  scr.hidden = false; scr.classList.toggle('dim', ['pause', 'result', 'lost'].includes(nm));
  let h = '';
  const totalStars = Object.values(SAVE.best).reduce((a, b) => a + (b.stars || 0), 0);
  if (nm === 'menu') {
    h = `<div class="panel menu">
      <div class="logo"><div class="emb"><div class="rings"><i></i><i></i><i></i></div></div><h1>${esc(t('ed_title'))}</h1><div class="tag">${esc(t('ed_tag'))}</div></div>
      <button class="btn big" data-act="levels">${esc(t('ed_solo'))}</button>
      <button class="btn big cyan" data-act="online">${esc(t('ed_online'))}</button>
      <button class="btn sec" data-act="how">${esc(t('ed_how'))}</button>
      <div class="foot"><span>${esc(t('ed_stars'))}: <b>${totalStars}/${NLVL * 3}</b></span><span>${esc(t('ed_deepest'))}: <b>${esc(t('ed_depth', { m: nf(SAVE.deepest || 0) }))}</b></span></div>
    </div>`;
  } else if (nm === 'levels') {
    let tiles = '';
    for (let n = 1; n <= NLVL; n++) {
      const lock = n > SAVE.unlocked, b = SAVE.best[n], P = params(n);
      tiles += `<button class="lv" data-act="play" data-n="${n}" ${lock ? 'disabled' : ''}><b>${lock ? '🔒' : n}</b><span>${esc(zoneName(n))}</span><i>${lock ? '' : starsHtml(b ? b.stars : 0)}</i><small>${esc(t('ed_depth', { m: nf(P.depth0 + P.span) }))}</small></button>`;
    }
    h = `<div class="panel"><h2>${esc(t('ed_levels'))}</h2><div class="lvls">${tiles}</div><button class="btn sec" data-act="menu">${esc(t('ed_back'))}</button></div>`;
  } else if (nm === 'online') {
    h = `<div class="panel"><h2>${esc(t('ed_online'))}</h2>
      <div class="roles">
        <button class="role" data-act="create" data-r="pilot"><span class="ri">🚢</span><b>${esc(t('ed_pilot'))}</b><span>${esc(t('ed_pilotDesc'))}</span><em>${esc(t('ed_createAs'))}</em></button>
        <button class="role" data-act="create" data-r="sonar"><span class="ri">📡</span><b>${esc(t('ed_sonar'))}</b><span>${esc(t('ed_sonarDesc'))}</span><em>${esc(t('ed_createAs'))}</em></button>
      </div>
      <div class="or">${esc(t('ed_or'))}</div>
      <div class="row"><input class="code" id="edCode" maxlength="6" placeholder="${esc(t('ed_codePh'))}" autocomplete="off" spellcheck="false"><button class="btn" data-act="join">${esc(t('ed_join'))}</button></div>
      <div class="msg" id="edMsg"></div>
      <button class="btn sec" data-act="menu">${esc(t('ed_back'))}</button></div>`;
  } else if (nm === 'lobby') {
    const P = ON.partner, role = ON.role, ri = (r) => r === 'pilot' ? '🚢' : r === 'sonar' ? '📡' : '⏳', rn = (r) => r ? t(r === 'pilot' ? 'ed_pilot' : 'ed_sonar') : t('ed_connecting');
    const maxL = Math.max(SAVE.unlocked, P && P.ul || 1);
    G.selLvl = clamp(G.selLvl, 1, maxL);
    const picker = role === 'pilot'
      ? `<div class="picker"><button data-act="lv" data-d="-1">‹</button><div class="grow"><small>${esc(t('ed_levelOf'))}</small><b>${G.selLvl} · ${esc(zoneName(G.selLvl))}</b></div><button data-act="lv" data-d="1">›</button></div>
         <button class="btn big" data-act="start" ${P ? '' : 'disabled'}>${esc(t('ed_start'))}</button>${P ? '' : `<p class="muted" style="text-align:center">${esc(t('ed_needPartner'))}</p>`}`
      : role === 'sonar' ? `<div class="picker"><div class="grow"><small>${esc(t('ed_levelOf'))}</small><b>${G.selLvl} · ${esc(zoneName(G.selLvl))}</b></div></div><p class="muted" style="text-align:center">${esc(t('ed_waitPilot'))}</p>` : '';
    h = `<div class="panel"><h2>${esc(t('ed_online'))}</h2>
      <div class="roomcode"><span>${esc(t('ed_room'))}</span><b>${esc(ON.code)}</b><span class="grow"></span><button class="btn small" data-act="copy">${esc(t('ed_copyLink'))}</button></div>
      <div class="plist">
        <div class="pl"><span class="ri">${ri(role)}</span><div><b dir="auto">${esc(myName())}</b><small>${esc(t('ed_you'))} · ${esc(rn(role))}</small></div></div>
        ${P ? `<div class="pl"><span class="ri">${ri(P.role)}</span><div><b dir="auto">${esc(P.n)}</b><small>${esc(t('ed_partner'))} · ${esc(rn(P.role))}</small></div></div>` : `<div class="pl wait">${esc(t(ON.ready ? 'ed_waitPartner' : 'ed_connecting'))}</div>`}
      </div>
      ${P && role ? `<button class="btn sec" data-act="swap">${esc(t('ed_swap'))}</button>` : ''}
      ${picker}
      <button class="btn sec" data-act="leave">${esc(t('ed_leave'))}</button></div>`;
  } else if (nm === 'how') {
    h = `<div class="panel"><h2>${esc(t('ed_how'))}</h2><div class="how">${[1, 2, 3, 4, 5, 6].map(i => `<div><b>${esc(t('ed_h' + i + 't'))}</b><p>${esc(t('ed_h' + i))}</p></div>`).join('')}</div><button class="btn sec" data-act="menu">${esc(t('ed_back'))}</button></div>`;
  } else if (nm === 'pause') {
    const online = G.mode === 'online', canRestart = G.view === 'pilot';
    h = `<div class="panel" style="text-align:center"><h2>${esc(t('ed_paused'))}</h2>${G.pausedBy ? `<p class="muted">${esc(t('ed_pausedBy', { p: G.pausedBy }))}</p>` : ''}
      <button class="btn big" data-act="resume">${esc(t('ed_resume'))}</button>
      ${canRestart ? `<button class="btn sec" data-act="restart">${esc(t('ed_restart'))}</button>` : ''}
      <button class="btn sec" data-act="quit">${esc(t(online ? 'ed_toRoom' : 'ed_quit'))}</button></div>`;
  } else if (nm === 'result') {
    const R = G.result || {}, win = R.win, final = win && R.lvl >= NLVL, b = SAVE.best[R.lvl];
    const sonar = G.role === 'sonar';
    h = `<div class="panel result ${win ? 'win' : 'lose'}"><h2>${esc(t(final ? 'ed_final' : win ? 'ed_win' : 'ed_lose'))}</h2>
      <p class="muted">${esc(final ? t('ed_finalD') : win ? t('ed_lvl', { n: R.lvl }) + ' · ' + zoneName(R.lvl) : t(R.reason === 'o2' ? 'ed_rO2' : 'ed_rHull'))}</p>
      <div class="stars">${starsHtml(R.arts || 0)}</div>
      <div class="stats"><div><span>${esc(t('ed_score'))}</span><b>${nf(R.score || 0)}</b></div><div><span>${esc(t('ed_time'))}</span><b>${fmtTime(R.time || 0)}</b></div>
        <div><span>${esc(t('ed_artsN'))}</span><b>${R.arts || 0}/3</b></div><div><span>${esc(t('ed_best'))}</span><b>${b ? nf(b.score) : '—'}</b></div></div>
      ${R.newBest ? `<div class="newbest">${esc(t('ed_newBest'))}</div>` : ''}
      <div class="btns">${win && R.lvl < NLVL ? `<button class="btn big" data-act="next">${esc(t('ed_next'))}</button>` : ''}
        <button class="btn ${win ? 'sec' : 'big'}" data-act="retry">${esc(t('ed_retry'))}</button>
        <button class="btn sec" data-act="${G.mode === 'online' ? 'room' : 'menuFromGame'}">${esc(t(G.mode === 'online' ? 'ed_toRoom' : 'ed_menu'))}</button>
        ${sonar ? `<p class="muted" id="edReq"></p>` : ''}</div></div>`;
  } else if (nm === 'lost') {
    const pilot = G.role === 'pilot';
    h = `<div class="panel" style="text-align:center"><h2>${esc(t('ed_partnerLost'))}</h2><p>${esc(t(pilot ? 'ed_partnerLostD' : 'ed_pilotLostD'))}</p>
      ${pilot ? `<button class="btn big" data-act="assist">${esc(t('ed_continueSolo'))}</button>` : ''}
      <button class="btn sec" data-act="leave">${esc(t('ed_leave'))}</button></div>`;
  }
  scr.innerHTML = h;
  const inp = $('edCode'); if (inp) { inp.onkeydown = (e) => { if (e.key === 'Enter') act('join', {}); }; inp.oninput = () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; }
}
scr.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; auInit(); SFX.click(); act(b.dataset.act, b.dataset, b); });
async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
async function act(a, ds, btn) {
  ds = ds || {};
  switch (a) {
    case 'levels': case 'online': case 'how': case 'menu': showScreen(a); break;
    case 'play': G.mode = 'solo'; G.role = 'solo'; G.assist = false; startLevel(+ds.n); break;
    case 'create': { if (!(await canGoOnline())) return; joinRoom(newCode(), ds.r); break; }
    case 'join': {
      const inp = $('edCode'), code = (inp ? inp.value : '').trim().toUpperCase();
      if (code.length < 4) { const m = $('edMsg'); if (m) m.textContent = t('ed_codeHint'); return; }
      if (!(await canGoOnline())) return; joinRoom(code, null); break;
    }
    case 'copy': copyText(inviteLink(ON.code), btn); break;
    case 'swap': swapRoles(); break;
    case 'lv': { const maxL = Math.max(SAVE.unlocked, ON.partner && ON.partner.ul || 1); G.selLvl = clamp(G.selLvl + (+ds.d), 1, maxL); netSend('sel', { l: G.selLvl }); renderScreen(); break; }
    case 'start': startOnline(G.selLvl); break;
    case 'leave': leaveRoom(); toMenu(); break;
    case 'resume': setPause(false, true); break;
    case 'restart': retryLevel(); break;
    case 'quit': if (G.mode === 'online') { netSend('lobby', {}); toLobby(); } else toMenu(); break;
    case 'next': if (G.role === 'sonar') { netSend('req', { act: 'next' }); const r = $('edReq'); if (r) r.textContent = t('ed_waitHost'); } else nextLevel(); break;
    case 'retry': if (G.role === 'sonar') { netSend('req', { act: 'retry' }); const r = $('edReq'); if (r) r.textContent = t('ed_waitHost'); } else retryLevel(); break;
    case 'room': netSend('lobby', {}); toLobby(); break;
    case 'menuFromGame': toMenu(); break;
    case 'assist': G.assist = true; G.paused = false; hideScreen(); uiMode(); toast(t('ed_continueSolo')); break;
  }
}
function nextLevel() { const n = Math.min(NLVL, G.lvl + 1); startLevel(n); if (G.mode === 'online' && G.role === 'pilot') { G.selLvl = n; sendGo(false); } }
function retryLevel() { startLevel(G.lvl); if (G.mode === 'online' && G.role === 'pilot') sendGo(false); }
function toMenu() {
  if (ON.code) leaveRoom();
  G.phase = 'menu'; G.mode = 'solo'; G.role = 'solo'; G.view = 'title'; G.paused = false; G.assist = false; G.ending = null;
  uiMode(); showScreen('menu');
}
function toLobby() {
  G.phase = 'lobby'; G.view = 'title'; G.paused = false; G.ending = null; G.assist = false; G.markers = [];
  uiMode(); showScreen('lobby');
}
function setPause(on, mine, by) {
  if (G.phase !== 'play') return;
  G.paused = on; G.pausedBy = mine ? '' : (by || '');
  if (on) showScreen('pause'); else if (G.screen === 'pause') hideScreen();
  if (mine && G.mode === 'online') netSend('pause', { on });
  G.keys.clear(); TB.boost = false;
}
function copyText(text, btn) {
  const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = t('ed_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
  try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
}

// ---------------------------------------------------------------- online (Supabase Realtime broadcast)
const ON = { ch: null, code: '', ready: false, me: '', role: null, jt: 0, partner: null, hb: null };
const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'roles', 'sel', 'go', 'st', 'ping', 'mk', 'mkdone', 'sig', 'pause', 'end', 'req', 'lobby', 'ev'];
const myName = () => (window.Auth && Auth.name && Auth.name()) || t('ed_diver');
const newCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
const inviteLink = (code) => location.href.split('?')[0].split('#')[0] + '?room=' + code;
const otherRole = (r) => r === 'pilot' ? 'sonar' : 'pilot';
function netSend(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }
function joinRoom(code, role) {
  leaveRoom(true);
  if (!window.sb) { toast(t('ed_noNet')); return false; }
  code = String(code || '').trim().toUpperCase(); if (!code) return false;
  let id = ''; try { id = sessionStorage.getItem('echoes-deep-id-' + code) || ''; } catch (e) {}
  if (!id) { id = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('echoes-deep-id-' + code, id); } catch (e) {} }
  ON.me = id; ON.code = code; ON.role = role || null; ON.ready = false; ON.jt = Date.now(); ON.partner = null;
  G.mode = 'online'; G.role = ON.role || 'sonar'; G.assist = false;
  const ch = sb.channel('echoes-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; hello(true); if (G.screen === 'lobby') renderScreen(); } });
  ON.ch = ch;
  try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
  window.Mal3abShareLink = () => inviteLink(code);
  clearInterval(ON.hb); ON.hb = setInterval(netBeat, 2000);
  toLobby();
  return true;
}
function leaveRoom(quiet) {
  if (ON.ch) { netSend('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
  clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.partner = null; ON.role = null;
  window.Mal3abShareLink = () => location.href.split('?')[0].split('#')[0];
  if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} G.mode = 'solo'; G.role = 'solo'; }
}
function hello(req) { netSend('hello', { n: myName(), role: ON.role, jt: ON.jt, req: !!req, ph: G.phase, sel: G.selLvl, ul: SAVE.unlocked }); }
function netBeat() {
  if (!ON.ch) return;
  netSend('hb', { n: myName(), role: ON.role, jt: ON.jt, ph: G.phase, sel: G.selLvl, ul: SAVE.unlocked });
  if (G.role === 'sonar' && G.phase === 'play' && G.markers.length) sendMarkers();
  if (ON.partner && Date.now() - ON.partner.t > 9000) partnerGone();
}
function resolveRoles(p) {
  if (G.phase === 'play' && ON.role) return;
  const mineFirst = ON.jt < p.jt || (ON.jt === p.jt && ON.me < p.id);
  if (!p.role && !ON.role) ON.role = mineFirst ? 'pilot' : 'sonar';
  else if (!ON.role) ON.role = otherRole(p.role);
  else if (p.role === ON.role && !mineFirst) ON.role = otherRole(p.role);
  G.role = ON.role;
}
function onNet(ev, p) {
  if (!p || p.id === ON.me) return;
  const now = Date.now();
  if (ev === 'full') { if (p.to === ON.me) { leaveRoom(); toMenu(); showScreen('online'); toast(t('ed_full')); } return; }
  let P = ON.partner;
  if (P && P.id !== p.id) {
    if (now - P.t < 9000) { if (ev === 'hello') netSend('full', { to: p.id }); return; }
    partnerGone(true); P = null;
  }
  if (ev === 'bye') { if (P) partnerGone(); return; }
  if (!P) {
    P = ON.partner = { id: p.id, n: p.n || '…', role: null, t: now, ul: 1 };
    toast(t('ed_joinedP', { p: P.n })); SFX.join();
    if (G.screen === 'lost') { if (G.role === 'pilot') { hideScreen(); G.paused = false; } else hideScreen(); }
  }
  P.t = now; if (p.n) P.n = p.n; if (p.ul) P.ul = p.ul;
  if (ev === 'hello' || ev === 'hb') {
    if ('role' in p) P.role = p.role;
    const before = ON.role; resolveRoles(p);
    if (P.role === 'pilot' && p.sel && G.phase !== 'play') G.selLvl = p.sel;
    if (ev === 'hello' && p.req) hello(false); else if (before !== ON.role) hello(false);
    if (ON.role === 'pilot' && G.phase === 'play' && p.ph !== 'play') sendGo(true);
    if (ON.role === 'sonar' && p.ph === 'lobby' && (G.phase === 'play' || G.phase === 'result')) toLobby();
    if (G.screen === 'lobby') renderScreen();
    return;
  }
  switch (ev) {
    case 'roles': ON.role = p.pilot === ON.me ? 'pilot' : 'sonar'; G.role = ON.role; P.role = otherRole(ON.role); if (G.screen === 'lobby') renderScreen(); break;
    case 'sel': if (ON.role === 'sonar') { G.selLvl = p.l; if (G.screen === 'lobby') renderScreen(); } break;
    case 'go': if (ON.role === 'pilot') { if (P.role === 'pilot') { ON.role = 'sonar'; } else break; }
      ON.role = 'sonar'; G.role = 'sonar'; G.mode = 'online'; G.selLvl = p.l; startLevel(p.l, { seed: p.seed }); if (p.mk) G.markers = []; break;
    case 'st': if (G.role === 'sonar' && G.phase === 'play' && p.lv === G.lvl) applySt(p); break;
    case 'ping': if (G.role === 'pilot' && G.phase === 'play' && !G.paused && G.sub && G.sub.alive) applyPing(clamp(p.s | 0, 0, 2), true); break;
    case 'mk': if (G.role === 'pilot' && Array.isArray(p.list)) G.markers = p.list.slice(0, 8); break;
    case 'mkdone': if (G.role === 'sonar') { G.markers = G.markers.filter(m => m.id !== p.mid); } break;
    case 'sig': showSig(p.k | 0, P.n); break;
    case 'pause': setPause(!!p.on, false, P.n); break;
    case 'end': if (G.role === 'sonar' && p.r) { G.ending = null; const R = p.r; R.newBest = false; recordResult(R); G.result = R; G.phase = 'result'; G.paused = false; uiMode(); showScreen('result'); if (R.win) SFX.win(); else SFX.lose(); } break;
    case 'req': if (G.role === 'pilot' && G.phase === 'result') { if (p.act === 'next' && G.result && G.result.win && G.lvl < NLVL) nextLevel(); else if (p.act === 'retry') retryLevel(); } break;
    case 'lobby': if (G.phase !== 'lobby') toLobby(); break;
    case 'ev': if (G.role === 'sonar') opEvent(p); break;
  }
}
function partnerGone(silent) {
  const P = ON.partner; if (!P) return; ON.partner = null;
  if (!silent) toast(t('ed_leftP', { p: P.n }));
  if (G.phase === 'play') {
    if (G.role === 'pilot') { if (!G.assist) { G.paused = true; showScreen('lost'); } }
    else showScreen('lost');
  } else if (G.screen === 'lobby') renderScreen();
}
function swapRoles() {
  if (!ON.partner || !ON.role) return;
  ON.role = otherRole(ON.role); G.role = ON.role; ON.partner.role = otherRole(ON.role);
  netSend('roles', { pilot: ON.role === 'pilot' ? ON.me : ON.partner.id });
  renderScreen();
}
function startOnline(n) {
  if (!ON.partner) { toast(t('ed_needPartner')); return; }
  G.mode = 'online'; G.role = 'pilot'; ON.role = 'pilot'; G.assist = false; startLevel(n); sendGo(false);
}
function sendGo(mid) { if (L && G.phase === 'play') netSend('go', { l: G.lvl, seed: L.seed0, mid: !!mid }); }
function sendSt() {
  const s = G.sub; if (!s) return;
  let ar = 0, pk = 0; G.arts.forEach((a, i) => { if (a.got) ar |= 1 << i; }); G.picks.forEach((q, i) => { if (q.got) pk |= 1 << i; });
  netSend('st', { lv: G.lvl, x: Math.round(s.x * 10) / 10, y: Math.round(s.y * 10) / 10, vx: Math.round(s.vx), vy: Math.round(s.vy), a: Math.round(s.aim * 100) / 100,
    h: Math.round(s.hull), o: Math.round(s.o2 * 10) / 10, p: Math.round(s.pw * 10) / 10, n: Math.round(G.noise), L: s.lamp && s.pw > 0.5 ? 1 : 0, t: Math.round(G.time * 100) / 100,
    pr: G.preds.map(q => [Math.round(q.x), Math.round(q.y), ST_CODE[q.st] | 0]), ar, pk });
}
addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });
window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : location.href.split('?')[0].split('#')[0];
window.Mal3abPrepareInvite = async () => {
  if (!ON.code) { if (!(await canGoOnline())) return location.href.split('?')[0].split('#')[0]; joinRoom(newCode(), 'pilot'); }
  return inviteLink(ON.code);
};

// ---------------------------------------------------------------- start
function relabel() {
  $('bLang').textContent = getLang() === 'ar' ? 'English' : 'العربية';
  $('bMute').textContent = SET.mute ? '🔇' : '🔊';
  buildBars(); hudUpdate(true); renderScreen();
  const tip = $('hTip'); if (!tip.hidden && tip.dataset.k) tip.textContent = t(tip.dataset.k);
}
document.addEventListener('langchange', relabel);
if (window.matchMedia && matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
addEventListener('resize', resize);
resize(); if (window.applyLang) applyLang(); relabel();
G.titleL = genLevel(1, hashStr('echoes-title-3')); L = G.titleL;
showScreen('menu'); uiMode();
let lastT = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  if (W !== innerWidth || H !== innerHeight) resize();
  update(dt); render();
}
requestAnimationFrame(frame);
const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam) {
  let tried = false;
  const go = async () => { if (tried || ON.code) return; tried = true; if (!(await canGoOnline())) return; joinRoom(roomParam.toUpperCase().slice(0, 6), null); };
  if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
}

// ---------------------------------------------------------------- test hooks
window.EchoesDeep = {
  G, ON, SAVE, PINGS, get L() { return L; },
  startSolo(n) { G.mode = 'solo'; G.role = 'solo'; G.assist = false; startLevel(n || 1); },
  start(n, seed) { startLevel(n || 1, seed != null ? { seed } : {}); },
  startOnline, joinRoom, leaveRoom, newCode, act, showScreen, sendSig, addMarker, clearMarkers, setStr, swapRoles,
  ping(si) { return G.view === 'sonar' ? opPing(si) : pilotPing(si); },
  step(sec) { const n = Math.round((sec || 1) * 60); for (let i = 0; i < n; i++) update(1 / 60); render(); },
  win() { endLevel(true); }, lose(r) { endLevel(false, r || 'hull'); },
  teleport(x, y) { const s = G.sub; s.x = x; s.y = y; s.vx = s.vy = 0; s.lastSafe = [x, y]; G.cam.x = x; G.cam.y = y; },
  input(x, y, boost) { G.forced = x == null ? null : { x, y, boost }; },
  autopilot(on) { G.autopilot = !!on; G.apPath = null; },
  genLevel, findPath: (x0, y0, x1, y1) => findPath(L.oc, x0, y0, x1, y1)
};
})();
