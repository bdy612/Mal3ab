'use strict';
// --- HUD ---
const hotbarEl=document.getElementById('hotbar'),debugEl=document.getElementById('debug'),overlay=document.getElementById('overlay'),invEl=document.getElementById('inv'),barsL=document.querySelector('#bars .l'),barsR=document.querySelector('#bars .r'),handName=document.getElementById('handName'),xpEl=document.getElementById('xp'),bossEl=document.getElementById('boss'),effectsEl=document.getElementById('effects');
function slotEl(s,label,cls){const d=document.createElement('div');d.className='slot'+cls+(s.ench?' ench':'');
  if(s.count>0){const I=ITEMS[s.id];d.style.backgroundImage=`url(${iconURL(s.id)})`;d.title=enchName(s);const cnt=inventory.creative&&I.stack>1?'∞':s.count>1?s.count:'';d.innerHTML=`<b>${label??''}</b><span>${cnt}</span>`;
    if(I.maxDur&&s.dur>0){const f=1-s.dur/I.maxDur;d.innerHTML+=`<i style="--w:${Math.round(f*100)}%;--c:${f>0.5?'#5d5':f>0.25?'#dd5':'#d55'}"></i>`;}}
  else d.innerHTML=label!==undefined?`<b>${label}</b>`:'';return d;}
function buildHotbar(){hotbarEl.innerHTML='';for(let i=0;i<9;i++)hotbarEl.appendChild(slotEl(inventory.slots[i],i+1,i===inventory.sel?' sel':''));const s=selected();handName.textContent=s.count?enchName(s):'';handName.style.opacity=1;clearTimeout(handName._t);handName._t=setTimeout(()=>handName.style.opacity=0,1500);}
function updateHotbar(){buildHotbar();if(uiOpen)refreshUI();}
function updateBars(){ if(inventory.creative){barsL.textContent='';barsR.textContent='';xpEl.style.display='none';return;} xpEl.style.display='block';
  const hearts=Array.from({length:10},(_,i)=>player.hp>=i*2+2?'♥':player.hp>=i*2+1?'♡':'·').join(''),ap=armorPoints();
  barsL.innerHTML=(ap?`<span style="color:#ccc">${'■'.repeat(Math.min(10,Math.ceil(ap/2)))}</span>\n`:'')+`<span style="color:#f33">${hearts}</span>`;
  const food=Array.from({length:10},(_,i)=>player.food>=i*2+2?'●':player.food>=i*2+1?'◐':'·').join('');
  barsR.innerHTML=(player.air<15?`<span style="color:#8cf">${'○'.repeat(Math.ceil(player.air/1.5))}</span>\n`:'')+`<span style="color:#e94">${food}</span>`;
  xpEl.firstElementChild.style.width=Math.round(player.xp/xpNeed(player.level)*100)+'%'; xpEl.lastElementChild.textContent=player.level||'';
  effectsEl.innerHTML=Object.entries(player.effects).map(([k,t])=>`<div style="color:${EFFECTS[k].col}">${EFFECTS[k].name} ${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}</div>`).join('');
  const boss=world.mobs.find(m=>m.def.boss); bossEl.style.display=boss?'block':'none'; if(boss){bossEl.firstElementChild.textContent='Dragon';bossEl.querySelector('i').style.width=Math.max(0,boss.hp/boss.def.hp*100)+'%';} }

// --- container UI (inventory / crafting table / furnace / chest / enchanting / trading) ---
let uiOpen=false;const cursorEl=document.getElementById('cursorStack');const ui={type:null,tile:null,grid:[],gw:0,ench:[],opts:null};
function openUI(type,tile){ui.type=type;ui.tile=tile||null;ui.gw=type==='table'?3:type==='inventory'?2:0;ui.grid=Array.from({length:ui.gw*ui.gw},empty);ui.ench=[empty()];ui.opts=null;uiOpen=true;invEl.classList.remove('hidden');refreshUI();document.exitPointerLock();}
function closeUI(relock=true){uiOpen=false;invEl.classList.add('hidden');for(const s of ui.grid.concat(ui.ench))if(s.count){const l=invAdd(s.id,s.count,s.dur,s.ench);if(l)spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],s.id,l,s.dur,null,s.ench);clearStack(s);}
  const c=inventory.cursor;if(c.count){const l=invAdd(c.id,c.count,c.dur,c.ench);if(l)spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],c.id,l,c.dur,null,c.ench);clearStack(c);}cursorEl.classList.add('hidden');buildHotbar();scheduleSave();if(relock&&!player.dead)canvas.requestPointerLock();}
function moveStack(s,target){
  if(ITEMS[s.id].stack>1)for(const t of target){if(t.id===s.id&&t.count<ITEMS[s.id].stack){const n=Math.min(s.count,ITEMS[s.id].stack-t.count);t.count+=n;s.count-=n;if(!s.count){clearStack(s);return;}}}
  for(const t of target){if(!t.count){setStack(t,s);clearStack(s);return;}} }
function slotClick(arr,i,opt,e){ const s=arr[i],c=inventory.cursor,right=e.button===2;
  if(opt.output){ if(!s.count)return; if(c.count&&(c.id!==s.id||c.count+s.count>ITEMS[s.id].stack))return; c.id=s.id;c.count+=s.count;c.dur=s.dur;c.ench=s.ench; opt.onTake(); sfx.craft(); return; }
  if(e.shiftKey&&s.count&&opt.quick){opt.quick(s);return;}
  if(c.count&&opt.accept&&!opt.accept(c))return;
  if(right){ if(!c.count){ if(s.count>1){const n=Math.ceil(s.count/2);setStack(c,s);c.count=n;s.count-=n;} else if(s.count){setStack(c,s);clearStack(s);} }
    else if(!s.count||(s.id===c.id&&s.count<ITEMS[s.id].stack&&!c.ench)){ if(!s.count){setStack(s,c);s.count=1;} else s.count++; c.count--;if(!c.count)clearStack(c);} return; }
  if(!c.count){if(s.count){setStack(c,s);clearStack(s);}}
  else if(!s.count){setStack(s,c);clearStack(c);}
  else if(s.id===c.id&&ITEMS[s.id].stack>1){const n=Math.min(c.count,ITEMS[s.id].stack-s.count);s.count+=n;c.count-=n;if(!c.count)clearStack(c);}
  else{const t={};setStack(t,s);setStack(s,c);setStack(c,t);} }
function mkSlot(arr,i,opt,label){const d=slotEl(arr[i],label,'');d.onmousedown=e=>{e.preventDefault();slotClick(arr,i,opt,e);if(arr===ui.ench)ui.opts=null;refreshUI();buildHotbar();scheduleSave();};d.oncontextmenu=e=>e.preventDefault();return d;}
function recRow(iconId,title,sub,ok,onclick){const d=document.createElement('div');d.className='rec'+(ok?' ok':'');d.innerHTML=`<div class="ic" style="background-image:url(${iconURL(iconId)})"></div><div>${title}<small>${sub}</small></div>`;if(onclick)d.onclick=()=>{if(ok)onclick();};else d.style.cursor='default';return d;}
function refreshUI(){
  const main=document.getElementById('uiMain'),side=document.getElementById('uiSide');main.innerHTML='';side.innerHTML='';
  const invQuick={quick:s=>{ const i=inventory.slots.indexOf(s);
    if(ui.type==='chest')moveStack(s,ui.tile.slots); else if(ui.type==='furnace'){ if(SMELT[s.id]||!FUEL[s.id])moveStack(s,[ui.tile.inp]); else moveStack(s,[ui.tile.fuel]); } else if(ui.type==='enchant'&&itemKind(ITEMS[s.id])){moveStack(s,ui.ench);ui.opts=null;}
    else if(ui.type==='brew'){ if(BREW[s.id])moveStack(s,[ui.tile.ing]); else if(s.id===BLAZE_POWDER)moveStack(s,[ui.tile.fuel]); else if(ITEMS[s.id].drink)moveStack(s,ui.tile.bottles); }
    else if(ITEMS[s.id].armor&&!inventory.armor[ITEMS[s.id].armor.slot].count)moveStack(s,[inventory.armor[ITEMS[s.id].armor.slot]]);
    else moveStack(s,i<9?inventory.slots.slice(9):inventory.slots.slice(0,9)); }};
  const h=t=>{const e=document.createElement('h4');e.textContent=t;return e;},grid=()=>{const g=document.createElement('div');g.className='grid';return g;};
  if(ui.type==='inventory'||ui.type==='table'){
    const top=document.createElement('div');top.className='row';top.style.marginBottom='10px';
    if(ui.type==='inventory'){const ar=document.createElement('div');ar.className='g3';ar.style.gridTemplateColumns='42px';['Helm','Chest','Legs','Boots'].forEach((n,i)=>{const d=mkSlot(inventory.armor,i,{accept:c=>!!(ITEMS[c.id].armor&&ITEMS[c.id].armor.slot===i),quick:s=>moveStack(s,inventory.slots)});if(!inventory.armor[i].count)d.innerHTML=`<b style="font-size:9px">${n}</b>`;ar.appendChild(d);});top.appendChild(ar);const sp=document.createElement('div');sp.style.width='30px';top.appendChild(sp);}
    const g=document.createElement('div');g.className='g3';g.style.gridTemplateColumns=`repeat(${ui.gw},42px)`;for(let i=0;i<ui.grid.length;i++)g.appendChild(mkSlot(ui.grid,i,{quick:s=>moveStack(s,inventory.slots)}));top.appendChild(g);
    const ar=document.createElement('div');ar.className='arrow';ar.textContent='→';top.appendChild(ar);
    const res=craftResult(ui.grid,ui.gw);const out=[res?{id:res[0],count:res[1]}:empty()];
    top.appendChild(mkSlot(out,0,{output:true,onTake:()=>{for(const s of ui.grid)if(s.count){s.count--;if(!s.count)clearStack(s);}}}));
    main.appendChild(h(ui.type==='table'?'Crafting table':'Crafting'));main.appendChild(top);
  }else if(ui.type==='furnace'){ const t=ui.tile,row=document.createElement('div');row.className='row';row.style.marginBottom='10px';
    const col=document.createElement('div');col.className='g3';col.style.gridTemplateColumns='42px';col.appendChild(mkSlot([t.inp],0,{quick:s=>moveStack(s,inventory.slots)}));
    const fire=document.createElement('div');fire.id='fireP';fire.style.cssText='text-align:center;color:#f93;font-size:12px';col.appendChild(fire);col.appendChild(mkSlot([t.fuel],0,{accept:c=>!!FUEL[c.id],quick:s=>moveStack(s,inventory.slots)}));row.appendChild(col);
    const ar=document.createElement('div');ar.className='arrow';ar.id='cookP';row.appendChild(ar); row.appendChild(mkSlot([t.out],0,{output:true,onTake:()=>{addXp(t.out.count);clearStack(t.out);}}));
    main.appendChild(h('Furnace'));main.appendChild(row); updateFurnaceUI(); }
  else if(ui.type==='chest'){ main.appendChild(h('Chest'));const g=grid();for(let i=0;i<27;i++)g.appendChild(mkSlot(ui.tile.slots,i,{quick:s=>moveStack(s,inventory.slots)}));g.style.marginBottom='10px';main.appendChild(g); }
  else if(ui.type==='enchant'){ const row=document.createElement('div');row.className='row';row.style.marginBottom='10px'; row.appendChild(mkSlot(ui.ench,0,{accept:c=>!!itemKind(ITEMS[c.id]),quick:s=>moveStack(s,inventory.slots)}));
    const info=document.createElement('div');info.style.cssText='font-size:12px;color:#bbb';info.textContent=`Your level: ${player.level}. Put a tool, weapon, bow or armor in the slot.`;row.appendChild(info); main.appendChild(h('Enchanting table'));main.appendChild(row); }
  else if(ui.type==='brew'){ const t=ui.tile,row=document.createElement('div');row.className='row';row.style.marginBottom='10px';
    const col=document.createElement('div');col.className='g3';col.style.gridTemplateColumns='42px';
    col.appendChild(mkSlot([t.ing],0,{accept:c=>!!BREW[c.id],quick:s=>moveStack(s,inventory.slots)})); col.appendChild(mkSlot([t.fuel],0,{accept:c=>c.id===BLAZE_POWDER,quick:s=>moveStack(s,inventory.slots)})); row.appendChild(col);
    const ar=document.createElement('div');ar.className='arrow';ar.id='brewP';row.appendChild(ar);
    for(let i=0;i<3;i++)row.appendChild(mkSlot(t.bottles,i,{accept:c=>!!ITEMS[c.id].drink&&ITEMS[c.id].stack===1,quick:s=>moveStack(s,inventory.slots)}));
    main.appendChild(h('Brewing stand  (top: ingredient · bottom: blaze powder fuel)'));main.appendChild(row); updateFurnaceUI(); }
  else if(ui.type==='trade'){ main.appendChild(h('Villager')); const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb;margin-bottom:10px';p.textContent='Click a trade on the right. Emeralds are the currency.';main.appendChild(p); }
  main.appendChild(h('Inventory'));const ig=grid();for(let i=9;i<36;i++)ig.appendChild(mkSlot(inventory.slots,i,invQuick));main.appendChild(ig);
  main.appendChild(h('Hotbar'));const hg=grid();for(let i=0;i<9;i++)hg.appendChild(mkSlot(inventory.slots,i,invQuick,i+1));main.appendChild(hg);
  const b=document.createElement('button');b.textContent='Close (E)';b.style.marginTop='10px';b.onclick=()=>closeUI();main.appendChild(b);
  const rc=document.createElement('div');rc.id='recipes';
  if(ui.type==='inventory'||ui.type==='table'){ side.appendChild(h('Recipe book (click to fill grid · shift-click slots to move fast)'));
    for(const r of allRecipes()){ const ok=canFill(r,ui.gw),need=recipeNeeds(r); rc.appendChild(recRow(r.out[0],ITEMS[r.out[0]].name+(r.out[1]>1?' ×'+r.out[1]:''),Object.entries(need).map(([id,c])=>c+'× '+ITEMS[id].name).join(', ')+(r.size>ui.gw?' — needs crafting table':''),ok,()=>{fillRecipe(r);refreshUI();})); } }
  else if(ui.type==='furnace'){ side.appendChild(h('Smelting')); for(const [a,b] of Object.entries(SMELT))rc.appendChild(recRow(b,ITEMS[b].name,ITEMS[a].name+' · fuel: coal, wood, blaze rods, lava buckets',true,null)); }
  else if(ui.type==='enchant'){ side.appendChild(h('Enchantments')); const s=ui.ench[0];
    if(s.count){ if(!ui.opts)ui.opts=enchOptions(s); for(const o of ui.opts){ const ok=player.level>=o.cost||inventory.creative; rc.appendChild(recRow(s.id,`${o.name} ${ROMAN[o.lvl]}`,`costs ${o.cost} level${o.cost>1?'s':''}`,ok,()=>{applyEnchant(s,o);if(inventory.creative)player.level+=o.cost;ui.opts=null;refreshUI();buildHotbar();scheduleSave();})); } }
    else { const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb';p.textContent='Sharpness (swords) · Efficiency (tools) · Unbreaking · Protection (armor) · Power (bows) · Fortune (pickaxes). Earn levels by mining ores, smelting and killing mobs.';rc.appendChild(p);} }
  else if(ui.type==='brew'){ side.appendChild(h('Brewing'));
    for(const [ing,map] of Object.entries(BREW))for(const [base,res] of Object.entries(map))rc.appendChild(recRow(res,ITEMS[res].name,ITEMS[base].name+' + '+ITEMS[ing].name,true,null));
    const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb;margin-top:6px';p.textContent='Fill glass bottles from water (right-click), brew nether wart into them for awkward potions, then add an ingredient. Each blaze powder fuels 20 brews.';rc.appendChild(p); }
  else if(ui.type==='trade'){ side.appendChild(h('Trades')); for(const t of ui.tile.trades){ const ok=inventory.creative||t.in.every(([id,n])=>invCount(id)>=n);
      rc.appendChild(recRow(t.out[0],`${ITEMS[t.out[0]].name}${t.out[1]>1?' ×'+t.out[1]:''}`,'for '+t.in.map(([id,n])=>n+'× '+ITEMS[id].name).join(', '),ok,()=>{if(!inventory.creative)for(const [id,n] of t.in)invRemove(id,n);invAdd(t.out[0],t.out[1]);addXp(2);sfx.craft();refreshUI();buildHotbar();scheduleSave();})); } }
  side.appendChild(rc);
  const c=inventory.cursor;cursorEl.classList.toggle('hidden',c.count===0);if(c.count){cursorEl.style.backgroundImage=`url(${iconURL(c.id)})`;cursorEl.firstElementChild.textContent=c.count>1?c.count:'';}
}
function updateFurnaceUI(){if(uiOpen&&ui.type==='brew'){const t=ui.tile,e=document.getElementById('brewP');if(e)e.textContent=(t.t>0?Math.round(t.t/BREW_TIME*100)+'% ':'')+'→'+(t.fuelLeft?' ('+t.fuelLeft+')':'');return;}if(!uiOpen||ui.type!=='furnace')return;const t=ui.tile,f=document.getElementById('fireP'),c=document.getElementById('cookP');if(f)f.textContent=t.burnT>0?'🔥 '+Math.round(t.burnT/t.burnMax*100)+'%':'—';if(c)c.textContent=t.cookT>0?Math.round(t.cookT/SMELT_TIME*100)+'% →':'→';}
function fillRecipe(rc){ for(const s of ui.grid)if(s.count){invAdd(s.id,s.count,s.dur,s.ench);clearStack(s);}
  const r=rc.r,gw=ui.gw;const take=id=>{if(inventory.creative)return true;if(invCount(id)<1)return false;invRemove(id,1);return true;};
  if(r.pat){for(let y=0;y<r.pat.length;y++)for(let x=0;x<r.pat[0].length;x++){const ch=r.pat[y][x];if(ch===' ')continue;const id=r.key[ch];if(take(id)){const cell=ui.grid[y*gw+x];cell.id=id;cell.count=1;}}}
  else{r.in.forEach((id,i)=>{if(take(id)){const cell=ui.grid[i];cell.id=id;cell.count=1;}});} }
document.addEventListener('mousemove',e=>{if(uiOpen){cursorEl.style.left=(e.clientX-18)+'px';cursorEl.style.top=(e.clientY-18)+'px';}});

// --- input ---
let locked=false,mouseDown=[false,false,false],nextPlace=0,lastW=0;
canvas.addEventListener('click',()=>{audio();if(!locked&&!uiOpen&&!player.dead)canvas.requestPointerLock();});
overlay.addEventListener('click',()=>{audio();canvas.requestPointerLock();});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;overlay.classList.toggle('hidden',locked||uiOpen||player.dead||chatOpen||!mpEl.classList.contains('hidden'));if(!locked){for(const k in keys)keys[k]=false;mouseDown=[false,false,false];player.sprint=false;}});
document.addEventListener('mousemove',e=>{if(!locked)return;player.yaw-=e.movementX*0.0025;player.pitch=clamp(player.pitch-e.movementY*0.0025,-Math.PI/2+0.01,Math.PI/2-0.01);});
document.addEventListener('mousedown',e=>{if(!locked||player.dead)return;mouseDown[e.button]=true;if(e.button===0)attack(world);if(e.button===2){useItem(world);nextPlace=performance.now()+300;}});
document.addEventListener('mouseup',e=>{mouseDown[e.button]=false;});document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('wheel',e=>{if(!locked)return;inventory.sel=(inventory.sel+(e.deltaY>0?1:-1)+9)%9;updateHotbar();});
document.addEventListener('keydown',e=>{
  if(chatOpen){ if(e.code==='Escape'){closeChat();} return; }
  if(e.code==='KeyE'&&!player.dead){if(uiOpen)closeUI();else if(locked)openUI('inventory');e.preventDefault();return;}
  if((e.code==='KeyT'||e.code==='Slash')&&locked){ e.preventDefault(); openChat(e.code==='Slash'?'/':''); return; }
  if(e.code==='Escape'&&uiOpen){closeUI(false);return;}
  if(!locked)return;keys[e.code]=true;
  if(e.code==='KeyW'&&!e.repeat){const now=performance.now();if(now-lastW<300&&player.food>6)player.sprint=true;lastW=now;}
  if(e.code.startsWith('Digit')){const n=parseInt(e.code[5]);if(n>=1&&n<=9){inventory.sel=n-1;updateHotbar();}}
  if(e.code==='KeyQ'&&!e.repeat)dropHeld();
  if(e.code==='KeyF'&&inventory.creative){player.fly=!player.fly;player.vel[1]=0;}
  if(e.code==='KeyG'){inventory.creative=!inventory.creative;if(!inventory.creative)player.fly=false;updateHotbar();}
  if(['Space','ShiftLeft','ControlLeft','Tab'].includes(e.code))e.preventDefault();
});
document.addEventListener('keyup',e=>{keys[e.code]=false;});
document.getElementById('btnNew').addEventListener('click',()=>{if(net.guest){showMsg('You are playing on a friend\'s world.');return;}if(!confirm('Start a new world? The current one will be erased.'))return;for(const w of Object.values(dims))for(const c of w.chunks.values()){freeMesh(c.opaque);freeMesh(c.water);}localStorage.removeItem(SAVE_KEY);newWorld(1+Math.floor(Math.random()*2147483000),null);saveWorld();});
document.getElementById('btnDist').addEventListener('click',e=>{renderDist=renderDist>=10?4:renderDist+2;e.target.textContent='Render distance: '+renderDist;});
document.getElementById('btnRespawn').addEventListener('click',()=>respawn());
window.addEventListener('beforeunload',()=>saveWorld());document.addEventListener('visibilitychange',()=>{if(document.hidden)saveWorld();});

// --- chat & commands ---
let chatOpen=false; const chatLog=[], chatLogEl=document.getElementById('chatLog'), chatInput=document.getElementById('chatInput');
function addChat(text,col){ chatLog.push({text,col:col||'#fff',t:performance.now()}); if(chatLog.length>50)chatLog.shift(); renderChat(); }
function renderChat(){ const now=performance.now(); chatLogEl.innerHTML=chatLog.filter(m=>chatOpen||now-m.t<10000).slice(-8).map(m=>`<div style="color:${m.col}">${m.text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>`).join(''); }
function openChat(prefix){ chatOpen=true; chatInput.classList.remove('hidden'); chatInput.value=prefix; document.exitPointerLock(); setTimeout(()=>chatInput.focus(),0); renderChat(); }
function closeChat(){ chatOpen=false; chatInput.classList.add('hidden'); chatInput.blur(); renderChat(); canvas.requestPointerLock(); }
chatInput.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'){ const t=chatInput.value.trim(); if(t){ if(t[0]==='/')addChat(runCommand(t),'#ffd'); else net.chat(t); } closeChat(); } else if(e.key==='Escape')closeChat(); });
function findItem(q){ q=q.toLowerCase().replace(/_/g,' '); const ids=Object.keys(ITEMS).map(Number).filter(i=>!(BLOCKS[i]&&BLOCKS[i].noItem)&&ITEMS[i].name);
  return ids.find(i=>ITEMS[i].name.toLowerCase()===q||String(i)===q)??ids.find(i=>ITEMS[i].name.toLowerCase().startsWith(q))??ids.find(i=>ITEMS[i].name.toLowerCase().includes(q)); }
function runCommand(cmd){ const a=cmd.slice(1).trim().split(/\s+/),c=(a[0]||'').toLowerCase();
  if(c==='help'||!c)return 'Commands: /time day|night · /gamemode survival|creative · /tp x y z · /give <item> [count] · /locate stronghold|fortress|village · /spawn · /seed';
  if(c==='time'){ if(net.guest)return 'Only the host can change the time.'; dayTime=a[1]==='night'?0.62:a[1]==='noon'?0.25:0.05; net.sendTime(); return 'Time set to '+(a[1]||'day'); }
  if(c==='gamemode'||c==='gm'){ inventory.creative=/^(c|creative|1)$/.test(a[1]||''); if(!inventory.creative)player.fly=false; updateHotbar(); return 'Game mode: '+(inventory.creative?'creative':'survival'); }
  if(c==='tp'){ const v=a.slice(1,4).map(Number); if(v.length<3||v.some(isNaN))return 'Usage: /tp x y z'; player.pos=v; player.vel=[0,0,0]; player.fallPeak=v[1]; return `Teleported to ${v.join(' ')}`; }
  if(c==='give'){ let n=1,parts=a.slice(1); if(parts.length>1&&/^\d+$/.test(parts[parts.length-1]))n=+parts.pop(); const id=findItem(parts.join(' ')); if(id===undefined)return 'Unknown item: '+parts.join(' ');
    const left=invAdd(id,n); updateHotbar(); return `Gave ${n-left} × ${ITEMS[id].name}`; }
  if(c==='locate'){ const what=(a[1]||'').toLowerCase();
    if(what.startsWith('strong')){ const p=dims.over.gen.portalCenter; return `Stronghold (Overworld): ${p[0]} ${p[1]} ${p[2]}`; }
    if(what.startsWith('fort')){ const s=world.dim==='nether'?1:1/8, f=dims.nether.gen.fortressCenterNear(player.pos[0]*s,player.pos[2]*s); return f?`Nearest fortress (Nether coords): ${f[0]} ${f[1]} ${f[2]}`:'No fortress nearby'; }
    if(what.startsWith('vill')){ const g=dims.over.gen,pcx=Math.floor(player.pos[0]/16),pcz=Math.floor(player.pos[2]/16); let best=null,bd=1e9;
      for(let rx=Math.floor(pcx/8)-4;rx<=Math.floor(pcx/8)+4;rx++)for(let rz=Math.floor(pcz/8)-4;rz<=Math.floor(pcz/8)+4;rz++){ const v=g.villageCenter(rx*8,rz*8); if(!v)continue; const d=Math.hypot(v[0]-pcx,v[1]-pcz); if(d<bd){bd=d;best=v;} }
      return best?`Village near ${best[0]*16+8} ~ ${best[1]*16+8} (it may be in a desert or the sea, keep looking)`:'No village found nearby'; }
    return 'Usage: /locate stronghold|fortress|village'; }
  if(c==='seed')return 'Seed: '+SEED;
  if(c==='spawn'){ if(world.dim!=='over')world=dims.over; player.pos=[...player.spawn]; player.vel=[0,0,0]; return 'Back at spawn'; }
  return 'Unknown command — type /help'; }

// --- multiplayer panel ---
const mpEl=document.getElementById('mp'),mpStatus=document.getElementById('mpStatus');
function mpSay(t){ mpStatus.textContent=t; }
document.getElementById('btnMP').addEventListener('click',()=>{ mpEl.classList.remove('hidden'); document.exitPointerLock(); });
document.getElementById('mpClose').addEventListener('click',()=>{ mpEl.classList.add('hidden'); });
document.getElementById('mpName').addEventListener('change',e=>{ net.name=e.target.value.trim().slice(0,16)||'Player'; });
const copy=id=>{ const t=document.getElementById(id); t.select(); try{navigator.clipboard.writeText(t.value);}catch(e){document.execCommand('copy');} mpSay('Copied! Send it to your friend (WhatsApp, Discord, email...).'); };
document.getElementById('mpCopyOffer').onclick=()=>copy('mpOffer'); document.getElementById('mpCopyReply').onclick=()=>copy('mpReply');
document.getElementById('mpInvite').onclick=async()=>{ if(net.guest){mpSay('You are a guest; only the host can invite.');return;} net.name=document.getElementById('mpName').value.trim()||'Player'; mpSay('Creating invite code...');
  try{ document.getElementById('mpOffer').value=await net.hostInvite(); mpSay('Send this invite code to your friend, then paste their reply code below.'); }catch(e){ mpSay('Could not create invite: '+e.message); } };
document.getElementById('mpAccept').onclick=async()=>{ try{ await net.hostAccept(document.getElementById('mpAnswer').value); mpSay('Connecting... your friend will appear when the link is up.'); document.getElementById('mpAnswer').value=''; }catch(e){ mpSay('That reply code did not work: '+e.message); } };
document.getElementById('mpJoin').onclick=async()=>{ net.name=document.getElementById('mpName').value.trim()||'Player'; mpSay('Creating reply code...');
  try{ document.getElementById('mpReply').value=await net.join(document.getElementById('mpHostCode').value); mpSay('Send this reply code back to the host. You will join automatically once they paste it.'); }catch(e){ mpSay('That invite code did not work: '+e.message); } };
