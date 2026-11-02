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
  // ---------- players: IDs (#100001), search, tags, blocks, reports and feature ideas (all in the database) ----------
  window.Players = {
    find: (q) => rpc('find_players', { p_query: q }),
    card: (id) => rpc('player_card', { p_id: id }),
    block: (id, on) => rpc('block_set', { p_target: id, p_on: !!on }),
    threads: () => rpc('chat_threads'),
    report: (body, category, target) => rpc('feedback_send', { p_kind: 'report', p_body: body, p_category: category || null, p_target: target || null }),
    idea: (body, category) => rpc('feedback_send', { p_kind: 'feature', p_body: body, p_category: category || null }),
    mine: () => rpc('my_feedback'),
    askTag: (tag, proof) => rpc('tag_request', { p_tag: tag, p_proof: proof })
  };
  // games can report a best score (or a best time with lowerBetter): #1 on any game earns the 🏆 Best tag
  window.Mal3abBest = (game, score, lowerBetter) => { if (Auth.token && isFinite(score)) rpc('report_best', { p_game: game, p_score: score, p_lower_better: !!lowerBetter }).catch(() => {}); };
  addStrings({
    tag_owner: '👑 المالك', tag_admin: '🛡️ أدمن', tag_famous: '⭐ مشهور', tag_youtuber: '▶️ يوتيوبر', tag_vip: '💎 VIP', tag_big: '🔥 لاعب نشيط', tag_best: '🏆 الأفضل', tag_boards: 'ألعاب البورد',
    tag_ownerD: 'صاحب ملعب', tag_adminD: 'من فريق الأدمن', tag_famousD: 'معروف على السوشيال ميديا (متأكد منه الأدمن)', tag_youtuberD: 'يوتيوبر (متأكد منه الأدمن)', tag_vipD: 'شخص معروف (متأكد منه الأدمن)',
    tag_bigD: 'بيلعب كتير (10 أيام أو 100 ماتش)', tag_bestD: 'رقم 1 في لعبة: {g}',
    err_wait: 'استنى لما يرد عليك الأول (5 رسايل بس لحد ما يرد)', err_blockedMe: 'اللاعب ده مش بيستقبل رسايل منك', err_iBlocked: 'إنت عامل بلوك للاعب ده', err_noPlayer: 'مفيش لاعب بالاسم أو الـ ID ده', err_slow: 'براحة شوية — جرب كمان دقيقة'
  }, {
    tag_owner: '👑 Owner', tag_admin: '🛡️ Admin', tag_famous: '⭐ Famous', tag_youtuber: '▶️ YouTuber', tag_vip: '💎 VIP', tag_big: '🔥 Big User', tag_best: '🏆 Best', tag_boards: 'Board games',
    tag_ownerD: 'Owner of Mal3ab', tag_adminD: 'On the admin team', tag_famousD: 'Known on social media (checked by the admins)', tag_youtuberD: 'A YouTuber (checked by the admins)', tag_vipD: 'A well-known person (checked by the admins)',
    tag_bigD: 'Plays a lot (10 days or 100 matches)', tag_bestD: 'Number 1 in: {g}',
    err_wait: 'Wait for a reply first (only 5 messages until they answer)', err_blockedMe: "This player isn't taking messages from you", err_iBlocked: 'You blocked this player', err_noPlayer: 'No player with that name or ID', err_slow: 'Slow down a bit — try again in a minute'
  });
  const TAGC = { owner: ['#ffb703', '#1a1200'], admin: ['#8ea0ff', '#0b1033'], famous: ['#ff6fb5', '#2b0018'], youtuber: ['#ff3b3b', '#fff'], vip: ['#b17cff', '#16052e'], big: ['#ff8c42', '#2a1000'], best: ['#ffd166', '#2a1d00'] };
  const gameName = (k) => k === 'boards' ? t('tag_boards') : (window.t && t(k) !== k ? t(k) : k);
  // tags → little badges (title = what the tag means)
  window.Mal3abTags = (tags, small) => (tags || []).map(x => {
    const c = TAGC[x.tag]; if (!c) return '';
    const games = (x.games || []).map(gameName), sep = window.getLang && getLang() === 'ar' ? '، ' : ', ';
    const label = t('tag_' + x.tag) + (x.tag === 'best' && games.length ? ' · ' + games.slice(0, 2).join(sep) + (games.length > 2 ? ' +' + (games.length - 2) : '') : '');
    const tip = x.tag === 'best' ? t('tag_bestD', { g: games.join(sep) }) : t('tag_' + x.tag + 'D');
    return `<span class="m3tag" title="${tip.replace(/"/g, '')}" style="display:inline-flex;align-items:center;gap:3px;background:${c[0]};color:${c[1]};border-radius:999px;padding:${small ? '1px 7px' : '3px 10px'};font:800 ${small ? 11 : 12.5}px/1.4 system-ui,'Segoe UI',Tahoma,sans-serif;white-space:nowrap;margin:1px 2px;vertical-align:middle;unicode-bidi:isolate">${label}</span>`;
  }).join('');
  // server error → friendly text
  window.Mal3abErr = (e) => {
    const m = String((e && e.message) || e || '');
    return /wait for a reply/.test(m) ? t('err_wait') : /not taking messages/.test(m) ? t('err_blockedMe') : /you blocked/.test(m) ? t('err_iBlocked')
      : /no player with/.test(m) ? t('err_noPlayer') : /slow down/.test(m) ? t('err_slow') : m;
  };
  const ROOT = () => location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '');
  window.Invites = {
    gameUrl(game, code, p, name) {
      if (Invites.isLink(code)) return ROOT() + code;   // games with their own rooms: the inviter's room link (relative to the site)
      if (game === 'turfrush') return `${ROOT()}games/turf-rush.html?join=${code}`;
      if (game === 'pitch') return `${ROOT()}games/pitch-legends/index.html?pvp=${code}`;
      if (game === 'voxelstrike') return `${ROOT()}games/voxel-strike/index.html?room=${code}`;
      if (game === 'bricks') return `${ROOT()}games/brick-builder/index.html?room=${code}`;
      if (game === 'voxel') return `${ROOT()}games/voxel/index.html?joinFriend=${encodeURIComponent(code)}&fname=${encodeURIComponent(name || '')}`;
      return `${ROOT()}games/${game}.html?code=${code}&p=${p}`;
    },
    isLink: (code) => /^games\/[a-z0-9\/-]+\.html\?[\w=&%.-]+$/i.test(String(code || '')),
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
      if (!names[inv.game] && /^[a-z0-9]+$/.test(inv.game || '') && t(inv.game) !== inv.game) names[inv.game] = t(inv.game);
      el.innerHTML = `⚡ <b style="color:#ffb703">${inv.from}</b> ${t('invitesYou')} <b>${names[inv.game] || inv.game}</b>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button style="flex:1;background:#80ed99;color:#062b12;border:0;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">✅ ${t('accept')}</button>
          <button style="flex:1;background:#232a48;color:#eef0ff;border:0;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">✖ ${t('decline')}</button></div>`;
      const [ok, no] = el.querySelectorAll('button');
      ok.onclick = async () => {
        try {
          if (!(await Ver.ok())) { el.remove(); return; }
          await rpc('respond_invite', { p_id: inv.id, p_accept: true });
          if (!Invites.isLink(inv.code) && !['turfrush', 'voxel', 'pitch', 'voxelstrike', 'bricks'].includes(inv.game)) await Net.join(inv.code);   // these games use their own rooms
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
  // 🏠 + 💬 inside game popups (start level, pause, game over…): any element marked data-m3pop gets both buttons
  // (data-m3pop="top" puts them at the top of the popup instead of the bottom)
  (function popButtons() {
    const ROOT = NET_SRC ? NET_SRC.replace(/shared\/net\.js.*$/, '') : location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '');
    const css = document.createElement('style');
    css.textContent = `div.m3pop{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin:12px 0 0;padding:0;pointer-events:auto;width:auto;position:static}div.m3pop.top{margin:0 0 12px}
      div.m3pop>.m3pb{display:inline-flex;align-items:center;gap:6px;font:700 14px/1 system-ui,'Segoe UI',Tahoma,sans-serif;padding:9px 14px;margin:0;border-radius:12px;border:2px solid rgba(255,255,255,.18);
        background:rgba(15,18,32,.75);color:#eef0ff;text-decoration:none;cursor:pointer;text-transform:none;letter-spacing:0;min-width:0;width:auto;height:auto;flex:0 0 auto;box-shadow:none;text-shadow:none;image-rendering:auto}
      div.m3pop>.m3pb:hover{border-color:#ffb703;color:#ffb703}`;
    (document.head || document.documentElement).appendChild(css);
    const label = () => ({ home: getLang() === 'ar' ? 'الرئيسية' : 'Home', chat: getLang() === 'ar' ? 'الشات' : 'Chat' });
    const bar = (top) => { const d = document.createElement('div'); d.className = 'm3pop' + (top ? ' top' : ''); const L = label();
      d.innerHTML = `<a class="m3pb" data-m3home href="${ROOT}play.html">🏠 <span>${L.home}</span></a><button type="button" class="m3pb" data-mal3ab-chat>💬 <span>${L.chat}</span></button>`;
      for (const ev of ['mousedown', 'pointerdown', 'touchstart', 'click']) d.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });   // the game behind must not react
      return d; };
    const fill = () => document.querySelectorAll('[data-m3pop]').forEach(el => {
      if ([...el.children].some(c => c.classList && c.classList.contains('m3pop'))) return;
      const top = el.getAttribute('data-m3pop') === 'top', b = bar(top); top ? el.insertBefore(b, el.firstChild) : el.appendChild(b);
    });
    const relabel = () => { const L = label(); document.querySelectorAll('.m3pop').forEach(d => { const s = d.querySelectorAll('span'); s[0].textContent = L.home; s[1].textContent = L.chat; }); };
    let q = 0; const soon = () => { if (!q) q = requestAnimationFrame(() => { q = 0; fill(); }); };
    const start = () => { fill(); new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-m3pop'] }); };
    document.body ? start() : document.addEventListener('DOMContentLoaded', start);
    document.addEventListener('langchange', relabel);
    window.Mal3abPopButtons = fill;   // games can call it right after drawing a popup
  })();
  // 🔴 live games: a game page that is in an online room right now shows up on that game's page (game.html) so others can join or watch.
  // Games can add details with window.Mal3abLiveInfo = () => ({ players, max, watch: <link to watch>, hidden: true to stay private })
  (function liveRooms() {
    const m = location.pathname.match(/\/games\/([^/]+)\//) || location.pathname.match(/\/games\/([^/.]+)\.html/), key = m && m[1];
    const ROOM = /[?&](room|code|join|joinFriend)=/, id = Math.random().toString(36).slice(2, 10);
    let ch = null, sent = '', busy = false;
    async function tick() {
      if (!key || busy) return; busy = true;
      try {
        let link = ''; try { const r = window.Mal3abShareLink && window.Mal3abShareLink(); link = typeof r === 'string' ? r : (r && r.link) || ''; } catch (e) {}
        let info = {}; try { info = (window.Mal3abLiveInfo && window.Mal3abLiveInfo()) || {}; } catch (e) {}
        const on = !!link && ROOM.test(link) && !info.hidden;
        if (!on) { if (ch && sent) { ch.untrack(); sent = ''; } return; }
        const p = { link, host: Auth.name() || '…', uid: Auth.user ? Auth.user.id : null, players: info.players || null, max: info.max || null, watch: info.watch || null, since: Date.now() };
        const sig = JSON.stringify(Object.assign({}, p, { since: 0 }));
        if (!ch) { ch = sb.channel('live-' + key, { config: { presence: { key: id } } }); await new Promise(res => { ch.subscribe(st => { if (st === 'SUBSCRIBED') res(); }); setTimeout(res, 6000); }); }
        if (sig !== sent) { sent = sig; await ch.track(p); }
      } catch (e) {} finally { busy = false; }
    }
    if (key) { setTimeout(tick, 3000); setInterval(tick, 6000); }
    window.Mal3abLive = {
      // the game page listens: cb(list of rooms) whenever someone starts, changes or leaves a room
      watch(k, cb) { const c = sb.channel('live-' + k, { config: { presence: { key: 'w' + Math.random().toString(36).slice(2, 8), enabled: true } } });
        const emit = () => cb(Object.values(c.presenceState()).map(a => a[0]).filter(r => r && r.link));
        c.on('presence', { event: 'sync' }, emit).subscribe(); return () => { try { sb.removeChannel(c); } catch (e) {} }; }
    };
  })();
  // ⏪ continued games: left an online room by accident (closed the tab / app) → 120 s to jump back in;
  // left on purpose (🏠, leaving the room) or already knocked out (Mal3abLiveInfo().out) → 60 s. Every Mal3ab page shows the offer.
  (function rejoin() {
    const LS = 'mal3ab-rejoin', ROOM = /[?&](room|code|join|joinFriend)=/, onGame = /\/games\//.test(location.pathname);
    const read = () => { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { return null; } };
    const write = (v) => { try { v ? localStorage.setItem(LS, JSON.stringify(v)) : localStorage.removeItem(LS); } catch (e) {} };
    const limit = (r) => (r.meant || r.out ? 60 : 120) * 1000;
    // coming back through the offer: give the game its old per-room ids (sessionStorage) so it takes back the same seat
    if (/[?&]m3rejoin=1/.test(location.search)) {
      const r = read();
      if (r && r.ss && r.path === location.pathname) for (const k in r.ss) { try { sessionStorage.setItem(k, r.ss[k]); } catch (e) {} }
      write(null);
      try { history.replaceState(history.state, '', location.href.replace(/([?&])m3rejoin=1&?/, '$1').replace(/[?&]$/, '')); } catch (e) {}
    }
    let cur = null, meant = false;
    if (onGame) {
      const snap = () => { const o = {}; let n = 0; try { for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i), v = sessionStorage.getItem(k); if (v && v.length < 400 && (n += v.length) < 6000) o[k] = v; } } catch (e) {} return o; };
      const tick = () => {
        let link = ''; try { const r = window.Mal3abShareLink && window.Mal3abShareLink(); link = typeof r === 'string' ? r : (r && r.link) || ''; } catch (e) {}
        let info = {}; try { info = (window.Mal3abLiveInfo && window.Mal3abLiveInfo()) || {}; } catch (e) {}
        if (link && ROOM.test(link)) {
          cur = { link, path: location.pathname, title: (document.title || '').replace(/\s*[—|-]\s*(Mal3ab|ملعب).*$/i, '').trim(), out: !!info.out, ss: snap(), t: Date.now() };
          write(cur); meant = false;
        } else if (cur) { write(Object.assign({}, cur, { left: Date.now(), meant: true })); cur = null; }   // left the room but stayed on the page
      };
      setTimeout(tick, 2500); setInterval(tick, 2500);
      // a click on 🏠 / back to the hub = leaving on purpose
      document.addEventListener('click', (e) => { const a = e.target && e.target.closest && e.target.closest('[data-mal3ab-home],[data-m3home],a[href*="play.html"],a[href*="index.html"]'); if (a) meant = true; }, true);
      addEventListener('pagehide', () => { if (cur) write(Object.assign({}, cur, { left: Date.now(), meant: meant || cur.out })); });
    }
    // the offer
    let box = null, timer = 0;
    const L = (ar, en) => (window.getLang && getLang() === 'ar' ? ar : en);
    function show() {
      const r = read(); clearTimeout(timer);
      const left = r && r.link ? (r.left || (Date.now() - r.t > 9000 ? r.t : 0)) : 0;      // no "left" stamp but silent for 9 s = the app was killed
      const here = cur && r && cur.link === r.link;
      const remain = left ? limit(r) - (Date.now() - left) : 0;
      if (!r || !left || here || remain <= 0) { if (box) box.remove(); box = null; if (r && left && remain <= 0) write(null); if (r && !left) timer = setTimeout(show, 3000); return; }
      if (!box) {
        box = document.createElement('div'); box.className = 'm3rejoin';
        const css = document.createElement('style');
        css.textContent = `.m3rejoin{position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;
          background:rgba(15,18,32,.96);color:#eef0ff;border:2px solid #ffb703;border-radius:16px;padding:10px 14px;font:600 15px/1.3 system-ui,'Segoe UI',Tahoma,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);max-width:calc(100vw - 24px)}
          .m3rejoin b{color:#ffb703;unicode-bidi:plaintext}.m3rejoin a,.m3rejoin button{font:700 14px/1 inherit;border-radius:10px;padding:9px 14px;cursor:pointer;border:0;text-decoration:none}
          .m3rejoin a{background:#ffb703;color:#111}.m3rejoin button{background:rgba(255,255,255,.12);color:#eef0ff}.m3rejoin .s{font-variant-numeric:tabular-nums;opacity:.8}`;
        box.appendChild(css); box.appendChild(document.createElement('span'));
        const go = document.createElement('a'); go.href = r.link + (r.link.includes('?') ? '&' : '?') + 'm3rejoin=1'; box.appendChild(go);
        const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕'; x.onclick = () => { write(null); box.remove(); box = null; }; box.appendChild(x);
        (document.body || document.documentElement).appendChild(box);
      }
      const s = Math.ceil(remain / 1000);
      box.children[1].innerHTML = L('⏪ كنت بتلعب <b></b> — ترجع؟ ', '⏪ You were playing <b></b> — jump back in? ') + `<span class="s">${s}${L(' ث', 's')}</span>`;
      box.children[1].querySelector('b').textContent = r.title || L('لعبة أونلاين', 'an online game');
      box.children[2].textContent = L('▶ ارجع', '▶ Rejoin');
      timer = setTimeout(show, 1000);
    }
    const start = () => setTimeout(show, 600);
    document.body ? start() : document.addEventListener('DOMContentLoaded', start);
    addEventListener('storage', (e) => { if (e.key === LS) show(); });
    window.Mal3abRejoin = { clear() { write(null); cur = null; if (box) { box.remove(); box = null; } }, peek: read };
  })();
  // ⚡ fast connect from the hub for games with their own rooms: the hub opens the game with ?m3invite=<friend>,
  // the game makes its room (Mal3abPrepareInvite) and the invite carries that room's link
  (function fastInvite() {
    const q = new URLSearchParams(location.search), to = q.get('m3invite'); if (!to) return;
    const fname = q.get('m3name') || '', game = q.get('m3game') || '';
    try { const u = new URL(location.href); ['m3invite', 'm3name', 'm3game'].forEach(k => u.searchParams.delete(k)); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch (e) {}
    const L = (ar, en) => (window.getLang && getLang() === 'ar' ? ar : en);
    let el = null;
    const say = (html, ms) => {
      if (!el) { el = document.createElement('div'); el.style.cssText = 'position:fixed;left:50%;top:max(12px,env(safe-area-inset-top));transform:translateX(-50%);z-index:99999;background:rgba(15,18,32,.96);color:#eef0ff;border:2px solid #ffb703;border-radius:14px;padding:10px 14px;font:600 15px/1.35 system-ui,Segoe UI,Tahoma,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);max-width:calc(100vw - 24px);display:flex;gap:10px;align-items:center'; (document.body || document.documentElement).appendChild(el); }
      el.innerHTML = html; if (ms) setTimeout(() => { if (el) { el.remove(); el = null; } }, ms);
    };
    const nm = () => `<b style="color:#ffb703;unicode-bidi:plaintext">${String(fname).replace(/[&<>"]/g, '')}</b>`;
    const wait = (ok, ms) => new Promise(res => { const t0 = Date.now(); (function w() { if (ok()) return res(true); if (Date.now() - t0 > ms) return res(false); setTimeout(w, 300); })(); });
    (async () => {
      say(L('⏳ بيجهّز الأوضة…', '⏳ Making the room…'));
      await wait(() => document.readyState === 'complete' && window.Auth && Auth.token && typeof window.Mal3abPrepareInvite === 'function', 15000);
      await new Promise(r => setTimeout(r, 900));      // let the game finish starting
      let link = ''; try { const r = await window.Mal3abPrepareInvite(); link = typeof r === 'string' ? r : (r && r.link) || ''; } catch (e) {}
      const rel = link.replace(/^.*?\/(games\/)/, '$1');
      if (!Invites.isLink(rel)) { say(L('مقدرناش نعمل أوضة — اعزمه من جوه اللعبة', "Couldn't make a room — invite them from inside the game"), 5000); return; }
      let id; try { id = await Friends.invite(to, game, rel); } catch (e) { say(String(e.message || e), 5000); return; }
      let done = false;
      say(`⏳ ${L('مستني', 'Waiting for')} ${nm()}${L(' يقبل…', ' to accept…')}<button style="background:rgba(255,255,255,.12);color:#eef0ff;border:0;border-radius:9px;padding:6px 10px;cursor:pointer;font:inherit">✕</button>`);
      el.querySelector('button').onclick = () => { done = true; if (el) { el.remove(); el = null; } };
      while (!done) {
        await new Promise(r => setTimeout(r, 2500)); if (done) break;
        let st = ''; try { st = await Friends.inviteStatus(id); } catch (e) {}
        if (st === 'accepted') { done = true; say(`✅ ${nm()} ${L('قبل — جاي دلوقتي', 'accepted — on the way')}`, 4000); }
        else if (st === 'declined') { done = true; say(`✖ ${nm()} ${L('رفض العزومة', 'declined')}`, 5000); }
      }
    })();
  })();
  // Channel Connect (friend chat) on every page that has net.js
  if (NET_SRC && !window.Chat && !document.querySelector('script[data-m3chat]')) {
    const c = document.createElement('script'); c.src = NET_SRC.replace(/net\.js(\?.*)?$/, 'chat.js$1'); c.dataset.m3chat = '1';
    (document.head || document.documentElement).appendChild(c);
  }
})();
