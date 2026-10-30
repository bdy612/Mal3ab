// Mal3ab — Supabase client, online rooms and accounts (project: Mal3ab Games)
(function () {
  const NET_SRC = document.currentScript && document.currentScript.src;
  const SUPABASE_URL = 'https://asycvzvkvukjamwrekwi.supabase.co';
  const SUPABASE_KEY = 'sb_publishable__JmGIFTBou_J9g1YPq-7Ng_Z3C9lihm';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 40 } } });
  window.sb = sb;

  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randCode = () => Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');

  // ---------- accounts (own table, bcrypt-hashed passwords, no email confirmation) ----------
  const TOKEN_KEY = 'mal3ab_token';
  const Auth = {
    user: null, profile: null, token: null,
    async init() {
      try { Auth.token = localStorage.getItem(TOKEN_KEY); } catch (e) {}
      if (Auth.token) {
        const { data } = await sb.rpc('me', { p_token: Auth.token });
        Auth._set(data);
        if (!data) { Auth.token = null; try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }   // expired
      }
      // heartbeat: while the site is open the session never expires (3 h idle, or 7 days with "keep me signed in")
      setInterval(() => { if (Auth.token) sb.rpc('touch', { p_token: Auth.token }).then(({ data }) => { if (data === false) Auth.signOut(); }); }, 30 * 1000);
      Invites.listen();
      if (Auth.user) History.sync();
      return Auth.user;
    },
    _set(profile) {
      Auth.profile = profile || null;
      Auth.user = profile ? { id: profile.id } : null;
      // the account's saved language wins on every page and in every game
      if (profile && profile.lang && window.setLang && window.getLang && getLang() !== profile.lang) setLang(profile.lang);
      document.dispatchEvent(new Event('authchange'));
    },
    _session(res) {
      Auth.token = res.token; try { localStorage.setItem(TOKEN_KEY, res.token); } catch (e) {}
      Auth._set(res.profile);
      History.sync();
    },
    name() {
      if (Auth.profile) return Auth.profile.username;
      try { return localStorage.getItem('mal3ab_guest') || ''; } catch (e) { return ''; }
    },
    setGuestName(n) { try { localStorage.setItem('mal3ab_guest', n); } catch (e) {} },
    async signUp(username, password, email, remember) {
      const { data, error } = await sb.rpc('signup', { p_username: username, p_password: password, p_email: email || null, p_remember: !!remember });
      if (error) throw new Error(error.message);
      Auth._session(data);
    },
    async signIn(identifier, password, remember) {
      const { data, error } = await sb.rpc('login', { p_identifier: identifier, p_password: password, p_remember: !!remember });
      if (error) throw new Error(error.message);
      Auth._session(data);
    },
    async signOut() {
      if (Auth.token) await sb.rpc('logout', { p_token: Auth.token });
      Auth.token = null; try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
      Auth._set(null);
    },
    async record(result) {
      if (!Auth.token) return;
      const { data } = await sb.rpc('record_result', { p_token: Auth.token, result });
      if (data) Auth._set(data);
    },
    // account page
    async update(fields) {
      const { data, error } = await sb.rpc('update_account', { p_token: Auth.token, p_username: fields.username || null, p_lang: fields.lang || null,
        p_avatar: fields.avatar || null, p_clear_avatar: !!fields.clearAvatar });
      if (error) throw new Error(error.message);
      Auth._set(data); return data;
    },
    async changePassword(oldPw, newPw) {
      const { error } = await sb.rpc('change_password', { p_token: Auth.token, p_old: oldPw, p_new: newPw });
      if (error) throw new Error(error.message);
    },
    // cloud saves for single-player games
    async saveGame(game, key, data) { if (Auth.token) await sb.rpc('save_game', { p_token: Auth.token, p_game: game, p_key: key, p_data: data }); },
    async loadSaves(game) { if (!Auth.token) return {}; const { data } = await sb.rpc('load_saves', { p_token: Auth.token, p_game: game }); return data || {}; }
  };
  window.Auth = Auth;

  // ---------- match history ----------
  window.History = {
    local() { try { return JSON.parse(localStorage.getItem('mal3ab_history') || '[]'); } catch (e) { return []; } },
    async save(row) {
      const list = History.local(); list.unshift(row); try { localStorage.setItem('mal3ab_history', JSON.stringify(list.slice(0, 200))); } catch (e) {}
      if (row.mode === 'online' || Auth.user) {
        const r = Object.assign({}, row);
        if (row.mode === 'online') { const room = await Net.get(row.code); if (room) { r.p1_id = room.p1_id; r.p2_id = room.p2_id; } }
        else r.p1_id = Auth.user ? Auth.user.id : null;
        await sb.from('matches').upsert(History.clean(r), { onConflict: 'code,game_no', ignoreDuplicates: true });   // the other player's copy is ignored
      }
    },
    clean(r) { const o = {}; for (const k of ['code', 'game_no', 'game', 'mode', 'p1_name', 'p2_name', 'p1_id', 'p2_id', 'winner', 'reason', 'moves', 'finished_at']) if (r[k] !== undefined) o[k] = r[k]; return o; },
    // upload every match kept in this browser that the database doesn't have yet (also recovers lost history)
    async sync() {
      if (!Auth.user || History._syncing) return; History._syncing = true;
      try {
        const me = Auth.user.id, name = Auth.name();
        const rows = History.local().filter(r => r && r.code && r.game).map(r => {
          const o = History.clean(Object.assign({ game_no: 1, mode: 'local', finished_at: new Date().toISOString() }, r));
          if (!o.p1_id && !o.p2_id) { if (o.p2_name === name && o.p1_name !== name) o.p2_id = me; else o.p1_id = me; }
          return o;
        });
        for (let i = 0; i < rows.length; i += 50) await sb.from('matches').upsert(rows.slice(i, i + 50), { onConflict: 'code,game_no', ignoreDuplicates: true });
      } catch (e) {} finally { History._syncing = false; }
    },
    async mine() {
      if (!Auth.user) return History.local();
      await History.sync();
      const { data } = await sb.from('matches').select('*').or(`p1_id.eq.${Auth.user.id},p2_id.eq.${Auth.user.id}`).not('hidden_by', 'cs', `{${Auth.user.id}}`).order('finished_at', { ascending: false }).limit(200);
      return data || [];
    },
    // delete a game from my history (the other player keeps theirs)
    async remove(row) {
      const list = History.local().filter(r => !(r.code === row.code && (r.game_no || 1) === (row.game_no || 1)));
      try { localStorage.setItem('mal3ab_history', JSON.stringify(list)); } catch (e) {}
      if (Auth.user && row.id) { const { error } = await sb.rpc('hide_match', { p_token: Auth.token, p_id: row.id }); if (error) throw new Error(error.message); }
    }
  };

  // ---------- admin panel ----------
  window.Admin = {
    async users() { const { data, error } = await sb.rpc('admin_users', { p_token: Auth.token }); if (error) throw new Error(error.message); return data || []; },
    async act(target, action, reason) { const { error } = await sb.rpc('admin_action', { p_token: Auth.token, p_target: target, p_action: action, p_reason: reason || null }); if (error) throw new Error(error.message); }
  };
  // when a logged-in player switches language, remember it on the account
  document.addEventListener('langchange', () => {
    if (Auth.token && Auth.profile && window.getLang && Auth.profile.lang !== getLang()) { Auth.profile.lang = getLang(); sb.rpc('update_account', { p_token: Auth.token, p_lang: getLang() }); }
  });

  // ---------- friends + fast connect ----------
  const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, Object.assign({ p_token: Auth.token }, args || {})); if (error) throw new Error(error.message); return data; };
  window.Friends = {
    list: () => rpc('friends'),
    request: (username) => rpc('friend_request', { p_username: username }),
    respond: (id, accept) => rpc('friend_respond', { p_id: id, p_accept: accept }),
    remove: (id) => rpc('friend_remove', { p_friend: id }),
    invite: async (toId, game, code) => { if (!(await Ver.ok())) throw new Error(t('ver_short')); return rpc('send_invite', { p_to: toId, p_game: game, p_code: code }); },
    inviteStatus: (id) => rpc('invite_status', { p_id: id }),
    voxelCodeOf: (id) => rpc('voxel_code_of', { p_friend: id })
  };
  const ROOT = () => location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '');
  window.Invites = {
    gameUrl(game, code, p, name) {
      if (game === 'turfrush') return `${ROOT()}games/turf-rush.html?join=${code}`;
      if (game === 'pitch') return `${ROOT()}games/pitch-legends/index.html?pvp=${code}`;
      if (game === 'voxelstrike') return `${ROOT()}games/voxel-strike/index.html?room=${code}`;
      if (game === 'bricks') return `${ROOT()}games/brick-builder/index.html?room=${code}`;
      if (game === 'voxel') return `${ROOT()}games/voxel/index.html?joinFriend=${encodeURIComponent(code)}&fname=${encodeURIComponent(name || '')}`;
      return `${ROOT()}games/${game}.html?code=${code}&p=${p}`;
    },
    _shown: new Set(),
    listen() {
      if (Invites._timer) return;
      Invites._timer = setInterval(async () => {
        if (!Auth.token) return;
        let list = []; try { list = await rpc('my_invites'); } catch (e) { return; }
        for (const inv of list) if (!Invites._shown.has(inv.id)) { Invites._shown.add(inv.id); Invites.toast(inv); }
      }, 4000);
    },
    toast(inv) {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;background:#1a1f35;color:#eef0ff;border:2px solid #ffb703;border-radius:14px;padding:14px 16px;font:700 15px Segoe UI,Tahoma,Arial,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5);max-width:320px';
      const names = { chess: t('chess'), connect4: t('connect4'), tictactoe: t('tictactoe'), turfrush: t('turfrush'), voxel: t('voxel'), pitch: t('pitch'), voxelstrike: t('voxelstrike'), bricks: t('bricks') };
      el.innerHTML = `⚡ <b style="color:#ffb703">${inv.from}</b> ${t('invitesYou')} <b>${names[inv.game] || inv.game}</b>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button style="flex:1;background:#80ed99;color:#062b12;border:0;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">✅ ${t('accept')}</button>
          <button style="flex:1;background:#232a48;color:#eef0ff;border:0;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">✖ ${t('decline')}</button></div>`;
      const [ok, no] = el.querySelectorAll('button');
      ok.onclick = async () => {
        try {
          if (!(await Ver.ok())) { el.remove(); return; }
          await rpc('respond_invite', { p_id: inv.id, p_accept: true });
          if (!['turfrush', 'voxel', 'pitch', 'voxelstrike', 'bricks'].includes(inv.game)) await Net.join(inv.code);   // these games use their own rooms
          location.href = Invites.gameUrl(inv.game, inv.code, 2, inv.from);
        } catch (e) { el.textContent = e.message; setTimeout(() => el.remove(), 3000); }
      };
      no.onclick = async () => { try { await rpc('respond_invite', { p_id: inv.id, p_accept: false }); } catch (e) {} el.remove(); };
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 110000);
    }
  };

  // ---------- versions: apps older than the latest release (app_config.release in the database) can't play online ----------
  addStrings({
    ver_title: 'نسختك قديمة', ver_blocked: 'آسفين، مش هتقدر تلعب أونلاين بالنسخة دي ({v}). حدّث ملعب للنسخة {n} عشان تلعب مع أصحابك تاني.',
    ver_update: '⬆ حدّث دلوقتي', ver_later: 'بعدين', ver_btn: '⬆ تحديث', ver_short: 'نسختك قديمة — حدّث ملعب عشان تلعب أونلاين',
    ver_dl: 'بينزّل التحديث… التطبيق هيقفل ويفتح النسخة الجديدة لوحده.', ver_dlAndroid: 'بينزّل التحديث… لما يخلص الموبايل هيسألك تسطّبه (اسمح بالتسطيب لو سألك).',
    ver_dlLink: 'بيفتح لينك التحميل… سطّب النسخة الجديدة بعد ما تنزل.', ver_newApp: 'في نسخة جديدة من التطبيق بتتحدّث لوحدها بعد كده — نزّلها مرة واحدة بس.', ver_ok: 'عندك آخر نسخة ({v}) ✓', ver_fail: 'التحديث ما نجحش — جرّب تاني', ver_notes: 'الجديد:'
  }, {
    ver_title: 'Your version is old', ver_blocked: "Sorry, you can't play online with this version ({v}). Update Mal3ab to {n} to play with your friends again.",
    ver_update: '⬆ Update now', ver_later: 'Later', ver_btn: '⬆ Update', ver_short: 'Your version is old — update Mal3ab to play online',
    ver_dl: 'Downloading the update… the app will close and open the new version by itself.', ver_dlAndroid: 'Downloading the update… when it finishes your phone will ask to install it (allow it if asked).',
    ver_dlLink: 'Opening the download… install the new version once it finishes.', ver_newApp: 'A new version of the app is ready that updates itself from now on — download it just once.', ver_ok: 'You have the latest version ({v}) ✓', ver_fail: 'The update failed — try again', ver_notes: "What's new:"
  });
  const Ver = window.Mal3abVersion = {
    info: null, platform: null, app: null, legacy: false,
    cmp(a, b) { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d < 0 ? -1 : 1; } return 0; },
    // which app is this? (the website itself is always up to date)
    detect() {
      try { if (window.Mal3abNative && Mal3abNative.version) { Ver.platform = 'android'; Ver.app = String(Mal3abNative.version()); return; } } catch (e) {}
      if (window.MAL3AB_APP && MAL3AB_APP.version) { Ver.platform = MAL3AB_APP.platform || 'windows'; Ver.app = String(MAL3AB_APP.version); return; }
      const m = /Mal3abApp\/([\d.]+)/.exec(navigator.userAgent);   // first app builds: no updater inside
      if (m) { Ver.platform = /Android/i.test(navigator.userAgent) ? 'android' : 'windows'; Ver.app = m[1]; Ver.legacy = true; }
    },
    async load() { try { const { data } = await sb.from('app_config').select('value').eq('key', 'release').maybeSingle(); if (data && data.value) Ver.info = data.value; } catch (e) {} return Ver.info; },
    latest() { return Ver.info && Ver.info.latest; },
    current() { return Ver.app || window.MAL3AB_VERSION || '1.0'; },
    outdated() { return !!(Ver.app && Ver.latest() && Ver.cmp(Ver.app, Ver.latest()) < 0); },
    gate() { if (Ver.outdated()) { Ver.blocked(); return false; } return true; },              // instant check (release info already loaded)
    async ok() { if (!Ver.info) { await Promise.race([Ver.ready, new Promise(r => setTimeout(r, 4000))]); } return Ver.gate(); },
    url() { return Ver.info && (Ver.platform === 'android' ? Ver.info.apk : Ver.info.exe); },
    // download + install the new app (automatic in apps that have the updater; older builds get the download link)
    update(msgEl) {
      const u = Ver.url(), say = (k) => { if (msgEl) msgEl.textContent = t(k); };
      if (!u) return;
      try {
        if (Ver.platform === 'android' && window.Mal3abNative && Mal3abNative.update) { Mal3abNative.update(u); say('ver_dlAndroid'); return; }
        if (Ver.platform === 'windows' && typeof window.mal3abUpdate === 'function') {
          say('ver_dl'); Promise.resolve(window.mal3abUpdate(u)).then((r) => { if (r !== 'started' && r !== 'ok') Ver.updateFailed(r); }).catch((e) => Ver.updateFailed(e)); return;
        }
      } catch (e) {}
      say('ver_dlLink'); location.href = u;
    },
    // the app could not update itself (no write access to its folder, network…): fall back to a normal download
    updateFailed(why) { console.warn('update failed', why); document.querySelectorAll('.m3ver-msg').forEach(e => e.textContent = t('ver_fail')); const u = Ver.url(); if (u) setTimeout(() => { location.href = u; }, 1500); },
    progress(p) { document.querySelectorAll('.m3ver-msg').forEach(e => e.textContent = t('ver_dl') + ' ' + Math.round(p) + '%'); },   // called by the Windows app
    // the "sorry, update to play online" window
    blocked(soft) {
      document.querySelectorAll('.m3ver').forEach(e => e.remove());
      const ar = (window.getLang && getLang() === 'ar'), notes = Ver.info && (ar ? Ver.info.notes_ar : Ver.info.notes_en);
      const el = document.createElement('div'); el.className = 'm3ver';
      el.style.cssText = 'position:fixed;inset:0;z-index:100002;background:rgba(5,8,18,.7);display:flex;align-items:center;justify-content:center;padding:16px;font:15px Segoe UI,Tahoma,Arial,sans-serif';
      const outdated = Ver.outdated(), title = outdated ? t('ver_title') : t('ver_ok', { v: Ver.current() }), newApp = !outdated && Ver.legacy;
      el.innerHTML = `<div dir="${ar ? 'rtl' : 'ltr'}" style="background:#1a1f35;color:#eef0ff;border:2px solid #ffb703;border-radius:18px;padding:20px;width:min(440px,100%);display:flex;flex-direction:column;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)">
        <b style="font-size:20px;color:#ffb703">${outdated ? '⚠️ ' : ''}${title}</b>
        ${outdated ? `<div style="line-height:1.6">${t('ver_blocked', { v: Ver.current(), n: Ver.latest() })}</div>` : ''}
        ${newApp ? `<div style="line-height:1.6">${t('ver_newApp')}</div>` : ''}
        ${outdated && notes ? `<div style="color:#9aa3c7;font-size:13px;line-height:1.6"><b>${t('ver_notes')}</b> ${String(notes).replace(/[<>&]/g, '')}</div>` : ''}
        <div class="m3ver-msg" style="color:#80ed99;font-size:13px;min-height:1px"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${(outdated || newApp) && Ver.url() ? `<button data-v="up" style="flex:1;background:#ffb703;color:#1a1200;border:0;border-radius:10px;padding:11px;font-weight:800;cursor:pointer;font-size:15px">${t('ver_update')}</button>` : ''}
          ${soft !== 'hard' ? `<button data-v="x" style="flex:1;background:#232a48;color:#eef0ff;border:0;border-radius:10px;padding:11px;font-weight:700;cursor:pointer">${outdated ? t('ver_later') : 'OK'}</button>` : ''}
          ${soft === 'hard' ? `<button data-v="home" style="flex:1;background:#232a48;color:#eef0ff;border:0;border-radius:10px;padding:11px;font-weight:700;cursor:pointer">🏠 ${t('home').replace('← ', '')}</button>` : ''}
        </div></div>`;
      const msg = el.querySelector('.m3ver-msg');
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
        if (b.dataset.v === 'up') Ver.update(msg);
        else if (b.dataset.v === 'home') location.href = (location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '')) + 'play.html';
        else el.remove();
      });
      if (document.pointerLockElement) try { document.exitPointerLock(); } catch (e) {}
      (document.body || document.documentElement).appendChild(el);
    },
    // a new release came out while playing: cut every online connection and say why
    kick() {
      try { sb.removeAllChannels(); } catch (e) {}
      try { if (typeof net !== 'undefined' && net.reset && net.role) net.reset(); } catch (e) {}                   // Voxel Sandbox
      try { if (typeof friends !== 'undefined' && friends.peer) { friends.peer.destroy(); friends.peer = null; } } catch (e) {}
      document.dispatchEvent(new Event('mal3ab-outdated'));
      Ver.blocked('hard');
    }
  };
  Ver.detect();
  Ver.ready = Ver.load().then(() => {
    // a game page opened straight into an online match (invite link) with an old app: stop right away
    if (Ver.outdated() && /[?&](code|room|join|pvp|joinFriend)=/.test(location.search) && !/play\.html/.test(location.pathname)) Ver.kick();
  });
  setInterval(async () => { const was = Ver.outdated(); await Ver.load(); if (!was && Ver.outdated()) Ver.kick(); }, 5 * 60 * 1000);

  // ---------- rooms ----------
  window.Net = {
    async create(game, state) {
      if (!(await Ver.ok())) throw new Error(t('ver_short'));
      const name = Auth.name() || null, id = Auth.user ? Auth.user.id : null;
      for (let i = 0; i < 6; i++) {
        const code = randCode();
        const { error } = await sb.from('rooms').insert({ code, game, state: state || {}, players: 1, p1_name: name, p1_id: id });
        if (!error) return code;
      }
      throw new Error(t('roomFail'));
    },
    async join(code) {
      if (!(await Ver.ok())) throw new Error(t('ver_short'));
      code = (code || '').trim().toUpperCase();
      const { data, error } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
      if (error || !data) throw new Error(t('codeMissing'));
      if (data.players >= 2) throw new Error(t('roomFull'));
      await sb.from('rooms').update({ players: 2, p2_name: Auth.name() || null, p2_id: Auth.user ? Auth.user.id : null }).eq('code', code);
      data.players = 2;
      return data;
    },
    async get(code) {
      const { data } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
      return data;
    },
    async push(code, state) {
      await sb.from('rooms').update({ state, updated_at: new Date().toISOString() }).eq('code', code);
    },
    watch(code, cb) {
      let last = '';
      const emit = (room) => {
        if (!room) return;
        const s = JSON.stringify([room.state, room.players, room.p1_name, room.p2_name]);
        if (s === last) return;
        last = s; cb(room);
      };
      const ch = sb.channel('room-' + code)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'code=eq.' + code }, p => emit(p.new))
        .subscribe();
      const timer = setInterval(async () => emit(await Net.get(code)), 2000);
      return () => { sb.removeChannel(ch); clearInterval(timer); };
    },
    inviteLink(code) {
      const base = location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '');
      return base + 'play.html?join=' + code;
    }
  };
  // Channel Connect (friend chat) on every page that has net.js
  if (NET_SRC && !window.Chat && !document.querySelector('script[data-m3chat]')) {
    const c = document.createElement('script'); c.src = NET_SRC.replace(/net\.js(\?.*)?$/, 'chat.js$1'); c.dataset.m3chat = '1';
    (document.head || document.documentElement).appendChild(c);
  }
})();
