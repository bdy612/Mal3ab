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

  (async () => {
    try {
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
      if (!window.t) await load(depth + 'shared/i18n.js?v=1793347815');
      if (!window.Auth) await load(depth + 'shared/net.js?v=1793347815');
      await Auth.init();
    } catch (e) { window.Mal3abReady = true; document.dispatchEvent(new Event('mal3abready')); return; }
    window.Mal3abReady = true; document.dispatchEvent(new Event('mal3abready'));   // games that wait for the account
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
        }
      } else if (GAME === 'turfrush') {              // footer controls row
        const ctrl = document.querySelector('.ctrl');
        if (ctrl) {
          if (label) { const n = document.createElement('span'); n.className = 'mini mal3ab-name'; n.textContent = label; ctrl.prepend(n); }
          const h = document.createElement('button'); h.className = 'mini'; h.type = 'button'; h.textContent = '🏠 ' + t('home').replace('← ', ''); h.onclick = () => location.href = homeHref; ctrl.appendChild(h);
        }
      } else if (GAME === 'pitch') {                 // wallet pills next to tokens / shards
        const w = document.querySelector('.wallet');
        if (w) {
          if (label) { const n = document.createElement('span'); n.className = 'pill'; n.textContent = label; w.appendChild(n); }
          const h = document.createElement('a'); h.className = 'pill mal3ab-home'; h.href = homeHref; h.textContent = '🏠'; h.title = t('home'); w.appendChild(h);
        }
      } else if (GAME === 'voxel') {                 // account name becomes the Voxel profile name; home bubble bottom-left
        try {   // profile name = account name; the game reads it at start-up, so set it and reload once
          const pr = JSON.parse(localStorage.getItem('voxel-profile') || '{}');
          if (name && pr.name !== name && !sessionStorage.getItem('mal3ab_voxel_named')) {
            sessionStorage.setItem('mal3ab_voxel_named', '1'); pr.name = name; localStorage.setItem('voxel-profile', JSON.stringify(pr)); location.reload(); return;
          }
        } catch (e) {}
        const box = document.createElement('div'); box.className = 'mal3ab-bubbles';
        box.innerHTML = `<a class="bubble" href="${homeHref}" title="${t('home')}">🏠</a>`;
        document.body.appendChild(box);
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
      } else if (document.querySelector('[data-mal3ab-home]')) {   // the game has its own home buttons
        document.querySelectorAll('[data-mal3ab-home]').forEach(h => { h.onclick = (e) => { e.preventDefault(); location.href = homeHref; }; });
      } else {                                       // any other game: small round bubbles in the bottom-left corner
        const box = document.createElement('div'); box.className = 'mal3ab-bubbles';
        box.innerHTML = `<a class="bubble" href="${homeHref}" title="${t('home')}">🏠</a>${label ? `<span class="bubble name">${label}</span>` : ''}`;
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
