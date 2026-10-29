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
      await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
      await load(depth + 'shared/i18n.js');
      await load(depth + 'shared/net.js');
      await Auth.init();
    } catch (e) { return; }
    const name = Auth.name();

    // Mal3ab controls placed INSIDE each game's own UI (no bar, no overlays)
    const homeHref = depth + 'index.html';
    const label = name ? (GAME === 'cityhall' ? t('mayor') + ': ' : '👤 ') + name : '';
    const onReady = () => {
      if (name && NAME_INPUT) { const inp = document.querySelector(NAME_INPUT); if (inp) { inp.value = name; inp.dispatchEvent(new Event('change')); inp.dispatchEvent(new Event('input')); } }
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
