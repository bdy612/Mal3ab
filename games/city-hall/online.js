// City Hall — online co-op city for up to 4 mayors (Supabase Realtime broadcast, channel "cityhall-CODE").
// Everyone builds the same city: one treasury, one approval rating.
// The host (who made the room; if they leave, the next mayor in join order) runs the simulation: monthly tick,
// growth, money and events. It sends the tiles that changed (up to 4 times a second), the city stats every second
// (plus the whole map every 5 s, to heal anything lost) and a full snapshot to anyone who joins.
// Other mayors send actions (build / bulldoze / tax / budget / policy / loan); the host checks them against the
// treasury, unlocks and state control, then applies them. Guests show their own builds straight away and the host's
// answer corrects them if it disagrees. Speed and pause: host only.
// Online play never writes the single-player save: the shared city saves to its own slot ("cityhall-online"),
// and leaving the room brings back your own city exactly as you left it.
(function () {
  'use strict';
  const MAXP = 4;
  const PAL = ['#ff4fa0', '#ff8c2e', '#38e1ff', '#c38bff'];          // mayor colours (apart from the R / C / I zone colours)
  const EVENTS = ['hello', 'hb', 'bye', 'full', 'welcome', 'snap', 'diff', 'st', 'act', 'nack', 'cur', 'feed', 'ev', 'need'];
  const SMALL = { road: 1, R: 1, C: 1, I: 1 };                      // painted tile by tile: summed up in the activity feed
  const T2K = {}; for (const k in BUILD) if (BUILD[k].t >= 0) T2K[BUILD[k].t] = k;
  const $id = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------- words (Egyptian Arabic / English)
  const AR = {
    ch_online: '🌐 أونلاين', ch_onlineSub: 'مدينة مع أصحابك', ch_roomSub: 'غرفة {c} · {n}/4',
    ch_title: 'مدينة أونلاين مع أصحابك', ch_desc: 'ابنوا مدينة واحدة مع بعض لحد ٤ عُمَد: خزنة واحدة وشعبية واحدة، والمضيف هو اللي بيمشّي الشهور.',
    ch_name: 'اسمك', ch_create: '➕ اعمل غرفة', ch_or: 'أو ادخل غرفة صاحبك بالكود', ch_codePh: 'الكود', ch_join: 'ادخل',
    ch_codeHint: 'اكتب كود الغرفة (٤ حروف)', ch_noNet: 'اللعب أونلاين مش متاح دلوقتي، جرّب تاني كمان شوية',
    ch_room: 'الغرفة', ch_copyLink: '🔗 انسخ لينك الدعوة', ch_copied: 'اتنسخ!', ch_mayors: 'العُمَد ({n}/4)', ch_you: 'إنت', ch_hostTag: 'المضيف 👑',
    ch_freeSpot: 'مكان فاضي — ابعت الكود لصاحبك', ch_which: 'هتبنوا في أنهي مدينة؟', ch_fresh: 'مدينة جديدة', ch_mine: 'مدينتي الحالية', ch_last: 'آخر مدينة أونلاين محفوظة',
    ch_start: '▶ ابدأ', ch_waitHost: 'مستنيين المضيف يبدأ…', ch_connecting: 'بيوصل…', ch_noHost: 'لسه مفيش حد في الغرفة دي. مستنيين المضيف…',
    ch_takeOver: 'افتح الغرفة بنفسك', ch_leave: 'اخرج من الغرفة', ch_back: 'رجوع', ch_resume: 'ارجع للمدينة',
    ch_full: 'الغرفة مليانة (٤ عُمَد)', ch_joined: '{p} دخل المدينة', ch_left: '{p} خرج', ch_newHost: '{p} بقى المضيف دلوقتي',
    ch_youHost: 'إنت بقيت المضيف — الشهور ماشية عندك دلوقتي', ch_hostOnly: 'المضيف بس اللي يغيّر السرعة أو يوقّف الوقت',
    ch_hostOnlyNew: 'المضيف بس اللي يبدأ مدينة جديدة', ch_saved: 'اتحفظت نسخة من المدينة المشتركة (مدينتك الخاصة زي ما هي)',
    ch_saveFail: 'مقدرتش أحفظ (التخزين مقفول)', ch_mayor: 'عمدة', ch_backSolo: 'رجعت لمدينتك الخاصة',
    ch_note: 'المدينة مشتركة: الحفظ بيروح لخانة الأونلاين، ومدينتك الخاصة عمرها ما بتتغير.', ch_speedNote: 'السرعة والإيقاف في إيد المضيف.',
    ch_fBuilt: '{p} بنى {b}', ch_fRemoved: '{p} شال {b}', ch_fRoads: '{p} رصف {n} حتة طريق', ch_fZone: '{p} خطّط {n} أرض {b}', ch_fBull: '{p} هدّ {n} حتة',
    ch_fTax: '{p} خلّى ضريبة {b} {n}%', ch_fBud: '{p} خلّى ميزانية {b} {n}%', ch_fPolOn: '{p} شغّل {b}', ch_fPolOff: '{p} وقّف {b}',
    ch_fFest: '{p} عمل أسبوع المهرجان 🎉', ch_fLoan: '{p} استلف $10,000', ch_fPause: '{p} وقّف الوقت', ch_fSpeed: '{p} خلّى السرعة {n}', ch_fNew: '{p} بدأ مدينة جديدة',
    ch_b_road: 'طريق', ch_b_R: 'سكني', ch_b_C: 'تجاري', ch_b_I: 'صناعي', ch_b_power: 'محطة كهربا', ch_b_water: 'برج مية', ch_b_fire: 'مطافي',
    ch_b_police: 'قسم شرطة', ch_b_clinic: 'عيادة', ch_b_school: 'مدرسة', ch_b_park: 'جنينة',
    ch_z_R: 'السكني', ch_z_C: 'التجاري', ch_z_I: 'الصناعي', ch_s_fire: 'المطافي', ch_s_police: 'الشرطة', ch_s_clinic: 'العيادات', ch_s_school: 'المدارس',
    ch_p_taxRelief: 'تخفيض الضرايب', ch_p_curfew: 'حظر التجول بالليل', ch_p_cleanEnergy: 'دعم الطاقة النضيفة', ch_p_recycling: 'إعادة التدوير الإجباري', ch_p_freeTransit: 'المواصلات ببلاش'
  };
  const EN = {
    ch_online: '🌐 Online', ch_onlineSub: 'Co-op City', ch_roomSub: 'Room {c} · {n}/4',
    ch_title: 'Online Co-op City', ch_desc: 'Build one city together with up to 4 mayors: one treasury, one approval rating. The host runs the clock.',
    ch_name: 'Your Name', ch_create: '➕ Create Room', ch_or: 'or join a friend with a code', ch_codePh: 'CODE', ch_join: 'Join',
    ch_codeHint: 'Type the 4-letter room code', ch_noNet: 'Online play is not available right now, try again in a moment',
    ch_room: 'Room', ch_copyLink: '🔗 Copy Invite Link', ch_copied: 'Copied!', ch_mayors: 'Mayors ({n}/4)', ch_you: 'you', ch_hostTag: 'Host 👑',
    ch_freeSpot: 'Free spot — send a friend the code', ch_which: 'Which city will you build?', ch_fresh: 'New City', ch_mine: 'My Current City', ch_last: 'Last Saved Online City',
    ch_start: '▶ Start', ch_waitHost: 'Waiting for the host to start…', ch_connecting: 'Connecting…', ch_noHost: 'No one is in this room yet. Waiting for the host…',
    ch_takeOver: 'Open the Room Myself', ch_leave: 'Leave Room', ch_back: 'Back', ch_resume: 'Back to the City',
    ch_full: 'The room is full (4 mayors)', ch_joined: '{p} joined the city', ch_left: '{p} left', ch_newHost: '{p} is now the host',
    ch_youHost: 'You are now the host — the clock runs on your device', ch_hostOnly: 'Only the host can change the speed or pause',
    ch_hostOnlyNew: 'Only the host can start a new city', ch_saved: 'Saved a copy of the shared city (your own city is untouched)',
    ch_saveFail: 'Could not save (browser storage blocked)', ch_mayor: 'Mayor', ch_backSolo: 'Back to your own city',
    ch_note: 'This city is shared: saving goes to the online slot, so your own city never changes.', ch_speedNote: 'Speed and pause are up to the host.',
    ch_fBuilt: '{p} built a {b}', ch_fRemoved: '{p} bulldozed a {b}', ch_fRoads: '{p} laid {n} road tiles', ch_fZone: '{p} zoned {n} {b} lots', ch_fBull: '{p} bulldozed {n} tiles',
    ch_fTax: '{p} set {b} tax to {n}%', ch_fBud: '{p} set the {b} budget to {n}%', ch_fPolOn: '{p} turned on {b}', ch_fPolOff: '{p} turned off {b}',
    ch_fFest: '{p} threw a Festival Week 🎉', ch_fLoan: '{p} borrowed $10,000', ch_fPause: '{p} paused the city', ch_fSpeed: '{p} set the speed to {n}', ch_fNew: '{p} started a new city',
    ch_b_road: 'Road', ch_b_R: 'Residential', ch_b_C: 'Commercial', ch_b_I: 'Industrial', ch_b_power: 'Power Plant', ch_b_water: 'Water Tower', ch_b_fire: 'Fire Station',
    ch_b_police: 'Police Station', ch_b_clinic: 'Clinic', ch_b_school: 'School', ch_b_park: 'Park',
    ch_z_R: 'Residential', ch_z_C: 'Commercial', ch_z_I: 'Industrial', ch_s_fire: 'Fire', ch_s_police: 'Police', ch_s_clinic: 'Clinics', ch_s_school: 'Schools',
    ch_p_taxRelief: 'Tax Relief', ch_p_curfew: 'Night Curfew', ch_p_cleanEnergy: 'Clean Energy Grant', ch_p_recycling: 'Recycling Mandate', ch_p_freeTransit: 'Free Public Transit'
  };
  // the site's i18n (t / addStrings) arrives a moment later through cloud.js; until then English is used
  let added = false;
  function tr(k, v) {
    if (!added && window.addStrings) { try { addStrings(AR, EN); added = true; } catch (e) {} }
    if (added && window.t) return t(k, v);
    let s = EN[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s;
  }

  // ---------------------------------------------------------------- room state
  const ON = {
    ch: null, code: '', me: '', ready: false, host: null, ord: [], cols: {}, names: {}, heard: {}, ph: 'lobby', hostPh: 'lobby',
    hasCity: false, solo: null, soloSpeed: 1, lastSp: 1, wasHost: false, joinedAt: 0, screen: 'menu', pick: 'fresh', msg: '',
    q: [], pend: {}, force: new Set(), sentMp: null, sentLv: null, stN: 0, stT: 0, diffT: 0, actT: 0, curT: 0, needT: 0,
    myCur: null, cur: {}, feed: [], agg: {}, hb: 0, fl: 0, box: 0
  };
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} }, del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} } };
  const on = () => !!ON.code;
  const isHost = () => on() && ON.host === ON.me;
  const live = () => on() && ON.ph === 'play' && ON.hasCity;
  const alive = (id) => id === ON.me || (ON.heard[id] && Date.now() - ON.heard[id] < 9000);
  const myName = () => ((window.Auth && Auth.name && Auth.name()) || ON.guestName || tr('ch_mayor')).slice(0, 24);
  const nameOf = (id) => id === ON.me ? myName() : (ON.names[id] || tr('ch_mayor'));
  const colOf = (id) => PAL[(ON.cols[id] | 0) % PAL.length];
  const pageLink = () => location.href.split('?')[0].split('#')[0];
  const inviteLink = (c) => pageLink() + '?room=' + c;
  const newCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  async function canGoOnline() { if (window.Mal3abVersion && !(await Mal3abVersion.ok())) return false; return true; }
  function netSend(ev, p) { if (!ON.ch || !ON.ready) return; try { ON.ch.send({ type: 'broadcast', event: ev, payload: Object.assign({ id: ON.me }, p || {}) }); } catch (e) {} }

  // ---------------------------------------------------------------- city <-> messages
  const SKIP = { map: 1, lvl: 1, stats: 1 };
  const SK = ['pop', 'jobs', 'cnt', 'zoned', 'unemployment', 'crime', 'health', 'edu', 'traffic', 'leisure', 'pollution', 'needs', 'roads', 'upkeep',
    'income', 'polCost', 'loanPay', 'net', 'dem', 'powerCap', 'waterCap', 'buildings', 'powered', 'watered'];
  const r2 = (v) => typeof v === 'number' ? Math.round(v * 100) / 100 : (v && typeof v === 'object' && !Array.isArray(v)) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, r2(x)])) : v;
  const encMap = () => S.map.map(r => r.map(v => v.toString(36)).join('')).join('');
  const encLvl = () => S.lvl.map(r => r.join('')).join('');
  function meta() { const o = {}; for (const k in S) if (!SKIP[k]) o[k] = S[k]; return o; }
  function statsLite() { const st = S.stats || {}, o = {}; for (const k of SK) if (st[k] !== undefined) o[k] = r2(st[k]); return o; }
  const advText = () => { const a = $id('advText'); return a ? a.textContent : ''; };
  // guests rebuild coverage / pollution / road maps themselves from the tiles (same code the host uses)
  function refreshFields() { if (!S.stats) S.stats = {}; const F = fieldsOf(); S.stats.cover = F.cover; S.stats.pol = F.pol; S.stats.conn = F.conn; }
  function applyStats(s) { const F = fieldsOf(); S.stats = Object.assign({}, s || {}, { cover: F.cover, pol: F.pol, conn: F.conn }); }
  function applyFull(mp, lv, skipPending) {
    if (typeof mp !== 'string' || typeof lv !== 'string' || mp.length !== N * N || lv.length !== N * N) return;
    const now = Date.now();
    for (let i = 0; i < N * N; i++) {
      if (skipPending && ON.pend[i] && now - ON.pend[i] < 2000) continue;   // my own build is on its way to the host
      const x = i % N, y = (i / N) | 0; S.map[y][x] = parseInt(mp[i], 36) || 0; S.lvl[y][x] = +lv[i] || 0;
    }
  }
  function setAdv(txt) { const a = $id('advText'); if (a && typeof txt === 'string' && txt) a.textContent = txt; }

  // ---------------------------------------------------------------- join / leave
  function joinRoom(code, asHost) {
    leaveRoom(true);
    if (!window.sb) { toast(tr('ch_noNet')); return false; }
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (code.length < 4) return false;
    let id = ss.get('cityhall-id-' + code);
    if (!id) { id = Math.random().toString(36).slice(2, 10); ss.set('cityhall-id-' + code, id); }
    Object.assign(ON, { me: id, code, ready: false, ph: 'lobby', hostPh: 'lobby', hasCity: false, heard: {}, names: {}, cols: {}, ord: [], cur: {}, feed: [], agg: {},
      q: [], pend: {}, sentMp: null, sentLv: null, myCur: null, msg: '', joinedAt: Date.now(), screen: 'lobby' });
    ON.force.clear();
    ON.wasHost = !!asHost || ss.get('cityhall-host-' + code) === '1';
    ON.host = asHost ? id : null;
    if (asHost) { ON.ord = [id]; ON.cols[id] = 0; ss.set('cityhall-host-' + code, '1'); ss.del('cityhall-room-' + code); }
    ON.solo = S; ON.soloSpeed = G.speed;                 // my own city waits in memory until I leave
    const ch = sb.channel('cityhall-' + code, { config: { broadcast: { self: false, ack: false } } });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, ({ payload }) => { try { onNet(ev, payload); } catch (e) { console.warn(e); } });
    ch.subscribe((st) => { if (st === 'SUBSCRIBED' && ON.ch === ch) { ON.ready = true; hello(); if (isHost()) sendHb(); render(); } });
    ON.ch = ch;
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) {}
    clearInterval(ON.hb); ON.hb = setInterval(beat, 2000);
    clearInterval(ON.fl); ON.fl = setInterval(flushTick, 100);
    openPanel(); buildBar(); renderBox();
    return true;
  }
  function leaveRoom(quiet) {
    if (!ON.code) return;
    if (ON.ch) { netSend('bye', {}); const ch = ON.ch; setTimeout(() => { try { sb.removeChannel(ch); } catch (e) {} }, 150); }
    clearInterval(ON.hb); clearInterval(ON.fl);
    const had = ON.hasCity, code = ON.code;
    ss.del('cityhall-host-' + code); ss.del('cityhall-room-' + code);
    Object.assign(ON, { ch: null, code: '', ready: false, host: null, ord: [], hasCity: false, ph: 'lobby', cur: {}, feed: [], agg: {}, q: [] });
    if (ON.solo) { S = ON.solo; ON.solo = null; G.acc = 0; setSpeed(ON.soloSpeed, true); }   // my own city, exactly as I left it
    try { buildBar(); updateHUD(); } catch (e) {}
    renderBox();
    if (!quiet) { try { history.replaceState(null, '', location.pathname); } catch (e) {} if (had) toast(tr('ch_backSolo')); }
  }
  function hello() { netSend('hello', { n: myName() }); }
  function sendHb() {
    const p = { n: myName() };
    if (isHost()) { p.h = 1; p.ord = ON.ord; p.cols = ON.cols; p.ph = ON.ph; p.names = {}; for (const id of ON.ord) p.names[id] = nameOf(id); }
    netSend('hb', p);
  }
  function requestSnap() { const now = Date.now(); if (now - ON.needT < 2500) return; ON.needT = now; netSend('need', {}); }
  function beat() {
    if (!ON.ch) return;
    const now = Date.now();
    sendHb();
    for (const id of ON.ord.slice()) if (id !== ON.me && !alive(id)) gone(id);      // ~9 s of silence = gone
    if (ON.host && !isHost() && !alive(ON.host)) gone(ON.host);
    if (!ON.host && ON.ready) {
      if (ON.wasHost && now - ON.joinedAt > 4000) becomeHost(true);                 // I made this room and nobody took over: carry on
      else { hello(); if (ON.screen === 'lobby' && panelOpen()) render(); }
    }
    if (ON.host && !isHost() && ON.hostPh === 'play' && !ON.hasCity) requestSnap();
    if (isHost() && !ON.ord.includes(ON.me)) ON.ord.unshift(ON.me);
  }
  function freeColour() { const used = new Set(ON.ord.map(x => ON.cols[x]).filter(c => c != null)); for (let c = 0; c < PAL.length; c++) if (!used.has(c)) return c; return 0; }
  function addPlayer(id) {
    if (ON.ord.includes(id)) return true;
    if (ON.ord.filter(alive).length >= MAXP) { netSend('full', { to: id }); return false; }
    ON.cols[id] = freeColour(); ON.ord.push(id); ON.heard[id] = Date.now();
    toast(tr('ch_joined', { p: nameOf(id) })); addFeed({ k: 'ch_joined', v: { p: nameOf(id) }, c: ON.cols[id] });
    return true;
  }
  // the host's list of mayors (join order, colours, names)
  function adoptRoster(p) {
    const old = ON.ord, first = !old.length, now = Date.now();
    const ord = Array.isArray(p.ord) ? p.ord.filter(x => typeof x === 'string').slice(0, MAXP) : old;
    if (p.names) for (const k in p.names) if (k !== ON.me) ON.names[k] = String(p.names[k]).slice(0, 24);
    if (p.cols) ON.cols = Object.assign({}, p.cols);
    for (const id of ord) if (!ON.heard[id]) ON.heard[id] = now;
    if (!first) {
      for (const id of ord) if (!old.includes(id) && id !== ON.me) { toast(tr('ch_joined', { p: nameOf(id) })); addFeed({ k: 'ch_joined', v: { p: nameOf(id) }, c: ON.cols[id] | 0 }); }
      for (const id of old) if (!ord.includes(id) && id !== ON.me && id !== p.id) { toast(tr('ch_left', { p: nameOf(id) })); addFeed({ k: 'ch_left', v: { p: nameOf(id) }, c: ON.cols[id] | 0 }); delete ON.cur[id]; }
    }
    const changed = ord.join() !== old.join(); ON.ord = ord;
    if (!ord.includes(ON.me)) hello();                                               // the host lost track of me: say hi again
    renderBox(); if (changed) buildBar();
  }
  function gone(id) {
    if (!ON.code || id === ON.me) return;
    const wasHost = id === ON.host, known = ON.ord.includes(id) || wasHost;
    ON.heard[id] = 0; delete ON.cur[id];
    ON.ord = ON.ord.filter(x => x !== id);
    if (known) { toast(tr('ch_left', { p: nameOf(id) })); addFeed({ k: 'ch_left', v: { p: nameOf(id) }, c: ON.cols[id] | 0 }); }
    if (wasHost) electHost();
    if (isHost()) sendHb();
    renderBox(); buildBar(); if (panelOpen()) render();
  }
  // the next mayor in join order takes over (everyone has the same list from the host, so everyone picks the same one)
  function electHost() {
    let cands = ON.ord.filter(alive);
    if (!cands.length) cands = [ON.me];
    ON.host = cands[0];
    if (ON.host === ON.me) becomeHost(false); else toast(tr('ch_newHost', { p: nameOf(ON.host) }));
  }
  function becomeHost(restore) {
    if (!ON.code) return;
    ON.host = ON.me; ON.wasHost = true; ss.set('cityhall-host-' + ON.code, '1');
    ON.ord = ON.ord.filter(alive); if (!ON.ord.includes(ON.me)) ON.ord.unshift(ON.me);
    for (const id of ON.ord) if (ON.cols[id] == null) ON.cols[id] = freeColour();
    if (restore && !ON.hasCity) {                                                     // reloaded the page as host: pick the room's city back up
      let c = null; try { c = JSON.parse(ss.get('cityhall-room-' + ON.code) || 'null'); } catch (e) {}
      if (c && c.map && c.lvl) { S = c; S.stats = {}; simulate(); ON.hasCity = true; ON.ph = 'play'; closeModals(); setSpeed(1, true); buildBar(); updateHUD(); }
    }
    if (ON.hasCity) { ON.ph = 'play'; G.acc = 0; setSpeed(ON.lastSp, true); ON.sentMp = null; sendSnap(null); }
    if (!restore || ON.hasCity) toast(tr('ch_youHost'));
    sendHb(); renderBox(); buildBar(); if (panelOpen()) render();
  }

  // ---------------------------------------------------------------- messages in
  function onNet(ev, p) {
    if (!p || !p.id || p.id === ON.me || !ON.code) return;
    if (p.to && p.to !== ON.me) return;                                              // meant for someone else
    const id = p.id;
    if (ev === 'full') { leaveRoom(); ON.screen = 'menu'; ON.msg = tr('ch_full'); openPanel(); toast(tr('ch_full')); return; }
    if (ev === 'bye') { gone(id); return; }
    ON.heard[id] = Date.now();
    if (p.n && id !== ON.me) ON.names[id] = String(p.n).slice(0, 24);
    const fromHost = id === ON.host && !isHost();
    switch (ev) {
      case 'hello': if (isHost() && addPlayer(id)) { netSend('welcome', welcomeMsg(id)); if (live()) sendSnap(id); sendHb(); renderBox(); buildBar(); if (panelOpen()) render(); } break;
      case 'hb': if (p.h) onHostBeat(p); break;
      case 'welcome': ON.host = id; ON.hostPh = p.ph; adoptRoster(p); if (panelOpen()) render(); break;
      case 'snap': if (fromHost) applySnap(p); break;
      case 'diff': if (fromHost) applyDiff(p); break;
      case 'st': if (fromHost) applySt(p); break;
      case 'act': if (isHost() && live() && addPlayer(id)) onAct(id, p); break;
      case 'nack': nackMsg(p.r, p.k); break;
      case 'cur': if (live()) { const c = ON.cur[id]; ON.cur[id] = { tx: +p.x, ty: +p.y, x: c ? c.x : +p.x, y: c ? c.y : +p.y, k: p.k, t: Date.now() }; } break;
      case 'feed': if (id === ON.host) for (const f of (p.f || []).slice(0, 10)) addFeed(f); break;
      case 'ev': if (id === ON.host && typeof p.msg === 'string') toast(p.msg.slice(0, 300)); break;
      case 'need': if (isHost() && live()) sendSnap(id); break;
    }
  }
  function welcomeMsg(to) { const names = {}; for (const x of ON.ord) names[x] = nameOf(x); return { to, ord: ON.ord, cols: ON.cols, names, ph: ON.ph }; }
  function onHostBeat(p) {
    if (isHost()) {
      // two hosts at once (rare race): the one with more mayors (then the smaller id) keeps the room
      const theirs = (p.ord || []).length, mine = ON.ord.length;
      if (!(theirs > mine || (theirs === mine && p.id < ON.me))) { sendHb(); return; }
      ON.hasCity = false; ON.ph = 'lobby';
    }
    if (ON.host !== p.id) { const before = ON.host; ON.host = p.id; if (before && before !== ON.me) toast(tr('ch_newHost', { p: nameOf(p.id) })); }
    ON.hostPh = p.ph;
    adoptRoster(p);
    if (p.ph === 'play' && !ON.hasCity) requestSnap();
    if (panelOpen() && ON.screen === 'lobby') render();
  }
  function applySnap(p) {
    const first = !ON.hasCity;
    const city = { map: [], lvl: [] };
    for (let y = 0; y < N; y++) { city.map.push(new Array(N).fill(0)); city.lvl.push(new Array(N).fill(0)); }
    S = city; applyFull(p.mp, p.lv, false);
    if (p.m) for (const k in p.m) if (!SKIP[k]) S[k] = p.m[k];
    ON.hasCity = true; ON.ph = 'play'; ON.hostPh = 'play'; ON.pend = {};
    applyStats(p.s); setAdv(p.adv);
    ON.lastSp = p.sp | 0; setSpeed(p.sp | 0, true);
    if (first) { closeModals(); goTo(Math.floor(N / 2), Math.floor(N / 2)); }
    buildBar(); updateHUD(); renderBox();
  }
  function applyDiff(p) {
    if (!ON.hasCity) { requestSnap(); return; }
    const d = Array.isArray(p.d) ? p.d : [];
    for (let i = 0; i + 3 < d.length; i += 4) { const x = d[i] | 0, y = d[i + 1] | 0; if (!inb(x, y)) continue; S.map[y][x] = d[i + 2] | 0; S.lvl[y][x] = d[i + 3] | 0; delete ON.pend[y * N + x]; }
    if (p.mp) applyFull(p.mp, p.lv, false);
    refreshFields();
  }
  function applySt(p) {
    if (!ON.hasCity) { requestSnap(); return; }
    const tier = S.tier, bank = !!S.bankrupt;
    if (p.m) for (const k in p.m) if (!SKIP[k]) S[k] = p.m[k];
    if (p.mp) applyFull(p.mp, p.lv, true);
    applyStats(p.s); setAdv(p.adv);
    ON.lastSp = p.sp | 0; if ((p.sp | 0) !== G.speed) setSpeed(p.sp | 0, true);
    if (S.tier !== tier || !!S.bankrupt !== bank) buildBar();
    updateHUD();
  }
  function nackMsg(r, k) {
    if (r === 'limit') toast('Loan limit reached');
    else if (r === 'money') toast('Not enough money');
    else if (BUILD[k]) placeMsg(r, k);
  }

  // ---------------------------------------------------------------- host: actions from the other mayors
  function onAct(id, p) {
    const nm = nameOf(id), c = ON.cols[id] | 0;
    for (const a of (Array.isArray(p.q) ? p.q : []).slice(0, 80)) {
      if (!a || typeof a !== 'object') continue;
      if (a.a === 'p') {
        const x = a.x | 0, y = a.y | 0, k = String(a.k); if (!BUILD[k] || !inb(x, y)) continue;
        const prev = S.map[y][x], r = placeAt(x, y, k);
        if (r === 'ok') noteBuild(id, k, prev);
        else { ON.force.add(y * N + x); if (r) netSend('nack', { to: id, r, k }); }          // the guest guessed wrong: send the real tile back
      } else if (a.a === 'tax' && ['R', 'C', 'I'].includes(a.k)) {
        S.tax[a.k] = clamp(a.v | 0, 0, 30); later('tax' + a.k + id, { k: 'ch_fTax', v: { p: nm, b: 'ch_z_' + a.k, n: S.tax[a.k] }, c });
      } else if (a.a === 'bud' && ['fire', 'police', 'clinic', 'school'].includes(a.k)) {
        S.budget[a.k] = clamp(a.v | 0, 50, 150); later('bud' + a.k + id, { k: 'ch_fBud', v: { p: nm, b: 'ch_s_' + a.k, n: S.budget[a.k] }, c });
      } else if (a.a === 'pol' && POLICIES[a.k] && S.tier >= 2) {
        const r = policyAt(a.k, a.on);
        if (r === 'money') netSend('nack', { to: id, r }); else notePolicy(id, a.k, r);
      } else if (a.a === 'loan' && S.tier >= 1) {
        const r = loanAt(); if (r === 'ok') pushFeed({ k: 'ch_fLoan', v: { p: nm }, c }); else netSend('nack', { to: id, r });
      }
    }
    sendDiff();
  }
  function noteBuild(id, k, prev) {
    const nm = nameOf(id), c = ON.cols[id] | 0;
    if (k === 'bull') { const pk = T2K[prev]; if (pk && !SMALL[pk]) pushFeed({ k: 'ch_fRemoved', v: { p: nm, b: 'ch_b_' + pk }, c }); else count(id, 'bull'); }
    else if (SMALL[k]) count(id, k);
    else pushFeed({ k: 'ch_fBuilt', v: { p: nm, b: 'ch_b_' + k }, c });
  }
  function notePolicy(id, k, r) {
    const nm = nameOf(id), c = ON.cols[id] | 0;
    if (r === 'fest') pushFeed({ k: 'ch_fFest', v: { p: nm }, c });
    else if (r === 'ok') pushFeed({ k: S.policies[k] ? 'ch_fPolOn' : 'ch_fPolOff', v: { p: nm, b: 'ch_p_' + k }, c });
  }
  // roads / zones / bulldozing are summed up per mayor ("Sara laid 12 road tiles"); sliders report their final value
  function count(id, k) { const key = 'n' + k + id, e = ON.agg[key] || (ON.agg[key] = { n: 0, id, k }); e.n++; e.t = Date.now(); }
  function later(key, item) { ON.agg[key] = { item, t: Date.now() }; }
  function flushAgg(now) {
    for (const key in ON.agg) {
      const e = ON.agg[key]; if (now - e.t < 2200) continue; delete ON.agg[key];
      if (e.item) { pushFeed(e.item); continue; }
      const nm = nameOf(e.id), c = ON.cols[e.id] | 0;
      pushFeed(e.k === 'road' ? { k: 'ch_fRoads', v: { p: nm, n: e.n }, c } : e.k === 'bull' ? { k: 'ch_fBull', v: { p: nm, n: e.n }, c } : { k: 'ch_fZone', v: { p: nm, n: e.n, b: 'ch_b_' + e.k }, c });
    }
  }
  function pushFeed(item) { addFeed(item); netSend('feed', { f: [item] }); }

  // ---------------------------------------------------------------- messages out (host: tiles + stats; guests: actions; everyone: cursor)
  function sendSnap(to) {
    const p = { mp: encMap(), lv: encLvl(), m: meta(), s: statsLite(), sp: G.speed, adv: advText() };
    if (to) p.to = to; else { ON.sentMp = p.mp; ON.sentLv = p.lv; }
    netSend('snap', p);
  }
  function sendDiff() {
    if (!isHost() || !live()) return;
    ON.diffT = Date.now();
    const mp = encMap(), lv = encLvl();
    if (!ON.sentMp) { ON.sentMp = mp; ON.sentLv = lv; return; }
    if (mp === ON.sentMp && lv === ON.sentLv && !ON.force.size) return;
    const d = [];
    for (let i = 0; i < N * N; i++) if (mp[i] !== ON.sentMp[i] || lv[i] !== ON.sentLv[i] || ON.force.has(i)) d.push(i % N, (i / N) | 0, parseInt(mp[i], 36), +lv[i]);
    ON.force.clear(); ON.sentMp = mp; ON.sentLv = lv;
    if (d.length > 4 * 250) netSend('diff', { mp, lv }); else if (d.length) netSend('diff', { d });
  }
  function sendSt() {
    if (!isHost() || !live()) return;
    ON.stT = Date.now(); ON.stN++;
    const p = { m: meta(), s: statsLite(), sp: G.speed, adv: advText() };
    if (ON.stN % 5 === 0) { p.mp = encMap(); p.lv = encLvl(); }                         // the whole map every 5 s heals anything lost
    netSend('st', p);
  }
  function flushTick() {
    if (!ON.ch || !ON.ready) return;
    const now = Date.now();
    if (live() && ON.myCur && ON.myCur.dirty && now - ON.curT >= 120) { ON.myCur.dirty = false; ON.curT = now; netSend('cur', { x: ON.myCur.x, y: ON.myCur.y, k: G.tool }); }
    if (!live()) return;
    if (isHost()) {
      if (now - ON.diffT >= 250) sendDiff();
      if (now - ON.stT >= 1000) sendSt();
      flushAgg(now);
    } else if (ON.q.length && now - ON.actT >= 100) { ON.actT = now; netSend('act', { q: ON.q.splice(0, 60) }); }
  }
  function queue(a) {
    if (a.a === 'tax' || a.a === 'bud') ON.q = ON.q.filter(o => !(o.a === a.a && o.k === a.k));   // sliders: only the latest value matters
    ON.q.push(a);
  }

  // ---------------------------------------------------------------- feed + mayors box
  function addFeed(f) {
    if (!f || typeof f.k !== 'string' || !/^ch_/.test(f.k)) return;
    ON.feed.push({ k: f.k, v: f.v || {}, c: f.c | 0, t: Date.now() }); if (ON.feed.length > 6) ON.feed.shift();
    renderBox();
  }
  function feedText(f) { const v = f.v || {}; return tr(f.k, { p: v.p || '', n: v.n == null ? '' : v.n, b: typeof v.b === 'string' && /^ch_/.test(v.b) ? tr(v.b) : '' }); }
  function renderBox() {
    const box = $id('chBox'); if (!box) return;
    if (!on()) { box.style.display = 'none'; return; }
    const now = Date.now(), list = ON.ord.length ? ON.ord : [ON.me], narrow = innerWidth < 800;
    box.style.display = 'block';
    box.innerHTML = `<div class="head" data-ch="open"><b>🌐 ${esc(ON.code)}</b>${list.map(id => `<span class="chip" dir="auto"><i style="background:${colOf(id)}"></i>${esc(nameOf(id))}${id === ON.host ? ' 👑' : ''}</span>`).join('')}</div><div id="chFeed"></div>`;
    const fd = box.querySelector('#chFeed');
    for (const f of ON.feed.slice(narrow ? -3 : -5)) {
      if (now - f.t > (narrow ? 10000 : 45000)) continue;                                  // phones: only fresh lines, the map needs the room
      const d = document.createElement('div'); d.dir = 'auto'; d.textContent = feedText(f); d.style.borderLeftColor = PAL[f.c % PAL.length];
      if (now - f.t > 10000) d.className = 'old'; fd.appendChild(d);
    }
    placeBox();
  }
  function placeBox() {
    const box = $id('chBox'), bar = $id('bottom'); if (!box || !bar || box.style.display === 'none') return;
    box.style.bottom = Math.max(70, innerHeight - bar.getBoundingClientRect().top + 8) + 'px';
  }

  // ---------------------------------------------------------------- the Online panel
  const panelOpen = () => { const m = $id('online'); return !!m && m.classList.contains('show'); };
  function openPanel() { closeModals(); render(); $id('online').classList.add('show'); if (window.Mal3abPopButtons) window.Mal3abPopButtons(); }
  function render() {
    const body = $id('onlineBody'); if (!body) return;
    let h = '';
    if (!on()) {
      const authed = window.Auth && Auth.profile;
      h = `<h3>${esc(tr('ch_title'))}</h3><p class="sub">${esc(tr('ch_desc'))}</p>
        ${authed ? '' : `<label style="display:block;font-size:12px;color:var(--quiet);margin-bottom:4px">${esc(tr('ch_name'))}</label><input type="text" id="chName" maxlength="20" dir="auto" value="${esc((window.Auth && Auth.name && Auth.name()) || ON.guestName || '')}">`}
        <button class="btn" data-ch="create" style="width:100%">${esc(tr('ch_create'))}</button>
        <div class="or">${esc(tr('ch_or'))}</div>
        <div class="line"><input type="text" class="code" id="chCode" maxlength="6" placeholder="${esc(tr('ch_codePh'))}" autocomplete="off" spellcheck="false"><button class="btn" data-ch="join">${esc(tr('ch_join'))}</button></div>
        <div class="msg" id="chMsg">${esc(ON.msg)}</div>
        <p class="note">${esc(tr('ch_note'))}</p>
        <button class="btn alt" data-ch="close">${esc(tr('ch_back'))}</button>`;
    } else {
      const list = ON.ord.length ? ON.ord : [ON.me];
      let rows = list.map(id => `<div class="pl"><i style="background:${colOf(id)}"></i><b dir="auto">${esc(nameOf(id))}</b><span>${[id === ON.me ? tr('ch_you') : '', id === ON.host ? tr('ch_hostTag') : ''].filter(Boolean).map(esc).join(' · ')}</span></div>`).join('');
      if (list.length < MAXP && ON.host) rows += `<div class="pl wait">${esc(tr('ch_freeSpot'))}</div>`;
      let tail = '';
      if (!ON.ready) tail = `<p class="note">${esc(tr('ch_connecting'))}</p>`;
      else if (!ON.host) tail = `<p class="note">${esc(tr('ch_noHost'))}</p>${Date.now() - ON.joinedAt > 6000 ? `<button class="btn alt" data-ch="takeover">${esc(tr('ch_takeOver'))}</button>` : ''}`;
      else if (live()) tail = `<button class="btn" data-ch="close">${esc(tr('ch_resume'))}</button><p class="note">${esc(tr('ch_speedNote'))} ${esc(tr('ch_note'))}</p>`;
      else if (isHost()) {
        let hasLast = false; try { hasLast = !!localStorage.getItem('cityhall-online'); } catch (e) {}
        if (ON.pick === 'last' && !hasLast) ON.pick = 'fresh';
        const opt = (v, k, off) => `<label class="${off ? 'off' : ''}"><input type="radio" name="chPick" data-ch="pick" data-v="${v}" ${ON.pick === v ? 'checked' : ''} ${off ? 'disabled' : ''}> ${esc(tr(k))}</label>`;
        tail = `<h4 style="margin-top:6px">${esc(tr('ch_which'))}</h4><div class="pick">${opt('fresh', 'ch_fresh')}${opt('mine', 'ch_mine', !ON.solo)}${opt('last', 'ch_last', !hasLast)}</div>
          <button class="btn" data-ch="start" style="width:100%">${esc(tr('ch_start'))}</button>`;
      } else tail = `<p class="note">${esc(tr('ch_waitHost'))}</p>`;
      h = `<h3>${esc(tr('ch_title'))}</h3>
        <div class="roomcode"><span>${esc(tr('ch_room'))}</span><b>${esc(ON.code)}</b><button class="btn alt" data-ch="copy">${esc(tr('ch_copyLink'))}</button></div>
        <h4 style="margin-top:12px">${esc(tr('ch_mayors', { n: list.length }))}</h4><div class="plist">${rows}</div>
        ${tail}
        <div><button class="btn alt" data-ch="leave">${esc(tr('ch_leave'))}</button></div>`;
    }
    body.innerHTML = h;
    body.querySelectorAll('p, h3, h4, label, .or, .msg, .pl.wait').forEach(e => { e.dir = 'auto'; });   // Arabic reads right to left
    const code = $id('chCode');
    if (code) { code.oninput = () => { code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; code.onkeydown = (e) => { if (e.key === 'Enter') act('join'); }; }
    const nm = $id('chName');
    if (nm) nm.onchange = () => { const v = nm.value.trim().slice(0, 20); ON.guestName = v; if (v && window.Auth && Auth.setGuestName) Auth.setGuestName(v); };
  }
  async function act(a, el) {
    const nm = $id('chName'); if (nm && nm.value.trim()) { ON.guestName = nm.value.trim().slice(0, 20); if (window.Auth && Auth.setGuestName && !Auth.profile) Auth.setGuestName(ON.guestName); }
    switch (a) {
      case 'create': ON.msg = ''; if (!window.sb) { ON.msg = tr('ch_noNet'); render(); return; } if (!(await canGoOnline())) return; joinRoom(newCode(), true); break;
      case 'join': {
        const inp = $id('chCode'), code = (inp ? inp.value : '').trim().toUpperCase();
        if (code.length < 4) { ON.msg = tr('ch_codeHint'); const m = $id('chMsg'); if (m) m.textContent = ON.msg; return; }
        if (!window.sb) { ON.msg = tr('ch_noNet'); render(); return; }
        ON.msg = ''; if (!(await canGoOnline())) return; joinRoom(code, false); break;
      }
      case 'copy': copy(inviteLink(ON.code), el); break;
      case 'pick': ON.pick = el.dataset.v; break;
      case 'start': startCity(); break;
      case 'takeover': becomeHost(true); break;
      case 'leave': leaveRoom(); ON.screen = 'menu'; closeModals(); break;
      case 'close': closeModals(); break;
      case 'open': openPanel(); break;
    }
  }
  function copy(text, btn) {
    const done = () => { if (!btn) return; const o = btn.textContent; btn.textContent = tr('ch_copied'); setTimeout(() => { btn.textContent = o; }, 1300); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done(); } catch (e) { done(); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-ch]'); if (!b || b.disabled) return;
    if (!b.closest('#online') && !b.closest('#chBox')) return;
    act(b.dataset.ch, b);
  });
  // host: pick the city and go
  function startCity() {
    if (!isHost() || live()) return;
    let city = null;
    if (ON.pick === 'mine' && ON.solo) { city = JSON.parse(JSON.stringify({ ...ON.solo, stats: {} })); city.stats = ON.solo.stats; S = city; }
    else if (ON.pick === 'last') { try { city = JSON.parse(localStorage.getItem('cityhall-online') || 'null'); } catch (e) {} if (city && city.map) { S = city; S.stats = {}; simulate(); } else city = null; }
    if (!city) { S = newState(); simulate(); }
    ON.hasCity = true; ON.ph = 'play'; ON.pend = {}; G.acc = 0;
    closeModals(); goTo(Math.floor(N / 2), Math.floor(N / 2));
    setSpeed(1, true); ON.lastSp = 1; buildBar(); updateHUD();
    sendSnap(null); sendHb(); renderBox(); saveRoom();
  }
  function saveRoom() { if (isHost() && live()) ss.set('cityhall-room-' + ON.code, JSON.stringify({ ...S, stats: {} })); }

  // ---------------------------------------------------------------- cursors of the other mayors
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
  function drawCursors(ctx) {
    if (!live()) return;
    const now = Date.now(), z = G.cam.z;
    for (const id in ON.cur) {
      const c = ON.cur[id]; if (!ON.ord.includes(id) || now - c.t > 20000 || !inb(c.tx, c.ty)) continue;
      c.x += (c.tx - c.x) * 0.3; c.y += (c.ty - c.y) * 0.3;                         // smooth glide between updates
      const col = colOf(id), [px, py] = isoToScreen(c.x, c.y);
      ctx.save(); ctx.globalAlpha = now - c.t > 8000 ? 0.45 : 1;
      ctx.beginPath(); ctx.moveTo(px, py - TH / 2); ctx.lineTo(px + TW / 2, py); ctx.lineTo(px, py + TH / 2); ctx.lineTo(px - TW / 2, py); ctx.closePath();
      ctx.fillStyle = hexA(col, 0.25); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5 / z; ctx.stroke();
      const label = nameOf(id), fs = 12 / Math.max(0.6, z);
      ctx.font = `bold ${fs}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(label).width + fs, hh = fs * 1.6, ty = py - TH / 2 - hh * 0.9;
      ctx.fillStyle = col; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px - w / 2, ty - hh / 2, w, hh, hh / 2); else ctx.rect(px - w / 2, ty - hh / 2, w, hh);
      ctx.fill(); ctx.fillStyle = '#0b1218'; ctx.fillText(label, px, ty + fs * 0.05);
      ctx.restore();
    }
  }
  function setMyCursor(x, y) {
    if (!live() || !inb(x, y)) return;
    if (ON.myCur && ON.myCur.x === x && ON.myCur.y === y) return;
    ON.myCur = { x, y, dirty: true };
  }

  // ---------------------------------------------------------------- hooks used by the game
  window.CHO = {
    on, live, isHost,
    canSim: () => !on() || (isHost() && live()),
    mayChangeSpeed() { if (!live() || isHost()) return true; toast(tr('ch_hostOnly')); return false; },
    onSpeed(s) { if (!live() || !isHost()) return; sendSt(); pushFeed(s ? { k: 'ch_fSpeed', v: { p: myName(), n: s + '×' }, c: ON.cols[ON.me] | 0 } : { k: 'ch_fPause', v: { p: myName() }, c: ON.cols[ON.me] | 0 }); },
    // a build / bulldoze click or drag
    place(x, y, tool) {
      setMyCursor(x, y);
      const prev = inb(x, y) ? S.map[y][x] : 0, r = placeAt(x, y, tool);
      placeMsg(r, tool);
      if (r !== 'ok') return;
      if (isHost()) noteBuild(ON.me, tool, prev);
      else { ON.pend[y * N + x] = Date.now(); queue({ a: 'p', x, y, k: tool }); refreshFields(); }   // shown now, the host confirms
    },
    // a city-wide change the game already made locally (tax, budget, policy, loan)
    city(kind, d) {
      if (!live()) return;
      if (!isHost()) { queue(Object.assign({ a: kind }, d)); return; }
      const nm = myName(), c = ON.cols[ON.me] | 0;
      if (kind === 'tax') later('tax' + d.k + ON.me, { k: 'ch_fTax', v: { p: nm, b: 'ch_z_' + d.k, n: d.v }, c });
      else if (kind === 'bud') later('bud' + d.k + ON.me, { k: 'ch_fBud', v: { p: nm, b: 'ch_s_' + d.k, n: d.v }, c });
      else if (kind === 'pol') notePolicy(ON.me, d.k, POLICIES[d.k] && POLICIES[d.k].oneoff ? 'fest' : 'ok');
      else if (kind === 'loan') pushFeed({ k: 'ch_fLoan', v: { p: nm }, c });
      sendSt();
    },
    cursor: setMyCursor,
    draw: drawCursors,
    afterTick() { if (!isHost() || !live()) return; sendDiff(); sendSt(); saveRoom(); },
    onToast(msg) { if (G.inSim && isHost() && live()) netSend('ev', { msg: String(msg) }); },  // milestones, protests, recalls… for everyone
    save() { try { localStorage.setItem('cityhall-online', JSON.stringify({ ...S, stats: {} })); toast(tr('ch_saved')); } catch (e) { toast(tr('ch_saveFail')); } },
    autosave() { if (isHost() && live() && S.month % 12 === 0 && S.month > 0) { try { localStorage.setItem('cityhall-online', JSON.stringify({ ...S, stats: {} })); } catch (e) {} } },
    newCity() { if (isHost()) return true; toast(tr('ch_hostOnlyNew')); return false; },
    afterNewCity() {
      if (on() && !live()) { ON.solo = S; return; }                                   // in the lobby the city on screen is still my own
      if (isHost() && live()) { ON.sentMp = null; sendSnap(null); pushFeed({ k: 'ch_fNew', v: { p: myName() }, c: ON.cols[ON.me] | 0 }); saveRoom(); }
    },
    barButton(bar) {
      const el = document.createElement('div'); el.className = 'tool online' + (on() ? ' live' : '');
      el.innerHTML = `${esc(tr('ch_online'))}<small>${esc(on() ? tr('ch_roomSub', { c: ON.code, n: Math.max(1, ON.ord.length) }) : tr('ch_onlineSub'))}</small>`;
      el.onclick = () => { ON.msg = ''; openPanel(); };
      bar.appendChild(el);
    },
    // test hooks
    _ON: ON, joinRoom, leaveRoom, startCity, newCode
  };

  // ---------------------------------------------------------------- site hooks (chat invites, live rooms list)
  window.Mal3abShareLink = () => ON.code ? inviteLink(ON.code) : pageLink();
  window.Mal3abPrepareInvite = async () => {
    if (!ON.code) { if (!window.sb || !(await canGoOnline())) return pageLink(); joinRoom(newCode(), true); }
    return inviteLink(ON.code);
  };
  window.Mal3abLiveInfo = () => ({ players: Math.max(1, ON.ord.length), max: MAXP });
  addEventListener('pagehide', () => { if (ON.ch) netSend('bye', {}); });
  const relabel = () => { try { buildBar(); } catch (e) {} renderBox(); if (panelOpen()) render(); };
  document.addEventListener('langchange', relabel);
  document.addEventListener('mal3abready', relabel);
  addEventListener('resize', placeBox);
  ON.box = setInterval(() => { if (on()) renderBox(); }, 1500);   // fade old feed lines, follow the toolbar height
  buildBar();

  // ?room=CODE joins that room (invite links)
  const roomParam = new URLSearchParams(location.search).get('room');
  if (roomParam) {
    let tried = false;
    const go = async () => {
      if (tried || ON.code) return; tried = true;
      if (!window.sb) { toast(tr('ch_noNet')); return; }
      if (!(await canGoOnline())) return;
      joinRoom(roomParam, false);
    };
    if (window.Mal3abReady) go(); else { document.addEventListener('mal3abready', go, { once: true }); setTimeout(go, 6000); }
  }
})();
