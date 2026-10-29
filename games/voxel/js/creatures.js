'use strict';
// =====================================================================
// CREATURES & GEAR: chickens (eggs), spiders, tameable wolves, squid,
// slimes that split, boats you can ride, fishing, throwing snowballs/eggs,
// the shield, compass and clock.
// =====================================================================
function setSlimeSize(m,s){ m.size=s; m.w=0.26*s; m.h=0.5*s; m.hp=s===4?16:s===2?4:1; m.dmg=s===4?4:s===2?2:0; return m; }
// shared walking physics for mobs with their own brains
function moveMob(world,m,dt,tx,tz,speed,moving){ const v=m.vel,inW=isWater(blockAt(world,m,0.3)),k=Math.min(1,dt*(m.onGround?8:2));
  v[0]+=(tx*speed-v[0])*k; v[2]+=(tz*speed-v[2])*k; if(inW)v[1]=Math.min(v[1]+20*dt,3); else v[1]=Math.max(v[1]+GRAVITY*dt,-60);
  stepEntity(world,m,dt); if(m.hitWall&&m.onGround&&moving)v[1]=JUMP_V*0.95; if(moving){ m.phase+=dt*speed*3; m.yaw=Math.atan2(-tx,-tz); } }
// tamed wolves defend their owner
function petsDefend(world,attacker,owner=PROFILE.code,pos=player.pos){ if(!attacker||attacker.tame||attacker.def.vehicle||attacker.proxy)return; for(const w of world.mobs)if(w.tame&&!w.sit&&!w.proxy&&(w.owner||PROFILE.code)===owner&&Math.hypot(w.pos[0]-pos[0],w.pos[2]-pos[2])<24)w.target=attacker; }
function updateSpecial(world,m,dt,sun,dist3,tgt){ const d=m.def;
  if(d.cart)return updateCart(world,m,dt);
  if(d.vehicle)return updateBoat(world,m,dt);
  if(d.horse)return updateHorse(world,m,dt);
  if(d.swim)return updateSquid(world,m,dt);
  if(d.slime)return updateSlime(world,m,dt,dist3,tgt);
  if(d.wolf&&m.tame)return updateTameWolf(world,m,dt);
  if(d.chicken){ m.eggT=(m.eggT??rand(80,200))-dt; if(m.eggT<=0){ m.eggT=rand(80,200); if(!net.guest){ spawnItem(m.pos[0],m.pos[1]+0.3,m.pos[2],EGG,1,0,[0,1,0]); sfx.pop(); } } }
  return false; }
function updateTameWolf(world,m,dt){ const O=petOwner(world,m); let tx=0,tz=0,moving=false,speed=m.def.speed;
  if(m.sit||!O){ m.vel[0]*=0.5; m.vel[2]*=0.5; moveMob(world,m,dt,0,0,0,false); return true; }
  if(m.target&&(m.target.hp<=0||!world.mobs.includes(m.target)))m.target=null;
  const P=O.pos,dist=Math.hypot(P[0]-m.pos[0],P[2]-m.pos[2]);
  if(dist>18&&!O.dead){ for(let t=0;t<10;t++){ const x=Math.floor(P[0]+rand(-2,2)),z=Math.floor(P[2]+rand(-2,2)),y=Math.floor(P[1]); if(SOLID[world.getBlock(x,y-1,z)]&&!SOLID[world.getBlock(x,y,z)]&&!SOLID[world.getBlock(x,y+1,z)]){ m.pos=[x+0.5,y,z+0.5]; m.vel=[0,0,0]; m.target=null; break; } } }
  const tg=m.target;
  if(tg){ const dx=tg.pos[0]-m.pos[0],dz=tg.pos[2]-m.pos[2],l=Math.hypot(dx,dz)||1; tx=dx/l; tz=dz/l; moving=l>1.2; speed*=1.25;
    if(l<1.6+tg.w&&m.attackCd<=0&&Math.abs(tg.pos[1]-m.pos[1])<2){ m.attackCd=0.9; hurtMob(world,tg,4,[dx/l*4,4,dz/l*4]); sfx.bark(); } }
  else if(dist>3.2&&!O.dead){ const dx=P[0]-m.pos[0],dz=P[2]-m.pos[2],l=dist||1; tx=dx/l; tz=dz/l; moving=true; speed*=dist>8?1.4:1; }
  else { m.wanderT-=dt; if(m.wanderT<=0){ m.wanderT=rand(2,5); m.dir=Math.random()<0.4?[Math.sin(m.yaw+rand(-1,1)),Math.cos(m.yaw+rand(-1,1))]:[0,0]; } tx=m.dir[0]; tz=m.dir[1]; moving=!!(tx||tz); speed*=0.4; }
  moveMob(world,m,dt,tx,tz,speed,moving); return true; }
function updateSquid(world,m,dt){ const v=m.vel,inW=isWater(blockAt(world,m,0.4));
  if(inW){ m.wanderT-=dt; if(m.wanderT<=0||!m.dir||m.dir.length<3){ m.wanderT=rand(1.5,4); const a=Math.random()*6.28,s=rand(0.6,1.8); m.dir=[Math.sin(a)*s,rand(-0.7,0.7),Math.cos(a)*s]; }
    if(m.fleeT>0){ const dx=m.pos[0]-player.pos[0],dz=m.pos[2]-player.pos[2],l=Math.hypot(dx,dz)||1; m.dir=[dx/l*3,0.2,dz/l*3]; }
    const k=Math.min(1,dt*1.5); v[0]+=(m.dir[0]-v[0])*k; v[2]+=(m.dir[2]-v[2])*k; v[1]+=(m.dir[1]-v[1])*k; if(!isWater(blockAt(world,m,0.9))&&v[1]>0)v[1]=0;
    stepEntity(world,m,dt); m.phase+=dt*4; if(Math.hypot(v[0],v[2])>0.1)m.yaw=Math.atan2(-v[0],-v[2]); }
  else { v[1]=Math.max(v[1]+GRAVITY*dt,-30); v[0]*=0.9; v[2]*=0.9; stepEntity(world,m,dt); m.dryT=(m.dryT||0)+dt; if(m.dryT>1){ m.dryT=0; m.hp-=1; m.hurtT=0.2; } }
  return true; }
function updateSlime(world,m,dt,dist3,tgt){ const v=m.vel,P=tgt?tgt.pos:player.pos,hostile=!!tgt&&dist3<16,s=m.size||1;
  m.jumpT=(m.jumpT??rand(0.5,2))-dt;
  if(m.onGround){ v[0]*=0.5; v[2]*=0.5; if(m.jumpT<=0){ m.jumpT=rand(1,2.4)/(hostile?1.5:1); let dx,dz; if(hostile){dx=P[0]-m.pos[0];dz=P[2]-m.pos[2];} else { const a=Math.random()*6.28; dx=Math.sin(a); dz=Math.cos(a); }
      const l=Math.hypot(dx,dz)||1,sp=2.4+s*0.3; v[0]=dx/l*sp; v[2]=dz/l*sp; v[1]=5.5+s*0.7; m.yaw=Math.atan2(-dx,-dz); m.phase+=1; } }
  if(isWater(blockAt(world,m,0.2)))v[1]=Math.min(v[1]+20*dt,3); else v[1]=Math.max(v[1]+GRAVITY*dt,-40); stepEntity(world,m,dt);
  if(hostile&&m.dmg>0&&dist3<0.9+m.w&&m.attackCd<=0){ m.attackCd=1; petsDefend(world,m,tgt.code,tgt.pos); hitPlayer(tgt,m.dmg,'mob'); }
  return true; }
// --- boats ---
function updateBoat(world,m,dt){ const v=m.vel,ridden=player.riding===m,inW=isWater(blockAt(world,m,0.25)),under=isWater(blockAt(world,m,0.55));
  if(ridden){ const f=keys['KeyW']?1:keys['KeyS']?-0.5:0,sp=inW||under?7.5:1.2,k=Math.min(1,dt*2); m.yaw=player.yaw; v[0]+=(-Math.sin(player.yaw)*f*sp-v[0])*k; v[2]+=(-Math.cos(player.yaw)*f*sp-v[2])*k; }
  else { const fr=Math.pow(0.25,dt); v[0]*=fr; v[2]*=fr; }
  if(under)v[1]=Math.min(v[1]+18*dt,2.5); else if(inW)v[1]*=Math.pow(0.02,dt); else v[1]=Math.max(v[1]+GRAVITY*dt,-30);
  stepEntity(world,m,dt); return true; }
function mountBoat(m){ mountVehicle(m); }
function mountVehicle(m){ if(m.proxy?(m.rider>=0&&m.rider!==net.myId):(m.rider>0)){ showMsg('Someone else is riding that.'); return; }
  if(m.proxy){ m.local=true; m.vel=[0,0,0]; m.rider=net.myId; net.toHost({t:'ride',nid:m.nid}); }
  player.riding=m; player.sprint=false; player.vel=[0,0,0];
  showMsg(m.def.horse?(m.tame?(m.saddle?'Ride with WASD, Space to jump, Shift to get off':'Put a saddle on the horse to steer it'):'This horse is wild... hold on!'):m.def.cart?'W to push the minecart, Shift to get out':'Press Shift to get out of the boat'); }
// --- horses: mount a wild horse a few times to tame it, then saddle it to ride ---
function updateHorse(world,m,dt){ if(player.riding!==m)return false;
  if(!m.tame){ m.buckT=(m.buckT||0)+dt; m.phase+=dt*6; if(m.buckT>1.6){ m.buckT=0; m.temper=(m.temper||0)+rint(8,22);
      if(m.temper>=40){ m.tame=true; showMsg('♥ The horse trusts you now! Put a saddle on it (right-click with a saddle) to ride it.'); sfx.pop(); }
      else { dismount(); player.vel=[rand(-3,3),6,rand(-3,3)]; showMsg('The horse bucked you off! Keep trying...'); } }
    moveMob(world,m,dt,0,0,0,false); return true; }
  if(!m.saddle){ moveMob(world,m,dt,0,0,0,false); return true; }
  const fwd=(keys['KeyW']?1:0)-(keys['KeyS']?0.4:0),str=(keys['KeyD']?1:0)-(keys['KeyA']?1:0),yw=player.yaw;
  let tx=-Math.sin(yw)*fwd+Math.cos(yw)*str*0.6,tz=-Math.cos(yw)*fwd-Math.sin(yw)*str*0.6; const l=Math.hypot(tx,tz); if(l>1){tx/=l;tz/=l;}
  if(keys['Space']&&m.onGround)m.vel[1]=JUMP_V*1.3;
  moveMob(world,m,dt,tx,tz,player.sprint||keys['ControlLeft']?11:8.5,l>0.01); m.yaw=yw; return true; }
function dismount(){ const b=player.riding; player.riding=null; if(!b)return; if(b.proxy){ b.local=false; b.tp=[...b.pos]; b.tyaw=b.yaw; net.toHost({t:'unride',nid:b.nid,p:b.pos.map(r2),v:[0,0,0],s:b.s||0,dir:b.dir}); } player.pos=[b.pos[0],b.pos[1]+0.9,b.pos[2]]; player.vel=[0,4,0]; player.fallPeak=player.pos[1]; }
// --- fishing ---
let bobber=null;
function useRod(s){ if(bobber){ reelIn(s); return; } const f=forwardVec(); bobber={pos:[player.pos[0]+f[0]*0.6,player.pos[1]+EYE-0.1,player.pos[2]+f[2]*0.6],vel:[f[0]*12,f[1]*12+3,f[2]*12],w:0.08,h:0.15,onGround:false,wasGround:false,hitWall:false,state:'fly',waitT:rand(5,16),biteT:0}; sfx.bow(); player.swing=1; }
function reelIn(s){ const b=bobber; bobber=null; player.swing=1; if(!b)return;
  if(b.state==='float'&&b.biteT>0){ const r=Math.random(), loot=r<0.78?FISH:r<0.84?LEATHER:r<0.9?BONE:r<0.95?STRING:r<0.98?LILY:BOOK;
    const dx=player.pos[0]-b.pos[0],dy=player.pos[1]+1-b.pos[1],dz=player.pos[2]-b.pos[2]; spawnItem(b.pos[0],b.pos[1]+0.3,b.pos[2],loot,1,0,[dx*1.2,dy*1.2+5,dz*1.2]); addXp(rint(1,4)); sfx.splash(); }
  damageTool(s,1); }
function updateBobber(dt){ const b=bobber; if(!b)return; const s=selected();
  if(!s.count||!ITEMS[s.id].rod||player.dead||Math.hypot(b.pos[0]-player.pos[0],b.pos[2]-player.pos[2])>32||game.state!=='playing'){ bobber=null; return; }
  const cell=world.getBlock(Math.floor(b.pos[0]),Math.floor(b.pos[1]),Math.floor(b.pos[2]));
  if(isWater(cell)){ if(b.state!=='float'){ b.state='float'; sfx.splash(); spawnParticles(b.pos[0],b.pos[1]+0.4,b.pos[2],[0.5,0.6,0.95],8,{spread:0.3,up:3,speed:2,life:0.5}); }
    b.vel[0]*=Math.pow(0.05,dt); b.vel[2]*=Math.pow(0.05,dt); const surf=Math.floor(b.pos[1])+0.8-(b.biteT>0?0.25:0); b.vel[1]=(surf-b.pos[1])*5;
    if(b.biteT>0){ b.biteT-=dt; if(b.biteT<=0)b.waitT=rand(5,16); }
    else { b.waitT-=dt*(world.getSky(Math.floor(b.pos[0]),Math.floor(b.pos[1])+1,Math.floor(b.pos[2]))===15&&rainLevel>0.5?1.3:1); if(b.waitT<=0){ b.biteT=1.1; sfx.splash(); spawnParticles(b.pos[0],b.pos[1]+0.4,b.pos[2],[0.5,0.6,0.95],14,{spread:0.4,up:4,speed:3,life:0.6}); } } }
  else { b.vel[1]=Math.max(b.vel[1]+GRAVITY*0.6*dt,-20); if(b.onGround){ b.vel[0]*=0.5; b.vel[2]*=0.5; } }
  stepEntity(world,b,dt); }
// --- throwing snowballs and eggs ---
function throwItem(s,kind){ const f=forwardVec(); shootArrow([player.pos[0]+f[0]*0.3,player.pos[1]+EYE-0.1,player.pos[2]+f[2]*0.3],f,kind==='potion'?16:22,true,{dmg:0,kind,splash:ITEMS[s.id].splash}); player.swing=1; if(!inventory.creative)consumeHeld(); updateHotbar(); }
// wind charge: a burst that throws everything nearby (you too) up and away, without breaking blocks
function windBurst(pos,fromPlayer,selfOnly){ sfx.wind(); spawnParticles(pos[0],pos[1],pos[2],[0.85,0.95,1],22,{spread:1.2,speed:6,up:4,g:0,life:0.5,size:0.12,alpha:0.8});
  const p=player.pos,dx=p[0]-pos[0],dy=p[1]+0.9-pos[1],dz=p[2]-pos[2],d=Math.hypot(dx,dy,dz);
  if(d<2.6&&!player.spectator){ const k=(2.6-d)/2.6; player.vel[0]+=dx/(d||1)*7*k; player.vel[2]+=dz/(d||1)*7*k; player.vel[1]=Math.max(player.vel[1],8+13*k); player.windY=p[1]; player.fallPeak=p[1]; player.onGround=false; }
  if(selfOnly)return;
  for(const m of world.mobs){ if(m.def.boss||m.def.vehicle)continue; const mx=m.pos[0]-pos[0],my=m.pos[1]+m.h/2-pos[1],mz=m.pos[2]-pos[2],md=Math.hypot(mx,my,mz); if(md<2.6){ const k=(2.6-md)/2.6; pushMob(m,mx/(md||1)*8*k,9*k+3,mz/(md||1)*8*k); } } }
// mace smash: extra damage for every block fallen, no fall damage, nearby mobs are knocked away
function maceSmash(target,s){ const fall=player.fallPeak-player.pos[1]; if(player.onGround||fall<1.5)return 0;
  let bonus=fall<=3?4*fall:fall<=8?12+2*(fall-3):22+(fall-8); bonus+=(s.ench&&s.ench.Density||0)*0.5*fall;
  player.fallPeak=player.pos[1]; sfx.smash(); spawnParticles(target.pos[0],target.pos[1]+0.1,target.pos[2],[0.6,0.55,0.5],30,{spread:2.5,speed:7,up:3,life:0.6,size:0.1});
  for(const m of world.mobs){ if(m===target||m.tame||m.def.vehicle||m.def.boss)continue; const dx=m.pos[0]-target.pos[0],dz=m.pos[2]-target.pos[2],d=Math.hypot(dx,dz); if(d<3.5&&Math.abs(m.pos[1]-target.pos[1])<3)pushMob(m,dx/(d||1)*7,6,dz/(d||1)*7); }
  const wb=s.ench&&s.ench['Wind Burst']||0; if(wb){ player.vel[1]=6+wb*3.5; player.windY=player.pos[1]; } else player.vel[1]=Math.max(player.vel[1],-2);
  damageTool(s,1); showMsg('Smash! +'+Math.round(bonus)); return bonus; }
function projectileLanded(a){ if(a.kind==='wind'){ windBurst(a.pos,true,!!a.visual); return; } if(a.kind==='potion'){ splashEffect(a.pos,a.splash,!!a.visual); return; } spawnParticles(a.pos[0],a.pos[1],a.pos[2],a.kind==='egg'?[0.95,0.9,0.75]:[0.95,0.97,1],8,{spread:0.2,speed:3,up:2,life:0.4});
  if(a.kind==='egg'&&Math.random()<0.125&&!net.guest&&!(a.visual&&a.mob)){ const c=spawnMob(world,'chicken',a.pos[0],a.pos[1],a.pos[2]); c.baby=1; } }
// --- shield, compass, clock ---
function blockingNow(){ const s=selected(); return !!(locked&&mouseDown[2]&&s.count&&ITEMS[s.id].shield&&!player.dead); }
const ARROWS='↑↗→↘↓↙←↖';
function heldGadgetText(){ const s=selected(); if(!s.count)return ''; const I=ITEMS[s.id];
  if(I.compass){ if(world.dim!=='over')return '<div style="color:#fbb">Compass: spinning wildly...</div>'; const dx=player.spawn[0]-player.pos[0],dz=player.spawn[2]-player.pos[2],d=Math.hypot(dx,dz);
    const ang=Math.atan2(dx,-dz)-Math.atan2(-Math.sin(player.yaw),Math.cos(player.yaw)*-1); const i=Math.round(((ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI/4))%8;
    return `<div style="color:#ffd">Compass: spawn ${ARROWS[i]} ${Math.round(d)} blocks</div>`; }
  if(I.clock){ if(world.dim!=='over')return '<div style="color:#fbb">Clock: the hands spin...</div>'; const h=((dayTime+0.25)%1)*24,hh=Math.floor(h),mm=Math.floor((h-hh)*60); return `<div style="color:#ffd">Clock: ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${sunFactor()>0.5?'☀ day':'☾ night'}</div>`; }
  return ''; }
// enchanting gets stronger with bookshelves around the table (like Minecraft: up to 15, two blocks away)
function countShelves(t){ if(!t||!t.pos)return 0; const [x,y,z]=t.pos; let n=0; for(let dy=0;dy<=1;dy++)for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){ if(Math.max(Math.abs(dx),Math.abs(dz))!==2)continue; if(world.getBlock(x+dx,y+dy,z+dz)===BOOKSHELF)n++; } return Math.min(15,n); }
// pets and boats are remembered with the world
function savePets(w){ return w.mobs.filter(m=>(m.tame||m.def.vehicle)&&!m.proxy).map(m=>[m.type,m.pos.map(v=>Math.round(v*100)/100),m.sit?1:0,Math.round(m.hp),m.saddle?1:0,m.s||0,m.dir??-1,m.owner||0]); }
function loadPets(w,list){ for(const [type,pos,sit,hp,saddle,s,dir,owner] of list||[]){ if(!MOB_TYPES[type])continue; const m=spawnMob(w,type,pos[0],pos[1],pos[2]); if(m.def.wolf||m.def.horse){ m.tame=true; m.sit=!!sit; } if(m.def.horse)m.saddle=!!saddle; if(m.def.cart){ m.s=0; if(dir>=0)m.dir=dir; } if(owner)m.owner=owner; m.hp=hp||m.hp; } }
// --- splash potions ---
function splashEffect(pos,fx,selfOnly){ const col=fx==='heal'?[0.95,0.3,0.45]:fx==='poison'?[0.35,0.6,0.2]:fx==='regen'?[0.9,0.45,0.8]:fx==='strength'?[0.7,0.2,0.2]:fx==='speed'?[0.5,0.78,0.95]:fx==='fire'?[0.95,0.6,0.2]:[0.2,0.2,0.7];
  sfx.break(); spawnParticles(pos[0],pos[1]+0.2,pos[2],col,30,{spread:1.5,speed:5,up:4,life:0.8,size:0.08});
  const d=Math.hypot(player.pos[0]-pos[0],player.pos[1]+0.9-pos[1],player.pos[2]-pos[2]); if(d<4.2&&!player.spectator)applyEffect(fx); if(selfOnly)return;
  for(const m of world.mobs){ if(m.def.vehicle||m.def.boss)continue; if(Math.hypot(m.pos[0]-pos[0],m.pos[1]-pos[1],m.pos[2]-pos[2])>4.2)continue;
    if(fx==='heal')m.hp=Math.min(m.def.hp,m.hp+6); else if(fx==='poison')hurtMob(world,m,5,null); } }
// --- trial chambers: a trial spawner sends waves of mobs while players are near; beat them all for a trial key ---
const trialAlive=new Map();
function playersNear(x,y,z,r){ const out=[]; if(game.state==='playing'&&!player.dead&&!player.spectator&&!inventory.creative&&Math.hypot(player.pos[0]-x,player.pos[1]-y,player.pos[2]-z)<r)out.push(player.pos);
  for(const rp of net.remotesIn(world.dim))if(!rp.spec&&!rp.cr&&!rp.dead&&Math.hypot(rp.pos[0]-x,rp.pos[1]-y,rp.pos[2]-z)<r)out.push(rp.pos); return out; }
function tickTrial(k,t,x,y,z,dt){ if(world.getBlock(x,y,z)!==TRIAL_SPAWNER){ world.tiles.delete(k); return; }
  if(t.state==='cool'){ t.cool-=dt; if(t.cool<=0)t.state='idle'; return; }
  const near=playersNear(x+0.5,y,z+0.5,14);
  if(t.state==='idle'){ if(near.length&&difficulty()!=='peaceful'){ t.state='active'; t.total=4+2*(near.length-1); t.spawned=0; t.t=0.5; trialAlive.set(k,[]); showMsg('The trial spawner awakens!'); sfx.roar(); } return; }
  const alive=(trialAlive.get(k)||[]).filter(m=>m.hp>0&&world.mobs.includes(m)); trialAlive.set(k,alive);
  if(Math.random()<dt*6)spawnParticles(x+0.5,y+0.9,z+0.5,[1,0.6,0.2],2,{spread:0.8,speed:1,up:2,g:2,life:0.6,size:0.06});
  if(!near.length){ t.state='idle'; return; }
  t.t-=dt; if(alive.length<2&&t.spawned<t.total&&t.t<=0){ t.t=1.6;
    for(let tries=0;tries<12;tries++){ const sx=x+rint(-4,4),sz=z+rint(-4,4),sy=y+rint(-1,1); if(world.getBlock(sx,sy,sz)===AIR&&world.getBlock(sx,sy+1,sz)===AIR&&(SOLID[world.getBlock(sx,sy-1,sz)]||t.mob==='gust')){
      const m=spawnMob(world,t.mob,sx+0.5,sy+(t.mob==='gust'?1:0),sz+0.5); m.trial=true; alive.push(m); t.spawned++; smokeParticles(sx+0.5,sy+0.5,sz+0.5,10,0.6); break; } } }
  if(t.spawned>=t.total&&!alive.length){ t.state='cool'; t.cool=600; spawnItem(x+0.5,y+1.2,z+0.5,TRIAL_KEY,near.length,0,[0,4,0]);
    for(const [id,a,b,ch] of LOOT.trialReward){ if(Math.random()<0.4){ const n=rint(a,b); if(n)spawnItem(x+0.5,y+1.2,z+0.5,id,n,0,[rand(-2,2),4,rand(-2,2)]); } }
    showMsg('Trial complete! The spawner rewards you with a Trial key.'); sfx.enchant(); addXp(10); } }
// vaults: each player can open each vault once with a trial key
function vaultLoot(x,y,z,code){ const k=tkey(x,y,z); let t=world.tiles.get(k); if(!t){ t={type:'vault',used:[]}; world.tiles.set(k,t); }
  if(t.used.includes(code))return false; t.used.push(code); sfx.enchant();
  const f=DIRV[world.getMeta(x,y,z)&7]||[0,0,-1]; let given=0;
  for(const [id,a,b,ch] of LOOT.vault){ if(ch!==undefined&&Math.random()>ch)continue; if(given>=4)break; const n=rint(a,b); if(!n)continue; given++; spawnItem(x+0.5+f[0]*0.7,y+0.6,z+0.5+f[2]*0.7,id,n,0,[f[0]*3+rand(-1,1),3,f[2]*3+rand(-1,1)]); }
  scheduleSave(); return true; }
function openVault(x,y,z){ const s=selected(); if(s.id!==TRIAL_KEY){ showMsg('This vault opens with a Trial key. Beat a trial spawner to get one.'); return; }
  if(net.shared()){ net.toHost({t:'vault',dim:world.dim,x,y,z,code:PROFILE.code}); return; }
  if(!vaultLoot(x,y,z,PROFILE.code)){ showMsg('This vault already gave you its treasure.'); return; }
  if(!inventory.creative)consumeHeld(); updateHotbar(); showMsg('The vault opens and spills its treasure!'); }
