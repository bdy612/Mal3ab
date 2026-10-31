// Gridlock Hacker — cyberpunk data-routing puzzle for Mal3ab
(function () {
  'use strict';
  const SLUG = 'gridlock-hacker', SAVE_KEY = SLUG + '-save';

  // ───────────────────────── strings ─────────────────────────
  addStrings({
    gl_logo1: 'جريدلوك', gl_logo2: 'هاكر',
    gl_sub: 'إنت فيروس ذكي جوّه شبكة شركة عملاقة. اخترق السيرفرات قبل ما يتتبعوك.',
    gl_campaign: 'الحملة', gl_endless: 'اللانهائي', gl_how: 'إزاي تلعب', gl_levels: 'المراحل', gl_back: 'رجوع',
    gl_start: 'ابدأ الاختراق', gl_resume: 'كمّل', gl_restart: 'من الأول', gl_menu: 'القائمة الرئيسية', gl_next: 'المرحلة الجاية',
    gl_retry: 'حاول تاني', gl_paused: 'واقف مؤقتًا', gl_trace: 'التتبع',
    gl_win: 'تم الاختراق!', gl_win_sub: 'كل السيرفرات اتفتحت والداتا بقت معاك.',
    gl_lose: 'اتقفشت!', gl_lose_sub: 'التتبع كمل والشركة قطعت عليك الاتصال.',
    gl_time: 'الوقت', gl_best: 'أحسن وقت', gl_trace_lv: 'التتبع', gl_new_best: 'رقم قياسي جديد!',
    gl_lvl: 'مرحلة {n}', gl_stage: 'مرحلة {n}', gl_cores: 'السيرفرات', gl_layer: 'طبقة {n}',
    gl_freeze: 'تجميد', gl_force: 'فك قفل', gl_emp: 'EMP',
    gl_force_pick: 'دوس على قطعة مقفولة عشان تفكها', gl_no_lock: 'مفيش قطع مقفولة هنا',
    gl_breached: 'اتخترق!', gl_fwdown: 'الجدار وقع!', gl_hacked: 'البرج بقى معاك!', gl_hit: '+تتبع',
    gl_mix: 'الداتا اتخبطت!', gl_denied: 'مرفوض!', gl_frozen: 'التتبع متجمد', gl_emped: 'الأبراج طفت',
    gl_unlocked: 'اتفك!', gl_locked: 'مقفولة', gl_down: 'البرج وقع!',
    gl_corp1: 'نيوتك سيستمز', gl_corp2: 'هيليكس جينوميكس', gl_corp3: 'إيجيس أوربيتال',
    gl_corp1d: 'حماية على قدها… مكان حلو تتعلم فيه.', gl_corp2d: 'أبراج ICE بتلف وبتضرب أي خط شغال.',
    gl_corp3d: 'شبكة بطبقتين… انزل تحت بالـVia.',
    gl_endless_d: 'شبكات عشوائية بتصعب كل مرحلة. هتوصل لحد فين؟',
    gl_best_stage: 'أحسن مرحلة: {n}', gl_score: 'النقط', gl_need_prev: 'خلّص المرحلة اللي قبلها الأول',
    gl_endless_lock: 'بيفتح بعد مرحلة ٣', gl_run_over: 'الرحلة خلصت', gl_stages: 'مراحل اتخترقت',
    gl_sound: 'الصوت', gl_agent: 'العميل: {p}', gl_tap: 'دوس على القطعة عشان تلفها — ودوسة طويلة تلفها عكس',
    gl_stage_clear: 'المرحلة اتخترقت!', gl_next_stage: 'المرحلة الجاية', gl_bonus_ex: 'استغلال زيادة: {p}',
    gl_new_run: 'رحلة جديدة', gl_obj: 'السيرفرات: {n}', gl_alarm: 'إنذار! التتبع ×٣', gl_best_score: 'أحسن نقط',
    gl_layer_sw: 'بدّل الطبقة', gl_trace_time: 'وقت التتبع', gl_exploits: 'الاستغلالات', gl_sec: '{n} ث',
    gl_n1: 'مصافحة', gl_n2: 'تفريعة', gl_n3: 'قناتين', gl_n4: 'حِمل زيادة', gl_n5: 'كارت الدخول', gl_n6: 'قفل تام',
    gl_n7: 'كلب الحراسة', gl_n8: 'الخاين', gl_n9: 'تقسيم الداتا', gl_n10: 'ضرب نار', gl_n11: 'الباندويدث', gl_n12: 'خزنة الجينات',
    gl_n13: 'الطبقة العميقة', gl_n14: 'النفق', gl_n15: 'محطة المدار', gl_n16: 'شبكة المراية', gl_n17: 'الآيس الأسود', gl_n18: 'قلب إيجيس',
    gl_t1: 'دوس على أي قطعة عشان تلفها. وصّل الداتا من المصدر للسيرفر اللي بنفس اللون.',
    gl_t2: 'القطعة اللي على شكل T بتقسم الداتا لاتجاهين… وصّل السيرفرين.',
    gl_t3: 'لونين! أوعى يتقابلوا. الكوبري (+) بيعدّي خط فوق التاني من غير ما يختلطوا.',
    gl_t4: 'الجدار الناري محتاج باندويدث قد الرقم اللي عليه. جمّع مصدرين في خط واحد عشان يتكسر.',
    gl_t5: 'الجدار الملوّن مابيتفتحش غير بداتا من نفس لونه.',
    gl_t6: 'القطع اللي عليها قفل ماتتلفش. استخدم «فك قفل» عليها، و«تجميد» بيوقف التتبع شوية.',
    gl_t7: 'برج ICE بيلف وبيضرب خطه: أي قطعة شغالة فيه بتتلخبط والتتبع بيزيد. وصّل داتا للبرج عشان تهكره.',
    gl_t8: 'الجدار ده محتاج ٣ باندويدث ومعاك ١ بس. اهكر البرج وهو هيضربه بدالك.',
    gl_t9: 'الموزّع (السهم) بيدخّل الداتا من ناحية السهم ويطلّعها من الجنبين… في اتجاه واحد بس.',
    gl_t10: 'برجين! البرج اللي تهكره بيضرب أبراج الشركة والجدران اللي في خطه.',
    gl_t11: 'جمّع ٣ مصادر عشان تكسر الجدار. موجة EMP بتطفي الأبراج ١٠ ثواني.',
    gl_t12: 'الخزنة! كل حاجة اتعلمتها في شبكة واحدة.',
    gl_t13: 'الشبكة دي طبقتين. الـVia بتنزّل الداتا للطبقة التانية وبترجعها.',
    gl_t14: 'لونين بيتقاطعوا؟ نزّل واحد فيهم تحت.',
    gl_t15: 'المصادر ممكن تبقى في أي طبقة… جمّعهم عشان الباندويدث.',
    gl_t16: 'برج في طبقة وجدار في التانية. خلّي الماجنتا تهكر البرج عشان السيان يعدّي.',
    gl_t17: 'تلات ألوان وآيس في كل حتة. ركّز.',
    gl_t18: 'قلب إيجيس. اخترق التلات سيرفرات وخلّصها.',
    gl_h_goal_t: 'المهمة',
    gl_h_goal: 'إنت فيروس ذكاء اصطناعي جوّه شبكة شركة عملاقة. لِف القطع عشان توصّل الداتا من كل مصدر للسيرفر اللي بنفس لونه. السيرفر بيتملي شوية بشوية، ولما يتملي يبقى اتخترق. اخترق كل السيرفرات قبل ما عداد التتبع يكمل.',
    gl_h_ctrl_t: 'التحكم',
    gl_h_ctrl: 'دوسة = لف مع عقارب الساعة. دوسة طويلة أو كليك يمين = لف عكسها.',
    gl_h_keys: 'الكيبورد: الأسهم للتحرك، Space للف، Q للف العكسي، Tab لتبديل الطبقة، 1 و2 و3 للاستغلالات، P أو Esc للإيقاف.',
    gl_h_nodes_t: 'القطع',
    gl_p_I: 'مستقيمة', gl_p_L: 'زاوية', gl_p_T: 'تفريعة', gl_p_X: 'كوبري', gl_p_S: 'موزّع', gl_p_V: 'Via',
    gl_pd_I: 'بتوصّل على طول', gl_pd_L: 'بتلف الخط', gl_pd_T: 'بتقسم أو بتجمّع الداتا', gl_pd_X: 'خطين فوق بعض من غير ما يختلطوا',
    gl_pd_S: 'بيدخّل من ناحية السهم ويطلّع من الجنبين', gl_pd_V: 'بتنزّل الداتا للطبقة التانية',
    gl_h_sec_t: 'الشبكة والحماية',
    gl_o_src: 'مصدر', gl_od_src: 'النقط = الباندويدث بتاعه', gl_o_core: 'سيرفر', gl_od_core: 'وصّله بنفس اللون لحد ما يتملي',
    gl_o_fw: 'جدار ناري', gl_od_fw: 'محتاج باندويدث قد الرقم', gl_o_fwc: 'جدار ملوّن', gl_od_fwc: 'بيتفتح بنفس لونه بس',
    gl_o_tur: 'برج ICE', gl_od_tur: 'بيلخبط الخطوط الشغالة. وصّله داتا تهكره', gl_o_lock: 'قطعة مقفولة', gl_od_lock: 'ماتتلفش غير بـ«فك قفل»',
    gl_h_trace: 'التتبع بيزيد مع الوقت، وبيجري ٣ أضعاف لو لونين اتقابلوا أو لون غلط دخل سيرفر، وبيقفز لما برج يضرب خط شغال.',
    gl_h_ex_t: 'الاستغلالات',
    gl_xd_freeze: 'بيوقف التتبع ٨ ثواني', gl_xd_force: 'بيفك قفل قطعة مقفولة', gl_xd_emp: 'بيطفي كل الأبراج ١٠ ثواني',
  }, {
    gl_logo1: 'GRIDLOCK', gl_logo2: 'HACKER',
    gl_sub: 'You are a rogue AI inside a megacorp network. Breach the cores before the trace finds you.',
    gl_campaign: 'Campaign', gl_endless: 'Endless', gl_how: 'How to play', gl_levels: 'Levels', gl_back: 'Back',
    gl_start: 'Start hack', gl_resume: 'Resume', gl_restart: 'Restart', gl_menu: 'Main menu', gl_next: 'Next level',
    gl_retry: 'Try again', gl_paused: 'Paused', gl_trace: 'TRACE',
    gl_win: 'ACCESS GRANTED', gl_win_sub: 'Every core is breached and the data is yours.',
    gl_lose: 'TRACED', gl_lose_sub: 'The trace completed and the corporation cut your connection.',
    gl_time: 'Time', gl_best: 'Best time', gl_trace_lv: 'Trace', gl_new_best: 'New record!',
    gl_lvl: 'Level {n}', gl_stage: 'Stage {n}', gl_cores: 'Cores', gl_layer: 'Layer {n}',
    gl_freeze: 'Freeze', gl_force: 'Force', gl_emp: 'EMP',
    gl_force_pick: 'Tap a locked node to force it open', gl_no_lock: 'No locked nodes here',
    gl_breached: 'BREACHED', gl_fwdown: 'FIREWALL DOWN', gl_hacked: 'ICE HACKED', gl_hit: '+TRACE',
    gl_mix: 'DATA COLLISION', gl_denied: 'ACCESS DENIED', gl_frozen: 'TRACE FROZEN', gl_emped: 'ICE OFFLINE',
    gl_unlocked: 'UNLOCKED', gl_locked: 'LOCKED', gl_down: 'ICE DOWN',
    gl_corp1: 'NeoTek Systems', gl_corp2: 'Helix Genomics', gl_corp3: 'Aegis Orbital',
    gl_corp1d: 'Entry-level security. A good place to learn the ropes.', gl_corp2d: 'ICE turrets sweep the board and scramble live lines.',
    gl_corp3d: 'A two-layer network. Dive under it with vias.',
    gl_endless_d: 'Random networks that get harder every stage. How deep can you go?',
    gl_best_stage: 'Best stage: {n}', gl_score: 'Score', gl_need_prev: 'Finish the previous level first',
    gl_endless_lock: 'Unlocks after level 3', gl_run_over: 'Run over', gl_stages: 'Stages breached',
    gl_sound: 'Sound', gl_agent: 'Agent: {p}', gl_tap: 'Tap a node to rotate it, long-press to turn it back.',
    gl_stage_clear: 'Stage breached!', gl_next_stage: 'Next stage', gl_bonus_ex: 'Bonus exploit: {p}',
    gl_new_run: 'New run', gl_obj: 'Cores: {n}', gl_alarm: 'ALARM! TRACE ×3', gl_best_score: 'Best score',
    gl_layer_sw: 'Switch layer', gl_trace_time: 'Trace time', gl_exploits: 'Exploits', gl_sec: '{n}s',
    gl_n1: 'Handshake', gl_n2: 'Fork', gl_n3: 'Dual Channel', gl_n4: 'Overload', gl_n5: 'Keycard', gl_n6: 'Lockdown',
    gl_n7: 'Watchdog', gl_n8: 'Turncoat', gl_n9: 'Split Stream', gl_n10: 'Crossfire', gl_n11: 'Bandwidth', gl_n12: 'Gene Vault',
    gl_n13: 'Deep Layer', gl_n14: 'Underpass', gl_n15: 'Orbital Relay', gl_n16: 'Mirror Net', gl_n17: 'Black ICE', gl_n18: 'Aegis Core',
    gl_t1: 'Tap a node to rotate it. Route the data from the source to the core of the same color.',
    gl_t2: 'A T-node splits the stream in two. Feed both cores.',
    gl_t3: 'Two colors! Never let them touch. A bridge (+) lets one line pass over the other.',
    gl_t4: 'Firewalls need the bandwidth shown on them. Merge two sources into one line to overload it.',
    gl_t5: 'A colored firewall only opens for a stream of its own color.',
    gl_t6: 'Locked nodes cannot rotate. Use Force to break a lock, and Freeze to stop the trace for a while.',
    gl_t7: 'An ICE turret sweeps its line: live nodes get scrambled and the trace jumps. Route data into a turret to hack it.',
    gl_t8: 'This firewall needs 3 bandwidth and you only have 1. Hack the turret and it will shoot the firewall for you.',
    gl_t9: 'A splitter takes data in where the arrow starts and sends it out both sides, one way only.',
    gl_t10: 'Two turrets! A hacked turret shoots enemy turrets and firewalls in its line.',
    gl_t11: 'Merge three sources to break the wall. An EMP shuts down every turret for 10 seconds.',
    gl_t12: 'The vault. Everything you have learned, in one network.',
    gl_t13: 'This network has two layers. A via drops the data to the other layer and back.',
    gl_t14: 'Two colors crossing? Send one of them under.',
    gl_t15: 'Sources can sit on either layer. Merge them for bandwidth.',
    gl_t16: 'A turret on one layer, a firewall on the other. Let magenta hack the turret so cyan can pass.',
    gl_t17: 'Three colors and ICE everywhere. Stay sharp.',
    gl_t18: 'The heart of Aegis. Breach all three cores and end this.',
    gl_h_goal_t: 'Your mission',
    gl_h_goal: 'You are a rogue AI inside a megacorp network. Rotate nodes to route data from each source to the core of the same color. A fed core fills up and is breached. Breach every core before the trace meter fills.',
    gl_h_ctrl_t: 'Controls',
    gl_h_ctrl: 'Tap = rotate clockwise. Long-press or right-click = rotate back.',
    gl_h_keys: 'Keyboard: arrows move, Space rotates, Q rotates back, Tab switches layer, 1, 2 and 3 fire exploits, P or Esc pauses.',
    gl_h_nodes_t: 'Nodes',
    gl_p_I: 'Straight', gl_p_L: 'Corner', gl_p_T: 'T-junction', gl_p_X: 'Bridge', gl_p_S: 'Splitter', gl_p_V: 'Via',
    gl_pd_I: 'Passes data straight on.', gl_pd_L: 'Turns the line.', gl_pd_T: 'Splits or merges streams.', gl_pd_X: 'Two lines cross without mixing.',
    gl_pd_S: 'In at the arrow, out both sides.', gl_pd_V: 'Drops data to the other layer.',
    gl_h_sec_t: 'Network and security',
    gl_o_src: 'Source', gl_od_src: 'Dots show its bandwidth.', gl_o_core: 'Core', gl_od_core: 'Feed it its color until it fills.',
    gl_o_fw: 'Firewall', gl_od_fw: 'Needs the bandwidth shown on it.', gl_o_fwc: 'Keyed firewall', gl_od_fwc: 'Opens for its own color only.',
    gl_o_tur: 'ICE turret', gl_od_tur: 'Scrambles live lines. Feed it data to hack it.', gl_o_lock: 'Locked node', gl_od_lock: 'Only Force can turn it.',
    gl_h_trace: 'The trace rises over time, runs 3× faster while colors mix or a core gets the wrong color, and jumps when ICE hits a live line.',
    gl_h_ex_t: 'Exploits',
    gl_xd_freeze: 'Stops the trace for 8 seconds.', gl_xd_force: 'Unlocks one locked node.', gl_xd_emp: 'Shuts down all turrets for 10 seconds.',
  });

  // ───────────────────────── constants / helpers ─────────────────────────
  const $ = (id) => document.getElementById(id);
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const rotMask = (m, r) => { r = ((r % 4) + 4) % 4; return ((m << r) | (m >> (4 - r))) & 15; };
  const BASE = { I: 5, L: 3, T: 7, S: 11, V: 1, X: 15 };
  const CH = {
    '│': ['I', 0], '─': ['I', 1], '└': ['L', 0], '┌': ['L', 1], '┐': ['L', 2], '┘': ['L', 3],
    '├': ['T', 0], '┬': ['T', 1], '┤': ['T', 2], '┴': ['T', 3], '┼': ['X', 0],
    'v': ['S', 0], '<': ['S', 1], '^': ['S', 2], '>': ['S', 3],
    '╨': ['V', 0], '╞': ['V', 1], '╥': ['V', 2], '╡': ['V', 3],
  };
  const MASKCH = {};
  for (const k in CH) { const [p, r] = CH[k]; if (p === 'I' || p === 'L' || p === 'T') MASKCH[rotMask(BASE[p], r)] = k; }
  MASKCH[15] = '┼';
  const SPLITCH = ['v', '<', '^', '>'];
  const COL = ['#22e6ff', '#ff3dd8', '#9dff3d'];
  const COLN = ['cyan', 'magenta', 'lime'];
  const SEC = '#ff3b4e', SEC2 = '#ff8a2b', HACKC = '#7dfcff';
  const CORPS = [{ n: 'gl_corp1', d: 'gl_corp1d', c: '#22e6ff' }, { n: 'gl_corp2', d: 'gl_corp2d', c: '#c45bff' }, { n: 'gl_corp3', d: 'gl_corp3d', c: '#ffb703' }];
  const LEVELS = window.GL_LEVELS || [];
  const ICONS = ['L', 'T', 'X', 'fw', 'fwc', 'lock', 'tur', 'tur', 'S', 'tur', 'src', 'core', 'V', 'V', 'src', 'tur', 'tur', 'core'];
  const DEF_LEGEND = {
    C: { t: 'src', col: 0, bw: 1 }, M: { t: 'src', col: 1, bw: 1 }, G: { t: 'src', col: 2, bw: 1 },
    c: { t: 'core', col: 0 }, m: { t: 'core', col: 1 }, g: { t: 'core', col: 2 }, '#': { t: 'wall' },
  };
  const FLOW_SPD = 6, CORE_T = 3, FW_T = 1.3, HACK_T = 1.6, FREEZE_T = 8, EMP_T = 10;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const pop4 = (m) => (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1);
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const fmtT = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function hexPath(ctx, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
  function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; }

  // ───────────────────────── save ─────────────────────────
  const SAVE = { v: 1, unlocked: 0, stars: {}, best: {}, endless: { stage: 0, score: 0 }, mute: false };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && typeof s === 'object') Object.assign(SAVE, s); } catch (e) {}
  if (!SAVE.endless) SAVE.endless = { stage: 0, score: 0 };
  function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {} }

  // ───────────────────────── audio ─────────────────────────
  const AU = {
    ctx: null, master: null, mus: null, muted: !!SAVE.mute, step: 0, nextT: 0, timer: 0, chargeN: 0,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        const c = this.ctx = new AC();
        this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.55; this.master.connect(c.destination);
        const len = c.sampleRate; const b = this.noiseBuf = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.mus = c.createGain(); this.mus.gain.value = 0.0; this.mus.connect(this.master);
        this.musF = c.createBiquadFilter(); this.musF.type = 'lowpass'; this.musF.frequency.value = 1400; this.musF.connect(this.mus);
        this.nextT = c.currentTime + 0.1;
        this.timer = setInterval(() => this.sched(), 60);
      } catch (e) { this.ctx = null; }
    },
    setMute(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.05); },
    tone(f, dur, type, vol, f2, delay, dest) {
      const c = this.ctx; if (!c || this.muted) return;
      const t0 = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(dest || this.master); o.start(t0); o.stop(t0 + dur + 0.02);
    },
    noise(dur, vol, freq, q, delay, type) {
      const c = this.ctx; if (!c || this.muted) return;
      const t0 = c.currentTime + (delay || 0);
      const s = c.createBufferSource(); s.buffer = this.noiseBuf;
      const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 1500; f.Q.value = q || 1;
      const g = c.createGain(); g.gain.setValueAtTime(vol || 0.1, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
    },
    sfx(n) {
      if (!this.ctx || this.muted || G.mode === 'demo') return;
      switch (n) {
        case 'rot': this.tone(1100, 0.05, 'square', 0.035, 700); this.noise(0.03, 0.05, 4000, 2); break;
        case 'rotb': this.tone(700, 0.05, 'square', 0.035, 1100); this.noise(0.03, 0.05, 3000, 2); break;
        case 'deny': this.tone(140, 0.12, 'square', 0.06, 110); break;
        case 'ui': this.tone(880, 0.05, 'triangle', 0.06, 1320); break;
        case 'link': this.tone(520, 0.12, 'sine', 0.05, 1040); break;
        case 'breach': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.09, null, i * 0.06)); this.noise(0.25, 0.05, 6000, 0.7, 0, 'highpass'); break;
        case 'fwhit': this.noise(0.18, 0.14, 900, 1.2); this.tone(160, 0.2, 'sawtooth', 0.06, 70); break;
        case 'fwbreak': this.noise(0.5, 0.22, 700, 0.8); this.tone(420, 0.5, 'sawtooth', 0.08, 50); this.tone(90, 0.4, 'sine', 0.15, 40); break;
        case 'charge': if (this.chargeN > 2) break; this.chargeN++; setTimeout(() => this.chargeN--, 1200); this.tone(180, 1.15, 'sawtooth', 0.025, 900); break;
        case 'zap': this.noise(0.22, 0.12, 2500, 0.8); this.tone(1400, 0.2, 'square', 0.05, 120); break;
        case 'hzap': this.noise(0.15, 0.08, 4000, 1.5); this.tone(2000, 0.16, 'triangle', 0.06, 600); break;
        case 'hack': for (let i = 0; i < 6; i++) this.tone(300 + Math.random() * 1500, 0.07, 'square', 0.04, null, i * 0.05); this.tone(660, 0.3, 'triangle', 0.07, 1320, 0.3); break;
        case 'alarm': this.tone(880, 0.12, 'square', 0.05); this.tone(660, 0.12, 'square', 0.05, null, 0.14); break;
        case 'warn': this.tone(440, 0.08, 'sine', 0.06); break;
        case 'freeze': this.tone(1800, 0.6, 'sine', 0.05, 2600); this.tone(1200, 0.6, 'triangle', 0.04, 900, 0.05); this.noise(0.5, 0.05, 8000, 3); break;
        case 'emp': this.tone(90, 0.7, 'sawtooth', 0.12, 30); this.noise(0.6, 0.15, 300, 0.6, 0, 'lowpass'); break;
        case 'force': this.tone(200, 0.15, 'square', 0.08, 90); this.tone(1200, 0.1, 'triangle', 0.06, 1800, 0.08); this.noise(0.1, 0.1, 2000, 1); break;
        case 'win': [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.08, null, i * 0.09)); this.tone(196, 0.9, 'sine', 0.08, null, 0.1); break;
        case 'lose': this.tone(300, 1.1, 'sawtooth', 0.09, 35); this.noise(0.9, 0.15, 500, 0.5, 0.05, 'lowpass'); break;
        case 'start': this.tone(220, 0.25, 'sawtooth', 0.04, 880); this.noise(0.25, 0.05, 3000, 1); break;
      }
    },
    sched() {
      const c = this.ctx; if (!c) return;
      if (this.nextT < c.currentTime - 0.5) this.nextT = c.currentTime + 0.05;
      while (this.nextT < c.currentTime + 0.25) { this.playStep(this.step, this.nextT); this.nextT += 60 / 108 / 4; this.step++; }
      const want = this.muted ? 0 : (G.screen === 'game' ? 0.11 : 0.07);
      this.mus.gain.setTargetAtTime(want, c.currentTime, 0.4);
    },
    playStep(s, t0) {
      const c = this.ctx, bar = (s >> 4) & 3, st = s & 15;
      const roots = [55, 43.65, 65.41, 49]; const chords = [[0, 3, 7, 10], [0, 4, 7, 11], [0, 4, 7, 9], [0, 3, 7, 10]];
      const r = roots[bar], tense = G.screen === 'game' ? clamp(G.trace, 0, 1) : 0.2;
      const note = (f, dur, type, vol) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(this.musF); o.start(t0); o.stop(t0 + dur + 0.05);
      };
      if ([0, 3, 6, 8, 11, 14].includes(st)) note(r * (st === 8 ? 2 : 1), 0.22, 'sawtooth', 0.22);
      if (st % 2 === 0) { const ch = chords[bar]; const n = ch[(st >> 1) % 4] + ((st >> 3) ? 12 : 0); note(r * 4 * Math.pow(2, n / 12), 0.16, 'square', 0.05); }
      if (tense > 0.35 && st % 2 === 1) {
        const sN = c.createBufferSource(); sN.buffer = this.noiseBuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
        const g = c.createGain(); g.gain.setValueAtTime(0.05 * tense, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
        sN.connect(f); f.connect(g); g.connect(this.mus); sN.start(t0, Math.random() * 0.5); sN.stop(t0 + 0.06);
      }
    },
  };

  // ───────────────────────── game state ─────────────────────────
  const G = {
    screen: 'title', mode: 'demo', li: 0, phase: 'brief', paused: false, t: 0,
    time: 0, trace: 0, traceTime: 120, freeze: 0, emp: 0, alarm: false, alarmWhy: '', alarmCool: 0,
    ex: { freeze: 0, force: 0, emp: 0 }, exMode: null, flow: null, E: new Map(), info: new Map(), dirty: true,
    activeL: 0, cursor: { x: 0, y: 0, L: 0, show: false }, hover: null, shake: 0, flash: 0, flashCol: '#fff',
    introT: 0, endT: 0, endShown: false, result: null, run: null, moves: 0, warned: false, hintCell: null, demoT: 0,
  };
  let lv = null;   // the loaded level

  // ───────────────────────── level building ─────────────────────────
  function makeCell(ch, legend, rng) {
    if (ch === '.' || ch === ' ') return null;
    if (ch === '?') { const r = rng(); const p = r < 0.3 ? 'I' : r < 0.7 ? 'L' : 'T'; return { k: 'pc', p, sol: -1, rot: 0, lock: false }; }
    if (CH[ch]) { const [p, r] = CH[ch]; return { k: 'pc', p, sol: r, rot: r, lock: false }; }
    const d = legend[ch]; if (!d) return null;
    if (d.t === 'wall') return { k: 'wall' };
    if (d.t === 'src') return { k: 'src', col: d.col, bw: d.bw || 1 };
    if (d.t === 'core') return { k: 'core', col: d.col, prog: 0, done: false, hit: 0, flash: 0, deny: 0 };
    if (d.t === 'fw') { const [p, r] = CH[d.shape || '─']; return { k: 'fw', p, rot: r, col: d.col === undefined ? -1 : d.col, need: d.need || 1, prog: 0, dmg: 0, broken: false, shake: 0, inBw: 0, inCol: -1 }; }
    if (d.t === 'tur') return { k: 'tur', dir: d.dir || 0, pat: d.pat || 'cw', per: d.per || 4, phase: 'wait', timer: 0, aim: (d.dir || 0) * Math.PI / 2, hacked: false, hack: 0, dead: false, hp: 2, stun: 0, beam: 0, beamLen: 0, beamDir: 0, hcol: 0, hit: 0 };
    return null;
  }
  function buildLevel(def, seed) {
    const maps = def.layers || [def.map];
    const H = maps[0].length, W = [...maps[0][0]].length;
    const rng = mulberry32(seed >>> 0);
    const legend = Object.assign({}, DEF_LEGEND, def.legend || {});
    const L0 = { W, H, NL: maps.length, cells: [], src: [], cores: [], fws: [], turs: [], def, hasLock: false };
    for (let L = 0; L < maps.length; L++) {
      const layer = [];
      for (let y = 0; y < H; y++) {
        const row = [], chars = [...(maps[L][y] || '')];
        for (let x = 0; x < W; x++) { const c = makeCell(chars[x] || '.', legend, rng); if (c) { c.L = L; c.x = x; c.y = y; } row.push(c); }
        layer.push(row);
      }
      L0.cells.push(layer);
    }
    (def.locks || []).forEach(([x, y, L, off]) => { const c = L0.cells[L] && L0.cells[L][y] && L0.cells[L][y][x]; if (c && c.k === 'pc') { c.lock = true; c.lockOff = off || 0; } });
    const same = (p, a, b) => (p === 'S' || p === 'V') ? ((a - b) & 3) === 0 : rotMask(BASE[p], a) === rotMask(BASE[p], b);
    let ti = 0;
    for (let L = 0; L < L0.NL; L++) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = L0.cells[L][y][x]; if (!c) continue;
      if (c.k === 'pc') {
        if (c.lock) { c.rot = (c.sol >= 0 ? c.sol : Math.floor(rng() * 4)) + c.lockOff; L0.hasLock = true; }
        else if (c.p !== 'X') {
          let r = Math.floor(rng() * 4);
          if (c.sol >= 0) { let k = 0; while (same(c.p, r, c.sol) && k++ < 8 && rng() < 0.92) r = Math.floor(rng() * 4); }
          c.rot = r;
        }
        c.vis = c.rot; c.glitch = 0; c.deny = 0; c.pop = 0;
      } else if (c.k === 'src') L0.src.push(c);
      else if (c.k === 'core') L0.cores.push(c);
      else if (c.k === 'fw') L0.fws.push(c);
      else if (c.k === 'tur') { c.timer = -1.6 - (ti++) * 0.9; L0.turs.push(c); }
    }
    return L0;
  }

  // ───────────────────────── endless generator ─────────────────────────
  function genEndless(stage, seed) {
    for (let a = 0; a < 120; a++) { const d = tryGen(stage, (seed + a * 7919) >>> 0); if (d) return d; }
    return { map: ['?.?.?', 'C─┬─c', '?.│.?', '?.└─c'], trace: 90, endless: true };
  }
  function tryGen(stage, seed) {
    const R = mulberry32(seed), ri = (n) => Math.floor(R() * n);
    const W = Math.min(8, 5 + ((stage + 1) >> 1)), H = Math.min(9, 5 + (stage >> 1) + (stage > 6 ? 1 : 0));
    const nc = stage <= 1 ? 1 : stage <= 3 ? 2 : stage <= 6 ? 2 + (R() < 0.45 ? 1 : 0) : 3;
    const occ = []; for (let y = 0; y < H; y++) occ.push(new Array(W).fill(null));
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const hubs = [];
    const nearHub = (x, y) => hubs.some((h) => Math.abs(h.x - x) + Math.abs(h.y - y) <= 1);
    const place = (from) => {
      for (let k = 0; k < 300; k++) {
        const x = ri(W), y = ri(H);
        if (occ[y][x] || nearHub(x, y)) continue;
        if (from && Math.abs(from.x - x) + Math.abs(from.y - y) < 3 + (stage > 4 ? 1 : 0)) continue;
        return { x, y };
      }
      return null;
    };
    const srcs = [], cores = [];
    for (let c = 0; c < nc; c++) {
      const p = place(); if (!p) return null;
      const s = { k: 'src', x: p.x, y: p.y, col: c, bw: stage >= 3 && R() < 0.3 ? 2 : 1 }; occ[p.y][p.x] = s; hubs.push(s); srcs.push(s);
      const n = (stage >= 4 && R() < 0.5) || (nc === 1 && stage >= 1) ? 2 : 1;
      for (let j = 0; j < n; j++) { const q = place(s); if (!q) return null; const co = { k: 'core', x: q.x, y: q.y, col: c }; occ[q.y][q.x] = co; hubs.push(co); cores.push(co); }
    }
    const wgt = []; for (let y = 0; y < H; y++) { const r = []; for (let x = 0; x < W; x++) r.push(1 + R() * 4); wgt.push(r); }
    const dirTo = (a, b) => { for (let d = 0; d < 4; d++) if (a.x + DX[d] === b.x && a.y + DY[d] === b.y) return 1 << d; return 0; };
    function route(from, col, isTarget) {
      const key = (x, y) => y * W + x, best = new Map(), prev = new Map(), done = new Set(), open = [];
      const push = (x, y, cost, pv) => { const k = key(x, y); if (best.has(k) && best.get(k) <= cost) return; best.set(k, cost); prev.set(k, pv); open.push([cost, x, y]); };
      for (let d = 0; d < 4; d++) { const x = from.x + DX[d], y = from.y + DY[d]; if (inb(x, y) && !occ[y][x]) push(x, y, wgt[y][x], { x: from.x, y: from.y, over: null }); }
      while (open.length) {
        let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
        const [cost, x, y] = open.splice(bi, 1)[0], k = key(x, y);
        if (done.has(k)) continue; done.add(k);
        const pv = prev.get(k);
        for (let d = 0; d < 4; d++) {
          const ax = x + DX[d], ay = y + DY[d]; if (!inb(ax, ay) || (pv.x === ax && pv.y === ay)) continue;
          const o = occ[ay][ax];
          if (o && isTarget(o) && !(ax === from.x && ay === from.y)) {
            const cells = []; let cx = x, cy = y, g = 0;
            while (g++ < 400) { cells.push({ x: cx, y: cy }); const p = prev.get(key(cx, cy)); if (p.over) cells.push({ x: p.over.x, y: p.over.y, cross: true }); if (p.x === from.x && p.y === from.y) break; cx = p.x; cy = p.y; }
            return { cells: cells.reverse(), attach: { x: ax, y: ay } };
          }
        }
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (!inb(nx, ny)) continue;
          const o = occ[ny][nx];
          if (!o) { if (!done.has(key(nx, ny))) push(nx, ny, cost + wgt[ny][nx], { x, y, over: null }); }
          else if (o.k === 'path' && o.col !== col && !o.fw && o.mask === ((d & 1) ? 5 : 10)) {
            const jx = nx + DX[d], jy = ny + DY[d];
            if (inb(jx, jy) && !occ[jy][jx] && !done.has(key(jx, jy))) push(jx, jy, cost + 2 + wgt[jy][jx], { x, y, over: { x: nx, y: ny } });
          }
        }
      }
      return null;
    }
    function apply(rt, from, col) {
      const seq = [from, ...rt.cells, rt.attach];
      for (let i = 1; i < seq.length - 1; i++) {
        const c = seq[i];
        if (c.cross) { const o = occ[c.y][c.x]; o.mask = 15; o.cross = true; continue; }
        occ[c.y][c.x] = { k: 'path', x: c.x, y: c.y, col, mask: dirTo(c, seq[i - 1]) | dirTo(c, seq[i + 1]) };
      }
      const at = occ[rt.attach.y][rt.attach.x];
      if (at.k === 'path') at.mask |= dirTo(rt.attach, seq[seq.length - 2]);
    }
    const okAttach = (col, allow) => (o) => (o.k === 'src' && o.col === col) || (o.k === 'path' && o.col === col && !o.fw && !o.cross && pop4(o.mask) === 2 && (!allow || allow.has(o)));
    const order = cores.slice().sort(() => R() - 0.5);
    for (const co of order) { const rt = route(co, co.col, okAttach(co.col)); if (!rt) return null; apply(rt, co, co.col); }
    const paths = () => { const a = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const o = occ[y][x]; if (o && o.k === 'path') a.push(o); } return a; };
    // the solved tree, walked from a source (optionally stopping at one cell)
    const walk = (s, stop) => {   // follows only this source's color; bridges are crossed straight through
      const seen = new Set([s]), keys = new Set(), q = [[s, -1]], inSide = new Map();
      while (q.length) {
        const [u, ent] = q.shift();
        const dirs = u.k !== 'path' ? [0, 1, 2, 3] : u.cross ? [(ent + 2) & 3] : [0, 1, 2, 3].filter((d) => (u.mask >> d & 1) && d !== ent);
        for (const d of dirs) {
          const x = u.x + DX[d], y = u.y + DY[d]; if (!inb(x, y)) continue;
          const v = occ[y][x], side = (d + 2) & 3;
          if (!v || v.k !== 'path' || !(v.mask >> side & 1) || (!v.cross && v.col !== s.col)) continue;
          const key = v.cross ? (v.y * W + v.x) * 4 + (side & 1) : -1 - (v.y * W + v.x);
          if (keys.has(key)) continue; keys.add(key); seen.add(v);
          if (!v.cross && !inSide.has(v)) inSide.set(v, side);
          if (v !== stop) q.push([v, side]);
        }
      }
      return { seen, inSide };
    };
    const locks = [];
    // hack-a-turret combo: a firewall nobody can overload, and a turret in line with it fed from the source side
    if (stage >= 5 && R() < 0.6) {
      const cand = paths().filter((o) => !o.cross && (o.mask === 5 || o.mask === 10) && !nearHub(o.x, o.y)).sort(() => R() - 0.5);
      for (const f of cand.slice(0, 6)) {
        const src = srcs[f.col]; const side = walk(src, f).seen; side.delete(f);
        let placed = false;
        for (let d = 0; d < 4 && !placed; d++) {
          for (let k = 2; k <= 4 && !placed; k++) {
            const x = f.x + DX[d] * k, y = f.y + DY[d] * k; if (!inb(x, y) || occ[y][x] || nearHub(x, y)) continue;
            let clear = true; for (let j = 1; j < k; j++) { const o = occ[f.y + DY[d] * j][f.x + DX[d] * j]; if (o && o.k !== 'path') clear = false; }
            if (!clear) continue;
            const tur = { k: 'tur', x, y, dir: (d + 2) & 3 };
            occ[y][x] = tur;
            const rt = route(tur, f.col, okAttach(f.col, side));
            if (!rt) { occ[y][x] = null; continue; }
            apply(rt, tur, f.col); hubs.push(tur); f.fw = { need: 3 }; tur.combo = true; placed = true;
          }
        }
        if (placed) break;
      }
    }
    // firewalls
    const nFw = stage < 2 ? 0 : Math.min(4, 1 + ((stage - 2) >> 1));
    const fwC = paths().filter((o) => !o.cross && !o.fw && pop4(o.mask) === 2).sort(() => R() - 0.5);
    for (let i = 0; i < nFw && i < fwC.length; i++) { const o = fwC[i]; o.fw = R() < 0.5 && nc > 1 ? { col: o.col } : { need: srcs[o.col].bw }; }
    // splitters where the stream enters a T through its stem
    for (const s of srcs) {
      const { inSide } = walk(s);
      for (const [v, side] of inSide) if (!v.fw && !v.cross && pop4(v.mask) === 3 && stage >= 3 && R() < 0.5) { const missing = [0, 1, 2, 3].find((d) => !(v.mask >> d & 1)); if (side === ((missing + 2) & 3)) v.split = side; }
    }
    // enemy ICE
    const nT = stage >= 3 ? Math.min(3, 1 + Math.floor((stage - 3) / 3)) : 0;
    const legend = {}; let li = 0; const LET = 'ABDEFHIJKNOPQRSTUVWXYZ';
    const letter = (d) => { const ch = LET[li++]; legend[ch] = d; return ch; };
    const pats = ['cw', 'ccw', 'flip', 'cw'], per = Math.max(3.2, 5 - stage * 0.12);
    for (let i = 0; i < nT; i++) { const p = place(); if (!p) break; const t = { k: 'tur', x: p.x, y: p.y, dir: ri(4), pat: pats[ri(4)] }; occ[p.y][p.x] = t; hubs.push(t); }
    // dead chips
    const nWall = ri(2 + Math.floor(W * H / 18));
    for (let i = 0; i < nWall; i++) { const x = ri(W), y = ri(H); if (!occ[y][x]) occ[y][x] = { k: 'wall' }; }
    if (stage >= 4) { const ps = paths().filter((o) => !o.cross && !o.fw && o.split === undefined); for (let i = 0; i < Math.min(3, stage - 3) && ps.length; i++) { const o = ps.splice(ri(ps.length), 1)[0]; locks.push([o.x, o.y, 0, 0]); } }
    const map = [];
    for (let y = 0; y < H; y++) {
      let row = '';
      for (let x = 0; x < W; x++) {
        const o = occ[y][x];
        if (!o) { row += R() < 0.78 ? '?' : '.'; continue; }
        if (o.k === 'wall') row += '#';
        else if (o.k === 'src') row += o.bw > 1 ? letter({ t: 'src', col: o.col, bw: o.bw }) : 'CMG'[o.col];
        else if (o.k === 'core') row += 'cmg'[o.col];
        else if (o.k === 'tur') row += letter({ t: 'tur', dir: o.dir, pat: o.combo ? 'cw' : pats[ri(4)], per: o.combo ? 4.2 : per });
        else if (o.fw) row += letter(Object.assign({ t: 'fw', shape: MASKCH[o.mask] }, o.fw));
        else if (o.split !== undefined) row += SPLITCH[o.split];
        else row += MASKCH[o.mask];
      }
      map.push(row);
    }
    const trace = clamp(62 + cores.length * 11 + nFw * 5 + nT * 6 - stage * 2, 48, 140);
    return { map, legend, locks, trace, endless: true, corp: stage % 3 };
  }

  // ───────────────────────── simulation ─────────────────────────
  const SINK = { sink: true };
  const cellAt = (L, x, y) => (lv && x >= 0 && y >= 0 && x < lv.W && y < lv.H && lv.cells[L]) ? lv.cells[L][y][x] : null;
  const nk = (L, x, y, ch) => (((L * lv.H + y) * lv.W + x) << 1) | ch;
  const ck = (L, x, y) => (L * lv.H + y) * lv.W + x;
  function pieceEnter(p, rot, side) {
    if (p === 'X') return { ch: side & 1, exits: [(side + 2) & 3] };
    if (p === 'S') { const inp = rot & 3; if (side === inp) return { ch: 0, exits: [(inp + 1) & 3, (inp + 3) & 3] }; if (side === ((inp + 1) & 3) || side === ((inp + 3) & 3)) return { ch: 0, exits: [] }; return null; }
    if (p === 'V') return side === (rot & 3) ? { ch: 0, exits: [], link: true } : null;
    const m = rotMask(BASE[p], rot); if (!(m >> side & 1)) return null;
    const ex = []; for (let d = 0; d < 4; d++) if (d !== side && (m >> d & 1)) ex.push(d);
    return { ch: 0, exits: ex };
  }
  function enterCell(c, side) {
    if (!c) return null;
    if (c.k === 'pc') { if (side < 0) return c.p === 'V' ? { ch: 0, exits: [c.rot & 3] } : null; return pieceEnter(c.p, c.rot, side); }
    if (c.k === 'fw') { if (side < 0) return null; if (c.broken) return pieceEnter(c.p, c.rot, side); return (rotMask(BASE[c.p], c.rot) >> side & 1) ? SINK : null; }
    if (c.k === 'src' || c.k === 'core' || c.k === 'tur') return side < 0 ? null : SINK;
    return null;
  }
  function computeFlow() {
    const nodes = new Map(), sinks = new Map(), leaks = new Map();
    lv.src.forEach((s, si) => {
      const seen = new Set(), q = [];
      for (let d = 0; d < 4; d++) q.push(s.L, s.x + DX[d], s.y + DY[d], (d + 2) & 3, -1, 1);
      for (let i = 0; i < q.length; i += 6) {
        const L = q[i], x = q[i + 1], y = q[i + 2], side = q[i + 3], par = q[i + 4], dist = q[i + 5];
        const c = cellAt(L, x, y), r = enterCell(c, side);
        if (!r) { if (par >= 0 && side >= 0) leaks.set(par * 4 + ((side + 2) & 3), { par, d: (side + 2) & 3 }); continue; }
        if (r === SINK) {
          const k = ck(L, x, y); let sk = sinks.get(k);
          if (!sk) { sk = { c, sides: [null, null, null, null] }; sinks.set(k, sk); }
          const sd = sk.sides[side] || (sk.sides[side] = { srcs: new Set(), par });
          sd.srcs.add(si); continue;
        }
        const key = nk(L, x, y, r.ch);
        let n = nodes.get(key);
        if (!n) { n = { key, L, x, y, ch: r.ch, srcs: new Set(), arms: 0, dist, par, entry: side, link: false }; nodes.set(key, n); }
        if (side >= 0) n.arms |= 1 << side; else n.link = true;
        for (const e of r.exits) n.arms |= 1 << e;
        if (r.link) n.link = true;
        const sk2 = key * 2 + (r.exits.length || r.link ? 0 : 1);
        if (seen.has(sk2)) continue;
        seen.add(sk2); n.srcs.add(si);
        if (dist < n.dist) { n.dist = dist; n.par = par; n.entry = side; }
        for (const e of r.exits) q.push(L, x + DX[e], y + DY[e], (e + 2) & 3, key, dist + 1);
        if (r.link && lv.NL > 1) q.push(1 - L, x, y, -1, key, dist + 1);
      }
    });
    const tally = (o) => { const cols = new Set(); let bw = 0; for (const si of o.srcs) { cols.add(lv.src[si].col); bw += lv.src[si].bw; } o.cols = cols; o.bw = bw; o.col = cols.size === 1 ? [...cols][0] : -1; o.mixed = cols.size > 1; };
    for (const n of nodes.values()) tally(n);
    for (const sk of sinks.values()) for (const sd of sk.sides) if (sd) tally(sd);
    const order = [...nodes.values()].sort((a, b) => a.dist - b.dist);
    return { nodes, sinks, leaks, order };
  }
  function rebuildFlow() {
    G.flow = computeFlow(); G.dirty = false;
    for (const n of G.flow.order) G.info.set(n.key, n);
  }
  const ready = (sd) => sd.par < 0 || (G.E.get(sd.par) || 0) >= 1;
  function updateEnergy(dt) {
    const F = G.flow, E = G.E; if (!F) return;
    for (const n of F.order) {
      const pe = n.par < 0 ? 1 : (E.get(n.par) || 0);
      let e = E.get(n.key) || 0;
      if (pe >= 1 && e < 1) e = Math.min(1, e + dt * FLOW_SPD);
      E.set(n.key, e);
    }
    for (const [k, e] of E) if (!F.nodes.has(k)) { const ne = e - dt * FLOW_SPD * 1.6; if (ne <= 0) { E.delete(k); G.info.delete(k); } else E.set(k, ne); }
  }
  function cellLive(c) {
    for (let ch = 0; ch < 2; ch++) { const e = G.E.get(nk(c.L, c.x, c.y, ch)); if (e && e > 0.3 && G.flow && G.flow.nodes.has(nk(c.L, c.x, c.y, ch))) return true; }
    return false;
  }
  function processSinks(dt, demo) {
    const F = G.flow; if (!F) return;
    let alarm = false, why = '', where = null;
    for (const n of F.order) if (n.mixed && (G.E.get(n.key) || 0) >= 1) { alarm = true; why = 'mix'; where = n; break; }
    for (const c of lv.cores) {
      c.flash = Math.max(0, c.flash - dt); c.deny = Math.max(0, c.deny - dt); c.hit = Math.max(0, c.hit - dt);
      if (c.done) continue;
      let good = 0, wrong = false; const sk = F.sinks.get(ck(c.L, c.x, c.y));
      if (sk) for (const sd of sk.sides) { if (!sd || !ready(sd)) continue; if (sd.mixed) { wrong = true; continue; } if (c.col < 0 || sd.col === c.col) good += sd.bw; else wrong = true; }
      c.feeding = good > 0;
      if (good > 0) c.prog += dt * Math.sqrt(good) / CORE_T; else c.prog = Math.max(0, c.prog - dt * 0.12);
      if (wrong) { c.deny = 0.25; if (!alarm) { alarm = true; why = 'denied'; where = c; } }
      if (c.prog >= 1) breach(c);
    }
    for (const f of lv.fws) {
      f.shake = Math.max(0, f.shake - dt);
      if (f.broken) continue;
      let good = false, inBw = 0, inCol = -1; const sk = F.sinks.get(ck(f.L, f.x, f.y));
      if (sk) for (const sd of sk.sides) { if (!sd || !ready(sd) || sd.mixed) continue; if (sd.bw > inBw) { inBw = sd.bw; inCol = sd.col; } if (f.col >= 0 ? sd.col === f.col : sd.bw >= f.need) good = true; }
      f.inBw = inBw; f.inCol = inCol; f.feeding = good;
      if (good) f.prog += dt / FW_T; else f.prog = Math.max(0, f.prog - dt * 0.5);
      if (f.prog + f.dmg >= 1) breakFw(f);
    }
    for (const tr of lv.turs) {
      if (tr.hacked || tr.dead) continue;
      let good = false, col = 0; const sk = F.sinks.get(ck(tr.L, tr.x, tr.y));
      if (sk) for (const sd of sk.sides) if (sd && ready(sd) && !sd.mixed) { good = true; col = sd.col; }
      tr.feeding = good;
      if (good) tr.hack += dt / HACK_T; else tr.hack = Math.max(0, tr.hack - dt * 0.4);
      if (tr.hack >= 1) hackTurret(tr, col);
    }
    for (const s of lv.src) {
      const sk = F.sinks.get(ck(s.L, s.x, s.y));
      if (sk) for (const sd of sk.sides) if (sd && ready(sd) && [...sd.cols].some((c) => c !== s.col)) { if (!alarm) { alarm = true; why = 'mix'; where = s; } }
    }
    if (demo) return;
    G.alarmCool = Math.max(0, G.alarmCool - dt);
    if (alarm && !G.alarm) {
      AU.sfx('alarm');
      if (G.alarmCool <= 0) { G.trace += 0.02; G.alarmCool = 2.5; }
      if (where) floatText(where.L, where.x, where.y, t(why === 'mix' ? 'gl_mix' : 'gl_denied'), SEC, 1.1);
      G.shake = Math.max(G.shake, 4);
    }
    if (alarm && Math.floor(G.t * 1.6) !== Math.floor((G.t - dt) * 1.6)) AU.sfx('alarm');
    G.alarm = alarm; G.alarmWhy = why;
  }
  function rotateCell(L, x, y, dir, byIce) {
    const c = cellAt(L, x, y);
    if (!c || c.k !== 'pc') return false;
    if (c.lock && !byIce) { c.deny = 0.35; AU.sfx('deny'); return false; }
    c.rot += dir; c.pop = 0.12;
    G.E.delete(nk(L, x, y, 0)); G.E.delete(nk(L, x, y, 1)); G.info.delete(nk(L, x, y, 0)); G.info.delete(nk(L, x, y, 1));
    G.dirty = true;
    if (!byIce) { G.moves++; AU.sfx(dir > 0 ? 'rot' : 'rotb'); G.hintCell = null; const p = cellPos(L, x, y); if (p) burst(p.x, p.y, '#9fd8ff', 4, 0.6, 0.25); }
    return true;
  }
  function breach(c) {
    c.done = true; c.prog = 1; c.flash = 1; AU.sfx('breach');
    const p = cellPos(c.L, c.x, c.y); if (p) { burst(p.x, p.y, COL[c.col] || '#fff', 34, 1.6, 0.9); ring(p.x, p.y, COL[c.col] || '#fff'); }
    floatText(c.L, c.x, c.y, t('gl_breached'), COL[c.col] || '#fff', 1.3);
    G.shake = Math.max(G.shake, 5);
    if (G.mode !== 'demo') { updateObjs(); if (lv.cores.every((k) => k.done)) win(); }
  }
  function breakFw(f) {
    f.broken = true; G.dirty = true; AU.sfx('fwbreak');
    const p = cellPos(f.L, f.x, f.y); if (p) { shards(p.x, p.y, f.col >= 0 ? COL[f.col] : SEC2, 26); ring(p.x, p.y, SEC2); }
    floatText(f.L, f.x, f.y, t('gl_fwdown'), SEC2, 1.2);
    G.shake = Math.max(G.shake, 9);
  }
  function hackTurret(tr, col) {
    tr.hacked = true; tr.hcol = col; tr.phase = 'seek'; tr.timer = 0; tr.stun = 0; tr.hack = 1; AU.sfx('hack');
    const p = cellPos(tr.L, tr.x, tr.y); if (p) { burst(p.x, p.y, HACKC, 26, 1.2, 0.8); ring(p.x, p.y, HACKC); }
    floatText(tr.L, tr.x, tr.y, t('gl_hacked'), HACKC, 1.2);
  }
  function beamCells(tr, d) {
    const out = []; let x = tr.x + DX[d], y = tr.y + DY[d];
    while (x >= 0 && y >= 0 && x < lv.W && y < lv.H) { const c = cellAt(tr.L, x, y); if (c && (c.k === 'wall' || c.k === 'tur')) { out.push({ x, y, stop: true }); break; } out.push({ x, y }); x += DX[d]; y += DY[d]; }
    return out;
  }
  const nextDir = (tr) => tr.pat === 'ccw' ? (tr.dir + 3) & 3 : tr.pat === 'flip' ? (tr.dir + 2) & 3 : tr.pat === 'fixed' ? tr.dir : (tr.dir + 1) & 3;
  function fireEnemy(tr) {
    const path = beamCells(tr, tr.dir); let live = false;
    for (const p of path) {
      const c = cellAt(tr.L, p.x, p.y); if (!c) continue;
      if (c.k === 'pc' && !c.lock) { if (cellLive(c)) { rotateCell(tr.L, p.x, p.y, 1, true); c.glitch = 0.7; live = true; } }
      else if (c.k === 'core' && !c.done && c.prog > 0.02) { c.prog = Math.max(0, c.prog - 0.45); c.hit = 0.5; live = true; }
    }
    const last = path[path.length - 1];
    tr.beam = 0.32; tr.beamDir = tr.dir; tr.beamLen = path.length ? (last.stop ? path.length - 0.5 : path.length + 0.5) : 0.5; tr.beamCol = SEC;
    AU.sfx('zap');
    if (live) { G.trace += 0.04; G.shake = Math.max(G.shake, 6); floatText(tr.L, tr.x, tr.y, t('gl_hit'), SEC, 0.9); }
  }
  function findTarget(tr) {
    let best = null;
    for (let d = 0; d < 4; d++) {
      const path = beamCells(tr, d);
      for (let i = 0; i < path.length; i++) {
        const c = cellAt(tr.L, path[i].x, path[i].y); if (!c) continue;
        if ((c.k === 'fw' && !c.broken) || (c.k === 'tur' && !c.hacked && !c.dead)) { if (!best || i < best.i) best = { d, i, c }; break; }
        if (c.k === 'tur' || c.k === 'wall') break;
      }
    }
    return best;
  }
  function fireAlly(tr) {
    const tg = tr.target; tr.target = null;
    if (!tg || (tg.c.k === 'fw' && tg.c.broken) || (tg.c.k === 'tur' && (tg.c.dead || tg.c.hacked))) return;
    tr.beam = 0.3; tr.beamDir = tg.d; tr.beamLen = tg.i + 1; tr.beamCol = HACKC; AU.sfx('hzap');
    const p = cellPos(tg.c.L, tg.c.x, tg.c.y);
    if (tg.c.k === 'fw') { tg.c.dmg += 0.34; tg.c.shake = 0.35; AU.sfx('fwhit'); if (p) burst(p.x, p.y, SEC2, 12, 1, 0.5); if (tg.c.prog + tg.c.dmg >= 1) breakFw(tg.c); }
    else { tg.c.hp--; tg.c.hit = 0.4; if (p) burst(p.x, p.y, HACKC, 12, 1, 0.5); if (tg.c.hp <= 0) { tg.c.dead = true; tg.c.phase = 'dead'; AU.sfx('fwbreak'); if (p) shards(p.x, p.y, SEC, 18); floatText(tg.c.L, tg.c.x, tg.c.y, t('gl_down'), HACKC, 1.1); } }
    G.shake = Math.max(G.shake, 4);
  }
  function updateTurrets(dt) {
    for (const tr of lv.turs) {
      tr.beam = Math.max(0, tr.beam - dt); tr.hit = Math.max(0, tr.hit - dt);
      let da = tr.dir * Math.PI / 2 - tr.aim; da = Math.atan2(Math.sin(da), Math.cos(da)); tr.aim += da * Math.min(1, dt * 9);
      if (tr.dead) { if (Math.random() < dt * 4) { const p = cellPos(tr.L, tr.x, tr.y); if (p) smoke(p.x, p.y); } continue; }
      if (!tr.hacked) {
        if (tr.stun > 0) { tr.stun -= dt; if (tr.phase === 'charge') { tr.phase = 'wait'; tr.timer = 0; } continue; }
        tr.timer += dt;
        if (tr.phase === 'wait' && tr.timer >= tr.per - 1.65) { tr.phase = 'charge'; tr.timer = 0; AU.sfx('charge'); }
        else if (tr.phase === 'charge' && tr.timer >= 1.2) { fireEnemy(tr); tr.phase = 'turn'; tr.timer = 0; }
        else if (tr.phase === 'turn' && tr.timer >= 0.45) { tr.dir = nextDir(tr); tr.phase = 'wait'; tr.timer = 0; }
      } else {
        tr.timer += dt;
        if (tr.phase === 'seek') { if (tr.timer > 0.3) { tr.timer = 0; const tg = findTarget(tr); if (tg) { tr.target = tg; tr.dir = tg.d; tr.phase = 'aim'; } } }
        else if (tr.phase === 'aim' && tr.timer >= 0.45) { tr.phase = 'charge'; tr.timer = 0; }
        else if (tr.phase === 'charge' && tr.timer >= 0.8) { fireAlly(tr); tr.phase = 'cool'; tr.timer = 0; }
        else if (tr.phase === 'cool' && tr.timer >= 0.6) { tr.phase = 'seek'; tr.timer = 0; }
        else if (!['seek', 'aim', 'charge', 'cool'].includes(tr.phase)) { tr.phase = 'seek'; tr.timer = 0; }
      }
    }
  }
  function useExploit(name) {
    if (G.phase !== 'play' || G.paused) return false;
    if (!G.ex[name]) { AU.sfx('deny'); return false; }
    if (name === 'freeze') { G.ex.freeze--; G.freeze = FREEZE_T; AU.sfx('freeze'); G.flash = 0.5; G.flashCol = '#8fe9ff'; toast(t('gl_frozen')); }
    else if (name === 'emp') {
      const tg = lv.turs.filter((x) => !x.hacked && !x.dead); if (!tg.length) { AU.sfx('deny'); return false; }
      G.ex.emp--; G.emp = EMP_T; tg.forEach((x) => { x.stun = EMP_T; }); AU.sfx('emp'); G.flash = 0.6; G.flashCol = '#c9b8ff'; G.shake = Math.max(G.shake, 6); toast(t('gl_emped'));
      tg.forEach((x) => { const p = cellPos(x.L, x.x, x.y); if (p) ring(p.x, p.y, '#b9a8ff'); });
    } else if (name === 'force') {
      if (!anyLocked()) { toast(t('gl_no_lock')); AU.sfx('deny'); return false; }
      G.exMode = G.exMode === 'force' ? null : 'force'; AU.sfx('ui');
    }
    updateBar(); return true;
  }
  function anyLocked() { for (let L = 0; L < lv.NL; L++) for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) { const c = lv.cells[L][y][x]; if (c && c.k === 'pc' && c.lock) return true; } return false; }
  function forceAt(L, x, y) {
    const c = cellAt(L, x, y);
    if (!c || c.k !== 'pc' || !c.lock) { G.exMode = null; updateBar(); return false; }
    c.lock = false; G.ex.force--; G.exMode = null; AU.sfx('force'); c.pop = 0.2;
    const p = cellPos(L, x, y); if (p) { burst(p.x, p.y, '#ffb703', 18, 1, 0.6); ring(p.x, p.y, '#ffb703'); }
    floatText(L, x, y, t('gl_unlocked'), '#ffb703', 1);
    updateBar(); return true;
  }

  // ───────────────────────── level flow ─────────────────────────
  function resetState() {
    G.time = 0; G.trace = 0; G.freeze = 0; G.emp = 0; G.alarm = false; G.alarmCool = 0; G.exMode = null;
    G.flow = null; G.E = new Map(); G.info = new Map(); G.dirty = true; G.activeL = 0; G.shake = 0; G.flash = 0;
    G.introT = 0; G.endT = 0; G.endShown = false; G.result = null; G.moves = 0; G.warned = false; G.paused = false;
    G.cursor = { x: 0, y: 0, L: 0, show: false }; PARTS.length = 0; TEXTS.length = 0;
  }
  function loadDef(def, seed) {
    resetState();
    lv = buildLevel(def, seed);
    calmStart(seed);
    G.traceTime = def.trace || 120;
    layout();
    G.hintCell = null;
    if (G.mode === 'campaign' && G.li === 0) { for (let y = 0; y < lv.H && !G.hintCell; y++) for (let x = 0; x < lv.W; x++) { const c = lv.cells[0][y][x]; if (c && c.k === 'pc' && c.sol >= 0 && rotMask(BASE[c.p], c.rot) !== rotMask(BASE[c.p], c.sol)) { G.hintCell = { L: 0, x, y }; break; } } }
  }
  // the scrambled board must not start in an alarm (colors already touching, a wrong color already in a core)
  function calmStart(seed) {
    const R = mulberry32((seed ^ 0x9e3779b9) >>> 0);
    for (let k = 0; k < 160; k++) {
      const F = computeFlow(), bad = new Map();
      const blame = (key) => {   // the nearest node up the stream that can be turned (bridges and locks can't)
        for (let g = 0; g < 60 && key >= 0; g++) {
          const n = F.nodes.get(key); if (!n) return;
          const c = cellAt(n.L, n.x, n.y);
          if (c && c.k === 'pc' && !c.lock && c.p !== 'X') { if (!bad.has(c) || bad.get(c) > n.dist) bad.set(c, n.dist); return; }
          key = n.par;
        }
      };
      for (const n of F.order) if (n.mixed) blame(n.key);
      for (const sk of F.sinks.values()) {
        const c = sk.c;
        for (const sd of sk.sides) {
          if (!sd) continue;
          const wrong = sd.mixed || (c.k === 'core' && c.col >= 0 && sd.col !== c.col) || (c.k === 'src' && [...sd.cols].some((x) => x !== c.col));
          if (wrong && sd.par >= 0) blame(sd.par);
        }
      }
      if (!bad.size) return;
      const min = Math.min(...bad.values()), cand = [...bad.keys()].filter((c) => bad.get(c) === min);
      const c = cand[Math.floor(R() * cand.length)]; c.rot += 1 + Math.floor(R() * 3); c.vis = c.rot;
      c.calm = (c.calm || 0) + 1;
      if (c.calm > 6 && c.sol < 0) lv.cells[c.L][c.y][c.x] = null;   // a decoy that can't sit quietly there: drop it
    }
  }
  function openBrief(i) {
    G.mode = 'campaign'; G.li = i;
    const def = LEVELS[i];
    loadDef(def, 1000 + i * 7919);
    G.ex = Object.assign({ freeze: 0, force: 0, emp: 0 }, def.ex || {});
    G.phase = 'brief';
    show('brief');
  }
  function beginLevel() {
    AU.init(); AU.sfx('start');
    G.phase = 'intro'; G.introT = 0;
    show('game'); updateBar(); updateObjs();
  }
  function startEndless() {
    G.mode = 'endless';
    G.run = { stage: 1, score: 0, seed: (Math.random() * 1e9) >>> 0 };
    G.ex = { freeze: 1, force: 1, emp: 1 };
    G.run.exAtStart = Object.assign({}, G.ex);
    loadStage();
  }
  function loadStage() {
    const r = G.run, def = genEndless(r.stage, r.seed + r.stage * 104729);
    loadDef(def, r.seed + r.stage);
    G.phase = 'intro'; AU.init(); AU.sfx('start');
    show('game'); updateBar(); updateObjs();
  }
  function startDemo() {
    G.mode = 'demo';
    const def = genEndless(4 + Math.floor(Math.random() * 3), (Math.random() * 1e9) >>> 0);
    loadDef(def, 5);
    solveBoard();
    lv.turs.forEach((x) => { x.stun = 1e9; });
    G.phase = 'play'; G.demoT = 0;
  }
  function win() {
    if (G.phase !== 'play') return;
    G.phase = 'won'; G.endT = 0; G.exMode = null; AU.sfx('win'); G.flash = 0.7; G.flashCol = '#bffcff';
    if (G.mode === 'campaign') {
      const i = G.li, tm = Math.round(G.time * 10) / 10, stars = G.trace <= 0.45 ? 3 : G.trace <= 0.75 ? 2 : 1;
      const pb = SAVE.best[i], newBest = !pb || tm < pb;
      G.result = { win: true, time: tm, trace: G.trace, stars, newBest, prevBest: pb };
      SAVE.stars[i] = Math.max(SAVE.stars[i] || 0, stars);
      if (newBest) SAVE.best[i] = tm;
      SAVE.unlocked = Math.max(SAVE.unlocked || 0, Math.min(i + 1, LEVELS.length - 1));
      if (i === LEVELS.length - 1) SAVE.done = true;
      writeSave();
    } else if (G.mode === 'endless') {
      const r = G.run, gain = 100 + Math.round((1 - G.trace) * 100) + r.stage * 10;
      r.score += gain;
      let bonus = null;
      if (r.stage % 2 === 0) { const k = ['freeze', 'force', 'emp'][Math.floor(Math.random() * 3)]; if (G.ex[k] < 3) { G.ex[k]++; bonus = k; } }
      G.result = { win: true, time: G.time, trace: G.trace, gain, bonus, stage: r.stage, score: r.score };
      if (r.stage > (SAVE.endless.stage || 0)) SAVE.endless.stage = r.stage;
      if (r.score > (SAVE.endless.score || 0)) SAVE.endless.score = r.score;
      writeSave();
    }
  }
  function lose() {
    if (G.phase !== 'play') return;
    G.trace = 1; G.phase = 'lost'; G.endT = 0; G.exMode = null; AU.sfx('lose'); G.shake = 16; G.flash = 0.8; G.flashCol = '#ff3b4e';
    if (G.mode === 'endless') { const r = G.run; G.result = { win: false, stage: r.stage - 1, score: r.score, best: SAVE.endless.score, bestStage: SAVE.endless.stage }; }
    else G.result = { win: false, time: G.time };
  }
  function solveBoard() {
    if (!lv) return;
    const setRot = (c, r) => { if (((c.rot - r) & 3) === 0) return; c.rot = r; c.vis = r; G.E.delete(nk(c.L, c.x, c.y, 0)); G.E.delete(nk(c.L, c.x, c.y, 1)); G.dirty = true; };
    for (let L = 0; L < lv.NL; L++) for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) {
      const c = lv.cells[L][y][x]; if (c && c.k === 'pc' && c.sol >= 0) setRot(c, c.sol);
    }
    const portsTo = (L, x, y, d) => { const c = cellAt(L, x, y); if (!c) return false; if (c.k === 'src' || c.k === 'core' || c.k === 'tur') return true; if (c.k === 'pc') return !!pieceEnter(c.p, c.rot, d); if (c.k === 'fw') return !!(rotMask(BASE[c.p], c.rot) >> d & 1); return false; };
    for (let pass = 0; pass < 2; pass++) for (let L = 0; L < lv.NL; L++) for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) {
      const c = lv.cells[L][y][x]; if (!c || c.k !== 'pc' || c.sol >= 0) continue;
      let best = c.rot, bn = 99;
      for (let r = 0; r < 4; r++) { const m = rotMask(BASE[c.p], r); let n = 0; for (let d = 0; d < 4; d++) if ((m >> d & 1) && portsTo(L, x + DX[d], y + DY[d], (d + 2) & 3)) n++; if (n < bn) { bn = n; best = r; } }
      if (rotMask(BASE[c.p], best) !== rotMask(BASE[c.p], c.rot)) setRot(c, best);
    }
  }

  // ───────────────────────── particles & floating text ─────────────────────────
  const PARTS = [], TEXTS = [];
  function burst(x, y, col, n, spd, life) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (0.3 + Math.random()) * spd * 120; PARTS.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * (0.5 + Math.random() * 0.6), max: life, col, s: 1.5 + Math.random() * 2.5, k: 's' }); } }
  function shards(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 260; PARTS.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.6 + Math.random() * 0.6, max: 1.2, col, s: 3 + Math.random() * 5, k: 'q', r: Math.random() * 6, vr: (Math.random() - 0.5) * 18, g: 300 }); } }
  function ring(x, y, col) { PARTS.push({ x, y, vx: 0, vy: 0, life: 0.6, max: 0.6, col, s: 0, k: 'r' }); }
  function smoke(x, y) { PARTS.push({ x: x + (Math.random() - 0.5) * 10, y, vx: (Math.random() - 0.5) * 10, vy: -25 - Math.random() * 20, life: 1.2, max: 1.2, col: '#5a6070', s: 4 + Math.random() * 4, k: 'm' }); }
  function floatText(L, x, y, txt, col, life) { if (G.mode === 'demo') return; TEXTS.push({ L, cx: x, cy: y, txt, col, life, max: life }); }
  function updateParts(dt) {
    for (let i = PARTS.length - 1; i >= 0; i--) {
      const p = PARTS[i]; p.life -= dt; if (p.life <= 0) { PARTS.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; const f = Math.pow(0.04, dt); p.vx *= f; p.vy *= f; if (p.g) p.vy += p.g * dt; if (p.r !== undefined) p.r += p.vr * dt;
    }
    for (let i = TEXTS.length - 1; i >= 0; i--) { TEXTS[i].life -= dt; if (TEXTS[i].life <= 0) TEXTS.splice(i, 1); }
    if (PARTS.length > 600) PARTS.splice(0, PARTS.length - 600);
  }

  // ───────────────────────── layout ─────────────────────────
  const cv = $('c'), ctx = cv.getContext('2d');
  let VW = 0, VH = 0, DPR = 1, bgCan = null, tileCache = [];
  G.boards = []; G.cs = 40; G.dual = false;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    VW = window.innerWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
    makeBg(); layout();
  }
  function layout() {
    if (!lv) return;
    const hud = $('hud'), bar = $('bar');
    let top = 64, bot = 76;
    if (G.screen === 'game' || G.screen === 'pause' || G.screen === 'end') {
      const hr = hud.getBoundingClientRect(), br = bar.getBoundingClientRect();
      if (hr.height) top = hr.bottom + 10;
      if (br.height) bot = VH - br.top + 12;
    } else { top = 30; bot = 30; }
    const ax = 12, aw = VW - 24, ay = top, ah = Math.max(80, VH - top - bot);
    const W = lv.W, H = lv.H, lab = lv.NL > 1 ? 20 : 0;
    const single = Math.min(aw / W, (ah - lab) / H);
    let cs = single, dual = false, mode = 0;
    if (lv.NL > 1) {
      const side = Math.min((aw - 34) / (2 * W), (ah - lab) / H), stack = Math.min(aw / W, (ah - 2 * lab - 30) / (2 * H));
      const dcs = Math.max(side, stack);
      if (dcs >= 33 || dcs >= single * 0.72) { dual = true; cs = dcs; mode = side >= stack ? 1 : 2; }
    }
    cs = Math.floor(Math.min(cs, 96));
    G.cs = cs; G.dual = dual; G.boards = [];
    const bw = W * cs, bh = H * cs;
    if (!dual) {
      const ox = Math.round(ax + (aw - bw) / 2), oy = Math.round(ay + lab + (ah - lab - bh) / 2);
      G.boards.push({ L: -1, ox, oy });
    } else if (mode === 1) {
      const tw = bw * 2 + 34, ox = Math.round(ax + (aw - tw) / 2), oy = Math.round(ay + lab + (ah - lab - bh) / 2);
      G.boards.push({ L: 0, ox, oy }, { L: 1, ox: ox + bw + 34, oy });
    } else {
      const th = bh * 2 + 2 * lab + 30, ox = Math.round(ax + (aw - bw) / 2), oy = Math.round(ay + (ah - th) / 2) + lab;
      G.boards.push({ L: 0, ox, oy }, { L: 1, ox, oy: oy + bh + lab + 30 });
    }
    tileCache = [];
    for (let L = 0; L < lv.NL; L++) tileCache.push(makeTiles(L));
    const lb = $('bLayer'); if (lb) lb.hidden = !(lv.NL > 1 && !dual) || G.mode === 'demo';
  }
  function boardFor(L) { if (G.dual) return G.boards[L]; const b = G.boards[0]; if (!b) return null; if (L === G.activeL) return b; const o = G.cs * 0.14; return { L, ox: b.ox + o, oy: b.oy + o, ghost: true }; }
  function cellPos(L, x, y) { const b = boardFor(L); if (!b) return null; return { x: b.ox + (x + 0.5) * G.cs, y: b.oy + (y + 0.5) * G.cs }; }
  function pick(px, py) {
    const cs = G.cs;
    if (G.dual) { for (const b of G.boards) { const x = Math.floor((px - b.ox) / cs), y = Math.floor((py - b.oy) / cs); if (x >= 0 && y >= 0 && x < lv.W && y < lv.H) return { L: b.L, x, y }; } return null; }
    const b = G.boards[0]; if (!b) return null; const x = Math.floor((px - b.ox) / cs), y = Math.floor((py - b.oy) / cs);
    return (x >= 0 && y >= 0 && x < lv.W && y < lv.H) ? { L: G.activeL, x, y } : null;
  }

  // ───────────────────────── drawing: background & tiles ─────────────────────────
  function makeBg() {
    bgCan = document.createElement('canvas'); bgCan.width = cv.width; bgCan.height = cv.height;
    const g = bgCan.getContext('2d'); g.scale(DPR, DPR);
    const gr = g.createRadialGradient(VW / 2, VH * 0.45, 0, VW / 2, VH * 0.45, Math.max(VW, VH) * 0.75);
    gr.addColorStop(0, '#0d1530'); gr.addColorStop(0.55, '#0a0f22'); gr.addColorStop(1, '#05070f');
    g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    g.strokeStyle = 'rgba(80,140,255,0.05)'; g.lineWidth = 1;
    for (let x = 0; x < VW; x += 26) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, VH); g.stroke(); }
    for (let y = 0; y < VH; y += 26) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(VW, y + 0.5); g.stroke(); }
    const R = mulberry32(77);
    g.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      let x = Math.round(R() * VW / 26) * 26, y = Math.round(R() * VH / 26) * 26; const col = R() < 0.5 ? '34,230,255' : R() < 0.5 ? '255,61,216' : '255,183,3';
      g.strokeStyle = `rgba(${col},${0.05 + R() * 0.06})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) { const d = Math.floor(R() * 4), l = (1 + Math.floor(R() * 5)) * 26; x += DX[d] * l; y += DY[d] * l; g.lineTo(x, y); }
      g.stroke(); g.fillStyle = `rgba(${col},0.16)`; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
    }
  }
  function tileBase(g, x, y, s, kind) {
    const i = s * 0.05;
    const gr = g.createLinearGradient(x, y, x, y + s);
    gr.addColorStop(0, kind === 'lock' ? '#1a1d2a' : '#121c35'); gr.addColorStop(1, kind === 'lock' ? '#101219' : '#0b1224');
    g.fillStyle = gr; rr(g, x + i, y + i, s - 2 * i, s - 2 * i, s * 0.12); g.fill();
    g.strokeStyle = kind === 'lock' ? '#3a3f52' : '#22335c'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(120,170,255,0.10)';
    const p = s * 0.16, q = s * 0.045; [[p, p], [s - p, p], [p, s - p], [s - p, s - p]].forEach(([a, b]) => g.fillRect(x + a - q / 2, y + b - q / 2, q, q));
  }
  function makeTiles(L) {
    const cs = G.cs, c = document.createElement('canvas');
    c.width = Math.ceil(lv.W * cs * DPR); c.height = Math.ceil(lv.H * cs * DPR);
    const g = c.getContext('2d'); g.scale(DPR, DPR);
    for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) {
      const cell = lv.cells[L][y][x], px = x * cs, py = y * cs;
      g.fillStyle = 'rgba(90,140,255,0.13)'; g.beginPath(); g.arc(px + cs / 2, py + cs / 2, Math.max(1, cs * 0.035), 0, 7); g.fill();
      if (!cell) { g.strokeStyle = 'rgba(70,110,200,0.08)'; g.lineWidth = 1; rr(g, px + cs * 0.1, py + cs * 0.1, cs * 0.8, cs * 0.8, cs * 0.12); g.stroke(); continue; }
      if (cell.k === 'wall') {
        g.fillStyle = '#05070d'; rr(g, px + cs * 0.08, py + cs * 0.08, cs * 0.84, cs * 0.84, cs * 0.1); g.fill();
        g.strokeStyle = '#1a2033'; g.lineWidth = 1; g.stroke();
        g.strokeStyle = '#2a3048'; g.lineWidth = Math.max(1, cs * 0.04);
        for (let k = 0; k < 3; k++) { const o = cs * (0.3 + k * 0.2); [[o, cs * 0.02, o, cs * 0.1], [o, cs * 0.9, o, cs * 0.98], [cs * 0.02, o, cs * 0.1, o], [cs * 0.9, o, cs * 0.98, o]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(px + a, py + b); g.lineTo(px + c2, py + d); g.stroke(); }); }
        g.fillStyle = '#0c0f18'; rr(g, px + cs * 0.24, py + cs * 0.24, cs * 0.52, cs * 0.52, cs * 0.06); g.fill();
        g.strokeStyle = 'rgba(255,59,78,0.25)'; g.lineWidth = Math.max(1, cs * 0.03); g.beginPath(); g.moveTo(px + cs * 0.34, py + cs * 0.34); g.lineTo(px + cs * 0.66, py + cs * 0.66); g.moveTo(px + cs * 0.66, py + cs * 0.34); g.lineTo(px + cs * 0.34, py + cs * 0.66); g.stroke();
        continue;
      }
      tileBase(g, px, py, cs, cell.k === 'pc' && cell.lock ? 'lock' : '');
    }
    return c;
  }

  // ───────────────────────── drawing: pieces ─────────────────────────
  function arms(g, mask, s) { const h = s / 2; g.beginPath(); for (let d = 0; d < 4; d++) if (mask >> d & 1) { g.moveTo(0, 0); g.lineTo(DX[d] * h, DY[d] * h); } g.stroke(); }
  function pieceIdle(g, p, s) {   // in the piece's own rotated frame
    g.lineCap = 'round';
    if (p === 'X') {
      g.strokeStyle = '#060a14'; g.lineWidth = s * 0.3; arms(g, 5, s); g.strokeStyle = '#3a5287'; g.lineWidth = s * 0.12; arms(g, 5, s);
      g.fillStyle = '#121c35'; rr(g, -s * 0.24, -s * 0.2, s * 0.48, s * 0.4, s * 0.08); g.fill();
      g.strokeStyle = '#060a14'; g.lineWidth = s * 0.3; arms(g, 10, s); g.strokeStyle = '#3a5287'; g.lineWidth = s * 0.12; arms(g, 10, s);
      return;
    }
    const m = BASE[p];
    g.strokeStyle = '#060a14'; g.lineWidth = s * 0.3; arms(g, m, s);
    g.strokeStyle = '#3a5287'; g.lineWidth = s * 0.12; arms(g, m, s);
    if (p === 'T' || p === 'L') { g.fillStyle = '#3a5287'; g.beginPath(); g.arc(0, 0, s * 0.085, 0, 7); g.fill(); }
    if (p === 'S') {
      g.fillStyle = '#0a1020'; g.beginPath(); g.arc(0, 0, s * 0.16, 0, 7); g.fill(); g.strokeStyle = '#4c66a0'; g.lineWidth = s * 0.04; g.stroke();
      g.fillStyle = '#8fb4ff'; g.beginPath(); g.moveTo(-s * 0.085, -s * 0.06); g.lineTo(s * 0.085, -s * 0.06); g.lineTo(0, s * 0.08); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-s * 0.07, -s * 0.36); g.lineTo(s * 0.07, -s * 0.36); g.lineTo(0, -s * 0.25); g.closePath(); g.fill();
    }
    if (p === 'V') {
      const gr = g.createRadialGradient(0, 0, s * 0.02, 0, 0, s * 0.22); gr.addColorStop(0, '#000'); gr.addColorStop(0.6, '#0b1120'); gr.addColorStop(1, '#2c3c64');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, s * 0.22, 0, 7); g.fill();
      g.strokeStyle = '#7d93c8'; g.lineWidth = s * 0.045; g.beginPath(); g.arc(0, 0, s * 0.22, 0, 7); g.stroke();
      g.strokeStyle = '#4c5f90'; g.lineWidth = s * 0.025; g.beginPath(); g.arc(0, 0, s * 0.13, 0, 7); g.stroke();
    }
  }
  function flowPath(n, e, s) {   // world-oriented path of a live node, drawn up to energy e
    const h = s / 2, p = new Path2D();
    for (let d = 0; d < 4; d++) {
      if (!(n.arms >> d & 1)) continue;
      if (d === n.entry) { const k = Math.min(1, e * 2); if (k <= 0) continue; p.moveTo(DX[d] * h, DY[d] * h); p.lineTo(DX[d] * h * (1 - k), DY[d] * h * (1 - k)); }
      else { const k = n.entry < 0 ? e : clamp(e * 2 - 1, 0, 1); if (k <= 0) continue; p.moveTo(0, 0); p.lineTo(DX[d] * h * k, DY[d] * h * k); }
    }
    return p;
  }
  function glowStroke(g, path, col, s, strong) {
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = col; g.lineCap = 'round';
    g.globalAlpha = 0.13 * strong; g.lineWidth = s * 0.44; g.stroke(path);
    g.globalAlpha = 0.4 * strong; g.lineWidth = s * 0.2; g.stroke(path);
    g.globalAlpha = 1; g.lineWidth = s * 0.1; g.stroke(path);
    g.strokeStyle = '#ffffff'; g.globalAlpha = 0.75 * strong; g.lineWidth = s * 0.035; g.stroke(path);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function nodeColor(n) {
    if (n.mixed) { const cs = [...n.cols]; return (Math.floor(G.t * 14) % 3 === 0) ? '#ffffff' : COL[cs[Math.floor(G.t * 9) % cs.length]]; }
    return COL[n.col] || '#fff';
  }
  function drawFlow(g, n, e, s) {
    if (e <= 0.001) return;
    const col = nodeColor(n);
    g.save();
    if (n.mixed) g.translate((Math.random() - 0.5) * s * 0.06, (Math.random() - 0.5) * s * 0.06);
    glowStroke(g, flowPath(n, e, s), col, s, n.mixed ? 1.3 : 1);
    if (e >= 1) {   // packets
      const h = s / 2, ph = (G.t * 1.7) % 0.5, sz = s * 0.075;
      g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ffffff';
      for (let d = 0; d < 4; d++) {
        if (!(n.arms >> d & 1) || d === n.entry) continue;
        for (let u = ph; u < 1; u += 0.5) {
          let x, y;
          if (u < 0.5) { if (n.entry < 0) continue; const k = 1 - u * 2; x = DX[n.entry] * h * k; y = DY[n.entry] * h * k; }
          else { const k = (u - 0.5) * 2; x = DX[d] * h * k; y = DY[d] * h * k; }
          g.globalAlpha = 0.9; g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
          g.globalAlpha = 0.25; g.fillStyle = col; g.fillRect(x - sz * 1.4, y - sz * 1.4, sz * 2.8, sz * 2.8); g.fillStyle = '#ffffff';
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    if (n.link && e > 0.2) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 * Math.min(1, e); g.fillStyle = col; g.beginPath(); g.arc(0, 0, s * 0.15, 0, 7); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    g.restore();
  }
  function lockGlyph(g, x, y, s, col) {
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = s * 0.035;
    g.beginPath(); g.arc(x, y - s * 0.05, s * 0.055, Math.PI, 0); g.stroke();
    g.fillRect(x - s * 0.08, y - s * 0.05, s * 0.16, s * 0.12);
  }
  function drawPiece(g, c, s, L, x, y) {
    const rotating = Math.abs(c.vis - c.rot) > 0.03;
    g.save();
    if (c.glitch > 0) g.translate((Math.random() - 0.5) * s * 0.12, (Math.random() - 0.5) * s * 0.12);
    const pop = c.pop > 0 ? 1 + c.pop * 0.6 : 1; if (pop !== 1) g.scale(pop, pop);
    g.save(); g.rotate(c.vis * Math.PI / 2); pieceIdle(g, c.p, s); g.restore();
    if (!rotating) {
      if (c.p === 'X') {
        const n0 = G.info.get(nk(L, x, y, 0)), n1 = G.info.get(nk(L, x, y, 1));
        if (n0) drawFlow(g, n0, G.E.get(n0.key) || 0, s);
        if (n1 && (G.E.get(n1.key) || 0) > 0) { g.fillStyle = '#121c35'; rr(g, -s * 0.24, -s * 0.2, s * 0.48, s * 0.4, s * 0.08); g.fill(); g.strokeStyle = '#060a14'; g.lineWidth = s * 0.3; arms(g, 10, s); g.strokeStyle = '#3a5287'; g.lineWidth = s * 0.12; arms(g, 10, s); drawFlow(g, n1, G.E.get(n1.key) || 0, s); }
      } else { const n = G.info.get(nk(L, x, y, 0)); if (n) drawFlow(g, n, G.E.get(n.key) || 0, s); }
      if (c.p === 'V') { g.strokeStyle = 'rgba(160,190,255,0.5)'; g.lineWidth = s * 0.03; g.beginPath(); g.arc(0, 0, s * 0.22, 0, 7); g.stroke(); }
    }
    if (c.glitch > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,59,78,${0.35 * c.glitch})`; g.fillRect(-s / 2, -s * 0.12, s, s * 0.08); g.fillRect(-s / 2, s * 0.15, s, s * 0.05); g.globalCompositeOperation = 'source-over'; }
    g.restore();
    if (c.lock) {
      const fm = G.exMode === 'force', a = fm ? 0.6 + 0.4 * Math.sin(G.t * 8) : 0.85;
      g.strokeStyle = fm ? `rgba(255,183,3,${a})` : 'rgba(150,160,190,0.55)'; g.lineWidth = Math.max(1.5, s * 0.035);
      g.setLineDash([s * 0.08, s * 0.06]); rr(g, -s * 0.42, -s * 0.42, s * 0.84, s * 0.84, s * 0.1); g.stroke(); g.setLineDash([]);
      lockGlyph(g, s * 0.3, -s * 0.28, s, fm ? '#ffb703' : '#aab3cc');
    }
    if (c.deny > 0) { g.strokeStyle = `rgba(255,59,78,${c.deny * 2.5})`; g.lineWidth = s * 0.06; rr(g, -s * 0.44, -s * 0.44, s * 0.88, s * 0.88, s * 0.12); g.stroke(); }
  }
  function ports(g, mask, s, col, a) { g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = s * 0.07; g.lineCap = 'butt'; for (let d = 0; d < 4; d++) if (mask >> d & 1) { g.beginPath(); g.moveTo(DX[d] * s * 0.36, DY[d] * s * 0.36); g.lineTo(DX[d] * s * 0.5, DY[d] * s * 0.5); g.stroke(); } g.globalAlpha = 1; g.lineCap = 'round'; }
  function drawSource(g, c, s) {
    const col = COL[c.col], pul = 0.5 + 0.5 * Math.sin(G.t * 3 + c.x);
    ports(g, 15, s, col, 0.45);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.6); gr.addColorStop(0, rgba(col, 0.35 + pul * 0.15)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr; g.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    hexPath(g, s * 0.33); g.fillStyle = '#0a1122'; g.fill(); g.strokeStyle = col; g.lineWidth = s * 0.055; g.stroke();
    g.save(); g.rotate(G.t * 0.8); hexPath(g, s * 0.19 + pul * s * 0.02); g.fillStyle = rgba(col, 0.55 + pul * 0.3); g.fill(); g.restore();
    g.fillStyle = '#fff'; const n = c.bw, w = s * 0.07, gap = s * 0.11;
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * gap; g.fillRect(x - w / 2, -w / 2, w, w); }
  }
  function drawCore(g, c, s) {
    const col = COL[c.col] || '#fff';
    ports(g, 15, s, col, c.done ? 0.8 : 0.35);
    if (c.done || c.feeding) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.62); gr.addColorStop(0, rgba(col, c.done ? 0.45 : 0.2 + 0.1 * Math.sin(G.t * 10))); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(-s * 0.62, -s * 0.62, s * 1.24, s * 1.24); }
    rr(g, -s * 0.34, -s * 0.34, s * 0.68, s * 0.68, s * 0.12); g.fillStyle = c.done ? rgba(col, 0.28) : '#0a1122'; g.fill();
    g.strokeStyle = c.hit > 0 || c.deny > 0 ? SEC : rgba(col, 0.85); g.lineWidth = s * 0.05; g.stroke();
    g.strokeStyle = rgba(col, 0.18); g.lineWidth = s * 0.07; g.beginPath(); g.arc(0, 0, s * 0.22, 0, 7); g.stroke();
    if (c.prog > 0) { g.strokeStyle = col; g.lineWidth = s * 0.07; g.beginPath(); g.arc(0, 0, s * 0.22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, c.prog)); g.stroke(); }
    if (c.done) { g.strokeStyle = '#fff'; g.lineWidth = s * 0.06; g.beginPath(); g.moveTo(-s * 0.1, 0); g.lineTo(-s * 0.025, s * 0.08); g.lineTo(s * 0.11, -s * 0.08); g.stroke(); }
    else { g.fillStyle = rgba(col, 0.9); for (let i = 0; i < 3; i++) g.fillRect(-s * 0.09, -s * 0.085 + i * s * 0.065, s * 0.18, s * 0.035); }
    if (c.flash > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = rgba(col, c.flash * 0.6); g.beginPath(); g.arc(0, 0, s * (0.4 + (1 - c.flash) * 0.5), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
  }
  function drawFirewall(g, c, s, L, x, y) {
    const m = rotMask(BASE[c.p], c.rot), col = c.col >= 0 ? COL[c.col] : SEC;
    if (c.broken) {
      g.save(); g.rotate(c.rot * Math.PI / 2); pieceIdle(g, c.p, s); g.restore();
      const n = G.info.get(nk(L, x, y, 0)); if (n) drawFlow(g, n, G.E.get(n.key) || 0, s);
      g.strokeStyle = rgba(c.col >= 0 ? COL[c.col] : SEC2, 0.55); g.lineWidth = s * 0.04;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a * s * 0.42, b * s * 0.2); g.lineTo(a * s * 0.42, b * s * 0.42); g.lineTo(a * s * 0.2, b * s * 0.42); g.stroke(); });
      return;
    }
    const lvl = clamp(c.prog + c.dmg, 0, 1);
    g.save();
    if (c.shake > 0 || c.prog > 0.05) g.translate((Math.random() - 0.5) * s * 0.05 * (c.shake * 3 + lvl), (Math.random() - 0.5) * s * 0.05 * (c.shake * 3 + lvl));
    ports(g, m, s, c.feeding ? '#ffffff' : col, 0.9);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.6); gr.addColorStop(0, rgba(col, 0.18 + lvl * 0.4)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    rr(g, -s * 0.38, -s * 0.38, s * 0.76, s * 0.76, s * 0.08); g.fillStyle = rgba(col, 0.12); g.fill(); g.strokeStyle = col; g.lineWidth = s * 0.05; g.stroke();
    g.save(); rr(g, -s * 0.38, -s * 0.38, s * 0.76, s * 0.76, s * 0.08); g.clip();
    g.strokeStyle = rgba(col, 0.35); g.lineWidth = Math.max(1, s * 0.022);
    for (let r = 0; r < 4; r++) { const yy = -s * 0.38 + r * s * 0.19; g.beginPath(); g.moveTo(-s * 0.4, yy); g.lineTo(s * 0.4, yy); g.stroke(); for (let k = 0; k < 3; k++) { const xx = -s * 0.38 + (k + (r % 2 ? 0.5 : 0)) * s * 0.26; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + s * 0.19); g.stroke(); } }
    if (lvl > 0.05) { g.strokeStyle = `rgba(255,255,255,${0.4 + lvl * 0.5})`; g.lineWidth = s * 0.025; const R = mulberry32(c.x * 31 + c.y * 7); g.beginPath(); for (let k = 0; k < Math.ceil(lvl * 5); k++) { let px = (R() - 0.5) * s * 0.5, py = (R() - 0.5) * s * 0.5; g.moveTo(px, py); for (let j = 0; j < 3; j++) { px += (R() - 0.5) * s * 0.25; py += (R() - 0.5) * s * 0.25; g.lineTo(px, py); } } g.stroke(); }
    g.restore();
    hexPath(g, s * 0.2); g.fillStyle = '#12060a'; g.fill(); g.strokeStyle = col; g.lineWidth = s * 0.035; g.stroke();
    if (c.col >= 0) lockGlyph(g, 0, s * 0.02, s * 1.5, col);
    else {
      g.fillStyle = '#fff'; g.font = `800 ${Math.round(s * 0.22)}px Consolas, Menlo, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(c.need), 0, s * 0.01);
      const w = s * 0.5 / Math.max(1, c.need);
      for (let i = 0; i < c.need; i++) { g.fillStyle = i < c.inBw ? (COL[c.inCol] || '#fff') : 'rgba(255,255,255,0.15)'; g.fillRect(-s * 0.25 + i * w + 1, s * 0.27, w - 2, s * 0.05); }
    }
    g.restore();
  }
  function drawTurret(g, c, s) {
    const col = c.dead ? '#59606f' : c.hacked ? (COL[c.hcol] && HACKC) : SEC;
    ports(g, 15, s, col, c.dead ? 0.2 : 0.35);
    if (!c.dead) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.6); gr.addColorStop(0, rgba(col, c.phase === 'charge' && !c.stun ? 0.25 + 0.25 * Math.sin(G.t * 30) : 0.15)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); }
    g.fillStyle = c.dead ? '#15171d' : c.hacked ? '#061a20' : '#1a070d'; g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.fill();
    g.strokeStyle = col; g.lineWidth = s * 0.045; g.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + G.t * (c.dead ? 0 : c.hacked ? 0.6 : -0.4); g.fillStyle = rgba(col, 0.6); g.fillRect(Math.cos(a) * s * 0.3 - s * 0.02, Math.sin(a) * s * 0.3 - s * 0.02, s * 0.04, s * 0.04); }
    if (!c.hacked && !c.dead && c.hack > 0) { g.strokeStyle = HACKC; g.lineWidth = s * 0.06; g.beginPath(); g.arc(0, 0, s * 0.44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * c.hack); g.stroke(); }
    g.save(); g.rotate(c.aim);
    g.fillStyle = c.dead ? '#2a2d36' : '#2c3550'; g.fillRect(-s * 0.06, -s * 0.46, s * 0.12, s * 0.3);
    g.fillStyle = col; g.fillRect(-s * 0.06, -s * 0.48, s * 0.12, s * 0.06);
    g.beginPath(); g.arc(0, 0, s * 0.19, 0, 7); g.fillStyle = c.dead ? '#1d2027' : '#0d1220'; g.fill(); g.strokeStyle = col; g.lineWidth = s * 0.04; g.stroke();
    const eye = c.dead ? 0.1 : (c.stun > 0 ? 0.3 + 0.3 * Math.random() : (c.phase === 'charge' ? 0.6 + 0.4 * Math.sin(G.t * 40) : 0.75));
    g.fillStyle = rgba(c.stun > 0 ? '#b9a8ff' : col, eye); g.beginPath(); g.arc(0, -s * 0.04, s * 0.075, 0, 7); g.fill();
    g.restore();
    if (c.stun > 0 && !c.dead) { g.strokeStyle = 'rgba(185,168,255,0.8)'; g.lineWidth = s * 0.03; g.beginPath(); for (let i = 0; i < 3; i++) { const a = Math.random() * 7, r1 = s * 0.2, r2 = s * 0.45; g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a + 0.3) * (r1 + r2) / 2, Math.sin(a + 0.3) * (r1 + r2) / 2); g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } g.stroke(); }
    if (c.dead) { g.strokeStyle = '#0b0c10'; g.lineWidth = s * 0.04; g.beginPath(); g.moveTo(-s * 0.2, -s * 0.25); g.lineTo(0, -s * 0.05); g.lineTo(-s * 0.08, s * 0.1); g.lineTo(s * 0.15, s * 0.28); g.stroke(); }
    if (c.hit > 0) { g.fillStyle = `rgba(255,255,255,${c.hit})`; g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.fill(); }
  }
  function drawBeams(b) {
    const cs = G.cs, L = b.L;
    for (const tr of lv.turs) {
      if (tr.L !== L || tr.dead) continue;
      const cx = b.ox + (tr.x + 0.5) * cs, cy = b.oy + (tr.y + 0.5) * cs;
      if (tr.phase === 'charge' && !(tr.stun > 0)) {
        const k = clamp(tr.timer / (tr.hacked ? 0.8 : 1.2), 0, 1);
        let len; if (tr.hacked) len = tr.target ? tr.target.i + 1 : 0; else { const p = beamCells(tr, tr.dir); const last = p[p.length - 1]; len = p.length ? (last.stop ? p.length - 0.5 : p.length + 0.5) : 0.5; }
        const col = tr.hacked ? HACKC : SEC, ex = cx + DX[tr.dir] * len * cs, ey = cy + DY[tr.dir] * len * cs;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = col; ctx.globalAlpha = 0.15 + k * 0.35 + (Math.random() < 0.2 ? 0.2 : 0); ctx.lineWidth = cs * (0.06 + k * 0.5);
        ctx.setLineDash([cs * 0.18, cs * 0.12]); ctx.lineDashOffset = -G.t * cs * 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 0.06 + k * 0.1; ctx.lineWidth = cs * 0.9; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.restore();
      }
      if (tr.beam > 0) {
        const k = tr.beam / 0.32, len = tr.beamLen, ex = cx + DX[tr.beamDir] * len * cs, ey = cy + DY[tr.beamDir] * len * cs;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        ctx.strokeStyle = tr.beamCol; ctx.globalAlpha = 0.35 * k; ctx.lineWidth = cs * 0.7 * k; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = 0.9 * k; ctx.lineWidth = cs * 0.16 * k; ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = cs * 0.05 * k; ctx.stroke();
        ctx.restore();
      }
    }
  }
  function drawCellAt(g, c, cx, cy, s, L, x, y) {
    g.save(); g.translate(cx, cy);
    if (c.k === 'pc') drawPiece(g, c, s, L, x, y);
    else if (c.k === 'src') drawSource(g, c, s);
    else if (c.k === 'core') drawCore(g, c, s);
    else if (c.k === 'fw') drawFirewall(g, c, s, L, x, y);
    else if (c.k === 'tur') drawTurret(g, c, s);
    g.restore();
  }
  function drawBoard(b, alpha) {
    const L = b.L, cs = G.cs, W = lv.W * cs, H = lv.H * cs, corp = CORPS[(lv.def.corp || 0) % 3];
    const acc = G.mode === 'endless' ? `hsl(${(G.run.stage * 47 + 180) % 360},90%,62%)` : corp.c;
    ctx.save(); ctx.globalAlpha = alpha;
    if (!b.ghost) {
      ctx.fillStyle = 'rgba(4,7,16,0.82)'; rr(ctx, b.ox - 8, b.oy - 8, W + 16, H + 16, 12); ctx.fill();
      ctx.strokeStyle = acc; ctx.globalAlpha = alpha * 0.35; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = alpha;
      ctx.strokeStyle = acc; ctx.lineWidth = 3; const k = Math.min(26, cs * 0.6);
      [[b.ox - 8, b.oy - 8, 1, 1], [b.ox + W + 8, b.oy - 8, -1, 1], [b.ox - 8, b.oy + H + 8, 1, -1], [b.ox + W + 8, b.oy + H + 8, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x + sx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * k); ctx.stroke(); });
    }
    if (tileCache[L]) ctx.drawImage(tileCache[L], b.ox, b.oy, W, H);
    ctx.lineCap = 'round';
    for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) { const c = lv.cells[L][y][x]; if (c && c.k !== 'wall') drawCellAt(ctx, c, b.ox + (x + 0.5) * cs, b.oy + (y + 0.5) * cs, cs, L, x, y); }
    if (!b.ghost) {
      // data leaking out of open ends
      if (G.flow) for (const lk of G.flow.leaks.values()) {
        const n = G.flow.nodes.get(lk.par); if (!n || n.L !== L || (G.E.get(lk.par) || 0) < 1 || Math.random() > 0.25) continue;
        const px = b.ox + (n.x + 0.5 + DX[lk.d] * 0.5) * cs, py = b.oy + (n.y + 0.5 + DY[lk.d] * 0.5) * cs;
        PARTS.push({ x: px, y: py, vx: DX[lk.d] * 60 + (Math.random() - 0.5) * 60, vy: DY[lk.d] * 60 + (Math.random() - 0.5) * 60, life: 0.35, max: 0.35, col: nodeColor(n), s: 1.5, k: 's' });
      }
      drawBeams(b);
      if (lv.NL > 1) { ctx.fillStyle = acc; ctx.font = `700 ${G.dual ? 12 : 13}px Consolas, Menlo, monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText((getLang() === 'ar' ? '' : '') + t('gl_layer', { n: L + 1 }).toUpperCase(), b.ox - 4, b.oy - 11); }
      const h = G.hover, cu = G.cursor;
      if (h && h.L === L && G.phase === 'play') { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; rr(ctx, b.ox + h.x * cs + 3, b.oy + h.y * cs + 3, cs - 6, cs - 6, cs * 0.12); ctx.stroke(); }
      if (cu.show && cu.L === L && G.phase === 'play') { ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 2.5; rr(ctx, b.ox + cu.x * cs + 2, b.oy + cu.y * cs + 2, cs - 4, cs - 4, cs * 0.12); ctx.stroke(); }
      if (G.hintCell && G.hintCell.L === L && G.phase === 'play' && G.moves === 0) {
        const hx = b.ox + (G.hintCell.x + 0.5) * cs, hy = b.oy + (G.hintCell.y + 0.5) * cs, k = (G.t * 1.3) % 1;
        ctx.strokeStyle = `rgba(255,183,3,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy, cs * (0.3 + k * 0.35), 0, 7); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawBoards() {
    if (!lv || !G.boards.length) return;
    let intro = 1; if (G.phase === 'intro') intro = clamp(G.introT / 0.6, 0, 1);
    ctx.save();
    if (G.shake > 0.3) ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
    const demo = G.mode === 'demo';
    if (G.dual) G.boards.forEach((b) => drawBoard(b, intro * (demo ? 0.5 : 1)));
    else {
      if (lv.NL > 1) drawBoard(boardFor(1 - G.activeL), 0.2 * intro);
      drawBoard(Object.assign({}, G.boards[0], { L: G.activeL }), intro * (demo ? 0.5 : 1));
    }
    if (G.phase === 'intro') {
      const b = G.boards[0], top = Math.min(...G.boards.map((x) => x.oy)), bot = Math.max(...G.boards.map((x) => x.oy)) + lv.H * G.cs, y = top + (bot - top) * clamp(G.introT / 0.8, 0, 1);
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(125,252,255,0.5)'; ctx.fillRect(0, y - 2, VW, 3); ctx.fillStyle = 'rgba(125,252,255,0.08)'; ctx.fillRect(0, y - 30, VW, 30); ctx.globalCompositeOperation = 'source-over';
      void b;
    }
    ctx.restore();
  }
  function drawFx() {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of PARTS) {
      const a = clamp(p.life / p.max, 0, 1);
      if (p.k === 'r') { ctx.strokeStyle = p.col; ctx.globalAlpha = a; ctx.lineWidth = 3 * a + 1; ctx.beginPath(); ctx.arc(p.x, p.y, G.cs * (0.4 + (1 - a) * 1.4), 0, 7); ctx.stroke(); continue; }
      if (p.k === 'm') { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = p.col; ctx.globalAlpha = a * 0.4; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (2 - a), 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; continue; }
      ctx.fillStyle = p.col; ctx.globalAlpha = a;
      if (p.k === 'q') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore(); }
      else ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }
    ctx.restore();
    ctx.save();
    for (const tx of TEXTS) {
      const p = cellPos(tx.L, tx.cx, tx.cy); if (!p) continue;
      const k = 1 - tx.life / tx.max, a = clamp(tx.life / tx.max * 2, 0, 1);
      ctx.globalAlpha = a; ctx.font = `800 ${Math.round(clamp(G.cs * 0.3, 12, 20))}px ${getLang() === 'ar' ? 'Segoe UI, Tahoma, Arial' : 'Consolas, Menlo, monospace'}, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = getLang() === 'ar' ? 'rtl' : 'ltr'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      const y = p.y - G.cs * 0.4 - k * G.cs * 0.8; ctx.strokeText(tx.txt, p.x, y); ctx.fillStyle = tx.col; ctx.fillText(tx.txt, p.x, y);
    }
    ctx.restore();
    // alarm vignette, flashes, trace danger
    if (G.mode !== 'demo' && lv && (G.phase === 'play' || G.phase === 'won' || G.phase === 'lost')) {
      const danger = G.alarm ? 0.35 + 0.25 * Math.sin(G.t * 12) : G.trace > 0.75 ? (G.trace - 0.75) * 1.2 * (0.6 + 0.4 * Math.sin(G.t * 6)) : 0;
      if (danger > 0.01) { const gr = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.3, VW / 2, VH / 2, Math.max(VW, VH) * 0.75); gr.addColorStop(0, 'rgba(255,40,60,0)'); gr.addColorStop(1, `rgba(255,40,60,${danger})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }
      if (G.freeze > 0) { const gr = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75); gr.addColorStop(0, 'rgba(120,220,255,0)'); gr.addColorStop(1, `rgba(120,220,255,${0.22 * Math.min(1, G.freeze)})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }
    }
    if (G.flash > 0) { ctx.fillStyle = G.flashCol; ctx.globalAlpha = G.flash * 0.35; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
    if ((G.phase === 'won' || G.phase === 'lost') && G.mode !== 'demo' && !G.endShown) {
      const k = clamp(G.endT / 0.3, 0, 1), txt = G.phase === 'won' ? (G.mode === 'endless' ? t('gl_stage_clear') : t('gl_win')) : t('gl_lose');
      const fs = Math.round(clamp(VW * 0.085, 26, 64));
      ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = getLang() === 'ar' ? 'rtl' : 'ltr';
      ctx.font = `900 ${fs}px ${getLang() === 'ar' ? 'Segoe UI, Tahoma, Arial' : 'Consolas, Menlo, monospace'}, sans-serif`;
      const col = G.phase === 'won' ? '#7dfcff' : '#ff3b4e', j = (Math.random() - 0.5) * (G.phase === 'lost' ? 8 : 3);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, VH / 2 - fs * 0.9, VW, fs * 1.8);
      ctx.fillStyle = '#ff3dd8'; ctx.fillText(txt, VW / 2 + 3 + j, VH / 2); ctx.fillStyle = '#22e6ff'; ctx.fillText(txt, VW / 2 - 3 - j, VH / 2); ctx.fillStyle = col; ctx.fillText(txt, VW / 2, VH / 2);
      ctx.restore();
    }
    // scanlines
    ctx.fillStyle = 'rgba(125,252,255,0.025)'; const sy = (G.t * 60) % VH; ctx.fillRect(0, sy, VW, 2);
  }
  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (bgCan) ctx.drawImage(bgCan, 0, 0, VW, VH); else { ctx.fillStyle = '#070b16'; ctx.fillRect(0, 0, VW, VH); }
    if (lv) drawBoards();
    drawFx();
  }

  // ───────────────────────── main update ─────────────────────────
  function update(dt) {
    G.t += dt;
    updateParts(dt);
    G.shake = Math.max(0, G.shake - dt * 30); G.flash = Math.max(0, G.flash - dt * 1.6);
    if (!lv || G.paused) return;
    const demo = G.mode === 'demo';
    if (G.phase === 'brief') return;
    for (let L = 0; L < lv.NL; L++) for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) {
      const c = lv.cells[L][y][x]; if (!c || c.k !== 'pc') continue;
      if (c.vis !== c.rot) { const d = c.rot - c.vis, st = dt * 11; c.vis = Math.abs(d) <= st ? c.rot : c.vis + Math.sign(d) * st; }
      if (c.glitch > 0) c.glitch = Math.max(0, c.glitch - dt); if (c.deny > 0) c.deny = Math.max(0, c.deny - dt); if (c.pop > 0) c.pop = Math.max(0, c.pop - dt);
    }
    if (G.phase === 'intro') { G.introT += dt; if (G.introT >= 0.9) G.phase = 'play'; }
    if (G.dirty) rebuildFlow();
    updateEnergy(dt);
    if (demo) {
      processSinks(dt, true); updateTurrets(dt);
      G.demoT += dt; if (lv.cores.every((c) => c.done) && G.demoT > 6) startDemo();
      return;
    }
    if (G.phase === 'play') {
      G.time += dt;
      processSinks(dt);
      if (G.phase !== 'play') return;
      updateTurrets(dt);
      if (G.freeze > 0) G.freeze = Math.max(0, G.freeze - dt); else G.trace += dt / G.traceTime * (G.alarm ? 3 : 1);
      if (G.emp > 0) G.emp = Math.max(0, G.emp - dt);
      if (G.trace >= 0.75 && !G.warned) { G.warned = true; AU.sfx('warn'); }
      if (G.trace > 0.75 && Math.floor(G.t) !== Math.floor(G.t - dt)) AU.sfx('warn');
      if (G.trace >= 1) lose();
    } else if (G.phase === 'won' || G.phase === 'lost') {
      G.endT += dt; updateTurrets(dt);
      if (G.endT > 1.6 && !G.endShown) { G.endShown = true; show('end'); }
    }
  }

  // ───────────────────────── HUD / bar ─────────────────────────
  const hud = $('hud'), bar = $('bar');
  let lastHud = '';
  function hudShow(on) { hud.hidden = !on; bar.hidden = !on; }
  function updateHud() {
    if (hud.hidden || !lv) return;
    const pct = Math.min(100, Math.floor(G.trace * 100));
    const key = pct + '|' + Math.floor(G.time) + '|' + (G.alarm ? 1 : 0) + '|' + Math.ceil(G.freeze) + '|' + getLang();
    if (key === lastHud) return; lastHud = key;
    $('hTb').style.width = (G.trace * 100).toFixed(1) + '%';
    $('hTp').textContent = pct + '%';
    $('hTime').textContent = fmtT(G.time);
    const tr = $('hT'); tr.classList.toggle('alarm', G.alarm); tr.classList.toggle('danger', G.trace > 0.75); tr.classList.toggle('frozen', G.freeze > 0);
    $('hTl').textContent = G.freeze > 0 ? '❄ ' + Math.ceil(G.freeze) : G.alarm ? '×3' : t('gl_trace');
  }
  function hudLabels() {
    if (!lv) return;
    if (G.mode === 'endless') { $('hLvl').textContent = '∞ ' + G.run.stage; $('hName').textContent = t('gl_stage', { n: G.run.stage }); }
    else { const d = LEVELS[G.li]; const ci = d.corp, idx = LEVELS.slice(0, G.li).filter((x) => x.corp === ci).length; $('hLvl').textContent = (ci + 1) + '-' + (idx + 1); $('hName').textContent = t(d.name); }
    $('bSnd').textContent = AU.muted ? '🔇' : '🔊';
    $('bLayer').querySelector('span').textContent = t('gl_layer', { n: G.activeL + 1 });
    lastHud = '';
    updateBar();
  }
  function updateBar() {
    if (!lv) return;
    const xs = $('xs'); let any = false;
    xs.querySelectorAll('.xb').forEach((b) => {
      const k = b.dataset.x, n = G.ex[k] || 0, show = G.mode === 'endless' || (lv.def.ex && lv.def.ex[k] > 0);
      b.hidden = !show; if (show) any = true;
      b.disabled = n <= 0; b.querySelector('b').textContent = '×' + n; b.querySelector('span').textContent = t('gl_' + k);
      b.classList.toggle('on', G.exMode === k);
    });
    xs.hidden = !any;
    const h = $('hint');
    let msg = '';
    if (G.exMode === 'force') msg = t('gl_force_pick');
    else if (G.mode === 'campaign' && G.li === 0 && G.moves < 3 && G.phase !== 'won') msg = t('gl_tap');
    h.textContent = msg; h.hidden = !msg || hud.hidden;
  }
  function updateObjs() {
    if (!lv) return;
    const o = $('objs'); const done = lv.cores.filter((c) => c.done).length;
    o.innerHTML = lv.cores.map((c) => `<i class="${c.done ? 'd' : ''}" style="--c:${COL[c.col] || '#fff'}"></i>`).join('') + `<b>${done}/${lv.cores.length}</b>`;
  }

  // ───────────────────────── overlay screens ─────────────────────────
  const ov = $('ov');
  let howBack = 'title';
  function show(name) {
    const prev = G.screen;
    G.screen = name;
    if (name === 'game') { ov.hidden = true; ov.innerHTML = ''; hudShow(true); hudLabels(); requestAnimationFrame(layout); return; }
    hudShow(['pause', 'end'].includes(name) && !!lv && G.mode !== 'demo');
    if (prev !== name) ov.scrollTop = 0;
    renderOv();
    if (['pause', 'end', 'brief'].includes(name)) requestAnimationFrame(layout);
  }
  const btn = (a, label, cls, extra) => `<button class="btn ${cls || ''}" data-a="${a}" ${extra || ''}>${label}</button>`;
  const miniRow = () => `<div class="mini">
      <button class="ib wide" data-a="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button>
      <button class="ib" data-a="snd" title="${esc(t('gl_sound'))}">${AU.muted ? '🔇' : '🔊'}</button></div>`;   // 🏠 + 💬 now come from the data-m3pop bar
  function totalStars() { let s = 0; for (const k in SAVE.stars) s += SAVE.stars[k] || 0; return s; }
  function renderOv() {
    const n = G.screen; let h = '';
    const name = window.Auth && Auth.name && Auth.name();
    if (n === 'title') {
      const elock = (SAVE.unlocked || 0) < 3;
      h = `<div class="panel ttl">
        <div class="logo"><span class="g" data-t="${esc(t('gl_logo1'))}">${esc(t('gl_logo1'))}</span><span class="h">${esc(t('gl_logo2'))}</span></div>
        <p class="sub">${esc(t('gl_sub'))}</p>
        ${name ? `<div class="agent">${esc(t('gl_agent', { p: name }))}</div>` : ''}
        <div class="col">
          ${btn('campaign', '▶ ' + esc(t('gl_campaign')), 'big')}
          ${btn('endless', '∞ ' + esc(t('gl_endless')) + (elock ? ` <small>🔒 ${esc(t('gl_endless_lock'))}</small>` : SAVE.endless.stage ? ` <small>${esc(t('gl_best_stage', { n: SAVE.endless.stage }))}</small>` : ''), 'sec big', elock ? 'data-locked="1"' : '')}
          ${btn('how', '? ' + esc(t('gl_how')), 'sec')}
        </div>${miniRow()}</div>`;
    } else if (n === 'levels') {
      let cards = '';
      CORPS.forEach((cp, ci) => {
        let tiles = '';
        LEVELS.forEach((d, i) => {
          if (d.corp !== ci) return;
          const lock = i > (SAVE.unlocked || 0), st = SAVE.stars[i] || 0, best = SAVE.best[i];
          tiles += `<button class="lt ${lock ? 'lk' : ''} ${st ? 'ok' : ''}" data-a="lvl" data-i="${i}">
            <b>${lock ? '🔒' : i + 1}</b><span>${esc(t(d.name))}</span><em>${'★'.repeat(st)}<u>${'★'.repeat(3 - st)}</u></em>${best ? `<small>${fmtT(best)}</small>` : ''}</button>`;
        });
        cards += `<div class="corp" style="--cc:${cp.c}"><div class="ch"><b>${esc(t(cp.n))}</b><small>${esc(t(cp.d))}</small></div><div class="lts">${tiles}</div></div>`;
      });
      const elock = (SAVE.unlocked || 0) < 3;
      cards += `<div class="corp end" style="--cc:#ffb703"><div class="ch"><b>∞ ${esc(t('gl_endless'))}</b><small>${esc(t('gl_endless_d'))}</small></div>
        <div class="erow"><span>${esc(t('gl_best_stage', { n: SAVE.endless.stage || 0 }))} · ${esc(t('gl_best_score'))}: ${SAVE.endless.score || 0}</span>${btn('endless', elock ? '🔒 ' + esc(t('gl_endless_lock')) : '▶ ' + esc(t('gl_endless')), elock ? 'sec' : '', elock ? 'data-locked="1"' : '')}</div></div>`;
      h = `<div class="panel wide"><div class="hdr"><button class="ib" data-a="title">←</button><h2>${esc(t('gl_levels'))}</h2><span class="sp"></span><span class="stars">★ ${totalStars()}/${LEVELS.length * 3}</span></div>${cards}</div>`;
    } else if (n === 'brief') {
      const d = LEVELS[G.li], cp = CORPS[d.corp];
      const exs = ['freeze', 'force', 'emp'].filter((k) => d.ex && d.ex[k]).map((k) => `<span class="chip">${{ freeze: '❄', force: '🔓', emp: '⚡' }[k]} ${esc(t('gl_' + k))} ×${d.ex[k]}</span>`).join('');
      h = `<div class="panel brief" style="--cc:${cp.c}">
        <div class="ctag">${esc(t(cp.n))} · ${esc(t('gl_lvl', { n: G.li + 1 }))}</div>
        <h2>${esc(t(d.name))}</h2>
        <div class="tip"><canvas data-icon="${ICONS[G.li] || 'core'}" width="64" height="64"></canvas><p>${esc(t(d.tip))}</p></div>
        <div class="chips"><span class="chip">◎ ${esc(t('gl_obj', { n: lv.cores.length }))}</span><span class="chip">⏱ ${esc(t('gl_trace_time'))}: ${fmtT(d.trace)}</span>${exs}${SAVE.best[G.li] ? `<span class="chip">🏆 ${fmtT(SAVE.best[G.li])}</span>` : ''}</div>
        <div class="row">${btn('levels', esc(t('gl_back')), 'sec')}${btn('start', '▶ ' + esc(t('gl_start')), 'big')}</div></div>`;
    } else if (n === 'how') {
      const pcs = ['I', 'L', 'T', 'X', 'S', 'V'].map((p) => `<div class="ic"><canvas data-icon="${p}" width="52" height="52"></canvas><div><b>${esc(t('gl_p_' + p))}</b><small>${esc(t('gl_pd_' + p))}</small></div></div>`).join('');
      const obs = ['src', 'core', 'fw', 'fwc', 'tur', 'lock'].map((p) => `<div class="ic"><canvas data-icon="${p}" width="52" height="52"></canvas><div><b>${esc(t('gl_o_' + p))}</b><small>${esc(t('gl_od_' + p))}</small></div></div>`).join('');
      h = `<div class="panel wide how"><div class="hdr"><button class="ib" data-a="howback">←</button><h2>${esc(t('gl_how'))}</h2></div>
        <h3>${esc(t('gl_h_goal_t'))}</h3><p>${esc(t('gl_h_goal'))}</p>
        <h3>${esc(t('gl_h_ctrl_t'))}</h3><p>${esc(t('gl_h_ctrl'))}</p><p class="mut">${esc(t('gl_h_keys'))}</p>
        <h3>${esc(t('gl_h_nodes_t'))}</h3><div class="ics">${pcs}</div>
        <h3>${esc(t('gl_h_sec_t'))}</h3><div class="ics">${obs}</div><p class="mut">${esc(t('gl_h_trace'))}</p>
        <h3>${esc(t('gl_h_ex_t'))}</h3><div class="exs"><div>❄ <b>${esc(t('gl_freeze'))}</b> <small>${esc(t('gl_xd_freeze'))}</small></div><div>🔓 <b>${esc(t('gl_force'))}</b> <small>${esc(t('gl_xd_force'))}</small></div><div>⚡ <b>${esc(t('gl_emp'))}</b> <small>${esc(t('gl_xd_emp'))}</small></div></div>
        <div class="row">${btn('howback', esc(t('gl_back')), 'sec')}</div></div>`;
    } else if (n === 'pause') {
      h = `<div class="panel small"><h2>⏸ ${esc(t('gl_paused'))}</h2><div class="col">
        ${btn('resume', '▶ ' + esc(t('gl_resume')), 'big')}${btn('restart', '↻ ' + esc(t('gl_restart')), 'sec')}${btn('how', '? ' + esc(t('gl_how')), 'sec')}
        ${G.mode === 'campaign' ? btn('levels', '☰ ' + esc(t('gl_levels')), 'sec') : ''}${btn('title', '⌂ ' + esc(t('gl_menu')), 'sec')}</div>${miniRow()}</div>`;
    } else if (n === 'end') {
      const r = G.result || {};
      if (G.mode === 'campaign' && r.win) {
        const last = G.li >= LEVELS.length - 1;
        h = `<div class="panel end win"><div class="etl">${esc(t('gl_win'))}</div><p>${esc(t('gl_win_sub'))}</p>
          <div class="stars3">${[0, 1, 2].map((i) => `<i class="${i < r.stars ? 'on' : ''}" style="animation-delay:${0.15 + i * 0.18}s">★</i>`).join('')}</div>
          <div class="stats"><div><small>${esc(t('gl_time'))}</small><b>${fmtT(r.time)}</b></div><div><small>${esc(t('gl_trace_lv'))}</small><b>${Math.floor(r.trace * 100)}%</b></div><div><small>${esc(t('gl_best'))}</small><b>${fmtT(SAVE.best[G.li])}</b></div></div>
          ${r.newBest && r.prevBest ? `<div class="nb">${esc(t('gl_new_best'))}</div>` : ''}
          <div class="row">${btn('levels', '☰', 'sec sq')}${btn('retry', '↻ ' + esc(t('gl_retry')), 'sec')}${last ? btn('title', '⌂ ' + esc(t('gl_menu')), 'big') : btn('next', '▶ ' + esc(t('gl_next')), 'big')}</div></div>`;
      } else if (G.mode === 'campaign') {
        h = `<div class="panel end lose"><div class="etl">${esc(t('gl_lose'))}</div><p>${esc(t('gl_lose_sub'))}</p>
          <div class="stats"><div><small>${esc(t('gl_time'))}</small><b>${fmtT(r.time)}</b></div><div><small>${esc(t('gl_cores'))}</small><b>${lv.cores.filter((c) => c.done).length}/${lv.cores.length}</b></div></div>
          <div class="row">${btn('levels', '☰', 'sec sq')}${btn('retry', '↻ ' + esc(t('gl_retry')), 'big')}</div></div>`;
      } else if (r.win) {
        h = `<div class="panel end win"><div class="etl">${esc(t('gl_stage_clear'))}</div>
          <div class="stats"><div><small>${esc(t('gl_stage', { n: '' }).trim())}</small><b>${r.stage}</b></div><div><small>${esc(t('gl_score'))}</small><b>${r.score}</b></div><div><small>${esc(t('gl_trace_lv'))}</small><b>${Math.floor(r.trace * 100)}%</b></div></div>
          <p class="gain">+${r.gain}</p>${r.bonus ? `<div class="nb">${esc(t('gl_bonus_ex', { p: t('gl_' + r.bonus) }))}</div>` : ''}
          <div class="row">${btn('title', '⌂', 'sec sq')}${btn('nextStage', '▶ ' + esc(t('gl_next_stage')), 'big')}</div></div>`;
      } else {
        h = `<div class="panel end lose"><div class="etl">${esc(t('gl_lose'))}</div><p>${esc(t('gl_run_over'))}</p>
          <div class="stats"><div><small>${esc(t('gl_stages'))}</small><b>${r.stage}</b></div><div><small>${esc(t('gl_score'))}</small><b>${r.score}</b></div><div><small>${esc(t('gl_best_score'))}</small><b>${SAVE.endless.score || 0}</b></div></div>
          <div class="row">${btn('title', '⌂', 'sec sq')}${btn('newRun', '↻ ' + esc(t('gl_new_run')), 'big')}</div></div>`;
      }
    }
    ov.innerHTML = h; ov.hidden = false;
    if (ov.firstElementChild) { ov.firstElementChild.setAttribute('data-m3pop', ''); if (window.Mal3abPopButtons) window.Mal3abPopButtons(); }   // 🏠 + 💬 in every popup
    ov.querySelectorAll('[data-mal3ab-home]').forEach((b) => { b.onclick = (e) => { e.preventDefault(); location.href = '../../play.html'; }; });
    ov.querySelectorAll('canvas[data-icon]').forEach(drawIcon);
  }
  ov.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    AU.init(); AU.sfx('ui');
    const a = b.dataset.a;
    if (a === 'campaign' || a === 'levels') { if (G.mode !== 'demo' && a === 'levels') { startDemo(); } show('levels'); }
    else if (a === 'title') { startDemo(); show('title'); }
    else if (a === 'endless') { if (b.dataset.locked) { toast(t('gl_endless_lock')); return; } startEndless(); }
    else if (a === 'how') { howBack = G.screen; show('how'); }
    else if (a === 'howback') show(howBack === 'how' ? 'title' : howBack);
    else if (a === 'lvl') { const i = +b.dataset.i; if (i > (SAVE.unlocked || 0)) { toast(t('gl_need_prev')); AU.sfx('deny'); return; } openBrief(i); }
    else if (a === 'start') beginLevel();
    else if (a === 'resume') resume();
    else if (a === 'restart' || a === 'retry') { if (G.mode === 'endless') { if (a === 'retry') startEndless(); else { G.ex = G.run.exAtStart ? Object.assign({}, G.run.exAtStart) : G.ex; loadStage(); } } else { openBrief(G.li); beginLevel(); } }
    else if (a === 'next') { openBrief(Math.min(G.li + 1, LEVELS.length - 1)); }
    else if (a === 'nextStage') { G.run.stage++; G.run.exAtStart = Object.assign({}, G.ex); loadStage(); }
    else if (a === 'newRun') startEndless();
    else if (a === 'lang') setLang(getLang() === 'ar' ? 'en' : 'ar');
    else if (a === 'snd') { toggleMute(); renderOv(); }
  });
  function toggleMute() { AU.setMute(!AU.muted); SAVE.mute = AU.muted; writeSave(); $('bSnd').textContent = AU.muted ? '🔇' : '🔊'; }
  function pause() { if (G.screen !== 'game' || G.phase === 'won' || G.phase === 'lost') return; G.paused = true; G.exMode = null; show('pause'); }
  function resume() { if (!lv) return; G.paused = false; show('game'); }
  let toastT = 0;
  function toast(msg) { const el = $('toast'); el.textContent = msg; el.hidden = false; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 1800); }

  // icons for the how-to / briefing
  function drawIcon(cnv) {
    const type = cnv.dataset.icon, css = +cnv.getAttribute('width');
    cnv.style.width = css + 'px'; cnv.style.height = css + 'px';
    cnv.width = css * DPR; cnv.height = css * DPR;
    const g = cnv.getContext('2d'); g.scale(DPR, DPR); g.lineCap = 'round';
    const s = css * 0.92, o = (css - s) / 2;
    tileBase(g, o, o, s, type === 'lock' ? 'lock' : '');
    g.save(); g.translate(css / 2, css / 2);
    const fake = (arms, entry, link) => ({ arms, entry, link: !!link, col: 0, mixed: false, cols: new Set([0]) });
    if ('ILTXSV'.includes(type) && type.length === 1) {
      const rot = type === 'L' ? 1 : type === 'T' ? 1 : type === 'S' ? 3 : type === 'V' ? 1 : type === 'I' ? 1 : 0;
      g.save(); g.rotate(rot * Math.PI / 2); pieceIdle(g, type, s); g.restore();
      if (type === 'I') drawFlow(g, fake(10, 3), 1, s);
      else if (type === 'L') drawFlow(g, fake(6, 1), 1, s);
      else if (type === 'T') drawFlow(g, fake(14, 3), 1, s);
      else if (type === 'S') drawFlow(g, fake(13, 3), 1, s);
      else if (type === 'V') drawFlow(g, fake(2, -1, true), 1, s);
      else if (type === 'X') { drawFlow(g, fake(5, 0), 1, s); g.fillStyle = '#121c35'; rr(g, -s * 0.24, -s * 0.2, s * 0.48, s * 0.4, s * 0.08); g.fill(); g.strokeStyle = '#060a14'; g.lineWidth = s * 0.3; arms(g, 10, s); g.strokeStyle = '#3a5287'; g.lineWidth = s * 0.12; arms(g, 10, s); const n = fake(10, 3); n.col = 1; drawFlow(g, n, 1, s); }
    } else if (type === 'src') drawSource(g, { col: 0, bw: 2, x: 0 }, s);
    else if (type === 'core') drawCore(g, { col: 1, prog: 0.65, done: false, feeding: true, hit: 0, deny: 0, flash: 0 }, s);
    else if (type === 'fw') drawFirewall(g, { p: 'I', rot: 1, col: -1, need: 2, prog: 0, dmg: 0, broken: false, shake: 0, inBw: 1, inCol: 0, x: 1, y: 2 }, s, 0, 0, 0);
    else if (type === 'fwc') drawFirewall(g, { p: 'I', rot: 1, col: 1, need: 1, prog: 0, dmg: 0, broken: false, shake: 0, inBw: 0, inCol: -1, x: 1, y: 2 }, s, 0, 0, 0);
    else if (type === 'tur') drawTurret(g, { aim: Math.PI / 4, hacked: false, dead: false, hack: 0.4, stun: 0, phase: 'wait', hit: 0 }, s);
    else if (type === 'lock') { g.save(); g.rotate(Math.PI / 2); pieceIdle(g, 'L', s); g.restore(); g.strokeStyle = 'rgba(150,160,190,0.55)'; g.lineWidth = s * 0.035; g.setLineDash([s * 0.08, s * 0.06]); rr(g, -s * 0.42, -s * 0.42, s * 0.84, s * 0.84, s * 0.1); g.stroke(); g.setLineDash([]); lockGlyph(g, s * 0.3, -s * 0.28, s, '#aab3cc'); }
    g.restore();
  }

  // ───────────────────────── input ─────────────────────────
  let press = null;
  function inPlay() { return G.screen === 'game' && lv && (G.phase === 'play' || (G.phase === 'intro' && G.introT > 0.4)) && !G.paused && G.mode !== 'demo'; }
  function act(cell, dir) {
    if (!cell) return;
    if (G.exMode === 'force') { forceAt(cell.L, cell.x, cell.y); return; }
    rotateCell(cell.L, cell.x, cell.y, dir);
    updateBar();
  }
  cv.addEventListener('pointerdown', (e) => {
    AU.init();
    if (!inPlay()) return;
    e.preventDefault();
    const cell = pick(e.clientX, e.clientY);
    if (e.button === 2) { act(cell, -1); return; }
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, cell, long: false, tm: setTimeout(() => { if (press && !press.moved) { press.long = true; if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) {} act(press.cell, -1); } }, 420) };
    G.cursor.show = false;
  });
  cv.addEventListener('pointermove', (e) => {
    if (press && press.id === e.pointerId && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 14) { press.moved = true; clearTimeout(press.tm); }
    if (e.pointerType === 'mouse' && lv) G.hover = inPlay() ? pick(e.clientX, e.clientY) : null;
  });
  const endPress = (e) => {
    if (!press || press.id !== e.pointerId) return;
    clearTimeout(press.tm);
    if (!press.long && !press.moved && inPlay()) { const c = pick(e.clientX, e.clientY); if (c && press.cell && c.x === press.cell.x && c.y === press.cell.y && c.L === press.cell.L) act(c, 1); }
    press = null;
  };
  cv.addEventListener('pointerup', endPress);
  cv.addEventListener('pointercancel', (e) => { if (press && press.id === e.pointerId) { clearTimeout(press.tm); press = null; } });
  cv.addEventListener('pointerleave', () => { G.hover = null; });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'Escape' || k === 'p' || k === 'P') {
      if (G.screen === 'game') { if (G.exMode) { G.exMode = null; updateBar(); } else pause(); e.preventDefault(); return; }
      if (G.screen === 'pause') { resume(); e.preventDefault(); return; }
      if (k === 'Escape') { if (G.screen === 'how') show(howBack === 'how' ? 'title' : howBack); else if (G.screen === 'levels') { show('title'); } else if (G.screen === 'brief') show('levels'); }
      return;
    }
    if (G.screen === 'brief' && (k === 'Enter' || k === ' ')) { e.preventDefault(); beginLevel(); return; }
    if (!inPlay()) return;
    const cu = G.cursor;
    const mv = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] }[k];
    if (mv) { e.preventDefault(); if (!cu.show) { cu.show = true; cu.L = G.dual ? cu.L : G.activeL; } else { cu.x = clamp(cu.x + mv[0], 0, lv.W - 1); cu.y = clamp(cu.y + mv[1], 0, lv.H - 1); } return; }
    if (k === ' ' || k === 'Enter' || k === 'e' || k === 'E') { e.preventDefault(); cu.show = true; if (!G.dual) cu.L = G.activeL; act({ L: cu.L, x: cu.x, y: cu.y }, e.shiftKey ? -1 : 1); return; }
    if (k === 'q' || k === 'Q' || k === 'Backspace') { e.preventDefault(); cu.show = true; if (!G.dual) cu.L = G.activeL; act({ L: cu.L, x: cu.x, y: cu.y }, -1); return; }
    if (k === 'Tab' || k === 'l' || k === 'L') { e.preventDefault(); switchLayer(); return; }
    if (k === '1') useExploit('freeze'); else if (k === '2') useExploit('force'); else if (k === '3') useExploit('emp');
    else if (k === 'm' || k === 'M') toggleMute();
  });
  function switchLayer() {
    if (!lv || lv.NL < 2) return;
    if (G.dual) { G.cursor.L = 1 - G.cursor.L; G.cursor.show = true; return; }
    G.activeL = 1 - G.activeL; G.cursor.L = G.activeL; AU.sfx('ui'); hudLabels();
  }
  $('bPause').onclick = () => { AU.init(); AU.sfx('ui'); pause(); };
  $('bSnd').onclick = () => { AU.init(); toggleMute(); };
  $('bLayer').onclick = () => { AU.init(); switchLayer(); };
  $('xs').addEventListener('click', (e) => { const b = e.target.closest('.xb'); if (!b) return; AU.init(); useExploit(b.dataset.x); });
  document.querySelectorAll('#hud [data-mal3ab-home]').forEach((h) => { if (!h.onclick) h.onclick = () => { location.href = '../../play.html'; }; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (G.screen === 'game' && G.mode !== 'demo') pause(); if (AU.ctx) AU.ctx.suspend().catch(() => {}); } else if (AU.ctx) AU.ctx.resume().catch(() => {}); });
  document.addEventListener('langchange', () => { if (G.screen !== 'game') renderOv(); hudLabels(); });
  document.addEventListener('mal3abready', () => { if (G.screen === 'title') renderOv(); });
  window.addEventListener('resize', resize);

  // ───────────────────────── loop ─────────────────────────
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    update(dt); render(); updateHud();
    requestAnimationFrame(frame);
  }
  resize(); startDemo(); show('title');
  requestAnimationFrame(frame);

  // ───────────────────────── test / automation API ─────────────────────────
  window.GridlockHacker = {
    get state() {
      return {
        screen: G.screen, mode: G.mode, level: G.li, phase: G.phase, paused: G.paused, trace: G.trace, time: G.time, alarm: G.alarm,
        ex: Object.assign({}, G.ex), dual: G.dual, cs: G.cs, activeL: G.activeL, stage: G.run ? G.run.stage : 0,
        cores: lv ? lv.cores.map((c) => ({ col: c.col, prog: +c.prog.toFixed(3), done: c.done })) : [],
        firewalls: lv ? lv.fws.map((f) => ({ broken: f.broken, prog: +(f.prog + f.dmg).toFixed(2) })) : [],
        turrets: lv ? lv.turs.map((x) => ({ hacked: x.hacked, dead: x.dead, stun: x.stun > 0 })) : [],
        size: lv ? [lv.W, lv.H, lv.NL] : null, result: G.result, moves: G.moves, freeze: G.freeze, exMode: G.exMode, emp: G.emp,
      };
    },
    levels: LEVELS.length, save: SAVE,
    openLevel: (i) => openBrief(i), start: () => beginLevel(), startLevel: (i) => { openBrief(i); beginLevel(); },
    startEndless, nextStage: () => { G.run.stage++; loadStage(); },
    endlessAt: (st, seed) => { startEndless(); G.run.stage = st; if (seed !== undefined) G.run.seed = seed; loadStage(); }, menu: () => { startDemo(); show('title'); },
    solve: solveBoard, step: (sec) => { const n = Math.ceil(sec / 0.02); for (let i = 0; i < n; i++) update(0.02); render(); updateHud(); },
    rotate: (x, y, dir, L) => rotateCell(L || 0, x, y, dir || 1), tap: (x, y, L) => act({ L: L || 0, x, y }, 1),
    exploit: useExploit, force: (x, y, L) => forceAt(L || 0, x, y), pause, resume, switchLayer, setTrace: (v) => { G.trace = v; },
    cellPos: (x, y, L) => cellPos(L || 0, x, y), cell: (x, y, L) => { const c = cellAt(L || 0, x, y); return c && { k: c.k, p: c.p, rot: c.rot, sol: c.sol, lock: !!c.lock }; }, resetSave: () => { for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, { v: 1, unlocked: 0, stars: {}, best: {}, endless: { stage: 0, score: 0 }, mute: false }); writeSave(); },
    _dbg: () => { const F = computeFlow(); const m = []; for (const n of F.order) if (n.mixed) m.push([n.L, n.x, n.y, n.dist, cellAt(n.L, n.x, n.y).k, cellAt(n.L, n.x, n.y).p, cellAt(n.L, n.x, n.y).lock]); const w = []; for (const sk of F.sinks.values()) sk.sides.forEach((sd, i) => { if (sd && (sd.mixed || (sk.c.k === 'core' && sd.col !== sk.c.col) || (sk.c.k === 'src' && [...sd.cols].some((x) => x !== sk.c.col)))) w.push([sk.c.k, sk.c.x, sk.c.y, i, sd.par]); }); return { m, w }; },
    unlockAll: () => { SAVE.unlocked = LEVELS.length - 1; writeSave(); }, gen: genEndless,
  };
})();
