// Turbo Goal — online play for up to 6 (Supabase Realtime broadcast room "turbo-goal-CODE").
// The host (room creator; if it leaves, the earliest joiner still here) runs the ball, the bots, the boost pads, the clock and the
// score, and streams a snapshot ~18×/s. Every player drives their own car locally (instant controls) and streams its state ~15×/s.
// The ball is predicted locally too: when your car hits it you see the hit at once and send a "hit claim"; the host checks the claim
// against its own recent ball path and either takes it (everyone gets the new ball) or ignores it (you get pulled back, smoothly).
// Remote cars are dead-reckoned from their last state; all corrections fade in through a visual offset instead of snapping.
(function () {
  'use strict';
  const I = window.TGI, T = window.TGCore, TGO = window.TGO, G = I.G, STEP = T.STEP;
  const $ = (id) => document.getElementById(id);
  const esc = I.esc, clamp = T.clamp;
  addStrings({
    tg_oName: 'اسمك في الأوضة', tg_create: 'اعمل أوضة', tg_join: 'ادخل', tg_codePh: 'الكود', tg_orJoin: 'أو ادخل أوضة صاحبك',
    tg_room: 'أوضة', tg_copy: 'انسخ لينك الدعوة', tg_copied: 'اتنسخ ✓', tg_switch: 'غيّر فريقك', tg_startM: 'ابدأ الماتش', tg_waitHost: 'مستنيين المضيف يبدأ…',
    tg_leaveRoom: 'اخرج من الأوضة', tg_full: 'الأوضة مليانة', tg_joinedP: '{p} دخل الأوضة', tg_leftP: '{p} خرج', tg_backP: '{p} رجع', tg_newHost: '{p} بقى المضيف 👑',
    tg_connecting: 'بيتصل…', tg_inMatch: 'في ماتش شغال دلوقتي — هتدخل أول ما يفضى مكان أو الماتش يخلص.', tg_hostOnly: 'المضيف بس اللي يغيّر الإعدادات',
    tg_aloneT: 'كله خرج', tg_aloneP: 'مفيش لاعيبة تانيين في الأوضة. تكمّل ضد البوتات؟', tg_keepBots: 'كمّل مع البوتات', tg_backLobby: 'ارجع للأوضة',
    tg_badCode: 'اكتب كود صح', tg_botSeat: '🤖 بوت', tg_host: 'المضيف', tg_waitNext: 'مستنيين المضيف…', tg_lobbyNote: 'البوتات بتكمّل الأماكن الفاضية. ممكن 3 في كل فريق.',
    tg_tookSeat: '{p} دخل مكان بوت', tg_lagNote: 'النت بطيء — الكورة ممكن ترجع حبة', tg_shareNote: 'ابعت الكود أو اللينك لصحابك',
  }, {
    tg_oName: 'Your Name in the Room', tg_create: 'Create Room', tg_join: 'Join', tg_codePh: 'Code', tg_orJoin: "Or join a friend's room",
    tg_room: 'Room', tg_copy: 'Copy Invite Link', tg_copied: 'Copied ✓', tg_switch: 'Switch Team', tg_startM: 'Start Match', tg_waitHost: 'Waiting for the host to start…',
    tg_leaveRoom: 'Leave Room', tg_full: 'The room is full', tg_joinedP: '{p} joined the room', tg_leftP: '{p} left', tg_backP: '{p} is back', tg_newHost: '{p} is the host now 👑',
    tg_connecting: 'Connecting…', tg_inMatch: "A match is on right now — you'll join when a seat frees up or the match ends.", tg_hostOnly: 'Only the host can change the settings',
    tg_aloneT: 'Everyone Left', tg_aloneP: 'No other players are left in the room. Keep playing against the bots?', tg_keepBots: 'Keep Playing With Bots', tg_backLobby: 'Back to Lobby',
    tg_badCode: 'Enter a valid code', tg_botSeat: '🤖 Bot', tg_host: 'Host', tg_waitNext: 'Waiting for the host…', tg_lobbyNote: 'Bots fill the empty seats. Up to 3 per team.',
    tg_tookSeat: "{p} took a bot's seat", tg_lagNote: 'Slow connection — the ball may jump back a little', tg_shareNote: 'Send the code or the link to your friends',
  });

  const MAXP = 6, LIVE_MS = 9000, AWAY_MS = 120000;
  const EVENTS = ['hello', 'hb', 'bye', 'full', 'ro', 'team', 'cfg', 'start', 'st', 'car', 'hit', 'pd', 'dm', 'dc', 'goal', 'ko', 'over', 'lobby', 'ot', 'fd', 'pi', 'po'];
  const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]; return c; };
  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (code) => pageLink() + '?room=' + code;
  const ON = {
    ch: null, code: '', ready: false, me: '', jt: 0, host: null, created: false, subAt: 0, peers: {}, hb: null, seats: {}, cfg: { size: 2, diff: 'normal', len: 5 },
    inMatch: false, mt: 0, owners: {}, away: {}, off: 0, rtt: 0.15, samples: [], pingT: 0, carT: 0, stT: 0, ssT: 0, claimK: 0, pend: null, claimDue: null, claimT: 0, acks: {},
    hist: [], hostTouchT: -9, padLocal: {}, lastHs: -1, hitFxT: 0, aloneShown: false, msg: '', dcT: {}, joining: false,
  };
  window.TGOnline = ON;
  const amHost = () => !!ON.code && ON.host === ON.me;
  const peerLive = (P) => !!P && !P.gone && Date.now() - P.t < LIVE_MS;
  const isLiveId = (id) => id === ON.me ? !!ON.code : peerLive(ON.peers[id]);
  const jtOf = (id) => id === ON.me ? ON.jt : (ON.peers[id] ? ON.peers[id].jt : Infinity);
  const nameOf = (id) => id === ON.me ? myName() : (ON.peers[id] ? ON.peers[id].n : '…');
  const hostNow = () => Date.now() + (amHost() ? 0 : ON.off);
  function myName() { const a = window.Auth && Auth.name && Auth.name(); if (a) return String(a).slice(0, 16); return (I.LS.get('name', '') || '').slice(0, 16) || t('tg_pN', { n: 1 }); }
  function send(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me, jt: ON.jt }, p || {}) }); } catch (e) {} }
  const members = () => Object.keys(ON.seats).filter(isLiveId).sort((a, b) => jtOf(a) - jtOf(b) || (a < b ? -1 : 1));
  const carOf = (cid) => G.W && G.W.cars.find(c => c.cid === cid);
  const myCar = () => G.W && G.W.cars.find(c => c.kind === 'human' && c.owner === ON.me);
  const gar = () => { const g = I.GAR; return [g.design | 0, g.accent | 0, g.trail | 0]; };

  // ------------------------------------------------------------------ packing
  const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
  function packCar(c) {
    return [c.cid, r2(c.pos.x), r2(c.pos.y), r2(c.pos.z), r3(c.q.x), r3(c.q.y), r3(c.q.z), r3(c.q.w), r2(c.vel.x), r2(c.vel.y), r2(c.vel.z), r2(c.w.x), r2(c.w.y), r2(c.w.z),
      Math.round(c.boost), (c.boosting ? 1 : 0) | (c.grounded ? 2 : 0) | (c.sup ? 4 : 0) | (c.dead ? 8 : 0) | (c.inp.slide ? 16 : 0), r2(c.n.x), r2(c.n.y), r2(c.n.z), r2(c.inp.steer || 0)];
  }
  const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _w = new THREE.Vector3();
  // a remote car's new state, moved forward by the message's age; the jump from where it was drawn fades out
  function applyCar(c, a, age, exact) {
    if (!c || !Array.isArray(a)) return;
    const f = a[15] | 0;
    _v.set(c.pos.x + c.off.x, c.pos.y + c.off.y, c.pos.z + c.off.z);
    c.pos.set(a[1], a[2], a[3]); c.q.set(a[4], a[5], a[6], a[7]).normalize(); c.vel.set(a[8], a[9], a[10]); c.w.set(a[11], a[12], a[13]);
    c.boost = a[14]; c.boosting = !!(f & 1); c.grounded = !!(f & 2); c.sup = !!(f & 4); c.inp.slide = !!(f & 16); c.inp.steer = a[19] || 0;
    if (a[16] !== undefined) c.n.set(a[16], a[17], a[18]);
    const dead = !!(f & 8);
    if (dead && !c.dead) { const m = I.G.meshes.get(c.cid); if (m) m.g.visible = false; }
    if (!dead && c.dead && performance.now() < (c.demoHold || 0)) { /* the host just demolished it: wait for its owner to hear */ }
    else c.dead = dead;
    if (age > 0 && !c.dead) {
      c.pos.addScaledVector(c.vel, age);
      if (!c.grounded) { c.pos.y -= 0.5 * T.GRAV * age * age; c.vel.y -= T.GRAV * age; }
      T.rotateBy(c.q, c.w, age);
      keepCar(c);
    }
    c.lastSt = performance.now();
    if (exact) { c.off.set(0, 0, 0); c.rp.copy(c.pos); c.rq.copy(c.q); return; }
    c.off.copy(_v).sub(c.pos);
    if (c.off.lengthSq() > 144) c.off.set(0, 0, 0);
  }
  function keepCar(c) {
    const f = T.sdf(c.pos.x, c.pos.y, c.pos.z);
    if (f < T.C.RIDE * 0.95) {
      T.normalAt(c.pos.x, c.pos.y, c.pos.z, _w); c.pos.addScaledVector(_w, T.C.RIDE - f);
      const vn = c.vel.dot(_w); if (vn < 0) c.vel.addScaledVector(_w, -vn);
    }
  }
  const scratch = T.makeBall();
  function setBallFrom(b, arr, age) {   // the ball state from a message, played forward by its age with the real physics
    scratch.pos.set(arr[0], arr[1], arr[2]); scratch.vel.set(arr[3], arr[4], arr[5]); scratch.w.set(arr[6], arr[7], arr[8]);
    const n = Math.min(40, Math.round(age / STEP));
    for (let i = 0; i < n; i++) T.ballMove(scratch, STEP);
    _v.copy(b.pos).add(b.off);
    b.pos.copy(scratch.pos); b.vel.copy(scratch.vel); b.w.copy(scratch.w); b.pp.copy(b.pos);
    b.off.copy(_v).sub(b.pos);
    if (b.off.lengthSq() > 225) b.off.set(0, 0, 0);
  }
  const packBall = (b) => [r2(b.pos.x), r2(b.pos.y), r2(b.pos.z), r2(b.vel.x), r2(b.vel.y), r2(b.vel.z), r2(b.w.x), r2(b.w.y), r2(b.w.z)];

  // ------------------------------------------------------------------ room, seats, host
  function teamCount(team) { return members().filter(id => ON.seats[id] === team).length; }
  function hostSeatAll() {
    if (!amHost()) return false;
    const before = JSON.stringify([ON.seats, ON.cfg]);
    for (const id in ON.seats) if (!isLiveId(id)) delete ON.seats[id];
    if (ON.seats[ON.me] === undefined) ON.seats[ON.me] = 0;
    for (const P of Object.values(ON.peers).filter(peerLive).sort((a, b) => a.jt - b.jt)) {
      if (ON.seats[P.id] !== undefined || P.full) continue;
      if (members().length >= MAXP) { P.full = true; send('full', { to: P.id }); continue; }
      const team = teamCount(0) <= teamCount(1) ? 0 : 1;
      ON.seats[P.id] = team;
      if (!ON.inMatch) ON.cfg.size = Math.max(ON.cfg.size, teamCount(team));
      I.toast(t('tg_joinedP', { p: P.n })); I.AU.play('click');
      if (ON.inMatch) seatInMatch(P.id);
    }
    if (!ON.inMatch) ON.cfg.size = clamp(Math.max(ON.cfg.size, teamCount(0), teamCount(1)), 1, 3);
    const changed = JSON.stringify([ON.seats, ON.cfg]) !== before;
    if (changed) { sendRoster(); lobbyRefresh(); }
    return changed;
  }
  function rosterPayload() {
    return { cfg: ON.cfg, s: members().map(id => [id, ON.seats[id], nameOf(id)]), im: ON.inMatch ? 1 : 0, mt: ON.mt, ow: G.W && G.online ? G.W.cars.map(c => [c.cid, c.owner || null]) : null };
  }
  function sendRoster() { if (amHost()) send('ro', rosterPayload()); }
  function applyRoster(p) {
    if (amHost() || p.id !== ON.host) return;
    if (p.cfg) ON.cfg = { size: clamp(p.cfg.size | 0, 1, 3), diff: p.cfg.diff || 'normal', len: p.cfg.len | 0 || 5 };
    const seats = {};
    for (const q of p.s || []) { const id = String(q[0]); seats[id] = q[1] | 0; if (id !== ON.me) { const P = ON.peers[id] || (ON.peers[id] = { id, n: '…', jt: Infinity, t: Date.now() }); if (q[2]) P.n = String(q[2]).slice(0, 16); } }
    ON.seats = seats;
    ON.inMatch = !!p.im;
    if (p.ow && G.W && G.online && p.mt === ON.mt) {
      let ch = false;
      for (const [cid, ow] of p.ow) { const c = carOf(cid); if (c && c.kind !== 'human' && c.owner !== ow) { c.owner = ow; c.name = ow ? nameOf(ow) : ''; ch = true; } }
      if (ch) I.buildHud();
    }
    lobbyRefresh();
  }
  function setHost(h) {
    const prev = ON.host; if (h === prev) return;
    ON.host = h; ON.samples = []; ON.off = 0;
    if (prev && ON.code) I.toast(t('tg_newHost', { p: nameOf(h) }));
    if (amHost()) { hostSeatAll(); sendRoster(); if (G.online && G.W && ON.inMatch) becomeHost(); }
    lobbyRefresh();
  }
  function electHost() {
    if (!ON.code || (ON.host && isLiveId(ON.host))) return;
    const ms = members();
    if (!ms.length && !ON.created && Date.now() - ON.subAt < 2500) return;
    const pool = ms.length ? ms : [ON.me];
    pool.sort((a, b) => jtOf(a) - jtOf(b) || (a < b ? -1 : 1));
    setHost(pool[0]);
  }
  function adoptHost(h) {
    if (!h || h === ON.host || !isLiveId(h)) return;
    if (!ON.host || !isLiveId(ON.host)) { setHost(h); return; }
    if (jtOf(h) < jtOf(ON.host) || (jtOf(h) === jtOf(ON.host) && h < ON.host)) setHost(h);
  }
  // the host left mid-match: run the ball, the bots and the clock from what we last saw
  function becomeHost() {
    G.auth = true;
    for (const c of G.W.cars) {
      if (c.owner === ON.me) continue;
      if (c.owner && isLiveId(c.owner)) { c.kind = 'remote'; continue; }
      if (c.owner) ON.away[c.cid] = { id: c.owner, until: Date.now() + AWAY_MS };
      toBot(c);
    }
    for (const p of G.W.pads) if (!p.on) p.t = 4;
    ON.hist = []; ON.acks = {};
    if (G.phase === 'wait' || G.phase === 'none') I.startKickoff();
    sendRoster();
  }
  function toBot(c) {
    c.owner = null; c.kind = 'bot'; c.diff = ON.cfg.diff; c.ext = false; c.pp.copy(c.pos); c.pq.copy(c.q); c.rp.copy(c.pos); c.rq.copy(c.q);
    c.inp.thr = c.inp.steer = c.inp.pitch = c.inp.roll = 0; c.inp.jump = c.inp.boost = c.inp.slide = false; c.ai.think = 0; c.ai.seq = 0;
    if (!c.botName) c.bi = (c.bi | 0);
  }
  // a player arrives while a match is on: give back their old car, or a bot's seat
  function seatInMatch(id) {
    if (!amHost() || !G.W || !G.online) return;
    if (G.W.cars.some(c => c.owner === id)) { sendStart(id); return; }
    let car = null;
    for (const cid in ON.away) { const a = ON.away[cid]; if (a.id === id && Date.now() < a.until) { const c = carOf(cid); if (c && !c.owner) car = c; } }
    if (!car) {
      const team = ON.seats[id];
      car = G.W.cars.find(c => !c.owner && c.team === team) || G.W.cars.find(c => !c.owner);
      if (car) ON.seats[id] = car.team;
    }
    if (!car) return;   // all seats taken by players: they wait in the lobby
    ON.seats[id] = car.team;
    const back = ON.away[car.cid] && ON.away[car.cid].id === id;
    delete ON.away[car.cid];
    car.owner = id; car.kind = 'remote'; car.ext = true; car.name = nameOf(id); car.lastSt = performance.now();
    const P = ON.peers[id]; if (P && P.gr) { /* their garage look shows from the next match */ }
    I.toast(back ? t('tg_backP', { p: nameOf(id) }) : t('tg_tookSeat', { p: nameOf(id) }));
    I.buildHud();
    sendStart(id); sendRoster();
  }

  // ------------------------------------------------------------------ joining and leaving
  async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
  function joinRoom(code, create) {
    code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (code.length < 4) return false;
    if (ON.ch) leaveRoom(true);
    let id = ''; try { id = sessionStorage.getItem('turbo-goal-id-' + code) || ''; } catch (e) {}
    if (!id) { id = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('turbo-goal-id-' + code, id); } catch (e) {} }
    Object.assign(ON, { me: id, code, ready: false, jt: Date.now(), peers: {}, seats: {}, created: !!create, host: create ? id : null, subAt: Date.now(), inMatch: false, mt: 0, away: {}, samples: [], off: 0, pend: null, acks: {}, aloneShown: false, msg: '' });
    if (create) { ON.seats[id] = 0; ON.cfg = { size: 1, diff: 'normal', len: 5 }; }
    if (!window.sb) return false;
    const ch = sb.channel('turbo-goal-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; ON.subAt = Date.now(); hello(true); lobbyRefresh(); } });
    ON.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    clearInterval(ON.hb); ON.hb = setInterval(beat, 2000);
    return true;
  }
  function leaveRoom(quiet) {
    if (ON.ch) { send('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.peers = {}; ON.seats = {}; ON.host = null; ON.created = false; ON.inMatch = false;
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  }
  const beatPayload = () => {
    const o = { n: myName(), h: ON.host, gr: gar(), ph: G.online && G.W ? 'match' : 'lobby', mt: ON.mt };
    if (amHost()) Object.assign(o, rosterPayload());
    return o;
  };
  function hello(req) { send('hello', Object.assign(beatPayload(), { req: !!req })); }
  function beat() {
    if (!ON.ch) return;
    for (const P of Object.values(ON.peers)) if (!P.gone && Date.now() - P.t > LIVE_MS) peerGone(P.id);
    electHost();
    if (amHost()) hostSeatAll();
    send('hb', beatPayload());
    if (amHost()) for (const cid in ON.away) if (Date.now() > ON.away[cid].until) delete ON.away[cid];
  }
  function peerGone(id) {
    const P = ON.peers[id]; if (!P || P.gone) return;
    P.gone = true;
    const wasHost = ON.host === id, seated = ON.seats[id] !== undefined;
    delete ON.seats[id];
    if (wasHost) { ON.host = null; electHost(); }
    if (!seated) return;
    I.toast(t('tg_leftP', { p: P.n }) + (wasHost && ON.host ? ' · ' + t('tg_newHost', { p: nameOf(ON.host) }) : ''));
    if (amHost() && G.online && G.W) {
      for (const c of G.W.cars) if (c.owner === id) { ON.away[c.cid] = { id, until: Date.now() + AWAY_MS }; toBot(c); }
      sendRoster();
    }
    if (G.online && G.W && !members().some(m => m !== ON.me) && !ON.aloneShown && G.phase !== 'over') { ON.aloneShown = true; showAlone(); }
    lobbyRefresh();
  }
  function showAlone() {
    I.showOverlay(`<div class="panel" data-m3pop><h2>${t('tg_aloneT')}</h2><p>${t('tg_aloneP')}</p>
      <button class="btn" id="aKeep">${t('tg_keepBots')}</button><button class="btn sec" id="aMenu">${t('tg_menu')}</button></div>`, 'alone');
    $('aKeep').onclick = () => { I.hideOverlay(); };
    $('aMenu').onclick = () => { leaveRoom(); I.toMenu(); };
  }

  // ------------------------------------------------------------------ messages
  function onNet(ev, p) {
    if (!p || !p.id || p.id === ON.me) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === ON.me) { leaveRoom(); ON.msg = t('tg_full'); I.toast(t('tg_full')); if (G.online) I.toMenu('online'); else lobbyRefresh(true); } return; }
    if (ev === 'bye') { peerGone(p.id); return; }
    if (ev === 'pi') { if (amHost()) send('po', { to: p.id, t0: p.t0, th: Date.now() }); return; }
    if (ev === 'po') { if (p.to === ON.me) onPong(p); return; }
    let P = ON.peers[p.id];
    if (!P) P = ON.peers[p.id] = { id: p.id, n: '…', jt: p.jt || now, t: now };
    if (ev === 'hello' && p.req) P.full = false;
    if (P.full) { if (ev === 'hello' && amHost()) send('full', { to: p.id }); return; }
    if (P.gone && ev !== 'hello' && ev !== 'hb') return;
    const wasGone = P.gone;
    P.gone = false; P.t = now; if (p.jt) P.jt = p.jt; if (p.n) P.n = String(p.n).slice(0, 16); if (p.gr) P.gr = p.gr;
    if (ev === 'hello' || ev === 'hb') {
      adoptHost(p.h);
      if (!ON.host && p.cfg) adoptHost(p.id);
      if (ev === 'hello' && p.req) hello(false);
      if (amHost()) {
        hostSeatAll();
        if (ON.inMatch && ON.seats[p.id] !== undefined && (wasGone || (p.ph !== 'match' || p.mt !== ON.mt))) seatInMatch(p.id);
      } else if (p.id === ON.host && p.cfg) applyRoster(p);
      electHost();
      lobbyRefresh();
      return;
    }
    if ((ev === 'st' || ev === 'ro' || ev === 'start') && (!ON.host || !isLiveId(ON.host))) adoptHost(p.id);
    switch (ev) {
      case 'ro': applyRoster(p); break;
      case 'team': if (amHost() && !ON.inMatch) switchTeam(p.id); break;
      case 'start': onStart(p); break;
      case 'st': onSnap(p); break;
      case 'car': onCar(p); break;
      case 'hit': if (amHost()) onHit(p); break;
      case 'pd': if (amHost() && G.W && p.mt === ON.mt) { const s = G.W.pads[p.i | 0]; if (s && s.on) { s.on = false; s.t = T.PADS[p.i | 0].big ? 10 : 4; } } break;
      case 'dc': if (amHost()) onDemoClaim(p); break;
      case 'dm': if (p.id === ON.host && G.W && p.mt === ON.mt) { const v = carOf(p.v), by = carOf(p.by); if (v) { v.demoHold = performance.now() + 1500; I.applyDemo(v, by, true); } } break;
      case 'goal': if (p.id === ON.host && G.W && p.mt === ON.mt && G.phase !== 'goal' && G.phase !== 'replay') { G.score = p.sc.slice(); I.onGoal(p); } break;
      case 'ko': if (p.id === ON.host && G.W && p.mt === ON.mt) { const age = clamp((hostNow() - p.ht) / 1000, 0, 0.5); if (G.phase === 'replay') { G.rp = null; $('rp').hidden = true; } I.startKickoff(p.sp, Math.max(0.2, p.cd - age) * 1000); } break;
      case 'ot': if (p.id === ON.host) { G.ot = true; I.banner(t('tg_ot'), t('tg_otSub'), 'w', 2.2); } break;
      case 'over': if (p.id === ON.host && G.W && p.mt === ON.mt && G.phase !== 'over') { ON.inMatch = false; I.endMatch(p); } break;
      case 'lobby': if (p.id === ON.host) { ON.inMatch = false; G.online = false; I.toMenu('online'); } break;
      case 'fd': if (p.id === ON.host && p.k === 'save') { const c = carOf(p.c); if (c) I.feed(t('tg_save', { p: esc(I.carLabel(c)) })); } break;
    }
  }
  function onPong(p) {
    const now = Date.now(), rtt = now - p.t0; if (rtt < 0 || rtt > 3000) return;
    ON.samples.push([rtt, p.th + rtt / 2 - now]); if (ON.samples.length > 8) ON.samples.shift();
    const best = ON.samples.reduce((a, b) => b[0] < a[0] ? b : a);
    ON.off = best[1]; ON.rtt = best[0] / 1000;
  }
  function switchTeam(id) {
    const cur = ON.seats[id]; if (cur === undefined) return;
    const to = 1 - cur;
    if (teamCount(to) >= 3) return;
    ON.seats[id] = to; ON.cfg.size = clamp(Math.max(ON.cfg.size, teamCount(0), teamCount(1)), 1, 3);
    sendRoster(); lobbyRefresh();
  }

  // ------------------------------------------------------------------ match start (host) / join (everyone)
  function buildCars() {
    const size = ON.cfg.size, out = [], bi0 = Math.floor(Math.random() * 10);
    let bi = bi0;
    for (let team = 0; team < 2; team++) {
      const hs = members().filter(id => ON.seats[id] === team).slice(0, size);
      for (let i = 0; i < size; i++) {
        const id = hs[i], cid = (team ? 'o' : 'b') + i;
        if (id) { const g = id === ON.me ? gar() : ((ON.peers[id] && ON.peers[id].gr) || [i, i * 3, i]); out.push([cid, team, nameOf(id), id, g[0] | 0, g[1] | 0, g[2] | 0, 0]); }
        else { out.push([cid, team, '', null, bi % 4, (bi * 4 + 2) % 9, (bi * 3) % 5, bi]); bi++; }
      }
    }
    return out;
  }
  function startMatch() {
    if (!amHost()) return;
    const extra = members().filter(id => ON.seats[id] !== undefined);
    ON.cfg.size = clamp(Math.max(ON.cfg.size, teamCount(0), teamCount(1)), 1, 3);
    void extra;
    ON.mt = (Date.now() % 1e9) | 0; ON.inMatch = true; ON.away = {}; ON.acks = {}; ON.aloneShown = false;
    const cars = buildCars();
    send('start', { mt: ON.mt, cfg: ON.cfg, cars, ht: Date.now() });
    setupMatch(cars, null);
    sendRoster();
  }
  function sendStart(to) {
    if (!G.W) return;
    const cars = G.W.cars.map(c => [c.cid, c.team, c.owner ? nameOf(c.owner) : '', c.owner || null, c.design | 0, c.accent | 0, c.trail | 0, c.bi | 0]);
    const cur = { sc: G.score, ck: G.clock, ot: G.ot ? 1 : 0, ph: G.phase, cs: G.W.cars.map(packCar), pd: G.W.pads.map(p => p.on ? 1 : 0).join(''), b: packBall(G.W.ball), st: G.W.cars.map(c => [c.cid, c.st]) };
    send('start', { mt: ON.mt, cfg: ON.cfg, cars, to, cur, ht: Date.now() });
  }
  function onStart(p) {
    if (p.id !== ON.host) return;
    if (p.to && p.to !== ON.me) return;
    if (!p.to && G.online && G.W && p.mt === ON.mt) return;
    if (p.to && G.online && G.W && p.mt === ON.mt && myCar()) return;   // already in
    ON.mt = p.mt; ON.inMatch = true; ON.cfg = Object.assign(ON.cfg, p.cfg || {});
    if (!p.cars.some(a => a[3] === ON.me)) { lobbyRefresh(); return; }   // no seat for me this time: wait in the lobby
    setupMatch(p.cars, p.cur, p.ht);
  }
  function setupMatch(list, cur, ht) {
    const host = amHost();
    const cars = list.map(a => ({ cid: a[0], team: a[1] | 0, name: a[3] ? String(a[2] || '…').slice(0, 16) : '', owner: a[3] || null, design: a[4] | 0, accent: a[5] | 0, trail: a[6] | 0, bi: a[7] | 0,
      kind: a[3] === ON.me ? 'human' : (host && !a[3]) ? 'bot' : 'remote', diff: ON.cfg.diff }));
    const mine = cars.find(c => c.owner === ON.me);
    I.hideOverlay();
    I.newMatch({ mode: 'online', online: true, auth: host, size: ON.cfg.size, diff: ON.cfg.diff, len: ON.cfg.len, cars, locals: mine ? [mine.cid] : [] });
    for (const c of G.W.cars) if (c.kind === 'remote') { c.ext = true; c.lastSt = performance.now(); }
    ON.pend = null; ON.padLocal = {}; ON.lastHs = -1; ON.hist = [];
    if (cur) {
      G.score = cur.sc.slice(); G.clock = cur.ck; G.ot = !!cur.ot; I.updateScore();
      const age = clamp((hostNow() - (ht || hostNow())) / 1000, 0, 0.4);
      for (const a of cur.cs || []) { const c = carOf(a[0]); if (c) applyCar(c, a, c.kind === 'human' ? 0 : age, true); }
      for (const [cid, st] of cur.st || []) { const c = carOf(cid); if (c) Object.assign(c.st, st); }
      if (cur.b) setBallFrom(G.W.ball, cur.b, age);
      String(cur.pd || '').split('').forEach((ch, i) => { if (G.W.pads[i]) G.W.pads[i].on = ch === '1'; });
      G.phase = cur.ph === 'play' ? 'play' : 'wait';
      I.snapBodies();
    } else if (!host) G.phase = 'wait';
  }

  // ------------------------------------------------------------------ the game loop hooks
  TGO.stepOpts = (phase) => {
    const live = phase !== 'goal';
    if (!G.auth) return { sim: (c) => c.kind === 'human', ballLocal: live, hits: (c) => live && c.kind === 'human', padTimers: false };
    return { sim: (c) => c.kind !== 'remote', ballLocal: live, hits: (c) => live && c.kind !== 'remote' };
  };
  let preBall = new THREE.Vector3();
  TGO.preStep = () => { if (G.W) preBall.copy(G.W.ball.pos); };
  TGO.postStep = () => {
    const W = G.W; if (!W) return;
    if (G.auth) { ON.hist.push([W.t, W.ball.pos.x, W.ball.pos.y, W.ball.pos.z]); if (ON.hist.length > 80) ON.hist.shift(); }
    if (!G.auth && G.phase === 'goal' && G.goalT > 2.4 && !G.rp) {
      if (I.SET.replays && G.rec.length > 20) TGO.startReplay && TGO.startReplay(); else G.phase = 'wait';
    }
  };
  // events from the local physics step; return true to stop the game from handling it
  TGO.onEvent = (e) => {
    if (G.auth) { if (e.e === 'touch') ON.hostTouchT = G.W.t; return false; }
    if (e.e === 'touch') {
      if (!ON.claimDue) ON.claimDue = { pre: preBall.clone() };
      ON.localTouchT = performance.now();
      I.touchFx(e.c, e.p, e.x, e.y, e.z);
      return true;
    }
    if (e.e === 'demo') {
      const me = myCar();
      if (me && e.by === me && performance.now() - (ON.dcT[e.v.cid] || 0) > 800) { ON.dcT[e.v.cid] = performance.now(); send('dc', { mt: ON.mt, v: e.v.cid, c: me.cid, ht: hostNow() }); }
      return true;
    }
    if (e.e === 'pad') { send('pd', { mt: ON.mt, i: e.i }); ON.padLocal[e.i] = performance.now(); return false; }
    return false;
  };
  // every frame: dead-reckon remote cars, send my car / snapshots / claims, ping the host
  TGO.frame = (dt) => {
    if (!ON.ch || !G.W || !G.online) return;
    const W = G.W, nowP = performance.now();
    const replay = G.phase === 'replay';
    for (const c of W.cars) {
      if (c.kind !== 'remote' || c.dead) continue;
      const stale = (nowP - (c.lastSt || 0)) / 1000;
      if (stale < 0.6) {
        c.pos.addScaledVector(c.vel, dt);
        if (!c.grounded) c.vel.y -= T.GRAV * dt;
        T.rotateBy(c.q, c.w, dt);
        keepCar(c);
      }
      if (!replay) { c.rp.copy(c.pos); c.rq.slerp(c.q, 1 - Math.exp(-dt * 18)); }
    }
    const me = myCar();
    // a hit claim (at most ~12 per second; it carries the ball after my hit and the ball before it)
    if (!G.auth && ON.claimDue && nowP - ON.claimT > 80 && me) {
      ON.claimT = nowP; ON.claimK++;
      send('hit', { mt: ON.mt, k: ON.claimK, ht: hostNow(), pre: [r2(ON.claimDue.pre.x), r2(ON.claimDue.pre.y), r2(ON.claimDue.pre.z)], b: packBall(W.ball), c: packCar(me) });
      ON.pend = { k: ON.claimK, t: nowP }; ON.claimDue = null; ON.carT = nowP;
    }
    if (me && nowP - ON.carT > 66 && !G.auth) { ON.carT = nowP; send('car', { mt: ON.mt, ht: hostNow(), c: packCar(me) }); }
    if (G.auth && nowP - ON.stT > 55) { ON.stT = nowP; sendSnap(); }
    if (!G.auth && nowP - ON.pingT > (ON.samples.length < 3 ? 600 : 2500)) { ON.pingT = nowP; send('pi', { t0: Date.now() }); }
  };
  function sendSnap() {
    const W = G.W;
    const p = { mt: ON.mt, ht: Date.now(), ph: G.phase, ck: Math.round(G.clock * 10) / 10, ot: G.ot ? 1 : 0, sc: G.score, b: packBall(W.ball), hs: W.ball.hitSeq,
      c: W.cars.filter(c => c.kind !== 'remote').map(packCar), pd: W.pads.map(s => s.on ? 1 : 0).join(''), ak: ON.acks };
    if (performance.now() - ON.ssT > 1000) { ON.ssT = performance.now(); p.ss = W.cars.map(c => [c.cid, c.st.score, c.st.goals, c.st.assists, c.st.saves, c.st.shots, c.st.demos]); }
    send('st', p);
  }
  function onSnap(p) {
    if (p.id !== ON.host || amHost() || !G.W || !G.online || p.mt !== ON.mt) return;
    const W = G.W, age = clamp((hostNow() - p.ht) / 1000, 0, 0.35), me = myCar();
    for (const a of p.c || []) { const c = carOf(a[0]); if (c && c !== me && c.kind === 'remote') applyCar(c, a, age); }
    if (p.sc && (p.sc[0] !== G.score[0] || p.sc[1] !== G.score[1]) && G.phase !== 'goal' && G.phase !== 'replay') { G.score = p.sc.slice(); I.updateScore(); }
    if (typeof p.ck === 'number' && G.phase !== 'over') G.clock = p.ck + (p.ph === 'play' ? (p.ot ? age : -age) : 0);
    if (p.ot && !G.ot) G.ot = true;
    if (p.ph === 'play' && (G.phase === 'wait' || G.phase === 'none')) { G.phase = 'play'; I.snapBodies(); }
    // the ball: take the host's (played forward to "now") unless my own hit is still on its way
    let skip = false;
    if (ON.pend) {
      if (me && p.ak && (p.ak[me.cid] | 0) >= ON.pend.k) ON.pend = null;
      else if (performance.now() - ON.pend.t < 450) skip = true;
      else ON.pend = null;
    }
    if (performance.now() - (ON.localTouchT || 0) < 120) skip = true;
    if (G.phase === 'goal' || G.phase === 'replay') skip = true;
    if (!skip && p.b) setBallFrom(W.ball, p.b, age);
    if (p.hs !== undefined) {
      if (ON.lastHs >= 0 && p.hs !== ON.lastHs && performance.now() - ON.hitFxT > 150 && performance.now() - (ON.localTouchT || 0) > 200) {
        ON.hitFxT = performance.now(); I.AU.play('hit', I.distVol(W.ball.pos), 40);
      }
      ON.lastHs = p.hs;
    }
    if (p.pd) for (let i = 0; i < p.pd.length && i < W.pads.length; i++) { if (ON.padLocal[i] && performance.now() - ON.padLocal[i] < 1200) continue; W.pads[i].on = p.pd[i] === '1'; }
    if (p.ss) for (const s of p.ss) { const c = carOf(s[0]); if (c) Object.assign(c.st, { score: s[1], goals: s[2], assists: s[3], saves: s[4], shots: s[5], demos: s[6] }); }
  }
  function onCar(p) {
    if (!G.W || !G.online || p.mt !== ON.mt || !Array.isArray(p.c)) return;
    const c = carOf(p.c[0]); if (!c || c.kind !== 'remote' || c.owner !== p.id) return;
    applyCar(c, p.c, clamp((hostNow() - p.ht) / 1000, 0, 0.35));
  }
  // host: someone says their car hit the ball. Take it if our ball was really there at that moment.
  function onHit(p) {
    const W = G.W; if (!W || !G.online || p.mt !== ON.mt) return;
    const c = carOf(p.c && p.c[0]); if (!c || c.owner !== p.id || c.kind !== 'remote') return;
    const age = clamp((Date.now() - p.ht) / 1000, 0, 0.35);
    applyCar(c, p.c, age);
    if (G.phase !== 'play') return;
    const tAt = W.t - age, b = W.ball;
    if (ON.hostTouchT > tAt + 0.03) return;   // one of our cars hit it after that moment: ours stands
    let best = 1e9;
    for (const h of ON.hist) { if (Math.abs(h[0] - tAt) > 0.15) continue; const d = Math.hypot(h[1] - p.pre[0], h[2] - p.pre[1], h[3] - p.pre[2]); if (d < best) best = d; }
    if (!ON.hist.length) best = b.pos.distanceTo(_v.set(p.pre[0], p.pre[1], p.pre[2]));
    const tol = 4.5 + b.vel.length() * 0.06 + age * 10;
    if (best > tol) return;
    G.preT[0] = T.onTarget(b, 0); G.preT[1] = T.onTarget(b, 1);
    const before = b.vel.clone();
    setBallFrom(b, p.b, age); b.off.set(0, 0, 0); b.hitSeq++;
    ON.acks[c.cid] = p.k;
    I.registerTouch(c);
    W.kick = false;
    const pw = before.distanceTo(b.vel);
    if (performance.now() - ON.hitFxT > 120) { ON.hitFxT = performance.now(); I.touchFx(c, pw, b.pos.x, b.pos.y, b.pos.z); }
  }
  function onDemoClaim(p) {
    const W = G.W; if (!W || !G.online || p.mt !== ON.mt || G.phase === 'over') return;
    const by = carOf(p.c), v = carOf(p.v);
    if (!by || !v || by.owner !== p.id || v.dead || by.dead || by.team === v.team) return;
    if (by.pos.distanceTo(v.pos) > 8 || by.vel.length() < 55) return;
    v.demoHold = performance.now() + 1500;
    I.applyDemo(v, by);
  }

  // host → everyone
  TGO.sendKickoff = (spots, cd) => { send('ko', { mt: ON.mt, sp: spots, cd, ht: Date.now() }); ON.hist = []; };
  TGO.sendGoal = (info) => send('goal', Object.assign({ mt: ON.mt, sc: G.score }, info));
  TGO.sendOver = (info) => { ON.inMatch = false; send('over', Object.assign({ mt: ON.mt }, info)); sendRoster(); };
  TGO.sendDemo = (v, by) => send('dm', { mt: ON.mt, v: v.cid, by: by ? by.cid : null });
  TGO.sendEvent = (ev, p) => send(ev, Object.assign({ mt: ON.mt }, p));
  TGO.skipReplay = () => { I.skipReplay(); };
  TGO.leave = () => leaveRoom();
  TGO.active = () => !!ON.code;
  TGO.resultButtons = () => amHost()
    ? `<button class="btn" id="oRe">${t('tg_rematch')}</button><button class="btn sec" id="oLobby">${t('tg_backLobby')}</button><button class="btn sec" id="oLeave">${t('tg_leaveRoom')}</button>`
    : `<span class="help">${t('tg_waitNext')}</span><button class="btn sec" id="oLeave">${t('tg_leaveRoom')}</button>`;
  TGO.bindResult = () => {
    const re = $('oRe'), lb = $('oLobby'), lv = $('oLeave');
    if (re) re.onclick = () => { I.AU.play('click'); startMatch(); };
    if (lb) lb.onclick = () => { I.AU.play('click'); send('lobby', {}); ON.inMatch = false; G.online = false; I.toMenu('online'); sendRoster(); };
    if (lv) lv.onclick = () => { leaveRoom(); I.toMenu('online'); };
  };
  TGO.relabel = () => { if (G.overlay === 'alone') showAlone(); };

  // ------------------------------------------------------------------ lobby UI (drawn into the menu screen)
  let lobbyTm = 0, lobbySig = '';
  const lobbyState = () => JSON.stringify([ON.code, ON.ready, ON.host, ON.me, ON.cfg, ON.inMatch, !!(G.online && G.W), members().map(id => [id, ON.seats[id], nameOf(id)]), getLang(), ON.msg]);
  function lobbyRefresh(force) {
    if (G.screen !== 'online' || $('menu').hidden) return;
    clearTimeout(lobbyTm); lobbyTm = setTimeout(() => {
      if (G.screen !== 'online' || $('menu').hidden) return;
      const sig = lobbyState(); if (!force && sig === lobbySig) return;
      TGO.renderMenu($('menu'));
    }, force ? 0 : 60);
  }
  TGO.renderMenu = (m) => {
    lobbySig = lobbyState();
    const back = `<button class="btn sec" id="oBack">${t('tg_back')}</button>`;
    if (!ON.code) {
      const nm = myName();
      m.innerHTML = `<div class="panel" data-m3pop><h2>🌐 ${t('tg_online')}</h2><p>${t('tg_onlineD')}</p>
        <div class="lbl">${t('tg_oName')}</div><input id="oName" maxlength="16" value="${esc(nm)}" ${window.Auth && Auth.name && Auth.name() ? 'disabled' : ''}>
        <button class="btn" id="oCreate">➕ ${t('tg_create')}</button>
        <div class="lbl">${t('tg_orJoin')}</div><div class="row"><input id="oCode" class="code" maxlength="5" placeholder="${t('tg_codePh')}" style="flex:1"><button class="btn" id="oJoin">${t('tg_join')}</button></div>
        <div class="msg" id="oMsg">${esc(ON.msg || '')}</div>${back}</div>`;
      const saveName = () => { const v = $('oName').value.trim().slice(0, 16); if (v) I.LS.set('name', v); };
      $('oCreate').onclick = async () => { saveName(); I.AU.play('click'); if (!(await canGoOnline())) return; joinRoom(newCode(), true); ON.msg = ''; TGO.renderMenu(m); };
      const join = async () => {
        saveName(); const code = $('oCode').value.trim().toUpperCase();
        if (code.length < 4) { $('oMsg').textContent = t('tg_badCode'); return; }
        I.AU.play('click'); if (!(await canGoOnline())) return; joinRoom(code, false); ON.msg = ''; TGO.renderMenu(m);
      };
      $('oJoin').onclick = join; $('oCode').onkeydown = (e) => { if (e.key === 'Enter') join(); };
      $('oBack').onclick = () => I.renderMenu('main');
      return;
    }
    const host = amHost(), ms = members(), size = ON.cfg.size;
    const col = (team) => {
      const hs = ms.filter(id => ON.seats[id] === team);
      let rows = hs.map(id => `<div class="pl ${id === ON.me ? 'me' : ''}">${id === ON.host ? '👑' : '🚗'} ${esc(nameOf(id))}</div>`).join('');
      for (let i = hs.length; i < size; i++) rows += `<div class="pl bot">${t('tg_botSeat')}</div>`;
      return `<div class="team t${team}"><h3>${team ? t('tg_teamO') : t('tg_teamB')}</h3>${rows}</div>`;
    };
    const minSize = Math.max(1, teamCount(0), teamCount(1));
    const sizes = [1, 2, 3].map(n => [n, n + 'v' + n]);
    const waiting = ON.inMatch && !(G.online && G.W);
    m.innerHTML = `<div class="panel wide" data-m3pop><h2>🌐 ${t('tg_room')} <span class="big">${esc(ON.code)}</span></h2>
      <div class="row center"><button class="btn small sec" id="oCopy">🔗 ${t('tg_copy')}</button></div><p style="font-size:13px">${t('tg_shareNote')}</p>
      ${!ON.ready ? `<p>${t('tg_connecting')}</p>` : ''}
      <div class="lbl">${t('tg_mode')}</div>${host ? I.seg('size', sizes.map(([v, l]) => [v, l, v < minSize ? 'dis' : '']), size) : `<div class="seg"><button class="on">${size}v${size}</button></div>`}
      <div class="lbl">${t('tg_diff')}</div>${host ? I.seg('diff', [['easy', t('tg_easy')], ['normal', t('tg_normal')], ['hard', t('tg_hard')]], ON.cfg.diff) : `<div class="seg"><button class="on">${t('tg_' + ON.cfg.diff)}</button></div>`}
      <div class="lbl">${t('tg_len')}</div>${host ? I.seg('len', I.lenOpts(), ON.cfg.len) : `<div class="seg"><button class="on">${I.lenOpts().find(o => o[0] === ON.cfg.len)?.[1] || ON.cfg.len}</button></div>`}
      <div class="teams">${col(0)}${col(1)}</div><p style="font-size:12px">${t('tg_lobbyNote')}</p>
      ${waiting ? `<p style="color:var(--accent)">${t('tg_inMatch')}</p>` : ''}
      <div class="row center"><button class="btn sec" id="oSwitch" ${ON.inMatch ? 'disabled' : ''}>🔄 ${t('tg_switch')}</button>
      ${host ? `<button class="btn" id="oStart" ${!ON.ready || ON.inMatch ? 'disabled' : ''}>▶ ${t('tg_startM')}</button>` : `<span class="help">${waiting ? '' : t('tg_waitHost')}</span>`}</div>
      <button class="btn sec" id="oLeave">${t('tg_leaveRoom')}</button></div>`;
    $('oCopy').onclick = () => { const l = inviteLink(ON.code); try { navigator.clipboard.writeText(l); } catch (e) {} $('oCopy').textContent = t('tg_copied'); };
    if (host) I.bindSeg(m, (k, v) => {
      if (k === 'size') { const n = +v; if (n < minSize) { lobbyRefresh(true); return; } ON.cfg.size = n; }
      else if (k === 'len') ON.cfg.len = +v; else ON.cfg.diff = v;
      sendRoster();
    });
    $('oSwitch').onclick = () => { I.AU.play('click'); if (host) switchTeam(ON.me); else send('team', {}); };
    if ($('oStart')) $('oStart').onclick = () => { I.AU.play('click'); startMatch(); };
    $('oLeave').onclick = () => { leaveRoom(); I.renderMenu('online'); };
    if (window.Mal3abPopButtons) Mal3abPopButtons();
  };
  TGO.startReplay = () => I.startReplay();

  // ------------------------------------------------------------------ site hooks
  addEventListener('pagehide', () => { if (ON.ch) send('bye', {}); });
  window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : pageLink();
  window.Mal3abPrepareInvite = async () => {
    if (!ON.code) { if (!(await canGoOnline())) return pageLink(); joinRoom(newCode(), true); if (!G.W || G.mode === 'attract' || G.mode === 'menu') I.renderMenu('online'); }
    return inviteLink(ON.code);
  };
  window.Mal3abLiveInfo = () => ON.code ? { players: members().length || 1, max: MAXP, hidden: false, out: ON.inMatch && !(G.online && myCar()) } : {};
  // ?room=CODE joins at once
  TGO.boot = () => {
    const m = /[?&]room=([A-Za-z0-9]{4,6})/.exec(location.search); if (!m) return false;
    I.renderMenu('online');
    const go = async () => { if (ON.code || ON.joining) return; ON.joining = true; if (await canGoOnline()) { joinRoom(m[1], false); I.renderMenu('online'); } ON.joining = false; };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 5000); }
    return true;
  };
})();
