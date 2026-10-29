// Mal3ab Fast Connect for Voxel Sandbox (external — the game itself is untouched).
//   ?world=<id>&friend=<friend code>&fname=<name>  -> host: add the friend, open that world, they are let in automatically
//   ?joinFriend=<host code>&fname=<name>           -> guest: add the host as a friend and join their world
(function () {
  const q = new URLSearchParams(location.search);
  const worldId = q.get('world'), hostCode = q.get('joinFriend');
  if (!worldId && !hostCode) return;
  const wait = (cond, ms, max) => new Promise(r => { let i = 0; const t = setInterval(() => { if (cond() || ++i > max) { clearInterval(t); r(cond()); } }, ms); });
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  (async () => {
    await wait(() => typeof WORLDS !== 'undefined' && typeof playWorld === 'function' && typeof friends !== 'undefined' && typeof startJoin === 'function', 200, 150);
    const fname = q.get('fname') || 'Friend';
    if (worldId) {
      const fc = q.get('friend');
      if (fc && friends.normCode(fc)) friends.add(fc, fname);          // known friends are admitted without a prompt
      const meta = typeof worldById === 'function' ? worldById(worldId) : WORLDS.find(w => w.id === worldId);
      await wait(() => friends.status === 'online', 200, 75);
      if (meta) { playWorld(meta); if (typeof showMsg === 'function') setTimeout(() => showMsg(fname + ' is joining your world...'), 1500); }
      else if (typeof showTitle === 'function') showTitle('That world was not found on this device.');
    } else {
      friends.add(hostCode, fname);
      const f = friends.list.find(x => x.code === friends.normCode(hostCode));
      await wait(() => friends.status === 'online', 200, 150);
      if (!f) return;
      await sleep(4000);                                               // give the host a moment to open the world
      for (let i = 0; i < 6; i++) {                                    // retry while the host is still loading
        startJoin(f);
        await wait(() => net.guest || !friends.joinTarget, 500, 60);
        if (net.guest) break;
        await sleep(5000);
      }
    }
    history.replaceState(null, '', location.pathname);
  })();
})();
