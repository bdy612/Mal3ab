// Mal3ab bridge for the standalone games:
//  - cloud saves: the game's localStorage keys are mirrored to the account's "saves" table
//  - player / mayor name taken from the website account
// Usage: <script src="../shared/cloud.js" data-game="cityhall" data-keys="cityhall-save" data-name-input="#mpName"></script>
(function () {
  const me = document.currentScript;
  const GAME = me.dataset.game, KEYS = (me.dataset.keys || '').split(',').filter(Boolean), NAME_INPUT = me.dataset.nameInput;
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

    // slim bar at the very top of the page (in normal flow, so it never covers the game)
    const onReady = () => {
      const bar = document.createElement('div'); bar.id = 'mal3ab-bar';
      bar.innerHTML = `<a href="${depth}index.html">🏠 ${t('home')}</a>
        <span class="name">${name ? (GAME === 'cityhall' ? t('mayor') + ': ' : '👤 ') + name : ''}</span>
        <span id="mal3ab-bar-slot"></span>
        <button onclick="location.reload()">${t("tryAgain")}</button>`;
      document.body.prepend(bar);
      if (name && NAME_INPUT) { const inp = document.querySelector(NAME_INPUT); if (inp) { inp.value = name; inp.dispatchEvent(new Event('change')); inp.dispatchEvent(new Event('input')); } }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady); else onReady();

    if (!Auth.token || !KEYS.length) return;

    // 1) first visit this session: pull cloud saves into localStorage, then reload so the game starts from them
    let synced = false; try { synced = sessionStorage.getItem(SYNC_FLAG) === '1'; } catch (e) {}
    if (!synced) {
      const saves = await Auth.loadSaves(GAME);
      let changed = false;
      for (const k of KEYS) {
        if (saves[k] == null) continue;
        const v = typeof saves[k] === 'string' ? saves[k] : JSON.stringify(saves[k]);
        if (localStorage.getItem(k) !== v) { localStorage.setItem(k, v); changed = true; }
      }
      try { sessionStorage.setItem(SYNC_FLAG, '1'); } catch (e) {}
      if (changed) { location.reload(); return; }
    }

    // 2) mirror every later localStorage write of those keys to the cloud (debounced)
    const timers = {};
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      orig.call(this, k, v);
      if (this === localStorage && KEYS.includes(k)) {
        clearTimeout(timers[k]);
        timers[k] = setTimeout(() => { let data; try { data = JSON.parse(v); } catch (e) { data = v; } Auth.saveGame(GAME, k, data); }, 1500);
      }
    };
    const origRemove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (k) {
      origRemove.call(this, k);
      if (this === localStorage && KEYS.includes(k)) Auth.saveGame(GAME, k, null);
    };
  })();
})();
