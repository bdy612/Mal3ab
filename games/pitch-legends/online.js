// Mal3ab — Pitch Legends online challenges.
// Share your squad (cards, levels, stats) as a code / link; a friend plays a match against it.
// Results are reported back to the squad owner and saved in the Mal3ab match history.
(function () {
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randCode = () => Array.from({ length: 5 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const T = (ar, en) => AR() ? ar : en;
  let VS = null;            // squad we are playing against
  let myCode = null;

  const ready = () => !!(window.sb && window.Auth);
  async function waitReady() { for (let i = 0; i < 100 && !ready(); i++) await new Promise(r => setTimeout(r, 100)); return ready(); }

  function mySquad() {
    const s = Store.state; Lineup.validate();
    const out = {};
    SLOT_ORDER.forEach(slot => {
      const id = s.lineup[slot];
      const def = id ? CATALOG_BY_ID[id] : makeDef(SLOT_DEF[slot].color, '0');
      const level = id && s.cards[id] ? s.cards[id].level : 1;
      out[slot] = { id: def.id, name: def.name, color: def.color, value: def.value, label: def.label, isNum: def.isNum, rarity: def.rarity,
                    level, slotLevel: s.slots[def.color] || 1, stats: id ? Stats.forOwned(id) : Stats.fromCard(def, 1, 1) };
    });
    return out;
  }

  // ---- patch the game: opponent = friend's squad ----
  const origStart = Game.start.bind(Game), origEnd = Game.end.bind(Game);
  Game.start = function (opts) {
    origStart(opts);
    if (!VS) return;
    const avg = Object.values(VS.squad).reduce((a, c) => a + (c.stats.speed + c.stats.power + c.stats.control + c.stats.tackle + c.stats.save) / 5, 0) / 5;
    this.aiLevel = clamp(Math.round((avg - 1) * 10), 1, MAX_LEVEL); this.aiName = VS.name;
    this.away.forEach(a => {
      const c = VS.squad[a.slot]; if (!c) return;
      a.stats = c.stats; a.def = { color: c.color, value: c.value, isNum: c.isNum, label: c.label, name: c.name };
      a.color = c.color; a.label = c.isNum ? c.value : c.label; a.name = c.name;
    });
    this.say(`⚔️ ${T('مباراة ضد فريق', 'Match vs the squad of')} ${VS.name}!`);
  };
  Game.end = function () {
    origEnd();
    if (!VS) return;
    const h = this.score.home, aw = this.score.away;
    const res = h > aw ? 'challenger' : h < aw ? 'owner' : 'draw';
    sb.rpc('squad_result', { p_code: VS.code, p_result: res });
    const row = { code: 'pitch-' + VS.code + '-' + Date.now(), game_no: 1, game: 'pitch', mode: 'online',
      p1_name: Auth.name() || T('ضيف', 'Guest'), p2_name: VS.name, p1_id: Auth.user ? Auth.user.id : null, p2_id: VS.account_id,
      winner: res === 'challenger' ? '1' : res === 'owner' ? '2' : 'draw', reason: `${h}-${aw}`, finished_at: new Date().toISOString() };
    if (window.History) History.save(row);
    if (Auth.user && res !== 'draw') Auth.record(res === 'challenger' ? 'win' : 'loss'); else if (Auth.user) Auth.record('draw');
  };

  // ---- UI ----
  const cardLine = (c) => `<div class="mo-card c-${c.color}"><b>${esc(c.name)}</b> <span>Lv ${c.level}</span>
     <small>SPD ${Stats.pct(c.stats.speed)}% · POW ${Stats.pct(c.stats.power)}% · CTL ${Stats.pct(c.stats.control)}% · TKL ${Stats.pct(c.stats.tackle)}% · SAV ${Stats.pct(c.stats.save)}%</small></div>`;

  function panel() {
    let el = document.getElementById('mal3ab-online');
    if (!el) {
      el = document.createElement('div'); el.id = 'mal3ab-online'; document.body.appendChild(el);
      const st = document.createElement('style');
      st.textContent = `
        #mal3ab-online{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9998;width:min(92vw,360px);box-shadow:0 20px 60px rgba(0,0,0,.6);background:#1a1f35;border:1px solid #2c355c;border-radius:14px;padding:14px;color:#eef0ff;font:14px 'Segoe UI',Tahoma,Arial,sans-serif;display:none;max-height:80vh;overflow:auto}
        #mal3ab-online.open{display:block}
        #mal3ab-online h3{margin:0 0 8px;color:#ffb703;font-size:16px}
        #mal3ab-online .btn{background:#ffb703;color:#1a1200;border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer;width:100%;margin-top:6px;font-family:inherit}
        #mal3ab-online .btn.sec{background:#232a48;color:#eef0ff}
        #mal3ab-online .btn.blue{background:#3a86ff;color:#fff}
        #mal3ab-online .btn.green{background:#80ed99;color:#062b12}
        #mal3ab-online .close{position:absolute;top:8px;right:10px;width:30px;height:30px;border-radius:15px;background:#232a48;color:#eef0ff;border:0;cursor:pointer;font-size:16px}
        #mal3ab-online h3{padding-right:34px}
        #mal3ab-online input{width:100%;box-sizing:border-box;background:#232a48;color:#eef0ff;border:1px solid #2c355c;border-radius:8px;padding:8px;margin-top:6px;font-family:inherit;text-transform:uppercase;letter-spacing:2px}
        #mal3ab-online .code{font-size:22px;font-weight:800;letter-spacing:4px;color:#ffb703;text-align:center;margin:6px 0}
        #mal3ab-online .link{font-size:11px;color:#9aa3c7;word-break:break-all}
        #mal3ab-online .mo-card{background:#232a48;border-radius:8px;padding:6px 8px;margin:4px 0;border-left:4px solid #888}
        #mal3ab-online .mo-card small{display:block;color:#9aa3c7;font-size:11px}
        #mal3ab-online .c-blue{border-color:#2f6fed}#mal3ab-online .c-green{border-color:#22a85a}#mal3ab-online .c-yellow{border-color:#e9b926}#mal3ab-online .c-red{border-color:#e03b3b}#mal3ab-online .c-black{border-color:#eee}
        #mal3ab-online .vs{background:rgba(255,183,3,.12);border:1px solid #ffb703;border-radius:8px;padding:8px;margin-bottom:8px}
        #mal3ab-online .msg{color:#ff5d73;min-height:18px;font-size:12px}
        .ar #mal3ab-online{direction:rtl}`;
      document.head.appendChild(st);
      // "Challenge a friend" card at the bottom of the home screen (re-added whenever the screen re-renders)
      const addCard = () => {
        const home = document.getElementById('screen-home');
        if (!home || !home.children.length || home.querySelector('.mal3ab-card')) return;
        const c = document.createElement('div'); c.className = 'mal3ab-card';
        c.innerHTML = `<h3>⚔️ ${T('تحدّي صاحبك', 'Challenge a friend')}</h3><p>${T('ابعت فريقك ككود أو لينك وخلّي صاحبك يلعب ضده، أو ادخل بكود فريق صاحبك.', 'Send your squad as a code or link so a friend plays against it, or enter a friend\'s squad code.')}</p><button id="mal3ab-online-btn">⚔️ ${T('افتح التحدّي', 'Open challenge')}</button>`;
        home.appendChild(c);
        c.querySelector('button').onclick = () => { el.classList.add('open'); render(); };
      };
      // "Play again" at the bottom of the match screen
      const addAgain = () => {
        const arena = document.getElementById('screen-arena');
        if (!arena || !arena.children.length || arena.querySelector('.mal3ab-again')) return;
        const w = document.createElement('div'); w.className = 'mal3ab-again-wrap';
        w.innerHTML = `<button class="mal3ab-again">🔄 ${T('العب تاني', 'Play again')}</button>`;
        w.querySelector('button').onclick = () => UI.startMatch(Game.simulate);
        arena.appendChild(w);
      };
      new MutationObserver(() => { addCard(); addAgain(); }).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
      addCard(); addAgain();
    }
    return el;
  }

  function render() {
    const el = panel();
    const base = location.href.split('?')[0];
    const sq = mySquad();
    el.innerHTML = `<button class="close" onclick="document.getElementById('mal3ab-online').classList.remove('open')">✕</button>
      ${VS ? `<div class="vs"><b>⚔️ ${T('بتلعب ضد فريق', 'Playing vs')} ${esc(VS.name)}</b>
        <small style="color:#9aa3c7">${T('سجل الفريق', 'Record')}: ${VS.played} ${T('مباراة', 'played')} · ${VS.owner_wins} ${T('فوز لصاحبه', 'owner wins')}</small>
        ${SLOT_ORDER.map(s => VS.squad[s] ? cardLine(VS.squad[s]) : '').join('')}
        <button class="btn" onclick="UI.show('arena');UI.startMatch(false)">▶ ${T('ابدأ المباراة', 'Start match')}</button>
        <button class="btn sec" onclick="location.href='${base}'">${T('إلغاء التحدي', 'Leave challenge')}</button></div>` : ''}
      <h3>${T('فريقي', 'My squad')} — ${esc(Auth.name() || T('ضيف', 'Guest'))}</h3>
      ${SLOT_ORDER.map(s => cardLine(sq[s])).join('')}
      <button class="btn" id="mo-create">🔗 ${T('اعمل كود تحدّي', 'Create challenge code')}</button>
      <div id="mo-out"></div>
      <h3 style="margin-top:12px">${T('عندك كود؟', 'Have a code?')}</h3>
      <input id="mo-code" maxlength="5" placeholder="ABCDE">
      <button class="btn green" id="mo-join">⚔️ ${T('العب ضد الفريق ده', 'Play vs this squad')}</button>
      <div class="msg" id="mo-msg"></div>`;
    el.querySelector('#mo-create').onclick = createChallenge;
    el.querySelector('#mo-join').onclick = () => { const c = el.querySelector('#mo-code').value.trim().toUpperCase(); if (c.length === 5) location.href = base + '?vs=' + c; };
    if (myCode) showCode(myCode);
  }
  function showCode(code) {
    const base = location.href.split('?')[0], link = base + '?vs=' + code;
    const out = document.getElementById('mo-out');
    out.innerHTML = `<div class="code">${code}</div><div class="link">${link}</div>
      <button class="btn blue" onclick="navigator.clipboard.writeText('${link}');this.textContent='✓ ' + this.textContent">🔗 ${T('نسخ اللينك', 'Copy link')}</button>`;
  }
  async function createChallenge() {
    const msg = document.getElementById('mo-msg'); msg.textContent = '…';
    let name = Auth.name();
    if (!name) { name = prompt(T('اسمك؟', 'Your name?')); if (!name) { msg.textContent = ''; return; } Auth.setGuestName(name.trim()); }
    for (let i = 0; i < 5; i++) {
      const code = randCode();
      const { error } = await sb.from('squads').insert({ code, name, account_id: Auth.user ? Auth.user.id : null, squad: mySquad() });
      if (!error) { myCode = code; msg.textContent = ''; render(); return; }
    }
    msg.textContent = T('حصلت مشكلة، جرّب تاني', 'Something went wrong, try again');
  }

  (async () => {
    if (!await waitReady()) return;
    await new Promise(r => setTimeout(r, 300));
    panel();
    const code = new URLSearchParams(location.search).get('vs');
    if (code) {
      const { data } = await sb.from('squads').select('*').eq('code', code.toUpperCase()).maybeSingle();
      if (data) { VS = data; panel().classList.add('open'); }
      else alert(T('الكود ده مش موجود', 'That code does not exist'));
    }
    render();
  })();
})();
