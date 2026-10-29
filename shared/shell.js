// Mal3ab — shared game shell: handles local vs online mode, turns, status bar.
// Usage in a game page:
//   Shell.start({ newState(){...}, render(){...}, title:'X-O' })
// Then use S.state, S.me, S.myTurn(), S.commit(), S.reset()
window.Shell = {
  async start(opts) {
    const q = new URLSearchParams(location.search);
    const S = {
      mode: q.get('code') ? 'online' : 'local',
      code: (q.get('code') || '').toUpperCase(),
      me: +(q.get('p') || 1),          // 1 or 2
      players: 1,
      state: null,
      opts
    };
    window.S = S;

    S.myTurn = () => S.mode === 'local' || S.state.turn === S.me;
    S.commit = async () => {
      opts.render();
      Shell.status();
      if (S.mode === 'online') await Net.push(S.code, S.state);
    };
    S.reset = () => { S.state = opts.newState(); S.commit(); };

    if (S.mode === 'online') {
      const room = await Net.get(S.code);
      if (!room) { alert('الغرفة مش موجودة'); location.href = '../index.html'; return; }
      S.players = room.players;
      S.state = room.state && room.state.turn ? room.state : null;
      if (!S.state) {           // room was just created: player 1 writes the first state
        S.state = opts.newState();
        await Net.push(S.code, S.state);
      }
      Net.watch(S.code, (r) => {
        S.players = r.players;
        if (r.state && r.state.turn) S.state = r.state;
        opts.render();
        Shell.status();
      });
    } else {
      S.state = opts.newState();
    }

    Shell.buildBar(opts.title);
    opts.render();
    Shell.status();
    return S;
  },

  buildBar(title) {
    const bar = document.createElement('div');
    bar.className = 'topbar';
    bar.innerHTML = `
      <a class="back" href="../index.html">← الرئيسية</a>
      <div class="title">${title}</div>
      <div class="room"></div>
      <button class="btn small" onclick="S.reset()">لعبة جديدة</button>`;
    document.body.prepend(bar);
    const st = document.createElement('div');
    st.className = 'status';
    st.id = 'status';
    bar.after(st);
  },

  status(extra) {
    if (extra !== undefined) Shell._extra = extra;
    extra = Shell._extra;
    const S = window.S, st = document.getElementById('status'), room = document.querySelector('.topbar .room');
    if (!st || !S.state) return;
    if (S.mode === 'online') {
      room.innerHTML = `كود الغرفة: <b>${S.code}</b> <button class="btn tiny" onclick="navigator.clipboard.writeText('${S.code}')">نسخ</button>`;
    } else room.textContent = 'لعب على نفس الجهاز';

    const w = S.state.winner;
    let text;
    if (w === 'draw') text = '🤝 تعادل!';
    else if (w) text = (S.mode === 'local' || w === S.me) ? `🏆 اللاعب ${w} كسب!` : `😅 اللاعب ${w} كسب`;
    else if (S.mode === 'online' && S.players < 2) text = '⏳ مستني اللاعب التاني يدخل بالكود…';
    else if (S.mode === 'online') text = S.myTurn() ? '🟢 دورك إنت' : '🔴 دور الخصم…';
    else text = `دور اللاعب ${S.state.turn}`;
    st.textContent = extra ? `${text} — ${extra}` : text;
  }
};
