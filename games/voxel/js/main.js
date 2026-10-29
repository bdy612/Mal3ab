'use strict';
// CHUNK MANAGER, RENDER LOOP, PERSISTENCE, UI
// ---------------------------------------------------------------------
let world,dims={},renderDist=6,dayTime=0.22;const DAY_LENGTH=600,GEN_BUDGET_MS=8,MESH_BUDGET_MS=6,SAVE_KEY='voxel-survival-v4';
function sunFactor(){return world.dim==='over'?clamp(0.12+Math.sin(dayTime*Math.PI*2)*1.4,0.12,1):DIMS[world.dim].sun;}
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
function render(){
  const dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.floor(canvas.clientWidth*dpr),h=Math.floor(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);
  const D=DIMS[world.dim],sun=sunFactor(),day=[0.55,0.75,0.95],night=[0.02,0.03,0.08],ds=clamp((sun-0.12)/0.88,0,1);
  let sky=D.sky?D.sky.slice():day.map((v,i)=>night[i]+(v-night[i])*ds);if(player.inWater)sky=[0.1*ds+0.01,0.25*ds+0.02,0.6*ds+0.05];if(player.inLava)sky=[0.8,0.3,0.05];
  gl.clearColor(sky[0],sky[1],sky[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
  const eyeY=player.pos[1]+EYE-(player.sneak?0.15:0),eye=[player.pos[0],eyeY,player.pos[2]];
  const view=mul(rotX(-player.pitch),rotY(-player.yaw),translate(-eye[0],-eye[1],-eye[2])),proj=perspective((player.sprint?78:70)*Math.PI/180,w/h,0.05,renderDist*CX*2),vp=mat4Mul(proj,view),planes=frustumPlanes(vp),far=renderDist*CX*(D.fog||1);
  const fs=player.inWater?2:player.inLava?0.5:far*0.6,fe=player.inWater?14:player.inLava?3:far*0.98;
  const visible=[];for(const c of world.chunks.values()){if(!c.opaque&&!c.water)continue;const mx=c.cx*CX,mz=c.cz*CZ;if(!aabbInFrustum(planes,mx,0,mz,mx+CX,CY,mz+CZ))continue;const dx=mx+8-eye[0],dz=mz+8-eye[2];visible.push([c,dx*dx+dz*dz]);}
  visible.sort((a,b)=>a[1]-b[1]);
  gl.useProgram(chunkProg);gl.uniformMatrix4fv(U.vp,false,vp);gl.uniform1i(U.tex,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,texArray);
  gl.uniform3f(U.fog,sky[0],sky[1],sky[2]);gl.uniform1f(U.fs,fs);gl.uniform1f(U.fe,fe);gl.uniform1f(U.sun,sun);gl.uniform1f(U.lo,-1);gl.uniform1f(U.amb,hasFx('night')?0.8:D.amb);stats.tris=0;stats.drawn=0;gl.uniform1i(U.mode,0);
  for(const [c] of visible){if(!c.opaque)continue;gl.uniform3f(U.off,c.cx*CX,0,c.cz*CZ);gl.bindVertexArray(c.opaque.vao);gl.drawElements(gl.TRIANGLES,c.opaque.count,gl.UNSIGNED_INT,0);stats.tris+=c.opaque.count/3;stats.drawn++;}
  drawEntities(world,vp,planes,sun,sky,fs,fe,hasFx('night')?0.8:D.amb); lastVP=vp;
  if(mining.target&&mining.hit){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1i(U.mode,2);gl.uniform1f(U.lo,1);gl.uniformMatrix4fv(U.vp,false,mul(vp,translate(mining.hit.x-0.002,mining.hit.y-0.002,mining.hit.z-0.002),scale(1.004)));const m=cubeMesh(Array(6).fill(T['CRACK'+(mining.stage||0)]));gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);gl.uniform1f(U.lo,-1);gl.uniformMatrix4fv(U.vp,false,vp);gl.disable(gl.BLEND);}
  gl.uniform1i(U.mode,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
  for(let i=visible.length-1;i>=0;i--){const c=visible[i][0];if(!c.water)continue;gl.uniform3f(U.off,c.cx*CX,0,c.cz*CZ);gl.bindVertexArray(c.water.vao);gl.drawElements(gl.TRIANGLES,c.water.count,gl.UNSIGNED_INT,0);stats.tris+=c.water.count/3;}
  gl.depthMask(true);gl.enable(gl.CULL_FACE);gl.disable(gl.BLEND);
  const hit=currentHit(world);
  if(hit&&!player.dead){gl.useProgram(lineProg);gl.uniformMatrix4fv(U.lvp,false,vp);gl.uniform3f(U.loff,hit.x,hit.y,hit.z);gl.bindVertexArray(boxVAO);gl.drawElements(gl.LINES,24,gl.UNSIGNED_SHORT,0);}
  drawHand(proj,sun); gl.bindVertexArray(null); return hit;
}

// persistence (per dimension: edits, tiles, items, flags)
let saveTimer=null;function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveWorld,1500);}
function saveWorld(){if(net.guest)return;try{ const ds={}; for(const [k,w] of Object.entries(dims)){ const edits=[];for(const [ck,m] of w.edits){const [cx,cz]=ck.split(',').map(Number);for(const [i,id] of m)edits.push(cx,cz,i,id);}
    ds[k]={edits,tiles:[...w.tiles.entries()],items:w.items.map(i=>[i.id,i.count,i.dur,i.pos,i.ench]),flags:w.flags}; }
  localStorage.setItem(SAVE_KEY,JSON.stringify({seed:SEED,dayTime,dim:world.dim,player:{pos:player.pos,yaw:player.yaw,pitch:player.pitch,hp:player.hp,food:player.food,spawn:player.spawn,level:player.level,xp:player.xp,effects:player.effects},name:net.name,inv:{slots:inventory.slots,armor:inventory.armor,sel:inventory.sel,creative:inventory.creative},dims:ds}));}catch(e){}}
function newWorld(seed,saved){
  SEED=seed; dims={}; for(const k of ['over','nether','end']){const w=new World(k,seed);w.onChange=onBlockChange;w.onChunk=onChunkCreated;w.onRecord=(x,y,z,v)=>net.localEdit(k,x,y,z,v);dims[k]=w;} world=dims.over;
  resetInventory();player.dead=false;player.vel=[0,0,0];player.level=0;player.xp=0;player.effects={};
  const c=world.gen.column(8,8);player.spawn=[8.5,Math.max(c.h,SEA_LEVEL)+3,8.5];
  if(saved){ for(const [k,d] of Object.entries(saved.dims||{})){ const w=dims[k]; if(!w)continue; const e=d.edits||[]; for(let i=0;i<e.length;i+=4){const ck=e[i]+','+e[i+1];if(!w.edits.has(ck))w.edits.set(ck,new Map());w.edits.get(ck).set(e[i+2],e[i+3]);}
      if(d.tiles)w.tiles=new Map(d.tiles); if(d.items)for(const [id,count,dur,pos,ench] of d.items)w.items.push({id,count,dur,ench,pos,vel:[0,0,0],w:0.125,h:0.25,onGround:false,age:1,spin:0}); w.flags=d.flags||{}; }
    world=dims[saved.dim]||dims.over; dayTime=saved.dayTime||0.22;
    if(saved.player){player.pos=saved.player.pos;player.yaw=saved.player.yaw;player.pitch=saved.player.pitch;player.hp=saved.player.hp??20;player.food=saved.player.food??20;player.level=saved.player.level||0;player.xp=saved.player.xp||0;if(saved.player.spawn)player.spawn=saved.player.spawn;player.effects=saved.player.effects||{};}
    if(saved.name){net.name=saved.name;document.getElementById('mpName').value=saved.name;}
    if(saved.inv){inventory.slots=saved.inv.slots;inventory.armor=saved.inv.armor||inventory.armor;inventory.sel=saved.inv.sel|0;inventory.creative=!!saved.inv.creative;}
    if(world.dim==='end'&&!world.flags.dragonDead)spawnMob(world,'dragon',0,85,30);
  }else{player.pos=[...player.spawn];player.yaw=0;player.pitch=-0.1;player.hp=20;player.food=20;dayTime=0.22;inventory.creative=false;}
  player.fallPeak=player.pos[1];player.air=15;player.portalCd=3;buildHotbar();
}
function respawn(){ if(world.dim!=='over'){world=dims.over;} player.pos=[...player.spawn];player.vel=[0,0,0];player.hp=20;player.food=20;player.air=15;player.dead=false;player.fallPeak=player.pos[1];player.portalCd=3;document.getElementById('death').classList.add('hidden');canvas.requestPointerLock();}
function loadOrCreate(){let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVE_KEY));}catch(e){}if(saved&&saved.seed)newWorld(saved.seed,saved);else newWorld(1+Math.floor(Math.random()*2147483000),null);}


// name tags above other players
const tagsEl=document.getElementById('tags'),tagEls=new Map();
function updateNameTags(){ const seen=new Set(); if(lastVP)for(const r of net.remotesIn(world.dim)){ const m=lastVP,x=r.pos[0],y=r.pos[1]+2.2,z=r.pos[2];
    const cw=m[3]*x+m[7]*y+m[11]*z+m[15]; if(cw<=0.1)continue; const cx=(m[0]*x+m[4]*y+m[8]*z+m[12])/cw,cy=(m[1]*x+m[5]*y+m[9]*z+m[13])/cw;
    let el=tagEls.get(r.id); if(!el){el=document.createElement('div');el.className='tag';tagsEl.appendChild(el);tagEls.set(r.id,el);} el.textContent=r.name;
    el.style.left=((cx*0.5+0.5)*canvas.clientWidth)+'px'; el.style.top=((-cy*0.5+0.5)*canvas.clientHeight)+'px'; el.style.display='block'; seen.add(r.id); }
  for(const [id,el] of tagEls)if(!seen.has(id))el.style.display='none'; }
// --- main loop ---
loadOrCreate();
let last=performance.now(),fpsAcc=0,fpsN=0,fps=0,hudTimer=0,spawnTimer=0,furnUiT=0,plateT=0;
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;const sun=sunFactor();
  if(!player.dead)dayTime=(dayTime+dt/DAY_LENGTH)%1; attackCd=Math.max(0,attackCd-dt);bowCd=Math.max(0,bowCd-dt);
  if(locked&&!uiOpen){updatePlayer(world,dt);updateMining(world,dt,mouseDown[0]&&!mobHit(world));if(mouseDown[0])attack(world);if(mouseDown[2]&&now>nextPlace){useItem(world);nextPlace=now+250;}}
  else{updateMining(world,dt,false);if(!player.dead&&!locked&&uiOpen)updatePlayer(world,dt);}
  if(!player.dead){updateMobs(world,dt,sun);spawnTimer+=dt;if(spawnTimer>1){spawnTimer=0;trySpawn(world,sun);}}
  world.time+=dt; plateT+=dt; if(plateT>0.1){plateT=0;updatePlates(world);} updateTimers(world);
  updateLiquids(world); updateRedstone(world); updateGrowth(world,dt); updateTNT(world,dt);
  updateItems(world,dt);updateFalling(world,dt);updateArrows(world,dt);tickTiles(dt); net.update(dt);
  furnUiT+=dt;if(furnUiT>0.25){furnUiT=0;updateFurnaceUI();}
  updateChunks();const hit=render(); updateNameTags();
  fpsAcc+=dt;fpsN++;hudTimer+=dt;
  if(hudTimer>0.25){fps=Math.round(fpsN/fpsAcc);fpsAcc=0;fpsN=0;hudTimer=0;const p=player.pos,hrs=Math.floor(((dayTime+0.25)%1)*24);
    debugEl.textContent=`${fps} fps  ${stats.drawn} chunks / ${world.chunks.size} loaded  ${Math.round(stats.tris/1000)}k tris  mobs ${world.mobs.length}  drops ${world.items.length}\n`+
      `xyz ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${p[2].toFixed(1)}  ${DIMS[world.dim].name}  ${inventory.creative?'creative':'survival'}  ${world.dim==='over'?`time ${String(hrs).padStart(2,'0')}:00 ${sun>0.5?'day':'night'}`:''}\n`+
      `looking at: ${hit?BLOCKS[hit.block].name+' ('+hit.x+','+hit.y+','+hit.z+')':'-'}   light ${Math.round(effectiveLight(world,p[0],p[1]+1,p[2],sun))}   seed ${SEED}${net.status()}`;updateBars();renderChat();}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

