// Mal3ab — Turf Rush invite links: ?join=CODE enters the game code automatically; a button copies the link.
(function () {
  const $ = (id) => document.getElementById(id);
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const base = location.href.split('?')[0];
  window.Mal3abShareLink = () => { const c = $('code') && $('code').value.trim().toUpperCase(); return c ? base + '?join=' + c : base; };   // chat: "invite to this game"
  const row = $('newCodeBtn') && $('newCodeBtn').parentElement;
  if (row) {
    const b = document.createElement('button'); b.className = 'mini'; b.type = 'button';
    const label = () => b.textContent = AR() ? '🔗 نسخ لينك الدعوة' : '🔗 Copy Invite Link'; label();
    document.addEventListener('mal3abready', label); document.addEventListener('langchange', label);
    b.onclick = () => {
      let code = $('code').value.trim().toUpperCase();
      if (!code) { $('newCodeBtn').click(); code = $('code').value.trim().toUpperCase(); }
      navigator.clipboard.writeText(base + '?join=' + code).then(() => { const o = b.textContent; b.textContent = '✓'; setTimeout(() => b.textContent = o, 1200); });
    };
    row.appendChild(b);
    const homeBtn = () => { const h = document.createElement('button'); h.className = 'mini'; h.type = 'button'; h.onclick = () => location.href = '../play.html';
      const lb = () => h.textContent = '🏠 ' + (AR() ? 'الرئيسية' : 'Home'); lb(); document.addEventListener('mal3abready', lb); document.addEventListener('langchange', lb); return h; };
    row.appendChild(homeBtn());                                                     // Play online
    const localRow = $('startBtn') && $('startBtn').parentElement; if (localRow) localRow.appendChild(homeBtn());   // Same keyboard, next to "Start match"
  }
  // old app: no online play (checked before the game's own click handler)
  if ($('goBtn')) $('goBtn').addEventListener('click', (e) => { if (window.Mal3abVersion && !Mal3abVersion.gate()) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener('mal3ab-outdated', () => { setTimeout(() => { location.href = location.href.split('?')[0]; }, 8000); });
  const join = new URLSearchParams(location.search).get('join');
  if (join) {
    const go = () => { $('tabOnline') && $('tabOnline').click(); $('code').value = join.toUpperCase(); $('goBtn').click(); };
    // wait for the account name to be filled in by cloud.js, then enter the game
    setTimeout(go, 1500);
  }
})();

// ---------------------------------------------------------------------
// Mal3ab — computer opponent for Turf Rush (local mode, blue painter).
// It hunts for unpainted / orange tiles, grabs nearby power-ups and, on Medium/Hard, dashes into you.
// The human can then use either key set (WASD or arrows, F or /).
// ---------------------------------------------------------------------
(function () {
  const $ = (id) => document.getElementById(id);
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const LV = { easy: { speed: 0.7, think: 1100, noise: 5, foeBonus: 0, chase: 0 }, medium: { speed: 0.88, think: 700, noise: 1.8, foeBonus: 1, chase: 0.35 }, hard: { speed: 1, think: 450, noise: 0.4, foeBonus: 2.2, chase: 0.8 } };
  const BOT = { level: null, tx: 0, ty: 0, until: 0, wanderUntil: 0, wx: 0, wy: 0, aim: null, dashing: false };
  const A = window.TurfAPI; if (!A) return;
  const on = () => BOT.level && A.mode === 'local' && A.state !== 'menu';

  function pickTarget(p) {
    const L = LV[BOT.level], foe = A.P[1];
    // power-ups close by are worth a detour
    if (BOT.level !== 'easy') { const u = A.pickups.find(u => Math.hypot(u.x - p.x, u.y - p.y) < 6); if (u) { BOT.tx = u.x; BOT.ty = u.y; return; } }
    let best = null, bs = Infinity;
    for (let ty = 0; ty < A.ROWS; ty++) for (let tx = 0; tx < A.COLS; tx++) {
      const o = A.owner[ty * A.COLS + tx]; if (o === -1 || o === 2) continue;
      const s = Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y) - (o === 1 ? L.foeBonus : 0) + Math.random() * L.noise
              + (Math.hypot(tx + 0.5 - foe.x, ty + 0.5 - foe.y) < 1.5 ? 2 : 0);
      if (s < bs) { bs = s; best = [tx + 0.5, ty + 0.5]; }
    }
    if (best) { BOT.tx = best[0]; BOT.ty = best[1]; } else { BOT.tx = p.x; BOT.ty = p.y; }
  }
  function botVec(p) {
    const L = LV[BOT.level], t = performance.now(), foe = A.P[1];
    if (BOT.aim) { const a = BOT.aim; return { x: a.x, y: a.y, l: 1 }; }       // facing used by a dash
    if (p.stuck > 0.15 && t > BOT.wanderUntil) { const a = Math.random() * Math.PI * 2; BOT.wx = Math.cos(a); BOT.wy = Math.sin(a); BOT.wanderUntil = t + 350; p.stuck = 0; BOT.until = 0; }
    if (t < BOT.wanderUntil) return { x: BOT.wx, y: BOT.wy, l: L.speed };
    if (t > BOT.until || Math.hypot(BOT.tx - p.x, BOT.ty - p.y) < 0.35) { pickTarget(p); BOT.until = t + L.think; }
    // bump the other painter when close (stuns them and splashes paint)
    if (A.state === 'play' && L.chase && p.dashCd <= 0 && !foe.stun && Math.hypot(foe.x - p.x, foe.y - p.y) < 2.3 && Math.random() < L.chase * 0.08) {
      const dx = foe.x - p.x, dy = foe.y - p.y, d = Math.hypot(dx, dy) || 1;
      BOT.aim = { x: dx / d, y: dy / d }; BOT.dashing = true; A.dashNow(p); BOT.dashing = false; BOT.aim = null;
    }
    const dx = BOT.tx - p.x, dy = BOT.ty - p.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d, l: L.speed };
  }
  window.TurfBot = {
    vec(p) { if (!on()) return null; if (p.id === 2) return botVec(p); if (p.id === 1) return A.stickVec([A.KEYS[1], A.KEYS[2]], A.touch[1]); return null; },   // either key set moves you
    dash(p) { return on() && p.id === 2 && !BOT.dashing ? A.P[1] : p; }    // the blue dash keys dash *you*
  };
  // "Opponent" choice in the local menu
  const pane = $('paneLocal'), startRow = $('startBtn') && $('startBtn').parentElement;
  if (pane && startRow) {
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `<label for="botLevel" style="font-weight:700">${AR() ? 'الخصم' : 'Opponent'}</label>
      <select id="botLevel" class="mini" style="padding:6px 10px">
        <option value="">${AR() ? 'لاعبين على نفس الكيبورد' : 'Two players, one keyboard'}</option>
        <option value="easy">🤖 ${AR() ? 'الكمبيوتر — سهل' : 'Computer — Easy'}</option>
        <option value="medium">🤖 ${AR() ? 'الكمبيوتر — متوسط' : 'Computer — Medium'}</option>
        <option value="hard">🤖 ${AR() ? 'الكمبيوتر — صعب' : 'Computer — Hard'}</option></select>`;
    pane.insertBefore(row, startRow);
    const sel = row.querySelector('select'), n2 = $('name2');
    const apply = () => { BOT.level = sel.value || null; if (BOT.level) { n2.dataset.human = n2.dataset.human || n2.value; n2.value = '🤖 ' + (AR() ? 'كمبيوتر' : 'CPU'); n2.disabled = true; } else { if (n2.dataset.human) n2.value = n2.dataset.human; n2.disabled = false; } };
    sel.onchange = apply;
    const lvl = new URLSearchParams(location.search).get('bot');
    if (LV[lvl]) { setTimeout(() => { $('tabLocal') && $('tabLocal').click(); sel.value = lvl; apply(); }, 300); }
  }
})();
