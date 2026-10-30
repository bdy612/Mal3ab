'use strict';
// =====================================================================
// Mal3ab add-on: touch controls for phones and tablets.
// Shown only on touch screens; the mouse + keyboard game is unchanged.
//  left stick = walk (push to the edge to sprint) · drag anywhere = look
//  ⛏ hold = mine / hit · ✋ = place / use (hold to keep placing / block)
//  ⤒ jump (hold to swim / fly up) · ⇩ sneak (fly down) · 🎒 inventory
//  tap the hotbar to pick a slot · ⏸ game menu
// =====================================================================
(function () {
  let on = false;
  const isTouch = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window && navigator.maxTouchPoints > 0;

  const css = document.createElement('style');
  css.textContent = `
  #vtouch{position:fixed;inset:0;z-index:11;touch-action:none;user-select:none;-webkit-user-select:none;display:none}
  #vtouch.show{display:block}
  #vtouch .look{position:absolute;inset:0}
  #vtouch .stick{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:28px;width:136px;height:136px;border-radius:50%;
    background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.28)}
  #vtouch .knob{position:absolute;left:50%;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:rgba(255,255,255,.42)}
  #vtouch .tb{position:absolute;width:62px;height:62px;border-radius:50%;background:rgba(0,0,0,.38);border:2px solid rgba(255,255,255,.35);
    color:#fff;font:26px/58px system-ui,sans-serif;text-align:center}
  #vtouch .tb.small{width:46px;height:46px;font-size:19px;line-height:42px}
  #vtouch .tb.held{background:rgba(255,183,3,.55);border-color:#ffb703}
  #vtouch .tb[hidden]{display:none}
  #vtclose{position:fixed;top:10px;right:10px;z-index:60;width:48px;height:48px;border-radius:50%;border:2px solid rgba(255,255,255,.5);
    background:rgba(0,0,0,.55);color:#fff;font:22px system-ui;display:none}
  #vtclose.show{display:block}`;
  document.head.appendChild(css);

  const root = document.createElement('div'); root.id = 'vtouch';
  root.innerHTML = `<div class="look"></div><div class="stick"><div class="knob"></div></div>`;
  const R = (r, b, cls) => `right:calc(${r}px + env(safe-area-inset-right));bottom:${b}px`;
  const BTN = [
    ['mine', '⛏', R(96, 118)], ['use', '✋', R(22, 150)], ['jump', '⤒', R(22, 70)], ['sneak', '⇩', R(96, 40)],
    ['inv', '🎒', R(22, 224), 'small'], ['drop', '⇣', R(76, 224), 'small'], ['fly', '🕊', R(130, 224), 'small'],
    ['pause', '⏸', 'right:calc(14px + env(safe-area-inset-right));top:46px', 'small']];
  for (const [id, label, pos, cls] of BTN) root.insertAdjacentHTML('beforeend', `<div class="tb ${cls || ''}" data-b="${id}" style="${pos}">${label}</div>`);
  const closeBtn = document.createElement('button'); closeBtn.id = 'vtclose'; closeBtn.textContent = '✕';
  document.body.append(root, closeBtn);
  const stick = root.querySelector('.stick'), knob = root.querySelector('.knob'), look = root.querySelector('.look');
  const btnEl = (id) => root.querySelector(`[data-b="${id}"]`);

  // ---- state ----
  let stickId = null, stickV = [0, 0], lookTouches = {}, wasPlaying = false;
  const held = {};                                        // touch identifier -> button id
  const playingNow = () => game.state === 'playing' && !game.paused && !uiOpen && !player.dead && !chatOpen &&
    pauseEl.classList.contains('hidden') && mpEl.classList.contains('hidden');

  function release() {
    for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft']) keys[k] = false;
    mouseDown[0] = mouseDown[2] = false; player.sprint = false;
    stickId = null; stickV = [0, 0]; knob.style.transform = ''; lookTouches = {};
    for (const k in held) delete held[k];
    root.querySelectorAll('.tb.held').forEach(b => b.classList.remove('held'));
  }

  function enable() {
    if (on) return; on = true;
    // the game normally waits for the mouse to be "grabbed"; on a touch screen we drive that flag ourselves
    const resume0 = window.resumeGame;
    window.resumeGame = function () { resume0.apply(this, arguments); if (on && playingNow()) locked = true; };
    requestAnimationFrame(loop);
  }

  function loop() {
    const play = playingNow();
    if (play !== wasPlaying) { wasPlaying = play; locked = play; if (!play) release(); }
    root.classList.toggle('show', play);
    closeBtn.classList.toggle('show', game.state === 'playing' && uiOpen);
    btnEl('fly').hidden = !(inventory.creative && !player.spectator);
    if (play) {                                           // walking from the stick
      const [x, y] = stickV;
      keys.KeyW = y < -0.3; keys.KeyS = y > 0.3; keys.KeyA = x < -0.3; keys.KeyD = x > 0.3;
      if (y < -0.92 && player.food > 6 && !keys.ShiftLeft) player.sprint = true;
    }
    requestAnimationFrame(loop);
  }

  // ---- stick ----
  function moveStick(t) {
    const r = stick.getBoundingClientRect(), rad = r.width / 2;
    let dx = (t.clientX - r.left - rad) / rad, dy = (t.clientY - r.top - rad) / rad;
    const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
    stickV = [dx, dy]; knob.style.transform = `translate(${dx * rad * 0.62}px,${dy * rad * 0.62}px)`;
  }

  // ---- buttons ----
  function press(id) {
    const b = btnEl(id); if (b) b.classList.add('held');
    if (player.spectator && id !== 'pause' && id !== 'jump' && id !== 'sneak') return;
    if (id === 'mine') { mouseDown[0] = true; attack(world); }
    else if (id === 'use') { mouseDown[2] = true; useItem(world); nextPlace = performance.now() + 300; }
    else if (id === 'jump') keys.Space = true;
    else if (id === 'sneak') keys.ShiftLeft = true;
    else if (id === 'inv') { release(); openUI(inventory.creative ? 'creative' : 'inventory'); }
    else if (id === 'drop') dropHeld();
    else if (id === 'fly') { player.fly = !player.fly; player.vel[1] = 0; }
    else if (id === 'pause') { release(); openPause(); }
  }
  function unpress(id) {
    const b = btnEl(id); if (b) b.classList.remove('held');
    if (id === 'mine') mouseDown[0] = false;
    else if (id === 'use') mouseDown[2] = false;
    else if (id === 'jump') keys.Space = false;
    else if (id === 'sneak') keys.ShiftLeft = false;
  }

  // tap on the hotbar picks that slot
  function hotbarSlotAt(x, y) {
    if (typeof hotbarEl === 'undefined' || hotbarEl.style.display === 'none') return -1;
    const kids = [...hotbarEl.children];
    for (let i = 0; i < kids.length; i++) { const r = kids[i].getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top - 6 && y <= r.bottom + 6) return i; }
    return -1;
  }

  root.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const b = el && el.closest && el.closest('.tb');
      if (b) { held[t.identifier] = b.dataset.b; press(b.dataset.b); continue; }
      if (el && el.closest && el.closest('.stick') && stickId === null) { stickId = t.identifier; moveStick(t); continue; }
      const slot = hotbarSlotAt(t.clientX, t.clientY);
      if (slot >= 0) { inventory.sel = slot; updateHotbar(); continue; }
      lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  root.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === stickId) { moveStick(t); continue; }
      const L = lookTouches[t.identifier]; if (!L) continue;
      const s = 0.0055 * (SETTINGS.sens || 1), dx = t.clientX - L.x, dy = t.clientY - L.y;
      player.yaw -= dx * s;
      player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch - dy * s * (SETTINGS.invert ? -1 : 1)));
      L.x = t.clientX; L.y = t.clientY;
    }
  }, { passive: false });

  const end = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === stickId) { stickId = null; stickV = [0, 0]; knob.style.transform = ''; }
      if (held[t.identifier]) { unpress(held[t.identifier]); delete held[t.identifier]; }
      delete lookTouches[t.identifier];
    }
  };
  root.addEventListener('touchend', end); root.addEventListener('touchcancel', end);

  closeBtn.addEventListener('click', () => { if (uiOpen) closeUI(); });

  if (isTouch()) enable();
  addEventListener('touchstart', enable, { once: true, passive: true });
})();
