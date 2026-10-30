// =====================================================================
// Mal3ab — Channel Connect: chat with your friends from any page or game.
// Any element with [data-mal3ab-chat] opens it (and shows the unread count).
// Messages live in the database (chat_send / chat_list / chat_unread);
// a tiny broadcast "ping" on the friend's inbox makes them arrive instantly.
// =====================================================================
(function () {
  if (window.Chat || !window.sb) return;
  addStrings({
    chat_title: '💬 الشات', chat_friends: 'اختار صاحب تكلمه', chat_noFriends: 'لسه مفيش أصحاب — ضيفهم من صفحة الألعاب (👥 الأصحاب)',
    chat_login: 'سجّل دخول في ملعب عشان تكلم أصحابك', chat_type: 'اكتب رسالة…', chat_send: 'ابعت', chat_invite: '🎮 ادعيه للعبة دي',
    chat_inviteMsg: 'تعالى العب معايا', chat_join: '▶ ادخل', chat_back: '→ رجوع', chat_empty: 'لسه مفيش رسايل — قول أهلًا 👋',
    chat_new: '{p} بعتلك رسالة', chat_online: 'أونلاين', chat_offline: 'مش أونلاين', chat_err: 'ما اتبعتتش — حاول تاني', chat_preparing: 'بجهّز الغرفة…', chat_clear: 'امسح الشات', chat_clearQ: 'تمسح كل الرسايل مع {p} وتبدأ شات جديد؟ (بتتمسح عندك إنت بس)', chat_clearYes: '🗑 امسح', chat_cancel: 'إلغاء'
  }, {
    chat_title: '💬 Chat', chat_friends: 'Pick a friend to talk to', chat_noFriends: 'No friends yet — add them on the games page (👥 Friends)',
    chat_login: 'Log in to Mal3ab to chat with your friends', chat_type: 'Type a message…', chat_send: 'Send', chat_invite: '🎮 Invite to this game',
    chat_inviteMsg: 'Come play with me', chat_join: '▶ Join', chat_back: '← Back', chat_empty: 'No messages yet — say hi 👋',
    chat_new: '{p} sent you a message', chat_online: 'online', chat_offline: 'offline', chat_err: 'Not sent — try again', chat_preparing: 'Getting the room ready…', chat_clear: 'Clear chat', chat_clearQ: 'Clear all messages with {p} and start a new chat? (only on your side)', chat_clearYes: '🗑 Clear', chat_cancel: 'Cancel'
  });
  const css = document.createElement('style');
  css.textContent = `
  #m3chat{position:fixed;right:10px;bottom:10px;width:min(360px,calc(100vw - 20px));height:min(560px,calc(100vh - 20px));z-index:100000;background:#141a2e;color:#eef0ff;
    border:2px solid #2c355c;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;font:14px 'Segoe UI',Tahoma,Arial,sans-serif;box-shadow:0 18px 60px rgba(0,0,0,.55)}
  #m3chat[hidden]{display:none}
  #m3chat .hd{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#1a1f35;border-bottom:1px solid #2c355c}
  #m3chat .hd b{flex:1;color:#ffb703;font-size:16px} #m3chat button{font-family:inherit;cursor:pointer}
  #m3chat .x{background:#232a48;color:#eef0ff;border:0;border-radius:8px;padding:5px 10px}
  #m3chat .bd{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px;min-height:0}
  #m3chat .bd>*{flex-shrink:0;position:relative}
  #m3chat .fr{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:#1a1f35;border:0;color:#eef0ff;text-align:start;width:100%}
  #m3chat .fr:hover{background:#232a48} #m3chat .fr span{flex:1} #m3chat .fr small{color:#9aa3c7}
  #m3chat .dot{width:10px;height:10px;border-radius:50%;background:#555;flex:none} #m3chat .dot.on{background:#80ed99;box-shadow:0 0 6px #80ed99}
  #m3chat .n{background:#ff5d73;color:#fff;border-radius:10px;padding:1px 7px;font-size:12px;font-weight:700}
  #m3chat .m3m{max-width:82%;padding:7px 11px;border-radius:14px;background:#232a48;color:#eef0ff;margin:0;font-size:14px;text-align:start;align-self:flex-start;white-space:pre-wrap;word-break:break-word;line-height:1.45}
  #m3chat .m3m .m3t{unicode-bidi:plaintext;text-align:start}
  #m3chat .m3m.me{align-self:flex-end;background:#ffb703;color:#1a1200} #m3chat .m3m a{color:inherit;text-decoration:underline}
  #m3chat .m3m .tm{display:block;font-size:10px;opacity:.6;margin-top:2px;text-align:end;direction:ltr;unicode-bidi:isolate}
  #m3chat .fr b{unicode-bidi:plaintext} #m3chat input{unicode-bidi:plaintext}
  #m3chat .inv{display:flex;flex-direction:column;gap:6px} #m3chat .inv button{background:#80ed99;color:#062b12;border:0;border-radius:8px;padding:6px 10px;font-weight:700}
  #m3chat .m3m.me .inv button{background:#1a1200;color:#ffb703}
  #m3chat .ft{display:flex;flex-direction:column;gap:6px;padding:8px;border-top:1px solid #2c355c;background:#1a1f35}
  #m3chat .row{display:flex;gap:6px;align-items:stretch}
  #m3chat .m3cf{background:#2a1520;border:1px solid #ff5d73;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;text-align:center}
  #m3chat .m3cf div{display:flex;gap:6px} #m3chat .m3cf button{flex:1;border:0;border-radius:8px;padding:7px;font-weight:700;cursor:pointer}
  #m3chat .m3cf .y{background:#ff5d73;color:#fff} #m3chat .m3cf .n2{background:#232a48;color:#eef0ff} #m3chat input{flex:1;min-width:0;background:#0f1220;color:#eef0ff;border:2px solid #2c355c;border-radius:10px;padding:9px 10px;font:inherit;text-transform:none;letter-spacing:0;text-align:start;width:auto}
  #m3chat .snd{background:#ffb703;color:#1a1200;border:0;border-radius:10px;padding:0 14px;font-weight:700}
  #m3chat .iv{background:#232a48;color:#eef0ff;border:0;border-radius:10px;padding:7px;font-weight:600}
  #m3chat .muted{color:#9aa3c7;text-align:center;padding:20px 10px}
  [data-mal3ab-chat]{position:relative}
  [data-mal3ab-chat][data-n]::after{content:attr(data-n);position:absolute;top:-6px;right:-6px;background:#ff5d73;color:#fff;border-radius:10px;padding:0 6px;font:700 11px/17px system-ui,sans-serif;min-width:17px;text-align:center}
  .m3toast{position:fixed;right:16px;top:16px;z-index:100001;background:#1a1f35;color:#eef0ff;border:2px solid #ffb703;border-radius:12px;padding:10px 14px;font:600 14px 'Segoe UI',Tahoma,sans-serif;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.45)}
  .ar #m3chat .bd,.ar #m3chat .hd,.ar #m3chat .ft{direction:rtl}`;
  document.head.appendChild(css);

  const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, Object.assign({ p_token: Auth.token }, args || {})); if (error) throw new Error(error.message); return data; };
  const C = { open: false, friends: [], friend: null, msgs: [], lastId: 0, unread: {}, inbox: null, polls: [], el: null, seen: {} };
  window.Chat = C;

  function panel() {
    if (C.el) return C.el;
    const el = document.createElement('div'); el.id = 'm3chat'; el.hidden = true; document.body.appendChild(el); C.el = el;
    // typing in the chat must not move characters or trigger game keys
    for (const ev of ['keydown', 'keyup', 'keypress']) el.addEventListener(ev, (e) => e.stopPropagation());
    for (const ev of ['mousedown', 'pointerdown', 'wheel', 'touchstart']) el.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
    return el;
  }
  C.toggle = () => C.open ? C.close() : C.show();
  C.show = async (friendId) => {
    if (document.pointerLockElement) document.exitPointerLock();
    panel().hidden = false; C.open = true;
    if (!Auth.token) { C.el.innerHTML = head(t('chat_title')) + `<div class="bd"><p class="muted">${t('chat_login')}</p></div>`; wire(); return; }
    await loadFriends();
    const f = friendId && C.friends.find(x => x.id === friendId);
    if (f) openConv(f); else if (C.friend) openConv(C.friend); else drawList();
  };
  C.close = () => { if (C.el) C.el.hidden = true; C.open = false; };
  const head = (title, back) => `<div class="hd">${back ? `<button class="x" data-a="back">${t('chat_back')}</button>` : ''}<b>${title}</b>${back ? `<button class="x" data-a="clear" title="${t('chat_clear')}">🗑</button>` : ''}<button class="x" data-a="close">✕</button></div>`;
  function wire() {
    C.el.querySelectorAll('[data-a="close"]').forEach(b => b.onclick = C.close);
    C.el.querySelectorAll('[data-a="back"]').forEach(b => b.onclick = () => { C.friend = null; drawList(); });
    C.el.querySelectorAll('[data-a="clear"]').forEach(b => b.onclick = askClear);
  }
  async function loadFriends() { try { const d = await Friends.list(); C.friends = (d && d.friends) || []; } catch (e) {} }
  function drawList() {
    C.friend = null;
    const list = [...C.friends].sort((a, b) => (C.unread[b.id] || 0) - (C.unread[a.id] || 0) || (b.online - a.online));
    C.el.innerHTML = head(t('chat_title')) + `<div class="bd">${list.length ? `<p class="muted" style="padding:4px">${t('chat_friends')}</p>` + list.map(f =>
      `<button class="fr" data-f="${f.id}"><i class="dot ${f.online ? 'on' : ''}"></i><span><b dir="auto">${esc(f.username)}</b><br><small>${t(f.online ? 'chat_online' : 'chat_offline')}</small></span>${C.unread[f.id] ? `<i class="n">${C.unread[f.id]}</i>` : ''}</button>`).join('')
      : `<p class="muted">${t('chat_noFriends')}</p>`}</div>`;
    wire(); C.el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => openConv(C.friends.find(f => f.id === b.dataset.f)));
  }
  async function openConv(f) {
    C.friend = f; C.msgs = []; C.lastId = 0; outCh(f.id);
    C.el.innerHTML = head(`<i class="dot ${f.online ? 'on' : ''}" style="display:inline-block;margin-inline-end:6px"></i>${esc(f.username)}`, true) +
      `<div class="bd" id="m3msgs"></div><div class="ft"><button class="iv" id="m3inv">${t('chat_invite')}</button>
       <div class="row"><input id="m3in" dir="auto" maxlength="1000" placeholder="${t('chat_type')}" autocomplete="off"><button class="snd" id="m3snd">${t('chat_send')}</button></div></div>`;
    wire();
    const inp = C.el.querySelector('#m3in');
    C.el.querySelector('#m3snd').onclick = () => { send(inp.value); inp.value = ''; inp.focus(); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { send(inp.value); inp.value = ''; } };
    // invite: a link that drops the friend straight into the match / room / world I'm in right now
    // (games that can, open an online room first: Mal3abPrepareInvite returns the link, or { link, go })
    C.el.querySelector('#m3inv').onclick = async (e) => {
      const btn = e.currentTarget, label = btn.textContent; btn.blur();
      if (btn.disabled || Date.now() - (C.invT || 0) < 8000) return; C.invT = Date.now();
      btn.disabled = true; btn.textContent = '⏳ ' + t('chat_preparing');
      let r = null; try { if (window.Mal3abPrepareInvite) r = await window.Mal3abPrepareInvite(); } catch (err) { console.warn(err); }
      const link = (typeof r === 'string' && r) || (r && r.link) || (window.Mal3abShareLink && window.Mal3abShareLink()) || location.href;
      const title = document.title.replace(/ — .*$/, '');
      await send(`🎮 ${t('chat_inviteMsg')} — \u2068${title}\u2069\n${link}`, 'invite', { link, title: document.title });
      btn.textContent = '✓'; setTimeout(() => { btn.disabled = false; btn.textContent = label; }, 3000);
      if (r && typeof r.go === 'function') r.go();   // e.g. move into the new online room
    };
    await fetchNew(); delete C.unread[f.id]; badges(); setTimeout(() => inp.focus(), 50);
  }
  // clear the whole conversation (only on my side) and start fresh
  function askClear() {
    const f = C.friend, box = C.el && C.el.querySelector('#m3msgs'); if (!f || !box || box.querySelector('.m3cf')) return;
    box.insertAdjacentHTML('afterbegin', `<div class="m3cf"><span dir="auto">${t('chat_clearQ', { p: esc(f.username) })}</span><div><button class="y">${t('chat_clearYes')}</button><button class="n2">${t('chat_cancel')}</button></div></div>`);
    box.scrollTop = 0;
    const cf = box.querySelector('.m3cf');
    cf.querySelector('.n2').onclick = () => cf.remove();
    cf.querySelector('.y').onclick = async () => {
      try { await rpc('chat_clear', { p_friend: f.id }); C.msgs = []; C.lastId = 0; delete C.unread[f.id]; badges(); drawMsgs(); }
      catch (e) { cf.querySelector('span').textContent = t('chat_err'); }
    };
  }
  function drawMsgs(append) {
    const box = C.el && C.el.querySelector('#m3msgs'); if (!box) return;
    const html = (m) => {
      const mine = m.from_id === Auth.user.id, time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (m.kind === 'invite' && m.meta && m.meta.link) return `<div class="m3m ${mine ? 'me' : ''}" data-inv="${esc(m.from_id + '|' + m.meta.link)}"><div class="inv"><div class="m3t" dir="auto">${linkify(m.body.split('\n')[0])}</div>${mine ? '' : `<button data-go="${esc(m.meta.link)}">${t('chat_join')}</button>`}</div><span class="tm" dir="ltr">${time}</span></div>`;
      return `<div class="m3m ${mine ? 'me' : ''}"><div class="m3t" dir="auto">${linkify(m.body)}</div><span class="tm" dir="ltr">${time}</span></div>`;
    };
    const key = (m) => m.kind === 'invite' && m.meta && m.meta.link ? m.from_id + '|' + m.meta.link : null;
    const latest = (list) => { const seen = new Set(); return list.slice().reverse().filter(m => { const k = key(m); if (!k) return true; if (seen.has(k)) return false; seen.add(k); return true; }).reverse(); };
    if (!append) { const list = latest(C.msgs); box.innerHTML = list.length ? list.map(html).join('') : `<p class="muted" id="m3empty">${t('chat_empty')}</p>`; }
    else {
      const e = box.querySelector('#m3empty'); if (e) e.remove();
      for (const m of append) { const k = key(m); if (k) box.querySelectorAll('[data-inv]').forEach(el => { if (el.dataset.inv === k) el.remove(); }); }
      box.insertAdjacentHTML('beforeend', latest(append).map(html).join(''));
    }
    box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { location.href = b.dataset.go; });
    box.scrollTop = box.scrollHeight;
  }
  async function fetchNew() {
    const f = C.friend; if (!f) return;
    try {
      const rows = await rpc('chat_list', { p_friend: f.id, p_after: C.lastId, p_limit: 80 }) || [];
      if (C.friend !== f) return;
      const fresh = rows.filter(r => r.id > C.lastId); if (!fresh.length && C.lastId) return;
      const first = !C.lastId; C.msgs.push(...fresh); if (fresh.length) C.lastId = fresh[fresh.length - 1].id;
      first ? drawMsgs() : drawMsgs(fresh);
    } catch (e) {}
  }
  async function send(text, kind, meta) {
    text = String(text || '').trim(); const f = C.friend; if (!text || !f) return;
    try { await rpc('chat_send', { p_to: f.id, p_body: text, p_kind: kind || 'text', p_meta: meta || null }); await fetchNew(); ping(f.id); }
    catch (e) { const box = C.el.querySelector('#m3msgs'); if (box) box.insertAdjacentHTML('beforeend', `<p class="muted">${t('chat_err')}</p>`); }
  }
  // instant delivery: a ping on the friend's inbox channel (the message itself stays in the database)
  const out = {};
  function outCh(id) {   // opened as soon as a conversation opens, so the ping leaves instantly on send
    let ch = out[id];
    if (!ch) { ch = out[id] = sb.channel('inbox-' + id, { config: { broadcast: { self: false, ack: false } } }); ch._ready = new Promise(res => ch.subscribe(s => { if (s === 'SUBSCRIBED') res(); })); }
    return ch;
  }
  function ping(id) { const ch = outCh(id); ch._ready.then(() => ch.send({ type: 'broadcast', event: 'ping', payload: { from: Auth.user.id } })); }
  function badges() {
    const n = Object.values(C.unread).reduce((a, b) => a + b, 0);
    document.querySelectorAll('[data-mal3ab-chat]').forEach(b => n ? b.setAttribute('data-n', n > 99 ? '99+' : n) : b.removeAttribute('data-n'));
  }
  async function refreshUnread(fromPing) {
    if (!Auth.token) return;
    try {
      const u = await rpc('chat_unread') || {};
      for (const [id, n] of Object.entries(u)) if (n > (C.seen[id] || 0) && (!C.open || !C.friend || C.friend.id !== id)) {
        if (!C.friends.length) await loadFriends();
        const f = C.friends.find(x => x.id === id); if (f && (fromPing || C.seen[id] !== undefined)) toast(f);
      }
      C.seen = Object.assign({}, u); C.unread = u;
      if (C.open && C.friend && u[C.friend.id]) await fetchNew();
      badges(); if (C.open && !C.friend) drawList();
    } catch (e) {}
  }
  function toast(f) {
    document.querySelectorAll('.m3toast').forEach(e => e.remove());
    const d = document.createElement('div'); d.className = 'm3toast'; d.textContent = '💬 ' + t('chat_new', { p: f.username });
    d.onclick = () => { d.remove(); C.show(f.id); }; document.body.appendChild(d); setTimeout(() => d.remove(), 6000);
  }
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-mal3ab-chat]'); if (b) { e.preventDefault(); e.stopPropagation(); C.toggle(); } }, true);
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('#m3chat button'); if (b) setTimeout(() => { if (document.activeElement === b) b.blur(); }, 0); });
  document.addEventListener('pointerlockchange', () => { const a = document.activeElement; if (document.pointerLockElement && a && C.el && C.el.contains(a)) a.blur(); });
  document.addEventListener('langchange', () => { if (C.open) { C.friend ? openConv(C.friend) : drawList(); } });
  async function start() {
    if (!Auth.token || !Auth.user) return;
    if (C.inbox) return;
    C.inbox = sb.channel('inbox-' + Auth.user.id, { config: { broadcast: { self: false } } });
    C.inbox.on('broadcast', { event: 'ping' }, ({ payload }) => { if (C.open && C.friend && payload && payload.from === C.friend.id) fetchNew(); else refreshUnread(true); });
    C.inbox.subscribe();
    await refreshUnread(false);
    setInterval(() => { if (C.open && C.friend) fetchNew(); }, 4000);
    setInterval(() => refreshUnread(false), 12000);
    setInterval(badges, 2000);
  }
  // wait until the account is known
  const tryStart = () => { if (window.Auth && Auth.token && Auth.user) start(); };
  document.addEventListener('mal3abready', tryStart); setTimeout(tryStart, 1500); setTimeout(tryStart, 5000);
  const iv = setInterval(() => { tryStart(); if (C.inbox) clearInterval(iv); }, 3000);
})();
