'use strict';
// ---------------------------------------------------------------------
// BLOCK INTERACTION: mining, placing, using
// ---------------------------------------------------------------------
const REACH=5,mining={target:null,progress:0,cool:0,stage:0,hit:null};
function currentHit(world,liquids){const f=forwardVec();return raycast(world,player.pos[0],player.pos[1]+EYE,player.pos[2],f[0],f[1],f[2],REACH,liquids);}
function mobHit(world){const f=forwardVec(),o=[player.pos[0],player.pos[1]+EYE,player.pos[2]];let best=null,bt=4.5;for(const m of world.mobs){const t=rayAABB(o[0],o[1],o[2],f[0],f[1],f[2],m.pos[0]-m.w,m.pos[1],m.pos[2]-m.w,m.pos[0]+m.w,m.pos[1]+m.h,m.pos[2]+m.w);if(t>=0&&t<bt){bt=t;best=m;}}return best;}
function miningTime(b){ const B=BLOCKS[b];if(!isFinite(B.hardness))return Infinity;if(inventory.creative)return 0; if(b===COBWEB){ const t=heldItem(); return t&&(t.tool==='sword'||t.shears)?0.4:4; } const s=selected(),tool=heldItem(),match=tool&&tool.tool===B.tool,tier=match?tool.tier:0,speed=match?tool.speed*(1+0.3*(s.ench&&s.ench.Efficiency||0)):1;
  if(B.tool==='pick'&&B.tier>tier)return B.hardness*1.5*5; if(match)return B.hardness*1.5/speed; return B.hardness*1.5; }
function canDrop(b){const B=BLOCKS[b];if(B.tool!=='pick'||B.tier===0)return true;const tool=heldItem();return !!tool&&tool.tool==='pick'&&tool.tier>=B.tier;}
function updateMining(world,dt,active){
  mining.cool=Math.max(0,mining.cool-dt);
  if(!active||mining.cool>0){mining.target=null;mining.progress=0;return;}
  const h=currentHit(world);if(!h){mining.target=null;mining.progress=0;return;}
  const k=h.x+','+h.y+','+h.z;if(mining.target!==k){mining.target=k;mining.progress=0;} const need=miningTime(h.block);if(!isFinite(need))return;
  mining.progress+=dt; mining.stage=need?Math.min(9,Math.floor(mining.progress/need*10)):9; mining.hit=h; player.swing=1; if(Math.random()<dt*6)sfx.dig();
  if(mining.progress>=need){ const b=h.block;
    if(world.setBlock(h.x,h.y,h.z,AIR)){ sfx.break(); blockBreakParticles(b,h.x,h.y,h.z); if(!inventory.creative){ if(canDrop(b))dropBlockLoot(b,h.x,h.y,h.z); const s=selected(); if(s.count&&ITEMS[s.id].tool)damageTool(s,ITEMS[s.id].tool==='sword'?2:1); } player.exhaust+=0.005;scheduleSave(); }
    mining.target=null;mining.progress=0;mining.cool=inventory.creative?0.2:(BLOCKS[b].hardness===0?0.15:0.05); }
}
let attackCd=0;
function attack(world){ if(attackCd>0)return;const m=mobHit(world);if(!m)return;const s=selected(),tool=heldItem();let dmg=(tool&&tool.dmg?tool.dmg:1)+(s.ench&&s.ench.Sharpness||0)+(hasFx('strength')?3:0);
  if(s.id===MACE&&!m.def.vehicle)dmg+=maceSmash(m,s);
  const dx=m.pos[0]-player.pos[0],dz=m.pos[2]-player.pos[2],l=Math.hypot(dx,dz)||1; hurtMob(world,m,m.def.vehicle?1:dmg,m.def.boss||m.def.vehicle?null:[dx/l*6,5,dz/l*6]); if(!m.tame)petsDefend(world,m); if(tool&&tool.tool&&tool.tool!=='mace')damageTool(s,tool.tool==='sword'?1:2); attackCd=s.id===MACE?0.7:0.4;player.exhaust+=0.1;player.swing=1; }

// --- placement rules ---
const SOIL=new Set([GRASS,DIRT,FARMLAND,FARMLAND_WET]);
function waterNear(x,y,z,r){ for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let dy=0;dy<=1;dy++)if(isWater(world.getBlock(x+dx,y+dy,z+dz)))return true; return false; }
function canStay(id,meta,x,y,z){ const below=world.getBlock(x,y-1,z),sup=SUPPORT[id];
  { const wd=torchWall(id,meta); if(wd)return !!SOLID[world.getBlock(x+wd[0],y,z+wd[2])]; }   // a wall torch hangs on the block behind it
  if(sup===1)return !!SOLID[below];
  if(sup===2){const d=DIRV[meta&7];return !!SOLID[world.getBlock(x+d[0],y+d[1],z+d[2])];}
  if(sup===4)return below===DOOR_B||below===DOOR_B_O;
  if(sup===3){
    if((id>=WHEAT0&&id<=WHEAT3)||(id>=CARROTS0&&id<=MELON_STEM))return below===FARMLAND||below===FARMLAND_WET;
    if(id===CACTUS)return (below===SAND||below===CACTUS)&&HDIRS.every(d=>{const n=world.getBlock(x+DIRV[d][0],y,z+DIRV[d][2]);return !SOLID[n]||n===CACTUS&&false;});
    if(id===DEAD_BUSH)return below===SAND||below===DIRT||below===GRASS;
    if(id>=WART0&&id<=WART2)return below===SOUL_SAND;
    if(id===SUGAR_CANE){ if(below===SUGAR_CANE)return true; if(below!==GRASS&&below!==DIRT&&below!==SAND)return false; return [[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>isWater(world.getBlock(x+a,y-1,z+c))); }
    return SOIL.has(below); }
  return true; }
function hitFrac(h){ const y=player.pos[1]+EYE+forwardVec()[1]*h.t; return y-h.y; }   // where on the block face you clicked (0 bottom .. 1 top)
function upperHalf(h){ return h.ny===-1||(h.ny===0&&hitFrac(h)>0.5); }
function placeMeta(id,h){ const dt=DIRTYPE[id];
  if(WALL_TORCH.has(id)&&h.ny===0&&(h.nx||h.nz))return 8|DIRV.findIndex(d=>d[0]===-h.nx&&d[1]===0&&d[2]===-h.nz);   // clicked the side of a block: hang it on that wall
  if(SHAPE[id]===1)return upperHalf(h)?8:0;
  if(SHAPE[id]===2)return lookDirH()|(upperHalf(h)?8:0);
  if(SHAPE[id]===5)return lookDirH()<2?1:0;
  if(id===HOPPER)return h.ny!==0?3:DIRV.findIndex(d=>d[0]===-h.nx&&d[1]===-h.ny&&d[2]===-h.nz);
  if(id===LADDER||id===VINE){ const n=[h.nx,h.ny,h.nz]; return DIRV.findIndex(d=>d[0]===-n[0]&&d[1]===-n[1]&&d[2]===-n[2]); }
  if(id===REPEATER_OFF)return lookDirH();
  if(isDoor(id))return lookDirH();
  if(id===LEVER_OFF||id===BUTTON){ const n=[h.nx,h.ny,h.nz]; return DIRV.findIndex(d=>d[0]===-n[0]&&d[1]===-n[1]&&d[2]===-n[2]); }
  if(dt===1)return OPP[lookDirH()];
  if(dt===2)return OPP[lookDir6()];
  return 0; }
function playerIn(tx,ty,tz){ const p=player.pos; return !player.spectator&&tx+1>p[0]-0.3&&tx<p[0]+0.3&&ty+1>p[1]&&ty<p[1]+1.8&&tz+1>p[2]-0.3&&tz<p[2]+0.3; }
function blockedByEntity(tx,ty,tz,ignorePlayer){ if(!ignorePlayer&&playerIn(tx,ty,tz))return true;
  for(const m of world.mobs){if(tx+1>m.pos[0]-m.w&&tx<m.pos[0]+m.w&&ty+1>m.pos[1]&&ty<m.pos[1]+m.h&&tz+1>m.pos[2]-m.w&&tz<m.pos[2]+m.w)return true;} return false; }
function targetCell(h){ return REPLACE[h.block]&&!LIQ[h.block]?[h.x,h.y,h.z]:[h.x+h.nx,h.y+h.ny,h.z+h.nz]; }
function placeHeld(h){ const s=selected(),it=ITEMS[s.id]; if(!it||!it.places)return false; const id=it.places;
  const done=()=>{ sfx.place(); player.swing=1; if(!inventory.creative)consumeHeld(); updateHotbar(); scheduleSave(); return true; };
  // two slabs of the same kind make a full block
  if(SHAPE[id]===1){ if(h.block===id){ const top=(world.getMeta(h.x,h.y,h.z)&8)!==0; if((!top&&h.ny===1)||(top&&h.ny===-1)){ world.setBlock(h.x,h.y,h.z,SLAB_FULL[id]); return done(); } }
    const [ax,ay,az]=targetCell(h); if(world.getBlock(ax,ay,az)===id){ world.setBlock(ax,ay,az,SLAB_FULL[id]); return done(); } }
  if((id===LADDER||id===VINE)&&h.ny!==0)return false;
  const [tx,ty,tz]=targetCell(h),existing=world.getBlock(tx,ty,tz); if(!(existing===AIR||REPLACE[existing]))return false;
  if((SUPPORT[id]===2)&&(!SOLID[h.block]))return false;
  const meta=placeMeta(id,h);
  let lift=false;
  if(SOLID[id]&&blockedByEntity(tx,ty,tz)){
    // pillaring: jump (or swim up) and place a block right under your feet and you end up standing on it
    const p=player.pos; if(blockedByEntity(tx,ty,tz,true)||player.onGround&&!player.inWater&&!player.inLava||p[1]<ty+0.3||ty+1<=p[1]-0.01)return false;
    if(overlapsSolid(world,p[0]-0.3,ty+1.001,p[2]-0.3,p[0]+0.3,ty+2.8,p[2]+0.3))return false; lift=true; }
  if(!canStay(id,meta,tx,ty,tz)){ if(id===SUGAR_CANE)showMsg('Sugar cane needs water right next to the block it grows on.'); else if(id===CACTUS)showMsg('Cactus grows on sand, with nothing right next to it.'); return false; }
  if(isDoor(id)){ const up=world.getBlock(tx,ty+1,tz); if(!(up===AIR||REPLACE[up])||blockedByEntity(tx,ty,tz)||blockedByEntity(tx,ty+1,tz))return false;
    world.setBlock(tx,ty,tz,DOOR_B,true,meta); world.setBlock(tx,ty+1,tz,DOOR_T,true,meta); }
  else if(!world.setBlock(tx,ty,tz,id,true,meta))return false;
  if(lift){ player.pos[1]=ty+1.001; player.vel[1]=Math.max(player.vel[1],0); player.fallPeak=player.pos[1]; player.onGround=true; }
  sfx.place(); player.swing=1; if(!inventory.creative)consumeHeld(); updateHotbar(); scheduleSave(); return true; }

// --- doors, levers, buttons ---
function toggleDoor(x,y,z,open){ let b=world.getBlock(x,y,z); if(b===DOOR_T||b===DOOR_T_O){y--;b=world.getBlock(x,y,z);} if(b!==DOOR_B&&b!==DOOR_B_O)return;
  const isOpen=b===DOOR_B_O, want=open===undefined?!isOpen:open; if(want===isOpen)return; const m=world.getMeta(x,y,z),mt=world.getMeta(x,y+1,z);
  doorBusy=true; world.setBlock(x,y,z,want?DOOR_B_O:DOOR_B,true,m); if(isDoor(world.getBlock(x,y+1,z)))world.setBlock(x,y+1,z,want?DOOR_T_O:DOOR_T,true,mt); doorBusy=false; sfx.place(); }
let doorBusy=false;
// two chests side by side make one large chest (a chest pairs with its first chest neighbour only if that neighbour picks it back, so rows of 3 stay sensible)
function chestNeighbor(x,y,z){ for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])if(world.getBlock(x+dx,y,z+dz)===CHEST)return [x+dx,y,z+dz]; return null; }
function chestPartner(x,y,z){ const q=chestNeighbor(x,y,z); if(!q)return null; const r=chestNeighbor(...q); return r&&r[0]===x&&r[2]===z?q:null; }
function interactBlock(h){ const b=h.block,x=h.x,y=h.y,z=h.z,m=world.getMeta(x,y,z);
  if(b===CRAFTING_TABLE){openUI('table');return true;} if(b===CHEST){ const q=chestPartner(x,y,z); if(q){ const [p1,p2]=(q[0]<x||q[0]===x&&q[2]<z)?[q,[x,y,z]]:[[x,y,z],q]; openUI('chest',getTile(...p1,CHEST),getTile(...p2,CHEST)); } else openUI('chest',getTile(x,y,z,b)); return true;}
  if(b===FURNACE||b===FURNACE_LIT){openUI('furnace',getTile(x,y,z,b));return true;} if(b===BREWING_STAND){openUI('brew',getTile(x,y,z,b));return true;}
  if(b===ENCHANT_TABLE){openUI('enchant',{pos:[x,y,z]});return true;} if(b===BED){sleep(h);return true;}
  if(b===LEVER_OFF||b===LEVER_ON){ world.setBlock(x,y,z,b===LEVER_OFF?LEVER_ON:LEVER_OFF,true,m); sfx.place(); return true; }
  if(b===BUTTON){ world.setBlock(x,y,z,BUTTON_ON,true,m); world.timers.push({x,y,z,t:world.time+1,kind:'button'}); sfx.place(); return true; }
  if(b===BUTTON_ON)return true;
  if(b===FENCE_GATE){ world.setBlock(x,y,z,b,true,m&4?m&~4:(m&~1)|4|(lookDirH()<2?1:0)); sfx.place(); return true; }
  if(b===REPEATER_OFF||b===REPEATER_ON){ const d=((m>>3)+1)&3; world.setBlock(x,y,z,b,true,(m&7)|d<<3); showMsg('Repeater delay: '+(d+1)+' tick'+(d?'s':'')); return true; }
  if(isDoor(b)){ toggleDoor(x,y,z); return true; }
  if(b===VAULT){ openVault(x,y,z); return true; }
  if(b===HOPPER){ openUI('hopper',getTile(x,y,z,b)); return true; } if(b===DROPPER||b===DISPENSER){ openUI('dropper',getTile(x,y,z,b)); return true; }
  if(b===COMPARATOR_OFF||b===COMPARATOR_ON){ world.setBlock(x,y,z,b,true,m^8); showMsg((m&8)?'Comparator: compare mode':'Comparator: subtract mode'); rsSchedule(x,y,z,0); return true; }
  return false; }

let bowCd=0;
// right-click on a mob: trade, shear, breed, tame, saddle, ride...
function useOnMob(m,s,it){
    if(m.def.trader){openUI('trade',m);return true;}
    if(it&&it.shears&&m.type==='sheep'&&!m.sheared){m.sheared=true;m.regrow=90;spawnItem(m.pos[0],m.pos[1]+0.8,m.pos[2],WOOL,rint(1,3),0);damageTool(s,1);player.swing=1;return true;}
    if(it&&(m.def.food||[WHEAT]).includes(s.id)&&m.def.passive&&!m.def.trader&&!m.def.swim&&!(m.love>0)&&!(m.loveCd>0)){m.love=12;if(!inventory.creative)consumeHeld();updateHotbar();player.swing=1;showMsg('♥');return true;}
    if(m.def.vehicle&&!player.riding){ mountVehicle(m); return true; }
    if(m.def.horse){ if(s.id===SADDLE&&m.tame&&!m.saddle){ m.saddle=true; if(!inventory.creative)consumeHeld(); updateHotbar(); showMsg('Saddled! Right-click to ride.'); sfx.place(); return true; }
      if([WHEAT,APPLE,SUGAR].includes(s.id)&&(m.hp<m.def.hp||!m.tame)){ m.hp=Math.min(m.def.hp,m.hp+3); m.temper=(m.temper||0)+5; if(!inventory.creative)consumeHeld(); updateHotbar(); showMsg('♥'); return true; }
      if(!player.riding){ mountVehicle(m); return true; } }
    if(m.def.wolf&&!m.tame&&s.id===BONE&&!(m.angry>0)){ if(!inventory.creative)consumeHeld(); updateHotbar(); player.swing=1;
      if(Math.random()<0.34){ m.tame=true; m.owner=PROFILE.code; m.hp=20; m.sit=true; m.target=null; showMsg('♥ The wolf is now your pet! Right-click it to make it sit or follow.'); sfx.bark(); } else showMsg('The wolf sniffs the bone...'); return true; }
    if(m.def.wolf&&m.tame&&m.owner&&m.owner!==PROFILE.code){ showMsg('This wolf belongs to someone else.'); return true; }
    if(m.def.wolf&&m.tame){ if([BEEF,BEEF_C,PORK,PORK_C,CHICKEN,CHICKEN_C,MUTTON,MUTTON_C,ROTTEN].includes(s.id)&&m.hp<20){ m.hp=Math.min(20,m.hp+6); if(!inventory.creative)consumeHeld(); updateHotbar(); showMsg('♥'); return true; }
      m.sit=!m.sit; m.target=null; showMsg(m.sit?'Your wolf sits and waits.':'Your wolf follows you.'); return true; }
  return false; }
function useItem(world){
  const s=selected(),it=s.count>0?ITEMS[s.id]:null,m=mobHit(world),h=currentHit(world),hl=currentHit(world,true);
  const mobFirst=m&&(!h||h.t>rayDist(m));
  if(m&&mobFirst&&!player.sneak){ const before=m.proxy?MOBSYNC.map(k=>m[k]):null, done=useOnMob(m,s,it); if(before)net.mobChanged(m,before); if(done)return; }
  if(h&&!player.sneak&&interactBlock(h))return;
  if(h&&h.block===END_FRAME&&it&&it.eye){ world.setBlock(h.x,h.y,h.z,END_FRAME_EYE); if(!inventory.creative)consumeHeld(); updateHotbar(); sfx.craft(); checkEndPortal(); return; }
  if(it&&it.armor){ equipHeldArmor(s,it); return; }
  if(it&&it.food){ if(player.food<20||inventory.creative){player.food=Math.min(20,player.food+it.food);sfx.eat();if(!inventory.creative)consumeHeld();updateHotbar();player.swing=1;} return; }
  if(it&&it.drink){ applyEffect(it.drink); sfx.eat(); player.swing=1; replaceHeld(BOTTLE); if(it.drink!=='water')showMsg(EFFECTS[it.drink].name+'!'); return; }
  if(it&&it.tool==='axe'&&h&&h.block>COPPER_BLOCK&&h.block<=COPPER_OXIDIZED){ world.setBlock(h.x,h.y,h.z,h.block-1); damageTool(s,1); player.swing=1; spawnParticles(h.x+0.5,h.y+0.5,h.z+0.5,[0.85,0.55,0.35],10,{spread:1,speed:2,up:2,life:0.5}); sfx.dig(); return; }
  if(it&&it.rod){ useRod(s); return; }
  if(it&&it.throw){ throwItem(s,it.throw); return; }
  if(it&&it.shield)return;
  if(it&&it.cart){ if(placeCart(h,hl)){ if(!inventory.creative)consumeHeld(); updateHotbar(); sfx.place(); } return; }
  if(it&&it.boat){ const t=hl&&isWater(hl.block)?[hl.x+0.5,hl.y+1,hl.z+0.5]:h?[h.x+h.nx+0.5,h.y+h.ny,h.z+h.nz+0.5]:null; if(t){ const b=spawnMob(world,'boat',t[0],t[1],t[2]); b.yaw=player.yaw; if(b.detached)net.requestSpawn(b); if(!inventory.creative)consumeHeld(); updateHotbar(); sfx.place(); } return; }
  if(it&&it.bow){ if(bowCd>0)return; if(inventory.creative||invCount(ARROW)>0){ if(!inventory.creative)invRemove(ARROW,1); const f=forwardVec(); shootArrow([player.pos[0],player.pos[1]+EYE,player.pos[2]],f,32,true,{dmg:5*(1+0.25*(s.ench&&s.ench.Power||0))}); damageTool(s,1); bowCd=0.7; player.swing=1; updateHotbar(); } return; }
  if(it&&it.eye){ if(world.dim!=='over'){showMsg('The eye does nothing here.');return;} const sp=world.gen.portalCenter; if(!sp){showMsg('The eye just hovers. Superflat worlds have no stronghold.');return;} const dx=sp[0]-player.pos[0],dz=sp[2]-player.pos[2],d=Math.hypot(dx,dz);
    const dir=['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(((Math.atan2(dx,-dz)+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8]; showMsg(`The eye points ${dir}: the stronghold is ${Math.round(d)} blocks away, deep underground.`); sfx.teleport(); if(Math.random()<0.2&&!inventory.creative){consumeHeld();updateHotbar();} return; }
  if(it&&it.bottle){ if(hl&&isWater(hl.block)){replaceHeld(WATER_BOTTLE);sfx.place();} return; }
  if(it&&'bucket' in it){ useBucket(it,hl); return; }
  if(it&&it.bonemeal&&h){ if(applyBoneMeal(h.x,h.y,h.z)){ if(!inventory.creative)consumeHeld(); updateHotbar(); player.swing=1; } return; }
  if(it&&it.tool==='hoe'&&h){ const b=h.block,above=world.getBlock(h.x,h.y+1,h.z);
    if((b===GRASS||b===DIRT)&&(above===AIR||above===TALL_GRASS)){ if(above===TALL_GRASS)world.setBlock(h.x,h.y+1,h.z,AIR); world.setBlock(h.x,h.y,h.z,waterNear(h.x,h.y,h.z,4)?FARMLAND_WET:FARMLAND); damageTool(s,1); sfx.dig(); player.swing=1; } return; }
  if(it&&it.igniter){ if(!h)return; if(h.block===TNT){ world.setBlock(h.x,h.y,h.z,AIR); primeTNT(h.x,h.y,h.z); damageTool(s,1); return; }
    const [tx,ty,tz]=targetCell(h); player.swing=1; if(tryLightPortal(tx,ty,tz)){damageTool(s,1);sfx.portal();return;}
    const ex=world.getBlock(tx,ty,tz); if((ex===AIR||REPLACE[ex]&&!LIQ[ex])&&SOLID[world.getBlock(tx,ty-1,tz)]||FLAM[h.block]){ if(ex===AIR||REPLACE[ex]&&!LIQ[ex]){ world.setBlock(tx,ty,tz,FIRE); damageTool(s,1); sfx.hiss(); } } return; }
  // lily pads go on top of still water
  if(it&&s.id===LILY&&hl&&isWater(hl.block)&&world.getBlock(hl.x,hl.y+1,hl.z)===AIR){ world.setBlock(hl.x,hl.y+1,hl.z,LILY); sfx.place(); if(!inventory.creative)consumeHeld(); updateHotbar(); return; }
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
  if(b===CARROTS0||b===POTATOES0){ if(Math.random()<0.6)world.setBlock(x,y,z,b+1); return true; }
  if(b===PUMPKIN_STEM||b===MELON_STEM){ growStemFruit(x,y,z,b); return true; }
  if(b===SAPLING){ if(Math.random()<0.45)growTree(x,y,z); return true; }
  if(b===GRASS){ for(let i=0;i<12;i++){ const ax=x+rint(-3,3),az=z+rint(-3,3); for(let ay=y+2;ay>=y-2;ay--){ if(world.getBlock(ax,ay,az)===GRASS&&world.getBlock(ax,ay+1,az)===AIR){ const r=Math.random(); world.setBlock(ax,ay+1,az,r<0.8?TALL_GRASS:r<0.9?FLOWER_RED:FLOWER_YELLOW); break; } } } return true; }
  return false; }
function growStemFruit(x,y,z,b){ const fruit=b===PUMPKIN_STEM?PUMPKIN:MELON; for(const d of HDIRS)if(world.getBlock(x+DIRV[d][0],y,z+DIRV[d][2])===fruit)return false;
  const opts=HDIRS.filter(d=>{const ax=x+DIRV[d][0],az=z+DIRV[d][2],g=world.getBlock(ax,y-1,az);return world.getBlock(ax,y,az)===AIR&&(g===DIRT||g===GRASS||g===FARMLAND||g===FARMLAND_WET||g===SAND);});
  if(!opts.length)return false; const d=opts[rint(0,opts.length-1)]; world.setBlock(x+DIRV[d][0],y,z+DIRV[d][2],fruit); return true; }
function growTree(x,y,z){ const th=4+rint(0,2); for(let i=1;i<=th+1;i++){ const b=world.getBlock(x,y+i,z); if(b!==AIR&&b!==LEAVES&&!REPLACE[b])return false; }
  world.setBlock(x,y,z,AIR); treeShape(x,y-1,z,th+1,(a,b,c,v)=>world.setBlock(a,b,c,v),(a,b,c)=>{const e=world.getBlock(a,b,c);return e===AIR||e===TALL_GRASS;}); world.setBlock(x,y-1,z,DIRT); return true; }
function sleep(h){ if(world.dim!=='over'){showMsg('You cannot sleep here... the bed shudders.');return;} const sun=sunFactor(); player.spawn=[h.x+0.5,h.y+1,h.z+0.5];
  if(sun>0.3){showMsg('Respawn point set. You can only sleep at night.');return;}
  if(world.mobs.some(m=>(m.def.hostile||m.angry)&&Math.hypot(m.pos[0]-player.pos[0],m.pos[2]-player.pos[2])<10)){showMsg('You may not rest now, there are monsters nearby');return;}
  const f=document.getElementById('fade');f.style.opacity=1; setTimeout(()=>{dayTime=0.02;world.mobs=world.mobs.filter(m=>!m.def.hostile);f.style.opacity=0;showMsg('Good morning!');net.sendTime();},1200); }
function showMsg(t){const m=document.getElementById('msg');m.textContent=t;m.style.opacity=1;clearTimeout(m._t);m._t=setTimeout(()=>m.style.opacity=0,3500);}
// right-click armor in your hand: put it on; whatever you were wearing in that slot comes back to your hand
function equipHeldArmor(s,it){ const worn=inventory.armor[it.armor.slot], t={}; setStack(t,s); setStack(s,worn); setStack(worn,t); if(!s.count)clearStack(s);
  player.swing=1; sfx.craft(); updateHotbar(); buildHotbar(); scheduleSave(); showMsg(ITEMS[worn.id].name+' ✓'); }
function dropHeld(all){ const s=selected(); if(!s.count)return; throwStack(s,all?s.count:1); if(all){ clearStack(s); } else consumeHeld(); updateHotbar(); buildHotbar(); }
// throw items forward (Q, Ctrl+Q, or out of the inventory window)
function throwStack(s,n){ const f=forwardVec(); thrownBy=net.role?net.myId:0; try{ spawnItem(player.pos[0]+f[0]*0.5,player.pos[1]+EYE-0.3,player.pos[2]+f[2]*0.5,s.id,n,s.dur,[f[0]*6,f[1]*6+1,f[2]*6],s.ench); } finally { thrownBy=-1; } sfx.pickup(); }

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
