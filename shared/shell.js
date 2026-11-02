// Mal3ab — shared game shell: local vs online mode, turns, names, status bar, result recording.
// Usage: Shell.start({ title:'chess', newState(){...}, render(){...}, extraButtons:'<html>' })
// Then use S.state, S.me, S.myTurn(), S.commit(), S.reset(), S.names
addStrings({
  sh_namesT: '👥 مين هيلعب؟', sh_namesQ: 'اكتبوا اسم كل واحد فيكم', sh_p1: 'اسم اللاعب الأول', sh_p2: 'اسم اللاعب التاني', sh_go: '▶ يلا نلعب',
  sh_need: 'اكتبوا اسمين مختلفين', sh_who: '🏳️ مين اللي استسلم؟', sh_cancel: 'إلغاء', sh_rename: '✏️ الأسماء'
}, {
  sh_namesT: "👥 Who's Playing?", sh_namesQ: "Type each player's name", sh_p1: "Player 1's name", sh_p2: "Player 2's name", sh_go: "▶ Let's Play",
  sh_need: 'Type two different names', sh_who: '🏳️ Who Resigned?', sh_cancel: 'Cancel', sh_rename: '✏️ Names'
});
window.Shell = {
  // ---------- same device: both players' names (asked before the game starts, remembered for next time) ----------
  localNames() { try { const n = JSON.parse(localStorage.getItem('mal3ab-local-names') || 'null'); if (n && n[0] && n[1]) return n; } catch (e) {} return null; },
  _pop(inner) {
    if (!document.getElementById('m3shCss')) {
      const c = document.createElement('style'); c.id = 'm3shCss';
      c.textContent = `.m3sh{position:fixed;inset:0;z-index:9000;background:rgba(5,8,20,.72);display:flex;align-items:center;justify-content:center;padding:16px}
        .m3sh .box{width:min(420px,100%);background:var(--card,#1a1f35);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
        .m3sh h3{margin:0;text-align:center;color:var(--accent,#ffb703);font-size:22px}.m3sh p{margin:0;text-align:center;color:var(--muted,#9aa)}
        .m3sh label{display:flex;flex-direction:column;gap:4px;font-weight:700}.m3sh label i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-inline-end:6px;vertical-align:middle}
        .m3sh .row{display:flex;gap:8px}.m3sh .row .btn{flex:1}.m3sh .msg{color:#ff6b7a;text-align:center;min-height:1.2em}`;
      document.head.appendChild(c);
    }
    const el = document.createElement('div'); el.className = 'm3sh'; el.innerHTML = `<div class="box" data-m3pop>${inner}</div>`;
    document.body.appendChild(el); if (window.Mal3abPopButtons) try { Mal3abPopButtons(); } catch (e) {}
    return el;
  },
  askNames(canCancel) {
    return new Promise((res) => {
      const old = Shell.localNames() || [Auth.name() || '', ''];
      const esc = (v) => String(v || '').replace(/[&<>"]/g, '');
      const el = Shell._pop(`<h3>${t('sh_namesT')}</h3><p>${t('sh_namesQ')}</p>
        <label><span><i style="background:var(--p1,#ff5d73)"></i>${t('sh_p1')}</span><input class="text" id="shN1" maxlength="16" value="${esc(old[0])}" placeholder="${t('player', { n: 1 })}"></label>
        <label><span><i style="background:var(--p2,#4cc9f0)"></i>${t('sh_p2')}</span><input class="text" id="shN2" maxlength="16" value="${esc(old[1])}" placeholder="${t('player', { n: 2 })}"></label>
        <div class="msg" id="shMsg"></div>
        <div class="row">${canCancel ? `<button class="btn secondary" id="shNo">${t('sh_cancel')}</button>` : ''}<button class="btn" id="shGo">${t('sh_go')}</button></div>`);
      const a = el.querySelector('#shN1'), b = el.querySelector('#shN2');
      (a.value ? b : a).focus();
      const go = () => {
        const n1 = a.value.trim(), n2 = b.value.trim();
        if (!n1) { a.focus(); el.querySelector('#shMsg').textContent = t('sh_need'); return; }
        if (!n2 || n1.toLowerCase() === n2.toLowerCase()) { b.focus(); el.querySelector('#shMsg').textContent = t('sh_need'); return; }
        try { localStorage.setItem('mal3ab-local-names', JSON.stringify([n1, n2])); } catch (e) {}
        el.remove(); res([n1, n2]);
      };
      el.querySelector('#shGo').onclick = go;
      [a, b].forEach(x => x.onkeydown = (e) => { if (e.key === 'Enter') { if (x === a && !b.value.trim()) b.focus(); else go(); } });
      if (canCancel) el.querySelector('#shNo').onclick = () => { el.remove(); res(null); };
    });
  },
  // same device: which of the two players? (e.g. who pressed resign) → 1 | 2 | null
  pickPlayer(title) {
    return new Promise((res) => {
      const S = window.S, esc = (v) => String(v || '').replace(/[&<>"]/g, '');
      const el = Shell._pop(`<h3>${title}</h3>
        <div class="row"><button class="btn" id="shP1" style="background:var(--p1,#ff5d73);color:#fff">${esc(S.name(1))}</button><button class="btn" id="shP2" style="background:var(--p2,#4cc9f0);color:#06202a">${esc(S.name(2))}</button></div>
        <button class="btn secondary" id="shNo">${t('sh_cancel')}</button>`);
      el.querySelector('#shP1').onclick = () => { el.remove(); res(1); };
      el.querySelector('#shP2').onclick = () => { el.remove(); res(2); };
      el.querySelector('#shNo').onclick = () => { el.remove(); res(null); };
    });
  },
  async start(opts) {
    await Auth.init();
    const q = new URLSearchParams(location.search);
    // opened from the games page with no mode chosen yet: pick online / vs bot / same device (and the clock) here
    if (!q.get('code') && !q.get('bot') && !q.get('local')) { Shell.startMenu(opts); return null; }
    // same device opened straight from a link: ask the two names first
    if (!q.get('code') && !q.get('bot') && !Shell.localNames()) await Shell.askNames(false);
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
      const n = Shell.localNames() || [t('player', { n: 1 }), t('player', { n: 2 })];
      S.names = { 1: n[0], 2: n[1] };
      S.rename = async () => { const r = await Shell.askNames(true); if (r) { S.names = { 1: r[0], 2: r[1] }; opts.render(); Shell.status(); } };
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
      el.innerHTML = `<div class="smbox" data-m3pop>
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
      $('smLocal').onclick = async () => { save(); const n = await Shell.askNames(true); if (n) location.href = `${game}.html?local=1${clk()}`; };
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
      ${window.S && S.mode === 'local' ? `<button class="btn small secondary" onclick="S.rename()">${t('sh_rename')}</button>` : ''}
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
