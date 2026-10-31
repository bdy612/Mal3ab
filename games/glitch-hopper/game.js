'use strict';
// =====================================================================
// Glitch Hopper — a rogue data packet escapes a defragmenting hard drive.
// The rules glitch every 5 seconds (gravity flip, mirrored controls,
// invisible blocks, slippery floors, bit shift). Read the clock, learn
// each level's pattern, freeze a glitch when you need more time.
// =====================================================================
(function () {
const C = window.GHCore, LV = window.GH_LEVELS, P = C.P, T = C.T;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const SAVE = 'glitch-hopper-progress', SETS = 'glitch-hopper-settings';

// ------------------------------------------------------------------ strings
addStrings({
  gh_title: 'Glitch Hopper', gh_tag: 'إنت باكت بيانات هربان من هارد بيتعمله ديفراج — والقواعد بتتلخبط كل ٥ ثواني!',
  gh_play: 'العب', gh_continue: 'كمّل — مرحلة {n}', gh_levels: 'المراحل', gh_how: 'إزاي تلعب', gh_back: 'رجوع', gh_menu: 'القائمة',
  gh_sound: 'الأصوات', gh_music: 'المزيكا', gh_on: 'شغالة', gh_off: 'مقفولة', gh_hello: 'أهلًا يا {p} 👋',
  gh_lvl: 'مرحلة {n}', gh_locked: 'مقفولة', gh_total: 'النجوم', gh_reset: 'امسح التقدم', gh_resetQ: 'متأكد إنك عايز تمسح كل تقدمك؟',
  gh_rotate: '📱 لف الموبايل بالعرض عشان تشوف المرحلة أحسن',
  gh_g_none: 'مستقر', gh_g_flip: 'جاذبية مقلوبة', gh_g_rev: 'تحكم معكوس', gh_g_ghost: 'بلوكات مختفية', gh_g_ice: 'أرض متزحلقة', gh_g_shift: 'تبديل البلوكات', gh_g_freeze: 'تجميد',
  gh_d_none: 'كل حاجة طبيعية… استغل الوقت ده.',
  gh_d_flip: 'هتقع لفوق! امشي على السقف — والنط بيرجعك ناحية الأرض.',
  gh_d_rev: 'الشمال بقى يمين واليمين بقى شمال.',
  gh_d_ghost: 'البلوكات بتختفي بس لسه موجودة — افتكر مكانها (بتنوّر كل شوية).',
  gh_d_ice: 'الأرض بتزحلق بس سرعتك بتزيد — وتقدر تنط مسافات أطول.',
  gh_d_shift: 'البلوكات الحمرا بتختفي والزرقا بتظهر.',
  gh_d_freeze: 'لمّ التلج ❄ واضغط E أو Shift: الجليتش اللي شغال يتجمّد ٣ ثواني.',
  gh_d_sweep: 'الديفراج بيمسح من الشمال لليمين — لو لحقك هيمسحك. متقفش!',
  gh_now: 'دلوقتي', gh_next: 'الجاي', gh_frozen: 'متجمّد', gh_defrag: 'ديفراج', gh_stable: 'مستقر — مفيش جليتشات هنا',
  gh_moveToStart: 'اتحرك عشان ساعة الجليتش تبدأ', gh_lost: 'الباكت اتمسح!', gh_saved: '💾 اتحفظ هنا',
  gh_freezeHint: '❄ معاك تلج! اضغط E أو Shift وقت ما تحتاج تجمّد الجليتش', gh_freezeHintT: '❄ معاك تلج! دوس زرار ❄ وقت ما تحتاج تجمّد الجليتش',
  gh_c_spike: 'شوك فاسد', gh_c_corrupt: 'بلوكة فاسدة', gh_c_fall: 'وقعت برّه الهارد', gh_c_crush: 'اتحشرت جوه بلوكة', gh_c_sweep: 'الديفراج لحقك',
  gh_new: 'جليتش جديد!', gh_newItem: 'حاجة جديدة!', gh_pattern: 'نمط الجليتش (بيتكرر)', gh_go: 'يلا بينا!', gh_anyKey: 'أو اضغط Space', gh_par: 'الوقت المطلوب: {t}', gh_parL: 'المطلوب',
  gh_win: 'وصلت للبورت!', gh_time: 'الوقت', gh_best: 'أحسن وقت', gh_deaths: 'مرات الموت', gh_nextLvl: 'المرحلة الجاية', gh_retry: 'حاول تاني', gh_newBest: '★ رقم قياسي جديد ★',
  gh_s1: 'خلّصت المرحلة', gh_s2: 'جبت البت الدهبي', gh_s3: 'خلّصت في أقل من {t}',
  gh_lose: 'الديفراج خلص!', gh_loseMsg: 'الهارد اتنظّم واتكتب فوقك… حاول تخلّص أسرع المرة الجاية.',
  gh_paused: 'وقفة', gh_resume: 'كمّل', gh_restart: 'ابدأ المرحلة من الأول',
  gh_escaped: '🎉 هربت من الهارد خالص!', gh_escapedMsg: 'عدّيت كل القطاعات. جمعت {s} من {m} نجمة — تقدر ترجع تكمّل النجوم.',
  gh_h_goal: 'الهدف', gh_h_goalD: 'وصّل الباكت لبورت الخروج الأخضر في كل مرحلة.',
  gh_h_clock: 'ساعة الجليتش', gh_h_clockD: 'فوق في النص: الجليتش اللي شغال دلوقتي، العداد، واللي جاي بعده. كل مرحلة ليها نمط بيتكرر — احفظه.',
  gh_h_haz: 'الخطر', gh_h_hazD: 'الشوك الأحمر بيمسحك. شريط الديفراج فوق لو اتملى خسرت المرحلة.',
  gh_h_stars: 'النجوم', gh_h_starsD: '٣ نجوم في كل مرحلة: خلّصها، جيب البت الدهبي، وخلّص قبل الوقت المطلوب.',
  gh_keys: 'الأسهم أو A / D: حركة · Space أو W أو ↑: نط · E أو Shift: تجميد · Esc أو P: وقفة · R: إعادة',
  gh_keysT: 'على الموبايل: ◀ ▶ للحركة، ▲ للنط، ❄ للتجميد.',
  gh_n_boot: 'قطاع البداية', gh_n_flip: 'اقلب الجاذبية', gh_n_sky: 'مشي على السقف', gh_n_mirror: 'وضع المراية', gh_n_chase: 'مطاردة الديفراج',
  gh_n_upside: 'مقلوبة ومعكوسة', gh_n_ghost: 'القطاع الشبح', gh_n_phantom: 'السقف الخفي', gh_n_ice: 'التلج الأسود', gh_n_shift: 'تبديل البتات',
  gh_n_cold: 'تبديل متزحلق', gh_n_ghostshift: 'شبح وتبديل', gh_n_cache: 'الكاش المقلوب', gh_n_frag: 'تفتيت', gh_n_kernel: 'كيرنل بانيك',
  gh_t_boot: 'اتحرك، نط فوق الشوك ووصل للبورت الأخضر. البت الدهبي اختياري بس بيديك نجمة.',
  gh_t_flip: 'كل ٥ ثواني الجاذبية بتتقلب. لما تتقلب هتطلع للسقف — امشي عليه وعدّي فوق الحيطة. خلي بالك من الشوك اللي في السقف!',
  gh_t_sky: 'الطريق على السقف طويل. لمّ التلج ❄ وجمّد الجاذبية المقلوبة عشان تلحق توصل.',
  gh_t_mirror: 'التحكم بيتعكس كل شوية. بص على "الجاي" واستعد قبلها.',
  gh_t_chase: 'الديفراج بيمسح من الشمال — متقفش حتى والتحكم معكوس!',
  gh_t_upside: 'امشي على الأرض لما السقف فيه شوك، وعلى السقف لما الأرض فيها شوك. والتحكم هيتعكس في النص.',
  gh_t_ghost: 'المنصات هتختفي بس هتفضل موجودة. احفظ أماكنها قبل ما تختفي.',
  gh_t_phantom: 'هتطلع لسقف مش شايفه! بص كويس على شكل السقف قبل الجليتش.',
  gh_t_ice: 'الحفرة الكبيرة مستحيلة بالسرعة العادية. استنى التلج واجري عليه ونط.',
  gh_t_shift: 'الأحمر بيختفي والأزرق بيظهر. استنى اللحظة الصح — ومتفضلش جوه بلوكة لما ترجع!',
  gh_t_cold: 'كوبري أزرق متزحلق… آخر حفرة محتاجة التبديل والتلج مع بعض.',
  gh_t_ghostshift: 'الحجارة الزرقا هتختفي من قدامك بس هتفضل موجودة. كمّل نط ومتبطلش.',
  gh_t_cache: 'سقف، بعدين كوبري أزرق، بعدين سقف بتحكم معكوس. التلج هيساعدك.',
  gh_t_frag: 'كل الجليتشات ورا بعض. كل جزء محتاج جليتش معين — اعرف الترتيب.',
  gh_t_kernel: 'آخر مرحلة: كل حاجة مع بعض والديفراج وراك. بالتوفيق يا بطل!',
}, {
  gh_title: 'Glitch Hopper', gh_tag: 'You are a rogue data packet escaping a defragmenting drive — and the rules glitch every 5 seconds!',
  gh_play: 'Play', gh_continue: 'Continue — Level {n}', gh_levels: 'Levels', gh_how: 'How to Play', gh_back: 'Back', gh_menu: 'Menu',
  gh_sound: 'Sounds', gh_music: 'Music', gh_on: 'On', gh_off: 'Off', gh_hello: 'Hi {p} 👋',
  gh_lvl: 'Level {n}', gh_locked: 'Locked', gh_total: 'Stars', gh_reset: 'Reset Progress', gh_resetQ: 'Erase all your progress?',
  gh_rotate: '📱 Turn your phone sideways for a bigger view',
  gh_g_none: 'Stable', gh_g_flip: 'Gravity Flip', gh_g_rev: 'Reversed', gh_g_ghost: 'Invisible', gh_g_ice: 'Slippery', gh_g_shift: 'Bit Shift', gh_g_freeze: 'Freeze',
  gh_d_none: 'Everything is normal — use the time.',
  gh_d_flip: 'You fall upwards! Walk on the ceiling — jumping pushes you back toward the floor.',
  gh_d_rev: 'Left is right and right is left.',
  gh_d_ghost: 'Blocks turn invisible but stay solid — remember where they are (they flicker now and then).',
  gh_d_ice: 'Floors get slippery, but you build up speed — and can jump much farther.',
  gh_d_shift: 'Red blocks vanish and blue blocks appear.',
  gh_d_freeze: 'Grab a freeze ❄ and press E or Shift: the current glitch is locked for 3 seconds.',
  gh_d_sweep: 'The defrag sweeps from left to right — if it catches you, you are wiped. Keep moving!',
  gh_now: 'Now', gh_next: 'Next', gh_frozen: 'Frozen', gh_defrag: 'Defrag', gh_stable: 'Stable — No Glitches Here',
  gh_moveToStart: 'Move to start the glitch clock', gh_lost: 'Packet Lost!', gh_saved: '💾 Checkpoint Saved',
  gh_freezeHint: '❄ Freeze ready! Press E or Shift when you need to lock the glitch', gh_freezeHintT: '❄ Freeze ready! Tap ❄ when you need to lock the glitch',
  gh_c_spike: 'Corrupted Spike', gh_c_corrupt: 'Corrupted Block', gh_c_fall: 'Fell Out of the Drive', gh_c_crush: 'Crushed Inside a Block', gh_c_sweep: 'The Defrag Caught You',
  gh_new: 'New Glitch!', gh_newItem: 'New!', gh_pattern: 'Glitch Pattern (Repeats)', gh_go: 'Go!', gh_anyKey: 'Or Press Space', gh_par: 'Par Time: {t}', gh_parL: 'Par',
  gh_win: 'Port Reached!', gh_time: 'Time', gh_best: 'Best', gh_deaths: 'Deaths', gh_nextLvl: 'Next Level', gh_retry: 'Retry', gh_newBest: '★ New Record ★',
  gh_s1: 'Finished the Level', gh_s2: 'Grabbed the Golden Bit', gh_s3: 'Finished Under {t}',
  gh_lose: 'Defrag Complete!', gh_loseMsg: 'The drive got defragmented and you were overwritten. Try to be faster next time.',
  gh_paused: 'Paused', gh_resume: 'Resume', gh_restart: 'Restart Level',
  gh_escaped: '🎉 You Escaped the Drive!', gh_escapedMsg: 'Every sector cleared. You collected {s} of {m} stars — come back for the rest.',
  gh_h_goal: 'Goal', gh_h_goalD: 'Guide the packet to the green exit port in every level.',
  gh_h_clock: 'The Glitch Clock', gh_h_clockD: 'Top center: the glitch that is active now, the countdown, and the one coming next. Each level repeats its own pattern — memorize it.',
  gh_h_haz: 'Danger', gh_h_hazD: 'Red spikes wipe you. If the defrag bar at the top fills up, you lose the level.',
  gh_h_stars: 'Stars', gh_h_starsD: '3 stars per level: finish it, grab the golden bit, and beat the par time.',
  gh_keys: 'Arrows or A / D: move · Space, W or ↑: jump · E or Shift: freeze · Esc or P: pause · R: restart',
  gh_keysT: 'On phones: ◀ ▶ to move, ▲ to jump, ❄ to freeze.',
  gh_n_boot: 'Boot Sector', gh_n_flip: 'Flip Switch', gh_n_sky: 'Sky Walk', gh_n_mirror: 'Mirror Mode', gh_n_chase: 'Defrag Chase',
  gh_n_upside: 'Upside Mirror', gh_n_ghost: 'Ghost Sector', gh_n_phantom: 'Phantom Ceiling', gh_n_ice: 'Black Ice', gh_n_shift: 'Bit Shift',
  gh_n_cold: 'Cold Swap', gh_n_ghostshift: 'Ghost Shift', gh_n_cache: 'Inverted Cache', gh_n_frag: 'Fragmentation', gh_n_kernel: 'Kernel Panic',
  gh_t_boot: 'Move, jump over the spikes and reach the green port. The golden bit is optional, but it is worth a star.',
  gh_t_flip: 'Every 5 seconds gravity flips. When it does you fall to the ceiling — walk along it over the wall. Watch out for ceiling spikes!',
  gh_t_sky: 'The ceiling route is long. Grab a freeze ❄ and lock the flipped gravity in place to make it across.',
  gh_t_mirror: 'Your controls reverse every other step. Watch NEXT and get ready before it hits.',
  gh_t_chase: 'The defrag sweeps in from the left — keep moving, even when your controls are mirrored!',
  gh_t_upside: 'Walk the floor under spiked ceilings and the ceiling over spiked floors. Halfway through, the controls reverse.',
  gh_t_ghost: 'The platforms will vanish but stay solid. Memorize them before they go.',
  gh_t_phantom: 'You will fall up into a ceiling you cannot see! Study its shape before the glitch.',
  gh_t_ice: 'The big gap is impossible at normal speed. Wait for the ice, take a run-up and jump.',
  gh_t_shift: 'Red vanishes, blue appears. Wait for the right moment — and do not be inside a block when it comes back!',
  gh_t_cold: 'A slippery blue bridge… the last gap needs shift and ice at the same time.',
  gh_t_ghostshift: 'The blue stepping stones vanish from view but stay solid. Keep hopping.',
  gh_t_cache: 'The ceiling, then a blue bridge, then the ceiling again with mirrored controls. Freezes help.',
  gh_t_frag: 'Every glitch, one after another. Each part needs a specific glitch — learn the order.',
  gh_t_kernel: 'The final level: everything at once, with the defrag right behind you. Good luck!',
});

// ------------------------------------------------------------------ save data
let prog = lsGet(SAVE, null);
if (!prog || typeof prog !== 'object') prog = { unlocked: 1, lv: {} };
if (!prog.lv) prog.lv = {};
let sets = Object.assign({ sfx: true, music: true, hinted: false }, lsGet(SETS, {}));
const saveProg = () => lsSet(SAVE, prog), saveSets = () => lsSet(SETS, sets);
const starsOf = (lv) => (prog.lv[lv.id] && prog.lv[lv.id].s) || [false, false, false];
const totalStars = () => LV.reduce((a, lv) => a + starsOf(lv).filter(Boolean).length, 0);

// ------------------------------------------------------------------ glitch look
const GC = { none: '#39ff88', flip: '#b98cff', rev: '#ff4f7a', ghost: '#a9bcff', ice: '#7df9ff', shift: '#ffb703', freeze: '#a8f3ff' };
const stColor = (st) => st.list.length ? GC[st.list[0]] : GC.none;
const stName = (st) => st.list.length ? st.list.map(k => t('gh_g_' + k)).join(' + ') : t('gh_g_none');
const firstUse = {};
LV.forEach((lv, i) => {
  (lv.seq || []).forEach(k => k.split('+').forEach(g => { if (g !== 'none' && firstUse[g] === undefined) firstUse[g] = i; }));
  if (firstUse.freeze === undefined && lv.map.some(r => r.includes('F'))) firstUse.freeze = i;
  if (firstUse.sweep === undefined && lv.sweep) firstUse.sweep = i;
});

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
// glitch icon centred at (x, y), "radius" r
function drawIcon(c, kind, x, y, r, frame = true) {
  const col = GC[kind] || GC.none;
  c.save(); c.translate(x, y);
  if (frame) { rr(c, -r, -r, 2 * r, 2 * r, r * 0.32); c.fillStyle = 'rgba(8,10,26,.9)'; c.fill(); c.lineWidth = r * 0.12; c.strokeStyle = col; c.stroke(); }
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = r * 0.16; c.lineCap = 'round'; c.lineJoin = 'round';
  const k = r * 0.55;
  const arrow = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); const a = Math.atan2(y1 - y0, x1 - x0), h = k * 0.45; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(a - 0.6), y1 - h * Math.sin(a - 0.6)); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(a + 0.6), y1 - h * Math.sin(a + 0.6)); c.stroke(); };
  if (kind === 'none') { c.beginPath(); c.moveTo(-k * 0.8, 0); c.lineTo(-k * 0.2, k * 0.6); c.lineTo(k * 0.9, -k * 0.6); c.stroke(); }
  else if (kind === 'flip') { arrow(-k * 0.45, k * 0.8, -k * 0.45, -k * 0.8); arrow(k * 0.45, -k * 0.8, k * 0.45, k * 0.8); }
  else if (kind === 'rev') { arrow(-k * 0.8, -k * 0.4, k * 0.8, -k * 0.4); arrow(k * 0.8, k * 0.45, -k * 0.8, k * 0.45); }
  else if (kind === 'ghost') { c.setLineDash([k * 0.32, k * 0.26]); c.strokeRect(-k * 0.8, -k * 0.8, k * 1.6, k * 1.6); c.setLineDash([]); c.globalAlpha = 0.5; c.fillRect(-k * 0.2, -k * 0.2, k * 0.4, k * 0.4); }
  else if (kind === 'ice') { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(-Math.cos(a) * k, -Math.sin(a) * k); c.lineTo(Math.cos(a) * k, Math.sin(a) * k); c.stroke(); } c.lineWidth *= 0.7; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, px = Math.cos(a) * k * 0.6, py = Math.sin(a) * k * 0.6; c.beginPath(); c.moveTo(px + Math.cos(a + 0.9) * k * 0.28, py + Math.sin(a + 0.9) * k * 0.28); c.lineTo(px, py); c.lineTo(px + Math.cos(a - 0.9) * k * 0.28, py + Math.sin(a - 0.9) * k * 0.28); c.stroke(); } }
  else if (kind === 'shift') { c.lineWidth = r * 0.13; c.strokeStyle = '#ff3b6b'; c.setLineDash([k * 0.25, k * 0.18]); c.strokeRect(-k * 0.9, -k * 0.9, k * 1.1, k * 1.1); c.setLineDash([]); c.fillStyle = '#4da3ff'; c.globalAlpha = 0.9; c.fillRect(-k * 0.2, -k * 0.2, k * 1.1, k * 1.1); }
  else if (kind === 'freeze') { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; c.lineTo(Math.cos(a) * k * 1.05, Math.sin(a) * k * 1.05); } c.closePath(); c.lineWidth = r * 0.12; c.stroke(); c.fillRect(-k * 0.38, -k * 0.45, k * 0.25, k * 0.9); c.fillRect(k * 0.13, -k * 0.45, k * 0.25, k * 0.9); }
  c.restore();
}
const ICON = {};
['none', 'flip', 'rev', 'ghost', 'ice', 'shift', 'freeze'].forEach(k => {
  const cc = document.createElement('canvas'); cc.width = cc.height = 64; drawIcon(cc.getContext('2d'), k, 32, 32, 28); ICON[k] = cc.toDataURL();
});
const stIcons = (st) => (st.list.length ? st.list : ['none']).map(k => `<img src="${ICON[k]}" alt="">`).join('');

// ------------------------------------------------------------------ audio
const Snd = {
  ac: null, master: null, sfxG: null, musG: null, noise: null,
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ac = new AC(); } catch (e) { return; }
    const a = this.ac;
    this.master = a.createGain(); this.master.gain.value = 0.7; this.master.connect(a.destination);
    this.sfxG = a.createGain(); this.sfxG.gain.value = sets.sfx ? 0.55 : 0; this.sfxG.connect(this.master);
    this.musG = a.createGain(); this.musG.gain.value = 0; this.musG.connect(this.master);
    const n = a.createBuffer(1, a.sampleRate * 1, a.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = n;
    Music.start();
  },
  apply() { if (!this.ac) return; const t0 = this.ac.currentTime; this.sfxG.gain.setTargetAtTime(sets.sfx ? 0.55 : 0, t0, 0.02); Music.level(); },
  tone(f, dur, type = 'square', vol = 0.15, f2 = 0, delay = 0, out) {
    if (!this.ac) return; const a = this.ac, t0 = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out || this.sfxG); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  hiss(dur, vol = 0.12, freq = 3000, delay = 0, q = 0.8, out, type = 'bandpass') {
    if (!this.ac) return; const a = this.ac, t0 = a.currentTime + delay;
    const s = a.createBufferSource(); s.buffer = this.noise; const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(out || this.sfxG); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
  },
  play(name, k) {
    if (!this.ac || !sets.sfx) return;
    switch (name) {
      case 'jump': this.tone(360, 0.11, 'square', 0.07, 760); break;
      case 'land': this.tone(150, 0.08, 'triangle', clamp(k / 25, 0.03, 0.14), 60); this.hiss(0.05, 0.04, 900); break;
      case 'die': this.hiss(0.35, 0.22, 1800, 0, 0.6); this.tone(520, 0.4, 'sawtooth', 0.12, 40); this.tone(90, 0.3, 'square', 0.08, 30, 0.05); break;
      case 'switch': for (let i = 0; i < 5; i++) this.tone(200 + Math.random() * 1400, 0.035, 'square', 0.06, 0, i * 0.03); this.hiss(0.12, 0.08, 5000, 0, 2); break;
      case 'tick': this.tone(k === 1 ? 1180 : 880, 0.06, 'sine', 0.09); break;
      case 'freeze': this.tone(1800, 0.5, 'sine', 0.1, 380); this.tone(2400, 0.25, 'triangle', 0.05, 1200, 0.05); this.hiss(0.4, 0.06, 7000, 0, 3, null, 'highpass'); break;
      case 'thaw': this.tone(420, 0.2, 'triangle', 0.08, 980); break;
      case 'pick': this.tone(660, 0.08, 'triangle', 0.1); this.tone(990, 0.1, 'triangle', 0.1, 0, 0.07); this.tone(1480, 0.14, 'sine', 0.07, 0, 0.14); break;
      case 'frag': [880, 1175, 1480, 1760].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.09, 0, i * 0.06)); break;
      case 'check': this.tone(523, 0.12, 'square', 0.06); this.tone(784, 0.18, 'square', 0.06, 0, 0.1); break;
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'square', 0.07, 0, i * 0.09)); this.tone(1568, 0.5, 'triangle', 0.08, 0, 0.45); break;
      case 'lose': this.tone(440, 0.9, 'sawtooth', 0.1, 55); this.hiss(0.8, 0.12, 700, 0.1, 0.5); break;
      case 'respawn': this.tone(300, 0.15, 'sine', 0.07, 900); break;
      case 'ui': this.tone(700, 0.04, 'square', 0.05); break;
      case 'deny': this.tone(140, 0.12, 'square', 0.07); this.tone(110, 0.14, 'square', 0.07, 0, 0.08); break;
      case 'start': this.tone(440, 0.06, 'square', 0.05); this.tone(660, 0.08, 'square', 0.05, 0, 0.06); break;
    }
  },
};
// little procedural synthwave loop; reacts to the active glitch
const Music = {
  timer: 0, next: 0, step: 0, tempo: 116,
  start() { if (this.timer || !Snd.ac) return; this.next = Snd.ac.currentTime + 0.1; this.timer = setInterval(() => this.sched(), 50); this.level(); },
  level() { if (!Snd.ac) return; const v = !sets.music ? 0 : (mode === 'play' ? 0.2 : 0.12); Snd.musG.gain.setTargetAtTime(v, Snd.ac.currentTime, 0.3); },
  sched() {
    const a = Snd.ac; if (!a || a.state !== 'running') return;
    if (this.next < a.currentTime - 0.2) this.next = a.currentTime + 0.05;
    const s16 = 60 / this.tempo / 4;
    while (this.next < a.currentTime + 0.25) { this.note(this.step, this.next - a.currentTime); this.next += s16; this.step++; }
  },
  note(i, d) {
    if (!sets.music) return;
    const st = (cur && cur.s && mode === 'play') ? cur.s.active : null, playing = mode === 'play';
    const roots = [45, 41, 48, 43], bar = Math.floor(i / 16) % 4, s = i % 16, root = roots[bar];
    const mf = (m) => 440 * Math.pow(2, (m - 69) / 12), out = Snd.musG;
    if (s % 2 === 0) Snd.tone(mf(root + (s % 4 === 2 ? 12 : 0)), 0.16, 'sawtooth', 0.05, 0, d, out);
    let arp = [0, 3, 7, 10, 12, 10, 7, 3];
    if (st && st.rev) arp = arp.slice().reverse();
    let up = 24; if (st && st.flip) up = 36; if (st && st.ice) up = 31;
    if (s % 2 === 1 || (st && st.ice)) {
      const m = root + up + arp[(i >> (st && st.ice ? 0 : 1)) % 8] + (st && st.shift ? 1 : 0);
      Snd.tone(mf(m), st && st.ice ? 0.09 : 0.12, st && st.ghost ? 'sine' : 'triangle', st && st.ghost ? 0.02 : 0.035, 0, d, out);
    }
    if (playing && s % 4 === 0) Snd.tone(140, 0.14, 'sine', 0.16, 42, d, out);
    if (s % 4 === 2) Snd.hiss(0.04, 0.05, 8000, d, 1, out, 'highpass');
    if (playing && (s === 4 || s === 12)) Snd.hiss(0.12, 0.06, 1800, d, 0.7, out);
  },
};

// ------------------------------------------------------------------ canvas
const cv = $('c'), ctx = cv.getContext('2d');
const buf = document.createElement('canvas'), bctx = buf.getContext('2d');
const tA = document.createElement('canvas'), tAc = tA.getContext('2d'), tB = document.createElement('canvas'), tBc = tB.getContext('2d');
let VW = 1, VH = 1, DPR = 1, scanPat = null, vign = null, bgC = null;
let touchMode = matchMedia('(pointer: coarse)').matches;
const drops = [];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = Math.max(1, innerWidth); VH = Math.max(1, innerHeight);
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  buf.width = cv.width; buf.height = cv.height;
  tA.width = tB.width = Math.max(1, cv.width >> 1); tA.height = tB.height = Math.max(1, cv.height >> 1);
  const sp = document.createElement('canvas'), per = Math.max(3, Math.round(3 * DPR)); sp.width = 4; sp.height = per;
  const sc = sp.getContext('2d'); sc.fillStyle = 'rgba(0,0,0,.22)'; sc.fillRect(0, 0, 4, Math.max(1, Math.round(per / 3)));
  scanPat = ctx.createPattern(sp, 'repeat');
  vign = document.createElement('canvas'); vign.width = cv.width; vign.height = cv.height;
  const vc = vign.getContext('2d'), g = vc.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.35, cv.width / 2, cv.height / 2, Math.hypot(cv.width, cv.height) * 0.6);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); vc.fillStyle = g; vc.fillRect(0, 0, vign.width, vign.height);
  bgC = document.createElement('canvas'); bgC.width = 2; bgC.height = 256;
  const bc = bgC.getContext('2d'), bg = bc.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, '#05060f'); bg.addColorStop(0.55, '#0a0d24'); bg.addColorStop(1, '#140a26'); bc.fillStyle = bg; bc.fillRect(0, 0, 2, 256);
  while (drops.length < 46) drops.push({ x: Math.random(), y: Math.random(), v: 0.04 + Math.random() * 0.12, ch: Math.random() < 0.5 ? '0' : '1', s: 10 + Math.random() * 8 });
  layoutTouch();
  if (cur) fitView(cur, true);
}

// ------------------------------------------------------------------ view / camera
function hudBand() { return VW < 720 ? 106 : 68; }
function fitView(v, snap) {
  const L = v.L, portrait = VH > VW * 1.1;
  const top = v.attract ? 0 : hudBand(), bottom = (!v.attract && touchMode && portrait) ? Math.min(220, VH * 0.26) : 0;
  const ah = Math.max(80, VH - top - bottom);
  const minCols = portrait ? 15 : 24;
  v.ts = Math.max(8, Math.min(ah / L.H, VW / Math.min(L.W, minCols)));
  if (v.attract) v.ts = Math.max(v.ts, VH / 13);
  v.top = top; v.ah = ah;
  v.vw = VW / v.ts; v.vh = ah / v.ts;
  v.offX = L.W * v.ts < VW ? (VW - L.W * v.ts) / 2 : 0;
  v.offY = L.H * v.ts < ah ? (ah - L.H * v.ts) / 2 : 0;
  if (snap) { const tg = camTarget(v); v.cam.x = tg.x; v.cam.y = tg.y; }
}
function camTarget(v) {
  const L = v.L; let px, py;
  if (v.s) { px = v.s.x + P.w / 2 + v.look; py = v.s.y + P.h / 2; } else { px = v.cam.x + v.vw / 2; py = L.H / 2; }
  let x = px - v.vw / 2, y = py - v.vh / 2;
  x = L.W <= v.vw ? 0 : clamp(x, 0, L.W - v.vw);
  y = L.H <= v.vh ? 0 : clamp(y, 0, L.H - v.vh);
  return { x, y };
}

// ------------------------------------------------------------------ level geometry → paths
function buildPaths(L) {
  const W = L.W, H = L.H, at = (c, r) => (c < 0 || r < 0 || c >= W || r >= H) ? -1 : L.grid[r * W + c];
  const out = {};
  const hash = (c, r) => ((c * 73856093) ^ (r * 19349663)) >>> 0;
  for (const [name, tt] of [['W', T.W], ['R', T.R], ['B', T.B]]) {
    const fill = new Path2D(), edge = new Path2D(), inner = new Path2D(), tiles = [];
    for (let r = 0; r < H; r++) {
      let c = 0;
      while (c < W) {
        if (at(c, r) !== tt) { c++; continue; }
        const c0 = c; while (c < W && at(c, r) === tt) c++;
        fill.rect(c0, r, c - c0, 1);
      }
    }
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      if (at(c, r) !== tt) continue;
      const exposed = [at(c, r - 1), at(c + 1, r), at(c, r + 1), at(c - 1, r)].map(n => n !== tt && n !== -1);
      if (exposed[0]) { edge.moveTo(c, r); edge.lineTo(c + 1, r); }
      if (exposed[1]) { edge.moveTo(c + 1, r); edge.lineTo(c + 1, r + 1); }
      if (exposed[2]) { edge.moveTo(c, r + 1); edge.lineTo(c + 1, r + 1); }
      if (exposed[3]) { edge.moveTo(c, r); edge.lineTo(c, r + 1); }
      if (exposed.some(Boolean)) tiles.push({ c, r, ph: (hash(c, r) % 1000) / 1000 });
      const h = hash(c, r);
      if (tt === T.W) {
        if (h % 7 === 0) { inner.moveTo(c + 0.2, r + 0.5); inner.lineTo(c + 0.55, r + 0.5); inner.lineTo(c + 0.55, r + 0.25); inner.rect(c + 0.5, r + 0.2, 0.1, 0.1); }
        else if (h % 7 === 3) inner.rect(c + 0.3, r + 0.3, 0.4, 0.4);
        else if (h % 11 === 5) { inner.moveTo(c + 0.15, r + 0.75); inner.lineTo(c + 0.85, r + 0.75); }
      } else { inner.moveTo(c + 0.2, r + 0.8); inner.lineTo(c + 0.8, r + 0.2); }
    }
    out[name] = { fill, edge, inner, tiles, any: tiles.length > 0 };
  }
  const ice = new Path2D(), grid = new Path2D();
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const tt = at(c, r); if (tt !== T.W && tt !== T.R && tt !== T.B) continue;
    const up = at(c, r - 1), dn = at(c, r + 1);
    if (up !== -1 && up !== T.W && up !== tt) ice.rect(c, r - 0.02, 1, 0.13);
    if (dn !== -1 && dn !== T.W && dn !== tt) ice.rect(c, r + 0.89, 1, 0.13);
  }
  for (let c = 1; c < W; c++) { grid.moveTo(c, 0); grid.lineTo(c, H); }
  for (let r = 1; r < H; r++) { grid.moveTo(0, r); grid.lineTo(W, r); }
  out.ice = ice; out.grid = grid;
  out.spikes = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const tt = at(c, r); if (tt >= T.SU && tt <= T.X) out.spikes.push({ c, r, t: tt }); }
  return out;
}

// ------------------------------------------------------------------ session
let mode = 'menu', cur = null, attract = null, T0 = 0, acc = 0, testInput = null, holdLoop = false, endTok = 0;
const fx = { g: 0, gMax: 0.45, shake: 0, banner: null, flash: 0, frost: 0 };
const parts = [];

function newView(li, isAttract) {
  const lv = LV[li], L = C.load(lv);
  const v = { li, lv, L, paths: buildPaths(L), cam: { x: 0, y: 0 }, look: 0, attract: !!isAttract, trail: [], flipS: 1, sq: { x: 1, y: 1 }, spawnT: 0, rot: 0 };
  if (!isAttract) { v.s = C.create(L); v.px = v.s.x; v.py = v.s.y; }
  fitView(v, true);
  return v;
}
function makeAttract() {
  const order = [5, 9, 11, 13, 7, 2]; const li = order[Math.floor(Math.random() * order.length)] % LV.length;
  attract = newView(li, true); attract.cam.x = 0; attract.dir = 1; attract.clock = 0;
}

// ------------------------------------------------------------------ input
const keys = {};
const KEYMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', Space: 'j', ArrowUp: 'j', KeyW: 'j', KeyZ: 'j', KeyK: 'j', KeyE: 'f', ShiftLeft: 'f', ShiftRight: 'f', KeyX: 'f', KeyL: 'f' };
const touchState = { l: false, r: false, j: false, f: false };
const pad = { l: false, r: false, j: false, f: false, start: false };
function getInput() {
  if (testInput) return testInput;
  return {
    l: !!(keys.l || touchState.l || pad.l), r: !!(keys.r || touchState.r || pad.r),
    jump: !!(keys.j || touchState.j || pad.j), freeze: !!(keys.f || touchState.f || pad.f),
  };
}
addEventListener('keydown', (e) => {
  Snd.init();
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const a = KEYMAP[e.code];
  if (mode === 'play') {
    if (a) { keys[a] = true; e.preventDefault(); }
    if (e.code === 'Escape' || e.code === 'KeyP') { pause(); e.preventDefault(); }
    else if (e.code === 'KeyR' && !e.repeat) { restart(); e.preventDefault(); }
    return;
  }
  if (a) keys[a] = true;
  if (e.repeat) return;
  if (mode === 'intro' && (a === 'j' || e.code === 'Enter')) { e.preventDefault(); go(); return; }
  if (e.code === 'Escape' || (e.code === 'KeyP' && mode === 'paused')) {
    e.preventDefault();
    if (mode === 'paused') resume(); else if (mode === 'levels' || mode === 'how') showMenu(); else if (mode === 'intro' || mode === 'win' || mode === 'lose') showLevels();
    return;
  }
  if ((mode === 'win' || mode === 'lose') && e.code === 'KeyR') { e.preventDefault(); startLevel(cur.li, true); }
});
addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) keys[a] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (mode === 'play') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') pause(); });

// touch buttons: one layer tracks every finger and lights the buttons under them
const TB = { l: $('tL'), r: $('tR'), j: $('tJ'), f: $('tF') }, tRects = {};
const fingers = new Map();
function layoutTouch() {
  const portrait = VH > VW * 1.1, s = clamp(Math.min(VW, VH) * (portrait ? 0.2 : 0.17), 58, 92), m = Math.max(14, s * 0.22);
  const bottom = portrait ? Math.max(18, VH * 0.035) : Math.max(14, VH * 0.04);
  const place = (el, k, x, y, size) => { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = el.style.height = size + 'px'; tRects[k] = { x, y, w: size, h: size }; };
  place(TB.l, 'l', m, VH - bottom - s, s);
  place(TB.r, 'r', m + s + m * 0.8, VH - bottom - s, s);
  const js = s * 1.12;
  place(TB.j, 'j', VW - m - js, VH - bottom - js, js);
  place(TB.f, 'f', VW - m - js - s * 0.82 - m * 0.6, VH - bottom - s * 0.82 - (portrait ? js * 0.55 : js * 0.45), s * 0.82);
}
function updateFingers() {
  const st = { l: false, r: false, j: false, f: false };
  for (const p of fingers.values()) {
    let best = null, bd = 1e9;
    for (const k in tRects) {
      const r = tRects[k], cx = r.x + r.w / 2, cy = r.y + r.h / 2, d = Math.hypot(p.x - cx, p.y - cy);
      if (d < r.w * 0.5 + 26 && d < bd) { bd = d; best = k; }
    }
    if (best) st[best] = true;
  }
  if (st.l && st.r) { /* both under one thumb edge: keep the nearer */ }
  for (const k in st) { touchState[k] = st[k]; TB[k].classList.toggle('on', st[k]); }
}
const tl = $('touchLayer');
tl.addEventListener('pointerdown', (e) => { Snd.init(); fingers.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { tl.setPointerCapture(e.pointerId); } catch (er) {} updateFingers(); e.preventDefault(); });
tl.addEventListener('pointermove', (e) => { if (fingers.has(e.pointerId)) { fingers.set(e.pointerId, { x: e.clientX, y: e.clientY }); updateFingers(); } e.preventDefault(); });
const fingerUp = (e) => { fingers.delete(e.pointerId); updateFingers(); };
tl.addEventListener('pointerup', fingerUp); tl.addEventListener('pointercancel', fingerUp); tl.addEventListener('lostpointercapture', fingerUp);
addEventListener('touchstart', () => { if (!touchMode) { touchMode = true; document.body.classList.add('touch'); if (cur) fitView(cur, false); } Snd.init(); }, { passive: true });
addEventListener('pointerdown', () => Snd.init());
document.addEventListener('contextmenu', (e) => { if (mode === 'play') e.preventDefault(); });

function pollPad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : []; let g = null;
  for (const x of gps) if (x && x.connected) { g = x; break; }
  if (!g) return;
  const b = (i) => g.buttons[i] && g.buttons[i].pressed, ax = g.axes[0] || 0;
  pad.l = ax < -0.4 || b(14); pad.r = ax > 0.4 || b(15); pad.j = b(0) || b(12); pad.f = b(2) || b(1) || b(5) || b(4);
  const st = b(9);
  if (st && !pad.start) { if (mode === 'play') pause(); else if (mode === 'paused') resume(); else if (mode === 'intro') go(); }
  if (pad.j && mode === 'intro' && !pad.jPrev) go();
  pad.start = st; pad.jPrev = pad.j;
}

// ------------------------------------------------------------------ flow
const scr = $('screen');
function setMode(m) {
  mode = m;
  document.body.classList.toggle('playing', m === 'play');
  document.body.classList.toggle('touch', touchMode);
  Music.level();
}
function startLevel(li, skipIntro) {
  li = clamp(li, 0, LV.length - 1);
  endTok++;
  cur = newView(li, false);
  parts.length = 0; fx.g = 0; fx.shake = 0; fx.banner = null; fx.flash = 0; fx.frost = 0; acc = 0;
  for (const k in keys) keys[k] = false;
  if (skipIntro) go(); else { setMode('intro'); renderScreen(); }
}
function go() {
  if (!cur) return;
  Snd.init(); Snd.play('start');
  setMode('play'); scr.innerHTML = ''; scr.className = '';
  for (const k in keys) keys[k] = false;
  acc = 0;
}
function pause() { if (mode !== 'play') return; setMode('paused'); renderScreen(); }
function resume() { if (mode !== 'paused') return; for (const k in keys) keys[k] = false; setMode('play'); scr.innerHTML = ''; scr.className = ''; acc = 0; }
function restart() { if (cur) startLevel(cur.li, true); }
function showMenu() { endTok++; cur = null; setMode('menu'); if (!attract) makeAttract(); renderScreen(); }
function showLevels() { endTok++; cur = null; setMode('levels'); if (!attract) makeAttract(); renderScreen(); }
function showHow() { setMode('how'); renderScreen(); }

function finishWin() {
  const s = cur.s, lv = cur.lv, L = cur.L;
  const got = [true, L.frags.length ? s.tg.every(Boolean) : true, s.time <= lv.par];
  const old = prog.lv[lv.id] || { s: [false, false, false], best: null };
  const isBest = old.best == null || s.time < old.best;
  prog.lv[lv.id] = { s: old.s.map((v, i) => v || got[i]), best: isBest ? +s.time.toFixed(2) : old.best };
  prog.unlocked = Math.max(prog.unlocked || 1, Math.min(LV.length, cur.li + 2));
  saveProg();
  cur.result = { got, isBest, best: prog.lv[lv.id].best, time: s.time, deaths: s.deaths };
  const tok = ++endTok;
  setTimeout(() => { if (tok === endTok && cur) { setMode('win'); renderScreen(); } }, 750);
}
function finishLose() {
  const tok = ++endTok;
  setTimeout(() => { if (tok === endTok && cur) { setMode('lose'); renderScreen(); } }, 900);
}

// ------------------------------------------------------------------ DOM screens
const fmt = (x) => { if (x == null || !isFinite(x)) return '--'; const m = Math.floor(x / 60), s = x - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const lvName = (lv) => t('gh_n_' + lv.id);
function renderScreen() {
  const ar = getLang() === 'ar';
  scr.className = '';
  let h = '';
  if (mode === 'menu') {
    const nxt = Math.min(LV.length - 1, (prog.unlocked || 1) - 1), started = Object.keys(prog.lv).length > 0;
    const nm = window.Auth && Auth.name && Auth.name();
    h = `<div data-m3pop class="panel menu">
      <div class="logo" data-t="GLITCH HOPPER">GLITCH <b>HOPPER</b></div>
      <div class="tag">${esc(t('gh_tag'))}</div>
      ${nm ? `<div class="hello">${esc(t('gh_hello', { p: nm }))}</div>` : ''}
      <div class="col">
        <button class="btn block" data-act="continue">▶ ${esc(started ? t('gh_continue', { n: nxt + 1 }) : t('gh_play'))}</button>
        <button class="btn sec block" data-act="levels">▦ ${esc(t('gh_levels'))}</button>
        <button class="btn sec block" data-act="how">? ${esc(t('gh_how'))}</button>
        <div class="row">
          <button class="btn sec small" data-act="sfx">${sets.sfx ? '🔊' : '🔇'} ${esc(t('gh_sound'))}: ${esc(t(sets.sfx ? 'gh_on' : 'gh_off'))}</button>
          <button class="btn sec small" data-act="music">${sets.music ? '🎵' : '🔇'} ${esc(t('gh_music'))}: ${esc(t(sets.music ? 'gh_on' : 'gh_off'))}</button>
        </div>
      </div>
      <div class="totals">★ ${esc(t('gh_total'))}: <b>${totalStars()}</b> / ${LV.length * 3}</div>
      ${touchMode && VH > VW ? `<div class="hint">${esc(t('gh_rotate'))}</div>` : ''}
    </div>`;
  } else if (mode === 'levels') {
    h = `<div data-m3pop="top" class="panel wide"><h2>▦ ${esc(t('gh_levels'))}</h2><div class="grid">` + LV.map((lv, i) => {
      const locked = i >= (prog.unlocked || 1), st = starsOf(lv), pr = prog.lv[lv.id];
      const kinds = []; (lv.seq || []).forEach(k => k.split('+').forEach(g => { if (g !== 'none' && !kinds.includes(g)) kinds.push(g); }));
      return `<button class="lvl${i === (prog.unlocked || 1) - 1 ? ' cur' : ''}" data-act="lvl" data-i="${i}" ${locked ? 'disabled' : ''}>
        <span class="n">${locked ? '🔒' : pad2(i + 1)}</span><span class="nm">${esc(locked ? t('gh_locked') : lvName(lv))}</span>
        <span class="gi">${kinds.map(k => `<img src="${ICON[k]}" alt="">`).join('') || `<img src="${ICON.none}" alt="">`}</span>
        <span class="st">${st.map(v => v ? '<i>★</i>' : '☆').join('')}</span>
        <span class="bt">${pr && pr.best != null ? fmt(pr.best) : ''}</span></button>`;
    }).join('') + `</div><div class="row"><button class="btn sec" data-act="menu">← ${esc(t('gh_back'))}</button>
      <button class="btn sec small" data-act="reset">${esc(t('gh_reset'))}</button></div>
      <div class="totals">★ ${totalStars()} / ${LV.length * 3}</div></div>`;
  } else if (mode === 'how') {
    const g = ['flip', 'rev', 'ghost', 'ice', 'shift', 'freeze'];
    h = `<div data-m3pop="top" class="panel wide"><h2>? ${esc(t('gh_how'))}</h2><div class="how">
      <div class="it"><img src="${ICON.none}" alt=""><div><b>${esc(t('gh_h_goal'))}</b><span>${esc(t('gh_h_goalD'))}</span></div></div>
      <div class="it"><img src="${ICON.none}" alt=""><div><b>${esc(t('gh_h_clock'))}</b><span>${esc(t('gh_h_clockD'))}</span></div></div>
      ${g.map(k => `<div class="it"><img src="${ICON[k]}" alt=""><div><b style="color:${GC[k]}">${esc(t('gh_g_' + k))}</b><span>${esc(t('gh_d_' + k))}</span></div></div>`).join('')}
      <div class="it"><img src="${ICON.rev}" alt=""><div><b>${esc(t('gh_h_haz'))}</b><span>${esc(t('gh_h_hazD'))} ${esc(t('gh_d_sweep'))}</span></div></div>
      <div class="it"><img src="${ICON.none}" alt=""><div><b>${esc(t('gh_h_stars'))}</b><span>${esc(t('gh_h_starsD'))}</span></div></div>
      </div><div class="keys">⌨ ${esc(t('gh_keys'))}<br>📱 ${esc(t('gh_keysT'))}</div>
      <div class="row" style="margin-top:12px"><button class="btn" data-act="menu">← ${esc(t('gh_back'))}</button></div></div>`;
  } else if (mode === 'intro') {
    const lv = cur.lv, L = cur.L, seq = L.seq;
    const news = []; Object.keys(firstUse).forEach(k => { if (firstUse[k] === cur.li) news.push(k); });
    const pat = seq.length > 1 ? seq.map((st, i) => `${i ? '<span class="ar">›</span>' : ''}<div class="ps">${stIcons(st)}<span>${esc(stName(st))}</span><small>5s</small></div>`).join('') + '<span class="ar">↻</span>'
      : `<div class="ps">${stIcons(seq[0])}<span>${esc(t('gh_stable'))}</span></div>`;
    h = `<div data-m3pop class="panel" style="text-align:center">
      <div class="lvtag">${esc(t('gh_lvl', { n: cur.li + 1 }))} / ${LV.length}</div>
      <h2>${esc(lvName(lv))}</h2>
      <p>${esc(t('gh_t_' + lv.id))}</p>
      ${news.map(k => k === 'sweep' ? `<div class="warn">⚠ ${esc(t('gh_d_sweep'))}</div>` : `<div class="newg"><img src="${ICON[k]}" alt=""><div><b>${esc(t(k === 'freeze' ? 'gh_newItem' : 'gh_new'))} ${esc(t('gh_g_' + k))}</b><span>${esc(t('gh_d_' + k))}</span></div></div>`).join('')}
      <div class="muted" style="margin-top:8px">${esc(t('gh_pattern'))}</div>
      <div class="pattern">${pat}</div>
      <p class="muted">${esc(t('gh_par', { t: fmt(lv.par) }))} · ★ ${starsOf(lv).filter(Boolean).length}/3</p>
      <div class="row" style="margin-top:10px"><button class="btn" data-act="go">▶ ${esc(t('gh_go'))}</button><button class="btn sec" data-act="levels">▦ ${esc(t('gh_levels'))}</button></div>
      <div class="hint">${touchMode ? '' : esc(t('gh_anyKey'))}</div></div>`;
    scr.className = 'dim';
  } else if (mode === 'paused') {
    h = `<div data-m3pop class="panel" style="text-align:center"><h2>❚❚ ${esc(t('gh_paused'))}</h2>
      <div class="lvtag">${esc(t('gh_lvl', { n: cur.li + 1 }))} · ${esc(lvName(cur.lv))}</div>
      <div class="pattern">${cur.L.seq.map((st, i) => `${i ? '<span class="ar">›</span>' : ''}<div class="ps" style="${i === cur.s.idx ? 'border-color:' + stColor(st) : ''}">${stIcons(st)}<span>${esc(stName(st))}</span></div>`).join('')}</div>
      <div class="col pcol" style="margin-top:8px"><button class="btn block" data-act="resume">▶ ${esc(t('gh_resume'))}</button>
      <button class="btn sec block" data-act="restart">↻ ${esc(t('gh_restart'))}</button>
      <button class="btn sec block" data-act="levels">▦ ${esc(t('gh_levels'))}</button>
      <button class="btn sec block" data-act="menu">⌂ ${esc(t('gh_menu'))}</button>
      <div class="row"><button class="btn sec small" data-act="sfx">${sets.sfx ? '🔊' : '🔇'} ${esc(t('gh_sound'))}: ${esc(t(sets.sfx ? 'gh_on' : 'gh_off'))}</button>
      <button class="btn sec small" data-act="music">${sets.music ? '🎵' : '🔇'} ${esc(t('gh_music'))}: ${esc(t(sets.music ? 'gh_on' : 'gh_off'))}</button></div></div>
      <div class="keys pkeys" style="margin-top:10px">${esc(t(touchMode ? 'gh_keysT' : 'gh_keys'))}</div></div>`;
    scr.className = 'dim';
  } else if (mode === 'win') {
    const r = cur.result, last = cur.li === LV.length - 1, lv = cur.lv;
    h = `<div data-m3pop class="panel" style="text-align:center"><h2 class="good">${esc(last ? t('gh_escaped') : t('gh_win'))}</h2>
      <div class="lvtag">${esc(t('gh_lvl', { n: cur.li + 1 }))} · ${esc(lvName(lv))}</div>
      <div class="stars">${r.got.map((g, i) => `<span class="${g ? 'on' : ''}" style="animation-delay:${0.15 + i * 0.22}s">★</span>`).join('')}</div>
      ${r.isBest && prog.lv[lv.id] ? `<div class="record">${esc(t('gh_newBest'))}</div>` : ''}
      <div class="stats"><div><small>${esc(t('gh_time'))}</small><b>${fmt(r.time)}</b></div><div><small>${esc(t('gh_best'))}</small><b>${fmt(r.best)}</b></div><div><small>${esc(t('gh_deaths'))}</small><b>${r.deaths}</b></div></div>
      <ul class="checks"><li class="${r.got[0] ? 'ok' : ''}">${esc(t('gh_s1'))}</li><li class="${r.got[1] ? 'ok' : ''}">${esc(t('gh_s2'))}</li><li class="${r.got[2] ? 'ok' : ''}">${esc(t('gh_s3', { t: fmt(lv.par) }))}</li></ul>
      ${last ? `<p>${esc(t('gh_escapedMsg', { s: totalStars(), m: LV.length * 3 }))}</p>` : ''}
      <div class="row">${last ? '' : `<button class="btn" data-act="next">▶ ${esc(t('gh_nextLvl'))}</button>`}
      <button class="btn sec" data-act="retry">↻ ${esc(t('gh_retry'))}</button><button class="btn sec" data-act="levels">▦ ${esc(t('gh_levels'))}</button></div></div>`;
    scr.className = 'dim';
  } else if (mode === 'lose') {
    h = `<div data-m3pop class="panel" style="text-align:center"><h2 class="bad">⚠ ${esc(t('gh_lose'))}</h2>
      <div class="lvtag">${esc(t('gh_lvl', { n: cur.li + 1 }))} · ${esc(lvName(cur.lv))}</div>
      <p>${esc(t('gh_loseMsg'))}</p>
      <div class="stats"><div><small>${esc(t('gh_time'))}</small><b>${fmt(cur.s.time)}</b></div><div><small>${esc(t('gh_parL'))}</small><b>${fmt(cur.lv.par)}</b></div><div><small>${esc(t('gh_deaths'))}</small><b>${cur.s.deaths}</b></div></div>
      <div class="row"><button class="btn" data-act="retry">↻ ${esc(t('gh_retry'))}</button><button class="btn sec" data-act="levels">▦ ${esc(t('gh_levels'))}</button><button class="btn sec" data-act="menu">⌂ ${esc(t('gh_menu'))}</button></div></div>`;
    scr.className = 'dim';
  } else { scr.innerHTML = ''; return; }
  scr.innerHTML = h;
  if (window.Mal3abPopButtons) try { window.Mal3abPopButtons(); } catch (e) {}
  if (!touchMode) { const b = scr.querySelector('.btn:not(.sec), .lvl.cur'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }
}
scr.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  Snd.init(); Snd.play('ui');
  const a = b.dataset.act;
  if (a === 'continue') startLevel(Math.min(LV.length - 1, (prog.unlocked || 1) - 1));
  else if (a === 'levels') showLevels();
  else if (a === 'how') showHow();
  else if (a === 'menu') showMenu();
  else if (a === 'lvl') startLevel(+b.dataset.i);
  else if (a === 'go') go();
  else if (a === 'resume') resume();
  else if (a === 'restart' || a === 'retry') startLevel(cur.li, true);
  else if (a === 'next') startLevel(cur.li + 1);
  else if (a === 'sfx') { sets.sfx = !sets.sfx; saveSets(); Snd.apply(); renderScreen(); updateSys(); }
  else if (a === 'music') { sets.music = !sets.music; saveSets(); Snd.apply(); renderScreen(); updateSys(); }
  else if (a === 'reset') { if (confirm(t('gh_resetQ'))) { prog = { unlocked: 1, lv: {} }; saveProg(); renderScreen(); } }
});
$('pauseBtn').addEventListener('click', (e) => { e.preventDefault(); pause(); });
$('langBtn').addEventListener('click', () => setLang(getLang() === 'ar' ? 'en' : 'ar'));
$('sndBtn').addEventListener('click', () => {
  Snd.init();
  if (sets.sfx && sets.music) sets.music = false; else if (sets.sfx) sets.sfx = false; else { sets.sfx = true; sets.music = true; }
  saveSets(); Snd.apply(); updateSys(); if (mode === 'menu' || mode === 'paused') renderScreen();
});
function updateSys() {
  $('langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية';
  const sb = $('sndBtn'); sb.textContent = sets.sfx && sets.music ? '🔊' : sets.sfx ? '🔉' : '🔇';
  sb.title = t('gh_sound') + ' / ' + t('gh_music');
  $('pauseBtn').title = t('gh_paused');
}
document.addEventListener('langchange', () => { updateSys(); if (mode !== 'play') renderScreen(); });
document.addEventListener('mal3abready', () => { if (mode === 'menu') renderScreen(); });

let toastT = 0;
function toast(msg, dur = 2.4) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); toastT = dur; }

// ------------------------------------------------------------------ simulation tick
function tick() {
  const v = cur, s = v.s; if (!s) return;
  v.px = s.x; v.py = s.y;
  const inp = getInput();
  C.step(s, inp);
  for (const e of s.events) onEvent(e);
  s.events.length = 0;
}
function feet(s) { const fl = s.active.flip; return { x: s.x + P.w / 2, y: fl ? s.y : s.y + P.h, d: fl ? 1 : -1 }; }
function burst(x, y, n, cols, spd = 6, life = 0.6, size = 0.12, g = 0) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = spd * (0.3 + Math.random() * 0.7); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, c: cols[i % cols.length], sz: size * (0.6 + Math.random() * 0.8), g }); }
  if (parts.length > 600) parts.splice(0, parts.length - 600);
}
function onEvent(e) {
  const v = cur, s = v.s;
  switch (e.type) {
    case 'start': break;
    case 'jump': { Snd.play('jump'); const f = feet(s); for (let i = 0; i < 6; i++) parts.push({ x: f.x + (Math.random() - 0.5) * 0.5, y: f.y, vx: (Math.random() - 0.5) * 3, vy: f.d * -Math.random() * 1.5, life: 0.35, max: 0.35, c: '#7ff3ff', sz: 0.08, g: 0 }); v.sq = { x: 0.75, y: 1.3 }; break; }
    case 'land': if (e.a > 7) { Snd.play('land', e.a); const f = feet(s); for (let i = 0; i < Math.min(12, e.a / 2); i++) parts.push({ x: f.x + (Math.random() - 0.5) * 0.6, y: f.y, vx: (Math.random() - 0.5) * 4, vy: f.d * Math.random() * 1.2, life: 0.35, max: 0.35, c: '#bfefff', sz: 0.08, g: 0 }); v.sq = { x: 1.3, y: 0.72 }; } break;
    case 'switch': {
      const st = s.active; Snd.play('switch'); fx.g = fx.gMax = 0.42; fx.shake = Math.max(fx.shake, 0.3);
      fx.banner = { st, t: 1.3 };
      document.body.classList.toggle('rev', !!st.rev);
      break;
    }
    case 'tick': Snd.play('tick', e.a); break;
    case 'freeze': Snd.play('freeze'); fx.flash = 0.5; fx.banner = { freeze: true, t: 1.1 }; burst(s.x + P.w / 2, s.y + P.h / 2, 26, ['#a8f3ff', '#ffffff', '#7df9ff'], 7, 0.7, 0.1); break;
    case 'thaw': Snd.play('thaw'); break;
    case 'nofreeze': Snd.play('deny'); v.denyT = 0.5; break;
    case 'pick': {
      Snd.play('pick'); const o = cur.L.freezes[e.a]; burst(o.x + 0.5, o.y + 0.5, 18, ['#a8f3ff', '#ffffff'], 5, 0.5, 0.1);
      if (!sets.hinted) { sets.hinted = true; saveSets(); }
      if (!v.hinted) { v.hinted = true; toast(t(touchMode ? 'gh_freezeHintT' : 'gh_freezeHint'), 3.2); }
      break;
    }
    case 'frag': { Snd.play('frag'); const o = cur.L.frags[e.a]; burst(o.x + 0.5, o.y + 0.5, 28, ['#ffd84d', '#fff3b0', '#ffb703'], 6, 0.8, 0.12); break; }
    case 'check': Snd.play('check'); toast(t('gh_saved'), 1.6); { const o = cur.L.checks[e.a]; burst(o.x + 0.5, o.y + 0.5, 20, ['#39ff88', '#cfffe2'], 5, 0.6, 0.1); } break;
    case 'die': {
      Snd.play('die'); fx.shake = 0.55; fx.g = fx.gMax = 0.38; v.cause = e.a;
      burst(s.x + P.w / 2, s.y + P.h / 2, 40, ['#ffb703', '#ff2e88', '#2de2ff', '#ffffff'], 9, 0.9, 0.14, 8 * (s.active.flip ? -1 : 1));
      document.body.classList.remove('rev');
      break;
    }
    case 'respawn': Snd.play('respawn'); v.spawnT = 0.35; v.trail.length = 0; fx.banner = null; document.body.classList.toggle('rev', !!s.active.rev); break;
    case 'win': Snd.play('win'); burst(s.x + P.w / 2, s.y + P.h / 2, 50, ['#39ff88', '#ffffff', '#ffb703'], 8, 1, 0.13); document.body.classList.remove('rev'); finishWin(); break;
    case 'lose': Snd.play('lose'); fx.g = fx.gMax = 0.9; fx.shake = 0.6; document.body.classList.remove('rev'); finishLose(); break;
  }
}

// ------------------------------------------------------------------ rendering
let lastNow = performance.now(), TT = 0;
const rnd = Math.random;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000)); lastNow = now; TT += dt;
  pollPad();
  if (mode === 'play' && cur && !holdLoop) {
    acc += dt; let n = 0;
    while (acc >= C.DT && n < 8) { tick(); acc -= C.DT; n++; }
    if (n >= 8) acc = 0;
  }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
  try { render(dt); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}

function render(dt) {
  const v = cur || attract;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(bgC, 0, 0, cv.width, cv.height);
  if (!v) return;
  if (v.attract) stepAttract(v, dt);
  const st = v.s ? v.s.active : v.st;
  // camera
  if (v.s) {
    const s = v.s;
    const tl = s.dead ? 0 : clamp(s.vx * 0.35, -3, 3); v.look = lerp(v.look, tl, 1 - Math.exp(-dt * 2.5));
    const tg = camTarget(v), k = 1 - Math.exp(-dt * (s.dead ? 3 : 7));
    v.cam.x = lerp(v.cam.x, tg.x, k); v.cam.y = lerp(v.cam.y, tg.y, k);
  }
  fx.shake = Math.max(0, fx.shake - dt * 1.6);
  const shx = (rnd() - 0.5) * fx.shake * 18, shy = (rnd() - 0.5) * fx.shake * 18;
  drawBackdrop(v, st, dt, shx, shy);
  drawWorld(v, st, dt, shx, shy);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (v.s && mode !== 'menu' && mode !== 'levels' && mode !== 'how') drawHUD(v, dt);
  postFX(v, st, dt);
}

function stepAttract(v, dt) {
  v.clock += dt;
  const seq = v.L.seq, idx = Math.floor(v.clock / P.dur) % seq.length;
  if (v.idx !== idx) { v.idx = idx; if (v.st && (mode === 'menu' || mode === 'levels' || mode === 'how')) { fx.g = fx.gMax = 0.35; } }
  v.st = seq[idx];
  v.cam.x += v.dir * dt * 1.6;
  const maxX = Math.max(0, v.L.W - v.vw);
  if (v.cam.x > maxX) { v.cam.x = maxX; v.dir = -1; } if (v.cam.x < 0) { v.cam.x = 0; v.dir = 1; }
  v.cam.y = v.L.H <= v.vh ? 0 : (v.L.H - v.vh) / 2;
}

function drawBackdrop(v, st, dt, shx, shy) {
  const W = cv.width, H = cv.height;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // parallax grid
  const gs = 56, ox = -((v.cam.x * v.ts * 0.25) % gs), oy = -((v.cam.y * v.ts * 0.25) % gs);
  ctx.strokeStyle = 'rgba(70,110,255,.07)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = ox; x < VW; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, VH); }
  for (let y = oy; y < VH; y += gs) { ctx.moveTo(0, y); ctx.lineTo(VW, y); }
  ctx.stroke();
  // binary rain (falls up when gravity is flipped)
  const up = st && st.flip ? -1 : 1;
  ctx.font = '700 14px ' + 'ui-monospace, Consolas, Menlo, monospace'; ctx.textAlign = 'center';
  const fcol = st && st.list.length ? stColor(st) : '#2de2ff';
  for (const d of drops) {
    d.y += d.v * dt * up * (st && st.ice ? 1.8 : 1);
    if (d.y > 1.05) { d.y = -0.05; d.x = rnd(); } if (d.y < -0.05) { d.y = 1.05; d.x = rnd(); }
    if (rnd() < 0.01) d.ch = d.ch === '0' ? '1' : '0';
    ctx.globalAlpha = 0.08 + d.v * 0.6; ctx.fillStyle = fcol;
    ctx.font = `700 ${d.s | 0}px ui-monospace, Consolas, Menlo, monospace`;
    ctx.fillText(d.ch, d.x * VW, d.y * VH);
  }
  ctx.globalAlpha = 1;
  if (st && st.flip) {   // big faint arrows drifting upwards
    ctx.strokeStyle = 'rgba(185,140,255,.06)'; ctx.lineWidth = 10;
    const off = (TT * 60) % 160;
    ctx.beginPath();
    for (let y = VH + 160 - off; y > -160; y -= 160) for (let x = 80; x < VW; x += 240) { ctx.moveTo(x - 40, y + 30); ctx.lineTo(x, y - 10); ctx.lineTo(x + 40, y + 30); }
    ctx.stroke();
  }
}

function worldXf(v, shx, shy) {
  const ts = v.ts;
  ctx.setTransform(DPR * ts, 0, 0, DPR * ts, DPR * (v.offX - v.cam.x * ts + shx), DPR * (v.top + v.offY - v.cam.y * ts + shy));
}
function drawSolid(p, edgeCol, coreCol, fillCol, a) {
  if (!p.any || a <= 0.01) return;
  ctx.globalAlpha = a; ctx.fillStyle = fillCol; ctx.fill(p.fill);
  ctx.strokeStyle = edgeCol; ctx.lineWidth = 0.035; ctx.globalAlpha = a * 0.22; ctx.stroke(p.inner);
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  ctx.globalAlpha = a * 0.12; ctx.lineWidth = 0.34; ctx.stroke(p.edge);
  ctx.globalAlpha = a * 0.3; ctx.lineWidth = 0.15; ctx.stroke(p.edge);
  ctx.globalAlpha = a; ctx.lineWidth = 0.055; ctx.strokeStyle = coreCol; ctx.stroke(p.edge);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function drawPhaseOff(p, col, a) {   // a red / blue block while it is not solid
  if (!p.any) return;
  ctx.globalAlpha = 0.05 * a; ctx.fillStyle = col; ctx.fill(p.fill);
  ctx.globalAlpha = 0.38 * a; ctx.strokeStyle = col; ctx.lineWidth = 0.05; ctx.setLineDash([0.16, 0.12]); ctx.lineDashOffset = -TT * 0.4; ctx.stroke(p.edge); ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
function ghostFlicker(p, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 0.05;
  for (const tl of p.tiles) {
    const f = (TT * 0.55 + tl.ph) % 1;
    if (f > 0.08) continue;
    ctx.globalAlpha = 0.55 * Math.sin(f / 0.08 * Math.PI);
    ctx.strokeRect(tl.c + 0.04, tl.r + 0.04, 0.92, 0.92);
  }
  ctx.globalAlpha = 1;
}

function spikePoly(sp) {
  const { c, r, t } = sp;
  const pts = [];
  // two teeth, defined for an upward spike in local (u along base 0..1, h height 0..1), then mapped
  const tri = [[0.06, 0], [0.28, 0.6], [0.5, 0], [0.5, 0], [0.72, 0.6], [0.94, 0]];
  for (const [u, h] of tri) {
    if (t === T.SU) pts.push([c + u, r + 1 - h]);
    else if (t === T.SD) pts.push([c + u, r + h]);
    else if (t === T.SL) pts.push([c + 1 - h, r + u]);
    else if (t === T.SR) pts.push([c + h, r + u]);
  }
  return pts;
}

function drawWorld(v, st, dt, shx, shy) {
  const L = v.L, p = v.paths, s = v.s;
  worldXf(v, shx, shy);
  // level backdrop + faint grid
  ctx.fillStyle = 'rgba(4,6,18,.55)'; ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgba(45,226,255,.045)'; ctx.lineWidth = 0.03; ctx.stroke(p.grid);
  const ci = s ? C.clockInfo(s) : { left: 9, next: st, frozen: 0 };
  const soon = ci.left < 1.4 && !ci.frozen, nx = ci.next || st;
  // defragged area behind the sweep
  if (s && L.lv.sweep) {
    const sx = s.sweepX;
    if (sx > -3) {
      const x0 = Math.max(-1, v.cam.x - 2);
      if (sx > x0) {
        const g = ctx.createLinearGradient(sx - 6, 0, sx, 0);
        g.addColorStop(0, 'rgba(30,60,200,.55)'); g.addColorStop(1, 'rgba(120,200,255,.75)');
        ctx.fillStyle = g; ctx.fillRect(x0, 0, sx - x0, L.H);
        // classic defrag blocks
        for (let x = Math.floor(sx) - 1; x >= x0; x--) for (let y = 0; y < L.H; y++) {
          const h = ((x * 928371 + y * 1237) >>> 0) % 7;
          ctx.fillStyle = h < 3 ? 'rgba(40,90,255,.55)' : h < 5 ? 'rgba(90,200,255,.45)' : h < 6 ? 'rgba(255,255,255,.25)' : 'rgba(255,60,110,.35)';
          ctx.fillRect(x + 0.08, y + 0.08, 0.84, 0.84);
        }
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(180,230,255,.8)'; ctx.fillRect(sx - 0.12, 0, 0.12, L.H);
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(TT * 20); ctx.fillRect(sx - 0.5, 0, 0.5, L.H);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
    }
  }
  // solid blocks
  const ghost = st.ghost;
  const warnGhost = !ghost && nx.ghost && soon;
  const wallA = ghost ? 0 : (warnGhost ? 0.45 + 0.55 * (Math.sin(TT * 40) > 0 ? 1 : 0.3) : 1);
  drawSolid(p.W, '#2de2ff', '#d6fbff', '#11214f', wallA);
  const shiftOn = st.shift, warnShift = soon && nx.shift !== st.shift, blink = warnShift ? (Math.sin(TT * 30) > 0 ? 1 : 0.35) : 1;
  if (!ghost) {
    if (shiftOn) { drawPhaseOff(p.R, '#ff3b6b', blink); drawSolid(p.B, '#4da3ff', '#dcecff', 'rgba(30,70,170,.55)', blink); }
    else { drawSolid(p.R, '#ff3b6b', '#ffd6e0', 'rgba(130,20,50,.55)', blink); drawPhaseOff(p.B, '#4da3ff', blink); }
  } else {
    ghostFlicker(p.W, '#2de2ff');
    ghostFlicker(shiftOn ? p.B : p.R, shiftOn ? '#4da3ff' : '#ff3b6b');
    // the frame of the drive stays faintly visible
    ctx.strokeStyle = 'rgba(45,226,255,.18)'; ctx.lineWidth = 0.06; ctx.strokeRect(1, 1, L.W - 2, L.H - 2);
  }
  // ice
  if (st.ice || (soon && nx.ice)) {
    const a = st.ice ? 1 : 0.35 + 0.3 * Math.sin(TT * 25);
    ctx.globalAlpha = ghost ? a * 0.25 : a; ctx.fillStyle = '#c9fbff'; ctx.fill(p.ice);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (ghost ? 0.1 : 0.35) * a; ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 0.12; ctx.stroke(p.ice);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  // corrupted spikes / blocks
  if (p.spikes.length) {
    const jit = fx.g > 0 ? 0.08 : 0;
    ctx.beginPath();
    for (const sp of p.spikes) {
      if (sp.t === T.X) continue;
      const pts = spikePoly(sp), jx = jit ? (rnd() - 0.5) * jit : 0;
      for (let i = 0; i < 6; i += 3) { ctx.moveTo(pts[i][0] + jx, pts[i][1]); ctx.lineTo(pts[i + 1][0] + jx, pts[i + 1][1]); ctx.lineTo(pts[i + 2][0] + jx, pts[i + 2][1]); ctx.closePath(); }
    }
    ctx.fillStyle = '#3d0720'; ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff2e6a'; ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.25; ctx.lineWidth = 0.2; ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 0.05; ctx.strokeStyle = '#ff7aa0'; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    for (const sp of p.spikes) {
      if (sp.t !== T.X) continue;
      ctx.fillStyle = '#2a0418'; ctx.fillRect(sp.c, sp.r, 1, 1);
      const seed = Math.floor(TT * 12);
      for (let i = 0; i < 6; i++) { const h = ((sp.c * 31 + sp.r * 17 + i * 7 + seed * 13) * 2654435761) >>> 0; ctx.fillStyle = h % 3 ? '#ff2e88' : '#7a0f3a'; ctx.fillRect(sp.c + (h % 5) * 0.18 + 0.05, sp.r + ((h >> 4) % 5) * 0.18 + 0.05, 0.16, 0.12); }
    }
  }
  drawObjects(v, st);
  if (s) drawPlayer(v, st, dt);
  // particles
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
    q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 1 - dt * 1.5; q.vy *= 1 - dt * 1.2;
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1); ctx.fillStyle = q.c; const z = q.sz * (0.5 + 0.5 * q.life / q.max); ctx.fillRect(q.x - z / 2, q.y - z / 2, z, z);
  }
  ctx.globalAlpha = 1;
}

function drawObjects(v, st) {
  const L = v.L, s = v.s, ghost = st.ghost;
  // exit port
  {
    const e = L.exit, cx = e.x + 0.5, cy = e.y + 0.5;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, cy, 0.1, cx, cy, 1.5); g.addColorStop(0, 'rgba(57,255,136,.45)'); g.addColorStop(1, 'rgba(57,255,136,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
    ctx.strokeStyle = '#39ff88';
    for (let i = 0; i < 3; i++) { const k = ((TT * 0.8 + i / 3) % 1), z = 0.85 * (1 - k); ctx.globalAlpha = k; ctx.lineWidth = 0.05; ctx.strokeRect(cx - z / 2, cy - z / 2, z, z); }
    ctx.globalAlpha = 1; ctx.lineWidth = 0.08; rr(ctx, cx - 0.46, cy - 0.46, 0.92, 0.92, 0.14); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#39ff88'; ctx.fillRect(cx - 0.3, cy - 0.06, 0.12, 0.12); ctx.fillRect(cx - 0.1, cy - 0.06, 0.12, 0.12); ctx.fillRect(cx + 0.1, cy - 0.06, 0.12, 0.12);
  }
  // checkpoints
  L.checks.forEach((o, i) => {
    const on = s && s.cpi === i, cx = o.x + 0.5, cy = o.y + 0.55 + Math.sin(TT * 2 + i) * 0.05;
    ctx.fillStyle = on ? '#39ff88' : '#5c6aa8';
    ctx.globalAlpha = on ? 0.25 : 0.12; ctx.fillRect(cx - 0.04, o.y, 0.08, 1); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4 + (on ? TT : 0)); ctx.fillRect(-0.16, -0.16, 0.32, 0.32); ctx.restore();
    if (on) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3 + 0.2 * Math.sin(TT * 4); ctx.beginPath(); ctx.arc(cx, cy, 0.4, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  });
  // freeze pickups
  L.freezes.forEach((o, i) => {
    if (s && s.tf[i]) return;
    const cx = o.x + 0.5, cy = o.y + 0.5 + Math.sin(TT * 3 + i) * 0.08;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; ctx.fillStyle = '#7df9ff'; ctx.beginPath(); ctx.arc(cx, cy, 0.45, 0, 7); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(TT * 1.5 + i) * 0.3); drawIcon(ctx, 'freeze', 0, 0, 0.36, false); ctx.restore();
  });
  // golden bits
  L.frags.forEach((o, i) => {
    if (s && s.tg[i]) return;
    const cx = o.x + 0.5, cy = o.y + 0.5 + Math.sin(TT * 2.4 + i) * 0.07, w = Math.cos(TT * 3) * 0.28;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffd84d'; ctx.beginPath(); ctx.arc(cx, cy, 0.5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffcf3a'; ctx.beginPath(); ctx.moveTo(cx, cy - 0.34); ctx.lineTo(cx + w, cy); ctx.lineTo(cx, cy + 0.34); ctx.lineTo(cx - w, cy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff6c9'; ctx.lineWidth = 0.04; ctx.stroke();
  });
}

function drawPlayer(v, st, dt) {
  const s = v.s;
  if (v.spawnT > 0) v.spawnT -= dt;
  if (s.dead) return;
  const a = mode === 'play' ? clamp(acc / C.DT, 0, 1) : 1;
  const x = lerp(v.px, s.x, a), y = lerp(v.py, s.y, a);
  // flip animation + squash
  v.flipS = lerp(v.flipS, st.flip ? -1 : 1, 1 - Math.exp(-dt * 14));
  v.sq.x = lerp(v.sq.x, 1, 1 - Math.exp(-dt * 12)); v.sq.y = lerp(v.sq.y, 1, 1 - Math.exp(-dt * 12));
  const cx = x + P.w / 2, cy = y + P.h / 2;
  // trail
  if (Math.abs(s.vx) > 3 || Math.abs(s.vy) > 6) v.trail.push({ x: cx, y: cy, t: 0.18 });
  ctx.globalCompositeOperation = 'lighter';
  for (let i = v.trail.length - 1; i >= 0; i--) {
    const q = v.trail[i]; q.t -= dt; if (q.t <= 0) { v.trail.splice(i, 1); continue; }
    const k = q.t / 0.18, z = P.w * 0.8 * k;
    ctx.globalAlpha = 0.22 * k; ctx.fillStyle = i % 2 ? '#2de2ff' : '#ff2e88'; ctx.fillRect(q.x - z / 2 + (i % 2 ? 0.05 : -0.05), q.y - z / 2, z, z);
  }
  if (s.freezeT > 0) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#7df9ff'; ctx.beginPath(); ctx.arc(cx, cy, 0.7 + Math.sin(TT * 8) * 0.05, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const sp = v.spawnT > 0 ? 1 - v.spawnT / 0.35 : 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(v.sq.x * sp, v.sq.y * v.flipS * sp);
  const w = P.w, h = P.h;
  // glow
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28; ctx.fillStyle = '#ffb703'; rr(ctx, -w / 2 - 0.1, -h / 2 - 0.1, w + 0.2, h + 0.2, 0.2); ctx.fill();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  rr(ctx, -w / 2, -h / 2, w, h, 0.13); ctx.fillStyle = '#ffb703'; ctx.fill();
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(-w / 2 + 0.07, -h / 2 + 0.06, w - 0.14, 0.08);
  ctx.fillStyle = '#c47f00'; ctx.fillRect(-w / 2 + 0.08, h / 2 - 0.14, 0.1, 0.06); ctx.fillRect(-w / 2 + 0.22, h / 2 - 0.14, 0.06, 0.06); ctx.fillRect(-w / 2 + 0.32, h / 2 - 0.14, 0.1, 0.06);
  ctx.lineWidth = 0.035; ctx.strokeStyle = '#fff1c1'; rr(ctx, -w / 2, -h / 2, w, h, 0.13); ctx.stroke();
  // eyes look where you are heading
  const f = s.face, blink = (TT % 3.2) < 0.1 ? 0.03 : 0.15;
  ctx.fillStyle = st.rev ? '#ff1f55' : '#1a1200';
  ctx.fillRect(f * 0.07 - 0.15, -0.1, 0.09, blink); ctx.fillRect(f * 0.07 + 0.06, -0.1, 0.09, blink);
  if (st.rev) { ctx.fillStyle = '#ffffff'; ctx.fillRect(f * 0.07 - 0.13, -0.08, 0.03, 0.03); ctx.fillRect(f * 0.07 + 0.08, -0.08, 0.03, 0.03); }
  ctx.restore();
}

const MONO = 'ui-monospace, Consolas, Menlo, monospace', SANS = "'Segoe UI', Tahoma, Arial, sans-serif";
const AR_RE = /[\u0600-\u06FF]/;
function hudText(txt, x, y, font, col, align = 'left') {
  const ar = AR_RE.test(txt);
  ctx.font = ar ? font.replace(MONO, SANS) : font; ctx.fillStyle = col; ctx.textAlign = align;
  if (ctx.direction !== undefined) ctx.direction = ar ? 'rtl' : 'ltr';
  ctx.fillText(txt, x, y);
  if (ar && ctx.direction !== undefined) ctx.direction = 'ltr';
}
function fitText(txt, maxW) {
  if (ctx.measureText(txt).width <= maxW) return txt;
  let s = txt; while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}
function drawHUD(v, dt) {
  const s = v.s, L = v.L, lv = v.lv, ci = C.clockInfo(s), narrow = VW < 720;
  if (v.denyT > 0) v.denyT -= dt;
  ctx.textBaseline = 'middle';
  // defrag progress (lose when it fills)
  const prog_ = clamp(s.time / (lv.limit || 1), 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, 0, VW, 4);
  const g = ctx.createLinearGradient(0, 0, VW, 0); g.addColorStop(0, '#2de2ff'); g.addColorStop(0.7, '#ff2e88'); g.addColorStop(1, '#ff3b6b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW * prog_, 4);
  if (prog_ > 0.8) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(TT * 10); ctx.fillStyle = '#ff3b6b'; ctx.fillRect(0, 0, VW * prog_, 4); ctx.globalAlpha = 1; }
  // level label
  const lx = 60;
  hudText(t('gh_lvl', { n: v.li + 1 }).toUpperCase(), lx, 22, `800 11px ${MONO}`, '#ffb703');
  ctx.font = `700 14px ${SANS}`;
  hudText(fitText(lvName(lv), narrow ? VW - lx - 150 : Math.max(60, (VW - 470) / 2 - lx - 6)), lx, 40, `700 14px ${SANS}`, '#eef0ff');
  // time / defrag / freezes
  const rx = VW - 12;
  hudText(fmt(s.time), rx, 20, `800 18px ${MONO}`, s.time <= lv.par ? '#eef0ff' : '#ffb3c4', 'right');
  { const pc = Math.floor(prog_ * 100) + '%', dc = prog_ > 0.8 ? '#ff6d8f' : '#8aa0d8'; hudText(pc, rx, 40, `800 10px ${MONO}`, dc, 'right'); ctx.font = `800 10px ${MONO}`; const pw0 = ctx.measureText(pc).width; hudText(t('gh_defrag').toUpperCase(), rx - pw0 - 5, 40, `700 10px ${MONO}`, dc, 'right'); }
  const tw = 112;
  for (let i = 0; i < P.maxCharges; i++) {
    const x = rx - tw - 4 - i * 22 + (v.denyT > 0 ? Math.sin(TT * 60) * 3 : 0), y = 21, has = i < s.charges;
    ctx.globalAlpha = has ? 1 : 0.22; drawIcon(ctx, 'freeze', x, y, 9, false); ctx.globalAlpha = 1;
  }
  if (s.deaths) hudText('✖ ' + s.deaths, rx - tw - 4 - 22 * 2 - 14, 40, `700 11px ${MONO}`, '#ff8fa6', 'right');
  // glitch clock panel
  const pw = narrow ? Math.min(VW - 16, 440) : Math.min(460, VW - 2 * 250), ph = 44;
  const px = (VW - pw) / 2, py = narrow ? 54 : 8;
  const nowC = stColor(ci.now), nextC = stColor(ci.next);
  ctx.globalAlpha = 0.86; rr(ctx, px, py, pw, ph, 12); ctx.fillStyle = '#080a1c'; ctx.fill(); ctx.globalAlpha = 1;
  ctx.lineWidth = 1.5; ctx.strokeStyle = ci.frozen ? GC.freeze : nowC; ctx.globalAlpha = 0.65; ctx.stroke(); ctx.globalAlpha = 1;
  const cxr = px + pw / 2, cyr = py + ph / 2, R = 17;
  if (L.seq.length <= 1) {
    drawIcon(ctx, 'none', px + 22, cyr, 11);
    ctx.font = `700 13px ${SANS}`; hudText(fitText(t('gh_stable'), pw - 50), px + 40, cyr, `700 13px ${SANS}`, GC.none);
  } else {
    const half = pw / 2 - R - 10;
    // now
    hudText(t('gh_now').toUpperCase(), px + 10, py + 10, `800 9px ${MONO}`, '#8aa0d8');
    const nl = ci.now.list.length ? ci.now.list : ['none'];
    nl.forEach((k, i) => drawIcon(ctx, k, px + 20 + i * 15, cyr + 6, 8.5));
    ctx.font = `800 12px ${SANS}`;
    const nx0 = px + 14 + nl.length * 15 + 6;
    hudText(fitText(stName(ci.now), half - (nx0 - px) + 6), nx0, cyr + 6, `800 12px ${SANS}`, nowC);
    // next
    const qx = cxr + R + 10;
    hudText(t('gh_next').toUpperCase(), qx, py + 10, `800 9px ${MONO}`, '#8aa0d8');
    const xl = ci.next.list.length ? ci.next.list : ['none'];
    ctx.globalAlpha = ci.left < 1.5 && !ci.frozen ? 0.6 + 0.4 * Math.sin(TT * 18) : 0.9;
    xl.forEach((k, i) => drawIcon(ctx, k, qx + 8 + i * 15, cyr + 6, 8.5));
    const qx0 = qx + 2 + xl.length * 15 + 6;
    ctx.font = `700 12px ${SANS}`;
    hudText(fitText(stName(ci.next), px + pw - 8 - qx0), qx0, cyr + 6, `700 12px ${SANS}`, nextC);
    ctx.globalAlpha = 1;
    // countdown ring
    ctx.beginPath(); ctx.arc(cxr, cyr, R, 0, Math.PI * 2); ctx.fillStyle = '#0d1030'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    let frac, col, label;
    if (!ci.on) { frac = 1; col = '#8aa0d8'; label = '▶'; }
    else if (ci.frozen) { frac = ci.frozen / P.freezeDur; col = GC.freeze; label = ci.frozen.toFixed(1); }
    else { frac = ci.left / P.dur; col = ci.left > 2 ? nowC : ci.left > 1 ? '#ffb703' : '#ff3b6b'; label = ci.left > 3 ? String(Math.ceil(ci.left)) : ci.left.toFixed(1); }
    ctx.beginPath(); ctx.arc(cxr, cyr, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(frac, 0, 1)); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    if (ci.frozen) { ctx.globalAlpha = 0.5; drawIcon(ctx, 'freeze', cxr, cyr, 12, false); ctx.globalAlpha = 1; }
    hudText(label, cxr, cyr + 1, `800 ${label.length > 2 ? 11 : 13}px ${MONO}`, ci.frozen ? '#eaffff' : '#ffffff', 'center');
    // the whole pattern, so it can be memorised
    const n = L.seq.length, bw = Math.min(26, (pw - 40) / n - 3), sx0 = cxr - (n * (bw + 3) - 3) / 2, sy = py + ph + 4;
    for (let i = 0; i < n; i++) {
      const stc = stColor(L.seq[i]), x = sx0 + i * (bw + 3);
      ctx.globalAlpha = i === ci.idx ? 1 : 0.35; ctx.fillStyle = stc; ctx.fillRect(x, sy, bw, 4);
      if (i === ci.idx && ci.on) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x, sy, bw * (1 - (ci.left === Infinity ? 0 : ci.left / P.dur)), 4); }
    }
    ctx.globalAlpha = 1;
  }
  // centre messages
  const midY = v.top + v.ah / 2;
  if (!ci.on && !s.dead && mode === 'play') {
    ctx.globalAlpha = 0.65 + 0.35 * Math.sin(TT * 4);
    ctx.font = `800 ${narrow ? 15 : 18}px ${SANS}`;
    const m = t('gh_moveToStart'), mw = ctx.measureText(m).width + 28, my = v.top + v.ah * 0.78;
    rr(ctx, VW / 2 - mw / 2, my - 17, mw, 34, 10); ctx.fillStyle = 'rgba(8,10,28,.75)'; ctx.fill();
    hudText(m, VW / 2, my, `800 ${narrow ? 15 : 18}px ${SANS}`, '#ffffff', 'center');
    ctx.globalAlpha = 1;
  }
  if (fx.banner) {
    const b = fx.banner; b.t -= dt;
    if (b.t <= 0) fx.banner = null;
    else {
      const k = clamp(b.t / 1.3, 0, 1), sc = 1 + Math.max(0, k - 0.75) * 1.2, a = Math.min(1, b.t * 2.5);
      const txt = b.freeze ? '❄ ' + t('gh_frozen').toUpperCase() : stName(b.st).toUpperCase() + '!';
      const col = b.freeze ? GC.freeze : stColor(b.st), fs = Math.round((narrow ? 26 : 38) * sc);
      ctx.globalAlpha = a * 0.7; ctx.font = `900 ${fs}px ${SANS}`; ctx.textAlign = 'center';
      ctx.fillStyle = '#ff2e88'; ctx.fillText(txt, VW / 2 - 3, midY - 40);
      ctx.fillStyle = '#2de2ff'; ctx.fillText(txt, VW / 2 + 3, midY - 40);
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillText(txt, VW / 2, midY - 40);
      if (!b.freeze && b.st) { ctx.font = `600 ${narrow ? 12 : 14}px ${SANS}`; ctx.fillStyle = '#dfe6ff'; ctx.globalAlpha = a * 0.9; const d = b.st.list.length === 1 ? t('gh_d_' + b.st.list[0]) : ''; if (d) ctx.fillText(fitText(d, VW - 30), VW / 2, midY - 40 + fs * 0.75); }
      ctx.globalAlpha = 1;
    }
  }
  if (s.dead) {
    const k = clamp(s.deadT / P.deadDelay, 0, 1);
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.font = `900 ${narrow ? 26 : 34}px ${SANS}`; ctx.textAlign = 'center';
    const txt = t('gh_lost').toUpperCase(), jx = (rnd() - 0.5) * 6;
    ctx.fillStyle = '#2de2ff'; ctx.fillText(txt, VW / 2 + 3 + jx, midY);
    ctx.fillStyle = '#ff2e88'; ctx.fillText(txt, VW / 2 - 3 - jx, midY);
    ctx.fillStyle = '#ffffff'; ctx.fillText(txt, VW / 2, midY);
    if (v.cause) hudText(t('gh_c_' + v.cause), VW / 2, midY + 30, `700 14px ${SANS}`, '#ffc2d0', 'center');
    ctx.globalAlpha = 1;
  }
  ctx.textBaseline = 'alphabetic';
  // touch freeze counter
  const tf = $('tFn'); if (tf && tf.textContent !== String(s.charges)) { tf.textContent = s.charges; $('tF').classList.toggle('empty', s.charges <= 0); }
}

function postFX(v, st, dt) {
  const W = cv.width, H = cv.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = v.s;
  // freeze frost
  if (s && s.freezeT > 0) {
    fx.frost = Math.min(1, fx.frost + dt * 4);
  } else fx.frost = Math.max(0, fx.frost - dt * 3);
  if (fx.frost > 0) {
    ctx.globalAlpha = 0.1 * fx.frost; ctx.fillStyle = '#7df9ff'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.5 * fx.frost; ctx.strokeStyle = '#bff8ff'; ctx.lineWidth = 6 * DPR; ctx.strokeRect(3 * DPR, 3 * DPR, W - 6 * DPR, H - 6 * DPR);
    ctx.globalAlpha = 1;
  }
  if (fx.flash > 0) { fx.flash -= dt; ctx.globalAlpha = clamp(fx.flash, 0, 0.5); ctx.fillStyle = '#e6fdff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (st && st.rev && s && !s.dead) {   // mirrored: thin red edges
    ctx.globalAlpha = 0.18 + 0.06 * Math.sin(TT * 6); ctx.fillStyle = '#ff2e6a'; ctx.fillRect(0, 0, 5 * DPR, H); ctx.fillRect(W - 5 * DPR, 0, 5 * DPR, H); ctx.globalAlpha = 1;
  }
  // glitch: torn slices + RGB split
  if (fx.g > 0) {
    const k = clamp(fx.g / fx.gMax, 0, 1); fx.g -= dt;
    bctx.globalCompositeOperation = 'copy'; bctx.drawImage(cv, 0, 0);
    const n = 3 + Math.floor(k * 9);
    for (let i = 0; i < n; i++) {
      const y = rnd() * H, h = (0.01 + rnd() * 0.07) * H, dx = (rnd() - 0.5) * k * 70 * DPR;
      ctx.drawImage(buf, 0, y, W, h, dx, y, W, h);
    }
    const sw = tA.width, sh = tA.height, off = k * 7 * DPR;
    tAc.globalCompositeOperation = 'copy'; tAc.drawImage(buf, 0, 0, sw, sh); tAc.globalCompositeOperation = 'multiply'; tAc.fillStyle = '#ff0050'; tAc.fillRect(0, 0, sw, sh);
    tBc.globalCompositeOperation = 'copy'; tBc.drawImage(buf, 0, 0, sw, sh); tBc.globalCompositeOperation = 'multiply'; tBc.fillStyle = '#00e5ff'; tBc.fillRect(0, 0, sw, sh);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 * k;
    ctx.drawImage(tA, off, 0, W, H); ctx.drawImage(tB, -off, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (k > 0.3) { ctx.fillStyle = `rgba(255,255,255,${0.05 * k})`; for (let i = 0; i < 4; i++) ctx.fillRect(0, rnd() * H, W, 2 * DPR); }
  }
  // scanlines + vignette
  ctx.fillStyle = scanPat; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(vign, 0, 0);
}

// ------------------------------------------------------------------ boot
document.body.classList.toggle('touch', touchMode);
resize();
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));
makeAttract();
updateSys();
showMenu();
requestAnimationFrame(frame);

// ------------------------------------------------------------------ test / automation hooks
window.GlitchHopper = {
  get mode() { return mode; },
  get level() { return cur ? cur.li : -1; },
  get levelCount() { return LV.length; },
  get state() {
    if (!cur) return { mode };
    const s = cur.s, ci = C.clockInfo(s);
    return { mode, level: cur.li, id: cur.lv.id, x: s.x, y: s.y, vx: s.vx, vy: s.vy, ground: s.ground, time: s.time, deaths: s.deaths, dead: s.dead, won: s.won, lost: s.lost,
      glitch: s.active.key, next: ci.next.key, left: ci.left, frozen: s.freezeT, charges: s.charges, frags: s.tg.filter(Boolean).length, cycleOn: s.cycleOn };
  },
  core: () => cur && cur.s, levels: LV, Core: C,
  start(i = 0, skipIntro = false) { startLevel(i, skipIntro); return mode; },
  go, pause, resume, restart, menu: showMenu, showLevels, showHow,
  setInput(o) { testInput = o ? { l: !!o.l, r: !!o.r, jump: !!o.jump, freeze: !!o.freeze } : null; },
  hold(b = true) { holdLoop = !!b; acc = 0; },
  step(n = 1, inp) { if (!cur || mode !== 'play') return null; const saved = testInput; if (inp) this.setInput(inp); for (let i = 0; i < n && mode === 'play' && !cur.s.won && !cur.s.lost; i++) tick(); testInput = saved; return this.state; },
  run(actions) {   // [[dir, jump, freeze], …] each 0.1 s — replays a recorded input script
    for (const [d, j, f] of actions) for (let k = 0; k < 12; k++) { if (!cur || cur.s.won || cur.s.lost) return this.state; testInput = { l: d < 0, r: d > 0, jump: !!j, freeze: !!f && k === 0 }; tick(); }
    testInput = null; return this.state;
  },
  teleport(x, y) { if (cur) { cur.s.x = x; cur.s.y = y; cur.s.vx = cur.s.vy = 0; cur.px = x; cur.py = y; } },
  win() { if (cur && mode === 'play') { const L = cur.L; this.teleport(L.exit.x + (1 - P.w) / 2, L.exit.y + 1 - P.h - 0.001); tick(); } return this.state; },
  lose() { if (cur && mode === 'play') { cur.s.began = true; cur.s.time = (cur.lv.limit || 1) - 0.001; tick(); } return this.state; },
  get progress() { return JSON.parse(JSON.stringify(prog)); },
  resetProgress() { prog = { unlocked: 1, lv: {} }; saveProg(); if (mode === 'menu' || mode === 'levels') renderScreen(); },
  unlockAll() { prog.unlocked = LV.length; saveProg(); if (mode === 'levels' || mode === 'menu') renderScreen(); },
};
})();
