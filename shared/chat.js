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
    chat_new: '{p} بعتلك رسالة', chat_online: 'أونلاين', chat_offline: 'مش أونلاين', chat_err: 'ما اتبعتتش — حاول تاني', chat_preparing: 'بجهّز الغرفة…', chat_clear: 'امسح الشات', chat_call: 'مكالمة', chat_callMsg: 'بدأت مكالمة — تعالى', chat_callJoin: '📞 ادخل المكالمة', chat_calling: '📞 {p} بيكلمك…', chat_decline: 'مش دلوقتي', chat_clearQ: 'تمسح كل الرسايل مع {p} وتبدأ شات جديد؟ (بتتمسح عندك إنت بس)', chat_clearYes: '🗑 امسح', chat_cancel: 'إلغاء', chat_missed: '📵 مكالمة فايتة من {p}',
    g_groups: 'الجروبات', g_new: '➕ جروب جديد', g_name: 'اسم الجروب', g_pick: 'اختار الأصحاب اللي في الجروب', g_create: '✓ اعمل الجروب', g_members: 'الأعضاء', g_n: '{n} عضو',
    g_owner: 'صاحب الجروب', g_admin: 'أدمن', g_add: '➕ ضيف صاحب', g_remove: 'طلّعه', g_makeAdmin: 'اعمله أدمن', g_unAdmin: 'شيل الأدمن', g_rename: '✏️ غيّر الاسم', g_leave: '🚪 اخرج من الجروب',
    g_delete: '🗑 امسح الجروب', g_leaveQ: 'تخرج من الجروب {p}؟', g_deleteQ: 'تمسح الجروب {p} لكل الناس؟', g_call: 'مكالمة الجروب', g_callMsg: 'بدأ مكالمة الجروب — تعالوا', g_newMsg: '{p} بعت في {g}',
    g_noFriends: 'كل أصحابك في الجروب بالفعل', g_notReady: 'الجروبات لسه بتتجهز — جرب كمان شوية', g_needName: 'اكتب اسم للجروب'
  }, {
    chat_title: '💬 Chat', chat_friends: 'Pick a friend to talk to', chat_noFriends: 'No friends yet — add them on the games page (👥 Friends)',
    chat_login: 'Log in to Mal3ab to chat with your friends', chat_type: 'Type a message…', chat_send: 'Send', chat_invite: '🎮 Invite to this game',
    chat_inviteMsg: 'Come play with me', chat_join: '▶ Join', chat_back: '← Back', chat_empty: 'No messages yet — say hi 👋',
    chat_new: '{p} sent you a message', chat_online: 'online', chat_offline: 'offline', chat_err: 'Not sent — try again', chat_preparing: 'Getting the room ready…', chat_clear: 'Clear chat', chat_call: 'Call', chat_callMsg: 'started a call — join me', chat_callJoin: '📞 Join call', chat_calling: '📞 {p} is calling you…', chat_decline: 'Not now', chat_clearQ: 'Clear all messages with {p} and start a new chat? (only on your side)', chat_clearYes: '🗑 Clear', chat_cancel: 'Cancel', chat_missed: '📵 Missed call from {p}',
    g_groups: 'Groups', g_new: '➕ New Group', g_name: 'Group name', g_pick: 'Pick the friends in the group', g_create: '✓ Create Group', g_members: 'Members', g_n: '{n} members',
    g_owner: 'Owner', g_admin: 'Admin', g_add: '➕ Add a Friend', g_remove: 'Remove', g_makeAdmin: 'Make Admin', g_unAdmin: 'Remove Admin', g_rename: '✏️ Rename', g_leave: '🚪 Leave Group',
    g_delete: '🗑 Delete Group', g_leaveQ: 'Leave the group {p}?', g_deleteQ: 'Delete the group {p} for everyone?', g_call: 'Group call', g_callMsg: 'started a group call — join', g_newMsg: '{p} wrote in {g}',
    g_noFriends: 'All your friends are already in the group', g_notReady: 'Groups are still being set up — try again a bit later', g_needName: 'Type a name for the group'
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
  #m3chat .gav{width:30px;height:30px;border-radius:10px;background:#3a2f6b;display:grid;place-items:center;flex:none;font-size:16px}
  #m3chat .who{display:block;font-size:11px;font-weight:700;color:#8ea0ff;margin-bottom:1px;unicode-bidi:plaintext}
  #m3chat .gm{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:#1a1f35} #m3chat .gm span{flex:1;min-width:0;unicode-bidi:plaintext}
  #m3chat .gm .bdg{font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;background:#ffb703;color:#1a1200} #m3chat .gm .bdg.a{background:#8ea0ff}
  #m3chat .gm button,#m3chat .gbt{background:#232a48;color:#eef0ff;border:0;border-radius:8px;padding:5px 8px;font-size:12px}
  #m3chat .gbt{padding:9px;font-size:14px;font-weight:600} #m3chat .gbt.red{background:#4a1822;color:#ffb3bd}
  #m3chat label.pk{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:#1a1f35;cursor:pointer} #m3chat label.pk input{flex:none;width:18px;height:18px}
  [data-mal3ab-chat]{position:relative}
  [data-mal3ab-chat][data-n]::after{content:attr(data-n);position:absolute;top:-6px;right:-6px;background:#ff5d73;color:#fff;border-radius:10px;padding:0 6px;font:700 11px/17px system-ui,sans-serif;min-width:17px;text-align:center}
  .m3ring{display:flex;flex-direction:column;gap:8px;cursor:default;animation:m3pulse 1s infinite} .m3ring .m3rb{display:flex;gap:6px}
  .m3ring button{flex:1;border:0;border-radius:8px;padding:7px 10px;font-weight:700;cursor:pointer} .m3ring .y{background:#3ddc84;color:#06240f} .m3ring .n2{background:#232a48;color:#eef0ff}
  @keyframes m3pulse{50%{box-shadow:0 0 0 6px rgba(255,183,3,.25)}}
  .m3toast{position:fixed;right:16px;top:16px;z-index:100001;background:#1a1f35;color:#eef0ff;border:2px solid #ffb703;border-radius:12px;padding:10px 14px;font:600 14px 'Segoe UI',Tahoma,sans-serif;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.45)}
  .ar #m3chat .bd,.ar #m3chat .hd,.ar #m3chat .ft{direction:rtl}`;
  document.head.appendChild(css);

  const esc = (s) => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, Object.assign({ p_token: Auth.token }, args || {})); if (error) throw new Error(error.message); return data; };
  const C = { open: false, friends: [], groups: [], gunread: {}, group: null, view: 'list', friend: null, msgs: [], lastId: 0, unread: {}, inbox: null, polls: [], el: null, seen: {} };
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
    await Promise.all([loadFriends(), loadGroups()]);
    const f = friendId && C.friends.find(x => x.id === friendId);
    if (f) openConv(f); else if (C.friend) openConv(C.friend); else if (C.group) openGroup(C.groups.find(g => g.id === C.group.id) || C.group); else drawList();
  };
  C.close = () => { if (C.el) C.el.hidden = true; C.open = false; };
  const head = (title, back, kind) => `<div class="hd">${back ? `<button class="x" data-a="back">${t('chat_back')}</button>` : ''}<b>${title}</b>${kind === 'group' ? `<button class="x" data-a="gcall" title="${t('g_call')}">📞</button><button class="x" data-a="members" title="${t('g_members')}">👥</button>` : back && kind !== 'plain' ? `<button class="x" data-a="call" title="${t('chat_call')}">📞</button><button class="x" data-a="clear" title="${t('chat_clear')}">🗑</button>` : ''}<button class="x" data-a="close">✕</button></div>`;
  function wire() {
    C.el.querySelectorAll('[data-a="close"]').forEach(b => b.onclick = C.close);
    C.el.querySelectorAll('[data-a="back"]').forEach(b => b.onclick = () => { if (C.view === 'members' && C.group) openGroup(C.group); else { C.friend = null; C.group = null; drawList(); } });
    C.el.querySelectorAll('[data-a="gcall"]').forEach(b => b.onclick = startGroupCall);
    C.el.querySelectorAll('[data-a="members"]').forEach(b => b.onclick = () => drawMembers(C.group));
    C.el.querySelectorAll('[data-a="clear"]').forEach(b => b.onclick = askClear);
    C.el.querySelectorAll('[data-a="call"]').forEach(b => b.onclick = startCall);
  }
  async function loadFriends() { try { const d = await Friends.list(); C.friends = (d && d.friends) || []; } catch (e) {} }
  function drawList() {
    C.friend = null; C.group = null; C.view = 'list';
    const list = [...C.friends].sort((a, b) => (C.unread[b.id] || 0) - (C.unread[a.id] || 0) || (b.online - a.online));
    const groups = C.groups.map(g => `<button class="fr" data-g="${g.id}"><i class="gav">👥</i><span><b dir="auto">${esc(g.name)}</b><br><small>${t('g_n', { n: (g.members || []).length })} · 🟢 ${(g.members || []).filter(m => m.online).length}</small></span>${g.unread ? `<i class="n">${g.unread}</i>` : ''}</button>`).join('');
    C.el.innerHTML = head(t('chat_title')) + `<div class="bd"><p class="muted" style="padding:4px">👥 ${t('g_groups')}</p>${groups}${list.length ? `<button class="gbt" data-a="newgroup">${t('g_new')}</button>` : ''}${list.length ? `<p class="muted" style="padding:4px">${t('chat_friends')}</p>` + list.map(f =>
      `<button class="fr" data-f="${f.id}"><i class="dot ${f.online ? 'on' : ''}"></i><span><b dir="auto">${esc(f.username)}</b><br><small>${t(f.online ? 'chat_online' : 'chat_offline')}</small></span>${C.unread[f.id] ? `<i class="n">${C.unread[f.id]}</i>` : ''}</button>`).join('')
      : `<p class="muted">${t('chat_noFriends')}</p>`}</div>`;
    wire(); C.el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => openConv(C.friends.find(f => f.id === b.dataset.f)));
    C.el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => openGroup(C.groups.find(g => String(g.id) === b.dataset.g)));
    C.el.querySelectorAll('[data-a="newgroup"]').forEach(b => b.onclick = drawNewGroup);
  }
  // ---------------- group chats: friends talking together, with one group call ----------------
  async function loadGroups() { try { C.groups = await rpc('group_list') || []; C.gOk = true; } catch (e) { C.groups = C.groups || []; } groupBadges(); }
  function groupBadges() { C.gunread = {}; for (const g of C.groups) if (g.unread && !(C.open && C.group && C.group.id === g.id)) C.gunread[g.id] = g.unread; badges(); }
  function drawNewGroup() {
    C.view = 'newgroup';
    C.el.innerHTML = head(t('g_new'), true, 'plain') + `<div class="bd"><input id="gName" dir="auto" maxlength="40" placeholder="${t('g_name')}"><p class="muted" style="padding:4px">${t('g_pick')}</p>
      ${C.friends.map(f => `<label class="pk"><input type="checkbox" value="${f.id}"><i class="dot ${f.online ? 'on' : ''}"></i><b dir="auto">${esc(f.username)}</b></label>`).join('')}<p class="muted" id="gErr" style="padding:4px;color:#ff8a9a"></p></div>
      <div class="ft"><button class="snd" style="padding:10px" id="gMake">${t('g_create')}</button></div>`;
    wire();
    C.el.querySelector('#gMake').onclick = async (e) => {
      const name = C.el.querySelector('#gName').value.trim(), ids = [...C.el.querySelectorAll('label.pk input:checked')].map(i => i.value), err = C.el.querySelector('#gErr');
      if (!name) { err.textContent = t('g_needName'); C.el.querySelector('#gName').focus(); return; }
      e.currentTarget.disabled = true;
      try { const g = await rpc('group_create', { p_name: name, p_members: ids }); for (const id of ids) ping(id, { group: g.id }); await loadGroups(); openGroup(C.groups.find(x => x.id === g.id) || g); }
      catch (ex) { err.textContent = /Could not find the function|schema cache/.test(ex.message) ? t('g_notReady') : ex.message; e.currentTarget.disabled = false; }
    };
  }
  async function openGroup(g) {
    if (!g) return drawList();
    C.friend = null; C.group = g; C.view = 'group'; C.msgs = []; C.lastId = 0;
    C.el.innerHTML = head(`<i class="gav" style="display:inline-grid;width:24px;height:24px;font-size:13px;margin-inline-end:6px;vertical-align:middle">👥</i>${esc(g.name)}`, true, 'group') +
      `<div class="bd" id="m3msgs"></div><div class="ft"><button class="iv" id="m3inv">${t('chat_invite')}</button>
       <div class="row"><input id="m3in" dir="auto" maxlength="1000" placeholder="${t('chat_type')}" autocomplete="off"><button class="snd" id="m3snd">${t('chat_send')}</button></div></div>`;
    wire(); wireInput();
    await fetchNew(); g.unread = 0; groupBadges(); setTimeout(() => { const i = C.el.querySelector('#m3in'); if (i) i.focus(); }, 50);
  }
  const others = (g) => (g.members || []).map(m => m.id).filter(id => id !== Auth.user.id);
  function drawMembers(g) {
    if (!g) return; C.view = 'members';
    const me = (g.members || []).find(m => m.id === Auth.user.id) || {}, my = me.role || g.role, boss = my === 'owner' || my === 'admin';
    const badge = (r) => r === 'owner' ? `<i class="bdg">${t('g_owner')}</i>` : r === 'admin' ? `<i class="bdg a">${t('g_admin')}</i>` : '';
    const acts = (m) => {
      if (m.id === Auth.user.id || m.role === 'owner' || !boss || (my === 'admin' && m.role === 'admin')) return '';
      return (my === 'owner' ? `<button data-m="${m.role === 'admin' ? 'remove_admin' : 'make_admin'}" data-u="${m.id}">${t(m.role === 'admin' ? 'g_unAdmin' : 'g_makeAdmin')}</button>` : '') + `<button data-m="remove" data-u="${m.id}">${t('g_remove')}</button>`;
    };
    const addable = C.friends.filter(f => !(g.members || []).some(m => m.id === f.id));
    C.el.innerHTML = head(`👥 ${esc(g.name)}`, true, 'plain') + `<div class="bd"><p class="muted" style="padding:4px">${t('g_members')} (${(g.members || []).length})</p>
      ${(g.members || []).map(m => `<div class="gm"><i class="dot ${m.online ? 'on' : ''}"></i><span><b dir="auto">${esc(m.username)}</b></span>${badge(m.role)}${acts(m)}</div>`).join('')}
      ${boss ? `<p class="muted" style="padding:4px">${t('g_add')}</p>` + (addable.length ? addable.map(f => `<div class="gm"><i class="dot ${f.online ? 'on' : ''}"></i><span><b dir="auto">${esc(f.username)}</b></span><button data-m="add" data-u="${f.id}">➕</button></div>`).join('') : `<p class="muted" style="padding:4px">${t('g_noFriends')}</p>`) : ''}
      ${boss ? `<button class="gbt" data-m="rename">${t('g_rename')}</button>` : ''}<button class="gbt red" data-m="leave">${t('g_leave')}</button>${my === 'owner' ? `<button class="gbt red" data-m="delete">${t('g_delete')}</button>` : ''}
      <p class="muted" id="gErr" style="padding:4px;color:#ff8a9a"></p></div>`;
    wire();
    C.el.querySelectorAll('[data-m]').forEach(b => b.onclick = async () => {
      const action = b.dataset.m, target = b.dataset.u || null; let name = null;
      if (action === 'rename') { name = prompt(t('g_name'), g.name); if (!name) return; }
      if (action === 'leave' && !confirm(t('g_leaveQ', { p: g.name }))) return;
      if (action === 'delete' && !confirm(t('g_deleteQ', { p: g.name }))) return;
      try {
        const res = await rpc('group_manage', { p_group: g.id, p_action: action, p_target: target, p_name: name });
        for (const id of others(g).concat(target ? [target] : [])) ping(id, { group: g.id });
        await loadGroups();
        if (!res) { drawList(); return; }
        C.group = C.groups.find(x => x.id === g.id) || res; drawMembers(C.group);
      } catch (ex) { const e = C.el.querySelector('#gErr'); if (e) e.textContent = ex.message; }
    });
  }
  function startGroupCall() {
    const g = C.group; if (!g) return;
    const link = ROOT() + 'call.html?room=g-' + g.id, ids = others(g);
    openCall(link + (ids.length ? '&ring=' + ids.join(',') : ''));
    const name = (Auth.profile && Auth.profile.username) || '';
    rpc('group_send', { p_group: g.id, p_body: '📞 ' + t('g_callMsg') + '\n' + link, p_kind: 'call', p_meta: { link } }).then(fetchNew).catch(() => {});
    for (const id of ids) ping(id, { call: link, name: name + ' · ' + g.name, group: g.id });
  }
  async function openConv(f) {
    C.friend = f; C.group = null; C.view = 'conv'; C.msgs = []; C.lastId = 0; outCh(f.id);
    C.el.innerHTML = head(`<i class="dot ${f.online ? 'on' : ''}" style="display:inline-block;margin-inline-end:6px"></i>${esc(f.username)}`, true) +
      `<div class="bd" id="m3msgs"></div><div class="ft"><button class="iv" id="m3inv">${t('chat_invite')}</button>
       <div class="row"><input id="m3in" dir="auto" maxlength="1000" placeholder="${t('chat_type')}" autocomplete="off"><button class="snd" id="m3snd">${t('chat_send')}</button></div></div>`;
    wire(); wireInput();
    await fetchNew(); delete C.unread[f.id]; badges(); setTimeout(() => C.el.querySelector('#m3in').focus(), 50);
  }
  function wireInput() {
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
  }
  // ---- calls: a separate page (call.html) with mic, camera, people and screen sharing ----
  const ROOT = () => location.href.replace(/games\/.*$/, '').replace(/[^/]*$/, '');
  const openCall = (link) => { const w = window.open(link, '_blank'); if (!w) location.href = link; };
  async function startCall() {
    const f = C.friend; if (!f) return;
    const room = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
    const link = ROOT() + 'call.html?room=' + room;
    openCall(link + '&ring=' + f.id);                                 // opens right away (still inside the click); my copy knows whom it rings
    try { await rpc('chat_send', { p_to: f.id, p_body: '📞 ' + t('chat_callMsg') + '\n' + link, p_kind: 'call', p_meta: { link } }); await fetchNew(); ping(f.id, { call: link, name: (Auth.profile && Auth.profile.username) || '' }); } catch (e) {}
  }
  let ringT = 0, ringEl = null; C.ring = (n, l, f) => ring(n, l, f);   // (also used by tests)
  const roomOf = (l) => ((l || '').match(/[?&]room=([a-zA-Z0-9-]+)/) || [])[1] || '';
  function ring(name, link, from) {
    if (ringEl) ringEl.remove(); clearInterval(ringT);
    const d = ringEl = document.createElement('div'); d.className = 'm3toast m3ring'; d.dataset.room = roomOf(link);
    d.innerHTML = `<div>${esc(t('chat_calling', { p: name || '…' }))}</div><div class="m3rb"><button class="y">${t('chat_callJoin')}</button><button class="n2">${t('chat_decline')}</button></div>`;
    const stop = () => { clearInterval(ringT); d.remove(); ringEl = null; };
    d.querySelector('.y').onclick = (e) => { e.stopPropagation(); stop(); openCall(link); };
    d.querySelector('.n2').onclick = (e) => { e.stopPropagation(); stop(); if (from && Auth.user) ping(from, { declined: link, name: (Auth.profile && Auth.profile.username) || '' }); };   // the caller is told
    document.body.appendChild(d);
    let n = 0; const beep = () => { try { const A = C.ac || (C.ac = new (window.AudioContext || window.webkitAudioContext)()), o = A.createOscillator(), g = A.createGain(); o.frequency.value = n % 2 ? 660 : 880; g.gain.setValueAtTime(0.08, A.currentTime); g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + 0.35); o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + 0.4); } catch (e) {} };
    beep(); ringT = setInterval(() => { if (++n > 40) stop(); else beep(); }, 750);
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
      if (C.group && !mine) return html1(m, mine, time).replace(/^(<div class="m3m "[^>]*>)/, `$1<span class="who">${esc(m.from_name || '…')}</span>`);
      return html1(m, mine, time);
    };
    const html1 = (m, mine, time) => {
      if (m.kind === 'call' && m.meta && m.meta.link) return `<div class="m3m ${mine ? 'me' : ''}"><div class="inv"><div class="m3t" dir="auto">📞 ${esc(mine ? (C.group ? t('g_call') : t('chat_call')) : (C.group ? t('g_callMsg') : t('chat_callMsg')))}</div><button data-call="${esc(m.meta.link)}">${t('chat_callJoin')}</button></div><span class="tm" dir="ltr">${time}</span></div>`;
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
    box.querySelectorAll('[data-call]').forEach(b => b.onclick = () => openCall(b.dataset.call));
    box.scrollTop = box.scrollHeight;
  }
  async function fetchNew() {
    const f = C.friend || C.group; if (!f) return;
    try {
      const rows = (C.group ? await rpc('group_messages_list', { p_group: f.id, p_after: C.lastId, p_limit: 80 }) : await rpc('chat_list', { p_friend: f.id, p_after: C.lastId, p_limit: 80 })) || [];
      if ((C.friend || C.group) !== f) return;
      const fresh = rows.filter(r => r.id > C.lastId); if (!fresh.length && C.lastId) return;
      const first = !C.lastId; C.msgs.push(...fresh); if (fresh.length) C.lastId = fresh[fresh.length - 1].id;
      first ? drawMsgs() : drawMsgs(fresh);
    } catch (e) {}
  }
  async function send(text, kind, meta) {
    text = String(text || '').trim(); const f = C.friend, g = C.group; if (!text || (!f && !g)) return;
    try {
      if (g) { await rpc('group_send', { p_group: g.id, p_body: text, p_kind: kind || 'text', p_meta: meta || null }); await fetchNew(); for (const id of others(g)) ping(id, { group: g.id, gname: g.name, name: (Auth.profile && Auth.profile.username) || '' }); return; }
      await rpc('chat_send', { p_to: f.id, p_body: text, p_kind: kind || 'text', p_meta: meta || null }); await fetchNew(); ping(f.id); }
    catch (e) { const box = C.el.querySelector('#m3msgs'); if (box) box.insertAdjacentHTML('beforeend', `<p class="muted">${t('chat_err')}</p>`); }
  }
  // instant delivery: a ping on the friend's inbox channel (the message itself stays in the database)
  const out = {};
  function outCh(id) {   // opened as soon as a conversation opens, so the ping leaves instantly on send
    let ch = out[id];
    if (!ch) { ch = out[id] = sb.channel('inbox-' + id, { config: { broadcast: { self: false, ack: false } } }); ch._ready = new Promise(res => ch.subscribe(s => { if (s === 'SUBSCRIBED') res(); })); }
    return ch;
  }
  C.ping = (id, extra) => ping(id, extra);
  function ping(id, extra) { const ch = outCh(id); ch._ready.then(() => ch.send({ type: 'broadcast', event: 'ping', payload: Object.assign({ from: Auth.user.id }, extra || {}) })); }
  function badges() {
    const n = Object.values(C.unread).reduce((a, b) => a + b, 0) + Object.values(C.gunread || {}).reduce((a, b) => a + b, 0);
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
      badges(); if (C.open && C.view === 'list') drawList();
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
  document.addEventListener('langchange', () => { if (C.open) { C.friend ? openConv(C.friend) : C.group ? openGroup(C.group) : drawList(); } });
  async function start() {
    if (!Auth.token || !Auth.user) return;
    if (C.inbox) return;
    C.inbox = sb.channel('inbox-' + Auth.user.id, { config: { broadcast: { self: false } } });
    C.inbox.on('broadcast', { event: 'ping' }, ({ payload }) => {
      try { document.dispatchEvent(new CustomEvent('mal3ab-ping', { detail: payload })); } catch (e) {}
      if (payload && payload.call && /\/call\.html\?room=/.test(payload.call)) ring(payload.name, payload.call, payload.from);
      if (payload && payload.cancel && ringEl && ringEl.dataset.room === roomOf(payload.cancel)) { clearInterval(ringT); ringEl.remove(); ringEl = null; const m = document.createElement('div'); m.className = 'm3toast'; m.textContent = t('chat_missed', { p: payload.name || '…' }); m.onclick = () => m.remove(); document.body.appendChild(m); setTimeout(() => m.remove(), 8000); }   // the caller hung up
      if (payload && (payload.cancel || payload.declined)) return;
      if (payload && payload.group) {   // something happened in one of my groups
        if (C.open && C.group && C.group.id === payload.group) { fetchNew(); return; }
        loadGroups().then(() => { if (C.open && C.view === 'list') drawList(); if (payload.gname && !payload.call) { document.querySelectorAll('.m3toast:not(.m3ring)').forEach(e => e.remove()); const d = document.createElement('div'); d.className = 'm3toast'; d.textContent = '👥 ' + t('g_newMsg', { p: payload.name || '…', g: payload.gname }); d.onclick = () => { d.remove(); C.show().then(() => openGroup(C.groups.find(x => x.id === payload.group))); }; document.body.appendChild(d); setTimeout(() => d.remove(), 6000); } });
        return;
      }
      if (C.open && C.friend && payload && payload.from === C.friend.id) fetchNew(); else refreshUnread(true); });
    C.inbox.subscribe();
    await refreshUnread(false);
    loadGroups();
    setInterval(() => { if (C.open && (C.friend || C.group)) fetchNew(); }, 4000);
    setInterval(() => { if (C.gOk) loadGroups().then(() => { if (C.open && C.view === 'list') drawList(); }); }, 20000);
    setInterval(() => refreshUnread(false), 12000);
    setInterval(badges, 2000);
  }
  // wait until the account is known
  const tryStart = () => { if (window.Auth && Auth.token && Auth.user) start(); };
  document.addEventListener('mal3abready', tryStart); setTimeout(tryStart, 1500); setTimeout(tryStart, 5000);
  const iv = setInterval(() => { tryStart(); if (C.inbox) clearInterval(iv); }, 3000);
})();
