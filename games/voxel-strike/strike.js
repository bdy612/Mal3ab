'use strict';
// =====================================================================
// Voxel Strike — a blocky arena shooter for Mal3ab.
//  · Deathmatch vs bots · Waves (survive) · Online with friends (room code / invite link / Fast Connect)
//  · pistol, rifle, shotgun, sniper, grenades that blow holes, blocks you can build with
//  · mouse + keyboard, or touch controls on phones and tablets
// =====================================================================
(function () {
const { W, H, D, B, BLOCKS } = VS;
const $ = (id) => document.getElementById(id);
const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const arr = (v) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)];
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------------
// words (Arabic / English)
// ---------------------------------------------------------------------
addStrings({
  vs_title: 'فوكسل سترايك', vs_sub: 'معركة مكعبات: سلاح، قنابل بتفجّر البلوكات، وبلوكات تبني بيها ساتر',
  vs_dm: 'ديثماتش', vs_dmDesc: 'إنت ضد البوتات — أول واحد يوصل {n} قتلة يكسب.', vs_waves: 'الموجات', vs_wavesDesc: 'موجات بوتات ورا بعض. فضل عايش لأطول وقت.',
  vs_online: 'أونلاين', vs_onlineDesc: 'العب مع أصحابك بكود غرفة أو لينك. أول واحد يوصل {n} قتلة يكسب الجولة.',
  vs_diff: 'المستوى', vs_bots: 'البوتات', vs_play: '▶ العب', vs_create: '➕ اعمل غرفة', vs_join: 'ادخل', vs_code: 'الكود',
  vs_copyLink: '🔗 انسخ اللينك', vs_copied: 'اتنسخ ✓', vs_settings: '⚙ الإعدادات', vs_sens: 'حساسية الماوس', vs_vol: 'الصوت', vs_fov: 'مجال الرؤية',
  vs_back: 'رجوع', vs_resume: '▶ كمّل', vs_leave: 'اخرج من الماتش', vs_paused: 'متوقف',
  vs_help: 'WASD تتحرك · Shift جري · Space نط · كليك شمال يضرب · كليك يمين نيشان · R حشو · 6 أو العجلة للقنبلة (دوس مطوّل عشان تنشن وسيب ترمي) · G رمية سريعة · Tab النتيجة',
  vs_helpTouch: 'العصاية للحركة · اسحب في الشاشة عشان تبص · 🔥 ضرب · 🎯 نيشان · ⤒ نط · 💣 دوس واسحب صباعك عشان تنشن القنبلة',
  vs_respawn: 'هترجع بعد {n}', vs_killedBy: 'قتلك {p}', vs_wave: 'الموجة', vs_left: 'فاضل', vs_waveClear: 'الموجة خلصت! ✓',
  vs_over: 'انتهى الماتش', vs_gameOver: 'خسرت!', vs_youWin: 'كسبت! 🏆', vs_won: '{p} كسب', vs_reached: 'وصلت للموجة {n}', vs_best: 'أحسن رقم: الموجة {n}',
  vs_rules: '⚙ إعدادات الماتش', vs_rulesT: 'إعدادات الماتش', vs_botN: 'عدد البوتات', vs_allLv: 'مستوى كل البوتات', vs_mixed: 'مختلط', vs_eachBot: 'كل بوت لوحده',
  vs_bot: 'بوت', vs_target: 'عدد القتلات للفوز', vs_noLimit: 'من غير حد', vs_lives: 'الأرواح (كام مرة تموت وترجع)', vs_inf: '∞ ما لا نهاية',
  vs_hc: '💀 هاردكور', vs_hcDesc: 'أي ضربة بتموّت على طول، واللي يموت بيفضل ميت لآخر الماتش.', vs_save: '✓ تمام', vs_out: 'خلصت أرواحك — بتتفرج لحد آخر الماتش',
  vs_lastStand: 'آخر واحد يفضل عايش يكسب', vs_livesLeft: 'أرواح', vs_sum: '{b} بوت · {l} · {t} · {v}', vs_sumT: 'أول واحد يوصل {n}', vs_sumL: '{n} أرواح',
  vs_fists: 'إيدك', vs_minigun: 'ميني جن', vs_railgun: 'ريل جن', vs_start: 'السلاح في الأول', vs_stAll: 'كل الأسلحة', vs_stPistol: 'مسدس بس', vs_stNone: 'من غير سلاح (إيدك بس)',
  vs_pickups: 'أسلحة أقوى وعلاج على الخريطة', vs_pkOff: 'مفيش', vs_pkNormal: 'عادي', vs_pkLots: 'كتير', vs_drops: 'صناديق بتنزل من السما', vs_dropIn: '📦 صندوق إمدادات نازل من السما!', vs_crate: '📦 الصندوق: {w} + صحة كاملة + ذخيرة', vs_ammoRule: 'الطلقات', vs_amNormal: 'عادي', vs_amInf: 'لا نهائية ∞', vs_reloadRule: 'الريلود', vs_rlNormal: 'عادي (كل سلاح بوقته)', vs_rlCustom: 'وقت واحد لكل الأسلحة', vs_rlNone: 'من غير ريلود', vs_rlSec: 'وقت الريلود (ثواني)', vs_onDeath: 'لما حد يموت', vs_shield: '🛡️ هيلث احتياطي (درع)', vs_shOn: 'شغال (العلاج الزيادة ← درع)', vs_shOff: 'مقفول', vs_shGot: '+{n} درع 🛡️', vs_myHp: 'صحة اللاعيبة', vs_myShield: 'الدرع في الأول (اللاعيبة)', vs_botHp: 'صحة كل البوتات', vs_botShield: 'الدرع في الأول (البوتات)', vs_hpHint: 'العادي 100', vs_shMax: 'أقصى درع', vs_dKeep: 'تفضل معاه أسلحته زي ما هي', vs_dLose: 'تضيع أسلحته (من غير ما توقع)', vs_dDrop: 'يوقّع كل أسلحته على الأرض', vs_alive: 'عايشين', vs_spec: 'بتتفرج — WASD تتحرك، الماوس تبص، Space/Shift فوق وتحت',
  vs_specTouch: 'بتتفرج — حرّك الكاميرا بالجويستيك', vs_out2: 'خرج', vs_got: 'خدت {w}!', vs_heal: '+50 صحة', vs_ammo: 'ذخيرة', vs_numHint: '0 = من غير حد', vs_livesCol: 'أرواح',
  vs_kills: 'قتلات', vs_deaths: 'موت', vs_player: 'اللاعب', vs_again: '↻ العب تاني', vs_menu: 'القائمة', vs_nextRound: 'الجولة الجاية بعد {n}',
  vs_firstTo: 'أول واحد يوصل {n}', vs_waiting: 'مستني أصحابك… ابعتلهم الكود', vs_room: 'الغرفة', vs_joined: 'دخل', vs_leftRoom: 'خرج',
  vs_pistol: 'مسدس', vs_rifle: 'رشاش', vs_shotgun: 'شوتجن', vs_sniper: 'قناصة', vs_blocks: 'بلوكات', vs_grenade: 'قنبلة', vs_reload: 'بيحشي…',
  vs_easy: 'سهل', vs_medium: 'متوسط', vs_hard: 'صعب', vs_you: 'إنت', vs_clickPlay: 'اضغط عشان تكمّل', vs_codeHint: 'اكتب كود من ٤ حروف',
  vs_connecting: 'بيتوصل…', vs_score: 'النتيجة', vs_head: 'هيدشوت!', vs_lb: '🏆 المتصدرين', vs_lbKills: 'قتلات', vs_lbWins: 'انتصارات', vs_lbWave: 'أعلى موجة', vs_matches: 'ماتشات', vs_lbEmpty: 'لسه مفيش حد — العب ماتش واظهر هنا!', vs_lbLogin: 'سجّل دخول في ملعب عشان اسمك يظهر في المتصدرين', vs_loading: 'بيحمّل…', vs_rank: '#'
}, {
  vs_title: 'Voxel Strike', vs_sub: 'A blocky arena battle: guns, grenades that blow up blocks, and blocks to build cover',
  vs_dm: 'Deathmatch', vs_dmDesc: 'You against bots — first to {n} kills wins.', vs_waves: 'Waves', vs_wavesDesc: 'Wave after wave of bots. Stay alive as long as you can.',
  vs_online: 'Online', vs_onlineDesc: 'Play with friends using a room code or a link. First to {n} kills wins the round.',
  vs_diff: 'Level', vs_bots: 'Bots', vs_play: '▶ Play', vs_create: '➕ Create room', vs_join: 'Join', vs_code: 'Code',
  vs_copyLink: '🔗 Copy link', vs_copied: 'Copied ✓', vs_settings: '⚙ Settings', vs_sens: 'Mouse sensitivity', vs_vol: 'Volume', vs_fov: 'Field of view',
  vs_back: 'Back', vs_resume: '▶ Resume', vs_leave: 'Leave match', vs_paused: 'Paused',
  vs_help: 'WASD move · Shift sprint · Space jump · Left click shoot · Right click aim · R reload · 6 or the wheel for the grenade (hold to aim, let go to throw) · G quick throw · Tab scores',
  vs_helpTouch: 'Stick to move · drag the screen to look · 🔥 shoot · 🎯 aim · ⤒ jump · 💣 hold to aim the grenade, let go to throw',
  vs_respawn: 'Back in {n}', vs_killedBy: 'Eliminated by {p}', vs_wave: 'Wave', vs_left: 'left', vs_waveClear: 'Wave cleared! ✓',
  vs_over: 'Match over', vs_gameOver: 'Game over!', vs_youWin: 'You win! 🏆', vs_won: '{p} wins', vs_reached: 'You reached wave {n}', vs_best: 'Best: wave {n}',
  vs_rules: '⚙ Match settings', vs_rulesT: 'Match settings', vs_botN: 'Number of bots', vs_allLv: 'Level for all bots', vs_mixed: 'Mixed', vs_eachBot: 'Each bot',
  vs_bot: 'Bot', vs_target: 'Kills to win', vs_noLimit: 'No limit', vs_lives: 'Lives (how many times you can die)', vs_inf: '∞ Unlimited',
  vs_hc: '💀 Hardcore', vs_hcDesc: 'Any hit kills instantly, and whoever dies stays dead until the match ends.', vs_save: '✓ Done', vs_out: 'Out of lives — watching until the match ends',
  vs_lastStand: 'Last one standing wins', vs_livesLeft: 'lives', vs_sum: '{b} bots · {l} · {t} · {v}', vs_sumT: 'first to {n}', vs_sumL: '{n} lives',
  vs_fists: 'Fists', vs_minigun: 'Minigun', vs_railgun: 'Railgun', vs_start: 'Weapons at the start', vs_stAll: 'All weapons', vs_stPistol: 'Pistol only', vs_stNone: 'No weapons (fists only)',
  vs_pickups: 'Better weapons and heals on the map', vs_pkOff: 'Off', vs_pkNormal: 'Normal', vs_pkLots: 'Lots', vs_drops: 'Supply Drops From The Sky', vs_dropIn: '📦 Supply drop incoming!', vs_crate: '📦 Crate: {w} + full health + ammo', vs_ammoRule: 'Ammo', vs_amNormal: 'Normal', vs_amInf: 'Infinite ∞', vs_reloadRule: 'Reload', vs_rlNormal: 'Normal (each weapon its own time)', vs_rlCustom: 'Same time for every weapon', vs_rlNone: 'No reload', vs_rlSec: 'Reload time (seconds)', vs_onDeath: 'When Someone Dies', vs_shield: '🛡️ Spare Health (Shield)', vs_shOn: 'On (Extra Healing → Shield)', vs_shOff: 'Off', vs_shGot: '+{n} Shield 🛡️', vs_myHp: 'Players\' Health', vs_myShield: 'Starting Shield (Players)', vs_botHp: 'Health For All Bots', vs_botShield: 'Starting Shield (Bots)', vs_hpHint: 'Normal is 100', vs_shMax: 'Max Shield', vs_dKeep: 'Keep Their Weapons', vs_dLose: 'Lose Weapons (Nothing Drops)', vs_dDrop: 'Drop All Weapons On The Ground', vs_alive: 'alive', vs_spec: 'Spectating — WASD to move, mouse to look, Space/Shift up and down',
  vs_specTouch: 'Spectating — move the camera with the joystick', vs_out2: 'out', vs_got: 'Got the {w}!', vs_heal: '+50 health', vs_ammo: 'Ammo', vs_numHint: '0 = no limit', vs_livesCol: 'Lives',
  vs_kills: 'Kills', vs_deaths: 'Deaths', vs_player: 'Player', vs_again: '↻ Play again', vs_menu: 'Menu', vs_nextRound: 'Next round in {n}',
  vs_firstTo: 'First to {n}', vs_waiting: 'Waiting for friends… send them the code', vs_room: 'Room', vs_joined: 'joined', vs_leftRoom: 'left',
  vs_pistol: 'Pistol', vs_rifle: 'Rifle', vs_shotgun: 'Shotgun', vs_sniper: 'Sniper', vs_blocks: 'Blocks', vs_grenade: 'Grenade', vs_reload: 'Reloading…',
  vs_easy: 'Easy', vs_medium: 'Medium', vs_hard: 'Hard', vs_you: 'you', vs_clickPlay: 'Click to continue', vs_codeHint: 'Type a 4-letter code',
  vs_connecting: 'Connecting…', vs_score: 'Scores', vs_head: 'Headshot!', vs_lb: '🏆 Leaderboard', vs_lbKills: 'Kills', vs_lbWins: 'Wins', vs_lbWave: 'Best wave', vs_matches: 'Matches', vs_lbEmpty: 'Nobody yet — play a match and show up here!', vs_lbLogin: 'Log in to Mal3ab to put your name on the leaderboard', vs_loading: 'Loading…', vs_rank: '#'
});

const SET = Object.assign({ sens: 1, vol: 0.7, fov: 75 }, lsGet('vstrike-settings', {}));
const STATS = Object.assign({ bestWave: 0, kills: 0, wins: 0 }, lsGet('vstrike-stats', {}));
const saveSet = () => lsSet('vstrike-settings', SET), saveStats = () => lsSet('vstrike-stats', STATS);
const touchMode = matchMedia('(pointer: coarse)').matches;

// ---------------------------------------------------------------------
// renderer, scene, lights
// ---------------------------------------------------------------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !touchMode, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchMode ? 1.25 : 1.5));
renderer.autoClear = false;
const SKY = 0x9cc9f5;
const scene = new THREE.Scene(); scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 38, 115);
const camera = new THREE.PerspectiveCamera(SET.fov, 1, 0.05, 220); camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0xffffff, 0x58606e, 0.95));
const sun = new THREE.DirectionalLight(0xffffff, 0.5); sun.position.set(0.5, 1, 0.3); scene.add(sun);
const atlas = VS.makeAtlas();
const terrainMat = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
const vmScene = new THREE.Scene(), vmCam = new THREE.PerspectiveCamera(55, 1, 0.01, 10);
vmScene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.05)); const vmSun = new THREE.DirectionalLight(0xffffff, 0.45); vmSun.position.set(1, 2, 1); vmScene.add(vmSun);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = vmCam.aspect = w / h; camera.updateProjectionMatrix(); vmCam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---------------------------------------------------------------------
// sound: everything is synthesised, no files
// ---------------------------------------------------------------------
let AC = null, master = null, noiseBuf = null;
function audio() {
  if (AC) return AC;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = SET.vol; master.connect(AC.destination); } catch (e) { AC = null; }
  return AC;
}
function noise() { if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; }
const SND = { fists: [420, 0.07, 0.3], minigun: [1500, 0.06, 0.32], railgun: [380, 0.6, 1.0], pistol: [2200, 0.13, 0.5], rifle: [1700, 0.1, 0.42], shotgun: [900, 0.3, 0.8], sniper: [650, 0.5, 0.9], boom: [260, 1.0, 1.25] };
function shotSound(kind, vol) {
  if (vol == null) vol = 1; if (!audio() || vol < 0.03) return;
  const [freq, len, gain] = SND[kind] || SND.rifle, t0 = AC.currentTime;
  const src = AC.createBufferSource(); src.buffer = noise();
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 2.4, t0); f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.2), t0 + len);
  const g = AC.createGain(); g.gain.setValueAtTime(gain * vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  src.connect(f); f.connect(g); g.connect(master); src.start(t0, Math.random() * 0.4); src.stop(t0 + len + 0.05);
  const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(kind === 'boom' ? 80 : 150, t0); o.frequency.exponentialRampToValueAtTime(35, t0 + len * 0.6);
  const og = AC.createGain(); og.gain.setValueAtTime(0.4 * gain * vol, t0); og.gain.exponentialRampToValueAtTime(0.001, t0 + len * 0.6);
  o.connect(og); og.connect(master); o.start(t0); o.stop(t0 + len);
}
function beep(freq, len, type, vol) {
  if (!audio()) return; const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.value = freq; g.gain.setValueAtTime(vol || 0.1, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + len + 0.02);
}
const sfx = {
  hit: () => beep(1500, 0.05, 'square', 0.06), head: () => beep(2100, 0.07, 'square', 0.09), empty: () => beep(300, 0.05, 'square', 0.07),
  reload: () => { beep(500, 0.04, 'square', 0.05); setTimeout(() => beep(760, 0.05, 'square', 0.05), 280); }, hurt: () => beep(170, 0.12, 'sawtooth', 0.1),
  kill: () => { beep(880, 0.08, 'triangle', 0.14); setTimeout(() => beep(1320, 0.1, 'triangle', 0.14), 90); }, place: () => beep(260, 0.05, 'triangle', 0.12),
  land: () => { beep(140, 0.18, 'sine', 0.2); setTimeout(() => beep(90, 0.2, 'sine', 0.15), 60); },
  pickup: () => { beep(1046, 0.07, 'triangle', 0.12); setTimeout(() => beep(1568, 0.08, 'triangle', 0.12), 70); }, wave: () => { beep(440, 0.15, 'triangle', 0.15); setTimeout(() => beep(660, 0.2, 'triangle', 0.15), 150); }
};

// ---------------------------------------------------------------------
// blocky characters, guns and effects
// ---------------------------------------------------------------------
const geo = {}; const box = (w, h, d) => geo[w + ',' + h + ',' + d] || (geo[w + ',' + h + ',' + d] = new THREE.BoxGeometry(w, h, d));
const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
function pixTex(draw, n) { const c = document.createElement('canvas'); c.width = c.height = n || 8; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return t; }
const FACE = pixTex(g => { g.fillStyle = '#e0b48c'; g.fillRect(0, 0, 8, 8); g.fillStyle = '#4a3020'; g.fillRect(0, 0, 8, 2); g.fillStyle = '#fff'; g.fillRect(1, 3, 2, 1); g.fillRect(5, 3, 2, 1); g.fillStyle = '#233'; g.fillRect(2, 3, 1, 1); g.fillRect(6, 3, 1, 1); g.fillStyle = '#9a5a40'; g.fillRect(3, 6, 2, 1); });
const SKIN = lam(0xe0b48c), PANTS = lam(0x2d3240), GUNM = lam(0x26282c), HAIR = lam(0x4a3020), FACEM = new THREE.MeshLambertMaterial({ map: FACE });
function blockTex(b) { const tile = BLOCKS[b].t[1]; return pixTex(g => g.drawImage(atlas.image, (tile % 4) * 16, Math.floor(tile / 4) * 16, 16, 16, 0, 0, 16, 16), 16); }
function makeModel(color) {
  const root = new THREE.Group(), shirt = lam(color);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.13, 0.75, 0); legR.position.set(0.13, 0.75, 0);
  const l1 = new THREE.Mesh(box(0.24, 0.75, 0.26), PANTS); l1.position.y = -0.375; legL.add(l1); const l2 = l1.clone(); legR.add(l2);
  const body = new THREE.Mesh(box(0.5, 0.7, 0.28), shirt); body.position.y = 1.1;
  const head = new THREE.Group(); head.position.y = 1.45;
  const hm = new THREE.Mesh(box(0.44, 0.44, 0.44), [SKIN, SKIN, HAIR, SKIN, SKIN, FACEM]); hm.position.y = 0.2; head.add(hm);
  const armR = new THREE.Group(), armL = new THREE.Group(); armR.position.set(0.33, 1.38, 0); armL.position.set(-0.33, 1.38, 0);
  const a1 = new THREE.Mesh(box(0.18, 0.62, 0.18), shirt); a1.position.y = -0.28; armR.add(a1); const a2 = a1.clone(); armL.add(a2);
  const gun = new THREE.Mesh(box(0.09, 0.6, 0.13), GUNM); gun.position.set(0, -0.72, 0.04); armR.add(gun);
  root.add(legL, legR, body, head, armR, armL);
  return { root, legL, legR, head, armR, armL, gun, shirt };
}
function nameTag(text, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 48; const g = c.getContext('2d');
  g.font = 'bold 26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(250, g.measureText(text).width + 26); g.fillStyle = 'rgba(0,0,0,.5)';
  if (g.roundRect) { g.beginPath(); g.roundRect(128 - w / 2, 5, w, 38, 12); g.fill(); } else g.fillRect(128 - w / 2, 5, w, 38);
  g.fillStyle = color; g.fillText(text, 128, 25);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  s.scale.set(1.5, 0.28, 1); s.position.y = 2.2; return s;
}
// a small health bar (green) with the shield (blue) above it, floating over every bot and player
const HPB = { bg: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }), hp: new THREE.MeshBasicMaterial({ color: 0x2fbf71 }),
  low: new THREE.MeshBasicMaterial({ color: 0xe5484d }), mid: new THREE.MeshBasicMaterial({ color: 0xf5a524 }), sh: new THREE.MeshBasicMaterial({ color: 0x3e8ef7 }), geo: new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0) };
function hpBar() {
  const g = new THREE.Group(); g.position.y = 2.55;
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.24), HPB.bg); bg.position.y = 0.04; g.add(bg);
  const hp = new THREE.Mesh(HPB.geo, HPB.hp); hp.position.set(-0.5, -0.02, 0.001); hp.scale.set(1, 0.09, 1); g.add(hp);
  const sh = new THREE.Mesh(HPB.geo, HPB.sh); sh.position.set(-0.5, 0.1, 0.001); sh.scale.set(0, 0.07, 1); g.add(sh);
  g.userData = { hp, sh }; return g;
}
const _hq = new THREE.Quaternion();
function updHpBars() {
  for (const f of G.fighters) {
    const b = f.hpb; if (!b) continue;
    b.visible = f.alive && G.running;
    if (!b.visible) continue;
    const r = clamp(f.hp / (f.maxHp || 100), 0, 1), s = clamp((f.shield || 0) / (f.shMax || SHIELD_MAX), 0, 1);
    b.userData.hp.scale.x = Math.max(0.001, r); b.userData.hp.material = r > 0.6 ? HPB.hp : r > 0.3 ? HPB.mid : HPB.low;
    b.userData.sh.scale.x = Math.max(0.001, s); b.userData.sh.visible = s > 0;
    b.quaternion.copy(_hq.copy(f.model.root.quaternion).invert()).multiply(camera.quaternion);   // always faces the camera
  }
}
// the gun in your hands
const VM = {};
function gunModel(kind) {
  const g = new THREE.Group(), m = lam(0x2a2c31), wood = lam(0x6b4a2b), acc = lam(0x3d4048);
  const add = (gm, mat, x, y, z) => { const o = new THREE.Mesh(gm, mat); o.position.set(x, y, z); g.add(o); return o; };
  let muzzle = -0.6;
  if (kind === 'pistol') { add(box(0.07, 0.09, 0.32), m, 0, 0, -0.1); add(box(0.06, 0.17, 0.08), acc, 0, -0.11, 0.02); muzzle = -0.3; }
  if (kind === 'rifle') { add(box(0.08, 0.1, 0.62), m, 0, 0, -0.2); add(box(0.06, 0.17, 0.08), acc, 0, -0.12, -0.12); add(box(0.07, 0.1, 0.24), wood, 0, -0.02, 0.2); add(box(0.03, 0.03, 0.2), m, 0, 0.02, -0.6); muzzle = -0.72; }
  if (kind === 'shotgun') { add(box(0.1, 0.1, 0.72), m, 0, 0, -0.25); add(box(0.08, 0.07, 0.3), wood, 0, -0.08, -0.32); add(box(0.08, 0.12, 0.24), wood, 0, -0.03, 0.2); muzzle = -0.62; }
  if (kind === 'sniper') { add(box(0.07, 0.09, 0.98), m, 0, 0, -0.36); add(box(0.06, 0.07, 0.32), acc, 0, 0.09, -0.12); add(box(0.08, 0.12, 0.26), wood, 0, -0.03, 0.26); muzzle = -0.86; }
  if (kind === 'blocks') { add(box(0.24, 0.24, 0.24), new THREE.MeshLambertMaterial({ map: blockTex(B.PLANK) }), 0, 0.02, -0.12); }
  if (kind === 'fists') { add(box(0.12, 0.12, 0.16), SKIN, 0, -0.02, -0.12); add(box(0.13, 0.05, 0.05), SKIN, 0, 0.04, -0.2); muzzle = -0.22; }
  if (kind === 'minigun') { for (const [x, y] of [[-0.035, 0.03], [0.035, 0.03], [-0.035, -0.03], [0.035, -0.03]]) add(box(0.03, 0.03, 0.78), m, x, y, -0.3); add(box(0.16, 0.16, 0.26), acc, 0, 0, 0.05); add(box(0.08, 0.12, 0.12), lam(0xf5a524), 0, -0.13, 0.04); muzzle = -0.72; }
  if (kind === 'railgun') { add(box(0.08, 0.1, 1.02), m, 0, 0, -0.36); add(box(0.04, 0.04, 0.9), new THREE.MeshBasicMaterial({ color: 0x38e8ff }), 0.055, 0.02, -0.34); add(box(0.04, 0.04, 0.9), new THREE.MeshBasicMaterial({ color: 0x38e8ff }), -0.055, 0.02, -0.34); add(box(0.08, 0.12, 0.26), acc, 0, -0.03, 0.24); muzzle = -0.9; }
  if (kind === 'nade') { add(box(0.13, 0.17, 0.13), lam(0x3f5a2a), 0, 0.03, -0.14); add(box(0.06, 0.06, 0.06), lam(0x9aa0a6), 0, 0.14, -0.14); add(box(0.02, 0.1, 0.07), lam(0x9aa0a6), 0.07, 0.06, -0.14); }
  add(box(0.1, 0.1, 0.14), SKIN, 0, -0.1, 0.07);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ color: 0xffd25a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide }));
  fl.position.set(0, 0.01, muzzle); fl.visible = false; g.add(fl); g.userData.flash = fl;
  g.scale.setScalar(0.8); g.visible = false; vmScene.add(g); return g;
}
// tracers
const tracers = [];
for (let i = 0; i < 48; i++) { const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3)); const l = new THREE.Line(gm, new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0 })); l.frustumCulled = false; l.visible = false; scene.add(l); tracers.push({ l, life: 0 }); }
let trI = 0;
function tracer(a, b) { const t = tracers[trI++ % tracers.length], p = t.l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; t.l.visible = true; t.life = 0.07; t.l.material.opacity = 0.85; }
// debris cubes
const PMAX = 500, pMesh = new THREE.InstancedMesh(box(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), PMAX);
pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pMesh.setColorAt(0, new THREE.Color()); pMesh.count = 0; pMesh.frustumCulled = false; scene.add(pMesh);
const parts = [], _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3();
function burst(p, color, n, speed, size, life) {
  for (let i = 0; i < n; i++) { if (parts.length >= PMAX) parts.shift(); parts.push({ p: p.clone(), v: new V3((Math.random() - 0.5) * speed, Math.random() * speed * 0.9, (Math.random() - 0.5) * speed), life: life * (0.6 + Math.random() * 0.6), s: size * (0.6 + Math.random() * 0.8), c: new THREE.Color(color).multiplyScalar(0.8 + Math.random() * 0.35) }); }
}
function updParts(dt) {
  let n = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
    q.v.y -= 18 * dt; q.p.addScaledVector(q.v, dt);
    if (G.world && G.world.solid(Math.floor(q.p.x), Math.floor(q.p.y), Math.floor(q.p.z))) { q.p.addScaledVector(q.v, -dt); q.v.multiplyScalar(-0.25); }
  }
  for (const q of parts) { _s.setScalar(q.s * Math.min(1, q.life * 3)); _m4.compose(q.p, _q, _s); pMesh.setMatrixAt(n, _m4); pMesh.setColorAt(n, q.c); n++; }
  pMesh.count = n; pMesh.instanceMatrix.needsUpdate = true; if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
}
const booms = [];
function flashSphere(p) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffc06a, transparent: true, opacity: 0.85, depthWrite: false })); m.position.copy(p); scene.add(m); booms.push({ m, t: 0 }); }
// ghost outline where a block will go
const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 }));
ghost.visible = false; scene.add(ghost);

// ---------------------------------------------------------------------
// weapons
// ---------------------------------------------------------------------
const GUNS = {
  pistol: { dmg: 26, head: 2, rate: 0.19, mag: 12, res: Infinity, reload: 1.1, spread: 0.012, heat: 0.25, pellets: 1, range: 90, zoom: 1.3, kick: 0.018, auto: false },
  rifle: { dmg: 17, head: 1.8, rate: 0.095, mag: 30, res: 150, reload: 1.8, spread: 0.014, heat: 0.12, pellets: 1, range: 110, zoom: 1.5, kick: 0.011, auto: true },
  shotgun: { dmg: 12, head: 1.4, rate: 0.78, mag: 6, res: 30, reload: 2.1, spread: 0.075, heat: 0, pellets: 9, range: 36, zoom: 1.2, kick: 0.06, auto: false, falloff: [8, 30] },
  sniper: { dmg: 92, head: 2.2, rate: 1.25, mag: 5, res: 25, reload: 2.3, spread: 0.06, ads: 0.0007, heat: 0, pellets: 1, range: 200, zoom: 4, kick: 0.07, auto: false, scope: true },
  fists: { dmg: 24, head: 1.25, rate: 0.42, mag: Infinity, res: Infinity, reload: 0, spread: 0.01, heat: 0, pellets: 1, range: 2.7, zoom: 1.1, kick: 0.02, auto: true, melee: true },
  minigun: { dmg: 14, head: 1.5, rate: 0.055, mag: 160, res: 0, reload: 3, spread: 0.026, heat: 0.05, pellets: 1, range: 90, zoom: 1.3, kick: 0.007, auto: true, power: true },
  railgun: { dmg: 165, head: 1.4, rate: 1.4, mag: 4, res: 4, reload: 2.4, spread: 0.004, ads: 0.0004, heat: 0, pellets: 1, range: 230, zoom: 3.2, kick: 0.09, auto: false, scope: true, power: true }
};
const GUN_KEYS = ['fists', 'pistol', 'rifle', 'shotgun', 'sniper', 'minigun', 'railgun'], SLOTS = ['fists', 'pistol', 'rifle', 'shotgun', 'sniper', 'minigun', 'railgun', 'blocks', 'nade'];
const ICON = { fists: '👊', pistol: '🔫', rifle: '🪖', shotgun: '💥', sniper: '🎯', minigun: '🌀', railgun: '⚡', blocks: '🧱', nade: '💣', grenade: '💣' };
const BASIC = ['pistol', 'rifle', 'shotgun', 'sniper'];
// which guns a fighter starts with (match setting): all / pistol only / none (fists only)
function startLoadout(f) {
  if (f.owned && f.deaths > 0 && G.mode !== 'waves' && rules().death === 'keep') { if (GUNS[f.weapon] && !f.owned.has(f.weapon)) f.weapon = [...f.owned].pop() || 'fists'; return; }   // keeps what they had
  const st = G.mode === 'waves' ? 'all' : (rules().start || 'all');
  f.owned = new Set(['fists'].concat(st === 'all' ? BASIC : st === 'pistol' ? ['pistol'] : []));
  if (f.bot) { if (!f.owned.has(f.pref)) f.weapon = f.owned.has('pistol') ? 'pistol' : 'fists'; else f.weapon = f.pref; }
  else if (!f.owned.has(f.weapon)) f.weapon = f.owned.has('rifle') ? 'rifle' : f.owned.has('pistol') ? 'pistol' : 'fists';
}
for (const k of SLOTS) VM[k] = gunModel(k);
const LEVELS = {
  easy: { think: 0.55, react: 0.9, turn: 3.5, spread: 3.2, dmg: 0.45, err: 0.15, nade: 0 },
  medium: { think: 0.38, react: 0.5, turn: 6, spread: 1.9, dmg: 0.7, err: 0.075, nade: 0.012 },
  hard: { think: 0.24, react: 0.28, turn: 10, spread: 1.15, dmg: 0.9, err: 0.035, nade: 0.03 }
};
const PREF = { fists: 1.2, pistol: 12, rifle: 16, shotgun: 5, sniper: 30, minigun: 14, railgun: 34 };
const COLORS = [0xe5484d, 0x3e8ef7, 0x2fbf71, 0xf5a524, 0xa855f7, 0x14b8a6, 0xf97316, 0xec4899, 0x84cc16, 0x0ea5e9];
const BOTN = ['Omar', 'Lina', 'Yousef', 'Mona', 'Karim', 'Nour', 'Ziad', 'Hana', 'Tarek', 'Salma', 'Adam', 'Rana', 'Fady', 'Laila'];
const SHIELD_MAX = 100;
const GRAV = 22, JUMP = 7.6, ONLINE_TARGET = 15, DM_TARGET = 20;

// ---------------------------------------------------------------------
// game state and fighters (you, bots and online players share one shape)
// ---------------------------------------------------------------------
const G = { mode: null, world: null, fighters: [], me: null, t: 0, running: false, paused: false, over: false, ads: false, fireHeld: false, fired: false,
  shake: 0, kick: 0, diff: 'medium', bots: 5, wave: 0, waveLeft: 0, waveSpawnT: 0, waveBreak: 0, hurtA: 0, hurtFrom: null, endT: 0, opts: null };
// match rules: kills to win (0 = no limit), lives (0 = unlimited), hardcore (one hit kills, one life)
function rules() {
  const c = (G.mode === 'online' ? NET.cfg : G.opts) || {}, hard = !!c.hardcore;
  return { target: c.target != null ? +c.target : (G.mode === 'online' ? ONLINE_TARGET : DM_TARGET), lives: hard ? 1 : (+c.lives || 0), hardcore: hard,
    start: c.start || 'all', pickups: c.pickups || (G.mode === 'online' ? 'off' : 'normal'),
    drops: c.drops || 'off', ammo: c.ammo === 'inf' ? 'inf' : 'normal', reload: ['custom', 'none'].includes(c.reload) ? c.reload : 'normal', reloadT: clamp(+c.reloadT || 1.5, 0.1, 15), death: ['keep', 'drop'].includes(c.death) ? c.death : 'lose', shield: c.shield !== 'off',
    php: clamp(+c.php || 100, 1, 1000), psh: clamp(+c.psh || 0, 0, 1000), bhp: clamp(+c.bhp || 100, 1, 1000), bsh: clamp(+c.bsh || 0, 0, 1000), shmax: clamp(+c.shmax || 100, 1, 1000), bhps: Array.isArray(c.bhps) ? c.bhps : null };
}
const aliveCount = () => { const fs = G.fighters.filter(f => !(G.mode === 'waves' && f.bot && !f.alive)); return (rules().lives > 0 ? fs.filter(f => !isOut(f)) : fs.filter(f => f.alive)).length + '/' + fs.length; };
const isOut = (f) => G.mode !== 'waves' && rules().lives > 0 && f.deaths >= rules().lives;   // no lives left: stays dead
const myName = () => (window.Auth && Auth.name && Auth.name()) || t('vs_player');
function newFighter(o) {
  const f = Object.assign({ id: Math.random().toString(36).slice(2, 10), name: 'Player', color: COLORS[0], bot: false, local: false, remote: false,
    pos: new V3(), vel: new V3(), yaw: 0, pitch: 0, hp: 100, maxHp: 100, alive: false, kills: 0, deaths: 0, weapon: 'rifle', mag: {}, res: {},
    nades: 2, blocks: 20, fireCD: 0, reloadT: 0, heat: 0, onGround: false, wall: false, respawnAt: 0, deadT: 0, spawnT: -9, walk: 0, ai: {}, lv: 'medium', hurtT: -9 }, o);
  f.model = makeModel(f.color); scene.add(f.model.root); f.model.root.visible = false;
  if (!f.local) { f.tag = nameTag(f.name, '#' + f.color.toString(16).padStart(6, '0')); f.model.root.add(f.tag); f.hpb = hpBar(); f.model.root.add(f.hpb); }
  refill(f); G.fighters.push(f); return f;
}
function refill(f) { const inf = rules().ammo === 'inf'; for (const k of GUN_KEYS) { f.mag[k] = GUNS[k].mag; f.res[k] = inf ? Infinity : GUNS[k].res; } f.nades = 2; f.blocks = 20; if (f.owned) startLoadout(f); }
function removeFighter(f) { scene.remove(f.model.root); G.fighters = G.fighters.filter(x => x !== f); }
const eye = (f) => new V3(f.pos.x, f.pos.y + 1.55, f.pos.z);
const dirOf = (yaw, pitch) => new V3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
function spawnPoint(f, far) {
  const pts = G.world.spawns; let best = pts[0], bs = -1;
  for (let i = 0; i < 16; i++) {
    const p = pts[Math.floor(Math.random() * pts.length)]; let md = 1e9;
    for (const o of G.fighters) if (o !== f && o.alive && (!far || !o.bot)) md = Math.min(md, o.pos.distanceTo(p));
    if (md > bs) { bs = md; best = p; }
  }
  return best;
}
function spawn(f) {
  if (G.mode !== 'waves') { const R = rules();
    if (f.local) { f.maxHp = R.php; f.shStart = R.psh; } else if (f.bot && !f.remote) { f.maxHp = (R.bhps && R.bhps[f.idx]) || R.bhp; f.shStart = R.bsh; } }
  if (!f.remote) f.shMax = G.mode !== 'waves' ? rules().shmax : SHIELD_MAX;
  f.pos.copy(spawnPoint(f, G.mode === 'waves' && f.bot)); f.vel.set(0, 0, 0); f.hp = f.maxHp; f.shield = Math.min(f.shStart || 0, f.shMax || SHIELD_MAX); f.alive = true; refill(f);
  f.yaw = Math.atan2(-(W / 2 - f.pos.x), -(D / 2 - f.pos.z)); f.pitch = 0; f.reloadT = 0; f.fireCD = 0.3; f.heat = 0; f.spawnT = G.t;
  f.model.root.rotation.set(0, 0, 0); f.ai = {}; startLoadout(f);
  if (f.local) { $('dead').hidden = true; $('dead').classList.remove('spec'); G.spec = null; G.ads = false; hudAll(); }
}
function addBot(lv, i) {
  const b = newFighter({ bot: true, lv, idx: i, name: '🤖 ' + BOTN[(i + (G.botOff || 0)) % BOTN.length] + (i >= BOTN.length && G.mode !== 'waves' ? ' ' + (Math.floor(i / BOTN.length) + 1) : ''), color: COLORS[(i + 1) % COLORS.length] });
  const r = Math.random(); b.weapon = b.pref = r < 0.45 ? 'rifle' : r < 0.65 ? 'shotgun' : r < 0.82 ? 'sniper' : 'pistol';
  return b;
}

// ---------------------------------------------------------------------
// shooting
// ---------------------------------------------------------------------
function rayBox(o, d, mn, mx) {
  let t0 = 0, t1 = 1e9;
  for (const a of ['x', 'y', 'z']) {
    if (Math.abs(d[a]) < 1e-9) { if (o[a] < mn[a] || o[a] > mx[a]) return -1; continue; }
    let ta = (mn[a] - o[a]) / d[a], tb = (mx[a] - o[a]) / d[a]; if (ta > tb) { const s = ta; ta = tb; tb = s; }
    t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return -1;
  }
  return t0;
}
function rayFighter(o, d, f) {
  const p = f.pos;
  const hd = rayBox(o, d, { x: p.x - 0.25, y: p.y + 1.42, z: p.z - 0.25 }, { x: p.x + 0.25, y: p.y + 1.9, z: p.z + 0.25 });
  const bd = rayBox(o, d, { x: p.x - 0.32, y: p.y, z: p.z - 0.32 }, { x: p.x + 0.32, y: p.y + 1.42, z: p.z + 0.32 });
  if (hd >= 0 && (bd < 0 || hd <= bd + 0.02)) return { t: hd, head: true };
  if (bd >= 0) return { t: bd, head: false };
  return null;
}
function trace(shooter, o, d, range) {
  const wh = G.world.raycast(o, d, range); let best = null, bt = wh ? wh.dist : range;
  for (const f of G.fighters) {
    if (f === shooter || !f.alive) continue; if (G.mode === 'waves' && shooter.bot && f.bot) continue;
    const h = rayFighter(o, d, f); if (h && h.t < bt) { bt = h.t; best = { f, head: h.head }; }
  }
  const point = o.clone().addScaledVector(d, bt);
  if (best) return { type: 'f', f: best.f, head: best.head, point, t: bt };
  if (wh) return { type: 'b', h: wh, point, t: bt };
  return { type: 'n', point, t: bt };
}
function muzzlePos(f) {
  if (f.local) { const d = dirOf(f.yaw, f.pitch), r = new V3(Math.cos(f.yaw), 0, -Math.sin(f.yaw)); return eye(f).addScaledVector(d, 0.6).addScaledVector(r, G.ads ? 0 : 0.18).add(new V3(0, G.ads ? -0.06 : -0.16, 0)); }
  const d = dirOf(f.yaw, f.pitch), r = new V3(Math.cos(f.yaw), 0, -Math.sin(f.yaw)); return new V3(f.pos.x, f.pos.y + 1.36, f.pos.z).addScaledVector(r, 0.33).addScaledVector(d, 1.0);
}
const hearVol = (p) => G.me ? clamp(1 - p.distanceTo(G.me.pos) / 75, 0, 1) : 0.5;
function fire(f) {
  if (!f.alive || f.weapon === 'nade') return false;
  if (f.weapon === 'blocks') return placeBlock(f);
  const g = GUNS[f.weapon];
  if (f.fireCD > 0 || f.reloadT > 0) return false;
  if (f.mag[f.weapon] <= 0 && rules().reload === 'none') finishReload(f);   // no reloading: shoot straight from the reserve
  if (f.mag[f.weapon] <= 0) { if (f.local) sfx.empty(); startReload(f); f.fireCD = 0.25; return false; }
  f.mag[f.weapon]--; f.fireCD = g.rate;
  const o = eye(f), base = dirOf(f.yaw, f.pitch), ads = f.local && G.ads;
  let spread = ads && g.ads != null ? g.ads : g.spread * (ads ? 0.45 : 1);
  spread *= 1 + (Math.hypot(f.vel.x, f.vel.z) > 1.2 ? 0.8 : 0) + (f.onGround ? 0 : 1.6) + f.heat;
  if (f.bot) spread *= LEVELS[f.lv].spread;
  f.heat = Math.min(2.2, f.heat + g.heat);
  const ends = [], mz = muzzlePos(f);
  for (let i = 0; i < g.pellets; i++) {
    const d = base.clone();
    if (spread > 0) { d.x += (Math.random() - 0.5) * 2 * spread; d.y += (Math.random() - 0.5) * 2 * spread; d.z += (Math.random() - 0.5) * 2 * spread; d.normalize(); }
    const h = trace(f, o, d, g.range); ends.push(h.point);
    if (h.type === 'f') {
      let dmg = g.dmg * (h.head ? g.head : 1);
      if (g.falloff && h.t > g.falloff[0]) dmg *= Math.max(0.25, 1 - (h.t - g.falloff[0]) / (g.falloff[1] - g.falloff[0]));
      if (f.bot) dmg *= G.mode === 'waves' ? LEVELS[f.lv].dmg * (1 + Math.max(0, G.wave - 6) * 0.06) : LEVELS[f.lv].dmg;
      hitFighter(f, h.f, dmg, h.head, f.weapon);
      burst(h.point, 0xcc3333, 3, 2.5, 0.06, 0.35);
    } else if (h.type === 'b') hitBlock(f, h.h, h.point, d, g);
    if (!g.melee && (i < 3 || f.local)) tracer(mz, h.point);
  }
  if (f.local) {
    shotSound(f.weapon, 1); G.kick = 1; f.pitch = clamp(f.pitch + g.kick * (0.7 + Math.random() * 0.6), -1.5, 1.5); f.yaw += (Math.random() - 0.5) * g.kick * 0.5;
    const fl = VM[f.weapon].userData.flash; fl.visible = true; fl.rotation.z = Math.random() * 3; setTimeout(() => fl.visible = false, 45);
    if (G.mode === 'online') send('shot', { id: f.id, w: f.weapon, o: arr(mz), e: ends.slice(0, 9).map(arr) });
    hudAmmo();
  } else {
    shotSound(f.weapon, hearVol(f.pos)); burst(mz, 0xffd25a, 2, 1, 0.08, 0.08);
    if (G.mode === 'online' && f.bot && !f.remote) NET.botQ.s.push([f.weapon, arr(mz), ends.slice(0, 3).map(arr)]);
  }
  return true;
}
function hitFighter(shooter, target, dmg, head, w) {
  if (shooter.local) { hitMark(false); head ? sfx.head() : sfx.hit(); }
  if (G.mode === 'online') {
    if (!sim(shooter)) return;
    if (!target.remote) { damage(target, dmg, shooter, head, w); return; }          // you or a bot you host
    if (shooter.bot) NET.botQ.h.push([shooter.id, target.id, Math.round(dmg), head ? 1 : 0, w]);
    else send('hit', { id: shooter.id, to: target.id, dmg: Math.round(dmg), h: head, w });
    return;
  }
  damage(target, dmg, shooter, head, w);
}
function hitBlock(f, h, point, d, g) {
  const def = BLOCKS[h.b]; burst(point.clone().addScaledVector(d, -0.05), def.color, 4, 3, 0.07, 0.4);
  if (G.mode === 'online' && !sim(f)) return;          // online, every player breaks blocks with their own shots
  if (def.hp && G.world.damageBlock(h.x, h.y, h.z, g.dmg >= 60 ? 4 : 1)) {
    burst(new V3(h.x + 0.5, h.y + 0.5, h.z + 0.5), def.color, 14, 5, 0.14, 0.9);
    if (G.mode === 'online') send('blk', { x: h.x, y: h.y, z: h.z, b: 0 });
  }
}
function damage(t, dmg, a, head, w) {
  if (!t.alive || G.over || G.t - t.spawnT < 1.2) return;
  if (G.mode !== 'waves' && rules().hardcore && dmg > 0) dmg = Math.max(dmg, t.hp + (t.shield || 0));
  if (t.shield > 0 && dmg > 0) { const s = Math.min(t.shield, dmg); t.shield -= s; dmg -= s; t.hurtT = G.t; if (t.local) { sfx.hurt(); hudHp(); } if (dmg <= 0) return; }   // spare health takes the hit first
  t.hp -= dmg; t.hurtT = G.t;
  if (t.local) { G.hurtA = Math.min(1, G.hurtA + dmg / 60); G.hurtFrom = a && a !== t ? a.pos.clone() : null; sfx.hurt(); hudHp(); }
  if (t.bot && a && a !== t && !(G.mode === 'waves' && a.bot)) { t.ai.target = a; t.ai.seen = G.t; t.ai.last = a.pos.clone(); }
  if (t.hp <= 0) die(t, a, w, head);
}
function die(t, a, w, head) {
  t.alive = false; t.hp = 0; t.deaths++; t.deadT = G.t;
  if (a && a !== t) a.kills++;
  feed(a, t, w, head);
  if (a && a.local && a !== t) { sfx.kill(); hitMark(true); STATS.kills++; saveStats(); }
  if (G.mode === 'online' && sim(t)) send('kill', { k: a ? a.id : null, v: t.id, w, h: head });
  dropLoot(t); dropGear(t);
  t.respawnAt = isOut(t) ? Infinity : G.t + 3.5;
  if (t.local) { G.ads = false; G.fireHeld = false; G.nadeAim = false; showDead(a); }
  checkEnd();
}
// the room's rules arrived (or changed): apply them to me right away — infinite ammo, and my health/shield if I just spawned
function cfgToMe() {
  const me = G.me; if (!me || G.mode !== 'online') return; const R = rules();
  if (R.ammo === 'inf') for (const k of GUN_KEYS) me.res[k] = Infinity;
  if (me.alive && G.t - me.spawnT < 4) { me.maxHp = R.php; me.hp = R.php; me.shMax = R.shmax; me.shield = Math.min(R.psh, R.shmax); me.shStart = R.psh; }
  hudAll();
}
function startReload(f) {
  if (GUNS[f.weapon] && rules().ammo === 'inf') f.res[f.weapon] = Infinity;   // infinite ammo covers every gun, picked-up ones too
  const g = GUNS[f.weapon]; if (!g || f.reloadT > 0 || f.mag[f.weapon] >= g.mag || f.res[f.weapon] <= 0) return;
  const R = rules(); if (R.reload === 'none') { finishReload(f); return; }
  f.reloadT = R.reload === 'custom' ? R.reloadT : g.reload; if (f.local) { sfx.reload(); G.ads = false; hudAmmo(); }
}
function finishReload(f) { const w = f.weapon, g = GUNS[w]; if (rules().ammo === 'inf') f.res[w] = Infinity; const take = Math.min(g.mag - f.mag[w], f.res[w]); f.mag[w] += take; f.res[w] -= take; if (f.local) hudAmmo(); }
function switchWeapon(f, k) { if (!f.alive || f.weapon === k) return; if (GUNS[k] && f.owned && !f.owned.has(k)) { if (f.local) sfx.empty(); return; } if (k === 'nade' && f.nades <= 0) { if (f.local) sfx.empty(); return; } if (f.weapon !== 'nade') f.prevWeapon = f.weapon; G.nadeAim = f.local ? false : G.nadeAim; f.weapon = k; f.reloadT = 0; f.fireCD = Math.max(f.fireCD, 0.28); if (f.local) { G.ads = false; G.fired = false; hudAll(); } }
function placeBlock(f) {
  if (f.fireCD > 0 || f.blocks <= 0) return false;
  const h = G.world.raycast(eye(f), dirOf(f.yaw, f.pitch), 5.5); if (!h) return false;
  const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
  if (y < 1 || y >= H - 1 || x < 1 || z < 1 || x >= W - 1 || z >= D - 1 || G.world.get(x, y, z)) return false;
  for (const o of G.fighters) if (o.alive && x + 1 > o.pos.x - 0.3 && x < o.pos.x + 0.3 && y + 1 > o.pos.y && y < o.pos.y + 1.8 && z + 1 > o.pos.z - 0.3 && z < o.pos.z + 0.3) return false;
  G.world.set(x, y, z, B.PLANK); f.blocks--; f.fireCD = 0.16;
  if (f.local) { sfx.place(); hudAmmo(); G.kick = 0.4; }
  if (G.mode === 'online') send('blk', { x, y, z, b: B.PLANK });
  return true;
}

// grenades
const nades = [], nadeMat = lam(0x3f5a2a);
function nadeStart(f) {                                  // where a grenade leaves the hand and how fast
  const d = dirOf(f.yaw, f.pitch + 0.12), o = eye(f).addScaledVector(d, 0.5);
  return { o, v: d.multiplyScalar(f.bot ? 13 : 21).add(new V3(f.vel.x * 0.5, 2, f.vel.z * 0.5)) };
}
function nadeStep(p, v, dt) {                             // same flight as a real grenade: gravity + bounces
  v.y -= 20 * dt;
  for (const ax of ['x', 'y', 'z']) {
    const old = p[ax]; p[ax] += v[ax] * dt;
    if (G.world.solid(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z))) { p[ax] = old; v[ax] *= -0.42; if (ax === 'y') { v.x *= 0.7; v.z *= 0.7; } }
  }
}
// hold G (or the 💣 button) to see the arc and where it will blow up; let go to throw
const arcGeo = new THREE.BufferGeometry(); arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 70), 3));
const arcLine = new THREE.Line(arcGeo, new THREE.LineDashedMaterial({ color: 0xffe08a, dashSize: 0.35, gapSize: 0.22, transparent: true, opacity: 0.95, depthTest: false }));
arcLine.frustumCulled = false; arcLine.visible = false; arcLine.renderOrder = 5; scene.add(arcLine);
const arcRing = new THREE.Mesh(new THREE.RingGeometry(4.3, 4.6, 48), new THREE.MeshBasicMaterial({ color: 0xff5d5d, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
arcRing.rotation.x = -Math.PI / 2; arcRing.visible = false; scene.add(arcRing);
const arcDot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5d5d })); arcDot.visible = false; scene.add(arcDot);
function updArc() {
  const me = G.me, on = G.nadeAim && me && me.alive && me.nades > 0 && !G.paused && !G.over;
  arcLine.visible = arcRing.visible = arcDot.visible = !!on; if (!on) return;
  const { o, v } = nadeStart(me), pos = arcGeo.attributes.position; let n = 0;
  for (let i = 0; i <= 63 && n < 70; i++) { pos.setXYZ(n++, o.x, o.y, o.z); nadeStep(o, v, 1 / 30); }
  for (let i = n; i < 70; i++) pos.setXYZ(i, o.x, o.y, o.z);
  pos.needsUpdate = true; arcGeo.computeBoundingSphere(); arcLine.computeLineDistances();
  arcDot.position.copy(o); arcRing.position.set(o.x, o.y - 0.15, o.z);
}
function throwNade(f) {
  if (f.nades <= 0 || !f.alive) return; f.nades--;
  const { o, v } = nadeStart(f);
  addNade(f, o, v, true); if (f.local) { hudAmmo(); hudSlots(); beep(420, 0.06, 'triangle', 0.1); if (f.nades <= 0 && f.weapon === 'nade') switchWeapon(f, f.prevWeapon || 'rifle'); }
  if (G.mode === 'online' && sim(f)) send('nade', { id: f.id, o: arr(o), v: arr(v) });
}
function addNade(owner, o, v, real) { const m = new THREE.Mesh(box(0.16, 0.2, 0.16), nadeMat); m.position.copy(o); scene.add(m); nades.push({ owner, p: o.clone(), v: v.clone(), t: 2.1, m, real }); }
function updNades(dt) {
  for (let i = nades.length - 1; i >= 0; i--) {
    const n = nades[i]; n.t -= dt; nadeStep(n.p, n.v, dt);
    n.m.position.copy(n.p); n.m.rotation.x += dt * 8; n.m.rotation.z += dt * 5;
    if (n.t <= 0) {
      scene.remove(n.m); nades.splice(i, 1);
      if (n.real) { boom(n.p, n.owner); if (G.mode === 'online') send('boom', { id: n.owner.id, p: arr(n.p) }); }
    }
  }
}
function boom(p, owner) {
  const removed = G.world.explode(p.x, p.y, p.z, 2.6);
  for (const r of removed.slice(0, 45)) burst(new V3(r[0] + 0.5, r[1] + 0.5, r[2] + 0.5), BLOCKS[r[3]].color, 1, 7, 0.2, 1.2);
  burst(p, 0xffb347, 26, 9, 0.22, 0.55); burst(p, 0x8a8a8a, 14, 4, 0.16, 0.9); flashSphere(p);
  const dme = G.me ? G.me.pos.distanceTo(p) : 50; shotSound('boom', clamp(1.25 - dme / 60, 0.1, 1)); G.shake = Math.max(G.shake, clamp(1 - dme / 20, 0, 1) * 0.6);
  for (const f of G.fighters) {
    if (!f.alive || (G.mode === 'online' && !sim(f)) || (G.mode === 'waves' && owner && owner.bot && f.bot)) continue;
    const c = new V3(f.pos.x, f.pos.y + 0.9, f.pos.z), d = c.distanceTo(p); if (d > 4.6) continue;
    const k = 1 - d / 4.6; let dmg = 125 * k; if (f === owner) dmg *= 0.5;
    f.vel.add(c.clone().sub(p).normalize().multiplyScalar(9 * k)); f.vel.y += 3 * k;
    damage(f, dmg, owner, false, 'grenade');
  }
}
// pick-ups: dropped by bots, and (match setting) spawned around the map for everyone to race to
const pickups = [];
const PICK = { hp: new THREE.MeshBasicMaterial({ color: 0x2fbf71 }), ammo: new THREE.MeshBasicMaterial({ color: 0xf5a524 }), gun: new THREE.MeshBasicMaterial({ color: 0x8ea0ff }), power: new THREE.MeshBasicMaterial({ color: 0xff5fd2 }) };
const CRATE_GUNS = [['railgun', 3], ['minigun', 3], ['sniper', 2], ['shotgun', 1.2], ['rifle', 1]];
const PK_KINDS = [['hp', 5], ['ammo', 3], ['rifle', 2], ['shotgun', 2], ['sniper', 1.5], ['pistol', 1], ['minigun', 1], ['railgun', 0.8]];
function crateMesh() {
  const g = new THREE.Group(), wood = new THREE.MeshLambertMaterial({ color: 0x9a6a32 }), band = new THREE.MeshLambertMaterial({ color: 0xf5c518 });
  g.add(new THREE.Mesh(box(0.95, 0.75, 0.95), wood));
  for (const y of [-0.25, 0.25]) { const b = new THREE.Mesh(box(0.99, 0.1, 0.99), band); b.position.y = y; g.add(b); }
  const chute = new THREE.Group(), cloth = new THREE.MeshLambertMaterial({ color: 0xe5484d, side: THREE.DoubleSide }), white = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  for (let i = 0; i < 8; i++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.7, 0.9, 3, 1, true, i * Math.PI / 4, Math.PI / 4), i % 2 ? white : cloth); seg.position.y = 2.6; chute.add(seg); }
  const lineM = new THREE.LineBasicMaterial({ color: 0xdddddd });
  for (const [x, z] of [[1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]]) chute.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(0, 0.4, 0), new V3(x, 2.15, z)]), lineM));
  g.add(chute); g.userData.chute = chute;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 30, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: 0.35, depthWrite: false }));
  beam.position.y = 15; beam.visible = false; g.add(beam); g.userData.beam = beam;
  const tag = nameTag('📦', '#f5c518'); tag.position.y = 1.0; tag.scale.multiplyScalar(0.8); g.add(tag);
  return g;
}
function pickupMesh(kind) {
  if (kind === 'crate') return crateMesh();
  const g = new THREE.Group(), mat = kind === 'hp' ? PICK.hp : kind === 'ammo' ? PICK.ammo : GUNS[kind] && GUNS[kind].power ? PICK.power : PICK.gun;
  const c = new THREE.Mesh(box(kind === 'hp' || kind === 'ammo' ? 0.42 : 0.6, kind === 'hp' || kind === 'ammo' ? 0.42 : 0.22, kind === 'hp' || kind === 'ammo' ? 0.42 : 0.22), mat); g.add(c);
  if (kind === 'hp') { const x1 = new THREE.Mesh(box(0.44, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff })); g.add(x1); const x2 = x1.clone(); x2.rotation.z = Math.PI / 2; g.add(x2); }
  const tag = nameTag(ICON[kind] || (kind === 'hp' ? '❤' : '📦'), kind === 'hp' ? '#2fbf71' : GUNS[kind] && GUNS[kind].power ? '#ff5fd2' : '#f5a524'); tag.position.y = 0.75; tag.scale.multiplyScalar(0.7); g.add(tag);
  return g;
}
function addPickup(kind, pos, ttl, id) {
  const m = pickupMesh(kind); m.position.copy(pos); scene.add(m);
  const p = { kind, m, t: ttl || 25, id: id || 'p' + Math.random().toString(36).slice(2, 8), base: pos.y }; pickups.push(p);
  if (kind === 'crate') { const gy = G.world.groundAt(Math.floor(pos.x), Math.floor(pos.z)) + 0.38; if (pos.y > gy + 0.05) p.fall = gy; else { p.base = gy; landCrate(p); } }
  return p;
}
function landCrate(p) { p.fall = null; p.m.position.y = p.base; p.m.userData.chute.visible = false; p.m.userData.beam.visible = true; if (G.me && p.m.position.distanceTo(G.me.pos) < 40) sfx.land && sfx.land(); }
const pickW = (list, skip) => { const l = list.filter(([k]) => !skip || !skip.has(k)), use = l.length ? l : list; let tot = 0; for (const [, w] of use) tot += w; let x = Math.random() * tot; for (const [k, w] of use) { x -= w; if (x <= 0) return k; } return use[0][0]; };
// supply drops: a crate on a parachute every so often (the same player who spawns pickups spawns these)
G.dropT = 0;
function dropSpawner(dt) {
  const r = rules(); if (G.mode === 'waves' || !r.drops || r.drops === 'off' || G.over) return;
  if (G.mode === 'online' && [...NET.peers.keys()].some(id => id < G.me.id)) return;
  if (!G.dropT) G.dropT = r.drops === 'lots' ? 10 : 22;
  G.dropT -= dt; if (G.dropT > 0) return;
  G.dropT = (r.drops === 'lots' ? 18 : 40) * (0.7 + Math.random() * 0.6);
  if (pickups.filter(p => p.kind === 'crate').length >= (r.drops === 'lots' ? 4 : 2)) return;
  const x = 4 + Math.floor(Math.random() * (W - 8)) + 0.5, z = 4 + Math.floor(Math.random() * (D - 8)) + 0.5;
  const pos = new V3(x, G.world.groundAt(Math.floor(x), Math.floor(z)) + 32, z);
  const p = addPickup('crate', pos, 90); p.map = true;
  banner(t('vs_dropIn'), 1.6); sfx.wave();
  if (G.mode === 'online') send('pk', { a: 'add', id: p.id, k: 'crate', p: arr(pos) });
}
// (SHIELD_MAX is defined near the top)
function heal(f, n) {   // fills health first; whatever is left over becomes spare health (shield) when that rule is on
  const room = Math.max(0, f.maxHp - f.hp), use = Math.min(room, n); f.hp += use;
  let extra = 0; if (G.mode !== 'waves' && rules().shield) { extra = Math.min(n - use, (f.shMax || SHIELD_MAX) - (f.shield || 0)); if (extra > 0) f.shield = (f.shield || 0) + extra; else extra = 0; }
  return { hp: use, shield: extra };
}
const canHeal = (f) => f.hp < f.maxHp || (G.mode !== 'waves' && rules().shield && (f.shield || 0) < (f.shMax || SHIELD_MAX));
function collect(f, p) {
  const k = p.kind;
  if (k === 'crate') {
    if (p.fall != null) return false;
    const w = pickW(CRATE_GUNS, f.owned); if (!f.owned) f.owned = new Set(['fists']); f.owned.add(w);
    heal(f, 100); const infA = G.mode !== 'waves' && rules().ammo === 'inf'; for (const g of GUN_KEYS) { f.mag[g] = GUNS[g].mag; if (infA) f.res[g] = Infinity; else if (isFinite(f.res[g])) f.res[g] = Math.max(f.res[g], GUNS[g].res); } f.nades = Math.min(3, f.nades + 1); f.blocks += 10;
    f.weapon = w; f.reloadT = 0; if (f.local) { G.ads = false; sfx.pickup(); banner(t('vs_crate', { w: t('vs_' + w) }), 2); hudAll(); }
    return true;
  }
  let healed = null;
  if (k === 'hp') { if (!canHeal(f)) return false; healed = heal(f, 50); }
  else if (k === 'ammo') { for (const g of GUN_KEYS) if (isFinite(f.res[g])) f.res[g] = Math.min(GUNS[g].res * 1.5 + GUNS[g].mag, f.res[g] + GUNS[g].mag); f.nades = Math.min(3, f.nades + 1); f.blocks += 5; }
  else if (GUNS[k]) { const had = f.owned && f.owned.has(k); if (!f.owned) f.owned = new Set(['fists']); f.owned.add(k); f.mag[k] = GUNS[k].mag; if (isFinite(GUNS[k].res)) f.res[k] = Math.max(f.res[k] || 0, GUNS[k].res); if (G.mode !== 'waves' && rules().ammo === 'inf') f.res[k] = Infinity;
    if (!had && (f.bot || GUNS[k].power || !GUNS[f.weapon] || f.weapon === 'fists' || f.weapon === 'pistol')) { f.weapon = k; if (f.local) { G.ads = false; } } }
  if (f.local) { sfx.pickup(); banner(k === 'hp' ? (healed && healed.shield && !healed.hp ? t('vs_shGot', { n: healed.shield }) : t('vs_heal') + (healed && healed.shield ? ' · ' + t('vs_shGot', { n: healed.shield }) : '')) : k === 'ammo' ? t('vs_ammo') : t('vs_got', { w: t('vs_' + k) || k }), 1.2); hudAll(); }
  return true;
}
function removePickup(p) { scene.remove(p.m); const i = pickups.indexOf(p); if (i >= 0) pickups.splice(i, 1); }
// the spawner: offline it's you; online it's whoever has the smallest id in the room (everyone else follows their messages)
G.pkT = 0;
function pickupSpawner(dt) {
  const r = rules(); if (G.mode === 'waves' || !r.pickups || r.pickups === 'off' || G.over) return;
  if (G.mode === 'online' && [...NET.peers.keys()].some(id => id < G.me.id)) return;
  const map = pickups.filter(p => p.map).length, cap = r.pickups === 'lots' ? 12 : 6;
  const burst = G.t < 4 && map < cap / 2;   // the match opens with half the map's pickups already out
  G.pkT -= dt; if ((G.pkT > 0 && !burst) || map >= cap) return;
  G.pkT = (r.pickups === 'lots' ? 5 : 11) * (0.7 + Math.random() * 0.6);
  const kinds = burst && r.start !== 'all' ? PK_KINDS.filter(([k]) => GUNS[k]) : PK_KINDS;   // nobody starts armed: the first drops are guns
  let tot = 0; for (const [, w] of kinds) tot += w; let x = Math.random() * tot, kind = kinds[0][0]; for (const [k, w] of kinds) { x -= w; if (x <= 0) { kind = k; break; } }
  const pts = G.world.spawns, sp = pts[Math.floor(Math.random() * pts.length)].clone(); sp.y += 0.6;
  const p = addPickup(kind, sp, 60); p.map = true;
  if (G.mode === 'online') send('pk', { a: 'add', id: p.id, k: kind, p: arr(sp) });
}
// "drop everything" rule: the dead player's guns land around them (whoever runs that player drops them, and tells the room)
function dropGear(t) {
  if (G.mode === 'waves' || rules().death !== 'drop' || !sim(t) || !t.owned) return;
  const guns = [...t.owned].filter(k => k !== 'fists' && GUNS[k]); if (!guns.length) return;
  guns.forEach((k, i) => {
    const a = (i / guns.length) * Math.PI * 2, pos = new V3(t.pos.x + Math.cos(a) * 0.9, t.pos.y + 0.6, t.pos.z + Math.sin(a) * 0.9);
    const p = addPickup(k, pos, 30); p.map = true;
    if (G.mode === 'online') send('pk', { a: 'add', id: p.id, k, p: arr(pos) });
  });
}
function dropLoot(t) {
  if (G.mode === 'online' || !t.bot || Math.random() > (G.mode === 'waves' ? 0.45 : 0.3)) return;
  const kind = Math.random() < 0.5 ? 'hp' : 'ammo', m = new THREE.Mesh(box(0.42, 0.42, 0.42), PICK[kind]);
  scene.remove(m); addPickup(kind, new V3(t.pos.x, t.pos.y + 0.5, t.pos.z), 25);
}
function updPickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    if (p.kind === 'crate') {   // falls on its parachute, then sits there with a light beam until someone opens it
      if (p.fall != null) { p.m.position.y -= dt * 4; p.m.rotation.y += dt * 0.6; if (p.m.position.y <= p.fall) { p.base = p.fall; landCrate(p); } continue; }
      p.t -= dt; if (p.t <= 0) { removePickup(p); continue; }
      for (const f of G.fighters) { if (!f.alive || !sim(f) || f.pos.distanceTo(p.m.position) > 1.9) continue; if (collect(f, p)) { if (G.mode === 'online' && p.map) send('pk', { a: 'take', id: p.id }); removePickup(p); break; } }
      continue;
    }
    p.t -= dt; p.m.rotation.y += dt * 2; p.m.position.y = p.base + Math.sin(G.t * 3 + i) * 0.12;
    if (p.t <= 0) { removePickup(p); continue; }
    // whoever this screen runs (you, and the bots you host) can grab it
    for (const f of G.fighters) {
      if (!f.alive || !sim(f) || f.pos.distanceTo(p.m.position) > 1.6) continue;
      if (collect(f, p)) { if (G.mode === 'online' && p.map) send('pk', { a: 'take', id: p.id }); removePickup(p); break; }
    }
  }
}

// ---------------------------------------------------------------------
// bots
// ---------------------------------------------------------------------
function huntGoal(b) {
  const foes = G.fighters.filter(f => f !== b && f.alive && !(G.mode === 'waves' && f.bot));
  if (foes.length && (G.mode === 'waves' || Math.random() < 0.65)) return foes[Math.floor(Math.random() * foes.length)].pos.clone();
  const s = G.world.spawns; return s[Math.floor(Math.random() * s.length)].clone();
}
function botUpdate(b, dt) {
  const L = LEVELS[b.lv], ai = b.ai, e = eye(b);
  ai.think = (ai.think || 0) - dt; ai.react = (ai.react || 0) - dt; ai.strafeT = (ai.strafeT || 0) - dt; ai.turnT = (ai.turnT || 0) - dt;
  if (ai.think <= 0) {
    ai.think = L.think * (0.7 + Math.random() * 0.6); ai.err = (Math.random() - 0.5) * L.err * 2; ai.errP = (Math.random() - 0.5) * L.err;
    let best = null, bd = 1e9;
    for (const f of G.fighters) {
      if (f === b || !f.alive || (G.mode === 'waves' && f.bot)) continue;
      const d = f.pos.distanceTo(b.pos); if (d > 75 || d > bd) continue;
      if (G.world.clear(e, new V3(f.pos.x, f.pos.y + 1.4, f.pos.z))) { bd = d; best = f; }
    }
    if (best) { if (ai.target !== best || !ai.vis) ai.react = L.react * (0.7 + Math.random() * 0.6); ai.target = best; ai.vis = true; ai.seen = G.t; ai.last = best.pos.clone(); }
    else { ai.vis = false; if (ai.target && (G.t - ai.seen > 6 || !ai.target.alive)) ai.target = null; }
    const unarmed = b.weapon === 'fists' || (b.hp < 45 && pickups.some(p => p.kind === 'hp'));
    const want = pickups.filter(p => (p.kind === 'crate' ? p.fall == null : b.weapon === 'fists' ? GUNS[p.kind] && p.kind !== 'fists' : (b.hp < 45 ? p.kind === 'hp' : GUNS[p.kind] && GUNS[p.kind].power && !b.owned.has(p.kind))) && p.m.position.distanceTo(b.pos) < 45)
      .sort((a, c) => a.m.position.distanceTo(b.pos) - c.m.position.distanceTo(b.pos))[0];
    if (want && (unarmed || !ai.vis)) { ai.goal = want.m.position.clone(); ai.goalT = G.t; if (b.weapon === 'fists' && (!ai.target || !ai.vis || ai.target.pos.distanceTo(b.pos) > 6)) ai.vis = false; }
    else if (!ai.vis && (!ai.goal || b.pos.distanceTo(ai.goal) < 2.5 || G.t - (ai.goalT || 0) > 12)) { ai.goal = ai.target && ai.last ? ai.last.clone() : huntGoal(b); ai.goalT = G.t; }
    if (b.mag[b.weapon] === 0 && !ai.vis) startReload(b);
  }
  if (ai.strafeT <= 0) { ai.strafe = Math.random() < 0.2 ? 0 : Math.random() < 0.5 ? -1 : 1; ai.strafeT = 0.7 + Math.random() * 1.6; }
  let wx = 0, wz = 0, aim = null, dist = 0;
  const T = ai.target;
  if (ai.vis && T && T.alive) {
    const dx = T.pos.x - b.pos.x, dz = T.pos.z - b.pos.z; dist = Math.hypot(dx, dz) || 1;
    const fx = dx / dist, fz = dz / dist, pref = PREF[b.weapon], fwd = dist > pref + 3 ? 1 : dist < pref - 3 ? -0.6 : 0;
    wx = fx * fwd - fz * ai.strafe * 0.85; wz = fz * fwd + fx * ai.strafe * 0.85;
    aim = new V3(T.pos.x, T.pos.y + (b.lv === 'hard' && dist < 25 ? 1.55 : 1.1), T.pos.z);
  } else if (ai.goal) { const dx = ai.goal.x - b.pos.x, dz = ai.goal.z - b.pos.z, d = Math.hypot(dx, dz) || 1; wx = dx / d; wz = dz / d; }
  if (ai.turnT > 0) { const a = ai.turnDir * Math.PI / 2, c = Math.cos(a), s = Math.sin(a); const nx = wx * c - wz * s; wz = wx * s + wz * c; wx = nx; }
  const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
  // stuck against something: jump, and if that doesn't help, walk around it
  const moving = wl > 0.2, spd = Math.hypot(b.vel.x, b.vel.z);
  ai.stuck = moving && spd < 0.6 ? (ai.stuck || 0) + dt : 0;
  const jump = b.onGround && (b.wall || ai.stuck > 0.25) && moving;
  if (ai.stuck > 0.9 && ai.turnT <= 0) { ai.turnT = 0.9 + Math.random(); ai.turnDir = Math.random() < 0.5 ? -1 : 1; ai.stuck = 0; if (!ai.vis) ai.goal = huntGoal(b); }
  physics(b, dt, wx, wz, aim ? 4.2 : 4.8, jump);
  const look = aim || (ai.goal && moving ? new V3(b.pos.x + wx * 5, e.y, b.pos.z + wz * 5) : null);
  if (look) {
    const dx = look.x - e.x, dy = look.y - e.y, dz = look.z - e.z;
    const ty = Math.atan2(-dx, -dz) + (aim ? ai.err || 0 : 0), tp = Math.atan2(dy, Math.hypot(dx, dz)) + (aim ? ai.errP || 0 : 0);
    const k = Math.min(1, (aim ? L.turn : 5) * dt);
    b.yaw += angDiff(b.yaw, ty) * k; b.pitch += (tp - b.pitch) * k;
    if (aim && ai.react <= 0) {
      const off = Math.abs(angDiff(b.yaw, ty)) + Math.abs(tp - b.pitch);
      if (off < (b.weapon === 'shotgun' ? 0.22 : 0.1) + L.err && dist < GUNS[b.weapon].range * 0.9) fire(b);
      if (L.nade && b.nades > 0 && dist > 7 && dist < 17 && Math.random() < L.nade * dt * 10) throwNade(b);
    }
  }
}

// ---------------------------------------------------------------------
// movement
// ---------------------------------------------------------------------
function physics(f, dt, wx, wz, speed, jump) {
  const k = f.onGround ? 12 : 2.5;
  f.vel.x += (wx * speed - f.vel.x) * Math.min(1, k * dt);
  f.vel.z += (wz * speed - f.vel.z) * Math.min(1, k * dt);
  if (jump && f.onGround) { f.vel.y = JUMP; f.onGround = false; }
  f.vel.y = Math.max(f.vel.y - GRAV * dt, -40);
  const r = G.world.move(f.pos, f.vel, dt, 0.3, 1.8);
  f.onGround = r.ground; f.wall = r.wall;
  if (f.pos.y < -5) f.pos.y = G.world.groundAt(Math.floor(f.pos.x), Math.floor(f.pos.z));
}
const keys = {};
const key = (c) => keys[c] ? 1 : 0;
const TOUCH = { mx: 0, my: 0, jump: false, sprint: false };
// out of lives: fly the camera around to watch the rest of the match
function spectate(f, dt) {
  if (!G.spec) G.spec = { pos: new V3(f.pos.x, f.pos.y + 3, f.pos.z) };
  let mx = key('KeyD') - key('KeyA') + TOUCH.mx, mz = key('KeyS') - key('KeyW') + TOUCH.my, my = key('Space') - (key('ShiftLeft') || key('ControlLeft') ? 1 : 0);
  const d = dirOf(f.yaw, f.pitch), r = new V3(Math.cos(f.yaw), 0, -Math.sin(f.yaw)), sp = 14 * dt * (key('ShiftRight') ? 2 : 1);
  G.spec.pos.addScaledVector(d, -mz * sp).addScaledVector(r, mx * sp); G.spec.pos.y += my * sp;
  G.spec.pos.x = clamp(G.spec.pos.x, -10, W + 10); G.spec.pos.z = clamp(G.spec.pos.z, -10, D + 10); G.spec.pos.y = clamp(G.spec.pos.y, 1, 70);
}
function localUpdate(dt) {
  const f = G.me;
  if (!f.alive) {
    if (G.mode !== 'waves' && !G.over && G.t >= f.respawnAt && !isOut(f)) spawn(f);
    else { updDead(); if (isOut(f) && !G.paused) spectate(f, dt); }
    return;
  }
  if (G.paused) { physics(f, dt, 0, 0, 0, false); return; }
  let mx = key('KeyD') - key('KeyA') + TOUCH.mx, mz = key('KeyS') - key('KeyW') + TOUCH.my;
  const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
  const s = Math.sin(f.yaw), c = Math.cos(f.yaw), wx = mx * c + mz * s, wz = -mx * s + mz * c;
  const sprint = (key('ShiftLeft') || key('ShiftRight') || TOUCH.sprint) && mz < -0.3 && !G.ads;
  physics(f, dt, wx, wz, G.ads ? 3.3 : sprint ? 7.3 : 5.4, key('Space') || TOUCH.jump);
  if (G.fireHeld) {                                   // automatic guns keep firing; the others fire once per press
    const g = GUNS[f.weapon];
    if (f.weapon === 'blocks' || (g && g.auto)) fire(f); else if (!G.fired && fire(f)) G.fired = true;
  }
  // block outline while holding blocks
  ghost.visible = false;
  if (f.weapon === 'blocks') { const h = G.world.raycast(eye(f), dirOf(f.yaw, f.pitch), 5.5); if (h) { ghost.position.set(h.x + h.nx + 0.5, h.y + h.ny + 0.5, h.z + h.nz + 0.5); ghost.visible = true; } }
}
function common(f, dt) {
  f.fireCD -= dt; f.heat = Math.max(0, f.heat - dt * 2.4);
  if (f.reloadT > 0) { f.reloadT -= dt; if (f.reloadT <= 0) { f.reloadT = 0; finishReload(f); } }
}
function animate(f, dt) {
  const m = f.model;
  if (f.local) { m.root.visible = false; return; }
  if (!f.alive) {
    m.root.position.copy(f.pos); m.root.rotation.x = Math.max(-Math.PI / 2, m.root.rotation.x - dt * 5);
    m.root.visible = G.t - f.deadT < 2.5; if (f.tag) f.tag.visible = false; return;
  }
  m.root.visible = true; if (f.tag) f.tag.visible = true;
  m.root.position.copy(f.pos); m.root.rotation.set(0, f.yaw, 0);
  const sp = f.remote ? (f.spd || 0) : Math.hypot(f.vel.x, f.vel.z);
  f.walk += dt * sp * 2.2; const a = Math.sin(f.walk) * Math.min(0.75, sp / 6);
  m.legL.rotation.x = a; m.legR.rotation.x = -a;
  m.armR.rotation.x = Math.PI / 2 + f.pitch; m.armL.rotation.x = Math.PI / 2 + f.pitch - 0.05; m.armL.rotation.z = 0.35; m.head.rotation.x = f.pitch;
  m.gun.scale.y = f.weapon === 'pistol' ? 0.5 : f.weapon === 'sniper' ? 1.45 : f.weapon === 'shotgun' ? 1.1 : f.weapon === 'blocks' || f.weapon === 'nade' ? 0.32 : 1;
  m.shirt.emissive.setHex(G.t - f.hurtT < 0.12 ? 0x881111 : 0x000000);
}

// ---------------------------------------------------------------------
// modes
// ---------------------------------------------------------------------
function clearWorld() {
  for (const f of [...G.fighters]) removeFighter(f);
  for (const n of nades) scene.remove(n.m); nades.length = 0;
  for (const p of pickups) scene.remove(p.m); pickups.length = 0; G.pkT = 0; G.dropT = 0;
  parts.length = 0; ghost.visible = false;
  if (G.world) G.world.dispose(scene);
}
function buildWorld(seed) { if (G.world) G.world.dispose(scene); G.world = new VS.World(seed); G.world.flush(scene, terrainMat); }
function startGame(mode, opts) {
  if (mode === 'online' && window.Mal3abVersion && !Mal3abVersion.gate()) return;   // old app: no online play
  netLeave(); clearWorld();
  G.mode = mode; G.opts = opts || {}; G.over = false; G.botOff = Math.floor(Math.random() * BOTN.length); G.t = 0; G.diff = G.opts.diff || 'medium'; G.paused = false; G.ads = false; G.fireHeld = false; G.endT = 0;
  buildWorld(mode === 'online' ? seedFor(G.opts.code, 1) : G.opts.seed != null ? G.opts.seed : (Math.random() * 1e9) | 0);
  G.me = newFighter({ local: true, name: myName(), color: COLORS[Math.floor(Math.random() * COLORS.length)] });
  if (mode === 'dm') { const n = G.opts.bots != null ? G.opts.bots : 5; for (let i = 0; i < n; i++) addBot((G.opts.lvs && G.opts.lvs[i]) || G.diff, i); }
  for (const f of G.fighters) spawn(f);
  if (mode === 'waves') { G.wave = 0; G.waveBreak = 2.5; banner(t('vs_wave') + ' 1'); }
  if (mode === 'online') netStart(G.opts.code, G.opts.bots != null ? { bots: G.opts.bots, lv: G.opts.lv || 'medium', lvs: G.opts.lvs || null, target: G.opts.target, lives: G.opts.lives || 0, hardcore: !!G.opts.hardcore, start: G.opts.start || 'all', pickups: G.opts.pickups || 'off', drops: G.opts.drops || 'off', ammo: G.opts.ammo || 'normal', reload: G.opts.reload || 'normal', reloadT: G.opts.reloadT || 1.5, death: G.opts.death || 'lose', shield: G.opts.shield || 'on', php: G.opts.php || 100, psh: G.opts.psh || 0, bhp: G.opts.bhp || 100, bsh: G.opts.bsh || 0, shmax: G.opts.shmax || 100, bhps: G.opts.bhps || null } : null);
  if (mode === 'online') cfgToMe();   // the room's rules are known only now: apply them to my first life too
  G.running = true;
  showScreen(null); $('hud').hidden = false; $('touch').hidden = !touchMode; hudAll(); renderBoard(false);
  lockMouse();
}
function wavesUpdate(dt) {
  const bots = G.fighters.filter(f => f.bot), alive = bots.filter(f => f.alive).length;
  for (const b of bots) if (!b.alive && G.t - b.deadT > 3) removeFighter(b);
  if (G.waveBreak > 0) { G.waveBreak -= dt; if (G.waveBreak <= 0) { G.wave++; G.waveLeft = Math.min(3 + G.wave * 2, 26); G.waveSpawnT = 0; banner(t('vs_wave') + ' ' + G.wave); sfx.wave(); } return; }
  if (G.waveLeft > 0 && alive < Math.min(4 + Math.floor(G.wave / 2), 9)) {
    G.waveSpawnT -= dt;
    if (G.waveSpawnT <= 0) { G.waveSpawnT = 1.1; G.waveLeft--; const lv = G.wave <= 2 ? 'easy' : G.wave <= 5 ? 'medium' : 'hard'; const b = addBot(lv, G.wave * 7 + G.waveLeft); b.maxHp = 100 + Math.max(0, G.wave - 6) * 15; spawn(b); }
  }
  if (G.waveLeft === 0 && alive === 0 && G.wave > 0) {
    G.waveBreak = 6; banner(t('vs_waveClear')); sfx.wave();
    const me = G.me; me.hp = Math.min(me.maxHp, me.hp + 40); for (const k of GUN_KEYS) if (isFinite(me.res[k])) me.res[k] = Math.max(me.res[k], GUNS[k].res); me.nades = Math.max(me.nades, 2); me.blocks = Math.max(me.blocks, 20); hudAll();
    if (G.wave > STATS.bestWave) { STATS.bestWave = G.wave; saveStats(); }
  }
}
function checkEnd() {
  if (G.over) return;
  if (G.mode === 'waves' && !G.me.alive) setTimeout(() => { if (!G.over && G.mode === 'waves') endMatch(); }, 1800);
  if (G.mode === 'dm' || G.mode === 'online') {
    const r = rules();
    if (r.target > 0 && G.fighters.some(f => f.kills >= r.target)) { endMatch(); return; }
    if (r.lives > 0 && G.fighters.length > 1 && G.fighters.filter(f => !isOut(f)).length <= 1) endMatch();
  }
}
function ranking() { return [...G.fighters].sort((a, b) => (isOut(a) - isOut(b)) || b.kills - a.kills || a.deaths - b.deaths); }   // survivors first when lives run out
function endMatch() {
  G.over = true; G.fireHeld = false; G.ads = false; G.endT = G.t; unlockMouse();
  const rank = ranking(), top = rank[0], iWon = G.mode !== 'waves' && top === G.me;
  if (G.mode === 'waves' && G.wave - 1 > STATS.bestWave) { STATS.bestWave = Math.max(0, G.wave - 1); }
  if (iWon) STATS.wins++; saveStats();
  // Mal3ab match history (and wins / losses for online rounds)
  try {
    const others = rank.filter(f => f !== G.me).map(f => f.name.replace('🤖 ', '')).slice(0, 4).join(', ');
    const row = { code: 'vstrike-' + (G.mode === 'online' ? NET.code + '-' + NET.round + '-' + G.me.id : Date.now()), game_no: 1, game: 'voxelstrike',
      mode: G.mode === 'online' ? 'online' : 'bot', p1_name: G.me.name, p2_name: G.mode === 'waves' ? t('vs_waves') : others || '—',
      p1_id: window.Auth && Auth.user ? Auth.user.id : null, winner: G.mode === 'waves' ? '2' : iWon ? '1' : '2',
      reason: G.mode === 'waves' ? t('vs_wave') + ' ' + G.wave : G.me.kills + '–' + (iWon ? (rank[1] ? rank[1].kills : 0) : top.kills), moves: null, finished_at: new Date().toISOString() };
    if (window.History) History.save(row);
    if (G.mode === 'online' && window.Auth && Auth.record) Auth.record(iWon ? 'win' : 'loss');
    if (window.Auth && Auth.token && window.sb) sb.rpc('vs_report', { p_token: Auth.token, p_kills: G.me.kills, p_deaths: G.me.deaths, p_win: iWon, p_online: G.mode === 'online', p_wave: G.mode === 'waves' ? G.wave : 0 }).then(() => {}, () => {});
  } catch (e) {}
  showEnd();
}
function update(dt) {
  G.world.flush(scene, terrainMat, 4);
  if (G.me) { localUpdate(dt); }
  for (const f of G.fighters) {
    if (f.remote) { netSmooth(f, dt); }
    else if (f.bot) {
      if (f.alive && !G.over) botUpdate(f, dt);
      else if (!f.alive && (G.mode === 'dm' || G.mode === 'online') && !G.over && G.t >= f.respawnAt && !isOut(f)) spawn(f);
    }
    if (!f.remote) common(f, dt);
    animate(f, dt);
  }
  updNades(dt); pickupSpawner(dt); dropSpawner(dt); updPickups(dt); updParts(dt); updArc();
  for (const tr of tracers) if (tr.life > 0) { tr.life -= dt; tr.l.material.opacity = Math.max(0, tr.life / 0.07) * 0.85; if (tr.life <= 0) tr.l.visible = false; }
  for (let i = booms.length - 1; i >= 0; i--) { const b = booms[i]; b.t += dt; b.m.scale.setScalar(1 + b.t * 14); b.m.material.opacity = Math.max(0, 0.85 - b.t * 3.4); if (b.t > 0.3) { scene.remove(b.m); booms.splice(i, 1); } }
  if (G.mode === 'waves' && !G.over) wavesUpdate(dt);
  if (!G.over && G.mode === 'online' && rules().lives > 0) checkEnd();
  if (G.mode === 'online') netUpdate(dt);
  G.hurtA = Math.max(0, G.hurtA - dt * 0.9); G.shake = Math.max(0, G.shake - dt * 1.6); G.kick = Math.max(0, G.kick - dt * 7);
  hudFrame(dt);
}

// ---------------------------------------------------------------------
// online play (Supabase realtime broadcast). Every player runs their own
// character; hits are sent to the victim, who decides if they died.
// ---------------------------------------------------------------------
const NET = { ch: null, code: '', ready: false, round: 1, peers: new Map(), sendT: 0, synced: false, upT: 0, cfg: null, host: false, botsT: -99, botsFrom: null, botSendT: 0, botQ: { s: [], h: [] }, infoT: 0 };
const wall = () => performance.now() / 1000;                       // real seconds (game time slows down on weak devices)
const sim = (f) => f.local || (f.bot && !f.remote);                 // this screen runs that fighter (you, or bots when you host them)
const fighterById = (id) => id && (G.me && id === G.me.id ? G.me : G.fighters.find(f => f.id === id));
const seedFor = (code, round) => VS.hash('vstrike:' + code + ':' + round);
function send(ev, p) { if (NET.ch && NET.ready) NET.ch.send({ type: 'broadcast', event: ev, payload: p }); }
function netStart(code, cfg) {
  NET.code = code; NET.round = 1; NET.peers.clear(); NET.ready = false; NET.synced = false; NET.upT = 0; NET.cfg = cfg || null; NET.host = false; NET.botsT = -99; NET.startW = wall(); NET.botsFrom = null; NET.botQ = { s: [], h: [] };
  $('waitbox').innerHTML = `<div>${t('vs_waiting')}</div><div class="row center"><b class="big">${code}</b><button class="btn small" id="wLink">${t('vs_copyLink')}</button></div>`;
  $('wLink').onclick = (e) => copy(inviteLink(code), e.target);
  history.replaceState(null, '', location.pathname + '?room=' + code);
  if (!window.sb) { banner(t('vs_connecting')); return; }
  const ch = sb.channel('vstrike-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of ['hello', 'st', 'shot', 'hit', 'kill', 'nade', 'boom', 'blk', 'sync', 'bye', 'bots', 'cfg', 'pk']) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((s) => { if (s === 'SUBSCRIBED') { NET.ready = true; send('hello', hello(true)); } });
  NET.ch = ch;
}
function netLeave() { if (NET.ch) { send('bye', { id: G.me && G.me.id }); try { sb.removeChannel(NET.ch); } catch (e) {} } NET.ch = null; NET.ready = false; NET.peers.clear(); }
const hello = (req) => ({ id: G.me.id, n: G.me.name, c: G.me.color, req, cfg: NET.cfg });
function peer(id, n, c) {
  let f = NET.peers.get(id);
  if (!f) { f = newFighter({ id, remote: true, name: n || '…', color: c != null ? c : COLORS[2] }); f.netT = G.t; f.tp = f.pos.clone(); f.tyaw = 0; NET.peers.set(id, f); feedText(esc(f.name) + ' ' + t('vs_joined')); }
  return f;
}
function dropPeer(f) { if (!f) return; NET.peers.delete(f.id); removeFighter(f); feedText(esc(f.name) + ' ' + t('vs_leftRoom')); }
function onNet(ev, p) {
  if (!G.running || G.mode !== 'online' || !p) return;
  if (ev === 'hello') {
    if (p.id === G.me.id) return; peer(p.id, p.n, p.c); if (!NET.cfg && p.cfg) { NET.cfg = p.cfg; cfgToMe(); }
    if (p.req) {
      send('hello', hello(false));
      if (pickups.some(q => q.map) && ![...NET.peers.keys()].some(id => id < G.me.id)) send('pk', { a: 'list', to: p.id, l: pickups.filter(q => q.map).map(q => [q.id, q.kind, arr(q.m.position)]) });
      if (NET.upT > 2) send('sync', { to: p.id, round: NET.round, cfg: NET.cfg, ch: [...G.world.changes].slice(-3000), sc: G.fighters.map(f => [f.id, f.kills, f.deaths]) });
    }
    return;
  }
  if (ev === 'sync') {
    if (p.to !== G.me.id || NET.synced) return; NET.synced = true; if (p.cfg) { NET.cfg = p.cfg; cfgToMe(); }
    if (p.round !== NET.round) { NET.round = p.round; buildWorld(seedFor(NET.code, NET.round)); spawn(G.me); }
    for (const [k, b] of p.ch) { const [x, y, z] = k.split(',').map(Number); G.world.set(x, y, z, b); }
    for (const [id, k, d] of p.sc) { const f = NET.peers.get(id); if (f) { f.kills = k; f.deaths = d; } }
    return;
  }
  if (ev === 'bye') { dropPeer(NET.peers.get(p.id)); return; }
  if (ev === 'pk') {
    if (p.a === 'add' && !pickups.some(x => x.id === p.id)) { const q = addPickup(p.k, new V3().fromArray(p.p), 60, p.id); q.map = true; }
    if (p.a === 'take') { const q = pickups.find(x => x.id === p.id); if (q) removePickup(q); }
    if (p.a === 'list' && p.to === G.me.id) for (const it of p.l) if (!pickups.some(x => x.id === it[0])) { const q = addPickup(it[1], new V3().fromArray(it[2]), 60, it[0]); q.map = true; }
    return;
  }
  if (ev === 'cfg') { NET.cfg = p.cfg; cfgToMe(); return; }
  // a block placed or broken by someone else (the message carries no player id, so it must be handled before the sender lookup)
  if (ev === 'blk') { const old = G.world.get(p.x, p.y, p.z); G.world.set(p.x, p.y, p.z, p.b); if (!p.b && old) burst(new V3(p.x + 0.5, p.y + 0.5, p.z + 0.5), BLOCKS[old].color, 12, 5, 0.14, 0.9); return; }
  if (ev === 'bots') { onBots(p); return; }
  const f = ev === 'st' ? (NET.peers.get(p.id) || peer(p.id, p.n, p.c)) : fighterById(p.id);
  if (ev === 'st') {
    if (p.r !== NET.round) return;
    f.netT = G.t; f.tp.fromArray(p.p); f.tyaw = p.y; f.pitch = p.pt; f.weapon = p.w; f.hp = p.hp; if (p.mh) f.maxHp = p.mh; f.shield = p.sh || 0; if (p.sm) f.shMax = p.sm; f.kills = p.k; f.deaths = p.d;
    if (p.n && p.n !== f.name) { f.name = p.n; f.model.root.remove(f.tag); f.tag = nameTag(f.name, '#' + f.color.toString(16).padStart(6, '0')); f.model.root.add(f.tag); }
    if (p.a && !f.alive) { f.alive = true; f.pos.copy(f.tp); f.model.root.rotation.set(0, 0, 0); f.spawnT = G.t; }
    if (!p.a && f.alive) { f.alive = false; f.deadT = G.t; }
    return;
  }
  if (ev === 'hit') { const tg = fighterById(p.to); if (tg && sim(tg)) damage(tg, p.dmg, f, p.h, p.w); return; }
  if (ev === 'kill') {
    const v = fighterById(p.v), k = fighterById(p.k);
    if (v && !sim(v) && v.alive) { v.alive = false; v.deadT = G.t; v.deaths++; }
    if (k && k !== v) { k.kills++; if (k === G.me) { sfx.kill(); hitMark(true); STATS.kills++; saveStats(); } }
    if (v !== G.me) feed(k, v, p.w, p.h);
    checkEnd(); return;
  }
  if (!f) return;
  if (ev === 'shot') {
    const o = new V3().fromArray(p.o); shotSound(p.w, hearVol(o)); burst(o, 0xffd25a, 2, 1, 0.08, 0.08);
    for (const e of p.e) { const q = new V3().fromArray(e); tracer(o, q); burst(q, 0xbbbbbb, 2, 2, 0.06, 0.3); }
    return;
  }
  if (ev === 'nade') { addNade(f, new V3().fromArray(p.o), new V3().fromArray(p.v), false); return; }
  if (ev === 'boom') { const i = nades.findIndex(n => n.owner === f && !n.real); if (i >= 0) { scene.remove(nades[i].m); nades.splice(i, 1); } boom(new V3().fromArray(p.p), f); return; }
}
// one player's screen runs the room's bots and sends where they are 10× a second;
// if that player leaves, the next one (smallest id) takes them over
function onBots(p) {
  if (p.h === G.me.id) return;
  if (NET.host) {
    if (p.h < G.me.id) { NET.host = false; for (const b of G.fighters.filter(f => f.bot && !f.remote)) removeFighter(b); }   // someone else already hosts
    else return;
  }
  NET.botsT = wall(); NET.botsFrom = p.h;
  if (p.r !== NET.round) return;
  const seen = new Set();
  for (const a of p.b) {
    const [id, x, y, z, yw, pt, wi, al, hp, k, d] = a; seen.add(id);
    let b = G.fighters.find(f => f.id === id);
    if (!b) { const info = (p.i || []).find(q => q[0] === id); b = newFighter({ id, bot: true, remote: true, name: info ? info[1] : '🤖 Bot', color: info ? info[2] : COLORS[4] }); b.tp = new V3(x, y, z); b.pos.set(x, y, z); b.tyaw = yw; }
    else if (p.i) { const info = p.i.find(q => q[0] === id); if (info && info[1] !== b.name) { b.name = info[1]; b.model.root.remove(b.tag); b.tag = nameTag(b.name, '#' + b.color.toString(16).padStart(6, '0')); b.model.root.add(b.tag); } }
    b.tp.set(x, y, z); b.tyaw = yw; b.pitch = pt; b.weapon = SLOTS[wi] || 'rifle'; b.hp = hp; b.kills = k; b.deaths = d; b.shield = a[11] || 0; if (a[12]) b.maxHp = a[12]; if (a[13]) b.shMax = a[13];
    if (al && !b.alive) { b.alive = true; b.pos.set(x, y, z); b.model.root.rotation.set(0, 0, 0); }
    if (!al && b.alive) { b.alive = false; b.deadT = G.t; }
  }
  for (const b of G.fighters.filter(f => f.bot && f.remote && !seen.has(f.id))) removeFighter(b);
  for (const s of p.s || []) { const o = new V3().fromArray(s[1]); shotSound(s[0], hearVol(o)); burst(o, 0xffd25a, 2, 1, 0.08, 0.08); for (const e of s[2]) { const q = new V3().fromArray(e); tracer(o, q); burst(q, 0xbbbbbb, 2, 2, 0.06, 0.3); } }
  for (const h of p.hh || []) if (h[1] === G.me.id) damage(G.me, h[2], fighterById(h[0]), !!h[3], h[4]);
  checkEnd();
}
function botHosting(dt) {
  const want = (NET.cfg && NET.cfg.bots) || 0;
  // become the host when nobody else is sending bots and you have the smallest id in the room
  if (!NET.host && want > 0 && wall() - NET.botsT > 3 && wall() - NET.startW > 3 && [...NET.peers.keys()].every(id => id > G.me.id)) {
    NET.host = true;
    for (const b of G.fighters.filter(f => f.bot && f.remote)) { b.remote = false; b.ai = {}; b.vel.set(0, 0, 0); b.pos.copy(b.tp || b.pos); refill(b); }
  }
  if (!NET.host) return;
  const mine = G.fighters.filter(f => f.bot && !f.remote);
  if (mine.length < want) { const b = addBot((NET.cfg.lvs && NET.cfg.lvs[mine.length]) || NET.cfg.lv || 'medium', mine.length + 3); b.idx = mine.length; b.id = 'b' + G.me.id.slice(0, 4) + Math.random().toString(36).slice(2, 6); spawn(b); }
  else if (mine.length > want) removeFighter(mine[mine.length - 1]);
  if (wall() < NET.botSendT) return; NET.botSendT = wall() + 0.1;
  const msg = { h: G.me.id, r: NET.round, b: mine.map(b => [b.id, +b.pos.x.toFixed(2), +b.pos.y.toFixed(2), +b.pos.z.toFixed(2), +b.yaw.toFixed(2), +b.pitch.toFixed(2), Math.max(0, SLOTS.indexOf(b.weapon)), b.alive ? 1 : 0, Math.round(b.hp), b.kills, b.deaths, Math.round(b.shield || 0), b.maxHp, b.shMax || SHIELD_MAX]) };
  if ((NET.infoT -= 1) <= 0) { NET.infoT = 15; msg.i = mine.map(b => [b.id, b.name, b.color]); }
  if (NET.botQ.s.length) msg.s = NET.botQ.s.splice(0, 12);
  if (NET.botQ.h.length) msg.hh = NET.botQ.h.splice(0, 20);
  send('bots', msg);
}
function netSmooth(f, dt) {
  const before = f.pos.clone();
  if (f.alive) { f.pos.lerp(f.tp, Math.min(1, dt * 14)); f.yaw += angDiff(f.yaw, f.tyaw) * Math.min(1, dt * 14); }
  f.spd = before.distanceTo(f.pos) / Math.max(dt, 1e-3);
}
function netUpdate(dt) {
  NET.upT += dt; NET.sendT -= dt;
  if (NET.sendT <= 0 && G.me) {
    NET.sendT = 1 / 12; const m = G.me;
    const st = { id: m.id, r: NET.round, p: arr(m.pos), y: +m.yaw.toFixed(3), pt: +m.pitch.toFixed(3), w: m.weapon, hp: Math.max(0, Math.round(m.hp)), mh: m.maxHp, sh: Math.round(m.shield || 0), sm: m.shMax || SHIELD_MAX, a: m.alive, k: m.kills, d: m.deaths };
    if ((NET.nameT = (NET.nameT || 0) - 1) <= 0 || NET.sentName !== m.name) { NET.nameT = 24; NET.sentName = m.name; st.n = m.name; st.c = m.color; }   // the name goes out at once when it changes
    send('st', st);
  }
  for (const f of [...NET.peers.values()]) if (G.t - f.netT > 9) dropPeer(f);
  if (!NET.host && wall() - NET.botsT > 4) for (const b of G.fighters.filter(f => f.bot && f.remote && f.alive)) b.alive = false;   // host gone: hide frozen bots
  botHosting(dt);
  if (G.over && G.t - G.endT > 8) {                        // everyone starts the next round on their own, same seed
    NET.round++; G.over = false; showScreen(null); $('hud').hidden = false; $('touch').hidden = !touchMode;
    buildWorld(seedFor(NET.code, NET.round)); for (const f of G.fighters) { f.kills = 0; f.deaths = 0; } spawn(G.me);
    for (const b of G.fighters) if (b.bot && !b.remote) spawn(b);
    for (const f of NET.peers.values()) { f.alive = false; }
    banner(t('vs_firstTo', { n: ONLINE_TARGET })); lockMouse(); hudAll();
  }
}
addEventListener('pagehide', () => { if (NET.ch) send('bye', { id: G.me && G.me.id }); });

// ---------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------
function hudAll() { hudHp(); hudAmmo(); hudSlots(); }
function hudHp() { const me = G.me; if (!me) return; hudShield(me); const v = Math.max(0, Math.round(me.hp)); $('hpnum').textContent = v; const b = $('hpbar').firstElementChild; b.style.width = clamp(v / me.maxHp * 100, 0, 100) + '%'; b.style.background = v > 60 ? 'var(--ok)' : v > 30 ? 'var(--accent)' : 'var(--red)'; }
function hudShield(me) {
  const box = $('shbox'); if (!box) return; const v = Math.round(me.shield || 0);
  box.hidden = !(v > 0); if (v > 0) { box.querySelector('i').style.width = clamp(v / (me.shMax || SHIELD_MAX) * 100, 0, 100) + '%'; box.querySelector('span').textContent = v; }
}
function hudAmmo() {
  const me = G.me; if (!me) return; const w = me.weapon;
  if (w === 'blocks') { $('ammoNum').textContent = '🧱 ' + me.blocks; $('wname').textContent = t('vs_blocks') + ' · 💣 ' + me.nades; return; }
  if (w === 'nade') { $('ammoNum').textContent = '💣 ' + me.nades; $('wname').textContent = t('vs_grenade'); return; }
  $('ammoNum').textContent = !isFinite(me.mag[w]) ? '∞' : me.mag[w] + ' / ' + (isFinite(me.res[w]) ? me.res[w] : '∞');
  $('wname').textContent = (me.reloadT > 0 ? t('vs_reload') : t('vs_' + w)) + ' · 💣 ' + me.nades;
}
function hudSlots() {
  const me = G.me; if (!me) return;
  $('slots').innerHTML = SLOTS.map((k, i) => `<div class="slot ${me.weapon === k ? 'on' : ''} ${(k === 'nade' && !me.nades) || (GUNS[k] && me.owned && !me.owned.has(k)) ? 'off' : ''}" data-w="${k}"><b>${ICON[k]}</b>${i + 1}${k === 'nade' ? ' ×' + me.nades : ''}</div>`).join('');
}
$('slots').addEventListener('pointerdown', (e) => { const s = e.target.closest('.slot'); if (!s || !G.me) return; e.stopPropagation(); switchWeapon(G.me, s.dataset.w); });
function fmtTime(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
let hudT = 0;
function hudFrame(dt) {
  const me = G.me; if (!me) return;
  $('dmg').style.opacity = G.hurtA.toFixed(2);
  const dirs = $('dirs'); if (G.hurtFrom && G.hurtA > 0.05) { const a = Math.atan2(-(G.hurtFrom.x - me.pos.x), -(G.hurtFrom.z - me.pos.z)); dirs.firstElementChild.style.transform = `rotate(${-angDiff(me.yaw, a)}rad)`; dirs.style.opacity = G.hurtA; } else dirs.style.opacity = 0;
  const g = GUNS[me.weapon], scoped = G.ads && g && g.scope && camera.fov < SET.fov / 2;
  $('scope').hidden = !scoped; $('cross').style.display = scoped ? 'none' : '';
  const gap = 6 + (g ? (g.spread * (1 + me.heat + (me.onGround ? 0 : 1.6) + (Math.hypot(me.vel.x, me.vel.z) > 1.2 ? 0.8 : 0))) * 340 : 0);
  const cs = $('cross').children; cs[0].style.transform = `translate(-50%,${-gap - 9}px)`; cs[1].style.transform = `translate(-50%,${gap}px)`; cs[2].style.transform = `translate(${-gap - 9}px,-50%)`; cs[3].style.transform = `translate(${gap}px,-50%)`;
  if ((hudT -= dt) > 0) return; hudT = 0.2;
  let top = '';
  const RL = rules(), tg = RL.target > 0 ? RL.target : '∞', lifeTxt = RL.lives > 0 && G.mode !== 'waves' ? `<span>❤ ${Math.max(0, RL.lives - me.deaths)} ${t('vs_livesLeft')}</span>` : '';
  if (G.mode === 'dm') top = `<span>🎯 ${me.kills} / ${tg}</span><b>${RL.hardcore ? t('vs_hc') : t('vs_dm')}</b>${lifeTxt || `<span>${esc(RL.target > 0 ? t('vs_firstTo', { n: RL.target }) : t('vs_lastStand'))}</span>`}<span>🟢 ${aliveCount()} ${t('vs_alive')}</span>`;
  if (G.mode === 'waves') { const left = G.waveLeft + G.fighters.filter(f => f.bot && f.alive).length; top = `<b>${t('vs_wave')} ${Math.max(1, G.wave)}</b><span>🤖 ${left} ${t('vs_left')}</span><span>🎯 ${me.kills}</span>`; }
  if (G.mode === 'online') {
    top = `<span>${t('vs_room')}: <b>${NET.code}</b></span><span>🎯 ${me.kills} / ${tg}</span>${lifeTxt}<span>🟢 ${aliveCount()} ${t('vs_alive')}</span>`;
    $('waitbox').hidden = NET.peers.size > 0 || G.over;
  } else $('waitbox').hidden = true;
  $('top').innerHTML = top;
  // live standings: who is closest to the target
  const target = G.mode === 'dm' || G.mode === 'online' ? (RL.target > 0 ? RL.target : Math.max(5, ...G.fighters.map(f => f.kills + 1))) : 0, mini = $('mini');
  mini.hidden = !target || G.over;
  if (target) {
    const rank = ranking(); let list = rank.slice(0, 5); if (!list.includes(me)) list = list.slice(0, 4).concat(me);
    mini.innerHTML = list.map(f => { const i = rank.indexOf(f) + 1, col = '#' + f.color.toString(16).padStart(6, '0');
      return `<div class="mr ${f === me ? 'me' : ''}" style="${isOut(f) ? 'opacity:.45' : ''}"><span class="rk">${i <= 3 ? ['🥇', '🥈', '🥉'][i - 1] : i}</span><i style="background:${col}"></i><span class="nm">${esc(f === me ? t('vs_you') : f.name)}</span><b>${f.kills}</b><span class="bar"><s style="width:${Math.min(100, f.kills / target * 100)}%;background:${col}"></s></span></div>`; }).join('');
  }
  if (me.reloadT > 0) hudAmmo();
  $('clickHint').hidden = touchMode || locked() || G.paused || G.over || !G.running;
  if (G.boardOpen) renderBoard(true);
}
function hitMark(kill) { const h = $('hitm'); h.classList.toggle('kill', kill); h.style.opacity = 1; clearTimeout(hitMark.t); hitMark.t = setTimeout(() => h.style.opacity = 0, kill ? 300 : 120); }
function feed(k, v, w, head) {
  if (!v) return; const col = (f) => '#' + f.color.toString(16).padStart(6, '0');
  const kn = k && k !== v ? `<b style="color:${col(k)}">${esc(k === G.me ? t('vs_you') : k.name)}</b> ` : '';
  feedText(`${kn}${ICON[w] || '💀'}${head ? ' 🎯' : ''} <b style="color:${col(v)}">${esc(v === G.me ? t('vs_you') : v.name)}</b>`);
  if (k === G.me && head) banner(t('vs_head'), 0.8);
}
function feedText(html) { const d = document.createElement('div'); d.innerHTML = html; $('feed').prepend(d); while ($('feed').children.length > 5) $('feed').lastChild.remove(); setTimeout(() => d.remove(), 6000); }
function banner(text, secs) { const b = $('banner'); b.textContent = text; b.style.opacity = 1; clearTimeout(banner.t); banner.t = setTimeout(() => b.style.opacity = 0, (secs || 2) * 1000); }
function showDead(a) { $('dead').hidden = false; $('dead').dataset.by = a && a !== G.me ? a.name : ''; updDead(); }
function updDead() {
  $('dead').classList.toggle('spec', !!(G.me && isOut(G.me)));
  const by = $('dead').dataset.by, left = G.me.respawnAt - G.t;
  $('dead').innerHTML = (by ? `<div>${esc(t('vs_killedBy', { p: by }))}</div>` : '') + (G.mode === 'waves' ? '' : isOut(G.me) ? `<b>${t('vs_out')}</b><small>${t(touchMode ? 'vs_specTouch' : 'vs_spec')}</small>` : `<b>${t('vs_respawn', { n: Math.max(1, Math.ceil(left)) })}</b>`);
}
function renderBoard(show) {
  G.boardOpen = show; $('board').hidden = !show; if (!show) return;
  const RL = rules(), lv = (f) => G.mode === 'waves' ? '—' : RL.lives > 0 ? (isOut(f) ? '<span style="white-space:nowrap">💀 ' + t('vs_out2') + '</span>' : '❤ ' + Math.max(0, RL.lives - f.deaths)) : '∞';
  $('board').innerHTML = `<h3>${t('vs_score')} · 👥 ${aliveCount()} ${t('vs_alive')}</h3><table><tr><th>${t('vs_player')}</th><th>${t('vs_livesCol')}</th><th>${t('vs_kills')}</th><th>${t('vs_deaths')}</th></tr>` +
    ranking().map(f => `<tr class="${f === G.me ? 'me' : ''}" style="${isOut(f) ? 'opacity:.5' : ''}"><td><i style="background:#${f.color.toString(16).padStart(6, '0')}"></i>${f.alive ? '' : '☠ '}${esc(f === G.me ? f.name + ' (' + t('vs_you') + ')' : f.name)}</td><td>${lv(f)}</td><td>${f.kills}</td><td>${f.deaths}</td></tr>`).join('') + '</table>';
}

// ---------------------------------------------------------------------
// screens: menu, pause, settings, end
// ---------------------------------------------------------------------
const SCREENS = ['menu', 'pause', 'end', 'settings', 'lb', 'rules'];
// ---------- match settings (bots, each bot's level, kills to win, lives, hardcore), kept per mode ----------
const LVS = ['easy', 'medium', 'hard'], MAX_BOTS = 40;
function getRules(kind) {
  const all = lsGet('vstrike-rules', {}), m = lsGet('vstrike-menu', {});
  const def = kind === 'dm' ? { bots: m.bots != null ? m.bots : 5, lv: m.diff || 'medium', target: DM_TARGET } : { bots: m.obots != null ? m.obots : 0, lv: m.olv || 'medium', target: ONLINE_TARGET };
  const r = Object.assign({ lvs: null, lives: 0, hardcore: false, start: 'all', pickups: kind === 'dm' ? 'normal' : 'off', drops: kind === 'dm' ? 'normal' : 'off', ammo: 'normal', reload: 'normal', reloadT: 1.5, death: 'lose', shield: 'on', php: 100, psh: 0, bhp: 100, bsh: 0, shmax: 100, bhps: null }, def, all[kind] || {});
  r.reloadT = Math.max(0.1, Math.min(15, +r.reloadT || 1.5));
  r.bots = Math.max(0, Math.min(MAX_BOTS, r.bots | 0)); r.target = Math.max(0, Math.min(9999, r.target | 0)); r.lives = Math.max(0, Math.min(999, r.lives | 0)); if (!Array.isArray(r.lvs)) r.lvs = null;
  if (r.lvs) r.lvs = Array.from({ length: r.bots }, (_, i) => LVS.includes(r.lvs[i]) ? r.lvs[i] : r.lv);
  const hpN = (v, d, lo) => Math.max(lo, Math.min(1000, Math.round(+v) || d));
  r.php = hpN(r.php, 100, 1); r.psh = hpN(r.psh, 0, 0); r.bhp = hpN(r.bhp, 100, 1); r.bsh = hpN(r.bsh, 0, 0); r.shmax = hpN(r.shmax, 100, 1);
  r.bhps = Array.isArray(r.bhps) && r.bots ? Array.from({ length: r.bots }, (_, i) => hpN(r.bhps[i], r.bhp, 1)) : null;
  if (r.bhps && r.bhps.every(v => v === r.bhp)) r.bhps = null;
  return r;
}
function setRules(kind, r) { const all = lsGet('vstrike-rules', {}); all[kind] = r; lsSet('vstrike-rules', all); }
const rulesOpts = (r, extra) => Object.assign({ diff: r.lv, lv: r.lv, bots: r.bots, lvs: r.lvs, target: r.target, lives: r.lives, hardcore: r.hardcore, start: r.start, pickups: r.pickups, drops: r.drops, ammo: r.ammo, reload: r.reload, reloadT: r.reloadT, death: r.death, shield: r.shield, php: r.php, psh: r.psh, bhp: r.bhp, bsh: r.bsh, shmax: r.shmax, bhps: r.bhps }, extra || {});
function rulesSummary(r) {
  const mixed = r.lvs && r.lvs.some(l => l !== r.lvs[0]), lvl = r.bots ? (mixed ? t('vs_mixed') : t('vs_' + ((r.lvs && r.lvs[0]) || r.lv))) : '—';
  return t('vs_sum', { b: r.bots, l: lvl, t: r.target > 0 ? t('vs_sumT', { n: r.target }) : t('vs_noLimit'), v: r.hardcore ? t('vs_hc') : r.lives > 0 ? t('vs_sumL', { n: r.lives }) : '❤ ∞' })
    + (r.start !== 'all' ? ' · ' + (r.start === 'pistol' ? '🔫' : '👊') : '') + (r.pickups !== 'off' ? ' · 🎁' : '') + (r.drops && r.drops !== 'off' ? ' · 📦' : '')
    + (r.ammo === 'inf' ? ' · ∞' : '') + (r.reload === 'none' ? ' · ⚡' : r.reload === 'custom' ? ' · ⏱' + r.reloadT + 's' : '') + (r.death === 'keep' ? ' · 🔒' : r.death === 'drop' ? ' · 🎒' : '') + (r.shield === 'off' ? '' : ' · 🛡️' + (r.shmax && r.shmax !== 100 ? r.shmax : '')) + (r.php && r.php !== 100 ? ' · ❤' + r.php : '') + (r.bots && ((r.bhp && r.bhp !== 100) || r.bhps) ? ' · 🤖❤' + (r.bhps ? '…' : r.bhp) : '');
}
function openRules(kind) {
  const r = getRules(kind); showScreen('rules');
  const opt = (v, txt, cur) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${txt}</option>`;
  const draw = () => {
    const lvs = r.lvs || Array(r.bots).fill(r.lv), mixed = lvs.some(l => l !== lvs[0]);
    $('rules').innerHTML = `<div class="panel wide rulesp" data-m3pop><h2>${t('vs_rulesT')} — ${kind === 'dm' ? t('vs_dm') : t('vs_online')}</h2>
      <label>${t('vs_botN')}<div class="row"><button class="btn sec small" data-n="-1">−</button><input type="number" id="rBots" min="0" max="${MAX_BOTS}" value="${r.bots}"><button class="btn sec small" data-n="1">+</button></div></label>
      ${r.bots ? `<label>${t('vs_allLv')}<select id="rAll">${mixed ? opt('mixed', t('vs_mixed'), 'mixed') : ''}${LVS.map(k => opt(k, t('vs_' + k), mixed ? '' : lvs[0])).join('')}</select></label>
      <div class="two"><label>🤖❤ ${t('vs_botHp')}<input type="number" id="rBhp" min="1" max="1000" value="${r.bhp}"><small>${t('vs_hpHint')}</small></label>
      <label>🤖🛡️ ${t('vs_botShield')}<input type="number" id="rBsh" min="0" max="1000" value="${r.bsh}"></label></div>
      <div class="blist"><div class="small">${t('vs_eachBot')}</div>${lvs.map((l, i) => `<div class="bi"><span>🤖 ${t('vs_bot')} ${i + 1}</span><span class="bictl"><select data-i="${i}">${LVS.map(k => opt(k, t('vs_' + k), l)).join('')}</select><input type="number" class="bhp" data-h="${i}" min="1" max="1000" value="${(r.bhps && r.bhps[i]) || r.bhp}" title="❤ HP"></span></div>`).join('')}</div>` : ''}
      <div class="two"><label>❤ ${t('vs_myHp')}<input type="number" id="rPhp" min="1" max="1000" value="${r.php}"><small>${t('vs_hpHint')}</small></label>
      <label>🛡️ ${t('vs_myShield')}<input type="number" id="rPsh" min="0" max="1000" value="${r.psh}"></label></div>
      <div class="two"><label>${t('vs_target')}<input type="number" id="rTarget" min="0" max="9999" value="${r.target}"><small>${t('vs_numHint')}</small></label>
      <label>${t('vs_lives')}<input type="number" id="rLives" min="0" max="999" value="${r.hardcore ? 1 : r.lives}" ${r.hardcore ? 'disabled' : ''}><small>${t('vs_numHint')}</small></label></div>
      <div class="two"><label>${t('vs_start')}<select id="rStart">${opt('all', t('vs_stAll'), r.start)}${opt('pistol', t('vs_stPistol'), r.start)}${opt('none', t('vs_stNone'), r.start)}</select></label>
      <label>${t('vs_pickups')}<select id="rPick">${opt('off', t('vs_pkOff'), r.pickups)}${opt('normal', t('vs_pkNormal'), r.pickups)}${opt('lots', t('vs_pkLots'), r.pickups)}</select></label></div>
      <div class="two"><label>📦 ${t('vs_drops')}<select id="rDrops">${opt('off', t('vs_pkOff'), r.drops)}${opt('normal', t('vs_pkNormal'), r.drops)}${opt('lots', t('vs_pkLots'), r.drops)}</select></label>
      <label>${t('vs_ammoRule')}<select id="rAmmo">${opt('normal', t('vs_amNormal'), r.ammo)}${opt('inf', t('vs_amInf'), r.ammo)}</select></label></div>
      <div class="two"><label>${t('vs_reloadRule')}<select id="rReload">${opt('normal', t('vs_rlNormal'), r.reload)}${opt('custom', t('vs_rlCustom'), r.reload)}${opt('none', t('vs_rlNone'), r.reload)}</select></label>
      <label ${r.reload === 'custom' ? '' : 'hidden'}>${t('vs_rlSec')}<input type="number" id="rReloadT" min="0.1" max="15" step="0.1" value="${r.reloadT}"></label></div>
      <div class="two"><label>💀 ${t('vs_onDeath')}<select id="rDeath">${opt('lose', t('vs_dLose'), r.death)}${opt('keep', t('vs_dKeep'), r.death)}${opt('drop', t('vs_dDrop'), r.death)}</select></label>
      <label>${t('vs_shield')}<select id="rShield">${opt('on', t('vs_shOn'), r.shield)}${opt('off', t('vs_shOff'), r.shield)}</select></label></div>
      <div class="two"><label>🛡️ ${t('vs_shMax')}<input type="number" id="rShMax" min="1" max="1000" value="${r.shmax}"><small>${t('vs_hpHint')}</small></label><span></span></div>
      <label class="tog"><span><input type="checkbox" id="rHard" ${r.hardcore ? 'checked' : ''}> ${t('vs_hc')}</span><small>${t('vs_hcDesc')}</small></label>
      <button class="btn" id="rDone">${t('vs_save')}</button></div>`;
    const redraw = () => setTimeout(draw, 0);   // never rebuild the panel from inside one of its own events
    const setBots = (n) => { n = Math.max(0, Math.min(MAX_BOTS, n | 0)); if (n === r.bots) return; const old = r.lvs || Array(r.bots).fill(r.lv); r.bots = n; r.lvs = Array.from({ length: n }, (_, i) => old[i] || old[old.length - 1] || r.lv); redraw(); };
    $('rules').querySelectorAll('[data-n]').forEach(b => b.onclick = () => setBots(r.bots + +b.dataset.n));
    $('rBots').onchange = (e) => setBots(+e.target.value);
    if ($('rAll')) $('rAll').onchange = (e) => { if (e.target.value === 'mixed') return; r.lv = e.target.value; r.lvs = Array(r.bots).fill(r.lv); redraw(); };
    $('rules').querySelectorAll('.bi select').forEach(sel => sel.onchange = () => { const l = r.lvs || Array(r.bots).fill(r.lv); l[+sel.dataset.i] = sel.value; r.lvs = l; redraw(); });
    $('rTarget').onchange = (e) => { r.target = Math.max(0, Math.min(9999, +e.target.value | 0)); e.target.value = r.target; };
    $('rLives').onchange = (e) => { r.lives = Math.max(0, Math.min(999, +e.target.value | 0)); e.target.value = r.lives; };
    $('rStart').onchange = (e) => { r.start = e.target.value; if (r.start === 'none' && r.pickups === 'off') { r.pickups = 'normal'; redraw(); } };
    $('rPick').onchange = (e) => { r.pickups = e.target.value; };
    $('rDrops').onchange = (e) => { r.drops = e.target.value; };
    $('rAmmo').onchange = (e) => { r.ammo = e.target.value; };
    $('rDeath').onchange = (e) => { r.death = e.target.value; };
    const num = (v, d, lo) => Math.max(lo, Math.min(1000, Math.round(+v) || d));
    $('rPhp').onchange = (e) => { r.php = num(e.target.value, 100, 1); e.target.value = r.php; };
    $('rShMax').onchange = (e) => { r.shmax = num(e.target.value, 100, 1); e.target.value = r.shmax; };
    $('rPsh').onchange = (e) => { r.psh = num(e.target.value, 0, 0); e.target.value = r.psh; };
    if ($('rBhp')) $('rBhp').onchange = (e) => { r.bhp = num(e.target.value, 100, 1); r.bhps = null; redraw(); };
    if ($('rBsh')) $('rBsh').onchange = (e) => { r.bsh = num(e.target.value, 0, 0); e.target.value = r.bsh; };
    $('rules').querySelectorAll('input.bhp').forEach(inp => inp.onchange = () => { const v = num(inp.value, r.bhp, 1); inp.value = v; const a = r.bhps || Array(r.bots).fill(r.bhp); a[+inp.dataset.h] = v; r.bhps = a; });
    $('rShield').onchange = (e) => { r.shield = e.target.value; };
    $('rReload').onchange = (e) => { r.reload = e.target.value; redraw(); };
    $('rReloadT').onchange = (e) => { r.reloadT = Math.max(0.1, Math.min(15, +e.target.value || 1.5)); e.target.value = r.reloadT; };
    $('rHard').onchange = (e) => { r.hardcore = e.target.checked; redraw(); };
    $('rDone').onclick = () => {
      const nm = (id, d, lo) => $(id) ? Math.max(lo, Math.min(1000, Math.round(+$(id).value) || d)) : null;
      r.php = nm('rPhp', 100, 1); r.psh = nm('rPsh', 0, 0); r.shmax = nm('rShMax', 100, 1); if ($('rBhp')) r.bhp = nm('rBhp', 100, 1); if ($('rBsh')) r.bsh = nm('rBsh', 0, 0);
      if (r.bhps && r.bhps.every(v => v === r.bhp)) r.bhps = null;
      if ($('rReloadT')) r.reloadT = Math.max(0.1, Math.min(15, +$('rReloadT').value || 1.5));
      r.target = Math.max(0, Math.min(9999, +$('rTarget').value | 0)); if (!r.hardcore) r.lives = Math.max(0, Math.min(999, +$('rLives').value | 0));
      if (!r.target && !r.lives && !r.hardcore) r.lives = 3;                     // a match needs an end: no kill limit means limited lives
      if (r.lvs && r.lvs.length && r.lvs.every(l => l === r.lvs[0])) { r.lv = r.lvs[0]; r.lvs = null; }
      setRules(kind, r); showScreen('menu'); renderMenu();
    };
  };
  draw();
}
function showScreen(id) { for (const s of SCREENS) $(s).hidden = s !== id; if (id) $('touch').hidden = true; }
function inviteLink(code) { return location.href.split('?')[0].split('#')[0] + '?room=' + code; }
function newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function copy(text, btn) { const done = () => { const o = btn.textContent; btn.textContent = t('vs_copied'); setTimeout(() => btn.textContent = o, 1200); }; if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); }
function renderMenu() {
  const lv = (id, v) => `<select id="${id}">${['easy', 'medium', 'hard'].map(k => `<option value="${k}" ${k === v ? 'selected' : ''}>${t('vs_' + k)}</option>`).join('')}</select>`;
  const m = lsGet('vstrike-menu', { diff: 'medium', bots: 5, wdiff: 'medium' });
  $('menu').innerHTML = `<div class="wrap">
    <div class="head"><div><div class="logo"><b>VOXEL</b> <span>STRIKE</span></div><div class="sub">${t('vs_sub')}</div></div><div class="sp"></div>
      ${window.langButton ? langButton().replace('btn small secondary', 'btn small sec') : ''}<button class="btn small" id="mLb">${t('vs_lb')}</button><button class="btn small sec" id="mSet">${t('vs_settings')}</button><button class="btn small sec" data-mal3ab-chat title="Chat">💬</button><button class="btn small sec" data-mal3ab-home>🏠</button></div>
    <div class="cards">
      <div class="card"><div class="ic">⚔️</div><h2>${t('vs_dm')}</h2><p>${t('vs_dmDesc', { n: getRules('dm').target || '∞' })}</p>
        <div class="sumr"><span>${esc(rulesSummary(getRules('dm')))}</span><button class="btn sec small" id="dmRules">${t('vs_rules')}</button></div>
        <button class="btn" id="goDm">${t('vs_play')}</button></div>
      <div class="card"><div class="ic">🌊</div><h2>${t('vs_waves')}</h2><p>${t('vs_wavesDesc')}${STATS.bestWave ? '<br><b>' + t('vs_best', { n: STATS.bestWave }) + '</b>' : ''}</p>
        <button class="btn" id="goWaves">${t('vs_play')}</button></div>
      <div class="card"><div class="ic">🌐</div><h2>${t('vs_online')}</h2><p>${t('vs_onlineDesc', { n: getRules('online').target || '∞' })}</p>
        <div class="sumr"><span>${esc(rulesSummary(getRules('online')))}</span><button class="btn sec small" id="onRules">${t('vs_rules')}</button></div>
        <button class="btn" id="goCreate">${t('vs_create')}</button>
        <div class="row"><input class="code" id="joinCode" maxlength="6" placeholder="${t('vs_code')}"><button class="btn sec" id="goJoin">${t('vs_join')}</button></div>
        <div class="msg" id="mMsg"></div></div>
    </div>
    <div class="help">${touchMode ? t('vs_helpTouch') : t('vs_help')}</div></div>`;
  if (window.applyLang) applyLang();
  $('dmRules').onclick = () => openRules('dm'); $('onRules').onclick = () => openRules('online');
  $('goDm').onclick = () => startGame('dm', rulesOpts(getRules('dm')));
  $('goWaves').onclick = () => startGame('waves', {});
  $('goCreate').onclick = () => startGame('online', rulesOpts(getRules('online'), { code: newCode() }));
  $('goJoin').onclick = () => { const c = $('joinCode').value.trim().toUpperCase(); if (c.length < 4) { $('mMsg').textContent = t('vs_codeHint'); return; } startGame('online', { code: c }); };
  $('joinCode').onkeydown = (e) => { if (e.key === 'Enter') $('goJoin').click(); };
  $('mSet').onclick = () => openSettings('menu');
  $('mLb').onclick = () => openLeaderboard('kills');
  document.querySelectorAll('[data-mal3ab-home]').forEach(h => { if (!h.onclick) h.onclick = () => location.href = '../../play.html'; });
}
async function openLeaderboard(by) {
  showScreen('lb');
  const tabs = [['kills', 'vs_lbKills'], ['wins', 'vs_lbWins'], ['wave', 'vs_lbWave']];
  const head = `<div class="panel wide" data-m3pop><h2>${t('vs_lb')}</h2><div class="row center">${tabs.map(([k, s]) => `<button class="btn small ${k === by ? '' : 'sec'}" data-by="${k}">${t(s)}</button>`).join('')}</div>`;
  $('lb').innerHTML = head + `<p>${t('vs_loading')}</p></div>`;
  let rows = [];
  try { const r = await sb.rpc('vs_leaderboard', { p_by: by, p_token: (window.Auth && Auth.token) || null, p_limit: 25 }); rows = r.data || []; } catch (e) {}
  if ($('lb').hidden) return;
  const val = (r) => by === 'wins' ? r.wins : by === 'wave' ? r.best_wave : r.kills;
  const av = (r) => window.avatarHtml ? avatarHtml({ avatar: r.avatar, username: r.username }, 26) : '';
  $('lb').innerHTML = head + (rows.length ? `<table class="lbt"><tr><th>${t('vs_rank')}</th><th>${t('vs_player')}</th><th>${t(tabs.find(x => x[0] === by)[1])}</th><th>${t('vs_matches')}</th></tr>` +
    rows.map(r => `<tr class="${r.me ? 'me' : ''}"><td>${r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td><td class="nm">${av(r)} ${esc(r.username)}</td><td>${val(r)}</td><td>${r.matches}</td></tr>`).join('') + '</table>'
    : `<p>${t('vs_lbEmpty')}</p>`) + (window.Auth && Auth.token ? '' : `<p class="small">${t('vs_lbLogin')}</p>`) + `<button class="btn sec" id="lbBack">${t('vs_back')}</button></div>`;
  $('lb').querySelectorAll('[data-by]').forEach(b => b.onclick = () => openLeaderboard(b.dataset.by));
  $('lbBack').onclick = () => { showScreen('menu'); renderMenu(); };
}
function openSettings(back) {
  showScreen('settings');
  $('settings').innerHTML = `<div class="panel" data-m3pop><h2>${t('vs_settings')}</h2>
    <label>${t('vs_sens')} <input type="range" id="sSens" min="0.2" max="3" step="0.05" value="${SET.sens}"></label>
    <label>${t('vs_vol')} <input type="range" id="sVol" min="0" max="1" step="0.05" value="${SET.vol}"></label>
    <label>${t('vs_fov')} <input type="range" id="sFov" min="60" max="100" step="1" value="${SET.fov}"></label>
    <button class="btn" id="sBack">${t('vs_back')}</button></div>`;
  $('sSens').oninput = (e) => { SET.sens = +e.target.value; saveSet(); };
  $('sVol').oninput = (e) => { SET.vol = +e.target.value; if (master) master.gain.value = SET.vol; saveSet(); };
  $('sFov').oninput = (e) => { SET.fov = +e.target.value; camera.fov = SET.fov; camera.updateProjectionMatrix(); saveSet(); };
  $('sBack').onclick = () => back === 'menu' ? (showScreen('menu'), renderMenu()) : openPause();
}
function openPause() {
  if (!G.running || G.over) return;
  G.paused = true; G.fireHeld = false; G.ads = false; for (const k in keys) keys[k] = false; showScreen('pause');
  $('pause').innerHTML = `<div class="panel"><h2>${t('vs_paused')}</h2>
    ${G.mode === 'online' ? `<div class="row center"><span>${t('vs_room')}: <b class="big">${NET.code}</b></span><button class="btn small sec" id="pLink">${t('vs_copyLink')}</button></div>
      <div class="row center"><label>🤖 ${t('vs_bots')}</label><select id="pBots">${[0, 1, 2, 3, 5, 7].map(n => `<option ${n === ((NET.cfg && NET.cfg.bots) || 0) ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <select id="pLv">${['easy', 'medium', 'hard'].map(k => `<option value="${k}" ${k === ((NET.cfg && NET.cfg.lv) || 'medium') ? 'selected' : ''}>${t('vs_' + k)}</option>`).join('')}</select></div>` : ''}
    <button class="btn" id="pRes">${t('vs_resume')}</button><button class="btn sec" id="pSet">${t('vs_settings')}</button>
    <button class="btn sec" id="pLeave">${t('vs_leave')}</button><button class="btn sec" data-mal3ab-chat>💬</button><button class="btn sec" data-mal3ab-home>🏠</button>
    <div class="help">${touchMode ? t('vs_helpTouch') : t('vs_help')}</div></div>`;
  $('pRes').onclick = resume; $('pSet').onclick = () => openSettings('pause'); $('pLeave').onclick = toMenu;
  if ($('pLink')) $('pLink').onclick = (e) => copy(inviteLink(NET.code), e.target);
  const setCfg = () => { NET.cfg = Object.assign({}, NET.cfg, { bots: +$('pBots').value, lv: $('pLv').value, lvs: null }); send('cfg', { cfg: NET.cfg }); if (NET.host) for (const b of G.fighters) if (b.bot && !b.remote) b.lv = NET.cfg.lv; };
  if ($('pBots')) { $('pBots').onchange = setCfg; $('pLv').onchange = setCfg; }
  wireHome();
}
function resume() { if (!G.running) return; G.paused = false; showScreen(null); $('touch').hidden = !touchMode; lockMouse(); }
function toMenu() { netLeave(); G.running = false; G.over = false; G.paused = false; clearWorld(); buildWorld((Math.random() * 1e9) | 0); G.me = null; $('hud').hidden = true; $('touch').hidden = true; showScreen('menu'); renderMenu(); unlockMouse(); history.replaceState(null, '', location.pathname); }
function showEnd() {
  showScreen('end'); $('hud').hidden = false; $('touch').hidden = true;
  const rank = ranking(), top = rank[0];
  let title = t('vs_over'), sub = '';
  if (G.mode === 'waves') { title = t('vs_gameOver'); sub = t('vs_reached', { n: Math.max(1, G.wave) }) + ' · 🎯 ' + G.me.kills + '<br>' + t('vs_best', { n: Math.max(STATS.bestWave, G.wave) }); }
  else title = top === G.me ? t('vs_youWin') : t('vs_won', { p: esc(top.name) });
  $('end').innerHTML = `<div class="panel"><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}
    ${G.mode !== 'waves' ? `<table><tr><th>${t('vs_player')}</th><th>${t('vs_kills')}</th><th>${t('vs_deaths')}</th></tr>${rank.map(f => `<tr class="${f === G.me ? 'me' : ''}"><td>${esc(f.name)}</td><td>${f.kills}</td><td>${f.deaths}</td></tr>`).join('')}</table>` : ''}
    ${G.mode === 'online' ? `<p id="nextR"></p><button class="btn sec" id="eMenu">${t('vs_leave')}</button>` : `<button class="btn" id="eAgain">${t('vs_again')}</button><button class="btn sec" id="eMenu">${t('vs_menu')}</button>`}
    <button class="btn sec" data-mal3ab-chat>💬</button><button class="btn sec" data-mal3ab-home>🏠</button></div>`;
  if ($('eAgain')) $('eAgain').onclick = () => startGame(G.mode, G.opts);
  $('eMenu').onclick = toMenu; wireHome();
  if (G.mode === 'online') { const tick = () => { if (!G.over || $('end').hidden) return; const n = $('nextR'); if (n) n.textContent = t('vs_nextRound', { n: Math.max(1, Math.ceil(8 - (G.t - G.endT))) }); setTimeout(tick, 250); }; tick(); }
}
function wireHome() { document.querySelectorAll('[data-mal3ab-home]').forEach(h => h.onclick = () => { netLeave(); location.href = '../../play.html'; }); }

// ---------------------------------------------------------------------
// mouse + keyboard
// ---------------------------------------------------------------------
const locked = () => document.pointerLockElement === canvas;
function lockMouse() { if (touchMode) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function unlockMouse() { if (document.pointerLockElement) document.exitPointerLock(); }
document.addEventListener('pointerlockchange', () => { if (!locked() && G.running && !G.over && !G.paused && !touchMode) openPause(); });
canvas.addEventListener('click', () => { audio(); if (G.running && !G.over && !G.paused && !locked() && !touchMode) lockMouse(); });
document.addEventListener('mousemove', (e) => {
  if (!locked() || !G.me || (!G.me.alive && !G.spec) || G.paused) return;
  const s = 0.0022 * SET.sens * (G.ads ? camera.fov / SET.fov : 1);
  G.me.yaw -= e.movementX * s; G.me.pitch = clamp(G.me.pitch - e.movementY * s, -1.5, 1.5);
});
document.addEventListener('mousedown', (e) => {
  if (!locked() || !G.me || G.paused) return; audio();
  if (e.button === 0) { if (G.me.weapon === 'nade') { if (G.me.nades > 0 && G.me.alive) G.nadeAim = 'click'; } else { G.fireHeld = true; G.fired = false; } }
  if (e.button === 2 && GUNS[G.me.weapon]) G.ads = true;
});
document.addEventListener('mouseup', (e) => {
  if (e.button === 0) { G.fireHeld = false; G.fired = false; if (G.nadeAim === 'click') { G.nadeAim = false; if (G.me && !G.paused) throwNade(G.me); } }
  if (e.button === 2) G.ads = false;
});
document.addEventListener('contextmenu', (e) => { if (G.running) e.preventDefault(); });
document.addEventListener('wheel', (e) => { if (!locked() || !G.me) return; const i = SLOTS.indexOf(G.me.weapon); switchWeapon(G.me, SLOTS[(i + (e.deltaY > 0 ? 1 : -1) + SLOTS.length) % SLOTS.length]); });
document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
  if (!G.running) return;
  if (e.code === 'Tab') { e.preventDefault(); renderBoard(true); return; }
  if (e.code === 'Escape' && G.paused) { resume(); return; }
  if (!locked() && !touchMode) return;
  keys[e.code] = true;
  const me = G.me; if (!me) return;
  if (e.code.startsWith('Digit')) { const n = +e.code.slice(5); if (n >= 1 && n <= SLOTS.length) switchWeapon(me, SLOTS[n - 1]); }
  if (e.code === 'KeyR') startReload(me);
  if (e.code === 'KeyG' && !e.repeat && me.nades > 0 && me.alive) G.nadeAim = true;
  if (e.code === 'KeyQ' && !e.repeat) { const i = SLOTS.indexOf(me.weapon); switchWeapon(me, SLOTS[(i + SLOTS.length - 1) % SLOTS.length]); }
  if (['Space', 'Tab'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; if (e.code === 'Tab') renderBoard(false); if (e.code === 'KeyG' && G.nadeAim) { G.nadeAim = false; if (G.me && !G.paused) throwNade(G.me); } });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; G.fireHeld = false; });

// ---------------------------------------------------------------------
// touch controls
// ---------------------------------------------------------------------
(function touchSetup() {
  const T = $('touch'), stick = T.querySelector('.stick'), knob = T.querySelector('.knob');
  let stickId = null; const looks = {}, held = {};
  const moveStick = (tch) => {
    const r = stick.getBoundingClientRect(), rad = r.width / 2; let dx = (tch.clientX - r.left - rad) / rad, dy = (tch.clientY - r.top - rad) / rad;
    const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } TOUCH.mx = Math.abs(dx) < 0.15 ? 0 : dx; TOUCH.my = Math.abs(dy) < 0.15 ? 0 : dy; TOUCH.sprint = dy < -0.92;
    knob.style.transform = `translate(${dx * rad * 0.6}px,${dy * rad * 0.6}px)`;
  };
  const press = (b) => {
    const me = G.me; if (!me || G.paused) return; audio(); b.classList.add('held');
    const k = b.dataset.b;
    if (k === 'fire') { if (me.weapon === 'nade') { if (me.nades > 0) G.nadeAim = 'click'; } else { G.fireHeld = true; G.fired = false; } }
    if (k === 'aim') G.ads = !G.ads && !!GUNS[me.weapon];
    if (k === 'jump') TOUCH.jump = true;
    if (k === 'reload') startReload(me);
    if (k === 'nade' && me.nades > 0) G.nadeAim = true;
    if (k === 'next') { const i = SLOTS.indexOf(me.weapon); switchWeapon(me, SLOTS[(i + 1) % SLOTS.length]); }
    if (k === 'pause') openPause();
    if (k === 'score') renderBoard(!G.boardOpen);
  };
  const release = (b) => { b.classList.remove('held'); const k = b.dataset.b; if (k === 'fire') { G.fireHeld = false; G.fired = false; if (G.nadeAim === 'click') { G.nadeAim = false; if (G.me && !G.paused) throwNade(G.me); } } if (k === 'jump') TOUCH.jump = false; if (k === 'nade' && G.nadeAim) { G.nadeAim = false; if (G.me && !G.paused) throwNade(G.me); } };
  T.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const tch of e.changedTouches) {
      const el = document.elementFromPoint(tch.clientX, tch.clientY), b = el && el.closest && el.closest('.tb');
      if (b) { held[tch.identifier] = b; press(b); if (b.dataset.b === 'fire' || b.dataset.b === 'nade') looks[tch.identifier] = { x: tch.clientX, y: tch.clientY }; continue; }
      if (el && el.closest && el.closest('.stick') && stickId === null) { stickId = tch.identifier; moveStick(tch); continue; }
      looks[tch.identifier] = { x: tch.clientX, y: tch.clientY };
    }
  }, { passive: false });
  T.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const tch of e.changedTouches) {
      if (tch.identifier === stickId) { moveStick(tch); continue; }
      const L = looks[tch.identifier]; if (!L || !G.me || !G.me.alive || G.paused) continue;
      const s = 0.0055 * SET.sens * (G.ads ? camera.fov / SET.fov : 1);
      G.me.yaw -= (tch.clientX - L.x) * s; G.me.pitch = clamp(G.me.pitch - (tch.clientY - L.y) * s, -1.5, 1.5); L.x = tch.clientX; L.y = tch.clientY;
    }
  }, { passive: false });
  const end = (e) => {
    for (const tch of e.changedTouches) {
      if (tch.identifier === stickId) { stickId = null; TOUCH.mx = TOUCH.my = 0; TOUCH.sprint = false; knob.style.transform = ''; }
      if (held[tch.identifier]) { release(held[tch.identifier]); delete held[tch.identifier]; }
      delete looks[tch.identifier];
    }
  };
  T.addEventListener('touchend', end); T.addEventListener('touchcancel', end);
})();

// ---------------------------------------------------------------------
// main loop
// ---------------------------------------------------------------------
let last = performance.now(), orbit = 0;
const vmOff = new V3();
function frame() {
  requestAnimationFrame(frame);
  const nowMs = performance.now(), dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs;
  if (G.running && (!G.paused || G.mode === 'online')) { G.t += dt; update(dt); }
  else if (!G.running && G.world) { G.world.flush(scene, terrainMat, 3); orbit += dt * 0.06; }
  // camera
  const me = G.me;
  if (G.running && me) {
    if (G.spec && !me.alive) camera.position.copy(G.spec.pos); else camera.position.set(me.pos.x, me.pos.y + (me.alive ? 1.55 : 0.6), me.pos.z);
    if (G.shake > 0) camera.position.add(new V3((Math.random() - 0.5) * G.shake * 0.3, (Math.random() - 0.5) * G.shake * 0.3, (Math.random() - 0.5) * G.shake * 0.3));
    camera.rotation.set(me.pitch, me.yaw, me.alive || G.spec ? 0 : 0.5);
    const g = GUNS[me.weapon], target = G.ads && g ? SET.fov / g.zoom : SET.fov;
    if (Math.abs(camera.fov - target) > 0.05) { camera.fov += (target - camera.fov) * Math.min(1, dt * 14); camera.updateProjectionMatrix(); }
  } else {
    camera.position.set(W / 2 + Math.cos(orbit) * 46, 26, D / 2 + Math.sin(orbit) * 46);
    camera.lookAt(W / 2, 6, D / 2);
  }
  updHpBars();
  // gun in hands
  for (const k of SLOTS) VM[k].visible = false;
  if (G.running && me && me.alive && !G.paused && !G.over) {
    const g = GUNS[me.weapon], vm = VM[me.weapon], scoped = G.ads && g && g.scope;
    if (!scoped) {
      vm.visible = true;
      const sp = Math.hypot(me.vel.x, me.vel.z), bob = me.onGround ? Math.sin(G.t * 10) * Math.min(1, sp / 6) : 0;
      const ads = G.ads && g;
      vmOff.set(ads ? 0 : 0.26, (ads ? -0.15 : -0.26) + bob * 0.012 - (me.reloadT > 0 ? 0.15 : 0), ads ? -0.5 : -0.68);
      vm.position.lerp(vmOff, Math.min(1, dt * 16)); vm.position.z += G.kick * 0.05;
      vm.rotation.set(G.kick * 0.12 + (me.reloadT > 0 ? -0.5 : 0), bob * 0.01, 0);
    }
  }
  renderer.clear(); renderer.render(scene, camera); renderer.clearDepth(); renderer.render(vmScene, vmCam);
}

// ---------------------------------------------------------------------
// start: menu over a slowly turning arena; ?room=CODE joins straight away
// ---------------------------------------------------------------------
buildWorld((Math.random() * 1e9) | 0);
renderMenu(); showScreen('menu');
document.addEventListener('langchange', () => { if (!$('menu').hidden) renderMenu(); if (G.running) { hudAll(); } });
const room = new URLSearchParams(location.search).get('room');
// invite link: start once (with the account name when it is ready; a guest name only if the account takes too long)
if (room) { const go = () => { if (!G.running) startGame('online', { code: room.toUpperCase() }); }; if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 6000); } }
document.addEventListener('mal3abready', () => { if (G.me && G.me.local) G.me.name = myName(); });
document.addEventListener('mal3ab-outdated', () => { if (G.running && G.mode === 'online') toMenu(); });   // a new release came out: leave the online match
setInterval(() => { if (G.me && G.me.local && window.Auth && Auth.profile && G.me.name !== Auth.profile.username) G.me.name = Auth.profile.username; }, 3000);   // signed in later
requestAnimationFrame(frame);
window.Mal3abPrepareInvite = async () => {
  const base = location.href.split('?')[0];
  if (G.running && G.mode === 'online' && NET.code) return base + '?room=' + NET.code;
  if (window.Mal3abVersion && !Mal3abVersion.gate()) return null;
  const code = newCode(), o = G.running && G.mode === 'dm' ? Object.assign({}, G.opts, { lv: G.diff, code }) : rulesOpts(getRules('online'), { code });
  if (G.running) toMenu();
  startGame('online', o);                 // the friend's link lands in this match
  return base + '?room=' + code;
};
window.Mal3abLiveInfo = () => G.running && G.mode === 'online' ? { players: 1 + NET.peers.size } : {};   // shown on the game page's live list
window.Mal3abShareLink = () => { const base = location.href.split('?')[0]; return G.running && G.mode === 'online' && NET.code ? base + '?room=' + NET.code : base; };   // chat: "invite to this game"
window.VSGame = { G, NET, damage, rules, isOut, pickups, addPickup, startGame, fire, spawn, boom, toMenu, throwNade, placeBlock };     // handy for testing
})();
