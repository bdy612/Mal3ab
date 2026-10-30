'use strict';
// =====================================================================
// Echoes of the Spire — drawing: glowing crystal resonators, shadow creatures,
// sound waves, shield arcs, chords and the spire (2.5D, sorted by depth)
// =====================================================================
const GLOW = {};
function glowSprite(rgb) {
  if (GLOW[rgb]) return GLOW[rgb];
  const S = 64, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.16, `rgba(${rgb},0.95)`); gr.addColorStop(0.45, `rgba(${rgb},0.28)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return (GLOW[rgb] = c);
}
function glow(c, rgb, x, y, R, a) { if (a <= 0.003) return; c.globalAlpha = Math.min(1, a); c.drawImage(glowSprite(rgb), x - R, y - R, R * 2, R * 2); c.globalAlpha = 1; }
const FONT = "'Segoe UI', Tahoma, Arial, sans-serif";
const TAU = Math.PI * 2;
const tmpP = {};

// ---------------------------------------------------------------- resonators
function drawRes(c, role, n, lvl, x, y, t, o) {
  o = o || {};
  const rgb = NOTES[n].rgb, f = o.fire || 0, muted = o.muted;
  const col = muted ? '#6b6b85' : NOTES[n].col;
  const bob = o.still ? 0 : Math.sin(t * 2 + x * 0.05) * 1.6;
  c.save(); c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  c.fillStyle = 'rgba(5,3,15,0.45)'; c.beginPath(); c.ellipse(x, y + 4, 16, 6.5, 0, 0, TAU); c.fill();
  // crystal plinth
  c.beginPath();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 5.5); }
  c.closePath(); c.fillStyle = '#1c1745'; c.fill(); c.strokeStyle = col; c.globalAlpha *= 0.85; c.lineWidth = 1.4; c.stroke(); c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  for (let i = 0; i < lvl; i++) { const px = x + (i - (lvl - 1) / 2) * 7, py = y + 10; c.fillStyle = col; c.beginPath(); c.moveTo(px, py - 2.6); c.lineTo(px + 2.4, py); c.lineTo(px, py + 2.6); c.lineTo(px - 2.4, py); c.fill(); }
  const hy = y - 19 + bob;
  if (!muted) { c.globalCompositeOperation = 'lighter'; glow(c, rgb, x, hy, 24 + f * 16, (0.32 + f * 0.55) * (o.alpha == null ? 1 : o.alpha)); c.globalCompositeOperation = 'source-over'; }
  c.translate(x, hy); const sc = 1 + f * 0.14; c.scale(sc, sc);
  if (o.direct) drawHeadStatic(c, role, col, muted);
  else c.drawImage(headSprite(role, n, !!muted), -20, -21.5, 40, 40);     // cached: gradients are slow on software canvases
  drawHeadAnim(c, role, col, f, t);
  if (muted) {
    c.strokeStyle = 'rgba(255,90,120,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, -12); c.lineTo(9, 8); c.stroke();
  }
  c.restore();
}

const HEADS = {};
function headSprite(role, n, muted) {
  const k = role + n + (muted ? 'm' : ''); if (HEADS[k]) return HEADS[k];
  const R = 4, c = document.createElement('canvas'); c.width = c.height = 40 * R;
  const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, 20 * R, 21.5 * R);
  drawHeadStatic(g, role, muted ? '#6b6b85' : NOTES[n].col, muted);
  return (HEADS[k] = c);
}
function drawHeadStatic(c, role, col, muted) {
  const gr = c.createLinearGradient(0, -16, 0, 12);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, col); gr.addColorStop(1, muted ? '#2b2b3a' : 'rgba(30,20,70,1)');
  c.fillStyle = gr; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1;
  switch (role) {
    case 'bell':
      c.beginPath(); c.moveTo(-10, 8); c.bezierCurveTo(-10, -3, -8, -15, 0, -15); c.bezierCurveTo(8, -15, 10, -3, 10, 8); c.lineTo(13, 11); c.lineTo(-13, 11); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-4, -6, 2, 5, 0.3, 0, TAU); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(0, 12.5, 2.6, 0, TAU); c.fill();
      break;
    case 'harp':
      c.lineCap = 'round'; c.lineWidth = 4.2; c.strokeStyle = gr;
      c.beginPath(); c.moveTo(-8, -17); c.lineTo(-8, 0); c.quadraticCurveTo(-8, 8, 0, 8); c.quadraticCurveTo(8, 8, 8, 0); c.lineTo(8, -17); c.stroke();
      c.beginPath(); c.moveTo(0, 8); c.lineTo(0, 13); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(-8, -17, 1.8, 0, TAU); c.arc(8, -17, 1.8, 0, TAU); c.fill();
      break;
    case 'hum':
      c.beginPath(); c.arc(0, -2, 12, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(0, -2, 8, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, -2, 4, 0, TAU); c.stroke();
      c.fillStyle = col; c.fillRect(-1.5, 9, 3, 5);
      break;
    case 'ward':
      c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * 13, -2 + Math.sin(a) * 14); } c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * 6.5, -2 + Math.sin(a) * 7); } c.closePath(); c.stroke();
      break;
    case 'echo': {
      const og = c.createRadialGradient(-2, -5, 1, 0, -2, 9); og.addColorStop(0, '#fff'); og.addColorStop(0.5, col); og.addColorStop(1, 'rgba(30,20,70,1)');
      c.fillStyle = og; c.beginPath(); c.arc(0, -2, 8, 0, TAU); c.fill();
      break;
    }
  }
}
function drawHeadAnim(c, role, col, f, t) {
  if (role === 'harp') {
    c.lineWidth = 0.9; c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.beginPath();
    for (const sx of [-3.6, 0, 3.6]) { const v = f * Math.sin(t * 60 + sx) * 1.6; c.moveTo(sx, -15); c.quadraticCurveTo(sx + v, -6, sx, 3); }
    c.stroke();
  } else if (role === 'hum') {
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -2, 10, t * 2, t * 2 + 1.4); c.stroke();
  } else if (role === 'echo') {
    c.strokeStyle = col; c.lineWidth = 1.3;
    for (const [rx, ry, sp] of [[15, 5, 1.6], [12, 7, -1.1]]) {
      c.save(); c.rotate(Math.sin(t * 0.7 + sp) * 0.5); c.beginPath(); c.ellipse(0, -2, rx, ry, 0, 0, TAU); c.stroke();
      const a = t * sp * 1.8; c.fillStyle = '#fff'; c.beginPath(); c.arc(Math.cos(a) * rx, -2 + Math.sin(a) * ry, 1.6, 0, TAU); c.fill(); c.restore();
    }
  }
}

// ---------------------------------------------------------------- shadow creatures
function drawEnemy(c, e, t) {
  const x = e.x, y = e.y, r = e.r, a = e.ang || 0, tp = e.type;
  const fy = e.fly ? y - 18 + Math.sin(t * 6 + e.ph) * 2 : y;
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x, y + (e.fly ? 6 : r * 0.55), r * (e.fly ? 0.9 : 1.05), r * 0.38, 0, 0, TAU); c.fill();
  if (e.slow > 0.05) { c.strokeStyle = `rgba(127,245,255,${0.25 + e.slow * 0.5})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y + r * 0.5, r * 1.3, r * 0.5, 0, 0, TAU); c.stroke(); }
  if (e.hex) { c.strokeStyle = 'rgba(195,139,255,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y + r * 0.5, r * 1.5, r * 0.6, 0, 0, TAU); c.stroke(); }
  if (e.def.silence && !e.dead) {
    const R = e.def.silence * (has('velvet') ? 0.5 : 1);
    c.save(); c.setLineDash([5, 7]); c.lineDashOffset = -t * 20; c.strokeStyle = 'rgba(120,180,255,0.28)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke(); c.restore();
    c.fillStyle = 'rgba(40,60,120,0.06)'; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  }
  const dark = () => '#150b2c';
  const eyes = (col, d, sz, yy) => {
    const ex = Math.cos(a), ey = Math.sin(a), px = -ey, py = ex, cy = yy == null ? fy : yy;
    c.fillStyle = col;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(x + ex * d + px * s * d * 0.55, cy + ey * d * 0.6 + py * s * d * 0.55 - 1, sz, 0, TAU); c.fill(); }
  };
  switch (tp) {
    case 'wisp': {
      const p = G.map && G.map.paths[e.path];
      if (p && !e.fly) for (let k = 4; k >= 1; k--) { pathAt(p, e.d - k * 5, tmpP); c.fillStyle = `rgba(60,30,110,${0.35 - k * 0.06})`; c.beginPath(); c.arc(tmpP.x, tmpP.y, r * (1 - k * 0.16), 0, TAU); c.fill(); }
      c.fillStyle = dark(r); c.beginPath(); c.arc(x, fy, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(170,120,255,0.75)'; c.lineWidth = 1.4; c.stroke();
      c.fillStyle = 'rgba(130,100,220,0.35)'; c.beginPath(); c.ellipse(x - r * 0.3, fy - r * 0.4, r * 0.42, r * 0.26, -0.4, 0, TAU); c.fill();
      eyes('#efe6ff', r * 0.45, 1.6); break;
    }
    case 'skitter': {
      c.strokeStyle = 'rgba(20,10,35,0.95)'; c.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
        const la = a + s * (1.2 + i * 0.5), w = Math.sin(t * 22 + i * 2 + (s > 0 ? 1 : 0)) * 0.25;
        c.beginPath(); c.moveTo(x, fy); c.lineTo(x + Math.cos(la + w) * r * 1.6, fy + Math.sin(la + w) * r * 1.6); c.stroke();
      }
      c.save(); c.translate(x, fy); c.rotate(a);
      c.fillStyle = dark(r); c.beginPath(); c.moveTo(r * 1.4, 0); c.lineTo(-r, r * 0.95); c.lineTo(-r * 0.6, 0); c.lineTo(-r, -r * 0.95); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,90,130,0.75)'; c.lineWidth = 1.2; c.stroke(); c.restore();
      eyes('#ff6f91', r * 0.5, 1.3); break;
    }
    case 'brute': {
      c.fillStyle = dark(r); c.beginPath(); c.arc(x, fy, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,150,80,0.65)'; c.lineWidth = 2;
      c.beginPath(); for (let i = 0; i < 6; i++) { const q = a + (i / 6) * TAU; c.lineTo(x + Math.cos(q) * r * 0.82, fy + Math.sin(q) * r * 0.82); } c.closePath(); c.stroke();
      c.fillStyle = '#1a0f2c';
      for (const s of [-1, 1]) { const q = a + s * 0.75; c.beginPath(); c.moveTo(x + Math.cos(q - 0.25) * r, fy + Math.sin(q - 0.25) * r); c.lineTo(x + Math.cos(q) * r * 1.7, fy + Math.sin(q) * r * 1.7); c.lineTo(x + Math.cos(q + 0.25) * r, fy + Math.sin(q + 0.25) * r); c.fill(); }
      eyes('#ffb347', r * 0.45, 2.2); break;
    }
    case 'splitter': {
      const w = Math.sin(t * 5 + e.ph) * 1.5;
      c.fillStyle = dark(r); c.beginPath(); c.arc(x - r * 0.35 - w * 0.3, fy, r * 0.78, 0, TAU); c.arc(x + r * 0.35 + w * 0.3, fy, r * 0.78, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,120,220,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, fy - r * 0.8); c.lineTo(x - 2.5, fy - r * 0.3); c.lineTo(x + 2.5, fy + r * 0.2); c.lineTo(x, fy + r * 0.8); c.stroke();
      eyes('#ffd1f4', r * 0.45, 1.7); break;
    }
    case 'moth': {
      const fl = Math.abs(Math.sin(t * 13 + e.ph));
      c.save(); c.translate(x, fy); c.rotate(a + Math.PI / 2);
      for (const s of [-1, 1]) {
        c.save(); c.scale(s, 1);
        c.fillStyle = '#2a1854'; c.strokeStyle = 'rgba(160,120,255,0.55)'; c.lineWidth = 1; c.beginPath(); c.ellipse(r * 0.9, -r * 0.2, r * 1.15 * (0.35 + fl * 0.65), r * 0.75, -0.4, 0, TAU); c.fill();
        c.stroke(); c.beginPath(); c.ellipse(r * 0.7, r * 0.55, r * 0.75 * (0.35 + fl * 0.65), r * 0.45, 0.5, 0, TAU); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle = '#0c0718'; c.beginPath(); c.ellipse(0, 0, r * 0.35, r * 0.9, 0, 0, TAU); c.fill();
      c.restore();
      eyes('#b9a0ff', r * 0.3, 1.3); break;
    }
    case 'hush': {
      c.save(); c.translate(x, fy);
      c.fillStyle = dark(r); c.beginPath(); c.moveTo(0, -r * 1.25); c.quadraticCurveTo(r * 1.1, -r * 0.6, r * 0.95, r * 0.9); c.lineTo(-r * 0.95, r * 0.9); c.quadraticCurveTo(-r * 1.1, -r * 0.6, 0, -r * 1.25); c.fill();
      c.strokeStyle = 'rgba(120,200,255,0.7)'; c.lineWidth = 1.3; c.stroke();
      c.fillStyle = '#05030c'; c.beginPath(); c.ellipse(0, -r * 0.25, r * 0.55, r * 0.5, 0, 0, TAU); c.fill();
      c.fillStyle = '#7ff5ff'; c.beginPath(); c.arc(-r * 0.22, -r * 0.3, 1.5, 0, TAU); c.arc(r * 0.22, -r * 0.3, 1.5, 0, TAU); c.fill();
      c.restore(); break;
    }
    case 'mourner': {
      c.save(); c.translate(x, fy);
      c.globalCompositeOperation = 'lighter'; glow(c, '90,255,160', r * 0.9, -r * 0.2, 14, 0.4 + Math.sin(t * 4 + e.ph) * 0.15); c.globalCompositeOperation = 'source-over';
      c.fillStyle = dark(r); c.beginPath(); c.moveTo(0, -r * 1.2); c.quadraticCurveTo(r, -r * 0.7, r * 0.9, r * 0.9); c.lineTo(-r * 0.9, r * 0.9); c.quadraticCurveTo(-r, -r * 0.7, 0, -r * 1.2); c.fill();
      c.strokeStyle = 'rgba(90,255,160,0.6)'; c.lineWidth = 1.3; c.stroke();
      c.fillStyle = '#b6ffd6'; c.beginPath(); c.arc(r * 0.9, -r * 0.2, 2.4, 0, TAU); c.fill();
      c.fillStyle = '#5affa0'; c.beginPath(); c.arc(-r * 0.2, -r * 0.35, 1.3, 0, TAU); c.arc(r * 0.2, -r * 0.35, 1.3, 0, TAU); c.fill();
      c.restore(); break;
    }
    case 'maw': {
      c.globalCompositeOperation = 'lighter'; glow(c, '140,80,255', x, fy, r * 2.4, 0.35); c.globalCompositeOperation = 'source-over';
      c.fillStyle = dark(r); c.beginPath(); c.arc(x, fy, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(180,130,255,0.8)'; c.lineWidth = 2.5; c.stroke();
      const open = 0.45 + Math.sin(t * 3) * 0.2;
      c.fillStyle = '#000'; c.beginPath(); c.arc(x, fy, r * open, 0, TAU); c.fill();
      c.fillStyle = '#d9ccff';
      for (let i = 0; i < 14; i++) { const q = (i / 14) * TAU + t * 0.6, R1 = r * (open + 0.12), R0 = r * open * 0.55; c.beginPath(); c.moveTo(x + Math.cos(q - 0.12) * R1, fy + Math.sin(q - 0.12) * R1); c.lineTo(x + Math.cos(q) * R0, fy + Math.sin(q) * R0); c.lineTo(x + Math.cos(q + 0.12) * R1, fy + Math.sin(q + 0.12) * R1); c.fill(); }
      for (let i = 0; i < 6; i++) { const q = (i / 6) * TAU - t * 0.4; c.fillStyle = '#ff6f91'; c.beginPath(); c.arc(x + Math.cos(q) * r * 0.86, fy + Math.sin(q) * r * 0.86, 2, 0, TAU); c.fill(); }
      break;
    }
    case 'discord': {
      c.globalCompositeOperation = 'lighter'; glow(c, '255,70,120', x, fy, r * 2.3, 0.32); c.globalCompositeOperation = 'source-over';
      c.save(); c.translate(x, fy); c.rotate(t * 0.8);
      c.fillStyle = dark(r); c.beginPath();
      for (let i = 0; i < 18; i++) { const q = (i / 18) * TAU, R = i % 2 ? r * 0.6 : r * (1.15 + 0.1 * Math.sin(t * 6 + i)); c.lineTo(Math.cos(q) * R, Math.sin(q) * R); }
      c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,90,140,0.85)'; c.lineWidth = 2; c.stroke(); c.restore();
      c.fillStyle = '#ffe1ea'; c.beginPath(); c.ellipse(x, fy, r * 0.32, r * 0.22, 0, 0, TAU); c.fill();
      c.fillStyle = '#ff2d62'; c.beginPath(); c.arc(x + Math.cos(a) * 3, fy + Math.sin(a) * 2, r * 0.14, 0, TAU); c.fill();
      break;
    }
    case 'leviathan': {
      const p = G.map && G.map.paths[e.path], shell = e.stun <= 0;
      if (p) for (let k = 10; k >= 1; k--) {
        pathAt(p, e.d - k * 13, tmpP); const rr = r * (1 - k * 0.055);
        const wob = Math.sin(t * 4 - k * 0.7) * 3, px = -Math.sin(tmpP.ang) * wob, py = Math.cos(tmpP.ang) * wob;
        c.fillStyle = dark(rr); c.beginPath(); c.arc(tmpP.x + px, tmpP.y + py, rr, 0, TAU); c.fill();
        c.strokeStyle = shell ? 'rgba(160,110,255,0.65)' : 'rgba(255,255,255,0.35)'; c.lineWidth = 1.6; c.stroke();
        c.fillStyle = 'rgba(160,110,255,0.6)'; c.beginPath(); c.arc(tmpP.x + px, tmpP.y + py - rr * 0.5, 2, 0, TAU); c.fill();
      }
      c.globalCompositeOperation = 'lighter'; glow(c, shell ? '140,80,255' : '255,255,255', x, fy, r * 2.4, 0.3); c.globalCompositeOperation = 'source-over';
      c.save(); c.translate(x, fy); c.rotate(a);
      c.fillStyle = dark(r); c.beginPath(); c.ellipse(0, 0, r * 1.25, r, 0, 0, TAU); c.fill();
      c.strokeStyle = shell ? 'rgba(180,130,255,0.9)' : 'rgba(255,255,255,0.8)'; c.lineWidth = 2.2; c.stroke();
      c.fillStyle = '#140a28'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-r * 0.2, s * r * 0.8); c.lineTo(-r * 1.1, s * r * 1.6); c.lineTo(-r * 0.7, s * r * 0.6); c.fill(); }
      c.restore();
      eyes('#7ff5ff', r * 0.6, 2.6);
      if (shell) { c.strokeStyle = `rgba(140,90,255,${0.35 + Math.sin(t * 5) * 0.15})`; c.lineWidth = 3; c.beginPath(); c.arc(x, fy, r * 1.45, 0, TAU); c.stroke(); }
      break;
    }
  }
  if (e.hitT > 0) { c.globalCompositeOperation = 'lighter'; glow(c, '255,255,255', x, fy, r * 1.6, e.hitT * 4); c.globalCompositeOperation = 'source-over'; }
  if (e.stun > 0) {
    for (let k = 0; k < 3; k++) { const q = t * 5 + (k * TAU) / 3; c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(x + Math.cos(q) * r * 0.9, fy - r - 5 + Math.sin(q) * 2.5, 1.8, 0, TAU); c.fill(); }
  }
  if (e.hp < e.max && !e.def.boss) {
    const w = r * 2 + 6, hy = fy - r - 9, k = clamp(e.hp / e.max, 0, 1);
    c.fillStyle = 'rgba(5,3,15,0.75)'; c.fillRect(x - w / 2 - 1, hy - 1, w + 2, 4.5);
    c.fillStyle = k > 0.5 ? '#9cff8a' : k > 0.25 ? '#ffd166' : '#ff6f91'; c.fillRect(x - w / 2, hy, w * k, 2.5);
  }
}

// ---------------------------------------------------------------- the spire
function drawSpire(c, t) {
  const p = G.beatT, hk = G.hp / G.maxHp;
  c.globalCompositeOperation = 'lighter';
  glow(c, '190,205,255', 0, -62, 95 + p * 22, 0.32 + p * 0.22);
  if (G.heal > 0) glow(c, CHORDS.radiant.rgb, 0, -60, 120, G.heal * 0.6);
  c.globalCompositeOperation = 'source-over';
  const ring = (front) => {
    c.save(); c.translate(0, -60); c.strokeStyle = 'rgba(210,220,255,0.75)'; c.lineWidth = 1.6; c.setLineDash([7, 5]); c.lineDashOffset = -t * 18;
    c.beginPath(); c.ellipse(0, 0, 38 + p * 3, 10, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); c.stroke(); c.setLineDash([]);
    for (let k = 0; k < 3; k++) { const q = t * 1.3 + (k * TAU) / 3, s = Math.sin(q); if ((s > 0) !== front) continue; c.globalCompositeOperation = 'lighter'; glow(c, NOTES[k * 2 % 5].rgb, Math.cos(q) * 38, s * 10, 9, 0.9); c.globalCompositeOperation = 'source-over'; }
    c.restore();
  };
  ring(false);
  if (G.spireBroken) {
    c.fillStyle = '#4b3c9e'; c.beginPath(); c.moveTo(-15, 0); c.lineTo(-12, -26); c.lineTo(-4, -18); c.lineTo(3, -34); c.lineTo(9, -20); c.lineTo(15, 0); c.lineTo(0, 12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke(); return;
  }
  const g = c.createLinearGradient(0, -130, 0, 12);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#d3e8ff'); g.addColorStop(0.7, '#9d8cff'); g.addColorStop(1, '#4b3c9e');
  // side shards
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-26, -50); c.lineTo(-31, -12); c.lineTo(-21, 6); c.lineTo(-14, -10); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(24, -36); c.lineTo(29, -6); c.lineTo(20, 7); c.lineTo(14, -8); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0, -132 - p * 3); c.lineTo(17, -80); c.lineTo(15, 0); c.lineTo(0, 12); c.lineTo(-15, 0); c.lineTo(-17, -80); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = 'rgba(40,20,90,0.25)'; c.beginPath(); c.moveTo(0, -132); c.lineTo(0, 12); c.lineTo(-15, 0); c.lineTo(-17, -80); c.closePath(); c.fill();
  c.strokeStyle = `rgba(255,255,255,${0.45 + p * 0.5})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -124); c.lineTo(0, 4); c.stroke();
  if (hk < 0.65) {
    c.strokeStyle = hk < 0.3 ? 'rgba(255,90,130,0.9)' : 'rgba(255,255,255,0.75)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-12, -70); c.lineTo(-4, -60); c.lineTo(-9, -48); c.lineTo(-2, -38); c.stroke();
    if (hk < 0.4) { c.beginPath(); c.moveTo(11, -96); c.lineTo(4, -84); c.lineTo(9, -74); c.lineTo(3, -62); c.stroke(); c.beginPath(); c.moveTo(-6, -20); c.lineTo(2, -12); c.lineTo(-3, -3); c.stroke(); }
  }
  ring(true);
}

function drawRift(c, p, t, hot) {
  const s = p.start;
  c.save(); c.translate(s.x, s.y);
  c.globalCompositeOperation = 'lighter'; glow(c, '140,80,255', 0, 0, 46 + hot * 16, 0.45 + hot * 0.3); c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#05030c'; c.beginPath(); c.ellipse(0, 0, 15, 12, 0, 0, TAU); c.fill();
  for (let k = 0; k < 3; k++) {
    c.strokeStyle = `rgba(${k === 1 ? '255,110,200' : '170,120,255'},0.75)`; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 17 + k * 5, t * (1.6 + k * 0.4) + k * 2.1, t * (1.6 + k * 0.4) + k * 2.1 + 1.7); c.stroke();
  }
  c.restore();
}

// small enemy icon for badges / DOM images
function drawEnemyIcon(c, type, x, y, scale) {
  const def = ENEMIES[type];
  const e = { x: 0, y: 0, r: def.r, ang: type === 'moth' ? -Math.PI / 2 : 0, type, def, hp: 1, max: 1, slow: 0, stun: 0, hitT: 0, fly: false, ph: 0, path: -1, d: 0, hex: false, dead: true };
  c.save(); c.translate(x, y); c.scale(scale, scale);
  const keep = G.map; if (type === 'wisp' || type === 'leviathan') G.map = null;
  drawEnemy(c, e, 0.6);
  G.map = keep; c.restore();
}

// ---------------------------------------------------------------- main frame
function render(cx) {
  const V = G.view; if (!V || !G.map) return;
  const dpr = V.dpr, s = V.s, t = G.t;
  if (G.staticDirty || !G.staticCv) { G.staticCv = renderStatic(G.map, V, V.cw, V.ch, dpr); G.staticDirty = false; G.vigCv = null; }
  const sh = G.shake, shx = sh ? (Math.random() - 0.5) * sh * 1.6 : 0, shy = sh ? (Math.random() - 0.5) * sh * 1.6 : 0;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.fillStyle = '#06060f'; cx.fillRect(0, 0, V.cw, V.ch);
  cx.drawImage(G.staticCv, shx, shy, V.cw, V.ch);
  cx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (V.ox + shx), dpr * (V.oy + shy));
  const M = G.map, live = G.phase === 'wave';
  // drifting fog
  cx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) {
    const fx = Math.sin(t * 0.03 + k * 1.7) * M.W * 0.45, fy = Math.cos(t * 0.025 + k * 2.3) * M.H * 0.45;
    glow(cx, k % 2 ? '120,80,255' : '60,160,255', fx, fy, 260, 0.05);
  }
  // light motes drifting along the roads toward the spire
  for (const p of M.paths) for (let k = 0; k < 5; k++) { pathAt(p, (t * 26 + (k * p.len) / 5) % p.len, tmpP); glow(cx, '210,200,255', tmpP.x, tmpP.y, 7, 0.4); }
  cx.globalCompositeOperation = 'source-over';
  const pendingPaths = new Set(); if (live) for (let i = G.spawnIdx; i < G.spawnQ.length; i++) pendingPaths.add(G.spawnQ[i].path);
  M.paths.forEach((p, i) => drawRift(cx, p, t, pendingPaths.has(i) ? 1 : 0));
  // chord fields
  for (const ch of G.chords) {
    const C = CHORDS[ch.type], [a, b, d] = ch.mem;
    cx.fillStyle = `rgba(${C.rgb},0.07)`; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.lineTo(d.x, d.y); cx.closePath(); cx.fill();
    if (ch.type !== 'radiant') {
      cx.save(); cx.setLineDash([6, 9]); cx.lineDashOffset = t * 12; cx.strokeStyle = `rgba(${C.rgb},0.3)`; cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(ch.cx, ch.cy, ch.r, 0, TAU); cx.stroke(); cx.restore();
      cx.fillStyle = `rgba(${C.rgb},0.035)`; cx.beginPath(); cx.arc(ch.cx, ch.cy, ch.r, 0, TAU); cx.fill();
    }
    cx.globalCompositeOperation = 'lighter'; glow(cx, C.rgb, ch.cx, ch.cy, 22 + G.beatT * 8, 0.45); cx.globalCompositeOperation = 'source-over';
    drawChordGlyph(cx, ch.type, ch.cx, ch.cy, 7);
  }
  for (const r of G.grand) {
    cx.save(); cx.translate(r.x, r.y); cx.rotate(t * 0.6);
    for (let k = 0; k < 5; k++) { cx.strokeStyle = NOTES[k].col; cx.globalAlpha = 0.55; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 30, (k / 5) * TAU, (k / 5) * TAU + 1.0); cx.stroke(); }
    cx.restore(); cx.globalAlpha = 1;
  }
  // sockets
  const armed = window.UI && UI.armed && (G.phase === 'build' || G.phase === 'wave');
  const canPay = armed && G.shards >= costOf(UI.armed);
  for (const so of M.sockets) {
    if (so.res) continue;
    const hov = G.ghost && G.ghost.sock === so.i;
    let a = armed ? 0.3 + 0.14 * Math.sin(t * 3 + so.i * 0.7) : 0.14;
    if (hov) a = 0.95;
    const col = armed && !canPay ? '255,120,140' : '205,195,255';
    cx.strokeStyle = `rgba(${col},${a})`; cx.lineWidth = 1.3;
    cx.beginPath(); cx.moveTo(so.x, so.y - 5); cx.lineTo(so.x + 9, so.y); cx.lineTo(so.x, so.y + 5); cx.lineTo(so.x - 9, so.y); cx.closePath(); cx.stroke();
    if (armed) { cx.fillStyle = `rgba(${col},${a * 0.25})`; cx.fill(); }
  }
  // links
  const sel = window.UI && UI.sel;
  // plain / fifth / echo links are batched into one stroke each; unison choirs get glowing beams
  const plain = new Path2D(), fifth = new Path2D(), echoP = new Path2D(), hiP = new Path2D();
  for (const l of G.links) {
    const a = l.a, b = l.b;
    if (sel && (a === sel || b === sel)) { hiP.moveTo(a.x, a.y - 3); hiP.lineTo(b.x, b.y - 3); }
    if (l.uni) {
      if (a.group && a.group.size === 2) continue;
      const rgb = NOTES[a.note].rgb;
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = `rgba(${rgb},0.16)`; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(a.x, a.y - 3); cx.lineTo(b.x, b.y - 3); cx.stroke();
      cx.strokeStyle = `rgba(${rgb},0.6)`; cx.lineWidth = 2.6; cx.stroke();
      const q = (t * 0.7 + l.i * 0.13) % 1; glow(cx, rgb, lerp(a.x, b.x, q), lerp(a.y, b.y, q) - 3, 8, 0.8);
      cx.globalCompositeOperation = 'source-over';
    } else { const P = l.fifth ? fifth : l.echo ? echoP : plain; P.moveTo(a.x, a.y - 3); P.lineTo(b.x, b.y - 3); }
  }
  cx.strokeStyle = 'rgba(230,225,255,0.09)'; cx.lineWidth = 1; cx.stroke(plain);
  cx.strokeStyle = 'rgba(255,244,214,0.42)'; cx.lineWidth = 2; cx.stroke(fifth);
  cx.save(); cx.setLineDash([4, 6]); cx.lineDashOffset = -t * 20; cx.strokeStyle = 'rgba(255,214,120,0.45)'; cx.lineWidth = 1.5; cx.stroke(echoP); cx.restore();
  if (sel) { cx.strokeStyle = 'rgba(255,255,255,0.5)'; cx.lineWidth = 1.6; cx.stroke(hiP); }
  // shield arcs (ground)
  for (const B of G.barriers) drawBarrier(cx, B, t, false);
  // depth-sorted: resonators, ground creatures, spire
  const objs = [];
  for (const r of G.res) objs.push({ y: r.y, r });
  for (const e of G.enemies) if (!e.fly) objs.push({ y: e.y, e });
  objs.push({ y: 6, spire: true });
  objs.sort((p, q) => p.y - q.y);
  for (const o of objs) {
    if (o.r) { const r = o.r; drawRes(cx, r.role, r.note, r.lvl, r.x, r.y, t, { fire: r.fireT, muted: r.silenced || r.retune > 0 }); if (r.retune > 0) drawRetune(cx, r, t); }
    else if (o.e) drawEnemy(cx, o.e, t);
    else drawSpire(cx, t);
  }
  for (const B of G.barriers) drawBarrier(cx, B, t, true);
  for (const e of G.enemies) if (e.fly) drawEnemy(cx, e, t);
  // waves
  for (const g of G.rings) drawRing(cx, g, t);
  cx.globalCompositeOperation = 'lighter';
  for (const b of G.beams) {
    const a = 1 - b.t / 0.22, n = 10;
    cx.beginPath();
    for (let i = 0; i <= n; i++) {
      const q = i / n, dx = b.x2 - b.x1, dy = b.y2 - b.y1, L = Math.hypot(dx, dy) || 1, w = Math.sin(q * Math.PI) * Math.sin(q * 18 + b.seed + t * 50) * 3.2 * a;
      cx.lineTo(b.x1 + dx * q - (dy / L) * w, b.y1 + dy * q + (dx / L) * w);
    }
    cx.strokeStyle = `rgba(${b.rgb},${a * 0.3})`; cx.lineWidth = (b.w || 1) * 6; cx.stroke();
    cx.strokeStyle = `rgba(255,255,255,${a * 0.9})`; cx.lineWidth = (b.w || 1) * 1.6; cx.stroke();
    glow(cx, b.rgb, b.x2, b.y2, 14, a);
  }
  // particles
  for (const p of G.parts) {
    const a = clamp(1 - (p.life - (p.d || 0)) / p.max, 0, 1);
    if (p.k === 'smoke') continue;
    if (p.k === 'note') continue;
    if (p.k === 'shard') { cx.fillStyle = `rgba(${p.rgb},${a})`; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.life * 8); cx.fillRect(-p.s / 2, -p.s, p.s, p.s * 2); cx.restore(); }
    else glow(cx, p.rgb, p.x, p.y, p.s * 3, a);
  }
  cx.globalCompositeOperation = 'source-over';
  for (const p of G.parts) {
    const a = clamp(1 - p.life / p.max, 0, 1);
    if (p.k === 'smoke') { cx.fillStyle = `rgba(16,8,32,${a * 0.55})`; cx.beginPath(); cx.arc(p.x, p.y, p.s * (1 + p.life * 1.5), 0, TAU); cx.fill(); }
    else if (p.k === 'note') { cx.fillStyle = `rgba(${p.rgb},${a * 0.85})`; cx.font = `700 ${p.s * 1.5}px ${FONT}`; cx.textAlign = 'center'; cx.fillText(p.life % 2.6 < 1.3 ? '♪' : '♫', p.x, p.y); }
  }
  // floating numbers (constant screen size)
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  for (const x of G.texts) {
    const a = clamp(1 - x.t / 1.1, 0, 1), fs = x.size / s;
    cx.font = `800 ${fs}px ${FONT}`; cx.lineWidth = 3 / s; cx.strokeStyle = `rgba(5,3,15,${a * 0.8})`; cx.strokeText(x.txt, x.x, x.y);
    cx.globalAlpha = a; cx.fillStyle = x.col; cx.fillText(x.txt, x.x, x.y); cx.globalAlpha = 1;
  }
  if (G.phase === 'build') drawPreviewBadges(cx, t);
  if (sel) drawSelection(cx, sel, t);
  if (G.ghost) drawGhost(cx, G.ghost, t);
  // screen-space overlays
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!G.vigCv) {
    G.vigCv = document.createElement('canvas'); G.vigCv.width = Math.max(1, Math.round(V.cw / 2)); G.vigCv.height = Math.max(1, Math.round(V.ch / 2));
    const vg = G.vigCv.getContext('2d'), w = G.vigCv.width, h = G.vigCv.height, gr = vg.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(2,1,8,0.55)'); vg.fillStyle = gr; vg.fillRect(0, 0, w, h);
  }
  cx.drawImage(G.vigCv, 0, 0, V.cw, V.ch);
  if (G.aurora > 0) {
    cx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const gr = cx.createLinearGradient(0, 0, V.cw, 0);
      for (let i = 0; i < 5; i++) gr.addColorStop(i / 4, `rgba(${NOTES[(i + k) % 5].rgb},${G.aurora * 0.22})`);
      cx.fillStyle = gr; cx.beginPath();
      const y0 = V.ch * (0.15 + k * 0.12);
      cx.moveTo(0, y0);
      for (let x = 0; x <= V.cw; x += 24) cx.lineTo(x, y0 + Math.sin(x * 0.01 + t * 2 + k) * 26);
      for (let x = V.cw; x >= 0; x -= 24) cx.lineTo(x, y0 + 40 + Math.sin(x * 0.013 + t * 1.6 + k) * 22);
      cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
  }
  if (G.flash > 0) { cx.fillStyle = `rgba(${G.flashCol || '255,255,255'},${G.flash * 0.22})`; cx.fillRect(0, 0, V.cw, V.ch); }
}

function drawChordGlyph(c, type, x, y, r) {
  c.save(); c.translate(x, y); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.fillStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.4;
  if (type === 'radiant') { c.beginPath(); c.arc(0, 0, r * 0.45, 0, TAU); c.fill(); for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.stroke(); } }
  else if (type === 'lament') { c.beginPath(); c.arc(0, 0, r * 0.8, 0.6, TAU - 0.6); c.arc(r * 0.35, 0, r * 0.55, TAU - 1.1, 1.1, true); c.closePath(); c.fill(); }
  else { c.beginPath(); for (let x = -r; x <= r; x += 2) c.lineTo(x, Math.sin(x * 0.7) * r * 0.4); c.stroke(); c.beginPath(); for (let x = -r; x <= r; x += 2) c.lineTo(x, Math.sin(x * 0.7) * r * 0.4 + r * 0.6); c.stroke(); }
  c.restore();
}
function drawRetune(c, r, t) {
  c.save(); c.strokeStyle = NOTES[r.note].col; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y - 19, 17, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - r.retune / 16)); c.stroke(); c.restore();
}
function drawBarrier(c, B, t, curtain) {
  const on = barrierOn(B), rgb = NOTES[B.note].rgb, P = B.pts;
  if (!on) {
    if (curtain) return;
    c.save(); c.setLineDash([3, 7]); c.strokeStyle = `rgba(${rgb},0.25)`; c.lineWidth = 1.5; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke(); c.restore();
    return;
  }
  const k = B.hp / B.max, fl = B.flash;
  c.globalCompositeOperation = 'lighter';
  if (!curtain) {
    c.strokeStyle = `rgba(${rgb},${0.22 + fl * 0.3})`; c.lineWidth = 11; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.strokeStyle = `rgba(${rgb},${0.6 + 0.35 * k})`; c.lineWidth = 4; c.stroke();
    c.strokeStyle = `rgba(255,255,255,${0.35 + 0.4 * fl})`; c.lineWidth = 1.2; c.stroke();
    c.globalCompositeOperation = 'source-over';
    return;
  }
  const H = 40 * (0.55 + 0.45 * k);
  let y0 = 1e9, y1 = -1e9; for (const p of P) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const sh = 0.5 + 0.5 * Math.sin(t * 4), gr = c.createLinearGradient(0, y0 - H, 0, y1);
  gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(0.55, `rgba(${rgb},${(0.08 + 0.08 * sh) * (0.5 + k * 0.5)})`); gr.addColorStop(1, `rgba(${rgb},${(0.3 + 0.18 * sh) * (0.5 + k * 0.5) + fl * 0.35})`);
  c.fillStyle = gr; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  for (let i = P.length - 1; i >= 0; i--) c.lineTo(P[i].x, P[i].y - H);
  c.closePath(); c.fill();
  c.strokeStyle = `rgba(${rgb},${0.25 + 0.2 * k})`; c.lineWidth = 1.5; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p.x, p.y - H) : c.moveTo(p.x, p.y - H))); c.stroke();
  for (let k2 = 0; k2 < 3; k2++) { const q = (t * 0.45 + k2 / 3) % 1, i = Math.floor(q * (P.length - 1)), f = q * (P.length - 1) - i, a = P[i], b = P[i + 1]; glow(c, rgb, lerp(a.x, b.x, f), lerp(a.y, b.y, f) - H * 0.5, 10, 0.7); }
  c.globalCompositeOperation = 'source-over';
  if (k < 0.999) {
    const mx = P[5].x, my = P[5].y - H - 8, w = 34;
    c.fillStyle = 'rgba(5,3,15,0.7)'; c.fillRect(mx - w / 2 - 1, my - 1, w + 2, 4.5);
    c.fillStyle = `rgba(${rgb},0.95)`; c.fillRect(mx - w / 2, my, w * k, 2.5);
  }
}
function drawRing(c, g, t) {
  const k = clamp(g.t / g.dur, 0, 1), fade = g.t > g.dur ? 1 - (g.t - g.dur) / 0.35 : 1, a = g.alpha * fade * (1 - k * 0.45);
  if (a <= 0.01 || g.r < 1) return;
  c.globalCompositeOperation = 'lighter';
  const rgb = g.rgb;
  if (g.kind === 'ward') {
    c.strokeStyle = `rgba(${rgb},${a * 0.9})`; c.lineWidth = 3;
    c.beginPath(); for (let i = 0; i <= 6; i++) { const q = (i / 6) * TAU + Math.PI / 6; c.lineTo(g.x + Math.cos(q) * g.r, g.y + Math.sin(q) * g.r * 0.9); } c.stroke();
  } else if (g.kind === 'hum') {
    c.strokeStyle = `rgba(${rgb},${a * 0.7})`; c.lineWidth = 2;
    c.beginPath(); for (let i = 0; i <= 48; i++) { const q = (i / 48) * TAU, rr = g.r + Math.sin(q * 7 + t * 8) * 3; c.lineTo(g.x + Math.cos(q) * rr, g.y + Math.sin(q) * rr); } c.stroke();
  } else if (g.kind === 'discord') {
    c.strokeStyle = `rgba(255,80,120,${a})`; c.lineWidth = 2.5;
    c.beginPath(); for (let i = 0; i <= 30; i++) { const q = (i / 30) * TAU, rr = g.r * (i % 2 ? 0.88 : 1); c.lineTo(g.x + Math.cos(q) * rr, g.y + Math.sin(q) * rr); } c.stroke();
  } else if (g.kind === 'blast') {
    c.fillStyle = `rgba(${rgb},${a * 0.1})`; c.beginPath(); c.arc(g.x, g.y, g.r, 0, TAU); c.fill();
    c.strokeStyle = `rgba(${rgb},${a * 0.35})`; c.lineWidth = 12; c.stroke();
    c.strokeStyle = `rgba(255,255,255,${a * 0.85})`; c.lineWidth = 2.5; c.stroke();
  } else {
    const lw = g.kind === 'spire' ? 1.3 : 2.4;
    c.strokeStyle = `rgba(${rgb},${a * (g.kind === 'spire' ? 0.45 : 0.25)})`; c.lineWidth = lw * 3; c.beginPath(); c.arc(g.x, g.y, g.r, 0, TAU); c.stroke();
    c.strokeStyle = `rgba(${rgb},${a * 0.85})`; c.lineWidth = lw; c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
}
function drawSelection(c, r, t) {
  const R = rangeOf(r), col = NOTES[r.note].rgb;
  if (R > 0) {
    c.fillStyle = `rgba(${col},0.06)`; c.beginPath(); c.arc(r.x, r.y, R, 0, TAU); c.fill();
    c.strokeStyle = `rgba(${col},0.5)`; c.lineWidth = 1.5; c.stroke();
  }
  c.save(); c.setLineDash([2, 6]); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1; c.beginPath(); c.arc(r.x, r.y, linkR(r), 0, TAU); c.stroke();
  c.setLineDash([6, 5]); c.lineDashOffset = -t * 16; c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(r.x, r.y + 2, 19, 8, 0, 0, TAU); c.stroke(); c.restore();
}
function drawGhost(c, gh, t) {
  const so = G.map.sockets[gh.sock]; if (!so) return;
  const R = ROLES[gh.role].range, col = NOTES[gh.note].rgb;
  c.save(); c.setLineDash([5, 6]); c.lineDashOffset = -t * 10;
  if (R > 0) { c.strokeStyle = `rgba(${col},0.55)`; c.lineWidth = 1.5; c.beginPath(); c.arc(so.x, so.y, R, 0, TAU); c.stroke(); c.fillStyle = `rgba(${col},0.05)`; c.fill(); }
  for (const nb of gh.nb || []) {
    const uni = nb.note === gh.note, fifth = !uni && isFifth(nb.note, gh.note);
    c.strokeStyle = uni ? `rgba(${col},0.9)` : fifth ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'; c.lineWidth = uni ? 2.4 : 1.4;
    c.beginPath(); c.moveTo(so.x, so.y - 3); c.lineTo(nb.x, nb.y - 3); c.stroke();
  }
  c.restore();
  drawRes(c, gh.role, gh.note, 1, so.x, so.y, t, { alpha: gh.ok ? 0.75 : 0.35, still: true });
  if (gh.kinds && gh.kinds.length) {
    const s = G.view.s, fs = 12.5 / s;
    c.font = `800 ${fs}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    gh.kinds.forEach((k, i) => {
      const y = so.y - 52 - i * fs * 1.35, txt = t_harm(k);
      c.lineWidth = 3.2 / s; c.strokeStyle = 'rgba(5,3,15,0.85)'; c.strokeText(txt, so.x, y);
      c.fillStyle = k === 'shield' || k === 'blast' ? NOTES[gh.note].col : k === 'fifth' ? '#ffffff' : k === 'grand' ? '#ffe08a' : CHORDS[k].col; c.fillText(txt, so.x, y);
    });
  }
}
function t_harm(k) { return ({ shield: '🛡 ', blast: '💥 ', fifth: '⟷ ', radiant: '☀ ', lament: '☾ ', sus: '∿ ', grand: '🌈 ' })[k] + t('es_h_' + k); }

function drawPreviewBadges(c, t) {
  const per = G.preview; if (!per) return;
  const s = G.view.s, sz = 1 / s;
  G.map.paths.forEach((p, i) => {
    const types = Object.keys(per[i] || {}); if (!types.length) return;
    pathAt(p, 46, tmpP);
    const bx = tmpP.x, by = tmpP.y - 34 * sz;
    const w = types.length * 44 * sz + 8 * sz, h = 26 * sz;
    c.fillStyle = 'rgba(10,8,26,0.82)'; c.strokeStyle = 'rgba(170,120,255,0.6)'; c.lineWidth = 1.2 * sz;
    roundRect(c, bx - w / 2, by - h / 2, w, h, 8 * sz); c.fill(); c.stroke();
    c.font = `800 ${11 * sz}px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    types.forEach((tp, k) => {
      const x0 = bx - w / 2 + 6 * sz + k * 44 * sz;
      drawEnemyIcon(c, tp, x0 + 11 * sz, by, (ENEMIES[tp].boss ? 0.32 : 0.75) * sz);
      c.fillStyle = '#eef0ff'; c.fillText('×' + per[i][tp], x0 + 22 * sz, by + 1 * sz);
    });
  });
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// data-URL icons for the DOM (palette, inspector, codex)
const ICONS = {};
function resIcon(role, note) {
  const k = role + note; if (ICONS[k]) return ICONS[k];
  const c = document.createElement('canvas'); c.width = c.height = 72; const g = c.getContext('2d');
  g.translate(36, 52); g.scale(1.75, 1.75); drawRes(g, role, note, 0, 0, 0, 1.2, { still: true, direct: true });
  return (ICONS[k] = c.toDataURL());
}
function enemyIcon(type) {
  const k = 'e_' + type; if (ICONS[k]) return ICONS[k];
  const c = document.createElement('canvas'); c.width = c.height = 72; const g = c.getContext('2d');
  const def = ENEMIES[type];
  const bg = g.createRadialGradient(36, 36, 4, 36, 36, 36); bg.addColorStop(0, 'rgba(215,200,255,0.85)'); bg.addColorStop(0.6, 'rgba(160,130,255,0.3)'); bg.addColorStop(1, 'rgba(150,120,255,0)');
  g.fillStyle = bg; g.fillRect(0, 0, 72, 72);
  drawEnemyIcon(g, type, 36, 38, def.boss ? 0.85 : 2);
  return (ICONS[k] = c.toDataURL());
}
