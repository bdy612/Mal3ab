// Mal3ab — online rooms on Supabase (project: Mal3ab Games)
(function () {
  const SUPABASE_URL = 'https://asycvzvkvukjamwrekwi.supabase.co';
  const SUPABASE_KEY = 'sb_publishable__JmGIFTBou_J9g1YPq-7Ng_Z3C9lihm';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function randCode() {
    let s = '';
    for (let i = 0; i < 4; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    return s;
  }

  window.Net = {
    // Player 1 creates a room. Returns the 4-letter code.
    async create(game, state) {
      for (let i = 0; i < 6; i++) {
        const code = randCode();
        const { error } = await sb.from('rooms').insert({ code, game, state: state || {}, players: 1 });
        if (!error) return code;
      }
      throw new Error('مقدرتش أعمل غرفة، جرّب تاني');
    },

    // Player 2 joins with a code. Returns the room row.
    async join(code) {
      code = (code || '').trim().toUpperCase();
      const { data, error } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
      if (error || !data) throw new Error('الكود ده مش موجود');
      if (data.players >= 2) throw new Error('الغرفة مليانة');
      await sb.from('rooms').update({ players: 2 }).eq('code', code);
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

    // Calls cb(room) on every change (realtime + polling fallback). Returns an unsubscribe fn.
    watch(code, cb) {
      let last = '';
      const emit = (room) => {
        if (!room) return;
        const s = JSON.stringify([room.state, room.players]);
        if (s === last) return;
        last = s;
        cb(room);
      };
      const ch = sb.channel('room-' + code)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'code=eq.' + code },
          (p) => emit(p.new))
        .subscribe();
      const timer = setInterval(async () => emit(await Net.get(code)), 2000);
      return () => { sb.removeChannel(ch); clearInterval(timer); };
    }
  };
})();
