'use strict';
// =====================================================================
// SKY & WEATHER: sun, moon, stars, clouds, sunrise colours, rain / snow /
// thunderstorms with lightning, and small particles (block bits, smoke).
// Everything here is drawn with one simple coloured-quad shader.
// =====================================================================
const quadProg=compile(`#version 300 es
layout(location=0) in vec3 p; layout(location=1) in vec4 c;
uniform mat4 uVP; uniform vec3 uOff; uniform vec4 uMul; out vec4 vC; out float vD;
void main(){ vec4 cp=uVP*vec4(p+uOff,1.0); vD=cp.w; vC=c*uMul; gl_Position=cp; }`,`#version 300 es
precision mediump float; in vec4 vC; in float vD; uniform vec3 uFog; uniform float uFs; uniform float uFe; uniform float uFade; out vec4 o;
void main(){ float f=clamp((vD-uFs)/(uFe-uFs),0.0,1.0); o=vec4(mix(vC.rgb,uFog,f*(1.0-uFade)),vC.a*(1.0-f*uFade)); if(o.a<0.01)discard; }`);
const QU={}; for(const k of ['uVP','uOff','uMul','uFog','uFs','uFe','uFade'])QU[k]=gl.getUniformLocation(quadProg,k);
function makeQuadBuf(){ const vao=gl.createVertexArray(),vb=gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,4,gl.FLOAT,false,28,12); gl.bindVertexArray(null); return {vao,vb,n:0}; }
// push one quad given centre, two half-axes and a colour (6 vertices, two triangles)
function pushQuad(a,cx,cy,cz,ux,uy,uz,vx,vy,vz,r,g,b,al){ const P=[[cx-ux-vx,cy-uy-vy,cz-uz-vz],[cx+ux-vx,cy+uy-vy,cz+uz-vz],[cx+ux+vx,cy+uy+vy,cz+uz+vz],[cx-ux+vx,cy-uy+vy,cz-uz+vz]];
  for(const i of [0,1,2,0,2,3])a.push(P[i][0],P[i][1],P[i][2],r,g,b,al); }
function quadUniforms(vp,off,mul,fog,fs,fe,fade){ gl.useProgram(quadProg); gl.uniformMatrix4fv(QU.uVP,false,vp); gl.uniform3f(QU.uOff,off[0],off[1],off[2]); gl.uniform4f(QU.uMul,mul[0],mul[1],mul[2],mul[3]);
  gl.uniform3f(QU.uFog,fog[0],fog[1],fog[2]); gl.uniform1f(QU.uFs,fs); gl.uniform1f(QU.uFe,fe); gl.uniform1f(QU.uFade,fade); }
function drawBuf(buf,data,usage){ gl.bindVertexArray(buf.vao); gl.bindBuffer(gl.ARRAY_BUFFER,buf.vb); if(data){ gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),usage||gl.STREAM_DRAW); buf.n=data.length/7; } if(buf.n)gl.drawArrays(gl.TRIANGLES,0,buf.n); }

// --- static sky pieces: stars on a sphere, sun and moon ---
const starBuf=makeQuadBuf(), sunBuf=makeQuadBuf(), moonBuf=makeQuadBuf(), cloudBuf=makeQuadBuf(), dynBuf=makeQuadBuf();
{ const a=[]; for(let i=0;i<700;i++){ const u=hash3(i,1,77)*2-1,t=hash3(i,2,77)*Math.PI*2,r=Math.sqrt(1-u*u),x=r*Math.cos(t)*100,y=u*100,z=r*Math.sin(t)*100,s=0.15+hash3(i,3,77)*0.25,br=0.5+hash3(i,4,77)*0.5;
    // two axes perpendicular to the direction
    const n=[x/100,y/100,z/100],up=Math.abs(n[1])<0.9?[0,1,0]:[1,0,0],ax=[n[1]*up[2]-n[2]*up[1],n[2]*up[0]-n[0]*up[2],n[0]*up[1]-n[1]*up[0]],al=Math.hypot(...ax),au=ax.map(v=>v/al*s),bv=[n[1]*au[2]-n[2]*au[1],n[2]*au[0]-n[0]*au[2],n[0]*au[1]-n[1]*au[0]];
    pushQuad(a,x,y,z,au[0],au[1],au[2],bv[0],bv[1],bv[2],br,br,br,1); } drawBuf(starBuf,a,gl.STATIC_DRAW); }
{ const a=[]; pushQuad(a,100,0,0,0,0,15,0,15,0,1,0.9,0.6,0.16); pushQuad(a,99.9,0,0,0,0,9,0,9,0,1,0.97,0.78,1); drawBuf(sunBuf,a,gl.STATIC_DRAW); }
{ const a=[]; pushQuad(a,-100,0,0,0,0,6,0,6,0,0.9,0.92,1,1); for(const [dy,dz,s] of [[2,-2,1.4],[-2,1.5,1.8],[1.5,2.5,0.9],[-3,-2.5,1]])pushQuad(a,-99.9,dy,dz,0,0,s,0,s,0,0.7,0.72,0.8,1); drawBuf(moonBuf,a,gl.STATIC_DRAW); }
// --- clouds: blocky slabs on a repeating 384×384 tile ---
const CLOUD_Y=124,CLOUD_CELL=12,CLOUD_N=32,CLOUD_TILE=CLOUD_CELL*CLOUD_N;
{ const a=[],on=(i,j)=>{ i=(i+CLOUD_N)%CLOUD_N; j=(j+CLOUD_N)%CLOUD_N; const n=hash3(i>>1,j>>1,301)*0.6+hash3(i,j,302)*0.4; return n>0.62; };
  for(let i=0;i<CLOUD_N;i++)for(let j=0;j<CLOUD_N;j++){ if(!on(i,j))continue; const x0=i*CLOUD_CELL,z0=j*CLOUD_CELL,x1=x0+CLOUD_CELL,z1=z0+CLOUD_CELL,y0=0,y1=4,cx=(x0+x1)/2,cz=(z0+z1)/2,h=CLOUD_CELL/2;
    pushQuad(a,cx,y1,cz,h,0,0,0,0,h,1,1,1,0.85); pushQuad(a,cx,y0,cz,h,0,0,0,0,-h,0.78,0.78,0.82,0.85);
    if(!on(i+1,j))pushQuad(a,x1,2,cz,0,0,h,0,2,0,0.9,0.9,0.92,0.85); if(!on(i-1,j))pushQuad(a,x0,2,cz,0,0,-h,0,2,0,0.9,0.9,0.92,0.85);
    if(!on(i,j+1))pushQuad(a,cx,2,z1,-h,0,0,0,2,0,0.86,0.86,0.9,0.85); if(!on(i,j-1))pushQuad(a,cx,2,z0,h,0,0,0,2,0,0.86,0.86,0.9,0.85); }
  drawBuf(cloudBuf,a,gl.STATIC_DRAW); }

// --- weather state (overworld only, saved in the world flags, sent to guests) ---
function weatherState(){ const f=dims.over&&dims.over.flags; if(!f)return {rain:0,thunder:false}; if(!f.weather)f.weather={on:false,thunder:false,t:300+Math.random()*600}; return f.weather; }
let rainLevel=0,thunderLevel=0,flashT=0,bolts=[];
function updateWeather(dt){ const W=weatherState();
  if(!net.guest&&game.state==='playing'){ W.t-=dt; if(W.t<=0){ W.on=!W.on; W.thunder=W.on&&Math.random()<0.3; W.t=W.on?120+Math.random()*240:360+Math.random()*700; net.sendWeather&&net.sendWeather(); } }
  const want=W.on&&world.dim==='over'?1:0; rainLevel+=(want-rainLevel)*Math.min(1,dt*0.4); thunderLevel+=((W.thunder&&W.on&&world.dim==='over'?1:0)-thunderLevel)*Math.min(1,dt*0.4);
  flashT=Math.max(0,flashT-dt); for(const b of bolts)b.t-=dt; bolts=bolts.filter(b=>b.t>0);
  if(thunderLevel>0.6&&!net.guest&&game.state==='playing'){ W.boltT=(W.boltT??10)-dt; if(W.boltT<=0){ W.boltT=6+Math.random()*18; const a=Math.random()*6.28,r=Math.random()*48,x=Math.floor(player.pos[0]+Math.cos(a)*r),z=Math.floor(player.pos[2]+Math.sin(a)*r); lightning(x,z,true); } }
  if(rainLevel>0.05)rainAudio(rainLevel*(snowing()?0:1)); else rainAudio(0); }
function snowing(){ if(world.dim!=='over')return false; const c=dims.over.gen.column(Math.floor(player.pos[0]),Math.floor(player.pos[2])); return c.biome===BIOME.SNOW||player.pos[1]>96; }
function desertHere(){ if(world.dim!=='over'||dims.over.gen.flat)return false; return dims.over.gen.column(Math.floor(player.pos[0]),Math.floor(player.pos[2])).biome===BIOME.DESERT; }
// lightning: a flash, a crack of thunder, fire where it hits and damage nearby
function findRod(w,x,z){ let best=null,bd=33; for(const [k,p] of (w.rods||new Map())){ if(w.getBlock(p[0],p[1],p[2])!==LIGHTNING_ROD){ w.rods.delete(k); continue; } const d=Math.hypot(p[0]-x,p[2]-z); if(d<bd){bd=d;best=p;} } return best; }
function lightning(x,z,real){ const w=dims.over; if(!w.loaded(x,z))return; const rod=real?findRod(w,x,z):null; if(rod){ x=rod[0]; z=rod[2]; }
  let y=CY-1; while(y>0&&!SOLID[w.getBlock(x,y,z)]&&!LIQ[w.getBlock(x,y,z)])y--;
  const pts=[]; let px=x+0.5,pz=z+0.5; for(let yy=y+70;yy>y+1;yy-=4){ pts.push([px,yy,pz]); px+=(Math.random()-0.5)*2.4; pz+=(Math.random()-0.5)*2.4; } pts.push([x+0.5,y+1,z+0.5]);
  bolts.push({pts,t:0.35}); flashT=0.25; const d=Math.hypot(player.pos[0]-x,player.pos[2]-z); setTimeout(()=>sfx.thunder(),Math.min(2500,d*12));
  if(!real)return; if(net.role==='host')net.broadcast({t:'bolt',x,z});
  if(world===w){ if(d<3.5&&Math.abs(player.pos[1]-y)<4&&!player.spectator&&!inventory.creative){ player.invuln=0; damagePlayer(5,false,'lightning'); player.burnT=Math.max(player.burnT||0,4); }
    for(const m of w.mobs)if(Math.hypot(m.pos[0]-x,m.pos[2]-z)<3.5&&!m.def.boss)hurtMob(w,m,6,null); }
  if(rod)return; if(!LIQ[w.getBlock(x,y,z)]&&w.getBlock(x,y+1,z)===AIR&&difficulty()!=='peaceful'){ const prev=world; world=w; w.setBlock(x,y+1,z,FIRE); world=prev; } }

// --- particles ---
const particles=[];
function spawnParticles(x,y,z,col,n,o={}){ if(particles.length>1500)return; for(let i=0;i<n;i++)particles.push({x:x+(Math.random()-0.5)*(o.spread??0.8),y:y+(Math.random()-0.5)*(o.spread??0.8),z:z+(Math.random()-0.5)*(o.spread??0.8),
  vx:(Math.random()-0.5)*(o.speed??4),vy:Math.random()*(o.up??4),vz:(Math.random()-0.5)*(o.speed??4),g:o.g??-16,life:(o.life??0.6)*(0.6+Math.random()*0.8),age:0,s:o.size??0.07,
  c:[col[0]*(0.85+Math.random()*0.3),col[1]*(0.85+Math.random()*0.3),col[2]*(0.85+Math.random()*0.3)],a:o.alpha??1,grow:o.grow||0}); }
const blockColorCache={};
function blockColor(b){ if(blockColorCache[b])return blockColorCache[b]; const layer=BLOCKS[b]?BLOCKS[b].tex[0]:0,o=layer*TEX_SIZE*TEX_SIZE*4; let r=0,g=0,bl=0,n=0;
  for(let i=0;i<TEX_SIZE*TEX_SIZE;i++){ if(texData[o+i*4+3]<100)continue; r+=texData[o+i*4];g+=texData[o+i*4+1];bl+=texData[o+i*4+2];n++; } const t=TINT_RGB[TINT[b]]||[1,1,1];
  return blockColorCache[b]=n?[r/n/255*t[0],g/n/255*t[1],bl/n/255*t[2]]:[0.5,0.5,0.5]; }
function blockBreakParticles(b,x,y,z){ spawnParticles(x+0.5,y+0.5,z+0.5,blockColor(b),14,{spread:0.8,speed:3,up:3,life:0.7,size:0.06}); }
function smokeParticles(x,y,z,n=24,r=1.5){ spawnParticles(x,y,z,[0.55,0.55,0.55],n,{spread:r*1.5,speed:3,up:3,g:2,life:1.2,size:0.25,alpha:0.7,grow:0.4}); }
function updateParticles(dt){ for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.age+=dt; if(p.age>p.life){particles.splice(i,1);continue;}
  p.vy+=p.g*dt; const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt,nz=p.z+p.vz*dt; if(SOLID[world.getBlock(Math.floor(nx),Math.floor(ny),Math.floor(nz))]){ p.vx*=0.3;p.vz*=0.3;p.vy=0; } else { p.x=nx;p.y=ny;p.z=nz; } p.s+=p.grow*dt; } }

// --- rain / snow drops around the camera ---
const drops=[]; for(let i=0;i<700;i++)drops.push({x:0,y:-999,z:0,ph:Math.random()*6.28});
function drawSkyAndWeather(stage,vp,proj,view,cam,sky,fs,fe,sun){
  const D=DIMS[world.dim];
  if(stage==='sky'){ if(world.dim!=='over')return;
    const rot=mul(proj,rotX(-cam.pitch),rotY(-cam.yaw)), ang=dayTime*Math.PI*2, night=clamp(1-sun*2.4,0,1)*(1-rainLevel);
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.CULL_FACE);
    const skyRot=mul(rot,rotZ(ang));
    if(night>0.02){ quadUniforms(skyRot,[0,0,0],[1,1,1,night],sky,1e5,2e5,0); drawBuf(starBuf); }
    const clear=1-rainLevel*0.85; quadUniforms(skyRot,[0,0,0],[1,1,1,clear],sky,1e5,2e5,0); drawBuf(sunBuf); drawBuf(moonBuf);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); return; }
  if(stage==='clouds'){ if(world.dim!=='over')return;
    const drift=(performance.now()/1000)*1.2, ox=Math.floor((cam.pos[0]-drift)/CLOUD_TILE)*CLOUD_TILE+drift, oz=Math.floor(cam.pos[2]/CLOUD_TILE)*CLOUD_TILE;
    const lum=clamp(0.15+sun*0.9,0.15,1)*(1-rainLevel*0.45), far=Math.max(fe*2.2,260);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.CULL_FACE);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ quadUniforms(vp,[ox+i*CLOUD_TILE,CLOUD_Y,oz+j*CLOUD_TILE],[lum,lum,lum*1.02,1],sky,far*0.45,far,1); drawBuf(cloudBuf); }
    gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); return; }
  // particles, rain/snow, lightning bolts
  const a=[], right=[Math.cos(cam.yaw),0,-Math.sin(cam.yaw)], f=[-Math.sin(cam.yaw)*Math.cos(cam.pitch),Math.sin(cam.pitch),-Math.cos(cam.yaw)*Math.cos(cam.pitch)];
  const up=[right[1]*f[2]-right[2]*f[1],right[2]*f[0]-right[0]*f[2],right[0]*f[1]-right[1]*f[0]];
  for(const p of particles){ const s=p.s,al=p.a*(1-p.age/p.life*0.6); pushQuad(a,p.x,p.y,p.z,right[0]*s,right[1]*s,right[2]*s,up[0]*s,up[1]*s,up[2]*s,p.c[0],p.c[1],p.c[2],al); }
  if(rainLevel>0.02&&world.dim==='over'&&!desertHere()){ const snow=snowing(), n=Math.floor(drops.length*rainLevel), dt=Math.min(0.05,stats.dt||0.016), R=14;
    for(let i=0;i<n;i++){ const d=drops[i];
      if(d.y<cam.pos[1]-10||d.y>cam.pos[1]+22||Math.abs(d.x-cam.pos[0])>R||Math.abs(d.z-cam.pos[2])>R){ d.x=cam.pos[0]+(Math.random()*2-1)*R; d.z=cam.pos[2]+(Math.random()*2-1)*R; d.y=cam.pos[1]+4+Math.random()*16; }
      d.y-=(snow?2.2:16)*dt; if(snow){ d.x+=Math.sin(d.ph+d.y)*0.4*dt; }
      const bx=Math.floor(d.x),by=Math.floor(d.y),bz=Math.floor(d.z); if(world.getSky(bx,by,bz)<15||SOLID[world.getBlock(bx,by,bz)]){ d.y=-999; continue; }
      if(snow)pushQuad(a,d.x,d.y,d.z,right[0]*0.06,0,right[2]*0.06,0,0.06,0,1,1,1,0.9);
      else pushQuad(a,d.x,d.y,d.z,right[0]*0.025,0,right[2]*0.025,0,0.45,0,0.6,0.68,0.9,0.5); } }
  for(const b of bolts)for(let i=0;i<b.pts.length-1;i++){ const p0=b.pts[i],p1=b.pts[i+1],cx=(p0[0]+p1[0])/2,cy=(p0[1]+p1[1])/2,cz=(p0[2]+p1[2])/2;
    pushQuad(a,cx,cy,cz,right[0]*0.18,0,right[2]*0.18,(p0[0]-p1[0])/2,(p0[1]-p1[1])/2,(p0[2]-p1[2])/2,0.85,0.9,1,0.95); }
  if(!a.length)return;
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.disable(gl.CULL_FACE);
  quadUniforms(vp,[0,0,0],[1,1,1,1],sky,fs,fe,0); drawBuf(dynBuf,a);
  gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); }
// how the sky colour changes with sunrise / sunset, rain and lightning flashes
function skyTint(sky){ if(world.dim!=='over')return sky; const elev=Math.sin(dayTime*Math.PI*2), glow=clamp(1-Math.abs(elev)/0.28,0,1)*(1-rainLevel);
  let s=sky.map((v,i)=>v+([0.95,0.62,0.42][i]-v)*glow*0.32); const g=(s[0]+s[1]+s[2])/3*0.8; s=s.map(v=>v+(g-v)*rainLevel*0.75);
  if(flashT>0)s=s.map(v=>Math.min(1,v+flashT*2.4)); return s; }
function weatherSunMul(){ return world.dim==='over'?1-rainLevel*0.25-thunderLevel*0.3:1; }
