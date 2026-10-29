// Mal3ab — Turf Rush invite links: ?join=CODE enters the game code automatically; a button copies the link.
(function () {
  const $ = (id) => document.getElementById(id);
  const AR = () => (window.getLang ? getLang() : 'ar') === 'ar';
  const base = location.href.split('?')[0];
  const row = $('newCodeBtn') && $('newCodeBtn').parentElement;
  if (row) {
    const b = document.createElement('button'); b.className = 'mini'; b.type = 'button';
    b.textContent = AR() ? '🔗 نسخ لينك الدعوة' : '🔗 Copy invite link';
    b.onclick = () => {
      let code = $('code').value.trim().toUpperCase();
      if (!code) { $('newCodeBtn').click(); code = $('code').value.trim().toUpperCase(); }
      navigator.clipboard.writeText(base + '?join=' + code).then(() => { const o = b.textContent; b.textContent = '✓'; setTimeout(() => b.textContent = o, 1200); });
    };
    row.appendChild(b);
  }
  const join = new URLSearchParams(location.search).get('join');
  if (join) {
    const go = () => { $('tabOnline') && $('tabOnline').click(); $('code').value = join.toUpperCase(); $('goBtn').click(); };
    // wait for the account name to be filled in by cloud.js, then enter the game
    setTimeout(go, 1500);
  }
})();
