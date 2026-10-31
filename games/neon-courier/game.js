'use strict';
// =====================================================================
// Neon Courier: Zero-G — a zero-gravity momentum delivery game for Mal3ab.
//  Fly packages through the ventilation shafts of an orbital megastructure with a grappling hook,
//  magnetic boots and thrusters. Momentum is conserved (only a little air drag), so you turn by
//  swinging round anchors and kicking off walls — and hard hits break the cargo.
//  PC: mouse aims · hold left click = grapple · Shift / right click = reel in · Ctrl / wheel = reel out
//      WASD / arrows = thrusters · hold Space = magnetic boots, release = kick off toward the mouse
//      R = restart · Esc / P = pause
//  Touch: hold on the screen = grapple toward the finger · joystick = thrusters · 🧲 ⤒ ⤓ buttons
// =====================================================================
(function () {
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const approach = (v, to, d) => v < to ? Math.min(to, v + d) : Math.max(to, v - d);
const cross = (ax, ay, bx, by) => ax * by - ay * bx;
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const unit = (k) => (getLang() === 'ar' ? { ms: 'م/ث', m: 'م' } : { ms: 'm/s', m: 'm' })[k];   // raw units (no Title Case)
const fmt = (s) => { if (!isFinite(s)) return '—'; s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(2); };

const SLUG = 'neon-courier', K_SAVE = SLUG + '-save', K_SET = SLUG + '-settings', K_GHOST = (i) => SLUG + '-ghost-' + (i + 1);
const T = 40, R = 11, FIX = 1 / 120, MPS = 20;          // tile size, player radius, physics step, units per metre
const THRUST = 560, FUEL_USE = 24, DRAG = 0.05, VMAX = 1450;
const HOOK_SPEED = 3200, HOOK_RANGE = 620, ROPE_MIN = 26, ROPE_MAX = 720, REEL_IN = 440, REEL_OUT = 340;
const RUN_SPEED = 330, RUN_ACC = 1000, KICK_MIN = 390, KICK_BONUS = 130, KICK_MAX = 1250, MAG_PULL = 1100, MAG_RANGE = 24;
const LEVELS = window.NC_LEVELS || [];

// ---------------------------------------------------------------- strings
addStrings({
  nc_tagline: 'وصّل الطرود جوّه محطة فضاء من غير جاذبية… بسرعة ومن غير ما تتكسر!',
  nc_play: '▶ العب', nc_levels: 'المراحل', nc_howto: 'إزاي تلعب', nc_back: 'رجوع', nc_resume: '▶ كمّل', nc_restart: '↻ ابدأ من الأول',
  nc_paused: 'وقفة', nc_next: 'المرحلة اللي بعدها ▶', nc_retry: '↻ جرّب تاني', nc_menu: 'القايمة الرئيسية',
  nc_music: 'المزيكا', nc_sfx: 'الأصوات', nc_ghost: 'شبح أحسن لفة', nc_on: 'شغّال', nc_off: 'مقفول',
  nc_delivered: 'اتسلّم! ✅', nc_failed: 'التوصيلة باظت', nc_broken: 'الطرد اتكسر حتت 💥', nc_late: 'اتأخرت… الأكل برد ⏰',
  nc_time: 'الوقت', nc_best: 'أحسن وقت', nc_cond: 'حالة الطرد', nc_newbest: '🎉 رقم قياسي جديد!', nc_flawless: '✨ ولا خدش',
  nc_gold: 'ميدالية دهب', nc_silver: 'ميدالية فضة', nc_bronze: 'ميدالية برونز', nc_nomedal: 'من غير ميدالية — حاول تبقى أسرع',
  nc_lvl: 'مرحلة {n}', nc_locked: 'مقفولة', nc_ready: 'اتحرك عشان تبدأ — الوقت هيبدأ مع أول حركة',
  nc_std: '📦 طرد عادي', nc_fragile: '🍷 قابل للكسر — براحة عليه!', nc_hot: '🔥 توصيل مستعجل: معاك {n} ثانية',
  nc_int: 'الطرد', nc_fuel: 'الوقود', nc_drop: 'تسليم', nc_left: 'فاضل {n} ث',
  nc_medals: 'أوقات الميداليات', nc_allDone: 'خلّصت كل المراحل! إنت أسرع مندوب في المحطة 🏆', nc_golds: '🥇 {n} من {m}',
  nc_stuckHint: 'الوقود خلص ومش عارف تتحرك؟ دوس R عشان تبدأ من الأول', nc_stuckHint_t: 'الوقود خلص ومش عارف تتحرك؟ دوس ↻ عشان تبدأ من الأول',
  nc_courier: 'المندوب: {p}', nc_ghostLbl: 'أحسن لفة',
  nc_h_goal_t: '🎯 الهدف', nc_h_goal: 'وصّل الطرد للمحطة الخضرا بأسرع وقت. مفيش جاذبية ولا احتكاك: أي سرعة تاخدها بتفضل معاك لحد ما توقّفها بنفسك.',
  nc_h_ctrl_t: '🎮 التحكم',
  nc_k_aim: 'الماوس: تنشين', nc_k_hook: 'كليك شمال (استمر دايس): الخطّاف', nc_k_reel: 'Shift أو كليك يمين: شد الحبل · Ctrl أو العجلة: سيّب الحبل',
  nc_k_thrust: 'WASD أو الأسهم: الصواريخ (بتصرف وقود)', nc_k_mag: 'Space (استمر دايس): البوت المغناطيسي · سيبها: تنط ناحية الماوس', nc_k_misc: 'R: من الأول · Esc أو P: وقفة',
  nc_t_hook: 'دوس على الشاشة واستمر: الخطّاف بيطلع ناحية صباعك', nc_t_thrust: 'الجويستيك اللي على الشمال: الصواريخ (بتصرف وقود)',
  nc_t_mag: 'زرار 🧲 (استمر دايس): إلزق في الحيطة المعدن · سيبه: تنط ناحية الجويستيك', nc_t_reel: 'زرار ⤒ بيشد الحبل · زرار ⤓ بيسيّبه',
  nc_h_move_t: '🪝 الحركة',
  nc_h_hook: 'الخطّاف بيمسك في الحيطان المعدن (اللي حروفها سماوي) والحلقات الصفرا. لف حواليهم عشان تاخد الدورة من غير ما تهدّي، وشد الحبل عشان يسحبك وتلف أسرع.',
  nc_h_mag: 'البوت المغناطيسي بيلزقك في الحيطة المعدن وتقدر تجري عليها. لما تسيبه بتنط ومعاك سرعتك كلها — كده تغيّر اتجاهك من غير ما تخبط.',
  nc_h_thrust: 'الصواريخ بتصرف وقود، ومحطات الوقود الخضرا بتملا الخزان. الإزاز البنفسجي ناعم: لا بيمسك خطّاف ولا مغناطيس.',
  nc_h_cargo_t: '📦 الطرد',
  nc_h_cargo: 'أي خبطة جامدة في حيطة بتقلل حالة الطرد، ولو وصلت صفر يبقى اتكسر. البوت المغناطيسي بيخفف الخبطة. عداد السرعة بيحمر لما سرعتك تبقى خطر على الطرد.',
  nc_h_haz_t: '⚠️ المخاطر',
  nc_h_haz: 'الليزر بيحرق الطرد وبيقطع الحبل. المراوح بتزقك في اتجاه الهوا. الماكينات اللي بتلف والدرونز بيخبطوك. أبواب الضغط بتفتح وتقفل لوحدها.',
  nc_h_medal_t: '🥇 الميداليات',
  nc_h_medal: 'خلّص بسرعة عشان تاخد دهب، وحاول توصّل من غير ولا خدش ✨. شبح أحسن لفة ليك بيطير جنبك عشان تسابقه.',
  nc_s1a: 'WASD أو الأسهم = صواريخ الدفع', nc_s1a_t: 'الجويستيك = صواريخ الدفع',
  nc_s1b: 'مفيش احتكاك هنا! عشان توقف لازم تدفع في الاتجاه العكسي',
  nc_s1c: 'محطة الوقود دي بتملالك الخزان', nc_s1d: 'وصّل الطرد للمحطة الخضرا →',
  nc_s2a: 'دوس كليك شمال واستمر: الخطّاف بيمسك في الحيطة المعدن والحلقات الصفرا',
  nc_s2a_t: 'دوس على الشاشة واستمر: الخطّاف بيمسك في الحيطة المعدن والحلقات الصفرا',
  nc_s2b: 'امسك الحلقة ولف حواليها عشان تاخد الدورة من غير ما تهدّي', nc_s2c: 'سيب الخطّاف في اللحظة الصح… وطير!',
  nc_s3a: 'دوس Space واستمر وإنت جنب حيطة معدن: هتلزق فيها', nc_s3a_t: 'دوس 🧲 واستمر وإنت جنب حيطة معدن: هتلزق فيها',
  nc_s3b: 'سيب Space: هتنط ناحية الماوس ومعاك سرعتك كلها', nc_s3b_t: 'سيب 🧲: هتنط ناحية الجويستيك ومعاك سرعتك كلها',
  nc_s3c: 'الإزاز البنفسجي ناعم: لا بيمسك خطّاف ولا مغناطيس',
  nc_s4a: 'وإنت ماسك بالخطّاف: Shift بيشد الحبل — بيسحبك ناحيته وبيخليك تلف أسرع',
  nc_s4a_t: 'وإنت ماسك بالخطّاف: ⤒ بيشد الحبل — بيسحبك ناحيته وبيخليك تلف أسرع',
  nc_s4b: 'Ctrl أو عجلة الماوس بتسيّب الحبل', nc_s4b_t: 'زرار ⤓ بيسيّب الحبل',
  nc_s5a: 'الطرد ده إزاز! أي خبطة جامدة هتكسره — لف بالخطّاف والمغناطيس بالراحة',
  nc_s6a: 'الليزر بيحرق الطرد وبيقطع الحبل!', nc_s6b: 'في ليزر بيطفي ويولّع — استنى اللحظة الصح',
  nc_s7a: 'المراوح بتزقك في اتجاه الهوا — استغلها. والبوت المغناطيسي بيثبّتك ضد الهوا', nc_s7b: 'المروحة دي بتشتغل وتقف — عدّي وهي واقفة',
  nc_s8a: 'أكل سخن! لازم يوصل قبل ما الوقت يخلص', nc_s9a: 'الماكينات اللي بتلف بتضرب الطرد — عدّي من الفراغات',
  nc_s10a: 'أبواب الضغط بتفتح وتقفل لوحدها — راقب النور الأحمر', nc_s10b: 'أو خد الفتحة اللي فوق… لو تقدر',
  nc_s11a: 'درونز الحراسة بتروح وتيجي — ظبط توقيتك', nc_s12a: 'جمّع سرعة — الحلقات دي هي النبلة بتاعتك',
  nc_s13a: 'الإزاز بيزحلق وبيرجّعك — والطرد إزاز كمان!', nc_s14a: 'طلب مستعجل من قلب المحطة — كل حاجة هنا عايزة تكسرك',
  nc_s15a: 'آخر توصيلة: إزاز ومستعجل كمان. بالتوفيق يا بطل!',
  nc_l1: 'أول وردية', nc_l2: 'أول خطّاف', nc_l3: 'خطوة مغناطيس', nc_l4: 'شد وسيّب', nc_l5: 'براحة عليه', nc_l6: 'شبكة الليزر',
  nc_l7: 'تيارات الهوا', nc_l8: 'نودلز سخنة', nc_l9: 'المفرمة', nc_l10: 'أبواب الضغط', nc_l11: 'حارة الدرونز', nc_l12: 'النبلة',
  nc_l13: 'متاهة الإزاز', nc_l14: 'قلب المحطة', nc_l15: 'الساعة صفر',
  nc_mag: 'مغناطيس', nc_in: 'شد', nc_out: 'سيّب',
}, {
  nc_tagline: 'Deliver packages through a zero-gravity space station — fast, and without breaking them!',
  nc_play: '▶ Play', nc_levels: 'Levels', nc_howto: 'How to play', nc_back: 'Back', nc_resume: '▶ Resume', nc_restart: '↻ Restart',
  nc_paused: 'Paused', nc_next: 'Next level ▶', nc_retry: '↻ Try again', nc_menu: 'Main menu',
  nc_music: 'Music', nc_sfx: 'Sound', nc_ghost: 'Best-run ghost', nc_on: 'on', nc_off: 'off',
  nc_delivered: 'Delivered! ✅', nc_failed: 'Delivery failed', nc_broken: 'The package got smashed 💥', nc_late: 'Too late — the food went cold ⏰',
  nc_time: 'Time', nc_best: 'Best', nc_cond: 'Cargo condition', nc_newbest: '🎉 New record!', nc_flawless: '✨ Flawless',
  nc_gold: 'Gold medal', nc_silver: 'Silver medal', nc_bronze: 'Bronze medal', nc_nomedal: 'No medal — try to be faster',
  nc_lvl: 'Level {n}', nc_locked: 'Locked', nc_ready: 'Move to start — the clock starts with your first move',
  nc_std: '📦 Standard parcel', nc_fragile: '🍷 Fragile — handle with care!', nc_hot: '🔥 Express delivery: {n} seconds',
  nc_int: 'Cargo', nc_fuel: 'Fuel', nc_drop: 'DROP', nc_left: '{n}s left',
  nc_medals: 'Medal times', nc_allDone: 'You finished every level! The fastest courier on the station 🏆', nc_golds: '🥇 {n} of {m}',
  nc_stuckHint: 'Out of fuel and drifting? Press R to restart', nc_stuckHint_t: 'Out of fuel and drifting? Tap ↻ to restart',
  nc_courier: 'Courier: {p}', nc_ghostLbl: 'best run',
  nc_h_goal_t: '🎯 Goal', nc_h_goal: 'Fly the package to the green terminal as fast as you can. There is no gravity and no friction: whatever speed you build up stays with you until you cancel it yourself.',
  nc_h_ctrl_t: '🎮 Controls',
  nc_k_aim: 'Mouse: aim', nc_k_hook: 'Hold left click: grappling hook', nc_k_reel: 'Shift or right click: reel in · Ctrl or wheel: reel out',
  nc_k_thrust: 'WASD or arrows: thrusters (use fuel)', nc_k_mag: 'Hold Space: magnetic boots · release: kick off toward the mouse', nc_k_misc: 'R: restart · Esc or P: pause',
  nc_t_hook: 'Touch and hold the screen: fire the hook toward your finger', nc_t_thrust: 'Left joystick: thrusters (use fuel)',
  nc_t_mag: 'Hold 🧲: stick to metal walls · release: kick off toward the joystick', nc_t_reel: '⤒ reels the rope in · ⤓ lets it out',
  nc_h_move_t: '🪝 Moving',
  nc_h_hook: 'The hook grabs metal walls (cyan edges) and yellow rings. Swing round them to turn corners without losing speed, and reel in to get pulled along and spin faster.',
  nc_h_mag: 'Magnetic boots stick you to metal walls and let you run along them. Let go to kick off with all your speed — that is how you change direction without crashing.',
  nc_h_thrust: 'Thrusters burn fuel; green fuel pads refill the tank. Purple glass is slick: the hook and the boots do not hold on it.',
  nc_h_cargo_t: '📦 Cargo',
  nc_h_cargo: 'Every hard hit on a wall damages the package; at zero it breaks. Magnetic boots soften landings. The speed readout turns red when a crash would hurt the cargo.',
  nc_h_haz_t: '⚠️ Hazards',
  nc_h_haz: 'Lasers burn the cargo and cut your rope. Fans push you along their airflow. Spinning machinery and drones knock you around. Airlock doors open and close on their own.',
  nc_h_medal_t: '🥇 Medals',
  nc_h_medal: 'Finish fast for gold, and try to arrive without a scratch ✨. A ghost of your best run flies along so you can race it.',
  nc_s1a: 'WASD / arrows = thrusters', nc_s1a_t: 'Joystick = thrusters',
  nc_s1b: 'No friction out here! To stop, you have to thrust the opposite way',
  nc_s1c: 'This pad refills your fuel tank', nc_s1d: 'Bring the package to the green terminal →',
  nc_s2a: 'Hold left click: the hook grabs metal walls and yellow rings',
  nc_s2a_t: 'Touch and hold: the hook grabs metal walls and yellow rings',
  nc_s2b: 'Hook a ring and swing round it to take the corner at full speed', nc_s2c: 'Let go at the right moment… and fly!',
  nc_s3a: 'Hold Space next to a metal wall: your boots stick to it', nc_s3a_t: 'Hold 🧲 next to a metal wall: your boots stick to it',
  nc_s3b: 'Release Space: you kick off toward the mouse with all your speed', nc_s3b_t: 'Release 🧲: you kick off toward the joystick with all your speed',
  nc_s3c: 'Purple glass is slick: no hook, no magnets',
  nc_s4a: 'While hooked, Shift reels in — it pulls you along and spins you faster',
  nc_s4a_t: 'While hooked, ⤒ reels in — it pulls you along and spins you faster',
  nc_s4b: 'Ctrl or the mouse wheel lets the rope out', nc_s4b_t: '⤓ lets the rope out',
  nc_s5a: 'This one is glass! A hard bump will break it — turn gently with the hook and the boots',
  nc_s6a: 'Lasers burn the cargo and cut your rope!', nc_s6b: 'Some lasers blink — wait for the right moment',
  nc_s7a: 'Fans push you along their airflow — ride them. Magnetic boots hold you against the wind', nc_s7b: 'This fan pulses — cross while it rests',
  nc_s8a: 'Hot food! It has to arrive before the clock runs out', nc_s9a: 'Spinning machinery smashes cargo — slip through the gaps',
  nc_s10a: 'Airlocks open and close on their own — watch the red warning lights', nc_s10b: 'Or take the vent up top… if you dare',
  nc_s11a: 'Security drones patrol back and forth — time your run', nc_s12a: 'Build up speed — these rings are your slingshot',
  nc_s13a: 'Glass is slick and bouncy — and so is your cargo!', nc_s14a: 'Rush order from the station core — everything here wants to break you',
  nc_s15a: 'Last delivery: fragile AND urgent. Good luck, hero!',
  nc_l1: 'First Shift', nc_l2: 'Hook Line', nc_l3: 'Mag Step', nc_l4: 'Reel Deal', nc_l5: 'Handle With Care', nc_l6: 'Laser Lattice',
  nc_l7: 'Vent Currents', nc_l8: 'Hot Noodles', nc_l9: 'The Grinder', nc_l10: 'Airlock Cycle', nc_l11: 'Drone Alley', nc_l12: 'Slingshot',
  nc_l13: 'Glass Maze', nc_l14: 'Core Breach', nc_l15: 'Zero Hour',
  nc_mag: 'mag', nc_in: 'reel', nc_out: 'slack',
});
// online race (2 players)
addStrings({
  nc_o_btn: '🌐 سباق أونلاين', nc_o_title: 'سباق أونلاين', nc_o_intro: 'سابق صاحبك على نفس المرحلة في نفس الوقت — اللي يوصّل الطرد الأول يكسب!',
  nc_o_name: 'اسمك', nc_o_namePh: 'اكتب اسمك هنا', nc_o_create: '➕ اعمل أوضة جديدة', nc_o_or: 'أو ادخل أوضة صاحبك بالكود',
  nc_o_codePh: 'الكود', nc_o_join: 'ادخل', nc_o_codeHint: 'اكتب كود الأوضة صح (٤ حروف أو أكتر).', nc_o_noNet: 'مفيش اتصال بالسيرفر دلوقتي — جرّب كمان شوية.',
  nc_o_room: 'كود الأوضة', nc_o_copy: '🔗 انسخ لينك الدعوة', nc_o_copied: '✓ اتنسخ', nc_o_share: 'ابعت الكود أو اللينك لصاحبك عشان يدخل معاك.',
  nc_o_host: 'المضيف', nc_o_guest: 'الضيف', nc_o_you: 'إنت', nc_o_wait: 'مستني لاعب تاني يدخل…', nc_o_connecting: 'بيتصل بالسيرفر…',
  nc_o_swap: '🔄 بدّلوا مين المضيف', nc_o_level: 'المرحلة', nc_o_hostPicks: 'المضيف هو اللي بيختار المرحلة ويبدأ السباق.',
  nc_o_start: '🏁 ابدأ السباق', nc_o_needP: 'لازم لاعب تاني يدخل الأوضة الأول.', nc_o_waitHost: 'مستني المضيف يبدأ السباق…', nc_o_leave: 'اخرج من الأوضة',
  nc_o_full: 'الأوضة دي مليانة خلاص.', nc_o_joined: '{p} دخل الأوضة 👋', nc_o_left: '{p} خرج من الأوضة',
  nc_o_leftT: '{p} خرج من السباق', nc_o_leftD: 'تقدر تكمّل السباق لوحدك وتسجّل وقتك، أو ترجع للقايمة.', nc_o_solo: '▶ كمّل لوحدك', nc_o_menu: 'القايمة الرئيسية',
  nc_o_go: 'يلا!', nc_o_rivalFirst: '🏁 {p} وصّل الأول في {t} — كمّل عشان تسجّل وقتك', nc_o_gaveP: '🏳 {p} استسلم — وصّل الطرد وتكسب', nc_o_outP: '{p} خرج من السباق — وصّل الطرد وتكسب',
  nc_o_win: '🏆 إنت الكسبان!', nc_o_lose: 'المرة دي خسرت 😅', nc_o_tie: 'تعادل! 🤝', nc_o_gaveUp: '🏳 استسلمت', nc_o_oppLeftN: 'منافسك خرج من السباق.',
  nc_o_flying: 'لسه بيطير · {n}%', nc_o_stLeft: 'خرج', nc_o_stGave: 'استسلم',
  nc_o_rematch: '🔁 عيد السباق', nc_o_next: 'المرحلة اللي بعدها ▶', nc_o_toRoom: 'ارجع للأوضة', nc_o_waitReq: 'مستني المضيف…', nc_o_wantsRe: '{p} عايز يعيد السباق',
  nc_o_giveup: '🏳 استسلم', nc_o_back: '↻ ارجع لنقطة البداية', nc_o_clock: 'السباق شغّال — الساعة مش بتقف', nc_o_respawn: 'ارجع للبداية!',
  nc_o_rival: 'المنافس', nc_o_defName: 'مندوب',
}, {
  nc_o_btn: '🌐 Online Race', nc_o_title: 'Online Race', nc_o_intro: 'Race a friend on the same level at the same time — first to deliver wins!',
  nc_o_name: 'Your Name', nc_o_namePh: 'Type your name', nc_o_create: '➕ Create Room', nc_o_or: 'Or Join a Friend With a Code',
  nc_o_codePh: 'Code', nc_o_join: 'Join', nc_o_codeHint: 'Type the room code (4 letters or more).', nc_o_noNet: 'No connection to the server — try again in a bit.',
  nc_o_room: 'Room Code', nc_o_copy: '🔗 Copy Invite Link', nc_o_copied: '✓ Copied', nc_o_share: 'Send the code or the link to your friend.',
  nc_o_host: 'Host', nc_o_guest: 'Guest', nc_o_you: 'You', nc_o_wait: 'Waiting for a second player…', nc_o_connecting: 'Connecting…',
  nc_o_swap: '🔄 Swap Host', nc_o_level: 'Level', nc_o_hostPicks: 'The host picks the level and starts the race.',
  nc_o_start: '🏁 Start Race', nc_o_needP: 'A second player has to join first.', nc_o_waitHost: 'Waiting for the host to start the race…', nc_o_leave: 'Leave Room',
  nc_o_full: 'This room is already full.', nc_o_joined: '{p} joined the room 👋', nc_o_left: '{p} left the room',
  nc_o_leftT: '{p} left the race', nc_o_leftD: 'You can finish the race on your own and set your time, or go back to the menu.', nc_o_solo: '▶ Keep Racing Solo', nc_o_menu: 'Main Menu',
  nc_o_go: 'GO!', nc_o_rivalFirst: '🏁 {p} delivered first in {t} — finish to set your time', nc_o_gaveP: '🏳 {p} gave up — deliver to win', nc_o_outP: '{p} left the race — deliver to win',
  nc_o_win: '🏆 You Win!', nc_o_lose: 'You Lost This One 😅', nc_o_tie: "It's a Tie! 🤝", nc_o_gaveUp: '🏳 You Gave Up', nc_o_oppLeftN: 'Your opponent left the race.',
  nc_o_flying: 'Still Flying · {n}%', nc_o_stLeft: 'Left', nc_o_stGave: 'Gave Up',
  nc_o_rematch: '🔁 Rematch', nc_o_next: 'Next Level ▶', nc_o_toRoom: 'Back to Room', nc_o_waitReq: 'Waiting for the host…', nc_o_wantsRe: '{p} wants a rematch',
  nc_o_giveup: '🏳 Give Up', nc_o_back: '↻ Back to Start', nc_o_clock: 'The race is on — the clock keeps running', nc_o_respawn: 'Back to start!',
  nc_o_rival: 'Rival', nc_o_defName: 'Courier',
});

// ---------------------------------------------------------------- saves
const SAVE = Object.assign({ unlocked: 1, best: {}, medal: {}, flaw: {} }, lsGet(K_SAVE, {}) || {});
const SET = Object.assign({ music: true, sfx: true, ghost: true }, lsGet(K_SET, {}) || {});
const saveGame = () => lsSet(K_SAVE, SAVE);
const saveSet = () => lsSet(K_SET, SET);

// ---------------------------------------------------------------- audio (all synthesized)
const AU = {
  ctx: null, out: null, sfxG: null, musG: null, nbuf: null, loops: {}, last: {},
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    try { this.ctx = new C(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx;
    this.out = c.createDynamicsCompressor(); this.out.threshold.value = -14; this.out.connect(c.destination);
    this.sfxG = c.createGain(); this.sfxG.gain.value = SET.sfx ? 0.85 : 0; this.sfxG.connect(this.out);
    this.musG = c.createGain(); this.musG.gain.value = SET.music ? 0.3 : 0; this.musG.connect(this.out);
    const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.nbuf = b;
    this.loops.thr = this.loop('bandpass', 900, 0.8);
    this.loops.wind = this.loop('lowpass', 400, 0.6);
    this.loops.fan = this.loop('bandpass', 240, 1.6);
    Music.start();
  },
  loop(type, f, q) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.nbuf; s.loop = true;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = c.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(this.sfxG); s.start(); return { g, fl, v: 0 };
  },
  setLoop(name, vol, freq) {
    const l = this.loops[name]; if (!l || !this.ctx) return; const t = this.ctx.currentTime;
    if (Math.abs(l.v - vol) > 0.003) { l.g.gain.setTargetAtTime(vol, t, 0.05); l.v = vol; }
    if (freq) l.fl.frequency.setTargetAtTime(freq, t, 0.08);
  },
  setVolumes() { if (!this.ctx) return; const t = this.ctx.currentTime; this.sfxG.gain.setTargetAtTime(SET.sfx ? 0.85 : 0, t, 0.05); this.musG.gain.setTargetAtTime(SET.music ? 0.3 : 0, t, 0.1); },
  tone(f, dur, type = 'sine', vol = 0.2, f2 = 0, delay = 0) {
    if (!this.ctx || !SET.sfx) return;
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.sfxG); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.2, type = 'lowpass', f = 1200, f2 = 0, q = 1, delay = 0) {
    if (!this.ctx || !SET.sfx) return;
    const c = this.ctx, t = c.currentTime + delay, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nbuf; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(this.sfxG); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  },
  sfx(name, k = 1) {
    if (!this.ctx || !SET.sfx) return;
    const now = performance.now(); if (this.last[name] && now - this.last[name] < 40) return; this.last[name] = now;
    switch (name) {
      case 'hook': this.tone(1300, 0.09, 'square', 0.04, 2600); this.noise(0.08, 0.05, 'highpass', 3000); break;
      case 'attach': this.tone(260, 0.12, 'triangle', 0.18, 140); this.noise(0.06, 0.14, 'bandpass', 2400, 0, 3); this.tone(1900, 0.05, 'square', 0.03); break;
      case 'miss': this.tone(2300, 0.09, 'sine', 0.06, 1700); break;
      case 'bonk': this.noise(0.1, 0.05 + 0.15 * k, 'lowpass', 500 + 600 * k); this.tone(120, 0.1, 'sine', 0.05 + 0.1 * k, 60); break;
      case 'crash': this.noise(0.28, 0.32, 'lowpass', 1600, 200); this.noise(0.16, 0.2, 'highpass', 2600); this.tone(170, 0.3, 'sawtooth', 0.1, 50); break;
      case 'clamp': this.tone(95, 0.16, 'square', 0.07, 150); this.tone(720, 0.05, 'triangle', 0.06); break;
      case 'kick': this.noise(0.22, 0.18, 'bandpass', 600, 2600, 1.2); this.tone(180, 0.12, 'sine', 0.18, 430); break;
      case 'zap': this.tone(1700, 0.18, 'sawtooth', 0.1, 120); this.noise(0.12, 0.15, 'highpass', 4000); break;
      case 'cut': this.noise(0.07, 0.25, 'highpass', 3000); this.tone(900, 0.06, 'square', 0.05, 300); break;
      case 'clang': [520, 780, 1170].forEach(f => this.tone(f, 0.35, 'square', 0.035, f * 0.9)); this.noise(0.12, 0.2, 'bandpass', 1800, 0, 2); break;
      case 'fuel': this.tone(480 + k * 520, 0.05, 'triangle', 0.035); break;
      case 'deliver': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.11, 0, i * 0.07)); this.noise(0.6, 0.06, 'highpass', 6000, 0, 1, 0.3); break;
      case 'medal': [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.7, 'sine', 0.08, 0, 0.1 + i * 0.09)); break;
      case 'fail': this.tone(420, 0.7, 'sawtooth', 0.11, 55); this.noise(0.45, 0.2, 'lowpass', 900, 100); break;
      case 'click': this.tone(880, 0.04, 'square', 0.035); break;
      case 'door': this.noise(0.4, 0.06 * k, 'bandpass', 900, 260, 1); break;
      case 'beep': this.tone(1250, 0.08, 'square', 0.05); break;
      case 'reel': this.tone(260 + k * 420, 0.03, 'square', 0.02); break;
      case 'start': this.tone(660, 0.08, 'triangle', 0.1); this.tone(990, 0.12, 'triangle', 0.1, 0, 0.08); break;
    }
  },
};
const Music = {
  timer: 0, next: 0, step: 0, bpm: 104, drums: false,
  start() { if (this.timer || !AU.ctx) return; this.next = AU.ctx.currentTime + 0.1; this.timer = setInterval(() => this.tick(), 40); },
  tick() {
    const c = AU.ctx; if (!c || c.state !== 'running') return;
    if (!SET.music) { this.next = c.currentTime + 0.05; return; }
    const sp = 60 / this.bpm / 4;
    if (this.next < c.currentTime - 0.3) this.next = c.currentTime + 0.05;
    while (this.next < c.currentTime + 0.16) { this.play(this.step, this.next, sp); this.next += sp; this.step = (this.step + 1) % 64; }
  },
  play(s, t, sp) {
    const bar = (s >> 4) & 3, i = s & 15;
    const prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];          // Am F C G
    const ch = prog[bar], root = ch[0] - 24;
    if (i % 2 === 0) this.note(root + (i % 4 === 2 ? 12 : 0), t, sp * 1.7, 'sawtooth', 0.075, 520);
    const arp = [0, 1, 2, 1, 0, 2, 1, 2];
    if (this.drums || i % 2 === 0) this.note(ch[arp[i % 8]] + (i >= 8 ? 12 : 0), t, sp * 0.9, 'square', 0.022, 2400);
    if (i === 0) ch.forEach(n => this.note(n, t, sp * 15, 'sawtooth', 0.011, 900, true));
    if (!this.drums) return;
    const c = AU.ctx;
    if (i % 4 === 0) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(AU.musG); o.start(t); o.stop(t + 0.2); }
    if (i === 4 || i === 12) this.hit(t, 0.12, 'bandpass', 1500, 0.13);
    if (i % 2 === 1) this.hit(t, 0.04, 'highpass', 7000, 0.035);
  },
  hit(t, dur, type, f, vol) {
    const c = AU.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = AU.nbuf; fl.type = type; fl.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(AU.musG); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  },
  note(m, t, dur, type, vol, cut, pad) {
    const c = AU.ctx, f = 440 * Math.pow(2, (m - 69) / 12);
    const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.value = f; if (pad) o.detune.value = rnd(-12, 12);
    fl.type = 'lowpass'; fl.frequency.value = cut;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (pad ? 0.4 : 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(AU.musG); o.start(t); o.stop(t + dur + 0.05);
  },
};

// ---------------------------------------------------------------- level compiler
const LEGS = { '#': 'TRBL', '=': 'TRBL', '1': 'LB', '2': 'RB', '3': 'TL', '4': 'TR' };
const OPP = { T: 'B', B: 'T', L: 'R', R: 'L' };
const NBR = { T: [0, -1], B: [0, 1], L: [-1, 0], R: [1, 0] };
const SIDE = { T: [0, 0, 1, 0, 0, -1], R: [1, 0, 1, 1, 1, 0], B: [1, 1, 0, 1, 0, 1], L: [0, 1, 0, 0, -1, 0] };
const HYP = { '1': [0, 0, 1, 1, 1, -1], '2': [0, 1, 1, 0, -1, -1], '3': [1, 0, 0, 1, 1, 1], '4': [1, 1, 0, 0, -1, 1] };
const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const GS = 80;   // spatial grid cell (world units)

function mkSeg(ax, ay, bx, by, nx, ny, metal, glass) {
  const len = Math.hypot(bx - ax, by - ay);
  return { ax, ay, bx, by, nx, ny, metal, glass, len, dx: (bx - ax) / len, dy: (by - ay) / len,
    minx: Math.min(ax, bx), miny: Math.min(ay, by), maxx: Math.max(ax, bx), maxy: Math.max(ay, by), st: 0 };
}

function compileLevel(idx) {
  const def = LEVELS[idx], W = def.w, H = def.h, g = new Array(W * H).fill('#');
  const Lv = { idx, def, W, H, g, start: { x: 3 * T, y: 3 * T }, term: null, anchors: [], fuels: [], lasers: [], fanDefs: [], fanCols: [],
    spins: [], rots: [], drones: [], doors: [], signs: [], segs: [], corners: [] };
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const fill = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inb(i, j)) g[j * W + i] = ch; };
  const pend = { lasers: [], fans: [], fuels: [] };
  const m = {
    carve: (x, y, w, h) => fill(x, y, w, h, '.'),
    wall: (x, y, w, h) => fill(x, y, w, h, '#'),
    glass: (x, y, w, h) => fill(x, y, w, h, '='),
    slope: (x, y, k) => fill(x, y, 1, 1, String(k)),
    start: (x, y) => { Lv.start = { x: x * T, y: y * T }; },
    term: (x, y, dir) => { Lv.term = { x: x * T, y: y * T, dir: DIRS[dir || 'r'] }; },
    anchor: (x, y) => Lv.anchors.push({ x: x * T, y: y * T, pulse: Math.random() * TAU }),
    fuel: (x, y, dir) => pend.fuels.push({ x, y, dir: DIRS[dir || 'd'] }),
    laser: (x, y, dir, o) => pend.lasers.push({ x, y, dir: DIRS[dir], o: o || {} }),
    fan: (x, y, dir, n, o) => pend.fans.push({ x, y, dir: DIRS[dir], n: n || 1, o: o || {} }),
    spin: (x, y, o = {}) => Lv.spins.push({ x: x * T, y: y * T, len: (o.len || 3) * T, speed: o.speed || 1.4, arms: o.arms || 2, ang: o.ang || 0 }),
    rot: (x, y, o = {}) => Lv.rots.push({ x: x * T, y: y * T, len: (o.len || 8) * T, speed: o.speed || 0.6, arms: o.arms || 2, ang: o.ang || 0, beams: [] }),
    drone: (x1, y1, x2, y2, o = {}) => Lv.drones.push({ x1: x1 * T, y1: y1 * T, x2: x2 * T, y2: y2 * T, period: o.period || 3, phase: o.phase || 0, x: x1 * T, y: y1 * T, vx: 0, vy: 0, spin: 0 }),
    door: (x, y, w, h, grp) => Lv.doors.push({ x: x * T, y: y * T, w: w * T, h: h * T, grp: grp || 'A', open: 1, solid: false, warn: false, segs: [] }),
    sign: (x, y, key, o = {}) => Lv.signs.push({ x: x * T, y: y * T, key, w: (o.w || 7) * T, cache: null }),
  };
  def.build(m);
  if (!Lv.term) Lv.term = { x: (W - 3) * T, y: (H - 3) * T, dir: [1, 0] };
  const cell = (x, y) => inb(x, y) ? g[y * W + x] : '#';
  Lv.cell = cell;
  Lv.solidAt = (x, y) => {
    const cx = Math.floor(x / T), cy = Math.floor(y / T), c = cell(cx, cy);
    if (c === '#' || c === '=') return true;
    if (c === '.') return false;
    const u = x / T - cx, v = y / T - cy;
    if (c === '1') return v >= u; if (c === '2') return u + v >= 1; if (c === '3') return u + v <= 1; return v <= u;
  };

  // boundary edges → merged segments
  const raw = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = g[y * W + x], legs = LEGS[c]; if (!legs) continue;
    const metal = c !== '=';
    for (const s of legs) {
      const nx = x + NBR[s][0], ny = y + NBR[s][1]; if (!inb(nx, ny)) continue;
      const nl = LEGS[cell(nx, ny)]; if (nl && nl.includes(OPP[s])) continue;
      const e = SIDE[s]; raw.push({ ax: x + e[0], ay: y + e[1], bx: x + e[2], by: y + e[3], nx: e[4], ny: e[5], metal });
    }
    if (HYP[c]) { const e = HYP[c], k = Math.SQRT1_2; raw.push({ ax: x + e[0], ay: y + e[1], bx: x + e[2], by: y + e[3], nx: e[4] * k, ny: e[5] * k, metal: true }); }
  }
  const key = (x, y, e) => x + ',' + y + ',' + e.nx.toFixed(2) + ',' + e.ny.toFixed(2) + ',' + (e.metal ? 1 : 0);
  const byStart = new Map(); raw.forEach(e => byStart.set(key(e.ax, e.ay, e), e));
  const hasPrev = new Set(); raw.forEach(e => { const n = byStart.get(key(e.bx, e.by, e)); if (n) hasPrev.add(n); });
  for (const e of raw) {
    if (hasPrev.has(e)) continue;
    let bx = e.bx, by = e.by, n, guard = 0;
    while ((n = byStart.get(key(bx, by, e))) && guard++ < 500) { bx = n.bx; by = n.by; }
    Lv.segs.push(mkSeg(e.ax * T, e.ay * T, bx * T, by * T, e.nx, e.ny, e.metal, !e.metal));
  }
  // convex corners the rope can wrap round
  for (let j = 1; j < H; j++) for (let i = 1; i < W; i++) {
    const X = i * T, Y = j * T; let cnt = 0, ox = 0, oy = 0;
    for (let k = 0; k < 8; k++) { const a = (k + 0.5) * Math.PI / 4, sx = Math.cos(a), sy = Math.sin(a); if (Lv.solidAt(X + sx * 4, Y + sy * 4)) cnt++; else { ox += sx; oy += sy; } }
    if (cnt >= 1 && cnt <= 3) { const l = Math.hypot(ox, oy) || 1; Lv.corners.push({ x: X, y: Y, ox: ox / l, oy: oy / l }); }
  }
  // spatial grids
  Lv.GW = Math.ceil(W * T / GS) + 1; Lv.GH = Math.ceil(H * T / GS) + 1;
  Lv.segGrid = Array.from({ length: Lv.GW * Lv.GH }, () => []);
  Lv.cornerGrid = Array.from({ length: Lv.GW * Lv.GH }, () => []);
  for (const s of Lv.segs) {
    const x0 = clamp(Math.floor((s.minx - 2) / GS), 0, Lv.GW - 1), x1 = clamp(Math.floor((s.maxx + 2) / GS), 0, Lv.GW - 1);
    const y0 = clamp(Math.floor((s.miny - 2) / GS), 0, Lv.GH - 1), y1 = clamp(Math.floor((s.maxy + 2) / GS), 0, Lv.GH - 1);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) Lv.segGrid[gy * Lv.GW + gx].push(s);
  }
  for (const c of Lv.corners) Lv.cornerGrid[clamp(Math.floor(c.y / GS), 0, Lv.GH - 1) * Lv.GW + clamp(Math.floor(c.x / GS), 0, Lv.GW - 1)].push(c);

  // entities that depend on the geometry
  for (const f of pend.fuels) {
    const cx = (f.x + 0.5) * T, cy = (f.y + 0.5) * T;
    Lv.fuels.push({ x: cx, y: cy, px: cx + f.dir[0] * 0.5 * T, py: cy + f.dir[1] * 0.5 * T, dir: f.dir, glow: 0 });
  }
  for (const l of pend.lasers) {
    const [dx, dy] = l.dir, cx = (l.x + 0.5) * T, cy = (l.y + 0.5) * T;
    const x0 = cx - dx * 0.47 * T, y0 = cy - dy * 0.47 * T, max = (l.o.len || 60) * T;
    const hit = rayStatic(Lv, x0 + dx * 2, y0 + dy * 2, x0 + dx * max, y0 + dy * max);
    const x1 = hit ? hit.x : x0 + dx * max, y1 = hit ? hit.y : y0 + dy * max;
    Lv.lasers.push({ x0, y0, x1, y1, dx, dy, cycle: l.o.cycle || null, phase: l.o.phase || 0, on: true, warn: false, capped: !hit });
  }
  for (const f of pend.fans) {
    const [dx, dy] = f.dir, px = dx ? 0 : 1, py = dx ? 1 : 0, maxLen = f.o.len || 14;
    const def2 = { cells: [], dx, dy, n: f.n, power: f.o.power || 1300, cycle: f.o.cycle || null, phase: f.o.phase || 0, on: true, spin: 0, rpm: 1 };
    for (let k = 0; k < f.n; k++) {
      const ex = f.x + px * k, ey = f.y + py * k; let c = 0;
      while (c < maxLen && cell(ex + dx * c, ey + dy * c) === '.') c++;
      const ax = ex + Math.min(0, dx * (c - 1)), ay = ey + Math.min(0, dy * (c - 1));
      const col = { x0: ax * T, y0: ay * T, x1: (ax + (dx ? c : 1)) * T, y1: (ay + (dy ? c : 1)) * T, dx, dy, len: c * T, fan: def2,
        bx: (ex + 0.5 - dx * 0.5) * T, by: (ey + 0.5 - dy * 0.5) * T };
      def2.cells.push(col); Lv.fanCols.push(col);
    }
    Lv.fanDefs.push(def2);
  }
  for (const d of Lv.doors) {
    const { x, y, w, h } = d;
    d.segs = [mkSeg(x, y, x + w, y, 0, -1, false, false), mkSeg(x + w, y, x + w, y + h, 1, 0, false, false),
      mkSeg(x + w, y + h, x, y + h, 0, 1, false, false), mkSeg(x, y + h, x, y, -1, 0, false, false)];
    d.vert = h >= w;
  }
  // shortest open route → medal times + menu fly-through
  const pf = pathfind(Lv);
  Lv.path = pf.path; Lv.routeLen = pf.d * T;
  const gold = Math.max(5, (Lv.routeLen / 400 + 2) * (def.par || 1.3));
  const r2 = (v) => Math.round(v * 2) / 2;
  Lv.medals = def.medals || [r2(gold), r2(gold * 1.35 + 1), r2(gold * 1.9 + 3)];
  Lv.limit = def.hot ? (def.limit || Math.ceil(Lv.medals[1] * 1.3)) : 0;
  buildArt(Lv);
  return Lv;
}

function pathfind(Lv) {
  const { W, H, g } = Lv, N = W * H;
  const s = Math.floor(Lv.start.y / T) * W + Math.floor(Lv.start.x / T), e = Math.floor(Lv.term.y / T) * W + Math.floor(Lv.term.x / T);
  const dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
  const open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && g[y * W + x] === '.';
  const heap = []; const push = (i, d) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  dist[s] = 0; push(s, 0);
  while (heap.length) {
    const [d, u] = pop(); if (d > dist[u]) continue; if (u === e) break;
    const ux = u % W, uy = (u / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const vx = ux + dx, vy = uy + dy; if (!open(vx, vy)) continue;
      if (dx && dy && (!open(ux + dx, uy) || !open(ux, uy + dy))) continue;
      const v = vy * W + vx, nd = d + (dx && dy ? 1.4142 : 1);
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push(v, nd); }
    }
  }
  const path = []; if (isFinite(dist[e])) { for (let u = e; u !== -1; u = prev[u]) path.push([(u % W + 0.5) * T, (((u / W) | 0) + 0.5) * T]); path.reverse(); }
  return { d: isFinite(dist[e]) ? dist[e] : 60, path, ok: isFinite(dist[e]) };
}

// ---------------------------------------------------------------- geometry queries
let qStamp = 0;
const qOut = [], qCorn = [];
function querySegs(Lv, x0, y0, x1, y1, out) {
  out.length = 0; qStamp++;
  const gx0 = clamp(Math.floor(Math.min(x0, x1) / GS), 0, Lv.GW - 1), gx1 = clamp(Math.floor(Math.max(x0, x1) / GS), 0, Lv.GW - 1);
  const gy0 = clamp(Math.floor(Math.min(y0, y1) / GS), 0, Lv.GH - 1), gy1 = clamp(Math.floor(Math.max(y0, y1) / GS), 0, Lv.GH - 1);
  for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const c = Lv.segGrid[gy * Lv.GW + gx]; for (let i = 0; i < c.length; i++) { const s = c[i]; if (s.st !== qStamp) { s.st = qStamp; out.push(s); } } }
  return out;
}
function segHit(x0, y0, x1, y1, s) {
  const rx = x1 - x0, ry = y1 - y0, sx = s.bx - s.ax, sy = s.by - s.ay, den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return -1;
  const qx = s.ax - x0, qy = s.ay - y0, t = (qx * sy - qy * sx) / den, u = (qx * ry - qy * rx) / den;
  return (t >= 0 && t <= 1 && u >= 0 && u <= 1) ? t : -1;
}
function rayStatic(Lv, x0, y0, x1, y1) {
  const list = querySegs(Lv, x0, y0, x1, y1, []);
  let best = 2, bs = null;
  for (const s of list) { const t = segHit(x0, y0, x1, y1, s); if (t >= 0 && t < best) { best = t; bs = s; } }
  return bs ? { t: best, s: bs, x: x0 + (x1 - x0) * best, y: y0 + (y1 - y0) * best } : null;
}
const rayTmp = [];
function raycast(x0, y0, x1, y1, doors) {
  const list = querySegs(L, x0, y0, x1, y1, rayTmp);
  let best = 2, bs = null;
  for (let i = 0; i < list.length; i++) { const t = segHit(x0, y0, x1, y1, list[i]); if (t >= 0 && t < best) { best = t; bs = list[i]; } }
  if (doors) for (const d of L.doors) if (d.solid) for (const s of d.segs) { const t = segHit(x0, y0, x1, y1, s); if (t >= 0 && t < best) { best = t; bs = s; } }
  return bs ? { t: best, s: bs, x: x0 + (x1 - x0) * best, y: y0 + (y1 - y0) * best } : null;
}
function blocked(x0, y0, x1, y1) { const h = raycast(x0, y0, x1, y1, false); return !!h && h.t < 0.995; }
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = clamp(t, 0, 1);
  const qx = ax + dx * t, qy = ay + dy * t; return [Math.hypot(px - qx, py - qy), qx, qy];
}
function segsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = cross(dx - cx, dy - cy, ax - cx, ay - cy), d2 = cross(dx - cx, dy - cy, bx - cx, by - cy);
  const d3 = cross(bx - ax, by - ay, cx - ax, cy - ay), d4 = cross(bx - ax, by - ay, dx - ax, dy - ay);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) { const t = d1 / (d1 - d2); return [ax + (bx - ax) * t, ay + (by - ay) * t]; }
  return null;
}
const nmTmp = [];
function nearestMetal(x, y, maxd, px, py) {
  const list = querySegs(L, x - maxd, y - maxd, x + maxd, y + maxd, nmTmp);
  let best = null, bs = 1e9;
  for (const s of list) {
    if (!s.metal) continue;
    const t = clamp((x - s.ax) * s.dx + (y - s.ay) * s.dy, 0, s.len), qx = s.ax + s.dx * t, qy = s.ay + s.dy * t;
    const d = Math.hypot(x - qx, y - qy); if (d > maxd) continue;
    if ((x - s.ax) * s.nx + (y - s.ay) * s.ny < -2) continue;
    let nx = s.nx, ny = s.ny; if (d > 0.5) { nx = (x - qx) / d; ny = (y - qy) / d; }
    const score = d - (px !== undefined ? (nx * px + ny * py) * 2 : 0);
    if (score < bs) { bs = score; best = { x: qx, y: qy, d, nx, ny, s }; }
  }
  return best;
}

// ---------------------------------------------------------------- pre-rendered art helpers (paths)
function buildArt(Lv) {
  const { W, H, g } = Lv;
  const solid = new Path2D(), glass = new Path2D();
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const c = g[y * W + x];
      if (c === '#' || c === '=') { let e = x; while (e + 1 < W && g[y * W + e + 1] === c) e++; (c === '#' ? solid : glass).rect(x * T, y * T, (e - x + 1) * T, T); x = e + 1; continue; }
      if (HYP[c]) {
        const X = x * T, Y = y * T, pts = { '1': [[0, 0], [0, 1], [1, 1]], '2': [[1, 0], [1, 1], [0, 1]], '3': [[0, 0], [1, 0], [0, 1]], '4': [[0, 0], [1, 0], [1, 1]] }[c];
        solid.moveTo(X + pts[0][0] * T, Y + pts[0][1] * T); solid.lineTo(X + pts[1][0] * T, Y + pts[1][1] * T); solid.lineTo(X + pts[2][0] * T, Y + pts[2][1] * T); solid.closePath();
      }
      x++;
    }
  }
  const metalE = new Path2D(), glassE = new Path2D(), bevel = new Path2D(), rivets = [];
  for (const s of Lv.segs) {
    const P2 = s.metal ? metalE : glassE; P2.moveTo(s.ax, s.ay); P2.lineTo(s.bx, s.by);
    if (s.metal && s.len > 30) {
      const ix = -s.nx * 7, iy = -s.ny * 7;
      bevel.moveTo(s.ax + ix + s.dx * 7, s.ay + iy + s.dy * 7); bevel.lineTo(s.bx + ix - s.dx * 7, s.by + iy - s.dy * 7);
      for (let d = 30; d < s.len - 20; d += 80) rivets.push(s.ax + s.dx * d - s.nx * 13, s.ay + s.dy * d - s.ny * 13);
    }
  }
  Lv.art = { solid, glass, metalE, glassE, bevel, rivets };
}

// ---------------------------------------------------------------- state
let L = null, P = null, run = null, state = 'menu', curIdx = 0, wt = 0, menuIdx = 0;
let ghost = null;            // { pts: [x, y, …] at 20 Hz } of the best run
// online race: RACE = this race (both couriers fly the same level; the rival is an interpolated ghost), ON = the room / channel
const RACE = { on: false, phase: 'off', rid: 0, startAt: 0, goAt: 0, endClock: 0, myT: null, oppT: null, oppOut: null, gaveUp: false, myP: 0, oppP: 0,
  df: null, dStart: 1, buf: [], rtr: [], rv: null, sendT: 0, uiT: 0, req: false, oppReq: null, lastNum: 0, resSig: '', oppName: '', leftName: '' };
const ON = { ch: null, code: '', ready: false, me: '', role: null, jt: 0, partner: null, hb: null, sel: 0, off: null };
const cam = { x: 0, y: 0, z: 1, shake: 0, sx: 0, sy: 0, pathT: 0 };
const parts = [], streaks = [];
let hitStop = 0, flash = 0, slowmo = 1;
let touchMode = matchMedia('(pointer: coarse)').matches;

function newPlayer() {
  const f = L.def.fuel || 100;
  return { x: L.start.x, y: L.start.y, vx: 0, vy: 0, fuel: f, fuelMax: f, integ: 100, stuck: null, charge: 0, magCool: 0, inv: 0,
    hook: null, ang: -Math.PI / 2, thrX: 0, thrY: 0, thrOn: 0, trail: [], hitT: 0, wasMag: false, wasHook: false, flawless: true, bonkT: 0, reelT: 0, running: false };
}

// ---------------------------------------------------------------- input
const keys = new Set();
const mouse = { x: 0, y: 0, l: false, r: false, seen: false };
const joy = { id: null, x: 0, y: 0, active: false };
const btn = { mag: false, in: false, out: false };
const thook = { id: null, x: 0, y: 0, active: false };
const SCR = { tx: 0, ty: 0, hook: false, reelIn: false, reelOut: false, mag: false, aimX: null, aimY: null };
const I = { tx: 0, ty: 0, hook: false, reelIn: false, reelOut: false, mag: false, aimX: 0, aimY: 0, wheel: 0 };
const screenToWorld = (sx, sy) => [cam.x + (sx - VW / 2) / cam.z, cam.y + (sy - VH / 2) / cam.z];

function readInput() {
  const k = (c) => keys.has(c);
  let tx = 0, ty = 0;
  if (k('KeyA') || k('ArrowLeft')) tx -= 1; if (k('KeyD') || k('ArrowRight')) tx += 1;
  if (k('KeyW') || k('ArrowUp')) ty -= 1; if (k('KeyS') || k('ArrowDown')) ty += 1;
  const kl = Math.hypot(tx, ty); if (kl > 1) { tx /= kl; ty /= kl; }
  if (joy.active) { tx = joy.x; ty = joy.y; }
  I.tx = clamp(tx + SCR.tx, -1, 1); I.ty = clamp(ty + SCR.ty, -1, 1);
  I.hook = mouse.l || thook.active || SCR.hook;
  I.reelIn = k('ShiftLeft') || k('ShiftRight') || mouse.r || btn.in || SCR.reelIn;
  I.reelOut = k('ControlLeft') || k('ControlRight') || btn.out || SCR.reelOut;
  I.mag = k('Space') || btn.mag || SCR.mag;
  if (SCR.aimX !== null) { I.aimX = SCR.aimX; I.aimY = SCR.aimY; }
  else if (thook.active || (touchMode && thook.x)) { const w = screenToWorld(thook.x, thook.y); I.aimX = w[0]; I.aimY = w[1]; }
  else if (mouse.seen) { const w = screenToWorld(mouse.x, mouse.y); I.aimX = w[0]; I.aimY = w[1]; }
  else { I.aimX = P.x + Math.cos(P.ang) * 100; I.aimY = P.y + Math.sin(P.ang) * 100; }
}

// ---------------------------------------------------------------- particles & effects
function addP(o) { if (parts.length > 900) parts.shift(); o.life = o.max = o.life || 0.5; parts.push(o); return o; }
function sparks(x, y, nx, ny, n, color, sp = 260) {
  for (let i = 0; i < n; i++) { const a = Math.atan2(ny, nx) + rnd(-1.2, 1.2), s = rnd(0.3, 1) * sp; addP({ t: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.2, 0.5), c: color, w: rnd(1, 2.2) }); }
}
function burst(x, y, n, color, sp = 200, size = 3) {
  for (let i = 0; i < n; i++) { const a = rnd(0, TAU), s = rnd(0.2, 1) * sp; addP({ t: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.8), c: color, r: rnd(1, size), drag: 2 }); }
}
function ring(x, y, color, r1 = 40, life = 0.45, w = 3) { addP({ t: 'ring', x, y, vx: 0, vy: 0, r0: 4, r1, life, c: color, w }); }
function popup(x, y, txt, color) { addP({ t: 'text', x, y, vx: 0, vy: -40, life: 1, c: color, txt }); }
function shake(a) { cam.shake = Math.max(cam.shake, a); }

// ---------------------------------------------------------------- level flow
const newRun = () => ({ started: false, t: 0, done: false, rec: [], recT: 0, impact: 0, end: 0, endT: 0, result: null, idle: 0, beep: 0, fuelTick: 0, trailT: 0 });
function startLevel(i, race) {
  RACE.on = !!race;
  curIdx = clamp(i, 0, LEVELS.length - 1);
  L = compileLevel(curIdx);
  P = newPlayer();
  run = newRun();
  ghost = null;
  if (!race) {                     // (no best-run ghost in a race: the rival is the ghost)
    const gd = lsGet(K_GHOST(curIdx), null);
    if (gd && Array.isArray(gd.p) && gd.p.length > 4) ghost = { pts: gd.p, t: gd.t };
  }
  parts.length = 0; streaks.length = 0;
  wt = 0; updateWorld(0, true);
  cam.x = P.x; cam.y = P.y; cam.z = baseZoom();
  state = 'play'; Music.drums = true; slowmo = 1; hitStop = 0; flash = 0;
  clearInputs();
  showScreen(null);
  if (race) intro.hidden = true; else showIntro();
  updateHudStatic();
}
function restartLevel() { if (RACE.on) raceRespawn(); else startLevel(curIdx); }
function clearInputs() { keys.clear(); mouse.l = mouse.r = false; btn.mag = btn.in = btn.out = false; thook.active = false; thook.id = null; joy.active = false; joy.id = null; joy.x = joy.y = 0; resetKnob(); }

function deliver() {
  if (run.done) return;
  run.done = true; run.result = 'win'; run.endT = run.t; run.end = 1.25; state = 'won';
  const t = run.t, i = curIdx, m = L.medals;
  const medal = t <= m[0] ? 3 : t <= m[1] ? 2 : t <= m[2] ? 1 : 0;
  const prevBest = SAVE.best[i], isBest = !(prevBest <= t);
  run.medal = medal; run.isBest = isBest; run.prevBest = prevBest;
  if (isBest) { SAVE.best[i] = +t.toFixed(3); if (run.rec.length > 4) lsSet(K_GHOST(i), { t: +t.toFixed(3), p: run.rec }); }
  SAVE.medal[i] = Math.max(SAVE.medal[i] || 0, medal);
  if (P.flawless) SAVE.flaw[i] = true;
  SAVE.unlocked = Math.max(SAVE.unlocked || 1, Math.min(LEVELS.length, i + 2));
  saveGame();
  P.hook = null;
  ring(L.term.x, L.term.y, '#39ff88', 140, 0.8, 5); ring(L.term.x, L.term.y, '#b8ffd6', 80, 0.6, 2); burst(L.term.x, L.term.y, 60, '#39ff88', 380, 4);
  AU.sfx('deliver'); if (medal) setTimeout(() => AU.sfx('medal'), 450); shake(4);
  if (RACE.on) raceDelivered();
}
function fail(reason) {
  if (run.done) return;
  run.done = true; run.result = reason; run.endT = run.t; run.end = 1.1; state = 'lost';
  if (P.hook) P.hook.state = 'ret';
  burst(P.x, P.y, 70, cargoColor(), 420, 5); burst(P.x, P.y, 30, '#ffffff', 260, 3); ring(P.x, P.y, '#ff4d6d', 120, 0.7, 4);
  AU.sfx('fail'); shake(10); flash = 1;
}
function cargoColor() { return L.def.hot ? '#ff4d6d' : L.def.fragile ? '#8fe9ff' : '#ffb703'; }

// ---------------------------------------------------------------- world update (moving hazards)
function updateWorld(dt, init) {
  if (!L) return;
  for (const l of L.lasers) if (l.cycle) {
    const per = l.cycle[0] + l.cycle[1], ph = ((wt + l.phase) % per + per) % per;
    l.on = ph < l.cycle[0]; l.warn = !l.on && per - ph < 0.55;
  }
  for (const f of L.fanDefs) {
    if (f.cycle) { const per = f.cycle[0] + f.cycle[1], ph = ((wt + f.phase) % per + per) % per; f.on = ph < f.cycle[0]; }
    f.rpm = approach(f.rpm, f.on ? 1 : 0.08, dt * 2.5); f.spin += f.rpm * dt * 14;
  }
  for (const s of L.spins) s.ang += s.speed * dt;
  for (const d of L.drones) {
    const w = TAU / d.period, a = w * (wt + d.phase), s = 0.5 - 0.5 * Math.cos(a), ds = 0.5 * Math.sin(a) * w;
    d.x = lerp(d.x1, d.x2, s); d.y = lerp(d.y1, d.y2, s); d.vx = (d.x2 - d.x1) * ds; d.vy = (d.y2 - d.y1) * ds; d.spin += dt * 16;
  }
  for (const r of L.rots) {
    r.ang += r.speed * dt; r.beams.length = 0;
    for (let k = 0; k < r.arms; k++) {
      const a = r.ang + k * TAU / r.arms, dx = Math.cos(a), dy = Math.sin(a), x0 = r.x + dx * 18, y0 = r.y + dy * 18;
      const h = rayStatic(L, x0, y0, r.x + dx * r.len, r.y + dy * r.len);
      r.beams.push({ x0, y0, x1: h ? h.x : r.x + dx * r.len, y1: h ? h.y : r.y + dy * r.len, rot: true });
    }
  }
  if (L.doors.length) {
    const per = L.def.doorPeriod || 3.4, ph = (wt % per) / per;
    for (const d of L.doors) {
      const want = d.grp === 'A' ? ph < 0.5 : ph >= 0.5;
      const left = (d.grp === 'A' ? 0.5 - ph : 1 - ph) * per;
      if (init) d.open = want ? 1 : 0;
      const was = d.solid;
      d.open = approach(d.open, want ? 1 : 0, dt / 0.32);
      d.solid = d.open < 0.55; d.warn = want && left < 0.8;
      if (!init && was !== d.solid && P) {
        const dd = Math.hypot(P.x - (d.x + d.w / 2), P.y - (d.y + d.h / 2));
        if (dd < 700) AU.sfx('door', clamp(1 - dd / 700, 0.2, 1));
      }
    }
  }
}

// ---------------------------------------------------------------- physics
function step(dt) {
  if (RACE.on && RACE.phase === 'count') return;   // frozen on the start line during the 3-2-1
  wt += dt;
  updateWorld(dt);
  if (state === 'won' || state === 'lost') { if (P.hook) updateHook(dt); return; }
  if (state !== 'play') return;
  readInput();
  const p = P, h0 = p.hook;
  if (!run.started && (Math.hypot(I.tx, I.ty) > 0.1 || I.hook || I.mag || Math.hypot(p.x - L.start.x, p.y - L.start.y) > 4)) { run.started = true; AU.sfx('start'); hideIntro(); }
  if (run.started) run.t += dt;
  p.inv = Math.max(0, p.inv - dt); p.hitT = Math.max(0, p.hitT - dt); p.bonkT = Math.max(0, p.bonkT - dt);
  // aim
  let ax = I.aimX - p.x, ay = I.aimY - p.y, al = Math.hypot(ax, ay);
  if (al < 1) { ax = Math.cos(p.ang); ay = Math.sin(p.ang); al = 1; }
  ax /= al; ay /= al;
  // grapple
  if (I.hook && !p.wasHook) fireHook(ax, ay);
  if (!I.hook && p.wasHook) releaseHook();
  p.wasHook = I.hook;
  // magnetic boots: hold to stick, let go to kick
  p.magCool = Math.max(0, p.magCool - dt);
  if (!I.mag && p.wasMag && p.stuck) kick(ax, ay);
  if (!I.mag) p.stuck = null;
  p.wasMag = I.mag;
  // forces
  let fx = 0, fy = 0; p.thrOn = 0; p.running = false;
  const tl = Math.hypot(I.tx, I.ty);
  if (p.stuck) {
    const n = p.stuck, tx = -n.ny, ty = n.nx, it = I.tx * tx + I.ty * ty;
    let vt = p.vx * tx + p.vy * ty;
    if (Math.abs(it) > 0.2) {
      const target = Math.sign(it) * RUN_SPEED * Math.min(1, Math.abs(it) * 1.3);
      if (Math.sign(vt) !== Math.sign(target) || Math.abs(vt) < Math.abs(target)) vt = approach(vt, target, RUN_ACC * dt);
      p.running = true;
    }
    p.vx = tx * vt; p.vy = ty * vt;
    p.charge *= Math.exp(-dt / 0.9);
  } else if (tl > 0.08 && p.fuel > 0) {
    const s = Math.min(1, tl); fx += I.tx / tl * THRUST * s; fy += I.ty / tl * THRUST * s;
    p.fuel = Math.max(0, p.fuel - FUEL_USE * s * dt); p.thrOn = s; p.thrX = I.tx / tl; p.thrY = I.ty / tl;
  }
  if (I.mag && !p.stuck && p.magCool <= 0) {
    const nm = nearestMetal(p.x, p.y, R + MAG_RANGE);
    if (nm) { if (nm.d <= R + 2.5) stickTo(nm.nx, nm.ny, 0); else { fx -= nm.nx * MAG_PULL; fy -= nm.ny * MAG_PULL; } }
  }
  let windF = 0;
  for (const c of L.fanCols) {
    if (!c.fan.on || p.x < c.x0 - 4 || p.x > c.x1 + 4 || p.y < c.y0 - 4 || p.y > c.y1 + 4) continue;
    const s = c.dx ? Math.abs(p.x - c.bx) : Math.abs(p.y - c.by), f = c.fan.power * (0.45 + 0.55 * clamp(1 - s / c.len, 0, 1));
    if (!p.stuck) { fx += c.dx * f; fy += c.dy * f; }
    windF = Math.max(windF, f);
  }
  run.wind = windF;
  p.vx += fx * dt; p.vy += fy * dt;
  const dr = Math.exp(-DRAG * dt); p.vx *= dr; p.vy *= dr;
  let sp = Math.hypot(p.vx, p.vy); if (sp > VMAX) { p.vx *= VMAX / sp; p.vy *= VMAX / sp; sp = VMAX; }
  // reel
  const h = p.hook;
  if (h && h.state === 'att') {
    const before = h.len;
    if (I.reelIn) h.len = Math.max(h.fixed + ROPE_MIN, h.len - REEL_IN * dt);
    if (I.reelOut) h.len = Math.min(ROPE_MAX, h.len + REEL_OUT * dt);
    if (I.wheel) { h.len = clamp(h.len + I.wheel, h.fixed + ROPE_MIN, ROPE_MAX); I.wheel = 0; }
    if (Math.abs(h.len - before) > 0.1 && (p.reelT -= dt) <= 0) { p.reelT = 0.05; AU.sfx('reel', clamp(1 - h.len / ROPE_MAX, 0, 1)); }
  } else I.wheel = 0;
  // integrate (sub-stepped so fast flights never tunnel)
  const n = Math.min(12, Math.max(1, Math.ceil(sp * dt / 5))), sdt = dt / n;
  run.impact = 0;
  for (let i = 0; i < n; i++) {
    const ox = p.x, oy = p.y;
    p.x += p.vx * sdt; p.y += p.vy * sdt;
    if (p.hook && p.hook.state === 'att') rope(ox, oy);
    collide();
    if (p.stuck) stickUpdate();
  }
  if (!isFinite(p.x) || !isFinite(p.y)) { p.x = L.start.x; p.y = L.start.y; p.vx = p.vy = 0; }
  if (L.solidAt(p.x, p.y)) unstuck();
  if (run.impact > 0) impact(run.impact);
  updateHook(dt);
  hazards();
  doorsVsPlayer();
  // pickups
  for (const f of L.fuels) {
    if (Math.hypot(p.x - f.x, p.y - f.y) < T * 1.15 && p.fuel < p.fuelMax - 0.01) {
      p.fuel = Math.min(p.fuelMax, p.fuel + 160 * dt); f.glow = 1;
      if ((run.fuelTick -= dt) <= 0) { run.fuelTick = 0.07; AU.sfx('fuel', p.fuel / p.fuelMax); addP({ t: 'dot', x: f.px, y: f.py, vx: (p.x - f.px) * 3, vy: (p.y - f.py) * 3, life: 0.3, c: '#7dff7a', r: 2.5 }); }
    }
    f.glow = Math.max(0, f.glow - dt * 2);
  }
  if (Math.hypot(p.x - L.term.x, p.y - L.term.y) < 30 + R) deliver();
  if (L.def.hot && run.started && !run.done) {
    const left = L.limit - run.t;
    if (left <= 10 && left > 0 && (run.beep -= dt) <= 0) { run.beep = left < 4 ? 0.5 : 1; AU.sfx('beep'); }
    if (left <= 0) fail('late');
  }
  // stuck with no fuel? (hint)
  const nearWall = nearestMetal(p.x, p.y, HOOK_RANGE * 0.9);
  if (p.fuel <= 0.01 && sp < 25 && !p.stuck && !(p.hook && p.hook.state === 'att') && !nearWall) run.idle += dt; else run.idle = 0;
  // ghost recording (20 Hz)
  if (run.started && !run.done) {
    run.recT -= dt;
    if (run.recT <= 0) { run.recT += 0.05; if (run.rec.length < 24000) run.rec.push(Math.round(p.x), Math.round(p.y)); }
  }
  if (h0 !== p.hook) {} // (hook object swaps are fine)
}

function unstuck() {   // safety: pushed inside a wall somehow → nudge to the nearest open spot
  const p = P;
  for (let r = 4; r < 120; r += 4) for (let k = 0; k < 16; k++) {
    const a = k * TAU / 16, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
    if (!L.solidAt(x, y) && !L.solidAt(x + R * 0.7, y) && !L.solidAt(x - R * 0.7, y) && !L.solidAt(x, y + R * 0.7) && !L.solidAt(x, y - R * 0.7)) { p.x = x; p.y = y; p.vx *= 0.5; p.vy *= 0.5; return; }
  }
}

const colTmp = [];
function collide() {
  const p = P;
  for (let it = 0; it < 3; it++) {
    let moved = false;
    const list = querySegs(L, p.x - R - 2, p.y - R - 2, p.x + R + 2, p.y + R + 2, colTmp);
    const nStatic = list.length;
    for (const d of L.doors) if (d.solid && p.x > d.x - R - 4 && p.x < d.x + d.w + R + 4 && p.y > d.y - R - 4 && p.y < d.y + d.h + R + 4) for (const s of d.segs) list.push(s);
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const t = clamp((p.x - s.ax) * s.dx + (p.y - s.ay) * s.dy, 0, s.len), qx = s.ax + s.dx * t, qy = s.ay + s.dy * t;
      const dx = p.x - qx, dy = p.y - qy, d2 = dx * dx + dy * dy;
      if (d2 >= R * R) continue;
      const side = (p.x - s.ax) * s.nx + (p.y - s.ay) * s.ny;
      if (side < -R * 0.9) continue;
      let nx, ny, depth; const d = Math.sqrt(d2);
      if (side > 0.05 && d > 1e-4) { nx = dx / d; ny = dy / d; depth = R - d; } else { nx = s.nx; ny = s.ny; depth = R - side; }
      p.x += nx * depth; p.y += ny * depth; moved = true;
      const vn = p.vx * nx + p.vy * ny;
      if (vn < 0) contact(s, nx, ny, vn);
    }
    list.length = nStatic;
    if (!moved) break;
  }
}
function contact(s, nx, ny, vn) {
  const p = P, hit = -vn;
  if (hit > run.impact) { run.impact = hit; run.impX = p.x - nx * R; run.impY = p.y - ny * R; run.impNx = nx; run.impNy = ny; run.impMetal = s.metal; }
  const stick = I.mag && s.metal && p.magCool <= 0;
  let e = s.glass ? 0.55 : hit > 280 ? 0.3 : 0.1;
  if (stick) e = 0;
  p.vx -= (1 + e) * vn * nx; p.vy -= (1 + e) * vn * ny;
  if (stick) { if (!p.stuck) stickTo(nx, ny, hit); else { p.stuck.nx = nx; p.stuck.ny = ny; p.charge = Math.max(p.charge, hit); } }
}
function stickTo(nx, ny, hit) {
  const p = P; p.stuck = { nx, ny }; p.charge = Math.max(p.charge, hit);
  AU.sfx('clamp'); ring(p.x - nx * R, p.y - ny * R, '#ff3df0', 22, 0.3, 2);
}
function stickUpdate() {
  const p = P, n = p.stuck;
  const nm = nearestMetal(p.x, p.y, R + 7, n.nx, n.ny);
  if (!nm) { p.stuck = null; return; }
  p.x = nm.x + nm.nx * R; p.y = nm.y + nm.ny * R;
  const tx = -nm.ny, ty = nm.nx; let vt = p.vx * tx + p.vy * ty; const vn = p.vx * nm.nx + p.vy * nm.ny;
  if (vn > 0) vt = (vt >= 0 ? 1 : -1) * Math.hypot(vt, vn);
  p.vx = tx * vt; p.vy = ty * vt; n.nx = nm.nx; n.ny = nm.ny;
}
function impact(sp) {
  const p = P, fr = L.def.fragile;
  let th = fr ? 240 : 380;
  if (I.mag && run.impMetal) th += fr ? 140 : 170;
  if (sp > th && p.inv <= 0) { damage((sp - th) * (fr ? 0.2 : 0.11), run.impX, run.impY); p.inv = 0.22; }
  if (sp > 70 && p.bonkT <= 0) {
    p.bonkT = 0.08;
    sparks(run.impX, run.impY, run.impNx, run.impNy, Math.min(26, 3 + sp / 25), sp > th ? '#ffb15c' : '#9ff4ff', 120 + sp * 0.4);
    AU.sfx('bonk', clamp(sp / 600, 0, 1)); shake(clamp(sp / 150, 0, 7));
  }
}
function damage(d, x, y) {
  const p = P; if (d <= 0 || run.done) return;
  d = Math.min(d, 100);
  p.integ = Math.max(0, p.integ - d); p.flawless = false; p.hitT = 0.5; flash = Math.max(flash, 0.35 + d / 80);
  popup(x, y - 10, '-' + Math.ceil(d) + '%', '#ff6b81');
  burst(x, y, 8 + d / 3, cargoColor(), 180, 3);
  AU.sfx('crash'); shake(4 + d / 6); hitStop = Math.max(hitStop, 0.05);
  if (p.integ <= 0) fail('broken');
}
function hit(kind, nx, ny, kvx, kvy) {
  const p = P; if (p.inv > 0 || run.done) return;
  const base = kind === 'laser' ? 28 : 22;
  damage(base * (L.def.fragile ? 1.5 : 1), p.x, p.y);
  p.inv = 0.75;
  if (kind === 'laser') { AU.sfx('zap'); sparks(p.x, p.y, nx, ny, 14, '#ff4060', 300); p.vx += nx * 140; p.vy += ny * 140; }
  else {
    AU.sfx('clang'); sparks(p.x, p.y, nx, ny, 18, '#ffb15c', 340);
    p.vx = nx * 380 + (kvx || 0) * 0.85; p.vy = ny * 380 + (kvy || 0) * 0.85; p.stuck = null;
  }
}
function kick(ax, ay) {
  const p = P, n = p.stuck;
  let dx = ax, dy = ay;
  if (SCR.aimX === null && touchMode && !mouse.seen) {
    const jl = Math.hypot(joy.x, joy.y);
    if (joy.active && jl > 0.3) { dx = joy.x / jl; dy = joy.y / jl; }
    else { const tx = -n.ny, ty = n.nx, vt = p.vx * tx + p.vy * ty, s = Math.abs(vt) > 30 ? Math.sign(vt) * 0.9 : 0; dx = n.nx + tx * s; dy = n.ny + ty * s; const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
  }
  const dn = dx * n.nx + dy * n.ny;
  if (dn < 0.25) { dx += n.nx * (0.25 - dn); dy += n.ny * (0.25 - dn); const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; }
  const v = Math.hypot(p.vx, p.vy), s = clamp(Math.max(KICK_MIN, Math.hypot(v, p.charge * 0.85) + KICK_BONUS), 0, KICK_MAX);
  p.vx = dx * s; p.vy = dy * s;
  p.x += n.nx * 1.5; p.y += n.ny * 1.5;
  p.stuck = null; p.charge = 0; p.magCool = 0.2;
  const fx = p.x - n.nx * R, fy = p.y - n.ny * R;
  ring(fx, fy, '#ff3df0', 34, 0.35, 3); sparks(fx, fy, n.nx, n.ny, 10, '#ff8af5', 220);
  AU.sfx('kick'); shake(2);
}

// ---------------------------------------------------------------- grappling hook + rope
function pickNode(px, py, dx, dy, maxAng, aimPt) {
  let best = null, bestA = maxAng;
  for (const a of L.anchors) {
    const vx = a.x - px, vy = a.y - py, d = Math.hypot(vx, vy); if (d > HOOK_RANGE || d < 16) continue;
    let ang = Math.acos(clamp((vx * dx + vy * dy) / d, -1, 1));
    if (aimPt && Math.hypot(a.x - aimPt[0], a.y - aimPt[1]) < 70) ang = Math.min(ang, 0.05);
    if (ang < bestA && !blocked(px, py, a.x, a.y)) { bestA = ang; best = a; }
  }
  return best;
}
function fireHook(ax, ay) {
  const p = P; if (p.hook && p.hook.state === 'att') return;
  const node = pickNode(p.x, p.y, ax, ay, touchMode ? 0.42 : 0.22, thook.active ? [I.aimX, I.aimY] : null);
  let dx = ax, dy = ay;
  if (node) { dx = node.x - p.x; dy = node.y - p.y; const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
  p.hook = { state: 'fly', x: p.x, y: p.y, dx, dy, node, ax: 0, ay: 0, pivots: [], len: 0, fixed: 0, taut: false, prevFree: 0, t: 0 };
  AU.sfx('hook');
}
function releaseHook() {
  const h = P.hook; if (!h) return;
  if (h.state === 'att') { h.x = h.pivots.length ? h.pivots[h.pivots.length - 1].x : h.ax; h.y = h.pivots.length ? h.pivots[h.pivots.length - 1].y : h.ay; }
  if (h.state !== 'ret') h.state = 'ret';
}
function attach(x, y, node) {
  const h = P.hook, p = P;
  h.state = 'att'; h.ax = x; h.ay = y; h.node = node; h.pivots = []; h.fixed = 0;
  h.len = Math.max(ROPE_MIN, Math.hypot(p.x - x, p.y - y)); h.prevFree = h.len; h.t = 0;
  AU.sfx('attach'); sparks(x, y, p.x - x, p.y - y, 8, node ? '#ffe14d' : '#9ff4ff', 160); ring(x, y, node ? '#ffe14d' : '#7df9ff', 26, 0.3, 2);
}
const lastPiv = (h) => h.pivots.length ? h.pivots[h.pivots.length - 1] : { x: h.ax, y: h.ay };
function updateHook(dt) {
  const h = P.hook; if (!h) return;
  h.t += dt;
  if (h.state === 'fly') {
    const st = HOOK_SPEED * dt, nx = h.x + h.dx * st, ny = h.y + h.dy * st;
    let tN = 2, nodeHit = null;
    for (const a of L.anchors) {
      const [d] = distSeg(a.x, a.y, h.x, h.y, nx, ny);
      if (d < 16) { const t = ((a.x - h.x) * h.dx + (a.y - h.y) * h.dy) / st; if (t < tN) { tN = t; nodeHit = a; } }
    }
    const w = raycast(h.x, h.y, nx, ny, true);
    if (w && w.t < tN) {
      if (w.s.metal) attach(w.x + w.s.nx * 1.5, w.y + w.s.ny * 1.5, null);
      else { h.state = 'ret'; h.x = w.x; h.y = w.y; AU.sfx('miss'); sparks(w.x, w.y, w.s.nx, w.s.ny, 6, '#d9b8ff', 150); }
    } else if (nodeHit) attach(nodeHit.x, nodeHit.y, nodeHit);
    else { h.x = nx; h.y = ny; if (Math.hypot(h.x - P.x, h.y - P.y) > HOOK_RANGE) h.state = 'ret'; }
  } else if (h.state === 'ret') {
    const dx = P.x - h.x, dy = P.y - h.y, d = Math.hypot(dx, dy), st = HOOK_SPEED * 1.15 * dt;
    if (d <= st + 4) P.hook = null; else { h.x += dx / d * st; h.y += dy / d * st; }
  }
}
function inTri(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = cross(bx - ax, by - ay, px - ax, py - ay), d2 = cross(cx - bx, cy - by, px - bx, py - by), d3 = cross(ax - cx, ay - cy, px - cx, py - cy);
  const neg = d1 < -0.01 || d2 < -0.01 || d3 < -0.01, pos = d1 > 0.01 || d2 > 0.01 || d3 > 0.01;
  return !(neg && pos);
}
function findCorner(A, ox, oy, cx, cy) {
  const minx = Math.min(A.x, ox, cx) - 3, maxx = Math.max(A.x, ox, cx) + 3, miny = Math.min(A.y, oy, cy) - 3, maxy = Math.max(A.y, oy, cy) + 3;
  qCorn.length = 0;
  const gx0 = clamp(Math.floor(minx / GS), 0, L.GW - 1), gx1 = clamp(Math.floor(maxx / GS), 0, L.GW - 1), gy0 = clamp(Math.floor(miny / GS), 0, L.GH - 1), gy1 = clamp(Math.floor(maxy / GS), 0, L.GH - 1);
  for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) for (const c of L.cornerGrid[gy * L.GW + gx]) qCorn.push(c);
  const vx = ox - A.x, vy = oy - A.y, pd2 = (cx - A.x) ** 2 + (cy - A.y) ** 2;
  const degen = Math.abs(cross(ox - A.x, oy - A.y, cx - A.x, cy - A.y)) < 2;
  let best = null, bestA = 1e9;
  for (const c of qCorn) {
    const dx = c.x - A.x, dy = c.y - A.y, dl = dx * dx + dy * dy;
    if (dl < 16 || dl > pd2 + 9) continue;
    const ok = degen ? distSeg(c.x, c.y, A.x, A.y, cx, cy)[0] < 3 : inTri(c.x, c.y, A.x, A.y, ox, oy, cx, cy);
    if (!ok) continue;
    const ang = Math.abs(Math.atan2(cross(vx, vy, dx, dy), vx * dx + vy * dy));
    if (ang < bestA) { bestA = ang; best = c; }
  }
  return best;
}
function rope(ox, oy) {
  const p = P, h = p.hook;
  for (let k = 0; k < 4; k++) {          // wrap round corners the rope now crosses
    const A = lastPiv(h);
    if (!blocked(A.x, A.y, p.x, p.y)) break;
    const c = findCorner(A, ox, oy, p.x, p.y); if (!c || h.pivots.length > 14) break;
    const side = Math.sign(cross(c.x - A.x, c.y - A.y, p.x - c.x, p.y - c.y)) || 1;
    h.pivots.push({ x: c.x + c.ox * 1.5, y: c.y + c.oy * 1.5, side });
  }
  while (h.pivots.length) {               // unwrap when the rope swings back past a pivot
    const B = h.pivots[h.pivots.length - 1], A = h.pivots.length > 1 ? h.pivots[h.pivots.length - 2] : { x: h.ax, y: h.ay };
    const cr = cross(B.x - A.x, B.y - A.y, p.x - B.x, p.y - B.y);
    if (cr * B.side < 0 && !blocked(A.x, A.y, p.x, p.y)) h.pivots.pop(); else break;
  }
  let fixed = 0, px = h.ax, py = h.ay;
  for (const q of h.pivots) { fixed += Math.hypot(q.x - px, q.y - py); px = q.x; py = q.y; }
  h.fixed = fixed;
  if (h.len < fixed + 16) h.len = fixed + 16;
  const dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy) || 1e-6;
  // the winch takes up slack automatically, so hooking a ring early still swings you at the closest pass
  if (!I.reelOut && d < h.len - fixed - 0.5) h.len = fixed + Math.max(d, ROPE_MIN);
  const free = h.len - fixed;
  h.taut = false;
  if (d > free) {
    const ux = dx / d, uy = dy / d;
    p.x = px + ux * free; p.y = py + uy * free;
    let vr = p.vx * ux + p.vy * uy;
    if (vr > 0) { p.vx -= vr * ux; p.vy -= vr * uy; vr = 0; }
    h.taut = true;
    if (h.prevFree > free + 0.01) {      // reeling in while swinging spins you faster (angular momentum)
      const f = Math.min(1.04, h.prevFree / free), tx = -uy, ty = ux, vt = p.vx * tx + p.vy * ty;
      p.vx += tx * vt * (f - 1); p.vy += ty * vt * (f - 1);
    }
    if (I.reelIn && vr > -REEL_IN && free > ROPE_MIN + 2) { p.vx -= (vr + REEL_IN) * ux * 0.5; p.vy -= (vr + REEL_IN) * uy * 0.5; }
    const v = Math.hypot(p.vx, p.vy); if (v > VMAX) { p.vx *= VMAX / v; p.vy *= VMAX / v; }
  }
  h.prevFree = free;
}
function ropePts(h) { const pts = [[h.ax, h.ay]]; for (const q of h.pivots) pts.push([q.x, q.y]); pts.push([P.x, P.y]); return pts; }
function cutRope(x, y) { const h = P.hook; if (!h) return; h.state = 'ret'; h.x = x; h.y = y; sparks(x, y, 0, -1, 12, '#ff7ad9', 220); AU.sfx('cut'); }

// ---------------------------------------------------------------- hazards
const beams = [];
function hazards() {
  const p = P;
  beams.length = 0;
  for (const l of L.lasers) if (l.on) beams.push(l);
  for (const r of L.rots) for (const b of r.beams) beams.push(b);
  const roped = p.hook && p.hook.state === 'att' ? ropePts(p.hook) : null;
  for (const b of beams) {
    const [d, qx, qy] = distSeg(p.x, p.y, b.x0, b.y0, b.x1, b.y1);
    if (d < R + 3) { let nx = p.x - qx, ny = p.y - qy; const l = Math.hypot(nx, ny) || 1; hit('laser', nx / l, ny / l); }
    if (roped && p.hook && p.hook.state === 'att') for (let i = 0; i < roped.length - 1; i++) {
      const x = segsCross(roped[i][0], roped[i][1], roped[i + 1][0], roped[i + 1][1], b.x0, b.y0, b.x1, b.y1);
      if (x) { cutRope(x[0], x[1]); break; }
    }
  }
  for (const s of L.spins) {
    const dh = Math.hypot(p.x - s.x, p.y - s.y);
    if (dh > s.len + R + 10) continue;
    if (dh < 16 + R) { const l = dh || 1; hit('spin', (p.x - s.x) / l, (p.y - s.y) / l, 0, 0); continue; }
    for (let k = 0; k < s.arms; k++) {
      const a = s.ang + k * TAU / s.arms, ex = s.x + Math.cos(a) * s.len, ey = s.y + Math.sin(a) * s.len;
      const [d, qx, qy] = distSeg(p.x, p.y, s.x, s.y, ex, ey);
      if (d < R + 8) {
        let nx = p.x - qx, ny = p.y - qy; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        const rx = qx - s.x, ry = qy - s.y; hit('spin', nx, ny, -ry * s.speed, rx * s.speed);
        if (P.inv > 0.7) { p.x = qx + nx * (R + 9); p.y = qy + ny * (R + 9); }
        break;
      }
    }
  }
  for (const d of L.drones) {
    const dd = Math.hypot(p.x - d.x, p.y - d.y);
    if (dd < R + 15) { const l = dd || 1; hit('drone', (p.x - d.x) / l, (p.y - d.y) / l, d.vx, d.vy); }
  }
  for (const r of L.rots) { const dd = Math.hypot(p.x - r.x, p.y - r.y); if (dd < R + 18) { const l = dd || 1; hit('spin', (p.x - r.x) / l, (p.y - r.y) / l, 0, 0); } }
}
function doorsVsPlayer() {
  const p = P;
  for (const d of L.doors) {
    if (!d.solid) continue;
    if (p.x > d.x - R * 0.5 && p.x < d.x + d.w + R * 0.5 && p.y > d.y - R * 0.5 && p.y < d.y + d.h + R * 0.5) {
      if (d.vert) { const left = p.x < d.x + d.w / 2; p.x = left ? d.x - R - 0.5 : d.x + d.w + R + 0.5; if (left ? p.vx > 0 : p.vx < 0) p.vx *= -0.3; }
      else { const up = p.y < d.y + d.h / 2; p.y = up ? d.y - R - 0.5 : d.y + d.h + R + 0.5; if (up ? p.vy > 0 : p.vy < 0) p.vy *= -0.3; }
      if (p.inv <= 0) { damage(10, p.x, p.y); p.inv = 0.6; }
    }
    if (p.hook && p.hook.state === 'att') {
      const pts = ropePts(p.hook);
      outer: for (let i = 0; i < pts.length - 1; i++) for (const s of d.segs) {
        const x = segsCross(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], s.ax, s.ay, s.bx, s.by);
        if (x) { cutRope(x[0], x[1]); break outer; }
      }
    }
  }
}

// ---------------------------------------------------------------- camera
function baseZoom() { return clamp(Math.sqrt(VW * VH) / 880, 0.5, 1.6); }
let camLock = null;
function updateCam(dt) {
  if (!L) return;
  if (camLock) { cam.x = camLock.x; cam.y = camLock.y; cam.z = camLock.z; cam.sx = cam.sy = 0; return; }
  let tx, ty, tz = baseZoom();
  if (state === 'play' || state === 'pause' || state === 'won' || state === 'lost' || state === 'result') {
    const p = P, sp = Math.hypot(p.vx, p.vy), lm = Math.min(260, Math.min(VW, VH) / tz * 0.28);
    let lx = p.vx * 0.32, ly = p.vy * 0.32; const ll = Math.hypot(lx, ly); if (ll > lm) { lx *= lm / ll; ly *= lm / ll; }
    tx = p.x + lx; ty = p.y + ly; tz /= 1 + sp / 2400;
    if (state === 'won' || (state === 'result' && run.result === 'win')) { tx = L.term.x; ty = L.term.y; tz *= 1.15; }
    if (state === 'pause') dt = 0;
  } else {                                // menus: drift along the level route
    const path = L.path; tz *= 0.8;
    if (path && path.length > 1) {
      cam.pathT += dt * 3.2; const n = path.length, f = ((cam.pathT % (n * 2 - 2)) + (n * 2 - 2)) % (n * 2 - 2), i = clamp(f < n - 1 ? f : 2 * n - 2 - f, 0, n - 1);
      const a = path[Math.floor(i)], b = path[Math.min(n - 1, Math.floor(i) + 1)], u = i - Math.floor(i);
      tx = lerp(a[0], b[0], u); ty = lerp(a[1], b[1], u);
    } else { tx = L.start.x; ty = L.start.y; }
  }
  const k = 1 - Math.exp(-5 * dt), kz = 1 - Math.exp(-2.5 * dt);
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (tz - cam.z) * kz;
  const hw = VW / 2 / cam.z, hh = VH / 2 / cam.z, LW = L.W * T, LH = L.H * T;
  cam.x = LW < hw * 2 ? LW / 2 : clamp(cam.x, hw, LW - hw);
  cam.y = LH < hh * 2 ? LH / 2 : clamp(cam.y, hh, LH - hh);
  cam.shake *= Math.exp(-9 * dt); if (cam.shake < 0.05) cam.shake = 0;
  cam.sx = (Math.random() * 2 - 1) * cam.shake; cam.sy = (Math.random() * 2 - 1) * cam.shake;
}

// ---------------------------------------------------------------- rendering
const cv = $('c'), ctx = cv.getContext('2d');
let VW = innerWidth, VH = innerHeight, DPR = 1, bgGrad = null, sunImg = null, hullPat = null, doorPat = null;
const stars = [];
for (let i = 0; i < 220; i++) stars.push({ x: Math.random() * 2400, y: Math.random() * 2400, z: Math.random() < 0.6 ? 0.08 : 0.18, s: rnd(0.6, 1.8), tw: rnd(0, TAU), c: Math.random() < 0.2 ? '#ffb3f0' : Math.random() < 0.3 ? '#9ff4ff' : '#ffffff' });
function resize() {
  VW = Math.max(1, innerWidth); VH = Math.max(1, innerHeight); DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR); cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  bgGrad = ctx.createLinearGradient(0, 0, 0, VH);
  bgGrad.addColorStop(0, '#07031a'); bgGrad.addColorStop(0.55, '#170733'); bgGrad.addColorStop(1, '#2c0a40');
  const r = Math.round(Math.min(VW, VH) * 0.42), c = document.createElement('canvas'); c.width = c.height = r * 2 + 4;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, r * 2);
  gr.addColorStop(0, '#ffe36e'); gr.addColorStop(0.45, '#ff7a59'); gr.addColorStop(0.8, '#ff2d95'); gr.addColorStop(1, '#a3168f');
  g.fillStyle = gr; g.beginPath(); g.arc(r + 2, r + 2, r, 0, TAU); g.fill();
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 9; i++) { const y = r * (1.0 + i * 0.12), hgt = 2 + i * 1.6; g.fillRect(0, y, c.width, hgt); }
  sunImg = c;
  if (!hullPat) {
    const p = document.createElement('canvas'); p.width = p.height = 80; const q = p.getContext('2d');
    const hg = q.createLinearGradient(0, 0, 80, 80); hg.addColorStop(0, '#191138'); hg.addColorStop(1, '#120c2a');
    q.fillStyle = hg; q.fillRect(0, 0, 80, 80);
    q.strokeStyle = 'rgba(150,110,255,0.07)'; q.lineWidth = 1;
    for (let i = -80; i < 160; i += 8) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i + 80, 80); q.stroke(); }
    q.fillStyle = 'rgba(8,4,22,0.55)'; q.fillRect(0, 0, 80, 2); q.fillRect(0, 0, 2, 80); q.fillRect(0, 40, 80, 1);
    q.fillStyle = 'rgba(95,243,255,0.10)'; q.fillRect(2, 2, 78, 1); q.fillRect(2, 2, 1, 78);
    q.fillStyle = 'rgba(95,243,255,0.25)'; q.fillRect(6, 6, 2, 2); q.fillRect(72, 6, 2, 2); q.fillRect(6, 72, 2, 2); q.fillRect(72, 72, 2, 2);
    hullPat = ctx.createPattern(p, 'repeat');
    const d = document.createElement('canvas'); d.width = d.height = 16; const e = d.getContext('2d');
    e.fillStyle = '#2b2003'; e.fillRect(0, 0, 16, 16); e.fillStyle = '#ffb703';
    e.beginPath(); e.moveTo(0, 0); e.lineTo(8, 0); e.lineTo(0, 8); e.closePath(); e.fill();
    e.beginPath(); e.moveTo(16, 0); e.lineTo(16, 8); e.lineTo(8, 16); e.lineTo(0, 16); e.closePath(); e.fill();
    doorPat = ctx.createPattern(d, 'repeat');
  }
}

function render(dt) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, VW, VH);
  if (!L) return;
  const z = cam.z, ox = VW / 2 - cam.x * z + cam.sx, oy = VH / 2 - cam.y * z + cam.sy;
  // far sun + stars
  ctx.globalAlpha = 0.5; ctx.drawImage(sunImg, VW * 0.7 - sunImg.width / 2 - cam.x * 0.02, VH * 0.58 - sunImg.height / 2 - cam.y * 0.02); ctx.globalAlpha = 1;
  for (const s of stars) {
    const x = ((s.x - cam.x * s.z) % VW + VW) % VW, y = ((s.y - cam.y * s.z) % VH + VH) % VH;
    ctx.globalAlpha = 0.45 + 0.4 * Math.sin(wt * 2 + s.tw); ctx.fillStyle = s.c; ctx.fillRect(x, y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  // parallax lattice of the megastructure
  const pz = 0.5, sp = 220 * z * pz, gx = ((-cam.x * z * pz) % sp + sp) % sp, gy = ((-cam.y * z * pz) % sp + sp) % sp;
  ctx.strokeStyle = 'rgba(255,61,240,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = gx; x < VW; x += sp) { ctx.moveTo(x, 0); ctx.lineTo(x, VH); }
  for (let y = gy; y < VH; y += sp) { ctx.moveTo(0, y); ctx.lineTo(VW, y); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,120,240,0.18)';
  for (let x = gx; x < VW; x += sp) for (let y = gy; y < VH; y += sp) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);

  ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * ox, DPR * oy);
  const vx0 = cam.x - VW / 2 / z - 60, vx1 = cam.x + VW / 2 / z + 60, vy0 = cam.y - VH / 2 / z - 60, vy1 = cam.y + VH / 2 / z + 60;
  const vis = (x, y, m = 0) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
  drawFans(vis, dt);
  drawSpinners(vis);
  drawWalls();
  drawDoors(vis);
  drawPads(vis);
  drawTerminal();
  drawAnchors(vis);
  drawSigns(vis);
  drawLasers(vis);
  drawDrones(vis);
  if (P && (state === 'play' || state === 'pause' || state === 'won' || state === 'lost' || state === 'result')) {
    drawGhost();
    drawRival();
    drawTrail();
    drawRope();
    if (!(state === 'lost' || (state === 'result' && run.result !== 'win'))) drawPlayer(dt);
    if (state === 'play') drawAim();
  }
  drawParticles(dt);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (P && state === 'play') { drawStreaks(dt); drawOffscreen(); }
  if (P && RACE.on && state !== 'menu') drawRivalUI();
  // vignette + damage flash
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, flash > 0.01 ? `rgba(255,30,70,${0.25 + flash * 0.4})` : 'rgba(2,0,12,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  flash = Math.max(0, flash - dt * 1.8);
}

function drawWalls() {
  const A = L.art;
  ctx.fillStyle = hullPat || '#0b0718'; ctx.fill(A.solid);
  ctx.fillStyle = 'rgba(165,110,255,0.13)'; ctx.fill(A.glass);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(60,210,255,0.16)'; ctx.lineWidth = 1.5; ctx.stroke(A.bevel);
  ctx.fillStyle = 'rgba(120,230,255,0.22)'; for (let i = 0; i < A.rivets.length; i += 2) ctx.fillRect(A.rivets[i] - 1.5, A.rivets[i + 1] - 1.5, 3, 3);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(25,210,255,0.10)'; ctx.lineWidth = 12; ctx.stroke(A.metalE);
  ctx.strokeStyle = 'rgba(25,210,255,0.26)'; ctx.lineWidth = 5; ctx.stroke(A.metalE);
  ctx.strokeStyle = '#b9f6ff'; ctx.lineWidth = 1.7; ctx.stroke(A.metalE);
  ctx.strokeStyle = 'rgba(190,120,255,0.14)'; ctx.lineWidth = 10; ctx.stroke(A.glassE);
  ctx.strokeStyle = 'rgba(214,170,255,0.75)'; ctx.lineWidth = 1.6; ctx.stroke(A.glassE);
  ctx.globalCompositeOperation = 'source-over';
}
function drawFans(vis, dt) {
  for (const f of L.fanDefs) {
    for (const c of f.cells) {
      if (!vis((c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, c.len)) continue;
      if (f.rpm > 0.1) {
        const gr = ctx.createLinearGradient(c.bx, c.by, c.bx + c.dx * c.len, c.by + c.dy * c.len);
        gr.addColorStop(0, `rgba(120,240,255,${0.13 * f.rpm})`); gr.addColorStop(1, 'rgba(120,240,255,0)');
        ctx.fillStyle = gr; ctx.fillRect(c.x0 + (c.dx ? 0 : 3), c.y0 + (c.dy ? 0 : 3), c.x1 - c.x0 - (c.dx ? 0 : 6), c.y1 - c.y0 - (c.dy ? 0 : 6));
      }
      if (f.on && Math.random() < 0.55 * (dt * 60) && parts.length < 850) {
        const along = Math.random() * c.len * 0.2, x = c.dx ? c.bx + c.dx * along : rnd(c.x0 + 4, c.x1 - 4), y = c.dy ? c.by + c.dy * along : rnd(c.y0 + 4, c.y1 - 4);
        const s = rnd(260, 520); addP({ t: 'wind', x, y, vx: c.dx * s, vy: c.dy * s, life: Math.min(1.4, c.len / s), c: '#bff6ff' });
      }
      // housing + blades
      ctx.save(); ctx.translate(c.bx, c.by);
      ctx.fillStyle = '#16122a'; ctx.strokeStyle = f.on ? '#5ff3ff' : '#3a5a70'; ctx.lineWidth = 2;
      const hw = T / 2 - 2; if (c.dx) { ctx.fillRect(-4 * c.dx - 4, -hw, 8, hw * 2); ctx.strokeRect(-4 * c.dx - 4, -hw, 8, hw * 2); } else { ctx.fillRect(-hw, -4 * c.dy - 4, hw * 2, 8); ctx.strokeRect(-hw, -4 * c.dy - 4, hw * 2, 8); }
      ctx.translate(c.dx * 6, c.dy * 6);
      ctx.strokeStyle = f.on ? 'rgba(170,250,255,0.85)' : 'rgba(120,160,190,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k < 3; k++) { const a = f.spin + k * TAU / 3, l = Math.cos(a) * (hw - 2); if (c.dx) { ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 4, l); } else { ctx.moveTo(0, 0); ctx.lineTo(l, Math.sin(a) * 4); } }
      ctx.stroke(); ctx.restore();
    }
  }
}
function drawDoors(vis) {
  for (const d of L.doors) {
    if (!vis(d.x + d.w / 2, d.y + d.h / 2, Math.max(d.w, d.h))) continue;
    const o = d.open, long = d.vert ? d.h : d.w, half = long / 2 * (1 - o);
    ctx.save();
    const rects = d.vert ? [[d.x, d.y, d.w, half], [d.x, d.y + d.h - half, d.w, half]] : [[d.x, d.y, half, d.h], [d.x + d.w - half, d.y, half, d.h]];
    for (const r of rects) { if (r[2] < 0.5 || r[3] < 0.5) continue; ctx.fillStyle = doorPat || '#ffb703'; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.strokeRect(r[0] + 1, r[1] + 1, r[2] - 2, r[3] - 2); }
    // frame marks + warning lights
    ctx.fillStyle = '#3d3320';
    if (d.vert) { ctx.fillRect(d.x - 4, d.y - 3, d.w + 8, 6); ctx.fillRect(d.x - 4, d.y + d.h - 3, d.w + 8, 6); } else { ctx.fillRect(d.x - 3, d.y - 4, 6, d.h + 8); ctx.fillRect(d.x + d.w - 3, d.y - 4, 6, d.h + 8); }
    const blink = d.warn ? (Math.sin(wt * 30) > 0) : false, lc = d.solid ? '#ff4d6d' : blink ? '#ff4d6d' : '#39ff88';
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lc;
    const lights = d.vert ? [[d.x + d.w / 2, d.y], [d.x + d.w / 2, d.y + d.h]] : [[d.x, d.y + d.h / 2], [d.x + d.w, d.y + d.h / 2]];
    for (const l of lights) { ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(l[0], l[1], 11, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(l[0], l[1], 3.5, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}
function drawPads(vis) {
  for (const f of L.fuels) {
    if (!vis(f.x, f.y)) continue;
    const [dx, dy] = f.dir, tx = -dy, ty = dx, hw = T * 0.42;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(f.px, f.py, f.px - dx * T * 1.1, f.py - dy * T * 1.1);
    gr.addColorStop(0, `rgba(125,255,122,${0.35 + f.glow * 0.4 + 0.1 * Math.sin(wt * 4)})`); gr.addColorStop(1, 'rgba(125,255,122,0)');
    ctx.fillStyle = gr; ctx.beginPath();
    ctx.moveTo(f.px + tx * hw, f.py + ty * hw); ctx.lineTo(f.px - tx * hw, f.py - ty * hw);
    ctx.lineTo(f.px - tx * hw * 0.6 - dx * T * 1.1, f.py - ty * hw * 0.6 - dy * T * 1.1); ctx.lineTo(f.px + tx * hw * 0.6 - dx * T * 1.1, f.py + ty * hw * 0.6 - dy * T * 1.1); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#7dff7a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(f.px + tx * hw - dx * 3, f.py + ty * hw - dy * 3); ctx.lineTo(f.px - tx * hw - dx * 3, f.py - ty * hw - dy * 3); ctx.stroke();
    ctx.fillStyle = '#0b2a10'; ctx.font = 'bold 9px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#c8ffc6'; ctx.fillText('⛽', f.x - dx * 6, f.y - dy * 6);
    ctx.restore();
  }
}
function drawTerminal() {
  const tm = L.term, pulse = 0.5 + 0.5 * Math.sin(wt * 3);
  ctx.save(); ctx.translate(tm.x, tm.y);
  ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, 70); gr.addColorStop(0, `rgba(57,255,136,${0.45 + pulse * 0.2})`); gr.addColorStop(1, 'rgba(57,255,136,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#39ff88'; ctx.lineWidth = 3;
  for (let k = 0; k < 6; k++) { const a = wt * 1.4 + k * TAU / 6; ctx.beginPath(); ctx.arc(0, 0, 30, a, a + 0.6); ctx.stroke(); }
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(184,255,214,0.8)';
  for (let k = 0; k < 4; k++) { const a = -wt * 2 + k * TAU / 4; ctx.beginPath(); ctx.arc(0, 0, 20, a, a + 0.9); ctx.stroke(); }
  ctx.fillStyle = '#b8ffd6'; ctx.beginPath(); ctx.arc(0, 0, 6 + pulse * 2, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#39ff88'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(t('nc_drop'), 0, -46 - pulse * 3);
  ctx.restore();
}
function drawAnchors(vis) {
  const tgt = run && state === 'play' ? aimPred.node : null;
  for (const a of L.anchors) {
    if (!vis(a.x, a.y)) continue;
    const hooked = P && P.hook && P.hook.state === 'att' && P.hook.node === a, pl = 0.5 + 0.5 * Math.sin(wt * 3 + a.pulse);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,225,77,${0.18 + pl * 0.15})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(a.x, a.y, 13 + pl * 3 + (a === tgt ? 4 : 0), 0, TAU); ctx.stroke();
    ctx.strokeStyle = hooked || a === tgt ? '#fff6b0' : '#ffe14d'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(a.x, a.y, 9, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function wrapText(txt, maxW) {
  const words = txt.split(' '), lines = []; let cur = '';
  for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }
  if (cur) lines.push(cur); return lines;
}
function signText(key) { const tk = key + '_t', v = touchMode ? t(tk) : ''; return v && v.toLowerCase() !== tk ? v : t(key); }   // touch variant when one exists
function drawSigns(vis) {
  const lang = getLang();
  for (const s of L.signs) {
    if (!vis(s.x, s.y, s.w)) continue;
    ctx.font = '600 13px system-ui, "Segoe UI", Tahoma, sans-serif';
    const ck = lang + touchMode + s.key;
    if (!s.cache || s.cache.k !== ck) s.cache = { k: ck, lines: wrapText(signText(s.key), s.w - 16) };
    const lines = s.cache.lines, lh = 17, hgt = lines.length * lh + 10;
    let mw = 0; for (const l of lines) mw = Math.max(mw, ctx.measureText(l).width); const w = mw + 20;
    const fl = 0.85 + 0.15 * Math.sin(wt * 7 + s.x);
    ctx.save(); ctx.globalAlpha = fl;
    ctx.fillStyle = 'rgba(6,20,40,0.62)'; ctx.strokeStyle = 'rgba(95,243,255,0.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(s.x - w / 2, s.y - hgt / 2, w, hgt, 6) : ctx.rect(s.x - w / 2, s.y - hgt / 2, w, hgt); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#bff8ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = lang === 'ar' ? 'rtl' : 'ltr';
    lines.forEach((l, i) => ctx.fillText(l, s.x, s.y - hgt / 2 + 5 + lh / 2 + i * lh));
    ctx.direction = 'ltr'; ctx.restore();
  }
}
function beamDraw(x0, y0, x1, y1, a) {
  ctx.strokeStyle = `rgba(255,40,80,${0.16 * a})`; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = `rgba(255,50,90,${0.5 * a})`; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.strokeStyle = `rgba(255,220,230,${0.95 * a})`; ctx.lineWidth = 1.6; ctx.stroke();
}
function drawLasers(vis) {
  ctx.save(); ctx.lineCap = 'round';
  for (const l of L.lasers) {
    if (!vis(l.x0, l.y0, 1000) && !vis(l.x1, l.y1)) continue;
    ctx.globalCompositeOperation = 'lighter';
    if (l.on) beamDraw(l.x0, l.y0, l.x1, l.y1, 0.85 + 0.15 * Math.sin(wt * 50 + l.x0));
    else if (l.warn && Math.sin(wt * 40) > 0) { ctx.strokeStyle = 'rgba(255,60,100,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(l.x0, l.y0); ctx.lineTo(l.x1, l.y1); ctx.stroke(); ctx.setLineDash([]); }
    ctx.globalCompositeOperation = 'source-over';
    // emitter + optional end cap
    const tx = -l.dy, ty = l.dx;
    ctx.fillStyle = '#2a1020'; ctx.strokeStyle = l.on ? '#ff4d6d' : '#7a3346'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(l.x0 + tx * 9, l.y0 + ty * 9); ctx.lineTo(l.x0 - tx * 9, l.y0 - ty * 9); ctx.lineTo(l.x0 - tx * 5 + l.dx * 7, l.y0 - ty * 5 + l.dy * 7); ctx.lineTo(l.x0 + tx * 5 + l.dx * 7, l.y0 + ty * 5 + l.dy * 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (l.capped) { ctx.fillStyle = l.on ? '#ff8fa5' : '#5a2a38'; ctx.beginPath(); ctx.arc(l.x1, l.y1, 3.5, 0, TAU); ctx.fill(); }
  }
  for (const r of L.rots) {
    if (!vis(r.x, r.y, r.len)) continue;
    ctx.globalCompositeOperation = 'lighter';
    for (const b of r.beams) beamDraw(b.x0, b.y0, b.x1, b.y1, 0.9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#1f0b1a'; ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(r.x, r.y, 18, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff2a55'; ctx.beginPath(); ctx.arc(r.x, r.y, 7 + Math.sin(wt * 8) * 1.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function drawSpinners(vis) {
  for (const s of L.spins) {
    if (!vis(s.x, s.y, s.len)) continue;
    ctx.save(); ctx.translate(s.x, s.y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,120,30,0.07)';
    for (let k = 0; k < s.arms; k++) { const a = s.ang + k * TAU / s.arms, d = -Math.sign(s.speed) * 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, s.len, Math.min(a, a + d), Math.max(a, a + d)); ctx.closePath(); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 0; k < s.arms; k++) {
      ctx.save(); ctx.rotate(s.ang + k * TAU / s.arms);
      ctx.fillStyle = '#2a1424'; ctx.fillRect(0, -8, s.len, 16);
      ctx.fillStyle = '#ff8c1a';
      for (let x = 14; x < s.len - 6; x += 16) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x + 7, -8); ctx.lineTo(x - 1, 8); ctx.lineTo(x - 8, 8); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = '#ffb15c'; ctx.lineWidth = 1.5; ctx.strokeRect(0, -8, s.len, 16);
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,140,40,0.5)'; ctx.beginPath(); ctx.arc(s.len, 0, 9, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#1b1426'; ctx.strokeStyle = '#ffb15c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffb15c'; for (let k = 0; k < 6; k++) { const a = s.ang * 0.5 + k * TAU / 6; ctx.fillRect(Math.cos(a) * 9 - 1.5, Math.sin(a) * 9 - 1.5, 3, 3); }
    ctx.restore();
  }
}
function drawDrones(vis) {
  for (const d of L.drones) {
    if (!vis(d.x, d.y)) continue;
    ctx.save(); ctx.translate(d.x, d.y);
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, 34); gr.addColorStop(0, 'rgba(255,61,240,0.4)'); gr.addColorStop(1, 'rgba(255,61,240,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(d.spin);
    ctx.fillStyle = '#d6c8ff';
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k * TAU / 10; ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.lineTo(Math.cos(a + 0.3) * 11, Math.sin(a + 0.3) * 11); } ctx.closePath(); ctx.fill();
    ctx.rotate(-d.spin);
    ctx.fillStyle = '#1a0c26'; ctx.strokeStyle = '#ff3df0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill(); ctx.stroke();
    const l = Math.hypot(d.vx, d.vy) || 1; ctx.fillStyle = '#ff2a55'; ctx.beginPath(); ctx.arc(d.vx / l * 4, d.vy / l * 4, 3.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawGhost() {
  if (!SET.ghost || !ghost || !run || !run.started) return;
  const pts = ghost.pts, n = pts.length / 2, f = (state === 'won' || state === 'lost' || state === 'result' ? run.endT : run.t) * 20, i = Math.min(n - 1, Math.floor(f)), u = Math.min(1, f - i);
  if (i >= n - 1 && f > n + 20) return;
  const j = Math.min(n - 1, i + 1), x = lerp(pts[i * 2], pts[j * 2], u), y = lerp(pts[i * 2 + 1], pts[j * 2 + 1], u);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,120,240,0.25)'; ctx.lineWidth = 3; ctx.beginPath();
  for (let k = Math.max(0, i - 12); k <= i; k++) { const px = pts[k * 2], py = pts[k * 2 + 1]; k === Math.max(0, i - 12) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
  ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = 'rgba(255,140,245,0.32)'; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,250,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255,190,250,0.6)'; ctx.font = '600 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(t('nc_ghostLbl'), x, y - 18);
  ctx.restore();
}
function drawTrail() {
  const p = P, tr = p.trail;
  if (state === 'play') { tr.push(p.x, p.y); if (tr.length > 64) tr.splice(0, 2); }
  if (tr.length < 6) return;
  const sp = Math.hypot(p.vx, p.vy), w = clamp(sp / 90, 1.5, 9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const n = tr.length / 2;
  for (let i = 1; i < n; i++) {
    const a = i / n; ctx.strokeStyle = i < n * 0.5 ? `rgba(255,61,240,${a * 0.5})` : `rgba(60,230,255,${a * 0.6})`;
    ctx.lineWidth = w * a; ctx.beginPath(); ctx.moveTo(tr[i * 2 - 2], tr[i * 2 - 1]); ctx.lineTo(tr[i * 2], tr[i * 2 + 1]); ctx.stroke();
  }
  ctx.restore();
}
function drawRope() {
  const h = P.hook; if (!h) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let pts;
  if (h.state === 'att') pts = ropePts(h); else pts = [[h.x, h.y], [P.x, P.y]];
  const strokeAll = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i === pts.length - 1 && h.state === 'att' && !h.taut) {   // slack: a little wave
      const [px, py] = pts[i - 1], mx = (px + x) / 2, my = (py + y) / 2, dl = Math.hypot(x - px, y - py) || 1, slack = clamp((h.len - h.fixed) - dl, 0, 120);
      const wv = Math.sin(wt * 6) * slack * 0.35; ctx.quadraticCurveTo(mx - (y - py) / dl * wv, my + (x - px) / dl * wv, x, y);
    } else ctx.lineTo(x, y); } };
  strokeAll(); ctx.strokeStyle = 'rgba(255,61,240,0.25)'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = h.taut ? '#ffd0fa' : '#ff8af5'; ctx.lineWidth = 1.8; ctx.stroke();
  // hook head
  const hx = h.state === 'att' ? h.ax : h.x, hy = h.state === 'att' ? h.ay : h.y;
  ctx.fillStyle = '#ffe9fd'; ctx.beginPath(); ctx.arc(hx, hy, 4, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,61,240,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, 7 + (h.state === 'att' ? Math.max(0, 6 - h.t * 30) : 0), 0, TAU); ctx.stroke();
  for (const q of h.pivots) { ctx.fillStyle = 'rgba(255,200,250,0.8)'; ctx.fillRect(q.x - 1.5, q.y - 1.5, 3, 3); }
  ctx.restore();
}
function angLerp(a, b, t) { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; }
function drawPlayer(dt) {
  const p = P, sp = Math.hypot(p.vx, p.vy);
  let target = p.ang;
  if (p.stuck) target = Math.atan2(p.stuck.ny, p.stuck.nx);
  else if (sp > 40) target = Math.atan2(p.vy, p.vx);
  p.ang = angLerp(p.ang, target, 1 - Math.exp(-(p.stuck ? 18 : 8) * dt));
  // thruster flame (world frame)
  if (p.thrOn > 0 && state === 'play') {
    const fx = -p.thrX, fy = -p.thrY, len = (16 + Math.random() * 10) * p.thrOn, bx = p.x + fx * 9, by = p.y + fy * 9;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(bx, by, bx + fx * len, by + fy * len); gr.addColorStop(0, 'rgba(255,240,200,0.95)'); gr.addColorStop(0.4, 'rgba(255,140,60,0.8)'); gr.addColorStop(1, 'rgba(255,40,160,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx - fy * 5, by + fx * 5); ctx.lineTo(bx + fx * len, by + fy * len); ctx.lineTo(bx + fy * 5, by - fx * 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (Math.random() < 0.6) addP({ t: 'dot', x: bx + fx * len * 0.6, y: by + fy * len * 0.6, vx: fx * 160 + p.vx * 0.5 + rnd(-30, 30), vy: fy * 160 + p.vy * 0.5 + rnd(-30, 30), life: 0.3, c: '#ff9a5a', r: 2, drag: 3 });
  }
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(0, 0, 3, 0, 0, 30); gr.addColorStop(0, 'rgba(95,243,255,0.35)'); gr.addColorStop(1, 'rgba(95,243,255,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
  if (I.mag) { ctx.strokeStyle = `rgba(255,61,240,${p.stuck ? 0.7 : 0.35})`; ctx.lineWidth = 1.5; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(0, 0, 15 + k * 5 + Math.sin(wt * 20 + k) * 1.5, 0, TAU); ctx.stroke(); } }
  ctx.globalCompositeOperation = 'source-over';
  ctx.rotate(p.ang); ctx.scale(1.15, 1.15);
  const blink = p.inv > 0 && Math.sin(wt * 40) > 0;
  // boots (at the back end, −x)
  ctx.fillStyle = I.mag ? '#ff3df0' : '#5a4a7a'; ctx.fillRect(-14, -6, 5, 4); ctx.fillRect(-14, 2, 5, 4);
  // cargo pack
  ctx.fillStyle = blink ? '#ffffff' : cargoColor(); ctx.strokeStyle = '#1a1030'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-9, -18, 13, 10, 2.5) : ctx.rect(-9, -18, 13, 10); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(-2.5, -18); ctx.lineTo(-2.5, -8); ctx.stroke();
  if (p.integ < 50) { ctx.strokeStyle = '#1a1030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -15); ctx.lineTo(-5, -12); ctx.lineTo(-7, -9); ctx.moveTo(1, -17); ctx.lineTo(-1, -13); ctx.stroke(); }
  // body
  ctx.fillStyle = blink ? '#ff9fb1' : '#eaf6ff'; ctx.strokeStyle = '#5ff3ff'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(-1, 0, 11, 9.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
  // visor
  ctx.fillStyle = '#0b1630'; ctx.beginPath(); ctx.ellipse(4.5, 0, 5, 6.5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(4.5, 0, 3.4, 4.8, 0, -1.2, 0.4); ctx.stroke();
  ctx.restore();
  // charge glow while stuck
  if (p.stuck && p.charge > 60) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,61,240,${clamp(p.charge / 900, 0.1, 0.6)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, TAU); ctx.stroke(); ctx.restore(); }
}
const aimPred = { node: null, x: 0, y: 0, kind: 'none' };
function drawAim() {
  const p = P; aimPred.node = null;
  if (p.hook && p.hook.state !== 'ret') return;
  let ax = I.aimX - p.x, ay = I.aimY - p.y; const al = Math.hypot(ax, ay); if (al < 1) return; ax /= al; ay /= al;
  if (!thook.active && !mouse.seen && SCR.aimX === null) return;
  const node = pickNode(p.x, p.y, ax, ay, touchMode ? 0.42 : 0.22, thook.active ? [I.aimX, I.aimY] : null);
  let tx, ty, kind;
  if (node) { tx = node.x; ty = node.y; kind = 'node'; aimPred.node = node; }
  else { const h = raycast(p.x, p.y, p.x + ax * HOOK_RANGE, p.y + ay * HOOK_RANGE, true); if (h) { tx = h.x; ty = h.y; kind = h.s.metal ? 'metal' : 'slick'; } else { tx = p.x + ax * HOOK_RANGE; ty = p.y + ay * HOOK_RANGE; kind = 'none'; } }
  const col = kind === 'node' ? '255,225,77' : kind === 'metal' ? '95,243,255' : kind === 'slick' ? '255,90,120' : '150,150,190';
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${col},0.22)`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 9]); ctx.lineDashOffset = -wt * 40;
  ctx.beginPath(); ctx.moveTo(p.x + ax * 16, p.y + ay * 16); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 2;
  if (kind === 'slick') { ctx.beginPath(); ctx.moveTo(tx - 6, ty - 6); ctx.lineTo(tx + 6, ty + 6); ctx.moveTo(tx + 6, ty - 6); ctx.lineTo(tx - 6, ty + 6); ctx.stroke(); }
  else { const r = kind === 'none' ? 5 : 8; ctx.beginPath(); ctx.arc(tx, ty, r, 0, TAU); ctx.stroke(); if (kind !== 'none') for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + wt * 2; ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * 11, ty + Math.sin(a) * 11); ctx.lineTo(tx + Math.cos(a) * 15, ty + Math.sin(a) * 15); ctx.stroke(); } }
  ctx.restore();
}
function drawParticles(dt) {
  ctx.save();
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
    if (q.drag) { const k = Math.exp(-q.drag * dt); q.vx *= k; q.vy *= k; }
    q.x += q.vx * dt; q.y += q.vy * dt;
    const a = q.life / q.max;
    if (q.t === 'spark') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = q.c; ctx.globalAlpha = a; ctx.lineWidth = q.w; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.03, q.y - q.vy * 0.03); ctx.stroke(); }
    else if (q.t === 'dot') { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = q.c; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.5 + a * 0.5), 0, TAU); ctx.fill(); }
    else if (q.t === 'wind') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = q.c; ctx.globalAlpha = Math.min(a, 1 - a) * 0.5; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.05, q.y - q.vy * 0.05); ctx.stroke(); }
    else if (q.t === 'ring') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = q.c; ctx.globalAlpha = a; ctx.lineWidth = q.w; ctx.beginPath(); ctx.arc(q.x, q.y, lerp(q.r1, q.r0, a), 0, TAU); ctx.stroke(); }
    else if (q.t === 'text') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, a * 1.5); ctx.fillStyle = q.c; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(q.txt, q.x, q.y); }
  }
  ctx.restore();
}
function drawStreaks(dt) {
  const p = P, sp = Math.hypot(p.vx, p.vy);
  if (sp > 420) {
    const n = Math.min(4, (sp - 420) / 160 * dt * 60);
    for (let i = 0; i < n; i++) if (Math.random() < n / Math.ceil(n)) streaks.push({ x: rnd(0, VW), y: rnd(0, VH), life: 0.28, max: 0.28, l: rnd(40, 110) * (sp / 900) });
  }
  if (!streaks.length) return;
  const dx = -p.vx / (sp || 1), dy = -p.vy / (sp || 1), mv = sp * cam.z * 1.6;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.3;
  for (let i = streaks.length - 1; i >= 0; i--) {
    const s = streaks[i]; s.life -= dt; if (s.life <= 0) { streaks.splice(i, 1); continue; }
    s.x += dx * mv * dt; s.y += dy * mv * dt;
    const a = s.life / s.max; ctx.strokeStyle = `rgba(200,245,255,${a * 0.35})`;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - dx * s.l, s.y - dy * s.l); ctx.stroke();
  }
  ctx.restore();
}
function drawOffscreen() {
  const tm = L.term, z = cam.z, sx = VW / 2 + (tm.x - cam.x) * z, sy = VH / 2 + (tm.y - cam.y) * z, m = 46;
  if (sx > m && sx < VW - m && sy > m + 50 && sy < VH - m) return;
  const cx = VW / 2, cy = VH / 2, dx = sx - cx, dy = sy - cy;
  const k = Math.min((VW / 2 - m) / Math.abs(dx || 1e-6), (VH / 2 - m - 40) / Math.abs(dy || 1e-6));
  const x = cx + dx * k, y = clamp(cy + dy * k + 10, 96, VH - 96), a = Math.atan2(dy, dx), dist = Math.hypot(tm.x - P.x, tm.y - P.y) / MPS;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,30,20,0.7)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#39ff88'; ctx.lineWidth = 2; ctx.stroke();
  ctx.rotate(a); ctx.fillStyle = '#39ff88'; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(20, -7); ctx.lineTo(20, 7); ctx.closePath(); ctx.fill(); ctx.rotate(-a);
  ctx.fillStyle = '#c8ffe0'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(dist) + (getLang() === 'ar' ? ' ' : '') + unit('m'), 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- HUD (DOM)
const hud = { lvl: $('hLvl'), time: $('hTime'), intF: $('intFill'), intT: $('intTxt'), fuelF: $('fuelFill'), fuelT: $('fuelTxt'), hot: $('hHot'), speed: $('hSpeed'), hint: $('hHint'), last: {} };
function setTxt(el, key, v) { if (hud.last[key] !== v) { hud.last[key] = v; el.textContent = v; } }
function updateHudStatic() {
  if (!L) return;
  hud.last = {};
  setTxt(hud.lvl, 'lvl', (curIdx + 1) + ' · ' + t(L.def.name));
  document.body.classList.toggle('hot', !!L.def.hot);
  $('intIco').textContent = L.def.hot ? '🍜' : L.def.fragile ? '🍷' : '📦';
}
function updateHud() {
  if (!P || !L) return;
  const p = P, tt = run.done ? run.endT : run.t;
  setTxt(hud.time, 'time', fmt(RACE.on ? raceClock() : tt));
  if (RACE.on) raceHud();
  const integ = Math.ceil(p.integ);
  hud.intF.style.width = integ + '%'; hud.intF.style.background = integ > 60 ? '#39ff88' : integ > 30 ? '#ffd23f' : '#ff4d6d';
  setTxt(hud.intT, 'int', integ + '%');
  const fu = p.fuelMax ? p.fuel / p.fuelMax * 100 : 0;
  hud.fuelF.style.width = fu.toFixed(1) + '%'; setTxt(hud.fuelT, 'fuel', Math.round(fu) + '%');
  $('barFuel').classList.toggle('low', fu < 20);
  if (L.def.hot) { const left = Math.max(0, L.limit - tt); setTxt(hud.hot, 'hot', '🔥 ' + t('nc_left', { n: left.toFixed(1) })); hud.hot.classList.toggle('urgent', left < 10); }
  const sp = Math.hypot(p.vx, p.vy), th = (L.def.fragile ? 240 : 380);
  setTxt(hud.speed, 'spd', (sp / MPS).toFixed(1) + ' ' + unit('ms'));
  hud.speed.classList.toggle('danger', sp > th);
  const showHint = run.idle > 2.5;
  hud.hint.hidden = !showHint; if (showHint) setTxt(hud.hint, 'hint', t(touchMode ? 'nc_stuckHint_t' : 'nc_stuckHint'));
}

// ---------------------------------------------------------------- screens
const scr = $('scr'), panel = $('panel'), intro = $('intro');
let screen = null, introT = 0;
const medalIco = (m) => ['·', '🥉', '🥈', '🥇'][m || 0];
function cargoTags(def) { return (def.fragile ? '🍷' : '') + (def.hot ? '🔥' : ''); }
function toggleBtn(key, act, on) { return `<button class="btn sec small tog${on ? ' on' : ''}" data-act="${act}">${t(key)}: <b>${t(on ? 'nc_on' : 'nc_off')}</b></button>`; }
function langBtn() { return `<button class="btn sec small" data-act="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button>`; }
function showScreen(name, data) {
  screen = name; document.body.dataset.screen = name || 'game';
  if (!name) { scr.hidden = true; return; }
  scr.hidden = false; panel.className = 'panel ' + name;
  let h = '';
  if (name === 'menu') {
    const nm = window.Auth && Auth.name && Auth.name();
    h = `<div class="logo"><div class="l1">NEON COURIER</div><div class="l2">ZERO-G</div></div>
      <p class="tag">${t('nc_tagline')}</p>${nm ? `<p class="who">${esc(t('nc_courier', { p: nm }))}</p>` : ''}
      <div class="col"><button class="btn big" data-act="levels" data-primary>${t('nc_play')}</button>
      <button class="btn sec" data-act="online">${t('nc_o_btn')}</button>
      <button class="btn sec" data-act="howto">${t('nc_howto')}</button></div>
      <div class="row">${toggleBtn('nc_music', 'music', SET.music)}${toggleBtn('nc_sfx', 'sfx', SET.sfx)}${toggleBtn('nc_ghost', 'ghost', SET.ghost)}</div>
      <div class="row">${langBtn()}</div>`;
  } else if (name === 'levels') {
    const golds = LEVELS.filter((_, i) => SAVE.medal[i] === 3).length;
    h = `<div class="head"><button class="btn sec small" data-act="menu">← ${t('nc_back')}</button><h2>${t('nc_levels')}</h2><span class="golds">${t('nc_golds', { n: golds, m: LEVELS.length })}</span></div>
      ${SAVE.best[LEVELS.length - 1] ? `<p class="done">${t('nc_allDone')}</p>` : ''}<div class="grid">`;
    LEVELS.forEach((d, i) => {
      const locked = i + 1 > (SAVE.unlocked || 1), best = SAVE.best[i], next = !locked && !best;
      h += `<button class="lv${locked ? ' locked' : ''}${next ? ' next' : ''}" data-act="lv" data-i="${i}" ${locked ? 'disabled' : ''}>
        <b>${i + 1}</b><span class="nm">${locked ? '🔒 ' + t('nc_locked') : esc(t(d.name))}</span>
        <span class="md">${locked ? '' : best ? medalIco(SAVE.medal[i]) + ' ' + fmt(best) : '—'}${SAVE.flaw[i] ? ' ✨' : ''}</span><i>${cargoTags(d)}</i></button>`;
    });
    h += '</div>';
  } else if (name === 'howto') {
    const ctrl = touchMode ? ['nc_t_hook', 'nc_t_thrust', 'nc_t_mag', 'nc_t_reel'] : ['nc_k_aim', 'nc_k_hook', 'nc_k_reel', 'nc_k_thrust', 'nc_k_mag', 'nc_k_misc'];
    h = `<div class="head"><button class="btn sec small" data-act="${data && data.back || 'menu'}" data-primary>← ${t('nc_back')}</button><h2>${t('nc_howto')}</h2></div><div class="scroll">
      <h3>${t('nc_h_goal_t')}</h3><p>${t('nc_h_goal')}</p>
      <h3>${t('nc_h_ctrl_t')}</h3><ul>${ctrl.map(k => `<li>${t(k)}</li>`).join('')}</ul>
      <h3>${t('nc_h_move_t')}</h3><p>${t('nc_h_hook')}</p><p>${t('nc_h_mag')}</p><p>${t('nc_h_thrust')}</p>
      <h3>${t('nc_h_cargo_t')}</h3><p>${t('nc_h_cargo')}</p>
      <h3>${t('nc_h_haz_t')}</h3><p>${t('nc_h_haz')}</p>
      <h3>${t('nc_h_medal_t')}</h3><p>${t('nc_h_medal')}</p></div>`;
  } else if (name === 'pause' && RACE.on) {
    h = `<h2>${t('nc_paused')}</h2><p class="sub">${esc(t('nc_lvl', { n: curIdx + 1 }))} · ${esc(t(L.def.name))}</p><p class="note">${t('nc_o_clock')}</p>
      <div class="col"><button class="btn big" data-act="resume" data-primary>${t('nc_resume')}</button>
      <button class="btn sec" data-act="restart">${t('nc_o_back')}</button>
      <button class="btn sec" data-act="giveup">${t('nc_o_giveup')}</button>
      <button class="btn sec" data-act="howtoP">${t('nc_howto')}</button></div>
      <div class="row">${toggleBtn('nc_music', 'music', SET.music)}${toggleBtn('nc_sfx', 'sfx', SET.sfx)}</div>
      <div class="row">${langBtn()}</div>`;
  } else if (name === 'online' || name === 'lobby' || name === 'race' || name === 'left') {
    h = onlineScreen(name);
  } else if (name === 'pause') {
    h = `<h2>${t('nc_paused')}</h2><p class="sub">${esc(t('nc_lvl', { n: curIdx + 1 }))} · ${esc(t(L.def.name))}</p>
      <div class="col"><button class="btn big" data-act="resume" data-primary>${t('nc_resume')}</button>
      <button class="btn sec" data-act="restart">${t('nc_restart')}</button>
      <button class="btn sec" data-act="levels">${t('nc_levels')}</button>
      <button class="btn sec" data-act="howtoP">${t('nc_howto')}</button></div>
      <div class="row">${toggleBtn('nc_music', 'music', SET.music)}${toggleBtn('nc_sfx', 'sfx', SET.sfx)}${toggleBtn('nc_ghost', 'ghost', SET.ghost)}</div>
      <div class="row">${langBtn()}</div>`;
  } else if (name === 'result') {
    const win = run.result === 'win', m = L.medals, hasNext = curIdx + 1 < LEVELS.length;
    if (win) {
      const md = run.medal;
      h = `<h2 class="ok">${t('nc_delivered')}</h2><div class="bigtime">${fmt(run.endT)}</div>
        <div class="medal m${md}">${md ? medalIco(md) + ' ' + t(['', 'nc_bronze', 'nc_silver', 'nc_gold'][md]) : t('nc_nomedal')}</div>
        ${run.isBest && run.prevBest ? `<div class="nb">${t('nc_newbest')}</div>` : ''}
        <div class="stats"><span>${t('nc_best')}: <b>${fmt(SAVE.best[curIdx])}</b></span><span>${t('nc_cond')}: <b>${Math.ceil(P.integ)}%</b>${P.flawless ? ' · ' + t('nc_flawless') : ''}</span></div>
        <div class="mt">${['🥇', '🥈', '🥉'].map((e, k) => `<span class="${run.endT <= m[k] ? 'hit' : ''}">${e} ${fmt(m[k])}</span>`).join('')}</div>
        <div class="col">${hasNext ? `<button class="btn big" data-act="next" data-primary>${t('nc_next')}</button>` : `<p class="done">${t('nc_allDone')}</p>`}
        <button class="btn sec" data-act="restart" ${hasNext ? '' : 'data-primary'}>${t('nc_retry')}</button><button class="btn sec" data-act="levels">${t('nc_levels')}</button></div>`;
    } else {
      h = `<h2 class="bad">${t('nc_failed')}</h2><p class="reason">${t(run.result === 'late' ? 'nc_late' : 'nc_broken')}</p>
        <div class="stats"><span>${t('nc_time')}: <b>${fmt(run.endT)}</b></span><span>${t('nc_cond')}: <b>${Math.ceil(P.integ)}%</b></span></div>
        <div class="col"><button class="btn big" data-act="restart" data-primary>${t('nc_retry')}</button><button class="btn sec" data-act="levels">${t('nc_levels')}</button></div>`;
    }
  }
  panel.innerHTML = h;
  panel.scrollTop = 0;
  if (name === 'online') wireOnline();
  if (name === 'race') RACE.resSig = resultSig();
  if (window.Mal3abPopButtons) window.Mal3abPopButtons();   // re-add 🏠 + 💬 bar (#panel has data-m3pop)
}
function showIntro() {
  const d = L.def, m = L.medals;
  let cargo = d.fragile ? t('nc_fragile') : (d.hot ? '' : t('nc_std'));
  if (d.hot) cargo += (cargo ? '<br>' : '') + esc(t('nc_hot', { n: L.limit }));
  intro.innerHTML = `<div class="lvn">${esc(t('nc_lvl', { n: curIdx + 1 }))}</div><div class="ttl">${esc(t(d.name))}</div><div class="cg">${cargo}</div>
    <div class="mt">${['🥇', '🥈', '🥉'].map((e, k) => `<span>${e} ${fmt(m[k])}</span>`).join('')}${SAVE.best[curIdx] ? `<span class="b">${t('nc_best')}: ${fmt(SAVE.best[curIdx])}</span>` : ''}</div>
    <div class="rd">${t('nc_ready')}</div>`;
  intro.hidden = false; intro.classList.remove('gone'); introT = 0;
}
function hideIntro() { intro.classList.add('gone'); }
function act(a, el) {
  AU.unlock(); AU.sfx('click');
  if (ONLINE_ACTS.has(a)) { onlineAct(a, el); return; }
  if (a === 'levels') { if (state === 'pause' || state === 'result' || state === 'play') { state = 'menu'; Music.drums = false; } showScreen('levels'); }
  else if (a === 'menu') { state = 'menu'; Music.drums = false; showScreen('menu'); }
  else if (a === 'howto') showScreen('howto', { back: 'menu' });
  else if (a === 'howtoP') showScreen('howto', { back: 'pauseBack' });
  else if (a === 'pauseBack') showScreen('pause');
  else if (a === 'lv') startLevel(+el.dataset.i);
  else if (a === 'resume') resume();
  else if (a === 'restart') restartLevel();
  else if (a === 'next') startLevel(curIdx + 1);
  else if (a === 'music') { SET.music = !SET.music; saveSet(); AU.setVolumes(); showScreen(screen); }
  else if (a === 'sfx') { SET.sfx = !SET.sfx; saveSet(); AU.setVolumes(); showScreen(screen); }
  else if (a === 'ghost') { SET.ghost = !SET.ghost; saveSet(); showScreen(screen); }
  else if (a === 'lang') setLang(getLang() === 'ar' ? 'en' : 'ar');
}
panel.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) act(b.dataset.act, b); });
function pause() { if (state !== 'play') return; state = 'pause'; clearInputs(); showScreen('pause'); }
function resume() { if (state !== 'pause') return; state = 'play'; clearInputs(); showScreen(null); }
function toMenu() {
  if (ON.code) leaveRoom();
  RACE.on = false; RACE.phase = 'off'; hideCount();
  state = 'menu'; Music.drums = false; if (!L) { L = compileLevel(menuIdx); cam.x = L.start.x; cam.y = L.start.y; } showScreen('menu');
}

// ---------------------------------------------------------------- devices
addEventListener('keydown', (e) => {
  AU.unlock();
  if (e.code === 'Space' || e.code.startsWith('Arrow')) { if (state === 'play') e.preventDefault(); }
  if (e.repeat) return;
  if (screen) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') { const b = panel.querySelector('[data-primary]'); if (b) { e.preventDefault(); b.click(); } }
    else if (e.code === 'Escape' || e.code === 'KeyP') { if (screen === 'pause') resume(); else if (screen === 'howto' || screen === 'levels') { const b = panel.querySelector('.head [data-act]'); if (b) b.click(); } }
    else if (e.code === 'KeyR' && (screen === 'result' || screen === 'pause')) restartLevel();
    return;
  }
  if (state === 'play') {
    if (e.code === 'Escape' || e.code === 'KeyP') { pause(); return; }
    if (e.code === 'KeyR') { restartLevel(); return; }
    keys.add(e.code);
    if (mouse.seen || !touchMode) setTouch(false);
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => { clearInputs(); if (state === 'play') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInputs(); if (state === 'play') pause(); if (AU.ctx) AU.ctx.suspend().catch(() => {}); } else if (AU.ctx) AU.ctx.resume().catch(() => {}); });
function setTouch(on) { if (touchMode === on) return; touchMode = on; document.body.classList.toggle('touch', on); if (screen === 'howto') showScreen('howto'); }
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('pointerdown', (e) => {
  AU.unlock();
  if (e.pointerType === 'mouse') {
    setTouch(false); mouse.seen = true; mouse.x = e.clientX; mouse.y = e.clientY;
    if (state !== 'play') return;
    if (e.button === 0) mouse.l = true; else if (e.button === 2) mouse.r = true;
  } else {
    setTouch(true); mouse.seen = false;
    if (state !== 'play' || thook.id !== null) return;
    thook.id = e.pointerId; thook.x = e.clientX; thook.y = e.clientY; thook.active = true;
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  }
  e.preventDefault();
});
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; if (!mouse.seen) { mouse.seen = true; setTouch(false); } }
  else if (e.pointerId === thook.id) { thook.x = e.clientX; thook.y = e.clientY; }
});
addEventListener('pointerup', (e) => {
  if (e.pointerType === 'mouse') { if (e.button === 0) mouse.l = false; else if (e.button === 2) mouse.r = false; }
  else if (e.pointerId === thook.id) { thook.id = null; thook.active = false; }
});
addEventListener('pointercancel', (e) => { if (e.pointerId === thook.id) { thook.id = null; thook.active = false; } });
cv.addEventListener('wheel', (e) => { if (state !== 'play') return; e.preventDefault(); I.wheel += clamp(e.deltaY, -120, 120) * 0.45; }, { passive: false });
// on-screen joystick + buttons
const joyEl = $('joy'), knob = $('knob');
function resetKnob() { if (knob) knob.style.transform = 'translate(-50%,-50%)'; }
function joyMove(e) {
  const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width / 2;
  let dx = (e.clientX - cx) / rad, dy = (e.clientY - cy) / rad; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  joy.x = Math.abs(dx) < 0.12 ? 0 : dx; joy.y = Math.abs(dy) < 0.12 ? 0 : dy;
  knob.style.transform = `translate(calc(-50% + ${dx * rad * 0.62}px), calc(-50% + ${dy * rad * 0.62}px))`;
}
joyEl.addEventListener('pointerdown', (e) => { AU.unlock(); setTouch(true); joy.id = e.pointerId; joy.active = true; try { joyEl.setPointerCapture(e.pointerId); } catch (er) {} joyMove(e); e.preventDefault(); });
joyEl.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = (e) => { if (e.pointerId === joy.id) { joy.id = null; joy.active = false; joy.x = joy.y = 0; resetKnob(); } };
joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
[['bMag', 'mag'], ['bIn', 'in'], ['bOut', 'out']].forEach(([id, k]) => {
  const el = $(id);
  el.addEventListener('pointerdown', (e) => { AU.unlock(); setTouch(true); btn[k] = true; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); });
  const up = () => { btn[k] = false; el.classList.remove('on'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
});
$('bPause').addEventListener('click', () => { AU.sfx('click'); if (state === 'play') pause(); else if (state === 'pause') resume(); });
$('bRestart').addEventListener('click', () => { AU.sfx('click'); if (state === 'play' || state === 'pause') restartLevel(); });
document.addEventListener('langchange', () => {
  if (screen) showScreen(screen, screen === 'howto' ? { back: state === 'pause' ? 'pauseBack' : 'menu' } : undefined);
  if (L) { updateHudStatic(); if (state === 'play' && !run.started && !RACE.on) showIntro(); }
  if (RACE.on && RACE.phase === 'count') showCount();
  $('bMag').title = t('nc_mag'); $('bIn').title = t('nc_in'); $('bOut').title = t('nc_out');
});
document.addEventListener('mal3abready', () => { if (screen === 'menu') showScreen('menu'); });
addEventListener('resize', resize);

// ---------------------------------------------------------------- main loop
let last = performance.now(), acc = 0, hudT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = clamp((now - last) / 1000, 0, 0.05); last = now;
  if (hitStop > 0) { hitStop -= dt; dt *= 0.15; }
  if (state === 'won' || state === 'lost') {
    slowmo = approach(slowmo, 0.3, dt * 2);
    run.end -= dt;
    if (run.end <= 0) { if (RACE.on) raceAnimEnd(); else { state = 'result'; showScreen('result'); } }
  } else slowmo = 1;
  if (state !== 'pause') {
    acc += dt * slowmo; let n = 0;
    while (acc >= FIX && n < 10) { step(FIX); acc -= FIX; n++; }
    if (n >= 10) acc = 0;
  }
  raceTick();
  updateCam(dt);
  render(state === 'pause' ? 0 : dt * (state === 'won' || state === 'lost' ? slowmo : 1));
  if ((hudT -= dt) <= 0 || state === 'play') { hudT = 0.1; updateHud(); }
  // looping sounds
  if (AU.ctx) {
    const playing = state === 'play' && P;
    AU.setLoop('thr', playing ? P.thrOn * 0.16 : 0, playing ? 700 + P.thrOn * 500 + Math.random() * 120 : 0);
    const sp = P && playing ? Math.hypot(P.vx, P.vy) : 0;
    AU.setLoop('wind', playing ? clamp((sp - 150) / 1400, 0, 0.13) : 0, 250 + sp * 0.9);
    AU.setLoop('fan', playing ? clamp(run.wind / 9000, 0, 0.18) : 0);
  }
  if (!intro.hidden && state === 'play') { introT += dt; if (introT > 6 && !intro.classList.contains('gone')) hideIntro(); }
  if (state !== 'play' && state !== 'won' && state !== 'lost' && !intro.classList.contains('gone')) hideIntro();
  const ingame = state === 'play' || state === 'pause' || state === 'won' || state === 'lost' || state === 'result';
  document.body.classList.toggle('ingame', ingame);
  document.body.classList.toggle('race', ingame && RACE.on);
}

// ---------------------------------------------------------------- online race (2 players, Supabase Realtime broadcast)
//  Both couriers fly the same level at the same time. Each side runs its own physics and broadcasts its courier
//  ~14×/s ('st'); the rival is drawn as an interpolated, non-colliding ghost. The host (room creator) picks the
//  level and starts the synced 3-2-1 ('go'); finishing sends 'fin' with the race time, and the lower time wins.
//  Crashing or running late puts you back at the start with the race clock still running.
const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'roles', 'sel', 'go', 'st', 'fin', 'quit', 'lobby', 'rq'];
const ONLINE_ACTS = new Set(['online', 'create', 'join', 'copy', 'swap', 'sel', 'start', 'leaveRoom', 'rematch', 'nextRace', 'room', 'solo', 'quitMenu', 'giveup']);
const cEl = $('count'), cLvl = $('cLvl'), cNum = $('cNum');
const rh = { me: $('rMe'), op: $('rOp'), meN: $('rMeN'), opN: $('rOpN'), meF: $('rMeF'), opF: $('rOpF'), meV: $('rMeV'), opV: $('rOpV') };
let localName = '';
const myName = () => String((window.Auth && Auth.name && Auth.name()) || localName || t('nc_o_defName')).slice(0, 16);
const newCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
const pageLink = () => location.href.split('?')[0].split('#')[0];
const inviteLink = (code) => pageLink() + '?room=' + code;
const maxUnlocked = () => Math.min(LEVELS.length, Math.max(SAVE.unlocked || 1, (ON.partner && ON.partner.ul) || 1));
function toast(txt, ms) {
  const box = $('toasts'); if (!box) return;
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = txt; box.appendChild(d);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => d.remove(), ms || 2800);
}
function copyText(text, b) {
  const done = () => { if (!b) return; const o = b.textContent; b.textContent = t('nc_o_copied'); setTimeout(() => { b.textContent = o; }, 1300); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
}
function saveName() {
  const n = $('ncName'); if (!n) return;
  const v = n.value.trim().slice(0, 16); if (!v) return;
  localName = v; try { if (window.Auth && Auth.setGuestName) Auth.setGuestName(v); } catch (e) {}
}
function wireOnline() {
  const c = $('ncCode');
  if (c) {
    c.oninput = () => { c.value = c.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    c.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); act('join', null); } };
  }
}

// ---- channel
function netSend(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }
function joinRoom(code, role) {
  leaveRoom(true);
  code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (!code) return false;
  if (!window.sb) { toast(t('nc_o_noNet')); return false; }
  let id = ''; try { id = sessionStorage.getItem(SLUG + '-id-' + code) || ''; } catch (e) {}
  if (!id) { id = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem(SLUG + '-id-' + code, id); } catch (e) {} }
  Object.assign(ON, { me: id, code, role: role || null, ready: false, jt: Date.now(), partner: null, off: null });
  let ch;
  try { ch = sb.channel(SLUG + '-' + code, { config: { broadcast: { self: false, ack: false } } }); } catch (e) { ON.code = ''; toast(t('nc_o_noNet')); return false; }
  for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; hello(true); if (screen === 'lobby') showScreen('lobby'); } });
  ON.ch = ch;
  try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
  clearInterval(ON.hb); ON.hb = setInterval(netBeat, 2000);
  toLobby();
  return true;
}
function leaveRoom(quiet) {
  if (ON.ch) { netSend('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
  clearInterval(ON.hb); ON.hb = null; ON.ch = null; ON.ready = false; ON.code = ''; ON.partner = null; ON.role = null;
  if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
}
function beat() {
  return { n: myName(), role: ON.role, jt: ON.jt, ph: RACE.on ? RACE.phase : 'off', rid: RACE.rid, sel: ON.sel, ul: SAVE.unlocked || 1,
    ft: RACE.on && RACE.myT != null ? RACE.myT : undefined, gu: RACE.on && RACE.gaveUp ? 1 : undefined };
}
function hello(req) { netSend('hello', Object.assign(beat(), { req: !!req })); }
function netBeat() {
  if (!ON.ch) return;
  netSend('hb', beat());
  if (ON.partner && Date.now() - ON.partner.t > 9000) partnerGone();
}
const otherRole = (r) => r === 'host' ? 'guest' : 'host';
function resolveRoles(p) {
  if (RACE.on && RACE.phase !== 'off' && ON.role) return;
  const mineFirst = ON.jt < p.jt || (ON.jt === p.jt && ON.me < p.id);
  if (!p.role && !ON.role) ON.role = mineFirst ? 'host' : 'guest';
  else if (!ON.role) ON.role = otherRole(p.role);
  else if (p.role === ON.role && !mineFirst) ON.role = otherRole(p.role);
}
function onNet(ev, p) {
  if (!p || p.id === ON.me) return;
  const now = Date.now();
  if (ev === 'full') { if (p.to === ON.me) { leaveRoom(); toMenu(); showScreen('online'); toast(t('nc_o_full')); } return; }
  let Pn = ON.partner;
  if (Pn && Pn.id !== p.id) {
    if (now - Pn.t < 9000) { if (ev === 'hello') netSend('full', { to: p.id }); return; }   // a third player
    partnerGone(true); Pn = null;
  }
  if (ev === 'bye') { if (Pn) partnerGone(); return; }
  if (!Pn) {
    Pn = ON.partner = { id: p.id, n: t('nc_o_rival'), role: null, t: now, ul: 1, ph: 'off', rid: -1 };
    ON.off = null;
    if (p.n) Pn.n = String(p.n).slice(0, 16);
    toast(t('nc_o_joined', { p: Pn.n })); AU.sfx('beep');
  }
  Pn.t = now; if (p.n) Pn.n = String(p.n).slice(0, 16); if (p.ul) Pn.ul = p.ul | 0;
  if (ev === 'hello' || ev === 'hb') {
    if ('role' in p) Pn.role = p.role;
    Pn.ph = p.ph; Pn.rid = p.rid | 0;
    const before = ON.role; resolveRoles(p);
    if (Pn.role === 'host' && ON.role === 'guest' && p.sel != null && !RACE.on) setSel(p.sel, false);
    if (ev === 'hello' && p.req) hello(false); else if (before !== ON.role) hello(false);
    if (RACE.on && RACE.phase !== 'off') {
      if (RACE.oppName !== Pn.n) RACE.oppName = Pn.n;
      if (Pn.rid === RACE.rid && p.ph !== 'off') { if (p.ft != null) oppFinished(+p.ft); if (p.gu) oppOut('gave'); }   // (also repairs a lost 'fin' / 'quit')
      else if ((RACE.phase === 'count' || RACE.phase === 'race') && performance.now() - RACE.startAt > 4000) oppOut('left');   // reloaded or back in the room
    }
    if (screen === 'lobby') showScreen('lobby');
    return;
  }
  switch (ev) {
    case 'roles': ON.role = p.host === ON.me ? 'host' : 'guest'; Pn.role = otherRole(ON.role); if (screen === 'lobby') showScreen('lobby'); break;
    case 'sel': if (ON.role === 'guest' && !RACE.on) setSel(p.l, false); break;
    case 'go':
      if (ON.role === 'host') { if (Pn.role === 'host') ON.role = 'guest'; else break; }
      if (RACE.on && RACE.rid === (p.r | 0) && RACE.phase !== 'off') break;   // duplicate
      ON.role = 'guest'; Pn.role = 'host';
      raceBegin(p.l | 0, p.r | 0); break;
    case 'st': if (RACE.on && (p.r | 0) === RACE.rid) addSnap(p); break;
    case 'fin': if (RACE.on && (p.r | 0) === RACE.rid) oppFinished(+p.t); break;
    case 'quit': if (RACE.on && (p.r | 0) === RACE.rid) oppOut('gave'); break;
    case 'lobby': if (RACE.on && RACE.phase === 'done') toLobby(); break;
    case 'rq':
      if (ON.role !== 'host') break;
      if (RACE.on && RACE.phase === 'done') hostStart(p.act === 'next' ? curIdx + 1 : curIdx);
      else if (RACE.on) { RACE.oppReq = p.act; }
      break;
  }
}
function partnerGone(silent) {
  const Pn = ON.partner; if (!Pn) return; ON.partner = null;
  const racing = RACE.on && (RACE.phase === 'count' || RACE.phase === 'race');
  const wasIn = RACE.on && RACE.phase !== 'off' && RACE.oppT == null && !RACE.oppOut;
  if (RACE.on && RACE.phase !== 'off' && RACE.oppT == null && !RACE.oppOut) RACE.oppOut = 'left';
  if (racing && wasIn) {                    // mid-race: say so, offer to finish solo
    RACE.leftName = Pn.n;
    if (state === 'play') { state = 'pause'; clearInputs(); }
    showScreen('left');
  } else {
    if (!silent) toast(t('nc_o_left', { p: Pn.n }));
    if (screen === 'lobby' || screen === 'race') showScreen(screen);
  }
}
function swapRoles() {
  if (!ON.partner || !ON.role) return;
  ON.role = otherRole(ON.role); ON.partner.role = otherRole(ON.role);
  netSend('roles', { host: ON.role === 'host' ? ON.me : ON.partner.id });
  showScreen('lobby');
}
function setBgLevel(i) { if (!L || L.idx !== i) { L = compileLevel(i); cam.pathT = 0; cam.x = L.start.x; cam.y = L.start.y; } }
function setSel(i, send) {
  ON.sel = clamp(i | 0, 0, LEVELS.length - 1);
  if (state === 'menu' && screen === 'lobby') setBgLevel(ON.sel);
  if (send) netSend('sel', { l: ON.sel });
  if (screen === 'lobby') showScreen('lobby');
}
function toLobby() {
  RACE.on = false; RACE.phase = 'off'; hideCount();
  state = 'menu'; Music.drums = false; clearInputs();
  if (ON.role === 'host') ON.sel = clamp(ON.sel, 0, maxUnlocked() - 1);
  setBgLevel(ON.sel);
  showScreen('lobby');
}

// ---- race flow
function hostStart(idx) {
  const Pn = ON.partner;
  if (!Pn) { toast(t('nc_o_needP')); return; }
  if (ON.role !== 'host') return;
  idx = clamp(idx | 0, 0, LEVELS.length - 1);
  const rid = Math.max(RACE.rid, Pn.rid | 0) + 1, msg = { l: idx, r: rid };
  netSend('go', msg);
  setTimeout(() => { if (RACE.on && RACE.rid === rid) netSend('go', msg); }, 300);   // broadcasts have no ack: say it twice
  raceBegin(idx, rid);
}
function raceBegin(idx, rid) {
  ON.sel = clamp(idx, 0, LEVELS.length - 1);
  startLevel(ON.sel, true);
  Object.assign(RACE, { phase: 'count', rid, startAt: performance.now(), goAt: 0, endClock: 0, myT: null, oppT: null, oppOut: null, gaveUp: false, myP: 0, oppP: 0,
    buf: [], rtr: [], rv: null, sendT: 0, uiT: 0, req: false, oppReq: null, lastNum: 0, resSig: '', oppName: (ON.partner && ON.partner.n) || t('nc_o_rival'), leftName: '' });
  RACE.df = distField(L);
  const W = L.W, sx = Math.floor(L.start.x / T), sy = Math.floor(L.start.y / T);
  let d = RACE.df[sy * W + sx]; if (!isFinite(d)) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = RACE.df[(sy + j) * W + sx + i]; if (v + 1 < d) d = v + 1; }
  RACE.dStart = isFinite(d) && d > 0 ? d : 1;
  ON.off = null;
  showCount();
}
const raceClock = () => RACE.myT != null ? RACE.myT : RACE.phase === 'race' ? (performance.now() - RACE.goAt) / 1000 : RACE.phase === 'done' ? RACE.endClock : 0;
function raceDelivered() {
  if (RACE.phase !== 'race' || RACE.myT != null) return;
  RACE.myT = Math.round((performance.now() - RACE.goAt) / 10) / 100;
  RACE.myP = 1; RACE.phase = 'done'; RACE.endClock = RACE.myT;
  netSend('fin', { r: RACE.rid, t: RACE.myT, ul: SAVE.unlocked || 1 });
  sendSt();
}
function oppFinished(tm) {
  if (!RACE.on || RACE.oppT != null || !isFinite(tm)) return;
  RACE.oppT = Math.round(tm * 100) / 100; RACE.oppP = 1;
  if (RACE.myT == null && !RACE.gaveUp) { toast(t('nc_o_rivalFirst', { p: RACE.oppName, t: fmt(RACE.oppT) }), 5000); AU.sfx('beep'); }
}
function oppOut(kind) {
  if (!RACE.on || RACE.oppOut || RACE.oppT != null) return;
  RACE.oppOut = kind;
  if (RACE.myT == null && !RACE.gaveUp) toast(t(kind === 'gave' ? 'nc_o_gaveP' : 'nc_o_outP', { p: RACE.oppName }), 4000);
}
function giveUp() {
  if (!RACE.on || (RACE.phase !== 'count' && RACE.phase !== 'race')) return;
  RACE.endClock = raceClock(); RACE.gaveUp = true; RACE.phase = 'done';
  netSend('quit', { r: RACE.rid });
  run.done = true; state = 'result'; clearInputs(); hideCount(); showScreen('race');
}
function raceRespawn() {
  if (!RACE.on || (RACE.phase !== 'count' && RACE.phase !== 'race')) return;
  P = newPlayer(); run = newRun(); run.started = RACE.phase === 'race';
  cam.x = P.x; cam.y = P.y; slowmo = 1; hitStop = 0;
  if (screen === 'pause') showScreen(null);
  state = screen ? 'pause' : 'play'; Music.drums = true;
  clearInputs();
  ring(P.x, P.y, '#5ff3ff', 70, 0.5, 3); popup(P.x, P.y - 26, t('nc_o_respawn'), '#9ff4ff');
}
function raceAnimEnd() {   // the delivered / wrecked slow-motion finished
  if (state === 'won' || RACE.phase === 'done') { state = 'result'; showScreen('race'); return; }
  const why = run.result; raceRespawn();
  toast(t(why === 'late' ? 'nc_late' : 'nc_broken'));
}
function rematch(next) {
  if (!ON.partner) return;
  if (ON.role === 'host') hostStart(next ? curIdx + 1 : curIdx);
  else { RACE.req = true; netSend('rq', { act: next ? 'next' : 'rematch' }); showScreen('race'); }
}
function raceTick() {
  if (!RACE.on) return;
  const now = performance.now();
  if (RACE.phase === 'count') {
    const left = 3 - (now - RACE.startAt) / 1000, n = Math.ceil(left);
    if (left > 0 && n !== RACE.lastNum) { RACE.lastNum = n; setCount(String(n), false); AU.sfx('beep'); }
    if (left <= 0) {
      RACE.phase = 'race'; RACE.goAt = now; wt = 0;
      if (run && !run.done) { run.started = true; run.t = 0; }
      setCount(t('nc_o_go'), true); AU.sfx('start');
    }
  }
  if (!cEl.hidden && RACE.phase !== 'count' && !(RACE.phase === 'race' && now - RACE.goAt < 800)) hideCount();
  // hazards stay in phase with the race clock, so both couriers meet the same lasers and doors
  if (RACE.phase === 'race' && state === 'play') { const rt = (now - RACE.goAt) / 1000; if (Math.abs(wt - rt) > 0.25) wt = rt; }
  if (P && RACE.df && RACE.myT == null && !RACE.gaveUp) RACE.myP = progressAt(P.x, P.y);
  // broadcast my courier ~14×/s
  if (ON.partner && (RACE.phase === 'count' || RACE.phase === 'race' || state === 'won' || state === 'lost') && now >= RACE.sendT) {
    RACE.sendT = Math.max(RACE.sendT + 70, now - 70); sendSt();
  }
  if (screen === 'race' && now - RACE.uiT > 250) {
    RACE.uiT = now;
    if (resultSig() !== RACE.resSig) showScreen('race');
    else { const e = $('rsOp'); if (e && RACE.oppT == null && !RACE.oppOut) e.textContent = t('nc_o_flying', { n: Math.round(RACE.oppP * 100) }); }
  }
}
function sendSt() {
  const p = P; if (!p || !ON.ch) return;
  const h = p.hook; let f = 0, hx, hy;
  if (h) { if (h.state === 'att') { f |= 1; const q = lastPiv(h); hx = q.x; hy = q.y; } else { f |= 2; hx = h.x; hy = h.y; } }
  if (p.stuck) f |= 4; if (I.mag) f |= 8; if (p.thrOn > 0) f |= 16;
  if (run.result === 'win' || RACE.myT != null) f |= 64; else if (state === 'lost' || RACE.gaveUp) f |= 32;
  netSend('st', { r: RACE.rid, ms: Math.round(performance.now()), x: Math.round(p.x), y: Math.round(p.y), vx: Math.round(p.vx), vy: Math.round(p.vy),
    a: Math.round(p.ang * 100) / 100, f, hx: hx != null ? Math.round(hx) : undefined, hy: hy != null ? Math.round(hy) : undefined, pr: Math.round(RACE.myP * 100) });
}
// ---- rival ghost: snapshot interpolation (~100 ms behind), short extrapolation when packets are late
function addSnap(p) {
  const now = performance.now(), ms = +p.ms || 0, smp = now - ms;
  if (ON.off == null || Math.abs(smp - ON.off) > 1500) ON.off = smp;     // sender clock → my clock
  else if (smp < ON.off) ON.off = smp; else ON.off += (smp - ON.off) * 0.02;
  const s = { t: ms + ON.off, x: +p.x, y: +p.y, vx: +p.vx || 0, vy: +p.vy || 0, a: +p.a || 0, f: p.f | 0, hx: p.hx, hy: p.hy };
  if (!isFinite(s.x) || !isFinite(s.y)) return;
  const B = RACE.buf; if (B.length && s.t <= B[B.length - 1].t) return;
  B.push(s); if (B.length > 40) B.shift();
  if (p.pr != null && RACE.oppT == null) RACE.oppP = clamp((p.pr | 0) / 100, 0, 1);
}
function rivalState() {
  const B = RACE.buf; if (!B.length) return null;
  const rt = performance.now() - 100;
  while (B.length > 2 && B[1].t < rt - 400) B.shift();
  if (rt <= B[0].t) return B[0];
  let i = B.length - 1; while (i > 0 && B[i].t > rt) i--;
  const a = B[i], b = B[i + 1];
  if (!b) { const e = Math.min(0.12, (rt - a.t) / 1000); return { x: a.x + a.vx * e, y: a.y + a.vy * e, a: a.a, f: a.f, hx: a.hx, hy: a.hy }; }
  const u = clamp((rt - a.t) / Math.max(1, b.t - a.t), 0, 1);
  if (Math.hypot(b.x - a.x, b.y - a.y) > 400) return u < 0.5 ? a : b;    // respawn: jump, don't slide
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), a: angLerp(a.a, b.a, u), f: b.f, hx: b.hx, hy: b.hy };
}
function drawRival() {
  if (!RACE.on || RACE.oppOut || RACE.oppT != null) { RACE.rv = null; RACE.rtr.length = 0; return; }
  const s = rivalState(); RACE.rv = s;
  if (!s || (s.f & 96)) { RACE.rtr.length = 0; return; }
  const tr = RACE.rtr;
  if (tr.length >= 2 && Math.hypot(s.x - tr[tr.length - 2], s.y - tr[tr.length - 1]) > 400) tr.length = 0;
  tr.push(s.x, s.y); if (tr.length > 44) tr.splice(0, 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 2; i < tr.length; i += 2) { const k = i / tr.length; ctx.strokeStyle = `rgba(255,150,60,${k * 0.32})`; ctx.lineWidth = 1 + k * 4; ctx.beginPath(); ctx.moveTo(tr[i - 2], tr[i - 1]); ctx.lineTo(tr[i], tr[i + 1]); ctx.stroke(); }
  if ((s.f & 3) && s.hx != null) {
    ctx.strokeStyle = 'rgba(255,190,120,0.45)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.hx, s.hy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,180,0.6)'; ctx.beginPath(); ctx.arc(s.hx, s.hy, 3.5, 0, TAU); ctx.fill();
  }
  const gr = ctx.createRadialGradient(s.x, s.y, 3, s.x, s.y, 28); gr.addColorStop(0, 'rgba(255,150,60,0.28)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(s.x, s.y, 28, 0, TAU); ctx.fill();
  if (s.f & 8) { ctx.strokeStyle = `rgba(255,120,60,${s.f & 4 ? 0.5 : 0.25})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(s.x, s.y, 16, 0, TAU); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.55;
  ctx.translate(s.x, s.y); ctx.rotate(s.a); ctx.scale(1.15, 1.15);
  ctx.fillStyle = s.f & 8 ? '#ff9a3d' : '#6a4a3a'; ctx.fillRect(-14, -6, 5, 4); ctx.fillRect(-14, 2, 5, 4);
  ctx.fillStyle = cargoColor(); ctx.strokeStyle = '#2a1206'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-9, -18, 13, 10, 2.5) : ctx.rect(-9, -18, 13, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffe4cc'; ctx.strokeStyle = '#ff9a3d'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(-1, 0, 11, 9.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2a1206'; ctx.beginPath(); ctx.ellipse(4.5, 0, 5, 6.5, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawRivalUI() {   // screen space: name tag over the ghost, or an arrow at the edge when it's off screen
  const s = RACE.rv; if (!s || (s.f & 96) || RACE.oppOut || RACE.oppT != null) return;
  const z = cam.z, sx = VW / 2 + (s.x - cam.x) * z + cam.sx, sy = VH / 2 + (s.y - cam.y) * z + cam.sy, m = 34, nm = RACE.oppName || '';
  ctx.save(); ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (sx > m && sx < VW - m && sy > m && sy < VH - m) {
    const w = ctx.measureText(nm).width + 14, y = sy - 22 * z - 14;
    ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(40,14,8,0.8)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx - w / 2, y - 9, w, 18, 9) : ctx.rect(sx - w / 2, y - 9, w, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(255,154,61,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#ffd9b8'; ctx.fillText(nm, sx, y + 0.5);
  } else {
    const cx = VW / 2, cy = VH / 2, dx = sx - cx, dy = sy - cy;
    const k = Math.min((VW / 2 - m) / Math.abs(dx || 1e-6), (VH / 2 - m) / Math.abs(dy || 1e-6));
    const x = clamp(cx + dx * k, m, VW - m), y = clamp(cy + dy * k, 120, VH - 110), a = Math.atan2(dy, dx);
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(40,14,8,0.75)'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ff9a3d'; ctx.lineWidth = 2; ctx.stroke();
    ctx.rotate(a); ctx.fillStyle = '#ff9a3d'; ctx.beginPath(); ctx.moveTo(21, 0); ctx.lineTo(13, -6); ctx.lineTo(13, 6); ctx.closePath(); ctx.fill(); ctx.rotate(-a);
    ctx.fillStyle = '#ffd9b8'; ctx.font = '800 11px system-ui, sans-serif'; ctx.fillText(Array.from(nm)[0] || '?', 0, 0.5);
  }
  ctx.restore();
}
// ---- progress along the level: distance (in cells) to the terminal over open space
function distField(Lv) {
  const { W, H, g } = Lv, N = W * H, dist = new Float64Array(N).fill(Infinity);   // (float64: the d > dist[u] test must be exact)
  const open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && g[y * W + x] === '.';
  const e = Math.floor(Lv.term.y / T) * W + Math.floor(Lv.term.x / T);
  const heap = []; const push = (i, d) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const q = (k - 1) >> 1; if (heap[q][0] <= heap[k][0]) break; [heap[q], heap[k]] = [heap[k], heap[q]]; k = q; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  dist[e] = 0; push(e, 0);
  while (heap.length) {
    const [d, u] = pop(); if (d > dist[u]) continue;
    const ux = u % W, uy = (u / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const vx = ux + dx, vy = uy + dy; if (!open(vx, vy)) continue;
      if (dx && dy && (!open(ux + dx, uy) || !open(ux, uy + dy))) continue;
      const v = vy * W + vx, nd = d + (dx && dy ? 1.4142 : 1);
      if (nd < dist[v]) { dist[v] = nd; push(v, nd); }
    }
  }
  return dist;
}
function progressAt(x, y) {
  const D = RACE.df; if (!D || !L) return 0;
  const W = L.W, H = L.H, cx = Math.floor(x / T), cy = Math.floor(y / T);
  const at = (i, j) => (i >= 0 && j >= 0 && i < W && j < H) ? D[j * W + i] : Infinity;
  let d = at(cx, cy);
  if (!isFinite(d)) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) d = Math.min(d, at(cx + i, cy + j) + 1);
  if (!isFinite(d)) return RACE.myP;
  return clamp(1 - d / RACE.dStart, 0, 0.99);
}
// ---- HUD + countdown
function raceHud() {
  const R = RACE;
  setTxt(rh.meN, 'rmn', myName()); setTxt(rh.opN, 'ron', R.oppName || t('nc_o_rival'));
  rh.meF.style.width = (R.myP * 100).toFixed(1) + '%'; rh.opF.style.width = (R.oppP * 100).toFixed(1) + '%';
  setTxt(rh.meV, 'rmv', R.myT != null ? '✅ ' + fmt(R.myT) : R.gaveUp ? '🏳' : Math.round(R.myP * 100) + '%');
  setTxt(rh.opV, 'rov', R.oppT != null ? '✅ ' + fmt(R.oppT) : R.oppOut === 'gave' ? '🏳' : R.oppOut ? '✖' : Math.round(R.oppP * 100) + '%');
  rh.me.classList.toggle('done', R.myT != null); rh.op.classList.toggle('done', R.oppT != null);
}
function showCount() {
  if (!L) return;
  const d = L.def;
  let cargo = d.fragile ? t('nc_fragile') : (d.hot ? '' : t('nc_std'));
  if (d.hot) cargo += (cargo ? ' · ' : '') + t('nc_hot', { n: L.limit });
  cLvl.innerHTML = `<small>${esc(t('nc_o_title'))} · ${esc(t('nc_lvl', { n: curIdx + 1 }))}</small>${esc(t(d.name))}<em>${esc(cargo)}</em>`;
  cLvl.hidden = false; cEl.hidden = false;
  if (RACE.lastNum) cNum.textContent = String(RACE.lastNum);
}
function setCount(txt, go) {
  cEl.hidden = false; cLvl.hidden = !!go;
  cNum.textContent = txt; cNum.classList.toggle('go', !!go);
  cNum.classList.remove('pop'); void cNum.offsetWidth; cNum.classList.add('pop');
}
function hideCount() { if (cEl) cEl.hidden = true; }
// ---- screens
function resultSig() { const R = RACE; return [R.myT, R.oppT, R.oppOut, R.gaveUp, !!ON.partner, ON.role, R.req, R.oppReq].join('|'); }
function onlineScreen(name) {
  const Pn = ON.partner, host = ON.role === 'host';
  if (name === 'online') {
    const logged = !!(window.Auth && Auth.profile);
    const stored = (window.Auth && Auth.name && Auth.name()) || localName || '';
    return `<div class="head"><button class="btn sec small" data-act="menu">← ${t('nc_back')}</button><h2>${t('nc_o_title')}</h2></div>
      <p class="sub">${t('nc_o_intro')}</p>
      ${logged ? `<p class="who">${esc(t('nc_courier', { p: myName() }))}</p>`
        : `<label class="fld"><span>${t('nc_o_name')}</span><input id="ncName" class="inp" maxlength="16" autocomplete="off" spellcheck="false" dir="auto" placeholder="${esc(t('nc_o_namePh'))}" value="${esc(stored)}"></label>`}
      <button class="btn big" data-act="create" data-primary>${t('nc_o_create')}</button>
      <p class="or">${t('nc_o_or')}</p>
      <div class="row"><input id="ncCode" class="inp code" maxlength="6" autocomplete="off" spellcheck="false" placeholder="${esc(t('nc_o_codePh'))}"><button class="btn" data-act="join">${t('nc_o_join')}</button></div>
      <p class="msg" id="ncMsg"></p>`;
  }
  if (name === 'lobby') {
    const d = LEVELS[ON.sel] || LEVELS[0], roleTxt = (r) => r === 'host' ? '👑 ' + t('nc_o_host') : r === 'guest' ? '🎮 ' + t('nc_o_guest') : '⏳';
    const best = SAVE.best[ON.sel];
    return `<div class="head"><h2>${t('nc_o_title')}</h2></div>
      <div class="codebox"><span>${t('nc_o_room')}</span><b>${esc(ON.code)}</b><button class="btn small" data-act="copy">${t('nc_o_copy')}</button></div>
      <p class="sub">${t('nc_o_share')}</p>
      <div class="plist">
        <div class="pl me"><i></i><b dir="auto">${esc(myName())}</b><small>${t('nc_o_you')} · ${roleTxt(ON.role)}</small></div>
        ${Pn ? `<div class="pl"><i></i><b dir="auto">${esc(Pn.n)}</b><small>${roleTxt(Pn.role)}</small></div>` : `<div class="pl wait">${t(ON.ready ? 'nc_o_wait' : 'nc_o_connecting')}</div>`}
      </div>
      ${Pn && ON.role ? `<div class="row"><button class="btn sec small" data-act="swap">${t('nc_o_swap')}</button></div>` : ''}
      <div class="picker">${host ? `<button class="btn sec" data-act="sel" data-d="-1" ${ON.sel <= 0 ? 'disabled' : ''}>‹</button>` : ''}
        <div class="grow"><small>${t('nc_o_level')}</small><b>${ON.sel + 1} · ${esc(t(d.name))} ${cargoTags(d)}</b><span class="md">${best ? medalIco(SAVE.medal[ON.sel]) + ' ' + fmt(best) : '—'}</span></div>
        ${host ? `<button class="btn sec" data-act="sel" data-d="1" ${ON.sel >= maxUnlocked() - 1 ? 'disabled' : ''}>›</button>` : ''}</div>
      ${host ? `<button class="btn big" data-act="start" data-primary ${Pn ? '' : 'disabled'}>${t('nc_o_start')}</button>${Pn ? `<p class="sub">${t('nc_o_hostPicks')}</p>` : `<p class="sub">${t('nc_o_needP')}</p>`}`
        : `<p class="sub">${t(ON.role ? 'nc_o_waitHost' : 'nc_o_connecting')}</p>`}
      <button class="btn sec" data-act="leaveRoom">${t('nc_o_leave')}</button>`;
  }
  if (name === 'left') {
    return `<h2 class="bad">${esc(t('nc_o_leftT', { p: RACE.leftName || t('nc_o_rival') }))}</h2><p class="sub">${t('nc_o_leftD')}</p>
      <div class="col"><button class="btn big" data-act="solo" data-primary>${t('nc_o_solo')}</button><button class="btn sec" data-act="quitMenu">${t('nc_o_menu')}</button></div>`;
  }
  // race results
  const R = RACE;
  const me = { n: myName(), you: true, t: R.myT, st: R.myT != null ? 'fin' : R.gaveUp ? 'gave' : 'fly', p: R.myP };
  const op = { n: R.oppName || t('nc_o_rival'), t: R.oppT, st: R.oppT != null ? 'fin' : R.oppOut === 'gave' ? 'gave' : R.oppOut ? 'left' : 'fly', p: R.oppP };
  let out;
  if (me.t != null && op.t != null) out = me.t < op.t ? 'win' : me.t > op.t ? 'lose' : 'tie';
  else if (me.t != null) out = op.st === 'fly' ? 'win' : 'solo';
  else out = op.t != null ? 'lose' : 'gave';
  const ttl = { win: ['ok', 'nc_o_win'], lose: ['bad', 'nc_o_lose'], tie: ['ok', 'nc_o_tie'], solo: ['ok', op.st === 'gave' ? 'nc_o_win' : 'nc_delivered'], gave: ['bad', 'nc_o_gaveUp'] }[out];
  const rows = [me, op].sort((a, b) => (a.t == null ? 1e9 : a.t) - (b.t == null ? 1e9 : b.t));
  const stTxt = (r) => r.st === 'fin' ? fmt(r.t) : r.st === 'gave' ? t('nc_o_stGave') : r.st === 'left' ? t('nc_o_stLeft') : t('nc_o_flying', { n: Math.round(r.p * 100) });
  const pos = (r, i) => r.st !== 'fin' ? '·' : out === 'tie' ? '🤝' : i === 0 ? '🥇' : '🥈';
  const hasNext = curIdx + 1 < LEVELS.length && curIdx + 1 < maxUnlocked();
  let h = `<h2 class="${ttl[0]}">${t(ttl[1])}</h2><p class="sub">${esc(t('nc_lvl', { n: curIdx + 1 }))} · ${esc(t(L.def.name))}</p>
    <div class="rres">${rows.map((r, i) => `<div class="rrow${r.you ? ' me' : ''}"><span class="pos">${pos(r, i)}</span><b dir="auto">${esc(r.n)}${r.you ? ' · ' + t('nc_o_you') : ''}</b><span class="tm${r.st === 'fin' ? '' : ' fly'}" id="${r.you ? 'rsMe' : 'rsOp'}">${stTxt(r)}</span></div>`).join('')}</div>
    ${op.st === 'left' ? `<p class="note">${t('nc_o_oppLeftN')}</p>` : ''}
    ${host && R.oppReq && Pn ? `<p class="note">${esc(t('nc_o_wantsRe', { p: Pn.n }))}</p>` : ''}
    <div class="col">`;
  if (Pn) {
    h += `<button class="btn big" data-act="rematch" data-primary>${t('nc_o_rematch')}</button>${hasNext ? `<button class="btn" data-act="nextRace">${t('nc_o_next')}</button>` : ''}`;
    if (!host && R.req) h += `<p class="sub">${t('nc_o_waitReq')}</p>`;
  }
  h += `<button class="btn sec" data-act="room" ${Pn ? '' : 'data-primary'}>${t('nc_o_toRoom')}</button><button class="btn sec" data-act="quitMenu">${t('nc_o_menu')}</button></div>`;
  return h;
}
async function onlineAct(a, el) {
  switch (a) {
    case 'online': showScreen('online'); break;
    case 'create': saveName(); if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return; joinRoom(newCode(), 'host'); break;
    case 'join': {
      saveName();
      const inp = $('ncCode'), code = (inp ? inp.value : '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length < 4) { const m = $('ncMsg'); if (m) m.textContent = t('nc_o_codeHint'); return; }
      if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return;
      joinRoom(code, null); break;
    }
    case 'copy': copyText(inviteLink(ON.code), el); break;
    case 'swap': swapRoles(); break;
    case 'sel': if (ON.role === 'host') setSel(clamp(ON.sel + (+el.dataset.d || 0), 0, maxUnlocked() - 1), true); break;
    case 'start': hostStart(ON.sel); break;
    case 'leaveRoom': case 'quitMenu': toMenu(); break;
    case 'rematch': rematch(false); break;
    case 'nextRace': rematch(true); break;
    case 'room': if (ON.partner) netSend('lobby', {}); toLobby(); break;
    case 'solo': if (state === 'pause') state = 'play'; clearInputs(); showScreen(null); break;
    case 'giveup': giveUp(); break;
  }
}
addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });
window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : pageLink();
window.Mal3abPrepareInvite = async () => {
  if (!ON.code) { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return pageLink(); joinRoom(newCode(), 'host'); }
  return inviteLink(ON.code);
};

// ---------------------------------------------------------------- test / script API
window.NeonCourier = {
  get state() { return state; }, get screen() { return screen; }, get level() { return curIdx; }, get L() { return L; }, get player() { return P; }, get run() { return run; },
  get levels() { return LEVELS.length; }, save: SAVE, settings: SET, cam,
  start: (i) => startLevel(i), restart: () => startLevel(curIdx), pause, resume, menu: toMenu, showLevels: () => act('levels'),
  input: (o) => Object.assign(SCR, o || {}), clearInput: () => Object.assign(SCR, { tx: 0, ty: 0, hook: false, reelIn: false, reelOut: false, mag: false, aimX: null, aimY: null }),
  step: (sec) => { const n = Math.round((sec || 0) / FIX); for (let i = 0; i < n; i++) step(FIX); },
  deliver: () => { P.trail.length = 0; P.x = L.term.x; P.y = L.term.y; P.vx = P.vy = 0; if (!run.started) run.started = true; step(FIX); },
  damage: (d) => damage(d, P.x, P.y),
  teleport: (x, y, vx = 0, vy = 0) => { P.x = x; P.y = y; P.vx = vx; P.vy = vy; P.trail.length = 0; },
  finishSequence: () => { if (state === 'won' || state === 'lost') { run.end = 0; state = 'result'; showScreen('result'); } },
  medals: (i) => compileLevel(i).medals,
  info: (i) => { const v = compileLevel(i); return { medals: v.medals, limit: v.limit, route: v.routeLen, pathOk: v.path.length > 0, segs: v.segs.length, corners: v.corners.length }; },
  ascii: (i) => { const v = compileLevel(i); const rows = []; for (let y = 0; y < v.H; y++) rows.push(v.g.slice(y * v.W, (y + 1) * v.W).join('')); return rows.join('\n'); },
  path: (i) => compileLevel(i).path,
  overview: (on) => { camLock = on && L ? { x: L.W * T / 2, y: L.H * T / 2, z: Math.min(VW / (L.W * T), VH / (L.H * T)) * 0.98 } : null; },
  race: RACE, net: ON, joinRoom, leaveRoom, hostStart, giveUp, respawn: raceRespawn, act, rival: () => RACE.rv, progress: () => RACE.myP,
};

// ---------------------------------------------------------------- boot
resize();
document.body.classList.toggle('touch', touchMode);
$('bMag').title = t('nc_mag'); $('bIn').title = t('nc_in'); $('bOut').title = t('nc_out');
menuIdx = Math.min(LEVELS.length - 1, Math.max(0, (SAVE.unlocked || 1) - 1));
toMenu();
requestAnimationFrame(frame);
// invite link: ?room=CODE joins that race room (after the account / cloud saves are ready)
const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam) {
  let tried = false;
  const go = async () => {
    if (tried || ON.code) return; tried = true;
    if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return;
    joinRoom(roomParam, null);
  };
  if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
}
})();
