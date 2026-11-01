'use strict';
// =====================================================================
// Echoes of the Spire — online co-op for up to 4 players.
// Supabase Realtime broadcast channel "spire-CODE". The host (the room's creator; if they leave, the next player in
// join order) runs the real simulation and broadcasts a snapshot ~11×/s, plus the full structure whenever it changes.
// Everyone else replays the beat locally (so every player hears every resonator), draws the host's shadows
// interpolated, and sends actions: place / upgrade / sell / retune / ready / pick.
// Shards: each player has their own purse; all income (kills and the wave bonus) is split evenly between the
// connected players. Relics are shared by the team (they change the one spire and its song); unlocks and
// attunements belong to the player who picked them.
// =====================================================================
(function () {
  const NET_MAX = 4;
  const P_COLS = ['#ffd23f', '#ff4b6e', '#3d8bff', '#eef0ff'];
  const ETYPES = Object.keys(ENEMIES), TI = Object.fromEntries(ETYPES.map((k, i) => [k, i]));
  const EVENTS = ['hello', 'hb', 'bye', 'full', 'sync', 'st', 'act', 'nack'];
  const ON = {
    ch: null, code: '', ready: false, me: '', jt: 0, host: '', peers: {}, mem: [], stage: 'off', subT: 0, hb: null,
    v: 0, runN: 0, rxRun: -1, rxV: -1, lastSt: 0, lastSync: 0, dirty: false, sig: '', evq: [], stRx: 0, stGap: 90,
    bgT: 0, lastFrame: 0, plT: 0, plH: '', bonus: 0, rxBonus: 0, resId: 0, enId: 0, readyT: 0, pickT: 0,
  };

  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const invite = (c) => pageLink() + '?room=' + c;
  const newCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const authName = () => (window.Auth && Auth.name && Auth.name()) || '';
  const myName = () => String(authName() || lsGet('echoes-spire-name', '') || t('es_player')).slice(0, 16);
  const amHost = () => !!ON.code && ON.host === ON.me;
  const alive = (id) => id === ON.me || !!ON.peers[id];
  const purse0 = (n) => Math.round(START_SHARDS * (1 + (n - 1) / 3) / n);      // 1: 180 · 2: 120 · 3: 100 · 4: 90 each
  const teamMul = (n) => 1 + (n - 1) / 3;                                         // the team's total income vs solo
  const players = () => (G.players ? Object.values(G.players) : []);
  const live = () => players().filter(P => !P.gone);
  const myP = () => G.players && G.players[ON.me];
  const memWire = () => ON.mem.map(m => [m.id, m.n]);
  const canGo = async () => !(window.Mal3abVersion && !(await Mal3abVersion.ok()));
  function send(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }

  // ---------------------------------------------------------------- room
  function joinRoom(code, create) {
    leaveRoom(true);
    if (!window.sb) { toast(esc(t('es_noNet'))); return false; }
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (code.length < 4) return false;
    let id = ''; try { id = sessionStorage.getItem('echoes-spire-id-' + code) || ''; } catch (e) {}
    if (!id) { id = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('echoes-spire-id-' + code, id); } catch (e) {} }
    if (G.phase !== 'menu') toMenu();
    Object.assign(ON, { me: id, code, ready: false, jt: Date.now(), host: create ? id : '', peers: {}, mem: create ? [{ id, n: myName() }] : [], stage: 'lobby',
      v: 0, runN: 0, rxRun: -1, rxV: -1, evq: [], subT: 0, sig: '', dirty: false, plH: '' });
    G.online = true; G.replica = false; G.players = null;
    const ch = sb.channel('spire-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; ON.subT = Date.now(); hello(true); renderLobby(); } });
    ON.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    clearInterval(ON.hb); ON.hb = setInterval(beat, 2000);
    showLobby();
    return true;
  }
  function leaveRoom(quiet) {
    if (ON.ch) { send('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(ON.hb);
    Object.assign(ON, { ch: null, ready: false, code: '', host: '', peers: {}, mem: [], stage: 'off', evq: [] });
    G.online = false; G.replica = false; G.players = null; G.speed = 1;
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    const pl = $('plist'); if (pl) pl.hidden = true;
    refreshSpd();
  }
  function leave() { leaveRoom(); hideModal(); toMenu(); refreshMenu(); }
  function hello(req) { send('hello', { n: myName(), jt: ON.jt, host: ON.host, req: !!req, stg: ON.stage, mem: amHost() ? memWire() : undefined }); }
  function beat() {
    if (!ON.ch) return;
    send('hb', { n: myName(), jt: ON.jt, host: ON.host, stg: ON.stage, mem: amHost() ? memWire() : undefined });
    const now = Date.now();
    for (const id in ON.peers) if (now - ON.peers[id].t > 9000) peerGone(id);
    // nobody answered (an empty room) or the host vanished without a word: pick a host
    if (ON.ready && now - ON.subT > 3000 && (!ON.host || !alive(ON.host))) elect();
  }
  // host only: add a player to the room (join order is kept; the 5th gets "room full")
  function memAdd(id, n) {
    const m = ON.mem.find(x => x.id === id);
    if (m) { if (n) m.n = n; return 'old'; }
    if (ON.mem.filter(x => alive(x.id)).length >= NET_MAX) return '';
    ON.mem.push({ id, n: n || '…' }); return 'new';
  }
  function setMem(list) {
    if (!Array.isArray(list)) return;
    const old = new Set(ON.mem.map(m => m.id)), had = old.size > 0;
    ON.mem = list.map(([id, n]) => ({ id, n }));
    if (had) for (const m of ON.mem) if (!old.has(m.id) && m.id !== ON.me) { toast('👋 ' + esc(t('es_joinedP', { p: m.n }))); ESAudio.sfx('pick'); }
  }
  function onNet(ev, p) {
    if (!p || !p.id || p.id === ON.me || !ON.code) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === ON.me) { leave(); openMenu(); toast(esc(t('es_full'))); } return; }
    if (ev === 'bye') { peerGone(p.id); return; }
    let P = ON.peers[p.id];
    if (!P) P = ON.peers[p.id] = { id: p.id, n: p.n || '…', jt: p.jt || now, t: now };
    P.t = now; if (p.n) P.n = p.n; if (p.jt) P.jt = p.jt;
    if (p.host && p.host === p.id) claimSeen(P);
    else if (p.host && !ON.host) ON.host = p.host;
    if (amHost()) {
      const r = memAdd(p.id, P.n);
      if (!r) { if (ev === 'hello' || ev === 'hb') send('full', { to: p.id }); return; }
      if (r === 'new') {
        toast('👋 ' + esc(t('es_joinedP', { p: P.n }))); ESAudio.sfx('pick'); hello(false);
        if (ON.stage === 'run') { addPlayer(p.id, P.n, false); syncMine(); markDirty(); }
      } else if (ON.stage === 'run' && G.players && G.players[p.id] && G.players[p.id].gone) { addPlayer(p.id, P.n, false); markDirty(); }   // came back (reload)
    } else if (p.id === ON.host && p.mem) setMem(p.mem);
    switch (ev) {
      case 'hello': if (p.req) hello(false); renderLobby(); break;
      case 'hb': renderLobby(); break;
      case 'sync': if (p.id === ON.host) applySync(p); break;
      case 'st': if (p.id === ON.host) applySt(p); break;
      case 'act': if (amHost()) handleAct(p.id, p); break;
      case 'nack': if (p.to === ON.me) { ESAudio.sfx('error'); toast('◆ ' + esc(t('es_noShards'))); } break;
    }
  }
  // someone says they are the host
  function claimSeen(P) {
    if (ON.host === P.id) return;
    const earlier = (a, b) => a.jt < b.jt || (a.jt === b.jt && a.id < b.id);
    if (amHost()) {      // two hosts (both opened an empty room at once): the earlier joiner keeps it
      if (earlier(P, { jt: ON.jt, id: ON.me })) { ON.host = P.id; G.replica = ON.stage === 'run'; refreshSpd(); renderLobby(); }
      return;
    }
    const H = ON.peers[ON.host];
    if (!ON.host || !H || earlier(P, H)) { ON.host = P.id; renderLobby(); }
  }
  function peerGone(id) {
    const P = ON.peers[id]; if (!P) return;
    delete ON.peers[id];
    const m = ON.mem.find(x => x.id === id); if (!m) return;          // never got in (e.g. a 5th player told "room full")
    const Q = G.players && G.players[id];
    toast('👋 ' + esc(t('es_leftP', { p: (Q && Q.n) || m.n || P.n })));
    if (Q) { Q.gone = true; Q.ready = false; }
    ON.mem = ON.mem.filter(x => x.id !== id);
    if (ON.host === id) elect();
    else if (amHost()) { hello(false); if (ON.stage === 'run') { markDirty(); tryStart(false); checkDraft(); } }
    renderLobby();
  }
  function elect() {
    const cand = ON.mem.filter(m => alive(m.id));
    const next = cand.length ? cand[0].id : ON.me;          // the next player in join order
    ON.host = next;
    if (next === ON.me) becomeHost();
    else { const m = ON.mem.find(x => x.id === next); toast(esc(t('es_newHost', { p: m ? m.n : '…' }))); }
    renderLobby();
  }
  // take over the simulation from the replica state (the last snapshot has every shadow, purse and the rng state)
  function becomeHost() {
    ON.host = ON.me;
    if (!ON.mem.some(m => m.id === ON.me)) ON.mem.unshift({ id: ON.me, n: myName() });
    ON.mem = ON.mem.filter(m => alive(m.id));
    for (const id in ON.peers) memAdd(id, ON.peers[id].n);
    if (ON.stage === 'run' && G.players) {
      G.replica = false;
      for (const P of players()) if (!alive(P.id)) { P.gone = true; P.ready = false; }
      for (const m of ON.mem) if (!G.players[m.id]) addPlayer(m.id, m.n, false);
      RES_ID = Math.max(RES_ID, ON.resId || 0, ...G.res.map(r => r.id + 1));
      EN_ID = Math.max(EN_ID, ON.enId || 0, ...G.enemies.map(e => e.id + 1)) + 50;
      for (const e of G.enemies) { e.lt = 1e9; setPos(e, e.p1); e.block = null; e.stunCd = 0; e.hasteT = 0; }
      if (G.phase === 'wave') G.spawnQ = buildWave();       // spawnIdx and waveStep came with the last snapshot
      if (G.phase === 'cleared') G.later.push({ t: G.t + 1, fn: () => { if (G.phase !== 'cleared') return; if (isBossWave() && G.act === FINAL_ACT) victory(); else netDraft(isBossWave()); } });
      syncMine(); markDirty();
      if (G.phase === 'draft') checkDraft();
      if (G.phase === 'build') tryStart(false);
      if (UI.modal === 'won') UI.victory(); else if (UI.modal === 'over') UI.gameover(); else if (UI.modal === 'waitpick') waitModal();
    }
    toast(esc(t('es_youHost')));
    hello(false); refreshSpd();
  }

  // ---------------------------------------------------------------- players and purses (host)
  function addPlayer(id, n, atStart) {
    let P = G.players[id];
    if (P) { P.gone = false; if (n) P.n = n; return P; }
    const used = new Set(players().map(q => q.col)); let col = 0;
    while (used.has(col) && col < P_COLS.length - 1) col++;
    if (used.has(col)) col = players().length % P_COLS.length;
    const nAlive = atStart ? ON.mem.filter(m => alive(m.id)).length : live().length + 1;
    const unlocked = atStart ? ['bell', 'harp'] : ROLE_ORDER.filter(r => r === 'bell' || r === 'harp' || live().some(q => q.unlocked.includes(r)));
    P = G.players[id] = { id, n: n || '…', col, shards: purse0(Math.max(1, nAlive)) + (atStart ? 0 : 12 * (gIndex() - 1)), frac: 0, unlocked,
      attune: { bell: 0, harp: 0, hum: 0, ward: 0, echo: 0 }, drafts: atStart ? 0 : 2, draft: null, picked: true, ready: false, gone: false };
    return P;
  }
  // G.shards / G.unlocked / G.attune always show *my* purse, unlocks and attunements (the solo UI code reads them)
  function syncMine() { const P = myP(); if (!P) return; G.shards = P.shards; G.unlocked = P.unlocked; G.attune = P.attune; G.draftsTaken = P.drafts; }
  // run a core action as another player: their purse is swapped in, then written back
  function asPlayer(pid, fn) {
    const P = G.players[pid]; if (!P) return null;
    G.shards = P.shards; G.unlocked = P.unlocked; G.attune = P.attune; G.draftsTaken = P.drafts;
    try { return fn(P); } finally { P.shards = G.shards; P.drafts = G.draftsTaken; syncMine(); }
  }
  function earn(gold) {
    const L = live(); if (!L.length) return;
    const share = gold * teamMul(L.length) / L.length;
    for (const P of L) { P.frac += share; const w = Math.floor(P.frac); P.shards += w; P.frac -= w; }
    syncMine();
  }
  function waveBonus(bonus) {
    const L = live(), each = Math.round(bonus * teamMul(L.length) / Math.max(1, L.length));
    for (const P of L) { let b = each; if (has('savings')) b += Math.min(40, Math.floor(P.shards * 0.15)); P.shards += b; }
    ON.bonus = each; syncMine(); markDirty(); return each;
  }
  function refund() {          // new act: every resonator goes back to its owner (a player who left: shared out)
    let mine = 0, orphan = 0;
    for (const r of G.res) { const P = G.players[r.owner]; if (P && !P.gone) { P.shards += r.invested; if (P.id === ON.me) mine += r.invested; } else orphan += r.invested; }
    const L = live();
    if (orphan && L.length) { const each = Math.floor(orphan / L.length); for (const P of L) { P.shards += each; if (P.id === ON.me) mine += each; } }
    syncMine(); return mine;
  }
  function ev(a) { if (amHost() && ON.stage === 'run') { ON.evq.push(a); if (ON.evq.length > 120) ON.evq.shift(); } }
  const markDirty = () => { ON.dirty = true; };

  // ---------------------------------------------------------------- actions
  function req(k, d) { const a = Object.assign({ k }, d || {}); if (amHost()) handleAct(ON.me, a); else send('act', a); }
  function handleAct(pid, a) {
    const P = G.players && G.players[pid];
    if (ON.stage !== 'run' || !P) return;
    if (P.gone) { if (!alive(pid)) return; P.gone = false; }
    const nack = () => { if (pid === ON.me) { ESAudio.sfx('error'); toast('◆ ' + esc(t('es_noShards'))); } else send('nack', { to: pid, k: a.k }); };
    const r = a.rid != null ? G.res.find(x => x.id === a.rid) : null;
    switch (a.k) {
      case 'place': {
        if (!(G.phase === 'build' || G.phase === 'wave')) return;
        const role = ROLE_ORDER.includes(a.role) ? a.role : null, note = clamp(a.n | 0, 0, 4), so = G.map.sockets[a.s | 0];
        if (!role || !so || so.res || !P.unlocked.includes(role)) return;
        if (P.shards < costOf(role)) { nack(); return; }
        const nr = asPlayer(pid, () => placeRes(role, note, so.i, { owner: pid }));
        if (nr) fxPlace(nr);
        break;
      }
      case 'upgrade': if (!r || r.owner !== pid) return; if (!asPlayer(pid, () => upgradeRes(r))) nack(); break;
      case 'sell': if (!r || r.owner !== pid) return; asPlayer(pid, () => sellRes(r)); break;
      case 'retune': if (!r || r.owner !== pid) return; retuneRes(r, clamp(a.n | 0, 0, 4)); break;
      case 'ready': P.ready = !!a.on; markDirty(); tryStart(false); break;
      case 'force': if (pid === ON.me) tryStart(true); break;
      case 'pick': pickFor(pid, a.i | 0); break;
      default: return;
    }
    markDirty();
  }
  function fxPlace(r) {
    ESAudio.sfx('place', r.note); burst(r.x, r.y - 14, NOTES[r.note].rgb, 16, 110); addRing(r.x, r.y, 50, NOTES[r.note].rgb, 0, 'fx', { dur: 0.45 });
    if (r.owner === ON.me) floatText(r.x, r.y - 44, '-' + r.invested + '◆', '#ffd166', 12);
  }
  // ---------------------------------------------------------------- ready → wave
  function tryStart(force) {
    if (!amHost() || G.phase !== 'build') return;
    const L = live(); if (!force && !L.every(P => P.ready)) return;
    G.teamHp = 1 + 0.25 * (L.length - 1);         // more players, tougher shadows (income grows faster than this)
    for (const P of players()) P.ready = false;
    if (startWave()) { select(null); G.preview = null; }
    markDirty(); sendSync();
  }
  function goPress() {
    const P = myP(); if (!P || G.phase !== 'build') return;
    if (amHost() && P.ready && !live().every(q => q.ready)) { req('force', {}); return; }
    P.ready = !P.ready; ON.readyT = Date.now(); ESAudio.sfx('click'); cache.go = null;
    req('ready', { on: P.ready });
    if (UI.tutStep >= 0 && UI.tutStep < 9) { UI.tutStep = 9; G.profile.tut = 1; saveProfile(); }
  }
  function goLabel() {
    const P = myP(), L = live(); if (!P) return '…';
    const n = L.filter(q => q.ready).length, N = L.length;
    if (N <= 1) return '▶ ' + t('es_start');
    if (!P.ready) return '▶ ' + t('es_ready') + ' ' + n + '/' + N;
    if (amHost()) return '⏩ ' + t('es_force') + ' ' + n + '/' + N;
    return '✓ ' + t('es_waiting') + ' ' + n + '/' + N;
  }
  // ---------------------------------------------------------------- boons: three cards for every player
  function netDraft(relicOnly) {
    G.phase = 'draft'; G.nextAct = relicOnly && G.act < FINAL_ACT;
    const offered = [];          // relics already on someone's cards are not offered twice
    for (const P of players()) {
      if (P.gone) { P.draft = null; P.picked = true; continue; }
      P.draft = asPlayer(P.id, () => { const keep = G.relicSet; G.relicSet = new Set([...keep, ...offered]); try { return rollBoons(relicOnly); } finally { G.relicSet = keep; } });
      for (const b of P.draft) if (b.kind === 'relic') offered.push(b.id);
      P.picked = false;
    }
    syncMine(); ui('phase'); showDraft(); markDirty(); sendSync();
  }
  function showDraft() {
    const P = myP(); if (G.phase !== 'draft' || !P) return;
    if (!P.picked && P.draft) { G.draft = P.draft; UI.draft(); } else { G.draft = null; waitModal(); }
  }
  function pick(i) {
    const P = myP(); if (!P || P.picked || G.phase !== 'draft' || !P.draft || !P.draft[i]) return;
    const b = P.draft[i];
    if (b.kind === 'unlock') toast(esc(t('es_unlocked', { p: t('es_r_' + b.role) })));
    ESAudio.sfx('pick');
    if (amHost()) handleAct(ON.me, { k: 'pick', i });
    else { P.picked = true; ON.pickT = Date.now(); G.draft = null; send('act', { k: 'pick', i }); }
    if (G.phase === 'draft') waitModal();
  }
  function pickFor(pid, i) {
    const P = G.players[pid]; if (G.phase !== 'draft' || !P || P.picked || !P.draft || !P.draft[i]) return false;
    const b = P.draft[i];
    if (b.kind === 'unlock') { if (!P.unlocked.includes(b.role)) P.unlocked.push(b.role); }
    else if (b.kind === 'relic') {
      if (G.relicSet.has(b.id)) P.shards += 60;
      else {
        G.relics.push(b.id); G.relicSet.add(b.id); G.relicBy = G.relicBy || {}; G.relicBy[b.id] = pid; relicToast(b.id, pid);
        if (b.id === 'heart') { G.maxHp += 6; G.hp += 6; }
        if (b.id === 'metronome') { G.bpm = curBpm(); ESAudio.setTempo(G.bpm); }
      }
    } else if (b.kind === 'shards') P.shards += b.n;
    else if (b.kind === 'repair') { G.hp = Math.min(G.maxHp, G.hp + b.n); ESAudio.sfx('repair'); }
    else if (b.kind === 'attune') P.attune[b.role] = (P.attune[b.role] || 0) + 1;
    P.drafts++; P.picked = true; P.draft = null;
    syncMine(); rebuild(); renderRelics(); markDirty(); checkDraft();
    return true;
  }
  function relicToast(id, pid) {
    if (!pid || pid === ON.me || !RELIC_BY[id]) return;
    const P = G.players && G.players[pid];
    toast(`${RELIC_BY[id].ic} ${esc(t('es_tookRelic', { p: P ? P.n : '…', r: t('es_rl_' + id) }))}`);
  }
  function checkDraft() {
    if (!amHost() || G.phase !== 'draft') return;
    if (!live().every(P => P.picked)) { if (UI.modal === 'waitpick') waitModal(); return; }
    for (const P of players()) { P.draft = null; P.ready = false; }
    G.draft = null;
    if (UI.modal === 'draft' || UI.modal === 'waitpick') hideModal();
    if (G.nextAct) { G.nextAct = false; advanceAct(); }
    else { G.wave++; G.phase = 'build'; rebuild(); ui('phase'); }
    markDirty(); sendSync();
  }
  function waitModal() {
    const L = live().filter(P => !P.picked);
    showModal(`<h2>⏳ ${esc(t('es_waitOthers'))}</h2><div class="plist">${L.map(P => prow(P.n, P_COLS[P.col], '…', P.id === ON.host)).join('')}</div>
      ${amHost() && L.length ? `<div class="col">${btn('sec', 'skipWait', '⏩ ' + esc(t('es_skipWait')))}</div>` : ''}`, 'waitpick');
  }

  // ---------------------------------------------------------------- run start (host)
  function startNetRun() {
    if (!amHost()) return;
    ON.runN++; ON.stage = 'run'; ON.evq = []; ON.bonus = 0;
    const seed = hashStr('spire:' + ON.code + ':' + ON.runN);      // same seed from the room code on every screen
    hideModal();
    G.players = {}; G.relicBy = {}; G.replica = false;
    for (const m of ON.mem.filter(x => alive(x.id))) addPlayer(m.id, m.n, true);
    newRun({ seed, asc: 0, orient: 's' });         // a square map so that phones and desktops see the very same layout
    syncMine(); afterStart(); refreshSpd(); markDirty(); sendSync();
  }

  // ---------------------------------------------------------------- snapshots (host → everyone)
  function sendSync() {
    if (!amHost() || ON.stage !== 'run' || !G.players) return;
    ON.v++; ON.dirty = false; ON.lastSync = performance.now();
    send('sync', {
      v: ON.v, run: ON.runN, seed: G.seed, rs: G.rng.s, act: G.act, wave: G.wave, ph: G.phase, hp: G.hp, mhp: G.maxHp, sc: G.score, k: G.kills,
      asc: G.asc, end: G.endless ? 1 : 0, na: G.nextAct ? 1 : 0, th: G.teamHp || 1, bpm: G.bpm, spd: G.speed, bn: ON.bonus, ma: G.mapA || 0,
      rl: G.relics, rb: G.relicBy || {}, rid: RES_ID, eid: EN_ID,
      res: G.res.map(r => [r.id, ROLE_ORDER.indexOf(r.role), r.note, r.lvl, r.sock, r.owner, r.invested, r.fresh ? 1 : 0, r.retune]),
      pl: players().map(P => [P.id, P.n, P.col, P.shards, P.unlocked.map(x => ROLE_ORDER.indexOf(x)), ROLE_ORDER.map(x => P.attune[x] || 0), P.drafts, P.ready ? 1 : 0, P.picked ? 1 : 0, P.gone ? 1 : 0, P.draft || null]),
      mem: memWire(),
    });
  }
  function sendSt() {
    ON.lastSt = performance.now();
    const evs = ON.evq; ON.evq = [];
    send('st', {
      run: ON.runN, v: ON.v, hp: G.hp, sc: G.score, k: G.kills, spd: G.speed, si: G.spawnIdx, ws: G.waveStep, stp: G.step, acc: Math.round(G.stepAcc * 1000),
      en: G.enemies.filter(e => !e.dead).map(e => [e.id, TI[e.type], e.path, e.fly ? Math.round(e.f * 1000) : Math.round(e.d * 10), Math.max(0, Math.ceil(e.hp)), Math.round(e.max),
        (e.stun > 0 ? 1 : 0) | (e.slow > 0.05 ? 2 : 0) | (e.hex ? 4 : 0) | (e.phased ? 8 : 0) | (e.fast > 1.05 ? 16 : 0)]),
      bz: G.barriers.map(B => [B.key, Math.round(B.hp), B.down]), sl: G.res.filter(r => r.silenced).map(r => r.id), sh: players().map(P => [P.id, P.shards]), ev: evs,
    });
  }
  function netTick() {
    if (!ON.code) return;
    const now = performance.now();
    if (amHost() && ON.stage === 'run' && G.players) {
      const sig = [G.phase, G.act, G.wave, G.res.length, G.relics.length, G.maxHp, G.speed].join('|');
      if (sig !== ON.sig) { ON.sig = sig; ON.dirty = true; }
      if ((ON.dirty && now - ON.lastSync > 80) || now - ON.lastSync > 2000) sendSync();
      if (now - ON.lastSt >= 88) sendSt();
    }
    if (now - ON.plT > 250) { ON.plT = now; renderPlist(); }
  }
  function tick() { ON.lastFrame = performance.now(); netTick(); }
  // a host whose tab is in the background gets no animation frames: keep the run going from a timer
  setInterval(() => {
    if (!ON.code || !amHost() || ON.stage !== 'run') return;
    const now = performance.now();
    if (now - ON.lastFrame < 400) { ON.bgT = now; return; }
    const el = Math.min(1.5, (now - (ON.bgT || now)) / 1000); ON.bgT = now;
    const n = G.phase === 'wave' ? G.speed : 1; G.curSpeed = n; G.audioLead = 0;
    for (let x = 0; x < el; x += 1 / 30) for (let i = 0; i < n; i++) update(1 / 30);
    netTick();
  }, 250);

  // ---------------------------------------------------------------- replica (everyone but the host)
  function applySync(S) {
    if (S.run === ON.rxRun && S.v <= ON.rxV) return;
    const first = S.run !== ON.rxRun || ON.stage !== 'run' || !G.players;
    ON.rxRun = S.run; ON.rxV = S.v; ON.runN = S.run; ON.resId = S.rid; ON.enId = S.eid; ON.rxBonus = S.bn || 0;
    ON.stage = 'run'; G.replica = true;
    const prevPh = first ? null : G.phase, prevAct = G.act, prevRel = new Set(G.relics || []);
    if (first) { hideModal(); resetWorld(); G.players = {}; G.map = null; G.mapKey = ''; G.paused = false; G.spawnQ = []; G.spawnIdx = 0; }
    Object.assign(G, { seed: S.seed, act: S.act, wave: S.wave, hp: S.hp, maxHp: S.mhp, score: S.sc, kills: S.k, asc: S.asc, endless: !!S.end, nextAct: !!S.na,
      teamHp: S.th, speed: S.spd, mapA: S.ma || 0, orient: 's' });
    if (!G.rng) G.rng = makeRng(0);
    G.rng.s = S.rs >>> 0;
    G.relics = S.rl.slice(); G.relicSet = new Set(G.relics); G.relicBy = S.rb || {};
    const now = Date.now(), pl = {};
    for (const [id, n, col, sh, ul, at, dr, rd, pk, gone, draft] of S.pl) {
      const P = G.players[id] || {};
      const keepReady = id === ON.me && now - ON.readyT < 800, keepPick = id === ON.me && !pk && now - ON.pickT < 1500 && P.picked;
      Object.assign(P, { id, n, col, shards: sh, unlocked: ul.map(i => ROLE_ORDER[i]), attune: Object.fromEntries(ROLE_ORDER.map((r, i) => [r, at[i] | 0])), drafts: dr, gone: !!gone, draft });
      if (!keepReady) P.ready = !!rd;
      if (!keepPick) P.picked = !!pk;
      pl[id] = P;
    }
    G.players = pl;
    syncMine();
    if (S.bpm !== G.bpm) { G.bpm = S.bpm; ESAudio.setTempo(G.bpm); }
    // the map: the same seed, act and square orientation on every screen
    const mk = G.seed + ':' + mapAct();
    let mapChanged = false, myRefund = 0;
    if (!G.map || G.mapKey !== mk) {
      if (!first) myRefund = G.res.filter(r => r.owner === ON.me).reduce((s, r) => s + r.invested, 0);
      G.map = genMap(G.seed, mapAct(), 's'); G.mapKey = mk; G.staticDirty = true;
      G.res = []; G.barriers = []; G.groups = []; G.chords = []; G.links = []; G.grand = []; G.enemies = []; mapChanged = true;
    }
    G.phase = S.ph;
    const quiet = first || mapChanged;
    const byId = new Map(G.res.map(r => [r.id, r])), list = [];
    for (const [id, ri, note, lvl, sock, owner, inv, fresh, ret] of S.res) {
      const so = G.map.sockets[sock]; if (!so) continue;
      let r = byId.get(id);
      if (!r) {
        r = { id, role: ROLE_ORDER[ri], note, lvl, sock, x: so.x, y: so.y, invested: inv, fireT: 0, retune: ret, silenced: false, silenceT: 0, mult: 1, rangeM: 1, born: G.t, fresh: !!fresh, muteT: 0, owner };
        if (!quiet) fxPlace(r);
      } else {
        byId.delete(id);
        if (lvl > r.lvl) { burst(r.x, r.y - 14, NOTES[note].rgb, 18, 120); addRing(r.x, r.y, 46, NOTES[note].rgb, 0, 'fx', { dur: 0.4 }); ESAudio.sfx('upgrade', note); }
        if (note !== r.note) { r.retune = ret; burst(r.x, r.y - 14, NOTES[note].rgb, 10, 70); ESAudio.sfx('retune', note); }
        Object.assign(r, { note, lvl, invested: inv, fresh: !!fresh, owner });
      }
      list.push(r);
    }
    if (!quiet) for (const r of byId.values()) { burst(r.x, r.y - 10, NOTES[r.note].rgb, 14, 90); ESAudio.sfx('sell', r.note); }
    for (const so of G.map.sockets) so.res = null;
    for (const r of list) G.map.sockets[r.sock].res = r;
    G.res = list;
    rebuild();
    if (!first) for (const id of G.relics) if (!prevRel.has(id)) relicToast(id, G.relicBy[id]);
    setMem(S.mem);
    if (first) afterStart();
    if (first || prevPh !== G.phase) onPhase(prevPh);
    else if (G.phase === 'draft') { if (UI.modal === 'waitpick') waitModal(); else if (UI.modal !== 'draft' && myP() && !myP().picked) showDraft(); }
    if (!first && G.act !== prevAct) { ui('act'); if (myRefund) toast(esc(t('es_refund', { n: myRefund }))); }
    if (mapChanged || first) layout();
    if (G.phase === 'build') buildPalette();
    renderRelics(); refreshSpd();
  }
  // the cosmetic side of the host's phase changes (banners, sounds, popups)
  function onPhase(prev) {
    const ph = G.phase;
    if ((prev === 'won' || prev === 'over') && (UI.modal === 'won' || UI.modal === 'over')) hideModal();
    if (ph === 'wave') {
      G.spawnQ = buildWave(); G.spawnIdx = 0; for (const r of G.res) r.fresh = false;
      ESAudio.sfx('wave'); ESAudio.musicLevel(0.95); banner(waveTitle(), isBossWave() ? t('es_bossWave') : ''); select(null); G.preview = null;
    } else if (ph === 'cleared') {
      G.boss = null; ui('bossBar', null); ESAudio.sfx('clear'); ESAudio.musicLevel(0.8); banner(t('es_cleared'), '+' + ON.rxBonus + ' ◆');
    } else if (ph === 'build') {
      if (UI.modal === 'draft' || UI.modal === 'waitpick') hideModal();
      G.boss = null; ui('bossBar', null); G.draft = null;
    } else if (ph === 'won') {
      G.boss = null; ui('bossBar', null); ESAudio.sfx('victory'); G.flash = 0.8; G.flashCol = '255,240,200';
      for (let i = 0; i < 80; i++) burst(0, -60, NOTES[i % 5].rgb, 1, 260);
      G.later.push({ t: G.t + 1.2, fn: () => { if (G.phase === 'won') ui('victory'); } });
    } else if (ph === 'over') {
      ESAudio.sfx('defeat'); ESAudio.musicLevel(0.5);
      for (let i = 0; i < 70; i++) G.parts.push({ x: (Math.random() - 0.5) * 30, y: -Math.random() * 110, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 200, life: 0, max: 1.4 + Math.random(), rgb: '210,220,255', s: 3 + Math.random() * 3, k: 'shard' });
      shake(16); G.flash = 0.9; G.flashCol = '255,60,110'; G.spireBroken = true;
      for (const e of G.enemies) smoke(e.x, e.y, 4, e.r * 0.7);
      G.enemies = []; G.boss = null; ui('bossBar', null);
      G.later.push({ t: G.t + 1.8, fn: () => { if (G.phase === 'over') ui('gameover'); } });
    }
    ui('phase');
    if (ph === 'draft') showDraft();
  }
  function mkEnemy(id, ti, pi) {
    const type = ETYPES[ti], def = ENEMIES[type], p = G.map.paths[pi] || G.map.paths[0], g = gIndex();
    const e = { id, type, def, hp: 1, max: 1, path: G.map.paths[pi] ? pi : 0, d: 0, x: p.pts[0].x, y: p.pts[0].y, ang: 0, spd: def.spd * (1 + Math.min(0.25, 0.012 * g)) * (1 + 0.03 * G.asc),
      slow: 0, stun: 0, hitT: 0, block: null, dead: false, hint: { i: 0 }, ph: (id * 2.39996) % 6.283, rem: p.len, born: G.t, fly: !!def.fly, hex: false, r: def.r, pushT: 0,
      phased: false, hasteT: 0, fast: 1, p0: 0, p1: 0, lt: 0 };
    if (e.fly) { e.fx0 = p.start.x; e.fy0 = p.start.y; e.flen = Math.hypot(p.start.x, p.start.y) - SPIRE_R; e.f = 0; e.rem = e.flen; e.x = e.fx0; e.y = e.fy0; }
    return e;
  }
  function setPos(e, v) {
    const p = G.map && G.map.paths[e.path]; if (!p) return;
    if (e.fly) {
      const ox = e.x, oy = e.y; e.f = v;
      const ux = -e.fx0 / (e.flen + SPIRE_R), uy = -e.fy0 / (e.flen + SPIRE_R), w = Math.sin(e.f * Math.PI * 4 + e.ph) * 26 * (1 - e.f);
      e.x = e.fx0 + ux * e.f * e.flen - uy * w; e.y = e.fy0 + uy * e.f * e.flen + ux * w;
      if (Math.abs(e.x - ox) + Math.abs(e.y - oy) > 0.01) e.ang = Math.atan2(e.y - oy, e.x - ox);
      e.rem = (1 - e.f) * e.flen;
    } else { e.d = v; pathAt(p, e.d, e, e.hint); e.rem = p.len - e.d; }
  }
  function lerpEnemies(dt) {      // called from update() on the replica: glide between the last two snapshots
    const T = Math.max(0.03, ON.stGap / 1000), k0 = dt / (G.curSpeed || 1);
    for (const e of G.enemies) { e.lt += k0; const k = Math.min(1, e.lt / T); setPos(e, e.p0 + (e.p1 - e.p0) * k); e.hitT = Math.max(0, e.hitT - dt); }
  }
  function applySt(p) {
    if (ON.stage !== 'run' || !G.map || p.run !== ON.runN) return;
    const now = performance.now(), gap = clamp(now - (ON.stRx || now - 90), 30, 300); ON.stRx = now; ON.stGap = ON.stGap * 0.8 + gap * 0.2;
    if (p.hp > G.hp && G.phase === 'wave') G.heal = 1;
    G.hp = p.hp; G.score = p.sc; G.kills = p.k; G.spawnIdx = p.si; G.waveStep = p.ws;
    if (G.speed !== p.spd) { G.speed = p.spd; refreshSpd(); }
    // keep the local beat (and so the music) in step with the host
    const sd = 60 / G.bpm / 4, diff = (p.stp + p.acc / 1000 / sd) - (G.step + G.stepAcc / sd);
    if (Math.abs(diff) > 6) { G.step = p.stp; G.stepAcc = p.acc / 1000; } else if (Math.abs(diff) > 0.25) G.stepAcc += diff * sd * 0.15;
    const old = new Map(G.enemies.map(e => [e.id, e])), all = new Map(old), list = [];
    for (const [id, ti, pi, prog, hp, max, fl] of p.en) {
      const def = ENEMIES[ETYPES[ti]]; if (!def) continue;
      const pos = def.fly ? prog / 1000 : prog / 10;
      let e = old.get(id);
      if (!e) { e = mkEnemy(id, ti, pi); e.p0 = e.p1 = pos; e.lt = 1; setPos(e, pos); e.hp = hp; e.max = max; newEnemyFx(e); }
      else { old.delete(id); e.p0 = e.fly ? e.f : e.d; e.p1 = pos; e.lt = 0; }
      if (hp < e.hp - 0.5) e.hitT = 0.12;
      e.hp = hp; e.max = max; e.stun = fl & 1 ? 0.3 : 0; e.slow = fl & 2 ? 0.45 : 0; e.hex = !!(fl & 4); e.phased = !!(fl & 8); e.fast = fl & 16 ? 1.3 : 1;
      list.push(e);
    }
    G.enemies = list;
    if (G.boss && !list.includes(G.boss)) { G.boss = null; ui('bossBar', null); }
    for (const x of p.ev || []) clientEvent(x, all);
    for (const [key, hp, down] of p.bz || []) {
      const B = G.barriers.find(b => b.key === key); if (!B) continue;
      if (down > 0 && B.down <= 0) { B.flash = 1; for (const q of B.pts) burst(q.x, q.y - 10, NOTES[B.note].rgb, 3, 120); ESAudio.sfx('shatter'); shake(3); }
      else if (down <= 0 && B.down > 0) B.flash = 1;
      if (hp < B.hp - 1) { B.flash = Math.max(B.flash, 0.5); B.hitT = G.t; }
      B.hp = hp; B.down = down;
    }
    const sl = new Set(p.sl || []); for (const r of G.res) r.silenced = sl.has(r.id);
    for (const [id, sh] of p.sh || []) if (G.players[id]) G.players[id].shards = sh;
    syncMine();
  }
  function newEnemyFx(e) {
    burst(e.x, e.y, '150,90,255', 6, 70);
    if (e.def.boss) { G.boss = e; ui('bossBar', e); ESAudio.sfx('boss'); shake(7); banner(t('es_e_' + e.type), t('es_ed_' + e.type)); }
    if (!G.profile.seen.includes(e.type)) { G.profile.seen.push(e.type); saveProfile(); ui('newEnemy', e.type); }
  }
  function clientEvent(x, all) {
    const e = all.get(x[1]);
    if (x[0] === 'k' && e) {
      smoke(e.x, e.y, e.def.boss ? 30 : 6, e.r * 0.7); burst(e.x, e.y, '170,120,255', e.def.boss ? 60 : 9, e.def.boss ? 260 : 110);
      for (let i = 0; i < (e.def.boss ? 14 : 2); i++) G.parts.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 60, life: 0, max: 0.9, rgb: '127,245,255', s: 3, k: 'shard' });
      ESAudio.sfx('death'); G.sparkles++;
      if (e.def.boss) { shake(14); G.flash = 0.6; G.flashCol = '255,255,255'; G.boss = null; ui('bossBar', null); floatText(e.x, e.y - 40, '+' + x[2] + ' ◆', '#7ff5ff', 18); banner(t('es_bossDown'), ''); }
    } else if (x[0] === 'l') {
      shake(e && e.def.boss ? 12 : 5); G.flash = Math.max(G.flash, 0.55); G.flashCol = '255,60,110';
      ESAudio.sfx('hit'); burst(0, -40, '255,90,140', 16, 140); floatText(0, -150, '-' + x[2], '#ff6f91', 18);
    } else if (x[0] === 'r') {
      if (x[3]) addRing(x[1], x[2], 240, '255,214,120', 0, 'fx', { dur: 0.8 }); else addRing(x[1], x[2], 170, '255,80,120', 0, 'discord', { dur: 0.7 });
      ESAudio.sfx('dissonance'); shake(4);
    }
  }

  // ---------------------------------------------------------------- screens
  function prow(name, col, sub, crown) {
    return `<div class="prow" style="--c:${col}"><i class="dot"></i><div><b dir="auto">${esc(name)}${crown ? ' 👑' : ''}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div></div>`;
  }
  function lobbyList() { const L = ON.mem.filter(m => alive(m.id)); if (!L.some(m => m.id === ON.me)) L.push({ id: ON.me, n: myName() }); return L; }
  function openMenu() {
    if (ON.code) { showLobby(); return; }
    const an = authName();
    showModal(`<h2>🌐 ${esc(t('es_online'))}</h2><p class="sub">${esc(t('es_onlineSub'))}</p>
      ${an ? `<p class="sub">👤 <b dir="auto">${esc(an)}</b></p>` : `<label class="fl">${esc(t('es_yourName'))}<input id="esName" class="tin" maxlength="16" value="${esc(myName())}" autocomplete="off" spellcheck="false" dir="auto"></label>`}
      <div class="col">${btn('big', 'netCreate', '➕ ' + esc(t('es_create')))}</div>
      <div class="or">${esc(t('es_or'))}</div>
      <div class="row2 joinrow"><input id="esCode" class="tin code" maxlength="6" placeholder="${esc(t('es_codePh'))}" autocomplete="off" spellcheck="false"><button class="btn" data-act="netJoin">${esc(t('es_join'))}</button></div>
      <p class="msg" id="esMsg"></p>
      <div class="col">${btn('sec', 'close', esc(t('es_back')))}</div>`, 'online');
    const ci = $('esCode');
    if (ci) { ci.oninput = () => { ci.value = ci.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; ci.onkeydown = (e) => { if (e.key === 'Enter') act('netJoin', {}); }; }
  }
  function renderLobby() { if (UI.modal === 'lobby') showLobby(); }
  function showLobby() {
    if (!ON.code || ON.stage === 'run') return;
    const host = amHost(), L = lobbyList(), n = L.length;
    const rows = L.map((m, i) => prow(m.id === ON.me ? myName() : m.n, P_COLS[i % P_COLS.length], (m.id === ON.me ? t('es_you') + ' · ' : '') + t(m.id === ON.host ? 'es_hostR' : 'es_playerR'), m.id === ON.host)).join('');
    const foot = host
      ? `<div class="col"><button class="btn big" data-act="netStart" ${n < 2 ? 'disabled' : ''}>▶ ${esc(t('es_startRun'))}</button></div>${n < 2 ? `<p class="sub">${esc(t('es_needPlayers'))}</p>` : ''}`
      : `<p class="sub">${esc(t(ON.ready && ON.host ? 'es_waitHost' : 'es_connecting'))}</p>`;
    const html = `<h2>🌐 ${esc(t('es_online'))}</h2>
      <div class="roomcode"><span>${esc(t('es_room'))}</span><b>${esc(ON.code)}</b><button class="btn sec" data-act="netCopy">📋 ${esc(t('es_copyLink'))}</button></div>
      <div class="plist">${rows}</div><p class="sub tiny">${n}/${NET_MAX}</p>
      <p class="sub l">${esc(t('es_coopHint'))}</p>${foot}
      <div class="col">${btn('sec', 'leave', '🚪 ' + esc(t('es_leaveRoom')))}</div>`;
    if (UI.modal === 'lobby' && ON.lobbyH === html) return;       // heartbeats must not redraw (and steal clicks from) the lobby
    ON.lobbyH = html; showModal(html, 'lobby');
  }
  function endButtons(won) {
    const lv = btn('sec', 'leave', '🚪 ' + esc(t('es_leaveRoom')));
    if (!amHost()) return `<p class="sub">${esc(t('es_waitHostEnd'))}</p>` + lv;
    return (won ? btn('big', 'endless', '∞ ' + esc(t('es_goEndless'))) + btn('sec', 'netAgain', '⟳ ' + esc(t('es_playAgain'))) : btn('big', 'netAgain', '⟳ ' + esc(t('es_playAgain')))) + lv;
  }
  function renderPlist() {
    const el = $('plist'); if (!el) return;
    const show = G.online && ON.stage === 'run' && G.phase !== 'menu' && !!G.players;
    if (el.hidden === show) el.hidden = !show;
    if (!show) return;
    const html = players().filter(P => !P.gone || G.res.some(r => r.owner === P.id)).map(P => {
      const st = P.gone ? t('es_gone') : G.phase === 'build' ? (P.ready ? '✓' : '') : G.phase === 'draft' ? (P.picked ? '✓' : '…') : '';
      return `<div class="pc${P.gone ? ' gone' : ''}${P.id === ON.me ? ' me' : ''}" style="--c:${P_COLS[P.col]}"><i></i><b dir="auto">${esc(P.n)}</b>${P.id === ON.host ? '👑' : ''}<span>◆${P.shards}</span>${st ? `<em>${esc(st)}</em>` : ''}</div>`;
    }).join('');
    if (html !== ON.plH) { ON.plH = html; el.innerHTML = html; }
  }
  function refreshSpd() {
    const b = $('spdBtn'); if (!b) return;
    b.hidden = G.online && ON.stage === 'run' && !amHost();
    b.textContent = G.speed + '×'; b.classList.toggle('on', G.speed > 1);
  }
  function copy(text, el) {
    const done = () => { if (!el) return; const o = el.textContent; el.textContent = '✓ ' + t('es_copied'); setTimeout(() => { el.textContent = o; }, 1300); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
  }
  function saveName() { const ni = $('esName'); if (ni && ni.value.trim()) lsSet('echoes-spire-name', ni.value.trim().slice(0, 16)); }
  async function act(a, ds, el) {
    switch (a) {
      case 'netCreate': saveName(); if (!(await canGo())) return; joinRoom(newCode(), true); break;
      case 'netJoin': {
        saveName();
        const ci = $('esCode'), code = (ci ? ci.value : '').trim().toUpperCase();
        if (code.length < 4) { const m = $('esMsg'); if (m) m.textContent = t('es_codeHint'); return; }
        if (!(await canGo())) return; joinRoom(code, false); break;
      }
      case 'netCopy': copy(invite(ON.code), el); break;
      case 'netStart': startNetRun(); break;
      case 'leave': leave(); break;
      case 'netAgain': if (amHost()) startNetRun(); break;
      case 'skipWait': if (amHost()) for (const P of live()) if (!P.picked) pickFor(P.id, 0); break;
    }
  }
  function relabel() {
    ON.plH = ''; renderPlist();
    if (UI.modal === 'lobby') showLobby(); else if (UI.modal === 'online') openMenu(); else if (UI.modal === 'waitpick') waitModal();
  }

  // ---------------------------------------------------------------- site hooks (invites from the chat, live rooms, ?room=)
  addEventListener('pagehide', () => { if (ON.ch) send('bye', {}); });
  window.Mal3abShareLink = () => (ON.code ? invite(ON.code) : pageLink());
  window.Mal3abPrepareInvite = async () => {
    if (!ON.code) { if (!(await canGo())) return pageLink(); joinRoom(newCode(), true); }
    return invite(ON.code);
  };
  window.Mal3abLiveInfo = () => ({ players: ON.code ? lobbyList().length : null, max: NET_MAX });

  window.ESNet = {
    ON, earn, waveBonus, refund, openDraft: netDraft, ev, lerp: lerpEnemies, req, goPress, goLabel, pick, act, tick, openMenu, endButtons, relabel,
    joinRoom, leaveRoom, leave, startRun: startNetRun, newCode, amHost,
    amReady: () => { const P = myP(); return !!(P && P.ready && !amHost()); },
    mine: (r) => !G.online || r.owner === ON.me,
    colOf: (id) => { const P = G.players && G.players[id]; return P ? P_COLS[P.col] : '#ffffff'; },
    nameOf: (id) => { const P = G.players && G.players[id]; return P ? P.n : '…'; },
    isGone: (id) => { const P = G.players && G.players[id]; return !!(P && P.gone); },
    state: () => ({ code: ON.code, me: ON.me, host: ON.host, amHost: amHost(), stage: ON.stage, mem: ON.mem.map(m => m.id), replica: !!G.replica,
      players: players().map(P => ({ id: P.id, n: P.n, col: P.col, shards: P.shards, ready: P.ready, picked: P.picked, gone: P.gone, unlocked: P.unlocked.slice(), draft: P.draft })) }),
  };
  if (window.EchoesSpire) window.EchoesSpire.net = window.ESNet;

  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {
    let tried = false;
    const go = async () => { if (tried || ON.code) return; tried = true; if (!(await canGo())) return; joinRoom(roomParam, false); };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); }
  }
})();
