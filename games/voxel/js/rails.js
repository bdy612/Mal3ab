'use strict';
// =====================================================================
// RAILS & MINECARTS
// Rail shape lives in the block metadata: 0 north-south, 1 east-west,
// 2-5 ascending towards +x, -x, +z, -z, 6-9 curves. Rails reshape themselves
// to join their neighbours. Powered rails push carts when powered and brake
// them when not; detector rails give a redstone signal while a cart is on them.
// =====================================================================
const RAIL_CONN=[[4,5],[0,1],[0,1],[1,0],[4,5],[5,4],[0,4],[1,4],[1,5],[0,5]];   // for slopes the first entry is the uphill side
const ASCEND=[2,3,0,0,4,5];
function railNeighbor(w,x,y,z,d){ const dx=DIRV[d][0],dz=DIRV[d][2]; if(RAILS.has(w.getBlock(x+dx,y,z+dz)))return 0; if(RAILS.has(w.getBlock(x+dx,y+1,z+dz)))return 1; if(RAILS.has(w.getBlock(x+dx,y-1,z+dz)))return -1; return null; }
function railShapeFor(w,x,y,z,b){ const n={}; for(const d of HDIRS){ const r=railNeighbor(w,x,y,z,d); if(r!==null)n[d]=r; }
  const ds=Object.keys(n).map(Number), xs=ds.filter(d=>d<2), zs=ds.filter(d=>d>=4), cur=w.getMeta(x,y,z)&15;
  let a,c;
  if(!ds.length)return cur<=1?cur:0;
  if(ds.length===1){ a=ds[0]; c=OPP[a]; }
  else if(zs.length===2&&xs.length<2){ a=4; c=5; } else if(xs.length===2&&zs.length<2){ a=0; c=1; }
  else if(b===RAIL&&xs.length&&zs.length){ a=xs[0]; c=zs[0]; } else { a=ds[0]; c=OPP[a]; }
  if(OPP[a]===c){ if(n[a]===1)return ASCEND[a]; if(n[c]===1)return ASCEND[c]; return a<2?1:0; }
  const has=d=>a===d||c===d; return has(0)&&has(4)?6:has(1)&&has(4)?7:has(1)&&has(5)?8:9; }
function railLinks(w,x,y,z){ const sh=w.getMeta(x,y,z)&15,cs=RAIL_CONN[sh]||[],slope=sh>=2&&sh<=5; let k=0;
  for(const d of cs){ const r=railNeighbor(w,x,y,z,d); if(r===null)continue; if(slope&&d===cs[0]?r===1:r!==1)k++; } return k; }
const railFamily=b=>b===RAIL?1:b===POWERED_RAIL||b===POWERED_RAIL_ON?2:b===DETECTOR_RAIL||b===DETECTOR_RAIL_ON?3:0;
function reshapeRailsAround(w,x,y,z){ const cells=[[x,y,z]]; for(const d of HDIRS)for(const dy of [0,1,-1])cells.push([x+DIRV[d][0],y+dy,z+DIRV[d][2]]);
  for(const [cx,cy,cz] of cells){ const b=w.getBlock(cx,cy,cz); if(!RAILS.has(b))continue; if(!(cx===x&&cy===y&&cz===z)&&railLinks(w,cx,cy,cz)>=2)continue;
    const sh=railShapeFor(w,cx,cy,cz,b),m=w.getMeta(cx,cy,cz); if((m&15)!==sh)w.setBlock(cx,cy,cz,b,true,(m&~15)|sh); } }
// mesh: flat or sloped rail quad (curves use their own texture)
function railQuad(quad,x,y,z,b,meta,lt){ const sh=meta&15,y0=y+0.0625;
  if(sh>=2&&sh<=5){ const hd=[0,1,4,5][sh-2],pts=CUBE_FACES[3].map(p=>[x+p[0],y0+(hd===0?p[0]:hd===1?1-p[0]:hd===4?p[2]:1-p[2]),z+p[2]]); quad(pts,2,BLOCKS[b].tex[2],lt,0,hd<2?1:0,0); return; }
  const pts=CUBE_FACES[3].map(p=>[x+p[0],y0,z+p[2]]);
  if(sh>=6&&b===RAIL){ quad(pts,2,T.RAIL_CURVE,lt,0,{6:3,7:2,8:1,9:0}[sh],0); return; }
  quad(pts,2,BLOCKS[b].tex[2],lt,0,sh===1?1:0,0); }
// --- minecart physics: follow the rail path through cell centres ---
function railUnder(w,m){ let x=Math.floor(m.pos[0]),y=Math.floor(m.pos[1]+0.15),z=Math.floor(m.pos[2]); if(RAILS.has(w.getBlock(x,y,z)))return [x,y,z]; if(RAILS.has(w.getBlock(x,y-1,z)))return [x,y-1,z]; return null; }
function railY(w,x,y,z,px,pz){ const sh=w.getMeta(x,y,z)&15; if(sh<2||sh>5)return y; const fx=px-x,fz=pz-z; return y+(sh===2?fx:sh===3?1-fx:sh===4?fz:1-fz); }
function updateCart(world,m,dt){ const v=m.vel,ridden=player.riding===m; let cell=railUnder(world,m);
  // pushed by a player walking into it
  if(!ridden&&!player.spectator){ const dx=m.pos[0]-player.pos[0],dz=m.pos[2]-player.pos[2],d=Math.hypot(dx,dz); if(d<0.9&&Math.abs(m.pos[1]-player.pos[1])<1.3&&Math.hypot(player.vel[0],player.vel[2])>1){ const pd=Math.abs(player.vel[0])>Math.abs(player.vel[2])?(player.vel[0]>0?0:1):(player.vel[2]>0?4:5); if(!cell||RAIL_CONN[world.getMeta(...cell)&15].includes(pd)||RAIL_CONN[world.getMeta(...cell)&15].includes(OPP[pd])){ m.dir=pd; m.s=Math.max(m.s||0,3.5); } } }
  if(!cell){ // off the rails: slide and fall like a box
    if(m.s&&m.dir!==undefined&&!m.offRail){ v[0]=DIRV[m.dir][0]*m.s; v[2]=DIRV[m.dir][2]*m.s; m.offRail=true; }
    v[1]=Math.max(v[1]+GRAVITY*dt,-30); if(m.onGround){ const f=Math.pow(0.08,dt); v[0]*=f; v[2]*=f; } stepEntity(world,m,dt); m.s=0; return true; }
  m.offRail=false; v[1]=0;
  let [x,y,z]=cell,b=world.getBlock(x,y,z),sh=world.getMeta(x,y,z)&15,conns=RAIL_CONN[sh]; if(m.dir===undefined||!HDIRS.includes(m.dir))m.dir=conns[0];
  let s=m.s||0;
  if(ridden&&keys['KeyW']){ const f=forwardVec(); let best=-1,bd=-2; for(const d of conns){ const dd=DIRV[d][0]*f[0]+DIRV[d][2]*f[2]; if(dd>bd){bd=dd;best=d;} } if(best>=0){ if(best!==m.dir&&s<0.6)m.dir=best; if(best===m.dir)s=Math.min(8,s+4*dt); } }
  if(b===POWERED_RAIL_ON){ if(s<0.3){ s=1.5; if(!conns.includes(m.dir))m.dir=conns[0]; } s=Math.min(14,s+25*dt); } else if(b===POWERED_RAIL)s=Math.max(0,s-30*dt);
  if(sh>=2&&sh<=5){ s+=(m.dir===conns[0]?-1:1)*11*dt; if(s<0){ s=-s; m.dir=OPP[m.dir]; } }
  s*=Math.pow(0.85,dt); if(s<0.02)s=0; m.s=s;
  let remain=s*dt,guard=0;
  while(remain>1e-5&&guard++<6){ cell=railUnder(world,m); if(!cell){ v[0]=DIRV[m.dir][0]*s; v[2]=DIRV[m.dir][2]*s; m.offRail=true; break; }
    [x,y,z]=cell; sh=world.getMeta(x,y,z)&15; conns=RAIL_CONN[sh]; const cx=x+0.5,cz=z+0.5,D=DIRV[m.dir];
    const along=(m.pos[0]-cx)*D[0]+(m.pos[2]-cz)*D[2];
    if(!conns.includes(m.dir)&&!conns.includes(OPP[m.dir])){ m.pos[0]=cx; m.pos[2]=cz; m.dir=conns[0]; continue; }   // entered from a side: snap onto the rail
    if(along<-1e-4){ // heading towards the centre
      const step=Math.min(remain,-along); m.pos[0]+=D[0]*step; m.pos[2]+=D[2]*step; if(D[0])m.pos[2]=cz; else m.pos[0]=cx; remain-=step;
      if(step>=-along-1e-6){ const exit=conns.includes(OPP[m.dir])?conns.find(d=>d!==OPP[m.dir]):m.dir; if(exit!==m.dir){ m.pos[0]=cx; m.pos[2]=cz; m.dir=exit; } } }
    else { if(!conns.includes(m.dir)){ m.dir=conns.find(d=>d!==OPP[m.dir])??conns[0]; }
      const D2=DIRV[m.dir],a2=(m.pos[0]-cx)*D2[0]+(m.pos[2]-cz)*D2[2],step=Math.min(remain,0.5-a2+0.002); m.pos[0]+=D2[0]*step; m.pos[2]+=D2[2]*step; if(D2[0])m.pos[2]=cz; else m.pos[0]=cx; remain-=step;
      const nx=Math.floor(m.pos[0]),nz=Math.floor(m.pos[2]); if(nx!==x||nz!==z){ // moved into the next cell: is there a rail to continue on?
        const up=sh>=2&&sh<=5&&m.dir===conns[0]?1:0; let ny=y+up; if(!RAILS.has(world.getBlock(nx,ny,nz))&&RAILS.has(world.getBlock(nx,ny-1,nz)))ny--;
        if(!RAILS.has(world.getBlock(nx,ny,nz))){ if(SOLID[world.getBlock(nx,y+up,nz)]||SOLID[world.getBlock(nx,y+up+1,nz)]){ m.pos[0]-=D2[0]*0.01; m.pos[2]-=D2[2]*0.01; m.s=0; m.dir=OPP[m.dir]; break; } m.pos[1]=y+up; break; }
        m.pos[1]=ny; } }
    const c2=railUnder(world,m); if(c2)m.pos[1]=railY(world,c2[0],c2[1],c2[2],m.pos[0],m.pos[2])+0.0625; }
  const Dn=DIRV[m.dir]; v[0]=Dn[0]*m.s; v[2]=Dn[2]*m.s; if(m.s>0.05)m.yaw=Math.atan2(-Dn[0],-Dn[2]); m.onGround=true;
  // carts hit mobs in their way
  if(m.s>4)for(const o of world.mobs){ if(o===m||o.def.vehicle)continue; if(Math.abs(o.pos[0]-m.pos[0])<0.7&&Math.abs(o.pos[2]-m.pos[2])<0.7&&Math.abs(o.pos[1]-m.pos[1])<1){ hurtMob(world,o,Math.round(m.s/3),[Dn[0]*m.s,4,Dn[2]*m.s]); } }
  return true; }
function placeCart(h,hl){ const target=h&&RAILS.has(h.block)?[h.x,h.y,h.z]:h&&RAILS.has(world.getBlock(h.x+h.nx,h.y+h.ny,h.z+h.nz))?[h.x+h.nx,h.y+h.ny,h.z+h.nz]:null;
  if(!target){ showMsg('Place the minecart on a rail.'); return false; }
  const [x,y,z]=target,m=spawnMob(world,'minecart',x+0.5,y+0.0625,z+0.5),conns=RAIL_CONN[world.getMeta(x,y,z)&15],f=forwardVec(); m.pos[1]=railY(world,x,y,z,x+0.5,z+0.5)+0.0625;
  m.dir=conns.reduce((b,d)=>DIRV[d][0]*f[0]+DIRV[d][2]*f[2]>DIRV[b][0]*f[0]+DIRV[b][2]*f[2]?d:b,conns[0]); m.s=0; m.yaw=Math.atan2(-DIRV[m.dir][0],-DIRV[m.dir][2]); if(m.detached)net.requestSpawn(m); return true; }
// powered rails: on when powered, or when a powered neighbour rail within 8 blocks along the line is
function poweredRailState(w,x,y,z){ if(isPowered(x,y,z)||isPowered(x,y-1,z))return true; const sh=w.getMeta(x,y,z)&15;
  for(const d of RAIL_CONN[sh]||[]){ let px=x,py=y,pz=z; for(let i=0;i<8;i++){ px+=DIRV[d][0]; pz+=DIRV[d][2]; let b=w.getBlock(px,py,pz); if(!(b===POWERED_RAIL||b===POWERED_RAIL_ON)){ if([POWERED_RAIL,POWERED_RAIL_ON].includes(w.getBlock(px,py+1,pz)))py++; else if([POWERED_RAIL,POWERED_RAIL_ON].includes(w.getBlock(px,py-1,pz)))py--; else break; }
      if(isPowered(px,py,pz)||isPowered(px,py-1,pz))return true; } } return false; }
