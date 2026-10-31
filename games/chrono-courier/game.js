// Chrono Courier — rendering, input, UI and the loop flow. The rules live in engine.js (CCEngine).
(function () {
  'use strict';
  const E = window.CCEngine, K = E.K, TICKS = E.TICKS, TICK = E.TICK_MS / 1000, DX = E.DX, DY = E.DY;
  const LEVELS = E.LEVELS;

  // ------------------------------------------------------------------ strings
  addStrings({
    cc_sub: 'ساعي الزمن', cc_tag: 'عندك ١٠ ثواني بس… ونسخك القديمة في ضهرك', cc_play: 'العب', cc_continue: 'كمّل', cc_levels: 'المراحل', cc_howto: 'إزاي تلعب',
    cc_back: 'رجوع', cc_level: 'مرحلة {n}', cc_loop: 'لفّة {n}/{m}', cc_sec: 'ث', cc_ready: 'اتحرك عشان تبدأ اللفّة', cc_readyEcho: 'نسخك القديمة مستنياك — اتحرك وابدأ',
    cc_restartLoop: 'عيد اللفّة', cc_undoLoop: 'الغي آخر لفّة', cc_endLoop: 'خلّص اللفّة', cc_paused: 'وقفة', cc_resume: 'كمّل', cc_restartLevel: 'ابدأ المرحلة من الأول',
    cc_next: 'المرحلة الجاية', cc_replay: 'العبها تاني', cc_delivered: 'اتسلّم!', cc_in1: 'وصّلته في لفّة واحدة', cc_in2: 'وصّلته في لفّتين', cc_inN: 'وصّلته في {n} لفّات',
    cc_par1: 'خلّصها في لفّة واحدة وخد ٣ نجوم', cc_par2: 'خلّصها في لفّتين وخد ٣ نجوم', cc_parN: 'خلّصها في {n} لفّات وخد ٣ نجوم', cc_best: 'أحسن نتيجة: {n} لفّة',
    cc_out: 'اللفّات خلصت!', cc_outMsg: 'الطرد موصلش. الغي آخر لفّة وجرّب خطة تانية.', cc_fried: 'اتحرقت! بنقدّم الوقت…', cc_fell: 'وقعت في الفراغ! بنقدّم الوقت…',
    cc_lost: 'الطرد ضاع في اللفّة دي', cc_ff: 'بنقدّم الوقت…', cc_rewind: 'بنرجّع الزمن…', cc_tip: 'نصيحة:', cc_sound: 'الصوت', cc_soundOn: '🔊', cc_soundOff: '🔇',
    cc_starsTotal: '⭐ {n} من {m}', cc_allDone: 'خلّصت كل المراحل! إنت أسطورة التوصيل 🎉', cc_locked: 'مقفولة', cc_drop: 'نزّل', cc_hint: 'نصيحة', cc_pause: 'وقفة',
    cc_menu: 'القائمة', cc_newBest: 'رقم جديد!', cc_hello: '👤 {p}',
    cc_hw1: '📦 شيل الطرد ووصّله لمنصة التسليم اللي بتنوّر.',
    cc_hw2: '⏱ كل لفّة ١٠ ثواني بس. لما الوقت يخلص الزمن بيلف — وكل نسخة قديمة منك بتعيد اللي عملته بالظبط.',
    cc_hw3: '👥 خطّط مع نسخك: حد يدوس على البلاطة، حد يضغط الزرار، حد يسد الليزر، وحد يجري بالطرد.',
    cc_hw4: '🟦 البلاطة بتفتح الباب طول ما حد واقف عليها بس. الزرار بيفتحه ثانيتين وبعدين يقفل.',
    cc_hw5: '🔴 الليزر بيحرق الروبوتات — بس الخردة والصناديق بتسد الشعاع.',
    cc_hw6: '🟫 الأرض المشقّقة بتقع بعد ما تدوس عليها، والأرض المخططة بتقع في الوقت المكتوب عليها. والصندوق اللي يقع في حفرة بيسدّها.',
    cc_hw7: '⏩ السيور بتحرّك أي حاجة عليها، وفتحات الحيطان بتعدّي الطرد بس.',
    cc_hw8: '⭐ لفّات أقل = نجوم أكتر.',
    cc_keys: '⌨️ الأسهم أو WASD للحركة · مسافة تنزّل/تشيل الطرد · R تعيد اللفّة · U تلغي آخر لفّة · Enter تخلّص اللفّة · P وقفة',
    cc_touch: '📱 الأسهم اللي على الشاشة أو اسحب بصباعك · ✋ تنزّل/تشيل الطرد · ⏭ تخلّص اللفّة',
    cc_n1: 'أول وردية', cc_n2: 'الصدى', cc_n3: 'شيل تقيل', cc_n4: 'سلك سخن', cc_n5: 'درع الخردة', cc_n6: 'السير السريع', cc_n7: 'بيتفتت',
    cc_n8: 'تذكرة رايح بس', cc_n9: 'ماس كهربا', cc_n10: 'تتابع', cc_n11: 'آخر كوبري', cc_n12: 'وزن تقيل', cc_n13: 'التوقيت المظبوط', cc_n14: 'آخر توصيلة',
    cc_h1: 'امشي على الطرد عشان تشيله، ووصّله لمنصة التسليم اللي بتنوّر.',
    cc_h2: 'البلاطة بتفتح الباب طول ما حد واقف عليها بس. اقف عليها وسيب الوقت يخلص (أو دوس ⏭) — في اللفّة الجاية نسختك هتفضل واقفة مكانها.',
    cc_h3: 'الصندوق تقيل كفاية يدوس على البلاطة — ولو زقّيته في حفرة بيبقى أرض تمشي عليها.',
    cc_h4: 'الزرار بيفتح الباب ثانيتين بس، والمسافة بعيدة عليك لوحدك. خلّي نسخة تدوس الزرار وإنت مستني عند الباب.',
    cc_h5: 'الليزر بيحرق الروبوت، بس الروبوت المحروق بيسد الشعاع. ساعات نسختك القديمة لازم تضحّي عشان الفريق.',
    cc_h6: 'السيور بتحرّك أي حاجة عليها، والطرد بيجري ناحية الحفرة! امسكه بسرعة ونزّله (✋ أو مسافة) على السير اللي داخل الفتحة.',
    cc_h7: 'الأرض المشقّقة بتقع بعد ما حاجة تدوس عليها على طول. لو صندوق وقع فيها بيسدّ الحفرة على طول.',
    cc_h8: 'الكوبري بيستحمل مرة واحدة. اللي يعدّي يقدر يرجّع الطرد على السير — بس لازم نسخة تانية تكون مستنياه.',
    cc_h9: 'البلاطة بتفتح الباب، بس الليزر قافل على المخرج. سدّ الشعاع — الصندوق بيعمل الشغلانة دي كويس.',
    cc_h10: 'تلات مهام وتلات نسخ: واحد يسد الليزر، وواحد يدوس على البلاطة، وواحد يجري بالطرد.',
    cc_h11: 'الكوبري هيقع بعد ٣ ثواني — بدري أوي عشان تعدّي بالطرد. في لفّة حط الطرد على السير، وفي لفّة تانية اعدي بدري واستلمه من الناحية التانية.',
    cc_h12: 'بابين وصندوق واحد. نسختك تقدر تدوس على بلاطة، والصندوق على التانية.',
    cc_h13: 'البلاطة بتفتح باب الدخول وبتقفل باب الخروج، والليزر بيرجع يشتغل لما تتساب. نسختك لازم تسيبها في اللحظة المظبوطة.',
    cc_h14: 'كل اللي اتعلمته: سدّ الشعاع، دوس على البلاطة، سيبها في الوقت الصح، واعدي قبل ما الأرض تقع.',
  }, {
    cc_sub: 'Time-loop deliveries', cc_tag: 'You only get 10 seconds… but your past selves have your back.', cc_play: 'Play', cc_continue: 'Continue', cc_levels: 'Levels', cc_howto: 'How to play',
    cc_back: 'Back', cc_level: 'Level {n}', cc_loop: 'Loop {n}/{m}', cc_sec: 's', cc_ready: 'Move to start the loop', cc_readyEcho: 'Your echoes are ready — move to start',
    cc_restartLoop: 'Restart loop', cc_undoLoop: 'Undo last loop', cc_endLoop: 'End loop', cc_paused: 'Paused', cc_resume: 'Resume', cc_restartLevel: 'Restart level',
    cc_next: 'Next level', cc_replay: 'Play again', cc_delivered: 'Delivered!', cc_in1: 'Delivered in 1 loop', cc_in2: 'Delivered in 2 loops', cc_inN: 'Delivered in {n} loops',
    cc_par1: 'Finish in 1 loop for 3 stars.', cc_par2: 'Finish in 2 loops for 3 stars.', cc_parN: 'Finish in {n} loops for 3 stars.', cc_best: 'Best: {n} loops',
    cc_out: 'Out of loops!', cc_outMsg: 'The package didn’t make it. Undo the last loop and try another plan.', cc_fried: 'Fried! Fast-forwarding…', cc_fell: 'You fell into the void! Fast-forwarding…',
    cc_lost: 'The package is lost in this timeline', cc_ff: 'Fast-forwarding…', cc_rewind: 'Rewinding time…', cc_tip: 'Tip:', cc_sound: 'Sound', cc_soundOn: '🔊', cc_soundOff: '🔇',
    cc_starsTotal: '⭐ {n} of {m}', cc_allDone: 'You finished every level! Delivery legend 🎉', cc_locked: 'Locked', cc_drop: 'Drop', cc_hint: 'Hint', cc_pause: 'Pause',
    cc_menu: 'Menu', cc_newBest: 'New best!', cc_hello: '👤 {p}',
    cc_hw1: '📦 Grab the package and carry it to the glowing delivery pad.',
    cc_hw2: '⏱ Every run lasts just 10 seconds. Then time loops — and every past self replays exactly what you did.',
    cc_hw3: '👥 Plan with your echoes: one holds a plate, one hits a switch, one blocks a laser, one runs with the package.',
    cc_hw4: '🟦 Plates keep their doors open only while someone stands on them. Switches open them for 2 seconds.',
    cc_hw5: '🔴 Lasers fry bots — but scrap and crates block the beam.',
    cc_hw6: '🟫 Cracked floor falls right after you step on it; striped floor falls at the time printed on it. A crate pushed into a hole fills it.',
    cc_hw7: '⏩ Belts move everything on them, and wall slots only let packages through.',
    cc_hw8: '⭐ Fewer loops = more stars.',
    cc_keys: '⌨️ Arrows / WASD move · Space drop / pick up · R restart loop · U undo last loop · Enter end loop · P pause',
    cc_touch: '📱 D-pad or swipe to move · ✋ drop / pick up · ⏭ end loop',
    cc_n1: 'First Shift', cc_n2: 'Echo', cc_n3: 'Heavy Lifting', cc_n4: 'Hot Wire', cc_n5: 'Scrap Shield', cc_n6: 'Express Belt', cc_n7: 'Crumble',
    cc_n8: 'One-Way Ticket', cc_n9: 'Short Circuit', cc_n10: 'Relay', cc_n11: 'Last Bridge', cc_n12: 'Dead Weight', cc_n13: 'Perfect Timing', cc_n14: 'Final Delivery',
    cc_h1: 'Walk onto the package to grab it, then carry it to the glowing delivery pad.',
    cc_h2: 'A plate only holds its door open while someone stands on it. Stand on it and let the time run out (or tap ⏭) — next loop, your echo keeps standing there.',
    cc_h3: 'A crate is heavy enough to hold a plate down — and pushing one into a hole turns it into floor.',
    cc_h4: 'A switch opens its door for just 2 seconds, and it is too far to make it alone. Let an echo press it while you wait at the door.',
    cc_h5: 'Lasers fry bots, but a fried bot blocks the beam. Sometimes a past self has to take one for the team.',
    cc_h6: 'Belts move everything on them — and the package is sliding toward the void! Grab it and drop it (✋ or Space) on the belt that runs through the slot.',
    cc_h7: 'Cracked floor falls right after something steps on it. A crate that falls in fills the hole for good.',
    cc_h8: 'The bridge only holds once. Whoever crosses can send the package back on the belt — but another self has to be waiting for it.',
    cc_h9: 'The plate opens the door, but a laser guards the exit. Block the beam — a crate does the job nicely.',
    cc_h10: 'Three jobs, three selves: one blocks the laser, one holds the plate, one runs with the package.',
    cc_h11: 'The bridge falls at 3 seconds — too soon to carry the package across. In one loop put the package on the belt; in another, cross early and catch it on the other side.',
    cc_h12: 'Two doors, one crate. Your echo can hold one plate and the crate the other.',
    cc_h13: 'The plate opens the way in but locks the way out, and the laser comes back on when it is released. Your echo has to let go at just the right moment.',
    cc_h14: 'Everything you have learned: block the beam, hold the plate, let go at the right moment, and cross before the floor falls.',
  });
  // online co-op
  addStrings({
    cc_online: 'العب أونلاين مع صاحبك', cc_onTitle: 'أونلاين مع صاحبك', cc_onDesc: 'ساعيين في نفس المرحلة ونفس اللفّة — واحد يدوس على البلاطة والتاني يعدّي، وكل لفّة نسخكم الاتنين بتساعدكم.',
    cc_create: '➕ اعمل أوضة', cc_or: 'أو', cc_codePh: 'كود الأوضة', cc_join: 'ادخل', cc_codeHint: 'اكتب كود الأوضة (٤ حروف)', cc_yourName: 'اسمك',
    cc_room: 'الأوضة', cc_copyLink: '🔗 انسخ لينك الدعوة', cc_copied: 'اتنسخ ✓', cc_you: 'إنت', cc_partner: 'صاحبك', cc_hostR: 'صاحب الأوضة', cc_c1: 'الساعي ١', cc_c2: 'الساعي ٢',
    cc_waitPartner: 'مستني صاحبك يدخل… ابعتله اللينك', cc_connecting: 'بيوصل…', cc_swap: '⇄ بدّلوا الأدوار', cc_levelOf: 'المرحلة', cc_start: '▶ ابدأ',
    cc_needPartner: 'لازم صاحبك يدخل الأول', cc_waitHost: 'مستني صاحب الأوضة يبدأ…', cc_hostPicks: 'اختيار صاحب الأوضة', cc_leave: 'اخرج من الأوضة', cc_toRoom: '🚪 ارجع للأوضة',
    cc_full: 'الأوضة مليانة — فيها اتنين خلاص', cc_noNet: 'مفيش اتصال بالنت', cc_joinedP: '{p} دخل الأوضة 👋', cc_leftP: '{p} خرج',
    cc_partnerLost: 'صاحبك خرج', cc_partnerLostD: 'تقدر تكمّل لوحدك — نسخكم القديمة لسه معاك.', cc_continueSolo: '▶ كمّل لوحدك',
    cc_readyCo: 'أي حد فيكم يتحرك يبدأ اللفّة', cc_readyCoEcho: 'نسخكم مستنياكم — اتحركوا وابدأوا', cc_friedCo: 'اتحرقت! صاحبك لسه بيلعب…', cc_fellCo: 'وقعت! صاحبك لسه بيلعب…',
    cc_waitDone: 'خلّصت — مستني صاحبك يخلّص…', cc_pausedBy: 'وقّفها {p}', cc_retry: '↺ حاول تاني', cc_team: '👥 {a} + {b}', cc_courier: 'ساعي', cc_waitReq: 'مستني صاحب الأوضة…',
    cc_hwCo: '🌐 أونلاين: كل واحد بيحرّك ساعيه في نفس الوقت. لما اللفّة تخلص، لفّتكم إنتوا الاتنين بتتحوّل نسخ بتساعدكم. ⏭ يعني «أنا خلّصت» — اللفّة بتتقدّم لما الاتنين يخلّصوا.',
    cc_rejoin: 'صاحبك رجع — بنعيد اللفّة',
  }, {
    cc_online: 'Online Co-op', cc_onTitle: 'Online Co-op', cc_onDesc: 'Two couriers, one level, one loop — one holds the plate while the other runs. Every loop, both of your runs become echoes that help you.',
    cc_create: '➕ Create Room', cc_or: 'or', cc_codePh: 'Room Code', cc_join: 'Join', cc_codeHint: 'Type the room code (4 letters)', cc_yourName: 'Your Name',
    cc_room: 'Room', cc_copyLink: '🔗 Copy Invite Link', cc_copied: 'Copied ✓', cc_you: 'You', cc_partner: 'Partner', cc_hostR: 'Host', cc_c1: 'Courier 1', cc_c2: 'Courier 2',
    cc_waitPartner: 'Waiting for your partner… send them the link', cc_connecting: 'Connecting…', cc_swap: '⇄ Swap Roles', cc_levelOf: 'Level', cc_start: '▶ Start',
    cc_needPartner: 'Your partner needs to join first', cc_waitHost: 'Waiting for the host to start…', cc_hostPicks: 'Host’s Pick', cc_leave: 'Leave Room', cc_toRoom: '🚪 Back To Room',
    cc_full: 'That room is full', cc_noNet: 'No connection', cc_joinedP: '{p} joined 👋', cc_leftP: '{p} left',
    cc_partnerLost: 'Your Partner Left', cc_partnerLostD: 'You can carry on solo — your shared echoes stay with you.', cc_continueSolo: '▶ Continue Solo',
    cc_readyCo: 'Either Of You Moves To Start', cc_readyCoEcho: 'Your Echoes Are Ready — Move To Start', cc_friedCo: 'Fried! Your partner is still going…', cc_fellCo: 'You fell! Your partner is still going…',
    cc_waitDone: 'Done — waiting for your partner…', cc_pausedBy: 'Paused by {p}', cc_retry: '↺ Retry', cc_team: '👥 {a} + {b}', cc_courier: 'Courier', cc_waitReq: 'Waiting for the host…',
    cc_hwCo: '🌐 Online: each player drives their own courier at the same time. When the loop ends, both of your runs become echoes. ⏭ means “I’m done” — the loop moves on once you both are.',
    cc_rejoin: 'Your partner is back — restarting the loop',
  });

  // ------------------------------------------------------------------ save data
  const SAVE_KEY = 'chrono-courier-progress', SET_KEY = 'chrono-courier-settings';
  const readJSON = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : d; } catch (e) { return d; } };
  const prog = readJSON(SAVE_KEY, {}); prog.stars = prog.stars || {}; prog.loops = prog.loops || {};
  const settings = readJSON(SET_KEY, { mute: false });
  const saveProg = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(prog)); } catch (e) {} };
  const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} };
  const starsOf = (id) => prog.stars[id] | 0;
  const unlocked = (i) => i === 0 || starsOf(LEVELS[i - 1].id) > 0 || starsOf(LEVELS[i].id) > 0;
  const totalStars = () => LEVELS.reduce((a, L) => a + starsOf(L.id), 0);
  // online co-op results are kept apart from the solo stars (two couriers make levels easier)
  const COOP_KEY = 'chrono-courier-coop', NAME_KEY = 'chrono-courier-name';
  const coop = readJSON(COOP_KEY, {}); coop.stars = coop.stars || {}; coop.loops = coop.loops || {};
  const saveCoop = () => { try { localStorage.setItem(COOP_KEY, JSON.stringify(coop)); } catch (e) {} };
  const coopStarsOf = (id) => coop.stars[id] | 0;
  const coopUnlocked = (i) => i === 0 || coopStarsOf(LEVELS[i - 1].id) > 0 || coopStarsOf(LEVELS[i].id) > 0;
  const maxUnlockedIdx = () => { let m = 0; for (let i = 0; i < LEVELS.length; i++) if (unlocked(i) || coopUnlocked(i)) m = i; return m; };
  const coopNextIdx = () => { const mx = maxUnlockedIdx(); for (let i = 0; i <= mx; i++) if (!coopStarsOf(LEVELS[i].id)) return i; return mx; };

  // ------------------------------------------------------------------ sound (WebAudio synth)
  const Snd = {
    ctx: null, master: null, nb: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = settings.mute ? 0 : 0.5; this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 2; this.nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { this.ctx = null; }
    },
    mute(m) { settings.mute = m; saveSettings(); if (this.master) this.master.gain.value = m ? 0 : 0.5; },
    tone(f, d, o) {
      o = o || {}; const c = this.ctx; if (!c || settings.mute) return;
      const t = c.currentTime + (o.delay || 0), osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + d);
      const v = o.vol === undefined ? 0.15 : o.vol;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.att || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g); g.connect(this.master); osc.start(t); osc.stop(t + d + 0.03);
    },
    noise(d, o) {
      o = o || {}; const c = this.ctx; if (!c || settings.mute || !this.nb) return;
      const t = c.currentTime + (o.delay || 0), src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = this.nb; f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.f || 800, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d);
      const v = o.vol === undefined ? 0.15 : o.vol;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      src.connect(f); f.connect(g); g.connect(this.master); src.start(t, Math.random() * 0.5); src.stop(t + d + 0.05);
    },
    play(n, ghost) {
      if (!this.ctx || settings.mute) return;
      const q = ghost ? 0.45 : 1;
      switch (n) {
        case 'step': this.tone(150 + Math.random() * 40, 0.05, { type: 'triangle', vol: 0.05 * q }); break;
        case 'bump': this.tone(90, 0.08, { type: 'square', vol: 0.035 }); break;
        case 'push': this.noise(0.14, { f: 500, type: 'bandpass', vol: 0.16 * q }); this.tone(110, 0.1, { type: 'square', vol: 0.03 * q }); break;
        case 'pick': this.tone(660, 0.08, { type: 'triangle', vol: 0.14 * q }); this.tone(990, 0.14, { type: 'triangle', vol: 0.12 * q, delay: 0.06 }); break;
        case 'drop': this.tone(320, 0.12, { type: 'triangle', to: 150, vol: 0.14 * q }); break;
        case 'door': this.noise(0.22, { f: 1600, to: 300, type: 'bandpass', vol: 0.09 }); this.tone(260, 0.16, { type: 'sawtooth', to: 520, vol: 0.025 }); break;
        case 'doorc': this.noise(0.22, { f: 400, to: 1400, type: 'bandpass', vol: 0.08 }); this.tone(500, 0.14, { type: 'sawtooth', to: 220, vol: 0.025 }); break;
        case 'plate': this.tone(520, 0.05, { type: 'square', vol: 0.05 }); break;
        case 'switch': this.tone(880, 0.06, { type: 'square', vol: 0.06 }); this.tone(1320, 0.1, { type: 'square', vol: 0.05, delay: 0.05 }); break;
        case 'fry': this.noise(0.4, { f: 2600, type: 'highpass', vol: 0.22 }); this.tone(1400, 0.35, { type: 'sawtooth', to: 70, vol: 0.09 }); break;
        case 'fall': this.tone(520, 0.7, { to: 50, vol: 0.14 }); break;
        case 'collapse': this.noise(0.8, { f: 500, to: 50, vol: 0.34 }); this.tone(75, 0.6, { to: 30, vol: 0.24 }); break;
        case 'crack': this.noise(0.09, { f: 2400, type: 'bandpass', vol: 0.12 }); break;
        case 'fill': this.noise(0.25, { f: 280, vol: 0.24 }); this.tone(90, 0.2, { to: 50, vol: 0.12 }); break;
        case 'lost': this.tone(330, 0.45, { type: 'square', to: 110, vol: 0.06 }); break;
        case 'deliver': [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.22, { type: 'triangle', vol: 0.13, delay: i * 0.07 })); this.noise(0.6, { f: 6000, type: 'highpass', vol: 0.05, delay: 0.3 }); break;
        case 'rewind': this.tone(1100, 0.8, { type: 'sawtooth', to: 110, vol: 0.05 }); this.noise(0.8, { f: 3000, to: 300, type: 'bandpass', vol: 0.08 }); break;
        case 'start': this.tone(440, 0.08, { type: 'triangle', vol: 0.1 }); this.tone(660, 0.12, { type: 'triangle', vol: 0.1, delay: 0.07 }); break;
        case 'sec': this.tone(110, 0.14, { type: 'sine', vol: 0.12 }); break;
        case 'warn': this.tone(1250, 0.09, { type: 'square', vol: 0.05 }); break;
        case 'lose': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.26, { type: 'triangle', vol: 0.12, delay: i * 0.13 })); break;
        case 'star': this.tone(n === 'star' ? 880 : 0, 0.18, { type: 'triangle', vol: 0.12 }); break;
        case 'click': this.tone(720, 0.035, { type: 'triangle', vol: 0.06 }); break;
      }
    },
  };

  // ------------------------------------------------------------------ DOM
  const $ = (id) => document.getElementById(id);
  const cv = $('c'), ctx = cv.getContext('2d');
  const ov = $('ov'), banner = $('banner'), tipEl = $('tip'), padEl = $('pad');
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);

  // ------------------------------------------------------------------ state
  const LOOPC = ['#3cf2d0', '#ff5fa2', '#b8ff4a', '#ffd23f', '#a08bff', '#ff9f43'];
  const CHC = ['#3fa9ff', '#ff8a3d', '#c77dff'];
  const G = {
    scene: 'menu', overlay: null, li: 0, L: null, lv: null, rot: false, loops: [], cur: null, w: null, hist: [], phase: 'ready', acc: 0,
    rewindT: 0, doneT: 0, time: 0, simTime: 0, fx: [], bgfx: [], shake: 0, doorVis: [], colAnim: [], desync: [], banner: null, lastStars: 0, lastLoops: 0,
    scripted: null, tipShown: false, lostShown: false, flash: 0, newBest: false,
    // co-op: net = null (solo) | { host: true|false }. slots = owners of this loop's live couriers (0 = Courier 1 / host, 1 = Courier 2 / guest)
    net: null, coopLvl: false, myOwn: 0, slots: [0], curs: [], done: [false], round: 0, roundSizes: [], loopId: 0, histBase: 0, histSlots: [0],
    pausedBy: '', pName: '', sel: 0, evT: 0, meDeadShown: false,
  };
  const PCOL = ['#3cf2d0', '#ff5fa2'];   // Courier 1 cyan, Courier 2 pink — their echoes keep the same tint
  const isHost = () => !!(G.net && G.net.host), isGuest = () => !!(G.net && !G.net.host);
  const coopOn = () => !!G.net && G.slots.length > 1;   // two live couriers this loop
  const mySlot = () => Math.max(0, G.slots.indexOf(G.myOwn));

  // ------------------------------------------------------------------ level rotation (tall phones get wide levels turned 90°)
  const ROTC = { '^': '>', '>': 'v', 'v': '<', '<': '^' };
  function rotateLevel(L) {
    const H = L.map.length, W = Math.max(...L.map.map(r => r.length)), rows = [];
    for (let ny = 0; ny < W; ny++) {
      let row = '';
      for (let nx = 0; nx < H; nx++) { const c = L.map[H - 1 - nx][ny] || '#'; row += ROTC[c] || c; }
      rows.push(row);
    }
    const defs = {};
    for (const k in (L.defs || {})) { const d = Object.assign({}, L.defs[k]); if (d.dir) d.dir = d.dir % 4 + 1; defs[k] = d; }
    return Object.assign({}, L, { map: rows, defs });
  }

  // ------------------------------------------------------------------ input
  const held = []; let pendDir = 0, pendAct = false;
  function pressDir(d) { pendDir = d; const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); held.push(d); if (isGuest()) netIn('tap', d); kick(); }
  function releaseDir(d) { const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); if (isGuest()) netIn(); }
  function pressAct() { pendAct = true; if (isGuest()) netIn('act'); kick(); }
  function clearInput() { const had = held.length || pendDir || pendAct; held.length = 0; pendDir = 0; pendAct = false; if (had && isGuest()) netIn(); }
  function kick() {
    Snd.init();
    if (isGuest()) return;   // the host runs the loop; our input is already on its way
    if (G.scene === 'play' && !G.overlay && G.phase === 'ready') startRun();
  }
  function sample(me) {
    if (G.scripted) return G.scripted[G.w.t] | 0;
    let a = 0;
    if (pendAct) { a = 5; pendAct = false; }
    else if (pendDir) { a = pendDir; pendDir = 0; }
    else if (held.length) a = held[held.length - 1];
    return a;
  }

  const KEYS = { ArrowUp: 1, KeyW: 1, ArrowRight: 2, KeyD: 2, ArrowDown: 3, KeyS: 3, ArrowLeft: 4, KeyA: 4 };
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.code;
    if (G.overlay) {
      if ((k === 'Escape' || k === 'KeyP') && G.overlay === 'pause') { e.preventDefault(); resume(); }
      else if (k === 'Escape' && (G.overlay === 'howto' || G.overlay === 'levels')) { e.preventDefault(); backFromSub(); }
      else if (k === 'Escape' && G.overlay === 'online') { e.preventDefault(); showMenu(); }
      else if ((k === 'Enter' || k === 'Space') && G.overlay === 'win') { e.preventDefault(); nextLevel(); }
      else if ((k === 'Enter' || k === 'KeyU') && G.overlay === 'lose') { e.preventDefault(); undoLoop(); }
      return;
    }
    if (G.scene !== 'play') return;
    if (KEYS[k]) { e.preventDefault(); if (!e.repeat) pressDir(KEYS[k]); return; }
    if (e.repeat) return;
    if (k === 'Space' || k === 'KeyE' || k === 'KeyX') { e.preventDefault(); pressAct(); }
    else if (k === 'KeyR') restartLoop();
    else if (k === 'KeyU' || k === 'KeyZ' || k === 'Backspace') { e.preventDefault(); undoLoop(); }
    else if (k === 'Enter' || k === 'KeyF') { e.preventDefault(); endLoopNow(); }
    else if (k === 'Escape' || k === 'KeyP') pause();
    else if (k === 'KeyH') toggleTip();
  });
  addEventListener('keyup', (e) => { if (KEYS[e.code]) releaseDir(KEYS[e.code]); });
  addEventListener('blur', () => { clearInput(); if (G.scene === 'play' && !G.overlay && (G.phase === 'run') && !G.net) pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.scene === 'play' && !G.overlay && G.phase === 'run') pause(); });

  // touch D-pad
  padEl.querySelectorAll('[data-d]').forEach(b => {
    const d = +b.dataset.d;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) {} b.classList.add('on'); pressDir(d); });
    const up = () => { b.classList.remove('on'); releaseDir(d); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  const actb = $('actb');
  actb.addEventListener('pointerdown', (e) => { e.preventDefault(); actb.classList.add('on'); pressAct(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => actb.addEventListener(ev, () => actb.classList.remove('on')));
  $('endb').addEventListener('click', () => endLoopNow());

  // swipe / drag on the canvas = move (hold the drag to keep walking)
  let sw = null;
  cv.addEventListener('pointerdown', (e) => { Snd.init(); if (G.scene !== 'play' || G.overlay) return; sw = { id: e.pointerId, x: e.clientX, y: e.clientY, d: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
  cv.addEventListener('pointermove', (e) => {
    if (!sw || e.pointerId !== sw.id) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y, th = 22;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 4) : (dy > 0 ? 3 : 1);
    if (d !== sw.d) { if (sw.d) releaseDir(sw.d); pressDir(d); sw.d = d; }
    sw.x = e.clientX; sw.y = e.clientY;
  });
  const swEnd = (e) => { if (!sw || e.pointerId !== sw.id) return; if (sw.d) releaseDir(sw.d); sw = null; };
  cv.addEventListener('pointerup', swEnd); cv.addEventListener('pointercancel', swEnd);

  // ------------------------------------------------------------------ top bar
  const bSound = $('bSound'), bLang = $('bLang');
  function refreshTopLabels() {
    bSound.textContent = settings.mute ? '🔇' : '🔊'; bSound.title = t('cc_sound');
    bLang.textContent = getLang() === 'ar' ? 'English' : 'العربية';
    $('bHint').title = t('cc_hint'); $('bRestart').title = t('cc_restartLoop'); $('bUndo').title = t('cc_undoLoop'); $('bEnd').title = t('cc_endLoop'); $('bPause').title = t('cc_pause');
    $('endb').title = t('cc_endLoop'); actb.querySelector('small').textContent = t('cc_drop');
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    updateTop();
  }
  bSound.onclick = () => { Snd.init(); Snd.mute(!settings.mute); refreshTopLabels(); Snd.play('click'); };
  bLang.onclick = () => { setLang(getLang() === 'ar' ? 'en' : 'ar'); };
  $('bHint').onclick = () => toggleTip();
  $('bRestart').onclick = () => restartLoop();
  $('bUndo').onclick = () => undoLoop();
  $('bEnd').onclick = () => endLoopNow();
  $('bPause').onclick = () => pause();

  function updateTop() {
    const play = G.scene === 'play';
    $('playBtns').hidden = !play || !!G.overlay; $('lvlName').hidden = !play;
    $('menuBtns').hidden = play && !G.overlay;
    if (G.overlay) tipEl.hidden = true;
    document.body.classList.toggle('playing', play);
    padEl.hidden = !(play && isTouch);
    if (play && G.L) {
      $('lvlName').innerHTML = `${G.L.id}<i>·</i>${t('cc_n' + G.L.id)}`;
      $('bUndo').disabled = G.round === 0;
    }
  }

  // ------------------------------------------------------------------ banner / tip
  function setBanner(key, cls, pulse) {
    G.banner = key ? { key, cls: cls || '', pulse: !!pulse } : null;
    renderBanner();
  }
  function renderBanner() {
    const b = G.banner;
    if (!b || G.scene !== 'play' || G.overlay) { banner.hidden = true; return; }
    banner.hidden = false; banner.textContent = t(b.key);
    banner.className = (b.cls || '') + (b.pulse ? ' pulse' : '');
    banner.style.top = Math.max(60, G.bannerY || 70) + 'px';
  }
  let tipTimer = 0;
  function showTip(auto) {
    if (!G.L) return;
    tipEl.innerHTML = `<b>💡 ${t('cc_tip')}</b> ${t('cc_h' + G.L.id)}<button class="x" aria-label="close">×</button>`;
    tipEl.hidden = false; placeTip();
    clearTimeout(tipTimer);
    if (auto) tipTimer = setTimeout(() => { tipEl.hidden = true; }, 8000);
  }
  function toggleTip() { if (tipEl.hidden) showTip(false); else tipEl.hidden = true; }
  tipEl.onclick = () => { tipEl.hidden = true; };

  // ------------------------------------------------------------------ overlays
  function openOverlay(name, html, clear) {
    G.overlay = name; ov.className = clear ? 'clear' : ''; ov.innerHTML = html; ov.hidden = false;
    if (ov.firstElementChild) { ov.firstElementChild.setAttribute('data-m3pop', ''); if (window.Mal3abPopButtons) window.Mal3abPopButtons(); }   // 🏠 + 💬 in every popup
    renderBanner(); updateTop();
    ov.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', (e) => { Snd.init(); Snd.play('click'); ACTIONS[b.dataset.act](b, e); }));
  }
  function closeOverlay() { G.overlay = null; ov.hidden = true; ov.innerHTML = ''; renderBanner(); updateTop(); }
  const nextIndex = () => { for (let i = 0; i < LEVELS.length; i++) if (!starsOf(LEVELS[i].id)) return i; return LEVELS.length - 1; };
  const ACTIONS = {
    play: () => startLevel(nextIndex()),
    levels: () => showLevels(),
    howto: () => showHowto(),
    back: () => backFromSub(),
    lvl: (b) => { const i = +b.dataset.i; if (unlocked(i)) startLevel(i); },
    resume: () => resume(),
    restartLoop: () => { if (isGuest()) { reqHost('restartLoop'); return; } closeOverlay(); restartLoop(); },
    restartLevel: () => restartLevel(),
    menu: () => showMenu(),
    next: () => nextLevel(),
    undo: () => undoLoop(),
    lang: () => setLang(getLang() === 'ar' ? 'en' : 'ar'),
    sound: () => { Snd.mute(!settings.mute); refreshTopLabels(); rerender(); },
    // online
    online: () => showOnline(),
    create: async () => { saveTypedName(); if (!(await canGoOnline())) return; joinRoom(newCode(), 'host'); },
    join: async () => {
      saveTypedName();
      const inp = $('ccCode'), code = (inp ? inp.value : '').trim().toUpperCase();
      if (code.length < 4) { const m = $('ccMsg'); if (m) m.textContent = t('cc_codeHint'); return; }
      if (!(await canGoOnline())) return; joinRoom(code, null);
    },
    copy: (b) => copyText(inviteLink(ON.code), b),
    swap: () => swapRoles(),
    lvSel: (b) => { if (ON.role !== 'host') return; const mx = Math.max(maxUnlockedIdx(), ON.partner ? ON.partner.ul | 0 : 0); G.sel = Math.max(0, Math.min(mx, G.sel + (+b.dataset.d))); netSend('sel', { l: G.sel }); showLobby(); },
    startOn: () => startOnline(),
    leave: () => { leaveRoom(); G.net = null; showMenu(); },
    room: () => { netSend('lobby', {}); toLobby(); },
    solo: () => continueSolo(),
  };
  let subFrom = null;
  function backFromSub() { if (subFrom === 'pause') showPause(); else showMenu(); }
  function rerender() { const r = { menu: showMenu, levels: showLevels, howto: showHowto, pause: showPause, win: showWin, lose: showLose, online: showOnline, lobby: showLobby, lost: showLost }[G.overlay]; if (r) r(true); }

  function showMenu() {
    G.scene = 'menu'; G.L = null; G.lv = null; tipEl.hidden = true; setBanner(null);
    const name = window.Auth && Auth.name && Auth.name();
    const ts = totalStars(), cont = ts > 0;
    openOverlay('menu', `<div class="box">
      <div class="logo">Chrono Courier</div>
      <div class="sub">${t('cc_sub')}</div>
      <p>${t('cc_tag')}</p>
      ${name ? `<div class="who">${t('cc_hello', { p: escapeHtml(name) })}</div>` : ''}
      <div class="col">
        <button class="btn" data-act="play">▶ ${t(cont ? 'cc_continue' : 'cc_play')}${cont ? ' · ' + (nextIndex() + 1) : ''}</button>
        <button class="btn sec" data-act="levels">🗺️ ${t('cc_levels')}</button>
        <button class="btn sec cyanb" data-act="online">🌐 ${t('cc_online')}</button>
        <button class="btn sec" data-act="howto">❓ ${t('cc_howto')}</button>
      </div>
      <div class="stars-total">${t('cc_starsTotal', { n: ts, m: LEVELS.length * 3 })}</div>
    </div>`, true);
    layout();
  }
  function showLevels() {
    subFrom = G.scene === 'play' ? 'pause' : 'menu';
    const nx = nextIndex();
    let cards = '';
    LEVELS.forEach((L, i) => {
      const st = starsOf(L.id), un = unlocked(i);
      cards += `<button class="lv ${un ? '' : 'locked'} ${i === nx && un && !st ? 'next' : ''}" data-act="lvl" data-i="${i}">
        <span class="n">${un ? L.id : '🔒'}</span><span class="nm">${un ? t('cc_n' + L.id) : t('cc_locked')}</span>
        <span class="st">${'★'.repeat(st)}<i>${'★'.repeat(3 - st)}</i></span></button>`;
    });
    const done = LEVELS.every(L => starsOf(L.id) > 0);
    openOverlay('levels', `<div class="box wide">
      <h2>🗺️ ${t('cc_levels')}</h2>
      <div class="stars-total">${t('cc_starsTotal', { n: totalStars(), m: LEVELS.length * 3 })}</div>
      ${done ? `<p>${t('cc_allDone')}</p>` : ''}
      <div class="lvgrid">${cards}</div>
      <div class="row"><button class="btn sec" data-act="back">${t('cc_back')}</button></div>
    </div>`, G.scene !== 'play');
  }
  function showHowto() {
    if (G.overlay !== 'howto') subFrom = G.scene === 'play' ? 'pause' : 'menu';
    let items = '';
    for (let i = 1; i <= 8; i++) items += `<div>${t('cc_hw' + i)}</div>`;
    items += `<div>${t('cc_hwCo')}</div>`;
    openOverlay('howto', `<div class="box wide">
      <h2>❓ ${t('cc_howto')}</h2>
      <div class="howto">${items}<div class="k">${t('cc_keys')}</div><div class="k">${t('cc_touch')}</div></div>
      <div class="row"><button class="btn" data-act="back">${t('cc_back')}</button></div>
    </div>`, G.scene !== 'play');
  }
  function showPause() {
    const on = !!G.net;
    openOverlay('pause', `<div class="box">
      <h2>⏸ ${t('cc_paused')}</h2>
      <p>${t('cc_level', { n: G.L.id })} · ${t('cc_n' + G.L.id)}${G.pausedBy ? `<br><span class="small">${t('cc_pausedBy', { p: escapeHtml(G.pausedBy) })}</span>` : ''}</p>
      <div class="col">
        <button class="btn" data-act="resume">▶ ${t('cc_resume')}</button>
        <button class="btn sec" data-act="restartLoop">↺ ${t('cc_restartLoop')}</button>
        <button class="btn sec" data-act="restartLevel">⟲ ${t('cc_restartLevel')}</button>
        <button class="btn sec" data-act="howto">❓ ${t('cc_howto')}</button>
        ${on ? `<button class="btn sec" data-act="room">${t('cc_toRoom')}</button>` : `<button class="btn sec" data-act="levels">🗺️ ${t('cc_levels')}</button>
        <button class="btn sec" data-act="menu">🏁 ${t('cc_menu')}</button>`}
      </div>
      <p class="small" id="ccReq"></p>
    </div>`);
  }
  function teamLine() { return G.coopLvl && G.pName ? `<div class="who">${t('cc_team', { a: escapeHtml(G.myOwn ? G.pName : myName()), b: escapeHtml(G.myOwn ? myName() : G.pName) })}</div>` : ''; }
  function showWin(again) {
    const L = G.L, st = G.lastStars, used = G.lastLoops, last = G.li >= LEVELS.length - 1, on = !!G.net;
    let stars = '';
    for (let i = 0; i < 3; i++) stars += `<span class="${i < st ? 'on' : ''}" style="animation-delay:${again ? 0 : 0.15 + i * 0.22}s">★</span>`;
    openOverlay('win', `<div class="box">
      <h2>📦 ${t('cc_delivered')}</h2>
      ${teamLine()}
      <div class="bigstars">${stars}</div>
      <p><b style="color:var(--text)">${used <= 2 ? t('cc_in' + used) : t('cc_inN', { n: used })}</b>${G.newBest ? ` · <span style="color:var(--cyan)">${t('cc_newBest')}</span>` : ''}<br>
      <span class="small">${L.par <= 2 ? t('cc_par' + L.par) : t('cc_parN', { n: L.par })}</span></p>
      ${last ? `<p>${t('cc_allDone')}</p>` : ''}
      <div class="col">
        ${last ? '' : `<button class="btn" data-act="next">▶ ${t('cc_next')}</button>`}
        <button class="btn sec" data-act="restartLevel">${on ? t('cc_retry') : '⟲ ' + t('cc_replay')}</button>
        ${on ? `<button class="btn sec" data-act="room">${t('cc_toRoom')}</button>` : `<button class="btn sec" data-act="levels">🗺️ ${t('cc_levels')}</button>`}
      </div>
      <p class="small" id="ccReq"></p>
    </div>`);
    if (!again) for (let i = 0; i < st; i++) setTimeout(() => Snd.tone(660 + i * 220, 0.2, { type: 'triangle', vol: 0.12 }), 300 + i * 220);
  }
  function showLose() {
    const on = !!G.net;
    openOverlay('lose', `<div class="box">
      <h2>⌛ ${t('cc_out')}</h2>
      ${teamLine()}
      <p>${t('cc_outMsg')}</p>
      <div class="col">
        <button class="btn" data-act="undo">⏮ ${t('cc_undoLoop')}</button>
        <button class="btn sec" data-act="restartLevel">${on ? t('cc_retry') : '⟲ ' + t('cc_restartLevel')}</button>
        ${on ? `<button class="btn sec" data-act="room">${t('cc_toRoom')}</button>` : `<button class="btn sec" data-act="levels">🗺️ ${t('cc_levels')}</button>`}
      </div>
      <p class="small" id="ccReq"></p>
    </div>`);
  }
  // ---- online screens
  function showOnline() {
    const prev = $('ccCode') ? $('ccCode').value : '', authName = window.Auth && Auth.name && Auth.name();
    let typed = ''; try { typed = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}
    openOverlay('online', `<div class="box">
      <h2>🌐 ${t('cc_onTitle')}</h2>
      <p>${t('cc_onDesc')}</p>
      ${authName ? `<div class="who">${t('cc_hello', { p: escapeHtml(authName) })}</div>` : `<label class="fld"><span>${t('cc_yourName')}</span><input id="ccName" maxlength="16" value="${escapeHtml(typed)}" placeholder="${t('cc_courier')}" autocomplete="off" spellcheck="false" dir="auto"></label>`}
      <div class="col"><button class="btn" data-act="create">${t('cc_create')}</button></div>
      <div class="or">${t('cc_or')}</div>
      <div class="joinrow"><input class="code" id="ccCode" maxlength="6" value="${escapeHtml(prev)}" placeholder="${t('cc_codePh')}" autocomplete="off" spellcheck="false"><button class="btn sec" data-act="join">${t('cc_join')}</button></div>
      <div class="msg" id="ccMsg"></div>
      <div class="row"><button class="btn sec sm" data-act="menu">${t('cc_back')}</button></div>
    </div>`, true);
    const inp = $('ccCode');
    if (inp) { inp.oninput = () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; inp.onkeydown = (e) => { if (e.key === 'Enter') ACTIONS.join(); }; }
  }
  function showLobby() {
    G.scene = 'lobby';
    const P = ON.partner, me = ON.role, host = me === 'host';
    const mx = Math.max(maxUnlockedIdx(), P ? P.ul | 0 : 0);
    G.sel = Math.max(0, Math.min(mx, G.sel | 0));
    const L = LEVELS[G.sel], cst = coopStarsOf(L.id);
    const roleTxt = (r) => r === 'host' ? `${t('cc_c1')} · ${t('cc_hostR')}` : r === 'guest' ? t('cc_c2') : t('cc_connecting');
    const dot = (r) => `<span class="pdot" style="background:${r === 'guest' ? PCOL[1] : r === 'host' ? PCOL[0] : '#59607f'}"></span>`;
    const lvTxt = `<b>${L.id} · ${t('cc_n' + L.id)}</b><span class="st">${'★'.repeat(cst)}<i>${'★'.repeat(3 - cst)}</i></span>`;
    openOverlay('lobby', `<div class="box">
      <h2>🌐 ${t('cc_onTitle')}</h2>
      <div class="roomcode"><span>${t('cc_room')}</span><b>${escapeHtml(ON.code)}</b><button class="btn sec sm" data-act="copy">${t('cc_copyLink')}</button></div>
      <div class="plist">
        <div class="pl">${dot(me)}<div><b dir="auto">${escapeHtml(myName())}</b><small>${t('cc_you')} · ${roleTxt(me)}</small></div></div>
        ${P ? `<div class="pl">${dot(P.role)}<div><b dir="auto">${escapeHtml(P.n)}</b><small>${t('cc_partner')} · ${roleTxt(P.role)}</small></div></div>`
          : `<div class="pl wait">${t(ON.ready ? 'cc_waitPartner' : 'cc_connecting')}</div>`}
      </div>
      ${P && me ? `<div class="row"><button class="btn sec sm" data-act="swap">${t('cc_swap')}</button></div>` : ''}
      ${host ? `<div class="picker"><button class="btn sec sm" data-act="lvSel" data-d="-1" ${G.sel <= 0 ? 'disabled' : ''}>‹</button><div class="grow"><small>${t('cc_levelOf')}</small>${lvTxt}</div><button class="btn sec sm" data-act="lvSel" data-d="1" ${G.sel >= mx ? 'disabled' : ''}>›</button></div>
        <div class="col"><button class="btn" data-act="startOn" ${P ? '' : 'disabled'}>${t('cc_start')}</button></div>${P ? '' : `<p class="small">${t('cc_needPartner')}</p>`}`
        : me === 'guest' ? `<div class="picker"><div class="grow"><small>${t('cc_levelOf')} · ${t('cc_hostPicks')}</small>${lvTxt}</div></div><p class="small">${t('cc_waitHost')}</p>` : ''}
      <div class="row"><button class="btn sec sm" data-act="leave">${t('cc_leave')}</button></div>
    </div>`, true);
  }
  function showLost() {
    openOverlay('lost', `<div class="box">
      <h2>👋 ${t('cc_partnerLost')}</h2>
      <p>${t('cc_partnerLostD')}</p>
      <div class="col">
        <button class="btn" data-act="solo">${t('cc_continueSolo')}</button>
        <button class="btn sec" data-act="leave">🏁 ${t('cc_menu')}</button>
      </div>
    </div>`);
  }
  let toastTm = 0;
  function toast(msg) { const el = $('toast'); if (!el) return; el.textContent = msg; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; clearTimeout(toastTm); toastTm = setTimeout(() => { el.hidden = true; }, 2600); }
  function copyText(text, btn) {
    const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = t('cc_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
  }
  function saveTypedName() { const el = $('ccName'); if (!el) return; const v = el.value.trim().slice(0, 16); try { if (v) localStorage.setItem(NAME_KEY, v); else localStorage.removeItem(NAME_KEY); } catch (e) {} }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

  // ------------------------------------------------------------------ game flow
  // set up a level (no loop yet). Solo: one live courier. Online: G.net is set by the caller first.
  function prepLevel(i) {
    const L0 = LEVELS[i];
    G.li = i; G.L = L0; G.scene = 'play'; G.loops = []; G.round = 0; G.roundSizes = []; G.pausedBy = '';
    if (!G.net) { G.myOwn = 0; G.coopLvl = false; G.slots = [0]; }
    else { G.coopLvl = true; G.slots = G.net.host ? (ON.partner ? [0, 1] : [0]) : [0, 1]; if (ON.partner) G.pName = ON.partner.n; }
    // turn wide levels sideways on tall screens when that makes the tiles clearly bigger (each player decides for their own screen)
    const vw = innerWidth, vh = innerHeight, H0 = L0.map.length, W0 = Math.max(...L0.map.map(r => r.length));
    const fit = (W, H) => Math.min((vw - 24) / W, (vh - 120 - (isTouch ? 176 : 0)) / (H + 0.7));
    G.rot = vh > vw * 1.2 && W0 > H0 && fit(H0, W0) > fit(W0, H0) * 1.15;
    G.H0 = H0; G.W0 = W0;
    G.lv = E.parse(G.rot ? rotateLevel(L0) : L0);
    buildNetMap();
    prepLevelArt();
    closeOverlay(); tipEl.hidden = true;
  }
  function startLevel(i) {
    prepLevel(i); G.newLvl = true;
    beginLoop(); layout();
    showTip(true);
    Snd.init(); Snd.play('start');
  }
  function beginLoop(netLid) {
    const lv = G.lv;
    G.loopId = netLid !== undefined ? netLid : G.loopId + 1;
    G.histBase = G.loops.length; G.histSlots = G.slots.slice();
    G.w = E.newWorld(lv, G.loops.length + G.slots.length);
    G.hist = [E.clone(G.w)];
    G.curs = G.slots.map(() => ({ acts: [], path: [[lv.spawn.x, lv.spawn.y]], marks: [] }));
    G.cur = G.curs[mySlot()] || G.curs[0];
    G.done = G.slots.map(() => false);
    G.phase = 'ready'; G.acc = 0; G.simTime = 0; G.lostShown = false; G.meDeadShown = false; G.evT = 0;
    G.desync = G.loops.map(() => -1);
    G.doorVis = Array.from(G.w.open);
    G.colAnim = []; G.fx = G.fx.filter(p => p.keep);
    clearInput(); clearRemote();
    const co = coopOn();
    setBanner(G.round ? (co ? 'cc_readyCoEcho' : 'cc_readyEcho') : (co ? 'cc_readyCo' : 'cc_ready'), '', true);
    updateTop();
    if (isHost()) { ON.evHist = []; sendLoop(); }
  }
  function startRun() {
    if (G.phase !== 'ready') return;
    G.phase = 'run'; G.acc = 0;
    setBanner(null); tipEl.hidden = true;
    Snd.play('start');
    doTick();   // the first input acts right away
  }
  function me() { return G.loops.length + mySlot(); }
  // one 0.2 s tick of the authoritative world (solo, or the host online): echoes replay, live couriers act
  function doTick() {
    const w = G.w, base = G.loops.length, ms = mySlot(), i = base + ms, b = w.bots[i];
    const acts = G.loops.map(L => L.acts[w.t] | 0);
    G.slots.forEach((own, k) => {
      const bk = w.bots[base + k];
      const a = (G.phase === 'run' && !bk.dead && !G.done[k]) ? (k === ms ? sample(i) : sampleRemote()) : 0;
      acts.push(a); G.curs[k].acts.push(a);
    });
    E.step(G.lv, w, acts);
    G.hist.push(E.clone(w));
    G.slots.forEach((own, k) => { const bk = w.bots[base + k]; G.curs[k].path.push([bk.x, bk.y]); });
    G.loops.forEach((L, gi) => {
      const p = L.path[w.t], gb = w.bots[gi];
      if (G.desync[gi] < 0 && p && gb.dead !== 2 && (p[0] !== gb.x || p[1] !== gb.y)) G.desync[gi] = w.t;
    });
    if (!G.scripted) effects(w.ev, i);
    for (const ev of w.ev) for (let k = 0; k < G.slots.length; k++) if (ev.b === base + k && /^(pick|drop|fry|fall)$/.test(ev.e)) G.curs[k].marks.push({ t: w.t, e: ev.e });
    if (isHost()) noteEvents(w);
    if (w.won) { G.phase = 'done'; G.doneT = 0; G.doneAt = performance.now(); onDelivered(); stDirty(); return; }
    if (w.pkg.s === 2 && !G.lostShown) { G.lostShown = true; setBanner('cc_lost', 'bad'); }
    if (G.phase === 'run') {
      // the loop fast-forwards once every live courier is wrecked, fallen or done (solo: just you)
      const out = G.slots.every((o, k) => w.bots[base + k].dead || G.done[k]);
      if (out) { G.phase = 'ff'; setBanner(b.dead ? (b.dead === 1 ? 'cc_fried' : 'cc_fell') : 'cc_ff', b.dead ? 'bad' : 'warn'); }
      else if (b.dead && !G.meDeadShown) { G.meDeadShown = true; setBanner(b.dead === 1 ? 'cc_friedCo' : 'cc_fellCo', 'bad'); }
    }
    if (w.t >= TICKS) endLoop();
    else if (!G.scripted && G.phase === 'run') {
      if (w.t % 5 === 0) Snd.play(w.t >= 35 ? 'warn' : 'sec');
    }
    stDirty();
  }
  function endLoop() {
    // every live courier's run becomes an echo (online: both of them, each keeping its owner's tint)
    G.curs.forEach((c, k) => {
      const acts = c.acts.slice(); while (acts.length < TICKS) acts.push(0);
      G.loops.push({ acts, path: c.path.slice(), marks: c.marks.slice(), own: G.slots[k], round: G.round });
    });
    G.roundSizes.push(G.curs.length); G.round++;
    updateTop();
    if (G.round >= G.lv.maxLoops) { G.phase = 'over'; setBanner(null); if (!G.scripted) Snd.play('lose'); showLose(); stDirty(); return; }
    G.phase = 'rewind'; G.rewindT = 0; setBanner('cc_rewind', 'warn');
    if (!G.scripted) { Snd.play('rewind'); G.flash = 0.5; }
    stDirty();
  }
  function onDelivered() {
    const used = G.round + 1, L = G.L;
    const st = Math.max(1, Math.min(3, 3 - (used - L.par)));
    G.lastStars = st; G.lastLoops = used;
    const P = G.coopLvl ? coop : prog, prevLoops = P.loops[L.id];
    G.newBest = !!prevLoops && used < prevLoops;
    P.stars[L.id] = Math.max(P.stars[L.id] | 0, st);
    P.loops[L.id] = prevLoops ? Math.min(prevLoops, used) : used;
    if (G.coopLvl) saveCoop(); else saveProg();
    setBanner(null);
    if (!G.scripted) { G.shake = Math.max(G.shake, 6); G.flash = 0.6; }
  }
  function reqHost(act) { netSend('req', { act }); const r = $('ccReq'); if (r) r.textContent = t('cc_waitReq'); }
  function restartLoop() {
    if (G.scene !== 'play') return;
    if (isGuest()) { reqHost('restartLoop'); return; }
    if (G.overlay === 'lose' || G.phase === 'over') { undoLoop(); return; }
    if (G.overlay) closeOverlay();
    if (G.phase === 'done') return;
    beginLoop(); Snd.play('click');
  }
  function undoLoop() {
    if (G.scene !== 'play') return;
    if (isGuest()) { reqHost('undo'); return; }
    if (G.phase === 'done' && !G.overlay) return;
    if (G.overlay) closeOverlay();
    if (G.round) { const n = G.roundSizes.pop() || 1; G.loops.splice(G.loops.length - n, n); G.round--; }
    beginLoop(); Snd.play('rewind');
  }
  function restartLevel() { if (isGuest()) { reqHost('restartLevel'); return; } startLevel(G.li); }
  function endLoopNow() {
    if (G.scene !== 'play' || G.overlay) return;
    if (coopOn()) { if (isGuest()) netSend('req', { act: 'end' }); else markDone(mySlot()); return; }
    if (G.phase === 'ready') { G.phase = 'run'; setBanner(null); }
    if (G.phase !== 'run') return;
    G.phase = 'ff'; G.acc = 0; setBanner('cc_ff', 'warn');
  }
  // online ⏭: "I'm done for this loop" — that courier waits; the loop fast-forwards when both are done (or wrecked)
  function markDone(k) {
    if (!G.w || k < 0 || k >= G.slots.length) return;
    if (G.phase === 'ready') { G.phase = 'run'; G.acc = 0; setBanner(null); tipEl.hidden = true; }
    if (G.phase !== 'run') return;
    G.done[k] = true;
    const base = G.loops.length;
    if (G.slots.every((o, j) => G.done[j] || G.w.bots[base + j].dead)) { G.phase = 'ff'; G.acc = 0; setBanner('cc_ff', 'warn'); }
    else if (k === mySlot()) setBanner('cc_waitDone', 'warn', true);
    stDirty();
  }
  function pause() {
    if (G.scene !== 'play' || G.overlay || G.phase === 'done') return;
    clearInput(); G.pausedBy = ''; showPause();
    if (G.net && ON.partner) netSend('pause', { on: true });
  }
  function resume() { closeOverlay(); if (G.net && ON.partner) netSend('pause', { on: false }); }
  function nextLevel() {
    if (isGuest()) { reqHost('next'); return; }
    if (G.li < LEVELS.length - 1) startLevel(G.li + 1); else if (G.net) { netSend('lobby', {}); toLobby(); } else showLevels();
  }

  // ------------------------------------------------------------------ effects (sound + particles)
  function tileC(x, y) { return [x + 0.5, y + 0.5]; }
  function effects(evs, mine) {
    let collapsed = false;
    for (const ev of evs) {
      const ghost = ev.b !== undefined && ev.b !== mine;
      switch (ev.e) {
        case 'step': if (!ghost) Snd.play('step'); break;
        case 'bump': if (!ghost) Snd.play('bump'); break;
        case 'push': Snd.play('push', ghost); puff(ev.x, ev.y, 5, '#9aa3c7'); break;
        case 'pick': Snd.play('pick', ghost); sparkle(ev.x, ev.y, '#ffd166', 10); break;
        case 'drop': Snd.play('drop', ghost); puff(ev.x, ev.y, 4, '#ffd166'); break;
        case 'fill': Snd.play('fill'); puff(ev.x, ev.y, 10, '#8a6a4a'); G.shake = Math.max(G.shake, 4); break;
        case 'collapse': if (!collapsed) { Snd.play('collapse'); collapsed = true; } collapseFx(ev.x, ev.y); G.shake = Math.max(G.shake, 7); break;
        case 'crack': Snd.play('crack'); puff(ev.x, ev.y, 3, '#6b6f8a'); break;
        case 'fall': if (!ev.wreck) Snd.play('fall'); break;
        case 'fry': Snd.play('fry'); sparks(ev.x, ev.y, 22); G.shake = Math.max(G.shake, 5); G.flash = Math.max(G.flash, 0.25); break;
        case 'switch': Snd.play('switch'); ring(ev.x, ev.y, CHC[ev.ch]); break;
        case 'plate': Snd.play('plate'); break;
        case 'door': Snd.play(ev.open ? 'door' : 'doorc'); break;
        case 'lost': Snd.play('lost'); break;
        case 'deliver': Snd.play('deliver'); confetti(ev.x, ev.y); break;
      }
    }
  }
  const R = Math.random;
  function puff(x, y, n, col) { for (let i = 0; i < n; i++) G.fx.push({ k: 'dust', x: x + 0.5 + (R() - .5) * .6, y: y + 0.6 + (R() - .5) * .4, vx: (R() - .5) * .8, vy: -R() * .4, life: 0, max: .5 + R() * .4, r: .12 + R() * .12, col }); }
  function sparkle(x, y, col, n) { for (let i = 0; i < n; i++) { const a = R() * 6.28, v = 1 + R() * 2.5; G.fx.push({ k: 'spark', x: x + .5, y: y + .35, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: .35 + R() * .3, col, g: 3 }); } }
  function sparks(x, y, n) { for (let i = 0; i < n; i++) { const a = R() * 6.28, v = 2 + R() * 5; G.fx.push({ k: 'spark', x: x + .5, y: y + .35, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 0, max: .3 + R() * .5, col: R() < .5 ? '#ff5d73' : '#ffe08a', g: 9 }); }
    for (let i = 0; i < 8; i++) G.fx.push({ k: 'smoke', x: x + .5 + (R() - .5) * .3, y: y + .3, vx: (R() - .5) * .3, vy: -.5 - R() * .5, life: 0, max: 1 + R(), r: .15 + R() * .1 }); }
  function ring(x, y, col) { G.fx.push({ k: 'ring', x: x + .5, y: y + .5, life: 0, max: .5, col }); }
  function collapseFx(x, y) {
    G.colAnim.push({ x, y, t0: G.time });
    for (let i = 0; i < 12; i++) G.fx.push({ k: 'debris', x: x + R(), y: y + R(), vx: (R() - .5) * 1.5, vy: (R() - .5) * 1.5, vz: 0, life: 0, max: .9 + R() * .5, r: .06 + R() * .1, rot: R() * 6, vr: (R() - .5) * 10, col: R() < .5 ? '#3a4370' : '#232a4d' });
    puff(x, y, 8, '#59607f');
  }
  function confetti(x, y) {
    for (let i = 0; i < 70; i++) { const a = -Math.PI / 2 + (R() - .5) * 2.2, v = 3 + R() * 6; G.fx.push({ k: 'conf', x: x + .5, y: y + .3, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 1.4 + R(), col: LOOPC[i % 5], rot: R() * 6, vr: (R() - .5) * 14, g: 7, keep: 1 }); }
    G.fx.push({ k: 'ring', x: x + .5, y: y + .5, life: 0, max: .8, col: '#ffb703', big: 1 });
  }

  // ------------------------------------------------------------------ layout
  let vw = 0, vh = 0, dpr = 1, s = 40, ox = 0, oy = 0, TL = { x: 0, y: 0, w: 0, h: 0 }, FR = { x0: 0, y0: 0, x1: 0, y1: 0 };
  const RIM = 0.4;   // the outer wall ring is drawn as a thin rim this many tiles wide
  const topBottom = () => { const r = $('top').getBoundingClientRect(); return r.bottom; };
  function layout() {
    vw = innerWidth; vh = innerHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bakeSky();
    updateTop();
    if (!G.lv) return;
    const lv = G.lv, top = topBottom() + 8;
    const touch = isTouch, side = touch && vw > vh * 1.15;
    padEl.classList.toggle('side', side);
    const padB = touch && !side ? 178 : 0, padS = side ? 172 : 0;
    const tlH = 46 + (lv.maxLoops - 1) * (G.coopLvl ? 6 : 5);
    const availW = vw - 24 - padS * 2, availH = vh - top - padB - 10 - tlH - 14;
    const vW = lv.W - 2 + 2 * RIM, vH = lv.H - 2 + 2 * RIM;
    s = Math.floor(Math.min(availW / vW, availH / (vH + 0.32 + 0.34), 80));
    s = Math.max(12, s);
    const fw = Math.round(s * vW), fh = Math.round(s * vH);
    const block = s * 0.32 + fh + s * 0.34 + 14 + tlH;
    const y0 = top + Math.max(0, (vh - top - padB - 10 - block) / 2);
    const fx0 = Math.round((vw - fw) / 2), fy0 = Math.round(y0 + s * 0.32);
    ox = fx0 - (1 - RIM) * s; oy = fy0 - (1 - RIM) * s;
    FR = { x0: fx0, y0: fy0, x1: fx0 + fw, y1: fy0 + fh };
    const tw = Math.min(Math.max(fw, 300), vw - 20 - padS * 2);
    TL = { x: Math.round((vw - tw) / 2), y: Math.round(FR.y1 + s * 0.34 + 12), w: tw, h: tlH };
    G.bannerY = Math.max(top + 4, FR.y0 - s * 0.32 - 34);
    if (G.bannerY < top + 2) G.bannerY = top + 2;
    renderBanner();
    if (!tipEl.hidden) placeTip();
  }
  function placeTip() {
    const below = TL.y + TL.h + 10, h = tipEl.offsetHeight || 64;
    tipEl.style.top = (G.lv && !isTouch && below + h < vh - 6 ? below : topBottom() + 6) + 'px';
  }
  addEventListener('resize', layout);
  document.addEventListener('langchange', () => { refreshTopLabels(); renderBanner(); rerender(); if (!tipEl.hidden && G.L) showTip(false); });

  // ------------------------------------------------------------------ art helpers
  function hash(x, y, k) { let h = (x * 374761393 + y * 668265263 + (k || 0) * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
  const ease = (a) => a < 0 ? 0 : a > 1 ? 1 : a * a * (3 - 2 * a);

  // per-level static art: crack shapes, window lights
  let ART = null;
  function prepLevelArt() {
    const lv = G.lv, id = G.L.id;
    ART = { cracks: {}, win: {} };
    for (let y = 0; y < lv.H; y++) for (let x = 0; x < lv.W; x++) {
      const i = y * lv.W + x;
      const lines = [];
      const n = 3 + ((hash(x, y, id) * 3) | 0);
      for (let k = 0; k < n; k++) {
        let px = 0.5 + (hash(x, y, k + 9) - 0.5) * 0.2, py = 0.5 + (hash(y, x, k + 3) - 0.5) * 0.2; const pts = [[px, py]];
        const a0 = hash(x, y, k * 7 + 1) * 6.283;
        for (let j = 0; j < 3; j++) { const a = a0 + (hash(x + j, y, k) - 0.5) * 1.2; px += Math.cos(a) * 0.17; py += Math.sin(a) * 0.17; pts.push([px, py]); }
        lines.push(pts);
      }
      ART.cracks[i] = lines;
      const wl = [];
      for (let k = 0; k < 4; k++) wl.push(hash(x, y, 40 + k) < 0.55 ? (hash(x, y, 50 + k) < 0.7 ? '#ffcf70' : '#7ff6ff') : null);
      ART.win[i] = wl;
    }
  }

  // ------------------------------------------------------------------ background (baked skyline + live debris)
  let sky = null;
  function bakeSky() {
    sky = document.createElement('canvas'); sky.width = Math.max(1, Math.round(vw * dpr)); sky.height = Math.max(1, Math.round(vh * dpr));
    const c = sky.getContext('2d'); c.scale(dpr, dpr);
    const g = c.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, '#060814'); g.addColorStop(0.55, '#0d1130'); g.addColorStop(1, '#1b1033');
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    // haze glow
    const hg = c.createRadialGradient(vw * 0.5, vh * 1.05, 10, vw * 0.5, vh * 1.05, vh * 0.9); hg.addColorStop(0, 'rgba(255,95,162,.22)'); hg.addColorStop(1, 'rgba(255,95,162,0)');
    c.fillStyle = hg; c.fillRect(0, 0, vw, vh);
    // stars
    for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(200,210,255,${0.15 + hash(i, 1) * 0.5})`; c.fillRect(hash(i, 2) * vw, hash(i, 3) * vh * 0.6, 1.2, 1.2); }
    // skyline layers
    const layers = [{ base: vh * 0.62, h: vh * 0.3, col: '#0b0e24', win: 0.18, w: 46 }, { base: vh * 0.75, h: vh * 0.36, col: '#0e1230', win: 0.28, w: 64 }, { base: vh * 0.9, h: vh * 0.42, col: '#121636', win: 0.38, w: 84 }];
    layers.forEach((L, li) => {
      let x = -20, k = 0;
      while (x < vw + 20) {
        const bwid = L.w * (0.6 + hash(k, li, 7) * 0.9), bht = L.h * (0.35 + hash(k, li, 8) * 0.65), top = L.base + vh * 0.15 - bht;
        const broken = hash(k, li, 9) < 0.3;
        c.fillStyle = L.col; c.beginPath(); c.moveTo(x, vh); c.lineTo(x, top);
        if (broken) { c.lineTo(x + bwid * 0.3, top + 10 + hash(k, li, 10) * 20); c.lineTo(x + bwid * 0.55, top - 6); c.lineTo(x + bwid * 0.8, top + 18); } else { c.lineTo(x + bwid, top); }
        c.lineTo(x + bwid, broken ? top + 8 : top); c.lineTo(x + bwid, vh); c.fill();
        if (hash(k, li, 11) < 0.35) { c.fillRect(x + bwid * 0.45, top - 14, 2, 14); }
        for (let wy = top + 8; wy < vh; wy += 9) for (let wx = x + 5; wx < x + bwid - 5; wx += 8) {
          const hv = hash(wx | 0, wy | 0, li);
          if (hv < L.win * 0.5) { c.fillStyle = hv < L.win * 0.12 ? 'rgba(127,246,255,.55)' : 'rgba(255,190,90,.45)'; c.fillRect(wx, wy, 3, 4); }
        }
        x += bwid + 2 + hash(k, li, 12) * 10; k++;
      }
    });
  }
  function spawnBgDebris(n) {
    for (let i = 0; i < n; i++) G.bgfx.push({ x: R() * vw, y: -20 - R() * vh * 0.3, vy: 60 + R() * 140, vx: (R() - .5) * 20, r: 1 + R() * 3.5, rot: R() * 6, vr: (R() - .5) * 4, a: 0.25 + R() * 0.45, life: 0 });
  }

  // ------------------------------------------------------------------ board drawing
  const isWallish = (k) => k === K.WALL || k === K.LASER || k === K.SLOT;
  function groundAt(w, x, y) { const lv = G.lv; if (x < 0 || y < 0 || x >= lv.W || y >= lv.H) return K.WALL; return w.ground[y * lv.W + x]; }

  function drawFloorTile(X, Y, x, y, alt) {
    ctx.fillStyle = alt ? '#1b2245' : '#192040'; ctx.fillRect(X, Y, s, s);
    ctx.strokeStyle = 'rgba(120,140,220,.10)'; ctx.lineWidth = 1; ctx.strokeRect(X + 0.5, Y + 0.5, s - 1, s - 1);
    const h = hash(x, y, 5);
    if (h < 0.18) { ctx.fillStyle = 'rgba(60,242,208,.06)'; ctx.fillRect(X + s * 0.1, Y + s * 0.45, s * 0.8, s * 0.1); }
    else if (h > 0.9) { ctx.fillStyle = 'rgba(255,183,3,.07)'; for (let k = 0; k < 3; k++) ctx.fillRect(X + s * (0.2 + k * 0.22), Y + s * 0.15, s * 0.1, s * 0.7); }
    ctx.fillStyle = 'rgba(140,160,255,.12)'; const b = Math.max(1, s * 0.05);
    ctx.fillRect(X + s * 0.1, Y + s * 0.1, b, b); ctx.fillRect(X + s * 0.86, Y + s * 0.1, b, b); ctx.fillRect(X + s * 0.1, Y + s * 0.86, b, b); ctx.fillRect(X + s * 0.86, Y + s * 0.86, b, b);
  }
  function drawPit(X, Y, x, y, w) {
    const g = ctx.createLinearGradient(0, Y, 0, Y + s); g.addColorStop(0, '#04050d'); g.addColorStop(1, '#140c26');
    ctx.fillStyle = g; ctx.fillRect(X, Y, s, s);
    // distant lights far below
    for (let k = 0; k < 3; k++) {
      const hx = hash(x, y, 60 + k), hy = hash(x, y, 70 + k), tw = 0.5 + 0.5 * Math.sin(G.time * (1 + hx * 2) + hy * 9);
      ctx.fillStyle = `rgba(${k ? '255,170,80' : '127,246,255'},${0.18 + 0.25 * tw})`; ctx.fillRect(X + hx * s * 0.9, Y + s * 0.35 + hy * s * 0.6, 1.5, 1.5);
    }
    // cliff face under the tile above
    if (!isPitLike(groundAt(w, x, y - 1))) {
      const cg = ctx.createLinearGradient(0, Y, 0, Y + s * 0.42); cg.addColorStop(0, '#2b3463'); cg.addColorStop(1, 'rgba(10,11,28,0)');
      ctx.fillStyle = cg; ctx.fillRect(X, Y, s, s * 0.42);
      ctx.fillStyle = '#3a4580'; ctx.beginPath(); ctx.moveTo(X, Y);
      for (let k = 0; k <= 6; k++) ctx.lineTo(X + s * k / 6, Y + 2 + hash(x * 7 + k, y, 3) * s * 0.07);
      ctx.lineTo(X + s, Y); ctx.fill();
    }
  }
  const isPitLike = (k) => k === K.PIT;
  function drawCracks(X, Y, i, amt, col) {
    const L = ART.cracks[i]; if (!L) return;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s * 0.03) * (1 + amt); ctx.lineCap = 'round';
    const n = Math.max(1, Math.ceil(L.length * (0.45 + amt * 0.55)));
    for (let k = 0; k < n; k++) { const pts = L[k]; ctx.beginPath(); ctx.moveTo(X + pts[0][0] * s, Y + pts[0][1] * s); for (let j = 1; j < pts.length; j++) ctx.lineTo(X + pts[j][0] * s, Y + pts[j][1] * s); ctx.stroke(); }
  }
  function drawConveyorBase(X, Y, dir, slot) {
    ctx.fillStyle = '#10152b'; ctx.fillRect(X + 1, Y + 1, s - 2, s - 2);
    const horiz = dir === 2 || dir === 4;
    ctx.fillStyle = '#2a3260';
    if (horiz) { ctx.fillRect(X, Y + s * 0.08, s, s * 0.07); ctx.fillRect(X, Y + s * 0.85, s, s * 0.07); }
    else { ctx.fillRect(X + s * 0.08, Y, s * 0.07, s); ctx.fillRect(X + s * 0.85, Y, s * 0.07, s); }
    // moving chevrons
    const ph = (G.simTime / (TICK * E.CONV_EVERY)) % 1;
    ctx.save(); ctx.beginPath(); ctx.rect(X + s * 0.15, Y + s * 0.15, s * 0.7, s * 0.7); ctx.clip();
    ctx.translate(X + s / 2, Y + s / 2); ctx.rotate([0, -Math.PI / 2, 0, Math.PI / 2, Math.PI][dir]);
    ctx.strokeStyle = slot ? 'rgba(255,183,3,.55)' : 'rgba(90,209,255,.55)'; ctx.lineWidth = Math.max(1.5, s * 0.07); ctx.lineJoin = 'round';
    for (let k = -1; k < 2; k++) { const cx = (k + ph) * s * 0.5; ctx.beginPath(); ctx.moveTo(cx - s * 0.1, -s * 0.2); ctx.lineTo(cx + s * 0.08, 0); ctx.lineTo(cx - s * 0.1, s * 0.2); ctx.stroke(); }
    ctx.restore();
  }
  const FULL = [0, 0, 1, 1];
  function rimRect(x, y) {
    const lv = G.lv;
    return [x === 0 ? 1 - RIM : 0, y === 0 ? 1 - RIM : 0, x === lv.W - 1 ? RIM : 1, y === lv.H - 1 ? RIM : 1];
  }
  function drawBlock(X, Y, L, top, front, opts) {
    opts = opts || {};
    const r = opts.rect || FULL, x0 = X + r[0] * s, y0 = Y + r[1] * s, w = (r[2] - r[0]) * s, y1 = Y + r[3] * s;
    // front face
    const fg = ctx.createLinearGradient(0, y1 - L, 0, y1); fg.addColorStop(0, front); fg.addColorStop(1, shade(front, -0.35));
    ctx.fillStyle = fg; ctx.fillRect(x0, y1 - L, w, L);
    if (opts.win && !opts.rect) { for (let k = 0; k < 4; k++) { const c = opts.win[k]; if (!c) continue; ctx.fillStyle = c; ctx.globalAlpha = 0.55 + 0.25 * Math.sin(G.time * 0.7 + k + X); ctx.fillRect(X + s * (0.1 + k * 0.22), Y + s - L * 0.72, s * 0.12, L * 0.38); } ctx.globalAlpha = 1; }
    // top face
    const tg = ctx.createLinearGradient(0, y0 - L, 0, y1 - L); tg.addColorStop(0, shade(top, 0.08)); tg.addColorStop(1, top);
    ctx.fillStyle = tg; ctx.fillRect(x0, y0 - L, w, y1 - y0);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x0, y0 - L, w, Math.max(1, s * 0.04));
  }
  function drawWall(X, Y, x, y, w, i) {
    const L = s * 0.32, below = groundAt(w, x, y + 1), lv = G.lv;
    const border = x === 0 || y === 0 || x === lv.W - 1 || y === lv.H - 1;
    const rc = border ? rimRect(x, y) : null;
    drawBlock(X, Y, L, border ? '#1a2045' : '#262f61', border ? '#10142f' : '#151b3a', { win: isWallish(below) ? null : ART.win[i], rect: rc });
    const T = Y - L, h = hash(x, y, 21), lw = Math.max(1, s * 0.035);
    if (!border) {
      // rooftop props
      if (h < 0.22) { // AC unit with a fan
        ctx.fillStyle = '#1b2247'; rr(X + s * 0.18, T + s * 0.2, s * 0.42, s * 0.36, s * 0.05); ctx.fill();
        ctx.strokeStyle = '#3a4682'; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(X + s * 0.39, T + s * 0.38, s * 0.12, 0, 7); ctx.stroke();
        ctx.save(); ctx.translate(X + s * 0.39, T + s * 0.38); ctx.rotate(G.time * 6 + h * 9); ctx.fillStyle = '#4a5698'; ctx.fillRect(-s * 0.1, -1, s * 0.2, 2); ctx.fillRect(-1, -s * 0.1, 2, s * 0.2); ctx.restore();
      } else if (h < 0.36) { // antenna with a blinking light
        ctx.strokeStyle = '#4a5698'; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X + s * 0.66, T + s * 0.72); ctx.lineTo(X + s * 0.66, T + s * 0.24); ctx.stroke();
        ctx.fillStyle = (G.time * 1.5 + h * 9) % 1.5 < 0.4 ? '#ff5fa2' : '#4a2040'; ctx.beginPath(); ctx.arc(X + s * 0.66, T + s * 0.22, Math.max(1.5, s * 0.045), 0, 7); ctx.fill();
      } else if (h < 0.5) { // skylight
        ctx.fillStyle = 'rgba(127,246,255,.16)'; ctx.fillRect(X + s * 0.25, T + s * 0.25, s * 0.5, s * 0.3);
        ctx.strokeStyle = 'rgba(127,246,255,.35)'; ctx.lineWidth = 1; ctx.strokeRect(X + s * 0.25, T + s * 0.25, s * 0.5, s * 0.3);
      } else if (h < 0.62) { // vents
        ctx.fillStyle = '#1b2247'; for (let k = 0; k < 3; k++) ctx.fillRect(X + s * 0.22, T + s * (0.25 + k * 0.14), s * 0.56, s * 0.07);
      }
      // neon trim on the edges that face the street
      ctx.strokeStyle = 'rgba(60,242,208,.38)'; ctx.lineWidth = lw; ctx.beginPath();
      if (!isWallish(groundAt(w, x, y - 1))) { ctx.moveTo(X, T + 1); ctx.lineTo(X + s, T + 1); }
      if (!isWallish(below)) { ctx.moveTo(X, T + s - 1); ctx.lineTo(X + s, T + s - 1); }
      if (!isWallish(groundAt(w, x - 1, y))) { ctx.moveTo(X + 1, T); ctx.lineTo(X + 1, T + s); }
      if (!isWallish(groundAt(w, x + 1, y))) { ctx.moveTo(X + s - 1, T); ctx.lineTo(X + s - 1, T + s); }
      ctx.stroke();
    } else {
      // neon edge along the inside of the rim
      const x0 = X + rc[0] * s, x1 = X + rc[2] * s, ty0 = Y + rc[1] * s - L, ty1 = Y + rc[3] * s - L;
      ctx.strokeStyle = 'rgba(255,95,162,.42)'; ctx.lineWidth = lw; ctx.beginPath();
      if (y === 0 && x > 0 && x < lv.W - 1 && !isWallish(below)) { ctx.moveTo(x0, ty1 - 1); ctx.lineTo(x1, ty1 - 1); }
      if (y === lv.H - 1 && x > 0 && x < lv.W - 1 && !isWallish(groundAt(w, x, y - 1))) { ctx.moveTo(x0, ty0 + 1); ctx.lineTo(x1, ty0 + 1); }
      if (x === 0 && y > 0 && y < lv.H - 1 && !isWallish(groundAt(w, 1, y))) { ctx.moveTo(x1 - 1, ty0); ctx.lineTo(x1 - 1, ty1); }
      if (x === lv.W - 1 && y > 0 && y < lv.H - 1 && !isWallish(groundAt(w, x - 1, y))) { ctx.moveTo(x0 + 1, ty0); ctx.lineTo(x0 + 1, ty1); }
      ctx.stroke();
    }
  }
  function drawEmitter(X, Y, x, y, w, i, beam) {
    drawWall(X, Y, x, y, w, i);
    const lv = G.lv, L = s * 0.32, dir = lv.dir[i], on = beam && beam.on;
    const border = x === 0 || y === 0 || x === lv.W - 1 || y === lv.H - 1, rc = border ? rimRect(x, y) : FULL;
    const mx = X + (rc[0] + rc[2]) / 2 * s, my = Y + (rc[1] + rc[3]) / 2 * s - L, rad = s * (border ? 0.24 : 0.3);
    const cx = mx + DX[dir] * rad * 0.9, cy = my + DY[dir] * rad * 0.9;
    ctx.fillStyle = '#0c0f22'; ctx.beginPath(); ctx.arc(mx, my, rad, 0, 7); ctx.fill();
    ctx.strokeStyle = on ? '#ff3b5c' : '#4a3040'; ctx.lineWidth = Math.max(1.5, s * 0.06); ctx.beginPath(); ctx.arc(mx, my, rad * 0.86, 0, 7); ctx.stroke();
    if (lv.ch[i] >= 0) { ctx.strokeStyle = CHC[lv.ch[i]]; ctx.lineWidth = Math.max(1, s * 0.035); ctx.beginPath(); ctx.arc(mx, my, rad * 1.2, 0, 7); ctx.stroke(); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.22); g.addColorStop(0, on ? '#fff' : '#704050'); g.addColorStop(0.4, on ? '#ff3b5c' : '#3a2030'); g.addColorStop(1, 'rgba(255,59,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, 0, 7); ctx.fill();
  }
  function drawSlot(X, Y, x, y, w, i) {
    const L = s * 0.32, dir = G.lv.dir[i];
    drawBlock(X, Y, L, '#283163', '#151b3a');
    // the opening shows the belt running through the wall
    ctx.save(); ctx.translate(0, -L);
    ctx.fillStyle = '#05060f'; rr(X + s * 0.14, Y + s * 0.14, s * 0.72, s * 0.72, s * 0.08); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(X + s * 0.18, Y - L + s * 0.18, s * 0.64, s * 0.64); ctx.clip(); ctx.translate(0, -L); drawConveyorBase(X, Y, dir, true); ctx.restore();
    ctx.strokeStyle = 'rgba(255,183,3,.7)'; ctx.lineWidth = Math.max(1, s * 0.04); rr(X + s * 0.14, Y - L + s * 0.14, s * 0.72, s * 0.72, s * 0.08); ctx.stroke();
    // hazard stripe on the front face
    ctx.save(); ctx.beginPath(); ctx.rect(X, Y + s - L, s, L * 0.4); ctx.clip();
    for (let k = -2; k < 8; k++) { ctx.fillStyle = k % 2 ? '#ffb703' : '#1a1200'; ctx.beginPath(); ctx.moveTo(X + k * s * 0.18, Y + s - L); ctx.lineTo(X + (k + 1) * s * 0.18, Y + s - L); ctx.lineTo(X + (k + 0.5) * s * 0.18, Y + s - L * 0.6); ctx.lineTo(X + (k - 0.5) * s * 0.18, Y + s - L * 0.6); ctx.fill(); }
    ctx.restore();
  }
  function drawDoorFloor(X, Y, ch) {
    ctx.fillStyle = '#121734'; ctx.fillRect(X + s * 0.06, Y + s * 0.06, s * 0.88, s * 0.88);
    ctx.strokeStyle = rgba(CHC[ch], 0.55); ctx.lineWidth = Math.max(1, s * 0.04); ctx.setLineDash([s * 0.12, s * 0.08]); ctx.strokeRect(X + s * 0.1, Y + s * 0.1, s * 0.8, s * 0.8); ctx.setLineDash([]);
  }
  function drawDoor(X, Y, ch, closed, inv) {
    // closed = 0 open .. 1 closed : a barrier that rises out of the floor
    if (closed < 0.02) return;
    const L = s * 0.4 * closed, col = CHC[ch];
    ctx.globalAlpha = 0.35 + 0.65 * closed;
    // front face: hazard stripes in the channel colour
    ctx.save(); ctx.beginPath(); ctx.rect(X + s * 0.04, Y + s - L, s * 0.92, L); ctx.clip();
    ctx.fillStyle = '#10142c'; ctx.fillRect(X, Y + s - L, s, L);
    for (let k = -2; k < 9; k++) { if (k % 2) continue; ctx.fillStyle = rgba(col, 0.75); ctx.beginPath(); ctx.moveTo(X + k * s * 0.15, Y + s); ctx.lineTo(X + (k + 1) * s * 0.15, Y + s); ctx.lineTo(X + (k + 2) * s * 0.15, Y + s - L); ctx.lineTo(X + (k + 1) * s * 0.15, Y + s - L); ctx.fill(); }
    ctx.restore();
    // energy top
    const tg = ctx.createLinearGradient(X, 0, X + s, 0); tg.addColorStop(0, rgba(col, 0.55)); tg.addColorStop(0.5, rgba(col, 0.95)); tg.addColorStop(1, rgba(col, 0.55));
    ctx.fillStyle = tg; ctx.fillRect(X + s * 0.04, Y - L + s * 0.04, s * 0.92, s * 0.92);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    const sh = (G.time * 1.5) % 1; ctx.fillRect(X + s * 0.04, Y - L + s * (0.04 + sh * 0.85), s * 0.92, Math.max(1, s * 0.05));
    ctx.strokeStyle = '#0b0e20'; ctx.lineWidth = Math.max(1, s * 0.05); ctx.strokeRect(X + s * 0.06, Y - L + s * 0.06, s * 0.88, s * 0.88);
    // lock icon / inverted marker
    ctx.fillStyle = 'rgba(10,12,30,.75)'; ctx.font = `900 ${Math.round(s * 0.36)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(inv ? '⇄' : '■', X + s / 2, Y - L + s / 2 + 1);
    ctx.globalAlpha = 1;
  }
  function drawPlate(X, Y, ch, pressed) {
    const m = s * 0.16, col = CHC[ch];
    ctx.fillStyle = '#0d1126'; rr(X + m, Y + m, s - 2 * m, s - 2 * m, s * 0.08); ctx.fill();
    const d = pressed ? 0 : s * 0.05;
    ctx.fillStyle = pressed ? rgba(col, 0.9) : shade(col, -0.45);
    rr(X + m + s * 0.04, Y + m + s * 0.04 - d, s - 2 * m - s * 0.08, s - 2 * m - s * 0.08, s * 0.06); ctx.fill();
    if (pressed) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(X + s / 2, Y + s / 2, 0, X + s / 2, Y + s / 2, s * 0.6); g.addColorStop(0, rgba(col, 0.45)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(X - s * 0.1, Y - s * 0.1, s * 1.2, s * 1.2); ctx.restore(); }
    ctx.strokeStyle = rgba(col, pressed ? 1 : 0.7); ctx.lineWidth = Math.max(1, s * 0.035); rr(X + m, Y + m, s - 2 * m, s - 2 * m, s * 0.08); ctx.stroke();
  }
  function drawSwitch(X, Y, ch, pressed, frac) {
    const col = CHC[ch], cx = X + s / 2, cy = Y + s / 2;
    ctx.fillStyle = '#0d1126'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.36, 0, 7); ctx.fill();
    if (frac > 0) { ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, s * 0.08); ctx.beginPath(); ctx.arc(cx, cy, s * 0.36, -Math.PI / 2, -Math.PI / 2 + frac * 6.283); ctx.stroke(); }
    const d = pressed ? 0 : s * 0.05;
    ctx.fillStyle = pressed || frac > 0 ? col : shade(col, -0.4); ctx.beginPath(); ctx.arc(cx, cy - d, s * 0.22, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(cx - s * 0.06, cy - d - s * 0.07, s * 0.06, 0, 7); ctx.fill();
    ctx.strokeStyle = '#0b0e20'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy - d, s * 0.22, 0, 7); ctx.stroke();
    // timer glyph
    ctx.strokeStyle = 'rgba(10,12,30,.7)'; ctx.lineWidth = Math.max(1, s * 0.035); ctx.beginPath(); ctx.moveTo(cx, cy - d); ctx.lineTo(cx, cy - d - s * 0.12); ctx.moveTo(cx, cy - d); ctx.lineTo(cx + s * 0.08, cy - d); ctx.stroke();
  }
  function drawGoal(X, Y, active) {
    const cx = X + s / 2, cy = Y + s / 2, t = G.time;
    ctx.fillStyle = '#0f2a2a'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.42, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(77,255,181,.9)'; ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.setLineDash([s * 0.16, s * 0.1]); ctx.lineDashOffset = -t * s * 0.5; ctx.beginPath(); ctx.arc(cx, cy, s * 0.38, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    const p = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(77,255,181,${0.25 + 0.25 * p})`; ctx.beginPath(); ctx.arc(cx, cy, s * (0.2 + 0.05 * p), 0, 7); ctx.fill();
    ctx.fillStyle = '#4dffb5'; ctx.font = `900 ${Math.round(s * 0.3)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('▼', cx, cy + 1);
  }
  function drawGoalBeam(X, Y) {
    const cx = X + s / 2, t = G.time;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, Y + s / 2, 0, Y - s * 1.6); g.addColorStop(0, 'rgba(77,255,181,.32)'); g.addColorStop(1, 'rgba(77,255,181,0)');
    ctx.fillStyle = g; const wv = s * (0.28 + 0.03 * Math.sin(t * 3)); ctx.fillRect(cx - wv, Y - s * 1.6, wv * 2, s * 2.1);
    ctx.restore();
  }
  function drawDoom(X, Y, i, w) {
    const at = G.lv.at[i], left = (at - (w.t + (G.phase === 'run' ? G.acc / TICK : 0))) * TICK;
    ctx.save(); ctx.beginPath(); ctx.rect(X + 1, Y + 1, s - 2, s - 2); ctx.clip();
    const urgent = left < 1;
    for (let k = -4; k < 8; k++) { ctx.fillStyle = k % 2 ? (urgent ? 'rgba(255,93,115,.35)' : 'rgba(255,183,3,.22)') : 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.moveTo(X + k * s * 0.2, Y); ctx.lineTo(X + (k + 1) * s * 0.2, Y); ctx.lineTo(X + (k - 1) * s * 0.2 + s * 0.2, Y + s); ctx.lineTo(X + (k - 2) * s * 0.2 + s * 0.2, Y + s); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = 'rgba(8,10,24,.75)'; rr(X + s * 0.2, Y + s * 0.3, s * 0.6, s * 0.4, s * 0.08); ctx.fill();
    ctx.fillStyle = urgent ? '#ff8a9a' : '#ffd166'; ctx.font = `800 ${Math.round(s * 0.27)}px ui-monospace, Consolas, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.max(0, left).toFixed(1), X + s / 2, Y + s / 2 + 1);
  }
  function drawCrate(cx, cy, alpha) {
    const z = s * 0.84, L = s * 0.28, X = cx - z / 2, Y = cy - z / 2;
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(X + s * 0.04, Y + z - s * 0.02, z, s * 0.08);
    ctx.fillStyle = '#6b3d16'; ctx.fillRect(X, Y + z - L, z, L);
    ctx.fillStyle = '#8a5220'; ctx.fillRect(X, Y + z - L, z, Math.max(1, L * 0.14));
    ctx.fillStyle = '#c47a33'; rr(X, Y - L, z, z, s * 0.05); ctx.fill();
    ctx.strokeStyle = '#7a4a1c'; ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.strokeRect(X + s * 0.07, Y - L + s * 0.07, z - s * 0.14, z - s * 0.14);
    ctx.beginPath(); ctx.moveTo(X + s * 0.1, Y - L + s * 0.1); ctx.lineTo(X + z - s * 0.1, Y - L + z - s * 0.1); ctx.moveTo(X + z - s * 0.1, Y - L + s * 0.1); ctx.lineTo(X + s * 0.1, Y - L + z - s * 0.1); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(X, Y - L, z, Math.max(1, s * 0.04));
    ctx.globalAlpha = 1;
  }
  function drawFilled(X, Y) {
    ctx.fillStyle = '#4a2c12'; ctx.fillRect(X + 1, Y + 1, s - 2, s - 2);
    ctx.fillStyle = '#9a5f28'; rr(X + s * 0.08, Y + s * 0.08, s * 0.84, s * 0.84, s * 0.05); ctx.fill();
    ctx.strokeStyle = '#6b3d16'; ctx.lineWidth = Math.max(1, s * 0.04);
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X + s * 0.1, Y + s * (0.08 + k * 0.21)); ctx.lineTo(X + s * 0.9, Y + s * (0.08 + k * 0.21)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.strokeRect(X + s * 0.08, Y + s * 0.08, s * 0.84, s * 0.84);
  }
  function drawPkg(cx, cy, alpha, glow) {
    const z = s * 0.42, L = s * 0.14, t = G.time, X = cx - z / 2, Y = cy - z / 2;
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    if (glow) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx, cy - L, 0, cx, cy - L, s * 0.62); g.addColorStop(0, `rgba(255,183,3,${0.32 + 0.12 * Math.sin(t * 5)})`); g.addColorStop(1, 'rgba(255,183,3,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - s * 0.7, cy - L - s * 0.7, s * 1.4, s * 1.4); ctx.restore();
    }
    ctx.fillStyle = '#b77400'; ctx.fillRect(X, Y + z - L, z, L);
    ctx.fillStyle = '#ffb703'; rr(X, Y - L, z, z, s * 0.05); ctx.fill();
    ctx.fillStyle = '#e09800'; ctx.fillRect(cx - z * 0.08, Y - L, z * 0.16, z);
    // clock badge
    ctx.fillStyle = '#fff4d6'; ctx.beginPath(); ctx.arc(cx, Y - L + z / 2, z * 0.24, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a2400'; ctx.lineWidth = Math.max(1, s * 0.025); ctx.beginPath(); ctx.arc(cx, Y - L + z / 2, z * 0.24, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, Y - L + z / 2); ctx.lineTo(cx, Y - L + z / 2 - z * 0.16); ctx.moveTo(cx, Y - L + z / 2); ctx.lineTo(cx + z * 0.12, Y - L + z / 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const DIRANG = [Math.PI / 2, -Math.PI / 2, 0, Math.PI / 2, Math.PI];
  function drawBot(cx, cy, col, o) {
    const r = s * 0.3, lift = s * 0.13, a = o.alpha === undefined ? 1 : o.alpha;
    ctx.save(); ctx.translate(cx, cy);
    if (o.scale !== undefined) ctx.scale(o.scale, o.scale);
    ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, r * 0.5, r * 1.02, r * 0.42, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = a;
    ctx.translate(o.jit || 0, -lift - (o.hop || 0));
    if (o.rot) ctx.rotate(o.rot);
    const ang = DIRANG[o.dir || 3];
    const wreck = o.wreck;
    const body = wreck ? '#3b3d4d' : col;
    // treads
    ctx.save(); ctx.rotate(ang); ctx.fillStyle = wreck ? '#15161d' : '#0a0d1d';
    rr(-r * 0.86, -r * 1.06, r * 1.72, r * 0.42, r * 0.16); ctx.fill(); rr(-r * 0.86, r * 0.64, r * 1.72, r * 0.42, r * 0.16); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let k = -2; k <= 2; k++) { ctx.fillRect(k * r * 0.3 - 1, -r * 1.02, 2, r * 0.34); ctx.fillRect(k * r * 0.3 - 1, r * 0.68, 2, r * 0.34); }
    ctx.restore();
    if (o.ghost && !wreck) { ctx.shadowColor = col; ctx.shadowBlur = s * 0.35; }
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
    g.addColorStop(0, shade(body, 0.35)); g.addColorStop(0.6, body); g.addColorStop(1, shade(body, -0.45));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, 7); ctx.stroke();
    // visor
    ctx.save(); ctx.rotate(ang);
    ctx.fillStyle = wreck ? '#1a1a20' : '#081022'; rr(r * 0.12, -r * 0.46, r * 0.68, r * 0.92, r * 0.32); ctx.fill();
    if (!wreck) {
      ctx.fillStyle = o.me ? '#bff' : shade(col, 0.5); ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.16, r * 0.11, 0, 7); ctx.arc(r * 0.5, r * 0.16, r * 0.11, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(r * 0.24, -r * 0.36, r * 0.06, r * 0.72);
    } else {
      ctx.strokeStyle = '#ff5d73'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.25); ctx.lineTo(r * 0.65, r * 0.05); ctx.moveTo(r * 0.65, -r * 0.25); ctx.lineTo(r * 0.35, r * 0.05); ctx.stroke();
    }
    ctx.restore();
    // antenna
    if (!wreck) {
      const bx = -Math.cos(ang) * r * 0.45, by = -Math.sin(ang) * r * 0.45;
      ctx.strokeStyle = '#0a0d1d'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - r * 0.55); ctx.stroke();
      ctx.fillStyle = (G.time * 3 + (o.num || 0)) % 1 < 0.5 ? '#fff' : col; ctx.beginPath(); ctx.arc(bx, by - r * 0.6, Math.max(1.5, r * 0.13), 0, 7); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.3); ctx.lineTo(-r * 0.1, 0); ctx.lineTo(-r * 0.3, r * 0.4); ctx.stroke();
    }
    // hologram scanlines for echoes
    if (o.ghost && !wreck) {
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.16)'; const off = (G.time * 30) % 4;
      for (let yy = -r + off; yy < r; yy += 4) ctx.fillRect(-r, yy, r * 2, 1.2);
      ctx.restore();
    }
    ctx.restore();
    // labels
    if (o.num && !wreck) {
      const bx = cx - r * 0.85, by = cy - lift - r * 0.85, br = Math.max(6, s * 0.13);
      ctx.globalAlpha = a; ctx.fillStyle = '#0a0d1d'; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `900 ${Math.round(br * 1.25)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff'; ctx.fillText(o.num, bx, by + 0.5);
      ctx.globalAlpha = 1;
    }
    if (o.tag && !wreck) {   // online: the partner's courier carries a name tag in its tint
      const fs = Math.max(9, Math.round(s * 0.25)), ty = cy - lift - r - s * 0.34 + Math.sin(G.time * 3) * s * 0.02;
      ctx.font = `800 ${fs}px system-ui, "Segoe UI", Tahoma, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(o.tag).width + fs * 1.0, th = fs * 1.5;
      ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,10,24,.9)'; rr(cx - tw / 2, ty - th / 2, tw, th, th / 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(cx - fs * 0.3, ty + th / 2); ctx.lineTo(cx + fs * 0.3, ty + th / 2); ctx.lineTo(cx, ty + th / 2 + fs * 0.35); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(o.tag, cx, ty + 0.5); ctx.globalAlpha = 1;
    }
    if (o.me && !wreck && !o.noMarker) {
      const bob = Math.sin(G.time * 5) * s * 0.04, my = cy - lift - r - s * 0.2 + bob;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx, my + s * 0.1); ctx.lineTo(cx - s * 0.1, my - s * 0.04); ctx.lineTo(cx + s * 0.1, my - s * 0.04); ctx.fill();
      ctx.strokeStyle = rgba('#ffffff', 0.35 + 0.25 * Math.sin(G.time * 6)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy - lift, r + s * 0.08, 0, 7); ctx.stroke();
    }
    if (o.desync && !wreck) {
      ctx.fillStyle = 'rgba(255,93,115,.85)';
      for (let k = 0; k < 3; k++) { const yy = cy - lift + (hash(k, (G.time * 12) | 0, 3) - 0.5) * r * 2; ctx.fillRect(cx - r * 1.1 + hash(k, (G.time * 12) | 0, 4) * r * 0.4, yy, r * 0.8 + hash(k, 1, (G.time * 12) | 0) * r, 2); }
      ctx.font = `900 ${Math.max(9, Math.round(s * 0.24))}px system-ui, sans-serif`; ctx.fillStyle = '#ff5d73'; ctx.textAlign = 'center'; ctx.fillText('!', cx + r * 0.9, cy - lift - r * 0.9);
    }
  }

  // world view: positions interpolate from wp (previous) to w (current) by a
  // colour of bot bi in the loop being drawn: solo = one colour per loop; online = the owner's tint (echoes too)
  function botCol(bi) {
    if (!G.coopLvl) return LOOPC[bi % LOOPC.length];
    const base = G.histBase, own = bi < base ? (G.loops[bi] ? G.loops[bi].own : 0) : G.histSlots[bi - base];
    return PCOL[own | 0];
  }
  function drawWorld(w, wp, a, ghostAlphaMul) {
    const lv = G.lv, W = lv.W, H = lv.H, base = Math.min(G.histBase, w.bots.length - 1), mine = Math.min(w.bots.length - 1, base + Math.max(0, G.histSlots.indexOf(G.myOwn)));
    const ea = ease(a);
    // slab under the board
    const fw = FR.x1 - FR.x0, fh = FR.y1 - FR.y0;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(FR.x0 - s * 0.08, FR.y0 + s * 0.2, fw + s * 0.16, fh + s * 0.32, s * 0.25); ctx.fill();
    const sg = ctx.createLinearGradient(0, FR.y1, 0, FR.y1 + s * 0.34); sg.addColorStop(0, '#20284f'); sg.addColorStop(1, '#0d1028');
    ctx.fillStyle = sg; ctx.fillRect(FR.x0, FR.y1 - 1, fw, s * 0.34);
    ctx.fillStyle = 'rgba(60,242,208,.35)'; ctx.fillRect(FR.x0, FR.y1 + s * 0.34 - 2, fw, 2);
    for (let x = 1; x < W - 1; x++) if (hash(x, 99, 1) < 0.5) { ctx.fillStyle = hash(x, 98, 1) < 0.5 ? 'rgba(255,190,90,.5)' : 'rgba(127,246,255,.45)'; ctx.fillRect(ox + x * s + s * 0.3, FR.y1 + s * 0.12, s * 0.12, s * 0.1); }

    // floor layer
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, k = w.ground[i], X = ox + x * s, Y = oy + y * s;
      if (isWallish(k)) continue;
      if (k === K.PIT) { drawPit(X, Y, x, y, w); continue; }
      if (k === K.CONV) { drawConveyorBase(X, Y, lv.dir[i], false); continue; }
      drawFloorTile(X, Y, x, y, (x + y) & 1);
      if (k === K.FILLED) drawFilled(X, Y);
      else if (k === K.GOAL) drawGoal(X, Y);
      else if (k === K.PLATE) drawPlate(X, Y, lv.ch[i], E.bodyAt(w, x, y) || E.crateAt(w, x, y) >= 0);
      else if (k === K.SWITCH) { const ch = lv.ch[i]; drawSwitch(X, Y, ch, E.bodyAt(w, x, y) || E.crateAt(w, x, y) >= 0, w.timers[ch] > 0 ? (w.timers[ch] - (G.phase === 'run' ? G.acc / TICK : 0)) / w.tmax[ch] : 0); }
      else if (k === K.DOOR) drawDoorFloor(X, Y, lv.ch[i]);
      else if (k === K.FRAG) {
        const f = w.frag[lv.fragIdx[i]], amt = f > 0 ? 1 - (f - 1) / E.FRAG_DELAY : 0;
        ctx.save();
        if (f > 0) ctx.translate((R() - 0.5) * s * 0.05 * (1 + amt), (R() - 0.5) * s * 0.05 * (1 + amt));
        ctx.fillStyle = '#2b2546'; ctx.fillRect(X + 1, Y + 1, s - 2, s - 2);
        if (f > 0) { ctx.fillStyle = `rgba(255,93,115,${0.15 + 0.2 * amt})`; ctx.fillRect(X, Y, s, s); }
        ctx.strokeStyle = f > 0 ? 'rgba(255,93,115,.8)' : 'rgba(255,183,3,.45)'; ctx.lineWidth = Math.max(1, s * 0.035); ctx.setLineDash([s * 0.1, s * 0.07]);
        ctx.strokeRect(X + s * 0.06, Y + s * 0.06, s * 0.88, s * 0.88); ctx.setLineDash([]);
        drawCracks(X, Y, i, amt, f > 0 ? '#ff8a9a' : '#07080f');
        ctx.restore();
      } else if (k === K.DOOM) drawDoom(X, Y, i, w);
    }
    // collapsing chunks
    G.colAnim = G.colAnim.filter(c => G.time - c.t0 < 0.9);
    for (const c of G.colAnim) {
      const p = (G.time - c.t0) / 0.9, X = ox + c.x * s, Y = oy + c.y * s, sc = 1 - p * 0.7;
      ctx.save(); ctx.translate(X + s / 2, Y + s / 2 + p * p * s * 0.8); ctx.rotate(p * (hash(c.x, c.y, 1) - 0.5) * 2); ctx.scale(sc, sc);
      ctx.globalAlpha = 1 - p; ctx.fillStyle = '#1b2245'; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.fillStyle = '#0d1126'; ctx.fillRect(-s / 2, s / 2 - s * 0.15, s, s * 0.15);
      ctx.restore(); ctx.globalAlpha = 1;
    }
    // echo trails (their recorded routes) + upcoming steps
    const tnow = w.t;
    G.loops.forEach((Lp, gi) => {
      if (gi >= base) return;
      const col = botCol(gi);
      for (let k = 1; k < Lp.path.length; k++) {
        const p = Lp.path[k], q = Lp.path[k - 1]; if (p[0] === q[0] && p[1] === q[1]) continue;
        const ahead = k > tnow && k <= tnow + 10;
        if (k <= tnow) continue;
        ctx.fillStyle = rgba(col, ahead ? 0.55 : 0.18);
        const r = ahead ? s * 0.07 : s * 0.05;
        ctx.beginPath(); ctx.arc(ox + (p[0] + 0.5) * s, oy + (p[1] + 0.5) * s, r, 0, 7); ctx.fill();
      }
    });
    // my own trail this loop
    if (G.cur && G.phase !== 'rewind') {
      const P = G.cur.path, col = botCol(mine);
      for (let k = Math.max(1, P.length - 14); k < P.length; k++) {
        const p = P[k], q = P[k - 1]; if (p[0] === q[0] && p[1] === q[1]) continue;
        ctx.fillStyle = rgba(col, 0.12 + 0.3 * (k - P.length + 14) / 14); ctx.beginPath(); ctx.arc(ox + (q[0] + 0.5) * s, oy + (q[1] + 0.5) * s, s * 0.06, 0, 7); ctx.fill();
      }
    }

    // objects per row
    const beamByEmitter = {};
    for (const bm of w.beams) beamByEmitter[bm.y0 * W + bm.x0] = bm;
    const rows = [];
    for (let y = 0; y < H; y++) rows.push([]);
    const push = (vy, f) => { const r = Math.max(0, Math.min(H - 1, Math.round(vy))); rows[r].push({ vy, f }); };
    w.crates.forEach((c, ci) => {
      const pc = wp.crates[ci] || c;
      if (!c.alive && !pc.alive) return;
      const vx = pc.x + (c.x - pc.x) * ea, vyy = pc.y + (c.y - pc.y) * ea;
      if (!c.alive) { // falling into a hole
        if (a < 1) push(vyy, () => drawCrate(ox + (vx + 0.5) * s, oy + (vyy + 0.5) * s + a * s * 0.25, 1 - a));
        return;
      }
      push(vyy, () => drawCrate(ox + (vx + 0.5) * s, oy + (vyy + 0.5) * s));
    });
    // package
    const pk = w.pkg, ppk = wp.pkg;
    if (pk.s === 0 || (pk.s === 2 && ppk.s === 0 && a < 1) || (pk.s === 3 && ppk.s !== 3)) {
      const fx = ppk.s === 1 ? ppk.x : ppk.x, fy = ppk.y;
      const vx = fx + (pk.x - fx) * ea, vyy = fy + (pk.y - fy) * ea;
      const al = pk.s === 2 ? 1 - a : 1;
      if (pk.s !== 3) push(vyy, () => drawPkg(ox + (vx + 0.5) * s, oy + (vyy + 0.5) * s - Math.sin(G.time * 4) * s * 0.03, al, true));
    }
    if (pk.s === 3) { const X = ox + (pk.x + 0.5) * s, Y = oy + (pk.y + 0.5) * s, up = Math.min(1, G.doneT / 1.2); push(pk.y, () => drawPkg(X, Y - up * s * 1.2, 1 - up * 0.7, true)); }
    // bots
    w.bots.forEach((b, bi) => {
      const pb = wp.bots[bi] || b, isMe = bi === mine, live = bi >= base, col = botCol(bi);
      if (b.dead === 2 && pb.dead === 2) return;
      let vx = pb.x + (b.x - pb.x) * ea, vyy = pb.y + (b.y - pb.y) * ea;
      const num = live ? 0 : G.coopLvl ? ((G.loops[bi] && G.loops[bi].round) | 0) + 1 : bi + 1;
      const o = { dir: b.dir, ghost: !live, me: isMe && G.phase !== 'rewind', num, alpha: live ? 1 : 0.8 * (ghostAlphaMul || 1), wreck: b.dead === 1 && (pb.dead === 1 || a > 0.3), desync: !live && G.desync[bi] >= 0 && G.desync[bi] <= w.t,
        tag: live && !isMe && G.phase !== 'rewind' ? (G.pName || t('cc_c' + (G.histSlots[bi - base] + 1))).slice(0, 12) : null };
      if (b.dead === 2) { o.scale = 1 - a * 0.8; o.rot = a * 4; o.alpha *= 1 - a; }
      if (b.dead === 1) o.jit = pb.dead === 1 ? 0 : (R() - 0.5) * s * 0.08 * (1 - a);
      if (b.x !== pb.x || b.y !== pb.y) o.hop = Math.sin(ea * Math.PI) * s * 0.05;
      const carry = (pk.s === 1 && pk.by === bi) || (pk.s === 3 && ppk.s === 1 && ppk.by === bi && a < 0.4);
      push(vyy + (isMe ? 0.01 : 0), () => {
        const X = ox + (vx + 0.5) * s, Y = oy + (vyy + 0.5) * s;
        drawBot(X, Y, col, o);
        if (carry && b.dead === 0) drawPkg(X, Y - s * 0.52 - Math.sin(G.time * 6) * s * 0.02, o.alpha, false);
      });
    });
    for (let y = 0; y < H; y++) {
      rows[y].sort((p, q) => p.vy - q.vy);
      // raised tiles of this row
      for (let x = 0; x < W; x++) {
        const i = y * W + x, k = w.ground[i], X = ox + x * s, Y = oy + y * s;
        if (k === K.WALL) drawWall(X, Y, x, y, w, i);
        else if (k === K.LASER) drawEmitter(X, Y, x, y, w, i, beamByEmitter[i]);
        else if (k === K.SLOT) drawSlot(X, Y, x, y, w, i);
        else if (k === K.DOOR) { const d = lv.doorIdx[i]; drawDoor(X, Y, lv.ch[i], 1 - (G.doorVis[d] || 0), lv.inv[i]); }
      }
      for (const it of rows[y]) it.f();
      for (let x = 0; x < W; x++) if (w.ground[y * W + x] === K.GOAL) drawGoalBeam(ox + x * s, oy + y * s);
    }
    // laser beams
    for (const bm of w.beams) {
      if (!bm.on) continue;
      const d = bm.dir, sx = ox + (bm.x0 + 0.5 + DX[d] * 0.42) * s, sy = oy + (bm.y0 + 0.5 + DY[d] * 0.42) * s - s * 0.3;
      let ex, ey;
      if (bm.hit === 1) { ex = ox + (bm.x1 + 0.5 - DX[d] * 0.5) * s; ey = oy + (bm.y1 + 0.5 - DY[d] * 0.5) * s - s * 0.3; }
      else if (bm.hit === 2) { ex = ox + (bm.x1 + 0.5) * s; ey = oy + (bm.y1 + 0.5) * s - s * 0.3; }
      else { ex = ox + (bm.x1 + 0.5 + DX[d] * 0.5) * s; ey = oy + (bm.y1 + 0.5 + DY[d] * 0.5) * s - s * 0.3; }
      if (Math.abs(ex - sx) + Math.abs(ey - sy) < 1) continue;
      const fl = 0.75 + 0.25 * Math.sin(G.time * 40 + bm.x0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255,40,80,${0.22 * fl})`; ctx.lineWidth = s * 0.32; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = `rgba(255,60,90,${0.65 * fl})`; ctx.lineWidth = s * 0.1; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,230,235,.95)'; ctx.lineWidth = Math.max(1.5, s * 0.035); ctx.stroke();
      // floor glow line
      ctx.strokeStyle = 'rgba(255,40,80,.12)'; ctx.lineWidth = s * 0.5; ctx.beginPath(); ctx.moveTo(sx, sy + s * 0.3); ctx.lineTo(ex, ey + s * 0.3); ctx.stroke();
      ctx.restore();
      if (bm.hit && R() < 0.5 && G.phase !== 'rewind') G.fx.push({ k: 'spark', x: (ex - ox) / s, y: (ey - oy) / s, vx: (R() - .5) * 3 - DX[d] * 2, vy: (R() - .5) * 3 - DY[d] * 2 - 1, life: 0, max: .2 + R() * .2, col: '#ff8aa0', g: 6 });
    }
    // smoke from wrecks
    if (G.phase !== 'rewind') w.bots.forEach(b => { if (b.dead === 1 && R() < 0.08) G.fx.push({ k: 'smoke', x: b.x + 0.5 + (R() - .5) * .2, y: b.y + 0.3, vx: (R() - .5) * .2, vy: -.4 - R() * .3, life: 0, max: 1.4, r: .1 + R() * .08 }); });
  }

  function drawFx(dt) {
    for (const p of G.fx) {
      p.life += dt;
      if (p.k === 'dust') { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 0.3; }
      else if (p.k === 'spark' || p.k === 'conf') { p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.vr) p.rot += p.vr * dt; }
      else if (p.k === 'smoke') { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 0.25; }
      else if (p.k === 'debris') { p.x += p.vx * dt * 0.3; p.y += p.vy * dt * 0.3; p.rot += p.vr * dt; }
    }
    G.fx = G.fx.filter(p => p.life < p.max);
    for (const p of G.fx) {
      const f = p.life / p.max, X = ox + p.x * s, Y = oy + p.y * s;
      if (p.k === 'dust') { ctx.fillStyle = rgba(p.col, 0.4 * (1 - f)); ctx.beginPath(); ctx.arc(X, Y, p.r * s, 0, 7); ctx.fill(); }
      else if (p.k === 'smoke') { ctx.fillStyle = `rgba(120,125,150,${0.35 * (1 - f)})`; ctx.beginPath(); ctx.arc(X, Y, p.r * s, 0, 7); ctx.fill(); }
      else if (p.k === 'spark') { ctx.strokeStyle = p.col; ctx.globalAlpha = 1 - f; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - p.vx * s * 0.03, Y - p.vy * s * 0.03); ctx.stroke(); ctx.globalAlpha = 1; }
      else if (p.k === 'conf') { ctx.save(); ctx.translate(X, Y); ctx.rotate(p.rot); ctx.globalAlpha = 1 - f * f; ctx.fillStyle = p.col; ctx.fillRect(-s * 0.06, -s * 0.03, s * 0.12, s * 0.06); ctx.restore(); ctx.globalAlpha = 1; }
      else if (p.k === 'debris') { const sc = 1 - f; ctx.save(); ctx.translate(X, Y + f * f * s * 0.9); ctx.rotate(p.rot); ctx.globalAlpha = sc; ctx.fillStyle = p.col; ctx.fillRect(-p.r * s * sc, -p.r * s * sc, p.r * 2 * s * sc, p.r * 2 * s * sc); ctx.restore(); ctx.globalAlpha = 1; }
      else if (p.k === 'ring') { ctx.strokeStyle = p.col; ctx.globalAlpha = 1 - f; ctx.lineWidth = p.big ? 4 : 2; ctx.beginPath(); ctx.arc(X, Y, s * (0.3 + f * (p.big ? 2.5 : 0.8)), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    }
  }

  // ------------------------------------------------------------------ timeline (10 s bar + one lane per echo)
  function drawTimeline(w) {
    const { x, y, w: tw, h } = TL, lv = G.lv, n = G.round, maxL = lv.maxLoops, base = G.histBase, laneH = G.coopLvl ? 3 : 5;
    const elapsed = G.phase === 'rewind' ? Math.max(0, 1 - G.rewindT / 0.9) * TICKS * TICK : Math.min(TICKS, w.t + (G.phase === 'run' ? G.acc / TICK : 0)) * TICK;
    const left = Math.max(0, TICKS * TICK - elapsed), warn = left < 3 && G.phase === 'run';
    ctx.fillStyle = 'rgba(10,13,28,.86)'; rr(x, y, tw, h, 12); ctx.fill();
    ctx.strokeStyle = warn ? `rgba(255,93,115,${0.4 + 0.4 * Math.sin(G.time * 10)})` : 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; rr(x + 0.5, y + 0.5, tw - 1, h - 1, 12); ctx.stroke();
    const col = G.coopLvl ? PCOL[G.myOwn] : LOOPC[Math.min(n, maxL - 1) % LOOPC.length];
    // loop pill (dots = loops available)
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const ly = y + 15;
    for (let i = 0; i < maxL; i++) {
      const cxp = x + 14 + i * 13;
      if (i < n && G.coopLvl) {   // a finished co-op loop: half Courier 1, half Courier 2
        ctx.fillStyle = PCOL[0]; ctx.beginPath(); ctx.arc(cxp, ly, 4.5, Math.PI / 2, Math.PI * 1.5); ctx.fill();
        ctx.fillStyle = PCOL[1]; ctx.beginPath(); ctx.arc(cxp, ly, 4.5, -Math.PI / 2, Math.PI / 2); ctx.fill();
        continue;
      }
      ctx.beginPath(); ctx.arc(cxp, ly, 4.5, 0, 7);
      if (i < n) { ctx.fillStyle = LOOPC[i % LOOPC.length]; ctx.fill(); }
      else if (i === n) { ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
      else { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    ctx.fillStyle = '#eef0ff'; ctx.font = '800 13px system-ui, "Segoe UI", Tahoma, sans-serif';
    const lbl = t('cc_loop', { n: Math.min(n + 1, maxL), m: maxL });
    ctx.fillText(lbl, x + 14 + maxL * 13 + 2, ly + 1);
    // stars at stake
    const used = Math.min(n + 1, maxL), st = Math.max(1, Math.min(3, 3 - (used - G.L.par)));
    const lw = ctx.measureText(lbl).width;
    ctx.fillStyle = '#ffb703'; ctx.font = '700 12px system-ui, sans-serif'; ctx.fillText('★'.repeat(st), x + 14 + maxL * 13 + 10 + lw, ly + 1);
    ctx.fillStyle = '#3b4470'; ctx.fillText('★'.repeat(3 - st), x + 14 + maxL * 13 + 10 + lw + ctx.measureText('★'.repeat(st)).width, ly + 1);
    // time left
    ctx.textAlign = 'right'; ctx.font = '800 18px ui-monospace, Consolas, monospace';
    ctx.fillStyle = warn ? '#ff8a9a' : left < 0.05 ? '#9aa3c7' : '#ffffff';
    ctx.fillText(left.toFixed(1), x + tw - 24, ly + 1);
    ctx.font = '700 11px system-ui, sans-serif'; ctx.fillStyle = '#9aa3c7'; ctx.fillText(t('cc_sec'), x + tw - 12, ly + 3);
    // bar
    const bx = x + 12, bwid = tw - 24, by = y + 30, bhh = 7;
    ctx.fillStyle = '#1a2042'; rr(bx, by, bwid, bhh, 3.5); ctx.fill();
    const fw = bwid * elapsed / (TICKS * TICK);
    if (fw > 0) { ctx.fillStyle = col; rr(bx, by, Math.max(fw, 7), bhh, 3.5); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.45)'; for (let k = 1; k < 10; k++) ctx.fillRect(bx + bwid * k / 10 - 0.5, by, 1, bhh);
    // playhead
    ctx.fillStyle = '#fff'; ctx.fillRect(bx + fw - 1, by - 3, 2, bhh + 6 + G.loops.length * laneH);
    const mark = (lx, ly2, e, c) => {
      ctx.fillStyle = e === 'fry' || e === 'fall' ? '#ff5d73' : e === 'pick' ? '#ffd166' : '#ffb703';
      ctx.font = '900 8px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(e === 'fry' || e === 'fall' ? '✕' : e === 'pick' ? '▲' : '▼', lx, ly2);
    };
    for (const m of (G.cur ? G.cur.marks : [])) mark(bx + bwid * m.t / TICKS, by + bhh / 2 + 0.5, m.e);
    // echo lanes
    G.loops.forEach((Lp, gi) => {
      const ly2 = by + bhh + 4 + gi * laneH;
      ctx.fillStyle = rgba(botCol(gi), 0.75); ctx.fillRect(bx, ly2, bwid, 2);
      for (const m of Lp.marks) mark(bx + bwid * m.t / TICKS, ly2 + 1, m.e);
      if (G.desync[gi] >= 0) { ctx.fillStyle = '#ff5d73'; ctx.fillRect(bx + bwid * G.desync[gi] / TICKS - 1, ly2 - 2, 2, 6); }
    });
  }

  // ------------------------------------------------------------------ menu backdrop: the clock of loops
  function drawMenuScene(dt) {
    const cx = vw / 2, cy = vh / 2, Rr = Math.max(Math.min(vw, vh) * 0.42, Math.min(vh * 0.34, vw * 0.7)), t = G.time;
    ctx.save(); ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(60,242,208,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, Rr, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,183,3,.10)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, Rr * 0.88, -Math.PI / 2, -Math.PI / 2 + ((t / 10) % 1) * 6.283); ctx.stroke();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * 0.6283; ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(Math.cos(a) * Rr * 0.95 - 2, Math.sin(a) * Rr * 0.95 - 2, 4, 4); }
    ctx.restore();
    const old = s; s = Math.max(26, Math.min(56, Rr * 0.16));
    for (let i = 0; i < 4; i++) {
      const a = t * 0.45 + i * 1.5708, x = cx + Math.cos(a) * Rr, y = cy + Math.sin(a) * Rr;
      for (let k = 1; k < 9; k++) { const b = a - k * 0.06; ctx.fillStyle = rgba(LOOPC[i], 0.25 * (1 - k / 9)); ctx.beginPath(); ctx.arc(cx + Math.cos(b) * Rr, cy + Math.sin(b) * Rr, s * 0.12, 0, 7); ctx.fill(); }
      const dir = Math.abs(Math.cos(a + 1.5708)) > Math.abs(Math.sin(a + 1.5708)) ? (Math.cos(a + 1.5708) > 0 ? 2 : 4) : (Math.sin(a + 1.5708) > 0 ? 3 : 1);
      drawBot(x, y, LOOPC[i], { dir, ghost: i > 0, me: i === 0, noMarker: true, alpha: i ? 0.85 : 1 });
      if (i === 0) drawPkg(x, y - s * 0.52, 1, false);
    }
    s = old;
  }

  // ------------------------------------------------------------------ main loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    G.time += dt;
    update(dt);
    draw(dt);
    requestAnimationFrame(frame);
  }
  function update(dt) {
    if (G.scene === 'play' && G.w && isGuest()) guestUpdate(dt);
    else if (G.scene === 'play' && !G.overlay && G.w) {
      if (G.phase === 'run') {
        G.acc += dt; G.simTime += dt;
        while (G.acc >= TICK && G.phase === 'run') { G.acc -= TICK; doTick(); }
      } else if (G.phase === 'ff') {
        G.acc += dt; G.simTime += dt * 6;
        const step = 0.035;
        while (G.acc >= step && G.phase === 'ff') { G.acc -= step; doTick(); }
      } else if (G.phase === 'rewind') {
        G.rewindT += dt;
        if (G.rewindT >= 0.9) beginLoop();
      } else if (G.phase === 'done') {
        G.doneT += dt;
        if ((G.doneT > 1.6 || performance.now() - (G.doneAt || 0) > 1700) && !G.overlay) { Snd.play('click'); showWin(); }
      }
      // door animation
      for (let d = 0; d < G.doorVis.length; d++) { const tg = G.w.open[d]; G.doorVis[d] += (tg - G.doorVis[d]) * Math.min(1, dt * 14); }
    }
    G.shake = Math.max(0, G.shake - dt * 22);
    G.flash = Math.max(0, G.flash - dt * 1.5);
    // background debris: more as the loop runs out
    let rate = 0.6;
    if (G.scene === 'play' && G.w && G.phase === 'run') rate = 0.6 + (G.w.t / TICKS) * 5;
    if (R() < rate * dt) spawnBgDebris(1);
    for (const p of G.bgfx) { p.life += dt; p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt; }
    G.bgfx = G.bgfx.filter(p => p.y < vh + 30);
  }
  function draw(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sky) ctx.drawImage(sky, 0, 0, vw, vh); else { ctx.fillStyle = '#070914'; ctx.fillRect(0, 0, vw, vh); }
    for (const p of G.bgfx) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.strokeStyle = `rgba(255,170,90,${p.a * 0.25})`; ctx.lineWidth = p.r * 0.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-p.vx * 0.08, -p.vy * 0.08); ctx.stroke();
      ctx.fillStyle = `rgba(40,46,80,${p.a + 0.3})`; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    }
    if (G.scene !== 'play' || !G.w) { drawMenuScene(dt); return; }
    const sh = G.shake, endWarn = G.phase === 'run' && G.w.t >= 40 ? (G.w.t - 40) / 10 : 0;
    const jx = (R() - 0.5) * (sh + endWarn * 2), jy = (R() - 0.5) * (sh + endWarn * 2);
    ctx.save(); ctx.translate(jx, jy);
    if (G.phase === 'rewind') {
      const p = Math.min(1, G.rewindT / 0.9), hl = G.hist.length - 1, f = (1 - p) * hl, i0 = Math.floor(f), i1 = Math.min(hl, i0 + 1);
      drawWorld(G.hist[i0], G.hist[i1], 1 - (f - i0), 0.6);
    } else {
      const wp = G.hist.length > 1 ? G.hist[G.hist.length - 2] : G.w;
      const a = G.phase === 'run' ? G.acc / TICK : G.phase === 'ff' ? Math.min(1, G.acc / 0.035) : 1;
      drawWorld(G.w, wp, a);
    }
    drawFx(dt);
    ctx.restore();
    // vignettes / screen effects
    if (endWarn > 0) {
      const g = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.3, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
      g.addColorStop(0, 'rgba(255,40,80,0)'); g.addColorStop(1, `rgba(255,40,80,${0.25 * endWarn * (0.6 + 0.4 * Math.sin(G.time * 10))})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);
    }
    if (G.phase === 'rewind') {
      ctx.fillStyle = 'rgba(60,120,255,.12)'; ctx.fillRect(0, 0, vw, vh);
      ctx.fillStyle = 'rgba(200,230,255,.07)'; const off = (G.time * 300) % 6; for (let yy = off; yy < vh; yy += 6) ctx.fillRect(0, yy, vw, 2);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, R() * vh, vw, 2 + R() * 10); }
      ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(G.time * 12); ctx.fillStyle = '#fff'; ctx.font = `900 ${Math.round(Math.min(vw, vh) * 0.12)}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('◀◀', vw / 2, (FR.y0 + FR.y1) / 2); ctx.restore();
    }
    if (G.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${G.flash * 0.35})`; ctx.fillRect(0, 0, vw, vh); }
    drawTimeline(G.w);
  }

  // ------------------------------------------------------------------ online co-op (Supabase Realtime broadcast room "chrono-courier-CODE")
  // The host runs the authoritative loop (doTick: echoes, plates, doors, the package, the timer) and streams the world ~12–15×/s.
  // The guest sends only its own inputs and draws what the host sends, animating between ticks. Positions travel in the level's
  // canonical orientation, so each player can still get wide levels turned sideways on a tall phone.
  const ON = { ch: null, code: '', ready: false, me: '', role: null, jt: 0, partner: null, hb: null, lastSt: 0, dirty: false, needT: 0, evHist: [] };
  const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'roles', 'sel', 'loop', 'st', 'in', 'req', 'pause', 'lobby', 'need'];
  const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]; return c; };
  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (code) => pageLink() + '?room=' + code;
  const otherRole = (r) => r === 'host' ? 'guest' : 'host';
  function myName() {
    const a = window.Auth && Auth.name && Auth.name(); if (a) return String(a).slice(0, 16);
    let n = ''; try { n = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}
    return n || t('cc_courier');
  }
  async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
  function netSend(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }

  // local (maybe rotated) <-> canonical level coordinates and directions
  const cXY = (x, y) => G.rot ? [y, G.H0 - 1 - x] : [x, y];
  const lXY = (x, y) => G.rot ? [G.H0 - 1 - y, x] : [x, y];
  const cD = (d) => G.rot && d >= 1 && d <= 4 ? (d + 2) % 4 + 1 : d;
  const lD = (d) => G.rot && d >= 1 && d <= 4 ? d % 4 + 1 : d;
  let NM = null;   // per-level lists in canonical order -> local indexes (frags, doors, switches and crates are numbered in scan order)
  function buildNetMap() {
    const lv = G.lv, W = lv.W;
    const ci = (li) => { const p = cXY(li % W, (li / W) | 0); return p[1] * G.W0 + p[0]; };
    const order = (n, key) => Array.from({ length: n }, (_, k) => k).sort((a, b) => key(a) - key(b));
    NM = {
      dyn: order(lv.dyn.length, k => ci(lv.dyn[k])).map(k => lv.dyn[k]),
      frags: order(lv.frags.length, k => ci(lv.frags[k])),
      doors: order(lv.doors.length, k => ci(lv.doors[k])),
      sw: order(lv.switches.length, k => ci(lv.switches[k])),
      crates: order(lv.crates.length, k => ci(lv.crates[k].y * W + lv.crates[k].x)),
    };
  }
  const packEv = (e) => { const o = Object.assign({}, e); if (e.x !== undefined) { const p = cXY(e.x, e.y); o.x = p[0]; o.y = p[1]; } return o; };
  const unpackEv = (e) => { const o = Object.assign({}, e); if (e.x !== undefined) { const p = lXY(e.x, e.y); o.x = p[0]; o.y = p[1]; } return o; };
  // host: keep the last few ticks of events so a dropped snapshot doesn't lose a sound, a spark or a timeline mark
  function noteEvents(w) {
    const gi = G.loops.length + G.slots.indexOf(1);
    ON.evHist.push({ t: w.t, ev: w.ev.filter(e => (e.e !== 'step' && e.e !== 'bump') || e.b === gi).map(packEv) });
    while (ON.evHist.length > 4) ON.evHist.shift();
  }
  function packSt() {
    const w = G.w, pk = cXY(w.pkg.x, w.pkg.y);
    return {
      li: G.li, lid: G.loopId, rd: G.round, ph: G.phase, t: w.t, nb: w.bots.length,
      g: NM.dyn.map(i => w.ground[i]), f: NM.frags.map(k => w.frag[k]), o: NM.doors.map(k => w.open[k]), sw: NM.sw.map(k => w.swOcc[k]),
      tm: Array.from(w.timers), tx: Array.from(w.tmax), cn: Array.from(w.chan),
      b: w.bots.map(b => { const p = cXY(b.x, b.y); return [p[0], p[1], cD(b.dir), b.dead, b.carry]; }),
      c: NM.crates.map(k => { const c = w.crates[k], p = cXY(c.x, c.y); return [p[0], p[1], c.alive]; }),
      p: [pk[0], pk[1], w.pkg.s, w.pkg.by],
      bm: w.beams.map(m => { const a = cXY(m.x0, m.y0), z = cXY(m.x1, m.y1); return [a[0], a[1], z[0], z[1], cD(m.dir), m.on ? 1 : 0, m.hit, m.ch]; }),
      won: w.won ? 1 : 0, wa: w.wonAt, dn: G.done.map(v => v ? 1 : 0), ev: ON.evHist,
    };
  }
  function unpackSt(p) {
    const lv = G.lv;
    const w = { t: p.t, ground: Int8Array.from(lv.kind), frag: new Int8Array(lv.frags.length).fill(-1), bots: [], crates: [], pkg: null,
      timers: p.tm.slice(), tmax: p.tx.slice(), chan: p.cn.slice(), open: new Uint8Array(lv.doors.length), swOcc: new Uint8Array(lv.switches.length),
      beams: [], ev: [], won: !!p.won, wonAt: p.wa };
    NM.dyn.forEach((i, k) => { w.ground[i] = p.g[k]; });
    NM.frags.forEach((f, k) => { w.frag[f] = p.f[k]; });
    NM.doors.forEach((d, k) => { w.open[d] = p.o[k]; });
    NM.sw.forEach((q, k) => { w.swOcc[q] = p.sw[k]; });
    w.bots = p.b.map(q => { const l = lXY(q[0], q[1]); return { x: l[0], y: l[1], px: l[0], py: l[1], dir: lD(q[2]), dead: q[3], carry: q[4], moved: 0 }; });
    w.crates = lv.crates.map(c => ({ x: c.x, y: c.y, px: c.x, py: c.y, alive: 1 }));
    NM.crates.forEach((k, j) => { const q = p.c[j]; if (!q) return; const l = lXY(q[0], q[1]); w.crates[k] = { x: l[0], y: l[1], px: l[0], py: l[1], alive: q[2] }; });
    const pk = lXY(p.p[0], p.p[1]); w.pkg = { x: pk[0], y: pk[1], px: pk[0], py: pk[1], s: p.p[2], by: p.p[3] };
    w.beams = p.bm.map(q => { const a = lXY(q[0], q[1]), z = lXY(q[2], q[3]); return { x0: a[0], y0: a[1], x1: z[0], y1: z[1], dir: lD(q[4]), on: !!q[5], hit: q[6], ch: q[7] }; });
    return w;
  }

  // host -> guest: the loop set-up (level, loop id, every echo recorded so far) and the world snapshots
  function stDirty() { if (!isHost()) return; ON.dirty = true; netPump(); }
  function netPump() {   // a snapshot right after each tick, plus a keep-alive copy every 80 ms (≈12–15 per second)
    if (!isHost() || !ON.partner || G.scene !== 'play' || !G.w || !NM) return;
    const now = performance.now(), gap = now - ON.lastSt;
    if ((ON.dirty && gap >= 60) || gap >= 80) { ON.dirty = false; ON.lastSt = now; netSend('st', packSt()); }
  }
  function sendLoop() {
    const nl = G.newLvl ? 1 : 0; G.newLvl = false;
    if (!isHost() || !ON.partner) return;
    netSend('loop', { li: G.li, lid: G.loopId, rd: G.round, rs: G.roundSizes, sl: G.slots, nl, hn: myName(),
      recs: G.loops.map(r => ({ o: r.own | 0, r: r.round | 0, a: r.acts.map(cD).join(''), p: [].concat(...r.path.map(q => cXY(q[0], q[1]))), m: r.marks })) });
    ON.dirty = true; ON.lastSt = 0; netPump();
  }
  function askLoop() { const now = performance.now(); if (now - ON.needT > 700) { ON.needT = now; netSend('need', {}); } }
  function applyLoop(p) {
    if (ON.role === 'host') return;
    ON.role = 'guest'; if (ON.partner) { ON.partner.role = 'host'; if (p.hn) ON.partner.n = String(p.hn).slice(0, 16); }
    const fresh = G.scene !== 'play' || !isGuest() || p.li !== G.li || (p.nl && p.lid !== G.loopId);
    if (!fresh && p.lid === G.loopId) return;   // we already have this loop
    if (G.overlay) closeOverlay();
    if (fresh) { G.net = { host: false }; G.myOwn = 1; prepLevel(p.li); }
    G.loops = (p.recs || []).map(r => {
      const path = []; for (let k = 0; k + 1 < r.p.length; k += 2) path.push(lXY(r.p[k], r.p[k + 1]));
      return { own: r.o | 0, round: r.r | 0, acts: Array.from(r.a, ch => lD(+ch)), path, marks: r.m || [] };
    });
    G.round = p.rd | 0; G.roundSizes = (p.rs || []).slice(); G.slots = (p.sl || [0, 1]).slice();
    if (ON.partner) G.pName = ON.partner.n;
    beginLoop(p.lid);
    if (fresh) { layout(); showTip(true); Snd.init(); Snd.play('start'); }
  }
  function applySt(p) {
    if (!isGuest() || G.scene !== 'play' || !G.w) return;
    if (p.li !== G.li || p.lid !== G.loopId || p.nb !== G.w.bots.length) { askLoop(); return; }
    const prevPh = G.phase, prevRd = G.round, base = G.loops.length, ms = mySlot(), mine = base + ms;
    G.round = p.rd | 0;
    if (p.t !== G.w.t) {
      const prevT = G.w.t, nw = unpackSt(p);
      G.w = nw; G.hist.push(nw); G.acc = 0;
      const b = nw.bots[mine]; if (b) G.cur.path.push([b.x, b.y]);
      G.loops.forEach((L, gi) => {
        const q = L.path[nw.t], gb = nw.bots[gi];
        if (G.desync[gi] < 0 && q && gb && gb.dead !== 2 && (q[0] !== gb.x || q[1] !== gb.y)) G.desync[gi] = nw.t;
      });
      if (p.ph === 'run' && Math.floor(nw.t / 5) > Math.floor(prevT / 5) && nw.t < TICKS) Snd.play(nw.t >= 35 ? 'warn' : 'sec');
      if (nw.pkg.s === 2 && !G.lostShown) { G.lostShown = true; setBanner('cc_lost', 'bad'); }
    }
    for (const pack of (p.ev || [])) {   // events of ticks we haven't seen yet (sounds, sparks, timeline marks)
      if (pack.t <= G.evT) continue;
      G.evT = pack.t;
      const evs = pack.ev.map(unpackEv);
      effects(evs, mine);
      for (const ev of evs) if (ev.b === mine && /^(pick|drop|fry|fall)$/.test(ev.e)) G.cur.marks.push({ t: pack.t, e: ev.e });
    }
    G.done = (p.dn || []).map(Boolean);
    G.phase = p.ph;
    const b = G.w.bots[mine];
    if (G.phase !== prevPh) {
      if (prevPh === 'ready' && (G.phase === 'run' || G.phase === 'ff')) { setBanner(null); tipEl.hidden = true; Snd.play('start'); }
      if (G.phase === 'ff') setBanner(b && b.dead ? (b.dead === 1 ? 'cc_fried' : 'cc_fell') : 'cc_ff', b && b.dead ? 'bad' : 'warn');
      else if (G.phase === 'rewind') { G.rewindT = 0; setBanner('cc_rewind', 'warn'); Snd.play('rewind'); G.flash = 0.5; }
      else if (G.phase === 'done') { G.doneT = 0; G.doneAt = performance.now(); onDelivered(); }
      else if (G.phase === 'over') { setBanner(null); Snd.play('lose'); if (!G.overlay) showLose(); }
    }
    if (G.phase === 'run' && b) {
      if (b.dead && !G.meDeadShown) { G.meDeadShown = true; setBanner(b.dead === 1 ? 'cc_friedCo' : 'cc_fellCo', 'bad'); }
      else if (!b.dead && G.done[ms] && !(G.banner && G.banner.key === 'cc_waitDone')) setBanner('cc_waitDone', 'warn', true);
    }
    if (G.phase !== prevPh || G.round !== prevRd) updateTop();
  }
  function guestUpdate(dt) {
    if (G.phase === 'run') { G.acc = Math.min(TICK, G.acc + dt); G.simTime += dt; }   // animate the last tick (smooths both couriers)
    else if (G.phase === 'ff') { G.acc = Math.min(0.035, G.acc + dt); G.simTime += dt * 6; }
    else if (G.phase === 'rewind') G.rewindT = Math.min(0.9, G.rewindT + dt);
    else if (G.phase === 'done') {
      G.doneT += dt;
      if ((G.doneT > 1.6 || performance.now() - (G.doneAt || 0) > 1700) && !G.overlay) { Snd.play('click'); showWin(); }
    }
    for (let d = 0; d < G.doorVis.length; d++) { const tg = G.w.open[d]; G.doorVis[d] += (tg - G.doorVis[d]) * Math.min(1, dt * 14); }
  }

  // guest -> host: inputs. Taps and the action button carry counters, so a resent or late message never doubles a step.
  // The last few taps travel with every message, so taps that arrive bunched up (network jitter) still each give one step.
  const GIN = { ts: 0, as: 0, taps: [], last: 0 };
  function netIn(kind, d) {
    if (kind === 'tap') { GIN.ts++; GIN.taps.push([GIN.ts, cD(d)]); if (GIN.taps.length > 4) GIN.taps.shift(); } else if (kind === 'act') GIN.as++;
    sendIn(kind !== 'tap');   // a tap is one step; "still held" follows ~150 ms later only if the key really stays down
  }
  function sendIn(withHold) {
    GIN.last = performance.now();
    netSend('in', { lid: G.loopId, jt: ON.jt, h: withHold && held.length ? cD(held[held.length - 1]) : 0, tq: GIN.taps, as: GIN.as });
  }
  const RIN = { h: 0, ts: 0, as: 0, q: [], pa: false, jt: 0 };
  function clearRemote() { RIN.h = 0; RIN.q = []; RIN.pa = false; }
  function sampleRemote() { let a = 0; if (RIN.pa) { a = 5; RIN.pa = false; } else if (RIN.q.length) a = RIN.q.shift(); else if (RIN.h) a = RIN.h; return a; }
  function applyIn(p) {
    if (!isHost() || G.scene !== 'play' || !G.w) return;
    if (p.jt !== RIN.jt) { RIN.jt = p.jt; RIN.ts = 0; RIN.as = 0; RIN.q = []; }
    const fresh = p.lid === G.loopId && G.slots.length > 1;   // inputs meant for an older loop are dropped
    for (const tp of (Array.isArray(p.tq) ? p.tq : [])) {
      if (!(tp[0] > RIN.ts)) continue;
      RIN.ts = tp[0];
      if (fresh) { RIN.q.push(lD(tp[1] | 0)); if (RIN.q.length > 2) RIN.q.shift(); }
    }
    if (p.as > RIN.as) { RIN.as = p.as; if (fresh) RIN.pa = true; }
    RIN.h = fresh ? lD(p.h | 0) : 0;
    if (fresh && G.phase === 'ready' && !G.overlay && (RIN.q.length || RIN.pa || RIN.h)) startRun();
  }
  function handleReq(act) {
    if (!isHost() || G.scene !== 'play') return;
    if (act === 'end') { if (!G.overlay) markDone(G.slots.indexOf(1)); }
    else if (act === 'restartLoop') restartLoop();
    else if (act === 'undo') undoLoop();
    else if (act === 'restartLevel') startLevel(G.li);
    else if (act === 'next') { if (G.phase === 'done') nextLevel(); }
  }
  function netPause(on, by) {
    if (on) { if (G.scene === 'play' && !G.overlay && G.phase !== 'done') { clearInput(); G.pausedBy = by || ''; showPause(); } }
    else if (G.overlay === 'pause' || (G.overlay === 'howto' && subFrom === 'pause')) closeOverlay();
  }

  // room: join / leave / heartbeat / roles
  function joinRoom(code, role) {
    leaveRoom(true);
    if (!window.sb) { toast(t('cc_noNet')); return false; }
    code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (!code) return false;
    let id = ''; try { id = sessionStorage.getItem('chrono-courier-id-' + code) || ''; } catch (e) {}
    if (!id) { id = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('chrono-courier-id-' + code, id); } catch (e) {} }
    ON.me = id; ON.code = code; ON.role = role || null; ON.ready = false; ON.jt = Date.now(); ON.partner = null;
    const ch = sb.channel('chrono-courier-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; hello(true); if (G.overlay === 'lobby') showLobby(); } });
    ON.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    window.Mal3abShareLink = () => inviteLink(code);
    clearInterval(ON.hb); ON.hb = setInterval(netBeat, 2000);
    G.sel = coopNextIdx();
    toLobby();
    return true;
  }
  function leaveRoom(quiet) {
    if (ON.ch) { netSend('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.partner = null; ON.role = null;
    window.Mal3abShareLink = () => pageLink();
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  }
  const netPh = () => G.scene === 'play' && G.net ? 'play' : 'lobby';
  function hello(req) { netSend('hello', { n: myName(), role: ON.role, jt: ON.jt, req: !!req, ph: netPh(), sel: G.sel, ul: maxUnlockedIdx() }); }
  function netBeat() {
    if (!ON.ch) return;
    netSend('hb', { n: myName(), role: ON.role, jt: ON.jt, ph: netPh(), sel: G.sel, ul: maxUnlockedIdx() });
    if (ON.partner && Date.now() - ON.partner.t > 9000) partnerGone();
  }
  function resolveRoles(p) {
    if (G.scene === 'play' && G.net && ON.role) return;
    const mineFirst = ON.jt < p.jt || (ON.jt === p.jt && ON.me < p.id);
    if (!p.role && !ON.role) ON.role = mineFirst ? 'host' : 'guest';
    else if (!ON.role) ON.role = otherRole(p.role);
    else if (p.role === ON.role && !mineFirst) ON.role = otherRole(p.role);
  }
  function onNet(ev, p) {
    if (!p || p.id === ON.me) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === ON.me) { leaveRoom(); G.net = null; showOnline(); toast(t('cc_full')); const m = $('ccMsg'); if (m) m.textContent = t('cc_full'); } return; }
    let P = ON.partner;
    if (P && P.id !== p.id) {
      if (now - P.t < 9000) { if (ev === 'hello') netSend('full', { to: p.id }); return; }   // a third player
      partnerGone(true); P = null;
    }
    if (ev === 'bye') { if (P) partnerGone(); return; }
    if (!P) {
      P = ON.partner = { id: p.id, n: p.n || '…', role: null, t: now, ul: 0 };
      toast(t('cc_joinedP', { p: P.n })); Snd.init(); Snd.play('pick');
      RIN.jt = -1;
    }
    P.t = now; if (p.n) { P.n = String(p.n).slice(0, 16); if (G.coopLvl) G.pName = P.n; } if (p.ul !== undefined) P.ul = p.ul | 0;
    if (ev === 'hello' || ev === 'hb') {
      if ('role' in p) P.role = p.role;
      const before = ON.role; resolveRoles(p);
      if (P.role === 'host' && ON.role === 'guest' && p.sel !== undefined && G.scene !== 'play') G.sel = p.sel | 0;
      if (ev === 'hello' && p.req) hello(false); else if (before !== ON.role) hello(false);
      if (ON.role === 'host' && p.ph !== 'play') bringPartnerIn();
      if (ON.role === 'guest' && p.ph === 'lobby' && G.scene === 'play' && G.net) toLobby();
      if (G.overlay === 'lobby') showLobby();
      return;
    }
    switch (ev) {
      case 'roles': if (G.scene !== 'play') { ON.role = p.host === ON.me ? 'host' : 'guest'; P.role = otherRole(ON.role); if (G.overlay === 'lobby') showLobby(); } break;
      case 'sel': if (ON.role !== 'host') { G.sel = p.l | 0; if (G.overlay === 'lobby') showLobby(); } break;
      case 'loop': applyLoop(p); break;
      case 'st': applySt(p); break;
      case 'in': applyIn(p); break;
      case 'req': handleReq(p.act); break;
      case 'pause': netPause(!!p.on, P.n); break;
      case 'lobby': if (G.scene === 'play' && G.net) toLobby(); break;
      case 'need': if (isHost() && G.scene === 'play') sendLoop(); break;
    }
  }
  // the partner (re)appeared while the host is playing: bring them into this level
  function bringPartnerIn() {
    if (!isHost() || G.scene !== 'play' || !G.w) return;
    if (G.phase === 'done' || G.phase === 'over') { if (G.overlay === 'lost') { closeOverlay(); if (G.phase === 'done') showWin(true); else showLose(); } return; }   // they join at Next / Retry
    if (G.overlay === 'lost') closeOverlay();
    if (ON.partner) G.pName = ON.partner.n;
    if (G.slots.length < 2) { G.slots = [0, 1]; toast(t('cc_rejoin')); beginLoop(); }
    else sendLoop();
  }
  function partnerGone(silent) {
    const P = ON.partner; if (!P) return; ON.partner = null;
    if (!silent) toast(t('cc_leftP', { p: P.n }));
    clearRemote();
    if (G.scene === 'play' && G.net) { if (G.overlay !== 'lost') { clearInput(); showLost(); } }
    else if (G.overlay === 'lobby') showLobby();
  }
  // partner gone: keep playing alone with every echo recorded so far (the guest takes over the simulation)
  function continueSolo() {
    if (isGuest()) { leaveRoom(); G.net = null; }
    G.slots = [G.myOwn];
    closeOverlay();
    if (G.phase === 'done') showWin(true);
    else if (G.phase === 'over') showLose();
    else beginLoop();
  }
  function swapRoles() {
    if (!ON.partner || !ON.role || G.scene === 'play') return;
    ON.role = otherRole(ON.role); ON.partner.role = otherRole(ON.role);
    netSend('roles', { host: ON.role === 'host' ? ON.me : ON.partner.id });
    showLobby();
  }
  function startOnline() {
    if (ON.role !== 'host') return;
    if (!ON.partner) { toast(t('cc_needPartner')); return; }
    G.net = { host: true }; G.myOwn = 0; G.pName = ON.partner.n;
    startLevel(G.sel);
  }
  function toLobby() {
    G.net = null; G.coopLvl = false; G.myOwn = 0; G.slots = [0];
    G.scene = 'lobby'; G.L = null; G.lv = null; G.w = null;
    tipEl.hidden = true; setBanner(null); clearInput();
    if (!ON.code) { showMenu(); return; }
    showLobby(); layout();
  }
  setInterval(() => {
    if (!ON.ch) return;
    if (isHost()) netPump();
    else if (isGuest() && G.scene === 'play' && (G.phase === 'ready' || G.phase === 'run') && performance.now() - GIN.last > (held.length ? 150 : 250)) sendIn(true);
  }, 33);
  addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });
  window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : pageLink();
  window.Mal3abPrepareInvite = async () => {
    if (!ON.code) { if (!(await canGoOnline())) return pageLink(); joinRoom(newCode(), 'host'); }
    return inviteLink(ON.code);
  };

  // ------------------------------------------------------------------ boot
  refreshTopLabels();
  layout();
  showMenu();
  document.addEventListener('mal3abready', () => { if (G.overlay === 'menu') showMenu(); else if (G.overlay === 'lobby') showLobby(); });
  requestAnimationFrame(frame);
  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {   // invite link: join that room straight away
    let tried = false;
    const go = async () => { if (tried || ON.code) return; tried = true; if (!(await canGoOnline())) return; joinRoom(roomParam.toUpperCase().slice(0, 6), null); };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
  }

  // ------------------------------------------------------------------ test / scripting API
  const rotA = (a) => (G.rot && a >= 1 && a <= 4) ? a % 4 + 1 : a;
  window.ChronoCourier = {
    get state() {
      return {
        scene: G.scene, overlay: G.overlay, phase: G.phase, level: G.L ? G.L.id : 0, loop: G.round + 1, maxLoops: G.lv ? G.lv.maxLoops : 0,
        tick: G.w ? G.w.t : 0, won: !!(G.w && G.w.won), stars: G.lastStars, loopsUsed: G.lastLoops, rotated: G.rot, lang: getLang(), tile: s,
        me: G.w ? Object.assign({}, G.w.bots[me()]) : null, pkg: G.w ? Object.assign({}, G.w.pkg) : null,
        online: !!G.net, host: isHost(), coop: coopOn(), coopLvl: G.coopLvl, slots: G.slots.slice(), mySlot: mySlot(), echoes: G.loops.map(L => L.own),
        bots: G.w ? G.w.bots.map(b => ({ x: b.x, y: b.y, dead: b.dead, carry: b.carry })) : [], done: G.done.slice(), loopId: G.loopId,
        room: ON.code, role: ON.role, partner: ON.partner ? ON.partner.n : null, pName: G.pName, banner: G.banner ? G.banner.key : null,
        canon: G.w ? G.w.bots.map(b => cXY(b.x, b.y)) : [],
      };
    },
    net: {
      create: () => joinRoom(newCode(), 'host'), join: (c) => joinRoom(c, null), start: (n) => { if (n) G.sel = n - 1; startOnline(); },
      sel: (n) => { G.sel = n - 1; netSend('sel', { l: G.sel }); if (G.overlay === 'lobby') showLobby(); },
      leave: () => { leaveRoom(); G.net = null; showMenu(); }, swap: () => swapRoles(), solo: () => continueSolo(), room: () => ACTIONS.room(),
      next: () => nextLevel(), retry: () => restartLevel(), canonDir: (d) => lD(d),
    },
    engine: E, levels: LEVELS,
    start: (n) => startLevel(Math.max(0, Math.min(LEVELS.length - 1, (n | 0) - 1))),
    menu: () => showMenu(), levelSelect: () => showLevels(), howto: () => showHowto(),
    press: (a) => { if (a === 5) pressAct(); else { pressDir(rotA(a)); releaseDir(rotA(a)); } },
    hold: (a) => pressDir(rotA(a)), release: (a) => releaseDir(rotA(a)),
    // record the whole current loop instantly from an input string ("rrdd..x", digits repeat: 5. = 5 waits)
    runLoop(str) {
      if (G.scene !== 'play' || G.overlay) return false;
      if (G.phase === 'rewind') beginLoop();
      if (G.phase !== 'ready') return false;
      G.scripted = E.decode(str).map(rotA);
      G.phase = 'run'; setBanner(null);
      while (G.phase === 'run' || G.phase === 'ff') doTick();
      G.scripted = null;
      if (G.phase === 'rewind') beginLoop();
      return this.state;
    },
    tick(n) { for (let i = 0; i < (n || 1) && (G.phase === 'run' || G.phase === 'ff'); i++) doTick(); return this.state; },
    restartLoop, undoLoop, endLoop: endLoopNow, pause, resume,
    finish() { if (G.phase === 'done' && !G.overlay) showWin(); return this.state; },
    progress: () => JSON.parse(JSON.stringify(prog)),
    world: () => G.w,
  };
})();
