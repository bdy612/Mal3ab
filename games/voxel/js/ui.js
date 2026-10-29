'use strict';
// --- HUD ---
const hotbarEl=document.getElementById('hotbar'),debugEl=document.getElementById('debug'),modeTagEl=document.getElementById('modeTag'),invEl=document.getElementById('inv'),barsL=document.querySelector('#bars .l'),barsR=document.querySelector('#bars .r'),handName=document.getElementById('handName'),xpEl=document.getElementById('xp'),bossEl=document.getElementById('boss'),effectsEl=document.getElementById('effects');
function slotEl(s,label,cls){const d=document.createElement('div');d.className='slot'+cls+(s.ench?' ench':'');
  if(s.count>0){const I=ITEMS[s.id];d.style.backgroundImage=`url(${iconURL(s.id)})`;d.title=enchName(s);const cnt=inventory.creative&&I.stack>1?'∞':s.count>1?s.count:'';d.innerHTML=`<b>${label??''}</b><span>${cnt}</span>`;
    if(I.maxDur&&s.dur>0){const f=1-s.dur/I.maxDur;d.innerHTML+=`<i style="--w:${Math.round(f*100)}%;--c:${f>0.5?'#5d5':f>0.25?'#dd5':'#d55'}"></i>`;}}
  else d.innerHTML=label!==undefined?`<b>${label}</b>`:'';return d;}
function buildHotbar(){hotbarEl.style.display=player.spectator||!game.hud?'none':'flex';hotbarEl.innerHTML='';for(let i=0;i<9;i++)hotbarEl.appendChild(slotEl(inventory.slots[i],i+1,i===inventory.sel?' sel':''));const s=selected();handName.textContent=s.count?enchName(s):'';handName.style.opacity=1;clearTimeout(handName._t);handName._t=setTimeout(()=>handName.style.opacity=0,1500);}
function updateHotbar(){buildHotbar();if(uiOpen)refreshUI();}
function updateBars(){ const gm=gameMode(); document.getElementById('cross').style.display=game.hud&&!game.view&&pauseEl.classList.contains('hidden')?'block':'none';
  modeTagEl.innerHTML=!game.hud?'':heldGadgetText()+(gm!=='survival'?`<div style="color:${gm==='creative'?'#8cf':'#ccc'}">${gm==='creative'?'Creative':'Spectator'}</div>`:'')+(difficulty()==='hardcore'&&gm==='survival'?'<div style="color:#f55">Hardcore</div>':'')+(net.role?`<div style="color:#8f8">${net.role==='host'?'Hosting: '+(net.remotes.size+1)+' players':'In '+net.hostName+'\'s world'}</div>`:'');
  if(!game.hud){barsL.textContent='';barsR.textContent='';xpEl.style.display='none';effectsEl.innerHTML='';return;}
  if(gm!=='survival'){barsL.textContent='';barsR.textContent='';xpEl.style.display='none';effectsEl.innerHTML='';bossEl.style.display='none';return;} xpEl.style.display='block';
  const hearts=Array.from({length:10},(_,i)=>player.hp>=i*2+2?'♥':player.hp>=i*2+1?'♡':'·').join(''),ap=armorPoints();
  barsL.innerHTML=(ap?`<span style="color:#ccc">${'■'.repeat(Math.min(10,Math.ceil(ap/2)))}</span>\n`:'')+`<span style="color:${difficulty()==='hardcore'?'#b00;text-shadow:1px 1px 0 #000,0 0 4px #f44':'#f33'}">${hearts}</span>`;
  const food=Array.from({length:10},(_,i)=>player.food>=i*2+2?'●':player.food>=i*2+1?'◐':'·').join('');
  barsR.innerHTML=(player.air<15?`<span style="color:#8cf">${'○'.repeat(Math.ceil(player.air/1.5))}</span>\n`:'')+`<span style="color:#e94">${food}</span>`;
  xpEl.firstElementChild.style.width=Math.round(player.xp/xpNeed(player.level)*100)+'%'; xpEl.lastElementChild.textContent=player.level||'';
  effectsEl.innerHTML=Object.entries(player.effects).map(([k,t])=>`<div style="color:${EFFECTS[k].col}">${EFFECTS[k].name} ${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}</div>`).join('');
  const boss=world.mobs.find(m=>m.def.boss); bossEl.style.display=boss?'block':'none'; if(boss){bossEl.firstElementChild.textContent='Dragon';bossEl.querySelector('i').style.width=Math.max(0,boss.hp/boss.def.hp*100)+'%';} }

// --- container UI (inventory / crafting table / furnace / chest / enchanting / trading) ---
let uiOpen=false;const cursorEl=document.getElementById('cursorStack');const ui={type:null,tile:null,grid:[],gw:0,ench:[],opts:null};
function openUI(type,tile){if(type==='creative'){ui.cgrid=null;}ui.type=type;ui.tile=tile||null;ui.gw=type==='table'?3:type==='inventory'?2:0;ui.grid=Array.from({length:ui.gw*ui.gw},empty);ui.ench=[empty()];ui.opts=null;uiOpen=true;invEl.classList.remove('hidden');refreshUI();document.exitPointerLock();if(tile&&typeof net!=='undefined')net.requestTile(tile);}
function closeUI(relock=true){uiOpen=false;invEl.classList.add('hidden');for(const s of ui.grid.concat(ui.ench))if(s.count){const l=invAdd(s.id,s.count,s.dur,s.ench);if(l)spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],s.id,l,s.dur,null,s.ench);clearStack(s);}
  const c=inventory.cursor;if(c.count){const l=invAdd(c.id,c.count,c.dur,c.ench);if(l)spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],c.id,l,c.dur,null,c.ench);clearStack(c);}cursorEl.classList.add('hidden');buildHotbar();scheduleSave();if(relock&&!player.dead)resumeGame();}
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
function mkSlot(arr,i,opt,label){const d=slotEl(arr[i],label,'');d.onmousedown=e=>{e.preventDefault();slotClick(arr,i,opt,e);if(arr===ui.ench)ui.opts=null;refreshUI();buildHotbar();scheduleSave();if(ui.tile&&typeof net!=='undefined')net.sendTile(ui.tile);};d.oncontextmenu=e=>e.preventDefault();return d;}
function recRow(iconId,title,sub,ok,onclick){const d=document.createElement('div');d.className='rec'+(ok?' ok':'');d.innerHTML=`<div class="ic" style="background-image:url(${iconURL(iconId)})"></div><div>${title}<small>${sub}</small></div>`;if(onclick)d.onclick=()=>{if(ok)onclick();};else d.style.cursor='default';return d;}
function refreshUI(){
  const main=document.getElementById('uiMain'),side=document.getElementById('uiSide');main.innerHTML='';side.innerHTML='';
  const invQuick={quick:s=>{ const i=inventory.slots.indexOf(s);
    if(ui.type==='chest')moveStack(s,ui.tile.slots); else if(ui.type==='furnace'){ if(SMELT[s.id]||!FUEL[s.id])moveStack(s,[ui.tile.inp]); else moveStack(s,[ui.tile.fuel]); } else if(ui.type==='enchant'&&itemKind(ITEMS[s.id])){moveStack(s,ui.ench);ui.opts=null;}
    else if(ui.type==='brew'){ if(BREW[s.id])moveStack(s,[ui.tile.ing]); else if(s.id===BLAZE_POWDER)moveStack(s,[ui.tile.fuel]); else if(ITEMS[s.id].drink)moveStack(s,ui.tile.bottles); }
    else if(ITEMS[s.id].armor&&!inventory.armor[ITEMS[s.id].armor.slot].count)moveStack(s,[inventory.armor[ITEMS[s.id].armor.slot]]);
    else moveStack(s,i<9?inventory.slots.slice(9):inventory.slots.slice(0,9)); }};
  const h=t=>{const e=document.createElement('h4');e.textContent=t;return e;},grid=()=>{const g=document.createElement('div');g.className='grid';return g;};
  if(ui.type==='creative'){ creativeUI(main,side,h,invQuick); return; }
  if(ui.type==='inventory'&&inventory.creative){ const b=document.createElement('button');b.textContent='◀ Back to creative items';b.style.marginBottom='8px';b.onclick=()=>openUI('creative');main.appendChild(b); }
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
    const shelves=countShelves(ui.tile); rc.appendChild(recRow(BOOKSHELF,`Bookshelves: ${shelves}/15`,'Put bookshelves two blocks around the table for stronger enchantments',true,null));
    if(s.count){ if(!ui.opts)ui.opts=enchOptions(s,shelves); for(const o of ui.opts){ const ok=player.level>=o.cost||inventory.creative; rc.appendChild(recRow(s.id,`${o.name} ${ROMAN[o.lvl]}`,`costs ${o.cost} level${o.cost>1?'s':''}`,ok,()=>{applyEnchant(s,o);if(inventory.creative)player.level+=o.cost;ui.opts=null;refreshUI();buildHotbar();scheduleSave();})); } }
    else { const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb';p.textContent='Sharpness (swords) · Efficiency (tools) · Unbreaking · Protection (armor) · Power (bows) · Fortune (pickaxes). Earn levels by mining ores, smelting and killing mobs.';rc.appendChild(p);} }
  else if(ui.type==='brew'){ side.appendChild(h('Brewing'));
    for(const [ing,map] of Object.entries(BREW))for(const [base,res] of Object.entries(map))rc.appendChild(recRow(res,ITEMS[res].name,ITEMS[base].name+' + '+ITEMS[ing].name,true,null));
    const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb;margin-top:6px';p.textContent='Fill glass bottles from water (right-click), brew nether wart into them for awkward potions, then add an ingredient. Each blaze powder fuels 20 brews.';rc.appendChild(p); }
  else if(ui.type==='trade'){ side.appendChild(h('Trades')); for(const t of ui.tile.trades){ const ok=inventory.creative||t.in.every(([id,n])=>invCount(id)>=n);
      rc.appendChild(recRow(t.out[0],`${ITEMS[t.out[0]].name}${t.out[1]>1?' ×'+t.out[1]:''}`,'for '+t.in.map(([id,n])=>n+'× '+ITEMS[id].name).join(', '),ok,()=>{if(!inventory.creative)for(const [id,n] of t.in)invRemove(id,n);invAdd(t.out[0],t.out[1]);addXp(2);sfx.craft();refreshUI();buildHotbar();scheduleSave();})); } }
  side.appendChild(rc);
  const c=inventory.cursor;cursorEl.classList.toggle('hidden',c.count===0);if(c.count){cursorEl.style.backgroundImage=`url(${iconURL(c.id)})`;cursorEl.firstElementChild.textContent=c.count>1?c.count:'';}
}
// --- creative inventory: every item, by category, with search ---
const CTABS=[['all','All'],['build','Building'],['nature','Nature'],['redstone','Redstone'],['tools','Tools & combat'],['food','Food & potions'],['misc','Materials']];
let creativeIds=null;
function itemCat(id){ const I=ITEMS[id];
  if(id<256){ if(RS[id]||id===TNT||id===REDSTONE_BLOCK||PISTON_BODY.has(id)||id===LAMP_OFF)return 'redstone';
    if(PLANT[id]||[GRASS,DIRT,SAND,GRAVEL,LOG,LEAVES,SNOW,STONE,COAL_ORE,IRON_ORE,GOLD_ORE,DIAMOND_ORE,EMERALD_ORE,REDSTONE_ORE,QUARTZ_ORE,NETHERRACK,SOUL_SAND,GLOWSTONE,END_STONE,OBSIDIAN,BEDROCK].includes(id))return 'nature'; return 'build'; }
  if(I.tool||I.armor||I.bow||I.shears||I.igniter||id===ARROW||I.bucket!==undefined)return 'tools'; if(I.food||I.drink||id===BOTTLE)return 'food';
  if(id===REDSTONE||id===REPEATER)return 'redstone'; if(id===SEEDS||id===BONE_MEAL||id===CANE||id===WART)return 'nature'; if(id===DOOR)return 'build'; return 'misc'; }
function allItemIds(){ if(!creativeIds)creativeIds=Object.keys(ITEMS).map(Number).filter(i=>i>0&&ITEMS[i].name&&!(BLOCKS[i]&&BLOCKS[i].noItem)&&!LIQ[i]); return creativeIds; }
function creativeUI(main,side,h,invQuick){
  ui.ctab=ui.ctab||'all';
  const tabs=document.createElement('div');tabs.className='ctabs';
  for(const [k,n] of CTABS){ const b=document.createElement('button');b.textContent=n;if(ui.ctab===k)b.className='on';b.onclick=()=>{ui.ctab=k;refreshUI();};tabs.appendChild(b); }
  const inv=document.createElement('button');inv.textContent='Survival inventory ▶';inv.onclick=()=>openUI('inventory');tabs.appendChild(inv);
  main.appendChild(h('Creative inventory'));main.appendChild(tabs);
  const q=document.createElement('input');q.className='csearch';q.placeholder='Search items...';q.value=ui.cq||'';main.appendChild(q);
  const g=document.createElement('div');g.className='grid cgrid';main.appendChild(g);
  const fill=()=>{ g.innerHTML=''; const text=(ui.cq||'').toLowerCase(); const ids=allItemIds().filter(i=>(text?ITEMS[i].name.toLowerCase().includes(text):ui.ctab==='all'||itemCat(i)===ui.ctab));
    for(const id of ids){ const s={id,count:1}; const d=slotEl(s,undefined,''); d.querySelector('span')&&(d.querySelector('span').textContent=''); d.title=ITEMS[id].name;
      d.onmousedown=e=>{ e.preventDefault(); const c=inventory.cursor,max=ITEMS[id].stack;
        if(c.count){ if(c.id===id&&e.button!==2){c.count=Math.min(max,c.count+(e.shiftKey?max:1));} else clearStack(c); }
        else if(e.shiftKey){ invAdd(id,max); buildHotbar(); }
        else { c.id=id; c.count=e.button===2?1:max; c.dur=0; c.ench=undefined; }
        refreshCursor(); buildHotbar(); refreshHotbarRow(); };
      d.oncontextmenu=e=>e.preventDefault(); g.appendChild(d); }
    if(!ids.length){ const p=document.createElement('div');p.style.cssText='grid-column:1/-1;color:#aaa;padding:10px';p.textContent='No items found.';g.appendChild(p); } };
  q.oninput=()=>{ ui.cq=q.value; fill(); }; q.onkeydown=e=>e.stopPropagation(); fill();
  main.appendChild(h('Hotbar  (click the red slot with an item to delete it)'));
  const row=document.createElement('div');row.className='row';const hg=grid9();row.appendChild(hg);
  const trash=document.createElement('div');trash.className='slot';trash.style.cssText='width:36px;height:36px;cursor:pointer;border-color:#a33;background:#3a1a1a';trash.title='Delete item';trash.innerHTML='<b style="font-size:16px;left:11px;top:6px">✕</b>';
  trash.onmousedown=e=>{e.preventDefault(); if(e.shiftKey){ for(const s of inventory.slots)clearStack(s); buildHotbar(); refreshHotbarRow(); } clearStack(inventory.cursor); refreshCursor();};row.appendChild(trash); main.appendChild(row);
  function grid9(){ const g=document.createElement('div');g.className='grid';return g; }
  function refreshHotbarRow(){ hg.innerHTML=''; for(let i=0;i<9;i++){ const d=mkSlot(inventory.slots,i,{quick:s=>clearStack(s)},i+1); hg.appendChild(d); } }
  refreshHotbarRow();
  const b=document.createElement('button');b.textContent='Close (E)';b.style.marginTop='10px';b.onclick=()=>closeUI();main.appendChild(b);
  side.appendChild(h('How it works'));
  const p=document.createElement('div');p.style.cssText='font-size:12px;color:#bbb;width:240px;line-height:1.6';
  p.innerHTML='Click an item: take a full stack<br>Right-click: take one<br>Shift-click: straight into your inventory<br>Drop items on the hotbar below<br>Click the ✕ slot to delete what you hold<br>Shift-click ✕: clear the whole inventory<br><br>In the world: middle-click a block to pick it.';
  side.appendChild(p); refreshCursor(); }
function refreshCursor(){ const c=inventory.cursor;cursorEl.classList.toggle('hidden',c.count===0);if(c.count){cursorEl.style.backgroundImage=`url(${iconURL(c.id)})`;cursorEl.firstElementChild.textContent=c.count>1?c.count:'';} }
function updateFurnaceUI(){if(uiOpen&&ui.type==='brew'){const t=ui.tile,e=document.getElementById('brewP');if(e)e.textContent=(t.t>0?Math.round(t.t/BREW_TIME*100)+'% ':'')+'→'+(t.fuelLeft?' ('+t.fuelLeft+')':'');return;}if(!uiOpen||ui.type!=='furnace')return;const t=ui.tile,f=document.getElementById('fireP'),c=document.getElementById('cookP');if(f)f.textContent=t.burnT>0?'🔥 '+Math.round(t.burnT/t.burnMax*100)+'%':'—';if(c)c.textContent=t.cookT>0?Math.round(t.cookT/SMELT_TIME*100)+'% →':'→';}
function fillRecipe(rc){ for(const s of ui.grid)if(s.count){invAdd(s.id,s.count,s.dur,s.ench);clearStack(s);}
  const r=rc.r,gw=ui.gw;const take=id=>{if(inventory.creative)return id;for(const v of plankVariants(id))if(invCount(v)>=1){invRemove(v,1);return v;}return 0;};
  if(r.pat){for(let y=0;y<r.pat.length;y++)for(let x=0;x<r.pat[0].length;x++){const ch=r.pat[y][x];if(ch===' ')continue;const got=take(r.key[ch]);if(got){const cell=ui.grid[y*gw+x];cell.id=got;cell.count=1;}}}
  else{r.in.forEach((id,i)=>{const got=take(id);if(got){const cell=ui.grid[i];cell.id=got;cell.count=1;}});} }
document.addEventListener('mousemove',e=>{if(uiOpen){cursorEl.style.left=(e.clientX-18)+'px';cursorEl.style.top=(e.clientY-18)+'px';}});

// --- input ---
let locked=false,mouseDown=[false,false,false],nextPlace=0,lastW=0;
const typing=e=>{ const t=e.target; return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable); };
canvas.addEventListener('click',()=>{audio();if(game.state==='playing'&&!locked&&!uiOpen&&!player.dead)resumeGame();});
document.addEventListener('pointerlockchange',()=>{ locked=document.pointerLockElement===canvas;
  if(locked){ game.paused=false; pauseEl.classList.add('hidden'); screenCleanup(); }
  else{ for(const k in keys)keys[k]=false; mouseDown=[false,false,false]; player.sprint=false;
    if(game.state==='playing'&&!uiOpen&&!player.dead&&!chatOpen&&mpEl.classList.contains('hidden'))openPause(); } });
document.addEventListener('mousemove',e=>{if(!locked)return;const s=0.0025*SETTINGS.sens;player.yaw-=e.movementX*s;player.pitch=clamp(player.pitch-e.movementY*s*(SETTINGS.invert?-1:1),-Math.PI/2+0.01,Math.PI/2-0.01);});
document.addEventListener('mousedown',e=>{if(!locked||player.dead)return;mouseDown[e.button]=true;if(player.spectator)return;
  if(e.button===0)attack(world);if(e.button===2){useItem(world);nextPlace=performance.now()+300;}
  if(e.button===1&&inventory.creative){ e.preventDefault(); const h=currentHit(world); if(h){ const id=pickId(h.block); if(id){ const at=inventory.slots.findIndex((s,i)=>i<9&&s.id===id&&s.count); if(at>=0)inventory.sel=at; else{ const s=selected(); s.id=id; s.count=ITEMS[id].stack>1?64:1; s.dur=0; s.ench=undefined; } updateHotbar(); } } } });
document.addEventListener('mouseup',e=>{mouseDown[e.button]=false;});document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('wheel',e=>{if(!locked||player.spectator)return;inventory.sel=(inventory.sel+(e.deltaY>0?1:-1)+9)%9;updateHotbar();});
// middle click: which item a block in the world comes from
function pickId(b){ const m={[WIRE_ON]:REDSTONE,[WIRE_OFF]:REDSTONE,[RTORCH_OFF]:RTORCH_ON,[LEVER_ON]:LEVER_OFF,[BUTTON_ON]:BUTTON,[PLATE_ON]:PLATE,[LAMP_ON]:LAMP_OFF,[REPEATER_ON]:REPEATER,[REPEATER_OFF]:REPEATER,
  [FURNACE_LIT]:FURNACE,[FLOW_WATER]:WATER_BUCKET,[WATER]:WATER_BUCKET,[FLOW_LAVA]:LAVA_BUCKET,[LAVA]:LAVA_BUCKET,[FARMLAND_WET]:FARMLAND,[PISTON_EXT]:PISTON,[STICKY_EXT]:STICKY,[WHEAT0]:SEEDS,[WHEAT1]:SEEDS,[WHEAT2]:SEEDS,[WHEAT3]:SEEDS,
  [SUGAR_CANE]:CANE,[WART0]:WART,[WART1]:WART,[WART2]:WART}; if(isDoor(b))return DOOR; const id=m[b]??b; return ITEMS[id]&&!(BLOCKS[id]&&BLOCKS[id].noItem)?id:0; }
document.addEventListener('keydown',e=>{
  if(chatOpen){ if(e.code==='Escape'){closeChat();} return; }
  if(typing(e))return;
  if(game.state!=='playing')return;
  if(e.code==='Escape'&&!pauseEl.classList.contains('hidden')){ e.preventDefault(); if(pauseBack())return; resumeGame(); return; }
  if(e.code==='F1'){ e.preventDefault(); game.hud=!game.hud; buildHotbar(); updateBars(); return; }
  if(e.code==='F3'){ e.preventDefault(); game.debug=!game.debug; debugEl.style.display=game.debug?'block':'none'; return; }
  if(e.code==='F5'){ e.preventDefault(); game.view=(game.view+1)%3; return; }
  if(e.code==='KeyE'&&!player.dead&&!player.spectator){if(uiOpen)closeUI();else if(locked)openUI(inventory.creative?'creative':'inventory');e.preventDefault();return;}
  if((e.code==='KeyT'||e.code==='Slash')&&locked){ e.preventDefault(); openChat(e.code==='Slash'?'/':''); return; }
  if(e.code==='Escape'&&uiOpen){closeUI();return;}
  if(!locked)return;keys[e.code]=true;
  if(e.code==='KeyW'&&!e.repeat){const now=performance.now();if(now-lastW<300&&player.food>6)player.sprint=true;lastW=now;}
  if(e.code.startsWith('Digit')){const n=parseInt(e.code[5]);if(n>=1&&n<=9){inventory.sel=n-1;updateHotbar();}}
  if(e.code==='KeyQ'&&!e.repeat&&!player.spectator)dropHeld();
  if(e.code==='KeyF'&&inventory.creative){player.fly=!player.fly;player.vel[1]=0;}
  if(e.code==='KeyG'&&!e.repeat){ if(!cheatsOn()){showMsg('Cheats are off in this world.');} else { const m=gameMode()==='survival'?'creative':'survival'; setGameMode(m); showMsg('Game mode: '+m); } }
  if(['Space','ShiftLeft','ControlLeft','Tab','F1','F3','F5'].includes(e.code))e.preventDefault();
});
document.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('beforeunload',()=>saveWorld());document.addEventListener('visibilitychange',()=>{if(document.hidden)saveWorld();});

// --- chat & commands ---
let chatOpen=false; const chatLog=[], chatLogEl=document.getElementById('chatLog'), chatInput=document.getElementById('chatInput');
function addChat(text,col){ chatLog.push({text,col:col||'#fff',t:performance.now()}); if(chatLog.length>50)chatLog.shift(); renderChat(); }
function renderChat(){ const now=performance.now(); chatLogEl.innerHTML=chatLog.filter(m=>chatOpen||now-m.t<10000).slice(-8).map(m=>`<div style="color:${m.col}">${m.text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>`).join(''); }
function openChat(prefix){ chatOpen=true; chatInput.classList.remove('hidden'); chatInput.value=prefix; document.exitPointerLock(); setTimeout(()=>chatInput.focus(),0); renderChat(); }
function closeChat(){ chatOpen=false; chatInput.classList.add('hidden'); chatInput.blur(); renderChat(); resumeGame(); }
chatInput.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'){ const t=chatInput.value.trim(); if(t){ if(t[0]==='/'){ const r=runCommand(t); if(r)addChat(r,'#ffd'); } else net.chat(t); } closeChat(); } else if(e.key==='Escape')closeChat(); });
function findItem(q){ q=q.toLowerCase().replace(/_/g,' '); const ids=Object.keys(ITEMS).map(Number).filter(i=>!(BLOCKS[i]&&BLOCKS[i].noItem)&&ITEMS[i].name);
  return ids.find(i=>ITEMS[i].name.toLowerCase()===q||String(i)===q)??ids.find(i=>ITEMS[i].name.toLowerCase().startsWith(q))??ids.find(i=>ITEMS[i].name.toLowerCase().includes(q)); }
function setTimeOfDay(w){ const t={sunrise:0.0,day:0.08,morning:0.08,noon:0.25,sunset:0.48,night:0.62,midnight:0.75}[w]; if(t===undefined)return false; dayTime=t; net.sendTime(); return true; }
const NO_CHEAT_CMDS=new Set(['help','seed','list','me']);
function runCommand(cmd){ const a=cmd.slice(1).trim().split(/\s+/),c=(a[0]||'').toLowerCase(), host=!net.guest;
  if(c==='help'||!c)return cheatsOn()?'Commands: /gamemode survival|creative|spectator · /time set day|noon|night · /daylight on|off · /difficulty <name> · /gamerule keepInventory|mobSpawning|daylight true|false · /give <item> [count] · /tp x y z · /effect night_vision|clear · /heal · /kill · /locate stronghold|fortress|village|temple · /weather clear|rain|thunder · /spawn · /seed · /list'
    :'Commands: /seed · /list · /me <action>.  Cheats are off in this world, so other commands are disabled.';
  if(c==='seed')return 'Seed: '+SEED;
  if(c==='list')return 'Players: '+[net.name].concat([...net.remotes.values()].map(r=>r.name)).join(', ');
  if(c==='me'){ const t=a.slice(1).join(' '); if(t)net.chat('* '+t); return ''; }
  if(!cheatsOn())return 'Cheats are off in this world. (Turn them on in Edit World from the world list.)';
  if(c==='gamemode'||c==='gm'){ const v=(a[1]||'').toLowerCase(); const m=/^(c|creative|1)$/.test(v)?'creative':/^(sp|spectator|3)$/.test(v)?'spectator':/^(s|survival|0)$/.test(v)?'survival':null;
    if(!m)return 'Usage: /gamemode survival|creative|spectator'; setGameMode(m); return 'Game mode: '+m; }
  if(c==='time'){ if(!host)return 'Only the host can change the time.'; const w=(a[1]==='set'?a[2]:a[1])||'day'; if(!setTimeOfDay(w))return 'Usage: /time set day|noon|sunset|night|midnight'; return 'Time set to '+w; }
  if(c==='daylight'){ if(!host)return 'Only the host can change that.'; game.meta.rules.daylight=!/^(off|false|0)$/i.test(a[1]||''); saveIndex(); net.sendMeta(); return 'Daylight cycle '+(game.meta.rules.daylight?'on':'off (time stands still)'); }
  if(c==='gamerule'){ if(!host)return 'Only the host can change game rules.'; const map={keepinventory:'keepInv',mobspawning:'mobSpawn',domobspawning:'mobSpawn',daylight:'daylight',dodaylightcycle:'daylight'},k=map[(a[1]||'').toLowerCase()];
    if(!k)return 'Game rules: keepInventory, mobSpawning, daylight'; if(a[2]===undefined)return `${a[1]} = ${rule(k)}`; game.meta.rules[k]=/^(true|on|1)$/i.test(a[2]); saveIndex(); net.sendMeta(); return `${RULE_NAMES[k]}: ${game.meta.rules[k]?'on':'off'}`; }
  if(c==='difficulty'){ if(!host)return 'Only the host can change the difficulty.'; const d=(a[1]||'').toLowerCase(); if(!['peaceful','easy','normal','hard'].includes(d))return 'Usage: /difficulty peaceful|easy|normal|hard'; game.meta.diff=d; saveIndex(); net.sendMeta(); return 'Difficulty: '+DIFF_NAMES[d]; }
  if(c==='effect'){ const v=(a[1]||'').toLowerCase(); if(v==='clear'){player.effects={};player.nightVision=false;return 'Effects cleared';} if(/night/.test(v)){player.nightVision=!player.nightVision;return 'Night vision '+(player.nightVision?'on':'off');}
    const k=Object.keys(EFFECTS).find(n=>n!=='heal'&&(n===v||EFFECTS[n].name.toLowerCase().includes(v))); if(!k)return 'Usage: /effect night_vision|speed|strength|regen|fire|clear'; applyEffect(k); return 'Gave '+EFFECTS[k].name; }
  if(c==='heal'){ player.hp=20; player.food=20; player.air=15; return 'Healed and fed'; }
  if(c==='kill'){ player.invuln=0; const wasC=inventory.creative; inventory.creative=false; player.spectator=false; damagePlayer(1000,true,'void'); inventory.creative=wasC; return ''; }
  if(c==='tp'){ const v=a.slice(1,4).map(Number); if(v.length<3||v.some(isNaN))return 'Usage: /tp x y z'; player.pos=v; player.vel=[0,0,0]; player.fallPeak=v[1]; return `Teleported to ${v.join(' ')}`; }
  if(c==='give'){ let n=1,parts=a.slice(1); if(parts.length>1&&/^\d+$/.test(parts[parts.length-1]))n=+parts.pop(); const id=findItem(parts.join(' ')); if(id===undefined)return 'Unknown item: '+parts.join(' ');
    const left=invAdd(id,n); updateHotbar(); return `Gave ${n-left} × ${ITEMS[id].name}`; }
  if(c==='locate'){ const what=(a[1]||'').toLowerCase();
    if(what.startsWith('strong')){ const p=dims.over.gen.portalCenter; return p?`Stronghold (Overworld): ${p[0]} ${p[1]} ${p[2]}`:'This world has no stronghold.'; }
    if(what.startsWith('fort')){ const s=world.dim==='nether'?1:1/8, f=dims.nether.gen.fortressCenterNear(player.pos[0]*s,player.pos[2]*s); return f?`Nearest fortress (Nether coords): ${f[0]} ${f[1]} ${f[2]}`:'No fortress nearby'; }
    if(what.startsWith('vill')){ const g=dims.over.gen; if(g.flat)return 'Superflat worlds have no villages.'; const pcx=Math.floor(player.pos[0]/16),pcz=Math.floor(player.pos[2]/16); let best=null,bd=1e9;
      for(let rx=Math.floor(pcx/8)-4;rx<=Math.floor(pcx/8)+4;rx++)for(let rz=Math.floor(pcz/8)-4;rz<=Math.floor(pcz/8)+4;rz++){ const v=g.villageCenter(rx*8,rz*8); if(!v)continue; const d=Math.hypot(v[0]-pcx,v[1]-pcz); if(d<bd){bd=d;best=v;} }
      return best?`Village near ${best[0]*16+8} ~ ${best[1]*16+8} (it may be in a desert or the sea, keep looking)`:'No village found nearby'; }
    if(what.startsWith('temp')){ const g=dims.over.gen; if(g.flat)return 'Superflat worlds have no temples.'; const pcx=Math.floor(player.pos[0]/16),pcz=Math.floor(player.pos[2]/16); let best=null,bd=1e9;
      for(let r=0;r<=48&&!best;r++)for(let a=-r;a<=r;a++)for(const [cx,cz] of [[pcx+a,pcz-r],[pcx+a,pcz+r],[pcx-r,pcz+a],[pcx+r,pcz+a]]){ if(hash3(cx,cz,95)>=0.03||g.villageCenter(cx,cz))continue; const c=g.column(cx*16+7,cz*16+7); if(c.biome!==BIOME.DESERT||c.h<=SEA_LEVEL+2)continue; const d=Math.hypot(cx-pcx,cz-pcz); if(d<bd){bd=d;best=[cx*16+7,c.h,cz*16+7];} }
      return best?`Desert temple at ${best[0]} ${best[1]} ${best[2]}`:'No desert temple nearby'; }
    return 'Usage: /locate stronghold|fortress|village|temple'; }
  if(c==='weather'){ if(!host)return 'Only the host can change the weather.'; const W=weatherState(),v=(a[1]||'clear').toLowerCase(); W.on=v!=='clear'; W.thunder=v==='thunder'; W.t=v==='clear'?600:300; net.sendWeather(); return 'Weather: '+v; }
  if(c==='spawn'){ if(world.dim!=='over')world=dims.over; player.pos=[...player.spawn]; player.vel=[0,0,0]; return 'Back at spawn'; }
  return 'Unknown command. Type /help'; }

// --- "connect with codes" panel (fallback when friend codes can't be used) ---
const mpEl=document.getElementById('mp'),mpStatus=document.getElementById('mpStatus');
function mpSay(t){ mpStatus.textContent=t; }
function openCodesPanel(){ mpEl.classList.remove('hidden'); mpSay(''); document.exitPointerLock(); }
document.getElementById('mpClose').addEventListener('click',()=>{ mpEl.classList.add('hidden'); if(game.state==='playing'&&!locked&&!player.dead)openPause(); });
const copy=id=>{ const t=document.getElementById(id); t.select(); try{navigator.clipboard.writeText(t.value);}catch(e){document.execCommand('copy');} mpSay('Copied! Send it to your friend (WhatsApp, Discord, email...).'); };
document.getElementById('mpCopyOffer').onclick=()=>copy('mpOffer'); document.getElementById('mpCopyReply').onclick=()=>copy('mpReply');
document.getElementById('mpInvite').onclick=async()=>{ net.name=PROFILE.name; mpSay('Creating invite code...');
  try{ document.getElementById('mpOffer').value=await net.hostInvite(); mpSay('Send this invite code to your friend, then paste their reply code below.'); }catch(e){ mpSay('Could not create invite: '+e.message); } };
document.getElementById('mpAccept').onclick=async()=>{ try{ await net.hostAccept(document.getElementById('mpAnswer').value); mpSay('Connecting... your friend will appear when the link is up.'); document.getElementById('mpAnswer').value=''; }catch(e){ mpSay('That reply code did not work: '+e.message); } };
document.getElementById('mpJoin').onclick=async()=>{ net.name=PROFILE.name; if(game.state==='playing'&&game.meta&&!game.meta.remote){ mpSay('Quit your world to the title screen first, then join from Friends → Connect with codes.'); return; } mpSay('Creating reply code...');
  try{ document.getElementById('mpReply').value=await net.join(document.getElementById('mpHostCode').value); mpSay('Send this reply code back to the host. You will join automatically once they paste it.'); }catch(e){ mpSay('That invite code did not work: '+e.message); } };
