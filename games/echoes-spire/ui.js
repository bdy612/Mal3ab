'use strict';
// =====================================================================
// Echoes of the Spire — DOM UI, input (mouse / touch / keyboard), layout,
// main loop, and the window.EchoesSpire test API
// =====================================================================
const $ = (id) => document.getElementById(id);
const cv = $('c'), cx = cv.getContext('2d');
const UI = window.UI = { armed: 'bell', note: 0, sel: null, modal: null, tutStep: -1 };
const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const ROMAN_EN = ['I', 'II', 'III', '∞'], ROMAN_AR = ['1', '2', '3', '∞'];
const ROMAN = new Proxy([], { get: (o, k) => (getLang() === 'ar' ? ROMAN_AR : ROMAN_EN)[k] });
const noteName = (n) => t('es_n' + n);
const homeHref = '../../play.html';
const goHome = () => { location.href = homeHref; };

// ---------------------------------------------------------------- layout
function layout() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  let x0 = 0, y0 = 0, x1 = w, y1 = h;
  if (G.phase !== 'menu') {
    const hr = $('hud').getBoundingClientRect(); y0 = hr.bottom + 2;
    const dr = $('dock').getBoundingClientRect();
    if (dr.width > 0) { if (dr.height > h * 0.45 && dr.width < w * 0.4) x0 = dr.right + 2; else y1 = dr.top - 2; }
  } else { y0 = h * 0.04; }
  if (!G.map) return;
  const aw = Math.max(50, x1 - x0), ah = Math.max(50, y1 - y0);
  const s = Math.min(aw / (G.map.W + 24), ah / (G.map.H + 70));
  G.view = { dpr, cw: w, ch: h, s, ox: x0 + aw / 2, oy: y0 + ah / 2 + 6 * s, x0, y0, x1, y1 };
  G.staticDirty = true;
}
const toWorld = (sx, sy) => ({ x: (sx - G.view.ox) / G.view.s, y: (sy - G.view.oy) / G.view.s });
function nearestSocket(wx, wy) {
  const maxD = Math.max(SOCK * 0.62, 24 / G.view.s);
  let best = null, bd = maxD * maxD;
  for (const s of G.map.sockets) { const d = dist2(s.x, s.y, wx, wy); if (d < bd) { bd = d; best = s; } }
  return best;
}

// ---------------------------------------------------------------- HUD + dock
const cache = {};
function setText(id, v) { if (cache[id] !== v) { cache[id] = v; const el = $(id); if (el) el.textContent = v; } }
function actLabel() { return G.act <= 3 ? t('es_actS', { n: ROMAN[G.act - 1] }) : t('es_endlessS'); }
function hudTick() {
  if (G.phase === 'menu') return;
  setText('hpV', String(Math.ceil(G.hp))); setText('hpM', '/' + G.maxHp); setText('shV', String(G.shards));
  setText('wvA', actLabel()); setText('wvV', G.act <= 3 ? G.wave + '/' + WAVES_PER_ACT : String(G.wave));
  const bn = G.beatT > 0.35 ? G.beatN : -1;
  if (cache.beat !== bn) { cache.beat = bn; document.querySelectorAll('#beat i').forEach((el, i) => el.classList.toggle('on', i === bn)); }
  if (G.boss) { const k = clamp(G.boss.hp / G.boss.max, 0, 1); const v = Math.round(k * 1000) / 10 + '%'; if (cache.boss !== v) { cache.boss = v; $('bossFill').style.width = v; } }
  if (cache.sh2 !== G.shards) {
    if (cache.sh2 != null && G.shards > cache.sh2) { const p = $('shPill'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
    cache.sh2 = G.shards; refreshAfford();
  }
  if (cache.hp2 !== G.hp) { if (cache.hp2 != null && G.hp < cache.hp2) { const p = $('hpPill'); p.classList.remove('hurt'); void p.offsetWidth; p.classList.add('hurt'); } cache.hp2 = G.hp; }
  const go = $('goBtn');
  let gt;
  if (G.phase === 'build') gt = '▶ ' + t('es_start');
  else if (G.phase === 'wave') gt = '👾 ' + (G.spawnQ.length - G.spawnIdx + G.enemies.length);
  else gt = '…';
  if (cache.go !== gt + G.phase) { cache.go = gt + G.phase; go.textContent = gt; go.classList.toggle('idle', G.phase !== 'build'); }
}
function buildPalette() {
  $('notes').innerHTML = NOTES.map((n, i) => `<button class="nt${i === UI.note ? ' on' : ''}" data-n="${i}" style="--c:${n.col}" title="${esc(noteName(i))} (${n.k})">${esc(noteName(i))}</button>`).join('');
  $('roles').innerHTML = ROLE_ORDER.map((r, i) => {
    const lock = !G.unlocked.includes(r);
    return `<button class="rl${UI.armed === r ? ' on' : ''}${lock ? ' lock' : ''}" data-r="${r}" title="${esc(t('es_r_' + r))} — ${esc(t('es_rd_' + r))}"><i class="k">${i + 1}</i>${lock ? '<span class="lk">🔒</span>' : `<img src="${resIcon(r, UI.note)}" alt="">`}<span>${esc(t('es_r_' + r))}</span><b>${lock ? '—' : costOf(r) + '◆'}</b></button>`;
  }).join('');
  refreshAfford();
}
function refreshAfford() {
  document.querySelectorAll('#roles .rl').forEach(b => { const r = b.dataset.r; b.classList.toggle('poor', G.unlocked.includes(r) && G.shards < costOf(r)); });
  if (UI.sel) renderInsp();
}
$('notes').addEventListener('click', (e) => { const b = e.target.closest('.nt'); if (!b) return; setNote(+b.dataset.n); });
$('roles').addEventListener('click', (e) => { const b = e.target.closest('.rl'); if (!b) return; armRole(b.dataset.r); });
$('goBtn').addEventListener('click', () => { ESAudio.init(); if (G.phase === 'build') beginWave(); });
function setNote(n) {
  UI.note = n; ESAudio.sfx('retune', n);
  document.querySelectorAll('#notes .nt').forEach((b, i) => b.classList.toggle('on', i === n));
  document.querySelectorAll('#roles .rl img').forEach(img => { img.src = resIcon(img.closest('.rl').dataset.r, n); });
  G.ghost = null;
}
function armRole(r) {
  if (!G.unlocked.includes(r)) { ESAudio.sfx('error'); toast(t('es_locked')); return; }
  UI.armed = UI.armed === r ? null : r; ESAudio.sfx('click');
  document.querySelectorAll('#roles .rl').forEach(b => b.classList.toggle('on', b.dataset.r === UI.armed));
  select(null); G.ghost = null;
}
function beginWave() {
  if (!startWave()) return;
  select(null); G.preview = null;
  if (UI.tutStep >= 0 && UI.tutStep < 9) { UI.tutStep = 9; G.profile.tut = 1; saveProfile(); }
}

// ---------------------------------------------------------------- inspector
function select(r) {
  UI.sel = r || null;
  $('insp').hidden = !r; $('palette').hidden = !!r;
  if (r) { renderInsp(); ESAudio.sfx('click'); }
}
function statsLine(r) {
  const R = ROLES[r.role], range = Math.round(rangeOf(r));
  const parts = [];
  if (r.role === 'bell') parts.push('💥 ' + Math.round(R.dmg * r.mult), '◎ ' + range);
  if (r.role === 'harp') parts.push('⚡ ' + Math.round(R.dmg * r.mult), '◎ ' + range);
  if (r.role === 'hum') parts.push('❄ ' + Math.round((R.slow[r.lvl - 1] + (has('frost') ? 0.15 : 0)) * 100) + '%', '💥 ' + Math.round(R.dmg * r.mult * (has('frost') ? 2 : 1)), '◎ ' + range);
  if (r.role === 'ward') parts.push('↩ ' + R.push[r.lvl - 1], '💥 ' + Math.round(R.dmg * r.mult), '◎ ' + range);
  if (r.role === 'echo') parts.push('✦ +' + Math.round(R.amp[r.lvl - 1] * 100) + '%', '🔗 ' + Math.round(linkR(r)));
  return parts.join(' · ');
}
function harmBadges(r) {
  const b = [];
  if (r.group && r.group.size === 2) b.push(['🛡 ' + t('es_h_shield'), NOTES[r.note].col]);
  if (r.group && r.group.size >= 3) b.push(['💥 ' + t('es_h_blast') + ' ×' + r.group.size, NOTES[r.note].col]);
  if (r.fifths) b.push(['⟷ ' + t('es_h_fifth') + (r.fifths > 1 ? ' ×' + r.fifths : ''), '#ffffff']);
  for (const c of r.chordSet || []) b.push([({ radiant: '☀ ', lament: '☾ ', sus: '∿ ' })[c] + t('es_h_' + c), CHORDS[c].col]);
  if (r.amp > 0) b.push(['✦ +' + Math.round(Math.min(1, r.amp) * 100) + '%', '#ffd678']);
  if (r.silenced) b.push(['🤫 ' + t('es_silenced'), '#9fb4ff']);
  if (!b.length) return `<i class="none">${esc(t('es_noHarm'))}</i>`;
  return b.map(([s, c]) => `<em style="--c:${c}">${esc(s)}</em>`).join('');
}
function renderInsp() {
  const r = UI.sel;
  if (!r || !G.res.includes(r)) { select(null); return; }
  const up = upgCost(r), sv = sellValue(r);
  const key = [r.id, r.lvl, r.note, G.shards >= (up || 0), sv, r.mult, r.silenced, getLang(), G.links.length, G.chords.length].join('|');
  if (UI.inspKey === key && !$('insp').hidden) return;
  UI.inspKey = key;
  $('insp').innerHTML = `
    <div class="ihead"><img src="${resIcon(r.role, r.note)}" alt="">
      <div class="iname"><b>${esc(t('es_r_' + r.role))} <small>${esc(t('es_lv', { n: r.lvl }))}</small></b><span class="st">${statsLine(r)}</span><span class="hz">${harmBadges(r)}</span></div>
      <button class="ib ix" title="Esc">✕</button></div>
    <div class="irow"><div class="inotes">${NOTES.map((n, i) => `<button class="nt sm${i === r.note ? ' on' : ''}" data-n="${i}" style="--c:${n.col}">${esc(noteName(i))}</button>`).join('')}</div>
      <button class="btn iup" ${up == null || G.shards < up ? 'disabled' : ''}>${up == null ? esc(t('es_max')) : '⬆ ' + esc(t('es_upgrade')) + ' <b>' + up + '◆</b>'}</button>
      <button class="btn sec isell">${esc(t('es_sell'))} <b>+${sv}◆</b></button></div>`;
}
$('insp').addEventListener('click', (e) => {
  const r = UI.sel; if (!r) return;
  if (e.target.closest('.ix')) { select(null); return; }
  const n = e.target.closest('.nt'); if (n) { retuneRes(r, +n.dataset.n); UI.inspKey = null; renderInsp(); return; }
  if (e.target.closest('.iup')) { if (!upgradeRes(r)) { ESAudio.sfx('error'); toast(t('es_noShards')); } UI.inspKey = null; renderInsp(); return; }
  if (e.target.closest('.isell')) { const v = sellRes(r); floatText(r.x, r.y - 30, '+' + v + '◆', '#ffd166', 14); select(null); }
});

// ---------------------------------------------------------------- toasts, banners, boss bar
function toast(msg, ms) {
  const box = $('toasts');
  const small = innerWidth < 761 || innerHeight < 500;
  while (box.children.length > (small ? 0 : 1)) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = msg; box.appendChild(d);
  d.onclick = () => d.remove();
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 400); }, ms || 3200);
}
let bannerTm = 0;
function banner(title, sub) {
  $('bnT').textContent = title || ''; $('bnS').textContent = sub || '';
  const b = $('banner'); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  clearTimeout(bannerTm); bannerTm = setTimeout(() => b.classList.remove('show'), 2300);
}
UI.toast = toast;
UI.banner = banner;
UI.bossName = (type) => t('es_e_' + type);
UI.bossLine = (type) => t('es_ed_' + type);
UI.bossBar = (e) => { $('bossbar').hidden = !e; if (e) { $('bossName').textContent = '☠ ' + t('es_e_' + e.type); cache.boss = null; } };
UI.discover = (k) => { toast(`✨ ${esc(t('es_disc'))} <b>${esc(t('es_h_' + k))}</b><br><small>${esc(t('es_hd_' + k))}</small>`, 5200); };
UI.newEnemy = (type) => { if (ENEMIES[type].boss) return; toast(`<img class="ti" src="${enemyIcon(type)}" alt=""> <b>${esc(t('es_e_' + type))}</b> — ${esc(t('es_ed_' + type))}`, 5200); };
UI.structure = () => { UI.inspKey = null; if (UI.sel) renderInsp(); };
UI.act = () => { G.later.push({ t: G.t + 0.2, fn: () => banner(G.act <= 3 ? t('es_actN', { n: ROMAN[G.act - 1] }) : t('es_endlessT'), t('es_act' + Math.min(G.act, 4))) }); };

// ---------------------------------------------------------------- phases
UI.phase = () => {
  const inGame = G.phase !== 'menu';
  const wasHidden = $('hud').hidden;
  $('menu').hidden = inGame; $('hud').hidden = !inGame; $('dock').hidden = !inGame;
  if (!inGame) { select(null); $('bossbar').hidden = true; }
  if (G.phase === 'build') { G.preview = wavePreview(); buildPalette(); }
  else if (G.phase !== 'wave') G.preview = null;
  if (UI.sel && !G.res.includes(UI.sel)) select(null);
  if (G.phase !== 'build' && G.phase !== 'wave') G.ghost = null;
  renderRelics();
  cache.go = null;
  if (wasHidden !== $('hud').hidden || !G.view || G.staticDirty) layout();
  if (G.phase === 'build' && UI.tutStep === -1 && !G.profile.tut) { UI.tutStep = 0; setTimeout(() => toast('👆 ' + esc(t('es_tut1')), 7000), 900); }
};
function renderRelics() {
  $('relics').innerHTML = G.relics.map(id => `<span title="${esc(t('es_rl_' + id))} — ${esc(t('es_rld_' + id))}">${RELIC_BY[id].ic}</span>`).join('');
}
$('relics').addEventListener('click', () => { if (G.phase === 'wave' || G.phase === 'build') openPause(); });

// ---------------------------------------------------------------- modals
function showModal(html, kind) {
  UI.modal = kind; $('mbox').innerHTML = html; $('modal').hidden = false; $('mbox').scrollTop = 0;
  $('mbox').querySelectorAll('[data-home]').forEach(h => { h.onclick = goHome; });
  if (window.Mal3abPopButtons) window.Mal3abPopButtons();   // re-add 🏠 + 💬 bar (#mbox has data-m3pop)
}
function hideModal() { UI.modal = null; $('modal').hidden = true; $('mbox').innerHTML = ''; }
const btn = (cls, act, label) => `<button class="btn ${cls}" data-act="${act}">${label}</button>`;
UI.draft = () => {
  const after = G.nextAct || (G.draft && G.draft.every(b => b.kind === 'relic') && isBossWave());
  const cards = G.draft.map((b, i) => {
    let ic, title, desc, tag, cls = b.kind;
    if (b.kind === 'unlock') { ic = `<img src="${resIcon(b.role, i % 5)}" alt="">`; title = t('es_r_' + b.role); desc = t('es_rd_' + b.role); tag = t('es_tagNew'); }
    else if (b.kind === 'relic') { ic = `<span class="ic">${RELIC_BY[b.id].ic}</span>`; title = t('es_rl_' + b.id); desc = t('es_rld_' + b.id); tag = t('es_tagRelic'); }
    else if (b.kind === 'shards') { ic = '<span class="ic shard">◆</span>'; title = t('es_bShards', { n: b.n }); desc = t('es_bShardsD'); tag = t('es_tagBoon'); }
    else if (b.kind === 'repair') { ic = '<span class="ic">💠</span>'; title = t('es_bRepair', { n: b.n }); desc = t('es_bRepairD'); tag = t('es_tagBoon'); }
    else { ic = `<img src="${resIcon(b.role, 2)}" alt="">`; title = t('es_bAttune', { p: t('es_r_' + b.role) }); desc = t('es_bAttuneD', { p: t('es_r_' + b.role), n: (G.attune[b.role] + 1) * 15 }); tag = t('es_tagBoon'); }
    return `<button class="card ${cls}" data-pick="${i}"><i class="kk">${i + 1}</i>${ic}<div class="txt"><span class="tag">${esc(tag)}</span><b>${esc(title)}</b><p>${esc(desc)}</p></div></button>`;
  }).join('');
  showModal(`<h2>${esc(after ? t('es_actClear') : t('es_chooseBoon'))}</h2><p class="sub">${esc(after ? t('es_relicPick') : t('es_boonSub'))}</p><div class="cards">${cards}</div>`, 'draft');
};
function openPause() {
  if (!(G.phase === 'build' || G.phase === 'wave' || G.phase === 'cleared')) return;
  G.paused = true;
  const rel = G.relics.length ? `<div class="rlist">${G.relics.map(id => `<div><span>${RELIC_BY[id].ic}</span><div><b>${esc(t('es_rl_' + id))}</b><small>${esc(t('es_rld_' + id))}</small></div></div>`).join('')}</div>` : '';
  const att = ROLE_ORDER.filter(r => G.attune[r]).map(r => `${esc(t('es_r_' + r))} +${G.attune[r] * 15}%`).join(' · ');
  showModal(`<h2><i class="pz"></i> ${esc(t('es_paused'))}</h2><p class="sub">${esc(actLabel())} · ${esc(G.act <= 3 ? t('es_waveN', { n: G.wave, m: WAVES_PER_ACT }) : t('es_endlessN', { n: G.wave }))}${G.asc ? ' · ' + esc(t('es_asc', { n: G.asc })) : ''}</p>
    <div class="col">${btn('big', 'resume', '▶ ' + esc(t('es_resume')))}${btn('sec', 'how', '❓ ' + esc(t('es_how')))}
    <div class="row2">${btn('sec', 'snd', G.settings.mute ? '🔇 ' + esc(t('es_soundOff')) : '🔊 ' + esc(t('es_soundOn')))}<button class="btn sec langbtn" data-act="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button></div>
    ${btn('sec', 'menu', '↩ ' + esc(t('es_toMenu')))}${btn('sec danger', 'restart', '⟳ ' + esc(t('es_restart')))}</div>
    ${rel ? `<h3>${esc(t('es_relics'))}</h3>${rel}` : ''}${att ? `<p class="sub">${esc(t('es_attunedL'))}: ${att}</p>` : ''}
    <p class="sub tiny">${esc(t('es_saveNote'))}</p>`, 'pause');
}
function resume() { G.paused = false; hideModal(); }
function openHow(back) {
  const P = G.profile, disc = new Set(P.codex);
  const chip = (n) => `<i class="chip" style="--c:${NOTES[n].col}">${esc(noteName(n))}</i>`;
  const hNotes = { shield: [0, 0], blast: [3, 3, 3], fifth: [0, 3], radiant: CHORDS.radiant.notes, lament: CHORDS.lament.notes, sus: CHORDS.sus.notes, grand: [0, 1, 2, 3, 4] };
  const harm = HARMONIES.map(k => `<div class="hrow${disc.has(k) ? ' got' : ''}"><div class="chips">${hNotes[k].map(chip).join('')}</div><div><b>${esc(t('es_h_' + k))}${disc.has(k) ? ' ✓' : ''}</b><small>${esc(t('es_hd_' + k))}</small></div></div>`).join('');
  const roles = ROLE_ORDER.map(r => `<div class="hrow"><img src="${resIcon(r, 3)}" alt=""><div><b>${esc(t('es_r_' + r))} <span class="cost">${ROLES[r].cost}◆</span></b><small>${esc(t('es_rd_' + r))}</small></div></div>`).join('');
  const foes = ENEMY_ORDER.concat(BOSSES).map(e => `<div class="hrow sm${P.seen.includes(e) ? '' : ' unseen'}"><img src="${enemyIcon(e)}" alt=""><div><b>${esc(t('es_e_' + e))}</b><small>${esc(t('es_ed_' + e))}</small></div></div>`).join('');
  const isTouch = matchMedia('(pointer: coarse)').matches;
  showModal(`<h2>❓ ${esc(t('es_how'))}</h2>
    <p class="lead">${esc(t('es_howGoal'))}</p>
    <ul class="howl"><li>${esc(t('es_how1'))}</li><li>${esc(t('es_how2'))}</li><li>${esc(t('es_how3'))}</li><li>${esc(t('es_how4'))}</li><li>${esc(t('es_how5'))}</li></ul>
    <h3>🎼 ${esc(t('es_harmonies'))} <small>${disc.size}/${HARMONIES.length}</small></h3><p class="sub l">${esc(t('es_harmIntro'))}</p>${harm}
    <h3>🔔 ${esc(t('es_resonators'))}</h3>${roles}
    <h3>👾 ${esc(t('es_foes'))}</h3><div class="grid2">${foes}</div>
    <h3>⌨ ${esc(t('es_controls'))}</h3><p class="sub l">${esc(isTouch ? t('es_ctlTouch') : t('es_ctlPc'))}</p>
    <div class="col">${btn('big', back === 'pause' ? 'backPause' : 'close', esc(t('es_gotIt')))}</div>`, 'how');
}
UI.gameover = () => {
  const P = G.profile, b = P.best, isBest = b && b.score === G.score && G.score > 0;
  showModal(`<h2 class="red">💔 ${esc(t('es_fallen'))}</h2><p class="sub">${esc(t('es_reached', { p: reachLabel(runSummary()) }))}</p>
    <div class="statg"><div><b>${G.score}</b><span>${esc(t('es_score'))}</span></div><div><b>${G.kills}</b><span>${esc(t('es_kills'))}</span></div><div><b>${b ? b.score : 0}</b><span>${esc(t('es_best'))}</span></div></div>
    ${isBest ? `<p class="newbest">🏆 ${esc(t('es_newBest'))}</p>` : ''}
    <div class="col">${btn('big', 'again', '⟳ ' + esc(t('es_tryAgain')))}${btn('sec', 'menu', '↩ ' + esc(t('es_toMenu')))}</div>`, 'over');
};
UI.victory = () => {
  const P = G.profile;
  showModal(`<h2>🌟 ${esc(t('es_victory'))}</h2><p class="sub">${esc(t('es_victorySub'))}</p>
    <div class="statg"><div><b>${G.score}</b><span>${esc(t('es_score'))}</span></div><div><b>${G.kills}</b><span>${esc(t('es_kills'))}</span></div><div><b>${Math.ceil(G.hp)}/${G.maxHp}</b><span>${esc(t('es_spire'))}</span></div></div>
    ${P.ascMax > G.asc ? `<p class="newbest">⛰ ${esc(t('es_ascUnlocked', { n: P.ascMax }))}</p>` : ''}
    <div class="col">${btn('big', 'endless', '∞ ' + esc(t('es_goEndless')))}${btn('sec', 'menu', '↩ ' + esc(t('es_toMenu')))}</div>`, 'won');
};
function reachLabel(s) {
  if (!s) return '—';
  if (s.endless) return t('es_endlessN', { n: s.endless });
  return t('es_actS', { n: ROMAN[s.act - 1] }) + ' · ' + t('es_waveN', { n: s.wave, m: WAVES_PER_ACT });
}
function confirmBox(msg, yes, onYes) {
  UI.onConfirm = onYes;
  showModal(`<p class="lead c">${esc(msg)}</p><div class="row2">${btn('', 'yes', esc(yes))}${btn('sec', 'no', esc(t('es_cancel')))}</div>`, 'confirm');
}
$('modal').addEventListener('click', (e) => {
  const pk = e.target.closest('[data-pick]');
  if (pk && UI.modal === 'draft') { if (pickBoon(+pk.dataset.pick)) hideModal(); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  ESAudio.init();
  switch (a.dataset.act) {
    case 'resume': resume(); break;
    case 'how': openHow('pause'); break;
    case 'backPause': openPause(); break;
    case 'close': hideModal(); break;
    case 'snd': toggleMute(); openPause(); break;
    case 'lang': setLang(getLang() === 'ar' ? 'en' : 'ar'); break;
    case 'menu': hideModal(); toMenu(); break;
    case 'restart': confirmBox(t('es_restartQ'), t('es_restart'), () => startRun({ asc: G.asc })); break;
    case 'again': hideModal(); startRun({ asc: G.asc }); break;
    case 'endless': hideModal(); goEndless(); break;
    case 'yes': { const f = UI.onConfirm; hideModal(); if (f) f(); break; }
    case 'no': hideModal(); if (G.phase !== 'menu') { G.paused = false; } break;
  }
});

// ---------------------------------------------------------------- menu
function refreshMenu() {
  const s = savedRun(), P = G.profile;
  $('mCont').hidden = !s;
  if (s) $('mCont').innerHTML = '⟳ ' + esc(t('es_continue')) + `<small>${esc(s.act <= 3 ? t('es_actS', { n: ROMAN[s.act - 1] }) + ' · ' + t('es_waveN', { n: s.wave, m: WAVES_PER_ACT }) : t('es_endlessN', { n: s.wave }))}</small>`;
  $('mNew').textContent = '▶ ' + t('es_newRun');
  $('mHow').textContent = '❓ ' + t('es_how');
  $('mSnd').textContent = G.settings.mute ? '🔇 ' + t('es_soundOff') : '🔊 ' + t('es_soundOn');
  $('ascRow').hidden = !P.ascMax;
  UI.asc = clamp(UI.asc == null ? P.ascMax : UI.asc, 0, P.ascMax);
  $('ascV').textContent = UI.asc ? t('es_asc', { n: UI.asc }) : t('es_ascNone');
  const name = window.Auth && Auth.name && Auth.name();
  const lines = [];
  if (name) lines.push('👤 ' + esc(name));
  if (P.best) lines.push('🏆 ' + esc(t('es_bestRun')) + ': <b>' + P.best.score + '</b> · ' + esc(reachLabel(P.best)) + (P.best.won ? ' 🌟' : ''));
  lines.push('🎼 ' + esc(t('es_harmonies')) + ': ' + P.codex.length + '/' + HARMONIES.length + (P.wins ? ' · 🌟 ' + esc(t('es_wins')) + ': ' + P.wins : '') + (P.runs ? ' · ' + esc(t('es_runs')) + ': ' + P.runs : ''));
  $('mStats').innerHTML = lines.join('<br>');
}
$('mNew').addEventListener('click', () => {
  ESAudio.init();
  if (savedRun()) confirmBox(t('es_newRunQ'), t('es_newRun'), () => startRun({ asc: UI.asc || 0 }));
  else startRun({ asc: UI.asc || 0 });
});
$('mCont').addEventListener('click', () => { ESAudio.init(); if (continueRun()) afterStart(); });
$('mHow').addEventListener('click', () => { ESAudio.init(); openHow(); });
$('mSnd').addEventListener('click', () => { ESAudio.init(); toggleMute(); refreshMenu(); });
$('ascL').addEventListener('click', () => { UI.asc = Math.max(0, (UI.asc || 0) - 1); refreshMenu(); ESAudio.sfx('click'); });
$('ascR').addEventListener('click', () => { UI.asc = Math.min(G.profile.ascMax, (UI.asc || 0) + 1); refreshMenu(); ESAudio.sfx('click'); });
function startRun(o) { hideModal(); newRun(o); afterStart(); }
function afterStart() {
  G.paused = false; UI.sel = null; UI.armed = 'bell'; UI.note = 0; G.ghost = null; cache.sh2 = null; cache.hp2 = null;
  ESAudio.musicLevel(0.85);
  UI.phase(); layout(); buildPalette(); select(null);
}
function toMenu() {
  G.paused = false; menuScene(); refreshMenu(); layout();
}
function toggleMute() { G.settings.mute = !G.settings.mute; saveSettings(); ESAudio.setMuted(G.settings.mute); }

// ---------------------------------------------------------------- pointer input
let down = null;
function hoverAt(sx, sy) {
  if (!(G.phase === 'build' || G.phase === 'wave') || G.paused) { G.ghost = null; return; }
  const w = toWorld(sx, sy), so = nearestSocket(w.x, w.y);
  if (so && so.res) { G.ghost = null; cv.style.cursor = 'pointer'; return; }
  if (!so || !UI.armed) { G.ghost = null; cv.style.cursor = 'default'; return; }
  cv.style.cursor = 'pointer';
  if (G.ghost && G.ghost.sock === so.i && G.ghost.role === UI.armed && G.ghost.note === UI.note && G.ghost.sh === G.shards) return;
  G.ghost = makeGhost(so, UI.armed, UI.note);
}
function makeGhost(so, role, note) {
  const v = { id: -1, role, note, lvl: 1, x: so.x, y: so.y };
  const list = G.res.concat([v]), an = analyze(list), n = list.length - 1, kinds = [];
  for (const g of an.groups) if (g.includes(n)) kinds.push(g.length === 2 ? 'shield' : 'blast');
  if (an.links.some(l => l.fifth && (l.i === n || l.j === n))) kinds.push('fifth');
  for (const c of an.chords) if (c.idx.includes(n) && !kinds.includes(c.type)) kinds.push(c.type);
  if (an.grand.length > G.grand.length) kinds.push('grand');
  return { sock: so.i, role, note, ok: G.shards >= costOf(role), nb: an.adj[n].map(i => list[i]), kinds, sh: G.shards };
}
function tapAt(sx, sy, d) {
  if (!(G.phase === 'build' || G.phase === 'wave' || G.phase === 'cleared' || G.phase === 'draft')) return;
  if (d.type === 'mouse' && Math.hypot(sx - d.x, sy - d.y) > 14) return;
  const w = toWorld(sx, sy), so = nearestSocket(w.x, w.y);
  if (so && so.res) { select(UI.sel === so.res ? null : so.res); return; }
  if (UI.sel) { select(null); if (!(so && UI.armed)) return; }
  if (so && UI.armed && (G.phase === 'build' || G.phase === 'wave')) {
    if (G.shards < costOf(UI.armed)) { ESAudio.sfx('error'); toast('◆ ' + esc(t('es_noShards'))); return; }
    const r = placeRes(UI.armed, UI.note, so.i);
    if (r) {
      ESAudio.sfx('place', r.note); burst(r.x, r.y - 14, NOTES[r.note].rgb, 16, 110); addRing(r.x, r.y, 50, NOTES[r.note].rgb, 0, 'fx', { dur: 0.45 });
      floatText(r.x, r.y - 44, '-' + r.invested + '◆', '#ffd166', 12);
      persist(); G.ghost = null; tutorialAfterPlace();
    }
  }
}
function tutorialAfterPlace() {
  if (UI.tutStep === 0) { UI.tutStep = 1; toast('🔗 ' + esc(t('es_tut2')), 7500); }
  else if (UI.tutStep === 1 && G.res.length >= 2) { UI.tutStep = 2; toast('▶ ' + esc(t('es_tut3')), 7000); }
}
cv.addEventListener('pointerdown', (e) => {
  ESAudio.init();
  if (G.phase === 'menu') return;
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  down = { id: e.pointerId, x: e.clientX, y: e.clientY, type: e.pointerType };
  if (e.pointerType !== 'mouse') hoverAt(e.clientX, e.clientY);
});
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' ? !down || down.id === e.pointerId : down && down.id === e.pointerId) hoverAt(e.clientX, e.clientY);
});
cv.addEventListener('pointerup', (e) => {
  if (!down || down.id !== e.pointerId) return;
  const d = down; down = null;
  if (e.button === 2) return;
  tapAt(e.clientX, e.clientY, d);
  if (e.pointerType !== 'mouse') G.ghost = null;
});
cv.addEventListener('pointercancel', () => { down = null; G.ghost = null; });
cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') G.ghost = null; });
cv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (UI.sel) select(null); else if (UI.armed) armRole(UI.armed); });

// ---------------------------------------------------------------- keyboard
addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  ESAudio.init();
  const k = e.key, inGame = G.phase !== 'menu';
  if (UI.modal === 'draft') { if (/^[1-3]$/.test(k)) { if (pickBoon(+k - 1)) hideModal(); } return; }
  if (k === 'Escape') {
    if (UI.modal === 'how' && inGame) { openPause(); return; }
    if (UI.modal === 'pause') { resume(); return; }
    if (UI.modal) { if (UI.modal !== 'over' && UI.modal !== 'won') { hideModal(); if (inGame) G.paused = false; } return; }
    if (UI.sel) { select(null); return; }
    if (inGame) openPause();
    return;
  }
  if (k === 'p' || k === 'P') { if (UI.modal === 'pause') resume(); else if (!UI.modal && inGame) openPause(); return; }
  if (UI.modal || !inGame) { if (k === 'Enter' && !inGame && !UI.modal) $(savedRun() ? 'mCont' : 'mNew').click(); return; }
  if (/^[1-5]$/.test(k)) { armRole(ROLE_ORDER[+k - 1]); return; }
  const ni = { c: 0, d: 1, e: 2, g: 3, a: 4 }[k.toLowerCase()];
  if (ni != null) { if (UI.sel) { retuneRes(UI.sel, ni); UI.inspKey = null; renderInsp(); } else setNote(ni); return; }
  if ((k === 'u' || k === 'U') && UI.sel) { if (!upgradeRes(UI.sel)) ESAudio.sfx('error'); UI.inspKey = null; renderInsp(); return; }
  if ((k === 'x' || k === 'X' || k === 'Delete' || k === 'Backspace') && UI.sel) { e.preventDefault(); const r = UI.sel; const v = sellRes(r); floatText(r.x, r.y - 30, '+' + v + '◆', '#ffd166', 14); select(null); return; }
  if (k === ' ' || k === 'Enter') { e.preventDefault(); if (G.phase === 'build') beginWave(); return; }
  if (k === 'f' || k === 'F') { cycleSpeed(); return; }
  if (k === 'm' || k === 'M') { toggleMute(); toast(G.settings.mute ? '🔇' : '🔊', 900); }
});
function cycleSpeed() { G.speed = G.speed >= 3 ? 1 : G.speed + 1; $('spdBtn').textContent = G.speed + '×'; $('spdBtn').classList.toggle('on', G.speed > 1); ESAudio.sfx('click'); }
$('spdBtn').addEventListener('click', () => { ESAudio.init(); cycleSpeed(); });
$('pauseBtn').addEventListener('click', () => { ESAudio.init(); openPause(); });

// ---------------------------------------------------------------- language, resize, visibility
document.addEventListener('langchange', () => {
  for (const k in cache) delete cache[k];
  if (G.phase === 'menu') refreshMenu();
  else { buildPalette(); UI.inspKey = null; if (UI.sel) renderInsp(); renderRelics(); }
  if (UI.modal === 'pause') openPause();
  else if (UI.modal === 'how') openHow(G.phase === 'menu' ? undefined : 'pause');
  else if (UI.modal === 'draft') UI.draft();
  else if (UI.modal === 'over') UI.gameover();
  else if (UI.modal === 'won') UI.victory();
  if (G.boss) UI.bossBar(G.boss);
});
document.querySelectorAll('.langbtn').forEach(b => b.addEventListener('click', () => setLang(getLang() === 'ar' ? 'en' : 'ar')));
let rzT = 0;
addEventListener('resize', () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    if (G.phase === 'menu') { const o = pickOrient(); if (o !== G.orient) { menuScene(); } }
    layout();
  }, 60);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (G.phase === 'wave' && !G.paused) openPause(); ESAudio.suspend(); }
  else ESAudio.resume();
});
document.addEventListener('mal3abready', () => { if (G.phase === 'menu') refreshMenu(); });

// ---------------------------------------------------------------- main loop
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000; last = now;
  if (!(dt > 0)) dt = 0; if (dt > 0.05) dt = 0.05;
  if (!G.paused) {
    const n = G.phase === 'wave' ? G.speed : 1;
    G.curSpeed = n;
    for (let i = 0; i < n; i++) { G.audioLead = -(dt * (n - 1 - i)) / n; update(dt); }
  }
  render(cx);
  hudTick();
}

// ---------------------------------------------------------------- boot
loadProfile();
ESAudio.setMuted(G.settings.mute);
menuScene(); refreshMenu();
if (window.applyLang) applyLang();
layout();
requestAnimationFrame(frame);

// ---------------------------------------------------------------- test / scripting API
window.EchoesSpire = {
  G, UI, audio: ESAudio,
  state: () => ({
    phase: G.phase, paused: G.paused, act: G.act, wave: G.wave, g: gIndex(), boss: isBossWave(), hp: G.hp, maxHp: G.maxHp, shards: G.shards,
    score: G.score, kills: G.kills, resonators: G.res.length, enemies: G.enemies.length, pending: G.spawnQ.length - G.spawnIdx,
    relics: G.relics.slice(), unlocked: G.unlocked.slice(), barriers: G.barriers.length, blasts: G.groups.length, chords: G.chords.map(c => c.type),
    grand: G.grand.length, bpm: G.bpm, modal: UI.modal, draft: G.draft ? G.draft.map(b => b.kind + ':' + (b.id || b.role || b.n)) : null,
  }),
  newRun: (o) => { startRun(o || {}); return true; },
  continueRun: () => { const ok = continueRun(); if (ok) afterStart(); return ok; },
  toMenu, startWave: () => { const ok = startWave(); if (ok) { select(null); G.preview = null; } return ok; },
  pickBoon: (i) => { const ok = pickBoon(i); if (ok) hideModal(); return ok; },
  sockets: () => G.map.sockets.map(s => ({ i: s.i, x: s.x, y: s.y, used: !!s.res })),
  paths: () => G.map.paths.map(p => ({ len: p.len, start: p.start })),
  place: (role, note, sock) => { const r = placeRes(role, note, sock); if (r) persist(); return r ? r.id : null; },
  res: () => G.res.map(r => ({ id: r.id, role: r.role, note: r.note, lvl: r.lvl, x: r.x, y: r.y, sock: r.sock, mult: +r.mult.toFixed(2) })),
  upgrade: (id) => { const r = G.res.find(x => x.id === id); return r ? upgradeRes(r) : false; },
  sell: (id) => { const r = G.res.find(x => x.id === id); return r ? sellRes(r) : 0; },
  retune: (id, n) => { const r = G.res.find(x => x.id === id); if (r) retuneRes(r, n); return !!r; },
  select: (id) => select(G.res.find(x => x.id === id) || null),
  sim: (sec, step) => { step = step || 1 / 30; G.curSpeed = 1; G.audioLead = 0; for (let x = 0; x < sec; x += step) { if (!G.paused) update(step); } return window.EchoesSpire.state(); },
  pause: openPause, resume, setSpeed: (n) => { G.speed = clamp(n | 0, 1, 3); $('spdBtn').textContent = G.speed + '×'; },
  skipWave: () => { if (G.phase !== 'wave') return false; G.spawnIdx = G.spawnQ.length; for (const e of G.enemies) e.dead = true; G.enemies = []; return true; },
  win: () => { G.act = 3; G.wave = WAVES_PER_ACT; G.phase = 'wave'; G.enemies = []; G.spawnQ = []; G.spawnIdx = 0; victory(); return true; },
  lose: () => { if (G.phase !== 'wave') { G.phase = 'wave'; } G.hp = 0; lose(); return true; },
  analyze: () => analyze(G.res), openHow, openPause, layout,
};
