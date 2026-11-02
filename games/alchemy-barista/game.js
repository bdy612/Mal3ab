// Alchemy Barista — a cozy mood-brewing cafe for magical creatures (Mal3ab)
(function () {
  'use strict';
  const A = window.ABArt;

  // ============================================================ strings
  const AR = {
    ab_title: 'Alchemy Barista', ab_sub: 'كافيه سحري للكائنات الخيالية — اعمل لكل زبون مشروب على مزاجه بالظبط',
    ab_play: 'العب', ab_continue: 'كمّل — اليوم {n}', ab_days: 'الأيام', ab_how: 'إزاي تلعب', ab_shop: 'ديكور وتطويرات',
    ab_sound: 'الأصوات', ab_music: 'المزيكا', ab_on: 'شغّال', ab_off: 'مقفول', ab_reset: 'امسح التقدّم', ab_reset_q: 'متأكد إنك عايز تمسح كل التقدّم؟',
    ab_day: 'اليوم {n}', ab_dayof: 'زبون {a} من {b}', ab_customers: '{n} زباين', ab_goal: 'الهدف: {n} قلب', ab_strikes_lim: 'لو {n} زباين مشيوا زعلانين المحل هيقفل',
    ab_new_ing: 'مكوّن جديد!', ab_new_cust: 'زبون جديد!', ab_open: 'افتح المحل', ab_serve: 'قدّم', ab_dump: 'كبّ',
    ab_peek: 'اقرا مزاجه', ab_peek_cost: 'اقرا مزاجه ({n})', ab_free: 'ببلاش', ab_mystery: 'زبون غامض — مزاجه مستخبي! افهمه من كلامه.',
    ab_board: 'لوحة المزاج', ab_match: 'التطابق', ab_wanted: 'المطلوب', ab_yours: 'مشروبك',
    ab_warm: 'دافي', ab_cold: 'ساقع', ab_bright: 'منوّر', ab_gloomy: 'كئيب', ab_chaotic: 'مجنون', ab_calm: 'هادي',
    ab_z_hot: 'سخن', ab_z_cold: 'متلّج', ab_z_mild: 'عادي',
    ab_full: 'الكوباية اتملت!', ab_empty: 'حط مكونات الأول', ab_busy: 'استنى الزبون الجاي',
    ab_paused: 'وقفة', ab_resume: 'كمّل', ab_restart: 'ابدأ اليوم من الأول', ab_menu: 'القايمة الرئيسية', ab_back: 'رجوع',
    ab_win: 'اليوم خلص بنجاح!', ab_lose: 'المحل قفل بدري…', ab_lose_strikes: 'زباين كتير مشيوا زعلانين.', ab_lose_hearts: 'القلوب مجمعتش الهدف ({h} من {g}).',
    ab_next: 'اليوم اللي بعده', ab_retry: 'جرّب تاني', ab_sum_hearts: 'القلوب', ab_sum_tips: 'البقشيش', ab_sum_perfect: 'مشروبات مظبوطة', ab_best: 'أحسن نتيجة: {n} قلب',
    ab_endless: 'خلّصت الـ20 يوم! الليالي اللانهائية مستنياك… والزباين بيبقوا أصعب.',
    ab_r3: 'تحفة! ده بالظبط اللي حاسس بيه!', ab_r2: 'حلو أوي، قريب جدًا. شكرًا!', ab_r1: 'امم… مش أوي، بس ماشي.', ab_r0: 'إيه ده؟! ده مش مزاجي خالص!', ab_rangry: 'مش قادر أستنى أكتر من كده!',
    ab_v3: 'مظبوط!', ab_v2: 'جميل!', ab_v1: 'ماشي', ab_v0: 'وحش!', ab_combo: 'كومبو ×{n}', ab_late: 'اتأخرت!',
    ab_buy: 'اشتري', ab_owned: 'عندك ✓', ab_wallet: 'معاك {n} بقشيش', ab_cant: 'محتاج بقشيش أكتر', ab_locked: 'مقفول', ab_ok: 'تمام',
    ab_x_ignite: 'ولّع!', ab_x_fizzle: 'طفي…', ab_x_boil: 'فار!', ab_x_glow: 'لمع!', ab_x_erupt: 'فرقع!', ab_x_fade: 'بهت…', ab_x_thunder: 'رعد!', ab_x_halve: 'النص!', ab_x_time: '+8 ثواني',
    ab_in_hot: 'في كوباية سخنة (70° وأكتر):', ab_in_cold: 'في كوباية متلّجة (30° وأقل):', ab_now: 'دلوقتي',
    ab_h1: 'كل زبون بيطلب مشروب بكلام شاعري، والمثلث الدهبي على لوحة المزاج هو المزاج اللي عايزه.',
    ab_h2: 'المزاج ليه 3 محاور: دافي ↔ ساقع، منوّر ↔ كئيب، مجنون ↔ هادي.',
    ab_h3: 'اسحب المكونات للكوباية (أو دوس عليها). كل مكوّن بيزق المزاج في اتجاه معروف — وإنت ساحب هتشوف هيودّيك فين.',
    ab_h4: 'الترمومتر: المشروب السخن أدفى والمتلّج أسقع. وفيه مكونات بتتفاعل مع الحرارة لحظة ما تحطها (70° وأكتر أو 30° وأقل).',
    ab_h5: 'قدّم قبل ما صبر الزبون يخلص. كل ما المثلثين يتطابقوا أكتر وتقدّم أسرع، تاخد قلوب وبقشيش أكتر.',
    ab_h6: 'اجمع قلوب كفاية عشان تعدّي اليوم، واصرف البقشيش على ديكور بيساعدك.',
    ab_keys: 'الكيبورد: 1-9 و0 ومن Q لحد P للمكونات، ↑↓ للحرارة، Space للتقديم، Backspace للكبّ، P أو Esc للوقفة.',
    ab_c1: 'ده طلب الزبون. المثلث الدهبي على اللوحة هو المزاج اللي عايزه.',
    ab_c2: 'اسحب مكوّن للكوباية — أو دوس عليه. شوف مثلث مشروبك بيتحرك!',
    ab_c3: 'خلّي مثلثك يغطي المثلث الدهبي. الترمومتر بيظبط الدفا.',
    ab_c4: 'لما يبقى قريب، دوس قدّم!',
    ab_tip_phoenix: 'ريش العنقاء بيولّع بس في كوباية سخنة! علّي الحرارة لـ70° أو أكتر الأول، وبعدين حطه.',
    ab_tip_mystery: 'من النهارده فيه زباين غامضين: مزاجهم مستخبي، فافهمه من كلامهم — أو ادفع بقشيش واقرا مزاجهم.',
    ab_tip_cold: 'ندى القمر بيلمع أكتر في كوباية متلّجة (30° وأقل).',
    ab_tip_void: 'ملح العدم بيرجّع المشروب ناحية النص — مفيد لو زوّدتها.',
    ab_tip_sand: 'رمل الزمن بيدّي الزبون وقت زيادة يستنى فيه.',
    ab_tip_generic: 'جرّب المكوّن الجديد واسحبه فوق الكوباية عشان تشوف بيعمل إيه.',
    ab_i_starlight: 'شراب ضوء النجوم', ab_d_starlight: 'بينوّر المزاج.',
    ab_i_shadow: 'ضلّ سايل', ab_d_shadow: 'بيخلّي المزاج كئيب وغامض.',
    ab_i_cocoa: 'كاكاو الجمر', ab_d_cocoa: 'بيدفّي المزاج.',
    ab_i_frostmint: 'نعناع التلج', ab_d_frostmint: 'بيسقّع المزاج.',
    ab_i_fizz: 'فوّار الرعد', ab_d_fizz: 'بيخلّي المزاج مجنون. في السخونية بيفور أكتر!',
    ab_i_cream: 'كريمة السحاب', ab_d_cream: 'بتهدّي المزاج.',
    ab_i_phoenix: 'ريش العنقاء', ab_d_phoenix: 'لوحده خفيف، بس في كوباية سخنة بيولّع: دفا ونور وجنان! في المتلّج بيطفي.',
    ab_i_moondew: 'ندى القمر', ab_d_moondew: 'ساقع ومنوّر وهادي. في المتلّج بيلمع أكتر.',
    ab_i_pepper: 'فلفل التنين', ab_d_pepper: 'دفا وجنان. في السخونية بيفرقع!',
    ab_i_honey: 'عسل الأشباح', ab_d_honey: 'دافي وكئيب وهادي — طعمه حنين. في المتلّج بيبقى أكأب.',
    ab_i_storm: 'خلاصة العاصفة', ab_d_storm: 'ساقعة وكئيبة ومجنونة. في السخونية بترعد أكتر.',
    ab_i_pollen: 'لقاح قوس قزح', ab_d_pollen: 'منوّر ومجنون وفيه دفا خفيف.',
    ab_i_void: 'ملح العدم', ab_d_void: 'بيقسم كل المشاعر على 2 — بيرجّع المشروب ناحية النص.',
    ab_i_sand: 'رمل الزمن', ab_d_sand: 'بيدّي الزبون 8 ثواني صبر زيادة وبيهدّي شوية.',
    ab_cr_dragon: 'تنين صغير', ab_cr_ghost: 'شبح خجول', ab_cr_wizard: 'ساحر عجوز', ab_cr_slime: 'سلايم', ab_cr_mushroom: 'عفريت المشروم',
    ab_cr_yeti: 'يتي', ab_cr_fox: 'ثعلب الأرواح', ab_cr_owl: 'بومة حكيمة', ab_cr_golem: 'جولم حجري',
    ab_dc_lights: 'أنوار الجنيات', ab_dd_lights: 'البقشيش بيزيد 5٪.',
    ab_dc_plant: 'زرعة زهرة القمر', ab_dd_plant: 'كل زبون بيستنى 4 ثواني زيادة.',
    ab_dc_candles: 'شموع طايرة', ab_dd_candles: 'البقشيش بيزيد 5٪.',
    ab_dc_kettle: 'غلاية سريعة', ab_dd_kettle: 'الحرارة بتتغير أسرع مرتين.',
    ab_dc_mug: 'مج أكبر', ab_dd_mug: 'مكان لمكوّن زيادة في الكوباية.',
    ab_dc_musicbox: 'صندوق موسيقى', ab_dd_musicbox: 'الصبر بيخلص أبطأ 15٪.',
    ab_dc_painting: 'لوحة خريطة النجوم', ab_dd_painting: 'البقشيش بيزيد 8٪.',
    ab_dc_cat: 'قطة سحرية', ab_dd_cat: 'الزباين بيسامحوا غلطة زيادة.',
    ab_dc_crystal: 'كورة الكريستال', ab_dd_crystal: 'قراية مزاج الزباين الغامضين ببلاش.',
    ab_dc_aquarium: 'حوض سمك منوّر', ab_dd_aquarium: 'البقشيش بيزيد 10٪.',
    ab_stats: 'قدّمت {a} مشروب — منهم {b} مظبوطين', ab_hello: 'أهلاً يا {p}! المحل مستنيك.',
    // days 13-20
    ab_i_sakura: 'ورق الساكورا', ab_d_sakura: 'منوّر وهادي وفيه دفا خفيف. في المتلّج بيفتّح أكتر.',
    ab_i_mirror: 'مية المراية', ab_d_mirror: 'بتقلب النور والكآبة — المشروب المنوّر يبقى كئيب والعكس.',
    ab_i_aurora: 'ضباب الشفق', ab_d_aurora: 'ساقع ومنوّر ومجنون شوية. في المتلّج بيلمع أكتر.',
    ab_i_dreamtea: 'شاي الأحلام', ab_d_dreamtea: 'هادي وكئيب شوية. في الكوباية السخنة بيروّق أكتر.',
    ab_i_comet: 'تراب المذنّب', ab_d_comet: 'بيقوّي كل المشاعر مرة ونص — عكس ملح العدم.',
    ab_i_lava: 'كراميل البركان', ab_d_lava: 'دافي وكئيب ومجنون. في السخونية بيفرقع، وفي المتلّج بيتحجّر.',
    ab_cr_chick: 'كتكوت عنقاء', ab_cr_jelly: 'قنديل القمر', ab_cr_robot: 'روبوت بالزمبلك', ab_cr_bat: 'خفاش نعسان', ab_cr_sheep: 'خروف السحاب',
    ab_x_mirror: 'اتقلب!', ab_x_amplify: 'اتقوّى!', ab_x_bloom: 'فتّح!', ab_x_soothe: 'روّق…', ab_x_stone: 'اتحجّر!',
    ab_tip_sakura: 'ورق الساكورا بيفتّح أكتر في الكوباية المتلّجة (30° وأقل).',
    ab_tip_mirror: 'مية المراية بتقلب المنوّر ↔ الكئيب. حطها لما مشروبك يبقى عكس المطلوب في النور بالظبط.',
    ab_tip_comet: 'تراب المذنّب بيقوّي المشروب كله مرة ونص — حلو للزباين اللي مزاجهم قوي أوي.',
    ab_tip_lava: 'كراميل البركان بيفرقع في الكوباية السخنة (70° وأكتر) وبيتحجّر في المتلّجة.',
    ab_tip_finale: 'آخر يوم في الموسم! الزباين صعبين أوي — وريهم أحلى مشروبات عندك.',
  };
  const EN = {
    ab_title: 'Alchemy Barista', ab_sub: 'A cozy cafe for magical creatures — brew every customer exactly the mood they ordered',
    ab_play: 'Play', ab_continue: 'Continue — day {n}', ab_days: 'Days', ab_how: 'How to play', ab_shop: 'Decor & upgrades',
    ab_sound: 'Sound', ab_music: 'Music', ab_on: 'on', ab_off: 'off', ab_reset: 'Reset progress', ab_reset_q: 'Erase all your progress?',
    ab_day: 'Day {n}', ab_dayof: 'Customer {a} of {b}', ab_customers: '{n} customers', ab_goal: 'Goal: {n} hearts', ab_strikes_lim: '{n} unhappy customers and the cafe closes.',
    ab_new_ing: 'New ingredient!', ab_new_cust: 'New customer!', ab_open: 'Open the cafe', ab_serve: 'Serve', ab_dump: 'Dump',
    ab_peek: 'Read mood', ab_peek_cost: 'Read mood ({n})', ab_free: 'free', ab_mystery: 'Mysterious customer — their mood is hidden! Read their words.',
    ab_board: 'Mood board', ab_match: 'Match', ab_wanted: 'Wanted', ab_yours: 'Your brew',
    ab_warm: 'warm', ab_cold: 'cold', ab_bright: 'bright', ab_gloomy: 'gloomy', ab_chaotic: 'chaotic', ab_calm: 'calm',
    ab_z_hot: 'hot', ab_z_cold: 'iced', ab_z_mild: 'mild',
    ab_full: 'The cup is full!', ab_empty: 'Add some ingredients first', ab_busy: 'Wait for the next customer',
    ab_paused: 'Paused', ab_resume: 'Resume', ab_restart: 'Restart day', ab_menu: 'Main menu', ab_back: 'Back',
    ab_win: 'Day complete!', ab_lose: 'The cafe closed early…', ab_lose_strikes: 'Too many customers left unhappy.', ab_lose_hearts: 'Not enough mood hearts ({h} of {g}).',
    ab_next: 'Next day', ab_retry: 'Try again', ab_sum_hearts: 'Hearts', ab_sum_tips: 'Tips', ab_sum_perfect: 'Perfect drinks', ab_best: 'Best: {n} hearts',
    ab_endless: 'You finished all 20 days! Endless nights await… and the customers get pickier.',
    ab_r3: 'Perfect! That is exactly how I feel!', ab_r2: 'Mmm, so close. Thank you!', ab_r1: 'Hmm… not quite, but okay.', ab_r0: 'Ew! That is not my mood at all!', ab_rangry: 'I can\'t wait any longer!',
    ab_v3: 'Perfect!', ab_v2: 'Lovely!', ab_v1: 'Okay', ab_v0: 'Yuck!', ab_combo: 'Combo ×{n}', ab_late: 'Too slow!',
    ab_buy: 'Buy', ab_owned: 'Owned ✓', ab_wallet: '{_}You have {n} tips', ab_cant: 'Need more tips', ab_locked: 'Locked', ab_ok: 'Got it',
    ab_x_ignite: 'Ignited!', ab_x_fizzle: 'Fizzled…', ab_x_boil: 'Boiled over!', ab_x_glow: 'Glows!', ab_x_erupt: 'Erupts!', ab_x_fade: 'Fades…', ab_x_thunder: 'Thunder!', ab_x_halve: 'Halved!', ab_x_time: '+8 seconds',
    ab_in_hot: 'In a hot cup (70° and up):', ab_in_cold: 'In an iced cup (30° and below):', ab_now: 'now',
    ab_h1: 'Every customer orders with poetic words. The gold triangle on the mood board is the mood they want.',
    ab_h2: 'A mood has 3 axes: warm ↔ cold, bright ↔ gloomy, chaotic ↔ calm.',
    ab_h3: 'Drag ingredients into the cup (or tap them). Each one pushes the mood in a known direction — while dragging you can see where it will take you.',
    ab_h4: 'The thermometer: hot drinks feel warmer, iced drinks colder. Some ingredients react to the temperature the moment you add them (70° and up, or 30° and below).',
    ab_h5: 'Serve before their patience runs out. The closer the triangles match and the faster you serve, the more hearts and tips you get.',
    ab_h6: 'Collect enough hearts to pass the day, and spend your tips on decor that helps you.',
    ab_keys: 'Keyboard: 1-9, 0 and Q to P for ingredients, ↑↓ for heat, Space to serve, Backspace to dump, P or Esc to pause.',
    ab_c1: 'This is the order. The gold triangle on the board is the mood they want.',
    ab_c2: 'Drag an ingredient into the cup — or tap it. Watch your brew\'s triangle move!',
    ab_c3: 'Make your triangle cover the gold one. The thermometer fine-tunes warmth.',
    ab_c4: 'When it looks close, tap Serve!',
    ab_tip_phoenix: 'Phoenix feather only ignites in a hot cup! Raise the heat to 70° or more first, then add it.',
    ab_tip_mystery: 'Mysterious customers start today: their mood is hidden, so read it from their words — or pay some tips to read their mood.',
    ab_tip_cold: 'Moon dew glows brighter in an iced cup (30° or below).',
    ab_tip_void: 'Void salt pulls the drink back toward the middle — handy when you overdo it.',
    ab_tip_sand: 'Time sand gives the customer extra patience.',
    ab_tip_generic: 'Try the new ingredient — drag it over the cup to see what it does.',
    ab_i_starlight: 'Starlight syrup', ab_d_starlight: 'Makes the mood brighter.',
    ab_i_shadow: 'Liquid shadow', ab_d_shadow: 'Makes the mood gloomy and mysterious.',
    ab_i_cocoa: 'Ember cocoa', ab_d_cocoa: 'Warms the mood.',
    ab_i_frostmint: 'Frost mint', ab_d_frostmint: 'Cools the mood down.',
    ab_i_fizz: 'Thunder fizz', ab_d_fizz: 'Makes the mood chaotic. Boils over even wilder when hot!',
    ab_i_cream: 'Cloud cream', ab_d_cream: 'Calms the mood.',
    ab_i_phoenix: 'Phoenix feather', ab_d_phoenix: 'Mild on its own, but in a hot cup it ignites: warm, bright and wild! Fizzles out when iced.',
    ab_i_moondew: 'Moon dew', ab_d_moondew: 'Cool, bright and calm. Glows even more when iced.',
    ab_i_pepper: 'Dragon pepper', ab_d_pepper: 'Warm and wild. Erupts when hot!',
    ab_i_honey: 'Ghost honey', ab_d_honey: 'Warm, gloomy and calm — tastes like nostalgia. Gloomier when iced.',
    ab_i_storm: 'Storm essence', ab_d_storm: 'Cold, gloomy and wild. Thunders harder when hot.',
    ab_i_pollen: 'Rainbow pollen', ab_d_pollen: 'Bright, lively and a little warm.',
    ab_i_void: 'Void salt', ab_d_void: 'Halves every feeling — pulls the drink back toward the middle.',
    ab_i_sand: 'Time sand', ab_d_sand: 'Gives the customer 8 more seconds of patience and calms a bit.',
    ab_cr_dragon: 'Little dragon', ab_cr_ghost: 'Shy ghost', ab_cr_wizard: 'Old wizard', ab_cr_slime: 'Slime', ab_cr_mushroom: 'Mushroom sprite',
    ab_cr_yeti: 'Yeti', ab_cr_fox: 'Spirit fox', ab_cr_owl: 'Wise owl', ab_cr_golem: 'Stone golem',
    ab_dc_lights: 'Fairy lights', ab_dd_lights: 'Tips go up by 5%.',
    ab_dc_plant: 'Moonflower plant', ab_dd_plant: 'Every customer waits 4 seconds longer.',
    ab_dc_candles: 'Floating candles', ab_dd_candles: 'Tips go up by 5%.',
    ab_dc_kettle: 'Quick kettle', ab_dd_kettle: 'The temperature changes twice as fast.',
    ab_dc_mug: 'Bigger mug', ab_dd_mug: 'Room for one more ingredient in the cup.',
    ab_dc_musicbox: 'Music box', ab_dd_musicbox: 'Patience drains 15% slower.',
    ab_dc_painting: 'Star map painting', ab_dd_painting: 'Tips go up by 8%.',
    ab_dc_cat: 'Magic cat', ab_dd_cat: 'Customers forgive one extra mistake.',
    ab_dc_crystal: 'Crystal ball', ab_dd_crystal: 'Read mysterious moods for free.',
    ab_dc_aquarium: 'Glowfish tank', ab_dd_aquarium: 'Tips go up by 10%.',
    ab_stats: 'You have served {a} drinks — {b} of them perfect.', ab_hello: 'Welcome, {p}! The cafe awaits.',
    // days 13-20
    ab_i_sakura: 'Sakura petals', ab_d_sakura: 'Bright, calm and a little warm. Blooms brighter when iced.',
    ab_i_mirror: 'Mirror water', ab_d_mirror: 'Flips bright and gloomy — a bright drink turns gloomy, and back again.',
    ab_i_aurora: 'Aurora mist', ab_d_aurora: 'Cold, bright and a little wild. Shines even more when iced.',
    ab_i_dreamtea: 'Dream tea', ab_d_dreamtea: 'Calm and a little gloomy. In a hot cup it soothes even more.',
    ab_i_comet: 'Comet dust', ab_d_comet: 'Makes every feeling 1.5× stronger — the opposite of void salt.',
    ab_i_lava: 'Lava caramel', ab_d_lava: 'Warm, gloomy and wild. Erupts when hot, turns to stone when iced.',
    ab_cr_chick: 'Phoenix chick', ab_cr_jelly: 'Moon jelly', ab_cr_robot: 'Clockwork robot', ab_cr_bat: 'Sleepy bat', ab_cr_sheep: 'Cloud sheep',
    ab_x_mirror: 'Flipped!', ab_x_amplify: 'Stronger!', ab_x_bloom: 'Blooms!', ab_x_soothe: 'Soothing…', ab_x_stone: 'Turned to stone!',
    ab_tip_sakura: 'Sakura petals bloom brighter in an iced cup (30° or below).',
    ab_tip_mirror: 'Mirror water flips bright ↔ gloomy. Add it when your drink\'s brightness is the exact opposite of the order.',
    ab_tip_comet: 'Comet dust makes the whole drink 1.5× stronger — great for customers with very strong moods.',
    ab_tip_lava: 'Lava caramel erupts in a hot cup (70° and up) and turns to stone in an iced one.',
    ab_tip_finale: 'The last day of the season! The customers are very picky — show them your best brews.',
  };
  // order phrases: [Egyptian Arabic, English, warm, bright, chaotic]
  const PHRASES = [
    ['يوم تلات فيه عاصفة', 'a stormy Tuesday', -0.2, -0.45, 0.45],
    ['الحنين للماضي', 'nostalgia', 0.35, -0.2, -0.35],
    ['شط مشمس', 'a sunny beach', 0.45, 0.45, 0.1],
    ['حفلة عيد ميلاد تنين', 'a dragon\'s birthday party', 0.4, 0.3, 0.55],
    ['مكتبة هادية', 'a quiet library', 0, -0.1, -0.5],
    ['صباح تلجي', 'a snowy morning', -0.5, 0.3, -0.2],
    ['سندرة مسكونة', 'a haunted attic', -0.2, -0.5, 0.2],
    ['مطبخ تيتة', 'grandma\'s kitchen', 0.5, 0.15, -0.2],
    ['أول يوم مدرسة', 'the first day of school', 0, 0.2, 0.45],
    ['يوم جمعة كسول', 'a lazy Friday', 0.2, 0.1, -0.5],
    ['عاصفة رعد في البحر', 'a thunderstorm at sea', -0.3, -0.35, 0.6],
    ['شمعة في الضلمة', 'a candle in the dark', 0.3, -0.3, -0.25],
    ['ألعاب نارية في العيد', 'fireworks on a holiday', 0.25, 0.5, 0.55],
    ['حلم اتنسى', 'a forgotten dream', -0.1, -0.35, -0.25],
    ['ليلة شتا', 'a winter night', -0.45, -0.35, -0.1],
    ['بطانية دافية', 'a cozy blanket', 0.5, 0, -0.4],
    ['فردة شراب تايهة', 'a lost sock', -0.1, -0.3, 0.2],
    ['قوس قزح بعد المطر', 'a rainbow after the rain', 0.1, 0.55, 0.1],
    ['عطسة بركان', 'a volcano\'s sneeze', 0.55, 0.1, 0.5],
    ['جنينة في نور القمر', 'a moonlit garden', -0.15, 0.25, -0.4],
    ['امتحان مفاجئ', 'a surprise quiz', -0.1, -0.2, 0.5],
    ['حضن دافي', 'a warm hug', 0.55, 0.2, -0.2],
    ['معاملة باردة', 'a cold shoulder', -0.5, -0.2, 0],
    ['صاعقة برق', 'a lightning bolt', 0, 0.35, 0.6],
    ['ألبوم صور قديم', 'an old photo album', 0.25, -0.15, -0.3],
    ['شباك عليه مطر', 'a rainy window', -0.2, -0.3, -0.3],
    ['سما مليانة نجوم', 'a starry sky', -0.1, 0.45, -0.2],
    ['سوق زحمة', 'a busy market', 0.3, 0.15, 0.5],
    ['تهويدة شبح', 'a ghost\'s lullaby', -0.25, -0.3, -0.4],
    ['آيس كريم بالنعناع', 'mint ice cream', -0.5, 0.3, 0.1],
    ['مغامرة نص الليل', 'a midnight adventure', -0.1, -0.35, 0.45],
    ['قطة نعسانة', 'a sleepy cat', 0.3, 0.05, -0.5],
    ['مهرجان صيفي', 'a summer festival', 0.45, 0.4, 0.4],
    ['بحيرة متلجة', 'a frozen lake', -0.55, 0.1, -0.3],
    ['غابة ضلمة', 'a dark forest', -0.1, -0.55, 0],
    ['شوكولاتة سخنة جنب النار', 'hot chocolate by the fire', 0.6, 0.1, -0.15],
    ['شمسية مكسورة', 'a broken umbrella', -0.2, -0.35, 0.3],
    ['عطسة ساحر', 'a wizard\'s sneeze', 0, 0.3, 0.45],
    ['شروق الشمس', 'a sunrise', 0.3, 0.55, 0],
    ['صباح يوم اتنين', 'a Monday morning', -0.15, -0.35, 0.2],
    // moods from day 13 on
    ['نزهة تحت شجر الساكورا', 'a cherry blossom picnic', 0.2, 0.45, -0.2, 13],
    ['أول حلم لروبوت', 'a robot\'s first dream', -0.2, 0.15, -0.3, 13],
    ['ديسكو قناديل البحر', 'a jellyfish disco', -0.15, 0.4, 0.5, 14],
    ['حدوتة قبل النوم لخفاش', 'a bat\'s bedtime story', -0.1, -0.45, -0.4, 14],
    ['تهويدة بركان', 'a volcano\'s lullaby', 0.5, -0.25, -0.2, 15],
    ['قوس قزح بالمقلوب', 'an upside-down rainbow', 0, -0.4, 0.35, 15],
    ['الشفق القطبي', 'the northern lights', -0.45, 0.4, 0.2, 16],
    ['موكب لعب بالزمبلك', 'a clockwork parade', 0.1, 0.25, 0.5, 17],
    ['خروف بيعدّ النجوم', 'a sheep counting stars', 0, 0.3, -0.5, 18],
    ['نار مخيم نص الليل', 'a midnight bonfire', 0.5, -0.4, 0.3, 18],
    ['متاهة مرايات', 'a hall of mirrors', -0.2, 0.05, 0.5, 19],
    ['جبل تلج بيسيح', 'a melting glacier', -0.4, -0.2, 0.3, 20],
  ];
  const TPL = [
    ['عايز حاجة طعمها زي {a} وريحتها زي {b}.', 'I need something that tastes like {a} and smells like {b}.'],
    ['اعملّي مشروب إحساسه زي {a}، وفيه لمسة {b}.', 'Make me a drink that feels like {a}, with a hint of {b}.'],
    ['حاجة شبه {a}… بس فيها شوية {b}، لو سمحت.', 'Something like {a}… but with a little {b}, please.'],
    ['ممكن تعملّي {a}؟ وزوّد عليه رشة {b}.', 'Could you brew me {a}? Add a splash of {b}.'],
    ['النهارده مزاجي زي {a} ومعاه {b}.', 'Today my mood is {a} mixed with {b}.'],
    ['كوباية {a} متقلّبة مع {b}، لو سمحت!', 'One cup of {a}, stirred with {b}, please!'],
    ['اعملّي {a}… وفي الآخر رشّ عليه شوية {b}.', 'Brew me {a}… and sprinkle a little {b} on top.', 13],
    ['مزاجي النهارده: {a} فوقه {b}.', 'My mood today: {a} with {b} on top.', 16],
  ];
  PHRASES.forEach((p, i) => { AR['ab_p' + i] = '{_}' + p[0]; EN['ab_p' + i] = '{_}' + p[1]; });
  TPL.forEach((p, i) => { AR['ab_t' + i] = p[0]; EN['ab_t' + i] = p[1]; });
  addStrings(AR, EN);
  const frag = (k) => t(k, { _: '' });   // sentence fragments: no automatic Title Case

  // ============================================================ data
  const TEMP_W = 0.2;   // a hot (100°) drink is +0.2 warmer, an iced (0°) one -0.2
  const ING = [
    { id: 'starlight', day: 1, v: [0, 0.4, 0], color: '#ffe596', color2: '#fff8d6', shape: 'flask', fx: 'sparkle', lid: '#c79a3a' },
    { id: 'shadow', day: 1, v: [0, -0.4, 0], color: '#3b2163', color2: '#140a26', shape: 'tall', fx: 'smoke', lid: '#4a3a5a' },
    { id: 'cocoa', day: 1, v: [0.4, 0, 0], color: '#a24c22', color2: '#cf6c30', shape: 'jar', fx: 'cocoa', lid: '#6b3a1e' },
    { id: 'frostmint', day: 1, v: [-0.4, 0, 0], color: '#79e0f4', color2: '#d4fbff', shape: 'vial', fx: 'frost', lid: '#4a8aa0' },
    { id: 'fizz', day: 2, v: [0, 0, 0.4], hot: [0, 0.1, 0.6], hotFx: 'boil', color: '#c4f040', color2: '#f2ff9a', shape: 'tall', fx: 'fizz', lid: '#5a7a20' },
    { id: 'cream', day: 2, v: [0, 0, -0.4], color: '#f4ebe0', color2: '#ffffff', shape: 'pot', fx: 'cloud', lid: '#b0a090' },
    { id: 'phoenix', day: 3, v: [0.15, 0.1, 0.1], hot: [0.45, 0.35, 0.3], cold: [0, 0, 0], hotFx: 'ignite', coldFx: 'fizzle', color: '#ff7a2a', color2: '#ffc04a', shape: 'jar', fx: 'feather', lid: '#a83a1a' },
    { id: 'moondew', day: 4, v: [-0.2, 0.3, -0.2], cold: [-0.3, 0.45, -0.3], coldFx: 'glow', color: '#b3beff', color2: '#e8ecff', shape: 'flask', fx: 'moon', lid: '#6a72b8' },
    { id: 'pepper', day: 5, v: [0.3, 0, 0.3], hot: [0.45, 0.1, 0.5], hotFx: 'erupt', color: '#e2352c', color2: '#ff7a3a', shape: 'pot', fx: 'pepper', lid: '#3c7a2e' },
    { id: 'honey', day: 6, v: [0.25, -0.25, -0.2], cold: [0.1, -0.4, -0.3], coldFx: 'fade', color: '#c99a3e', color2: '#ecc86c', shape: 'jar', fx: 'honey', lid: '#7a6a5a' },
    { id: 'storm', day: 7, v: [-0.15, -0.3, 0.35], hot: [-0.05, -0.35, 0.55], hotFx: 'thunder', color: '#4b5f8c', color2: '#8a9cc8', shape: 'flask', fx: 'storm', lid: '#2c3a5a' },
    { id: 'pollen', day: 8, v: [0.15, 0.35, 0.25], color: '#ff8fc8', color2: '#ffd0ea', shape: 'vial', fx: 'rainbow', lid: '#c060a0' },
    { id: 'void', day: 9, special: 'halve', v: [0, 0, 0], color: '#1d1828', color2: '#2e2640', shape: 'pot', fx: 'void', lid: '#3a3448' },
    { id: 'sand', day: 10, special: 'time', v: [0, 0, -0.1], color: '#e6c47c', color2: '#f5dca0', shape: 'hourglass', fx: '', lid: '#8a5a2e' },
    // days 13-20
    { id: 'sakura', day: 13, v: [0.1, 0.25, -0.3], cold: [0, 0.4, -0.35], coldFx: 'bloom', color: '#ffb3cf', color2: '#ffe3ee', shape: 'vial', fx: 'petals', lid: '#c0607e' },
    { id: 'mirror', day: 14, special: 'mirror', v: [0, 0, 0], color: '#bfe9ff', color2: '#f0fbff', shape: 'flask', fx: 'mirror', lid: '#7aa8c8' },
    { id: 'aurora', day: 15, v: [-0.25, 0.3, 0.25], cold: [-0.35, 0.45, 0.35], coldFx: 'glow', color: '#5fe0b8', color2: '#c09bff', shape: 'tall', fx: 'aurora', lid: '#3a7a6a' },
    { id: 'dreamtea', day: 16, v: [0.1, -0.15, -0.4], hot: [0.25, -0.05, -0.55], hotFx: 'soothe', color: '#9a7ac8', color2: '#d4c0f0', shape: 'pot', fx: 'bubbles', lid: '#5a4a7a' },
    { id: 'comet', day: 17, special: 'amplify', v: [0, 0, 0], color: '#2f3580', color2: '#7f8fff', shape: 'jar', fx: 'comet', lid: '#c99a3a' },
    { id: 'lava', day: 19, v: [0.3, -0.25, 0.25], hot: [0.5, -0.3, 0.45], cold: [0.05, -0.2, 0], hotFx: 'erupt', coldFx: 'stone', color: '#d8442a', color2: '#ffa63a', shape: 'jar', fx: 'lava', lid: '#3a2420' },
  ];
  const INGM = {}; ING.forEach((g, i) => { INGM[g.id] = g; g.idx = i; g.rgb = hex2rgb(g.color); });
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const PH = PHRASES.map(p => ({ v: [p[2], p[3], p[4]], day: p[5] || 1 }));
  const CREATURES = {
    dragon: { day: 1, tip: 12, pat: 0.85, hues: [135, 160, 0, 280, 25] },
    ghost: { day: 1, tip: 8, pat: 1.05, hues: [0] },
    wizard: { day: 1, tip: 11, pat: 1.0, hues: [255, 220, 300, 170] },
    slime: { day: 2, tip: 7, pat: 1.15, hues: [150, 200, 320, 45, 270] },
    mushroom: { day: 3, tip: 8, pat: 1.0, hues: [4, 30, 200, 280] },
    yeti: { day: 5, tip: 9, pat: 1.1, hues: [null, 200, 260] },
    fox: { day: 5, tip: 10, pat: 0.9, hues: [24, 200, 0, 300] },
    owl: { day: 7, tip: 10, pat: 1.05, hues: [28, 10, 210] },
    golem: { day: 7, tip: 9, pat: 1.2, hues: [185, 120, 300, 40] },
    chick: { day: 13, tip: 13, pat: 0.8, hues: [18, 40, 330] },
    jelly: { day: 15, tip: 11, pat: 1.1, hues: [270, 200, 320] },
    robot: { day: 17, tip: 12, pat: 1.0, hues: [35, 190, 0] },
    bat: { day: 18, tip: 10, pat: 0.95, hues: [270, 230, 340] },
    sheep: { day: 20, tip: 14, pat: 1.0, hues: [null, 200, 300] },
  };
  const DECOR = [
    { id: 'lights', price: 30, tips: 0.05 }, { id: 'plant', price: 45 }, { id: 'candles', price: 60, tips: 0.05 },
    { id: 'kettle', price: 70 }, { id: 'mug', price: 90 }, { id: 'musicbox', price: 100 }, { id: 'painting', price: 120, tips: 0.08 },
    { id: 'cat', price: 150 }, { id: 'crystal', price: 180 }, { id: 'aquarium', price: 220, tips: 0.10 },
  ];
  // the three mood axes, drawn as a hexagon of six poles
  const AX = [
    { pos: 'warm', neg: 'cold', ip: 'flame', in: 'snow', cp: '#ff9a52', cn: '#7fd8ff', ang: -Math.PI / 2 },
    { pos: 'bright', neg: 'gloomy', ip: 'sun', in: 'moon', cp: '#ffe066', cn: '#b494ff', ang: Math.PI / 6 },
    { pos: 'chaotic', neg: 'calm', ip: 'bolt', in: 'leaf', cp: '#ff72b6', cn: '#7ee3a4', ang: Math.PI * 5 / 6 },
  ];

  // ============================================================ helpers
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3);
  const easeIO = (k) => k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a == null ? 1 : a})`;
  const mixRgb = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const FONT = "'Segoe UI', Tahoma, 'DejaVu Sans', Arial, sans-serif";
  const $ = (id) => document.getElementById(id);
  function srand(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t2 = Math.imul(seed ^ seed >>> 15, 1 | seed); t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2; return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296; }; }

  // ============================================================ save
  const SAVE_KEY = 'alchemy-barista-save';
  const DEF = { v: 1, maxDay: 1, tips: 0, decor: {}, best: {}, stars: {}, served: 0, perfects: 0, sound: true, music: true };
  function loadSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (s && typeof s === 'object') return Object.assign({}, DEF, s, { decor: Object.assign({}, s.decor), best: Object.assign({}, s.best), stars: Object.assign({}, s.stars) });
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEF));
  }
  let save = loadSave();
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  // 🏆 Best: total stars over all solo days (online days never touch the solo save)
  function reportBest() { const n = Object.values(save.stars || {}).reduce((a, v) => a + (+v || 0), 0); if (window.Mal3abBest && n > 0) Mal3abBest('alchemybarista', n); }
  if (window.Mal3abReady) reportBest(); else document.addEventListener('mal3abready', reportBest, { once: true });
  // online co-op state (the café of a room has its own coins + decor, so the solo save is never touched)
  const NET = { on: false, ch: null, code: '', ready: false, me: '', jt: 0, name: '', peers: {}, hostId: '', roster: [], room: { md: 1, co: 0, dc: {}, d: 1 }, D: null, seenEv: -1, focus: '', claimT: 0, joinedAt: 0, lastSnap: 0, msg: '' };
  let decorOverride = null;   // shop previews draw one decor item at a time
  const has = (id) => !!(decorOverride || (NET.on ? NET.room.dc : save.decor))[id];
  const coins = () => NET.on ? NET.room.co : save.tips;
  const tipBonus = () => DECOR.reduce((s, d) => s + (has(d.id) && d.tips ? d.tips : 0), 0);
  const patBonus = () => has('plant') ? 4 : 0;
  const drainMul = () => has('musicbox') ? 0.85 : 1;
  const heatRate = () => has('kettle') ? 90 : 45;
  const capacity = () => 6 + (has('mug') ? 1 : 0);
  const strikeLimit = () => 3 + (has('cat') ? 1 : 0);
  const peekCost = () => has('crystal') ? 0 : 5;

  // ============================================================ difficulty
  const LAST_DAY = 20;   // designed days; endless nights after that
  function dayCfg(d) {
    const N = [3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10];
    const n = d <= LAST_DAY ? N[d - 1] : Math.min(12, 10 + Math.floor((d - LAST_DAY) / 3));
    const late = Math.max(0, Math.min(d, LAST_DAY) - 12);   // days 13-20 ramp up gently: less patience, tighter matches, more mysteries
    return {
      d, n,
      patience: d <= 12 ? Math.max(24, 62 - d * 3) : 26 - late * 0.6,
      tol: d <= 12 ? Math.max(0.7, 1.05 - d * 0.03) : 0.7 - late * 0.0125,
      depth: Math.min(6, 2 + Math.floor((d + 1) / 2)),
      scale: Math.min(1.3, 0.8 + d * 0.04),
      mystery: d < 4 ? 0 : d <= 12 ? Math.min(0.45, 0.2 + (d - 4) * 0.035) : 0.45 + late * 0.0125,
      goal: Math.ceil(n * (d <= 12 ? Math.min(2.0, 1.3 + d * 0.06) : 2.0 + late * 0.035)),
    };
  }
  const ingsFor = (d) => ING.filter(g => g.day <= d);

  // ============================================================ mixing model
  const zoneOf = (T) => { T = Math.round(T); return T >= 70 ? 'hot' : T <= 30 ? 'cold' : 'mild'; };
  function effectOf(g, zone) {
    if (zone === 'hot' && g.hot) return { v: g.hot, fx: g.hotFx };
    if (zone === 'cold' && g.cold) return { v: g.cold, fx: g.coldFx };
    return { v: g.v, fx: g.special === 'halve' ? 'halve' : g.special === 'time' ? 'time' : g.special === 'mirror' ? 'mirror' : g.special === 'amplify' ? 'amplify' : null };
  }
  function applyTo(mix, g, zone) {
    if (g.special === 'halve') return mix.map(x => x * 0.5);
    if (g.special === 'mirror') return [mix[0], -mix[1], mix[2]];
    if (g.special === 'amplify') return mix.map(x => clamp(x * 1.5, -1, 1));
    const e = effectOf(g, zone).v; return mix.map((x, k) => clamp(x + e[k], -1, 1));
  }
  const tempW = (T) => (T - 50) / 50 * TEMP_W;
  const effMood = (mix, T) => [clamp(mix[0] + tempW(T), -1, 1), mix[1], mix[2]];
  // beam search: the closest mood reachable with these ingredients (temperature fine-tunes warmth)
  function solve(target, ings, depth) {
    const vars = [];
    for (const g of ings) { if (g.special === 'time') continue; vars.push([g, 'mild']); if (g.hot) vars.push([g, 'hot']); if (g.cold) vars.push([g, 'cold']); }
    const score = (m) => { const w = m[0] + clamp(target[0] - m[0], -TEMP_W, TEMP_W); return Math.hypot(target[0] - w, target[1] - m[1], target[2] - m[2]); };
    let beam = [{ m: [0, 0, 0], s: [] }], best = null;
    for (let dd = 0; dd < depth; dd++) {
      const next = [], seen = new Set();
      for (const b of beam) for (const [g, z] of vars) {
        const m = applyTo(b.m, g, z), key = m.map(x => Math.round(x * 50)).join(',');
        if (seen.has(key)) continue; seen.add(key);
        const node = { m, s: b.s.concat([[g.id, z]]), d: score(m) };
        next.push(node); if (!best || node.d < best.d - 1e-9) best = node;
      }
      next.sort((a, b) => a.d - b.d); beam = next.slice(0, 28);
    }
    const w = best.m[0] + clamp(target[0] - best.m[0], -TEMP_W, TEMP_W);
    return { steps: best.s, mix: best.m, eff: [w, best.m[1], best.m[2]], d: best.d };
  }
  function genOrder(cfg) {
    const ings = ingsFor(cfg.d), pool = PH.map((p, i) => i).filter(i => PH[i].day <= cfg.d); let best = null;
    for (let tries = 0; tries < 45; tries++) {
      const a = pick(pool), b = pick(pool);
      if (a === b) continue;
      if (tries < 32 && (S.usedP.has(a) || S.usedP.has(b))) continue;
      const raw = [0, 1, 2].map(k => clamp((PH[a].v[k] + PH[b].v[k]) * cfg.scale, -0.95, 0.95));
      if (Math.hypot(raw[0], raw[1], raw[2]) < 0.42) continue;
      const r = solve(raw, ings, cfg.depth);
      if (Math.hypot(r.eff[0], r.eff[1], r.eff[2]) < 0.3) continue;
      const cand = { a, b, raw, target: r.eff, recipe: r.steps, err: r.d };
      if (!best || cand.err < best.err) best = cand;
      if (r.d < 0.12) break;
    }
    if (!best) { const r = solve([0.4, 0.4, 0], ings, cfg.depth); best = { a: 2, b: 38, raw: [0.4, 0.4, 0], target: r.eff, recipe: r.steps, err: r.d }; }
    S.usedP.add(best.a); S.usedP.add(best.b);
    best.tpl = pick(TPL.map((p, i) => i).filter(i => (TPL[i][2] || 1) <= cfg.d));
    return best;
  }

  // ============================================================ audio
  const Snd = {
    ctx: null, master: null, sfx: null, mus: null, noiseBuf: null, last: {}, musT: 0, step: 0, timer: 0,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        const c = this.ctx = new AC();
        this.master = c.createGain(); this.master.gain.value = 0.8; this.master.connect(c.destination);
        this.sfx = c.createGain(); this.sfx.gain.value = save.sound ? 1 : 0; this.sfx.connect(this.master);
        this.mus = c.createGain(); this.mus.gain.value = save.music ? 1 : 0; this.mus.connect(this.master);
        const len = c.sampleRate; const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = buf; this.musT = c.currentTime + 0.3;
        this.timer = setInterval(() => this.music(), 150);
      } catch (e) { this.ctx = null; }
    },
    setGains() { if (!this.ctx) return; this.sfx.gain.value = save.sound ? 1 : 0; this.mus.gain.value = save.music ? 1 : 0; },
    tone(f, d, type, v, f2, delay, dest) {
      const c = this.ctx; if (!c) return; const t0 = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.2, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(dest || this.sfx); o.start(t0); o.stop(t0 + d + 0.05);
    },
    noise(d, v, type, f, f2, q, delay) {
      const c = this.ctx; if (!c || !this.noiseBuf) return; const t0 = c.currentTime + (delay || 0);
      const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const fl = c.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f || 1000, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + d); fl.Q.value = q || 1;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.2, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(fl); fl.connect(g); g.connect(this.sfx); s.start(t0, Math.random() * 0.5); s.stop(t0 + d + 0.05);
    },
    play(n) {
      if (!this.ctx || !save.sound) return;
      const now = performance.now(); if (this.last[n] && now - this.last[n] < 45) return; this.last[n] = now;
      switch (n) {
        case 'pour': this.noise(0.55, 0.22, 'bandpass', 700, 380, 3); for (let i = 0; i < 4; i++) this.tone(rand(380, 620), 0.07, 'sine', 0.06, rand(700, 900), 0.08 + i * 0.1); break;
        case 'plop': this.tone(520, 0.14, 'sine', 0.25, 180); break;
        case 'pop': this.tone(rand(900, 1300), 0.05, 'sine', 0.05, rand(1500, 1900)); break;
        case 'bell': this.tone(1318, 0.9, 'sine', 0.12); this.tone(1760, 0.7, 'sine', 0.08, null, 0.12); this.tone(2637, 0.5, 'sine', 0.03, null, 0.12); break;
        case 'coin': this.tone(1568, 0.09, 'square', 0.05); this.tone(2093, 0.18, 'square', 0.05, null, 0.07); break;
        case 'perfect': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.45, 'triangle', 0.13, null, i * 0.07)); break;
        case 'good': [523, 659, 784].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.12, null, i * 0.08)); break;
        case 'meh': this.tone(440, 0.25, 'triangle', 0.12); this.tone(392, 0.3, 'triangle', 0.1, null, 0.15); break;
        case 'bad': this.tone(330, 0.3, 'sawtooth', 0.06, 220); this.tone(262, 0.45, 'sawtooth', 0.06, 165, 0.18); break;
        case 'sizzle': this.noise(0.6, 0.18, 'highpass', 3000, 6000, 0.7); this.tone(160, 0.3, 'sawtooth', 0.05, 80); break;
        case 'frost': this.tone(2400, 0.4, 'sine', 0.05, 3200); this.tone(3000, 0.3, 'sine', 0.04, 2600, 0.08); break;
        case 'thunder': this.noise(0.9, 0.3, 'lowpass', 400, 80, 1); break;
        case 'magic': [880, 1175, 1568].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.07, null, i * 0.05)); break;
        case 'whoosh': this.noise(0.35, 0.12, 'bandpass', 400, 2400, 1.5); break;
        case 'gulp': this.tone(300, 0.12, 'sine', 0.2, 140); this.tone(280, 0.12, 'sine', 0.18, 130, 0.22); this.tone(260, 0.12, 'sine', 0.16, 120, 0.44); break;
        case 'drain': this.noise(0.6, 0.18, 'bandpass', 500, 200, 2); break;
        case 'click': this.tone(900, 0.04, 'square', 0.04); break;
        case 'tick': this.tone(1200, 0.03, 'sine', 0.05); break;
        case 'win': [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.12, null, i * 0.13)); break;
        case 'lose': [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.45, 'triangle', 0.11, null, i * 0.2)); break;
        case 'buy': [784, 988, 1319].forEach((f, i) => this.tone(f, 0.25, 'square', 0.04, null, i * 0.06)); break;
        case 'full': this.tone(220, 0.15, 'square', 0.05); break;
        case 'warn': this.tone(660, 0.12, 'triangle', 0.1); this.tone(520, 0.18, 'triangle', 0.1, null, 0.14); break;
      }
    },
    // soft music-box lullaby: Fmaj7 - Em7 - Dm7 - Cmaj7
    music() {
      const c = this.ctx; if (!c || !save.music || document.hidden) { if (c) this.musT = c.currentTime + 0.2; return; }
      const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], PAT = [0, 2, 1, 3, 2, 1, 3, 2], beat = 0.36;
      while (this.musT < c.currentTime + 0.6) {
        const bar = Math.floor(this.step / 8) % 4, i = this.step % 8, ch = CH[bar];
        const note = ch[PAT[i]] + 12 + (i === 3 || i === 6 ? 12 : 0), f = 440 * Math.pow(2, (note - 69) / 12);
        const dly = Math.max(0, this.musT - c.currentTime);
        this.tone(f, 1.1, 'sine', 0.028, null, dly, this.mus); this.tone(f * 2, 0.4, 'sine', 0.008, null, dly, this.mus);
        if (i === 0 || i === 4) this.tone(440 * Math.pow(2, (ch[0] - 12 - 69) / 12), 1.4, 'triangle', 0.03, null, dly, this.mus);
        this.step++; this.musT += beat;
      }
    },
  };

  // ============================================================ state
  const S = {
    screen: 'title', dayNum: Math.max(1, save.maxDay), cfg: null, custList: [], custIdx: 0, hearts: 0, strikes: 0, tipsToday: 0, perfects: 0, combo: 0,
    cust: null, usedP: new Set(), failPending: false, tut: null, coach: null, time: 0, paused: false, demoT: 0, lastResult: null,
  };
  const cup = { doses: [], mix: [0, 0, 0], T: 50, dial: 50, layers: [], wave: [], waveV: [], bubbles: [], swirls: [], state: 'idle', st: 0, levelMul: 1, pop: 1, disp: [0, 0, 0] };
  const WN = 22; for (let i = 0; i < WN; i++) { cup.wave.push(0); cup.waveV.push(0); }
  const pours = [], parts = [], texts = [];
  let shake = 0;
  const drag = { on: false, id: null, x: 0, y: 0, sx: 0, sy: 0, t0: 0, moved: false, thermo: false, pid: null, hover: null, mouse: false };

  // ============================================================ canvas + layout
  const cv = $('c'), ctx = cv.getContext('2d');
  let L = null, DPR = 1, bgBack = null, bgFront = null, jars = [];
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * DPR)); c.height = Math.max(1, Math.round(h * DPR)); const x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); return { c, x }; }
  function layout() {
    const W = window.innerWidth, H = window.innerHeight, port = W < H * 1.05;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const l = { W, H, port };
    if (!port) {
      const short = H < 540; l.short = short;
      l.top = short ? 44 : 54; l.counterY = H * 0.56; l.frontY = H * 0.70;
      l.win = short ? { x: W * 0.02, y: l.top + H * 0.03, w: W * 0.21, h: l.counterY - l.top - H * 0.05 } : { x: W * 0.045, y: l.top + H * 0.04, w: W * 0.27, h: l.counterY - l.top - H * 0.07 };
      l.custX = short ? W * 0.125 : W * 0.18; l.custS = Math.min(H * 0.34, W * 0.2);
      const thTop = l.counterY - H * (short ? 0.1 : 0.16);
      l.bubble = short ? { x: W * 0.245, y: l.top + 6, w: W * 0.41, maxH: thTop - 14 - (l.top + 6) } : { x: W * 0.315, y: l.top + 8, w: Math.min(W * 0.33, 480), maxH: Math.min(H * 0.33, thTop - 26 - (l.top + 8)) };
      l.board = { x: W * 0.665, y: l.top + 8, w: W * 0.32, h: l.counterY - l.top - 4 };
      l.cupH = Math.min(H * 0.2, W * 0.12); l.cupW = l.cupH * 0.82; l.cupX = W * 0.47; l.cupY = l.counterY + H * 0.1;
      l.th = { x: W * 0.575, top: thTop, bot: l.counterY + H * 0.105, w: Math.max(14, Math.min(22, H * 0.026)) };
      l.actions = { x: W * 0.665, y: l.counterY + H * 0.022, w: W * 0.32, h: Math.min(60, H * 0.1) };
      l.shelf = { x: 8, y: l.frontY + 4, w: W - 16, h: H - l.frontY - 8 };
      l.deco = { cat: [W * 0.36, l.counterY + H * 0.07, H * 0.075], musicbox: [W * 0.27, l.counterY + H * 0.125, H * 0.05], painting: [W * 0.355, H * 0.425, W * 0.065, H * 0.095], plant: [Math.max(W * 0.022, H * 0.065), l.top, H * 0.3] };
    } else {
      l.top = 48; l.counterY = H * 0.33; l.frontY = H * 0.70;
      l.win = { x: W * 0.03, y: l.top + H * 0.02, w: W * 0.4, h: l.counterY - l.top - H * 0.03 };
      l.custX = W * 0.22; l.custS = Math.min(H * 0.2, W * 0.4);
      l.bubble = { x: W * 0.44, y: l.top + 6, w: W * 0.56 - 8, maxH: l.counterY - l.top - 4 };
      l.board = { x: W * 0.6, y: l.counterY + H * 0.012, w: W * 0.4 - 6, h: H * 0.272 };
      l.cupH = Math.min(H * 0.15, W * 0.32); l.cupW = l.cupH * 0.82; l.cupX = W * 0.235; l.cupY = l.counterY + H * 0.225;
      l.th = { x: W * 0.515, top: l.counterY + H * 0.04, bot: l.counterY + H * 0.245, w: 14 };
      l.actions = { x: W * 0.25, y: l.counterY + H * 0.292, w: W * 0.75 - 8, h: H * 0.062 };
      l.shelf = { x: 6, y: l.frontY + 2, w: W - 12, h: H - l.frontY - 6 };
      l.deco = { cat: [W * 0.085, l.counterY + H * 0.255, H * 0.045], musicbox: [W * 0.36, l.counterY + H * 0.268, H * 0.026], painting: [W * 0.035, l.counterY + H * 0.29, W * 0.17, H * 0.055], plant: [W * 0.415, l.top, H * 0.13] };
    }
    l.big = has('mug') ? 1.08 : 1;
    L = l;
    layoutJars(); buildBg(); placeDom();
  }
  function layoutJars() {
    const list = ingsFor(S.dayNum), n = list.length, sh = L.shelf;
    const lab = L.port || L.short ? 26 : 30, cap = L.port ? 64 : L.short ? 60 : 92, cwMax = L.port ? 120 : 170;
    // pick the number of shelf rows that gives the biggest jars
    let best = null;
    for (let rows = 1; rows <= 4; rows++) {
      const cols = Math.ceil(n / rows), cw = Math.min(sh.w / cols, cwMax), ch = sh.h / rows;
      if (cw < 46) continue;
      const jw = Math.min(cw * 0.6, (ch - lab) * 0.62, cap);
      if (!best || jw > best.jw + 2) best = { rows, cols, cw, ch, jw };
    }
    const { rows, cols, cw, ch, jw } = best, jh = jw * 1.28, x0 = sh.x + (sh.w - cw * cols) / 2;
    jars = list.map((g, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const cx = x0 + cw * (c + 0.5), by = sh.y + ch * r + Math.min(ch - lab, (ch - lab) * 0.5 + jh * 0.55);
      return { g, x: cx, y: by, w: jw, h: jh, cw, ch, ly: by + 9, cell: { x: x0 + cw * c, y: sh.y + ch * r, w: cw, h: ch }, key: KEYS[i], shake: 0 };
    });
    L.rows = rows; L.rowH = ch;
  }

  // ============================================================ background
  function buildBg() {
    const { W, H } = L;
    bgBack = mkCanvas(W, H); const c = bgBack.x;
    const g = c.createLinearGradient(0, 0, 0, L.counterY); g.addColorStop(0, '#26172a'); g.addColorStop(1, '#4b2c35');
    c.fillStyle = g; c.fillRect(0, 0, W, L.counterY + 6);
    // wallpaper
    const rnd = srand(7);
    c.fillStyle = 'rgba(255,205,160,.045)';
    for (let y = 18; y < L.counterY; y += 34) for (let x = ((y / 34) % 2) * 17; x < W; x += 34) { c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.lineTo(x - 4, y); c.fill(); }
    c.strokeStyle = 'rgba(255,200,150,.035)'; c.lineWidth = 1;
    for (let x = 0; x < W; x += 68) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, L.counterY); c.stroke(); }
    // warm lamp glows
    for (const [x, y, r] of [[W * 0.5, L.counterY * 0.35, Math.max(W, H) * 0.45], [L.win.x + L.win.w / 2, L.win.y + L.win.h * 0.5, L.win.w]]) {
      const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(255,170,90,.16)'); rg.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, L.counterY);
    }
    // ceiling beam
    c.fillStyle = '#2a1812'; c.fillRect(0, 0, W, L.top - 4); c.fillStyle = '#3d2419'; c.fillRect(0, L.top - 6, W, 4);
    drawWindow(c, L.win, rnd);
    // wall rail just above the counter
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, L.counterY - 10, W, 10);

    bgFront = mkCanvas(W, H); const f = bgFront.x;
    // counter top
    const ct = f.createLinearGradient(0, L.counterY, 0, L.frontY); ct.addColorStop(0, '#9a6038'); ct.addColorStop(0.08, '#b9784a'); ct.addColorStop(0.14, '#8d5532'); ct.addColorStop(1, '#6e3f25');
    f.fillStyle = ct; f.fillRect(0, L.counterY, W, L.frontY - L.counterY);
    f.strokeStyle = 'rgba(60,30,15,.35)'; f.lineWidth = 1;
    const rk = srand(3);
    for (let y = L.counterY + 12; y < L.frontY - 4; y += 16 + rk() * 10) { f.beginPath(); f.moveTo(0, y); for (let x = 0; x <= W; x += 40) f.lineTo(x, y + Math.sin(x * 0.02 + y) * 1.5); f.stroke(); }
    f.fillStyle = 'rgba(255,220,170,.25)'; f.fillRect(0, L.counterY, W, 3);
    // front edge + front panel / ingredient shelf
    f.fillStyle = '#c0824f'; f.fillRect(0, L.frontY - 2, W, 6); f.fillStyle = '#5a321e'; f.fillRect(0, L.frontY + 4, W, 3);
    const fp = f.createLinearGradient(0, L.frontY, 0, H); fp.addColorStop(0, '#4a2a1b'); fp.addColorStop(1, '#2d180f'); f.fillStyle = fp; f.fillRect(0, L.frontY + 7, W, H - L.frontY);
    f.strokeStyle = 'rgba(0,0,0,.25)'; for (let x = 40; x < W; x += 90) { f.beginPath(); f.moveTo(x, L.frontY + 7); f.lineTo(x, H); f.stroke(); }
    // shelf planks under the jars + labels
    const lang = getLang();
    for (let r = 0; r < L.rows; r++) {
      const j0 = jars.find(j => j.cell.y === L.shelf.y + L.rowH * r); if (!j0) continue;
      const py = j0.y;
      f.fillStyle = 'rgba(0,0,0,.3)'; f.fillRect(L.shelf.x, py + 2, L.shelf.w, 8);
      f.fillStyle = '#8a5634'; f.fillRect(L.shelf.x, py - 1, L.shelf.w, 6); f.fillStyle = 'rgba(255,220,170,.25)'; f.fillRect(L.shelf.x, py - 1, L.shelf.w, 1.5);
    }
    f.textAlign = 'center'; f.textBaseline = 'top'; f.direction = lang === 'ar' ? 'rtl' : 'ltr';
    const fs = L.port ? 10.5 : 12.5;
    f.font = `600 ${fs}px ${FONT}`;
    for (const j of jars) {
      const lines = wrapText(f, t('ab_i_' + j.g.id), j.cw - 6, 2);
      lines.forEach((ln, i) => { f.fillStyle = 'rgba(0,0,0,.45)'; f.fillText(ln, j.x + 1, j.ly + 1 + i * (fs + 2)); f.fillStyle = '#ffe9c9'; f.fillText(ln, j.x, j.ly + i * (fs + 2)); });
    }
    f.direction = 'ltr';
    drawBoardStatic(f);
  }
  function wrapText(c, s, maxW, maxLines) {
    const words = s.split(' '), lines = []; let cur = '';
    for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { const rest = lines.slice(maxLines - 1).join(' '); lines.length = maxLines - 1; lines.push(rest); }
    return lines;
  }
  function drawWindow(c, w, rnd) {
    const r = w.w / 2, archY = w.y + r * 0.55;
    const winPath = (inset) => { c.beginPath(); c.moveTo(w.x + inset, w.y + w.h); c.lineTo(w.x + inset, archY); c.ellipse(w.x + r, archY, r - inset, r * 0.55 - inset * 0.6, 0, Math.PI, 0); c.lineTo(w.x + w.w - inset, w.y + w.h); c.closePath(); };
    // frame
    c.fillStyle = '#5e3822'; winPath(-8); c.fill();
    c.save(); winPath(4); c.clip();
    const sky = c.createLinearGradient(0, w.y, 0, w.y + w.h); sky.addColorStop(0, '#16123a'); sky.addColorStop(0.6, '#352a63'); sky.addColorStop(1, '#7a4a78');
    c.fillStyle = sky; c.fillRect(w.x, w.y - r, w.w, w.h + r);
    for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,250,230,${0.3 + rnd() * 0.6})`; c.fillRect(w.x + rnd() * w.w, w.y + rnd() * w.h * 0.75, rnd() < 0.15 ? 2 : 1.2, rnd() < 0.15 ? 2 : 1.2); }
    // moon
    const mx = w.x + w.w * 0.72, my = w.y + w.h * 0.26, mr = Math.max(10, w.w * 0.075);
    const mg = c.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3.2); mg.addColorStop(0, 'rgba(255,240,200,.45)'); mg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = mg; c.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
    c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(220,200,160,.5)'; for (const [dx, dy, rr2] of [[-0.3, -0.2, 0.2], [0.25, 0.2, 0.15], [-0.1, 0.35, 0.12]]) { c.beginPath(); c.arc(mx + dx * mr, my + dy * mr, rr2 * mr, 0, Math.PI * 2); c.fill(); }
    // hills + tiny town
    c.fillStyle = '#2a1f45'; c.beginPath(); c.moveTo(w.x, w.y + w.h); for (let x = 0; x <= w.w; x += 6) c.lineTo(w.x + x, w.y + w.h * 0.72 - Math.sin(x / w.w * 5 + 1) * w.h * 0.06); c.lineTo(w.x + w.w, w.y + w.h); c.fill();
    c.fillStyle = '#1b1430'; c.beginPath(); c.moveTo(w.x, w.y + w.h); for (let x = 0; x <= w.w; x += 6) c.lineTo(w.x + x, w.y + w.h * 0.84 - Math.sin(x / w.w * 7 + 3) * w.h * 0.04); c.lineTo(w.x + w.w, w.y + w.h); c.fill();
    for (let i = 0; i < 9; i++) { const hx = w.x + w.w * (0.08 + i * 0.1 + rnd() * 0.03), hy = w.y + w.h * (0.8 + rnd() * 0.05), hs = w.w * 0.035; c.fillStyle = '#140f24'; c.fillRect(hx, hy - hs, hs, hs * 2); c.beginPath(); c.moveTo(hx - hs * 0.2, hy - hs); c.lineTo(hx + hs / 2, hy - hs * 1.8); c.lineTo(hx + hs * 1.2, hy - hs); c.fill(); if (rnd() < 0.8) { c.fillStyle = '#ffcf6b'; c.fillRect(hx + hs * 0.3, hy - hs * 0.6, hs * 0.35, hs * 0.35); } }
    c.restore();
    // mullions
    c.strokeStyle = '#5e3822'; c.lineWidth = Math.max(4, w.w * 0.018);
    c.beginPath(); c.moveTo(w.x + r, w.y - r * 0.0 + 2); c.lineTo(w.x + r, w.y + w.h); c.moveTo(w.x, archY + (w.h - (archY - w.y)) * 0.45); c.lineTo(w.x + w.w, archY + (w.h - (archY - w.y)) * 0.45); c.stroke();
    c.strokeStyle = '#7b4c2e'; c.lineWidth = 3; winPath(-2); c.stroke();
    // curtains
    for (const side of [-1, 1]) {
      const cx = side < 0 ? w.x - 6 : w.x + w.w + 6;
      const cg = c.createLinearGradient(cx - 30, 0, cx + 30, 0); cg.addColorStop(0, '#6b1f3a'); cg.addColorStop(0.5, '#9c2f52'); cg.addColorStop(1, '#5a1830');
      c.fillStyle = cg; c.beginPath(); c.moveTo(cx - side * 4, w.y - r * 0.15); c.quadraticCurveTo(cx + side * w.w * 0.06, w.y + w.h * 0.5, cx + side * w.w * 0.02, w.y + w.h + 4);
      c.lineTo(cx - side * w.w * 0.1, w.y + w.h + 4); c.quadraticCurveTo(cx - side * w.w * 0.06, w.y + w.h * 0.45, cx - side * w.w * 0.12, w.y - r * 0.15); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - side * w.w * 0.04, w.y); c.quadraticCurveTo(cx, w.y + w.h * 0.5, cx - side * w.w * 0.03, w.y + w.h); c.stroke();
    }
    c.fillStyle = '#7b4c2e'; c.fillRect(w.x - w.w * 0.14, w.y - r * 0.2, w.w * 1.28, 5);
    // sill
    c.fillStyle = '#8a5634'; c.fillRect(w.x - 14, w.y + w.h - 2, w.w + 28, 9); c.fillStyle = 'rgba(255,220,170,.3)'; c.fillRect(w.x - 14, w.y + w.h - 2, w.w + 28, 2);
    w.sill = w.y + w.h - 2;
  }

  // ---------- mood board ----------
  function boardGeo() {
    const b = L.board, side = b.w > b.h * 1.1;
    const pad = 10, titleH = L.port ? 18 : 26;
    let R, cx, cy, bars;
    if (side) {
      R = Math.min((b.h - titleH - 28) * 0.4, b.w * 0.2); cx = b.x + pad + R * 1.32; cy = b.y + titleH + (b.h - titleH) * 0.5;
      const bx = cx + R * 1.45 + 6, rowH = Math.min(34, (b.h - titleH - 70) / 3); bars = { x: bx, y: cy - rowH * 1.5 + 6, w: b.x + b.w - pad - bx, rowH };
    } else {
      const isz = L.port ? 13 : 17;
      R = Math.min(b.w * 0.28, (b.h - titleH) * 0.23); cx = b.x + b.w / 2; cy = b.y + titleH + 14 + R + isz;
      const by = cy + R + isz + 4; bars = { x: b.x + pad + 2, y: by, w: b.w - pad * 2 - 4, rowH: Math.min(20, (b.y + b.h - by - 22) / 3) };
    }
    return { R, cx, cy, bars, titleH, side };
  }
  function drawBoardStatic(c) {
    const b = L.board, G = boardGeo(), lang = getLang();
    c.save();
    c.fillStyle = 'rgba(0,0,0,.35)'; A.rr(c, b.x + 3, b.y + 5, b.w, b.h, 10); c.fill();
    c.fillStyle = '#7b5233'; A.rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    c.fillStyle = '#5e3c24'; A.rr(c, b.x + 2, b.y + 2, b.w - 4, b.h - 4, 9); c.fill();
    const bg = c.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h); bg.addColorStop(0, '#26413a'); bg.addColorStop(1, '#1a2e2a');
    c.fillStyle = bg; A.rr(c, b.x + 7, b.y + 7, b.w - 14, b.h - 14, 5); c.fill();
    const rnd = srand(11); c.fillStyle = 'rgba(255,255,255,.035)';
    for (let i = 0; i < 14; i++) { A.ell(c, b.x + 10 + rnd() * (b.w - 20), b.y + 10 + rnd() * (b.h - 20), 10 + rnd() * 30, 4 + rnd() * 10, rnd() * 3); c.fill(); }
    // title
    c.fillStyle = 'rgba(255,248,230,.85)'; c.font = `700 ${L.port ? 12 : 15}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = lang === 'ar' ? 'rtl' : 'ltr';
    c.fillText(t('ab_board'), G.side ? G.cx : b.x + b.w / 2, b.y + 7 + G.titleH / 2);
    // hexagon grid
    const { cx, cy, R } = G;
    c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 1;
    for (const k of [1 / 3, 2 / 3, 1]) { c.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.22)';
    for (const ax of AX) { c.beginPath(); c.moveTo(cx - Math.cos(ax.ang) * R, cy - Math.sin(ax.ang) * R); c.lineTo(cx + Math.cos(ax.ang) * R, cy + Math.sin(ax.ang) * R); c.stroke(); }
    // pole labels
    const isz = L.port ? 13 : 17, words = !L.port && R > 60;
    c.font = `600 ${L.port ? 10 : 12}px ${FONT}`;
    for (const ax of AX) for (const sg of [1, -1]) {
      const a = ax.ang + (sg < 0 ? Math.PI : 0), lx = cx + Math.cos(a) * (R + isz * 0.9), ly = cy + Math.sin(a) * (R + isz * 0.9);
      A.icon(c, sg > 0 ? ax.ip : ax.in, lx, ly, isz, sg > 0 ? ax.cp : ax.cn, 2.4);
      if (words) { c.fillStyle = 'rgba(255,248,230,.6)'; const wy = ly + (Math.sin(a) > 0.3 ? isz * 0.95 : Math.sin(a) < -0.3 ? -isz * 0.95 : isz * 0.95); c.fillText(t('ab_' + (sg > 0 ? ax.pos : ax.neg)), lx, wy); }
    }
    // bars (static part)
    const B = G.bars;
    for (let k = 0; k < 3; k++) {
      const y = B.y + B.rowH * (k + 0.5), ax = AX[k], is = Math.min(15, B.rowH * 0.7);
      A.icon(c, ax.in, B.x + is / 2, y, is, ax.cn, 2.2); A.icon(c, ax.ip, B.x + B.w - is / 2, y, is, ax.cp, 2.2);
      const x0 = B.x + is + 5, x1 = B.x + B.w - is - 5;
      const tg = c.createLinearGradient(x0, 0, x1, 0); tg.addColorStop(0, ax.cn); tg.addColorStop(0.5, 'rgba(255,255,255,.25)'); tg.addColorStop(1, ax.cp);
      c.globalAlpha = 0.45; c.fillStyle = tg; A.rr(c, x0, y - 2.5, x1 - x0, 5, 2.5); c.fill(); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect((x0 + x1) / 2 - 0.75, y - 5, 1.5, 10);
    }
    c.restore();
    L.boardG = G;
  }
  function moodPts(m, G) { return AX.map((ax, k) => [G.cx + Math.cos(ax.ang) * m[k] * G.R, G.cy + Math.sin(ax.ang) * m[k] * G.R]); }
  function drawBoardDyn(c) {
    const G = L.boardG; if (!G) return;
    const c0 = S.cust, showT = c0 && c0.order && (c0.phase === 'order' || c0.phase === 'drink' || c0.phase === 'react') && c0.revealed;
    const hasOrder = c0 && c0.order && c0.phase !== 'enter' && c0.phase !== 'leave';
    const tgt = hasOrder ? c0.order.target : null;
    // target triangle (gold, dashed)
    if (tgt && showT) {
      const p = moodPts(tgt, G), pulse = 0.75 + Math.sin(S.time * 3) * 0.25;
      c.save(); c.fillStyle = `rgba(255,205,80,${0.13 * pulse})`; c.beginPath(); p.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill();
      c.setLineDash([6, 4]); c.lineDashOffset = -S.time * 12; c.strokeStyle = '#ffd25a'; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]);
      c.fillStyle = '#ffd25a'; p.forEach(q => { A.circ(c, q[0], q[1], 4); c.fill(); }); c.restore();
    } else if (hasOrder && !c0.revealed) {
      c.save(); c.fillStyle = 'rgba(255,210,90,.55)'; c.font = `800 ${G.R * 0.8}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = 0.5 + Math.sin(S.time * 2) * 0.2; c.fillText('?', G.cx, G.cy + 2); c.restore();
    }
    // current brew (smoothed)
    const m = cup.disp, p = moodPts(m, G);
    const col = brewColor();
    c.save(); c.fillStyle = rgba(col, 0.32); c.strokeStyle = rgba(mixRgb(col, [255, 255, 255], 0.55), 0.95); c.lineWidth = 2;
    c.beginPath(); p.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; p.forEach(q => { A.circ(c, q[0], q[1], 3); c.fill(); }); c.restore();
    // preview of the ingredient being dragged / hovered
    const pv = previewMood();
    if (pv) {
      const q = moodPts(pv, G);
      c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6; c.beginPath(); q.forEach((r, i) => i ? c.lineTo(r[0], r[1]) : c.moveTo(r[0], r[1])); c.closePath(); c.stroke(); c.setLineDash([]);
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.fillStyle = 'rgba(255,255,255,.9)';
      for (let k = 0; k < 3; k++) { const a = p[k], b = q[k], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy); if (dl < 4) continue; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); const ux = dx / dl, uy = dy / dl; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - ux * 7 - uy * 4, b[1] - uy * 7 + ux * 4); c.lineTo(b[0] - ux * 7 + uy * 4, b[1] - uy * 7 - ux * 4); c.fill(); }
      c.restore();
    }
    // bars
    const B = G.bars;
    for (let k = 0; k < 3; k++) {
      const y = B.y + B.rowH * (k + 0.5), is = Math.min(15, B.rowH * 0.7), x0 = B.x + is + 5, x1 = B.x + B.w - is - 5, X = (v) => lerp(x0, x1, (v + 1) / 2);
      if (tgt && showT) { c.fillStyle = 'rgba(255,210,90,.35)'; const tw = Math.max(6, (x1 - x0) * 0.06); c.fillRect(X(tgt[k]) - tw / 2, y - 6, tw, 12); c.fillStyle = '#ffd25a'; c.fillRect(X(tgt[k]) - 1.5, y - 7, 3, 14); }
      if (pv) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; A.circ(c, X(pv[k]), y, 5); c.stroke(); }
      const dv = m[k], ax = AX[k];
      c.fillStyle = dv >= 0 ? ax.cp : ax.cn; A.circ(c, X(dv), y, 5.5); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
    }
    // match %
    if (hasOrder) {
      const acc = c0.revealed ? accuracy(effMood(cup.mix, cup.T), tgt) : null;
      const txt = acc == null ? '??%' : Math.round(acc * 100) + '%';
      const fs = L.port ? 13 : 17;
      c.save(); c.textBaseline = 'middle'; c.direction = getLang() === 'ar' ? 'rtl' : 'ltr';
      const col2 = acc == null ? '#ddd' : acc >= 0.8 ? '#8dffa8' : acc >= 0.55 ? '#ffe17a' : acc >= 0.3 ? '#ffb27a' : '#ff8a8a';
      let x, y;
      if (G.side) { x = B.x + B.w / 2; y = B.y - 22; } else { x = L.board.x + L.board.w / 2; y = L.board.y + L.board.h - 16; }
      c.textAlign = 'center'; c.font = `800 ${fs}px ${FONT}`; c.fillStyle = col2;
      c.fillText(t('ab_match') + ' ' + txt, x, y);
      if (G.side) {
        c.font = `600 ${L.short ? 10 : 12}px ${FONT}`; c.textAlign = 'left'; c.direction = 'ltr';
        const w1 = c.measureText(t('ab_wanted')).width, w2 = c.measureText(t('ab_yours')).width, tot = 18 + w1 + 14 + 18 + w2;
        if (tot <= B.w + 6) {
          const ly = B.y + B.rowH * 3 + 14; let lx = B.x + (B.w - tot) / 2;
          c.fillStyle = '#ffd25a'; c.fillRect(lx, ly - 1.5, 14, 3); c.fillStyle = 'rgba(255,248,230,.75)'; c.fillText(t('ab_wanted'), lx + 18, ly);
          lx += 18 + w1 + 14; c.fillStyle = rgba(mixRgb(col, [255, 255, 255], 0.4)); c.fillRect(lx, ly - 1.5, 14, 3); c.fillStyle = 'rgba(255,248,230,.75)'; c.fillText(t('ab_yours'), lx + 18, ly);
        }
      }
      c.restore();
    }
  }
  const accuracy = (m, tg) => clamp(1 - dist3(m, tg) / (S.cfg ? S.cfg.tol : 1), 0, 1);
  function brewColor() {
    if (!cup.layers.length) return [210, 225, 255];
    let r = 0, g = 0, b = 0, n = 0; for (const l of cup.layers) { r += l.col[0] * l.vol; g += l.col[1] * l.vol; b += l.col[2] * l.vol; n += l.vol; }
    return n ? [r / n, g / n, b / n] : [210, 225, 255];
  }
  function previewMood() {
    const id = drag.on && drag.moved && drag.id ? (overCup(drag.x, drag.y) ? drag.id : null) : (drag.hover && drag.mouse ? drag.hover : null);
    if (!id || !canBrew()) return null;
    const g = INGM[id], z = zoneOf(cup.T);
    return effMood(applyTo(cup.mix, g, z), cup.T);
  }

  // ============================================================ decor art
  function drawDecor(c, layer) {
    const t2 = S.time;
    if (layer === 'wall') {
      if (has('lights')) {
        const y = L.top + 2, n = Math.max(4, Math.round(L.W / 150)), seg = L.W / n;
        c.strokeStyle = '#2a1a10'; c.lineWidth = 1.5;
        for (let i = 0; i < n; i++) {
          const a = i * seg, b = a + seg; c.beginPath(); c.moveTo(a, y); c.quadraticCurveTo(a + seg / 2, y + 34, b, y); c.stroke();
          for (let j = 1; j < 6; j++) {
            const k = j / 6, bx = a + seg * k, by = y + 2 * k * (1 - k) * 34 + 4, col = ['#ffd166', '#ff8fab', '#8ecae6', '#b5e48c', '#cdb4ff'][(i * 5 + j) % 5];
            const tw = 0.55 + 0.45 * Math.sin(t2 * 2.2 + i * 1.7 + j * 2.3);
            const g = c.createRadialGradient(bx, by, 0, bx, by, 14); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
            c.globalAlpha = 0.45 * tw; c.fillStyle = g; A.circ(c, bx, by, 14); c.fill(); c.globalAlpha = 1;
            c.fillStyle = col; A.ell(c, bx, by, 3, 4.2); c.fill();
          }
        }
      }
      if (has('candles')) {
        const w = L.win;
        for (let i = 0; i < 3; i++) {
          const x = w.x + w.w * (0.18 + i * 0.32), y = w.y + w.h * 0.12 + Math.sin(t2 * 1.3 + i * 2) * 6 + (i === 1 ? -8 : 0), s = Math.max(14, L.H * 0.028);
          const g = c.createRadialGradient(x, y - s * 0.9, 0, x, y - s * 0.9, s * 2.4); g.addColorStop(0, 'rgba(255,200,100,.5)'); g.addColorStop(1, 'rgba(255,200,100,0)');
          c.fillStyle = g; A.circ(c, x, y - s * 0.9, s * 2.4); c.fill();
          c.fillStyle = '#f6ead2'; A.rr(c, x - s * 0.22, y - s * 0.6, s * 0.44, s * 1.2, 3); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + s * 0.08, y - s * 0.6, s * 0.14, s * 1.2);
          const fl = 1 + Math.sin(t2 * 13 + i) * 0.12; c.fillStyle = '#ffcf4d'; c.beginPath(); c.ellipse(x, y - s * 0.85, s * 0.12 * fl, s * 0.24 * fl, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#fff6c8'; A.ell(c, x, y - s * 0.8, s * 0.05, s * 0.1); c.fill();
        }
      }
      if (has('plant')) {
        const [x, y0, len] = L.deco.plant, sw = Math.sin(t2 * 0.9) * 0.04;
        c.strokeStyle = '#3a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + len * 0.25); c.stroke();
        const py = y0 + len * 0.25, ps = len * 0.14;
        c.save(); c.translate(x, py); c.rotate(sw);
        c.fillStyle = '#b86a43'; c.beginPath(); c.moveTo(-ps, 0); c.lineTo(ps, 0); c.lineTo(ps * 0.75, ps); c.lineTo(-ps * 0.75, ps); c.fill(); c.fillStyle = '#d27e52'; c.fillRect(-ps * 1.05, -ps * 0.12, ps * 2.1, ps * 0.24);
        for (let v = -1; v <= 1; v++) {
          c.strokeStyle = '#4f8a45'; c.lineWidth = 2; c.beginPath(); c.moveTo(v * ps * 0.5, ps * 0.2);
          const ex = v * ps * 1.2 + Math.sin(t2 + v) * 4, ey = ps + len * (0.5 - Math.abs(v) * 0.15);
          c.quadraticCurveTo(v * ps * 1.6, ps + len * 0.2, ex, ey); c.stroke();
          for (let k = 1; k <= 4; k++) { const kk = k / 4.5, lx = lerp(v * ps * 0.5, ex, kk) + v * Math.sin(kk * 3) * ps * 0.5, ly = lerp(ps * 0.2, ey, kk); c.fillStyle = k % 2 ? '#6fb35f' : '#5a9e4c'; A.ell(c, lx + (k % 2 ? 4 : -4), ly, 5, 2.6, k % 2 ? 0.5 : -0.5); c.fill(); }
          const glow = 0.6 + 0.4 * Math.sin(t2 * 2 + v * 2); const g = c.createRadialGradient(ex, ey, 0, ex, ey, 14); g.addColorStop(0, `rgba(200,220,255,${0.6 * glow})`); g.addColorStop(1, 'rgba(200,220,255,0)'); c.fillStyle = g; A.circ(c, ex, ey, 14); c.fill();
          c.fillStyle = '#eef2ff'; for (let p2 = 0; p2 < 5; p2++) { const a = p2 / 5 * Math.PI * 2 + t2 * 0.3; A.ell(c, ex + Math.cos(a) * 4, ey + Math.sin(a) * 4, 3.2, 1.8, a); c.fill(); } c.fillStyle = '#ffe680'; A.circ(c, ex, ey, 2); c.fill();
        }
        c.restore();
      }
      if (has('painting') && !L.port) paintingArt(c, ...L.deco.painting, t2);
      const sill = L.win.sill || (L.win.y + L.win.h);
      if (has('aquarium')) aquariumArt(c, L.win.x + L.win.w * 0.03, sill, Math.min(L.win.w * 0.3, 120), Math.min(L.win.w * 0.2, 70), t2);
      if (has('crystal')) crystalArt(c, L.win.x + L.win.w * 0.88, sill, Math.min(L.win.w * 0.1, 34), t2);
    } else {
      if (has('painting') && L.port) paintingArt(c, ...L.deco.painting, t2);
      if (has('cat')) catArt(c, L.deco.cat[0], L.deco.cat[1], L.deco.cat[2], t2);
      if (has('musicbox')) musicBoxArt(c, L.deco.musicbox[0], L.deco.musicbox[1], L.deco.musicbox[2], t2);
    }
  }
  function paintingArt(c, x, y, w, h, t2) {
    c.fillStyle = '#c99a3a'; A.rr(c, x - 4, y - 4, w + 8, h + 8, 3); c.fill(); c.fillStyle = '#8a6420'; c.fillRect(x - 1, y - 1, w + 2, h + 2);
    const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#0f1a3a'); g.addColorStop(1, '#2b2060'); c.fillStyle = g; c.fillRect(x, y, w, h);
    const st = [[0.15, 0.3], [0.35, 0.18], [0.55, 0.38], [0.75, 0.22], [0.85, 0.6], [0.45, 0.7], [0.25, 0.62]];
    c.strokeStyle = 'rgba(180,200,255,.45)'; c.lineWidth = 1; c.beginPath(); st.forEach((p, i) => i ? c.lineTo(x + p[0] * w, y + p[1] * h) : c.moveTo(x + p[0] * w, y + p[1] * h)); c.stroke();
    st.forEach((p, i) => A.icon(c, 'star', x + p[0] * w, y + p[1] * h, Math.min(w, h) * (0.1 + 0.05 * Math.sin(t2 * 2 + i)), '#fff3b0'));
  }
  function aquariumArt(c, x, base, w, h, t2) {
    const y = base - h;
    c.fillStyle = '#5a3a24'; c.fillRect(x - 3, base - 5, w + 6, 6);
    const g = c.createLinearGradient(x, y, x, base); g.addColorStop(0, 'rgba(90,180,220,.55)'); g.addColorStop(1, 'rgba(30,80,140,.75)'); c.fillStyle = g; c.fillRect(x, y + h * 0.12, w, h * 0.88 - 5);
    c.fillStyle = '#3f7a3a'; for (let i = 0; i < 4; i++) { const px = x + w * (0.15 + i * 0.24); c.beginPath(); c.moveTo(px, base - 5); c.quadraticCurveTo(px + Math.sin(t2 * 1.5 + i) * 6, base - h * 0.4, px + 2, base - h * 0.55); c.lineTo(px + 4, base - 5); c.fill(); }
    for (let i = 0; i < 3; i++) {
      const k = (t2 * (0.12 + i * 0.05) + i * 0.33) % 1, dir = i % 2 ? 1 : -1, fx = dir > 0 ? x + w * (0.1 + k * 0.8) : x + w * (0.9 - k * 0.8), fy = y + h * (0.35 + i * 0.17) + Math.sin(t2 * 2 + i) * 3;
      const col = ['#ffcf4d', '#ff7ab8', '#8affc8'][i]; const gg = c.createRadialGradient(fx, fy, 0, fx, fy, 10); gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 0.5; c.fillStyle = gg; A.circ(c, fx, fy, 10); c.fill(); c.globalAlpha = 1;
      c.fillStyle = col; A.ell(c, fx, fy, 5, 3); c.fill(); c.beginPath(); c.moveTo(fx - dir * 4, fy); c.lineTo(fx - dir * 9, fy - 3); c.lineTo(fx - dir * 9, fy + 3); c.fill();
    }
    c.strokeStyle = 'rgba(230,245,255,.75)'; c.lineWidth = 2; c.strokeRect(x, y, w, h - 5);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x + 3, y + 3, 4, h - 12);
  }
  function crystalArt(c, x, base, s, t2) {
    c.fillStyle = '#6b4128'; c.beginPath(); c.moveTo(x - s * 0.6, base); c.lineTo(x + s * 0.6, base); c.lineTo(x + s * 0.4, base - s * 0.35); c.lineTo(x - s * 0.4, base - s * 0.35); c.fill();
    const cy = base - s * 0.35 - s * 0.55, gl = c.createRadialGradient(x, cy, 0, x, cy, s * 1.4); gl.addColorStop(0, 'rgba(200,150,255,.45)'); gl.addColorStop(1, 'rgba(200,150,255,0)'); c.fillStyle = gl; A.circ(c, x, cy, s * 1.4); c.fill();
    const g = c.createRadialGradient(x - s * 0.2, cy - s * 0.2, 0, x, cy, s * 0.6); g.addColorStop(0, '#f0dcff'); g.addColorStop(0.5, '#a070e0'); g.addColorStop(1, '#4a2a8a'); c.fillStyle = g; A.circ(c, x, cy, s * 0.6); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, cy, s * 0.35, t2 * 1.5, t2 * 1.5 + 2.2); c.stroke(); c.beginPath(); c.arc(x, cy, s * 0.2, -t2 * 2, -t2 * 2 + 1.8); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.7)'; A.ell(c, x - s * 0.22, cy - s * 0.25, s * 0.12, s * 0.07, -0.6); c.fill();
  }
  function catArt(c, x, y, s, t2) {
    const br = 1 + Math.sin(t2 * 1.8) * 0.03;
    c.fillStyle = 'rgba(0,0,0,.25)'; A.ell(c, x, y + s * 0.02, s * 0.75, s * 0.12); c.fill();
    c.fillStyle = '#2a2234';
    c.save(); c.translate(x + s * 0.55, y - s * 0.05); c.rotate(Math.sin(t2 * 0.8) * 0.15); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.4, s * 0.05, s * 0.35, -s * 0.25); c.lineTo(s * 0.28, -s * 0.22); c.quadraticCurveTo(s * 0.3, -s * 0.02, -s * 0.05, -s * 0.08); c.fill(); c.restore();
    A.ell(c, x, y - s * 0.22 * br, s * 0.6, s * 0.26 * br); c.fill();
    A.circ(c, x - s * 0.48, y - s * 0.22, s * 0.24); c.fill();
    c.beginPath(); c.moveTo(x - s * 0.66, y - s * 0.34); c.lineTo(x - s * 0.62, y - s * 0.58); c.lineTo(x - s * 0.48, y - s * 0.42); c.moveTo(x - s * 0.44, y - s * 0.44); c.lineTo(x - s * 0.32, y - s * 0.58); c.lineTo(x - s * 0.3, y - s * 0.36); c.fill();
    c.strokeStyle = '#ffd36b'; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.arc(x - s * 0.56, y - s * 0.22, s * 0.05, 0.2, Math.PI - 0.2); c.moveTo(x - s * 0.36, y - s * 0.22); c.arc(x - s * 0.41, y - s * 0.22, s * 0.05, 0.2, Math.PI - 0.2); c.stroke();
    c.fillStyle = '#ff9ab8'; A.circ(c, x - s * 0.48, y - s * 0.14, s * 0.025); c.fill();
    c.fillStyle = '#c64b8c'; c.fillRect(x - s * 0.42, y - s * 0.08, s * 0.2, s * 0.05); A.icon(c, 'star', x - s * 0.32, y - s * 0.01, s * 0.12, '#ffd36b');
    const zk = (t2 * 0.5) % 1; c.globalAlpha = 1 - zk; c.fillStyle = '#e8e4ff'; c.font = `700 ${s * 0.22}px ${FONT}`; c.textAlign = 'center'; c.fillText('z', x - s * 0.7 - zk * s * 0.3, y - s * 0.6 - zk * s * 0.5); c.globalAlpha = 1;
  }
  function musicBoxArt(c, x, y, s, t2) {
    c.fillStyle = '#7a3e2a'; A.rr(c, x - s * 0.8, y - s * 0.6, s * 1.6, s * 0.6, 3); c.fill(); c.fillStyle = '#c99a3a'; c.fillRect(x - s * 0.8, y - s * 0.38, s * 1.6, s * 0.06);
    c.fillStyle = '#5e2c1c'; c.save(); c.translate(x - s * 0.8, y - s * 0.6); c.rotate(-0.9); c.fillRect(0, -s * 0.06, s * 1.6, s * 0.12); c.restore();
    c.save(); c.translate(x, y - s * 0.62); c.scale(Math.cos(t2 * 2.5), 1); A.icon(c, 'star', 0, -s * 0.25, s * 0.45, '#ffe58a'); c.restore();
    for (let i = 0; i < 2; i++) { const k = (t2 * 0.4 + i * 0.5) % 1; c.globalAlpha = Math.sin(k * Math.PI); A.icon(c, 'note', x + s * 0.4 + Math.sin(k * 6 + i) * s * 0.3, y - s * 0.8 - k * s * 1.5, s * 0.4, '#ffe9c9'); } c.globalAlpha = 1;
  }

  // ============================================================ cup / liquid
  function cupDims() { const h = L.cupH * L.big, w = L.cupW * (has('mug') ? 1.05 : 1); return { w, h, th: Math.max(3, w * 0.055) }; }
  function cupPath(c, w, h, inset) {
    const tw = w / 2 - inset, bw = w * 0.4 - inset, top = -h + inset * 0.3, bot = -inset, r = Math.min(bw * 0.55, h * 0.2);
    c.beginPath(); c.moveTo(-tw, top); c.lineTo(-bw, bot - r); c.quadraticCurveTo(-bw, bot, -bw + r, bot); c.lineTo(bw - r, bot); c.quadraticCurveTo(bw, bot, bw, bot - r); c.lineTo(tw, top);
  }
  const halfW = (D, y) => { const tw = D.w / 2 - D.th, bw = D.w * 0.4 - D.th, k = clamp((-y) / D.h, 0, 1); return lerp(bw, tw, k); };
  function cupLevel() { let v = 0; for (const l of cup.layers) v += l.vol; return v; }
  function resetCup(keepTemp) {
    cup.doses = []; cup.mix = [0, 0, 0]; cup.layers = []; cup.bubbles = []; cup.swirls = []; cup.state = 'idle'; cup.st = 0; cup.levelMul = 1;
    if (!keepTemp) { cup.T = 50; cup.dial = 50; }
    for (let i = 0; i < WN; i++) { cup.wave[i] = 0; cup.waveV[i] = 0; }
  }
  function cupPos() {
    let x = L.cupX, y = L.cupY, sc = 1, rot = 0, alpha = 1;
    if (cup.state === 'serving' && S.cust) {
      const tx = S.cust.x + L.custS * 0.42, ty = L.counterY + L.H * 0.03;
      const k = easeIO(cup.st / 0.55); x = lerp(L.cupX, tx, k); y = lerp(L.cupY, ty, k) - Math.sin(k * Math.PI) * L.H * 0.04; sc = lerp(1, 0.78, k);
      if (cup.st > 0.55) { const k2 = clamp((cup.st - 0.55) / 0.8, 0, 1); rot = -Math.sin(k2 * Math.PI) * 0.5; y -= Math.sin(k2 * Math.PI) * L.custS * 0.25; alpha = cup.st > 1.25 ? clamp(1 - (cup.st - 1.25) / 0.15, 0, 1) : 1; }
    } else if (cup.state === 'gone') alpha = 0;
    sc *= cup.pop;
    return { x, y, sc, rot, alpha };
  }
  function updateCup(dt) {
    // temperature drifts toward the dial
    const rate = heatRate() * dt, diff = cup.dial - cup.T; cup.T += Math.abs(diff) < rate ? diff : Math.sign(diff) * rate;
    if (cup.pop < 1) cup.pop = Math.min(1, cup.pop + dt * 4);
    for (let k = 0; k < 3; k++) cup.disp[k] = lerp(cup.disp[k], effMood(cup.mix, cup.T)[k], 1 - Math.exp(-dt * 9));
    // layers fill during pours, colors slowly diffuse into each other
    for (const l of cup.layers) if (l.vol < l.target) l.vol = Math.min(l.target, l.vol + dt * 2.6);
    const n = cup.layers.length;
    if (n > 1) {
      const avg = brewColor(), k = 1 - Math.exp(-dt * 0.18);
      for (let i = 0; i < n; i++) { const l = cup.layers[i]; l.col = mixRgb(l.col, avg, k); l.blend = Math.min(1, (l.blend || 0) + dt * 0.25); }
      for (let i = 0; i < n - 1; i++) { const a = cup.layers[i], b = cup.layers[i + 1], kk = 1 - Math.exp(-dt * 0.35), ca = a.col.slice(); a.col = mixRgb(a.col, b.col, kk * 0.5); b.col = mixRgb(b.col, ca, kk * 0.5); }
    }
    if (cup.state === 'dumping') { cup.levelMul = Math.max(0, cup.levelMul - dt * 2.2); if (cup.levelMul <= 0) { const T = cup.T, D = cup.dial; resetCup(true); cup.T = T; cup.dial = D; } }
    if (cup.state === 'serving') { cup.st += dt; if (cup.st > 0.55) cup.levelMul = Math.max(0, 1 - (cup.st - 0.55) / 0.75); if (cup.st >= 1.4) cup.state = 'gone'; }
    // surface waves (springs + spreading)
    const m = effMood(cup.mix, cup.T), chaos = Math.max(0, m[2]);
    const steps = 3, h = dt / steps;
    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < WN; i++) {
        const l = cup.wave[i - 1] != null ? cup.wave[i - 1] : cup.wave[i], r = cup.wave[i + 1] != null ? cup.wave[i + 1] : cup.wave[i];
        const acc = -70 * cup.wave[i] - 3.2 * cup.waveV[i] + 900 * (l + r - 2 * cup.wave[i]) / WN;
        cup.waveV[i] += acc * h;
      }
      for (let i = 0; i < WN; i++) cup.wave[i] += cup.waveV[i] * h;
    }
    if (chaos > 0.15 && cupLevel() > 0) for (let i = 0; i < WN; i++) cup.waveV[i] += (Math.random() - 0.5) * chaos * 160 * dt * 10;
    // bubbles
    const lvl = cupLevel();
    if (lvl > 0.2 && cup.state !== 'gone') {
      const rateB = 0.6 + chaos * 16 + (cup.T > 80 ? (cup.T - 80) * 0.5 : 0);
      if (Math.random() < rateB * dt) cup.bubbles.push({ x: rand(-0.85, 0.85), y: 0, r: rand(1.2, 3.2) * (L.port ? 0.8 : 1), vy: rand(25, 55) * (1 + chaos), wob: rand(0, 6) });
    }
    for (let i = cup.bubbles.length - 1; i >= 0; i--) { const b = cup.bubbles[i]; b.y += b.vy * dt; b.wob += dt * 5; if (b.dead || b.y > L.cupH * 2) cup.bubbles.splice(i, 1); }
    for (let i = cup.swirls.length - 1; i >= 0; i--) { cup.swirls[i].t += dt; if (cup.swirls[i].t > 1.6) cup.swirls.splice(i, 1); }
    // world particles from the drink's mood
    if (lvl > 0.3 && cup.state !== 'gone' && S.screen !== 'paused') {
      const P = cupPos(), D = cupDims(), topY = P.y - D.h * P.sc;
      if (cup.T > 60 && Math.random() < (cup.T - 60) * 0.12 * dt) parts.push({ type: 'steam', x: P.x + rand(-D.w * 0.25, D.w * 0.25), y: topY, vx: rand(-6, 6), vy: rand(-26, -16), life: 0, max: rand(1.6, 2.4), size: rand(6, 11) * (L.port ? 0.8 : 1) });
      if (cup.T < 25 && Math.random() < (25 - cup.T) * 0.08 * dt) parts.push({ type: 'mist', x: P.x + rand(-D.w * 0.45, D.w * 0.45), y: topY + D.h * 0.2, vx: rand(-8, 8), vy: rand(8, 16), life: 0, max: rand(1.4, 2), size: rand(5, 9) });
      if (m[1] > 0.3 && Math.random() < m[1] * 5 * dt) parts.push({ type: 'spark', x: P.x + rand(-D.w * 0.35, D.w * 0.35), y: P.y - rand(0.1, 0.85) * D.h * clamp(lvl / capacity(), 0.2, 1), vx: 0, vy: -4, life: 0, max: rand(0.6, 1.1), size: rand(4, 7), col: '#fff6c0' });
      if (m[1] < -0.3 && Math.random() < -m[1] * 3 * dt) parts.push({ type: 'wisp', x: P.x + rand(-D.w * 0.25, D.w * 0.25), y: topY + D.h * 0.15, vx: rand(-5, 5), vy: rand(-18, -10), life: 0, max: rand(1.4, 2), size: rand(6, 10) });
    }
  }
  function drawCup(c) {
    const P = cupPos(); if (P.alpha <= 0) return;
    const D = cupDims(), lvlRaw = cupLevel(), cap = capacity();
    // burner plate under the cup
    if (cup.state === 'idle' || cup.state === 'dumping') {
      const heat = (cup.T - 50) / 50, bx = L.cupX, by = L.cupY + 2, bw = D.w * 0.62;
      c.save();
      const col = heat >= 0 ? [255, lerp(170, 90, heat), 60] : [110, 210, 255];
      const gi = Math.min(1, Math.abs(heat) * 1.2);
      const gg = c.createRadialGradient(bx, by, 0, bx, by, bw * 1.5); gg.addColorStop(0, rgba(col, 0.55 * gi)); gg.addColorStop(1, rgba(col, 0)); c.fillStyle = gg; A.ell(c, bx, by, bw * 1.5, bw * 0.45); c.fill();
      c.fillStyle = '#3a2a2a'; A.ell(c, bx, by, bw, bw * 0.22); c.fill(); c.fillStyle = '#5a4646'; A.ell(c, bx, by - 2, bw * 0.92, bw * 0.18); c.fill();
      c.strokeStyle = rgba(gi > 0.1 ? col : [200, 180, 160], 0.4 + gi * 0.5); c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(bx, by - 2, bw * 0.7, bw * 0.13, 0, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + S.time * (0.4 + gi); c.fillStyle = rgba(gi > 0.1 ? col : [220, 200, 170], 0.5 + gi * 0.5); A.circ(c, bx + Math.cos(a) * bw * 0.8, by - 2 + Math.sin(a) * bw * 0.15, 1.6); c.fill(); }
      c.restore();
    }
    c.save(); c.globalAlpha = P.alpha; c.translate(P.x, P.y); c.rotate(P.rot); c.scale(P.sc, P.sc);
    // shadow
    c.fillStyle = 'rgba(0,0,0,.28)'; A.ell(c, 0, 1, D.w * 0.46, D.w * 0.08); c.fill();
    // handle (behind? draw first, glass)
    c.strokeStyle = 'rgba(225,240,255,.55)'; c.lineWidth = D.w * 0.09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(D.w * 0.47, -D.h * 0.8); c.bezierCurveTo(D.w * 0.82, -D.h * 0.82, D.w * 0.78, -D.h * 0.22, D.w * 0.42, -D.h * 0.24); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = D.w * 0.025; c.stroke();
    // glass back
    cupPath(c, D.w, D.h, 0); c.closePath(); c.fillStyle = 'rgba(200,225,255,.09)'; c.fill();
    // liquid
    const lvl = lvlRaw * cup.levelMul;
    if (lvl > 0.01) {
      c.save(); cupPath(c, D.w, D.h, D.th); c.closePath(); c.clip();
      const innerH = D.h - D.th * 1.3, bottom = -D.th, surf = bottom - innerH * 0.9 * (lvl / cap);
      const hw = halfW(D, surf) + 2;
      // gradient by layers
      const gr = c.createLinearGradient(0, bottom, 0, surf); let cum = 0; const tot = lvlRaw || 1;
      for (const l of cup.layers) {
        const a = cum / tot, b2 = (cum + l.vol) / tot, mid = (a + b2) / 2, bw2 = (b2 - a) / 2 * (0.85 - (l.blend || 0) * 0.85);
        gr.addColorStop(clamp(mid - bw2, 0, 1), rgba(l.col)); gr.addColorStop(clamp(mid + bw2, 0, 1), rgba(l.col)); cum += l.vol;
      }
      c.fillStyle = gr; c.beginPath(); c.moveTo(-hw - 4, bottom + 2);
      for (let i = 0; i < WN; i++) { const x = lerp(-hw, hw, i / (WN - 1)); c.lineTo(x, surf + cup.wave[i]); }
      c.lineTo(hw + 4, bottom + 2); c.closePath(); c.fill();
      // swirls from recent pours
      for (const sw of cup.swirls) {
        const k = sw.t / 1.6, cy = lerp(bottom, surf, 0.5); c.strokeStyle = rgba(sw.col, 0.55 * (1 - k)); c.lineWidth = 3;
        for (let j = 0; j < 2; j++) { c.beginPath(); c.ellipse(0, cy + j * 6, hw * (0.3 + k * 0.6), Math.max(2, (surf - bottom) * -0.18), 0, sw.t * 4 + j * 2, sw.t * 4 + j * 2 + 3.2); c.stroke(); }
      }
      // bubbles
      for (const b of cup.bubbles) {
        const by = bottom - b.y, x = b.x * halfW(D, by) * 0.9 + Math.sin(b.wob) * 1.5;
        if (by <= surf + 2) { b.dead = true; if (Math.random() < 0.3) Snd.play('pop'); continue; }
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; A.circ(c, x, by, b.r); c.stroke(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill();
      }
      // ice cubes in an iced drink
      if (cup.T < 30) {
        const a = clamp((30 - cup.T) / 15, 0, 1);
        for (let i = 0; i < 2; i++) { const ix = (i ? 0.3 : -0.35) * hw, iy = surf + cup.wave[i ? 15 : 6] + 4, s = D.w * 0.16; c.save(); c.translate(ix, iy); c.rotate(Math.sin(S.time + i) * 0.15 + i); c.fillStyle = `rgba(230,250,255,${0.55 * a})`; A.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fill(); c.strokeStyle = `rgba(255,255,255,${0.8 * a})`; c.lineWidth = 1.2; c.stroke(); c.restore(); }
      }
      // shading + glow
      const sh = c.createLinearGradient(-hw, 0, hw, 0); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(0.3, 'rgba(0,0,0,0)'); sh.addColorStop(0.75, 'rgba(255,255,255,.06)'); sh.addColorStop(1, 'rgba(0,0,0,.3)');
      c.fillStyle = sh; c.fillRect(-hw - 4, surf - 8, hw * 2 + 8, bottom - surf + 12);
      // surface sheen
      const top = brewColor(), avgW = cup.wave.reduce((s2, v) => s2 + v, 0) / WN;
      c.fillStyle = rgba(mixRgb(top, [255, 255, 255], 0.35), 0.85); A.ell(c, 0, surf + avgW - 1, hw, Math.max(2, D.w * 0.045), (cup.wave[WN - 1] - cup.wave[0]) / (hw * 2)); c.fill();
      c.strokeStyle = rgba(mixRgb(top, [255, 255, 255], 0.6), 0.9); c.lineWidth = 1.5; c.beginPath();
      for (let i = 0; i < WN; i++) { const x = lerp(-hw, hw, i / (WN - 1)); i ? c.lineTo(x, surf + cup.wave[i]) : c.moveTo(x, surf + cup.wave[i]); } c.stroke();
      c.restore();
    }
    // pour streams land on the surface
    // glass front
    cupPath(c, D.w, D.h, 0); c.strokeStyle = 'rgba(235,248,255,.8)'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = has('mug') ? '#e8b84a' : 'rgba(235,248,255,.9)'; c.lineWidth = has('mug') ? 3.5 : 2.4; c.beginPath(); c.ellipse(0, -D.h, D.w / 2, D.w * 0.05, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(-D.w * 0.36, -D.h * 0.88); c.lineTo(-D.w * 0.3, -D.h * 0.88); c.lineTo(-D.w * 0.27, -D.h * 0.2); c.lineTo(-D.w * 0.31, -D.h * 0.2); c.fill();
    // frost on the glass
    if (cup.T < 35) {
      const a = clamp((35 - cup.T) / 30, 0, 1); c.strokeStyle = `rgba(240,252,255,${0.7 * a})`; c.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(-D.w * 0.5, D.w * 0.5, k), y = -D.h + 3 + (i % 3) * 3; A.icon(c, 'snow', x, y + 4, 7, `rgba(240,252,255,${0.6 * a})`, 2); }
    }
    // capacity pips
    if (cup.state === 'idle' && S.screen === 'play') {
      const n = cup.doses.length, pw = Math.min(10, D.w / (cap * 1.7));
      for (let i = 0; i < cap; i++) { const x = (i - (cap - 1) / 2) * pw * 1.6, y = 12; c.fillStyle = i < n ? '#ffd25a' : 'rgba(255,255,255,.22)'; A.circ(c, x, y, pw / 2); c.fill(); }
    }
    c.restore();
    // pour streams
    for (const p of pours) {
      if (p.t < 0.18 || p.t > 0.62) continue;
      const mouth = jarMouth(p), surfY = cupSurfaceY();
      const k = clamp((p.t - 0.18) / 0.08, 0, 1), kEnd = clamp((0.62 - p.t) / 0.08, 0, 1), w = 5 * Math.min(k, kEnd) + 1;
      c.save(); c.strokeStyle = rgba(p.g.rgb, 0.9); c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(mouth[0], mouth[1]);
      const ex = L.cupX - cupDims().w * 0.08; c.quadraticCurveTo(mouth[0] + 8, (mouth[1] + surfY) / 2, ex + Math.sin(S.time * 20) * 1.5, surfY); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, w * 0.3); c.stroke(); c.restore();
    }
  }
  function cupSurfaceY() { const D = cupDims(), innerH = D.h - D.th * 1.3; return L.cupY - D.th - innerH * 0.9 * (cupLevel() / capacity()); }
  function overCup(x, y) { const D = cupDims(); return Math.abs(x - L.cupX) < D.w * 0.85 && y > L.cupY - D.h * 1.9 && y < L.cupY + 14; }

  // ---------- thermometer ----------
  function drawThermo(c) {
    const th = L.th, x = th.x, w = th.w, top = th.top, bot = th.bot, bulbR = w * 0.95, tubeTop = top + 18, tubeBot = bot - bulbR;
    const Y = (v) => lerp(tubeBot, tubeTop, v / 100);
    const gold = has('kettle');
    c.save();
    // zone bands
    c.fillStyle = 'rgba(255,120,60,.18)'; A.rr(c, x - w, Y(100), w * 2, Y(70) - Y(100), 4); c.fill();
    c.fillStyle = 'rgba(110,200,255,.18)'; A.rr(c, x - w, Y(30), w * 2, Y(0) - Y(30), 4); c.fill();
    // tube
    c.fillStyle = 'rgba(230,240,255,.18)'; A.rr(c, x - w / 2, tubeTop - 6, w, tubeBot - tubeTop + 10, w / 2); c.fill();
    c.strokeStyle = gold ? '#f0c24a' : '#c9a36a'; c.lineWidth = 2; c.stroke();
    const col = cup.T >= 50 ? mixRgb([255, 200, 90], [255, 70, 50], (cup.T - 50) / 50) : mixRgb([120, 220, 255], [255, 200, 90], cup.T / 50);
    c.fillStyle = rgba(col); A.rr(c, x - w * 0.26, Y(cup.T), w * 0.52, tubeBot - Y(cup.T) + 4, w * 0.26); c.fill();
    c.fillStyle = gold ? '#f0c24a' : '#c9a36a'; A.circ(c, x, bot - bulbR, bulbR + 2); c.fill(); c.fillStyle = rgba(col); A.circ(c, x, bot - bulbR, bulbR - 1); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; A.circ(c, x - bulbR * 0.35, bot - bulbR * 1.35, bulbR * 0.25); c.fill();
    // ticks
    c.strokeStyle = 'rgba(255,240,220,.55)'; c.lineWidth = 1;
    for (let v = 0; v <= 100; v += 10) { const y = Y(v); c.beginPath(); c.moveTo(x - w / 2 - (v % 50 ? 3 : 6), y); c.lineTo(x - w / 2, y); c.stroke(); }
    A.icon(c, 'flame', x - w * 1.25, Y(85), Math.min(16, w * 0.9), '#ff9a52'); A.icon(c, 'snow', x - w * 1.25, Y(15), Math.min(16, w * 0.9), '#8fdcff');
    // dial knob
    const ky = Y(cup.dial), kx = x + w / 2 + 3;
    c.fillStyle = drag.thermo ? '#ffe08a' : (gold ? '#f0c24a' : '#e0b46a'); c.beginPath(); c.moveTo(kx, ky); c.lineTo(kx + 12, ky - 9); c.lineTo(kx + 22, ky - 9); c.lineTo(kx + 22, ky + 9); c.lineTo(kx + 12, ky + 9); c.closePath(); c.fill();
    c.strokeStyle = '#6b4520'; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = 'rgba(107,69,32,.6)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(kx + 13 + i * 3, ky - 5); c.lineTo(kx + 13 + i * 3, ky + 5); c.stroke(); }
    // readout
    const z = zoneOf(cup.T), fs = L.port ? 11 : 13;
    c.font = `800 ${fs}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.fillStyle = z === 'hot' ? '#ffb27a' : z === 'cold' ? '#9fe6ff' : '#ffe9c9'; c.fillText(Math.round(cup.T) + '°', x, top + 10);
    c.font = `600 ${fs - 2}px ${FONT}`; c.fillStyle = 'rgba(255,233,201,.8)'; c.direction = getLang() === 'ar' ? 'rtl' : 'ltr'; c.fillText(t('ab_z_' + z), x, top - 4); c.direction = 'ltr';
    c.restore();
  }
  function thermoHit(x, y) { const th = L.th; return x > th.x - th.w * 1.6 && x < th.x + th.w + 30 && y > th.top - 10 && y < th.bot + 6; }
  function thermoSet(y) { const th = L.th, bulbR = th.w * 0.95, tubeTop = th.top + 18, tubeBot = th.bot - bulbR; const v = clamp((tubeBot - y) / (tubeBot - tubeTop) * 100, 0, 100); const old = cup.dial; cup.dial = Math.round(v); if (Math.round(old / 10) !== Math.round(cup.dial / 10)) Snd.play('tick'); }

  // ---------- jars ----------
  function jarAt(x, y) { for (const j of jars) { const c2 = j.cell; if (x > c2.x && x < c2.x + c2.w && y > j.y - j.h - 6 && y < j.ly + 26) return j; } return null; }
  function badgeOf(g) { return g.hot ? 'flame' : g.cold ? 'snow' : null; }
  function drawJars(c) {
    for (const j of jars) {
      const busy = pours.some(p => p.g === j.g && p.t < 0.75) || (drag.on && drag.moved && drag.id === j.g.id);
      const hov = drag.hover === j.g.id && drag.mouse;
      const sx = j.shake > 0 ? Math.sin(j.shake * 60) * 3 : 0;
      c.save(); if (busy) c.globalAlpha = 0.3;
      A.drawJar(c, j.g, j.x + sx, j.y - (hov ? 4 : 0), j.w, j.h, S.time + j.g.idx, { badge: badgeOf(j.g), glow: hov ? 'rgba(255,220,140,.9)' : null });
      c.restore();
      if (!L.port && !touchMode && j.key) { c.fillStyle = 'rgba(15,18,32,.75)'; A.circ(c, j.cell.x + 13, j.y - j.h + 4, 9); c.fill(); c.fillStyle = '#ffd25a'; c.font = `700 11px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(j.key.toUpperCase(), j.cell.x + 13, j.y - j.h + 4.5); }
    }
  }
  function jarMouth(p) {
    const k = p.t, j = p; const pos = pourPos(p);
    const ang = pos.rot, hh = p.h * 0.92;
    return [pos.x + Math.sin(ang) * hh, pos.y - Math.cos(ang) * hh];
  }
  function pourPos(p) {
    const D = cupDims(), px = Math.max(p.w * 0.3, L.cupX - D.w * 0.15 - p.h * 0.86), py = L.cupY - D.h - p.h * 0.55;
    const k1 = easeIO(clamp(p.t / 0.18, 0, 1)), k3 = clamp((p.t - 0.62) / 0.16, 0, 1);
    let x = lerp(p.sx, px, k1), y = lerp(p.sy, py, k1) - Math.sin(k1 * Math.PI) * 20, rot = lerp(0, 1.95, k1);
    if (k3 > 0) { rot = lerp(1.95, 0.2, k3); y -= k3 * 30; }
    return { x, y, rot, alpha: 1 - k3 };
  }
  function drawPours(c) {
    for (const p of pours) { const pos = pourPos(p); c.save(); c.globalAlpha = pos.alpha; A.drawJar(c, p.g, pos.x, pos.y, p.w, p.h, S.time, { rot: pos.rot }); c.restore(); }
  }

  // ============================================================ particles / text
  function burst(x, y, n, opt) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(opt.sp0 || 40, opt.sp1 || 160);
      parts.push(Object.assign({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up || 0), life: 0, max: rand(opt.l0 || 0.5, opt.l1 || 1.1), size: rand(opt.s0 || 3, opt.s1 || 7), rot: rand(0, 6), vr: rand(-4, 4) }, opt.p || {}, { type: opt.type, col: opt.col || pick(opt.cols || ['#fff']) }));
    }
  }
  function floatText(txt, x, y, col, size, life) {
    size = size || 22; if (L) x = clamp(x, Math.min(L.W / 2, size * 3.2), Math.max(L.W / 2, L.W - size * 3.2)); const near = texts.filter(q => Math.abs(q.x - x) < 120 && q.life < 0.7).length;   // stack instead of overlapping
    texts.push({ txt, x, y: y - near * size * 1.15, col: col || '#fff', size, life: 0, max: life || 1.3 });
  }
  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt; if (p.life >= p.max) { parts.splice(i, 1); continue; }
      if (p.to) { const k = ease(p.life / p.max); p.x = lerp(p.fx, p.to[0], k) + Math.sin(k * Math.PI) * (p.arc || 0); p.y = lerp(p.fy, p.to[1], k) - Math.sin(k * Math.PI) * 60; if (p.life + dt >= p.max && p.onEnd && !p.done) { p.done = true; p.onEnd(); } continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.type === 'drop' || p.type === 'coin') p.vy += 500 * dt;
      if (p.type === 'steam' || p.type === 'wisp') { p.vx += Math.sin(p.life * 3 + p.y * 0.05) * 20 * dt; }
      if (p.type === 'flame' || p.type === 'spark2') { p.vx *= 0.94; p.vy *= 0.94; p.vy -= 60 * dt; }
      if (p.type === 'heart' || p.type === 'note') p.vy *= 0.98;
      if (p.rot != null) p.rot += (p.vr || 0) * dt;
    }
    for (let i = texts.length - 1; i >= 0; i--) { const x = texts[i]; x.life += dt; x.y -= 28 * dt; if (x.life > x.max) texts.splice(i, 1); }
  }
  function drawParts(c) {
    for (const p of parts) {
      const k = p.life / p.max, a = 1 - k;
      c.save();
      switch (p.type) {
        case 'steam': c.fillStyle = `rgba(255,255,255,${0.22 * Math.sin(k * Math.PI)})`; A.circ(c, p.x, p.y, p.size * (1 + k * 1.6)); c.fill(); break;
        case 'mist': c.fillStyle = `rgba(200,240,255,${0.25 * Math.sin(k * Math.PI)})`; A.circ(c, p.x, p.y, p.size * (1 + k)); c.fill(); break;
        case 'wisp': c.fillStyle = `rgba(80,40,120,${0.35 * Math.sin(k * Math.PI)})`; A.circ(c, p.x, p.y, p.size * (1 + k * 1.2)); c.fill(); break;
        case 'spark': case 'spark2': c.globalAlpha = Math.sin(k * Math.PI); A.icon(c, 'star', p.x, p.y, p.size * (p.type === 'spark2' ? 1.4 : 1), p.col || '#fff6c0'); break;
        case 'flame': { const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2); g.addColorStop(0, `rgba(255,240,150,${a})`); g.addColorStop(0.5, `rgba(255,120,40,${a * 0.7})`); g.addColorStop(1, 'rgba(255,60,20,0)'); c.fillStyle = g; A.circ(c, p.x, p.y, p.size * 2); c.fill(); break; }
        case 'drop': c.fillStyle = p.col; c.globalAlpha = a; A.circ(c, p.x, p.y, p.size * 0.5); c.fill(); break;
        case 'heart': c.globalAlpha = Math.min(1, a * 2); c.translate(p.x, p.y); c.rotate(Math.sin(p.life * 5) * 0.2); A.icon(c, 'heart', 0, 0, p.size * (0.8 + Math.sin(k * Math.PI) * 0.4), p.col || '#ff6b8b'); break;
        case 'fly': c.globalAlpha = p.icon === 'coin' ? 1 : Math.min(1, (1 - k) * 4); if (p.icon === 'coin') coinArt(c, p.x, p.y, p.size); else A.icon(c, p.icon, p.x, p.y, p.size, p.col); break;
        case 'coin': c.globalAlpha = a; coinArt(c, p.x, p.y, p.size); break;
        case 'ring': c.strokeStyle = p.col; c.globalAlpha = a; c.lineWidth = 2; A.circ(c, p.x, p.y, p.size * (1 + k * 3)); c.stroke(); break;
        case 'bolt': c.globalAlpha = a; A.icon(c, 'bolt', p.x, p.y, p.size, p.col || '#fff7a0'); break;
        case 'snow': c.globalAlpha = a; A.icon(c, 'snow', p.x, p.y, p.size, p.col || '#dff8ff', 2); break;
        case 'cloud': {
          c.globalAlpha = Math.min(1, Math.sin(k * Math.PI) * 2); c.fillStyle = '#6a6a86'; for (const [dx, dy, r] of [[-12, 0, 11], [0, -6, 14], [13, 0, 10]]) { A.circ(c, p.x + dx, p.y + dy, r); c.fill(); }
          c.fillStyle = '#8fc8ff'; for (let i = 0; i < 4; i++) { const ry = ((p.life * 2 + i * 0.25) % 1) * 30; c.fillRect(p.x - 12 + i * 8, p.y + 10 + ry, 2, 6); } break;
        }
        case 'note': c.globalAlpha = a; A.icon(c, 'note', p.x, p.y, p.size, p.col || '#ffe9c9'); break;
      }
      c.restore();
    }
    for (const x of texts) {
      const k = x.life / x.max, a = k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1, sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
      c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(x.x, x.y); c.scale(sc, sc); c.font = `900 ${x.size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = getLang() === 'ar' ? 'rtl' : 'ltr';
      c.lineWidth = 5; c.strokeStyle = 'rgba(30,14,24,.85)'; c.strokeText(x.txt, 0, 0); c.fillStyle = x.col; c.fillText(x.txt, 0, 0); c.restore();
    }
  }
  function coinArt(c, x, y, s) { c.fillStyle = '#b8860b'; A.circ(c, x, y + 1, s * 0.5); c.fill(); c.fillStyle = '#ffd25a'; A.circ(c, x, y, s * 0.5); c.fill(); c.strokeStyle = '#fff1a8'; c.lineWidth = 1.2; A.circ(c, x, y, s * 0.32); c.stroke(); }
  function hudPoint(id) { const el = $(id); if (!el) return [L.W - 60, 26]; const r = el.getBoundingClientRect(); return [r.left + r.width * 0.3, r.top + r.height / 2]; }

  // ============================================================ customers
  function custOpts(cu) {
    let mood = cu.mood || 'idle';
    return { hue: cu.hue, mood, blink: cu.blink, look: cu.look };
  }
  function updateCust(dt) {
    const cu = S.cust; if (!cu) return;
    cu.pt += dt; cu.at += dt;
    cu.blinkT -= dt; if (cu.blinkT <= 0) { cu.blink = 1; if (cu.blinkT < -0.12) { cu.blink = 0; cu.blinkT = rand(2, 5); } } else cu.blink = 0;
    const lookT = (drag.on && drag.moved) || pours.length ? 1 : Math.sin(cu.at * 0.7) * 0.4; cu.look = lerp(cu.look, lookT, 1 - Math.exp(-dt * 4));
    const off = -L.custS * 1.2;
    switch (cu.phase) {
      case 'enter': cu.x = lerp(off, L.custX, ease(cu.pt / 0.9)); if (cu.pt >= 0.9) { cu.phase = cu.demo ? 'idle' : 'order'; cu.pt = 0; if (!cu.demo) onOrderStart(); } break;
      case 'idle': cu.x = L.custX; if (cu.pt > 6) { cu.phase = 'leave'; cu.pt = 0; } break;
      case 'order': {
        cu.x = L.custX;
        const freeze = S.tut && S.tut.active;
        if (!freeze && S.screen === 'play') cu.patience -= dt * drainMul();
        const f = cu.patience / cu.patienceMax;
        cu.mood = f < 0.3 ? 'impatient' : (pours.length && pours[pours.length - 1].t < 0.8 ? 'wow' : 'idle');
        if (f < 0.3 && !cu.warned) { cu.warned = true; Snd.play('warn'); floatText('!', cu.head[0] + L.custS * 0.25, cu.topY, '#ffcf4a', 34, 1); }
        if (cu.patience <= 0) { if (NET.on) cu.patience = 0; else timeoutCust(); }   // online: the host decides when a customer gives up
        break;
      }
      case 'drink': cu.x = L.custX; cu.mood = cup.st > 0.6 ? 'drink' : 'wow'; if (cup.st >= 1.4) finishServe(); break;
      case 'react': cu.x = L.custX; if (cu.pt > (NET.on ? 1.5 : 2.1)) { cu.phase = 'leave'; cu.pt = 0; Snd.play('whoosh'); hideBubble(); } break;
      case 'leave': cu.x = lerp(L.custX, off, easeIO(cu.pt / 0.9)); if (cu.pt >= 0.9) { if (cu.demo) spawnDemo(); else if (NET.on) { S.cust = null; netIdle(); } else nextCustomer(); } break;
    }
  }
  function drawCust(c) {
    const cu = S.cust; if (!cu) return;
    c.save(); c.translate(cu.x, L.counterY + 2);
    if (cu.phase === 'enter' || cu.phase === 'leave') { const k = cu.phase === 'enter' ? cu.pt / 0.9 : 1 - cu.pt / 0.9; c.globalAlpha = clamp(k * 3, 0, 1); c.translate(0, -Math.abs(Math.sin(cu.at * 9)) * L.custS * 0.03); }
    const info = A.drawCreature(c, cu.type, L.custS, cu.at, custOpts(cu));
    c.restore();
    cu.head = [cu.x + info.head[0], L.counterY + info.head[1]]; cu.topY = L.counterY + info.top;
  }
  function makeCustList(cfg) {
    const types = Object.keys(CREATURES).filter(k => CREATURES[k].day <= cfg.d), fresh = types.filter(k => CREATURES[k].day === cfg.d);
    const list = []; let last = null;
    for (let i = 0; i < cfg.n; i++) {
      let tp; if (i === 0 && fresh.length) tp = fresh[0]; else if (i === 2 && fresh.length > 1) tp = fresh[1]; else { do { tp = pick(types); } while (tp === last && types.length > 1); }
      list.push(tp); last = tp;
    }
    return list;
  }
  function spawnCustomer() {
    const type = S.custList[S.custIdx], cr = CREATURES[type];
    const order = genOrder(S.cfg);
    order.mystery = S.custIdx > 0 && Math.random() < S.cfg.mystery;
    const pm = S.cfg.patience * cr.pat + patBonus();
    S.cust = { type, hue: pick(cr.hues), phase: 'enter', pt: 0, at: rand(0, 10), x: -L.custS, patience: pm, patienceMax: pm, order, revealed: !order.mystery, mood: 'idle', blink: 0, blinkT: rand(1, 3), look: 0, head: [L.custX, L.counterY - L.custS * 0.6], topY: L.counterY - L.custS };
    resetCup(); cup.pop = 0.2; cup.disp = [0, 0, 0];
    Snd.play('bell'); hideBubble(); updateHud();
  }
  function spawnDemo() {
    const types = Object.keys(CREATURES).filter(k => CREATURES[k].day <= Math.max(1, save.maxDay));
    const prev = S.cust && S.cust.type; let tp; do { tp = pick(types); } while (tp === prev && types.length > 1);
    const cr = CREATURES[tp];
    S.cust = { type: tp, hue: pick(cr.hues), phase: 'enter', pt: 0, at: rand(0, 10), x: -L.custS, demo: true, mood: 'idle', blink: 0, blinkT: 2, look: 0 };
  }
  function demoCup() {
    resetCup(); const ids = ingsFor(Math.max(1, save.maxDay)).filter(g => !g.special);
    for (let i = 0; i < 3; i++) { const g = pick(ids); cup.layers.push({ col: g.rgb.slice(), vol: 1, target: 1, blend: 0.5 }); cup.mix = applyTo(cup.mix, g, 'mild'); }
    cup.T = cup.dial = 82;
  }
  function onOrderStart() {
    showBubble(); Snd.play('magic');
    const cu = S.cust;
    if (S.tut && S.tut.active && S.tut.step === 0) setCoach('ab_c1', 'board', true);
    if (S.custIdx === 0 && S.tipKey) { setCoach(S.tipKey, S.tipKey === 'ab_tip_mystery' || S.tipKey === 'ab_tip_finale' ? 'bubble' : 'shelf', true); S.tipKey = null; }
    if (cu.order.mystery) floatText('?', cu.head ? cu.head[0] : L.custX, (cu.topY || L.counterY - L.custS) - 10, '#d8b4ff', 34);
  }
  function timeoutCust() { S.combo = 0; strike(); timeoutFx(); if (S.tut) S.tut.active = false; setCoach(null); }
  function timeoutFx() {
    const cu = S.cust; cu.result = { acc: 0, hearts: 0, tips: 0, timeout: true }; cu.phase = 'react'; cu.pt = 0; cu.mood = 'angry';
    shake = 10; Snd.play('bad');
    if (cupLevel() > 0) { cup.state = 'dumping'; Snd.play('drain'); }
    parts.push({ type: 'cloud', x: cu.head[0], y: cu.topY - 30, vx: 0, vy: -5, life: 0, max: 2 });
    floatText(t('ab_late'), cu.head[0], cu.topY - 20, '#ff8a8a', L.port ? 22 : 28);
    showReaction(t('ab_rangry'), 0);
  }
  function strike() { S.strikes++; if (S.strikes >= strikeLimit()) S.failPending = true; updateHud(); }
  function canBrew() { return S.screen === 'play' && S.cust && S.cust.phase === 'order' && (cup.state === 'idle'); }
  function addIng(id, fromX, fromY) {
    const g = INGM[id]; if (!g || g.day > S.dayNum) return false;
    if (!canBrew()) { if (S.screen === 'play' && S.cust && S.cust.phase !== 'order') toast(t('ab_busy')); return false; }
    const j = jars.find(q => q.g.id === id);
    if (cup.doses.length >= capacity()) { toast(t('ab_full')); Snd.play('full'); if (j) j.shake = 0.3; return false; }
    Snd.init();
    const zone = zoneOf(cup.T), e = effectOf(g, zone);
    cup.mix = applyTo(cup.mix, g, zone);
    if (g.special === 'time' && S.cust) { S.cust.patience = Math.min(S.cust.patienceMax, S.cust.patience + 8); if (NET.on) netAct({ a: 'time', u: S.cust.uid }); }
    cup.doses.push({ id, zone });
    cup.layers.push({ col: g.rgb.slice(), vol: 0, target: 1, blend: 0 });
    pours.push({ g, t: 0, sx: fromX != null ? fromX : (j ? j.x : L.cupX), sy: fromY != null ? fromY : (j ? j.y : L.cupY), w: j ? j.w : 50, h: j ? j.h : 64, zone, fx: e.fx, splashed: false });
    Snd.play('pour');
    if (S.tut && S.tut.active) {
      if (S.tut.step <= 1) { S.tut.step = 2; setCoach('ab_c3', 'thermo'); }
      else if (S.tut.step === 2 && cup.doses.length >= 2) { S.tut.step = 3; setCoach('ab_c4', 'serve'); }
    } else if (S.coach && S.coach.tip && S.coach.target === 'shelf') setCoach(null);
    updateActions();
    return true;
  }
  function reactionFx(p) {
    const x = L.cupX, y = cupSurfaceY() - 10, fs = L.port ? 20 : 26;
    const say = (k, col) => floatText(t('ab_x_' + k), x, y - 30, col, fs);
    switch (p.fx) {
      case 'ignite': burst(x, y, 26, { type: 'flame', sp0: 60, sp1: 220, s0: 5, s1: 11, up: 80 }); shake = Math.max(shake, 7); Snd.play('sizzle'); say('ignite', '#ffb04a'); break;
      case 'erupt': burst(x, y, 22, { type: 'flame', sp0: 80, sp1: 260, s0: 4, s1: 9, up: 120 }); burst(x, y, 10, { type: 'drop', cols: ['#e2352c', '#ff7a3a'], sp0: 80, sp1: 220, up: 160 }); shake = Math.max(shake, 8); Snd.play('sizzle'); say('erupt', '#ff7a5a'); break;
      case 'boil': burst(x, y, 16, { type: 'ring', col: '#e8ff9a', sp0: 10, sp1: 60, s0: 3, s1: 6 }); burst(x, y, 10, { type: 'drop', cols: ['#c4f040'], sp0: 60, sp1: 180, up: 160 }); Snd.play('sizzle'); say('boil', '#d8ff7a'); break;
      case 'thunder': burst(x, y - 20, 6, { type: 'bolt', sp0: 40, sp1: 120, s0: 14, s1: 22 }); shake = Math.max(shake, 9); Snd.play('thunder'); say('thunder', '#c8d8ff'); break;
      case 'glow': burst(x, y, 18, { type: 'spark2', col: '#e8ecff', sp0: 30, sp1: 120, s0: 5, s1: 9 }); Snd.play('frost'); say('glow', '#dfe6ff'); break;
      case 'fade': burst(x, y, 12, { type: 'wisp', sp0: 10, sp1: 40, s0: 6, s1: 10, l0: 1, l1: 1.6 }); Snd.play('frost'); say('fade', '#c9b8e8'); break;
      case 'fizzle': burst(x, y, 10, { type: 'snow', sp0: 20, sp1: 80, s0: 8, s1: 12 }); Snd.play('frost'); say('fizzle', '#bfe8ff'); break;
      case 'halve': burst(x, y, 16, { type: 'ring', col: '#b9a8ff', sp0: 5, sp1: 30, s0: 4, s1: 8 }); Snd.play('magic'); say('halve', '#d3c8ff'); break;
      case 'mirror': burst(x, y, 18, { type: 'ring', col: '#cfeeff', sp0: 10, sp1: 50, s0: 4, s1: 9 }); burst(x, y, 10, { type: 'spark2', cols: ['#ffffff', '#bfe9ff'], sp0: 40, sp1: 120 }); Snd.play('magic'); say('mirror', '#cfeeff'); break;
      case 'amplify': burst(x, y, 22, { type: 'spark2', cols: ['#ffe58a', '#9fb0ff', '#ffffff'], sp0: 70, sp1: 230 }); shake = Math.max(shake, 6); Snd.play('magic'); Snd.play('thunder'); say('amplify', '#ffe58a'); break;
      case 'bloom': burst(x, y, 16, { type: 'heart', cols: ['#ffb3cf', '#ffe3ee'], sp0: 30, sp1: 110, up: 60, s0: 7, s1: 12 }); Snd.play('frost'); say('bloom', '#ffc0d8'); break;
      case 'soothe': burst(x, y - 10, 6, { type: 'note', col: '#e0d4ff', sp0: 20, sp1: 60, up: 40, s0: 12, s1: 18, l0: 0.9, l1: 1.4 }); Snd.play('magic'); say('soothe', '#d8c8ff'); break;
      case 'stone': burst(x, y, 12, { type: 'drop', cols: ['#8a7f7a', '#5a504c'], sp0: 40, sp1: 120, up: 100 }); Snd.play('drain'); say('stone', '#c8bdb8'); break;
      case 'time': burst(x, y, 12, { type: 'spark2', col: '#ffe08a', sp0: 30, sp1: 100 }); Snd.play('magic'); say('time', '#ffe08a'); if (S.cust && S.cust.head) floatText('+8', S.cust.head[0], S.cust.topY - 10, '#ffe08a', 22); break;
    }
  }
  function updatePours(dt) {
    for (let i = pours.length - 1; i >= 0; i--) {
      const p = pours[i]; p.t += dt;
      if (p.t > 0.24 && !p.splashed) {
        p.splashed = true; const D = cupDims(), sy = cupSurfaceY();
        const col = Math.round(WN * 0.42); for (let k = -2; k <= 2; k++) if (cup.wave[col + k] != null) cup.waveV[col + k] += 120 * (1 - Math.abs(k) * 0.3);
        burst(L.cupX - D.w * 0.08, sy, 6, { type: 'drop', col: rgba(p.g.rgb), sp0: 40, sp1: 110, up: 120, s0: 3, s1: 6, l0: 0.3, l1: 0.6 });
        cup.swirls.push({ t: 0, col: p.g.rgb.slice() }); Snd.play('plop');
        if (p.fx) reactionFx(p);
      }
      if (p.t > 0.3 && p.t < 0.6 && Math.random() < 0.5) { const c2 = Math.round(WN * 0.42 + rand(-2, 2)); if (cup.wave[c2] != null) cup.waveV[c2] += 40; }
      if (p.t > 0.8) pours.splice(i, 1);
    }
  }
  function serve() {
    const cu = S.cust; if (!canBrew()) return;
    if (!cup.doses.length) { toast(t('ab_empty')); return; }
    Snd.init();
    const m = effMood(cup.mix, cup.T);
    if (NET.on) cu.result = null;   // online: the host scores the drink (finishServe waits for its verdict)
    else {
      const acc = accuracy(m, cu.order.target), pf = clamp(cu.patience / cu.patienceMax, 0, 1);
      const hearts = acc >= 0.8 ? 3 : acc >= 0.55 ? 2 : acc >= 0.3 ? 1 : 0;
      const base = CREATURES[cu.type].tip, combo = hearts === 3 ? S.combo + 1 : 0;
      const tips = hearts ? Math.round(base * (0.35 + 0.65 * acc) * (0.55 + 0.45 * pf) * (1 + tipBonus())) + (hearts === 3 ? 2 + Math.min(combo - 1, 5) : 0) : 0;
      cu.result = { acc, hearts, tips, combo };
    }
    cu.phase = 'drink'; cu.pt = 0; cup.state = 'serving'; cup.st = 0;
    if (NET.on) { cu.netRes = null; NET.focus = ''; netAct({ a: 'srv', u: cu.uid, m: m.map(v => Math.round(v * 1000) / 1000) }); }
    Snd.play('whoosh'); setTimeout(() => Snd.play('gulp'), 600);
    if (S.tut) { S.tut.active = false; setCoach(null); }
    if (S.coach) setCoach(null);
    hideBubble(true); updateActions();
  }
  function finishServe() {
    const cu = S.cust; if (cu.phase !== 'drink') return;
    if (NET.on) {   // online: show the host's verdict (normally here long before the drink is finished)
      if (!cu.netRes && cu.pt < 3.5) return;
      const e = cu.netRes;
      if (!e || e.rej) { cu.phase = 'react'; cu.pt = 0; cu.mood = 'sad'; cu.result = { acc: 0, hearts: 0, tips: 0, timeout: true }; showReaction(t('ab_o_toolate'), 0); return; }
      cu.result = { acc: e.ac / 100, hearts: e.h, tips: e.tp, combo: e.cb };
      serveFx(cu, cu.result); updateHud(); return;
    }
    const r = cu.result;
    S.hearts += r.hearts; S.tipsToday += r.tips; save.tips += r.tips; save.served++;
    if (r.hearts === 3) { S.perfects++; save.perfects++; S.combo = r.combo; } else S.combo = 0;
    if (r.hearts === 0) strike();
    serveFx(cu, r);
    persist(); updateHud();
  }
  function serveFx(cu, r) {
    cu.phase = 'react'; cu.pt = 0; cu.mood = r.hearts >= 2 ? 'happy' : r.hearts === 1 ? 'idle' : 'angry';
    if (r.hearts === 0) shake = 9;
    const hx = cu.head[0], hy = cu.topY;
    const vcol = ['#ff8a8a', '#ffc27a', '#ffe17a', '#8dffa8'][r.hearts];
    floatText(t('ab_v' + r.hearts) + ' ' + Math.round(r.acc * 100) + '%', hx, hy - 24, vcol, L.port ? 22 : 30, 1.6);
    if (r.combo > 1) setTimeout(() => floatText(t('ab_combo', { n: r.combo }), hx, hy + 10, '#ffd25a', L.port ? 16 : 20, 1.3), 350);
    Snd.play(['bad', 'meh', 'good', 'perfect'][r.hearts]);
    const hp = hudPoint('sHearts'), tp = hudPoint('sTips');
    for (let i = 0; i < r.hearts; i++) parts.push({ type: 'fly', icon: 'heart', col: '#ff6b8b', fx: hx + (i - 1) * 26, fy: hy, x: hx, y: hy, to: hp, arc: rand(-40, 40), life: -i * 0.15, max: 1.1, size: 22, onEnd: () => { pulseHud('sHearts'); } });
    const nc = Math.min(8, Math.ceil(r.tips / 3));
    for (let i = 0; i < nc; i++) parts.push({ type: 'fly', icon: 'coin', fx: L.cupX * 0.4 + hx * 0.6 + rand(-20, 20), fy: L.counterY - 10, x: hx, y: hy, to: tp, arc: rand(-60, 60), life: -0.3 - i * 0.08, max: 1.0, size: 14, onEnd: () => { Snd.play('coin'); pulseHud('sTips'); } });
    if (r.hearts >= 2) burst(hx, hy + L.custS * 0.2, r.hearts === 3 ? 18 : 10, { type: 'heart', cols: ['#ff6b8b', '#ff9ab8', '#ffc2d4'], sp0: 40, sp1: 140, up: 90, s0: 10, s1: 18, l0: 0.8, l1: 1.4 });
    if (r.hearts === 3) burst(hx, hy + L.custS * 0.3, 16, { type: 'spark2', cols: ['#fff6c0', '#ffd25a'], sp0: 60, sp1: 200 });
    if (r.hearts === 0) parts.push({ type: 'cloud', x: hx, y: hy - 30, vx: 0, vy: -5, life: 0, max: 2 });
    showReaction(t('ab_r' + r.hearts), r.hearts, r.tips);
  }
  function nextCustomer() {
    S.cust = null; S.custIdx++;
    if (S.failPending) return endDay(false, 'strikes');
    if (S.custIdx >= S.cfg.n) return endDay(S.hearts >= S.cfg.goal, 'hearts');
    spawnCustomer();
  }
  function dump() {
    if (!canBrew() || !cup.doses.length) return;
    cup.state = 'dumping'; Snd.play('drain'); updateActions();
    burst(L.cupX, cupSurfaceY(), 8, { type: 'drop', col: rgba(brewColor()), sp0: 40, sp1: 120, up: 100 });
  }
  function peek() {
    const cu = S.cust; if (!cu || cu.revealed || cu.phase !== 'order') return;
    const cost = peekCost(); if (coins() < cost) { toast(t('ab_cant')); return; }
    if (NET.on) { netAct({ a: 'peek', u: cu.uid }); return; }   // shared coins: the host pays and reveals it for everyone
    save.tips -= cost; cu.revealed = true; persist(); Snd.play('magic'); updateHud(); showBubble();
    burst(L.boardG.cx, L.boardG.cy, 16, { type: 'spark2', cols: ['#d8b4ff', '#fff6c0'], sp0: 40, sp1: 140 });
  }

  // ============================================================ day flow
  function startDay(d) {
    S.dayNum = d; S.cfg = dayCfg(d); S.custList = makeCustList(S.cfg); S.custIdx = 0; S.hearts = 0; S.strikes = 0; S.tipsToday = 0; S.perfects = 0; S.combo = 0; S.failPending = false; S.usedP = new Set();
    S.tut = d === 1 && !save.best[1] ? { active: true, step: 0 } : null;
    S.tipKey = ({ 3: 'ab_tip_phoenix', 4: 'ab_tip_mystery', 9: 'ab_tip_void', 10: 'ab_tip_sand', 13: 'ab_tip_sakura', 14: 'ab_tip_mirror', 17: 'ab_tip_comet', 19: 'ab_tip_lava', 20: 'ab_tip_finale' })[d] || null;
    parts.length = 0; texts.length = 0; pours.length = 0; setCoach(null);
    layoutJars(); buildBg();
    S.screen = 'intro'; showOverlay('intro');
  }
  function openCafe() {
    hideOverlay(); S.screen = 'play'; S.cust = null; resetCup();
    $('hud').classList.add('ingame'); updateHud(); updateActions(); spawnCustomer();
  }
  function endDay(win, why) {
    if (NET.on) return;   // online days end on the host and never touch the solo save
    S.screen = 'end'; hideBubble(); setCoach(null); updateActions();
    const d = S.dayNum, maxH = S.cfg.n * 3;
    const stars = win ? (S.hearts >= maxH * 0.9 ? 3 : S.hearts >= (S.cfg.goal + maxH) / 2 ? 2 : 1) : 0;
    if (win) { save.maxDay = Math.max(save.maxDay, d + 1); save.best[d] = Math.max(save.best[d] || 0, S.hearts); save.stars[d] = Math.max(save.stars[d] || 0, stars); Snd.play('win'); }
    else Snd.play('lose');
    persist(); if (win) reportBest();
    S.lastResult = { win, why, d, hearts: S.hearts, goal: S.cfg.goal, maxH, tips: S.tipsToday, perfects: S.perfects, stars };
    setTimeout(() => { if (S.screen === 'end') showOverlay('end'); }, 450);
    if (win) for (let i = 0; i < 4; i++) setTimeout(() => burst(rand(L.W * 0.2, L.W * 0.8), rand(L.H * 0.2, L.H * 0.5), 24, { type: 'spark2', cols: ['#ffd25a', '#ff9ab8', '#9fe6ff', '#b5e48c'], sp0: 60, sp1: 260 }), i * 220);
  }
  function goTitle() {
    S.screen = 'title'; hideBubble(); setCoach(null); $('hud').classList.remove('ingame');
    S.dayNum = Math.max(1, save.maxDay); S.cfg = null; layoutJars(); buildBg(); spawnDemo(); demoCup(); updateActions(); showOverlay('title');
  }
  function pause() {
    if (S.screen !== 'play') return;
    S.screen = 'paused'; showOverlay(NET.on ? 'opause' : 'pause');
    // online: hand my customer back to the queue while I'm away (I pick one again when I come back)
    if (NET.on && pCount() > 1 && S.cust && S.cust.uid && (S.cust.phase === 'order' || S.cust.phase === 'enter')) { netAct({ a: 'drop', u: S.cust.uid }); S.cust = null; NET.focus = ''; hideBubble(); updateActions(); }
  }
  function resume() { if (S.screen !== 'paused') return; hideOverlay(); S.screen = 'play'; if (NET.on) netIdle(); }

  // ============================================================ DOM UI
  const ui = { bubble: $('bubble'), actions: $('actions'), serve: $('serveBtn'), dump: $('dumpBtn'), tip: $('tip'), coach: $('coach'), toast: $('toast'), overlay: $('overlay'), box: $('box') };
  const qEl = $('queue');   // online: the shared customer queue
  const svg = (n, col, s) => A.iconSvg(n, col, s);
  function placeDom() {
    const b = L.bubble; Object.assign(ui.bubble.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', maxHeight: b.maxH + 'px' });
    const a = L.actions; Object.assign(ui.actions.style, { left: a.x + 'px', top: a.y + 'px', width: a.w + 'px', height: a.h + 'px' });
    document.body.classList.toggle('port', L.port); document.body.classList.toggle('short', !!L.short);
    if (L.port) Object.assign(qEl.style, { left: '6px', top: (L.top + 4) + 'px', width: Math.max(120, L.bubble.x - 12) + 'px' });   // above the customer, beside the order
    else Object.assign(qEl.style, { left: '10px', top: (L.counterY + 8) + 'px', width: Math.min(L.W * 0.36, L.cupX - cupDims().w - 30) + 'px' });   // on the free counter, left of the cup
    if (!L.port) Object.assign(ui.coach.style, { left: '10px', top: (L.counterY + 8) + 'px', width: Math.min(L.W * 0.36, 440) + 'px', bottom: 'auto', right: 'auto' });
    else Object.assign(ui.coach.style, { left: '6px', top: (L.top + 6) + 'px', width: (L.W * 0.43 - 8) + 'px', bottom: 'auto', right: 'auto' });   // over the customer, clear of the jars
  }
  function axisIcons(v) {
    let s = ''; for (let k = 0; k < 3; k++) { if (Math.abs(v[k]) < 0.25) continue; const ax = AX[k]; s += svg(v[k] > 0 ? ax.ip : ax.in, v[k] > 0 ? ax.cp : ax.cn, 14); }
    return s ? `<span class="ics">${s}</span>` : '';
  }
  function orderHtml(o, icons) {
    const ph = (i) => { const s2 = frag('ab_p' + i), cut = s2.lastIndexOf(' '), ic = icons ? axisIcons(PH[i].v) : ''; return `<b class="kw">${cut > 0 ? s2.slice(0, cut + 1) : ''}<span class="nw">${s2.slice(cut + 1)}${ic}</span></b>`; };
    return t('ab_t' + o.tpl, { a: ph(o.a), b: ph(o.b) });
  }
  function showBubble() {
    const cu = S.cust; if (!cu || !cu.order) return;
    const o = cu.order, cost = peekCost();
    ui.bubble.innerHTML = `<div class="who">${NET.on ? `<i class="pdot" style="background:${colOf(NET.me)}"></i>` : ''}${t('ab_cr_' + cu.type)}${o.mystery ? `<span class="myst">${svg('orb', '#c79bff', 14)}</span>` : ''}</div>
      <div class="poem">${orderHtml(o, !o.mystery)}</div>
      ${o.mystery && !cu.revealed ? `<div class="mnote">${t('ab_mystery')}</div><button class="peek" id="peekBtn">${svg('orb', '#2a1440', 14)} ${cost ? t('ab_peek_cost', { n: cost }) : t('ab_peek') + ' (' + t('ab_free') + ')'}</button>` : ''}
      <div class="pat"><i id="patBar"></i></div>`;
    ui.bubble.hidden = false; ui.bubble.dataset.idle = ''; ui.bubble.classList.remove('react', 'dim'); requestAnimationFrame(() => ui.bubble.classList.add('show'));
    const pb = $('peekBtn'); if (pb) pb.onclick = (e) => { e.stopPropagation(); peek(); };
    updateActions();
  }
  function showReaction(line, hearts, tips) {
    let hs = ''; for (let i = 0; i < 3; i++) hs += svg('heart', i < hearts ? '#ff5d7a' : 'rgba(80,40,50,.25)', 20);
    ui.bubble.dataset.idle = '';
    ui.bubble.innerHTML = `<div class="who">${t('ab_cr_' + S.cust.type)}</div><div class="poem">${line}</div><div class="hearts">${hs}${tips ? `<span class="tipv">+${tips}<i class="coin"></i></span>` : ''}</div>`;
    ui.bubble.hidden = false; ui.bubble.classList.remove('dim'); ui.bubble.classList.add('show', 'react');
  }
  function hideBubble(keep) { if (keep) { ui.bubble.classList.add('dim'); return; } ui.bubble.classList.remove('show', 'dim'); ui.bubble.hidden = true; ui.bubble.dataset.idle = ''; }
  function updatePatience() {
    const el = $('patBar'); if (!el || !S.cust || S.cust.phase !== 'order') return;
    const f = clamp(S.cust.patience / S.cust.patienceMax, 0, 1); el.style.width = (f * 100).toFixed(1) + '%';
    el.style.background = f > 0.55 ? '#5fd38a' : f > 0.3 ? '#ffc94a' : '#ff6b6b';
  }
  function updateActions() {
    const show = S.screen === 'play' || S.screen === 'paused';
    ui.actions.hidden = !show;
    ui.serve.disabled = !(canBrew() && cup.doses.length);
    ui.dump.disabled = !(canBrew() && cup.doses.length);
    ui.serve.classList.toggle('pulse', !!(S.coach && S.coach.target === 'serve'));
  }
  function updateHud() {
    $('langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية';
    $('sTips').innerHTML = `<i class="coin"></i>${coins()}`;
    $('pauseBtn').innerHTML = svg('pause', '#eef0ff', 16);
    if (!S.cfg) return;
    if (NET.on && NET.D) {   // online: the shared day from the host
      const D = NET.D;
      $('sDay').textContent = t('ab_day', { n: D.d });
      $('sCust').textContent = Math.min(D.dn, D.n) + '/' + D.n;
      $('sHearts').innerHTML = `${svg('heart', '#ff6b8b', L.port ? 13 : 15)}${D.h}<small>/${D.g}</small>`;
      let s2 = ''; if (L.port || D.sl > 6) s2 = `<b class="${D.sk ? 'on' : ''}">✕</b>${D.sk}<small>/${D.sl}</small>`; else for (let i = 0; i < D.sl; i++) s2 += `<b class="${i < D.sk ? 'on' : ''}">✕</b>`;
      $('sStrikes').innerHTML = s2; return;
    }
    $('sDay').textContent = t('ab_day', { n: S.dayNum });
    $('sCust').textContent = Math.min(S.custIdx + 1, S.cfg.n) + '/' + S.cfg.n;
    $('sHearts').innerHTML = `${svg('heart', '#ff6b8b', L.port ? 13 : 15)}${S.hearts}<small>/${S.cfg.goal}</small>`;
    let st = ''; if (L.port) st = `<b class="${S.strikes ? 'on' : ''}">✕</b>${S.strikes}<small>/${strikeLimit()}</small>`; else for (let i = 0; i < strikeLimit(); i++) st += `<b class="${i < S.strikes ? 'on' : ''}">✕</b>`;
    $('sStrikes').innerHTML = st;
  }
  function pulseHud(id) { const el = $(id); if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); updateHud(); }
  let toastTm = 0;
  function toast(msg) { ui.toast.textContent = msg; ui.toast.hidden = false; ui.toast.classList.add('show'); clearTimeout(toastTm); toastTm = setTimeout(() => { ui.toast.classList.remove('show'); setTimeout(() => ui.toast.hidden = true, 250); }, 1500); }
  function setCoach(key, target, tip) {
    if (!key) { S.coach = null; ui.coach.hidden = true; updateActions(); return; }
    S.coach = { key, target, tip: !!tip };
    ui.coach.innerHTML = `<span>${t(key)}</span>${tip ? `<button class="btn small" id="coachOk">${t('ab_ok')}</button>` : ''}`;
    ui.coach.hidden = false;
    const ok = $('coachOk'); if (ok) ok.onclick = () => { Snd.play('click'); if (S.tut && S.tut.active && S.tut.step === 0) { S.tut.step = 1; setCoach('ab_c2', 'shelf'); } else setCoach(null); };
    updateActions();
  }
  function drawCoachRing(c) {
    if (!S.coach || S.screen !== 'play') return;
    let r = null; const tg = S.coach.target;
    if (tg === 'board') r = { x: L.board.x, y: L.board.y, w: L.board.w, h: L.board.h };
    else if (tg === 'shelf') r = { x: L.shelf.x, y: L.shelf.y, w: L.shelf.w, h: L.shelf.h };
    else if (tg === 'thermo') r = { x: L.th.x - L.th.w * 1.8, y: L.th.top - 24, w: L.th.w * 3.6 + 24, h: L.th.bot - L.th.top + 30 };
    if (!r) return;
    const p = 0.5 + Math.sin(S.time * 5) * 0.5;
    c.save(); c.strokeStyle = `rgba(255,210,90,${0.5 + p * 0.5})`; c.lineWidth = 3 + p * 2; c.setLineDash([10, 6]); c.lineDashOffset = -S.time * 20; A.rr(c, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12); c.stroke(); c.restore();
  }
  // ingredient tooltip
  function showTip(id, x, y) {
    if (!id) { ui.tip.hidden = true; ui.tip.dataset.id = ''; return; }
    const g = INGM[id], z = S.screen === 'play' ? zoneOf(cup.T) : 'mild';
    const chips = (v) => { let s = ''; for (let k = 0; k < 3; k++) { if (Math.abs(v[k]) < 0.05) continue; const ax = AX[k], pos = v[k] > 0, n = Math.max(1, Math.round(Math.abs(v[k]) / 0.15)); s += `<span class="chip">${svg(pos ? ax.ip : ax.in, pos ? ax.cp : ax.cn, 14)}${'▲'.repeat(Math.min(4, n))}</span>`; } return s; };
    let html = `<b>${t('ab_i_' + id)}</b><div class="d">${t('ab_d_' + id)}</div>`;
    if (!g.special) html += `<div class="row ${z === 'mild' || (!g.hot && !g.cold) ? 'cur' : ''}">${chips(g.v)}</div>`;
    if (g.hot) html += `<div class="row ${z === 'hot' ? 'cur' : ''}"><small>${t('ab_in_hot')}</small>${chips(g.hot)}</div>`;
    if (g.cold) html += `<div class="row ${z === 'cold' ? 'cur' : ''}"><small>${t('ab_in_cold')}</small>${chips(g.cold)}</div>`;
    ui.tip.innerHTML = html; ui.tip.hidden = false; ui.tip.dataset.id = id;
    const r = ui.tip.getBoundingClientRect(), w = r.width || 220, h = r.height || 80;
    let tx = clamp(x - w / 2, 6, L.W - w - 6), ty = y - h - 12; if (ty < L.top + 4) ty = L.top + 4;
    ui.tip.style.left = tx + 'px'; ui.tip.style.top = ty + 'px';
  }

  // ---------- overlays ----------
  function showOverlay(kind) { ui.overlay.hidden = false; ui.overlay.dataset.kind = kind; renderOverlay(); }
  function hideOverlay() { ui.overlay.hidden = true; ui.overlay.dataset.kind = ''; }
  const esc = (x) => String(x).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  function playerName() { try { return (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { return ''; } }
  document.addEventListener('mal3abready', () => { if (ui.overlay.dataset.kind === 'title') renderOverlay(); });
  function previewCanvas(kind, id) { return `<canvas class="pv" data-pv="${kind}:${id}" width="120" height="120"></canvas>`; }
  function paintPreviews() {
    ui.box.querySelectorAll('canvas.pv').forEach(cv2 => {
      const [kind, id] = cv2.dataset.pv.split(':'), d = Math.min(2, window.devicePixelRatio || 1), w = cv2.clientWidth || 60, h = cv2.clientHeight || 60;
      cv2.width = w * d; cv2.height = h * d; const c = cv2.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
      if (kind === 'ing') A.drawJar(c, INGM[id], w / 2, h * 0.92, w * 0.55, w * 0.7, S.time, { badge: badgeOf(INGM[id]) });
      else if (kind === 'cr') { c.save(); c.translate(w / 2, h * 0.97); A.drawCreature(c, id, h * 0.8, 1.3, { mood: 'happy', hue: CREATURES[id].hues[0] }); c.restore(); }
      else if (kind === 'dc') decorPreview(c, id, w, h);
    });
  }
  function decorPreview(c, id, w, h) {
    const t2 = S.time;
    switch (id) {
      case 'lights': { c.strokeStyle = '#6b4a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, h * 0.3); c.quadraticCurveTo(w / 2, h * 0.75, w - 4, h * 0.3); c.stroke(); for (let j = 1; j < 6; j++) { const k = j / 6, x = lerp(4, w - 4, k), y = h * 0.3 + 2 * k * (1 - k) * h * 0.45 + 4, col = ['#ffd166', '#ff8fab', '#8ecae6', '#b5e48c', '#cdb4ff'][j % 5]; c.fillStyle = col; A.ell(c, x, y, 4, 5.5); c.fill(); } break; }
      case 'plant': { const sv = L.deco.plant; L.deco.plant = [w / 2, -h * 0.05, h * 0.95]; drawDecorOne(c, 'plant'); L.deco.plant = sv; break; }
      case 'candles': { for (let i = 0; i < 2; i++) { const x = w * (0.35 + i * 0.3), y = h * 0.7 - i * 8, s = h * 0.3; c.fillStyle = '#f6ead2'; A.rr(c, x - s * 0.22, y - s * 0.6, s * 0.44, s * 1.2, 3); c.fill(); c.fillStyle = '#ffcf4d'; A.ell(c, x, y - s * 0.85, s * 0.13, s * 0.25); c.fill(); } break; }
      case 'kettle': { c.fillStyle = '#c9773a'; A.ell(c, w / 2, h * 0.62, w * 0.3, h * 0.24); c.fill(); c.fillStyle = '#e8a060'; A.ell(c, w / 2 - w * 0.08, h * 0.55, w * 0.1, h * 0.06); c.fill(); c.strokeStyle = '#8a4a20'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, h * 0.42, w * 0.18, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(w * 0.78, h * 0.6); c.lineTo(w * 0.92, h * 0.42); c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,255,255,.4)'; A.circ(c, w * 0.92 + i * 3, h * (0.32 - i * 0.08), 4 + i); c.fill(); } break; }
      case 'mug': { c.save(); c.translate(w / 2, h * 0.9); const D = { w: w * 0.5, h: h * 0.7 }; cupPath(c, D.w, D.h, 0); c.closePath(); c.fillStyle = 'rgba(255,140,200,.6)'; c.fill(); c.strokeStyle = '#e8b84a'; c.lineWidth = 3; c.stroke(); c.restore(); break; }
      case 'musicbox': musicBoxArt(c, w / 2, h * 0.85, h * 0.38, t2); break;
      case 'painting': paintingArt(c, w * 0.15, h * 0.2, w * 0.7, h * 0.6, t2); break;
      case 'cat': catArt(c, w * 0.58, h * 0.8, h * 0.55, t2); break;
      case 'crystal': crystalArt(c, w / 2, h * 0.92, h * 0.5, t2); break;
      case 'aquarium': aquariumArt(c, w * 0.1, h * 0.85, w * 0.8, h * 0.6, t2); break;
    }
  }
  function drawDecorOne(c, id) { decorOverride = { [id]: 1 }; try { drawDecor(c, 'wall'); } finally { decorOverride = null; } }
  function renderOverlay() {
    const kind = ui.overlay.dataset.kind; if (!kind) return;
    const B = ui.box; let h = '';
    const sndRow = `<div class="row"><button class="btn sec small" data-act="sound">${svg('sound', '#eef0ff', 15)} ${t('ab_sound')}: ${t(save.sound ? 'ab_on' : 'ab_off')}</button><button class="btn sec small" data-act="music">${svg('note', '#eef0ff', 15)} ${t('ab_music')}: ${t(save.music ? 'ab_on' : 'ab_off')}</button></div>`;
    if (kind === 'title') {
      h = `<div class="logo">${svg('cup', '#ffb703', 44)}<h1>${t('ab_title')}</h1></div><p class="sub">${t('ab_sub')}</p>
        <button class="btn big" data-act="continue">${save.maxDay > 1 ? t('ab_continue', { n: save.maxDay }) : t('ab_play')}</button>
        <button class="btn" data-act="online">${svg('heart', '#1a1200', 16)} ${t('ab_o_online')}</button>
        <div class="row"><button class="btn sec" data-act="days">${t('ab_days')}</button><button class="btn sec" data-act="shop">${t('ab_shop')}</button><button class="btn sec" data-act="how">${t('ab_how')}</button></div>
        ${sndRow}${save.served ? `<p class="muted">${t('ab_stats', { a: save.served, b: save.perfects })}</p>` : ''}${playerName() ? `<p class="muted small">${t('ab_hello', { p: esc(playerName()) })}</p>` : ''}`;
    } else if (kind === 'how' || kind === 'how2') {
      const ic = ['cup', 'star', 'heart', 'flame', 'hourglass', 'orb'];
      h = `<h2>${t('ab_how')}</h2><div class="how">${[1, 2, 3, 4, 5, 6].map(i => `<div class="hrow">${svg(ic[i - 1], '#ffb703', 22)}<span>${t('ab_h' + i)}</span></div>`).join('')}</div><p class="muted small">${t('ab_keys')}</p>
        <button class="btn" data-act="${kind === 'how2' ? 'backpause' : 'back'}">${t('ab_back')}</button>`;
    } else if (kind === 'days') {
      const n = Math.max(LAST_DAY, save.maxDay);
      let g = ''; for (let d = 1; d <= n; d++) {
        const lock = d > save.maxDay, st = save.stars[d] || 0;
        g += `<button class="day ${lock ? 'lock' : ''}" ${lock ? 'disabled' : `data-act="day" data-d="${d}"`}><b>${d}</b><span>${lock ? svg('lock', 'rgba(255,255,255,.35)', 14) : [1, 2, 3].map(i => svg('star', i <= st ? '#ffb703' : 'rgba(255,255,255,.2)', 12)).join('')}</span></button>`;
      }
      h = `<h2>${t('ab_days')}</h2><div class="days">${g}</div><button class="btn sec" data-act="back">${t('ab_back')}</button>${save.served || save.maxDay > 1 ? `<button class="btn sec small danger" data-act="reset">${t('ab_reset')}</button>` : ''}`;
    } else if (kind === 'shop' || kind === 'shop2') {
      const items = DECOR.map(dc => {
        const own = has(dc.id), can = save.tips >= dc.price;
        return `<div class="item ${own ? 'own' : ''}">${previewCanvas('dc', dc.id)}<div class="it"><b>${t('ab_dc_' + dc.id)}</b><small>${t('ab_dd_' + dc.id)}</small></div>
          ${own ? `<span class="owned">${t('ab_owned')}</span>` : `<button class="btn small ${can ? '' : 'sec'}" data-act="buy" data-id="${dc.id}" ${can ? '' : 'disabled'}><i class="coin"></i>${dc.price}</button>`}</div>`;
      }).join('');
      h = `<h2>${t('ab_shop')}</h2><p class="wallet"><i class="coin"></i>${t('ab_wallet', { _: '', n: save.tips })}</p><div class="list">${items}</div>
        <button class="btn" data-act="${kind === 'shop2' ? 'backend' : 'back'}">${t('ab_back')}</button>`;
    } else if (kind === 'intro') {
      const c = S.cfg, d = c.d, cards = introCards(d);
      h = `<h2>${t('ab_day', { n: d })}</h2>${d > LAST_DAY && d === save.maxDay ? `<p class="muted">${t('ab_endless')}</p>` : ''}
        <div class="facts"><span>${svg('cup', '#ffb703', 18)} ${t('ab_customers', { n: c.n })}</span><span>${svg('heart', '#ff6b8b', 18)} ${t('ab_goal', { n: c.goal })}</span></div>
        <p class="muted small">${t('ab_strikes_lim', { n: strikeLimit() })}</p>${cards}
        ${save.best[d] ? `<p class="muted small">${t('ab_best', { n: save.best[d] })}</p>` : ''}
        <button class="btn big" data-act="open">${t('ab_open')}</button><button class="btn sec small" data-act="menu">${t('ab_menu')}</button>`;
    } else if (kind === 'pause') {
      h = `<h2>${t('ab_paused')}</h2><button class="btn big" data-act="resume">${t('ab_resume')}</button>
        <div class="row"><button class="btn sec" data-act="restart">${t('ab_restart')}</button><button class="btn sec" data-act="how2">${t('ab_how')}</button></div>${sndRow}
        <button class="btn sec small" data-act="menu">${t('ab_menu')}</button>`;
    } else if (kind === 'end') {
      const r = S.lastResult;
      const stars = [1, 2, 3].map(i => svg('star', i <= r.stars ? '#ffb703' : 'rgba(255,255,255,.18)', 40)).join('');
      h = `<h2>${r.win ? t('ab_win') : t('ab_lose')}</h2>${r.win ? `<div class="stars">${stars}</div>` : `<p class="sub">${r.why === 'strikes' ? t('ab_lose_strikes') : t('ab_lose_hearts', { h: r.hearts, g: r.goal })}</p>`}
        <div class="sum"><div>${svg('heart', '#ff6b8b', 20)}<b>${r.hearts}<small>/${r.maxH}</small></b><span>${t('ab_sum_hearts')}</span></div>
        <div><i class="coin big"></i><b>+${r.tips}</b><span>${t('ab_sum_tips')}</span></div><div>${svg('star', '#ffd25a', 20)}<b>${r.perfects}</b><span>${t('ab_sum_perfect')}</span></div></div>
        ${r.win && r.d === LAST_DAY ? `<p class="muted">${t('ab_endless')}</p>` : ''}
        ${r.win ? `<button class="btn big" data-act="next">${t('ab_next')}</button>` : `<button class="btn big" data-act="retry">${t('ab_retry')}</button>`}
        <div class="row"><button class="btn sec" data-act="shop2">${t('ab_shop')}</button>${r.win ? `<button class="btn sec" data-act="retry">${t('ab_retry')}</button>` : ''}<button class="btn sec" data-act="menu">${t('ab_menu')}</button></div>`;
    }
    else h = onlineOverlay(kind, sndRow);
    B.innerHTML = h; B.scrollTop = 0; if (window.Mal3abPopButtons) window.Mal3abPopButtons();   // re-add 🏠 + 💬 bar (#box has data-m3pop)
    if (kind === 'online') onlineInputs();
    requestAnimationFrame(paintPreviews);
  }
  function introCards(d) {
    let cards = '';
    for (const g of ING.filter(x => x.day === d)) cards += `<div class="card">${previewCanvas('ing', g.id)}<div><em>${t('ab_new_ing')}</em><b>${t('ab_i_' + g.id)}</b><small>${t('ab_d_' + g.id)}</small></div></div>`;
    for (const k of Object.keys(CREATURES).filter(k2 => CREATURES[k2].day === d && d > 1)) cards += `<div class="card">${previewCanvas('cr', k)}<div><em>${t('ab_new_cust')}</em><b>${t('ab_cr_' + k)}</b></div></div>`;
    return cards;
  }
  ui.overlay.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    Snd.init(); Snd.play('click');
    const act = b.dataset.act;
    switch (act) {
      case 'continue': startDay(Math.max(1, save.maxDay)); break;
      case 'days': showOverlay('days'); break;
      case 'shop': showOverlay('shop'); break;
      case 'shop2': showOverlay('shop2'); break;
      case 'how': showOverlay('how'); break;
      case 'how2': showOverlay('how2'); break;
      case 'back': showOverlay('title'); break;
      case 'backpause': showOverlay(NET.on ? 'opause' : 'pause'); break;
      case 'backend': showOverlay('end'); break;
      case 'day': startDay(+b.dataset.d); break;
      case 'open': openCafe(); break;
      case 'resume': resume(); break;
      case 'restart': startDay(S.dayNum); break;
      case 'menu': goTitle(); break;
      case 'next': startDay(S.lastResult.d + 1); break;
      case 'retry': startDay(S.lastResult ? S.lastResult.d : S.dayNum); break;
      case 'sound': save.sound = !save.sound; persist(); Snd.setGains(); renderOverlay(); break;
      case 'music': save.music = !save.music; persist(); Snd.setGains(); renderOverlay(); break;
      case 'buy': buy(b.dataset.id); break;
      default: onlineClick(act, b); break;
      case 'reset': if (confirm(t('ab_reset_q'))) { const snd = save.sound, mus = save.music; save = JSON.parse(JSON.stringify(DEF)); save.sound = snd; save.music = mus; persist(); layout(); goTitle(); } break;
    }
  });
  function buy(id) {
    const dc = DECOR.find(x => x.id === id); if (!dc || has(id) || save.tips < dc.price) return;
    save.tips -= dc.price; save.decor[id] = 1; persist(); Snd.play('buy'); updateHud();
    layout(); renderOverlay();
  }

  // ============================================================ input
  let touchMode = matchMedia('(pointer: coarse)').matches;
  cv.addEventListener('pointerdown', (e) => {
    Snd.init(); if (e.pointerType === 'touch') touchMode = true;
    drag.mouse = e.pointerType === 'mouse';
    if (S.screen !== 'play') return;
    const x = e.clientX, y = e.clientY;
    if (thermoHit(x, y)) { drag.thermo = true; drag.pid = e.pointerId; thermoSet(y); cv.setPointerCapture(e.pointerId); return; }
    const j = jarAt(x, y);
    if (j) { drag.on = true; drag.id = j.g.id; drag.x = drag.sx = x; drag.y = drag.sy = y; drag.t0 = performance.now(); drag.moved = false; drag.pid = e.pointerId; drag.jar = j; cv.setPointerCapture(e.pointerId); if (!drag.mouse) showTip(j.g.id, j.x, j.y - j.h); }
  });
  cv.addEventListener('pointermove', (e) => {
    const x = e.clientX, y = e.clientY;
    if (drag.thermo && e.pointerId === drag.pid) { thermoSet(y); return; }
    if (drag.on && e.pointerId === drag.pid) {
      drag.x = x; drag.y = y; if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 9) { drag.moved = true; Snd.play('tick'); }
      if (drag.moved && ui.tip.dataset.id !== drag.id + ':d') { showTip(drag.id, L.custX + 40, L.counterY - 4); ui.tip.dataset.id = drag.id + ':d'; }
      return;
    }
    if (e.pointerType === 'mouse' && S.screen === 'play') {
      drag.mouse = true; const j = jarAt(x, y), id = j ? j.g.id : null;
      if (id !== drag.hover) { drag.hover = id; if (id) showTip(id, j.x, j.y - j.h - 4); else showTip(null); }
      cv.style.cursor = id || thermoHit(x, y) ? 'pointer' : 'default';
    }
  });
  const endPtr = (e) => {
    if (drag.thermo && e.pointerId === drag.pid) { drag.thermo = false; return; }
    if (!drag.on || e.pointerId !== drag.pid) return;
    const x = e.clientX, y = e.clientY, id = drag.id, j = drag.jar;
    drag.on = false;
    if (e.type !== 'pointercancel') {
      if (drag.moved) { if (overCup(x, y)) addIng(id, x, y + j.h * 0.5); }
      else if (performance.now() - drag.t0 < 600) addIng(id);
    }
    if (drag.moved || !drag.mouse) { showTip(null); drag.hover = null; }
    drag.moved = false; drag.id = null;
  };
  cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
  cv.addEventListener('pointerleave', () => { if (!drag.on && drag.hover) { drag.hover = null; showTip(null); } });
  ui.serve.onclick = () => { Snd.init(); serve(); };
  ui.dump.onclick = () => { Snd.init(); dump(); };
  $('pauseBtn').onclick = () => { Snd.init(); if (S.screen === 'play') pause(); else if (S.screen === 'paused') resume(); };
  $('langBtn').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    Snd.init();
    const k = e.key.toLowerCase();
    if (e.target && e.target.tagName === 'BUTTON' && (k === ' ' || k === 'enter')) return;   // let the focused button handle it
    if (k === 'escape' || k === 'p') { if (S.screen === 'play') pause(); else if (S.screen === 'paused') resume(); e.preventDefault(); return; }
    if (S.screen !== 'play') { if ((k === 'enter' || k === ' ') && !ui.overlay.hidden) { const b = ui.box.querySelector('.btn.big'); if (b) { b.click(); e.preventDefault(); } } return; }
    const idx = KEYS.indexOf(k); if (idx >= 0 && jars[idx]) { addIng(jars[idx].g.id); e.preventDefault(); return; }
    if (k === 'arrowup' || k === '+' || k === '=') { cup.dial = clamp(cup.dial + 10, 0, 100); Snd.play('tick'); e.preventDefault(); }
    else if (k === 'arrowdown' || k === '-') { cup.dial = clamp(cup.dial - 10, 0, 100); Snd.play('tick'); e.preventDefault(); }
    else if (k === ' ' || k === 'enter') { serve(); e.preventDefault(); }
    else if (k === 'backspace' || k === 'delete') { dump(); e.preventDefault(); }
  });
  window.addEventListener('resize', () => { layout(); updateHud(); if (S.screen === 'play' && S.cust && S.cust.phase === 'order') showBubble(); if (NET.on) renderQueue(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.screen === 'play') pause(); });
  document.addEventListener('langchange', () => {
    buildBg(); updateHud(); renderOverlay(); if (S.coach) setCoach(S.coach.key, S.coach.target, S.coach.tip);
    if (S.cust && S.cust.phase === 'order') showBubble(); else if (S.cust && S.cust.phase === 'react' && S.cust.result) showReaction(S.cust.result.timeout ? t('ab_rangry') : t('ab_r' + S.cust.result.hearts), S.cust.result.hearts, S.cust.result.tips);
    ui.serve.innerHTML = `${svg('cup', '#1a1200', 20)}<span>${t('ab_serve')}</span>`; ui.dump.textContent = t('ab_dump');
    if (ui.tip.dataset.id) showTip(null);
    if (NET.on) { renderQueue(true); if (ui.bubble.dataset.idle === '1') { ui.bubble.dataset.idle = ''; netIdle(); } }
  });

  // ============================================================ main loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    step(dt); render();
    requestAnimationFrame(frame);
  }
  function step(dt) {
    S.time += dt;
    if (S.screen === 'paused' || S.screen === 'intro') { updateParts(dt * (S.screen === 'intro' ? 1 : 0)); return; }
    updateCust(dt); updateCup(dt); updatePours(dt); updateParts(dt);
    for (const j of jars) if (j.shake > 0) j.shake -= dt;
    shake = Math.max(0, shake - dt * 30);
    updatePatience();
    if (S.screen === 'play') {
      const sd = !(canBrew() && cup.doses.length); if (ui.serve.disabled !== sd) updateActions();
      if (S.tut && S.tut.active && S.tut.step === 2 && S.cust && S.cust.order && accuracy(effMood(cup.mix, cup.T), S.cust.order.target) >= 0.75) { S.tut.step = 3; setCoach('ab_c4', 'serve'); }
    }
  }
  function render() {
    const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.save();
    if (shake > 0.2) c.translate(rand(-shake, shake) * 0.6, rand(-shake, shake) * 0.6);
    c.drawImage(bgBack.c, 0, 0, L.W, L.H);
    windowDyn(c);
    drawDecor(c, 'wall');
    drawCust(c);
    c.drawImage(bgFront.c, 0, 0, L.W, L.H);
    drawDecor(c, 'counter');
    drawCup(c); drawThermo(c); drawJars(c); drawBoardDyn(c); drawCoachRing(c);
    drawPours(c); drawParts(c);
    if (drag.on && drag.moved) {
      const g = INGM[drag.id], over = overCup(drag.x, drag.y), j = drag.jar;
      if (over) { const D = cupDims(); c.save(); c.strokeStyle = 'rgba(255,220,120,.8)'; c.lineWidth = 3; c.setLineDash([6, 5]); c.beginPath(); c.ellipse(L.cupX, L.cupY - D.h, D.w * 0.6, D.w * 0.12, 0, 0, Math.PI * 2); c.stroke(); c.restore(); }
      A.drawJar(c, g, drag.x, drag.y + j.h * 0.5, j.w * 1.1, j.h * 1.1, S.time, { rot: over ? 0.5 : Math.sin(S.time * 8) * 0.06, glow: 'rgba(255,220,140,.9)' });
    }
    c.restore();
  }
  function windowDyn(c) {
    const w = L.win;
    c.save(); c.beginPath(); c.rect(w.x, w.y - w.w, w.w, w.h + w.w); c.clip();
    const rnd = srand(99);
    for (let i = 0; i < 12; i++) { const x = w.x + rnd() * w.w, y = w.y + rnd() * w.h * 0.6, tw = Math.max(0, Math.sin(S.time * (1 + rnd() * 2) + i * 3)); c.globalAlpha = tw * 0.9; A.icon(c, 'star', x, y, 6 + rnd() * 4, '#fff8dc'); }
    const per = 9, k = (S.time % per) / 1.2;
    if (k < 1) { const sx = w.x + w.w * (0.9 - k * 0.7), sy = w.y + w.h * (0.1 + k * 0.25); c.globalAlpha = Math.sin(k * Math.PI); c.strokeStyle = '#fffbe6'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 26, sy - 9); c.stroke(); }
    c.restore();
  }

  // ============================================================ boot
  function boot() {
    layout();
    ui.serve.innerHTML = `${svg('cup', '#1a1200', 20)}<span>${t('ab_serve')}</span>`; ui.dump.textContent = t('ab_dump');
    updateHud();
    goTitle();
    requestAnimationFrame(frame);
  }
  document.querySelectorAll('[data-mal3ab-home]').forEach(h => { if (!h.onclick) h.onclick = () => location.href = '../../play.html'; });

  // ============================================================ online co-op café (Supabase Realtime broadcast, up to 4 baristas)
  // The host runs the customer queue, the day clock, the strikes and the shared coins, and broadcasts the whole day ~8×/s.
  // Every barista brews in their own cup on their own screen and sends "claim" / "serve" / "buy" actions; any barista can serve any free customer.
  addStrings({
    ab_o_online: 'أونلاين مع صحابك', ab_o_title: 'الكافيه الأونلاين', ab_o_sub: 'شغّلوا كافيه واحد مع بعض — لحد 4 باريستا، نفس الزباين ومحفظة واحدة للكل.',
    ab_o_name: 'اسمك', ab_o_create: 'اعمل أوضة', ab_o_code: 'الكود', ab_o_join: 'ادخل', ab_o_codehint: 'اكتب كود الأوضة (4 حروف).',
    ab_o_note: 'الأيام الأونلاين ليها بقشيش وديكور مشتركين لوحدهم — تقدّمك لوحدك في أمان.', ab_o_roomcode: 'كود الأوضة', ab_o_copy: 'انسخ لينك الدعوة', ab_o_copied: 'اتنسخ!',
    ab_o_you: 'إنت', ab_o_host: 'الهوست', ab_o_barista: 'باريستا', ab_o_waitp: 'مستنيين باريستا…', ab_o_wallet: 'محفظة المحل: {n}', ab_o_connecting: 'بيوصل…',
    ab_o_start: 'ابدأ اليوم', ab_o_need: 'مستنيين باريستا كمان على الأقل.', ab_o_waithost: 'مستنيين الهوست…', ab_o_leave: 'اخرج من الأوضة',
    ab_o_rules: 'كلكم بتخدموا نفس الزباين. الكروت بتوضّح مين بيخدم مين — دوس على زبون فاضي عشان تخدمه.', ab_o_team: '{n} باريستا في الوردية',
    ab_o_waitopen: 'مستنيين الهوست يفتح المحل…', ab_o_crew: 'الباريستا', ab_o_served: 'خدم', ab_o_gone: 'مشي', ab_o_lobby: 'ارجع للأوضة',
    ab_o_shopnote: 'محل مشترك — أي حد يقدر يشتري ببقشيش المحل، والديكور بيبان عند الكل.', ab_o_stillopen: 'المحل لسه فاتح وإنت مش موجود — صحابك بيكمّلوا شغل.', ab_o_held: 'المحل واقف لحد ما ترجع.',
    ab_o_alone: 'الباقيين كلهم مشيوا', ab_o_alone2: 'تقدر تكمّل اليوم لوحدك — وصحابك يقدروا يرجعوا بكود الأوضة.', ab_o_solo: 'كمّل لوحدك',
    ab_o_full: 'الأوضة دي مليانة (4 باريستا بالكتير).', ab_o_nonet: 'مفيش اتصال بسيرفر الأونلاين.', ab_o_joined: '{p} دخل الكافيه!', ab_o_left: '{p} مشي من الكافيه.',
    ab_o_lefthost: '{p} مشي — {h} بقى الهوست دلوقتي.', ab_o_youhost: '{p} مشي — إنت بقيت الهوست دلوقتي.', ab_o_taken: '{p} بيخدم الزبون ده خلاص.', ab_o_srv: '{p} قدّم لـ{c} {h}', ab_o_out: '{c} مشي زعلان!',
    ab_o_bought: '{p} اشترى {x}!', ab_o_free: 'فاضي', ab_o_noq: 'لسه مفيش زباين…', ab_o_idle: 'كل الزباين معاهم باريستا — اللي جاي في السكة!', ab_o_toolate: 'أوبس، حد تاني سبقك!',
  }, {
    ab_o_online: 'Online Co-op', ab_o_title: 'Online Café', ab_o_sub: 'Run one café together — up to 4 baristas, the same customers and one shared wallet.',
    ab_o_name: 'Your Name', ab_o_create: 'Create Room', ab_o_code: 'Code', ab_o_join: 'Join', ab_o_codehint: 'Type the 4-letter room code.',
    ab_o_note: 'Online days have their own shared coins and decor — your solo progress stays safe.', ab_o_roomcode: 'Room Code', ab_o_copy: 'Copy Invite Link', ab_o_copied: 'Copied!',
    ab_o_you: 'You', ab_o_host: 'Host', ab_o_barista: 'Barista', ab_o_waitp: 'Waiting for a barista…', ab_o_wallet: 'Café Wallet: {n}', ab_o_connecting: 'Connecting…',
    ab_o_start: 'Start the Day', ab_o_need: 'Waiting for at least one more barista to join.', ab_o_waithost: 'Waiting for the host…', ab_o_leave: 'Leave Room',
    ab_o_rules: 'Everyone serves the same customers. The cards show who is serving whom — tap a free customer to serve them.', ab_o_team: '{n} baristas on shift',
    ab_o_waitopen: 'Waiting for the host to open the café…', ab_o_crew: 'Barista', ab_o_served: 'Served', ab_o_gone: 'left', ab_o_lobby: 'Back to Lobby',
    ab_o_shopnote: 'Shared shop — anyone can buy with the café coins, and the decor shows up for everyone.', ab_o_stillopen: 'The café stays open while you are away — your friends keep serving.', ab_o_held: 'The café waits for you.',
    ab_o_alone: 'Everyone Else Left', ab_o_alone2: 'You can finish the day alone — friends can still rejoin with the room code.', ab_o_solo: 'Continue Solo',
    ab_o_full: 'That room is full (4 baristas max).', ab_o_nonet: 'No connection to the online server.', ab_o_joined: '{p} joined the café!', ab_o_left: '{p} left the café.',
    ab_o_lefthost: '{p} left — {h} is the host now.', ab_o_youhost: '{p} left — you are the host now.', ab_o_taken: '{p} is already serving that customer.', ab_o_srv: '{p} served {c} {h}', ab_o_out: '{c} left unhappy!',
    ab_o_bought: '{p} bought {x}!', ab_o_free: 'Free', ab_o_noq: 'No customers yet…', ab_o_idle: 'Every customer has a barista — the next one is on the way!', ab_o_toolate: 'Oh, someone else got to me first!',
  });
  const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'st', 'act'];
  const PCOL = ['#ffb703', '#5ec8ff', '#ff6fae', '#7ee36a'], MAXP = 4;
  const newCode = () => { const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s2 = ''; for (let i = 0; i < 4; i++) s2 += AL[Math.floor(Math.random() * AL.length)]; return s2; };
  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (code) => pageLink() + '?room=' + code;
  const netName = () => (NET.name || playerName() || t('ab_o_barista')).slice(0, 16);
  const isHost = () => NET.on && !!NET.me && NET.hostId === NET.me;
  const pCount = () => 1 + Object.keys(NET.peers).length;
  const beats = (a, b) => a.jt < b.jt || (a.jt === b.jt && a.id < b.id);   // who is "older" in the room (decides the next host)
  function alivePlayers() { const a = [{ id: NET.me, n: netName(), jt: NET.jt }]; for (const id in NET.peers) a.push(NET.peers[id]); return a.sort((x, y) => beats(x, y) ? -1 : 1); }
  const rosterOf = (id) => NET.roster.find(r => r.id === id);
  function nameOf(id) { if (id === NET.me) return netName(); const r = rosterOf(id) || NET.peers[id] || (NET.D && NET.D.st && NET.D.st[id]); return (r && r.n) || '…'; }
  function colOf(id) { const r = rosterOf(id), st = NET.D && NET.D.st && NET.D.st[id]; const c = r ? r.c : st ? st.c : null; return c == null ? '#9aa0c0' : PCOL[c % 4]; }
  function nsend(ev, p) { if (!NET.ch || !NET.ready) return; try { NET.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: NET.me }, p || {}) }); } catch (e) {} }
  function netAct(p) { if (!NET.on) return; if (isHost()) hostAct(NET.me, p); else nsend('act', p); }
  function saveRoom() { try { sessionStorage.setItem('ab-online-room-' + NET.code, JSON.stringify(NET.room)); } catch (e) {} }

  // ---------- host: the shared day ----------
  function freshD() { return { ph: 'lobby', sq: 0, d: NET.room.d, n: 0, g: 0, sl: 3, sp: 0, dn: 0, h: 0, tp: 0, pf: 0, sk: 0, uc: 0, ek: 0, ls: [], cs: [], st: {}, ev: [], r: null, nx: 0, T: 0, endAt: 0 }; }
  function hostRoster() {   // everyone keeps their colour for as long as they stay
    const used = new Set(), R = [];
    for (const p of alivePlayers()) { const o = rosterOf(p.id); R.push({ id: p.id, n: p.n, c: o && !used.has(o.c) ? o.c : -1 }); if (o && !used.has(o.c)) used.add(o.c); }
    for (const r of R) if (r.c < 0) { let c = 0; while (used.has(c)) c++; used.add(c); r.c = c; }
    NET.roster = R;
    const D = NET.D; if (D && D.ph !== 'lobby') for (const r of R) { const s2 = D.st[r.id]; if (s2) { s2.n = r.n; s2.c = r.c; } else D.st[r.id] = { n: r.n, c: r.c, s: 0, t: 0, h: 0, p: 0, cb: 0 }; }
  }
  function pushEv(e) { const D = NET.D; e.k = ++D.ek; D.ev.push(e); if (D.ev.length > 16) D.ev.shift(); }
  function sendSnap() {
    if (!isHost() || !NET.D) return;
    hostRoster();
    const D = NET.D;
    nsend('st', { host: NET.me, R: NET.roster, room: NET.room, D: { ph: D.ph, sq: D.sq, d: D.d, n: D.n, g: D.g, sl: D.sl, sp: D.sp, dn: D.dn, h: D.h, tp: D.tp, pf: D.pf, sk: D.sk, uc: D.uc, ek: D.ek, ls: D.ls,
      cs: D.cs.map(c => Object.assign({}, c, { p: Math.round(c.p * 10) / 10 })), st: D.st, ev: D.ev, r: D.r, end: D.endAt ? 1 : 0 } });
    NET.lastSnap = performance.now(); saveRoom();
  }
  function hostStartDay(d) {
    if (!isHost()) return;
    d = clamp(d | 0, 1, Math.max(1, NET.room.md));
    const P = pCount(), cfg = dayCfg(d), n = Math.min(18, Math.round(cfg.n * (1 + 0.5 * (P - 1)))), D = NET.D;   // more baristas → more customers
    Object.assign(D, { ph: 'intro', sq: D.sq + 1, d, n, g: Math.ceil(n * cfg.goal / cfg.n), sl: strikeLimit() + (P - 1), sp: 0, dn: 0, h: 0, tp: 0, pf: 0, sk: 0,
      ls: makeCustList(Object.assign({}, cfg, { n })), cs: [], st: {}, r: null, nx: 0.6, T: 0, endAt: 0 });
    NET.room.d = d; S.usedP = new Set();
    sendSnap(); netApply();
  }
  function hostOpen() { const D = NET.D; if (!isHost() || D.ph !== 'intro') return; D.ph = 'play'; D.nx = 0.5; D.T = 0; sendSnap(); netApply(); }
  function hostSpawn() {
    const D = NET.D, cfg = dayCfg(D.d), types = Object.keys(CREATURES).filter(k => CREATURES[k].day <= D.d);
    const type = CREATURES[D.ls[D.sp]] ? D.ls[D.sp] : pick(types), cr = CREATURES[type], o = genOrder(cfg);
    const my = D.sp > 0 && Math.random() < cfg.mystery, pm = Math.round((cfg.patience * cr.pat * 1.2 + patBonus()) * 10) / 10;   // a little extra patience: the queue is shared
    D.cs.push({ u: ++D.uc, ty: type, hu: pick(cr.hues), a: o.a, b: o.b, tl: o.tpl, tg: o.target.map(v => Math.round(v * 1000) / 1000), my: my ? 1 : 0, rv: my ? 0 : 1, p: pm, pm, by: '' });
    D.sp++;
  }
  function hostTick(dt) {
    const D = NET.D; if (!D || D.ph !== 'play' || NET.hold) return;
    D.T += dt;
    const dm = drainMul();
    for (let i = D.cs.length - 1; i >= 0; i--) {
      const c = D.cs[i]; c.p -= dt * dm;
      if (c.p <= 0) { D.cs.splice(i, 1); D.sk++; D.dn++; const s2 = D.st[c.by]; if (s2) s2.cb = 0; pushEv({ t: 'out', u: c.u, by: c.by, ty: c.ty }); }
    }
    if (!D.endAt) {
      if (D.sk >= D.sl) D.endAt = D.T + 1.8;
      else if (D.sp >= D.n && !D.cs.length) D.endAt = D.T + 3.2;   // let the last reaction play
      else {
        const P = pCount(), maxWait = P <= 1 ? 1 : Math.min(MAXP, P + 1);
        if (D.sp < D.n && D.cs.length < maxWait) { D.nx -= dt; if (D.nx <= 0) { hostSpawn(); D.nx = 1.6; } } else D.nx = Math.max(D.nx, 0.9);
      }
    }
    if (D.endAt && D.T >= D.endAt) hostEndDay();
  }
  function hostServe(pid, u, m) {
    const D = NET.D; if (D.ph !== 'play') return;
    const i = D.cs.findIndex(c => c.u === u), c = D.cs[i];
    if (!c || (c.by && c.by !== pid && rosterOf(c.by)) || !Array.isArray(m) || m.length !== 3 || !m.every(Number.isFinite)) { pushEv({ t: 'rej', to: pid, u }); return; }
    m = m.map(v => clamp(v, -1, 1));
    const acc = clamp(1 - dist3(m, c.tg) / dayCfg(D.d).tol, 0, 1), pf = clamp(c.p / c.pm, 0, 1);
    const hearts = acc >= 0.8 ? 3 : acc >= 0.55 ? 2 : acc >= 0.3 ? 1 : 0;
    const s2 = D.st[pid] || (D.st[pid] = { n: nameOf(pid), c: (rosterOf(pid) || { c: 0 }).c, s: 0, t: 0, h: 0, p: 0, cb: 0 });
    const combo = hearts === 3 ? (s2.cb || 0) + 1 : 0;   // same scoring as solo; combos are per barista
    const tips = hearts ? Math.round(CREATURES[c.ty].tip * (0.35 + 0.65 * acc) * (0.55 + 0.45 * pf) * (1 + tipBonus())) + (hearts === 3 ? 2 + Math.min(combo - 1, 5) : 0) : 0;
    D.cs.splice(i, 1); D.dn++; D.h += hearts; D.tp += tips; NET.room.co += tips;
    s2.s++; s2.t += tips; s2.h += hearts; s2.cb = combo; if (hearts === 3) { s2.p++; D.pf++; }
    if (!hearts) D.sk++;
    pushEv({ t: 'srv', u, by: pid, ty: c.ty, h: hearts, tp: tips, ac: Math.round(acc * 100), cb: combo });
  }
  function hostAct(pid, p) {
    const D = NET.D; if (!D || !p) return;
    const c = D.cs.find(x => x.u === p.u);
    switch (p.a) {
      case 'claim': if (D.ph !== 'play' || !c || (c.by && c.by !== pid && rosterOf(c.by))) break; for (const o of D.cs) if (o.by === pid) o.by = ''; c.by = pid; break;
      case 'drop': if (c && c.by === pid) c.by = ''; break;
      case 'srv': hostServe(pid, p.u, p.m); break;
      case 'time': if (c && D.ph === 'play') c.p = Math.min(c.pm, c.p + 8); break;
      case 'peek': { if (!c || c.rv) break; const cost = peekCost(); if (NET.room.co < cost) { pushEv({ t: 'poor', to: pid }); break; } NET.room.co -= cost; c.rv = 1; pushEv({ t: 'peek', by: pid, u: c.u }); break; }
      case 'buy': {
        const dc = DECOR.find(x => x.id === p.x); if (!dc || D.ph === 'play' || NET.room.dc[dc.id]) break;
        if (NET.room.co < dc.price) { pushEv({ t: 'poor', to: pid }); break; }
        NET.room.co -= dc.price; NET.room.dc[dc.id] = 1; pushEv({ t: 'buy', by: pid, x: dc.id }); break;
      }
      default: return;
    }
    sendSnap(); netApply();
  }
  function hostEndDay() {
    const D = NET.D, maxH = D.n * 3, win = D.sk < D.sl && D.h >= D.g;
    const stars = win ? (D.h >= maxH * 0.9 ? 3 : D.h >= (D.g + maxH) / 2 ? 2 : 1) : 0;
    if (win) NET.room.md = Math.max(NET.room.md, D.d + 1);
    D.cs = []; D.ph = 'end'; D.endAt = 0;
    D.r = { win, why: D.sk >= D.sl ? 'strikes' : 'hearts', d: D.d, hearts: D.h, goal: D.g, maxH, tips: D.tp, perfects: D.pf, stars };
    sendSnap(); netApply();
  }
  function hostToLobby() { const D = NET.D; if (!isHost()) return; D.ph = 'lobby'; D.cs = []; D.endAt = 0; sendSnap(); netApply(); }
  function becomeHost() {   // the old host left: carry on from the last shared snapshot
    NET.hostId = NET.me;
    if (!NET.D) NET.D = freshD();
    const D = NET.D; D.nx = 1; D.T = 0; D.endAt = D.end ? 1.5 : 0; D.st = D.st || {}; D.ev = D.ev || []; D.cs = D.cs || [];
    for (const c of D.cs) if (c.by && c.by !== NET.me && !NET.peers[c.by]) c.by = '';
    sendSnap();
  }

  // ---------- connection ----------
  function joinRoom(code, create) {
    leaveRoom(true);
    if (!window.sb) { toast(t('ab_o_nonet')); return false; }
    code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (code.length < 4) return false;
    let id = '', jt = 0; try { id = sessionStorage.getItem('ab-online-id-' + code) || ''; jt = +sessionStorage.getItem('ab-online-jt-' + code) || 0; } catch (e) {}
    if (!id || !jt) { id = Math.random().toString(36).slice(2, 10); jt = Date.now(); try { sessionStorage.setItem('ab-online-id-' + code, id); sessionStorage.setItem('ab-online-jt-' + code, String(jt)); } catch (e) {} }
    let room = null; try { room = JSON.parse(sessionStorage.getItem('ab-online-room-' + code) || 'null'); } catch (e) {}
    Object.assign(NET, { on: true, code, me: id, jt, ready: false, peers: {}, hostId: create ? id : '', roster: [], seenEv: -1, focus: '', joinedAt: Date.now(), msg: '', viewSq: -1, dsig: null, osig: '', qsig: '', aloneShown: false });
    NET.room = Object.assign({ md: Math.max(1, save.maxDay), co: 0, dc: {}, d: 1 }, room || {});
    NET.D = create ? freshD() : null;
    const ch = sb.channel('alchemy-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => {
      if (st === 'SUBSCRIBED' && NET.ch === ch) { NET.ready = true; NET.joinedAt = Date.now(); hello(true); if (isHost()) sendSnap(); refreshOverlay('lobby'); }
    });
    NET.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    clearInterval(NET.hbT); NET.hbT = setInterval(netBeat, 2000);
    clearInterval(NET.simI); NET.simT = 0; NET.simI = setInterval(netSim, 100);   // a timer, not rAF: the host keeps the café running in a background tab
    layout(); enterLobbyView();
    return true;
  }
  function leaveRoom(quiet) {
    const was = NET.on;
    if (NET.ch) { nsend('bye', {}); const ch = NET.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(NET.hbT); clearInterval(NET.simI);
    Object.assign(NET, { on: false, ch: null, ready: false, code: '', peers: {}, hostId: '', roster: [], D: null, focus: '' });
    showQueue(false);
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    if (was) { S.cust = null; layout(); }
  }
  function hello(req) { nsend('hello', { n: netName(), jt: NET.jt, host: NET.hostId, req: !!req }); }
  function netBeat() {
    if (!NET.ch) return;
    nsend('hb', { n: netName(), jt: NET.jt, host: NET.hostId });
    const now = Date.now();
    for (const id of Object.keys(NET.peers)) if (now - NET.peers[id].t > 9000) peerGone(id);
    if (NET.ready && (!NET.hostId || (NET.hostId !== NET.me && !NET.peers[NET.hostId])) && now - NET.joinedAt > 2500) {   // nobody runs the café: the oldest player takes over
      const nh = alivePlayers()[0]; NET.hostId = nh.id; if (nh.id === NET.me) { becomeHost(); netApply(); }
    }
    if (isHost() && (!NET.D || NET.D.ph !== 'play')) sendSnap();
  }
  function netSim() {
    if (!NET.on) return;
    const now = performance.now(), dt = NET.simT ? Math.min(1.5, (now - NET.simT) / 1000) : 0; NET.simT = now;
    NET.hold = pCount() === 1 && S.screen === 'paused';   // alone and paused: the café waits
    if (!isHost()) return;
    hostTick(dt);
    if (NET.D && NET.D.ph === 'play' && now - NET.lastSnap > 120) { sendSnap(); netApply(); }
  }
  function onNet(ev, p) {
    if (!p || !p.id || p.id === NET.me || !NET.on) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === NET.me) { leaveRoom(); goTitle(); NET.msg = t('ab_o_full'); showOverlay('online'); } return; }
    if (ev === 'bye') { if (NET.peers[p.id]) peerGone(p.id); return; }
    let P = NET.peers[p.id];
    if (!P) {
      if (pCount() >= MAXP) { if (isHost() && ev !== 'act') nsend('full', { to: p.id }); return; }   // a 5th barista gets "room full"
      P = NET.peers[p.id] = { id: p.id, n: p.n || '…', jt: p.jt || now, t: now };
      if (now - NET.joinedAt > 2500) { toast(t('ab_o_joined', { p: P.n })); Snd.play('bell'); }   // (the people already here answer my hello right after I arrive)
      if (isHost()) sendSnap();
    }
    P.t = now; if (p.n) P.n = String(p.n).slice(0, 16); if (p.jt) P.jt = p.jt;
    if (ev === 'hello' || ev === 'hb') {
      if (ev === 'hello' && p.req) { hello(false); if (isHost()) sendSnap(); }
      if (p.host === p.id && NET.hostId !== p.id) {   // they say they run the café
        if (isHost()) { if (beats(P, { id: NET.me, jt: NET.jt })) NET.hostId = p.id; else sendSnap(); }
        else NET.hostId = p.id;
      } else if (!NET.hostId && p.host && p.host !== NET.me) NET.hostId = p.host;
      refreshOverlay('lobby');
      return;
    }
    if (ev === 'st') {
      if (isHost()) { if (!beats(P, { id: NET.me, jt: NET.jt })) { sendSnap(); return; } }   // two hosts: the older one wins
      NET.hostId = p.id;
      if (Array.isArray(p.R)) NET.roster = p.R;
      if (p.room) NET.room = p.room;
      if (p.D) { NET.D = p.D; saveRoom(); netApply(); }
      return;
    }
    if (ev === 'act' && isHost()) hostAct(p.id, p);
  }
  function peerGone(id) {
    const P = NET.peers[id]; if (!P) return; delete NET.peers[id];
    if (id === NET.hostId) {
      const nh = alivePlayers()[0]; NET.hostId = nh.id;
      toast(nh.id === NET.me ? t('ab_o_youhost', { p: P.n }) : t('ab_o_lefthost', { p: P.n, h: nh.n }));
      if (nh.id === NET.me) becomeHost();
    } else toast(t('ab_o_left', { p: P.n }));
    if (isHost() && NET.D) { for (const c of NET.D.cs) if (c.by === id) c.by = ''; sendSnap(); }
    if ((S.screen === 'play' || S.screen === 'paused') && pCount() === 1 && !NET.aloneShown && NET.D && NET.D.ph === 'play') {   // the day can go on: offer to finish it solo
      NET.aloneShown = true; S.screen = 'paused'; showOverlay('oalone');
    }
    netApply(); refreshOverlay('lobby'); refreshOverlay('oend');
  }

  // ---------- every screen follows the shared day ----------
  function netCfg() { const D = NET.D, c = dayCfg(D.d); c.n = D.n; c.goal = D.g; return c; }
  function netApply() {
    const D = NET.D; if (!NET.on || !D) return;
    const dsig = Object.keys(NET.room.dc || {}).sort().join(',');
    if (dsig !== NET.dsig) { NET.dsig = dsig; layout(); }   // new shared decor
    if (NET.seenEv < 0) NET.seenEv = D.ek;   // just arrived: don't replay old news
    else for (const e of D.ev || []) if (e.k > NET.seenEv) { NET.seenEv = e.k; try { onEvent(e); } catch (er) { console.warn(er); } }
    if (D.ph === 'lobby') { if (S.screen !== 'lobby') enterLobbyView(); else { refreshOverlay('lobby'); refreshOverlay('oshop'); } }
    else if (D.ph === 'intro') { if (S.screen !== 'intro' || NET.viewSq !== D.sq) enterIntroView(); else refreshOverlay('ointro'); }
    else if (D.ph === 'play') { if ((S.screen !== 'play' && S.screen !== 'paused') || NET.viewSq !== D.sq) enterPlayView(); syncPlay(); }
    else if (D.ph === 'end') { if (S.screen !== 'end' || NET.viewSq !== D.sq) enterEndView(); else { refreshOverlay('oend'); refreshOverlay('oshop'); } }
    updateHud();
  }
  function enterLobbyView() {
    S.screen = 'lobby'; S.cust = null; S.cfg = null; S.tut = null; NET.focus = ''; hideBubble(); setCoach(null); showQueue(false); $('hud').classList.remove('ingame');
    S.dayNum = Math.max(1, save.maxDay); layoutJars(); buildBg(); spawnDemo(); demoCup(); updateActions(); updateHud(); showOverlay('lobby');
  }
  function enterIntroView() {
    const D = NET.D; NET.viewSq = D.sq;
    S.dayNum = D.d; S.cfg = netCfg(); S.cust = null; S.tut = null; S.tipKey = null; NET.focus = '';
    parts.length = 0; texts.length = 0; pours.length = 0; setCoach(null); hideBubble(); showQueue(false); $('hud').classList.remove('ingame');
    layout(); resetCup(); S.screen = 'intro'; updateActions(); showOverlay('ointro');
  }
  function enterPlayView() {
    const D = NET.D; NET.viewSq = D.sq;
    if (S.dayNum !== D.d || !S.cfg) { S.dayNum = D.d; layout(); }
    S.cfg = netCfg(); S.tut = null; S.tipKey = null; setCoach(null);
    hideOverlay(); S.screen = 'play'; S.cust = null; NET.focus = ''; resetCup(); cup.pop = 0.2;
    $('hud').classList.add('ingame'); showQueue(true); updateActions();
    NET.aloneShown = pCount() === 1;
  }
  function enterEndView() {
    const D = NET.D, r = D.r; NET.viewSq = D.sq;
    S.screen = 'end'; NET.focus = ''; hideBubble(); setCoach(null); showQueue(false); updateActions();
    if (S.cust && (S.cust.phase === 'enter' || S.cust.phase === 'order')) { S.cust.phase = 'leave'; S.cust.pt = 0; }
    if (r) {
      Snd.play(r.win ? 'win' : 'lose');
      if (r.win) for (let i = 0; i < 4; i++) setTimeout(() => burst(rand(L.W * 0.2, L.W * 0.8), rand(L.H * 0.2, L.H * 0.5), 24, { type: 'spark2', cols: ['#ffd25a', '#ff9ab8', '#9fe6ff', '#b5e48c'], sp0: 60, sp1: 260 }), i * 220);
    }
    setTimeout(() => { if (NET.on && S.screen === 'end' && ui.overlay.dataset.kind !== 'oshop') showOverlay('oend'); }, 450);
  }
  function syncPlay() {
    const D = NET.D, cu = S.cust, now = performance.now();
    S.cfg.n = D.n; S.cfg.goal = D.g;
    if (cu && cu.uid && (cu.phase === 'enter' || cu.phase === 'order')) {
      const c = D.cs.find(x => x.u === cu.uid);
      if (!c) { if (!cu.lost) cu.lost = now; else if (now - cu.lost > 800) { cu.phase = 'leave'; cu.pt = 0; hideBubble(); NET.focus = ''; } }
      else if (c.by && c.by !== NET.me) { toast(t('ab_o_taken', { p: nameOf(c.by) })); S.cust = null; NET.focus = ''; hideBubble(); updateActions(); }
      else {
        cu.lost = 0; cu.patience = c.p; cu.patienceMax = c.pm;
        if (c.rv && !cu.revealed) { cu.revealed = true; if (cu.phase === 'order') showBubble(); }
        if (!c.by && now - NET.claimT > 1500) { NET.claimT = now; netAct({ a: 'claim', u: c.u }); }
      }
    }
    if (!S.cust) netIdle();
    renderQueue();
  }
  function netIdle() {   // no customer in front of me: take the oldest free one, or say the next is on the way
    if (!NET.on || !NET.D || NET.D.ph !== 'play' || S.screen !== 'play' || S.cust) return;
    const c = NET.D.cs.filter(x => !x.by || !rosterOf(x.by)).sort((a, b) => a.u - b.u)[0];
    if (c) { focusOn(c.u, true); return; }
    if (ui.bubble.dataset.idle !== '1') {
      ui.bubble.innerHTML = `<div class="poem">${t('ab_o_idle')}</div>`; ui.bubble.dataset.idle = '1';
      ui.bubble.hidden = false; ui.bubble.classList.remove('react'); ui.bubble.classList.add('show', 'dim');
    }
  }
  function focusOn(u, auto) {
    const D = NET.D, c = D && D.cs.find(x => x.u === u); if (!c) return;
    if (c.by && c.by !== NET.me && rosterOf(c.by)) { if (!auto) toast(t('ab_o_taken', { p: nameOf(c.by) })); return; }
    const cu = S.cust;
    if (cu && cu.uid === u) return;
    if (cu && cu.phase !== 'enter' && cu.phase !== 'order') { if (!auto) toast(t('ab_busy')); return; }
    if (cup.state !== 'idle') { resetCup(); cup.pop = 0.2; cup.disp = [0, 0, 0]; }
    S.cust = { uid: c.u, type: c.ty, hue: c.hu, phase: 'enter', pt: cu ? 0.45 : 0, at: rand(0, 10), x: -L.custS, patience: c.p, patienceMax: c.pm,
      order: { a: c.a, b: c.b, tpl: c.tl, target: c.tg, mystery: !!c.my }, revealed: !!c.rv, mood: 'idle', blink: 0, blinkT: rand(1, 3), look: 0,
      head: [L.custX, L.counterY - L.custS * 0.6], topY: L.counterY - L.custS };
    NET.focus = u; NET.claimT = performance.now();
    hideBubble(); Snd.play('bell'); updateActions(); renderQueue(true);
    netAct({ a: 'claim', u });
  }
  function onEvent(e) {
    const cu = S.cust, mineView = !!(cu && cu.uid && cu.uid === e.u);
    switch (e.t) {
      case 'srv':
        if (mineView && cu.phase === 'drink') cu.netRes = e;   // my drink: shown when the cup is empty
        else {
          if (mineView) { S.cust = null; NET.focus = ''; hideBubble(); updateActions(); }
          if (e.by !== NET.me) { toast(t('ab_o_srv', { p: nameOf(e.by), c: t('ab_cr_' + e.ty), h: (e.h ? '♥'.repeat(e.h) : '✕') + (e.tp ? ' +' + e.tp : '') })); Snd.play(e.h >= 2 ? 'coin' : 'meh'); if (e.tp) pulseHud('sTips'); }
        }
        break;
      case 'out':
        if (mineView && (cu.phase === 'order' || cu.phase === 'enter')) { timeoutFx(); NET.focus = ''; }
        else { toast(t('ab_o_out', { c: t('ab_cr_' + e.ty) })); Snd.play('warn'); }
        break;
      case 'rej': if (e.to === NET.me && mineView) cu.netRes = { rej: 1 }; break;
      case 'poor': if (e.to === NET.me) toast(t('ab_cant')); break;
      case 'peek': if (mineView && !cu.revealed) { cu.revealed = true; Snd.play('magic'); if (cu.phase === 'order') showBubble(); if (L.boardG) burst(L.boardG.cx, L.boardG.cy, 16, { type: 'spark2', cols: ['#d8b4ff', '#fff6c0'], sp0: 40, sp1: 140 }); } break;
      case 'buy': toast(t('ab_o_bought', { p: nameOf(e.by), x: t('ab_dc_' + e.x) })); Snd.play('buy'); break;
    }
  }

  // ---------- the customer queue (who is serving whom) ----------
  function showQueue(on) { qEl.hidden = !on; if (on) renderQueue(true); else NET.qsig = ''; }
  function renderQueue(force) {
    if (qEl.hidden || !NET.D) return;
    const D = NET.D, cs = D.cs.slice().sort((a, b) => a.u - b.u);
    const sig = cs.map(c => c.u + ':' + c.by + ':' + c.rv).join('|') + '#' + NET.focus + '#' + getLang() + '#' + NET.roster.map(r => r.id + r.c + r.n).join();
    if (force || sig !== NET.qsig) {
      NET.qsig = sig;
      qEl.innerHTML = cs.map(c => {
        const me = c.by === NET.me, by = c.by && rosterOf(c.by) ? c.by : '', col = by ? colOf(by) : '';
        return `<button class="qc${me ? ' me' : ''}${by && !me ? ' busy' : ''}" data-u="${c.u}"${col ? ` style="--pc:${col}"` : ''} title="${esc(t('ab_cr_' + c.ty))}"><canvas data-ty="${c.ty}" data-hu="${c.hu == null ? '' : c.hu}"></canvas>${c.my && !c.rv ? '<em>?</em>' : ''}<i class="qp"><b></b></i><span>${by ? esc(me ? t('ab_o_you') : nameOf(by)) : t('ab_o_free')}</span></button>`;
      }).join('') || `<span class="qe">${t(D.sp >= D.n ? 'ab_o_idle' : 'ab_o_noq')}</span>`;
      qEl.querySelectorAll('canvas').forEach(paintChip);
    }
    for (const el of qEl.querySelectorAll('.qc')) {
      const c = D.cs.find(x => x.u === +el.dataset.u), b = el.querySelector('.qp b'); if (!c || !b) continue;
      const f = clamp(c.p / c.pm, 0, 1); b.style.width = (f * 100).toFixed(1) + '%'; b.style.background = f > 0.55 ? '#5fd38a' : f > 0.3 ? '#ffc94a' : '#ff6b6b';
    }
  }
  function paintChip(cv2) {
    const d = Math.min(2, window.devicePixelRatio || 1), w = cv2.clientWidth || 34, h = cv2.clientHeight || 30;
    cv2.width = Math.round(w * d); cv2.height = Math.round(h * d); const c = cv2.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    c.save(); c.translate(w / 2, h * 0.98); A.drawCreature(c, cv2.dataset.ty, h * 0.82, 1.3, { mood: 'idle', hue: cv2.dataset.hu === '' ? null : +cv2.dataset.hu }); c.restore();
  }
  qEl.addEventListener('click', (e) => { const b = e.target.closest('.qc'); if (!b) return; Snd.init(); Snd.play('click'); if (S.screen === 'play') focusOn(+b.dataset.u, false); });

  // ---------- online menus ----------
  function overlaySig(kind) {
    const D = NET.D;
    return kind + JSON.stringify([NET.roster, NET.hostId, NET.room, NET.ready, getLang(), pCount(), D && [D.ph, D.d, D.n, D.g, D.sl, D.r, D.ph === 'play' ? 0 : D.st]]);
  }
  function refreshOverlay(kind) { if (ui.overlay.hidden || ui.overlay.dataset.kind !== kind) return; if (overlaySig(kind) !== NET.osig) renderOverlay(); }
  function onlineOverlay(kind, sndRow) {
    NET.osig = overlaySig(kind);
    const D = NET.D, host = isHost(), leaveBtn = `<button class="btn sec small danger" data-act="oleave">${t('ab_o_leave')}</button>`;
    const wallet = `<p class="wallet"><i class="coin"></i>${t('ab_o_wallet', { n: NET.room.co })}</p>`;
    if (kind === 'online') {
      return `<h2>${t('ab_o_title')}</h2><p class="sub">${t('ab_o_sub')}</p>
        <label class="fld"><span>${t('ab_o_name')}</span><input id="abName" maxlength="16" autocomplete="off" value="${esc(netName())}"></label>
        <button class="btn big" data-act="ocreate">${t('ab_o_create')}</button>
        <div class="orow"><input id="abCode" maxlength="5" placeholder="${t('ab_o_code')}" autocomplete="off" spellcheck="false"><button class="btn" data-act="ojoin">${t('ab_o_join')}</button></div>
        <p class="muted small" id="abMsg">${NET.msg ? esc(NET.msg) : t('ab_o_note')}</p>
        <button class="btn sec" data-act="back">${t('ab_back')}</button>`;
    }
    if (kind === 'lobby') {
      const R = NET.roster.length && rosterOf(NET.me) ? NET.roster : alivePlayers().map((p, i) => ({ id: p.id, n: p.n, c: i }));
      let pl = R.map(r => `<div class="pl" style="--pc:${PCOL[r.c % 4]}"><i></i><b>${esc(r.n)}</b>${r.id === NET.me ? `<small>(${t('ab_o_you')})</small>` : ''}<span class="role">${r.id === NET.hostId ? '👑 ' + t('ab_o_host') : t('ab_o_barista')}</span></div>`).join('');
      for (let i = R.length; i < MAXP; i++) pl += `<div class="pl empty"><i></i><span>${t('ab_o_waitp')}</span></div>`;
      const day = NET.room.d, ok = pCount() >= 2;
      return `<h2>${t('ab_o_title')}</h2>
        <div class="code"><small>${t('ab_o_roomcode')}</small><b>${esc(NET.code)}</b></div>
        <button class="btn sec small" data-act="ocopy">${t('ab_o_copy')}</button>
        <div class="plist">${pl}</div>
        <div class="dayrow">${host ? `<button class="btn sec small" data-act="oday" data-d="-1" ${day <= 1 ? 'disabled' : ''}>−</button>` : ''}<b>${t('ab_day', { n: day })}</b>${host ? `<button class="btn sec small" data-act="oday" data-d="1" ${day >= NET.room.md ? 'disabled' : ''}>+</button>` : ''}</div>
        ${wallet}${!NET.ready || (!host && !D) ? `<p class="muted small">${t('ab_o_connecting')}</p>` : ''}
        ${host ? `<button class="btn big" data-act="ostart" ${ok ? '' : 'disabled'}>${t('ab_o_start')}</button>${ok ? '' : `<p class="muted small">${t('ab_o_need')}</p>`}` : `<p class="muted">${t('ab_o_waithost')}</p>`}
        <div class="row"><button class="btn sec" data-act="oshop">${t('ab_shop')}</button>${leaveBtn}</div>
        <p class="muted small">${t('ab_o_rules')}</p>`;
    }
    if (kind === 'ointro' && D) {
      return `<h2>${t('ab_day', { n: D.d })}</h2><p class="muted small">${t('ab_o_team', { n: pCount() })}</p>
        <div class="facts"><span>${svg('cup', '#ffb703', 18)} ${t('ab_customers', { n: D.n })}</span><span>${svg('heart', '#ff6b8b', 18)} ${t('ab_goal', { n: D.g })}</span></div>
        <p class="muted small">${t('ab_strikes_lim', { n: D.sl })}</p>${introCards(D.d)}
        ${host ? `<button class="btn big" data-act="oopen">${t('ab_open')}</button>` : `<p class="muted">${t('ab_o_waitopen')}</p>`}${leaveBtn}`;
    }
    if (kind === 'oend' && D && D.r) {
      const r = D.r, stars = [1, 2, 3].map(i => svg('star', i <= r.stars ? '#ffb703' : 'rgba(255,255,255,.18)', 40)).join('');
      const rows = Object.keys(D.st).map(id => [id, D.st[id]]).sort((a, b) => b[1].t - a[1].t || b[1].s - a[1].s).map(([id, s2]) =>
        `<tr style="--pc:${PCOL[(s2.c || 0) % 4]}"><td><i></i>${esc(s2.n)}${id === NET.me ? ` <small>(${t('ab_o_you')})</small>` : id !== NET.me && !NET.peers[id] ? ` <small>(${t('ab_o_gone')})</small>` : ''}</td><td>${s2.s}</td><td>${s2.h}</td><td>+${s2.t}</td></tr>`).join('');
      return `<h2>${r.win ? t('ab_win') : t('ab_lose')}</h2>${r.win ? `<div class="stars">${stars}</div>` : `<p class="sub">${r.why === 'strikes' ? t('ab_lose_strikes') : t('ab_lose_hearts', { h: r.hearts, g: r.goal })}</p>`}
        <div class="sum"><div>${svg('heart', '#ff6b8b', 20)}<b>${r.hearts}<small>/${r.maxH}</small></b><span>${t('ab_sum_hearts')}</span></div>
        <div><i class="coin big"></i><b>+${r.tips}</b><span>${t('ab_sum_tips')}</span></div><div>${svg('star', '#ffd25a', 20)}<b>${r.perfects}</b><span>${t('ab_sum_perfect')}</span></div></div>
        <table class="crew"><thead><tr><th>${t('ab_o_crew')}</th><th>${t('ab_o_served')}</th><th>${svg('heart', '#ff6b8b', 14)}</th><th><i class="coin"></i></th></tr></thead><tbody>${rows}</tbody></table>
        ${wallet}${r.win && r.d === LAST_DAY ? `<p class="muted">${t('ab_endless')}</p>` : ''}
        ${host ? `${r.win ? `<button class="btn big" data-act="onext">${t('ab_next')}</button>` : `<button class="btn big" data-act="oretry">${t('ab_retry')}</button>`}
          <div class="row"><button class="btn sec" data-act="oshop">${t('ab_shop')}</button>${r.win ? `<button class="btn sec" data-act="oretry">${t('ab_retry')}</button>` : ''}<button class="btn sec" data-act="olobby">${t('ab_o_lobby')}</button></div>`
        : `<p class="muted">${t('ab_o_waithost')}</p><div class="row"><button class="btn sec" data-act="oshop">${t('ab_shop')}</button></div>`}${leaveBtn}`;
    }
    if (kind === 'oshop') {
      const items = DECOR.map(dc => {
        const own = !!NET.room.dc[dc.id], can = NET.room.co >= dc.price;
        return `<div class="item ${own ? 'own' : ''}">${previewCanvas('dc', dc.id)}<div class="it"><b>${t('ab_dc_' + dc.id)}</b><small>${t('ab_dd_' + dc.id)}</small></div>
          ${own ? `<span class="owned">${t('ab_owned')}</span>` : `<button class="btn small ${can ? '' : 'sec'}" data-act="obuy" data-id="${dc.id}" ${can ? '' : 'disabled'}><i class="coin"></i>${dc.price}</button>`}</div>`;
      }).join('');
      return `<h2>${t('ab_shop')}</h2><p class="muted small">${t('ab_o_shopnote')}</p>${wallet}<div class="list">${items}</div><button class="btn" data-act="oshopback">${t('ab_back')}</button>`;
    }
    if (kind === 'opause') {
      return `<h2>${t('ab_paused')}</h2><p class="muted">${t(pCount() > 1 ? 'ab_o_stillopen' : 'ab_o_held')}</p><button class="btn big" data-act="resume">${t('ab_resume')}</button>
        <div class="row"><button class="btn sec" data-act="how2">${t('ab_how')}</button></div>${sndRow}${leaveBtn}`;
    }
    if (kind === 'oalone') {
      return `<h2>${t('ab_o_alone')}</h2><p class="sub">${t('ab_o_alone2')}</p><button class="btn big" data-act="resume">${t('ab_o_solo')}</button><button class="btn sec" data-act="oleave">${t('ab_menu')}</button>`;
    }
    return '';
  }
  function onlineInputs() {
    const code = $('abCode'), nm = $('abName');
    if (code) { code.oninput = () => { code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; code.onkeydown = (e) => { if (e.key === 'Enter') netStart(false); }; }
    if (nm) nm.onkeydown = (e) => { if (e.key === 'Enter') netStart(true); };
  }
  async function netStart(create) {
    const nm = $('abName'), cd = $('abCode'), msg = $('abMsg');
    const name = (nm ? nm.value : '').trim().slice(0, 16);
    if (name) { NET.name = name; try { if (window.Auth && !Auth.profile && Auth.setGuestName) Auth.setGuestName(name); } catch (e) {} }
    let code = '';
    if (!create) { code = (cd ? cd.value : '').trim().toUpperCase(); if (code.length < 4) { if (msg) msg.textContent = t('ab_o_codehint'); return; } }
    if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return;
    joinRoom(create ? newCode() : code, create);
  }
  function copyText(text, btn) {
    const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = t('ab_o_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
  }
  function onlineClick(act, b) {
    const D = NET.D;
    switch (act) {
      case 'online': NET.msg = ''; showOverlay('online'); break;
      case 'ocreate': netStart(true); break;
      case 'ojoin': netStart(false); break;
      case 'ocopy': copyText(inviteLink(NET.code), b); break;
      case 'oday': if (isHost()) { NET.room.d = clamp(NET.room.d + (+b.dataset.d), 1, NET.room.md); sendSnap(); renderOverlay(); } break;
      case 'ostart': if (isHost()) { if (pCount() < 2) toast(t('ab_o_need')); else hostStartDay(NET.room.d); } break;
      case 'oopen': hostOpen(); break;
      case 'onext': if (isHost() && D && D.r && D.r.win) hostStartDay(D.r.d + 1); break;
      case 'oretry': if (isHost() && D && D.r) hostStartDay(D.r.d); break;
      case 'olobby': hostToLobby(); break;
      case 'oshop': showOverlay('oshop'); break;
      case 'oshopback': showOverlay(D && D.ph === 'end' ? 'oend' : 'lobby'); break;
      case 'obuy': netAct({ a: 'buy', x: b.dataset.id }); break;
      case 'oleave': leaveRoom(); goTitle(); break;
    }
  }
  addEventListener('pagehide', () => { if (NET.ch) nsend('bye', {}); });
  window.Mal3abShareLink = () => NET.code ? inviteLink(NET.code) : pageLink();
  window.Mal3abPrepareInvite = async () => {
    if (!NET.code) { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return pageLink(); joinRoom(newCode(), true); }
    return inviteLink(NET.code);
  };
  window.Mal3abLiveInfo = () => NET.on ? { players: pCount(), max: MAXP } : {};

  // ============================================================ test / script API
  window.AlchemyBarista = {
    S, cup, ING, CREATURES, LAST_DAY, dayCfg, save: () => save,
    // online
    NET, joinRoom, leaveRoom, focusOn, newCode, netStart,
    net() { const D = NET.D; return { on: NET.on, code: NET.code, me: NET.me, host: NET.hostId, isHost: isHost(), players: pCount(), roster: NET.roster.map(r => ({ id: r.id, n: r.n, c: r.c })), room: JSON.parse(JSON.stringify(NET.room)), focus: NET.focus, ph: D && D.ph, D: D && JSON.parse(JSON.stringify(D)), overlay: ui.overlay.hidden ? '' : ui.overlay.dataset.kind, screen: S.screen, cust: S.cust && { uid: S.cust.uid, phase: S.cust.phase, type: S.cust.type } }; },
    get screen() { return S.screen; },
    state() { const cu = S.cust; return { screen: S.screen, day: S.dayNum, custIdx: S.custIdx, customers: S.cfg && S.cfg.n, hearts: S.hearts, goal: S.cfg && S.cfg.goal, strikes: S.strikes, tips: save.tips, phase: cu && cu.phase, type: cu && cu.type, target: cu && cu.order && cu.order.target, mood: effMood(cup.mix, cup.T), T: cup.T, doses: cup.doses.length, mystery: cu && cu.order && cu.order.mystery, revealed: cu && cu.revealed, maxDay: save.maxDay, result: S.lastResult }; },
    startDay, openCafe, addIngredient: (id) => addIng(id), serve, dump, peek, pause, resume, menu: goTitle,
    setDial: (v) => { cup.dial = clamp(v, 0, 100); }, setTemp: (v) => { cup.T = cup.dial = clamp(v, 0, 100); },
    match: () => S.cust && S.cust.order ? accuracy(effMood(cup.mix, cup.T), S.cust.order.target) : null,
    recipe: () => S.cust && S.cust.order ? solve(S.cust.order.target, ingsFor(S.dayNum), 6) : null,
    // brew the best recipe right away (temperatures set instantly) — for tests
    autoBrew() {
      const cu = S.cust; if (!cu || cu.phase !== 'order') return false;
      const r = solve(cu.order.target, ingsFor(S.dayNum), Math.min(capacity(), 6));
      for (const [id, z] of r.steps) { cup.T = cup.dial = z === 'hot' ? 85 : z === 'cold' ? 15 : 50; addIng(id); }
      const dw = clamp((cu.order.target[0] - cup.mix[0]) / TEMP_W, -1, 1); cup.T = cup.dial = 50 + dw * 50;
      return accuracy(effMood(cup.mix, cup.T), cu.order.target);
    },
    skip(sec) { if (S.cust && S.cust.phase === 'order') S.cust.patience -= sec; },
    fastForward(sec) { const n = Math.ceil(sec / 0.05); for (let i = 0; i < n; i++) step(0.05); },
    buy, setLang: (l) => setLang(l),
    _jars: () => jars.map(j => ({ id: j.g.id, x: j.x, y: j.y, w: j.w, h: j.h })), _cup: () => ({ x: L.cupX, y: L.cupY }), _th: () => Object.assign({}, L.th), _layout: () => L,
  };
  boot();
  // opening the page with ?room=CODE joins that café
  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {
    let tried = false;
    const go = async () => { if (tried || NET.on) return; tried = true; if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return; joinRoom(roomParam, false); };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
  }
})();
