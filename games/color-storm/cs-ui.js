'use strict';
// =====================================================================
// Color Storm — UI: table rendering, card animations, hand fan + drag, screens,
// and the controller that runs a match on this device (vs bots, same device, or as the online host).
// =====================================================================
(function () {
const CS = window.CS, E = CS.E, DECK = CS.DECK, sfx = CS.sfx;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SEATC = ['#ffb703', '#ff7eb6', '#4cc9f0', '#80ed99', '#c79bff', '#ff9f43'];
const COLHEX = { r: '#ff4d5e', y: '#ffc021', g: '#2fcf7a', b: '#3f8cff', w: '#b9b9ff' };
const BOTN = { ar: ['زينة', 'كريم', 'نور', 'عمر', 'ليلى', 'ياسين', 'سلمى', 'حمزة'], en: ['Zeina', 'Karim', 'Nour', 'Omar', 'Laila', 'Yassin', 'Salma', 'Hamza'] };
const UI = CS.UI = { V: null, mode: 'menu', cw: 74, pw: 92, cur: null, incoming: new Set(), hideTop: -1, deadline: 0, dlTotal: 0, sel: -1, order: [] };
CS.esc = esc; CS.SEATC = SEATC; CS.COLHEX = COLHEX;
const lang = () => (getLang() === 'ar' ? 'ar' : 'en');
UI.dn = (p) => { if (!p) return '…'; const m = /^#bot:(\d+)$/.exec(p.n || ''); return m ? BOTN[lang()][+m[1] % 8] : (p.n || '…'); };
const nameOf = (i) => (UI.V && UI.V.s[i] ? UI.dn(UI.V.s[i]) : '…');
const initial = (s) => { const c = Array.from(String(s || '?').trim())[0] || '?'; return c.toUpperCase(); };
const authName = () => { try { return (window.Auth && Auth.name && Auth.name()) || ''; } catch (e) { return ''; } };
UI.myName = () => authName() || CS.load('name', '') || t('cs_you');

// ---------------------------------------------------------------- card art (inline SVG icons, drawn in code)
const P = (a, r) => [50 + Math.cos(a) * r, 50 + Math.sin(a) * r].map((v) => v.toFixed(1)).join(' ');
const ICON = {};
(function () {
  let d = '';
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 2; d += `M50 50L${P(a, 42)}M${P(a - 0.42, 36)}L${P(a, 25)}L${P(a + 0.42, 36)}`; }
  ICON.skip = `<svg viewBox="0 0 100 100"><path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const arc = (a0, a1) => {
    const r = 30, A0 = a0 * Math.PI / 180, A1 = a1 * Math.PI / 180, tip = [50 + Math.cos(A1) * r - Math.sin(A1) * 13, 50 + Math.sin(A1) * r + Math.cos(A1) * 13];
    const b1 = P(A1, r + 11), b2 = P(A1, r - 11);
    return `<path d="M${P(A0, r)}A${r} ${r} 0 0 1 ${P(A1, r)}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M${b1}L${tip.map((v) => v.toFixed(1)).join(' ')}L${b2}Z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  };
  ICON.rev = `<svg viewBox="0 0 100 100">${arc(200, 318)}${arc(20, 138)}</svg>`;
  let s = '';
  for (let k = 0; k < 2; k++) { let q = ''; for (let i = 0; i <= 18; i++) { const u = i / 18, a = k * Math.PI + u * 2.7, r = 11 + u * 31; q += (i ? 'L' : 'M') + P(a, r); } s += `<path d="${q}" fill="none" stroke="#fff" stroke-width="${9}" stroke-linecap="round" stroke-linejoin="round"/>`; }
  ICON.storm = `<svg viewBox="0 0 100 100">${s}<circle cx="50" cy="50" r="7" fill="#fff"/></svg>`;
  ICON.rain = `<svg viewBox="0 0 100 100"><path d="M28 60a14 14 0 0 1 2-28a19 19 0 0 1 36-4a14 14 0 0 1 6 32z" fill="#fff"/>
    <path d="M34 70q-5 9 0 12q5-3 0-12zM50 72q-5 9 0 12q5-3 0-12zM66 70q-5 9 0 12q5-3 0-12z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;
  ICON.w4 = `<svg viewBox="0 0 100 100"><path d="M60 4L24 54H47L38 96L78 40H55Z" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width="2" stroke-linejoin="round"/></svg>`;
  ICON.wild = `<svg viewBox="0 0 100 100"><path d="M50 8Q55 45 92 50Q55 55 50 92Q45 55 8 50Q45 45 50 8Z" fill="#fff"/></svg>`;
})();
const CN = { skip: ICON.skip, rev: ICON.rev, d2: '+2', w4: '+4', wild: ICON.wild, storm: ICON.storm, rain: ICON.rain };
CS.cardHTML = (id, cls, style) => {
  const d = DECK[id]; if (!d) return CS.backHTML(cls, style);
  let g;
  if (d.num) g = `<div class="gl${d.v === '6' || d.v === '9' ? ' u' : ''}"><span>${d.v}</span></div>`;
  else if (d.v === 'd2') g = '<div class="gl">+2</div>';
  else g = `<div class="gl">${ICON[d.v]}</div>`;
  const cn = d.num ? d.v : CN[d.v];
  return `<div class="card ${d.c} ${cls || ''}" data-id="${id}"${style ? ` style="${style}"` : ''}><div class="bd"></div>${g}<div class="cn">${cn}</div><div class="cn b">${cn}</div></div>`;
};
CS.backHTML = (cls, style) => `<div class="card back ${cls || ''}"${style ? ` style="${style}"` : ''}><div class="bk"></div><div class="bl">⚡</div></div>`;
const KORDER = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'rev', 'd2', 'rain', 'storm', 'wild', 'w4'];
const sortKey = (id) => { const d = DECK[id]; return 'rygbw'.indexOf(d.c) * 100 + KORDER.indexOf(d.v); };
const firstOf = (v, c) => DECK.find((d) => d.v === v && (!c || d.c === c)).id;

// ---------------------------------------------------------------- sizes
function resize() {
  const w = innerWidth, h = innerHeight;
  UI.cw = Math.round(Math.max(50, Math.min(104, w * 0.19, h * 0.108)));
  UI.pw = Math.round(Math.max(60, Math.min(120, w * 0.22, h * 0.125)));
  document.documentElement.style.setProperty('--cw', UI.cw + 'px');
  document.documentElement.style.setProperty('--pw', UI.pw + 'px');
  FX.resize(); BG.resize();
  layoutHand();
}

// ---------------------------------------------------------------- particles (top canvas) + stormy sky (bottom canvas)
const FX = { list: [], ctx: null, w: 0, h: 0, dpr: 1 };
FX.resize = () => { const c = $('fx'); FX.dpr = Math.min(2, devicePixelRatio || 1); FX.w = innerWidth; FX.h = innerHeight; c.width = FX.w * FX.dpr; c.height = FX.h * FX.dpr; FX.ctx = c.getContext('2d'); };
FX.add = (o) => { if (FX.list.length < 500) FX.list.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, max: 1, s: 4, col: '#fff', kind: 'dot', rot: 0, vr: 0, drag: 0.98 }, o)); };
FX.burst = (x, y, col, n, sp) => { for (let i = 0; i < (n || 18); i++) { const a = Math.random() * Math.PI * 2, v = (sp || 240) * (0.4 + Math.random() * 0.8); FX.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.7 + Math.random() * 0.4, max: 1.1, s: 2 + Math.random() * 4, col, drag: 0.93 }); } };
FX.confetti = () => { const cols = Object.values(COLHEX); for (let i = 0; i < 140; i++) FX.add({ x: Math.random() * FX.w, y: -20 - Math.random() * FX.h * 0.5, vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 160, g: 60, life: 3.2, max: 3.2, s: 5 + Math.random() * 5, col: cols[i % 4], kind: 'rect', vr: (Math.random() - 0.5) * 12, drag: 0.995 }); };
FX.snow = (x, y) => { for (let i = 0; i < 22; i++) { const a = Math.random() * Math.PI * 2; FX.add({ x, y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90 - 20, g: 30, life: 1.3, max: 1.3, s: 2 + Math.random() * 3, col: '#dff4ff', drag: 0.95 }); } };
FX.rain = () => { for (let i = 0; i < 90; i++) FX.add({ x: Math.random() * FX.w * 1.2, y: -Math.random() * FX.h * 0.6, vx: -60, vy: 650 + Math.random() * 300, life: 1.6, max: 1.6, s: 1.5, col: '#9fd4ff', kind: 'line', drag: 1 }); };
FX.swirl = (x, y) => { const cols = Object.values(COLHEX); for (let i = 0; i < 90; i++) FX.add({ x, y, kind: 'orb', a: Math.random() * Math.PI * 2, r: 10 + Math.random() * 30, va: 5 + Math.random() * 3, vr2: 90 + Math.random() * 120, life: 1.4, max: 1.4, s: 2 + Math.random() * 3, col: cols[i % 4] }); };
FX.step = (dt) => {
  const c = FX.ctx; if (!c) return;
  c.setTransform(FX.dpr, 0, 0, FX.dpr, 0, 0); c.clearRect(0, 0, FX.w, FX.h);
  if (!FX.list.length) return;
  for (const p of FX.list) {
    p.life -= dt;
    if (p.kind === 'orb') { p.a += p.va * dt; p.r += p.vr2 * dt; p.px = p.x + Math.cos(p.a) * p.r; p.py = p.y + Math.sin(p.a) * p.r * 0.6; }
    else { p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    const al = Math.max(0, Math.min(1, p.life / p.max * 1.6));
    c.globalAlpha = al; c.fillStyle = p.col; c.strokeStyle = p.col;
    if (p.kind === 'rect') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); }
    else if (p.kind === 'line') { c.lineWidth = p.s; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); c.stroke(); }
    else { c.beginPath(); c.arc(p.kind === 'orb' ? p.px : p.x, p.kind === 'orb' ? p.py : p.y, p.s, 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
  FX.list = FX.list.filter((p) => p.life > 0 && p.y < FX.h + 60);
};
const BG = { ctx: null, w: 0, h: 0, clouds: [], flash: 0, acc: 0 };
BG.resize = () => {
  const c = $('bg'); BG.w = innerWidth; BG.h = innerHeight; const s = 0.5; c.width = Math.ceil(BG.w * s); c.height = Math.ceil(BG.h * s); BG.ctx = c.getContext('2d'); BG.s = s;
  if (!BG.clouds.length) for (let i = 0; i < 9; i++) BG.clouds.push({ x: Math.random(), y: Math.random() * 0.7, r: 0.22 + Math.random() * 0.3, v: (0.004 + Math.random() * 0.01) * (Math.random() < 0.5 ? -1 : 1), hue: i % 3 });
};
BG.step = (dt) => {
  BG.acc += dt; if (BG.acc < 1 / 30) return; const d = BG.acc; BG.acc = 0;
  const c = BG.ctx; if (!c) return; const W = c.canvas.width, H = c.canvas.height;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141836'); g.addColorStop(1, '#090b16'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const HUES = ['rgba(90,70,170,', 'rgba(40,80,160,', 'rgba(130,60,120,'];
  for (const k of BG.clouds) {
    k.x += k.v * d; if (k.x < -0.4) k.x = 1.4; if (k.x > 1.4) k.x = -0.4;
    const x = k.x * W, y = k.y * H, r = k.r * Math.max(W, H);
    const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, HUES[k.hue] + '0.22)'); rg.addColorStop(1, HUES[k.hue] + '0)');
    c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // table glow under the piles, tinted with the colour in play
  const pl = $('piles'), rc = pl && pl.getBoundingClientRect();
  if (rc && rc.width && UI.V) {
    const cx = (rc.left + rc.width / 2) * BG.s, cy = (rc.top + rc.height / 2) * BG.s, R = Math.max(rc.width, 120) * 1.5 * BG.s;
    const col = COLHEX[UI.V.c] || '#ffb703';
    const tg = c.createRadialGradient(cx, cy, 0, cx, cy, R); tg.addColorStop(0, col + '40'); tg.addColorStop(0.55, col + '14'); tg.addColorStop(1, col + '00');
    c.fillStyle = tg; c.fillRect(cx - R, cy - R, R * 2, R * 2);
  }
  if (BG.flash > 0) { c.fillStyle = `rgba(220,230,255,${BG.flash * 0.5})`; c.fillRect(0, 0, W, H); BG.flash = Math.max(0, BG.flash - d * 2.2); }
};

// ---------------------------------------------------------------- render
const V = () => UI.V;
const myTurn = () => { const v = UI.V; return !!v && v.ph === 'play' && v.me >= 0 && v.t === v.me; };
UI.myTurn = myTurn;
UI.canPlayV = (id) => {
  const v = UI.V; if (!myTurn() || !v.h.includes(id)) return false;
  if (v.dr >= 0 && id !== v.dr) return false;
  const c = DECK[id], top = DECK[v.d[v.d.length - 1]];
  if (v.pe > 0) return v.pt === 'd2' ? (c.v === 'd2' || c.v === 'w4') : c.v === 'w4';
  if (c.c === 'w') return true;
  return c.c === v.c || c.v === top.v;
};
function seatOrder(v) { const n = v.s.length, o = []; if (v.me >= 0) for (let k = 1; k < n; k++) o.push((v.me + k) % n); else for (let k = 0; k < n; k++) o.push(k); return o; }
function renderTop() {
  $('logoTxt').innerHTML = `<b>${esc(t('cs_title'))}</b>`;
  const v = V(); $('roundTxt').textContent = v && UI.mode !== 'menu' ? '· ' + t('cs_round', { n: v.r }) : '';
  $('langBtn').textContent = getLang() === 'ar' ? 'English' : 'العربية';
  $('scoreBtn').hidden = $('pauseBtn').hidden = UI.mode === 'menu';
}
function renderOpps() {
  const v = V(), el = $('opps');
  if (!v || UI.mode === 'menu') { el.innerHTML = ''; return; }
  const ord = seatOrder(v);
  el.innerHTML = `<div class="flow${v.dir < 0 ? ' rev' : ''}"></div>` + ord.map((i) => {
    const p = v.s[i], turn = v.ph === 'play' && v.t === i, m = Math.min(p.c, 8);
    let fan = '';
    for (let j = 0; j < m; j++) { const u = j - (m - 1) / 2; fan += `<i style="transform:translateX(calc(-50% + ${u * 4.5}px)) rotate(${u * 9}deg)"></i>`; }
    const catchable = v.ph === 'play' && v.k === i && v.me >= 0 && v.me !== i && !p.ca;
    const one = p.c === 1 ? `<span class="one${v.k === i && !p.ca ? ' bad' : ''}">${p.ca ? '⚡ 1' : '1!'}</span>` : '';
    return `<div class="opp${turn ? ' turn' : ''}${p.aw ? ' away' : ''}" data-seat="${i}" style="--pc:${SEATC[i % 6]}">
      <div class="av">${p.b ? '🤖' : esc(initial(UI.dn(p)))}${turn && UI.deadline ? '<div class="tm"></div>' : ''}</div>
      <div class="nm" title="${esc(UI.dn(p))}">${esc(UI.dn(p))}</div><div class="sub">🏆 ${p.sc}${p.aw ? ' · 🤖' : ''}</div>
      <div class="fan">${fan}</div><span class="cnt">${p.c}</span>${one}
      ${catchable ? `<button class="catch" data-act="catch" data-arg="${i}">🚨 ${esc(t('cs_catch', { p: UI.dn(p).slice(0, 10) }))}</button>` : ''}</div>`;
  }).join('');
}
function renderTable() {
  const v = V(), st = $('status'), playing = v && UI.mode !== 'menu';
  $('piles').style.visibility = $('ring').style.visibility = $('colorTag').style.visibility = playing ? '' : 'hidden';
  if (!playing) { st.textContent = ''; st.className = ''; $('pend').hidden = true; return; }
  const mine = myTurn();
  st.className = mine ? 'mine' : '';
  st.textContent = v.ph !== 'play' ? (v.last ? t('cs_e_out', { p: nameOf(v.last.w) }) : '') : mine ? (v.pe > 0 ? t('cs_stackHint', { n: v.pe }) : t('cs_yourTurn')) : t('cs_turnOf', { p: nameOf(v.t) });
  const pend = $('pend'); pend.hidden = !(v.pe > 0 && v.ph === 'play'); pend.textContent = t('cs_pend', { n: v.pe });
  const col = COLHEX[v.c] || '#888';
  document.documentElement.style.setProperty('--curc', col);
  $('colorTag').textContent = t('cs_c_' + v.c);
  const ring = $('ring'); ring.classList.toggle('ccw', v.dir < 0);
  // deck
  const canDraw = mine && v.dr < 0;
  $('deck').className = canDraw ? 'can' : '';
  $('deck').innerHTML = CS.backHTML('', 'left:4px;top:4px;--w:var(--pw)') + CS.backHTML('', 'left:2px;top:2px;--w:var(--pw)') + CS.backHTML('', '--w:var(--pw)') + `<div class="dn">${v.dc}</div>`;
  $('disc').innerHTML = v.d.map((id, i) => {
    const r = ((id * 37) % 23) - 11, x = ((id * 13) % 9) - 4, y = ((id * 7) % 7) - 3, top = i === v.d.length - 1;
    return CS.cardHTML(id, '', `--w:var(--pw);transform:translate(${x}px,${y}px) rotate(${r}deg);${top && UI.hideTop === id ? 'visibility:hidden' : ''}`);
  }).join('');
}
function renderBar() {
  const v = V(), mi = $('meInfo');
  const show = v && UI.mode !== 'menu' && v.me >= 0;
  $('bar').style.visibility = show ? '' : 'hidden';
  if (!show) { mi.innerHTML = ''; return; }
  const p = v.s[v.me], mine = myTurn(), n = v.h.length;
  mi.className = 'mi' + (mine ? ' turn' : '');
  mi.style.setProperty('--pc', SEATC[v.me % 6]);
  mi.innerHTML = `<div class="av">${esc(initial(UI.dn(p)))}${mine && UI.deadline ? '<div class="tm"></div>' : ''}</div><div><b>${esc(UI.dn(p))}</b><br><small>🏆 ${p.sc} · ${esc(n === 1 ? t('cs_card1') : t('cs_cards', { n }))}</small></div>`;
  const db = $('drawBtn'); db.textContent = v.pe > 0 && mine ? t('cs_drawN', { n: v.pe }) : t('cs_draw'); db.disabled = !(mine && v.dr < 0);
  db.className = 'btn ' + (mine && v.dr < 0 && !v.h.some(UI.canPlayV) ? '' : 'sec');
  const pb = $('passBtn'); pb.hidden = !(mine && v.dr >= 0); pb.textContent = t('cs_passBtn');
  const lb = $('lastBtn'), canCall = v.ph === 'play' && !p.ca && ((n === 2 && mine && v.h.some(UI.canPlayV)) || (n === 1 && v.k === v.me));
  lb.textContent = p.ca && n <= 2 ? t('cs_lastDone') : '⚡ ' + t('cs_last');
  lb.className = p.ca && n <= 2 ? 'done' : canCall ? 'hot' : 'dim';
}
function renderHand() {
  const v = V(), hand = $('hand'), tr = hand.querySelector('.track');
  if (!v || UI.mode === 'menu') { tr.innerHTML = ''; $('handHint').textContent = ''; layoutHand(); return; }
  const ids = v.h.slice().sort((a, b) => sortKey(a) - sortKey(b));
  UI.order = ids;
  if (UI.sel >= ids.length) UI.sel = ids.length - 1;
  const mine = myTurn();
  tr.innerHTML = ids.map((id, i) => {
    const ok = UI.canPlayV(id);
    return CS.cardHTML(id, [mine ? (ok ? 'ok' : 'no') : '', UI.incoming.has(id) ? 'inc' : '', i === UI.sel ? 'sel' : ''].join(' '));
  }).join('');
  $('handHint').textContent = v.me < 0 ? '👀' : ids.length > 1 && !CS.load('hinted', false) ? t('cs_hint') : '';
  layoutHand();
}
UI.renderAll = () => { renderTop(); renderOpps(); renderTable(); renderBar(); renderHand(); };

// ---------------------------------------------------------------- hand fan, scrolling and drag-to-play
const HS = { x: 0, max: 0, vx: 0, step: 0 };
function layoutHand() {
  const hand = $('hand'); if (!hand) return; const tr = hand.querySelector('.track'), W = hand.clientWidth, cw = UI.cw, els = [...tr.children], n = els.length;
  const pad = Math.max(22, cw * 0.36);
  let step = n > 1 ? (W - cw - pad * 2) / (n - 1) : 0; step = Math.max(cw * 0.42, Math.min(cw * 0.74, step));
  const total = cw + step * (n - 1), fits = total <= W - pad * 2 + 1, off = fits ? (W - total) / 2 : pad;
  HS.max = fits ? 0 : total + pad * 2 - W; HS.x = Math.max(0, Math.min(HS.max, HS.x)); HS.step = step; HS.fits = fits;
  tr.style.width = (fits ? W : total + pad * 2) + 'px';
  els.forEach((el, i) => { el._x = off + i * step; el.style.left = el._x + 'px'; el.style.zIndex = i + 1; });
  $('scrollL').hidden = $('scrollR').hidden = fits || matchMedia('(pointer: coarse)').matches;
  positionHand();
}
function positionHand() {
  const hand = $('hand'), tr = hand.querySelector('.track'), W = hand.clientWidth, cw = UI.cw;
  tr.style.transform = `translateX(${-HS.x}px)`;
  for (const el of tr.children) {
    if (el.classList.contains('drag')) continue;
    const cx = el._x + cw / 2 - HS.x, u = Math.max(-1.3, Math.min(1.3, (cx - W / 2) / Math.max(200, W / 2)));
    const lift = el.classList.contains('sel') ? -24 : el.classList.contains('ok') ? -14 : 0;
    el.style.transform = `translateY(${u * u * 12 + lift}px) rotate(${u * 9}deg)`;
  }
}
function scrollToCard(id) {
  const el = $('hand').querySelector(`.card[data-id="${id}"]`); if (!el || HS.fits) return;
  const W = $('hand').clientWidth; HS.x = Math.max(0, Math.min(HS.max, el._x + UI.cw / 2 - W / 2)); positionHand();
}
(function handInput() {
  const hand = $('hand'); let D = null;
  hand.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || e.target.closest('button')) return;
    const card = e.target.closest('.card');
    D = { x: e.clientX, y: e.clientY, sx: HS.x, card, mode: '', t: performance.now(), lx: e.clientX, lt: performance.now(), id: e.pointerId };
    HS.vx = 0; try { hand.setPointerCapture(e.pointerId); } catch (er) {}
  });
  hand.addEventListener('pointermove', (e) => {
    if (!D || e.pointerId !== D.id) return;
    const dx = e.clientX - D.x, dy = e.clientY - D.y;
    if (!D.mode) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) D.mode = 'scroll';
      else if (dy < -10 && Math.abs(dy) > Math.abs(dx) && D.card) { D.mode = 'lift'; D.card.classList.add('drag'); D.base = D.card.style.transform; }
    }
    if (D.mode === 'scroll') {
      HS.x = Math.max(-30, Math.min(HS.max + 30, D.sx - dx)); positionHand();
      const now = performance.now(), dt = Math.max(1, now - D.lt); HS.vx = (e.clientX - D.lx) / dt * 1000; D.lx = e.clientX; D.lt = now;
    } else if (D.mode === 'lift') {
      D.card.style.transform = `translate(${dx}px, ${Math.min(0, dy)}px) scale(1.08)`;
    }
  });
  const end = (e) => {
    if (!D || (e && e.pointerId !== D.id)) return;
    const d = D; D = null;
    if (d.mode === 'scroll') { HS.x = Math.max(0, Math.min(HS.max, HS.x)); if (!CS.load('hinted', false)) { CS.save('hinted', true); $('handHint').textContent = ''; } return; }
    if (d.mode === 'lift') {
      const dy = (e ? e.clientY : d.y) - d.y, id = +d.card.dataset.id;
      if (dy < -55 && UI.canPlayV(id)) { UI.tryPlay(id, d.card.getBoundingClientRect()); d.card.classList.remove('drag'); }
      else { d.card.classList.remove('drag'); positionHand(); if (dy < -55) UI.tryPlay(id); }
      return;
    }
    if (d.card && e && e.type === 'pointerup') UI.tryPlay(+d.card.dataset.id);
  };
  hand.addEventListener('pointerup', end); hand.addEventListener('pointercancel', end);
  hand.addEventListener('wheel', (e) => { if (HS.max <= 0) return; e.preventDefault(); HS.x = Math.max(0, Math.min(HS.max, HS.x + (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX))); positionHand(); }, { passive: false });
  $('scrollL').onclick = () => { HS.vx = 1400; }; $('scrollR').onclick = () => { HS.vx = -1400; };
})();

// ---------------------------------------------------------------- animation helpers
const rectOf = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
function seatRect(i) {
  const v = V(); if (!v) return null;
  if (i === v.me) { const h = rectOf($('hand')); return h ? { x: h.cx - 30, y: h.cy - 40, w: 60, h: 80, cx: h.cx, cy: h.cy } : null; }
  return rectOf(document.querySelector(`.opp[data-seat="${i}"] .av`));
}
const discRect = () => rectOf($('disc'));
const deckRect = () => rectOf($('deck'));
function fly(html, from, to, dur, o) {
  o = o || {};
  if (!from || !to) return Promise.resolve();
  const w = to.w || UI.pw, h = w * 1.48, el = document.createElement('div');
  el.className = 'fly'; el.innerHTML = html; el.firstElementChild.style.setProperty('--w', w + 'px');
  const s0 = Math.max(0.2, (from.w || w) / w);
  const k0 = `translate(${from.cx - w / 2}px, ${from.cy - h / 2}px) rotate(${o.r0 || 0}deg) scale(${o.s0 || s0})`;
  const k1 = `translate(${to.cx - w / 2}px, ${to.cy - h / 2}px) rotate(${o.r1 || 0}deg) scale(${o.s1 || 1})`;
  el.style.transform = k0; document.body.appendChild(el);
  return new Promise((res) => {
    let done = false; const fin = () => { if (done) return; done = true; el.remove(); res(); };
    try { const an = el.animate([{ transform: k0, opacity: o.fade ? 0.2 : 1 }, { transform: k1, opacity: 1 }], { duration: dur, easing: o.ease || 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' }); an.onfinish = fin; } catch (e) { fin(); }
    setTimeout(fin, dur + 400);
  });
}
UI.fly = fly;
let toastT = 0;
UI.toast = (msg) => { const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1900); };
UI.bubble = (i, txt) => {
  const v = V(); let r = i === (v && v.me) ? rectOf($('meInfo')) : rectOf(document.querySelector(`.opp[data-seat="${i}"]`)); if (!r) return;
  const b = document.createElement('div'); b.className = 'bubble'; b.textContent = txt; b.style.left = r.cx + 'px'; b.style.top = (i === (v && v.me) ? r.y - 6 : r.y + 4) + 'px';
  document.body.appendChild(b); setTimeout(() => b.remove(), 1700);
};
const shake = () => { const a = $('app'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); };
const flash = (col) => { const f = document.createElement('div'); f.className = 'flash'; if (col) f.style.background = col; document.body.appendChild(f); setTimeout(() => f.remove(), 500); };
function reveal(id) { UI.incoming.delete(id); const el = $('hand').querySelector(`.card[data-id="${id}"]`); if (el) { el.classList.remove('inc'); el.classList.add('new'); } }
function revealTop() { UI.hideTop = -1; const top = $('disc').lastElementChild; if (top) top.style.visibility = ''; }
const CARDW = () => UI.cw;

// ---------------------------------------------------------------- present: render a new view and animate what happened
function snap() { const m = new Map(); $('hand').querySelectorAll('.card').forEach((el) => m.set(+el.dataset.id, rectOf(el))); return { hand: m }; }
UI.present = (v, evs) => {
  evs = evs || [];
  const before = snap();
  const prev = UI.V; UI.V = v;
  const play = evs.find((e) => e.k === 'play'); if (play) UI.hideTop = play.id;
  for (const e of evs) { if (e.k === 'draw' && e.p === v.me) e.ids.forEach((id) => UI.incoming.add(id)); if (e.k === 'deal') { UI.incoming = new Set(v.h); HS.x = 0; } }
  for (const id of [...UI.incoming]) if (!v.h.includes(id)) UI.incoming.delete(id);
  UI.deadline = v.dl ? Date.now() + v.dl : 0; UI.dlTotal = (v.ru && v.ru.timer || 0) * 1000;
  if (evs.some((e) => e.k === 'deal') && UI.cur && /round|match|scores|cover/.test(UI.cur.name)) UI.hide();
  UI.renderAll();
  trackStats(evs, v);
  const T = animate(evs, before, v);
  clearTimeout(UI._safe); UI._safe = setTimeout(() => { if (UI.incoming.size || UI.hideTop >= 0) { UI.incoming.clear(); UI.hideTop = -1; renderHand(); renderTable(); } }, T + 1500);
  return T;
};
function animate(evs, before, v) {
  let T = 0;
  const later = (ms, fn) => setTimeout(fn, ms);
  for (const e of evs) {
    switch (e.k) {
      case 'deal': {
        const n = v.s.length; let k = 0;
        for (let r = 0; r < 7; r++) for (let j = 1; j <= n; j++) {
          const i = (e.dealer + j) % n, ms = T + k * 42; k++;
          later(ms, () => {
            if (i === v.me) { const id = UI.order[r]; if (id == null) return; const tg = rectOf($('hand').querySelector(`.card[data-id="${id}"]`)); fly(CS.backHTML(), deckRect(), tg, 260).then(() => reveal(id)); }
            else fly(CS.backHTML(), deckRect(), seatRect(i), 260, { s1: 0.35 });
          });
        }
        later(T, () => sfx('shuffle'));
        T += k * 42 + 320; break;
      }
      case 'play': {
        const from = e.p === v.me ? (before.hand.get(e.id) || seatRect(e.p)) : seatRect(e.p), to = discRect(), r1 = ((e.id * 37) % 23) - 11, d = DECK[e.id];
        later(T, () => {
          sfx('flick');
          fly(CS.cardHTML(e.id), from, to, 340, { r0: e.p === v.me ? 0 : -40, r1 }).then(() => {
            revealTop();
            const dr = discRect(); if (dr) FX.burst(dr.cx, dr.cy, COLHEX[e.color] || '#fff', d.c === 'w' ? 34 : 16, d.c === 'w' ? 320 : 200);
            if (d.v === 'w4') { sfx('thunder'); flash(); BG.flash = 1; shake(); }
            else if (d.v === 'wild') sfx('wild');
            if (d.c === 'w') UI.toast(t('cs_e_color', { c: t('cs_c_' + e.color) }));
          });
        });
        T += 360; break;
      }
      case 'skip': later(T, () => { sfx('skip'); UI.toast(t('cs_e_skip', { p: nameOf(e.p) })); UI.bubble(e.p, '❄'); const r = seatRect(e.p); if (r) FX.snow(r.cx, r.cy); }); T += 200; break;
      case 'rev': later(T, () => { sfx('rev'); UI.toast(t('cs_e_rev')); const ring = $('ring'); ring.classList.add('flip'); setTimeout(() => ring.classList.remove('flip'), 1300); }); T += 200; break;
      case 'stack': later(T, () => { sfx('hit'); UI.toast(t('cs_e_stack', { n: e.n })); const p = $('pend'); p.classList.remove('nudge'); void p.offsetWidth; p.classList.add('nudge'); }); T += 120; break;
      case 'draw': {
        const n = e.n, step = e.why === 'rain' ? 60 : 105;
        for (let j = 0; j < n; j++) {
          later(T + j * step, () => {
            sfx('draw');
            if (e.p === v.me) { const id = e.ids[j]; const tg = rectOf($('hand').querySelector(`.card[data-id="${id}"]`)); fly(CS.backHTML(), deckRect(), tg, 300).then(() => reveal(id)); }
            else fly(CS.backHTML(), deckRect(), seatRect(e.p), 300, { s1: 0.35 });
          });
        }
        if (e.why === 'hit' || e.why === 'catch') later(T, () => { UI.toast(t('cs_e_drew', { p: nameOf(e.p), n })); if (n >= 4) shake(); });
        if (e.p === v.me && e.ids.length) later(T + 40, () => scrollToCard(e.ids[e.ids.length - 1]));
        T += Math.min(n, 8) * step + (e.why === 'rain' ? 60 : 180); break;
      }
      case 'rain': later(T, () => { sfx('rain'); UI.toast(t('cs_e_rain')); FX.rain(); }); T += 80; break;
      case 'pass': {
        later(T, () => {
          sfx('storm'); shake(); UI.toast(e.why === 'zero' ? t('cs_e_zero') : t('cs_e_storm'));
          const dr = discRect(); if (dr) FX.swirl(dr.cx, dr.cy); BG.flash = 0.5;
          const n = v.s.length; for (let i = 0; i < n; i++) fly(CS.backHTML(), seatRect(i), seatRect(((i + e.dir) % n + n) % n), 820, { s0: 0.5, s1: 0.5, r1: 360 * e.dir, ease: 'ease-in-out' });
        });
        T += 950; break;
      }
      case 'swap': later(T, () => { sfx('rev'); UI.toast(t('cs_e_swap', { a: nameOf(e.a), b: nameOf(e.b) })); fly(CS.backHTML(), seatRect(e.a), seatRect(e.b), 700, { s0: 0.5, s1: 0.5, r1: 200 }); fly(CS.backHTML(), seatRect(e.b), seatRect(e.a), 700, { s0: 0.5, s1: 0.5, r1: -200 }); }); T += 760; break;
      case 'call': later(T, () => { sfx('call'); UI.bubble(e.p, '⚡ ' + t('cs_called')); }); T += 60; break;
      case 'catch': later(T, () => { sfx('catch'); UI.toast(t('cs_caught', { a: nameOf(e.by), p: nameOf(e.p) })); flash('#ff3355'); UI.bubble(e.p, '🚨'); }); T += 260; break;
      case 'timeup': later(T, () => UI.toast(t('cs_e_timeUp', { p: nameOf(e.p) }))); T += 100; break;
      case 'nodraw': later(T, () => UI.toast(t('cs_e_noDraw'))); break;
      case 'reshuffle': later(T, () => sfx('shuffle')); T += 120; break;
      case 'turn': later(T, () => { if (e.p === v.me && v.ph === 'play' && v.s.length > 1) sfx('turn'); }); break;
      case 'round': later(T + 150, () => { UI.toast(t('cs_e_out', { p: nameOf(e.w) })); const mine = e.w === v.me; if (mine || UI.mode === 'local') { FX.confetti(); sfx('win'); } else sfx('lose'); }); T += 500; break;
    }
  }
  return T;
}
function trackStats(evs, v) {
  if (!(UI.mode === 'bots' || UI.mode === 'online') || v.me < 0) return;
  for (const e of evs) {
    if (e.k === 'play' && e.p === v.me) { CS.stat('cards'); if (DECK[e.id].v === 'storm') CS.stat('storms'); }
    if (e.k === 'catch') { if (e.by === v.me) CS.stat('catches'); if (e.p === v.me) CS.stat('caught'); }
    if (e.k === 'round') {
      CS.stat('rounds'); if (e.w === v.me) { CS.stat('rwins'); CS.statMax('best', e.pts); }
      if (e.match) {
        CS.stat('matches');
        if (e.w === v.me) { CS.stat('mwins'); CS.stat('streak'); CS.statMax('bestStreak', CS.stats.streak); if (UI.mode === 'bots') { if (v.s.some((p) => p.b && p.br === 'hard')) CS.stat('hard'); CS.stat('botWins'); CS.reportBest(); } }
        else { CS.stats.streak = 0; CS.save('stats', CS.stats); }
      }
    }
  }
}

// ---------------------------------------------------------------- playing a card from the hand
UI.tryPlay = (id, fromRect) => {
  const v = V(); if (!v || v.me < 0) return;
  const el = $('hand').querySelector(`.card[data-id="${id}"]`);
  if (!UI.canPlayV(id)) {
    sfx('bad'); if (el) { el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); }
    UI.toast(myTurn() ? t('cs_cantPlay') : t('cs_notTurn')); return;
  }
  const d = DECK[id], a = { a: 'play', id };
  const go = () => { UI.sel = -1; UI.act(a); };
  const ask7 = () => { if (d.v === '7' && v.ru.sz && v.s.length > 1) UI.show('swap', (tg) => { a.target = tg; go(); }); else go(); };
  if (d.c === 'w') UI.show('color', (c) => { a.color = c; ask7(); }); else ask7();
};
UI.act = (a) => {
  if (CS.ON && CS.ON.client) return CS.ON.sendAct(a);
  if (!CT.G) return;
  CT.apply(CT.viewSeat, a);
};

// ---------------------------------------------------------------- the match controller (this device runs the rules)
const CT = CS.CT = { G: null, kind: '', viewSeat: 0, busyUntil: 0, botAt: 0, plans: {}, paused: false, net: null, coverFor: -1, roundT: 0 };
CT.start = (kind, seats, rules, viewSeat) => {
  CT.G = E.newMatch(seats, rules); CT.G.online = kind === 'online'; CT.kind = kind; UI.mode = kind; CT.viewSeat = viewSeat || 0; CT.paused = false; CT.plans = {}; CT.coverFor = -1;
  UI.hide(); UI.incoming.clear(); UI.hideTop = -1;
  CT.newRound();
};
CT.newRound = () => {
  const G = CT.G; if (!G) return;
  clearTimeout(CT.roundT); CT.plans = {};
  E.newRound(G);
  if (CT.kind === 'local') { CT.viewSeat = G.turn; CT.coverFor = G.turn; }
  CT.flush();
  if (CT.kind === 'local') { CT.busyUntil = Date.now() + 99999; UI.show('cover', G.turn); }
};
CT.newMatch = () => { const G = CT.G; if (!G) return; for (const p of G.seats) p.score = 0; G.round = 0; G.dealer = -1; CT.newRound(); };
CT.stop = () => { CT.G = null; CT.net = null; clearTimeout(CT.roundT); };
CT.apply = (seat, a) => {
  const G = CT.G; if (!G || seat < 0 || !G.seats[seat]) return false;
  let ok = false;
  switch (a.a) {
    case 'play': if (a.call && G.seats[seat].hand.length === 2) E.call(G, seat); ok = E.play(G, seat, a.id | 0, { color: a.color, target: a.target }); break;
    case 'draw': ok = E.draw(G, seat); break;
    case 'pass': ok = E.pass(G, seat); break;
    case 'call': ok = E.call(G, seat); break;
    case 'catch': ok = E.catchP(G, seat, a.p | 0); break;
    case 'auto': ok = E.auto(G, seat); break;
  }
  if (G.ev.length) CT.flush();
  return ok;
};
CT.flush = () => {
  const G = CT.G, evs = G.ev.splice(0);
  CT.botAt = 0;
  const vs = CT.viewSeat;
  const dur = UI.present(E.view(G, vs), E.viewEvents(evs, vs));
  if (CT.net) CT.net.onFlush(evs);
  CT.busyUntil = Date.now() + Math.min(dur, 3200);
  const ended = evs.find((e) => e.k === 'round');
  if (ended) {
    clearTimeout(CT.roundT);
    CT.roundT = setTimeout(() => { if (CT.G === G && G.phase !== 'play') UI.show(G.phase === 'match' ? 'match' : 'round'); }, dur + 900);
    if (CT.net && CT.net.onRoundEnd) CT.net.onRoundEnd();
  }
  if (CT.kind === 'local' && G.phase === 'play' && G.turn !== CT.viewSeat && CT.coverFor !== G.turn) {
    CT.coverFor = G.turn; CT.busyUntil = Date.now() + 99999;
    setTimeout(() => { if (CT.G === G && CT.coverFor === G.turn && G.phase === 'play') UI.show('cover', G.turn); }, dur + 650);
  }
};
CT.reveal = (seat) => {   // same device: the next player is holding the device now
  const G = CT.G; if (!G) return;
  CT.viewSeat = seat; CT.busyUntil = Date.now() + 200; UI.hide();
  UI.present(E.view(G, seat), [{ k: 'turn', p: seat }]);
};
CT.tick = () => {
  const G = CT.G; if (!G || CT.paused || G.phase !== 'play') return;
  const now = Date.now(); if (now < CT.busyUntil) return;
  const s = G.turn, p = G.seats[s], botLike = p.kind === 'bot' || p.away;
  // bots catch players who forgot to call, and sometimes remember to call late themselves
  if (G.catchable >= 0) {
    const off = G.catchable, offP = G.seats[off];
    if (offP.kind === 'bot' || offP.away) {
      const k = 'L' + G.catchId, B = CS.BRAIN[offP.brain] || CS.BRAIN.normal;
      const pl = CT.plans[k] || (CT.plans[k] = { t: now + CS.rnd(900, 2000), go: Math.random() < B.late });
      if (pl.go && now >= pl.t) { pl.go = false; CT.apply(off, { a: 'call' }); return; }
    }
    for (let b = 0; b < G.seats.length; b++) {
      const q = G.seats[b]; if (b === off || q.kind !== 'bot') continue;
      const B = CS.BRAIN[q.brain] || CS.BRAIN.normal, k = G.catchId + ':' + b;
      const pl = CT.plans[k] || (CT.plans[k] = { t: now + CS.rnd(B.catchT[0], B.catchT[1]), go: Math.random() < B.catchP });
      if (pl.go && now >= pl.t) { pl.go = false; CT.apply(b, { a: 'catch', p: off }); return; }
    }
  }
  if (botLike) {
    if (!CT.botAt) CT.botAt = now + CS.botThink(G, s) + (G.catchable >= 0 && G.catchable !== s ? 1500 : 0);
    else if (now >= CT.botAt) {
      CT.botAt = 0;
      const m = CS.botMove(G, s);
      if (!CT.apply(s, m)) CT.apply(s, { a: 'auto' });
    }
  }
  if (CT.net && G.rules.timer > 0 && !botLike && now - G.turnAt > G.rules.timer * 1000 + 400) CT.apply(s, { a: 'auto' });
};
setInterval(CT.tick, 100);

// ---------------------------------------------------------------- screens
const SCR = UI.SCR = {};
const ACT = UI.ACT = {};
UI.show = (name, ...args) => {
  const ov = $('ov'), fn = SCR[name]; if (!fn) return;
  UI.cur = { name, args };
  ov.className = ['menu', 'cover'].includes(name) ? 'solid' : ['color', 'swap'].includes(name) ? 'clear' : '';
  ov.innerHTML = fn(...args); ov.hidden = false;
  $('hand').classList.toggle('hidden', name === 'cover');
  if (window.Mal3abPopButtons) window.Mal3abPopButtons();
};
UI.hide = () => { $('ov').hidden = true; $('ov').innerHTML = ''; UI.cur = null; $('hand').classList.remove('hidden'); };
UI.refresh = () => { if (UI.cur) UI.show(UI.cur.name, ...UI.cur.args); };
const cfg = CS.cfg = Object.assign({ bots: 3, brain: 'normal', np: 3, names: [], rules: Object.assign({}, CS.DEF_RULES) }, CS.load('cfg', {}));
cfg.rules = Object.assign({}, CS.DEF_RULES, cfg.rules);
const saveCfg = () => CS.save('cfg', cfg);
CS.saveCfg = saveCfg;
const seg = (act, vals, cur, label) => `<div class="seg">${vals.map((v) => `<button class="${v === cur ? 'on' : ''}" data-act="${act}" data-arg="${v}">${esc(label ? label(v) : v)}</button>`).join('')}</div>`;
UI.seg = seg;
const tgtLabel = (v) => (v ? String(v) : t('cs_oneRound'));
const timerLabel = (v) => (v ? t('cs_sec', { n: v }) : t('cs_none'));

SCR.menu = () => {
  const fan = [firstOf('7', 'r'), firstOf('skip', 'y'), firstOf('wild'), firstOf('storm', 'g'), firstOf('w4')].map((id, i) => CS.cardHTML(id, '', `transform:translateX(-50%) rotate(${(i - 2) * 14}deg) translateY(${Math.abs(i - 2) * 6}px)`)).join('');
  return `<div class="panel" data-m3pop>
    <div class="hero"><div class="fanlogo">${fan}</div><h1>${esc(t('cs_title'))}</h1><div class="tag">${esc(t('cs_tag'))}</div></div>
    <div class="menuBtns">
      <button class="btn" data-act="goBots">🤖 ${esc(t('cs_vsBots'))}</button>
      <button class="btn sec" data-act="goLocal">📱 ${esc(t('cs_local'))}</button>
      <button class="btn sec" data-act="goOnline">🌐 ${esc(t('cs_online'))}</button>
      <div class="row"><button class="btn sec small grow" data-act="how">📖 ${esc(t('cs_how'))}</button><button class="btn sec small grow" data-act="rules">⚙ ${esc(t('cs_rules'))}</button></div>
      <div class="row"><button class="btn sec small grow" data-act="stats">📊 ${esc(t('cs_stats'))}</button><button class="btn sec small grow" data-act="sound">${CS.audio.on ? '🔊' : '🔇'} ${esc(t('cs_sound'))}: ${esc(t(CS.audio.on ? 'cs_on' : 'cs_off'))}</button></div>
      <button class="btn sec small" data-act="lang">🌐 ${esc(t('cs_lang'))}</button>
    </div></div>`;
};
const nameInput = () => authName() ? '' : `<div class="lbl">${esc(t('cs_namePh', { n: 1 }).replace(/\s*1$/, ''))}</div><input class="tx" id="csMyName" maxlength="16" value="${esc(CS.load('name', ''))}" placeholder="${esc(t('cs_you'))}" autocomplete="off" spellcheck="false">`;
UI.nameInput = nameInput;
const rulesSummary = (r) => [r.target ? t('cs_target', { n: r.target }) : t('cs_oneRound'), r.stack ? t('cs_r_stack') : '', r.until ? t('cs_r_until') : '', r.sz ? t('cs_r_sz') : '', r.tw ? t('cs_r_tw') : ''].filter(Boolean).join(' · ');
UI.rulesSummary = rulesSummary;
SCR.bots = () => `<div class="panel" data-m3pop><h2>🤖 ${esc(t('cs_vsBots'))}</h2>
  ${nameInput()}
  <div class="lbl">${esc(t('cs_bots'))}</div>${seg('setBots', [1, 2, 3, 4, 5], cfg.bots)}
  <div class="lbl">${esc(t('cs_brain'))}</div>${seg('setBrain', ['easy', 'normal', 'hard'], cfg.brain, (v) => t('cs_' + v))}
  <p class="muted" style="font-size:13px">${esc(rulesSummary(cfg.rules))}</p>
  <div class="row"><button class="btn sec" data-act="rules" data-arg="bots">⚙ ${esc(t('cs_rules'))}</button><span class="grow"></span><button class="btn sec" data-act="menu">${esc(t('cs_back'))}</button><button class="btn" data-act="startBots">▶ ${esc(t('cs_start'))}</button></div></div>`;
SCR.local = () => {
  let rows = '';
  for (let i = 0; i < cfg.np; i++) rows += `<div class="pl" style="--pc:${SEATC[i]}"><div class="av">${i + 1}</div><input class="tx" data-pname="${i}" maxlength="14" value="${esc(cfg.names[i] || '')}" placeholder="${esc(t('cs_namePh', { n: i + 1 }))}" autocomplete="off" spellcheck="false"></div>`;
  return `<div class="panel" data-m3pop><h2>📱 ${esc(t('cs_local'))}</h2>
    <div class="lbl">${esc(t('cs_players'))}</div>${seg('setNp', [2, 3, 4, 5, 6], cfg.np)}
    <div class="plist">${rows}</div>
    <p class="muted" style="font-size:13px">${esc(rulesSummary(cfg.rules))}</p>
    <div class="row"><button class="btn sec" data-act="rules" data-arg="local">⚙ ${esc(t('cs_rules'))}</button><span class="grow"></span><button class="btn sec" data-act="menu">${esc(t('cs_back'))}</button><button class="btn" data-act="startLocal">▶ ${esc(t('cs_start'))}</button></div></div>`;
};
// the rules panel edits cfg.rules, or the online lobby's rules when opened from there (UI.rulesTarget)
SCR.rules = (back) => {
  const r = UI.rulesTarget ? UI.rulesTarget.get() : cfg.rules, ro = UI.rulesTarget && UI.rulesTarget.readOnly;
  const tog = (k) => `<div class="opt"><div><b>${esc(t('cs_r_' + k))}</b><small>${esc(t('cs_r_' + k + 'D'))}</small></div><button class="sw2${r[k] ? ' on' : ''}" data-act="${ro ? '' : 'rule'}" data-arg="${k}" ${ro ? 'disabled' : ''}></button></div>`;
  return `<div class="panel" data-m3pop><h2>⚙ ${esc(t('cs_rules'))}</h2>
    ${tog('stack')}${tog('until')}${tog('sz')}${tog('tw')}
    <div class="lbl">${esc(t('cs_r_target'))}</div>${ro ? `<p>${esc(tgtLabel(r.target))}</p>` : seg('ruleTarget', CS.TARGETS, r.target, tgtLabel)}
    <div class="lbl">${esc(t('cs_r_timer'))}</div>${ro ? `<p>${esc(timerLabel(r.timer))}</p>` : seg('ruleTimer', CS.TIMERS, r.timer, timerLabel)}
    <div class="row center"><button class="btn" data-act="rulesBack" data-arg="${esc(back || 'menu')}">${esc(t('cs_close'))}</button></div></div>`;
};
SCR.how = (back) => {
  const g = (id, k, dk) => `${CS.cardHTML(id)}<div><b>${esc(t(k))}</b><span>${esc(t(dk))}</span></div>`;
  return `<div class="panel wide" data-m3pop><h2>📖 ${esc(t('cs_how'))}</h2>
    <ul class="how">${['cs_h1', 'cs_h2', 'cs_h3', 'cs_h4', 'cs_h5'].map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>
    <div class="gloss">${g(firstOf('5', 'b'), 'cs_k_num', 'cs_d_num')}${g(firstOf('skip', 'r'), 'cs_k_skip', 'cs_d_skip')}${g(firstOf('rev', 'g'), 'cs_k_rev', 'cs_d_rev')}${g(firstOf('d2', 'y'), 'cs_k_d2', 'cs_d_d2')}
      ${g(firstOf('wild'), 'cs_k_wild', 'cs_d_wild')}${g(firstOf('w4'), 'cs_k_w4', 'cs_d_w4')}${g(firstOf('storm', 'b'), 'cs_k_storm', 'cs_d_storm')}${g(firstOf('rain', 'r'), 'cs_k_rain', 'cs_d_rain')}</div>
    <p class="muted" style="font-size:12px">${esc(t('cs_keys'))}</p>
    <div class="row center"><button class="btn" data-act="back" data-arg="${esc(back || 'menu')}">${esc(t('cs_close'))}</button></div></div>`;
};
SCR.stats = () => {
  const s = CS.stats, it = (k, v) => `<div><b>${v}</b><small>${esc(t(k))}</small></div>`;
  return `<div class="panel" data-m3pop><h2>📊 ${esc(t('cs_stats'))}</h2><div class="stats">
    ${it('cs_s_mwins', s.mwins + ' / ' + s.matches)}${it('cs_s_rwins', s.rwins + ' / ' + s.rounds)}${it('cs_s_best', s.best)}${it('cs_s_streak', s.bestStreak || 0)}
    ${it('cs_s_cards', s.cards)}${it('cs_s_storms', s.storms)}${it('cs_s_catch', s.catches)}${it('cs_s_caught', s.caught)}${it('cs_s_hard', s.hard || 0)}</div>
    <div class="row"><button class="btn sec small" data-act="resetStats">${esc(t('cs_reset'))}</button><span class="grow"></span><button class="btn" data-act="menu">${esc(t('cs_close'))}</button></div></div>`;
};
SCR.color = (cb) => {
  UI._cb = cb; const v = V(), cnt = { r: 0, y: 0, g: 0, b: 0 }; for (const id of v.h) if (DECK[id].c !== 'w') cnt[DECK[id].c]++;
  return `<div class="panel" data-m3pop style="width:min(340px,100%)"><h2 class="center">🌈 ${esc(t('cs_pickColor'))}</h2><div class="colors">
    ${CS.COLORS.map((c) => `<button data-act="pickColor" data-arg="${c}" style="background:linear-gradient(150deg,var(--c${c}1),var(--c${c}2))">${esc(t('cs_c_' + c))}<small>${esc(t('cs_have', { n: cnt[c] }))}</small></button>`).join('')}</div>
    <button class="btn sec small" data-act="cancelPick">✕</button></div>`;
};
SCR.swap = (cb) => {
  UI._cb = cb; const v = V();
  return `<div class="panel" data-m3pop style="width:min(360px,100%)"><h2>🔄 ${esc(t('cs_swapWith'))}</h2><div class="plist">
    ${seatOrder(v).map((i) => `<div class="pl" style="--pc:${SEATC[i % 6]}"><div class="av">${v.s[i].b ? '🤖' : esc(initial(UI.dn(v.s[i])))}</div><div class="grow"><b>${esc(UI.dn(v.s[i]))}</b><small>${esc(t('cs_cards', { n: v.s[i].c }))}</small></div><button class="btn small" data-act="pickSwap" data-arg="${i}">🔄</button></div>`).join('')}</div>
    <button class="btn sec small" data-act="cancelPick">✕</button></div>`;
};
SCR.cover = (seat) => {
  const G = CT.G, p = G && G.seats[seat]; if (!p) return '';
  const k = G.catchable, kp = k >= 0 ? G.seats[k] : null;
  return `<div class="panel cover" data-m3pop><div class="bigav" style="--pc:${SEATC[seat % 6]}">${esc(initial(p.name))}</div>
    <h2 class="center">${esc(t('cs_passTo', { p: p.name }))}</h2><p class="muted">${esc(t('cs_passHide'))}</p>
    ${kp && !kp.called ? `<div class="row center"><button class="btn red small" data-act="coverCatch">🚨 ${esc(t('cs_catch', { p: kp.name }))}</button><button class="btn sec small" data-act="coverCall">⚡ ${esc(t('cs_lateCall', { p: kp.name }))}</button></div>` : ''}
    <button class="btn" style="padding:14px" data-act="reveal" data-arg="${seat}">👀 ${esc(t('cs_imReady', { p: p.name }))}</button></div>`;
};
function standings(v, withHands) {
  const L = v.last, order = v.s.map((p, i) => i).sort((a, b) => v.s[b].sc - v.s[a].sc), tg = v.ru.target || 0;
  return `<div class="plist">${order.map((i) => {
    const p = v.s[i], win = L && L.w === i, pct = tg ? Math.min(100, p.sc / tg * 100) : 0;
    return `<div class="pl${win ? ' win' : ''}" style="--pc:${SEATC[i % 6]}"><div class="av">${p.b ? '🤖' : esc(initial(UI.dn(p)))}</div><div class="grow"><b>${esc(UI.dn(p))}${i === v.me && UI.dn(p) !== t('cs_you') ? ' · ' + esc(t('cs_you')) : ''}</b>
      ${L ? `<small>${win ? esc(t('cs_pts', { n: L.pts })) : esc(t('cs_handPts', { n: L.each[i] }))}</small>` : ''}
      ${tg ? `<div class="bar2"><i style="width:${pct}%"></i></div>` : ''}
      ${withHands && L && L.hands[i] && L.hands[i].length ? `<div class="mhand">${L.hands[i].slice(0, 16).map((id) => CS.cardHTML(id)).join('')}</div>` : ''}</div>
      <span class="pts">${p.sc}${tg ? '/' + tg : ''}</span></div>`;
  }).join('')}</div>`;
}
UI.standings = standings;
const ctrlHere = () => !(CS.ON && CS.ON.client);
SCR.round = () => {
  const v = V(); if (!v || !v.last) return '';
  const L = v.last, me = L.w === v.me;
  const btns = ctrlHere() ? `<button class="btn" data-act="nextRound">▶ ${esc(t('cs_nextRound'))}</button>` : `<p class="muted center">${esc(t('cs_waitHost'))}</p>`;
  return `<div class="panel" data-m3pop><h2 class="center">${me ? esc(t('cs_youWinRound')) : '🌪 ' + esc(t('cs_roundWin', { p: nameOf(L.w) }))}</h2>
    <p class="center muted">${esc(t('cs_pts', { n: L.pts }))} · ${esc(v.ru.target ? t('cs_target', { n: v.ru.target }) : t('cs_oneRound'))}</p>
    ${standings(v, true)}<p class="muted center" id="csAuto"></p>
    <div class="row center">${btns}<button class="btn sec" data-act="quit">${esc(t('cs_menu'))}</button></div></div>`;
};
SCR.match = () => {
  const v = V(); if (!v || !v.last) return '';
  const L = v.last, me = L.w === v.me;
  const btns = ctrlHere() ? `<button class="btn" data-act="newMatch">▶ ${esc(t('cs_newMatch'))}</button>` : `<p class="muted center">${esc(t('cs_waitHost'))}</p>`;
  return `<div class="panel" data-m3pop><h2 class="center" style="font-size:24px">${me ? esc(t('cs_youWinMatch')) : esc(t('cs_matchWin', { p: nameOf(L.w) }))}</h2>
    ${v.me >= 0 && !me && UI.mode !== 'local' ? `<p class="center muted">${esc(t('cs_youLose'))}</p>` : ''}
    ${standings(v, false)}
    <div class="row center">${btns}<button class="btn sec" data-act="quit">${esc(t('cs_menu'))}</button></div></div>`;
};
SCR.scores = () => { const v = V(); if (!v) return ''; return `<div class="panel" data-m3pop><h2>🏆 ${esc(t('cs_scores'))} · ${esc(t('cs_round', { n: v.r }))}</h2>${standings(v, false)}<p class="muted" style="font-size:13px">${esc(rulesSummary(v.ru))}</p><div class="row center"><button class="btn" data-act="close">${esc(t('cs_close'))}</button></div></div>`; };
SCR.pause = () => {
  const online = UI.mode === 'online';
  return `<div class="panel" data-m3pop><h2>⏸ ${esc(t(online ? 'cs_menu' : 'cs_paused'))}</h2>${online ? `<p class="note">${esc(t('cs_onlineNote'))}</p>` : ''}
    <div class="menuBtns"><button class="btn" data-act="resume">▶ ${esc(t('cs_resume'))}</button>
    <div class="row"><button class="btn sec small grow" data-act="how" data-arg="pause">📖 ${esc(t('cs_how'))}</button><button class="btn sec small grow" data-act="scores">🏆 ${esc(t('cs_scores'))}</button></div>
    <div class="row"><button class="btn sec small grow" data-act="sound">${CS.audio.on ? '🔊' : '🔇'} ${esc(t('cs_sound'))}: ${esc(t(CS.audio.on ? 'cs_on' : 'cs_off'))}</button><button class="btn sec small grow" data-act="lang">🌐 ${esc(t('cs_lang'))}</button></div>
    <button class="btn red small" data-act="quit">🚪 ${esc(t('cs_quit'))}</button></div></div>`;
};

const readName = () => { const i = $('csMyName'); if (i) { const n = i.value.trim().slice(0, 16); CS.save('name', n); } };
UI.readName = readName;
const usedBotNames = (k) => { const a = CS.shuffle([0, 1, 2, 3, 4, 5, 6, 7]); return a.slice(0, k); };
CS.botNames = usedBotNames;
Object.assign(ACT, {
  menu() { readName(); UI.toMenu(); },
  goBots() { UI.show('bots'); }, goLocal() { UI.show('local'); },
  how(b) { UI.show('how', b || (UI.cur && UI.cur.name) || 'menu'); },
  rules(b) { readName(); UI.rulesTarget = null; UI.show('rules', b || 'menu'); },
  rulesBack(b) { if (b === 'lobby' && CS.ON) { UI.rulesTarget = null; CS.ON.toLobby(); return; } UI.rulesTarget = null; if (b === 'pause') UI.show('pause'); else UI.show(SCR[b] ? b : 'menu'); },
  back(b) { if (b === 'pause') UI.show('pause'); else if (b === 'lobby' && CS.ON) CS.ON.toLobby(); else UI.show(SCR[b] ? b : 'menu'); },
  stats() { UI.show('stats'); }, resetStats() { CS.resetStats(); UI.show('stats'); },
  sound() { CS.audio.set(!CS.audio.on); sfx('click'); UI.refresh(); },
  lang() { setLang(getLang() === 'ar' ? 'en' : 'ar'); },
  setBots(n) { readName(); cfg.bots = +n; saveCfg(); UI.show('bots'); },
  setBrain(b) { readName(); cfg.brain = b; saveCfg(); UI.show('bots'); },
  setNp(n) { readNames(); cfg.np = +n; saveCfg(); UI.show('local'); },
  rule(k) { const r = UI.rulesTarget ? UI.rulesTarget.get() : cfg.rules; r[k] = !r[k]; if (UI.rulesTarget) UI.rulesTarget.set(r); else saveCfg(); sfx('click'); UI.refresh(); },
  ruleTarget(v) { const r = UI.rulesTarget ? UI.rulesTarget.get() : cfg.rules; r.target = +v; if (UI.rulesTarget) UI.rulesTarget.set(r); else saveCfg(); UI.refresh(); },
  ruleTimer(v) { const r = UI.rulesTarget ? UI.rulesTarget.get() : cfg.rules; r.timer = +v; if (UI.rulesTarget) UI.rulesTarget.set(r); else saveCfg(); UI.refresh(); },
  startBots() { readName(); UI.startBots(cfg.bots, cfg.brain); },
  startLocal() { readNames(); const names = []; for (let i = 0; i < cfg.np; i++) names.push((cfg.names[i] || '').trim() || t('cs_defName', { n: i + 1 })); UI.startLocal(names); },
  pickColor(c) { const cb = UI._cb; UI.hide(); if (cb) cb(c); },
  pickSwap(i) { const cb = UI._cb; UI.hide(); if (cb) cb(+i); },
  cancelPick() { UI._cb = null; UI.hide(); },
  catch(i) { UI.act({ a: 'catch', p: +i }); },
  coverCatch() { const G = CT.G; if (G && G.catchable >= 0) { CT.apply(G.turn === G.catchable ? (G.turn + 1) % G.seats.length : G.turn, { a: 'catch', p: G.catchable }); UI.show('cover', CT.coverFor); } },
  coverCall() { const G = CT.G; if (G && G.catchable >= 0) { CT.apply(G.catchable, { a: 'call' }); UI.show('cover', CT.coverFor); } },
  reveal(s) { CT.reveal(+s); },
  nextRound() { if (CS.ON && CS.ON.host) return CS.ON.nextRound(); UI.hide(); CT.newRound(); },
  newMatch() { if (CS.ON && CS.ON.host) return CS.ON.newMatch(); UI.hide(); CT.newMatch(); },
  scores() { UI.show('scores'); },
  close() { if (CT.paused) UI.show('pause'); else UI.hide(); },
  resume() { CT.paused = false; CT.busyUntil = Date.now() + 300; UI.hide(); if (CT.kind === 'local' && CT.G && CT.G.phase === 'play' && CT.viewSeat !== CT.G.turn) UI.show('cover', CT.G.turn); },
  quit() { if (CS.ON && CS.ON.code) { CS.ON.leave(); } CT.stop(); UI.toMenu(); }
});
function readNames() { document.querySelectorAll('[data-pname]').forEach((i) => { cfg.names[+i.dataset.pname] = i.value.trim().slice(0, 14); }); saveCfg(); }
UI.toMenu = () => { CT.stop(); UI.mode = 'menu'; UI.V = null; UI.renderAll(); UI.show('menu'); };
UI.startBots = (n, brain) => {
  n = Math.max(1, Math.min(5, n | 0)); brain = CS.BRAIN[brain] ? brain : 'normal';
  const bn = usedBotNames(n);
  const seats = [{ id: 'me', name: UI.myName(), kind: 'human' }];
  for (let i = 0; i < n; i++) seats.push({ id: 'bot' + i, name: '#bot:' + bn[i], kind: 'bot', brain });
  CT.start('bots', seats, cfg.rules, 0);
};
UI.startLocal = (names) => {
  const seats = names.slice(0, 6).map((n, i) => ({ id: 'p' + i, name: n, kind: 'human' }));
  if (seats.length < 2) return;
  CT.start('local', seats, cfg.rules, 0);
};
UI.pause = () => {
  if (UI.mode === 'menu') return;
  if (UI.cur && UI.cur.name === 'pause') { ACT.resume(); return; }
  if (UI.cur && ['color', 'swap', 'cover', 'round', 'match'].includes(UI.cur.name)) return;
  if (UI.mode !== 'online') CT.paused = true;
  UI.show('pause');
};

// ---------------------------------------------------------------- wiring
$('ov').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b || !b.dataset.act || b.disabled) return;
  const f = ACT[b.dataset.act]; if (f) { if (!['sound', 'pickColor'].includes(b.dataset.act)) sfx('click'); f(b.dataset.arg); }
});
$('ov').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { const b = $('ov').querySelector('.btn:not(.sec)[data-act]'); if (b && ACT[b.dataset.act]) ACT[b.dataset.act](b.dataset.arg); } });
$('opps').addEventListener('click', (e) => { const b = e.target.closest('[data-act="catch"]'); if (b) ACT.catch(b.dataset.arg); });
$('drawBtn').onclick = () => { if (myTurn() && V().dr < 0) UI.act({ a: 'draw' }); };
$('deck').onclick = () => { if (myTurn() && V().dr < 0) UI.act({ a: 'draw' }); else if (UI.V && UI.mode !== 'menu') { sfx('bad'); } };
$('passBtn').onclick = () => { if (myTurn() && V().dr >= 0) UI.act({ a: 'pass' }); };
$('lastBtn').onclick = () => { const v = V(); if (!v || v.me < 0) return; const p = v.s[v.me]; if (p.ca) return; if (v.h.length <= 2) UI.act({ a: 'call' }); else sfx('bad'); };
$('scoreBtn').onclick = () => { if (UI.V && UI.mode !== 'menu' && !(UI.cur && UI.cur.name === 'cover')) UI.show('scores'); };
$('pauseBtn').onclick = () => UI.pause();
$('langBtn').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
document.addEventListener('keydown', (e) => {
  if (e.target.matches && e.target.matches('input')) return;
  const k = e.key;
  if (k === 'Escape' || k === 'p' || k === 'P') { if (UI.cur && ['color', 'swap'].includes(UI.cur.name)) ACT.cancelPick(); else UI.pause(); return; }
  if (UI.cur || !UI.V || UI.mode === 'menu') return;
  const n = UI.order.length;
  if (k === 'ArrowRight' || k === 'ArrowLeft') { if (!n) return; UI.sel = UI.sel < 0 ? (k === 'ArrowRight' ? 0 : n - 1) : (UI.sel + (k === 'ArrowRight' ? 1 : -1) + n) % n; renderHand(); scrollToCard(UI.order[UI.sel]); e.preventDefault(); }
  else if ((k === 'Enter' || k === ' ') && UI.sel >= 0 && UI.order[UI.sel] != null) { UI.tryPlay(UI.order[UI.sel]); e.preventDefault(); }
  else if (k === 'd' || k === 'D') $('drawBtn').click();
  else if (k === 'l' || k === 'L') $('lastBtn').click();
  else if (k === 'c' || k === 'C') { const v = V(); if (v.k >= 0 && v.k !== v.me) ACT.catch(v.k); }
  else if (k === 'Tab') { e.preventDefault(); }
});
document.addEventListener('langchange', () => { UI.renderAll(); UI.refresh(); });
let bestSent = false;
const sendBestOnce = () => { if (bestSent) return; bestSent = true; CS.reportBest(); };
if (window.Mal3abReady) setTimeout(sendBestOnce, 0);
document.addEventListener('mal3abready', () => { sendBestOnce(); UI.renderAll(); if (UI.cur && ['menu', 'bots'].includes(UI.cur.name)) UI.refresh(); });
addEventListener('resize', resize);

// main loop: particles, sky, hand momentum, turn timers
let last = performance.now(), lastTick = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  FX.step(dt); BG.step(dt);
  if (Math.abs(HS.vx) > 5) { HS.x = Math.max(0, Math.min(HS.max, HS.x - HS.vx * dt)); HS.vx *= Math.pow(0.9, dt * 60); positionHand(); if (HS.x <= 0 || HS.x >= HS.max) HS.vx = 0; }
  if (UI.deadline && UI.dlTotal) {
    const rem = Math.max(0, UI.deadline - Date.now()), pct = (rem / UI.dlTotal * 100).toFixed(1) + '%';
    document.querySelectorAll('.tm').forEach((el) => el.style.setProperty('--p', pct));
    if (myTurn() && rem < 5000 && rem > 0) { const s = Math.ceil(rem / 1000); if (s !== lastTick) { lastTick = s; sfx('tick'); } }
  }
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- start
window.ColorStorm = {
  CS, CT, UI,
  get state() { return CT.G; }, get view() { return UI.V; },
  startBots: (n, brain, rules) => { if (rules) Object.assign(cfg.rules, rules); UI.startBots(n, brain); },
  startLocal: (names, rules) => { if (rules) Object.assign(cfg.rules, rules); UI.startLocal(names); },
  act: (a) => UI.act(a), play: (id, color, target) => UI.act({ a: 'play', id, color, target }), playable: () => (UI.V ? UI.V.h.filter(UI.canPlayV) : []),
  // play the rest of this round by itself (tests): bots brain plays for every seat on this device
  autoplay(on) { CT.G && CT.G.seats.forEach((p) => { if (p.kind === 'human') p.away = !!on; }); }
};
resize(); UI.renderAll();
requestAnimationFrame(loop);
setTimeout(() => { if (!UI.cur && UI.mode === 'menu' && !/[?&]room=/.test(location.search)) UI.show('menu'); }, 0);
})();
