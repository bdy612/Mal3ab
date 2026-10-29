'use strict';
// Item names on hover: a small Minecraft-style label follows the mouse over any slot
// (inventory, hotbar, chests, crafting, furnace, creative menu).
(function(){
  const tip=document.createElement('div'); tip.id='itemTip';
  tip.style.cssText='position:fixed;z-index:100000;pointer-events:none;display:none;background:rgba(16,0,16,.94);border:2px solid #2a0f5c;outline:1px solid #0b0014;color:#fff;font:15px Consolas,monospace;padding:4px 8px;white-space:pre;text-shadow:2px 2px 0 #3f3f3f;max-width:340px';
  document.body.appendChild(tip);
  const hide=()=>{ tip.style.display='none'; };
  document.addEventListener('mousemove',e=>{
    const s=e.target&&e.target.closest?e.target.closest('.slot'):null;
    if(s&&s.title){ s.dataset.tip=s.title; s.removeAttribute('title'); }          // our label replaces the slow browser tooltip
    const name=s&&s.dataset.tip;
    if(!name||document.pointerLockElement){ hide(); return; }
    tip.textContent=name; tip.style.display='block';
    const w=tip.offsetWidth,h=tip.offsetHeight; let x=e.clientX+16,y=e.clientY-h-6;
    if(x+w>innerWidth-4)x=e.clientX-w-12; if(y<4)y=e.clientY+18;
    tip.style.left=x+'px'; tip.style.top=y+'px';
  });
  document.addEventListener('pointerlockchange',hide); document.addEventListener('mousedown',()=>setTimeout(()=>{ const t=document.querySelector('.slot:hover'); if(!t)hide(); },0));
  setInterval(()=>{ if(typeof uiOpen!=='undefined'&&!uiOpen&&!document.querySelector('.slot:hover'))hide(); },300);
})();
