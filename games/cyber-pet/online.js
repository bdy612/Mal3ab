// Cyber Pet — online "Pet Park" for up to 4 players.
// Supabase Realtime broadcast room "cyber-pet-CODE". The host (room creator, then the next player in join order) runs the park
// (pet positions, playdates) and the battle clock; everyone else sends actions. Each pet's save only ever changes on its owner's
// device: others only ever see a small public summary (name, stage, look, mood, a few stats for the compare card).
(function () {
  'use strict';
  const A = window.CyberPet && window.CyberPet._; if (!A || !A.core || !A.NET) return;
  const C = A.core, NET = A.NET, { clamp, lerp, rnd, hr, rr, ell, glowFill, noGlow, T, SR, GAMES, GAME_ORDER } = A;
  const $ = (s) => document.querySelector(s), esc = C.esc, TAU = Math.PI * 2;
  const MAXP = 4, PCOL = ['#3ef0ff', '#ff4fd8', '#ffd23e', '#3dffa8'], DUR = 60, ALWAYS = ['catch', 'whack'];
  const EMOS = [['wave', '👋'], ['love', '❤️'], ['laugh', '😂'], ['party', '🎉']];
  const TREATS = ['cookie', 'pie', 'gum', 'cake'], TREAT_FX = { happy: 6, data: 2 }, PLAYDATE_FX = 4;

  A.addStr({
    cp_pk_menu: 'جنينة البِتات أونلاين', cp_pk_menu_d: 'هات البِت بتاعك جنينة مع لحد ٣ صحاب: سلّموا على بعض، ادّوا بعض حلويات، واتحدّوا في الألعاب.', cp_pk_go: 'ادخل',
    cp_pk_title: 'جنينة البِتات', cp_pk_sign: 'جنينة البِتات', cp_pk_intro: 'اعمل أوضة وابعت الكود لصحابك (لحد ٤ لعيبة)، أو ادخل بكود.',
    cp_pk_name: 'اسمك', cp_pk_create: 'اعمل أوضة', cp_pk_join: 'ادخل', cp_pk_joincode: 'ادخل بكود', cp_pk_code_hint: 'اكتب كود الأوضة (٤ حروف).',
    cp_pk_nonet: 'الأونلاين مش شغال دلوقتي.', cp_pk_full: 'الأوضة دي مليانة (٤ لعيبة).', cp_pk_joined: '{p} دخل الجنينة!', cp_pk_left: '{p} خرج من الجنينة.',
    cp_pk_newhost: '{p} بقى الهوست دلوقتي 👑', cp_pk_youhost: 'إنت بقيت الهوست دلوقتي 👑', cp_pk_copy: 'انسخ لينك الدعوة', cp_pk_copied: 'اتنسخ!',
    cp_pk_leave: 'اخرج من الجنينة', cp_pk_you: 'إنت', cp_pk_host: 'الهوست', cp_pk_player: 'لعّيب',
    cp_pk_waiting: 'مستني صحابك… ابعتلهم الكود {c}', cp_pk_tap: 'اخبط على النجيلة عشان البِت يمشي · واخبط على بِت صاحبك عشان تشوف أكتر',
    cp_pk_treat: 'حلويات', cp_pk_compare: 'قارن', cp_pk_battle: 'تحدّي',
    cp_pk_e_wave: 'سلام', cp_pk_e_love: 'حب', cp_pk_e_laugh: 'ضحك', cp_pk_e_party: 'احتفال',
    cp_pk_treat_t: 'ادّي حلويات', cp_pk_treat_h: 'الحلويات بتفرّح بِت صاحبك شوية، وببلاش!', cp_pk_treat_cd: 'استنى ثواني قبل ما تدّي {n} حلويات تاني.',
    cp_pk_treat_sent: 'إديت {n} حلويات!', cp_pk_treat_got: '{p} إدّى {n} حلويات! +{v} 💗', cp_pk_nofriends: 'مفيش صحاب في الجنينة لسه.',
    cp_pk_playdate: 'لعب مع {n}! +{v} 💗', cp_pk_cmp_t: 'قارن البِتات', cp_pk_age: 'العمر', cp_pk_medals: 'الميداليات', cp_pk_h: 'س',
    cp_pk_pick_t: 'اختار التحدّي', cp_pk_pick_h: 'كله بيلعب نفس اللعبة بنفس البذرة لمدة {s} ثانية. اللي يجيب أعلى نقط يكسب {c} ¢.',
    cp_pk_need2: 'محتاج لعّيبين على الأقل عشان التحدّي.', cp_pk_hostpicks: 'الهوست هو اللي بيختار التحدّي.', cp_pk_inprog: 'فيه تحدّي شغال: {g}',
    cp_pk_nextround: 'هتدخل التحدّي اللي جاي.', cp_pk_wait: 'مستني الباقيين…', cp_pk_res_t: 'نتيجة التحدّي',
    cp_pk_win: 'كسبت! +{c} ¢', cp_pk_lose: 'محاولة حلوة! البِت بتاعك اتبسط برضه. +{v} 💗', cp_pk_wonby: '{p} كسب {g} بـ {s}!', cp_pk_tie: 'تعادل!',
    cp_pk_back: 'ارجع للجنينة', cp_pk_rematch: 'تاني', cp_pk_quitb: 'اخرج من التحدّي', cp_pk_bpause_h: 'التحدّي لسه شغال وإنت فاتح دي!',
    cp_pk_gone_t: 'كله مشي', cp_pk_gone_h: 'صحابك خرجوا من الجنينة. تقدر تستنى حد يدخل بالكود {c}، أو ترجع أوضتك.',
    cp_pk_gone_hb: 'صحابك خرجوا من التحدّي. تقدر تكمّل الجولة لوحدك، أو ترجع أوضتك.',
    cp_pk_stay: 'استنى في الجنينة', cp_pk_solo: 'كمّل لوحدك', cp_pk_toroom: 'ارجع أوضتي', cp_pk_lefttag: 'خرج',
    cp_pk_needpet: 'افقس بِت الأول، وبعدين تقدر تجيبه الجنينة!', cp_pk_seconds: '{n} ث',
  }, {
    cp_pk_menu: 'Pet Park Online', cp_pk_menu_d: 'Bring your pet to a shared park with up to 3 friends: wave, give treats and battle in the mini-games.', cp_pk_go: 'Go',
    cp_pk_title: 'Pet Park', cp_pk_sign: 'PET PARK', cp_pk_intro: 'Create a room and send the code to your friends (up to 4 players), or join with a code.',
    cp_pk_name: 'Your Name', cp_pk_create: 'Create Room', cp_pk_join: 'Join', cp_pk_joincode: 'Join With A Code', cp_pk_code_hint: 'Type the 4-letter room code.',
    cp_pk_nonet: 'Online play is not available right now.', cp_pk_full: 'That room is full (4 players).', cp_pk_joined: '{p} joined the park!', cp_pk_left: '{p} left the park.',
    cp_pk_newhost: '{p} is the host now 👑', cp_pk_youhost: 'You are the host now 👑', cp_pk_copy: 'Copy Invite Link', cp_pk_copied: 'Copied!',
    cp_pk_leave: 'Leave Park', cp_pk_you: 'You', cp_pk_host: 'Host', cp_pk_player: 'Player',
    cp_pk_waiting: 'Waiting for friends… share the code {c}', cp_pk_tap: "Tap the grass to walk · tap a friend's pet for more",
    cp_pk_treat: 'Treat', cp_pk_compare: 'Compare', cp_pk_battle: 'Battle',
    cp_pk_e_wave: 'Wave', cp_pk_e_love: 'Love', cp_pk_e_laugh: 'Laugh', cp_pk_e_party: 'Party',
    cp_pk_treat_t: 'Give A Treat', cp_pk_treat_h: "A treat makes a friend's pet a little happier. It's free!", cp_pk_treat_cd: 'Wait a few seconds before giving {n} another treat.',
    cp_pk_treat_sent: 'You gave {n} a treat!', cp_pk_treat_got: '{p} gave {n} a treat! +{v} 💗', cp_pk_nofriends: 'No friends in the park yet.',
    cp_pk_playdate: 'Playdate with {n}! +{v} 💗', cp_pk_cmp_t: 'Compare Pets', cp_pk_age: 'Age', cp_pk_medals: 'Medals', cp_pk_h: 'h',
    cp_pk_pick_t: 'Pick A Battle', cp_pk_pick_h: 'Everyone plays the same game with the same seed for {s} seconds. The highest score wins {c} ¢.',
    cp_pk_need2: 'You need at least 2 players for a battle.', cp_pk_hostpicks: 'The host picks the battle.', cp_pk_inprog: 'Battle in progress: {g}',
    cp_pk_nextround: 'You will join the next battle.', cp_pk_wait: 'Waiting for the others…', cp_pk_res_t: 'Battle Results',
    cp_pk_win: 'You won! +{c} ¢', cp_pk_lose: 'Nice try! Your pet still had fun. +{v} 💗', cp_pk_wonby: '{p} won {g} with {s}!', cp_pk_tie: "It's a tie!",
    cp_pk_back: 'Back To Park', cp_pk_rematch: 'Rematch', cp_pk_quitb: 'Leave Battle', cp_pk_bpause_h: 'The battle keeps running while this is open!',
    cp_pk_gone_t: 'Everyone Left', cp_pk_gone_h: 'Your friends left the park. You can wait for someone to join with the code {c}, or go back to your room.',
    cp_pk_gone_hb: 'Your friends left the battle. You can finish this run solo, or go back to your room.',
    cp_pk_stay: 'Wait In Park', cp_pk_solo: 'Continue Solo', cp_pk_toroom: 'Back To My Room', cp_pk_lefttag: 'left',
    cp_pk_needpet: 'Hatch a pet first, then you can bring it to the park!', cp_pk_seconds: '{n}s',
  });

  // ------------------------------------------------------------------ state
  const ON = { ch: null, code: '', ready: false, me: '', j: 0, jl: 0, peers: new Map(), host: '', hb: null, pending: '', pendingT: 0, fullT: {}, treatCd: {}, gotT: {}, myPub: null, pubKey: '', pubSent: 0, emoT: 0, bt: null, alone: false, slots: {}, hostWait: 0 };
  const HS = new Map();   // host-only park simulation: id -> { x, y, tx, ty, wT, hold, hopN }
  const PS = new Map();   // last positions received from the host: id -> { x, y, hopN }
  const PK = new Map();   // display state on this device: id -> { x, y, hy, hv, hopN, lookX, lookY, blink, blinkT, react, reactT, emo, emoT, sq, sqv, cmd, sx, sy, sR }
  const PD = { acc: {}, last: {} };   // host: playdate timers per pair
  const FX = [];          // flying treats
  let B = null, lastRes = null, uiT = 0, psT = 0, rosterKey = '';

  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (code) => pageLink() + '?room=' + code;
  const newCode = () => { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)]; return s; };
  const cleanCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const cleanName = (n) => String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 14);
  const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const myName = () => cleanName(C.settings.oname || (window.Auth && Auth.name && Auth.name()) || '') || T('cp_pk_player');
  const amHost = () => ON.host === ON.me;
  async function canGo() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }

  // public summary of my pet: the only thing other players ever see
  function makePub() {
    const S = C.S; if (!S) return null; const st = S.st;
    return { pn: S.name || 'Byte', st: S.stage, f: S.form, m: C.mood(), h: S.stage >= 1 ? S.eq.head : null, fa: S.stage >= 1 ? S.eq.face : null, sl: S.sleeping ? 1 : 0, ht: S.hatch || 0,
      s: [st.data, st.energy, st.happy, st.cur, st.glitch].map(v => Math.round(v)), xp: Math.floor(S.xp), age: Math.round(C.ageH() * 10) / 10,
      md: Object.values(S.medals || {}).reduce((a, b) => a + (b | 0), 0), cs: C.careStyle() };
  }
  const STR = (v, n) => (typeof v === 'string' ? v.slice(0, n) : null);
  function cleanPub(p) {
    if (!p || typeof p !== 'object') return null;
    const s = Array.isArray(p.s) ? p.s.slice(0, 5).map(v => clamp(+v || 0, 0, 100)) : [50, 50, 50, 50, 10]; while (s.length < 5) s.push(0);
    return { pn: cleanName(p.pn) || 'Byte', st: clamp(p.st | 0, 0, 4), f: C.FORMS[p.f] ? p.f : 'bitling', m: C.MOOD_EMO[p.m] ? p.m : 'content', h: STR(p.h, 16), fa: STR(p.fa, 16), sl: p.sl ? 1 : 0, ht: clamp(+p.ht || 0, 0, 10),
      s, xp: Math.max(0, +p.xp || 0) | 0, age: Math.max(0, +p.age || 0), md: clamp(p.md | 0, 0, 99), cs: ['aff', 'play', 'order', 'chaos'].includes(p.cs) ? p.cs : null };
  }

  // everyone in the room (me included), in join order; the first one is the host
  function players() {
    const a = [{ id: ON.me, n: myName(), j: ON.j, pub: ON.myPub, me: true }];
    for (const P of ON.peers.values()) a.push(P);
    const sl = (q) => (ON.slots[q.id] != null ? ON.slots[q.id] : 99);
    a.sort((x, y) => (sl(x) - sl(y)) || (x.j - y.j) || (x.id < y.id ? -1 : 1));
    return a;
  }
  // colour slot: handed out by the host (same on every device, kept while the player stays)
  function slotOf(id) {
    if (ON.slots[id] != null) return ON.slots[id];
    const list = players(), used = new Set(list.map(p => ON.slots[p.id]).filter(v => v != null)); let n = 0;
    for (const p of list) { if (ON.slots[p.id] != null) continue; while (used.has(n)) n++; if (p.id === id) return n % MAXP; n++; }
    return 0;
  }
  function ensureSlots() {
    const list = players(), ids = new Set(list.map(p => p.id)); for (const k of Object.keys(ON.slots)) if (!ids.has(k)) delete ON.slots[k];
    const used = new Set(Object.values(ON.slots)); for (const p of list) if (ON.slots[p.id] == null) { let n = 0; while (used.has(n)) n++; ON.slots[p.id] = n; used.add(n); }
  }
  const colOf = (id) => PCOL[slotOf(id) % PCOL.length];
  const nameOf = (id) => { if (id === ON.me) return myName(); const P = ON.peers.get(id); return P ? P.n : (B && B.names[id]) || '…'; };
  const petOf = (id) => { if (id === ON.me) return ON.myPub; const P = ON.peers.get(id); return P ? P.pub : null; };
  const friends = () => players().filter(p => !p.me && p.pub);

  // ------------------------------------------------------------------ network
  const EVENTS = ['hello', 'hb', 'bye', 'full', 'pub', 'ps', 'walk', 'emo', 'treat', 'pd', 'bgo', 'bsc', 'bend'];
  function send(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }
  const btInfo = () => (amHost() && B && !B.ended ? { bid: B.bid, g: B.g } : null);
  function hello(req) { send('hello', { n: myName(), up: Date.now() - ON.j, pub: ON.myPub, req: !!req, h: ON.host, bt: btInfo() }); }
  function beat() {
    if (!ON.ch) return;
    ON.myPub = makePub();
    send('hb', { n: myName(), up: Date.now() - ON.j, pub: ON.myPub, h: ON.host, bt: btInfo() });
    const now = Date.now(); for (const P of [...ON.peers.values()]) if (now - P.t > 9000) removePeer(P.id);
  }
  function ensurePet(code, create) {
    if (C.S) return true;
    if (C.loadSave()) { C.continueGame(); return !!C.S; }
    ON.pending = code; ON.pendingCreate = !!create; ON.pendingT = Date.now(); C.toast(SR('cp_pk_needpet')); C.openName(false); return false;
  }
  function joinRoom(code, create) {
    code = cleanCode(code); if (code.length < 4) return false;
    if (!window.sb) { C.toast(SR('cp_pk_nonet')); return false; }
    if (!ensurePet(code, create)) return false;
    leaveRoom(true);
    let rec = null; try { rec = JSON.parse(sessionStorage.getItem('cyber-pet-on-' + code) || 'null'); } catch (e) {}
    if (!rec || typeof rec.id !== 'string' || !rec.jt) { rec = { id: Math.random().toString(36).slice(2, 10), jt: Date.now() }; try { sessionStorage.setItem('cyber-pet-on-' + code, JSON.stringify(rec)); } catch (e) {} }
    ON.me = rec.id; ON.j = rec.jt; ON.jl = Date.now(); ON.code = code; ON.ready = false; ON.alone = false; ON.bt = null;
    ON.host = create ? ON.me : ''; ON.slots = create ? { [ON.me]: 0 } : {}; ON.hostWait = Date.now() + 9000;   // a joiner first listens for the room's host
    ON.peers.clear(); HS.clear(); PS.clear(); PK.clear(); FX.length = 0; PD.acc = {}; PD.last = {}; B = null; ON.myPub = makePub();
    const ch = sb.channel('cyber-pet-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; ON.hostWait = Math.min(ON.hostWait, Date.now() + 2200); hello(true); renderPark(true); } });
    ON.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    window.Mal3abShareLink = () => inviteLink(code);
    clearInterval(ON.hb); ON.hb = setInterval(beat, 2000);
    C.closeModal(); C.setScene('park'); C.Snd.sfx('sparkle');
    return true;
  }
  function leaveRoom(quiet) {
    if (ON.ch) { send('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(ON.hb); ON.ch = null; ON.ready = false; ON.code = ''; ON.peers.clear(); HS.clear(); PS.clear(); PK.clear(); FX.length = 0; B = null; ON.bt = null; hideBoard();
    window.Mal3abShareLink = () => (ON.code ? inviteLink(ON.code) : pageLink());
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  }
  function leavePark() {
    const inBattle = C.MG.battle; leaveRoom(); C.closeModal();
    if (inBattle) C.exitBattle();
    C.saveNow(); C.setScene('hub');
  }
  function onNet(ev, p) {
    if (!p || typeof p.id !== 'string' || p.id === ON.me || !ON.code) return;
    const now = Date.now();
    if (ev === 'full') { if (p.to === ON.me) { leavePark(); C.toast(SR('cp_pk_full')); } return; }
    let P = ON.peers.get(p.id);
    if (ev === 'bye') { if (P) removePeer(p.id); return; }
    let fresh = false;
    if (!P) {
      if (ev !== 'hello' && ev !== 'hb') return;   // a peer appears with its hello / heartbeat
      if (ON.peers.size >= MAXP - 1) { if (now - (ON.fullT[p.id] || 0) > 2500) { ON.fullT[p.id] = now; send('full', { to: p.id }); } return; }
      P = { id: p.id, n: '…', j: now - (+p.up || 0), t: now, pub: null }; ON.peers.set(p.id, P); fresh = true;
    }
    P.t = now;
    if (ev === 'hello' || ev === 'hb') {
      if (typeof p.n === 'string') P.n = cleanName(p.n) || '…';
      if (p.up != null) P.j = Math.min(P.j, now - (+p.up || 0));
      if (p.pub) P.pub = cleanPub(p.pub);
      if (p.id === ON.host || p.bt) ON.bt = p.bt && typeof p.bt.g === 'string' ? { bid: String(p.bt.bid), g: p.bt.g, t: now } : null;
      if (fresh) {
        if (now - ON.jl > 3000) { C.toast('👋 ' + SR('cp_pk_joined', { p: P.n })); C.Snd.sfx('chirp', 1100); }
        if (C.modalKind === 'pkgone') { C.closeModal(); if (C.MG.battle) C.MG.paused = false; }
        ON.alone = false;
      }
      if (typeof p.h === 'string' && p.h) claimHost(p.h);
      if (ev === 'hello' && p.req) hello(false);
      checkHost(); renderPark();
      return;
    }
    switch (ev) {
      case 'pub': if (p.pub) { P.pub = cleanPub(p.pub); renderPark(); } break;
      case 'ps': if (p.id === ON.host && Array.isArray(p.p)) { const sl = {}; for (const r of p.p) { if (!Array.isArray(r) || typeof r[0] !== 'string') continue; PS.set(r[0], { x: clamp(+r[1] / 1000, 0, 1), y: clamp(+r[2] / 1000, 0, 1), hopN: r[3] | 0 }); if (r[4] != null) sl[r[0]] = clamp(r[4] | 0, 0, MAXP - 1); } ON.slots = sl; } break;
      case 'walk': if (amHost()) { const h = HS.get(p.id); if (h) { h.tx = clamp(+p.x, 0.04, 0.96); h.ty = clamp(+p.y, 0, 1); h.hold = 4; } } break;
      case 'emo': if (EMOS.some(e => e[0] === p.e)) onEmote(p.id, p.e); break;
      case 'treat': if (typeof p.to === 'string') onTreat(p.id, p.to, TREATS.includes(p.f) ? p.f : 'cookie'); break;
      case 'pd': if (p.id === ON.host) onPlaydate(String(p.a), String(p.b)); break;
      case 'bgo': if (p.id === ON.host) onBgo(p); break;
      case 'bsc': onBsc(p); break;
      case 'bend': if (p.id === ON.host || !B || B.host !== ON.host) onBend(p); break;
    }
  }
  function removePeer(id) {
    const P = ON.peers.get(id); if (!P) return;
    ON.peers.delete(id); HS.delete(id); PS.delete(id); PK.delete(id); delete ON.slots[id];
    C.toast('🚪 ' + SR('cp_pk_left', { p: P.n }));
    if (B && B.sc[id] && !B.ended) { B.sc[id].left = true; B.sc[id].d = true; }
    checkHost(true); renderPark(true);
    if (!ON.peers.size) showGone();
  }
  // the host is the first player in join order; it only changes when the host leaves (or two hosts meet and the later one steps down)
  const present = (id) => id === ON.me || ON.peers.has(id);
  const jOf = (id) => (id === ON.me ? ON.j : (ON.peers.get(id) || { j: Infinity }).j);
  function claimHost(h) {   // someone tells us who the host is: adopt it, or settle two hosts (the one who joined first wins)
    if (!present(h) || h === ON.host) return;
    if (!ON.host) { setHost(h, false); return; }
    const a = jOf(h), b = jOf(ON.host); if (a < b - 500 || (Math.abs(a - b) <= 500 && h < ON.host)) setHost(h, false);
  }
  function checkHost(announce) {
    const old = ON.host;
    if (old && present(old)) return;                      // the host is still here
    if (!old && Date.now() < ON.hostWait) return;         // just joined: still listening for the room's host
    setHost(players()[0].id, announce && !!old);
  }
  function setHost(h, announce) {
    if (h === ON.host) return; ON.host = h;
    if (h === ON.me) { ensureSlots(); for (const p of players()) { const D = PK.get(p.id), Q = PS.get(p.id); const x = D ? D.x : Q ? Q.x : rnd(0.2, 0.8), y = D ? D.y : Q ? Q.y : rnd(0.2, 0.8); HS.set(p.id, { x, y, tx: x, ty: y, wT: rnd(0.5, 2), hold: 0, hopN: Q ? Q.hopN : 0 }); } }
    if (announce && Date.now() - ON.jl > 3000) C.toast(h === ON.me ? SR('cp_pk_youhost') : SR('cp_pk_newhost', { p: nameOf(h) }), 'gold');
    renderPark(true);
  }

  // ------------------------------------------------------------------ park simulation (host) and display (everyone)
  const SPD = 0.075;
  function hostSim(dt) {
    ensureSlots(); const list = players();
    for (const p of list) {
      let h = HS.get(p.id); if (!h) { const Q = PS.get(p.id); h = { x: Q ? Q.x : rnd(0.15, 0.85), y: Q ? Q.y : rnd(0.15, 0.85), wT: rnd(0.5, 2), hold: 0, hopN: Q ? Q.hopN : 0 }; h.tx = h.x; h.ty = h.y; HS.set(p.id, h); }
      const pb = p.pub; if (!pb) continue; const egg = pb.st < 1, asleep = !!pb.sl;
      if (h.hold > 0) h.hold -= dt;
      else if (!asleep) { h.wT -= dt; if (h.wT <= 0) {
        h.wT = rnd(2.5, 6.5) * (egg ? 1.6 : 1); const others = list.filter(q => q.id !== p.id && HS.get(q.id));
        if (others.length && Math.random() < 0.38) { const o = HS.get(others[Math.floor(Math.random() * others.length)].id); h.tx = clamp(o.x + rnd(-0.09, 0.09), 0.05, 0.95); h.ty = clamp(o.y + rnd(-0.15, 0.15), 0, 1); }
        else if (Math.random() < 0.75) { h.tx = rnd(0.06, 0.94); h.ty = rnd(0, 1); }
        if (!egg && pb.s[2] > 40 && Math.random() < 0.35) h.hopN++;
      } }
      if (asleep) { h.tx = h.x; h.ty = h.y; }
      const sp = SPD * (egg ? 0.5 : 1) * (0.6 + pb.s[1] / 250), dx = h.tx - h.x, dy = h.ty - h.y, d = Math.hypot(dx, dy * 0.6);
      if (d > 0.004) { const k = Math.min(1, sp * dt / d); h.x += dx * k; h.y += dy * k; }
    }
    // playdates: two pets that hang out together for a few seconds get a small happiness boost (once per pair every 40 s)
    const now = Date.now();
    for (let i = 0; i < list.length; i++) for (let k = i + 1; k < list.length; k++) {
      const a = list[i], b = list[k], ha = HS.get(a.id), hb = HS.get(b.id); if (!ha || !hb || !a.pub || !b.pub) continue;
      const key = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id, near = Math.abs(ha.x - hb.x) < 0.13 && Math.abs(ha.y - hb.y) < 0.3 && !a.pub.sl && !b.pub.sl;
      if (!near) { PD.acc[key] = 0; continue; }
      PD.acc[key] = (PD.acc[key] || 0) + dt;
      if (PD.acc[key] > 2.5 && now - (PD.last[key] || 0) > 40000) { PD.last[key] = now; PD.acc[key] = 0; send('pd', { a: a.id, b: b.id }); onPlaydate(a.id, b.id); }
    }
    psT -= dt; if (psT <= 0) { psT = 0.1; send('ps', { p: list.map(p => { const h = HS.get(p.id); return h ? [p.id, Math.round(h.x * 1000), Math.round(h.y * 1000), h.hopN, ON.slots[p.id]] : null; }).filter(Boolean) }); }
  }
  function disp(id) {
    let D = PK.get(id);
    if (!D) { const Q = (amHost() && HS.get(id)) || PS.get(id); D = { x: Q ? Q.x : rnd(0.2, 0.8), y: Q ? Q.y : rnd(0.2, 0.8), hy: 0, hv: 0, hopN: Q ? Q.hopN : 0, lookX: 0, lookY: 0, blink: 0, blinkT: rnd(1, 4), react: null, reactT: 0, emo: '', emoT: 0, sq: 0, sqv: 0, cmd: null, sx: -1e4, sy: -1e4, sR: 1 }; PK.set(id, D); }
    return D;
  }
  function hop(D, v) { if (D.hy <= 0) { D.hv = v || 330; D.sqv += 4; } }
  function dispUpdate(dt) {
    const list = players(), host = amHost();
    for (const p of list) {
      const D = disp(p.id), Q = host ? HS.get(p.id) : PS.get(p.id);
      if (p.me && D.cmd) {   // my own pet: walks right away where I tapped (the host follows)
        const c = D.cmd, dx = c.x - D.x, dy = c.y - D.y, d = Math.hypot(dx, dy * 0.6), k = d > 0.004 ? Math.min(1, SPD * 1.1 * dt / d) : 1;
        D.x += dx * k; D.y += dy * k; c.t -= dt; if (c.t <= 0 || (d < 0.006 && c.t < 3)) D.cmd = null;
      } else if (Q) {
        if (host) { D.x = Q.x; D.y = Q.y; } else { const k = Math.min(1, dt * 6); D.x = lerp(D.x, Q.x, k); D.y = lerp(D.y, Q.y, k); }
      }
      if (Q && Q.hopN !== D.hopN) { D.hopN = Q.hopN; hop(D); }
      D.sqv += (-90 * D.sq - 9 * D.sqv) * dt; D.sq = clamp(D.sq + D.sqv * dt, -0.3, 0.3);
      if (D.hy > 0 || D.hv > 0) { D.hv -= 1500 * dt; D.hy += D.hv * dt; if (D.hy <= 0) { D.hy = 0; D.hv = 0; D.sqv -= 3; } }
      D.blinkT -= dt; if (D.blinkT <= 0) { D.blink = 0.14; D.blinkT = rnd(2, 5.5); } if (D.blink > 0) D.blink = Math.max(0, D.blink - dt);
      D.reactT -= dt; D.emoT -= dt;
      // look at the nearest friend (or whoever just emoted)
      let tx = D.x + (D.lastX != null ? (D.x - D.lastX) * 40 : 0), ty = D.y; let best = 1e9;
      if (D.lookAt && D.lookAtT > 0) { const O = PK.get(D.lookAt); if (O) { tx = O.x; ty = O.y; best = 0; } D.lookAtT -= dt; }
      if (best) for (const q of list) { if (q.id === p.id) continue; const O = PK.get(q.id); if (!O) continue; const d = Math.hypot(O.x - D.x, O.y - D.y); if (d < best && d < 0.35) { best = d; tx = O.x; ty = O.y; } }
      D.lookX = lerp(D.lookX, clamp((tx - D.x) * 5, -1, 1), Math.min(1, dt * 5)); D.lookY = lerp(D.lookY, clamp((ty - D.y) * 1.5, -0.6, 0.6), Math.min(1, dt * 5));
      D.lastX = D.x;
    }
    for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt / 0.8; if (f.t >= 1) { FX.splice(i, 1); const D = PK.get(f.to); if (D) { D.react = 'love'; D.reactT = 1.6; hop(D, 260); hearts(D, 7); } C.Snd.sfx('chomp'); } }
  }
  function hearts(D, n) { for (let i = 0; i < n; i++) A.part({ type: 'heart', x: D.sx + rnd(-D.sR * 0.6, D.sR * 0.6), y: D.sy - D.sR * 0.4, vx: rnd(-25, 25), vy: rnd(-100, -55), g: -20, life: 1.2, size: rnd(7, 12), color: ['#ff5d9e', '#ff8fc4', '#ffc2dd'][i % 3], top: true }); }

  // ------------------------------------------------------------------ interactions
  function sendEmote(e) {
    const now = Date.now(); if (now - ON.emoT < 600) return; ON.emoT = now;
    send('emo', { e }); onEmote(ON.me, e);
  }
  function onEmote(id, e) {
    const D = PK.get(id); if (!D) return; const ic = (EMOS.find(x => x[0] === e) || EMOS[0])[1];
    D.emo = ic; D.emoT = 2.4; D.react = e === 'love' ? 'love' : e === 'wave' ? 'wave' : 'happy'; D.reactT = 1.4; hop(D, 280);
    if (e === 'love') hearts(D, 6); else if (e === 'party') A.burst(D.sx, D.sy - D.sR, 16, { color: PCOL, max: 220, top: true, s0: 3, s1: 5 });
    for (const [oid, O] of PK) { if (oid === id) continue; O.lookAt = id; O.lookAtT = 2; O.react = e === 'love' ? 'love' : 'happy'; O.reactT = 1.3; if (Math.random() < 0.7) setTimeout(() => hop(O, 240), 150 + Math.random() * 350); }
    C.Snd.sfx('chirp', 700 + slotOf(id) * 140);
  }
  function giveTreat(to) {
    const P = ON.peers.get(to); if (!P || !P.pub) return;
    const now = Date.now(); if (now - (ON.treatCd[to] || 0) < 15000) { C.toast(SR('cp_pk_treat_cd', { n: P.pub.pn })); C.Snd.sfx('error'); return; }
    ON.treatCd[to] = now; const f = TREATS[Math.floor(Math.random() * TREATS.length)];
    send('treat', { to, f }); onTreat(ON.me, to, f); C.toast('🍪 ' + SR('cp_pk_treat_sent', { n: P.pub.pn })); C.closeModal();
  }
  function onTreat(from, to, f) {
    if (PK.get(from) && PK.get(to)) { FX.push({ f, from, to, t: 0 }); C.Snd.sfx('whoosh'); }
    if (to !== ON.me || from === ON.me || !C.S) return;
    const now = Date.now(); if (now - (ON.gotT[from] || 0) < 8000) return; ON.gotT[from] = now;   // a treat only changes MY save, on MY device
    C.addSt(TREAT_FX); C.addXP(1); C.saveNow(); ON.myPub = makePub(); send('pub', { pub: ON.myPub });
    C.toast('🍪 ' + SR('cp_pk_treat_got', { p: nameOf(from), n: C.S.name, v: TREAT_FX.happy }), 'gold'); renderPark();
  }
  function onPlaydate(a, b) {
    for (const id of [a, b]) { const D = PK.get(id); if (D) { D.react = 'love'; D.reactT = 1.8; hearts(D, 5); hop(D, 300); } }
    const other = a === ON.me ? b : b === ON.me ? a : null; if (!other || !C.S) return;
    C.addSt({ happy: PLAYDATE_FX }); C.saveNow(); ON.myPub = makePub();
    const op = petOf(other); C.toast('💞 ' + SR('cp_pk_playdate', { n: op ? op.pn : nameOf(other), v: PLAYDATE_FX })); C.Snd.sfx('purr'); renderPark();
  }

  // ------------------------------------------------------------------ battles
  const battleGames = () => { const list = players(); return GAME_ORDER.filter(id => GAMES[id] && (ALWAYS.includes(id) || list.every(p => p.pub && p.pub.st >= GAMES[id].stage))); };
  function hostStartBattle(g) {
    if (!amHost() || !GAMES[g] || !battleGames().includes(g)) return false;
    const list = players().filter(p => p.pub); if (list.length < 2) { C.toast(SR('cp_pk_need2')); return false; }
    const bid = Math.random().toString(36).slice(2, 8), seed = hashStr('cyber-pet:' + ON.code + ':' + bid);
    const msg = { bid, g, seed, ids: list.map(p => p.id), dur: DUR, nm: list.map(p => [p.id, p.n, p.pub ? p.pub.pn : '']) };
    send('bgo', msg); onBgo(Object.assign({ id: ON.me }, msg));
    return true;
  }
  function onBgo(p) {
    if (!GAMES[p.g] || !Array.isArray(p.ids) || (B && B.bid === p.bid)) return;
    const ids = p.ids.filter(x => typeof x === 'string').slice(0, MAXP);
    B = { bid: String(p.bid), g: p.g, seed: p.seed >>> 0, ids, dur: clamp(+p.dur || DUR, 10, 180), t0: Date.now(), sc: {}, names: {}, pets: {}, me: ids.includes(ON.me), ended: false, sent: 0, sentS: -1, host: p.id };
    for (const id of ids) B.sc[id] = { s: 0, d: false, left: false };
    if (Array.isArray(p.nm)) for (const r of p.nm) if (Array.isArray(r)) { B.names[r[0]] = cleanName(r[1]); B.pets[r[0]] = cleanName(r[2]); }
    ON.bt = null; lastRes = null;
    if (B.me) { C.startBattle(B.g, B.seed); showBoard(); }
    else renderPark(true);
  }
  function onBsc(p) {
    if (!B || p.bid !== B.bid || !B.sc[p.id]) return;
    const r = B.sc[p.id]; r.s = Math.max(0, +p.s || 0) | 0; if (p.d) r.d = true;
  }
  const myScore = () => Math.floor((C.MG.g && C.MG.g.score) || 0);
  function battleTick() {
    if (!B || B.ended) return;
    const now = Date.now(), el = (now - B.t0) / 1000, left = B.dur - Math.max(0, el - 3);
    if (B.me && C.MG.battle && C.MG.g) {
      const MG = C.MG, sc = myScore(), done = MG.state === 'over';
      if (!done && MG.state === 'play' && left <= 0) MG.g.over = true;   // time is up: this run's score is final
      const r = B.sc[ON.me]; r.s = sc; r.d = r.d || done;
      if ((sc !== B.sentS && now - B.sent > 250) || now - B.sent > 1500) { B.sent = now; B.sentS = sc; send('bsc', { bid: B.bid, s: sc, d: r.d }); }
    }
    if (amHost()) {
      const live = B.ids.filter(id => B.sc[id] && !B.sc[id].left && (id === ON.me || ON.peers.has(id)));
      if ((live.length && live.every(id => B.sc[id].d)) || el > 3 + B.dur + 2.5) hostEndBattle();
    } else if (el > 3 + B.dur + 9) endBattle(results(), true);   // the host vanished: settle it locally from the scores we saw
  }
  function results() {
    const res = B.ids.map(id => [id, B.sc[id] ? B.sc[id].s : 0, B.sc[id] && B.sc[id].left ? 1 : 0]).sort((a, b) => (a[2] - b[2]) || (b[1] - a[1]));
    const top = Math.max(0, ...res.filter(r => !r[2]).map(r => r[1]));
    const win = top > 0 ? res.filter(r => !r[2] && r[1] === top).map(r => r[0]) : [];
    return { bid: B.bid, res, win, coins: 10 * B.ids.length };
  }
  function hostEndBattle() { if (!B || B.ended) return; const r = results(); send('bend', r); endBattle(r, false); }
  function onBend(p) { if (!B || p.bid !== B.bid) { if (!B && Array.isArray(p.win) && p.win.length) { const w = p.win[0]; C.toast('🏆 ' + SR('cp_pk_wonby', { p: nameOf(w), g: T('cp_g_' + (ON.bt ? ON.bt.g : 'catch')), s: (p.res.find(r => r[0] === w) || [0, 0])[1] })); } ON.bt = null; renderPark(true); return; } endBattle(p, false); }
  function endBattle(r, local) {
    if (!B || B.ended) return; B.ended = true; ON.bt = null;
    const res = (Array.isArray(r.res) ? r.res : []).filter(x => Array.isArray(x) && typeof x[0] === 'string').slice(0, MAXP).map(x => [x[0], Math.max(0, x[1] | 0), x[2] ? 1 : 0]);
    const win = (Array.isArray(r.win) ? r.win : []).filter(x => typeof x === 'string'), coins = clamp(r.coins | 0, 0, 60);
    lastRes = { g: B.g, res, win, coins, names: B.names, pets: B.pets, gotC: 0, gotH: 0, local: !!local };
    if (!B.me) { renderPark(true); if (win.length) C.toast('🏆 ' + SR('cp_pk_wonby', { p: nameOf(win[0]), g: T('cp_g_' + B.g), s: (res.find(x => x[0] === win[0]) || [0, 0])[1] })); return; }
    const MG = C.MG; if (MG.battle && MG.state !== 'over') MG.state = 'over';
    // rewards: applied by every player to their OWN save, on their own device
    const S = C.S, mine = res.find(x => x[0] === ON.me), sc = mine ? mine[1] : myScore(), won = win.includes(ON.me);
    if (S) {
      if (won && coins) { C.addCoins(coins); lastRes.gotC = coins; }
      C.addSt({ happy: 4 }); lastRes.gotH = 4; C.addXP(5);
      S.games[B.g] = (S.games[B.g] || 0) + 1; S.counts.games++; if (sc > (S.best[B.g] || 0)) S.best[B.g] = sc;
      C.checkAch(); C.saveNow(); ON.myPub = makePub();
    }
    C.Snd.sfx(won ? 'win' : 'lose'); hideBoard(); showResults();
  }
  NET.battleOver = (sc) => {   // my run ended (crash or time up): lock my score and wait for the others
    if (!B || !B.me) return; const r = B.sc[ON.me]; r.s = sc; r.d = true; B.sent = Date.now(); B.sentS = sc; send('bsc', { bid: B.bid, s: sc, d: true }); renderBoard();
  };
  NET.battlePause = () => {
    if (C.modalKind === 'bpause') { C.closeModal(); return; }
    if (C.modalKind === 'bres' || C.modalKind === 'pkgone') return;
    C.openModal('bpause', '⏸ ' + T('cp_pk_battle'), `<div class="stack"><div class="muted center">${esc(SR('cp_pk_bpause_h'))}</div><button class="btn" id="bpR">${T('cp_resume')}</button><button class="btn danger" id="bpQ">${T('cp_pk_quitb')}</button></div>`);
    $('#bpR').onclick = () => C.closeModal();
    $('#bpQ').onclick = () => { C.closeModal(); quitBattle(); };
  };
  function quitBattle() {
    if (B && B.me && !B.ended) { const sc = myScore(); B.sc[ON.me].s = sc; B.sc[ON.me].d = true; send('bsc', { bid: B.bid, s: sc, d: true }); B.me = false; }
    C.exitBattle(); hideBoard(); C.setScene('park');
  }
  function showResults() {
    const r = lastRes; if (!r) return; const medal = ['🥇', '🥈', '🥉', '4️⃣'];
    const rows = r.res.map((x, i) => { const [id, s, left] = x, won = r.win.includes(id), me = id === ON.me;
      return `<div class="li" style="${me ? 'outline:1.5px solid var(--acc);' : ''}${left ? 'opacity:.55;' : ''}"><span class="e">${left ? '🚪' : won ? '🏆' : medal[i] || ''}</span><div><b style="color:${colOf(id)}">${esc(r.names[id] || nameOf(id))}${me ? ` (${T('cp_pk_you')})` : ''}</b><small>${esc(r.pets[id] || '')}${left ? ' · ' + esc(SR('cp_pk_lefttag')) : ''}</small></div><b style="font:900 20px var(--mono)">${s}</b></div>`; }).join('');
    const won = r.win.includes(ON.me), head = r.win.length > 1 ? SR('cp_pk_tie') : '';
    const mine = won ? `<span class="pill gold">${esc(SR('cp_pk_win', { c: r.gotC }))}</span>` : `<span class="pill up">${esc(SR('cp_pk_lose', { v: r.gotH }))}</span>`;
    C.openModal('bres', '🏆 ' + T('cp_pk_res_t'), `<div class="stack center"><div class="big-medal">${won ? '🏆' : '🎮'}</div><div class="muted">${GAMES[r.g].icon} ${esc(T('cp_g_' + r.g))}${head ? ' · ' + esc(head) : ''}</div>
      <div class="list" style="width:100%">${rows}</div><div class="row" style="justify-content:center">${mine}<span class="pill gold">+5 XP</span></div>
      <div class="row" style="justify-content:center"><button class="btn sec" id="brBack">${T('cp_pk_back')}</button>${amHost() && friends().length ? `<button class="btn" id="brAgain">⚔️ ${T('cp_pk_rematch')}</button>` : ''}</div></div>`, '', true);
    $('#brBack').onclick = () => { C.closeModal(); backToPark(); };
    if ($('#brAgain')) $('#brAgain').onclick = () => { const g = r.g; C.closeModal(); backToPark(); hostStartBattle(g); };
  }
  function backToPark() { if (C.MG.battle) C.exitBattle(); hideBoard(); if (ON.code) C.setScene('park'); else C.setScene('hub'); }
  function openPick() {
    if (!amHost()) { C.toast(SR('cp_pk_hostpicks')); return; }
    if (B && !B.ended) return;
    const n = Math.max(2, players().filter(p => p.pub).length), avail = battleGames();
    const cards = GAME_ORDER.filter(id => GAMES[id]).map(id => { const G = GAMES[id], ok = avail.includes(id);
      return `<div class="gcard ${ok ? '' : 'lock'}"><div class="gi">${G.icon}</div><div class="gn">${esc(T('cp_g_' + id))}</div><div class="gb">${ok ? `<button class="btn small" data-bg="${id}">▶ ${T('cp_pk_battle')}</button>` : '<span class="pill">🔒</span>'}</div>
        <div class="gd">${esc(SR('cp_gh_' + id))}${ok ? '' : `<br><span class="gs">${esc(T('cp_unlock_at', { s: T('cp_st' + G.stage) }))}</span>`}</div></div>`; }).join('');
    const need = friends().length ? '' : `<div class="pill down" style="align-self:center">${esc(SR('cp_pk_need2'))}</div>`;
    C.openModal('bpick', '⚔️ ' + T('cp_pk_pick_t'), `<div class="stack"><div class="muted">${esc(SR('cp_pk_pick_h', { s: DUR, c: 10 * n }))}</div>${need}${cards}</div>`);
    C.mbox.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => { if (hostStartBattle(b.dataset.bg)) C.closeModal(); });
  }
  function showBoard() { const bb = $('#bboard'); if (bb) { bb.hidden = false; renderBoard(); } }
  function hideBoard() { const bb = $('#bboard'); if (bb) { bb.hidden = true; bb.classList.remove('wait'); } }
  function renderBoard() {
    const bb = $('#bboard'); if (!bb || !B || bb.hidden) return;
    const left = Math.max(0, Math.ceil(B.dur - Math.max(0, (Date.now() - B.t0) / 1000 - 3))), myDone = B.sc[ON.me] && B.sc[ON.me].d;
    bb.classList.toggle('wait', !!myDone);
    const rows = B.ids.map(id => [id, B.sc[id]]).sort((a, b) => b[1].s - a[1].s).map(([id, r]) => `<div class="bbr${id === ON.me ? ' me' : ''}" style="--pc:${colOf(id)}"><i></i><span>${esc(B.names[id] || nameOf(id))}</span>${r.left ? '🚪' : r.d ? '✔' : ''}<b>${r.s}</b></div>`).join('');
    bb.innerHTML = `<div class="bbh"><span>${myDone ? esc(SR('cp_pk_wait')) : GAMES[B.g].icon + ' ' + esc(T('cp_pk_battle'))}</span><b>⏱ ${left}</b></div>${rows}`;
  }

  // ------------------------------------------------------------------ popups
  function openOnline() {
    const nm = $('#onName') ? $('#onName').value : myName(), cd = $('#onCode') ? $('#onCode').value : '';
    C.openModal('online', '🌐 ' + T('cp_pk_title'), `<div class="stack"><div class="muted" style="font-size:14px">${esc(SR('cp_pk_intro'))}</div>
      <div class="sec-h">${T('cp_pk_name')}</div><input class="inp" id="onName" maxlength="14" autocomplete="off">
      <button class="btn" id="onCreate">✨ ${T('cp_pk_create')}</button>
      <div class="sec-h">${T('cp_pk_joincode')}</div>
      <div class="row" style="flex-wrap:nowrap"><input class="inp" id="onCode" maxlength="5" placeholder="ABCD" autocomplete="off" autocapitalize="characters" spellcheck="false" style="flex:1;min-width:0;text-transform:uppercase;letter-spacing:5px;font-family:var(--mono)"><button class="btn sec" id="onJoin">${T('cp_pk_join')}</button></div>
      <div class="muted" id="onMsg"></div></div>`);
    const ni = $('#onName'), ci = $('#onCode'); ni.value = nm; ci.value = cd;
    const saveName = () => { const v = cleanName(ni.value); C.settings.oname = v; C.saveSettings(); };
    ni.onchange = saveName; ni.onkeydown = (e) => e.stopPropagation();
    ci.oninput = () => { ci.value = cleanCode(ci.value); }; ci.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') $('#onJoin').click(); };
    $('#onCreate').onclick = async () => { saveName(); if (!(await canGo())) return; joinRoom(newCode(), true); };
    $('#onJoin').onclick = async () => { saveName(); const c = cleanCode(ci.value); if (c.length < 4) { $('#onMsg').textContent = SR('cp_pk_code_hint'); C.Snd.sfx('error'); return; } if (!(await canGo())) return; joinRoom(c); };
  }
  function openTreat() {
    const fr = friends(); if (!fr.length) { C.toast(SR('cp_pk_nofriends')); return; }
    if (fr.length === 1) { giveTreat(fr[0].id); return; }
    C.openModal('treat', '🍪 ' + T('cp_pk_treat_t'), `<div class="stack"><div class="muted">${esc(SR('cp_pk_treat_h'))}</div><div class="list">${fr.map(p => `<div class="li"><span class="e" style="color:${colOf(p.id)}">●</span><div><b>${esc(p.pub.pn)}</b><small>${esc(p.n)} · ${C.MOOD_EMO[p.pub.m]} ${esc(T('cp_m_' + p.pub.m))}</small></div><button class="btn small" data-tr="${esc(p.id)}">🍪 ${T('cp_pk_treat')}</button></div>`).join('')}</div></div>`);
    C.mbox.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => giveTreat(b.dataset.tr));
  }
  function openPetCard(id) {
    const P = ON.peers.get(id); if (!P || !P.pub) return; const pb = P.pub;
    C.openModal('pcard', esc(pb.pn), `<div class="stack center"><canvas id="pcCv" width="200" height="170" style="width:150px;height:128px"></canvas>
      <div><b style="color:${colOf(id)}">${esc(P.n)}</b>${id === ON.host ? ' 👑' : ''}</div><div class="muted">${esc(T('cp_st' + pb.st))} · ${esc(T('cp_f_' + pb.f))} · ${C.MOOD_EMO[pb.m]} ${esc(T('cp_m_' + pb.m))}</div>
      <div class="row" style="justify-content:center"><button class="btn" id="pcT">🍪 ${T('cp_pk_treat_t')}</button><button class="btn sec" id="pcW">👋 ${T('cp_pk_e_wave')}</button><button class="btn sec" id="pcC">📊 ${T('cp_pk_compare')}</button></div></div>`);
    C.drawPetTo($('#pcCv'), pb.f, false, 46);
    $('#pcT').onclick = () => giveTreat(id); $('#pcW').onclick = () => { C.closeModal(); sendEmote('wave'); }; $('#pcC').onclick = () => openCompare();
  }
  function openCompare() {
    const list = players().filter(p => p.pub); if (!list.length) return;
    const SI = C.ST, best = SI.map(([k], i) => (k === 'glitch' ? Math.min : Math.max)(...list.map(p => p.pub.s[i])));
    const cards = list.map(p => { const pb = p.pub;
      const bars = SI.map(([k, ic, col], i) => `<div class="sb" style="grid-template-columns:18px 1fr 30px"><span>${ic}</span><div class="bar"><div style="--c:${col};width:${pb.s[i]}%"></div></div><span class="muted">${pb.s[i]}${list.length > 1 && pb.s[i] === best[i] ? '★' : ''}</span></div>`).join('');
      return `<div class="card" style="border-color:${colOf(p.id)}"><canvas width="120" height="104" data-cf="${pb.f}" style="width:100%;max-width:120px;height:auto;align-self:center"></canvas>
        <div class="nm" style="color:${colOf(p.id)}">${esc(pb.pn)}</div><div class="ds">${esc(p.n)}${p.me ? ` (${T('cp_pk_you')})` : ''}${p.id === ON.host ? ' 👑' : ''}<br>${esc(T('cp_st' + pb.st))} · ${esc(T('cp_f_' + pb.f))}<br>${C.MOOD_EMO[pb.m]} ${esc(T('cp_m_' + pb.m))}</div>
        <div class="style-bars">${bars}</div><div class="ds">${T('cp_xp')} ${pb.xp} · ${T('cp_pk_age')} ${pb.age}${esc(SR('cp_pk_h'))} · 🏅 ${pb.md}${pb.cs ? '<br>' + esc(T('cp_c_' + pb.cs)) : ''}</div></div>`; }).join('');
    C.openModal('cmp', '📊 ' + T('cp_pk_cmp_t'), `<div class="grid">${cards}</div>`);
    C.mbox.querySelectorAll('canvas[data-cf]').forEach(cv => C.drawPetTo(cv, cv.dataset.cf, false, 27));
  }
  function showGone() {
    ON.alone = true; const MG = C.MG, inB = MG.battle && B && B.me && !B.ended;
    if (inB) MG.paused = true;
    C.openModal('pkgone', '🚪 ' + T('cp_pk_gone_t'), `<div class="stack center"><div class="muted" style="font-size:15px">${esc(inB ? SR('cp_pk_gone_hb') : SR('cp_pk_gone_h', { c: ON.code }))}</div>
      <div class="row" style="justify-content:center">${inB ? `<button class="btn" id="pgS">▶ ${T('cp_pk_solo')}</button>` : `<button class="btn" id="pgW">🌳 ${T('cp_pk_stay')}</button>`}<button class="btn sec" id="pgR">🏠 ${T('cp_pk_toroom')}</button></div></div>`, '', true);
    if ($('#pgW')) $('#pgW').onclick = () => { C.closeModal(); if (C.scene !== 'park') backToPark(); };
    if ($('#pgS')) $('#pgS').onclick = () => { C.closeModal(); leaveRoom(); MG.battle = false; MG.paused = false; hideBoard(); };   // the run carries on as a normal solo game
    $('#pgR').onclick = () => leavePark();
  }
  NET.rerender = (k) => {
    if (k === 'online') openOnline(); else if (k === 'cmp') openCompare(); else if (k === 'bpick') openPick(); else if (k === 'bres') showResults(); else if (k === 'treat') openTreat();
    else if (k === 'pkgone') { const p = C.MG.paused; showGone(); C.MG.paused = p; } else if (k === 'bpause') { C.closeModal(); NET.battlePause(); } else if (k === 'pcard') C.closeModal();
  };

  // ------------------------------------------------------------------ park UI (DOM)
  function renderPark(force) {
    if (!ON.code || C.scene !== 'park') return;
    const list = players(), key = list.map(p => [p.id, p.n, p.pub && [p.pub.pn, p.pub.st, p.pub.m, p.pub.sl].join(',')].join(':')).join('|') + '|' + ON.host + '|' + C.lang() + '|' + (B && !B.ended ? B.bid : ON.bt ? ON.bt.g : '') + '|' + ON.ready;
    if (force || key !== rosterKey) {
      rosterKey = key;
      $('#pkTitle').textContent = T('cp_pk_title'); $('#pkCode').textContent = ON.code; $('#pkLang').textContent = C.lang() === 'ar' ? 'English' : 'العربية';
      $('#pkLeave').title = T('cp_pk_leave'); $('#pkCopy').title = T('cp_pk_copy');
      let h = list.map(p => { const pb = p.pub; return `<div class="pkp${p.me ? ' me' : ''}" style="--pc:${colOf(p.id)}"><i></i><div><b>${p.id === ON.host ? '👑 ' : ''}${esc(p.n)}${p.me ? ` (${esc(T('cp_pk_you'))})` : ''}</b><small>${pb ? `${esc(pb.pn)} · ${esc(T('cp_st' + pb.st))} ${C.MOOD_EMO[pb.m] || ''}` : '…'}${p.me ? ' · <span class="pkme"></span>' : ''}</small></div></div>`; }).join('');
      let banner = '';
      if (B && !B.ended && !B.me) banner = `⚔️ ${esc(SR('cp_pk_inprog', { g: T('cp_g_' + B.g) }))} — ${esc(SR('cp_pk_nextround'))}`;
      else if (ON.bt && !amHost() && Date.now() - ON.bt.t < 5000 && GAMES[ON.bt.g]) banner = `⚔️ ${esc(SR('cp_pk_inprog', { g: T('cp_g_' + ON.bt.g) }))} — ${esc(SR('cp_pk_nextround'))}`;
      else if (list.length < 2) banner = '⏳ ' + esc(SR('cp_pk_waiting', { c: ON.code }));
      else banner = '💡 ' + esc(SR('cp_pk_tap'));
      h += `<div class="pkban">${banner}</div>`;
      $('#pkList').innerHTML = h;
      $('#pkDock').innerHTML = `<div class="pkg">${EMOS.map(([e, ic]) => `<button class="dk em" data-emo="${e}" title="${T('cp_pk_e_' + e)}"><b>${ic}</b><span>${T('cp_pk_e_' + e)}</span></button>`).join('')}</div>
        <div class="pkg"><button class="dk" id="pkTreat"><b>🍪</b><span>${T('cp_pk_treat')}</span></button><button class="dk" id="pkCmp"><b>📊</b><span>${T('cp_pk_compare')}</span></button><button class="dk${amHost() ? '' : ' cd'}" id="pkBattle" title="${amHost() ? '' : esc(SR('cp_pk_hostpicks'))}"><b>⚔️</b><span>${T('cp_pk_battle')}</span></button></div>`;
      $('#pkDock').querySelectorAll('[data-emo]').forEach(b => b.onclick = () => sendEmote(b.dataset.emo));
      $('#pkTreat').onclick = () => { C.Snd.sfx('open'); openTreat(); }; $('#pkCmp').onclick = () => { C.Snd.sfx('open'); openCompare(); }; $('#pkBattle').onclick = () => { C.Snd.sfx('open'); openPick(); };
    }
    const me = $('.pkme'), S = C.S; if (me && S) me.textContent = `💗${Math.round(S.st.happy)} · ${Math.floor(S.coins)}¢`;
  }
  $('#pkLeave').onclick = () => { C.Snd.sfx('close'); leavePark(); };
  $('#pkLang').onclick = () => setLang(getLang() === 'ar' ? 'en' : 'ar');
  $('#pkCopy').onclick = () => { const b = $('#pkCopy'), done = () => { C.toast('🔗 ' + T('cp_pk_copied')); b.textContent = '✓'; setTimeout(() => { b.textContent = '🔗'; }, 1300); }; const text = inviteLink(ON.code);
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); } };

  // ------------------------------------------------------------------ park drawing (canvas)
  let GEO = null;
  function geo() {
    const W = C.W, H = C.H, lr = $('#pkList').getBoundingClientRect(), dr = $('#pkDock').getBoundingClientRect();
    const top = (lr.bottom || 100) + 6, bot = (dr.top || H - 90) - 6, hz = Math.max(top + 24, top + (bot - top) * 0.3);
    const R0 = clamp(Math.min(W * 0.086, (bot - hz) * 0.17, 60), 20, 60), gB = hz + R0 * 2.3, gF = Math.max(gB + 20, bot - 4);
    return { W, H, top, bot, hz, R0, gB, gF, x0: 8 + R0 * 1.1, x1: W - 8 - R0 * 1.1 };
  }
  function drawBg(g, G) {
    const th = A.theme(), W = G.W, H = G.H, t = C.clock, hz = G.hz;
    const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, th.bg1); sky.addColorStop(1, th.bg2); g.fillStyle = sky; g.fillRect(0, 0, W, hz + 1);
    for (let i = 0; i < 60; i++) { const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + hr(i + 7)) + i * 2); g.fillStyle = `rgba(255,255,255,${(0.12 + 0.45 * hr(i + 3)) * tw})`; g.fillRect(hr(i) * W, hr(i + 50) * hz * 0.92, 2, 2); }
    g.fillStyle = '#e8ecff'; glowFill(g, '#a8c4ff', 24); g.beginPath(); g.arc(W * 0.82, Math.max(26, hz * 0.3), 16, 0, TAU); g.fill(); noGlow(g);
    // skyline
    for (let i = 0; i < 24; i++) { const bw = W / 15 * (0.6 + hr(i * 3) * 0.9), bh = hz * (0.1 + hr(i * 5) * 0.26), bx = (i / 24) * W * 1.1 - 24; g.fillStyle = '#0a0c24'; g.fillRect(bx, hz - bh, bw, bh);
      g.fillStyle = th.a; g.globalAlpha = 0.28; for (let k = 0; k < 5; k++) if (hr(i * 11 + k) > 0.55) g.fillRect(bx + 5 + (k % 3) * 9, hz - bh + 7 + Math.floor(k / 3) * 11, 3, 4); g.globalAlpha = 1; }
    // grass
    const fg = g.createLinearGradient(0, hz, 0, H); fg.addColorStop(0, '#0d2a2a'); fg.addColorStop(0.5, th.floor); fg.addColorStop(1, '#05060f'); g.fillStyle = fg; g.fillRect(0, hz, W, H - hz);
    g.strokeStyle = '#3dffa8'; g.globalAlpha = 0.14; g.lineWidth = 1; const off = (t * 0.15) % 1;
    for (let k = 0; k < 12; k++) { const f = (k + off) / 12, y = hz + (H - hz) * f * f; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let k = -10; k <= 10; k++) { g.beginPath(); g.moveTo(W / 2 + k * 34, hz); g.lineTo(W / 2 + k * (W / 4.5), H); g.stroke(); }
    g.globalAlpha = 1; g.strokeStyle = '#3dffa8'; g.lineWidth = 2; glowFill(g, '#3dffa8', 14); g.beginPath(); g.moveTo(0, hz); g.lineTo(W, hz); g.stroke(); noGlow(g);
    // neon trees + lamps behind the pets
    const TREES = [[0.06, 1.1], [0.24, 0.8], [0.62, 0.95], [0.9, 1.2]];
    for (const [fx, s] of TREES) { const x = fx * W, b = hz + 4, sz = Math.min(46, hz * 0.32) * s; g.fillStyle = '#1b1f3a'; g.fillRect(x - sz * 0.07, b - sz * 1.1, sz * 0.14, sz * 1.1);
      g.fillStyle = 'rgba(61,255,168,.18)'; g.strokeStyle = '#3dffa8'; g.lineWidth = 2; glowFill(g, '#3dffa8', 12);
      g.beginPath(); g.moveTo(x, b - sz * 2.2); g.lineTo(x + sz * 0.6, b - sz * 0.9); g.lineTo(x - sz * 0.6, b - sz * 0.9); g.closePath(); g.fill(); g.stroke(); noGlow(g); }
    for (const fx of [0.42, 0.78]) { const x = fx * W, b = hz + 3, hgt = Math.min(70, hz * 0.45); g.strokeStyle = '#2a3158'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, b); g.lineTo(x, b - hgt); g.stroke();
      g.fillStyle = '#ffe9a8'; glowFill(g, '#ffd23e', 22); g.beginPath(); g.arc(x, b - hgt, 5, 0, TAU); g.fill(); noGlow(g); }
    // sign
    const sy = Math.max(G.top + 14, hz - Math.min(64, hz * 0.4)); g.font = `900 ${clamp(W * 0.035, 14, 24)}px ${C.lang() === 'ar' ? 'Segoe UI, system-ui, Tahoma, sans-serif' : 'ui-monospace, Consolas, monospace'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = th.b; glowFill(g, th.b, 18); g.globalAlpha = Math.sin(t * 7) > -0.9 ? 1 : 0.5; g.fillText(T('cp_pk_sign'), W * 0.5, sy); g.globalAlpha = 1; noGlow(g);
  }
  const MOOD_FACE = { ecstatic: { eye: 'happy', mouth: 'grin', blush: 1 }, happy: { mouth: 'smile' }, content: { mouth: 'smile' }, meh: { mouth: 'flat' }, bored: { open: 0.6, mouth: 'flat' },
    hungry: { eye: 'sad', mouth: 'o', earDrop: 0.5 }, sleepy: { open: 0.45, mouth: 'smallo', earDrop: 0.7 }, sad: { eye: 'sad', mouth: 'frown', earDrop: 1 }, glitchy: { mouth: 'wavy' },
    annoyed: { eye: 'angry', mouth: 'flat', open: 0.75 }, loved: { eye: 'heart', mouth: 'grin', blush: 1 }, sleeping: { eye: 'closed', mouth: 'smallo', open: 0, earDrop: 0.6 } };
  const REACT = { love: { eye: 'heart', mouth: 'grin', blush: 1 }, happy: { eye: 'happy', mouth: 'grin', blush: 1 }, wave: { eye: 'happy', mouth: 'open' } };
  function measureTag(g, x, y, col, l1, l2) {
    g.font = '800 13px Segoe UI, system-ui, sans-serif'; const w1 = g.measureText(l1).width; g.font = '600 11px Segoe UI, system-ui, sans-serif'; const w2 = g.measureText(l2).width;
    const w = Math.max(w1, w2) + 16; return { x: clamp(x, w / 2 + 3, C.W - w / 2 - 3), y, w, h: 34, col, l1, l2 };
  }
  function tag(g, t) {
    const { x, y, w, h, col, l1, l2 } = t;
    g.fillStyle = 'rgba(10,14,32,.84)'; rr(g, x - w / 2, y - h, w, h, 10); g.fill(); g.strokeStyle = col; g.lineWidth = 1.5; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.font = '800 13px Segoe UI, system-ui, sans-serif'; g.fillText(l1, x, y - h + 11);
    g.fillStyle = '#c8cde8'; g.font = '600 11px Segoe UI, system-ui, sans-serif'; g.fillText(l2, x, y - 10);
  }
  NET.draw = (g) => {
    if (!ON.code) { g.fillStyle = '#0b0e1d'; g.fillRect(0, 0, C.W, C.H); return; }
    const G = GEO = geo(); drawBg(g, G);
    const list = players().filter(p => p.pub).map(p => ({ p, D: disp(p.id) })).sort((a, b) => a.D.y - b.D.y);
    for (const { p, D } of list) {
      const pb = p.pub, k = 0.8 + 0.32 * D.y, R = G.R0 * C.STAGE_SCALE[pb.st] * k, fx = lerp(G.x0, G.x1, D.x), fy = lerp(G.gB, G.gF, D.y), col = colOf(p.id);
      const sh = 1 - Math.min(0.5, D.hy / (R * 2));
      g.fillStyle = 'rgba(0,0,0,.4)'; ell(g, fx, fy + 2, R * 0.95 * sh, R * 0.18 * sh); g.fill();
      g.strokeStyle = col; g.globalAlpha = 0.55; g.lineWidth = 2; ell(g, fx, fy + 2, R * 1.12 * sh, R * 0.24 * sh); g.stroke(); g.globalAlpha = 1;
      const F = C.FORMS[pb.f] || C.FORMS.bitling, face = Object.assign({ eye: 'normal', mouth: 'smile', open: 1, blush: 0, earDrop: 0 }, pb.sl ? MOOD_FACE.sleeping : D.reactT > 0 ? REACT[D.react] : MOOD_FACE[pb.m]);
      const gl = clamp((pb.s[4] - 35) / 65, 0, 1) * 0.85 + (F.gl || 0), sq = D.sq, cy = fy - R * 0.84 * (1 - sq) - D.hy;
      C.compositePet(g, fx, cy, R, { form: pb.f, t: C.clock + slotOf(p.id) * 3.1, lookX: D.lookX, lookY: D.lookY, blink: D.blink > 0 ? 1 - Math.abs(D.blink - 0.07) / 0.07 : 0,
        eye: face.eye, mouth: face.mouth, open: face.open, blush: face.blush, earDrop: face.earDrop, sx: 1 + sq, sy: 1 - sq, glitch: gl, pixel: false, sleeping: !!pb.sl, hatch: pb.ht / 10,
        acc: pb.st >= 1 ? { head: pb.h, face: pb.fa } : null });
      D.sx = fx; D.sy = fy - R * 0.84 - D.hy; D.sR = R; D.top = cy - R * (pb.h ? 1.55 : 1.2);
      if (pb.sl && Math.random() < 0.012) A.part({ type: 'z', text: 'Z', x: fx + R * 0.5, y: cy - R * 0.8, vx: 14, vy: -28, g: 0, life: 2.2, size: 12 + Math.random() * 8, color: A.theme().a, top: true });
    }
    for (const f of FX) { const a = PK.get(f.from), b = PK.get(f.to); if (!a || !b) continue; const k = Math.min(1, f.t), x = lerp(a.sx, b.sx, k), y = lerp(a.sy, b.sy, k) - Math.sin(k * Math.PI) * 90; A.food(g, f.f, x, y, 16, C.clock); }
    C.drawParts(g, false);
    const tags = list.map(({ p, D }) => { const pb = p.pub; return Object.assign(measureTag(g, D.sx, D.top - 4, colOf(p.id), (p.id === ON.host ? '👑 ' : '') + p.n + (p.me ? ` (${T('cp_pk_you')})` : ''), `${pb.pn} · ${T('cp_st' + pb.st)} ${C.MOOD_EMO[pb.m] || ''}`), { D }); }).reverse();
    for (let i = 1; i < tags.length; i++) for (let k = 0; k < i; k++) { const a = tags[i], b = tags[k]; if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < a.h + 2) a.y = b.y - a.h - 3; }   // front tags stay, the ones behind move up
    for (const t of tags) {   // name tags + emotes on top of everything
      const D = t.D, col = t.col; tag(g, t);
      if (D.emoT > 0) { const k = clamp(D.emoT, 0, 1), pop = 1 + Math.max(0, D.emoT - 2.1) * 2, y = t.y - 48 - (2.4 - D.emoT) * 8; g.globalAlpha = k;
        g.fillStyle = 'rgba(10,14,32,.9)'; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(D.sx, y, 19 * pop, 0, TAU); g.fill(); g.stroke();
        g.font = `${Math.round(22 * pop)}px Segoe UI Emoji, Apple Color Emoji, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(D.emo, D.sx, y + 1); g.globalAlpha = 1; }
    }
    C.drawParts(g, true);
  };
  NET.down = (x, y) => {
    if (!ON.code) return; C.Snd.resume();
    const list = players().filter(p => p.pub && PK.get(p.id)).sort((a, b) => PK.get(b.id).y - PK.get(a.id).y);
    for (const p of list) { const D = PK.get(p.id), dx = (x - D.sx) / (D.sR * 1.2), dy = (y - D.sy) / (D.sR * 1.25); if (dx * dx + dy * dy < 1) {
      if (p.me) { hearts(D, 4); sendEmote('love'); C.Snd.sfx('purr'); } else { C.Snd.sfx('open'); openPetCard(p.id); } return; } }
    const G = GEO; if (!G || y < G.hz + 4 || y > G.gF + 30) return;
    const nx = clamp((x - G.x0) / (G.x1 - G.x0), 0.04, 0.96), ny = clamp((y - G.gB) / (G.gF - G.gB), 0, 1), me = disp(ON.me);
    if (ON.myPub && ON.myPub.sl) return;
    me.cmd = { x: nx, y: ny, t: 4 }; send('walk', { x: Math.round(nx * 1000) / 1000, y: Math.round(ny * 1000) / 1000 });
    if (amHost()) { const h = HS.get(ON.me); if (h) { h.tx = nx; h.ty = ny; h.hold = 4; } }
    A.part({ type: 'ring', x, y, size: 4, grow: 26, color: colOf(ON.me), life: 0.45, top: false });
  };

  // ------------------------------------------------------------------ frame hook
  NET.update = (dt) => {
    if (!ON.code) return;
    if (C.S) {   // my public summary: re-sent right away when the look or the mood changes
      const p = makePub(), k = [p.pn, p.st, p.f, p.m, p.h, p.fa, p.sl].join('|'); ON.myPub = p;
      if (k !== ON.pubKey && Date.now() - ON.pubSent > 1000) { ON.pubKey = k; ON.pubSent = Date.now(); send('pub', { pub: p }); }
    }
    checkHost(true);
    if (amHost()) hostSim(dt);
    dispUpdate(dt);
    battleTick();
    uiT -= dt; if (uiT <= 0) { uiT = 0.25; renderPark(); renderBoard(); }
  };
  NET.scene = (sc) => {
    if (ON.code && (sc === 'hub' || sc === 'title')) leaveRoom();
    if (!(sc === 'game' && B && B.me && C.MG.battle)) hideBoard();
    if (sc === 'park') renderPark(true);
  };
  NET.relang = () => { rosterKey = ''; renderPark(true); renderBoard(); };
  NET.open = () => { if (ON.code) { C.closeModal(); C.setScene('park'); return; } openOnline(); };
  NET.afterPet = () => { if (ON.pending && !ON.code && Date.now() - ON.pendingT < 5 * 60e3) { const c = ON.pending, cr = ON.pendingCreate; ON.pending = ''; setTimeout(() => joinRoom(c, cr), 50); } };
  document.addEventListener('keydown', (e) => {
    if (C.scene !== 'park' || C.modalKind || (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'))) return;
    const n = '1234'.indexOf(e.key); if (n >= 0) { sendEmote(EMOS[n][0]); return; }
    const k = e.key.toLowerCase(); if (k === 't') openTreat(); else if (k === 'c') openCompare(); else if (k === 'b') openPick();
  });

  // ------------------------------------------------------------------ site hooks: invites, live rooms, auto-join
  addEventListener('pagehide', () => { if (ON.ch) send('bye', {}); });
  window.Mal3abShareLink = () => (ON.code ? inviteLink(ON.code) : pageLink());
  window.Mal3abPrepareInvite = async () => {
    if (!ON.code) { if (!(await canGo())) return pageLink(); if (!joinRoom(newCode(), true)) return ON.pending ? inviteLink(ON.pending) : pageLink(); }
    return inviteLink(ON.code);
  };
  window.Mal3abLiveInfo = () => (ON.code ? { players: players().length, max: MAXP } : {});
  const roomParam = cleanCode(new URLSearchParams(location.search).get('room'));
  if (roomParam.length >= 4) {
    let tried = false;
    const go = async () => { if (tried || ON.code) return; tried = true; if (!(await canGo())) return; joinRoom(roomParam); };
    const start = () => { if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 4000); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0)); else setTimeout(start, 0);
  }

  // test hooks
  window.CyberPetOnline = { ON, HS, PS, PK, slotOf, get B() { return B; }, get lastRes() { return lastRes; }, players, hostId: () => ON.host, joinRoom, leaveRoom, leavePark, newCode, sendEmote, giveTreat, openTreat, openCompare, openPick, hostStartBattle, quitBattle, battleGames, makePub, renderPark };
})();
