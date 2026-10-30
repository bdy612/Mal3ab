'use strict';
// =====================================================================
// Deck of Dungeons — screens, hand of cards, HUD, input, run flow, saves and the test API
// =====================================================================
(function () {
const DD = window.__DD, A = DD.art, G = DD.game, S = G.S, AU = DD.audio;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
const sfx = (n) => AU.play(n);
const KEY_RUN = 'deck-of-dungeons-run', KEY_META = 'deck-of-dungeons-meta', KEY_SET = 'deck-of-dungeons-settings';
const MW = G.MW, MH = G.MH, WPA = DD.WAVES_PER_ACT;
const touchy = matchMedia('(pointer: coarse)').matches;

let meta = Object.assign({ dreadMax: 0, runs: 0, wins: 0, kills: 0, best: null, combos: [], played: 0 }, lsGet(KEY_META, {}));
const settings = Object.assign({ sound: true, music: true, speed: 1 }, lsGet(KEY_SET, {}));
AU.on = settings.sound; AU.music = settings.music; S.speed = settings.speed;
const saveMeta = () => lsSet(KEY_META, meta), saveSet = () => lsSet(KEY_SET, settings);
let menuDread = meta.dreadMax, uidN = 1, curScreen = null, playerName = '';

const roman = (n) => ['I', 'II', 'III', 'IV'][n - 1] || n;
const actNo = (a) => getLang() === 'en' ? roman(a + 1) : a + 1;
const cname = (id) => t('dd_c_' + id), hname = (id) => t('dd_h_' + id), kname = (id) => t('dd_k_' + id);
const fmt = (v) => typeof v === 'number' ? (Number.isInteger(v) ? v : +v.toFixed(2)) : v;
function fmtStats(st) { const o = {}; for (const k in st) o[k] = fmt(st[k]); return o; }
const cardDesc = (id, up) => t('dd_cd_' + id, fmtStats(G.stats(id, up)));
const baseCost = (c) => { const C = DD.CARDS[c.id]; return c.up && C.up.cost !== undefined ? C.up.cost : C.cost; };
const comboOf = (id) => DD.COMBOS.find(c => c.id === id);

// ---------------------------------------------------------------- strings only the UI needs
addStrings({
  dd_cast: 'العبها', dd_new: 'جديد:', dd_mapTip: 'دوس على أي حاجة في الخريطة عشان تعرف عنها.',
  dd_vaultTip: 'خزنة الكنز: {n}. لو فضيت، الجولة بتخلص.', dd_gateTip: 'المدخل: الأبطال بيدخلوا من هنا وبيهربوا منه.',
  dd_actWelcome: 'الأبطال جايين يسرقوا كنزك. ابني فخاخك وأبراجك واستعد!', dd_bossIs: 'زعيم الفصل: {p}',
  dd_pickOne: 'اختار واحدة بس', dd_reachedVictory: 'كسبت الفصول الـ 3 كلها!', dd_waveN: 'الموجة {n} من 15',
  dd_continueAt: 'الفصل {a} — الموجة {w}', dd_overwrite: 'عندك جولة شغالة. تبدأ جولة جديدة وتسيب القديمة؟',
  dd_drawN: 'لسه هتتسحب: {n}', dd_discardN: 'المحروق: {n}', dd_handN: 'في إيدك: {n}', dd_tapCast: 'دوس "العبها" أو دوس على الخريطة عشان تستخدمها.',
  dd_tapPlace: 'دوس على مربع منوّر عشان تحطه.', dd_sTotal: 'الضرر كله'
}, {
  dd_cast: 'Cast', dd_new: 'New:', dd_mapTip: 'Tap anything on the map to learn about it.',
  dd_vaultTip: 'Treasure vault: {n} loot. If it is emptied, the run ends.', dd_gateTip: 'Entrance: heroes come in here, and thieves escape through it.',
  dd_actWelcome: 'Heroes are coming to steal your hoard. Build your traps and towers and get ready!', dd_bossIs: 'Act boss: {p}',
  dd_pickOne: 'Pick one', dd_reachedVictory: 'You conquered all 3 acts!', dd_waveN: 'Wave {n} of 15',
  dd_continueAt: 'Act {a} — wave {w}', dd_overwrite: 'You have a run in progress. Start a new run and abandon it?',
  dd_drawN: 'Draw pile: {n}', dd_discardN: 'Discard: {n}', dd_handN: 'In hand: {n}', dd_tapCast: 'Press "Cast" or tap the map to use it.',
  dd_tapPlace: 'Tap a glowing tile to place it.', dd_sTotal: 'Total damage'
});

// ---------------------------------------------------------------- canvas & layout
const cv = $('cv'), ctx = cv.getContext('2d');
let LM = { mode: 'none', bottomH: 150, sideW: 240, topH: 52 };
function inRun() { return !!S.run && S.mode !== 'menu'; }
function computeLayout() {
  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const small = W < 700, topH = small ? 48 : 52;
  const game = inRun();
  let best = null;
  const tryL = (mode, ax, ay, aw, ah, bias) => {
    for (const portrait of [false, true]) {
      const cols = portrait ? MH : MW, rows = portrait ? MW : MH, pad = small ? 10 : 18;
      const T = Math.floor(Math.min((aw - pad * 2) / cols, (ah - pad * 2) / rows)), score = T * bias;
      if (!best || score > best.score) best = { mode, portrait, T, score, ax, ay, aw, ah };
    }
  };
  const narrow = W < 560, bottomH = narrow ? clamp(Math.round(H * 0.25), 176, 204) : small ? clamp(Math.round(H * 0.2), 140, 162) : clamp(Math.round(H * 0.22), 158, 196);
  const sideW = clamp(Math.round(W * 0.22), 210, 300);
  if (game) { tryL('bottom', 0, topH, W, H - topH - bottomH, 1.12); if (W > 640 && H > 300) tryL('side', 0, topH, W - sideW, H - topH, 1); }
  else tryL('none', 0, topH, W, H - topH, 1);
  const T = Math.max(14, best.T), cols = best.portrait ? MH : MW, rows = best.portrait ? MW : MH, bw = cols * T, bh = rows * T;
  const ox = Math.round(best.ax + (best.aw - bw) / 2), oy = Math.round(best.ay + (best.ah - bh) / 2);
  G.setLayout({ T, ox, oy, portrait: best.portrait, bw, bh, W, H, dpr });
  LM = { mode: best.mode, bottomH, sideW, topH, stack: narrow && best.mode === 'bottom' };
  document.documentElement.style.setProperty('--topH', topH + 'px');
  const pn = $('panel');
  if (game) {
    pn.hidden = false; pn.className = best.mode === 'side' ? 'side' : 'bottom' + (LM.stack ? ' stack' : '');
    if (best.mode === 'side') { pn.style.width = sideW + 'px'; pn.style.height = ''; } else { pn.style.width = ''; pn.style.height = bottomH + 'px'; }
  } else pn.hidden = true;
  $('bossbar').style.top = (topH + 6) + 'px'; $('toast').style.top = (topH + 44) + 'px';
  sizeCards();
}
function sizeCards() {
  const hand = $('hand'), n = hand.children.length; if (!inRun()) return;
  if (LM.mode === 'side') {
    const cw = Math.floor((LM.sideW - 16 - 10) / 2); hand.style.setProperty('--cw', cw + 'px'); hand.style.setProperty('--ch', Math.round(cw * 1.18) + 'px');
    for (const c of hand.children) c.style.marginLeft = '';
    return;
  }
  const gap = 6, avail = hand.clientWidth || (window.innerWidth - (LM.stack ? 16 : 150));
  let ch = Math.max(84, LM.bottomH - 34 - 22 - (LM.stack ? 44 : 0)), cw = Math.min(Math.round(ch * 0.8), 120);
  if (LM.stack) { cw = clamp(Math.floor(avail / Math.max(n, 1)) - gap, 60, Math.round(ch * 0.78)); ch = Math.min(ch, Math.round(cw * 1.5)); }
  hand.style.setProperty('--cw', cw + 'px'); hand.style.setProperty('--ch', ch + 'px');
  let ml = gap; if (n > 1 && n * cw + (n - 1) * gap > avail) ml = (avail - n * cw) / (n - 1);
  [...hand.children].forEach((c, i) => c.style.marginLeft = i ? ml + 'px' : '0');
}
window.addEventListener('resize', () => { computeLayout(); });

// ---------------------------------------------------------------- small UI helpers
let toastT = 0;
function toast(msg, good) { const el = $('toast'); el.textContent = msg; el.className = 'on' + (good ? ' good' : ''); clearTimeout(toastT); toastT = setTimeout(() => el.className = '', 1900); }
function banner(title, sub, col) { const b = $('banner'); $('banT').textContent = title; $('banS').textContent = sub || ''; b.style.setProperty('--bc', col || '#ffcc33'); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
function scrOpen() { return $('scr').classList.contains('on'); }
function show(fn, ...args) { curScreen = { fn, args }; const html = fn(...args); const s = $('scr'); s.innerHTML = html; s.className = 'on' + (fn === menuScreen ? ' menu' : ''); s.scrollTop = 0; hideTip(); }
function hideScreen() { curScreen = null; const s = $('scr'); s.className = ''; s.innerHTML = ''; }
const gi = (n, c, cls) => A.gimg(n, c, cls);
function cardHTML(card, o) {
  o = o || {}; const C = DD.CARDS[card.id], K = DD.KINDS[C.kind], up = o.preview ? true : card.up;
  const cost = o.static ? (o.preview ? (C.up.cost !== undefined ? C.up.cost : C.cost) : baseCost(card)) : G.cost(card);
  return `<div class="card ${C.kind} ${up ? 'up' : ''} ${o.sel ? 'sel' : ''} ${o.poor ? 'poor' : ''} ${o.big ? 'big' : ''} ${o.mini ? 'mini' : ''} ${o.isNew ? 'new' : ''}" style="--kc:${K.col}" ${o.act ? `data-act="${o.act}" data-arg="${o.arg}"` : ''} data-i="${o.i == null ? '' : o.i}">
    <div class="cost">${cost}</div><img class="art" src="${A.cardArt(card.id)}" alt=""><div class="nm">${esc(cname(card.id))}</div>
    ${o.big ? `<div class="ds">${esc(cardDesc(card.id, up))}</div>` : ''}<div class="kd">${esc(t('dd_kind_' + C.kind))}</div></div>`;
}
function partnersText(id) {   // "Fire arrows (Lava pool)" style list for the info line
  const out = [];
  for (const c of DD.COMBOS) {
    if (c.a === id) out.push(`<span class="cb">${gi(c.g, c.col)} ${esc(kname(c.id))}</span> (${c.b.length > 3 ? esc(t('dd_kind_tower')) + '/' + esc(t('dd_kind_monster')) : c.b.map(cname).map(esc).join('/')})`);
    else if (c.b.includes(id)) out.push(`<span class="cb">${gi(c.g, c.col)} ${esc(kname(c.id))}</span> (${esc(cname(c.a))})`);
  }
  return out;
}

// ---------------------------------------------------------------- HUD
const HUDV = {};
function setTxt(id, v) { if (HUDV[id] !== v) { HUDV[id] = v; $(id).textContent = v; } }
function initIcons() {
  $('iLoot').src = A.glyphURL('coin', '#ffcc33'); $('iMana').src = A.glyphURL('gem', '#c58bff'); $('iDeck').src = A.glyphURL('card', '#9aa3c7');
  $('iPause').src = A.glyphURL('pause', '#eef0ff'); $('iCodex').src = A.glyphURL('book', '#ffcc33');
}
let lastVault = null;
function updateHUD() {
  const hud = $('hud'), run = S.run, game = inRun();
  hud.classList.toggle('menu', !game);
  setTxt('bLang', getLang() === 'ar' ? 'English' : 'العربية');
  if (!game) return;
  setTxt('hWave', t('dd_wave', { n: run.wave + 1, m: WPA }));
  setTxt('hAct', t('dd_act', { n: actNo(run.act) }) + ' — ' + t(DD.MAPS[run.act].name));
  setTxt('hLoot', String(Math.max(0, Math.round(run.vault))));
  setTxt('hMana', run.mana + '/' + run.maxMana);
  setTxt('hDeck', String(run.draw.length));
  setTxt('bSpeed', '×' + S.speed);
  if (lastVault != null && run.vault !== lastVault) { const el = $('sLoot'); el.classList.remove('bump', 'hurt'); void el.offsetWidth; el.classList.add(run.vault > lastVault ? 'bump' : 'hurt'); }
  lastVault = run.vault;
  const rk = run.relics.join(',');
  if (HUDV.rel !== rk) { HUDV.rel = rk; $('hRelics').innerHTML = run.relics.map(r => `<img class="gl px" data-relic="${r}" src="${A.glyphURL(DD.RELICS[r].g, DD.RELICS[r].col)}" title="${esc(t('dd_r_' + r))}">`).join(''); }
  // boss bar
  const bb = $('bossbar');
  if (S.boss && !S.boss.dead) { bb.hidden = false; setTxt('bossName', hname(S.boss.cls)); $('bossFill').style.width = (100 * S.boss.hp / S.boss.maxHp).toFixed(1) + '%'; }
  else bb.hidden = true;
  // go button
  const go = $('bGo'), wave = S.mode === 'wave';
  const gk = S.mode + ':' + (wave ? G.heroesLeft() : '') + getLang();
  if (HUDV.go !== gk) {
    HUDV.go = gk;
    if (wave) { go.className = 'run'; go.innerHTML = `${gi('skull', '#9aa3c7')} ${esc(t('dd_left', { n: G.heroesLeft() }))}`; }
    else if (S.mode === 'build') { go.className = S.run.act === 0 && S.run.wave === 0 && S.structs.length ? 'pulse' : ''; go.innerHTML = `${gi('sword', '#1a1200')} ${esc(t('dd_start'))}`; }
    else { go.className = 'run'; go.innerHTML = '…'; }
  }
  if (S.mode === 'build' && S.run.act === 0 && S.run.wave === 0) go.classList.toggle('pulse', S.structs.length > 0);
}

// ---------------------------------------------------------------- hand & info
let handSig = '', seen = new Set();
function renderHand(force) {
  const run = S.run, hand = $('hand'); if (!run || !inRun()) return;
  const sig = run.hand.map(c => c.uid + (c.up ? '+' : '')).join(',') + '|' + run.mana + '|' + S.sel + '|' + getLang() + '|' + (run.echoUsed ? 1 : 0) + LM.mode;
  if (sig === handSig && !force) return; handSig = sig;
  hand.innerHTML = run.hand.map((c, i) => cardHTML(c, { i, sel: S.sel === i, poor: G.cost(c) > run.mana, isNew: !seen.has(c.uid), mini: LM.mode === 'side' })).join('');
  run.hand.forEach(c => seen.add(c.uid));
  sizeCards(); renderInfo(true);
}
let infoSig = '';
function renderInfo(force) {
  const run = S.run; if (!run || !inRun()) return;
  let html = '', sig = S.sel + '|' + S.mode + '|' + getLang() + '|' + run.hand.length + '|' + S.structs.length + '|' + S.links.length + '|' + (S.mode === 'wave' ? (S.heroes.some(h => h.carry > 0) ? 'c' : G.heroesLeft()) : '');
  if (sig === infoSig && !force) return; infoSig = sig;
  const card = run.hand[S.sel];
  if (card) {
    const C = DD.CARDS[card.id], ps = partnersText(card.id);
    html = `<div class="tx"><b>${esc(cname(card.id))}${card.up ? '+' : ''}</b> · ${esc(cardDesc(card.id, card.up))}${ps.length ? ' · ' + t('dd_comboWith', { p: ps.join(', ') }) : ''}</div>`;
    if (C.place === 'none') html += `<button class="btn small" id="bCast">${esc(t('dd_cast'))}</button>`;
  } else if (S.mode === 'build') {
    const tut = run.act === 0 && run.wave === 0 && meta.played <= 1;
    const nw = newHeroes();
    if (tut) html = `<div class="tx">${gi('star', '#ffcc33')} ${esc(t(!S.structs.length ? 'dd_hint1' : !S.links.length ? 'dd_hint2' : 'dd_hint3'))}</div>`;
    else if (nw.length) html = `<div class="tx"><b>${esc(t('dd_new'))}</b> ${nw.map(c => `<img class="gl" style="width:16px;height:18px" src="${A.heroIcon(c)}"> <b>${esc(hname(c))}</b> — ${esc(t('dd_hd_' + c))}`).join(' · ')}</div>`;
    else html = `<div class="tx muted">${esc(touchy ? t('dd_mapTip') : t('dd_keys'))}</div>`;
  } else if (S.mode === 'wave') {
    html = `<div class="tx">${S.heroes.some(h => h.carry > 0) ? gi('sack', '#ffcc33') + ' ' + esc(t('dd_hintFlee')) : esc(t('dd_waveOn')) + ' — ' + esc(t('dd_left', { n: G.heroesLeft() }))}</div>`;
  }
  $('info').innerHTML = html;
  const bc = $('bCast'); if (bc) bc.onclick = (e) => { e.stopPropagation(); castNone(); };
}
function newHeroes() {   // hero classes appearing for the first time in this run's current wave
  const run = S.run, seenC = new Set();
  for (let a = 0; a <= run.act; a++) for (let w = 0; w < WPA; w++) { if (a === run.act && w >= run.wave) break; for (const [c] of DD.WAVES[a][w]) seenC.add(c); }
  return G.waveDef(run.act, run.wave, run.dread).map(g => g[0]).filter(c => !seenC.has(c));
}
let incSig = '';
function renderIncoming() {
  const run = S.run; if (!run) return; const sig = run.act + ':' + run.wave + ':' + S.mode + getLang(); if (sig === incSig) return; incSig = sig;
  if (S.mode !== 'build') { $('incoming').innerHTML = ''; return; }
  const groups = G.waveDef(run.act, run.wave, run.dread);
  $('incoming').innerHTML = `<span>${esc(t('dd_incoming'))}</span>` + groups.map(([c, n]) => `<span class="hi" data-hero="${c}"><img src="${A.heroIcon(c)}" alt="">${n > 1 ? '×' + n : ''}</span>`).join('');
}
function renderAll() { updateHUD(); renderHand(true); renderInfo(true); renderIncoming(); }
function select(i) {
  if (!S.run || S.mode === 'between' || S.mode === 'over') return;
  if (S.sel === i || i == null || !S.run.hand[i]) { S.sel = -1; } else { S.sel = i; sfx('select'); }
  hideTip(); renderHand(); renderInfo();
}
function deselect() { if (S.sel >= 0) { S.sel = -1; renderHand(); renderInfo(); } hideTip(); }
function tryPlay(x, y) {
  const card = S.run.hand[S.sel]; if (!card) return false;
  const r = G.play(S.sel, x, y);
  if (!r.ok) { if (r.err) toast(t(r.err)); return false; }
  S.sel = -1; hideTip(); renderAll(); return true;
}
function castNone() { if (S.sel < 0) return; tryPlay(); }

// ---------------------------------------------------------------- tooltip
function placeTip(x, y) {
  const tip = $('tip'); tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight, W = window.innerWidth, H = window.innerHeight;
  let tx = x + 16, ty = y - h - 14; if (tx + w > W - 6) tx = x - w - 16; if (tx < 6) tx = 6; if (ty < LM.topH + 4) ty = y + 22; if (ty + h > H - 6) ty = H - h - 6;
  tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
}
function hideTip() { $('tip').hidden = true; S.focus = null; }
function comboRow(cid) { const c = comboOf(cid); return `<div class="cmb" style="--cc:${c.col}">${gi(c.g, c.col)}<div><b>${esc(kname(cid))}</b><br><span class="muted">${esc(t('dd_kd_' + cid))}</span></div></div>`; }
function tipPreview(sx, sy, tl) {
  const card = S.run.hand[S.sel]; if (!card || !tl) { hideTip(); return; }
  const C = DD.CARDS[card.id]; if (C.place === 'none') { hideTip(); return; }
  const r = G.canPlay(S.sel, tl.x, tl.y);
  let html = `<h4>${gi(C.kind === 'spell' ? 'star' : 'cross', DD.KINDS[C.kind].col)} ${esc(cname(card.id))}</h4>`;
  if (!r.ok) html += `<div class="bad">${esc(t(r.err || 'dd_special'))}</div>`;
  else {
    html += `<div class="muted">${esc(r.empower ? t('dd_empower', { n: r.empower }) : C.kind === 'spell' ? t('dd_target') : t('dd_place'))}</div>`;
    for (const cid of [...new Set(r.combos.map(c => c.combo))]) html += comboRow(cid);
  }
  $('tip').innerHTML = html; placeTip(sx, sy);
}
function tipInfo(sx, sy) {
  const h = G.heroAt(sx, sy), tl = G.tileAt(sx, sy);
  if (h) {
    const st = [];
    if (h.burn) st.push(t('dd_burning')); if (h.poison.length) st.push(t('dd_poisoned')); if (h.chill > 0) st.push(t('dd_chilled')); if (h.frozen > 0) st.push(t('dd_frozen'));
    if (h.wet > 0) st.push(t('dd_wet')); if (h.stun > 0) st.push(t('dd_stunned')); if (h.rust > 0) st.push(t('dd_rusted'));
    $('tip').innerHTML = `<h4><img src="${A.heroIcon(h.cls)}" style="width:20px;height:22px" class="px"> ${esc(hname(h.cls))}</h4>
      <div class="row"><span>${gi('heart', '#ff6a6a')} ${Math.ceil(h.hp)}/${Math.round(h.maxHp)}</span><span>${gi('shield', '#c9d1de')} ${Math.round((h.rust > 0 ? 0 : h.ar) * 100)}%</span><span>${gi('boot', '#9be7ff')} ${h.sp.toFixed(1)}</span><span>${gi('sack', '#ffcc33')} ${h.loot}</span></div>
      ${h.carry ? `<div style="color:#ffcc33;font-weight:700">${esc(t('dd_carrying', { n: h.carry }))}</div>` : ''}${st.length ? `<div class="muted">${esc(st.join(' · '))}</div>` : ''}<div class="muted">${esc(t('dd_hd_' + h.cls))}</div>`;
    placeTip(sx, sy); return true;
  }
  if (!tl) { hideTip(); return false; }
  const s = G.structAt(tl.x, tl.y), tt = G.terrAt(tl.x, tl.y);
  if (s) {
    S.focus = s; const C = DD.CARDS[s.id];
    let row = '';
    if (s.kind === 'tower') row = `<span>${gi('sword', '#ff9a3a')} ${Math.round(G.dmgOf(s))}</span><span>${gi('eye', '#5cb8ff')} ${fmt(G.rangeOf(s))}</span><span>${gi('clock', '#c9cde6')} ${fmt(s.st.r)}s</span>`;
    else if (s.mon) row = `<span>${gi('heart', '#5fdc7a')} ${s.mon.dead ? 0 : Math.ceil(s.mon.hp)}/${Math.round(s.mon.maxHp)}</span><span>${gi('sword', '#ff9a3a')} ${Math.round(s.mon.dmg)}</span>`;
    const fx = Object.keys(s.fx);
    $('tip').innerHTML = `<h4>${gi('cross', DD.KINDS[C.kind].col)} ${esc(cname(s.id))}${s.up ? '+' : ''} <span class="muted">${esc(t('dd_lvl', { n: s.lvl }))}</span></h4>
      ${row ? `<div class="row">${row}</div>` : ''}<div class="muted">${esc(cardDesc(s.id, s.up))}</div>${s.dis > 0 ? `<div class="bad">${esc(t('dd_disabled'))}</div>` : ''}
      ${fx.length ? `<div style="margin-top:4px;font-weight:700">${esc(t('dd_activeCombos'))}</div>` + fx.map(comboRow).join('') : ''}`;
    placeTip(sx, sy); return true;
  }
  if (tt === 3) { $('tip').innerHTML = `<h4>${gi('coin', '#ffcc33')} ${esc(t('dd_loot'))}</h4><div class="muted">${esc(t('dd_vaultTip', { n: Math.round(S.run ? S.run.vault : 0) }))}</div>`; placeTip(sx, sy); return true; }
  if (tt === 2) { $('tip').innerHTML = `<div class="muted">${esc(t('dd_gateTip'))}</div>`; placeTip(sx, sy); return true; }
  hideTip(); return false;
}

// ---------------------------------------------------------------- input
let pdown = null, drag = null;
cv.addEventListener('pointerdown', (e) => { AU.init(); if (!inRun() || scrOpen()) return; pdown = { x: e.clientX, y: e.clientY }; if (e.pointerType !== 'mouse') S.hover = G.tileAt(e.clientX, e.clientY); });
cv.addEventListener('pointermove', (e) => {
  if (!inRun() || scrOpen() || drag) return;
  const tl = G.tileAt(e.clientX, e.clientY); S.hover = tl;
  if (S.sel >= 0) { if (e.pointerType === 'mouse' || pdown) tipPreview(e.clientX, e.clientY, tl); }
  else if (e.pointerType === 'mouse') tipInfo(e.clientX, e.clientY);
});
cv.addEventListener('pointerleave', () => { if (!drag) { S.hover = null; if (!touchy) hideTip(); } });
cv.addEventListener('pointerup', (e) => {
  if (!pdown) return; const moved = Math.hypot(e.clientX - pdown.x, e.clientY - pdown.y) > 18; pdown = null;
  if (!inRun() || scrOpen()) return;
  const tl = G.tileAt(e.clientX, e.clientY);
  if (S.sel >= 0) {
    const card = S.run.hand[S.sel], C = card && DD.CARDS[card.id];
    if (C && C.place === 'none') { if (!moved) castNone(); return; }
    if (tl) tryPlay(tl.x, tl.y); else if (!moved) deselect();
    if (e.pointerType !== 'mouse') S.hover = null;
    return;
  }
  if (!moved) { if (!tipInfo(e.clientX, e.clientY)) hideTip(); }
});
cv.addEventListener('contextmenu', (e) => { e.preventDefault(); deselect(); });
const handEl = $('hand');
handEl.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.card'); if (!el || !inRun()) return; AU.init(); e.preventDefault();
  drag = { i: +el.dataset.i, x0: e.clientX, y0: e.clientY, moved: false, el, ghost: null };
});
handEl.addEventListener('mousemove', (e) => {   // desktop: hovering a card shows it in the info line
  const el = e.target.closest('.card'); if (!el || drag || S.sel >= 0 || !S.run) return; const c = S.run.hand[+el.dataset.i]; if (!c) return;
  const k = 'h' + c.uid; if (infoSig === k) return; infoSig = k; const ps = partnersText(c.id);
  $('info').innerHTML = `<div class="tx"><b>${esc(cname(c.id))}${c.up ? '+' : ''}</b> · ${esc(cardDesc(c.id, c.up))}${ps.length ? ' · ' + t('dd_comboWith', { p: ps.join(', ') }) : ''}</div>`;
});
handEl.addEventListener('mouseleave', () => renderInfo(true));
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 14) {
    drag.moved = true; if (S.sel !== drag.i) select(drag.i);
    const g = drag.el.cloneNode(true); g.classList.add('ghostcard'); g.classList.remove('sel'); document.body.appendChild(g); drag.ghost = g;
  }
  if (drag.moved) {
    drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
    const over = document.elementFromPoint(e.clientX, e.clientY) === cv, tl = over ? G.tileAt(e.clientX, e.clientY) : null;
    S.hover = tl; drag.ghost.style.opacity = tl ? '0.35' : '0.85';
    if (tl) tipPreview(e.clientX, e.clientY, tl); else hideTip();
  }
});
document.addEventListener('pointerup', (e) => {
  if (!drag) return; const d = drag; drag = null;
  if (!d.moved) { select(d.i); return; }
  if (d.ghost) d.ghost.remove();
  const over = document.elementFromPoint(e.clientX, e.clientY) === cv, tl = over ? G.tileAt(e.clientX, e.clientY) : null;
  hideTip();
  if (tl && S.sel >= 0) { const C = DD.CARDS[S.run.hand[S.sel].id]; if (C.place === 'none') castNone(); else tryPlay(tl.x, tl.y); }
  if (touchy) S.hover = null;
});
document.addEventListener('pointercancel', () => { if (drag && drag.ghost) drag.ghost.remove(); drag = null; });
$('incoming').addEventListener('click', (e) => {
  const el = e.target.closest('[data-hero]'); if (!el) return; const c = el.dataset.hero, d = DD.HEROES[c], r = el.getBoundingClientRect();
  $('tip').innerHTML = `<h4><img src="${A.heroIcon(c)}" style="width:20px;height:22px" class="px"> ${esc(hname(c))}</h4><div class="row"><span>${gi('heart', '#ff6a6a')} ${d.hp}</span><span>${gi('shield', '#c9d1de')} ${Math.round(d.ar * 100)}%</span><span>${gi('boot', '#9be7ff')} ${d.sp}</span><span>${gi('sack', '#ffcc33')} ${d.loot}</span></div><div class="muted">${esc(t('dd_hd_' + c))}</div>`;
  placeTip(r.left, r.top); setTimeout(hideTip, 3500);
});
$('hRelics').addEventListener('click', (e) => { const el = e.target.closest('[data-relic]'); if (!el) return; const r = el.dataset.relic; toast(t('dd_r_' + r) + ': ' + t('dd_rd_' + r), true); });
$('bGo').onclick = () => { AU.init(); goWave(); };
$('bSpeed').onclick = () => { S.speed = S.speed >= 3 ? 1 : S.speed + 1; settings.speed = S.speed; saveSet(); sfx('click'); updateHUD(); };
$('bPause').onclick = () => { AU.init(); sfx('click'); pauseGame(); };
$('bCodex').onclick = () => { sfx('page'); if (S.mode === 'wave') S.paused = true; show(codexScreen, 'combos', 'game'); };
$('bDeck').onclick = () => { sfx('page'); if (S.mode === 'wave') S.paused = true; show(deckScreen); };
$('bLang').onclick = () => { AU.init(); setLang(getLang() === 'ar' ? 'en' : 'ar'); };
document.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  AU.init();
  const k = e.key;
  if (k === 'Escape' || k === 'p' || k === 'P') {
    if (curScreen && curScreen.fn === pauseScreen) { resumeGame(); return; }
    if (curScreen && (curScreen.fn === codexScreen || curScreen.fn === howScreen || curScreen.fn === deckScreen) && inRun()) { closeOverlay(); return; }
    if (k === 'Escape' && S.sel >= 0) { deselect(); return; }
    if (inRun() && !scrOpen() && (S.mode === 'build' || S.mode === 'wave')) pauseGame();
    return;
  }
  if (!inRun() || scrOpen()) return;
  if (k === ' ' || k === 'Enter') { e.preventDefault(); if (S.mode === 'build') goWave(); else if (S.sel >= 0 && DD.CARDS[S.run.hand[S.sel].id].place === 'none') castNone(); return; }
  if (k === 'f' || k === 'F') { $('bSpeed').onclick(); return; }
  if (/^[1-9]$/.test(k)) { select(+k - 1); return; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'wave' && !S.paused) pauseGame(); });

// ---------------------------------------------------------------- run flow
function newRun(dread) {
  lsDel(KEY_RUN); S.demo = false; S.paused = false;
  const deck = DD.STARTER.map(id => ({ uid: uidN++, id, up: false }));
  S.run = { v: 1, dread: dread || 0, act: 0, wave: 0, vault: 100, deck, draw: [], hand: [], discard: [], mana: 0, maxMana: 3, relics: [], wells: 0,
    stats: { kills: 0, stolen: 0, recovered: 0, combos: 0, cards: 0, time: 0, dmg: 0 }, foundations: true, echoUsed: false, phase: 'act', uidN };
  G.refreshRelics(); meta.runs++; meta.played++; saveMeta(); seen = new Set();
  startAct(0);
}
function startAct(act) {
  const run = S.run; run.act = act; run.wave = 0; run.wells = 0; run.foundations = true; run.phase = 'act';
  G.loadMap(act); run.draw = G.shuffle(run.deck.slice()); run.hand = []; run.discard = [];
  S.mode = 'between'; S.sel = -1; computeLayout(); saveRun(); renderAll();
  show(actScreen);
}
function beginBuild() {
  const run = S.run; hideScreen();
  G.resetBoard(); S.mode = 'build'; S.sel = -1; S.paused = false; run.echoUsed = false; run.phase = 'build';
  run.maxMana = 3 + run.act + (run.wells || 0) + (S.rel.manaCrystal ? 1 : 0);
  const fb = run.foundations ? 2 + run.act : 0;
  run.mana = run.maxMana + fb;
  if (run.hand.length) { run.discard.push(...run.hand); run.hand = []; }
  G.draw(5 + (S.rel.cursedHand ? 1 : 0) + fb);
  if (run.foundations && run.act > 0) toast(t('dd_foundations', { n: fb, m: fb }), true);
  run.foundations = false;
  computeLayout(); saveRun(); renderAll();
  if (run.wave === WPA - 1) banner(t('dd_bossWave'), hname(G.waveDef(run.act, run.wave, run.dread).find(g => DD.HEROES[g[0]].boss)[0]), '#ff4d6d');
}
function goWave() {
  if (!inRun() || S.mode !== 'build' || scrOpen()) return;
  const run = S.run; S.sel = -1; hideTip();
  if (!G.startWave()) return;
  banner(t('dd_waveStart', { n: run.act * WPA + run.wave + 1 }), t('dd_act', { n: actNo(run.act) }) + ' — ' + t(DD.MAPS[run.act].name), '#ffcc33');
  renderAll();
}
let runToken = 0;
G.on.waveEnd = () => {
  const run = S.run, tok = ++runToken;
  run.discard.push(...run.hand); run.hand = []; S.sel = -1; hideTip();
  const last = run.act === 2 && run.wave === WPA - 1;
  banner(t('dd_cleared'), t('dd_bounty', { n: run.bountyWave || 0 }), '#5fdc7a');
  if (!last) { run.phase = 'reward'; run.offer = offerCards(); saveRun(); }
  renderAll();
  setTimeout(() => { if (tok !== runToken || S.run !== run) return; if (last) victory(); else { G.resetBoard(); show(rewardScreen, 'main'); } }, 1700);
};
G.on.defeat = () => {
  const run = S.run, tok = ++runToken; S.sel = -1; hideTip(); lsDel(KEY_RUN);
  banner(t('dd_defeat'), '', '#ff4d6d'); renderAll();
  setTimeout(() => { if (tok !== runToken || S.run !== run) return; finishRun(false); }, 2000);
};
G.on.combo = (ids) => {
  const c = comboOf(ids[0]); banner(t('dd_combo'), ids.map(kname).join(' + '), c.col);
  const fresh = ids.filter(id => !meta.combos.includes(id));
  if (fresh.length) { meta.combos.push(...fresh); saveMeta(); setTimeout(() => toast(t('dd_newCombo') + ' ' + fresh.map(kname).join(', '), true), 600); }
};
G.on.boss = (h) => banner(t('dd_bossArrives', { p: hname(h.cls) }), '', '#ff4d6d');
function victory() { S.mode = 'over'; sfx('win'); finishRun(true); }
function finishRun(won) {
  const run = S.run; lsDel(KEY_RUN);
  const cleared = run.act * WPA + run.wave + (won ? 1 : 0);
  const score = Math.round((cleared * 100 + run.stats.kills * 3 + Math.max(0, run.vault) + (won ? 1500 : 0)) * (1 + 0.1 * run.dread));
  meta.kills += run.stats.kills;
  let newBest = false, unlocked = 0;
  if (!meta.best || score > meta.best.score) { meta.best = { score, act: run.act, wave: run.wave, dread: run.dread, won, kills: run.stats.kills, loot: Math.round(run.vault) }; newBest = true; }
  if (won) { meta.wins++; meta.bestDread = Math.max(meta.bestDread == null ? -1 : meta.bestDread, run.dread); const nd = Math.min(DD.MAX_DREAD, run.dread + 1); if (nd > meta.dreadMax) { meta.dreadMax = nd; unlocked = nd; menuDread = nd; } }
  saveMeta();
  run.result = { won, score, newBest, unlocked, cleared };
  S.mode = 'over'; show(endScreen);
}
function saveRun() {
  const run = S.run; if (!run) return;
  run.uidN = uidN;
  lsSet(KEY_RUN, Object.assign({}, run, { structs: S.structs.map(s => ({ id: s.id, x: s.x, y: s.y, lvl: s.lvl, up: s.up })) }));
}
function continueRun() {
  const d = lsGet(KEY_RUN, null); if (!d) return false;
  S.demo = false; S.paused = false; const structs = d.structs || []; delete d.structs;
  S.run = d; uidN = Math.max(uidN, d.uidN || 1); G.refreshRelics(); G.loadMap(d.act);
  for (const s of structs) G.placeRaw(s.id, s.x, s.y, s.lvl, s.up);
  G.computeFields(); G.recomputeCombos(); S.sel = -1; seen = new Set(d.hand.map(c => c.uid));
  if (d.phase === 'reward' && d.offer) { S.mode = 'between'; computeLayout(); renderAll(); show(rewardScreen, 'main'); }
  else if (d.phase === 'relic' && d.relicOffer) { S.mode = 'between'; computeLayout(); renderAll(); show(relicScreen); }
  else if (d.phase === 'act') { S.mode = 'between'; computeLayout(); renderAll(); show(actScreen); }
  else { S.mode = 'build'; computeLayout(); renderAll(); hideScreen(); }
  return true;
}
function toMenu() {
  ++runToken; S.run = null; S.paused = false; S.sel = -1; hideTip(); G.demo(); computeLayout(); HUDV.go = null; show(menuScreen);
}
function pauseGame() { if (!inRun() || S.mode === 'over') return; S.paused = true; show(pauseScreen); }
function resumeGame() { S.paused = false; hideScreen(); }
function closeOverlay() { S.paused = false; hideScreen(); }
// rewards
function offerCards() {
  const act = S.run.act, ids = Object.keys(DD.CARDS), out = [];
  const W = { starter: 4, common: 10, uncommon: 6 + act * 2, rare: 2 + act * 2 };
  const exclude = new Set(['collapse']);
  while (out.length < 3) {
    let tot = 0; const pool = ids.filter(id => !exclude.has(id) && !out.some(o => o.id === id)); for (const id of pool) tot += W[DD.CARDS[id].rar];
    let r = Math.random() * tot, pick = pool[0]; for (const id of pool) { r -= W[DD.CARDS[id].rar]; if (r <= 0) { pick = id; break; } }
    out.push({ id: pick, up: Math.random() < 0.08 + act * 0.1 });
  }
  return out;
}
function offerRelics() { const pool = G.shuffle(Object.keys(DD.RELICS).filter(r => !S.run.relics.includes(r))); return pool.slice(0, 3); }
function afterReward() {
  const run = S.run; run.offer = null;
  if (DD.RELIC_AFTER.includes(run.wave + 1)) { run.relicOffer = offerRelics(); if (run.relicOffer.length) { run.phase = 'relic'; saveRun(); show(relicScreen); return; } }
  nextWave();
}
function nextWave() {
  const run = S.run; run.relicOffer = null; run.wave++;
  if (run.wave >= WPA) { startAct(run.act + 1); return; }
  beginBuild();
}

// ---------------------------------------------------------------- screens
function menuScreen() {
  const save = lsGet(KEY_RUN, null), b = meta.best;
  const dreadRow = meta.dreadMax > 0 ? `<div class="dread"><button class="btn sec small" data-act="dread" data-arg="-1">◀</button><b>${esc(t('dd_dread', { n: menuDread }))}</b><button class="btn sec small" data-act="dread" data-arg="1">▶</button></div><div class="muted center">${esc(t('dd_dreadHint'))}</div>` : '';
  return `<div class="box">
    <div class="logo"><div class="cards"><img src="${A.cardArt('lava')}" alt=""><img src="${A.cardArt('archer')}" alt=""><img src="${A.cardArt('golem')}" alt=""></div>
      <div class="t">${esc(t('dd_title'))}</div><div class="s">${esc(t('dd_sub'))}</div></div>
    <div class="menuBtns">
      ${save ? `<button class="btn" data-act="continue">${gi('play', '#1a1200')} ${esc(t('dd_continue'))}<small style="font-weight:600;opacity:.8">· ${esc(t('dd_continueAt', { a: actNo(save.act), w: save.wave + 1 }))}</small></button>` : ''}
      <button class="btn ${save ? 'sec' : ''}" data-act="newrun">${gi('card', save ? '#ffcc33' : '#1a1200')} ${esc(t('dd_newRun'))}</button>
      ${dreadRow}
      <div class="row" style="flex-wrap:nowrap"><button class="btn sec small sp" data-act="how">${esc(t('dd_howto'))}</button><button class="btn sec small sp" data-act="codex">${esc(t('dd_codex'))}</button><button class="btn sec small sp" data-act="records">${esc(t('dd_records'))}</button></div>
    </div>
    ${b ? `<div class="best"><span>${gi('trophy', '#ffcc33')} ${esc(t('dd_best'))}: <b>${b.score}</b></span><span>${esc(b.won ? t('dd_reachedVictory') : t('dd_reached', { a: actNo(b.act), w: b.wave + 1 }))}</span></div>` : ''}
    ${playerName ? `<p class="muted center">${esc(t('dd_playerName', { p: playerName }))}</p>` : ''}
    ${!touchy ? `<p class="muted center" style="font-size:11.5px">${esc(t('dd_keys'))}</p>` : ''}
  </div>`;
}
function howScreen(back) {
  const st = (icons, key) => `<div class="howstep"><div class="ic">${icons}</div><p>${esc(t(key))}</p></div>`;
  const im = (src) => `<img src="${src}" alt="">`;
  return `<div class="box wide"><h2>${gi('book', '#ffcc33')} ${esc(t('dd_howto'))}</h2>
    ${st(im(A.heroIcon('squire')) + im(A.glyphURL('coin', '#ffcc33')), 'dd_how1')}
    ${st(im(A.cardArt('spikes')) + im(A.cardArt('archer')), 'dd_how2')}
    ${st(im(A.cardArt('collapse')), 'dd_how3')}
    ${st(im(A.cardArt('archer')) + im(A.cardArt('lava')), 'dd_how4')}
    ${st(im(A.glyphURL('sack', '#ffcc33')) + im(A.heroIcon('rogue')), 'dd_how5')}
    ${st(im(A.glyphURL('card', '#c58bff')) + im(A.glyphURL('star', '#ffcc33')), 'dd_how6')}
    ${st(im(A.heroIcon('cleric')) + im(A.heroIcon('dwarf')), 'dd_how7')}
    ${st(im(A.glyphURL('gem', '#ffcc33')), 'dd_how8')}
    <div class="row center" style="margin-top:12px"><button class="btn" data-act="back" data-arg="${back || 'menu'}">${esc(t('dd_back'))}</button></div></div>`;
}
function codexScreen(tab, back) {
  tab = tab || 'combos';
  const tabs = ['combos', 'heroes', 'cards', 'relics'].map(k => `<button class="${k === tab ? 'on' : ''}" data-act="ctab" data-arg="${k}">${esc(t('dd_' + k))}</button>`).join('');
  let body = '';
  if (tab === 'combos') body = DD.COMBOS.map(c => {
    const found = meta.combos.includes(c.id), b = c.b[0];
    return `<div class="entry" style="--cc:${c.col}"><div class="ic"><img src="${A.cardArt(c.a)}" alt=""><span class="plus">+</span><img src="${A.cardArt(b)}" alt=""></div>
      <div class="bd"><b>${gi(c.g, c.col)} ${esc(kname(c.id))}</b><div>${esc(t('dd_kd_' + c.id))}</div></div><div class="ok">${found ? gi('star', '#ffcc33') : `<span class="muted" style="font-size:11px">${esc(t('dd_notYet'))}</span>`}</div></div>`;
  }).join('');
  else if (tab === 'heroes') body = DD.HERO_ORDER.map(c => { const d = DD.HEROES[c]; return `<div class="entry"><div class="ic"><img src="${A.heroIcon(c)}" alt="" style="width:34px;height:38px;background:none"></div>
      <div class="bd"><b>${esc(hname(c))}</b><div>${esc(t('dd_hd_' + c))}</div><div class="muted" style="display:flex;gap:10px;flex-wrap:wrap">${gi('heart', '#ff6a6a')} ${d.hp} ${gi('shield', '#c9d1de')} ${Math.round(d.ar * 100)}% ${gi('boot', '#9be7ff')} ${d.sp} ${gi('sack', '#ffcc33')} ${d.loot}</div></div></div>`; }).join('');
  else if (tab === 'cards') body = `<div class="grid">${Object.keys(DD.CARDS).map(id => cardHTML({ id, up: false }, { big: true, static: true })).join('')}</div>`;
  else body = Object.keys(DD.RELICS).map(r => `<div class="entry" style="--cc:${DD.RELICS[r].col}"><div class="ic"><img src="${A.glyphURL(DD.RELICS[r].g, DD.RELICS[r].col)}" alt="" style="background:none"></div><div class="bd"><b>${esc(t('dd_r_' + r))}</b><div>${esc(t('dd_rd_' + r))}</div></div>${S.run && S.run.relics.includes(r) ? gi('star', '#ffcc33') : ''}</div>`).join('');
  return `<div class="box wide"><h2>${gi('book', '#ffcc33')} ${esc(t('dd_codex'))}</h2><div class="tabs">${tabs}</div><div>${body}</div>
    <div class="row center" style="margin-top:12px"><button class="btn" data-act="back" data-arg="${back || 'menu'}">${esc(t('dd_back'))}</button></div></div>`;
}
function recordsScreen() {
  const b = meta.best;
  return `<div class="box"><h2>${gi('trophy', '#ffcc33')} ${esc(t('dd_records'))}</h2>
    <div class="stats"><div><b>${meta.runs}</b><small>${esc(t('dd_runs'))}</small></div><div><b>${meta.wins}</b><small>${esc(t('dd_wins'))}</small></div>
    <div><b>${meta.kills}</b><small>${esc(t('dd_totalKills'))}</small></div><div><b>${meta.bestDread == null ? t('dd_none') : meta.bestDread}</b><small>${esc(t('dd_bestDread'))}</small></div>
    <div><b>${meta.combos.length}/${DD.COMBOS.length}</b><small>${esc(t('dd_combos'))}</small></div></div>
    ${b ? `<h3>${esc(t('dd_best'))}</h3><div class="stats"><div><b>${b.score}</b><small>${esc(t('dd_sScore'))}</small></div><div><b>${b.won ? '★' : actNo(b.act) + '-' + (b.wave + 1)}</b><small>${esc(b.won ? t('dd_reachedVictory') : t('dd_reached', { a: actNo(b.act), w: b.wave + 1 }))}</small></div><div><b>${b.kills}</b><small>${esc(t('dd_sKills'))}</small></div><div><b>${t('dd_dread', { n: b.dread })}</b><small>${esc(t('dd_dreadLbl'))}</small></div></div>` : ''}
    <p class="muted">${esc(t('dd_runSaved'))}</p>
    <div class="row center"><button class="btn" data-act="back" data-arg="menu">${esc(t('dd_back'))}</button></div></div>`;
}
function pauseScreen() {
  return `<div class="box"><h2>${gi('pause', '#ffcc33')} ${esc(t('dd_paused'))}</h2><div class="menuBtns">
    <button class="btn" data-act="resume">${gi('play', '#1a1200')} ${esc(t('dd_resume'))}</button>
    <div class="row" style="flex-wrap:nowrap"><button class="btn sec small sp" data-act="sound">${gi(AU.on ? 'sound' : 'mute', '#eef0ff')} ${esc(t('dd_sound'))}: ${esc(t(AU.on ? 'dd_on' : 'dd_off'))}</button>
    <button class="btn sec small sp" data-act="music">${gi('note', '#eef0ff')} ${esc(t('dd_music'))}: ${esc(t(AU.music ? 'dd_on' : 'dd_off'))}</button></div>
    <div class="row" style="flex-wrap:nowrap"><button class="btn sec small sp" data-act="how" data-arg="pause">${esc(t('dd_howto'))}</button><button class="btn sec small sp" data-act="codex" data-arg="pause">${esc(t('dd_codex'))}</button><button class="btn sec small sp" data-act="deck">${esc(t('dd_viewDeck'))}</button></div>
    <button class="btn sec small" data-act="lang">${esc(getLang() === 'ar' ? 'English' : 'العربية')}</button>
    <button class="btn sec" data-act="menu">${gi('door', '#eef0ff')} ${esc(t('dd_mainMenu'))}</button>
    <button class="btn red small" data-act="abandon">${esc(t('dd_abandon'))}</button>
    <p class="muted center">${esc(t('dd_runSaved'))}</p></div></div>`;
}
function rewardScreen(stage) {
  const run = S.run;
  if (stage === 'remove' || stage === 'upgrade') {
    const list = run.deck.map((c, i) => [c, i]).filter(([c]) => stage === 'remove' || !c.up);
    return `<div class="box wide"><h2>${gi(stage === 'remove' ? 'skull' : 'star', '#ffcc33')} ${esc(t(stage === 'remove' ? 'dd_chooseRemove' : 'dd_chooseUpgrade'))}</h2>
      ${stage === 'remove' && run.deck.length <= 6 ? `<p class="bad" style="color:var(--red)">${esc(t('dd_minDeck'))}</p>` : ''}
      <div class="grid">${list.map(([c, i]) => cardHTML(c, { big: true, static: true, preview: stage === 'upgrade', act: stage === 'remove' ? 'rm' : 'upg', arg: i })).join('')}</div>
      <div class="row center"><button class="btn sec" data-act="rback">${esc(t('dd_back'))}</button></div></div>`;
  }
  return `<div class="box wide"><h2>${gi('star', '#5fdc7a')} ${esc(t('dd_cleared'))}</h2>
    <p class="muted">${esc(t('dd_bounty', { n: run.bountyWave || 0 }))} · ${gi('coin', '#ffcc33')} ${Math.round(run.vault)} · ${esc(t('dd_nCards', { n: run.deck.length }))}</p>
    <h3>${esc(t('dd_pickCard'))}</h3>
    <div class="grid">${(run.offer || []).map((c, i) => cardHTML(c, { big: true, static: true, act: 'pick', arg: i })).join('')}</div>
    <div class="row center"><span class="muted">${esc(t('dd_or'))}</span><button class="btn sec small" data-act="rmode" data-arg="remove" ${run.deck.length <= 6 ? 'disabled' : ''}>${gi('skull', '#eef0ff')} ${esc(t('dd_orRemove'))}</button>
    <button class="btn sec small" data-act="rmode" data-arg="upgrade" ${run.deck.every(c => c.up) ? 'disabled' : ''}>${gi('star', '#5fdc7a')} ${esc(t('dd_orUpgrade'))}</button>
    <button class="btn sec small" data-act="skip">${gi('coin', '#ffcc33')} ${esc(t('dd_skip', { n: 10 }))}</button></div></div>`;
}
function relicScreen() {
  const run = S.run;
  return `<div class="box wide"><h2>${gi('gem', '#c58bff')} ${esc(t('dd_relicTitle'))}</h2><p class="muted">${esc(t('dd_relicSub'))}</p>
    <div class="grid">${(run.relicOffer || []).map((r, i) => `<div class="relic" style="--rc:${DD.RELICS[r].col}" data-act="relic" data-arg="${i}"><img class="px" src="${A.glyphURL(DD.RELICS[r].g, DD.RELICS[r].col)}" alt=""><div><b>${esc(t('dd_r_' + r))}</b><div>${esc(t('dd_rd_' + r))}</div></div></div>`).join('')}</div></div>`;
}
function actScreen() {
  const run = S.run, boss = G.waveDef(run.act, WPA - 1, run.dread).find(g => DD.HEROES[g[0]].boss)[0];
  return `<div class="box center" style="text-align:center"><div class="muted" style="letter-spacing:3px;font-weight:800">${esc(t('dd_actIntro', { n: actNo(run.act) }))}</div>
    <h2 style="justify-content:center;font-size:30px;margin:6px 0">${esc(t(DD.MAPS[run.act].name))}</h2>
    <p>${esc(t(run.act === 0 ? 'dd_actWelcome' : 'dd_nextAct'))}</p>
    <div class="entry" style="justify-content:center;margin:12px auto;max-width:360px"><img src="${A.heroIcon(boss)}" class="px" style="width:40px;height:44px"><div class="bd"><b>${esc(t('dd_bossIs', { p: hname(boss) }))}</b><div>${esc(t('dd_hd_' + boss))}</div></div></div>
    ${run.dread ? `<p style="color:#ff8a9a;font-weight:700">${esc(t('dd_dread', { n: run.dread }))}</p>` : ''}
    <button class="btn" data-act="enter">${gi('door', '#1a1200')} ${esc(t('dd_enter'))}</button></div>`;
}
function endScreen() {
  const run = S.run, r = run.result, s = run.stats, mm = Math.floor(s.time / 60), ss = Math.floor(s.time % 60);
  return `<div class="box" style="text-align:center"><h2 style="justify-content:center;font-size:28px;color:${r.won ? '#ffcc33' : '#ff6a7a'}">${gi(r.won ? 'trophy' : 'skull', r.won ? '#ffcc33' : '#ff6a7a')} ${esc(t(r.won ? 'dd_victory' : 'dd_defeat'))}</h2>
    <p>${esc(t(r.won ? 'dd_victorySub' : 'dd_defeatSub'))}</p>
    <p class="muted">${esc(r.won ? t('dd_reachedVictory') : t('dd_reached', { a: actNo(run.act), w: run.wave + 1 }))}${run.dread ? ' · ' + esc(t('dd_dread', { n: run.dread })) : ''}</p>
    ${r.newBest ? `<p style="color:#ffcc33;font-weight:900">${gi('star', '#ffcc33')} ${esc(t('dd_newBest'))}</p>` : ''}
    ${r.unlocked ? `<p style="color:#ff8a9a;font-weight:900">${esc(t('dd_unlocked', { n: r.unlocked }))}</p>` : ''}
    <div class="stats"><div><b>${r.score}</b><small>${esc(t('dd_sScore'))}</small></div><div><b>${s.kills}</b><small>${esc(t('dd_sKills'))}</small></div>
    <div><b>${Math.round(Math.max(0, run.vault))}</b><small>${esc(t('dd_sLoot'))}</small></div><div><b>${s.stolen}</b><small>${esc(t('dd_sStolen'))}</small></div>
    <div><b>${s.recovered}</b><small>${esc(t('dd_sRecovered'))}</small></div><div><b>${s.combos}</b><small>${esc(t('dd_sCombos'))}</small></div>
    <div><b>${s.cards}</b><small>${esc(t('dd_sCards'))}</small></div><div><b>${mm}:${String(ss).padStart(2, '0')}</b><small>${esc(t('dd_sTime'))}</small></div></div>
    ${meta.best ? `<p class="muted">${esc(t('dd_best'))}: ${meta.best.score}</p>` : ''}
    <div class="row center"><button class="btn" data-act="again">${gi('play', '#1a1200')} ${esc(t('dd_tryAgain'))}</button><button class="btn sec" data-act="menu">${esc(t('dd_mainMenu'))}</button></div></div>`;
}
function deckScreen() {
  const run = S.run, order = ['tower', 'trap', 'monster', 'room', 'spell'];
  const list = run.deck.slice().sort((a, b) => order.indexOf(DD.CARDS[a.id].kind) - order.indexOf(DD.CARDS[b.id].kind) || a.id.localeCompare(b.id));
  return `<div class="box wide"><h2>${gi('card', '#ffcc33')} ${esc(t('dd_deck'))} <span class="muted">(${run.deck.length})</span></h2>
    <p class="muted">${esc(t('dd_drawN', { n: run.draw.length }))} · ${esc(t('dd_handN', { n: run.hand.length }))} · ${esc(t('dd_discardN', { n: run.discard.length }))}</p>
    <div class="grid">${list.map(c => cardHTML(c, { big: true, static: true })).join('')}</div>
    <div class="row center"><button class="btn" data-act="closeov">${esc(t('dd_close'))}</button></div></div>`;
}
function confirmScreen(msg, yes) { return `<div class="box" style="text-align:center"><p style="font-size:16px">${esc(msg)}</p><div class="row center"><button class="btn red" data-act="${yes}">${esc(t('dd_yes'))}</button><button class="btn sec" data-act="nope">${esc(t('dd_no'))}</button></div></div>`; }

const ACT = {
  continue() { continueRun(); },
  newrun() { if (lsGet(KEY_RUN, null)) show(confirmScreen, t('dd_overwrite'), 'newrunyes'); else newRun(menuDread); },
  newrunyes() { newRun(menuDread); },
  nope() { if (inRun()) show(pauseScreen); else show(menuScreen); },
  dread(d) { menuDread = clamp(menuDread + +d, 0, meta.dreadMax); show(menuScreen); },
  how(back) { show(howScreen, back || 'menu'); },
  codex(back) { show(codexScreen, 'combos', back || 'menu'); },
  ctab(tab) { show(codexScreen, tab, curScreen.args[1]); },
  records() { show(recordsScreen); },
  back(where) { if (where === 'pause') show(pauseScreen); else if (where === 'game') closeOverlay(); else show(menuScreen); },
  resume() { resumeGame(); },
  lang() { setLang(getLang() === 'ar' ? 'en' : 'ar'); },
  sound() { AU.setOn(!AU.on); settings.sound = AU.on; saveSet(); show(pauseScreen); },
  music() { AU.setMusic(!AU.music); settings.music = AU.music; saveSet(); show(pauseScreen); },
  deck() { show(deckScreen); },
  closeov() { closeOverlay(); },
  menu() { if (S.run && S.mode !== 'over' && S.run.phase === 'build' && S.mode === 'build') saveRun(); toMenu(); },
  abandon() { show(confirmScreen, t('dd_confirmAbandon'), 'abandonyes'); },
  abandonyes() { lsDel(KEY_RUN); toMenu(); },
  enter() { beginBuild(); },
  pick(i) { const c = S.run.offer[+i]; S.run.deck.push({ uid: uidN++, id: c.id, up: c.up }); sfx('combo'); afterReward(); },
  rmode(m) { show(rewardScreen, m); },
  rback() { show(rewardScreen, 'main'); },
  rm(i) { const run = S.run; if (run.deck.length <= 6) { toast(t('dd_minDeck')); return; } const [c] = run.deck.splice(+i, 1); run.draw = run.draw.filter(x => x.uid !== c.uid); run.discard = run.discard.filter(x => x.uid !== c.uid); sfx('fire'); afterReward(); },
  upg(i) { const c = S.run.deck[+i]; c.up = true; for (const pile of [S.run.draw, S.run.discard]) for (const x of pile) if (x.uid === c.uid) x.up = true; sfx('combo'); afterReward(); },
  skip() { S.run.vault += 10; sfx('coin'); afterReward(); },
  relic(i) { const r = S.run.relicOffer[+i]; S.run.relics.push(r); G.refreshRelics(); sfx('win'); toast(t('dd_r_' + r) + ': ' + t('dd_rd_' + r), true); nextWave(); },
  again() { const d = S.run ? S.run.dread : menuDread; newRun(Math.min(d, meta.dreadMax)); }
};
$('scr').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; AU.init(); sfx('click'); const f = ACT[b.dataset.act]; if (f) f(b.dataset.arg); });

document.addEventListener('langchange', () => {
  for (const k in HUDV) delete HUDV[k]; incSig = ''; renderAll(); if (curScreen) show(curScreen.fn, ...curScreen.args); hideTip();
});
const onReady = () => { try { playerName = (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { playerName = ''; } if (curScreen && curScreen.fn === menuScreen) show(menuScreen); };
document.addEventListener('mal3abready', onReady); if (window.Mal3abReady) onReady();

// ---------------------------------------------------------------- main loop
const STEP = 1 / 60; let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const running = (S.demo || (S.mode === 'wave' && !S.paused)) && !(S.paused);
  const mul = S.demo ? 1 : S.speed;
  if (running) { acc += dt * mul; let n = 0; while (acc >= STEP && n < 12) { G.step(STEP); acc -= STEP; n++; } if (n >= 12) acc = 0; }
  G.fx(running ? dt * mul : (S.paused ? 0 : dt));
  try { G.render(ctx); } catch (e) { console.error(e); }
  if (inRun()) { updateHUD(); if (S.mode === 'wave') renderInfo(); if (S.run && S.mode !== 'over') renderHand(); renderIncoming(); }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- boot
function boot() {
  initIcons(); G.demo(); computeLayout(); show(menuScreen); updateHUD();
  document.body.addEventListener('pointerdown', () => AU.init(), { once: true });
  requestAnimationFrame(frame);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

// ---------------------------------------------------------------- test / scripting API
window.DeckOfDungeons = {
  get state() { return S; }, get run() { return S.run; }, get meta() { return meta; }, data: DD, game: G,
  screen: () => curScreen ? curScreen.fn.name : (inRun() ? S.mode : 'none'),
  newRun: (d) => newRun(d || 0), continueRun, enterAct: () => ACT.enter(), startWave: () => goWave(), menu: toMenu,
  hand: () => S.run ? S.run.hand.map(c => c.id + (c.up ? '+' : '')) : [],
  canPlay: (i, x, y) => G.canPlay(i, x, y),
  play: (i, x, y) => { S.sel = i; const ok = i != null && S.run.hand[i] ? tryPlay(x, y) : false; S.sel = -1; renderAll(); return ok; },
  playId: (id, x, y) => { const i = S.run.hand.findIndex(c => c.id === id); return i < 0 ? false : window.DeckOfDungeons.play(i, x, y); },
  give: (id, up) => { S.run.hand.push({ uid: uidN++, id, up: !!up }); renderAll(); },
  setMana: (n) => { S.run.mana = n; renderAll(); }, setVault: (n) => { S.run.vault = n; },
  simulate: (sec) => { let n = Math.round(sec / STEP); while (n-- > 0 && S.mode === 'wave') { G.step(STEP); G.fx(STEP); } return S.mode; },
  killAll: () => { S.spawnQ = []; for (const h of S.heroes.slice()) G.hurt(h, 1e7, 'true'); },
  pickCard: (i) => ACT.pick(i || 0), removeCard: (i) => ACT.rm(i || 0), upgradeCard: (i) => ACT.upg(i || 0), skip: () => ACT.skip(), pickRelic: (i) => ACT.relic(i || 0),
  pause: pauseGame, resume: resumeGame, setSpeed: (n) => { S.speed = clamp(n, 1, 3); }, select, path: () => G.pathTiles(),
  layout: () => G.layout(), tileCenter: (x, y) => { const L = G.layout(); const [sx, sy] = G.P(x + 0.5, y + 0.5); return { x: sx, y: sy, T: L.T }; }
};
})();
