// Mal3ab — Pitch Legends LIVE two-player matches.
// The host's browser runs the match engine; the guest controls the other team in real time.
// Transport: Supabase Realtime broadcast channel "pitch-<CODE>" (no database writes during play).
//   guest -> host : hello {name,id,squad,plv} (repeated until start), in {ix,iy,a:[actions]}, again
//   host  -> guest: start {name,id,squad,plv}, snap {...} ~15/s, ev {power}, end
// Each player sees their own team on the left attacking right (the guest view is mirrored).
(function () {
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randCode = () => Array.from({ length: 5 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const T = (ar, en) => AR() ? ar : en;
  const G = Game;
  const W = FIELD.w;
  const PVP = window.PVP = { role: null, code: null, ch: null, live: false, peer: null, remote: { ix: 0, iy: 0, acts: new Set() },
    lastSeen: 0, timers: [], out: new Set(), lastSendIn: 0, gameNo: 0, recorded: false };

  const ready = () => !!(window.sb && window.Auth);
  async function waitReady() { for (let i = 0; i < 150 && !ready(); i++) await new Promise(r => setTimeout(r, 100)); return ready(); }
  const myName = () => (window.Auth && Auth.name()) || T('ضيف', 'Guest');
  const myId = () => (window.Auth && Auth.user) ? Auth.user.id : null;

  function mySquad() {
    const s = Store.state; Lineup.validate();
    const out = {};
    SLOT_ORDER.forEach(slot => {
      const id = s.lineup[slot];
      const def = id ? CATALOG_BY_ID[id] : makeDef(SLOT_DEF[slot].color, '0');
      const level = id && s.cards[id] ? s.cards[id].level : 1;
      out[slot] = { name: def.name, color: def.color, value: def.value, label: def.label, isNum: def.isNum, level,
                    stats: id ? Stats.forOwned(id) : Stats.fromCard(def, 1, 1) };
    });
    return out;
  }
  const powerLevel = () => { const p = Store.state.powers || {}; const v = ['shot', 'save', 'block'].map(k => p[k] || 1); return clamp(Math.round(v.reduce((a, b) => a + b, 0) / 3), 1, MAX_LEVEL); };
  function applySquad(team, squad) {
    G[team].forEach(a => {
      const c = squad && squad[a.slot]; if (!c) return;
      a.stats = c.stats; a.def = { color: c.color, value: c.value, isNum: c.isNum, label: c.label, name: c.name };
      a.color = c.color; a.label = c.isNum ? c.value : c.label; a.name = c.name;
    });
  }

  // ---------------- transport ----------------
  function send(event, payload) { if (PVP.ch) PVP.ch.send({ type: 'broadcast', event, payload: payload || {} }); }
  function connect(code, role) {
    PVP.code = code; PVP.role = role;
    const ch = sb.channel('pitch-' + code, { config: { broadcast: { self: false, ack: false } } });
    ch.on('broadcast', { event: '*' }, (msg) => onMsg(msg.event, msg.payload || {}));
    ch.subscribe();
    PVP.ch = ch;
  }
  function onMsg(ev, m) {
    PVP.lastSeen = Date.now();
    if (PVP.role === 'host') {
      if (ev === 'hello' && !PVP.live) { PVP.peer = m; status(T(`${m.name} دخل! الماتش هيبدأ…`, `${m.name} joined! Starting…`)); setTimeout(startHostMatch, 900); }
      else if (ev === 'hello' && PVP.live) sendStart();                       // guest reloaded / missed start
      else if (ev === 'in') { PVP.remote.ix = +m.ix || 0; PVP.remote.iy = +m.iy || 0; (m.a || []).forEach(a => PVP.remote.acts.add(a)); }
      else if (ev === 'again' && !PVP.live) startHostMatch();
    } else {
      if (ev === 'start') { PVP.peer = m; if (!PVP.live || m.gameNo !== PVP.gameNo) startGuestMatch(m); }
      else if (ev === 'snap') applySnap(m);
      else if (ev === 'ev' && m.k === 'power') {
        const mine = m.team === 'away', def = POWERS[m.name];
        if (def) G.banner(mine ? `${def.icon} ${def.name}!` : `${G.aiName}: ${def.name}`);
      }
    }
  }

  // ---------------- engine patches (only active in a live match) ----------------
  const isHost = () => PVP.live && PVP.role === 'host';
  const isGuest = () => PVP.live && PVP.role === 'guest';

  function switchAway(a) { G.away.forEach(p => p.remoteUser = false); a.remoteUser = true; G.ctrlAway = a; G.switchCdAway = 0.6; }

  const o = {};
  ['start', 'end', 'update', 'kickoff', 'take', 'tackleAttempt', 'aiMove', 'aiPowers', 'handleInput', 'handleInputPowers', 'usePower', 'pause', 'setSpeed'].forEach(k => o[k] = G[k]);

  G.kickoff = function (team) { o.kickoff.call(this, team); if (isHost()) switchAway(this.away.find(a => a.slot === 'mid')); };
  G.aiMove = function (a, dt) { if (isHost() && a.remoteUser) return; return o.aiMove.call(this, a, dt); };
  G.aiPowers = function (team) { if (isHost() && team === 'away') return; if (isGuest()) return; return o.aiPowers.call(this, team); };
  G.pause = function (v) { if (PVP.live) return; return o.pause.call(this, v); };
  G.setSpeed = function (v) { if (PVP.live) return; return o.setSpeed.call(this, v); };
  G.take = function (a) {
    const b = this.ball;
    if (isHost() && a.team === 'away' && b.kicker && b.kicker.team === 'away' && b.kicker !== a && b.passTarget) this.energy.away = Math.min(MAX_ENERGY, this.energy.away + 1);
    o.take.call(this, a);
    if (isHost() && a.team === 'away' && !a.remoteUser) switchAway(a);
  };
  G.tackleAttempt = function (a, manual) {
    const before = this.ball.owner;
    o.tackleAttempt.call(this, a, manual);
    if (isHost() && a.team === 'away' && before && before !== a && this.ball.owner === a) this.energy.away = Math.min(MAX_ENERGY, this.energy.away + 1);
  };
  const POWER_KEY = { q: 'shot', e: 'save', r: 'block' };
  G.handleInputPowers = function () {
    o.handleInputPowers.call(this);
    if (!isHost()) return;
    const acts = PVP.remote.acts;
    for (const [k, name] of Object.entries(POWER_KEY)) if (acts.has(k)) { acts.delete(k); this.usePower('away', name); }
    if (this.freeze > 0) acts.clear();
  };
  G.handleInput = function (dt) {
    o.handleInput.call(this, dt);
    if (!isHost()) return;
    const me = this.ctrlAway, b = this.ball, r = PVP.remote; if (!me) return;
    let ix = -r.ix, iy = r.iy;                                    // guest's view is mirrored left/right
    const len = Math.hypot(ix, iy);
    if (len > 0.1) { ix /= Math.max(1, len); iy /= Math.max(1, len); }
    if (me.stun > 0) { ix = iy = 0; }
    me.vx = ix * me.speed * (b.owner === me ? 0.88 : 1);
    me.vy = iy * me.speed * (b.owner === me ? 0.88 : 1);
    if (len > 0.1) { me.fx = ix / len; me.fy = iy / len; }
    this.switchCdAway = (this.switchCdAway || 0) - dt;
    if (b.owner !== me && this.switchCdAway <= 0 && (!b.owner || b.owner.team === 'home')) {
      const best = this.nearestTo(this.away.filter(a => !a.isGK), b);
      if (best && best !== me && dist(best, b) < dist(me, b) - 70) switchAway(best);
    }
    const acts = r.acts;
    if (acts.has('c')) { const best = this.nearestTo(this.away.filter(a => a !== me), b); if (best) switchAway(best); }
    if (acts.has('pass')) { if (b.owner === me) this.pass(me); else this.tackleAttempt(me, true); }
    if (acts.has('shoot')) { if (b.owner === me) this.shoot(me, iy); else this.tackleAttempt(me, true); }
    acts.clear();
  };
  G.usePower = function (team, name) {
    if (isGuest() && team === 'home') {                          // guest: ask the host to fire it
      const def = POWERS[name];
      if (this.energy.home < def.cost) { UI.toast(`Need ${def.cost} ⚡ energy`, 'bad'); return false; }
      PVP.out.add({ shot: 'q', save: 'e', block: 'r' }[name]); flushInput(true); return true;
    }
    const ok = o.usePower.call(this, team, name);
    if (ok && isHost()) send('ev', { k: 'power', team, name });
    return ok;
  };
  G.update = function (dt) { if (isGuest()) return guestUpdate.call(this, dt); return o.update.call(this, dt); };
  G.end = function () {
    if (isHost()) { sendSnap(true); }
    o.end.call(this);
    if (PVP.live) finishLive();
  };

  // ---------------- host ----------------
  function sendStart() { send('start', { name: myName(), id: myId(), squad: mySquad(), plv: powerLevel(), gameNo: PVP.gameNo }); }
  function startHostMatch() {
    if (!PVP.peer) return;
    PVP.gameNo++; PVP.live = true; PVP.recorded = false; PVP.remote = { ix: 0, iy: 0, acts: new Set() };
    closePanel(); sendStart();
    UI.closeModal(); UI.show('arena'); o_startMatch.call(UI, false);
    PVP.lastSeen = Date.now();
    clearTimers();
    PVP.timers.push(setInterval(() => {
      if (!G.running || G.over) return;
      sendSnap(false);
      if (Date.now() - PVP.lastSeen > 12000) { G.say(T('الخصم فصل.', 'Your opponent disconnected.')); G.end(); }
    }, 66));
  }
  function packTeam(list) { return list.map(a => [Math.round(a.x), Math.round(a.y), +a.fx.toFixed(2), +a.fy.toFixed(2), (a.stun > 0 ? 1 : 0) | (a.frozen > 0 ? 2 : 0) | (a.remoteUser ? 4 : 0)]); }
  function sendSnap(over) {
    const b = G.ball, idx = b.owner ? G.all.indexOf(b.owner) : -1;
    send('snap', { n: PVP.gameNo, t: +G.time.toFixed(2), s: [G.score.home, G.score.away], o: idx,
      b: [Math.round(b.x), Math.round(b.y), b.power ? 1 : 0], p: packTeam(G.home).concat(packTeam(G.away)),
      e: [G.energy.home, G.energy.away], f: [+G.fx.shield.home.toFixed(1), +G.fx.shield.away.toFixed(1), +G.fx.block.home.toFixed(1), +G.fx.block.away.toFixed(1), G.fx.powerShot.home ? 1 : 0, G.fx.powerShot.away ? 1 : 0],
      over: over ? 1 : 0 });
  }

  // ---------------- guest ----------------
  let lastSnap = 0;
  function startGuestMatch(m) {
    PVP.gameNo = m.gameNo; PVP.live = true; PVP.recorded = false;
    closePanel(); UI.closeModal(); UI.show('arena'); o_startMatch.call(UI, false);
    lastSnap = Date.now();
    clearTimers();
    PVP.timers.push(setInterval(() => flushInput(false), 66));
    PVP.timers.push(setInterval(() => { if (PVP.live && G.running && Date.now() - lastSnap > 12000) { UI.toast(T('الاتصال بالخصم اتقطع', 'Lost connection to the host'), 'bad'); G.stop(); PVP.live = false; } }, 2000));
  }
  function flushInput(force) {
    if (!isGuest()) return;
    const now = Date.now();
    if (!force && now - PVP.lastSendIn < 60) return;
    PVP.lastSendIn = now;
    send('in', { ix: +(PVP.ix || 0).toFixed(2), iy: +(PVP.iy || 0).toFixed(2), a: [...PVP.out] });
    PVP.out.clear();
  }
  function guestUpdate(dt) {
    const k = this.keys;
    let ix = 0, iy = 0;
    if (k['arrowleft'] || k['a']) ix -= 1;
    if (k['arrowright'] || k['d']) ix += 1;
    if (k['arrowup'] || k['w']) iy -= 1;
    if (k['arrowdown'] || k['s']) iy += 1;
    if (this.touch) { ix = this.touch.x; iy = this.touch.y; }
    PVP.ix = ix; PVP.iy = iy;
    const p = this.pressed;
    if (p[' '] || p['pass']) PVP.out.add('pass');
    if (p['x'] || p['shift'] || p['shoot']) PVP.out.add('shoot');
    if (p['c']) PVP.out.add('c');
    for (const [key, name] of Object.entries(POWER_KEY)) if (p[key]) this.usePower('home', name);
    const had = PVP.out.size > 0;
    this.pressed = {};
    if (had) flushInput(true);
    // smooth movement toward the latest snapshot
    const f = 1 - Math.exp(-dt * 18);
    this.all.forEach(a => { if (a._tx != null) { a.x += (a._tx - a.x) * f; a.y += (a._ty - a.y) * f; } });
    const b = this.ball; if (b._tx != null) { if (b.owner) { b.x = b.owner.x + b.owner.fx * 20; b.y = b.owner.y + b.owner.fy * 20; } else { b.x += (b._tx - b.x) * f; b.y += (b._ty - b.y) * f; } }
    if (this.fx.bannerT > 0) this.fx.bannerT -= dt;
    this.hudTimer = (this.hudTimer || 0) + dt;
    if (this.hudTimer > 0.25) { this.hudTimer = 0; UI.updateHud(); UI.updateCommentary(); }
  }
  function applySnap(m) {
    if (!isGuest() || m.n !== PVP.gameNo) return;
    lastSnap = Date.now();
    const g = G;
    g.time = m.t;
    const mine = m.s[1], theirs = m.s[0];
    if (mine > g.score.home) { g.say(`⚽ GOOOAL! ${mine}–${theirs}`); g.banner('⚽ GOAL!'); }
    if (theirs > g.score.away) { g.say(`😬 ${g.aiName} scores. ${mine}–${theirs}`); g.banner(`${g.aiName} scores`); }
    if (mine !== g.score.home || theirs !== g.score.away) { g.score = { home: mine, away: theirs }; UI.updateScore(); }
    g.energy = { home: m.e[1], away: m.e[0] };
    g.fx.shield = { home: m.f[1], away: m.f[0] }; g.fx.block = { home: m.f[3], away: m.f[2] };
    g.fx.powerShot = { home: !!m.f[5], away: !!m.f[4] };
    const put = (a, p) => { a._tx = W - p[0]; a._ty = p[1]; a.fx = -p[2]; a.fy = p[3]; a.stun = p[4] & 1 ? 0.3 : 0; a.frozen = p[4] & 2 ? 0.3 : 0; };
    m.p.slice(5).forEach((p, i) => { const a = g.home[i]; if (!a) return; put(a, p); a.isUser = !!(p[4] & 4); if (a.isUser) g.controlled = a; });
    m.p.slice(0, 5).forEach((p, i) => { const a = g.away[i]; if (a) { put(a, p); a.isUser = false; } });
    const ownerHost = m.o >= 0 ? m.o : -1;                      // host order: home 0-4, away 5-9
    g.ball.owner = ownerHost < 0 ? null : ownerHost >= 5 ? g.home[ownerHost - 5] : g.away[ownerHost];
    g.ball._tx = W - m.b[0]; g.ball._ty = m.b[1]; g.ball.power = !!m.b[2];
    if (m.over && !g.over) { g.time = MATCH_SECONDS; G.end(); }
  }

  // ---------------- start / end hooks ----------------
  G.start = function (opts) {
    o.start.call(this, opts);
    if (!PVP.live || !PVP.peer) return;
    this.aiName = PVP.peer.name || T('صاحبك', 'Friend');
    this.aiLevel = clamp(PVP.peer.plv || 1, 1, MAX_LEVEL);
    applySquad('away', PVP.peer.squad);
    if (isGuest()) { this.freeze = 0; this.all.forEach(a => { a._tx = a.x; a._ty = a.y; }); }
    this.log = []; this.say(`⚔️ ${T('ماتش لايف ضد', 'LIVE match vs')} ${this.aiName}!`);
  };
  function finishLive() {
    clearTimers();
    PVP.live = false;
    if (PVP.recorded) return; PVP.recorded = true;
    const h = G.score.home, a = G.score.away;
    const res = h > a ? 'win' : h < a ? 'loss' : 'draw';
    if (window.Auth && Auth.user) Auth.record(res);
    if (window.History) {
      const hostSide = PVP.role === 'host';
      const hostScore = hostSide ? h : a, guestScore = hostSide ? a : h;
      History.save({ code: 'pitch-' + PVP.code, game_no: PVP.gameNo, game: 'pitch', mode: 'online',
        p1_name: hostSide ? myName() : PVP.peer.name, p2_name: hostSide ? PVP.peer.name : myName(),
        p1_id: hostSide ? myId() : PVP.peer.id, p2_id: hostSide ? PVP.peer.id : myId(),
        winner: hostScore > guestScore ? '1' : hostScore < guestScore ? '2' : 'draw', reason: `${hostScore}-${guestScore}`, finished_at: new Date().toISOString() });
    }
  }
  function clearTimers() { PVP.timers.forEach(clearInterval); PVP.timers = []; }

  // rematch / "Play again" while connected to a friend
  const o_startMatch = UI.startMatch;
  UI.startMatch = function (simulate) {
    if (PVP.peer && PVP.code && !simulate) {
      if (PVP.role === 'host') { startHostMatch(); return; }
      send('again', {}); UI.toast(T('مستني صاحبك يبدأ…', 'Waiting for the host to restart…')); return;
    }
    if (PVP.peer && simulate) { leaveLive(); }
    return o_startMatch.call(UI, simulate);
  };
  function leaveLive() { clearTimers(); PVP.live = false; PVP.peer = null; if (PVP.ch) { sb.removeChannel(PVP.ch); PVP.ch = null; } PVP.code = null; PVP.role = null; }

  // ---------------- lobby UI ----------------
  function panel() {
    let el = document.getElementById('mal3ab-online');
    if (!el) {
      el = document.createElement('div'); el.id = 'mal3ab-online'; document.body.appendChild(el);
      const st = document.createElement('style');
      st.textContent = `
        #mal3ab-online{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9998;width:min(92vw,380px);box-shadow:0 20px 60px rgba(0,0,0,.6);background:#1a1f35;border:1px solid #2c355c;border-radius:14px;padding:16px;color:#eef0ff;font:14px 'Segoe UI',Tahoma,Arial,sans-serif;display:none;max-height:85vh;overflow:auto}
        #mal3ab-online.open{display:block}
        #mal3ab-online h3{margin:0 0 8px;color:#ffb703;font-size:17px;padding-right:34px}
        #mal3ab-online p{margin:0 0 10px;color:#9aa3c7}
        #mal3ab-online .btn{background:#ffb703;color:#1a1200;border:0;border-radius:8px;padding:10px 12px;font-weight:700;cursor:pointer;width:100%;margin-top:8px;font-family:inherit}
        #mal3ab-online .btn.blue{background:#3a86ff;color:#fff}
        #mal3ab-online .btn.green{background:#80ed99;color:#062b12}
        #mal3ab-online input{width:100%;box-sizing:border-box;background:#232a48;color:#eef0ff;border:1px solid #2c355c;border-radius:8px;padding:10px;margin-top:8px;font-family:inherit;text-transform:uppercase;letter-spacing:3px;text-align:center;font-size:18px}
        #mal3ab-online .code{font-size:30px;font-weight:800;letter-spacing:6px;color:#ffb703;text-align:center;margin:8px 0 2px}
        #mal3ab-online .link{font-size:11px;color:#9aa3c7;word-break:break-all;text-align:center}
        #mal3ab-online .status{margin-top:10px;text-align:center;color:#80ed99;font-weight:700;min-height:18px}
        #mal3ab-online .close{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:15px;background:#232a48;color:#eef0ff;border:0;cursor:pointer;font-size:16px}
        #mal3ab-online hr{border:0;border-top:1px solid #2c355c;margin:14px 0}
        .ar #mal3ab-online{direction:rtl}`;
      document.head.appendChild(st);
    }
    return el;
  }
  function status(t) { const s = document.querySelector('#mal3ab-online .status'); if (s) s.textContent = t; }
  function closePanel() { const el = document.getElementById('mal3ab-online'); if (el) el.classList.remove('open'); }
  function linkFor(code) { return location.href.split('?')[0] + '?pvp=' + code; }

  function renderLobby(mode) {
    const el = panel(); el.classList.add('open');
    if (mode === 'host') {
      el.innerHTML = `<button class="close" id="mo-x">✕</button>
        <h3>⚔️ ${T('ماتش لايف ضد صاحبك', 'Live match vs a friend')}</h3>
        <p>${T('ابعت الكود أو اللينك لصاحبك. أول ما يدخل، الماتش يبدأ — كل واحد بيتحكم في فريقه.', 'Send the code or link. As soon as your friend joins, the match starts — each of you controls your own team.')}</p>
        <div class="code">${PVP.code}</div><div class="link">${linkFor(PVP.code)}</div>
        <button class="btn blue" id="mo-copy">🔗 ${T('نسخ اللينك', 'Copy link')}</button>
        <div class="status">⏳ ${T('مستني صاحبك…', 'Waiting for your friend…')}</div>`;
      el.querySelector('#mo-copy').onclick = (e) => navigator.clipboard.writeText(linkFor(PVP.code)).then(() => e.target.textContent = '✓ ' + T('اتنسخ', 'Copied'));
    } else if (mode === 'guest') {
      el.innerHTML = `<button class="close" id="mo-x">✕</button>
        <h3>⚔️ ${T('بتدخل ماتش لايف', 'Joining a live match')}</h3>
        <div class="code">${PVP.code}</div>
        <div class="status">⏳ ${T('بوصّلك بصاحبك…', 'Connecting to your friend…')}</div>`;
    } else {
      el.innerHTML = `<button class="close" id="mo-x">✕</button>
        <h3>⚔️ ${T('العب ضد صاحبك لايف', 'Play a friend live')}</h3>
        <p>${T('إنت بتتحكم في فريقك وصاحبك في فريقه — في نفس الوقت، كل واحد من جهازه.', 'You control your team and your friend controls theirs — at the same time, each on their own device.')}</p>
        <button class="btn" id="mo-create">🎮 ${T('اعمل ماتش (كود + لينك)', 'Create a match (code + link)')}</button>
        <hr>
        <b>${T('عندك كود من صاحبك؟', 'Got a code from a friend?')}</b>
        <input id="mo-code" maxlength="5" placeholder="ABCDE">
        <button class="btn green" id="mo-join">⚔️ ${T('ادخل الماتش', 'Join the match')}</button>`;
      el.querySelector('#mo-create').onclick = () => hostLobby(randCode());
      el.querySelector('#mo-join').onclick = () => { const c = el.querySelector('#mo-code').value.trim().toUpperCase(); if (c.length === 5) guestLobby(c); };
    }
    el.querySelector('#mo-x').onclick = () => { closePanel(); if (!PVP.live) leaveLive(); };
  }
  function hostLobby(code) { leaveLive(); connect(code, 'host'); renderLobby('host'); }
  function guestLobby(code) {
    leaveLive(); connect(code, 'guest'); renderLobby('guest');
    const hello = () => { if (PVP.role === 'guest' && !PVP.live) send('hello', { name: myName(), id: myId(), squad: mySquad(), plv: powerLevel() }); };
    const t = setInterval(() => { if (PVP.role !== 'guest' || PVP.live) { clearInterval(t); return; } hello(); }, 1500);
    setTimeout(hello, 600);
  }

  // home-screen card + "Play again" under the pitch
  function addCard() {
    const home = document.getElementById('screen-home');
    if (!home || !home.children.length || home.querySelector('.mal3ab-card')) return;
    const c = document.createElement('div'); c.className = 'mal3ab-card';
    c.innerHTML = `<h3>⚔️ ${T('العب ضد صاحبك لايف', 'Play a friend live')}</h3><p>${T('ماتش حقيقي: إنت ضد صاحبك، كل واحد بيتحكم في فريقه بكروته.', 'A real match: you vs your friend, each controlling their own team and cards.')}</p><button id="mal3ab-online-btn">⚔️ ${T('ابدأ', 'Start')}</button>`;
    home.appendChild(c);
    c.querySelector('button').onclick = () => renderLobby(PVP.role === 'host' && !PVP.live ? 'host' : null);
  }
  function addAgain() {
    const arena = document.getElementById('screen-arena');
    if (!arena || !arena.children.length || arena.querySelector('.mal3ab-again')) return;
    const w = document.createElement('div'); w.className = 'mal3ab-again-wrap';
    w.innerHTML = `<button class="mal3ab-again">🔄 ${T('العب تاني', 'Play again')}</button>`;
    w.querySelector('button').onclick = () => { if (G.running && !G.over && PVP.live) return; UI.startMatch(false); };
    arena.appendChild(w);
  }

  (async () => {
    if (!await waitReady()) return;
    new MutationObserver(() => { addCard(); addAgain(); }).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
    addCard(); addAgain();
    const q = new URLSearchParams(location.search), code = (q.get('pvp') || '').toUpperCase();
    if (code) {
      history.replaceState(null, '', location.pathname);
      if (q.get('role') === 'host') hostLobby(code); else guestLobby(code);
    }
  })();
})();
