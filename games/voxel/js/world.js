'use strict';
// ---------------------------------------------------------------------
// WORLD: chunks, block + metadata access, lighting, edits (one per dimension)
// ---------------------------------------------------------------------
class World{
  constructor(dim,seed){this.dim=dim;this.gen=dim==='over'?new OverGen(seed):dim==='nether'?new NetherGen(seed):new EndGen(seed);this.chunks=new Map();this.edits=new Map();this.tiles=new Map();
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
// MESHER: face culling + greedy meshing + AO + light, packed vertices
//   a.x: x(5) | y(8)<<5 | z(5)<<13 | normal(3)<<18 | ao(2)<<21 | layer(8)<<23
//   a.y: u(8) | v(8)<<8 | sky(4)<<16 | block light(4)<<20 | offset dir(3)<<24  (1/16 nudge for flat pieces)
// ---------------------------------------------------------------------
const CUBE_FACES=[[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]];
const UVS=[[0,1],[1,1],[1,0],[0,0]];
const DOOR_PANEL=[4,5,0,0,1,0];              // open door panel side for facing f (0:+x→+z, 1:-x→-z, 4:+z→-x, 5:-z→+x)
const REP_ROT={4:0,0:1,5:2,1:3};             // repeater UV rotation so its arrow points along its facing
function texFor(t,meta,nid){ const B=BLOCKS[t],dt=DIRTYPE[t]; if(!dt)return B.tex[nid]; const f=meta&7,F=B.ftex;
  if(dt===1){ if(nid===2)return F.top; if(nid===3)return F.bottom; return nid===f?F.front:F.side; }
  if(nid===f)return F.front; if(nid===OPP[f])return F.back; return F.side; }
function decalAttach(b,meta){ if(b===LEVER_OFF||b===LEVER_ON||b===BUTTON||b===BUTTON_ON)return meta&7; if(b===DOOR_B_O||b===DOOR_T_O)return DOOR_PANEL[meta&7]; return 3; }
const packV=(x,y,z,nid,a,layer)=>(x|y<<5|z<<13|nid<<18|a<<21|layer<<23)>>>0;
const packU=(u,v,lt,off)=>(u|v<<8|(lt&15)<<16|(lt>>4)<<20|off<<24)>>>0;
const DIMS3=[CX,CY,CZ];const maskBuf=new Int32Array(CY*CX);
function meshChunk(world,ch){
  const ox=ch.cx*CX,oz=ch.cz*CZ,B=ch.blocks,Lt=ch.light,Mt=ch.meta;
  const get=(x,y,z)=>{if(y<0||y>=CY)return AIR;if(x>=0&&x<CX&&z>=0&&z<CZ)return B[(y*CZ+z)*CX+x];return world.getBlock(ox+x,y,oz+z);};
  const getM=(x,y,z)=>{if(y<0||y>=CY)return 0;if(x>=0&&x<CX&&z>=0&&z<CZ)return Mt[(y*CZ+z)*CX+x];return world.getMeta(ox+x,y,oz+z);};
  const light=(x,y,z)=>{if(y>=CY)return 15;if(y<0)return 0;if(x>=0&&x<CX&&z>=0&&z<CZ)return Lt[(y*CZ+z)*CX+x];return world.getLight(ox+x,y,oz+z);};
  const opq=(x,y,z)=>TRANSPARENT[get(x,y,z)]?0:1;
  const cube=a=>a!==AIR&&!PLANT[a]&&!DECAL[a];
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
        const type=m&255,aoBits=(m>>8)&255,back=(m>>16)&1,lt=(m>>17)&255,vr=(m>>25)&7,nid=d*2+back,layer=texFor(type,vr,nid);
        const px=[x[0],x[1],x[2]];px[u]=i;px[v]=j;px[d]+=1; const dst=TRANSLUCENT[type]?out.wa:out.op,base=dst.n;const corners=[[0,0],[w,0],[w,h],[0,h]];
        for(let c=0;c<4;c++){const ci=corners[c][0],cj=corners[c][1];const vx=px[0]+eu[0]*ci+ev[0]*cj,vy=px[1]+eu[1]*ci+ev[1]*cj,vz=px[2]+eu[2]*ci+ev[2]*cj,a=(aoBits>>(c*2))&3;
          let tu,tv;if(d===0){tu=cj;tv=w-ci;}else if(d===1){tu=cj;tv=ci;}else{tu=ci;tv=h-cj;}
          dst.v.push(packV(vx,vy,vz,nid,a,layer),packU(tu,tv,lt,0));}
        if(back)dst.i.push(base,base+3,base+2,base,base+2,base+1);else dst.i.push(base,base+1,base+2,base,base+2,base+3); dst.n+=4;
        for(let l=0;l<h;l++)for(let k=0;k<w;k++)mask[n+k+l*DU]=0; i+=w;n+=w; } } }
  // plants (two crossed quads) and flat pieces (wire, levers, buttons, plates, repeaters, open doors)
  const op=out.op, quad=(pts,nid,layer,lt,off,rot)=>{ const base=op.n; for(let c=0;c<4;c++){const p=pts[c],uv=UVS[(c+rot)&3];op.v.push(packV(p[0],p[1],p[2],nid,3,layer),packU(uv[0],uv[1],lt,off));}
    op.i.push(base,base+1,base+2,base,base+2,base+3,base,base+2,base+1,base,base+3,base+2); op.n+=4; };
  for(let y=0;y<CY;y++)for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const i=(y*CZ+z)*CX+x,b=B[i]; if(!PLANT[b]&&!DECAL[b])continue; const lt=Lt[i],layer=BLOCKS[b].tex[2];
    if(PLANT[b]){ quad([[x,y,z],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z]],0,layer,lt,0,0); quad([[x+1,y,z],[x,y,z+1],[x,y+1,z+1],[x+1,y+1,z]],0,layer,lt,0,0); continue; }
    const meta=Mt[i],a=decalAttach(b,meta),f=CUBE_FACES[a],rot=(b===REPEATER_OFF||b===REPEATER_ON)?REP_ROT[meta&7]||0:0;
    quad(f.map(p=>[p[0]+x,p[1]+y,p[2]+z]),OPP[a],layer,lt,OPP[a]+1,rot); }
  return out;
}
