'use strict';
// =====================================================================
// PVP: players can hit each other in multiplayer (sword/fists, arrows, snowballs, eggs).
// The attacker's game decides the hit; the victim's game applies damage + knockback
// (armor, shields and death all work as for any other damage). The host relays guest->guest hits.
// Turn it off per world with the "Player vs player" rule.
// =====================================================================
function pvpOn(){ const r=(game.meta&&game.meta.rules)||{}; return !!net.role&&r.pvp!==false; }
function pvpPlayers(){ return net.remotesIn(world.dim).filter(r=>r.pos&&!r.spec&&!r.cr&&!r.dead); }
function pvpSend(toId,dmg,kb){ const msg={t:'pvp',to:toId,dmg,kb,from:PROFILE.name||net.name};
  if(net.role==='host')net.sendTo(toId,msg); else net.toHost(msg); }
// the remote player under the crosshair (within reach), or null
function pvpTarget(){ if(!pvpOn())return null; const f=forwardVec(),o=[player.pos[0],player.pos[1]+EYE,player.pos[2]]; let best=null,bt=4.5;
  for(const r of pvpPlayers()){ const t=rayAABB(o[0],o[1],o[2],f[0],f[1],f[2],r.pos[0]-0.4,r.pos[1],r.pos[2]-0.4,r.pos[0]+0.4,r.pos[1]+1.8,r.pos[2]+0.4); if(t>=0&&t<bt){ bt=t; best=r; } }
  return best?{r:best,t:bt}:null; }
// melee: same damage rules as hitting a mob
const _pvpAttack=attack;
attack=function(w){ if(attackCd>0)return; const hit=pvpTarget();
  if(hit){ const m=mobHit(w); let mt=Infinity; if(m){ const f=forwardVec(),o=[player.pos[0],player.pos[1]+EYE,player.pos[2]]; mt=rayAABB(o[0],o[1],o[2],f[0],f[1],f[2],m.pos[0]-m.w,m.pos[1],m.pos[2]-m.w,m.pos[0]+m.w,m.pos[1]+m.h,m.pos[2]+m.w); }
    if(hit.t<=mt){ const r=hit.r,s=selected(),tool=heldItem();
      let dmg=(tool&&tool.dmg?tool.dmg:1)+(s.ench&&s.ench.Sharpness||0)+(hasFx('strength')?3:0);
      if(s.id===MACE)dmg+=maceSmash(r,s);
      const dx=r.pos[0]-player.pos[0],dz=r.pos[2]-player.pos[2],l=Math.hypot(dx,dz)||1, kbk=1+(s.ench&&s.ench.Knockback||0)*0.6;
      pvpSend(r.id,dmg,[dx/l*6*kbk,5,dz/l*6*kbk]);
      if(tool&&tool.tool&&tool.tool!=='mace')damageTool(s,tool.tool==='sword'?1:2);
      attackCd=s.id===MACE?0.7:0.4; player.exhaust+=0.1; player.swing=1; return; } }
  return _pvpAttack(w); };
// projectiles shot by me that hit another player (called from the arrow loop in entities.js)
function pvpArrow(a,nx,ny,nz){ if(!pvpOn()||a.visual||!a.fromPlayer||a.kind==='potion'||a.kind==='wind')return false;
  const r=pvpPlayers().find(r=>nx>r.pos[0]-0.4&&nx<r.pos[0]+0.4&&ny>r.pos[1]&&ny<r.pos[1]+1.8&&nz>r.pos[2]-0.4&&nz<r.pos[2]+0.4); if(!r)return false;
  pvpSend(r.id,a.kind?0:(a.dmg||0),[a.vel[0]*0.15,a.kind?2:3,a.vel[2]*0.15]); if(a.kind)projectileLanded(a); return true; }
// someone hit me
function pvpReceive(m,from){ if(game.state!=='playing'||player.dead||player.spectator||inventory.creative)return;
  const rules=(game.meta&&game.meta.rules)||{}; if(rules.pvp===false)return;
  if(m.dmg>0&&blockingNow()){ damageTool(selected(),Math.ceil(m.dmg)); sfx.place(); player.invuln=0.3; return; }
  if(m.dmg>0)damagePlayer(m.dmg,false,'pvp');
  if(Array.isArray(m.kb)){ player.vel[0]+=m.kb[0]||0; player.vel[1]=Math.max(player.vel[1],m.kb[1]||0); player.vel[2]+=m.kb[2]||0; player.onGround=false; player.fallPeak=player.pos[1]; }
  if(player.dead){ const text='was slain by '+from; addChat(PROFILE.name+' '+text,'#f88');
    if(net.role==='host')net.broadcast({t:'chat',name:PROFILE.name,text}); else net.toHost({t:'chat',text}); } }
// routing: guests send hits to the host, the host applies its own or forwards to the right guest
const _pvpOnMsg=net.onMsg;
net.onMsg=function(peer,m){ if(m&&m.t==='pvp'){
    if(this.role==='host'){ const from=peer.name||m.from||'Player'; if(m.to===0)pvpReceive(m,from); else this.sendTo(m.to,Object.assign({},m,{from})); }
    else pvpReceive(m,m.from||this.hostName||'Player');
    return; }
  return _pvpOnMsg.call(this,peer,m); };
// holding left-click on a player attacks them instead of also mining the block behind them
const _pvpMining=updateMining;
updateMining=function(w,dt,on){ return _pvpMining(w,dt,on&&!(game.state==='playing'&&pvpTarget())); };
