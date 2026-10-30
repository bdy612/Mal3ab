// Cyber Pet — the five mini-games. Each registers in CyberPet._.GAMES and is driven by the framework in pet.js.
(function () {
  'use strict';
  const A = window.CyberPet && window.CyberPet._; if (!A) return;
  const { clamp, lerp, rnd, pick, hr, rr, ell, glowFill, noGlow } = A;
  const TAU = Math.PI * 2;
  A.addStr({
    cp_g_catch: 'اصطاد البايتس', cp_gd_catch: 'اتحرك يمين وشمال واصطاد البايتس اللي نازلة. البايت الدهبي بـ ٥. وابعد عن الفيروسات الحمرا!', cp_gh_catch: 'اسحب بصباعك، أو استخدم ← → / A D',
    cp_g_whack: 'اضرب الباج', cp_gd_whack: 'افعص الباجز قبل ما تهرب. وأوعى تضرب الباكتات الطيبة!', cp_gh_whack: 'اخبط على الباجز',
    cp_g_echo: 'كرر النغمة', cp_gd_echo: 'البِت بيغني نغمة. كررها وراه — وكل جولة بتزيد نوتة.', cp_gh_echo: 'اخبط على الأزرار، أو استخدم الأسهم',
    cp_g_hop: 'نطّة الباكت', cp_gd_hop: 'نط من الفتحات اللي في الفايروول. لو لمسته تتخبط!', cp_gh_hop: 'اخبط، أو دوس Space عشان تنط',
    cp_g_rhythm: 'إيقاع الجليتش', cp_gd_rhythm: 'اضرب النوت مع الإيقاع عشان تهدّي التهنيج. والسرعة بتزيد!', cp_gh_rhythm: 'اخبط على الحارات، أو D F J K',
    cp_j_perfect: 'بيرفكت!', cp_j_good: 'حلو', cp_j_miss: 'فاتت', cp_e_watch: 'ركّز واسمع…', cp_e_turn: 'دورك!', cp_e_wrong: 'غلط! اسمع تاني…', cp_e_great: 'برافو!',
    cp_h_tap: 'اخبط عشان تنط!', cp_combo: 'كومبو ×{n}', cp_integrity: 'السيستم',
  }, {
    cp_g_catch: 'Byte Catcher', cp_gd_catch: 'Move left and right to catch the falling bytes. Golden bytes are worth 5. Dodge the red viruses!', cp_gh_catch: 'Drag, or use ← → / A D',
    cp_g_whack: 'Debug Whack', cp_gd_whack: 'Squash the bugs before they escape. Never hit the friendly packets!', cp_gh_whack: 'Tap or click the bugs',
    cp_g_echo: 'Echo Pattern', cp_gd_echo: 'Your pet sings a pattern. Repeat it back — it gets one note longer every round.', cp_gh_echo: 'Tap the pads, or use the arrow keys',
    cp_g_hop: 'Packet Hop', cp_gd_hop: 'Hop through the gaps in the firewalls. One touch and you crash!', cp_gh_hop: 'Tap, click or press Space to hop',
    cp_g_rhythm: 'Glitch Rhythm', cp_gd_rhythm: 'Hit the notes on the beat to stabilize the glitch. The tempo keeps rising!', cp_gh_rhythm: 'Tap the lanes, or D F J K',
    cp_j_perfect: 'Perfect!', cp_j_good: 'Good', cp_j_miss: 'Miss', cp_e_watch: 'Watch and listen…', cp_e_turn: 'Your turn!', cp_e_wrong: 'Oops! Listen again…', cp_e_great: 'Great!',
    cp_h_tap: 'Tap to hop!', cp_combo: 'Combo ×{n}', cp_integrity: 'System',
  });
  const font = (w, px, mono) => `${w} ${px}px ${mono ? 'ui-monospace, Consolas, monospace' : 'Segoe UI, system-ui, sans-serif'}`;
  function label(g, text, x, y, px, color, glow) {
    g.font = font(800, px); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(text, x, y);
    g.fillStyle = color || '#fff'; if (glow) glowFill(g, glow, 14); g.fillText(text, x, y); noGlow(g);
  }
  const levelUp = (s, x, y) => { A.float(A.T('cp_levelup'), x, y, A.theme().a, 22, true); A.sfx('level'); };

  // ================================================================ 1. Byte Catcher
  A.GAMES.catch = {
    icon: '📥', stage: 1, energy: 8, medals: [25, 60, 120],
    reward: (sc, m) => ({ fx: { data: Math.min(30, 6 + sc * 0.3), happy: 5, cur: 2 }, coins: Math.floor(sc / 4) + m * 5, xp: 8 + Math.min(30, sc * 0.3) }),
    create() {
      const s = { score: 0, level: 1, lives: 3, maxLives: 3, over: false, items: [], x: A.W / 2, tx: A.W / 2, spawn: 0.8, combo: 0, keys: { l: 0, r: 0 }, hurt: 0, eat: 0, sq: 0, dying: 0 };
      const R = () => clamp(Math.min(A.W, A.H) * 0.075, 26, 46), gy = () => A.H - (A.mobile() ? 34 : 46);
      s.hint = () => A.SR('cp_gh_catch');
      function spawn() {
        const pv = Math.min(0.42, 0.14 + s.level * 0.025), r = Math.random();
        const type = r < pv ? 'virus' : r < pv + 0.06 ? 'gold' : (s.lives < 3 && r < pv + 0.09) ? 'heart' : 'byte';
        const sc = Math.sqrt(A.H / 800);
        s.items.push({ type, x: rnd(24, A.W - 24), y: A.top - 10, vy: (150 + s.level * 24) * rnd(0.85, 1.2) * sc, t: 0, wf: rnd(1.5, 3), wa: type === 'virus' && s.level > 3 ? rnd(30, 80) : 0, rot: rnd(0, TAU), vr: rnd(-3, 3), glyph: Math.random() < 0.5 ? '0' : '1' });
      }
      function grab(it) {
        const r = R(), y = gy() - r;
        if (it.type === 'virus') { s.lives--; s.combo = 0; s.hurt = 0.7; A.shake(9); A.sfx('crash'); A.burst(it.x, it.y, 18, { color: ['#ff2a6d', '#ff8fa3'], max: 260 }); if (s.lives <= 0) s.dying = 0.6; return; }
        s.eat = 0.35; s.sq = 0.18;
        if (it.type === 'heart') { s.lives = Math.min(s.maxLives, s.lives + 1); A.float('❤', it.x, y - r, '#ff5d9e', 22, true); A.sfx('sparkle'); return; }
        const pts = it.type === 'gold' ? 5 : 1 + (s.combo >= 10 ? 1 : 0); s.score += pts; s.combo++;
        A.sfx(it.type === 'gold' ? 'perfect' : 'good'); A.burst(it.x, it.y, 8, { color: it.type === 'gold' ? ['#ffd23e', '#fff'] : ['#3ef0ff', '#fff'], max: 160, s0: 2, s1: 4 });
        A.float('+' + pts, it.x, y - r * 1.4, it.type === 'gold' ? '#ffd23e' : '#bff9ff', 18, true);
        if (s.combo > 0 && s.combo % 10 === 0) { A.float(A.T('cp_combo', { n: s.combo }), A.W / 2, A.H * 0.4, A.theme().b, 26, true); A.sfx('sparkle'); }
        const lv = 1 + Math.floor(s.score / 15); if (lv > s.level) { s.level = lv; levelUp(s, A.W / 2, A.H * 0.33); }
      }
      s.update = (dt) => {
        const r = R(), g0 = gy();
        if (s.dying > 0) { s.dying -= dt; if (s.dying <= 0) s.over = true; }
        if (s.keys.l || s.keys.r) { s.x += (s.keys.r - s.keys.l) * (560 + s.level * 20) * dt; s.tx = s.x; } else s.x += (s.tx - s.x) * Math.min(1, dt * 14);
        s.x = clamp(s.x, r, A.W - r); s.hurt -= dt; s.eat -= dt; s.sq *= Math.pow(0.02, dt);
        if (s.dying <= 0) { s.spawn -= dt; if (s.spawn <= 0) { spawn(); s.spawn = Math.max(0.26, 0.9 - s.level * 0.055) * rnd(0.7, 1.25); } }
        for (let i = s.items.length - 1; i >= 0; i--) {
          const it = s.items[i]; it.t += dt; it.y += it.vy * dt; it.x += Math.cos(it.t * it.wf) * it.wa * dt; it.rot += it.vr * dt;
          if (s.dying <= 0 && Math.abs(it.y - (g0 - r * 0.9)) < r * 0.95 && Math.abs(it.x - s.x) < r * 1.15) { s.items.splice(i, 1); grab(it); continue; }
          if (it.y > A.H + 30) { s.items.splice(i, 1); if (it.type === 'byte' || it.type === 'gold') s.combo = 0; }
        }
      };
      s.idle = (dt) => { s.x += (s.tx - s.x) * Math.min(1, dt * 10); };
      s.draw = (g) => {
        A.bg(g); const th = A.theme(), r = R(), g0 = gy(), t = A.time;
        g.font = font(700, 14, 1); g.textAlign = 'center'; for (let c = 0; c < 18; c++) { const x = (c + 0.5) * A.W / 18; for (let k = 0; k < 6; k++) { const y = ((t * (30 + hr(c) * 40) + k * 120 + hr(c + 5) * 400) % (A.H + 100)) - 50; g.fillStyle = th.a; g.globalAlpha = 0.06 + 0.06 * (k / 6); g.fillText(hr(c * 7 + k) > 0.5 ? '1' : '0', x, y); } }
        g.globalAlpha = 1; g.strokeStyle = th.b; g.lineWidth = 2; glowFill(g, th.b, 14); g.beginPath(); g.moveTo(0, g0 + 2); g.lineTo(A.W, g0 + 2); g.stroke(); noGlow(g);
        for (const it of s.items) {
          g.save(); g.translate(it.x, it.y); const q = clamp(r * 0.55, 15, 26);
          if (it.type === 'virus') { g.rotate(it.rot); g.fillStyle = '#ff2a6d'; glowFill(g, '#ff2a6d', 14); g.beginPath(); for (let k = 0; k < 16; k++) { const rad = k % 2 ? q * 0.7 : q; g.lineTo(Math.cos(k * TAU / 16) * rad, Math.sin(k * TAU / 16) * rad); } g.closePath(); g.fill(); noGlow(g); g.rotate(-it.rot);
            g.fillStyle = '#2a0010'; g.beginPath(); g.moveTo(-q * 0.42, -q * 0.2); g.lineTo(-q * 0.1, -q * 0.05); g.lineTo(-q * 0.42, q * 0.05); g.fill(); g.beginPath(); g.moveTo(q * 0.42, -q * 0.2); g.lineTo(q * 0.1, -q * 0.05); g.lineTo(q * 0.42, q * 0.05); g.fill(); g.fillRect(-q * 0.3, q * 0.25, q * 0.6, q * 0.1); }
          else if (it.type === 'heart') { g.fillStyle = '#ff5d9e'; glowFill(g, '#ff5d9e', 16); A.heart(g, 0, q * 0.25, q * 0.75); g.fill(); noGlow(g); }
          else { const gold = it.type === 'gold'; g.rotate(Math.sin(it.t * 3) * 0.3); g.fillStyle = gold ? '#ffd23e' : '#0d2a3a'; glowFill(g, gold ? '#ffb703' : th.a, 16); rr(g, -q * 0.75, -q * 0.75, q * 1.5, q * 1.5, q * 0.35); g.fill(); noGlow(g);
            g.strokeStyle = gold ? '#fff3c4' : th.a; g.lineWidth = 2; g.stroke(); g.fillStyle = gold ? '#7a5200' : th.a; g.font = font(900, q * 1.05, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(gold ? 'B' : it.glyph, 0, q * 0.06); }
          g.restore();
        }
        let near = null, nd = 1e9; for (const it of s.items) { const d = g0 - it.y; if (d > 0 && d < nd) { nd = d; near = it; } }
        const cy = g0 - r * 0.84 * (1 - s.sq);
        g.fillStyle = 'rgba(0,0,0,.35)'; ell(g, s.x, g0 + 2, r * 0.9, r * 0.16); g.fill();
        A.pet(g, s.x, cy, r, { lookX: near ? clamp((near.x - s.x) / (r * 3), -1, 1) : 0, lookY: near ? -0.8 : 0, eye: s.dying > 0 ? 'x' : s.hurt > 0 ? 'angry' : s.eat > 0 ? 'happy' : 'normal',
          mouth: s.eat > 0 ? 'chomp' : near && nd < r * 3 ? 'o' : 'smile', sx: 1 + s.sq, sy: 1 - s.sq, glitch: s.hurt > 0 ? 0.6 : 0 });
      };
      s.down = (x) => { s.tx = x; }; s.move = (x) => { s.tx = x; };
      s.key = (code, down) => { if (code === 'ArrowLeft' || code === 'KeyA') s.keys.l = down ? 1 : 0; else if (code === 'ArrowRight' || code === 'KeyD') s.keys.r = down ? 1 : 0; else return false; };
      return s;
    }
  };

  // ================================================================ 2. Debug Whack
  A.GAMES.whack = {
    icon: '🔨', stage: 1, energy: 8, medals: [20, 45, 90],
    reward: (sc, m) => ({ fx: { glitch: -Math.min(30, 5 + sc * 0.4), cur: 6, happy: 3 }, coins: Math.floor(sc / 3) + m * 5, xp: 8 + Math.min(30, sc * 0.4), care: { order: 2 } }),
    create() {
      const s = { score: 0, level: 1, health: 100, over: false, occ: [], spawn: 0.6, combo: 0, cheer: 0, ouch: 0, dims: '', cells: [], dying: 0 };
      s.hint = () => A.SR('cp_gh_whack');
      const petR = () => clamp(Math.min(A.W, A.H) * 0.05, 20, 34);
      function grid() {
        const portrait = A.H > A.W, lv = s.level; let cols = 3, rows = 3;
        if (lv >= 6) { cols = 4; rows = 4; } else if (lv >= 3) { if (portrait) rows = 4; else cols = 4; }
        const top = A.top + 8, bot = A.H - petR() * 2.6 - 10, aw = A.W - 24, ah = bot - top;
        const cs = Math.min(aw / cols, ah / rows, 170), gw = cs * cols, gh = cs * rows, x0 = (A.W - gw) / 2, y0 = top + (ah - gh) / 2;
        const key = [cols, rows, A.W, A.H].join(',');
        if (key !== s.dims) { s.dims = key; s.cells = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s.cells.push({ x: x0 + c * cs + cs * 0.07, y: y0 + r * cs + cs * 0.07, w: cs * 0.86, h: cs * 0.86 }); s.occ = s.occ.filter(o => o.cell < s.cells.length); }
        return s.cells;
      }
      function spawn() {
        const cells = grid(), free = cells.map((c, i) => i).filter(i => !s.occ.some(o => o.cell === i)); if (!free.length) return;
        const pk = Math.min(0.28, 0.12 + s.level * 0.015), r = Math.random(), type = r < pk ? 'pack' : r < pk + 0.06 ? 'gold' : 'bug';
        s.occ.push({ cell: pick(free), type, t: 0, stay: Math.max(0.55, 1.45 - s.level * 0.09) * rnd(0.85, 1.15) * (type === 'pack' ? 1.2 : 1), up: 0, hit: false, gone: false, a: rnd(-0.4, 0.4) });
      }
      s.update = (dt) => {
        if (s.dying > 0) { s.dying -= dt; if (s.dying <= 0) s.over = true; return; }
        grid(); s.cheer -= dt; s.ouch -= dt;
        const maxA = Math.min(5, 1 + Math.floor(s.level / 2));
        s.spawn -= dt; if (s.spawn <= 0) { if (s.occ.filter(o => !o.gone).length < maxA) spawn(); s.spawn = Math.max(0.3, 0.95 - s.level * 0.07) * rnd(0.7, 1.2); }
        for (let i = s.occ.length - 1; i >= 0; i--) {
          const o = s.occ[i]; o.t += dt;
          if (o.hit) { o.up = Math.max(0, o.up - dt * 6); if (o.up <= 0) s.occ.splice(i, 1); continue; }
          if (o.t < o.stay) o.up = Math.min(1, o.up + dt * 8); else { o.up -= dt * 7; if (o.up <= 0) { s.occ.splice(i, 1);
            if (o.type !== 'pack') { s.health -= s.level <= 1 ? 7 : 10; s.combo = 0; s.ouch = 0.5; A.sfx('miss'); const c = s.cells[o.cell]; if (c) A.float('✖', c.x + c.w / 2, c.y + c.h * 0.3, '#ff5d73', 24, true); } } }
        }
        if (s.health <= 0) { s.health = 0; s.dying = 0.6; A.sfx('crash'); A.shake(10); }
      };
      s.idle = () => { grid(); };
      s.down = (x, y) => {
        const cells = grid();
        for (const o of s.occ) { const c = cells[o.cell]; if (!c || o.hit || o.up < 0.35) continue;
          if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
            o.hit = true; const cx = c.x + c.w / 2, cy = c.y + c.h * 0.55;
            if (o.type === 'pack') { s.health -= 20; s.combo = 0; s.ouch = 0.8; A.shake(8); A.sfx('error'); A.float('−20', cx, cy, '#ff5d73', 22, true); if (s.health <= 0) { s.health = 0; s.dying = 0.6; } return; }
            const pts = o.type === 'gold' ? 3 : 1; s.score += pts; s.combo++; s.health = Math.min(100, s.health + 2); s.cheer = 0.4;
            A.sfx('squash'); A.burst(cx, cy, 14, { color: o.type === 'gold' ? ['#ffd23e', '#fff'] : ['#ff3b6b', '#3dffa8', '#fff'], max: 240 }); A.part({ type: 'ring', x: cx, y: cy, size: 8, grow: c.w * 0.4, color: '#3dffa8', life: 0.35, top: true });
            A.float('+' + pts, cx, cy - c.h * 0.25, o.type === 'gold' ? '#ffd23e' : '#bfffe0', 20, true);
            if (s.combo % 8 === 0) A.float(A.T('cp_combo', { n: s.combo }), A.W / 2, A.top + 40, A.theme().b, 24, true);
            const lv = 1 + Math.floor(s.score / 10); if (lv > s.level) { s.level = lv; levelUp(s, A.W / 2, A.H * 0.5); }
            return; } }
      };
      s.draw = (g) => {
        A.bg(g); const th = A.theme(), cells = grid(), t = A.time;
        for (let i = 0; i < cells.length; i++) {
          const c = cells[i], o = s.occ.find(q => q.cell === i); g.fillStyle = '#161b3a'; rr(g, c.x, c.y, c.w, c.h, 12); g.fill(); g.strokeStyle = o && !o.hit ? (o.type === 'pack' ? '#3dffa8' : '#ff3b6b') : 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#232a52'; rr(g, c.x, c.y, c.w, c.h * 0.16, 12); g.fill(); g.fillRect(c.x, c.y + c.h * 0.08, c.w, c.h * 0.08);
          for (let k = 0; k < 3; k++) { g.fillStyle = ['#ff5d73', '#ffd23e', '#3dffa8'][k]; g.beginPath(); g.arc(c.x + c.h * 0.09 + k * c.h * 0.09, c.y + c.h * 0.08, c.h * 0.028, 0, TAU); g.fill(); }
          const sx = c.x + c.w * 0.08, sy = c.y + c.h * 0.22, sw = c.w * 0.84, sh = c.h * 0.7; g.fillStyle = '#05081a'; rr(g, sx, sy, sw, sh, 8); g.fill();
          g.save(); rr(g, sx, sy, sw, sh, 8); g.clip(); g.fillStyle = th.a; g.globalAlpha = 0.07; for (let y = sy; y < sy + sh; y += 4) g.fillRect(sx, y, sw, 1); g.globalAlpha = 1;
          if (o) { const e = o.up < 1 ? 1 - Math.pow(1 - o.up, 3) : 1, cx = sx + sw / 2, cy = sy + sh + sh * 0.1 - e * sh * 0.62, q = sw * 0.32;
            if (o.type === 'pack') { g.save(); g.translate(cx, cy); g.fillStyle = '#3dffa8'; glowFill(g, '#3dffa8', 14); rr(g, -q, -q, q * 2, q * 2, q * 0.4); g.fill(); noGlow(g); g.strokeStyle = '#063d27'; g.lineWidth = q * 0.14; g.lineCap = 'round';
                g.beginPath(); g.arc(-q * 0.4, -q * 0.1, q * 0.18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(q * 0.4, -q * 0.1, q * 0.18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(0, q * 0.2, q * 0.3, 0.2, Math.PI - 0.2); g.stroke();
                g.fillStyle = '#ff5d9e'; A.heart(g, q * 0.62, -q * 0.62, q * 0.22); g.fill(); g.restore(); }
            else A.bug(g, cx, cy, q * 1.25, -Math.PI / 2 + o.a * Math.sin(t * 6), t, o.type === 'gold');
            if (o.hit && o.type !== 'pack') { g.fillStyle = 'rgba(61,255,168,.35)'; g.fillRect(sx, sy, sw, sh); } }
          g.restore();
        }
        const pr = petR(), px = A.W / 2, gy = A.H - 12;
        g.fillStyle = 'rgba(0,0,0,.35)'; ell(g, px, gy, pr * 0.9, pr * 0.16); g.fill();
        A.pet(g, px, gy - pr * 0.84, pr, { eye: s.dying > 0 ? 'x' : s.ouch > 0 ? 'sad' : s.cheer > 0 ? 'happy' : 'normal', mouth: s.cheer > 0 ? 'grin' : s.ouch > 0 ? 'frown' : 'smile', lookY: -1, glitch: clamp((60 - s.health) / 80, 0, 0.8) });
      };
      return s;
    }
  };

  // ================================================================ 3. Echo Pattern
  const PAD_COL = ['#3ef0ff', '#ff4fd8', '#ffd23e', '#3dffa8'], PAD_SYM = ['▲', '●', '■', '◆'];
  A.GAMES.echo = {
    icon: '🎵', stage: 2, energy: 6, medals: [5, 9, 13],
    reward: (sc, m) => ({ fx: { cur: Math.min(30, 6 + sc * 2.5), happy: 4 }, coins: sc * 2 + m * 5, xp: 8 + Math.min(30, sc * 2.5) }),
    create() {
      const s = { score: 0, level: 2, lives: 2, maxLives: 2, over: false, seq: [pick([0, 1, 2, 3]), pick([0, 1, 2, 3])], mode: 'pre', mt: 0.6, idx: 0, inIdx: 0, lit: -1, litT: 0, msg: '', dying: 0 };
      s.hint = () => A.SR('cp_gh_echo');
      const geo = () => { const top = A.top, cx = A.W / 2, cy = top + (A.H - top) * 0.5, D = Math.min(A.W * 0.3, (A.H - top) * 0.3, 210); return { cx, cy, D, pr: D * 0.42, R: clamp(D * 0.36, 22, 64) }; };
      const padPos = (i, G) => [[G.cx, G.cy - G.D], [G.cx + G.D, G.cy], [G.cx, G.cy + G.D], [G.cx - G.D, G.cy]][i];
      const onT = () => Math.max(0.22, 0.5 - s.seq.length * 0.02);
      function light(i, t) { s.lit = i; s.litT = t; A.sfx('pad', i); }
      function press(i) {
        if (s.mode !== 'input' || s.dying > 0) return; light(i, 0.22); const G = geo(), [x, y] = padPos(i, G);
        A.burst(x, y, 8, { color: [PAD_COL[i], '#fff'], max: 150, s0: 2, s1: 4, g: 0 });
        if (s.seq[s.inIdx] === i) { s.inIdx++; if (s.inIdx >= s.seq.length) { s.score++; s.mode = 'good'; s.mt = 0.8; s.msg = A.T('cp_e_great'); A.sfx('level'); A.part({ type: 'ring', x: G.cx, y: G.cy, size: G.R, grow: G.D * 1.4, color: A.theme().a, life: 0.6, top: true }); } }
        else { s.lives--; A.shake(8); A.sfx('error'); s.msg = A.SR('cp_e_wrong'); if (s.lives <= 0) { s.dying = 1; s.mode = 'dead'; } else { s.mode = 'retry'; s.mt = 1.1; } }
      }
      s.update = (dt) => {
        if (s.litT > 0) { s.litT -= dt; if (s.litT <= 0) s.lit = -1; }
        if (s.dying > 0) { s.dying -= dt; if (s.dying <= 0) s.over = true; return; }
        s.mt -= dt;
        if (s.mode === 'pre' || s.mode === 'retry') { if (s.mt <= 0) { s.mode = 'show'; s.idx = 0; s.mt = 0.3; s.msg = A.SR('cp_e_watch'); } }
        else if (s.mode === 'good') { if (s.mt <= 0) { s.seq.push(pick([0, 1, 2, 3])); s.level = s.seq.length; s.mode = 'show'; s.idx = 0; s.mt = 0.35; s.msg = A.SR('cp_e_watch'); } }
        else if (s.mode === 'show') { if (s.mt <= 0) { if (s.idx < s.seq.length) { light(s.seq[s.idx], onT()); s.idx++; s.mt = onT() * 1.45; } else { s.mode = 'input'; s.inIdx = 0; s.msg = A.T('cp_e_turn'); } } }
      };
      s.draw = (g) => {
        A.bg(g); const G = geo(), th = A.theme(), t = A.time;
        g.strokeStyle = th.a; g.globalAlpha = 0.15; g.lineWidth = 2; g.beginPath(); g.arc(G.cx, G.cy, G.D, 0, TAU); g.stroke(); g.globalAlpha = 1;
        for (let i = 0; i < 4; i++) {
          const [x, y] = padPos(i, G), on = s.lit === i, pr = G.pr * (on ? 1.08 : 1);
          g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = on ? PAD_COL[i] : '#141936'; if (on) glowFill(g, PAD_COL[i], 34); rr(g, -pr * 0.75, -pr * 0.75, pr * 1.5, pr * 1.5, pr * 0.35); g.fill(); noGlow(g);
          g.strokeStyle = PAD_COL[i]; g.lineWidth = 3; g.globalAlpha = on ? 1 : 0.7; g.stroke(); g.globalAlpha = 1; g.restore();
          g.fillStyle = on ? '#0b0e1d' : PAD_COL[i]; g.font = font(900, pr * 0.62); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(PAD_SYM[i], x, y + pr * 0.03);
        }
        const look = s.lit >= 0 ? padPos(s.lit, G) : [G.cx + Math.sin(t) * 20, G.cy];
        A.pet(g, G.cx, G.cy, G.R, { lookX: clamp((look[0] - G.cx) / G.D, -1, 1), lookY: clamp((look[1] - G.cy) / G.D, -1, 1), eye: s.mode === 'dead' ? 'x' : s.mode === 'retry' ? 'sad' : s.mode === 'good' ? 'happy' : 'normal',
          mouth: s.mode === 'show' && s.lit >= 0 ? 'open' : s.mode === 'good' ? 'grin' : s.mode === 'retry' ? 'frown' : 'smile', blush: s.mode === 'good' ? 1 : 0 });
        if (s.mode === 'show' && s.lit >= 0) { g.fillStyle = PAD_COL[s.lit]; g.font = font(900, 22); g.textAlign = 'center'; g.fillText('♪', G.cx + G.R * 0.9 + Math.sin(t * 8) * 4, G.cy - G.R * 1.2); }
        const my = Math.min(A.H - 30, G.cy + G.D + G.pr + 34); label(g, s.msg, A.W / 2, my, 20, s.mode === 'retry' || s.mode === 'dead' ? '#ff8fa3' : '#fff', s.mode === 'input' ? th.a : null);
        if (s.mode === 'input') { const w = Math.min(260, A.W * 0.6), dw = w / s.seq.length; for (let i = 0; i < s.seq.length; i++) { g.fillStyle = i < s.inIdx ? PAD_COL[s.seq[i]] : 'rgba(255,255,255,.15)'; g.fillRect(A.W / 2 - w / 2 + i * dw + 2, my + 18, dw - 4, 5); } }
      };
      s.down = (x, y) => { const G = geo(); let best = -1, bd = 1e9; for (let i = 0; i < 4; i++) { const [px, py] = padPos(i, G), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } } if (bd < G.pr * 1.15) press(best); };
      s.key = (code, down) => { if (!down) return; const m = { ArrowUp: 0, KeyW: 0, Digit1: 0, ArrowRight: 1, KeyD: 1, Digit2: 1, ArrowDown: 2, KeyS: 2, Digit3: 2, ArrowLeft: 3, KeyA: 3, Digit4: 3 }; if (m[code] == null) return false; press(m[code]); };
      return s;
    }
  };

  // ================================================================ 4. Packet Hop
  A.GAMES.hop = {
    icon: '🦘', stage: 2, energy: 10, medals: [5, 15, 30],
    reward: (sc, m) => ({ fx: { happy: Math.min(25, 5 + sc), cur: 4 }, coins: sc + m * 5, xp: 8 + Math.min(30, sc * 1.2) }),
    create() {
      const s = { score: 0, level: 1, over: false, mode: 'ready', y: A.H * 0.45, vy: 0, walls: [], dying: 0, t: 0, scroll: 0 };
      const k = () => A.H / 800, R = () => clamp(A.H * 0.032, 14, 26), px = () => A.W * 0.3, floorY = () => A.H - 22;
      s.hint = () => A.SR('cp_gh_hop');
      function flap() { if (s.mode === 'dead') return; if (s.mode === 'ready') s.mode = 'fly'; s.vy = -600 * k(); A.sfx('hop'); A.burst(px() - R(), s.y + R() * 0.5, 4, { color: [A.theme().a], max: 80, s0: 2, s1: 3, g: 200 }); }
      function addWall(x) { const gap = Math.max(R() * 5.6, A.H * (0.36 - s.level * 0.012)), mn = A.top + 20 + gap / 2, mx = floorY() - 20 - gap / 2; s.walls.push({ x, gy: rnd(mn, Math.max(mn, mx)), gap, w: R() * 2.6, passed: false }); }
      function crash() { s.mode = 'dead'; s.dying = 0.9; A.sfx('crash'); A.shake(10); A.flash(0.3); A.burst(px(), s.y, 26, { color: ['#ff2a6d', '#ffd23e', '#fff'], max: 300 }); }
      s.update = (dt) => {
        s.t += dt; const r = R(), x = px();
        if (s.mode === 'ready') { s.y = A.H * 0.45 + Math.sin(s.t * 3) * 10; return; }
        if (s.mode === 'dead') { s.vy += 2000 * k() * dt; s.y = Math.min(floorY() - r, s.y + s.vy * dt); s.dying -= dt; if (s.dying <= 0) s.over = true; return; }
        const sp = Math.min(380, 200 + s.level * 12); s.scroll += sp * dt;
        s.vy += 1900 * k() * dt; s.y += s.vy * dt;
        const spacing = Math.max(240, Math.min(A.W * 0.45, 380));
        if (!s.walls.length || s.walls[s.walls.length - 1].x < A.W - spacing) addWall(A.W + 40);
        for (let i = s.walls.length - 1; i >= 0; i--) {
          const w = s.walls[i]; w.x -= sp * dt; if (w.x + w.w < -20) { s.walls.splice(i, 1); continue; }
          if (!w.passed && w.x + w.w < x - r) { w.passed = true; s.score++; A.sfx('coin'); A.float('+1', x, s.y - r * 2, '#bff9ff', 18, true); const lv = 1 + Math.floor(s.score / 5); if (lv > s.level) { s.level = lv; levelUp(s, A.W / 2, A.H * 0.3); } }
          const cr = r * 0.82; if (x + cr > w.x && x - cr < w.x + w.w) { if (s.y - cr < w.gy - w.gap / 2 || s.y + cr > w.gy + w.gap / 2) { crash(); return; } }
        }
        if (s.y - r < A.top) { s.y = A.top + r; s.vy = Math.max(0, s.vy); }
        if (s.y + r > floorY()) crash();
      };
      s.idle = (dt) => { s.t += dt; if (s.mode === 'ready') s.y = A.H * 0.45 + Math.sin(s.t * 3) * 10; };
      s.draw = (g) => {
        A.bg(g); const th = A.theme(), r = R(), x = px(), t = A.time;
        for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + 0.4 * hr(i)})`; g.fillRect((((hr(i * 3) * A.W * 2 - s.scroll * 0.1) % (A.W + 20)) + A.W + 20) % (A.W + 20), hr(i + 9) * A.H * 0.7, 2, 2); }
        g.fillStyle = '#0d1230'; for (let i = 0; i < 16; i++) { const bw = 60 + hr(i) * 60, bh = A.H * (0.15 + hr(i * 2) * 0.3), bx = ((i * 110 - s.scroll * 0.3) % (16 * 110) + 16 * 110) % (16 * 110) - 110; g.fillRect(bx, floorY() - bh, bw, bh);
          g.fillStyle = th.a; g.globalAlpha = 0.35; for (let k2 = 0; k2 < 4; k2++) if (hr(i * 9 + k2) > 0.5) g.fillRect(bx + 10 + k2 * 12, floorY() - bh + 12, 4, 4); g.globalAlpha = 1; g.fillStyle = '#0d1230'; }
        for (const w of s.walls) {
          for (const [y0, y1] of [[0, w.gy - w.gap / 2], [w.gy + w.gap / 2, floorY()]]) { if (y1 <= y0) continue; g.fillStyle = '#3a0f2a'; g.fillRect(w.x, y0, w.w, y1 - y0); g.strokeStyle = 'rgba(255,90,140,.35)'; g.lineWidth = 1;
            for (let yy = y0; yy < y1; yy += 14) { g.beginPath(); g.moveTo(w.x, yy); g.lineTo(w.x + w.w, yy); g.stroke(); const off = (Math.floor(yy / 14) % 2) * w.w / 2; g.beginPath(); g.moveTo(w.x + off + w.w / 4, yy); g.lineTo(w.x + off + w.w / 4, Math.min(y1, yy + 14)); g.stroke(); }
            g.strokeStyle = '#ff2a6d'; g.lineWidth = 3; glowFill(g, '#ff2a6d', 16); g.strokeRect(w.x, y0, w.w, y1 - y0); noGlow(g);
            const ey = y0 === 0 ? y1 : y0; g.fillStyle = '#ffd23e'; for (let k2 = 0; k2 < 4; k2++) { const fh = 6 + Math.sin(t * 14 + k2 * 2 + w.x) * 4; g.fillRect(w.x + k2 * w.w / 4 + 2, y0 === 0 ? ey : ey - fh, w.w / 4 - 4, fh); } }
        }
        g.strokeStyle = th.b; g.lineWidth = 2; glowFill(g, th.b, 14); g.beginPath(); g.moveTo(0, floorY()); g.lineTo(A.W, floorY()); g.stroke(); noGlow(g);
        g.save(); g.translate(x, s.y); g.rotate(s.mode === 'ready' ? 0 : clamp(s.vy / 1400, -0.5, 0.9));
        A.pet(g, 0, 0, r, { lookX: 1, lookY: clamp(s.vy / 900, -1, 1), eye: s.mode === 'dead' ? 'x' : s.vy < -200 ? 'happy' : 'wide', mouth: s.mode === 'dead' ? 'wavy' : s.vy < 0 ? 'grin' : 'o', glitch: s.mode === 'dead' ? 0.7 : 0 });
        g.restore();
        if (s.mode === 'ready' && s.goT != null && s.goT <= 0) label(g, A.SR('cp_h_tap'), A.W / 2, A.H * 0.62, 22, '#fff', th.a);
        label(g, String(s.score), A.W / 2, A.top + 46, 44, '#fff', th.a);
      };
      s.down = () => flap(); s.key = (code, down) => { if (!down) return; if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') flap(); else return false; };
      return s;
    }
  };

  // ================================================================ 5. Glitch Rhythm
  const LANE_COL = ['#ff4fd8', '#3ef0ff', '#3dffa8', '#ffd23e'], LANE_KEY = ['D', 'F', 'J', 'K'], BASS = [110, 110, 130.8, 98];
  A.GAMES.rhythm = {
    icon: '🎧', stage: 3, energy: 10, medals: [40, 110, 220],
    reward: (sc, m) => ({ fx: { happy: Math.min(25, 5 + sc / 8), glitch: -Math.min(20, sc / 10) }, coins: Math.floor(sc / 5) + m * 5, xp: 8 + Math.min(30, sc / 6) }),
    create() {
      const s = { score: 0, level: 1, health: 100, over: false, tm: -0.5, notes: [], ev: [], genT: 0.6, genBeat: 0, beat: 0, combo: 0, flashL: [0, 0, 0, 0], pulse: 0, judge: null, lastLane: -1, rep: 0, dying: 0, bounce: 0 };
      s.hint = () => A.SR('cp_gh_rhythm');
      const bpm = (b) => Math.min(168, 92 + Math.floor(b / 32) * 8), travel = () => Math.max(1.0, 1.7 - s.level * 0.06);
      const geo = () => { const lw = Math.min((A.W - 20) / 4, 120), x0 = A.W / 2 - lw * 2, pr = clamp(Math.min(A.W, A.H) * 0.05, 20, 34), py = A.top + pr * 1.1, top = py + pr * 1.2, hit = A.H - (A.mobile() ? 110 : 130); return { lw, x0, pr, py, top, hit }; };
      function gen() {
        while (s.genT < s.tm + travel() + 0.6) {
          const b = s.genBeat, len = 60 / bpm(b), lv = 1 + Math.floor(b / 32), bar = Math.floor(b / 4);
          s.ev.push({ t: s.genT, k: b % 2 ? 'snare' : 'kick', bass: BASS[bar % 4] * (b % 4 === 3 ? 1.5 : 1), b }); s.ev.push({ t: s.genT + len / 2, k: 'hat' });
          if (b >= 4) {
            const slots = [[s.genT, Math.min(0.92, 0.55 + lv * 0.05)], [s.genT + len / 2, lv >= 2 ? Math.min(0.55, 0.06 + lv * 0.06) : 0]];
            for (const [tt, p] of slots) { if (Math.random() >= p) continue; let lane = Math.floor(Math.random() * 4); if (lane === s.lastLane && ++s.rep >= 2) { lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4; s.rep = 0; } else if (lane !== s.lastLane) s.rep = 0; s.lastLane = lane;
              s.notes.push({ t: tt, lane, done: false }); if (lv >= 4 && Math.random() < 0.12) s.notes.push({ t: tt, lane: (lane + 2) % 4, done: false }); }
          }
          s.genBeat++; s.genT += len;
        }
      }
      function judge(text, color, lane) { const G = geo(); s.judge = { text, color, t: 0.5, x: G.x0 + (lane + 0.5) * G.lw }; }
      function hitLane(lane) {
        if (s.dying > 0) return; s.flashL[lane] = 0.15; let best = null, bd = 1;
        for (const n of s.notes) { if (n.done || n.lane !== lane) continue; const d = Math.abs(s.tm - n.t); if (d < bd) { bd = d; best = n; } }
        if (!best || bd > 0.16) return; best.done = true; const G = geo(), x = G.x0 + (lane + 0.5) * G.lw;
        if (bd < 0.06) { s.score += 2; s.health = Math.min(100, s.health + 2.5); judge(A.T('cp_j_perfect'), LANE_COL[lane], lane); A.sfx('perfect'); A.part({ type: 'ring', x, y: G.hit, size: G.lw * 0.25, grow: G.lw * 0.6, color: LANE_COL[lane], life: 0.35, top: true }); }
        else { s.score += 1; s.health = Math.min(100, s.health + 1); judge(A.T('cp_j_good'), '#fff', lane); A.sfx('good'); }
        s.combo++; s.bounce = 0.2; A.burst(x, G.hit, 8, { color: [LANE_COL[lane], '#fff'], max: 180, s0: 2, s1: 4, g: 100 });
        if (s.combo % 20 === 0) A.float(A.T('cp_combo', { n: s.combo }), A.W / 2, A.H * 0.45, LANE_COL[lane], 26, true);
      }
      s.update = (dt) => {
        if (s.dying > 0) { s.dying -= dt; if (s.dying <= 0) s.over = true; return; }
        s.tm += dt; gen(); s.pulse = Math.max(0, s.pulse - dt * 4); s.bounce = Math.max(0, s.bounce - dt);
        for (let i = 0; i < 4; i++) s.flashL[i] = Math.max(0, s.flashL[i] - dt);
        while (s.ev.length && s.ev[0].t <= s.tm) { const e = s.ev.shift(); A.sfx(e.k); if (e.k !== 'hat') { A.sfx('bass', e.bass); s.pulse = 1; } if (e.b != null) { s.beat = e.b; const lv = 1 + Math.floor(e.b / 32); if (lv > s.level) { s.level = lv; levelUp(s, A.W / 2, A.H * 0.35); } } }
        for (let i = s.notes.length - 1; i >= 0; i--) { const n = s.notes[i]; if (n.done) { s.notes.splice(i, 1); continue; }
          if (s.tm - n.t > 0.16) { s.notes.splice(i, 1); s.health -= 9; s.combo = 0; judge(A.T('cp_j_miss'), '#ff5d73', n.lane); A.sfx('miss'); } }
        if (s.judge) { s.judge.t -= dt; if (s.judge.t <= 0) s.judge = null; }
        if (s.health <= 0) { s.health = 0; s.dying = 0.8; A.sfx('crash'); A.shake(10); A.flash(0.3); }
      };
      s.idle = () => {};
      s.draw = (g) => {
        A.bg(g); const G = geo(), th = A.theme(), t = A.time, tv = travel(), gl = clamp((60 - s.health) / 60, 0, 1);
        if (s.pulse > 0) { g.fillStyle = `rgba(255,255,255,${s.pulse * 0.04})`; g.fillRect(0, 0, A.W, A.H); }
        for (let i = 0; i < 4; i++) {
          const jx = gl > 0 && hr(Math.floor(t * 12) + i) < gl * 0.4 ? (hr(Math.floor(t * 12) * 3 + i) - 0.5) * 20 * gl : 0, x = G.x0 + i * G.lw + jx;
          const lg = g.createLinearGradient(0, G.top, 0, G.hit); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, s.flashL[i] > 0 ? LANE_COL[i] + '55' : 'rgba(255,255,255,.05)'); g.fillStyle = lg; g.fillRect(x + 3, G.top, G.lw - 6, G.hit - G.top + 30);
          g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; g.strokeRect(x + 3, G.top, G.lw - 6, G.hit - G.top + 30);
          const on = s.flashL[i] > 0; g.strokeStyle = LANE_COL[i]; g.lineWidth = on ? 4 : 2.5; if (on) glowFill(g, LANE_COL[i], 20); rr(g, x + 8, G.hit - 14, G.lw - 16, 28, 10); g.stroke(); noGlow(g);
          if (!A.mobile()) { g.fillStyle = LANE_COL[i]; g.globalAlpha = 0.7; g.font = font(800, 13, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(LANE_KEY[i], x + G.lw / 2, G.hit + 34); g.globalAlpha = 1; }
        }
        for (const n of s.notes) { const k = 1 - (n.t - s.tm) / tv; if (k < 0) continue; const y = lerp(G.top, G.hit, k), x = G.x0 + n.lane * G.lw;
          g.fillStyle = LANE_COL[n.lane]; glowFill(g, LANE_COL[n.lane], 16); rr(g, x + 10, y - 9, G.lw - 20, 18, 9); g.fill(); noGlow(g); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x + 16, y - 5, G.lw - 32, 3); }
        if (gl > 0.2) { const st = Math.floor(t * 10); for (let i = 0; i < 4; i++) { g.fillStyle = A.hsl(hr(st + i) * 360, 100, 60, 0.1 * gl); g.fillRect(0, hr(st * 2 + i) * A.H, A.W, 4 + hr(i + st) * 20); } }
        const bob = Math.abs(Math.sin(s.tm * Math.PI * bpm(s.beat) / 60)) * G.pr * 0.25;
        A.pet(g, A.W / 2, G.py - bob, G.pr * (1 + s.bounce * 0.4), { eye: s.dying > 0 ? 'x' : s.judge && s.judge.text === A.T('cp_j_miss') ? 'sad' : s.combo > 8 ? 'happy' : 'normal', mouth: s.bounce > 0 ? 'open' : 'smile', sx: 1 + s.bounce * 0.3, sy: 1 - s.bounce * 0.3, glitch: gl * 0.9, lookY: 1 });
        if (s.judge) { g.globalAlpha = clamp(s.judge.t * 3, 0, 1); label(g, s.judge.text, s.judge.x, G.hit - 46 - (0.5 - s.judge.t) * 30, 18, s.judge.color); g.globalAlpha = 1; }
        if (s.combo >= 4) label(g, '×' + s.combo, A.W / 2, G.hit + (A.mobile() ? 40 : 60), 22, th.a);
      };
      const laneAt = (x) => { const G = geo(); return clamp(Math.floor((x - G.x0) / G.lw), 0, 3); };
      s.down = (x, y) => { if (y > A.top) hitLane(laneAt(x)); };
      s.key = (code, down) => { if (!down) return; const m = { KeyD: 0, ArrowLeft: 0, KeyF: 1, ArrowDown: 1, KeyJ: 2, ArrowUp: 2, KeyK: 3, ArrowRight: 3 }; if (m[code] == null) return false; hitLane(m[code]); };
      return s;
    }
  };
})();
