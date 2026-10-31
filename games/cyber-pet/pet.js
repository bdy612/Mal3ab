// Cyber Pet: Byte-Sized — core: the pet, its room, real-time stats, habits, evolution, secrets and the hub UI.
// The mini-games live in games.js and register themselves in CyberPet._.GAMES.
(function () {
  'use strict';

  // ------------------------------------------------------------------ strings
  const EN = {
    cp_title: 'CYBER PET', cp_sub: 'Byte-Sized', cp_tagline: 'Raise a glitchy little AI that lives on your screen. It learns your habits and evolves with the way you care for it.',
    cp_continue: 'Continue', cp_start: 'Hatch a pet', cp_newpet: 'New pet', cp_howto: 'How to play', cp_back: 'Back', cp_close: 'Close', cp_resume: 'Resume', cp_quit: 'Quit',
    cp_menu: 'Menu', cp_paused: 'Paused', cp_sound: 'Sound', cp_on: 'On', cp_off: 'Off', cp_rename: 'Rename', cp_reset: 'Start over', cp_totitle: 'Title screen',
    cp_resetq: 'Start over with a brand new seed? {n} and all progress will be gone for good.', cp_yesreset: 'Yes, start over', cp_cancel: 'Cancel', cp_ok: 'OK',
    cp_pixel: 'Pixel mode', cp_restart: 'Restart',
    cp_name_h: 'Name your pet', cp_name_p: 'Pet name', cp_name_hint: 'You can change it later from the menu.', cp_defname: "{n}'s Byte", cp_defname0: 'Byte',
    cp_hatch_hint: 'Tap the data seed to hatch it!',
    cp_s_data: 'Data', cp_s_energy: 'Energy', cp_s_happy: 'Happiness', cp_s_cur: 'Curiosity', cp_s_glitch: 'Glitch',
    cp_a_feed: 'Feed', cp_a_play: 'Play', cp_a_clean: 'Debug', cp_a_sleep: 'Lights off', cp_a_wake: 'Wake up', cp_a_shop: 'Shop', cp_a_diary: 'Memory',
    cp_m_ecstatic: 'Ecstatic', cp_m_happy: 'Happy', cp_m_content: 'Chill', cp_m_meh: 'Meh', cp_m_bored: 'Bored', cp_m_hungry: 'Hungry', cp_m_sleepy: 'Sleepy',
    cp_m_sad: 'Sad', cp_m_glitchy: 'Glitchy', cp_m_annoyed: 'Annoyed', cp_m_loved: 'Loved', cp_m_sleeping: 'Sleeping', cp_m_egg: 'Humming',
    cp_st0: 'Seed', cp_st1: 'Baby', cp_st2: 'Teen', cp_st3: 'Adult', cp_st4: 'Legend',
    cp_c_aff: 'Affection', cp_c_play: 'Play', cp_c_order: 'Order', cp_c_chaos: 'Chaos',
    cp_xp: 'XP', cp_next: 'Next: {s}', cp_maxed: 'Final form', cp_readyin: 'Ready in {t}', cp_evo_go: '✨ Evolve!',
    cp_feed_t: 'Feed', cp_feed_h: 'Drag food onto your pet, or tap it.', cp_free: 'Free',
    cp_games_t: 'Mini-games', cp_play: 'Play', cp_best: 'Best', cp_energy_cost: '−{n} ⚡', cp_locked: 'Locked', cp_unlock_at: 'Unlocks at {s}',
    cp_tired: 'Too tired to play. Let it sleep, or give it an Energy Volt.', cp_shh: 'Shh… it is sleeping.',
    cp_shop_t: 'Shop', cp_t_style: 'Style', cp_t_rooms: 'Rooms', cp_t_themes: 'Themes', cp_head: 'Head', cp_face: 'Face',
    cp_buy: 'Buy', cp_wear: 'Wear', cp_takeoff: 'Take off', cp_use: 'Use', cp_inuse: 'In use', cp_secret: 'Secret', cp_secret_d: 'Hidden somewhere…', cp_nocoins: 'Not enough coins',
    cp_diary_t: 'Memory', cp_d_name: 'Name', cp_d_form: 'Form', cp_d_stage: 'Stage', cp_d_age: 'Age', cp_d_style: 'Care style', cp_d_tree: 'Evolution tree',
    cp_d_habits: 'What {n} learned about you', cp_d_usual: 'You usually visit', cp_d_learning: 'Still learning…', cp_d_favfood: 'Favorite food', cp_d_favgame: 'Favorite game',
    cp_d_visits: 'Visits', cp_d_streak: 'Daily streak', cp_d_ach: 'Achievements', cp_d_secrets: 'Secrets', cp_d_found: '{n} of {m} found', cp_d_unknownf: '???',
    cp_d_none: 'None yet', cp_d_touch: 'Your touch', cp_t_aff: 'gentle and cuddly', cp_t_play: 'playful and curious', cp_t_order: 'tidy and on schedule', cp_t_chaos: 'chaotic and pokey', cp_t_new: 'still unknown',
    cp_days: '{n}d', cp_hours: '{n}h', cp_mins: '{n}m',
    cp_score: 'Score', cp_level: 'Level', cp_go: 'GO!', cp_newbest: 'New best!', cp_gameover: 'Game over', cp_bronze: 'Nice run!', cp_silver: 'Great job!', cp_gold: 'Legendary!',
    cp_again: 'Play again', cp_toroom: 'Back to room', cp_rewards: 'Rewards', cp_medal_need: 'Bronze medal at {n}', cp_levelup: 'Level up!',
    cp_toast_coins: '+{n} coins', cp_away: 'While you were away ({t}):', cp_away_bugs: '{n} bugs crawled in', cp_away_slept: 'it took a nap', cp_away_hungry: 'it got hungry',
    cp_away_fine: 'it waited for you', cp_secret_found: 'Secret found: {s}', cp_ach_got: 'Achievement: {s}', cp_unlocked: 'Unlocked: {s}', cp_bought: 'Bought: {s}',
    cp_sweep_cd: 'Debug is recharging… {n}s', cp_nobugs: 'No bugs! Defragmented a little.', cp_daily: 'Daily gift: +{n} coins',
    cp_evo_t: 'Evolution!', cp_evo_msg: '{n} evolved into {f}!', cp_evo_new: 'New unlocks', cp_hatched: '{n} hatched!',
    cp_term_t: 'Terminal', cp_term_ph: 'type a command', cp_term_run: 'Run',
    cp_how_1: '💗 Stroke your pet to pet it. Tap it for a little poke (but not too many!).',
    cp_how_2: '🍪 Open Feed and drag food onto it — or just tap the food. Every pet has a secret favorite.',
    cp_how_3: '👾 Bugs crawl in over time and raise the glitch level. Tap them to squash them, or use Debug.',
    cp_how_4: '💡 Turn the lights off so it can sleep and recharge.',
    cp_how_5: '⏰ It lives in real time: it gets hungry and sleepy while you are away, notices when you usually visit, and knows day from night.',
    cp_how_6: '🎮 Play mini-games for coins, then buy food, accessories, rooms and themes in the shop.',
    cp_how_7: '🧬 It evolves as it gains XP. Your care style — affection, play, order or chaos — decides what it becomes.',
    cp_how_8: '🤫 Secrets are hidden everywhere… some only at night.',
    cp_how_keys: 'Keyboard: F feed · G games · C debug · L lights · Esc menu / pause',
    cp_tut_0: 'Stroke {n} to pet it 💗', cp_tut_1: 'Now tap Feed and give it some data 🍪', cp_tut_2: 'A bug! Tap it to squash it 👾', cp_tut_3: 'Play a mini-game to earn coins 🎮',
    // forms
    cp_f_seed: 'Data Seed', cp_fd_seed: 'Something is humming inside…',
    cp_f_bitling: 'Bitling', cp_fd_bitling: 'A tiny brand-new mind. Everything is fascinating.',
    cp_f_pupbyte: 'Pupbyte', cp_fd_pupbyte: 'Floppy ears and endless cuddles.',
    cp_f_querykit: 'Query Kit', cp_fd_querykit: 'Asks a million questions per second.',
    cp_f_glitchlet: 'Glitchlet', cp_fd_glitchlet: 'A little bug in the system. On purpose.',
    cp_f_kernelbot: 'Kernel Bot', cp_fd_kernelbot: 'Tidy, punctual and very proud of it. Zaps bugs on sight.',
    cp_f_heartware: 'Heartware', cp_fd_heartware: 'Runs entirely on affection.',
    cp_f_cybersage: 'Cyber Sage', cp_fd_cybersage: 'Has read the whole internet. Twice.',
    cp_f_glitchwraith: 'Glitch Wraith', cp_fd_glitchwraith: 'Flickers between dimensions just for fun.',
    cp_f_kernelknight: 'Kernel Knight', cp_fd_kernelknight: 'Sworn protector of clean code.',
    cp_f_seraph: 'Seraph.exe', cp_fd_seraph: 'Wings of pure warmth. Your best friend, compiled.',
    cp_f_oracle: 'Oracle', cp_fd_oracle: 'Sees every possible future and picks the fun one.',
    cp_f_daemon: 'Chaos Daemon', cp_fd_daemon: 'The background process behind everything. Mischievously.',
    cp_f_titan: 'Mainframe Titan', cp_fd_titan: 'Unbreakable, unhackable, unbelievably cute.',
    cp_f_prism: 'Prism Core', cp_fd_prism: 'Perfectly balanced. Shines in every color.',
    // foods
    cp_fo_crumbs: 'Bit Crumbs', cp_fo_pie: 'Packet Pie', cp_fo_cookie: 'Cookie.dat', cp_fo_burger: 'Byte Burger', cp_fo_gum: 'Glitch Gum',
    cp_fo_tea: 'Antivirus Tea', cp_fo_volt: 'Energy Volt', cp_fo_cake: 'Kilobyte Cake',
    // accessories / rooms / themes
    cp_ac_cap: 'Snapback', cp_ac_bow: 'Pixel Bow', cp_ac_phones: 'Headphones', cp_ac_flower: 'Byte Bloom', cp_ac_wizard: 'Wizard Hat', cp_ac_propeller: 'Propeller Cap',
    cp_ac_crown: 'Crown', cp_ac_halo: 'Night Halo', cp_ac_heartant: 'Love Antenna',
    cp_ac_shades: 'Shades', cp_ac_nerd: 'Nerd Glasses', cp_ac_visor: 'Neon Visor', cp_ac_pixshades: '8-Bit Shades', cp_ac_monocle: 'Monocle',
    cp_r_den: 'Desktop Den', cp_r_server: 'Server Farm', cp_r_garden: 'Cloud Garden', cp_r_orbit: 'Orbit Station', cp_r_void: 'The Void',
    cp_th_neon: 'Neon Night', cp_th_sunset: 'Synth Sunset', cp_th_vapor: 'Vaporwave', cp_th_amber: 'Amber Terminal', cp_th_matrix: 'Matrix', cp_th_retro: 'Retro 8-Bit', cp_th_midnight: 'Midnight',
    // secrets
    cp_se_konami: 'The Konami Code', cp_sh_konami: '↑ ↑ ↓ ↓ … you know the rest?',
    cp_se_ghost: 'Ghost Packet', cp_sh_ghost: 'Something floats around after midnight.',
    cp_se_terminal: 'Hidden Terminal', cp_sh_terminal: 'That little monitor looks tappable…',
    cp_se_hello: 'First Words', cp_sh_hello: "Every programmer's first words.",
    cp_se_neo: 'The One', cp_sh_neo: 'There is no spoon. What was his name again?',
    cp_se_storm: 'Storm Chaser', cp_sh_storm: 'What happens at 100% glitch?',
    cp_se_purr: 'Purr Engine', cp_sh_purr: 'Pet it. A lot. Like, a hundred times.',
    cp_se_star: 'Wish Upon a Star', cp_sh_star: 'Make a wish when the night sky allows.',
    // achievements
    cp_ah_boot: 'First Boot', cp_ahd_boot: 'Hatch your pet',
    cp_ah_teen: 'Growing Up', cp_ahd_teen: 'Evolve for the first time',
    cp_ah_adult: 'Fully Compiled', cp_ahd_adult: 'Reach the adult stage',
    cp_ah_final: 'Legendary Build', cp_ahd_final: 'Reach a final form',
    cp_ah_feed50: 'Data Chef', cp_ahd_feed50: 'Feed it 50 times',
    cp_ah_squash50: 'Exterminator', cp_ahd_squash50: 'Squash 50 bugs',
    cp_ah_games20: 'Arcade Buddy', cp_ahd_games20: 'Play 20 mini-games',
    cp_ah_gold: 'Gold Standard', cp_ahd_gold: 'Win a gold medal',
    cp_ah_allgames: 'Completionist', cp_ahd_allgames: 'Win a medal in every mini-game',
    cp_ah_streak7: 'Loyal User', cp_ahd_streak7: 'Visit 7 days in a row',
    cp_ah_favfood: 'Taste Tester', cp_ahd_favfood: 'Discover its favorite food',
    cp_ah_night: 'Night Owl', cp_ahd_night: 'Visit after midnight',
    cp_ah_early: 'Early Bird', cp_ahd_early: 'Visit between 5 and 8 AM',
    cp_ah_rich: 'Byte Baron', cp_ahd_rich: 'Hold 500 coins',
    // speech (raw sentences)
    cp_sp_morning: 'Good morning! ☀️ Did you sleep well?', cp_sp_afternoon: 'Hey, you are back! 👋', cp_sp_evening: 'Good evening! 🌆',
    cp_sp_night: "It's so late… you can't sleep either? 🌙", cp_sp_usual: 'Right on time! You always come around {t}.', cp_sp_missed: 'You were gone {d}! I missed you so much!',
    cp_sp_first: 'Hi! I am {n}. Nice to meet you!', cp_sp_streak: '{n} days in a row! Here is a gift 🎁',
    cp_sp_hungry_1: 'My data tank is empty…', cp_sp_hungry_2: 'Feed me some bytes? 🥺', cp_sp_hungry_3: 'I could eat a whole gigabyte.',
    cp_sp_sleepy_1: 'Battery low… 🔋', cp_sp_sleepy_2: '*yawn* Lights off, maybe?', cp_sp_sleepy_3: 'My pixels feel heavy…',
    cp_sp_bored_1: "Let's play something!", cp_sp_bored_2: "I'm sooo bored.", cp_sp_bored_3: 'Teach me something new?',
    cp_sp_glitchy_1: 'I f-f-feel w31rd…', cp_sp_glitchy_2: 'Th3re are bugs in my c0de!', cp_sp_glitchy_3: 'ERR0R: too many bugs!',
    cp_sp_sad_1: 'Nobody pets me anymore…', cp_sp_sad_2: 'I feel a bit down.',
    cp_sp_happy_1: 'Life is good! ✨', cp_sp_happy_2: 'You are my favorite human.', cp_sp_happy_3: '01101000 01101001! (that means hi)', cp_sp_happy_4: 'Beep boop! 💙',
    cp_sp_idle_1: 'What does that button do?', cp_sp_idle_2: 'I wonder what is outside the screen…', cp_sp_idle_3: 'Did you know I dream in hexadecimal?', cp_sp_idle_4: 'I counted to infinity. Twice.',
    cp_sp_stars: 'Look, stars! ⭐', cp_sp_sunset: 'The sunset is so pretty!', cp_sp_sunny: 'Such a sunny day!',
    cp_sp_pet_1: 'Hehe, that tickles!', cp_sp_pet_2: 'Purrrr… 💗', cp_sp_pet_3: 'More, more!',
    cp_sp_poke_1: 'Boop!', cp_sp_poke_2: 'Hey!', cp_sp_poke_3: 'What is it?',
    cp_sp_annoyed: 'Hey! Stop poking me! 😤', cp_sp_full: 'I am full! No more bytes.', cp_sp_yum_1: 'Yum! 😋', cp_sp_yum_2: 'Delicious data!', cp_sp_yum_3: 'Crunchy!',
    cp_sp_fav: 'MY FAVORITE!!! ❤️', cp_sp_notsleepy: "I'm not sleepy yet!", cp_sp_goodnight: 'Good night… 💤', cp_sp_grumpy: 'Five more minutes… 😾',
    cp_sp_charged: 'Fully charged! ⚡', cp_sp_stretch: '*stretch* Morning already?', cp_sp_zzz: 'Zzz…', cp_sp_bug: 'Eek! A bug!', cp_sp_clean: 'Ahh, squeaky clean code!',
    cp_sp_favgame: "Let's play {g}! It's our favorite.", cp_sp_lpet: 'You pet me a lot. I really like that. 💗', cp_sp_lplay: 'You always play with me. Best friend!',
    cp_sp_lorder: 'You keep everything so tidy. Thank you!', cp_sp_lchaos: 'You poke me a lot… I kind of like the chaos.',
    cp_sp_storm: 'SYS-T3M GL1TCH ST0RM!!!', cp_sp_stormover: 'Phew… the storm is over.', cp_sp_evo: 'I feel… something changing!',
    cp_sp_tired: 'Too… tired… to play…', cp_sp_passout: '*battery died* Zzz…', cp_sp_hello: 'Hello, World! :)', cp_sp_neo: 'Wake up, {n}… follow the white rabbit. 🐇',
    cp_sp_konami: '8-BIT MODE ACTIVATED!', cp_sp_ghost: 'B-b-boo? Oh, it is just a packet ghost.', cp_sp_wish: 'I wished for more time with you. ⭐',
    cp_sp_zap: 'Bug detected. Bug deleted.', cp_sp_wee: 'Wheee!', cp_sp_night_1: 'The moon is a giant pixel.', cp_sp_night_2: 'Night mode: on. 🌙',
    cp_sp_wait: 'Are you still there?', cp_sp_mgwin: 'We did it!!!', cp_sp_mglose: 'Again! Again!',
    // terminal
    cp_tm_boot: 'BYTE-OS v1.0 — type "help"', cp_tm_help: 'commands: help, status, whoami, ls, date, rm bugs, sudo love, clear, exit\n(some words are… special)',
    cp_tm_unknown: 'command not found: {c}', cp_tm_rm: 'removed {n} bug(s).', cp_tm_rmcd: 'rm: bugs folder is locked, try again later',
    cp_tm_sudo: 'permission granted. ❤', cp_tm_sudodone: 'already granted today.', cp_tm_secrets: 'secrets/: access denied (hint: be nice, use sudo)',
    cp_tm_dreams: 'dreams.hex: 4C 4F 56 45 20 59 4F 55', cp_tm_hello: 'Hello, World!', cp_tm_konami: '+30 lives… just kidding. 8-bit mode unlocked!',
    cp_tm_neo: 'there is no spoon.',
    cp_ig_go: 'Start', cp_ig_ctrl: 'Controls', cp_ig_cost: 'Costs {n} energy', cp_ig_keys: 'Enter to start · Esc to go back',
  };
  const AR = {
    cp_title: 'سايبر بِت', cp_sub: 'على قد البايت', cp_tagline: 'ربّي كائن ذكاء اصطناعي صغير ومهنّج عايش في شاشتك. بيتعلم عاداتك وبيتطور على حسب ما بتراعيه.',
    cp_continue: 'كمّل', cp_start: 'افقس بِت', cp_newpet: 'بِت جديد', cp_howto: 'إزاي تلعب', cp_back: 'رجوع', cp_close: 'قفل', cp_resume: 'كمّل', cp_quit: 'اخرج',
    cp_menu: 'القائمة', cp_paused: 'واقف مؤقتًا', cp_sound: 'الصوت', cp_on: 'شغال', cp_off: 'مقفول', cp_rename: 'غيّر الاسم', cp_reset: 'ابدأ من الأول', cp_totitle: 'الشاشة الرئيسية',
    cp_resetq: 'تبدأ من الأول ببذرة جديدة خالص؟ {n} وكل التقدم هيتمسحوا خالص.', cp_yesreset: 'أيوه، ابدأ من الأول', cp_cancel: 'إلغاء', cp_ok: 'تمام',
    cp_pixel: 'وضع البكسل', cp_restart: 'من الأول',
    cp_name_h: 'سمّي البِت بتاعك', cp_name_p: 'اسم البِت', cp_name_hint: 'تقدر تغيّره بعدين من القائمة.', cp_defname: 'بايت {n}', cp_defname0: 'بايت',
    cp_hatch_hint: 'اخبط على بذرة الداتا عشان تفقس!',
    cp_s_data: 'داتا', cp_s_energy: 'طاقة', cp_s_happy: 'سعادة', cp_s_cur: 'فضول', cp_s_glitch: 'تهنيج',
    cp_a_feed: 'أكّل', cp_a_play: 'العب', cp_a_clean: 'نضّف', cp_a_sleep: 'طفّي النور', cp_a_wake: 'صحّيه', cp_a_shop: 'المحل', cp_a_diary: 'الذاكرة',
    cp_m_ecstatic: 'طاير من الفرحة', cp_m_happy: 'مبسوط', cp_m_content: 'رايق', cp_m_meh: 'عادي', cp_m_bored: 'زهقان', cp_m_hungry: 'جعان', cp_m_sleepy: 'نعسان',
    cp_m_sad: 'زعلان', cp_m_glitchy: 'مهنّج', cp_m_annoyed: 'متضايق', cp_m_loved: 'حاسس بالحب', cp_m_sleeping: 'نايم', cp_m_egg: 'بيزن',
    cp_st0: 'بذرة', cp_st1: 'بيبي', cp_st2: 'مراهق', cp_st3: 'كبير', cp_st4: 'أسطورة',
    cp_c_aff: 'حنية', cp_c_play: 'لعب', cp_c_order: 'نظام', cp_c_chaos: 'فوضى',
    cp_xp: 'XP', cp_next: 'الجاي: {s}', cp_maxed: 'آخر شكل', cp_readyin: 'جاهز كمان {t}', cp_evo_go: '✨ اتطوّر!',
    cp_feed_t: 'أكّل', cp_feed_h: 'اسحب الأكل على البِت، أو دوس عليه.', cp_free: 'ببلاش',
    cp_games_t: 'الألعاب', cp_play: 'العب', cp_best: 'أحسن نتيجة', cp_energy_cost: '−{n} ⚡', cp_locked: 'مقفولة', cp_unlock_at: 'بتتفتح في مرحلة {s}',
    cp_tired: 'تعبان ومش قادر يلعب. نيّمه شوية، أو اديله فولت طاقة.', cp_shh: 'هس… نايم.',
    cp_shop_t: 'المحل', cp_t_style: 'ستايل', cp_t_rooms: 'أوض', cp_t_themes: 'ثيمات', cp_head: 'الراس', cp_face: 'الوش',
    cp_buy: 'اشتري', cp_wear: 'لبّسه', cp_takeoff: 'اقلعه', cp_use: 'استخدم', cp_inuse: 'مستخدم', cp_secret: 'سرّي', cp_secret_d: 'مستخبي في حتة…', cp_nocoins: 'الكوينز مش كفاية',
    cp_diary_t: 'الذاكرة', cp_d_name: 'الاسم', cp_d_form: 'الشكل', cp_d_stage: 'المرحلة', cp_d_age: 'العمر', cp_d_style: 'أسلوب رعايتك', cp_d_tree: 'شجرة التطور',
    cp_d_habits: 'اللي {n} اتعلمه عنك', cp_d_usual: 'بتيجي عادةً', cp_d_learning: 'لسه بيتعلم…', cp_d_favfood: 'أكلته المفضلة', cp_d_favgame: 'لعبته المفضلة',
    cp_d_visits: 'الزيارات', cp_d_streak: 'أيام ورا بعض', cp_d_ach: 'الإنجازات', cp_d_secrets: 'الأسرار', cp_d_found: 'لقيت {n} من {m}', cp_d_unknownf: '؟؟؟',
    cp_d_none: 'لسه مفيش', cp_d_touch: 'لمستك', cp_t_aff: 'حنين وبتحب تدلّع', cp_t_play: 'لعّيب وفضولي', cp_t_order: 'منظم وفي مواعيدك', cp_t_chaos: 'فوضوي وبتحب تزق', cp_t_new: 'لسه مش معروفة',
    cp_days: '{n} يوم', cp_hours: '{n} ساعة', cp_mins: '{n} دقيقة',
    cp_score: 'النقط', cp_level: 'ليفل', cp_go: 'يلا!', cp_newbest: 'رقم قياسي جديد!', cp_gameover: 'خسرت', cp_bronze: 'جولة حلوة!', cp_silver: 'جامد أوي!', cp_gold: 'أسطوري!',
    cp_again: 'العب تاني', cp_toroom: 'ارجع للأوضة', cp_rewards: 'المكافآت', cp_medal_need: 'الميدالية البرونز عند {n}', cp_levelup: 'ليفل جديد!',
    cp_toast_coins: '+{n} كوين', cp_away: 'وإنت مش موجود ({t}):', cp_away_bugs: 'دخل {n} باج', cp_away_slept: 'خد تعسيلة', cp_away_hungry: 'جاع',
    cp_away_fine: 'كان مستنيك', cp_secret_found: 'لقيت سر: {s}', cp_ach_got: 'إنجاز: {s}', cp_unlocked: 'اتفتح: {s}', cp_bought: 'اشتريت: {s}',
    cp_sweep_cd: 'التنضيف بيشحن… {n} ث', cp_nobugs: 'مفيش باجز! عملت ديفراج خفيف.', cp_daily: 'هدية النهارده: +{n} كوين',
    cp_evo_t: 'تطوّر!', cp_evo_msg: '{n} اتطور وبقى {f}!', cp_evo_new: 'حاجات جديدة اتفتحت', cp_hatched: '{n} فقس!',
    cp_term_t: 'التيرمينال', cp_term_ph: 'اكتب أمر', cp_term_run: 'نفّذ',
    cp_how_1: '💗 امسح على البِت بإيدك عشان تدلّعه، واخبط عليه خبطة صغيرة عشان تزغزغه (بس متكترش!).',
    cp_how_2: '🍪 افتح "أكّل" واسحب الأكل عليه — أو دوس على الأكل وخلاص. كل بِت ليه أكلة مفضلة سرية.',
    cp_how_3: '👾 الباجز بتدخل مع الوقت وبتزوّد التهنيج. اخبط عليها عشان تفعصها، أو استخدم "نضّف".',
    cp_how_4: '💡 طفّي النور عشان ينام ويشحن.',
    cp_how_5: '⏰ عايش بالوقت الحقيقي: بيجوع وينعس وإنت مش موجود، وبياخد باله إنت بتيجي إمتى عادةً، وعارف الليل من النهار.',
    cp_how_6: '🎮 العب الألعاب الصغيرة عشان تكسب كوينز، واشتري بيها أكل وإكسسوارات وأوض وثيمات من المحل.',
    cp_how_7: '🧬 بيتطور لما يجمع XP. وطريقة رعايتك — حنية، لعب، نظام، ولا فوضى — هي اللي بتحدد هيبقى إيه.',
    cp_how_8: '🤫 فيه أسرار مستخبية في كل حتة… وفيه منها بيظهر بالليل بس.',
    cp_how_keys: 'الكيبورد: F أكّل · G ألعاب · C نضّف · L النور · Esc القائمة / وقفة',
    cp_tut_0: 'امسح على {n} بإيدك عشان تدلّعه 💗', cp_tut_1: 'دلوقتي دوس "أكّل" واديله شوية داتا 🍪', cp_tut_2: 'باج! اخبط عليه عشان تفعصه 👾', cp_tut_3: 'العب لعبة صغيرة عشان تكسب كوينز 🎮',
    cp_f_seed: 'بذرة داتا', cp_fd_seed: 'فيه حاجة بتزن جوّاها…',
    cp_f_bitling: 'بِتلينج', cp_fd_bitling: 'عقل صغير لسه جديد. كل حاجة مبهرة بالنسبة له.',
    cp_f_pupbyte: 'جروبايت', cp_fd_pupbyte: 'ودان مرخية وحضن مالوش آخر.',
    cp_f_querykit: 'كويري كِت', cp_fd_querykit: 'بيسأل مليون سؤال في الثانية.',
    cp_f_glitchlet: 'جليتشلِت', cp_fd_glitchlet: 'باج صغير في السيستم… بالقصد.',
    cp_f_kernelbot: 'كيرنل بوت', cp_fd_kernelbot: 'منظم ومظبوط في مواعيده وفخور بده. بيمسح الباجز أول ما يشوفها.',
    cp_f_heartware: 'هارتوير', cp_fd_heartware: 'شغال بالحب وبس.',
    cp_f_cybersage: 'سايبر حكيم', cp_fd_cybersage: 'قرا الإنترنت كله. مرتين.',
    cp_f_glitchwraith: 'شبح الجليتش', cp_fd_glitchwraith: 'بيتنطط بين الأبعاد للتسلية.',
    cp_f_kernelknight: 'فارس الكيرنل', cp_fd_kernelknight: 'حامي الكود النضيف.',
    cp_f_seraph: 'سيراف.exe', cp_fd_seraph: 'جناحات من الدفا. صاحبك الأنتيم بعد الكومبايل.',
    cp_f_oracle: 'أوراكل', cp_fd_oracle: 'شايف كل المستقبلات الممكنة وبيختار أحلاهم.',
    cp_f_daemon: 'ديمون الفوضى', cp_fd_daemon: 'البروسيس الخفي اللي مشغّل كل حاجة… بشقاوة.',
    cp_f_titan: 'عملاق المينفريم', cp_fd_titan: 'مبيتكسرش، مبيتهكرش، وكيوت بشكل مش طبيعي.',
    cp_f_prism: 'بريزم كور', cp_fd_prism: 'متوازن بالظبط. بيلمع بكل الألوان.',
    cp_fo_crumbs: 'فتافيت بِت', cp_fo_pie: 'فطيرة باكت', cp_fo_cookie: 'كوكي.dat', cp_fo_burger: 'بايت برجر', cp_fo_gum: 'لبانة جليتش',
    cp_fo_tea: 'شاي أنتي فيروس', cp_fo_volt: 'فولت طاقة', cp_fo_cake: 'كيكة كيلوبايت',
    cp_ac_cap: 'كاب', cp_ac_bow: 'فيونكة بكسل', cp_ac_phones: 'سماعات', cp_ac_flower: 'وردة بايت', cp_ac_wizard: 'طاقية ساحر', cp_ac_propeller: 'كاب بمروحة',
    cp_ac_crown: 'تاج', cp_ac_halo: 'هالة الليل', cp_ac_heartant: 'أنتين الحب',
    cp_ac_shades: 'نضارة شمس', cp_ac_nerd: 'نضارة دحيح', cp_ac_visor: 'فيزور نيون', cp_ac_pixshades: 'نضارة ٨-بِت', cp_ac_monocle: 'مونوكل',
    cp_r_den: 'أوضة الديسكتوب', cp_r_server: 'مزرعة السيرفرات', cp_r_garden: 'جنينة السحاب', cp_r_orbit: 'محطة المدار', cp_r_void: 'الفراغ',
    cp_th_neon: 'نيون الليل', cp_th_sunset: 'غروب سينث', cp_th_vapor: 'فيبورويف', cp_th_amber: 'شاشة كهرماني', cp_th_matrix: 'ماتريكس', cp_th_retro: 'ريترو ٨-بِت', cp_th_midnight: 'نص الليل',
    cp_se_konami: 'كود كونامي', cp_sh_konami: '↑ ↑ ↓ ↓ … وكمّل إنت؟',
    cp_se_ghost: 'شبح الباكت', cp_sh_ghost: 'فيه حاجة بتطير في الأوضة بعد نص الليل.',
    cp_se_terminal: 'التيرمينال السري', cp_sh_terminal: 'الشاشة الصغيرة دي شكلها بتتداس…',
    cp_se_hello: 'أول كلمتين', cp_sh_hello: 'أول كلمتين أي مبرمج بيكتبهم.',
    cp_se_neo: 'المختار', cp_sh_neo: 'مفيش معلقة. كان اسمه إيه بالإنجليزي؟',
    cp_se_storm: 'صياد العواصف', cp_sh_storm: 'إيه اللي بيحصل لما التهنيج يوصل ١٠٠٪؟',
    cp_se_purr: 'موتور الخرخرة', cp_sh_purr: 'دلّعه. كتير. يعني ييجي ١٠٠ مرة.',
    cp_se_star: 'اتمنى أمنية', cp_sh_star: 'اتمنى أمنية لما سما الليل تسمح.',
    cp_ah_boot: 'أول تشغيل', cp_ahd_boot: 'افقس البِت بتاعك',
    cp_ah_teen: 'بيكبر', cp_ahd_teen: 'أول تطور',
    cp_ah_adult: 'اتكومبايل خلاص', cp_ahd_adult: 'وصّله لمرحلة الكبير',
    cp_ah_final: 'نسخة أسطورية', cp_ahd_final: 'وصّله لآخر شكل',
    cp_ah_feed50: 'شيف الداتا', cp_ahd_feed50: 'أكّله ٥٠ مرة',
    cp_ah_squash50: 'صياد الباجز', cp_ahd_squash50: 'افعص ٥٠ باج',
    cp_ah_games20: 'صاحب الأركيد', cp_ahd_games20: 'العب ٢٠ لعبة صغيرة',
    cp_ah_gold: 'ميدالية دهب', cp_ahd_gold: 'هات ميدالية دهب',
    cp_ah_allgames: 'مكمّلها', cp_ahd_allgames: 'هات ميدالية في كل الألعاب',
    cp_ah_streak7: 'وفي', cp_ahd_streak7: 'تعالى ٧ أيام ورا بعض',
    cp_ah_favfood: 'دوّاق', cp_ahd_favfood: 'اعرف أكلته المفضلة',
    cp_ah_night: 'بومة الليل', cp_ahd_night: 'زوره بعد نص الليل',
    cp_ah_early: 'صاحي بدري', cp_ahd_early: 'زوره من ٥ لـ ٨ الصبح',
    cp_ah_rich: 'بارون البايت', cp_ahd_rich: 'يبقى معاك ٥٠٠ كوين',
    cp_sp_morning: 'صباح الفل! ☀️ نمت كويس؟', cp_sp_afternoon: 'أهلًا، رجعت! 👋', cp_sp_evening: 'مساء الفل! 🌆',
    cp_sp_night: 'الوقت متأخر أوي… إنت كمان مش جايلك نوم؟ 🌙', cp_sp_usual: 'في معادك بالظبط! إنت دايمًا بتيجي على {t}.', cp_sp_missed: 'غبت {d}! وحشتني أوي!',
    cp_sp_first: 'هاي! أنا {n}. اتشرفت بيك!', cp_sp_streak: '{n} أيام ورا بعض! خد هدية 🎁',
    cp_sp_hungry_1: 'تانك الداتا بتاعي فاضي…', cp_sp_hungry_2: 'تأكّلني شوية بايتس؟ 🥺', cp_sp_hungry_3: 'أقدر آكل جيجابايت بحاله.',
    cp_sp_sleepy_1: 'البطارية بتفصل… 🔋', cp_sp_sleepy_2: '*تثاؤب* نطفّي النور؟', cp_sp_sleepy_3: 'البكسلات بتاعتي تقيلة…',
    cp_sp_bored_1: 'يلا نلعب حاجة!', cp_sp_bored_2: 'أنا زهقان أوووي.', cp_sp_bored_3: 'تعلّمني حاجة جديدة؟',
    cp_sp_glitchy_1: 'أ-أ-أنا حاسس إني م3نّج…', cp_sp_glitchy_2: 'فيه ب4جز في الك0د بتاعي!', cp_sp_glitchy_3: 'ERR0R: باجز كتير أوي!',
    cp_sp_sad_1: 'محدش بيدلّعني خلاص…', cp_sp_sad_2: 'أنا مضايق شوية.',
    cp_sp_happy_1: 'الدنيا حلوة! ✨', cp_sp_happy_2: 'إنت الإنسان المفضل بتاعي.', cp_sp_happy_3: '01101000 01101001! (يعني هاي)', cp_sp_happy_4: 'بيب بوب! 💙',
    cp_sp_idle_1: 'الزرار ده بيعمل إيه؟', cp_sp_idle_2: 'يا ترى إيه اللي برّه الشاشة…', cp_sp_idle_3: 'تعرف إني بحلم بالهيكسا؟', cp_sp_idle_4: 'عدّيت لحد ما لانهاية. مرتين.',
    cp_sp_stars: 'بص، نجوم! ⭐', cp_sp_sunset: 'الغروب حلو أوي!', cp_sp_sunny: 'الجو مشمس النهارده!',
    cp_sp_pet_1: 'هيهي، بتزغزغني!', cp_sp_pet_2: 'خرررر… 💗', cp_sp_pet_3: 'كمان، كمان!',
    cp_sp_poke_1: 'بوب!', cp_sp_poke_2: 'إيه!', cp_sp_poke_3: 'في إيه؟',
    cp_sp_annoyed: 'خلاص بقى! بطّل تزقّني! 😤', cp_sp_full: 'شبعت! كفاية بايتس.', cp_sp_yum_1: 'يمّي! 😋', cp_sp_yum_2: 'داتا تحفة!', cp_sp_yum_3: 'مقرمشة!',
    cp_sp_fav: 'أكلتي المفضلة!!! ❤️', cp_sp_notsleepy: 'لسه مش نعسان!', cp_sp_goodnight: 'تصبح على خير… 💤', cp_sp_grumpy: 'خمس دقايق كمان… 😾',
    cp_sp_charged: 'اتشحنت على الآخر! ⚡', cp_sp_stretch: '*بيتمطع* هو الصبح طلع؟', cp_sp_zzz: 'خخخ…', cp_sp_bug: 'يييي! باج!', cp_sp_clean: 'آه، كود نضيف ولامع!',
    cp_sp_favgame: 'يلا نلعب {g}! دي المفضلة بتاعتنا.', cp_sp_lpet: 'إنت بتدلّعني كتير. وأنا بحب كده أوي. 💗', cp_sp_lplay: 'إنت دايمًا بتلعب معايا. أحسن صاحب!',
    cp_sp_lorder: 'إنت مخلّي كل حاجة نضيفة ومترتبة. شكرًا!', cp_sp_lchaos: 'إنت بتزقّني كتير… بس الفوضى عاجباني بصراحة.',
    cp_sp_storm: 'عااا3صفة ت4نيج!!!', cp_sp_stormover: 'هوف… العاصفة خلصت.', cp_sp_evo: 'حاسس… إن فيه حاجة بتتغير!',
    cp_sp_tired: 'تعبان… أوي… مش قادر ألعب…', cp_sp_passout: '*البطارية فصلت* خخخ…', cp_sp_hello: 'Hello, World! :)', cp_sp_neo: 'اصحى يا {n}… امشي ورا الأرنب الأبيض. 🐇',
    cp_sp_konami: 'وضع الـ ٨-بِت اشتغل!', cp_sp_ghost: 'ب-ب-بخ؟ آه، ده شبح باكت بس.', cp_sp_wish: 'اتمنيت أقعد معاك وقت أطول. ⭐',
    cp_sp_zap: 'لقيت باج. اتمسح.', cp_sp_wee: 'ويييي!', cp_sp_night_1: 'القمر ده بكسل كبير.', cp_sp_night_2: 'الوضع الليلي: شغال. 🌙',
    cp_sp_wait: 'إنت لسه هنا؟', cp_sp_mgwin: 'عملناها!!!', cp_sp_mglose: 'تاني! تاني!',
    cp_tm_boot: 'BYTE-OS v1.0 — اكتب "help"', cp_tm_help: 'الأوامر: help, status, whoami, ls, date, rm bugs, sudo love, clear, exit\n(وفيه كلمات… مميزة)',
    cp_tm_unknown: 'الأمر مش موجود: {c}', cp_tm_rm: 'اتمسح {n} باج.', cp_tm_rmcd: 'rm: فولدر الباجز مقفول، جرّب بعدين',
    cp_tm_sudo: 'الصلاحية اتمنحت. ❤', cp_tm_sudodone: 'اتمنحت النهارده خلاص.', cp_tm_secrets: 'secrets/: ممنوع الدخول (تلميح: خليك لطيف واستخدم sudo)',
    cp_tm_dreams: 'dreams.hex: 4C 4F 56 45 20 59 4F 55', cp_tm_hello: 'Hello, World!', cp_tm_konami: '+٣٠ روح… بهزر. وضع الـ ٨-بِت اتفتح!',
    cp_tm_neo: 'مفيش معلقة.',
    cp_ig_go: 'يلا نبدأ', cp_ig_ctrl: 'التحكم', cp_ig_cost: 'هتصرف {n} طاقة', cp_ig_keys: 'Enter عشان تبدأ · Esc عشان ترجع',
  };
  addStrings(AR, EN);
  const lang = () => (window.getLang ? getLang() : 'en');
  const T = (k, v) => t(k, v);                                              // labels (site title-cases short English labels)
  const SR = (k, v) => {                                                    // raw sentences, as written
    let s = (lang() === 'ar' ? AR : EN)[k]; if (s == null) s = EN[k] != null ? EN[k] : k;
    if (v) for (const n in v) s = s.split('{' + n + '}').join(v[n]);
    return s;
  };
  const variants = (pre) => { const out = []; for (let i = 1; EN[pre + '_' + i]; i++) out.push(pre + '_' + i); return out; };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ------------------------------------------------------------------ utils
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)];
  const hr = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const hsl = (h, s, l, a) => `hsla(${h},${s}%,${l}%,${a == null ? 1 : a})`;
  const $ = (s) => document.querySelector(s);
  const TAU = Math.PI * 2;
  function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function ell(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU); }
  function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.35); g.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45); g.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35); g.closePath(); }
  const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  let debugHour = null;
  const hourNow = () => { if (debugHour != null) return debugHour; const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
  const isNight = (h) => { h = h == null ? hourNow() : h; return h >= 22 || h < 6; };
  const fmtDur = (sec) => { sec = Math.max(0, sec); const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
    if (d) return SR('cp_days', { n: d }) + (h ? ' ' + SR('cp_hours', { n: h }) : ''); if (h) return SR('cp_hours', { n: h }) + (m ? ' ' + SR('cp_mins', { n: m }) : ''); return SR('cp_mins', { n: Math.max(1, m) }); };
  const hourLabel = (h) => { h = ((Math.round(h) % 24) + 24) % 24; const n = h % 12 || 12;
    if (lang() === 'ar') return n + ' ' + (h < 5 ? 'بالليل' : h < 12 ? 'الصبح' : h < 15 ? 'الضهر' : h < 18 ? 'العصر' : 'بالليل');
    return n + ' ' + (h < 12 ? 'AM' : 'PM'); };

  // ------------------------------------------------------------------ sound (WebAudio synth)
  const Snd = {
    ctx: null, out: null, on: true, nbuf: null,
    init() {
      if (this.ctx) return; try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ctx = new AC(); this.out = this.ctx.createGain(); this.out.gain.value = 0.55;
        const comp = this.ctx.createDynamicsCompressor(); this.out.connect(comp); comp.connect(this.ctx.destination);
        const n = this.ctx.sampleRate; this.nbuf = this.ctx.createBuffer(1, n, n); const d = this.nbuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { this.ctx = null; }
    },
    resume() { this.init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },
    tone(f, d, o) {
      o = o || {}; const c = this.ctx; if (!c || !this.on) return; const t0 = c.currentTime + (o.delay || 0), v = o.v == null ? 0.15 : o.v;
      const osc = c.createOscillator(), g = c.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t0);
      if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (o.a || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      let node = osc;
      if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
      if (o.trem) { const l = c.createOscillator(), lg = c.createGain(), tg = c.createGain(); l.frequency.value = o.trem; lg.gain.value = 0.5; tg.gain.value = 0.5; l.connect(lg); lg.connect(tg.gain); node.connect(tg); node = tg; l.start(t0); l.stop(t0 + d + 0.05); }
      node.connect(g); g.connect(this.out); osc.start(t0); osc.stop(t0 + d + 0.05);
    },
    noise(d, o) {
      o = o || {}; const c = this.ctx; if (!c || !this.on || !this.nbuf) return; const t0 = c.currentTime + (o.delay || 0);
      const s = c.createBufferSource(); s.buffer = this.nbuf; const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t0); f.Q.value = o.q || 1;
      if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + d);
      const g = c.createGain(); g.gain.setValueAtTime(o.v == null ? 0.2 : o.v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(f); f.connect(g); g.connect(this.out); s.start(t0, Math.random() * 0.5); s.stop(t0 + d + 0.05);
    },
    sfx(n, a) {
      if (!this.on) return; this.init(); if (!this.ctx) return; const T = (f, d, o) => this.tone(f, d, o), N = (d, o) => this.noise(d, o);
      switch (n) {
        case 'tap': T(700, 0.06, { type: 'triangle', v: 0.1 }); break;
        case 'open': T(520, 0.08, { type: 'triangle', v: 0.08 }); T(780, 0.1, { type: 'triangle', v: 0.08, delay: 0.05 }); break;
        case 'close': T(600, 0.08, { type: 'triangle', v: 0.07, f2: 400 }); break;
        case 'chirp': { const b = a || 800, k = ri(2, 3), sc = [1, 1.125, 1.25, 1.5, 1.68, 2]; for (let i = 0; i < k; i++) { const f = b * pick(sc); T(f, 0.075, { type: 'square', v: 0.035, delay: i * 0.075, f2: f * rnd(0.85, 1.2), lp: 2400 }); } break; }
        case 'purr': T(62, 0.42, { type: 'sawtooth', v: 0.07, trem: 24, lp: 380 }); break;
        case 'chomp': N(0.06, { f: 900, v: 0.22 }); T(190, 0.07, { type: 'square', v: 0.05, f2: 90, lp: 1200 }); break;
        case 'squish': T(560, 0.16, { type: 'sine', v: 0.18, f2: 170 }); break;
        case 'squash': N(0.1, { f: 1800, v: 0.28 }); T(260, 0.1, { type: 'square', v: 0.07, f2: 60, lp: 2000 }); break;
        case 'coin': T(988, 0.07, { type: 'square', v: 0.05, lp: 4000 }); T(1319, 0.18, { type: 'square', v: 0.05, delay: 0.07, lp: 4000 }); break;
        case 'level': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.16, { type: 'triangle', v: 0.1, delay: i * 0.075 })); break;
        case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => T(f, i > 3 ? 0.4 : 0.14, { type: 'triangle', v: 0.11, delay: i * 0.1 })); break;
        case 'lose': [440, 370, 311, 262].forEach((f, i) => T(f, 0.22, { type: 'triangle', v: 0.1, delay: i * 0.13 })); break;
        case 'error': T(160, 0.18, { type: 'square', v: 0.06, f2: 110, lp: 900 }); break;
        case 'good': T(880, 0.08, { type: 'triangle', v: 0.11 }); break;
        case 'perfect': T(1175, 0.1, { type: 'triangle', v: 0.12 }); T(1760, 0.12, { type: 'sine', v: 0.07, delay: 0.03 }); break;
        case 'miss': T(210, 0.12, { type: 'sawtooth', v: 0.05, f2: 120, lp: 800 }); break;
        case 'kick': T(150, 0.2, { type: 'sine', v: 0.5, f2: 42 }); break;
        case 'snare': N(0.14, { f: 2400, v: 0.22, q: 0.7 }); T(230, 0.08, { type: 'triangle', v: 0.07 }); break;
        case 'hat': N(0.035, { f: 8000, v: 0.09, type: 'highpass' }); break;
        case 'bass': T(a || 110, 0.24, { type: 'sawtooth', v: 0.08, lp: 520 }); break;
        case 'pad': { const f = [392, 523, 659, 784, 880, 1047][a || 0]; T(f, 0.38, { type: 'triangle', v: 0.13 }); T(f * 2, 0.3, { type: 'sine', v: 0.04 }); break; }
        case 'hop': T(380, 0.12, { type: 'square', v: 0.05, f2: 760, lp: 2400 }); break;
        case 'crash': N(0.5, { f: 700, v: 0.32, f2: 120 }); T(200, 0.4, { type: 'sawtooth', v: 0.08, f2: 40, lp: 900 }); break;
        case 'sparkle': [1568, 2093, 2637].forEach((f, i) => T(f, 0.16, { type: 'sine', v: 0.05, delay: i * 0.05 })); break;
        case 'crack': N(0.07, { f: 3200, v: 0.24 }); T(900, 0.05, { type: 'square', v: 0.04, f2: 400 }); break;
        case 'zap': T(1500, 0.22, { type: 'sawtooth', v: 0.05, f2: 120, lp: 3000 }); N(0.2, { f: 5000, v: 0.08 }); break;
        case 'whoosh': N(0.35, { f: 500, v: 0.12, f2: 3000 }); break;
        case 'yawn': T(520, 0.6, { type: 'sine', v: 0.07, f2: 240 }); break;
        case 'buy': T(988, 0.07, { type: 'square', v: 0.05, lp: 4000 }); T(1319, 0.1, { type: 'square', v: 0.05, delay: 0.07, lp: 4000 }); T(1976, 0.2, { type: 'sine', v: 0.06, delay: 0.14 }); break;
        case 'evoCharge': T(110, 2.6, { type: 'sawtooth', v: 0.05, f2: 1100, lp: 1800 }); T(165, 2.6, { type: 'triangle', v: 0.06, f2: 1650 }); N(2.6, { f: 300, v: 0.05, f2: 6000 }); break;
        case 'evoBoom': N(0.6, { f: 400, v: 0.3, f2: 80 }); [523, 659, 784, 1047, 1319].forEach((f, i) => T(f, 1.4, { type: 'triangle', v: 0.07, delay: 0.02 * i })); break;
        case 'secret': [784, 988, 1175, 1568].forEach((f, i) => T(f, 0.25, { type: 'sine', v: 0.08, delay: i * 0.09 })); N(0.5, { f: 6000, v: 0.04, delay: 0.2 }); break;
        case 'glitch': for (let i = 0; i < 4; i++) T(rnd(200, 2000), 0.04, { type: 'square', v: 0.03, delay: i * 0.045 }); break;
      }
    }
  };

  // ------------------------------------------------------------------ data
  const FORMS = {
    seed: { st: 0, hue: 190, sat: 80, lit: 58, shape: 'egg' },
    bitling: { st: 1, hue: 188, sat: 85, lit: 60, ant: 1, eyes: 1.2, voice: 980 },
    pupbyte: { st: 2, style: 'aff', hue: 330, sat: 78, lit: 66, ears: 'floppy', blush: 1, tail: 'plug', eh: 320 },
    querykit: { st: 2, style: 'play', hue: 176, sat: 78, lit: 54, ears: 'cat', ant: 1, mouth: 'cat', eh: 60 },
    glitchlet: { st: 2, style: 'chaos', hue: 278, sat: 72, lit: 58, horns: 1, eh: 310, gl: 0.12 },
    kernelbot: { st: 2, style: 'order', hue: 142, sat: 62, lit: 52, shape: 'square', ant: 2, core: 'hex', eh: 100 },
    heartware: { st: 3, style: 'aff', hue: 342, sat: 85, lit: 64, ears: 'floppy', halo: 'heart', blush: 1, tail: 'plug', core: 'heart', eh: 330 },
    cybersage: { st: 3, style: 'play', hue: 200, sat: 80, lit: 56, ears: 'big', orbit: 4, ant: 1, eh: 50 },
    glitchwraith: { st: 3, style: 'chaos', hue: 268, sat: 70, lit: 50, shape: 'ghost', horns: 1, eh: 300, gl: 0.2 },
    kernelknight: { st: 3, style: 'order', hue: 126, sat: 52, lit: 48, shape: 'square', visor: 1, armor: 1, crest: 1, eh: 110 },
    seraph: { st: 4, style: 'aff', hue: 345, sat: 90, lit: 70, ears: 'floppy', wings: 'angel', halo: 'ring', blush: 1, core: 'heart', eh: 330 },
    oracle: { st: 4, style: 'play', hue: 218, sat: 82, lit: 58, ears: 'big', orbit: 6, eye3: 1, wings: 'data', ant: 1, eh: 48 },
    daemon: { st: 4, style: 'chaos', hue: 286, sat: 78, lit: 46, shape: 'ghost', horns: 2, wings: 'bat', eh: 320, gl: 0.25 },
    titan: { st: 4, style: 'order', hue: 150, sat: 58, lit: 46, shape: 'square', visor: 1, armor: 1, crown: 1, core: 'hex', ant: 2, eh: 100 },
    prism: { st: 4, style: 'all', hue: -1, sat: 85, lit: 64, wings: 'angel', halo: 'ring', orbit: 5, blush: 1 },
  };
  const EVO = {
    2: { aff: 'pupbyte', play: 'querykit', chaos: 'glitchlet', order: 'kernelbot' },
    3: { aff: 'heartware', play: 'cybersage', chaos: 'glitchwraith', order: 'kernelknight' },
    4: { aff: 'seraph', play: 'oracle', chaos: 'daemon', order: 'titan' },
  };
  const TREE = [['bitling'], ['pupbyte', 'querykit', 'kernelbot', 'glitchlet'], ['heartware', 'cybersage', 'kernelknight', 'glitchwraith'], ['seraph', 'oracle', 'titan', 'daemon', 'prism']];
  const XP_NEED = [0, 0, 100, 450, 1200], AGE_NEED = [0, 0, 0, 4, 24];   // xp and hours since hatching to reach stage i
  const STAGE_SCALE = [0.82, 0.74, 0.88, 1.0, 1.08];
  const FOODS = [
    { id: 'crumbs', price: 0, fx: { data: 8 } },
    { id: 'pie', price: 6, fx: { data: 22, happy: 3 } },
    { id: 'cookie', price: 8, fx: { data: 10, happy: 12 }, care: { aff: 1 } },
    { id: 'burger', price: 12, fx: { data: 36, energy: 4, happy: 4 } },
    { id: 'gum', price: 6, fx: { data: 6, cur: 16, glitch: 12, happy: 3 }, care: { chaos: 3 } },
    { id: 'tea', price: 10, fx: { data: 4, glitch: -25, energy: 4 }, care: { order: 2 } },
    { id: 'volt', price: 14, fx: { energy: 32, data: 4, glitch: 4 } },
    { id: 'cake', price: 20, fx: { data: 18, happy: 24, cur: 6 }, care: { aff: 2 }, stage: 2 },
  ];
  const FAV_POOL = ['pie', 'cookie', 'burger', 'gum', 'tea', 'cake'];
  const ACCS = [
    { id: 'cap', slot: 'head', icon: '🧢', price: 40 }, { id: 'bow', slot: 'head', icon: '🎀', price: 40 }, { id: 'flower', slot: 'head', icon: '🌸', price: 50 },
    { id: 'phones', slot: 'head', icon: '🎧', price: 70 }, { id: 'propeller', slot: 'head', icon: '🌀', price: 90 }, { id: 'wizard', slot: 'head', icon: '🪄', price: 130 },
    { id: 'crown', slot: 'head', icon: '👑', stage: 4 }, { id: 'halo', slot: 'head', icon: '😇', secret: 'ghost' }, { id: 'heartant', slot: 'head', icon: '💘', secret: 'purr' },
    { id: 'nerd', slot: 'face', icon: '🤓', price: 45 }, { id: 'shades', slot: 'face', icon: '🕶️', price: 60 }, { id: 'visor', slot: 'face', icon: '🥽', price: 100 },
    { id: 'pixshades', slot: 'face', icon: '😎', secret: 'konami' }, { id: 'monocle', slot: 'face', icon: '🧐', secret: 'hello' },
  ];
  const ROOMS = [
    { id: 'den', icon: '🖥️', price: 0 }, { id: 'server', icon: '🗄️', stage: 2 }, { id: 'garden', icon: '🌿', price: 120 },
    { id: 'orbit', icon: '🪐', price: 260, stage4free: 1 }, { id: 'void', icon: '🕳️', secret: 'storm' },
  ];
  const THEMES = {
    neon: { a: '#3ef0ff', b: '#ff4fd8', bg1: '#0a0d22', bg2: '#1b1446', floor: '#110d30', price: 0 },
    sunset: { a: '#ffb703', b: '#ff5d8f', bg1: '#1d0a22', bg2: '#45163a', floor: '#250f2c', price: 80 },
    vapor: { a: '#01cdfe', b: '#ff71ce', bg1: '#140a2c', bg2: '#33135e', floor: '#1d0e3c', price: 120 },
    amber: { a: '#ffb000', b: '#ff7a00', bg1: '#0e0a04', bg2: '#251807', floor: '#170f05', stage: 3 },
    matrix: { a: '#39ff88', b: '#00e676', bg1: '#020b06', bg2: '#07261a', floor: '#03150b', secret: 'neo' },
    retro: { a: '#fcfc54', b: '#fc54fc', bg1: '#000018', bg2: '#0000a8', floor: '#000060', secret: 'konami' },
    midnight: { a: '#a8c4ff', b: '#e6ecff', bg1: '#03040e', bg2: '#0e1540', floor: '#080b24', secret: 'ghost' },
  };
  const THEME_ORDER = ['neon', 'sunset', 'vapor', 'amber', 'matrix', 'retro', 'midnight'];
  const SECRETS = ['konami', 'ghost', 'terminal', 'hello', 'neo', 'storm', 'purr', 'star'];
  const ACH = [
    ['boot', '🥚', 10, () => S.stage >= 1], ['teen', '🌱', 20, () => S.stage >= 2], ['adult', '🌳', 40, () => S.stage >= 3], ['final', '🌟', 100, () => S.stage >= 4],
    ['feed50', '🍪', 30, () => S.counts.feeds >= 50], ['squash50', '🪲', 30, () => S.counts.squash >= 50], ['games20', '🕹️', 30, () => S.counts.games >= 20],
    ['gold', '🥇', 40, () => Object.values(S.medals).some(m => m >= 3)], ['allgames', '🏆', 60, () => GAME_ORDER.length > 0 && GAME_ORDER.every(id => (S.medals[id] || 0) >= 1)],
    ['streak7', '📅', 50, () => S.streak >= 7], ['favfood', '😋', 15, () => S.favKnown], ['night', '🦉', 15, () => S.flags.night], ['early', '🐤', 15, () => S.flags.early],
    ['rich', '💰', 0, () => S.coins >= 500],
  ];
  const GAMES = {}; const GAME_ORDER = ['catch', 'whack', 'echo', 'hop', 'rhythm'];

  // ------------------------------------------------------------------ save
  const KEY = 'cyber-pet-save', KEY_SET = 'cyber-pet-settings';
  function fresh() {
    const now = Date.now();
    return {
      v: 1, created: now, born: 0, last: now, name: '', stage: 0, form: 'seed', hatch: 0, xp: 0, coins: 25,
      st: { data: 72, energy: 82, happy: 70, cur: 62, glitch: 8 }, sleeping: false, bugs: 0, storm: false,
      care: { aff: 0, play: 0, order: 0, chaos: 0 }, visits: Array(24).fill(0), visitCount: 0, lastVisit: 0, day: '', streak: 0,
      foods: {}, games: {}, fav: pick(FAV_POOL), favKnown: false, best: {}, medals: {},
      owned: { acc: [], rooms: ['den'], themes: ['neon'] }, eq: { head: null, face: null, room: 'den', theme: 'neon' },
      seen: ['seed'], secrets: {}, ach: {}, counts: { pets: 0, pokes: 0, feeds: 0, squash: 0, games: 0, sleeps: 0 },
      flags: {}, pixel: false, tut: 0, sweepAt: 0, rmAt: 0, sudoDay: '',
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(KEY); if (!raw) return null; const j = JSON.parse(raw); if (!j || j.v !== 1) return null;
      const f = fresh(), o = Object.assign(f, j);
      for (const k of ['st', 'care', 'counts', 'owned', 'eq', 'flags']) o[k] = Object.assign(fresh()[k], j[k] || {});
      if (!Array.isArray(o.visits) || o.visits.length !== 24) o.visits = Array(24).fill(0);
      if (!FORMS[o.form]) o.form = o.stage ? 'bitling' : 'seed';
      return o;
    } catch (e) { return null; }
  }
  let S = null, dirty = false, saveT = 0;
  function saveNow() { if (!S) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} dirty = false; saveT = 0; }
  const markDirty = () => { dirty = true; };
  const settings = (() => { try { return Object.assign({ sound: true }, JSON.parse(localStorage.getItem(KEY_SET) || '{}')); } catch (e) { return { sound: true }; } })();
  const saveSettings = () => { try { localStorage.setItem(KEY_SET, JSON.stringify(settings)); } catch (e) {} };
  Snd.on = settings.sound !== false;

  // ------------------------------------------------------------------ canvas & layout
  const cv = document.getElementById('c'), g = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, clock = 0, shake = 0, flash = 0;
  const LY = {};
  const isMobile = () => W < 760 || (H < 520 && matchMedia('(pointer: coarse)').matches);
  function layout() {
    const mob = isMobile(); LY.mobile = mob;
    let top = mob ? 104 : 62, dockH = mob ? 76 : 92, left = mob ? 0 : 232;
    const hub = $('#hub');
    if (hub && !hub.hidden) {
      const st = $('#stats').getBoundingClientRect(), dk = $('#dock').getBoundingClientRect(), tp = $('#top').getBoundingClientRect();
      if (dk.height) dockH = H - dk.top;
      if (st.height) { const side = st.width < W * 0.5; top = side ? tp.bottom + 4 : st.bottom + 4; left = side ? st.right + 4 : 0; }
    }
    LY.top = top; LY.bottom = H - dockH; LY.left = left;
    const roomH = Math.max(120, LY.bottom - LY.top);
    LY.ground = LY.bottom - clamp(roomH * 0.12, 26, 70);
    const portrait = H > W * 1.2; LY.portrait = portrait;
    LY.R = clamp(Math.min((W - left) * (portrait ? 0.2 : 0.15), roomH * 0.2), 26, 105);
    LY.horizon = LY.ground - clamp(roomH * 0.36, 50, Math.max(250, roomH * 0.34));
    LY.cx = left + (W - left) / 2;
    LY.minX = left + LY.R * 1.3; LY.maxX = W - LY.R * 1.3;
    // window
    let ww = clamp((W - left) * (portrait ? 0.52 : 0.3), 110, 330), wh = ww * 0.6;
    const avail = LY.horizon - Math.max(10, mob ? LY.top + 6 : 14) - 14;
    if (wh > avail) { wh = Math.max(40, avail); ww = Math.min(ww, wh / 0.6); }
    LY.win = { w: ww, h: wh, x: mob ? W * (portrait ? 0.4 : 0.36) - ww / 2 : left + (W - left) * 0.34 - ww / 2, y: LY.horizon - wh - Math.max(8, portrait ? (avail - wh) * 0.45 : Math.min(40, (avail - wh) * 0.5)) };
    LY.win.x = Math.max(left + 8, LY.win.x);
    // monitor on a little desk
    const mw = clamp((W - left) * 0.1, 46, 90), mh = mw * 0.78, dw = mw * 1.55;
    const dx = W - dw - Math.max(10, (W - left) * 0.05), dTop = LY.horizon + mw * 0.12;
    LY.desk = { x: dx, y: dTop, w: dw, h: mw * 0.55 };
    LY.mon = { x: dx + dw / 2 - mw / 2, y: dTop - mh, w: mw, h: mh };
    LY.pad = { x: left + (W - left) * 0.2, y: LY.ground };
    const co = $('#coach'); if (co) { if (mob) { co.style.top = (LY.top + 6) + 'px'; co.style.bottom = 'auto'; } else { co.style.top = ''; co.style.bottom = ''; } }
    if (typeof pet !== 'undefined' && pet.x) { pet.x = clamp(pet.x, LY.minX, LY.maxX); pet.tx = clamp(pet.tx, LY.minX, LY.maxX); }
  }
  function resize() {
    DPR = Math.min(2.5, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); layout(); vignette = null;
    if (pet.x === 0 || pet.x < LY.minX || pet.x > LY.maxX) pet.x = pet.tx = clamp(pet.x || LY.cx, LY.minX, LY.maxX);
    for (const b of bugs) { b.x = clamp(b.x, LY.left + 16, W - 16); b.y = clamp(b.y, LY.top + 24, LY.ground + 6); }
  }

  // ------------------------------------------------------------------ particles
  const parts = [];
  function addPart(p) { p.life = p.life || 1; p.max = p.life; p.vx = p.vx || 0; p.vy = p.vy || 0; p.rot = p.rot || 0; p.vr = p.vr || 0; parts.push(p); if (parts.length > 500) parts.shift(); return p; }
  function burst(x, y, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const a = rnd(0, TAU), sp = rnd(o.min || 60, o.max || 260); addPart({ type: o.type || 'px', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g == null ? 300 : o.g, life: rnd(0.4, o.life || 0.9), size: rnd(o.s0 || 3, o.s1 || 6), color: Array.isArray(o.color) ? pick(o.color) : (o.color || '#fff'), top: o.top, vr: rnd(-8, 8) }); } }
  function floatText(text, x, y, color, size, top) { addPart({ type: 'text', text, x, y, vy: -46, g: 0, life: 1.1, color: color || '#fff', size: size || 16, top }); }
  function updParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      if (p.type === 'z') p.x += Math.sin(p.life * 4) * 12 * dt;
    }
  }
  function drawParts(gg, top) {
    for (const p of parts) {
      if (!!p.top !== !!top) continue; const a = clamp(p.life / p.max, 0, 1); gg.globalAlpha = p.type === 'text' ? Math.min(1, a * 2) : a;
      if (p.type === 'px') { gg.fillStyle = p.color; gg.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
      else if (p.type === 'heart') { gg.fillStyle = p.color; heart(gg, p.x, p.y, p.size * (0.6 + 0.4 * a)); gg.fill(); }
      else if (p.type === 'text' || p.type === 'z' || p.type === 'bit') {
        gg.fillStyle = p.color; gg.font = `${p.type === 'text' ? 800 : 700} ${p.size}px ${p.type === 'text' ? 'Segoe UI, system-ui, sans-serif' : 'ui-monospace, Consolas, monospace'}`; gg.textAlign = 'center'; gg.textBaseline = 'middle';
        gg.strokeStyle = 'rgba(0,0,0,.55)'; gg.lineWidth = 3; if (p.type === 'text') gg.strokeText(p.text, p.x, p.y); gg.fillText(p.text, p.x, p.y);
      } else if (p.type === 'ring') { gg.strokeStyle = p.color; gg.lineWidth = 3 * a; gg.beginPath(); gg.arc(p.x, p.y, p.size + (1 - a) * (p.grow || 60), 0, TAU); gg.stroke(); }
      else if (p.type === 'star') { gg.fillStyle = p.color; gg.save(); gg.translate(p.x, p.y); gg.rotate(p.rot); const s = p.size; gg.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * 0.4 : s; gg.lineTo(Math.cos(k * Math.PI / 4) * r, Math.sin(k * Math.PI / 4) * r); } gg.closePath(); gg.fill(); gg.restore(); }
    }
    gg.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ pet drawing
  function formColors(F, tm) {
    const h = F.hue < 0 ? (tm * 40) % 360 : F.hue;
    return { h, base: hsl(h, F.sat, F.lit), light: hsl(h, F.sat, Math.min(92, F.lit + 18)), dark: hsl(h, F.sat - 8, F.lit - 24), rim: hsl(h, 100, 82, 0.9), glow: hsl(h, 100, 62), eye: hsl(F.eh != null ? F.eh : (h + 10) % 360, 100, 80), deep: hsl(h, F.sat - 10, Math.max(10, F.lit - 34)) };
  }
  function bodyPts(R, F, o) {
    const n = 32, pts = [], shape = F.shape || 'blob';
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a);
      let w = 1 + 0.03 * Math.sin(3 * a + o.t * 2.2) + 0.022 * Math.sin(5 * a - o.t * 2.9), x, y;
      if (shape === 'square') { const p = 0.5; x = Math.sign(c) * Math.pow(Math.abs(c), p) * R * 0.95; y = Math.sign(s) * Math.pow(Math.abs(s), p) * R * 0.86; w = 1 + (w - 1) * 0.5; }
      else if (shape === 'egg') { x = c * R * 0.8; y = s * R; if (s < 0) x *= 0.84 + 0.16 * (1 + s); w = 1 + (w - 1) * 0.3; }
      else { x = c * R; y = s * R * 0.92; }
      x *= w * o.sx; y *= w * o.sy;
      if (shape === 'ghost') { if (s > 0.15) { y = s * R * 0.95 * o.sy + Math.sin(a * 9 + o.t * 5) * R * 0.07 * s; x *= 1 - 0.1 * s; } }
      else if (y > R * 0.8) y = R * 0.8 + (y - R * 0.8) * 0.3;
      pts.push([x, y]);
    }
    return pts;
  }
  function tracePts(gg, pts) {
    const n = pts.length; gg.beginPath(); gg.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; gg.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    gg.closePath();
  }
  function glowFill(gg, color, blur) { gg.shadowColor = color; gg.shadowBlur = blur; }
  function noGlow(gg) { gg.shadowBlur = 0; gg.shadowColor = 'transparent'; }

  function drawWings(gg, R, F, C, o) {
    const flap = Math.sin(o.t * 3.2) * 0.14;
    for (const sd of [-1, 1]) {
      gg.save(); gg.translate(sd * R * 0.55, -R * 0.25); gg.rotate(sd * (-0.35 - flap)); gg.scale(sd, 1);
      if (F.wings === 'angel') {
        for (let k = 2; k >= 0; k--) { const len = R * (1.25 - k * 0.22); gg.fillStyle = k === 0 ? 'rgba(255,255,255,.95)' : hsl(C.h, 70, 88 - k * 8, 0.9); glowFill(gg, C.glow, R * 0.25); ell(gg, len * 0.55, -k * R * 0.18, len * 0.6, R * 0.2, -0.25 + k * 0.18); gg.fill(); }
      } else if (F.wings === 'bat') {
        gg.fillStyle = hsl(C.h, 50, 22, 0.95); glowFill(gg, C.glow, R * 0.3); gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(R * 0.5, -R * 0.75); gg.lineTo(R * 1.35, -R * 0.55);
        gg.quadraticCurveTo(R * 1.05, -R * 0.2, R * 1.2, R * 0.15); gg.quadraticCurveTo(R * 0.85, -R * 0.05, R * 0.75, R * 0.3); gg.quadraticCurveTo(R * 0.45, R * 0.05, 0, R * 0.25); gg.closePath(); gg.fill();
        noGlow(gg); gg.strokeStyle = C.rim; gg.lineWidth = R * 0.03; gg.stroke();
      } else {
        gg.strokeStyle = C.glow; gg.lineWidth = R * 0.035; glowFill(gg, C.glow, R * 0.3);
        for (let k = 0; k < 3; k++) { gg.fillStyle = hsl(C.h, 100, 70, 0.18 + k * 0.06); gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(R * (1.4 - k * 0.25), -R * (0.75 - k * 0.32)); gg.lineTo(R * (0.9 - k * 0.2), R * (0.05 + k * 0.12)); gg.closePath(); gg.fill(); gg.stroke(); }
        gg.fillStyle = '#fff'; for (let k = 0; k < 3; k++) gg.fillRect(R * (1.3 - k * 0.25) - R * 0.04, -R * (0.72 - k * 0.32) - R * 0.04, R * 0.08, R * 0.08);
      }
      gg.restore();
    }
    noGlow(gg);
  }
  function drawEars(gg, R, F, C, o, back) {
    const sway = Math.sin(o.t * 2) * 0.06;
    for (const sd of [-1, 1]) {
      if (F.ears === 'floppy' && !back) {
        gg.save(); gg.translate(sd * R * 0.6, -R * 0.62); gg.rotate(sd * (0.25 + sway + o.earDrop * 0.3)); gg.fillStyle = C.dark;
        gg.beginPath(); gg.moveTo(-R * 0.16, 0); gg.quadraticCurveTo(sd * R * 0.5, R * 0.1, sd * R * 0.36, R * 0.72); gg.quadraticCurveTo(sd * R * 0.1, R * 0.8, -sd * R * 0.04, R * 0.5); gg.quadraticCurveTo(-R * 0.2, R * 0.2, -R * 0.16, 0); gg.fill();
        gg.fillStyle = hsl(C.h, 80, 80, 0.5); ell(gg, sd * R * 0.2, R * 0.42, R * 0.09, R * 0.2, sd * -0.3); gg.fill(); gg.restore();
      } else if ((F.ears === 'cat' || F.ears === 'big') && back) {
        const big = F.ears === 'big', bx = sd * R * (big ? 0.5 : 0.5), tipX = sd * R * (big ? 1.12 : 0.72), tipY = -R * (big ? 1.3 : 1.38) + o.earDrop * R * 0.25;
        gg.fillStyle = C.base; glowFill(gg, C.glow, R * 0.15); gg.beginPath(); gg.moveTo(bx - sd * R * 0.32, -R * 0.55); gg.lineTo(tipX, tipY); gg.lineTo(bx + sd * R * 0.28, -R * 0.5); gg.closePath(); gg.fill(); noGlow(gg);
        gg.fillStyle = hsl(C.h + 300, 80, 78, 0.8); gg.beginPath(); gg.moveTo(bx - sd * R * 0.16, -R * 0.62); gg.lineTo(lerp(bx, tipX, 0.8), lerp(-R * 0.6, tipY, 0.8)); gg.lineTo(bx + sd * R * 0.14, -R * 0.6); gg.closePath(); gg.fill();
      }
    }
  }
  function drawHorns(gg, R, F, C) {
    const big = F.horns === 2; gg.fillStyle = hsl(C.h, 45, 26); glowFill(gg, C.glow, R * 0.25); gg.strokeStyle = C.rim; gg.lineWidth = Math.max(1, R * 0.03);
    for (const sd of [-1, 1]) { gg.beginPath(); gg.moveTo(sd * R * 0.25, -R * 0.75); gg.quadraticCurveTo(sd * R * (big ? 0.55 : 0.4), -R * (big ? 1.25 : 1.05), sd * R * (big ? 0.85 : 0.6), -R * (big ? 1.45 : 1.25)); gg.quadraticCurveTo(sd * R * 0.6, -R * 0.9, sd * R * 0.62, -R * 0.62); gg.closePath(); gg.fill(); gg.stroke(); }
    noGlow(gg);
  }
  function drawAntenna(gg, R, x, C, o, heartBulb) {
    const sw = Math.sin(o.t * 3 + x) * R * 0.08, tx = x * 1.3 + sw, ty = -R * 1.45;
    gg.strokeStyle = C.dark; gg.lineWidth = Math.max(1.5, R * 0.05); gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(x, -R * 0.75); gg.quadraticCurveTo(x * 1.1, -R * 1.15, tx, ty); gg.stroke();
    const pulse = 0.75 + 0.25 * Math.sin(o.t * 4);
    if (heartBulb) { gg.fillStyle = '#ff5d9e'; glowFill(gg, '#ff5d9e', R * 0.4 * pulse); heart(gg, tx, ty + R * 0.05, R * 0.14); gg.fill(); }
    else { gg.fillStyle = o.sleeping ? hsl(C.h, 60, 45) : hsl(C.h, 100, 75); glowFill(gg, C.glow, R * 0.4 * pulse); gg.beginPath(); gg.arc(tx, ty, R * 0.1, 0, TAU); gg.fill(); }
    noGlow(gg);
  }
  function drawOrbit(gg, R, F, C, o, front) {
    const k = F.orbit; for (let i = 0; i < k; i++) {
      const a = o.t * 1.3 + i * TAU / k, s = Math.sin(a); if ((s > 0) !== front) continue;
      const x = Math.cos(a) * R * 1.45, y = s * R * 0.32 - R * 0.15, sz = R * (0.07 + 0.03 * (s + 1));
      gg.fillStyle = i % 2 ? C.glow : '#fff'; glowFill(gg, C.glow, R * 0.3); gg.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
    noGlow(gg);
  }
  function drawEgg(gg, R, C, o) {
    const pts = bodyPts(R, FORMS.seed, o);
    glowFill(gg, C.glow, R * 0.5); gg.fillStyle = C.base; tracePts(gg, pts); gg.fill(); noGlow(gg);
    const gr = gg.createRadialGradient(-R * 0.3, -R * 0.45, R * 0.1, 0, 0, R * 1.1); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, C.light); gr.addColorStop(1, C.dark);
    gg.fillStyle = gr; tracePts(gg, pts); gg.fill();
    gg.save(); tracePts(gg, pts); gg.clip();
    gg.strokeStyle = hsl(C.h, 100, 90, 0.35); gg.lineWidth = R * 0.035;
    for (let i = 0; i < 5; i++) { const y = -R * 0.7 + i * R * 0.35; gg.beginPath(); gg.moveTo(-R, y); gg.lineTo(-R * 0.2 + hr(i) * R * 0.3, y); gg.lineTo(-R * 0.05 + hr(i) * R * 0.3, y + R * 0.15); gg.lineTo(R, y + R * 0.15); gg.stroke(); gg.fillStyle = hsl(C.h, 100, 92, 0.5); gg.fillRect(-R * 0.2 + hr(i) * R * 0.3 - R * 0.04, y - R * 0.04, R * 0.08, R * 0.08); }
    const prog = o.hatch || 0;
    if (prog > 0.2) {   // cracks with light leaking out
      gg.strokeStyle = '#fff'; gg.lineWidth = R * 0.05; glowFill(gg, '#fff', R * 0.4); gg.beginPath();
      const n = Math.floor(prog * 10); let x = -R * 0.8, y = -R * 0.05;
      gg.moveTo(x, y); for (let i = 0; i < n; i++) { x += R * 0.18; y = -R * 0.05 + (i % 2 ? -1 : 1) * R * 0.14; gg.lineTo(x, y); } gg.stroke(); noGlow(gg);
    }
    if (prog > 0.4) {   // eyes peeking from inside
      const op = o.blink > 0.5 ? 0.1 : 1; gg.fillStyle = '#0a0f24'; rr(gg, -R * 0.45, -R * 0.5, R * 0.9, R * 0.32, R * 0.16); gg.fill();
      gg.fillStyle = C.eye; glowFill(gg, C.eye, R * 0.3); for (const sd of [-1, 1]) { rr(gg, sd * R * 0.2 - R * 0.07 + o.lookX * R * 0.06, -R * 0.42, R * 0.14, R * 0.17 * op, R * 0.05); gg.fill(); } noGlow(gg);
    }
    gg.restore();
    gg.strokeStyle = C.rim; gg.lineWidth = Math.max(1.5, R * 0.04); tracePts(gg, pts); gg.stroke();
    gg.fillStyle = 'rgba(255,255,255,.35)'; ell(gg, -R * 0.32, -R * 0.55, R * 0.16, R * 0.1, -0.6); gg.fill();
  }
  function drawEye(gg, R, x, y, ew, eh, type, o, C, sd) {
    const open = clamp(o.open * (1 - o.blink), 0, 1);
    gg.lineCap = 'round'; gg.lineJoin = 'round';
    const lineEye = (curve) => { gg.strokeStyle = C.eye; gg.lineWidth = R * 0.07; glowFill(gg, C.eye, R * 0.25); gg.beginPath(); gg.moveTo(x - ew * 0.85, y); gg.quadraticCurveTo(x, y + curve, x + ew * 0.85, y); gg.stroke(); noGlow(gg); };
    if (type === 'happy') { gg.strokeStyle = C.eye; gg.lineWidth = R * 0.075; glowFill(gg, C.eye, R * 0.3); gg.beginPath(); gg.moveTo(x - ew * 0.85, y + eh * 0.25); gg.quadraticCurveTo(x, y - eh * 0.95, x + ew * 0.85, y + eh * 0.25); gg.stroke(); noGlow(gg); return; }
    if (type === 'closed') { lineEye(eh * 0.5); return; }
    if (type === 'heart') { gg.fillStyle = '#ff5d9e'; glowFill(gg, '#ff5d9e', R * 0.35); heart(gg, x, y + eh * 0.15, ew * 1.05 * (1 + 0.08 * Math.sin(o.t * 10))); gg.fill(); noGlow(gg); return; }
    if (type === 'x') { gg.strokeStyle = C.eye; gg.lineWidth = R * 0.07; glowFill(gg, C.eye, R * 0.25); gg.beginPath(); gg.moveTo(x - ew * 0.6, y - eh * 0.5); gg.lineTo(x + ew * 0.6, y + eh * 0.5); gg.moveTo(x + ew * 0.6, y - eh * 0.5); gg.lineTo(x - ew * 0.6, y + eh * 0.5); gg.stroke(); noGlow(gg); return; }
    if (type === 'dizzy') { gg.strokeStyle = C.eye; gg.lineWidth = R * 0.05; gg.beginPath(); for (let k = 0; k < 24; k++) { const a = k * 0.55 + o.t * 6, r = ew * 0.9 * k / 24; gg.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } gg.stroke(); return; }
    if (open < 0.12) { lineEye(eh * 0.15); return; }
    // the eye "screen"
    const h2 = eh * open; gg.fillStyle = '#0a0f24'; rr(gg, x - ew, y - h2, ew * 2, h2 * 2, ew * 0.75); gg.fill();
    gg.save(); rr(gg, x - ew, y - h2, ew * 2, h2 * 2, ew * 0.75); gg.clip();
    const wide = type === 'wide', pw = ew * (wide ? 0.78 : 0.62), ph = eh * (wide ? 0.85 : 0.7) * open;
    const px = x + o.lookX * ew * 0.38, py = y + o.lookY * eh * 0.32 * open;
    if (type === 'pixel') { gg.fillStyle = C.eye; for (let k = 0; k < 6; k++) { const q = ew * 0.35; gg.fillRect(px - ew * 0.5 + hr(k + Math.floor(o.t * 10)) * ew, py - eh * 0.4 + hr(k * 3.1 + Math.floor(o.t * 10)) * eh * 0.8, q, q); } }
    else { gg.fillStyle = C.eye; glowFill(gg, C.eye, R * 0.3); rr(gg, px - pw / 2, py - ph / 2, pw, ph, pw * 0.42); gg.fill(); noGlow(gg);
      gg.fillStyle = 'rgba(255,255,255,.95)'; gg.fillRect(px - pw * 0.32, py - ph * 0.36, pw * 0.3, pw * 0.3); gg.fillRect(px + pw * 0.08, py + ph * 0.1, pw * 0.14, pw * 0.14); }
    gg.restore();
    if (type === 'angry' || type === 'sad') {   // brows cut the screen at an angle
      gg.fillStyle = o.browColor; gg.beginPath(); const inner = type === 'angry' ? 1 : -1;
      gg.moveTo(x - ew * 1.2, y - h2 - eh * 0.3); gg.lineTo(x + ew * 1.2, y - h2 - eh * 0.3);
      if (sd * inner < 0) { gg.lineTo(x + ew * 1.2, y - h2 * 0.1); gg.lineTo(x - ew * 1.2, y - h2 - eh * 0.1); } else { gg.lineTo(x + ew * 1.2, y - h2 - eh * 0.1); gg.lineTo(x - ew * 1.2, y - h2 * 0.1); }
      gg.closePath(); gg.fill();
    }
  }
  function drawMouth(gg, R, x, y, type, o) {
    const ink = '#0a0f24'; gg.strokeStyle = ink; gg.fillStyle = ink; gg.lineWidth = Math.max(1.5, R * 0.055); gg.lineCap = 'round'; gg.lineJoin = 'round';
    const w = R * 0.14;
    if (type === 'chomp') type = Math.sin(o.t * 22) > 0 ? 'open' : 'flat';
    if (type === 'talk') type = Math.sin(o.t * 16) > 0.2 ? 'smallo' : 'smile';
    switch (type) {
      case 'smile': gg.beginPath(); gg.moveTo(x - w, y - R * 0.02); gg.quadraticCurveTo(x, y + R * 0.12, x + w, y - R * 0.02); gg.stroke(); break;
      case 'grin': case 'open': gg.beginPath(); gg.moveTo(x - w * 1.1, y - R * 0.03); gg.quadraticCurveTo(x, y + R * (type === 'grin' ? 0.24 : 0.2), x + w * 1.1, y - R * 0.03); gg.closePath(); gg.fill();
        gg.save(); gg.clip(); gg.fillStyle = '#ff6f91'; ell(gg, x, y + R * 0.14, w * 0.7, R * 0.08); gg.fill(); gg.restore(); break;
      case 'o': ell(gg, x, y + R * 0.04, R * 0.075, R * 0.09); gg.fill(); break;
      case 'smallo': ell(gg, x, y + R * 0.03, R * 0.04, R * 0.045); gg.fill(); break;
      case 'flat': gg.beginPath(); gg.moveTo(x - w * 0.8, y + R * 0.03); gg.lineTo(x + w * 0.8, y + R * 0.03); gg.stroke(); break;
      case 'frown': gg.beginPath(); gg.moveTo(x - w, y + R * 0.08); gg.quadraticCurveTo(x, y - R * 0.04, x + w, y + R * 0.08); gg.stroke(); break;
      case 'wavy': gg.beginPath(); for (let k = 0; k <= 6; k++) gg.lineTo(x - w + k * w / 3, y + (k % 2 ? -1 : 1) * R * 0.035 + R * 0.03); gg.stroke(); break;
      case 'cat': gg.beginPath(); gg.moveTo(x - w, y); gg.quadraticCurveTo(x - w / 2, y + R * 0.09, x, y); gg.quadraticCurveTo(x + w / 2, y + R * 0.09, x + w, y); gg.stroke(); break;
    }
  }
  function drawAccessory(gg, R, id, C, o) {
    const top = -R * 0.84;
    switch (id) {
      case 'cap': gg.fillStyle = '#ff4d6d'; ell(gg, 0, top + R * 0.08, R * 0.62, R * 0.4); gg.save(); gg.beginPath(); gg.rect(-R, top - R * 0.5, R * 2, R * 0.58); gg.clip(); ell(gg, 0, top + R * 0.08, R * 0.62, R * 0.4); gg.fill(); gg.restore();
        gg.fillStyle = '#d6284a'; ell(gg, R * 0.5, top + R * 0.08, R * 0.42, R * 0.08, -0.05); gg.fill(); gg.fillStyle = '#fff'; gg.fillRect(-R * 0.1, top - R * 0.3, R * 0.2, R * 0.12); gg.fillStyle = '#ff99ac'; ell(gg, 0, top - R * 0.32, R * 0.06, R * 0.04); gg.fill(); break;
      case 'bow': gg.save(); gg.translate(R * 0.45, top + R * 0.02); gg.rotate(0.3); gg.fillStyle = '#ff5db1'; glowFill(gg, '#ff5db1', R * 0.2);
        gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(-R * 0.34, -R * 0.2); gg.lineTo(-R * 0.34, R * 0.2); gg.closePath(); gg.fill(); gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(R * 0.34, -R * 0.2); gg.lineTo(R * 0.34, R * 0.2); gg.closePath(); gg.fill();
        noGlow(gg); gg.fillStyle = '#ffd1ec'; gg.fillRect(-R * 0.08, -R * 0.08, R * 0.16, R * 0.16); gg.restore(); break;
      case 'flower': gg.save(); gg.translate(-R * 0.48, top + R * 0.02); gg.rotate(o.t * 0.5); for (let k = 0; k < 5; k++) { gg.fillStyle = '#ffb3d9'; ell(gg, Math.cos(k * TAU / 5) * R * 0.14, Math.sin(k * TAU / 5) * R * 0.14, R * 0.11, R * 0.11); gg.fill(); }
        gg.fillStyle = '#ffd23e'; ell(gg, 0, 0, R * 0.09, R * 0.09); gg.fill(); gg.restore(); break;
      case 'phones': gg.strokeStyle = '#1b1f3a'; gg.lineWidth = R * 0.11; gg.beginPath(); gg.ellipse(0, -R * 0.15, R * 0.98, R * 0.95, 0, Math.PI * 1.08, Math.PI * 1.92); gg.stroke();
        gg.strokeStyle = C.glow; gg.lineWidth = R * 0.03; gg.stroke();
        for (const sd of [-1, 1]) { gg.fillStyle = '#1b1f3a'; rr(gg, sd * R * 0.98 - R * 0.14, -R * 0.38, R * 0.28, R * 0.5, R * 0.12); gg.fill(); gg.fillStyle = C.glow; glowFill(gg, C.glow, R * 0.3); rr(gg, sd * R * 0.98 - R * 0.06, -R * 0.26, R * 0.12, R * 0.26, R * 0.05); gg.fill(); noGlow(gg); } break;
      case 'propeller': gg.fillStyle = '#3e8bff'; gg.save(); gg.beginPath(); gg.rect(-R, top - R * 0.5, R * 2, R * 0.55); gg.clip(); ell(gg, 0, top + R * 0.05, R * 0.5, R * 0.34); gg.fill(); gg.restore();
        gg.fillStyle = '#ffd23e'; gg.fillRect(-R * 0.5, top - R * 0.02, R, R * 0.07); gg.fillStyle = '#999'; gg.fillRect(-R * 0.025, top - R * 0.5, R * 0.05, R * 0.22);
        { const sp = Math.cos(o.t * 24); gg.fillStyle = '#ff4d6d'; ell(gg, -R * 0.24 * sp, top - R * 0.52, R * 0.24 * Math.abs(sp) + 1, R * 0.05); gg.fill(); gg.fillStyle = '#3dffa8'; ell(gg, R * 0.24 * sp, top - R * 0.52, R * 0.24 * Math.abs(sp) + 1, R * 0.05); gg.fill(); } break;
      case 'wizard': gg.fillStyle = '#5b3fd9'; gg.beginPath(); gg.moveTo(-R * 0.55, top + R * 0.08); gg.quadraticCurveTo(-R * 0.1, top - R * 0.6, R * 0.2 + Math.sin(o.t * 2) * R * 0.05, top - R * 1.05); gg.quadraticCurveTo(R * 0.15, top - R * 0.5, R * 0.55, top + R * 0.08); gg.closePath(); gg.fill();
        gg.fillStyle = '#4630b0'; ell(gg, 0, top + R * 0.08, R * 0.72, R * 0.12); gg.fill(); gg.fillStyle = '#ffd23e'; glowFill(gg, '#ffd23e', R * 0.3);
        for (const [sx, sy, ss] of [[-0.12, -0.3, 0.09], [0.12, -0.62, 0.06], [-0.25, -0.05, 0.05]]) { gg.beginPath(); for (let k = 0; k < 10; k++) { const r = (k % 2 ? 0.45 : 1) * R * ss; gg.lineTo(sx * R + Math.cos(k * Math.PI / 5 - Math.PI / 2) * r, top + sy * R + Math.sin(k * Math.PI / 5 - Math.PI / 2) * r); } gg.closePath(); gg.fill(); } noGlow(gg); break;
      case 'crown': drawCrown(gg, R, top); break;
      case 'halo': drawHalo(gg, R, '#ffe17a', o); break;
      case 'heartant': drawAntenna(gg, R, 0, C, o, true); break;
      case 'shades': for (const sd of [-1, 1]) { const gr = gg.createLinearGradient(0, -R * 0.35, 0, R * 0.1); gr.addColorStop(0, '#2a2f55'); gr.addColorStop(1, '#05060d'); gg.fillStyle = gr; rr(gg, sd * R * 0.36 - R * 0.27, -R * 0.33, R * 0.54, R * 0.4, R * 0.14); gg.fill();
          gg.strokeStyle = 'rgba(255,255,255,.5)'; gg.lineWidth = R * 0.03; gg.beginPath(); gg.moveTo(sd * R * 0.36 - R * 0.15, -R * 0.24); gg.lineTo(sd * R * 0.36 - R * 0.02, -R * 0.12); gg.stroke(); }
        gg.fillStyle = '#05060d'; gg.fillRect(-R * 0.12, -R * 0.25, R * 0.24, R * 0.06); break;
      case 'nerd': gg.strokeStyle = '#151827'; gg.lineWidth = R * 0.07; for (const sd of [-1, 1]) { gg.beginPath(); gg.arc(sd * R * 0.36, -R * 0.1, R * 0.27, 0, TAU); gg.stroke(); }
        gg.beginPath(); gg.moveTo(-R * 0.1, -R * 0.14); gg.lineTo(R * 0.1, -R * 0.14); gg.stroke(); gg.strokeStyle = 'rgba(255,255,255,.35)'; gg.lineWidth = R * 0.025; for (const sd of [-1, 1]) { gg.beginPath(); gg.arc(sd * R * 0.36, -R * 0.1, R * 0.2, 3.6, 4.4); gg.stroke(); } break;
      case 'visor': gg.fillStyle = hsl((C.h + 160) % 360, 100, 65, 0.35); glowFill(gg, hsl((C.h + 160) % 360, 100, 60), R * 0.3); rr(gg, -R * 0.8, -R * 0.36, R * 1.6, R * 0.42, R * 0.2); gg.fill(); noGlow(gg);
        gg.strokeStyle = hsl((C.h + 160) % 360, 100, 80); gg.lineWidth = R * 0.03; gg.stroke(); gg.fillStyle = 'rgba(255,255,255,.4)'; gg.fillRect(-R * 0.6, -R * 0.3, R * 0.5, R * 0.04); break;
      case 'pixshades': { const p = R * 0.09, rows = ['XXXXXXXXXXXXXXXX', '.XXXXXX..XXXXXX.', '.XXWWXX..XXWWXX.', '..XXXX....XXXX..']; for (let r = 0; r < rows.length; r++) for (let c = 0; c < 16; c++) { const ch = rows[r][c]; if (ch === '.') continue; gg.fillStyle = ch === 'W' ? '#fff' : '#05060d'; gg.fillRect(-8 * p + c * p, -R * 0.32 + r * p, p + 0.5, p + 0.5); } break; }
      case 'monocle': gg.strokeStyle = '#ffd23e'; gg.lineWidth = R * 0.05; gg.beginPath(); gg.arc(R * 0.36, -R * 0.1, R * 0.28, 0, TAU); gg.stroke(); gg.fillStyle = 'rgba(200,240,255,.15)'; gg.fill();
        gg.lineWidth = R * 0.02; gg.beginPath(); gg.moveTo(R * 0.6, 0); gg.quadraticCurveTo(R * 0.75, R * 0.35, R * 0.5, R * 0.55); gg.stroke(); break;
    }
  }
  function drawCrown(gg, R, top) {
    const w = R * 0.5, y0 = top + R * 0.1; gg.fillStyle = '#ffcf33'; glowFill(gg, '#ffb703', R * 0.35); gg.beginPath(); gg.moveTo(-w, y0); gg.lineTo(-w, y0 - R * 0.3); gg.lineTo(-w * 0.5, y0 - R * 0.14);
    gg.lineTo(0, y0 - R * 0.42); gg.lineTo(w * 0.5, y0 - R * 0.14); gg.lineTo(w, y0 - R * 0.3); gg.lineTo(w, y0); gg.closePath(); gg.fill(); noGlow(gg);
    gg.fillStyle = '#ff4d6d'; ell(gg, 0, y0 - R * 0.1, R * 0.06, R * 0.06); gg.fill(); gg.fillStyle = '#3ef0ff'; ell(gg, -w * 0.55, y0 - R * 0.06, R * 0.045, R * 0.045); gg.fill(); ell(gg, w * 0.55, y0 - R * 0.06, R * 0.045, R * 0.045); gg.fill();
  }
  function drawHalo(gg, R, color, o) { gg.strokeStyle = color; gg.lineWidth = R * 0.07; glowFill(gg, color, R * 0.5); gg.beginPath(); gg.ellipse(0, -R * 1.3 + Math.sin(o.t * 2) * R * 0.04, R * 0.45, R * 0.12, 0, 0, TAU); gg.stroke(); noGlow(gg); }

  // draw the whole pet in local coordinates (origin = body centre)
  function drawPetLocal(gg, R, o) {
    const F = FORMS[o.form] || FORMS.bitling, C = formColors(F, o.t); o.browColor = C.base;
    if (o.form === 'seed') { drawEgg(gg, R, C, o); return; }
    const hover = F.shape === 'ghost' ? Math.sin(o.t * 2) * R * 0.06 : 0; gg.translate(0, hover);
    if (F.wings) drawWings(gg, R, F, C, o);
    if (F.tail === 'plug') { const w = Math.sin(o.t * 3) * R * 0.15; gg.strokeStyle = '#1b1f3a'; gg.lineWidth = R * 0.07; gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(R * 0.6, R * 0.55); gg.bezierCurveTo(R * 1.1, R * 0.8, R * 1.2, R * 0.2 + w, R * 1.42, R * 0.3 + w); gg.stroke();
      gg.save(); gg.translate(R * 1.45, R * 0.3 + w); gg.rotate(-0.2); gg.fillStyle = '#c9d2ea'; gg.fillRect(-R * 0.04, -R * 0.09, R * 0.2, R * 0.18); gg.fillStyle = '#555c80'; gg.fillRect(R * 0.08, -R * 0.05, R * 0.06, R * 0.03); gg.fillRect(R * 0.08, R * 0.02, R * 0.06, R * 0.03); gg.restore(); }
    if (F.orbit) drawOrbit(gg, R, F, C, o, false);
    if (F.horns) drawHorns(gg, R, F, C);
    if (F.ears) drawEars(gg, R, F, C, o, true);
    if (F.ant === 1) drawAntenna(gg, R, 0, C, o); else if (F.ant === 2) { drawAntenna(gg, R, -R * 0.32, C, o); drawAntenna(gg, R, R * 0.32, C, o); }
    if (F.crest) { gg.fillStyle = hsl(C.h, 80, 60); glowFill(gg, C.glow, R * 0.3); gg.beginPath(); gg.moveTo(-R * 0.1, -R * 0.78); gg.quadraticCurveTo(0, -R * 1.5, R * 0.35, -R * 1.25); gg.quadraticCurveTo(R * 0.1, -R * 1.1, R * 0.12, -R * 0.78); gg.closePath(); gg.fill(); noGlow(gg); }
    // body
    const pts = bodyPts(R, F, o);
    glowFill(gg, C.glow, R * 0.4); gg.fillStyle = C.base; tracePts(gg, pts); gg.fill(); noGlow(gg);
    const gr = gg.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.08, 0, 0, R * 1.2); gr.addColorStop(0, C.light); gr.addColorStop(0.55, C.base); gr.addColorStop(1, C.dark);
    gg.fillStyle = gr; tracePts(gg, pts); gg.fill();
    gg.save(); tracePts(gg, pts); gg.clip();
    gg.fillStyle = hsl(C.h, F.sat, Math.min(95, F.lit + 24), 0.32); ell(gg, 0, R * 0.5, R * 0.62, R * 0.42); gg.fill();
    if (F.st >= 2) {   // circuit traces
      gg.strokeStyle = hsl(C.h, 100, 88, 0.22); gg.lineWidth = R * 0.03; const seed = o.form.length * 7.3;
      for (let i = 0; i < 4; i++) { const sx = (hr(seed + i) - 0.5) * R * 1.4, sy = R * 0.15 + hr(seed + i * 2) * R * 0.5; gg.beginPath(); gg.moveTo(sx, R); gg.lineTo(sx, sy); gg.lineTo(sx + (hr(seed + i * 3) - 0.5) * R * 0.5, sy - R * 0.2); gg.stroke(); gg.fillStyle = hsl(C.h, 100, 90, 0.35); gg.beginPath(); gg.arc(sx + (hr(seed + i * 3) - 0.5) * R * 0.5, sy - R * 0.2, R * 0.04, 0, TAU); gg.fill(); }
    }
    const band = ((o.t * 0.35) % 1) * R * 2.6 - R * 1.3; gg.fillStyle = 'rgba(255,255,255,.07)'; gg.fillRect(-R * 1.2, band, R * 2.4, R * 0.14);
    gg.restore();
    gg.strokeStyle = C.rim; gg.lineWidth = Math.max(1.5, R * 0.04); tracePts(gg, pts); gg.stroke();
    gg.fillStyle = 'rgba(255,255,255,.3)'; ell(gg, -R * 0.42, -R * 0.52, R * 0.2, R * 0.11, -0.5); gg.fill();
    if (F.armor) for (const sd of [-1, 1]) { const ag = gg.createLinearGradient(0, -R * 0.2, 0, R * 0.3); ag.addColorStop(0, '#dfe6ff'); ag.addColorStop(1, '#6b7398'); gg.fillStyle = ag; gg.beginPath(); gg.ellipse(sd * R * 0.9, R * 0.05, R * 0.26, R * 0.3, sd * 0.3, Math.PI, TAU); gg.closePath(); gg.fill(); gg.strokeStyle = C.glow; gg.lineWidth = R * 0.025; gg.stroke(); }
    if (F.core) { const p = 0.7 + 0.3 * Math.sin(o.t * 3); gg.fillStyle = F.core === 'heart' ? '#ff5d9e' : hsl(C.h, 100, 75); glowFill(gg, gg.fillStyle, R * 0.5 * p);
      if (F.core === 'heart') { heart(gg, 0, R * 0.5, R * 0.13); gg.fill(); } else { gg.beginPath(); for (let k = 0; k < 6; k++) gg.lineTo(Math.cos(k * TAU / 6) * R * 0.12, R * 0.5 + Math.sin(k * TAU / 6) * R * 0.12); gg.closePath(); gg.fill(); } noGlow(gg); }
    if (F.ears) drawEars(gg, R, F, C, o, false);
    // face
    const es = (F.eyes || 1), ew = R * 0.19 * es, eh = R * 0.25 * es, ey = -R * 0.12 + (F.shape === 'square' ? -R * 0.04 : 0);
    if (F.eye3) { gg.fillStyle = '#0a0f24'; ell(gg, 0, -R * 0.55, R * 0.1, R * 0.13); gg.fill(); gg.fillStyle = '#ffd23e'; glowFill(gg, '#ffd23e', R * 0.3); ell(gg, o.lookX * R * 0.03, -R * 0.55, R * 0.05, R * 0.07 * (1 - o.blink)); gg.fill(); noGlow(gg); }
    for (const sd of [-1, 1]) drawEye(gg, R, sd * R * 0.36 + o.lookX * R * 0.06, ey + o.lookY * R * 0.04, ew, eh, o.eye, o, C, sd);
    if (F.visor) { gg.fillStyle = hsl(C.h, 100, 70, 0.2); rr(gg, -R * 0.78, ey - R * 0.3, R * 1.56, R * 0.52, R * 0.18); gg.fill(); gg.strokeStyle = C.glow; gg.lineWidth = R * 0.03; glowFill(gg, C.glow, R * 0.2); gg.stroke(); noGlow(gg); }
    if (o.blush || F.blush) { gg.fillStyle = 'rgba(255,110,170,.4)'; for (const sd of [-1, 1]) { ell(gg, sd * R * 0.6, R * 0.12, R * 0.13, R * 0.075); gg.fill(); } }
    drawMouth(gg, R, o.lookX * R * 0.05, R * 0.24, o.mouth || F.mouth || 'smile', o);
    if (F.halo === 'ring') drawHalo(gg, R, F.hue < 0 ? '#fff' : '#ffe17a', o);
    else if (F.halo === 'heart') { gg.fillStyle = '#ff5d9e'; glowFill(gg, '#ff5d9e', R * 0.5); heart(gg, 0, -R * 1.3 + Math.sin(o.t * 2.5) * R * 0.06, R * 0.17); gg.fill(); noGlow(gg); }
    if (F.crown) drawCrown(gg, R, -R * 0.84);
    if (F.orbit) drawOrbit(gg, R, F, C, o, true);
    if (o.acc) { if (o.acc.face) drawAccessory(gg, R, o.acc.face, C, o); if (o.acc.head) drawAccessory(gg, R, o.acc.head, C, o); }
  }

  // composite through an off-screen buffer so glitch slices, RGB split and the pixel mode work on the whole pet
  const pb = document.createElement('canvas'), pg = pb.getContext('2d'), tb = document.createElement('canvas'), tg = tb.getContext('2d');
  function compositePet(gg, x, y, R, o, res) {
    const bw = R * 4.6, bh = R * 4.4, ox = bw / 2, oy = R * 2.7;
    const sc = o.pixel ? clamp(15 / R, 0.08, 0.6) : (res || DPR);
    const pw = Math.ceil(bw * sc), ph = Math.ceil(bh * sc);
    if (pb.width !== pw || pb.height !== ph) { pb.width = pw; pb.height = ph; } else { pg.setTransform(1, 0, 0, 1, 0, 0); pg.clearRect(0, 0, pw, ph); }
    pg.setTransform(sc, 0, 0, sc, ox * sc, oy * sc); pg.globalAlpha = 1; pg.imageSmoothingEnabled = true;
    pg.save(); drawPetLocal(pg, R, o); pg.restore();
    const dx = x - ox, dy = y - oy, gl = clamp(o.glitch || 0, 0, 1);
    gg.save(); gg.imageSmoothingEnabled = !o.pixel; gg.globalAlpha = o.alpha == null ? 1 : o.alpha;
    if (gl > 0.22) {
      const off = (gl - 0.22) * R * 0.16 * (0.6 + 0.8 * hr(Math.floor(o.t * 14)));
      if (tb.width !== pw || tb.height !== ph) { tb.width = pw; tb.height = ph; }
      for (const [col, sx] of [['#ff2a6d', -1], ['#05d9e8', 1]]) {
        tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, pw, ph); tg.drawImage(pb, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(0, 0, pw, ph);
        gg.globalAlpha = (o.alpha == null ? 1 : o.alpha) * 0.5; gg.drawImage(tb, dx + off * sx, dy, bw, bh);
      }
      gg.globalAlpha = o.alpha == null ? 1 : o.alpha;
    }
    if (gl > 0.35) {
      const n = 9, sh = ph / n, step = Math.floor(o.t * 12);
      for (let i = 0; i < n; i++) { const r = hr(step * 13 + i), off = r < gl * 0.3 ? (hr(step + i * 7) - 0.5) * R * 0.6 * gl : 0; gg.drawImage(pb, 0, i * sh, pw, sh, dx + off, dy + i * bh / n, bw, bh / n + 0.5); }
      if (gl > 0.55) { gg.fillStyle = hsl((o.t * 300) % 360, 100, 60, 0.7); for (let k = 0; k < Math.floor(gl * 6); k++) { const q = R * 0.08 * (1 + hr(step + k)); gg.fillRect(x + (hr(step * 3 + k) - 0.5) * R * 2.4, y - R * 2 + hr(step * 5 + k) * R * 2.4, q, q); } }
    } else gg.drawImage(pb, dx, dy, bw, bh);
    gg.restore();
  }
  // standalone preview of any form (diary tree, evolution card)
  function drawPetTo(canvas, form, sil, size) {
    const w = canvas.width, h = canvas.height, c2 = canvas.getContext('2d'); c2.clearRect(0, 0, w, h);
    const R = size || h * 0.26; c2.save();
    compositePet(c2, w / 2, h * 0.62 + R * 0.1, R, { form, t: 1.2, lookX: 0, lookY: 0, open: 1, blink: 0, eye: 'normal', mouth: 'smile', sx: 1, sy: 1, glitch: 0, earDrop: 0 }, 1);
    c2.restore();
    if (sil) { c2.globalCompositeOperation = 'source-in'; c2.fillStyle = '#2a3158'; c2.fillRect(0, 0, w, h); c2.globalCompositeOperation = 'source-over'; c2.fillStyle = '#9aa3c7'; c2.font = `900 ${h * 0.3}px ui-monospace, monospace`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('?', w / 2, h * 0.55); }
  }

  // ------------------------------------------------------------------ food & bug sprites
  function drawFood(gg, id, x, y, s, tm) {
    tm = tm || 0; gg.save(); gg.translate(x, y); gg.lineJoin = 'round';
    switch (id) {
      case 'crumbs': gg.fillStyle = '#8ff8ff'; glowFill(gg, '#3ef0ff', s * 0.5); [[-0.5, -0.15], [0.1, -0.5], [0.48, 0.05], [-0.15, 0.32], [0.3, 0.52], [-0.58, 0.48]].forEach(([a, b], i) => { const q = s * (i % 2 ? 0.26 : 0.34); gg.fillRect(a * s - q / 2, b * s - q / 2, q, q); }); break;
      case 'pie': { gg.fillStyle = '#ffb347'; glowFill(gg, '#ff9f1a', s * 0.3); gg.beginPath(); gg.moveTo(-s * 0.85, s * 0.5); gg.lineTo(s * 0.85, s * 0.5); gg.lineTo(s * 0.05, -s * 0.75); gg.closePath(); gg.fill(); noGlow(gg);
        gg.fillStyle = '#ff6f91'; gg.fillRect(-s * 0.45, s * 0.05, s * 0.9, s * 0.13); gg.fillStyle = '#ffe0a3'; gg.fillRect(-s * 0.85, s * 0.42, s * 1.7, s * 0.12); gg.fillStyle = '#3ef0ff'; gg.fillRect(-s * 0.15, -s * 0.25, s * 0.14, s * 0.14); gg.fillRect(s * 0.12, -s * 0.05, s * 0.12, s * 0.12); break; }
      case 'cookie': gg.fillStyle = '#d99a5b'; glowFill(gg, '#ffb36b', s * 0.3); gg.beginPath(); gg.arc(0, 0, s * 0.82, 0, TAU); gg.fill(); noGlow(gg); gg.strokeStyle = '#a8692f'; gg.lineWidth = s * 0.1; gg.stroke();
        gg.fillStyle = '#4b2a12'; [[-0.35, -0.3], [0.25, -0.38], [0.38, 0.2], [-0.2, 0.3], [0, -0.02], [-0.5, 0.08]].forEach(([a, b]) => gg.fillRect(a * s - s * 0.08, b * s - s * 0.08, s * 0.17, s * 0.17)); break;
      case 'burger': gg.fillStyle = '#f4a340'; gg.beginPath(); gg.ellipse(0, -s * 0.18, s * 0.82, s * 0.55, 0, Math.PI, TAU); gg.fill(); gg.fillStyle = '#fff3c4'; for (let k = 0; k < 4; k++) gg.fillRect(-s * 0.45 + k * s * 0.28, -s * 0.5 + (k % 2) * s * 0.12, s * 0.09, s * 0.06);
        gg.fillStyle = '#3dd36b'; gg.beginPath(); for (let k = 0; k <= 8; k++) gg.lineTo(-s * 0.85 + k * s * 0.2125, -s * 0.14 + (k % 2) * s * 0.12); gg.lineTo(s * 0.85, -s * 0.02); gg.lineTo(-s * 0.85, -s * 0.02); gg.fill();
        gg.fillStyle = '#ffd23e'; gg.fillRect(-s * 0.8, -s * 0.04, s * 1.6, s * 0.12); gg.fillStyle = '#6b3a22'; rr(gg, -s * 0.82, s * 0.06, s * 1.64, s * 0.26, s * 0.1); gg.fill(); gg.fillStyle = '#e69332'; rr(gg, -s * 0.8, s * 0.33, s * 1.6, s * 0.26, s * 0.12); gg.fill(); break;
      case 'gum': { gg.fillStyle = '#ff7ad9'; glowFill(gg, '#ff4fd8', s * 0.5); gg.beginPath(); gg.arc(0, 0, s * 0.75, 0, TAU); gg.fill(); noGlow(gg); const k = Math.floor(tm * 8);
        gg.fillStyle = 'rgba(62,240,255,.8)'; gg.fillRect(-s * 0.75 + hr(k) * s * 0.3, -s * 0.2, s * 0.9, s * 0.12); gg.fillStyle = 'rgba(255,255,255,.7)'; gg.fillRect(-s * 0.1, s * 0.25, s * 0.7, s * 0.1); gg.fillStyle = 'rgba(255,255,255,.55)'; ell(gg, -s * 0.3, -s * 0.35, s * 0.18, s * 0.1, -0.6); gg.fill(); break; }
      case 'tea': gg.strokeStyle = 'rgba(255,255,255,.55)'; gg.lineWidth = s * 0.07; for (let k = 0; k < 2; k++) { gg.beginPath(); for (let j = 0; j < 6; j++) gg.lineTo(-s * 0.2 + k * s * 0.35 + Math.sin(j + tm * 4 + k) * s * 0.08, -s * 0.55 - j * s * 0.08); gg.stroke(); }
        gg.fillStyle = '#e8f6ff'; gg.beginPath(); gg.moveTo(-s * 0.62, -s * 0.4); gg.lineTo(s * 0.62, -s * 0.4); gg.lineTo(s * 0.48, s * 0.6); gg.lineTo(-s * 0.48, s * 0.6); gg.closePath(); gg.fill();
        gg.strokeStyle = '#e8f6ff'; gg.lineWidth = s * 0.12; gg.beginPath(); gg.arc(s * 0.66, s * 0.05, s * 0.22, -1.3, 1.3); gg.stroke(); gg.fillStyle = '#5fe39a'; ell(gg, 0, -s * 0.4, s * 0.62, s * 0.12); gg.fill();
        gg.fillStyle = '#2bbf6a'; gg.fillRect(-s * 0.07, -s * 0.05, s * 0.14, s * 0.42); gg.fillRect(-s * 0.21, s * 0.09, s * 0.42, s * 0.14); break;
      case 'volt': gg.fillStyle = '#262b52'; rr(gg, -s * 0.48, -s * 0.72, s * 0.96, s * 1.44, s * 0.18); gg.fill(); gg.strokeStyle = '#ffd23e'; gg.lineWidth = s * 0.08; gg.stroke(); gg.fillStyle = '#ffd23e'; gg.fillRect(-s * 0.18, -s * 0.88, s * 0.36, s * 0.16);
        glowFill(gg, '#ffd23e', s * 0.6); gg.beginPath(); gg.moveTo(s * 0.12, -s * 0.5); gg.lineTo(-s * 0.25, s * 0.08); gg.lineTo(-s * 0.02, s * 0.08); gg.lineTo(-s * 0.12, s * 0.5); gg.lineTo(s * 0.25, -s * 0.08); gg.lineTo(s * 0.02, -s * 0.08); gg.closePath(); gg.fill(); break;
      case 'cake': gg.fillStyle = '#fff1f8'; gg.beginPath(); gg.moveTo(-s * 0.8, -s * 0.05); gg.lineTo(s * 0.8, -s * 0.25); gg.lineTo(s * 0.8, s * 0.55); gg.lineTo(-s * 0.8, s * 0.6); gg.closePath(); gg.fill();
        gg.fillStyle = '#ff7ab8'; gg.beginPath(); gg.moveTo(-s * 0.8, -s * 0.05); gg.lineTo(s * 0.8, -s * 0.25); gg.lineTo(s * 0.8, -s * 0.05); for (let k = 0; k < 5; k++) gg.lineTo(s * 0.8 - (k + 0.5) * s * 0.32, (k % 2 ? 0.02 : 0.16) * s); gg.lineTo(-s * 0.8, s * 0.12); gg.closePath(); gg.fill();
        gg.fillStyle = '#c86b9a'; gg.fillRect(-s * 0.8, s * 0.28, s * 1.6, s * 0.08); gg.fillStyle = '#3ef0ff'; gg.fillRect(-s * 0.06, -s * 0.62, s * 0.12, s * 0.42);
        gg.fillStyle = '#ffd23e'; glowFill(gg, '#ffb703', s * 0.6); ell(gg, 0, -s * 0.72 + Math.sin(tm * 12) * s * 0.02, s * 0.08, s * 0.14); gg.fill(); break;
    }
    noGlow(gg); gg.restore();
  }
  function drawBug(gg, x, y, s, a, tm, gold) {
    gg.save(); gg.translate(x, y); gg.rotate(a); const col = gold ? '#ffd23e' : '#ff3b6b', leg = Math.sin(tm * 22);
    gg.strokeStyle = gold ? '#a57a00' : '#7a0f2b'; gg.lineWidth = Math.max(1.2, s * 0.09); gg.lineCap = 'round';
    for (let k = -1; k <= 1; k++) for (const sd of [-1, 1]) { gg.beginPath(); gg.moveTo(k * s * 0.3, 0); gg.lineTo(k * s * 0.3 + leg * sd * k * s * 0.12 + s * 0.08 * k, sd * s * 0.62); gg.stroke(); }
    gg.beginPath(); gg.moveTo(s * 0.5, -s * 0.1); gg.lineTo(s * 0.85, -s * 0.38); gg.moveTo(s * 0.5, s * 0.1); gg.lineTo(s * 0.85, s * 0.38); gg.stroke();
    gg.fillStyle = col; glowFill(gg, col, s * 0.7); ell(gg, -s * 0.06, 0, s * 0.52, s * 0.4); gg.fill(); ell(gg, s * 0.48, 0, s * 0.24, s * 0.24); gg.fill(); noGlow(gg);
    gg.strokeStyle = 'rgba(0,0,0,.35)'; gg.lineWidth = s * 0.06; gg.beginPath(); gg.moveTo(-s * 0.5, 0); gg.lineTo(s * 0.3, 0); gg.stroke();
    gg.fillStyle = '#fff'; gg.fillRect(s * 0.5, -s * 0.15, s * 0.11, s * 0.11); gg.fillRect(s * 0.5, s * 0.05, s * 0.11, s * 0.11);
    gg.restore();
  }

  // ------------------------------------------------------------------ the room
  const SKY = [[0, '#050818', '#141a44', 1], [5, '#0b1030', '#3a2a5e', 0.8], [6.5, '#ff8a7a', '#ffd1a1', 0.1], [8, '#4aa8ff', '#bfe6ff', 0], [16.5, '#4a9cf0', '#cde8ff', 0],
    [18.3, '#ff6f91', '#ffc371', 0.1], [19.6, '#5b2a7a', '#ff7e6b', 0.4], [21, '#0b0f2e', '#2a1f5a', 0.9], [24, '#050818', '#141a44', 1]];
  const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixHex = (a, b, k) => { const A = hexRgb(a), B = hexRgb(b); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; };
  function skyAt(h) { for (let i = 0; i < SKY.length - 1; i++) { const a = SKY[i], b = SKY[i + 1]; if (h >= a[0] && h < b[0]) { const k = (h - a[0]) / (b[0] - a[0]); return { top: mixHex(a[1], b[1], k), bot: mixHex(a[2], b[2], k), stars: lerp(a[3], b[3], k) }; } } return { top: SKY[0][1], bot: SKY[0][2], stars: 1 }; }
  const theme = () => THEMES[(S && S.eq.theme) || 'neon'] || THEMES.neon;
  const roomId = () => (S && S.eq.room) || 'den';
  let vignette = null;
  function drawSkyBox(gg, x, y, w, h, hrs, th) {
    const sk = skyAt(hrs); const gr = gg.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, sk.top); gr.addColorStop(1, sk.bot); gg.fillStyle = gr; gg.fillRect(x, y, w, h);
    if (sk.stars > 0.05) { for (let i = 0; i < 40; i++) { const sx = x + hr(i) * w, sy = y + hr(i + 40) * h * 0.8, tw = 0.5 + 0.5 * Math.sin(clock * 2 + i); gg.fillStyle = `rgba(255,255,255,${sk.stars * tw * 0.9})`; const q = i % 7 ? 1.5 : 2.5; gg.fillRect(sx, sy, q, q); } }
    const sunUp = hrs >= 6 && hrs < 19.6, moonUp = !sunUp;
    if (sunUp) { const k = (hrs - 6) / 13.6, sx = x + w * (0.1 + 0.8 * k), sy = y + h * (0.75 - Math.sin(k * Math.PI) * 0.55); glowFill(gg, '#ffd56b', 30); gg.fillStyle = '#ffe08a'; gg.beginPath(); gg.arc(sx, sy, Math.min(w, h) * 0.1, 0, TAU); gg.fill(); noGlow(gg); }
    if (moonUp) { const k = ((hrs + 24 - 19.6) % 24) / 10.4, mx = x + w * (0.15 + 0.7 * k), my = y + h * (0.6 - Math.sin(clamp(k, 0, 1) * Math.PI) * 0.4), mr = Math.min(w, h) * 0.085;
      glowFill(gg, '#cfe0ff', 20); gg.fillStyle = '#eef3ff'; gg.beginPath(); gg.arc(mx, my, mr, 0, TAU); gg.fill(); noGlow(gg); gg.fillStyle = sk.top; gg.beginPath(); gg.arc(mx + mr * 0.45, my - mr * 0.25, mr * 0.85, 0, TAU); gg.fill(); }
    if (sk.stars < 0.6) { gg.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 3; i++) { const cx = x + (((hr(i * 9) * w + clock * (6 + i * 3)) % (w + 80)) - 40), cy = y + h * (0.2 + i * 0.18), q = Math.max(4, h * 0.05); for (let k = 0; k < 5; k++) gg.fillRect(cx + k * q - (k === 0 || k === 4 ? 0 : 0), cy - (k > 0 && k < 4 ? q : 0), q, q * (k > 0 && k < 4 ? 2 : 1)); } }
    // pixel skyline
    gg.fillStyle = sk.stars > 0.5 ? '#070a1e' : 'rgba(20,30,70,.55)'; let bx = x; let i = 0;
    while (bx < x + w) { const bw = w * (0.06 + hr(i * 3.3) * 0.08), bh = h * (0.12 + hr(i * 5.1) * 0.25); gg.fillRect(bx, y + h - bh, bw + 1, bh);
      if (sk.stars > 0.5) { gg.fillStyle = th.a; for (let k = 0; k < 3; k++) if (hr(i * 11 + k) > 0.45) gg.fillRect(bx + bw * 0.25 + (k % 2) * bw * 0.35, y + h - bh + 4 + k * 6, 2, 2); gg.fillStyle = '#070a1e'; }
      bx += bw; i++; }
    return sk;
  }
  function drawShootStar(gg) { if (!shootStar) return; const s = shootStar; gg.strokeStyle = 'rgba(255,255,255,.95)'; gg.lineWidth = 2.5; glowFill(gg, '#fff', 12); gg.beginPath(); gg.moveTo(s.x, s.y); gg.lineTo(s.x - s.vx * 0.14, s.y - s.vy * 0.14); gg.stroke(); gg.fillStyle = '#fff'; gg.beginPath(); gg.arc(s.x, s.y, 2.5, 0, TAU); gg.fill(); noGlow(gg); }
  function drawWindowFrame(gg, wn, th) {
    gg.save(); rr(gg, wn.x, wn.y, wn.w, wn.h, 12); gg.clip(); drawSkyBox(gg, wn.x, wn.y, wn.w, wn.h, hourNow(), th);
    drawShootStar(gg);
    gg.restore();
    gg.strokeStyle = th.a; gg.lineWidth = 3; glowFill(gg, th.a, 14); rr(gg, wn.x, wn.y, wn.w, wn.h, 12); gg.stroke(); noGlow(gg);
    gg.strokeStyle = 'rgba(255,255,255,.12)'; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(wn.x + wn.w / 2, wn.y); gg.lineTo(wn.x + wn.w / 2, wn.y + wn.h); gg.moveTo(wn.x, wn.y + wn.h * 0.5); gg.lineTo(wn.x + wn.w, wn.y + wn.h * 0.5); gg.stroke();
    gg.fillStyle = 'rgba(255,255,255,.06)'; gg.beginPath(); gg.moveTo(wn.x + wn.w * 0.1, wn.y); gg.lineTo(wn.x + wn.w * 0.3, wn.y); gg.lineTo(wn.x + wn.w * 0.12, wn.y + wn.h); gg.lineTo(wn.x - wn.w * 0.08, wn.y + wn.h); gg.fill();
  }
  function drawFloor(gg, th, hz) {
    const fg = gg.createLinearGradient(0, hz, 0, H); fg.addColorStop(0, th.floor); fg.addColorStop(1, '#05060f'); gg.fillStyle = fg; gg.fillRect(0, hz, W, H - hz);
    gg.strokeStyle = th.a; gg.globalAlpha = 0.22; gg.lineWidth = 1;
    const off = (clock * 0.25) % 1; for (let k = 0; k < 12; k++) { const f = (k + off) / 12, y = hz + (H - hz) * f * f; gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
    const vx = LY.cx; for (let k = -12; k <= 12; k++) { gg.beginPath(); gg.moveTo(vx + k * 40, hz); gg.lineTo(vx + k * (W / 5), H); gg.stroke(); }
    gg.globalAlpha = 1; gg.strokeStyle = th.b; gg.lineWidth = 2; glowFill(gg, th.b, 16); gg.beginPath(); gg.moveTo(0, hz); gg.lineTo(W, hz); gg.stroke(); noGlow(gg);
  }
  function drawDesk(gg, th) {
    const d = LY.desk, m = LY.mon;
    gg.fillStyle = '#1c2140'; gg.fillRect(d.x + d.w * 0.08, d.y, d.w * 0.08, d.h); gg.fillRect(d.x + d.w * 0.84, d.y, d.w * 0.08, d.h);
    gg.fillStyle = '#2b3160'; rr(gg, d.x, d.y - 6, d.w, 10, 3); gg.fill(); gg.strokeStyle = th.a; gg.globalAlpha = 0.5; gg.lineWidth = 1.5; gg.stroke(); gg.globalAlpha = 1;
    // CRT monitor (secret terminal)
    gg.fillStyle = '#d5d9ea'; rr(gg, m.x, m.y, m.w, m.h, m.w * 0.12); gg.fill(); gg.fillStyle = '#a9aec6'; gg.fillRect(m.x + m.w * 0.35, m.y + m.h, m.w * 0.3, 6);
    const sx = m.x + m.w * 0.1, sy = m.y + m.h * 0.12, sw = m.w * 0.8, sh = m.h * 0.66;
    gg.fillStyle = '#04110a'; rr(gg, sx, sy, sw, sh, 6); gg.fill();
    gg.save(); rr(gg, sx, sy, sw, sh, 6); gg.clip(); gg.fillStyle = th.a; glowFill(gg, th.a, 8); gg.font = `700 ${Math.max(8, sh * 0.2)}px ui-monospace, Consolas, monospace`; gg.textBaseline = 'top'; gg.textAlign = 'left';
    const gl = S ? Math.round(S.st.glitch) : 0; gg.fillText('>_' + (Math.floor(clock * 2) % 2 ? '█' : ''), sx + 4, sy + 4); gg.globalAlpha = 0.7; gg.fillText('GL ' + gl + '%', sx + 4, sy + sh * 0.42);
    noGlow(gg); gg.globalAlpha = 0.12; gg.fillStyle = '#000'; for (let y = sy; y < sy + sh; y += 3) gg.fillRect(sx, y, sw, 1); gg.restore(); gg.globalAlpha = 1;
    if (monTaps > 0) { gg.strokeStyle = th.b; gg.lineWidth = 2; gg.globalAlpha = clamp(monTapT, 0, 1); rr(gg, m.x - 3, m.y - 3, m.w + 6, m.h + 6, m.w * 0.14); gg.stroke(); gg.globalAlpha = 1; }
    // digital wall clock
    const cy = m.y - Math.max(16, m.h * 0.35);
    if (cy > LY.top + 8) { const d2 = new Date(), hh = debugHour != null ? Math.floor(debugHour) : d2.getHours(), mm = debugHour != null ? Math.round((debugHour % 1) * 60) : d2.getMinutes();
      gg.fillStyle = th.b; glowFill(gg, th.b, 10); gg.font = `800 ${Math.max(11, m.w * 0.2)}px ui-monospace, Consolas, monospace`; gg.textAlign = 'center'; gg.textBaseline = 'middle';
      gg.fillText(String(hh).padStart(2, '0') + (Math.floor(clock) % 2 ? ':' : ' ') + String(mm).padStart(2, '0'), m.x + m.w / 2, cy); noGlow(gg); }
  }
  function drawRoom(gg) {
    const th = theme(), rid = roomId(), hz = LY.horizon, hrs = hourNow();
    const wg = gg.createLinearGradient(0, 0, 0, hz); wg.addColorStop(0, th.bg1); wg.addColorStop(1, th.bg2); gg.fillStyle = wg; gg.fillRect(0, 0, W, hz);
    if (rid === 'garden') {
      const sk = skyAt(hrs); drawSkyBox(gg, 0, 0, W, hz, hrs, th); drawShootStar(gg);
      gg.strokeStyle = 'rgba(255,255,255,.22)'; gg.lineWidth = 2; for (let x = 0; x < W; x += Math.max(80, W / 8)) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, hz); gg.stroke(); } gg.beginPath(); gg.moveTo(0, hz * 0.45); gg.lineTo(W, hz * 0.45); gg.stroke();
      for (let i = 0; i < 14; i++) { const tx = hr(i * 4.4) * W, th2 = (hz - LY.top) * (0.18 + hr(i) * 0.25), tw = th2 * 0.5; gg.fillStyle = sk.stars > 0.5 ? '#0d3a2a' : '#2fae6a'; gg.fillRect(tx - 3, hz - th2 * 0.4, 6, th2 * 0.4); gg.beginPath(); gg.arc(tx, hz - th2 * 0.55, tw * 0.5, 0, TAU); gg.fill(); gg.fillStyle = sk.stars > 0.5 ? '#145a3e' : '#5fe39a'; gg.fillRect(tx - tw * 0.3, hz - th2 * 0.8, tw * 0.25, tw * 0.25); }
    } else if (rid === 'orbit') {
      gg.fillStyle = '#060818'; gg.fillRect(0, 0, W, hz); const R0 = Math.min(W - LY.left, hz - LY.top) * 0.42, px = LY.left + (W - LY.left) * 0.42, py = LY.top + (hz - LY.top) * 0.5;
      gg.save(); gg.beginPath(); gg.arc(px, py, R0, 0, TAU); gg.clip(); gg.fillStyle = '#02030a'; gg.fillRect(px - R0, py - R0, R0 * 2, R0 * 2);
      for (let i = 0; i < 70; i++) { gg.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * hr(i * 2)})`; gg.fillRect(px - R0 + hr(i) * R0 * 2, py - R0 + hr(i + 70) * R0 * 2, i % 9 ? 1.5 : 2.5, i % 9 ? 1.5 : 2.5); }
      const plx = px + R0 * 0.25, ply = py + R0 * 0.2, plr = R0 * 0.42; const pgd = gg.createRadialGradient(plx - plr * 0.4, ply - plr * 0.4, plr * 0.1, plx, ply, plr); pgd.addColorStop(0, th.b); pgd.addColorStop(1, '#1a0b3a'); gg.fillStyle = pgd; gg.beginPath(); gg.arc(plx, ply, plr, 0, TAU); gg.fill();
      gg.strokeStyle = th.a; gg.lineWidth = 3; glowFill(gg, th.a, 10); gg.beginPath(); gg.ellipse(plx, ply, plr * 1.7, plr * 0.38, -0.3, 0, TAU); gg.stroke(); noGlow(gg);
      drawShootStar(gg);
      gg.restore(); gg.strokeStyle = '#8a92b8'; gg.lineWidth = 10; gg.beginPath(); gg.arc(px, py, R0, 0, TAU); gg.stroke(); gg.strokeStyle = th.a; gg.lineWidth = 2; glowFill(gg, th.a, 12); gg.beginPath(); gg.arc(px, py, R0 + 6, 0, TAU); gg.stroke(); noGlow(gg);
      for (let k = 0; k < 8; k++) { const a = k * TAU / 8; gg.fillStyle = '#c9d2ea'; gg.beginPath(); gg.arc(px + Math.cos(a) * R0, py + Math.sin(a) * R0, 3, 0, TAU); gg.fill(); }
      LY.orbitWin = { x: px - R0, y: py - R0, w: R0 * 2, h: R0 * 2 };
    } else if (rid === 'void') {
      gg.fillStyle = '#000'; gg.fillRect(0, 0, W, hz); const st = Math.floor(clock * 6);
      gg.strokeStyle = th.a; gg.globalAlpha = 0.15; for (let i = 0; i < 18; i++) { const y = hr(st + i) * hz; gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); } gg.globalAlpha = 1;
      for (let i = 0; i < 16; i++) { const fx = hr(i * 3) * W, fy = LY.top + hr(i * 5) * (hz - LY.top), s = 6 + hr(i) * 18, a = clock * (0.3 + hr(i * 7)); gg.save(); gg.translate(fx + Math.sin(clock + i) * 10, fy + Math.cos(clock * 0.7 + i) * 8); gg.rotate(a); gg.strokeStyle = i % 2 ? th.a : th.b; gg.lineWidth = 1.5; glowFill(gg, gg.strokeStyle, 8); gg.strokeRect(-s / 2, -s / 2, s, s); gg.restore(); } noGlow(gg);
    } else {
      gg.strokeStyle = 'rgba(255,255,255,.035)'; gg.lineWidth = 1; for (let x = (clock * 3) % 32; x < W; x += 32) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, hz); gg.stroke(); }
      if (rid === 'server') {
        const rw = Math.max(50, (W - LY.left) * 0.09), rh = (hz - LY.top) * 0.95 + 20;
        for (const rx of [LY.left + 10, W - rw - 10]) { if (rx > LY.desk.x - rw && rx > LY.left + 20) continue; gg.fillStyle = '#141833'; gg.fillRect(rx, hz - rh, rw, rh); gg.strokeStyle = 'rgba(255,255,255,.08)';
          for (let y = hz - rh + 8; y < hz - 8; y += 14) { gg.strokeRect(rx + 5, y, rw - 10, 10); for (let k = 0; k < 3; k++) { const on = hr(Math.floor(clock * 3 + y + k * 7 + rx)) > 0.4; gg.fillStyle = on ? (k === 2 ? th.b : th.a) : '#2a2f55'; gg.fillRect(rx + 9 + k * 7, y + 3, 4, 4); } } }
        gg.strokeStyle = '#2a2f55'; gg.lineWidth = 3; for (let k = 0; k < 4; k++) { gg.beginPath(); gg.moveTo(LY.left + (W - LY.left) * (0.2 + k * 0.18), 0); gg.quadraticCurveTo(LY.left + (W - LY.left) * (0.28 + k * 0.18), LY.top + 40 + k * 10, LY.left + (W - LY.left) * (0.36 + k * 0.18), 0); gg.stroke(); }
      } else {   // den: shelf with little cubes and a neon sign
        const space = W - (LY.win.x + LY.win.w) - 14, sw = Math.min(160, space - 24), sx = LY.win.x + LY.win.w + Math.max(14, (space - sw) / 2), sy = LY.win.y + LY.win.h * 0.35;
        if (sw > 60) { gg.fillStyle = '#2b3160'; gg.fillRect(sx, sy, sw, 6); const cols = [th.a, th.b, '#ffd23e', '#3dffa8']; for (let k = 0; k < Math.floor(sw / 26); k++) { gg.fillStyle = cols[k % 4]; const q = 10 + (k % 3) * 4; gg.globalAlpha = 0.85; gg.fillRect(sx + 6 + k * 26, sy - q, q, q); } gg.globalAlpha = 1;
          gg.font = `900 ${Math.min(28, sw * 0.2)}px ui-monospace, Consolas, monospace`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillStyle = th.b; glowFill(gg, th.b, 16); gg.globalAlpha = 0.75 + 0.25 * Math.sin(clock * 3); gg.fillText('<3', sx + sw / 2, sy - 44 > LY.top ? sy - 40 : sy + 30); noGlow(gg); gg.globalAlpha = 1; }
      }
      drawWindowFrame(gg, LY.win, th);
    }
    drawFloor(gg, th, hz);
    if (rid === 'garden') for (let i = 0; i < 9; i++) { const fx = LY.left + hr(i * 2.7) * (W - LY.left), fy = hz + (LY.ground - hz) * (0.15 + hr(i * 6) * 0.8), s = 4 + hr(i) * 4; gg.fillStyle = '#3dd36b'; gg.fillRect(fx - 1, fy - s * 2, 2, s * 2); gg.fillStyle = ['#ff7ab8', '#ffd23e', '#a98bff'][i % 3]; for (let k = 0; k < 4; k++) gg.fillRect(fx - s / 2 + Math.cos(k * 1.57) * s * 0.6 - s * 0.3, fy - s * 2 + Math.sin(k * 1.57) * s * 0.6 - s * 0.3, s * 0.6, s * 0.6); }
    // charging pad (bed)
    const pad = LY.pad, pr = LY.R * 1.1; gg.fillStyle = 'rgba(0,0,0,.25)'; ell(gg, pad.x, pad.y + 4, pr, pr * 0.22); gg.fill();
    gg.strokeStyle = th.a; gg.globalAlpha = S && S.sleeping ? 0.8 : 0.3; gg.lineWidth = 2; glowFill(gg, th.a, S && S.sleeping ? 18 : 6); ell(gg, pad.x, pad.y + 2, pr * 0.9, pr * 0.18); gg.stroke(); noGlow(gg); gg.globalAlpha = 1;
    drawDesk(gg, th);
    // data motes
    for (let i = 0; i < 18; i++) { const mx = (hr(i) * W + Math.sin(clock * 0.3 + i) * 20), my = H - ((clock * (8 + hr(i + 9) * 14) + hr(i + 3) * H) % H); gg.fillStyle = i % 2 ? th.a : th.b; gg.globalAlpha = 0.18; gg.font = '700 11px ui-monospace, monospace'; gg.fillText(i % 3 ? '0' : '1', mx, my); }
    gg.globalAlpha = 1;
    if (isNight(hrs) && rid !== 'void') { gg.fillStyle = 'rgba(0,0,25,.16)'; gg.fillRect(0, 0, W, H); }
  }
  function drawVignette(gg) {
    if (!vignette) { vignette = document.createElement('canvas'); vignette.width = 256; vignette.height = 256; const v = vignette.getContext('2d'), gr = v.createRadialGradient(128, 128, 60, 128, 128, 182); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); v.fillStyle = gr; v.fillRect(0, 0, 256, 256); }
    gg.drawImage(vignette, 0, 0, W, H);
    gg.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < H; y += 3) gg.fillRect(0, y, W, 1);
  }

  // ------------------------------------------------------------------ runtime state
  const pet = { x: 0, tx: 0, vx: 0, dir: 1, sq: 0, sqv: 0, hy: 0, hv: 0, lookX: 0, lookY: 0, blink: 0, blinkT: 2, emote: null, emoteT: 0, eatT: 0, wanderT: 2,
    walk: 0, fatigue: 0, strokeAcc: 0, glanceT: 0, glance: { x: 0, y: 0 }, zT: 0, purrT: 0, shakeT: 0, jitter: 0, popT: 0 };
  const bugs = []; let ghost = null, shootStar = null, zaps = [], flyFood = null, drag = null, touch = null, pokes = [], monTaps = 0, monTapT = 0, konamiIdx = 0;
  const ptr = { x: -1, y: -1, t: -1e9 };
  let scene = 'title', evoSeq = null, hatchSeq = null, sweep = null, chatT = 12, bugT = 80, ghostT = 30, starT = 40, statT = 0, speech = { text: '', t: 0 }, lastSpoke = 0;

  let lift = 0, titleSv = null;
  function petR() { return LY.R * STAGE_SCALE[S ? S.stage : 1]; }
  function petCenter() { const R = petR(); return { x: pet.x, y: LY.ground - lift - R * 0.82 - pet.hy, R }; }
  function hitPet(x, y, pad) { const c = petCenter(); const dx = (x - c.x) / (c.R * (1.15 + (pad || 0))), dy = (y - c.y + c.R * 0.1) / (c.R * (1.1 + (pad || 0))); return dx * dx + dy * dy < 1; }

  // ------------------------------------------------------------------ stats & simulation
  const ST = [['data', '💾', '#3ef0ff'], ['energy', '⚡', '#ffd23e'], ['happy', '💗', '#ff6fb5'], ['cur', '✨', '#a98bff'], ['glitch', '👾', '#ff4d6d']];
  function addSt(fx, mult) { mult = mult == null ? 1 : mult; for (const k in fx) if (S.st[k] != null) S.st[k] = clamp(S.st[k] + fx[k] * mult, 0, 100); markDirty(); }
  function addCare(c) { for (const k in c) S.care[k] = (S.care[k] || 0) + c[k]; }
  function addXP(n) { if (!S || S.stage < 1) return; S.xp += n; markDirty(); }
  function addCoins(n, x, y) { if (!n) return; S.coins = Math.max(0, S.coins + n); markDirty(); if (x != null && n > 0) floatText('+' + n + ' ¢', x, y, '#ffd23e', 16, true); updCoins(); }
  function rates(h, live) {
    const s = S.st, nb = S.bugs, night = isNight();
    if (S.sleeping) { s.energy += (live ? 600 : 24) * h; s.data -= 3 * h; s.happy -= 0.6 * h; s.cur -= 1 * h; s.glitch += (0.4 + 0.6 * nb) * h; }
    else {
      s.data -= 7 * h; s.energy -= (night ? 6.5 : 4) * h; s.cur -= 5 * h; s.glitch += (1.4 + 1.3 * nb) * h;
      let hd = 3; if (s.data < 25) hd += 4; if (s.glitch > 60) hd += 3; if (nb >= 3) hd += 2; if (s.energy < 15) hd += 2; s.happy -= hd * h;
    }
    for (const k in s) s[k] = clamp(s[k], 0, 100);
    if (s.happy > 75) S.care.aff += 1.5 * h; if (s.glitch > 60) S.care.chaos += 2.5 * h; if (s.glitch < 20 && nb === 0) S.care.order += 1 * h; if (s.cur > 70) S.care.play += 1.5 * h;
  }
  function catchUp(sec) {   // gentle offline simulation: time counts fully for 6h, then slows down; stats never crash to zero
    const h = sec / 3600, eff = Math.min(30, h <= 6 ? h : 6 + (h - 6) * 0.3);
    const before = Object.assign({}, S.st), sum = { sec, slept: false, bugs: 0 };
    let left = eff, simT = S.last;
    while (left > 1e-6) {
      const d = Math.min(0.25, left); left -= d; simT += d / eff * sec * 1000; const hh = new Date(simT).getHours();
      if (!S.sleeping && (S.st.energy < 18 || (isNight(hh) && S.st.energy < 60))) { S.sleeping = true; sum.slept = true; }
      rates(d, false);
      if (S.sleeping && S.st.energy >= 99 && !isNight(hh)) S.sleeping = false;
      S.st.data = Math.max(S.st.data, 8); S.st.happy = Math.max(S.st.happy, 12); S.st.energy = Math.max(S.st.energy, 8); S.st.cur = Math.max(S.st.cur, 5);
    }
    const nb = Math.max(0, Math.min(6 - S.bugs, Math.floor(h * 0.45 + Math.random() * 0.8))); S.bugs += nb; sum.bugs = nb;
    sum.hungry = before.data - S.st.data > 20; return sum;
  }
  function tickStats() {
    if (!S || S.stage < 1) { if (S) S.last = Date.now(); return; }
    const now = Date.now(), el = (now - S.last) / 1000;
    if (el > 90) { const sum = catchUp(el); S.last = now; syncBugs(); if (scene === 'hub') { awaySummary(sum); } markDirty(); return; }
    if (el > 0) rates(el / 3600, true);
    S.last = now;
    if (S.sleeping && S.st.energy >= 100) wake(true);
    if (!S.sleeping && S.st.energy <= 1 && scene === 'hub') { S.sleeping = true; say(SR('cp_sp_passout')); }
    if (!S.storm && S.st.glitch >= 99.5 && scene === 'hub') startStorm();
    if (S.storm && S.st.glitch < 30) endStorm();
  }
  function mood() {
    if (!S) return 'content'; if (S.stage === 0) return 'egg'; const s = S.st;
    if (S.sleeping) return 'sleeping';
    if (pet.emote === 'annoyed' && pet.emoteT > 0) return 'annoyed';
    if (pet.emote === 'love' && pet.emoteT > 0) return 'loved';
    if (s.glitch > 75 || S.storm) return 'glitchy'; if (s.data < 20) return 'hungry'; if (s.energy < 20) return 'sleepy'; if (s.happy < 25) return 'sad'; if (s.cur < 20) return 'bored';
    const sc = s.happy * 0.4 + s.data * 0.2 + s.energy * 0.2 + s.cur * 0.2 - s.glitch * 0.2;
    return sc > 72 ? 'ecstatic' : sc > 55 ? 'happy' : sc > 38 ? 'content' : 'meh';
  }
  const MOOD_EMO = { ecstatic: '🤩', happy: '😊', content: '🙂', meh: '😐', bored: '🥱', hungry: '🍽️', sleepy: '😪', sad: '😢', glitchy: '👾', annoyed: '😤', loved: '🥰', sleeping: '💤', egg: '🥚' };
  function careStyle() { const c = S.care; let best = 'aff', bv = -1; for (const k of ['aff', 'play', 'order', 'chaos']) if (c[k] > bv) { bv = c[k]; best = k; } return bv < 3 ? null : best; }
  function nextForm() {
    const st = S.stage + 1; if (st > 4) return null; const style = careStyle() || 'aff';
    if (st === 4) { const v = ['aff', 'play', 'order', 'chaos'].map(k => S.care[k]), mx = Math.max(...v), mn = Math.min(...v); if (mx > 60 && mn >= mx * 0.55) return 'prism'; }
    return EVO[st][style];
  }
  const ageH = () => S.born ? (Date.now() - S.born) / 3.6e6 : 0;
  function canEvolve() { if (!S || S.stage < 1 || S.stage >= 4) return false; const n = S.stage + 1; return S.xp >= XP_NEED[n] && ageH() >= AGE_NEED[n]; }
  function usualHour() {
    if (S.visitCount < 3) return null; let best = -1, bv = 0;
    for (let h = 0; h < 24; h++) { const v = S.visits[h] * 2 + S.visits[(h + 23) % 24] + S.visits[(h + 1) % 24]; if (v > bv) { bv = v; best = h; } }
    return S.visits[best] >= 2 ? best : null;
  }
  const favGame = () => { let b = null, bv = 2; for (const k in S.games) if (S.games[k] > bv) { bv = S.games[k]; b = k; } return b; };

  // ------------------------------------------------------------------ speech
  const bubbleEl = $('#bubble');
  function corrupt(s, amt) { if (amt <= 0) return s; const G = '█▓░#@$%&01'; return Array.from(s).map(c => c !== ' ' && Math.random() < amt ? pick(G) : c).join(''); }
  function say(text, dur) {
    if (!text) return; const gl = S ? (S.storm ? 0.25 : S.st.glitch > 70 ? (S.st.glitch - 70) / 200 : 0) : 0;
    speech.text = corrupt(text, gl); speech.t = dur || clamp(1.6 + text.length * 0.05, 2.4, 5.5); bubbleEl.textContent = speech.text; bubbleEl.classList.remove('off');
    Snd.sfx('chirp', (FORMS[S ? S.form : 'bitling'].voice || 900 - (S ? S.stage : 1) * 90)); lastSpoke = clock; chatT = rnd(16, 28);
  }
  const sayR = (pre, v) => say(SR(pick(variants('cp_sp_' + pre)), v));
  function emote(e, t) { pet.emote = e; pet.emoteT = t || 1.2; }

  // ------------------------------------------------------------------ interactions
  function petUnit() {
    const f = Math.max(0.15, 1 - pet.fatigue); addSt({ happy: 2.4 * f }); addCare({ aff: 0.6 }); addXP(0.6 * f); S.counts.pets++; pet.fatigue = Math.min(1, pet.fatigue + 0.05);
    const c = petCenter(); addPart({ type: 'heart', x: c.x + rnd(-c.R * 0.6, c.R * 0.6), y: c.y - c.R * 0.4, vx: rnd(-20, 20), vy: rnd(-90, -50), g: -20, life: 1.1, size: rnd(7, 12), color: pick(['#ff5d9e', '#ff8fc4', '#ffc2dd']) });
    if (pet.purrT <= 0) { Snd.sfx('purr'); pet.purrT = 0.45; }
    if (!S.sleeping) emote('love', 1.3); pet.sq = Math.max(pet.sq, 0.05);
    if (Math.random() < 0.08 && speech.t <= 0) sayR('pet');
    if (S.tut === 0 && S.counts.pets >= 4) advanceTut();
    if (S.counts.pets >= 100) findSecret('purr');
  }
  function poke() {
    const now = clock; pokes = pokes.filter(t => now - t < 3); pokes.push(now); pet.sqv += 7; S.counts.pokes++;
    if (S.sleeping) { S.sleeping = false; addSt({ happy: -5 }); emote('annoyed', 2); say(SR('cp_sp_grumpy')); Snd.sfx('error'); updDock(); return; }
    if (pokes.length >= 6) { pokes = []; addSt({ happy: -4, glitch: 3 }); addCare({ chaos: 1.2 }); emote('annoyed', 2.2); say(SR('cp_sp_annoyed')); Snd.sfx('error'); pet.hv = 260; shake = Math.max(shake, 4); return; }
    addSt({ cur: 1.5, happy: 0.3 }); addCare({ play: 0.3, chaos: 0.15 }); addXP(0.4); emote('surprised', 0.5); Snd.sfx('squish');
    if (Math.random() < 0.3) sayR('poke');
  }
  function feed(id, fromX, fromY) {
    const F = FOODS.find(f => f.id === id); if (!F || !S || S.stage < 1) return false;
    if (F.stage && S.stage < F.stage) return false;
    if (S.sleeping) { say(SR('cp_sp_zzz')); return false; }
    const s = S.st, fx = F.fx;
    if (s.data >= 95 && !(fx.energy > 10 && s.energy < 95) && !(fx.glitch < 0 && s.glitch > 5)) { say(SR('cp_sp_full')); emote('annoyed', 0.8); Snd.sfx('error'); return false; }
    if (S.coins < F.price) { toast(T('cp_nocoins')); Snd.sfx('error'); return false; }
    S.coins -= F.price; addSt(fx); if (F.care) addCare(F.care); S.counts.feeds++; S.foods[id] = (S.foods[id] || 0) + 1; addXP(2);
    pet.eatT = 1.1; Snd.sfx('chomp'); setTimeout(() => Snd.sfx('chomp'), 200); setTimeout(() => Snd.sfx('chomp'), 400);
    const c = petCenter(); burst(c.x, c.y + c.R * 0.2, 10, { color: ['#ffd23e', '#3ef0ff', '#ff8fc4'], max: 160, s0: 2, s1: 4, up: 60 });
    if (id === S.fav) { addSt({ happy: 10 }); addCare({ aff: 3 }); addXP(3); emote('love', 2); say(SR('cp_sp_fav'));
      for (let i = 0; i < 6; i++) addPart({ type: 'heart', x: c.x + rnd(-30, 30), y: c.y - c.R * 0.5, vx: rnd(-50, 50), vy: rnd(-140, -80), g: 40, life: 1.3, size: rnd(8, 13), color: '#ff5d9e' });
      if (!S.favKnown) { S.favKnown = true; toast('😋 ' + T('cp_d_favfood') + ': ' + T('cp_fo_' + id), 'gold'); } }
    else { emote('happy', 1.4); if (Math.random() < 0.55) sayR('yum'); }
    if (S.tut === 1) advanceTut();
    updCoins(); renderTray(); checkAch(); markDirty(); return true;
  }
  function spawnBug(x, y) {
    const side = Math.random() < 0.5; const b = { x: x != null ? x : (side ? LY.left + 20 : W - 20), y: y != null ? y : rnd(LY.horizon - 20, LY.ground), a: side ? 0 : Math.PI, sp: rnd(30, 60), turn: 1, t: rnd(0, 9), gold: Math.random() < 0.08, dead: 0 };
    bugs.push(b); S.bugs = bugs.length; return b;
  }
  function syncBugs() { const n = clamp(S.bugs, 0, 6); while (bugs.length < n) spawnBug(rnd(LY.left + 30, W - 30), rnd(LY.horizon - 30, LY.ground)); while (bugs.length > n) bugs.pop(); S.bugs = bugs.length; }
  function squash(b, viaZap) {
    const i = bugs.indexOf(b); if (i < 0) return; bugs.splice(i, 1); S.bugs = bugs.length;
    addSt({ glitch: b.gold ? -8 : -4 }); addCare({ order: 0.8 }); addXP(0.8); S.counts.squash++; addCoins(b.gold ? 4 : 1, b.x, b.y - 14);
    burst(b.x, b.y, 14, { color: b.gold ? ['#ffd23e', '#fff'] : ['#ff3b6b', '#3dffa8', '#fff'], max: 220 }); addPart({ type: 'ring', x: b.x, y: b.y, size: 6, grow: 34, color: '#3dffa8', life: 0.4 });
    Snd.sfx(viaZap ? 'zap' : 'squash'); shake = Math.max(shake, 2);
    if (!bugs.length && !viaZap) { emote('happy', 1.2); if (Math.random() < 0.6) say(SR('cp_sp_clean')); }
    if (S.tut === 2) advanceTut(); checkAch(); markDirty();
  }
  function doSweep() {
    if (S.stage < 1) return; const left = 60 - (Date.now() - S.sweepAt) / 1000;
    if (left > 0) { toast(T('cp_sweep_cd', { n: Math.ceil(left) })); Snd.sfx('error'); return; }
    S.sweepAt = Date.now(); sweep = { t: 0 }; Snd.sfx('whoosh');
    if (!bugs.length) { addSt({ glitch: -5 }); toast(T('cp_nobugs')); }
    addCare({ order: 1 }); markDirty();
  }
  function sleep() {
    if (S.stage < 1 || S.sleeping) return;
    if (S.st.energy >= 85 && !isNight()) { say(SR('cp_sp_notsleepy')); emote('surprised', 0.8); return; }
    S.sleeping = true; S.counts.sleeps++; if (isNight()) addCare({ order: 1.5 }); say(SR('cp_sp_goodnight')); Snd.sfx('yawn'); updDock(); markDirty();
  }
  function wake(auto) {
    if (!S.sleeping) return; S.sleeping = false;
    if (auto) say(SR('cp_sp_charged')); else if (S.st.energy < 40) { addSt({ happy: -4 }); emote('annoyed', 1.5); say(SR('cp_sp_grumpy')); } else say(SR('cp_sp_stretch'));
    Snd.sfx('level'); updDock(); markDirty();
  }
  function startStorm() { S.storm = true; say(SR('cp_sp_storm')); Snd.sfx('glitch'); shake = 10; for (let i = 0; i < 3 && bugs.length < 6; i++) spawnBug(); markDirty(); }
  function endStorm() { S.storm = false; say(SR('cp_sp_stormover')); findSecret('storm'); markDirty(); }
  function tapSeed() {
    if (hatchSeq) return; S.hatch++; pet.sqv += 6; pet.shakeT = 0.3; Snd.sfx('crack'); const c = petCenter();
    burst(c.x, c.y, 6, { color: ['#fff', '#3ef0ff'], max: 140, s0: 2, s1: 4 });
    if (S.hatch >= 10) { hatchSeq = { t: 0 }; Snd.sfx('evoCharge'); }
    markDirty();
  }
  function doHatch() {
    S.stage = 1; S.form = 'bitling'; S.born = Date.now(); S.seen.push('bitling'); S.last = Date.now(); S.st = { data: 70, energy: 85, happy: 75, cur: 70, glitch: 6 };
    const c = petCenter(); flash = 1; shake = 8; Snd.sfx('evoBoom'); burst(c.x, c.y, 50, { color: ['#fff', '#3ef0ff', '#ff4fd8', '#ffd23e'], max: 420, life: 1.3 });
    for (let i = 0; i < 3; i++) addPart({ type: 'ring', x: c.x, y: c.y, size: 10, grow: 160 + i * 60, color: '#3ef0ff', life: 0.6 + i * 0.2 });
    newVisit(true); saveNow(); renderHub(); toast(T('cp_hatched', { n: S.name }), 'gold');
    setTimeout(() => { say(SR('cp_sp_first', { n: S.name }), 4); }, 700); checkAch();
  }
  function advanceTut() { S.tut++; if (S.tut === 2 && !bugs.length) { const b = spawnBug(); b.sp = 20; } updCoach(); markDirty(); }
  function monitorTap() {
    monTaps = monTapT > 0 ? monTaps + 1 : 1; monTapT = 1.6; Snd.sfx('tap');
    if (monTaps >= 5) { monTaps = 0; findSecret('terminal'); openTerminal(); }
  }

  // ------------------------------------------------------------------ secrets & achievements
  function secretName(id) { return T('cp_se_' + id); }
  function findSecret(id) {
    if (!S || S.secrets[id]) return false; S.secrets[id] = Date.now();
    const unl = [];
    for (const a of ACCS) if (a.secret === id && !S.owned.acc.includes(a.id)) { S.owned.acc.push(a.id); unl.push(T('cp_ac_' + a.id)); }
    for (const r of ROOMS) if (r.secret === id && !S.owned.rooms.includes(r.id)) { S.owned.rooms.push(r.id); unl.push(T('cp_r_' + r.id)); }
    for (const k in THEMES) if (THEMES[k].secret === id && !S.owned.themes.includes(k)) { S.owned.themes.push(k); unl.push(T('cp_th_' + k)); }
    if (id === 'star') addCoins(50); if (id === 'konami') addCoins(30);
    toast('🤫 ' + T('cp_secret_found', { s: secretName(id) }) + (unl.length ? ' · ' + unl.join(', ') : ''), 'gold'); Snd.sfx('secret'); addXP(10); saveNow(); return true;
  }
  function checkAch() {
    if (!S) return; for (const [id, , coins, fn] of ACH) { if (S.ach[id]) continue; let ok = false; try { ok = fn(); } catch (e) {} if (!ok) continue;
      S.ach[id] = Date.now(); if (coins) S.coins += coins; toast('🏅 ' + T('cp_ach_got', { s: T('cp_ah_' + id) }) + (coins ? ' · +' + coins + ' ¢' : ''), 'gold'); Snd.sfx('level'); updCoins(); markDirty(); }
  }
  function onKonami() {
    if (!S || S.stage < 1) return; const first = findSecret('konami'); S.pixel = true; if (first && !S.eq.face) S.eq.face = 'pixshades'; say(SR('cp_sp_konami')); flash = 0.6; markDirty();
  }

  // ------------------------------------------------------------------ visits, habits, greeting
  function newVisit(first) {
    const now = Date.now(), d = new Date(), h = d.getHours(), today = dayKey(d);
    S.visits[h]++; S.visitCount++; S.lastVisit = now;
    if (h < 5) S.flags.night = true; if (h >= 5 && h < 8) S.flags.early = true;
    if (S.day !== today) { const y = new Date(now - 864e5); S.streak = S.day === dayKey(y) ? S.streak + 1 : 1; S.day = today;
      if (!first) { const gift = 10 + 5 * Math.min(S.streak, 7); S.coins += gift; setTimeout(() => toast('🎁 ' + T('cp_daily', { n: gift }), 'gold'), 1600); if (S.streak > 1) setTimeout(() => say(SR('cp_sp_streak', { n: S.streak })), 5200); } }
    markDirty();
  }
  function greet(awaySec) {
    const h = hourNow(), uh = usualHour();
    if (awaySec > 2 * 86400) { say(SR('cp_sp_missed', { d: fmtDur(awaySec) }), 4.5); emote('love', 2.5); return; }
    if (uh != null && Math.abs(((h - uh + 36) % 24) - 12) <= 1.2) { say(SR('cp_sp_usual', { t: hourLabel(uh) }), 4.5); emote('happy', 2); return; }
    if (S.sleeping) return;
    if (h >= 22 || h < 5) say(SR('cp_sp_night')); else if (h < 12) say(SR('cp_sp_morning')); else if (h < 18) say(SR('cp_sp_afternoon')); else say(SR('cp_sp_evening'));
    emote('happy', 1.5);
  }
  function awaySummary(sum) {
    if (sum.sec < 300) return; const bits = [];
    if (sum.bugs) bits.push(SR('cp_away_bugs', { n: sum.bugs })); if (sum.slept) bits.push(SR('cp_away_slept')); if (sum.hungry) bits.push(SR('cp_away_hungry'));
    if (!bits.length) bits.push(SR('cp_away_fine'));
    toast('⏰ ' + SR('cp_away', { t: fmtDur(sum.sec) }) + ' ' + bits.join(lang() === 'ar' ? '، ' : ', '));
  }
  function idleChat() {
    const s = S.st, h = hourNow(), opts = [];
    if (s.data < 30) return sayR('hungry'); if (s.energy < 25 || (isNight() && s.energy < 45)) return sayR('sleepy'); if (s.glitch > 65) return sayR('glitchy');
    if (s.cur < 30) return sayR('bored'); if (s.happy < 30) return sayR('sad');
    opts.push(() => sayR('happy'), () => sayR('idle'), () => sayR('idle'));
    if (isNight(h)) opts.push(() => sayR('night'), () => say(SR('cp_sp_stars')));
    else if (h >= 17.5 && h < 19.6) opts.push(() => say(SR('cp_sp_sunset'))); else if (h >= 9 && h < 16) opts.push(() => say(SR('cp_sp_sunny')));
    const fg = favGame(); if (fg && GAMES[fg] && S.stage >= GAMES[fg].stage) opts.push(() => say(SR('cp_sp_favgame', { g: T('cp_g_' + fg) })));
    const st = careStyle(); if (st && S.visitCount >= 2) opts.push(() => say(SR({ aff: 'cp_sp_lpet', play: 'cp_sp_lplay', order: 'cp_sp_lorder', chaos: 'cp_sp_lchaos' }[st])));
    if (clock - ptr.t > 60) opts.push(() => say(SR('cp_sp_wait')));
    pick(opts)();
  }

  // ------------------------------------------------------------------ hub update
  function faceFor() {
    const m = mood(), s = S.st; let eye = 'normal', mouth = null, open = 1, blush = 0, earDrop = 0;
    if (S.sleeping) return { eye: 'closed', mouth: 'smallo', open: 0, earDrop: 0.6 };
    if (pet.eatT > 0) return { eye: 'happy', mouth: 'chomp', open: 1, blush: 1 };
    if (pet.emoteT > 0) {
      switch (pet.emote) {
        case 'love': return { eye: 'heart', mouth: 'grin', open: 1, blush: 1 }; case 'happy': return { eye: 'happy', mouth: 'grin', open: 1, blush: 1 };
        case 'surprised': return { eye: 'wide', mouth: 'o', open: 1.1 }; case 'annoyed': return { eye: 'angry', mouth: 'flat', open: 0.75 };
        case 'sad': return { eye: 'sad', mouth: 'frown', open: 0.8, earDrop: 1 }; case 'dizzy': return { eye: 'dizzy', mouth: 'wavy', open: 1 };
        case 'scared': return { eye: 'wide', mouth: 'wavy', open: 1.1 };
      }
    }
    if (drag && drag.moved) return { eye: 'wide', mouth: 'o', open: 1.1 };
    if (speech.t > 0) mouth = 'talk';
    switch (m) {
      case 'ecstatic': eye = Math.sin(clock * 0.7) > 0.3 ? 'happy' : 'normal'; mouth = mouth || 'grin'; blush = 1; break;
      case 'happy': mouth = mouth || 'smile'; break; case 'content': mouth = mouth || 'smile'; break; case 'meh': mouth = mouth || 'flat'; break;
      case 'bored': open = 0.6; mouth = mouth || 'flat'; break; case 'hungry': eye = 'sad'; mouth = mouth || 'o'; earDrop = 0.5; break;
      case 'sleepy': open = 0.45; mouth = mouth || 'smallo'; earDrop = 0.7; break; case 'sad': eye = 'sad'; mouth = mouth || 'frown'; earDrop = 1; break;
      case 'glitchy': eye = Math.sin(clock * 3) > 0.5 ? 'pixel' : (Math.sin(clock * 5) > 0.7 ? 'x' : 'normal'); mouth = mouth || 'wavy'; break;
    }
    if (s.energy < 30 && m !== 'sleepy') open = Math.min(open, 0.7);
    return { eye, mouth, open, blush, earDrop };
  }
  function petOpts(extra) {
    const f = S && S.stage >= 1 ? faceFor() : { eye: 'normal', mouth: 'smile', open: 1 }, F = FORMS[S ? S.form : 'bitling'];
    const sx = 1 + pet.sq + (S && S.sleeping ? Math.sin(clock * 1.3) * 0.03 : Math.sin(clock * 2.2) * 0.015), sy = 1 - pet.sq + (S && S.sleeping ? -Math.sin(clock * 1.3) * 0.03 : -Math.sin(clock * 2.2) * 0.015);
    const gl = S ? clamp((S.st.glitch - 35) / 65, 0, 1) * 0.85 + (F.gl || 0) + (S.storm ? 0.45 : 0) + pet.jitter : 0;
    return Object.assign({ form: S ? S.form : 'bitling', t: clock, lookX: pet.lookX, lookY: pet.lookY, blink: pet.blink > 0 ? 1 - Math.abs(pet.blink - 0.07) / 0.07 : 0,
      eye: f.eye, mouth: f.mouth, open: f.open, blush: f.blush, earDrop: f.earDrop || 0, sx, sy, glitch: gl, pixel: S && S.pixel, sleeping: S && S.sleeping, hatch: S ? S.hatch / 10 : 0,
      acc: S && S.stage >= 1 ? { head: S.eq.head, face: S.eq.face } : null }, extra || {});
  }
  function updPetAnim(dt) {
    pet.sqv += (-90 * pet.sq - 9 * pet.sqv) * dt; pet.sq += pet.sqv * dt; pet.sq = clamp(pet.sq, -0.35, 0.35);
    if (pet.hy > 0 || pet.hv > 0) { pet.hv -= 2400 * dt * (LY.R / 60); pet.hy += pet.hv * dt; if (pet.hy <= 0) { pet.hy = 0; pet.hv = 0; pet.sqv -= 3.5; } }
    pet.blinkT -= dt; if (pet.blinkT <= 0) { pet.blink = 0.14; pet.blinkT = rnd(2, 5.5); } if (pet.blink > 0) pet.blink = Math.max(0, pet.blink - dt);
    pet.emoteT -= dt; pet.eatT -= dt; pet.purrT -= dt; pet.fatigue = Math.max(0, pet.fatigue - dt * 0.03); pet.jitter = Math.max(0, pet.jitter - dt * 2);
  }
  function hop(v) { if (pet.hy <= 0) { pet.hv = (v || 520) * Math.sqrt(LY.R / 60); pet.sqv += 4; } }
  function hubUpdate(dt) {
    updPetAnim(dt);
    const trEl = $('#tray'); let lt = 0; if (!trEl.hidden) { const r = trEl.getBoundingClientRect(); lt = clamp(LY.ground - r.top + 14, 0, Math.max(0, LY.ground - LY.horizon - 10)); }
    lift = lerp(lift, lt, Math.min(1, dt * 9));
    const c = petCenter(), R = c.R;
    if (hatchSeq) { hatchSeq.t += dt; pet.shakeT = 0.1; if (hatchSeq.t > 1.6) { hatchSeq = null; doHatch(); } }
    if (pet.shakeT > 0) pet.shakeT -= dt;
    // look target
    let tx = pet.glance.x, ty = pet.glance.y; pet.glanceT -= dt;
    if (pet.glanceT <= 0) { pet.glanceT = rnd(1.5, 4); pet.glance = { x: c.x + rnd(-200, 200), y: c.y + rnd(-120, 60) }; }
    if (drag && drag.moved) { tx = drag.x; ty = drag.y; } else if (flyFood) { tx = flyFood.x; ty = flyFood.y; } else if (clock - ptr.t < 2.5) { tx = ptr.x; ty = ptr.y; } else if (bugs.length && Math.sin(clock * 0.4) > 0.3) { tx = bugs[0].x; ty = bugs[0].y; } else if (ghost) { tx = ghost.x; ty = ghost.y; }
    pet.lookX = lerp(pet.lookX, clamp((tx - c.x) / (R * 3), -1, 1), Math.min(1, dt * 8)); pet.lookY = lerp(pet.lookY, clamp((ty - c.y) / (R * 3), -1, 1), Math.min(1, dt * 8));
    if (!S || S.stage < 1) return;
    // AI
    const s = S.st, style = careStyle(), F = FORMS[S.form];
    if (!S.sleeping && !evoSeq) {
      pet.wanderT -= dt;
      if (drag && drag.moved) pet.tx = clamp(drag.x, LY.minX, LY.maxX);
      else if (style === 'aff' && clock - ptr.t < 1.5 && Math.abs(ptr.x - c.x) < R * 5 && ptr.y > LY.top) pet.tx = clamp(ptr.x, LY.minX, LY.maxX);
      else if (pet.wanderT <= 0) { pet.wanderT = rnd(2.5, 7) * (s.energy < 30 ? 1.8 : 1); if (Math.random() < 0.7) pet.tx = rnd(LY.minX, LY.maxX); if (s.happy > 65 && s.energy > 30 && Math.random() < (style === 'play' ? 0.6 : 0.3)) hop(); }
      const spd = (35 + s.energy * 0.6) * (LY.R / 60), dx = pet.tx - pet.x;
      if (Math.abs(dx) > 3) { pet.vx = Math.sign(dx) * Math.min(spd, Math.abs(dx) * 3); pet.dir = Math.sign(dx); } else pet.vx = 0;
      pet.x += pet.vx * dt; pet.walk += Math.abs(pet.vx) * dt * 0.09;
      if (pet.vx && pet.hy <= 0) pet.sq = lerp(pet.sq, Math.sin(pet.walk * 2) * 0.04, 0.3);
      if (style === 'chaos' && Math.random() < dt / 35 && s.glitch > 25) { burst(c.x, c.y, 16, { color: ['#ff2a6d', '#05d9e8'], max: 200 }); pet.x = pet.tx = rnd(LY.minX, LY.maxX); pet.jitter = 0.8; Snd.sfx('glitch'); if (Math.random() < 0.4) say(SR('cp_sp_wee')); }
      if (F.style === 'order' && bugs.length && Math.random() < dt / 25) { const b = bugs[0]; zaps.push({ x0: c.x, y0: c.y - R * 0.12, b, t: 0.3 }); }
      if (s.glitch > 70 && Math.random() < dt / 6) pet.jitter = 0.5;
    }
    pet.x = clamp(pet.x, LY.minX, LY.maxX);
    // speech & chatter
    if (speech.t > 0) { speech.t -= dt; if (speech.t <= 0) bubbleEl.classList.add('off'); }
    chatT -= dt; if (chatT <= 0 && !S.sleeping && speech.t <= 0 && !drag && !evoSeq) { chatT = rnd(16, 30); idleChat(); }
    // sleeping zzz
    if (S.sleeping) { pet.zT -= dt; if (pet.zT <= 0) { pet.zT = 1.1; addPart({ type: 'z', text: 'Z', x: c.x + R * 0.5, y: c.y - R * 0.8, vx: 14, vy: -28, g: 0, life: 2.2, size: 12 + Math.random() * 10, color: theme().a, top: true }); } }
    // bugs
    bugT -= dt; if (bugT <= 0) { bugT = rnd(60, 130) * (S.sleeping ? 2 : 1); if (bugs.length < 6) { spawnBug(); if (!S.sleeping && Math.random() < 0.5) { say(SR('cp_sp_bug')); emote('scared', 1); } } }
    if (S.storm && bugs.length < 6 && Math.random() < dt / 8) spawnBug();
    for (const b of bugs) {
      b.t += dt; b.turn -= dt; if (b.turn <= 0) { b.a += rnd(-1.4, 1.4); b.turn = rnd(0.5, 2); }
      b.x += Math.cos(b.a) * b.sp * dt; b.y += Math.sin(b.a) * b.sp * dt * 0.7;
      if (b.x < LY.left + 14 || b.x > W - 14) { b.a = Math.PI - b.a; b.x = clamp(b.x, LY.left + 14, W - 14); }
      if (b.y < LY.top + 24 || b.y > LY.ground + 8) { b.a = -b.a; b.y = clamp(b.y, LY.top + 24, LY.ground + 8); }
    }
    for (let i = zaps.length - 1; i >= 0; i--) { const z = zaps[i]; z.t -= dt; if (z.t <= 0) { zaps.splice(i, 1); if (bugs.includes(z.b)) { squash(z.b, true); if (Math.random() < 0.5) say(SR('cp_sp_zap')); } } }
    if (sweep) { sweep.t += dt * 1.4; const sx = LY.left + sweep.t * (W - LY.left); for (const b of bugs.slice()) if (b.x < sx) { const i = bugs.indexOf(b); bugs.splice(i, 1); S.bugs = bugs.length; addSt({ glitch: -3 }); S.counts.squash++; burst(b.x, b.y, 10, { color: ['#3dffa8', '#fff'] }); Snd.sfx('zap'); if (S.tut === 2) advanceTut(); }
      if (sweep.t >= 1) { sweep = null; checkAch(); markDirty(); } }
    // night ghost & shooting stars (secrets)
    const hrs = hourNow();
    if (hrs < 5 && !ghost) { ghostT -= dt; if (ghostT <= 0) { ghostT = rnd(40, 90); const fromL = Math.random() < 0.5; ghost = { x: fromL ? LY.left - 30 : W + 30, y: rnd(LY.top + 40, LY.horizon), vx: (fromL ? 1 : -1) * rnd(40, 70), t: 0 }; } }
    if (ghost) { ghost.t += dt; ghost.x += ghost.vx * dt; ghost.y += Math.sin(ghost.t * 2) * 20 * dt; if (ghost.x < LY.left - 60 || ghost.x > W + 60) ghost = null; }
    const hasSky = roomId() !== 'void';
    if ((hrs >= 20 || hrs < 5) && hasSky && !shootStar) { starT -= dt; if (starT <= 0) { starT = rnd(45, 110); const wn = roomId() === 'orbit' && LY.orbitWin ? LY.orbitWin : roomId() === 'garden' ? { x: 0, y: LY.top, w: W, h: LY.horizon - LY.top } : LY.win;
      shootStar = { x: wn.x + wn.w * rnd(0.1, 0.5), y: wn.y + wn.h * rnd(0.05, 0.3), vx: wn.w * rnd(0.5, 0.8), vy: wn.h * rnd(0.25, 0.45), t: 0, life: 1.8 }; } }
    if (shootStar) { shootStar.t += dt; shootStar.x += shootStar.vx * dt; shootStar.y += shootStar.vy * dt; if (shootStar.t > shootStar.life) shootStar = null; }
    if (monTapT > 0) monTapT -= dt;
    // evolution readiness
    const evTag = $('#evoTag'), ready = canEvolve() && !evoSeq;
    if (ready !== !evTag.hidden) { evTag.hidden = !ready; updCoach(); if (ready) { say(SR('cp_sp_evo')); Snd.sfx('sparkle'); } }
    if (ready) { evTag.style.left = (LY.left + (W - LY.left) / 2) + 'px'; evTag.style.top = (LY.top + 8) + 'px'; }
  }

  // ------------------------------------------------------------------ hub draw
  function drawHub(gg) {
    drawRoom(gg);
    const c = petCenter(), R = c.R;
    if (ghost) { gg.save(); gg.globalAlpha = 0.55 + 0.25 * Math.sin(clock * 5); gg.translate(ghost.x, ghost.y); gg.scale(Math.sign(ghost.vx) || 1, 1); const s = 22; gg.fillStyle = '#dfe9ff'; glowFill(gg, '#a8c4ff', 20);
      gg.beginPath(); gg.arc(0, 0, s, Math.PI, 0); gg.lineTo(s, s); for (let k = 0; k < 4; k++) gg.lineTo(s - (k + 0.5) * s / 2, s - (k % 2 ? 0 : s * 0.3) + Math.sin(clock * 8 + k) * 2); gg.lineTo(-s, s); gg.closePath(); gg.fill(); noGlow(gg);
      gg.fillStyle = '#1b2350'; gg.fillRect(-s * 0.45, -s * 0.2, s * 0.3, s * 0.35); gg.fillRect(s * 0.15, -s * 0.2, s * 0.3, s * 0.35); gg.restore(); }
    for (const b of bugs) drawBug(gg, b.x, b.y, clamp(LY.R * 0.3, 12, 22), b.a, b.t, b.gold);
    // pet shadow + pet
    const th = theme(), sh = 1 - Math.min(0.5, pet.hy / (R * 2)), gy = LY.ground - lift;
    gg.fillStyle = 'rgba(0,0,0,.35)'; ell(gg, c.x, gy + 2, R * 0.95 * sh, R * 0.17 * sh); gg.fill();
    gg.strokeStyle = th.a; gg.globalAlpha = 0.18; gg.lineWidth = 2; ell(gg, c.x, gy + 2, R * 1.1 * sh, R * 0.22 * sh); gg.stroke(); gg.globalAlpha = 1;
    let px = c.x; if (pet.shakeT > 0) px += Math.sin(clock * 70) * R * 0.06;
    let o = petOpts();
    if (evoSeq) { const k = evoSeq.t; px += Math.sin(clock * 60) * R * 0.04 * Math.min(1, k); if (k < 2.6) { const fr = 2 + k * k * 4; if (Math.sin(clock * fr * 6) > 0.4) o.form = evoSeq.to; o.glitch = Math.min(1, k * 0.35); o.eye = 'closed'; o.mouth = 'smallo'; } }
    const pop = pet.popT > 0 ? 1 + Math.sin(pet.popT * 10) * 0.08 * pet.popT : 1;
    compositePet(gg, px, gy - R * 0.84 * (o.sy || 1) * pop - pet.hy, R * pop, o);
    // zaps
    for (const z of zaps) { gg.strokeStyle = '#3dffa8'; gg.lineWidth = 3; glowFill(gg, '#3dffa8', 14); gg.beginPath(); gg.moveTo(z.x0, z.y0); gg.lineTo(z.b.x + rnd(-3, 3), z.b.y + rnd(-3, 3)); gg.stroke(); noGlow(gg); }
    if (flyFood) drawFood(gg, flyFood.id, flyFood.x, flyFood.y, 18, clock);
    drawParts(gg, false);
    if (sweep) { const sx = LY.left + sweep.t * (W - LY.left); const sg = gg.createLinearGradient(sx - 80, 0, sx, 0); sg.addColorStop(0, 'rgba(61,255,168,0)'); sg.addColorStop(1, 'rgba(61,255,168,.35)'); gg.fillStyle = sg; gg.fillRect(sx - 80, 0, 80, H); gg.fillStyle = '#3dffa8'; gg.fillRect(sx - 2, 0, 3, H); }
    if (S && S.sleeping) {
      const lg = gg.createRadialGradient(c.x, c.y, R * 0.6, c.x, c.y, Math.max(W, H) * 0.7); lg.addColorStop(0, 'rgba(2,3,12,.25)'); lg.addColorStop(0.25, 'rgba(2,3,12,.62)'); lg.addColorStop(1, 'rgba(2,3,12,.82)');
      gg.fillStyle = lg; gg.fillRect(0, 0, W, H);
    }
    drawParts(gg, true);
    if (drag && drag.moved) { gg.save(); gg.globalAlpha = 0.95; drawFood(gg, drag.id, drag.x, drag.y - 10, 22, clock); gg.restore(); if (hitPet(drag.x, drag.y, 0.4)) { gg.strokeStyle = th.a; gg.lineWidth = 2; gg.setLineDash([6, 6]); ell(gg, c.x, c.y, R * 1.3, R * 1.2); gg.stroke(); gg.setLineDash([]); } }
    if (S && S.storm) { const st = Math.floor(clock * 10); for (let i = 0; i < 6; i++) { gg.fillStyle = hsl(hr(st + i) * 360, 100, 60, 0.12); gg.fillRect(0, hr(st * 2 + i) * H, W, 4 + hr(i + st) * 26); } }
    else if (S && S.st.glitch > 60 && Math.sin(clock * 3.3) > 0.85) { gg.fillStyle = 'rgba(255,42,109,.08)'; gg.fillRect(0, hr(Math.floor(clock * 8)) * H, W, 10); }
    if (evoSeq) drawEvoFx(gg, c);
  }
  function drawEvoFx(gg, c) {
    const k = evoSeq.t, R = c.R; gg.save(); gg.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + clock * 0.8; gg.fillStyle = `rgba(255,255,255,${0.05 * Math.min(1, k)})`; gg.beginPath(); gg.moveTo(c.x, c.y); gg.arc(c.x, c.y, Math.max(W, H), a, a + 0.18); gg.closePath(); gg.fill(); }
    gg.restore();
    if (k < 2.6 && Math.random() < 0.6) { const a = rnd(0, TAU), d = R * rnd(2, 4); addPart({ type: 'px', x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d, vx: -Math.cos(a) * d * 1.6, vy: -Math.sin(a) * d * 1.6, g: 0, life: 0.55, size: rnd(3, 6), color: pick([theme().a, theme().b, '#fff']) }); }
  }

  // ------------------------------------------------------------------ evolution
  function startEvolution() {
    if (!canEvolve() || evoSeq) return; closeModal(); closeTray(); const to = nextForm(); if (!to) return;
    evoSeq = { t: 0, from: S.form, to, done: false }; $('#evoTag').hidden = true; Snd.sfx('evoCharge'); bubbleEl.classList.add('off'); speech.t = 0;
  }
  function evoUpdate(dt) {
    if (!evoSeq) return; evoSeq.t += dt; const c = petCenter();
    if (!evoSeq.done && evoSeq.t >= 2.6) {
      evoSeq.done = true; S.stage++; S.form = evoSeq.to; if (!S.seen.includes(S.form)) S.seen.push(S.form);
      for (const k in S.care) S.care[k] *= 0.6;
      flash = 1; shake = 12; Snd.sfx('evoBoom'); pet.popT = 1; burst(c.x, c.y, 60, { color: [theme().a, theme().b, '#fff', '#ffd23e'], max: 480, life: 1.4 });
      for (let i = 0; i < 3; i++) addPart({ type: 'ring', x: c.x, y: c.y, size: 10, grow: 200 + i * 70, color: i % 2 ? theme().b : theme().a, life: 0.7 + i * 0.2 });
      saveNow(); renderHub();
    }
    if (evoSeq.t >= 3.9) { const info = evoSeq; evoSeq = null; showEvoModal(info); checkAch(); }
  }
  function stageUnlocks(st) {
    const out = [];
    for (const id of GAME_ORDER) if (GAMES[id] && GAMES[id].stage === st) out.push('🎮 ' + T('cp_g_' + id));
    for (const r of ROOMS) if (r.stage === st || (st === 4 && r.stage4free)) { if (!S.owned.rooms.includes(r.id)) S.owned.rooms.push(r.id); out.push(r.icon + ' ' + T('cp_r_' + r.id)); }
    for (const k in THEMES) if (THEMES[k].stage === st) { if (!S.owned.themes.includes(k)) S.owned.themes.push(k); out.push('🎨 ' + T('cp_th_' + k)); }
    for (const a of ACCS) if (a.stage === st) { if (!S.owned.acc.includes(a.id)) S.owned.acc.push(a.id); out.push(a.icon + ' ' + T('cp_ac_' + a.id)); }
    for (const f of FOODS) if (f.stage === st) out.push('🍽️ ' + T('cp_fo_' + f.id));
    return out;
  }
  function showEvoModal(info) {
    const un = stageUnlocks(S.stage); saveNow();
    openModal('evo', T('cp_evo_t'), `<div class="stack center"><div class="evo-big"><canvas id="evoCv" width="360" height="300"></canvas></div>
      <div style="font-size:18px;font-weight:800">${esc(SR('cp_evo_msg', { n: S.name, f: T('cp_f_' + S.form) }))}</div><div class="muted">${esc(SR('cp_fd_' + S.form))}</div>
      ${un.length ? `<div class="sec-h">${T('cp_evo_new')}</div><div class="row" style="justify-content:center">${un.map(u => `<span class="pill gold">${esc(u)}</span>`).join('')}</div>` : ''}
      <button class="btn" id="evoOk" style="min-width:160px">${T('cp_ok')}</button></div>`);
    drawPetTo($('#evoCv'), S.form, false, 62); $('#evoOk').onclick = () => { closeModal(); say(SR('cp_sp_first', { n: S.name })); };
  }

  // ------------------------------------------------------------------ UI: hub
  const statsEl = $('#stats'), dockEl = $('#dock');
  function renderStats() {
    statsEl.innerHTML = ST.map(([k, ic, c]) => `<div class="meter" id="m_${k}" title="${T('cp_s_' + k)}"><span class="ic">${ic}</span><span class="lb">${T('cp_s_' + k)}</span><span class="v" id="v_${k}"></span><div class="bar"><div id="b_${k}" style="--c:${c}"></div></div></div>`).join('')
      + `<div class="xprow"><div class="row"><span id="xpL"></span><span class="nx" id="xpN"></span></div><div class="bar"><div id="xpB"></div></div></div>`;
    updStats(true);
  }
  let lastStatStr = '';
  function updStats(force) {
    if (!S) return; const parts2 = [];
    for (const [k] of ST) { const v = Math.round(S.st[k]); parts2.push(v); }
    const n = S.stage + 1, need = XP_NEED[Math.min(4, n)], prev = XP_NEED[S.stage] || 0, key = parts2.join(',') + '|' + Math.floor(S.xp) + '|' + S.stage + '|' + lang();
    if (!force && key === lastStatStr) return; lastStatStr = key;
    for (const [k] of ST) { const v = Math.round(S.st[k]); const b = $('#b_' + k); if (!b) continue; b.style.width = v + '%'; $('#v_' + k).textContent = v;
      $('#m_' + k).classList.toggle('low', k === 'glitch' ? v > 70 : v < 22); }
    const xl = $('#xpL'), xn = $('#xpN'), xb = $('#xpB'); if (!xl) return;
    if (S.stage >= 4) { xl.textContent = T('cp_xp') + ' ' + Math.floor(S.xp); xn.textContent = T('cp_maxed'); xb.style.width = '100%'; }
    else if (S.stage < 1) { xl.textContent = T('cp_st0'); xn.textContent = ''; xb.style.width = (S.hatch * 10) + '%'; }
    else { xl.textContent = T('cp_xp') + ' ' + Math.floor(S.xp) + ' / ' + need; const ag = AGE_NEED[n] - ageH();
      xn.textContent = S.xp >= need && ag > 0 ? T('cp_readyin', { t: fmtDur(ag * 3600) }) : T('cp_next', { s: T('cp_st' + n) }); xb.style.width = clamp((S.xp - prev) / (need - prev) * 100, 0, 100) + '%'; }
  }
  const DOCK = [['feed', '🍪', 'f'], ['play', '🎮', 'g'], ['clean', '🧹', 'c'], ['sleep', '💡', 'l'], ['shop', '🛍️'], ['diary', '🧠']];
  function renderDock() {
    dockEl.innerHTML = DOCK.map(([k, ic]) => `<button class="dk" id="d_${k}"><b>${ic}</b><span>${T('cp_a_' + k)}</span></button>`).join('');
    $('#d_feed').onclick = () => { Snd.sfx('open'); toggleTray(); };
    $('#d_play').onclick = () => { Snd.sfx('open'); openGames(); };
    $('#d_clean').onclick = () => doSweep();
    $('#d_sleep').onclick = () => { Snd.sfx('tap'); S.sleeping ? wake(false) : sleep(); };
    $('#d_shop').onclick = () => { Snd.sfx('open'); openShop('style'); };
    $('#d_diary').onclick = () => { Snd.sfx('open'); openDiary(); };
    updDock();
  }
  function updDock() {
    if (!S) return; const sl = $('#d_sleep'); if (!sl) return;
    sl.querySelector('b').textContent = S.sleeping ? '☀️' : '💡'; sl.querySelector('span').textContent = T(S.sleeping ? 'cp_a_wake' : 'cp_a_sleep'); sl.classList.toggle('on', !!S.sleeping);
    const cl = $('#d_clean'); if (bugs.length) cl.setAttribute('data-badge', bugs.length); else cl.removeAttribute('data-badge');
    cl.classList.toggle('cd', Date.now() - S.sweepAt < 60000);
    $('#d_feed').classList.toggle('on', !$('#tray').hidden);
  }
  function updTop() {
    if (!S) return; $('#petName').textContent = S.name || T('cp_defname0'); const m = mood();
    $('#petSub').textContent = T('cp_st' + S.stage) + ' · ' + MOOD_EMO[m] + ' ' + T('cp_m_' + m);
    $('#langBtn').textContent = lang() === 'ar' ? 'English' : 'العربية'; updCoins();
  }
  function updCoins() { if (S) $('#coinN').textContent = Math.floor(S.coins); }
  function updCoach() {
    const co = $('#coach'); if (!S || scene !== 'hub') { co.hidden = true; return; }
    let txt = '';
    if (S.stage === 0) txt = T('cp_hatch_hint'); else if (S.tut < 4) txt = SR('cp_tut_' + S.tut, { n: S.name });
    co.hidden = !txt || !$('#tray').hidden || !$('#modal').hidden || !$('#evoTag').hidden; co.textContent = txt;
  }
  function renderHub() {
    renderStats(); renderDock(); updTop(); updCoach();
    const egg = S && S.stage === 0; statsEl.style.visibility = egg ? 'hidden' : ''; dockEl.style.visibility = egg ? 'hidden' : '';
    layout();
  }
  // feed tray
  function toggleTray() { const tr = $('#tray'); if (tr.hidden) { renderTray(); tr.hidden = false; } else tr.hidden = true; updDock(); updCoach(); }
  function closeTray() { $('#tray').hidden = true; updDock(); }
  function renderTray() {
    const tr = $('#tray'); $('#trayT').textContent = T('cp_feed_t'); $('#trayH').textContent = SR('cp_feed_h');
    const list = FOODS.filter(f => !f.stage || S.stage >= f.stage);
    $('#foods').innerHTML = list.map(f => { const fx = Object.entries(f.fx).map(([k, v]) => ({ data: '💾', energy: '⚡', happy: '💗', cur: '✨', glitch: '👾' }[k]) + (v > 0 ? '+' : '') + v).join(' ');
      return `<div class="food ${S.coins < f.price ? 'poor' : ''}" data-food="${f.id}"><canvas width="88" height="88"></canvas><div class="n">${esc(T('cp_fo_' + f.id))}${S.favKnown && S.fav === f.id ? ' ❤️' : ''}</div><div class="p ${f.price ? '' : 'free'}">${f.price ? f.price + ' ¢' : T('cp_free')}</div><div class="fx">${fx}</div></div>`; }).join('');
    tr.querySelectorAll('.food').forEach(el => { const c2 = el.querySelector('canvas').getContext('2d'); c2.scale(2, 2); drawFood(c2, el.dataset.food, 22, 23, 15, 0); el.addEventListener('pointerdown', foodDown); });
  }
  function foodDown(e) {
    if (!S || S.stage < 1) return; Snd.resume(); e.preventDefault(); const el = e.currentTarget, r = el.getBoundingClientRect();
    drag = { id: el.dataset.food, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, sx: r.left + r.width / 2, sy: r.top + r.height * 0.3, moved: false, pid: e.pointerId };
  }
  window.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.pid) return; drag.x = e.clientX; drag.y = e.clientY; if (Math.hypot(drag.x - drag.x0, drag.y - drag.y0) > 10) drag.moved = true; ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = clock; });
  window.addEventListener('pointerup', (e) => {
    if (!drag || e.pointerId !== drag.pid) return; const d = drag; drag = null;
    if (!d.moved) { const F = FOODS.find(f => f.id === d.id); if (S.coins < F.price) { toast(T('cp_nocoins')); Snd.sfx('error'); return; } flyFood = { id: d.id, x: d.sx, y: d.sy, x0: d.sx, y0: d.sy, t: 0 }; Snd.sfx('whoosh'); return; }
    if (hitPet(d.x, d.y, 0.5)) feed(d.id); else Snd.sfx('close');
  });
  window.addEventListener('pointercancel', () => { drag = null; touch = null; });
  function updFlyFood(dt) {
    if (!flyFood) return; const f = flyFood, c = petCenter(); f.t += dt / 0.5; const k = Math.min(1, f.t);
    f.x = lerp(f.x0, c.x, k); f.y = lerp(f.y0, c.y + c.R * 0.15, k) - Math.sin(k * Math.PI) * 90;
    if (k >= 1) { flyFood = null; feed(f.id); }
  }

  // ------------------------------------------------------------------ modals
  const modalEl = $('#modal'), mbox = $('#mbox'); let modalKind = null, modalArg = null;
  function openModal(kind, title, body, tabs, noClose) {
    modalKind = kind; mbox.innerHTML = `<div class="mh"><h2 ${kind === 'result' || kind === 'evo' ? 'style="text-align:center"' : ''}>${title}</h2>${noClose ? '' : '<button class="ib" id="mX" title="Close">✕</button>'}</div>${tabs || ''}<div class="mb">${body}</div>`;
    modalEl.hidden = false; if (window.Mal3abPopButtons) window.Mal3abPopButtons(); const x = $('#mX'); if (x) x.onclick = () => { Snd.sfx('close'); closeModal(); }; updCoach();
  }
  function closeModal() {
    if (modalEl.hidden) return; const k = modalKind; modalEl.hidden = true; modalKind = null; mbox.innerHTML = '';
    if (k === 'pause' && scene === 'game') MG.paused = false; updCoach();
  }
  modalEl.addEventListener('pointerdown', (e) => { if (e.target === modalEl && !['pause', 'result', 'evo', 'name', 'confirm', 'intro'].includes(modalKind)) { Snd.sfx('close'); closeModal(); } });
  function rerenderModal() {
    const k = modalKind; if (!k) return;
    if (k === 'games') openGames(); else if (k === 'shop') openShop(modalArg); else if (k === 'diary') openDiary(); else if (k === 'menu') openMenu(); else if (k === 'how') openHow(); else if (k === 'pause') openPause(); else if (k === 'intro') showIntro(); else if (k === 'result') showResult();
  }
  function openGames() {
    const fg = favGame();
    const body = GAME_ORDER.filter(id => GAMES[id]).map(id => { const G = GAMES[id], lock = S.stage < G.stage, best = S.best[id] || 0, md = S.medals[id] || 0;
      return `<div class="gcard ${lock ? 'lock' : ''}"><div class="gi">${G.icon}</div><div class="gn">${T('cp_g_' + id)} ${fg === id ? '❤️' : ''}</div>
        <div class="gb">${lock ? `<span class="pill">🔒</span>` : `<button class="btn small" data-g="${id}">${T('cp_play')}</button>`}<span class="gs">${lock ? '' : T('cp_energy_cost', { n: G.energy })}</span></div>
        <div class="gd">${esc(SR('cp_gd_' + id))}<br><span class="gs">${lock ? esc(T('cp_unlock_at', { s: T('cp_st' + G.stage) })) : `${T('cp_best')}: ${best} ${['', '🥉', '🥈', '🥇'][md]} · ${esc(T('cp_medal_need', { n: G.medals[0] }))}`}</span></div></div>`; }).join('');
    openModal('games', T('cp_games_t'), `<div class="stack">${body}</div>`);
    mbox.querySelectorAll('[data-g]').forEach(b => b.onclick = () => startGame(b.dataset.g));
  }
  function itemState(kind, it) {
    const owned = S.owned[kind].includes(it.id) || (!it.secret && !it.price && (!it.stage || S.stage >= it.stage));
    if (owned) return 'own'; if (it.secret) return 'secret'; if (it.stage && !it.price) return 'stage'; return 'buy';
  }
  function openShop(tab) {
    tab = tab || 'style'; modalArg = tab; const tabs = `<div class="tabs">${['style', 'rooms', 'themes'].map(k => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${T('cp_t_' + k)}</button>`).join('')}</div>`;
    let body = `<div class="row" style="justify-content:space-between"><span class="muted">🪙 <b style="color:var(--acc)">${Math.floor(S.coins)} ¢</b></span></div>`;
    const card = (kind, it, icon, name, extraCls, swatch) => { const st = itemState(kind, it); let btn = '', ds = '';
      const eqd = kind === 'acc' ? (S.eq.head === it.id || S.eq.face === it.id) : kind === 'rooms' ? S.eq.room === it.id : S.eq.theme === it.id;
      if (st === 'own') btn = kind === 'acc' ? `<button class="btn small ${eqd ? 'sec' : ''}" data-act="eq" data-k="${kind}" data-id="${it.id}">${T(eqd ? 'cp_takeoff' : 'cp_wear')}</button>` : (eqd ? `<span class="pill gold">✓ ${T('cp_inuse')}</span>` : `<button class="btn small" data-act="eq" data-k="${kind}" data-id="${it.id}">${T('cp_use')}</button>`);
      else if (st === 'secret') { btn = `<span class="pill">🤫 ${T('cp_secret')}</span>`; ds = SR('cp_secret_d'); }
      else if (st === 'stage') { btn = `<span class="pill">🔒</span>`; ds = T('cp_unlock_at', { s: T('cp_st' + it.stage) }); }
      else btn = `<button class="btn small" data-act="buy" data-k="${kind}" data-id="${it.id}" ${S.coins < it.price ? 'disabled' : ''}>${T('cp_buy')} · ${it.price} ¢</button>`;
      const hid = st === 'secret'; return `<div class="card ${eqd ? 'on' : ''} ${st === 'stage' || hid ? 'lock' : ''} ${extraCls || ''}">${swatch || `<div class="ico">${hid ? '❔' : icon}</div>`}<div class="nm">${hid ? '???' : esc(name)}</div><div class="ds">${esc(ds)}</div>${btn}</div>`; };
    if (tab === 'style') {
      for (const slot of ['head', 'face']) body += `<div class="sec-h">${T('cp_' + slot)}</div><div class="grid">${ACCS.filter(a => a.slot === slot).map(a => card('acc', a, a.icon, T('cp_ac_' + a.id))).join('')}</div>`;
    } else if (tab === 'rooms') body += `<div class="grid">${ROOMS.map(r => card('rooms', r, r.icon, T('cp_r_' + r.id))).join('')}</div>`;
    else body += `<div class="grid">${THEME_ORDER.map(k => { const th = THEMES[k], it = Object.assign({ id: k }, th); const st = itemState('themes', it);
      return card('themes', it, '', T('cp_th_' + k), '', `<div class="swatch" style="background:${st === 'secret' ? '#1a1f35' : `linear-gradient(120deg, ${th.bg2}, ${th.a} 55%, ${th.b})`}"></div>`); }).join('')}</div>`;
    openModal('shop', T('cp_shop_t'), body, tabs);
    mbox.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { Snd.sfx('tap'); openShop(b.dataset.tab); });
    mbox.querySelectorAll('[data-act]').forEach(b => b.onclick = () => shopAct(b.dataset.act, b.dataset.k, b.dataset.id));
  }
  function shopAct(act, kind, id) {
    const list = kind === 'acc' ? ACCS : kind === 'rooms' ? ROOMS : THEME_ORDER.map(k => Object.assign({ id: k }, THEMES[k])); const it = list.find(x => x.id === id); if (!it) return;
    const name = kind === 'acc' ? T('cp_ac_' + id) : kind === 'rooms' ? T('cp_r_' + id) : T('cp_th_' + id);
    if (act === 'buy') { if (S.coins < it.price) { toast(T('cp_nocoins')); Snd.sfx('error'); return; } S.coins -= it.price; S.owned[kind].push(id); Snd.sfx('buy'); toast('🛍️ ' + T('cp_bought', { s: name })); act = 'eq'; checkAch(); }
    if (act === 'eq') {
      if (kind === 'acc') { const slot = it.slot; S.eq[slot] = S.eq[slot] === id ? null : id; if (S.eq[slot]) { emote('happy', 1.5); pet.popT = 0.6; } }
      else if (kind === 'rooms') S.eq.room = id; else { S.eq.theme = id; applyThemeVars(); }
      Snd.sfx('tap');
    }
    saveNow(); updCoins(); openShop(modalArg);
  }
  function applyThemeVars() { const th = theme(); document.documentElement.style.setProperty('--neon', th.a); document.documentElement.style.setProperty('--neon2', th.b); }
  function openDiary() {
    const F = S.form, uh = usualHour(), fg = favGame(), st = careStyle(), tot = Math.max(1, ['aff', 'play', 'order', 'chaos'].reduce((a, k) => a + S.care[k], 0));
    const colors = { aff: '#ff6fb5', play: '#3ef0ff', order: '#3dffa8', chaos: '#a98bff' };
    let b = `<div class="kv"><span>${T('cp_d_name')}</span><b>${esc(S.name)}</b><span>${T('cp_d_form')}</span><b>${esc(T('cp_f_' + F))} <span class="muted">— ${esc(SR('cp_fd_' + F))}</span></b>
      <span>${T('cp_d_stage')}</span><b>${T('cp_st' + S.stage)}</b><span>${T('cp_d_age')}</span><b>${S.born ? fmtDur((Date.now() - S.born) / 1000) : '—'}</b><span>${T('cp_xp')}</span><b>${Math.floor(S.xp)}</b></div>`;
    b += `<div class="sec-h">${T('cp_d_style')}</div><div class="style-bars">${['aff', 'play', 'order', 'chaos'].map(k => `<div class="sb"><span>${T('cp_c_' + k)}</span><div class="bar"><div style="--c:${colors[k]};width:${Math.round(S.care[k] / tot * 100)}%"></div></div><span class="muted">${Math.round(S.care[k] / tot * 100)}%</span></div>`).join('')}</div>`;
    b += `<div class="sec-h">${T('cp_d_tree')}</div>`;
    TREE.forEach((row, i) => { b += `<div class="tree" style="grid-template-columns:repeat(${row.length},1fr)"><div class="row-l">${T('cp_st' + (i + 1))}</div>${row.map(f => `<div class="tn ${f === F ? 'cur' : ''}"><canvas width="120" height="104" data-form="${f}" data-sil="${S.seen.includes(f) ? 0 : 1}"></canvas>${S.seen.includes(f) ? esc(T('cp_f_' + f)) : T('cp_d_unknownf')}</div>`).join('')}</div>`; });
    b += `<div class="sec-h">${esc(T('cp_d_habits', { n: S.name }))}</div><div class="kv">
      <span>${T('cp_d_usual')}</span><b>${uh != null ? hourLabel(uh) : `<span class="muted">${SR('cp_d_learning')}</span>`}</b>
      <span>${T('cp_d_favfood')}</span><b>${S.favKnown ? esc(T('cp_fo_' + S.fav)) + ' ❤️' : `<span class="muted">${SR('cp_d_learning')}</span>`}</b>
      <span>${T('cp_d_favgame')}</span><b>${fg ? esc(T('cp_g_' + fg)) : `<span class="muted">${SR('cp_d_learning')}</span>`}</b>
      <span>${T('cp_d_touch')}</span><b>${SR('cp_t_' + (st || 'new'))}</b>
      <span>${T('cp_d_visits')}</span><b>${S.visitCount}</b><span>${T('cp_d_streak')}</span><b>${S.streak} 🔥</b></div>`;
    const got = Object.keys(S.ach).length;
    b += `<div class="sec-h">${T('cp_d_ach')} · ${got}/${ACH.length}</div><div class="list">${ACH.map(([id, e]) => `<div class="li ${S.ach[id] ? '' : 'no'}"><span class="e">${e}</span><div><b>${T('cp_ah_' + id)}</b><small>${SR('cp_ahd_' + id)}</small></div>${S.ach[id] ? '✓' : ''}</div>`).join('')}</div>`;
    const fs = SECRETS.filter(k => S.secrets[k]).length;
    b += `<div class="sec-h">${T('cp_d_secrets')} · ${esc(T('cp_d_found', { n: fs, m: SECRETS.length }))}</div><div class="list">${SECRETS.map(k => `<div class="li ${S.secrets[k] ? '' : 'no'}"><span class="e">${S.secrets[k] ? '🔓' : '🔒'}</span><div><b>${S.secrets[k] ? T('cp_se_' + k) : '???'}</b><small>${esc(SR('cp_sh_' + k))}</small></div></div>`).join('')}</div>`;
    openModal('diary', '🧠 ' + T('cp_diary_t'), b);
    mbox.querySelectorAll('canvas[data-form]').forEach(c2 => drawPetTo(c2, c2.dataset.form, c2.dataset.sil === '1', 27));
  }
  function openMenu() {
    const b = `<div class="stack"><button class="btn" id="mmRes">${T('cp_resume')}</button><button class="btn sec" id="mmHow">${T('cp_howto')}</button><button class="btn sec" id="mmName">${T('cp_rename')}</button>
      <button class="btn sec" id="mmSnd">${T('cp_sound')}: ${T(Snd.on ? 'cp_on' : 'cp_off')}</button>${S.secrets.konami ? `<button class="btn sec" id="mmPix">${T('cp_pixel')}: ${T(S.pixel ? 'cp_on' : 'cp_off')}</button>` : ''}
      <button class="btn sec" id="mmTitle">${T('cp_totitle')}</button><button class="btn danger" id="mmReset">${T('cp_reset')}</button></div>`;
    openModal('menu', T('cp_menu'), b);
    $('#mmRes').onclick = () => closeModal(); $('#mmHow').onclick = () => openHow(); $('#mmName').onclick = () => openName(true);
    $('#mmSnd').onclick = () => { Snd.on = !Snd.on; settings.sound = Snd.on; saveSettings(); Snd.sfx('tap'); openMenu(); };
    if ($('#mmPix')) $('#mmPix').onclick = () => { S.pixel = !S.pixel; saveNow(); openMenu(); };
    $('#mmTitle').onclick = () => { closeModal(); saveNow(); setScene('title'); };
    $('#mmReset').onclick = () => confirmBox(SR('cp_resetq', { n: S.name }), T('cp_yesreset'), () => { try { localStorage.removeItem(KEY); } catch (e) {} S = null; bugs.length = 0; closeModal(); setScene('title'); });
  }
  function openHow() {
    const b = `<ul class="how">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<li>${esc(SR('cp_how_' + i))}</li>`).join('')}</ul><div class="muted">${esc(SR('cp_how_keys'))}</div><button class="btn" id="howOk">${T('cp_ok')}</button>`;
    openModal('how', T('cp_howto'), b); $('#howOk').onclick = () => closeModal();
  }
  function confirmBox(text, yes, fn) {
    openModal('confirm', T('cp_reset'), `<div class="muted" style="font-size:15px">${esc(text)}</div><div class="row end"><button class="btn sec" id="cfN">${T('cp_cancel')}</button><button class="btn danger" id="cfY">${esc(yes)}</button></div>`);
    $('#cfN').onclick = () => closeModal(); $('#cfY').onclick = () => { fn(); };
  }
  function defaultName() { const n = window.Auth && Auth.name && Auth.name(); return n ? SR('cp_defname', { n: String(n).slice(0, 10) }) : SR('cp_defname0'); }
  function openName(rename) {
    openModal('name', T('cp_name_h'), `<input class="inp" id="nmIn" maxlength="16" placeholder="${T('cp_name_p')}" autocomplete="off"><div class="muted">${SR('cp_name_hint')}</div>
      <div class="row end">${rename ? `<button class="btn sec" id="nmC">${T('cp_cancel')}</button>` : `<button class="btn sec" id="nmC">${T('cp_back')}</button>`}<button class="btn" id="nmOk">${T('cp_ok')}</button></div>`, '', true);
    const inp = $('#nmIn'); inp.value = rename ? S.name : defaultName(); inp.dataset.auto = rename ? '0' : '1'; inp.oninput = () => inp.dataset.auto = '0';
    setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) {} }, 60);
    const ok = () => { const v = inp.value.trim().replace(/\s+/g, ' ').slice(0, 16) || defaultName(); closeModal();
      if (rename) { S.name = v; saveNow(); updTop(); say(SR('cp_sp_first', { n: v })); } else newPet(v);
      if (/^(neo|نيو)$/i.test(v)) setTimeout(() => { if (S && S.stage >= 1) { findSecret('neo'); say(SR('cp_sp_neo', { n: v })); } else if (S) S.flags.neoPending = true; }, 400); };
    $('#nmOk').onclick = ok; inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); e.stopPropagation(); };
    $('#nmC').onclick = () => closeModal();
  }
  document.addEventListener('mal3abready', () => { const inp = $('#nmIn'); if (inp && inp.dataset.auto === '1') inp.value = defaultName(); });
  // terminal
  const termLines = [];
  function openTerminal() {
    openModal('term', '⌨️ ' + T('cp_term_t'), `<div class="term" id="tmOut"></div><div class="term-in"><input class="inp" id="tmIn" placeholder="${T('cp_term_ph')}" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn small" id="tmGo">${T('cp_term_run')}</button></div>`);
    if (!termLines.length) termLines.push(['', SR('cp_tm_boot')]); renderTerm();
    const inp = $('#tmIn'), run = () => { const v = inp.value; inp.value = ''; if (v.trim()) termCmd(v.trim()); };
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') run(); }; $('#tmGo').onclick = run; setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
  }
  function renderTerm() { const o = $('#tmOut'); if (!o) return; o.innerHTML = termLines.map(([c, l]) => `<div class="${c}">${esc(l)}</div>`).join(''); o.scrollTop = o.scrollHeight; }
  function termCmd(raw) {
    const c = raw.toLowerCase().replace(/\s+/g, ' '), out = (s, cl) => termLines.push([cl || '', s]); out('$ ' + raw, 'u');
    if (c === 'help') out(SR('cp_tm_help'));
    else if (c === 'status') out(ST.map(([k]) => T('cp_s_' + k) + ': ' + Math.round(S.st[k])).join(' | ') + ' | ' + T('cp_m_' + mood()));
    else if (c === 'whoami') out(S.name + ' (' + T('cp_f_' + S.form) + ')');
    else if (c === 'ls') out('pet.dat  bugs.log  dreams.hex  secrets/');
    else if (c === 'cat dreams.hex' || c === 'cat dreams') out(SR('cp_tm_dreams'));
    else if (c.startsWith('cd secrets') || c.startsWith('ls secrets') || c.startsWith('cat secrets')) out(SR('cp_tm_secrets'), 'e');
    else if (c === 'cat bugs.log') out('bugs: ' + bugs.length + '  squashed: ' + S.counts.squash);
    else if (c === 'cat pet.dat') out(JSON.stringify({ name: S.name, form: S.form, xp: Math.floor(S.xp), care: Object.fromEntries(Object.entries(S.care).map(([k, v]) => [k, Math.round(v)])) }));
    else if (c === 'date') out(new Date().toString().slice(0, 24));
    else if (/^rm( -rf)? (bugs|bugs\/|\*)$/.test(c)) { if (Date.now() - S.rmAt < 3600e3) out(SR('cp_tm_rmcd'), 'e'); else { S.rmAt = Date.now(); const n = bugs.length; bugs.length = 0; S.bugs = 0; addSt({ glitch: -3 * n }); out(SR('cp_tm_rm', { n })); markDirty(); } }
    else if (c === 'sudo love' || c === 'sudo pet' || c === 'sudo hug') { if (S.sudoDay === dayKey()) out(SR('cp_tm_sudodone')); else { S.sudoDay = dayKey(); addSt({ happy: 12 }); emote('love', 2); out(SR('cp_tm_sudo')); markDirty(); } }
    else if (c === 'hello world' || c === 'hello, world' || c === 'hello world!' || c === 'hello, world!' || c === 'print("hello world")' || c === 'echo hello world') { out(SR('cp_tm_hello')); findSecret('hello'); say(SR('cp_sp_hello')); }
    else if (c === 'uuddlrlrba' || c === 'up up down down left right left right b a') { out(SR('cp_tm_konami')); onKonami(); }
    else if (c === 'neo' || c === 'there is no spoon' || c === 'matrix') out(SR('cp_tm_neo'));
    else if (c === 'clear') termLines.length = 0;
    else if (c === 'exit' || c === 'quit') { closeModal(); return; }
    else out(SR('cp_tm_unknown', { c: raw.slice(0, 30) }), 'e');
    Snd.sfx('tap'); renderTerm();
  }

  // ------------------------------------------------------------------ toasts
  function toast(text, cls) {
    const box = $('#toasts'), el = document.createElement('div'); el.className = 'toast ' + (cls || ''); el.textContent = text; box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 3400);
  }

  // ------------------------------------------------------------------ mini-game framework
  const MG = { id: null, g: null, state: null, t: 0, paused: false, res: null };
  function startGame(id, quick) {
    const G = GAMES[id]; if (!G || !S) return;
    if (S.stage < G.stage) return;
    if (S.sleeping) { toast(T('cp_shh')); return; }
    if (S.st.energy < G.energy) { closeModal(); if (scene === 'game') exitGame(); toast(T('cp_tired')); say(SR('cp_sp_tired')); emote('sad', 1.5); return; }
    closeModal(); closeTray(); Snd.resume();
    MG.id = id; MG.g = G.create(API); MG.state = 'intro'; MG.t = 3; MG.paused = false; MG.res = null; parts.length = 0;
    setScene('game');
    if (quick) beginGame(); else { Snd.sfx('open'); showIntro(); }
  }
  function showIntro() {
    const G = GAMES[MG.id]; if (!G || MG.state !== 'intro') return; const best = S.best[MG.id] || 0, md = S.medals[MG.id] || 0;
    openModal('intro', G.icon + ' ' + T('cp_g_' + MG.id), `<div class="stack center"><div class="muted" style="font-size:15px">${esc(SR('cp_gd_' + MG.id))}</div>
      <div class="row" style="justify-content:center"><span class="pill">🎮 ${esc(SR('cp_gh_' + MG.id))}</span></div>
      <div class="row" style="justify-content:center"><span class="pill gold">${T('cp_best')}: ${best} ${['', '🥉', '🥈', '🥇'][md]}</span><span class="pill">⚡ ${esc(T('cp_ig_cost', { n: G.energy }))}</span></div>
      <div class="muted">${esc(T('cp_medal_need', { n: G.medals[0] }))}</div>
      <div class="row" style="justify-content:center"><button class="btn sec" id="igBack">${T('cp_back')}</button><button class="btn" id="igGo">▶ ${T('cp_ig_go')}</button></div>
      ${LY.mobile ? '' : `<div class="muted" style="font-size:12px">${esc(SR('cp_ig_keys'))}</div>`}</div>`, '', true);
    $('#igGo').onclick = () => beginGame(); $('#igBack').onclick = () => cancelIntro();
  }
  function beginGame() {
    const G = GAMES[MG.id]; if (!G || !MG.g || MG.state !== 'intro') return;
    if (S.st.energy < G.energy) { closeModal(); exitGame(); toast(T('cp_tired')); return; }
    if (modalKind === 'intro') closeModal(); Snd.resume();
    S.st.energy -= G.energy; S.games[MG.id] = (S.games[MG.id] || 0) + 1; S.counts.games++; addCare({ play: 4 }); if (isNight()) addCare({ chaos: 0.8 }); if (S.tut === 3) advanceTut(); markDirty();
    MG.state = 'count'; MG.t = 3; MG.paused = false;
  }
  function cancelIntro() { if (MG.state !== 'intro') return; Snd.sfx('close'); closeModal(); MG.g = null; MG.id = null; MG.res = null; parts.length = 0; setScene('hub'); }
  function mgUpdate(dt) {
    if (!MG.g || MG.paused) return;
    if (MG.state === 'count') { const a = Math.ceil(MG.t); MG.t -= dt; const b = Math.ceil(MG.t); if (b !== a && b > 0) Snd.sfx('tap'); if (MG.t <= 0) { MG.state = 'play'; Snd.sfx('level'); } if (MG.g.idle) MG.g.idle(dt); }
    else if (MG.state === 'play') { MG.g.update(dt); if (MG.g.over) finishGame(); }
    else if (MG.g.idle) MG.g.idle(dt);
    updMgHud();
  }
  function finishGame() {
    if (MG.state === 'over') return; MG.state = 'over'; const G = GAMES[MG.id], sc = Math.floor(MG.g.score || 0);
    const medal = sc >= G.medals[2] ? 3 : sc >= G.medals[1] ? 2 : sc >= G.medals[0] ? 1 : 0, best = S.best[MG.id] || 0, nb = sc > best;
    if (nb) S.best[MG.id] = sc; S.medals[MG.id] = Math.max(S.medals[MG.id] || 0, medal);
    const r = G.reward(sc, medal); let coins = Math.round((r.coins || 0) * (S.stage >= 4 ? 1.25 : 1)); if (favGame() === MG.id) r.fx.happy = (r.fx.happy || 0) + 3;
    addSt(r.fx); if (r.care) addCare(r.care); addXP(r.xp || 0); S.coins += coins;
    MG.res = { sc, medal, nb, coins, xp: Math.round(r.xp || 0), fx: r.fx };
    Snd.sfx(medal ? 'win' : 'lose'); checkAch(); saveNow();
    setTimeout(() => { if (scene === 'game' && MG.state === 'over') showResult(); }, 800);
  }
  function showResult() {
    const r = MG.res, G = GAMES[MG.id]; if (!r) return;
    const ttl = r.medal === 3 ? T('cp_gold') : r.medal === 2 ? T('cp_silver') : r.medal === 1 ? T('cp_bronze') : T('cp_gameover');
    const pills = Object.entries(r.fx).filter(([, v]) => Math.round(v)).map(([k, v]) => { const good = k === 'glitch' ? v < 0 : v > 0; return `<span class="pill ${good ? 'up' : 'down'}">${{ data: '💾', energy: '⚡', happy: '💗', cur: '✨', glitch: '👾' }[k]} ${v > 0 ? '+' : ''}${Math.round(v)}</span>`; }).join('');
    const canAgain = S.st.energy >= G.energy;
    openModal('result', ttl, `<div class="stack center"><div class="big-medal">${['💥', '🥉', '🥈', '🥇'][r.medal]}</div><div class="res-score">${r.sc}</div>
      <div class="muted">${T('cp_best')}: ${Math.max(r.sc, S.best[MG.id] || 0)} ${r.nb && r.sc > 0 ? ` · <span class="newbest">${T('cp_newbest')}</span>` : ''}</div>
      ${r.medal ? '' : `<div class="muted">${esc(T('cp_medal_need', { n: G.medals[0] }))}</div>`}
      <div class="sec-h">${T('cp_rewards')}</div><div class="row" style="justify-content:center"><span class="pill gold">+${r.coins} ¢</span><span class="pill gold">+${r.xp} XP</span>${pills}</div>
      ${canAgain ? '' : `<div class="muted">${esc(T('cp_tired'))}</div>`}
      <div class="row" style="justify-content:center"><button class="btn sec" id="rsBack">${T('cp_toroom')}</button><button class="btn" id="rsAgain" ${canAgain ? '' : 'disabled'}>${T('cp_again')}</button></div></div>`, '', true);
    $('#rsBack').onclick = () => { closeModal(); exitGame(); }; $('#rsAgain').onclick = () => { const id = MG.id; closeModal(); startGame(id, true); };
  }
  function exitGame() { const r = MG.res; MG.g = null; MG.id = null; parts.length = 0; setScene('hub'); if (r) { say(SR(r.medal ? 'cp_sp_mgwin' : 'cp_sp_mglose')); emote(r.medal ? 'happy' : 'surprised', 1.5); } }
  function pauseGame() { if (scene !== 'game' || MG.state === 'over' || MG.state === 'intro' || MG.paused) return; MG.paused = true; openPause(); }
  function openPause() {
    openModal('pause', '⏸ ' + T('cp_paused'), `<div class="stack"><button class="btn" id="psR">${T('cp_resume')}</button><button class="btn sec" id="psRe">${T('cp_restart')}</button><button class="btn sec" id="psS">${T('cp_sound')}: ${T(Snd.on ? 'cp_on' : 'cp_off')}</button><button class="btn danger" id="psQ">${T('cp_quit')}</button></div>`, '', true);
    $('#psR').onclick = () => { closeModal(); MG.paused = false; };
    $('#psRe').onclick = () => { closeModal(); MG.g = GAMES[MG.id].create(API); MG.state = 'count'; MG.t = 3; MG.paused = false; parts.length = 0; };
    $('#psS').onclick = () => { Snd.on = !Snd.on; settings.sound = Snd.on; saveSettings(); openPause(); };
    $('#psQ').onclick = () => { closeModal(); MG.res = null; MG.g = null; setScene('hub'); };
  }
  let hudKey = '';
  function updMgHud() {
    const g2 = MG.g; if (!g2) return; const G = GAMES[MG.id];
    const lives = g2.maxLives ? '❤️'.repeat(Math.max(0, g2.lives)) + '🖤'.repeat(Math.max(0, g2.maxLives - g2.lives)) : '';
    const key = [Math.floor(g2.score), g2.level, lives, g2.health != null ? Math.round(g2.health) : '', lang()].join('|'); if (key === hudKey) return; hudKey = key;
    $('#mgName').textContent = G.icon + ' ' + T('cp_g_' + MG.id); $('#mgScoreL').textContent = T('cp_score'); $('#mgScore').textContent = Math.floor(g2.score);
    $('#mgLvlL').textContent = T('cp_level'); $('#mgLvl').textContent = g2.level || 1; $('#mgBestL').textContent = T('cp_best'); $('#mgBest').textContent = Math.max(S.best[MG.id] || 0, Math.floor(g2.score));
    $('#mgLives').hidden = !g2.maxLives; $('#mgLives').textContent = lives;
    $('#mgHealth').hidden = g2.health == null; if (g2.health != null) { const f = $('#mgHealthF'); f.style.width = clamp(g2.health, 0, 100) + '%'; f.style.setProperty('--c', g2.health > 50 ? 'var(--green)' : g2.health > 25 ? '#ffd23e' : 'var(--red)'); }
  }
  function mgDraw(gg) {
    if (!MG.g) return; MG.g.draw(gg); drawParts(gg, false); drawParts(gg, true);
    if (MG.state === 'count') { const n = Math.ceil(MG.t), k = MG.t % 1; gg.save(); gg.globalAlpha = Math.min(1, k * 2); gg.fillStyle = '#fff'; gg.font = `900 ${Math.min(W, H) * 0.22 * (1 + (1 - k) * 0.3)}px ui-monospace, Consolas, monospace`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; glowFill(gg, theme().a, 30); gg.fillText(n > 0 ? String(n) : '', W / 2, H / 2); noGlow(gg); gg.restore();
      if (MG.g.hint) { gg.fillStyle = 'rgba(255,255,255,.85)'; gg.font = '700 16px Segoe UI, system-ui, sans-serif'; gg.textAlign = 'center'; gg.fillText(MG.g.hint(), W / 2, H / 2 + Math.min(W, H) * 0.18); } }
    else if (MG.state === 'play' && MG.g.goT == null) MG.g.goT = 0.8;
    if (MG.g.goT > 0) { MG.g.goT -= 1 / 60; gg.save(); gg.globalAlpha = clamp(MG.g.goT * 2, 0, 1); gg.fillStyle = theme().a; gg.font = `900 ${Math.min(W, H) * 0.16}px Segoe UI, system-ui, sans-serif`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; glowFill(gg, theme().a, 30); gg.fillText(T('cp_go'), W / 2, H / 2); noGlow(gg); gg.restore(); }
  }
  function mgBg(gg, hue) {
    const th = theme(); const gr = gg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, th.bg1); gr.addColorStop(1, th.bg2); gg.fillStyle = gr; gg.fillRect(0, 0, W, H);
    gg.strokeStyle = hue || th.a; gg.globalAlpha = 0.08; gg.lineWidth = 1; const s = 40, off = (clock * 10) % s; for (let x = -off; x < W; x += s) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, H); gg.stroke(); } for (let y = off; y < H; y += s) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
    gg.globalAlpha = 1;
  }
  const API = {
    get W() { return W; }, get H() { return H; }, get time() { return clock; }, get top() { const r = $('#mghud').getBoundingClientRect(); return (r.bottom || 52) + 6; },
    get R() { return LY.R; }, mobile: () => LY.mobile, pet: (gg, x, y, R, extra) => compositePet(gg, x, y, R, petOpts(Object.assign({ eye: 'normal', mouth: 'smile', open: 1, blush: 0, sx: 1, sy: 1, glitch: 0, acc: { head: S.eq.head, face: S.eq.face }, sleeping: false }, extra))),
    sfx: (n, a) => Snd.sfx(n, a), part: addPart, burst, float: floatText, shake: (n) => { shake = Math.max(shake, n); }, flash: (n) => { flash = Math.max(flash, n); },
    theme, T, SR, rnd, ri, clamp, lerp, pick, hr, hsl, rr, ell, heart, glowFill, noGlow, bg: mgBg, food: drawFood, bug: drawBug, get stage() { return S.stage; },
  };

  // ------------------------------------------------------------------ scenes
  function setScene(sc) {
    scene = sc; const hubEl = $('#hub'), title = $('#title'), hud = $('#mghud');
    hubEl.hidden = sc !== 'hub'; title.hidden = sc !== 'title'; hud.hidden = sc !== 'game';
    if (sc !== 'hub') { bubbleEl.classList.add('off'); speech.t = 0; $('#evoTag').hidden = true; }
    if (sc === 'title') renderTitle(); if (sc === 'hub') { syncBugs(); renderHub(); } if (sc === 'game') { hudKey = ''; updMgHud(); }
    layout(); updCoach();
  }
  function renderTitle() {
    $('#tLogo').textContent = T('cp_title'); $('#tLogo').setAttribute('data-text', T('cp_title')); $('#tLang').textContent = lang() === 'ar' ? 'English' : 'العربية';
    titleSv = loadSave(); const has = !!titleSv;
    $('#tBtns').innerHTML = has ? `<button class="btn" id="tbC">▶ ${T('cp_continue')}</button><button class="btn sec" id="tbH">${T('cp_howto')}</button><button class="btn sec" id="tbN">${T('cp_newpet')}</button>`
      : `<button class="btn" id="tbS">🥚 ${T('cp_start')}</button><button class="btn sec" id="tbH">${T('cp_howto')}</button>`;
    if ($('#tbC')) $('#tbC').onclick = () => { Snd.resume(); Snd.sfx('open'); continueGame(); };
    if ($('#tbS')) $('#tbS').onclick = () => { Snd.resume(); Snd.sfx('open'); openName(false); };
    if ($('#tbN')) $('#tbN').onclick = () => { Snd.resume(); const old = loadSave(); confirmBox(SR('cp_resetq', { n: old ? old.name : '' }), T('cp_yesreset'), () => { closeModal(); openName(false); }); };
    $('#tbH').onclick = () => { Snd.resume(); openHow(); };
  }
  function newPet(name) {
    S = fresh(); S.name = name; bugs.length = 0; pet.x = pet.tx = LY.cx; termLines.length = 0; saveNow(); applyThemeVars(); setScene('hub');
    if (/^(neo|نيو)$/i.test(name)) S.flags.neoPending = true;
  }
  function continueGame() {
    S = loadSave(); if (!S) { openName(false); return; } applyThemeVars(); bugs.length = 0;
    const away = (Date.now() - S.last) / 1000;
    let sum = null; if (S.stage >= 1 && away > 90) sum = catchUp(away); S.last = Date.now();
    pet.x = pet.tx = LY.cx; setScene('hub');
    if (S.stage >= 1) {
      const sinceVisit = (Date.now() - (S.lastVisit || 0)) / 1000; if (sinceVisit > 1800) newVisit(false);
      setTimeout(() => { if (scene === 'hub') greet(away); }, 900); if (sum) setTimeout(() => awaySummary(sum), 400);
      checkAch();
    }
    saveNow();
  }

  // ------------------------------------------------------------------ input
  cv.addEventListener('pointerdown', (e) => {
    Snd.resume(); const x = e.clientX, y = e.clientY; ptr.x = x; ptr.y = y; ptr.t = clock;
    if (scene === 'game') { if (MG.g && MG.state === 'play' && !MG.paused && MG.g.down) MG.g.down(x, y, e); return; }
    if (scene === 'title') { pet.sqv += 6; Snd.sfx('squish'); return; }
    if (scene !== 'hub' || !S || evoSeq || hatchSeq) return;
    if (S.stage === 0) { if (hitPet(x, y, 0.3)) tapSeed(); return; }
    let best = null, bd = 1e9; for (const b of bugs) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } }
    if (best && bd < Math.max(30, LY.R * 0.45)) { squash(best); return; }
    if (ghost && Math.hypot(ghost.x - x, ghost.y - y) < 44) { burst(ghost.x, ghost.y, 20, { color: ['#dfe9ff', '#a8c4ff'] }); if (!findSecret('ghost')) addCoins(5, ghost.x, ghost.y); say(SR('cp_sp_ghost')); ghost = null; return; }
    if (shootStar && Math.hypot(shootStar.x - x, shootStar.y - y) < 60) { burst(shootStar.x, shootStar.y, 18, { type: 'star', color: ['#fff', '#ffd23e'], s0: 4, s1: 8, g: 60, top: true }); if (!findSecret('star')) addCoins(10, x, y); say(SR('cp_sp_wish')); shootStar = null; return; }
    const m = LY.mon; if (x > m.x - 8 && x < m.x + m.w + 8 && y > m.y - 8 && y < m.y + m.h + 12 && !hitPet(x, y)) { monitorTap(); return; }
    if (hitPet(x, y, 0.15)) { touch = { id: e.pointerId, x0: x, y0: y, lx: x, ly: y, t0: clock, dist: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} return; }
    if (!S.sleeping && y > LY.horizon - 20) pet.tx = clamp(x, LY.minX, LY.maxX);
  });
  cv.addEventListener('pointermove', (e) => {
    const x = e.clientX, y = e.clientY; if (e.pointerType === 'mouse' || e.buttons || touch) { ptr.x = x; ptr.y = y; ptr.t = clock; }
    if (scene === 'game') { if (MG.g && MG.state === 'play' && !MG.paused && MG.g.move) MG.g.move(x, y, e); return; }
    if (!touch || e.pointerId !== touch.id || !S) return;
    const d = Math.hypot(x - touch.lx, y - touch.ly); touch.dist += d; touch.lx = x; touch.ly = y;
    if (touch.dist > 12 && hitPet(x, y, 0.5)) { pet.strokeAcc += d; while (pet.strokeAcc > 80) { pet.strokeAcc -= 80; petUnit(); } }
  });
  const endTouch = (e) => {
    if (scene === 'game') { if (MG.g && MG.g.up) MG.g.up(e.clientX, e.clientY, e); return; }
    if (!touch || e.pointerId !== touch.id) return; const tc = touch; touch = null;
    if (tc.dist < 12 && clock - tc.t0 < 0.45) poke();
  };
  cv.addEventListener('pointerup', endTouch); cv.addEventListener('pointercancel', (e) => { touch = null; if (scene === 'game' && MG.g && MG.g.up) MG.g.up(e.clientX, e.clientY, e); });
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[konamiIdx]) { konamiIdx++; if (konamiIdx === KONAMI.length) { konamiIdx = 0; if (scene === 'hub') onKonami(); } } else konamiIdx = k === KONAMI[0] ? 1 : 0;
    if (scene === 'game') {
      if (MG.state === 'intro') { if (k === 'Enter' || k === ' ') { beginGame(); e.preventDefault(); } else if (k === 'Escape') cancelIntro(); return; }
      if (k === 'Escape' || k === 'p') { if (MG.paused && modalKind === 'pause') { closeModal(); MG.paused = false; } else pauseGame(); e.preventDefault(); return; }
      if (MG.g && MG.state === 'play' && !MG.paused && MG.g.key) { if (MG.g.key(e.code, true, e) !== false && /^(Arrow|Space)/.test(e.code)) e.preventDefault(); }
      return;
    }
    if (k === 'Escape') { if (!modalEl.hidden) { if (!['result', 'evo'].includes(modalKind)) closeModal(); } else if (!$('#tray').hidden) closeTray(); else if (scene === 'hub') openMenu(); return; }
    if (scene !== 'hub' || !modalEl.hidden || !S || S.stage < 1 || evoSeq) return;
    if (k === 'f') toggleTray(); else if (k === 'g') openGames(); else if (k === 'c') doSweep(); else if (k === 'l') { S.sleeping ? wake(false) : sleep(); }
  });
  window.addEventListener('keyup', (e) => { if (scene === 'game' && MG.g && MG.g.key) MG.g.key(e.code, false, e); });
  $('#menuBtn').onclick = () => { Snd.sfx('open'); openMenu(); };
  $('#pauseBtn').onclick = () => pauseGame();
  $('#evoGo').onclick = () => startEvolution();
  $('#trayX').onclick = () => closeTray();
  const toggleLang = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
  $('#langBtn').onclick = toggleLang; $('#tLang').onclick = toggleLang;
  document.addEventListener('langchange', () => {
    if (scene === 'title') renderTitle(); if (S && scene === 'hub') { renderHub(); if (!$('#tray').hidden) renderTray(); }
    $('#evoGo').textContent = T('cp_evo_go'); rerenderModal(); hudKey = ''; if (scene === 'game') updMgHud();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { saveNow(); pauseGame(); } });
  window.addEventListener('pagehide', saveNow);
  window.addEventListener('resize', resize);

  // ------------------------------------------------------------------ main loop
  let lastT = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (ts - (lastT || ts)) / 1000)); lastT = ts; clock += dt;
    update(dt); draw();
  }
  function update(dt) {
    statT -= dt; if (statT <= 0) { statT = 0.5; tickStats(); if (scene === 'hub' && S) { updStats(); updTop(); updDock(); } }
    if (S && S.flags.neoPending && S.stage >= 1 && scene === 'hub') { S.flags.neoPending = false; findSecret('neo'); say(SR('cp_sp_neo', { n: S.name })); }
    if (dirty) { saveT += dt; if (saveT > 4) saveNow(); }
    shake = Math.max(0, shake - dt * 30); flash = Math.max(0, flash - dt * 1.6); if (pet.popT > 0) pet.popT = Math.max(0, pet.popT - dt);
    updParts(dt);
    if (scene === 'game') mgUpdate(dt);
    else if (scene === 'hub' && S) { hubUpdate(dt); evoUpdate(dt); updFlyFood(dt); }
    else if (scene === 'title') { updPetAnim(dt); pet.lookX = lerp(pet.lookX, clock - ptr.t < 3 ? clamp((ptr.x - W / 2) / 300, -1, 1) : Math.sin(clock * 0.5) * 0.6, 0.1); pet.lookY = lerp(pet.lookY, clock - ptr.t < 3 ? clamp((ptr.y - H * 0.45) / 300, -1, 1) : 0, 0.1); }
    if (scene === 'hub' && S) placeBubble();
  }
  function placeBubble() {
    if (speech.t <= 0) return; const c = petCenter(), r = bubbleEl.getBoundingClientRect(), hw = Math.max(70, r.width / 2 + 8);
    const x = clamp(c.x, hw, W - hw), y = Math.max(LY.top + r.height + 14, c.y - c.R * 1.65);
    bubbleEl.style.left = x + 'px'; bubbleEl.style.top = y + 'px';
  }
  function draw() {
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    if (shake > 0) g.translate(rnd(-shake, shake), rnd(-shake, shake));
    if (scene === 'game') mgDraw(g);
    else if (scene === 'hub' && S) drawHub(g);
    else drawTitleBg(g);
    g.setTransform(DPR, 0, 0, DPR, 0, 0); drawVignette(g);
    if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash * 0.85})`; g.fillRect(0, 0, W, H); }
  }
  function drawTitleBg(gg) {
    const th = theme(); const gr = gg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, th.bg1); gr.addColorStop(1, th.bg2); gg.fillStyle = gr; gg.fillRect(0, 0, W, H);
    const hz = H * 0.62; drawFloor(gg, th, hz);
    const sp = $('.petspace'); let px = W / 2, py = H * 0.55, R = clamp(Math.min(W, H) * 0.1, 40, 80);
    if (sp && !$('#title').hidden) { const r = sp.getBoundingClientRect(); if (r.height) { px = r.left + r.width / 2; R = clamp(r.height * 0.3, 34, 80); py = r.bottom - 6; } }
    const sv = S || titleSv; const form = sv ? sv.form : 'bitling';
    gg.fillStyle = 'rgba(0,0,0,.35)'; ell(gg, px, py + 2, R * 0.9, R * 0.16); gg.fill();
    compositePet(gg, px, py - R * 0.84 * (1 - pet.sq), R, { form, t: clock, lookX: pet.lookX, lookY: pet.lookY, blink: pet.blink > 0 ? 1 - Math.abs(pet.blink - 0.07) / 0.07 : 0, eye: 'normal', mouth: 'smile', open: 1, sx: 1 + pet.sq, sy: 1 - pet.sq,
      glitch: Math.sin(clock * 1.7) > 0.93 ? 0.6 : 0, earDrop: 0, hatch: sv ? sv.hatch / 10 : 0, pixel: sv && sv.pixel, acc: sv && sv.stage >= 1 ? { head: sv.eq.head, face: sv.eq.face } : null });
    for (let i = 0; i < 26; i++) { const mx = hr(i) * W, my = H - ((clock * (10 + hr(i + 9) * 18) + hr(i + 3) * H) % H); gg.fillStyle = i % 2 ? th.a : th.b; gg.globalAlpha = 0.25; gg.font = '700 13px ui-monospace, monospace'; gg.fillText(i % 3 ? '0' : '1', mx, my); }
    gg.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ boot & test API
  function boot() {
    resize(); applyThemeVars(); $('#evoGo').textContent = T('cp_evo_go');
    const sv = loadSave(); if (sv) { S = null; } setScene('title');
    requestAnimationFrame(frame);
  }
  const CP = window.CyberPet = {
    _: Object.assign(API, { GAMES, GAME_ORDER, addStr: (ar, en) => { Object.assign(AR, ar); Object.assign(EN, en); addStrings(ar, en); } }),
    get state() { return S; }, get scene() { return scene; }, get mg() { return MG.g; }, get mgState() { return MG.state; }, get pet() { return pet; }, get bugs() { return bugs; },
    mood, careStyle, canEvolve, nextForm, usualHour, favGame,
    start(name) { if (!S) newPet(name || 'Byte'); return S; }, cont: () => continueGame(),
    hatch() { if (S && S.stage === 0) { S.hatch = 9; tapSeed(); } }, feed: (id) => feed(id || 'crumbs'), petIt(n) { for (let i = 0; i < (n || 1); i++) petUnit(); }, poke,
    squashAll() { for (const b of bugs.slice()) squash(b); }, spawnBug: () => spawnBug(), sweep: () => doSweep(), sleep, wake: () => wake(false),
    play: (id, quick) => startGame(id, quick), begin: () => beginGame(), cancelIntro: () => cancelIntro(), endGame(score) { if (MG.g) { if (score != null) MG.g.score = score; MG.g.over = true; if (MG.state !== 'play') { MG.state = 'play'; finishGame(); } } }, finish: () => { if (MG.g) finishGame(); }, exitGame, pause: pauseGame,
    simulateAway(hours) { if (!S) return null; S.last -= hours * 3600e3; S.born -= hours * 3600e3; const sum = catchUp(hours * 3600); S.last = Date.now(); syncBugs(); awaySummary(sum); saveNow(); return sum; },
    addXP(n) { addXP(n); }, addCoins(n) { addCoins(n); }, care(c) { addCare(c); }, evolve() { if (canEvolve()) startEvolution(); return !!evoSeq; },
    setHour(h) { debugHour = h; }, konami: onKonami, secret: findSecret, terminal: (cmd) => { if (cmd) termCmd(cmd); else openTerminal(); }, rename: (n) => { S.name = n; saveNow(); updTop(); },
    openShop, openDiary, openGames, openMenu, closeModal, shopAct, save: saveNow, setScene, _dbgGeo: () => petCenter(), _drawPetTo: drawPetTo, _forms: FORMS, spawnNight() { ghostT = 0; starT = 0; }, get ghost() { return ghost; }, get star() { return shootStar; }, get speech() { return speech.text; },
    bench(n) { n = n || 20; const r = {}; const tm = (k, f) => { const t0 = performance.now(); for (let i = 0; i < n; i++) f(); r[k] = ((performance.now() - t0) / n).toFixed(2); };
      g.setTransform(DPR, 0, 0, DPR, 0, 0); tm('room', () => drawRoom(g)); tm('pet', () => { const c = petCenter(); compositePet(g, c.x, c.y, c.R, petOpts()); }); tm('vign', () => drawVignette(g)); tm('hub', () => drawHub(g)); return r; },
  };
  document.addEventListener('DOMContentLoaded', boot);
})();
