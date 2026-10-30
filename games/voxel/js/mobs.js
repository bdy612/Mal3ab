'use strict';
// MOBS
// ---------------------------------------------------------------------
// a guest sharing the host's world never adds mobs itself: the host spawns them (boats and carts are requested by the caller)
function spawnMob(w,type,x,y,z){ const m=newMob(type,x,y,z); if(net.sharedW(w)){ m.detached=true; return m; } w.mobs.push(m); return m; }
function newMob(type,x,y,z){const d=MOB_TYPES[type];const m={type,def:d,pos:[x,y,z],vel:[0,0,0],yaw:Math.random()*6.28,w:d.w,h:d.h,hp:d.hp,onGround:false,hitWall:false,wanderT:0,dir:[0,0],hurtT:0,attackCd:rand(0,2),fuse:0,phase:0,fleeT:0,burnT:0,age:0,sheared:false,regrow:0,angry:0,tpT:0,angle:Math.random()*6.28,state:'circle',stateT:0,love:0,loveCd:0};
  if(d.slime)setSlimeSize(m,[1,2,4][rint(0,2)]);
  if(d.trader){m.trades=[];const pool=TRADES.slice();for(let i=0;i<4&&pool.length;i++)m.trades.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);} return m;}
function hurtMob(world,m,dmg,kb){ if(m.proxy){ if(blockFx>0)return; m.hurtT=0.3; sfx.mobhurt(); net.toHost({t:'hit',nid:m.nid,dmg,kb:kb?kb.map(r2):0}); return; }
  m.lastHit=m.foe=net.hitBy||0; m.hp-=dmg;m.hurtT=0.3;sfx.mobhurt();if(kb&&!m.def.boss){m.vel[0]+=kb[0];m.vel[1]=kb[1];m.vel[2]+=kb[2];}m.fleeT=3;if(m.def.neutral&&!m.tame){m.angry=20;for(const o of world.mobs)if(o.type===m.type&&Math.hypot(o.pos[0]-m.pos[0],o.pos[2]-m.pos[2])<16)o.angry=20;}
  if(m.def.stare&&Math.random()<0.5)teleportMob(world,m);}
function teleportMob(world,m){ for(let t=0;t<12;t++){ const x=Math.floor(m.pos[0]+rand(-12,12)),z=Math.floor(m.pos[2]+rand(-12,12)); let y=Math.floor(m.pos[1])+8; while(y>1&&!SOLID[world.getBlock(x,y-1,z)])y--; if(y<=1)continue; if(world.getBlock(x,y,z)===AIR&&world.getBlock(x,y+1,z)===AIR&&world.getBlock(x,y+2,z)===AIR){m.pos=[x+0.5,y,z+0.5];m.vel=[0,0,0];sfx.teleport();return;} } }
const BLAST_PROOF=new Set([AIR,BEDROCK,OBSIDIAN,END_FRAME,END_FRAME_EYE,END_PORTAL,PORTAL,ENCHANT_TABLE]);
function explodeAt(x,y,z,r,blocks,dropChance=0.3){ if(blockFx>0&&net.shared())return; sfx.explode(); smokeParticles(x+0.5,y+0.5,z+0.5,40,r); flashT=Math.max(flashT,0.05);
  if(blocks)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy+dz*dz>r*r+1)continue;const bx=x+dx,by=y+dy,bz=z+dz,b=world.getBlock(bx,by,bz);if(BLAST_PROOF.has(b)||LIQ[b])continue;
    if(b===TNT){world.setBlock(bx,by,bz,AIR);primeTNT(bx,by,bz,rand(0.5,1.5));continue;} world.setBlock(bx,by,bz,AIR);if(Math.random()<dropChance)dropBlockLoot(b,bx,by,bz);}
  explodeHurtSelf(x,y,z,r); if(net.role)net.shareBoom(x,y,z,r);
  for(const m of world.mobs){const dm=Math.hypot(m.pos[0]-x,m.pos[1]-y,m.pos[2]-z);if(dm<r*2&&!m.def.boss)hurtMob(world,m,Math.round(14*(1-dm/(r*2))),null);} scheduleSave(); }
function effectiveLight(world,x,y,z,sun){const l=world.getLight(Math.floor(x),Math.floor(y),Math.floor(z));return Math.max((l&15)*sun,l>>4);}
function lookingAt(m){ const f=forwardVec(),dx=m.pos[0]-player.pos[0],dy=m.pos[1]+m.h*0.9-player.pos[1]-EYE,dz=m.pos[2]-player.pos[2],d=Math.hypot(dx,dy,dz); if(d>40)return false; return (f[0]*dx+f[1]*dy+f[2]*dz)/d>0.985; }
function updateMobs(world,dt,sun){
  const T=playerTargets(world);   // this player plus (on the host) every friend in this dimension
  for(let i=world.mobs.length-1;i>=0;i--){ const m=world.mobs[i],d=m.def,v=m.vel;m.age+=dt;
    if(d.hostile&&!d.boss&&difficulty()==='peaceful'){ world.mobs.splice(i,1); continue; }   // monsters vanish in peaceful
    // nearest player of any kind (for despawning) and nearest one mobs can go after
    let near=Infinity,tgt=null,td=Infinity;
    for(const t of T){ const dd=Math.hypot(t.pos[0]-m.pos[0],t.pos[1]-m.pos[1],t.pos[2]-m.pos[2]); if(dd<near)near=dd; if(!t.ghost&&dd<td){td=dd;tgt=t;} }
    if(m.angry>0&&m.foe!==undefined){ const f=T.find(t=>t.id===m.foe&&!t.ghost); if(f){ tgt=f; td=Math.hypot(f.pos[0]-m.pos[0],f.pos[1]-m.pos[1],f.pos[2]-m.pos[2]); } }
    const P=tgt?tgt.pos:player.pos,dist3=tgt?td:Infinity,c=world.getChunk(Math.floor(m.pos[0]/CX),Math.floor(m.pos[2]/CZ));
    if(!c&&(m.tame||d.vehicle)&&m.hp>0&&m.pos[1]>-10)continue;   // pets and boats wait in unloaded chunks
    if(!c||(near>60&&!d.boss&&!m.tame&&!d.vehicle&&!(m.rider>0))||m.hp<=0||m.pos[1]<-10){
      if(m.hp<=0&&d.slime&&(m.size||1)>1&&!net.guest)for(let k=rint(2,3);k>0;k--)setSlimeSize(spawnMob(world,'slime',m.pos[0]+rand(-0.4,0.4),m.pos[1]+0.3,m.pos[2]+rand(-0.4,0.4)),m.size/2);
      if(player.riding===m)dismount();
      if(m.hp<=0&&!(d.slime&&(m.size||1)>1)){ if(d.drops)for(const [id,a,b] of d.drops){if(id===WOOL&&m.sheared)continue;const n=rint(a,b);if(n)spawnItem(m.pos[0],m.pos[1]+0.5,m.pos[2],id,n,0);} if(d.ranged&&!d.fly&&Math.random()<0.15)spawnItem(m.pos[0],m.pos[1]+0.5,m.pos[2],BOW,1,0);
        if(d.xp){ if(m.lastHit>0&&net.role==='host')net.sendTo(m.lastHit,{t:'xp',p:m.pos.map(r2),n:d.xp}); else spawnOrbs(m.pos[0],m.pos[1]+0.5,m.pos[2],d.xp); } if(d.boss)dragonDefeated(); }
      world.mobs.splice(i,1);continue; }
    m.hurtT=Math.max(0,m.hurtT-dt);m.attackCd=Math.max(0,m.attackCd-dt);m.fleeT=Math.max(0,m.fleeT-dt);m.angry=Math.max(0,m.angry-dt); if(m.sheared){m.regrow-=dt;if(m.regrow<=0)m.sheared=false;}
    if(m.rider>0)continue;   // a friend is riding it: their game steers it and sends us where it is
    if(d.boss){updateDragon(world,m,dt);continue;}
    if(updateSpecial(world,m,dt,sun,dist3,tgt))continue;
    const inWater=isWater(blockAt(world,m,0.3))||isWater(blockAt(world,m,m.h*0.8)); if(blockAt(world,m,0.3)===FIRE&&!d.fire){m.hp-=2*dt;m.hurtT=0.2;m.burnT=Math.max(m.burnT,0.5);} if(isLava(blockAt(world,m,0.3))&&!d.fire){m.hp-=4*dt;m.hurtT=0.2;} if(inWater&&(d.stare||d.fire)){m.hp-=3*dt;m.hurtT=0.2;if(d.stare)teleportMob(world,m);}
    if(d.stare&&!m.angry&&tgt&&tgt.id===0&&lookingAt(m)){ m.angry=30; m.foe=0; }
    const hostile=((d.hostile&&!(d.dayNeutral&&effectiveLight(world,m.pos[0],m.pos[1]+0.5,m.pos[2],sun)>=11))||m.angry>0)&&dist3<24;
    let tx=0,tz=0,speed=d.speed,moving=false;
    if(hostile){
      const dx=P[0]-m.pos[0],dz=P[2]-m.pos[2],l=Math.hypot(dx,dz)||1;tx=dx/l;tz=dz/l;moving=true;m.yaw=Math.atan2(-tx,-tz);
      if(d.fuse){ if(dist3<2.8){ if(m.fuse===0)sfx.hiss(); m.fuse+=dt;moving=dist3>1.2;if(m.fuse>=1.5){explodeAt(Math.floor(m.pos[0]),Math.floor(m.pos[1]+0.5),Math.floor(m.pos[2]),3,true);m.hp=0;} } else m.fuse=Math.max(0,m.fuse-dt*2); }
      else if(d.ranged){ if(dist3<5){tx=-tx;tz=-tz;} else if(dist3<9)moving=false; if(dist3<16&&m.attackCd<=0){m.attackCd=d.fire?2.5:2.2;const sy=m.pos[1]+(d.fly?0.8:1.5),dy=(P[1]+1.2)-sy+(d.fire?0:dist3*0.08),Ln=Math.hypot(dx,dy,dz);shootArrow([m.pos[0],sy,m.pos[2]],[dx/Ln,dy/Ln,dz/Ln],d.fire?16:d.wind?14:22,false,{fire:!!d.fire,dmg:d.wind?1:d.fire?4:3,kind:d.wind?'wind':undefined});} }
      else if(dist3<1.5+m.w){moving=false;if(m.attackCd<=0){m.attackCd=1;petsDefend(world,m,tgt.code,tgt.pos);hitPlayer(tgt,d.dmg,'mob');}}
      if(d.stare){m.tpT+=dt;if(dist3>10&&m.tpT>3){m.tpT=0;const x=Math.floor(P[0]+rand(-3,3)),z=Math.floor(P[2]+rand(-3,3));let y=Math.floor(P[1])+3;while(y>1&&!SOLID[world.getBlock(x,y-1,z)])y--;if(y>1&&world.getBlock(x,y,z)===AIR&&world.getBlock(x,y+1,z)===AIR){m.pos=[x+0.5,y,z+0.5];sfx.teleport();}}}
    }else{
      m.loveCd=Math.max(0,m.loveCd-dt); if(m.love>0)m.love-=dt;
      const mate=m.love>0?world.mobs.find(o=>o!==m&&o.type===m.type&&o.love>0&&Math.hypot(o.pos[0]-m.pos[0],o.pos[2]-m.pos[2])<8):null;
      const lure=d.passive&&!d.trader&&!mate?T.find(t=>!t.spec&&(d.food||[WHEAT]).includes(t.held)&&Math.hypot(t.pos[0]-m.pos[0],t.pos[2]-m.pos[2])<8):null;
      if(mate||lure){ const tp=mate?mate.pos:lure.pos,dx=tp[0]-m.pos[0],dz=tp[2]-m.pos[2],l=Math.hypot(dx,dz)||1; if(l>1.2){tx=dx/l;tz=dz/l;moving=true;speed*=0.8;m.yaw=Math.atan2(-tx,-tz);}
        if(mate&&l<1.5){ m.love=mate.love=0; m.loveCd=mate.loveCd=60; spawnMob(world,m.type,(m.pos[0]+mate.pos[0])/2,m.pos[1]+0.2,(m.pos[2]+mate.pos[2])/2); spawnOrbs(m.pos[0],m.pos[1]+0.5,m.pos[2],rint(1,7)); sfx.pickup(); } }
      else if(m.fleeT>0&&(d.passive)){ let F=player.pos,fd=Infinity; for(const t of T){ const dd=Math.hypot(t.pos[0]-m.pos[0],t.pos[2]-m.pos[2]); if(dd<fd){fd=dd;F=t.pos;} }
        const dx=m.pos[0]-F[0],dz=m.pos[2]-F[2],l=Math.hypot(dx,dz)||1;tx=dx/l;tz=dz/l;speed*=1.8;moving=true;m.yaw=Math.atan2(-tx,-tz);}
      else{m.wanderT-=dt;if(m.wanderT<=0){m.wanderT=rand(2,6);if(Math.random()<0.5){const a=Math.random()*6.28;m.dir=[Math.sin(a),Math.cos(a)];m.yaw=Math.atan2(-m.dir[0],-m.dir[1]);}else m.dir=[0,0];}tx=m.dir[0];tz=m.dir[1];moving=tx!==0||tz!==0;speed*=0.6;}
    }
    if(d.fly){ // hover a few blocks above the ground, drift toward target
      let gy=Math.floor(m.pos[1]); while(gy>1&&!SOLID[world.getBlock(Math.floor(m.pos[0]),gy-1,Math.floor(m.pos[2]))]&&m.pos[1]-gy<8)gy--; const want=gy+3.5+Math.sin(m.age*2)*0.5;
      const k=Math.min(1,dt*3);v[0]+=(tx*speed-v[0])*k;v[2]+=(tz*speed-v[2])*k;v[1]+=((want-m.pos[1])*2-v[1])*k; stepFlyer(world,m,dt); if(moving)m.phase+=dt*6; continue; }
    const k=Math.min(1,dt*(m.onGround?8:2));v[0]+=(tx*speed-v[0])*k;v[2]+=(tz*speed-v[2])*k;
    if(inWater)v[1]=Math.min(v[1]+20*dt,3);else v[1]=Math.max(v[1]+GRAVITY*dt,-60);
    if(d.flutter&&v[1]<-3)v[1]=-3;
    stepEntity(world,m,dt); if(m.hitWall&&m.onGround&&moving)v[1]=JUMP_V*0.95; if(d.climb&&m.hitWall&&moving)v[1]=3.2; if(moving)m.phase+=dt*speed*3;
    if(d.burns&&world.dim==='over'&&sun>0.75&&world.getSky(Math.floor(m.pos[0]),Math.floor(m.pos[1]+m.h),Math.floor(m.pos[2]))===15){m.burnT+=dt;if(m.burnT>=1){m.burnT=0;m.hp-=1;m.hurtT=0.2;}}
  }
}
function updateDragon(world,m,dt){ const P=player.pos; m.stateT+=dt; const crystals=world.gen.crystals.filter(([x,y,z])=>world.getBlock(x,y+1,z)===END_CRYSTAL).length; if(crystals&&m.hp<m.def.hp)m.hp=Math.min(m.def.hp,m.hp+crystals*dt);
  let target;
  if(m.state==='circle'){ m.angle+=dt*0.3; target=[Math.cos(m.angle)*30,85+Math.sin(m.angle*2)*4,Math.sin(m.angle)*30]; if(m.stateT>10&&!player.dead&&!player.spectator){m.state='dive';m.stateT=0;sfx.roar();} }
  else { target=[P[0],P[1]+1.5,P[2]]; if(m.stateT>4.5){m.state='circle';m.stateT=0;} }
  const dx=target[0]-m.pos[0],dy=target[1]-m.pos[1],dz=target[2]-m.pos[2],l=Math.hypot(dx,dy,dz)||1,sp=m.state==='dive'?16:11,k=Math.min(1,dt*2);
  m.vel[0]+=(dx/l*sp-m.vel[0])*k;m.vel[1]+=(dy/l*sp-m.vel[1])*k;m.vel[2]+=(dz/l*sp-m.vel[2])*k;
  m.pos[0]+=m.vel[0]*dt;m.pos[1]=Math.max(62,m.pos[1]+m.vel[1]*dt);m.pos[2]+=m.vel[2]*dt; m.yaw=Math.atan2(-m.vel[0],-m.vel[2]); m.phase+=dt*4;
  if(Math.hypot(P[0]-m.pos[0],P[1]+0.9-m.pos[1]-1,P[2]-m.pos[2])<3.5&&m.attackCd<=0&&!player.spectator&&!inventory.creative){m.attackCd=1.2;damagePlayer(8,false,'mob');player.vel[0]+=m.vel[0]*0.6;player.vel[1]=8;player.vel[2]+=m.vel[2]*0.6;}
}
function dragonDefeated(){ world.flags.dragonDead=true; sfx.roar(); showMsg('The dragon is defeated! The exit portal has opened.'); for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)world.setBlock(x,END_EXIT_Y,z,END_PORTAL); spawnOrbs(0,END_EXIT_Y+6,0,300); scheduleSave(); }
function trySpawn(world,sun){
  if(!rule('mobSpawn'))return; const peaceful=difficulty()==='peaceful';
  const C=[player.pos].concat(net.role==='host'?net.remotesIn(world.dim).filter(r=>!r.spec).map(r=>r.pos):[]),np=Math.min(C.length,3),P=C[Math.floor(Math.random()*C.length)];
  const hostile=world.mobs.filter(m=>(m.def.hostile||m.def.neutral)&&!m.tame).length,passive=world.mobs.filter(m=>m.def.passive&&!m.def.swim&&!m.def.trader).length,dim=world.dim,hostileCap=(dim==='over'?(sun<0.5?10:4):12)*np;
  for(let tries=0;tries<6;tries++){ const a=Math.random()*6.28,r=rand(14,36),x=Math.floor(P[0]+Math.sin(a)*r),z=Math.floor(P[2]+Math.cos(a)*r);
    const c=world.getChunk(x>>4,z>>4);if(!c||!c.generated)continue; let y=Math.random()<0.5?CY-3:Math.floor(rand(4,72)); while(y>1&&!SOLID[world.getBlock(x,y-1,z)])y--;
    if(y<=1||world.getBlock(x,y,z)!==AIR||world.getBlock(x,y+1,z)!==AIR)continue; const ground=world.getBlock(x,y-1,z),light=effectiveLight(world,x+0.5,y,z+0.5,sun);
    if(dim==='nether'){ if(hostile<hostileCap&&!peaceful){const rr=Math.random(),fort=c.fortress&&y>FORT_Y-2&&y<FORT_Y+8;
        if(fort){ if(rr<0.5)spawnMob(world,'charred',x+0.5,y,z+0.5); else spawnMob(world,'ember',x+0.5,y+1,z+0.5); return; }
        if(rr<0.7)spawnMob(world,'hogwalker',x+0.5,y,z+0.5);else if(world.getBlock(x,y+3,z)===AIR)spawnMob(world,'ember',x+0.5,y+3,z+0.5);else continue;return;} continue; }
    if(dim==='end'){ if(hostile<hostileCap&&!peaceful&&ground===END_STONE){spawnMob(world,'shade',x+0.5,y,z+0.5);return;} continue; }
    if(hostile<hostileCap&&!peaceful&&light<7&&Math.random()<0.7){const rr=Math.random();
      if(y<40&&rr<0.12){ spawnMob(world,'slime',x+0.5,y,z+0.5); return; }
      if(y<30&&rr<0.17){ spawnMob(world,'gust',x+0.5,y+1,z+0.5); return; }
      spawnMob(world,rr<0.4?'zombie':rr<0.62?'skeleton':rr<0.8?'spider':rr<0.95?'boomer':'shade',x+0.5,y,z+0.5);return;}
    if(passive<8*np&&(ground===GRASS||ground===SNOW)&&light>=9){const rr=Math.random(),biome=world.gen.column?world.gen.column(x,z).biome:null;
      if(rr<0.08&&(biome===BIOME.FOREST||biome===BIOME.SNOW)){ for(let k=rint(1,3);k>0;k--)spawnMob(world,'wolf',x+0.5+rand(-1,1),y,z+0.5+rand(-1,1)); return; }
      if(rr>0.92&&biome===BIOME.PLAINS){ for(let k=rint(2,3);k>0;k--)spawnMob(world,['horse','horse_white','horse_black'][rint(0,2)],x+0.5+rand(-1.5,1.5),y,z+0.5+rand(-1.5,1.5)); return; }
      spawnMob(world,rr<0.3?'pig':rr<0.55?'cow':rr<0.8?'sheep':'chicken',x+0.5,y,z+0.5);return;} }
  // squid in deep water
  if(world.dim==='over'&&world.mobs.filter(m=>m.type==='squid').length<4&&Math.random()<0.3){ const a=Math.random()*6.28,r=rand(10,28),x=Math.floor(P[0]+Math.sin(a)*r),z=Math.floor(P[2]+Math.cos(a)*r);
    if(world.loaded(x,z)&&isWater(world.getBlock(x,SEA_LEVEL-1,z))&&isWater(world.getBlock(x,SEA_LEVEL-3,z)))spawnMob(world,'squid',x+0.5,SEA_LEVEL-3,z+0.5); }
}
function drawModel(def,base,light,tint,phase,skip){ gl.bindVertexArray(def.vao); gl.uniform1f(U.eL,light); gl.uniform4f(U.eT,tint[0],tint[1],tint[2],tint[3]);
  def.parts.forEach((part,pi)=>{ if(skip&&skip(part))return; let M=base;
    if(part.spin)M=mul(base,rotY(phase*2)); else if(part.anim){const ang=Math.sin(phase)*0.7*part.anim,pv=part.pivot;M=mul(base,translate(pv[0],pv[1],pv[2]),part.axis==='z'?rotZ(ang):rotX(ang),translate(-pv[0],-pv[1],-pv[2]));}
    gl.uniformMatrix4fv(U.eM,false,M);const [st,cnt]=def.ranges[pi];gl.drawElements(gl.TRIANGLES,cnt,gl.UNSIGNED_SHORT,st*2); }); }
function drawEntities(world,vp,planes,sun,fog,fs,fe,amb,self){
  gl.useProgram(entProg);gl.uniformMatrix4fv(U.eVP,false,vp);gl.uniform3f(U.eFog,fog[0],fog[1],fog[2]);gl.uniform1f(U.eFs,fs);gl.uniform1f(U.eFe,fe);
  const lum=(x,y,z)=>{const br=gammaBr(effectiveLight(world,x,y,z,sun)/15);return Math.max(amb+0.1,0.1+0.9*(0.3*br+0.7*br*br));};
  for(const m of world.mobs){ const R=m.def.boss?5:1; if(!aabbInFrustum(planes,m.pos[0]-R,m.pos[1]-R,m.pos[2]-R,m.pos[0]+R,m.pos[1]+m.h+R,m.pos[2]+R))continue;
    const tint=m.hurtT>0?[1,0.2,0.2,0.5]:m.fuse>0?[1,1,1,0.5+0.5*Math.sin(m.fuse*25)]:m.burnT>0?[1,0.5,0.1,0.35]:m.def.fire?[1,0.6,0.1,0.25]:[0,0,0,0];
    const sz=(m.size||1)*(m.baby?0.6:1); drawModel(m.def,mul(translate(m.pos[0],m.pos[1]-(m.sit?0.18:0),m.pos[2]),rotY(m.yaw),scale(sz)),m.def.fire?1:lum(m.pos[0],m.pos[1]+0.5,m.pos[2]),tint,m.sit?0:m.phase,p=>(p.wool&&m.sheared)||(p.collar&&!m.tame)||(p.saddle&&!m.saddle)); }
  if(bobber)drawModel(MOB_TYPES.bobber,translate(bobber.pos[0],bobber.pos[1],bobber.pos[2]),lum(bobber.pos[0],bobber.pos[1]+0.3,bobber.pos[2]),[0,0,0,0],0,null);
  if(self){ const p=player,def=MOB_TYPES['player'+(PROFILE.skin%PLAYER_COLS.length)],M=mul(translate(p.pos[0],p.pos[1]-(p.sneak?0.15:0),p.pos[2]),rotY(p.yaw)),L=lum(p.pos[0],p.pos[1]+1,p.pos[2]);
    drawModel(def,M,L,[0,0,0,0],p.bob*0.55,null); drawArmor(inventory.armor.map(a=>a.count?a.id:0),M,L,p.bob*0.55); }
  for(const rp of net.remotesIn(world.dim)){ if(rp.spec)continue; const def=MOB_TYPES['player'+((rp.skin??rp.id)%PLAYER_COLS.length)]; if(!aabbInFrustum(planes,rp.pos[0]-1,rp.pos[1],rp.pos[2]-1,rp.pos[0]+1,rp.pos[1]+2,rp.pos[2]+1))continue;
    const M=mul(translate(rp.pos[0],rp.pos[1]-(rp.sneak?0.15:0),rp.pos[2]),rotY(rp.yaw)),L=lum(rp.pos[0],rp.pos[1]+1,rp.pos[2]);
    drawModel(def,M,L,[0,0,0,0],rp.phase||0,null); drawArmor(rp.ar,M,L,rp.phase||0); }
  for(const a of world.arrows){ const yaw=Math.atan2(-a.vel[0],-a.vel[2]),pitch=Math.atan2(a.vel[1],Math.hypot(a.vel[0],a.vel[2]));
    drawModel(a.kind?MOB_TYPES[a.kind==='egg'?'egg':a.kind==='wind'?'windcharge':a.kind==='potion'?'potion':'snowball']:a.fire?MOB_TYPES.fireball:MOB_TYPES.arrow,mul(translate(a.pos[0],a.pos[1],a.pos[2]),rotY(yaw),rotX(-pitch)),a.fire?1:lum(a.pos[0],a.pos[1],a.pos[2]),[0,0,0,0],0,null); }
  gl.bindVertexArray(null);
  gl.useProgram(chunkProg);gl.uniform3f(U.off,0,0,0);gl.uniform1i(U.mode,0);
  for(const f of world.falling){ gl.uniform1f(U.lo,effectiveLight(world,f.pos[0],f.pos[1]+0.5,f.pos[2],sun)/15); gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(f.pos[0]-0.5,f.pos[1],f.pos[2]-0.5))); const m=blockCube(f.id); gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0); }
  for(const t of world.tnt){ gl.uniform1f(U.lo,1); gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(t.pos[0]-0.5,t.pos[1],t.pos[2]-0.5))); const m=(t.fuse%0.5<0.2)?cubeMesh(Array(6).fill(T.WOOL)):blockCube(TNT); gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0); }
  for(const it of world.items){ if(!aabbInFrustum(planes,it.pos[0]-0.5,it.pos[1],it.pos[2]-0.5,it.pos[0]+0.5,it.pos[1]+1,it.pos[2]+0.5))continue;
    gl.uniform1f(U.lo,effectiveLight(world,it.pos[0],it.pos[1]+0.3,it.pos[2],sun)/15); const bob=Math.sin(it.spin*1.5)*0.05+0.1, I=ITEMS[it.id];
    if(I.block&&SOLID[it.id]){ gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(it.pos[0],it.pos[1]+bob,it.pos[2]),rotY(it.spin),scale(0.25),translate(-0.5,0,-0.5))); const m=blockCube(it.id); gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0); }
    else { gl.disable(gl.CULL_FACE); gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(it.pos[0],it.pos[1]+bob,it.pos[2]),rotY(player.yaw),scale(0.4),translate(-0.5,0,0))); const m=quadMesh(I.icon,I.tint||0); gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0); gl.enable(gl.CULL_FACE); } }
  gl.uniform1f(U.lo,1); gl.disable(gl.CULL_FACE); const om=quadMesh(T.XP_ORB);
  for(const o of world.orbs){ gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(o.pos[0],o.pos[1]+0.05+Math.sin(o.age*4)*0.05,o.pos[2]),rotY(player.yaw),scale(0.3),translate(-0.5,0,0))); gl.bindVertexArray(om.vao); gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0); }
  gl.enable(gl.CULL_FACE); gl.uniform1f(U.lo,-1);gl.uniformMatrix4fv(U.vp,false,vp);gl.bindVertexArray(null);
}
function drawHand(proj,sun){
  const s=selected(); if(!s.count||player.dead)return; const I=ITEMS[s.id]; gl.clear(gl.DEPTH_BUFFER_BIT); gl.useProgram(chunkProg); gl.uniform3f(U.off,0,0,0); gl.uniform1i(U.mode,0);
  gl.uniform1f(U.lo,Math.max(DIMS[world.dim].amb,effectiveLight(world,player.pos[0],player.pos[1]+1.5,player.pos[2],sun)/15)); gl.uniform1f(U.fs,100); gl.uniform1f(U.fe,200);
  const sw=Math.sin(player.swing*Math.PI), bobx=Math.sin(player.bob)*0.02, boby=Math.abs(Math.cos(player.bob))*0.02; let M;
  if(I.block&&SOLID[s.id]) M=mul(proj,translate(0.52+bobx,-0.52-boby-sw*0.25,-1.0),rotY(-0.6+sw*0.6),rotX(0.15),scale(0.38),translate(-0.5,-0.5,-0.5));
  else M=mul(proj,translate(0.55+bobx,-0.6-boby-sw*0.25,-1.0),rotY(-0.5+sw*0.7),rotX(0.1-sw*0.8),scale(0.5),translate(-0.5,-0.3,0));
  gl.uniformMatrix4fv(U.vp,false,M); gl.disable(gl.CULL_FACE);
  if(I.block&&SOLID[s.id]){const m=blockCube(s.id);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);} else {const m=quadMesh(I.icon,I.tint||0);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0);}
  gl.enable(gl.CULL_FACE); gl.uniform1f(U.lo,-1); gl.bindVertexArray(null);
}

// ---------------------------------------------------------------------
