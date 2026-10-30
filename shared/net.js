// Mal3ab — Supabase client, online rooms and accounts (project: Mal3ab Games)
(function () {
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
    invite: (toId, game, code) => rpc('send_invite', { p_to: toId, p_game: game, p_code: code }),
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

  // ---------- rooms ----------
  window.Net = {
    async create(game, state) {
      const name = Auth.name() || null, id = Auth.user ? Auth.user.id : null;
      for (let i = 0; i < 6; i++) {
        const code = randCode();
        const { error } = await sb.from('rooms').insert({ code, game, state: state || {}, players: 1, p1_name: name, p1_id: id });
        if (!error) return code;
      }
      throw new Error(t('roomFail'));
    },
    async join(code) {
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
})();
