// Pixel Alchemist: Remixed — procedural pixel art (sprites, essences, customers, biome scenery)
(function () {
  'use strict';
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

  // ---------- palettes ----------
  const PAL = {
    H: { o: '#3a0a0a', d: '#9e2416', m: '#e8502a', l: '#ffa23a', w: '#fff1a8', glow: '#ff7a2a' },
    C: { o: '#0b1d3e', d: '#1f5fae', m: '#3fa9f5', l: '#9fe3ff', w: '#ffffff', glow: '#7fd4ff' },
    E: { o: '#3a2a00', d: '#b88a00', m: '#ffd21f', l: '#fff27a', w: '#ffffff', glow: '#fff04a' },
    V: { o: '#12052a', d: '#3d1a7a', m: '#7b3fe0', l: '#c08cff', w: '#f0dcff', glow: '#a86bff' },
    S: { o: '#141018', d: '#3b3340', m: '#5a5060', l: '#7d7385', w: '#a39aa8', glow: '#ff7a2a' },
  };
  const COMMON = { g: '#5fbf3a', G: '#2e6b1f', b: '#8a5a2b', B: '#4a2e14', k: '#1a1420', y: '#ffd75e', Y: '#c08a1e', c: '#f2e2c0', n: '#c8b48e', r: '#6d6470', R: '#3e3842', p: '#ff8fb1', K: '#0c0a10' };

  function fromRows(rows, pal) {
    const h = rows.length, w = rows[0].length, c = mk(w, h), x = c.getContext('2d');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const ch = rows[j][i]; if (ch === '.' || ch === ' ' || ch === undefined) continue;
      const col = pal[ch] || COMMON[ch]; if (!col) continue;
      x.fillStyle = col; x.fillRect(i, j, 1, 1);
    }
    return c;
  }

  // ---------- element symbols ----------
  const SYM = {
    H: ['...a...', '..aa...', '..aba..', '.abba.a', '.abbbaa', '.abbba.', '..aaa..'],
    C: ['...a...', '.a.a.a.', '..aaa..', 'aaabaaa', '..aaa..', '.a.a.a.', '...a...'],
    E: ['....aa.', '...aa..', '..aa...', '.aaaaa.', '...aa..', '..aa...', '.aa....'],
    V: ['..aaa..', '.a...a.', 'a..b..a', 'a.bbb.a', 'a..b..a', '.a...a.', '..aaa..'],
  };
  const SYM_COL = { H: ['#fff1a8', '#ffa23a'], C: ['#ffffff', '#bdeeff'], E: ['#3a2a00', '#8a6400'], V: ['#f0dcff', '#ffffff'] };
  const MINI = {
    H: ['..a..', '.aa..', '.aaa.', 'aaaaa', '.aaa.'],
    C: ['a.a.a', '.aaa.', 'aaaaa', '.aaa.', 'a.a.a'],
    E: ['..aaa', '.aa..', 'aaaaa', '..aa.', '.aa..'],
    V: ['.aaa.', 'a...a', 'a.a.a', 'a...a', '.aaa.'],
  };

  // ---------- essences: element + tier (16x16) ----------
  function essence(el, tier) {
    const P = PAL[el], c = mk(16, 16), x = c.getContext('2d');
    const put = (i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const dx = i - 7, dy = j - 7;
      let inside, edge, edge2 = false;
      if (tier <= 2) {
        const d = Math.hypot(dx, dy), r = tier === 1 ? 5.3 : 6.7;
        inside = d <= r; edge = d > r - 0.95;
      } else {
        const a = Math.abs(dx), b = Math.abs(dy), r = tier === 3 ? 6.5 : 7.5, f = tier === 3 ? 9.5 : 11;
        const shape = (k) => a <= r - k && b <= r - k && a + b <= f - k * 1.4;
        inside = shape(0); edge = !shape(1); edge2 = tier === 4 && !shape(2);
      }
      if (!inside) continue;
      if (edge) { put(i, j, tier === 4 ? (dy + dx * 0.4 < 0 ? '#fff0a8' : '#d29a1e') : P.o); continue; }
      if (edge2) { put(i, j, P.o); continue; }
      const s = (-dx - dy) / (tier >= 3 ? 8 : 6.5);
      let col = s > 0.55 ? P.l : s > -0.45 ? P.m : P.d;
      if (tier >= 3 && Math.abs(dx - dy) < 0.6 && dx < 0) col = P.l;   // facet line
      if (tier >= 3 && dy === 0 && dx > 0) col = P.d;
      put(i, j, col);
    }
    // highlight
    if (tier === 1) { put(4, 4, P.w); put(5, 3, P.w); }
    else if (tier === 2) { put(3, 4, P.w); put(4, 3, P.w); put(4, 4, P.w); put(12, 11, P.l); }
    else { put(4, 3, P.w); put(3, 4, P.w); put(5, 2, P.w); }
    // symbol
    const S = SYM[el], [ca, cb] = SYM_COL[el];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
      const ch = S[j][i]; if (ch === '.') continue; put(4 + i, 4 + j, ch === 'a' ? ca : cb);
    }
    if (tier === 4) { put(7, 0, '#ffffff'); put(0, 7, '#ffffff'); put(14, 7, '#fff0a8'); put(7, 14, '#d29a1e'); }
    return c;
  }

  function slag() {
    const c = mk(16, 16), x = c.getContext('2d'), R = rnd(77);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const dx = (i - 7.5) / 7, dy = (j - 8.5) / 6.4, n = (R() - 0.5) * 0.18;
      const d = dx * dx + dy * dy + n + (j < 5 ? Math.abs(dx) * 0.25 : 0);
      if (d > 1) continue;
      let col = d > 0.78 ? PAL.S.o : (dx + dy < -0.5 ? PAL.S.l : dx + dy > 0.6 ? PAL.S.d : PAL.S.m);
      if (d <= 0.78 && R() < 0.12) col = PAL.S.w;
      x.fillStyle = col; x.fillRect(i, j, 1, 1);
    }
    x.fillStyle = '#1e1822'; [[6, 6], [7, 7], [7, 8], [8, 9], [10, 6], [11, 7]].forEach(([i, j]) => x.fillRect(i, j, 1, 1));
    x.fillStyle = '#ff8a3a'; [[5, 10], [9, 11], [11, 9]].forEach(([i, j]) => x.fillRect(i, j, 1, 1));
    return c;
  }

  // ---------- ingredients (12x12): berry / mushroom / shard ----------
  const ING = [
    ['.....gG.....', '....GgG.....', '...oooGoo...', '..ollmmmmo..', '.olwlmmmmdo.', '.ollmmmmmdo.', '.ommmmmmddo.', '.ommmmmmddo.', '.odmmmmdddo.', '..oddddddo..', '...oooooo...', '............'],
    ['............', '....oooo....', '..oollmmoo..', '.olwlmmmmmo.', 'olllmmwmmmdo', 'ommmmmmmmddo', '.ooddddddoo.', '....occo....', '....ocno....', '....ocno....', '...occcno...', '....oooo....'],
    ['......o.....', '.....olo....', '.....owlo...', '..o..olmo...', '.olo.olmdo..', '.owloolmdo.o', '.olmoommdool', '.olmdommdowl', '..omdommdolo', '..ooddddddo.', '.oRRRRRRRRo.', '..oooooooo..'],
  ];
  // ---------- potion bottle (8x11) ----------
  const BOTTLE = ['..oBBo..', '..oBbo..', '..owwo..', '..owlo..', '.olllmo.', 'olwmmmmo', 'olmmmmdo', 'ommmmmdo', 'ommmmddo', '.oddddo.', '..oooo..'];

  // ---------- icons ----------
  const ICON = {
    coin: ['..oooo..', '.oyyyyo.', 'oywyyyYo', 'oyyYyyYo', 'oyyYyyYo', 'oyyyyYYo', '.oYYYYo.', '..oooo..'],
    heart: ['.oo.oo.', 'orrorro', 'orwrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'],
    heart0: ['.RR.RR.', 'RkkRkkR', 'RkkkkkR', 'RkkkkkR', '.RkkkR.', '..RkR..', '...R...'],
    star: ['....o....', '...oyo...', 'ooooyoooo', 'oyyywyyyo', '.oyyyyYo.', '..oyyYo..', '.oyyoYYo.', '.oyo.oYo.', '.oo...oo.'],
    star0: ['....R....', '...RkR...', 'RRRRkRRRR', 'RkkkkkkkR', '.RkkkkkR.', '..RkkkR..', '.RkkRkkR.', '.RkR.RkR.', '.RR...RR.'],
    pause: ['.......', '.oo.oo.', '.oo.oo.', '.oo.oo.', '.oo.oo.', '.oo.oo.', '.......'],
    check: ['......o', '.....oo', 'o...oo.', 'oo.oo..', '.ooo...', '..o....'],
    clock: ['..ooo..', '.owwwo.', 'owwkwwo', 'owwkkwo', 'owwwwwo', '.owwwo.', '..ooo..'],
    trash: ['....oooo....', '.oooooooooo.', '.oggggggggo.', '..oooooooo..', '..ogGgGgGo..', '..ogGgGgGo..', '..ogGgGgGo..', '..ogGgGgGo..', '..ogGgGgGo..', '..ogGgGgGo..', '...oooooo...', '............'],
    lock: ['..ooo..', '.o...o.', '.o...o.', 'ooooooo', 'oyyyyyo', 'oyyoyyo', 'oyyyyyo', 'ooooooo'],
    train: ['..oo........', '.okko.oooo..', 'oyyyyooRRo..', 'oykkyooRRooo', 'oyyyyyyyyyyo', 'oooooooooooo', '.oRo..oRo...', '..o....o....'],
  };
  const ICON_PAL = { o: '#120c14', r: '#ff4d5e', w: '#ffffff', y: '#ffd75e', Y: '#c08a1e', k: '#1a1420', R: '#8a8090', g: '#a49ab4', G: '#625a72' };

  // ---------- customers (12x20) ----------
  const HEAD = [
    '..ohhhhhho..',
    '..osesseso..',
    '..osssssso..',
    '..ossmmsso..',
    '...osssso...',
    '..occSScco..',
    '.occcSSccco.',
    'occcccccccco',
    'occcccccccco',
    'occCccccCcco',
    'occCccccCcco',
    'occCccccCcco',
  ];
  const HATS = {
    traveler: ['............', '............', '............', '...oooo.....', '..oaaaao....', '..oaayaao...', '..oAAAAAAAo.', '..ohhhhhho..'],
    wizard: ['.....oo.....', '....oaao....', '....oayao...', '...oaaaao...', '...oaaaaao..', '..oaaayaaao.', '.oAAAAAAAAAo', '..ohhhhhho..'],
    cat: ['............', '............', '............', '............', '..oo....oo..', '..oho..oho..', '..ohhoohho..', '..ohhhhhho..'],
    robot: ['............', '............', '.....oo.....', '.....oLo....', '......o.....', '...oooooo...', '..ohhhhhho..', '..ohhhhhho..'],
    merchant: ['............', '...oooooo...', '...oaaaao...', '...oaaaao...', '...oyyyyo...', '...oaaaao...', '.ooAAAAAAoo.', '..ohhhhhho..'],
    granny: ['............', '............', '....oooo....', '...ohhhho...', '...ohwhho...', '..oohhhhoo..', '..ohhhhhho..', '..ohhhhhho..'],
  };
  const SKINS = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
  const HAIRS = ['#2b1a10', '#5a3418', '#a0522d', '#e8c26a', '#d8d8e0', '#1b1b2a', '#b33a2a'];
  const CLOTH = ['#3d6bd8', '#c0392b', '#2e8b57', '#8e44ad', '#d35400', '#16a085', '#7f8c8d', '#b8860b', '#2c3e9e'];
  const HATC = ['#4b2a7a', '#2a2f6a', '#7a1f2a', '#1f5a3a', '#3a3a44', '#8a5a2b'];
  const darken = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * f, g = ((n >> 8) & 255) * f, b = (n & 255) * f; return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1); };
  const mix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const f = (s) => [(s >> 16) & 255, (s >> 8) & 255, s & 255]; const x = f(A), y = f(B); return '#' + ((1 << 24) | x.map((v, i) => Math.round(v + (y[i] - v) * t)).reduce((acc, v) => (acc << 8) | v, 0)).toString(16).slice(1); };

  function customer(type, seed) {
    const R = rnd(seed * 7919 + 13);
    const pick = (a) => a[Math.floor(R() * a.length)];
    let skin = pick(SKINS), hair = pick(HAIRS); const cloth = pick(CLOTH), hat = pick(HATC);
    if (type === 'cat') { skin = pick(['#f0a050', '#c8c8c8', '#f4e0c0', '#7a6050']); hair = darken(skin, 0.75); }
    if (type === 'robot') { skin = '#b8c0cc'; hair = '#7a8494'; }
    if (type === 'granny') hair = pick(['#e8e8f0', '#d0d0d8']);
    const eye = type === 'robot' ? '#4cf0ff' : '#1a1420';
    const moods = {};
    for (const mood of ['n', 'h', 'a']) {
      const rows = HATS[type].concat(HEAD.map(r => r));
      // mouth by mood (row 8+3)
      if (mood === 'h') { rows[11] = '..osmssmso..'; rows[12] = '...osmmso...'; }
      if (mood === 'a') { rows[8] = '..okhhhhko..'; rows[11] = '..osmmmmso..'; }
      const sk = mood === 'a' ? mix(skin, '#ff3030', 0.35) : skin;
      const pal = { o: '#120c14', s: sk, S: darken(sk, 0.82), h: hair, e: eye, m: type === 'robot' ? '#4cf0ff' : '#6a2a22', c: cloth, C: darken(cloth, 0.7), a: hat, A: darken(hat, 0.7), y: '#ffd75e', L: '#ff5050', w: '#ffffff', k: '#1a1420' };
      moods[mood] = fromRows(rows, pal);
    }
    return moods;
  }
  const CUSTOMER_TYPES = Object.keys(HATS);

  // ---------- pixel font for the logo (5x7) ----------
  const FONT = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'], E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'], M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'], ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
    ':': ['.....', '..#..', '..#..', '.....', '..#..', '..#..', '.....'],
  };
  function logo(lines, scale) {   // lines: [{text, cols:[...]}]
    const lh = 7, gap = 3, W = Math.max(...lines.map(l => l.text.length * 6 + 2)), H = lines.length * (lh + gap) + 3;
    const c = mk(W, H), x = c.getContext('2d');
    lines.forEach((ln, li) => {
      const ox = Math.floor((W - (ln.text.length * 6 - 1)) / 2), oy = li * (lh + gap) + 1;
      [...ln.text].forEach((ch, ci) => {
        const g = FONT[ch] || FONT[' '], cols = ln.cols[ci % ln.cols.length];
        for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (g[j][i] === '#') {
          x.fillStyle = '#05060c'; x.fillRect(ox + ci * 6 + i + 1, oy + j + 1, 1, 1);
          x.fillRect(ox + ci * 6 + i + 1, oy + j + 2, 1, 1);
        }
        for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (g[j][i] === '#') {
          x.fillStyle = j < 2 ? cols[0] : j < 5 ? cols[1] : cols[2]; x.fillRect(ox + ci * 6 + i, oy + j, 1, 1);
        }
      });
    });
    if (scale && scale > 1) { const o = mk(W * scale, H * scale), ox = o.getContext('2d'); ox.imageSmoothingEnabled = false; ox.drawImage(c, 0, 0, W * scale, H * scale); return o; }
    return c;
  }

  // ---------- biomes ----------
  const BIOMES = {
    volcanic: { sky: ['#2a0f14', '#4a1418', '#7a2218', '#c2461f', '#f07a2a'], far: '#3a1418', farHi: '#5a2020', mid: '#1e0a0c', midHi: '#ff6a2a', ground: ['#3b2422', '#2a1716', '#ff7a2a'], sun: { c: '#ffcf6a', r: 9, x: 0.78, y: 0.55 }, weather: 'embers', els: { H: 5, V: 1.2, E: 1, C: 0.6 }, farKind: 'volcano', midKind: 'rocks' },
    tundra: { sky: ['#8fbfe8', '#a9d2f2', '#c6e3f8', '#e2f2fd', '#f6fbff'], far: '#9fbedc', farHi: '#ffffff', mid: '#3f6f62', midHi: '#f4fbff', ground: ['#f2f8ff', '#cfe2f2', '#a9c6df'], sun: { c: '#fffbe0', r: 7, x: 0.2, y: 0.3 }, weather: 'snow', els: { C: 5, E: 1, V: 0.8, H: 0.6 }, farKind: 'snowpeaks', midKind: 'pines' },
    storm: { sky: ['#14182a', '#1f2440', '#2a3153', '#3a4268', '#4c5680'], far: '#22283f', farHi: '#323a58', mid: '#1a2e22', midHi: '#2e4a34', ground: ['#2f5a2a', '#24461f', '#16300f'], sun: null, weather: 'rain', els: { E: 3.5, C: 1.5, H: 1.5, V: 0.6 }, farKind: 'hills', midKind: 'windtrees' },
    crystal: { sky: ['#140d34', '#21185a', '#33267c', '#4a3696', '#6a4fb2'], far: '#2a1d5a', farHi: '#4a3a8a', mid: '#18203a', midHi: '#7fe3ff', ground: ['#2b3a66', '#1e2b4d', '#7fe3ff'], sun: { c: '#e9d8ff', r: 5, x: 0.7, y: 0.25 }, weather: 'sparkle', stars: true, els: { C: 3, E: 2.5, V: 1, H: 0.6 }, farKind: 'spires', midKind: 'crystaltrees' },
    marsh: { sky: ['#100c1a', '#181226', '#221a33', '#2c2240', '#3a2d50'], far: '#1c1828', farHi: '#2a2438', mid: '#10160f', midHi: '#2c3a24', ground: ['#28321f', '#1c2416', '#4a5a3a'], sun: { c: '#d8e8c0', r: 6, x: 0.3, y: 0.28 }, weather: 'fireflies', stars: true, els: { V: 3, C: 2, E: 1.5, H: 1 }, farKind: 'hills', midKind: 'deadtrees' },
    desert: { sky: ['#ffb84a', '#ffcc6e', '#ffdc94', '#ffeabb', '#fff4d8'], far: '#e8a25a', farHi: '#f6c07a', mid: '#2f6b2f', midHi: '#4f9a3f', ground: ['#f0c070', '#d9a252', '#b8803a'], sun: { c: '#fffbe8', r: 10, x: 0.75, y: 0.32 }, weather: 'heat', els: { H: 4, E: 2, V: 0.7, C: 0.6 }, farKind: 'dunes', midKind: 'cacti' },
    aurora: { sky: ['#03050f', '#070d22', '#0c1634', '#132048', '#1c2d5e'], far: '#26365e', farHi: '#e8f0ff', mid: '#0e1a2e', midHi: '#d8e6f8', ground: ['#dfe9f5', '#b8c9e0', '#8aa0c0'], sun: { c: '#f4f6ff', r: 6, x: 0.82, y: 0.22 }, weather: 'aurora', stars: true, els: { C: 3.5, V: 2, E: 1, H: 0.6 }, farKind: 'snowpeaks', midKind: 'pines' },
    meadow: { sky: ['#6cbcf5', '#8bcdf8', '#aadcfa', '#c9eafc', '#e6f6ff'], far: '#7fb87a', farHi: '#9fd090', mid: '#3f8a3a', midHi: '#6cc04a', ground: ['#6cc04a', '#4f9a38', '#3a7a2a'], sun: { c: '#fff6c0', r: 8, x: 0.18, y: 0.28 }, weather: 'petals', els: { H: 2.5, C: 2.5, E: 1.5, V: 0.8 }, farKind: 'hills', midKind: 'roundtrees' },
  };
  const BIOME_IDS = Object.keys(BIOMES);

  function buildBiome(id, w, h) {
    const B = BIOMES[id], R = rnd(id.length * 977 + id.charCodeAt(0) * 31 + h);
    // sky (static)
    const sky = mk(w, h), sx = sky.getContext('2d'), n = B.sky.length;
    for (let j = 0; j < h; j++) {
      const f = j / h * n, bi = Math.min(n - 1, Math.floor(f)), frac = f - bi;
      for (let i = 0; i < w; i++) {
        const dither = frac > 0.75 && ((i + j) & 1) && bi < n - 1;
        sx.fillStyle = B.sky[dither ? bi + 1 : bi]; sx.fillRect(i, j, 1, 1);
      }
    }
    if (B.stars) for (let k = 0; k < w * h / 140; k++) { sx.fillStyle = R() < 0.3 ? '#ffffff' : '#9aa6d8'; sx.fillRect(Math.floor(R() * w), Math.floor(R() * h * 0.6), 1, 1); }
    if (B.sun) {
      const cx = Math.round(B.sun.x * w), cy = Math.round(B.sun.y * h), r = B.sun.r;
      for (let j = -r - 3; j <= r + 3; j++) for (let i = -r - 3; i <= r + 3; i++) {
        const d = Math.hypot(i, j);
        if (d <= r) { sx.fillStyle = B.sun.c; sx.fillRect(cx + i, cy + j, 1, 1); }
        else if (d <= r + 2.5 && ((i + j) & 1)) { sx.globalAlpha = 0.45; sx.fillStyle = B.sun.c; sx.fillRect(cx + i, cy + j, 1, 1); sx.globalAlpha = 1; }
      }
      if (id === 'marsh' || id === 'aurora' || id === 'crystal') { sx.fillStyle = B.sky[1]; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (Math.hypot(i - 3, j - 1) <= r - 1 && Math.hypot(i, j) <= r) sx.fillRect(cx + i, cy + j, 1, 1); }
    }
    const gH = Math.max(6, Math.round(h * 0.17));
    // far layer
    const FW = 480, far = mk(FW, h), fx = far.getContext('2d');
    const ph = [R() * 6.28, R() * 6.28, R() * 6.28];
    const baseF = h - gH - Math.round(h * 0.12);
    for (let i = 0; i < FW; i++) {
      const t = i / FW * Math.PI * 2;
      let y;
      if (B.farKind === 'dunes') y = baseF - (Math.sin(t * 2 + ph[0]) * 0.5 + 0.5) * h * 0.16 - Math.sin(t * 5 + ph[1]) * h * 0.03;
      else if (B.farKind === 'hills') y = baseF - (Math.sin(t * 3 + ph[0]) * 0.5 + 0.5) * h * 0.14 - Math.sin(t * 7 + ph[1]) * h * 0.03;
      else {   // jagged peaks
        const saw = (v) => 1 - Math.abs(((v % 1) + 1) % 1 * 2 - 1);
        y = baseF - (saw(i / 90 + ph[0]) * 0.65 + saw(i / 37 + ph[1]) * 0.25 + saw(i / 13 + ph[2]) * 0.1) * h * 0.38;
      }
      y = Math.round(y);
      fx.fillStyle = B.far; fx.fillRect(i, y, 1, h - y);
      fx.fillStyle = B.farHi; fx.fillRect(i, y, 1, 1);
      if (B.farKind === 'snowpeaks' && y < baseF - h * 0.22) { fx.fillStyle = B.farHi; fx.fillRect(i, y, 1, Math.round((baseF - h * 0.22 - y) * 0.6) + 1); }
      if (B.farKind === 'volcano' && y < baseF - h * 0.3 && R() < 0.5) { fx.fillStyle = '#ff6a2a'; fx.fillRect(i, y, 1, 2); }
      if (B.farKind === 'spires' && (i % 23 === 0)) { const sh = Math.round(h * (0.2 + R() * 0.2)); for (let k = 0; k < sh; k++) { const ww = Math.max(1, Math.round((k / sh) * 3)); fx.fillStyle = k < 2 ? '#bff4ff' : '#4a3a8a'; fx.fillRect(i - ww, y - sh + k, ww * 2 + 1, 1); } }
    }
    if (B.farKind === 'volcano') {   // smoke plumes
      for (let k = 0; k < 3; k++) { const vx = Math.floor(R() * FW); for (let j = 0; j < 14; j++) { fx.globalAlpha = 0.25; fx.fillStyle = '#2a1416'; fx.fillRect(vx + Math.round(Math.sin(j * 0.6) * 3) - 2 - j / 3, baseF - h * 0.42 - j * 2, 5 + j / 2, 2); } fx.globalAlpha = 1; }
    }
    // mid layer (features)
    const MW = 400, mid = mk(MW, h), mx = mid.getContext('2d');
    const gy = h - gH;   // ground top
    const px = (i, j, c) => { mx.fillStyle = c; mx.fillRect(i, j, 1, 1); };
    const rect = (i, j, w2, h2, c) => { mx.fillStyle = c; mx.fillRect(i, j, w2, h2); };
    let xx = 6;
    while (xx < MW - 10) {
      const k = B.midKind;
      if (k === 'pines') {
        const th = Math.round(h * (0.22 + R() * 0.2)), cx = xx;
        for (let j = 0; j < th; j++) { const ww = Math.round(j / th * th * 0.32) + 1; const yy = gy - th + j; rect(cx - ww, yy, ww * 2 + 1, 1, (j % 5 === 0) ? B.midHi : B.mid); }
        rect(cx - 1, gy - 2, 3, 3, '#3a2a1a');
        xx += 10 + Math.floor(R() * 26);
      } else if (k === 'roundtrees') {
        const r = 4 + Math.floor(R() * 5), cx = xx, tH = 4 + Math.floor(R() * 5), cy = gy - tH - r;
        rect(cx - 1, cy, 2, tH + r, '#5a3a1a');
        for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) px(cx + i, cy + j, (i + j < -r * 0.5) ? B.midHi : B.mid);
        if (R() < 0.5) for (let f = 0; f < 4; f++) px(cx + Math.floor(R() * 14) - 7, gy - 1, ['#ff8fb1', '#fff27a', '#ffffff', '#c08cff'][f]);
        xx += 18 + Math.floor(R() * 30);
      } else if (k === 'cacti') {
        const th = 8 + Math.floor(R() * 10), cx = xx;
        rect(cx - 1, gy - th, 3, th, B.mid); rect(cx - 1, gy - th, 1, th, B.midHi);
        if (R() < 0.8) { rect(cx - 4, gy - th + 3, 3, 2, B.mid); rect(cx - 4, gy - th, 2, 4, B.mid); }
        if (R() < 0.8) { rect(cx + 2, gy - th + 5, 3, 2, B.mid); rect(cx + 3, gy - th + 2, 2, 4, B.mid); }
        if (R() < 0.5) { const rw = 4 + Math.floor(R() * 6); rect(cx + 10, gy - 3, rw, 3, '#c08a50'); rect(cx + 10, gy - 3, rw, 1, '#e0b070'); }
        xx += 22 + Math.floor(R() * 40);
      } else if (k === 'deadtrees') {
        const th = Math.round(h * (0.2 + R() * 0.18)), cx = xx;
        rect(cx, gy - th, 2, th, B.mid);
        for (let b = 0; b < 3; b++) { const by = gy - th + 3 + b * Math.floor(th / 4), dir = b % 2 ? 1 : -1; for (let s = 0; s < 5; s++) px(cx + (dir > 0 ? 2 : -1) + dir * s, by - Math.floor(s / 2), B.mid); }
        for (let r2 = 0; r2 < 6; r2++) rect(cx + 6 + r2 * 2, gy - 2 - Math.floor(R() * 4), 1, 6, B.midHi);
        xx += 26 + Math.floor(R() * 34);
      } else if (k === 'crystaltrees') {
        const th = Math.round(h * (0.16 + R() * 0.16)), cx = xx, cc = R() < 0.5 ? ['#7fe3ff', '#bff4ff', '#3a8ab8'] : ['#ff8fe0', '#ffd0f4', '#a03a9a'];
        rect(cx, gy - th, 2, th, '#2a2050');
        for (let s = 0; s < 4; s++) { const sx2 = cx - 5 + Math.floor(R() * 12), sh = 4 + Math.floor(R() * 7), sy = gy - th - 2 + Math.floor(R() * 6); for (let j = 0; j < sh; j++) { const ww = Math.max(0, Math.round((j / sh) * 2)); rect(sx2 - ww, sy - sh + j, ww * 2 + 1, 1, j < 2 ? cc[1] : (j % 3 ? cc[0] : cc[2])); } }
        xx += 16 + Math.floor(R() * 28);
      } else if (k === 'windtrees') {
        const th = Math.round(h * (0.14 + R() * 0.12)), cx = xx;
        for (let j = 0; j < th; j++) rect(cx + Math.floor(j / 4), gy - j, 2, 1, '#151a1e');
        for (let j = 0; j < 7; j++) rect(cx + th / 4 - 6 + j, gy - th - 3 + Math.abs(j - 3), 10 - Math.abs(j - 3), 3, B.mid);
        xx += 24 + Math.floor(R() * 40);
      } else {   // rocks (volcanic)
        const th = Math.round(h * (0.12 + R() * 0.2)), cx = xx, ww = 4 + Math.floor(R() * 6);
        for (let j = 0; j < th; j++) { const w2 = Math.max(1, Math.round(ww * (1 - j / th * 0.8))); rect(cx - w2, gy - j, w2 * 2, 1, B.mid); }
        if (R() < 0.6) for (let j = 0; j < th - 2; j++) if (R() < 0.6) px(cx - 1 + Math.floor(Math.sin(j) * 1.5), gy - j, B.midHi);
        xx += 16 + Math.floor(R() * 30);
      }
    }
    // ground layer
    const GW = 320, gnd = mk(GW, h), gx = gnd.getContext('2d');
    gx.fillStyle = B.ground[0]; gx.fillRect(0, h - gH, GW, gH);
    gx.fillStyle = B.ground[1]; for (let i = 0; i < GW; i++) if (R() < 0.6) gx.fillRect(i, h - gH + 2 + Math.floor(R() * (gH - 2)), 1, 1);
    gx.fillStyle = B.ground[1]; gx.fillRect(0, h - gH, GW, 1);
    for (let k = 0; k < 10; k++) {
      const i = Math.floor(R() * GW), j = h - gH + 2 + Math.floor(R() * (gH - 3));
      if (id === 'volcanic') { gx.fillStyle = '#ff7a2a'; gx.fillRect(i, j, 4 + Math.floor(R() * 6), 1); gx.fillStyle = '#ffd06a'; gx.fillRect(i + 1, j, 2, 1); }
      else if (id === 'crystal') { gx.fillStyle = B.ground[2]; gx.fillRect(i, j, 1, 1); gx.fillRect(i + 1, j - 1, 1, 1); }
      else if (id === 'meadow') { gx.fillStyle = ['#ff8fb1', '#fff27a', '#ffffff'][k % 3]; gx.fillRect(i, j, 1, 1); }
      else if (id === 'storm' || id === 'marsh') { gx.fillStyle = id === 'storm' ? '#4c5680' : '#3a4a5a'; gx.fillRect(i, j, 5, 1); }
      else { gx.fillStyle = B.ground[2]; gx.fillRect(i, j, 3, 1); }
    }
    // the near track bed
    gx.fillStyle = '#2a2026'; gx.fillRect(0, h - 3, GW, 3); gx.fillStyle = '#4a3a3a'; for (let i = 0; i < GW; i += 8) gx.fillRect(i, h - 3, 4, 1);
    return { id, sky, far, mid, gnd, gH, B };
  }

  window.PAArt = { PAL, COMMON, SYM, MINI, mk, rnd, fromRows, essence, slag, ING, BOTTLE, ICON, ICON_PAL, customer, CUSTOMER_TYPES, logo, BIOMES, BIOME_IDS, buildBiome, darken, mix };
})();
