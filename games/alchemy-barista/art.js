// Alchemy Barista — procedural art: creature customers, ingredient jars and small vector icons (no text here).
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const hsl = (h, s, l, a) => a == null ? `hsl(${h},${s}%,${l}%)` : `hsla(${h},${s}%,${l}%,${a})`;
  const ell = (c, x, y, rx, ry, rot) => { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); };
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };

  // ---------- icons (24x24 SVG paths, shared by canvas + DOM) ----------
  const ICONS = {
    flame: { d: 'M12 2.5c.9 3.7 5.2 5.7 5.2 10.6a5.2 5.2 0 0 1-10.4 0c0-2.7 1.6-4 2.1-6.4 1.1 1 1.8 2.2 1.8 3.8 1.3-2 1.7-4.8 1.3-8z', fill: 1 },
    snow: { d: 'M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.3 4.2L12 6.9l2.7-2.7M9.3 19.8L12 17.1l2.7 2.7M4.3 10.9l3.6-.9-.9-3.6M19.7 13.1l-3.6.9.9 3.6', fill: 0 },
    sun: { d: 'M16.2 12a4.2 4.2 0 1 1-8.4 0a4.2 4.2 0 1 1 8.4 0M12 2.2v2.6M12 19.2v2.6M2.2 12h2.6M19.2 12h2.6M5.1 5.1l1.8 1.8M17.1 17.1l1.8 1.8M5.1 18.9l1.8-1.8M17.1 6.9l1.8-1.8', fill: 0 },
    moon: { d: 'M14.8 2.8a9 9 0 1 0 6.6 14.4A7.4 7.4 0 0 1 14.8 2.8z', fill: 1 },
    bolt: { d: 'M13.8 2L5 13.6h6.2L9.9 22l9.1-12.2h-6.3z', fill: 1 },
    leaf: { d: 'M4.2 19.8C4.2 10 9.8 4.2 20.2 4.2c0 10-5.8 15.6-16 15.6zM4.2 19.8L13 11', fill: 2 },
    heart: { d: 'M12 21s-7.6-4.7-9.6-9.4C.9 7.9 3.4 4.4 7 4.4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 6.1 3.5 4.6 7.2C19.6 16.3 12 21 12 21z', fill: 1 },
    orb: { d: 'M12 3a7.5 7.5 0 1 0 .01 0zM6.5 18.5l-1.5 3h14l-1.5-3', fill: 2 },
    hourglass: { d: 'M6 2.5h12M6 21.5h12M7.5 2.5c0 6 4.5 6 4.5 9.5S7.5 15.5 7.5 21.5M16.5 2.5c0 6-4.5 6-4.5 9.5s4.5 3.5 4.5 9.5', fill: 0 },
    pause: { d: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z', fill: 1 },
    sound: { d: 'M4 9h4l5-4.5v15L8 15H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12', fill: 2 },
    note: { d: 'M9 18.5a3 3 0 1 1-2-2.8V4.5l11-2v13a3 3 0 1 1-2-2.8V6.6l-7 1.3z', fill: 1 },
    cup: { d: 'M4 7h13v6a6.5 6.5 0 0 1-13 0zM17 9h1.5a2.5 2.5 0 0 1 0 5H17M7 2.5c-.6 1 .6 1.8 0 2.8M11 2.5c-.6 1 .6 1.8 0 2.8', fill: 2 },
    lock: { d: 'M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5.5 11h13v10h-13z', fill: 0 },
    star: { d: 'M12 2.5l2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17.1l-5.9 3.3 1.4-6.6-5-4.5 6.7-.7z', fill: 1 },
  };
  const P2D = {};
  const path = (n) => P2D[n] || (P2D[n] = new Path2D(ICONS[n].d));
  // draw an icon centred at x,y with the given pixel size
  function icon(c, name, x, y, size, color, lw) {
    const ic = ICONS[name]; if (!ic) return;
    c.save(); c.translate(x - size / 2, y - size / 2); c.scale(size / 24, size / 24);
    c.fillStyle = color; c.strokeStyle = color; c.lineWidth = lw || 2.2; c.lineCap = 'round'; c.lineJoin = 'round';
    if (ic.fill === 1) c.fill(path(name)); else if (ic.fill === 0) c.stroke(path(name)); else { c.fill(path(name)); c.stroke(path(name)); }
    c.restore();
  }
  function iconSvg(name, color, size) {
    const ic = ICONS[name]; if (!ic) return '';
    const st = ic.fill === 1 ? `fill="${color}"` : ic.fill === 0 ? `fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"` : `fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round"`;
    return `<svg class="ico" width="${size || 16}" height="${size || 16}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ic.d}" ${st}/></svg>`;
  }

  // ---------- faces ----------
  // o: { mood: idle|happy|sad|angry|drink|wow|impatient, blink 0..1, look -1..1 }
  function eyes(c, x1, x2, y, r, o, style) {
    const m = o.mood || 'idle', ink = style === 'glow' ? (o.glow || '#7ff6ff') : '#24151f';
    c.save();
    for (const x of [x1, x2]) {
      const side = x < (x1 + x2) / 2 ? -1 : 1;
      if (m === 'happy' || m === 'drink') {
        c.strokeStyle = ink; c.lineWidth = r * 0.42; c.lineCap = 'round'; c.beginPath();
        if (m === 'happy') c.arc(x, y + r * 0.35, r * 0.72, Math.PI * 1.15, Math.PI * 1.85);
        else { c.moveTo(x - r * 0.7, y); c.quadraticCurveTo(x, y + r * 0.45, x + r * 0.7, y); }
        if (style === 'glow') { c.shadowColor = ink; c.shadowBlur = r * 1.5; }
        c.stroke(); continue;
      }
      const open = Math.max(0.08, 1 - (o.blink || 0)) * (m === 'sad' ? 0.8 : m === 'wow' ? 1.15 : 1);
      if (style === 'glow') {
        c.fillStyle = ink; c.shadowColor = ink; c.shadowBlur = r * 2;
        const hh = r * 0.62 * open;
        if (m === 'angry') { c.beginPath(); c.moveTo(x - r, y - hh + side * r * 0.35); c.lineTo(x + r, y - hh - side * r * 0.35); c.lineTo(x + r, y + hh); c.lineTo(x - r, y + hh); c.fill(); }
        else rr(c, x - r, y - hh, r * 2, hh * 2, r * 0.25), c.fill();
        c.shadowBlur = 0; continue;
      }
      if (style === 'dot') {
        c.fillStyle = ink; ell(c, x + (o.look || 0) * r * 0.2, y, r * 0.8, r * 1.05 * open); c.fill();
        if (open > 0.4) { c.fillStyle = 'rgba(255,255,255,.9)'; circ(c, x + r * 0.25, y - r * 0.4, r * 0.28); c.fill(); }
      } else {
        c.fillStyle = '#fff'; ell(c, x, y, r, r * 1.08 * open); c.fill();
        c.strokeStyle = 'rgba(40,20,30,.35)'; c.lineWidth = r * 0.12; c.stroke();
        if (open > 0.25) {
          c.fillStyle = ink; ell(c, x + (o.look || 0) * r * 0.35, y + (m === 'sad' ? r * 0.25 : 0), r * 0.6, r * 0.62 * Math.min(1, open)); c.fill();
          c.fillStyle = '#fff'; circ(c, x + (o.look || 0) * r * 0.35 + r * 0.2, y - r * 0.22, r * 0.2); c.fill();
        }
      }
    }
    // brows
    if (m === 'angry' || m === 'sad' || m === 'impatient') {
      c.strokeStyle = style === 'glow' ? '#3a3846' : '#3b2230'; c.lineWidth = r * 0.36; c.lineCap = 'round';
      for (const x of [x1, x2]) {
        const side = x < (x1 + x2) / 2 ? -1 : 1, by = y - r * 1.45;
        const tilt = m === 'angry' ? 0.5 : m === 'sad' ? -0.45 : 0.15;
        c.beginPath(); c.moveTo(x - side * r * 0.9, by - tilt * r * 0.6); c.lineTo(x + side * r * 0.8, by + tilt * r * 0.6); c.stroke();
      }
    }
    c.restore();
  }
  function mouth(c, x, y, w, o, tongue) {
    const m = o.mood || 'idle';
    c.save(); c.strokeStyle = '#3b1d28'; c.fillStyle = '#5b2333'; c.lineWidth = Math.max(1.5, w * 0.22); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    if (m === 'happy') {
      c.moveTo(x - w, y - w * 0.15); c.quadraticCurveTo(x, y + w * 1.5, x + w, y - w * 0.15); c.closePath(); c.fill();
      c.fillStyle = tongue || '#ff8fa3'; ell(c, x, y + w * 0.5, w * 0.45, w * 0.25); c.fill();
    } else if (m === 'drink' || m === 'wow') {
      ell(c, x, y + w * 0.2, w * 0.35, w * 0.42); c.fill();
    } else if (m === 'sad') {
      c.moveTo(x - w * 0.7, y + w * 0.5); c.quadraticCurveTo(x, y - w * 0.3, x + w * 0.7, y + w * 0.5); c.stroke();
    } else if (m === 'angry') {
      c.moveTo(x - w * 0.8, y + w * 0.35); c.lineTo(x - w * 0.3, y); c.lineTo(x + w * 0.2, y + w * 0.3); c.lineTo(x + w * 0.8, y); c.stroke();
    } else if (m === 'impatient') {
      c.moveTo(x - w * 0.6, y + w * 0.15); c.quadraticCurveTo(x - w * 0.2, y - w * 0.15, x, y + w * 0.1); c.quadraticCurveTo(x + w * 0.3, y + w * 0.3, x + w * 0.6, y); c.stroke();
    } else {
      c.moveTo(x - w * 0.6, y); c.quadraticCurveTo(x, y + w * 0.6, x + w * 0.6, y); c.stroke();
    }
    c.restore();
  }
  function cheeks(c, x1, x2, y, r, a) {
    c.save(); c.fillStyle = `rgba(255,120,150,${a == null ? 0.35 : a})`; ell(c, x1, y, r, r * 0.6); c.fill(); ell(c, x2, y, r, r * 0.6); c.fill(); c.restore();
  }
  function sweat(c, x, y, r) {
    c.save(); c.fillStyle = 'rgba(140,210,255,.9)'; c.beginPath(); c.moveTo(x, y - r * 1.6); c.quadraticCurveTo(x + r, y - r * 0.2, x, y + r * 0.6); c.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; circ(c, x - r * 0.25, y - r * 0.1, r * 0.25); c.fill(); c.restore();
  }
  function tear(c, x, y, r, t) {
    const k = (t * 1.2) % 1; c.save(); c.globalAlpha = 1 - k; c.fillStyle = 'rgba(120,190,255,.9)'; circ(c, x, y + k * r * 6, r * 0.55); c.fill(); c.restore();
  }

  // ---------- creatures ----------
  // origin = centre of the creature on the counter line; it grows upward (negative y). s = height unit.
  const CR = {};
  CR.dragon = (c, s, t, o) => {
    const h = o.hue == null ? 135 : o.hue, body = hsl(h, 52, 47), dark = hsl(h, 48, 31), light = hsl(h, 55, 62);
    const fl = Math.sin(t * 5.5) * 0.22 + (o.mood === 'happy' ? Math.sin(t * 14) * 0.25 : 0);
    for (const side of [-1, 1]) {   // wings
      c.save(); c.translate(side * s * 0.2, -s * 0.5); c.scale(side, 1); c.rotate(-0.25 - fl);
      c.fillStyle = dark; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 0.12, -s * 0.3); c.lineTo(s * 0.42, -s * 0.36);
      c.quadraticCurveTo(s * 0.36, -s * 0.22, s * 0.44, -s * 0.12); c.quadraticCurveTo(s * 0.3, -s * 0.08, s * 0.34, s * 0.04); c.quadraticCurveTo(s * 0.16, -s * 0.02, 0, s * 0.08); c.closePath(); c.fill();
      c.strokeStyle = light; c.lineWidth = s * 0.012; c.beginPath(); c.moveTo(s * 0.12, -s * 0.3); c.lineTo(s * 0.3, -s * 0.1); c.moveTo(s * 0.12, -s * 0.3); c.lineTo(s * 0.16, 0); c.stroke();
      c.restore();
    }
    c.fillStyle = body; ell(c, 0, -s * 0.27, s * 0.3, s * 0.34); c.fill();
    c.fillStyle = '#ffe2a6'; ell(c, 0, -s * 0.22, s * 0.18, s * 0.25); c.fill();
    c.strokeStyle = 'rgba(190,140,70,.55)'; c.lineWidth = s * 0.012;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(0, -s * (0.36 - i * 0.075), s * 0.16 - Math.abs(i - 1.5) * s * 0.012, s * 0.03, 0, 0.15, Math.PI - 0.15); c.stroke(); }
    c.fillStyle = body; ell(c, -s * 0.25, -s * 0.3, s * 0.06, s * 0.09, 0.5); c.fill(); ell(c, s * 0.25, -s * 0.3, s * 0.06, s * 0.09, -0.5); c.fill();
    // head
    c.fillStyle = dark; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * s * 0.07 - s * 0.04, -s * 0.9); c.lineTo(i * s * 0.07, -s * 1.0 + Math.abs(i) * s * 0.03); c.lineTo(i * s * 0.07 + s * 0.04, -s * 0.9); c.fill(); }
    c.fillStyle = '#fff1cf';
    for (const side of [-1, 1]) { c.beginPath(); c.moveTo(side * s * 0.1, -s * 0.88); c.quadraticCurveTo(side * s * 0.2, -s * 0.98, side * s * 0.22, -s * 1.06); c.quadraticCurveTo(side * s * 0.21, -s * 0.94, side * s * 0.17, -s * 0.85); c.fill(); }
    c.fillStyle = body; circ(c, 0, -s * 0.7, s * 0.24); c.fill();
    c.fillStyle = light; ell(c, 0, -s * 0.6, s * 0.17, s * 0.11); c.fill();
    c.fillStyle = dark; ell(c, -s * 0.055, -s * 0.63, s * 0.02, s * 0.014); c.fill(); ell(c, s * 0.055, -s * 0.63, s * 0.02, s * 0.014); c.fill();
    eyes(c, -s * 0.1, s * 0.1, -s * 0.77, s * 0.062, o);
    cheeks(c, -s * 0.17, s * 0.17, -s * 0.66, s * 0.04);
    mouth(c, 0, -s * 0.555, s * 0.06, o);
    return { head: [0, -s * 0.72], mouth: [0, -s * 0.6], top: -s * 1.06 };
  };
  CR.ghost = (c, s, t, o) => {
    const fy = -s * 0.16 + Math.sin(t * 2.1) * s * 0.035; c.save(); c.translate(0, fy);
    const g = c.createRadialGradient(0, -s * 0.5, s * 0.1, 0, -s * 0.5, s * 0.6); g.addColorStop(0, 'rgba(200,210,255,.35)'); g.addColorStop(1, 'rgba(200,210,255,0)');
    c.fillStyle = g; circ(c, 0, -s * 0.5, s * 0.6); c.fill();
    c.fillStyle = 'rgba(250,250,255,.95)'; c.beginPath(); c.moveTo(-s * 0.28, -s * 0.62); c.arc(0, -s * 0.62, s * 0.28, Math.PI, 0);
    c.lineTo(s * 0.3, s * 0.05);
    const n = 6; for (let i = 0; i <= n; i++) { const x = s * 0.3 - i * s * 0.6 / n; c.lineTo(x, s * 0.05 + Math.sin(i * 1.6 + t * 4.5) * s * 0.035 + (i % 2) * s * 0.03); }
    c.closePath(); c.fill(); c.strokeStyle = 'rgba(170,170,220,.55)'; c.lineWidth = s * 0.012; c.stroke();
    c.fillStyle = 'rgba(240,240,255,.95)'; const wv = Math.sin(t * 3) * 0.3 + (o.mood === 'happy' ? Math.sin(t * 12) * 0.5 : 0);
    ell(c, -s * 0.32, -s * 0.38, s * 0.07, s * 0.045, -0.6 - wv); c.fill(); ell(c, s * 0.32, -s * 0.38, s * 0.07, s * 0.045, 0.6 + wv); c.fill();
    eyes(c, -s * 0.1, s * 0.1, -s * 0.62, s * 0.055, o, 'dot');
    cheeks(c, -s * 0.17, s * 0.17, -s * 0.52, s * 0.045, 0.45);
    mouth(c, 0, -s * 0.5, s * 0.05, o);
    c.restore();
    return { head: [0, -s * 0.62 + fy], mouth: [0, -s * 0.5 + fy], top: -s * 0.95 + fy };
  };
  CR.wizard = (c, s, t, o) => {
    const h = o.hue == null ? 255 : o.hue, robe = hsl(h, 45, 38), robeD = hsl(h, 45, 27);
    // staff
    c.strokeStyle = '#7a4f2c'; c.lineWidth = s * 0.035; c.lineCap = 'round'; c.beginPath(); c.moveTo(s * 0.34, s * 0.05); c.lineTo(s * 0.34, -s * 0.92); c.stroke();
    const pulse = 0.7 + Math.sin(t * 3) * 0.3;
    const sg = c.createRadialGradient(s * 0.34, -s * 0.98, 0, s * 0.34, -s * 0.98, s * 0.16); sg.addColorStop(0, `rgba(255,240,170,${pulse})`); sg.addColorStop(1, 'rgba(255,220,120,0)');
    c.fillStyle = sg; circ(c, s * 0.34, -s * 0.98, s * 0.16); c.fill(); icon(c, 'star', s * 0.34, -s * 0.98, s * 0.13, '#ffe58a');
    // robe
    c.fillStyle = robe; c.beginPath(); c.moveTo(-s * 0.19, -s * 0.5); c.quadraticCurveTo(-s * 0.36, -s * 0.3, -s * 0.38, s * 0.05); c.lineTo(s * 0.38, s * 0.05); c.quadraticCurveTo(s * 0.36, -s * 0.3, s * 0.19, -s * 0.5); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,230,140,.55)'; for (const [x, y] of [[-0.22, -0.15], [0.18, -0.25], [-0.05, -0.05], [0.24, -0.02]]) icon(c, 'star', s * x, s * y, s * 0.07, 'rgba(255,230,140,.6)');
    c.fillStyle = '#f2c9a0'; circ(c, s * 0.3, -s * 0.32, s * 0.055); c.fill();
    c.fillStyle = robeD; ell(c, s * 0.24, -s * 0.33, s * 0.08, s * 0.06, -0.4); c.fill();
    // head + beard
    c.fillStyle = '#f2c9a0'; circ(c, 0, -s * 0.6, s * 0.15); c.fill();
    c.fillStyle = '#f5f2ea'; c.beginPath(); c.moveTo(-s * 0.15, -s * 0.6);
    c.quadraticCurveTo(-s * 0.2, -s * 0.36, 0, -s * 0.24 + Math.sin(t * 2) * s * 0.01); c.quadraticCurveTo(s * 0.2, -s * 0.36, s * 0.15, -s * 0.6); c.quadraticCurveTo(0, -s * 0.5, -s * 0.15, -s * 0.6); c.fill();
    for (const [x, y, r] of [[-0.12, -0.52, 0.05], [0.12, -0.52, 0.05], [0, -0.46, 0.06], [-0.07, -0.38, 0.05], [0.07, -0.38, 0.05]]) { circ(c, s * x, s * y, s * r); c.fill(); }
    c.fillStyle = '#e8a68a'; ell(c, 0, -s * 0.58, s * 0.035, s * 0.03); c.fill();
    eyes(c, -s * 0.06, s * 0.06, -s * 0.64, s * 0.032, o);
    c.strokeStyle = '#f5f2ea'; c.lineWidth = s * 0.025; c.lineCap = 'round';
    const bt = o.mood === 'angry' ? 0.03 : o.mood === 'sad' ? -0.02 : 0;
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.69 - bt); c.lineTo(-s * 0.03, -s * 0.69 + bt); c.moveTo(s * 0.1, -s * 0.69 - bt); c.lineTo(s * 0.03, -s * 0.69 + bt); c.stroke();
    mouth(c, 0, -s * 0.52, s * 0.04, o);
    // hat
    const sway = Math.sin(t * 1.4) * s * 0.025;
    c.fillStyle = robeD; c.beginPath(); c.moveTo(-s * 0.16, -s * 0.72); c.quadraticCurveTo(-s * 0.05, -s * 0.95, s * 0.16 + sway, -s * 1.2); c.quadraticCurveTo(s * 0.05, -s * 0.94, s * 0.17, -s * 0.72); c.closePath(); c.fill();
    c.fillStyle = '#e9b949'; c.fillRect(-s * 0.16, -s * 0.78, s * 0.33, s * 0.04);
    c.fillStyle = robe; ell(c, 0, -s * 0.72, s * 0.27, s * 0.05); c.fill();
    icon(c, 'moon', s * 0.02, -s * 0.88, s * 0.08, '#ffe58a');
    return { head: [0, -s * 0.6], mouth: [0, -s * 0.52], top: -s * 1.2 };
  };
  CR.slime = (c, s, t, o) => {
    const h = o.hue == null ? 150 : o.hue;
    const k = Math.sin(t * 3.2) * 0.05 + (o.mood === 'happy' ? Math.abs(Math.sin(t * 9)) * 0.12 : 0);
    const w = s * 0.34 * (1 + k), ht = s * 0.55 * (1 - k);
    const g = c.createLinearGradient(0, -ht, 0, 0); g.addColorStop(0, hsl(h, 75, 66, 0.92)); g.addColorStop(1, hsl(h, 70, 44, 0.92));
    c.fillStyle = g; c.beginPath(); c.moveTo(-w, 0); c.bezierCurveTo(-w * 1.02, -ht * 0.72, -w * 0.55, -ht, 0, -ht); c.bezierCurveTo(w * 0.55, -ht, w * 1.02, -ht * 0.72, w, 0); c.closePath(); c.fill();
    c.fillStyle = hsl(h, 60, 36, 0.35); for (const [x, y, r] of [[-0.12, -0.12, 0.04], [0.15, -0.2, 0.03], [0.05, -0.08, 0.025]]) { circ(c, w * x / 0.34, ht * y / 0.55, s * r); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; ell(c, -w * 0.45, -ht * 0.72, w * 0.16, ht * 0.08, -0.6); c.fill();
    c.fillStyle = hsl(h, 70, 50, 0.9); ell(c, w * 0.8, -ht * 0.05, s * 0.03, s * 0.05); c.fill();
    eyes(c, -s * 0.1, s * 0.1, -ht * 0.58, s * 0.06, o, 'dot');
    cheeks(c, -s * 0.18, s * 0.18, -ht * 0.45, s * 0.04, 0.4);
    mouth(c, 0, -ht * 0.4, s * 0.05, o);
    return { head: [0, -ht * 0.58], mouth: [0, -ht * 0.4], top: -ht };
  };
  CR.mushroom = (c, s, t, o) => {
    const h = o.hue == null ? 4 : o.hue;
    c.fillStyle = '#f3e2c2'; rr(c, -s * 0.15, -s * 0.52, s * 0.3, s * 0.58, s * 0.1); c.fill();
    c.strokeStyle = '#d9c29b'; c.lineWidth = s * 0.012; c.beginPath(); c.moveTo(-s * 0.08, -s * 0.15); c.quadraticCurveTo(0, -s * 0.1, s * 0.08, -s * 0.15); c.stroke();
    const wave = Math.sin(t * 3) * 0.4;
    c.strokeStyle = '#e8d3ae'; c.lineWidth = s * 0.035; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.14, -s * 0.28); c.lineTo(-s * 0.24, -s * 0.2 - wave * s * 0.05); c.moveTo(s * 0.14, -s * 0.28); c.lineTo(s * 0.24, -s * 0.2 + wave * s * 0.05); c.stroke();
    eyes(c, -s * 0.065, s * 0.065, -s * 0.36, s * 0.045, o);
    cheeks(c, -s * 0.11, s * 0.11, -s * 0.29, s * 0.03);
    mouth(c, 0, -s * 0.27, s * 0.04, o);
    c.save(); c.translate(0, -s * 0.48); c.rotate(Math.sin(t * 1.6) * 0.05);
    c.fillStyle = hsl(h, 25, 80); ell(c, 0, 0, s * 0.36, s * 0.07); c.fill();
    const g = c.createLinearGradient(0, -s * 0.45, 0, 0); g.addColorStop(0, hsl(h, 75, 58)); g.addColorStop(1, hsl(h, 70, 42));
    c.fillStyle = g; c.beginPath(); c.moveTo(-s * 0.42, 0); c.quadraticCurveTo(-s * 0.44, -s * 0.46, 0, -s * 0.46); c.quadraticCurveTo(s * 0.44, -s * 0.46, s * 0.42, 0); c.quadraticCurveTo(0, s * 0.07, -s * 0.42, 0); c.fill();
    c.fillStyle = '#fff6ea'; for (const [x, y, r] of [[-0.22, -0.18, 0.06], [0.05, -0.33, 0.07], [0.25, -0.14, 0.05], [-0.04, -0.12, 0.04], [-0.3, -0.05, 0.03]]) { ell(c, s * x, s * y, s * r, s * r * 0.85); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.25)'; ell(c, -s * 0.15, -s * 0.34, s * 0.12, s * 0.04, -0.4); c.fill();
    c.restore();
    return { head: [0, -s * 0.36], mouth: [0, -s * 0.27], top: -s * 0.95 };
  };
  CR.yeti = (c, s, t, o) => {
    const fur = '#eef3ff', shade = '#c7d4ec', face = o.hue == null ? '#7d9cc6' : hsl(o.hue, 35, 62);
    const breathe = 1 + Math.sin(t * 2) * 0.015;
    c.fillStyle = '#f6efd8'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * s * 0.14, -s * 0.88); c.quadraticCurveTo(sd * s * 0.28, -s * 0.98, sd * s * 0.3, -s * 0.84); c.quadraticCurveTo(sd * s * 0.24, -s * 0.9, sd * s * 0.2, -s * 0.8); c.fill(); }
    const tuft = (cx, cy, rx, ry, n, col) => {
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? 0.88 : 1.04; const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.closePath(); c.fill();
    };
    tuft(0, -s * 0.42, s * 0.37 * breathe, s * 0.48, 16, shade);
    tuft(0, -s * 0.44, s * 0.34 * breathe, s * 0.45, 16, fur);
    tuft(-s * 0.32, -s * 0.28, s * 0.09, s * 0.16, 6, shade); tuft(s * 0.32, -s * 0.28, s * 0.09, s * 0.16, 6, shade);
    c.fillStyle = face; ell(c, 0, -s * 0.56, s * 0.2, s * 0.16); c.fill();
    eyes(c, -s * 0.075, s * 0.075, -s * 0.6, s * 0.045, o);
    mouth(c, 0, -s * 0.5, s * 0.055, o);
    if (o.mood !== 'happy' && o.mood !== 'drink') { c.fillStyle = '#fff'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * s * 0.04, -s * 0.495); c.lineTo(sd * s * 0.025, -s * 0.47); c.lineTo(sd * s * 0.015, -s * 0.495); c.fill(); } }
    cheeks(c, -s * 0.13, s * 0.13, -s * 0.52, s * 0.035, 0.3);
    return { head: [0, -s * 0.58], mouth: [0, -s * 0.5], top: -s * 0.95 };
  };
  CR.fox = (c, s, t, o) => {
    const h = o.hue == null ? 24 : o.hue, orange = hsl(h, 82, 58), orangeD = hsl(h, 75, 44), cream = '#fff3e3';
    for (let i = -1; i <= 1; i++) {   // three spirit tails
      c.save(); c.translate(0, -s * 0.12); c.rotate(i * 0.6 + Math.sin(t * 1.8 + i * 1.3) * 0.13);
      c.fillStyle = orange; c.beginPath(); c.moveTo(-s * 0.05, 0); c.bezierCurveTo(-s * 0.2, -s * 0.3, -s * 0.12, -s * 0.6, 0, -s * 0.74); c.bezierCurveTo(s * 0.12, -s * 0.6, s * 0.2, -s * 0.3, s * 0.05, 0); c.fill();
      c.fillStyle = cream; c.beginPath(); c.moveTo(-s * 0.08, -s * 0.56); c.quadraticCurveTo(0, -s * 0.84, s * 0.08, -s * 0.56); c.quadraticCurveTo(0, -s * 0.62, -s * 0.08, -s * 0.56); c.fill();
      c.restore();
    }
    c.fillStyle = orange; ell(c, 0, -s * 0.25, s * 0.24, s * 0.3); c.fill();
    c.fillStyle = cream; ell(c, 0, -s * 0.22, s * 0.13, s * 0.22); c.fill();
    for (const sd of [-1, 1]) {
      c.fillStyle = orange; c.beginPath(); c.moveTo(sd * s * 0.07, -s * 0.78); c.lineTo(sd * s * 0.21, -s * 1.0); c.lineTo(sd * s * 0.23, -s * 0.72); c.fill();
      c.fillStyle = '#5b2a1c'; c.beginPath(); c.moveTo(sd * s * 0.11, -s * 0.78); c.lineTo(sd * s * 0.2, -s * 0.93); c.lineTo(sd * s * 0.2, -s * 0.75); c.fill();
    }
    c.fillStyle = orange; ell(c, 0, -s * 0.66, s * 0.22, s * 0.18); c.fill();
    c.fillStyle = cream; c.beginPath(); c.moveTo(-s * 0.2, -s * 0.62); c.quadraticCurveTo(-s * 0.1, -s * 0.66, 0, -s * 0.6); c.quadraticCurveTo(s * 0.1, -s * 0.66, s * 0.2, -s * 0.62); c.quadraticCurveTo(s * 0.12, -s * 0.48, 0, -s * 0.47); c.quadraticCurveTo(-s * 0.12, -s * 0.48, -s * 0.2, -s * 0.62); c.fill();
    c.fillStyle = '#2a1714'; ell(c, 0, -s * 0.58, s * 0.03, s * 0.022); c.fill();
    c.fillStyle = '#e8434f'; for (const sd of [-1, 1]) { ell(c, sd * s * 0.06, -s * 0.8, s * 0.02, s * 0.045, sd * 0.4); c.fill(); }
    eyes(c, -s * 0.09, s * 0.09, -s * 0.68, s * 0.05, o);
    mouth(c, 0, -s * 0.53, s * 0.04, o);
    for (let i = 0; i < 2; i++) {   // fox-fire wisps
      const a = t * 1.3 + i * Math.PI, x = Math.cos(a) * s * 0.46, y = -s * 0.6 + Math.sin(a) * s * 0.12;
      const g = c.createRadialGradient(x, y, 0, x, y, s * 0.08); g.addColorStop(0, 'rgba(190,240,255,.95)'); g.addColorStop(1, 'rgba(90,170,255,0)');
      c.fillStyle = g; circ(c, x, y, s * 0.08); c.fill(); icon(c, 'flame', x, y - s * 0.01, s * 0.07, 'rgba(150,220,255,.9)');
    }
    return { head: [0, -s * 0.66], mouth: [0, -s * 0.53], top: -s * 1.0 };
  };
  CR.owl = (c, s, t, o) => {
    const h = o.hue == null ? 28 : o.hue, brown = hsl(h, 38, 40), brownL = hsl(h, 38, 52), belly = '#ecd9b6';
    const flap = Math.sin(t * 2.4) * 0.08 + (o.mood === 'happy' ? Math.sin(t * 13) * 0.4 : 0);
    c.fillStyle = brown; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * s * 0.12, -s * 0.78); c.lineTo(sd * s * 0.24, -s * 0.94); c.lineTo(sd * s * 0.26, -s * 0.72); c.fill(); }
    c.fillStyle = brown; ell(c, 0, -s * 0.42, s * 0.3, s * 0.44); c.fill();
    c.fillStyle = belly; ell(c, 0, -s * 0.28, s * 0.19, s * 0.27); c.fill();
    c.strokeStyle = 'rgba(140,100,60,.5)'; c.lineWidth = s * 0.012;
    for (let r = 0; r < 3; r++) for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * s * 0.08 + (r % 2) * s * 0.04, -s * (0.38 - r * 0.08), s * 0.035, 0.2, Math.PI - 0.2); c.stroke(); }
    c.fillStyle = brownL; ell(c, -s * 0.29, -s * 0.34, s * 0.08, s * 0.2, 0.25 + flap); c.fill(); ell(c, s * 0.29, -s * 0.34, s * 0.08, s * 0.2, -0.25 - flap); c.fill();
    c.fillStyle = '#f4e6c8'; circ(c, -s * 0.1, -s * 0.6, s * 0.115); c.fill(); circ(c, s * 0.1, -s * 0.6, s * 0.115); c.fill();
    eyes(c, -s * 0.1, s * 0.1, -s * 0.6, s * 0.075, o);
    c.strokeStyle = '#c99a3a'; c.lineWidth = s * 0.018; circ(c, -s * 0.1, -s * 0.6, s * 0.1); c.stroke(); circ(c, s * 0.1, -s * 0.6, s * 0.1); c.stroke();
    c.beginPath(); c.moveTo(-s * 0.01, -s * 0.62); c.lineTo(s * 0.01, -s * 0.62); c.stroke();
    c.fillStyle = '#f0a43a'; c.beginPath(); c.moveTo(-s * 0.035, -s * 0.52); c.lineTo(s * 0.035, -s * 0.52); c.lineTo(0, -s * 0.46); c.fill();
    if (o.mood === 'happy' || o.mood === 'drink' || o.mood === 'wow') mouth(c, 0, -s * 0.47, s * 0.03, o);
    // graduation cap
    c.save(); c.translate(0, -s * 0.84); c.rotate(-0.08);
    c.fillStyle = '#2b2440'; c.fillRect(-s * 0.1, -s * 0.02, s * 0.2, s * 0.06);
    c.beginPath(); c.moveTo(-s * 0.2, -s * 0.03); c.lineTo(0, -s * 0.09); c.lineTo(s * 0.2, -s * 0.03); c.lineTo(0, s * 0.03); c.closePath(); c.fill();
    const sw = Math.sin(t * 2.2) * s * 0.02; c.strokeStyle = '#ffcd4a'; c.lineWidth = s * 0.012; c.beginPath(); c.moveTo(0, -s * 0.03); c.lineTo(s * 0.14, -s * 0.01); c.lineTo(s * 0.15 + sw, s * 0.1); c.stroke();
    c.restore();
    return { head: [0, -s * 0.6], mouth: [0, -s * 0.5], top: -s * 0.95 };
  };
  CR.golem = (c, s, t, o) => {
    const glowH = o.hue == null ? 185 : o.hue, glow = hsl(glowH, 95, o.mood === 'happy' ? 75 : 62);
    const stone = '#8e8a9c', dark = '#615d70', light = '#aaa6b8';
    c.fillStyle = dark; circ(c, -s * 0.34, -s * 0.42, s * 0.13); c.fill(); circ(c, s * 0.34, -s * 0.42, s * 0.13); c.fill();
    c.fillStyle = stone; rr(c, -s * 0.31, -s * 0.52, s * 0.62, s * 0.58, s * 0.08); c.fill();
    c.fillStyle = light; rr(c, -s * 0.27, -s * 0.5, s * 0.25, s * 0.08, s * 0.04); c.fill();
    c.strokeStyle = dark; c.lineWidth = s * 0.014; c.beginPath(); c.moveTo(s * 0.15, -s * 0.5); c.lineTo(s * 0.1, -s * 0.38); c.lineTo(s * 0.16, -s * 0.3); c.moveTo(-s * 0.2, -s * 0.12); c.lineTo(-s * 0.12, -s * 0.05); c.stroke();
    c.save(); c.strokeStyle = glow; c.shadowColor = glow; c.shadowBlur = s * 0.05; c.lineWidth = s * 0.02; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.07, -s * 0.32); c.lineTo(0, -s * 0.22); c.lineTo(s * 0.07, -s * 0.32); c.moveTo(0, -s * 0.22); c.lineTo(0, -s * 0.12); c.stroke(); c.restore();
    c.fillStyle = stone; rr(c, -s * 0.2, -s * 0.88, s * 0.4, s * 0.35, s * 0.08); c.fill();
    c.fillStyle = '#6fae52'; c.beginPath(); c.moveTo(-s * 0.2, -s * 0.8); c.quadraticCurveTo(-s * 0.18, -s * 0.92, 0, -s * 0.9); c.quadraticCurveTo(s * 0.18, -s * 0.93, s * 0.2, -s * 0.82); c.lineTo(s * 0.12, -s * 0.84); c.lineTo(s * 0.06, -s * 0.8); c.lineTo(-s * 0.02, -s * 0.84); c.lineTo(-s * 0.12, -s * 0.79); c.closePath(); c.fill();
    c.fillStyle = '#ff8fc0'; circ(c, s * 0.12, -s * 0.9, s * 0.025); c.fill();
    eyes(c, -s * 0.08, s * 0.08, -s * 0.72, s * 0.045, Object.assign({}, o, { glow }), 'glow');
    c.save(); c.strokeStyle = '#3f3c4c'; c.lineWidth = s * 0.02; c.lineCap = 'round'; c.beginPath();
    if (o.mood === 'happy') { c.moveTo(-s * 0.07, -s * 0.62); c.quadraticCurveTo(0, -s * 0.57, s * 0.07, -s * 0.62); }
    else if (o.mood === 'sad' || o.mood === 'angry') { c.moveTo(-s * 0.06, -s * 0.6); c.quadraticCurveTo(0, -s * 0.64, s * 0.06, -s * 0.6); }
    else { c.moveTo(-s * 0.05, -s * 0.61); c.lineTo(s * 0.05, -s * 0.61); }
    c.stroke(); c.restore();
    return { head: [0, -s * 0.72], mouth: [0, -s * 0.61], top: -s * 0.93 };
  };

  function drawCreature(c, type, s, t, o) {
    o = o || {};
    const f = CR[type] || CR.slime;
    c.save();
    // shadow behind the counter edge
    c.fillStyle = 'rgba(20,8,10,.25)'; ell(c, 0, s * 0.02, s * 0.34, s * 0.05); c.fill();
    let bob = Math.sin(t * 2.3) * s * 0.012;
    if (o.mood === 'happy') bob -= Math.abs(Math.sin(t * 8)) * s * 0.06;
    if (o.mood === 'angry') c.translate(Math.sin(t * 50) * s * 0.012, 0);
    c.translate(0, bob);
    const info = f(c, s, t, o) || { head: [0, -s * 0.6], top: -s };
    if (o.mood === 'impatient') sweat(c, info.head[0] + s * 0.2, info.head[1] - s * 0.12, s * 0.03);
    if (o.mood === 'sad') tear(c, info.head[0] - s * 0.12, info.head[1] + s * 0.03, s * 0.03, t);
    if (o.mood === 'angry') {   // steam puffs
      for (let i = 0; i < 2; i++) { const k = (t * 1.5 + i * 0.5) % 1; c.fillStyle = `rgba(255,255,255,${0.6 * (1 - k)})`; circ(c, (i ? 1 : -1) * s * (0.22 + k * 0.1), info.top - k * s * 0.15, s * (0.03 + k * 0.04)); c.fill(); }
    }
    c.restore();
    info.top += bob; info.head = [info.head[0], info.head[1] + bob];
    return info;
  }

  // ---------- ingredient jars ----------
  // x,y = bottom centre; w,h = size; ing has color, shape, fx
  function jarShape(c, shape, w, h) {
    c.beginPath();
    if (shape === 'flask') {   // round potion flask
      const r = w * 0.46, cy = -r * 1.02;
      c.moveTo(-w * 0.12, -h * 0.82); c.lineTo(-w * 0.12, cy - r * 0.96);
      c.arc(0, cy, r, -Math.PI / 2 - 0.27, -Math.PI / 2 + 0.27, true);
      c.lineTo(w * 0.12, -h * 0.82); c.closePath();
    } else if (shape === 'tall') {
      c.moveTo(-w * 0.1, -h * 0.84); c.lineTo(-w * 0.1, -h * 0.66); c.quadraticCurveTo(-w * 0.34, -h * 0.6, -w * 0.34, -h * 0.48);
      c.lineTo(-w * 0.34, -h * 0.05); c.quadraticCurveTo(-w * 0.34, 0, -w * 0.28, 0); c.lineTo(w * 0.28, 0); c.quadraticCurveTo(w * 0.34, 0, w * 0.34, -h * 0.05);
      c.lineTo(w * 0.34, -h * 0.48); c.quadraticCurveTo(w * 0.34, -h * 0.6, w * 0.1, -h * 0.66); c.lineTo(w * 0.1, -h * 0.84); c.closePath();
    } else if (shape === 'vial') {
      c.moveTo(-w * 0.17, -h * 0.84); c.lineTo(-w * 0.17, -h * 0.12); c.arc(0, -h * 0.12, w * 0.17, Math.PI, 0, true); c.lineTo(w * 0.17, -h * 0.84); c.closePath();
    } else if (shape === 'hourglass') {
      c.moveTo(-w * 0.32, -h * 0.82); c.quadraticCurveTo(-w * 0.32, -h * 0.5, -w * 0.05, -h * 0.42); c.quadraticCurveTo(-w * 0.32, -h * 0.34, -w * 0.32, -h * 0.04);
      c.lineTo(w * 0.32, -h * 0.04); c.quadraticCurveTo(w * 0.32, -h * 0.34, w * 0.05, -h * 0.42); c.quadraticCurveTo(w * 0.32, -h * 0.5, w * 0.32, -h * 0.82); c.closePath();
    } else if (shape === 'pot') {
      c.moveTo(-w * 0.3, -h * 0.66); c.quadraticCurveTo(-w * 0.44, -h * 0.6, -w * 0.44, -h * 0.4); c.lineTo(-w * 0.42, -h * 0.08); c.quadraticCurveTo(-w * 0.4, 0, -w * 0.3, 0);
      c.lineTo(w * 0.3, 0); c.quadraticCurveTo(w * 0.4, 0, w * 0.42, -h * 0.08); c.lineTo(w * 0.44, -h * 0.4); c.quadraticCurveTo(w * 0.44, -h * 0.6, w * 0.3, -h * 0.66); c.closePath();
    } else {   // jar
      c.moveTo(-w * 0.36, -h * 0.72); c.lineTo(-w * 0.38, -h * 0.08); c.quadraticCurveTo(-w * 0.38, 0, -w * 0.3, 0); c.lineTo(w * 0.3, 0); c.quadraticCurveTo(w * 0.38, 0, w * 0.38, -h * 0.08); c.lineTo(w * 0.36, -h * 0.72); c.closePath();
    }
  }
  function lidOf(c, shape, w, h, col) {
    c.fillStyle = col;
    if (shape === 'jar' || shape === 'pot') {
      const top = shape === 'pot' ? -h * 0.66 : -h * 0.72;
      rr(c, -w * 0.4, top - h * 0.12, w * 0.8, h * 0.13, w * 0.05); c.fill();
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-w * 0.36, top - h * 0.1, w * 0.72, h * 0.03);
    } else if (shape === 'hourglass') {
      c.fillStyle = '#8a5a2e'; rr(c, -w * 0.4, -h * 0.9, w * 0.8, h * 0.08, w * 0.03); c.fill(); rr(c, -w * 0.4, -h * 0.05, w * 0.8, h * 0.07, w * 0.03); c.fill();
      c.fillRect(-w * 0.36, -h * 0.84, w * 0.05, h * 0.8); c.fillRect(w * 0.31, -h * 0.84, w * 0.05, h * 0.8);
    } else {
      const nw = shape === 'vial' ? w * 0.19 : w * 0.13;
      c.fillStyle = '#b5834f'; rr(c, -nw, -h * 0.97, nw * 2, h * 0.15, nw * 0.4); c.fill();
      c.fillStyle = col; c.fillRect(-nw * 1.1, -h * 0.86, nw * 2.2, h * 0.035);
    }
  }
  function drawJar(c, ing, x, y, w, h, t, opts) {
    opts = opts || {};
    c.save(); c.translate(x, y);
    if (opts.rot) c.rotate(opts.rot);
    if (opts.scale) c.scale(opts.scale, opts.scale);
    const sh = ing.shape, col = ing.color;
    if (opts.glow) { c.save(); c.shadowColor = opts.glow; c.shadowBlur = w * 0.35; jarShape(c, sh, w, h); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill(); c.restore(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, 0, w * 0.4, h * 0.04); c.fill();
    // contents
    c.save(); jarShape(c, sh, w, h); c.clip();
    c.fillStyle = 'rgba(210,235,255,.12)'; c.fillRect(-w, -h, w * 2, h);
    const level = sh === 'hourglass' ? -h * 0.42 : -h * (sh === 'vial' ? 0.62 : sh === 'flask' ? 0.6 : 0.55);
    const g = c.createLinearGradient(0, level, 0, 0); g.addColorStop(0, ing.color2 || col); g.addColorStop(1, col);
    c.fillStyle = g; c.fillRect(-w, level, w * 2, -level + 2);
    if (sh === 'hourglass') { c.fillStyle = col; c.beginPath(); c.moveTo(-w * 0.2, -h * 0.82); c.lineTo(w * 0.2, -h * 0.82); c.lineTo(0, -h * 0.5); c.fill(); c.fillRect(-w * 0.01, -h * 0.5, w * 0.02, h * 0.1 + Math.sin(t * 6) * h * 0.01); }
    jarFx(c, ing, w, h, t, level);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-w, level - 1, w * 2, Math.max(1, h * 0.012));
    c.restore();
    // glass
    jarShape(c, sh, w, h); c.strokeStyle = 'rgba(235,245,255,.75)'; c.lineWidth = Math.max(1.2, w * 0.03); c.stroke();
    c.save(); jarShape(c, sh, w, h); c.clip();
    c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, -w * 0.3, -h * 0.62, w * 0.08, h * 0.45, w * 0.04); c.fill();
    c.restore();
    lidOf(c, sh, w, h, ing.lid || '#8a5a2e');
    if (opts.badge) icon(c, opts.badge, w * 0.32, -h * 0.82, w * 0.26, opts.badge === 'flame' ? '#ff9a3c' : '#9fe6ff');
    c.restore();
  }
  function jarFx(c, ing, w, h, t, level) {
    const fx = ing.fx;
    if (fx === 'sparkle') {
      for (let i = 0; i < 7; i++) { const a = (t * 0.8 + i * 0.37) % 1, x = Math.sin(i * 7.3) * w * 0.28, y = level * (0.15 + ((i * 0.29) % 0.8)); c.globalAlpha = Math.sin(a * Math.PI); icon(c, 'star', x, y, w * 0.1, '#fffbe0'); }
      c.globalAlpha = 1;
    } else if (fx === 'smoke') {
      c.fillStyle = 'rgba(150,110,200,.35)'; for (let i = 0; i < 4; i++) { ell(c, Math.sin(t + i * 2) * w * 0.15, level * (0.3 + i * 0.15), w * 0.2, h * 0.05); c.fill(); }
    } else if (fx === 'feather') {
      c.save(); c.translate(0, level * 0.5); c.rotate(0.5 + Math.sin(t * 1.5) * 0.1);
      c.fillStyle = '#ffd34d'; ell(c, 0, 0, w * 0.1, h * 0.2); c.fill(); c.fillStyle = '#ff5a2a'; ell(c, 0, -h * 0.05, w * 0.06, h * 0.12); c.fill();
      c.strokeStyle = '#8a2b12'; c.lineWidth = w * 0.02; c.beginPath(); c.moveTo(0, h * 0.2); c.lineTo(0, -h * 0.18); c.stroke(); c.restore();
    } else if (fx === 'fizz' || fx === 'bubbles') {
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) { const k = (t * (fx === 'fizz' ? 1.4 : 0.5) + i * 0.17) % 1; circ(c, Math.sin(i * 5.1) * w * 0.22, level * k * 0.95, w * 0.03); c.fill(); }
    } else if (fx === 'cloud') {
      c.fillStyle = 'rgba(255,255,255,.95)'; for (const [x, y, r] of [[-0.12, 0.45, 0.13], [0.06, 0.5, 0.15], [0.16, 0.35, 0.1], [-0.05, 0.3, 0.11]]) { circ(c, w * x, level * y, w * r); c.fill(); }
    } else if (fx === 'pepper') {
      for (let i = 0; i < 3; i++) { c.save(); c.translate(w * (i - 1) * 0.16, level * (0.35 + (i % 2) * 0.25)); c.rotate(0.8 - i * 0.6); c.fillStyle = i === 1 ? '#ff9b2f' : '#d6211d'; ell(c, 0, 0, w * 0.06, h * 0.1); c.fill(); c.fillStyle = '#3c8a2e'; c.fillRect(-w * 0.015, -h * 0.12, w * 0.03, h * 0.04); c.restore(); }
    } else if (fx === 'honey') {
      c.fillStyle = 'rgba(255,255,255,.35)'; ell(c, -w * 0.06, level * 0.55, w * 0.06, h * 0.04); c.fill(); ell(c, w * 0.06, level * 0.55, w * 0.06, h * 0.04); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = w * 0.03; c.beginPath(); c.arc(0, level * 0.4, w * 0.06, 0.3, Math.PI - 0.3); c.stroke();
    } else if (fx === 'storm') {
      c.fillStyle = 'rgba(200,210,235,.6)'; for (const [x, y, r] of [[-0.1, 0.75, 0.1], [0.06, 0.78, 0.12], [0.17, 0.7, 0.08]]) { circ(c, w * x, level * y, w * r); c.fill(); }
      if ((t * 1.7) % 2 < 0.25) icon(c, 'bolt', 0, level * 0.42, w * 0.3, '#fff7a0');
    } else if (fx === 'rainbow') {
      const cols = ['#ff6b8b', '#ffb84d', '#fff066', '#7ee08a', '#6ec8ff', '#b28cff']; const step = -level / cols.length;
      cols.forEach((cl, i) => { c.fillStyle = cl; c.fillRect(-w, level + i * step, w * 2, step + 1); });
      c.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 5; i++) { circ(c, Math.sin(i * 3 + t) * w * 0.2, level * (0.2 + i * 0.15), w * 0.025); c.fill(); }
    } else if (fx === 'void') {
      c.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1); c.globalAlpha = tw; circ(c, Math.sin(i * 9.7) * w * 0.28, level * (0.1 + (i * 0.11) % 0.85), w * 0.018); c.fill(); }
      c.globalAlpha = 1;
    } else if (fx === 'frost') {
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = w * 0.02;
      for (let i = 0; i < 3; i++) icon(c, 'snow', Math.sin(i * 4.2) * w * 0.18, level * (0.3 + i * 0.22), w * 0.16, 'rgba(255,255,255,.75)', 2);
    } else if (fx === 'cocoa') {
      c.fillStyle = 'rgba(255,190,120,.4)'; for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i * 0.33) % 1; ell(c, Math.sin(i * 3) * w * 0.15, level * (1 - k * 0.9), w * 0.07, h * 0.02); c.fill(); }
    } else if (fx === 'moon') {
      icon(c, 'moon', 0, level * 0.5, w * 0.3, 'rgba(255,255,255,.75)');
    }
  }

  window.ABArt = { drawCreature, drawJar, icon, iconSvg, ICONS, TYPES: Object.keys(CR), hsl, ell, circ, rr };
})();
