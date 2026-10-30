// Mal3ab — shared game shell: local vs online mode, turns, names, status bar, result recording.
// Usage: Shell.start({ title:'chess', newState(){...}, render(){...}, extraButtons:'<html>' })
// Then use S.state, S.me, S.myTurn(), S.commit(), S.reset(), S.names
window.Shell = {
  async start(opts) {
    await Auth.init();
    const q = new URLSearchParams(location.search);
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
