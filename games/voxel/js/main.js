'use strict';
// CHUNK MANAGER, RENDER LOOP, WORLD LOADING / SAVING
// ---------------------------------------------------------------------
let world,dims={},renderDist=SETTINGS.dist,dayTime=0.22;const DAY_LENGTH=600,GEN_BUDGET_MS=8,MESH_BUDGET_MS=6;
const PANORAMA_SEED=20260412;
function sunFactor(){return world.dim==='over'?clamp(0.12+Math.sin(dayTime*Math.PI*2)*1.4,0.12,1)*weatherSunMul():DIMS[world.dim].sun;}
function updateChunks(){
  const pcx=Math.floor(player.pos[0]/CX),pcz=Math.floor(player.pos[2]/CZ),R=renderDist,G=R+1;const need=[];
  for(let dz=-G;dz<=G;dz++)for(let dx=-G;dx<=G;dx++){const d2=dx*dx+dz*dz;if(d2>G*G)continue;if(!world.chunks.has((pcx+dx)+','+(pcz+dz)))need.push([pcx+dx,pcz+dz,d2]);}
  need.sort((a,b)=>a[2]-b[2]);let t0=performance.now();for(const [cx,cz] of need){if(performance.now()-t0>GEN_BUDGET_MS)break;world.createChunk(cx,cz);}
  // the host also keeps a small area loaded around each guest so water, redstone and crops keep working there
  const guests=net.role==='host'?net.remotesIn(world.dim).map(r=>[Math.floor(r.pos[0]/CX),Math.floor(r.pos[2]/CZ)]):[];
  t0=performance.now(); for(const [gx,gz] of guests)for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){ if(performance.now()-t0>4)break; if(!world.chunks.has((gx+dx)+','+(gz+dz)))world.createChunk(gx+dx,gz+dz); }
  for(const [k,c] of world.chunks){const dx=c.cx-pcx,dz=c.cz-pcz;if(dx*dx+dz*dz>(G+2)*(G+2)&&!guests.some(([gx,gz])=>Math.abs(c.cx-gx)<=4&&Math.abs(c.cz-gz)<=4)){freeMesh(c.opaque);freeMesh(c.water);world.chunks.delete(k);}}
  const dirty=[];for(const c of world.chunks.values()){if(!c.dirty)continue;const dx=c.cx-pcx,dz=c.cz-pcz;if(dx*dx+dz*dz>R*R)continue;let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1;b++){if((a||b)&&!world.getChunk(c.cx+a,c.cz+b)){ok=false;break;}}if(ok)dirty.push([c,dx*dx+dz*dz]);}
  dirty.sort((a,b)=>a[1]-b[1]);t0=performance.now();for(const [c] of dirty){rebuildChunkMesh(world,c);if(performance.now()-t0>MESH_BUDGET_MS)break;}
}
const stats={tris:0,drawn:0}; let lastVP=null;
// camera: first person, or third person behind / in front (F5); pulled in so it never goes inside a block
function cameraPose(eye){ let yaw=player.yaw,pitch=player.pitch,pos=eye;
  if(game.view&&game.state==='playing'&&!player.dead){ const f=forwardVec(),s=game.view===1?-1:1; let d=4;
    for(let t=0.2;t<=4;t+=0.1){ const x=eye[0]+f[0]*t*s,y=eye[1]+f[1]*t*s,z=eye[2]+f[2]*t*s; if(SOLID[world.getBlock(Math.floor(x),Math.floor(y),Math.floor(z))]&&!player.spectator){ d=Math.max(0.2,t-0.3); break; } }
    pos=[eye[0]+f[0]*d*s,eye[1]+f[1]*d*s,eye[2]+f[2]*d*s]; if(game.view===2){ yaw+=Math.PI; pitch=-pitch; } }
  return {pos,yaw,pitch}; }
function render(){
  const dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.floor(canvas.clientWidth*dpr),h=Math.floor(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);
  const D=DIMS[world.dim],sun=sunFactor(),day=[0.55,0.75,0.95],night=[0.02,0.03,0.08],ds=clamp((sun-0.12)/0.88,0,1),playing=game.state==='playing';
  const eyeY=player.pos[1]+EYE-(player.sneak?0.15:0),eye=[player.pos[0],eyeY,player.pos[2]],cam=cameraPose(eye),camHead=world.getBlock(Math.floor(cam.pos[0]),Math.floor(cam.pos[1]),Math.floor(cam.pos[2]));
  const inW=playing&&!player.spectator&&isWater(camHead),inL=playing&&!player.spectator&&isLava(camHead);
  let sky=D.sky?D.sky.slice():skyTint(day.map((v,i)=>night[i]+(v-night[i])*ds));if(inW)sky=[0.1*ds+0.01,0.25*ds+0.02,0.6*ds+0.05];if(inL)sky=[0.8,0.3,0.05];
  gl.clearColor(sky[0],sky[1],sky[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
  const fov=(SETTINGS.fov+(player.sprint?8:0))*Math.PI/180;
  if(!inW&&!inL)drawSkyAndWeather('sky',null,perspective(fov,w/h,0.05,1000),null,cam,sky,0,0,sun);
  const view=mul(rotX(-cam.pitch),rotY(-cam.yaw),translate(-cam.pos[0],-cam.pos[1],-cam.pos[2])),proj=perspective(fov,w/h,0.05,renderDist*CX*2),vp=mat4Mul(proj,view),planes=frustumPlanes(vp),far=renderDist*CX*(D.fog||1);
  const fs=inW?2:inL?0.5:far*0.6,fe=inW?14:inL?3:far*0.98;
  const visible=[];for(const c of world.chunks.values()){if(!c.opaque&&!c.water)continue;const mx=c.cx*CX,mz=c.cz*CZ;if(!aabbInFrustum(planes,mx,0,mz,mx+CX,CY,mz+CZ))continue;const dx=mx+8-cam.pos[0],dz=mz+8-cam.pos[2];visible.push([c,dx*dx+dz*dz]);}
  visible.sort((a,b)=>a[1]-b[1]);
  const amb=Math.max(D.amb,hasFx('night')||player.nightVision?0.8:0,SETTINGS.bright>1?(SETTINGS.bright-1)*1.6:0,flashT>0?0.55:0);
  gl.useProgram(chunkProg);gl.uniformMatrix4fv(U.vp,false,vp);gl.uniform1i(U.tex,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,texArray);
  gl.uniform3f(U.fog,sky[0],sky[1],sky[2]);gl.uniform1f(U.fs,fs);gl.uniform1f(U.fe,fe);gl.uniform1f(U.sun,sun);gl.uniform1f(U.lo,-1);gl.uniform1f(U.amb,amb);gl.uniform1f(U.gamma,Math.min(1,SETTINGS.bright));stats.tris=0;stats.drawn=0;gl.uniform1i(U.mode,0);
  for(const [c] of visible){if(!c.opaque)continue;gl.uniform3f(U.off,c.cx*CX,0,c.cz*CZ);gl.bindVertexArray(c.opaque.vao);gl.drawElements(gl.TRIANGLES,c.opaque.count,gl.UNSIGNED_INT,0);stats.tris+=c.opaque.count/3;stats.drawn++;}
  drawEntities(world,vp,planes,sun,sky,fs,fe,amb,playing&&game.view>0&&!player.spectator&&!player.dead); lastVP=vp;
  if(mining.target&&mining.hit&&playing){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1i(U.mode,2);gl.uniform1f(U.lo,1);gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(mining.hit.x-0.002,mining.hit.y-0.002,mining.hit.z-0.002),scale(1.004)));const m=cubeMesh(Array(6).fill(T['CRACK'+(mining.stage||0)]));gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);gl.uniform1f(U.lo,-1);gl.uniformMatrix4fv(U.vp,false,vp);gl.disable(gl.BLEND);}
  drawSkyAndWeather('clouds',vp,proj,view,cam,sky,fe*0.9,renderDist*CX*1.95,sun);
  gl.useProgram(chunkProg);gl.uniform1i(U.mode,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
  for(let i=visible.length-1;i>=0;i--){const c=visible[i][0];if(!c.water)continue;gl.uniform3f(U.off,c.cx*CX,0,c.cz*CZ);gl.bindVertexArray(c.water.vao);gl.drawElements(gl.TRIANGLES,c.water.count,gl.UNSIGNED_INT,0);stats.tris+=c.water.count/3;}
  gl.depthMask(true);gl.enable(gl.CULL_FACE);gl.disable(gl.BLEND);
  drawSkyAndWeather('fx',vp,proj,view,cam,sky,fs,fe,sun);
  const hit=playing&&!player.spectator?currentHit(world):null;
  if(hit&&!player.dead){gl.useProgram(lineProg);gl.uniformMatrix4fv(U.lvp,false,vp);gl.uniform3f(U.loff,hit.x,hit.y,hit.z);gl.bindVertexArray(boxVAO);gl.drawElements(gl.LINES,24,gl.UNSIGNED_SHORT,0);}
  if(playing&&!game.view&&!player.spectator&&game.hud)drawHand(proj,sun); gl.bindVertexArray(null); return hit;
}

// ---------------------------------------------------------------------
// saving and loading worlds
// ---------------------------------------------------------------------
let saveTimer=null;function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveWorld,1500);}
function saveWorld(){ if(game.state!=='playing'||!game.meta||game.meta.remote||net.guest)return; try{ const ds={};
  for(const [k,w] of Object.entries(dims)){ const edits=[];for(const [ck,m] of w.edits){const [cx,cz]=ck.split(',').map(Number);for(const [i,id] of m)edits.push(cx,cz,i,id);}
    w.flags.pets=savePets(w); ds[k]={edits,tiles:[...w.tiles.entries()],items:w.items.map(i=>[i.id,i.count,i.dur,i.pos,i.ench]),flags:w.flags}; }
  const data={seed:SEED,dayTime,dim:world.dim,player:{pos:player.pos,yaw:player.yaw,pitch:player.pitch,hp:player.hp,food:player.food,spawn:player.spawn,level:player.level,xp:player.xp,effects:player.effects,mode:gameMode(),nv:!!player.nightVision,dead:player.dead},
    inv:{slots:inventory.slots,armor:inventory.armor,sel:inventory.sel,creative:inventory.creative},dims:ds};
  if(!lsSet(WPFX+game.meta.id,JSON.stringify(data)))storageFull();
  game.meta.played=Date.now(); saveIndex(); }catch(e){ console.error(e); } }
function freeAllMeshes(){ for(const w of Object.values(dims))for(const c of w.chunks.values()){freeMesh(c.opaque);freeMesh(c.water);} }
function newWorld(seed,saved,meta){
  meta=meta||{}; SEED=seed; dims={}; const opts={type:meta.type||'default'};
  for(const k of ['over','nether','end']){const w=new World(k,seed,opts);w.onChange=onBlockChange;w.onChunk=onChunkCreated;w.onRecord=(x,y,z,v)=>net.localEdit(k,x,y,z,v);dims[k]=w;} world=dims.over;
  resetInventory();bobber=null;player.riding=null;player.burnT=0;player.dead=false;player.vel=[0,0,0];player.level=0;player.xp=0;player.effects={};player.nightVision=false;player.spectator=false;player.fly=false;player.sprint=false;
  mining.target=null; mining.progress=0;
  const c=world.gen.column(8,8);player.spawn=opts.type==='flat'?[8.5,c.h+1.01,8.5]:[8.5,Math.max(c.h,SEA_LEVEL)+3,8.5];
  if(saved){ for(const [k,d] of Object.entries(saved.dims||{})){ const w=dims[k]; if(!w)continue; const e=d.edits||[]; for(let i=0;i<e.length;i+=4){const ck=e[i]+','+e[i+1];if(!w.edits.has(ck))w.edits.set(ck,new Map());w.edits.get(ck).set(e[i+2],e[i+3]);}
      if(d.tiles)w.tiles=new Map(d.tiles); if(d.items)for(const [id,count,dur,pos,ench] of d.items)w.items.push({id,count,dur,ench,pos,vel:[0,0,0],w:0.125,h:0.25,onGround:false,age:1,spin:0}); w.flags=d.flags||{}; loadPets(w,w.flags.pets); }
    world=dims[saved.dim]||dims.over; dayTime=saved.dayTime??0.22;
    const sp=saved.player;
    if(sp){player.pos=sp.pos;player.yaw=sp.yaw;player.pitch=sp.pitch;player.hp=sp.hp??20;player.food=sp.food??20;player.level=sp.level||0;player.xp=sp.xp||0;if(sp.spawn)player.spawn=sp.spawn;player.effects=sp.effects||{};player.nightVision=!!sp.nv;}
    if(saved.inv){inventory.slots=saved.inv.slots;inventory.armor=saved.inv.armor||inventory.armor;inventory.sel=saved.inv.sel|0;}
    setGameMode(sp&&sp.mode?sp.mode:saved.inv&&saved.inv.creative?'creative':'survival');
    if(sp&&sp.dead){ player.pos=[...player.spawn]; player.hp=20; player.food=20; world=dims.over; }   // closed the game on the death screen
    if(world.dim==='end'&&!world.flags.dragonDead)spawnMob(world,'dragon',0,85,30);
  }else{ player.pos=[...player.spawn];player.yaw=0;player.pitch=-0.1;player.hp=20;player.food=20;dayTime=0.22; setGameMode(meta.mode==='creative'?'creative':'survival'); if(meta.bonus)world.flags.bonusChest=true; }
  player.fallPeak=player.pos[1];player.air=15;player.portalCd=3;player.invuln=2;buildHotbar();
}
function placeBonusChest(){ const w=dims.over,x=Math.floor(player.spawn[0])+2,z=Math.floor(player.spawn[2])+1; if(!w.loaded(x,z))return;
  let y=CY-2; while(y>1&&(!SOLID[w.getBlock(x,y-1,z)]||LIQ[w.getBlock(x,y-1,z)]))y--; delete w.flags.bonusChest; const prev=world; world=w;
  w.setBlock(x,y,z,CHEST); const t=getTile(x,y,z,CHEST); const put=(i,id,n)=>{t.slots[i].id=id;t.slots[i].count=n;};
  put(0,PICK_S,1); put(1,AXE_S,1); put(2,SWORD_W,1); put(3,LOG,12); put(4,BREAD,6); put(5,APPLE,4); put(6,TORCH,12); put(7,PLANKS,16); put(8,CRAFTING_TABLE,1);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(w.getBlock(x+dx,y,z+dz)===AIR&&SOLID[w.getBlock(x+dx,y-1,z+dz)])w.setBlock(x+dx,y,z+dz,TORCH);
  world=prev; showMsg('A bonus chest is waiting next to you!'); scheduleSave(); }
function respawn(){ if(world.dim!=='over'){world=dims.over;} player.pos=[...player.spawn];player.vel=[0,0,0];player.hp=20;player.food=20;player.air=15;player.dead=false;player.fallPeak=player.pos[1];player.portalCd=3;player.invuln=2;
  document.getElementById('death').classList.add('hidden'); resumeGame(); }

// --- switching between the title screen, your own worlds and friends' worlds ---
function showHud(on){ document.getElementById('hud').classList.toggle('hidden',!on); }
function loadPanorama(){ freeAllMeshes(); game.meta=null; newWorld(PANORAMA_SEED,null,{}); renderDist=Math.min(SETTINGS.dist,5);
  const c=dims.over.gen.column(40,-30); player.pos=[40.5,Math.max(c.h,SEA_LEVEL)+16,-29.5]; player.yaw=0.6; player.pitch=-0.22; dayTime=0.2; }
function playWorld(meta){ if(net.role)net.reset(); friends.cancelJoin(); const saved=lsGet(WPFX+meta.id,null);
  freeAllMeshes(); game.meta=meta; newWorld(meta.seed,saved,meta); if(meta.dead)setGameMode('spectator');
  renderDist=SETTINGS.dist; game.state='playing'; game.paused=false; game.view=0; game.thumbT=4; meta.played=Date.now(); saveIndex(); if(!saved)saveWorld();
  hideTitle(); showHud(true); chatLog.length=0; addChat(`Welcome to ${meta.name}! (${modeLabel(meta)}${cheatsOn()?', cheats on':''})`,'#ff8'); buildHotbar(); resumeGame(); friends.changed(); }
function quitToTitle(msg){ if(game.state==='playing')saveWorld(); if(uiOpen)closeUI(false); if(chatOpen){chatOpen=false;chatInput.classList.add('hidden');}
  net.reset(); friends.cancelJoin(); document.getElementById('death').classList.add('hidden'); pauseEl.classList.add('hidden'); mpEl.classList.add('hidden');
  game.state='title'; game.paused=false; player.dead=false; showHud(false); document.exitPointerLock(); loadPanorama(); showTitle(msg); friends.changed(); }
function onGuestDisconnected(msg){ friends.joinTarget=null; if(game.state==='playing')quitToTitle(msg); else showTitle(msg); }
// a friend's world: the host sends the seed, rules and every changed block
function startGuestWorld(m){ friends.joined(); if(game.state==='playing'&&game.meta&&!game.meta.remote)saveWorld();
  freeAllMeshes(); game.meta={...m.meta,remote:true,name:m.meta.name||(net.hostName+'\'s world')}; newWorld(m.seed,null,game.meta);
  world=dims[m.dim]||dims.over; player.pos=[m.at[0],m.at[1]+0.2,m.at[2]]; player.fallPeak=player.pos[1]; player.spawn=[...player.pos]; dayTime=m.dayTime;
  for(const p of m.players)if(p.id!==net.myId)net.remotes.set(p.id,{id:p.id,name:p.name,skin:p.skin|0,dim:null,pos:null});
  setGameMode(m.meta.mode==='creative'?'creative':'survival'); renderDist=SETTINGS.dist; game.state='playing'; game.view=0; mpEl.classList.add('hidden');
  hideTitle(); showHud(true); chatLog.length=0; addChat(`Connected! You are in ${net.hostName}'s world "${game.meta.name}".`,'#8f8'); buildHotbar(); openPause('You joined '+net.hostName+'\'s world. Click Back to Game to start playing!'); friends.changed(); }

// name tags above other players
const tagsEl=document.getElementById('tags'),tagEls=new Map();
function clearNameTags(){ for(const el of tagEls.values())el.remove(); tagEls.clear(); }
function updateNameTags(){ const seen=new Set(); if(lastVP&&game.state==='playing')for(const r of net.remotesIn(world.dim)){ if(r.spec)continue; const m=lastVP,x=r.pos[0],y=r.pos[1]+2.2,z=r.pos[2];
    const cw=m[3]*x+m[7]*y+m[11]*z+m[15]; if(cw<=0.1)continue; const cx=(m[0]*x+m[4]*y+m[8]*z+m[12])/cw,cy=(m[1]*x+m[5]*y+m[9]*z+m[13])/cw;
    let el=tagEls.get(r.id); if(!el){el=document.createElement('div');el.className='tag';tagsEl.appendChild(el);tagEls.set(r.id,el);} el.textContent=r.name;
    el.style.left=((cx*0.5+0.5)*canvas.clientWidth)+'px'; el.style.top=((-cy*0.5+0.5)*canvas.clientHeight)+'px'; el.style.display='block'; seen.add(r.id); }
  for(const [id,el] of tagEls)if(!seen.has(id))el.style.display='none'; }

// --- main loop ---
let last=performance.now(),fpsAcc=0,fpsN=0,fps=0,hudTimer=0,spawnTimer=0,furnUiT=0,plateT=0;
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(game.state==='title'){ player.yaw+=dt*0.035; world.mobs.length=0; net.update(dt); updateChunks(); render(); requestAnimationFrame(frame); return; }
  stats.dt=dt; const sun=sunFactor(), frozen=game.paused&&!net.role;   // single player pauses with the menu open; multiplayer keeps running
  if(!frozen){
    if(!player.dead&&rule('daylight'))dayTime=(dayTime+dt/DAY_LENGTH)%1; attackCd=Math.max(0,attackCd-dt);bowCd=Math.max(0,bowCd-dt);
    if(locked&&!uiOpen){updatePlayer(world,dt); if(!player.spectator){updateMining(world,dt,mouseDown[0]&&!mobHit(world));if(mouseDown[0])attack(world);if(mouseDown[2]&&now>nextPlace){useItem(world);nextPlace=now+200;}}}
    else{updateMining(world,dt,false);if(!player.dead)updatePlayer(world,dt);}
    if(!player.dead){updateMobs(world,dt,sun);spawnTimer+=dt;if(spawnTimer>1){spawnTimer=0;trySpawn(world,sun);}}
    world.time+=dt; plateT+=dt; if(plateT>0.1){plateT=0;updatePlates(world);} updateTimers(world);
    updateLiquids(world); updateRedstone(world); updateGrowth(world,dt); updateTNT(world,dt);
    updateItems(world,dt);updateFalling(world,dt);updateArrows(world,dt);tickTiles(dt);updateWeather(dt);updateParticles(dt);updateBobber(dt);
    if(dims.over.flags.bonusChest&&world===dims.over)placeBonusChest();
  }
  net.update(dt);
  furnUiT+=dt;if(furnUiT>0.25){furnUiT=0;updateFurnaceUI();}
  updateChunks();const hit=render(); updateNameTags();
  if(game.meta&&!game.meta.remote){ game.thumbT-=dt; if(game.thumbT<=0||game.wantThumb){ const t=captureThumb(); if(t){game.meta.thumb=t;saveIndex();} game.thumbT=180; game.wantThumb=false; } }
  fpsAcc+=dt;fpsN++;hudTimer+=dt;
  if(hudTimer>0.25){fps=Math.round(fpsN/fpsAcc);fpsAcc=0;fpsN=0;hudTimer=0;const p=player.pos,hrs=Math.floor(((dayTime+0.25)%1)*24);
    debugEl.style.display=game.debug?'block':'none';
    if(game.debug)debugEl.textContent=`${fps} fps  ${stats.drawn} chunks / ${world.chunks.size} loaded  ${Math.round(stats.tris/1000)}k tris  mobs ${world.mobs.length}  drops ${world.items.length}\n`+
      `xyz ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${p[2].toFixed(1)}  ${DIMS[world.dim].name}  ${gameMode()}  ${DIFF_NAMES[difficulty()]}  ${world.dim==='over'?`time ${String(hrs).padStart(2,'0')}:00 ${sun>0.5?'day':'night'}`:''}\n`+
      `looking at: ${hit?BLOCKS[hit.block].name+' ('+hit.x+','+hit.y+','+hit.z+')':'-'}   light ${Math.round(effectiveLight(world,p[0],p[1]+1,p[2],sun))}   seed ${SEED}${net.status()}`;
    updateBars();renderChat();}
  requestAnimationFrame(frame);
}
loadPanorama(); showTitle(); friends.start();
requestAnimationFrame(frame);
