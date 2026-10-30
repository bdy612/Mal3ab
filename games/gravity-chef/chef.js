/* Gravity Chef — Mal3ab.
   A spaceship kitchen whose artificial-gravity generator keeps glitching. Ingredients, pots and pans float around:
   grab food, pull back like a slingshot and fling it (bank shots off the walls welcome) onto the chopping board,
   into the pan or the pot, then fling the finished dish into the serving hatch before the crew runs out of patience. */
(function () {
  'use strict';

  // ======================================================================================
  //  STRINGS (Egyptian Arabic / English)
  // ======================================================================================
  addStrings({
    gc_sub: 'شيف الجاذبية', gc_tag: 'مطبخ سفينة فضاء والجاذبية فيه بايظة! ارمي المكونات وخبّطها في الحيطان عشان تنزل في الطاسة أو الحلة، وقدّم الأكل قبل ما الطاقم يجوع.',
    gc_play: 'يلا نطبخ', gc_how: 'إزاي تلعب', gc_shifts: 'الشيفتات', gc_sound: 'الصوت', gc_music: 'المزيكا', gc_on: 'شغال', gc_off: 'مقفول',
    gc_chef: 'الشيف {p}', gc_shift: 'شيفت {n}', gc_stars: 'النجوم: {n} من {m}', gc_back: 'رجوع', gc_start: 'ابدأ الشيفت', gc_menu: 'منيو الشيفت', gc_new: 'جديد',
    gc_goalLine: 'اجمع {a} عملة على الأقل عشان تعدّي الشيفت.', gc_locked: 'خلّص الشيفت اللي قبله الأول.',
    gc_resume: 'كمّل', gc_restart: 'ابدأ من الأول', gc_quit: 'ارجع للشيفتات', gc_paused: 'استراحة',
    gc_win: 'الشيفت خلص بنجاح!', gc_lose: 'الشيفت باظ!', gc_whyStrikes: 'زباين كتير مشيوا جعانين.', gc_whyScore: 'كنت محتاج {a} عملة على الأقل.',
    gc_coins: 'العملات', gc_served: 'أطباق اتقدمت', gc_tipsL: 'البقشيش', gc_banks: 'ضربات مرتدة', gc_best: 'أحسن نتيجة', gc_newBest: 'رقم قياسي جديد!',
    gc_next: 'الشيفت اللي بعده', gc_retry: 'جرّب تاني', gc_allDone: 'خلّصت كل الشيفتات! إنت أشطر شيف في الفضاء 🚀',
    gc_timeUp: 'الوقت خلص!', gc_closed: 'المطبخ اتقفل!', gc_go: 'يلا بينا!', gc_tenLeft: 'فاضل ١٠ ثواني!',
    gc_p_bank: 'ضربة مرتدة +{n}', gc_p_tip: 'بقشيش +{n}', gc_p_noorder: 'محدش طالب ده!', gc_p_chopfirst: 'قطّعه الأول!', gc_p_nope: 'مينفعش هنا!',
    gc_p_wrongnext: 'مش ده اللي عليه الدور!', gc_p_busy: 'مشغول!', gc_p_ready: 'جاهز!', gc_p_burning: 'بيتحرق!', gc_p_burnt: 'اتحرق!', gc_p_scorched: 'اتفحّم!',
    gc_p_recycled: 'اترمى', gc_p_cooking: 'لسه بيستوي…', gc_p_left: 'الزبون مشي!', gc_p_glitch: 'خلل في الجاذبية!', gc_p_restored: 'الجاذبية رجعت', gc_p_new: 'طلب جديد!',
    gc_p_soon: 'الجاذبية هتتغير!',
    gc_hn_grab: 'اضغط وامسك {i}', gc_hn_aim: 'اسحب لورا زي النبلة وسيب عشان ترمي', gc_hn_fling: 'ارمي {i} في {s}', gc_hn_flingOn: 'ارمي {i} على {s}',
    gc_hn_take: 'اضغط على {s} وخد الأكل', gc_hn_wait: 'استنى شوية… الأكل بيستوي', gc_hn_serve: 'ارمي الطبق في شباك التقديم!', gc_hn_trash: 'خد المحروق وارميه في الزبالة', gc_hn_supply: 'استنى المكونات تنزل من أنبوبة التموين',
    gc_k_egg: 'البيضة', gc_k_carrot: 'الجزرة', gc_k_mushroom: 'المشروم', gc_k_meat: 'اللحمة', gc_k_fish: 'السمكة', gc_k_tomato: 'الطماطم', gc_k_potato: 'البطاطس', gc_k_noodles: 'النودلز',
    gc_k_mush_c: 'المشروم المقطّع', gc_k_fish_c: 'السمك المقطّع', gc_k_tomato_c: 'الطماطم المقطّعة', gc_k_potato_c: 'البطاطس المقطّعة', gc_k_burnt: 'المحروق',
    gc_d_egg_f: 'بيضة مقلية', gc_d_carrot_c: 'أصابع جزر', gc_d_mush_f: 'مشروم مقلي', gc_d_steak: 'ستيك نيزكي', gc_d_fish_f: 'سمك كرسبي', gc_d_fries: 'بطاطس مقلية',
    gc_d_soup: 'شوربة السديم', gc_d_ramen: 'رامن المجرة', gc_d_stew: 'طاجن الكواكب',
    gc_s_board: 'لوح التقطيع', gc_s_pan: 'الطاسة', gc_s_pot: 'الحلة', gc_s_hatch: 'شباك التقديم', gc_s_trash: 'الزبالة',
    gc_h1t: 'امسك', gc_h1: 'اضغط على أي أكلة عايمة. ولو الطاسة أو الحلة أو اللوح فيهم أكل جاهز، اضغط عليهم تاخده.',
    gc_h2t: 'اسحب وارمي', gc_h2: 'اسحب لورا زي النبلة وسيب. الخط المنقط بيوريك الأكلة هتطير فين وهتخبط فين. وإنت ماسك الوقت بيبطّأ شوية.',
    gc_h3t: 'اطبخ بالترتيب', gc_h3: 'اللوح بيقطّع، الطاسة بتقلي، والحلة بتغلي المكونات بالترتيب اللي فوقها. خد الأكل أول ما يستوي قبل ما يتحرق!',
    gc_h4t: 'قدّم', gc_h4: 'ارمي الطبق الجاهز في شباك التقديم قبل ما صبر الزبون يخلص. الضربة المرتدة من الحيطة عليها بقشيش زيادة.',
    gc_h5t: 'الجاذبية', gc_h5: 'لما الإنذار يضرب، الجاذبية هتغير اتجاهها. بص على السهم اللي جنب الطلبات!',
    gc_keys: 'على الكمبيوتر: الماوس للمسك والرمي، كليك يمين أو Esc يلغي الرمية، و P للاستراحة.', gc_gotit: 'فهمت!',
    gc_l1: 'أول يوم في الفضاء', gc_l2: 'تقطيع تقطيع', gc_l3: 'الطاسة سخنة', gc_l4: 'الجاذبية اتجننت', gc_l5: 'الشوربة جاهزة', gc_l6: 'خليها تنط',
    gc_l7: 'معمل الهوا', gc_l8: 'مطبخ المغناطيس', gc_l9: 'حريقة في المطبخ', gc_l10: 'كله بيعوم', gc_l11: 'بوابات الفضاء', gc_l12: 'عزومة الكابتن',
    gc_tip1: 'اضغط على البيضة العايمة وامسكها، اسحب لورا وسيب عشان ترميها في الطاسة. لما ترن اضغط على الطاسة وارمي البيضة المقلية في شباك التقديم.',
    gc_tip2: 'لوح التقطيع بيقطّع أي حاجة تترمي عليه. أصابع الجزر بتتقدم على طول بعد التقطيع.',
    gc_tip3: 'فيه أكلات ليها خطوات بالترتيب: قطّع المشروم الأول وبعدين اقليه. ولو سبت الأكل في الطاسة كتير هيتحرق، فارمي المحروق في الزبالة.',
    gc_tip4: 'مولّد الجاذبية بيعطل! لما الإنذار يضرب الجاذبية هتغير اتجاهها. وفيه طاسة مش متثبتة وبتعوم في المطبخ.',
    gc_tip5: 'الحلة بتاخد المكونات بالترتيب اللي ظاهر فوقها. لما تكمل هتغلي، ولما تجهز اضغط عليها وخد الشوربة.',
    gc_tip6: 'المصدّات بتطيّر الأكل بسرعة. والضربات المرتدة من الحيطة عليها بقشيش زيادة!',
    gc_tip7: 'فتحات الهوا بتزق أي حاجة تعدي فيها، وبتفصل وتشتغل لوحدها. الخط المنقط بيحسبها.',
    gc_tip8: 'المغناطيس بيشد الأكل والحلل وهو شغال. استغله عشان تلف الرمية.',
    gc_tip9: 'شعلات النار بتفحّم أي أكل يعدي فيها وهي والعة. استنى لما تطفي!',
    gc_tip10: 'ولا حاجة متثبتة! كل الحلل والطاسات بتعوم، والجاذبية بتعطل كتير.',
    gc_tip11: 'البوابات بتنقل الأكل من بوابة للتانية بنفس السرعة. الخط المنقط بيعدي من جوه البوابة.',
    gc_tip12: 'كل حاجة مع بعض: مصدّات وهوا ومغناطيس ونار وبوابات. الكابتن جعان، متكسفوش!',
    gc_tutDone: 'برافو! كده إنت فهمت اللعبة 👌',
  }, {
    gc_sub: 'Space kitchen chaos', gc_tag: 'A spaceship kitchen with broken gravity! Fling ingredients off the walls into the pans and pots, and serve the crew before they starve.',
    gc_play: 'Start cooking', gc_how: 'How to play', gc_shifts: 'Shifts', gc_sound: 'Sound', gc_music: 'Music', gc_on: 'on', gc_off: 'off',
    gc_chef: 'Chef {p}', gc_shift: 'Shift {n}', gc_stars: 'Stars: {n} of {m}', gc_back: 'Back', gc_start: 'Start shift', gc_menu: 'Shift menu', gc_new: 'New',
    gc_goalLine: 'Earn at least {a} coins to pass the shift.', gc_locked: 'Finish the previous shift first.',
    gc_resume: 'Resume', gc_restart: 'Restart', gc_quit: 'Back to shifts', gc_paused: 'Paused',
    gc_win: 'Shift complete!', gc_lose: 'Shift failed!', gc_whyStrikes: 'Too many hungry customers walked out.', gc_whyScore: 'You needed at least {a} coins.',
    gc_coins: 'Coins', gc_served: 'Dishes served', gc_tipsL: 'Tips', gc_banks: 'Bank shots', gc_best: 'Best', gc_newBest: 'New best!',
    gc_next: 'Next shift', gc_retry: 'Try again', gc_allDone: 'You cleared every shift! Best chef in the galaxy 🚀',
    gc_timeUp: "Time's up!", gc_closed: 'Kitchen closed!', gc_go: "Let's cook!", gc_tenLeft: '10 seconds left!',
    gc_p_bank: 'Bank shot +{n}', gc_p_tip: 'Tip +{n}', gc_p_noorder: 'Nobody ordered that!', gc_p_chopfirst: 'Chop it first!', gc_p_nope: "Can't go here!",
    gc_p_wrongnext: 'Not next in the pot!', gc_p_busy: 'Busy!', gc_p_ready: 'Ready!', gc_p_burning: 'Burning!', gc_p_burnt: 'Burnt!', gc_p_scorched: 'Scorched!',
    gc_p_recycled: 'Recycled', gc_p_cooking: 'Still cooking…', gc_p_left: 'Customer left!', gc_p_glitch: 'Gravity glitch!', gc_p_restored: 'Gravity restored', gc_p_new: 'New order!',
    gc_p_soon: 'Gravity shift!',
    gc_hn_grab: 'Tap the {i} to grab it', gc_hn_aim: 'Pull back like a slingshot and let go to fling.', gc_hn_fling: 'Fling the {i} into the {s}', gc_hn_flingOn: 'Fling the {i} at the {s}',
    gc_hn_take: 'Tap the {s} to take the food out', gc_hn_wait: 'Wait for it to cook…', gc_hn_serve: 'Fling the dish into the serving hatch!', gc_hn_trash: 'Take the burnt food and fling it in the trash.', gc_hn_supply: 'Wait for ingredients from the supply tube.',
    gc_k_egg: 'egg', gc_k_carrot: 'carrot', gc_k_mushroom: 'mushroom', gc_k_meat: 'meat', gc_k_fish: 'fish', gc_k_tomato: 'tomato', gc_k_potato: 'potato', gc_k_noodles: 'noodles',
    gc_k_mush_c: 'chopped mushroom', gc_k_fish_c: 'chopped fish', gc_k_tomato_c: 'chopped tomato', gc_k_potato_c: 'chopped potato', gc_k_burnt: 'burnt food',
    gc_d_egg_f: 'Fried egg', gc_d_carrot_c: 'Carrot sticks', gc_d_mush_f: 'Fried mushrooms', gc_d_steak: 'Meteor steak', gc_d_fish_f: 'Crispy fish bites', gc_d_fries: 'Comet fries',
    gc_d_soup: 'Nebula soup', gc_d_ramen: 'Galaxy ramen', gc_d_stew: 'Planet stew',
    gc_s_board: 'chopping board', gc_s_pan: 'pan', gc_s_pot: 'pot', gc_s_hatch: 'serving hatch', gc_s_trash: 'trash airlock',
    gc_h1t: 'Grab', gc_h1: 'Tap any floating food. If a pan, pot or board holds food that is ready, tap it to take the food out.',
    gc_h2t: 'Pull and fling', gc_h2: 'Pull back like a slingshot and let go. The dotted line shows where it flies and bounces. Time slows down a little while you aim.',
    gc_h3t: 'Cook in order', gc_h3: 'The board chops, the pan fries and the pot boils ingredients in the order shown above it. Grab food as soon as it is done, before it burns!',
    gc_h4t: 'Serve', gc_h4: 'Fling the finished dish into the serving hatch before the customer runs out of patience. Bank shots off the walls earn bonus tips.',
    gc_h5t: 'Gravity', gc_h5: 'When the alarm sounds, gravity changes direction. Watch the arrow next to the orders!',
    gc_keys: 'Desktop: mouse to grab and fling, right-click or Esc cancels a throw, P pauses.', gc_gotit: 'Got it!',
    gc_l1: 'First day in orbit', gc_l2: 'Chop chop', gc_l3: 'Hot pan', gc_l4: 'Gravity glitch', gc_l5: "Soup's on", gc_l6: 'Bumper bay',
    gc_l7: 'Vent lab', gc_l8: 'Magnet galley', gc_l9: 'Fire drill', gc_l10: 'Everything floats', gc_l11: 'Wormhole wok', gc_l12: "Captain's banquet",
    gc_tip1: 'Tap the floating egg to grab it, pull back and let go to fling it into the pan. When it dings, tap the pan and fling the fried egg into the serving hatch.',
    gc_tip2: 'The chopping board chops anything you fling at it. Carrot sticks can be served straight away.',
    gc_tip3: 'Some dishes need steps in order: chop the mushroom first, then fry it. Leave food in the pan too long and it burns, so fling burnt food into the trash.',
    gc_tip4: 'The gravity generator glitches! When the alarm sounds, gravity changes direction. One pan is not bolted down and drifts around.',
    gc_tip5: 'The pot takes ingredients in the order shown above it. When it is full it boils, and when it is ready you tap it to take the soup.',
    gc_tip6: 'Bumpers launch food at high speed. Bank shots off the walls earn bonus tips!',
    gc_tip7: 'Air vents push anything that passes through, and they switch on and off by themselves. The aim line accounts for them.',
    gc_tip8: 'Magnets pull food and cookware while they are on. Use them to curve your throws.',
    gc_tip9: 'Fire jets scorch any food that passes through while they are lit. Wait for them to go out!',
    gc_tip10: 'Nothing is bolted down! Every pot and pan floats, and gravity glitches often.',
    gc_tip11: 'Portals send food out of the other portal at the same speed. The aim line goes right through them.',
    gc_tip12: 'Everything at once: bumpers, vents, magnets, fire and portals. The captain is hungry, do not let him down!',
    gc_tutDone: 'Nice! Now you know how it works 👌',
  });

  // ======================================================================================
  //  HELPERS
  // ======================================================================================
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = '"Segoe UI", Tahoma, Arial, sans-serif';
  const OUT = '#2b2141';

  // ======================================================================================
  //  FOOD DATA
  // ======================================================================================
  const KIND = {
    egg: { r: 22, fry: 'egg_f' }, carrot: { r: 24, chop: 'carrot_c' }, mushroom: { r: 24, chop: 'mush_c' }, meat: { r: 26, fry: 'steak' },
    fish: { r: 26, chop: 'fish_c' }, tomato: { r: 23, chop: 'tomato_c' }, potato: { r: 24, chop: 'potato_c' }, noodles: { r: 25 },
    carrot_c: { r: 24, from: 'carrot' }, mush_c: { r: 23, fry: 'mush_f', from: 'mushroom' }, fish_c: { r: 24, fry: 'fish_f', from: 'fish' },
    tomato_c: { r: 23, from: 'tomato' }, potato_c: { r: 24, fry: 'fries', from: 'potato' },
    egg_f: { r: 27, from: 'egg', plate: 1 }, steak: { r: 28, from: 'meat', plate: 1 }, mush_f: { r: 27, from: 'mush_c', plate: 1 },
    fish_f: { r: 27, from: 'fish_c', plate: 1 }, fries: { r: 26, from: 'potato_c' },
    soup: { r: 29 }, ramen: { r: 29 }, stew: { r: 29 }, burnt: { r: 23 },
  };
  const POT = { soup: ['tomato_c', 'mush_c'], ramen: ['noodles', 'egg'], stew: ['carrot_c', 'potato_c', 'meat'] };
  const DISH = {
    egg_f: { v: 20, pat: 55 }, carrot_c: { v: 15, pat: 45 }, mush_f: { v: 30, pat: 70 }, steak: { v: 35, pat: 62 }, fish_f: { v: 40, pat: 75 },
    fries: { v: 30, pat: 70 }, soup: { v: 55, pat: 95 }, ramen: { v: 50, pat: 90 }, stew: { v: 75, pat: 115 },
  };
  const COOK = { egg: 3.5, meat: 5.5, mush_c: 4, fish_c: 4.5, potato_c: 4.5 };
  const BOIL = 6;
  const isFood = (k) => k !== 'burnt';
  const rawOf = (k) => k === 'burnt' ? [] : POT[k] ? POT[k].flatMap(rawOf) : KIND[k].from ? rawOf(KIND[k].from) : [k];
  function kindsOf(dish) {   // every kind on the way to a dish
    const s = new Set([dish]);
    const add = (k) => { s.add(k); if (KIND[k].from) add(KIND[k].from); };
    if (POT[dish]) POT[dish].forEach(add); else add(dish);
    return s;
  }
  function pathOf(k) {       // raw ingredient + the stations it goes through
    if (!KIND[k].from) return { ing: k, via: [] };
    const p = pathOf(KIND[k].from); p.via.push(KIND[KIND[k].from].fry === k ? 'pan' : 'board'); return p;
  }
  const chainOf = (d) => POT[d] ? { parts: POT[d].map(pathOf), pot: true } : { parts: [pathOf(d)], pot: false };
  const nameOf = (k, low) => { const s = t(DISH[k] ? 'gc_d_' + k : 'gc_k_' + k); return low && getLang() === 'en' ? s.toLowerCase() : s; };

  // ======================================================================================
  //  LEVELS  (room is 1000 x 625; ports sit on a wall L/R/T/B at a position along it)
  // ======================================================================================
  const W = 1000, H = 625, M = 26, STEP = 1 / 120;
  const LEVELS = [
    { name: 'gc_l1', tip: 'gc_tip1', icon: '🍳', time: 100, menu: { egg_f: 1 }, every: [11, 15], maxQ: 2, patM: 1.5, done: 10, lives: 4, tut: 1, sm: 1,
      st: [['pan', 620, 470, 1]], ports: [['hatch', 'R', 210], ['trash', 'B', 150], ['tube', 'L', 330]], init: ['egg', 'egg'] },
    { name: 'gc_l2', tip: 'gc_tip2', icon: '🔪', time: 120, menu: { egg_f: 1, carrot_c: 1 }, every: [10, 14], maxQ: 3, patM: 1.35, done: 9, lives: 4, tut: 1, sm: 1.2,
      st: [['board', 330, 515, 1], ['pan', 660, 115, 1]], ports: [['hatch', 'R', 400], ['trash', 'B', 820], ['tube', 'L', 200]], init: ['carrot', 'egg', 'carrot'] },
    { name: 'gc_l3', tip: 'gc_tip3', icon: '🍄', time: 140, menu: { mush_f: 2, egg_f: 1, carrot_c: 1 }, every: [10, 14], maxQ: 3, patM: 1.25, done: 7, lives: 3, tut: 1, sm: 0.82,
      st: [['board', 240, 115, 1], ['pan', 520, 510, 1]], segs: [[720, 175, 720, 450]],
      ports: [['hatch', 'R', 312], ['trash', 'B', 110], ['tube', 'L', 420]], init: ['mushroom', 'egg', 'carrot'] },
    { name: 'gc_l4', tip: 'gc_tip4', icon: '🌀', time: 150, menu: { steak: 2, egg_f: 1, carrot_c: 1, mush_f: 1 }, every: [9, 13], maxQ: 3, patM: 1.2, done: 7, lives: 3, sm: 0.81,
      st: [['board', 190, 510, 1], ['pan', 470, 115, 1], ['pan', 720, 380, 0]], ports: [['hatch', 'R', 480], ['trash', 'L', 110], ['tube', 'T', 220]],
      glitch: { every: [12, 17], dur: [7, 10], str: [150, 240] }, init: ['meat', 'egg', 'carrot', 'mushroom'] },
    { name: 'gc_l5', tip: 'gc_tip5', icon: '🍲', time: 160, menu: { soup: 2, mush_f: 1, carrot_c: 1 }, every: [10, 14], maxQ: 3, patM: 1.15, done: 7, lives: 3, sm: 0.62,
      st: [['pot', 500, 510, 1], ['board', 190, 140, 1], ['pan', 820, 160, 1]], ports: [['hatch', 'R', 440], ['trash', 'L', 480], ['tube', 'L', 230]],
      glitch: { every: [18, 24], dur: [6, 9], str: [120, 180] }, init: ['tomato', 'mushroom', 'mushroom', 'carrot'] },
    { name: 'gc_l6', tip: 'gc_tip6', icon: '💥', time: 160, menu: { steak: 1, soup: 2, egg_f: 1, carrot_c: 1 }, every: [9, 13], maxQ: 3, patM: 1.1, done: 6, lives: 3, sm: 0.6,
      st: [['pan', 520, 190, 0], ['board', 105, 300, 1], ['pot', 860, 520, 1]], bumpers: [[380, 265, 34], [645, 395, 34], [815, 215, 30], [260, 470, 28]],
      ports: [['hatch', 'T', 820], ['trash', 'B', 540], ['tube', 'L', 130]], glitch: { every: [16, 22], dur: [6, 9], str: [140, 220] },
      init: ['meat', 'tomato', 'mushroom', 'egg'] },
    { name: 'gc_l7', tip: 'gc_tip7', icon: '🌬️', time: 170, menu: { ramen: 2, fish_f: 2, steak: 1 }, every: [10, 14], maxQ: 3, patM: 1.1, done: 6, lives: 3, sm: 0.6,
      st: [['pot', 150, 515, 1], ['board', 620, 520, 1], ['pan', 790, 300, 0]],
      vents: [{ x: 320, y: 170, w: 100, h: 455, d: [0, -1], p: 950, per: 7, duty: 0.55, ph: 0 }, { x: 600, y: 0, w: 400, h: 95, d: [-1, 0], p: 800, per: 6, duty: 0.5, ph: 3 }],
      ports: [['hatch', 'R', 470], ['trash', 'T', 160], ['tube', 'L', 260]], glitch: { every: [18, 24], dur: [6, 8], str: [130, 200] },
      init: ['noodles', 'egg', 'fish', 'meat'] },
    { name: 'gc_l8', tip: 'gc_tip8', icon: '🧲', time: 170, menu: { soup: 2, ramen: 2, mush_f: 1 }, every: [10, 14], maxQ: 3, patM: 1.05, done: 6, lives: 3, sm: 0.56,
      st: [['pot', 300, 420, 0], ['pan', 660, 470, 0], ['board', 110, 110, 1]],
      mags: [{ x: 500, y: 300, R: 260, p: 650, per: 8, duty: 0.6, ph: 0 }, { x: 860, y: 140, R: 190, p: 600, per: 7, duty: 0.5, ph: 3.5 }],
      ports: [['hatch', 'B', 860], ['trash', 'L', 440], ['tube', 'T', 300]], glitch: { every: [16, 22], dur: [6, 9], str: [130, 200] },
      init: ['tomato', 'mushroom', 'noodles', 'egg', 'mushroom'] },
    { name: 'gc_l9', tip: 'gc_tip9', icon: '🔥', time: 180, menu: { steak: 1, stew: 2, fish_f: 1, fries: 1 }, every: [10, 14], maxQ: 3, patM: 1.05, done: 6, lives: 3, sm: 0.43,
      st: [['board', 190, 120, 1], ['pan', 570, 515, 1], ['pot', 860, 160, 1]],
      fires: [{ x: 385, y: 290, w: 70, h: 335, d: [0, -1], per: 6, duty: 0.45, ph: 0 }, { x: 665, y: 0, w: 70, h: 310, d: [0, 1], per: 6, duty: 0.45, ph: 3 }],
      ports: [['hatch', 'R', 470], ['trash', 'L', 520], ['tube', 'L', 260]], glitch: { every: [16, 22], dur: [6, 9], str: [130, 200] },
      init: ['carrot', 'potato', 'meat', 'fish'] },
    { name: 'gc_l10', tip: 'gc_tip10', icon: '🪐', time: 180, menu: { egg_f: 1, steak: 1, soup: 2, fries: 1, mush_f: 1 }, every: [9, 12], maxQ: 4, patM: 1.0, done: 6, lives: 3, sm: 0.39,
      st: [['pot', 300, 300, 0], ['pan', 600, 200, 0], ['pan', 720, 460, 0], ['board', 190, 480, 0]], bumpers: [[500, 340, 30], [860, 300, 28]],
      ports: [['hatch', 'R', 150], ['trash', 'B', 520], ['tube', 'L', 312], ['tube', 'T', 800]], glitch: { every: [10, 14], dur: [6, 9], str: [160, 280], diag: 1 },
      init: ['egg', 'meat', 'tomato', 'mushroom', 'potato'] },
    { name: 'gc_l11', tip: 'gc_tip11', icon: '🌌', time: 180, menu: { fish_f: 2, ramen: 2, steak: 1, fries: 1 }, every: [9, 13], maxQ: 4, patM: 1.0, done: 6, lives: 3, sm: 0.37,
      st: [['board', 105, 300, 1], ['pan', 360, 110, 1], ['pot', 780, 230, 0]], segs: [[530, 0, 530, 360]], portals: [[250, 470, 870, 520]],
      vents: [{ x: 0, y: 530, w: 430, h: 95, d: [1, 0], p: 700, per: 6, duty: 0.5, ph: 1 }],
      ports: [['hatch', 'R', 560], ['trash', 'B', 700], ['tube', 'L', 120]], glitch: { every: [16, 22], dur: [6, 9], str: [130, 200] },
      init: ['fish', 'noodles', 'egg', 'meat'] },
    { name: 'gc_l12', tip: 'gc_tip12', icon: '👑', time: 210, menu: { egg_f: 1, steak: 1, mush_f: 1, fish_f: 1, soup: 1, ramen: 1, stew: 1, fries: 1 }, every: [8, 11], maxQ: 4,
      patM: 1.0, done: 5, lives: 3, sm: 0.34,
      st: [['board', 105, 300, 1], ['pan', 330, 380, 0], ['pan', 800, 545, 1], ['pot', 645, 115, 1]], bumpers: [[440, 215, 30], [720, 400, 30]],
      mags: [{ x: 880, y: 150, R: 200, p: 600, per: 9, duty: 0.5, ph: 2 }], fires: [{ x: 540, y: 430, w: 70, h: 195, d: [0, -1], per: 7, duty: 0.4, ph: 1 }],
      vents: [{ x: 0, y: 0, w: 300, h: 90, d: [1, 0], p: 700, per: 8, duty: 0.5, ph: 4 }], portals: [[230, 520, 880, 380]],
      ports: [['hatch', 'B', 330], ['trash', 'L', 520], ['tube', 'L', 130], ['tube', 'R', 260]], glitch: { every: [12, 16], dur: [6, 9], str: [140, 240], diag: 1 },
      init: ['egg', 'meat', 'tomato', 'mushroom', 'noodles', 'fish'] },
  ];
  LEVELS.forEach((lv, i) => {
    lv.n = i + 1;
    let ws = 0, vs = 0; for (const k in lv.menu) { ws += lv.menu[k]; vs += lv.menu[k] * DISH[k].v; }
    const P = lv.time / ((lv.every[0] + lv.every[1]) / 2) * (vs / ws) * 1.3 * lv.sm, r5 = (x) => Math.max(5, Math.round(x / 5) * 5);
    lv.stars = [r5(P * 0.3), r5(P * 0.55), r5(P * 0.8)];
    lv.pool = [...new Set(Object.keys(lv.menu).flatMap(rawOf))];
  });
  const DEMO = { time: 0, menu: {}, every: [99, 99], maxQ: 0, st: [['pan', 300, 430, 1], ['pot', 690, 420, 1], ['board', 520, 150, 0]],
    ports: [['hatch', 'R', 220], ['trash', 'B', 860], ['tube', 'L', 300]], glitch: { every: [6, 9], dur: [4, 6], str: [90, 160], diag: 1 },
    bumpers: [[860, 470, 28]], init: ['egg', 'carrot', 'mushroom', 'meat', 'fish', 'tomato', 'potato', 'noodles', 'soup', 'egg_f', 'fries'], pool: ['egg', 'tomato', 'carrot'] };

  // ======================================================================================
  //  SAVE
  // ======================================================================================
  const SKEY = 'gravity-chef-save';
  const SAVE = { stars: {}, best: {}, sound: 1, music: 1, how: 0, last: 0 };
  try { const s = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (s && typeof s === 'object') Object.assign(SAVE, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem(SKEY, JSON.stringify(SAVE)); } catch (e) {} };
  const unlocked = (i) => i === 0 || (SAVE.stars[i] || 0) > 0;   // level index i opens once level number i (the previous one) has a star
  const totalStars = () => LEVELS.reduce((a, lv) => a + (SAVE.stars[lv.n] || 0), 0);

  // ======================================================================================
  //  AUDIO (all synthesized)
  // ======================================================================================
  const AU = {
    ctx: null, out: null, nb: null, siz: null, mus: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
        const c = this.ctx = new C();
        this.out = c.createGain(); this.out.gain.value = 0.55; this.out.connect(c.destination);
        const len = c.sampleRate * 1.5, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.nb = b;
        // looping sizzle for frying pans
        const src = c.createBufferSource(); src.buffer = b; src.loop = true;
        const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3200;
        this.siz = c.createGain(); this.siz.gain.value = 0; src.connect(hp); hp.connect(this.siz); this.siz.connect(this.out); src.start();
        this.mus = c.createGain(); this.mus.gain.value = 0.0; this.mus.connect(this.out);
        Music.start();
      } catch (e) { this.ctx = null; }
    },
    ok() { return this.ctx && SAVE.sound; },
    tone(f, d, type, v, f2, delay) {
      if (!this.ok()) return; const c = this.ctx, t0 = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.2, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(this.out); o.start(t0); o.stop(t0 + d + 0.05);
    },
    noise(d, v, f, type, f2, delay, q) {
      if (!this.ok()) return; const c = this.ctx, t0 = c.currentTime + (delay || 0);
      const s = c.createBufferSource(); s.buffer = this.nb; const fl = c.createBiquadFilter(); fl.type = type || 'bandpass'; fl.Q.value = q || 1;
      fl.frequency.setValueAtTime(f || 1000, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.2, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.connect(fl); fl.connect(g); g.connect(this.out); s.start(t0, Math.random()); s.stop(t0 + d + 0.05);
    },
  };
  let lastTonk = 0;
  const SFX = {
    click: () => AU.tone(720, 0.05, 'triangle', 0.08),
    grab: () => { AU.tone(480, 0.08, 'triangle', 0.13, 820); AU.noise(0.06, 0.04, 2500); },
    fling: (p) => { AU.noise(0.28, 0.06 + p * 0.14, 500, 'bandpass', 2600); AU.tone(300, 0.15, 'sine', 0.06, 600 + p * 500); },
    tonk: (sp) => { const n = performance.now(); if (n - lastTonk < 45) return; lastTonk = n; AU.tone(170 + Math.random() * 60 + sp * 0.08, 0.08, 'sine', Math.min(0.16, sp / 2600)); AU.noise(0.04, Math.min(0.06, sp / 6000), 1800); },
    boing: () => { AU.tone(240, 0.3, 'sine', 0.2, 820); AU.tone(480, 0.2, 'triangle', 0.06, 1500); },
    plop: () => { AU.tone(420, 0.14, 'sine', 0.2, 140); AU.tone(900, 0.06, 'sine', 0.06, 400, 0.05); },
    sizzle: () => AU.noise(0.5, 0.12, 4000, 'highpass'),
    thunk: () => { AU.tone(150, 0.07, 'triangle', 0.22, 70); AU.noise(0.05, 0.1, 900, 'lowpass'); },
    ding: () => { AU.tone(1318, 0.6, 'sine', 0.14); AU.tone(1976, 0.4, 'sine', 0.05); },
    beep: () => AU.tone(920, 0.07, 'square', 0.045),
    poof: () => AU.noise(0.5, 0.2, 900, 'lowpass', 150),
    serve: () => { AU.tone(1046, 0.09, 'square', 0.06); AU.tone(1318, 0.09, 'square', 0.06, null, 0.07); AU.tone(1568, 0.35, 'triangle', 0.12, null, 0.14); AU.noise(0.12, 0.06, 6000, 'highpass', null, 0.14); },
    nope: () => { AU.tone(170, 0.12, 'square', 0.06); AU.tone(150, 0.14, 'square', 0.06, null, 0.1); },
    order: () => { AU.tone(660, 0.12, 'sine', 0.1); AU.tone(990, 0.16, 'sine', 0.1, null, 0.09); },
    left: () => { AU.tone(380, 0.45, 'sawtooth', 0.06, 190); },
    alarm: () => { AU.tone(760, 0.22, 'square', 0.06); AU.tone(540, 0.22, 'square', 0.06, null, 0.24); },
    wub: () => { AU.tone(140, 0.7, 'sawtooth', 0.11, 40); AU.noise(0.6, 0.08, 400, 'lowpass', 90); },
    portal: () => { AU.tone(380, 0.28, 'sine', 0.11, 1300); AU.tone(760, 0.2, 'sine', 0.04, 2400, 0.04); },
    fire: () => AU.noise(0.4, 0.07, 700, 'lowpass', 300),
    scorch: () => { AU.noise(0.5, 0.18, 1600, 'bandpass', 300); AU.tone(220, 0.3, 'sawtooth', 0.05, 90); },
    trash: () => { AU.noise(0.45, 0.12, 2000, 'bandpass', 200); AU.tone(500, 0.3, 'sine', 0.05, 120); },
    pop: () => AU.tone(520, 0.08, 'sine', 0.14, 260),
    tick: () => AU.tone(1100, 0.03, 'square', 0.04),
    win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => AU.tone(f, 0.3, 'triangle', 0.11, null, i * 0.11)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => AU.tone(f, 0.38, 'triangle', 0.1, null, i * 0.16)),
    star: (i) => AU.tone(880 * Math.pow(1.26, i), 0.3, 'triangle', 0.12),
  };

  // a soft space-lounge loop (lookahead scheduler)
  const Music = {
    step: 0, next: 0, timer: 0,
    start() {
      if (this.timer) return;
      this.next = AU.ctx.currentTime + 0.1;
      this.timer = setInterval(() => this.tick(), 60);
    },
    tick() {
      const c = AU.ctx; if (!c) return;
      const want = SAVE.music && SAVE.sound && !document.hidden ? (G && G.mode === 'play' && G.screen !== 'pause' ? 0.05 : 0.07) : 0;
      AU.mus.gain.setTargetAtTime(want, c.currentTime, 0.3);
      const spb = 60 / 96 / 2;   // eighth notes at 96 bpm
      const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];   // Fmaj7 Em7 Dm7 Cmaj7
      while (this.next < c.currentTime + 0.25) {
        const s = this.step % 64, ch = CH[Math.floor(s / 16)], t0 = this.next;
        const note = (m, d, type, v, when) => {
          const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
          g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(v, when + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
          o.connect(g); g.connect(AU.mus); o.start(when); o.stop(when + d + 0.05);
        };
        if (s % 8 === 0) note(ch[0] - 12, spb * 3.5, 'triangle', 0.5, t0);
        if (s % 8 === 6) note(ch[2] - 12, spb * 1.5, 'triangle', 0.32, t0);
        const arp = [0, 2, 1, 3, 2, 1, 3, 2][s % 8];
        if (s % 2 === 0 || s % 8 === 5) note(ch[arp] + 12, spb * 1.6, 'sine', s % 4 === 0 ? 0.22 : 0.13, t0);
        if (s % 16 === 12) note(ch[3] + 24, spb * 3, 'sine', 0.08, t0);
        this.step++; this.next += spb;
      }
    },
  };

  // ======================================================================================
  //  LAYOUT  (the room is drawn upright; on portrait screens the world is mirrored across the diagonal)
  // ======================================================================================
  const cv = $('c'), ctx = cv.getContext('2d');
  let DPR = 1, VW = 0, VH = 0, bgCv = null;
  const L = { s: 1, ox: 0, oy: 0, port: false, room: { x: 0, y: 0, w: 0, h: 0 }, strip: { x: 0, y: 0, w: 0, h: 0, vert: false } };
  const toS = (x, y) => L.port ? [L.ox + y * L.s, L.oy + x * L.s] : [L.ox + x * L.s, L.oy + y * L.s];
  const toW = (sx, sy) => L.port ? [(sy - L.oy) / L.s, (sx - L.ox) / L.s] : [(sx - L.ox) / L.s, (sy - L.oy) / L.s];
  const vS = (x, y) => L.port ? [y, x] : [x, y];

  function layout() {
    VW = innerWidth; VH = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
    const hud = $('hud'), hudH = (hud && hud.offsetHeight) || 54, pad = VW < 500 ? 6 : 12;
    const opts = [];
    const sh = clamp(Math.round(VH * 0.1), 58, 84), sw = clamp(Math.round(VW * 0.13), 100, 150);
    for (const port of [false, true]) {
      const rw = (port ? H : W) + M * 2, rh = (port ? W : H) + M * 2;
      const aW = VW - pad * 2, aH = VH - hudH - sh - pad * 2.5;
      opts.push({ port, top: true, rw, rh, s: Math.min(aW / rw, aH / rh) });
      const bW = VW - sw - pad * 3, bH = VH - hudH - pad * 2;
      opts.push({ port, top: false, rw, rh, s: Math.min(bW / rw, bH / rh) * 0.97 });
    }
    opts.sort((a, b) => b.s - a.s);
    const o = opts[0]; L.s = o.s; L.port = o.port;
    const ow = o.rw * o.s, oh = o.rh * o.s;
    if (o.top) {
      const areaY = hudH + sh + pad * 1.5, areaH = VH - areaY - pad;
      // tall screens: keep the room right under the tickets and leave the spare room below for hints
      const rx = (VW - ow) / 2, ry = areaY + Math.max(0, (areaH - oh) / 2) * (VH > VW ? 0.15 : 1);
      L.room = { x: rx + M * o.s, y: ry + M * o.s, w: ow - 2 * M * o.s, h: oh - 2 * M * o.s };
      const swd = Math.min(VW - pad * 2, Math.max(ow, Math.min(VW - pad * 2, 560)));
      L.strip = { x: (VW - swd) / 2, y: ry - sh - pad * 0.5, w: swd, h: sh, vert: false };
    } else {
      const areaX = sw + pad * 2, areaW = VW - areaX - pad;
      const rx = areaX + Math.max(0, (areaW - ow) / 2), ry = hudH + pad + Math.max(0, (VH - hudH - pad * 2 - oh) / 2);
      L.room = { x: rx + M * o.s, y: ry + M * o.s, w: ow - 2 * M * o.s, h: oh - 2 * M * o.s };
      L.strip = { x: rx - sw - pad, y: ry, w: sw, h: Math.max(oh, 200), vert: true };
    }
    L.ox = L.room.x; L.oy = L.room.y;
    buildBg();
  }

  // seeded random for stable decorations
  function srand(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function buildBg() {
    bgCv = bgCv || document.createElement('canvas');
    bgCv.width = cv.width; bgCv.height = cv.height;
    const b = bgCv.getContext('2d'); b.setTransform(DPR, 0, 0, DPR, 0, 0);
    // deep space around the ship
    const sg = b.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, '#0f1220'); sg.addColorStop(1, '#171a35'); b.fillStyle = sg; b.fillRect(0, 0, VW, VH);
    const R = srand(7);
    for (let i = 0; i < Math.round(VW * VH / 2600); i++) { b.fillStyle = `rgba(255,255,255,${0.15 + R() * 0.6})`; const s = R() < 0.92 ? 1 : 2; b.fillRect(R() * VW, R() * VH, s, s); }
    const r = L.room, s = L.s, m = M * s;
    // hull wall
    b.save(); b.shadowColor = 'rgba(0,0,0,.55)'; b.shadowBlur = 30 * s; b.shadowOffsetY = 10 * s;
    rr(b, r.x - m, r.y - m, r.w + 2 * m, r.h + 2 * m, 34 * s);
    const wg = b.createLinearGradient(0, r.y - m, 0, r.y + r.h + m); wg.addColorStop(0, '#7d8fb8'); wg.addColorStop(1, '#4d5b82'); b.fillStyle = wg; b.fill(); b.restore();
    b.lineWidth = Math.max(2, 4 * s); b.strokeStyle = OUT; rr(b, r.x - m, r.y - m, r.w + 2 * m, r.h + 2 * m, 34 * s); b.stroke();
    b.strokeStyle = 'rgba(255,255,255,.25)'; b.lineWidth = Math.max(1, 2 * s); rr(b, r.x - m + 5 * s, r.y - m + 5 * s, r.w + 2 * m - 10 * s, r.h + 2 * m - 10 * s, 30 * s); b.stroke();
    // rivets
    b.fillStyle = '#a9b8d8';
    const riv = (x, y) => { b.beginPath(); b.arc(x, y, Math.max(1.5, 3.2 * s), 0, TAU); b.fill(); };
    const step = 70 * s;
    for (let x = r.x + step / 2; x < r.x + r.w; x += step) { riv(x, r.y - m / 2); riv(x, r.y + r.h + m / 2); }
    for (let y = r.y + step / 2; y < r.y + r.h; y += step) { riv(r.x - m / 2, y); riv(r.x + r.w + m / 2, y); }
    // kitchen interior
    b.save(); rr(b, r.x, r.y, r.w, r.h, 18 * s); b.clip();
    const ig = b.createLinearGradient(r.x, r.y, r.x + r.w * 0.3, r.y + r.h); ig.addColorStop(0, '#e6fbf5'); ig.addColorStop(1, '#bfeee2'); b.fillStyle = ig; b.fillRect(r.x, r.y, r.w, r.h);
    // tiles
    const ts = 52 * s; b.strokeStyle = 'rgba(80,170,150,.18)'; b.lineWidth = Math.max(1, 2 * s);
    for (let x = r.x; x < r.x + r.w; x += ts) { b.beginPath(); b.moveTo(x, r.y); b.lineTo(x, r.y + r.h); b.stroke(); }
    for (let y = r.y; y < r.y + r.h; y += ts) { b.beginPath(); b.moveTo(r.x, y); b.lineTo(r.x + r.w, y); b.stroke(); }
    // a few coloured tiles
    const T2 = srand(11); const tc = ['rgba(255,183,3,.16)', 'rgba(255,107,129,.13)', 'rgba(124,108,240,.12)'];
    for (let i = 0; i < 14; i++) { b.fillStyle = tc[i % 3]; b.fillRect(r.x + Math.floor(T2() * r.w / ts) * ts, r.y + Math.floor(T2() * r.h / ts) * ts, ts, ts); }
    // portholes
    const pr = Math.min(r.w, r.h) * 0.085;
    const holes = r.w > r.h ? [[0.2, 0.3], [0.8, 0.68]] : [[0.3, 0.2], [0.68, 0.8]];
    holes.forEach(([fx, fy], i) => {
      const x = r.x + r.w * fx, y = r.y + r.h * fy;
      b.beginPath(); b.arc(x, y, pr * 1.28, 0, TAU); b.fillStyle = '#8796ba'; b.fill(); b.lineWidth = Math.max(2, 3 * s); b.strokeStyle = OUT; b.stroke();
      b.save(); b.beginPath(); b.arc(x, y, pr, 0, TAU); b.clip();
      const sp = b.createRadialGradient(x - pr * 0.4, y - pr * 0.4, 1, x, y, pr * 1.2); sp.addColorStop(0, '#2c2f6b'); sp.addColorStop(1, '#0b0d22'); b.fillStyle = sp; b.fillRect(x - pr, y - pr, pr * 2, pr * 2);
      const S2 = srand(20 + i); for (let k = 0; k < 26; k++) { b.fillStyle = `rgba(255,255,255,${0.3 + S2() * 0.7})`; b.fillRect(x - pr + S2() * pr * 2, y - pr + S2() * pr * 2, 1.4, 1.4); }
      // planet
      const px = x + pr * (i ? -0.25 : 0.3), py = y + pr * (i ? 0.2 : 0.25), pp = pr * (i ? 0.42 : 0.55);
      const pg = b.createRadialGradient(px - pp * 0.4, py - pp * 0.4, 1, px, py, pp); pg.addColorStop(0, i ? '#ffd0a1' : '#9ff3e1'); pg.addColorStop(1, i ? '#e0703d' : '#3aa59a');
      b.beginPath(); b.arc(px, py, pp, 0, TAU); b.fillStyle = pg; b.fill();
      if (!i) { b.strokeStyle = 'rgba(255,230,160,.8)'; b.lineWidth = Math.max(1.5, 2.5 * s); b.beginPath(); b.ellipse(px, py, pp * 1.7, pp * 0.45, -0.35, 0, TAU); b.stroke(); }
      b.restore();
      b.beginPath(); b.arc(x, y, pr, 0, TAU); b.lineWidth = Math.max(2, 3 * s); b.strokeStyle = OUT; b.stroke();
      b.fillStyle = 'rgba(255,255,255,.18)'; b.beginPath(); b.ellipse(x - pr * 0.35, y - pr * 0.4, pr * 0.35, pr * 0.16, -0.6, 0, TAU); b.fill();
    });
    // soft inner shadow
    const sh = 26 * s;
    [[r.x, r.y, r.w, sh, 0, 1], [r.x, r.y + r.h - sh, r.w, sh, 0, -1], [r.x, r.y, sh, r.h, 1, 0], [r.x + r.w - sh, r.y, sh, r.h, -1, 0]].forEach(([x, y, w, h, dx, dy]) => {
      const g = dx ? b.createLinearGradient(dx > 0 ? x : x + w, 0, dx > 0 ? x + w : x, 0) : b.createLinearGradient(0, dy > 0 ? y : y + h, 0, dy > 0 ? y + h : y);
      g.addColorStop(0, 'rgba(40,60,90,.22)'); g.addColorStop(1, 'rgba(40,60,90,0)'); b.fillStyle = g; b.fillRect(x, y, w, h);
    });
    b.restore();
    b.lineWidth = Math.max(2, 3.5 * s); b.strokeStyle = OUT; rr(b, r.x, r.y, r.w, r.h, 18 * s); b.stroke();
  }

  // ======================================================================================
  //  WORLD
  // ======================================================================================
  let G = null;
  const WALLN = { L: [1, 0], R: [-1, 0], T: [0, 1], B: [0, -1] };
  function wallPoint(w, p) { return w === 'L' ? [0, p] : w === 'R' ? [W, p] : w === 'T' ? [p, 0] : [p, H]; }

  function newWorld(def, mode) {
    const w = {
      mode, def, T: 0, acc: 0, uid: 1, oid: 1, items: [], stations: [], ports: [], bumpers: [], segs: [], vents: [], mags: [], fires: [], portals: [],
      orders: [], score: 0, tips: 0, banks: 0, served: 0, strikes: 0, timeLeft: def.time || 0, nextOrder: 1.6, live: false, over: false, screen: 'title',
      gk: [], gBase: { x: 0, y: 0 }, gl: def.glitch ? { phase: 'calm', next: mode === 'demo' ? 3 : rnd(def.glitch.every[0] * 0.6, def.glitch.every[1] * 0.7), lastA: -1 } : null,
      held: null, aim: null, parts: [], pops: [], ghosts: [], coins: [], shake: 0, slow: 1, rejT: {}, flash: 0, bot: 2, tickS: -1, firstThrow: false, tutDone: false,
    };
    G = w;
    (def.st || []).forEach(([t, x, y, bolt], i) => {
      const r = t === 'pot' ? 50 : t === 'board' ? 46 : 44;
      const st = { id: 's' + i, t, x, y, vx: bolt ? 0 : rnd(-25, 25), vy: bolt ? 0 : rnd(-25, 25), r, bolt: !!bolt, mass: 5, c: null, rec: null, list: [], ph: rnd(0, 10), ang: 0, flash: 0, rej: 0 };
      if (bolt) {   // strut to the nearest wall
        const d = [['L', x], ['R', W - x], ['T', y], ['B', H - y]].sort((a, b) => a[1] - b[1])[0][0];
        st.sx = d === 'L' ? 0 : d === 'R' ? W : x; st.sy = d === 'T' ? 0 : d === 'B' ? H : y;
      }
      w.stations.push(st);
    });
    (def.ports || []).forEach(([t, wl, p, size], i) => {
      const [x, y] = wallPoint(wl, p), [nx, ny] = WALLN[wl];
      w.ports.push({ id: 'p' + i, t, w: wl, p, x, y, nx, ny, size: size || (t === 'hatch' ? 150 : t === 'trash' ? 112 : 92), cd: 1 + i * 0.7, fire: 0, next: null, flash: 0 });
    });
    (def.bumpers || []).forEach(([x, y, r]) => w.bumpers.push({ x, y, r, flash: 0 }));
    (def.segs || []).forEach(([x1, y1, x2, y2]) => w.segs.push({ x1, y1, x2, y2, th: 9 }));
    (def.vents || []).forEach((v) => w.vents.push(Object.assign({}, v)));
    (def.mags || []).forEach((m) => w.mags.push(Object.assign({}, m)));
    (def.fires || []).forEach((f) => w.fires.push(Object.assign({ was: false }, f)));
    (def.portals || []).forEach(([ax, ay, bx, by]) => w.portals.push({ a: { x: ax, y: ay, r: 36 }, b: { x: bx, y: by, r: 36 } }));
    (def.init || []).forEach((k) => { const p = freeSpot(KIND[k].r); const it = mkItem(k, p[0], p[1]); it.vx = rnd(-40, 40); it.vy = rnd(-40, 40); w.items.push(it); });
    return w;
  }
  function freeSpot(r) {
    for (let i = 0; i < 60; i++) {
      const x = rnd(90, W - 90), y = rnd(80, H - 80);
      if (G.stations.some((s) => Math.hypot(s.x - x, s.y - y) < s.r + r + 40)) continue;
      if (G.bumpers.some((s) => Math.hypot(s.x - x, s.y - y) < s.r + r + 30)) continue;
      if (G.mags.some((s) => Math.hypot(s.x - x, s.y - y) < 40 + r)) continue;
      if (G.fires.some((f) => x > f.x - r && x < f.x + f.w + r && y > f.y - r && y < f.y + f.h + r)) continue;
      if (G.items.some((s) => Math.hypot(s.x - x, s.y - y) < s.r + r + 10)) continue;
      if (G.segs.some((s) => segDist(x, y, s) < r + 30)) continue;
      if (G.portals.some((p) => Math.hypot(p.a.x - x, p.a.y - y) < 70 || Math.hypot(p.b.x - x, p.b.y - y) < 70)) continue;
      return [x, y];
    }
    return [W / 2 + rnd(-60, 60), H / 2 + rnd(-60, 60)];
  }
  function mkItem(kind, x, y) {
    return { id: 'i' + (G.uid++), kind, x, y, vx: 0, vy: 0, r: KIND[kind].r, ang: rnd(-0.4, 0.4), spin: rnd(-0.6, 0.6), ph: rnd(0, 100), thrown: 0, bounces: 0,
      ignore: null, pin: null, held: false, dead: false, sq: 0, sqp: 0, scorch: 0, blinkAt: rnd(1, 4), born: G.T };
  }

  // ======================================================================================
  //  PHYSICS
  // ======================================================================================
  const E_WALL = 0.8;
  const cycOn = (o, t) => ((t + o.ph) % o.per) / o.per < o.duty;
  const cycUntilOn = (o, t) => { const p = (t + o.ph) % o.per; return p < o.duty * o.per ? 0 : o.per - p; };
  function gravAt(t) {
    let x = G.gBase.x, y = G.gBase.y;
    for (const k of G.gk) { if (t < k.t) break; const f = Math.min(1, (t - k.t) / 0.6); x += (k.x - x) * f; y += (k.y - y) * f; }
    return [x, y];
  }
  function field(x, y, t, heavy) {
    const g = gravAt(t); let ax = g[0] * (heavy ? 0.7 : 1), ay = g[1] * (heavy ? 0.7 : 1);
    for (const v of G.vents) if (cycOn(v, t) && x > v.x && x < v.x + v.w && y > v.y && y < v.y + v.h) { const k = heavy ? 0.3 : 1; ax += v.d[0] * v.p * k; ay += v.d[1] * v.p * k; }
    for (const m of G.mags) if (cycOn(m, t)) {
      const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy);
      if (d < m.R && d > 1) { const f = m.p * (1 - d / m.R) * (heavy ? 0.35 : 1); ax += dx / d * f; ay += dy / d * f; }
    }
    return [ax, ay];
  }
  function integrate(b, h, t, sim) {
    const f = field(b.x, b.y, t, false); let ax = f[0], ay = f[1];
    if (!sim) { ax += Math.sin(t * 0.9 + b.ph) * 13; ay += Math.cos(t * 0.7 + b.ph * 1.3) * 13; }
    b.vx += ax * h; b.vy += ay * h;
    const sp = Math.hypot(b.vx, b.vy);
    let k = 0.16; if (!b.thrown && sp > 150) k += 1.6 * (1 - 150 / sp);
    const dm = Math.exp(-k * h); b.vx *= dm; b.vy *= dm;
    if (sp > 1500) { b.vx *= 1500 / sp; b.vy *= 1500 / sp; }
    b.x += b.vx * h; b.y += b.vy * h;
  }
  function bounceN(b, nx, ny, e, ev, what, obj) {
    const vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return;
    if (-vn < 35) { b.vx -= vn * nx; b.vy -= vn * ny; b.vx *= 0.985; b.vy *= 0.985; return; }   // resting contact, no bounce
    const vt = b.vx * -ny + b.vy * nx;
    b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
    b.spin = clamp((b.spin || 0) * 0.5 + vt * 0.012, -9, 9);
    b.bounces++; ev.push({ e: 'bounce', x: b.x - nx * b.r, y: b.y - ny * b.r, sp: -vn, what, obj });
  }
  function wallHit(b, w, pen, ev) {
    const along = (w === 'L' || w === 'R') ? b.y : b.x;
    for (const p of G.ports) {
      if (p.w !== w || (p.t !== 'hatch' && p.t !== 'trash') || Math.abs(along - p.p) > p.size / 2 - 6) continue;
      const a = accepts(p, b);
      if (a.ok) { ev.push({ e: 'absorb', tg: p }); b.dead = true; return; }
      if (!a.quiet) ev.push({ e: 'reject', tg: p, why: a.why });
    }
    const n = WALLN[w]; b.x += n[0] * pen; b.y += n[1] * pen;
    bounceN(b, n[0], n[1], E_WALL, ev, 'wall');
  }
  function segDist(x, y, s) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, u = clamp(((x - s.x1) * dx + (y - s.y1) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - (s.x1 + dx * u), y - (s.y1 + dy * u));
  }
  function segHit(b, s, ev) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, u = clamp(((b.x - s.x1) * dx + (b.y - s.y1) * dy) / (dx * dx + dy * dy), 0, 1);
    const qx = s.x1 + dx * u, qy = s.y1 + dy * u; let ex = b.x - qx, ey = b.y - qy; const d = Math.hypot(ex, ey), R = b.r + s.th;
    if (d >= R) return;
    if (d < 1e-6) { ex = -dy; ey = dx; } const n = 1 / Math.hypot(ex, ey); ex *= n; ey *= n;
    b.x = qx + ex * R; b.y = qy + ey * R;
    bounceN(b, ex, ey, E_WALL, ev, 'seg');
  }
  function circHit(b, cx, cy, cr, e, ev, what, obj) {
    const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), R = b.r + cr;
    if (d >= R) return;
    const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : -1;
    b.x = cx + nx * R; b.y = cy + ny * R;
    if (what === 'bumper') {
      const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
      const v2 = b.vx * nx + b.vy * ny, want = Math.max(v2 * 1.05, 540); b.vx += (want - v2) * nx; b.vy += (want - v2) * ny;
      b.bounces++; ev.push({ e: 'bounce', x: cx + nx * cr, y: cy + ny * cr, sp: want, what, obj }); return;
    }
    bounceN(b, nx, ny, e, ev, what, obj);
  }
  function stPos(st, ahead) {
    if (st.bolt || !ahead) return [st.x, st.y];
    return [clamp(st.x + st.vx * ahead, st.r, W - st.r), clamp(st.y + st.vy * ahead, st.r, H - st.r)];
  }
  function stationHit(b, st, ahead, ev) {
    const [sx, sy] = stPos(st, ahead);
    const dx = b.x - sx, dy = b.y - sy, d = Math.hypot(dx, dy), R = b.r + st.r;
    if (b.ignore === st.id) { if (d > R + 2) b.ignore = null; else return; }
    if (d >= R) return;
    const a = accepts(st, b);
    if (a.ok) { ev.push({ e: 'absorb', tg: st }); b.dead = true; return; }
    if (!a.quiet) ev.push({ e: 'reject', tg: st, why: a.why });
    const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : -1;
    if (st.bolt || b.sim) { b.x = sx + nx * R; b.y = sy + ny * R; bounceN(b, nx, ny, 0.6, ev, 'station', st); return; }
    const ov = R - d; b.x += nx * ov * 5 / 6; b.y += ny * ov * 5 / 6; st.x -= nx * ov / 6; st.y -= ny * ov / 6;
    const rv = (b.vx - st.vx) * nx + (b.vy - st.vy) * ny;
    if (rv < 0) {
      const j = -1.6 * rv / (1 + 1 / st.mass); b.vx += j * nx; b.vy += j * ny; st.vx -= j * nx / st.mass; st.vy -= j * ny / st.mass;
      if (-rv > 35) { b.bounces++; ev.push({ e: 'bounce', x: b.x - nx * b.r, y: b.y - ny * b.r, sp: -rv, what: 'station', obj: st }); }
    }
  }
  function portalCheck(b, ev) {
    if (b.pin) { if (Math.hypot(b.x - b.pin.x, b.y - b.pin.y) > b.pin.r + b.r * 0.5) b.pin = null; else return; }
    for (const pr of G.portals) for (const [A, B] of [[pr.a, pr.b], [pr.b, pr.a]]) {
      if (Math.hypot(b.x - A.x, b.y - A.y) < A.r * 0.7) {
        const sp = Math.hypot(b.vx, b.vy) || 1; b.x = B.x + b.vx / sp * 4; b.y = B.y + b.vy / sp * 4; b.pin = B;
        ev.push({ e: 'portal', a: A, b: B }); return;
      }
    }
  }
  function collideWorld(b, ahead, ev) {
    if (b.x < b.r) wallHit(b, 'L', b.r - b.x, ev); else if (b.x > W - b.r) wallHit(b, 'R', b.x - (W - b.r), ev);
    if (b.dead) return;
    if (b.y < b.r) wallHit(b, 'T', b.r - b.y, ev); else if (b.y > H - b.r) wallHit(b, 'B', b.y - (H - b.r), ev);
    if (b.dead) return;
    for (const s of G.segs) segHit(b, s, ev);
    for (const bp of G.bumpers) circHit(b, bp.x, bp.y, bp.r, 1, ev, 'bumper', bp);
    for (const m of G.mags) circHit(b, m.x, m.y, 24, 0.5, ev, 'mag', m);
    for (const st of G.stations) { stationHit(b, st, ahead, ev); if (b.dead) return; }
    portalCheck(b, ev);
    b.x = clamp(b.x, b.r, W - b.r); b.y = clamp(b.y, b.r, H - b.r);
  }
  const inFire = (x, y, r, t) => G.fires.some((f) => cycOn(f, t) && x > f.x - r * 0.4 && x < f.x + f.w + r * 0.4 && y > f.y - r * 0.4 && y < f.y + f.h + r * 0.4);

  // what each station takes (only food that was flung counts)
  const Q = { ok: false, quiet: true }, OK = { ok: true };
  const NO = (why) => ({ ok: false, why });
  function potRecipeFor(k) {
    const ks = Object.keys(G.def.menu).filter((d) => POT[d] && POT[d][0] === k);
    return ks.find((d) => G.orders.some((o) => o.d === d)) || ks[0] || null;
  }
  function accepts(tg, b) {
    if (!b.thrown) return Q;
    const k = b.kind, K = KIND[k];
    switch (tg.t) {
      case 'pan':
        if (tg.c) return NO('busy');
        if (K.fry) return OK;
        if (K.chop && KIND[K.chop].fry) return NO('chopfirst');
        return NO('nope');
      case 'board':
        if (tg.c) return NO('busy');
        return K.chop ? OK : NO('nope');
      case 'pot': {
        if (tg.c) return NO('busy');
        if (!tg.rec) { if (potRecipeFor(k)) return OK; if (K.chop && potRecipeFor(K.chop)) return NO('chopfirst'); return NO('nope'); }
        const nx = POT[tg.rec][tg.list.length];
        if (k === nx) return OK;
        if (K.chop === nx) return NO('chopfirst');
        return NO('wrongnext');
      }
      case 'hatch': return G.orders.some((o) => o.d === k) ? OK : NO('noorder');
      case 'trash': return OK;
    }
    return Q;
  }

  // trajectory preview: same physics, static snapshot (drifting stations extrapolated), up to two bounces
  function simulate(src, vx, vy) {
    const b = { x: src.x, y: src.y, vx, vy, r: src.r, kind: src.kind, thrown: 5, bounces: 0, ignore: src.ignore, pin: null, sim: true, dead: false, spin: 0 };
    const pts = [], marks = [], ev = []; let t = 0, after = -1, end = null, rej = null, fire = false, bump = null;
    const others = G.items.filter((o) => o !== src && !o.held && !o.dead);
    pts.push([b.x, b.y, 0, 0]);
    for (let i = 0; i < 380; i++) {
      integrate(b, STEP, G.T + t, true); t += STEP;
      ev.length = 0; collideWorld(b, t, ev);
      for (const e of ev) {
        if (e.e === 'bounce') marks.push([e.x, e.y, e.what]);
        else if (e.e === 'absorb') end = e.tg;
        else if (e.e === 'reject' && !rej) rej = { tg: e.tg, why: e.why, x: b.x, y: b.y };
        else if (e.e === 'portal') { pts.push(null); pts.push([b.x, b.y, b.bounces, 0]); }
      }
      if (isFood(b.kind) && inFire(b.x, b.y, b.r, G.T + t)) { b.kind = 'burnt'; fire = true; }
      if (!b.dead) for (const o of others) {   // floating food in the way (drift extrapolated): the shot stops there
        const ox = o.x + o.vx * t, oy = o.y + o.vy * t, rr2 = b.r + o.r;
        if ((b.x - ox) * (b.x - ox) + (b.y - oy) * (b.y - oy) < rr2 * rr2) { bump = [b.x, b.y]; break; }
      }
      if (i % 3 === 2 || b.dead || bump) pts.push([b.x, b.y, b.bounces, fire ? 1 : 0]);
      if (b.dead || bump) break;
      if (b.bounces >= 2 && after < 0) after = t + 0.3;
      if ((after >= 0 && t > after) || t > 2.6) break;
      if (b.vx * b.vx + b.vy * b.vy < 900) break;
    }
    return { pts, marks, end, rej, fire, t, bump };
  }

  // one fixed physics step for the live world
  function stepWorld(h) {
    G.T += h;
    const ev = [];
    for (const it of G.items) {
      if (it.held || it.dead) continue;
      if (it.thrown > 0) it.thrown = Math.max(0, it.thrown - h);
      integrate(it, h, G.T, false);
      ev.length = 0; collideWorld(it, 0, ev);
      if (ev.length) handleEvents(it, ev);
      it.ang += it.spin * h; it.spin *= Math.exp(-0.25 * h);
      if (it.sq > 0.002) { it.sq *= Math.exp(-5 * h); it.sqp += 26 * h; }
      // fire jets scorch food
      if (!it.dead && isFood(it.kind) && inFire(it.x, it.y, it.r, G.T)) { it.scorch += h; if (it.scorch > 0.08) scorch(it); } else it.scorch = 0;
    }
    // held items can still get scorched
    if (G.held && isFood(G.held.kind) && inFire(G.held.x, G.held.y, G.held.r, G.T)) scorch(G.held);
    // drifting cookware
    for (const st of G.stations) {
      if (st.bolt) continue;
      const f = field(st.x, st.y, G.T, true);
      st.vx += (f[0] + Math.sin(G.T * 0.45 + st.ph) * 9) * h; st.vy += (f[1] + Math.cos(G.T * 0.38 + st.ph * 1.7) * 9) * h;
      const sp = Math.hypot(st.vx, st.vy); if (sp > 60) { const d = Math.exp(-1.4 * h * (1 - 60 / sp)); st.vx *= d; st.vy *= d; }
      st.x += st.vx * h; st.y += st.vy * h;
      if (st.x < st.r) { st.x = st.r; st.vx = Math.abs(st.vx) * 0.6; } else if (st.x > W - st.r) { st.x = W - st.r; st.vx = -Math.abs(st.vx) * 0.6; }
      if (st.y < st.r) { st.y = st.r; st.vy = Math.abs(st.vy) * 0.6; } else if (st.y > H - st.r) { st.y = H - st.r; st.vy = -Math.abs(st.vy) * 0.6; }
      const sev = [];
      const fake = { x: st.x, y: st.y, vx: st.vx, vy: st.vy, r: st.r, bounces: 0, thrown: 0 };
      for (const s of G.segs) segHit(fake, s, sev);
      for (const bp of G.bumpers) circHit(fake, bp.x, bp.y, bp.r, 0.8, sev, 'sbump', bp);
      for (const m of G.mags) circHit(fake, m.x, m.y, 24, 0.2, sev, 'mag', m);
      st.x = fake.x; st.y = fake.y; st.vx = fake.vx; st.vy = fake.vy;
      for (const o of G.stations) {
        if (o === st) continue;
        const dx = st.x - o.x, dy = st.y - o.y, d = Math.hypot(dx, dy), R = st.r + o.r;
        if (d >= R || d === 0) continue;
        const nx = dx / d, ny = dy / d, ov = R - d;
        if (o.bolt) { st.x += nx * ov; st.y += ny * ov; const vn = st.vx * nx + st.vy * ny; if (vn < 0) { st.vx -= 1.6 * vn * nx; st.vy -= 1.6 * vn * ny; } }
        else { st.x += nx * ov / 2; st.y += ny * ov / 2; o.x -= nx * ov / 2; o.y -= ny * ov / 2; const rv = (st.vx - o.vx) * nx + (st.vy - o.vy) * ny; if (rv < 0) { const j = -0.8 * rv; st.vx += j * nx; st.vy += j * ny; o.vx -= j * nx; o.vy -= j * ny; } }
      }
    }
    // food bumping into food
    const its = G.items;
    for (let i = 0; i < its.length; i++) {
      const a = its[i]; if (a.dead) continue;
      for (let j = i + 1; j < its.length; j++) {
        const b = its[j]; if (b.dead || (a.held && b.held)) continue;
        const dx = b.x - a.x, dy = b.y - a.y, R = a.r + b.r; if (Math.abs(dx) > R || Math.abs(dy) > R) continue;
        const d = Math.hypot(dx, dy); if (d >= R || d === 0) continue;
        const ma = a.held ? 0 : 1, mb = b.held ? 0 : 1, sum = ma + mb, nx = dx / d, ny = dy / d, ov = R - d;
        a.x -= nx * ov * ma / sum; a.y -= ny * ov * ma / sum; b.x += nx * ov * mb / sum; b.y += ny * ov * mb / sum;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) {
          const jj = -1.7 * rv / sum; a.vx -= jj * nx * ma; a.vy -= jj * ny * ma; b.vx += jj * nx * mb; b.vy += jj * ny * mb;
          if (-rv > 120) { SFX.tonk(-rv * 0.6); a.sq = b.sq = Math.min(0.3, -rv / 1500); a.spin += rnd(-2, 2); b.spin += rnd(-2, 2); }
        }
      }
    }
    if (G.items.some((i) => i.dead)) G.items = G.items.filter((i) => !i.dead);
  }

  function handleEvents(it, ev) {
    for (const e of ev) {
      if (e.e === 'bounce') {
        if (e.what === 'bumper') {
          e.obj.flash = 1; SFX.boing(); G.shake = Math.max(G.shake, 5); burst(e.x, e.y, 10, '#ff8fb1', 260, 'star', 7);
        } else if (e.sp > 80) {
          SFX.tonk(e.sp);
          if (e.sp > 260) { burst(e.x, e.y, 5, '#ffffff', 120, 'dot', 4); if (e.sp > 600) G.shake = Math.max(G.shake, 2.5); }
        }
        it.sq = Math.min(0.35, e.sp / 1400); it.sqp = 0;
        if (e.what === 'station' && e.obj) e.obj.wob = 1;
      } else if (e.e === 'absorb') absorb(it, e.tg);
      else if (e.e === 'reject') reject(it, e.tg, e.why);
      else if (e.e === 'portal') { SFX.portal(); burst(e.a.x, e.a.y, 10, '#b98cff', 160, 'star', 6); burst(e.b.x, e.b.y, 12, '#7fe3cf', 200, 'star', 6); }
    }
  }

  // ======================================================================================
  //  GAME LOGIC
  // ======================================================================================
  function tgPos(tg) { return tg.t === 'hatch' || tg.t === 'trash' || tg.t === 'tube' ? [tg.x + tg.nx * 20, tg.y + tg.ny * 20] : [tg.x, tg.y]; }
  function absorb(it, tg) {
    it.dead = true;
    const [px, py] = tgPos(tg);
    G.ghosts.push({ kind: it.kind, x: it.x, y: it.y, tx: px, ty: py, t: 0, r: it.r, ang: it.ang });
    tg.flash = 1;
    let bonus = 0;
    if (it.bounces > 0 && tg.t !== 'trash') { const n = Math.min(3, it.bounces); bonus = n * (tg.t === 'hatch' ? 10 : 5); G.banks++; }
    switch (tg.t) {
      case 'pan': tg.c = { k: it.kind, out: KIND[it.kind].fry, t: 0, cook: COOK[it.kind] || 4.5, ph: 'cook' }; SFX.sizzle(); burst(px, py, 12, '#ffd34d', 160, 'spark', 4); break;
      case 'board': tg.c = { k: it.kind, out: KIND[it.kind].chop, t: 0, ph: 'chop', hits: 0 }; SFX.thunk(); break;
      case 'pot':
        if (!tg.rec) { tg.rec = potRecipeFor(it.kind); tg.list = []; }
        tg.list.push(it.kind); SFX.plop(); burst(px, py - 30, 10, '#7fd3ff', 150, 'dot', 5);
        if (tg.list.length >= POT[tg.rec].length) tg.c = { out: tg.rec, t: 0, cook: BOIL, ph: 'cook' };
        break;
      case 'hatch': serve(it.kind, tg, bonus); bonus = 0; break;
      case 'trash': SFX.trash(); pop(px + tg.nx * 30, py + tg.ny * 30, t('gc_p_recycled'), '#c9d3ff', 0.8); burst(px, py, 10, '#9aa3c7', 120, 'smoke', 8); break;
    }
    if (bonus) { G.score += bonus; pop(px, py - 46, t('gc_p_bank', { n: bonus }), '#7fe3cf', 1); SFX.star(1); }
    if (G.def.tut && !G.tutDone && tg.t === 'hatch') G.tutDone = true;
  }
  function reject(it, tg, why) {
    const n = performance.now(); if ((G.rejT[tg.id] || 0) > n) return; G.rejT[tg.id] = n + 900;
    const [px, py] = tgPos(tg);
    pop(px, py - (tg.r || 30) - 18, t('gc_p_' + why), '#ff8fa3', 0.9); SFX.nope(); tg.rej = 1;
  }
  function scorch(it) {
    it.kind = 'burnt'; it.r = KIND.burnt.r; it.scorch = 0;
    SFX.scorch(); burst(it.x, it.y, 14, '#5b5560', 120, 'smoke', 12); burst(it.x, it.y, 10, '#ff8a2b', 200, 'spark', 4);
    pop(it.x, it.y - 34, t('gc_p_scorched'), '#ffb36b', 0.9);
  }
  function serve(kind, port, bonus) {
    const i = G.orders.findIndex((o) => o.d === kind); if (i < 0) return;
    const o = G.orders.splice(i, 1)[0];
    const base = DISH[kind].v, tip = Math.round(base * 0.6 * clamp(o.t / o.max, 0, 1));
    G.score += base + tip + bonus; G.tips += tip; G.served++;
    const [px, py] = tgPos(port);
    pop(px + port.nx * 40, py + port.ny * 40 - 10, '+' + base, '#ffd34d', 1.25);
    if (tip > 0) pop(px + port.nx * 40, py + port.ny * 40 + 22, t('gc_p_tip', { n: tip }), '#ffe08a', 0.85);
    if (bonus) pop(px + port.nx * 40, py + port.ny * 40 + 50, t('gc_p_bank', { n: bonus }), '#7fe3cf', 0.85);
    SFX.serve(); G.shake = Math.max(G.shake, 3);
    burst(px, py, 26, '#ffd34d', 300, 'star', 7); burst(px, py, 14, '#ffffff', 200, 'dot', 4);
    const [sx, sy] = toS(px, py), el = $('hScore'), r = el && el.getBoundingClientRect();
    if (r) for (let k = 0; k < Math.min(12, 3 + Math.round((base + tip) / 10)); k++) G.coins.push({ x: sx + rnd(-20, 20), y: sy + rnd(-20, 20), tx: r.left + r.width / 2, ty: r.top + r.height / 2, t: -k * 0.05, vx: rnd(-200, 200), vy: rnd(-260, -60) });
    if (G.orders.length === 0) G.nextOrder = Math.min(G.nextOrder, 2.5);
  }
  function addOrder() {
    const ks = Object.keys(G.def.menu); if (!ks.length) return;
    let k;
    if (G.def.tut && G.oid <= 2) k = ks[(G.oid - 1) % ks.length];
    else {
      const w = ks.map((d) => G.def.menu[d] / (1 + 1.5 * G.orders.filter((o) => o.d === d).length + (G.orders.length && G.orders[G.orders.length - 1].d === d ? 1 : 0)));
      let r = Math.random() * w.reduce((a, b) => a + b, 0); k = ks[ks.length - 1];
      for (let i = 0; i < ks.length; i++) { r -= w[i]; if (r <= 0) { k = ks[i]; break; } }
    }
    const max = DISH[k].pat * G.def.patM;
    G.orders.push({ id: G.oid++, d: k, t: max, max, born: G.T, in: 0 });
    SFX.order();
  }
  function deficit(extra) {
    const need = {}, have = {};
    for (const o of G.orders) for (const r of rawOf(o.d)) need[r] = (need[r] || 0) + 1;
    const addHave = (k) => { for (const r of rawOf(k)) have[r] = (have[r] || 0) + 1; };
    for (const it of G.items) addHave(it.kind);
    for (const st of G.stations) {
      if (st.t === 'pot') st.list.forEach(addHave);
      if (st.c && st.c.ph !== 'burnt') addHave(st.t === 'pot' ? st.c.out : st.c.k);
    }
    (extra || []).forEach(addHave);
    const out = [];
    for (const k in need) for (let i = (have[k] || 0); i < need[k]; i++) out.push(k);
    return out;
  }
  function supply(dt) {
    const tubes = G.ports.filter((p) => p.t === 'tube');
    for (const p of tubes) {
      if (p.fire > 0) {   // about to pop an ingredient out
        p.fire -= dt;
        if (p.fire <= 0 && p.next) {
          const it = mkItem(p.next, p.x + p.nx * (KIND[p.next].r + 30), p.y + p.ny * (KIND[p.next].r + 30));
          const a = Math.atan2(p.ny, p.nx) + rnd(-0.45, 0.45), sp = rnd(170, 250);
          it.vx = Math.cos(a) * sp; it.vy = Math.sin(a) * sp; it.spin = rnd(-3, 3);
          G.items.push(it); p.next = null; p.flash = 1; SFX.pop(); burst(it.x, it.y, 8, '#ffffff', 140, 'dot', 4);
        }
        continue;
      }
      p.cd -= dt; if (p.cd > 0) continue;
      const free = G.items.length;
      if (free >= (G.def.maxItems || 12)) { p.cd = 1; continue; }
      const pend = tubes.filter((q) => q.next).map((q) => q.next);
      const def = deficit(pend);
      let k = null;
      if (def.length) k = pick(def); else if (free < (G.mode === 'demo' ? 9 : 4) && G.def.pool && G.def.pool.length) k = pick(G.def.pool);
      if (!k) { p.cd = 0.8; continue; }
      p.next = k; p.fire = 0.7; p.cd = def.length ? rnd(1.6, 2.4) : rnd(4, 6);
    }
  }
  function glitchUpdate() {
    const gd = G.def.glitch, s = G.gl; if (!gd || !s) return;
    while (G.gk.length && G.gk[0].t + 0.6 < G.T) { const k = G.gk.shift(); G.gBase = { x: k.x, y: k.y }; }
    if (s.phase === 'calm' && G.T >= s.next) {
      const n = gd.diag ? 8 : 4; let ai; do { ai = Math.floor(Math.random() * n); } while (ai === s.lastA && n > 1);
      s.lastA = ai; const a = ai * TAU / n, str = rnd(gd.str[0], gd.str[1]);
      s.tx = Math.cos(a) * str; s.ty = Math.sin(a) * str; s.at = G.T + 3; s.until = s.at + rnd(gd.dur[0], gd.dur[1]); s.phase = 'warn'; s.beep = 0;
      G.gk.push({ t: s.at, x: s.tx, y: s.ty }, { t: s.until, x: 0, y: 0 });
      if (G.mode === 'play') { SFX.alarm(); pop(W / 2, 70, t('gc_p_soon'), '#ff8fa3', 1.1); }
    } else if (s.phase === 'warn') {
      if (G.T - s.beep > 0.75 && G.mode === 'play') { s.beep = G.T; SFX.alarm(); }
      if (G.T >= s.at) { s.phase = 'on'; if (G.mode === 'play') { SFX.wub(); G.shake = 9; pop(W / 2, 80, t('gc_p_glitch'), '#d7b8ff', 1.2); } burst(W / 2, 40, 22, '#c79bff', 260, 'spark', 5); }
    } else if (s.phase === 'on' && G.T >= s.until) {
      s.phase = 'calm'; s.next = G.T + rnd(gd.every[0], gd.every[1]);
      if (G.mode === 'play') { pop(W / 2, 80, t('gc_p_restored'), '#7fe3cf', 1); SFX.portal(); }
    }
  }
  function stationsUpdate(dt) {
    for (const st of G.stations) {
      st.flash = Math.max(0, st.flash - dt * 3); st.rej = Math.max(0, st.rej - dt * 3); st.wob = Math.max(0, (st.wob || 0) - dt * 2);
      const c = st.c; if (!c) continue;
      c.t += dt;
      if (st.t === 'board') {
        if (c.ph === 'chop') {
          const hits = Math.floor(c.t / 0.25); if (hits > c.hits && hits <= 3) { c.hits = hits; SFX.thunk(); burst(st.x + 10, st.y - 4, 5, '#ffe6b3', 110, 'dot', 4); st.wob = 0.6; }
          if (c.t >= 0.85) { c.ph = 'ready'; c.t = 0; SFX.ding(); pop(st.x, st.y - 62, t('gc_p_ready'), '#80ed99', 0.8); }
        }
        continue;
      }
      const doneWin = (G.def.done || 7) + (st.t === 'pot' ? 3 : 0);
      if (c.ph === 'cook') {
        if (Math.random() < dt * (st.t === 'pan' ? 14 : 6)) part(st.x + rnd(-st.r * 0.5, st.r * 0.5), st.y + rnd(-st.r * 0.5, st.r * 0.2) - (st.t === 'pot' ? 25 : 0), st.t === 'pan' ? { type: 'spark', col: '#ffe08a', vx: rnd(-50, 50), vy: rnd(-120, -40), life: 0.4, size: 3 } : { type: 'bubble', col: '#d8f4ff', vx: rnd(-10, 10), vy: rnd(-60, -30), life: 0.7, size: 5 });
        if (c.t >= c.cook) { c.ph = 'done'; c.t = 0; SFX.ding(); pop(st.x, st.y - st.r - 24, t('gc_p_ready'), '#80ed99', 0.9); burst(st.x, st.y, 10, '#80ed99', 150, 'star', 5); }
      } else if (c.ph === 'done') {
        if (Math.random() < dt * 4) part(st.x + rnd(-15, 15), st.y - st.r * 0.4, { type: 'steam', col: '#ffffff', vx: rnd(-10, 10), vy: rnd(-50, -30), life: 1, size: 8 });
        if (c.t >= doneWin) { c.ph = 'warn'; c.t = 0; c.beep = 0; pop(st.x, st.y - st.r - 24, t('gc_p_burning'), '#ffb36b', 0.9); }
      } else if (c.ph === 'warn') {
        if (c.t - c.beep > 0.45) { c.beep = c.t; SFX.beep(); }
        if (Math.random() < dt * 12) part(st.x + rnd(-15, 15), st.y - st.r * 0.3, { type: 'smoke', col: '#7a7480', vx: rnd(-15, 15), vy: rnd(-70, -40), life: 1.1, size: 9 });
        if (c.t >= 3) { c.ph = 'burnt'; c.out = 'burnt'; c.t = 0; SFX.poof(); burst(st.x, st.y, 18, '#4d4652', 160, 'smoke', 14); pop(st.x, st.y - st.r - 24, t('gc_p_burnt'), '#ff8fa3', 1); }
      } else if (c.ph === 'burnt') {
        if (Math.random() < dt * 3) part(st.x + rnd(-10, 10), st.y - 10, { type: 'smoke', col: '#5b5560', vx: rnd(-10, 10), vy: rnd(-40, -20), life: 1.4, size: 10 });
      }
    }
  }
  const readyPh = (c) => c && (c.ph === 'done' || c.ph === 'warn' || c.ph === 'ready' || c.ph === 'burnt');
  function takeFrom(st) {
    const c = st.c; if (!readyPh(c)) return null;
    const it = mkItem(c.out, st.x, st.y); it.ignore = st.id; it.vx = st.vx; it.vy = st.vy;
    st.c = null; if (st.t === 'pot') { st.rec = null; st.list = []; }
    G.items.push(it); return it;
  }

  function update(rdt) {
    if (!G) return;
    const playing = G.mode === 'play' && G.screen === 'play';
    const demo = G.mode === 'demo';
    if (!playing && !demo && G.screen !== 'intro' && G.screen !== 'ending') { tickFx(0); return; }
    // slow motion while aiming
    G.slow += ((G.held && playing ? 0.55 : 1) - G.slow) * Math.min(1, rdt * 8);
    const dt = rdt * G.slow;
    G.acc += dt; let n = 0;
    while (G.acc >= STEP && n < 10) { stepWorld(STEP); G.acc -= STEP; n++; }
    if (n >= 10) G.acc = 0;
    if (G.live || demo) glitchUpdate();
    if (G.live) {
      G.timeLeft -= dt;
      stationsUpdate(dt);
      supply(dt);
      G.nextOrder -= dt;
      if (G.nextOrder <= 0 && G.orders.length < G.def.maxQ) { addOrder(); G.nextOrder = rnd(G.def.every[0], G.def.every[1]); }
      if (G.orders.length === 0 && G.nextOrder > 3) G.nextOrder = 3;
      for (const o of G.orders) { o.t -= dt; o.in = Math.min(1, o.in + rdt * 3); }
      const gone = G.orders.filter((o) => o.t <= 0);
      if (gone.length) {
        G.orders = G.orders.filter((o) => o.t > 0);
        for (const o of gone) { G.strikes++; SFX.left(); G.shake = Math.max(G.shake, 6); pop(W / 2, H / 2, t('gc_p_left'), '#ff8fa3', 1.2); }
      }
      const sec = Math.ceil(G.timeLeft);
      if (sec <= 10 && sec !== G.tickS && sec > 0) { G.tickS = sec; SFX.tick(); if (sec === 10) banner(t('gc_tenLeft'), 1); }
      if (G.strikes >= (G.def.lives || 3)) endShift(false, 'strikes');
      else if (G.timeLeft <= 0) endShift(G.score >= G.def.stars[0], 'score');
    } else if (demo) {
      supply(dt); demoBot(dt);
    }
    tickFx(dt);
  }
  function tickFx(dt) {
    G.shake = Math.max(0, G.shake - dt * 30);
    for (const p of G.ports) p.flash = Math.max(0, p.flash - dt * 2.5);
    for (const b of G.bumpers) b.flash = Math.max(0, b.flash - dt * 4);
    for (const p of G.parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.type === 'smoke' || p.type === 'steam') { p.vx *= 0.98; p.vy *= 0.98; p.size += dt * 14; } else if (p.type !== 'bubble') { p.vx *= 0.95; p.vy *= 0.95; }
    }
    G.parts = G.parts.filter((p) => p.life > 0);
    for (const p of G.pops) p.life -= dt;
    G.pops = G.pops.filter((p) => p.life > 0);
    for (const g of G.ghosts) g.t += dt * 5;
    G.ghosts = G.ghosts.filter((g) => g.t < 1);
    for (const c of G.coins) { c.t += dt; if (c.t > 0) { const k = clamp((c.t - 0.25) * 2.2, 0, 1); if (k <= 0) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 500 * dt; } else { c.x += (c.tx - c.x) * k * 0.35; c.y += (c.ty - c.y) * k * 0.35; } } }
    const before = G.coins.length;
    G.coins = G.coins.filter((c) => c.t < 0 || Math.hypot(c.tx - c.x, c.ty - c.y) > 14);
    if (G.coins.length < before) { AU.tone(1600 + Math.random() * 300, 0.04, 'sine', 0.04); const el = $('hScore'); if (el) { el.style.transform = 'scale(1.3)'; clearTimeout(el._t); el._t = setTimeout(() => el.style.transform = '', 120); } }
    // sizzle loop follows the frying pans
    if (AU.siz) { const n = G.mode === 'play' && G.screen === 'play' ? G.stations.filter((s) => s.t === 'pan' && s.c && s.c.ph !== 'burnt').length : 0; AU.siz.gain.setTargetAtTime(SAVE.sound ? Math.min(0.05, n * 0.022) : 0, AU.ctx.currentTime, 0.1); }
  }
  function part(x, y, o) { if (G.parts.length > 380) return; const p = Object.assign({ x, y, vx: 0, vy: 0, life: 0.6, size: 5, col: '#fff', type: 'dot' }, o); p.max = p.life; G.parts.push(p); }
  function burst(x, y, n, col, sp, type, size) {
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(sp * 0.3, sp); part(x, y, { vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.35, 0.75), col, type: type || 'dot', size: rnd(size * 0.6, size * 1.3) }); }
  }
  function pop(x, y, text, col, size) { G.pops.push({ x, y, text, col, size: size || 1, life: 1.3, max: 1.3 }); }

  // the title-screen kitchen: food drifts, gravity glitches, and an invisible cook flings things now and then
  function demoBot(dt) {
    G.bot -= dt; if (G.bot > 0 || G.held) return;
    G.bot = rnd(1.4, 2.8);
    const its = G.items; if (!its.length) return;
    const it = pick(its), a = rnd(0, TAU), sp = rnd(350, 750);
    it.vx = Math.cos(a) * sp; it.vy = Math.sin(a) * sp; it.spin = rnd(-6, 6);
    burst(it.x, it.y, 6, '#ffffff', 120, 'dot', 4);
  }

  // ======================================================================================
  //  INPUT
  // ======================================================================================
  let ptr = null;   // {id, type}
  let hoverW = null;
  function grabTarget(wx, wy, touch) {
    const pad = (touch ? 30 : 12) / L.s;
    let best = null, bd = Infinity;
    for (const it of G.items) { if (it.dead) continue; const d = Math.hypot(it.x - wx, it.y - wy) - it.r; if (d < pad && d < bd) { bd = d; best = { it }; } }
    for (const st of G.stations) { if (!readyPh(st.c)) continue; const d = Math.hypot(st.x - wx, st.y - wy) - st.r; if (d < pad * 0.6 && d < bd) { bd = d; best = { st }; } }
    return best;
  }
  function grabIt(it) {
    G.held = it; it.held = true; it.vx = it.vy = 0; G.aim = { x: it.x, y: it.y }; SFX.grab();
    burst(it.x, it.y, 8, '#ffd34d', 120, 'star', 4);
  }
  function pullVel() {
    const it = G.held, a = G.aim; if (!it || !a) return null;
    const dx = it.x - a.x, dy = it.y - a.y, len = Math.hypot(dx, dy);
    if (len < 16) return null;
    const p = clamp((len - 12) / 190, 0, 1), sp = 140 + p * 960;
    return [dx / len * sp, dy / len * sp, p];
  }
  function release(v) {
    const it = G.held; if (!it) return;
    it.held = false; G.held = null; G.aim = null;
    if (!v) { it.vx = rnd(-12, 12); it.vy = rnd(-12, 12); return; }
    it.vx = v[0]; it.vy = v[1]; it.thrown = G.mode === 'play' ? 5 : 0; it.bounces = 0; it.spin = rnd(-5, 5);
    SFX.fling(v[2] == null ? 0.6 : v[2]); burst(it.x, it.y, 10, '#ffffff', 180, 'dot', 4);
    G.firstThrow = true;
  }
  const canInteract = () => G && (G.screen === 'play' || (G.mode === 'demo' && G.screen === 'title'));
  cv.addEventListener('pointerdown', (e) => {
    AU.init();
    if (!canInteract()) return;
    if (e.button === 2) { if (G.held) release(null); return; }
    if (ptr) return;
    const [wx, wy] = toW(e.clientX, e.clientY);
    const tg = grabTarget(wx, wy, e.pointerType !== 'mouse');
    if (!tg) {
      burst(wx, wy, 5, 'rgba(255,255,255,.8)', 60, 'dot', 3);
      const busy = G.stations.find((s) => s.c && (s.c.ph === 'cook' || s.c.ph === 'chop') && Math.hypot(s.x - wx, s.y - wy) < s.r + 10);
      if (busy && G.mode === 'play' && (G.rejT['tap' + busy.id] || 0) < performance.now()) { G.rejT['tap' + busy.id] = performance.now() + 800; pop(busy.x, busy.y - busy.r - 24, t('gc_p_cooking'), '#ffe08a', 0.8); }
      return;
    }
    let it = tg.it;
    if (tg.st) { it = takeFrom(tg.st); if (!it) return; }
    ptr = { id: e.pointerId };
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    grabIt(it);
    G.aim = { x: wx, y: wy };
    e.preventDefault();
  });
  cv.addEventListener('pointermove', (e) => {
    const [wx, wy] = toW(e.clientX, e.clientY);
    hoverW = [wx, wy];
    if (ptr && e.pointerId === ptr.id && G && G.held) { G.aim = { x: wx, y: wy }; }
    else if (G && canInteract() && e.pointerType === 'mouse') cv.style.cursor = grabTarget(wx, wy, false) ? 'grab' : 'default';
    if (G && G.held) cv.style.cursor = 'grabbing';
  });
  const endPtr = (e, cancel) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    ptr = null;
    if (G && G.held) release(cancel ? null : pullVel());
    cv.style.cursor = 'default';
  };
  cv.addEventListener('pointerup', (e) => endPtr(e, false));
  cv.addEventListener('pointercancel', (e) => endPtr(e, true));
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (G && G.held && e.key === 'Escape') { ptr = null; release(null); return; }
      if (G && G.mode === 'play') { if (G.screen === 'play') pauseGame(); else if (G.screen === 'pause') resumeGame(); }
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.mode === 'play' && G.screen === 'play') pauseGame(); });

  // ======================================================================================
  //  DRAWING — food
  // ======================================================================================
  function face(c, x, y, s, o) {
    const mood = (o && o.mood) || 'ok', lk = (o && o.look) || [0, 0], blink = o && o.blink;
    const gap = 0.3 * s, er = 0.17 * s;
    c.lineWidth = Math.max(1.2, s * 0.07); c.strokeStyle = OUT; c.lineCap = 'round';
    for (const sx of [-1, 1]) {
      const ex = x + sx * gap;
      if (mood === 'dead') { c.beginPath(); c.moveTo(ex - er * 0.7, y - er * 0.7); c.lineTo(ex + er * 0.7, y + er * 0.7); c.moveTo(ex + er * 0.7, y - er * 0.7); c.lineTo(ex - er * 0.7, y + er * 0.7); c.stroke(); continue; }
      if (mood === 'woo' || blink) { c.beginPath(); if (blink) { c.moveTo(ex - er, y); c.lineTo(ex + er, y); } else c.arc(ex, y + er * 0.3, er * 0.8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); continue; }
      const big = mood === 'scared' ? 1.2 : 1;
      c.beginPath(); c.arc(ex, y, er * big, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.stroke();
      const pr = er * (mood === 'scared' ? 0.4 : 0.58);
      c.beginPath(); c.arc(ex + lk[0] * er * 0.42, y + lk[1] * er * 0.42, pr, 0, TAU); c.fillStyle = OUT; c.fill();
      c.beginPath(); c.arc(ex + lk[0] * er * 0.42 - pr * 0.35, y + lk[1] * er * 0.42 - pr * 0.4, pr * 0.32, 0, TAU); c.fillStyle = '#fff'; c.fill();
    }
    const my = y + s * 0.26;
    c.beginPath();
    if (mood === 'scared') { c.ellipse(x, my, s * 0.07, s * 0.09, 0, 0, TAU); c.fillStyle = OUT; c.fill(); }
    else if (mood === 'woo') { c.arc(x, my - s * 0.04, s * 0.13, 0.1, Math.PI - 0.1); c.closePath(); c.fillStyle = '#c2405a'; c.fill(); c.stroke(); }
    else if (mood === 'dead') { c.moveTo(x - s * 0.12, my); c.quadraticCurveTo(x - s * 0.06, my - s * 0.06, x, my); c.quadraticCurveTo(x + s * 0.06, my + s * 0.06, x + s * 0.12, my); c.stroke(); }
    else { c.arc(x, my - s * 0.08, s * 0.1, 0.35, Math.PI - 0.35); c.stroke(); }
    c.fillStyle = 'rgba(255,110,140,.35)';
    c.beginPath(); c.ellipse(x - gap * 1.55, y + s * 0.15, s * 0.09, s * 0.055, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(x + gap * 1.55, y + s * 0.15, s * 0.09, s * 0.055, 0, 0, TAU); c.fill();
  }
  function lgrad(c, y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function blobPath(c, r, n, amp, ph, sx, sy) {
    c.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr2 = r * (1 + amp * Math.sin(a * n + ph)); const x = Math.cos(a) * rr2 * (sx || 1), y = Math.sin(a) * rr2 * (sy || 1); i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath();
  }
  function plate(c, r) {
    c.beginPath(); c.arc(0, 0, r * 1.02, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = Math.max(1.5, r * 0.08); c.strokeStyle = OUT; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.8, 0, TAU); c.strokeStyle = '#c9d6ea'; c.lineWidth = Math.max(1, r * 0.06); c.stroke();
  }
  function slice(c, x, y, r, outer, inner, seeds) {
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = outer; c.fill(); c.stroke();
    c.beginPath(); c.arc(x, y, r * 0.72, 0, TAU); c.fillStyle = inner; c.fill();
    if (seeds) { c.fillStyle = seeds; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.1, r * 0.16, a, 0, TAU); c.fill(); } }
    else { c.beginPath(); c.arc(x, y, r * 0.18, 0, TAU); c.fillStyle = outer; c.fill(); }
  }
  function bowl(c, r, body, body2, inner, o, tops) {
    c.beginPath(); c.moveTo(-r, -r * 0.08); c.bezierCurveTo(-r, r * 0.9, r, r * 0.9, r, -r * 0.08); c.closePath();
    c.fillStyle = lgrad(c, -r * 0.1, r * 0.75, body, body2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, -r * 0.08, r, r * 0.3, 0, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, -r * 0.06, r * 0.84, r * 0.21, 0, 0, TAU); c.fillStyle = inner; c.fill();
    if (tops) tops();
    face(c, 0, r * 0.32, r * 0.75, o);
    const tm = (o && o.t) || 0;
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(1.5, r * 0.07);
    for (let i = -1; i <= 1; i++) { c.beginPath(); const x = i * r * 0.35, ph = tm * 3 + i; c.moveTo(x, -r * 0.4); c.bezierCurveTo(x + Math.sin(ph) * r * 0.2, -r * 0.6, x - Math.sin(ph) * r * 0.2, -r * 0.75, x, -r * 0.95); c.stroke(); }
    c.strokeStyle = OUT;
  }
  function drawKind(c, k, r, o) {
    o = o || {};
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
    const pl = o.plate !== false && KIND[k] && KIND[k].plate;
    if (pl) { plate(c, r); c.save(); c.scale(0.8, 0.8); r = r * 1.0; }
    switch (k) {
      case 'egg':
        c.beginPath(); c.ellipse(0, r * 0.05, r * 0.8, r * 0.98, 0, 0, TAU); c.fillStyle = lgrad(c, -r, r, '#fffdf6', '#efdcb8'); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(-r * 0.32, -r * 0.4, r * 0.14, r * 0.25, -0.4, 0, TAU); c.fill();
        face(c, 0, -r * 0.02, r, o); break;
      case 'egg_f':
        blobPath(c, r * 0.95, 6, 0.09, 1.3); c.fillStyle = '#ffffff'; c.fill(); c.stroke();
        c.beginPath(); c.arc(r * 0.05, -r * 0.03, r * 0.44, 0, TAU); c.fillStyle = lgrad(c, -r * 0.4, r * 0.4, '#ffd84d', '#ffa514'); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-r * 0.1, -r * 0.2, r * 0.1, r * 0.06, -0.5, 0, TAU); c.fill();
        face(c, r * 0.05, -r * 0.06, r * 0.5, o); break;
      case 'carrot':
        c.fillStyle = '#4fc76b';
        for (const a of [-0.5, 0, 0.5]) { c.save(); c.translate(0, -r * 0.6); c.rotate(a); c.beginPath(); c.ellipse(0, -r * 0.3, r * 0.13, r * 0.33, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
        c.beginPath(); c.moveTo(-r * 0.52, -r * 0.5); c.quadraticCurveTo(-r * 0.5, r * 0.2, 0, r * 1.02); c.quadraticCurveTo(r * 0.5, r * 0.2, r * 0.52, -r * 0.5); c.quadraticCurveTo(0, -r * 0.78, -r * 0.52, -r * 0.5);
        c.fillStyle = lgrad(c, -r * 0.6, r, '#ffa94a', '#f06d14'); c.fill(); c.stroke();
        c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); c.moveTo(-r * 0.3, r * 0.25); c.lineTo(-r * 0.1, r * 0.25); c.moveTo(r * 0.12, r * 0.5); c.lineTo(r * 0.28, r * 0.5); c.stroke();
        face(c, 0, -r * 0.18, r * 0.85, o); break;
      case 'carrot_c':
        for (const [x, y] of [[-0.4, -0.25], [0.35, -0.3], [-0.12, 0.35], [0.45, 0.32]]) slice(c, x * r, y * r, r * 0.4, '#ff9a3c', '#ffc27a');
        face(c, -r * 0.12, r * 0.3, r * 0.42, o); break;
      case 'mushroom':
        c.beginPath(); rr(c, -r * 0.3, -r * 0.1, r * 0.6, r * 0.95, r * 0.22); c.fillStyle = lgrad(c, 0, r, '#fff6e6', '#e8d5b5'); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(-r * 0.98, r * 0.02); c.bezierCurveTo(-r * 0.98, -r * 1.05, r * 0.98, -r * 1.05, r * 0.98, r * 0.02); c.quadraticCurveTo(0, r * 0.24, -r * 0.98, r * 0.02);
        c.fillStyle = lgrad(c, -r, 0, '#ff6b78', '#e23d52'); c.fill(); c.stroke();
        c.fillStyle = '#fff'; for (const [x, y, s] of [[-0.45, -0.35, 0.16], [0.15, -0.6, 0.14], [0.55, -0.22, 0.12], [-0.05, -0.2, 0.09]]) { c.beginPath(); c.arc(x * r, y * r, s * r, 0, TAU); c.fill(); }
        face(c, 0, r * 0.42, r * 0.62, o); break;
      case 'mush_c': case 'mush_f': {
        const f = k === 'mush_f', col = f ? '#d08a3e' : '#f2dcb8', col2 = f ? '#a25f22' : '#c99a6a';
        for (const [x, y, a] of [[-0.42, -0.1, -0.4], [0.38, -0.2, 0.3], [0, 0.35, 0]]) {
          c.save(); c.translate(x * r, y * r); c.rotate(a); const s = r * 0.5;
          c.beginPath(); c.moveTo(-s * 0.9, 0); c.bezierCurveTo(-s * 0.9, -s * 1.1, s * 0.9, -s * 1.1, s * 0.9, 0); c.lineTo(s * 0.3, 0); c.lineTo(s * 0.3, s * 0.8); c.lineTo(-s * 0.3, s * 0.8); c.lineTo(-s * 0.3, 0); c.closePath();
          c.fillStyle = col; c.fill(); c.stroke(); c.strokeStyle = col2; c.lineWidth = Math.max(1, r * 0.05);
          c.beginPath(); c.moveTo(-s * 0.6, -s * 0.15); c.bezierCurveTo(-s * 0.6, -s * 0.75, s * 0.6, -s * 0.75, s * 0.6, -s * 0.15); c.stroke(); c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
          c.restore();
        }
        if (f) { c.fillStyle = '#fff7c2'; for (const [x, y] of [[-0.5, -0.5], [0.55, 0.1], [0.1, -0.05]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.06, 0, TAU); c.fill(); } }
        face(c, 0, r * 0.32, r * 0.42, o); break;
      }
      case 'meat': case 'steak': {
        const ck = k === 'steak';
        c.save(); c.rotate(-0.2); blobPath(c, r * 0.92, 3, 0.07, 0.5, 1.08, 0.82);
        c.fillStyle = ck ? lgrad(c, -r, r, '#a8633a', '#7b3f22') : lgrad(c, -r, r, '#ff8a96', '#e2505f'); c.fill(); c.stroke();
        c.strokeStyle = ck ? '#4f2410' : '#ffe4e8'; c.lineWidth = Math.max(1.2, r * 0.08);
        if (ck) { for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-r * 0.5 + i * r * 0.32, -r * 0.5); c.lineTo(r * 0.0 + i * r * 0.32, r * 0.55); c.stroke(); } }
        else { c.beginPath(); c.moveTo(-r * 0.6, -r * 0.1); c.quadraticCurveTo(-r * 0.2, -r * 0.4, r * 0.2, -r * 0.15); c.moveTo(-r * 0.4, r * 0.35); c.quadraticCurveTo(0, r * 0.15, r * 0.35, r * 0.4); c.stroke(); }
        c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
        c.beginPath(); c.arc(r * 0.55, -r * 0.12, r * 0.2, 0, TAU); c.fillStyle = '#fff7ea'; c.fill(); c.stroke();
        c.beginPath(); c.arc(r * 0.55, -r * 0.12, r * 0.08, 0, TAU); c.fillStyle = '#f0d8b8'; c.fill();
        c.restore();
        if (ck) { c.fillStyle = '#4fc76b'; for (const [x, y] of [[-0.55, -0.55], [-0.42, -0.65], [-0.5, -0.42]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.11, 0, TAU); c.fill(); c.stroke(); } }
        face(c, -r * 0.2, r * 0.02, r * 0.75, o); break;
      }
      case 'fish':
        c.beginPath(); c.moveTo(-r * 0.62, 0); c.lineTo(-r * 1.08, -r * 0.5); c.quadraticCurveTo(-r * 0.95, 0, -r * 1.08, r * 0.5); c.closePath(); c.fillStyle = '#4f8ff0'; c.fill(); c.stroke();
        c.beginPath(); c.moveTo(-r * 0.1, -r * 0.5); c.quadraticCurveTo(r * 0.15, -r * 0.95, r * 0.4, -r * 0.48); c.fillStyle = '#4f8ff0'; c.fill(); c.stroke();
        c.beginPath(); c.ellipse(r * 0.12, 0, r * 0.82, r * 0.58, 0, 0, TAU); c.fillStyle = lgrad(c, -r * 0.6, r * 0.6, '#8ac6ff', '#3d7fe0'); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(r * 0.1, r * 0.22, r * 0.55, r * 0.18, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(43,33,65,.35)'; c.lineWidth = Math.max(1, r * 0.06); for (const x of [-0.3, -0.05]) { c.beginPath(); c.arc(x * r, 0, r * 0.38, -0.9, 0.9); c.stroke(); } c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
        face(c, r * 0.42, -r * 0.08, r * 0.7, o); break;
      case 'fish_c':
        for (const [x, y, a] of [[-0.4, -0.25, 0.3], [0.38, -0.28, -0.2], [0, 0.32, 0.1]]) {
          c.save(); c.translate(x * r, y * r); c.rotate(a); c.beginPath(); rr(c, -r * 0.34, -r * 0.3, r * 0.68, r * 0.6, r * 0.14); c.fillStyle = '#ff9f80'; c.fill(); c.stroke();
          c.strokeStyle = '#ffe1d4'; c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); c.moveTo(-r * 0.25, -r * 0.05); c.lineTo(r * 0.25, -r * 0.15); c.moveTo(-r * 0.25, r * 0.15); c.lineTo(r * 0.25, r * 0.05); c.stroke(); c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
          c.restore();
        }
        face(c, 0, r * 0.3, r * 0.42, o); break;
      case 'fish_f':
        for (const [x, y] of [[-0.42, -0.2], [0.4, -0.28], [0, 0.3]]) { c.save(); c.translate(x * r, y * r); blobPath(c, r * 0.36, 5, 0.12, x * 9); c.fillStyle = lgrad(c, -r * 0.4, r * 0.4, '#ffc45c', '#d9862a'); c.fill(); c.stroke(); c.fillStyle = '#fff1b8'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(Math.cos(i * 2.1) * r * 0.18, Math.sin(i * 2.1) * r * 0.18, r * 0.04, 0, TAU); c.fill(); } c.restore(); }
        c.beginPath(); c.moveTo(r * 0.5, r * 0.25); c.arc(r * 0.5, r * 0.25, r * 0.32, -0.2, 1.5); c.closePath(); c.fillStyle = '#ffe94d'; c.fill(); c.stroke();
        face(c, 0, r * 0.28, r * 0.42, o); break;
      case 'tomato':
        c.beginPath(); c.arc(0, r * 0.05, r * 0.92, 0, TAU); c.fillStyle = lgrad(c, -r, r, '#ff6a5c', '#e2302a'); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-r * 0.4, -r * 0.3, r * 0.15, r * 0.24, -0.5, 0, TAU); c.fill();
        c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, rr2 = i % 2 ? r * 0.14 : r * 0.42; const x = Math.cos(a) * rr2, y = -r * 0.78 + Math.sin(a) * rr2 * 0.6; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.fillStyle = '#4fc76b'; c.fill(); c.stroke();
        face(c, 0, r * 0.08, r * 0.95, o); break;
      case 'tomato_c':
        for (const [x, y] of [[-0.4, -0.22], [0.38, -0.26], [0, 0.34]]) slice(c, x * r, y * r, r * 0.44, '#ff4b3e', '#ff9a8a', '#ffe08a');
        face(c, 0, r * 0.3, r * 0.42, o); break;
      case 'potato':
        blobPath(c, r * 0.9, 5, 0.07, 2, 1.1, 0.85); c.fillStyle = lgrad(c, -r, r, '#e2b878', '#b8864a'); c.fill(); c.stroke();
        c.fillStyle = 'rgba(110,70,30,.45)'; for (const [x, y] of [[-0.6, -0.3], [0.55, 0.3], [0.3, -0.45], [-0.3, 0.45]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.07, 0, TAU); c.fill(); }
        face(c, 0, -r * 0.02, r * 0.85, o); break;
      case 'potato_c':
        for (const [x, y, a] of [[-0.42, -0.1, -0.5], [-0.1, -0.15, 0.2], [0.25, -0.05, -0.15], [0.5, 0.05, 0.4], [0, 0.35, 1.5]]) { c.save(); c.translate(x * r, y * r); c.rotate(a); c.beginPath(); rr(c, -r * 0.12, -r * 0.48, r * 0.24, r * 0.96, r * 0.08); c.fillStyle = '#f8e3a1'; c.fill(); c.stroke(); c.restore(); }
        face(c, 0, r * 0.38, r * 0.4, o); break;
      case 'fries':
        for (let i = 0; i < 7; i++) { c.save(); c.translate((i - 3) * r * 0.17, -r * 0.35); c.rotate((i - 3) * 0.1); c.beginPath(); rr(c, -r * 0.08, -r * 0.6 - (i % 2) * r * 0.12, r * 0.16, r * 0.9, r * 0.05); c.fillStyle = '#ffd23f'; c.fill(); c.stroke(); c.restore(); }
        c.beginPath(); c.moveTo(-r * 0.75, -r * 0.3); c.lineTo(r * 0.75, -r * 0.3); c.lineTo(r * 0.55, r * 0.9); c.lineTo(-r * 0.55, r * 0.9); c.closePath(); c.fillStyle = lgrad(c, -r * 0.3, r, '#ff5a5a', '#d92b3a'); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-r * 0.7, -r * 0.05); c.lineTo(r * 0.7, -r * 0.05); c.lineTo(r * 0.68, r * 0.08); c.lineTo(-r * 0.68, r * 0.08); c.fill();
        face(c, 0, r * 0.42, r * 0.6, o); break;
      case 'noodles':
        c.beginPath(); rr(c, -r * 0.82, -r * 0.7, r * 1.64, r * 1.4, r * 0.3); c.fillStyle = lgrad(c, -r, r, '#ffd98a', '#e8b04f'); c.fill(); c.stroke();
        c.save(); c.clip(); c.strokeStyle = '#c98f2e'; c.lineWidth = Math.max(1, r * 0.07);
        for (let j = 0; j < 5; j++) { c.beginPath(); const y = -r * 0.55 + j * r * 0.28; for (let x = -r; x <= r; x += r * 0.1) { const yy = y + Math.sin(x / r * 9 + j) * r * 0.06; x === -r ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
        c.restore(); c.strokeStyle = OUT; c.lineWidth = Math.max(1.6, r * 0.11);
        c.beginPath(); rr(c, -r * 0.5, -r * 0.18, r * 1.0, r * 0.62, r * 0.18); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
        face(c, 0, r * 0.05, r * 0.72, o); break;
      case 'soup': bowl(c, r, '#4fd2d8', '#2a9fb0', '#ff8c42', o, () => { c.fillStyle = '#ffffff'; for (const [x, y] of [[-0.4, -0.08], [0.3, -0.02]]) { c.beginPath(); c.ellipse(x * r, y * r, r * 0.12, r * 0.06, 0, 0, TAU); c.fill(); } c.fillStyle = '#4fc76b'; for (const [x, y] of [[0, -0.1], [0.55, -0.08], [-0.2, 0.0]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.05, 0, TAU); c.fill(); } }); break;
      case 'ramen': bowl(c, r, '#8a7cff', '#5a49d6', '#f4d9a2', o, () => { c.strokeStyle = '#e8b33a'; c.lineWidth = Math.max(1, r * 0.06); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-r * 0.6, -r * 0.1 + i * r * 0.05); c.quadraticCurveTo(-r * 0.2, -r * 0.2, r * 0.1, -r * 0.08 + i * r * 0.04); c.stroke(); } c.strokeStyle = OUT; c.beginPath(); c.ellipse(r * 0.4, -r * 0.1, r * 0.2, r * 0.12, 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.arc(r * 0.4, -r * 0.1, r * 0.08, 0, TAU); c.fillStyle = '#ffb21a'; c.fill(); c.fillStyle = '#1f4d38'; c.fillRect(-r * 0.15, -r * 0.3, r * 0.18, r * 0.24); }); break;
      case 'stew': bowl(c, r, '#e8844a', '#b9542a', '#8b4a24', o, () => { for (const [x, y, col] of [[-0.45, -0.08, '#ff9a3c'], [0.0, -0.12, '#f8e3a1'], [0.4, -0.05, '#7b3f22'], [-0.15, 0.02, '#ff9a3c']]) { c.beginPath(); rr(c, x * r - r * 0.09, y * r - r * 0.06, r * 0.18, r * 0.12, r * 0.04); c.fillStyle = col; c.fill(); } }); break;
      case 'burnt':
        blobPath(c, r * 0.95, 6, 0.12, 0.7, 1.05, 0.9); c.fillStyle = lgrad(c, -r, r, '#4c4450', '#231f26'); c.fill(); c.stroke();
        c.fillStyle = `rgba(255,${120 + Math.round(Math.sin(((o.t) || 0) * 6) * 40)},40,.85)`; for (const [x, y] of [[-0.45, 0.35], [0.5, -0.3], [0.2, 0.55]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.08, 0, TAU); c.fill(); }
        face(c, 0, -r * 0.05, r * 0.85, { mood: 'dead' }); break;
    }
    if (pl) c.restore();
  }
  // small station pictures for tickets / recipe cards
  function drawStationIcon(c, ty, r) {
    c.lineJoin = 'round'; c.strokeStyle = OUT; c.lineWidth = Math.max(1.4, r * 0.12);
    if (ty === 'board') {
      c.beginPath(); rr(c, -r, -r * 0.6, r * 2, r * 1.2, r * 0.25); c.fillStyle = '#e09a50'; c.fill(); c.stroke();
      c.save(); c.translate(r * 0.2, -r * 0.1); c.rotate(-0.6); c.beginPath(); rr(c, -r * 0.2, -r * 0.9, r * 0.75, r * 0.6, r * 0.08); c.fillStyle = '#e6edf7'; c.fill(); c.stroke(); c.fillStyle = '#2b2141'; c.fillRect(r * 0.55, -r * 0.75, r * 0.5, r * 0.3); c.restore();
    } else if (ty === 'pan') {   // side view: frying pan over little flames
      c.save(); c.translate(-r * 0.28, -r * 0.05);
      c.fillStyle = '#ff9a2b'; for (const x of [-0.45, 0, 0.45]) { c.beginPath(); c.moveTo(x * r - r * 0.15, r * 0.8); c.quadraticCurveTo(x * r - r * 0.05, r * 0.45, x * r, r * 0.42); c.quadraticCurveTo(x * r + r * 0.05, r * 0.45, x * r + r * 0.15, r * 0.8); c.closePath(); c.fill(); }
      c.beginPath(); rr(c, r * 0.7, -r * 0.24, r * 0.92, r * 0.24, r * 0.11); c.fillStyle = '#8a4b2a'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.98, -r * 0.18); c.lineTo(-r * 0.78, r * 0.36); c.lineTo(r * 0.78, r * 0.36); c.lineTo(r * 0.98, -r * 0.18); c.closePath(); c.fillStyle = '#5a6488'; c.fill(); c.stroke();
      c.beginPath(); c.ellipse(0, -r * 0.18, r * 0.98, r * 0.24, 0, 0, TAU); c.fillStyle = '#2a2d3f'; c.fill(); c.stroke();
      c.restore();
    } else if (ty === 'pot') {
      c.beginPath(); rr(c, -r * 0.85, -r * 0.4, r * 1.7, r * 1.15, r * 0.25); c.fillStyle = '#b6c1d4'; c.fill(); c.stroke();
      c.beginPath(); c.ellipse(0, -r * 0.4, r * 0.95, r * 0.28, 0, 0, TAU); c.fillStyle = '#e7edf6'; c.fill(); c.stroke();
      c.beginPath(); c.ellipse(0, -r * 0.4, r * 0.7, r * 0.17, 0, 0, TAU); c.fillStyle = '#ff8c42'; c.fill();
    } else if (ty === 'hatch') {
      c.beginPath(); c.arc(0, r * 0.1, r * 0.75, Math.PI, 0); c.closePath(); c.fillStyle = '#ffd34d'; c.fill(); c.stroke();
      c.beginPath(); rr(c, -r, r * 0.1, r * 2, r * 0.3, r * 0.1); c.fillStyle = '#ffb703'; c.fill(); c.stroke();
      c.beginPath(); c.arc(0, -r * 0.7, r * 0.15, 0, TAU); c.fillStyle = '#ffd34d'; c.fill(); c.stroke();
    }
  }
  const ICV = {};
  function iconCanvas(k, px) {
    px = Math.max(8, Math.round(px)); const key = k + '|' + px; if (ICV[key]) return ICV[key];
    const c2 = document.createElement('canvas'); c2.width = c2.height = px; const c = c2.getContext('2d'); c.translate(px / 2, px / 2);
    if (k.startsWith('@')) drawStationIcon(c, k.slice(1), px * 0.38); else drawKind(c, k, px * (KIND[k].plate ? 0.42 : 0.36), { t: 0 });
    return (ICV[key] = c2);
  }
  const ICU = {};
  const iconURL = (k) => ICU[k] || (ICU[k] = iconCanvas(k, 96).toDataURL());

  // ======================================================================================
  //  DRAWING — kitchen
  // ======================================================================================
  function tr(x, y, rot) { const [sx, sy] = toS(x, y); ctx.save(); ctx.translate(sx, sy); if (rot) ctx.rotate(rot); ctx.scale(L.s, L.s); }
  const portRot = (p) => { const [nx, ny] = vS(p.nx, p.ny); return Math.atan2(ny, nx) - Math.PI / 2; };
  function sRect(x, y, w, h) { const a = toS(x, y), b = toS(x + w, y + h); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])]; }

  function drawVent(v) {
    const on = cycOn(v, G.T), [x, y, w, h] = sRect(v.x, v.y, v.w, v.h), [dx, dy] = vS(v.d[0], v.d[1]);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = on ? 'rgba(127,211,255,.18)' : 'rgba(127,211,255,.07)'; ctx.fillRect(x, y, w, h);
    if (!on) { ctx.setLineDash([8 * L.s, 8 * L.s]); ctx.strokeStyle = 'rgba(70,150,200,.35)'; ctx.lineWidth = Math.max(1.5, 3 * L.s); ctx.strokeRect(x + 2, y + 2, w - 4, h - 4); ctx.setLineDash([]); }
    const len = Math.abs(dx) ? w : h, wide = Math.abs(dx) ? h : w;
    if (on) {
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = Math.max(1.5, 3 * L.s); ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const lat = ((i * 0.37) % 1) * wide, prog = ((G.T * 1.4 + i * 0.29) % 1) * (len + 60 * L.s) - 30 * L.s, sl = 34 * L.s;
        let x0, y0;
        if (Math.abs(dx)) { x0 = dx > 0 ? x + prog : x + w - prog; y0 = y + lat; } else { y0 = dy > 0 ? y + prog : y + h - prog; x0 = x + lat; }
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(i); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx * sl, y0 + dy * sl); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // grille at the base
    ctx.save(); ctx.fillStyle = on ? '#7fd3ff' : '#8b97ad'; ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.5, 3 * L.s);
    const g = 12 * L.s; let gx, gy, gw, gh;
    if (Math.abs(dx)) { gw = g; gh = h; gx = dx > 0 ? x - g / 2 : x + w - g / 2; gy = y; } else { gh = g; gw = w; gy = dy > 0 ? y - g / 2 : y + h - g / 2; gx = x; }
    rr(ctx, gx, gy, gw, gh, 4 * L.s); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(43,33,65,.5)'; ctx.lineWidth = Math.max(1, 2 * L.s);
    for (let i = 1; i < 6; i++) { ctx.beginPath(); if (Math.abs(dx)) { ctx.moveTo(gx, gy + gh * i / 6); ctx.lineTo(gx + gw, gy + gh * i / 6); } else { ctx.moveTo(gx + gw * i / 6, gy); ctx.lineTo(gx + gw * i / 6, gy + gh); } ctx.stroke(); }
    // arrow
    if (on) { const cx = x + w / 2, cy = y + h / 2; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.translate(cx, cy); ctx.rotate(Math.atan2(dy, dx)); const a = 16 * L.s; ctx.beginPath(); ctx.moveTo(a, 0); ctx.lineTo(-a * 0.6, -a * 0.7); ctx.lineTo(-a * 0.2, 0); ctx.lineTo(-a * 0.6, a * 0.7); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  function drawFire(f) {
    const on = cycOn(f, G.T), soon = !on && cycUntilOn(f, G.T) < 0.9, [x, y, w, h] = sRect(f.x, f.y, f.w, f.h), [dx, dy] = vS(f.d[0], f.d[1]);
    if (on && !f.was) { f.was = true; if (G.mode === 'play' && G.screen === 'play') SFX.fire(); } else if (!on) f.was = false;
    const len = Math.abs(dx) ? w : h, wide = Math.abs(dx) ? h : w;
    const base = (u, v) => Math.abs(dx) ? [dx > 0 ? x + u : x + w - u, y + v] : [x + v, dy > 0 ? y + u : y + h - u];
    ctx.save();
    if (on) {
      const fl = len * (0.85 + Math.sin(G.T * 17) * 0.06);
      for (let layer = 0; layer < 3; layer++) {
        const col = ['rgba(255,90,40,.75)', 'rgba(255,170,40,.85)', 'rgba(255,240,150,.9)'][layer], wf = [1, 0.7, 0.4][layer], lf = [1, 0.8, 0.55][layer];
        ctx.fillStyle = col; ctx.beginPath();
        const steps = 12;
        for (let i = 0; i <= steps; i++) { const u = fl * lf * i / steps, sw = wide * wf * 0.5 * (1 - i / steps * 0.85) * (1 + 0.15 * Math.sin(G.T * 23 + i * 1.7 + layer)); const p = base(u, wide / 2 - sw); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        for (let i = steps; i >= 0; i--) { const u = fl * lf * i / steps, sw = wide * wf * 0.5 * (1 - i / steps * 0.85) * (1 + 0.15 * Math.sin(G.T * 19 + i * 1.3 + layer)); const p = base(u, wide / 2 + sw); ctx.lineTo(p[0], p[1]); }
        ctx.closePath(); ctx.fill();
      }
      if (Math.random() < 0.5 && (G.screen === 'play' || G.mode === 'demo')) { const [wx, wy] = toW(...base(rnd(0, len), rnd(0, wide))); part(wx, wy, { type: 'spark', col: '#ffcf5a', vx: f.d[0] * 200 + rnd(-40, 40), vy: f.d[1] * 200 + rnd(-40, 40), life: 0.35, size: 3 }); }
    } else if (soon) {
      ctx.fillStyle = `rgba(255,120,40,${0.15 + 0.25 * Math.abs(Math.sin(G.T * 20))})`; ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = 'rgba(255,110,60,.07)'; ctx.fillRect(x, y, w, h);
      ctx.setLineDash([7 * L.s, 7 * L.s]); ctx.strokeStyle = 'rgba(230,90,50,.35)'; ctx.lineWidth = Math.max(1.5, 3 * L.s); ctx.strokeRect(x + 2, y + 2, w - 4, h - 4); ctx.setLineDash([]);
    }
    // nozzle
    const p0 = base(0, wide / 2); ctx.translate(p0[0], p0[1]); ctx.rotate(Math.atan2(dy, dx));
    const s = L.s; ctx.fillStyle = '#5b6b8c'; ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.5, 3 * s);
    ctx.beginPath(); rr(ctx, -6 * s, -wide / 2 - 6 * s, 22 * s, wide + 12 * s, 6 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = on ? '#ffcf5a' : soon ? '#ff8a2b' : '#3a4366'; ctx.beginPath(); ctx.arc(6 * s, 0, 6 * s, 0, TAU); ctx.fill(); ctx.stroke();
    // hazard stripes
    ctx.fillStyle = '#ffd34d'; for (let i = 0; i < 3; i++) ctx.fillRect(-4 * s, -wide / 2 - 4 * s + i * (wide + 8 * s) / 3, 4 * s, (wide + 8 * s) / 6);
    ctx.restore();
  }
  function drawMagnet(m) {
    const on = cycOn(m, G.T), [sx, sy] = toS(m.x, m.y), s = L.s;
    if (on) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,93,115,.45)'; ctx.lineWidth = Math.max(1.5, 3 * s);
      for (let i = 0; i < 3; i++) { const k = 1 - ((G.T * 0.7 + i / 3) % 1); ctx.globalAlpha = 0.15 + 0.6 * (1 - k); ctx.beginPath(); ctx.arc(sx, sy, (30 + (m.R - 30) * k) * s, 0, TAU); ctx.stroke(); }
      ctx.restore();
    } else { ctx.save(); ctx.setLineDash([6 * s, 8 * s]); ctx.strokeStyle = 'rgba(80,90,130,.25)'; ctx.lineWidth = Math.max(1, 2 * s); ctx.beginPath(); ctx.arc(sx, sy, m.R * s, 0, TAU); ctx.stroke(); ctx.restore(); }
    tr(m.x, m.y);
    ctx.lineWidth = 3; ctx.strokeStyle = OUT;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fillStyle = '#5b6b8c'; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(on ? Math.sin(G.T * 30) * 0.05 : 0);
    ctx.lineWidth = 11; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(0, 2, 13, Math.PI, 0, true); ctx.stroke();
    ctx.lineWidth = 7; ctx.strokeStyle = on ? '#ff4d6a' : '#8f6b78'; ctx.beginPath(); ctx.arc(0, 2, 13, Math.PI, 0, true); ctx.stroke();
    ctx.fillStyle = '#eef0ff'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.rect(-18.5, -8, 11, 9); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.rect(7.5, -8, 11, 9); ctx.fill(); ctx.stroke();
    ctx.restore();
    if (on && Math.random() < 0.15) { ctx.strokeStyle = '#fff59d'; ctx.lineWidth = 2; ctx.beginPath(); const a = rnd(0, TAU); ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28); ctx.lineTo(Math.cos(a + 0.2) * 40, Math.sin(a + 0.2) * 40); ctx.lineTo(Math.cos(a - 0.1) * 50, Math.sin(a - 0.1) * 50); ctx.stroke(); }
    ctx.restore();
  }
  function drawPortal(p, col, col2) {
    tr(p.x, p.y);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, p.r); g.addColorStop(0, '#0b0d22'); g.addColorStop(0.7, col2); g.addColorStop(1, col);
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, p.r * (0.3 + i * 0.17), G.T * (2 + i) + i, G.T * (2 + i) + i + 2.2); ctx.stroke(); }
    ctx.restore();
  }
  function drawBumper(b) {
    tr(b.x, b.y); const k = 1 + b.flash * 0.18; ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); const g = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.3, 2, 0, 0, b.r); g.addColorStop(0, b.flash > 0.3 ? '#ffffff' : '#ffb3c8'); g.addColorStop(1, '#ff4d8a');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, b.r * 0.72, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU + G.T * 0.5, r = i % 2 ? b.r * 0.2 : b.r * 0.45; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawSeg(s) {
    const a = toS(s.x1, s.y1), b = toS(s.x2, s.y2);
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = (s.th * 2 + 6) * L.s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = '#8b97b8'; ctx.lineWidth = s.th * 2 * L.s; ctx.stroke();
    ctx.strokeStyle = '#c3cde4'; ctx.lineWidth = s.th * 0.6 * L.s; ctx.stroke();
    ctx.restore();
  }
  function drawStrut(st) {
    if (!st.bolt) return;
    const a = toS(st.x, st.y), b = toS(st.sx, st.sy), s = L.s;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = 17 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = '#97a4c2'; ctx.lineWidth = 11 * s; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3 * s; ctx.stroke();
    ctx.fillStyle = '#6b7799'; ctx.strokeStyle = OUT; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(b[0], b[1], 14 * s, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function ring(st, frac, col, pulse) {
    const R = st.r + 10;
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(43,33,65,.35)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 7 * (pulse ? 1 + 0.25 * Math.sin(G.T * 12) : 1); ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + frac * TAU); ctx.stroke();
  }
  function itemOpts(k, mood, ex) { return Object.assign({ t: G.T, mood: mood || 'ok', look: [0, 0.2] }, ex || {}); }
  function drawStation(st) {
    const wob = st.bolt ? Math.sin(G.T * 8) * (st.wob || 0) * 0.08 : Math.sin(G.T * 0.9 + st.ph) * 0.12 + (st.wob || 0) * Math.sin(G.T * 14) * 0.1;
    const bob = st.bolt ? 0 : Math.sin(G.T * 1.6 + st.ph) * 2;
    tr(st.x, st.y + bob, wob);
    const c = st.c;
    if (st.rej > 0) { ctx.save(); ctx.globalAlpha = st.rej * 0.6; ctx.beginPath(); ctx.arc(0, 0, st.r + 14, 0, TAU); ctx.fillStyle = '#ff5d73'; ctx.fill(); ctx.restore(); }
    if (st.t === 'pan') {
      if (c && c.ph !== 'burnt') { const g = ctx.createRadialGradient(0, 0, st.r * 0.3, 0, 0, st.r * 1.4); g.addColorStop(0, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, st.r * 1.4, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.rotate(0.62); ctx.beginPath(); rr(ctx, st.r * 0.8, -st.r * 0.15, st.r * 1.05, st.r * 0.3, st.r * 0.13); ctx.fillStyle = '#8a4b2a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.arc(st.r * 1.65, 0, st.r * 0.06, 0, TAU); ctx.fillStyle = OUT; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, st.r, 0, TAU); ctx.fillStyle = lgrad(ctx, -st.r, st.r, '#9aa5c2', '#4a5170'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, st.r * 0.8, 0, TAU); ctx.fillStyle = lgrad(ctx, -st.r, st.r, '#3c4260', '#22253a'); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, st.r * 0.68, -2.6, -1.6); ctx.stroke();
      if (c) {
        const k = c.ph === 'cook' ? c.k : c.out, jig = c.ph === 'cook' ? Math.sin(G.T * 30) * 1.2 : 0;
        ctx.save(); ctx.translate(jig, -jig * 0.5); drawKind(ctx, k, st.r * 0.6, itemOpts(k, c.ph === 'warn' ? 'scared' : c.ph === 'cook' ? 'woo' : 'ok', { plate: false })); ctx.restore();
      }
    } else if (st.t === 'pot') {
      const r = st.r;
      ctx.beginPath(); rr(ctx, -r * 1.15, -r * 0.28, r * 0.3, r * 0.2, r * 0.08); ctx.fillStyle = '#6b7799'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.beginPath(); rr(ctx, r * 0.85, -r * 0.28, r * 0.3, r * 0.2, r * 0.08); ctx.fill(); ctx.stroke();
      ctx.beginPath(); rr(ctx, -r * 0.92, -r * 0.4, r * 1.84, r * 1.22, r * 0.28); ctx.fillStyle = lgrad(ctx, -r * 0.4, r * 0.8, '#d6dfec', '#8a96ad'); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-r * 0.7, -r * 0.25, r * 0.16, r * 0.9);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.4, r * 0.98, r * 0.3, 0, 0, TAU); ctx.fillStyle = '#eef3fa'; ctx.fill(); ctx.stroke();
      const liquid = !c ? (st.list.length ? '#8fd6ff' : '#6fa9c9') : c.ph === 'burnt' ? '#2e2a30' : c.out === 'soup' ? '#ff8c42' : c.out === 'ramen' ? '#f4d9a2' : '#8b4a24';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.4, r * 0.8, r * 0.2, 0, 0, TAU); ctx.fillStyle = c && c.ph === 'warn' ? '#6b3a1e' : liquid; ctx.fill();
      // ingredients bobbing in the pot
      st.list.forEach((k, i) => { ctx.save(); ctx.translate((i - (st.list.length - 1) / 2) * r * 0.5, -r * 0.42 + Math.sin(G.T * 3 + i) * 2); const ic = iconCanvas(k, 26); ctx.drawImage(ic, -12, -12, 24, 24); ctx.restore(); });
      if (c && (c.ph === 'cook' || c.ph === 'done')) { ctx.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++) { const ph = (G.T * 1.7 + i * 0.27) % 1; ctx.beginPath(); ctx.arc(Math.sin(i * 7) * r * 0.55, -r * 0.4, r * 0.07 * ph + 1, 0, TAU); ctx.fill(); } }
      // gauge
      ctx.beginPath(); ctx.arc(r * 0.35, r * 0.35, r * 0.2, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
      const ga = -2.4 + (c ? (c.ph === 'cook' ? clamp(c.t / c.cook, 0, 1) * 3.2 : 3.2 + (c.ph === 'warn' ? 0.6 : 0)) : 0);
      ctx.strokeStyle = '#e23d52'; ctx.beginPath(); ctx.moveTo(r * 0.35, r * 0.35); ctx.lineTo(r * 0.35 + Math.cos(ga) * r * 0.15, r * 0.35 + Math.sin(ga) * r * 0.15); ctx.stroke(); ctx.strokeStyle = OUT;
      if (c && readyPh(c) && c.ph !== 'burnt') { ctx.save(); ctx.translate(0, -r * 0.9); ctx.scale(0.75, 0.75); drawKind(ctx, c.out, 28, itemOpts(c.out, c.ph === 'warn' ? 'scared' : 'woo')); ctx.restore(); }
      if (c && c.ph === 'burnt') { ctx.save(); ctx.translate(0, -r * 0.85); drawKind(ctx, 'burnt', 22, itemOpts('burnt')); ctx.restore(); }
    } else if (st.t === 'board') {
      const r = st.r;
      ctx.beginPath(); rr(ctx, -r * 1.08, -r * 0.62, r * 2.16, r * 1.24, r * 0.25); ctx.fillStyle = lgrad(ctx, -r * 0.6, r * 0.6, '#f0b26b', '#c97b3a'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.strokeStyle = 'rgba(120,60,20,.35)'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.75, i * r * 0.3); ctx.bezierCurveTo(-r * 0.2, i * r * 0.3 - 6, r * 0.2, i * r * 0.3 + 6, r * 0.8, i * r * 0.3); ctx.stroke(); }
      ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(-r * 0.82, -r * 0.36, r * 0.09, 0, TAU); ctx.fillStyle = '#7a4a22'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
      if (c) {
        const k = c.ph === 'chop' && c.t < 0.45 ? c.k : c.out;
        ctx.save(); ctx.translate(-r * 0.12, 0); drawKind(ctx, k, r * 0.52, itemOpts(k, c.ph === 'chop' ? 'scared' : 'woo')); ctx.restore();
      }
      // cleaver
      const ca = c && c.ph === 'chop' ? -0.2 - Math.abs(Math.sin(c.t * TAU * 2)) * 0.9 : -0.9 + Math.sin(G.T * 2 + st.ph) * 0.05;
      ctx.save(); ctx.translate(r * 0.62, -r * 0.18); ctx.rotate(ca);
      ctx.beginPath(); rr(ctx, -r * 0.05, -r * 0.18, r * 0.62, r * 0.12, r * 0.05); ctx.fillStyle = '#3b3550'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); rr(ctx, -r * 0.55, -r * 0.42, r * 0.55, r * 0.42, r * 0.06); ctx.fillStyle = lgrad(ctx, -r * 0.4, 0, '#f4f7fc', '#b9c4d8'); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-r * 0.42, -r * 0.3, r * 0.05, 0, TAU); ctx.fillStyle = OUT; ctx.fill();
      ctx.restore();
    }
    if (!st.bolt) {   // little thruster puffs on floating cookware
      ctx.fillStyle = 'rgba(127,211,255,.5)'; const a = G.T * 2 + st.ph;
      for (let i = 0; i < 2; i++) { const aa = a + i * Math.PI; ctx.beginPath(); ctx.arc(Math.cos(aa) * (st.r + 6), Math.sin(aa) * (st.r + 6), 3 + Math.sin(G.T * 9 + i) * 1.5, 0, TAU); ctx.fill(); }
    }
    ctx.rotate(-wob);
    if (c) {
      if (st.t === 'board') { if (c.ph === 'chop') ring(st, clamp(c.t / 0.85, 0, 1), '#ffd34d'); else ring(st, 1, '#80ed99', true); }
      else if (c.ph === 'cook') ring(st, clamp(c.t / c.cook, 0, 1), '#ffd34d');
      else if (c.ph === 'done') ring(st, 1 - c.t / ((G.def.done || 7) + (st.t === 'pot' ? 3 : 0)), '#80ed99', true);
      else if (c.ph === 'warn') ring(st, 1 - c.t / 3, Math.sin(G.T * 20) > 0 ? '#ff5d73' : '#ffb36b', true);
      if (readyPh(c)) {   // "tap me" bubble
        const y = -st.r - 34 + Math.sin(G.T * 5) * 3; ctx.beginPath(); ctx.arc(0, y, 13, 0, TAU); ctx.fillStyle = c.ph === 'burnt' ? '#4d4652' : c.ph === 'warn' ? '#ff5d73' : '#80ed99'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '900 16px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.ph === 'burnt' ? '✕' : '✓', 0, y + 1);
      }
    }
    if (st.t === 'pot' && st.rec && !c) {   // what goes in next, in order
      const ings = POT[st.rec], n = ings.length, sz = 30, y = -st.r - 40;
      ctx.beginPath(); rr(ctx, -n * sz / 2 - 8, y - sz / 2 - 5, n * sz + 16, sz + 10, 12); ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
      ings.forEach((k, i) => {
        const x = -n * sz / 2 + sz * (i + 0.5), done = i < st.list.length, nxt = i === st.list.length;
        ctx.globalAlpha = done ? 0.45 : 1; ctx.drawImage(iconCanvas(k, sz * 2), x - sz / 2, y - sz / 2, sz, sz); ctx.globalAlpha = 1;
        if (done) { ctx.fillStyle = '#2fbf71'; ctx.font = '900 18px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', x, y); }
        if (nxt) { ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 3 + Math.sin(G.T * 8); ctx.beginPath(); ctx.arc(x, y, sz * 0.55, 0, TAU); ctx.stroke(); ctx.strokeStyle = OUT; }
      });
    }
    ctx.restore();
  }
  function drawPort(p) {
    const [sx, sy] = toS(p.x, p.y); ctx.save(); ctx.translate(sx, sy); ctx.rotate(portRot(p)); ctx.scale(L.s, L.s);
    const hw = p.size / 2; ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.lineJoin = 'round';
    if (p.t === 'hatch') {
      const open = G.mode === 'play' && G.orders.length > 0;
      ctx.beginPath(); rr(ctx, -hw - 12, -M - 4, p.size + 24, M + 16, 12); ctx.fillStyle = p.flash > 0 ? `rgb(255,${200 + 55 * p.flash},${80 + 175 * p.flash})` : '#ffb703'; ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); rr(ctx, -hw, -M + 2, p.size, M + 2, 6); ctx.fillStyle = '#2a2440'; ctx.fill(); ctx.clip();
      ctx.strokeStyle = '#4a4170'; ctx.lineWidth = 6; for (let x = -hw - 30 + (G.T * 40) % 24; x < hw + 30; x += 24) { ctx.beginPath(); ctx.moveTo(x, -M); ctx.lineTo(x + 10, 6); ctx.stroke(); }
      ctx.restore(); ctx.strokeStyle = OUT; ctx.lineWidth = 3;
      ctx.beginPath(); rr(ctx, -hw, -M + 2, p.size, M + 2, 6); ctx.stroke();
      for (const sxx of [-1, 1]) { ctx.beginPath(); ctx.arc(sxx * (hw + 5), 4, 5, 0, TAU); ctx.fillStyle = open ? (Math.sin(G.T * 6) > 0 ? '#80ed99' : '#3fbf6e') : '#6b7799'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
      ctx.save(); ctx.translate(0, 16); const ic = iconCanvas('@hatch', 56); ctx.drawImage(ic, -16, -16, 32, 32); ctx.restore();
      if (open) { ctx.globalAlpha = 0.2 + 0.15 * Math.sin(G.T * 4); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(-hw, 8); ctx.lineTo(hw, 8); ctx.lineTo(hw * 0.7, 60); ctx.lineTo(-hw * 0.7, 60); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    } else if (p.t === 'trash') {
      ctx.beginPath(); rr(ctx, -hw - 8, -M - 2, p.size + 16, M + 12, 10); ctx.fillStyle = '#ffd34d'; ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = OUT; for (let x = -hw - 30; x < hw + 30; x += 18) { ctx.beginPath(); ctx.moveTo(x, -M - 4); ctx.lineTo(x + 9, -M - 4); ctx.lineTo(x + 25, 12); ctx.lineTo(x + 16, 12); ctx.closePath(); ctx.fill(); } ctx.restore();
      ctx.beginPath(); rr(ctx, -hw + 4, -M + 3, p.size - 8, M, 8); ctx.fillStyle = '#17142a'; ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(0, -M / 2 + 3); ctx.scale(1, 0.45); ctx.strokeStyle = 'rgba(185,140,255,.8)'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 10 + i * 9, -G.T * 4 + i * 2, -G.T * 4 + i * 2 + 3.6); ctx.stroke(); } ctx.restore();
      ctx.font = '900 15px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeText('♻', 0, 16); ctx.fillText('♻', 0, 16);
    } else if (p.t === 'tube') {
      const bulge = p.fire > 0 ? (0.7 - p.fire) / 0.7 : 0, pf = 1 + p.flash * 0.15 + bulge * 0.12;
      ctx.beginPath(); rr(ctx, -hw * 0.55, -M - 2, hw * 1.1, M + 24, 8); ctx.fillStyle = lgrad(ctx, -M, 20, '#a9b8d8', '#6b7799'); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.scale(pf, 1); ctx.beginPath(); rr(ctx, -hw * 0.8, 14, hw * 1.6, 16, 8); ctx.fillStyle = '#7fe3cf'; ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(0, -2, 15, 0, TAU); ctx.fillStyle = 'rgba(200,240,255,.85)'; ctx.fill(); ctx.stroke();
      if (p.next) { const ic = iconCanvas(p.next, 48); ctx.drawImage(ic, -12, -14, 24, 24); }
      ctx.fillStyle = bulge > 0 ? (Math.sin(G.T * 30) > 0 ? '#ffd34d' : '#ff8a2b') : '#3fbf6e'; ctx.beginPath(); ctx.arc(hw * 0.42, -14, 4, 0, TAU); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }
  function drawGenerator() {
    const [sx, sy] = toS(W / 2, 0), [nx, ny] = vS(0, 1);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.atan2(ny, nx) - Math.PI / 2); ctx.scale(L.s, L.s);
    const ph = G.gl ? G.gl.phase : 'calm', warn = ph === 'warn', on = ph === 'on';
    ctx.lineWidth = 3; ctx.strokeStyle = OUT;
    ctx.beginPath(); rr(ctx, -64, -M - 2, 128, M + 26, 12); ctx.fillStyle = '#3f4a6e'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd34d'; for (let i = 0; i < 6; i++) ctx.fillRect(-58 + i * 20, 14, 10, 6);
    const col = warn ? (Math.sin(G.T * 18) > 0 ? '#ff5d73' : '#ffb36b') : on ? '#c79bff' : '#7fe3cf';
    const g = ctx.createRadialGradient(0, 6, 2, 0, 6, 26); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 6, 26, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 6, 13, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(0, 6); ctx.rotate(G.T * (on ? 9 : 2) * (i ? -1 : 1)); ctx.scale(1, 0.35); ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (on && Math.random() < 0.3) { ctx.strokeStyle = '#fff59d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rnd(-40, 40), 0); ctx.lineTo(rnd(-50, 50), rnd(20, 40)); ctx.lineTo(rnd(-60, 60), rnd(30, 60)); ctx.stroke(); }
    ctx.restore();
  }
  function drawItem(it) {
    const [sx, sy] = toS(it.x, it.y);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(L.s, L.s);
    const wanted = G.mode === 'play' && G.orders.some((o) => o.d === it.kind);
    if (wanted) { ctx.beginPath(); ctx.arc(0, 0, it.r * 1.32 + Math.sin(G.T * 5) * 2, 0, TAU); ctx.fillStyle = 'rgba(255,211,77,.35)'; ctx.fill(); }
    if (it.held) {
      ctx.save(); ctx.rotate(G.T * 2); ctx.setLineDash([7, 6]); ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 0, it.r + 9, 0, TAU); ctx.stroke(); ctx.restore();
    }
    if (it.thrown > 4.6 && !it.held) { ctx.globalAlpha = 0.25; const [vx, vy] = vS(it.vx, it.vy); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-vx * 0.03, -vy * 0.03, it.r * 0.9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    const w = Math.sin(G.T * 2.2 + it.ph) * 0.04 + it.sq * Math.cos(it.sqp);
    ctx.rotate(it.ang); ctx.scale(1 + w, 1 - w);
    const [vx, vy] = vS(it.vx, it.vy), sp = Math.hypot(vx, vy);
    let lx = sp > 5 ? vx / sp * Math.min(1, sp / 200) : Math.sin(G.T * 0.7 + it.ph) * 0.6, ly = sp > 5 ? vy / sp * Math.min(1, sp / 200) : Math.cos(G.T * 0.5 + it.ph) * 0.4;
    if (it.held && G.aim) { const pv = pullVel(); if (pv) { const [ax, ay] = vS(pv[0], pv[1]), al = Math.hypot(ax, ay) || 1; lx = ax / al; ly = ay / al; } }
    const ca = Math.cos(-it.ang), sa = Math.sin(-it.ang); const look = [lx * ca - ly * sa, lx * sa + ly * ca];
    if (G.T > it.blinkAt) { if (G.T > it.blinkAt + 0.13) it.blinkAt = G.T + rnd(2, 5); }
    const mood = it.held ? 'scared' : sp > 450 ? 'woo' : 'ok';
    drawKind(ctx, it.kind, it.r, { t: G.T, look, mood, blink: G.T > it.blinkAt && G.T < it.blinkAt + 0.13 });
    ctx.restore();
  }
  function drawGhost(g) {
    const k = g.t, x = g.x + (g.tx - g.x) * k, y = g.y + (g.ty - g.y) * k, [sx, sy] = toS(x, y);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(L.s * (1 - k * 0.8), L.s * (1 - k * 0.8)); ctx.rotate(g.ang + k * 3); ctx.globalAlpha = 1 - k * 0.5;
    drawKind(ctx, g.kind, g.r, { t: G.T, mood: 'woo' }); ctx.restore();
  }
  function drawParts() {
    for (const p of G.parts) {
      const [sx, sy] = toS(p.x, p.y), a = clamp(p.life / p.max, 0, 1), s = p.size * L.s;
      ctx.globalAlpha = p.type === 'smoke' || p.type === 'steam' ? a * 0.55 : a;
      ctx.fillStyle = p.col; ctx.strokeStyle = p.col;
      if (p.type === 'spark') { const [vx, vy] = vS(p.vx, p.vy); ctx.lineWidth = Math.max(1, s * 0.6); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - vx * 0.04 * L.s, sy - vy * 0.04 * L.s); ctx.stroke(); }
      else if (p.type === 'star') { ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + p.life * 6, r = i % 2 ? s * 0.4 : s; i ? ctx.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r) : ctx.moveTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } ctx.closePath(); ctx.fill(); }
      else if (p.type === 'bubble') { ctx.lineWidth = Math.max(1, s * 0.3); ctx.beginPath(); ctx.arc(sx, sy, s * (1.2 - a * 0.5), 0, TAU); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, p.type === 'dot' ? s * a : s), 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  function drawPops() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = getLang() === 'ar' ? 'rtl' : 'ltr';
    for (const p of G.pops) {
      const k = 1 - p.life / p.max, [sx, sy] = toS(p.x, p.y), sc = (k < 0.15 ? k / 0.15 * 1.15 : 1) * p.size;
      const fs = Math.max(13, 24 * L.s * 1.15) * sc;
      ctx.font = '900 ' + Math.round(fs) + 'px ' + FONT; ctx.globalAlpha = clamp(p.life / 0.35, 0, 1);
      const x = clamp(sx, L.room.x + 60, L.room.x + L.room.w - 60), y = clamp(sy - k * 40, L.room.y + 16, L.room.y + L.room.h - 10);
      ctx.lineWidth = Math.max(3, fs * 0.2); ctx.strokeStyle = OUT; ctx.strokeText(p.text, x, y); ctx.fillStyle = p.col; ctx.fillText(p.text, x, y);
    }
    ctx.globalAlpha = 1; ctx.direction = 'ltr';
  }
  function drawPreview() {
    const it = G.held, v = pullVel();
    const [ix, iy] = toS(it.x, it.y), [px, py] = toS(G.aim.x, G.aim.y);
    // slingshot band
    ctx.save(); ctx.lineCap = 'round';
    const dx = px - ix, dy = py - iy, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, rr2 = it.r * L.s;
    ctx.strokeStyle = 'rgba(255,107,129,.9)'; ctx.lineWidth = Math.max(2, 5 * L.s);
    ctx.beginPath(); ctx.moveTo(ix + nx * rr2, iy + ny * rr2); ctx.lineTo(px, py); ctx.lineTo(ix - nx * rr2, iy - ny * rr2); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, Math.max(5, 9 * L.s), 0, TAU); ctx.fillStyle = '#ff6b81'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
    if (!v) { ctx.restore(); return; }
    // power arc
    ctx.strokeStyle = v[2] > 0.85 ? '#ff5d73' : '#ffd34d'; ctx.lineWidth = Math.max(3, 6 * L.s);
    ctx.beginPath(); ctx.arc(ix, iy, rr2 + 16 * L.s, -Math.PI / 2, -Math.PI / 2 + v[2] * TAU); ctx.stroke();
    const sim = simulate(it, v[0], v[1]);
    const cols = ['#ffffff', '#7fe3cf', '#ffd34d', '#ffb36b'];
    let i = 0;
    for (const p of sim.pts) {
      i++; if (!p || i < 2) continue;
      const [sx, sy] = toS(p[0], p[1]), fade = 1 - i / (sim.pts.length + 6);
      ctx.globalAlpha = 0.35 + fade * 0.65;
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(2, (3 + fade * 3.5) * L.s), 0, TAU); ctx.fillStyle = p[3] ? '#ff5a28' : cols[Math.min(3, p[2])]; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(43,33,65,.55)'; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const m of sim.marks) { const [sx, sy] = toS(m[0], m[1]); ctx.beginPath(); ctx.arc(sx, sy, 9 * L.s, 0, TAU); ctx.lineWidth = Math.max(2, 3 * L.s); ctx.strokeStyle = '#ffffff'; ctx.stroke(); }
    if (sim.end) {
      const tg = sim.end, [tx, ty] = toS(...tgPos(tg)), R = ((tg.r || tg.size / 2) + 16) * L.s;
      ctx.strokeStyle = '#80ed99'; ctx.lineWidth = Math.max(3, 6 * L.s); ctx.setLineDash([10 * L.s, 7 * L.s]); ctx.lineDashOffset = -G.T * 40;
      ctx.beginPath(); ctx.arc(tx, ty, R * (1 + 0.06 * Math.sin(G.T * 10)), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#80ed99'; ctx.beginPath(); ctx.arc(tx + R * 0.7, ty - R * 0.7, 12 * L.s + 3, 0, TAU); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = OUT; ctx.font = '900 ' + Math.round(14 * L.s + 6) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', tx + R * 0.7, ty - R * 0.7 + 1);
    } else if (sim.bump) {
      const [tx, ty] = toS(sim.bump[0], sim.bump[1]), s = 11 * L.s + 4;
      ctx.beginPath(); ctx.arc(tx, ty, s, 0, TAU); ctx.fillStyle = '#ffb703'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = OUT; ctx.font = '900 ' + Math.round(s * 1.3) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', tx, ty + 1);
    } else if (sim.rej) {
      const [tx, ty] = toS(sim.rej.x, sim.rej.y), s = 10 * L.s + 3;
      ctx.strokeStyle = '#ff5d73'; ctx.lineWidth = Math.max(3, 5 * L.s); ctx.beginPath(); ctx.moveTo(tx - s, ty - s); ctx.lineTo(tx + s, ty + s); ctx.moveTo(tx + s, ty - s); ctx.lineTo(tx - s, ty + s); ctx.stroke();
    }
    ctx.restore();
  }
  function drawHintArrow() {
    if (!G.hintAt) return;
    const a = G.hintAt, [sx, sy] = toS(a.x, a.y), r = (a.r || 30) * L.s, b = Math.abs(Math.sin(G.T * 4)) * 10 * L.s + 6;
    ctx.save(); ctx.translate(sx, sy - r - b - 14 * L.s);
    ctx.fillStyle = '#ffb703'; ctx.strokeStyle = OUT; ctx.lineWidth = 3; const s = Math.max(10, 18 * L.s);
    ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(-s * 0.8, -s * 0.1); ctx.lineTo(-s * 0.32, -s * 0.1); ctx.lineTo(-s * 0.32, -s); ctx.lineTo(s * 0.32, -s); ctx.lineTo(s * 0.32, -s * 0.1); ctx.lineTo(s * 0.8, -s * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // order tickets + gravity dial
  function drawStrip() {
    const S = L.strip; if (!G || G.mode !== 'play') return;
    ctx.save();
    const dsz = S.vert ? Math.min(S.w, 110) : S.h, n = G.def.maxQ;
    ctx.fillStyle = 'rgba(15,18,32,.82)'; rr(ctx, S.x, S.y, S.w, S.h, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,183,3,.25)'; ctx.lineWidth = 2; ctx.stroke();
    const gap = 6;
    let slots;
    if (S.vert) { const avail = S.h - dsz - gap * (n + 2), th = Math.min(avail / n, S.w * 0.95); slots = Array.from({ length: n }, (_, i) => [S.x + gap, S.y + gap + i * (th + gap), S.w - gap * 2, th]); }
    else { const avail = S.w - dsz - gap * (n + 2), tw = Math.min(avail / n, 210); slots = Array.from({ length: n }, (_, i) => [S.x + gap + i * (tw + gap), S.y + gap, tw, S.h - gap * 2]); }
    slots.forEach((s, i) => {
      const o = G.orders[i];
      if (!o) { ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(154,163,199,.3)'; ctx.lineWidth = 2; rr(ctx, s[0] + 2, s[1] + 2, s[2] - 4, s[3] - 4, 10); ctx.stroke(); ctx.setLineDash([]); return; }
      drawTicket(o, s[0], s[1] - (1 - o.in) * 30, s[2], s[3]);
    });
    // gravity dial
    const dx = S.vert ? S.x + S.w / 2 : S.x + S.w - dsz / 2 - 2, dy = S.vert ? S.y + S.h - dsz / 2 - 2 : S.y + S.h / 2, R = dsz * 0.38;
    const gl = G.gl, warn = gl && gl.phase === 'warn';
    ctx.beginPath(); ctx.arc(dx, dy, R, 0, TAU); ctx.fillStyle = warn ? (Math.sin(G.T * 16) > 0 ? '#5a1f33' : '#2a1830') : '#1a1f35'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = warn ? '#ff5d73' : '#7fe3cf'; ctx.stroke();
    const g = gravAt(G.T), gm = Math.hypot(g[0], g[1]);
    const arrow = (vx, vy, col, dash) => {
      const [ax, ay] = vS(vx, vy), m = Math.hypot(ax, ay); if (m < 5) return false;
      const len = R * (0.45 + 0.45 * Math.min(1, m / 260)), ux = ax / m, uy = ay / m;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(3, R * 0.14); ctx.lineCap = 'round'; if (dash) ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(dx - ux * len * 0.5, dy - uy * len * 0.5); ctx.lineTo(dx + ux * len * 0.6, dy + uy * len * 0.6); ctx.stroke(); ctx.setLineDash([]);
      const hx = dx + ux * len * 0.85, hy = dy + uy * len * 0.85, hs = R * 0.32;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - ux * hs - uy * hs * 0.7, hy - uy * hs + ux * hs * 0.7); ctx.lineTo(hx - ux * hs + uy * hs * 0.7, hy - uy * hs - ux * hs * 0.7); ctx.closePath(); ctx.fill();
      ctx.restore(); return true;
    };
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (!arrow(g[0], g[1], '#c79bff')) { ctx.fillStyle = '#7fe3cf'; ctx.font = '900 ' + Math.round(R * 0.55) + 'px ' + FONT; ctx.fillText('0G', dx, dy + 1); }
    if (warn) {
      arrow(gl.tx, gl.ty, 'rgba(255,93,115,.9)', true);
      const cd = Math.max(0, Math.ceil(gl.at - G.T));
      ctx.beginPath(); ctx.arc(dx + R * 0.75, dy - R * 0.75, R * 0.36, 0, TAU); ctx.fillStyle = '#ff5d73'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '900 ' + Math.round(R * 0.42) + 'px ' + FONT; ctx.fillText(String(cd), dx + R * 0.75, dy - R * 0.75 + 1);
    }
    if (gm > 5 && gl && gl.phase === 'on') { ctx.fillStyle = 'rgba(199,155,255,.85)'; ctx.font = '800 ' + Math.round(R * 0.3) + 'px ' + FONT; ctx.fillText(Math.round(gm / 100 * 10) / 10 + 'G', dx, dy + R * 0.72); }
    ctx.restore();
  }
  function drawTicket(o, x, y, w, h) {
    const frac = clamp(o.t / o.max, 0, 1), urgent = frac < 0.3;
    if (urgent) { x += Math.sin(G.T * 40) * 1.5; }
    ctx.save();
    ctx.fillStyle = '#fff4dc'; rr(ctx, x, y, w, h, 10); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = urgent ? '#ff5d73' : OUT; ctx.stroke();
    ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
    ctx.fillStyle = POT[o.d] ? '#7c6cf0' : KIND[o.d].from && KIND[KIND[o.d].from].from ? '#ff8a3d' : '#3fbf9e'; ctx.fillRect(x, y, w, Math.max(4, h * 0.07));
    // patience bar
    const bh = Math.max(5, h * 0.1);
    ctx.fillStyle = '#e6d7b8'; ctx.fillRect(x, y + h - bh, w, bh);
    ctx.fillStyle = frac > 0.55 ? '#3fbf6e' : frac > 0.3 ? '#ffb703' : '#ff5d73'; ctx.fillRect(x, y + h - bh, w * frac, bh);
    ctx.restore();
    const isz = Math.min(h * 0.52, w * 0.4);
    ctx.drawImage(iconCanvas(o.d, isz * DPR), x + 4, y + h * 0.08, isz, isz);
    // value
    ctx.fillStyle = OUT; ctx.font = '900 ' + Math.round(Math.max(11, h * 0.2)) + 'px ' + FONT; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const vx = x + w - 5, vy = y + h * 0.27;
    ctx.fillText(String(DISH[o.d].v), vx, vy);
    const tw = ctx.measureText(String(DISH[o.d].v)).width, cr = Math.max(4, h * 0.075);
    ctx.beginPath(); ctx.arc(vx - tw - cr - 2, vy, cr, 0, TAU); ctx.fillStyle = '#ffc21a'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#b36b00'; ctx.stroke();
    // recipe chain (ingredient, then where it goes)
    const ch = chainOf(o.d), icons = [];
    ch.parts.forEach((p, i) => { if (i) icons.push('+'); icons.push(p.ing); p.via.forEach((v) => icons.push('@' + v)); });
    if (ch.pot) icons.push('@pot');
    const cs = Math.min(h * 0.28, (w - 8) / Math.max(4, icons.length * 0.86)), cy = y + h * 0.6 + (isz > h * 0.5 ? 0 : 0);
    let cx = x + 4;
    const rowY = Math.min(y + h - bh - cs - 2, y + h * 0.08 + isz + 1);
    for (const ic of icons) {
      if (ic === '+') { ctx.fillStyle = '#9a8a6a'; ctx.font = '900 ' + Math.round(cs * 0.7) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillText('+', cx + cs * 0.22, rowY + cs / 2); cx += cs * 0.45; continue; }
      ctx.drawImage(iconCanvas(ic, cs * DPR * 1.3), cx, rowY, cs, cs); cx += cs * (ic.startsWith('@') ? 0.82 : 0.92);
    }
    void cy;
    ctx.restore();
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (bgCv) ctx.drawImage(bgCv, 0, 0, VW, VH); else { ctx.fillStyle = '#0f1220'; ctx.fillRect(0, 0, VW, VH); }
    if (!G) return;
    ctx.save();
    if (G.shake > 0) ctx.translate(rnd(-1, 1) * G.shake, rnd(-1, 1) * G.shake);
    const r = L.room;
    ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, 18 * L.s); ctx.clip();
    if (G.gl && G.gl.phase === 'on') { ctx.fillStyle = `rgba(150,110,255,${0.06 + 0.03 * Math.sin(G.T * 3)})`; ctx.fillRect(r.x, r.y, r.w, r.h); }
    G.vents.forEach(drawVent);
    G.mags.forEach(drawMagnet);
    G.portals.forEach((p) => { drawPortal(p.a, '#b98cff', '#5b2fb8'); drawPortal(p.b, '#7fe3cf', '#1f8a7a'); });
    G.segs.forEach(drawSeg);
    G.stations.forEach(drawStrut);
    G.stations.forEach(drawStation);
    G.bumpers.forEach(drawBumper);
    G.ghosts.forEach(drawGhost);
    for (const it of G.items) if (!it.held) drawItem(it);
    G.fires.forEach(drawFire);
    drawParts();
    if (G.held) { if (G.aim) drawPreview(); drawItem(G.held); }
    ctx.restore();
    G.ports.forEach(drawPort);
    drawGenerator();
    drawHintArrow();
    drawPops();
    if (G.gl && G.gl.phase === 'warn' && Math.sin(G.T * 12) > 0) {
      ctx.strokeStyle = 'rgba(255,60,90,.55)'; ctx.lineWidth = 10 * L.s + 4; rr(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 16 * L.s); ctx.stroke();
    }
    ctx.restore();
    drawStrip();
    if (G.coins.length) for (const c of G.coins) { if (c.t < 0) continue; ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, TAU); ctx.fillStyle = '#ffc21a'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#b36b00'; ctx.stroke(); }
  }

  // ======================================================================================
  //  HINTS (first shifts): what to do next for the oldest order
  // ======================================================================================
  function nextAction() {
    if (!G || G.mode !== 'play') return null;
    const burntSt = G.stations.find((s) => s.c && s.c.ph === 'burnt');
    const burntIt = G.items.find((i) => i.kind === 'burnt');
    if (burntIt) return { kind: 'trash', item: burntIt, to: G.ports.find((p) => p.t === 'trash') };
    for (const o of G.orders) {
      const ks = kindsOf(o.d);
      const dish = G.items.find((i) => i.kind === o.d);
      if (dish) return { kind: 'serve', item: dish, to: G.ports.find((p) => p.t === 'hatch') };
      const ready = G.stations.find((s) => readyPh(s.c) && s.c.ph !== 'burnt' && ks.has(s.c.out));
      if (ready) return { kind: 'take', st: ready };
      for (const it of G.items) {
        if (!ks.has(it.kind) || it.kind === o.d) continue;
        const K = KIND[it.kind]; let ty = null;
        if (K.chop && ks.has(K.chop)) ty = 'board'; else if (K.fry && ks.has(K.fry)) ty = 'pan';
        else if (POT[o.d] && POT[o.d].includes(it.kind)) ty = 'pot';
        if (!ty) continue;
        const cands = G.stations.filter((s) => s.t === ty && accepts(s, { kind: it.kind, thrown: 1 }).ok);
        if (cands.length) return { kind: 'fling', item: it, to: cands.sort((a, b) => Math.hypot(a.x - it.x, a.y - it.y) - Math.hypot(b.x - it.x, b.y - it.y))[0] };
      }
      const cooking = G.stations.find((s) => s.c && (s.c.ph === 'cook' || s.c.ph === 'chop') && ks.has(s.c.out));
      if (cooking) return { kind: 'wait', st: cooking };
    }
    if (burntSt) return { kind: 'take', st: burntSt };
    return null;
  }
  function updateHint() {
    const el = $('hint');
    G.hintAt = null;
    if (!G || G.mode !== 'play' || G.screen !== 'play' || !G.def.tut) { if (!el.hidden) el.hidden = true; return; }
    let txt = '';
    if (G.held) txt = t('gc_hn_aim');
    else {
      const a = nextAction();
      if (a) {
        if (a.kind === 'serve') { txt = t('gc_hn_serve'); G.hintAt = a.item; }
        else if (a.kind === 'take') { txt = a.st.c.ph === 'burnt' ? t('gc_hn_trash') : t('gc_hn_take', { s: t('gc_s_' + a.st.t) }); G.hintAt = a.st; }
        else if (a.kind === 'wait') txt = t('gc_hn_wait');
        else if (a.kind === 'trash') { txt = t('gc_hn_trash'); G.hintAt = a.item; }
        else if (a.kind === 'fling') { txt = !G.firstThrow ? t('gc_hn_grab', { i: nameOf(a.item.kind, true) }) : t(a.to.t === 'board' ? 'gc_hn_flingOn' : 'gc_hn_fling', { i: nameOf(a.item.kind, true), s: t('gc_s_' + a.to.t) }); G.hintAt = a.item; }
      } else if (G.orders.length) txt = t('gc_hn_supply');
    }
    if (G.tutDone && G.def.n === 1 && G.served >= 2) { txt = ''; G.hintAt = null; }
    if (!txt) { if (!el.hidden) el.hidden = true; return; }
    if (el.textContent !== txt) el.textContent = txt;
    el.hidden = false;
  }

  // ======================================================================================
  //  UI SCREENS
  // ======================================================================================
  const ov = $('ov');
  let howBack = 'title';
  function setMode(play) { document.body.classList.toggle('play', play); document.body.classList.toggle('menu', !play); setTimeout(layout, 0); }
  function banner(text, big) {
    const b = $('banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); b.style.fontSize = big ? '' : '';
  }
  const starStr = (n) => '★'.repeat(n) + '<span class="off">' + '★'.repeat(3 - n) + '</span>';
  const letters = (w) => [...w].map((ch, i) => `<span style="animation-delay:${-i * 0.23}s">${ch}</span>`).join('');
  function chainHTML(d) {
    const ch = chainOf(d), img = (k) => `<img src="${iconURL(k)}" alt="">`;
    const parts = ch.parts.map((p) => img(p.ing) + p.via.map((v) => '<i>›</i>' + img('@' + v)).join(''));
    return parts.join('<i>+</i>') + (ch.pot ? '<i>›</i>' + img('@pot') : '') + '<i>›</i>' + img('@hatch');
  }
  function playerName() { try { return (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { return ''; } }

  function screenTitle() {
    G.screen = 'title'; ov.className = ''; setMode(false);
    const nm = playerName(), tot = totalStars();
    ov.innerHTML = `<div class="card title">
      <div class="logo"><div class="w1">${letters('Gravity')}</div><div class="w2">${letters('Chef')}</div></div>
      <div class="sub">${t('gc_sub')}</div>
      <p>${t('gc_tag')}</p>
      ${nm ? `<div class="chef">👨‍🍳 ${esc(t('gc_chef', { p: nm }))}</div>` : ''}
      <div class="col" style="width:min(300px,100%)"><button class="btn big" data-act="levels">▶ ${t('gc_play')}</button><button class="btn sec" data-act="how">❓ ${t('gc_how')}</button></div>
      <div class="tot">⭐ ${t('gc_stars', { n: tot, m: LEVELS.length * 3 })}</div>
    </div>`;
  }
  function screenLevels() {
    if (!G || G.mode !== 'demo') newWorld(DEMO, 'demo');
    G.screen = 'levels'; ov.className = 'dim'; setMode(false);
    const cur = LEVELS.findIndex((lv, i) => unlocked(i) && !(SAVE.stars[lv.n] > 0));
    ov.innerHTML = `<div class="card wide">
      <div class="head"><button class="btn sec sm" data-act="title">${t('gc_back')}</button><h2>${t('gc_shifts')}</h2><span class="tot">⭐ ${totalStars()}/${LEVELS.length * 3}</span></div>
      <div class="grid">${LEVELS.map((lv, i) => { const lk = !unlocked(i); return `<button class="lvl${lk ? ' lock' : ''}${i === cur ? ' cur' : ''}" data-act="level" data-n="${i}" ${lk ? `title="${esc(t('gc_locked'))}"` : ''}>
        <b>${lv.n}</b><span class="ic">${lv.icon}</span><span class="nm">${t(lv.name)}</span><span class="st">${starStr(SAVE.stars[lv.n] || 0)}</span></button>`; }).join('')}</div>
    </div>`;
  }
  function screenIntro(i) {
    const lv = LEVELS[i]; if (!lv) return;
    newWorld(lv, 'play'); G.screen = 'intro'; ov.className = 'dim'; setMode(false);
    SAVE.last = i; persist();
    ov.innerHTML = `<div class="card">
      <div class="kick">${t('gc_shift', { n: lv.n })} · ${lv.icon}</div><h2>${t(lv.name)}</h2>
      <div class="tipbox"><span class="new">${t('gc_new')}</span>${t(lv.tip)}</div>
      <h3>${t('gc_menu')}</h3>
      <div class="menu">${Object.keys(lv.menu).map((d) => `<div class="dish"><img src="${iconURL(d)}" alt=""><div class="dn"><b>${t('gc_d_' + d)}</b><div class="chain">${chainHTML(d)}</div></div><span class="val"><i class="coin"></i>${DISH[d].v}</span></div>`).join('')}</div>
      <div class="goal">${t('gc_goalLine', { a: lv.stars[0] })}<span class="stl">★ ${lv.stars[0]} · ★★ ${lv.stars[1]} · ★★★ ${lv.stars[2]}</span></div>
      <div class="row"><button class="btn sec" data-act="levels">${t('gc_back')}</button><button class="btn big" data-act="start">▶ ${t('gc_start')}</button></div>
    </div>`;
  }
  function startShift() {
    if (!G || G.mode !== 'play') return;
    G.screen = 'play'; G.live = true; ov.className = ''; ov.innerHTML = ''; setMode(true);
    if (G.gl) { const e = G.def.glitch.every; G.gl.next = G.T + rnd(e[0] * 0.6, e[1] * 0.7); }
    $('hShift').textContent = t('gc_shift', { n: G.def.n });
    const s3 = G.def.stars[2]; $('hT1').style.left = (G.def.stars[0] / s3 * 100) + '%'; $('hT2').style.left = (G.def.stars[1] / s3 * 100) + '%';
    hudCache = {}; updateHud();
    banner(t('gc_go'), 1); SFX.order();
  }
  function pauseGame() {
    if (!G || G.screen !== 'play') return;
    if (G.held) { ptr = null; release(null); }
    G.screen = 'pause'; screenPause();
  }
  function screenPause() {
    ov.className = 'dim';
    ov.innerHTML = `<div class="card small">
      <h2>⏸ ${t('gc_paused')}</h2>
      <button class="btn big" data-act="resume">▶ ${t('gc_resume')}</button>
      <button class="btn sec" data-act="restart">🔄 ${t('gc_restart')}</button>
      <button class="btn sec" data-act="how">❓ ${t('gc_how')}</button>
      <button class="btn sec" data-act="levels">📋 ${t('gc_quit')}</button>
      <div class="row"><button class="btn sec sm" data-act="sound">${SAVE.sound ? '🔊' : '🔇'} ${t('gc_sound')}</button><button class="btn sec sm" data-act="music">${SAVE.music ? '🎵' : '🎵✕'} ${t('gc_music')}</button><button class="btn sec sm" data-act="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button></div>
    </div>`;
  }
  function resumeGame() { if (!G || G.screen !== 'pause') return; G.screen = 'play'; ov.className = ''; ov.innerHTML = ''; }
  function screenHow(back) {
    howBack = back; ov.className = 'dim';
    const rows = [['egg', 'gc_h1t', 'gc_h1'], ['@pan', 'gc_h2t', 'gc_h2'], ['@pot', 'gc_h3t', 'gc_h3'], ['@hatch', 'gc_h4t', 'gc_h4'], [null, 'gc_h5t', 'gc_h5']];
    ov.innerHTML = `<div class="card wide">
      <h2>❓ ${t('gc_how')}</h2>
      <div class="how">${rows.map(([ic, a, b], i) => `<div class="hrow"><span class="hic">${ic ? `<img src="${iconURL(ic)}" alt="">` : '🌀'}</span><div><b>${i + 1}. ${t(a)}</b><p>${t(b)}</p></div></div>`).join('')}</div>
      <p class="keys">${t('gc_keys')}</p>
      <div class="row"><button class="btn big" data-act="howdone">${t('gc_gotit')}</button></div>
    </div>`;
    SAVE.how = 1; persist();
  }
  function endShift(win, why) {
    if (G.over) return;
    G.over = true; G.live = false; G.screen = 'ending';
    if (G.held) { ptr = null; release(null); }
    $('hint').hidden = true;
    const lv = G.def, sc = G.score;
    let stars = 0; if (win) stars = sc >= lv.stars[2] ? 3 : sc >= lv.stars[1] ? 2 : 1;
    const prevBest = SAVE.best[lv.n] || 0, newBest = sc > prevBest;
    if (newBest) SAVE.best[lv.n] = sc;
    if (stars > (SAVE.stars[lv.n] || 0)) SAVE.stars[lv.n] = stars;
    persist();
    G.result = { win, why, stars, newBest, best: Math.max(sc, prevBest) };
    banner(why === 'strikes' ? t('gc_closed') : t('gc_timeUp'), 1);
    if (win) SFX.win(); else SFX.lose();
    setTimeout(() => { if (G && G.over && G.mode === 'play') screenResult(); }, 1500);
  }
  function screenResult() {
    G.screen = 'result'; ov.className = 'dim'; setMode(false);
    const R = G.result, lv = G.def, i = lv.n - 1, hasNext = i + 1 < LEVELS.length;
    const why = R.win ? '' : R.why === 'strikes' ? t('gc_whyStrikes') : t('gc_whyScore', { a: lv.stars[0] });
    ov.innerHTML = `<div class="card">
      <div class="kick">${t('gc_shift', { n: lv.n })} · ${t(lv.name)}</div>
      <h2>${R.win ? '🎉 ' + t('gc_win') : '😵 ' + t('gc_lose')}</h2>
      ${why ? `<p class="why">${why}</p>` : ''}
      <div class="bigstars">${[1, 2, 3].map((k) => `<span class="${k <= R.stars ? 'on' : ''}" style="animation-delay:${0.2 + k * 0.28}s">★</span>`).join('')}</div>
      <div class="stats">
        <span>${t('gc_coins')}</span><b>${G.score}</b>
        <span>${t('gc_served')}</span><b>${G.served}</b>
        <span>${t('gc_tipsL')}</span><b>${G.tips}</b>
        <span>${t('gc_banks')}</span><b>${G.banks}</b>
        <span>${t('gc_best')}</span><b>${R.best}${R.newBest && G.score > 0 ? ` <span class="badge">${t('gc_newBest')}</span>` : ''}</b>
      </div>
      ${R.win && !hasNext ? `<p class="center">${t('gc_allDone')}</p>` : ''}
      <div class="row">
        ${R.win && hasNext ? `<button class="btn big" data-act="next">▶ ${t('gc_next')}</button>` : ''}
        <button class="btn ${R.win && hasNext ? 'sec' : 'big'}" data-act="retry">🔄 ${t('gc_retry')}</button>
        <button class="btn sec" data-act="levels">📋 ${t('gc_shifts')}</button>
      </div>
    </div>`;
    for (let k = 0; k < R.stars; k++) setTimeout(() => SFX.star(k), 480 + k * 280);
  }
  ov.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    AU.init(); SFX.click();
    const a = b.dataset.act;
    if (a === 'levels') { if (G && G.mode === 'play') newWorld(DEMO, 'demo'); screenLevels(); }
    else if (a === 'title') { screenTitle(); }
    else if (a === 'how') screenHow(G && G.screen === 'pause' ? 'pause' : 'title');
    else if (a === 'howdone') { if (howBack === 'pause') screenPause(); else screenTitle(); }
    else if (a === 'level') { const i = +b.dataset.n; if (unlocked(i)) screenIntro(i); else { b.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 220 }); SFX.nope(); } }
    else if (a === 'start') startShift();
    else if (a === 'resume') resumeGame();
    else if (a === 'restart' || a === 'retry') { const i = G.def.n - 1; screenIntro(i); startShift(); }
    else if (a === 'next') { const i = G.def.n; screenIntro(i); }
    else if (a === 'sound') { SAVE.sound = SAVE.sound ? 0 : 1; persist(); screenPause(); syncSoundBtn(); }
    else if (a === 'music') { SAVE.music = SAVE.music ? 0 : 1; persist(); screenPause(); }
    else if (a === 'lang') setLang(getLang() === 'ar' ? 'en' : 'ar');
  });
  $('bPause').addEventListener('click', () => { AU.init(); pauseGame(); });
  $('bLang').addEventListener('click', () => { AU.init(); setLang(getLang() === 'ar' ? 'en' : 'ar'); });
  $('bSound').addEventListener('click', () => { AU.init(); SAVE.sound = SAVE.sound ? 0 : 1; persist(); syncSoundBtn(); SFX.click(); });
  function syncSoundBtn() { $('bSound').textContent = SAVE.sound ? '🔊' : '🔇'; }
  function refreshScreen() {
    $('bLang').textContent = getLang() === 'ar' ? 'English' : 'العربية';
    if (!G) return;
    if (G.mode === 'play') $('hShift').textContent = t('gc_shift', { n: G.def.n });
    const sc = G.screen;
    if (ov.querySelector('.how')) { screenHow(howBack); return; }
    if (sc === 'title') screenTitle(); else if (sc === 'levels') screenLevels(); else if (sc === 'pause') screenPause(); else if (sc === 'result') screenResult();
    else if (sc === 'intro') screenIntro(G.def.n - 1);
  }
  document.addEventListener('langchange', refreshScreen);
  document.addEventListener('mal3abready', () => { if (G && G.screen === 'title') screenTitle(); });

  let hudCache = {};
  function setTxt(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).innerHTML = v; } }
  function updateHud() {
    if (!G || G.mode !== 'play') return;
    const tl = Math.max(0, Math.ceil(G.timeLeft));
    setTxt('hTimeV', Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0'));
    const urg = tl <= 10 && G.live; if (hudCache.urg !== urg) { hudCache.urg = urg; $('hTime').classList.toggle('urgent', urg); }
    setTxt('hScore', String(G.score));
    const s = G.def.stars, st = G.score >= s[2] ? 3 : G.score >= s[1] ? 2 : G.score >= s[0] ? 1 : 0;
    setTxt('hStars', '★'.repeat(st) + '<span style="color:#485078">' + '★'.repeat(3 - st) + '</span>');
    const fw = Math.min(100, G.score / s[2] * 100).toFixed(1) + '%'; if (hudCache.fw !== fw) { hudCache.fw = fw; $('hFill').style.width = fw; }
    const lives = G.def.lives || 3, left = Math.max(0, lives - G.strikes);
    setTxt('hLives', '♥'.repeat(left) + '<span class="lost">' + '♥'.repeat(lives - left) + '</span>');
  }

  // ======================================================================================
  //  MAIN LOOP
  // ======================================================================================
  let last = performance.now(), hintClock = 0;
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    try {
      update(dt);
      hintClock -= dt; if (hintClock <= 0) { hintClock = 0.2; updateHint(); }
      updateHud();
      render();
    } catch (e) { console.warn(e); }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', () => { layout(); });
  window.addEventListener('orientationchange', () => setTimeout(layout, 200));

  // ======================================================================================
  //  TEST / SCRIPTING API
  // ======================================================================================
  function findAim(it, target, opts) {
    opts = opts || {};
    const speeds = opts.speeds || [520, 700, 880, 1060], step = opts.step || 3;
    let best = null;
    for (const sp of speeds) for (let a = 0; a < 360; a += step) {
      const r = a * Math.PI / 180, vx = Math.cos(r) * sp, vy = Math.sin(r) * sp;
      const s = simulate(it, vx, vy);
      if (s.end && s.end === target && !s.fire) { const sc = s.t + s.marks.length * 0.15; if (!best || sc < best.sc) best = { vx, vy, sc, b: s.marks.length }; }
    }
    return best;
  }
  const byId = (id) => G.items.find((i) => i.id === id) || G.stations.find((s) => s.id === id) || G.ports.find((p) => p.id === id);
  window.GravityChef = {
    get state() { return G; }, get save() { return SAVE; }, levels: LEVELS, layout: L,
    openLevel(n) { screenIntro(n - 1); }, start(n) { screenIntro(n - 1); startShift(); },
    pause: () => pauseGame(), resume: () => resumeGame(), title: () => screenTitle(), levelsScreen: () => screenLevels(),
    step(sec, rdt) { rdt = rdt || 1 / 60; for (let t2 = 0; t2 < sec; t2 += rdt) { update(rdt); if (G.screen === 'result' || (G.over && G.screen !== 'ending')) break; } updateHint(); updateHud(); render(); },
    items: () => G.items.map((i) => ({ id: i.id, kind: i.kind, x: Math.round(i.x), y: Math.round(i.y) })),
    stations: () => G.stations.map((s) => ({ id: s.id, t: s.t, x: Math.round(s.x), y: Math.round(s.y), c: s.c && { ph: s.c.ph, out: s.c.out }, rec: s.rec, list: s.list.slice() })),
    ports: () => G.ports.map((p) => ({ id: p.id, t: p.t, w: p.w, p: p.p })),
    orders: () => G.orders.map((o) => ({ d: o.d, t: Math.round(o.t) })),
    spawn(kind, x, y) { const it = mkItem(kind, x == null ? W / 2 : x, y == null ? H / 2 : y); G.items.push(it); return it.id; },
    grab(id) { const o = byId(id); if (!o) return null; let it = o; if (o.c !== undefined && o.t) { it = takeFrom(o); if (!it) return null; } if (G.held) release(null); grabIt(it); return it.id; },
    fling(vx, vy) { if (!G.held) return false; release([vx, vy, 0.6]); return true; },
    aim(itemId, targetId) { const it = byId(itemId) || G.held, tg = byId(targetId); if (!it || !tg) return null; return findAim(it, tg); },
    shoot(itemId, targetId) {   // grab + find a shot that the preview says lands in the target + fling
      let it = itemId ? byId(itemId) : G.held; const tg = byId(targetId); if (!it || !tg) return false;
      if (it.c !== undefined && it.t) { it = takeFrom(it); if (!it) return false; }
      if (G.held !== it) { if (G.held) release(null); grabIt(it); }
      const a = findAim(it, tg); if (!a) { release(null); return false; }
      release([a.vx, a.vy, 0.6]); return true;
    },
    simulate(vx, vy) { if (!G.held) return null; const s = simulate(G.held, vx, vy); return { end: s.end && s.end.id, bounces: s.marks.length, n: s.pts.length }; },
    setAim(x, y) { if (G.held) G.aim = { x, y }; },
    setGravity(x, y) { G.gk.push({ t: G.T, x, y }); },
    nextAction() { const a = nextAction(); return a && { kind: a.kind, item: a.item && a.item.id, to: a.to && a.to.id, st: a.st && a.st.id }; },
    forceEnd(win) { if (win) G.score = Math.max(G.score, G.def.stars[2]); endShift(!!win, win ? 'score' : 'strikes'); },
    toScreen: (x, y) => toS(x, y), toWorld: (x, y) => toW(x, y),
  };

  // ======================================================================================
  //  BOOT
  // ======================================================================================
  layout();
  newWorld(DEMO, 'demo');
  syncSoundBtn();
  $('bLang').textContent = getLang() === 'ar' ? 'English' : 'العربية';
  screenTitle();
  document.addEventListener('pointerdown', () => AU.init(), { once: true });
  requestAnimationFrame(frame);
})();
