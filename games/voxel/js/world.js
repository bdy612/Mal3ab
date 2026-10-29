'use strict';
// ---------------------------------------------------------------------
// WORLD: chunks, block + metadata access, lighting, edits (one per dimension)
// ---------------------------------------------------------------------
class World{
  constructor(dim,seed,opts={}){this.dim=dim;this.opts=opts;this.gen=dim==='over'?new OverGen(seed,opts):dim==='nether'?new NetherGen(seed):new EndGen(seed);this.chunks=new Map();this.edits=new Map();this.tiles=new Map();
    this.mobs=[];this.items=[];this.orbs=[];this.arrows=[];this.falling=[];this.tnt=[];this.onChange=null;this.onChunk=null;this.onRecord=null;this.flags={};
    this.liq=[];this.liqSet=new Set();this.rsq=[];this.rsPending=new Set();this.grow=new Map();this.plates=new Map();this.timers=[];this.time=0;}
  key(cx,cz){return cx+','+cz;} getChunk(cx,cz){return this.chunks.get(cx+','+cz);}
  getBlock(x,y,z){if(y<0||y>=CY)return AIR;const c=this.chunks.get((x>>4)+','+(z>>4));if(!c||!c.generated)return AIR;return c.blocks[idx(x&15,y,z&15)];}
  getMeta(x,y,z){if(y<0||y>=CY)return 0;const c=this.chunks.get((x>>4)+','+(z>>4));if(!c||!c.generated)return 0;return c.meta[idx(x&15,y,z&15)];}
  loaded(x,z){const c=this.chunks.get((x>>4)+','+(z>>4));return !!(c&&c.generated);}
  getLight(x,y,z){if(y>=CY)return 15;if(y<0)return 0;const c=this.chunks.get((x>>4)+','+(z>>4));if(!c||!c.generated)return 15;return c.light[idx(x&15,y,z&15)];}
  getSky(x,y,z){return this.getLight(x,y,z)&15;} getBlk(x,y,z){return this.getLight(x,y,z)>>4;} getL(x,y,z,ch){const l=this.getLight(x,y,z);return ch===0?l&15:l>>4;}
  setL(x,y,z,ch,v){ if(y<0||y>=CY)return;const c=this.chunks.get((x>>4)+','+(z>>4));if(!c)return;const i=idx(x&15,y,z&15); c.light[i]=ch===0?(c.light[i]&0xF0)|v:(c.light[i]&0x0F)|(v<<4);c.dirty=true;
    const lx=x&15,lz=z&15; if(lx===0){const n=this.getChunk(c.cx-1,c.cz);if(n)n.dirty=true;}if(lx===15){const n=this.getChunk(c.cx+1,c.cz);if(n)n.dirty=true;} if(lz===0){const n=this.getChunk(c.cx,c.cz-1);if(n)n.dirty=true;}if(lz===15){const n=this.getChunk(c.cx,c.cz+1);if(n)n.dirty=true;} }
  propagate(q,ch){
    while(q.length){ const [x,y,z]=q.pop();const l=this.getL(x,y,z,ch);if(l<=1)continue;
      for(const [dx,dy,dz] of DIRV){ const nx=x+dx,ny=y+dy,nz=z+dz;if(ny<0||ny>=CY)continue;const nc=this.chunks.get((nx>>4)+','+(nz>>4));if(!nc||!nc.generated)continue;
        const nb=nc.blocks[idx(nx&15,ny,nz&15)];if(!LIGHT_PASS[nb])continue; const nl=(ch===0&&dy===-1&&l===15&&LIQ[nb]!==1)?15:l-1;
        if(this.getL(nx,ny,nz,ch)<nl){this.setL(nx,ny,nz,ch,nl);q.push([nx,ny,nz]);} } } }
  removeLight(x,y,z,ch){ const v0=this.getL(x,y,z,ch);if(v0===0)return;this.setL(x,y,z,ch,0);const q=[[x,y,z,v0]],src=[];
    while(q.length){const [cx,cy,cz,v]=q.pop();for(const [dx,dy,dz] of DIRV){const nx=cx+dx,ny=cy+dy,nz=cz+dz;if(ny<0||ny>=CY)continue;const n=this.getL(nx,ny,nz,ch);if(n===0)continue;
      if(n<v||(ch===0&&dy===-1&&n===15&&v===15)){this.setL(nx,ny,nz,ch,0);q.push([nx,ny,nz,n]);}else src.push([nx,ny,nz]);}} this.propagate(src,ch); }
  lightChunk(c){ const ox=c.cx*CX,oz=c.cz*CZ,B=c.blocks,Lt=c.light;const qs=[],qb=[];
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){let l=15;for(let y=CY-1;y>=0;y--){const i=idx(x,y,z),b=B[i];if(LIGHT_PASS[b]){if(l<15||LIQ[b]===1)l=Math.max(0,l-1);}else l=0;Lt[i]=l|(EMIT[b]<<4);if(EMIT[b])qb.push([ox+x,y,oz+z]);}}
    for(let y=0;y<CY;y++)for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){const l=Lt[idx(x,y,z)]&15;if(l<2)continue;
      if((x>0&&(Lt[idx(x-1,y,z)]&15)<l-1)||(x<15&&(Lt[idx(x+1,y,z)]&15)<l-1)||(z>0&&(Lt[idx(x,y,z-1)]&15)<l-1)||(z<15&&(Lt[idx(x,y,z+1)]&15)<l-1)||(y>0&&(Lt[idx(x,y-1,z)]&15)<l-1)||x===0||x===15||z===0||z===15)qs.push([ox+x,y,oz+z]);}
    for(let y=0;y<CY;y++)for(let i=0;i<16;i++)for(const [nx,nz] of [[ox-1,oz+i],[ox+16,oz+i],[ox+i,oz-1],[ox+i,oz+16]]){const nc=this.chunks.get((nx>>4)+','+(nz>>4));if(!nc)continue;const l=nc.light[idx(nx&15,y,nz&15)];if((l&15)>1)qs.push([nx,y,nz]);if((l>>4)>1)qb.push([nx,y,nz]);}
    this.propagate(qs,0);this.propagate(qb,1); }
  createChunk(cx,cz){const c=new Chunk(cx,cz);this.gen.generate(c);const e=this.edits.get(this.key(cx,cz));if(e){for(const [i,v] of e){c.blocks[i]=v&255;c.meta[i]=v>>8;}}
    this.chunks.set(this.key(cx,cz),c);this.lightChunk(c);if(this.onChunk)this.onChunk(c);return c;}
  // set a block (and its metadata). record=false for changes that should not be saved (none currently)
  setBlock(x,y,z,id,record=true,meta=0){
    if(y<0||y>=CY)return false;const cx=x>>4,cz=z>>4,c=this.getChunk(cx,cz);if(!c||!c.generated)return false;
    const lx=x&15,lz=z&15,i=idx(lx,y,lz),old=c.blocks[i],oldMeta=c.meta[i];if(old===id&&oldMeta===meta)return false; c.blocks[i]=id;c.meta[i]=meta;c.dirty=true;
    if(record){const k=this.key(cx,cz);if(!this.edits.has(k))this.edits.set(k,new Map());this.edits.get(k).set(i,id|meta<<8); if(this.onRecord)this.onRecord(x,y,z,id|meta<<8);}
    const dxs=[0],dzs=[0];if(lx===0)dxs.push(-1);if(lx===15)dxs.push(1);if(lz===0)dzs.push(-1);if(lz===15)dzs.push(1);
    for(const dx of dxs)for(const dz of dzs){if(dx||dz){const n=this.getChunk(cx+dx,cz+dz);if(n)n.dirty=true;}}
    if(old!==id){
      if(EMIT[old])this.removeLight(x,y,z,1);
      if(!LIGHT_PASS[id]){this.removeLight(x,y,z,0);if(!EMIT[id])this.removeLight(x,y,z,1);}
      else if(!LIGHT_PASS[old]){ const above=this.getSky(x,y+1,z),ab=this.getBlock(x,y+1,z);
        if(y===CY-1||(above===15&&LIQ[ab]!==1)){let yy=y;const q=[];while(yy>=0&&LIGHT_PASS[this.getBlock(x,yy,z)]&&LIQ[this.getBlock(x,yy,z)]!==1){this.setL(x,yy,z,0,15);q.push([x,yy,z]);yy--;}this.propagate(q,0);}
        this.propagate(DIRV.map(d=>[x+d[0],y+d[1],z+d[2]]),0);this.propagate(DIRV.map(d=>[x+d[0],y+d[1],z+d[2]]),1); }
      if(EMIT[id]){this.setL(x,y,z,1,EMIT[id]);this.propagate([[x,y,z]],1);}
    }
    if(this.onChange)this.onChange(x,y,z,old,id,oldMeta);
    return true;
  }
}

// ---------------------------------------------------------------------
// MESHER: face culling + greedy meshing + AO + light, packed vertices (3 uints)
//   a.x: x(9) | y(12)<<9 | z(9)<<21          positions in 1/16 block
//   a.y: u(12) | v(12)<<12 | sky(4)<<24 | block light(4)<<28     uv in 1/16 block
//   a.z: normal(3) | ao(2)<<3 | layer(9)<<5 | offset dir(3)<<14 | tint(5)<<17
// Full cubes are greedy-merged; liquids get lowered surfaces; shaped blocks
// (slabs, stairs, fences, panes, gates, cactus, carpets) are built from boxes.
// ---------------------------------------------------------------------
const CUBE_FACES=[[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]];
const UVS=[[0,1],[1,1],[1,0],[0,0]];
const FACE_UV=[(x,y,z)=>[1-z,1-y],(x,y,z)=>[z,1-y],(x,y,z)=>[x,z],(x,y,z)=>[x,1-z],(x,y,z)=>[x,1-y],(x,y,z)=>[1-x,1-y]];
const DOOR_PANEL=[4,5,0,0,1,0];              // open door panel side for facing f (0:+x→+z, 1:-x→-z, 4:+z→-x, 5:-z→+x)
const REP_ROT={4:0,0:1,5:2,1:3};             // repeater UV rotation so its arrow points along its facing
function texFor(t,meta,nid){ const B=BLOCKS[t],dt=DIRTYPE[t]; if(!dt)return B.tex[nid]; const f=meta&7,F=B.ftex;
  if(dt===1){ if(nid===2)return F.top; if(nid===3)return F.bottom; return nid===f?F.front:F.side; }
  if(nid===f)return F.front; if(nid===OPP[f])return F.back; return F.side; }
function decalAttach(b,meta){ if(b===LEVER_OFF||b===LEVER_ON||b===BUTTON||b===BUTTON_ON||b===LADDER||b===VINE)return meta&7; if(b===DOOR_B_O||b===DOOR_T_O)return DOOR_PANEL[meta&7]; return 3; }
function pushV(arr,x,y,z,nid,ao,layer,u,v,lt,off,tint){
  arr.push((Math.round(x*16)|Math.round(y*16)<<9|Math.round(z*16)<<21)>>>0,(Math.round(u*16)|Math.round(v*16)<<12|(lt&15)<<24|((lt>>4)&15)<<28)>>>0,(nid|ao<<3|layer<<5|off<<14|tint<<17)>>>0); }
// shapes: boxes in 1/16 units; nb(dir) gives the neighbour block for fences / panes
const fenceLink=n=>n===FENCE||n===FENCE_GATE||(SOLID[n]&&!TRANSPARENT[n]&&!LIQ[n]);
const paneLink=n=>n===GLASS_PANE||n===GLASS||(SOLID[n]&&!TRANSPARENT[n]&&!LIQ[n]);
function shapeBoxes(b,m,nb,coll){ const s=SHAPE[b];
  if(s===1)return m&8?[[0,8,0,16,16,16]]:[[0,0,0,16,8,16]];
  if(s===2){ const up=m&8,f=m&7,y0=up?0:8,y1=up?8:16; return [up?[0,8,0,16,16,16]:[0,0,0,16,8,16], f===0?[8,y0,0,16,y1,16]:f===1?[0,y0,0,8,y1,16]:f===4?[0,y0,8,16,y1,16]:[0,y0,0,16,y1,8]]; }
  if(s===3){ const out=[coll?[6,0,6,10,24,10]:[6,0,6,10,16,10]];
    for(const d of HDIRS){ if(!fenceLink(nb(d)))continue; const [x0,x1,z0,z1]=d===0?[10,16,7,9]:d===1?[0,6,7,9]:d===4?[7,9,10,16]:[7,9,0,6];
      if(coll)out.push(d<2?[x0,0,6,x1,24,10]:[6,0,z0,10,24,z1]); else out.push([x0,6,z0,x1,9,z1],[x0,12,z0,x1,15,z1]); } return out; }
  if(s===4){ const out=[[7,0,7,9,16,9]]; for(const d of HDIRS)if(paneLink(nb(d)))out.push(d===0?[9,0,7,16,16,9]:d===1?[0,0,7,7,16,9]:d===4?[7,0,9,9,16,16]:[7,0,0,9,16,7]); return out; }
  if(s===5){ const ax=m&1,open=m&4; if(coll)return open?[]:[ax?[6,0,0,10,24,16]:[0,0,6,16,24,10]];
    const P=ax?[[7,5,0,9,16,2],[7,5,14,9,16,16]]:[[0,5,7,2,16,9],[14,5,7,16,16,9]];
    if(!open)return P.concat(ax?[[7,6,2,9,9,14],[7,12,2,9,15,14]]:[[2,6,7,14,9,9],[2,12,7,14,15,9]]);
    return P.concat(ax?[[9,6,0,15,9,2],[9,12,0,15,15,2],[9,6,14,15,9,16],[9,12,14,15,15,16]]:[[0,6,9,2,9,15],[0,12,9,2,15,15],[14,6,9,16,9,15],[14,12,9,16,15,15]]); }
  if(s===6)return coll?[[1,0,1,15,15,15]]:[[1,0,1,15,16,15]];
  if(s===7)return [[0,0,0,16,1,16]];
  if(s===9){ const f=m&7,sp=f===3?[6,0,6,10,4,10]:f===0?[12,4,6,16,8,10]:f===1?[0,4,6,4,8,10]:f===4?[6,4,12,10,8,16]:[6,4,0,10,8,4]; return [[0,10,0,16,16,16],[4,4,4,12,10,12],sp]; }
  if(s===8)return coll?[[6,0,6,10,16,10]]:[[7,0,7,9,13,9],[6,13,6,10,16,10]];
  return [[0,0,0,16,16,16]]; }
function liquidHeight(b,m,above){ if(LIQ[above]===LIQ[b])return 16; if(b===WATER||b===LAVA||(m&8))return 14; return Math.max(2,14-(m&7)*2); }
function emitBox(dst,x,y,z,bx,layers,tint,lightFn,cullFn){ const b=bx.map(v=>v/16);
  for(let f=0;f<6;f++){ if(cullFn&&cullFn(f,bx))continue; const base=dst.n,lt=lightFn?lightFn(f,bx):0xF0;
    for(let c=0;c<4;c++){ const p=CUBE_FACES[f][c],px=p[0]?b[3]:b[0],py=p[1]?b[4]:b[1],pz=p[2]?b[5]:b[2],uv=FACE_UV[f](px,py,pz);
      pushV(dst.v,x+px,y+py,z+pz,f,3,layers[f],uv[0],uv[1],lt,0,tint); }
    dst.i.push(base,base+1,base+2,base,base+2,base+3); dst.n+=4; } }
const ONEDGE=[bx=>bx[3]===16,bx=>bx[0]===0,bx=>bx[4]===16,bx=>bx[1]===0,bx=>bx[5]===16,bx=>bx[2]===0];
const DIMS3=[CX,CY,CZ];const maskBuf=new Int32Array(CY*CX);
function meshChunk(world,ch){
  const ox=ch.cx*CX,oz=ch.cz*CZ,B=ch.blocks,Lt=ch.light,Mt=ch.meta;
  const get=(x,y,z)=>{if(y<0||y>=CY)return AIR;if(x>=0&&x<CX&&z>=0&&z<CZ)return B[(y*CZ+z)*CX+x];return world.getBlock(ox+x,y,oz+z);};
  const getM=(x,y,z)=>{if(y<0||y>=CY)return 0;if(x>=0&&x<CX&&z>=0&&z<CZ)return Mt[(y*CZ+z)*CX+x];return world.getMeta(ox+x,y,oz+z);};
  const light=(x,y,z)=>{if(y>=CY)return 15;if(y<0)return 0;if(x>=0&&x<CX&&z>=0&&z<CZ)return Lt[(y*CZ+z)*CX+x];return world.getLight(ox+x,y,oz+z);};
  const opq=(x,y,z)=>TRANSPARENT[get(x,y,z)]?0:1;
  const cube=a=>a!==AIR&&!PLANT[a]&&!DECAL[a]&&!LIQ[a]&&!SHAPE[a];
  const faceVisible=(a,b)=>TRANSPARENT[b]&&a!==b&&!(LIQ[a]&&LIQ[a]===LIQ[b]);
  const ao=(px,py,pz,nx,ny,nz,ux,uy,uz,vx,vy,vz)=>{const bx=px+nx,by=py+ny,bz=pz+nz;const s1=opq(bx+ux,by+uy,bz+uz),s2=opq(bx+vx,by+vy,bz+vz);if(s1&&s2)return 0;return 3-(s1+s2+opq(bx+ux+vx,by+uy+vy,bz+uz+vz));};
  const out={op:{v:[],i:[],n:0},wa:{v:[],i:[],n:0}}; const x=[0,0,0],q=[0,0,0],eu=[0,0,0],ev=[0,0,0];
  for(let d=0;d<3;d++){ const u=(d+1)%3,v=(d+2)%3;q[0]=q[1]=q[2]=0;q[d]=1;eu[0]=eu[1]=eu[2]=0;eu[u]=1;ev[0]=ev[1]=ev[2]=0;ev[v]=1; const DU=DIMS3[u],DV=DIMS3[v],mask=maskBuf;
    for(x[d]=-1;x[d]<DIMS3[d];x[d]++){ let n=0;
      for(x[v]=0;x[v]<DV;x[v]++)for(x[u]=0;x[u]<DU;x[u]++,n++){ const a=get(x[0],x[1],x[2]),b=get(x[0]+q[0],x[1]+q[1],x[2]+q[2]);let m=0;
        if(x[d]>=0&&cube(a)&&faceVisible(a,b)){
          const c00=ao(x[0],x[1],x[2],q[0],q[1],q[2],-eu[0],-eu[1],-eu[2],-ev[0],-ev[1],-ev[2]),c10=ao(x[0],x[1],x[2],q[0],q[1],q[2],eu[0],eu[1],eu[2],-ev[0],-ev[1],-ev[2]);
          const c11=ao(x[0],x[1],x[2],q[0],q[1],q[2],eu[0],eu[1],eu[2],ev[0],ev[1],ev[2]),c01=ao(x[0],x[1],x[2],q[0],q[1],q[2],-eu[0],-eu[1],-eu[2],ev[0],ev[1],ev[2]);
          const vr=DIRTYPE[a]?getM(x[0],x[1],x[2])&7:0;
          m=a|(c00|c10<<2|c11<<4|c01<<6)<<8|light(x[0]+q[0],x[1]+q[1],x[2]+q[2])<<17|vr<<25;
        }else if(x[d]<DIMS3[d]-1&&cube(b)&&faceVisible(b,a)){ const px=x[0]+q[0],py=x[1]+q[1],pz=x[2]+q[2];
          const c00=ao(px,py,pz,-q[0],-q[1],-q[2],-eu[0],-eu[1],-eu[2],-ev[0],-ev[1],-ev[2]),c10=ao(px,py,pz,-q[0],-q[1],-q[2],eu[0],eu[1],eu[2],-ev[0],-ev[1],-ev[2]);
          const c11=ao(px,py,pz,-q[0],-q[1],-q[2],eu[0],eu[1],eu[2],ev[0],ev[1],ev[2]),c01=ao(px,py,pz,-q[0],-q[1],-q[2],-eu[0],-eu[1],-eu[2],ev[0],ev[1],ev[2]);
          const vr=DIRTYPE[b]?getM(px,py,pz)&7:0;
          m=b|(c00|c10<<2|c11<<4|c01<<6)<<8|1<<16|light(x[0],x[1],x[2])<<17|vr<<25; }
        mask[n]=m; }
      n=0;
      for(let j=0;j<DV;j++)for(let i=0;i<DU;){ const m=mask[n];if(!m){i++;n++;continue;}
        let w=1;while(i+w<DU&&mask[n+w]===m)w++; let h=1;outer:for(;j+h<DV;h++){for(let k=0;k<w;k++)if(mask[n+k+h*DU]!==m)break outer;}
        const type=m&255,aoBits=(m>>8)&255,back=(m>>16)&1,lt=(m>>17)&255,vr=(m>>25)&7,nid=d*2+back,layer=texFor(type,vr,nid),tint=TINT[type];
        const px=[x[0],x[1],x[2]];px[u]=i;px[v]=j;px[d]+=1; const dst=TRANSLUCENT[type]?out.wa:out.op,base=dst.n;const corners=[[0,0],[w,0],[w,h],[0,h]];
        for(let c=0;c<4;c++){const ci=corners[c][0],cj=corners[c][1];const vx=px[0]+eu[0]*ci+ev[0]*cj,vy=px[1]+eu[1]*ci+ev[1]*cj,vz=px[2]+eu[2]*ci+ev[2]*cj,a=(aoBits>>(c*2))&3;
          let tu,tv;if(d===0){tu=cj;tv=w-ci;}else if(d===1){tu=cj;tv=ci;}else{tu=ci;tv=h-cj;}
          pushV(dst.v,vx,vy,vz,nid,a,layer,tu,tv,lt,0,tint);}
        if(back)dst.i.push(base,base+3,base+2,base,base+2,base+1);else dst.i.push(base,base+1,base+2,base,base+2,base+3); dst.n+=4;
        for(let l=0;l<h;l++)for(let k=0;k<w;k++)mask[n+k+l*DU]=0; i+=w;n+=w; } } }
  // plants (two crossed quads), flat pieces (wire, levers, buttons, plates, repeaters, ladders, open doors), liquids and shaped blocks
  const op=out.op, quad=(pts,nid,layer,lt,off,rot,tint)=>{ const base=op.n; for(let c=0;c<4;c++){const p=pts[c],uv=UVS[(c+rot)&3];pushV(op.v,p[0],p[1],p[2],nid,3,layer,uv[0],uv[1],lt,off,tint);}
    op.i.push(base,base+1,base+2,base,base+2,base+3,base,base+2,base+1,base,base+3,base+2); op.n+=4; };
  for(let y=0;y<CY;y++)for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const i=(y*CZ+z)*CX+x,b=B[i]; if(!PLANT[b]&&!DECAL[b]&&!LIQ[b]&&!SHAPE[b])continue; const lt=Lt[i],layer=BLOCKS[b].tex[2];
    if(PLANT[b]){ quad([[x,y,z],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z]],0,layer,lt,0,0,TINT[b]); quad([[x+1,y,z],[x,y,z+1],[x,y+1,z+1],[x+1,y+1,z]],0,layer,lt,0,0,TINT[b]); continue; }
    if(DECAL[b]&&RAILS.has(b)){ railQuad(quad,x,y,z,b,Mt[i],lt); continue; }
    if(DECAL[b]){ const meta=Mt[i],a=decalAttach(b,meta),f=CUBE_FACES[a],rot=(b===REPEATER_OFF||b===REPEATER_ON)?REP_ROT[meta&7]||0:0;
      quad(f.map(p=>[p[0]+x,p[1]+y,p[2]+z]),OPP[a],layer,lt,OPP[a]+1,rot,TINT[b]); continue; }
    const meta=Mt[i], nb=dd=>get(x+DIRV[dd][0],y+DIRV[dd][1],z+DIRV[dd][2]);
    if(LIQ[b]){ const h=liquidHeight(b,meta,get(x,y+1,z)),layers=BLOCKS[b].tex,dst=TRANSLUCENT[b]?out.wa:op;
      for(let f=0;f<6;f++){ const dv=DIRV[f],n=nb(f); let lo=0;
        if(f===2){ if(LIQ[n]===LIQ[b]||(h>=16&&!faceVisible(b,n)))continue; }
        else if(LIQ[n]===LIQ[b]){ if(f===3)continue; lo=liquidHeight(n,getM(x+dv[0],y,z+dv[2]),get(x+dv[0],y+1,z+dv[2])); if(lo>=h)continue; }   // step down to a lower neighbour
        else if(!faceVisible(b,n))continue;
        const lt2=light(x+dv[0],y+dv[1],z+dv[2]); emitBox(dst,x,y,z,[0,lo,0,16,h,16],layers,TINT[b],()=>lt2,ff=>ff!==f); }
      continue; }
    const layers=[0,1,2,3,4,5].map(f=>texFor(b,meta,f)),dst=TRANSLUCENT[b]?out.wa:op;
    for(const bx of shapeBoxes(b,meta,nb,false))
      emitBox(dst,x,y,z,bx,layers,TINT[b],(f,bb)=>{ if(ONEDGE[f](bb)){const dv=DIRV[f];return light(x+dv[0],y+dv[1],z+dv[2]);} return lt; },
        (f,bb)=>{ if(!ONEDGE[f](bb))return false; const n=nb(f); return cube(n)&&!TRANSPARENT[n]; }); }
  return out;
}
