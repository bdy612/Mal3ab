'use strict';
// =====================================================================
// Deck of Dungeons — online 2-player mode: Dungeon Keeper vs Heroes (Supabase Realtime broadcast)
// The Keeper's page runs the whole simulation and streams it ~12×/s; the Heroes' page mirrors it
// and sends its choices (who goes in next, the route flag, party abilities).
// =====================================================================
(function () {
const DD = window.__DD, A = DD.art, G = DD.game, S = G.S, U = DD.ui, AU = DD.audio;
const $ = (id) => document.getElementById(id);
const esc = U.esc, gi = U.gi, sfx = (n) => AU.play(n);
const WPA = DD.WAVES_PER_ACT, MW = G.MW;

addStrings({
  dd_online: 'أونلاين (لاعبين)', dd_oTitle: 'العب أونلاين', dd_keeper: 'سيد الزنزانة', dd_heroesRole: 'الأبطال',
  dd_keeperDesc: 'بتلعب الكروت وبتحط الفخاخ والأبراج والوحوش.', dd_heroesDesc: 'بتقود الأبطال: تختار مين يدخل، والطريق، وإمتى تعالج أو تهجم أو تنسحب.',
  dd_createAs: 'اعمل أوضة', dd_codePh: 'كود الأوضة', dd_join: 'ادخل', dd_codeHint: 'اكتب كود من 4 حروف على الأقل.', dd_oNamePh: 'اسمك',
  dd_room: 'الأوضة', dd_copyLink: 'انسخ لينك الدعوة', dd_copied: 'اتنسخ!', dd_you: 'إنت', dd_partner: 'صاحبك', dd_host: 'صاحب الأوضة',
  dd_waitPartner: 'مستني لاعب تاني يدخل…', dd_connecting: 'بيتوصل…', dd_swap: 'بدّلوا الأدوار', dd_startMatch: 'ابدأ الماتش',
  dd_needPartner: 'لازم لاعب تاني يدخل الأول.', dd_waitHost: 'مستني صاحب الأوضة يبدأ…', dd_leave: 'اخرج من الأوضة', dd_pickAct: 'الزنزانة',
  dd_goalKt: 'سيد الزنزانة بيكسب', dd_goalK: 'لو صمد الـ 5 موجات.', dd_goalHt: 'الأبطال بيكسبوا', dd_goalH: 'لو هربوا بـ {n} كنز أو فضّوا الخزنة.',
  dd_full: 'الأوضة دي مليانة.', dd_noNet: 'مفيش اتصال بالنت.', dd_joinedP: '{p} دخل الأوضة', dd_leftP: '{p} خرج',
  dd_partnerLost: 'صاحبك خرج', dd_partnerLostK: 'تقدر تكمّل لوحدك والأبطال هيمشوا لوحدهم، أو ترجع للقايمة.', dd_partnerLostH: 'سيد الزنزانة خرج من الماتش.',
  dd_continueSolo: 'كمّل لوحدك', dd_toRoom: 'ارجع للأوضة', dd_rematch: 'ماتش تاني', dd_waitKeeper: 'مستني سيد الزنزانة…',
  dd_kWin: 'سيد الزنزانة كسب!', dd_hWin: 'الأبطال كسبوا!', dd_youWin: 'إنت كسبت!', dd_youLose: 'إنت خسرت المرة دي.',
  dd_whyHeld: 'الزنزانة صمدت الـ 5 موجات.', dd_whyLoot: 'الأبطال هربوا بـ {n} كنز.', dd_whyVault: 'الخزنة فضيت خالص.',
  dd_sWaves: 'موجات خلصت', dd_sRetreat: 'أبطال انسحبوا', dd_oPlayer: 'لاعب', dd_pausedBy: 'وقّفها {p}', dd_leaveMatch: 'اخرج من الماتش',
  dd_oSend: 'ابعت:', dd_oHeal: 'علاج', dd_oScorch: 'حرق', dd_oCharge: 'هجوم', dd_oBoss: 'قوة الزعيم', dd_oRetreat: 'انسحاب',
  dd_oHealD: 'الكهنة بيعالجوا الأبطال اللي حواليهم 30%.', dd_oScorchD: 'السحرة بيحرقوا أقرب فخ أو برج ويعطّلوه شوية.',
  dd_oChargeD: 'كل الأبطال بيجروا بسرعة ويعدّوا من الفخاخ والوحوش لثانية ونص.', dd_oBossD: 'الزعيم بيستخدم قدرته الخاصة.',
  dd_oRetreatD: 'الأبطال اللي مش شايلين كنز بيرجعوا للمدخل، فسيد الزنزانة مياخدش فلوسهم.',
  dd_oNoCleric: 'مفيش كاهن جاهز.', dd_oNoMage: 'مفيش ساحر جاهز.', dd_oNoTarget: 'مفيش حاجة قريبة من السحرة.', dd_oNoBoss: 'الزعيم مش موجود.',
  dd_oNoHeroes: 'مفيش أبطال جوه.', dd_oCooldown: 'لسه بتشحن.',
  dd_oBuildH: 'سيد الزنزانة بيبني. دوس على أرضية فاضية عشان تحط علم الطريق.', dd_oFlagSet: 'الأبطال هيعدّوا على العلم الأزرق. دوس عليه تاني عشان تشيله.',
  dd_oWaveH: 'دوس على بطل تحت عشان تبعته.', dd_oAuto: 'اللي عليه الدور هيدخل لوحده بعد {n} ث', dd_oPicking: 'الموجة خلصت. سيد الزنزانة بيختار كارت…',
  dd_oStolen: 'الأبطال هربوا بـ {n} من {m}', dd_oFlagGone: 'العلم اتشال: الطريق ده اتقفل.', dd_oBuildK: 'صاحبك بيقود الأبطال وبيختار طريقهم. احمي كل الطرق!',
  dd_oYouKeeper: 'إنت سيد الزنزانة', dd_oYouHeroes: 'إنت قائد الأبطال', dd_oAllIn: 'كل الأبطال دخلوا.', dd_oSolo: 'الأبطال بيلعبهم الكمبيوتر دلوقتي.'
}, {
  dd_online: 'Online (2 Players)', dd_oTitle: 'Play Online', dd_keeper: 'Dungeon Keeper', dd_heroesRole: 'Heroes',
  dd_keeperDesc: 'Play the cards and place traps, towers and monsters.', dd_heroesDesc: 'Lead the heroes: pick who goes in, the route, and when to heal, charge or retreat.',
  dd_createAs: 'Create Room', dd_codePh: 'Room Code', dd_join: 'Join', dd_codeHint: 'Enter a code of at least 4 letters.', dd_oNamePh: 'Your Name',
  dd_room: 'Room', dd_copyLink: 'Copy Invite Link', dd_copied: 'Copied!', dd_you: 'You', dd_partner: 'Partner', dd_host: 'Host',
  dd_waitPartner: 'Waiting For A Second Player…', dd_connecting: 'Connecting…', dd_swap: 'Swap Roles', dd_startMatch: 'Start Match',
  dd_needPartner: 'A second player needs to join first.', dd_waitHost: 'Waiting for the host to start…', dd_leave: 'Leave Room', dd_pickAct: 'Dungeon',
  dd_goalKt: 'The Keeper Wins', dd_goalK: 'by holding out for all 5 waves.', dd_goalHt: 'The Heroes Win', dd_goalH: 'by escaping with {n} loot or emptying the vault.',
  dd_full: 'That room is full.', dd_noNet: 'No connection.', dd_joinedP: '{p} joined', dd_leftP: '{p} left',
  dd_partnerLost: 'Your Partner Left', dd_partnerLostK: 'Keep playing solo with computer heroes, or go back to the menu.', dd_partnerLostH: 'The Dungeon Keeper left the match.',
  dd_continueSolo: 'Continue Solo', dd_toRoom: 'Back To Room', dd_rematch: 'Rematch', dd_waitKeeper: 'Waiting for the Keeper…',
  dd_kWin: 'The Keeper Wins!', dd_hWin: 'The Heroes Win!', dd_youWin: 'You Won!', dd_youLose: 'You Lost This Time.',
  dd_whyHeld: 'The dungeon held for all 5 waves.', dd_whyLoot: 'The heroes escaped with {n} loot.', dd_whyVault: 'The vault was emptied.',
  dd_sWaves: 'Waves Cleared', dd_sRetreat: 'Heroes Retreated', dd_oPlayer: 'Player', dd_pausedBy: 'Paused by {p}', dd_leaveMatch: 'Leave Match',
  dd_oSend: 'Send:', dd_oHeal: 'Heal', dd_oScorch: 'Scorch', dd_oCharge: 'Charge', dd_oBoss: 'Boss Power', dd_oRetreat: 'Retreat',
  dd_oHealD: 'Clerics heal nearby heroes by 30%.', dd_oScorchD: 'Mages scorch the nearest trap or tower and knock it out for a while.',
  dd_oChargeD: 'All heroes dash past traps and monsters for 1.5 seconds.', dd_oBossD: 'The boss uses its special power.',
  dd_oRetreatD: 'Heroes without loot run back to the exit, so the Keeper gets no bounty for them.',
  dd_oNoCleric: 'No cleric is ready.', dd_oNoMage: 'No mage is ready.', dd_oNoTarget: 'Nothing is in range of your mages.', dd_oNoBoss: 'No boss on the field.',
  dd_oNoHeroes: 'No heroes inside.', dd_oCooldown: 'Still recharging.',
  dd_oBuildH: 'The Keeper is building. Tap an empty floor tile to plant your route flag.', dd_oFlagSet: 'Heroes will pass the blue flag. Tap it again to remove it.',
  dd_oWaveH: 'Tap a hero below to send them in.', dd_oAuto: 'Next hero walks in by itself in {n}s', dd_oPicking: 'Wave cleared. The Keeper is choosing a card…',
  dd_oStolen: 'Heroes escaped with {n} of {m}', dd_oFlagGone: 'Your flag was removed: that way is blocked.', dd_oBuildK: 'Your partner leads the heroes and picks their route. Guard every path!',
  dd_oYouKeeper: 'You Are The Keeper', dd_oYouHeroes: 'You Lead The Heroes', dd_oAllIn: 'Every hero is inside.', dd_oSolo: 'The computer leads the heroes now.'
});

const CLS = DD.HERO_ORDER, MONS = ['golem', 'slime', 'skeleton', 'minislime'], PROJ = ['arrow', 'frostbolt', 'bolt', 'scorch'], CARD_IDS = Object.keys(DD.CARDS);
const ABIL = ['heal', 'scorch', 'charge', 'boss', 'retreat'];
const ABIL_G = { heal: ['heart', '#9affb0'], scorch: ['flame', '#ff9a3a'], charge: ['boot', '#ffcc33'], boss: ['crown', '#ff4d6d'], retreat: ['door', '#c9d1de'] };
const ABIL_KEY = { heal: 'dd_oHeal', scorch: 'dd_oScorch', charge: 'dd_oCharge', boss: 'dd_oBoss', retreat: 'dd_oRetreat' };
const GOALS = [100, 125, 150];   // loot the heroes must escape with, per act (loot per hero grows each act)
const PREFIX = 'deck-of-dungeons';

// ---------------------------------------------------------------- state
const ON = DD.online = {
  ch: null, code: '', ready: false, me: '', role: null, host: false, jt: 0, partner: null, hb: null, act: 0,
  playing: false, client: false, result: null, prev: null, lostOpen: false,
  // Keeper side
  bdv: -1, lastSt: 0,
  // Heroes side
  hm: new Map(), mm: new Map(), q: [], cbv: -1, sbv: -1, needT: 0, flagT: 0, pzT: 0, pz: '', st: null, lastMode: '', suid: 1, hasBoss: false, panelSig: '', infoSig: ''
};
const authName = () => { try { return (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { return ''; } };
const savedName = () => { try { return localStorage.getItem(PREFIX + '-name') || ''; } catch (e) { return ''; } };
const myName = () => authName() || savedName() || t('dd_oPlayer');
const newCode = () => { const A2 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A2[Math.floor(Math.random() * A2.length)]; return s; };
const pageLink = () => location.href.split('?')[0].split('#')[0];
const inviteLink = (code) => pageLink() + '?room=' + code;
const other = (r) => r === 'keeper' ? 'heroes' : 'keeper';
const ss = { get(k) { try { return sessionStorage.getItem(PREFIX + '-' + k + '-' + ON.code) || ''; } catch (e) { return ''; } }, set(k, v) { try { sessionStorage.setItem(PREFIX + '-' + k + '-' + ON.code, v); } catch (e) {} } };
const roleIcon = (r) => r === 'keeper' ? A.cardArt('archer') : A.heroIcon('knight');
const roleName = (r) => r ? t(r === 'keeper' ? 'dd_keeper' : 'dd_heroesRole') : t('dd_connecting');
const actLabel = (a) => t('dd_act', { n: U.actNo(a) }) + ' · ' + t(DD.MAPS[a].name);
const goalOf = (a) => GOALS[a] || 100;
async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
function netSend(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }
const curName = () => U.cur ? U.cur.fn : null;

// ---------------------------------------------------------------- screens
function onlineScreen() {
  const nm = authName();
  return `<div class="box"><h2>${gi('sword', '#5ab8ff')} ${esc(t('dd_oTitle'))}</h2>
    ${nm ? `<p class="muted">${esc(t('dd_playerName', { p: nm }))}</p>` : `<div class="row"><input class="code name" id="ddName" maxlength="16" placeholder="${esc(t('dd_oNamePh'))}" value="${esc(savedName())}" autocomplete="off" spellcheck="false"></div>`}
    <div class="roles">
      <button class="role" style="--rc:#ffb703" data-act="oCreate" data-arg="keeper"><img src="${A.cardArt('archer')}" alt=""><b>${esc(t('dd_keeper'))}</b><span>${esc(t('dd_keeperDesc'))}</span><em>${esc(t('dd_createAs'))}</em></button>
      <button class="role" style="--rc:#5ab8ff" data-act="oCreate" data-arg="heroes"><img src="${A.heroIcon('knight')}" alt=""><b>${esc(t('dd_heroesRole'))}</b><span>${esc(t('dd_heroesDesc'))}</span><em>${esc(t('dd_createAs'))}</em></button>
    </div>
    <div class="or">${esc(t('dd_or'))}</div>
    <div class="row" style="flex-wrap:nowrap"><input class="code" id="ddCode" maxlength="6" placeholder="${esc(t('dd_codePh'))}" autocomplete="off" spellcheck="false"><button class="btn" data-act="oJoin">${esc(t('dd_join'))}</button></div>
    <div class="msg" id="ddMsg"></div>
    <div class="row center"><button class="btn sec" data-act="back" data-arg="menu">${esc(t('dd_back'))}</button></div></div>`;
}
function lobbyScreen() {
  const P = ON.partner, role = ON.role, host = amHost();
  const pl = (name, r, who, isHost) => `<div class="pl"><img src="${roleIcon(r || 'heroes')}" alt=""><div><b dir="auto">${esc(name)}</b><small>${esc(who)} · ${esc(roleName(r))}</small></div>${isHost ? `<span class="tag">${esc(t('dd_host'))}</span>` : ''}</div>`;
  const picker = host
    ? `<div class="picker"><button class="btn sec small" data-act="oAct" data-arg="-1">◀</button><div class="grow"><small>${esc(t('dd_pickAct'))}</small><b>${esc(actLabel(ON.act))}</b></div><button class="btn sec small" data-act="oAct" data-arg="1">▶</button></div>
       <button class="btn" data-act="oStart" ${P && role ? '' : 'disabled'}>${gi('play', '#1a1200')} ${esc(t('dd_startMatch'))}</button>${P ? '' : `<p class="muted center">${esc(t('dd_needPartner'))}</p>`}`
    : `<div class="picker"><div class="grow"><small>${esc(t('dd_pickAct'))}</small><b>${esc(actLabel(ON.act))}</b></div></div><p class="muted center">${esc(t('dd_waitHost'))}</p>`;
  return `<div class="box"><h2>${gi('sword', '#5ab8ff')} ${esc(t('dd_oTitle'))}</h2>
    <div class="roomcode"><span>${esc(t('dd_room'))}</span><b>${esc(ON.code)}</b><span class="sp"></span><button class="btn small" data-act="oCopy">${esc(t('dd_copyLink'))}</button></div>
    <div class="plist">${pl(myName(), role, t('dd_you'), host)}
      ${P ? pl(P.n, P.role, t('dd_partner'), !host) : `<div class="pl wait">${esc(t(ON.ready ? 'dd_waitPartner' : 'dd_connecting'))}</div>`}</div>
    ${P && role ? `<button class="btn sec small" style="width:100%" data-act="oSwap">⇄ ${esc(t('dd_swap'))}</button>` : ''}
    <div class="goals"><div><b>${esc(t('dd_goalKt'))}</b>${esc(t('dd_goalK'))}</div><div><b>${esc(t('dd_goalHt'))}</b>${esc(t('dd_goalH', { n: goalOf(ON.act) }))}</div></div>
    <div class="menuBtns" style="margin-top:8px">${picker}<button class="btn sec small" data-act="oLeave">${esc(t('dd_leave'))}</button></div></div>`;
}
const lobbySig = () => { const P = ON.partner; return [P ? P.id + P.n + P.role : '', ON.role, amHost(), ON.act, ON.ready, getLang()].join('|'); };
function refreshLobby(force) {
  if (curName() !== lobbyScreen) return;
  const sig = lobbySig(); if (sig === ON.lobbySig && !force) return; ON.lobbySig = sig; U.show(lobbyScreen);
}
function resultScreen() {
  const R = ON.result || {}, win = R.w === ON.role, kw = R.w === 'keeper';
  const why = R.why === 'held' ? t('dd_whyHeld') : R.why === 'loot' ? t('dd_whyLoot', { n: R.stolen || 0 }) : t('dd_whyVault');
  return `<div class="box" style="text-align:center"><h2 style="justify-content:center;font-size:26px;color:${kw ? '#ffcc33' : '#8fd0ff'}">${gi(kw ? 'skull' : 'sack', kw ? '#ffcc33' : '#8fd0ff')} ${esc(t(kw ? 'dd_kWin' : 'dd_hWin'))}</h2>
    <p style="font-weight:900;font-size:17px;color:${win ? '#5fdc7a' : '#ff8a9a'}">${gi(win ? 'trophy' : 'skull', win ? '#ffcc33' : '#ff8a9a')} ${esc(t(win ? 'dd_youWin' : 'dd_youLose'))}</p>
    <p class="muted">${esc(why)} · ${esc(actLabel(R.act || 0))}</p>
    <div class="stats"><div><b>${R.waves || 0}/${WPA}</b><small>${esc(t('dd_sWaves'))}</small></div><div><b>${R.kills || 0}</b><small>${esc(t('dd_sKills'))}</small></div>
      <div><b>${R.stolen || 0}/${R.goal || 0}</b><small>${esc(t('dd_sStolen'))}</small></div><div><b>${R.recovered || 0}</b><small>${esc(t('dd_sRecovered'))}</small></div>
      <div><b>${R.ret || 0}</b><small>${esc(t('dd_sRetreat'))}</small></div><div><b>${R.vault || 0}</b><small>${esc(t('dd_sLoot'))}</small></div></div>
    <div class="row center"><button class="btn" data-act="oRematch" ${ON.partner ? '' : 'disabled'}>${gi('play', '#1a1200')} ${esc(t('dd_rematch'))}</button>
      <button class="btn sec" data-act="oRoom">${esc(t('dd_toRoom'))}</button><button class="btn sec" data-act="oMenu">${esc(t('dd_mainMenu'))}</button></div>
    <p class="muted" id="ddReq"></p></div>`;
}
function lostScreen() {
  const keeper = ON.role === 'keeper';
  return `<div class="box" style="text-align:center"><h2 style="justify-content:center">${gi('door', '#ff8a9a')} ${esc(t('dd_partnerLost'))}</h2><p>${esc(t(keeper ? 'dd_partnerLostK' : 'dd_partnerLostH'))}</p>
    <div class="menuBtns">${keeper ? `<button class="btn" data-act="oSolo">${gi('play', '#1a1200')} ${esc(t('dd_continueSolo'))}</button>` : `<button class="btn" data-act="oRoom">${esc(t('dd_toRoom'))}</button>`}
    <button class="btn sec" data-act="oMenu">${esc(t('dd_mainMenu'))}</button></div></div>`;
}
function onlinePauseScreen(by) {
  return `<div class="box"><h2>${gi('pause', '#ffcc33')} ${esc(t('dd_paused'))}</h2>${by ? `<p class="muted">${esc(t('dd_pausedBy', { p: by }))}</p>` : ''}<div class="menuBtns">
    <button class="btn" data-act="oResume">${gi('play', '#1a1200')} ${esc(t('dd_resume'))}</button>
    <div class="row" style="flex-wrap:nowrap"><button class="btn sec small sp" data-act="oSound">${gi(AU.on ? 'sound' : 'mute', '#eef0ff')} ${esc(t('dd_sound'))}: ${esc(t(AU.on ? 'dd_on' : 'dd_off'))}</button>
    <button class="btn sec small sp" data-act="oMusic">${gi('note', '#eef0ff')} ${esc(t('dd_music'))}: ${esc(t(AU.music ? 'dd_on' : 'dd_off'))}</button></div>
    <div class="row" style="flex-wrap:nowrap"><button class="btn sec small sp" data-act="how" data-arg="opause">${esc(t('dd_howto'))}</button><button class="btn sec small sp" data-act="codex" data-arg="opause">${esc(t('dd_codex'))}</button></div>
    <button class="btn sec small" data-act="lang">${esc(getLang() === 'ar' ? 'English' : 'العربية')}</button>
    <button class="btn red small" data-act="oMenu">${gi('door', '#eef0ff')} ${esc(t('dd_leaveMatch'))}</button></div></div>`;
}
const SCREENS = [onlineScreen, lobbyScreen, resultScreen, lostScreen, onlinePauseScreen];
ON.pauseFn = onlinePauseScreen;

// screen input helpers (delegated so they survive re-renders)
const scr = $('scr');
scr.addEventListener('input', (e) => {
  if (e.target.id === 'ddCode') e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (e.target.id === 'ddName') { try { localStorage.setItem(PREFIX + '-name', e.target.value.trim().slice(0, 16)); } catch (er) {} }
});
scr.addEventListener('keydown', (e) => { if (e.target.id === 'ddCode' && e.key === 'Enter') U.ACT.oJoin(); });

// ---------------------------------------------------------------- menu actions
Object.assign(U.ACT, {
  online() { U.show(onlineScreen); },
  async oCreate(r) { if (!(await canGoOnline())) return; joinRoom(newCode(), r === 'heroes' ? 'heroes' : 'keeper', true); },
  async oJoin() {
    const inp = $('ddCode'), code = (inp ? inp.value : '').trim().toUpperCase();
    if (code.length < 4) { const m = $('ddMsg'); if (m) m.textContent = t('dd_codeHint'); return; }
    if (!(await canGoOnline())) return; joinRoom(code, null, false);
  },
  oCopy() { copyText(inviteLink(ON.code), document.querySelector('[data-act="oCopy"]')); },
  oSwap() { swapRoles(); },
  oAct(d) { if (!amHost()) return; ON.act = (ON.act + (+d) + 3) % 3; netSend('sel', { act: ON.act }); refreshLobby(true); },
  oStart() { if (!ON.partner) { U.toast(t('dd_needPartner')); return; } if (ON.role === 'keeper') startMatch(); else netSend('start', { act: ON.act }); },
  oLeave() { leaveRoom(); U.toMenu(); },
  oMenu() { leaveRoom(); U.toMenu(); },
  oRoom() { netSend('lobby', {}); toLobby(); },
  oRematch() {
    if (!ON.partner) { U.toast(t('dd_needPartner')); return; }
    if (ON.role === 'keeper') startMatch(); else { netSend('req', { a: 'rematch' }); const r = $('ddReq'); if (r) r.textContent = t('dd_waitKeeper'); }
  },
  oSolo() {   // Keeper keeps playing against computer heroes
    if (S.ctl) { S.ctl.ai = true; G.setFlag(-1); }
    ON.lostOpen = false; S.paused = false; restorePrev(); U.toast(t('dd_oSolo'), true);
  },
  oResume() { ON.pause(false); },
  oSound() { AU.setOn(!AU.on); U.settings.sound = AU.on; saveSettings(); U.show(onlinePauseScreen, ON.pz === 'remote' ? partnerName() : ''); },
  oMusic() { AU.setMusic(!AU.music); U.settings.music = AU.music; saveSettings(); U.show(onlinePauseScreen, ON.pz === 'remote' ? partnerName() : ''); }
});
const saveSettings = () => { try { localStorage.setItem(PREFIX + '-settings', JSON.stringify(U.settings)); } catch (e) {} };
const partnerName = () => ON.partner ? ON.partner.n : '';
function copyText(text, btn) {
  const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = t('dd_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
  try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
}
// keep a Keeper screen (reward / relic choice) safe behind the partner-left or pause popup
function holdPrev() { const c = U.cur; if (!c) ON.prev = null; else if (!SCREENS.includes(c.fn)) ON.prev = c; }
function restorePrev() { const p = ON.prev; ON.prev = null; if (p && S.run && S.mode === 'between') U.show(p.fn, ...p.args); else U.hideScreen(); }
ON.holdScreen = (fn, args) => { if (ON.lostOpen || curName() === onlinePauseScreen) { ON.prev = { fn, args }; return true; } return false; };

// ---------------------------------------------------------------- pause (synced only while a wave runs)
ON.pause = (on, reopen) => {
  if (!ON.playing) return;
  if (on) {
    if (reopen) { U.show(onlinePauseScreen, ON.pz === 'remote' ? partnerName() : ''); return; }
    holdPrev(); ON.pz = 'local'; ON.pzT = performance.now();
    if (S.mode === 'wave') { if (ON.client) netSend('pause', { on: true }); else S.paused = true; }
    U.show(onlinePauseScreen, '');
  } else {
    if (S.mode === 'wave') { if (ON.client) netSend('pause', { on: false }); else S.paused = false; }
    ON.pz = ''; if (curName() === onlinePauseScreen || U.cur && (U.cur.fn === U.codexScreen || U.cur.fn === U.howScreen)) { if (ON.prev) restorePrev(); else U.hideScreen(); }
  }
};

// ---------------------------------------------------------------- room
const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'roles', 'sel', 'start', 'go', 'bd', 'needbd', 'st', 'send', 'ab', 'abr', 'flag', 'pause', 'end', 'req', 'lobby'];
function joinRoom(code, role, create) {
  leaveRoom(true);
  if (!window.sb) { U.toast(t('dd_noNet')); return false; }
  code = String(code || '').trim().toUpperCase().slice(0, 6); if (!code) return false;
  ON.code = code;
  let id = ss.get('id'); if (!id) { id = Math.random().toString(36).slice(2, 10); ss.set('id', id); }
  ON.me = id; ON.jt = Date.now(); ON.partner = null; ON.ready = false;
  ON.role = role || ss.get('role') || null; ON.host = !!create || ss.get('host') === '1';
  if (ON.role) ss.set('role', ON.role); if (ON.host) ss.set('host', '1');
  const ch = sb.channel(PREFIX + '-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; hello(true); refreshLobby(); } });
  ON.ch = ch;
  try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
  window.Mal3abShareLink = () => inviteLink(code);
  clearInterval(ON.hb); ON.hb = setInterval(netBeat, 2000);
  toLobby();
  return true;
}
function leaveRoom(quiet) {
  if (ON.ch) { netSend('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
  clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.partner = null; ON.role = null; ON.host = false;
  ON.playing = false; ON.client = false; ON.lostOpen = false; ON.prev = null; G.fxOut = null;
  document.body.classList.remove('onl', 'onl-h');
  window.Mal3abShareLink = () => pageLink();
  if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
}
ON.leaveRoom = leaveRoom;
const phase = () => ON.playing ? 'play' : 'lobby';
function hello(req) { netSend('hello', { n: myName(), role: ON.role, host: ON.host, jt: ON.jt, req: !!req, ph: phase(), act: ON.act }); }
function netBeat() {
  if (!ON.ch) return;
  netSend('hb', { n: myName(), role: ON.role, host: ON.host, jt: ON.jt, ph: phase(), act: ON.act });
  if (ON.partner && Date.now() - ON.partner.t > 9000) partnerGone();
}
function amHost() {
  const P = ON.partner; if (!P) return true;
  if (ON.host !== !!P.host) return ON.host;
  return ON.jt < P.jt || (ON.jt === P.jt && ON.me < P.id);
}
function resolveRoles(p) {
  if (ON.playing && ON.role) return;
  const mineFirst = ON.jt < p.jt || (ON.jt === p.jt && ON.me < p.id);
  if (!p.role && !ON.role) ON.role = mineFirst ? 'keeper' : 'heroes';
  else if (!ON.role) ON.role = other(p.role);
  else if (p.role === ON.role && !mineFirst) ON.role = other(p.role);
  ss.set('role', ON.role || '');
}
function onNet(ev, p) {
  if (!p || p.id === ON.me) return;
  const now = Date.now();
  if (ev === 'full') { if (p.to === ON.me) { leaveRoom(); U.toMenu(); U.show(onlineScreen); U.toast(t('dd_full')); } return; }
  let P = ON.partner;
  if (P && P.id !== p.id) {
    if (now - P.t < 9000) { if (ev === 'hello') netSend('full', { to: p.id }); return; }
    partnerGone(true); P = null;
  }
  if (ev === 'bye') { if (P) partnerGone(); return; }
  if (!P) {
    P = ON.partner = { id: p.id, n: p.n || '…', role: null, host: false, jt: p.jt || now, t: now };
    U.toast(t('dd_joinedP', { p: P.n }), true); sfx('coin');
    if (ON.lostOpen) { ON.lostOpen = false; if (S.ctl) S.ctl.ai = false; S.paused = false; if (ON.client) toLobby(); else restorePrev(); }
  }
  P.t = now; if (p.n) P.n = p.n;
  if (ev === 'hello' || ev === 'hb') {
    if ('role' in p) P.role = p.role; P.host = !!p.host; if (p.jt) P.jt = p.jt;
    const before = ON.role; resolveRoles(p);
    if (!amHost() && !ON.playing && typeof p.act === 'number' && p.act !== ON.act) { ON.act = p.act; refreshLobby(); }
    if (ev === 'hello' && p.req) hello(false); else if (before !== ON.role) hello(false);
    if (ON.playing && !ON.client && p.ph !== 'play') { if (S.ctl) S.ctl.ai = false; sendGo(true); }       // Heroes reloaded: bring them back in
    if (ON.playing && ON.client && p.ph === 'lobby') toLobby();                                          // Keeper left the match
    refreshLobby();
    return;
  }
  switch (ev) {
    case 'roles': ON.role = p.keeper === ON.me ? 'keeper' : 'heroes'; P.role = other(ON.role); ss.set('role', ON.role); refreshLobby(); break;
    case 'sel': if (!amHost() && !ON.playing) { ON.act = p.act | 0; refreshLobby(); } break;
    case 'start': if (ON.role === 'keeper' && !ON.playing) { ON.act = p.act | 0; startMatch(); } break;
    case 'go': enterClient(p); break;
    case 'bd': if (ON.client) applyBoard(p); break;
    case 'needbd': if (ON.playing && !ON.client && S.run) sendBoard(); break;
    case 'st': if (ON.client) applyState(p); break;
    case 'send': if (ON.playing && !ON.client && CLS[p.c] && S.mode === 'wave') G.sendHero(CLS[p.c]); break;
    case 'ab': if (ON.playing && !ON.client) { const r = G.heroCmd(p.k); if (!r.ok && r.err) netSend('abr', { k: p.k, e: r.err }); } break;
    case 'abr': if (ON.client && /^dd_o\w+$/.test(p.e || '')) U.toast(t(p.e)); break;
    case 'flag': if (ON.playing && !ON.client && S.ctl) { const f = p.f | 0; G.setFlag(f < 0 ? -1 : Math.floor(f / 16), f % 16); } break;
    case 'pause':
      if (!ON.playing || ON.client) break;
      if (p.on && S.mode === 'wave' && !ON.lostOpen) { holdPrev(); S.paused = true; ON.pz = 'remote'; U.show(onlinePauseScreen, P.n); }
      else if (!p.on) { S.paused = false; ON.pz = ''; if (curName() === onlinePauseScreen) U.hideScreen(); }
      break;
    case 'end': if (ON.client && p.r) showResult(p.r); break;
    case 'req': if (ON.playing && !ON.client && S.mode === 'over' && p.a === 'rematch') startMatch(); break;
    case 'lobby': if (ON.playing) toLobby(); break;
  }
}
function partnerGone(silent) {
  const P = ON.partner; if (!P) return; ON.partner = null;
  if (!silent) U.toast(t('dd_leftP', { p: P.n }));
  if (ON.playing && S.mode !== 'over') {
    if (!ON.client && S.ctl && S.ctl.ai) return;   // already playing solo
    holdPrev(); ON.lostOpen = true;
    if (!ON.client && S.mode === 'wave') S.paused = true;
    U.show(lostScreen);
  } else if (curName() === lobbyScreen) refreshLobby(); else if (curName() === resultScreen) U.show(resultScreen);
}
function swapRoles() {
  if (!ON.partner || !ON.role) return;
  ON.role = other(ON.role); ON.partner.role = other(ON.role); ss.set('role', ON.role);
  netSend('roles', { keeper: ON.role === 'keeper' ? ON.me : ON.partner.id });
  refreshLobby(true);
}
function toLobby() {
  ON.playing = false; ON.client = false; ON.result = null; ON.lostOpen = false; ON.prev = null; ON.pz = '';
  document.body.classList.remove('onl', 'onl-h');
  U.resetToDemo(); ON.lobbySig = lobbySig(); U.show(lobbyScreen);
}

// ---------------------------------------------------------------- Keeper side: run the match and stream it
function startMatch() {
  if (!ON.partner) { U.toast(t('dd_needPartner')); return; }
  ON.role = 'keeper'; ss.set('role', 'keeper'); ON.playing = true; ON.client = false; ON.result = null; ON.bdv = -1; ON.lostOpen = false; ON.prev = null; ON.pz = '';
  document.body.classList.add('onl'); document.body.classList.remove('onl-h');
  U.hideScreen(); G.newCtl(goalOf(ON.act)); S.showFlag = false; G.fxOut = [];
  U.startOnlineRun(ON.act);
  sendGo(false);
  U.banner(t('dd_oYouKeeper'), t('dd_goalK'), '#ffcc33');
}
function sendGo(mid) { if (S.run && S.ctl) { netSend('go', { a: S.run.act, gl: S.ctl.goal, mid: mid ? 1 : 0 }); ON.bdv = -1; } }
function sendBoard() {
  const run = S.run; if (!run) return;
  netSend('bd', { a: run.act, bv: S.version, s: S.structs.map(s => [CARD_IDS.indexOf(s.id), s.x, s.y, s.lvl, s.up ? 1 : 0]) });
}
const q100 = (v) => Math.round(v * 100);
function heroFlags(h) {
  return (h.frozen > 0 ? 1 : 0) | (h.stun > 0 ? 2 : 0) | (h.burn ? 4 : 0) | (h.poison.length ? 8 : 0) | (h.chill > 0 ? 16 : 0) | (h.charge > 0 ? 32 : 0) | (h.dig > 0 ? 64 : 0)
    | (h.grab > 0 ? 128 : 0) | (h.wet > 0 ? 256 : 0) | (h.rust > 0 ? 512 : 0) | (h.moving ? 1024 : 0) | (h.fight ? 2048 : 0) | (h.blind > 0 ? 4096 : 0) | (h.enraged ? 8192 : 0)
    | (h.state === 'flee' ? 16384 : 0) | (h.swing > 0 ? 32768 : 0) | (h.fall > 0 ? 65536 : 0) | (h.flash > 0 ? 131072 : 0);
}
function reviveFrac(m) {
  const total = (m.type === 'skeleton' ? m.s.st.t : m.type === 'golem' ? 18 : 14) * (S.rel.boneRing ? 0.5 : 1);
  return Math.round(100 * Math.max(0, Math.min(1, 1 - m.reviveT / total)));
}
function queueSummary() {
  const run = S.run, m = new Map();
  if (S.mode === 'wave') { for (const e of S.spawnQ) if (!e.now) m.set(e.cls, (m.get(e.cls) || 0) + 1); }
  else if (run.wave < WPA) for (const [c, n] of G.waveDef(run.act, run.wave, run.dread)) m.set(c, n);
  return [...m].map(([c, n]) => [CLS.indexOf(c), n]);
}
function sendState() {
  const run = S.run, c = S.ctl; if (!run || !c) return;
  let sst = ''; const ba = [];
  S.structs.forEach((s, i) => { sst += (s.dis > 0 ? 1 : 0) | (s.anim > 0 ? 2 : 0) | (s.id === 'pit' && s.cd > 0 ? 4 : 0); if (s.id === 'ballista') ba.push([i, q100(s.ang)]); });
  const front = S.spawnQ[0];
  netSend('st', {
    m: S.mode, w: run.wave, a: run.act, v: Math.round(run.vault), mn: run.mana, mx: run.maxMana, g: run.stats.stolen, gl: c.goal, k: run.stats.kills,
    p: S.paused ? 1 : 0, ai: c.ai ? 1 : 0, bv: S.version, rl: run.relics, sc: [S.scale.hp, S.scale.sp, S.scale.dmg, S.scale.loot].map(v => Math.round(v * 100) / 100),
    h: S.heroes.filter(h => !h.dead && !h.gone).map(h => [h.id, CLS.indexOf(h.cls), q100(h.x), q100(h.y), Math.ceil(h.hp), Math.round(h.maxHp), heroFlags(h), h.carry, h.chill]),
    mo: S.mons.filter(m => !m.gone).map(m => [m.id, MONS.indexOf(m.type), q100(m.x), q100(m.y), Math.max(0, Math.ceil(m.hp)), Math.round(m.maxHp), m.dead ? reviveFrac(m) : -1, (m.temp ? 1 : 0) | (m.flash > 0 ? 2 : 0) | (m.slam > 0 ? 4 : 0), Math.round(m.dmg)]),
    pr: S.proj.map(p => { const ang = p.kind === 'bolt' ? Math.atan2(p.dy, p.dx) : p.ang || 0; return [PROJ.indexOf(p.kind), q100(p.x), q100(p.y), q100(ang), p.sp, (p.fire ? 1 : 0) | (p.frost ? 2 : 0)]; }),
    ss: sst, ba, q: queueSummary(), at: S.mode === 'wave' && front && !front.now ? Math.max(0, Math.ceil(S.spawnT)) : -1, nq: S.spawnQ.length,
    cd: ABIL.map(k => Math.round(c.cd[k] * 10) / 10), fl: c.flag ? c.flag[0] * 16 + c.flag[1] : -1, sh: Math.round(S.shake * 100) / 100,
    fx: G.fxOut ? G.fxOut.splice(0) : [], res: S.mode === 'over' ? ON.result : null
  });
}
function hostTick(now) {
  if (!ON.partner || !ON.ready) { G.fxOut = null; return; }   // nobody to stream to
  if (!G.fxOut) G.fxOut = [];
  if (S.version !== ON.bdv) { ON.bdv = S.version; sendBoard(); }
  if (now - ON.lastSt >= 80) { ON.lastSt = now; sendState(); }
}
ON.matchEnd = (w, why) => {
  const run = S.run; if (!run || !S.ctl) return;
  ON.result = { w, why, act: run.act, waves: w === 'keeper' ? WPA : run.wave, kills: run.stats.kills, stolen: run.stats.stolen, goal: S.ctl.goal, recovered: run.stats.recovered,
    ret: run.stats.retreated || 0, vault: Math.max(0, Math.round(run.vault)) };
  S.mode = 'over'; ON.lostOpen = false;
  showResult(ON.result); netSend('end', { r: ON.result });
};
function showResult(R) {
  ON.result = R; S.mode = 'over'; S.paused = false; ON.pz = '';
  if (ON.client) { S.heroes = []; S.proj = []; }
  U.show(resultScreen);
  if (R.w === ON.role) sfx('win'); else sfx('lose');
}

// ---------------------------------------------------------------- Heroes side: mirror the Keeper's game
function enterClient(p) {
  if (ON.role === 'keeper' && ON.playing && !ON.client) return;   // two Keepers: ignore, roles resolve on the next beat
  ON.role = 'heroes'; ss.set('role', 'heroes'); ON.playing = true; ON.client = true; ON.result = null; ON.lostOpen = false; ON.prev = null; ON.pz = '';
  ON.hm.clear(); ON.mm.clear(); ON.q = []; ON.cbv = -1; ON.sbv = -1; ON.st = null; ON.lastMode = ''; ON.panelSig = ''; ON.infoSig = ''; ON.hasBoss = false;
  document.body.classList.add('onl', 'onl-h');
  U.hideScreen(); U.hideTip();
  const a = p.a | 0, gl = p.gl | 0 || goalOf(a);
  S.demo = false; S.paused = false; S.sel = -1; S.speed = 1; G.fxOut = null;
  S.run = { online: true, act: a, wave: 0, vault: 100, mana: 0, maxMana: 0, dread: 0, deck: [], draw: [], hand: [], discard: [], relics: [], phase: 'build',
    stats: { kills: 0, stolen: 0, recovered: 0, combos: 0, cards: 0, time: 0, dmg: 0, retreated: 0 } };
  G.refreshRelics(); G.newCtl(gl); S.showFlag = true; S.scale = { hp: 1, sp: 1, dmg: 1, loot: 1 };
  G.loadMap(a); S.mode = 'build';
  U.computeLayout(); U.renderAll();
  if (!p.mid) U.banner(t('dd_oYouHeroes'), t('dd_goalH', { n: gl }), '#5ab8ff');
  netSend('needbd', {});
}
const FALLBACK_S = { st: { t: 6 }, dis: 0, lvl: 1, up: false, fx: {} };
function mkStruct(id, x, y) {
  return { uid: ON.suid++, id, kind: DD.CARDS[id].kind, x, y, lvl: 1, up: false, st: G.stats(id, false), cd: 0, cd2: 0, dis: 0, anim: 0, fx: {}, drum: 0, ang: 0, blast: 1.5, born: S.time };
}
function applyBoard(p) {
  const run = S.run; if (!run) return;
  if (S.act !== p.a) { run.act = p.a; G.loadMap(p.a); ON.hm.clear(); ON.mm.clear(); }
  const first = ON.cbv < 0, old = new Map(S.structs.map(s => [s.x + ',' + s.y + ',' + s.id, s]));
  S.grid.fill(null); S.structs = [];
  for (const [ci, x, y, lvl, up] of p.s || []) {
    const id = CARD_IDS[ci]; if (!id || x < 0 || y < 0 || x >= MW || y >= G.MH) continue;
    const s = old.get(x + ',' + y + ',' + id) || mkStruct(id, x, y);
    s.lvl = lvl | 0 || 1; if (!!up !== s.up) { s.up = !!up; s.st = G.stats(id, s.up); }
    S.grid[y * MW + x] = s; S.structs.push(s);
  }
  const hadFlag = !!S.ctl.flag;
  G.computeFields();
  const fresh = G.recomputeCombos();
  if (first) for (const l of S.links) l.born = -10;
  else if (fresh.length) { const ids = [...new Set(fresh.map(f => f.combo))]; const c0 = DD.COMBOS.find(c => c.id === ids[0]); U.banner(t('dd_combo'), ids.map(U.kname).join(' + '), c0 ? c0.col : '#ffcc33'); }
  if (hadFlag && !S.ctl.flag) U.toast(t('dd_oFlagGone'));
  for (const m of ON.mm.values()) if (!m.temp) m.s = G.structAt(Math.floor(m.x), Math.floor(m.y)) || FALLBACK_S;
  ON.cbv = p.bv; S.version++;
}
function mkHero(a) {
  const cls = CLS[a[1]] || 'squire', d = DD.HEROES[cls], sc = S.scale, hs = Math.imul(a[0] | 0, 2654435761) >>> 0;
  return { id: a[0], cls, def: d, x: a[2] / 100, y: a[3] / 100, nx: a[2] / 100, ny: a[3] / 100, ox: ((hs & 255) / 255 - 0.5) * 0.22, oy: (((hs >>> 8) & 255) / 255 - 0.5) * 0.22,
    hp: 1, maxHp: 1, sp: d.sp * sc.sp, ar: d.ar, loot: Math.round(d.loot * sc.loot), size: d.size || (cls === 'dwarf' ? 0.9 : 1), boss: !!d.boss,
    walk: (hs % 400) / 100, flip: false, poison: [], burn: null, dead: false, flash: 0, swing: 0, fall: 0, wasFall: false, state: 'in', enraged: false };
}
function syncHero(o, a) {
  const f = a[6] | 0;
  o.nx = a[2] / 100; o.ny = a[3] / 100; o.hp = a[4]; o.maxHp = a[5]; o.carry = a[7] | 0;
  o.frozen = f & 1 ? 1 : 0; o.stun = f & 2 ? 1 : 0; o.burn = f & 4 ? (o.burn || {}) : null; o.poison = f & 8 ? [1] : []; o.chill = f & 16 ? (a[8] || 1) : 0;
  o.charge = f & 32 ? 1 : 0; o.dig = f & 64 ? 1 : 0; o.grab = f & 128 ? 1 : 0; o.wet = f & 256 ? 1 : 0; o.rust = f & 512 ? 1 : 0; o.moving = !!(f & 1024);
  o.blind = f & 4096 ? 1 : 0; o.enraged = !!(f & 8192); o.state = f & 16384 ? 'flee' : 'in';
  if (f & 32768) o.swing = 0.2; if ((f & 65536) && !o.wasFall) o.fall = 0.5; o.wasFall = !!(f & 65536); if (f & 131072) o.flash = 0.12;
}
function replayFx(list) {
  for (const e of list || []) {
    switch (e[0]) {
      case 'b': G.burst(e[1], e[2], Math.min(80, e[3] | 0), e[4], e[5], e[6], e[7], e[8], !!e[9]); break;
      case 't': G.addText(e[1], e[2], String(e[3]), e[4], e[5]); break;
      case 'k': if (/^dd_\w+$/.test(e[3])) G.addText(e[1], e[2], t(e[3], e[4] || undefined), e[5], e[6]); break;
      case 'r': G.ring(e[1], e[2], e[3], e[4]); break;
      case 'c': G.coinsTo(e[1], e[2], Math.min(12, e[3] | 0)); break;
      case 'l': G.bolt(e[1], e[2], e[3], e[4], e[5], e[6]); break;
      case 'f': G.breath(e[1], e[2], e[3], e[4]); break;
      case 's': sfx(e[1]); break;
      case 'v': S.vaultHit = 0.4; break;
    }
  }
}
function applyState(p) {
  const run = S.run; if (!run || !ON.client) return;
  const prev = ON.lastMode; ON.st = p; ON.lastMode = p.m;
  if (p.a !== run.act) { run.act = p.a; G.loadMap(p.a); ON.hm.clear(); ON.mm.clear(); ON.cbv = -1; }
  S.mode = p.m === 'over' && !ON.result ? 'wave' : p.m;   // keep the board running until the result arrives
  run.wave = p.w; run.vault = p.v; run.mana = p.mn; run.maxMana = p.mx; run.stats.stolen = p.g; run.stats.kills = p.k; S.ctl.goal = p.gl; S.ctl.ai = !!p.ai;
  if ((p.rl || []).join() !== run.relics.join()) { run.relics = (p.rl || []).slice(0, 20); G.refreshRelics(); }
  if (p.sc) S.scale = { hp: p.sc[0], sp: p.sc[1], dmg: p.sc[2], loot: p.sc[3] };
  for (let i = 0; i < ABIL.length; i++) S.ctl.cd[ABIL[i]] = (p.cd && p.cd[i]) || 0;
  ON.q = (p.q || []).filter(e => CLS[e[0]]); ON.sbv = p.bv;
  // banners when the phase changes
  if (prev && prev !== p.m) {
    if (p.m === 'wave') U.banner(t('dd_waveStart', { n: run.act * WPA + run.wave + 1 }), t('dd_act', { n: U.actNo(run.act) }) + ' — ' + t(DD.MAPS[run.act].name), '#ffcc33');
    else if (p.m === 'between' && prev === 'wave') U.banner(t('dd_cleared'), '', '#5fdc7a');
    else if (p.m === 'build' && run.wave === WPA - 1) U.banner(t('dd_bossWave'), '', '#ff4d6d');
  }
  // heroes
  const seen = new Set(), list = [];
  for (const a of p.h || []) {
    let o = ON.hm.get(a[0]);
    if (!o) { o = mkHero(a); ON.hm.set(a[0], o); if (o.boss) U.banner(t('dd_bossArrives', { p: U.hname(o.cls) }), '', '#ff4d6d'); }
    syncHero(o, a); seen.add(a[0]); list.push(o);
  }
  for (const id of [...ON.hm.keys()]) if (!seen.has(id)) ON.hm.delete(id);
  S.heroes = list; S.boss = list.find(h => h.boss) || null; ON.hasBoss = !!S.boss;
  S.spawnQ = new Array(Math.max(0, p.nq | 0));   // only its length is used (heroes left)
  // monsters (they never move; temp ones come and go)
  const ms = new Set(), mons = [];
  for (const a of p.mo || []) {
    const type = MONS[a[1]]; if (!type) continue;
    let m = ON.mm.get(a[0]);
    const fl = a[7] | 0;
    if (!m) { m = { id: a[0], type, x: a[2] / 100, y: a[3] / 100, hp: 1, maxHp: 1, dmg: 0, dead: false, reviveT: 0, temp: !!(fl & 1), anim: Math.random() * 6, flash: 0, slam: 0, s: null }; ON.mm.set(a[0], m); }
    m.x = a[2] / 100; m.y = a[3] / 100; m.hp = Math.max(0, a[4]); m.maxHp = Math.max(1, a[5]); m.dmg = a[8] | 0; m.temp = !!(fl & 1);
    if (!m.temp && (!m.s || m.s === FALLBACK_S)) m.s = G.structAt(Math.floor(m.x), Math.floor(m.y)) || FALLBACK_S;
    if (!m.temp && m.s !== FALLBACK_S) m.s.mon = m;   // tooltips read the monster through its card
    m.dead = a[6] >= 0;
    if (m.dead) { const s = m.s || FALLBACK_S, total = (type === 'skeleton' ? s.st.t : type === 'golem' ? 18 : 14) * (S.rel.boneRing ? 0.5 : 1); m.reviveT = (1 - a[6] / 100) * total; }
    if (fl & 2) m.flash = 0.1; if ((fl & 4) && !(m.slam > 0)) m.slam = 0.3;
    ms.add(a[0]); mons.push(m);
  }
  for (const id of [...ON.mm.keys()]) if (!ms.has(id)) ON.mm.delete(id);
  S.mons = mons;
  // projectiles: redrawn from each update and moved forward in between
  S.proj = (p.pr || []).filter(a => PROJ[a[0]]).map(a => ({ kind: PROJ[a[0]], x: a[1] / 100, y: a[2] / 100, ang: a[3] / 100, dx: Math.cos(a[3] / 100), dy: Math.sin(a[3] / 100), sp: +a[4] || 5, fire: !!(a[5] & 1), frost: !!(a[5] & 2), t: 0 }));
  // structure states
  if (p.bv === ON.cbv && typeof p.ss === 'string' && p.ss.length === S.structs.length) {
    for (let i = 0; i < S.structs.length; i++) { const s = S.structs[i], d = +p.ss[i] || 0; s.dis = d & 1 ? 1 : 0; s.anim = d & 2 ? 0.2 : 0; if (s.id === 'pit') s.cd = d & 4 ? 1 : 0; }
    for (const [i, ang] of p.ba || []) if (S.structs[i]) S.structs[i].ang = ang / 100;
  }
  if (p.sh > S.shake) S.shake = p.sh;
  replayFx(p.fx);
  // route flag: trust the Keeper's copy once our own change has had time to arrive
  if (performance.now() - ON.flagT > 900) {
    const f = p.fl, mine = S.ctl.flag ? S.ctl.flag[0] * 16 + S.ctl.flag[1] : -1;
    if (f !== mine) { if (mine >= 0 && f < 0) U.toast(t('dd_oFlagGone')); G.setFlag(f < 0 ? -1 : Math.floor(f / 16), f % 16); }
  }
  // pause from the Keeper's side
  const pausedScr = curName() === onlinePauseScreen;
  if (p.p && !S.paused && !pausedScr && !ON.lostOpen) { ON.pz = 'remote'; U.show(onlinePauseScreen, partnerName()); }
  else if (!p.p && pausedScr && (ON.pz === 'remote' || (S.mode === 'wave' && performance.now() - ON.pzT > 1200))) { ON.pz = ''; U.hideScreen(); }
  S.paused = !!p.p;
  if (p.res && !ON.result) showResult(p.res);
}
function clientTick(dt, now) {
  const k = 1 - Math.exp(-dt * 14), portrait = G.layout().portrait;
  for (const h of S.heroes) {
    const dx = h.nx - h.x, dy = h.ny - h.y;
    if (Math.abs(dx) > 1.6 || Math.abs(dy) > 1.6) { h.x = h.nx; h.y = h.ny; } else { h.x += dx * k; h.y += dy * k; }
    const sdx = portrait ? dy : dx; if (Math.abs(sdx) > 0.004) h.flip = sdx < 0;
    if (h.moving && !S.paused) h.walk += dt * h.sp * 2.2 * (h.charge ? 3 : 1);
    if (h.flash > 0) h.flash -= dt; if (h.swing > 0) h.swing -= dt;
  }
  if (!S.paused) {
    for (const m of S.mons) { m.anim += dt; if (m.flash > 0) m.flash -= dt; }
    for (const p of S.proj) {
      p.t += dt; if (p.t > 0.14) continue;
      p.x += Math.cos(p.ang) * p.sp * dt; p.y += Math.sin(p.ang) * p.sp * dt;
      if (Math.random() < 0.6 && (p.kind === 'frostbolt' || p.kind === 'scorch' || p.fire)) S.parts.push({ x: p.x, y: p.y, vx: 0, vy: -0.2, life: 0.3, max: 0.3, col: p.kind === 'frostbolt' ? '#9be7ff' : '#ff9a3a', size: 0.08, g: 0, add: true });
    }
    if (S.mode === 'wave') for (const s of S.structs) {   // ambience the Keeper's simulation would add
      const cx = s.x + 0.5, cy = s.y + 0.5, r = Math.random;
      if (s.dis > 0 && r() < dt * 8) S.parts.push({ x: s.x + 0.3 + r() * 0.4, y: s.y + 0.4 + r() * 0.3, vx: 0, vy: -0.6, life: 0.6, max: 0.6, col: r() < 0.5 ? '#ff7a2f' : '#5a4a50', size: 0.07, g: 0, add: r() < 0.5 });
      else if (s.id === 'gas' && r() < dt * 10) S.parts.push({ x: cx + (r() - 0.5) * 1.6, y: cy + (r() - 0.5) * 1.6, vx: (r() - 0.5) * 0.3, vy: -0.25, life: 1.4, max: 1.4, col: s.fx.gasBlast ? '#c8d84a' : '#7adf4a', size: 0.22, g: 0, add: false, puff: true });
      else if (s.id === 'flood' && s.fx.steam && r() < dt * 9) S.parts.push({ x: cx + (r() - 0.5) * 1.4, y: cy + (r() - 0.5) * 1.2, vx: 0, vy: -0.5, life: 1, max: 1, col: '#e6ecff', size: 0.2, g: 0, add: false, puff: true });
    }
  }
  if (ON.sbv >= 0 && ON.sbv !== ON.cbv && now - ON.needT > 700) { ON.needT = now; netSend('needbd', {}); }
  updateCooldowns();
}
ON.frame = (dt, now) => {
  if (!ON.playing) return;
  if (ON.client) clientTick(dt, now); else if (S.run) hostTick(now);
};

// ---------------------------------------------------------------- Heroes controls (bottom / side panel)
function abilAvail(k) {
  const hs = S.heroes;
  if (k === 'heal') return hs.some(h => h.cls === 'cleric');
  if (k === 'scorch') return hs.some(h => h.cls === 'mage');
  if (k === 'boss') return !!S.boss;
  if (k === 'charge') return hs.some(h => !h.boss);
  if (k === 'retreat') return hs.some(h => h.state === 'in');
  return true;
}
ON.renderPanel = (force) => {
  const el = $('hpanel'); if (!el || !ON.client) return;
  const wave = S.mode === 'wave', live = wave && !S.paused && !(S.ctl && S.ctl.ai);
  const sig = [S.mode, live, ON.q.map(e => e.join(':')).join(','), ABIL.map(k => abilAvail(k) ? 1 : 0).join(''), ON.hasBoss, getLang()].join('|');
  if (sig === ON.panelSig && !force) return; ON.panelSig = sig;
  const sends = ON.q.map(([ci, n]) => { const c = CLS[ci], b = DD.HEROES[c].boss;
    return `<button class="hsend ${b ? 'boss' : ''}" data-c="${ci}" ${live && n > 0 ? '' : 'disabled'} title="${esc(U.hname(c))}"><img src="${A.heroIcon(c)}" alt=""><b>${n > 1 || !b ? n : ''}</b></button>`; }).join('');
  const abil = ABIL.filter(k => k !== 'boss' || ON.hasBoss).map(k =>
    `<button class="hab" data-k="${k}" ${live && abilAvail(k) ? '' : 'disabled'} title="${esc(t(ABIL_KEY[k] + 'D'))}"><i class="cdv"></i>${gi(ABIL_G[k][0], ABIL_G[k][1])}<span>${esc(t(ABIL_KEY[k]))}</span></button>`).join('');
  el.innerHTML = `<div class="hrow send"><span class="lbl">${esc(t(wave ? 'dd_oSend' : 'dd_incoming'))}</span><div class="hlist">${sends || `<span class="muted">${esc(t(wave ? 'dd_oAllIn' : 'dd_none'))}</span>`}</div></div>
    <div class="hrow abil">${abil}</div>`;
  updateCooldowns();
};
function updateCooldowns() {
  const el = $('hpanel'); if (!el || !ON.client || !S.ctl) return;
  for (const b of el.querySelectorAll('.hab')) {
    const k = b.dataset.k, cd = S.ctl.cd[k] || 0, p = Math.max(0, Math.min(1, cd / G.CMD_CD[k]));
    const v = p.toFixed(2); if (b.dataset.p !== v) { b.dataset.p = v; b.style.setProperty('--p', v); b.classList.toggle('ready', p === 0 && !b.disabled); }
  }
}
ON.renderInfo = (force) => {
  const run = S.run, st = ON.st || {}; if (!run || !ON.client) return;
  let key, html;
  if (S.mode === 'wave') key = 'w|' + (st.at >= 0 ? st.at : '') + '|' + run.stats.stolen + '|' + (S.ctl.ai ? 1 : 0);
  else key = S.mode + '|' + (S.ctl.flag ? 1 : 0) + '|' + run.stats.stolen;
  key += '|' + getLang(); if (key === ON.infoSig && !force) return; ON.infoSig = key;
  const stolen = `${gi('sack', '#8fd0ff')} <b>${esc(t('dd_oStolen', { n: run.stats.stolen, m: S.ctl.goal }))}</b>`;
  if (S.mode === 'wave') html = `${stolen} · ${esc(S.ctl.ai ? t('dd_oSolo') : st.at >= 0 ? t('dd_oAuto', { n: st.at }) : t('dd_oWaveH'))}`;
  else if (S.mode === 'between') html = `${gi('star', '#5fdc7a')} ${esc(t('dd_oPicking'))} · ${stolen}`;
  else if (S.mode === 'build') html = `${gi('eye', '#5ab8ff')} ${esc(t(S.ctl.flag ? 'dd_oFlagSet' : 'dd_oBuildH'))} · ${stolen}`;
  else html = stolen;
  $('info').innerHTML = `<div class="tx">${html}</div>`;
};
$('hpanel').addEventListener('click', (e) => {
  if (!ON.client) return; AU.init();
  const s = e.target.closest('.hsend'); if (s && !s.disabled) { netSend('send', { c: +s.dataset.c }); sfx('select'); return; }
  const b = e.target.closest('.hab'); if (b && !b.disabled) {
    const k = b.dataset.k; if ((S.ctl.cd[k] || 0) > 0) { U.toast(t('dd_oCooldown')); return; }
    netSend('ab', { k }); sfx('click');
  }
});
ON.tapTile = (tl, sx, sy) => {   // Heroes page: tap empty floor to plant / move / remove the route flag
  if (!ON.client || !tl || S.mode === 'over') return false;
  const c = S.ctl;
  if (c.flag && c.flag[0] === tl.x && c.flag[1] === tl.y) { setFlagLocal(-1, 0); return true; }
  if (G.heroAt(sx, sy) || G.terrAt(tl.x, tl.y) !== 1 || G.structAt(tl.x, tl.y)) return false;   // heroes / pieces / walls show info instead
  return setFlagLocal(tl.x, tl.y);
};
function setFlagLocal(x, y) {
  if (!G.setFlag(x, y)) return false;
  ON.flagT = performance.now(); netSend('flag', { f: x < 0 ? -1 : x * 16 + y }); sfx(x < 0 ? 'click' : 'select'); U.hideTip(); ON.infoSig = '';
  return true;
}
ON.key = (e) => {   // Heroes keyboard: 1-9 send, H heal, S scorch, C charge, B boss, R retreat, X clear flag
  const k = e.key.toLowerCase();
  if (/^[1-9]$/.test(k)) { const q = ON.q[+k - 1]; const b = q && document.querySelector(`.hsend[data-c="${q[0]}"]`); if (b && !b.disabled) b.click(); return; }
  const map = { h: 'heal', s: 'scorch', c: 'charge', b: 'boss', r: 'retreat' };
  if (map[k]) { const b = document.querySelector(`.hab[data-k="${map[k]}"]`); if (b && !b.disabled) b.click(); return; }
  if (k === 'x' && S.ctl.flag) setFlagLocal(-1, 0);
};

// ---------------------------------------------------------------- invites & auto-join
addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });
window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : pageLink();
window.Mal3abPrepareInvite = async () => {
  if (!ON.code) { if (!(await canGoOnline())) return pageLink(); joinRoom(newCode(), 'keeper', true); }
  return inviteLink(ON.code);
};
const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam) {
  let tried = false;
  const go = async () => { if (tried || ON.code) return; tried = true; if (!(await canGoOnline())) return; joinRoom(roomParam.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), null, false); };
  if (window.Mal3abReady) setTimeout(go, 0); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
}
document.addEventListener('langchange', () => { ON.panelSig = ''; ON.infoSig = ''; });

// ---------------------------------------------------------------- test hooks
window.DeckOfDungeonsOnline = { ON, joinRoom, leaveRoom, startMatch, swapRoles, newCode, amHost, screens: { onlineScreen, lobbyScreen, resultScreen, lostScreen, onlinePauseScreen },
  send: (cls) => netSend('send', { c: CLS.indexOf(cls) }), ab: (k) => netSend('ab', { k }), flag: (x, y) => setFlagLocal(x, y), screen: () => curName() ? curName().name : '' };
})();
