'use strict';
// =====================================================================
// ITEM LOGISTICS & EXTRA REDSTONE
// Hoppers move items between containers (and suck up dropped items),
// droppers spit items out, dispensers shoot / place / use them,
// comparators read how full a container is, observers pulse when the
// block in front of them changes.
// =====================================================================
function containerAt(x,y,z){ const b=world.getBlock(x,y,z); if(!(b===CHEST||b===FURNACE||b===FURNACE_LIT||b===BREWING_STAND||b===HOPPER||b===DROPPER||b===DISPENSER))return null; return getTile(x,y,z,b); }
// which stacks of a container accept items entering through face `side` (2 = top), or give items out
function insertSlots(t,side,id){ if(t.slots)return t.slots;
  if(t.type==='furnace')return side===2?[t.inp]:FUEL[id]?[t.fuel]:[];
  if(t.type==='brew')return side===2?(BREW[id]?[t.ing]:[]):id===BLAZE_POWDER?[t.fuel]:ITEMS[id].drink?t.bottles:[]; return []; }
function extractSlots(t){ if(t.slots)return t.slots; if(t.type==='furnace')return [t.out]; if(t.type==='brew')return t.bottles.filter(b=>b.id!==WATER_BOTTLE&&b.id!==AWKWARD); return []; }
function insertOne(t,src,side){ const id=src.id,I=ITEMS[id]; const slots=insertSlots(t,side,id); if(!slots.length)return false;
  if(I.stack>1&&!src.ench)for(const s of slots)if(s.count&&s.id===id&&s.count<I.stack&&!s.ench){ s.count++; return true; }
  for(const s of slots)if(!s.count){ s.id=id; s.count=1; s.dur=src.dur||0; s.ench=src.ench; return true; } return false; }
function containerStacks(t){ return t.slots||(t.type==='furnace'?[t.inp,t.fuel,t.out]:t.type==='brew'?t.bottles.concat([t.ing,t.fuel]):[]); }
function containerSignal(t){ const st=containerStacks(t); if(!st.length)return 0; let f=0,any=false; for(const s of st)if(s.count){ any=true; f+=s.count/ITEMS[s.id].stack; } return any?Math.floor(1+f/st.length*14):0; }
// something inside a container changed: comparators nearby re-read it (and friends get the update)
function tileChanged(x,y,z){ if(!net.guest)rsNotify(x,y,z); if(typeof net.tileDirty==='function')net.tileDirty(world.dim,tkey(x,y,z)); }
// --- hoppers ---
function tickHopper(k,t,x,y,z,dt){ t.cd=(t.cd||0)-dt; if(t.cd>0)return; t.cd=0.4; if(world.getBlock(x,y,z)!==HOPPER)return; if(isPowered(x,y,z))return;   // a powered hopper is locked
  const f=world.getMeta(x,y,z)&7,d=DIRV[f],tg=containerAt(x+d[0],y+d[1],z+d[2]);
  if(tg){ for(const s of t.slots){ if(!s.count)continue; if(insertOne(tg,s,OPP[f])){ s.count--; if(!s.count)clearStack(s); tileChanged(x,y,z); tileChanged(x+d[0],y+d[1],z+d[2]); break; } } }
  const src=containerAt(x,y+1,z);
  if(src){ for(const s of extractSlots(src)){ if(!s.count)continue; if(insertOne(t,s,2)){ s.count--; if(!s.count)clearStack(s); tileChanged(x,y,z); tileChanged(x,y+1,z); break; } } }
  else if(!SOLID[world.getBlock(x,y+1,z)]||world.getBlock(x,y+1,z)===HOPPER){ for(let i=world.items.length-1;i>=0;i--){ const it=world.items[i];
      if(it.pos[0]<x||it.pos[0]>x+1||it.pos[2]<z||it.pos[2]>z+1||it.pos[1]<y+0.6||it.pos[1]>y+1.8)continue; let n=0; while(it.count>0&&insertOne(t,it,2)){ it.count--; n++; if(n>=64)break; }
      if(n){ if(!it.count)world.items.splice(i,1); tileChanged(x,y,z); } break; } } }
// --- droppers & dispensers (fire on a rising redstone edge) ---
function dispense(x,y,z,b,t){ const full=t.slots.map((s,i)=>s.count?i:-1).filter(i=>i>=0); if(!full.length){ sfx.click(); return; }
  const s=t.slots[full[rint(0,full.length-1)]],f=world.getMeta(x,y,z)&7,d=DIRV[f],fx=x+d[0],fy=y+d[1],fz=z+d[2],o=[x+0.5+d[0]*0.7,y+0.5+d[1]*0.7,z+0.5+d[2]*0.7],I=ITEMS[s.id];
  const take=()=>{ s.count--; if(!s.count)clearStack(s); tileChanged(x,y,z); }, front=world.getBlock(fx,fy,fz);
  if(b===DROPPER){ const tg=containerAt(fx,fy,fz); if(tg){ if(insertOne(tg,s,OPP[f])){ take(); tileChanged(fx,fy,fz); } return; } spawnItem(o[0],o[1],o[2],s.id,1,s.dur,[d[0]*5+rand(-0.5,0.5),d[1]*5+1.5,d[2]*5+rand(-0.5,0.5)],s.ench); take(); sfx.click(); return; }
  // dispenser
  if(s.id===ARROW){ shootArrow(o,[d[0],d[1]+0.05,d[2]],26,true,{dmg:4}); take(); return; }
  if(I.throw){ shootArrow(o,[d[0],d[1]+0.1,d[2]],18,true,{dmg:0,kind:I.throw,splash:I.splash}); take(); return; }
  if(s.id===WATER_BUCKET||s.id===LAVA_BUCKET){ if(front===AIR||REPLACE[front]&&!LIQ[front]){ world.setBlock(fx,fy,fz,s.id===WATER_BUCKET?WATER:LAVA); s.id=BUCKET; tileChanged(x,y,z); } return; }
  if(s.id===BUCKET){ if(front===WATER||front===LAVA){ world.setBlock(fx,fy,fz,AIR); if(s.count===1)s.id=front===WATER?WATER_BUCKET:LAVA_BUCKET; else { take(); spawnItem(o[0],o[1],o[2],front===WATER?WATER_BUCKET:LAVA_BUCKET,1); } tileChanged(x,y,z); } return; }
  if(s.id===FLINT_STEEL){ if(front===TNT){ world.setBlock(fx,fy,fz,AIR); primeTNT(fx,fy,fz); } else if(front===AIR)world.setBlock(fx,fy,fz,FIRE); s.dur=(s.dur||0)+1; if(s.dur>=I.maxDur)clearStack(s); tileChanged(x,y,z); return; }
  if(s.id===BONE_MEAL){ if(applyBoneMeal(fx,fy,fz)||applyBoneMeal(fx,fy-1,fz))take(); return; }
  if(s.id===TNT){ if(front===AIR){ primeTNT(fx,fy,fz); take(); } return; }
  if(I.boat){ const m=spawnMob(world,'boat',fx+0.5,fy+0.1,fz+0.5); m.yaw=Math.atan2(-d[0],-d[2]); take(); return; }
  if(I.cart&&RAILS.has(front)){ const m=spawnMob(world,'minecart',fx+0.5,fy+0.0625,fz+0.5); m.dir=RAIL_CONN[world.getMeta(fx,fy,fz)&15][0]; m.s=0; take(); return; }
  spawnItem(o[0],o[1],o[2],s.id,1,s.dur,[d[0]*5+rand(-0.5,0.5),d[1]*5+1.5,d[2]*5+rand(-0.5,0.5)],s.ench); take(); sfx.click(); }
// --- observers: watch the block in front, pulse out of the back ---
function observersSee(w,x,y,z){ if(net.guest)return; for(let i=0;i<6;i++){ const ox=x-DIRV[i][0],oy=y-DIRV[i][1],oz=z-DIRV[i][2],b=w.getBlock(ox,oy,oz);
  if((b===OBSERVER)&&(w.getMeta(ox,oy,oz)&7)===i)rsSchedule(ox,oy,oz,0.1,true); } }
// --- comparators: rear input (container fullness or signal) against the strongest side input ---
function comparatorUpdate(w,x,y,z,b,m){ const f=m&7,d=DIRV[f],bx=x-d[0],bz=z-d[2],bb=w.getBlock(bx,y,bz);
  let rear=0; const t=containerAt(bx,y,bz); if(t)rear=containerSignal(t); else if(RS_WIRE.has(bb))rear=w.getMeta(bx,y,bz); else rear=Math.max(emitsInto(bx,y,bz,x,y,z),blockPowered(bx,y,bz,true)?15:0);
  if(!t&&conductive(bb)){ const t2=containerAt(bx-d[0],y,bz-d[2]); if(t2)rear=Math.max(rear,containerSignal(t2)); }   // reads through one block, like Minecraft
  let side=0; for(const sd of (f<2?[4,5]:[0,1])){ const sx=x+DIRV[sd][0],sz=z+DIRV[sd][2],sb=w.getBlock(sx,y,sz); side=Math.max(side,RS_WIRE.has(sb)?w.getMeta(sx,y,sz):emitsInto(sx,y,sz,x,y,z)); }
  const out=(m&8)?Math.max(0,rear-side):(rear>=side?rear:0); if(out!==((m>>4)&15))rsSchedule(x,y,z,0.1,out); }
