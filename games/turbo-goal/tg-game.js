// Turbo Goal — the game: menus, input (keyboard, mouse, gamepads, touch), cameras, HUD, match flow, replays,
// sounds, saved stats and the garage. Physics lives in tg-core.js, drawing helpers in tg-render.js, online play in tg-online.js.
(function () {
  'use strict';
  const T = window.TGCore, RD = window.TGRender, A = T.A, R = T.R, C = T.C, STEP = T.STEP;
  const V3 = THREE.Vector3, Q4 = THREE.Quaternion;
  const $ = (id) => document.getElementById(id);
  const clamp = T.clamp;
  const TGO = window.TGO = window.TGO || {};
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  addStrings({
    tg_title: 'توربو جول', tg_sub: 'عربيات بصواريخ وكورة عملاقة — دخّلها الجون!',
    tg_bots: 'ضد البوتات', tg_botsD: 'ماتش 1 ضد 1 أو 2 ضد 2 أو 3 ضد 3 ضد بوتات سهلة أو عادية أو صعبة.',
    tg_split: 'شاشة مقسومة', tg_splitD: 'اتنين على نفس الجهاز: الأول بالكيبورد، والتاني بالكيبورد أو الدراع.', tg_splitTouch: 'محتاجة كمبيوتر بكيبورد',
    tg_online: 'أونلاين', tg_onlineD: 'اعمل أوضة وابعت الكود لصحابك — لحد 6 لاعيبة، والبوتات بتكمّل الأماكن الفاضية.',
    tg_garage: 'الجراج', tg_garageD: 'اختار شكل عربيتك واللون التاني ولون نار البوست.',
    tg_how: 'إزاي تلعب', tg_stats: 'إحصائياتك', tg_settings: 'الإعدادات', tg_play: 'العب',
    tg_mode: 'عدد اللاعيبة', tg_diff: 'مستوى البوتات', tg_easy: 'سهل', tg_normal: 'عادي', tg_hard: 'صعب',
    tg_len: 'مدة الماتش', tg_minN: '{n} دقايق', tg_min2: 'دقيقتين', tg_team: 'فريقك', tg_blue: 'الأزرق', tg_orange: 'البرتقاني',
    tg_start: 'يلا بينا', tg_back: 'رجوع', tg_pName: 'اسم اللاعب {n}', tg_pN: 'لاعب {n}',
    tg_sType: 'نوع الماتش', tg_s1v1: '1 ضد 1', tg_s2v2: '2 ضد 2 (بوت مع كل واحد)', tg_sCoop: 'إنتوا الاتنين ضد بوتين',
    tg_p1keys: 'لاعب 1: WASD سواقة · Space نط · Shift الشمال بوست · Ctrl الشمال أو Q زحلقة · C كاميرا الكورة',
    tg_p2keys: 'لاعب 2: الأسهم سواقة · Enter نط · Shift اليمين بوست · Ctrl اليمين أو . زحلقة · / كاميرا الكورة — أو الدراع',
    tg_padOn: '🎮 في دراع متوصل — هيبقى للاعب 2', tg_padOff: '🎮 مفيش دراع — وصّله واضغط أي زرار فيه', tg_needNames: 'اكتبوا اسميكم الأول', tg_sameNames: 'اختاروا اسمين مختلفين',
    tg_ballCam: 'كاميرا الكورة', tg_super: 'سوبرسونيك!', tg_goal: 'جووول!', tg_ownGoal: 'جون في نفسه!', tg_scored: '{p} جاب الجون', tg_assist: 'أسيست: {p}',
    tg_ot: 'وقت إضافي!', tg_otSub: 'اللي يجيب جون يكسب', tg_go: 'انطلق!', tg_replay: 'إعادة', tg_skip: 'تخطّي',
    tg_demo: '💥 {a} دمّر {b}', tg_demoed: 'اتدمّرت! راجع بعد {n}…', tg_save: '🧤 {p} صدّ الكورة', tg_goalF: '⚽ {p} جاب جون', tg_ownF: '⚽ جون في نفسه ({p})',
    tg_min1: 'فاضل دقيقة!', tg_s30: 'فاضل 30 ثانية!', tg_last: 'آخر لعبة — لحد ما الكورة تلمس الأرض',
    tg_tJump: 'نط', tg_tBoost: 'بوست', tg_tSlide: 'زحلقة', tg_tCam: 'كاميرا',
    tg_win: '{t} كسب!', tg_youWin: 'كسبت! 🏆', tg_youLose: 'خسرت المرة دي 😅', tg_pWon: '{p} كسب! 🏆', tg_coopWin: 'كسبتوا! 🏆', tg_coopLose: 'البوتات كسبت المرة دي',
    tg_mvp: 'أحسن لاعب: {p} ⭐', tg_rematch: 'ماتش تاني', tg_menu: 'القائمة', tg_final: 'النتيجة النهائية', tg_draw: 'تعادل',
    tg_paused: 'استراحة', tg_resume: 'كمّل', tg_restart: 'ابدأ من الأول', tg_leave: 'اخرج من الماتش', tg_leaveQ: 'تخرج من الماتش؟', tg_yes: 'أيوه', tg_no: 'لأ',
    tg_board: 'النتيجة', tg_cName: 'اللاعب', tg_cScore: 'النقط', tg_cGoals: 'أجوان', tg_cAssists: 'أسيست', tg_cSaves: 'صد', tg_cShots: 'شوطات', tg_cDemos: 'تدمير',
    tg_bot: 'بوت', tg_you: 'إنت', tg_teamB: 'الأزرق', tg_teamO: 'البرتقاني',
    tg_bn0: 'نيترو', tg_bn1: 'صاروخ', tg_bn2: 'كوميت', tg_bn3: 'برق', tg_bn4: 'توربو', tg_bn5: 'شرارة', tg_bn6: 'فايبر', tg_bn7: 'زوبعة', tg_bn8: 'رعد', tg_bn9: 'فلاش',
    tg_kDrive: 'السواقة', tg_kWS: 'قدّام / ورا — وفي الهوا بتميّل المناخير لتحت ولفوق', tg_kAD: 'يمين وشمال — وفي الهوا بتلف',
    tg_kSpace: 'نط. اضغط تاني في الهوا تعمل نطة تانية، ولو ماسك اتجاه تعمل شقلبة (دودج) بتخبط الكورة جامد',
    tg_kShift: 'بوست. العداد بيتملا من الدواير المنورة اللي على الأرض (الكبيرة بتملاه للآخر)',
    tg_kCtrl: 'زحلقة (هاند بريك) للف السريع — وفي الهوا مع A/D بتلف حوالين نفسك', tg_kC: 'كاميرا الكورة شغالة / مقفولة', tg_kTab: 'جدول النتيجة', tg_kEsc: 'استراحة',
    tg_kPad: 'الدراع', tg_kPadL: 'RT / LT قدّام وورا · الاستيك سواقة وميل · A نط · B بوست · X زحلقة · Y كاميرا الكورة · LB / RB لف في الهوا · Start استراحة',
    tg_kTouch: 'الموبايل', tg_kTouchL: 'الجويستيك الشمال للسواقة (لفوق = قدّام) · الزراير اليمين: نط وبوست وزحلقة وكاميرا',
    tg_kRules: 'القوانين', tg_kRulesL: 'دخّل الكورة جون الفريق التاني. الماتش بالوقت؛ لو اتعادلتوا في الآخر في وقت إضافي واللي يجيب جون يكسب. لو سرعتك سوبرسونيك وخبطت عربية من الفريق التاني بتدمّرها وترجع بعد 3 ثواني.',
    tg_kTips: 'نصايح', tg_tip1: 'العربية بتطلع على الحيطان المقوسة لو سرعتها كفاية.', tg_tip2: 'وش العربية بيدي أقوى خبطة — والمكان اللي بتخبط فيه الكورة بيحدد هي رايحة فين.',
    tg_tip3: 'للطيران: نط، ارفع المناخير بـ S، واضغط بوست.', tg_tip4: 'C بتخلي الكاميرا تبص على الكورة على طول.', tg_tip5: 'الشقلبة في الكورة أقوى من الخبطة العادية.',
    tg_sPlayed: 'ماتشات', tg_sWins: 'فوز', tg_sLosses: 'خسارة', tg_sGoals: 'أجوان', tg_sAssists: 'أسيست', tg_sSaves: 'صد', tg_sShots: 'شوطات', tg_sDemos: 'تدمير',
    tg_sMvps: 'أحسن لاعب', tg_sStreak: 'أطول سلسلة فوز', tg_sBest: 'أعلى نقط في ماتش', tg_sBotWins: 'فوز ضد البوتات', tg_sOnline: 'ماتشات أونلاين',
    tg_reset: 'امسح الإحصائيات', tg_resetQ: 'تمسح كل الإحصائيات؟', tg_statsNote: 'ماتشات البوتات والأونلاين بس اللي بتتحسب.',
    tg_fov: 'زاوية الكاميرا', tg_dist: 'بعد الكاميرا', tg_height: 'ارتفاع الكاميرا', tg_bcDef: 'كاميرا الكورة في أول الماتش', tg_vol: 'الصوت', tg_quality: 'الجودة',
    tg_qLow: 'خفيفة (أسرع)', tg_qHigh: 'عالية', tg_shake: 'هزة الشاشة', tg_replays: 'إعادة الأجوان', tg_on: 'شغال', tg_off: 'مقفول', tg_done: 'تمام',
    tg_body: 'شكل العربية', tg_accent: 'اللون التاني', tg_trail: 'لون النار', tg_d0: 'كوميت', tg_d1: 'بولدوج', tg_d2: 'ستينجر', tg_d3: 'هورنت',
    tg_tr0: 'نار', tg_tr1: 'بلازما', tg_tr2: 'سمّ', tg_tr3: 'ملكي', tg_tr4: 'حلاوة', tg_teamCol: 'اللون الأساسي للعربية بيبقى لون فريقك (أزرق أو برتقاني).', tg_seeTeam: 'شوف اللون التاني',
    tg_name: 'اسمك', tg_noWebgl: 'المتصفح ده مش بيشغّل رسوم 3D (WebGL).',
  }, {
    tg_title: 'Turbo Goal', tg_sub: 'Rocket cars, a giant ball — smash it into the goal!',
    tg_bots: 'Play vs Bots', tg_botsD: '1v1, 2v2 or 3v3 against easy, normal or hard bots.',
    tg_split: 'Split Screen', tg_splitD: 'Two players on one device: keyboard for player 1, keyboard or gamepad for player 2.', tg_splitTouch: 'Needs a computer with a keyboard',
    tg_online: 'Online', tg_onlineD: 'Create a room and send the code to your friends — up to 6 players, bots fill the empty seats.',
    tg_garage: 'Garage', tg_garageD: 'Pick your car, its second colour and its boost flame.',
    tg_how: 'How to Play', tg_stats: 'Your Stats', tg_settings: 'Settings', tg_play: 'Play',
    tg_mode: 'Players', tg_diff: 'Bot Level', tg_easy: 'Easy', tg_normal: 'Normal', tg_hard: 'Hard',
    tg_len: 'Match Length', tg_minN: '{n} min', tg_min2: '2 min', tg_team: 'Your Team', tg_blue: 'Blue', tg_orange: 'Orange',
    tg_start: 'Start', tg_back: 'Back', tg_pName: "Player {n}'s Name", tg_pN: 'Player {n}',
    tg_sType: 'Match Type', tg_s1v1: '1v1', tg_s2v2: '2v2 (a bot with each of you)', tg_sCoop: 'Both of you vs 2 bots',
    tg_p1keys: 'Player 1: WASD drive · Space jump · Left Shift boost · Left Ctrl or Q slide · C ball cam',
    tg_p2keys: 'Player 2: arrows drive · Enter jump · Right Shift boost · Right Ctrl or . slide · / ball cam — or the gamepad',
    tg_padOn: '🎮 Gamepad connected — it goes to player 2', tg_padOff: '🎮 No gamepad — plug one in and press any button', tg_needNames: 'Type both names first', tg_sameNames: 'Pick two different names',
    tg_ballCam: 'Ball Cam', tg_super: 'Supersonic!', tg_goal: 'Goal!', tg_ownGoal: 'Own goal!', tg_scored: '{p} scored', tg_assist: 'Assist: {p}',
    tg_ot: 'Overtime!', tg_otSub: 'Next goal wins', tg_go: 'Go!', tg_replay: 'Replay', tg_skip: 'Skip',
    tg_demo: '💥 {a} demolished {b}', tg_demoed: 'Demolished! Back in {n}…', tg_save: '🧤 {p} made a save', tg_goalF: '⚽ {p} scored', tg_ownF: '⚽ Own goal ({p})',
    tg_min1: '1 minute left!', tg_s30: '30 seconds left!', tg_last: 'Last play — until the ball touches the floor',
    tg_tJump: 'Jump', tg_tBoost: 'Boost', tg_tSlide: 'Slide', tg_tCam: 'Cam',
    tg_win: '{t} wins!', tg_youWin: 'You win! 🏆', tg_youLose: 'You lost this one 😅', tg_pWon: '{p} won! 🏆', tg_coopWin: 'You both win! 🏆', tg_coopLose: 'The bots won this time',
    tg_mvp: 'MVP: {p} ⭐', tg_rematch: 'Rematch', tg_menu: 'Menu', tg_final: 'Final Score', tg_draw: 'Draw',
    tg_paused: 'Paused', tg_resume: 'Resume', tg_restart: 'Restart', tg_leave: 'Leave Match', tg_leaveQ: 'Leave the match?', tg_yes: 'Yes', tg_no: 'No',
    tg_board: 'Scoreboard', tg_cName: 'Player', tg_cScore: 'Score', tg_cGoals: 'Goals', tg_cAssists: 'Assists', tg_cSaves: 'Saves', tg_cShots: 'Shots', tg_cDemos: 'Demos',
    tg_bot: 'Bot', tg_you: 'You', tg_teamB: 'Blue', tg_teamO: 'Orange',
    tg_bn0: 'Nitro', tg_bn1: 'Rocket', tg_bn2: 'Comet', tg_bn3: 'Bolt', tg_bn4: 'Turbo', tg_bn5: 'Spark', tg_bn6: 'Viper', tg_bn7: 'Cyclone', tg_bn8: 'Thunder', tg_bn9: 'Flash',
    tg_kDrive: 'Driving', tg_kWS: 'Forward / reverse — in the air they tip the nose down and up', tg_kAD: 'Steer — in the air they turn the car',
    tg_kSpace: 'Jump. Press again in the air for a double jump, or hold a direction to dodge-flip into the ball for a big hit',
    tg_kShift: 'Boost. Refill the meter on the glowing pads on the floor (big ones fill it up)',
    tg_kCtrl: 'Powerslide for tight turns — in the air, with A/D it air-rolls', tg_kC: 'Ball cam on / off', tg_kTab: 'Scoreboard', tg_kEsc: 'Pause',
    tg_kPad: 'Gamepad', tg_kPadL: 'RT / LT throttle · stick steer and pitch · A jump · B boost · X slide · Y ball cam · LB / RB air roll · Start pause',
    tg_kTouch: 'Phone', tg_kTouchL: 'Left joystick drives (up = forward) · right buttons: jump, boost, slide and cam',
    tg_kRules: 'Rules', tg_kRulesL: "Put the ball in the other team's goal. Matches are timed; a tie at the end goes to overtime, where the next goal wins. Hit an opponent at supersonic speed to demolish them — they're back in 3 seconds.",
    tg_kTips: 'Tips', tg_tip1: 'Your car can drive up the curved walls if it is fast enough.', tg_tip2: 'The nose gives the strongest hit — and where you touch the ball decides where it goes.',
    tg_tip3: 'To fly: jump, lift the nose with S, then boost.', tg_tip4: 'C keeps the camera on the ball.', tg_tip5: 'A dodge into the ball hits much harder than a plain bump.',
    tg_sPlayed: 'Matches', tg_sWins: 'Wins', tg_sLosses: 'Losses', tg_sGoals: 'Goals', tg_sAssists: 'Assists', tg_sSaves: 'Saves', tg_sShots: 'Shots', tg_sDemos: 'Demos',
    tg_sMvps: 'MVPs', tg_sStreak: 'Best Win Streak', tg_sBest: 'Best Match Score', tg_sBotWins: 'Wins vs Bots', tg_sOnline: 'Online Matches',
    tg_reset: 'Reset Stats', tg_resetQ: 'Reset all stats?', tg_statsNote: 'Only matches against bots and online matches count.',
    tg_fov: 'Camera Angle', tg_dist: 'Camera Distance', tg_height: 'Camera Height', tg_bcDef: 'Ball Cam at Kickoff', tg_vol: 'Volume', tg_quality: 'Quality',
    tg_qLow: 'Light (faster)', tg_qHigh: 'High', tg_shake: 'Screen Shake', tg_replays: 'Goal Replays', tg_on: 'On', tg_off: 'Off', tg_done: 'Done',
    tg_body: 'Body', tg_accent: 'Second Colour', tg_trail: 'Boost Flame', tg_d0: 'Comet', tg_d1: 'Bulldog', tg_d2: 'Stinger', tg_d3: 'Hornet',
    tg_tr0: 'Fire', tg_tr1: 'Plasma', tg_tr2: 'Toxic', tg_tr3: 'Royal', tg_tr4: 'Candy', tg_teamCol: "The main colour is always your team's colour (blue or orange).", tg_seeTeam: 'See Other Team',
    tg_name: 'Your Name', tg_noWebgl: "This browser can't show 3D graphics (WebGL).",
  });

  // ------------------------------------------------------------------ saves
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('turbo-goal-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('turbo-goal-' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const touchMode = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  const DEF_SET = { fov: 78, dist: 9.5, height: 3.4, ballCam: true, vol: 0.7, quality: touchMode ? 'low' : 'high', shake: true, replays: true };
  const DEF_STATS = { played: 0, wins: 0, losses: 0, botWins: 0, goals: 0, assists: 0, saves: 0, shots: 0, demos: 0, mvps: 0, streak: 0, bestStreak: 0, bestScore: 0, online: 0 };
  let SET, GAR, STATS, MENU, NAMES;
  function loadSaves() {
    SET = Object.assign({}, DEF_SET, LS.get('settings', {}));
    GAR = Object.assign({ design: 0, accent: 0, trail: 0 }, LS.get('garage', {}));
    STATS = Object.assign({}, DEF_STATS, LS.get('stats', {}));
    MENU = Object.assign({ size: 1, diff: 'normal', len: 5, team: 0, smode: '1v1', slen: 5 }, LS.get('menu', {}));
    NAMES = LS.get('names', ['', '']); if (!Array.isArray(NAMES)) NAMES = ['', ''];
  }
  loadSaves();
  const best = () => { try { if (window.Mal3abBest) Mal3abBest('turbogoal', STATS.botWins | 0); } catch (e) {} };
  const myName = () => { const a = window.Auth && Auth.name && Auth.name(); if (a) return String(a).slice(0, 16); return (LS.get('name', '') || '').slice(0, 16) || t('tg_you'); };

  // ------------------------------------------------------------------ renderer + scene
  const canvas = $('c');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: SET.quality === 'high' && !touchMode, powerPreference: 'high-performance' }); }
  catch (e) { document.body.innerHTML = '<div style="padding:40px;text-align:center;font:18px sans-serif;color:#fff">' + t('tg_noWebgl') + '</div>'; return; }
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070914);
  scene.fog = new THREE.Fog(0x070914, 160, 420);
  scene.add(new THREE.HemisphereLight(0xc4d2ff, 0x2a2440, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(30, 80, 20); scene.add(sun);
  const arena = RD.buildArena(scene);
  const padMeshes = RD.buildPads(scene);
  const PS = RD.makeParticles(scene, 2600);
  const ballMesh = RD.makeBallMesh(); scene.add(ballMesh.g);
  const ballShadow = RD.makeShadow(R * 2.6); scene.add(ballShadow);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(ring); ring.visible = false;
  const cams = [new THREE.PerspectiveCamera(78, 1, 0.3, 900), new THREE.PerspectiveCamera(78, 1, 0.3, 900)];
  cams[0].position.set(0, 40, -120); cams[0].lookAt(0, 0, 0);
  let VW = innerWidth, VH = innerHeight;
  function resize() {
    VW = innerWidth; VH = innerHeight;
    const pr = Math.min(devicePixelRatio || 1, SET.quality === 'high' ? 1.75 : 1);
    renderer.setPixelRatio(pr); renderer.setSize(VW, VH, false);
    layoutHud();
  }
  addEventListener('resize', resize);

  // ------------------------------------------------------------------ sound (all synthesised)
  const AU = {
    ctx: null, master: null, noise: null, eng: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      const c = this.ctx; this.master = c.createGain(); this.master.gain.value = SET.vol; this.master.connect(c.destination);
      const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = b;
      // engine + boost hiss for the first local car
      const o = c.createOscillator(); o.type = 'sawtooth'; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; const g = c.createGain(); g.gain.value = 0;
      o.connect(lp); lp.connect(g); g.connect(this.master); o.start();
      const n = c.createBufferSource(); n.buffer = b; n.loop = true; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8; const ng = c.createGain(); ng.gain.value = 0;
      n.connect(bp); bp.connect(ng); ng.connect(this.master); n.start();
      this.eng = { o, g, lp, ng };
    },
    vol(v) { SET.vol = v; if (this.master) this.master.gain.value = v; },
    tone(f, d, type, v, f2, delay) {
      const c = this.ctx; if (!c) return; const t0 = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + d + 0.05);
    },
    hiss(d, v, f, q, f2, attack) {
      const c = this.ctx; if (!c) return; const t0 = c.currentTime;
      const s = c.createBufferSource(); s.buffer = this.noise; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t0); bp.Q.value = q || 1;
      if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(bp); bp.connect(g); g.connect(this.master); s.start(t0); s.stop(t0 + d + 0.05);
    },
    play(k, v, p) {
      if (!this.ctx || G.mode === 'attract') return; v = v == null ? 1 : v; if (v < 0.02) return;
      switch (k) {
        case 'hit': { const s = clamp((p || 20) / 90, 0.15, 1); this.tone(150, 0.16, 'sine', 0.5 * s * v, 45); this.hiss(0.09, 0.35 * s * v, 1800, 1.2); break; }
        case 'wall': this.tone(90, 0.12, 'sine', 0.22 * v, 40); break;
        case 'bump': this.tone(70, 0.2, 'square', 0.12 * v, 35); this.hiss(0.12, 0.2 * v, 500, 1); break;
        case 'jump': this.tone(260, 0.1, 'triangle', 0.12 * v, 480); break;
        case 'dodge': this.hiss(0.28, 0.22 * v, 500, 1.5, 2600); break;
        case 'pad': this.tone(880, 0.07, 'square', 0.05 * v); this.tone(1320, 0.08, 'square', 0.04 * v, null, 0.05); break;
        case 'bigpad': [660, 880, 1320].forEach((f, i) => this.tone(f, 0.12, 'square', 0.05 * v, null, i * 0.06)); break;
        case 'beep': this.tone(620, 0.16, 'square', 0.1); break;
        case 'go': this.tone(940, 0.45, 'square', 0.12); break;
        case 'goal': this.hiss(0.9, 0.55, 700, 0.6, 180); this.tone(70, 0.7, 'sine', 0.5, 35); [220, 277, 330, 440].forEach((f, i) => this.tone(f, 1.1, 'sawtooth', 0.07, null, 0.08 + i * 0.02)); this.hiss(2.8, 0.18, 900, 0.5, 700, 0.6); break;
        case 'demo': this.hiss(0.6, 0.45 * v, 600, 0.7, 120); this.tone(60, 0.5, 'sine', 0.45 * v, 30); break;
        case 'click': this.tone(700, 0.05, 'triangle', 0.06); break;
        case 'whistle': this.tone(1900, 0.22, 'sine', 0.12, 2300); this.tone(1900, 0.5, 'sine', 0.12, 1700, 0.26); break;
      }
    },
    engine(car, on) {
      const e = this.eng; if (!e) return; const c = this.ctx, now = c.currentTime;
      if (!on || !car || car.dead) { e.g.gain.setTargetAtTime(0, now, 0.08); e.ng.gain.setTargetAtTime(0, now, 0.05); return; }
      const sp = car.vel.length();
      e.o.frequency.setTargetAtTime(38 + sp * 1.5 + (car.boosting ? 18 : 0), now, 0.06);
      e.lp.frequency.setTargetAtTime(260 + sp * 9, now, 0.08);
      e.g.gain.setTargetAtTime(0.018 + sp / 69 * 0.035, now, 0.1);
      e.ng.gain.setTargetAtTime(car.boosting ? 0.06 : 0, now, 0.04);
    },
  };
  addEventListener('pointerdown', () => AU.init(), { capture: true });
  addEventListener('keydown', () => AU.init(), { capture: true });

  // ------------------------------------------------------------------ game state
  const G = {
    mode: 'menu', W: null, phase: 'none', clock: 300, len: 300, ot: false, score: [0, 0], cd: 0, goalT: 0, zeroAt: -1, auth: true, online: false,
    views: [], meshes: new Map(), paused: false, acc: 0, rec: [], recT: 0, rp: null, touches: [], warn: 0, overlay: null, cfg: null, lastGoal: null,
    kickT: 0, alpha: 1, t: 0, preT: [false, false], banner: 0, garage: null, attractT: 0, fps: 0,
  };
  window.TGI = {};   // filled at the end; tg-online.js uses it

  function botName(i) { return '🤖 ' + t('tg_bn' + (i % 10)); }
  function carLabel(c) { return c.kind === 'bot' && !c.owner ? botName(c.bi | 0) : c.name; }
  function bodyInit(o) { o.pp = new V3().copy(o.pos); o.pq = new Q4().copy(o.q); o.rp = new V3().copy(o.pos); o.rq = new Q4().copy(o.q); o.off = new V3(); }
  function snapBodies() {
    const W = G.W; if (!W) return;
    for (const c of W.cars) { c.pp.copy(c.pos); c.pq.copy(c.q); c.rp.copy(c.pos); c.rq.copy(c.q); c.off.set(0, 0, 0); }
    const b = W.ball; b.pp.copy(b.pos); b.pq.copy(b.q); b.rp.copy(b.pos); b.rq.copy(b.q); b.off.set(0, 0, 0);
  }

  // ------------------------------------------------------------------ matches
  // cfg: { mode, size, diff, len (min), cars: [{cid, team, name, kind, owner, diff, design, accent, trail, bi}], locals: [cid, cid?], auth, online }
  function clearMatch() {
    for (const m of G.meshes.values()) { scene.remove(m.g); if (m.shadow) scene.remove(m.shadow); }
    G.meshes.clear(); G.views = []; G.W = null; G.rp = null; G.rec = []; PS.clear(); ring.visible = false;
    $('tags').innerHTML = '';
  }
  function newMatch(cfg) {
    clearMatch();
    G.cfg = cfg; G.mode = cfg.mode; G.auth = cfg.auth !== false; G.online = !!cfg.online;
    const W = G.W = T.makeWorld();
    for (const o of cfg.cars) {
      const c = T.makeCar(o); c.bi = o.bi | 0; bodyInit(c); W.cars.push(c);
      const m = RD.makeCarMesh(o); scene.add(m.g); G.meshes.set(c.cid, m);
      m.shadow = RD.makeShadow(4.6); scene.add(m.shadow);
    }
    bodyInit(W.ball);
    G.views = (cfg.locals || []).map((cid, slot) => makeView(W.cars.find(c => c.cid === cid), slot));
    G.score = [0, 0]; G.len = (cfg.len || 5) * 60; G.clock = G.len; G.ot = false; G.zeroAt = -1; G.warn = 0; G.touches = []; G.paused = false; G.overlay = null;
    G.phase = 'none'; G.acc = 0; G.lastGoal = null;
    buildHud(); layoutHud();
    $('hud').hidden = false; $('menu').hidden = true; $('garage').hidden = true; $('ov').hidden = true; $('board').hidden = true;
    $('touch').hidden = !touchMode || !G.views.length;
    if (G.auth) startKickoff();
    return W;
  }
  function makeView(car, slot) {
    return { car, slot, cam: cams[slot], dirS: new V3(0, 0, 1), upS: new V3(0, 1, 0), pos: new V3(), look: new V3(), ballCam: !!SET.ballCam, shake: 0, el: null, inp: { cam: false, pause: false, board: false }, superT: 0 };
  }
  function startKickoff(spots, cdMs) {
    const W = G.W;
    if (spots) {
      for (const c of W.cars) { const s = spots[c.cid]; if (s) { T.placeCar(c, s[0], s[1], s[2]); c.boost = 33; } }
      const b = W.ball; b.pos.set(0, R, 0); b.vel.set(0, 0, 0); b.w.set(0, 0, 0); b.q.identity(); W.pads.forEach(p => { p.on = true; p.t = 0; });
    } else spots = T.kickoff(W);
    G.phase = 'kickoff'; G.cd = cdMs != null ? cdMs / 1000 : 3; G.lastCd = 4; G.rp = null; $('rp').hidden = true;
    G.touches = []; G.zeroAt = -1; ring.visible = false; ballMesh.g.visible = true;
    for (const v of G.views) { v.ballCam = !!SET.ballCam; v.shake = 0; }
    snapBodies();
    for (const v of G.views) { v.dirS.set(0, 0, 1).applyQuaternion(v.car.q); v.dirS.y = 0; v.dirS.normalize(); v.upS.set(0, 1, 0); }
    G.rec = [];
    if (G.online && G.auth && TGO.sendKickoff) TGO.sendKickoff(spots, G.cd);
    return spots;
  }
  function go() { G.phase = 'play'; G.W.kick = true; G.kickT = 0; banner(t('tg_go'), '', 'w', 0.8); AU.play('go'); }

  // ------------------------------------------------------------------ one fixed step
  function stepOpts() {
    if (G.online && TGO.stepOpts) return TGO.stepOpts(G.phase);
    if (G.phase === 'goal') return { ballLocal: false, hits: () => false };
    return {};
  }
  function simStep(dt) {
    const W = G.W;
    for (const v of G.views) applyInput(v);
    if (G.phase === 'kickoff') {
      G.cd -= dt; const n = Math.ceil(G.cd);
      if (n !== G.lastCd && n > 0 && n <= 3) { G.lastCd = n; banner(String(n), '', 'w', 0.9); AU.play('beep'); }
      if (G.cd <= 0) go();
    }
    W.frozen = G.phase === 'kickoff';
    W.phase = G.phase === 'kickoff' ? 'kickoff' : 'play';
    if (W.kick) { G.kickT += dt; if (G.kickT > 3.5) W.kick = false; }
    if (G.phase === 'play' && G.auth) clockStep(dt);
    for (const c of W.cars) { c.pp.copy(c.pos); c.pq.copy(c.q); }
    W.ball.pp.copy(W.ball.pos); W.ball.pq.copy(W.ball.q);
    if (G.auth) { G.preT[0] = T.onTarget(W.ball, 0); G.preT[1] = T.onTarget(W.ball, 1); }
    if (G.online && TGO.preStep) TGO.preStep(dt);
    T.step(W, dt, stepOpts());
    for (const e of W.ev) handleEvent(e);
    W.ev.length = 0;
    if (G.online && TGO.postStep) TGO.postStep(dt);
    if (G.auth && G.phase === 'play') checkGoal();
    if (G.phase === 'goal') { G.goalT += dt; if (G.auth && G.goalT > 2.4) afterGoal(); }
    G.recT -= dt;
    if (G.recT <= 0 && (G.phase === 'play' || (G.phase === 'goal' && G.goalT < 1.2))) { G.recT = 1 / 30; record(); }
  }
  function clockStep(dt) {
    if (G.ot) { G.clock += dt; return; }
    const before = G.clock;
    G.clock = Math.max(0, G.clock - dt);
    if (before > 60 && G.clock <= 60 && G.len > 90) feed(t('tg_min1'));
    if (before > 30 && G.clock <= 30) feed(t('tg_s30'));
    if (G.clock <= 0) {
      if (G.zeroAt < 0) { G.zeroAt = G.W.t; if (G.score[0] === G.score[1]) {} else feed(t('tg_last')); }
      const landed = G.W.ball.floorT >= G.zeroAt || G.W.ball.pos.y < R + 0.3;
      if (landed || G.W.t - G.zeroAt > 6) {
        if (G.score[0] === G.score[1]) startOvertime(); else endMatch();
      }
    }
  }
  function startOvertime() {
    G.ot = true; G.clock = 0; banner(t('tg_ot'), t('tg_otSub'), 'w', 2.2); AU.play('whistle');
    if (G.online && TGO.sendEvent) TGO.sendEvent('ot', {});
    startKickoff(null, 3500);
  }
  function handleEvent(e) {
    const W = G.W;
    if (G.online && TGO.onEvent && TGO.onEvent(e)) return;
    switch (e.e) {
      case 'touch': touchFx(e.c, e.p, e.x, e.y, e.z); if (G.auth) registerTouch(e.c); W.kick = false; break;
      case 'demo': if (G.auth) applyDemo(e.v, e.by); break;
      case 'pad': if (isLocal(e.c)) AU.play(e.big ? 'bigpad' : 'pad', 0.8); break;
      case 'dodge': if (isLocal(e.c)) AU.play('dodge'); break;
      case 'djump': if (isLocal(e.c)) AU.play('jump', 0.7); break;
      case 'bump': AU.play('bump', distVol(e.a.pos)); break;
      case 'respawn': { const m = G.meshes.get(e.c.cid); if (m) m.g.visible = true; e.c.pp.copy(e.c.pos); e.c.pq.copy(e.c.q); e.c.off.set(0, 0, 0); break; }
      case 'wall': if (W.t - (G.wallT || 0) > 0.12) { G.wallT = W.t; AU.play('wall', distVol(W.ball.pos) * clamp(e.p / 50, 0.2, 1)); } break;
    }
  }
  const isLocal = (c) => G.views.some(v => v.car === c);
  function distVol(p) { const cam = G.views.length ? G.views[0].cam : cams[0]; const d = cam.position.distanceTo(p); return clamp(1 - d / 170, 0.12, 1); }
  function touchFx(c, p, x, y, z) {
    if (W_t() - (c.fxT || -9) > 0.12) {
      c.fxT = W_t();
      AU.play('hit', distVol(G.W.ball.pos), p);
      const col = c.team ? [1, 0.6, 0.25] : [0.45, 0.7, 1];
      PS.burst(x, y, z, Math.round(clamp(p / 4, 4, 26)), clamp(p * 0.35, 6, 30), 0.45, 0.9, [col, [1, 1, 1]], 6);
      for (const v of G.views) if (v.car === c && p > 40) v.shake = Math.max(v.shake, clamp((p - 40) / 90, 0, 0.5));
    }
  }
  const W_t = () => G.W ? G.W.t : 0;
  // stats: a touch, a shot (it is now heading into the other goal), a save (it was heading into ours and no longer is)
  function registerTouch(c) {
    const W = G.W, now = W.t;
    const last = G.touches[G.touches.length - 1];
    if (!last || last.cid !== c.cid || now - last.t > 0.3) { G.touches.push({ cid: c.cid, team: c.team, t: now }); if (G.touches.length > 12) G.touches.shift(); c.st.touches++; c.st.score += 2; }
    else last.t = now;
    const opp = 1 - c.team;
    if (!G.preT[opp] && T.onTarget(W.ball, opp) && now - (c.shotT || -9) > 1) { c.shotT = now; c.st.shots++; c.st.score += 20; }
    if (G.preT[c.team] && !T.onTarget(W.ball, c.team) && now - (c.saveT || -9) > 1.5 && Math.abs(W.ball.pos.z) > A.HL - 40) {
      c.saveT = now; c.st.saves++; c.st.score += 50; feed(t('tg_save', { p: esc(carLabel(c)) }));
      if (G.online && TGO.sendEvent) TGO.sendEvent('fd', { k: 'save', c: c.cid });
    }
  }
  function applyDemo(v, by, fromNet) {
    if (!v || v.dead) return;
    T.demolish(v, G.W);
    if (by) { by.st.demos++; by.st.score += 25; }
    demoFx(v, by);
    if (G.online && G.auth && !fromNet && TGO.sendDemo) TGO.sendDemo(v, by);
  }
  function demoFx(v, by) {
    const m = G.meshes.get(v.cid); if (m) m.g.visible = false;
    PS.burst(v.pos.x, v.pos.y, v.pos.z, 90, 28, 1.1, 1.6, [[1, 0.5, 0.1], [1, 0.85, 0.3], [0.4, 0.4, 0.45]], 8, 1);
    AU.play('demo', distVol(v.pos));
    feed(t('tg_demo', { a: esc(by ? carLabel(by) : '?'), b: esc(carLabel(v)) }));
    for (const vw of G.views) if (vw.car === v || vw.car === by) vw.shake = Math.max(vw.shake, 0.6);
  }
  function checkGoal() {
    const b = G.W.ball.pos;
    if (Math.abs(b.z) > A.HL + R && Math.abs(b.x) < A.GHW + 1 && b.y < A.GH + 1) scoreGoal(b.z > 0 ? 0 : 1);
  }
  function scoreGoal(team) {
    const W = G.W, now = W.t;
    const mine = G.touches.filter(x => x.team === team);
    const sc = mine[mine.length - 1];
    let scorer = sc ? W.cars.find(c => c.cid === sc.cid) : null, assist = null, own = null;
    if (sc) { const prev = mine.slice(0, -1).reverse().find(x => x.cid !== sc.cid && sc.t - x.t < 6); if (prev) assist = W.cars.find(c => c.cid === prev.cid); }
    else { const lt = G.touches[G.touches.length - 1]; own = lt ? W.cars.find(c => c.cid === lt.cid) : null; }
    if (scorer) { scorer.st.goals++; scorer.st.score += 100; }
    if (assist) { assist.st.assists++; assist.st.score += 50; }
    G.score[team]++;
    const info = { team, scorer: scorer && scorer.cid, assist: assist && assist.cid, own: own && own.cid, x: W.ball.pos.x, y: W.ball.pos.y, z: W.ball.pos.z };
    onGoal(info);
    if (G.online && TGO.sendGoal) TGO.sendGoal(info);
    void now;
  }
  // everyone (host and guests) runs the celebration
  function onGoal(info) {
    const W = G.W;
    G.phase = 'goal'; G.goalT = 0; G.lastGoal = info; G.goalRecIdx = G.rec.length;
    const col = info.team ? [1, 0.55, 0.15] : [0.35, 0.65, 1];
    PS.burst(info.x, info.y, info.z, 340, 60, 1.8, 2.2, [col, [1, 1, 1], col], 10, 1.5);
    ring.visible = true; ring.position.set(info.x, Math.max(1, info.y), Math.sign(info.z) * A.HL); ring.scale.setScalar(1); ring.material.opacity = 1; ring.material.color.setRGB(col[0], col[1], col[2]);
    G.ringT = 0;
    AU.play('goal');
    for (const v of G.views) v.shake = Math.max(v.shake, 0.9 * clamp(1 - v.car.pos.distanceTo(W.ball.pos) / 200, 0.3, 1));
    // blast nearby cars away
    for (const c of W.cars) {
      if (c.dead || (G.online && c.kind === 'remote')) continue;
      const d = c.pos.distanceTo(W.ball.pos);
      if (d < 36) { const k = (36 - d) * 2.2; const dir = new V3().subVectors(c.pos, W.ball.pos).normalize(); c.vel.addScaledVector(dir, k); c.vel.y += k * 0.5; c.grounded = false; c.airT = 0; }
    }
    ballMesh.g.visible = false;
    const byC = info.scorer && W.cars.find(c => c.cid === info.scorer), asC = info.assist && W.cars.find(c => c.cid === info.assist), ownC = info.own && W.cars.find(c => c.cid === info.own);
    banner(byC ? t('tg_goal') : t('tg_ownGoal'), (byC ? t('tg_scored', { p: esc(carLabel(byC)) }) : ownC ? esc(carLabel(ownC)) : '') + (asC ? ' · ' + t('tg_assist', { p: esc(carLabel(asC)) }) : ''), 't' + info.team, 2.4);
    feed(byC ? t('tg_goalF', { p: esc(carLabel(byC)) }) : t('tg_ownF', { p: ownC ? esc(carLabel(ownC)) : '?' }));
    updateScore();
  }
  function afterGoal() {
    const decided = G.ot || (G.clock <= 0 && G.score[0] !== G.score[1]);
    if (decided) { endMatch(); return; }
    if (SET.replays && G.rec.length > 20) startReplay();
    else startKickoff();
  }

  // ------------------------------------------------------------------ replays: the last few seconds, re-played from recorded frames
  function record() {
    const W = G.W, b = W.ball, f = { b: [b.rp.x, b.rp.y, b.rp.z, b.rq.x, b.rq.y, b.rq.z, b.rq.w], c: [], v: ballMesh.g.visible };
    for (const c of W.cars) f.c.push([c.rp.x, c.rp.y, c.rp.z, c.rq.x, c.rq.y, c.rq.z, c.rq.w, (c.boosting ? 1 : 0) | (c.dead ? 2 : 0)]);
    G.rec.push(f); if (G.rec.length > 240) { G.rec.shift(); if (G.goalRecIdx) G.goalRecIdx--; }
  }
  function startReplay() {
    const end = G.rec.length - 1, gi = clamp(G.goalRecIdx || end, 0, end), start = Math.max(0, gi - 135);
    G.rp = { f: start, start, gi, end, cam: new V3(), look: new V3(), init: false };
    G.phase = 'replay'; $('rp').hidden = false;
    ballMesh.g.visible = true; ring.visible = false;
  }
  function replayStep(dt) {
    const rp = G.rp; if (!rp) return;
    const slow = rp.f > rp.gi - 30 && rp.f < rp.gi + 5;
    rp.f += dt * 30 * (slow ? 0.45 : 1);
    if (rp.f >= rp.end) { endReplay(); return; }
    const i = Math.floor(rp.f), k = rp.f - i, a = G.rec[i], b = G.rec[Math.min(i + 1, rp.end)];
    const W = G.W, bl = W.ball;
    bl.rp.set(a.b[0] + (b.b[0] - a.b[0]) * k, a.b[1] + (b.b[1] - a.b[1]) * k, a.b[2] + (b.b[2] - a.b[2]) * k);
    bl.rq.set(a.b[3], a.b[4], a.b[5], a.b[6]);
    ballMesh.g.visible = a.v !== false;
    W.cars.forEach((c, j) => {
      const p = a.c[j], q = b.c[j]; if (!p || !q) return;
      c.rp.set(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k);
      _qa.set(p[3], p[4], p[5], p[6]); _qb.set(q[3], q[4], q[5], q[6]); c.rq.slerpQuaternions(_qa, _qb, k);
      c.rpBoost = !!(p[7] & 1); c.rpDead = !!(p[7] & 2);
    });
    if (i >= rp.gi && !rp.boom) { rp.boom = true; const g = G.lastGoal; if (g) { const col = g.team ? [1, 0.55, 0.15] : [0.35, 0.65, 1]; PS.burst(bl.rp.x, bl.rp.y, bl.rp.z, 200, 50, 1.4, 2, [col, [1, 1, 1]], 10, 1.5); AU.play('goal'); } }
    // camera: behind the ball, leaning toward where it flies
    const nx = G.rec[Math.min(i + 8, rp.end)].b, dir = new V3(nx[0] - bl.rp.x, 0, nx[2] - bl.rp.z);
    if (dir.lengthSq() < 0.5) dir.set(0, 0, Math.sign(bl.rp.z || 1)); dir.normalize();
    const want = new V3().copy(bl.rp).addScaledVector(dir, -20).add(new V3(dir.z * 8, 8, -dir.x * 8));
    keepInside(want, 2);
    if (!rp.init) { rp.cam.copy(want); rp.look.copy(bl.rp); rp.init = true; }
    rp.cam.lerp(want, 1 - Math.exp(-dt * 2.5)); rp.look.lerp(bl.rp, 1 - Math.exp(-dt * 6));
  }
  const _qa = new Q4(), _qb = new Q4();
  function endReplay() {
    G.rp = null; $('rp').hidden = true;
    for (const c of G.W.cars) { c.rpBoost = c.rpDead = undefined; }
    if (G.online && !G.auth) { G.phase = 'wait'; snapBodies(); return; }   // the host sends the next kickoff
    startKickoff();
  }
  function skipReplay() { if (G.phase === 'replay') endReplay(); }

  // ------------------------------------------------------------------ end of match
  function endMatch(netInfo) {
    G.phase = 'over'; G.W.frozen = true; ring.visible = false; $('rp').hidden = true; G.rp = null;
    const W = G.W;
    if (netInfo) { G.score = netInfo.sc.slice(); for (const [cid, st] of netInfo.st || []) { const c = W.cars.find(x => x.cid === cid); if (c) Object.assign(c.st, st); } }
    const win = G.score[0] > G.score[1] ? 0 : G.score[1] > G.score[0] ? 1 : -1;
    const ranked = W.cars.filter(c => c.team === win).sort((a, b) => b.st.score - a.st.score);
    const mvp = netInfo ? W.cars.find(c => c.cid === netInfo.mvp) : ranked[0];
    G.mvp = mvp ? mvp.cid : null;
    if (G.online && G.auth && TGO.sendOver) TGO.sendOver({ sc: G.score, st: W.cars.map(c => [c.cid, c.st]), mvp: G.mvp });
    // save stats (bots and online only)
    if ((G.mode === 'bots' || G.mode === 'online') && G.views[0]) {
      const me = G.views[0].car, won = me.team === win;
      STATS.played++; STATS.goals += me.st.goals; STATS.assists += me.st.assists; STATS.saves += me.st.saves; STATS.shots += me.st.shots; STATS.demos += me.st.demos;
      if (G.mvp === me.cid) STATS.mvps++;
      STATS.bestScore = Math.max(STATS.bestScore, me.st.score);
      if (won) { STATS.wins++; STATS.streak++; STATS.bestStreak = Math.max(STATS.bestStreak, STATS.streak); } else { STATS.losses++; STATS.streak = 0; }
      if (G.mode === 'online') STATS.online++;
      if (G.mode === 'bots' && won) STATS.botWins++;
      LS.set('stats', STATS);
      if (G.mode === 'bots' && won) best();
    }
    AU.play('whistle');
    setTimeout(() => { if (G.phase === 'over') showResults(win); }, 1400);
  }
  function resultTitle(win) {
    if (win < 0) return t('tg_draw');
    if (G.mode === 'split') {
      const humans = G.views.map(v => v.car);
      if (humans[0].team === humans[1].team) return humans[0].team === win ? t('tg_coopWin') : t('tg_coopLose');
      const w = humans.find(c => c.team === win); return t('tg_pWon', { p: esc(w.name) });
    }
    if (G.views[0]) return G.views[0].car.team === win ? t('tg_youWin') : t('tg_youLose');
    return t('tg_win', { t: win ? t('tg_teamO') : t('tg_teamB') });
  }
  function showResults(win) {
    const mvp = G.W.cars.find(c => c.cid === G.mvp);
    const btns = G.online ? TGO.resultButtons() : `<button class="btn" id="bRe">${t('tg_rematch')}</button><button class="btn sec" id="bMenu">${t('tg_menu')}</button>`;
    showOverlay(`<div class="panel wide" data-m3pop>
      <h2>${resultTitle(win)}</h2>
      <div class="row center" style="font-size:34px;font-weight:900"><span style="color:#6fb0ff">${G.score[0]}</span><span style="color:var(--muted);font-size:20px">—</span><span style="color:#ffa24d">${G.score[1]}</span></div>
      ${mvp ? `<p style="color:var(--accent);font-weight:700">${t('tg_mvp', { p: esc(carLabel(mvp)) })}</p>` : ''}
      <div class="tablewrap">${boardTable()}</div>
      <div class="row center">${btns}</div></div>`, 'results');
    const re = $('bRe'), mn = $('bMenu');
    if (re) re.onclick = () => { AU.play('click'); rematch(); };
    if (mn) mn.onclick = () => { AU.play('click'); toMenu(); };
    if (G.online && TGO.bindResult) TGO.bindResult();
  }
  function rematch() { const cfg = G.cfg; hideOverlay(); newMatch(cfg); }
  function boardTable() {
    const W = G.W; if (!W) return '';
    const rows = W.cars.slice().sort((a, b) => a.team - b.team || b.st.score - a.st.score);
    const me = new Set(G.views.map(v => v.car.cid));
    return `<table><tr><th style="text-align:start">${t('tg_cName')}</th><th>${t('tg_cScore')}</th><th>${t('tg_cGoals')}</th><th>${t('tg_cAssists')}</th><th>${t('tg_cSaves')}</th><th>${t('tg_cShots')}</th><th>${t('tg_cDemos')}</th></tr>
      ${rows.map(c => `<tr class="t${c.team}${me.has(c.cid) ? ' me' : ''}${G.phase === 'over' && G.mvp === c.cid ? ' mvp' : ''}"><td class="nm">${esc(carLabel(c))}</td><td>${c.st.score}</td><td>${c.st.goals}</td><td>${c.st.assists}</td><td>${c.st.saves}</td><td>${c.st.shots}</td><td>${c.st.demos}</td></tr>`).join('')}</table>`;
  }

  // ------------------------------------------------------------------ input
  const KEYS = new Set(), MB = { l: false, r: false };
  const GAME_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Slash', 'Quote']);
  addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (G.W && G.views.length && GAME_KEYS.has(e.code)) e.preventDefault();
    KEYS.add(e.code);
    if ((e.code === 'Escape' || e.code === 'KeyP') && G.views.length && G.phase !== 'over') { e.preventDefault(); togglePause(); }
    if (e.code === 'Tab' && G.views.length) $('board').hidden = false;
    if ((e.code === 'Space' || e.code === 'Enter') && G.phase === 'replay' && (!G.online || G.auth)) { if (G.online && TGO.skipReplay) TGO.skipReplay(); else skipReplay(); }
    if (G.views.length) {
      if (e.code === 'KeyC') toggleCam(0);
      if (G.views.length > 1 && (e.code === 'Slash' || e.code === 'Numpad3')) toggleCam(1);
    }
  });
  addEventListener('keyup', (e) => { KEYS.delete(e.code); if (e.code === 'Tab') $('board').hidden = true; });
  addEventListener('blur', () => { KEYS.clear(); MB.l = MB.r = false; });
  canvas.addEventListener('mousedown', (e) => { if (e.button === 0) MB.l = true; if (e.button === 2) MB.r = true; });
  addEventListener('mouseup', (e) => { if (e.button === 0) MB.l = false; if (e.button === 2) MB.r = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  function toggleCam(i) { const v = G.views[i]; if (v) { v.ballCam = !v.ballCam; AU.play('click'); } }
  const k = (...codes) => codes.some(c => KEYS.has(c)) ? 1 : 0;
  function pads() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected); } catch (e) { return []; } }
  let padSeen = false;
  addEventListener('gamepadconnected', () => { padSeen = true; if (G.screen === 'split') renderMenu('split'); });
  addEventListener('gamepaddisconnected', () => { if (G.screen === 'split') renderMenu('split'); });
  function padFor(slot) {
    const ps = pads(); if (!ps.length) return null;
    if (G.views.length > 1) return slot === 1 ? ps[0] : ps[1] || null;
    return slot === 0 ? ps[0] : null;
  }
  const dz = (v) => Math.abs(v) < 0.16 ? 0 : (v - Math.sign(v) * 0.16) / 0.84;
  const btn = (p, i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5));
  const TOUCH = { x: 0, y: 0, jump: false, boost: false, slide: false, cam: false };
  function readSlot(slot) {
    const split = G.views.length > 1, o = { thr: 0, steer: 0, pitch: 0, roll: 0, jump: false, boost: false, slide: false, cam: false, pause: false, board: false };
    if (slot === 0) {
      const up = k('KeyW') || (!split && k('ArrowUp')), dn = k('KeyS') || (!split && k('ArrowDown'));
      const lf = k('KeyA') || (!split && k('ArrowLeft')), rt = k('KeyD') || (!split && k('ArrowRight'));
      o.thr = up - dn; o.pitch = up - dn; o.steer = rt - lf;
      o.jump = !!(k('Space') || MB.r); o.boost = !!(k('ShiftLeft') || (!split && k('ShiftRight')) || MB.l);
      o.slide = !!(k('ControlLeft', 'KeyQ') || (!split && k('ControlRight')));
      if (touchMode) {
        if (TOUCH.x || TOUCH.y) { o.steer = clamp(TOUCH.x * 1.3, -1, 1); o.thr = clamp(-TOUCH.y * 1.5, -1, 1); o.pitch = clamp(-TOUCH.y * 1.3, -1, 1); }
        o.jump = o.jump || TOUCH.jump; o.boost = o.boost || TOUCH.boost; o.slide = o.slide || TOUCH.slide;
        if (TOUCH.boost && !TOUCH.x && !TOUCH.y) o.thr = Math.max(o.thr, 0);
      }
    } else {
      const up = k('ArrowUp'), dn = k('ArrowDown'), lf = k('ArrowLeft'), rt = k('ArrowRight');
      o.thr = up - dn; o.pitch = up - dn; o.steer = rt - lf;
      o.jump = !!k('Enter', 'NumpadEnter', 'Numpad0'); o.boost = !!k('ShiftRight', 'Numpad1'); o.slide = !!k('ControlRight', 'Period', 'Numpad2');
    }
    const p = padFor(slot);
    if (p) {
      const sx = dz(p.axes[0] || 0), sy = dz(p.axes[1] || 0);
      const rtv = p.buttons[7] ? p.buttons[7].value : 0, ltv = p.buttons[6] ? p.buttons[6].value : 0;
      if (sx) o.steer = sx; if (sy) o.pitch = -sy;
      if (rtv > 0.05 || ltv > 0.05) o.thr = rtv - ltv;
      o.jump = o.jump || btn(p, 0); o.boost = o.boost || btn(p, 1); o.slide = o.slide || btn(p, 2);
      if (btn(p, 4)) o.roll = -1; if (btn(p, 5)) o.roll = 1;
      o.cam = btn(p, 3); o.pause = btn(p, 9); o.board = btn(p, 8);
    }
    return o;
  }
  function applyInput(v) {
    const c = v.car, I = c.inp;
    if (G.paused || G.phase === 'over' || G.overlay === 'pause') { I.thr = I.steer = I.pitch = I.roll = 0; I.jump = I.boost = I.slide = false; return; }
    const o = v.lastRead || readSlot(v.slot);
    I.thr = o.thr; I.steer = o.steer; I.pitch = o.pitch; I.roll = o.roll; I.jump = o.jump; I.boost = o.boost; I.slide = o.slide;
  }
  function pollInput() {
    for (const v of G.views) {
      const o = readSlot(v.slot); v.lastRead = o;
      if (o.cam && !v.inp.cam) toggleCam(v.slot);
      if (o.pause && !v.inp.pause && G.phase !== 'over') togglePause();
      if (o.board !== v.inp.board) $('board').hidden = !o.board;
      v.inp.cam = o.cam; v.inp.pause = o.pause; v.inp.board = o.board;
    }
    if (touchMode && TOUCH.cam && !TOUCH.camPrev) toggleCam(0);
    TOUCH.camPrev = TOUCH.cam;
  }
  // touch: a floating joystick on the left half + buttons
  (function touchControls() {
    const zone = $('tzone'), stick = $('tstick'), knob = $('tknob');
    let id = null, ox = 0, oy = 0;
    const home = () => { stick.style.left = ''; stick.style.top = ''; stick.style.bottom = ''; knob.style.transform = ''; };
    zone.addEventListener('pointerdown', (e) => {
      if (id !== null) return; id = e.pointerId; zone.setPointerCapture(id);
      const r = zone.getBoundingClientRect(); ox = e.clientX; oy = e.clientY;
      stick.style.left = (e.clientX - r.left - 65) + 'px'; stick.style.top = (e.clientY - r.top - 65) + 'px'; stick.style.bottom = 'auto';
      e.preventDefault();
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy), m = 55;
      if (l > m) { dx *= m / l; dy *= m / l; }
      TOUCH.x = dx / m; TOUCH.y = dy / m; knob.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    const up = (e) => { if (e.pointerId !== id) return; id = null; TOUCH.x = TOUCH.y = 0; home(); };
    zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
    document.querySelectorAll('#touch .tb').forEach(b => {
      const key = b.dataset.k;
      const on = (e) => { e.preventDefault(); TOUCH[key] = true; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (er) {} };
      const off = () => { TOUCH[key] = false; b.classList.remove('held'); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
    });
  })();

  // ------------------------------------------------------------------ cameras
  const _cv = new V3(), _cu = new V3(), _cf = new V3(), _cn = new V3();
  function keepInside(p, m) {
    for (let i = 0; i < 3; i++) {
      const f = T.sdf(p.x, p.y, p.z); if (f >= m) return;
      T.normalAt(p.x, p.y, p.z, _cn); p.addScaledVector(_cn, m - f);
    }
  }
  function updateCam(v, dt) {
    const c = v.car, cam = v.cam, W = G.W, bp = W.ball.rp;
    const pos = c.rp;
    if (c.dead) {
      _cv.copy(bp).sub(v.pos); _cv.y = 0; if (_cv.lengthSq() < 1) _cv.set(0, 0, 1); _cv.normalize();
      const want = new V3().copy(v.pos).lerp(new V3(bp.x, 0, bp.z).addScaledVector(_cv, -28).setY(14), 1 - Math.exp(-dt * 1.5));
      keepInside(want, 1.5); v.pos.copy(want); v.look.lerp(bp, 1 - Math.exp(-dt * 5));
      cam.position.copy(v.pos); cam.up.set(0, 1, 0); cam.lookAt(v.look); return;
    }
    const fwd = _cf.set(0, 0, 1).applyQuaternion(c.rq);
    let dir = _cv;
    if (v.ballCam && ballMesh.g.visible) {
      dir.copy(bp).sub(pos); const l = dir.length();
      if (l < 0.5) dir.copy(fwd); else { dir.multiplyScalar(1 / l); dir.y = clamp(dir.y, -0.25, 0.42); dir.normalize(); }
    } else if (c.grounded) dir.copy(fwd);
    else {
      const sp = c.vel.length();
      if (sp > 8) { dir.copy(c.vel).multiplyScalar(1 / sp); dir.y *= 0.5; dir.normalize(); } else dir.copy(fwd);
      dir.y = clamp(dir.y, -0.5, 0.6); dir.normalize();
    }
    const up = _cu.set(0, 1, 0);
    if (c.grounded && !v.ballCam) up.lerp(c.n, 0.65).normalize();
    v.dirS.lerp(dir, 1 - Math.exp(-dt * (v.ballCam ? 8 : 6))).normalize();
    v.upS.lerp(up, 1 - Math.exp(-dt * 4)).normalize();
    const dist = SET.dist, h = SET.height;
    const want = new V3().copy(pos).addScaledVector(v.dirS, -dist).addScaledVector(v.upS, h);
    keepInside(want, 1.2);
    v.pos.copy(want);
    if (v.ballCam && ballMesh.g.visible) {
      v.look.copy(bp);
      const hd = Math.hypot(bp.x - want.x, bp.z - want.z), maxY = want.y + hd * 0.75 + 2;
      if (v.look.y > maxY) v.look.y = maxY;
      v.look.lerp(_cf.copy(pos).addScaledVector(v.upS, 1.2), 0.25);
    } else v.look.copy(pos).addScaledVector(v.upS, 1.3).addScaledVector(v.dirS, 4);
    cam.position.copy(v.pos);
    if (v.shake > 0 && SET.shake) {
      const s = v.shake * 0.9; cam.position.x += (Math.random() - 0.5) * s; cam.position.y += (Math.random() - 0.5) * s; cam.position.z += (Math.random() - 0.5) * s;
    }
    v.shake = Math.max(0, v.shake - dt * 1.6);
    cam.up.copy(v.upS); cam.lookAt(v.look);
    const sup = c.sup ? 5 : 0;
    cam.userData.fovT = SET.fov + sup;
  }
  function setFov(cam, aspect) {
    const want = cam.userData.fovT || SET.fov;
    // keep at least ~74° horizontally on tall screens
    const minV = 2 * Math.atan(Math.tan((74 * Math.PI / 180) / 2) / aspect) * 180 / Math.PI;
    const f = clamp(Math.max(want * (aspect < 1.2 ? 0.9 : 1), minV), 50, 108);
    cam.fov += (f - cam.fov) * 0.15; cam.aspect = aspect; cam.updateProjectionMatrix();
  }

  // ------------------------------------------------------------------ HUD
  function buildHud() {
    const split = G.views.length > 1;
    ['pv0', 'pv1'].forEach((id, i) => {
      const el = $(id), v = G.views[i];
      el.hidden = !v; if (!v) { el.innerHTML = ''; return; }
      el.innerHTML = `<div class="boost"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42" stroke-dasharray="198 264"/><circle class="fg" cx="50" cy="50" r="42" stroke-dasharray="0 264"/></svg><b>0</b></div>
        <div class="cam" hidden>📷 ${t('tg_ballCam')}</div><div class="sup">${t('tg_super')}</div>${split ? `<div class="tagme" style="color:${v.car.team ? '#ffc08a' : '#8fc0ff'}">${esc(v.car.name)}</div>` : ''}
        <div class="dead" hidden></div><div class="barrow" hidden></div>`;
      v.el = { root: el, fg: el.querySelector('.fg'), num: el.querySelector('.boost b'), box: el.querySelector('.boost'), cam: el.querySelector('.cam'), sup: el.querySelector('.sup'), dead: el.querySelector('.dead'), arrow: el.querySelector('.barrow'), lastB: -1 };
    });
    $('split').hidden = !split;
    $('tags').innerHTML = '';
    G.tagEls = G.views.map(() => new Map());
    G.views.forEach((v, vi) => {
      for (const c of G.W.cars) {
        if (c === v.car) continue;
        const d = document.createElement('div'); d.className = 'tag t' + c.team; d.textContent = carLabel(c); $('tags').appendChild(d); G.tagEls[vi].set(c.cid, d);
      }
    });
    if (!G.views.length) { G.tagEls = [new Map()]; for (const c of G.W.cars) { const d = document.createElement('div'); d.className = 'tag t' + c.team; d.textContent = carLabel(c); $('tags').appendChild(d); G.tagEls[0].set(c.cid, d); } }
    updateScore();
    $('hbtn').hidden = !G.views.length;
  }
  function layoutHud() {
    const split = G.views.length > 1;
    const p0 = $('pv0'), p1 = $('pv1');
    if (split) { p0.style.top = '0'; p0.style.height = '50%'; p1.style.top = '50%'; p1.style.height = '50%'; }
    else { p0.style.top = '0'; p0.style.height = '100%'; }
  }
  function updateScore() { $('s0').textContent = G.score[0]; $('s1').textContent = G.score[1]; G.clkTxt = ''; }
  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  let bannerTm = 0;
  function banner(txt, sub, cls, secs) {
    const b = $('banner'); b.className = 'on ' + (cls || '');
    b.innerHTML = txt + (sub ? `<small>${sub}</small>` : '');
    clearTimeout(bannerTm); bannerTm = setTimeout(() => { b.className = cls || ''; }, (secs || 1.5) * 1000);
  }
  function feed(html) {
    const f = $('feed'), d = document.createElement('div'); d.innerHTML = html; f.appendChild(d);
    while (f.children.length > 5) f.removeChild(f.firstChild);
    setTimeout(() => d.remove(), 5000);
  }
  let toastTm = 0;
  function toast(msg) { const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTm); toastTm = setTimeout(() => { el.hidden = true; }, 2800); }
  const _pv = new V3();
  function hudFrame(dt) {
    const W = G.W; if (!W) return;
    const ct = G.ot ? '+' + fmt(G.clock) : fmt(G.clock);
    if (ct !== G.clkTxt) { G.clkTxt = ct; const el = $('clk'); el.textContent = ct; el.classList.toggle('ot', G.ot); el.classList.toggle('low', !G.ot && G.clock <= 30); }
    const split = G.views.length > 1;
    G.views.forEach((v, vi) => {
      const e = v.el; if (!e) return;
      const b = Math.round(v.car.boost);
      if (b !== e.lastB) { e.lastB = b; e.num.textContent = b; e.fg.setAttribute('stroke-dasharray', (b / 100 * 198).toFixed(1) + ' 264'); e.box.classList.toggle('full', b >= 100); e.box.classList.toggle('empty', b <= 0); }
      e.cam.hidden = !v.ballCam;
      e.sup.classList.toggle('on', !!v.car.sup && !v.car.dead);
      e.dead.hidden = !v.car.dead || G.phase === 'replay';
      if (v.car.dead) e.dead.textContent = t('tg_demoed', { n: Math.max(1, Math.ceil(v.car.demoT)) });
      // ball arrow when the ball is off screen
      const vp = viewRect(vi, split);
      _pv.copy(W.ball.rp).project(v.cam);
      const behind = _pv.z > 1;
      const off = behind || Math.abs(_pv.x) > 1 || Math.abs(_pv.y) > 1;
      e.arrow.hidden = !off || !ballMesh.g.visible || G.phase === 'replay';
      if (off) {
        let x = _pv.x, y = _pv.y; if (behind) { x = -x; y = -y; }
        const a = Math.atan2(x, y), m = Math.max(Math.abs(x), Math.abs(y)) || 1; x /= m; y /= m;
        e.arrow.style.left = (vp.w * (0.5 + x * 0.45)) + 'px'; e.arrow.style.top = (vp.h * (0.5 - y * 0.42)) + 'px';
        e.arrow.style.transform = `rotate(${a}rad)`;
      }
    });
    // name tags
    const vcount = Math.max(1, G.views.length);
    for (let vi = 0; vi < vcount; vi++) {
      const cam = G.views[vi] ? G.views[vi].cam : cams[0], vp = viewRect(vi, split), tags = G.tagEls && G.tagEls[vi]; if (!tags) continue;
      for (const c of W.cars) {
        const el = tags.get(c.cid); if (!el) continue;
        const dead = G.phase === 'replay' ? c.rpDead : c.dead;
        _pv.copy(c.rp); _pv.y += 1.9; _pv.project(cam);
        const vis = !dead && _pv.z < 1 && Math.abs(_pv.x) < 1.05 && Math.abs(_pv.y) < 1.05 && G.phase !== 'replay' && G.mode !== 'attract';
        if (!vis) { if (el.style.display !== 'none') el.style.display = 'none'; continue; }
        el.style.display = '';
        el.style.left = (vp.x + (0.5 + _pv.x / 2) * vp.w) + 'px'; el.style.top = (vp.y + (0.5 - _pv.y / 2) * vp.h) + 'px';
        const d = cam.position.distanceTo(c.rp); el.style.opacity = d > 140 ? 0.55 : 1;
      }
    }
    void dt;
  }
  function viewRect(i, split) { return split ? { x: 0, y: i ? VH / 2 : 0, w: VW, h: VH / 2 } : { x: 0, y: 0, w: VW, h: VH }; }

  // ------------------------------------------------------------------ drawing a frame
  const _tail = new V3(), _ofs = new V3();
  function drawWorld(dt) {
    const W = G.W; if (!W) return;
    const alpha = G.phase === 'replay' ? 1 : clamp(G.acc / STEP, 0, 1);
    const decay = Math.exp(-dt * 8);
    for (const c of W.cars) {
      if (G.phase !== 'replay') {
        if (!c.ext) { c.rp.lerpVectors(c.pp, c.pos, alpha); c.rq.slerpQuaternions(c.pq, c.q, alpha); }
        c.off.multiplyScalar(decay); c.rp.add(c.off);
      }
      const m = G.meshes.get(c.cid); if (!m) continue;
      const dead = G.phase === 'replay' ? c.rpDead : c.dead;
      m.g.visible = !dead;
      m.g.position.copy(c.rp); m.g.quaternion.copy(c.rq);
      const boosting = G.phase === 'replay' ? c.rpBoost : c.boosting;
      const was = c.boosting; c.boosting = boosting; RD.updateCarMesh(m, c, dt, G.t); c.boosting = was;
      // boost trail + supersonic streaks
      if (boosting && !dead) {
        _tail.copy(m.tail).applyQuaternion(c.rq).add(c.rp);
        const tc = m.trail;
        for (let i = 0; i < 2; i++) PS.emit(_tail.x + (Math.random() - 0.5) * 0.4, _tail.y + (Math.random() - 0.5) * 0.4, _tail.z + (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3 + 1, (Math.random() - 0.5) * 3, 0.45, 1.3, tc[0], tc[1], tc[2], 2, -2);
      }
      if (c.sup && !dead && G.phase !== 'replay' && Math.random() < 0.6) {
        _ofs.set((Math.random() - 0.5) * 2.4, Math.random() * 0.8 - 0.2, -1.6).applyQuaternion(c.rq).add(c.rp);
        PS.emit(_ofs.x, _ofs.y, _ofs.z, 0, 0, 0, 0.35, 0.5, 0.9, 0.95, 1, 0, 0);
      }
      // blob shadow on the floor
      if (m.shadow) { const h = c.rp.y; m.shadow.visible = !dead && h < 30 && T.sdf(c.rp.x, 0.5, c.rp.z) > 0.3; m.shadow.position.set(c.rp.x, 0.04, c.rp.z); const s = clamp(1.1 - h / 30, 0.25, 1); m.shadow.scale.setScalar(s); m.shadow.material.opacity = s; }
    }
    const b = W.ball;
    if (G.phase !== 'replay') {
      if (!b.ext) { b.rp.lerpVectors(b.pp, b.pos, alpha); b.rq.slerpQuaternions(b.pq, b.q, alpha); }
      b.off.multiplyScalar(decay); b.rp.add(b.off);
    }
    ballMesh.g.position.copy(b.rp); ballMesh.m.quaternion.copy(b.rq);
    ballShadow.visible = ballMesh.g.visible; ballShadow.position.set(b.rp.x, 0.05, b.rp.z);
    const s = clamp(1.25 - b.rp.y / 40, 0.3, 1.2); ballShadow.scale.setScalar(s); ballShadow.material.opacity = clamp(1 - b.rp.y / 45, 0.2, 0.9);
    RD.updatePads(padMeshes, W.pads, G.t);
    if (ring.visible) { G.ringT += dt; ring.scale.setScalar(1 + G.ringT * 70); ring.material.opacity = Math.max(0, 1 - G.ringT / 1.1); ring.lookAt(cams[0].position); if (G.ringT > 1.2) ring.visible = false; }
    PS.update(dt);
  }
  function renderViews(dt) {
    renderer.setViewport(0, 0, VW, VH); renderer.setScissorTest(false); renderer.clear();
    if (G.phase === 'replay' && G.rp && G.views.length) {
      const cam = cams[0]; cam.position.copy(G.rp.cam); cam.up.set(0, 1, 0); cam.lookAt(G.rp.look); cam.userData.fovT = 70; setFov(cam, VW / VH);
      PS.mat.uniforms.scale.value = VH * 0.6 * renderer.getPixelRatio(); renderer.render(scene, cam); return;
    }
    if (G.views.length > 1) {
      renderer.setScissorTest(true);
      G.views.forEach((v, i) => {
        updateCam(v, dt);
        const y = i === 0 ? VH / 2 : 0;
        renderer.setViewport(0, y, VW, VH / 2); renderer.setScissor(0, y, VW, VH / 2);
        setFov(v.cam, VW / (VH / 2)); PS.mat.uniforms.scale.value = VH * 0.3 * renderer.getPixelRatio();
        renderer.render(scene, v.cam);
      });
      renderer.setScissorTest(false);
      return;
    }
    const cam = G.views.length ? G.views[0].cam : cams[0];
    if (G.views.length) updateCam(G.views[0], dt);
    else attractCam(dt);
    setFov(cam, VW / VH); PS.mat.uniforms.scale.value = VH * 0.6 * renderer.getPixelRatio();
    renderer.render(scene, cam);
  }

  // ------------------------------------------------------------------ menu background: bots playing, a slow TV camera
  function startAttract() {
    const cars = [];
    for (let team = 0; team < 2; team++) for (let i = 0; i < 2; i++) cars.push({ cid: (team ? 'o' : 'b') + i, team, kind: 'bot', diff: 'normal', design: (i * 2 + team) % 4, accent: (i + team * 3) % 9, trail: (i + team) % 5, bi: team * 2 + i });
    newMatch({ mode: 'attract', cars, locals: [], len: 99, auth: true });
    $('hud').hidden = true; $('touch').hidden = true; $('menu').hidden = false;
    G.phase = 'play'; G.W.frozen = false; G.W.kick = true;
  }
  const _ac = new V3(), _al = new V3();
  function attractCam(dt) {
    const cam = cams[0];
    if (G.garage) {
      G.attractT += dt * 0.35; const a = G.attractT;
      const want = _ac.set(Math.sin(a) * 9, 3.2, Math.cos(a) * 9);
      cam.position.lerp(want, 1 - Math.exp(-dt * 4)); cam.up.set(0, 1, 0); cam.lookAt(_al.set(0, 1.0, 0)); cam.userData.fovT = 55; return;
    }
    G.attractT += dt * 0.06;
    const W = G.W, b = W ? W.ball.rp : _al.set(0, 0, 0), a = G.attractT;
    const want = _ac.set(Math.sin(a) * 95, 46, Math.cos(a) * 120);
    cam.position.lerp(want, 1 - Math.exp(-dt * 0.8));
    _al.lerp(b, 1 - Math.exp(-dt * 2)); cam.up.set(0, 1, 0); cam.lookAt(_al); cam.userData.fovT = 60;
  }

  // ------------------------------------------------------------------ main loop
  let last = performance.now(), fpsN = 0, fpsT = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now; if (dt > 0.1) dt = 0.1; if (dt < 0) dt = 0;
    G.t += dt;
    fpsN++; fpsT += dt; if (fpsT >= 1) { G.fps = fpsN / fpsT; fpsN = 0; fpsT = 0; if (!$('fps').hidden) $('fps').textContent = G.fps.toFixed(0) + ' fps'; }
    pollInput();
    if (G.W && !G.paused) {
      if (G.phase === 'replay') replayStep(dt);
      else if (G.phase !== 'over' || G.mode === 'attract') {
        G.acc += dt * (G.timeScale || 1); let n = 0;
        while (G.acc >= STEP && n < 10) { simStep(STEP); G.acc -= STEP; n++; }
        if (n >= 10) G.acc = 0;
      }
      if (G.mode === 'attract' && G.phase === 'goal' && G.goalT > 2) { G.phase = 'play'; T.kickoff(G.W); snapBodies(); ballMesh.g.visible = true; G.W.kick = true; }
      if (G.mode === 'attract' && G.W.t > 240) startAttract();
      if (G.online && TGO.frame) TGO.frame(dt);
    }
    if (G.garage) garageFrame(dt);
    drawWorld(dt);
    renderViews(dt);
    if (G.mode !== 'attract') hudFrame(dt);
    if (G.views[0]) AU.engine(G.views[0].car, G.phase === 'play' || G.phase === 'kickoff' || G.phase === 'goal'); else AU.engine(null, false);
  }

  // ------------------------------------------------------------------ overlays and pause
  function showOverlay(html, kind) { const o = $('ov'); o.innerHTML = html; o.hidden = false; G.overlay = kind; if (window.Mal3abPopButtons) Mal3abPopButtons(); }
  function hideOverlay() { $('ov').hidden = true; $('ov').innerHTML = ''; G.overlay = null; }
  function togglePause() {
    if (!G.W || !G.views.length) return;
    if (G.overlay === 'pause') { resume(); return; }
    if (G.overlay) return;
    if (!G.online) G.paused = true;
    renderPause();
  }
  function renderPause() {
    showOverlay(`<div class="panel" data-m3pop><h2>${t('tg_paused')}</h2>
      <button class="btn" id="pRes">${t('tg_resume')}</button>
      ${G.online ? '' : `<button class="btn sec" id="pRst">${t('tg_restart')}</button>`}
      <button class="btn sec" id="pSet">${t('tg_settings')}</button><button class="btn sec" id="pHow">${t('tg_how')}</button>
      <button class="btn sec" id="pLv">${t('tg_leave')}</button>
      <div class="row center">${langBtn()}</div></div>`, 'pause');
    $('pRes').onclick = resume;
    if ($('pRst')) $('pRst').onclick = () => { hideOverlay(); G.paused = false; newMatch(G.cfg); };
    $('pSet').onclick = () => renderSettings(true);
    $('pHow').onclick = () => renderHow(true);
    $('pLv').onclick = () => {
      showOverlay(`<div class="panel" data-m3pop><h2>${t('tg_leaveQ')}</h2><div class="row center"><button class="btn" id="lY">${t('tg_yes')}</button><button class="btn sec" id="lN">${t('tg_no')}</button></div></div>`, 'pause');
      $('lY').onclick = () => { if (G.online && TGO.leave) TGO.leave(); toMenu(); };
      $('lN').onclick = renderPause;
    };
    bindLang();
  }
  function resume() { hideOverlay(); G.paused = false; last = performance.now(); }
  $('bPause').onclick = () => togglePause();
  $('bBoard').onclick = () => { const b = $('board'); b.hidden = !b.hidden; if (!b.hidden) renderBoard(); };
  $('bSkip').onclick = () => { if (G.online && TGO.skipReplay) TGO.skipReplay(); else skipReplay(); };
  setInterval(() => { if (!$('board').hidden) renderBoard(); }, 500);
  function renderBoard() { $('board').innerHTML = `<div class="panel wide"><h2>${t('tg_board')}</h2><div class="tablewrap">${boardTable()}</div></div>`; }
  document.addEventListener('keydown', (e) => { if (e.code === 'Tab' && G.views.length) renderBoard(); });

  // ------------------------------------------------------------------ menus
  const langBtn = () => `<button class="btn small sec" data-lang>${getLang() === 'ar' ? 'English' : 'العربية'}</button>`;
  function bindLang() { document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { AU.play('click'); setLang(getLang() === 'ar' ? 'en' : 'ar'); }); }
  const seg = (name, opts, cur, cls) => `<div class="seg" data-seg="${name}">${opts.map(([v, l, c]) => `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''} ${c || cls || ''}">${l}</button>`).join('')}</div>`;
  function bindSeg(root, cb) { root.querySelectorAll('[data-seg]').forEach(s => s.querySelectorAll('button').forEach(b => b.onclick = () => { AU.play('click'); s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); cb(s.dataset.seg, b.dataset.v); })); }
  const lenOpts = () => [2, 3, 5, 7, 10].map(n => [n, n === 2 ? t('tg_min2') : t('tg_minN', { n })]);
  const tipKeys = ['tg_tip1', 'tg_tip2', 'tg_tip3', 'tg_tip4', 'tg_tip5'];
  function head() {
    return `<div class="head"><div><div class="logo">${getLang() === 'ar' ? `<span class="a">توربو</span> <span class="b">جول</span>` : `<span class="a">TURBO</span> <span class="b">GOAL</span>`}</div><div class="sub">${t('tg_sub')}</div></div><div class="sp"></div>
      <button class="btn small sec" data-mal3ab-home title="Home">🏠</button><button class="btn small sec" data-mal3ab-chat title="Chat">💬</button>${langBtn()}</div>`;
  }
  function renderMenu(screen) {
    G.screen = screen || 'main';
    const m = $('menu'); m.hidden = false; $('garage').hidden = true; G.garage = null;
    if (G.mode !== 'attract') startAttract();
    showGarageCar(false);
    if (G.screen === 'main') {
      m.innerHTML = `<div class="wrap">${head()}
        <div class="cards">
          <div class="card"><div class="ic">🤖</div><h2>${t('tg_bots')}</h2><p>${t('tg_botsD')}</p><button class="btn" data-go="bots">${t('tg_play')}</button></div>
          <div class="card"><div class="ic">🎮</div><h2>${t('tg_split')}</h2><p>${t('tg_splitD')}${touchMode ? `<br><b style="color:var(--accent)">${t('tg_splitTouch')}</b>` : ''}</p><button class="btn" data-go="split" ${touchMode ? 'disabled' : ''}>${t('tg_play')}</button></div>
          <div class="card"><div class="ic">🌐</div><h2>${t('tg_online')}</h2><p>${t('tg_onlineD')}</p><button class="btn" data-go="online">${t('tg_play')}</button></div>
          <div class="card"><div class="ic">🔧</div><h2>${t('tg_garage')}</h2><p>${t('tg_garageD')}</p><button class="btn sec" data-go="garage">${t('tg_garage')}</button></div>
        </div>
        <div class="row center"><button class="btn sec" data-go="how">📖 ${t('tg_how')}</button><button class="btn sec" data-go="stats">📊 ${t('tg_stats')}</button><button class="btn sec" data-go="settings">⚙️ ${t('tg_settings')}</button></div>
        <div class="help">💡 ${t(tipKeys[Math.floor(Date.now() / 9000) % tipKeys.length])}</div></div>`;
    } else if (G.screen === 'bots') {
      m.innerHTML = `<div class="panel" data-m3pop><h2>🤖 ${t('tg_bots')}</h2>
        <div class="lbl">${t('tg_mode')}</div>${seg('size', [[1, '1v1'], [2, '2v2'], [3, '3v3']], MENU.size)}
        <div class="lbl">${t('tg_diff')}</div>${seg('diff', [['easy', t('tg_easy')], ['normal', t('tg_normal')], ['hard', t('tg_hard')]], MENU.diff)}
        <div class="lbl">${t('tg_len')}</div>${seg('len', lenOpts(), MENU.len)}
        <div class="lbl">${t('tg_team')}</div>${seg('team', [[0, t('tg_blue'), 'blue'], [1, t('tg_orange'), 'orange']], MENU.team)}
        <button class="btn" id="mGo">${t('tg_start')}</button><button class="btn sec" data-go="main">${t('tg_back')}</button></div>`;
      bindSeg(m, (k, v) => { MENU[k] = k === 'diff' ? v : +v; LS.set('menu', MENU); });
      $('mGo').onclick = () => { AU.play('click'); startBots(); };
    } else if (G.screen === 'split') {
      const ps = pads();
      m.innerHTML = `<div class="panel" data-m3pop><h2>🎮 ${t('tg_split')}</h2>
        <div class="lbl">${t('tg_pName', { n: 1 })} <span style="color:#8fc0ff">●</span></div><input id="n1" maxlength="14" value="${esc(NAMES[0] || '')}" placeholder="${t('tg_pN', { n: 1 })}">
        <div class="lbl">${t('tg_pName', { n: 2 })} <span style="color:#ffc08a">●</span></div><input id="n2" maxlength="14" value="${esc(NAMES[1] || '')}" placeholder="${t('tg_pN', { n: 2 })}">
        <div class="lbl">${t('tg_sType')}</div>${seg('smode', [['1v1', t('tg_s1v1')], ['2v2', t('tg_s2v2')], ['coop', t('tg_sCoop')]], MENU.smode)}
        <div class="lbl">${t('tg_len')}</div>${seg('slen', lenOpts(), MENU.slen)}
        <p style="font-size:13px">${t('tg_p1keys')}</p><p style="font-size:13px">${t('tg_p2keys')}</p>
        <p style="font-size:13px;color:${ps.length ? 'var(--ok)' : 'var(--muted)'}">${ps.length ? t('tg_padOn') : t('tg_padOff')}</p>
        <div class="msg" id="sMsg"></div>
        <button class="btn" id="sGo">${t('tg_start')}</button><button class="btn sec" data-go="main">${t('tg_back')}</button></div>`;
      bindSeg(m, (k, v) => { MENU[k] = k === 'slen' ? +v : v; LS.set('menu', MENU); });
      $('sGo').onclick = () => {
        const a = $('n1').value.trim().slice(0, 14), b = $('n2').value.trim().slice(0, 14);
        if (!a || !b) { $('sMsg').textContent = t('tg_needNames'); return; }
        if (a.toLowerCase() === b.toLowerCase()) { $('sMsg').textContent = t('tg_sameNames'); return; }
        NAMES = [a, b]; LS.set('names', NAMES); AU.play('click'); startSplit(a, b);
      };
    } else if (G.screen === 'online') {
      TGO.renderMenu(m);
    } else if (G.screen === 'garage') {
      renderGarage();
      m.hidden = true;
    } else if (G.screen === 'how') renderHow(false);
    else if (G.screen === 'stats') renderStats();
    else if (G.screen === 'settings') renderSettings(false);
    m.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { AU.play('click'); renderMenu(b.dataset.go); });
    m.querySelectorAll('[data-mal3ab-home]').forEach(h => { if (!h.onclick) h.onclick = () => location.href = '../../play.html'; });
    bindLang();
    if (window.Mal3abPopButtons) Mal3abPopButtons();
    m.scrollTop = 0;
  }
  function renderHow(inGame) {
    const html = `<div class="panel wide" data-m3pop><h2>📖 ${t('tg_how')}</h2><div class="keys">
      <h4>${t('tg_kDrive')}</h4><b>W / S</b><span>${t('tg_kWS')}</span><b>A / D</b><span>${t('tg_kAD')}</span><b>Space · 🖱️R</b><span>${t('tg_kSpace')}</span>
      <b>Shift · 🖱️L</b><span>${t('tg_kShift')}</span><b>Ctrl / Q</b><span>${t('tg_kCtrl')}</span><b>C</b><span>${t('tg_kC')}</span><b>Tab</b><span>${t('tg_kTab')}</span><b>Esc / P</b><span>${t('tg_kEsc')}</span>
      <h4>${t('tg_kPad')}</h4><span style="grid-column:1/-1">${t('tg_kPadL')}</span>
      <h4>${t('tg_kTouch')}</h4><span style="grid-column:1/-1">${t('tg_kTouchL')}</span>
      <h4>${t('tg_kRules')}</h4><span style="grid-column:1/-1">${t('tg_kRulesL')}</span>
      <h4>${t('tg_kTips')}</h4><span style="grid-column:1/-1">• ${tipKeys.map(k => t(k)).join('<br>• ')}</span>
      </div><button class="btn" id="hBack">${inGame ? t('tg_back') : t('tg_back')}</button></div>`;
    if (inGame) { showOverlay(html, 'pause'); $('hBack').onclick = renderPause; }
    else { $('menu').innerHTML = html; $('hBack').onclick = () => renderMenu('main'); }
  }
  function renderStats() {
    const S = STATS, it = (k, v) => `<div class="stat"><b>${v}</b><span>${t(k)}</span></div>`;
    $('menu').innerHTML = `<div class="panel wide" data-m3pop><h2>📊 ${t('tg_stats')}</h2><div class="stats">
      ${it('tg_sPlayed', S.played)}${it('tg_sWins', S.wins)}${it('tg_sLosses', S.losses)}${it('tg_sBotWins', S.botWins)}${it('tg_sGoals', S.goals)}${it('tg_sAssists', S.assists)}
      ${it('tg_sSaves', S.saves)}${it('tg_sShots', S.shots)}${it('tg_sDemos', S.demos)}${it('tg_sMvps', S.mvps)}${it('tg_sStreak', S.bestStreak)}${it('tg_sBest', S.bestScore)}${it('tg_sOnline', S.online)}
      </div><p style="font-size:13px">${t('tg_statsNote')}</p>
      <div class="row center"><button class="btn sec small" id="stReset">${t('tg_reset')}</button></div><button class="btn" id="stBack">${t('tg_back')}</button></div>`;
    $('stBack').onclick = () => renderMenu('main');
    $('stReset').onclick = () => { if (confirm(t('tg_resetQ'))) { const bw = STATS.botWins; STATS = Object.assign({}, DEF_STATS, { botWins: bw }); LS.set('stats', STATS); renderStats(); } };
  }
  function renderSettings(inGame) {
    const html = `<div class="panel" data-m3pop><h2>⚙️ ${t('tg_settings')}</h2>
      <div class="lbl">${t('tg_fov')}: <b id="vFov">${SET.fov}°</b></div><input type="range" id="sFov" min="60" max="100" value="${SET.fov}">
      <div class="lbl">${t('tg_dist')}</div><input type="range" id="sDist" min="6" max="15" step="0.5" value="${SET.dist}">
      <div class="lbl">${t('tg_height')}</div><input type="range" id="sH" min="1.5" max="7" step="0.25" value="${SET.height}">
      <div class="lbl">${t('tg_vol')}</div><input type="range" id="sVol" min="0" max="1" step="0.05" value="${SET.vol}">
      <div class="lbl">${t('tg_bcDef')}</div>${seg('ballCam', [[1, t('tg_on')], [0, t('tg_off')]], SET.ballCam ? 1 : 0)}
      <div class="lbl">${t('tg_replays')}</div>${seg('replays', [[1, t('tg_on')], [0, t('tg_off')]], SET.replays ? 1 : 0)}
      <div class="lbl">${t('tg_shake')}</div>${seg('shake', [[1, t('tg_on')], [0, t('tg_off')]], SET.shake ? 1 : 0)}
      <div class="lbl">${t('tg_quality')}</div>${seg('quality', [['low', t('tg_qLow')], ['high', t('tg_qHigh')]], SET.quality)}
      <button class="btn" id="setDone">${t('tg_done')}</button></div>`;
    const root = inGame ? (showOverlay(html, 'pause'), $('ov')) : ($('menu').innerHTML = html, $('menu'));
    const save = () => LS.set('settings', SET);
    $('sFov').oninput = (e) => { SET.fov = +e.target.value; $('vFov').textContent = SET.fov + '°'; save(); };
    $('sDist').oninput = (e) => { SET.dist = +e.target.value; save(); };
    $('sH').oninput = (e) => { SET.height = +e.target.value; save(); };
    $('sVol').oninput = (e) => { AU.vol(+e.target.value); save(); };
    bindSeg(root, (k, v) => { SET[k] = k === 'quality' ? v : v === '1'; save(); if (k === 'quality') resize(); });
    $('setDone').onclick = () => { AU.play('click'); if (inGame) renderPause(); else renderMenu('main'); };
  }
  // garage: the car on a turntable in the middle of the field
  function showGarageCar(on) {
    if (G.gcar) { scene.remove(G.gcar.g); G.gcar = null; }
    if (!G.W) return;
    for (const m of G.meshes.values()) m.g.visible = !on;
    ballMesh.g.visible = !on;
    if (on) { G.gcar = RD.makeCarMesh({ design: GAR.design, accent: GAR.accent, trail: GAR.trail, team: G.gTeam | 0 }); G.gcar.g.position.set(0, C.RIDE, 0); scene.add(G.gcar.g); }
  }
  function garageFrame(dt) {
    if (!G.gcar) return;
    G.gcar.g.rotation.y += dt * 0.4;
    for (const m of G.meshes.values()) { m.g.visible = false; if (m.shadow) m.shadow.visible = false; }
    ballMesh.g.visible = false; ballShadow.visible = false;
    const fl = G.gcar.flame; fl.visible = G.gcar.flameIn.visible = (G.t % 3) < 1.2;
  }
  function renderGarage() {
    G.garage = true; G.paused = true; showGarageCar(true);
    const g = $('garage'); g.hidden = false;
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const tc = (c) => `rgb(${c.map(x => Math.round(x * 255)).join(',')})`;
    g.innerHTML = `<div class="panel" data-m3pop><h2>🔧 ${t('tg_garage')}</h2>
      <div class="lbl">${t('tg_body')}</div>${seg('design', [0, 1, 2, 3].map(i => [i, t('tg_d' + i)]), GAR.design)}
      <div class="lbl">${t('tg_accent')}</div><div class="swatches">${RD.ACCENTS.map((c, i) => `<button class="sw ${i === GAR.accent ? 'on' : ''}" data-acc="${i}" style="background:${hex(c)}"></button>`).join('')}</div>
      <div class="lbl">${t('tg_trail')}</div>${seg('trail', RD.TRAILS.map((c, i) => [i, `<span style="color:${tc(c)}">●</span> ${t('tg_tr' + i)}`]), GAR.trail)}
      <p style="font-size:12px">${t('tg_teamCol')}</p>
      <div class="row center"><button class="btn small sec" id="gTeam">${t('tg_seeTeam')}</button></div>
      <button class="btn" id="gDone">${t('tg_done')}</button></div>`;
    bindSeg(g, (k, v) => { GAR[k] = +v; LS.set('garage', GAR); showGarageCar(true); });
    g.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => { AU.play('click'); GAR.accent = +b.dataset.acc; LS.set('garage', GAR); g.querySelectorAll('[data-acc]').forEach(x => x.classList.toggle('on', x === b)); showGarageCar(true); });
    $('gTeam').onclick = () => { G.gTeam = G.gTeam ? 0 : 1; showGarageCar(true); };
    $('gDone').onclick = () => { AU.play('click'); G.garage = null; G.paused = false; showGarageCar(false); renderMenu('main'); };
    if (window.Mal3abPopButtons) Mal3abPopButtons();
  }

  // ------------------------------------------------------------------ starting matches
  function botCars(team, n, diff, startIdx) {
    const out = [];
    for (let i = 0; i < n; i++) { const bi = startIdx + i; out.push({ team, kind: 'bot', diff, design: bi % 4, accent: (bi * 4 + 2) % 9, trail: (bi * 3) % 5, bi }); }
    return out;
  }
  function withIds(list) { const n = [0, 0]; return list.map(o => Object.assign(o, { cid: o.cid || (o.team ? 'o' : 'b') + (n[o.team]++) })); }
  function startBots() {
    const size = MENU.size, team = MENU.team, diff = MENU.diff, bi0 = Math.floor(Math.random() * 10);
    const me = { team, kind: 'human', name: myName(), design: GAR.design, accent: GAR.accent, trail: GAR.trail };
    const list = [me].concat(botCars(team, size - 1, diff, bi0), botCars(1 - team, size, diff, bi0 + size));
    withIds(list);
    newMatch({ mode: 'bots', size, diff, len: MENU.len, cars: list, locals: [me.cid], auth: true });
  }
  function startSplit(a, b) {
    const sm = MENU.smode, bi0 = Math.floor(Math.random() * 10);
    const p1 = { team: 0, kind: 'human', name: a, design: GAR.design, accent: GAR.accent, trail: GAR.trail };
    const p2 = { team: sm === 'coop' ? 0 : 1, kind: 'human', name: b, design: (GAR.design + 1) % 4, accent: (GAR.accent + 3) % 9, trail: (GAR.trail + 1) % 5 };
    let list = [p1, p2];
    if (sm === '2v2') list = list.concat(botCars(0, 1, 'normal', bi0), botCars(1, 1, 'normal', bi0 + 1));
    if (sm === 'coop') list = list.concat(botCars(1, 2, 'normal', bi0));
    withIds(list);
    newMatch({ mode: 'split', size: sm === '1v1' ? 1 : 2, len: MENU.slen, cars: list, locals: [p1.cid, p2.cid], auth: true });
  }
  function toMenu(screen) {
    hideOverlay(); G.paused = false; $('board').hidden = true; $('touch').hidden = true; $('hud').hidden = true;
    G.online = false; G.mode = 'menu';
    renderMenu(screen || 'main');
  }

  document.addEventListener('langchange', () => {
    if (!$('menu').hidden || !$('garage').hidden) renderMenu(G.screen);
    if (G.overlay === 'pause') renderPause();
    else if (G.overlay === 'results' && G.phase === 'over') showResults(G.score[0] > G.score[1] ? 0 : G.score[1] > G.score[0] ? 1 : -1);
    else if (G.overlay && TGO.relabel) TGO.relabel();
    if (G.W && G.views.length) buildHud();
    if (G.W && !G.views.length && G.mode === 'attract') { $('tags').innerHTML = ''; }
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  });
  document.addEventListener('mal3abready', () => {
    loadSaves(); best();
    if (G.screen === 'main' && !$('menu').hidden) renderMenu('main');
    for (const v of G.views) if (v.car.kind === 'human' && G.mode === 'bots') { v.car.name = myName(); }
  });
  if (window.Mal3abReady) setTimeout(() => { loadSaves(); best(); }, 0);
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.W && G.views.length && !G.online && !G.overlay && G.phase !== 'over') togglePause(); });

  // ------------------------------------------------------------------ shared with tg-online.js and tests
  Object.assign(window.TGI, {
    G, T, get SET() { return SET; }, AU, PS, cams, scene, LS, get GAR() { return GAR; }, get STATS() { return STATS; },
    newMatch, startKickoff, go, onGoal, scoreGoal, endMatch, applyDemo, demoFx, registerTouch, touchFx, snapBodies, bodyInit, showOverlay, hideOverlay, toast, feed, banner,
    renderMenu, toMenu, myName, carLabel, botName, botCars, withIds, startOvertime, skipReplay, endReplay, updateScore, buildHud, boardTable, langBtn, bindLang, seg, bindSeg, lenOpts, esc,
    isLocal, distVol, showResults, ballMesh, startAttract,
  });
  window.TurboGoal = {
    G, get W() { return G.W; },
    startBots(o) { Object.assign(MENU, o || {}); startBots(); },
    startSplit(a, b, mode) { if (mode) MENU.smode = mode; startSplit(a || 'A', b || 'B'); },
    sim(seconds) { const n = Math.round(seconds / STEP); for (let i = 0; i < n && G.W; i++) { if (G.phase === 'replay') { replayStep(STEP); continue; } if (G.phase === 'over') break; simStep(STEP); } },
    goal(team) { if (G.W && G.phase === 'play') scoreGoal(team); },
    ball(x, y, z, vx, vy, vz) { const b = G.W.ball; b.pos.set(x, y, z); b.vel.set(vx || 0, vy || 0, vz || 0); b.pp.copy(b.pos); },
    setClock(s) { G.clock = s; },
    skip: skipReplay, toMenu, state() { return { mode: G.mode, phase: G.phase, score: G.score.slice(), clock: G.clock, ot: G.ot, cars: G.W ? G.W.cars.map(c => ({ cid: c.cid, team: c.team, kind: c.kind, name: carLabel(c), pos: c.pos.toArray().map(v => +v.toFixed(2)), boost: Math.round(c.boost), dead: c.dead, st: c.st })) : [], ball: G.W ? G.W.ball.pos.toArray().map(v => +v.toFixed(2)) : null, overlay: G.overlay, fps: G.fps }; },
    stats: () => STATS, settings: () => SET, keys: KEYS,
  };

  resize();
  requestAnimationFrame(frame);
  // boot: the menu over a bots match, or straight into a room from an invite link
  setTimeout(() => {
    if (TGO.boot && TGO.boot()) return;
    renderMenu('main');
  }, 0);
})();
