// Mal3ab — shared game shell: local vs online mode, turns, names, status bar, result recording.
// Usage: Shell.start({ title:'chess', newState(){...}, render(){...}, extraButtons:'<html>' })
// Then use S.state, S.me, S.myTurn(), S.commit(), S.reset(), S.names
window.Shell = {
  async start(opts) {
    await Auth.init();
    const q = new URLSearchParams(location.search);
    // opened from the games page with no mode chosen yet: pick online / vs bot / same device (and the clock) here
    if (!q.get('code') && !q.get('bot') && !q.get('local')) { Shell.startMenu(opts); return null; }
    const S = {
      mode: q.get('bot') ? 'bot' : q.get('code') ? 'online' : 'local',
      bot: q.get('bot') || null,                 // easy | medium | hard (you are player 1, the computer is player 2)
      code: (q.get('code') || '').toUpperCase(),
      me: +(q.get('p') || 1),
      players: 1, state: null, names: { 1: '', 2: '' }, opts, recorded: false, gameNo: 1
    };
    window.S = S;

    S.myTurn = () => S.mode === 'local' || S.state.turn === S.me;
    S.ready = () => S.mode !== 'online' || S.players >= 2;
    S.versus = () => S.mode !== 'local';         // "your turn / their turn" wording
    // the computer answers after a short pause
    S.botTurn = () => {
      if (S.mode !== 'bot' || !S.state || S.state.winner || S.state.turn !== 2 || !opts.botMove || S._thinking) return;
      S._thinking = true;
      setTimeout(() => { S._thinking = false; if (S.state.turn === 2 && !S.state.winner) opts.botMove(S.bot); }, 450);
    };
    S.name = (p) => S.names[p] || t('player', { n: p });
    S.commit = async () => {
      opts.render(); Shell.status(); Shell.maybeRecord(); S.botTurn();
      if (S.mode === 'online') await Net.push(S.code, S.state);
    };
    S.reset = () => { S.gameNo++; S.state = opts.newState(); S.state.gameNo = S.gameNo; S.recorded = false; S.commit(); };

    if (S.mode === 'online') {
      const room = await Net.get(S.code);
      if (!room) { alert(t('roomMissing')); location.href = '../play.html'; return; }
      S.players = room.players;
      S.names = { 1: room.p1_name || '', 2: room.p2_name || '' };
      S.state = room.state && room.state.turn ? room.state : null;
      if (!S.state) { S.state = opts.newState(); await Net.push(S.code, S.state); }
      Net.watch(S.code, (r) => {
        S.players = r.players;
        S.names = { 1: r.p1_name || '', 2: r.p2_name || '' };
        if (r.state && r.state.turn) { S.state = r.state; if (r.state.gameNo && r.state.gameNo !== S.gameNo) { S.gameNo = r.state.gameNo; S.recorded = false; } }
        opts.render(); Shell.status(); Shell.maybeRecord();
        if (opts.onUpdate) opts.onUpdate();
      });
    } else if (S.mode === 'bot') {
      S.state = opts.newState();
      S.names = { 1: Auth.name() || t('player', { n: 1 }), 2: '🤖 ' + t('botName') + ' (' + t(S.bot) + ')' };
    } else {
      S.state = opts.newState();
      S.names = { 1: t('player', { n: 1 }), 2: t('player', { n: 2 }) };
    }

    Shell.buildBar(opts);
    opts.render();
    Shell.status();
    document.addEventListener('langchange', () => { Shell.buildBar(opts); opts.render(); Shell.status(); });
    return S;
  },

  // ---------- how do you want to play? ----------
  startMenu(opts) {
    const game = location.pathname.split('/').pop().replace('.html', ''), clock = game === 'chess';
    let pref = {}; try { pref = JSON.parse(localStorage.getItem('mal3ab-menu-' + game) || '{}'); } catch (e) {}
    const sel = (id, vals, cur, fmt) => `<select id="${id}">${vals.map(v => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${fmt(v)}</option>`).join('')}</select>`;
    const draw = () => {
      document.querySelectorAll('.topbar, #status, .startmenu').forEach(e => e.remove());
      const el = document.createElement('div'); el.className = 'startmenu';
      el.innerHTML = `<div class="smbox">
        <div class="smhead"><a class="btn small secondary" href="../play.html">${t('home')}</a><h2>${t(opts.title)}</h2>${langButton()}</div>
        <p class="smq">${t('smChoose')}</p>
        ${clock ? `<div class="smclock"><span>${t('timeControl')}</span>${sel('smTc', [0, 1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90], pref.tc != null ? pref.tc : 10, v => v ? v + ' ' + t('min') : t('noClock'))}
          <span>+</span>${sel('smInc', [0, 1, 2, 3, 5, 10, 15, 20, 30], pref.inc || 0, v => v + ' ' + t('sec'))}</div>` : ''}
        <div class="smopt"><div class="smico">🌐</div><div class="smbody"><b>${t('online')}</b><small>${t('smOnlineDesc')}</small>
          ${Auth.name() ? '' : `<input id="smName" class="text" placeholder="${t('username')}">`}
          <div class="smrow"><button class="btn" id="smCreate">${t('smCreate')}</button></div>
          <div class="smrow"><input id="smCode" class="text" maxlength="4" placeholder="ABCD"><button class="btn secondary" id="smJoin">${t('enterRoom')}</button></div></div></div>
        ${opts.botMove ? `<div class="smopt"><div class="smico">🤖</div><div class="smbody"><b>${t('vsBot')}</b><small>${t('smBotDesc')}</small>
          <div class="smrow">${sel('smLvl', ['easy', 'medium', 'hard'], pref.lvl || 'medium', v => t(v))}<button class="btn" id="smBot">▶ ${t('play')}</button></div></div></div>` : ''}
        <div class="smopt"><div class="smico">👥</div><div class="smbody"><b>${t('sameDevice')}</b><small>${t('smLocalDesc')}</small>
          <div class="smrow"><button class="btn secondary" id="smLocal">▶ ${t('play')}</button></div></div></div>
        <div class="msg" id="smMsg"></div></div>`;
      document.body.prepend(el);
      const $ = (id) => document.getElementById(id), msg = $('smMsg');
      const clk = () => clock ? `&tc=${$('smTc').value}&inc=${$('smInc').value}` : '';
      const save = () => { try { localStorage.setItem('mal3ab-menu-' + game, JSON.stringify({ tc: clock ? +$('smTc').value : undefined, inc: clock ? +$('smInc').value : undefined, lvl: $('smLvl') ? $('smLvl').value : pref.lvl })); } catch (e) {} };
      const named = () => { if (Auth.name()) return true; const n = ($('smName') && $('smName').value.trim()) || ''; if (!n) { msg.textContent = t('username') + '?'; $('smName') && $('smName').focus(); return false; } Auth.setGuestName(n); return true; };
      $('smCreate').onclick = async () => { if (!named()) return; save(); msg.textContent = t('creating'); try { const code = await Net.create(game, {}); location.href = `${game}.html?code=${code}&p=1${clk()}`; } catch (e) { msg.textContent = e.message; } };
      $('smJoin').onclick = async () => { const c = $('smCode').value.trim().toUpperCase(); if (c.length < 4) { msg.textContent = t('codeHint'); return; } if (!named()) return; msg.textContent = t('joining');
        try { const room = await Net.join(c); location.href = `${room.game}.html?code=${room.code}&p=2`; } catch (e) { msg.textContent = e.message; } };
      $('smCode').onkeydown = (e) => { if (e.key === 'Enter') $('smJoin').click(); };
      if ($('smBot')) $('smBot').onclick = () => { save(); location.href = `${game}.html?bot=${$('smLvl').value}${clk()}`; };
      $('smLocal').onclick = () => { save(); location.href = `${game}.html?local=1${clk()}`; };
      window.Mal3abPrepareInvite = async () => { if (!named()) return null; save(); const code = await Net.create(game, {}); return { link: Net.inviteLink(code), go: () => { location.href = `${game}.html?code=${code}&p=1${clk()}`; } }; };
    };
    draw(); document.addEventListener('langchange', draw);
  },

  buildBar(opts) {
    document.querySelectorAll('.topbar, #status').forEach(e => e.remove());
    const bar = document.createElement('div');
    bar.className = 'topbar';
    bar.innerHTML = `
      <a class="back" href="../play.html">${t('home')}</a>
      <div class="title">${t(opts.title)}</div>
      <div class="room"></div>
      ${opts.extraButtons || ''}
      <button class="btn small secondary" data-mal3ab-chat title="Chat">💬</button>
      <a class="btn small secondary" href="${location.pathname.split('/').pop()}" title="${t('smChoose')}">☰</a>
      <button class="btn small" onclick="S.reset()">${t('newGame')}</button>
      ${langButton()}`;
    document.body.prepend(bar);
    const st = document.createElement('div');
    st.className = 'status'; st.id = 'status';
    bar.after(st);
  },

  copy(text, btn) {
    navigator.clipboard.writeText(text).then(() => { const o = btn.textContent; btn.textContent = t('copied'); setTimeout(() => btn.textContent = o, 1200); });
  },

  status(extra) {
    if (extra !== undefined) Shell._extra = extra;
    extra = Shell._extra;
    const S = window.S, st = document.getElementById('status'), room = document.querySelector('.topbar .room');
    if (!st || !S.state) return;
    window.Mal3abShareLink = () => S.mode === 'online' && S.code ? Net.inviteLink(S.code) : location.href;
    window.Mal3abPrepareInvite = async () => {
      if (S.mode === 'online' && S.code) return Net.inviteLink(S.code);
      const game = location.pathname.split('/').pop().replace('.html', ''), q = new URLSearchParams(location.search);
      const code = await Net.create(game, {});
      const url = `${game}.html?code=${code}&p=1` + (q.get('tc') ? '&tc=' + q.get('tc') + '&inc=' + (q.get('inc') || 0) : '');
      return { link: Net.inviteLink(code), go: () => { location.href = url; } };   // (not 'then': that would make it a promise)
    };
    if (S.mode === 'online') {
      room.innerHTML = `${t('roomCode')}: <b>${S.code}</b>
        <button class="btn tiny" onclick="Shell.copy('${S.code}', this)">${t('copy')}</button>
        <button class="btn tiny" onclick="Shell.copy(Net.inviteLink('${S.code}'), this)">🔗 ${t('inviteLink')}</button>`;
    } else room.textContent = S.mode === 'bot' ? `🤖 ${t('vsBot')} · ${t(S.bot)}` : t('localPlay');

    const w = S.state.winner, other = S.me === 1 ? 2 : 1;
    let text;
    if (w === 'draw') text = t('draw');
    else if (w) text = (S.versus() && w === S.me) ? t('youWon') : (S.versus() ? t('lost', { p: S.name(w) }) : t('won', { p: S.name(w) }));
    else if (!S.ready()) text = t('waiting');
    else if (S.versus()) text = S.myTurn() ? t('yourTurn') : t('theirTurn', { p: S.name(other) });
    else text = t('turnOf', { p: S.name(S.state.turn) });
    if (S.state.reason) text += ` (${S.state.reason})`;
    st.textContent = extra ? `${text} — ${extra}` : text;
    if (w) {
      const b = document.createElement('button');
      b.className = 'btn tryagain'; b.textContent = t('tryAgain'); b.onclick = () => S.reset();
      st.append(document.createElement('br'), b);
    }
  },

  maybeRecord() {
    const S = window.S;
    if (!S.state.winner || S.recorded) return;
    S.recorded = true;
    const w = S.state.winner;
    const row = {
      code: S.mode === 'online' ? S.code : 'local-' + Date.now(), game_no: S.gameNo, game: S.opts.title, mode: S.mode,
      p1_name: S.name(1), p2_name: S.name(2), winner: String(w), reason: S.state.reason || null,
      moves: S.state.moves || null, finished_at: new Date().toISOString()
    };
    if (S.mode === 'online') Auth.record(w === 'draw' ? 'draw' : (w === S.me ? 'win' : 'loss'));
    History.save(row);
  }
};
