// Mal3ab — Voxel quick invites: short room codes / links instead of pasting long codes.
// Uses the game's own peer-to-peer net (hostInvite / join / hostAccept); Supabase only carries the handshake.
(function () {
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const T = (ar, en) => AR() ? ar : en;
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randCode = () => Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const base = location.href.split('?')[0];
  const ready = () => !!(window.sb && window.Net && typeof net !== 'undefined' && typeof mpSay === 'function');
  async function waitReady() { for (let i = 0; i < 100 && !ready(); i++) await new Promise(r => setTimeout(r, 100)); return ready(); }

  async function host() {
    const box = document.getElementById('mal3abVoxel'), out = box.querySelector('.out');
    out.textContent = T('بجهّز الدعوة…', 'Preparing invite…');
    try {
      const offer = await net.hostInvite();
      let code = null;
      for (let i = 0; i < 5 && !code; i++) {
        const c = randCode();
        const { error } = await sb.from('rooms').insert({ code: c, game: 'voxel', state: { offer }, players: 1, p1_name: net.name });
        if (!error) code = c;
      }
      const link = base + '?join=' + code;
      out.innerHTML = `<div class="code">${code}</div><div class="link">${link}</div>
        <button id="mvCopy">${T('نسخ اللينك', 'Copy link')}</button> <span class="wait">${T('مستني صاحبك يفتح اللينك…', 'Waiting for your friend to open the link…')}</span>`;
      box.querySelector('#mvCopy').onclick = (e) => navigator.clipboard.writeText(link).then(() => e.target.textContent = '✓');
      // wait for the friend's answer
      const stop = Net.watch(code, async (room) => {
        if (room.state && room.state.answer) {
          stop();
          try { await net.hostAccept(room.state.answer); box.querySelector('.wait').textContent = '✅ ' + T('اتوصل!', 'Connected!'); mpSay(T('صاحبك دخل العالم.', 'Your friend joined the world.')); }
          catch (e) { box.querySelector('.wait').textContent = e.message; }
        }
      });
    } catch (e) { out.textContent = e.message; }
  }

  async function joinByCode(code) {
    const room = await Net.get(code.toUpperCase());
    if (!room || !room.state || !room.state.offer) { alert(T('الكود ده مش موجود', 'That code does not exist')); return; }
    document.getElementById('mp').classList.remove('hidden');
    mpSay(T('بوصّلك بعالم صاحبك…', 'Connecting to your friend\'s world…'));
    try {
      const answer = await net.join(room.state.offer);
      await Net.push(code.toUpperCase(), { offer: room.state.offer, answer });
      mpSay(T('اتبعت الرد… ثواني وتدخل العالم.', 'Reply sent… you will be in the world in a moment.'));
    } catch (e) { mpSay(e.message); }
  }

  (async () => {
    if (!await waitReady()) return;
    const mpBox = document.getElementById('mpBox');
    const sec = document.createElement('div'); sec.id = 'mal3abVoxel';
    sec.innerHTML = `
      <style>#mal3abVoxel{margin:10px 0;padding:10px;border:1px solid #ffb703;border-radius:10px;background:rgba(255,183,3,.08)}
        #mal3abVoxel .code{font-size:24px;font-weight:800;letter-spacing:5px;color:#ffb703}#mal3abVoxel .link{font-size:11px;color:#9aa3c7;word-break:break-all;margin:4px 0}
        #mal3abVoxel input{text-transform:uppercase;letter-spacing:3px;width:90px}</style>
      <b>⚡ ${T('دعوة سريعة (Mal3ab)', 'Quick invite (Mal3ab)')}</b>
      <p style="font-size:12px;color:#9aa3c7;margin:4px 0">${T('بدل الأكواد الطويلة: اعمل لينك وابعته، وصاحبك يفتحه ويدخل على طول.', 'Instead of long codes: make a link, send it, your friend opens it and joins.')}</p>
      <button id="mvHost">🔗 ${T('اعمل لينك دعوة', 'Create invite link')}</button>
      <div class="out"></div>
      <div style="margin-top:8px">${T('عندك كود؟', 'Have a code?')} <input id="mvCode" maxlength="4" placeholder="ABCD"> <button id="mvJoin">${T('ادخل', 'Join')}</button></div>`;
    mpBox.insertBefore(sec, mpBox.querySelector('.cols'));
    sec.querySelector('#mvHost').onclick = host;
    sec.querySelector('#mvJoin').onclick = () => { const c = sec.querySelector('#mvCode').value.trim(); if (c.length === 4) joinByCode(c); };
    const join = new URLSearchParams(location.search).get('join');
    if (join) setTimeout(() => joinByCode(join), 1500);
  })();
})();
