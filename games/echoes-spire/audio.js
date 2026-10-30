'use strict';
// =====================================================================
// Echoes of the Spire — the live WebAudio score.
// Every resonator pulse is a note of the C pentatonic scale, scheduled on the
// 16th-note grid, plus a soft pad / bass / percussion bed that follows the act.
// =====================================================================
const ESAudio = (function () {
  const A = { ready: false, muted: false };
  let ctx = null, out, comp, music, sfx, rev, del, noise, active = 0;
  let lastDeath = 0;

  function makeIR(sec) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec), buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * Math.min(1, i / (rate * 0.012)); }
    }
    return buf;
  }
  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.22;
    out = ctx.createGain(); out.gain.value = A.muted ? 0 : 0.9;
    comp.connect(out); out.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 0.9;
    sfx = ctx.createGain(); sfx.gain.value = 0.8;
    const dry = ctx.createGain(); dry.gain.value = 0.85;
    rev = ctx.createConvolver(); rev.buffer = makeIR(2.8);
    const revIn = ctx.createGain(); revIn.gain.value = 0.38;
    const revOut = ctx.createGain(); revOut.gain.value = 0.7;
    del = ctx.createDelay(2); del.delayTime.value = 0.49;
    const delIn = ctx.createGain(); delIn.gain.value = 0.2;
    const fb = ctx.createGain(); fb.gain.value = 0.33;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    music.connect(dry); dry.connect(comp);
    music.connect(revIn); revIn.connect(rev); rev.connect(revOut); revOut.connect(comp);
    music.connect(delIn); delIn.connect(del); del.connect(lp); lp.connect(fb); fb.connect(del); lp.connect(comp);
    sfx.connect(comp); const sRev = ctx.createGain(); sRev.gain.value = 0.25; sfx.connect(sRev); sRev.connect(rev);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    A.ready = true;
  };
  A.now = () => (ctx ? ctx.currentTime : 0);
  A.on = () => !!(ctx && ctx.state === 'running' && !A.muted);
  A.setMuted = (m) => { A.muted = m; if (out) out.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05); };
  A.setTempo = (bpm) => { if (del) del.delayTime.setTargetAtTime((60 / bpm) * 0.75, ctx.currentTime, 0.1); };   // dotted-eighth echo
  A.suspend = () => { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); };
  A.resume = () => { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); };
  A.musicLevel = (v) => { if (music) music.gain.setTargetAtTime(v, ctx.currentTime, 0.3); };

  // ---------- building blocks ----------
  const T = (t) => Math.max(t || 0, ctx.currentTime);
  function gain(dest, v) { const g = ctx.createGain(); g.gain.value = v || 0; g.connect(dest); return g; }
  function osc(type, f, t, dur, dest) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest);
    o.start(t); o.stop(t + dur); active++; o.onended = () => { active--; try { o.disconnect(); } catch (e) {} }; return o;
  }
  function envPerc(g, t, peak, dec, att) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + (att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); }
  function noiseSrc(t, dur, dest) {
    const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; s.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur); active++; s.onended = () => { active--; try { s.disconnect(); } catch (e) {} }; return s;
  }
  const busy = () => active > 150;

  // ---------- resonator voices ----------
  function bell(f, t, v, dest) {
    const P = [[1, 1, 1.9], [2, 0.42, 1.1], [3.01, 0.2, 0.6], [4.16, 0.1, 0.35]];
    for (const [r, a, d] of P) { const g = gain(dest || music); envPerc(g, t, a * v, d, 0.003); osc('sine', f * r, t, d + 0.05, g); }
  }
  function pluck(f, t, v, dest) {        // glassy FM pluck (harp)
    const g = gain(dest || music); envPerc(g, t, v, 1.1, 0.002);
    const car = osc('sine', f, t, 1.2, g);
    const mg = ctx.createGain(); mg.gain.setValueAtTime(f * 2.4, t); mg.gain.exponentialRampToValueAtTime(f * 0.04, t + 0.35); mg.connect(car.frequency);
    osc('sine', f * 2, t, 1.2, mg);
    const g2 = gain(dest || music); envPerc(g2, t, v * 0.25, 0.5); osc('triangle', f * 2, t, 0.55, g2);
  }
  function drone(f, t, v, dur) {         // hum: detuned saws through a breathing low-pass
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 6;
    lp.frequency.setValueAtTime(180, t); lp.frequency.linearRampToValueAtTime(900, t + 0.12); lp.frequency.exponentialRampToValueAtTime(260, t + dur);
    const g = gain(music); lp.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.06); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
    const a = osc('sawtooth', f, t, dur + 0.6, lp); a.detune.value = -7;
    const b = osc('sawtooth', f, t, dur + 0.6, lp); b.detune.value = 7;
    const s = gain(music); envPerc(s, t, v * 0.8, dur + 0.4, 0.02); osc('sine', f / 2, t, dur + 0.5, s);
  }
  function gong(f, t, v) {               // ward: soft inharmonic gong
    const P = [[1, 1, 2.2], [2.76, 0.4, 1.0], [5.4, 0.18, 0.45]];
    for (const [r, a, d] of P) { const g = gain(music); envPerc(g, t, a * v, d, 0.006); const o = osc('sine', f * r * 1.015, t, d + 0.05, g); o.frequency.exponentialRampToValueAtTime(f * r, t + 0.25); }
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 4; bp.Q.value = 2;
    const ng = gain(music); bp.connect(ng); envPerc(ng, t, v * 0.25, 0.12); noiseSrc(t, 0.15, bp);
  }
  function shimmer(f, t, v, dur) {       // echo: slow airy pad note
    const g = gain(music);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.35); g.gain.setTargetAtTime(0.0001, t + dur * 0.6, dur * 0.45);
    osc('sine', f, t, dur * 2.2, g); const b = osc('sine', f, t, dur * 2.2, g); b.detune.value = 9;
    const h = gain(music); h.gain.setValueAtTime(0.0001, t); h.gain.linearRampToValueAtTime(v * 0.3, t + 0.5); h.gain.setTargetAtTime(0.0001, t + dur * 0.5, dur * 0.4);
    const tri = osc('triangle', f * 2, t, dur * 2.2, h);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5; const lg = ctx.createGain(); lg.gain.value = 6; lfo.connect(lg); lg.connect(tri.detune); lfo.start(t); lfo.stop(t + dur * 2.2);
  }

  // role → voice. vel 0..1 (several identical notes on one step are merged and play louder)
  A.voice = function (role, n, oct, when, vel, bar) {
    if (!A.on() || busy()) return;
    const t = T(when), f = noteFreq(n, oct);
    if (role === 'bell') bell(f, t, 0.16 * vel);
    else if (role === 'harp') pluck(f, t, 0.13 * vel);
    else if (role === 'hum') drone(f, t, 0.07 * vel, bar * 0.9);
    else if (role === 'ward') gong(f, t, 0.14 * vel);
    else if (role === 'echo') shimmer(f, t, 0.05 * vel, bar);
    else if (role === 'spire') bell(f, t, 0.08 * vel);
  };

  // ---------- the bed: pad, bass, percussion ----------
  A.pad = function (root, when, dur, v) {
    if (!A.on() || busy()) return;
    const t = T(when);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(900, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(500, t + dur);
    const g = gain(music); lp.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03 * v, t + 0.5); g.gain.setValueAtTime(0.03 * v, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.9);
    const f = noteFreq(root, 3), f5 = f * 1.4983;
    for (const [fr, dt] of [[f, -6], [f, 6], [f5, 0], [f * 2, 3]]) { const o = osc('sawtooth', fr, t, dur + 1, lp); o.detune.value = dt; }
  };
  A.bass = function (root, when, dur, v) {
    if (!A.on() || busy()) return;
    const t = T(when), f = noteFreq(root, 2);
    const g = gain(music); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13 * v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.05 * v, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('triangle', f, t, dur + 0.05, g); const s = gain(music); envPerc(s, t, 0.1 * v, dur * 0.8, 0.01); osc('sine', f / 2, t, dur, s);
  };
  A.kick = function (when, v) {
    if (!A.on() || busy()) return;
    const t = T(when), g = gain(music); envPerc(g, t, 0.5 * v, 0.32, 0.002);
    const o = osc('sine', 120, t, 0.35, g); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  };
  A.hat = function (when, v) {
    if (!A.on() || busy()) return;
    const t = T(when), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
    const g = gain(music); hp.connect(g); envPerc(g, t, 0.05 * v, 0.045, 0.001); noiseSrc(t, 0.06, hp);
  };
  A.clap = function (when, v) {
    if (!A.on() || busy()) return;
    const t = T(when), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.9;
    const g = gain(music); bp.connect(g); envPerc(g, t, 0.12 * v, 0.17, 0.002); noiseSrc(t, 0.2, bp);
    const s = gain(music); envPerc(s, t, 0.05 * v, 0.08); osc('triangle', 190, t, 0.1, s);
  };
  A.shaker = function (when, v) {
    if (!A.on() || busy()) return;
    const t = T(when), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = 1.5;
    const g = gain(music); bp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025 * v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); noiseSrc(t, 0.1, bp);
  };

  // ---------- harmony events ----------
  A.blast = function (n, when, size, soft) {
    if (!A.on()) return;
    const t = T(when);
    if (soft) { bell(noteFreq(n, 3), t, 0.07); bell(noteFreq(n, 4), t, 0.06); return; }   // rehearsal: just the chord
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(160, t + 0.6);
    const g = gain(music); lp.connect(g); envPerc(g, t, 0.22, 0.7, 0.003); noiseSrc(t, 0.75, lp);
    const s = gain(music); envPerc(s, t, 0.35, 0.6, 0.003); const o = osc('sine', 90, t, 0.65, s); o.frequency.exponentialRampToValueAtTime(34, t + 0.5);
    bell(noteFreq(n, 3), t, 0.14); bell(noteFreq(n, 4), t, 0.12); if (size > 3) bell(noteFreq(n, 5), t + 0.01, 0.08);
  };
  A.aurora = function (when, bar) {
    if (!A.on()) return;
    const t = T(when), seq = [0, 1, 2, 3, 4, 0, 2, 3];
    seq.forEach((n, i) => { bell(noteFreq(n, i < 5 ? 5 : 6), t + i * bar / 16, 0.07); });
    shimmer(noteFreq(0, 4), t, 0.05, bar * 2); shimmer(noteFreq(3, 4), t, 0.04, bar * 2);
  };
  A.heal = function (when) { if (!A.on()) return; const t = T(when); [0, 2, 3].forEach((n, i) => bell(noteFreq(n, 5), t + i * 0.06, 0.07)); };
  A.sparkle = function (when) { if (!A.on() || busy()) return; bell(noteFreq(Math.floor(Math.random() * 5), 6), T(when), 0.035); };

  // ---------- sound effects (play right away) ----------
  A.sfx = function (name, n) {
    if (!A.on()) return;
    const t = ctx.currentTime + 0.005;
    const note = n == null ? 0 : n;
    switch (name) {
      case 'click': { const g = gain(sfx); envPerc(g, t, 0.06, 0.05, 0.001); osc('sine', 1400, t, 0.06, g); break; }
      case 'place': bell(noteFreq(note, 5), t, 0.12, sfx); bell(noteFreq(note, 6), t + 0.07, 0.06, sfx); break;
      case 'upgrade': [0, 1, 2].forEach((k, i) => pluck(noteFreq(note + k, 5 + Math.floor((note + k) / 5)), t + i * 0.07, 0.12, sfx)); break;
      case 'sell': pluck(noteFreq(note, 5), t, 0.1, sfx); pluck(noteFreq(note, 4), t + 0.09, 0.1, sfx); break;
      case 'retune': pluck(noteFreq(note, 5), t, 0.1, sfx); break;
      case 'error': { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; const g = gain(sfx); lp.connect(g); envPerc(g, t, 0.12, 0.18); osc('square', 98, t, 0.2, lp); osc('square', 104, t, 0.2, lp); break; }
      case 'hit': {
        const g = gain(sfx); envPerc(g, t, 0.5, 0.45, 0.002); const o = osc('sine', 80, t, 0.5, g); o.frequency.exponentialRampToValueAtTime(36, t + 0.3);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const g2 = gain(sfx); lp.connect(g2); envPerc(g2, t, 0.09, 0.6);
        osc('sawtooth', 233, t, 0.65, lp); osc('sawtooth', 247, t, 0.65, lp); break;
      }
      case 'shatter': {
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2800; const g = gain(sfx); hp.connect(g); envPerc(g, t, 0.16, 0.35); noiseSrc(t, 0.4, hp);
        [2200, 3170, 4420].forEach((f, i) => { const gg = gain(sfx); envPerc(gg, t + i * 0.02, 0.05, 0.5); osc('sine', f, t + i * 0.02, 0.55, gg); }); break;
      }
      case 'death': {
        if (t - lastDeath < 0.045 || busy()) return; lastDeath = t;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700 + Math.random() * 500; bp.Q.value = 1.2;
        const g = gain(sfx); bp.connect(g); envPerc(g, t, 0.07, 0.16, 0.003); noiseSrc(t, 0.18, bp); break;
      }
      case 'wave': {
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3; bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 1.1);
        const g = gain(sfx); bp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4); noiseSrc(t, 1.5, bp);
        [0, 3, 0].forEach((nn, i) => bell(noteFreq(nn, 3 + i), t + 0.9, 0.08, sfx)); break;
      }
      case 'clear': [0, 2, 3, 0].forEach((nn, i) => bell(noteFreq(nn, i === 3 ? 6 : 5), t + i * 0.11, 0.1, sfx)); break;
      case 'pick': [3, 4, 0, 2].forEach((nn, i) => pluck(noteFreq(nn, i < 2 ? 5 : 6), t + i * 0.06, 0.09, sfx)); break;
      case 'victory': {
        [0, 2, 3, 0, 2, 3, 0].forEach((nn, i) => bell(noteFreq(nn, 4 + Math.floor(i / 3)), t + i * 0.16, 0.12, sfx));
        shimmer(noteFreq(0, 4), t, 0.06, 2.5); shimmer(noteFreq(3, 4), t + 0.3, 0.05, 2.5); break;
      }
      case 'defeat': {
        [4, 3, 2, 1, 0].forEach((nn, i) => bell(noteFreq(nn, 4), t + i * 0.32, 0.1, sfx));
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; const g = gain(sfx); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
        osc('sawtooth', noteFreq(4, 1), t, 3.1, lp); osc('sawtooth', noteFreq(4, 1) * 1.006, t, 3.1, lp); break;
      }
      case 'boss': {
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, t); lp.frequency.linearRampToValueAtTime(900, t + 0.6); lp.frequency.exponentialRampToValueAtTime(120, t + 1.8);
        const g = gain(sfx); lp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 2);
        const o = osc('sawtooth', 55, t, 2.1, lp); o.frequency.linearRampToValueAtTime(46, t + 2); const o2 = osc('sawtooth', 58.3, t, 2.1, lp); o2.frequency.linearRampToValueAtTime(44, t + 2);
        const ng = gain(sfx); envPerc(ng, t, 0.12, 1.2, 0.2); const nlp = ctx.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 500; nlp.connect(ng); noiseSrc(t, 1.3, nlp); break;
      }
      case 'dissonance': {
        const g = gain(sfx); envPerc(g, t, 0.08, 0.9, 0.05); osc('sawtooth', 311, t, 1, g); osc('sawtooth', 329.6, t, 1, g); osc('sawtooth', 466, t, 1, g); break;
      }
      case 'repair': [0, 2, 3].forEach((nn, i) => bell(noteFreq(nn, 5), t + i * 0.08, 0.08, sfx)); break;
    }
  };
  A.stats = () => ({ active, state: ctx ? ctx.state : 'none' });
  return A;
})();
