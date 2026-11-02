'use strict';
// =====================================================================
// Color Storm — online for 2-6 players (Supabase Realtime broadcast, channel color-storm-<CODE>).
// The host's page runs the rules (CS.CT) and deals. After every change it sends each player a view
// addressed to that player's id that holds only THAT player's hand (E.view); every page ignores
// messages addressed to someone else. Players send their actions; bots fill empty seats if the host
// wants, and a player who drops out is played by a bot until they rejoin with the same id.
// If the host leaves, the next player in join order becomes host: they collect each player's own hand,
// re-deal the hands nobody can report (bots, the old host) and carry on.
// =====================================================================
(function () {
const CS = window.CS, E = CS.E, UI = CS.UI, CT = CS.CT, esc = CS.esc, sfx = CS.sfx, SCR = UI.SCR, ACT = UI.ACT;
const $ = (id) => document.getElementById(id);

addStrings({
  cs_oTitle: 'العب أونلاين', cs_create: 'اعمل أوضة', cs_codePh: 'كود الأوضة', cs_join: 'ادخل', cs_namePh1: 'اسمك', cs_or: 'أو',
  cs_room: 'الأوضة', cs_copy: 'انسخ لينك الدعوة', cs_copied: 'اتنسخ!', cs_host: 'صاحب الأوضة', cs_waitHost: 'مستني صاحب الأوضة…', cs_waitMore: 'مستني لاعيبة تانيين…',
  cs_fill: 'كمّل الكراسي الفاضية ببوتات', cs_fillD: 'البوتات بتلعب في الكراسي اللي محدش قاعد عليها.', cs_seats: 'عدد الكراسي', cs_need2: 'لازم لاعبين على الأقل (أو شغّل البوتات).',
  cs_leave: 'اخرج من الأوضة', cs_full: 'الأوضة مليانة (6 لاعيبة).', cs_joined: '{p} دخل الأوضة', cs_leftBot: '{p} خرج — بوت هيلعب مكانه لحد ما يرجع', cs_left: '{p} خرج',
  cs_back2: '{p} رجع! 👋', cs_newHost: '{p} بقى صاحب الأوضة 👑', cs_spect: 'الجولة شغالة — هتلعب من الجولة الجاية 👀', cs_alone: 'كل اللاعيبة التانيين خرجوا',
  cs_aloneD: 'تقدر تكمّل مع البوتات (ولو حد رجع ياخد مكانه)، أو ترجع للأوضة.', cs_keep: 'كمّل مع البوتات', cs_toRoom: 'ارجع للأوضة', cs_noNet: 'مفيش اتصال بالنت',
  cs_codeHint: 'اكتب كود من 4 حروف', cs_connecting: 'بيتوصل…', cs_auto: 'الجولة الجاية هتبدأ لوحدها بعد {n} ث', cs_emptyBot: 'كرسي فاضي · بوت', cs_emptySeat: 'كرسي فاضي',
  cs_onlineNote: 'الماتش أونلاين ومش هيقف — دورك هيعدّي لو الوقت خلص.', cs_viewRules: 'القواعد', cs_startMatch: 'ابدأ الماتش', cs_recover: 'بنكمّل الجولة مع صاحب الأوضة الجديد…',
  cs_inRoom: 'في الأوضة: {n}', cs_spectS: 'بيتفرّج'
}, {
  cs_oTitle: 'Play online', cs_create: 'Create room', cs_codePh: 'Room code', cs_join: 'Join', cs_namePh1: 'Your name', cs_or: 'or',
  cs_room: 'Room', cs_copy: 'Copy invite link', cs_copied: 'Copied!', cs_host: 'Host', cs_waitHost: 'Waiting for the host…', cs_waitMore: 'Waiting for more players…',
  cs_fill: 'Fill empty seats with bots', cs_fillD: 'Bots play the seats nobody is sitting in.', cs_seats: 'Seats', cs_need2: 'You need at least 2 players (or turn on bots).',
  cs_leave: 'Leave room', cs_full: 'That room is full (6 players).', cs_joined: '{p} joined the room', cs_leftBot: '{p} left — a bot plays for them until they come back', cs_left: '{p} left',
  cs_back2: '{p} is back! 👋', cs_newHost: '{p} is the host now 👑', cs_spect: 'A round is on — you play from the next round 👀', cs_alone: 'Everyone else left',
  cs_aloneD: 'Keep playing with bots (anyone who comes back takes their seat again), or go back to the room.', cs_keep: 'Keep playing with bots', cs_toRoom: 'Back to room', cs_noNet: 'No connection',
  cs_codeHint: 'Enter a 4-letter code', cs_connecting: 'Connecting…', cs_auto: 'Next round starts by itself in {n}s', cs_emptyBot: 'Empty seat · bot', cs_emptySeat: 'Empty seat',
  cs_onlineNote: "The online match doesn't stop — your turn passes if the time runs out.", cs_viewRules: 'Rules', cs_startMatch: 'Start match', cs_recover: 'Carrying on with the new host…',
  cs_inRoom: 'In the room: {n}', cs_spectS: 'Watching'
});

const PREFIX = 'color-storm', MAXP = 6, GONE = 9000, AUTO = 15000;
const ON = CS.ON = {
  ch: null, code: '', ready: false, me: '', jt: 0, peers: new Map(), hostAnn: '', settle: 0, host: false, client: false, playing: false, lastHost: '',
  lob: { list: [], fill: true, size: 4, brain: 'normal', rules: Object.assign({}, CS.DEF_RULES, (CS.cfg && CS.cfg.rules) || {}, { timer: (CS.cfg && CS.cfg.rules && CS.cfg.rules.timer) || 20 }) },
  lastV: null, lastQ: -1, seq: 0, mine: null, recovering: false, autoAt: 0, aloneShown: false, spectToast: false, lastSent: 0
};
const authName = () => { try { return (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { return ''; } };
const myName = () => authName() || CS.load('name', '') || t('cs_you');
const newCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
const pageLink = () => location.href.split('?')[0].split('#')[0];
const inviteLink = (c) => pageLink() + '?room=' + c;
const ss = { get(k) { try { return sessionStorage.getItem(PREFIX + '-' + k + '-' + ON.code) || ''; } catch (e) { return ''; } }, set(k, v) { try { sessionStorage.setItem(PREFIX + '-' + k + '-' + ON.code, v); } catch (e) {} } };
const byJoin = (a, b) => (a.jt - b.jt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const everyone = () => [{ id: ON.me, n: myName(), jt: ON.jt }, ...ON.peers.values()];
const present = (id) => id === ON.me || ON.peers.has(id);
const nameOfId = (id) => (id === ON.me ? myName() : (ON.peers.get(id) || {}).n || ((ON.lob.list.find((x) => x[0] === id) || [])[1]) || '…');
function send(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me, jt: ON.jt, n: myName(), hs: ON.host ? 1 : 0 }, p || {}) }); } catch (e) {} }
ON.send = send;

// ---------------------------------------------------------------- host election
function hostId() {
  if (ON.hostAnn && present(ON.hostAnn)) return ON.hostAnn;
  if (Date.now() < ON.settle) return '';
  return everyone().sort(byJoin)[0].id;
}
const amHost = () => hostId() === ON.me;
function checkHost(prefix) {
  const h = hostId(); if (!h) return false;
  let told = false;
  if (h !== ON.lastHost) {
    const was = ON.lastHost; ON.lastHost = h; ON.hostAnn = h;
    if (was) { UI.toast((prefix ? prefix + ' · ' : '') + t('cs_newHost', { p: nameOfId(h) })); told = true; }
  }
  if (h === ON.me && !ON.host) becomeHost();
  else if (h !== ON.me && ON.host) { ON.host = false; if (CT.net) { CT.stop(); } }
  refreshLobby();
  return told;
}
function becomeHost() {
  ON.host = true; ON.hostAnn = ON.me; ON.lastHost = ON.me; ON.seq = Math.max(ON.seq, ON.lastQ) + 10;
  if (ON.client && ON.lastV) {   // a match is on: take it over
    ON.recovering = true; ON.mine = new Map(); UI.toast(t('cs_recover'));
    send('rec', {});
    setTimeout(finishRecover, 1700);
  } else { ON.client = false; seatLobby(); sendLob(); }
}
function finishRecover() {
  if (!ON.recovering || !ON.host) return; ON.recovering = false;
  const v = ON.lastV; if (!v) { toLobby(); return; }
  const seats = v.s.map((p) => ({ id: p.id, name: p.n, kind: p.b ? 'bot' : 'human', brain: p.br || 'normal', score: p.sc, called: !!p.ca, away: false, hand: [] }));
  const G = E.newMatch(seats, v.ru); G.online = true;
  G.round = v.r; G.dealer = v.de == null ? 0 : v.de; G.color = v.c; G.dir = v.dir; G.turn = v.t; G.pending = v.pe; G.pendT = v.pt; G.phase = v.ph; G.last = v.last; G.turnAt = Date.now();
  G.disc = v.d.slice();
  const used = new Set(G.disc), okHand = (h, n) => Array.isArray(h) && h.length === n && h.every((id) => Number.isInteger(id) && CS.DECK[id] && !used.has(id)) && new Set(h).size === h.length;
  const need = [];
  G.seats.forEach((p, i) => {
    let h = null;
    if (p.id === ON.me) h = v.h.slice(); else if (p.kind === 'human' && ON.mine.has(p.id)) h = ON.mine.get(p.id);
    if (h && okHand(h, v.s[i].c)) { p.hand = h; h.forEach((id) => used.add(id)); } else need.push(i);
    if (p.kind === 'human' && !present(p.id)) p.away = true;
  });
  const pool = CS.shuffle(CS.DECK.filter((d) => (v.ru.tw || !CS.TWIST.has(d.v)) && !used.has(d.id)).map((d) => d.id));
  for (const i of need) for (let k = 0; k < v.s[i].c && pool.length; k++) G.seats[i].hand.push(pool.pop());
  G.draw = pool;
  const me = G.seats.findIndex((p) => p.id === ON.me);
  CT.G = G; CT.kind = 'online'; CT.viewSeat = me; CT.net = HOSTNET; CT.paused = false; CT.plans = {}; CT.busyUntil = Date.now() + 600;
  ON.client = false; ON.playing = true; UI.mode = 'online';
  CT.flush();
  if (G.phase !== 'play') { ON.autoAt = Date.now() + AUTO; UI.show(G.phase === 'match' ? 'match' : 'round'); }
  checkAlone();
}

// ---------------------------------------------------------------- lobby (host keeps the seat list)
function seatLobby() {
  if (!ON.host || ON.playing) return;
  const here = everyone().sort(byJoin), list = ON.lob.list.filter((x) => present(x[0]));
  for (const p of here) {
    if (list.some((x) => x[0] === p.id)) continue;
    if (list.length >= MAXP) { send('full', { to: p.id }); continue; }
    list.push([p.id, p.n]);
  }
  list.forEach((x) => { x[1] = nameOfId(x[0]); });
  ON.lob.list = list;
}
const sendLob = () => { if (ON.host) send('lob', { lob: ON.lob, pl: ON.playing ? 1 : 0 }); };
function lobbyScreen() {
  const host = ON.host, hid = hostId(), L = ON.lob, list = L.list.length ? L.list : [[ON.me, myName()]];
  let rows = list.map(([id, n], i) => `<div class="pl" style="--pc:${CS.SEATC[i % 6]}"><div class="av">${esc((Array.from(n || '?')[0] || '?').toUpperCase())}</div><div class="grow"><b>${esc(id === ON.me ? myName() : n)}</b><small>${esc([id === ON.me ? t('cs_you') : '', id === hid ? t('cs_host') : ''].filter(Boolean).join(' · '))}</small></div>${id === hid ? '<span>👑</span>' : ''}</div>`).join('');
  const total = L.fill ? Math.max(L.size, list.length) : list.length;
  for (let i = list.length; i < Math.max(total, 2); i++) rows += `<div class="pl" style="--pc:${CS.SEATC[i % 6]};opacity:.65"><div class="av">${L.fill ? '🤖' : '·'}</div><div class="grow"><small>${esc(L.fill ? t('cs_emptyBot') : t('cs_emptySeat'))}</small></div></div>`;
  const can = list.length + (L.fill ? Math.max(0, L.size - list.length) : 0) >= 2;
  const ctl = host ? `<div class="opt"><div><b>${esc(t('cs_fill'))}</b><small>${esc(t('cs_fillD'))}</small></div><button class="sw2${L.fill ? ' on' : ''}" data-act="oFill"></button></div>
    ${L.fill ? `<div class="lbl">${esc(t('cs_seats'))}</div>${UI.seg('oSize', [2, 3, 4, 5, 6], L.size)}<div class="lbl">${esc(t('cs_brain'))}</div>${UI.seg('oBrain', ['easy', 'normal', 'hard'], L.brain, (v) => t('cs_' + v))}` : ''}` : '';
  return `<div class="panel" data-m3pop><h2>🌐 ${esc(t('cs_oTitle'))}</h2>
    <div class="roomcode"><span>${esc(t('cs_room'))}</span><b>${esc(ON.code)}</b><span class="grow"></span><button class="btn small" data-act="oCopy">🔗 ${esc(t('cs_copy'))}</button></div>
    <div class="plist">${rows}</div>${ctl}
    <p class="muted" style="font-size:13px">${esc(UI.rulesSummary(L.rules))} · ⏱ ${esc(L.rules.timer ? t('cs_sec', { n: L.rules.timer }) : t('cs_none'))}</p>
    ${!ON.ready ? `<p class="muted center">${esc(t('cs_connecting'))}</p>` : host ? (can ? '' : `<p class="muted center">${esc(t('cs_need2'))}</p>`) : `<p class="muted center">${esc(t('cs_waitHost'))}</p>`}
    <div class="row"><button class="btn sec small" data-act="oRules">⚙ ${esc(host ? t('cs_rules') : t('cs_viewRules'))}</button><span class="grow"></span>
      <button class="btn sec small" data-act="oLeave">${esc(t('cs_leave'))}</button>${host ? `<button class="btn" data-act="oStart" ${can && ON.ready ? '' : 'disabled'}>▶ ${esc(t('cs_startMatch'))}</button>` : ''}</div></div>`;
}
SCR.lobby = lobbyScreen;
SCR.online = () => {
  const nm = authName();
  return `<div class="panel" data-m3pop><h2>🌐 ${esc(t('cs_oTitle'))}</h2>
    ${nm ? `<p class="muted">👤 ${esc(nm)}</p>` : `<div class="lbl">${esc(t('cs_namePh1'))}</div><input class="tx" id="csMyName" maxlength="16" value="${esc(CS.load('name', ''))}" placeholder="${esc(t('cs_namePh1'))}" autocomplete="off" spellcheck="false">`}
    <button class="btn" data-act="oCreate" style="padding:13px">✨ ${esc(t('cs_create'))}</button>
    <p class="muted center">${esc(t('cs_or'))}</p>
    <div class="row" style="flex-wrap:nowrap"><input class="tx code" id="csCode" maxlength="5" placeholder="${esc(t('cs_codePh'))}" autocomplete="off" spellcheck="false"><button class="btn" data-act="oJoin">${esc(t('cs_join'))}</button></div>
    <p class="muted center" id="csMsg"></p>
    <div class="row center"><button class="btn sec" data-act="menu">${esc(t('cs_back'))}</button></div></div>`;
};
SCR.alone = () => `<div class="panel" data-m3pop><h2>🚪 ${esc(t('cs_alone'))}</h2><p>${esc(t('cs_aloneD'))}</p>
  <div class="menuBtns"><button class="btn" data-act="oKeep">▶ ${esc(t('cs_keep'))}</button><button class="btn sec" data-act="oRoom">${esc(t('cs_toRoom'))}</button></div></div>`;
// match screen: the host can also take everyone back to the room
const baseMatch = SCR.match;
SCR.match = () => { let h = baseMatch(); if (UI.mode === 'online' && ON.host) h = h.replace('<button class="btn sec" data-act="quit">', `<button class="btn sec" data-act="oRoom">${esc(t('cs_toRoom'))}</button><button class="btn sec" data-act="quit">`); return h; };
function refreshLobby() { if (UI.cur && UI.cur.name === 'lobby') UI.show('lobby'); }
function toLobby() {
  if (ON.host && CT.G) CT.stop();
  ON.playing = false; ON.client = false; ON.lastV = null; ON.recovering = false; ON.aloneShown = false;
  UI.mode = 'menu'; UI.V = null; UI.renderAll();
  if (ON.host) { seatLobby(); sendLob(); }
  UI.show('lobby');
}
ON.toLobby = toLobby;
document.addEventListener('input', (e) => { if (e.target.id === 'csCode') e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
document.addEventListener('keydown', (e) => { if (e.target.id === 'csCode' && e.key === 'Enter') ACT.oJoin(); });

Object.assign(ACT, {
  goOnline() { UI.show('online'); },
  async oCreate() { UI.readName(); if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return; join(newCode(), true); },
  async oJoin() {
    UI.readName(); const i = $('csCode'), code = (i ? i.value : '').trim().toUpperCase();
    if (code.length < 4) { const m = $('csMsg'); if (m) m.textContent = t('cs_codeHint'); return; }
    if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return; join(code, false);
  },
  oCopy() { const b = document.querySelector('[data-act="oCopy"]'), done = () => { if (b) { b.textContent = '✓ ' + t('cs_copied'); setTimeout(refreshLobby, 1400); } }; try { navigator.clipboard.writeText(inviteLink(ON.code)).then(done, done); } catch (e) { done(); } },
  oFill() { if (!ON.host) return; ON.lob.fill = !ON.lob.fill; sendLob(); refreshLobby(); },
  oSize(n) { if (!ON.host) return; ON.lob.size = +n; sendLob(); refreshLobby(); },
  oBrain(b) { if (!ON.host) return; ON.lob.brain = b; sendLob(); refreshLobby(); },
  oRules() {
    UI.rulesTarget = { get: () => ON.lob.rules, set: (r) => { if (!ON.host) return; ON.lob.rules = r; CS.cfg.rules = Object.assign({}, r); CS.saveCfg(); sendLob(); }, readOnly: !ON.host };
    UI.show('rules', 'lobby');
  },
  oStart() { if (ON.host) startMatch(); },
  oLeave() { leave(); UI.toMenu(); },
  oRoom() { if (ON.host) { send('lobby', {}); } toLobby(); },
  oKeep() { ON.aloneShown = true; UI.hide(); }
});

// ---------------------------------------------------------------- the match (host side)
const HOSTNET = {
  onFlush(evs) { ON.seq++; sendViews(evs); },
  onRoundEnd() { ON.autoAt = Date.now() + AUTO; }
};
function sendViews(evs) {
  const G = CT.G; if (!G || !ON.host) return;
  const q = ON.seq; ON.lastSent = Date.now();
  G.seats.forEach((p, i) => { if (p.kind === 'human' && p.id !== ON.me && !p.away && present(p.id)) send('st', { to: p.id, v: E.view(G, i), ev: evs ? E.viewEvents(evs, i) : [], q }); });
  for (const p of ON.peers.values()) if (!G.seats.some((s) => s.id === p.id)) send('st', { to: p.id, v: E.view(G, -1), ev: evs ? E.viewEvents(evs, -1) : [], q });
}
function startMatch() {
  seatLobby();
  const L = ON.lob, seats = L.list.slice(0, MAXP).map(([id, n]) => ({ id, name: n, kind: 'human' }));
  if (L.fill) { const bn = CS.botNames(8); let k = 0; while (seats.length < Math.max(2, L.size)) seats.push({ id: 'bot-' + k, name: '#bot:' + bn[k++], kind: 'bot', brain: L.brain }); }
  if (seats.length < 2) { UI.toast(t('cs_need2')); return; }
  const me = seats.findIndex((s) => s.id === ON.me);
  ON.playing = true; ON.client = false; ON.aloneShown = false; ON.seq = Math.max(ON.seq, ON.lastQ) + 1;
  CT.net = HOSTNET;
  CT.start('online', seats, L.rules, me);
  sendLob();
}
function seatNewcomers() {   // before a new round: people who were watching get a seat (an empty one, or a bot's)
  const G = CT.G; if (!G) return;
  for (const p of everyone().sort(byJoin)) {
    if (G.seats.some((s) => s.id === p.id)) continue;
    if (G.seats.length < MAXP) G.seats.push({ id: p.id, name: p.n, kind: 'human', brain: 'normal', score: 0, hand: [], called: false, away: false });
    else { const b = G.seats.find((s) => s.kind === 'bot'); if (b) Object.assign(b, { id: p.id, name: p.n, kind: 'human', score: 0, away: false }); }
  }
}
ON.nextRound = () => { if (!ON.host || !CT.G) return; UI.hide(); seatNewcomers(); CT.newRound(); };
ON.newMatch = () => { if (!ON.host || !CT.G) return; UI.hide(); seatNewcomers(); CT.newMatch(); };
function humansHere() { const G = CT.G; return G ? G.seats.filter((p) => p.kind === 'human' && p.id !== ON.me && present(p.id) && !p.away).length : 0; }
function checkAlone() {
  if (!ON.host || !CT.G || ON.aloneShown) return;
  if (!humansHere() && !ON.peers.size) { ON.aloneShown = true; if (!UI.cur || !['round', 'match'].includes(UI.cur.name)) UI.show('alone'); }
}
function hostAct(p) {
  const G = CT.G; if (!G || !ON.host || !p.a) return;
  const seat = G.seats.findIndex((s) => s.id === p.id); if (seat < 0) return;
  const s = G.seats[seat]; if (s.away) { s.away = false; }
  const a = { a: String(p.a.a || ''), id: p.a.id | 0, color: p.a.color, target: p.a.target == null ? undefined : p.a.target | 0, p: p.a.p | 0 };
  if (!CT.apply(seat, a)) sendViews(null);   // refused: resend the truth
}

// ---------------------------------------------------------------- client side
ON.sendAct = (a) => { send('act', { a }); };
function onState(p) {
  if (p.to !== ON.me || ON.host) return;
  if (p.id !== hostId() && !p.hs) return;
  const v = p.v; if (!v || !Array.isArray(v.s)) return;
  const fresh = p.q > ON.lastQ, sig = JSON.stringify(Object.assign({}, v, { dl: 0 }));
  if (!fresh && sig === ON.lastSig) return;
  ON.lastQ = Math.max(ON.lastQ, p.q); ON.lastSig = sig;
  const entering = !ON.client;
  ON.client = true; ON.playing = true; UI.mode = 'online'; ON.lastV = v;
  if (entering && UI.cur && ['lobby', 'online', 'menu', 'rules'].includes(UI.cur.name)) UI.hide();
  const evs = fresh ? (p.ev || []) : [];
  const dur = UI.present(v, evs);
  if (v.me < 0 && !ON.spectToast) { ON.spectToast = true; UI.toast(t('cs_spect')); }
  if (v.me >= 0) ON.spectToast = false;
  const ended = evs.some((e) => e.k === 'round');
  if (ended) { ON.autoAt = Date.now() + AUTO - 500; setTimeout(() => { if (UI.V === v || (UI.V && UI.V.ph !== 'play')) UI.show(UI.V.ph === 'match' ? 'match' : 'round'); }, dur + 900); }
  else if (v.ph !== 'play' && (!UI.cur || !['round', 'match', 'pause', 'scores', 'how'].includes(UI.cur.name)) && entering) UI.show(v.ph === 'match' ? 'match' : 'round');
  else if (v.ph === 'play' && UI.cur && ['round', 'match'].includes(UI.cur.name)) UI.hide();
}

// ---------------------------------------------------------------- room
const EVENTS = ['hello', 'hb', 'bye', 'full', 'lob', 'st', 'act', 'lobby', 'rec', 'mine'];
function join(code, create) {
  leave(true);
  if (!window.sb) { UI.toast(t('cs_noNet')); return false; }
  code = String(code || '').trim().toUpperCase().slice(0, 6); if (!code) return false;
  ON.code = code;
  let id = ss.get('id'); if (!id) { id = Math.random().toString(36).slice(2, 10); ss.set('id', id); }
  let jt = +ss.get('jt'); if (!jt) { jt = Date.now(); ss.set('jt', String(jt)); }   // a reload keeps the join order
  ON.me = id; ON.jt = jt; ON.ready = false; ON.peers = new Map(); ON.host = false; ON.client = false; ON.playing = false; ON.lastV = null; ON.lastQ = -1; ON.lastSig = '';
  ON.hostAnn = create ? id : ''; ON.lastHost = create ? id : ''; ON.settle = create ? 0 : Date.now() + 2600; ON.lob.list = [[id, myName()]];
  if (create) { ON.host = true; ON.lob.rules = Object.assign({}, CS.DEF_RULES, CS.cfg.rules, { timer: CS.cfg.rules.timer || 20 }); }
  const ch = sb.channel(PREFIX + '-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => {
    if (ON.ch !== ch) return;
    if (st === 'SUBSCRIBED') { ON.ready = true; if (!create) ON.settle = Date.now() + 2200; hello(true); if (ON.host) sendLob(); refreshLobby(); }
    else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') UI.toast(t('cs_noNet'));
  });
  ON.ch = ch;
  try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
  window.Mal3abShareLink = () => inviteLink(code);
  clearInterval(ON.hb); ON.hb = setInterval(beat, 2000);
  UI.mode = 'menu'; UI.V = null; UI.renderAll(); UI.show('lobby');
  return true;
}
function leave(quiet) {
  if (ON.ch) { send('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 200); }
  clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.peers = new Map(); ON.host = false; ON.client = false; ON.playing = false; ON.lastV = null; ON.hostAnn = ''; ON.lastHost = '';
  if (CT.net) CT.stop();
  window.Mal3abShareLink = () => pageLink();
  if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
}
ON.leave = leave;
const ph = () => (ON.playing ? (UI.V && UI.V.me < 0 ? 'spect' : 'play') : 'lobby');
function hello(req) { send('hello', { req: req ? 1 : 0, ph: ph() }); }
function beat() {
  if (!ON.ch) return;
  send('hb', { ph: ph() });
  const now = Date.now();
  for (const P of [...ON.peers.values()]) if (now - P.t > GONE) gone(P.id);
  checkHost();
  if (ON.host) {
    if (!ON.playing) { seatLobby(); sendLob(); refreshLobby(); }
    else if (CT.G) { if (now - ON.lastSent > 2400) sendViews(null); sendLob(); }
  }
}
function onNet(ev, p) {
  if (!p || !p.id || p.id === ON.me) return;
  const now = Date.now();
  if (ev === 'full') { if (p.to === ON.me) { leave(); UI.toMenu(); UI.show('online'); UI.toast(t('cs_full')); } return; }
  if (ev === 'bye') { if (ON.peers.has(p.id)) gone(p.id); return; }
  let P = ON.peers.get(p.id), isNew = false;
  if (!P) {
    // a 7th person: the room is full (seat holders who come back always fit)
    if (ON.host && ON.peers.size + 1 >= MAXP && !(CT.G && CT.G.seats.some((s) => s.id === p.id && s.kind === 'human'))) { send('full', { to: p.id }); return; }
    P = { id: p.id, n: '…', jt: p.jt || now, t: now, ph: 'lobby' }; ON.peers.set(p.id, P); isNew = true;
  }
  P.t = now; if (p.n) P.n = String(p.n).slice(0, 20); if (p.jt) P.jt = p.jt; if (p.ph) P.ph = p.ph;
  if (p.hs && ON.hostAnn !== p.id) {
    if (ON.host) { if (byJoin(P, { id: ON.me, jt: ON.jt }) < 0) { ON.host = false; ON.hostAnn = p.id; ON.lastHost = p.id; if (CT.net) CT.stop(); } }   // two hosts: the earlier one wins
    else { ON.hostAnn = p.id; }
  }
  if (isNew) onArrive(P);
  switch (ev) {
    case 'hello': if (p.req) hello(false); if (ON.host) { if (!ON.playing) { seatLobby(); sendLob(); } } checkHost(); refreshLobby(); break;
    case 'hb': checkHost(); break;
    case 'lob':
      if (p.id !== hostId() || ON.host || !p.lob) break;
      ON.lob = Object.assign(ON.lob, p.lob); ON.lob.rules = Object.assign({}, CS.DEF_RULES, p.lob.rules || {});
      if (!p.pl && ON.playing && ON.client && !ON.recovering) { /* host went back to the room */ }
      refreshLobby(); break;
    case 'st': onState(p); break;
    case 'act': if (ON.host && ON.playing) hostAct(p); break;
    case 'lobby': if (!ON.host && p.id === hostId()) toLobby(); break;
    case 'rec': if (!ON.host) send('mine', { to: p.id, h: ON.lastV ? ON.lastV.h : [], q: ON.lastQ }); break;
    case 'mine': if (ON.host && ON.recovering && p.to === ON.me && Array.isArray(p.h)) ON.mine.set(p.id, p.h.map((x) => x | 0)); break;
  }
}
function onArrive(P) {
  if (!ON.host) return;
  const G = CT.G;
  if (ON.playing && G) {
    const seat = G.seats.find((s) => s.id === P.id && s.kind === 'human');
    if (seat) { if (seat.away) { seat.away = false; UI.toast(t('cs_back2', { p: P.n })); sfx('call'); } seat.name = P.n !== '…' ? P.n : seat.name; ON.aloneShown = false; if (UI.cur && UI.cur.name === 'alone') UI.hide(); }
    else UI.toast(t('cs_joined', { p: P.n }));
    setTimeout(() => sendViews(null), 50);
  } else { setTimeout(() => { seatLobby(); sendLob(); refreshLobby(); }, 50); UI.toast(t('cs_joined', { p: P.n })); }
}
function gone(id) {
  const P = ON.peers.get(id); if (!P) return; ON.peers.delete(id);
  let msg = t('cs_left', { p: P.n });
  if (ON.host && CT.G) {
    const s = CT.G.seats.find((x) => x.id === id && x.kind === 'human');
    if (s && CT.G.phase !== 'idle') { s.away = true; msg = t('cs_leftBot', { p: P.n }); CT.busyUntil = Math.min(CT.busyUntil, Date.now() + 300); sendViews(null); UI.present(E.view(CT.G, CT.viewSeat), []); }
  } else if (ON.client && UI.V) {
    const s = UI.V.s.find((x) => x.id === id && !x.b); if (s) msg = t('cs_leftBot', { p: P.n });
  }
  if (!checkHost(msg)) UI.toast(msg);
  if (ON.host && !ON.playing) { seatLobby(); sendLob(); refreshLobby(); }
  checkAlone();
}

// auto next round online + its countdown
setInterval(() => {
  if (!ON.code || !ON.playing) return;
  const left = Math.ceil((ON.autoAt - Date.now()) / 1000), el = $('csAuto');
  const ph2 = ON.host ? (CT.G && CT.G.phase) : (UI.V && UI.V.ph);
  if (el) el.textContent = ph2 === 'round' && left > 0 ? t('cs_auto', { n: left }) : '';
  if (ON.host && CT.G && CT.G.phase === 'round' && ON.autoAt && Date.now() >= ON.autoAt) { ON.autoAt = 0; ON.nextRound(); }
}, 500);

// ---------------------------------------------------------------- site hooks
window.Mal3abShareLink = () => (ON.code ? inviteLink(ON.code) : pageLink());
window.Mal3abPrepareInvite = async () => {
  if (!ON.code) { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return pageLink(); join(newCode(), true); }
  return inviteLink(ON.code);
};
window.Mal3abLiveInfo = () => (ON.code ? { players: 1 + ON.peers.size, max: MAXP, hidden: false, out: !!(UI.V && UI.V.me < 0) } : {});
addEventListener('pagehide', () => { if (ON.ch) send('bye', {}); });
// ?room=CODE joins straight away
(function autoJoin() {
  const m = /[?&]room=([A-Za-z0-9]{4,6})/.exec(location.search); if (!m) return;
  let done = false;
  const go = async () => { if (done) return; done = true; if (window.Mal3abVersion && !(await Mal3abVersion.ok())) { UI.show('menu'); return; } join(m[1].toUpperCase(), false); };
  if (window.Mal3abReady) setTimeout(go, 0); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
})();
window.ColorStorm.ON = ON;
})();
