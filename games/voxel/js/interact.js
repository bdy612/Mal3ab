'use strict';
// ---------------------------------------------------------------------
// BLOCK INTERACTION: mining, placing, using
// ---------------------------------------------------------------------
const REACH=5,mining={target:null,progress:0,cool:0,stage:0,hit:null};
function currentHit(world,liquids){const f=forwardVec();return raycast(world,player.pos[0],player.pos[1]+EYE,player.pos[2],f[0],f[1],f[2],REACH,liquids);}
function mobHit(world){const f=forwardVec(),o=[player.pos[0],player.pos[1]+EYE,player.pos[2]];let best=null,bt=4.5;for(const m of world.mobs){const t=rayAABB(o[0],o[1],o[2],f[0],f[1],f[2],m.pos[0]-m.w,m.pos[1],m.pos[2]-m.w,m.pos[0]+m.w,m.pos[1]+m.h,m.pos[2]+m.w);if(t>=0&&t<bt){bt=t;best=m;}}return best;}
function miningTime(b){ const B=BLOCKS[b];if(!isFinite(B.hardness))return Infinity;if(inventory.creative)return 0; const s=selected(),tool=heldItem(),match=tool&&tool.tool===B.tool,tier=match?tool.tier:0,speed=match?tool.speed*(1+0.3*(s.ench&&s.ench.Efficiency||0)):1;
  if(B.tool==='pick'&&B.tier>tier)return B.hardness*1.5*5; if(match)return B.hardness*1.5/speed; return B.hardness*1.5; }
function canDrop(b){const B=BLOCKS[b];if(B.tool!=='pick'||B.tier===0)return true;const tool=heldItem();return !!tool&&tool.tool==='pick'&&tool.tier>=B.tier;}
function updateMining(world,dt,active){
  mining.cool=Math.max(0,mining.cool-dt);
  if(!active||mining.cool>0){mining.target=null;mining.progress=0;return;}
  const h=currentHit(world);if(!h){mining.target=null;mining.progress=0;return;}
  const k=h.x+','+h.y+','+h.z;if(mining.target!==k){mining.target=k;mining.progress=0;} const need=miningTime(h.block);if(!isFinite(need))return;
  mining.progress+=dt; mining.stage=need?Math.min(9,Math.floor(mining.progress/need*10)):9; mining.hit=h; player.swing=1; if(Math.random()<dt*6)sfx.dig();
  if(mining.progress>=need){ const b=h.block;
    if(world.setBlock(h.x,h.y,h.z,AIR)){ sfx.break(); if(!inventory.creative){ if(canDrop(b))dropBlockLoot(b,h.x,h.y,h.z); const s=selected(); if(s.count&&ITEMS[s.id].tool)damageTool(s,ITEMS[s.id].tool==='sword'?2:1); } player.exhaust+=0.005;scheduleSave(); }
    mining.target=null;mining.progress=0;mining.cool=inventory.creative?0.2:(BLOCKS[b].hardness===0?0.15:0.05); }
}
let attackCd=0;
function attack(world){ if(attackCd>0)return;const m=mobHit(world);if(!m)return;const s=selected(),tool=heldItem(),dmg=(tool&&tool.dmg?tool.dmg:1)+(s.ench&&s.ench.Sharpness||0)+(hasFx('strength')?3:0);
  const dx=m.pos[0]-player.pos[0],dz=m.pos[2]-player.pos[2],l=Math.hypot(dx,dz)||1; hurtMob(world,m,dmg,m.def.boss?null:[dx/l*6,5,dz/l*6]); if(tool&&tool.tool)damageTool(s,tool.tool==='sword'?1:2); attackCd=0.4;player.exhaust+=0.1;player.swing=1; }

// --- placement rules ---
const SOIL=new Set([GRASS,DIRT,FARMLAND,FARMLAND_WET]);
function waterNear(x,y,z,r){ for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let dy=0;dy<=1;dy++)if(isWater(world.getBlock(x+dx,y+dy,z+dz)))return true; return false; }
function canStay(id,meta,x,y,z){ const below=world.getBlock(x,y-1,z),sup=SUPPORT[id];
  if(sup===1)return !!SOLID[below];
  if(sup===2){const d=DIRV[meta&7];return !!SOLID[world.getBlock(x+d[0],y+d[1],z+d[2])];}
  if(sup===4)return below===DOOR_B||below===DOOR_B_O;
  if(sup===3){
    if(id>=WHEAT0&&id<=WHEAT3)return below===FARMLAND||below===FARMLAND_WET;
    if(id>=WART0&&id<=WART2)return below===SOUL_SAND;
    if(id===SUGAR_CANE){ if(below===SUGAR_CANE)return true; if(below!==GRASS&&below!==DIRT&&below!==SAND)return false; return [[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>isWater(world.getBlock(x+a,y-1,z+c))); }
    return SOIL.has(below); }
  return true; }
function placeMeta(id,h){ const dt=DIRTYPE[id];
  if(id===REPEATER_OFF)return lookDirH();
  if(isDoor(id))return lookDirH();
  if(id===LEVER_OFF||id===BUTTON){ const n=[h.nx,h.ny,h.nz]; return DIRV.findIndex(d=>d[0]===-n[0]&&d[1]===-n[1]&&d[2]===-n[2]); }
  if(dt===1)return OPP[lookDirH()];
  if(dt===2)return OPP[lookDir6()];
  return 0; }
function blockedByEntity(tx,ty,tz){ const p=player.pos; if(tx+1>p[0]-0.3&&tx<p[0]+0.3&&ty+1>p[1]&&ty<p[1]+1.8&&tz+1>p[2]-0.3&&tz<p[2]+0.3)return true;
  for(const m of world.mobs){if(tx+1>m.pos[0]-m.w&&tx<m.pos[0]+m.w&&ty+1>m.pos[1]&&ty<m.pos[1]+m.h&&tz+1>m.pos[2]-m.w&&tz<m.pos[2]+m.w)return true;} return false; }
function targetCell(h){ return REPLACE[h.block]&&!LIQ[h.block]?[h.x,h.y,h.z]:[h.x+h.nx,h.y+h.ny,h.z+h.nz]; }
function placeHeld(h){ const s=selected(),it=ITEMS[s.id]; if(!it||!it.places)return false; const id=it.places;
  const [tx,ty,tz]=targetCell(h),existing=world.getBlock(tx,ty,tz); if(!(existing===AIR||REPLACE[existing]))return false;
  if((SUPPORT[id]===2)&&(!SOLID[h.block]))return false;
  const meta=placeMeta(id,h);
  if(SOLID[id]&&blockedByEntity(tx,ty,tz))return false;
  if(!canStay(id,meta,tx,ty,tz)){ if(id===SUGAR_CANE)showMsg('Sugar cane needs water right next to the block it grows on.'); return false; }
  if(isDoor(id)){ const up=world.getBlock(tx,ty+1,tz); if(!(up===AIR||REPLACE[up])||blockedByEntity(tx,ty,tz)||blockedByEntity(tx,ty+1,tz))return false;
    world.setBlock(tx,ty,tz,DOOR_B,true,meta); world.setBlock(tx,ty+1,tz,DOOR_T,true,meta); }
  else if(!world.setBlock(tx,ty,tz,id,true,meta))return false;
  sfx.place(); player.swing=1; if(!inventory.creative)consumeHeld(); updateHotbar(); scheduleSave(); return true; }

// --- doors, levers, buttons ---
function toggleDoor(x,y,z,open){ let b=world.getBlock(x,y,z); if(b===DOOR_T||b===DOOR_T_O){y--;b=world.getBlock(x,y,z);} if(b!==DOOR_B&&b!==DOOR_B_O)return;
  const isOpen=b===DOOR_B_O, want=open===undefined?!isOpen:open; if(want===isOpen)return; const m=world.getMeta(x,y,z),mt=world.getMeta(x,y+1,z);
  doorBusy=true; world.setBlock(x,y,z,want?DOOR_B_O:DOOR_B,true,m); if(isDoor(world.getBlock(x,y+1,z)))world.setBlock(x,y+1,z,want?DOOR_T_O:DOOR_T,true,mt); doorBusy=false; sfx.place(); }
let doorBusy=false;
function interactBlock(h){ const b=h.block,x=h.x,y=h.y,z=h.z,m=world.getMeta(x,y,z);
  if(b===CRAFTING_TABLE){openUI('table');return true;} if(b===CHEST){openUI('chest',getTile(x,y,z,b));return true;}
  if(b===FURNACE||b===FURNACE_LIT){openUI('furnace',getTile(x,y,z,b));return true;} if(b===BREWING_STAND){openUI('brew',getTile(x,y,z,b));return true;}
  if(b===ENCHANT_TABLE){openUI('enchant');return true;} if(b===BED){sleep(h);return true;}
  if(b===LEVER_OFF||b===LEVER_ON){ world.setBlock(x,y,z,b===LEVER_OFF?LEVER_ON:LEVER_OFF,true,m); sfx.place(); return true; }
  if(b===BUTTON){ world.setBlock(x,y,z,BUTTON_ON,true,m); world.timers.push({x,y,z,t:world.time+1,kind:'button'}); sfx.place(); return true; }
  if(b===BUTTON_ON)return true;
  if(b===REPEATER_OFF||b===REPEATER_ON){ const d=((m>>3)+1)&3; world.setBlock(x,y,z,b,true,(m&7)|d<<3); showMsg('Repeater delay: '+(d+1)+' tick'+(d?'s':'')); return true; }
  if(isDoor(b)){ toggleDoor(x,y,z); return true; }
  return false; }

let bowCd=0;
function useItem(world){
  const s=selected(),it=s.count>0?ITEMS[s.id]:null,m=mobHit(world),h=currentHit(world),hl=currentHit(world,true);
  const mobFirst=m&&(!h||h.t>rayDist(m));
  if(m&&mobFirst&&!player.sneak){
    if(m.def.trader){openUI('trade',m);return;}
    if(it&&it.shears&&m.type==='sheep'&&!m.sheared){m.sheared=true;m.regrow=90;spawnItem(m.pos[0],m.pos[1]+0.8,m.pos[2],WOOL,rint(1,3),0);damageTool(s,1);player.swing=1;return;}
    if(it&&s.id===WHEAT&&m.def.passive&&!m.def.trader&&!(m.love>0)&&!(m.loveCd>0)){m.love=12;if(!inventory.creative)consumeHeld();updateHotbar();player.swing=1;showMsg('♥');return;}
  }
  if(h&&!player.sneak&&interactBlock(h))return;
  if(h&&h.block===END_FRAME&&it&&it.eye){ world.setBlock(h.x,h.y,h.z,END_FRAME_EYE); if(!inventory.creative)consumeHeld(); updateHotbar(); sfx.craft(); checkEndPortal(); return; }
  if(it&&it.food){ if(player.food<20||inventory.creative){player.food=Math.min(20,player.food+it.food);sfx.eat();if(!inventory.creative)consumeHeld();updateHotbar();player.swing=1;} return; }
  if(it&&it.drink){ applyEffect(it.drink); sfx.eat(); player.swing=1; replaceHeld(BOTTLE); if(it.drink!=='water')showMsg(EFFECTS[it.drink].name+'!'); return; }
  if(it&&it.bow){ if(bowCd>0)return; if(inventory.creative||invCount(ARROW)>0){ if(!inventory.creative)invRemove(ARROW,1); const f=forwardVec(); shootArrow([player.pos[0],player.pos[1]+EYE,player.pos[2]],f,32,true,{dmg:5*(1+0.25*(s.ench&&s.ench.Power||0))}); damageTool(s,1); bowCd=0.7; player.swing=1; updateHotbar(); } return; }
  if(it&&it.eye){ if(world.dim!=='over'){showMsg('The eye does nothing here.');return;} const sp=world.gen.portalCenter; const dx=sp[0]-player.pos[0],dz=sp[2]-player.pos[2],d=Math.hypot(dx,dz);
    const dir=['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(((Math.atan2(dx,-dz)+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8]; showMsg(`The eye points ${dir}: the stronghold is ${Math.round(d)} blocks away, deep underground.`); sfx.teleport(); if(Math.random()<0.2&&!inventory.creative){consumeHeld();updateHotbar();} return; }
  if(it&&it.bottle){ if(hl&&isWater(hl.block)){replaceHeld(WATER_BOTTLE);sfx.place();} return; }
  if(it&&'bucket' in it){ useBucket(it,hl); return; }
  if(it&&it.bonemeal&&h){ if(applyBoneMeal(h.x,h.y,h.z)){ if(!inventory.creative)consumeHeld(); updateHotbar(); player.swing=1; } return; }
  if(it&&it.tool==='hoe'&&h){ const b=h.block,above=world.getBlock(h.x,h.y+1,h.z);
    if((b===GRASS||b===DIRT)&&(above===AIR||above===TALL_GRASS)){ if(above===TALL_GRASS)world.setBlock(h.x,h.y+1,h.z,AIR); world.setBlock(h.x,h.y,h.z,waterNear(h.x,h.y,h.z,4)?FARMLAND_WET:FARMLAND); damageTool(s,1); sfx.dig(); player.swing=1; } return; }
  if(it&&it.igniter){ if(!h)return; if(h.block===TNT){ world.setBlock(h.x,h.y,h.z,AIR); primeTNT(h.x,h.y,h.z); damageTool(s,1); return; }
    const [tx,ty,tz]=targetCell(h); if(tryLightPortal(tx,ty,tz)){damageTool(s,1);sfx.portal();} else showMsg('Build a 4×5 obsidian frame first (corners optional) and light the inside.'); player.swing=1; return; }
  if(!h||!it)return;
  placeHeld(h);
}
function rayDist(m){const o=[player.pos[0],player.pos[1]+EYE,player.pos[2]],f=forwardVec();return rayAABB(o[0],o[1],o[2],f[0],f[1],f[2],m.pos[0]-m.w,m.pos[1],m.pos[2]-m.w,m.pos[0]+m.w,m.pos[1]+m.h,m.pos[2]+m.w);}
function useBucket(it,hl){ if(!hl)return;
  if(it.bucket===0){ if(hl.block===WATER||hl.block===LAVA){ world.setBlock(hl.x,hl.y,hl.z,AIR); replaceHeld(hl.block===WATER?WATER_BUCKET:LAVA_BUCKET); sfx.place(); } return; }
  let [tx,ty,tz]=LIQ[hl.block]?[hl.x,hl.y,hl.z]:targetCell(hl); const ex=world.getBlock(tx,ty,tz);
  if(!(ex===AIR||REPLACE[ex]||WASHABLE[ex]))return; if(WASHABLE[ex]&&!REPLACE[ex])dropBlockLoot(ex,tx,ty,tz);
  if(it.bucket===WATER&&world.dim==='nether'){ showMsg('The water evaporates!'); replaceHeld(BUCKET); return; }
  world.setBlock(tx,ty,tz,it.bucket); replaceHeld(BUCKET); sfx.place(); scheduleSave(); }
function applyBoneMeal(x,y,z){ const b=world.getBlock(x,y,z);
  if(b>=WHEAT0&&b<WHEAT3){ world.setBlock(x,y,z,Math.min(WHEAT3,b+rint(1,2))); return true; }
  if(b===SAPLING){ if(Math.random()<0.45)growTree(x,y,z); return true; }
  if(b===GRASS){ for(let i=0;i<12;i++){ const ax=x+rint(-3,3),az=z+rint(-3,3); for(let ay=y+2;ay>=y-2;ay--){ if(world.getBlock(ax,ay,az)===GRASS&&world.getBlock(ax,ay+1,az)===AIR){ const r=Math.random(); world.setBlock(ax,ay+1,az,r<0.8?TALL_GRASS:r<0.9?FLOWER_RED:FLOWER_YELLOW); break; } } } return true; }
  return false; }
function growTree(x,y,z){ const th=4+rint(0,2); for(let i=1;i<=th+1;i++){ const b=world.getBlock(x,y+i,z); if(b!==AIR&&b!==LEAVES&&!REPLACE[b])return false; }
  world.setBlock(x,y,z,AIR); treeShape(x,y-1,z,th+1,(a,b,c,v)=>world.setBlock(a,b,c,v),(a,b,c)=>{const e=world.getBlock(a,b,c);return e===AIR||e===TALL_GRASS;}); world.setBlock(x,y-1,z,DIRT); return true; }
function sleep(h){ if(world.dim!=='over'){showMsg('You cannot sleep here... the bed shudders.');return;} const sun=sunFactor(); player.spawn=[h.x+0.5,h.y+1,h.z+0.5];
  if(sun>0.3){showMsg('Respawn point set. You can only sleep at night.');return;}
  if(world.mobs.some(m=>(m.def.hostile||m.angry)&&Math.hypot(m.pos[0]-player.pos[0],m.pos[2]-player.pos[2])<10)){showMsg('You may not rest now, there are monsters nearby');return;}
  const f=document.getElementById('fade');f.style.opacity=1; setTimeout(()=>{dayTime=0.02;world.mobs=world.mobs.filter(m=>!m.def.hostile);f.style.opacity=0;showMsg('Good morning!');net.sendTime();},1200); }
function showMsg(t){const m=document.getElementById('msg');m.textContent=t;m.style.opacity=1;clearTimeout(m._t);m._t=setTimeout(()=>m.style.opacity=0,3500);}
function dropHeld(){ const s=selected(); if(!s.count)return; const f=forwardVec(); spawnItem(player.pos[0]+f[0]*0.5,player.pos[1]+EYE-0.3,player.pos[2]+f[2]*0.5,s.id,1,s.dur,[f[0]*6,f[1]*6+1,f[2]*6],s.ench); consumeHeld(); updateHotbar(); }

// ---------------------------------------------------------------------
// PORTALS & DIMENSION TRAVEL
// ---------------------------------------------------------------------
function tryLightPortal(x,y,z){ const g=(a,b,c)=>world.getBlock(a,b,c); if(g(x,y,z)!==AIR)return false;
  for(const [dx,dz] of [[1,0],[0,1]]){ let x0=x,z0=z,n=0; while(g(x0-dx,y,z0-dz)===AIR&&n<3){x0-=dx;z0-=dz;n++;} if(g(x0-dx,y,z0-dz)!==OBSIDIAN)continue;
    let y0=y,m=0; while(g(x0,y0-1,z0)===AIR&&m<4){y0--;m++;} if(g(x0,y0-1,z0)!==OBSIDIAN)continue;
    let ok=true; for(let i=0;i<2&&ok;i++)for(let j=0;j<3;j++){ if(g(x0+dx*i,y0+j,z0+dz*i)!==AIR){ok=false;break;} }
    for(let j=0;j<3&&ok;j++)if(g(x0-dx,y0+j,z0-dz)!==OBSIDIAN||g(x0+dx*2,y0+j,z0+dz*2)!==OBSIDIAN)ok=false;
    for(let i=0;i<2&&ok;i++)if(g(x0+dx*i,y0-1,z0+dz*i)!==OBSIDIAN||g(x0+dx*i,y0+3,z0+dz*i)!==OBSIDIAN)ok=false;
    if(!ok)continue; for(let i=0;i<2;i++)for(let j=0;j<3;j++)world.setBlock(x0+dx*i,y0+j,z0+dz*i,PORTAL); scheduleSave(); return true; }
  return false; }
function pregen(w,x,z,r){ const cx=Math.floor(x/CX),cz=Math.floor(z/CZ); for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(!w.getChunk(cx+a,cz+b)){ const prev=world; world=w; w.createChunk(cx+a,cz+b); world=prev; } }
function buildPortal(w,x,z){ let ground=-1; const top=w.dim==='nether'?100:CY-6;
  for(let y=top;y>=2;y--){ if(SOLID[w.getBlock(x,y,z)]&&!LIQ[w.getBlock(x,y+1,z)]&&!SOLID[w.getBlock(x,y+1,z)]&&!SOLID[w.getBlock(x,y+2,z)]&&!SOLID[w.getBlock(x,y+3,z)]){ground=y;break;} }
  if(ground<0){ ground=w.dim==='nether'?64:70; for(let a=-2;a<=3;a++)for(let b=-2;b<=2;b++)w.setBlock(x+a,ground,z+b,OBSIDIAN); }
  for(let i=-1;i<=2;i++)for(let j=0;j<=4;j++){ const frame=i===-1||i===2||j===0||j===4; w.setBlock(x+i,ground+j,z,frame?OBSIDIAN:PORTAL); if(j>0){w.setBlock(x+i,ground+j,z-1,AIR);w.setBlock(x+i,ground+j,z+1,AIR);w.setBlock(x+i,ground+j,z+2,AIR);} }
  for(let i=-1;i<=2;i++){w.setBlock(x+i,ground,z+1,OBSIDIAN);w.setBlock(x+i,ground,z+2,OBSIDIAN);}
  return [x+0.5,ground+1,z+1.5]; }
function findPortal(w,x,z){ for(let r=0;r<=20;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){ if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue; for(let y=2;y<CY-2;y++)if(w.getBlock(x+dx,y,z+dz)===PORTAL)return [x+dx+0.5,y,z+dz+1.5]; } return null; }
function changeDim(name,pos){ saveWorld(); world=dims[name]; player.pos=[...pos]; player.vel=[0,0,0]; player.portalT=0; player.portalCd=5; player.fallPeak=pos[1]; player.inLava=false; sfx.portal(); showMsg('Entering '+DIMS[name].name); scheduleSave(); }
function travelNether(){ const to=world.dim==='over'?'nether':'over', scale=to==='nether'?1/8:8, w=dims[to]; const tx=Math.round(player.pos[0]*scale),tz=Math.round(player.pos[2]*scale);
  const prev=world; world=w; pregen(w,tx,tz,2); let pos=findPortal(w,tx,tz); if(!pos)pos=buildPortal(w,tx,tz); world=prev; changeDim(to,pos);
  if(to==='nether'){ const f=w.gen.fortressCenterNear(tx,tz); if(f)setTimeout(()=>showMsg(`A nether fortress lies about ${Math.round(Math.hypot(f[0]-tx,f[2]-tz))} blocks away.`),2500); } }
function travelEnd(){ if(world.dim==='end'){ changeDim('over',player.spawn); return; } const w=dims.end; const prev=world; world=w; pregen(w,0,0,3);
  let y=75; while(y>40&&!SOLID[w.getBlock(0,y-1,-52)])y--; if(y<=40){ y=58; for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)w.setBlock(a,57,b-52,OBSIDIAN); }
  world=prev; changeDim('end',[0.5,y,-51.5]); if(!w.flags.dragonDead&&!w.mobs.some(m=>m.type==='dragon')){ spawnMob(w,'dragon',0,85,30); sfx.roar(); showMsg('The dragon circles above... destroy the crystals on the pillars first!'); } }
function checkEndPortal(){ const c=world.gen.portalCenter; if(!c)return; const [px,py,pz]=c; let filled=0; for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){ const ring=Math.abs(x)===2||Math.abs(z)===2,corner=Math.abs(x)===2&&Math.abs(z)===2; if(ring&&!corner&&world.getBlock(px+x,py,pz+z)===END_FRAME_EYE)filled++; }
  if(filled>=12){ for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)world.setBlock(px+x,py,pz+z,END_PORTAL); sfx.portal(); showMsg('The End portal opens!'); } }
