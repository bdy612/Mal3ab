'use strict';
// =====================================================================
// Color Storm (عاصفة الألوان) — core: strings, deck, rules engine, bot brains, sound.
// The engine is pure state + functions so the same code runs a local game and the online host.
// =====================================================================
(function () {
const CS = window.CS = {};

addStrings({
  cs_title: 'عاصفة الألوان', cs_tag: 'طابق اللون أو الرقم، وخلّص كروتك قبل الكل!',
  cs_vsBots: 'العب ضد البوتات', cs_local: 'على نفس الجهاز', cs_online: 'أونلاين (2-6)', cs_how: 'إزاي تلعب', cs_rules: 'قواعد اللعب', cs_stats: 'إحصائياتك',
  cs_bots: 'عدد البوتات', cs_brain: 'مستوى البوتات', cs_easy: 'سهل', cs_normal: 'عادي', cs_hard: 'صعب', cs_start: 'ابدأ', cs_back: 'رجوع',
  cs_players: 'عدد اللاعيبة', cs_namePh: 'اسم اللاعب {n}', cs_defName: 'لاعب {n}', cs_you: 'إنت', cs_yourTurn: 'دورك!', cs_turnOf: 'دور {p}',
  cs_draw: 'اسحب', cs_passBtn: 'فوّت', cs_last: 'آخر كارت!', cs_lastDone: 'قلتها ✓', cs_catch: 'امسك {p}!', cs_drawN: 'اسحب {n}',
  cs_caught: '{a} مسك {p}! يسحب 2 🚨', cs_called: 'آخر كارت!', cs_stackHint: 'عليك +{n}: العب +2 أو +4، أو اسحب {n}', cs_pend: '+{n}',
  cs_pickColor: 'اختار اللون', cs_c_r: 'أحمر', cs_c_y: 'أصفر', cs_c_g: 'أخضر', cs_c_b: 'أزرق', cs_have: 'معاك {n}',
  cs_swapWith: 'هتبدّل كروتك مع مين؟', cs_cards: '{n} كارت', cs_card1: 'كارت واحد',
  cs_passTo: 'ادّي الجهاز لـ {p}', cs_passHide: 'متبصّش على كروت حد تاني 😉', cs_imReady: 'أنا {p} — وريني كروتي', cs_lateCall: '{p}: آخر كارت!',
  cs_roundWin: '{p} كسب الجولة!', cs_youWinRound: 'كسبت الجولة! 🎉', cs_matchWin: '{p} كسب الماتش! 🏆', cs_youWinMatch: 'مبروك! كسبت الماتش 🏆', cs_youLose: 'المرة الجاية بقى!',
  cs_pts: '+{n} نقطة', cs_score: 'النقط', cs_round: 'جولة {n}', cs_target: 'أول واحد يوصل {n} نقطة يكسب', cs_oneRound: 'جولة واحدة', cs_left2: 'باقيله {n}',
  cs_nextRound: 'الجولة الجاية', cs_newMatch: 'ماتش جديد', cs_menu: 'القايمة', cs_paused: 'اللعبة واقفة', cs_resume: 'كمّل', cs_sound: 'الصوت', cs_on: 'شغال', cs_off: 'مقفول',
  cs_quit: 'اخرج من الماتش', cs_scores: 'النقط', cs_close: 'تمام', cs_handPts: 'كروته: {n}', cs_thisRound: 'الجولة دي',
  cs_r_stack: 'تكديس كروت السحب', cs_r_stackD: 'ترمي +2 على +2 (أو +4 على أي واحد فيهم) واللي بعدك يشيل المجموع.',
  cs_r_until: 'اسحب لحد ما ينفع', cs_r_untilD: 'لما تسحب، تفضل تسحب لحد ما يطلعلك كارت تقدر تلعبه.',
  cs_r_sz: 'قاعدة 7-0', cs_r_szD: 'الـ 7: تبدّل كروتك مع لاعب تختاره. الـ 0: الكل يعدّي كروته للي بعده.',
  cs_r_tw: 'كروت العاصفة والمطرة', cs_r_twD: 'كروت جديدة بتاعتنا: العاصفة بتلفّ الكروت على الكل، والمطرة بتسحّب الكل كارت.',
  cs_r_target: 'نقط الفوز بالماتش', cs_r_timer: 'وقت الدور (أونلاين)', cs_sec: '{n} ث', cs_none: 'من غير',
  cs_k_skip: 'تجميد', cs_k_rev: 'زوبعة', cs_k_d2: 'بَرَد +2', cs_k_wild: 'قوس قزح', cs_k_w4: 'رعد +4', cs_k_storm: 'عاصفة', cs_k_rain: 'مطرة', cs_k_num: 'كروت الأرقام',
  cs_d_num: '0 لـ 9 في 4 ألوان. العب على نفس اللون أو نفس الرقم.', cs_d_skip: 'اللي بعدك بيتجمّد ويفوّت دوره.', cs_d_rev: 'بتعكس اتجاه اللعب (لو اتنين بس بتبقى زي التجميد).',
  cs_d_d2: 'اللي بعدك يسحب 2 ويفوّت دوره.', cs_d_wild: 'العبه على أي حاجة واختار اللون الجديد.', cs_d_w4: 'اختار اللون، واللي بعدك يسحب 4 ويفوّت دوره.',
  cs_d_storm: 'كل واحد يعدّي كل كروته للي بعده في اتجاه اللعب!', cs_d_rain: 'كل اللاعيبة التانيين يسحبوا كارت.',
  cs_h1: 'كل لاعب بياخد 7 كروت. في دورك العب كارت من نفس لون أو رقم (أو رمز) الكارت اللي فوق.', cs_h2: 'مفيش حاجة تنفع؟ اسحب كارت. لو الكارت اللي سحبته ينفع تقدر تلعبه على طول.',
  cs_h3: 'لما يفضل معاك كارتين وهتلعب واحد، دوس «آخر كارت!». لو نسيت وحد مسكك قبل اللي بعدك ما يلعب، تسحب 2.', cs_h4: 'أول واحد يخلّص كروته ياخد نقط كروت الباقيين: الرقم بقيمته، الأكشن 20، والملوّن 50.',
  cs_h5: 'أول واحد يوصل نقط الفوز يكسب الماتش. القواعد الإضافية تتغيّر من «قواعد اللعب».',
  cs_keys: 'الكيبورد: ← → تختار · Enter تلعب · D تسحب · L آخر كارت · C تمسك · P وقفة',
  cs_hint: 'اسحب الكروت يمين وشمال · دوس على كارت أو ارفعه لفوق عشان تلعبه',
  cs_e_skip: '{p} اتجمّد! ❄', cs_e_rev: 'الاتجاه اتعكس! 🌀', cs_e_drew: '{p} سحب {n}', cs_e_storm: 'عاصفة! الكروت لفّت على الكل 🌪', cs_e_rain: 'مطرة! الكل يسحب كارت ☔',
  cs_e_swap: '{a} بدّل كروته مع {b} 🔄', cs_e_zero: 'صفر! الكل عدّى كروته', cs_e_color: 'اللون بقى {c}', cs_e_stack: '+{n} ولسه!', cs_e_out: '{p} خلّص كروته!',
  cs_e_timeUp: 'وقت {p} خلص ⏰', cs_e_noDraw: 'مفيش كروت تتسحب', cs_cantPlay: 'الكارت ده مينفعش دلوقتي', cs_notTurn: 'استنى دورك',
  cs_s_rounds: 'جولات لعبتها', cs_s_rwins: 'جولات كسبتها', cs_s_matches: 'ماتشات', cs_s_mwins: 'ماتشات كسبتها', cs_s_cards: 'كروت لعبتها', cs_s_best: 'أعلى نقط في جولة',
  cs_s_catch: 'مرات مسكت حد', cs_s_caught: 'مرات اتمسكت', cs_s_storms: 'عواصف عملتها', cs_s_streak: 'أطول سلسلة فوز', cs_s_hard: 'كسبت البوتات الصعبة', cs_reset: 'امسح الإحصائيات',
  cs_bot: 'بوت', cs_botN: 'بوت {n}', cs_away: 'بره · بوت بيلعب', cs_playing: 'بيلعب', cs_lang: 'English'
}, {
  cs_title: 'Color Storm', cs_tag: 'Match the colour or the number and empty your hand first!',
  cs_vsBots: 'Play vs bots', cs_local: 'Same device', cs_online: 'Online (2–6)', cs_how: 'How to play', cs_rules: 'House rules', cs_stats: 'Your stats',
  cs_bots: 'Bots', cs_brain: 'Bot level', cs_easy: 'Easy', cs_normal: 'Normal', cs_hard: 'Hard', cs_start: 'Start', cs_back: 'Back',
  cs_players: 'Players', cs_namePh: 'Player {n} name', cs_defName: 'Player {n}', cs_you: 'You', cs_yourTurn: 'Your turn!', cs_turnOf: "{p}'s turn",
  cs_draw: 'Draw', cs_passBtn: 'Pass', cs_last: 'Last card!', cs_lastDone: 'Called ✓', cs_catch: 'Catch {p}!', cs_drawN: 'Draw {n}',
  cs_caught: '{a} caught {p}! +2 cards 🚨', cs_called: 'Last card!', cs_stackHint: '+{n} on you: stack a +2/+4 or draw {n}', cs_pend: '+{n}',
  cs_pickColor: 'Pick a colour', cs_c_r: 'Red', cs_c_y: 'Yellow', cs_c_g: 'Green', cs_c_b: 'Blue', cs_have: 'You have {n}',
  cs_swapWith: 'Swap hands with who?', cs_cards: '{n} cards', cs_card1: '1 card',
  cs_passTo: 'Pass the device to {p}', cs_passHide: "No peeking at anyone else's cards 😉", cs_imReady: "I'm {p} — show my cards", cs_lateCall: '{p}: last card!',
  cs_roundWin: '{p} wins the round!', cs_youWinRound: 'You won the round! 🎉', cs_matchWin: '{p} wins the match! 🏆', cs_youWinMatch: 'You won the match! 🏆', cs_youLose: 'Better luck next time!',
  cs_pts: '+{n} points', cs_score: 'Score', cs_round: 'Round {n}', cs_target: 'First to {n} points wins', cs_oneRound: 'Single round', cs_left2: '{n} to go',
  cs_nextRound: 'Next round', cs_newMatch: 'New match', cs_menu: 'Menu', cs_paused: 'Paused', cs_resume: 'Resume', cs_sound: 'Sound', cs_on: 'On', cs_off: 'Off',
  cs_quit: 'Quit match', cs_scores: 'Scores', cs_close: 'OK', cs_handPts: 'Hand: {n}', cs_thisRound: 'This round',
  cs_r_stack: 'Stack draw cards', cs_r_stackD: 'Play a +2 on a +2 (or a +4 on either) and the next player takes the whole pile-up.',
  cs_r_until: 'Draw until you can play', cs_r_untilD: 'When you draw, keep drawing until you get a card you can play.',
  cs_r_sz: '7-0 swap', cs_r_szD: 'A 7 swaps your hand with a player you pick. A 0 makes everyone pass their hand along.',
  cs_r_tw: 'Storm & Downpour cards', cs_r_twD: 'Our own twists: Storm moves every hand one seat, Downpour makes everyone else draw.',
  cs_r_target: 'Points to win the match', cs_r_timer: 'Turn timer (online)', cs_sec: '{n}s', cs_none: 'Off',
  cs_k_skip: 'Freeze', cs_k_rev: 'Whirl', cs_k_d2: 'Hail +2', cs_k_wild: 'Rainbow', cs_k_w4: 'Thunder +4', cs_k_storm: 'Storm', cs_k_rain: 'Downpour', cs_k_num: 'Number cards',
  cs_d_num: '0 to 9 in 4 colours. Play on the same colour or the same number.', cs_d_skip: 'The next player is frozen and loses their turn.', cs_d_rev: 'Flips the direction of play (with 2 players it works like Freeze).',
  cs_d_d2: 'The next player draws 2 and loses their turn.', cs_d_wild: 'Play it on anything and pick the new colour.', cs_d_w4: 'Pick the colour; the next player draws 4 and loses their turn.',
  cs_d_storm: 'Everyone passes their whole hand to the next player in the direction of play!', cs_d_rain: 'Every other player draws 1 card.',
  cs_h1: 'Everyone gets 7 cards. On your turn, play a card that matches the top card by colour or by number (or symbol).', cs_h2: 'Nothing fits? Draw a card. If the card you drew fits, you can play it straight away.',
  cs_h3: 'When you are down to two cards and play one, press “Last card!”. Forget, and anyone who catches you before the next player moves makes you draw 2.', cs_h4: 'The first player out of cards scores the cards left in everyone else’s hands: numbers at face value, actions 20, rainbow cards 50.',
  cs_h5: 'First to the target score wins the match. Change the extra rules in House rules.',
  cs_keys: 'Keyboard: ← → pick · Enter play · D draw · L last card · C catch · P pause',
  cs_hint: 'Drag your cards sideways · tap a card or flick it up to play it',
  cs_e_skip: '{p} is frozen! ❄', cs_e_rev: 'Direction flipped! 🌀', cs_e_drew: '{p} draws {n}', cs_e_storm: 'Storm! Every hand moves one seat 🌪', cs_e_rain: 'Downpour! Everyone else draws 1 ☔',
  cs_e_swap: '{a} swapped hands with {b} 🔄', cs_e_zero: 'Zero! Everyone passes their hand', cs_e_color: 'Colour is now {c}', cs_e_stack: '+{n} and counting!', cs_e_out: '{p} is out of cards!',
  cs_e_timeUp: "{p}'s time is up ⏰", cs_e_noDraw: 'No cards left to draw', cs_cantPlay: "That card can't be played now", cs_notTurn: 'Wait for your turn',
  cs_s_rounds: 'Rounds played', cs_s_rwins: 'Rounds won', cs_s_matches: 'Matches', cs_s_mwins: 'Matches won', cs_s_cards: 'Cards played', cs_s_best: 'Best round score',
  cs_s_catch: 'Players caught', cs_s_caught: 'Times caught', cs_s_storms: 'Storms unleashed', cs_s_streak: 'Longest win streak', cs_s_hard: 'Wins vs hard bots', cs_reset: 'Reset stats',
  cs_bot: 'Bot', cs_botN: 'Bot {n}', cs_away: 'Away · bot playing', cs_playing: 'Playing', cs_lang: 'العربية'
});

// ---------------------------------------------------------------- deck (fixed order: a card id means the same card on every device)
const COLORS = ['r', 'y', 'g', 'b'];
const DECK = [];
for (const c of COLORS) {
  DECK.push({ c, v: '0' });
  for (let n = 1; n <= 9; n++) DECK.push({ c, v: String(n) }, { c, v: String(n) });
  for (const a of ['skip', 'rev', 'd2']) DECK.push({ c, v: a }, { c, v: a });
  DECK.push({ c, v: 'storm' }, { c, v: 'rain' });
}
for (let i = 0; i < 4; i++) DECK.push({ c: 'w', v: 'wild' }, { c: 'w', v: 'w4' });
DECK.forEach((d, i) => { d.id = i; d.num = /^\d$/.test(d.v); });
const TWIST = new Set(['storm', 'rain']);
const points = (id) => { const d = DECK[id]; return d.num ? +d.v : d.c === 'w' ? 50 : 20; };
const handPoints = (h) => h.reduce((a, id) => a + points(id), 0);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DEF_RULES = { stack: true, until: false, sz: false, tw: true, target: 200, timer: 20 };
const TARGETS = [0, 100, 200, 300, 500];
const TIMERS = [0, 10, 15, 20, 30, 45];
Object.assign(CS, { COLORS, DECK, TWIST, points, handPoints, shuffle, DEF_RULES, TARGETS, TIMERS });

// ---------------------------------------------------------------- engine
// seat: { id, name, kind: 'human'|'bot', brain, score, hand: [], called, away, remote }
const E = CS.E = {};
const nS = (G) => G.seats.length;
const at = (G, k) => ((G.turn + G.dir * k) % nS(G) + nS(G) * 4) % nS(G);
const topCard = (G) => DECK[G.disc[G.disc.length - 1]];
E.next = at;
E.top = topCard;
E.newMatch = (seats, rules) => {
  const G = { seats: seats.map(s => Object.assign({ score: 0, hand: [], called: false, away: false, brain: 'normal', kind: 'human' }, s)),
    rules: Object.assign({}, DEF_RULES, rules || {}), draw: [], disc: [], color: 'r', dir: 1, turn: 0, pending: 0, pendT: '', drew: -1,
    phase: 'idle', catchable: -1, catchId: 0, round: 0, dealer: -1, last: null, ev: [], turnAt: 0, mem: {} };
  return G;
};
function emit(G, e) { G.ev.push(e); }
function refill(G) {
  if (G.draw.length) return true;
  if (G.disc.length <= 1) return false;
  const top = G.disc.pop(); G.draw = shuffle(G.disc); G.disc = [top];
  emit(G, { k: 'reshuffle' });
  return G.draw.length > 0;
}
function drawN(G, s, n, why) {
  const p = G.seats[s], ids = [];
  for (let i = 0; i < n; i++) { if (!refill(G)) break; const id = G.draw.pop(); p.hand.push(id); ids.push(id); }
  if (p.hand.length !== 1) p.called = false;
  if (G.catchable === s) G.catchable = -1;
  emit(G, { k: 'draw', p: s, ids, n: ids.length, why: why || '' });
  if (!ids.length) emit(G, { k: 'nodraw', p: s });
  return ids;
}
E.newRound = (G) => {
  const n = nS(G);
  G.round++; G.dealer = (G.dealer + 1) % n;
  let pool = shuffle(DECK.filter(d => G.rules.tw || !TWIST.has(d.v)).map(d => d.id));
  for (const p of G.seats) { p.hand = []; p.called = false; }
  for (let r = 0; r < 7; r++) for (let i = 1; i <= n; i++) G.seats[(G.dealer + i) % n].hand.push(pool.pop());
  // the first card is always a number card
  let k = pool.length - 1; while (!DECK[pool[k]].num) k--;
  const top = pool.splice(k, 1)[0];
  G.draw = pool; G.disc = [top]; G.color = DECK[top].c; G.dir = 1; G.pending = 0; G.pendT = ''; G.drew = -1; G.catchable = -1; G.last = null; G.mem = {};
  G.turn = (G.dealer + 1) % n; G.phase = 'play'; G.turnAt = Date.now();
  emit(G, { k: 'deal', n, first: G.turn, dealer: G.dealer });
  emit(G, { k: 'turn', p: G.turn });
};
E.canPlay = (G, s, id) => {
  if (G.phase !== 'play' || G.turn !== s) return false;
  const p = G.seats[s]; if (!p.hand.includes(id)) return false;
  if (G.drew >= 0 && id !== G.drew) return false;
  const c = DECK[id], top = topCard(G);
  if (G.pending > 0) return G.pendT === 'd2' ? (c.v === 'd2' || c.v === 'w4') : c.v === 'w4';
  if (c.c === 'w') return true;
  return c.c === G.color || c.v === top.v;
};
E.playable = (G, s) => (G.seats[s] ? G.seats[s].hand.filter(id => E.canPlay(G, s, id)) : []);
function closeCatch(G, s) { if (G.catchable >= 0 && G.catchable !== s) G.catchable = -1; }
function advance(G, steps) {
  G.turn = at(G, steps); G.drew = -1; G.turnAt = Date.now();
  emit(G, { k: 'turn', p: G.turn });
}
function afterShuffleHands(G) {
  G.catchable = -1;
  for (const p of G.seats) p.called = p.hand.length === 1;   // nobody gets caught for cards they were handed
}
function passHands(G, why) {
  const n = nS(G), hands = G.seats.map(p => p.hand);
  for (let i = 0; i < n; i++) G.seats[((i + G.dir) % n + n) % n].hand = hands[i];
  afterShuffleHands(G);
  emit(G, { k: 'pass', dir: G.dir, why });
}
E.bestColor = (hand) => {
  const cnt = { r: 0, y: 0, g: 0, b: 0 };
  for (const id of hand) { const c = DECK[id].c; if (c !== 'w') cnt[c] += 1 + points(id) / 40; }
  let best = COLORS[Math.floor(Math.random() * 4)], bv = 0;
  for (const c of COLORS) if (cnt[c] > bv) { bv = cnt[c]; best = c; }
  return best;
};
E.fewestOther = (G, s) => { let b = -1; G.seats.forEach((p, i) => { if (i !== s && (b < 0 || p.hand.length < G.seats[b].hand.length)) b = i; }); return b; };
E.play = (G, s, id, opt) => {
  opt = opt || {};
  if (!E.canPlay(G, s, id)) return false;
  closeCatch(G, s);
  const p = G.seats[s], c = DECK[id], n = nS(G);
  p.hand.splice(p.hand.indexOf(id), 1); G.disc.push(id); G.drew = -1;
  G.color = c.c === 'w' ? (COLORS.includes(opt.color) ? opt.color : E.bestColor(p.hand)) : c.c;
  emit(G, { k: 'play', p: s, id, color: G.color });
  if (p.hand.length === 1) { if (!p.called) { G.catchable = s; G.catchId++; } }
  else p.called = false;
  const out = p.hand.length === 0;
  let steps = 1;
  switch (c.v) {
    case 'skip': steps = 2; emit(G, { k: 'skip', p: at(G, 1) }); break;
    case 'rev':
      if (n === 2) { steps = 2; emit(G, { k: 'skip', p: at(G, 1) }); }
      else { G.dir *= -1; emit(G, { k: 'rev', dir: G.dir }); }
      break;
    case 'd2': case 'w4': {
      const amt = c.v === 'd2' ? 2 : 4;
      if (G.rules.stack) { G.pending += amt; G.pendT = c.v; emit(G, { k: 'stack', n: G.pending }); }
      else { drawN(G, at(G, 1), amt, 'hit'); steps = 2; }
      break;
    }
    case 'rain': for (let k = 1; k < n; k++) drawN(G, at(G, k), 1, 'rain'); emit(G, { k: 'rain' }); break;
    case 'storm': if (!out) passHands(G, 'storm'); break;
    case '0': if (G.rules.sz && !out) passHands(G, 'zero'); break;
    case '7':
      if (G.rules.sz && !out) {
        let tg = opt.target | 0; if (opt.target == null || tg === s || !G.seats[tg]) tg = E.fewestOther(G, s);
        const h = p.hand; p.hand = G.seats[tg].hand; G.seats[tg].hand = h; afterShuffleHands(G);
        emit(G, { k: 'swap', a: s, b: tg });
      }
      break;
  }
  if (out) {
    if (G.pending) { drawN(G, at(G, 1), G.pending, 'hit'); G.pending = 0; G.pendT = ''; }
    endRound(G, s); return true;
  }
  advance(G, steps);
  return true;
};
E.draw = (G, s) => {
  if (G.phase !== 'play' || G.turn !== s || G.drew >= 0) return false;
  closeCatch(G, s);
  const p = G.seats[s];
  if (G.pending > 0) {
    const n = G.pending; G.pending = 0; G.pendT = '';
    drawN(G, s, n, 'hit'); advance(G, 1); return true;
  }
  let got = [];
  if (G.rules.until) {
    for (let i = 0; i < 60; i++) {
      const ids = drawN(G, s, 1, 'self'); if (!ids.length) break; got.push(ids[0]);
      G.drew = ids[0]; if (E.canPlay(G, s, ids[0])) break; G.drew = -1;
    }
  } else got = drawN(G, s, 1, 'self');
  const last = got[got.length - 1];
  G.drew = -1;
  if (last != null) { G.drew = last; if (!E.canPlay(G, s, last)) G.drew = -1; }
  if (G.drew < 0) { (G.mem[s] = G.mem[s] || {})[G.color] = 1; advance(G, 1); }   // bots remember which colour this player lacked
  else emit(G, { k: 'canplay', p: s });
  return true;
};
E.pass = (G, s) => { if (G.phase !== 'play' || G.turn !== s || G.drew < 0) return false; (G.mem[s] = G.mem[s] || {})[G.color] = 1; advance(G, 1); return true; };
E.call = (G, s) => {
  const p = G.seats[s]; if (!p || G.phase !== 'play' || p.called) return false;
  if (p.hand.length === 1 && G.catchable === s) { p.called = true; G.catchable = -1; emit(G, { k: 'call', p: s, late: 1 }); return true; }
  if (p.hand.length === 2) { p.called = true; emit(G, { k: 'call', p: s }); return true; }
  return false;
};
E.catchP = (G, by, tg) => {
  if (G.phase !== 'play' || G.catchable !== tg || tg === by || !G.seats[tg] || G.seats[tg].called) return false;
  G.catchable = -1;
  emit(G, { k: 'catch', by, p: tg });
  drawN(G, tg, 2, 'catch');
  return true;
};
function endRound(G, w) {
  const each = G.seats.map(p => handPoints(p.hand));
  const pts = each.reduce((a, v, i) => a + (i === w ? 0 : v), 0);
  G.seats[w].score += pts;
  const t = G.rules.target;
  const champ = !t || G.seats[w].score >= t;
  G.last = { w, pts, each, hands: G.seats.map(p => p.hand.slice()), match: champ };
  G.phase = champ ? 'match' : 'round'; G.catchable = -1; G.pending = 0; G.pendT = '';
  emit(G, { k: 'round', w, pts, match: champ ? 1 : 0 });
}
// time ran out (online) or a stuck seat: draw / pass for them
E.auto = (G, s) => {
  if (G.phase !== 'play' || G.turn !== s) return false;
  emit(G, { k: 'timeup', p: s });
  if (G.drew >= 0) return E.pass(G, s);
  E.draw(G, s);
  if (G.turn === s && G.drew >= 0) E.pass(G, s);
  return true;
};
// what one seat may see (me = -1: a spectator). Hands of other players are never in it.
E.view = (G, me) => ({
  s: G.seats.map(p => ({ id: p.id, n: p.name, c: p.hand.length, sc: p.score, ca: p.called ? 1 : 0, b: p.kind === 'bot' ? 1 : 0, aw: p.away ? 1 : 0, br: p.brain })),
  me, h: me >= 0 && G.seats[me] ? G.seats[me].hand.slice() : [],
  d: G.disc.slice(-4), dc: G.draw.length, c: G.color, dir: G.dir, t: G.turn, pe: G.pending, pt: G.pendT,
  dr: me === G.turn ? G.drew : -1, ph: G.phase, k: G.catchable, kid: G.catchId, r: G.round, ru: G.rules, last: G.last,
  de: G.dealer, on: G.online ? 1 : 0,
  dl: G.online && G.rules.timer && G.phase === 'play' ? Math.max(0, G.turnAt + G.rules.timer * 1000 - Date.now()) : 0
});
// events as one seat may see them: the ids of cards someone else drew stay hidden
E.viewEvents = (evs, me) => evs.map(e => (e.k === 'draw' && e.p !== me) ? Object.assign({}, e, { ids: [] }) : e);

// ---------------------------------------------------------------- bot brains
const BRAIN = {
  easy: { forget: 0.35, late: 0.25, catchP: 0.35, catchT: [2200, 3800], stack: 0.55, think: [900, 1500] },
  normal: { forget: 0.12, late: 0.45, catchP: 0.7, catchT: [1200, 2400], stack: 0.85, think: [800, 1300] },
  hard: { forget: 0.03, late: 0.7, catchP: 0.95, catchT: [600, 1400], stack: 1, think: [700, 1150] }
};
CS.BRAIN = BRAIN;
const rnd = (a, b) => a + Math.random() * (b - a);
CS.rnd = rnd;
// -> { a: 'play', id, color, target, call } | { a: 'draw' } | { a: 'pass' }
CS.botMove = (G, s) => {
  const p = G.seats[s], brain = p.kind === 'bot' ? p.brain : 'normal', B = BRAIN[brain] || BRAIN.normal;
  const can = E.playable(G, s);
  if (!can.length) return { a: G.drew >= 0 ? 'pass' : 'draw' };
  if (G.pending > 0 && Math.random() > B.stack) return { a: 'draw' };
  const n = nS(G), nx = at(G, 1), nxN = G.seats[nx].hand.length, me = p.hand.length;
  const prev = ((s - G.dir) % n + n) % n;
  let pick;
  if (brain === 'easy') pick = can[Math.floor(Math.random() * can.length)];
  else {
    const hard = brain === 'hard', lacks = G.mem[nx] || {};
    let best = -1e9;
    for (const id of can) {
      const c = DECK[id], rest = p.hand.filter(x => x !== id);
      let v = Math.random() * (hard ? 0.4 : 1.2);
      if (c.num) v += 2 + (+c.v) / 4;                              // dump high numbers
      if (c.c === G.color) v += 1;                                  // keep the colour
      const sameCol = rest.filter(x => DECK[x].c === (c.c === 'w' ? E.bestColor(rest) : c.c)).length;
      v += sameCol * 0.5;
      if (c.c === 'w') v -= hard ? (me > 2 ? 4 : -1) : 2;           // save rainbow cards
      if (['skip', 'd2', 'w4'].includes(c.v) || (c.v === 'rev' && n === 2)) v += nxN <= 2 ? 6 : nxN <= 4 ? 1.5 : 0.5;
      if (c.v === 'w4') v += nxN <= 2 ? 3 : -1;
      if (G.pending > 0) v += c.v === 'd2' ? 2 : 0;                  // stack the cheaper card first
      if (c.v === 'rain') v += G.seats.some((q, i) => i !== s && q.hand.length <= 2) ? 4 : 1;
      if (c.v === 'storm' || (c.v === '0' && G.rules.sz)) { const d = G.seats[prev].hand.length - (me - 1); v += hard ? -d * 1.5 : -d * 0.7; }
      if (c.v === '7' && G.rules.sz) { const f = E.fewestOther(G, s); v += hard ? ((me - 1) - G.seats[f].hand.length) * 1.4 : 1; }
      if (hard && c.c !== 'w' && c.c !== G.color && lacks[c.c]) v += 2.5;   // switch to a colour the next player lacks
      if (hard && c.c !== 'w' && lacks[G.color] && c.c === G.color) v += 1.5;
      if (v > best) { best = v; pick = id; }
    }
  }
  const c = DECK[pick];
  const r = { a: 'play', id: pick };
  const rest = p.hand.filter(x => x !== pick);
  if (c.c === 'w') {
    if (brain === 'easy') r.color = COLORS[Math.floor(Math.random() * 4)];
    else { r.color = E.bestColor(rest); const lacks = G.mem[nx] || {}; if (brain === 'hard' && !rest.length) r.color = COLORS.find(x => lacks[x]) || r.color; }
  }
  if (c.v === '7' && G.rules.sz) r.target = brain === 'easy' ? [...Array(n).keys()].filter(i => i !== s)[Math.floor(Math.random() * (n - 1))] : E.fewestOther(G, s);
  if (rest.length === 1) r.call = Math.random() > B.forget;
  return r;
};
CS.botThink = (G, s) => { const p = G.seats[s], B = BRAIN[p.kind === 'bot' ? p.brain : 'normal'] || BRAIN.normal; return rnd(B.think[0], B.think[1]); };

// ---------------------------------------------------------------- saved data
const KEY = 'color-storm-';
CS.load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(KEY + k)); return v == null ? d : v; } catch (e) { return d; } };
CS.save = (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} };
const ST0 = { rounds: 0, rwins: 0, matches: 0, mwins: 0, cards: 0, best: 0, catches: 0, caught: 0, storms: 0, streak: 0, bestStreak: 0, hard: 0 };
CS.stats = Object.assign({}, ST0, CS.load('stats', {}));
CS.stat = (k, d) => { CS.stats[k] = (CS.stats[k] || 0) + (d == null ? 1 : d); CS.save('stats', CS.stats); };
CS.statMax = (k, v) => { if (v > (CS.stats[k] || 0)) { CS.stats[k] = v; CS.save('stats', CS.stats); } };
CS.resetStats = () => { CS.stats = Object.assign({}, ST0); CS.save('stats', CS.stats); };

// ---------------------------------------------------------------- sound (WebAudio synth)
const AU = CS.audio = { on: CS.load('sound', true), ctx: null };
function ac() {
  if (!AU.ctx) { try { AU.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AU.ctx.state === 'suspended') AU.ctx.resume();
  return AU.ctx;
}
let noiseBuf = null;
function noise(a) { if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; }
function tone(f, d, o) {
  const a = ac(); if (!a) return; o = o || {};
  const t0 = a.currentTime + (o.at || 0), g = a.createGain(), osc = a.createOscillator();
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  osc.connect(g); g.connect(a.destination); osc.start(t0); osc.stop(t0 + d + 0.05);
}
function hiss(d, o) {
  const a = ac(); if (!a) return; o = o || {};
  const t0 = a.currentTime + (o.at || 0), src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noise(a); f.type = o.ft || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + d); f.Q.value = o.q || 1;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.att || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  src.connect(f); f.connect(g); g.connect(a.destination); src.start(t0, Math.random() * 0.5); src.stop(t0 + d + 0.05);
}
const SFX = {
  flick() { hiss(0.09, { f: 3200, q: 0.8, vol: 0.22 }); tone(420, 0.06, { type: 'triangle', vol: 0.05, to: 260 }); },
  draw() { hiss(0.14, { f: 1400, f2: 3000, q: 0.7, vol: 0.12 }); },
  deal() { for (let i = 0; i < 7; i++) hiss(0.05, { f: 2600, q: 1, vol: 0.12, at: i * 0.07 }); },
  shuffle() { for (let i = 0; i < 12; i++) hiss(0.04, { f: 2000 + Math.random() * 2000, q: 1, vol: 0.09, at: i * 0.035 }); },
  skip() { [1568, 2093, 2637].forEach((f, i) => tone(f, 0.25, { type: 'sine', vol: 0.07, at: i * 0.05 })); hiss(0.3, { f: 6000, q: 2, vol: 0.05 }); },
  rev() { tone(300, 0.35, { type: 'triangle', to: 900, vol: 0.1 }); tone(900, 0.35, { type: 'triangle', to: 300, vol: 0.06, at: 0.15 }); },
  hit() { tone(150, 0.3, { type: 'sawtooth', to: 60, vol: 0.12 }); hiss(0.2, { f: 400, q: 0.6, vol: 0.15 }); },
  thunder() { hiss(1.2, { ft: 'lowpass', f: 900, f2: 120, q: 0.5, vol: 0.45, att: 0.02 }); tone(70, 0.8, { type: 'sawtooth', to: 35, vol: 0.12 }); },
  storm() { hiss(1.4, { f: 300, f2: 1800, q: 3, vol: 0.28, att: 0.3 }); hiss(1.2, { f: 1800, f2: 300, q: 3, vol: 0.18, att: 0.4, at: 0.3 }); },
  rain() { for (let i = 0; i < 16; i++) tone(1800 + Math.random() * 1600, 0.05, { type: 'sine', vol: 0.05, at: i * 0.04 + Math.random() * 0.03 }); },
  wild() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.08, at: i * 0.06 })); },
  call() { tone(1320, 0.5, { type: 'sine', vol: 0.12 }); tone(1980, 0.4, { type: 'sine', vol: 0.06, at: 0.02 }); },
  catch() { for (let i = 0; i < 3; i++) { tone(880, 0.12, { type: 'square', vol: 0.06, at: i * 0.24 }); tone(660, 0.12, { type: 'square', vol: 0.06, at: i * 0.24 + 0.12 }); } },
  turn() { tone(880, 0.12, { type: 'sine', vol: 0.08 }); tone(1175, 0.18, { type: 'sine', vol: 0.08, at: 0.09 }); },
  tick() { tone(1500, 0.03, { type: 'square', vol: 0.03 }); },
  bad() { tone(200, 0.15, { type: 'square', vol: 0.05 }); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.1, at: i * 0.1 })); },
  lose() { [440, 392, 330, 262].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.08, at: i * 0.13 })); },
  click() { tone(700, 0.04, { type: 'triangle', vol: 0.06 }); }
};
CS.sfx = (n) => { if (!AU.on) return; try { SFX[n] && SFX[n](); } catch (e) {} };
AU.set = (on) => { AU.on = on; CS.save('sound', on); };
})();
