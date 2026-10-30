// Pixel Alchemist: Remixed — a magical potion shop inside a moving train (Mal3ab)
(function () {
  'use strict';
  const A = window.PAArt;

  // =====================================================================
  // strings (Egyptian Arabic / English)
  // =====================================================================
  addStrings({
    pa_title: 'خيميائي البكسل', pa_sub: 'ريمكس', pa_full: 'خيميائي البكسل: ريمكس',
    pa_tag: 'محل جرعات سحرية جوّه قطر ماشي — المنظر بيتغير برّه، والمكوّنات كمان!',
    pa_hello: 'أهلاً بيك في القطر يا {n}!',
    pa_journey: 'الرحلة', pa_journey_d: '١٢ محطة وزباين وطلبات وحكاية',
    pa_endless: 'رحلة مالهاش آخر', pa_endless_d: 'اكسب المطلوب في كل محطة وشوف هتوصل لحد فين',
    pa_upgrades: 'التطويرات', pa_howto: 'إزاي تلعب', pa_sound: 'الأصوات', pa_music: 'المزيكا',
    pa_back: 'رجوع', pa_bank: 'الخزنة', pa_map: 'خريطة الرحلة', pa_station: 'محطة {n}',
    pa_start: 'يلا نركب!', pa_locked: 'مقفولة — كمّل المحطة اللي قبلها', pa_best: 'أحسن نتيجة', pa_new: 'جديد!',
    pa_goal_txt: 'اكسب {n} عملة قبل ما القطر يوصل', pa_time: 'مدة الرحلة', pa_route: 'هتعدّي على',
    pa_paused: 'استراحة', pa_resume: 'كمّل', pa_restart: 'من الأول', pa_leave: 'انزل من القطر',
    pa_win: 'وصلنا المحطة!', pa_lose: 'الهدف ماتحققش', pa_blown: 'الترابيزة اتفجرت!', pa_earned: 'الفلوس اللي كسبتها',
    pa_banked: '+{n} للخزنة', pa_next_st: 'المحطة اللي بعدها', pa_retry: 'جرّب تاني', pa_new_best: 'رقم قياسي جديد!',
    pa_served: 'زباين اتخدموا', pa_chainmax: 'أطول سلسلة', pa_goal: 'الهدف', pa_finale: 'خلصت الرحلة كلها! إنت أعظم خيميائي على القضبان 🏆',
    pa_e_quota: 'المطلوب للمحطة', pa_e_over: 'آخر الخط', pa_e_stations: 'محطات عدّيتها', pa_e_passed: 'عدّينا المحطة!', pa_e_missed: 'المطلوب ماكملش — خسرت قلب',
    pa_e_best: 'أحسن رحلة: {c} عملة · {s} محطة', pa_e_info: 'كل محطة ليها مبلغ مطلوب. لو ماجمعتوش تخسر قلب. الطلبات بتصعب مع كل محطة.',
    pa_instab: 'الفوران', pa_next: 'الجاي', pa_tunnel: 'نفق!', pa_shelf: 'الشباك', pa_rack: 'الرف',
    pa_merge: 'دمج!', pa_steam: 'بخار!', pa_zap: 'شرارة!', pa_void: 'هَمّ!', pa_spill: 'وقعت برّه!', pa_boom: 'بووووم!',
    pa_chain: 'سلسلة ×{n}', pa_rackfull: 'الرف مليان!', pa_shelffull: 'الشباك مليان!', pa_legend: 'أسطوري!', pa_jackpot: 'حجر الفلاسفة!',
    pa_tip: 'بقشيش!', pa_streak: 'ورا بعض ×{n}', pa_sold: 'اتباعت', pa_sellq: 'دوس تاني تبيعها', pa_missed: 'مشي زعلان…', pa_thanks: 'شكراً!',
    pa_overload: 'شحنة زيادة!', pa_wispgot: 'روح منورة!', pa_warn: 'خلي بالك! هتفرقع!', pa_bigmerge: 'دمج كبير!',
    pa_el_H: 'نار', pa_el_C: 'تلج', pa_el_E: 'كهربا', pa_el_V: 'فراغ', pa_el_S: 'حجر', pa_tier: 'مستوى {n}',
    pa_b_volcanic: 'أرض البراكين', pa_b_tundra: 'التندرا المتلّجة', pa_b_storm: 'سهول العواصف', pa_b_crystal: 'غابة الكريستال',
    pa_b_marsh: 'مستنقع الضلمة', pa_b_desert: 'كثبان السراب', pa_b_aurora: 'قمم الشفق', pa_b_meadow: 'المرج الأخضر',
    pa_i_H0: 'توتة الجمر', pa_i_H1: 'فطر النار', pa_i_H2: 'شظية حمم', pa_i_C0: 'توتة الصقيع', pa_i_C1: 'فطر التلج', pa_i_C2: 'شظية تلج',
    pa_i_E0: 'توتة الكهربا', pa_i_E1: 'فطر الشرارة', pa_i_E2: 'شظية عاصفة', pa_i_V0: 'توتة الضلمة', pa_i_V1: 'فطر الليل', pa_i_V2: 'شظية الهاوية',
    pa_st1: 'محطة الجمر', pa_st2: 'مرج الصقيع', pa_st3: 'وادي الشرار', pa_st4: 'حافة الهاوية', pa_st5: 'ساحة الكريستال', pa_st6: 'واحة السراب',
    pa_st7: 'قمة الرعد', pa_st8: 'بوابة الجليد', pa_st9: 'شلالات الحجر الأسود', pa_st10: 'كوبري الشفق', pa_st11: 'سهل النجوم', pa_st12: 'المحطة الكبيرة',
    pa_story1: 'أول يوم في المحل! الكمسري بيقول ركاب البراكين بيحبوا الجرعات الحرّاقة.',
    pa_story2: 'داخلين على التلج. خلي بالك: النار والتلج مابيحبوش بعض.',
    pa_story3: 'عاصفة قدامنا! الشرار بيعلّي قوة أي خلاصة يلمسها.',
    pa_story4: 'الضلمة جاية… الفراغ بياكل كل حاجة، بس بيهدّي القدرة.',
    pa_story5: 'الكريستال بيلمع برّه، والعربية اتملت زباين.',
    pa_story6: 'حر جامد، وحجارة سخنة وقعت في القدرة. الفراغ بس اللي يشيلها.',
    pa_story7: 'ساحر مشهور راكب معانا وعايز جرعة أسطورية!',
    pa_story8: 'الجليد قافل الطريق… والزباين مستعجلين.',
    pa_story9: 'المناظر بتتغير بسرعة هنا — خطّط للي جاي.',
    pa_story10: 'كوبري الشفق! أحلى منظر في الرحلة، وأصعب طلبات.',
    pa_story11: 'نجوم بتقع من السما، وحجارة في كل حتة.',
    pa_story12: 'المحطة الأخيرة! وريهم إنك أعظم خيميائي على القضبان.',
    pa_t_merge: 'دمج', pa_d_merge: 'حط ٣ خلاصات زي بعض (نفس العنصر ونفس المستوى) جنب بعض، يندمجوا في خلاصة مستواها أعلى. ٣ من مستوى ٤ = حجر الفلاسفة!',
    pa_t_bottle: 'تعبئة', pa_d_bottle: 'دوس على أي خلاصة في القدرة تتعبّى في إزازة. لو زبون طالبها تروحله على طول، ولو لأ تتحط على الرف لحد ما حد يطلبها.',
    pa_t_steam: 'بخار', pa_d_steam: 'النار لما تلمس التلج يعملوا بخار: الأضعف بيختفي (والأقوى بيضعف)، والبخار بيزق اللي جنبه خطوة لبرّه. اللي يطلع برّه القدرة بيضيع!',
    pa_t_zap: 'شرارة', pa_d_zap: 'الكهربا لما تلمس حاجة بتنط في سلسلة وتعلّي مستوى كل خلاصة تعدّي عليها. شرارة مستوى ١ بتضرب ٢، وكل مستوى زيادة بيضرب واحدة كمان.',
    pa_t_void: 'فراغ', pa_d_void: 'الفراغ بياكل كل اللي حواليه وبعدين يختفي، وبيهدّي الفوران. فراغ مستواه أعلى بياكل مساحة أكبر.',
    pa_t_instab: 'الفوران', pa_d_instab: 'كل تفاعل بيعلّي الفوران. لو وصل ١٠٠٪ القدرة تفرقع وتخسر قلب. التلج والفراغ والتعبئة بيهدّوه، وهو بيهدى لوحده مع الوقت.',
    pa_t_wisp: 'روح منورة', pa_d_wisp: 'خلي عينك على الشباك: لو عدّت روح منورة دوس عليها تاخد مكوّن قوي.',
    pa_t_slag: 'حجارة', pa_d_slag: 'الحجر مابيتحركش ومابيتفاعلش. الفراغ بس اللي يقدر ياكله. لما القدرة تفرقع بتسيب حجارة.',
    pa_t_legend: 'طلبات أسطورية', pa_d_legend: 'زباين مهمين بيطلبوا خلاصة مستوى ٤ — صبرهم طويل وفلوسهم كتير!',
    pa_t_biome: 'الشباك', pa_d_biome: 'المكوّنات بتنزل على الشباك من المنظر اللي برّه، وكل منطقة ليها عناصرها. بص على لافتة "الجاي" وخطّط قبل ما المنظر يتغير.',
    pa_t_goal: 'الهدف', pa_d_goal: 'اخدم الركاب بالجرعات اللي طالبينها واكسب فلوس قبل ما القطر يوصل المحطة. خدمة سريعة = بقشيش، وزباين ورا بعض = بونص.',
    pa_t_drop: 'التنزيل', pa_d_drop: 'دوس على مكوّن من الشباك وبعدين على خانة فاضية في القدرة — أو اسحبه عليها. السلة بترمي المكوّن اللي مش عايزه.',
    pa_t_keys: 'الكيبورد', pa_d_keys: '١-٧ تختار مكوّن · الأسهم تحرك المؤشر · مسافة أو إنتر تنزّل أو تعبّي · X ترمي · P أو Esc استراحة · M الصوت',
    pa_h1: 'دوس على مكوّن من على الشباك ⬇', pa_h2: 'دلوقتي دوس على خانة فاضية في القدرة (أو اسحبه عليها)', pa_h3: 'حط ٣ زي بعض جنب بعض عشان يندمجوا', pa_h4: 'زبون عايز الخلاصة دي؟ دوس عليها في القدرة تتعبّى وتروحله',
    pa_u_shelf: 'شباك أوسع', pa_ud_shelf: 'مكان لمكوّن زيادة على الشباك',
    pa_u_harvest: 'حصاد أسرع', pa_ud_harvest: 'المكوّنات بتوصل أسرع من برّه',
    pa_u_rack: 'رف أكبر', pa_ud_rack: 'إزازة زيادة على الرف',
    pa_u_cool: 'مواسير تبريد', pa_ud_cool: 'الفوران بيعلى أبطأ وبيهدى أسرع',
    pa_u_hearts: 'قدرة مصفّحة', pa_ud_hearts: 'قلب زيادة في كل رحلة',
    pa_u_patience: 'كراسي مريحة', pa_ud_patience: 'الزباين بيستنوا أكتر',
    pa_u_lucky: 'مغرفة الحظ', pa_ud_lucky: 'فرصة أكبر لمكوّنات مستوى ٢',
    pa_u_grand: 'القدرة الكبيرة', pa_ud_grand: 'القدرة تبقى ٦×٦ بدل ٥×٥',
    pa_buy: 'اشتري', pa_max: 'آخر مستوى', pa_lvl: 'مستوى {n}', pa_cant: 'الفلوس مش مكفية',
    pa_bought: 'اتطورت!',
  }, {
    pa_title: 'Pixel Alchemist', pa_sub: 'Remixed', pa_full: 'Pixel Alchemist: Remixed',
    pa_tag: 'A magic potion shop inside a moving train — the view changes outside, and so do your ingredients!',
    pa_hello: 'Welcome aboard, {n}!',
    pa_journey: 'Journey', pa_journey_d: '12 stations, passengers, orders and a story',
    pa_endless: 'Endless ride', pa_endless_d: 'Hit every station quota and see how far you get',
    pa_upgrades: 'Upgrades', pa_howto: 'How to play', pa_sound: 'Sounds', pa_music: 'Music',
    pa_back: 'Back', pa_bank: 'Savings', pa_map: 'Route map', pa_station: 'Station {n}',
    pa_start: 'All aboard!', pa_locked: 'Locked — finish the station before it', pa_best: 'Best', pa_new: 'New!',
    pa_goal_txt: 'Earn {n} coins before the train arrives', pa_time: 'Trip time', pa_route: 'On the way',
    pa_paused: 'Paused', pa_resume: 'Resume', pa_restart: 'Restart', pa_leave: 'Leave the train',
    pa_win: 'Station reached!', pa_lose: 'Missed the target', pa_blown: 'The workstation blew up!', pa_earned: 'Coins earned',
    pa_banked: '+{n} to savings', pa_next_st: 'Next station', pa_retry: 'Try again', pa_new_best: 'New record!',
    pa_served: 'Passengers served', pa_chainmax: 'Longest chain', pa_goal: 'Goal', pa_finale: 'You finished the whole journey! The greatest alchemist on the rails 🏆',
    pa_e_quota: 'Station quota', pa_e_over: 'End of the line', pa_e_stations: 'Stations passed', pa_e_passed: 'Station passed!', pa_e_missed: 'Quota missed — lost a heart',
    pa_e_best: 'Best ride: {c} coins · {s} stations', pa_e_info: 'Every station has a coin quota. Miss it and you lose a heart. Orders get harder at every stop.',
    pa_instab: 'Instability', pa_next: 'Next', pa_tunnel: 'Tunnel!', pa_shelf: 'Windowsill', pa_rack: 'Rack',
    pa_merge: 'Merge!', pa_steam: 'Steam!', pa_zap: 'Zap!', pa_void: 'Gulp!', pa_spill: 'Spilled!', pa_boom: 'BOOM!',
    pa_chain: 'Chain ×{n}', pa_rackfull: 'Rack full!', pa_shelffull: 'Windowsill full!', pa_legend: 'Legendary!', pa_jackpot: 'Philosopher\'s Stone!',
    pa_tip: 'Tip!', pa_streak: 'Streak ×{n}', pa_sold: 'Sold', pa_sellq: 'Tap again to sell', pa_missed: 'Left in a huff…', pa_thanks: 'Thanks!',
    pa_overload: 'Overcharge!', pa_wispgot: 'Wisp caught!', pa_warn: 'Careful — it\'s about to blow!', pa_bigmerge: 'Big merge!',
    pa_el_H: 'Hot', pa_el_C: 'Cold', pa_el_E: 'Electric', pa_el_V: 'Void', pa_el_S: 'Slag', pa_tier: 'Tier {n}',
    pa_b_volcanic: 'Volcanic Wasteland', pa_b_tundra: 'Frozen Tundra', pa_b_storm: 'Storm Plains', pa_b_crystal: 'Crystal Forest',
    pa_b_marsh: 'Shadow Marsh', pa_b_desert: 'Mirage Dunes', pa_b_aurora: 'Aurora Peaks', pa_b_meadow: 'Green Meadow',
    pa_i_H0: 'Ember Berry', pa_i_H1: 'Fire Cap', pa_i_H2: 'Magma Shard', pa_i_C0: 'Frost Berry', pa_i_C1: 'Snow Cap', pa_i_C2: 'Ice Shard',
    pa_i_E0: 'Volt Berry', pa_i_E1: 'Spark Cap', pa_i_E2: 'Storm Shard', pa_i_V0: 'Shade Berry', pa_i_V1: 'Night Cap', pa_i_V2: 'Abyss Shard',
    pa_st1: 'Cinder Junction', pa_st2: 'Frostmoor', pa_st3: 'Sparkvale', pa_st4: 'Hollow Reach', pa_st5: 'Crystal Glade', pa_st6: 'Mirage Oasis',
    pa_st7: 'Thunderpeak', pa_st8: 'Glacier Gate', pa_st9: 'Obsidian Falls', pa_st10: 'Aurora Bridge', pa_st11: 'Starfall Steppe', pa_st12: 'Grand Terminus',
    pa_story1: 'First day at the shop! The conductor says volcano folks love fiery tonics.',
    pa_story2: 'Heading into the snow. Careful: fire and ice don\'t get along.',
    pa_story3: 'A storm ahead! Sparks power up any essence they touch.',
    pa_story4: 'Darkness ahead… the Void eats everything, but it calms the cauldron.',
    pa_story5: 'Crystals glitter outside and the carriage is filling up.',
    pa_story6: 'Scorching heat, and hot slag fell into the cauldron. Only the Void can clear it.',
    pa_story7: 'A famous wizard is on board, and he wants a legendary brew!',
    pa_story8: 'Ice blocks the way… and the passengers are in a hurry.',
    pa_story9: 'The scenery changes fast here — plan ahead.',
    pa_story10: 'Aurora Bridge! The best view of the trip, and the toughest orders.',
    pa_story11: 'Stars falling from the sky, and slag everywhere.',
    pa_story12: 'The final station! Show them you are the greatest alchemist on the rails.',
    pa_t_merge: 'Merge', pa_d_merge: 'Put 3 matching essences (same element and same tier) side by side and they fuse into one of the next tier. Three tier 4s make a Philosopher\'s Stone!',
    pa_t_bottle: 'Bottle', pa_d_bottle: 'Tap any essence in the cauldron to bottle it. If a passenger wants it, it goes straight to them; otherwise it waits on the rack until someone asks.',
    pa_t_steam: 'Steam', pa_d_steam: 'When Hot touches Cold they burst into steam: the weaker one vanishes (the stronger one weakens) and the steam pushes its neighbours one step outward. Anything pushed over the rim is lost!',
    pa_t_zap: 'Spark', pa_d_zap: 'When Electric touches something it jumps along a chain and raises the tier of every essence it passes. A tier 1 spark hits 2, and every extra tier hits one more.',
    pa_t_void: 'Void', pa_d_void: 'The Void swallows everything around it, then collapses — and calms the cauldron. Higher tier Voids swallow a wider area.',
    pa_t_instab: 'Instability', pa_d_instab: 'Every reaction raises instability. At 100% the cauldron blows up and you lose a heart. Cold, Void and bottling calm it down, and it cools slowly over time.',
    pa_t_wisp: 'Wisps', pa_d_wisp: 'Keep an eye on the window: tap a glowing wisp as it floats by to grab a powerful ingredient.',
    pa_t_slag: 'Slag', pa_d_slag: 'Slag never moves and never reacts. Only the Void can eat it. Explosions leave slag behind.',
    pa_t_legend: 'Legendary orders', pa_d_legend: 'Important passengers ask for a tier 4 essence — they wait longer and pay a fortune!',
    pa_t_biome: 'The window', pa_d_biome: 'Ingredients land on the windowsill from the scenery outside, and each biome brings its own elements. Read the "Next" sign and plan before the view changes.',
    pa_t_goal: 'The goal', pa_d_goal: 'Serve passengers the potions they ask for and earn coins before the train reaches the station. Quick service earns tips, and serving in a row earns a streak bonus.',
    pa_t_drop: 'Dropping', pa_d_drop: 'Tap an ingredient on the windowsill, then an empty spot in the cauldron — or drag it there. The bin throws away an ingredient you don\'t want.',
    pa_t_keys: 'Keyboard', pa_d_keys: '1-7 pick an ingredient · arrows move the cursor · Space or Enter drops or bottles · X throws away · P or Esc pauses · M sound',
    pa_h1: 'Tap an ingredient on the windowsill ⬇', pa_h2: 'Now tap an empty spot in the cauldron (or drag it there)', pa_h3: 'Put 3 matching essences side by side to merge them', pa_h4: 'A passenger wants that essence? Tap it in the cauldron to bottle it for them',
    pa_u_shelf: 'Wider windowsill', pa_ud_shelf: 'Room for one more ingredient on the windowsill.',
    pa_u_harvest: 'Faster harvest', pa_ud_harvest: 'Ingredients arrive from outside faster.',
    pa_u_rack: 'Bigger rack', pa_ud_rack: 'One more bottle on the rack.',
    pa_u_cool: 'Cooling coils', pa_ud_cool: 'Instability rises slower and cools faster.',
    pa_u_hearts: 'Armored cauldron', pa_ud_hearts: 'One extra heart on every trip.',
    pa_u_patience: 'Comfy seats', pa_ud_patience: 'Passengers wait longer.',
    pa_u_lucky: 'Lucky ladle', pa_ud_lucky: 'Better chance of tier 2 ingredients.',
    pa_u_grand: 'Grand cauldron', pa_ud_grand: 'The cauldron grows to 6×6 instead of 5×5.',
    pa_buy: 'Buy', pa_max: 'Max', pa_lvl: 'Level {n}', pa_cant: 'Not enough coins',
    pa_bought: 'Upgraded!',
  });

  // =====================================================================
  // constants, save
  // =====================================================================
  const ELS = ['H', 'C', 'E', 'V'];
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const VALUE = [0, 8, 20, 48, 120], SELL = [0, 2, 5, 12, 30], PATIENCE = [0, 42, 58, 84, 120];
  const SAVE_KEY = 'pixel-alchemist-save';
  const UPG = [
    { id: 'shelf', max: 2, cost: [120, 320] }, { id: 'harvest', max: 3, cost: [100, 240, 450] },
    { id: 'rack', max: 2, cost: [90, 260] }, { id: 'cool', max: 3, cost: [150, 320, 600] },
    { id: 'hearts', max: 2, cost: [220, 550] }, { id: 'patience', max: 3, cost: [120, 280, 500] },
    { id: 'lucky', max: 3, cost: [160, 380, 650] }, { id: 'grand', max: 1, cost: [900] },
  ];
  const defSave = () => ({ v: 1, bank: 0, up: { shelf: 0, harvest: 0, rack: 0, cool: 0, hearts: 0, patience: 0, lucky: 0, grand: 0 }, lv: {}, unlocked: 1, endless: { best: 0, stations: 0 }, seen: {}, snd: 1, mus: 1, tut: 0 });
  let S = defSave();
  function loadSave() {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && typeof s === 'object') { S = Object.assign(defSave(), s); S.up = Object.assign(defSave().up, s.up || {}); S.endless = Object.assign(defSave().endless, s.endless || {}); S.lv = s.lv || {}; S.seen = s.seen || {}; } } catch (e) { S = defSave(); }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  loadSave();

  // 12 stations
  const LV = (o) => Object.assign({ els: 'HCEV', biomes: ['meadow'], time: 150, goal: 100, tiers: [1, 2], maxO: 3, spawn: [8, 12], pat: 1, multi: 0, legend: 0, slag: 0, debris: 2, intro: [], heat: 1, fast: false, wisp: true }, o);
  const LEVELS = [
    LV({ els: 'H', biomes: ['volcanic', 'desert'], time: 120, goal: 80, tiers: [1, 1, 2], maxO: 2, spawn: [7, 11], pat: 1.3, debris: 0, intro: ['goal', 'drop', 'merge', 'bottle', 'instab'], wisp: false }),
    LV({ els: 'HC', biomes: ['tundra', 'volcanic'], time: 135, goal: 90, tiers: [1, 2, 2], maxO: 2, spawn: [7, 11], pat: 1.25, debris: 0, intro: ['steam', 'biome'], wisp: false }),
    LV({ els: 'HCE', biomes: ['storm', 'meadow', 'tundra'], time: 150, goal: 160, tiers: [1, 2, 2, 3], spawn: [8, 12], pat: 1.2, multi: 0.1, debris: 1, intro: ['zap'], wisp: false }),
    LV({ biomes: ['marsh', 'crystal', 'volcanic'], time: 150, goal: 170, tiers: [1, 2, 2, 3], spawn: [7, 11], pat: 1.15, multi: 0.15, debris: 1, intro: ['void', 'wisp'], luck: 0.03 }),
    LV({ biomes: ['crystal', 'aurora', 'storm'], time: 160, goal: 190, tiers: [1, 2, 2, 3], spawn: [7, 11], pat: 1.1, multi: 0.2, debris: 2, luck: 0.06 }),
    LV({ biomes: ['desert', 'volcanic', 'storm'], time: 160, goal: 200, tiers: [1, 2, 3, 3], spawn: [7, 10], pat: 1.15, multi: 0.2, slag: 2, intro: ['slag'], luck: 0.06 }),
    LV({ biomes: ['storm', 'crystal', 'aurora'], time: 170, goal: 230, tiers: [2, 2, 3, 3], spawn: [7, 10], pat: 1.05, multi: 0.2, legend: 0.12, intro: ['legend'], luck: 0.08 }),
    LV({ biomes: ['tundra', 'aurora', 'marsh'], time: 170, goal: 230, tiers: [2, 2, 3, 3], spawn: [6, 9], pat: 1.0, multi: 0.25, legend: 0.1, slag: 2, heat: 1.05, luck: 0.08 }),
    LV({ biomes: ['volcanic', 'marsh', 'desert', 'meadow'], time: 170, goal: 240, tiers: [2, 2, 3, 3], spawn: [6, 9], pat: 1.0, multi: 0.25, legend: 0.1, slag: 2, heat: 1.1, fast: true, luck: 0.1 }),
    LV({ biomes: ['aurora', 'crystal', 'meadow', 'storm'], time: 180, goal: 270, tiers: [2, 3, 3, 4], spawn: [6, 9], pat: 1.0, multi: 0.3, legend: 0.12, slag: 2, heat: 1.1, luck: 0.1 }),
    LV({ biomes: ['marsh', 'storm', 'desert', 'tundra', 'crystal'], time: 180, goal: 280, tiers: [2, 3, 3], spawn: [5, 8], pat: 1.0, multi: 0.3, legend: 0.12, slag: 3, debris: 3, heat: 1.15, luck: 0.12 }),
    LV({ biomes: ['volcanic', 'tundra', 'storm', 'marsh', 'crystal', 'desert', 'aurora', 'meadow'], time: 200, goal: 300, tiers: [2, 3, 3, 4], spawn: [5, 8], pat: 0.95, multi: 0.35, legend: 0.15, slag: 3, debris: 3, heat: 1.15, fast: true, luck: 0.12 }),
  ];
  const endlessCfg = (k) => LV({
    biomes: A.BIOME_IDS, time: Infinity, goal: 0,
    tiers: k < 1 ? [1, 1, 2] : k < 3 ? [1, 2, 2, 3] : k < 5 ? [2, 2, 3] : k < 8 ? [2, 3, 3] : [2, 3, 3, 4],
    maxO: k < 1 ? 2 : 3, spawn: [Math.max(4, 8.5 - k * 0.45), Math.max(6, 12.5 - k * 0.6)], pat: Math.max(0.7, 1.2 - 0.05 * k),
    multi: Math.min(0.35, 0.1 + 0.03 * k), legend: k >= 3 ? 0.1 : 0, debris: k < 2 ? 1 : 2, heat: 1 + Math.min(0.3, k * 0.03), fast: k >= 6, luck: Math.min(0.14, k * 0.02),
  });
  const quotaFor = (k) => 55 + 25 * k;
  const SEG_LEN = 80;

  // =====================================================================
  // helpers
  // =====================================================================
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmtT = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const wpick = (w) => { let tot = 0; for (const k in w) tot += w[k]; let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return Object.keys(w)[0]; };
  const elName = (el) => t('pa_el_' + el);
  const $ = (id) => document.getElementById(id);

  // sprite caches
  const SPR = { ess: {}, ing: {}, bot: {}, mini: {}, icon: {} };
  const essSpr = (el, tier) => { const k = el + tier; return SPR.ess[k] || (SPR.ess[k] = el === 'S' ? A.slag() : A.essence(el, tier)); };
  const ingSpr = (el, v) => { const k = el + v; return SPR.ing[k] || (SPR.ing[k] = A.fromRows(A.ING[v], A.PAL[el])); };
  const botSpr = (el) => SPR.bot[el] || (SPR.bot[el] = A.fromRows(A.BOTTLE, A.PAL[el]));
  const miniSpr = (el, col) => { const k = el + (col || ''); return SPR.mini[k] || (SPR.mini[k] = A.fromRows(A.MINI[el], { a: col || A.PAL[el].l })); };
  const icon = (n) => SPR.icon[n] || (SPR.icon[n] = A.fromRows(A.ICON[n], A.ICON_PAL));
  const custCache = {};
  const custSpr = (type, seed) => { const k = type + seed; return custCache[k] || (custCache[k] = A.customer(type, seed)); };
  const variantFor = (biome, el) => (A.BIOME_IDS.indexOf(biome) + ELS.indexOf(el)) % 3;
  const dataURL = (c, scale) => { const o = A.mk(c.width * scale, c.height * scale), x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, o.width, o.height); return o.toDataURL(); };

  // =====================================================================
  // audio (WebAudio synth)
  // =====================================================================
  const AU = {
    ctx: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
        this.sfx = this.ctx.createGain(); this.sfx.connect(this.master); this.mus = this.ctx.createGain(); this.mus.connect(this.master);
        const len = this.ctx.sampleRate * 1.2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.nbuf = buf; this.apply(); this.music();
      } catch (e) { this.ctx = null; }
    },
    apply() { if (!this.ctx) return; this.sfx.gain.value = S.snd ? 0.9 : 0; this.mus.gain.value = S.mus ? 0.22 : 0; },
    tone(f, d, type, v, slide, delay, dest) {
      if (!this.ctx || (!S.snd && !dest)) return;
      const c = this.ctx, t0 = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.12, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(dest || this.sfx); o.start(t0); o.stop(t0 + d + 0.02);
    },
    noise(d, v, f0, f1, delay, dest, type) {
      if (!this.ctx || (!S.snd && !dest)) return;
      const c = this.ctx, t0 = c.currentTime + (delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.nbuf; f.type = type || 'bandpass'; f.frequency.setValueAtTime(f0, t0); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + d); f.Q.value = 0.8;
      g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t0, Math.random() * 0.2); s.stop(t0 + d + 0.02);
    },
    play(n, a) {
      if (!this.ctx || !S.snd) return;
      switch (n) {
        case 'click': this.tone(520, 0.05, 'square', 0.05); break;
        case 'pick': this.tone(700, 0.05, 'square', 0.06); this.tone(940, 0.05, 'square', 0.04, 0, 0.04); break;
        case 'drop': this.tone(340, 0.14, 'sine', 0.22, -200); this.noise(0.1, 0.08, 1400, 500); break;
        case 'merge': { const notes = [523, 659, 784, 1046, 1318]; for (let i = 0; i <= (a || 1); i++) this.tone(notes[i], 0.12, 'triangle', 0.13, 0, i * 0.06); break; }
        case 'steam': this.noise(0.55, 0.22, 5000, 900, 0, null, 'highpass'); this.tone(180, 0.2, 'sine', 0.1, -80); break;
        case 'zap': for (let i = 0; i < 4; i++) this.tone(880 + i * 330, 0.05, 'square', 0.06, 600, i * 0.035); this.noise(0.18, 0.1, 3000, 6000); break;
        case 'void': this.tone(420, 0.45, 'sine', 0.2, -360); this.noise(0.4, 0.08, 300, 80, 0, null, 'lowpass'); break;
        case 'bottle': this.tone(1000, 0.04, 'sine', 0.15); this.tone(1500, 0.06, 'sine', 0.12, 0, 0.05); break;
        case 'coin': this.tone(988, 0.07, 'square', 0.07); this.tone(1319, 0.16, 'square', 0.07, 0, 0.07); break;
        case 'served': [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.12, 0, i * 0.07)); break;
        case 'fail': this.tone(260, 0.25, 'sawtooth', 0.07, -120); this.tone(196, 0.3, 'sawtooth', 0.06, -80, 0.15); break;
        case 'err': this.tone(150, 0.12, 'square', 0.08); break;
        case 'boom': this.noise(1.2, 0.7, 1200, 50, 0, null, 'lowpass'); this.tone(90, 0.8, 'sine', 0.5, -60); this.tone(60, 1.0, 'triangle', 0.3, -30, 0.1); break;
        case 'alarm': this.tone(880, 0.09, 'square', 0.05); this.tone(660, 0.09, 'square', 0.05, 0, 0.1); break;
        case 'tunnel': this.noise(1.6, 0.14, 250, 180, 0, null, 'lowpass'); break;
        case 'wisp': [1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, 0.15, 'sine', 0.09, 0, i * 0.05)); break;
        case 'harvest': this.tone(620 + Math.random() * 120, 0.05, 'triangle', 0.06); break;
        case 'spill': this.tone(500, 0.25, 'sine', 0.1, -350); break;
        case 'legend': [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.13, 0, i * 0.08)); break;
        case 'win': [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.14, 0, i * 0.1)); break;
        case 'lose': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.12, 0, i * 0.16)); break;
        case 'sell': this.tone(700, 0.06, 'square', 0.05); this.tone(560, 0.08, 'square', 0.05, 0, 0.06); break;
      }
    },
    music() {   // tiny looping chiptune, scheduled ahead
      if (this._mt) return;
      const c = this.ctx, step = 60 / 104 / 2; let next = c.currentTime + 0.1, i = 0;
      const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 207.7, 246.9]];
      this._mt = setInterval(() => {
        if (!this.ctx || !S.mus || this.ctx.state !== 'running') { next = Math.max(next, c.currentTime + 0.05); return; }
        const live = state === 'play' || state === 'title' || state === 'map' || state === 'shop' || state === 'how';
        while (next < c.currentTime + 0.3) {
          if (live) {
            const bar = Math.floor(i / 16) % 4, ch = chords[bar], s = i % 16, d = next - c.currentTime;
            if (s % 4 === 0) this.tone(ch[0] / 2, step * 1.8, 'triangle', 0.22, 0, d, this.mus);
            if (s % 2 === 0) this.tone(ch[(s / 2) % 3] * 2, step * 0.9, 'square', 0.035, 0, d, this.mus);
            if (s === 6 || s === 14) this.tone(ch[2] * 2, step * 1.4, 'triangle', 0.05, 0, d, this.mus);
            if (s % 4 === 0 || s % 4 === 1) this.noise(0.04, 0.06, 2200, 0, d, this.mus, 'highpass');
          }
          next += step; i++;
        }
      }, 90);
    },
  };

  // =====================================================================
  // reaction engine (pure board logic, also used for preview and the bot)
  // =====================================================================
  let STAMP = 1, PID = 1;
  const mkPiece = (el, tier) => ({ el, tier, id: PID++, st: ++STAMP, vx: 0, vy: 0, pop: 0, flash: 0, ph: Math.random() * 6.28 });
  const inB = (x, y, n) => x >= 0 && y >= 0 && x < n && y < n;
  const grid = (n) => Array.from({ length: n }, () => Array(n).fill(null));
  const cloneBoard = (B) => B.map(r => r.map(p => p ? { el: p.el, tier: p.tier, st: p.st, id: p.id } : null));
  const conductive = (p) => p && p.el !== 'E' && p.el !== 'S' && p.el !== 'V';
  function voidCells(x, y, tier, n) {
    const out = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (!dx && !dy) continue; const m = Math.abs(dx) + Math.abs(dy), c = Math.max(Math.abs(dx), Math.abs(dy));
      const ok = tier === 1 ? m === 1 : tier === 2 ? c === 1 : tier === 3 ? m <= 2 : c <= 2;
      if (ok && inB(x + dx, y + dy, n)) out.push([x + dx, y + dy]);
    }
    return out;
  }
  function findReaction(B, n) {
    let best = null;
    const cons = (c) => { if (!best || c.st > best.st || (c.st === best.st && c.pri < best.pri)) best = c; };
    const seen = new Uint8Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = B[y][x]; if (!p || p.el === 'S' || seen[y * n + x]) continue;
      const cl = [], st = [[x, y]]; seen[y * n + x] = 1;
      while (st.length) {
        const [cx, cy] = st.pop(); cl.push([cx, cy]);
        for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (!inB(nx, ny, n) || seen[ny * n + nx]) continue; const q = B[ny][nx]; if (q && q.el === p.el && q.tier === p.tier) { seen[ny * n + nx] = 1; st.push([nx, ny]); } }
      }
      if (cl.length >= 3) { let a = cl[0], ms = -1; for (const c of cl) { const s = B[c[1]][c[0]].st; if (s > ms) { ms = s; a = c; } } cons({ type: 'merge', cells: cl, at: a, st: ms, pri: 0 }); }
    }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = B[y][x]; if (!p) continue;
      if (p.el === 'V') {
        const tg = voidCells(x, y, p.tier, n).filter(([cx, cy]) => B[cy][cx] && B[cy][cx].el !== 'V');
        if (tg.length) { let ms = p.st; for (const [cx, cy] of tg) ms = Math.max(ms, B[cy][cx].st); cons({ type: 'void', at: [x, y], cells: tg, st: ms, pri: 1 }); }
      } else if (p.el === 'H') {
        for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (!inB(nx, ny, n)) continue; const q = B[ny][nx]; if (q && q.el === 'C') cons({ type: 'steam', hot: [x, y], cold: [nx, ny], st: Math.max(p.st, q.st), pri: 2 }); }
      }
    }
    const seenE = new Uint8Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = B[y][x]; if (!p || p.el !== 'E' || seenE[y * n + x]) continue;
      const grp = [], st = [[x, y]]; seenE[y * n + x] = 1; let ms = -1, touch = false;
      while (st.length) {
        const [cx, cy] = st.pop(); grp.push([cx, cy]); ms = Math.max(ms, B[cy][cx].st);
        for (const [dx, dy] of DIRS) {
          const nx = cx + dx, ny = cy + dy; if (!inB(nx, ny, n)) continue; const q = B[ny][nx]; if (!q) continue;
          if (q.el === 'E') { if (!seenE[ny * n + nx]) { seenE[ny * n + nx] = 1; st.push([nx, ny]); } }
          else if (conductive(q)) { touch = true; ms = Math.max(ms, q.st); }
        }
      }
      if (touch) cons({ type: 'zap', cells: grp, st: ms, pri: 3 });
    }
    return best;
  }
  // mutates B; returns an event describing what happened (inst = raw instability delta, coins = bonus coins)
  function applyCore(B, n, r) {
    const ev = { type: r.type, inst: 0, coins: 0 };
    if (r.type === 'merge') {
      const [ax, ay] = r.at, a = B[ay][ax], tier = a.tier;
      ev.at = [ax, ay]; ev.el = a.el; ev.consumed = [];
      for (const [cx, cy] of r.cells) if (cx !== ax || cy !== ay) { ev.consumed.push({ p: B[cy][cx], from: [cx, cy] }); B[cy][cx] = null; }
      if (tier >= 4) {
        ev.jackpot = true; ev.consumed.push({ p: a, from: [ax, ay] }); B[ay][ax] = null; ev.coins = 150; ev.inst = -45;
      } else {
        a.tier = tier + 1; a.st = ++STAMP; ev.piece = a; ev.tier = a.tier;
        const extra = r.cells.length - 3; if (extra > 0) { ev.coins = extra * tier * 3; ev.big = true; }
        ev.inst = a.el === 'H' ? 2 + a.tier : a.el === 'C' ? -(1 + a.tier) : a.el === 'E' ? 2 : -1;
      }
    } else if (r.type === 'void') {
      const [vx, vy] = r.at, v = B[vy][vx]; ev.at = [vx, vy]; ev.v = v; ev.eaten = [];
      for (const [cx, cy] of r.cells) { const q = B[cy][cx]; ev.eaten.push({ p: q, from: [cx, cy] }); ev.inst -= 3 + (q.el === 'S' ? 1 : q.tier); B[cy][cx] = null; }
      B[vy][vx] = null;
    } else if (r.type === 'steam') {
      const [hx, hy] = r.hot, [cx, cy] = r.cold, h = B[hy][hx], c = B[cy][cx];
      ev.steam = []; ev.destroyed = []; ev.moves = []; ev.spills = []; ev.survivor = null; ev.inst = 5 + Math.max(h.tier, c.tier);
      if (h.tier > c.tier) { h.tier -= c.tier; h.st = ++STAMP; ev.survivor = h; ev.destroyed.push({ p: c, from: [cx, cy] }); B[cy][cx] = null; ev.steam.push([cx, cy]); }
      else if (c.tier > h.tier) { c.tier -= h.tier; c.st = ++STAMP; ev.survivor = c; ev.destroyed.push({ p: h, from: [hx, hy] }); B[hy][hx] = null; ev.steam.push([hx, hy]); }
      else { ev.destroyed.push({ p: h, from: [hx, hy] }, { p: c, from: [cx, cy] }); B[hy][hx] = null; B[cy][cx] = null; ev.steam.push([hx, hy], [cx, cy]); }
      for (const [sx, sy] of ev.steam) for (const [dx, dy] of DIRS) {
        const nx = sx + dx, ny = sy + dy; if (!inB(nx, ny, n)) continue; const q = B[ny][nx]; if (!q || q.el === 'S') continue;
        const tx = nx + dx, ty = ny + dy;
        if (!inB(tx, ty, n)) { ev.spills.push({ p: q, from: [nx, ny], dir: [dx, dy] }); B[ny][nx] = null; }
        else if (!B[ty][tx]) { B[ty][tx] = q; B[ny][nx] = null; q.st = ++STAMP; ev.moves.push({ p: q, from: [nx, ny], to: [tx, ty] }); }
      }
    } else if (r.type === 'zap') {
      const grp = r.cells; let power = 1; for (const [x, y] of grp) power += B[y][x].tier;
      const sorted = grp.slice().sort((a, b) => B[b[1]][b[0]].st - B[a[1]][a[0]].st);
      const vis = new Set(), q = [], links = [], hits = [], key = (x, y) => y * n + x;
      for (const [x, y] of sorted) for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (inB(nx, ny, n) && conductive(B[ny][nx]) && !vis.has(key(nx, ny))) { vis.add(key(nx, ny)); q.push([nx, ny]); links.push([[x, y], [nx, ny]]); } }
      while (q.length && hits.length < power) {
        const c = q.shift(); hits.push(c);
        for (const [dx, dy] of DIRS) { const nx = c[0] + dx, ny = c[1] + dy; if (inB(nx, ny, n) && conductive(B[ny][nx]) && !vis.has(key(nx, ny))) { vis.add(key(nx, ny)); q.push([nx, ny]); links.push([c, [nx, ny]]); } }
      }
      const hitSet = new Set(hits.map(([x, y]) => key(x, y)));
      ev.links = links.filter(([, b]) => hitSet.has(key(b[0], b[1])));
      ev.hits = hits; ev.sparks = grp.map(([x, y]) => ({ p: B[y][x], from: [x, y] })); ev.inst = 3 * hits.length; ev.over = 0;
      for (const [x, y] of hits) { const p = B[y][x]; if (p.tier < 4) p.tier++; else { ev.inst += 4; ev.over++; } p.st = ++STAMP; }
      for (const [x, y] of grp) B[y][x] = null;
    }
    return ev;
  }

  // =====================================================================
  // scene (the view out of the window — shared by menus and play)
  // =====================================================================
  const TUN = 1.7;
  const scene = { dist: 0, list: ['meadow', 'volcanic', 'crystal', 'tundra', 'storm', 'desert', 'aurora', 'marsh'], idx: 0, cur: 'meadow', next: 'volcanic', bT: 14, tunnel: 0, switched: true, fast: false, random: false, menu: true, wx: [], flashT: 0, bolt: null };
  function biomeDur() { return scene.menu ? 12 : scene.fast ? rand(26, 34) : rand(40, 56); }
  function sceneSet(list, fast, random, menu) {
    scene.list = list.slice(); scene.fast = !!fast; scene.random = !!random; scene.menu = !!menu; scene.idx = 0;
    scene.cur = random ? pick(list) : list[0]; scene.next = nextBiome(); scene.bT = biomeDur(); scene.tunnel = 0; scene.switched = true; scene.wx = [];
  }
  function nextBiome() {
    if (scene.list.length < 2) return scene.cur;
    if (scene.random) { let b; do b = pick(scene.list); while (b === scene.cur); return b; }
    return scene.list[(scene.list.indexOf(scene.cur) + 1) % scene.list.length];
  }
  function sceneUpdate(dt) {
    scene.dist += dt * 46;
    if (scene.tunnel > 0) {
      scene.tunnel -= dt;
      if (!scene.switched && scene.tunnel < TUN / 2) { scene.cur = scene.next; scene.next = nextBiome(); scene.bT = biomeDur(); scene.switched = true; scene.wx = []; }
    } else {
      scene.bT -= dt;
      if (scene.bT <= 0) { scene.tunnel = TUN; scene.switched = false; if (state === 'play') AU.play('tunnel'); }
    }
    // weather particles (window-local coordinates)
    const W = LY.win; if (!W) return;
    const kind = A.BIOMES[scene.cur].weather, wx = scene.wx;
    const spawn = { embers: 14, snow: 30, rain: 70, sparkle: 10, fireflies: 3, heat: 6, aurora: 6, petals: 6 }[kind] || 0;
    let k = spawn * dt * (W.w / 300); while (k > 0) { if (Math.random() < k) addWx(kind, W); k -= 1; }
    for (let i = wx.length - 1; i >= 0; i--) {
      const p = wx[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (kind === 'fireflies') { p.vx += (Math.random() - 0.5) * 40 * dt; p.vy += (Math.random() - 0.5) * 40 * dt; }
      if (p.life <= 0 || p.x < -4 || p.x > W.w + 4 || p.y > W.h + 2 || p.y < -6) wx.splice(i, 1);
    }
    if (kind === 'rain') { scene.flashT -= dt; if (scene.flashT < -rand(3, 7)) { scene.flashT = 0.25; scene.bolt = { x: rand(0.1, 0.9) * W.w, seed: Math.random() * 1000 }; if (state === 'play' && scene.tunnel <= 0) AU.noise(0.6, 0.08, 400, 80, 0.1, null, 'lowpass'); } }
  }
  function addWx(kind, W) {
    const p = { x: rand(0, W.w + 20), y: rand(0, W.h), vx: -50, vy: 0, life: 4, c: '#fff', k: kind };
    if (kind === 'embers') { p.y = W.h; p.vy = -rand(10, 26); p.vx = -rand(30, 60); p.c = pick(['#ff7a2a', '#ffcf6a', '#ff4a1a']); }
    else if (kind === 'snow') { p.y = -2; p.vy = rand(10, 22); p.vx = -rand(40, 70); p.c = pick(['#ffffff', '#e8f4ff']); p.life = 8; }
    else if (kind === 'rain') { p.y = -4; p.vy = rand(110, 150); p.vx = -rand(60, 80); p.c = '#8fa8d8'; p.life = 2; }
    else if (kind === 'sparkle') { p.vx = -rand(15, 30); p.c = pick(['#bff4ff', '#ffd0f4', '#ffffff']); p.life = rand(0.6, 1.6); }
    else if (kind === 'fireflies') { p.y = rand(W.h * 0.4, W.h * 0.85); p.vx = -rand(20, 35); p.c = '#d8ff6a'; p.life = rand(3, 6); }
    else if (kind === 'heat') { p.y = rand(W.h * 0.55, W.h * 0.85); p.vx = -rand(70, 110); p.vy = rand(-3, 3); p.c = '#ffe6b0'; p.life = 3; }
    else if (kind === 'aurora') { p.y = rand(0, W.h * 0.5); p.vx = -rand(3, 8); p.c = '#ffffff'; p.life = rand(0.5, 1.5); }
    else if (kind === 'petals') { p.y = rand(0, W.h * 0.7); p.vx = -rand(40, 60); p.vy = rand(4, 10); p.c = pick(['#ff8fb1', '#ffffff', '#fff27a']); p.life = 5; }
    scene.wx.push(p);
  }

  // =====================================================================
  // run state
  // =====================================================================
  let state = 'title';     // title | map | shop | how | play | paused | result
  let G = null;
  let fx = { parts: [], ghosts: [], rings: [], zaps: [], floats: [], flights: [], shake: 0, flash: 0, flashC: '#fff' };
  let clock = 0;

  function newRun(mode, li) {
    const cfg = mode === 'endless' ? endlessCfg(0) : LEVELS[li];
    const n = S.up.grand ? 6 : 5, hearts = 3 + S.up.hearts;
    G = {
      mode, li, cfg, n, board: grid(n), t: 0, coins: 0, hearts, maxHearts: hearts, inst: 0, instShow: 0,
      shelf: Array(5 + S.up.shelf).fill(null), sel: -1, rack: Array(3 + S.up.rack).fill(null), rackSel: -1, rackSelT: 0,
      orders: [], orderT: 0.6, oid: 1, streak: 0, harvestT: 0, wisp: null, wispT: rand(10, 16),
      cascade: null, over: false, overT: -1, overReason: '', warnT: 0, rockT: 0, bump: 0,
      cur: { x: Math.floor(n / 2), y: Math.floor(n / 2), show: false }, hover: null, drag: null,
      stats: { served: 0, missed: 0, booms: 0, maxChain: 0, legend: 0, drops: 0, merges: 0, spills: 0, ev: {}, sold: 0 },
      seg: mode === 'endless' ? { k: 0, t: 0, coins: 0, quota: quotaFor(0) } : null,
      tut: mode === 'level' && li === 0 && !S.tut ? 0 : -1,
    };
    fx = { parts: [], ghosts: [], rings: [], zaps: [], floats: [], flights: [], shake: 0, flash: 0, flashC: '#fff' };
    sceneSet(cfg.biomes, cfg.fast, mode === 'endless', false);
    // pre-placed slag
    for (let i = 0; i < cfg.slag; i++) dropSlag(true);
    for (let i = 0; i < 3; i++) { const el = pickHarvestEl(); const s = G.shelf.findIndex(x => !x); G.shelf[s] = { el, tier: 1, v: variantFor(scene.cur, el) }; }
    layout();
  }
  function dropSlag(quiet) {
    const n = G.n, free = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!G.board[y][x] && !(x === Math.floor(n / 2) && y === Math.floor(n / 2) && quiet)) free.push([x, y]);
    if (!free.length) return; const [x, y] = pick(free); const p = mkPiece('S', 1); p.vx = x; p.vy = quiet ? y : y - 2; G.board[y][x] = p;
  }
  function pickHarvestEl() {
    const allowed = G.cfg.els.split(''), w = {}, bw = A.BIOMES[scene.cur].els; let tot = 0;
    for (const e of allowed) { w[e] = bw[e] || 0; tot += w[e]; }
    if (tot <= 0) for (const e of allowed) w[e] = 1;
    return wpick(w);
  }
  function pickOrderEl() {
    const allowed = G.cfg.els.split(''), w = {}, a = A.BIOMES[scene.cur].els, b = A.BIOMES[scene.next].els;
    for (const e of allowed) w[e] = 1 + (a[e] || 0) * 0.6 + (b[e] || 0) * 0.4;
    return wpick(w);
  }
  const harvestIv = () => [2.3, 2.0, 1.75, 1.5][S.up.harvest] || 2.3;
  const canAct = () => state === 'play' && G && !G.over && !G.cascade && G.overT < 0;

  function addInst(v) {
    if (v > 0) v *= (1 - 0.12 * S.up.cool) * (G.cfg.heat || 1);
    G.inst = Math.max(0, G.inst + v);
  }
  function addCoins(v, x, y) {
    if (!v) return; v = Math.round(v); G.coins += v; if (G.seg) G.seg.coins += v;
  }

  // ---------- harvesting ----------
  function spawnHarvest(el, tier, from) {
    const i = G.shelf.findIndex(s => !s); if (i < 0) return false;
    el = el || pickHarvestEl();
    tier = tier || (Math.random() < 0.06 * S.up.lucky + (G.cfg.luck || 0) ? 2 : 1);
    const it = { el, tier, v: variantFor(scene.cur, el), arriving: true };
    G.shelf[i] = it;
    const W = LY.win, s = LY.slots[i];
    const x0 = from ? from[0] : W.x + rand(0.15, 0.85) * W.w, y0 = from ? from[1] : W.y + W.h * rand(0.45, 0.8);
    fx.flights.push({ kind: 'ing', it, slot: i, x0, y0, x1: s.x + s.w / 2, y1: s.y + s.h / 2 - 3, t: 0, dur: 0.6 });
    return true;
  }
  function discard(slot) {
    if (state !== 'play' || !G) return;
    const it = G.shelf[slot]; if (!it || it.arriving) return;
    G.shelf[slot] = null; if (G.sel === slot) G.sel = -1;
    const s = LY.slots[slot], tr = LY.trash;
    fx.ghosts.push({ img: ingSpr(it.el, it.v), x: s.x + s.w / 2, y: s.y + s.h / 2, tx: tr.x + tr.w / 2, ty: tr.y + tr.h / 2, t: 0, dur: 0.3, mode: 'art' });
    AU.play('err');
  }
  function select(slot) {
    if (state !== 'play' || !G) return;
    if (slot < 0 || slot >= G.shelf.length) return;
    const it = G.shelf[slot];
    if (!it || it.arriving) { G.sel = -1; return; }
    G.sel = G.sel === slot ? -1 : slot; AU.play('pick');
    if (G.tut === 0 && G.sel >= 0) G.tut = 1;
  }

  // ---------- placing & bottling ----------
  function place(slot, x, y) {
    if (!canAct()) return false;
    const it = G.shelf[slot]; if (!it || it.arriving) return false;
    if (!inB(x, y, G.n) || G.board[y][x]) return false;
    G.shelf[slot] = null; if (G.sel === slot) G.sel = -1;
    const p = mkPiece(it.el, it.tier); p.vx = x; p.vy = y - 0.9; p.drop = 1;
    G.board[y][x] = p; G.stats.drops++;
    addInst(1.2); AU.play('drop');
    const c = cellCenter(x, y); burst(c[0], c[1] + 4, 6, ['#bff4ff', '#7fd4ff', '#ffffff'], 30, 0.4, 60);
    G.cascade = { t: 0.22, k: 0 };
    if (G.tut === 1) G.tut = 2;
    return true;
  }
  function orderFor(el, tier) {
    let best = null, br = 9;
    for (const o of G.orders) {
      if (o.state !== 'wait' && o.state !== 'enter') continue;
      if (!o.items.some(i => !i.done && i.el === el && i.tier === tier)) continue;
      const r = o.pat / o.max; if (r < br) { br = r; best = o; }
    }
    return best;
  }
  function bottle(x, y) {
    if (!canAct()) return false;
    const p = G.board[y] && G.board[y][x]; if (!p || p.el === 'S') return false;
    const c = cellCenter(x, y), o = orderFor(p.el, p.tier);
    if (o) {
      const item = o.items.find(i => !i.done && i.el === p.el && i.tier === p.tier); item.done = true; item.pending = true;
      const tp = orderItemPos(o, o.items.indexOf(item));
      fx.flights.push({ kind: 'bottle', el: p.el, tier: p.tier, x0: c[0], y0: c[1], x1: tp[0], y1: tp[1], t: 0, dur: 0.45, done: () => { item.pending = false; checkOrder(o); } });
    } else {
      const ri = G.rack.findIndex(r => !r);
      if (ri < 0) { floatText(t('pa_rackfull'), c[0], c[1] - 6, '#ff8a8a'); AU.play('err'); p.flash = 0.6; return false; }
      const slot = { el: p.el, tier: p.tier, arriving: true }; G.rack[ri] = slot;
      const rs = LY.rack[ri];
      fx.flights.push({ kind: 'bottle', el: p.el, tier: p.tier, x0: c[0], y0: c[1], x1: rs.x + rs.w / 2, y1: rs.y + rs.h / 2, t: 0, dur: 0.45, done: () => { slot.arriving = false; } });
    }
    G.board[y][x] = null;
    addInst(-(4 + p.tier)); AU.play('bottle');
    burst(c[0], c[1], 8, [A.PAL[p.el].l, '#ffffff'], 40, 0.4, 0);
    return true;
  }
  function rackTap(i) {
    if (state !== 'play' || !G || G.over) return;
    const r = G.rack[i]; if (!r || r.arriving) return;
    if (G.rackSel === i && G.rackSelT > 0) {   // sell
      G.rack[i] = null; G.rackSel = -1; const v = SELL[r.tier]; addCoins(v);
      const rs = LY.rack[i]; floatText(t('pa_sold') + ' +' + v, rs.x + rs.w / 2, rs.y - 2, '#ffd75e'); AU.play('sell');
    } else { G.rackSel = i; G.rackSelT = 2.2; const rs = LY.rack[i]; floatText(t('pa_sellq'), rs.x + rs.w / 2, rs.y - 2, '#ffffff', 1.4); AU.play('click'); }
  }
  function checkOrder(o) {
    if (o.state === 'done' || o.state === 'leave') return;
    if (!o.items.every(i => i.done && !i.pending)) return;
    o.state = 'done'; o.anim = 0; o.mood = 'h';
    G.streak++; G.stats.served++; if (o.legend) G.stats.legend++;
    const quick = o.pat / o.max > 0.5, mult = 1 + 0.1 * Math.min(G.streak - 1, 5);
    const v = Math.round(o.reward * (quick ? 1.25 : 1) * mult);
    addCoins(v);
    const r = LY.orders[o.slot];
    floatText('+' + v, r.x + r.w / 2, r.y + 4, '#ffd75e', 1.3, 8);
    if (quick) floatText(t('pa_tip'), r.x + r.w / 2, r.y + 14, '#80ed99', 1.1);
    if (G.streak >= 2) floatText(t('pa_streak', { n: G.streak }), r.x + r.w / 2, r.y + 22, '#ffb703', 1.1);
    for (let k = 0; k < 6; k++) fx.flights.push({ kind: 'coin', x0: r.x + 10 + Math.random() * 20, y0: r.y + 12, x1: LY.coinPos[0], y1: LY.coinPos[1], t: -k * 0.06, dur: 0.55 });
    AU.play(o.legend ? 'legend' : 'served'); setTimeout(() => AU.play('coin'), 350);
    if (G.tut === 3 || G.tut === 2) { G.tut = -1; S.tut = 1; save(); }
  }

  // ---------- orders ----------
  const CTYPES = A.CUSTOMER_TYPES;
  function spawnOrder() {
    const cfg = G.cfg, used = new Set(G.orders.map(o => o.slot));
    let slot = -1; for (let i = 0; i < cfg.maxO; i++) if (!used.has(i)) { slot = i; break; }
    if (slot < 0) return;
    let items, legend = false;
    if (cfg.legend && Math.random() < cfg.legend) { items = [{ el: pickOrderEl(), tier: 4 }]; legend = true; }
    else {
      const k = Math.random() < cfg.multi ? 2 : 1; items = [];
      for (let i = 0; i < k; i++) items.push({ el: pickOrderEl(), tier: k === 2 ? Math.min(3, pick(cfg.tiers)) : pick(cfg.tiers) });
    }
    const base = items.reduce((s, i) => s + VALUE[i.tier], 0), reward = Math.round(base * (items.length > 1 ? 1.25 : 1));
    const pat = items.reduce((s, i) => s + PATIENCE[i.tier], 0) * (items.length > 1 ? 0.8 : 1) * cfg.pat * (1 + 0.15 * S.up.patience);
    const type = legend ? 'wizard' : pick(CTYPES), seed = Math.floor(Math.random() * 1e6);
    G.orders.push({ id: G.oid++, slot, items, reward, pat, max: pat, state: 'enter', anim: 0, mood: 'n', type, seed, legend });
  }
  function updateOrders(dt) {
    for (let i = G.orders.length - 1; i >= 0; i--) {
      const o = G.orders[i]; o.anim += dt;
      if (o.state === 'enter' && o.anim > 0.45) o.state = 'wait';
      if (o.state === 'wait' || o.state === 'enter') {
        if (!o.items.some(it => it.pending)) o.pat -= dt;
        o.mood = o.pat / o.max < 0.3 ? 'a' : 'n';
        if (o.pat <= 0) {
          o.state = 'leave'; o.anim = 0; o.mood = 'a'; G.streak = 0; G.stats.missed++; AU.play('fail');
          const r = LY.orders[o.slot]; floatText(t('pa_missed'), r.x + r.w / 2, r.y + 8, '#ff8a8a', 1.3);
          o.items.forEach(it => { if (it.done) { /* already-paid items are lost */ } });
        }
      }
      if ((o.state === 'done' || o.state === 'leave') && o.anim > 0.9) G.orders.splice(i, 1);
    }
    const active = G.orders.filter(o => o.state === 'enter' || o.state === 'wait').length;
    G.orderT -= dt;
    if (active === 0) G.orderT = Math.min(G.orderT, 2.5);
    if (G.orderT <= 0 && G.orders.length < G.cfg.maxO) { spawnOrder(); G.orderT = rand(G.cfg.spawn[0], G.cfg.spawn[1]); }
    // the rack hands bottles to whoever wants them
    for (let i = 0; i < G.rack.length; i++) {
      const r = G.rack[i]; if (!r || r.arriving) continue;
      const o = orderFor(r.el, r.tier); if (!o) continue;
      const item = o.items.find(it => !it.done && it.el === r.el && it.tier === r.tier); item.done = true; item.pending = true;
      const rs = LY.rack[i], tp = orderItemPos(o, o.items.indexOf(item));
      fx.flights.push({ kind: 'bottle', el: r.el, tier: r.tier, x0: rs.x + rs.w / 2, y0: rs.y + rs.h / 2, x1: tp[0], y1: tp[1], t: 0, dur: 0.5, done: () => { item.pending = false; checkOrder(o); } });
      G.rack[i] = null; if (G.rackSel === i) G.rackSel = -1; AU.play('bottle');
    }
  }

  // ---------- cascade (one reaction per step, animated) ----------
  const stepDelay = (k) => 0.36 * Math.max(0.5, 1 - 0.07 * k);
  function cascadeStep() {
    const r = findReaction(G.board, G.n);
    if (!r) { endCascade(); return; }
    G.cascade.k++;
    const ev = applyCore(G.board, G.n, r);
    G.stats.ev[ev.type] = (G.stats.ev[ev.type] || 0) + 1; if (ev.spills) G.stats.spills += ev.spills.length;
    addInst(ev.inst); if (ev.coins) addCoins(ev.coins);
    showEvent(ev, G.cascade.k);
    G.cascade.t = stepDelay(G.cascade.k);
    if (G.inst >= 100) explode();
  }
  function endCascade() {
    const k = G.cascade.k; G.cascade = null;
    if (G.inst >= 100) { explode(); return; }
    G.stats.maxChain = Math.max(G.stats.maxChain, k);
    if (k >= 2) {
      let bonus = 0; for (let j = 2; j <= k; j++) bonus += j; addCoins(bonus);
      const P = LY.pot; floatText(t('pa_chain', { n: k }) + '  +' + bonus, P.x + P.w / 2, P.y + 10, '#ffb703', 1.6, 9);
    }
  }
  function showEvent(ev, k) {
    const cc = (c) => cellCenter(c[0], c[1]);
    if (ev.type === 'merge') {
      const [ax, ay] = ev.at, c = cc(ev.at); G.stats.merges++;
      for (const g of ev.consumed) { const f = cc(g.from); fx.ghosts.push({ img: essSpr(g.p.el, ev.jackpot ? 4 : ev.tier - 1 || 1), x: f[0], y: f[1], tx: c[0], ty: c[1], t: 0, dur: 0.24, mode: 'fly' }); }
      if (ev.jackpot) {
        burst(c[0], c[1], 60, ['#ff5d73', '#ffb703', '#80ed99', '#4cc9f0', '#c08cff', '#ffffff'], 120, 1.2, 40);
        fx.rings.push({ x: c[0], y: c[1], r: 2, vr: 140, life: 0.6, max: 0.6, c: '#ffffff' });
        floatText(t('pa_jackpot') + ' +150', c[0], c[1] - 10, '#ffffff', 2, 10); fx.flash = 0.6; fx.flashC = '#fff6c0'; AU.play('legend'); shake(4);
      } else {
        const p = ev.piece; p.pop = 1;
        fx.rings.push({ x: c[0], y: c[1], r: 3, vr: 50, life: 0.35, max: 0.35, c: A.PAL[p.el].l });
        burst(c[0], c[1], 10 + ev.tier * 4, [A.PAL[p.el].l, A.PAL[p.el].w, A.PAL[p.el].m], 50, 0.6, 20);
        floatText(ev.big ? t('pa_bigmerge') + ' +' + ev.coins : t('pa_merge'), c[0], c[1] - 9, A.PAL[p.el].l, 0.9);
        AU.play('merge', ev.tier);
        if (ev.tier === 4) { floatText(t('pa_legend'), c[0], c[1] - 18, '#ffd75e', 1.6, 9); AU.play('legend'); fx.rings.push({ x: c[0], y: c[1], r: 3, vr: 90, life: 0.5, max: 0.5, c: '#ffd75e' }); }
        if (G.tut === 2) G.tut = 3;
      }
    } else if (ev.type === 'void') {
      const c = cc(ev.at);
      for (const g of ev.eaten) { const f = cc(g.from); fx.ghosts.push({ img: essSpr(g.p.el, g.p.tier), x: f[0], y: f[1], tx: c[0], ty: c[1], t: 0, dur: 0.34, mode: 'suck' }); }
      fx.ghosts.push({ img: essSpr('V', ev.v.tier), x: c[0], y: c[1], tx: c[0], ty: c[1], t: -0.2, dur: 0.3, mode: 'suck' });
      fx.rings.push({ x: c[0], y: c[1], r: 20, vr: -60, life: 0.32, max: 0.32, c: '#c08cff' });
      for (let i = 0; i < 24; i++) { const a = Math.random() * 6.28, d = rand(10, 22); fx.parts.push({ x: c[0] + Math.cos(a) * d, y: c[1] + Math.sin(a) * d, vx: -Math.cos(a) * d * 3, vy: -Math.sin(a) * d * 3, life: 0.33, max: 0.33, c: pick(['#7b3fe0', '#c08cff', '#12052a']), s: 1, g: 0 }); }
      floatText(t('pa_void'), c[0], c[1] - 9, '#c08cff', 0.9); AU.play('void');
    } else if (ev.type === 'steam') {
      for (const g of ev.destroyed) { const f = cc(g.from); burst(f[0], f[1], 10, [A.PAL[g.p.el].l, A.PAL[g.p.el].m], 40, 0.4, 0); }
      for (const s of ev.steam) { const c = cc(s); for (let i = 0; i < 16; i++) fx.parts.push({ x: c[0] + rand(-5, 5), y: c[1] + rand(-5, 5), vx: rand(-30, 30), vy: rand(-40, -10), life: rand(0.5, 1), max: 1, c: pick(['#ffffff', '#e6eef8', '#c8d4e4']), s: pick([2, 3]), g: -10 }); fx.rings.push({ x: c[0], y: c[1], r: 3, vr: 60, life: 0.3, max: 0.3, c: '#ffffff' }); }
      if (ev.survivor) ev.survivor.pop = 1;
      for (const m of ev.moves) m.p.pop = 0.5;
      for (const sp of ev.spills) {
        const f = cc(sp.from);
        fx.ghosts.push({ img: essSpr(sp.p.el, sp.p.tier), x: f[0], y: f[1], vx: sp.dir[0] * 70 + rand(-10, 10), vy: sp.dir[1] * 70 - 60, t: 0, dur: 0.9, mode: 'spill' });
        floatText(t('pa_spill'), f[0] + sp.dir[0] * 14, f[1] + sp.dir[1] * 14 - 4, '#ff8a8a', 0.9); AU.play('spill');
      }
      const c0 = cc(ev.steam[0]); floatText(t('pa_steam'), c0[0], c0[1] - 9, '#ffffff', 0.9);
      AU.play('steam'); shake(2);
    } else if (ev.type === 'zap') {
      for (const g of ev.sparks) { const f = cc(g.from); burst(f[0], f[1], 10, ['#fff27a', '#ffffff', '#ffd21f'], 60, 0.4, 0); }
      for (const [x, y] of ev.hits) { const p = G.board[y][x]; if (p) { p.flash = 1; p.pop = 0.8; } }
      ev.links.forEach(([a, b], i) => fx.zaps.push({ a: cc(a), b: cc(b), life: 0.35, max: 0.35, delay: i * 0.035 }));
      const c0 = cc(ev.sparks[0].from); floatText(ev.over ? t('pa_overload') : t('pa_zap'), c0[0], c0[1] - 9, '#fff27a', 0.9);
      AU.play('zap'); shake(2); fx.flash = 0.15; fx.flashC = '#fff8c0';
    }
  }
  function explode() {
    const n = G.n, P = LY.pot;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = G.board[y][x]; if (!p) continue; const c = cellCenter(x, y), a = Math.atan2(c[1] - (P.y + P.h / 2), c[0] - (P.x + P.w / 2));
      fx.ghosts.push({ img: essSpr(p.el, p.tier), x: c[0], y: c[1], vx: Math.cos(a) * rand(80, 160), vy: Math.sin(a) * rand(80, 160) - 80, t: 0, dur: 1.1, mode: 'spill' });
      G.board[y][x] = null;
    }
    burst(P.x + P.w / 2, P.y + P.h / 2, 90, ['#ff4d1a', '#ffb703', '#ffe08a', '#3a3036', '#ffffff'], 170, 1.3, 60);
    for (let i = 0; i < 20; i++) fx.parts.push({ x: P.x + P.w / 2 + rand(-20, 20), y: P.y + P.h / 2 + rand(-20, 20), vx: rand(-30, 30), vy: rand(-50, -20), life: rand(1, 2), max: 2, c: '#3a3438', s: 4, g: -8 });
    fx.rings.push({ x: P.x + P.w / 2, y: P.y + P.h / 2, r: 4, vr: 220, life: 0.5, max: 0.5, c: '#ffe08a' });
    fx.flash = 1; fx.flashC = '#ffe6c0'; shake(10); AU.play('boom');
    floatText(t('pa_boom'), P.x + P.w / 2, P.y + P.h / 2 - 6, '#ff5d3a', 1.8, 14);
    G.hearts--; G.stats.booms++; G.inst = 35; G.cascade = null; G.streak = 0;
    for (let i = 0; i < G.cfg.debris; i++) dropSlag(false);
    if (G.hearts <= 0) { G.overT = 1.6; G.overReason = 'blown'; }
  }

  // ---------- per-frame game update ----------
  function gameUpdate(dt) {
    G.t += dt;
    if (G.overT >= 0) { G.overT -= dt; if (G.overT < 0) finish(); return; }
    // harvest from the window
    if (scene.tunnel <= 0) {
      G.harvestT += dt;
      if (G.harvestT >= harvestIv()) { if (spawnHarvest()) G.harvestT = 0; else G.harvestT = harvestIv(); }
    }
    // wisps
    if (G.cfg.wisp) {
      if (!G.wisp) { G.wispT -= dt; if (G.wispT <= 0 && scene.tunnel <= 0) { const W = LY.win; G.wisp = { el: pickHarvestEl(), x: W.x + W.w + 6, y: W.y + W.h * rand(0.25, 0.6), t: 0, tier: G.mode === 'endless' ? (G.seg.k >= 4 && Math.random() < 0.35 ? 3 : 2) : (G.li >= 7 && Math.random() < 0.35 ? 3 : 2) }; G.wispT = rand(16, 26); } }
      else { const w = G.wisp, W = LY.win; w.t += dt; w.x -= dt * Math.max(28, W.w / 6.5); if (w.x < W.x - 8 || scene.tunnel > 0) G.wisp = null; }
    }
    updateOrders(dt);
    if (G.cascade) { G.cascade.t -= dt; if (G.cascade.t <= 0) cascadeStep(); }
    else G.inst = Math.max(0, G.inst - (0.22 + 0.08 * S.up.cool) * dt);
    if (G.overT >= 0) return;
    if (G.rackSelT > 0) { G.rackSelT -= dt; if (G.rackSelT <= 0) G.rackSel = -1; }
    G.instShow += (G.inst - G.instShow) * Math.min(1, dt * 8);
    if (G.inst >= 75) { G.warnT -= dt; if (G.warnT <= 0) { AU.play('alarm'); G.warnT = 1; if (G.inst >= 85) floatText(t('pa_warn'), LY.pot.x + LY.pot.w / 2, LY.pot.y - 2, '#ff6a5a', 0.9); } } else G.warnT = 0;
    // train clack
    G.rockT -= dt; if (G.rockT <= 0) { G.rockT = 1.15; G.bump = 0.09; } if (G.bump > 0) G.bump -= dt;
    // journey end / stations
    if (G.mode === 'level') { if (G.t >= G.cfg.time && !G.cascade) finish(); }
    else {
      G.seg.t += dt;
      if (G.seg.t >= SEG_LEN && !G.cascade) {
        const ok = G.seg.coins >= G.seg.quota, P = LY.pot;
        if (ok) { const b = 20 + 10 * G.seg.k; addCoins(b); floatText(t('pa_e_passed') + ' +' + b, P.x + P.w / 2, P.y + P.h / 2, '#80ed99', 2, 10); AU.play('win'); }
        else { G.hearts--; floatText(t('pa_e_missed'), P.x + P.w / 2, P.y + P.h / 2, '#ff8a8a', 2.2, 8); AU.play('lose'); shake(4); }
        G.seg.k++; G.seg.t = 0; G.seg.coins = 0; G.seg.quota = quotaFor(G.seg.k); G.cfg = endlessCfg(G.seg.k); scene.fast = G.cfg.fast;
        if (G.hearts <= 0) { G.overT = 1.2; G.overReason = 'quota'; }
      }
    }
  }

  // ---------- finishing ----------
  function finish() {
    if (G.over) return; G.over = true;
    const res = { mode: G.mode, li: G.li, coins: G.coins, stats: G.stats };
    if (G.mode === 'level') {
      const L = G.cfg, win = G.hearts > 0 && G.coins >= L.goal;
      const stars = !win ? 0 : G.coins >= L.goal * 2 ? 3 : G.coins >= L.goal * 1.5 ? 2 : 1;
      const rec = S.lv[G.li + 1] || { stars: 0, best: 0 };
      res.newBest = G.coins > rec.best; res.prevStars = rec.stars;
      rec.best = Math.max(rec.best, G.coins); if (win) rec.stars = Math.max(rec.stars, stars);
      S.lv[G.li + 1] = rec; if (win) S.unlocked = Math.max(S.unlocked, Math.min(LEVELS.length, G.li + 2));
      res.win = win; res.stars = stars; res.blown = G.hearts <= 0;
      res.bank = win ? G.coins : Math.floor(G.coins * 0.5);
    } else {
      res.stations = G.seg.k; res.newBest = G.coins > S.endless.best;
      S.endless.best = Math.max(S.endless.best, G.coins); S.endless.stations = Math.max(S.endless.stations, G.seg.k);
      res.bank = Math.floor(G.coins * 0.5); res.win = false;
    }
    S.bank += res.bank; save();
    AU.play(res.win ? 'win' : 'lose');
    setTimeout(() => showResult(res), 650);
  }

  // =====================================================================
  // layout (art-pixel coordinates on the low-res canvas)
  // =====================================================================
  const canvas = $('c'), ctx = canvas.getContext('2d');
  const low = A.mk(320, 200); let X = low.getContext('2d');
  let LY = { px: 1, LW: 320, LH: 200 }, DPR = 1;
  let bcache = {}, interior = null;
  function resize() {
    DPR = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(innerWidth * DPR)); canvas.height = Math.max(1, Math.floor(innerHeight * DPR));
    layout();
  }
  function layout() {
    const cw = canvas.width, ch = canvas.height, portrait = cw < ch * 0.98;
    const minW = portrait ? 212 : 340, minH = portrait ? 330 : 236;
    const px = Math.max(1, Math.floor(Math.min(cw / minW, ch / minH)));
    const LW = Math.floor(cw / px), LH = Math.floor(ch / px), n = G ? G.n : 5;
    const L = { px, LW, LH, portrait, n };
    L.top = { x: 0, y: 0, w: LW, h: 14 };
    let cell = 20, gap = 2, ps = 1;
    const potOf = () => n * cell + (n - 1) * gap + 12;
    const sillH = 28, nslots = G ? G.shelf.length : 5, nrack = G ? G.rack.length : 3;
    // big 2x pieces when there is room
    cell = 34; ps = 2;
    const fits = () => portrait ? potOf() <= LW - 8 && LH - (14 + 2 + sillH + 4 + 56 + 6 + 8 + 8 + 6 + 26 + 14) - potOf() >= 64
      : LH - 14 - 2 - 60 - sillH - 6 >= potOf() && LW - potOf() >= 230;
    if (!fits()) { cell = 20; ps = 1; }
    L.ps = ps;
    if (!portrait) {
      while (ps === 1 && cell > 16 && LH - 14 - 2 - 40 - sillH - 6 < potOf()) { cell -= 2; if (cell <= 16) gap = 1; }
      const pot = potOf();
      let winH = clamp(LH - 14 - 2 - sillH - 6 - pot - 4, 40, Math.round(LH * 0.36));
      L.win = { x: 4, y: 16, w: LW - 8, h: winH };
      L.sill = { x: 0, y: L.win.y + winH, w: LW, h: sillH };
      const iy = L.sill.y + sillH + 3, ih = LH - iy - 3;
      L.pot = { x: Math.round((LW - pot) / 2), y: iy + Math.max(0, Math.round((ih - pot) / 2)), w: pot, h: pot };
      L.left = { x: 6, y: iy, w: L.pot.x - 12, h: ih };
      L.right = { x: L.pot.x + pot + 8, y: iy, w: LW - (L.pot.x + pot + 8) - 6, h: ih };
      const och = Math.min(52, Math.floor((ih - 6) / 3)), ow = Math.min(L.left.w, 124);
      L.orders = [0, 1, 2].map(i => ({ x: L.left.x + L.left.w - ow, y: iy + i * (och + 3), w: ow, h: och }));
      L.gauge = { x: L.right.x, y: iy + 10, w: 12, h: ih - 14, vertical: true };
      const rx = L.right.x + 20, rw = Math.min(L.right.w - 22, 120), cols = Math.max(1, Math.floor(rw / 22));
      L.rack = Array.from({ length: nrack }, (_, i) => ({ x: rx + (i % cols) * 22, y: iy + 14 + Math.floor(i / cols) * 28, w: 20, h: 24 }));
      L.rackLabel = { x: rx, y: iy + 6 };
      L.info = { x: rx, y: L.rack[nrack - 1].y + 34, w: rw };
    } else {
      const ordH = 56, gaugeH = 8, rackH = 26;
      const pot = potOf(), fixed = 14 + 2 + sillH + 4 + ordH + 6 + gaugeH + 8 + pot + 6 + rackH + 14;
      const winH = clamp(LH - fixed, 50, Math.round(LH * 0.3)), extra = Math.max(0, LH - fixed - winH), g = Math.floor(extra / 5);
      let y = 16;
      L.win = { x: 4, y, w: LW - 8, h: winH }; y += winH;
      L.sill = { x: 0, y, w: LW, h: sillH }; y += sillH + 4 + g;
      const ow = Math.floor((LW - 8 - 6) / 3);
      L.orders = [0, 1, 2].map(i => ({ x: 4 + i * (ow + 3), y, w: ow, h: ordH })); y += ordH + 6 + g;
      L.gauge = { x: 22, y, w: LW - 44, h: gaugeH, vertical: false }; y += gaugeH + 8 + g;
      L.pot = { x: Math.round((LW - pot) / 2), y, w: pot, h: pot }; y += pot + 6 + g;
      const rw = nrack * 22 - 2, rx = Math.round((LW - rw) / 2) + 10;
      L.rack = Array.from({ length: nrack }, (_, i) => ({ x: rx + i * 22, y, w: 20, h: 24 }));
      L.rackLabel = { x: rx - 4, y: y + 12 };
      L.info = { x: 4, y: y + 31, w: LW - 8 };
    }
    L.grid = { x: L.pot.x + 6, y: L.pot.y + 6, cell, gap, n };
    const sw = 24, tot = (nslots + 1) * (sw + 2) - 2, sx = Math.round((LW - tot) / 2);
    L.slots = Array.from({ length: nslots }, (_, i) => ({ x: sx + i * (sw + 2), y: L.sill.y + 3, w: sw, h: 22 }));
    L.trash = { x: sx + nslots * (sw + 2), y: L.sill.y + 3, w: sw, h: 22 };
    L.pauseBtn = { x: LW - 15, y: 1, w: 14, h: 12 };
    L.coinPos = [LW - 50, 7];
    const changed = !LY.win || LY.win.w !== L.win.w || LY.win.h !== L.win.h;
    LY = L;
    if (low.width !== LW || low.height !== LH) { low.width = LW; low.height = LH; X = low.getContext('2d'); }
    if (changed) bcache = {};
    interior = buildInterior();
  }
  const cellCenter = (x, y) => { const g = LY.grid; return [g.x + x * (g.cell + g.gap) + g.cell / 2, g.y + y * (g.cell + g.gap) + g.cell / 2]; };
  const cellAt = (ax, ay) => { const g = LY.grid, s = g.cell + g.gap; const x = Math.floor((ax - g.x + g.gap / 2) / s), y = Math.floor((ay - g.y + g.gap / 2) / s); return inB(x, y, g.n) ? [x, y] : null; };
  const inR = (r, x, y) => r && x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  function orderItemPos(o, i) { const r = LY.orders[o.slot], b = bubbleRect(r); return [b.x + 4 + i * 18 + 8, b.y + 3 + 8]; }
  function bubbleRect(r) { const k = custScale(r), x = r.x + 4 + 12 * k; return { x, y: r.y + 1, w: r.x + r.w - x, h: Math.min(r.h - 8, 38) }; }

  // static interior: wall planks, sill, aisle
  function buildInterior() {
    const c = A.mk(LY.LW, LY.LH), x = c.getContext('2d'), R = A.rnd(5), L = LY;
    x.fillStyle = '#3e2618'; x.fillRect(0, 0, L.LW, L.LH);
    for (let i = 0; i < L.LW; i += 12) {
      x.fillStyle = (i / 12) % 2 ? '#4a2e1d' : '#45291a'; x.fillRect(i, 0, 12, L.LH);
      x.fillStyle = '#2e1b10'; x.fillRect(i, 0, 1, L.LH);
      x.fillStyle = '#56371f'; x.fillRect(i + 1, 0, 1, L.LH);
      for (let k = 0; k < L.LH / 6; k++) { x.fillStyle = 'rgba(30,16,8,.35)'; x.fillRect(i + 2 + Math.floor(R() * 9), Math.floor(R() * L.LH), 1, 2 + Math.floor(R() * 4)); }
    }
    // wainscot rail
    const ry = L.sill.y + L.sill.h + 1; x.fillStyle = '#7a4f24'; x.fillRect(0, ry, L.LW, 2); x.fillStyle = '#c08a1e'; x.fillRect(0, ry, L.LW, 1);
    // floor strip
    x.fillStyle = '#2a1a10'; x.fillRect(0, L.LH - 4, L.LW, 4); x.fillStyle = '#4a3020'; x.fillRect(0, L.LH - 4, L.LW, 1);
    // top beam
    x.fillStyle = '#24160e'; x.fillRect(0, 0, L.LW, 15); x.fillStyle = '#c08a1e'; x.fillRect(0, 14, L.LW, 1); x.fillStyle = '#5a3a20'; x.fillRect(0, 13, L.LW, 1);
    // window frame
    const W = L.win; x.fillStyle = '#2a170c'; x.fillRect(W.x - 3, W.y - 2, W.w + 6, W.h + 4); x.fillStyle = '#6b4423'; x.fillRect(W.x - 2, W.y - 1, W.w + 4, W.h + 2); x.fillStyle = '#8a5a2e'; x.fillRect(W.x - 2, W.y - 1, W.w + 4, 1);
    // sill
    const Si = L.sill; x.fillStyle = '#4a2c16'; x.fillRect(0, Si.y, L.LW, Si.h); x.fillStyle = '#b07a44'; x.fillRect(0, Si.y, L.LW, 3); x.fillStyle = '#d29a5a'; x.fillRect(0, Si.y, L.LW, 1);
    x.fillStyle = '#8a5a2e'; x.fillRect(0, Si.y + 3, L.LW, Si.h - 6); x.fillStyle = '#2a170c'; x.fillRect(0, Si.y + Si.h - 3, L.LW, 3);
    for (let i = 0; i < L.LW; i += 24) { x.fillStyle = '#7a4c26'; x.fillRect(i, Si.y + 3, 1, Si.h - 6); }
    // brass rails behind the passengers
    for (const r of L.orders) { const yy = r.y + r.h - 3; x.fillStyle = '#2e1b10'; x.fillRect(r.x - 2, yy, r.w + 4, 2); x.fillStyle = '#6b4423'; x.fillRect(r.x - 2, yy, r.w + 4, 1); }
    // rack shelf
    for (const s of L.rack) { x.fillStyle = '#6b4423'; x.fillRect(s.x - 1, s.y + s.h - 3, s.w + 2, 3); x.fillStyle = '#9a6a3a'; x.fillRect(s.x - 1, s.y + s.h - 3, s.w + 2, 1); }
    return c;
  }

  // =====================================================================
  // effects helpers
  // =====================================================================
  function burst(x, y, n, cols, sp, life, g) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = rand(0.3, 1) * sp; fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, life: rand(life * 0.5, life), max: life, c: pick(cols), s: Math.random() < 0.3 ? 2 : 1, g: g || 0 }); }
  }
  function floatText(s, x, y, c, life, size) { fx.floats.push({ s, x, y, c: c || '#fff', life: life || 1, max: life || 1, size: size || 7 }); }
  function shake(v) { fx.shake = Math.max(fx.shake, v); }
  function fxUpdate(dt) {
    for (let i = fx.parts.length - 1; i >= 0; i--) { const p = fx.parts[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.vx *= 1 - dt * 1.5; if (p.life <= 0) fx.parts.splice(i, 1); }
    for (let i = fx.ghosts.length - 1; i >= 0; i--) { const g = fx.ghosts[i]; g.t += dt; if (g.mode === 'spill') { g.x += g.vx * dt; g.y += g.vy * dt; g.vy += 300 * dt; } if (g.t >= g.dur) fx.ghosts.splice(i, 1); }
    for (let i = fx.rings.length - 1; i >= 0; i--) { const r = fx.rings[i]; r.life -= dt; r.r = Math.max(0, r.r + r.vr * dt); if (r.life <= 0) fx.rings.splice(i, 1); }
    for (let i = fx.zaps.length - 1; i >= 0; i--) { const z = fx.zaps[i]; if (z.delay > 0) z.delay -= dt; else z.life -= dt; if (z.life <= 0) fx.zaps.splice(i, 1); }
    for (let i = fx.floats.length - 1; i >= 0; i--) { const f = fx.floats[i]; f.life -= dt; f.y -= dt * 12; if (f.life <= 0) fx.floats.splice(i, 1); }
    for (let i = fx.flights.length - 1; i >= 0; i--) {
      const f = fx.flights[i]; f.t += dt;
      if (f.t >= f.dur) {
        fx.flights.splice(i, 1);
        if (f.kind === 'ing') { f.it.arriving = false; AU.play('harvest'); burst(f.x1, f.y1 + 4, 4, ['#d29a5a', '#ffffff'], 20, 0.3, 40); }
        if (f.done) f.done();
      }
    }
    fx.shake = Math.max(0, fx.shake - dt * 18); fx.flash = Math.max(0, fx.flash - dt * 2.5);
    if (G) {
      const n = G.n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const p = G.board[y][x]; if (!p) continue; const k = Math.min(1, dt * 14);
        p.vx += (x - p.vx) * k; p.vy += (y - p.vy) * (p.drop ? Math.min(1, dt * 18) : k);
        if (p.drop && Math.abs(p.vy - y) < 0.05) p.drop = 0;
        p.pop = Math.max(0, p.pop - dt * 4); p.flash = Math.max(0, p.flash - dt * 3);
      }
    }
  }

  // =====================================================================
  // rendering
  // =====================================================================
  let TXT = [];
  const FONT = '"Segoe UI", Tahoma, Arial, sans-serif';
  const R = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(Math.round(x), Math.round(y), w, h); };
  const D = (img, x, y, a) => { if (a !== undefined && a < 1) { X.globalAlpha = Math.max(0, a); X.drawImage(img, Math.round(x), Math.round(y)); X.globalAlpha = 1; } else X.drawImage(img, Math.round(x), Math.round(y)); };
  const DS = (img, cx, cy, s, a) => { const w = Math.max(1, Math.round(img.width * s)), h = Math.max(1, Math.round(img.height * s)); X.globalAlpha = a === undefined ? 1 : Math.max(0, a); X.drawImage(img, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h); X.globalAlpha = 1; };
  const txt = (s, x, y, size, color, align, opt) => TXT.push({ s: String(s), x, y, size: size || 7, c: color || '#fff', a: align || 'center', o: opt || {} });
  const fontPx = (size) => Math.max(9, size * LY.px * (getLang() === 'ar' ? 1.08 : 1));
  const tw = (s, size, w) => { ctx.font = `${w || 700} ${fontPx(size).toFixed(1)}px ${FONT}`; return ctx.measureText(String(s)).width / LY.px; };
  function outline(x, y, w, h, c) { R(x, y, w, 1, c); R(x, y + h - 1, w, 1, c); R(x, y, 1, h, c); R(x + w - 1, y, 1, h, c); }
  function box(x, y, w, h, fill, edge, hi) { R(x + 1, y, w - 2, h, edge); R(x, y + 1, w, h - 2, edge); R(x + 1, y + 1, w - 2, h - 2, fill); if (hi) R(x + 2, y + 1, w - 4, 1, hi); }

  function drawWindow() {
    const W = LY.win, bump = G && G.bump > 0 && state === 'play' ? 1 : 0;
    X.save(); X.beginPath(); X.rect(W.x, W.y, W.w, W.h); X.clip();
    if (scene.tunnel > 0) drawTunnel(W);
    else {
      const b = bcache[scene.cur] || (bcache[scene.cur] = A.buildBiome(scene.cur, W.w, W.h));
      X.drawImage(b.sky, W.x, W.y);
      if (scene.cur === 'aurora') drawAurora(W);
      const layer = (img, sp) => { const off = Math.floor(scene.dist * sp) % img.width; for (let x = -off; x < W.w; x += img.width) X.drawImage(img, W.x + x, W.y + bump); };
      layer(b.far, 0.12); layer(b.mid, 0.45); layer(b.gnd, 1);
      // weather
      for (const p of scene.wx) {
        const a = p.k === 'sparkle' || p.k === 'aurora' ? Math.sin((p.life) * 6) * 0.5 + 0.5 : p.k === 'fireflies' ? (Math.sin(clock * 6 + p.x) > 0 ? 1 : 0.3) : 1;
        X.globalAlpha = a; if (p.k === 'rain') R(W.x + p.x, W.y + p.y, 1, 3, p.c); else R(W.x + p.x, W.y + p.y, 1, 1, p.c); X.globalAlpha = 1;
      }
      if (scene.cur === 'storm' && scene.flashT > 0 && scene.bolt) {
        X.globalAlpha = scene.flashT * 1.6; R(W.x, W.y, W.w, W.h, '#e8ecff'); X.globalAlpha = 1;
        const rr = A.rnd(Math.floor(scene.bolt.seed)); let bx = W.x + scene.bolt.x, by = W.y;
        while (by < W.y + W.h * 0.7) { const nx = bx + Math.round((rr() - 0.5) * 6); R(Math.min(bx, nx), by, Math.abs(nx - bx) + 1, 1, '#ffffff'); R(nx, by, 1, 3, '#ffffff'); bx = nx; by += 3; }
      }
      // telegraph poles
      const pole = 150, off = Math.floor(scene.dist * 2.2) % pole;
      for (let x = -off; x < W.w + 10; x += pole) { R(W.x + x, W.y + 2, 3, W.h, '#1a100a'); R(W.x + x - 4, W.y + 6, 11, 2, '#1a100a'); R(W.x + x + 1, W.y + 2, 1, W.h, '#3a2416'); }
      X.globalAlpha = 0.5; for (let x = -off; x < W.w; x += pole) { const x2 = x + pole; for (let i = 0; i < pole; i += 2) { const sag = Math.sin(i / pole * Math.PI) * 5; R(W.x + x + i, W.y + 7 + sag, 2, 1, '#1a100a'); } } X.globalAlpha = 1;
    }
    // wisp
    if (G && G.wisp && state !== 'title') {
      const w = G.wisp, y = w.y + Math.sin(w.t * 3) * 3, c = A.PAL[w.el];
      for (let i = 0; i < 3; i++) R(w.x + 4 + i * 3 + Math.sin(w.t * 9 + i) * 1, y + Math.cos(w.t * 7 + i) * 2, 1, 1, c.l);
      X.globalAlpha = 0.35 + Math.sin(clock * 10) * 0.15; for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) if (i * i + j * j <= 25 && (i + j) % 2 === 0) R(w.x + i, y + j, 1, 1, c.glow); X.globalAlpha = 1;
      DS(essSpr(w.el, w.tier), w.x, y, 0.75);
    }
    // glass glare
    X.globalAlpha = 0.07; for (let k = 0; k < W.w; k += 90) for (let i = 0; i < W.h; i++) { R(W.x + k + 20 + i * 0.6, W.y + i, 3, 1, '#ffffff'); R(W.x + k + 30 + i * 0.6, W.y + i, 1, 1, '#ffffff'); } X.globalAlpha = 1;
    X.restore();
    // pane pillars
    const panes = Math.max(2, Math.round(W.w / 130));
    for (let i = 1; i < panes; i++) { const x = Math.round(W.x + W.w * i / panes) - 2; R(x - 1, W.y - 1, 6, W.h + 2, '#2a170c'); R(x, W.y - 1, 4, W.h + 2, '#6b4423'); R(x, W.y - 1, 1, W.h + 2, '#8a5a2e'); }
    // curtains
    for (const side of [0, 1]) { const cx = side ? W.x + W.w - 7 : W.x - 1; for (let i = 0; i < 8; i++) R(cx + i, W.y - 1, 1, Math.round(W.h * 0.55 + Math.sin(i * 1.3) * 3), i % 3 === 0 ? '#5a1420' : '#8a2030'); R(cx, W.y + Math.round(W.h * 0.42), 8, 2, '#c08a1e'); }
    // biome plaque + forecast
    if (state === 'play' || state === 'paused') {
      const name = scene.tunnel > 0 ? t('pa_tunnel') : t('pa_b_' + scene.cur), pw = Math.min(W.w - 30, Math.max(70, Math.round(W.w * 0.36))), px = Math.round(W.x + (W.w - pw) / 2);
      box(px, W.y - 2, pw, 11, '#6b4423', '#24160e', '#9a6a3a'); txt(name, px + pw / 2, W.y + 3.5, 6.2, '#ffe9b0', 'center', { maxW: pw - 6 });
      R(px + 6, W.y - 6, 1, 4, '#c08a1e'); R(px + pw - 7, W.y - 6, 1, 4, '#c08a1e');
      // current element mix (bottom-left) and next biome (bottom-right)
      const cur = A.BIOMES[scene.cur].els, els = G.cfg.els.split('');
      let tot = 0; for (const e of els) tot += cur[e] || 0;
      const fw = els.length * 9 + 4; box(W.x + 3, W.y + W.h - 15, fw, 13, 'rgba(10,8,16,.72)', 'rgba(0,0,0,.6)');
      els.forEach((e, i) => { const f = tot ? (cur[e] || 0) / tot : 0, hgt = Math.max(1, Math.round(f * 6)); D(miniSpr(e), W.x + 5 + i * 9, W.y + W.h - 13); R(W.x + 5 + i * 9, W.y + W.h - 4 - hgt + 2, 5, 1, '#000'); R(W.x + 6 + i * 9 + 4, W.y + W.h - 3 - hgt, 2, hgt, A.PAL[e].l); });
      if (scene.list.length > 1) {
        const nx = A.BIOMES[scene.next].els, tl = scene.tunnel > 0 ? 0 : scene.bT + TUN / 2;
        const top2 = els.slice().sort((a, b) => (nx[b] || 0) - (nx[a] || 0)).filter(e => (nx[e] || 0) > 0).slice(0, 2);
        const lw = Math.min(Math.round(W.w * 0.55), 150), lx = W.x + W.w - lw - 3, ly = W.y + W.h - 15;
        box(lx, ly, lw, 13, 'rgba(10,8,16,.72)', 'rgba(0,0,0,.6)');
        top2.forEach((e, i) => D(miniSpr(e), lx + lw - 8 - i * 7, ly + 4));
        const soon = tl < 8 && scene.tunnel <= 0 && Math.floor(clock * 3) % 2;
        txt(t('pa_next') + ': ' + t('pa_b_' + scene.next) + (scene.tunnel > 0 ? '' : '  ' + fmtT(tl)), lx + 4, ly + 6.5, 5.6, soon ? '#ffb703' : '#e8ecff', 'left', { maxW: lw - 22 });
      }
    }
  }
  function drawTunnel(W) {
    R(W.x, W.y, W.w, W.h, '#0e0a0c');
    const f = 1 - Math.abs(scene.tunnel / TUN * 2 - 1);  // dark in the middle
    for (let j = 0; j < W.h; j += 3) { X.globalAlpha = 0.25; R(W.x, W.y + j, W.w, 1, '#2a2024'); } X.globalAlpha = 1;
    const sp = 260, off = Math.floor(scene.dist * 5) % sp;
    for (let x = -off; x < W.w; x += sp / 2) { R(W.x + x, W.y + Math.round(W.h * 0.35), 10, 2, '#ffcf6a'); X.globalAlpha = 0.3; R(W.x + x - 4, W.y + Math.round(W.h * 0.35) - 2, 18, 6, '#ffcf6a'); X.globalAlpha = 1; }
    X.globalAlpha = 1 - f; R(W.x, W.y, W.w, W.h, '#000'); X.globalAlpha = 1;
    // fade from/to scenery at the ends
    const edge = Math.min(scene.tunnel, TUN - scene.tunnel) / 0.25;
    if (edge < 1) { const b = bcache[scene.cur]; if (b) { X.globalAlpha = 1 - edge; X.drawImage(b.sky, W.x, W.y); X.globalAlpha = 1; } }
  }
  function drawAurora(W) {
    for (let band = 0; band < 3; band++) {
      const col = ['#4cf0a0', '#4cc9f0', '#a86bff'][band];
      for (let i = 0; i < W.w; i += 1) {
        const y = W.h * (0.12 + band * 0.08) + Math.sin(i * 0.03 + clock * 0.6 + band) * 6 + Math.sin(i * 0.011 - clock * 0.3) * 5;
        X.globalAlpha = 0.18 + 0.12 * Math.sin(i * 0.05 + clock + band); R(W.x + i, W.y + y, 1, 6 + band * 2, col);
      }
    }
    X.globalAlpha = 1;
  }
  function drawLamps() {
    const W = LY.win, panes = Math.max(2, Math.round(W.w / 130)), sway = Math.sin(clock * 1.7) * 0.22 + (G && G.bump > 0 ? 0.08 : 0);
    for (let i = 1; i < panes; i++) {
      const x0 = Math.round(W.x + W.w * i / panes), len = Math.min(18, Math.round(W.h * 0.3)), ex = x0 + Math.round(Math.sin(sway) * len), ey = 14 + Math.round(Math.cos(sway) * len);
      for (let k = 0; k <= len; k += 1) R(x0 + Math.round(Math.sin(sway) * k), 14 + Math.round(Math.cos(sway) * k), 1, 1, '#1a100a');
      R(ex - 3, ey, 7, 2, '#3a2416'); R(ex - 3, ey + 2, 7, 6, '#c08a1e'); R(ex - 2, ey + 3, 5, 4, '#ffe08a'); R(ex - 1, ey + 3, 3, 3, '#fff6d0'); R(ex - 3, ey + 8, 7, 1, '#3a2416');
      X.globalAlpha = 0.12 + Math.sin(clock * 8 + i) * 0.03; for (let j = -8; j <= 8; j++) for (let k = -8; k <= 8; k++) if (j * j + k * k < 64 && (j + k) % 2 === 0) R(ex + k, ey + 5 + j, 1, 1, '#ffe08a'); X.globalAlpha = 1;
    }
  }
  function drawSill() {
    const sel = G ? G.sel : -1;
    LY.slots.forEach((s, i) => {
      const it = G ? G.shelf[i] : null, on = i === sel;
      R(s.x + 2, s.y + s.h - 7, s.w - 4, 5, on ? '#ffb703' : '#6b3a1e'); R(s.x + 1, s.y + s.h - 8, s.w - 2, 2, on ? '#ffd75e' : '#a0583a'); R(s.x + 4, s.y + s.h - 2, s.w - 8, 1, '#2a170c');
      if (it && !it.arriving && !(G.drag && G.drag.active && G.drag.slot === i)) {
        const bob = on ? Math.round(Math.sin(clock * 6) * 1) - 3 : 0;
        if (it.tier > 1) { X.globalAlpha = 0.45 + Math.sin(clock * 5) * 0.2; outline(s.x + 4, s.y + 1 + bob, 16, 15, '#ffd75e'); X.globalAlpha = 1; }
        D(ingSpr(it.el, it.v), s.x + 6, s.y + 3 + bob);
        for (let k = 1; k < it.tier; k++) R(s.x + 3 + k * 3, s.y + 2 + bob, 2, 2, '#ffd75e');
        D(miniSpr(it.el, '#ffffff'), s.x + s.w - 6, s.y + s.h - 8 + (on ? -1 : 0), 0.0);
      }
      if (on) { outline(s.x, s.y - 2, s.w, s.h + 1, '#ffb703'); }
      if (state === 'play' && G && G.cur.show) txt(String(i + 1), s.x + 3, s.y + 2, 4.5, '#ffe9b0', 'left');
    });
    const tr = LY.trash; R(tr.x + 2, tr.y + tr.h - 7, tr.w - 4, 5, '#2a2430'); D(icon('trash'), tr.x + 6, tr.y + 6, G && G.sel >= 0 ? 1 : 0.55);
    if (G && G.sel >= 0) { X.globalAlpha = 0.5 + Math.sin(clock * 6) * 0.3; outline(tr.x, tr.y - 2, tr.w, tr.h + 1, '#ff8a8a'); X.globalAlpha = 1; }
  }
  const custScale = (r) => r.h >= 34 && r.w >= 64 ? 2 : 1;
  function drawOrders() {
    if (!G) return;
    for (const o of G.orders) {
      const r = LY.orders[o.slot]; if (!r) continue;
      const k = custScale(r);
      const enter = o.state === 'enter' ? 1 - o.anim / 0.45 : 0, leave = (o.state === 'leave' || o.state === 'done') ? Math.max(0, o.anim - 0.35) / 0.55 : 0;
      const dx = -Math.round((enter + leave) * (14 + 12 * k)), hop = o.state === 'done' ? -Math.abs(Math.round(Math.sin(o.anim * 14) * 2 * k)) : 0;
      const spr = custSpr(o.type, o.seed)[o.mood || 'n'], sw = 12 * k, sh = 20 * k;
      const sx = r.x + 1 + dx, sy = r.y + r.h - (k === 2 ? 38 : sh + 2) + hop + (o.state === 'wait' && o.mood === 'n' ? Math.round(Math.sin(clock * 2 + o.seed) * 0.6) : 0);
      X.save(); X.beginPath(); X.rect(r.x - 2, r.y - 12, r.w + 4, r.h + 12); X.clip();
      X.drawImage(spr, Math.round(sx), Math.round(sy), sw, sh);
      // the rail in front of the passenger
      const yy = r.y + r.h - 6; R(sx - 2, yy, sw + 4, 6, '#5a3418'); R(sx - 2, yy, sw + 4, 1, '#9a6a3a'); R(sx - 2, yy + 5, sw + 4, 1, '#2a170c');
      X.restore();
      if (o.state === 'leave' && o.anim < 0.7) { for (let q = 0; q < 3; q++) R(sx + 2 + q * 4 * k, sy - 3 - o.anim * 12 - (q % 2) * 3, k, k, '#ffffff'); }
      if (o.state === 'done') { const hx = sx + sw / 2, hy = sy - 4 - o.anim * 12; R(hx - 2, hy, 2, 2, '#ff5d73'); R(hx + 1, hy, 2, 2, '#ff5d73'); R(hx - 1, hy + 2, 3, 1, '#ff5d73'); R(hx, hy + 3, 1, 1, '#ff5d73'); }
      if (leave > 0.3) continue;
      // speech bubble
      const b = bubbleRect(r), fade = enter > 0 ? 1 - enter : 1, narrow = b.w < 58;
      X.globalAlpha = fade;
      const edge = o.legend ? '#ffd75e' : '#120c14', fill = o.legend ? '#2a2040' : '#f4ead8';
      box(b.x, b.y, b.w, b.h, fill, edge);
      R(b.x - 2, b.y + 6, 3, 3, fill); R(b.x - 3, b.y + 7, 1, 1, edge); R(b.x - 2, b.y + 5, 2, 1, edge); R(b.x - 2, b.y + 9, 2, 1, edge);
      if (o.legend) for (let q = 0; q < 3; q++) { const a = clock * 2 + q * 2.1; R(b.x + b.w / 2 + Math.cos(a) * (b.w / 2 - 2), b.y + b.h / 2 + Math.sin(a) * (b.h / 2 - 2), 1, 1, '#ffffff'); }
      o.items.forEach((it, i) => {
        const ix = b.x + 4 + i * 18, iy = b.y + 3;
        D(essSpr(it.el, it.tier), ix, iy, it.done ? 0.35 : 1);
        if (it.done) D(icon('check'), ix + 9, iy + 9);
      });
      const fr = clamp(o.pat / o.max, 0, 1), barC = fr > 0.5 ? '#5fd35f' : fr > 0.25 ? '#ffd21f' : (Math.floor(clock * 5) % 2 ? '#ff4d4d' : '#ff9a8a');
      R(b.x + 3, b.y + b.h - 5, b.w - 6, 3, o.legend ? '#120c14' : '#c8b8a0'); R(b.x + 3, b.y + b.h - 5, Math.round((b.w - 6) * fr), 3, barC);
      const below = o.items.length > 1 || narrow, rx = below ? b.x + 4 : b.x + 23, ry = below ? b.y + 21 : b.y + 5;
      D(icon('coin'), rx, ry); txt(o.reward, rx + 9, ry + 3.6, 6.4, o.legend ? '#ffd75e' : '#5a3a10', 'left', { noShadow: !o.legend, w: 800 });
      if (!below && b.h >= 30) txt(elName(o.items[0].el) + ' ' + o.items[0].tier, b.x + 23, b.y + 18, 5.4, o.legend ? '#d8c8ff' : '#7a6a5a', 'left', { noShadow: true, maxW: b.w - 26 });
      X.globalAlpha = 1;
    }
  }
  function drawPot() {
    const P = LY.pot, g = LY.grid, inst = G ? G.instShow : 18, n = g.n, ps = LY.ps;
    const hot = clamp(inst / 100, 0, 1), sh = G && G.inst > 80 && state === 'play' ? Math.round(Math.sin(clock * 50)) : 0;
    const ox = P.x + sh;
    // flames under the pot
    for (let i = 0; i < P.w - 16; i += 3) { const h = 3 + Math.round((Math.sin(clock * 12 + i) * 0.5 + 0.5) * (3 + hot * 7)); R(ox + 8 + i, P.y + P.h - 2 - h + 4, 2, h, i % 2 ? '#ff7a2a' : '#ffcf6a'); }
    // iron body
    box(ox - 2, P.y - 2, P.w + 4, P.h + 4, '#2e2a33', '#0c0a10', '#6a6474');
    R(ox, P.y + 1, P.w, 1, '#5a5466');
    for (const [rx, ry] of [[2, 2], [P.w - 4, 2], [2, P.h - 4], [P.w - 4, P.h - 4]]) { R(ox + rx, P.y + ry, 2, 2, '#8a8494'); R(ox + rx, P.y + ry, 1, 1, '#c8c2d0'); }
    // liquid
    const calm = ['#1f5a5a', '#2a7a6a'], warm = ['#6a2a3a', '#9a3a2a'];
    const liq = A.mix(calm[0], warm[0], hot), liq2 = A.mix(calm[1], warm[1], hot);
    R(ox + 4, P.y + 4, P.w - 8, P.h - 8, liq);
    for (let i = 0; i < 14; i++) { const bx = (i * 37 + Math.floor(clock * 20 * (1 + hot))) % (P.w - 10), by = (P.h - 10) - ((i * 53 + clock * (14 + hot * 30)) % (P.h - 10)); R(ox + 5 + bx, P.y + 5 + by, 1, 1, liq2); }
    // cells
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const cx = g.x + sh + x * (g.cell + g.gap), cy = g.y + y * (g.cell + g.gap);
      R(cx, cy, g.cell, g.cell, A.darken(liq, 0.78)); R(cx, cy + g.cell - 1, g.cell, 1, liq2); R(cx + g.cell - 1, cy, 1, g.cell, liq2);
    }
    if (!G) { drawDemoPieces(); return; }
    // preview highlight
    const prev = previewInfo();
    // pieces
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = G.board[y][x]; if (!p) continue;
      const cx = g.x + sh + p.vx * (g.cell + g.gap) + g.cell / 2, cy = g.y + p.vy * (g.cell + g.gap) + g.cell / 2 + (p.el === 'S' ? 0 : Math.round(Math.sin(clock * 2.2 + p.ph) * 0.8));
      const s = (1 + p.pop * 0.35) * ps, gr = 9 * ps;
      if (p.tier === 4 && p.el !== 'S') { X.globalAlpha = 0.25 + Math.sin(clock * 4 + p.ph) * 0.12; for (let j = -gr; j <= gr; j++) for (let i = -gr; i <= gr; i++) if (i * i + j * j <= gr * gr && (i + j) & 1) R(cx + i, cy + j, 1, 1, A.PAL[p.el].glow); X.globalAlpha = 1; }
      DS(essSpr(p.el, p.tier), cx, cy, s);
      if (p.flash > 0) { X.globalAlpha = p.flash * 0.8; X.globalCompositeOperation = 'lighter'; DS(essSpr(p.el, p.tier), cx, cy, s); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; }
      if (p.tier === 4 && p.el !== 'S' && Math.sin(clock * 3 + p.ph) > 0.9) { R(cx + 5 * ps, cy - 6 * ps, ps, 3 * ps, '#ffffff'); R(cx + 4 * ps, cy - 5 * ps, 3 * ps, ps, '#ffffff'); }
      if (p.el !== 'S' && g.cell >= 18) for (let k = 0; k < p.tier; k++) R(cx - p.tier * 1.5 * ps + k * 3 * ps + 0.5, cy + 8 * ps, 2 * ps, ps, '#ffffff');
      if (p.el !== 'S' && G.cascade === null && state === 'play' && orderFor(p.el, p.tier)) { X.globalAlpha = 0.6 + Math.sin(clock * 6) * 0.35; D(icon('check'), cx + 3 * ps, cy - 9 * ps); X.globalAlpha = 1; }
    }
    if (prev) drawPreview(prev);
    // cursor
    if (G.cur.show && state === 'play') { const [cx, cy] = cellCenter(G.cur.x, G.cur.y); const k = Math.floor(clock * 4) % 2; outline(cx - g.cell / 2 - 1 - k, cy - g.cell / 2 - 1 - k, g.cell + 2 + 2 * k, g.cell + 2 + 2 * k, '#ffb703'); }
  }
  function drawDemoPieces() {
    const demo = [[1, 1, 'H', 2], [2, 1, 'H', 1], [3, 2, 'C', 3], [1, 3, 'E', 1], [3, 3, 'V', 2], [2, 2, 'C', 1], [0, 4, 'H', 4]];
    for (const [x, y, el, tier] of demo) { const c = cellCenter(x, y); DS(essSpr(el, tier), c[0], c[1] + Math.round(Math.sin(clock * 2 + x * 2 + y) * 0.8), LY.ps); }
  }
  function previewInfo() {
    if (!G || state !== 'play' || G.cascade || G.over) return null;
    const slot = G.drag && G.drag.active ? G.drag.slot : G.sel; if (slot < 0) return null;
    const it = G.shelf[slot]; if (!it || it.arriving) return null;
    const cell = G.drag && G.drag.active ? G.drag.cell : G.cur.show ? [G.cur.x, G.cur.y] : G.hover;
    if (!cell || G.board[cell[1]][cell[0]]) return null;
    const B = cloneBoard(G.board); B[cell[1]][cell[0]] = { el: it.el, tier: it.tier, st: STAMP + 1 };
    return { cell, it, r: findReaction(B, G.n) };
  }
  function drawPreview(pv) {
    const g = LY.grid, [x, y] = pv.cell, c = cellCenter(x, y);
    DS(essSpr(pv.it.el, pv.it.tier), c[0], c[1], LY.ps, 0.55);
    const k = Math.floor(clock * 5) % 2;
    outline(c[0] - g.cell / 2, c[1] - g.cell / 2, g.cell, g.cell, '#ffffff');
    if (!pv.r) return;
    const col = { merge: '#ffd75e', void: '#ff5d73', steam: '#ffffff', zap: '#fff27a' }[pv.r.type];
    let cells = pv.r.cells || [];
    if (pv.r.type === 'steam') cells = [pv.r.hot, pv.r.cold];
    if (pv.r.type === 'zap') { cells = pv.r.cells.slice(); for (const [cx, cy] of pv.r.cells) for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (inB(nx, ny, g.n) && conductive(G.board[ny][nx])) cells.push([nx, ny]); } }
    if (pv.r.type === 'void') cells = cells.concat([pv.r.at]);
    for (const [cx, cy] of cells) { const q = cellCenter(cx, cy); if (k) outline(q[0] - g.cell / 2 + 1, q[1] - g.cell / 2 + 1, g.cell - 2, g.cell - 2, col); else outline(q[0] - g.cell / 2, q[1] - g.cell / 2, g.cell, g.cell, col); }
    txt({ merge: t('pa_merge'), void: t('pa_void'), steam: t('pa_steam'), zap: t('pa_zap') }[pv.r.type], c[0], c[1] - g.cell / 2 - 4, 6, col);
  }
  function drawGauge() {
    const Gg = LY.gauge, v = G ? clamp(G.instShow, 0, 100) : 20, f = v / 100, col = v < 50 ? '#5fd35f' : v < 75 ? '#ffd21f' : '#ff4d4d';
    const pulse = v >= 75 && Math.floor(clock * 6) % 2;
    if (Gg.vertical) {
      box(Gg.x, Gg.y, Gg.w, Gg.h, '#141018', pulse ? '#ff4d4d' : '#0c0a10');
      const ih = Gg.h - 4, fh = Math.round(ih * f);
      R(Gg.x + 2, Gg.y + 2 + ih - fh, Gg.w - 4, fh, col); R(Gg.x + 2, Gg.y + 2 + ih - fh, 2, fh, A.mix(col, '#ffffff', 0.4));
      R(Gg.x + 1, Gg.y + 2 + Math.round(ih * 0.25), Gg.w - 2, 1, '#ff4d4d');
      for (let i = 0; i < 3; i++) { const by = (clock * 20 + i * 17) % Math.max(1, fh); if (fh > 3) R(Gg.x + 4 + i * 2, Gg.y + 2 + ih - by, 1, 1, '#ffffff'); }
      txt(Math.round(v) + '%', Gg.x + Gg.w / 2, Gg.y - 5, 5.5, pulse ? '#ff6a5a' : '#ffe9b0');
      if (LY.right.w > 40) txt(t('pa_instab'), Gg.x + Gg.w + 3, Gg.y + Gg.h - 3, 5, '#c8b8a0', 'left', { maxW: LY.right.w - Gg.w - 4 });
    } else {
      box(Gg.x, Gg.y, Gg.w, Gg.h, '#141018', pulse ? '#ff4d4d' : '#0c0a10');
      const iw = Gg.w - 4, fw = Math.round(iw * f);
      R(Gg.x + 2, Gg.y + 2, fw, Gg.h - 4, col); R(Gg.x + 2, Gg.y + 2, fw, 1, A.mix(col, '#ffffff', 0.4));
      R(Gg.x + 2 + Math.round(iw * 0.75), Gg.y + 1, 1, Gg.h - 2, '#ff4d4d');
      txt(Math.round(v) + '%', Gg.x + Gg.w + 2, Gg.y + Gg.h / 2, 5.5, pulse ? '#ff6a5a' : '#ffe9b0', 'left');
      txt(t('pa_instab'), Gg.x - 2, Gg.y + Gg.h / 2, 5, '#c8b8a0', 'right', { maxW: Gg.x - 4 });
    }
  }
  function drawRack() {
    if (!G) return;
    txt(t('pa_rack'), LY.rackLabel.x + (LY.portrait ? -2 : 0), LY.rackLabel.y, 5, '#c8b8a0', LY.portrait ? 'right' : 'left');
    LY.rack.forEach((s, i) => {
      const r = G.rack[i];
      if (!r || r.arriving) { X.globalAlpha = 0.25; outline(s.x + 4, s.y + 6, 12, 15, '#c8b8a0'); X.globalAlpha = 1; return; }
      const sel = G.rackSel === i;
      D(botSpr(r.el), s.x + 6, s.y + 8 - (sel ? 2 : 0));
      for (let k = 0; k < r.tier; k++) R(s.x + 3 + k * 4, s.y + 3 - (sel ? 2 : 0), 3, 3, '#ffd75e');
      if (sel) outline(s.x, s.y - 2, s.w, s.h + 1, '#ffb703');
    });
  }
  function drawTop() {
    const T = LY.top; R(0, 0, T.w, 13, '#24160e');
    if (!G) return;
    // hearts
    for (let i = 0; i < G.maxHearts; i++) D(icon(i < G.hearts ? 'heart' : 'heart0'), 3 + i * 8, 3);
    const hx = 3 + G.maxHearts * 8 + 4;
    // coins + star progress
    const cx = LY.LW - 18;
    const goal = G.mode === 'level' ? G.cfg.goal : G.seg.quota, have = G.mode === 'level' ? G.coins : G.seg.coins;
    const label = G.mode === 'level' ? G.coins + '/' + goal : G.coins + '  (' + G.seg.coins + '/' + goal + ')';
    txt(label, cx - 2, 5.5, 6.5, have >= goal ? '#80ed99' : '#ffe9b0', 'right', { w: 800 });
    LY.coinPos = [Math.round(cx - 2 - tw(label, 6.5, 800) - 6), 6];
    D(icon('coin'), LY.coinPos[0] - 4, 2);
    const bw = 40, bx = cx - 2 - bw, by = 10;
    const pmax = G.mode === 'level' ? goal * 2 : goal, pf = clamp(have / pmax, 0, 1);
    R(bx, by, bw, 2, '#0c0a10'); R(bx, by, Math.round(bw * pf), 2, '#ffd75e');
    if (G.mode === 'level') for (const m of [0.5, 0.75, 1]) R(bx + Math.round(bw * m) - 1, by - 1, 1, 4, have >= pmax * m ? '#ffffff' : '#7a6a5a');
    // journey bar
    const jx0 = hx + 4, jx1 = LY.coinPos[0] - 12;
    if (jx1 - jx0 > 30) {
      R(jx0, 9, jx1 - jx0, 1, '#7a6a5a'); for (let x = jx0; x < jx1; x += 4) R(x, 10, 2, 1, '#4a3a30');
      const pr = G.mode === 'level' ? clamp(G.t / G.cfg.time, 0, 1) : clamp(G.seg.t / SEG_LEN, 0, 1);
      R(jx1 - 1, 3, 1, 7, '#c08a1e'); R(jx1 - 1, 3, 4, 3, '#ff5d73');
      D(icon('train'), Math.round(jx0 + (jx1 - jx0 - 14) * pr), 2);
      const left = G.mode === 'level' ? G.cfg.time - G.t : SEG_LEN - G.seg.t;
      const lbl = G.mode === 'level' ? fmtT(left) : t('pa_station', { n: G.seg.k + 1 }) + ' · ' + fmtT(left);
      const lw = Math.min(jx1 - jx0, tw(lbl, 5.6) + 6), lx = Math.round((jx0 + jx1) / 2 - lw / 2);
      box(lx, 0, Math.round(lw), 9, '#24160e', '#120a06');
      txt(lbl, (jx0 + jx1) / 2, 4.5, 5.6, left < 15 && Math.floor(clock * 3) % 2 ? '#ff8a8a' : '#e8ecff', 'center', { maxW: jx1 - jx0 });
    }
    // pause button
    const pb = LY.pauseBtn; box(pb.x, pb.y, pb.w, pb.h, '#3a2a20', '#0c0a10', '#5a4030'); D(icon('pause'), pb.x + 3, pb.y + 2);
  }
  function drawInfo() {
    if (!G) return;
    const I = LY.info, slot = G.drag && G.drag.active ? G.drag.slot : G.sel, it = slot >= 0 ? G.shelf[slot] : null;
    if (!it || it.arriving) return;
    const s = t('pa_i_' + it.el + it.v) + ' · ' + elName(it.el) + ' ' + it.tier;
    if (LY.portrait) txt(s, LY.LW / 2, Math.min(I.y, LY.LH - 6), 6, '#ffe9b0', 'center', { maxW: LY.LW - 20 });
    else txt(s, I.x, I.y, 6, '#ffe9b0', 'left', { maxW: I.w });
  }
  function drawFx() {
    for (const g of fx.ghosts) {
      if (g.t < 0) continue; const f = clamp(g.t / g.dur, 0, 1);
      const k = g.mode === 'art' ? 1 : LY.ps;
      if (g.mode === 'fly' || g.mode === 'art') { const e = f * f; DS(g.img, g.x + (g.tx - g.x) * e, g.y + (g.ty - g.y) * e, (1 - f * 0.5) * k, 1 - f * 0.3); }
      else if (g.mode === 'suck') { const e = f * f; DS(g.img, g.x + (g.tx - g.x) * e, g.y + (g.ty - g.y) * e, Math.max(0.1, 1 - f) * k, 1 - f * 0.5); }
      else if (g.mode === 'spill') DS(g.img, g.x, g.y, (1 - f * 0.3) * k, 1 - f);
    }
    for (const r of fx.rings) {
      const a = r.life / r.max; X.globalAlpha = a;
      const steps = Math.max(8, Math.round(r.r * 4));
      for (let i = 0; i < steps; i++) { const an = i / steps * 6.283; R(r.x + Math.cos(an) * r.r, r.y + Math.sin(an) * r.r, 1, 1, r.c); }
      X.globalAlpha = 1;
    }
    for (const z of fx.zaps) {
      if (z.delay > 0) continue; const a = z.life / z.max; X.globalAlpha = a;
      let [x0, y0] = z.a; const [x1, y1] = z.b, segs = 5;
      for (let i = 1; i <= segs; i++) {
        const tt = i / segs, nx = x0 + (x1 - x0) / (segs - i + 1) + (i < segs ? rand(-3, 3) : 0), ny = y0 + (y1 - y0) / (segs - i + 1) + (i < segs ? rand(-3, 3) : 0);
        X.globalAlpha = a * 0.5; line(x0 - 1, y0 - 1, nx - 1, ny - 1, '#fff27a', 3); X.globalAlpha = Math.min(1, a * 1.6);
        line(x0, y0, nx, ny, i % 2 ? '#ffffff' : '#fffbe0', 1); x0 = nx; y0 = ny; void tt;
      }
      X.globalAlpha = 1;
    }
    for (const p of fx.parts) { X.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1); R(p.x, p.y, p.s, p.s, p.c); } X.globalAlpha = 1;
    for (const f of fx.flights) {
      if (f.t < 0) continue; const k = clamp(f.t / f.dur, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - Math.sin(k * Math.PI) * (f.kind === 'coin' ? 10 : 18);
      if (f.kind === 'ing') { D(ingSpr(f.it.el, f.it.v), x - 6, y - 6); if (Math.random() < 0.5) fx.parts.push({ x: x + rand(-3, 3), y: y + 4, vx: 0, vy: 10, life: 0.3, max: 0.3, c: A.PAL[f.it.el].l, s: 1, g: 0 }); }
      else if (f.kind === 'bottle') D(botSpr(f.el), x - 4, y - 5);
      else if (f.kind === 'coin') D(icon('coin'), x - 3, y - 3);
    }
  }
  function line(x0, y0, x1, y1, c, w) { w = w || 1; const d = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= d; i++) R(x0 + (x1 - x0) * i / d, y0 + (y1 - y0) * i / d, w, w, c); }
  function drawDrag() {
    if (!G || !G.drag || !G.drag.active) return;
    const it = G.shelf[G.drag.slot]; if (!it) return;
    if (G.drag.cell && !G.board[G.drag.cell[1]][G.drag.cell[0]]) return;   // the ghost in the cell shows it
    D(ingSpr(it.el, it.v), G.drag.x - 6, G.drag.y - 14);
  }
  function render() {
    TXT = [];
    const L = LY;
    X.imageSmoothingEnabled = false;
    X.drawImage(interior, 0, 0);
    drawWindow(); drawLamps(); drawSill();
    if (G && (state === 'play' || state === 'paused' || state === 'result')) {
      drawOrders(); drawPot(); drawGauge(); drawRack(); drawFx(); drawTop(); drawInfo(); drawDrag();
    } else { drawPot(); drawGauge(); drawFx(); R(0, 0, L.LW, 13, '#24160e'); }
    for (const f of fx.floats) { const a = clamp(f.life / f.max * 2, 0, 1); txt(f.s, f.x, f.y, f.size, f.c, 'center', { alpha: a, w: 900 }); }
    if (fx.flash > 0) { X.globalAlpha = Math.min(1, fx.flash); R(0, 0, L.LW, L.LH, fx.flashC); X.globalAlpha = 1; }
    // upscale
    const sx = fx.shake > 0 ? Math.round(rand(-1, 1) * fx.shake) : 0, sy = fx.shake > 0 ? Math.round(rand(-1, 1) * fx.shake) : 0;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#1a100a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(low, sx * L.px, sy * L.px, L.LW * L.px, L.LH * L.px);
    // crisp text on top
    const rtl = getLang() === 'ar';
    ctx.textBaseline = 'middle'; ctx.direction = rtl ? 'rtl' : 'ltr';
    for (const T of TXT) {
      const size = fontPx(T.size), x = (T.x + sx) * L.px, y = (T.y + sy) * L.px;
      ctx.font = `${T.o.w || 700} ${size.toFixed(1)}px ${FONT}`; ctx.textAlign = T.a;
      ctx.globalAlpha = T.o.alpha === undefined ? 1 : T.o.alpha;
      const mw = T.o.maxW ? T.o.maxW * L.px : undefined;
      if (!T.o.noShadow) { ctx.fillStyle = 'rgba(8,6,12,.85)'; ctx.fillText(T.s, x + L.px * 0.5, y + L.px * 0.6, mw); }
      ctx.fillStyle = T.c; ctx.fillText(T.s, x, y, mw);
    }
    ctx.globalAlpha = 1;
  }

  // =====================================================================
  // input
  // =====================================================================
  const toArt = (e) => [e.clientX * DPR / LY.px, e.clientY * DPR / LY.px];
  function hitShelf(x, y) { for (let i = 0; i < LY.slots.length; i++) { const s = LY.slots[i]; if (x >= s.x - 1 && x < s.x + s.w + 1 && y >= s.y - 4 && y < s.y + s.h + 3) return i; } return -1; }
  canvas.addEventListener('pointerdown', (e) => {
    AU.init();
    if (state !== 'play' || !G) return;
    const [x, y] = toArt(e); G.cur.show = false;
    if (inR(LY.pauseBtn, x, y + 1) || (x > LY.LW - 18 && y < 14)) { pause(); return; }
    if (G.over || G.overT >= 0) return;
    if (G.wisp) { const w = G.wisp, wy = w.y + Math.sin(w.t * 3) * 3; if (Math.hypot(x - w.x, y - wy) < 13) { catchWisp(); return; } }
    const si = hitShelf(x, y);
    if (si >= 0) { G.drag = { slot: si, sx: x, sy: y, x, y, active: false, cell: null, id: e.pointerId }; try { canvas.setPointerCapture(e.pointerId); } catch (er) {} return; }
    if (inR(LY.trash, x, y)) { if (G.sel >= 0) discard(G.sel); return; }
    for (let i = 0; i < LY.rack.length; i++) if (inR(LY.rack[i], x, y)) { rackTap(i); return; }
    const c = cellAt(x, y);
    if (c && inR(LY.pot, x, y)) {
      const p = G.board[c[1]][c[0]];
      if (p) bottle(c[0], c[1]);
      else if (G.sel >= 0) { if (!place(G.sel, c[0], c[1]) && G.cascade) { /* busy */ } }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state !== 'play' || !G) return;
    const [x, y] = toArt(e);
    const c = cellAt(x, y); G.hover = c && inR(LY.pot, x, y) ? c : null;
    if (e.pointerType === 'mouse') G.cur.show = false;
    const d = G.drag; if (!d) return;
    d.x = x; d.y = y;
    if (!d.active && Math.hypot(x - d.sx, y - d.sy) > 5) { const it = G.shelf[d.slot]; if (it && !it.arriving) { d.active = true; G.sel = d.slot; AU.play('pick'); } else G.drag = null; }
    if (d.active) d.cell = c && inR(LY.pot, x, y - 8) ? cellAt(x, y - 8) : null;
  });
  const endDrag = (e) => {
    if (!G || !G.drag) return;
    const d = G.drag; G.drag = null;
    if (state !== 'play') return;
    if (!d.active) { select(d.slot); return; }
    const [x, y] = toArt(e);
    if (inR(LY.trash, x, y)) { discard(d.slot); return; }
    const c = inR(LY.pot, x, y - 8) ? cellAt(x, y - 8) : null;
    if (c && !G.board[c[1]][c[0]]) { if (!place(d.slot, c[0], c[1])) G.sel = d.slot; }
    else G.sel = d.slot;
    if (G.tut === 0) G.tut = 1;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', () => { if (G) G.drag = null; });
  canvas.addEventListener('pointerleave', () => { if (G) G.hover = null; });
  function catchWisp() {
    const w = G.wisp; if (!w) return;
    if (!G.shelf.some(s => !s)) { floatText(t('pa_shelffull'), w.x, w.y - 8, '#ff8a8a'); AU.play('err'); return; }
    spawnHarvest(w.el, w.tier, [w.x, w.y]); G.wisp = null; AU.play('wisp');
    burst(w.x, w.y, 24, [A.PAL[w.el].l, '#ffffff', A.PAL[w.el].glow], 60, 0.8, 0); floatText(t('pa_wispgot'), w.x, w.y - 8, A.PAL[w.el].l, 1.2);
  }
  addEventListener('keydown', (e) => {
    if (e.repeat && !/^Arrow/.test(e.key)) return;
    AU.init();
    const k = e.key;
    if (k === 'm' || k === 'M') { S.snd = S.snd ? 0 : 1; S.mus = S.snd; AU.apply(); save(); refreshToggles(); return; }
    if (state === 'paused' && (k === 'Escape' || k === 'p' || k === 'P')) { resume(); e.preventDefault(); return; }
    if (state !== 'play' || !G) { if (k === 'Escape' && !$('modal').hidden && modalBack) { modalBack(); } return; }
    if (k === 'Escape' || k === 'p' || k === 'P') { pause(); e.preventDefault(); return; }
    if (G.over) return;
    if (/^[1-9]$/.test(k)) { select(+k - 1); G.cur.show = true; return; }
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] }[k];
    if (mv) { G.cur.show = true; G.cur.x = clamp(G.cur.x + mv[0], 0, G.n - 1); G.cur.y = clamp(G.cur.y + mv[1], 0, G.n - 1); e.preventDefault(); return; }
    if (k === ' ' || k === 'Enter') {
      e.preventDefault(); G.cur.show = true;
      const p = G.board[G.cur.y][G.cur.x];
      if (p) bottle(G.cur.x, G.cur.y); else if (G.sel >= 0) place(G.sel, G.cur.x, G.cur.y);
      return;
    }
    if (k === 'x' || k === 'X' || k === 'Delete' || k === 'Backspace') { if (G.sel >= 0) discard(G.sel); return; }
    if (k === 'q' || k === 'e') { const dir = k === 'e' ? 1 : -1, len = G.shelf.length; for (let i = 1; i <= len; i++) { const j = ((G.sel < 0 ? (dir > 0 ? -1 : 0) : G.sel) + dir * i + len * 2) % len; if (G.shelf[j] && !G.shelf[j].arriving) { G.sel = j; AU.play('pick'); break; } } G.cur.show = true; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(); });

  // =====================================================================
  // screens (HTML)
  // =====================================================================
  let modalBack = null, lastResult = null;
  const screens = ['s-title', 's-map', 's-shop', 's-how'];
  function show(id) {
    screens.forEach(s => $(s).hidden = s !== id);
    $('modal').hidden = true; modalBack = null;
    state = { 's-title': 'title', 's-map': 'map', 's-shop': 'shop', 's-how': 'how' }[id] || state;
    if (id === 's-title') renderTitle(); if (id === 's-map') renderMap(); if (id === 's-shop') renderShop(); if (id === 's-how') renderHow();
    updHint();
  }
  function hideScreens() { screens.forEach(s => $(s).hidden = true); }
  const img = (c, s, cls) => `<img class="px ${cls || ''}" src="${dataURL(c, s || 2)}" alt="">`;
  const ess = (el, tier, s) => img(essSpr(el, tier), s || 2);
  const coinImg = (s) => img(icon('coin'), s || 2, 'coin');
  function modal(html, back) { $('mbox').innerHTML = html; $('modal').hidden = false; modalBack = back || null; fixHome($('mbox')); }
  function closeModal() { $('modal').hidden = true; modalBack = null; }
  function fixHome(root) { root.querySelectorAll('[data-mal3ab-home]').forEach(h => { h.onclick = (e) => { e.preventDefault(); location.href = '../../play.html'; }; }); }
  const langLabel = () => getLang() === 'ar' ? 'English' : 'العربية';
  function refreshToggles() {
    document.querySelectorAll('.tg-snd').forEach(b => { b.textContent = (S.snd ? '🔊 ' : '🔇 ') + t('pa_sound'); b.classList.toggle('off', !S.snd); });
    document.querySelectorAll('.tg-mus').forEach(b => { b.textContent = (S.mus ? '🎵 ' : '🎵 ') + t('pa_music'); b.classList.toggle('off', !S.mus); });
    document.querySelectorAll('.tg-lang').forEach(b => b.textContent = langLabel());
  }
  function toggleSnd() { S.snd = S.snd ? 0 : 1; AU.init(); AU.apply(); save(); refreshToggles(); AU.play('click'); }
  function toggleMus() { S.mus = S.mus ? 0 : 1; AU.init(); AU.apply(); save(); refreshToggles(); }
  function toggleLang() { setLang(getLang() === 'ar' ? 'en' : 'ar'); }

  function renderTitle() {
    sceneSet(['meadow', 'volcanic', 'crystal', 'tundra', 'storm', 'desert', 'aurora', 'marsh'], false, false, true);
    G = null; layout();
    const lg = A.logo([{ text: 'PIXEL', cols: [[A.PAL.H.w, A.PAL.H.l, A.PAL.H.m], [A.PAL.C.w, A.PAL.C.l, A.PAL.C.m], [A.PAL.E.w, A.PAL.E.l, A.PAL.E.m], [A.PAL.V.w, A.PAL.V.l, A.PAL.V.m]] }, { text: 'ALCHEMIST', cols: [['#fff6d0', '#ffd75e', '#ffb703']] }], 1);
    const lc = $('logo'), sc = Math.max(3, Math.min(8, Math.floor(Math.min(innerWidth * 0.86, 560) / lg.width)));
    lc.width = lg.width * sc; lc.height = lg.height * sc; const lx = lc.getContext('2d'); lx.imageSmoothingEnabled = false; lx.drawImage(lg, 0, 0, lc.width, lc.height);
    $('logoAr').hidden = getLang() !== 'ar';
    $('bankT').textContent = S.bank;
    const n = window.Auth && Auth.name && Auth.name();
    $('hello').hidden = !n; if (n) $('hello').textContent = t('pa_hello', { n });
    const stars = Object.values(S.lv).reduce((s, r) => s + (r.stars || 0), 0);
    $('starsT').textContent = stars + '/' + LEVELS.length * 3;
    refreshToggles();
  }
  function renderMap() {
    $('mapBank').textContent = S.bank;
    let h = '';
    LEVELS.forEach((L, i) => {
      const id = i + 1, rec = S.lv[id] || { stars: 0, best: 0 }, locked = id > S.unlocked;
      const st = [0, 1, 2].map(k => img(icon(k < rec.stars ? 'star' : 'star0'), 3)).join('');
      const bi = L.biomes.slice(0, 4).map(b => `<span class="bdot" style="background:${A.BIOMES[b].sky[3]};border-color:${A.BIOMES[b].far}"></span>`).join('');
      h += `<button class="stn ${locked ? 'locked' : ''} ${id === S.unlocked && !rec.stars ? 'cur' : ''}" data-lv="${i}" style="--off:${[0, 1, 2, 1][i % 4]}">
        <span class="num">${locked ? img(icon('lock'), 2) : id}</span>
        <span class="nm"><b>${t('pa_st' + id)}</b><small>${bi}</small></span>
        <span class="st">${st}</span></button>`;
    });
    $('route').innerHTML = h;
    $('route').querySelectorAll('.stn').forEach(b => b.onclick = () => { AU.init(); AU.play('click'); const i = +b.dataset.lv; if (i + 1 > S.unlocked) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; } levelCard(i); });
    const e = S.endless; $('endlessBest').textContent = e.best ? t('pa_e_best', { c: e.best, s: e.stations }) : '';
  }
  function tipCard(id) {
    const icons = {
      merge: ess('H', 1) + ess('H', 1) + ess('H', 1) + '<i>→</i>' + ess('H', 2),
      bottle: ess('C', 2) + '<i>→</i>' + img(botSpr('C'), 2),
      steam: ess('H', 2) + '<i>+</i>' + ess('C', 1) + '<i>→</i>' + ess('H', 1),
      zap: ess('E', 1) + '<i>⚡</i>' + ess('H', 1) + '<i>→</i>' + ess('H', 2),
      void: ess('V', 1) + '<i>←</i>' + ess('C', 2) + ess('S', 1),
      instab: ess('H', 3) + ess('E', 2),
      wisp: ess('E', 2), slag: ess('S', 1), legend: ess('V', 4) + ess('H', 4),
      biome: img(ingSpr('H', 0), 2) + img(ingSpr('C', 1), 2) + img(ingSpr('E', 2), 2) + img(ingSpr('V', 0), 2),
      goal: img(icon('coin'), 2) + img(icon('star'), 2), drop: img(ingSpr('C', 0), 2) + '<i>↓</i>' + ess('C', 1),
      keys: '<i>⌨️</i>',
    };
    return `<div class="tip"><div class="ics">${icons[id] || ''}</div><div><b>${t('pa_t_' + id)}</b><p>${t('pa_d_' + id)}</p></div></div>`;
  }
  function levelCard(i) {
    const L = LEVELS[i], id = i + 1, rec = S.lv[id] || { stars: 0, best: 0 };
    const route = L.biomes.map(b => `<span class="chip"><span class="bdot" style="background:${A.BIOMES[b].sky[3]};border-color:${A.BIOMES[b].far}"></span>${t('pa_b_' + b)}</span>`).join('');
    const tips = (L.intro || []).map(tipCard).join('');
    modal(`<div class="panel lvcard">
      <div class="kick">${t('pa_station', { n: id })}</div><h2>${t('pa_st' + id)}</h2>
      <p class="story">“${t('pa_story' + id)}”</p>
      <div class="goal">${coinImg(3)} <span>${t('pa_goal_txt', { n: L.goal })}</span></div>
      <div class="thr">${[1, 1.5, 2].map((m, k) => `<span>${[0, 1, 2].map(j => img(icon(j <= k ? 'star' : 'star0'), 2)).join('')} ${Math.round(L.goal * m)}</span>`).join('')}<span>⏱ ${fmtT(L.time)}</span></div>
      <div class="lbl">${t('pa_route')}</div><div class="chips">${route}</div>
      ${tips ? `<div class="lbl new">${t('pa_new')}</div><div class="tips">${tips}</div>` : ''}
      ${rec.best ? `<div class="lbl">${t('pa_best')}: ${coinImg(2)} ${rec.best}</div>` : ''}
      <div class="row"><button class="btn sec" id="lcBack">${t('pa_back')}</button><button class="btn" id="lcGo">🚂 ${t('pa_start')}</button></div></div>`, closeModal);
    $('lcBack').onclick = () => { AU.play('click'); closeModal(); };
    $('lcGo').onclick = () => { AU.play('click'); startLevel(i); };
  }
  function endlessCard() {
    const e = S.endless;
    modal(`<div class="panel lvcard"><div class="kick">♾️</div><h2>${t('pa_endless')}</h2><p class="story">${t('pa_e_info')}</p>
      ${e.best ? `<div class="goal">${coinImg(3)} <span>${t('pa_e_best', { c: e.best, s: e.stations })}</span></div>` : ''}
      <div class="tips">${tipCard('instab')}</div>
      <div class="row"><button class="btn sec" id="lcBack">${t('pa_back')}</button><button class="btn" id="lcGo">🚂 ${t('pa_start')}</button></div></div>`, closeModal);
    $('lcBack').onclick = () => { AU.play('click'); closeModal(); };
    $('lcGo').onclick = () => { AU.play('click'); startEndless(); };
  }
  function upIcon(id) {
    const m = { shelf: ingSpr('H', 0), harvest: ingSpr('E', 1), rack: botSpr('V'), cool: essSpr('C', 2), hearts: icon('heart'), patience: custSpr('granny', 3).h, lucky: icon('star'), grand: essSpr('E', 4) };
    return img(m[id], id === 'patience' ? 2 : 3);
  }
  function renderShop() {
    $('shopBank').textContent = S.bank;
    $('shopList').innerHTML = UPG.map(u => {
      const lv = S.up[u.id], max = lv >= u.max, cost = max ? 0 : u.cost[lv];
      const pips = Array.from({ length: u.max }, (_, k) => `<i class="${k < lv ? 'on' : ''}"></i>`).join('');
      return `<div class="up panel"><div class="uic">${upIcon(u.id)}</div><div class="ut"><b>${t('pa_u_' + u.id)}</b><small>${t('pa_ud_' + u.id)}</small><span class="pips">${pips}</span></div>
        <button class="btn ${max ? 'sec' : ''}" data-up="${u.id}" ${max || S.bank < cost ? 'disabled' : ''}>${max ? t('pa_max') : coinImg(2) + ' ' + cost}</button></div>`;
    }).join('');
    $('shopList').querySelectorAll('[data-up]').forEach(b => b.onclick = () => {
      const u = UPG.find(x => x.id === b.dataset.up), lv = S.up[u.id]; if (lv >= u.max) return; const cost = u.cost[lv];
      if (S.bank < cost) { AU.play('err'); return; }
      S.bank -= cost; S.up[u.id]++; save(); AU.init(); AU.play('served'); renderShop();
      const el = $('shopList').querySelector(`[data-up="${u.id}"]`); if (el) { el.closest('.up').classList.add('bought'); }
    });
  }
  function renderHow() {
    $('howBody').innerHTML = ['goal', 'biome', 'drop', 'merge', 'bottle', 'steam', 'zap', 'void', 'instab', 'wisp', 'slag', 'legend', 'keys'].map(tipCard).join('');
  }
  let howReturn = null;

  // ---------- run control ----------
  function startLevel(i) { closeModal(); hideScreens(); newRun('level', i); state = 'play'; AU.init(); updHint(); }
  function startEndless() { closeModal(); hideScreens(); newRun('endless', 0); state = 'play'; AU.init(); updHint(); }
  function pause() {
    if (state !== 'play') return; state = 'paused'; AU.play('click'); if (G) G.drag = null;
    const title = G.mode === 'level' ? t('pa_station', { n: G.li + 1 }) + ' — ' + t('pa_st' + (G.li + 1)) : t('pa_endless');
    modal(`<div class="panel pausebox"><h2>⏸ ${t('pa_paused')}</h2><div class="kick">${title}</div>
      <button class="btn" id="pResume">▶ ${t('pa_resume')}</button>
      <button class="btn sec" id="pRestart">🔄 ${t('pa_restart')}</button>
      <button class="btn sec" id="pHow">❓ ${t('pa_howto')}</button>
      <div class="row"><button class="tb tg-snd" id="pSnd"></button><button class="tb tg-mus" id="pMus"></button><button class="tb tg-lang" id="pLang"></button></div>
      <div class="row"><button class="btn sec" id="pLeave">🚉 ${t('pa_leave')}</button><button class="tb" data-mal3ab-chat title="Chat">💬</button><button class="tb" data-mal3ab-home title="Home">🏠</button></div></div>`, resume);
    refreshToggles(); updHint();
    $('pResume').onclick = resume;
    $('pRestart').onclick = () => { AU.play('click'); G.mode === 'level' ? startLevel(G.li) : startEndless(); };
    $('pHow').onclick = () => { AU.play('click'); howReturn = 'pause'; $('modal').hidden = true; $('s-how').hidden = false; renderHow(); };
    $('pSnd').onclick = toggleSnd; $('pMus').onclick = toggleMus; $('pLang').onclick = toggleLang;
    $('pLeave').onclick = () => { AU.play('click'); const m = G.mode; G = null; show(m === 'level' ? 's-map' : 's-title'); };
  }
  function resume() { if (state !== 'paused') return; closeModal(); state = 'play'; AU.play('click'); updHint(); }
  function showResult(res) {
    lastResult = res; state = 'result'; updHint();
    let h;
    if (res.mode === 'level') {
      const id = res.li + 1, L = LEVELS[res.li], last = id === LEVELS.length;
      const stars = [0, 1, 2].map(k => `<span class="bigstar ${k < res.stars ? 'on' : ''}" style="animation-delay:${0.15 + k * 0.25}s">${img(icon(k < res.stars ? 'star' : 'star0'), 5)}</span>`).join('');
      h = `<div class="panel result ${res.win ? 'win' : 'lose'}"><div class="kick">${t('pa_station', { n: id })} — ${t('pa_st' + id)}</div>
        <h2>${res.win ? '🎉 ' + t('pa_win') : res.blown ? '💥 ' + t('pa_blown') : '🚉 ' + t('pa_lose')}</h2>
        <div class="stars">${stars}</div>
        <div class="big">${coinImg(4)} <b>${res.coins}</b> <small>/ ${L.goal}</small></div>
        ${res.newBest && res.coins > 0 ? `<div class="nb">${t('pa_new_best')}</div>` : ''}
        <div class="stats"><span>${t('pa_served')}: <b>${res.stats.served}</b></span><span>${t('pa_chainmax')}: <b>×${res.stats.maxChain}</b></span><span>${t('pa_banked', { n: res.bank })}</span></div>
        ${res.win && last ? `<p class="story">${t('pa_finale')}</p>` : ''}
        <div class="row">${res.win && !last ? `<button class="btn" id="rNext">🚂 ${t('pa_next_st')}</button>` : ''}<button class="btn ${res.win && !last ? 'sec' : ''}" id="rRetry">🔄 ${t('pa_retry')}</button></div>
        <div class="row"><button class="btn sec" id="rMap">🗺️ ${t('pa_map')}</button><button class="btn sec" id="rShop">🛠 ${t('pa_upgrades')}</button></div></div>`;
    } else {
      h = `<div class="panel result lose"><div class="kick">♾️ ${t('pa_endless')}</div><h2>🚉 ${t('pa_e_over')}</h2>
        <div class="big">${coinImg(4)} <b>${res.coins}</b></div>
        ${res.newBest && res.coins > 0 ? `<div class="nb">${t('pa_new_best')}</div>` : ''}
        <div class="stats"><span>${t('pa_e_stations')}: <b>${res.stations}</b></span><span>${t('pa_served')}: <b>${res.stats.served}</b></span><span>${t('pa_chainmax')}: <b>×${res.stats.maxChain}</b></span><span>${t('pa_banked', { n: res.bank })}</span></div>
        <div class="row"><button class="btn" id="rRetry">🔄 ${t('pa_retry')}</button></div>
        <div class="row"><button class="btn sec" id="rMap">🏠 ${t('pa_back')}</button><button class="btn sec" id="rShop">🛠 ${t('pa_upgrades')}</button></div></div>`;
    }
    modal(h, null);
    const nx = $('rNext'); if (nx) nx.onclick = () => { AU.play('click'); levelCard(res.li + 1); };
    $('rRetry').onclick = () => { AU.play('click'); res.mode === 'level' ? startLevel(res.li) : startEndless(); };
    $('rMap').onclick = () => { AU.play('click'); G = null; show(res.mode === 'level' ? 's-map' : 's-title'); };
    $('rShop').onclick = () => { AU.play('click'); G = null; shopReturn = res.mode === 'level' ? 's-map' : 's-title'; show('s-shop'); };
  }
  let shopReturn = 's-title';

  // tutorial hint pill
  function updHint() {
    const h = $('hint');
    const keys = [null, 'pa_h1', 'pa_h2', 'pa_h3', 'pa_h4'];
    const k = state === 'play' && G && G.tut >= 0 ? keys[G.tut + 1] : null;
    if (!k) { h.hidden = true; h.dataset.k = ''; return; }
    if (h.dataset.k !== k) { h.dataset.k = k; h.textContent = t(k); }
    h.hidden = false;
    const W = LY.win, s = LY.px / DPR;
    h.style.top = Math.round((W.y + W.h * 0.42) * s) + 'px';
  }

  // wiring
  function wire() {
    $('bJourney').onclick = () => { AU.init(); AU.play('click'); show('s-map'); };
    $('bEndless').onclick = () => { AU.init(); AU.play('click'); endlessCard(); };
    $('bShop').onclick = () => { AU.init(); AU.play('click'); shopReturn = 's-title'; show('s-shop'); };
    $('bHow').onclick = () => { AU.init(); AU.play('click'); howReturn = 's-title'; show('s-how'); };
    $('mapBack').onclick = () => { AU.play('click'); show('s-title'); };
    $('mapEndless').onclick = () => { AU.play('click'); endlessCard(); };
    $('mapShop').onclick = () => { AU.play('click'); shopReturn = 's-map'; show('s-shop'); };
    $('shopBack').onclick = () => { AU.play('click'); show(shopReturn); };
    $('howBack').onclick = () => {
      AU.play('click');
      if (howReturn === 'pause' && G && state === 'paused') { $('s-how').hidden = true; $('modal').hidden = false; }
      else show(howReturn || 's-title');
    };
    document.querySelectorAll('.tg-snd').forEach(b => b.onclick = toggleSnd);
    document.querySelectorAll('.tg-mus').forEach(b => b.onclick = toggleMus);
    document.querySelectorAll('.tg-lang').forEach(b => b.onclick = toggleLang);
    $('modal').addEventListener('pointerdown', (e) => { if (e.target === $('modal') && modalBack) modalBack(); });
    document.querySelectorAll('[data-mal3ab-home]').forEach(h => { if (!h.onclick) h.onclick = () => location.href = '../../play.html'; });
  }
  document.addEventListener('langchange', () => {
    refreshToggles();
    $('hint').dataset.k = ''; updHint();
    if (!$('s-title').hidden) renderTitle();
    if (!$('s-map').hidden) renderMap();
    if (!$('s-shop').hidden) renderShop();
    if (!$('s-how').hidden) renderHow();
    if (state === 'paused') { closeModal(); state = 'play'; pause(); }
    else if (state === 'result' && lastResult) showResult(lastResult);
    else if (!$('modal').hidden && $('lcGo')) closeModal();
  });
  document.addEventListener('mal3abready', () => { if (state === 'title') renderTitle(); });

  // =====================================================================
  // loop
  // =====================================================================
  let lastT = performance.now(), manual = false;
  function update(dt) {
    clock += dt;
    if (state === 'paused') return;
    sceneUpdate(dt);
    if (state === 'play' && G && !G.over) gameUpdate(dt);
    fxUpdate(dt);
    if (state === 'play' && G && G.tut >= 0) updHint();
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!manual) update(dt);
    try { render(); } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { resize(); if (state === 'title') renderTitle(); updHint(); });

  // =====================================================================
  // test / automation API
  // =====================================================================
  function botDemand() { const d = {}; for (const o of G.orders) if (o.state === 'wait' || o.state === 'enter') for (const i of o.items) if (!i.done) d[i.el + i.tier] = (d[i.el + i.tier] || 0) + 1; return d; }
  function evalBoard(B, n, dem) {
    let s = 0, empty = 0; const maxT = Math.max(...G.cfg.tiers, G.cfg.legend ? 4 : 0), PV = [0, 2, 6, 15, 35];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = B[y][x]; if (!p) { empty++; continue; }
      if (p.el === 'S') { s -= 4; continue; }
      if (dem[p.el + p.tier]) s += 20 + VALUE[p.tier];
      if (p.tier > maxT) { s += 4; continue; }
      s += p.el === 'V' ? 1 : p.el === 'E' ? 1.5 : PV[p.tier];
      for (const k in dem) if (k[0] === p.el && +k[1] > p.tier) { s += 3 * p.tier; break; }
      for (const [dx, dy] of DIRS) { const q = inB(x + dx, y + dy, n) && B[y + dy][x + dx]; if (q && q.el === p.el && q.tier === p.tier && p.tier < maxT && p.el !== 'V' && p.el !== 'E') s += 2 * p.tier; }
    }
    return s + empty * 0.4 - Math.max(0, 5 - empty) * 5;
  }
  function botStep() {
    if (!canAct()) return 'busy';
    const dem = botDemand(), maxT = Math.max(...G.cfg.tiers, G.cfg.legend ? 4 : 0);
    for (let y = 0; y < G.n; y++) for (let x = 0; x < G.n; x++) { const p = G.board[y][x]; if (p && p.el !== 'S' && dem[p.el + p.tier]) { bottle(x, y); return 'bottle'; } }
    // useless over-tier essences: bottle them and sell from the rack
    for (let y = 0; y < G.n; y++) for (let x = 0; x < G.n; x++) { const p = G.board[y][x]; if (p && p.el !== 'S' && p.tier > maxT && G.rack.some(r => !r)) { bottle(x, y); return 'rack'; } }
    { const ri = G.rack.findIndex(r => r && !r.arriving && r.tier > maxT); if (ri >= 0) { G.rackSel = ri; G.rackSelT = 1; rackTap(ri); return 'sell'; } }
    let best = null;
    for (let si = 0; si < G.shelf.length; si++) {
      const it = G.shelf[si]; if (!it || it.arriving) continue;
      for (let y = 0; y < G.n; y++) for (let x = 0; x < G.n; x++) {
        if (G.board[y][x]) continue;
        const B = cloneBoard(G.board); B[y][x] = { el: it.el, tier: it.tier, st: STAMP + 1 };
        let inst = 1.2, k = 0, r; const st0 = STAMP;
        while ((r = findReaction(B, G.n)) && k < 40) { const ev = applyCore(B, G.n, r); inst += ev.inst > 0 ? ev.inst * (G.cfg.heat || 1) : ev.inst; k++; if (ev.spills) inst += ev.spills.length * 3; }
        STAMP = Math.max(STAMP, st0);
        const danger = G.inst + inst >= 96 ? 1000 : 0;
        const sc = evalBoard(B, G.n, dem) - Math.max(0, inst) * (0.4 + G.inst / 60) + k * 1.5 - danger;
        if (!best || sc > best.sc) best = { sc, si, x, y };
      }
    }
    const empty = G.board.flat().filter(p => !p).length, base = evalBoard(G.board, G.n, dem);
    if (best && best.sc < base - 3 && G.shelf.filter(x => x && !x.arriving).length >= 4) { discard(best.si); return 'discard'; }
    if (best && (best.sc > -500 || empty > 2)) { place(best.si, best.x, best.y); return 'place'; }
    if (empty > 1 && !G.shelf.every(s => s && !s.arriving)) return 'idle';
    // nowhere good: free space
    const ri = G.rack.findIndex(r => r && !r.arriving); if (!G.rack.some(r => !r) && ri >= 0) { rackTap(ri); rackTap(ri); return 'sell'; }
    let hi = null; for (let y = 0; y < G.n; y++) for (let x = 0; x < G.n; x++) { const p = G.board[y][x]; if (p && p.el !== 'S' && (!hi || p.tier < hi.t)) hi = { x, y, t: p.tier }; }
    if (hi && G.rack.some(r => !r)) { bottle(hi.x, hi.y); return 'rack'; }
    if (G.sel < 0 && G.shelf.every(s => s)) { discard(0); return 'discard'; }
    return 'idle';
  }
  function parseBoard(rows) {   // e.g. ['H1 .  C1', ...] → board
    const n = G.n; G.board = grid(n);
    rows.forEach((r, y) => r.trim().split(/\s+/).forEach((c, x) => { if (c !== '.' && x < n && y < n) { const p = mkPiece(c[0], +c[1] || 1); p.vx = x; p.vy = y; G.board[y][x] = p; } }));
  }
  const boardStr = () => G.board.map(r => r.map(p => p ? p.el + p.tier : '..').join(' '));
  window.PixelAlchemist = {
    get state() { return state; }, get run() { return G; }, get save() { return S; }, get layout() { return LY; }, get scene() { return scene; },
    LEVELS, UPG,
    start: (i) => startLevel(i || 0), endless: () => startEndless(), pause, resume, show,
    place, bottle, select, discard, rackTap, catchWisp, botStep,
    give(el, tier, slot) { if (!G) return; const i = slot === undefined ? G.shelf.findIndex(s => !s) : slot; if (i < 0) return false; G.shelf[i] = { el, tier: tier || 1, v: variantFor(scene.cur, el) }; return true; },
    setBoard: parseBoard, board: boardStr, findReaction: () => G && findReaction(G.board, G.n),
    resolve() { let k = 0; while (G.cascade && k++ < 200) { G.cascade.t = 0; gameUpdate(0); } return boardStr(); },
    tick(sec, step) { manual = true; const s = step || 1 / 30; for (let tt = 0; tt < sec; tt += s) update(s); manual = false; },
    setInst(v) { G.inst = v; G.instShow = v; }, setTime(v) { G.t = v; }, setCoins(v) { G.coins = v; if (G.seg) G.seg.coins = v; },
    spawnOrder: () => spawnOrder(), finish: () => finish(),
    reset() { S = defSave(); save(); },
    cellCenterPx(x, y) { const c = cellCenter(x, y); return [c[0] * LY.px / DPR, c[1] * LY.px / DPR]; },
    slotCenterPx(i) { const s = LY.slots[i]; return [(s.x + s.w / 2) * LY.px / DPR, (s.y + s.h / 2) * LY.px / DPR]; },
  };

  // boot
  wire(); resize(); show('s-title');
  requestAnimationFrame(frame);
})();
