// Mal3ab bridge for the standalone games:
//  - cloud saves: the game's localStorage keys are mirrored to the account's "saves" table
//  - player / mayor name taken from the website account
// Usage: <script src="../shared/cloud.js" data-game="cityhall" data-keys="cityhall-save" data-name-input="#mpName"></script>
(function () {
  const me = document.currentScript;
  const GAME = me.dataset.game, KEYS = (me.dataset.keys || '').split(',').filter(Boolean), NAME_INPUT = me.dataset.nameInput;
  const keyMatch = (k) => KEYS.some(p => p.endsWith('*') ? k.startsWith(p.slice(0, -1)) : k === p);
  const depth = me.getAttribute('src').startsWith('../../') ? '../../' : '../';
  document.body && document.body.setAttribute('data-mal3ab', GAME);
  document.addEventListener('DOMContentLoaded', () => document.body.setAttribute('data-mal3ab', GAME));

  // load supabase + net.js, then sync
  const load = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const SYNC_FLAG = 'mal3ab_synced_' + GAME;
  // English buttons, tabs and headings in Title Case ("Play Online", "Same Keyboard") in the games that ship English-only UI
  function capitalise() {
    if (!['turfrush', 'pitch', 'cityhall'].includes(GAME) || !window.titleCase || !document.body) return;
    const SEL = 'button, .tab, label, h1, h2, h3, h4, th, option, a.btn, summary, legend';
    const fix = () => document.querySelectorAll(SEL).forEach(el => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) if (/[a-z]/.test(n.nodeValue)) { const v = titleCase(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    });
    let tm = 0; fix(); new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(fix, 150); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  (async () => {
    try {
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
      if (!window.t) await load(depth + 'shared/i18n.js?v=1793356220');
      if (!window.Auth) await load(depth + 'shared/net.js?v=1793356220');
      await Auth.init();
    } catch (e) { window.Mal3abReady = true; document.dispatchEvent(new Event('mal3abready')); return; }
    window.Mal3abReady = true; document.dispatchEvent(new Event('mal3abready'));   // games that wait for the account
    capitalise();
    const name = Auth.name();

    // Mal3ab controls placed INSIDE each game's own UI (no bar, no overlays)
    const homeHref = depth + 'play.html';
    const label = name ? (GAME === 'cityhall' ? t('mayor') + ': ' : '👤 ') + name : '';
    const onReady = () => {
      if (name && NAME_INPUT) { const inp = document.querySelector(NAME_INPUT); if (inp) { inp.value = name; inp.dispatchEvent(new Event('change')); inp.dispatchEvent(new Event('input')); } }
      if (GAME === 'turfrush') {                     // same keyboard: the orange painter is you (or "Player 1" with no name)
        const n1 = document.getElementById('name1');
        if (n1) { n1.value = name || 'Player 1'; n1.dispatchEvent(new Event('change')); n1.dispatchEvent(new Event('input')); const lab = document.getElementById('n1'); if (lab) lab.textContent = n1.value; }
      }
      if (GAME === 'cityhall') {                     // top panel: mayor stat after the date, home button after "?"
        const top = document.getElementById('top');
        if (top) {
          if (label) { const st = document.createElement('div'); st.className = 'stat'; st.innerHTML = `<b>${name}</b><span>${t('mayor')}</span>`; top.insertBefore(st, document.getElementById('spd0')); }
          const h = document.createElement('button'); h.textContent = '🏠'; h.title = t('home'); h.onclick = () => location.href = homeHref; top.appendChild(h);
          const c = document.createElement('button'); c.textContent = '💬'; c.title = 'Chat'; c.setAttribute('data-mal3ab-chat', ''); top.appendChild(c);
        }
      } else if (GAME === 'turfrush') {              // footer controls row
        const ctrl = document.querySelector('.ctrl');
        if (ctrl) {
          if (label) { const n = document.createElement('span'); n.className = 'mini mal3ab-name'; n.textContent = label; ctrl.prepend(n); }
          const h = document.createElement('button'); h.className = 'mini'; h.type = 'button'; h.textContent = '🏠 ' + t('home').replace('← ', ''); h.onclick = () => location.href = homeHref; ctrl.appendChild(h);
          const c = document.createElement('button'); c.className = 'mini'; c.type = 'button'; c.textContent = '💬'; c.title = 'Chat'; c.setAttribute('data-mal3ab-chat', ''); ctrl.appendChild(c);
        }
      } else if (GAME === 'pitch') {                 // wallet pills next to tokens / shards
        const w = document.querySelector('.wallet');
        if (w) {
          if (label) { const n = document.createElement('span'); n.className = 'pill'; n.textContent = label; w.appendChild(n); }
          const h = document.createElement('a'); h.className = 'pill mal3ab-home'; h.href = homeHref; h.textContent = '🏠'; h.title = t('home'); w.appendChild(h);
          const c = document.createElement('a'); c.className = 'pill mal3ab-home'; c.href = '#'; c.textContent = '💬'; c.title = 'Chat'; c.setAttribute('data-mal3ab-chat', ''); w.appendChild(c);
        }
      } else if (GAME === 'voxel') {                 // account name becomes the Voxel profile name; home bubble bottom-left
        try {   // profile name = account name; the game reads it at start-up, so set it and reload once
          const pr = JSON.parse(localStorage.getItem('voxel-profile') || '{}');
          if (name && pr.name !== name && !sessionStorage.getItem('mal3ab_voxel_named')) {
            sessionStorage.setItem('mal3ab_voxel_named', '1'); pr.name = name; localStorage.setItem('voxel-profile', JSON.stringify(pr)); location.reload(); return;
          }
        } catch (e) {}
        const box = document.createElement('div'); box.className = 'mal3ab-bubbles';
        box.innerHTML = `<a class="bubble" href="${homeHref}" title="${t('home')}">🏠</a><a class="bubble" href="#" title="Chat" data-mal3ab-chat>💬</a>`;
        document.body.appendChild(box);
        // "invite to this game" in the chat: a link that joins the world I am hosting right now
        window.Mal3abShareLink = () => {
          const base = location.href.split('?')[0];
          if (typeof game !== 'undefined' && game.state === 'playing' && game.meta && !game.meta.remote && typeof PROFILE !== 'undefined' && PROFILE.code)
            return base + '?joinFriend=' + encodeURIComponent(PROFILE.code) + '&fname=' + encodeURIComponent(PROFILE.name || name || '');
          // I'm a guest in someone else's world: the link joins that host
          if (typeof game !== 'undefined' && game.state === 'playing' && game.meta && game.meta.remote && typeof friends !== 'undefined' && friends.lastJoin)
            return base + '?joinFriend=' + encodeURIComponent(friends.lastJoin.code) + '&fname=' + encodeURIComponent(friends.lastJoin.name || '');
          return base;
        };
        // old app: no online play — joining a friend, letting friends in, or swapping codes
        if (window.Mal3abVersion && typeof friends !== 'undefined' && typeof net !== 'undefined') {
          const V = window.Mal3abVersion, oj = friends.join.bind(friends), oa = friends.admit.bind(friends), oh = net.hostInvite.bind(net), on = net.join.bind(net);
          friends.join = (f) => V.gate() ? oj(f) : t('ver_short');
          friends.admit = (c, md) => { if (V.outdated()) { try { c.close(); } catch (e) {} return; } return oa(c, md); };
          net.hostInvite = async () => { if (!V.gate()) throw new Error(t('ver_short')); return oh(); };
          net.join = async (code) => { if (!V.gate()) throw new Error(t('ver_short')); return on(code); };
        }
        // Mal3ab friends are Voxel Sandbox friends too (using each friend's Voxel friend code from their cloud save)
        const syncFriends = async () => {
          if (!Auth.token || typeof friends === 'undefined' || !friends.add || !window.Friends) return;
          try {
            const d = await Friends.list(), list = (d && d.friends) || [];
            for (const f of list) {
              let code = null; try { code = await Friends.voxelCodeOf(f.id); } catch (e) {}
              const norm = code && friends.normCode(code); if (!norm || norm === PROFILE.code) continue;
              const known = friends.list.find(x => x.code === norm);
              if (!known) friends.add(norm, f.username);
              else if (known.name !== cleanName(f.username)) { known.name = cleanName(f.username); friends.save(); friends.changed(); }
            }
          } catch (e) {}
        };
        setTimeout(syncFriends, 2000); setInterval(syncFriends, 60000);
        // a Mal3ab friend knocking (e.g. from a chat invite) whose Voxel code isn't known yet: look it up and let them in
        if (typeof friends !== 'undefined' && friends.onConn) {
          const oc = friends.onConn.bind(friends);
          friends.onConn = (c) => {
            oc(c);
            const md = c.metadata || {}, code = friends.normCode(md.code);
            if (md.k !== 'join' || !code || !friends.requests.some(r => r.code === code)) return;
            syncFriends().then(() => { const req = friends.requests.find(r => r.code === code); if (req && friends.list.some(f => f.code === code)) friends.accept(req); });
          };
        }
        // live "who is online" for Voxel friends through Mal3ab's realtime presence (much steadier than pinging over PeerJS):
        // I show up on my own channel with what I'm doing; I listen on each friend's channel.
        if (window.sb && typeof friends !== 'undefined' && typeof PROFILE !== 'undefined' && PROFILE.code) {
          const P = friends.presence = { online: new Set(), had: new Set(), subs: new Map() };
          const mine = sb.channel('vxp-' + PROFILE.code, { config: { presence: { key: PROFILE.code } } });
          let last = '', joined = false;
          const track = () => { if (!joined) return; let st = null; try { st = friends.myStatus(); } catch (e) {} const j = JSON.stringify(st); if (j === last) return; last = j; mine.track({ code: PROFILE.code, st, at: Date.now() }); };
          // a friend can't reach me on the matchmaking server: make sure I'm registered there
          mine.on('broadcast', { event: 'poke' }, () => { try { if (!friends.peer || friends.peer.destroyed) { friends.peer = null; friends.start(); } else if (friends.peer.disconnected) friends.peer.reconnect(); } catch (e) {} });
          mine.subscribe((st) => { if (st === 'SUBSCRIBED') { joined = true; last = ''; track(); } });
          setInterval(track, 4000);
          const watch = () => {
            for (const f of friends.list) {
              if (P.subs.has(f.code)) continue;
              const ch = sb.channel('vxp-' + f.code, { config: { presence: { key: 'w-' + PROFILE.code, enabled: true } } });   // a key turns presence on (watching only, no track)
              ch.on('presence', { event: 'sync' }, () => look(f.code));
              ch.subscribe(); P.subs.set(f.code, ch);
            }
            for (const code of P.subs.keys()) look(code, true);
          };
          // is this friend on their channel right now? (once we've seen them there, their channel is the truth)
          const look = (code, quiet) => {
            const ch = P.subs.get(code), fr = friends.list.find(x => x.code === code); if (!ch || !fr || ch.state !== 'joined') return;
            const all = ch.presenceState(); let found = null;
            for (const k in all) for (const m of all[k]) if (m.code === code && (!found || (m.at || 0) > (found.at || 0))) found = m;
            const was = fr.online;
            if (found) { P.online.add(code); P.had.add(code); fr.online = true; fr.miss = 0; fr.seen = Date.now(); if (found.st) { fr.state = found.st; if (found.st.name && found.st.name !== 'Player') fr.name = cleanName(found.st.name); } }
            else { P.online.delete(code); if (P.had.has(code)) { fr.online = false; fr.state = null; } }
            if (!quiet || was !== fr.online) friends.changed();
          };
          watch(); setInterval(watch, 8000);
          friends.poke = (code) => { const ch = P.subs.get(code); if (ch) ch.send({ type: 'broadcast', event: 'poke', payload: {} }); };
        }
        // chat invite while at the title screen: open my latest world so the friend's link joins me there
        window.Mal3abPrepareInvite = async () => {
          if (typeof game === 'undefined') return null;
          if (game.state !== 'playing' && typeof WORLDS !== 'undefined' && WORLDS.length && typeof playWorld === 'function') {
            const w = [...WORLDS].sort((a, b) => (b.played || 0) - (a.played || 0))[0]; playWorld(w);
          }
          return window.Mal3abShareLink();
        };
      } else if (document.querySelector('[data-mal3ab-home]')) {   // the game has its own home buttons
        document.querySelectorAll('[data-mal3ab-home]').forEach(h => { h.onclick = (e) => { e.preventDefault(); location.href = homeHref; }; });
      } else {                                       // any other game: small round bubbles in the bottom-left corner
        const box = document.createElement('div'); box.className = 'mal3ab-bubbles';
        box.innerHTML = `<a class="bubble" href="${homeHref}" title="${t('home')}">🏠</a><a class="bubble" href="#" title="Chat" data-mal3ab-chat>💬</a>${label ? `<span class="bubble name">${label}</span>` : ''}`;
        document.body.appendChild(box);
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady); else onReady();

    if (!Auth.token || !KEYS.length) return;

    // 1) first visit this session: pull cloud saves into localStorage, then reload so the game starts from them
    let synced = false; try { synced = sessionStorage.getItem(SYNC_FLAG) === '1'; } catch (e) {}
    if (!synced) {
      const saves = await Auth.loadSaves(GAME);
      let changed = false;
      for (const k of Object.keys(saves)) {
        if (saves[k] == null || !keyMatch(k)) continue;
        const v = typeof saves[k] === 'string' ? saves[k] : JSON.stringify(saves[k]);
        if (localStorage.getItem(k) !== v) { localStorage.setItem(k, v); changed = true; }
      }
      try { sessionStorage.setItem(SYNC_FLAG, '1'); } catch (e) {}
      if (changed) { location.reload(); return; }
    }

    // 1b) upload keys that exist here but not yet in the cloud (e.g. a profile written before this script ran)
    try {
      const saves = await Auth.loadSaves(GAME);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (keyMatch(k) && saves[k] == null) { let d; try { d = JSON.parse(localStorage.getItem(k)); } catch (e) { d = localStorage.getItem(k); } Auth.saveGame(GAME, k, d); }
      }
    } catch (e) {}

    // 2) mirror every later localStorage write of those keys to the cloud (debounced)
    const timers = {};
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      orig.call(this, k, v);
      if (this === localStorage && keyMatch(k)) {
        clearTimeout(timers[k]);
        timers[k] = setTimeout(() => { let data; try { data = JSON.parse(v); } catch (e) { data = v; } Auth.saveGame(GAME, k, data); }, 1500);
      }
    };
    const origRemove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (k) {
      origRemove.call(this, k);
      if (this === localStorage && keyMatch(k)) Auth.saveGame(GAME, k, null);
    };
  })();
})();
