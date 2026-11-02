// Jelly Dash — online shows: Supabase broadcast rooms for up to 8 players (bots fill the field)
// Each player simulates their own jelly and broadcasts it ~12 times a second. The host runs the clock the obstacles follow,
// the bots, the qualifying lists and the move to the next round. If the host leaves, the next player in join order takes over.
'use strict';

const NET = {
  ch: null, code: '', ready: false, settled: false, me: '', jt: 0, peers: new Map(), hb: null, host: '', off: 0, offS: [], sendT: 0, showT: 0, tileQ: [], tileT: 0,
  cfg: { diff: 1, field: 12, len: 4 }, name: '',
  now() { return (Date.now() + this.off) / 1000; },
  isHost() { return !!this.code && this.host === this.me; },
  info() { return { code: this.code, host: this.isHost(), hostId: this.host, me: this.me, peers: this.peers.size, ready: this.ready, settled: this.settled, off: Math.round(this.off) }; }
};
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => { let c = ''; for (let i = 0; i < 5; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
const pageLink = () => location.href.split('?')[0].split('#')[0];
const inviteLink = (c) => pageLink() + '?room=' + c;
const idKey = (c) => 'jelly-dash-id-' + c;
const ssGet = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const ssSet = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const byJoin = (a, b) => (a.jt - b.jt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const everyone = () => [{ id: NET.me, jt: NET.jt, n: NET.name, c: LOOK.c, k: LOOK.k }].concat([...NET.peers.values()]).sort(byJoin);
const hostId = () => everyone()[0].id;
const NET_EVENTS = ['hello', 'hb', 'bye', 'full', 'cfg', 'show', 'st', 'ev', 'tls', 'lobby'];
const r2 = (x) => Math.round(x * 100) / 100, r1 = (x) => Math.round(x * 10) / 10;

function netSend(ev, p) {
  if (!NET.ch || !NET.ready) return;
  try { NET.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: NET.me, ts: Date.now() + NET.off }, p || {}) }); } catch (e) {}
}
function hello(req) { netSend('hello', { req: !!req, n: NET.name, jt: NET.jt, c: LOOK.c, k: LOOK.k, cfg: NET.isHost() ? NET.cfg : undefined, ph: S ? 'show' : 'lobby' }); }
function netBeat() {
  if (!NET.ch) return;
  netSend('hb', { n: NET.name, jt: NET.jt, c: LOOK.c, k: LOOK.k, cfg: NET.isHost() ? NET.cfg : undefined, ph: S ? 'show' : 'lobby' });
  const t = Date.now(); for (const q of [...NET.peers.values()]) if (t - q.t > 9000) peerGone(q);
}
async function joinRoom(code, create) {
  if (!window.sb) { $('onMsg').textContent = t('jd_noNet'); return false; }
  if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false;
  code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (code.length < 4) { $('onMsg').textContent = t('jd_badCode'); return false; }
  if (G.round || S) backToMenu();
  NET.leave(true);
  let me = ssGet(idKey(code));   // a reload (or coming back within 2 minutes) keeps the same seat
  if (!me || typeof me !== 'object' || !me.id) me = { id: uid(), jt: Date.now() };
  if (create) me.jt = 1;
  ssSet(idKey(code), me);
  const nm = ($('onName').value || '').trim() || myName(); store.set('name', nm.slice(0, 16));
  Object.assign(NET, { me: me.id, jt: +me.jt || Date.now(), code, ready: false, settled: false, peers: new Map(), host: me.id, off: 0, offS: [], tileQ: [], name: nm.slice(0, 16) });
  G.type = 'online'; S = null;
  const ch = sb.channel('jelly-dash-' + code, { config: { broadcast: { self: false, ack: false } } });
  for (const ev of NET_EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { if (NET.ch === ch) try { onNet(ev, payload); } catch (e) { console.warn(e); } });
  ch.subscribe((st) => { if (st === 'SUBSCRIBED' && NET.ch === ch && !NET.ready) { NET.ready = true; hello(true); setTimeout(() => settle(ch), 1600); NET.renderLobby(); } });
  NET.ch = ch;
  try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
  clearInterval(NET.hb); NET.hb = setInterval(netBeat, 2000);
  show('lobby'); NET.renderLobby();
  return true;
}
NET.leave = (quiet) => {
  if (NET.ch) { netSend('bye', {}); const ch = NET.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
  clearInterval(NET.hb); NET.ch = null; NET.ready = false; NET.settled = false; NET.code = ''; NET.peers = new Map(); NET.host = ''; NET.off = 0;
  if (G.type === 'online') G.type = '';
  if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
};
function settle(ch) {
  if (NET.ch !== ch) return;
  const ahead = [...NET.peers.values()].filter(q => byJoin(q, { id: NET.me, jt: NET.jt }) < 0).length;
  if (ahead >= MAXH) { roomFull(); return; }
  NET.settled = true; NET.host = hostId(); hello(false); NET.renderLobby();
}
function roomFull() { NET.leave(); if (G.round) backToMenu(); show('online'); $('onMsg').textContent = t('jd_full'); Snd.play('bump'); }
function checkHost() {
  const h = hostId(); if (h === NET.host) return;
  NET.host = h; NET.offS = [];
  if (NET.settled) { const q = NET.peers.get(h); toast(t('jd_newHost', { p: iso(h === NET.me ? t('jd_youShort') : q ? q.n : '?') }), 2.6); }
  if (NET.isHost()) takeOver();
  NET.renderLobby();
}
// the new host picks up the show: missing players get bot stand-ins, bots run here now
function takeOver() {
  if (!S) return;
  for (const f of S.field) if (!f.b && f.out < 0 && f.id !== NET.me && !NET.peers.has(f.id)) f.sd = 1;
  if (G.round) syncRound();
  NET.sendShow();
}
function peerGone(q) {
  if (!NET.peers.has(q.id)) return;
  NET.peers.delete(q.id);
  toast(t('jd_left', { p: iso(q.n || '?') }));
  checkHost();
  if (NET.isHost() && S) { const f = fieldOf(q.id); if (f && !f.b && f.out < 0 && !f.sd) { f.sd = 1; if (G.round) syncRound(); NET.sendShow(); } }
  NET.renderLobby();
}
function onNet(ev, p) {
  if (!p || !p.id || p.id === NET.me) return;
  const tnow = Date.now();
  if (ev === 'full') { if (p.to === NET.me) roomFull(); return; }
  let q = NET.peers.get(p.id);
  if (ev === 'bye') { if (q) peerGone(q); return; }
  if (!q && (ev === 'hello' || ev === 'hb')) {
    const later = byJoin({ id: p.id, jt: +p.jt || tnow }, { id: NET.me, jt: NET.jt }) > 0;
    if (NET.peers.size >= MAXH - 1 && later) { if (NET.isHost()) netSend('full', { to: p.id }); return; }
    q = { id: p.id, n: String(p.n || '?').slice(0, 16), jt: +p.jt || tnow, c: p.c | 0, k: p.k | 0, t: tnow };
    NET.peers.set(p.id, q);
    if (NET.settled) { toast(t('jd_joined', { p: iso(q.n) })); Snd.play('pop'); }
    checkHost();
    if (NET.isHost() && S) { NET.sendShow(); sendTiles(); }
  }
  if (q) { q.t = tnow; if (p.n) q.n = String(p.n).slice(0, 16); if (p.c != null) q.c = p.c | 0; if (p.k != null) q.k = p.k | 0; if (p.jt != null && isFinite(+p.jt)) q.jt = +p.jt; }
  // keep the shared clock in step with the host (the earliest arrival is the best estimate)
  if (p.id === NET.host && !NET.isHost() && isFinite(p.ts)) {
    NET.offS.push(p.ts - tnow); if (NET.offS.length > 40) NET.offS.shift();
    const target = Math.max(...NET.offS) + 30;
    NET.off = Math.abs(target - NET.off) > 400 ? target : NET.off + (target - NET.off) * 0.2;
  }
  switch (ev) {
    case 'hello': case 'hb':
      checkHost();
      if (p.id === NET.host && p.cfg) NET.cfg = Object.assign({}, NET.cfg, p.cfg);
      if (ev === 'hello' && p.req) hello(false);
      if (NET.isHost() && S) { const f = fieldOf(p.id); if (f && f.sd && f.out < 0) { f.sd = 0; toast(t('jd_backP', { p: iso(q ? q.n : '?') })); if (G.round) syncRound(); NET.sendShow(); } }
      NET.renderLobby();
      break;
    case 'cfg': if (p.id === NET.host && p.cfg) { NET.cfg = Object.assign({}, NET.cfg, p.cfg); NET.renderLobby(); } break;
    case 'show': if (p.id === hostId() && p.s) { applyShow(p.s); if (S && S.ph === 'end' && G.round && G.round.fake && G.uiPh !== 'end' + S.serial) onEnd(); NET.renderLobby(); } break;
    case 'lobby': if (p.id === NET.host) toLobbyLocal(); break;
    case 'st': onState(p); break;
    case 'ev': onEv(p); break;
    case 'tls': if (S && G.round && p.r === S.serial && Array.isArray(p.a)) for (const a of p.a) applyTile(a[0] | 0, +a[1]); break;
  }
}
function unpack(a, ts) { const f = a[8] | 0; return { ts, x: +a[0], y: +a[1], z: +a[2], vx: +a[3], vy: +a[4], vz: +a[5], yaw: +a[6], st: a[7] | 0, g: !!(f & 1), gr: !!(f & 2), d: !!(f & 4), iv: !!(f & 8) }; }
function pack(j) { return [r2(j.pos.x), r2(j.pos.y), r2(j.pos.z), r1(j.vel.x), r1(j.vel.y), r1(j.vel.z), r2(j.yaw), j.st | 0, (j.grounded ? 1 : 0) | (j.grabbing ? 2 : 0) | (!j.visible || j.dead > 0 ? 4 : 0) | (j.inv > 0 ? 8 : 0)]; }
function onState(p) {
  if (!S || !G.round || G.round.fake || p.r !== S.serial) return;
  const ts = (+p.ts || Date.now() + NET.off) / 1000;
  if (Array.isArray(p.p)) { const j = G.byId.get(p.id); if (j && j.kind === 'remote') pushState(j, unpack(p.p, ts)); }
  if (Array.isArray(p.b) && p.id === NET.host) for (const b of p.b) { const j = G.byId.get(b[0]); if (j && j.kind === 'remote') pushState(j, unpack(b.slice(1), ts)); }
}
function onEv(p) {
  const e = p.e; if (!e || !S) return;
  if (e.k === 'tl') { if (G.round && e.r === S.serial && Array.isArray(e.a)) for (const a of e.a) applyTile(a[0] | 0, +a[1]); return; }
  if (e.k === 'slow') { const j = G.byId.get(e.to); if (j && j.kind !== 'remote') j.slowT = 0.4; return; }
  if (NET.isHost() && (e.k === 'fin' || e.k === 'out' || e.k === 'grab') && e.id === p.id) hostEv(e);
}
NET.ev = (e) => netSend('ev', { e });
NET.tile = (i, T) => { NET.tileQ.push([i, Math.round(T * 1000) / 1000]); };
NET.sendShow = () => { if (!NET.isHost() || !S) return; netSend('show', { s: S }); NET.showT = 1.5; };
function sendTiles() { if (!S || !G.round || !W.tiles.length) return; const a = []; W.tiles.forEach((tl, i) => { if (tl.st >= 1 && isFinite(tl.tt) && tl.tt < 1e8) a.push([i, Math.round(tl.tt * 1000) / 1000]); }); if (a.length) netSend('tls', { r: S.serial, a }); }
NET.tick = (dt) => {
  if (!NET.ch || !NET.ready) return;
  NET.sendT -= dt; NET.showT -= dt; NET.tileT -= dt;
  if (NET.tileQ.length && NET.tileT <= 0 && S) { netSend('ev', { e: { k: 'tl', r: S.serial, a: NET.tileQ.splice(0, 60) } }); NET.tileT = 0.1; }
  if (NET.isHost() && S && NET.showT <= 0) NET.sendShow();
  if (!G.round || G.round.fake || !S || NET.sendT > 0) return;
  NET.sendT = 1 / 12.5;
  const pl = { r: S.serial }; let any = false;
  const me = G.byId.get(NET.me);
  if (me && me.kind === 'p' && !me.out && (me.visible || me.dead > 0)) { pl.p = pack(me); any = true; }
  if (NET.isHost()) { const b = []; for (const j of G.ents) if (j.kind === 'bot' && !j.out && (j.visible || j.dead > 0)) b.push([j.id].concat(pack(j))); if (b.length) { pl.b = b; any = true; } }
  if (any) netSend('st', pl);
};
// the host starts a show with everyone in the room, bots fill the rest
function hostStartShow() {
  if (!NET.isHost() || !NET.settled) return;
  const humans = everyone().slice(0, MAXH).map(p => ({ id: p.id, n: p.n, c: p.c, k: p.k }));
  const cfg = { diff: NET.cfg.diff | 0, len: NET.cfg.len | 0 || 4, field: Math.max(humans.length, NET.cfg.field | 0 || 12) };
  S = newShow('online', humans, cfg); G.statDone = {}; G.endDone = '';
  hostStartRound(0);
  Snd.play('go');
}
function toLobbyLocal() {
  teardownWorld(); S = null; G.round = null; G.views = []; $('vps').innerHTML = ''; $('intro').hidden = true;
  show('lobby'); NET.renderLobby(); Snd.music('menu');
}
NET.endButtons = (add) => {
  if (NET.isHost()) { add(t('jd_newShow'), '', hostStartShow); add(t('jd_toLobby'), 'sec', () => { netSend('lobby', {}); toLobbyLocal(); }); }
  else { const p = document.createElement('p'); p.style.cssText = 'width:100%;text-align:center;margin:0'; p.textContent = t('jd_waitHost'); $('endBtns').appendChild(p); }
  add(t('jd_leave'), 'sec', backToMenu);
};
NET.renderLobby = () => {
  if ($('lobby').hidden) return;
  setText($('lbCode'), NET.code || '----');
  const list = NET.code ? everyone() : [], host = NET.host;
  $('lbList').innerHTML = list.map(p => `<div class="pl"><i style="background:${hexs(COLORS[p.c % 12])}"></i><span>${esc(p.n)}</span>${p.id === host ? '👑' : ''}${p.id === NET.me ? `<small>${esc(t('jd_youTag'))}</small>` : ''}</div>`).join('')
    + (list.length ? `<div class="pl bot"><i style="background:linear-gradient(135deg,#ff5d8f,#4cc9f0)"></i><span>${esc(t('jd_botsFill', { n: Math.max(0, Math.max(list.length, NET.cfg.field) - list.length) }))}</span>🤖</div>` : '');
  const H = NET.isHost(), c = NET.cfg, n = list.length;
  if (H) {
    $('lbSet').innerHTML = `<select id="lbDiff" style="flex:1">${diffOpts(c.diff)}</select><select id="lbField" style="flex:1">${[4, 6, 8, 10, 12].filter(x => x >= n).map(x => opt(x, t('jd_jellies', { n: x }), Math.max(n, c.field))).join('')}</select><select id="lbLen" style="flex:1">${[3, 4, 5].map(x => opt(x, t('jd_rounds', { n: x }), c.len)).join('')}</select>`;
    const upd = () => { NET.cfg = { diff: +$('lbDiff').value, field: +$('lbField').value, len: +$('lbLen').value }; netSend('cfg', { cfg: NET.cfg }); NET.renderLobby(); };
    $('lbDiff').onchange = upd; $('lbField').onchange = upd; $('lbLen').onchange = upd;
  } else $('lbSet').innerHTML = `<div class="pl" style="flex:1;justify-content:center"><small>${esc(t('jd_d' + (c.diff | 0)))} · ${esc(t('jd_jellies', { n: Math.max(n, c.field) }))} · ${esc(t('jd_rounds', { n: c.len }))}</small></div>`;
  const b = $('bLbStart'); b.hidden = !H; b.disabled = !NET.ready || !NET.settled;
  setText($('lbNote'), !NET.ready || !NET.settled ? t('jd_connecting') : S ? t('jd_showOn') : H ? t('jd_hostNote') : t('jd_waitHost'));
};
// online screen buttons
$('bCreate').onclick = () => { Snd.ensure(); Snd.play('ui'); joinRoom(newCode(), true); };
$('bJoin').onclick = () => { Snd.ensure(); Snd.play('ui'); joinRoom($('onCode').value, false); };
$('onCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('bJoin').click(); });
$('bLeave').onclick = () => { Snd.play('ui'); backToMenu(); };
$('bLbStart').onclick = () => { Snd.ensure(); hostStartShow(); };
$('bCopy').onclick = async () => {
  const link = inviteLink(NET.code); let ok = false;
  try { await navigator.clipboard.writeText(link); ok = true; } catch (e) { try { const ta = document.createElement('textarea'); ta.value = link; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (er) {} }
  toast(ok ? t('jd_copied') : link, ok ? 2 : 6); Snd.play('pop');
};
addEventListener('pagehide', () => { if (NET.ch) netSend('bye', {}); });

// Mal3ab hooks: invite links, live rooms list
window.Mal3abShareLink = () => NET.code ? inviteLink(NET.code) : pageLink();
window.Mal3abPrepareInvite = async () => {
  if (!NET.code) { if (!$('onName').value) $('onName').value = store.get('name', '') || myName(); const ok = await joinRoom(newCode(), true); if (!ok) return pageLink(); }
  return NET.code ? inviteLink(NET.code) : pageLink();
};
window.Mal3abLiveInfo = () => {
  if (!NET.code) return {};
  const f = S && fieldOf(NET.me), me = NET.me;
  const out = !!(S && S.ph !== 'pre' && (!f || f.out >= 0 || (S.ord.includes(me) && S.o.includes(me)) || (S.ph === 'res' && S.ord.includes(me) && !S.q.includes(me))));
  return { players: 1 + NET.peers.size, max: MAXH, hidden: false, out };
};

boot();
{ // invite link: ?room=CODE joins that room
  const room = new URLSearchParams(location.search).get('room');
  if (room) {
    let tried = false;
    const go = () => { if (tried || NET.code) return; tried = true; $('onName').value = store.get('name', '') || myName(); joinRoom(room, false); };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
  }
}
