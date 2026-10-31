/* Shadow Tactics: Eclipse — a Mal3ab game.
   Top-down stealth inside a giant solar clock: the sun turns around the dial, real shadows sweep across the map,
   and you can weave your own shadow loose to scout, clang a distraction or bridge a gap. */
(function () {
  'use strict';
  const SLUG = 'shadow-eclipse', K_PROG = SLUG + '-progress', K_SET = SLUG + '-settings';
  const LEVELS = window.SE_LEVELS || [];

  // ------------------------------------------------------------------ strings
  addStrings({
    se_t1: 'تكتيكات الظل', se_t2: 'الكسوف',
    se_tag: 'اتسلل جوه ساعة شمس عملاقة… الضل بيلف مع الشمس، وإنت لازم تلف معاه.',
    se_play: 'العب', se_cont: 'كمّل — المرحلة {n}', se_levels: 'المراحل', se_howto: 'إزاي تلعب', se_back: 'رجوع', se_menu: 'القايمة الرئيسية',
    se_snd_on: '🔊 الصوت شغال', se_snd_off: '🔇 الصوت مقفول',
    se_resume: 'كمّل', se_restart: 'عيد المرحلة', se_paused: 'استراحة',
    se_lvl: 'المرحلة {n}', se_start: 'يلا بينا', se_next: 'المرحلة اللي بعدها', se_retry: 'حاول تاني',
    se_caught: 'اتقفشت!', se_caught_d: 'حارس من حراس الساعة مسكك. خليك في الضل وابعد عن إيديهم.',
    se_win: 'عدّيت!', se_time: 'الوقت', se_best: 'أحسن وقت', se_new_best: '🎉 رقم قياسي جديد!',
    se_s_done: 'خلّصت المرحلة', se_s_ghost: 'من غير ولا إنذار', se_s_fast: 'في أقل من {s} ثانية',
    se_obj_exit: '🚪 اوصل لبوابة الخروج', se_obj_gear: '☀️ اسرق ترس الشمس',
    se_hidden: 'مستخبي', se_exposed: 'مكشوف', se_alarm_t: '🚨 {s}',
    se_alarm: '🚨 إنذار! الحراس جايين — استخبى بسرعة', se_calm: 'الحراس هديوا… بس الإنذار اتحسب عليك',
    se_gear_got: '☀️ خدت ترس الشمس! الساعة اتجننت — اجري على البوابة!',
    se_locked: '🔒 البوابة مقفولة — هات ترس الشمس الأول',
    se_no_light: 'النور خلص — ضلك رجعلك غصب عنك', se_need_light: 'النور قليل… استنى في الضل شوية',
    se_bridge_bad: 'الكوبري لازم يعدّي فوق فجوة وينزل على أرض (أقصى حاجة ٧ مربعات)',
    se_lever_wait: 'الرافعة لسه بترجع مكانها…', se_lever_stop: '⏸️ وقّفت الساعة شوية!', se_lever_fast: '⏩ قدّمت الساعة!',
    se_all_done: 'سرقت الكسوف نفسه! الساعة العملاقة كلها بقت تحت أمرك. 👑',
    se_stars: '⭐ {n} من {m}', se_locked_lvl: 'مقفولة',
    se_b_weave: 'ضل', se_b_recall: 'رجّع', se_b_noise: 'خبطة', se_b_bridge: 'كوبري', se_b_use: 'رافعة',
    se_k_move: 'حركة', se_k_weave: 'ضل / رجّعه', se_k_act: 'خبطة / رافعة', se_k_bridge: 'كوبري', se_k_map: 'خريطة', se_k_pause: 'وقفة',
    se_controls: 'التحكم', se_c_move: 'WASD أو الأسهم — أو الجويستيك على الموبايل', se_c_weave: 'افصل ضلك أو رجّعه', se_c_act: 'وإنت ضل: خبطة تلهي الحراس — وإنت جسم: شد الرافعة',
    se_c_bridge: 'وإنت ضل ورا فجوة: اعمل كوبري', se_c_map: 'شوف الخريطة كلها', se_c_pause: 'وقفة', se_c_restart: 'عيد المرحلة',
    se_h1: '☀️ الشمس بتلف حوالين الساعة، والضلال الزرقا بتلف معاها. بص على الساعة اللي فوق.',
    se_h2: '🌑 وإنت واقف في الضل محدش هيشوفك — إلا لو حارس قرب منك أوي.',
    se_h3: '👁️ الحراس عندهم مجال رؤية: ❓ يعني شاكك، ❗ يعني إنذار. لو حارس لمسك يبقى اتقفشت.',
    se_h4: '🌘 نسج الضل (Q): ضلك يسيب جسمك ويمشي في الضلمة بس، وجسمك يفضل مكانه مستني.',
    se_h5: '🔔 الخبطة (E): ضلك يعمل صوت يلهي الحراس.  🌉 الكوبري (F): ضلك يعدّي فوق الفجوة ويعملك كوبري تمشي عليه.',
    se_h6: '🔆 عداد النور بيخلص وضلك بره، وبيتملا تاني وإنت واقف في الضل.',
    se_h7: '⚙️ الروافع: ⏸️ توقّف الساعة شوية، ⏩ تقدّمها. ألواح القمر 🌙 بتفتح أبوابها في الضل، وألواح الشمس ☀️ في النور.',
    se_h8: '⭐ ٣ نجوم في كل مرحلة: خلّصها، من غير إنذار، وفي وقت قليل.',
    se_l1: 'أول شعاع', se_l2: 'الساعة بتلف', se_l3: 'نسج الضل', se_l4: 'خبطة صغيرة', se_l5: 'الفجوة', se_l6: 'ترس الشمس',
    se_l7: 'أقفال الضل', se_l8: 'الوقت الواقف', se_l9: 'حراس الفوانيس', se_l10: 'عقارب الساعة', se_l11: 'عز الضهر', se_l12: 'الكسوف',
    se_d1: 'الساعة لسه صاحية. الحارس اللي في النص بيلف بعينه — امشي من ضل لضل لحد البوابة.',
    se_d2: 'الشمس هنا بتلف أسرع. العمود العالي ضله طويل — اركب الضل وهو بيلف.',
    se_d3: 'مش كل حاجة باينة. افصل ضلك واستكشف اللي ورا الحيطان قبل ما تتحرك.',
    se_d4: 'حارس واقف سادد الطريق. خلّي ضلك يعمل خبطة بعيد عنه.',
    se_d5: 'فجوة في قلب الساعة. ضلك يقدر يعدّي فوق الضلمة ويعملك كوبري.',
    se_d6: 'أول ترس شمس. اسرقه — بس خلي بالك، الساعة هتجري بعدها.',
    se_d7: 'أبواب بتتفتح بالضل. لوح القمر لازم يفضل في الضلمة عشان الباب يفضل مفتوح.',
    se_d8: 'الضل هنا بييجي في ساعات معينة بس. شد الرافعة ووقّف الوقت.',
    se_d9: 'حراس شايلين فوانيس — النور بتاعهم بيمسح أي ضل حواليهم.',
    se_d10: 'عقارب الساعة العملاقة بتلف فوق راسك، وضلها بيكنس الأرض.',
    se_d11: 'عز الضهر: الشمس فوق راسك والضلال قصيرة. كل حتة ضل غالية.',
    se_d12: 'ترس الكسوف الكبير في قلب الساعة. آخر سرقة وأصعبهم.',
    se_tip_move: 'اتحرك بـ WASD أو الأسهم.', se_tip_move_t: 'اسحب صباعك على الشمال عشان تتحرك.',
    se_tip_hide: 'الضل الأزرق بيخبيك. الحارس مش هيشوفك غير وإنت في النور.',
    se_tip_exit: 'اوصل للبوابة المنوّرة عشان تعدّي المرحلة.',
    se_tip_sun: 'بص على الساعة اللي فوق: الشمس بتلف، وكل الضلال بتلف معاها.',
    se_tip_spire: 'العمود العالي ضله طويل — امشي جواه وهو بيلف ناحية البوابة.',
    se_tip_weave: 'دوس Q عشان تفصل ضلك وتستكشف. الضل بيمشي في الضلمة بس.', se_tip_weave_t: 'دوس 🌑 عشان تفصل ضلك وتستكشف. الضل بيمشي في الضلمة بس.',
    se_tip_fog: 'الأماكن الغامقة مش باينالك — ضلك يقدر يدخل من فتحات التهوية ويشوفلك.',
    se_tip_recall: 'دوس Q تاني ترجّع الضل. عداد النور بيخلص وهو بره.', se_tip_recall_t: 'دوس 🌑 تاني ترجّع الضل. عداد النور بيخلص وهو بره.',
    se_tip_noise: 'وإنت ضل دوس E تعمل خبطة — الحارس هيروح يشوف إيه الحكاية.', se_tip_noise_t: 'وإنت ضل دوس 🔔 تعمل خبطة — الحارس هيروح يشوف إيه الحكاية.',
    se_tip_bridge: 'ابعت ضلك فوق الفجوة لحد أرض في الضل، ودوس F يعملك كوبري، وبعدين عدّي عليه.', se_tip_bridge_t: 'ابعت ضلك فوق الفجوة لحد أرض في الضل، ودوس 🌉 يعملك كوبري، وبعدين عدّي عليه.',
    se_tip_gear: 'اسرق ترس الشمس — وأول ما تاخده الساعة هتجري أسرع!',
    se_tip_plate: 'لوح القمر 🌙 بيفتح بابه وهو في الضل. ركّن ضلك عليه وعدّي!',
    se_tip_sunplate: 'لوح الشمس ☀️ بيفتح بابه وهو في النور بس.',
    se_tip_lever: 'دوس E جنب الرافعة: ⏸️ توقّف الساعة شوية، ⏩ تقدّمها.', se_tip_lever_t: 'دوس ⚙️ جنب الرافعة: ⏸️ توقّف الساعة شوية، ⏩ تقدّمها.',
    se_tip_lantern: 'حراس الفوانيس بينوّروا الضل اللي حواليهم — ابعد عنهم.',
    se_tip_hands: 'عقارب الساعة فوق راسك ضلها بيلف على الأرض — امشي تحتها.',
    se_tip_noon: 'وقت الضهر الضلال قصيرة جدًا… استغل كل حتة ضل.',
    se_tip_final: 'كل اللي اتعلمته هتحتاجه هنا. بالتوفيق يا معلم!',
    se_future: '🗺️ الخطوط المتقطعة = مكان الضلال بعد ١٠ ثواني',
    se_tip_map: 'دوس M تشوف الخريطة كلها.', se_tip_map_t: 'دوس 🗺️ فوق تشوف الخريطة كلها.',
  }, {
    se_t1: 'Shadow Tactics', se_t2: 'Eclipse',
    se_tag: 'Sneak through a giant solar clock — the shadows turn with the sun, and so must you.',
    se_play: 'Play', se_cont: 'Continue — level {n}', se_levels: 'Levels', se_howto: 'How to play', se_back: 'Back', se_menu: 'Main menu',
    se_snd_on: '🔊 Sound on', se_snd_off: '🔇 Sound off',
    se_resume: 'Resume', se_restart: 'Restart level', se_paused: 'Paused',
    se_lvl: 'Level {n}', se_start: 'Start', se_next: 'Next level', se_retry: 'Try again',
    se_caught: 'Caught!', se_caught_d: 'A clockwork sentinel got its hands on you. Stay in the shade and out of reach.',
    se_win: 'Level complete!', se_time: 'Time', se_best: 'Best', se_new_best: '🎉 New best time!',
    se_s_done: 'Finished the level', se_s_ghost: 'No alarm raised', se_s_fast: 'Under {s} seconds',
    se_obj_exit: '🚪 Reach the exit', se_obj_gear: '☀️ Steal the sun-gear',
    se_hidden: 'Hidden', se_exposed: 'Exposed', se_alarm_t: '🚨 {s}',
    se_alarm: '🚨 Alarm! The guards are coming — hide, fast.', se_calm: 'The guards calmed down… but the alarm still counts.',
    se_gear_got: '☀️ Sun-gear stolen! The clock is racing — run for the exit!',
    se_locked: '🔒 The exit is sealed — get the sun-gear first.',
    se_no_light: 'Out of light — your shadow snapped back.', se_need_light: 'Not enough light… wait in the shade a moment.',
    se_bridge_bad: 'A bridge must cross a gap and land on solid floor (7 tiles at most).',
    se_lever_wait: 'The lever is still resetting…', se_lever_stop: '⏸️ You stopped the clock for a moment!', se_lever_fast: '⏩ You pushed the clock forward!',
    se_all_done: 'You stole the Eclipse itself! The whole giant clock answers to you now. 👑',
    se_stars: '⭐ {n} of {m}', se_locked_lvl: 'Locked',
    se_b_weave: 'Weave', se_b_recall: 'Recall', se_b_noise: 'Noise', se_b_bridge: 'Bridge', se_b_use: 'Lever',
    se_k_move: 'move', se_k_weave: 'weave / recall', se_k_act: 'noise / lever', se_k_bridge: 'bridge', se_k_map: 'map', se_k_pause: 'pause',
    se_controls: 'Controls', se_c_move: 'WASD or arrow keys — or the joystick on phones', se_c_weave: 'Weave your shadow out, or call it back', se_c_act: 'As a shadow: clang to lure guards — as yourself: pull a lever',
    se_c_bridge: 'As a shadow across a gap: weave a bridge', se_c_map: 'See the whole map', se_c_pause: 'Pause', se_c_restart: 'Restart the level',
    se_h1: '☀️ The sun travels around the clock and the blue shadows turn with it. Watch the dial at the top.',
    se_h2: '🌑 While you stand in shadow nobody can see you — unless a guard gets really close.',
    se_h3: '👁️ Guards have vision cones: ❓ means suspicious, ❗ means alarm. If a guard touches you, you are caught.',
    se_h4: '🌘 Shadow weaving (Q): your shadow leaves your body and moves only through darkness while your body waits.',
    se_h5: '🔔 Noise (E): your shadow clangs to distract guards.  🌉 Bridge (F): your shadow crosses a gap and weaves a bridge to walk on.',
    se_h6: '🔆 The light meter drains while your shadow is out and refills while you stand in shade.',
    se_h7: '⚙️ Levers: ⏸️ stops the clock for a while, ⏩ pushes it forward. Moon plates 🌙 open their doors in shade, sun plates ☀️ in light.',
    se_h8: '⭐ Three stars per level: finish it, raise no alarm, and be quick.',
    se_l1: 'First Light', se_l2: 'The Turning Hour', se_l3: 'Shadow Weave', se_l4: 'Clatter', se_l5: 'The Gap', se_l6: 'Sun-Gear',
    se_l7: 'Locks of Shade', se_l8: 'Stopped Time', se_l9: 'Lantern Watch', se_l10: 'Clock Hands', se_l11: 'High Noon', se_l12: 'The Eclipse',
    se_d1: 'The clock is just waking up. The watcher in the middle keeps turning — hop from shadow to shadow to the exit.',
    se_d2: 'The sun turns faster here. The tall spire throws a long shadow — ride it as it sweeps around.',
    se_d3: 'You cannot see everything. Weave your shadow out and scout behind the walls before you move.',
    se_d4: 'A guard is blocking the way. Make your shadow clang somewhere else.',
    se_d5: 'A chasm splits the clockwork. Your shadow can cross the dark and weave you a bridge.',
    se_d6: 'Your first sun-gear. Steal it — but the clock will race once it is gone.',
    se_d7: 'Doors that open with shadow. The moon plate has to stay dark for its door to stay open.',
    se_d8: 'Shade only reaches this hall at certain hours. Pull a lever and stop time.',
    se_d9: 'These guards carry lanterns that burn away every shadow around them.',
    se_d10: 'The giant clock hands sweep overhead, and their shadows sweep the floor.',
    se_d11: 'High noon: the sun is overhead and shadows are short. Every scrap of shade counts.',
    se_d12: 'The great Eclipse gear sits at the heart of the clock. The last and hardest heist.',
    se_tip_move: 'Move with WASD or the arrow keys.', se_tip_move_t: 'Drag on the left side of the screen to move.',
    se_tip_hide: 'Blue shadow hides you. Guards can only see you in the light.',
    se_tip_exit: 'Reach the glowing hatch to finish the level.',
    se_tip_sun: 'Watch the dial at the top: the sun turns, and every shadow turns with it.',
    se_tip_spire: 'The tall spire casts a long shadow — walk inside it as it swings toward the exit.',
    se_tip_weave: 'Press Q to weave your shadow out and scout. It can only move through darkness.', se_tip_weave_t: 'Tap 🌑 to weave your shadow out and scout. It can only move through darkness.',
    se_tip_fog: 'Dim areas are hidden from you — your shadow can slip through vents and look for you.',
    se_tip_recall: 'Press Q again to call your shadow back. The light meter drains while it is out.', se_tip_recall_t: 'Tap 🌑 again to call your shadow back. The light meter drains while it is out.',
    se_tip_noise: 'As a shadow, press E to clang — the guard will go and check it out.', se_tip_noise_t: 'As a shadow, tap 🔔 to clang — the guard will go and check it out.',
    se_tip_bridge: 'Send your shadow over the gap to shaded floor, press F to weave a bridge, then walk across.', se_tip_bridge_t: 'Send your shadow over the gap to shaded floor, tap 🌉 to weave a bridge, then walk across.',
    se_tip_gear: 'Steal the sun-gear — the moment you take it, the clock speeds up!',
    se_tip_plate: 'A moon plate 🌙 opens its door while it is in shade. Park your shadow on it and slip through!',
    se_tip_sunplate: 'A sun plate ☀️ opens its door only while it is lit.',
    se_tip_lever: 'Press E at a lever: ⏸️ stops the clock for a while, ⏩ pushes it forward.', se_tip_lever_t: 'Tap ⚙️ at a lever: ⏸️ stops the clock for a while, ⏩ pushes it forward.',
    se_tip_lantern: 'Lantern sentinels light up the shadows around them — keep your distance.',
    se_tip_hands: 'The clock hands overhead cast shadows that sweep the floor — walk beneath them.',
    se_tip_noon: 'At noon the shadows are tiny… make use of every scrap of shade.',
    se_tip_final: 'You will need everything you have learned. Good luck, master thief!',
    se_future: '🗺️ Dashed outlines show where the shadows will be in 10 seconds.',
    se_tip_map: 'Press M to see the whole map.', se_tip_map_t: 'Tap 🗺️ at the top to see the whole map.',
  });
  // online: Infiltrator vs Warden
  addStrings({
    se_online: '🌐 أونلاين — لاعبين اتنين', se_on_title: 'العب أونلاين', se_on_tag: 'واحد بيتسلل، والتاني كبير الحراس اللي بيحرّك الحراس ويدوّر عليه.',
    se_name: 'اسمك', se_name_ph: 'اكتب اسمك', se_player: 'لاعب',
    se_inf: 'المتسلل', se_inf_d: 'اتسلل في الضل واوصل لبوابة الخروج من غير ما حد يقفشك.',
    se_war: 'كبير الحراس', se_war_d: 'حرّك الحراس ودوّر على المتسلل — بس إنت شايف اللي حراسك شايفينه بس.',
    se_create_as: 'اعمل أوضة بالدور ده', se_or: 'أو ادخل أوضة صاحبك', se_code_ph: 'الكود', se_join: 'ادخل', se_code_hint: 'اكتب كود من ٤ حروف أو أكتر',
    se_room: 'الأوضة', se_copy: '🔗 انسخ لينك الدعوة', se_copied: 'اتنسخ ✓', se_you: 'إنت', se_partner: 'صاحبك', se_host: '👑 صاحب الأوضة',
    se_swap: '🔄 بدّلوا الأدوار', se_start_on: 'يلا نبدأ', se_need_p: 'مستنيين صاحبك يدخل…', se_wait_host: 'مستنيين صاحب الأوضة يبدأ…', se_lvl_pick: 'المرحلة',
    se_leave: 'اخرج من الأوضة', se_waiting: 'مستني صاحبك… ابعتله الكود أو اللينك', se_connecting: 'بيتصل…',
    se_full: 'الأوضة دي مليانة', se_no_net: 'مفيش اتصال بالنت', se_joined: '{p} دخل الأوضة', se_left: '{p} خرج',
    se_lost_t: 'صاحبك خرج', se_lost_inf: 'صاحبك خرج من اللعبة. تقدر تكمّل المرحلة لوحدك والحراس هيرجعوا يمشوا لوحدهم.', se_lost_war: 'المتسلل خرج من اللعبة.',
    se_solo: 'كمّل لوحدك', se_to_room: 'ارجع للأوضة', se_rematch: 'العبوا تاني', se_next_on: 'المرحلة اللي بعدها', se_paused_by: '{p} وقّف اللعبة',
    se_r_win: '🏆 كسبت!', se_r_lose: 'خسرت المرة دي', se_r_esc_me: 'هربت من الحراس وعدّيت من البوابة!', se_r_esc_them: 'المتسلل هرب منك من البوابة!',
    se_r_caught_me: 'كبير الحراس قفشك!', se_r_caught_them: 'قفشت المتسلل!', se_r_alarm: '🚨 وكان في إنذار كامل', se_r_vs: 'إنت {r} قدام {p}',
    se_ready: 'استعد…', se_go_inf: 'اوصل للبوابة من غير ما حد يقفشك. الحراس دول بيحرّكهم واحد حقيقي!',
    se_go_war: 'اقفش المتسلل. مش هتشوفه غير لما حارس من حراسك يشوفه أو شعلة تنوّر عليه.',
    se_wc_sel: 'دوس على حارس عشان تختاره — وكل الحراس التانيين بيكمّلوا دوريتهم لوحدهم.', se_wc_go: 'دوس على الأرض عشان تبعت الحارس هناك (الحارس الواقف بيبص ناحيتها بس).',
    se_wc_steer: 'WASD أو الأسهم: حرّك الحارس اللي مختاره بإيدك.', se_wc_flare: '🔥 الشعلة (F): نوّر حتة ٣ ثواني وامسح الضل اللي فيها — وبعدين تستنى ٢٠ ثانية.',
    se_wc_rel: '✋ سيبه (X): الحارس يرجع لدوريته. ولو سبته واقف ١٠ ثواني هيرجع لوحده.', se_wc_sanct: 'مينفعش تبعت حارس قريب أوي من البداية أو البوابة.',
    se_w_obj: '🛡️ اقفش المتسلل', se_w_role: 'حارس', se_b_flare: 'شعلة', se_b_release: 'سيبه', se_b_next: 'اللي بعده',
    se_flare_aim: '🔥 دوس على المكان اللي عايز تنوّره', se_flare_wait: 'الشعلة لسه بتتشحن… {s}', se_flare_on: '🔥 شعلة! الضل اتمسح هناك', se_flare_inf: '🔥 كبير الحراس رمى شعلة!',
    se_tap_guard: 'اختار حارس الأول', se_sanct: 'مينفعش تبعت حارس قريب أوي من البداية أو البوابة', se_bad_spot: 'الحارس مش هيعرف يوصل هنا',
    se_a_spot: '👁️ حارس شاف حاجة!', se_a_hear: '👂 حارس سمع صوت!', se_a_alarm: '🚨 إنذار كامل! كل الحراس بيدوروا', se_a_calm: 'الإنذار خلص… المتسلل استخبى', se_a_free: 'الحارس رجع لدوريته',
    se_k_sel: 'اختار / ابعت', se_k_steer: 'حرّك', se_k_flare: 'شعلة', se_k_rel: 'سيبه', se_k_next: 'الحارس اللي بعده',
  }, {
    se_online: '🌐 Online — 2 Players', se_on_title: 'Play Online', se_on_tag: 'One player sneaks; the other is the Warden who commands the guards and hunts them down.',
    se_name: 'Your Name', se_name_ph: 'Type your name', se_player: 'Player',
    se_inf: 'Infiltrator', se_inf_d: 'Sneak through the shadows and reach the exit without getting caught.',
    se_war: 'Warden', se_war_d: 'Command the guards and hunt the Infiltrator — you only see what your guards see.',
    se_create_as: 'Create Room', se_or: "Or Join a Friend's Room", se_code_ph: 'Code', se_join: 'Join', se_code_hint: 'Type a code of 4 or more letters',
    se_room: 'Room', se_copy: '🔗 Copy Invite Link', se_copied: 'Copied ✓', se_you: 'You', se_partner: 'Partner', se_host: '👑 Host',
    se_swap: '🔄 Swap Roles', se_start_on: 'Start', se_need_p: 'Waiting for your partner to join…', se_wait_host: 'Waiting for the host to start…', se_lvl_pick: 'Level',
    se_leave: 'Leave Room', se_waiting: 'Waiting for a partner… send them the code or the link', se_connecting: 'Connecting…',
    se_full: 'That room is full', se_no_net: 'No connection', se_joined: '{p} joined the room', se_left: '{p} left',
    se_lost_t: 'Your Partner Left', se_lost_inf: 'Your partner left the game. You can finish the level solo — the guards go back to their own patrols.', se_lost_war: 'The Infiltrator left the game.',
    se_solo: 'Continue Solo', se_to_room: 'Back to Room', se_rematch: 'Rematch', se_next_on: 'Next Level', se_paused_by: '{p} paused the game',
    se_r_win: '🏆 You Win!', se_r_lose: 'You Lose', se_r_esc_me: 'You slipped past the guards and out of the exit!', se_r_esc_them: 'The Infiltrator escaped through the exit!',
    se_r_caught_me: 'The Warden caught you!', se_r_caught_them: 'You caught the Infiltrator!', se_r_alarm: '🚨 …during a full alarm', se_r_vs: 'You were the {r} against {p}',
    se_ready: 'Get Ready…', se_go_inf: 'Reach the exit without getting caught. These guards are commanded by a real player!',
    se_go_war: 'Catch the Infiltrator. You only see them when one of your guards does — or when a flare lights them up.',
    se_wc_sel: 'Tap a guard to select it — every other guard keeps its own patrol.', se_wc_go: 'Tap the floor to send the guard there (a standing watcher just turns to look).',
    se_wc_steer: 'WASD or arrow keys: steer the selected guard by hand.', se_wc_flare: '🔥 Flare (F): light an area for 3 seconds and burn away its shade — then it recharges for 20 seconds.',
    se_wc_rel: '✋ Release (X): the guard goes back to its patrol. A guard left standing for 10 seconds goes back by itself.', se_wc_sanct: 'Guards cannot be sent right next to the start or the exit.',
    se_w_obj: '🛡️ Catch the Infiltrator', se_w_role: 'Guard', se_b_flare: 'Flare', se_b_release: 'Release', se_b_next: 'Next',
    se_flare_aim: '🔥 Tap where to drop the flare', se_flare_wait: 'The flare is recharging… {s}', se_flare_on: '🔥 Flare! The shade is burned away there', se_flare_inf: '🔥 The Warden dropped a flare!',
    se_tap_guard: 'Select a guard first', se_sanct: 'Guards cannot be sent that close to the start or the exit', se_bad_spot: 'The guard cannot get there',
    se_a_spot: '👁️ A guard spotted something!', se_a_hear: '👂 A guard heard a noise!', se_a_alarm: '🚨 Full alarm! Every guard is hunting', se_a_calm: 'The alarm is over… the Infiltrator hid', se_a_free: 'The guard went back to its patrol',
    se_k_sel: 'select / send', se_k_steer: 'steer', se_k_flare: 'flare', se_k_rel: 'release', se_k_next: 'next guard',
  });

  // ------------------------------------------------------------------ constants & helpers
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const P_SPEED = 3.1, SH_SPEED = 4.6, P_R = 0.28, SH_R = 0.2;
  const WALL_H = 1.4, PILLAR_H = 2.0, SPIRE_H = 5, COG_H = 0.9;
  const LANT_R = 2.1, ALARM_TIME = 15, BRIDGE_MAX = 7.5, BRIDGE_HW = 0.42;
  const DRAIN = 0.1, DRAIN_LIT = 0.42, DRAIN_BRIDGE = 0.08, REFILL = 0.24, REFILL_LIT = 0.045, NOISE_COST = 0.16, WEAVE_MIN = 0.15;
  const FLARE_R = 2.6, FLARE_T = 3.2, FLARE_CD = 20, HOLD_MAX = 10, SANCT_R = 2.2, CMD_SP = 2.0;   // online Warden tools
  const SHADOW_RGB = 'rgb(54,78,168)';
  const LINK_COLS = ['#ffcf4a', '#5fe0ff', '#ff7ad9', '#8dff7a'];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const approach = (v, t, s) => v < t ? Math.min(t, v + s) : Math.max(t, v - s);
  const r2 = (v) => Math.round(v * 100) / 100;
  const flareK = (f) => clamp(f.t / 0.15, 0, 1) * clamp((FLARE_T - f.t) / 0.6, 0, 1);   // flare strength: quick flash in, fade out
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0, x = ax + dx * t, y = ay + dy * t;
    return { d: Math.hypot(px - x, py - y), t, x, y };
  }
  const $ = (id) => document.getElementById(id);
  const fmtT = (s) => (Math.round(s * 10) / 10).toFixed(1) + (getLang() === 'ar' ? ' ث' : 's');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  let PROG = store.get(K_PROG, null);
  if (!PROG || typeof PROG !== 'object') PROG = { u: 1, b: {} };
  PROG.b = PROG.b && typeof PROG.b === 'object' ? PROG.b : {}; PROG.u = clamp(PROG.u | 0, 1, LEVELS.length);
  const SET = Object.assign({ mute: false }, store.get(K_SET, {}) || {});
  const saveProg = () => store.set(K_PROG, PROG);

  // ------------------------------------------------------------------ audio (all synthesized)
  const Snd = (function () {
    let ac = null, out = null, nbuf = null, muted = !!SET.mute, drone = null;
    function init() {
      if (ac) return true;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { ac = new AC(); } catch (e) { return false; }
      out = ac.createGain(); out.gain.value = muted ? 0 : 0.75;
      const comp = ac.createDynamicsCompressor(); out.connect(comp); comp.connect(ac.destination);
      nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function unlock() { if (init() && ac.state === 'suspended') ac.resume(); startDrone(); }
    function tone(f, dur, o) {
      o = o || {}; if (!ac || muted) return;
      const t = ac.currentTime + (o.delay || 0), osc = ac.createOscillator(), g = ac.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      if (o.det) osc.detune.value = o.det;
      const v = o.vol || 0.1;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(out); osc.start(t); osc.stop(t + dur + 0.05);
    }
    function noise(dur, o) {
      o = o || {}; if (!ac || muted) return;
      const t = ac.currentTime + (o.delay || 0), src = ac.createBufferSource(); src.buffer = nbuf; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t);
      if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + dur); f.Q.value = o.q || 1;
      const g = ac.createGain(), v = o.vol || 0.1;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(out); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
    }
    function startDrone() {
      if (!ac || drone) return;
      try {
        const g = ac.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.022, ac.currentTime + 3);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
        const o1 = ac.createOscillator(), o2 = ac.createOscillator(), o3 = ac.createOscillator();
        o1.type = 'sawtooth'; o1.frequency.value = 55; o2.type = 'sawtooth'; o2.frequency.value = 82.6; o2.detune.value = 6; o3.type = 'sine'; o3.frequency.value = 110;
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency);
        [o1, o2, o3].forEach(o => { o.connect(lp); o.start(); }); lfo.start(); lp.connect(g); g.connect(out);
        drone = g;
      } catch (e) {}
    }
    return {
      unlock,
      get muted() { return muted; },
      setMute(m) { muted = m; if (out) out.gain.setTargetAtTime(m ? 0 : 0.75, ac.currentTime, 0.05); },
      click() { tone(900, 0.05, { type: 'triangle', vol: 0.05 }); },
      tick(hi) { tone(hi ? 2600 : 1900, 0.025, { type: 'square', vol: 0.012 }); noise(0.02, { f: 5000, q: 6, vol: 0.02 }); },
      step() { noise(0.06, { ft: 'lowpass', f: 700, vol: 0.035 }); },
      gstep() { tone(320, 0.03, { type: 'square', vol: 0.01 }); noise(0.04, { f: 2400, q: 4, vol: 0.012 }); },
      weave() { noise(0.45, { f: 300, fto: 1800, q: 2, vol: 0.12 }); tone(180, 0.4, { to: 420, vol: 0.06 }); tone(270, 0.4, { to: 640, vol: 0.04, delay: 0.05 }); },
      recall() { noise(0.35, { f: 1800, fto: 260, q: 2, vol: 0.1 }); tone(520, 0.3, { to: 200, vol: 0.05 }); },
      clank() { [523, 1247, 1873, 2793].forEach((f, i) => tone(f, 0.7 - i * 0.12, { type: 'triangle', vol: 0.08 - i * 0.012 })); noise(0.18, { f: 3000, q: 1.5, vol: 0.14 }); tone(140, 0.25, { type: 'square', vol: 0.04 }); },
      sus() { tone(620, 0.12, { to: 900, vol: 0.07 }); tone(900, 0.14, { delay: 0.12, vol: 0.05 }); },
      alarm() { for (let i = 0; i < 4; i++) { tone(i % 2 ? 660 : 880, 0.2, { type: 'sawtooth', vol: 0.06, delay: i * 0.2 }); } },
      caught() { tone(220, 0.6, { type: 'square', to: 55, vol: 0.12 }); noise(0.5, { ft: 'lowpass', f: 600, vol: 0.2 }); },
      pickup() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.08, delay: i * 0.07 })); noise(0.6, { f: 6000, q: 3, vol: 0.05 }); },
      win() { [392, 523, 659, 784, 1047].forEach((f, i) => { tone(f, 0.6, { type: 'triangle', vol: 0.08, delay: i * 0.11 }); tone(f * 2, 0.4, { vol: 0.03, delay: i * 0.11 + 0.02 }); }); },
      door() { noise(0.5, { ft: 'lowpass', f: 380, vol: 0.12 }); tone(70, 0.45, { type: 'square', vol: 0.035, to: 50 }); },
      plate() { tone(1200, 0.08, { type: 'triangle', vol: 0.04 }); },
      lever() { tone(110, 0.2, { type: 'square', vol: 0.08 }); for (let i = 0; i < 6; i++) noise(0.03, { f: 2500, q: 5, vol: 0.06, delay: 0.08 + i * 0.06 }); tone(330, 0.5, { delay: 0.45, vol: 0.05 }); },
      bridge() { [660, 990, 1320].forEach((f, i) => tone(f, 0.7, { vol: 0.045, delay: i * 0.06 })); noise(0.6, { f: 1200, fto: 4000, q: 4, vol: 0.05 }); },
      deny() { tone(150, 0.14, { type: 'square', vol: 0.05 }); },
      drain() { tone(300, 0.5, { type: 'sawtooth', to: 80, vol: 0.06 }); },
    };
  })();

  // ------------------------------------------------------------------ level building
  let L = null, G = null;
  const isWallT = (t) => t === 1 || t === 4;
  function buildLevel(i) {
    const def = LEVELS[i], rows = def.map, H = rows.length, W = Math.max(...rows.map(r => r.length)), N = W * H;
    const T = new Uint8Array(N), doorAt = new Int16Array(N).fill(-1), solid = new Uint8Array(N);
    const lv = { i, def, W, H, T, doorAt, solid, circles: [], doors: [], plates: [], levers: [], hands: [], exit: null, gear: null, start: { x: 1.5, y: 1.5 } };
    const dtiles = [], inherit = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = rows[y][x] || '#', cx = x + 0.5, cy = y + 0.5, id = y * W + x;
      let t = 0;
      if (ch === '#') t = 1; else if (ch === '~') t = 2; else if (ch === ',') t = 3; else if (ch === 'v') t = 4;
      else if (ch === 'o') { lv.circles.push({ x: cx, y: cy, r: 0.34, h: PILLAR_H, kind: 'pillar', vis: true }); solid[id] = 1; inherit.push(id); }
      else if (ch === 'T') { lv.circles.push({ x: cx, y: cy, r: 0.42, h: SPIRE_H, kind: 'spire', vis: true }); solid[id] = 1; inherit.push(id); }
      else if (ch === 'C' || ch === 'c') { lv.circles.push({ x: cx, y: cy, r: 0.8, rt: 0.98, h: COG_H, kind: 'cog', vis: false, spin: ch === 'C' ? 1 : -1, rot: 0 }); solid[id] = 1; }
      else if (ch === 'P') { lv.start = { x: cx, y: cy }; inherit.push(id); }
      else if (ch === 'E') { lv.exit = { x: cx, y: cy }; inherit.push(id); }
      else if (ch === 'S') { lv.gear = { x: cx, y: cy }; inherit.push(id); }
      else if (ch === 'L' || ch === 'F') { lv.levers.push({ x: cx, y: cy, kind: ch === 'L' ? 'stop' : 'fast', cd: 0, anim: 0 }); inherit.push(id); }
      else if (ch === 'D') dtiles.push(id);
      else if (ch === 'p' || ch === 'u') lv.plates.push({ x: cx, y: cy, mode: ch === 'p' ? 'shade' : 'sun', on: false });
      T[id] = t;
    }
    // objects standing in a roofed area keep the roof over them
    for (const id of inherit) {
      const x = id % W, y = (id / W) | 0; let n = 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (nx >= 0 && ny >= 0 && nx < W && ny < H && T[ny * W + nx] === 3) n++;
      if (n >= 2) T[id] = 3;
    }
    // cogs block the tiles around them for path finding
    for (const c of lv.circles) if (c.kind === 'cog') {
      const x = Math.floor(c.x), y = Math.floor(c.y);
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (nx >= 0 && ny >= 0 && nx < W && ny < H) solid[ny * W + nx] = 1;
    }
    // overhead clock hands
    for (const h of def.hands || []) {
      const hx = h.at[0] + 0.5, hy = h.at[1] + 0.5;
      lv.hands.push({ x: hx, y: hy, len: h.len || 6, w: h.w || 0.8, back: h.back || 1, z: h.z || 2.2, a: (h.a || 0) * D2R, sp: (h.sp || 10) * D2R });
      lv.circles.push({ x: hx, y: hy, r: 0.42, h: (h.z || 2.2) + 0.2, kind: 'axle', vis: true }); solid[Math.floor(hy) * W + Math.floor(hx)] = 1;
    }
    // doors: touching D tiles form one door
    const isD = new Uint8Array(N); dtiles.forEach(id => isD[id] = 1);
    for (const id0 of dtiles) {
      if (doorAt[id0] >= 0) continue;
      const di = lv.doors.length, tiles = [], st = [id0]; doorAt[id0] = di;
      while (st.length) {
        const id = st.pop(); tiles.push(id); const x = id % W, y = (id / W) | 0;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const n = ny * W + nx;
          if (isD[n] && doorAt[n] < 0) { doorAt[n] = di; st.push(n); }
        }
      }
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (const id of tiles) { const x = id % W, y = (id / W) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1); }
      lv.doors.push({ tiles, x0, y0, x1, y1, open: 0, want: false, horiz: (x1 - x0) >= (y1 - y0), col: LINK_COLS[di % LINK_COLS.length], mode: 'shade' });
    }
    lv.plates.forEach((p, k) => { p.door = def.links ? def.links[k] : Math.min(k, lv.doors.length - 1); if (lv.doors[p.door]) lv.doors[p.door].mode = p.mode; });
    // merged wall rectangles (for shadow casting) and exposed wall edges (for the sun-side rim light)
    const used = new Uint8Array(N); lv.rects = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const id = y * W + x; if (!isWallT(T[id]) || used[id]) continue;
      let x2 = x; while (x2 + 1 < W && isWallT(T[y * W + x2 + 1]) && !used[y * W + x2 + 1]) x2++;
      let y2 = y;
      outer: while (y2 + 1 < H) { for (let k = x; k <= x2; k++) { const n = (y2 + 1) * W + k; if (!isWallT(T[n]) || used[n]) break outer; } y2++; }
      for (let yy = y; yy <= y2; yy++) for (let xx = x; xx <= x2; xx++) used[yy * W + xx] = 1;
      lv.rects.push({ x0: x, y0: y, x1: x2 + 1, y1: y2 + 1 });
    }
    lv.edges = [[], [], [], []]; lv.pitEdges = [];
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = T[y * W + x];
      if (isWallT(t)) {
        if (inb(x + 1, y) && !isWallT(T[y * W + x + 1])) lv.edges[0].push([x + 1, y, x + 1, y + 1]);
        if (inb(x, y + 1) && !isWallT(T[(y + 1) * W + x])) lv.edges[1].push([x, y + 1, x + 1, y + 1]);
        if (inb(x - 1, y) && !isWallT(T[y * W + x - 1])) lv.edges[2].push([x, y, x, y + 1]);
        if (inb(x, y - 1) && !isWallT(T[(y - 1) * W + x])) lv.edges[3].push([x, y, x + 1, y]);
      } else if (t === 2) {
        const chk = (nx, ny, seg, nrm) => { if (inb(nx, ny)) { const n = T[ny * W + nx]; if (n !== 2 && !isWallT(n)) lv.pitEdges.push({ seg, nrm }); } };
        chk(x + 1, y, [x + 1, y, x + 1, y + 1], [1, 0]); chk(x - 1, y, [x, y, x, y + 1], [-1, 0]);
        chk(x, y + 1, [x, y + 1, x + 1, y + 1], [0, 1]); chk(x, y - 1, [x, y, x + 1, y], [0, -1]);
      }
    }
    // paths for roofs and pits, plus decorative gears deep inside each chasm
    lv.roofPath = new Path2D(); lv.pitPath = new Path2D(); lv.pitGears = [];
    const R = rng(1000 + i * 77), seen = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const id = y * W + x;
      if (T[id] === 3) lv.roofPath.rect(x, y, 1, 1);
      if (T[id] === 2) {
        lv.pitPath.rect(x - 0.002, y - 0.002, 1.004, 1.004);
        if (!seen[id]) {
          const st = [id], cells = []; seen[id] = 1;
          while (st.length) { const c = st.pop(); cells.push(c); const cx = c % W, cy = (c / W) | 0; for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) if (inb(nx, ny) && T[ny * W + nx] === 2 && !seen[ny * W + nx]) { seen[ny * W + nx] = 1; st.push(ny * W + nx); } }
          const n = Math.max(1, Math.round(cells.length / 5));
          for (let k = 0; k < n; k++) { const c = cells[(R() * cells.length) | 0]; lv.pitGears.push({ x: c % W + 0.5, y: ((c / W) | 0) + 0.5, r: 0.8 + R() * 1.1, sp: (R() < 0.5 ? -1 : 1) * (0.15 + R() * 0.3), ph: R() * TAU, teeth: 8 + ((R() * 8) | 0) }); }
        }
      }
    }
    lv.guardDefs = def.guards || [];
    return lv;
  }

  // ------------------------------------------------------------------ world queries
  function tileAt(x, y) { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return 1; return L.T[ty * L.W + tx]; }
  function doorAtXY(x, y) { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return null; const d = L.doorAt[ty * L.W + tx]; return d >= 0 ? L.doors[d] : null; }
  function opaque(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return true;
    const id = ty * L.W + tx, t = L.T[id]; if (t === 1 || t === 4) return true;
    const d = L.doorAt[id]; return d >= 0 && L.doors[d].open < 0.5;
  }
  // Amanatides–Woo grid walk; returns the distance to the first opaque cell (or maxD)
  function rayGrid(ox, oy, dx, dy, maxD, fn) {
    let tx = Math.floor(ox), ty = Math.floor(oy);
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
    const tdx = dx !== 0 ? Math.abs(1 / dx) : Infinity, tdy = dy !== 0 ? Math.abs(1 / dy) : Infinity;
    let tmx = dx !== 0 ? (dx > 0 ? tx + 1 - ox : ox - tx) * tdx : Infinity;
    let tmy = dy !== 0 ? (dy > 0 ? ty + 1 - oy : oy - ty) * tdy : Infinity;
    for (let guard = 0; guard < 200; guard++) {
      let t;
      if (tmx < tmy) { t = tmx; tmx += tdx; tx += sx; } else { t = tmy; tmy += tdy; ty += sy; }
      if (t > maxD) return maxD;
      if (fn(tx, ty)) return t;
    }
    return maxD;
  }
  function rayCircle(ox, oy, dx, dy, cx, cy, r) {
    const fx = ox - cx, fy = oy - cy, b = fx * dx + fy * dy, c = fx * fx + fy * fy - r * r;
    if (c <= 0) return 0;
    const disc = b * b - c; if (disc < 0) return Infinity;
    const t = -b - Math.sqrt(disc); return t >= 0 ? t : Infinity;
  }
  function castVis(ox, oy, dx, dy, maxD) {
    let t = rayGrid(ox, oy, dx, dy, maxD, opaque);
    for (const c of L.circles) if (c.vis) { const u = rayCircle(ox, oy, dx, dy, c.x, c.y, c.r); if (u < t) t = u; }
    return t;
  }
  function losClear(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy); if (d < 1e-4) return true;
    return castVis(ax, ay, dx / d, dy / d, d) >= d - 1e-3;
  }
  function lightAt(x, y) {
    for (const g of G.guards) if (g.lantern) {
      const dx = x - g.lx, dy = y - g.ly; if (dx * dx + dy * dy < LANT_R * LANT_R * 0.85 && losClear(g.lx, g.ly, x, y)) return true;
    }
    for (const f of G.flares) {   // online: the Warden's flare burns the shade away for a moment
      const dx = x - f.x, dy = y - f.y, r = FLARE_R * flareK(f); if (dx * dx + dy * dy < r * r * 0.85 && losClear(f.x, f.y, x, y)) return true;
    }
    return false;
  }
  // is a floor point in shade? (walls, doors, pillars, spires, cogs and overhead hands all cast shadows away from the sun)
  function shadowAt(x, y) {
    const tx = Math.floor(x), ty = Math.floor(y);
    if ((G.lanterns || G.flares.length) && lightAt(x, y)) return false;
    if (tx >= 0 && ty >= 0 && tx < L.W && ty < L.H && L.T[ty * L.W + tx] === 3) return true;
    const k = L.def.k, sx = G.sx, sy = G.sy, lw = WALL_H * k;
    if (rayGrid(x, y, sx, sy, lw, opaque) < lw) return true;
    for (const c of L.circles) { if (rayCircle(x, y, sx, sy, c.x, c.y, c.r) <= c.h * k) return true; }
    for (const h of L.hands) {
      const z = h.z * k, qx = x + sx * z - h.x, qy = y + sy * z - h.y, ca = Math.cos(h.a), sa = Math.sin(h.a);
      const u = qx * ca + qy * sa, v = -qx * sa + qy * ca;
      if (u > -h.back && u < h.len && Math.abs(v) < h.w * 0.5 * (u > h.len - 0.9 ? (h.len - u) / 0.9 + 0.15 : 1)) return true;
    }
    return false;
  }
  const pitAt = (x, y) => tileAt(x, y) === 2;
  function bodySolid(tx, ty, ignorePits) {
    if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return true;
    const id = ty * L.W + tx, t = L.T[id];
    if (t === 1 || t === 4) return true;
    if (t === 2) return !ignorePits;
    const d = L.doorAt[id]; return d >= 0 && L.doors[d].open < 0.9;
  }
  function shadeSolid(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return true;
    const id = ty * L.W + tx; if (L.T[id] === 1) return true;
    const d = L.doorAt[id]; return d >= 0 && L.doors[d].open < 0.9;
  }
  function shadeOK(x, y) { const t = tileAt(x, y); return t === 2 || t === 3 || t === 4 || shadowAt(x, y); }
  function collideTiles(e, r, fn) {
    for (let it = 0; it < 3; it++) {
      const x0 = Math.floor(e.x - r), x1 = Math.floor(e.x + r), y0 = Math.floor(e.y - r), y1 = Math.floor(e.y + r);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        if (!fn(tx, ty)) continue;
        const cx = clamp(e.x, tx, tx + 1), cy = clamp(e.y, ty, ty + 1), dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
        if (d2 >= r * r) continue;
        if (d2 > 1e-10) { const d = Math.sqrt(d2); e.x += dx / d * (r - d); e.y += dy / d * (r - d); }
        else {
          const l = e.x - tx, rr = tx + 1 - e.x, u = e.y - ty, dn = ty + 1 - e.y, m = Math.min(l, rr, u, dn);
          if (m === l) e.x = tx - r; else if (m === rr) e.x = tx + 1 + r; else if (m === u) e.y = ty - r; else e.y = ty + 1 + r;
        }
      }
    }
  }
  function collideCircles(e, r, withGuards) {
    for (const c of L.circles) {
      const cr = (c.kind === 'cog' ? c.rt * 0.9 : c.r) + r, dx = e.x - c.x, dy = e.y - c.y, d = Math.hypot(dx, dy);
      if (d < cr) { if (d < 1e-6) { e.x += cr; continue; } e.x = c.x + dx / d * cr; e.y = c.y + dy / d * cr; }
    }
    if (withGuards) for (const g of G.guards) if (g.type === 'w') {
      const cr = 0.38 + r, dx = e.x - g.x, dy = e.y - g.y, d = Math.hypot(dx, dy);
      if (d < cr && d > 1e-6) { e.x = g.x + dx / d * cr; e.y = g.y + dy / d * cr; }
    }
  }

  // ------------------------------------------------------------------ path finding (A* on tiles, 8 directions, no corner cutting)
  function pathBlocked(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) return true;
    const id = ty * L.W + tx, t = L.T[id];
    if (t === 1 || t === 2 || t === 4 || L.solid[id]) return true;
    const d = L.doorAt[id]; return d >= 0 && L.doors[d].open < 0.9;
  }
  function nearestFree(tx, ty) {
    if (!pathBlocked(tx, ty)) return [tx, ty];
    for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (!pathBlocked(tx + dx, ty + dy)) return [tx + dx, ty + dy];
    }
    return null;
  }
  function findPath(sx, sy, gx, gy) {
    const W = L.W, H = L.H;
    const s = nearestFree(Math.floor(sx), Math.floor(sy)), g = nearestFree(Math.floor(gx), Math.floor(gy));
    if (!s || !g) return [];
    const exactGoal = g[0] === Math.floor(gx) && g[1] === Math.floor(gy);
    const si = s[1] * W + s[0], gi = g[1] * W + g[0];
    if (si === gi) return Math.hypot(gx - sx, gy - sy) > 0.02 ? [{ x: exactGoal ? gx : g[0] + 0.5, y: exactGoal ? gy : g[1] + 0.5 }] : [];
    const N = W * H, gs = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N), open = [si];
    gs[si] = 0;
    const hf = (i) => { const dx = Math.abs(i % W - g[0]), dy = Math.abs(((i / W) | 0) - g[1]); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    const fs = new Float32Array(N).fill(1e9); fs[si] = hf(si);
    let found = false;
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (fs[open[k]] < fs[open[bi]]) bi = k;
      const cur = open[bi]; open[bi] = open[open.length - 1]; open.pop();
      if (cur === gi) { found = true; break; }
      if (closed[cur]) continue; closed[cur] = 1;
      const cx = cur % W, cy = (cur / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy; if (pathBlocked(nx, ny)) continue;
        if (dx && dy && (pathBlocked(cx + dx, cy) || pathBlocked(cx, cy + dy))) continue;
        const ni = ny * W + nx; if (closed[ni]) continue;
        const ng = gs[cur] + (dx && dy ? 1.414 : 1);
        if (ng < gs[ni]) { gs[ni] = ng; came[ni] = cur; fs[ni] = ng + hf(ni); open.push(ni); }
      }
    }
    if (!found) return [];
    const out = []; let c = gi;
    while (c !== si && c >= 0) { out.push({ x: c % W + 0.5, y: ((c / W) | 0) + 0.5 }); c = came[c]; }
    out.reverse();
    if (exactGoal && out.length) out[out.length - 1] = { x: gx, y: gy };
    return out;
  }
  function randomNear(p, r) {
    for (let k = 0; k < 14; k++) {
      const x = Math.floor(p.x + (Math.random() * 2 - 1) * r), y = Math.floor(p.y + (Math.random() * 2 - 1) * r);
      if (!pathBlocked(x, y)) return { x: x + 0.5, y: y + 0.5 };
    }
    return null;
  }

  // ------------------------------------------------------------------ game state
  let mode = 'attract';   // attract | intro | play | pause | win | lose
  let screen = 'menu', screenBack = null;
  let curLevel = 0, attract = false;
  function mkGuard(d) {
    const type = d.t || 's';
    const g = {
      type, x: 0, y: 0, a: 0, wantA: 0, state: 'patrol', meter: 0, route: [], wps: [], wpi: 0, wdir: 1, waitT: 0, loop: !!d.loop,
      range: d.range || (type === 'w' ? 6.5 : type === 'l' ? 4.6 : 5.2), fov: (d.fov || (type === 'w' ? 52 : type === 'l' ? 84 : 72)) * D2R,
      speed: d.speed || (type === 'l' ? 1.3 : 1.5), lantern: type === 'l', lostT: 0, lookT: 0, lookBase: 0, target: null, lastSeen: null,
      repathT: 0, alId: -1, vis: true, sees: false, stepT: 0, bob: Math.random() * 6, key: Math.random() * 6, iconT: 0, lx: 0, ly: 0, light: null,
    };
    if (type === 'w') {
      g.x = d.at[0] + 0.5; g.y = d.at[1] + 0.5;
      if (d.spin) { g.sweep = { spin: d.spin * D2R }; g.a = (d.a0 || 0) * D2R; }
      else {
        const a0 = d.a[0] * D2R; let span = ((d.a[1] - d.a[0]) % 360 + 360) % 360 * D2R;
        g.sweep = { a0, span, sp: (d.sp || 25) * D2R, dir: 1, pause: d.pause != null ? d.pause : 0.8, pt: 0.5, u: 0 };
        g.a = a0;
      }
    } else {
      g.wps = d.p.map(p => ({ x: p[0] + 0.5, y: p[1] + 0.5, wait: p[2] != null ? p[2] : 0.6, look: p[3] != null ? p[3] * D2R : null }));
      g.x = g.wps[0].x; g.y = g.wps[0].y;
      g.a = d.a != null ? d.a * D2R : g.wps[0].look != null ? g.wps[0].look : g.wps.length > 1 ? Math.atan2(g.wps[1].y - g.y, g.wps[1].x - g.x) : 0;
      g.waitT = g.wps[0].wait;
    }
    g.wantA = g.a; g.lx = g.x; g.ly = g.y;
    return g;
  }
  function newState(isAttract) {
    attract = isAttract;
    G = {
      time: 0, sun: L.def.sun, sx: 0, sy: -1, freezeT: 0, boost: 0, gearTaken: false,
      body: isAttract ? null : { x: L.start.x, y: L.start.y, a: -Math.PI / 2, moving: false, stepT: 0, daze: 0, walk: 0 },
      weave: null, meter: 1, hidden: true, alarm: false, alarmed: false, alarmT: 0, lastKnown: null, lkId: 0, vigil: 1,
      guards: L.guardDefs.map(mkGuard), parts: [], rings: [], shake: 0, flash: 0, flashCol: '255,80,80', noiseCd: 0,
      overview: false, tipI: 0, tipT: 0, flags: {}, moved: 0, lockMsgT: 0, tickT: 0, tickHi: false, motes: [], polys: [], endT: 0,
      flares: [], flareCd: 0, spy: null, spyT: null, pings: [], lk: null,   // online only (empty in single-player)
    };
    G.lanterns = G.guards.some(g => g.lantern);
    for (const l of L.levers) { l.cd = 0; l.anim = 0; }
    for (const c of L.circles) c.rot = 0;
    L.hands.forEach((h, k) => { h.a = ((L.def.hands[k].a || 0) * D2R); });
    if (L.gear) L.gear.taken = false;
    const R = rng(L.i * 31 + 5);
    for (let k = 0; k < 46; k++) G.motes.push({ x: R() * L.W, y: R() * L.H, ph: R() * TAU, sp: 0.1 + R() * 0.25, s: 0.02 + R() * 0.035 });
    updateSun(0);
    for (const g of G.guards) updateLanternPos(g);
    updateDoors(0, true);
  }

  // ------------------------------------------------------------------ messages
  let toastT = 0, toastKey = '';
  function toast(key, vars, dur) {
    const el = $('toast'); el.textContent = t(key, vars); el.classList.add('on'); toastT = dur || 2.6; toastKey = key;
  }
  function puff(x, y, n, col, sp, life, size, add, grav) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * TAU, v = sp * (0.3 + Math.random() * 0.7);
      G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * (0.6 + Math.random() * 0.4), max: life, s: size * (0.6 + Math.random() * 0.6), col, add: !!add, g: grav || 0 });
    }
    if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
  }

  // ------------------------------------------------------------------ update
  function updateSun(dt) {
    let m = G.gearTaken ? 1.6 : 1;
    if (G.freezeT > 0) { G.freezeT = Math.max(0, G.freezeT - dt); m = 0; }
    let d = (attract ? 16 : L.def.w) * m * dt;
    if (G.boost > 0) { const b = Math.min(G.boost, 48 * dt); G.boost -= b; d += b; }
    G.sun = ((G.sun + d) % 360 + 360) % 360;
    const a = G.sun * D2R; G.sx = Math.sin(a); G.sy = -Math.cos(a);
    const rate = (m + (G.boost > 0 ? 6 : 0)) * dt;
    for (const c of L.circles) if (c.kind === 'cog') c.rot += c.spin * (L.def.cog || 0.6) * rate;
    L.hands.forEach(h => { h.a += h.sp * rate; });
  }
  function updateDoors(dt, init) {
    for (const p of L.plates) {
      const w = G.weave, shadeOn = !!(w && w.mode !== 'return' && Math.hypot(w.x - p.x, w.y - p.y) < 0.5);
      const sh = shadeOn || shadowAt(p.x, p.y), on = p.mode === 'shade' ? sh : !sh;
      if (shadeOn && p.mode === 'shade') G.flags.plate = true;
      if (on !== p.on) { p.on = on; if (!init) Snd.plate(); }
    }
    L.doors.forEach((d, i) => {
      const want = L.plates.some(p => p.door === i && p.on);
      if (init) { d.want = want; d.open = want ? 1 : 0; return; }
      if (want !== d.want) { d.want = want; Snd.door(); }
      let target = want ? 1 : 0;
      if (target < d.open && doorBlocked(d)) target = d.open;
      d.open = approach(d.open, target, dt * 1.7);
    });
  }
  function doorBlocked(d) {
    const ins = (e, r) => e.x + r > d.x0 && e.x - r < d.x1 && e.y + r > d.y0 && e.y - r < d.y1;
    if (G.body && ins(G.body, P_R)) return true;
    for (const g of G.guards) if (ins(g, 0.3)) return true;
    return false;
  }

  function readInput() {
    let x = 0, y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    if (joy.active) { x += joy.x; y += joy.y; }
    if (API.input) { x += API.input.x; y += API.input.y; }
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    return { x, y, m: Math.min(1, m) };
  }
  function turnTo(a, b, r) { const d = angDiff(a, b); return a + clamp(d, -r, r); }

  function updatePlayer(dt) {
    const b = G.body, w = G.weave, inp = readInput();
    if (b.daze > 0) b.daze -= dt;
    b.moving = false;
    if (w && w.mode === 'free') moveShade(inp, dt);
    else if (w && w.mode === 'return') {
      const dx = b.x - w.x, dy = b.y - w.y, d = Math.hypot(dx, dy), s = 16 * dt;
      if (d <= s + 0.05) { G.weave = null; puff(b.x, b.y, 10, '120,100,255', 1.5, 0.5, 0.08, true); }
      else { w.x += dx / d * s; w.y += dy / d * s; if (Math.random() < 0.6) puff(w.x, w.y, 1, '90,70,220', 0.4, 0.4, 0.08, true); }
    } else if (b.daze <= 0 && inp.m > 0.08) {
      const sp = P_SPEED * dt * Math.max(0.35, inp.m), steps = Math.max(1, Math.ceil(sp / 0.1));
      const ox0 = b.x, oy0 = b.y;
      for (let s = 0; s < steps; s++) {
        const ox = b.x, oy = b.y; b.x += inp.x / Math.max(inp.m, 1e-6) * sp / steps; b.y += inp.y / Math.max(inp.m, 1e-6) * sp / steps;
        resolveBody(ox, oy);
      }
      const moved = Math.hypot(b.x - ox0, b.y - oy0);
      G.moved += moved; b.walk += moved * 3.2; b.moving = moved > 0.002;
      b.a = turnTo(b.a, Math.atan2(inp.y, inp.x), 12 * dt);
      b.stepT -= moved; if (b.stepT <= 0) { b.stepT = 0.85; Snd.step(); if (!G.hidden) puff(b.x - Math.cos(b.a) * 0.15, b.y - Math.sin(b.a) * 0.15, 2, '235,200,140', 0.3, 0.45, 0.05); }
    }
    // bridge: walking onto the shadow end merges you with it
    if (G.weave && G.weave.mode === 'bridge' && Math.hypot(b.x - G.weave.x, b.y - G.weave.y) < 0.45) { G.weave = null; Snd.recall(); puff(b.x, b.y, 14, '140,120,255', 1.6, 0.6, 0.09, true); }
    // light meter
    const ww = G.weave;
    if (ww && ww.mode !== 'return') {
      ww.t += dt;
      if (ww.mode === 'free') { ww.exposed = !shadeOK(ww.x, ww.y); G.meter -= (ww.exposed ? DRAIN_LIT : DRAIN) * dt; if (ww.exposed && Math.random() < 0.5) puff(ww.x, ww.y, 1, '255,220,170', 0.6, 0.5, 0.06, true, -0.4); }
      else G.meter -= DRAIN_BRIDGE * dt;
      if (G.meter <= 0) { G.meter = 0; recall(true); b.daze = 0.6; toast('se_no_light'); Snd.drain(); }
    } else if (!ww) G.meter = Math.min(1, G.meter + (G.hidden ? REFILL : REFILL_LIT) * dt);
  }
  function resolveBody(ox, oy) {
    const b = G.body, w = G.weave; let ignorePits = false;
    if (w && w.mode === 'bridge') {
      const prev = segDist(ox, oy, w.A.x, w.A.y, w.x, w.y);
      if (prev.d <= BRIDGE_HW + 0.04) {
        const now = segDist(b.x, b.y, w.A.x, w.A.y, w.x, w.y);
        if (now.d > BRIDGE_HW && pitAt(b.x, b.y)) { const nx = (b.x - now.x) / now.d, ny = (b.y - now.y) / now.d; b.x = now.x + nx * BRIDGE_HW; b.y = now.y + ny * BRIDGE_HW; }
        ignorePits = segDist(b.x, b.y, w.A.x, w.A.y, w.x, w.y).d <= BRIDGE_HW + 0.04;
      }
    }
    collideTiles(b, P_R, (tx, ty) => bodySolid(tx, ty, ignorePits));
    collideCircles(b, P_R, true);
  }
  function moveShade(inp, dt) {
    const w = G.weave; if (inp.m < 0.08) { w.moving = false; return; }
    const sp = SH_SPEED * dt * Math.max(0.35, inp.m), steps = Math.max(1, Math.ceil(sp / 0.08)), ux = inp.x / inp.m, uy = inp.y / inp.m;
    const ox0 = w.x, oy0 = w.y;
    for (let s = 0; s < steps; s++) {
      const okNow = shadeOK(w.x, w.y);
      const tryMove = (dx, dy) => {
        const e = { x: w.x + dx, y: w.y + dy }; collideTiles(e, SH_R, shadeSolid); collideCircles(e, SH_R, false);
        if (!okNow || shadeOK(e.x, e.y)) { w.x = e.x; w.y = e.y; return true; } return false;
      };
      const dx = ux * sp / steps, dy = uy * sp / steps;
      if (!tryMove(dx, dy)) { if (!tryMove(dx, 0)) tryMove(0, dy); }
    }
    w.moving = Math.hypot(w.x - ox0, w.y - oy0) > 0.001;
    w.a = turnTo(w.a, Math.atan2(uy, ux), 14 * dt);
    if (w.moving && Math.random() < 0.35) puff(w.x - ux * 0.2, w.y - uy * 0.2, 1, '70,50,190', 0.25, 0.6, 0.1, false);
  }
  function startWeave() {
    if (mode !== 'play') return;
    if (G.weave) { recall(false); return; }
    if (G.body.daze > 0) return;
    if (G.meter < WEAVE_MIN) { toast('se_need_light'); Snd.deny(); return; }
    const b = G.body;
    G.weave = { x: b.x, y: b.y, a: b.a, mode: 'free', exposed: false, t: 0, moving: false };
    G.flags.weave = true; Snd.weave(); puff(b.x, b.y, 18, '110,90,255', 1.8, 0.7, 0.1, true);
  }
  function recall(forced) {
    const w = G.weave; if (!w || w.mode === 'return') return;
    if (w.mode === 'bridge') collapseBridge();
    w.mode = 'return'; G.flags.recall = true; if (!forced) Snd.recall();
  }
  function collapseBridge() {
    const b = G.body, w = G.weave;
    if (pitAt(b.x, b.y)) {
      const s = segDist(b.x, b.y, w.A.x, w.A.y, w.x, w.y), end = s.t < 0.5 ? w.A : { x: w.x, y: w.y };
      b.x = end.x; b.y = end.y; puff(b.x, b.y, 16, '140,120,255', 1.4, 0.6, 0.09, true); G.shake = Math.max(G.shake, 0.25);
    }
  }
  function action() {
    if (mode !== 'play') return;
    const w = G.weave;
    if (w && w.mode === 'free') { makeNoise(); return; }
    if (!w) { const l = nearLever(); if (l) pullLever(l); }
  }
  function makeNoise() {
    const w = G.weave;
    if (G.noiseCd > 0) return;
    if (G.meter < NOISE_COST * 0.5) { toast('se_need_light'); Snd.deny(); return; }
    G.meter = Math.max(0, G.meter - NOISE_COST); G.noiseCd = 0.7; G.flags.noise = true;
    G.rings.push({ x: w.x, y: w.y, t: 0 }); Snd.clank(); G.shake = Math.max(G.shake, 0.12);
    puff(w.x, w.y, 10, '255,230,170', 2.4, 0.4, 0.05, true);
    G.heard = false;
    for (const g of G.guards) {
      const d = Math.hypot(g.x - w.x, g.y - w.y), R = losClear(g.x, g.y, w.x, w.y) ? 6.8 : 5;
      if (d <= R) hearNoise(g, { x: w.x, y: w.y });
    }
    if (G.heard && netAuth()) netSend('ev', { k: 'hear', x: r2(w.x), y: r2(w.y) });   // the Warden only learns about noises a guard heard
  }
  function bridgeOK() {
    const w = G.weave, b = G.body; if (!w || w.mode !== 'free') return false;
    const len = Math.hypot(w.x - b.x, w.y - b.y); if (len < 0.8 || len > BRIDGE_MAX) return false;
    const tb = tileAt(w.x, w.y); if (tb !== 0 && tb !== 3) return false;
    const db = doorAtXY(w.x, w.y); if (db && db.open < 0.9) return false;
    let pit = false; const n = Math.ceil(len / 0.1);
    for (let k = 0; k <= n; k++) {
      const x = lerp(b.x, w.x, k / n), y = lerp(b.y, w.y, k / n), t = tileAt(x, y);
      if (t === 1 || t === 4) return false; if (t === 2) pit = true;
      const d = doorAtXY(x, y); if (d && d.open < 0.9) return false;
    }
    for (const c of L.circles) if (segDist(c.x, c.y, b.x, b.y, w.x, w.y).d < (c.kind === 'cog' ? c.rt : c.r) + 0.12) return false;
    return pit;
  }
  function tryBridge() {
    if (mode !== 'play') return;
    const w = G.weave; if (!w || w.mode !== 'free') return;
    if (!bridgeOK()) { toast('se_bridge_bad'); Snd.deny(); return; }
    w.mode = 'bridge'; w.A = { x: G.body.x, y: G.body.y }; G.flags.bridge = true; Snd.bridge();
    const n = 18; for (let k = 0; k <= n; k++) puff(lerp(w.A.x, w.x, k / n), lerp(w.A.y, w.y, k / n), 2, '150,130,255', 0.6, 0.7, 0.08, true);
  }
  function nearLever() { if (!G.body) return null; for (const l of L.levers) if (Math.hypot(l.x - G.body.x, l.y - G.body.y) < 1.0) return l; return null; }
  function pullLever(l) {
    if (l.cd > 0) { toast('se_lever_wait'); Snd.deny(); return; }
    l.cd = 12; l.anim = 1; G.flags.lever = true; Snd.lever(); G.shake = Math.max(G.shake, 0.2);
    if (l.kind === 'stop') { G.freezeT = 8; toast('se_lever_stop'); } else { G.boost += 90; toast('se_lever_fast'); }
    puff(l.x, l.y, 12, '255,200,90', 1.6, 0.5, 0.06, true);
  }

  // ---- guards
  function canSee(g) {
    const b = G.body, dx = b.x - g.x, dy = b.y - g.y, d = Math.hypot(dx, dy);
    const range = g.range * (G.alarm ? 1.25 : G.vigil);
    if (d > range) return false;
    if (d > 0.8 && Math.abs(angDiff(g.a, Math.atan2(dy, dx))) > g.fov * 0.5 * (G.alarm ? 1.25 : 1)) return false;
    if (!losClear(g.x, g.y, b.x, b.y)) return false;
    if (G.hidden && d > 1.15) return false;
    return true;
  }
  function updateLanternPos(g) { if (g.lantern) { g.lx = g.x + Math.cos(g.a) * 0.42; g.ly = g.y + Math.sin(g.a) * 0.42; } }
  function moveAlong(g, sp, dt) {
    let moved = false; const dt0 = dt;
    while (g.route.length && dt > 1e-6) {
      const p = g.route[0], dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy);
      if (d < 1e-3) { g.route.shift(); continue; }
      if (pathBlocked(Math.floor(p.x), Math.floor(p.y))) { g.route = []; g.waitT = Math.max(g.waitT, 0.8); break; }
      g.wantA = Math.atan2(dy, dx); moved = true;
      const step = sp * dt;
      if (step >= d) { g.x = p.x; g.y = p.y; g.route.shift(); dt -= d / sp; } else { g.x += dx / d * step; g.y += dy / d * step; dt = 0; }
    }
    if (moved) g.bob += sp * dt0 * 7;
    return moved;
  }
  function setSuspicious(g) {
    g.state = 'suspicious'; if (!g.ctl) g.route = []; g.lostT = 0; g.iconT = 0; if (g.vis) Snd.sus();
    if (netAuth()) netSend('ev', { k: 'spot', g: G.guards.indexOf(g), x: r2(G.body.x), y: r2(G.body.y) });
  }
  function goSearch(g, p) {
    g.target = { x: p.x, y: p.y }; g.iconT = 0;
    if (g.type === 'w') { g.state = 'search'; g.lookT = 3.5; return; }
    g.route = findPath(g.x, g.y, p.x, p.y);
    if (!g.route.length) { g.state = 'look'; g.lookT = 3; g.lookBase = Math.atan2(p.y - g.y, p.x - g.x); }
    else g.state = 'search';
  }
  function goReturn(g) {
    if (g.type === 'w') { g.state = 'patrol'; return; }
    const t = g.wps[g.wpi]; g.route = findPath(g.x, g.y, t.x, t.y); g.state = 'return';
  }
  function hearNoise(g, p) {
    G.heard = true;
    if (G.alarm) { G.lastKnown = { x: p.x, y: p.y }; G.lkId++; return; }
    if (g.ctl) return;   // a guard the Warden commands only reports the noise — the Warden decides
    if (g.state === 'suspicious' && g.meter > 0.5) return;
    goSearch(g, p); if (g.vis) Snd.sus();
  }
  function raiseAlarm() {
    if (!G.alarm) { G.alarm = true; G.alarmed = true; Snd.alarm(); G.shake = Math.max(G.shake, 0.45); G.flash = 0.35; G.flashCol = '255,60,60'; toast('se_alarm', null, 3); if (netAuth()) netSend('ev', { k: 'alarm' }); }
    G.alarmT = ALARM_TIME; G.lastKnown = { x: G.body.x, y: G.body.y }; G.lkId++;
    for (const o of G.guards) { o.meter = Math.max(o.meter, 0.6); o.iconT = 0; if (o.ctl) continue; o.state = 'alarm'; o.route = []; o.repathT = 0; o.alId = -1; o.lookT = 0; }
  }
  function calmDown() {
    G.alarm = false; G.vigil = 1.15; toast('se_calm'); if (netAuth()) netSend('ev', { k: 'calm' });
    for (const g of G.guards) { g.meter = 0; if (!g.ctl) goReturn(g); }
  }
  // ---- online: guards the Warden commands (only one at a time; the rest keep their own AI)
  const sanctD = (x, y) => Math.min(L.exit ? Math.hypot(x - L.exit.x, y - L.exit.y) : 99, Math.hypot(x - L.start.x, y - L.start.y));
  function toHold(g) { const c = g.ctl; c.k = 'hold'; c.ht = 0; c.ha = g.type === 'w' ? g.wantA : g.a; g.route = []; }
  function release(g, auto) {
    if (!g.ctl) return; g.ctl = null; g.lostT = 0;
    if (G.alarm) { g.state = 'alarm'; g.route = []; g.repathT = 0; g.alId = -1; g.lookT = 0; }
    else { g.meter = Math.min(g.meter, 0.5); goReturn(g); }
    if (auto && netAuth()) netSend('ev', { k: 'free', g: G.guards.indexOf(g) });
  }
  function steerGuard(g, c, dt) {
    const m = Math.hypot(c.sx, c.sy), ux = c.sx / m, uy = c.sy / m, sp = CMD_SP * (g.lantern ? 0.9 : 1) * Math.min(1, m) * dt;
    const ox = g.x, oy = g.y, d0 = sanctD(ox, oy), n = Math.max(1, Math.ceil(sp / 0.1));
    for (let k = 0; k < n; k++) { g.x += ux * sp / n; g.y += uy * sp / n; collideTiles(g, 0.3, (tx, ty) => bodySolid(tx, ty, false)); collideCircles(g, 0.3, false); }
    const d1 = sanctD(g.x, g.y); if (d1 < SANCT_R && d1 < d0) { g.x = ox; g.y = oy; }   // no camping the start or the exit
    g.wantA = Math.atan2(uy, ux); g.bob += Math.hypot(g.x - ox, g.y - oy) * 7; g.route = [];
  }
  function ctlBrain(g, dt) {
    if (g.state === 'suspicious') { if (!g.sees) { g.lostT += dt; if (g.lostT > 1.1) g.state = 'ctl'; } } else g.state = 'ctl';
    const c = g.ctl;
    if (c.k === 'steer') {
      if (G.time - c.st > 0.45 || Math.hypot(c.sx, c.sy) < 0.1) toHold(g);
      else if (g.type === 'w') g.wantA = Math.atan2(c.sy, c.sx);
      else steerGuard(g, c, dt);
    } else if (c.k === 'go') {
      if (g.type === 'w') { g.wantA = Math.atan2(c.ty - g.y, c.tx - g.x); if (Math.abs(angDiff(g.a, g.wantA)) < 0.06) toHold(g); }
      else if (g.route.length) moveAlong(g, CMD_SP * (g.lantern ? 0.9 : 1), dt);
      else toHold(g);
    }
    if (c.k === 'hold') {
      c.ht += dt; g.wantA = g.type === 'w' ? c.ha : c.ha + Math.sin(c.ht * 1.6) * 0.8;
      if (c.ht > HOLD_MAX) release(g, true);
    }
  }
  function onCmd(p) {
    if (!G || !G.body || mode !== 'play') return;
    if (p.k === 'flare') { spawnFlare(+p.x, +p.y); return; }
    const g = G.guards[p.g | 0]; if (!g) return;
    if (p.k === 'rel') { release(g); return; }
    for (const o of G.guards) if (o !== g && o.ctl) release(o);   // one commanded guard at a time
    const blank = { k: 'hold', tx: 0, ty: 0, sx: 0, sy: 0, st: 0, ht: 0, ha: g.a };
    if (p.k === 'go') {
      const x = clamp(+p.x || 0, 0.3, L.W - 0.3), y = clamp(+p.y || 0, 0.3, L.H - 0.3);
      if (g.type !== 'w' && sanctD(x, y) < SANCT_R) return;   // a standing watcher may look anywhere, but nobody walks into the start or exit zone
      if (g.type === 'w') { g.ctl = Object.assign(blank, { k: 'go', tx: x, ty: y }); g.state = 'ctl'; return; }
      const r = findPath(g.x, g.y, x, y); if (!r.length) return;
      const e = r[r.length - 1]; if (sanctD(e.x, e.y) < SANCT_R) return;
      g.route = r; g.ctl = Object.assign(blank, { k: 'go', tx: e.x, ty: e.y }); g.state = 'ctl';
    } else if (p.k === 'steer') {
      if (!g.ctl || g.ctl.k !== 'steer') { g.ctl = Object.assign(blank, { k: 'steer' }); g.route = []; g.state = 'ctl'; }
      g.ctl.sx = clamp(+p.x || 0, -1, 1); g.ctl.sy = clamp(+p.y || 0, -1, 1); g.ctl.st = G.time;
    }
  }
  function spawnFlare(x, y) {
    if (G.flareCd > 0 || !(x >= 0 && y >= 0 && x < L.W && y < L.H)) return;
    G.flares.push({ x, y, t: 0 }); G.flareCd = FLARE_CD;
    Snd.clank(); puff(x, y, 26, '255,170,80', 2.6, 0.8, 0.08, true); G.flash = 0.12; G.flashCol = '255,180,90';
    if (NET.role === 'inf') toast('se_flare_inf', null, 2.4);
  }
  function patrol(g, dt) {
    if (g.waitT > 0) {
      g.waitT -= dt; const wp = g.wps[g.wpi]; if (wp && wp.look != null) g.wantA = wp.look;
      if (g.waitT <= 0) {
        if (g.wps.length > 1) {
          if (g.loop) g.wpi = (g.wpi + 1) % g.wps.length;
          else { if (g.wpi + g.wdir >= g.wps.length || g.wpi + g.wdir < 0) g.wdir *= -1; g.wpi += g.wdir; }
        }
        const t = g.wps[g.wpi]; g.route = findPath(g.x, g.y, t.x, t.y);
        if (!g.route.length) g.waitT = Math.max(0.3, t.wait);
      }
      return;
    }
    if (g.route.length) moveAlong(g, g.speed, dt);
    else g.waitT = Math.max(0.05, g.wps[g.wpi].wait);
  }
  function watcherBrain(g, dt) {
    if (G.alarm && G.lastKnown) {
      const base = Math.atan2(G.lastKnown.y - g.y, G.lastKnown.x - g.x);
      g.wantA = g.sees ? base : base + Math.sin(G.time * 2.4) * 0.9; return;
    }
    if (g.state === 'suspicious') {
      g.wantA = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
      if (!g.sees) { g.lostT += dt; if (g.lostT > 1.6) goSearch(g, g.lastSeen); }
      return;
    }
    if (g.state === 'search') {
      g.lookT -= dt; g.wantA = Math.atan2(g.target.y - g.y, g.target.x - g.x) + Math.sin(g.lookT * 2.5) * 0.35;
      if (g.lookT <= 0) { g.state = 'patrol'; if (g.sweep.spin == null) { /* resume sweep where it points */ } }
      return;
    }
    const s = g.sweep;
    if (s.spin) { g.a += s.spin * dt; g.wantA = g.a; return; }
    if (s.pt > 0) s.pt -= dt;
    else {
      s.u += s.dir * s.sp * dt / Math.max(0.01, s.span);
      if (s.u >= 1) { s.u = 1; s.dir = -1; s.pt = s.pause; } else if (s.u <= 0) { s.u = 0; s.dir = 1; s.pt = s.pause; }
    }
    g.wantA = s.a0 + s.span * s.u;
  }
  function alarmBrain(g, dt) {
    const tgt = G.lastKnown; if (!tgt) return;
    g.repathT -= dt;
    if ((g.sees && g.repathT <= 0) || (g.alId !== G.lkId && g.repathT <= 0)) { g.alId = G.lkId; g.route = findPath(g.x, g.y, tgt.x, tgt.y); g.repathT = 0.4; g.lookT = 0; }
    if (g.route.length) { moveAlong(g, 2.85, dt); return; }
    if (g.lookT <= 0) { g.lookT = 1.6; g.lookBase = g.a; }
    g.lookT -= dt; g.wantA = g.lookBase + Math.sin((1.6 - g.lookT) * 3) * 1.5;
    if (g.lookT <= 0.02) { const p = randomNear(tgt, 3.5); if (p) g.route = findPath(g.x, g.y, p.x, p.y); g.lookT = 0; }
  }
  function guardBrain(g, dt) {
    if (g.ctl) return ctlBrain(g, dt);
    if (g.type === 'w') return watcherBrain(g, dt);
    switch (g.state) {
      case 'patrol': patrol(g, dt); break;
      case 'suspicious':
        if (g.lastSeen) g.wantA = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
        if (!g.sees) { g.lostT += dt; if (g.lostT > 1.1) goSearch(g, g.lastSeen); }
        break;
      case 'search':
        if (g.route.length) moveAlong(g, 2.0, dt); else { g.state = 'look'; g.lookT = 3.2; g.lookBase = g.a; }
        break;
      case 'look':
        g.lookT -= dt; g.wantA = g.lookBase + Math.sin((3.2 - g.lookT) * 2.0) * 1.7;
        if (g.lookT <= 0) goReturn(g);
        break;
      case 'return':
        if (g.route.length) moveAlong(g, g.speed, dt); else { g.state = 'patrol'; g.waitT = 0.3; }
        break;
      case 'alarm': alarmBrain(g, dt); break;
    }
  }
  function updateGuards(dt) {
    let anySees = false;
    for (const g of G.guards) {
      const sees = !!(G.body && canSee(g)); g.sees = sees;
      if (sees) {
        anySees = true;
        const d = Math.hypot(g.x - G.body.x, g.y - G.body.y);
        let rate = (L.def.det || 1) * (0.55 + 1.5 * (1 - d / g.range));
        if (d < 1.3) rate = 4; if (G.alarm) rate = 6;
        g.meter = Math.min(1, g.meter + rate * dt);
        g.lastSeen = { x: G.body.x, y: G.body.y }; g.lostT = 0;
        if (G.alarm) { G.lastKnown = { x: G.body.x, y: G.body.y }; G.alarmT = ALARM_TIME; if (g.alId === G.lkId) g.alId = -2; G.lkId++; }
        else if (g.meter >= 1) raiseAlarm();
        else if (g.meter > 0.12 && g.state !== 'suspicious') setSuspicious(g);
      } else g.meter = Math.max(0, g.meter - 0.32 * dt);
      guardBrain(g, dt);
      const tr = (g.type === 'w' ? 3.2 : 5.5) * dt;
      if (!(g.type === 'w' && g.sweep.spin && g.state === 'patrol' && !G.alarm)) g.a = turnTo(g.a, g.wantA, tr);
      updateLanternPos(g);
      g.iconT += dt;
      if (g.type !== 'w' && g.route.length && g.vis && G.body && Math.hypot(g.x - G.body.x, g.y - G.body.y) < 7) {
        g.stepT -= dt; if (g.stepT <= 0) { g.stepT = 0.42; Snd.gstep(); }
      }
      if (G.body && g.type !== 'w' && Math.hypot(g.x - G.body.x, g.y - G.body.y) < 0.62) { lose(g); return; }
    }
    if (G.alarm && !anySees) { G.alarmT -= dt; if (G.alarmT <= 0) calmDown(); }
  }

  function updateTips(dt) {
    const tips = L.def.tips || [];
    if (G.tipI >= tips.length) { setTip(''); return; }
    const [key, cond] = tips[G.tipI]; G.tipT += dt;
    const tk = isTouch && STR_HAS(key + '_t') ? key + '_t' : key;
    setTip(tk);
    let done;
    if (cond[0] === 't') done = G.tipT > parseFloat(cond.slice(1));
    else if (cond === 'move') done = G.moved > 2.5;
    else done = !!G.flags[cond];
    if (done && G.tipT > 1.2) { G.tipI++; G.tipT = 0; }
  }
  const STR_HAS = (k) => { const v = t(k); return v !== k && v.toLowerCase() !== k.toLowerCase(); };
  let tipShown = null;
  function setTip(k) {
    if (k === tipShown) return; tipShown = k; const el = $('tip');
    if (!k) { el.hidden = true; return; } el.hidden = false; el.textContent = t(k);
  }

  // standing in shade — or walking on your own woven-shadow bridge — keeps you hidden
  function bodyHidden() {
    const b = G.body, w = G.weave;
    if (w && w.mode === 'bridge' && pitAt(b.x, b.y) && segDist(b.x, b.y, w.A.x, w.A.y, w.x, w.y).d <= BRIDGE_HW + 0.05) return true;
    return shadowAt(b.x, b.y);
  }
  function update(dt) {
    G.time += dt;
    updateSun(dt);
    updateDoors(dt);
    if (G.flares.length || G.flareCd > 0) { G.flareCd = Math.max(0, G.flareCd - dt); for (let k = G.flares.length - 1; k >= 0; k--) if ((G.flares[k].t += dt) > FLARE_T) G.flares.splice(k, 1); }
    if (G.body) {
      G.hidden = bodyHidden();
      updatePlayer(dt);
      G.hidden = bodyHidden();
    }
    updateGuards(dt);
    if (mode !== 'play' && !attract) return;
    G.noiseCd = Math.max(0, G.noiseCd - dt); G.lockMsgT = Math.max(0, G.lockMsgT - dt);
    for (const l of L.levers) { l.cd = Math.max(0, l.cd - dt); l.anim = Math.max(0, l.anim - dt * 1.4); }
    if (G.body) {
      const b = G.body;
      if (L.gear && !G.gearTaken && Math.hypot(b.x - L.gear.x, b.y - L.gear.y) < 0.62) {
        G.gearTaken = true; G.flags.gear = true; Snd.pickup(); toast('se_gear_got', null, 3.2); G.shake = 0.3; G.flash = 0.3; G.flashCol = '255,200,80';
        puff(L.gear.x, L.gear.y, 40, '255,200,80', 3.2, 0.9, 0.08, true); updateHUD(true);
      }
      if (L.exit && Math.hypot(b.x - L.exit.x, b.y - L.exit.y) < 0.5) {
        if (L.gear && !G.gearTaken) { if (G.lockMsgT <= 0) { toast('se_locked'); Snd.deny(); G.lockMsgT = 3; } }
        else { win(); return; }
      }
      updateTips(dt);
    }
    // clock ticking: faster while the clock races, silent while it is stopped
    if (G.freezeT <= 0 && !attract) {
      G.tickT -= dt * (G.boost > 0 ? 4 : G.gearTaken ? 1.6 : 1);
      if (G.tickT <= 0) { G.tickT = 0.5; G.tickHi = !G.tickHi; Snd.tick(G.tickHi); }
    }
  }
  function updateFx(dt) {
    for (let k = G.parts.length - 1; k >= 0; k--) {
      const p = G.parts[k]; p.life -= dt; if (p.life <= 0) { G.parts.splice(k, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) + p.g * dt;
    }
    for (let k = G.rings.length - 1; k >= 0; k--) { G.rings[k].t += dt; if (G.rings[k].t > 1.1) G.rings.splice(k, 1); }
    G.shake = Math.max(0, G.shake - dt * 1.4); G.flash = Math.max(0, G.flash - dt);
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
  }

  // ------------------------------------------------------------------ results
  function win() {
    if (mode !== 'play') return;
    mode = 'win'; G.endT = 0;
    if (netAuth()) {   // online: the Infiltrator escaped
      Snd.win(); G.flash = 0.4; G.flashCol = '255,220,140'; puff(L.exit.x, L.exit.y, 50, '120,255,190', 3, 1.2, 0.09, true);
      netEnd('esc'); return;
    }
    const i = curLevel, time = G.time, par = L.def.par || 60, ghost = !G.alarmed, fast = time <= par;
    const prev = PROG.b[i] || {}, newBest = !prev.t || time < prev.t;
    PROG.b[i] = { d: 1, g: prev.g || ghost ? 1 : 0, f: prev.f || fast ? 1 : 0, t: Math.round(Math.min(prev.t || 1e9, time) * 10) / 10 };
    PROG.u = clamp(Math.max(PROG.u, i + 2), 1, LEVELS.length);
    saveProg();
    G.result = { time, ghost, fast, newBest: newBest && !!prev.t, best: PROG.b[i].t };
    Snd.win(); G.flash = 0.4; G.flashCol = '255,220,140';
    puff(L.exit.x, L.exit.y, 50, '120,255,190', 3, 1.2, 0.09, true);
    puff(L.exit.x, L.exit.y, 30, '255,210,110', 2.2, 1.2, 0.07, true);
    setTimeout(() => { if (mode === 'win') showScreen('win'); }, 900);
  }
  function lose(g) {
    if (mode !== 'play') return;
    mode = 'lose'; Snd.caught(); G.shake = 0.6; G.flash = 0.5; G.flashCol = '255,40,40';
    if (G.body) puff(G.body.x, G.body.y, 26, '255,90,90', 2.4, 0.8, 0.08, true);
    if (g) { g.wantA = Math.atan2(G.body.y - g.y, G.body.x - g.x); g.state = 'alarm'; }
    if (netAuth()) { netEnd('caught'); return; }   // online: the Warden wins
    setTimeout(() => { if (mode === 'lose') showScreen('lose'); }, 1000);
  }
  function starsOf(i) { const b = PROG.b[i]; return b ? (b.d ? 1 : 0) + (b.g ? 1 : 0) + (b.f ? 1 : 0) : 0; }
  function totalStars() { let n = 0; for (let i = 0; i < LEVELS.length; i++) n += starsOf(i); return n; }

  // ------------------------------------------------------------------ canvas & camera
  const cvs = $('c'), ctx = cvs.getContext('2d');
  const smask = document.createElement('canvas'), sctx = smask.getContext('2d');
  const fogc = document.createElement('canvas'), fctx = fogc.getContext('2d');
  const floorC = document.createElement('canvas'), wallC = document.createElement('canvas');
  const dial = $('dial'), dctx = dial.getContext('2d');
  let VW = 800, VH = 600, DPR = 1, staticRes = 0, staticFor = null, isTouch = false;
  const cam = { x: 10, y: 6, s: 40, sx: 0, sy: 0 };
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    VW = Math.max(1, window.innerWidth); VH = Math.max(1, window.innerHeight);
    cvs.width = Math.round(VW * DPR); cvs.height = Math.round(VH * DPR);
    smask.width = Math.ceil(cvs.width / 2); smask.height = Math.ceil(cvs.height / 2);
    fogc.width = smask.width; fogc.height = smask.height;
    const ds = dial.getBoundingClientRect().width || 104; dial.width = Math.round(ds * DPR); dial.height = Math.round(ds * DPR);
    staticFor = null;
    if (L) camUpdate(1, true);
  }
  const topInset = () => (VW <= 700 || VH <= 520) ? 48 : 56;
  function camTarget() {
    const top = topInset(), side = VW >= 900 && VW / VH > 1.25 ? 124 : VW >= 700 ? 70 : 6, availW = VW - side * 2, availH = VH - top - 8;
    const fit = Math.min(availW / L.W, availH / L.H);
    const minS = isTouch ? 34 : 28;
    let s, x, y;
    const centerY = (sc) => L.H / 2 - (top + availH / 2 - VH / 2) / sc;
    const wsel = isWarden() && NET.sel >= 0 ? G.guards[NET.sel] : null;   // the Warden's camera follows the selected guard on small screens
    if (attract || G.overview || fit >= minS || (!G.body && !wsel)) { s = attract ? fit * 1.02 : fit; x = L.W / 2; y = centerY(s); }
    else {
      s = minS;
      const f = wsel || (G.weave && G.weave.mode === 'free' ? G.weave : G.body);
      const hw = VW / 2 / s, hhTop = (VH / 2 - top) / s, hhBot = VH / 2 / s;
      x = L.W <= 2 * hw - 1 ? L.W / 2 : clamp(f.x, hw - 0.5, L.W - hw + 0.5);
      y = L.H <= (hhTop + hhBot) - 1 ? centerY(s) : clamp(f.y, hhTop - 0.5, L.H - hhBot + 0.5);
    }
    return { s, x, y, fit, minS };
  }
  function camUpdate(dt, snap) {
    const tg = camTarget(), k = snap ? 1 : 1 - Math.exp(-7 * dt);
    cam.s = lerp(cam.s, tg.s, k); cam.x = lerp(cam.x, tg.x, k); cam.y = lerp(cam.y, tg.y, k);
    const sh = G ? G.shake : 0; cam.sx = (Math.random() * 2 - 1) * sh * 0.4; cam.sy = (Math.random() * 2 - 1) * sh * 0.4;
    const want = clamp(Math.round(Math.max(tg.fit, tg.minS) * DPR * 1.1 / 8) * 8, 24, 96);
    if (staticFor !== L || Math.abs(want - staticRes) / staticRes > 0.3) buildStatic(want);
  }
  function setWT(c, scale) {
    const s = cam.s * scale;
    c.setTransform(s, 0, 0, s, (VW / 2 - (cam.x + cam.sx) * cam.s) * scale, (VH / 2 - (cam.y + cam.sy) * cam.s) * scale);
  }
  const w2s = (x, y) => [(x - cam.x - cam.sx) * cam.s + VW / 2, (y - cam.y - cam.sy) * cam.s + VH / 2];

  // ------------------------------------------------------------------ static art (floor + walls)
  function gearPath(c, x, y, r, teeth, rot, depth) {
    const n = teeth * 4; c.moveTo(x + Math.cos(rot) * r, y + Math.sin(rot) * r);
    for (let k = 0; k <= n; k++) {
      const a = rot + k / n * TAU, q = k % 4, rr = q === 1 || q === 2 ? r : r - depth;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function buildStatic(res) {
    staticRes = res; staticFor = L;
    const W = L.W, H = L.H, R = res, T = L.T, rnd = rng(L.i * 991 + 13);
    floorC.width = W * R; floorC.height = H * R; wallC.width = W * R; wallC.height = H * R;
    const f = floorC.getContext('2d'); f.setTransform(R, 0, 0, R, 0, 0);
    // brass floor
    const bg = f.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#cf9f58'); bg.addColorStop(0.5, '#c08f4c'); bg.addColorStop(1, '#a97b3f');
    f.fillStyle = bg; f.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = rnd(); f.fillStyle = v < 0.5 ? `rgba(255,236,190,${v * 0.12})` : `rgba(70,38,8,${(v - 0.5) * 0.14})`; f.fillRect(x, y, 1, 1);
      if (((x >> 1) + (y >> 1)) % 2 === 0) { f.fillStyle = 'rgba(255,240,200,0.035)'; f.fillRect(x, y, 1, 1); }
    }
    // plate seams and rivets (2x2 plates)
    f.lineWidth = 1.2 / R; f.strokeStyle = 'rgba(70,40,10,0.42)';
    f.beginPath(); for (let x = 0; x <= W; x += 2) { f.moveTo(x, 0); f.lineTo(x, H); } for (let y = 0; y <= H; y += 2) { f.moveTo(0, y); f.lineTo(W, y); } f.stroke();
    f.strokeStyle = 'rgba(255,235,190,0.18)'; f.beginPath(); for (let x = 0; x <= W; x += 2) { f.moveTo(x + 1.2 / R, 0); f.lineTo(x + 1.2 / R, H); } for (let y = 0; y <= H; y += 2) { f.moveTo(0, y + 1.2 / R); f.lineTo(W, y + 1.2 / R); } f.stroke();
    f.lineWidth = 0.6 / R; f.strokeStyle = 'rgba(70,40,10,0.18)';
    f.beginPath(); for (let x = 1; x <= W; x += 2) { f.moveTo(x, 0); f.lineTo(x, H); } for (let y = 1; y <= H; y += 2) { f.moveTo(0, y); f.lineTo(W, y); } f.stroke();
    for (let y = 0; y <= H; y += 2) for (let x = 0; x <= W; x += 2) for (const [ox, oy] of [[0.18, 0.18], [1.82, 0.18], [0.18, 1.82], [1.82, 1.82]]) {
      f.fillStyle = 'rgba(80,45,12,0.5)'; f.beginPath(); f.arc(x + ox, y + oy, 0.055, 0, TAU); f.fill();
      f.fillStyle = 'rgba(255,240,200,0.45)'; f.beginPath(); f.arc(x + ox - 0.015, y + oy - 0.015, 0.025, 0, TAU); f.fill();
    }
    // the clock face engraving
    const cx = W / 2, cy = H / 2, outer = Math.min(W, H) / 2 - 0.7;
    const ring = (r, lw, a) => { f.lineWidth = lw; f.strokeStyle = `rgba(90,50,12,${a})`; f.beginPath(); f.arc(cx, cy, r, 0, TAU); f.stroke(); f.strokeStyle = `rgba(255,236,190,${a * 0.6})`; f.lineWidth = lw * 0.5; f.beginPath(); f.arc(cx + 0.03, cy + 0.03, r, 0, TAU); f.stroke(); };
    ring(outer, 0.08, 0.38); ring(outer - 0.9, 0.04, 0.3); ring(outer * 0.42, 0.06, 0.3); ring(outer * 0.18, 0.05, 0.28);
    for (let k = 0; k < 60; k++) {
      const a = k / 60 * TAU - Math.PI / 2, l = k % 5 === 0 ? 0.55 : 0.22;
      f.lineWidth = k % 5 === 0 ? 0.07 : 0.035; f.strokeStyle = 'rgba(90,50,12,0.36)';
      f.beginPath(); f.moveTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer); f.lineTo(cx + Math.cos(a) * (outer - l), cy + Math.sin(a) * (outer - l)); f.stroke();
    }
    f.save(); f.setTransform(1, 0, 0, 1, 0, 0);
    f.font = `700 ${Math.round(R * 0.55)}px Georgia, 'Times New Roman', serif`; f.textAlign = 'center'; f.textBaseline = 'middle';
    const NUM = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU - Math.PI / 2, rr = outer - 1.35, px = (cx + Math.cos(a) * rr) * R, py = (cy + Math.sin(a) * rr) * R;
      f.fillStyle = 'rgba(255,236,190,0.28)'; f.fillText(NUM[k], px + 1.5, py + 1.5);
      f.fillStyle = 'rgba(90,50,12,0.42)'; f.fillText(NUM[k], px, py);
    }
    f.restore();
    // a sun emblem in the middle of the face
    f.strokeStyle = 'rgba(90,50,12,0.3)'; f.lineWidth = 0.05;
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; f.beginPath(); f.moveTo(cx + Math.cos(a) * outer * 0.2, cy + Math.sin(a) * outer * 0.2); f.lineTo(cx + Math.cos(a) * outer * (k % 2 ? 0.3 : 0.38), cy + Math.sin(a) * outer * (k % 2 ? 0.3 : 0.38)); f.stroke(); }
    // roofed floor: dark grates
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (T[y * W + x] === 3) {
      f.fillStyle = 'rgba(40,22,6,0.42)'; f.fillRect(x, y, 1, 1);
      f.strokeStyle = 'rgba(25,12,2,0.55)'; f.lineWidth = 0.07; f.beginPath();
      for (let k = 1; k < 5; k++) { f.moveTo(x + k / 5, y + 0.06); f.lineTo(x + k / 5, y + 0.94); } f.stroke();
      f.strokeStyle = 'rgba(255,220,160,0.12)'; f.lineWidth = 0.03; f.beginPath(); for (let k = 1; k < 5; k++) { f.moveTo(x + k / 5 + 0.04, y + 0.06); f.lineTo(x + k / 5 + 0.04, y + 0.94); } f.stroke();
    }
    // ambient occlusion along walls
    const ao = (x, y, dx, dy) => {
      const g = f.createLinearGradient(x + (dx < 0 ? 1 : 0), y + (dy < 0 ? 1 : 0), x + (dx < 0 ? 1 : 0) + dx * 0.45, y + (dy < 0 ? 1 : 0) + dy * 0.45);
      g.addColorStop(0, 'rgba(40,20,4,0.42)'); g.addColorStop(1, 'rgba(40,20,4,0)'); f.fillStyle = g;
      if (dx) f.fillRect(dx > 0 ? x : x + 0.55, y, 0.45, 1); else f.fillRect(x, dy > 0 ? y : y + 0.55, 1, 0.45);
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = T[y * W + x]; if (isWallT(t) || t === 2) continue;
      const wl = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && isWallT(T[yy * W + xx]);
      if (wl(x - 1, y)) ao(x, y, 1, 0); if (wl(x + 1, y)) ao(x, y, -1, 0); if (wl(x, y - 1)) ao(x, y, 0, 1); if (wl(x, y + 1)) ao(x, y, 0, -1);
    }
    // chasms (base fill, animated gears are drawn every frame)
    f.fillStyle = '#04060e'; f.fill(L.pitPath);
    // ----- walls
    const w = wallC.getContext('2d'); w.setTransform(R, 0, 0, R, 0, 0); w.clearRect(0, 0, W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = T[y * W + x]; if (!isWallT(t)) continue;
      const g = w.createLinearGradient(x, y, x + 1, y + 1); g.addColorStop(0, '#4e3622'); g.addColorStop(1, '#3a2717');
      w.fillStyle = g; w.fillRect(x - 0.003, y - 0.003, 1.006, 1.006);
      w.fillStyle = 'rgba(255,220,160,0.05)'; w.fillRect(x + 0.18, y + 0.18, 0.64, 0.64);
      if (t === 4) {   // vent: a dark slot with brass bars
        w.fillStyle = '#0d0a1c'; w.fillRect(x + 0.12, y + 0.12, 0.76, 0.76);
        const vg = w.createRadialGradient(x + 0.5, y + 0.5, 0.05, x + 0.5, y + 0.5, 0.5); vg.addColorStop(0, 'rgba(120,100,255,0.45)'); vg.addColorStop(1, 'rgba(120,100,255,0)');
        w.fillStyle = vg; w.fillRect(x + 0.12, y + 0.12, 0.76, 0.76);
        w.strokeStyle = '#b9853f'; w.lineWidth = 0.06; w.beginPath();
        const hz = (x > 0 && isWallT(T[y * W + x - 1])) || (x < W - 1 && isWallT(T[y * W + x + 1]));
        for (let k = 1; k < 4; k++) { if (hz) { w.moveTo(x + k / 4, y + 0.14); w.lineTo(x + k / 4, y + 0.86); } else { w.moveTo(x + 0.14, y + k / 4); w.lineTo(x + 0.86, y + k / 4); } }
        w.stroke(); w.strokeStyle = 'rgba(0,0,0,0.5)'; w.lineWidth = 0.05; w.strokeRect(x + 0.12, y + 0.12, 0.76, 0.76);
      } else if (rnd() < 0.12) {   // occasional engraved cog on top
        w.strokeStyle = 'rgba(255,210,140,0.10)'; w.lineWidth = 0.04; w.beginPath(); gearPath(w, x + 0.5, y + 0.5, 0.28, 8, rnd() * TAU, 0.06); w.stroke();
      }
    }
    // brass trims along every exposed wall edge
    const trim = (segs, nx, ny) => {
      for (const [x0, y0, x1, y1] of segs) {
        w.strokeStyle = 'rgba(15,8,2,0.6)'; w.lineWidth = 0.06; w.beginPath(); w.moveTo(x0, y0); w.lineTo(x1, y1); w.stroke();
        w.strokeStyle = '#a8763a'; w.lineWidth = 0.07; w.beginPath(); w.moveTo(x0 - nx * 0.09, y0 - ny * 0.09); w.lineTo(x1 - nx * 0.09, y1 - ny * 0.09); w.stroke();
        w.fillStyle = '#e2b36a';
        const mx = (x0 + x1) / 2 - nx * 0.2, my = (y0 + y1) / 2 - ny * 0.2; w.beginPath(); w.arc(mx, my, 0.045, 0, TAU); w.fill();
      }
    };
    trim(L.edges[0], 1, 0); trim(L.edges[1], 0, 1); trim(L.edges[2], -1, 0); trim(L.edges[3], 0, -1);
  }

  // ------------------------------------------------------------------ dynamic rendering
  const hullBuf = [];
  function hull(pts) {
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    lo.pop(); up.pop(); return lo.concat(up);
  }
  function rectHull(c, x0, y0, x1, y1, ox, oy) {
    hullBuf.length = 0;
    hullBuf.push([x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 + ox, y0 + oy], [x1 + ox, y0 + oy], [x1 + ox, y1 + oy], [x0 + ox, y1 + oy]);
    const h = hull(hullBuf); c.moveTo(h[0][0], h[0][1]); for (let k = 1; k < h.length; k++) c.lineTo(h[k][0], h[k][1]); c.closePath();
  }
  function stadium(c, x, y, r, ex, ey) {
    const ph = Math.atan2(ey, ex);
    c.beginPath(); c.arc(x, y, r, ph + Math.PI / 2, ph + Math.PI * 1.5); c.arc(x + ex, y + ey, r, ph - Math.PI / 2, ph + Math.PI / 2); c.closePath(); c.fill();
  }
  function doorPanels(d) {
    const out = [], o = d.open;
    if (d.horiz) {
      const m = (d.x0 + d.x1) / 2, h = (m - d.x0) * (1 - o), y0 = d.y0 + 0.28, y1 = d.y1 - 0.28;
      if (h > 0.01) { out.push([d.x0, y0, d.x0 + h, y1], [d.x1 - h, y0, d.x1, y1]); }
    } else {
      const m = (d.y0 + d.y1) / 2, h = (m - d.y0) * (1 - o), x0 = d.x0 + 0.28, x1 = d.x1 - 0.28;
      if (h > 0.01) { out.push([x0, d.y0, x1, d.y0 + h], [x0, d.y1 - h, x1, d.y1]); }
    }
    return out;
  }
  function handPath(c, h) {
    const w = h.w / 2;
    c.beginPath(); c.moveTo(-h.back, -w * 0.7); c.lineTo(h.len - 0.9, -w); c.lineTo(h.len, 0); c.lineTo(h.len - 0.9, w); c.lineTo(-h.back, w * 0.7); c.closePath();
  }
  function lightPoly(g) {
    const pts = [], n = 36;
    for (let k = 0; k < n; k++) { const a = k / n * TAU, dx = Math.cos(a), dy = Math.sin(a), d = castVis(g.lx, g.ly, dx, dy, LANT_R); pts.push([g.lx + dx * d, g.ly + dy * d]); }
    return pts;
  }
  function visPoly(x, y, n, range, ext) {
    const pts = [];
    for (let k = 0; k < n; k++) { const a = k / n * TAU, dx = Math.cos(a), dy = Math.sin(a), d = rayGrid(x, y, dx, dy, range, opaque); pts.push([x + dx * Math.min(range, d + ext), y + dy * Math.min(range, d + ext)]); }
    return pts;
  }
  function conePoly(g) {
    const n = 26, pts = [[g.x, g.y]], range = g.range * (G.alarm ? 1.25 : G.vigil), fov = g.fov * (G.alarm ? 1.25 : 1);
    for (let k = 0; k <= n; k++) { const a = g.a - fov / 2 + fov * k / n, dx = Math.cos(a), dy = Math.sin(a), d = castVis(g.x, g.y, dx, dy, range); pts.push([g.x + dx * d, g.y + dy * d]); }
    return { pts, range };
  }
  function polyPath(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) c.lineTo(pts[k][0], pts[k][1]); c.closePath(); }

  let PROF = null; const SKIP = {}; const vigC = document.createElement('canvas');
  // adaptive quality: if real frames are slow for a while, drop the purely cosmetic passes
  let HQ = true, slowT = 0, fastT = 0;
  function watchQuality(rawDt) {
    if (document.hidden || rawDt > 0.25) return;
    if (rawDt > 0.034) { slowT += rawDt; fastT = 0; } else { fastT += rawDt; slowT = Math.max(0, slowT - rawDt * 0.5); }
    if (HQ && slowT > 2.5) { HQ = false; slowT = 0; }
    else if (!HQ && fastT > 12) { HQ = true; fastT = 0; }
  }
  function render(dt) {
    const c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.fillStyle = '#0b0e1a'; c.fillRect(0, 0, cvs.width, cvs.height);
    if (!L || !G) return;
    camUpdate(dt);
    if (PROF) PROF.start();
    const now = G.time, fog = L.def.fog && !attract && G.body, war = isWarden();
    // which guards can I see (fog of war: only what your body or your shadow has a line of sight to)
    for (const g of G.guards) {
      if (!fog) { g.vis = true; continue; }
      const see = (a) => { const dx = g.x - a.x, dy = g.y - a.y, d = Math.hypot(dx, dy); return d < 0.01 || rayGrid(a.x, a.y, dx / d, dy / d, d, opaque) >= d - 1e-3; };
      g.vis = see(G.body) || !!(G.weave && G.weave.mode !== 'return' && see(G.weave));
    }
    drawBackdrop(c, now);
    if (PROF) PROF.mark('backdrop');
    setWT(c, DPR);
    c.drawImage(floorC, 0, 0, L.W, L.H);
    if (PROF) PROF.mark('floor');
    drawPits(c, now);
    if (PROF) PROF.mark('pits');
    drawFloorObjects(c, now);
    if (PROF) PROF.mark('floorobj');
    drawCones(c);
    if (PROF) PROF.mark('cones');
    for (const g of G.guards) if (g.vis) drawGuard(c, g, now);
    if (G.body) drawBody(c, G.body, now);
    drawGearItem(c, now, false);
    if (PROF) PROF.mark('chars');
    // warm sunlight wash from the sun's side
    if (!SKIP.soft && HQ) { c.save();
    const sg = c.createLinearGradient(L.W / 2 + G.sx * L.W * 0.6, L.H / 2 + G.sy * L.H * 0.6, L.W / 2 - G.sx * L.W * 0.6, L.H / 2 - G.sy * L.H * 0.6);
    sg.addColorStop(0, 'rgba(255,196,110,0.16)'); sg.addColorStop(1, 'rgba(255,196,110,0)'); c.fillStyle = sg; c.fillRect(0, 0, L.W, L.H);
    c.restore(); }
    drawShadowLayer();
    if (PROF) PROF.mark('sunwash+shadow');
    setWT(c, DPR);
    if (G.overview && !attract) drawFutureShadows(c, now);
    if (!SKIP.motes && HQ) drawMotes(c, now);
    if (PROF) PROF.mark('motes');
    c.drawImage(wallC, 0, 0, L.W, L.H);
    drawWallRims(c);
    drawDoors(c, now);
    drawTall(c, now);
    if (PROF) PROF.mark('walls+tall');
    drawGlows(c, now);
    if (PROF) PROF.mark('glows');
    if (G.weave) drawShade(c, now);
    if (G.body && G.hidden) { c.strokeStyle = 'rgba(150,175,255,0.75)'; c.lineWidth = 0.04; c.beginPath(); c.arc(G.body.x, G.body.y, P_R + 0.06, 0, TAU); c.stroke(); }
    drawHands(c, now);
    if (PROF) PROF.mark('shade+hands');
    drawParticles(c);
    if (fog && !SKIP.fog) drawFog();
    if (war) { drawWardenFog(); setWT(c, DPR); drawWardenMarks(c, now); }
    if (PROF) PROF.mark('fog');
    drawIcons(c, now);
    if (API.debug) drawDebug(c);
    drawScreenFx(c, now);
    if (PROF) PROF.mark('icons+fx');
    drawDial(now);
    if (PROF) PROF.mark('dial');
  }

  function drawBackdrop(c, now) {
    // the giant clock bezel around the map, with the sun itself orbiting on it
    setWT(c, DPR);
    const cx = L.W / 2, cy = L.H / 2, R = Math.hypot(L.W, L.H) / 2 + 0.6;
    c.fillStyle = '#121729'; c.beginPath(); c.arc(cx, cy, R + 2.2, 0, TAU); c.fill();
    const rg = c.createRadialGradient(cx, cy, R - 0.3, cx, cy, R + 1.6); rg.addColorStop(0, '#2a1d10'); rg.addColorStop(0.3, '#a8773a'); rg.addColorStop(0.55, '#e7b86c'); rg.addColorStop(0.75, '#8a5f2c'); rg.addColorStop(1, '#2a1d10');
    c.strokeStyle = rg; c.lineWidth = 1.9; c.beginPath(); c.arc(cx, cy, R + 0.65, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(40,24,8,0.8)'; c.lineWidth = 0.06;
    const turn = G.sun * D2R;
    for (let k = 0; k < 120; k++) { const a = k / 120 * TAU + turn, l = k % 10 === 0 ? 0.9 : 0.4; c.beginPath(); c.moveTo(cx + Math.cos(a) * (R + 1.5), cy + Math.sin(a) * (R + 1.5)); c.lineTo(cx + Math.cos(a) * (R + 1.5 - l), cy + Math.sin(a) * (R + 1.5 - l)); c.stroke(); }
    c.fillStyle = '#0d1020'; c.fillRect(-0.15, -0.15, L.W + 0.3, L.H + 0.3);
    // the sun
    const a = G.sun * D2R - Math.PI / 2, sx = cx + Math.cos(a) * (R + 0.65), sy = cy + Math.sin(a) * (R + 0.65);
    const glow = c.createRadialGradient(sx, sy, 0, sx, sy, 4.5); glow.addColorStop(0, 'rgba(255,236,170,0.75)'); glow.addColorStop(0.22, 'rgba(255,180,60,0.35)'); glow.addColorStop(1, 'rgba(255,140,30,0)');
    c.fillStyle = glow; c.beginPath(); c.arc(sx, sy, 4.5, 0, TAU); c.fill();
    c.save(); c.translate(sx, sy); c.rotate(now * 0.25);
    c.fillStyle = '#ffb703';
    for (let k = 0; k < 12; k++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(0.78, -0.13); c.lineTo(k % 2 ? 1.25 : 1.55, 0); c.lineTo(0.78, 0.13); c.closePath(); c.fill(); }
    const core = c.createRadialGradient(-0.15, -0.15, 0.05, 0, 0, 0.75); core.addColorStop(0, '#fffbe6'); core.addColorStop(0.6, '#ffd24a'); core.addColorStop(1, '#f08a12');
    c.fillStyle = core; c.beginPath(); c.arc(0, 0, 0.72, 0, TAU); c.fill();
    c.restore();
  }
  function drawPits(c, now) {
    if (!L.pitGears.length) return;
    c.save(); c.clip(L.pitPath);
    for (const g of L.pitGears) {
      const eg = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 1.8); eg.addColorStop(0, 'rgba(255,120,40,0.10)'); eg.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = eg; c.beginPath(); c.arc(g.x, g.y, g.r * 1.8, 0, TAU); c.fill();
    }
    for (const g of L.pitGears) {
      c.fillStyle = '#10162c'; c.strokeStyle = '#222c52'; c.lineWidth = 0.05;
      c.beginPath(); gearPath(c, g.x, g.y, g.r, g.teeth, g.ph + now * g.sp * (G.freezeT > 0 ? 0 : 1), 0.16); c.fill(); c.stroke();
      c.fillStyle = '#070a16'; c.beginPath(); c.arc(g.x, g.y, g.r * 0.35, 0, TAU); c.fill();
    }
    c.restore();
    // rims
    c.lineWidth = 0.08; c.strokeStyle = '#e0ae62';
    c.beginPath(); for (const e of L.pitEdges) { const [x0, y0, x1, y1] = e.seg; c.moveTo(x0 + e.nrm[0] * 0.04, y0 + e.nrm[1] * 0.04); c.lineTo(x1 + e.nrm[0] * 0.04, y1 + e.nrm[1] * 0.04); } c.stroke();
    c.lineWidth = 0.05; c.strokeStyle = 'rgba(0,0,0,0.6)';
    c.beginPath(); for (const e of L.pitEdges) { const [x0, y0, x1, y1] = e.seg; c.moveTo(x0 - e.nrm[0] * 0.04, y0 - e.nrm[1] * 0.04); c.lineTo(x1 - e.nrm[0] * 0.04, y1 - e.nrm[1] * 0.04); } c.stroke();
  }
  function moonGlyph(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(x + r * 0.45, y - r * 0.25, r * 0.85, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over'; }
  function sunGlyph(c, x, y, r, col) {
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = r * 0.22; c.beginPath(); c.arc(x, y, r * 0.5, 0, TAU); c.fill();
    c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.moveTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.stroke();
  }
  function drawFloorObjects(c, now) {
    // plate ↔ door links
    c.save(); c.setLineDash([0.12, 0.16]); c.lineWidth = 0.045;
    for (const p of L.plates) {
      const d = L.doors[p.door]; if (!d) continue;
      c.strokeStyle = d.col; c.globalAlpha = p.on ? 0.55 : 0.2; c.lineDashOffset = -now * (p.on ? 0.8 : 0.2);
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo((d.x0 + d.x1) / 2, (d.y0 + d.y1) / 2); c.stroke();
    }
    c.restore();
    for (const p of L.plates) {
      const d = L.doors[p.door], col = d ? d.col : '#fff';
      c.fillStyle = '#5b3d1d'; c.beginPath(); c.arc(p.x, p.y, 0.4, 0, TAU); c.fill();
      c.strokeStyle = col; c.lineWidth = 0.06; c.beginPath(); c.arc(p.x, p.y, 0.34, 0, TAU); c.stroke();
      c.fillStyle = p.mode === 'shade' ? (p.on ? '#2c3a8a' : '#1a2048') : (p.on ? '#ffd76a' : '#7a5a24');
      c.beginPath(); c.arc(p.x, p.y, 0.28, 0, TAU); c.fill();
      if (p.mode === 'shade') moonGlyph(c, p.x - 0.03, p.y + 0.02, 0.15, p.on ? '#cfe0ff' : '#6d78b0'); else sunGlyph(c, p.x, p.y, 0.19, p.on ? '#fff6d0' : '#c9a35a');
    }
    // levers
    for (const l of L.levers) {
      c.fillStyle = '#3a2717'; roundRect(c, l.x - 0.36, l.y - 0.3, 0.72, 0.6, 0.12); c.fill();
      c.strokeStyle = '#d8a656'; c.lineWidth = 0.05; roundRect(c, l.x - 0.36, l.y - 0.3, 0.72, 0.6, 0.12); c.stroke();
      const ang = -0.7 + (l.anim > 0 ? Math.sin(l.anim * Math.PI) * 1.4 : 0);
      c.strokeStyle = '#c9ced8'; c.lineWidth = 0.09; c.lineCap = 'round';
      c.beginPath(); c.moveTo(l.x, l.y + 0.1); c.lineTo(l.x + Math.sin(ang) * 0.42, l.y + 0.1 - Math.cos(ang) * 0.42); c.stroke(); c.lineCap = 'butt';
      c.fillStyle = l.kind === 'stop' ? '#7fb2ff' : '#ff9a3c'; c.beginPath(); c.arc(l.x + Math.sin(ang) * 0.42, l.y + 0.1 - Math.cos(ang) * 0.42, 0.1, 0, TAU); c.fill();
      if (l.cd > 0) { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.05; c.beginPath(); c.arc(l.x, l.y, 0.5, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - l.cd / 12)); c.stroke(); }
    }
    // exit hatch
    if (L.exit) {
      const e = L.exit, locked = L.gear && !G.gearTaken;
      c.fillStyle = '#2b1d10'; c.beginPath(); c.arc(e.x, e.y, 0.48, 0, TAU); c.fill();
      c.strokeStyle = '#e0ae62'; c.lineWidth = 0.08; c.beginPath(); c.arc(e.x, e.y, 0.44, 0, TAU); c.stroke();
      if (locked) {
        c.fillStyle = '#1a0d10'; c.beginPath(); c.arc(e.x, e.y, 0.36, 0, TAU); c.fill();
        c.strokeStyle = '#ff5d73'; c.lineWidth = 0.06; c.beginPath(); for (let k = -1; k <= 1; k++) { c.moveTo(e.x + k * 0.15, e.y - 0.3); c.lineTo(e.x + k * 0.15, e.y + 0.3); } c.stroke();
      } else {
        const sw = c.createRadialGradient(e.x, e.y, 0, e.x, e.y, 0.38); sw.addColorStop(0, '#e6fff2'); sw.addColorStop(0.5, '#3fd99a'); sw.addColorStop(1, '#0a3b30');
        c.fillStyle = sw; c.beginPath(); c.arc(e.x, e.y, 0.36, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(230,255,240,0.8)'; c.lineWidth = 0.035;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(e.x, e.y, 0.12 + k * 0.08, now * (1.5 + k) + k * 2, now * (1.5 + k) + k * 2 + 2.4); c.stroke(); }
      }
    }
    // the bridge of woven shadow
    const w = G.weave;
    if (w && w.mode === 'bridge') {
      const dx = w.x - w.A.x, dy = w.y - w.A.y, l = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      c.save(); c.translate(w.A.x, w.A.y); c.rotate(a);
      const bg = c.createLinearGradient(0, -BRIDGE_HW, 0, BRIDGE_HW); bg.addColorStop(0, 'rgba(140,120,255,0.9)'); bg.addColorStop(0.15, 'rgba(40,26,110,0.95)'); bg.addColorStop(0.85, 'rgba(40,26,110,0.95)'); bg.addColorStop(1, 'rgba(140,120,255,0.9)');
      c.fillStyle = bg; c.fillRect(-0.1, -BRIDGE_HW, l + 0.2, BRIDGE_HW * 2);
      c.strokeStyle = 'rgba(180,170,255,0.5)'; c.lineWidth = 0.03; c.beginPath();
      for (let x = 0; x < l; x += 0.35) { const o = Math.sin(now * 4 + x * 3) * 0.08; c.moveTo(x, -BRIDGE_HW + 0.05); c.lineTo(x + 0.18 + o, BRIDGE_HW - 0.05); } c.stroke();
      c.restore();
    }
    // bridge preview
    if (w && w.mode === 'free' && mode === 'play' && bridgeOK()) {
      c.save(); c.setLineDash([0.18, 0.12]); c.lineDashOffset = -now * 1.5; c.strokeStyle = 'rgba(170,150,255,0.85)'; c.lineWidth = 0.08;
      c.beginPath(); c.moveTo(G.body.x, G.body.y); c.lineTo(w.x, w.y); c.stroke(); c.restore();
    }
    // noise rings
    for (const r of G.rings) {
      const k = r.t / 1.1; c.strokeStyle = `rgba(255,235,180,${(1 - k) * 0.8})`; c.lineWidth = 0.08 * (1 - k) + 0.02;
      c.beginPath(); c.arc(r.x, r.y, 0.3 + k * 6.5, 0, TAU); c.stroke();
      if (k < 0.5) { c.beginPath(); c.arc(r.x, r.y, 0.2 + k * 3, 0, TAU); c.stroke(); }
    }
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function drawCones(c) {
    for (const g of G.guards) {
      if (!g.vis) { g.cone = null; continue; }
      const cn = conePoly(g); g.cone = cn;
      const st = G.alarm || g.state === 'alarm' ? 'a' : g.state === 'suspicious' || g.meter > 0.12 ? 's' : g.state === 'search' || g.state === 'look' ? 'q' : 'n';
      const col = st === 'a' ? '255,70,70' : st === 's' ? '255,183,3' : st === 'q' ? '255,215,120' : G.war && g.isCtl ? '214,190,255' : '255,244,214';
      const al = st === 'n' ? 0.3 : 0.4;
      if (HQ) {
        const gr = c.createRadialGradient(g.x, g.y, 0.2, g.x, g.y, cn.range);
        gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(0.75, `rgba(${col},${al * 0.55})`); gr.addColorStop(1, `rgba(${col},0.02)`);
        c.fillStyle = gr;
      } else c.fillStyle = `rgba(${col},${al * 0.6})`;
      polyPath(c, cn.pts); c.fill();
      c.strokeStyle = `rgba(${col},${al + 0.15})`; c.lineWidth = 0.03; c.stroke();
    }
  }
  function drawGuard(c, g, now) {
    const st = G.alarm ? 'a' : g.state === 'suspicious' || g.meter > 0.12 ? 's' : 'n';
    const eye = st === 'a' ? '#ff3b3b' : st === 's' ? '#ffb703' : '#fff0b0';
    c.save(); c.translate(g.x, g.y);
    if (g.type === 'w') {
      c.fillStyle = '#3d2c1c'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(Math.cos(a) * 0.46, Math.sin(a) * 0.46); } c.closePath(); c.fill();
      c.strokeStyle = '#d8a656'; c.lineWidth = 0.05; c.stroke();
      c.rotate(g.a);
      const bg = c.createRadialGradient(-0.08, -0.08, 0.05, 0, 0, 0.34); bg.addColorStop(0, '#e8edf5'); bg.addColorStop(1, '#5a6578');
      c.fillStyle = bg; c.beginPath(); c.arc(0, 0, 0.32, 0, TAU); c.fill();
      c.fillStyle = '#2b3140'; c.fillRect(0.1, -0.13, 0.32, 0.26);
      c.fillStyle = eye; c.beginPath(); c.arc(0.38, 0, 0.1, 0, TAU); c.fill();
    } else {
      const bob = Math.sin(g.bob) * 0.025;
      c.rotate(g.a);
      // wind-up key on the back
      c.save(); c.translate(-0.33, 0); c.rotate(now * 4 + g.key);
      c.fillStyle = '#e0b050'; c.fillRect(-0.03, -0.17, 0.06, 0.34); c.beginPath(); c.ellipse(0, -0.17, 0.08, 0.05, 0, 0, TAU); c.ellipse(0, 0.17, 0.08, 0.05, 0, 0, TAU); c.fill();
      c.restore();
      const bg = c.createRadialGradient(-0.08 + bob, -0.1, 0.04, 0, 0, 0.32); bg.addColorStop(0, g.lantern ? '#f3e2c4' : '#eef2f8'); bg.addColorStop(1, g.lantern ? '#7a6248' : '#5d6878');
      c.fillStyle = bg; c.beginPath(); c.arc(bob, 0, 0.3, 0, TAU); c.fill();
      c.strokeStyle = '#b98a40'; c.lineWidth = 0.05; c.beginPath(); c.arc(bob, 0, 0.3, 0, TAU); c.stroke();
      c.fillStyle = '#2b3140'; c.beginPath(); c.arc(0.12 + bob, 0, 0.14, -1.2, 1.2); c.closePath(); c.fill();
      c.fillStyle = eye; c.beginPath(); c.arc(0.2 + bob, 0, 0.07, 0, TAU); c.fill();
      if (g.lantern) { c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(0.2, 0.18); c.lineTo(0.42, 0.06); c.stroke(); c.fillStyle = '#ffcf6a'; c.beginPath(); c.arc(0.42, 0, 0.1, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  function drawBody(c, b, now) {
    const w = G.weave, dim = w && w.mode !== 'return';
    c.save(); c.translate(b.x, b.y);
    // own little shadow, cast away from the sun (gone while the shadow is woven out)
    if (!dim) { c.fillStyle = 'rgba(30,40,100,0.35)'; c.beginPath(); c.ellipse(-G.sx * 0.22, -G.sy * 0.22, 0.3, 0.26, 0, 0, TAU); c.fill(); }
    c.rotate(b.a);
    const sw = b.moving ? Math.sin(b.walk) * 0.06 : 0;
    c.globalAlpha = dim ? 0.75 : 1;
    // scarf tail
    c.strokeStyle = '#ffb703'; c.lineWidth = 0.08; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.1, 0.05); c.quadraticCurveTo(-0.38, 0.12 + sw * 2, -0.5, 0.02 - sw * 2); c.stroke(); c.lineCap = 'butt';
    const cg = c.createRadialGradient(-0.06, -0.08, 0.03, 0, 0, P_R + 0.02); cg.addColorStop(0, dim ? '#4f7b80' : '#2fb3a8'); cg.addColorStop(1, dim ? '#203238' : '#0d4b50');
    c.fillStyle = cg; c.beginPath(); c.ellipse(0, 0, P_R, P_R - 0.02 + sw * 0.3, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 0.035; c.stroke();
    c.fillStyle = dim ? '#1d2a30' : '#0b3a3f'; c.beginPath(); c.arc(0.08, 0, 0.16, 0, TAU); c.fill();
    c.fillStyle = dim ? '#8a7a5a' : '#ffcf6a'; c.fillRect(0.15, -0.09, 0.05, 0.05); c.fillRect(0.15, 0.04, 0.05, 0.05);
    c.restore();
    if (dim) { c.strokeStyle = `rgba(160,140,255,${0.35 + Math.sin(now * 5) * 0.2})`; c.lineWidth = 0.04; c.setLineDash([0.1, 0.1]); c.beginPath(); c.arc(b.x, b.y, 0.42, 0, TAU); c.stroke(); c.setLineDash([]); }
    if (b.daze > 0) { c.fillStyle = '#fff'; for (let k = 0; k < 3; k++) { const a = now * 6 + k * 2.1; c.beginPath(); c.arc(b.x + Math.cos(a) * 0.3, b.y - 0.35 + Math.sin(a) * 0.1, 0.04, 0, TAU); c.fill(); } }
  }
  function drawGearItem(c, now, glowOnly) {
    if (!L.gear || G.gearTaken) return;
    const g = L.gear, bob = Math.sin(now * 2.5) * 0.05;
    if (glowOnly) {
      c.save(); c.globalCompositeOperation = 'lighter';
      const gr = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, 1.4); gr.addColorStop(0, 'rgba(255,200,80,0.55)'); gr.addColorStop(1, 'rgba(255,150,40,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(g.x, g.y, 1.4, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,230,150,0.5)'; c.lineWidth = 0.04;
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + now * 0.6; c.beginPath(); c.moveTo(g.x + Math.cos(a) * 0.5, g.y + Math.sin(a) * 0.5); c.lineTo(g.x + Math.cos(a) * (0.75 + Math.sin(now * 3 + k) * 0.1), g.y + Math.sin(a) * (0.75 + Math.sin(now * 3 + k) * 0.1)); c.stroke(); }
      c.restore(); return;
    }
    c.save(); c.translate(g.x, g.y + bob);
    const gg = c.createRadialGradient(-0.1, -0.1, 0.05, 0, 0, 0.42); gg.addColorStop(0, '#fff2b0'); gg.addColorStop(0.6, '#ffc23a'); gg.addColorStop(1, '#c46a10');
    c.fillStyle = gg; c.beginPath(); gearPath(c, 0, 0, 0.42, 10, now * 0.8, 0.09); c.fill();
    c.strokeStyle = '#7a3f08'; c.lineWidth = 0.03; c.stroke();
    c.fillStyle = '#ff8a1e'; c.beginPath(); c.arc(0, 0, 0.16, 0, TAU); c.fill();
    c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(0, 0, 0.08, 0, TAU); c.fill();
    c.restore();
  }
  function drawShadowLayer() {
    const s = sctx;
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, smask.width, smask.height);
    setWT(s, DPR * 0.5);
    s.fillStyle = SHADOW_RGB;
    const k = L.def.k, dx = -G.sx, dy = -G.sy, lw = WALL_H * k;
    s.fill(L.roofPath);
    s.beginPath();
    for (const r of L.rects) rectHull(s, r.x0, r.y0, r.x1, r.y1, dx * lw, dy * lw);
    for (const d of L.doors) for (const p of doorPanels(d)) rectHull(s, p[0], p[1], p[2], p[3], dx * lw, dy * lw);
    s.fill();
    for (const ci of L.circles) {
      const l = ci.h * k;
      if (ci.kind === 'cog') {
        s.beginPath(); gearPath(s, ci.x + dx * l, ci.y + dy * l, ci.rt, 12, ci.rot, 0.2); s.fill();
        stadium(s, ci.x, ci.y, ci.r, dx * l, dy * l);
      } else stadium(s, ci.x, ci.y, ci.r, dx * l, dy * l);
    }
    for (const h of L.hands) { s.save(); s.translate(h.x + dx * h.z * k, h.y + dy * h.z * k); s.rotate(h.a); handPath(s, h); s.fill(); s.restore(); }
    if (G.lanterns) {
      s.globalCompositeOperation = 'destination-out';
      for (const g of G.guards) if (g.lantern) {
        const pts = lightPoly(g), gr = s.createRadialGradient(g.lx, g.ly, 0, g.lx, g.ly, LANT_R);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.82, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        s.fillStyle = gr; polyPath(s, pts); s.fill();
      }
      s.globalCompositeOperation = 'source-over';
    }
    if (G.flares.length) {   // online: flares burn the shade away
      s.globalCompositeOperation = 'destination-out';
      for (const f of G.flares) {
        const k = flareK(f), r = FLARE_R * k; if (r < 0.05) continue;
        const pts = [], n = 40; for (let j = 0; j < n; j++) { const a = j / n * TAU, dx = Math.cos(a), dy = Math.sin(a), d = castVis(f.x, f.y, dx, dy, r); pts.push([f.x + dx * d, f.y + dy * d]); }
        const gr = s.createRadialGradient(f.x, f.y, 0, f.x, f.y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.85, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        s.fillStyle = gr; polyPath(s, pts); s.fill();
      }
      s.globalCompositeOperation = 'source-over';
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(smask, 0, 0, cvs.width, cvs.height);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = HQ ? 0.28 : 0.2; ctx.drawImage(smask, 0, 0, cvs.width, cvs.height);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // planning aid on the overview map: where the shadows will be in 10 seconds
  function drawFutureShadows(c, now) {
    const fa = (G.sun + (G.freezeT > 0 ? 0 : L.def.w * (G.gearTaken ? 1.6 : 1) * 10)) * D2R, dx = -Math.sin(fa), dy = Math.cos(fa), k = L.def.k, lw = WALL_H * k;
    c.save(); c.beginPath(); c.rect(0, 0, L.W, L.H); c.clip(); c.setLineDash([0.16, 0.12]); c.lineDashOffset = -now * 0.5; c.lineWidth = 0.05; c.strokeStyle = 'rgba(170,195,255,0.85)';
    c.beginPath(); for (const r of L.rects) rectHull(c, r.x0, r.y0, r.x1, r.y1, dx * lw, dy * lw); c.stroke();
    for (const ci of L.circles) {
      const l = ci.h * k, ph = Math.atan2(dy, dx);
      c.beginPath(); c.arc(ci.x, ci.y, ci.r, ph + Math.PI / 2, ph + Math.PI * 1.5); c.arc(ci.x + dx * l, ci.y + dy * l, ci.r, ph - Math.PI / 2, ph + Math.PI / 2); c.closePath(); c.stroke();
    }
    c.restore();
  }
  function drawMotes(c, now) {
    // dust drifting in the sunbeams (only visible where it is lit); batched into two paths
    c.fillStyle = 'rgba(255,240,200,0.55)'; c.beginPath();
    const p2 = [];
    for (const m of G.motes) {
      m.x += Math.cos(now * 0.3 + m.ph) * 0.003 + m.sp * 0.004; m.y += Math.sin(now * 0.4 + m.ph) * 0.003 - m.sp * 0.002;
      if (m.x > L.W) m.x -= L.W; if (m.y < 0) m.y += L.H;
      const tt = tileAt(m.x, m.y); if (tt !== 0 || shadowAt(m.x, m.y)) continue;
      if (Math.sin(now * 2 + m.ph) > 0) { c.moveTo(m.x + m.s, m.y); c.arc(m.x, m.y, m.s, 0, TAU); } else p2.push(m);
    }
    c.fill();
    c.fillStyle = 'rgba(255,240,200,0.25)'; c.beginPath();
    for (const m of p2) { c.moveTo(m.x + m.s, m.y); c.arc(m.x, m.y, m.s, 0, TAU); }
    c.fill();
  }
  function drawWallRims(c) {
    // the wall edges that face the sun catch a warm highlight
    const N = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    c.lineWidth = 0.07;
    for (let k = 0; k < 4; k++) {
      const dot = N[k][0] * G.sx + N[k][1] * G.sy; if (dot <= 0.05 || !L.edges[k].length) continue;
      c.strokeStyle = `rgba(255,224,150,${dot * 0.75})`; c.beginPath();
      for (const [x0, y0, x1, y1] of L.edges[k]) { c.moveTo(x0 - N[k][0] * 0.05, y0 - N[k][1] * 0.05); c.lineTo(x1 - N[k][0] * 0.05, y1 - N[k][1] * 0.05); }
      c.stroke();
    }
  }
  function drawDoors(c, now) {
    for (const d of L.doors) {
      // frame
      c.fillStyle = '#2b1d10';
      if (d.horiz) { c.fillRect(d.x0, d.y0 + 0.2, 0.12, d.y1 - d.y0 - 0.4); c.fillRect(d.x1 - 0.12, d.y0 + 0.2, 0.12, d.y1 - d.y0 - 0.4); }
      else { c.fillRect(d.x0 + 0.2, d.y0, d.x1 - d.x0 - 0.4, 0.12); c.fillRect(d.x0 + 0.2, d.y1 - 0.12, d.x1 - d.x0 - 0.4, 0.12); }
      for (const p of doorPanels(d)) {
        const g = c.createLinearGradient(p[0], p[1], p[2], p[3]); g.addColorStop(0, '#8a6232'); g.addColorStop(1, '#5d3f1e');
        c.fillStyle = g; c.fillRect(p[0], p[1], p[2] - p[0], p[3] - p[1]);
        c.strokeStyle = d.col; c.lineWidth = 0.05; c.strokeRect(p[0] + 0.03, p[1] + 0.03, p[2] - p[0] - 0.06, p[3] - p[1] - 0.06);
      }
      const mx = (d.x0 + d.x1) / 2, my = (d.y0 + d.y1) / 2;
      if (d.open < 0.6) { c.globalAlpha = 1 - d.open / 0.6; if (d.mode === 'shade') moonGlyph(c, mx - 0.03, my, 0.16, d.col); else sunGlyph(c, mx, my, 0.2, d.col); c.globalAlpha = 1; }
    }
  }
  function drawTall(c, now) {
    for (const ci of L.circles) {
      if (ci.kind === 'cog') {
        c.save(); c.translate(ci.x, ci.y);
        const g = c.createRadialGradient(G.sx * 0.3, G.sy * 0.3, 0.1, 0, 0, ci.rt); g.addColorStop(0, '#f0c070'); g.addColorStop(1, '#8a5a24');
        c.fillStyle = g; c.beginPath(); gearPath(c, 0, 0, ci.rt, 12, ci.rot, 0.2); c.fill(); c.strokeStyle = '#3a2410'; c.lineWidth = 0.04; c.stroke();
        c.fillStyle = 'rgba(40,24,8,0.85)'; for (let k = 0; k < 5; k++) { const a = ci.rot + k / 5 * TAU; c.beginPath(); c.arc(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0.13, 0, TAU); c.fill(); }
        c.fillStyle = '#c9ced8'; c.beginPath(); c.arc(0, 0, 0.16, 0, TAU); c.fill();
        c.restore(); continue;
      }
      const big = ci.kind === 'spire', r = ci.r;
      const g = c.createRadialGradient(ci.x + G.sx * r * 0.45, ci.y + G.sy * r * 0.45, r * 0.08, ci.x, ci.y, r * 1.05);
      if (ci.kind === 'axle') { g.addColorStop(0, '#eef2f8'); g.addColorStop(1, '#4b5566'); }
      else { g.addColorStop(0, big ? '#fff0c0' : '#f2c97e'); g.addColorStop(0.55, big ? '#d39b48' : '#b98340'); g.addColorStop(1, '#5a3a18'); }
      c.fillStyle = g; c.beginPath(); c.arc(ci.x, ci.y, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(30,18,6,0.8)'; c.lineWidth = 0.04; c.stroke();
      c.strokeStyle = 'rgba(255,230,170,0.55)'; c.lineWidth = 0.03; c.beginPath(); c.arc(ci.x, ci.y, r * 0.62, 0, TAU); c.stroke();
      if (big) { c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(ci.x + G.sx * 0.12, ci.y + G.sy * 0.12, 0.09 + Math.sin(now * 3) * 0.02, 0, TAU); c.fill(); }
    }
  }
  function drawHands(c, now) {
    for (const h of L.hands) {
      c.save(); c.translate(h.x, h.y); c.rotate(h.a);
      handPath(c, h); const g = c.createLinearGradient(0, -h.w / 2, 0, h.w / 2); g.addColorStop(0, 'rgba(255,220,140,0.62)'); g.addColorStop(0.5, 'rgba(200,140,60,0.62)'); g.addColorStop(1, 'rgba(120,70,20,0.62)');
      c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(60,30,6,0.8)'; c.lineWidth = 0.05; c.stroke();
      c.strokeStyle = 'rgba(255,240,200,0.35)'; c.lineWidth = 0.03; c.beginPath(); c.moveTo(0, 0); c.lineTo(h.len - 1, 0); c.stroke();
      c.restore();
      c.fillStyle = '#e8b866'; c.beginPath(); c.arc(h.x, h.y, 0.3, 0, TAU); c.fill(); c.fillStyle = '#5a3a18'; c.beginPath(); c.arc(h.x, h.y, 0.12, 0, TAU); c.fill();
    }
  }
  function drawGlows(c, now) {
    c.save(); c.globalCompositeOperation = 'lighter';
    if (L.exit) {
      const e = L.exit, locked = L.gear && !G.gearTaken, col = locked ? '255,70,90' : '90,255,170', p = 0.8 + Math.sin(now * 3) * 0.2;
      const g = c.createRadialGradient(e.x, e.y, 0, e.x, e.y, 1.3); g.addColorStop(0, `rgba(${col},${0.45 * p})`); g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(e.x, e.y, 1.3, 0, TAU); c.fill();
    }
    for (const g of G.guards) {
      if (!g.vis) continue;
      const col = G.alarm ? '255,60,60' : g.state === 'suspicious' || g.meter > 0.12 ? '255,183,3' : '255,240,180';
      const ex = g.x + Math.cos(g.a) * (g.type === 'w' ? 0.38 : 0.2), ey = g.y + Math.sin(g.a) * (g.type === 'w' ? 0.38 : 0.2);
      const gg = c.createRadialGradient(ex, ey, 0, ex, ey, 0.35); gg.addColorStop(0, `rgba(${col},0.7)`); gg.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = gg; c.beginPath(); c.arc(ex, ey, 0.35, 0, TAU); c.fill();
      if (g.lantern) {
        const lg = c.createRadialGradient(g.lx, g.ly, 0, g.lx, g.ly, LANT_R); lg.addColorStop(0, 'rgba(255,200,110,0.4)'); lg.addColorStop(0.6, 'rgba(255,170,70,0.12)'); lg.addColorStop(1, 'rgba(255,150,50,0)');
        c.fillStyle = lg; c.beginPath(); c.arc(g.lx, g.ly, LANT_R, 0, TAU); c.fill();
      }
    }
    for (const p of L.plates) if (p.on) {
      const d = L.doors[p.door], gg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 0.7);
      gg.addColorStop(0, p.mode === 'shade' ? 'rgba(120,150,255,0.35)' : 'rgba(255,220,120,0.35)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg; c.beginPath(); c.arc(p.x, p.y, 0.7, 0, TAU); c.fill();
    }
    for (const f of G.flares) {
      const k = flareK(f), r = FLARE_R * k * (1 + Math.sin(now * 23 + f.x) * 0.03); if (r < 0.05) continue;
      const fg = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, r); fg.addColorStop(0, `rgba(255,236,190,${0.75 * k})`); fg.addColorStop(0.25, `rgba(255,170,70,${0.4 * k})`); fg.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = fg; c.beginPath(); c.arc(f.x, f.y, r, 0, TAU); c.fill();
      c.fillStyle = `rgba(255,250,230,${k})`; c.beginPath(); c.arc(f.x, f.y, 0.12 + Math.random() * 0.04, 0, TAU); c.fill();
    }
    c.restore();
    drawGearItem(c, now, true);
  }
  function drawShade(c, now) {
    const w = G.weave, b = G.body;
    // tether back to the body
    c.save(); c.strokeStyle = 'rgba(120,100,255,0.45)'; c.lineWidth = 0.05; c.setLineDash([0.08, 0.1]); c.lineDashOffset = now * 0.6;
    const mx = (b.x + w.x) / 2 + Math.sin(now * 3) * 0.2, my = (b.y + w.y) / 2 + Math.cos(now * 2.6) * 0.2;
    c.beginPath(); c.moveTo(b.x, b.y); c.quadraticCurveTo(mx, my, w.x, w.y); c.stroke(); c.restore();
    c.save(); c.translate(w.x, w.y);
    const flick = w.exposed ? 0.55 + Math.random() * 0.35 : 1;
    const og = c.createRadialGradient(0, 0, 0, 0, 0, 0.7); og.addColorStop(0, `rgba(110,90,255,${0.35 * flick})`); og.addColorStop(1, 'rgba(110,90,255,0)');
    c.fillStyle = og; c.beginPath(); c.arc(0, 0, 0.7, 0, TAU); c.fill();
    c.beginPath();
    for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU, r = 0.27 + Math.sin(now * 6 + k * 1.7) * 0.03 + Math.sin(now * 3.3 + k * 2.9) * 0.02; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.closePath();
    const bg = c.createRadialGradient(-0.05, -0.05, 0.02, 0, 0, 0.3); bg.addColorStop(0, `rgba(40,26,110,${flick})`); bg.addColorStop(1, `rgba(12,8,40,${flick})`);
    c.fillStyle = bg; c.fill(); c.strokeStyle = `rgba(150,130,255,${0.8 * flick})`; c.lineWidth = 0.035; c.stroke();
    c.rotate(w.a); c.fillStyle = '#c8f6ff';
    c.beginPath(); c.ellipse(0.12, -0.08, 0.045, 0.03, 0, 0, TAU); c.ellipse(0.12, 0.08, 0.045, 0.03, 0, 0, TAU); c.fill();
    c.restore();
  }
  function drawParticles(c) {
    for (const add of [false, true]) {
      c.globalCompositeOperation = add ? 'lighter' : 'source-over';
      for (const p of G.parts) {
        if (p.add !== add) continue;
        const k = p.life / p.max;
        c.fillStyle = `rgba(${p.col},${Math.min(1, k * 1.4)})`; c.beginPath(); c.arc(p.x, p.y, p.s * (0.5 + k * 0.5), 0, TAU); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
  }
  function drawFog() {
    const f = fctx; f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, fogc.width, fogc.height);
    setWT(f, DPR * 0.5);
    f.fillStyle = 'rgba(7,8,16,0.64)'; f.fillRect(-0.2, -0.2, L.W + 0.4, L.H + 0.4);
    f.globalCompositeOperation = 'destination-out'; f.fillStyle = '#000';
    polyPath(f, visPoly(G.body.x, G.body.y, 160, 30, 0.45)); f.fill();
    if (G.weave && G.weave.mode !== 'return') { polyPath(f, visPoly(G.weave.x, G.weave.y, 120, 30, 0.45)); f.fill(); }
    f.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(fogc, 0, 0, cvs.width, cvs.height);
  }
  function drawIcons(c, now) {
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    const fs = clamp(cam.s * 0.62, 14, 30);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const g of G.guards) {
      const [x, y] = w2s(g.x, g.y - 0.75);
      const alarm = G.alarm || g.state === 'alarm', sus = g.state === 'suspicious', q = g.state === 'search' || g.state === 'look' || (g.type === 'w' && g.state === 'search');
      if (g.vis && !alarm && g.meter > 0.02) {
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y + fs * 0.1, fs * 0.55, -Math.PI / 2, -Math.PI / 2 + TAU); c.stroke();
        c.strokeStyle = g.meter > 0.66 ? '#ff5d3b' : '#ffb703'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y + fs * 0.1, fs * 0.55, -Math.PI / 2, -Math.PI / 2 + TAU * g.meter); c.stroke();
      }
      if (!(alarm || sus || q)) continue;
      const pop = Math.min(1, g.iconT * 6), bounce = Math.sin(Math.min(1, g.iconT * 3) * Math.PI) * 4;
      const s = fs * (0.6 + pop * 0.4) * (alarm ? 1.15 : 1);
      c.font = `900 ${s}px 'Segoe UI', Arial, sans-serif`;
      c.fillStyle = 'rgba(10,12,24,0.75)'; c.beginPath(); c.arc(x, y - bounce, s * 0.62, 0, TAU); c.fill();
      c.fillStyle = alarm ? '#ff4040' : sus ? '#ffb703' : '#ffe9a0'; c.fillText(alarm ? '!' : '?', x, y - bounce + 1);
    }
    // action hints next to things you can use
    if (mode === 'play' && G.body && !isTouch) {
      c.font = `800 ${Math.round(fs * 0.62)}px 'Segoe UI', Arial, sans-serif`;
      const tag = (wx, wy, txt) => { const [x, y] = w2s(wx, wy); const m = c.measureText(txt).width + 12; c.fillStyle = 'rgba(15,18,32,0.85)'; roundRect(c, x - m / 2, y - fs * 0.45, m, fs * 0.9, 7); c.fill(); c.fillStyle = '#ffb703'; c.fillText(txt, x, y + 1); };
      const l = !G.weave && nearLever(); if (l) tag(l.x, l.y - 0.85, 'E ⚙️');
      if (G.weave && G.weave.mode === 'free' && bridgeOK()) tag(G.weave.x, G.weave.y - 0.7, 'F 🌉');
    }
  }
  function drawDebug(c) {
    setWT(c, DPR);
    c.lineWidth = 0.05; c.font = '0.35px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let x = 0; x < L.W; x++) { c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText(x, x + 0.5, 0.5); }
    for (let y = 0; y < L.H; y++) { c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText(y, 0.5, y + 0.5); }
    G.guards.forEach((g, i) => {
      if (!g.wps.length) return; c.strokeStyle = `hsla(${i * 70},90%,60%,0.9)`; c.beginPath();
      g.wps.forEach((w, k) => k ? c.lineTo(w.x, w.y) : c.moveTo(w.x, w.y)); if (g.loop) c.closePath(); c.stroke();
    });
  }
  function drawScreenFx(c, now) {
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!SKIP.vig && HQ) {
      if (vigC.width !== Math.ceil(VW / 2) || vigC.height !== Math.ceil(VH / 2)) {
        vigC.width = Math.ceil(VW / 2); vigC.height = Math.ceil(VH / 2); const v = vigC.getContext('2d'), w = vigC.width, h = vigC.height;
        const vg = v.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,0.5)'); v.fillStyle = vg; v.fillRect(0, 0, w, h);
      }
      c.drawImage(vigC, 0, 0, VW, VH);
    }
    if (G.alarm) {
      const p = 0.25 + Math.sin(now * 8) * 0.12, ag = c.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.3, VW / 2, VH / 2, Math.max(VW, VH) * 0.7);
      ag.addColorStop(0, 'rgba(255,0,30,0)'); ag.addColorStop(1, `rgba(255,0,30,${p})`); c.fillStyle = ag; c.fillRect(0, 0, VW, VH);
    }
    if (G.freezeT > 0) { c.strokeStyle = `rgba(130,180,255,${0.35 + Math.sin(now * 4) * 0.1})`; c.lineWidth = 6; c.strokeRect(3, 3, VW - 6, VH - 6); }
    if (G.flash > 0) { c.fillStyle = `rgba(${G.flashCol},${G.flash * 0.6})`; c.fillRect(0, 0, VW, VH); }
  }
  function drawDial(now) {
    if (mode === 'attract' || !dial.width) return;
    const c = dctx, S = dial.width, R = S / 2;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, S, S); c.translate(R, R);
    const bz = c.createRadialGradient(-R * 0.2, -R * 0.2, R * 0.2, 0, 0, R); bz.addColorStop(0, '#f3c77a'); bz.addColorStop(0.7, '#a8773a'); bz.addColorStop(1, '#4a3016');
    c.fillStyle = bz; c.beginPath(); c.arc(0, 0, R - 1, 0, TAU); c.fill();
    const face = c.createRadialGradient(0, -R * 0.2, R * 0.1, 0, 0, R * 0.82); face.addColorStop(0, '#2b3360'); face.addColorStop(1, '#141832');
    c.fillStyle = face; c.beginPath(); c.arc(0, 0, R * 0.82, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,230,170,0.75)';
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, l = k % 3 === 0 ? R * 0.16 : R * 0.08; c.lineWidth = k % 3 === 0 ? S * 0.025 : S * 0.012; c.beginPath(); c.moveTo(Math.sin(a) * R * 0.8, -Math.cos(a) * R * 0.8); c.lineTo(Math.sin(a) * (R * 0.8 - l), -Math.cos(a) * (R * 0.8 - l)); c.stroke(); }
    // shadow hand points away from the sun
    const a = G.sun * D2R;
    c.strokeStyle = '#7f9bff'; c.lineWidth = S * 0.05; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-Math.sin(a) * R * 0.5, Math.cos(a) * R * 0.5); c.stroke(); c.lineCap = 'butt';
    // sun marker
    const sx = Math.sin(a) * R * 0.62, sy = -Math.cos(a) * R * 0.62;
    const sg = c.createRadialGradient(sx, sy, 0, sx, sy, R * 0.32); sg.addColorStop(0, 'rgba(255,240,170,1)'); sg.addColorStop(0.4, 'rgba(255,190,60,0.6)'); sg.addColorStop(1, 'rgba(255,160,40,0)');
    c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, R * 0.32, 0, TAU); c.fill();
    c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(sx, sy, R * 0.11, 0, TAU); c.fill();
    c.fillStyle = '#e7b86c'; c.beginPath(); c.arc(0, 0, R * 0.08, 0, TAU); c.fill();
    if (G.freezeT > 0) {
      c.strokeStyle = '#8fc3ff'; c.lineWidth = S * 0.04; c.beginPath(); c.arc(0, 0, R * 0.9, -Math.PI / 2, -Math.PI / 2 + TAU * G.freezeT / 8); c.stroke();
      c.fillStyle = '#cfe6ff'; c.fillRect(-R * 0.14, R * 0.2, R * 0.09, R * 0.3); c.fillRect(R * 0.05, R * 0.2, R * 0.09, R * 0.3);
    } else if (G.boost > 0 || G.gearTaken) {
      c.fillStyle = '#ffb35a'; const y = R * 0.28, s = R * 0.13;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(-s * 1.1 + k * s * 1.1, y - s); c.lineTo(k * s * 1.1, y); c.lineTo(-s * 1.1 + k * s * 1.1, y + s); c.closePath(); c.fill(); }
    }
  }

  // ------------------------------------------------------------------ HUD
  const hud = { meter: -1, eye: null, alarm: null, obj: null, lbl: null };
  function updateHUD(force) {
    if (isWarden()) { wardenHUD(force); return; }
    if (!G || !G.body) return;
    const m = Math.round(G.meter * 200) / 2;
    if (force || m !== hud.meter) { hud.meter = m; $('meterFill').style.height = m + '%'; $('meter').classList.toggle('low', G.meter < WEAVE_MIN + 0.05); }
    const eye = G.hidden ? 'h' : 'e';
    if (force || eye !== hud.eye) { hud.eye = eye; const el = $('eyeChip'); el.innerHTML = `<i>${G.hidden ? '🌑' : '👁️'}</i>${t(G.hidden ? 'se_hidden' : 'se_exposed')}`; el.className = 'chip ' + (G.hidden ? 'hid' : 'exp'); }
    const al = G.alarm ? Math.ceil(G.alarmT) : null;
    if (force || al !== hud.alarm) { hud.alarm = al; const el = $('alarmChip'); el.hidden = al == null; if (al != null) el.textContent = t('se_alarm_t', { s: al }); }
    const obj = L.gear && !G.gearTaken ? 'se_obj_gear' : 'se_obj_exit';
    if (force || obj !== hud.obj) { hud.obj = obj; setLevelLabel(); }
    // touch buttons
    if (isTouch && mode === 'play') {
      const w = G.weave, bw = $('bWeave'), ba = $('bAct'), bb = $('bBridge');
      const wl = w ? 'r' : 'w'; if (bw.dataset.s !== wl) { bw.dataset.s = wl; bw.innerHTML = (w ? '↩️' : '🌑') + `<small>${t(w ? 'se_b_recall' : 'se_b_weave')}</small>`; }
      const lev = !w && nearLever(), as = w && w.mode === 'free' ? 'n' : lev ? 'l' : 'x';
      if (ba.dataset.s !== as) { ba.dataset.s = as; ba.innerHTML = (as === 'l' ? '⚙️' : '🔔') + `<small>${t(as === 'l' ? 'se_b_use' : 'se_b_noise')}</small>`; ba.disabled = as === 'x'; }
      const bs = w && w.mode === 'free' ? (bridgeOK() ? 'on' : 'off') : 'hide';
      if (bb.dataset.s !== bs) { bb.dataset.s = bs; bb.hidden = bs === 'hide'; bb.disabled = bs === 'off'; bb.innerHTML = `🌉<small>${t('se_b_bridge')}</small>`; }
    }
  }
  function setLevelLabel() {
    const el = $('lvlLabel');
    if (mode === 'attract' || !L) { el.innerHTML = ''; return; }
    const obj = isWarden() ? 'se_w_obj' : G && G.body && L.gear && !G.gearTaken ? 'se_obj_gear' : 'se_obj_exit';
    el.innerHTML = `<b>${curLevel + 1}</b> · ${t(L.def.name)}<small class="${obj === 'se_obj_gear' ? 'gear' : ''}">${t(obj)}</small>`;
  }
  function keyLegend() {
    if (isWarden()) { $('keys').innerHTML = `<kbd>🖱️</kbd> ${t('se_k_sel')} &nbsp; <kbd>WASD</kbd> ${t('se_k_steer')} &nbsp; <kbd>F</kbd> ${t('se_k_flare')} &nbsp; <kbd>X</kbd> ${t('se_k_rel')} &nbsp; <kbd>Tab</kbd> ${t('se_k_next')} &nbsp; <kbd>M</kbd> ${t('se_k_map')} &nbsp; <kbd>P</kbd> ${t('se_k_pause')}`; return; }
    $('keys').innerHTML = `<kbd>WASD</kbd> ${t('se_k_move')} &nbsp; <kbd>Q</kbd> ${t('se_k_weave')} &nbsp; <kbd>E</kbd> ${t('se_k_act')} &nbsp; <kbd>F</kbd> ${t('se_k_bridge')} &nbsp; <kbd>M</kbd> ${t('se_k_map')} &nbsp; <kbd>P</kbd> ${t('se_k_pause')}`;
  }
  function syncChrome() {
    const playing = mode !== 'attract';
    $('hud').hidden = !playing;
    $('playBtns').hidden = !playing;
    $('touch').hidden = !(isTouch && mode === 'play') || isWarden();
    $('wbtns').hidden = !(isWarden() && mode === 'play');
    $('lightChip').firstElementChild.textContent = isWarden() ? '🔥' : '🔆';
    $('soundBtn').textContent = Snd.muted ? '🔇' : '🔊';
    $('langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية';
    setLevelLabel();
    if (playing) {
      const ds = Math.round(dial.getBoundingClientRect().width * DPR);
      if (ds > 0 && ds !== dial.width) { dial.width = ds; dial.height = ds; }
      updateHUD(true); keyLegend();
    }
    if (mode !== 'play') setTip(''); else tipShown = null;
  }

  // ------------------------------------------------------------------ screens
  const ov = $('overlay');
  function logoSVG() {
    return `<svg class="logo" viewBox="0 0 120 120" aria-hidden="true"><defs>
      <radialGradient id="sg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffb703"/><stop offset="1" stop-color="#c46a10"/></radialGradient>
      <radialGradient id="mg" cx="40%" cy="40%" r="60%"><stop offset="0" stop-color="#3b2f8a"/><stop offset="1" stop-color="#0d0a24"/></radialGradient></defs>
      <g transform="translate(60 60)">${Array.from({ length: 16 }, (_, k) => { const a = k / 16 * Math.PI * 2; return `<line x1="${Math.cos(a) * 34}" y1="${Math.sin(a) * 34}" x2="${Math.cos(a) * (k % 2 ? 44 : 54)}" y2="${Math.sin(a) * (k % 2 ? 44 : 54)}" stroke="#ffb703" stroke-width="${k % 2 ? 3 : 5}" stroke-linecap="round"/>`; }).join('')}
      <circle r="33" fill="url(#sg)"/><circle cx="12" cy="-7" r="29" fill="url(#mg)"/><circle cx="12" cy="-7" r="29" fill="none" stroke="#8f7dff" stroke-width="2" opacity=".8"/>
      <circle cx="19" cy="-12" r="3" fill="#c8f6ff"/><circle cx="7" cy="-12" r="3" fill="#c8f6ff"/></g></svg>`;
  }
  function showScreen(s, back) {
    if (back !== undefined) screenBack = back;
    screen = s; renderScreen();
  }
  function hideScreen() { screen = null; ov.hidden = true; ov.innerHTML = ''; syncChrome(); }
  function lvlCard(i) {
    const open = i < PROG.u, st = starsOf(i), b = PROG.b[i] || {};
    const stars = [b.d, b.g, b.f].map(v => v ? '<i>★</i>' : '★').join('');
    return `<button class="lv" data-act="level" data-arg="${i}" ${open ? '' : 'disabled'}>${LEVELS[i].map.some(r => r.includes('S')) ? '<span class="gear">☀️</span>' : ''}<span class="n">${open ? i + 1 : '🔒'}</span><span class="nm">${open ? t(LEVELS[i].name) : t('se_locked_lvl')}</span><span class="st">${stars}</span></button>`;
  }
  function renderScreen() {
    if (!screen) { hideScreen(); return; }
    ov.hidden = false;
    const back = `<button class="btn sec" data-act="back">${t('se_back')}</button>`;
    let h = '';
    if (screen === 'menu') {
      const next = Math.min(PROG.u, LEVELS.length) - 1, started = !!Object.keys(PROG.b).length;
      const name = window.Auth && Auth.name && Auth.name();
      h = `<div class="panel">${logoSVG()}<h1>${t('se_t1')}<span>${t('se_t2')}</span></h1><p>${t('se_tag')}</p>
        <div class="col"><button class="btn big" data-act="play">${started ? t('se_cont', { n: next + 1 }) : t('se_play')}</button>
        <button class="btn big online" data-act="online">${t('se_online')}</button>
        <div class="row"><button class="btn sec" data-act="levels">${t('se_levels')}</button><button class="btn sec" data-act="howto">${t('se_howto')}</button></div>
        <div class="row"><button class="btn sec" data-act="sound">${t(Snd.muted ? 'se_snd_off' : 'se_snd_on')}</button><button class="btn sec" data-act="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button></div></div>
        <p class="muted">${t('se_stars', { n: totalStars(), m: LEVELS.length * 3 })}${name ? ' · 👤 ' + escapeHtml(name) : ''}</p></div>`;
    } else if (screen === 'levels') {
      h = `<div class="panel wide"><h2>${t('se_levels')}</h2><p class="muted">${t('se_stars', { n: totalStars(), m: LEVELS.length * 3 })}</p>
        <div class="grid">${LEVELS.map((_, i) => lvlCard(i)).join('')}</div><div class="row">${back}</div></div>`;
    } else if (screen === 'howto') {
      h = `<div class="panel wide"><h2>${t('se_howto')}</h2><div class="howto">${[1, 2, 3, 4, 5, 6, 7, 8].map(k => `<div>${t('se_h' + k)}</div>`).join('')}</div>
        <h3>${t('se_controls')}</h3><table class="kt">
        <tr><td>WASD / ← ↑ → ↓</td><td>${t('se_c_move')}</td></tr><tr><td>Q · 🌑</td><td>${t('se_c_weave')}</td></tr>
        <tr><td>E / Space · 🔔 ⚙️</td><td>${t('se_c_act')}</td></tr><tr><td>F · 🌉</td><td>${t('se_c_bridge')}</td></tr>
        <tr><td>M · 🗺️</td><td>${t('se_c_map')}</td></tr><tr><td>P / Esc · ⏸</td><td>${t('se_c_pause')}</td></tr><tr><td>R</td><td>${t('se_c_restart')}</td></tr></table>
        <h3>🌐 ${t('se_online')} · 🛡️ ${t('se_war')}</h3><div class="howto">${['se_wc_sel', 'se_wc_go', 'se_wc_steer', 'se_wc_flare', 'se_wc_rel', 'se_wc_sanct'].map(k => `<div>${t(k)}</div>`).join('')}</div>
        <div class="row">${back}</div></div>`;
    } else if (screen === 'online') {
      const authed = !!(window.Auth && Auth.profile), nm = (window.Auth && Auth.name && Auth.name()) || '';
      h = `<div class="panel"><h2>${t('se_on_title')}</h2><p class="muted">${t('se_on_tag')}</p>
        <label class="fld"><span>${t('se_name')}</span><input id="seName" maxlength="16" value="${escapeHtml(nm)}" placeholder="${t('se_name_ph')}" autocomplete="off" ${authed ? 'readonly' : ''}></label>
        <div class="roles">
          <button class="role" data-act="create" data-arg="inf"><span class="ri">🌘</span><b>${t('se_inf')}</b><span>${t('se_inf_d')}</span><em>${t('se_create_as')}</em></button>
          <button class="role" data-act="create" data-arg="war"><span class="ri">🛡️</span><b>${t('se_war')}</b><span>${t('se_war_d')}</span><em>${t('se_create_as')}</em></button>
        </div>
        <h3>${t('se_or')}</h3>
        <div class="row join"><input class="code" id="seCode" maxlength="6" placeholder="${t('se_code_ph')}" autocomplete="off" spellcheck="false"><button class="btn" data-act="join">${t('se_join')}</button></div>
        <p class="muted" id="seMsg"></p><div class="row">${back}</div></div>`;
    } else if (screen === 'lobby') {
      const P = NET.partner, host = isHost(), lv = NET.lvl;
      const ri = (r) => r === 'inf' ? '🌘' : r === 'war' ? '🛡️' : '⏳', rn = (r) => r ? t(r === 'inf' ? 'se_inf' : 'se_war') : t('se_connecting');
      h = `<div class="panel"><h2>${t('se_on_title')}</h2>
        <div class="roomcode"><span>${t('se_room')}</span><b>${escapeHtml(NET.code)}</b><button class="btn sec small" data-act="copy">${t('se_copy')}</button></div>
        <div class="plist">
          <div class="pl"><span class="ri">${ri(NET.role)}</span><div><b dir="auto">${escapeHtml(myName())}</b><small>${t('se_you')} · ${rn(NET.role)}${host ? ' · ' + t('se_host') : ''}</small></div></div>
          ${P ? `<div class="pl"><span class="ri">${ri(P.role)}</span><div><b dir="auto">${escapeHtml(P.n)}</b><small>${t('se_partner')} · ${rn(P.role)}${host ? '' : ' · ' + t('se_host')}</small></div></div>`
            : `<div class="pl wait">${t(NET.ready ? 'se_waiting' : 'se_connecting')}</div>`}
        </div>
        ${P && NET.role ? `<button class="btn sec" data-act="swap">${t('se_swap')}</button>` : ''}
        <div class="picker">${host ? '<button data-act="lv" data-arg="-1">−</button>' : ''}<div class="grow"><small>${t('se_lvl_pick')}</small><b>${lv + 1} · ${t(LEVELS[lv].name)}</b></div>${host ? '<button data-act="lv" data-arg="1">+</button>' : ''}</div>
        ${host ? `<button class="btn big" data-act="ostart" ${P ? '' : 'disabled'}>${t('se_start_on')}</button>${P ? '' : `<p class="muted">${t('se_need_p')}</p>`}` : `<p class="muted">${t('se_wait_host')}</p>`}
        <p class="muted" id="seMsg"></p><div class="row"><button class="btn sec" data-act="leave">${t('se_leave')}</button></div></div>`;
    } else if (screen === 'onready') {
      const inf = NET.role === 'inf', tips = ['se_wc_sel', 'se_wc_go'].concat(isTouch ? [] : ['se_wc_steer'], ['se_wc_flare', 'se_wc_rel']);
      h = `<div class="panel"><h3>${t('se_lvl', { n: curLevel + 1 })} · ${t(L.def.name)}</h3><h2>${inf ? '🌘' : '🛡️'} ${t(inf ? 'se_inf' : 'se_war')}</h2><p>${t(inf ? 'se_go_inf' : 'se_go_war')}</p>
        ${inf ? `<div class="obj">${t(L.gear ? 'se_obj_gear' : 'se_obj_exit')}</div>` : `<div class="howto">${tips.map(k => `<div>${t(k)}</div>`).join('')}</div>`}
        <h3>${t('se_ready')}</h3><div class="count" id="seCount">${Math.max(1, Math.ceil(NET.readyT))}</div></div>`;
    } else if (screen === 'onres') {
      const R = NET.endR || {}, inf = NET.role === 'inf', won = inf === (R.r === 'esc'), host = isHost(), last = curLevel >= LEVELS.length - 1;
      const line = R.r === 'esc' ? (inf ? 'se_r_esc_me' : 'se_r_esc_them') : (inf ? 'se_r_caught_me' : 'se_r_caught_them');
      h = `<div class="panel"><h3>${t('se_lvl', { n: curLevel + 1 })} · ${t(L.def.name)}</h3><h2>${t(won ? 'se_r_win' : 'se_r_lose')}</h2><p>${t(line)}</p>
        ${R.r === 'caught' && R.al ? `<p class="muted">${t('se_r_alarm')}</p>` : ''}
        <div class="stat"><span>${t('se_time')}: <b>${fmtT(R.t || 0)}</b></span></div>
        <p class="muted">${t('se_r_vs', { r: t(inf ? 'se_inf' : 'se_war'), p: escapeHtml(NET.partner ? NET.partner.n : '…') })}</p>
        <div class="col"><button class="btn big" data-act="rematch">${t('se_rematch')}</button>
        ${host && !last ? `<button class="btn sec" data-act="onext">${t('se_next_on')}</button>` : ''}
        <button class="btn sec" data-act="toroom">${t('se_to_room')}</button><p class="muted" id="seMsg"></p></div></div>`;
    } else if (screen === 'lost') {
      const solo = NET.phase === 'play' && NET.role === 'inf' && G && G.body;
      h = `<div class="panel"><h2>👋 ${t('se_lost_t')}</h2><p>${t(NET.role === 'inf' ? 'se_lost_inf' : 'se_lost_war')}</p>
        <div class="col">${solo ? `<button class="btn big" data-act="solo">${t('se_solo')}</button>` : ''}
        <div class="row"><button class="btn sec" data-act="toroom">${t('se_to_room')}</button><button class="btn sec" data-act="menu">${t('se_menu')}</button></div></div></div>`;
    } else if (screen === 'intro') {
      const d = L.def;
      h = `<div class="panel"><h3>${t('se_lvl', { n: curLevel + 1 })}</h3><h2>${t(d.name)}</h2><p>${t(d.desc)}</p>
        <div class="obj">${t(L.gear ? 'se_obj_gear' : 'se_obj_exit')}</div>
        <div class="checks">${starRows(PROG.b[curLevel] || {})}</div>
        <div class="col"><button class="btn big" data-act="begin">${t('se_start')}</button><div class="row"><button class="btn sec" data-act="levels">${t('se_levels')}</button><button class="btn sec" data-act="howto">${t('se_howto')}</button></div></div></div>`;
    } else if (screen === 'pause' && NET.phase === 'play') {   // online: pause is shared, no restart / level picking
      h = `<div class="panel"><h2>⏸️ ${t('se_paused')}</h2>${NET.pausedBy ? `<p class="muted">${t('se_paused_by', { p: escapeHtml(NET.pausedBy) })}</p>` : ''}
        <div class="col"><button class="btn big" data-act="resume">${t('se_resume')}</button>
        <div class="row"><button class="btn sec" data-act="howto">${t('se_howto')}</button><button class="btn sec" data-act="sound">${t(Snd.muted ? 'se_snd_off' : 'se_snd_on')}</button></div>
        <button class="btn sec" data-act="toroom">${t('se_to_room')}</button></div></div>`;
    } else if (screen === 'pause') {
      h = `<div class="panel"><h2>⏸️ ${t('se_paused')}</h2><p class="muted">${t('se_lvl', { n: curLevel + 1 })} · ${t(L.def.name)}</p>
        <div class="col"><button class="btn big" data-act="resume">${t('se_resume')}</button>
        <div class="row"><button class="btn sec" data-act="restart">${t('se_restart')}</button><button class="btn sec" data-act="levels">${t('se_levels')}</button></div>
        <div class="row"><button class="btn sec" data-act="howto">${t('se_howto')}</button><button class="btn sec" data-act="sound">${t(Snd.muted ? 'se_snd_off' : 'se_snd_on')}</button></div>
        <button class="btn sec" data-act="menu">${t('se_menu')}</button></div></div>`;
    } else if (screen === 'win') {
      const r = G.result || {}, last = curLevel >= LEVELS.length - 1;
      h = `<div class="panel"><h3>${t('se_lvl', { n: curLevel + 1 })} · ${t(L.def.name)}</h3><h2>🏆 ${t('se_win')}</h2>
        <div class="stars"><span class="on">★</span><span class="${r.ghost ? 'on' : ''}">★</span><span class="${r.fast ? 'on' : ''}">★</span></div>
        <div class="checks">${starRows({ d: 1, g: r.ghost, f: r.fast })}</div>
        <div class="stat"><span>${t('se_time')}: <b>${fmtT(r.time || 0)}</b></span><span>${t('se_best')}: <b>${fmtT(r.best || r.time || 0)}</b></span></div>
        ${r.newBest ? `<p>${t('se_new_best')}</p>` : ''}${last ? `<p class="obj">${t('se_all_done')}</p>` : ''}
        <div class="col">${last ? `<button class="btn big" data-act="menu">${t('se_menu')}</button>` : `<button class="btn big" data-act="next">${t('se_next')}</button>`}
        <div class="row"><button class="btn sec" data-act="restart">${t('se_retry')}</button><button class="btn sec" data-act="levels">${t('se_levels')}</button></div></div></div>`;
    } else if (screen === 'lose') {
      h = `<div class="panel"><h2>🚨 ${t('se_caught')}</h2><p>${t('se_caught_d')}</p>
        <div class="col"><button class="btn big" data-act="restart">${t('se_retry')}</button><div class="row"><button class="btn sec" data-act="levels">${t('se_levels')}</button><button class="btn sec" data-act="menu">${t('se_menu')}</button></div></div></div>`;
    }
    ov.innerHTML = h;
    if (ov.firstElementChild) { ov.firstElementChild.setAttribute('data-m3pop', ''); if (window.Mal3abPopButtons) window.Mal3abPopButtons(); }   // 🏠 + 💬 in every popup
    if (screen === 'win') ov.querySelectorAll('.stars span').forEach((s, k) => setTimeout(() => { s.classList.add('show'); if (s.classList.contains('on')) Snd.plate(); }, 200 + k * 260));
    const ci = $('seCode'); if (ci) { ci.onkeydown = (e) => { if (e.key === 'Enter') act('join'); }; ci.oninput = () => { ci.value = ci.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; }
    syncChrome();
  }
  function starRows(b) {
    const row = (ok, txt) => `<div class="${ok ? 'ok' : 'no'}">${ok ? '★' : '☆'} ${txt}</div>`;
    return row(b.d, t('se_s_done')) + row(b.g, t('se_s_ghost')) + row(b.f, t('se_s_fast', { s: L.def.par }));
  }
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  ov.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    Snd.unlock(); Snd.click(); act(b.dataset.act, b.dataset.arg, b);
  });
  async function act(a, arg, btn) {
    switch (a) {
      // ---- online
      case 'online': showScreen('online', 'menu'); break;
      case 'create': { saveName(); if (!(await canGoOnline())) return; joinRoom(newCode(), arg === 'war' ? 'war' : 'inf'); break; }
      case 'join': {
        const ci = $('seCode'), code = (ci ? ci.value : '').trim().toUpperCase();
        if (code.length < 4) { note('se_code_hint'); return; }
        saveName(); if (!(await canGoOnline())) return; joinRoom(code, null); break;
      }
      case 'copy': copyText(inviteLink(NET.code), btn); break;
      case 'swap': swapRoles(); break;
      case 'lv': if (isHost()) { NET.lvl = (NET.lvl + (+arg) + LEVELS.length) % LEVELS.length; netSend('sel', { l: NET.lvl }); renderScreen(); } break;
      case 'ostart': goLevel(NET.lvl); break;
      case 'leave': toMenu(); break;
      case 'toroom': netSend('lobby', {}); toLobby(); break;
      case 'rematch': if (isHost()) goLevel(curLevel); else { netSend('req', { act: 're' }); note('se_wait_host'); } break;
      case 'onext': if (isHost()) goLevel(Math.min(curLevel + 1, LEVELS.length - 1)); break;
      case 'solo': if (G && G.body) { leaveRoom(); for (const g of G.guards) release(g); mode = 'play'; hideScreen(); updateHUD(true); } break;
      case 'play': startLevel(Math.min(PROG.u, LEVELS.length) - 1); break;
      case 'levels': showScreen('levels', screen); break;
      case 'howto': showScreen('howto', screen); break;
      case 'back': showScreen(screenBack && screenBack !== screen ? screenBack : (mode === 'attract' ? 'menu' : mode === 'pause' ? 'pause' : mode === 'intro' ? 'intro' : 'menu'), null); break;
      case 'level': startLevel(+arg); break;
      case 'begin': begin(); break;
      case 'resume': resume(); break;
      case 'restart': startLevel(curLevel, true); break;
      case 'next': startLevel(Math.min(curLevel + 1, LEVELS.length - 1)); break;
      case 'menu': toMenu(); break;
      case 'sound': toggleSound(); renderScreen(); break;
      case 'lang': setLang(getLang() === 'ar' ? 'en' : 'ar'); break;
    }
  }
  function toggleSound() { SET.mute = !Snd.muted; Snd.setMute(SET.mute); store.set(K_SET, SET); $('soundBtn').textContent = Snd.muted ? '🔇' : '🔊'; }

  // ------------------------------------------------------------------ flow
  function loadAttract() {
    curLevel = 0; L = buildLevel(Math.min(1, LEVELS.length - 1)); newState(true); mode = 'attract'; camUpdate(1, true);
  }
  function startLevel(i, skipIntro) {
    curLevel = clamp(i, 0, LEVELS.length - 1);
    L = buildLevel(curLevel); newState(false); mode = 'intro'; tipShown = null;
    $('toast').classList.remove('on'); toastT = 0;
    camUpdate(1, true);
    if (skipIntro) begin(); else showScreen('intro', null);
  }
  function begin() { if (mode !== 'intro') return; mode = 'play'; hideScreen(); updateHUD(true); }
  // online: pausing is shared — `by` is the partner's name when they paused it
  function pause(by) {
    if (mode !== 'play') return; mode = 'pause'; keys.clear(); joyReset();
    const remote = typeof by === 'string'; NET.pausedBy = remote ? by : ''; showScreen('pause', null);
    if (NET.code && NET.phase === 'play' && !remote) netSend('pause', { on: 1 });
  }
  function resume(remote) { if (mode !== 'pause') return; mode = 'play'; hideScreen(); if (NET.code && NET.phase === 'play' && remote !== true) netSend('pause', { on: 0 }); }
  function toMenu() { if (NET.code) leaveRoom(); NET.phase = 'menu'; loadAttract(); showScreen('menu', null); }
  function toggleMap() { if (G && (mode === 'play' || mode === 'pause')) { G.overview = !G.overview; G.flags.map = true; if (G.overview) toast('se_future', null, 3); } }

  // ------------------------------------------------------------------ input
  const keys = new Set();
  const MOVE = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  window.addEventListener('keydown', (e) => {
    const k = e.code;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (MOVE.has(k) || k === 'Space' || k === 'Tab') e.preventDefault();
    Snd.unlock();
    if (e.repeat) { if (MOVE.has(k)) keys.add(k); return; }
    keys.add(k);
    if (G && G.war) {   // online Warden
      if (mode === 'play') wardenKey(k);
      else if (mode === 'pause' && screen === 'pause' && (k === 'KeyP' || k === 'Escape')) resume();
      else if (screen === 'howto' && k === 'Escape') act('back');
      return;
    }
    if (NET.code && NET.phase === 'play') {   // online Infiltrator: no restart key, and the partner-left popup can't be skipped
      if (k === 'KeyR') return;
      if (mode === 'pause' && screen !== 'pause') { if (screen === 'howto' && k === 'Escape') act('back'); return; }
    }
    if (mode === 'play') {
      if (k === 'KeyQ') startWeave();
      else if (k === 'KeyE' || k === 'Space' || k === 'Enter') action();
      else if (k === 'KeyF') tryBridge();
      else if (k === 'KeyM' || k === 'Tab') toggleMap();
      else if (k === 'KeyP' || k === 'Escape') pause();
      else if (k === 'KeyR') startLevel(curLevel, true);
    } else if (mode === 'pause') {
      if (k === 'KeyP' || k === 'Escape') { if (screen === 'pause') resume(); else showScreen('pause', null); }
      else if (k === 'KeyR') startLevel(curLevel, true);
    } else if (mode === 'intro' && screen === 'intro') { if (k === 'Enter' || k === 'Space') begin(); }
    else if (mode === 'win' && screen === 'win') { if (k === 'Enter' || k === 'Space') act(curLevel >= LEVELS.length - 1 ? 'menu' : 'next'); else if (k === 'KeyR') startLevel(curLevel, true); }
    else if (mode === 'lose' && screen === 'lose') { if (k === 'Enter' || k === 'Space' || k === 'KeyR') startLevel(curLevel, true); }
    else if (screen && k === 'Escape' && (screen === 'levels' || screen === 'howto')) act('back');
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); joyReset(); if (!NET.code) pause(); });   // online: opening the chat must not pause the match
  document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); pause(); } });

  // virtual joystick + buttons
  const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const jz = $('joyZone'), jb = $('joy'), kn = $('knob');
  function setTouch() { if (isTouch) return; isTouch = true; document.body.classList.add('touch'); tipShown = null; syncChrome(); }
  function joyHome() { jb.hidden = false; jb.style.left = Math.max(80, VW * 0.14) + 'px'; jb.style.top = (VH - Math.max(96, VH * 0.17)) + 'px'; kn.style.transform = ''; jb.classList.remove('on'); }
  function joyReset() { joy.active = false; joy.id = null; joy.x = 0; joy.y = 0; if (isTouch) joyHome(); }
  jz.addEventListener('pointerdown', (e) => {
    e.preventDefault(); Snd.unlock(); setTouch();
    joy.active = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = 0; joy.y = 0;
    jb.hidden = false; jb.style.left = e.clientX + 'px'; jb.style.top = e.clientY + 'px'; jb.classList.add('on'); kn.style.transform = '';
    try { jz.setPointerCapture(e.pointerId); } catch (er) {}
  });
  jz.addEventListener('pointermove', (e) => {
    if (!joy.active || e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy), mx = 50;
    if (d > mx) { dx = dx / d * mx; dy = dy / d * mx; }
    joy.x = dx / mx; joy.y = dy / mx; kn.style.transform = `translate(${dx}px,${dy}px)`;
  });
  const jup = (e) => { if (e.pointerId === joy.id) joyReset(); };
  jz.addEventListener('pointerup', jup); jz.addEventListener('pointercancel', jup);
  const tbtn = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Snd.unlock(); setTouch(); const b = $(id); if (b.disabled) { Snd.deny(); return; } b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140); fn(); });
  tbtn('bWeave', startWeave); tbtn('bAct', action); tbtn('bBridge', tryBridge);
  window.addEventListener('touchstart', () => setTouch(), { passive: true, once: true });
  try { if (window.matchMedia && matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) isTouch = true; } catch (e) {}
  if (isTouch) document.body.classList.add('touch');

  $('pauseBtn').onclick = () => { Snd.unlock(); if (mode === 'play') pause(); else if (mode === 'pause') resume(); };
  $('mapBtn').onclick = () => { Snd.unlock(); toggleMap(); };
  $('soundBtn').onclick = () => { Snd.unlock(); toggleSound(); if (screen === 'menu' || screen === 'pause') renderScreen(); };
  $('langBtn').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
  document.addEventListener('langchange', () => { hud.eye = null; tipShown = null; renderScreen(); syncChrome(); });
  document.addEventListener('mal3abready', () => { if (screen === 'menu') renderScreen(); });
  window.addEventListener('resize', () => { resize(); if (isTouch) joyHome(); });

  // ------------------------------------------------------------------ main loop
  let last = performance.now(), hudT = 0;
  function frame(now) {
    const raw = Math.max(0, (now - last) / 1000), dt = Math.min(0.05, raw); last = now;
    if (mode === 'play') watchQuality(raw);
    try {
      if (G) {
        if (G.war) { if (mode === 'play') wardenUpdate(dt); }   // online Warden: no simulation here, only the Infiltrator's snapshots
        else if (mode === 'play' || mode === 'attract') update(dt);
        updateFx(dt);
        if (mode === 'play') { hudT -= dt; if (hudT <= 0) { hudT = 0.05; updateHUD(false); } }
        netFrame(dt);
      }
      render(dt);
    } catch (err) { console.error(err); }
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ online: Infiltrator vs Warden (Supabase Realtime broadcast, room "shadow-eclipse-CODE")
  // The Infiltrator's side runs the whole game (sun, shadows, guards, detection) and streams snapshots ~15×/s, so sneaking never lags.
  // The Warden only renders those snapshots and sends guard commands (waypoint / steer / release) and flares. The host picks the level.
  const NET = { ch: null, code: '', ready: false, me: '', jt: 0, role: null, partner: null, hb: null, phase: 'menu', lvl: 3, playAt: 0,
    sel: -1, aim: false, steering: false, steerT: 0, stT: 0, endR: null, pausedBy: '', readyT: 0 };
  const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'roles', 'sel', 'go', 'st', 'cmd', 'ev', 'end', 'pause', 'lobby', 'req'];
  const ST_CODES = ['patrol', 'suspicious', 'search', 'look', 'return', 'alarm', 'ctl'];
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newCode = () => { let s = ''; for (let i = 0; i < 4; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; };
  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (code) => pageLink() + '?room=' + code;
  const otherRole = (r) => r === 'inf' ? 'war' : 'inf';
  function myName() { return (window.Auth && Auth.name && Auth.name()) || t('se_player'); }
  function isWarden() { return !!(G && G.war); }
  function netAuth() { return !!(NET.code && NET.role === 'inf' && NET.phase === 'play' && G && G.body && !attract); }   // this side runs the match
  function isHost() { const P = NET.partner; return !P || NET.jt < P.jt || (NET.jt === P.jt && NET.me < P.id); }
  async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
  function netSend(ev, p) { if (!NET.ch || !NET.ready) return; try { NET.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: NET.me }, p || {}) }); } catch (e) {} }
  function note(key, vars) { if (!$('hud').hidden) { toast(key, vars); return; } const m = $('seMsg'); if (m) m.textContent = t(key, vars); }
  function saveName() { const i = $('seName'); if (!i || (window.Auth && Auth.profile)) return; const v = i.value.trim().slice(0, 16); if (v && window.Auth && Auth.setGuestName) Auth.setGuestName(v); }
  function copyText(text, btn) {
    const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = t('se_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
  }
  function joinRoom(code, role) {
    leaveRoom(true);
    if (!window.sb) { note('se_no_net'); return false; }
    code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (code.length < 4) return false;
    let id = '', jt = 0;   // same id + join time after a reload, so you come back as the same player (and the host stays the host)
    try { id = sessionStorage.getItem('shadow-eclipse-id-' + code) || ''; jt = +sessionStorage.getItem('shadow-eclipse-jt-' + code) || 0; } catch (e) {}
    if (!id) id = Math.random().toString(36).slice(2, 10); if (!jt) jt = Date.now();
    try { sessionStorage.setItem('shadow-eclipse-id-' + code, id); sessionStorage.setItem('shadow-eclipse-jt-' + code, String(jt)); } catch (e) {}
    Object.assign(NET, { me: id, jt, code, role: role || null, ready: false, partner: null, phase: 'lobby', sel: -1, aim: false, endR: null });
    const ch = sb.channel('shadow-eclipse-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && NET.ch === ch) { NET.ready = true; hello(true); if (screen === 'lobby') renderScreen(); } });
    NET.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    window.Mal3abShareLink = () => inviteLink(code);
    clearInterval(NET.hb); NET.hb = setInterval(netBeat, 2000);
    toLobby();
    return true;
  }
  function leaveRoom(quiet) {
    if (NET.ch) { netSend('bye', {}); const ch = NET.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(NET.hb); Object.assign(NET, { ch: null, ready: false, code: '', partner: null, role: null, phase: 'menu', sel: -1, aim: false });
    window.Mal3abShareLink = () => pageLink();
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  }
  function toLobby() { NET.phase = 'lobby'; NET.sel = -1; NET.aim = false; NET.endR = null; keys.clear(); loadAttract(); showScreen('lobby', null); }
  function hello(req) { netSend('hello', { n: myName(), role: NET.role, jt: NET.jt, req: !!req, ph: NET.phase, l: NET.lvl }); }
  function netBeat() {
    if (!NET.ch) return;
    netSend('hb', { n: myName(), role: NET.role, jt: NET.jt, ph: NET.phase, l: NET.lvl });
    if (NET.partner && Date.now() - NET.partner.t > 9000) partnerGone();
  }
  function resolveRoles(p) {
    if (NET.phase === 'play' && NET.role) return;
    const mineFirst = NET.jt < p.jt || (NET.jt === p.jt && NET.me < p.id);
    if (!p.role && !NET.role) NET.role = mineFirst ? 'inf' : 'war';
    else if (!NET.role) NET.role = otherRole(p.role);
    else if (p.role === NET.role && !mineFirst) NET.role = otherRole(p.role);
  }
  function onNet(ev, p) {
    if (!p || p.id === NET.me) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === NET.me) { toMenu(); showScreen('online', 'menu'); note('se_full'); } return; }
    let P = NET.partner;
    if (P && P.id !== p.id) {   // a third player
      if (now - P.t < 9000) { if (ev === 'hello') netSend('full', { to: p.id }); return; }
      partnerGone(true); P = null;
    }
    if (ev === 'bye') { if (P) partnerGone(); return; }
    if (!P) {
      P = NET.partner = { id: p.id, n: p.n || '…', role: null, t: now, jt: p.jt || now, ph: p.ph };
      note('se_joined', { p: P.n }); Snd.plate();
      if (screen === 'lost') {   // they came back
        if (NET.phase === 'result') showScreen('onres', null);
        else { hideScreen(); if (mode === 'pause' && G && G.body) mode = 'play'; }
      }
    }
    P.t = now; if (p.n) P.n = p.n; if (p.jt) P.jt = p.jt;
    if (ev === 'hello' || ev === 'hb') {
      if ('role' in p) P.role = p.role; P.ph = p.ph;
      const before = NET.role; resolveRoles(p);
      if (!isHost() && NET.phase === 'lobby' && p.l != null) NET.lvl = clamp(p.l | 0, 0, LEVELS.length - 1);
      if (ev === 'hello' && p.req) hello(false); else if (before !== NET.role) hello(false);
      // the partner reloaded the page in the middle of a match
      if (NET.phase === 'play' && (p.ph === 'lobby' || p.ph === 'menu') && now - NET.playAt > 4000) {
        if (NET.role === 'inf' && G && G.body) sendGo(true);   // the Warden only watches: bring them straight back in
        else if (NET.role === 'war') toLobby();                 // the Infiltrator ran the match, so it is gone
      }
      if (screen === 'lobby') renderScreen();
      return;
    }
    switch (ev) {
      case 'roles': NET.role = p.inf === NET.me ? 'inf' : 'war'; P.role = otherRole(NET.role); if (screen === 'lobby') renderScreen(); break;
      case 'sel': if (!isHost() && NET.phase === 'lobby') { NET.lvl = clamp(p.l | 0, 0, LEVELS.length - 1); if (screen === 'lobby') renderScreen(); } break;
      case 'go':
        NET.role = p.inf === NET.me ? 'inf' : 'war'; P.role = otherRole(NET.role);
        if (p.mid && NET.phase === 'play' && curLevel === (p.l | 0)) break;
        enterOnlineLevel(p.l | 0, !!p.mid); break;
      case 'st': if (isWarden() && NET.phase === 'play') applySt(p); break;
      case 'cmd': if (netAuth()) onCmd(p); break;
      case 'ev': if (isWarden() && NET.phase === 'play') wardenEvent(p); break;
      case 'end': if (isWarden() && NET.phase === 'play') wardenEnd(p); break;
      case 'pause': if (NET.phase === 'play') { if (p.on) pause(P.n); else resume(true); } break;
      case 'lobby': if (NET.phase !== 'lobby') toLobby(); break;
      case 'req': if (isHost() && NET.phase === 'result' && p.act === 're') goLevel(curLevel); break;
    }
  }
  function partnerGone(silent) {
    const P = NET.partner; if (!P) return; NET.partner = null;
    if (!silent) note('se_left', { p: P.n });
    if (NET.phase === 'play' || NET.phase === 'result') {
      if (NET.phase === 'play' && mode === 'play') { mode = 'pause'; keys.clear(); joyReset(); }   // freeze the match while you decide
      showScreen('lost', null);
    } else if (screen === 'lobby') renderScreen();
  }
  function swapRoles() {
    if (!NET.partner || !NET.role) return;
    NET.role = otherRole(NET.role); NET.partner.role = otherRole(NET.role);
    netSend('roles', { inf: NET.role === 'inf' ? NET.me : NET.partner.id });
    renderScreen();
  }
  function goLevel(l) {   // host: start (or restart) a match for both players
    if (!NET.partner) { note('se_need_p'); return; }
    NET.lvl = clamp(l, 0, LEVELS.length - 1);
    netSend('go', { l: NET.lvl, inf: NET.role === 'inf' ? NET.me : NET.partner.id, mid: false });
    enterOnlineLevel(NET.lvl, false);
  }
  function sendGo(mid) { netSend('go', { l: curLevel, inf: NET.me, mid: !!mid }); }
  function enterOnlineLevel(l, mid) {
    Object.assign(NET, { phase: 'play', playAt: Date.now(), sel: -1, aim: false, steering: false, endR: null, pausedBy: '', stT: 0 });
    curLevel = clamp(l, 0, LEVELS.length - 1); NET.lvl = curLevel;
    L = buildLevel(curLevel); newState(false); tipShown = null;
    $('toast').classList.remove('on'); toastT = 0; keys.clear(); joyReset();
    if (NET.role === 'war') { G.war = true; G.body = null; G.sunT = G.sun; for (const g of G.guards) { g.tx = g.x; g.ty = g.y; g.ta = g.a; } }
    mode = 'intro'; camUpdate(1, true);
    if (mid) { mode = 'play'; hideScreen(); updateHUD(true); } else { NET.readyT = 3; showScreen('onready', null); }
  }
  function netFrame(dt) {
    if (NET.phase !== 'play') return;
    if (mode === 'intro' && screen === 'onready') {   // shared 3-2-1 before the match
      NET.readyT -= dt; const el = $('seCount'), n = String(Math.max(1, Math.ceil(NET.readyT)));
      if (el && el.textContent !== n) { el.textContent = n; Snd.tick(true); }
      if (NET.readyT <= 0) { mode = 'play'; hideScreen(); updateHUD(true); }
    }
    if (netAuth() && mode === 'play') { NET.stT -= dt; if (NET.stT <= 0) { NET.stT = 0.066; sendSt(); } }
  }
  // ---- the Infiltrator's side (authority)
  function bodyVisToWarden() {
    const b = G.body; if (mode === 'lose') return true;
    for (const g of G.guards) if (g.sees) return true;
    for (const f of G.flares) { const r = FLARE_R * flareK(f); if (Math.hypot(b.x - f.x, b.y - f.y) < r * 0.92 && losClear(f.x, f.y, b.x, b.y)) return true; }
    return false;
  }
  function sendSt() {
    const b = G.body;
    netSend('st', {
      lv: curLevel, t: r2(G.time), sun: r2(G.sun), fz: r2(G.freezeT), bo: r2(G.boost), gt: G.gearTaken ? 1 : 0,
      al: G.alarm ? 1 : 0, at: r2(G.alarmT), ad: G.alarmed ? 1 : 0, vg: G.vigil,
      h: L.hands.map(h => r2(h.a)), cg: L.circles.filter(c => c.kind === 'cog').map(c => r2(c.rot)),
      d: L.doors.map(d => r2(d.open)), pl: L.plates.reduce((m, p, k) => m | (p.on ? 1 << k : 0), 0), lc: L.levers.map(l => r2(l.cd)),
      g: G.guards.map(g => [r2(g.x), r2(g.y), r2(g.a), ST_CODES.indexOf(g.state), Math.round(g.meter * 100), (g.sees ? 1 : 0) | (g.ctl ? 2 : 0), g.ctl && g.ctl.k === 'go' ? [r2(g.ctl.tx), r2(g.ctl.ty)] : 0]),
      b: bodyVisToWarden() ? [r2(b.x), r2(b.y), r2(b.a)] : 0,   // the Warden only gets your position while a guard (or a flare) sees you
      lk: G.alarm && G.lastKnown ? [r2(G.lastKnown.x), r2(G.lastKnown.y)] : 0,
      f: G.flares.map(f => [r2(f.x), r2(f.y), r2(f.t)]), fc: r2(G.flareCd),
    });
  }
  function netEnd(r) {
    sendSt();
    NET.endR = { r, al: G.alarm ? 1 : 0, t: r2(G.time) }; NET.phase = 'result';
    netSend('end', Object.assign({ b: [r2(G.body.x), r2(G.body.y), r2(G.body.a)] }, NET.endR));
    setTimeout(() => { if (NET.phase === 'result') showScreen('onres', null); }, r === 'esc' ? 900 : 1000);
  }
  // ---- the Warden's side (renders snapshots, sends commands)
  function applySt(p) {
    if (!G || !G.war || p.lv !== curLevel) return;
    if (Math.abs(G.time - p.t) > 0.5) G.time = p.t;
    G.sunT = p.sun; G.freezeT = p.fz; G.boost = p.bo;
    if (!!p.gt !== G.gearTaken) { G.gearTaken = !!p.gt; if (G.gearTaken && L.gear) { Snd.pickup(); puff(L.gear.x, L.gear.y, 30, '255,200,80', 3, 0.9, 0.08, true); } }
    if (L.gear) L.gear.taken = G.gearTaken;
    G.alarm = !!p.al; G.alarmT = p.at; G.alarmed = !!p.ad; G.vigil = p.vg || 1;
    (p.h || []).forEach((a, k) => { if (L.hands[k]) L.hands[k].ta = a; });
    const cogs = L.circles.filter(c => c.kind === 'cog'); (p.cg || []).forEach((r, k) => { if (cogs[k]) cogs[k].rot = r; });
    (p.d || []).forEach((o, k) => { if (L.doors[k]) L.doors[k].open = o; });
    L.plates.forEach((pl, k) => { pl.on = !!((p.pl >> k) & 1); });
    (p.lc || []).forEach((cd, k) => { const l = L.levers[k]; if (!l) return; if (cd > l.cd + 1) { l.anim = 1; Snd.lever(); } l.cd = cd; });
    (p.g || []).forEach((a, k) => {
      const g = G.guards[k]; if (!g) return;
      g.tx = a[0]; g.ty = a[1]; g.ta = a[2];
      const st = ST_CODES[a[3]] || 'patrol'; if (st !== g.state) { g.state = st; g.iconT = 0; }
      g.meter = a[4] / 100; g.sees = !!(a[5] & 1); g.isCtl = !!(a[5] & 2); g.goT = a[6] ? { x: a[6][0], y: a[6][1] } : null;
    });
    G.spyT = p.b ? { x: p.b[0], y: p.b[1], a: p.b[2] } : null;
    G.lk = p.lk ? { x: p.lk[0], y: p.lk[1] } : null;
    G.flares = (p.f || []).map(f => ({ x: f[0], y: f[1], t: f[2] })); G.flareCd = p.fc || 0;
  }
  function wardenUpdate(dt) {
    const k = 1 - Math.exp(-14 * dt);
    G.time += dt;
    if (G.sunT != null) { const d = ((G.sunT - G.sun) % 360 + 540) % 360 - 180; G.sun = ((G.sun + d * k) % 360 + 360) % 360; }
    const sa = G.sun * D2R; G.sx = Math.sin(sa); G.sy = -Math.cos(sa);
    for (const h of L.hands) if (h.ta != null) h.a += angDiff(h.a, h.ta) * k;
    for (const g of G.guards) {
      if (g.tx == null) continue;
      const ox = g.x, oy = g.y;
      if (Math.hypot(g.tx - g.x, g.ty - g.y) > 3) { g.x = g.tx; g.y = g.ty; } else { g.x = lerp(g.x, g.tx, k); g.y = lerp(g.y, g.ty, k); }
      g.a += angDiff(g.a, g.ta) * k; g.bob += Math.hypot(g.x - ox, g.y - oy) * 7; updateLanternPos(g); g.iconT += dt;
    }
    if (G.spyT) {   // the Infiltrator, only while one of your guards (or a flare) can see them
      if (!G.spy) { G.spy = { x: G.spyT.x, y: G.spyT.y, a: G.spyT.a, moving: false, walk: 0, daze: 0 }; Snd.sus(); G.pings.push({ x: G.spy.x, y: G.spy.y, t: 0, k: 'seen' }); }
      const s = G.spy, ox = s.x, oy = s.y; s.x = lerp(s.x, G.spyT.x, k); s.y = lerp(s.y, G.spyT.y, k); s.a += angDiff(s.a, G.spyT.a) * k;
      const mv = Math.hypot(s.x - ox, s.y - oy); s.moving = mv > 0.002; s.walk += mv * 3.2;
      G.ghost = { x: s.x, y: s.y, t: 0 };
    } else G.spy = null;
    if (G.ghost) G.ghost.t += dt;
    for (const f of G.flares) f.t += dt;
    G.flareCd = Math.max(0, G.flareCd - dt);
    for (const l of L.levers) l.anim = Math.max(0, l.anim - dt * 1.4);
    for (let i = G.pings.length - 1; i >= 0; i--) if ((G.pings[i].t += dt) > 2.2) G.pings.splice(i, 1);
    // steer the selected guard by hand (WASD / arrows)
    const inp = readInput(); NET.steerT -= dt;
    if (G.guards[NET.sel] && inp.m > 0.1) { if (NET.steerT <= 0) { NET.steerT = 0.09; NET.steering = true; netSend('cmd', { k: 'steer', g: NET.sel, x: r2(inp.x), y: r2(inp.y) }); } }
    else if (NET.steering) { NET.steering = false; netSend('cmd', { k: 'steer', g: NET.sel, x: 0, y: 0 }); }
    if (G.freezeT <= 0) { G.tickT -= dt * (G.boost > 0 ? 4 : G.gearTaken ? 1.6 : 1); if (G.tickT <= 0) { G.tickT = 0.5; G.tickHi = !G.tickHi; Snd.tick(G.tickHi); } }
  }
  function wardenEvent(p) {
    if (p.k === 'spot') { toast('se_a_spot', null, 2); Snd.sus(); G.pings.push({ x: +p.x, y: +p.y, t: 0, k: 'spot' }); }
    else if (p.k === 'hear') { toast('se_a_hear', null, 2); Snd.clank(); G.rings.push({ x: +p.x, y: +p.y, t: 0 }); G.pings.push({ x: +p.x, y: +p.y, t: 0, k: 'hear' }); }
    else if (p.k === 'alarm') { Snd.alarm(); G.shake = Math.max(G.shake, 0.3); G.flash = 0.3; G.flashCol = '255,60,60'; toast('se_a_alarm', null, 3); }
    else if (p.k === 'calm') toast('se_a_calm');
    else if (p.k === 'free' && p.g === NET.sel) toast('se_a_free');
  }
  function wardenEnd(p) {
    NET.endR = { r: p.r === 'esc' ? 'esc' : 'caught', al: p.al ? 1 : 0, t: +p.t || 0 }; NET.phase = 'result';
    mode = NET.endR.r === 'esc' ? 'win' : 'lose'; NET.aim = false;
    if (p.b) G.spy = { x: p.b[0], y: p.b[1], a: p.b[2], moving: false, walk: 0, daze: 0 };
    if (NET.endR.r === 'esc') { Snd.drain(); if (L.exit) puff(L.exit.x, L.exit.y, 40, '120,255,190', 3, 1.1, 0.09, true); }
    else { Snd.win(); G.shake = 0.5; G.flash = 0.4; G.flashCol = '255,80,80'; if (G.spy) puff(G.spy.x, G.spy.y, 26, '255,90,90', 2.4, 0.8, 0.08, true); }
    syncChrome();
    setTimeout(() => { if (NET.phase === 'result') showScreen('onres', null); }, 1000);
  }
  function selectGuard(i) {
    const old = G.guards[NET.sel];
    if (old && old.isCtl && i !== NET.sel) netSend('cmd', { k: 'rel', g: NET.sel });   // an unselected guard goes back to its own patrol
    NET.sel = i; NET.steering = false; Snd.click(); updateHUD(true);
  }
  function wFlare() {
    if (!isWarden() || mode !== 'play') return;
    if (G.flareCd > 0) { toast('se_flare_wait', { s: Math.ceil(G.flareCd) }); Snd.deny(); return; }
    NET.aim = !NET.aim; if (NET.aim) toast('se_flare_aim', null, 3); updateHUD(true);
  }
  function wRelease() { if (isWarden() && NET.sel >= 0) { netSend('cmd', { k: 'rel', g: NET.sel }); Snd.click(); } }
  function wNext() { if (isWarden() && G.guards.length) selectGuard((NET.sel + 1) % G.guards.length); }
  function wardenKey(k) {
    if (k === 'KeyF') wFlare();
    else if (k === 'KeyX' || k === 'KeyR') wRelease();
    else if (k === 'Tab' || k === 'KeyQ' || k === 'KeyN') wNext();
    else if (k === 'KeyM') toggleMap();
    else if (k === 'Escape' && NET.aim) { NET.aim = false; updateHUD(true); }
    else if (k === 'KeyP' || k === 'Escape') pause();
  }
  function wardenTap(cx, cy) {
    if (!isWarden() || mode !== 'play') return;
    const wx = (cx - VW / 2) / cam.s + cam.x + cam.sx, wy = (cy - VH / 2) / cam.s + cam.y + cam.sy;
    if (NET.aim) {
      NET.aim = false; updateHUD(true);
      if (G.flareCd > 0) { toast('se_flare_wait', { s: Math.ceil(G.flareCd) }); Snd.deny(); return; }
      if (wx < 0 || wy < 0 || wx >= L.W || wy >= L.H) { Snd.deny(); return; }
      netSend('cmd', { k: 'flare', x: r2(wx), y: r2(wy) }); toast('se_flare_on'); return;
    }
    let best = -1, bd = Math.max(0.8, 30 / cam.s);
    G.guards.forEach((g, i) => { const d = Math.hypot(g.x - wx, g.y - wy); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { selectGuard(best === NET.sel ? -1 : best); return; }
    const g = G.guards[NET.sel];
    if (!g) { toast('se_tap_guard'); Snd.deny(); return; }
    const tt = tileAt(wx, wy);
    if (g.type !== 'w' && sanctD(wx, wy) < SANCT_R) { toast('se_sanct'); Snd.deny(); return; }
    if (g.type !== 'w' && (tt === 1 || tt === 2 || tt === 4)) { toast('se_bad_spot'); Snd.deny(); return; }
    netSend('cmd', { k: 'go', g: NET.sel, x: r2(wx), y: r2(wy) }); G.pings.push({ x: wx, y: wy, t: 0, k: 'go' }); Snd.click();
  }
  function wardenHUD(force) {
    const eye = $('eyeChip');
    if (force || hud.eye !== 'w') { hud.eye = 'w'; eye.innerHTML = `<i>🛡️</i>${t('se_war')}`; eye.className = 'chip war'; }
    const m = Math.round((1 - G.flareCd / FLARE_CD) * 200) / 2;
    if (force || m !== hud.meter) { hud.meter = m; $('meterFill').style.height = m + '%'; $('meter').classList.toggle('low', G.flareCd > 0); }
    const al = G.alarm ? Math.ceil(G.alarmT) : null;
    if (force || al !== hud.alarm) { hud.alarm = al; const el = $('alarmChip'); el.hidden = al == null; if (al != null) el.textContent = t('se_alarm_t', { s: al }); }
    const bf = $('bFlare'), cd = Math.ceil(G.flareCd), fs = (NET.aim ? 'a' : 'n') + cd;
    if (force || bf.dataset.s !== fs) { bf.dataset.s = fs; bf.innerHTML = `🔥<small>${cd > 0 ? cd + (getLang() === 'ar' ? ' ث' : 's') : t('se_b_flare')}</small>`; bf.disabled = cd > 0; bf.classList.toggle('on', NET.aim); }
    const g = G.guards[NET.sel], rs = g ? (g.isCtl ? 'c' : 's') : 'x', br = $('bRel');
    if (force || br.dataset.s !== rs) { br.dataset.s = rs; br.innerHTML = `✋<small>${t('se_b_release')}</small>`; br.disabled = rs === 'x'; }
    const bn = $('bNext'); if (force || !bn.dataset.s) { bn.dataset.s = '1'; bn.innerHTML = `👆<small>${t('se_b_next')}</small>`; }
    cvs.style.cursor = NET.aim ? 'crosshair' : '';
  }
  function drawWardenFog() {
    const f = fctx; f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, fogc.width, fogc.height);
    setWT(f, DPR * 0.5);
    f.fillStyle = 'rgba(7,8,16,0.5)'; f.fillRect(-0.2, -0.2, L.W + 0.4, L.H + 0.4);
    f.globalCompositeOperation = 'destination-out'; f.fillStyle = '#000';
    for (const g of G.guards) { if (g.cone) { polyPath(f, g.cone.pts); f.fill(); } f.beginPath(); f.arc(g.x, g.y, 0.9, 0, TAU); f.fill(); }
    for (const fl of G.flares) { const r = FLARE_R * flareK(fl); if (r > 0.05) { f.beginPath(); f.arc(fl.x, fl.y, r, 0, TAU); f.fill(); } }
    f.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(fogc, 0, 0, cvs.width, cvs.height);
  }
  function drawWardenMarks(c, now) {
    c.save(); c.setLineDash([0.15, 0.15]); c.lineWidth = 0.045; c.strokeStyle = 'rgba(120,255,190,0.4)';   // where guards can't be sent
    for (const p of [L.start, L.exit]) if (p) { c.beginPath(); c.arc(p.x, p.y, SANCT_R, 0, TAU); c.stroke(); }
    c.restore();
    G.guards.forEach((g, i) => {
      if (g.goT && g.isCtl) {
        c.save(); c.setLineDash([0.14, 0.12]); c.lineDashOffset = -now * 1.2; c.strokeStyle = 'rgba(200,170,255,0.8)'; c.lineWidth = 0.05;
        c.beginPath(); c.moveTo(g.x, g.y); c.lineTo(g.goT.x, g.goT.y); c.stroke(); c.restore();
        c.fillStyle = 'rgba(200,170,255,0.9)'; c.beginPath(); c.arc(g.goT.x, g.goT.y, 0.12, 0, TAU); c.fill();
      }
      if (i === NET.sel) { c.strokeStyle = '#c9a8ff'; c.lineWidth = 0.07; c.beginPath(); c.arc(g.x, g.y, 0.58 + Math.sin(now * 5) * 0.04, 0, TAU); c.stroke(); }
      else if (g.isCtl) { c.strokeStyle = 'rgba(200,170,255,0.5)'; c.lineWidth = 0.04; c.beginPath(); c.arc(g.x, g.y, 0.52, 0, TAU); c.stroke(); }
    });
    for (const p of G.pings) {
      const k = p.t / 2.2, col = p.k === 'go' ? '200,170,255' : p.k === 'hear' ? '255,235,180' : p.k === 'spot' ? '255,183,3' : '255,80,80';
      c.strokeStyle = `rgba(${col},${(1 - k) * 0.9})`; c.lineWidth = 0.06; c.beginPath(); c.arc(p.x, p.y, 0.25 + k * (p.k === 'go' ? 0.6 : 1.4), 0, TAU); c.stroke();
    }
    if (G.lk) {   // last known position during an alarm
      const s = 0.3; c.strokeStyle = `rgba(255,70,70,${0.6 + Math.sin(now * 6) * 0.3})`; c.lineWidth = 0.08;
      c.beginPath(); c.moveTo(G.lk.x - s, G.lk.y - s); c.lineTo(G.lk.x + s, G.lk.y + s); c.moveTo(G.lk.x + s, G.lk.y - s); c.lineTo(G.lk.x - s, G.lk.y + s); c.stroke();
    }
    if (!G.spy && G.ghost && G.ghost.t < 4) {   // where you last saw them
      c.save(); c.globalAlpha = 1 - G.ghost.t / 4; c.setLineDash([0.08, 0.08]); c.strokeStyle = 'rgba(255,120,120,0.9)'; c.lineWidth = 0.045;
      c.beginPath(); c.arc(G.ghost.x, G.ghost.y, P_R + 0.08, 0, TAU); c.stroke(); c.restore();
    }
    if (G.spy) { drawBody(c, G.spy, now); c.strokeStyle = `rgba(255,80,80,${0.6 + Math.sin(now * 8) * 0.3})`; c.lineWidth = 0.06; c.beginPath(); c.arc(G.spy.x, G.spy.y, P_R + 0.14, 0, TAU); c.stroke(); }
  }
  cvs.addEventListener('pointerdown', (e) => { if (!isWarden() || mode !== 'play') return; e.preventDefault(); Snd.unlock(); wardenTap(e.clientX, e.clientY); });
  const wbtn = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Snd.unlock(); const b = $(id); if (b.disabled) { Snd.deny(); return; } b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140); fn(); });
  wbtn('bFlare', wFlare); wbtn('bRel', wRelease); wbtn('bNext', wNext);
  addEventListener('pagehide', () => { if (NET.ch) netSend('bye', {}); });
  window.Mal3abShareLink = () => NET.code ? inviteLink(NET.code) : pageLink();
  window.Mal3abPrepareInvite = async () => {
    if (!NET.code) { if (!(await canGoOnline())) return pageLink(); joinRoom(newCode(), 'inf'); }
    return inviteLink(NET.code);
  };

  // ------------------------------------------------------------------ test / scripting API
  const API = window.ShadowEclipse = {
    input: null,
    get mode() { return mode; }, get screen() { return screen; }, get G() { return G; }, get L() { return L; }, get level() { return curLevel; },
    levels: LEVELS, get progress() { return PROG; },
    start(i) { startLevel(i || 0); begin(); return API; },
    begin, pause, resume, menu: toMenu, restart: () => startLevel(curLevel, true),
    step(dt, n, noRender) { for (let k = 0; k < (n || 1); k++) { if (mode === 'play' || mode === 'attract') update(dt || 1 / 60); updateFx(dt || 1 / 60); } if (!noRender) { render(0); updateHUD(true); } return noRender ? null : API.state(); },
    // test helper: walk the body toward each [x, y] (tile centres are +0.5) or wait ['w', seconds]; stops on win / lose
    drive(pts, maxT) {
      let t = 0; const lim = maxT || 60;
      for (const p of pts) {
        if (p[0] === 'w') { for (let k = 0; k < p[1] * 60 && mode === 'play'; k++) { API.step(1 / 60, 1, true); t += 1 / 60; } if (mode !== 'play') break; continue; }
        while (t < lim && mode === 'play') {
          const b = G.body, dx = p[0] - b.x, dy = p[1] - b.y, d = Math.hypot(dx, dy);
          if (d < 0.12) break;
          API.input = { x: dx / d * Math.min(1, d * 4), y: dy / d * Math.min(1, d * 4) };
          API.step(1 / 60, 1, true); t += 1 / 60;
        }
        API.input = null;
        if (mode !== 'play') break;
      }
      API.input = null;
      return { mode, t: +t.toFixed(2), alarmed: G.alarmed, alarm: G.alarm, body: { x: +G.body.x.toFixed(2), y: +G.body.y.toFixed(2) }, hidden: G.hidden, meter: +G.meter.toFixed(2) };
    },
    setSun(a) { G.sun = a; updateSun(0); return G.sun; },
    shadowAt: (x, y) => shadowAt(x, y), losClear: (a, b, c, d) => losClear(a, b, c, d), findPath: (a, b, c, d) => findPath(a, b, c, d),
    teleport(x, y) { if (G.body) { G.body.x = x; G.body.y = y; G.hidden = shadowAt(x, y); } },
    weave: startWeave, recall: () => recall(false), noise: action, bridge: tryBridge, use: action, bridgeOK: () => bridgeOK(), toggleMap,
    moveShade(x, y) { if (G.weave) { G.weave.x = x; G.weave.y = y; } },
    win: () => { if (mode === 'play') win(); }, lose: () => lose(null),
    state() { return G ? { mode, screen, level: curLevel, time: +G.time.toFixed(2), sun: +G.sun.toFixed(1), hidden: G.hidden, meter: +G.meter.toFixed(3), alarm: G.alarm, alarmed: G.alarmed, weave: G.weave ? G.weave.mode : null, body: G.body ? { x: +G.body.x.toFixed(2), y: +G.body.y.toFixed(2) } : null, guards: G.guards.map(g => ({ x: +g.x.toFixed(2), y: +g.y.toFixed(2), state: g.state, meter: +g.meter.toFixed(2) })) } : null; },
    internals: { noiseAt(x, y) { for (const g of G.guards) { const d = Math.hypot(g.x - x, g.y - y), R = losClear(g.x, g.y, x, y) ? 6.8 : 5; if (d <= R) hearNoise(g, { x, y }); } }, pathBlocked: (x, y) => pathBlocked(x, y), shadowAt: (x, y) => shadowAt(x, y), shadeOK: (x, y) => shadeOK(x, y), update: (dt) => update(dt) },
    sfx: Snd,
    skip: SKIP, get hq() { return HQ; }, set hq(v) { HQ = !!v; },
    profile(on) { if (!on) { const r = PROF && PROF.sums; PROF = null; return r; } let t = 0; PROF = { sums: {}, start() { t = performance.now(); }, mark(n) { const x = performance.now(); this.sums[n] = (this.sums[n] || 0) + x - t; t = x; } }; return true; },
    resetProgress() { PROG = { u: 1, b: {} }; saveProg(); },
    unlockAll() { PROG.u = LEVELS.length; saveProg(); },
    // online test hooks
    net: NET, act, joinRoom, leaveRoom, newCode, goLevel, swapRoles, selectGuard, flare: wFlare, release: wRelease,
    tapWorld(x, y) { const [sx, sy] = w2s(x, y); wardenTap(sx, sy); },   // Warden: tap a world position (tile centres are +0.5)
    get isWarden() { return isWarden(); },
  };

  // ------------------------------------------------------------------ boot
  resize();
  loadAttract();
  if (isTouch) joyHome();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { showScreen('menu', null); resize(); });
  else showScreen('menu', null);
  requestAnimationFrame(frame);
  // ?room=CODE (an invite link) joins that room straight away
  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {
    let tried = false;
    const go = async () => { if (tried || NET.code) return; tried = true; if (!(await canGoOnline())) return; joinRoom(roomParam, null); };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
  }
})();
