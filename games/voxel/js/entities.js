'use strict';
// ---------------------------------------------------------------------
// ENTITY PHYSICS (player, mobs, drops, falling blocks, primed TNT)
// ---------------------------------------------------------------------
const GRAVITY=-32;
const isWater=b=>LIQ[b]===1, isLava=b=>LIQ[b]===2;
function overlapsSolid(world,minx,miny,minz,maxx,maxy,maxz){const x0=Math.floor(minx),x1=Math.floor(maxx-1e-6),y0=Math.floor(miny),y1=Math.floor(maxy-1e-6),z0=Math.floor(minz),z1=Math.floor(maxz-1e-6);
  for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(SOLID[world.getBlock(x,y,z)])return[x,y,z];return null;}
function hasSupport(world,e){return !!overlapsSolid(world,e.pos[0]-e.w,e.pos[1]-0.1,e.pos[2]-e.w,e.pos[0]+e.w,e.pos[1],e.pos[2]+e.w);}
function moveAxis(world,e,axis,delta){ if(delta===0)return;const p=e.pos,before=p[axis];p[axis]+=delta;
  if(axis!==1&&e.sneak&&e.wasGround&&!hasSupport(world,e)){p[axis]=before;e.vel[axis]=0;return;}
  const hit=overlapsSolid(world,p[0]-e.w,p[1],p[2]-e.w,p[0]+e.w,p[1]+e.h,p[2]+e.w);if(!hit)return;const cell=hit[axis];
  if(axis===1){if(delta>0)p[1]=cell-e.h-1e-4;else{p[1]=cell+1;e.onGround=true;}}else{if(delta>0)p[axis]=cell-e.w-1e-4;else p[axis]=cell+1+e.w+1e-4;e.hitWall=true;} e.vel[axis]=0; }
function stepEntity(world,e,dt){const v=e.vel,maxD=Math.max(Math.abs(v[0]),Math.abs(v[1]),Math.abs(v[2]))*dt,steps=Math.max(1,Math.ceil(maxD/0.5)),sdt=dt/steps;e.wasGround=e.onGround;e.onGround=false;e.hitWall=false;
  for(let s=0;s<steps;s++){moveAxis(world,e,1,v[1]*sdt);moveAxis(world,e,0,v[0]*sdt);moveAxis(world,e,2,v[2]*sdt);}}
function blockAt(world,e,yFrac){return world.getBlock(Math.floor(e.pos[0]),Math.floor(e.pos[1]+yFrac),Math.floor(e.pos[2]));}
function stepFlyer(world,e,dt){ const p=e.pos; for(let a=0;a<3;a++){ const n=p[a]+e.vel[a]*dt; const t=[p[0],p[1],p[2]]; t[a]=n; if(!overlapsSolid(world,t[0]-e.w,t[1],t[2]-e.w,t[0]+e.w,t[1]+e.h,t[2]+e.w))p[a]=n; else e.vel[a]=0; } }

// ---------------------------------------------------------------------
// PLAYER + survival stats + XP + potion effects
// ---------------------------------------------------------------------
const WALK=4.3,SPRINT=5.6,SNEAK=1.3,FLY=11,JUMP_V=Math.sqrt(2*32*1.25),EYE=1.62;
const player={pos:[8,70,8],vel:[0,0,0],yaw:0,pitch:0,w:0.3,h:1.8,onGround:false,wasGround:false,hitWall:false,fly:false,inWater:false,inLava:false,sneak:false,sprint:false,
  hp:20,food:20,air:15,exhaust:0,fallPeak:0,invuln:0,dead:false,regenT:0,starveT:0,lavaT:0,swing:0,bob:0,spawn:null,level:0,xp:0,portalT:0,portalCd:0,effects:{},regenFx:0};
const keys={};
const hasFx=n=>(player.effects[n]||0)>0;
function forwardVec(){const cp=Math.cos(player.pitch);return[-cp*Math.sin(player.yaw),Math.sin(player.pitch),-cp*Math.cos(player.yaw)];}
function lookDir6(){const f=forwardVec(),a=f.map(Math.abs);if(a[1]>a[0]&&a[1]>a[2])return f[1]>0?2:3;return a[0]>a[2]?(f[0]>0?0:1):(f[2]>0?4:5);}
function lookDirH(){const f=forwardVec();return Math.abs(f[0])>Math.abs(f[2])?(f[0]>0?0:1):(f[2]>0?4:5);}
function xpNeed(l){return 7+l*3;}
function addXp(v){ player.xp+=v; while(player.xp>=xpNeed(player.level)){player.xp-=xpNeed(player.level);player.level++;} }
function armorPoints(){return inventory.armor.reduce((s,a)=>s+(a.count>0&&ITEMS[a.id].armor?ITEMS[a.id].armor.pts+(a.ench&&a.ench.Protection||0):0),0);}
function damagePlayer(amount,ignoreArmor,kind){ if(player.dead||inventory.creative||player.invuln>0)return; if(kind==='fire'&&hasFx('fire'))return;
  const red=ignoreArmor?0:Math.min(0.8,armorPoints()*0.04);
  player.hp-=Math.max(0.5,amount*(1-red));player.invuln=0.5;sfx.hurt(); const h=document.getElementById('hurt');h.style.opacity=1;setTimeout(()=>h.style.opacity=0,120);
  if(player.hp<=0){player.hp=0;player.dead=true;dropAllInventory();player.level=0;player.xp=0;player.effects={};document.getElementById('death').classList.remove('hidden');if(uiOpen)closeUI(false);document.exitPointerLock();} }
function applyEffect(name){ if(name==='water')return; if(name==='heal'){player.hp=Math.min(20,player.hp+8);return;} player.effects[name]=EFFECTS[name].time; }
function updatePlayer(world,dt){
  const p=player,v=p.vel;if(p.dead)return;
  const fx=-Math.sin(p.yaw),fz=-Math.cos(p.yaw),rx=Math.cos(p.yaw),rz=-Math.sin(p.yaw);let wx=0,wz=0;
  if(keys['KeyW']){wx+=fx;wz+=fz;}if(keys['KeyS']){wx-=fx;wz-=fz;}if(keys['KeyD']){wx+=rx;wz+=rz;}if(keys['KeyA']){wx-=rx;wz-=rz;}
  const len=Math.hypot(wx,wz);if(len>0){wx/=len;wz/=len;}
  const head=blockAt(world,p,1.5),feet=blockAt(world,p,0.3),below=blockAt(world,p,-0.1);p.inWater=(isWater(head)||isWater(feet));p.inLava=(isLava(head)||isLava(feet));
  p.sneak=!!keys['ShiftLeft']&&!p.fly; if(!keys['KeyW']||p.food<=6||p.sneak)p.sprint=false; const sprint=p.sprint&&len>0;
  for(const k in p.effects){p.effects[k]-=dt;if(p.effects[k]<=0)delete p.effects[k];}
  if(hasFx('regen')){p.regenFx+=dt;if(p.regenFx>=2.5){p.regenFx=0;p.hp=Math.min(20,p.hp+1);}}
  if(p.fly&&inventory.creative){const speed=keys['ControlLeft']?FLY*2:FLY,ty=(keys['Space']?1:0)-(keys['ShiftLeft']?1:0),k=Math.min(1,dt*12);v[0]+=(wx*speed-v[0])*k;v[2]+=(wz*speed-v[2])*k;v[1]+=(ty*speed-v[1])*k;p.fallPeak=p.pos[1];}
  else{ p.fly=false;const speed=(sprint?SPRINT:p.sneak?SNEAK:WALK)*(hasFx('speed')?1.3:1)*((p.inWater||p.inLava)?0.5:below===SOUL_SAND?0.4:1),accel=(p.onGround?10:2.5)*dt;
    v[0]+=(wx*speed-v[0])*Math.min(1,accel);v[2]+=(wz*speed-v[2])*Math.min(1,accel);
    if(p.inWater||p.inLava){v[1]=keys['Space']?4:Math.max(v[1]+GRAVITY*0.25*dt,-3);p.fallPeak=p.pos[1];}
    else{if(keys['Space']&&p.onGround){v[1]=JUMP_V;p.onGround=false;p.exhaust+=0.05;}v[1]=Math.max(v[1]+GRAVITY*dt,-78);} }
  const wasGround=p.onGround;if(p.pos[1]>p.fallPeak)p.fallPeak=p.pos[1];
  stepEntity(world,p,dt);
  if(p.onGround&&!wasGround){const d=p.fallPeak-p.pos[1];if(d>3.2&&!p.inWater)damagePlayer(Math.floor(d-3),false);
    const bx=Math.floor(p.pos[0]),by=Math.floor(p.pos[1]-0.1),bz=Math.floor(p.pos[2]),bb=world.getBlock(bx,by,bz);   // jumping on crops tramples the farmland
    if(d>0.9&&(bb===FARMLAND||bb===FARMLAND_WET)&&!inventory.creative)world.setBlock(bx,by,bz,DIRT);
    p.fallPeak=p.pos[1];}
  if(p.onGround)p.fallPeak=p.pos[1]; if(p.pos[1]<-20){ if(world.dim==='end'){damagePlayer(100,true);} else {p.pos[1]=CY;v[1]=0;} }
  if(len>0&&p.onGround)p.bob+=dt*(sprint?14:10); p.swing=Math.max(0,p.swing-dt*4);
  p.portalCd=Math.max(0,p.portalCd-dt);
  const inP=feet===PORTAL||head===PORTAL, inE=feet===END_PORTAL||blockAt(world,p,-0.3)===END_PORTAL;
  if(inP&&p.portalCd<=0){p.portalT+=dt;if(p.portalT>=1.5){p.portalT=0;travelNether();}} else p.portalT=0;
  if(inE&&p.portalCd<=0)travelEnd();
  if(!inventory.creative){
    p.invuln=Math.max(0,p.invuln-dt); p.exhaust+=dt*(sprint?0.05:0.0125);
    if(p.exhaust>=4){p.exhaust-=4;p.food=Math.max(0,p.food-1);}
    if(p.food>=18&&p.hp<20){p.regenT+=dt;if(p.regenT>=4){p.regenT=0;p.hp=Math.min(20,p.hp+1);p.exhaust+=1.5;}}
    if(p.food<=0){p.starveT+=dt;if(p.starveT>=4){p.starveT=0;if(p.hp>1)p.hp-=1;}}
    if(isWater(head)){p.air-=dt;if(p.air<=0){p.air=0;p.invuln=0;damagePlayer(2,true);p.invuln=1;}}else p.air=Math.min(15,p.air+dt*4);
    if(p.inLava){p.lavaT+=dt;if(p.lavaT>=0.5){p.lavaT=0;p.invuln=0;damagePlayer(4,false,'fire');}}
  }else{p.hp=20;p.food=20;p.air=15;}
}
// voxel raycast; liquids=true also stops on water/lava (buckets, bottles)
function raycast(world,ox,oy,oz,dx,dy,dz,maxDist,liquids){ let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);const sx=Math.sign(dx),sy=Math.sign(dy),sz=Math.sign(dz);const tdx=Math.abs(1/dx),tdy=Math.abs(1/dy),tdz=Math.abs(1/dz);
  let tmx=dx>0?(x+1-ox)*tdx:dx<0?(ox-x)*tdx:Infinity,tmy=dy>0?(y+1-oy)*tdy:dy<0?(oy-y)*tdy:Infinity,tmz=dz>0?(z+1-oz)*tdz:dz<0?(oz-z)*tdz:Infinity;let nx=0,ny=0,nz=0,t=0;
  while(t<=maxDist){const b=world.getBlock(x,y,z);if(b!==AIR&&(liquids||!LIQ[b])&&b!==PORTAL&&b!==END_PORTAL)return{x,y,z,nx,ny,nz,block:b,t};
    if(tmx<tmy&&tmx<tmz){x+=sx;t=tmx;tmx+=tdx;nx=-sx;ny=0;nz=0;}else if(tmy<tmz){y+=sy;t=tmy;tmy+=tdy;nx=0;ny=-sy;nz=0;}else{z+=sz;t=tmz;tmz+=tdz;nx=0;ny=0;nz=-sz;}} return null; }
function rayAABB(ox,oy,oz,dx,dy,dz,minx,miny,minz,maxx,maxy,maxz){let t0=0,t1=Infinity;const o=[ox,oy,oz],d=[dx,dy,dz],mn=[minx,miny,minz],mx=[maxx,maxy,maxz];
  for(let a=0;a<3;a++){if(Math.abs(d[a])<1e-9){if(o[a]<mn[a]||o[a]>mx[a])return-1;continue;}let ta=(mn[a]-o[a])/d[a],tb=(mx[a]-o[a])/d[a];if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return-1;}return t0;}

// ---------------------------------------------------------------------
// INVENTORY: 36 slots (0-8 hotbar) + 4 armor; ItemStack = {id,count,dur,ench}
// ---------------------------------------------------------------------
const inventory={slots:[],armor:[],sel:0,creative:false,cursor:{id:0,count:0}};
const empty=()=>({id:0,count:0});
const setStack=(d,s)=>{d.id=s.id;d.count=s.count;d.dur=s.dur||0;d.ench=s.ench;};
const clearStack=d=>{d.id=0;d.count=0;d.dur=0;d.ench=undefined;};
function resetInventory(){inventory.slots=Array.from({length:36},empty);inventory.armor=Array.from({length:4},empty);inventory.sel=0;inventory.cursor=empty();}
function invAdd(id,count=1,dur=0,ench){ if(id===0||count<=0)return 0;const max=ITEMS[id].stack;
  if(max>1)for(const s of inventory.slots){if(s.id===id&&s.count<max){const n=Math.min(count,max-s.count);s.count+=n;count-=n;if(!count)return 0;}}
  for(const s of inventory.slots){if(s.count===0){s.id=id;const n=Math.min(count,max);s.count=n;s.dur=dur;s.ench=ench;count-=n;if(!count)return 0;}} return count; }
function invCount(id){return inventory.slots.reduce((n,s)=>n+(s.id===id?s.count:0),0);}
function invRemove(id,count){for(const s of inventory.slots){if(s.id===id&&count>0){const n=Math.min(count,s.count);s.count-=n;count-=n;if(s.count===0)clearStack(s);}}}
function selected(){return inventory.slots[inventory.sel];} function heldItem(){const s=selected();return s.count>0?ITEMS[s.id]:null;}
function consumeHeld(){const s=selected();s.count--;if(!s.count)clearStack(s);}
function replaceHeld(id){ const s=selected(); if(inventory.creative)return; if(s.count>1){s.count--;if(invAdd(id,1))spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],id,1);} else {clearStack(s);s.id=id;s.count=1;} updateHotbar(); }
function damageTool(s,n=1){ const it=ITEMS[s.id]; if(!it||!it.maxDur||inventory.creative)return; const u=s.ench&&s.ench.Unbreaking||0; if(u&&Math.random()<u/(u+1))return; s.dur=(s.dur||0)+n; if(s.dur>=it.maxDur){clearStack(s);sfx.break();} updateHotbar(); }
function dropAllInventory(){ for(const arr of [inventory.slots,inventory.armor])for(const s of arr){ if(s.count){spawnItem(player.pos[0],player.pos[1]+1,player.pos[2],s.id,s.count,s.dur,[rand(-3,3),rand(2,5),rand(-3,3)],s.ench);clearStack(s);} } updateHotbar(); }

// crafting
function craftResult(grid,w){
  const h=grid.length/w; let minx=w,miny=h,maxx=-1,maxy=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(grid[y*w+x].count){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}
  if(maxx<0)return null; const bw=maxx-minx+1,bh=maxy-miny+1;
  for(const r of SHAPED){ if(r.pat[0].length!==bw||r.pat.length!==bh)continue;
    for(const mirror of [false,true]){ let ok=true; for(let y=0;y<bh&&ok;y++)for(let x=0;x<bw;x++){const ch=r.pat[y][mirror?bw-1-x:x],want=ch===' '?0:r.key[ch],cell=grid[(miny+y)*w+minx+x];if(want!==(cell.count?cell.id:0)){ok=false;break;}} if(ok)return r.out; } }
  const ids=grid.filter(s=>s.count).map(s=>s.id).sort((a,b)=>a-b).join(',');
  for(const r of SHAPELESS)if(r.in.slice().sort((a,b)=>a-b).join(',')===ids)return r.out;
  return null;
}
function allRecipes(){return SHAPED.map(r=>({out:r.out,cells:r.pat.join('').split('').filter(c=>c!==' ').map(c=>r.key[c]),size:Math.max(r.pat.length,r.pat[0].length),r}))
  .concat(SHAPELESS.map(r=>({out:r.out,cells:r.in,size:Math.ceil(Math.sqrt(r.in.length)),r})));}
function recipeNeeds(rc){const m={};for(const id of rc.cells)m[id]=(m[id]||0)+1;return m;}
function canFill(rc,gw){if(rc.size>gw)return false;if(inventory.creative)return true;const n=recipeNeeds(rc);return Object.entries(n).every(([id,c])=>invCount(+id)>=c);}
function enchOptions(s){ const I=ITEMS[s.id],kind=itemKind(I); if(!kind)return []; const names=Object.keys(ENCH).filter(n=>ENCH[n].kinds.includes(kind)); if(!names.length)return [];
  return [1,2,3].map(cost=>{const name=names[Math.floor(Math.random()*names.length)];const cur=s.ench&&s.ench[name]||0;const lvl=Math.min(ENCH[name].max,Math.max(cur+1,cost+(Math.random()<0.3?1:0)));return {name,lvl,cost};}); }
function applyEnchant(s,o){ s.ench={...(s.ench||{}),[o.name]:Math.max(o.lvl,s.ench&&s.ench[o.name]||0)}; player.level-=o.cost; sfx.enchant(); }

// ---------------------------------------------------------------------
// ITEM DROPS, XP ORBS, FALLING BLOCKS, PROJECTILES, PRIMED TNT
// ---------------------------------------------------------------------
function spawnItem(x,y,z,id,count,dur,vel,ench){ if(!id||!count)return; if(!ench)for(const it of world.items){ if(it.id===id&&!it.ench&&ITEMS[id].stack>1&&it.count+count<=64&&Math.hypot(it.pos[0]-x,it.pos[1]-y,it.pos[2]-z)<1){it.count+=count;return;} }
  world.items.push({id,count,dur:dur||0,ench,pos:[x,y,z],vel:vel||[rand(-2,2),rand(3,5),rand(-2,2)],w:0.125,h:0.25,onGround:false,age:0,spin:Math.random()*6}); }
function spawnOrbs(x,y,z,total){ while(total>0){const v=Math.min(total,rint(3,10));total-=v;world.orbs.push({value:v,pos:[x,y,z],vel:[rand(-2,2),rand(2,4),rand(-2,2)],w:0.1,h:0.2,onGround:false,age:0});} }
function dropBlockLoot(b,x,y,z){ const B=BLOCKS[b]; let id=b,n=1; const s=selected(),fortune=s.ench&&s.ench.Fortune||0; const drop=(i,c)=>spawnItem(x+0.5,y+0.3,z+0.5,i,c,0);
  if(b===LEAVES){ if(Math.random()<0.06)drop(SAPLING,1); if(Math.random()<0.02)drop(APPLE,1); return; }
  if(b===TALL_GRASS){ if(Math.random()<0.15)drop(SEEDS,1); return; }
  if(b===WHEAT3){ drop(WHEAT,1); drop(SEEDS,rint(1,3)); return; }
  if(b===GRAVEL&&Math.random()<0.15)id=FLINT;
  else if(B.drop){ if(!B.drop[0])return; id=B.drop[0];n=rint(B.drop[1],B.drop[2]); if(fortune&&!ITEMS[id].block)n*=rint(1,1+fortune); }
  drop(id,n); if(B.xp)spawnOrbs(x+0.5,y+0.5,z+0.5,B.xp); }
function updateItems(world,dt){
  for(let i=world.items.length-1;i>=0;i--){ const it=world.items[i]; it.age+=dt; it.spin+=dt*2;
    if(it.age>300||it.pos[1]<-10||!world.getChunk(Math.floor(it.pos[0]/CX),Math.floor(it.pos[2]/CZ))){world.items.splice(i,1);continue;}
    const at=blockAt(world,it,0.1); if(isLava(at)){world.items.splice(i,1);continue;}
    it.vel[1]=isWater(at)?Math.min(it.vel[1]+10*dt,1.5):Math.max(it.vel[1]+GRAVITY*dt,-40); if(it.onGround){it.vel[0]*=0.7;it.vel[2]*=0.7;}
    stepEntity(world,it,dt); if(SOLID[blockAt(world,it,0.1)])it.pos[1]+=1;
    if(it.age>0.6&&!player.dead){ const dx=player.pos[0]-it.pos[0],dy=player.pos[1]+0.9-it.pos[1],dz=player.pos[2]-it.pos[2];const d=Math.hypot(dx,dy,dz);
      if(d<2.2){const k=dt*10;it.pos[0]+=dx/d*k;it.pos[1]+=dy/d*k;it.pos[2]+=dz/d*k;}
      if(d<1.1){const left=invAdd(it.id,it.count,it.dur,it.ench);if(left<it.count){sfx.pickup();updateHotbar();}it.count=left;if(!left)world.items.splice(i,1);} } }
  for(let i=world.orbs.length-1;i>=0;i--){ const o=world.orbs[i]; o.age+=dt; if(o.age>120||o.pos[1]<-10){world.orbs.splice(i,1);continue;}
    o.vel[1]=Math.max(o.vel[1]+GRAVITY*0.5*dt,-20); if(o.onGround){o.vel[0]*=0.8;o.vel[2]*=0.8;} stepEntity(world,o,dt);
    if(!player.dead){ const dx=player.pos[0]-o.pos[0],dy=player.pos[1]+0.9-o.pos[1],dz=player.pos[2]-o.pos[2],d=Math.hypot(dx,dy,dz);
      if(d<4){const k=dt*(14-d*2);o.pos[0]+=dx/d*k;o.pos[1]+=dy/d*k;o.pos[2]+=dz/d*k;} if(d<1){addXp(o.value);sfx.xp();world.orbs.splice(i,1);} } }
}
function startFall(x,y,z){ const b=world.getBlock(x,y,z); if(b!==SAND&&b!==GRAVEL)return; world.setBlock(x,y,z,AIR); world.falling.push({id:b,pos:[x+0.5,y,z+0.5],vel:[0,0,0],w:0.49,h:0.98,onGround:false}); }
function updateFalling(world,dt){ for(let i=world.falling.length-1;i>=0;i--){ const f=world.falling[i]; f.vel[1]=Math.max(f.vel[1]+GRAVITY*dt,-40); stepEntity(world,f,dt);
  if(f.onGround||f.pos[1]<0){ const x=Math.floor(f.pos[0]),y=Math.round(f.pos[1]),z=Math.floor(f.pos[2]); const b=world.getBlock(x,y,z);
    if(b===AIR||REPLACE[b]||WASHABLE[b]){ if(WASHABLE[b])dropBlockLoot(b,x,y,z); world.setBlock(x,y,z,f.id); } else spawnItem(x+0.5,y+0.5,z+0.5,f.id,1,0); world.falling.splice(i,1); } } }
function primeTNT(x,y,z,fuse=4){ world.tnt.push({pos:[x+0.5,y,z+0.5],vel:[rand(-0.5,0.5),3,rand(-0.5,0.5)],w:0.49,h:0.98,onGround:false,fuse}); sfx.hiss(); }
function updateTNT(world,dt){ for(let i=world.tnt.length-1;i>=0;i--){ const t=world.tnt[i]; t.fuse-=dt; t.vel[1]=Math.max(t.vel[1]+GRAVITY*dt,-40); if(t.onGround){t.vel[0]*=0.8;t.vel[2]*=0.8;} stepEntity(world,t,dt);
  if(t.fuse<=0){ world.tnt.splice(i,1); explodeAt(Math.floor(t.pos[0]),Math.floor(t.pos[1]+0.5),Math.floor(t.pos[2]),4,true,0.6); } } }
function shootArrow(from,dir,speed,fromPlayer,o={}){ world.arrows.push({pos:[...from],vel:[dir[0]*speed,dir[1]*speed,dir[2]*speed],age:0,fromPlayer,stuck:false,dmg:o.dmg||(fromPlayer?5:3),fire:!!o.fire}); sfx.bow(); }
function updateArrows(world,dt){
  for(let i=world.arrows.length-1;i>=0;i--){ const a=world.arrows[i]; a.age+=dt; if(a.age>20||a.pos[1]<-10){world.arrows.splice(i,1);continue;} if(a.stuck)continue;
    if(!a.fire)a.vel[1]+=GRAVITY*0.6*dt; const nx=a.pos[0]+a.vel[0]*dt,ny=a.pos[1]+a.vel[1]*dt,nz=a.pos[2]+a.vel[2]*dt;
    const hb=world.getBlock(Math.floor(nx),Math.floor(ny),Math.floor(nz));
    if(SOLID[hb]){ if(a.fire){world.arrows.splice(i,1);continue;} a.stuck=true;a.age=Math.max(a.age,15);continue;}
    a.pos=[nx,ny,nz];
    if(a.fromPlayer){ for(const m of world.mobs){ if(nx>m.pos[0]-m.w&&nx<m.pos[0]+m.w&&ny>m.pos[1]&&ny<m.pos[1]+m.h&&nz>m.pos[2]-m.w&&nz<m.pos[2]+m.w){hurtMob(world,m,a.dmg,[a.vel[0]*0.2,3,a.vel[2]*0.2]);world.arrows.splice(i,1);break;} } }
    else if(!player.dead&&nx>player.pos[0]-0.4&&nx<player.pos[0]+0.4&&ny>player.pos[1]&&ny<player.pos[1]+1.8&&nz>player.pos[2]-0.4&&nz<player.pos[2]+0.4){ damagePlayer(a.dmg,false,a.fire?'fire':null); world.arrows.splice(i,1); }
  }
}

// ---------------------------------------------------------------------
// TILES: chests, furnaces, brewing stands, monster spawners
// ---------------------------------------------------------------------
const tkey=(x,y,z)=>x+','+y+','+z;
function getTile(x,y,z,b){ const k=tkey(x,y,z); let t=world.tiles.get(k); if(!t){
    if(b===CHEST)t={type:'chest',slots:Array.from({length:27},empty)};
    else if(b===FURNACE||b===FURNACE_LIT)t={type:'furnace',inp:empty(),fuel:empty(),out:empty(),burnT:0,burnMax:1,cookT:0};
    else if(b===BREWING_STAND)t={type:'brew',bottles:[empty(),empty(),empty()],ing:empty(),fuel:empty(),fuelLeft:0,t:0};
    else return null; world.tiles.set(k,t); } return t; }
function fillLoot(t,table){ for(const [id,a,b] of LOOT[table]){ const n=rint(a,b); if(!n)continue; const s=t.slots[rint(0,26)]; if(!s.count){s.id=id;s.count=Math.min(n,ITEMS[id].stack);} } }
function brewTarget(t){ if(!t.ing.count||!BREW[t.ing.id])return null; const map=BREW[t.ing.id]; return t.bottles.some(b=>b.count&&map[b.id])?map:null; }
function tickTiles(dt){ for(const [k,t] of world.tiles){ const [x,y,z]=k.split(',').map(Number);
  if(t.type==='furnace'){ const prod=t.inp.count?SMELT[t.inp.id]:null, can=prod&&(t.out.count===0||(t.out.id===prod&&t.out.count<64));
    if(t.burnT<=0&&can&&t.fuel.count&&FUEL[t.fuel.id]){t.burnT=t.burnMax=FUEL[t.fuel.id];if(t.fuel.id===LAVA_BUCKET){t.fuel.id=BUCKET;}else{t.fuel.count--;if(!t.fuel.count)clearStack(t.fuel);}}
    if(t.burnT>0){t.burnT-=dt;if(can){t.cookT+=dt;if(t.cookT>=SMELT_TIME){t.cookT=0;t.out.id=prod;t.out.count++;t.inp.count--;if(!t.inp.count)clearStack(t.inp);}}else t.cookT=Math.max(0,t.cookT-dt*2);} else t.cookT=Math.max(0,t.cookT-dt*2);
    if(net.guest)continue; const lit=t.burnT>0,b=world.getBlock(x,y,z),m=world.getMeta(x,y,z); if(lit&&b===FURNACE)world.setBlock(x,y,z,FURNACE_LIT,true,m);else if(!lit&&b===FURNACE_LIT)world.setBlock(x,y,z,FURNACE,true,m); }
  else if(t.type==='brew'){ const map=brewTarget(t); if(!map){t.t=0;continue;}
    if(t.fuelLeft<=0){ if(t.fuel.count&&t.fuel.id===BLAZE_POWDER){t.fuel.count--;if(!t.fuel.count)clearStack(t.fuel);t.fuelLeft=20;} else {t.t=0;continue;} }
    t.t+=dt; if(t.t>=BREW_TIME){ t.t=0; for(const b of t.bottles)if(b.count&&map[b.id])b.id=map[b.id]; t.ing.count--; if(!t.ing.count)clearStack(t.ing); t.fuelLeft--; sfx.enchant(); } }
  else if(t.type==='spawner'){ const d=Math.hypot(player.pos[0]-x,player.pos[1]-y,player.pos[2]-z); if(d>16||player.dead||inventory.creative)continue; t.t-=dt; if(t.t>0)continue; t.t=rand(4,9);
    if(world.getBlock(x,y,z)!==SPAWNER){world.tiles.delete(k);continue;} if(effectiveLight(world,x+0.5,y+1,z+0.5,sunFactor())>=(t.mob==='ember'?12:9))continue; const near=world.mobs.filter(m=>m.type===t.mob&&Math.hypot(m.pos[0]-x,m.pos[2]-z)<10).length; if(near>=6)continue;
    for(let tries=0;tries<8;tries++){ const sx=x+rint(-4,4),sz=z+rint(-4,4),sy=y+rint(-1,1); if(world.getBlock(sx,sy,sz)===AIR&&world.getBlock(sx,sy+1,sz)===AIR&&(SOLID[world.getBlock(sx,sy-1,sz)]||t.mob==='ember')){spawnMob(world,t.mob,sx+0.5,sy,sz+0.5);break;} } } } }
