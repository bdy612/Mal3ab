'use strict';
// =====================================================================
// SHARED WORLD (multiplayer). While a guest is in the same dimension as the host,
// only the host's game runs mobs, dropped items and containers. Guests see copies
// ("proxies") that follow the host's snapshots, and tell the host what they do:
// hits, pickups, chest clicks, rides, feeding, taming, placing boats and carts.
// =====================================================================
let blockFx=0;      // > 0 while a block change is running its side effects (pops, spilled chests)
let netSeq=0;       // ids for mobs and items so host and guests can talk about the same one
const r2=v=>Math.round(v*100)/100;
const MOBSYNC=['sheared','regrow','love','saddle','hp','temper','tame','sit','owner'];
const stackOut=s=>s&&s.count?[s.id,s.count,s.dur||0,s.ench||0]:0;
function stackIn(d,a){ if(!a||!ITEMS[a[0]]){ clearStack(d); return; } d.id=a[0]; d.count=a[1]; d.dur=a[2]||0; d.ench=a[3]||undefined; }
const TILE_STACKS=['inp','fuel','out','ing'],TILE_LISTS=['slots','bottles'],TILE_NUMS=['burnT','burnMax','cookT','t','fuelLeft'];
function tileData(t){ const d={type:t.type}; for(const k of TILE_LISTS)if(t[k])d[k]=t[k].map(stackOut); for(const k of TILE_STACKS)if(t[k])d[k]=stackOut(t[k]);
  for(const k of TILE_NUMS)if(typeof t[k]==='number')d[k]=r2(t[k]); return d; }
function applyTileData(t,d){ for(const k of TILE_LISTS)if(t[k]&&d[k])t[k].forEach((s,i)=>stackIn(s,d[k][i])); for(const k of TILE_STACKS)if(t[k]&&k in d)stackIn(t[k],d[k]); for(const k of TILE_NUMS)if(k in d)t[k]=d[k]; }
function inWorld(w,fn){ const prev=world; world=w; try{ return fn(); } finally { world=prev; } }
function mobByNid(w,nid){ for(const m of w.mobs)if(m.nid===nid)return m; return null; }
// everyone mobs can see: this player, and (on the host) every friend in this dimension
function playerTargets(w){ const T=[]; if(game.state==='playing')T.push({id:0,code:PROFILE.code,pos:player.pos,ghost:inventory.creative||player.spectator||player.dead,spec:player.spectator,held:selected().id});
  if(net.role==='host')for(const r of net.remotesIn(w.dim))T.push({id:r.id,code:r.code,pos:r.pos,ghost:!!(r.spec||r.cr||r.dead),spec:!!r.spec,held:r.held|0}); return T; }
// a mob hits a player: ours takes the damage here, a friend's is sent to their game (their armor, shield and difficulty apply there)
function hitPlayer(t,dmg,kind){ if(!t)return; if(t.id===0){ damagePlayer(dmg,false,kind); return; } net.sendTo(t.id,{t:'hurt',dmg,kind}); }
// knock a mob around (wind charges, mace smash); a guest asks the host to do it
function pushMob(m,ax,vy,az){ if(m.proxy){ net.toHost({t:'push',nid:m.nid,v:[r2(ax),r2(vy),r2(az)]}); return; } m.vel[0]+=ax; m.vel[1]=vy; m.vel[2]+=az; }
// whose pet is this, and where are they? (null = owner is not here)
function petOwner(w,m){ if(!m.owner||m.owner===PROFILE.code)return game.state==='playing'?{id:0,code:PROFILE.code,pos:player.pos,dead:player.dead}:null;
  if(net.role!=='host')return null; for(const r of net.remotes.values())if(r.code===m.owner)return r.dim===w.dim&&r.pos?{id:r.id,code:r.code,pos:r.pos,dead:!!r.dead}:null; return null; }
function invRoom(id){ const max=ITEMS[id]?ITEMS[id].stack:1; return inventory.slots.some(s=>!s.count||(s.id===id&&max>1&&s.count<max&&!s.ench)); }
function explodeHurtSelf(x,y,z,r){ const d=Math.hypot(player.pos[0]-x,player.pos[1]+0.9-y,player.pos[2]-z); if(d<r*2){ player.invuln=0; damagePlayer(Math.round(14*(1-d/(r*2)))+1,false,'explode'); } }
function mobEntry(m){ const f=(m.hurtT>0?1:0)|(m.baby?2:0)|(m.sit?4:0)|(m.tame?8:0)|(m.saddle?16:0)|(m.sheared?32:0)|(m.burnT>0?64:0)|(m.angry>0?128:0);
  return [m.nid,m.type,r2(m.pos[0]),r2(m.pos[1]),r2(m.pos[2]),r2(m.yaw),f,Math.ceil(m.hp),m.size||1,r2(m.fuse||0),m.owner||(m.tame&&m.def.wolf?PROFILE.code:0),m.rider!=null?m.rider:player.riding===m?0:-1,Math.round(m.temper||0),m.def.cart?[r2(m.s||0),m.dir??-1]:0]; }

Object.assign(net,{
  hostDim:null, pm:new Map(), pi:new Map(), sharedWorld:null, snapT:0, watchT:0, vposT:0, watch:null, watch2:null, shadows:{}, tileHold:0, tileStale:false, tileShadow:null, hitBy:0,
  sharedW(w){ return this.guest&&!!w&&this.hostDim!==null&&w.dim===this.hostDim; },
  shared(){ return this.sharedW(world); },
  toHost(msg){ if(this.role==='guest'&&this.peers[0])this.send(this.peers[0],msg); },
  sendTo(id,msg){ const p=this.peers.find(p=>p.id===id); if(p)this.send(p,msg); },
  resetShare(){ this.hostDim=null; this.pm.clear(); this.pi.clear(); this.sharedWorld=null; this.watch=null; this.tileStale=false; this.tileShadow=null; },
  // ---- things a guest asks the host to do ----
  dropItem(x,y,z,id,count,dur,vel,ench){ this.toHost({t:'drop',dim:world.dim,p:[r2(x),r2(y),r2(z)],id,n:count,dur:dur||0,v:vel?vel.map(r2):0,e:ench||0,by:thrownBy>=0?1:0}); },
  requestSpawn(m){ this.toHost({t:'spawn',type:m.type,p:m.pos.map(r2),yaw:r2(m.yaw),dir:m.dir,s:m.s||0}); },
  shareArrow(a,fromPlayer){ const msg={t:'arrow',dim:world.dim,p:a.pos.map(r2),v:a.vel.map(r2),fire:a.fire?1:0,kind:a.kind||0,splash:a.splash||0,mob:fromPlayer?0:1};
    if(this.role==='host')this.broadcast(msg); else this.toHost(msg); },
  shareBoom(x,y,z,r){ const msg={t:'boom',dim:world.dim,x:r2(x),y:r2(y),z:r2(z),r}; if(this.role==='host')this.broadcast(msg); else this.toHost(msg); },
  mobChanged(m,before){ const f={}; let n=0; MOBSYNC.forEach((k,i)=>{ if(m[k]!==before[i]){ f[k]=m[k]===undefined?null:m[k]; n++; } }); if(n)this.toHost({t:'mobset',nid:m.nid,f}); },
  openedTile(t,t2){ if(!this.shared()||!t||!t.pos||!TILE_TYPES.has(t.type))return; this.watch=tkey(...t.pos); this.watch2=t2&&t2.pos?tkey(...t2.pos):null; this.shadows={[this.watch]:tileData(t)}; if(this.watch2)this.shadows[this.watch2]=tileData(t2); this.tileShadow=this.shadows[this.watch];
    this.tileHold=0; this.tileGot=false; this.tileAsk=performance.now(); this.toHost({t:'tget',dim:world.dim,k:this.watch,k2:this.watch2}); },
  closedTile(){ if(this.watch&&this.role==='guest')this.toHost({t:'tunwatch'}); this.watch=null; this.watch2=null; },
  // a container changed here: the guest sends the slots it changed, the host tells everyone looking at it
  tileDirty(dim,k){
    if(this.role==='guest'){ if(!this.shared())return; const t=world.tiles.get(k); if(!t)return; this.shadows=this.shadows||{}; const cur=tileData(t),sh=this.shadows[k]||(k===this.watch&&this.tileShadow)||{},ch=[],J=JSON.stringify;
      for(const f of TILE_LISTS)if(cur[f])cur[f].forEach((s,i)=>{ if(J(s)!==J(sh[f]?sh[f][i]:0))ch.push([f,i,s]); });
      for(const f of TILE_STACKS)if(f in cur&&J(cur[f])!==J(sh[f]??0))ch.push([f,-1,cur[f]]);
      this.shadows[k]=cur; if(k===this.watch)this.tileShadow=cur; if(ch.length){ this.tileHold=performance.now()+400; this.toHost({t:'tset',dim,k,ch}); } return; }
    if(this.role==='host')for(const p of this.peers){ if(p.watch&&p.watch.k===k&&p.watch.dim===dim)this.pushTile(p); if(p.watch2&&p.watch2.k===k&&p.watch2.dim===dim)this.pushTile(p,p.watch2); } },
  pushTile(p,W2){ const W=W2||p.watch; if(!W)return; const w=dims[W.dim]; if(!w)return; const [x,y,z]=W.k.split(',').map(Number); let t=w.tiles.get(W.k);
    if(!t&&w.loaded(x,z))t=inWorld(w,()=>getTile(x,y,z,w.getBlock(x,y,z)));
    const d=t&&TILE_TYPES.has(t.type)?tileData(t):null, s=JSON.stringify(d); if(s===W.last)return; W.last=s; this.send(p,{t:'tile',dim:W.dim,k:W.k,d}); },
  peerGone(peer){ for(const w of Object.values(dims))for(const m of w.mobs)if(m.rider===peer.id)m.rider=null; },
  // ---- host: tell each guest what changed near them ----
  sendSnaps(){ const w=world;
    for(const p of this.peers){ if(!p.welcomed)continue; const r=this.remotes.get(p.id); if(!r||!r.pos||r.dim!==w.dim){ p.snap=null; continue; }
      if(!p.snap||p.snap.dim!==w.dim)p.snap={dim:w.dim,m:new Map(),i:new Map()};
      const S=p.snap,mm=[],mr=[],ii=[],ir=[],seenM=new Set(),seenI=new Set(),px=r.pos[0],pz=r.pos[2],R2=80*80;
      for(const m of w.mobs){ const dx=m.pos[0]-px,dz=m.pos[2]-pz; if(dx*dx+dz*dz>R2&&!m.def.boss)continue; if(!m.nid)m.nid=++netSeq; seenM.add(m.nid);
        const e=mobEntry(m),key=e.join(','); if(S.m.get(m.nid)===key)continue; if(!S.m.has(m.nid)&&m.trades)e.push(m.trades); S.m.set(m.nid,key); mm.push(e); }
      for(const k of S.m.keys())if(!seenM.has(k)){ S.m.delete(k); mr.push(k); }
      for(const it of w.items){ const dx=it.pos[0]-px,dz=it.pos[2]-pz; if(dx*dx+dz*dz>48*48)continue; if(!it.nid)it.nid=++netSeq; seenI.add(it.nid);
        const e=[it.nid,it.id,it.count,r2(it.pos[0]),r2(it.pos[1]),r2(it.pos[2])],key=e.join(','); if(S.i.get(it.nid)===key)continue; S.i.set(it.nid,key); ii.push(e); }
      for(const k of S.i.keys())if(!seenI.has(k)){ S.i.delete(k); ir.push(k); }
      if(mm.length||mr.length||ii.length||ir.length)this.send(p,{t:'snap',dim:w.dim,m:mm,mr,i:ii,ir}); } },
  // ---- guest: follow the host's snapshots ----
  onSnap(m){ const w=world; if(m.dim!==w.dim)return; this.hostDim=m.dim; if(!this.shared())return;
    if(this.sharedWorld!==w)this.checkShared();
    for(const e of m.m||[]){ const [nid,type,x,y,z,yaw,f,hp,size,fuse,owner,rider,temper,cart,trades]=e; let p=this.pm.get(nid);
      if(!p){ if(!MOB_TYPES[type])continue; p=newMob(type,x,y,z); p.proxy=true; p.nid=nid; p.yaw=yaw; p.tp=[x,y,z]; p.tyaw=yaw; if(trades)p.trades=trades; this.pm.set(nid,p); w.mobs.push(p); }
      if(!p.local){ p.tp=[x,y,z]; p.tyaw=yaw; if(cart){ p.s=cart[0]; if(cart[1]>=0)p.dir=cart[1]; } }
      if(f&1)p.hurtT=Math.max(p.hurtT,0.2); p.baby=f&2?1:0; p.sit=!!(f&4); p.tame=!!(f&8); p.saddle=!!(f&16); p.sheared=!!(f&32); p.burnT=f&64?1:0; p.angry=f&128?1:0;
      if(p.def.slime&&(p.size||1)!==size)setSlimeSize(p,size); p.hp=hp; p.fuse=fuse; p.owner=owner||undefined; p.rider=rider; if(!p.local)p.temper=temper; }
    for(const nid of m.mr||[]){ const p=this.pm.get(nid); if(!p)continue; this.pm.delete(nid); const i=w.mobs.indexOf(p); if(i>=0)w.mobs.splice(i,1);
      if(player.riding===p){ player.riding=null; p.local=false; player.vel=[0,4,0]; player.fallPeak=player.pos[1]; } }
    for(const e of m.i||[]){ const [nid,id,count,x,y,z]=e; let it=this.pi.get(nid);
      if(!it){ if(!ITEMS[id])continue; it={nid,id,count,dur:0,pos:[x,y,z],tp:[x,y,z],vel:[0,0,0],w:0.125,h:0.25,onGround:true,age:0,spin:Math.random()*6,proxy:true}; this.pi.set(nid,it); w.items.push(it); }
      it.id=id; it.count=count; it.tp=[x,y,z]; }
    for(const nid of m.ir||[]){ const it=this.pi.get(nid); if(!it)continue; this.pi.delete(nid); const i=w.items.indexOf(it); if(i>=0)w.items.splice(i,1); } },
  // guest: notice when sharing starts or stops (one of us changed dimension)
  checkShared(){ const sw=this.shared()?world:null; if(sw===this.sharedWorld)return; const old=this.sharedWorld; this.sharedWorld=sw; this.pm.clear(); this.pi.clear();
    if(player.riding){ player.riding.local=false; player.riding=null; }
    if(old){ old.mobs.length=0; old.items.length=0; }
    if(sw){ const loose=sw.items.splice(0); sw.mobs.length=0; for(const it of loose)this.dropItem(it.pos[0],it.pos[1]+0.2,it.pos[2],it.id,it.count,it.dur,[0,1,0],it.ench); this.toHost({t:'sync'}); } },
  // guest, every frame while shared: glide proxies toward the host's positions, ride our own vehicle, pick things up
  updateShared(w,dt,sun){ const k=Math.min(1,dt*10);
    for(const m of w.mobs){ m.hurtT=Math.max(0,m.hurtT-dt); m.age+=dt; if(!m.proxy)continue;
      if(m.local){ updateSpecial(w,m,dt,sun,0,null); continue; }
      if(Math.hypot(m.tp[0]-m.pos[0],m.tp[1]-m.pos[1],m.tp[2]-m.pos[2])>8){ m.pos=[...m.tp]; m.yaw=m.tyaw; continue; }
      const ox=m.pos[0],oz=m.pos[2]; for(let a=0;a<3;a++)m.pos[a]+=(m.tp[a]-m.pos[a])*k;
      let dy=m.tyaw-m.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); m.yaw+=dy*k; m.phase+=Math.hypot(m.pos[0]-ox,m.pos[2]-oz)*3; }
    const now=performance.now();
    for(const it of w.items){ it.age+=dt; it.spin+=dt*2; if(!it.tp)continue; for(let a=0;a<3;a++)it.pos[a]+=(it.tp[a]-it.pos[a])*k;
      if(player.dead||player.spectator||game.state!=='playing')continue; const d=Math.hypot(player.pos[0]-it.pos[0],player.pos[1]+0.9-it.pos[1],player.pos[2]-it.pos[2]);
      if(d<1.7&&now>(it.req||0)&&invRoom(it.id)){ it.req=now+700; this.toHost({t:'take',nid:it.nid}); } } },
  shareUpdate(dt){ if(!this.role||game.state!=='playing')return;
    if(this.role==='host'){ this.snapT+=dt; if(this.snapT>=0.125){ this.snapT=0; this.sendSnaps(); }
      this.watchT+=dt; if(this.watchT>=0.25){ this.watchT=0; for(const p of this.peers){ if(p.watch)this.pushTile(p); if(p.watch2)this.pushTile(p,p.watch2); } } return; }
    if(!this.guest)return; this.checkShared(); if(!this.sharedWorld)return;
    const v=player.riding; this.vposT+=dt; if(v&&v.local&&this.vposT>=0.1){ this.vposT=0; this.toHost({t:'vpos',nid:v.nid,p:v.pos.map(r2),yaw:r2(v.yaw),v:v.vel.map(r2),s:v.s||0,dir:v.dir,tame:v.tame?1:0,temper:v.temper||0}); }
    const now=performance.now(); if(this.watch&&((this.tileStale&&now>this.tileHold)||(!this.tileGot&&now-this.tileAsk>1500))){ this.tileStale=false; this.tileAsk=now; this.toHost({t:'tget',dim:world.dim,k:this.watch,k2:this.watch2}); } },
  // ---- messages; returns true when handled here ----
  shareMsg(peer,m){
    // both sides: arrows and explosions are shown everywhere, each player takes their own damage
    if(m.t==='arrow'){ if(this.role==='host')this.broadcast(m,peer); if(m.dim===world.dim&&game.state==='playing'){ world.arrows.push({pos:m.p,vel:m.v,age:0,fromPlayer:false,stuck:false,dmg:0,fire:!!m.fire,kind:m.kind||undefined,splash:m.splash||undefined,visual:true,mob:!!m.mob});
        if(Math.hypot(m.p[0]-player.pos[0],m.p[1]-player.pos[1],m.p[2]-player.pos[2])<20)sfx.bow(); } return true; }
    if(m.t==='boom'){ if(this.role==='host')this.broadcast(m,peer); if(m.dim===world.dim&&game.state==='playing'){ sfx.explode(); smokeParticles(m.x+0.5,m.y+0.5,m.z+0.5,40,m.r); flashT=Math.max(flashT,0.05); explodeHurtSelf(m.x,m.y,m.z,m.r); } return true; }
    if(this.role==='host'){ if(!peer.welcomed)return false; const w=world,r=this.remotes.get(peer.id),here=!!r&&r.dim===w.dim;
      switch(m.t){
        case 'sync': peer.snap=null; return true;
        case 'drop': { const dw=dims[m.dim]; if(!dw||!ITEMS[m.id]||!(m.n>0))return true; const was=thrownBy; thrownBy=m.by?peer.id:-1;
          try{ inWorld(dw,()=>spawnItem(m.p[0],m.p[1],m.p[2],m.id,Math.min(m.n,999),m.dur,m.v||undefined,m.e||undefined)); } finally { thrownBy=was; } return true; }
        case 'take': { if(!here)return true; const i=w.items.findIndex(it=>it.nid===m.nid); if(i<0)return true; const it=w.items[i];
          if(it.age<pickDelay(it,peer.id)||Math.hypot(r.pos[0]-it.pos[0],r.pos[1]+0.9-it.pos[1],r.pos[2]-it.pos[2])>4)return true;
          { const nt=nearestTaker(it,w); if(nt&&nt.id!==peer.id&&nt.d<1.6)return true; }   // someone else is closer: it's theirs
          w.items.splice(i,1); this.send(peer,{t:'give',id:it.id,n:it.count,dur:it.dur||0,e:it.ench||0}); return true; }
        case 'hit': { if(!here)return true; const mob=mobByNid(w,m.nid); if(!mob||mob.hp<=0)return true; this.hitBy=peer.id;
          try{ hurtMob(w,mob,+m.dmg||0,m.kb||null); } finally { this.hitBy=0; } if(!mob.tame)petsDefend(w,mob,r.code,r.pos); return true; }
        case 'push': { const mob=here&&mobByNid(w,m.nid); if(mob&&!mob.def.boss&&!(mob.rider>0)){ mob.vel[0]+=m.v[0]; mob.vel[1]=m.v[1]; mob.vel[2]+=m.v[2]; } return true; }
        case 'mobset': { const mob=here&&mobByNid(w,m.nid); if(!mob)return true; const f=m.f||{};
          for(const k of MOBSYNC){ if(!(k in f))continue; if(k==='love'&&mob.loveCd>0)continue; if(k==='sit')mob.target=null; mob[k]=f[k]===null?undefined:f[k]; } return true; }
        case 'spawn': { if(!here||!['boat','minecart'].includes(m.type))return true; const mob=spawnMob(w,m.type,m.p[0],m.p[1],m.p[2]); mob.yaw=m.yaw||0; if(m.type==='minecart'){ mob.dir=m.dir; mob.s=0; } return true; }
        case 'ride': { const mob=here&&mobByNid(w,m.nid); if(!mob||player.riding===mob||(mob.rider!=null&&mob.rider!==peer.id)){ this.send(peer,{t:'noride',nid:m.nid}); return true; } mob.rider=peer.id; return true; }
        case 'vpos': { const mob=mobByNid(w,m.nid); if(!mob||mob.rider!==peer.id)return true; mob.pos=m.p; mob.yaw=m.yaw; mob.vel=m.v; if(mob.def.cart){ mob.s=m.s; if(m.dir!=null)mob.dir=m.dir; }
          if(m.tame&&!mob.tame)mob.tame=true; if(mob.def.horse)mob.temper=m.temper; return true; }
        case 'unride': { const mob=mobByNid(w,m.nid); if(!mob||mob.rider!==peer.id)return true; mob.rider=null; if(m.p){ mob.pos=m.p; mob.vel=m.v||[0,0,0]; } if(mob.def.cart){ mob.s=m.s||0; if(m.dir!=null)mob.dir=m.dir; } return true; }
        case 'tget': peer.watch={dim:m.dim,k:m.k,last:''}; peer.watch2=m.k2?{dim:m.dim,k:m.k2,last:''}:null; this.pushTile(peer); if(peer.watch2)this.pushTile(peer,peer.watch2); return true;
        case 'tunwatch': peer.watch=null; peer.watch2=null; return true;
        case 'tset': { const tw=dims[m.dim]; if(!tw||!Array.isArray(m.ch))return true; const [x,y,z]=m.k.split(',').map(Number);
          let t=tw.tiles.get(m.k); if(!t&&tw.loaded(x,z))t=inWorld(tw,()=>getTile(x,y,z,tw.getBlock(x,y,z))); if(!t||!TILE_TYPES.has(t.type))return true;
          for(const [f,i,s] of m.ch){ if(i<0){ if(TILE_STACKS.includes(f)&&t[f])stackIn(t[f],s); } else if(TILE_LISTS.includes(f)&&t[f]&&t[f][i])stackIn(t[f][i],s); }
          { const W=[peer.watch,peer.watch2].find(w=>w&&w.k===m.k&&w.dim===m.dim); if(W)W.last=JSON.stringify(tileData(t)); else peer.watch={dim:m.dim,k:m.k,last:JSON.stringify(tileData(t))}; }
          inWorld(tw,()=>tileChanged(x,y,z)); if(uiOpen&&(ui.tile===t||ui.tile2===t))refreshUI(); scheduleSave(); return true; }
        case 'vault': { const vw=dims[m.dim]; if(!vw)return true; const ok=inWorld(vw,()=>vaultLoot(m.x,m.y,m.z,String(m.code||('peer'+peer.id)))); this.send(peer,{t:'vaultRes',ok}); return true; }
      }
      return false; }
    // guest
    switch(m.t){
      case 'welcome': this.hostDim=m.dim; return false;
      case 'pos': if(m.id===0)this.hostDim=m.dim; return false;
      case 'snap': this.onSnap(m); return true;
      case 'give': { if(!ITEMS[m.id])return true; const left=invAdd(m.id,m.n,m.dur,m.e||undefined); if(left<m.n){ sfx.pickup(); updateHotbar(); }
        if(left)spawnItem(player.pos[0],player.pos[1]+0.5,player.pos[2],m.id,left,m.dur,[0,2,0],m.e||undefined); return true; }
      case 'hurt': if(game.state==='playing'){ if(m.inv0)player.invuln=0; damagePlayer(m.dmg,false,m.kind); if(m.burn)player.burnT=Math.max(player.burnT||0,m.burn); } return true;
      case 'xp': if(game.state==='playing')spawnOrbs(m.p[0],m.p[1],m.p[2],m.n); return true;
      case 'noride': { const v=player.riding; if(v&&v.nid===m.nid){ v.local=false; player.riding=null; player.vel=[0,3,0]; showMsg('Someone else is riding that.'); } return true; }
      case 'tile': { if(m.dim!==world.dim)return true; if(performance.now()<this.tileHold){ this.tileStale=true; return true; } const [x,y,z]=m.k.split(',').map(Number);
        if(!m.d){ world.tiles.delete(m.k); if(uiOpen&&((ui.tile&&ui.tile.pos&&tkey(...ui.tile.pos)===m.k)||(ui.tile2&&ui.tile2.pos&&tkey(...ui.tile2.pos)===m.k)))closeUI(true); return true; }
        let t=world.tiles.get(m.k); if(!t||t.type!==m.d.type){ world.tiles.delete(m.k); t=getTile(x,y,z,world.getBlock(x,y,z)); } if(!t||t.type!==m.d.type)return true;
        applyTileData(t,m.d); if(this.watch===m.k||this.watch2===m.k){ this.shadows=this.shadows||{}; this.shadows[m.k]=tileData(t); if(this.watch===m.k){ this.tileShadow=this.shadows[m.k]; this.tileGot=true; } } if(uiOpen&&(ui.tile===t||ui.tile2===t)){ refreshUI(); updateFurnaceUI(); } return true; }
      case 'vaultRes': if(m.ok){ const s=selected(); if(s.id===TRIAL_KEY&&!inventory.creative)consumeHeld(); updateHotbar(); sfx.enchant(); showMsg('The vault opens and spills its treasure!'); }
        else showMsg('This vault already gave you its treasure.'); return true;
    }
    return false; },
});
