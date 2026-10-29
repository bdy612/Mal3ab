// Mal3ab — Supabase client, online rooms and accounts (project: Mal3ab Games)
(function () {
  const SUPABASE_URL = 'https://asycvzvkvukjamwrekwi.supabase.co';
  const SUPABASE_KEY = 'sb_publishable__JmGIFTBou_J9g1YPq-7Ng_Z3C9lihm';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
      setInterval(() => { if (Auth.token) sb.rpc('touch', { p_token: Auth.token }).then(({ data }) => { if (data === false) Auth.signOut(); }); }, 5 * 60 * 1000);
      return Auth.user;
    },
    _set(profile) {
      Auth.profile = profile || null;
      Auth.user = profile ? { id: profile.id } : null;
      document.dispatchEvent(new Event('authchange'));
    },
    _session(res) {
      Auth.token = res.token; try { localStorage.setItem(TOKEN_KEY, res.token); } catch (e) {}
      Auth._set(res.profile);
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
        await sb.from('matches').insert(r);   // duplicate (code, game_no) from the other player is ignored
      }
    },
    async mine() {
      if (!Auth.user) return History.local();
      const { data } = await sb.from('matches').select('*').or(`p1_id.eq.${Auth.user.id},p2_id.eq.${Auth.user.id}`).order('finished_at', { ascending: false }).limit(200);
      return data || [];
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
      return base + 'index.html?join=' + code;
    }
  };
})();
