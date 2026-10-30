'use strict';
// =====================================================================
// Deck of Dungeons — data: strings, cards, heroes, combos, relics, maps, waves
// =====================================================================
(function () {
const DD = window.__DD = window.__DD || {};

addStrings({
  // ---------- general UI ----------
  dd_title: 'كوتشينة الزنازين', dd_sub: 'ابني زنزانة قاتلة، وقّف الأبطال، واحمي كنزك.',
  dd_newRun: 'جولة جديدة', dd_continue: 'كمّل الجولة', dd_howto: 'إزاي تلعب', dd_codex: 'الموسوعة', dd_records: 'الأرقام القياسية',
  dd_dread: 'رعب {n}', dd_dreadLbl: 'مستوى الرعب', dd_dreadHint: 'اكسب جولة عشان يتفتح المستوى اللي بعده: الأبطال بيبقوا أقوى وأكتر.',
  dd_dreadLocked: 'مقفول', dd_act: 'الفصل {n}', dd_wave: 'الموجة {n}/{m}', dd_waveShort: 'موجة {n}',
  dd_act1: 'المقبرة المنسية', dd_act2: 'الأعماق المنصهرة', dd_act3: 'عرش العضم',
  dd_loot: 'الكنز', dd_mana: 'مانا', dd_deck: 'الكوتشينة', dd_discardPile: 'المحروق', dd_drawPile: 'لسه هتتسحب',
  dd_start: 'ابدأ الموجة', dd_incoming: 'جايين:', dd_left: 'فاضل {n}', dd_waveOn: 'الموجة شغالة',
  dd_speed: 'السرعة', dd_pause: 'وقفة', dd_paused: 'اللعبة واقفة', dd_resume: 'كمّل', dd_abandon: 'سيب الجولة',
  dd_confirmAbandon: 'تسيب الجولة دي؟ كل اللي عملته هيضيع.', dd_yes: 'أيوه', dd_no: 'لأ', dd_mainMenu: 'القايمة الرئيسية',
  dd_sound: 'الصوت', dd_music: 'المزيكا', dd_on: 'شغال', dd_off: 'مقفول', dd_close: 'قفل', dd_back: 'رجوع',
  dd_viewDeck: 'شوف الكوتشينة', dd_nCards: '{n} كارت', dd_cost: 'التمن', dd_lvl: 'مستوى {n}', dd_disabled: 'متعطّل',
  dd_kind_room: 'أوضة', dd_kind_trap: 'فخ', dd_kind_tower: 'برج', dd_kind_monster: 'وحش', dd_kind_spell: 'تعويذة',
  dd_rar_starter: 'أساسي', dd_rar_common: 'عادي', dd_rar_uncommon: 'مش منتشر', dd_rar_rare: 'نادر',
  dd_upgraded: 'متطوّر', dd_combos: 'الكومبوهات', dd_heroes: 'الأبطال', dd_cards: 'الكروت', dd_relics: 'الآثار',
  dd_comboWith: 'كومبو مع: {p}', dd_combo: 'كومبو!', dd_newCombo: 'كومبو جديد اتكشف!', dd_discovered: 'اكتشفته', dd_notYet: 'لسه ماجربتوش',
  dd_hp: 'صحة', dd_armor: 'درع', dd_speedStat: 'سرعة', dd_steals: 'بيسرق', dd_ability: 'قدرة',
  dd_empower: 'قوّيه للمستوى {n}', dd_place: 'حطه هنا', dd_target: 'اختار مكان التعويذة',
  dd_needRock: 'ده بيتحط على الحيطان الصخر.', dd_needFloor: 'ده بيتحط على أرضية الممر.', dd_occupied: 'المكان ده مشغول.',
  dd_blocks: 'كده هتقفل الطريق خالص — لازم الأبطال يقدروا يوصلوا للخزنة.', dd_noMana: 'المانا مش مكفية.',
  dd_waveOnly: 'التعويذة دي بتتلعب والموجة شغالة.', dd_maxLvl: 'وصل لأعلى مستوى.', dd_heroThere: 'فيه بطل واقف هناك.',
  dd_noLoot: 'الكنز مش مكفي.', dd_special: 'المكان ده مينفعش يتبني فيه.', dd_handFull: 'إيدك مليانة.',
  dd_disarmed: 'فكّ الفخ!', dd_dodge: 'زاغ!', dd_escaped: 'هرب بـ {n}', dd_recovered: 'رجع {n}', dd_frozen: 'اتجمد!', dd_dig: 'بيحفر!',
  dd_bossWave: 'موجة الزعيم!', dd_bossArrives: '{p} وصل!', dd_waveStart: 'الموجة {n}', dd_cleared: 'الموجة خلصت!',
  dd_bounty: '+{n} من الأبطال اللي ماتوا', dd_foundations: 'زنزانة جديدة: +{n} مانا و+{m} كروت المرة دي.',
  dd_pickCard: 'ضيف كارت للكوتشينة', dd_orRemove: 'شيل كارت', dd_orUpgrade: 'طوّر كارت', dd_skip: 'فوّت (+{n} كنز)',
  dd_chooseRemove: 'اختار الكارت اللي هتشيله', dd_chooseUpgrade: 'اختار الكارت اللي هتطوّره', dd_or: 'أو',
  dd_minDeck: 'لازم يفضل معاك 6 كروت على الأقل.', dd_relicTitle: 'اختار أثر سحري', dd_relicSub: 'الأثر بيفضل معاك طول الجولة.',
  dd_victory: 'الملك البطل وقع!', dd_victorySub: 'الزنزانة بتاعتك بقت أسطورة. الأبطال هيخافوا يقربوا تاني.',
  dd_defeat: 'الخزنة اتسرقت كلها!', dd_defeatSub: 'الأبطال فضّوا الكنز. ابني زنزانة أقوى المرة الجاية.',
  dd_reached: 'وصلت للفصل {a} — الموجة {w}', dd_sKills: 'أبطال اتقتلوا', dd_sStolen: 'كنز اتسرق', dd_sRecovered: 'كنز رجع',
  dd_sCombos: 'كومبوهات اتعملت', dd_sCards: 'كروت اتلعبت', dd_sTime: 'الوقت', dd_sLoot: 'الكنز في الآخر', dd_sScore: 'النقط',
  dd_best: 'أحسن جولة', dd_newBest: 'رقم قياسي جديد!', dd_unlocked: 'اتفتح رعب {n}!', dd_runs: 'جولات', dd_wins: 'مرات الفوز',
  dd_totalKills: 'كل الأبطال اللي اتقتلوا', dd_bestDread: 'أعلى رعب كسبته', dd_none: '—', dd_tryAgain: 'العب تاني',
  dd_actIntro: 'الفصل {n}', dd_enter: 'انزل الزنزانة', dd_nextAct: 'الأبطال جايين أقوى. الكروت معاك، بس الزنزانة جديدة.',
  dd_keys: 'كيبورد: 1-9 تختار كارت · Space تبدأ الموجة · F السرعة · P وقفة · كليك يمين يلغي',
  dd_tapInfo: 'دوس على أي حاجة في الخريطة عشان تعرف عنها.',
  dd_hint1: 'دوس على كارت، وبعدين دوس على مربع منوّر عشان تحطه.',
  dd_hint2: 'المعيّنات الملونة معناها كومبو: جرّب برج الرماة جنب بركة الحمم!',
  dd_hint3: 'جاهز؟ دوس "ابدأ الموجة". تقدر تلعب كروت والموجة شغالة كمان.',
  dd_hintFlee: 'البطل اللي ياخد كنز بيجري راجع للمدخل — اقتله عشان الكنز يرجع!',
  dd_score: 'النقط: {n}', dd_runSaved: 'الجولة بتتحفظ أول كل موجة.', dd_playerName: 'سيد الزنزانة: {p}',
  dd_heroSlain: 'اتقتل', dd_burning: 'بيتحرق', dd_poisoned: 'متسمم', dd_chilled: 'متسقّع', dd_wet: 'مبلول', dd_stunned: 'مدوّخ', dd_rusted: 'من غير درع',
  dd_carrying: 'شايل {n} كنز', dd_struct: '{p} — مستوى {n}', dd_activeCombos: 'كومبوهات شغالة:',

  // ---------- how to play ----------
  dd_how1: 'الأبطال بيمشوا من المدخل لحد خزنة الكنز عشان يسرقوه. لو الخزنة فضيت، الجولة خلصت.',
  dd_how2: 'قبل كل موجة بتسحب 5 كروت. اصرف المانا عشان تلعبهم: الفخاخ والوحوش على أرضية الممرات، والأبراج على الحيطان الصخر.',
  dd_how3: 'الأوض بتغيّر شكل الزنزانة: الانهيار بيقفل مربع، فالأبطال يلفوا من طريق أطول قدام الأبراج بتاعتك.',
  dd_how4: 'حط الحاجات جنب بعض عشان تعمل كومبو. برج رماة + بركة حمم = سهام نار بتضرب 3 أضعاف في الفرسان اللابسين دروع!',
  dd_how5: 'البطل اللي ياخد كنز بيجري راجع للمدخل. اقتله وهو خارج عشان ترجّعه. وكل بطل بيموت بيوقّع فلوس للخزنة.',
  dd_how6: 'بعد كل موجة: ضيف كارت جديد، أو شيل كارت، أو طوّر كارت. اكسب 3 فصول والملك البطل عشان تفوز.',
  dd_how7: 'خلي بالك: اللص بيفك الفخاخ، الكاهن بيعالج، الساحر بيحرق حاجاتك، والقزم بيحفر في الردم.',
  dd_how8: 'لو حطيت نفس الكارت على نفس الحاجة بتقوّيها لحد مستوى 3.',

  // ---------- cards ----------
  dd_c_collapse: 'انهيار', dd_cd_collapse: 'ردم بيقفل المربع ده والأبطال يلفوا حواليه. مينفعش يقفل الطريق خالص.',
  dd_c_flood: 'قاعة غرقانة', dd_cd_flood: 'الأبطال اللي بيعدّوا هنا بيبطّأوا {s}% وبيتبلّوا {t} ثانية.',
  dd_c_well: 'بير المانا', dd_cd_well: '+{n} مانا زيادة كل موجة من الموجة الجاية (في الفصل ده).',
  dd_c_banner: 'راية الحرب', dd_cd_banner: 'الأبراج والوحوش اللي جنبها بتضرب +{pct}% أقوى.',
  dd_c_crypt: 'مقبرة', dd_cd_crypt: 'بتطلّع محارب هيكلي على أرضية قريبة كل {t} ثانية والموجة شغالة (أقصى حاجة {n}).',
  dd_c_gold: 'دهب فالصو', dd_cd_gold: 'الأبطال الطماعين اللي بيعدّوا جنبه بيقفوا {t} ثانية عشان يلمّوه.',
  dd_c_spikes: 'خوازيق', dd_cd_spikes: 'بتطعن الأبطال اللي عليها {d} ضرر كل {r} ثانية. الدرع بيقلل منها.',
  dd_c_lava: 'بركة حمم', dd_cd_lava: 'بتحرق الأبطال {d} في الثانية وبتولّع فيهم ({b} في الثانية لمدة {t} ثواني).',
  dd_c_frost: 'رونة التلج', dd_cd_frost: 'بتسقّع الأبطال (−{s}% سرعة). 3 تسقيعات وبيتجمدوا {t} ثانية.',
  dd_c_gas: 'غاز سام', dd_cd_gas: 'بيسمّم الأبطال لحد مربع حواليه {d} في الثانية ({t} ثواني، بيتراكم 3 مرات). مش بيهمه الدرع.',
  dd_c_pit: 'حفرة', dd_cd_pit: 'أول بطل يقع فيها: {d} ضرر ويتدوّخ {t} ثانية. بتتفتح تاني بعد {cd} ثواني.',
  dd_c_archer: 'برج الرماة', dd_cd_archer: 'بيرمي سهام: {d} ضرر كل {r} ثانية، المدى {rg}.',
  dd_c_smage: 'ساحر هيكلي', dd_cd_smage: 'كور تلج: {d} ضرر وتسقيع كل {r} ثانية، المدى {rg}. مش بيهمه الدرع.',
  dd_c_ballista: 'بليستا', dd_cd_ballista: 'سهم عملاق بيخترق كل الأبطال اللي في خط واحد: {d} ضرر كل {r} ثانية، المدى {rg}.',
  dd_c_dragon: 'تمثال التنين', dd_cd_dragon: 'بينفخ نار على مجموعة: {d} ضرر وحريق كل {r} ثانية، المدى {rg}.',
  dd_c_storm: 'عمود العاصفة', dd_cd_storm: 'برق بيضرب بطل {d} وبينط لـ{n} كمان كل {r} ثانية، المدى {rg}.',
  dd_c_golem: 'غولم الحجر', dd_cd_golem: '{hp} صحة. بيوقف لحد {blk} أبطال وبيخبطهم {d} ضرر (وبيدوّخهم).',
  dd_c_slime: 'سلايم', dd_cd_slime: '{hp} صحة. بيوقف {blk} أبطال وبيبطّأهم، ولما يموت بيتقسم اتنين.',
  dd_c_skeleton: 'محارب هيكلي', dd_cd_skeleton: '{hp} صحة. بيوقف بطل واحد ويضربه {d}. بيقوم تاني بعد {t} ثواني من موته.',
  dd_c_fireball: 'كورة نار', dd_cd_fireball: 'بتنفجر {d} ضرر نار حوالين المربع اللي تختاره.',
  dd_c_nova: 'موجة صقيع', dd_cd_nova: 'بتجمّد الأبطال حوالين المربع {t} ثانية.',
  dd_c_rust: 'لعنة الصدا', dd_cd_rust: 'الأبطال حوالين المربع بيخسروا الدرع كله وبياخدوا +25% ضرر لمدة {t} ثانية.',
  dd_c_ritual: 'طقس الضلمة', dd_cd_ritual: 'ادفع {l} كنز وخد {n} مانا.',
  dd_c_scheme: 'خطة شريرة', dd_cd_scheme: 'اسحب {n} كروت.',
  dd_c_hoard: 'كنز مستخبي', dd_cd_hoard: 'ضيف {n} كنز للخزنة.',

  // ---------- combos ----------
  dd_k_fireArrows: 'سهام النار', dd_kd_fireArrows: 'برج رماة جنب بركة حمم: السهام بتبقى نار وبتضرب 3 أضعاف في اللابسين دروع.',
  dd_k_shatter: 'تكسير', dd_kd_shatter: 'خوازيق جنب رونة تلج: 3 أضعاف الضرر في الأبطال المتسقعين أو المتجمدين.',
  dd_k_frostBolt: 'سهام الجليد', dd_kd_frostBolt: 'بليستا جنب رونة تلج: السهم بيجمّد كل بطل يخترقه لمدة ثانية.',
  dd_k_toxicSplash: 'رشة سامة', dd_kd_toxicSplash: 'سلايم جنب غاز سام: ضربة السلايم بتسمّم، والغاز بيعالج السلايم.',
  dd_k_gasBlast: 'انفجار غاز', dd_kd_gasBlast: 'غاز سام جنب بركة حمم: الغاز بيولّع وبينفجر كل 3 ثواني 30 ضرر نار.',
  dd_k_steam: 'بخار حارق', dd_kd_steam: 'قاعة غرقانة جنب بركة حمم: بخار سخن بيحرق اللي حواليه ويعميهم (لا علاج ولا فك فخاخ).',
  dd_k_flashFreeze: 'تجميد فوري', dd_kd_flashFreeze: 'قاعة غرقانة جنب رونة تلج: الأبطال المبلولين بيتجمدوا على طول على الرونة.',
  dd_k_conduction: 'توصيل كهربا', dd_kd_conduction: 'عمود عاصفة جنب قاعة غرقانة: البرق بيضرب الضعف في المبلولين وبينط مرتين زيادة.',
  dd_k_necromancy: 'إحياء الموتى', dd_kd_necromancy: 'ساحر هيكلي جنب مقبرة: الأبطال اللي بيموتوا في مداه بيقوموا هياكل في صفك.',
  dd_k_spikedPit: 'حفرة بخوازيق', dd_kd_spikedPit: 'حفرة جنب خوازيق: ضعف الضرر وبتتفتح أسرع مرتين.',
  dd_k_magmaGolem: 'غولم الحمم', dd_kd_magmaGolem: 'غولم جنب بركة حمم: خبطته بتولّع في الأبطال وبيعالج نفسه.',
  dd_k_arcaneFocus: 'تركيز سحري', dd_kd_arcaneFocus: 'بير مانا جنب ساحر هيكلي أو عمود عاصفة أو تمثال تنين: +1 مدى و+40% ضرر.',
  dd_k_dragonsHoard: 'كنز التنين', dd_kd_dragonsHoard: 'تمثال تنين جنب دهب فالصو: ضعف الضرر في الأبطال اللي بيلمّوا الدهب.',
  dd_k_warDrums: 'طبول الحرب', dd_kd_warDrums: 'راية الحرب جنب أبراج أو وحوش: بيضربوا أقوى.',

  // ---------- heroes ----------
  dd_h_squire: 'مغامر', dd_hd_squire: 'متحمس وسلاحه على قده. بييجي بالكوم.',
  dd_h_rogue: 'لص', dd_hd_rogue: 'سريع. ممكن يفك الفخاخ اللي يدوس عليها ويزوغ من السهام. بيسرق كتير.',
  dd_h_knight: 'فارس', dd_hd_knight: 'درعه التقيل بيصد الضرب العادي، وهو بطيء. استخدم نار أو تلج أو سم.',
  dd_h_cleric: 'كاهن', dd_hd_cleric: 'بيعالج الأبطال اللي حواليه كل شوية. اقتله الأول.',
  dd_h_mage: 'ساحر', dd_hd_mage: 'بيحرق حاجاتك ويعطّلها كام ثانية. النار مش بتأثر فيه أوي.',
  dd_h_dwarf: 'قزم حفّار', dd_hd_dwarf: 'بيحفر في ردم الانهيار ويعدّي من جواه. جامد.',
  dd_h_paladin: 'بالادين', dd_hd_paladin: 'محارب مقدس لابس درع. الأبطال اللي جنبه بياخدوا ضرر أقل.',
  dd_h_brannoc: 'السير برانوك الجريء', dd_hd_brannoc: 'زعيم الفصل الأول. درع ضخم، وكل شوية بيهجم لقدام ومش بيهمه الفخاخ.',
  dd_h_vexa: 'الساحرة ڤيكسا', dd_hd_vexa: 'زعيمة الفصل التاني. النار مش بتأثر فيها، بتنط لقدام وبتحرق كل حاجة حواليها.',
  dd_h_aldric: 'الملك البطل ألدريك', dd_hd_aldric: 'الزعيم الأخير. بيستدعي مغامرين، ولما يتعوّر بيتجنن ويجري أسرع.',

  // ---------- relics ----------
  dd_r_emberHeart: 'قلب الجمر', dd_rd_emberHeart: 'ضرر النار +35%.',
  dd_r_frostCrown: 'تاج الصقيع', dd_rd_frostCrown: 'تسقيعتين بس بيجمّدوا، والتجميد بيطول 50% أكتر.',
  dd_r_boneRing: 'خاتم العضم', dd_rd_boneRing: 'الوحوش +40% صحة وبيقوموا أسرع مرتين.',
  dd_r_ledger: 'دفتر العفريت', dd_rd_ledger: '+2 كنز عن كل بطل يموت.',
  dd_r_manaCrystal: 'كريستالة مانا', dd_rd_manaCrystal: '+1 مانا كل موجة.',
  dd_r_whetstone: 'حجر السن', dd_rd_whetstone: 'الفخاخ بتضرب +30% أقوى.',
  dd_r_eagleEye: 'عين الصقر', dd_rd_eagleEye: 'مدى الأبراج +0.6.',
  dd_r_vaultDoor: 'باب خزنة حديد', dd_rd_vaultDoor: 'الأبطال بيسرقوا أقل بـ 30%.',
  dd_r_cursedHand: 'الإيد الملعونة', dd_rd_cursedHand: 'اسحب كارت زيادة كل موجة.',
  dd_r_plague: 'قزازة الطاعون', dd_rd_plague: 'السم بيضرب +50% أقوى.',
  dd_r_chains: 'سلاسل الطمع', dd_rd_chains: 'الأبطال اللي شايلين كنز بيمشوا أبطأ بـ 35%.',
  dd_r_stormJar: 'عاصفة في برطمان', dd_rd_stormJar: 'البرق بينط مرة زيادة وبيضرب +25% أقوى.',
  dd_r_echoStone: 'حجر الصدى', dd_rd_echoStone: 'أول كارت تلعبه كل موجة ببلاش.'
}, {
  dd_title: 'Deck of Dungeons', dd_sub: 'Build a deadly dungeon. Stop the heroes. Guard your loot.',
  dd_newRun: 'New run', dd_continue: 'Continue run', dd_howto: 'How to play', dd_codex: 'Codex', dd_records: 'Records',
  dd_dread: 'Dread {n}', dd_dreadLbl: 'Dread level', dd_dreadHint: 'Win a run to unlock the next level: heroes get tougher and more numerous.',
  dd_dreadLocked: 'Locked', dd_act: 'Act {n}', dd_wave: 'Wave {n}/{m}', dd_waveShort: 'Wave {n}',
  dd_act1: 'The Forgotten Crypt', dd_act2: 'The Molten Deep', dd_act3: 'Throne of Bones',
  dd_loot: 'Loot', dd_mana: 'Mana', dd_deck: 'Deck', dd_discardPile: 'Discard', dd_drawPile: 'Draw pile',
  dd_start: 'Start wave', dd_incoming: 'Incoming:', dd_left: '{n} left', dd_waveOn: 'Wave in progress',
  dd_speed: 'Speed', dd_pause: 'Pause', dd_paused: 'Paused', dd_resume: 'Resume', dd_abandon: 'Abandon run',
  dd_confirmAbandon: 'Abandon this run? Everything you built is lost.', dd_yes: 'Yes', dd_no: 'No', dd_mainMenu: 'Main menu',
  dd_sound: 'Sound', dd_music: 'Music', dd_on: 'On', dd_off: 'Off', dd_close: 'Close', dd_back: 'Back',
  dd_viewDeck: 'View deck', dd_nCards: '{n} cards', dd_cost: 'Cost', dd_lvl: 'Lv {n}', dd_disabled: 'Disabled',
  dd_kind_room: 'Room', dd_kind_trap: 'Trap', dd_kind_tower: 'Tower', dd_kind_monster: 'Monster', dd_kind_spell: 'Spell',
  dd_rar_starter: 'Starter', dd_rar_common: 'Common', dd_rar_uncommon: 'Uncommon', dd_rar_rare: 'Rare',
  dd_upgraded: 'Upgraded', dd_combos: 'Combos', dd_heroes: 'Heroes', dd_cards: 'Cards', dd_relics: 'Relics',
  dd_comboWith: 'Combos with: {p}', dd_combo: 'Combo!', dd_newCombo: 'New combo discovered!', dd_discovered: 'Discovered', dd_notYet: 'Not tried yet',
  dd_hp: 'HP', dd_armor: 'Armor', dd_speedStat: 'Speed', dd_steals: 'Steals', dd_ability: 'Ability',
  dd_empower: 'Empower to level {n}', dd_place: 'Place here', dd_target: 'Pick a target for the spell',
  dd_needRock: 'This goes on the rock walls.', dd_needFloor: 'This goes on a corridor floor.', dd_occupied: 'Something is already there.',
  dd_blocks: 'That would seal the path — heroes must be able to reach the vault.', dd_noMana: 'Not enough mana.',
  dd_waveOnly: 'Cast this spell while a wave is running.', dd_maxLvl: 'Already at max level.', dd_heroThere: 'A hero is standing there.',
  dd_noLoot: 'Not enough loot.', dd_special: 'You cannot build there.', dd_handFull: 'Your hand is full.',
  dd_disarmed: 'Disarmed!', dd_dodge: 'Dodge!', dd_escaped: 'Escaped with {n}', dd_recovered: '{n} recovered', dd_frozen: 'Frozen!', dd_dig: 'Digging!',
  dd_bossWave: 'Boss wave!', dd_bossArrives: '{p} arrives!', dd_waveStart: 'Wave {n}', dd_cleared: 'Wave cleared!',
  dd_bounty: '+{n} from fallen heroes', dd_foundations: 'New dungeon: +{n} mana and +{m} cards this time.',
  dd_pickCard: 'Add a card to your deck', dd_orRemove: 'Remove a card', dd_orUpgrade: 'Upgrade a card', dd_skip: 'Skip (+{n} loot)',
  dd_chooseRemove: 'Choose a card to remove', dd_chooseUpgrade: 'Choose a card to upgrade', dd_or: 'or',
  dd_minDeck: 'You must keep at least 6 cards.', dd_relicTitle: 'Choose a relic', dd_relicSub: 'Relics stay with you for the whole run.',
  dd_victory: 'The Hero-King has fallen!', dd_victorySub: 'Your dungeon is now a legend. Heroes will think twice before coming back.',
  dd_defeat: 'Your vault was emptied!', dd_defeatSub: 'The heroes cleaned out your hoard. Build a nastier dungeon next time.',
  dd_reached: 'Reached act {a} — wave {w}', dd_sKills: 'Heroes slain', dd_sStolen: 'Loot stolen', dd_sRecovered: 'Loot recovered',
  dd_sCombos: 'Combos formed', dd_sCards: 'Cards played', dd_sTime: 'Time', dd_sLoot: 'Final loot', dd_sScore: 'Score',
  dd_best: 'Best run', dd_newBest: 'New record!', dd_unlocked: 'Dread {n} unlocked!', dd_runs: 'Runs', dd_wins: 'Wins',
  dd_totalKills: 'Heroes slain (all runs)', dd_bestDread: 'Highest Dread won', dd_none: '—', dd_tryAgain: 'Play again',
  dd_actIntro: 'Act {n}', dd_enter: 'Enter the dungeon', dd_nextAct: 'Tougher heroes are coming. You keep your cards, but the dungeon is new.',
  dd_keys: 'Keys: 1-9 pick a card · Space start wave · F speed · P pause · right-click cancel',
  dd_tapInfo: 'Tap anything on the map to learn about it.',
  dd_hint1: 'Tap a card, then tap a glowing tile to place it.',
  dd_hint2: 'Colored diamonds mean a combo: try an Archer Tower next to a Lava Pool!',
  dd_hint3: 'Ready? Press "Start wave". You can still play cards during the wave.',
  dd_hintFlee: 'Heroes who grab loot run back to the entrance — kill them to get it back!',
  dd_score: 'Score: {n}', dd_runSaved: 'Your run is saved at the start of every wave.', dd_playerName: 'Dungeon Lord: {p}',
  dd_heroSlain: 'Slain', dd_burning: 'Burning', dd_poisoned: 'Poisoned', dd_chilled: 'Chilled', dd_wet: 'Wet', dd_stunned: 'Stunned', dd_rusted: 'No armor',
  dd_carrying: 'Carrying {n} loot', dd_struct: '{p} — level {n}', dd_activeCombos: 'Active combos:',

  dd_how1: 'Heroes march from the entrance to your vault to steal your loot. If the vault is emptied, the run is over.',
  dd_how2: 'Before each wave you draw 5 cards. Spend mana to play them: traps and monsters go on corridor floors, towers go on rock walls.',
  dd_how3: 'Rooms reshape the dungeon: Collapse blocks a tile, so heroes take a longer way past your towers.',
  dd_how4: 'Place pieces next to each other to form combos. Archer Tower + Lava Pool = fire arrows that deal triple damage to armored knights!',
  dd_how5: 'Heroes who grab loot run back to the entrance. Kill them on the way out to recover it. Every slain hero also drops coins into your vault.',
  dd_how6: 'After each wave: add a new card, remove one, or upgrade one. Survive 3 acts and defeat the Hero-King to win.',
  dd_how7: 'Watch out: rogues disarm traps, clerics heal, mages burn your rooms, and dwarves dig through rubble.',
  dd_how8: 'Playing the same card on the same piece empowers it, up to level 3.',

  dd_c_collapse: 'Collapse', dd_cd_collapse: 'Rubble blocks this tile, so heroes must walk around it. It can never seal the path completely.',
  dd_c_flood: 'Flooded hall', dd_cd_flood: 'Heroes wading through are slowed {s}% and become Wet for {t}s.',
  dd_c_well: 'Mana well', dd_cd_well: '+{n} max mana every wave from the next wave on (this act).',
  dd_c_banner: 'War banner', dd_cd_banner: 'Adjacent towers and monsters deal +{pct}% damage.',
  dd_c_crypt: 'Crypt', dd_cd_crypt: 'Raises a skeleton warrior on a nearby floor every {t}s during waves (max {n}).',
  dd_c_gold: 'Fool\'s gold', dd_cd_gold: 'Greedy heroes passing by stop for {t}s to grab it.',
  dd_c_spikes: 'Spikes', dd_cd_spikes: 'Stabs heroes on it for {d} damage every {r}s. Armor reduces it.',
  dd_c_lava: 'Lava pool', dd_cd_lava: 'Burns heroes for {d}/s and sets them on fire ({b}/s for {t}s).',
  dd_c_frost: 'Frost rune', dd_cd_frost: 'Chills heroes (−{s}% speed). Three chills freeze them for {t}s.',
  dd_c_gas: 'Poison gas', dd_cd_gas: 'Poisons heroes within 1 tile for {d}/s ({t}s, stacks 3×). Ignores armor.',
  dd_c_pit: 'Pit', dd_cd_pit: 'The next hero falls in: {d} damage and stunned for {t}s. Reopens after {cd}s.',
  dd_c_archer: 'Archer tower', dd_cd_archer: 'Shoots arrows: {d} damage every {r}s, range {rg}.',
  dd_c_smage: 'Skeleton mage', dd_cd_smage: 'Frost bolts: {d} damage and a chill every {r}s, range {rg}. Ignores armor.',
  dd_c_ballista: 'Ballista', dd_cd_ballista: 'A giant bolt pierces every hero in a line: {d} damage every {r}s, range {rg}.',
  dd_c_dragon: 'Dragon idol', dd_cd_dragon: 'Breathes fire on a group: {d} damage plus burn every {r}s, range {rg}.',
  dd_c_storm: 'Storm totem', dd_cd_storm: 'Lightning hits a hero for {d} and jumps to {n} more every {r}s, range {rg}.',
  dd_c_golem: 'Stone golem', dd_cd_golem: '{hp} HP. Blocks up to {blk} heroes and slams them for {d} damage (stuns).',
  dd_c_slime: 'Slime', dd_cd_slime: '{hp} HP. Blocks {blk} heroes and slows them. Splits in two when killed.',
  dd_c_skeleton: 'Skeleton warrior', dd_cd_skeleton: '{hp} HP. Blocks 1 hero and hits for {d}. Rises again {t}s after dying.',
  dd_c_fireball: 'Fireball', dd_cd_fireball: 'Explodes for {d} fire damage around the chosen tile.',
  dd_c_nova: 'Frost nova', dd_cd_nova: 'Freezes heroes around the chosen tile for {t}s.',
  dd_c_rust: 'Rust hex', dd_cd_rust: 'Heroes around the tile lose all armor and take +25% damage for {t}s.',
  dd_c_ritual: 'Dark ritual', dd_cd_ritual: 'Pay {l} loot to gain {n} mana.',
  dd_c_scheme: 'Evil scheme', dd_cd_scheme: 'Draw {n} cards.',
  dd_c_hoard: 'Hidden hoard', dd_cd_hoard: 'Add {n} loot to your vault.',

  dd_k_fireArrows: 'Fire arrows', dd_kd_fireArrows: 'Archer Tower next to a Lava Pool: arrows deal fire damage, ×3 against armored heroes.',
  dd_k_shatter: 'Shatter', dd_kd_shatter: 'Spikes next to a Frost Rune: ×3 damage to chilled or frozen heroes.',
  dd_k_frostBolt: 'Frost bolts', dd_kd_frostBolt: 'Ballista next to a Frost Rune: bolts freeze every hero they pierce for 1s.',
  dd_k_toxicSplash: 'Toxic splash', dd_kd_toxicSplash: 'Slime next to Poison Gas: slime hits poison heroes, and the gas heals the slime.',
  dd_k_gasBlast: 'Gas explosion', dd_kd_gasBlast: 'Poison Gas next to a Lava Pool: the gas ignites, exploding every 3s for 30 fire damage.',
  dd_k_steam: 'Steam vent', dd_kd_steam: 'Flooded Hall next to a Lava Pool: scalding steam burns nearby heroes and blinds them (no healing or disarming).',
  dd_k_flashFreeze: 'Flash freeze', dd_kd_flashFreeze: 'Flooded Hall next to a Frost Rune: wet heroes freeze instantly on the rune.',
  dd_k_conduction: 'Conduction', dd_kd_conduction: 'Storm Totem next to a Flooded Hall: lightning deals ×2 to wet heroes and jumps 2 more times.',
  dd_k_necromancy: 'Necromancy', dd_kd_necromancy: 'Skeleton Mage next to a Crypt: heroes slain in its range rise as your skeletons.',
  dd_k_spikedPit: 'Spiked pit', dd_kd_spikedPit: 'Pit next to Spikes: double damage, and it reopens twice as fast.',
  dd_k_magmaGolem: 'Magma golem', dd_kd_magmaGolem: 'Golem next to a Lava Pool: slams set heroes on fire and the golem regenerates.',
  dd_k_arcaneFocus: 'Arcane focus', dd_kd_arcaneFocus: 'Mana Well next to a Skeleton Mage, Storm Totem or Dragon Idol: +1 range and +40% damage.',
  dd_k_dragonsHoard: 'Dragon\'s hoard', dd_kd_dragonsHoard: 'Dragon Idol next to Fool\'s Gold: ×2 damage to heroes grabbing the gold.',
  dd_k_warDrums: 'War drums', dd_kd_warDrums: 'War Banner next to towers or monsters: they hit harder.',

  dd_h_squire: 'Squire', dd_hd_squire: 'Eager and poorly armed. Comes in crowds.',
  dd_h_rogue: 'Rogue', dd_hd_rogue: 'Fast. May disarm traps it steps on and dodge arrows. Steals a lot.',
  dd_h_knight: 'Knight', dd_hd_knight: 'Heavy armor blocks physical damage, but slow. Use fire, frost or poison.',
  dd_h_cleric: 'Cleric', dd_hd_cleric: 'Heals nearby heroes every few seconds. Kill it first.',
  dd_h_mage: 'Mage', dd_hd_mage: 'Burns your rooms, disabling them for a few seconds. Resists fire.',
  dd_h_dwarf: 'Dwarf sapper', dd_hd_dwarf: 'Digs straight through Collapse rubble. Tough.',
  dd_h_paladin: 'Paladin', dd_hd_paladin: 'Armored holy warrior. Nearby heroes take less damage.',
  dd_h_brannoc: 'Sir Brannoc the Bold', dd_hd_brannoc: 'Act I boss. Massive armor, and every few seconds he charges ahead, ignoring traps.',
  dd_h_vexa: 'Archmage Vexa', dd_hd_vexa: 'Act II boss. Immune to fire; blinks ahead and burns everything around her.',
  dd_h_aldric: 'Aldric the Hero-King', dd_hd_aldric: 'Final boss. Summons squires, and when hurt he becomes furious and fast.',

  dd_r_emberHeart: 'Ember heart', dd_rd_emberHeart: 'Fire damage +35%.',
  dd_r_frostCrown: 'Frost crown', dd_rd_frostCrown: 'Two chills are enough to freeze, and freezes last 50% longer.',
  dd_r_boneRing: 'Bone ring', dd_rd_boneRing: 'Monsters have +40% HP and rise twice as fast.',
  dd_r_ledger: 'Goblin ledger', dd_rd_ledger: '+2 loot for every hero slain.',
  dd_r_manaCrystal: 'Mana crystal', dd_rd_manaCrystal: '+1 mana every wave.',
  dd_r_whetstone: 'Whetstone', dd_rd_whetstone: 'Traps deal +30% damage.',
  dd_r_eagleEye: 'Eagle eye', dd_rd_eagleEye: 'Towers get +0.6 range.',
  dd_r_vaultDoor: 'Iron vault door', dd_rd_vaultDoor: 'Heroes steal 30% less.',
  dd_r_cursedHand: 'Cursed hand', dd_rd_cursedHand: 'Draw 1 extra card every wave.',
  dd_r_plague: 'Plague flask', dd_rd_plague: 'Poison deals +50% damage.',
  dd_r_chains: 'Chains of greed', dd_rd_chains: 'Heroes carrying loot move 35% slower.',
  dd_r_stormJar: 'Storm in a jar', dd_rd_stormJar: 'Lightning jumps 1 more time and deals +25% damage.',
  dd_r_echoStone: 'Echo stone', dd_rd_echoStone: 'The first card you play each wave costs 0.'
});

// ---------------- card kinds ----------------
DD.KINDS = {
  room: { col: '#b08cff', dark: '#3b2a63' },
  trap: { col: '#ff6f61', dark: '#5c1f1d' },
  tower: { col: '#5cb8ff', dark: '#173a5e' },
  monster: { col: '#5fdc7a', dark: '#1b4a2a' },
  spell: { col: '#ffc53d', dark: '#5a3f0d' }
};

// place: 'floorRoom' empty floor · 'floor' traps/monsters (or same type to empower) · 'rock' · 'target' any tile (wave only) · 'none'
DD.CARDS = {
  collapse: { kind: 'room', cost: 1, rar: 'starter', place: 'floorRoom', st: {}, up: { cost: 0 } },
  flood:    { kind: 'room', cost: 1, rar: 'common', place: 'floorRoom', st: { s: 35, t: 4 }, up: { s: 50, t: 6 } },
  well:     { kind: 'room', cost: 2, rar: 'uncommon', place: 'rock', st: { n: 1 }, up: { cost: 1 } },
  banner:   { kind: 'room', cost: 2, rar: 'uncommon', place: 'rock', st: { pct: 35 }, up: { pct: 60 } },
  crypt:    { kind: 'room', cost: 2, rar: 'rare', place: 'rock', st: { t: 14, n: 2 }, up: { t: 9, n: 3 } },
  gold:     { kind: 'room', cost: 1, rar: 'common', place: 'floorRoom', st: { t: 1.5 }, up: { t: 2.5 } },

  spikes:   { kind: 'trap', cost: 1, rar: 'starter', place: 'floor', st: { d: 18, r: 0.6 }, up: { d: 28 } },
  lava:     { kind: 'trap', cost: 2, rar: 'starter', place: 'floor', st: { d: 12, b: 6, t: 3 }, up: { d: 18, b: 9 } },
  frost:    { kind: 'trap', cost: 1, rar: 'starter', place: 'floor', st: { s: 40, t: 1.2 }, up: { s: 55, t: 1.8 } },
  gas:      { kind: 'trap', cost: 2, rar: 'common', place: 'floor', st: { d: 6, t: 4 }, up: { d: 9 } },
  pit:      { kind: 'trap', cost: 2, rar: 'uncommon', place: 'floor', st: { d: 55, t: 1.5, cd: 5 }, up: { d: 85, cd: 3.5 } },

  archer:   { kind: 'tower', cost: 2, rar: 'starter', place: 'rock', st: { d: 14, r: 1.0, rg: 2.6 }, up: { d: 20, rg: 3.0 } },
  smage:    { kind: 'tower', cost: 3, rar: 'common', place: 'rock', st: { d: 12, r: 1.25, rg: 3 }, up: { d: 18, r: 1.0 } },
  ballista: { kind: 'tower', cost: 3, rar: 'uncommon', place: 'rock', st: { d: 45, r: 2.8, rg: 4 }, up: { d: 70 } },
  dragon:   { kind: 'tower', cost: 3, rar: 'rare', place: 'rock', st: { d: 22, b: 6, r: 2.4, rg: 2.2 }, up: { d: 34, b: 9 } },
  storm:    { kind: 'tower', cost: 3, rar: 'uncommon', place: 'rock', st: { d: 20, n: 2, r: 1.6, rg: 2.8 }, up: { d: 30, n: 3 } },

  golem:    { kind: 'monster', cost: 3, rar: 'uncommon', place: 'floor', st: { hp: 320, d: 24, r: 1.8, blk: 3 }, up: { hp: 480, d: 34 } },
  slime:    { kind: 'monster', cost: 1, rar: 'common', place: 'floor', st: { hp: 90, d: 8, r: 1.0, blk: 2 }, up: { hp: 140, d: 12 } },
  skeleton: { kind: 'monster', cost: 1, rar: 'starter', place: 'floor', st: { hp: 70, d: 10, r: 0.8, blk: 1, t: 6 }, up: { hp: 110, d: 14, t: 4 } },

  fireball: { kind: 'spell', cost: 2, rar: 'starter', place: 'target', st: { d: 55, rad: 1.25 }, up: { d: 85 } },
  nova:     { kind: 'spell', cost: 1, rar: 'common', place: 'target', st: { t: 2, rad: 1.5 }, up: { t: 3 } },
  rust:     { kind: 'spell', cost: 1, rar: 'uncommon', place: 'target', st: { t: 8, rad: 1.5 }, up: { t: 14 } },
  ritual:   { kind: 'spell', cost: 0, rar: 'uncommon', place: 'none', st: { n: 2, l: 6 }, up: { n: 3 } },
  scheme:   { kind: 'spell', cost: 1, rar: 'common', place: 'none', st: { n: 2 }, up: { cost: 0 } },
  hoard:    { kind: 'spell', cost: 1, rar: 'common', place: 'none', st: { n: 12 }, up: { n: 20 } }
};
DD.STARTER = ['spikes', 'spikes', 'archer', 'archer', 'collapse', 'collapse', 'lava', 'skeleton', 'frost', 'fireball'];

// combos: piece `a` next to (8 neighbours) any piece in `b`
DD.COMBOS = [
  { id: 'fireArrows', a: 'archer', b: ['lava'], col: '#ff7a2f', g: 'flame' },
  { id: 'shatter', a: 'spikes', b: ['frost'], col: '#a8ecff', g: 'shard' },
  { id: 'frostBolt', a: 'ballista', b: ['frost'], col: '#7fd3ff', g: 'snow' },
  { id: 'toxicSplash', a: 'slime', b: ['gas'], col: '#8cff5a', g: 'drop' },
  { id: 'gasBlast', a: 'gas', b: ['lava'], col: '#ffb347', g: 'burst' },
  { id: 'steam', a: 'flood', b: ['lava'], col: '#e6ecff', g: 'swirl' },
  { id: 'flashFreeze', a: 'flood', b: ['frost'], col: '#58b8ff', g: 'snow' },
  { id: 'conduction', a: 'storm', b: ['flood'], col: '#ffe85a', g: 'bolt' },
  { id: 'necromancy', a: 'smage', b: ['crypt'], col: '#c58bff', g: 'skull' },
  { id: 'spikedPit', a: 'pit', b: ['spikes'], col: '#d9d9e8', g: 'spike' },
  { id: 'magmaGolem', a: 'golem', b: ['lava'], col: '#ff5a2a', g: 'flame' },
  { id: 'arcaneFocus', a: 'well', b: ['smage', 'storm', 'dragon'], col: '#b47bff', g: 'orb' },
  { id: 'dragonsHoard', a: 'dragon', b: ['gold'], col: '#ffcc33', g: 'coin' },
  { id: 'warDrums', a: 'banner', b: ['archer', 'smage', 'ballista', 'dragon', 'storm', 'golem', 'slime', 'skeleton'], col: '#ff4d6d', g: 'drum' }
];

// heroes: hp, speed (tiles/s), armor (physical reduction), dmg vs monsters, loot stolen, bounty on kill
DD.HEROES = {
  squire:  { hp: 60, sp: 1.0, ar: 0, dmg: 6, loot: 5, bounty: 1 },
  rogue:   { hp: 48, sp: 1.6, ar: 0, dmg: 7, loot: 9, bounty: 2, dodge: 0.2, disarm: 0.4 },
  knight:  { hp: 150, sp: 0.68, ar: 0.6, dmg: 12, loot: 7, bounty: 2 },
  cleric:  { hp: 80, sp: 0.88, ar: 0.2, dmg: 4, loot: 4, bounty: 2, heal: 0.12 },
  mage:    { hp: 60, sp: 0.92, ar: 0, dmg: 5, loot: 6, bounty: 2, fireRes: 0.5, scorch: 5 },
  dwarf:   { hp: 125, sp: 0.78, ar: 0.3, dmg: 14, loot: 8, bounty: 2, dig: true },
  paladin: { hp: 210, sp: 0.72, ar: 0.5, dmg: 16, loot: 10, bounty: 3, aura: true },
  brannoc: { hp: 1300, sp: 0.6, ar: 0.6, dmg: 30, loot: 30, bounty: 15, boss: true, size: 1.35 },
  vexa:    { hp: 1500, sp: 0.7, ar: 0.1, dmg: 20, loot: 40, bounty: 20, boss: true, fireRes: 1, size: 1.3 },
  aldric:  { hp: 3800, sp: 0.55, ar: 0.5, dmg: 40, loot: 60, bounty: 30, boss: true, size: 1.45 }
};
DD.HERO_ORDER = ['squire', 'rogue', 'knight', 'cleric', 'mage', 'dwarf', 'paladin', 'brannoc', 'vexa', 'aldric'];

DD.RELICS = {
  emberHeart: { g: 'flame', col: '#ff7a2f' }, frostCrown: { g: 'crown', col: '#9be7ff' }, boneRing: { g: 'skull', col: '#e8e2d0' },
  ledger: { g: 'coin', col: '#ffcc33' }, manaCrystal: { g: 'gem', col: '#b47bff' }, whetstone: { g: 'spike', col: '#d9d9e8' },
  eagleEye: { g: 'eye', col: '#5cb8ff' }, vaultDoor: { g: 'shield', col: '#c9d1de' }, cursedHand: { g: 'card', col: '#c58bff' },
  plague: { g: 'drop', col: '#8cff5a' }, chains: { g: 'chain', col: '#a0a6b8' }, stormJar: { g: 'bolt', col: '#ffe85a' },
  echoStone: { g: 'orb', col: '#7fe0d0' }
};

// maps 13 × 9: '#' rock (towers), '.' floor (traps, monsters), 'E' entrance, 'V' vault, '~' chasm / lava river
DD.MAPS = [
  { name: 'dd_act1', rows: [
    '#############',
    '#.....#.....#',
    '#.###.#.###.#',
    '#.#.......#.#',
    'E...#.#.#...V',
    '#.#.......#.#',
    '#.###.#.###.#',
    '#.....#.....#',
    '#############'] },
  { name: 'dd_act2', rows: [
    '###~~~#######',
    '#....~#.....#',
    '#.##.~#.###.#',
    '#.#.......#.#',
    'E.#.###.#...V',
    '#...#~#.#.#.#',
    '###.#~#...#.#',
    '#.....~~#...#',
    '######~~#####'] },
  { name: 'dd_act3', rows: [
    '#############',
    '#.....#.....#',
    '#.#.#...#.#.#',
    '#.#.#.#.#.#.#',
    'E...#.#.#...V',
    '#.#...#...#.#',
    '#.###.#.###.#',
    '#...........#',
    '#############'] }
];

// waves per act: [hero, count] groups (wave 5 of each act is the boss wave)
DD.WAVES = [
  [
    [['squire', 6]],
    [['squire', 6], ['rogue', 3]],
    [['squire', 6], ['knight', 3], ['rogue', 2]],
    [['squire', 5], ['knight', 3], ['rogue', 4], ['cleric', 2]],
    [['squire', 6], ['knight', 3], ['cleric', 1], ['brannoc', 1]]
  ],
  [
    [['squire', 8], ['mage', 2], ['knight', 2]],
    [['rogue', 6], ['dwarf', 2], ['cleric', 2], ['knight', 2]],
    [['knight', 5], ['mage', 3], ['cleric', 2], ['squire', 5]],
    [['dwarf', 3], ['rogue', 6], ['mage', 3], ['knight', 3], ['cleric', 2]],
    [['mage', 3], ['knight', 4], ['cleric', 2], ['rogue', 3], ['vexa', 1]]
  ],
  [
    [['paladin', 2], ['knight', 4], ['rogue', 5], ['cleric', 2]],
    [['mage', 4], ['dwarf', 3], ['paladin', 2], ['squire', 8]],
    [['knight', 6], ['paladin', 3], ['cleric', 3], ['rogue', 6]],
    [['paladin', 4], ['mage', 4], ['dwarf', 3], ['rogue', 6], ['cleric', 3], ['knight', 4]],
    [['paladin', 3], ['knight', 4], ['cleric', 3], ['mage', 2], ['aldric', 1]]
  ]
];
DD.WAVES_PER_ACT = 5;
DD.RELIC_AFTER = [3, 5];   // wave numbers within an act that end with a relic choice
DD.MAX_DREAD = 10;
})();
