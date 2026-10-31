'use strict';
// =====================================================================
// SYSTEMS: block-change hub, liquids, redstone, crop growth, plates/buttons
// =====================================================================
let pistonBusy=false;
function popBlock(x,y,z){ const b=world.getBlock(x,y,z); if(b===AIR)return; dropBlockLoot(b,x,y,z); world.setBlock(x,y,z,AIR); }
// side effects run with blockFx raised, so a guest in a shared world leaves the resulting drops to the host
function onBlockChange(x,y,z,old,id,oldMeta){ blockFx++; try{ blockSideEffects(x,y,z,old,id,oldMeta); } finally { blockFx--; } }
function blockSideEffects(x,y,z,old,id,oldMeta){
  const w=world,k=tkey(x,y,z);
  // tile entities lose their contents when their block goes away
  if(TILEBLK[old]&&old!==id&&!((old===FURNACE||old===FURNACE_LIT)&&(id===FURNACE||id===FURNACE_LIT))){ const t=w.tiles.get(k); if(t){
    const stacks=t.type==='chest'?t.slots:t.type==='furnace'?[t.inp,t.fuel,t.out]:t.type==='brew'?t.bottles.concat([t.ing,t.fuel]):[];
    for(const s of (t.slots&&t.type!=='chest'?t.slots:[]))if(s.count)spawnItem(x+0.5,y+0.5,z+0.5,s.id,s.count,s.dur,null,s.ench);
    for(const s of stacks)if(s.count)spawnItem(x+0.5,y+0.5,z+0.5,s.id,s.count,s.dur,null,s.ench); w.tiles.delete(k); if(uiOpen&&(ui.tile===t||ui.tile2===t))closeUI(true); } }
  // two-block structures: door halves, piston body + head
  if(isDoor(old)&&!isDoor(id)&&!doorBusy){ const py=(old===DOOR_B||old===DOOR_B_O)?y+1:y-1; if(isDoor(w.getBlock(x,py,z))){doorBusy=true;w.setBlock(x,py,z,AIR);doorBusy=false;} }
  if(!pistonBusy&&old!==id){
    if(PISTON_HEADS.has(old)){ const d=DIRV[oldMeta&7],bb=w.getBlock(x-d[0],y-d[1],z-d[2]); if(bb===PISTON_EXT||bb===STICKY_EXT){pistonBusy=true;w.setBlock(x-d[0],y-d[1],z-d[2],AIR);pistonBusy=false;} }
    if(old===PISTON_EXT||old===STICKY_EXT){ const d=DIRV[oldMeta&7]; if(PISTON_HEADS.has(w.getBlock(x+d[0],y+d[1],z+d[2]))){pistonBusy=true;w.setBlock(x+d[0],y+d[1],z+d[2],AIR);pistonBusy=false;} }
  }
  // neighbours that need support (torches, plants, wire, levers, doors...) pop off
  if(old!==id) for(const d of DIRV){ const nx=x+d[0],ny=y+d[1],nz=z+d[2],nb=w.getBlock(nx,ny,nz); if(SUPPORT[nb]&&!canStay(nb,w.getMeta(nx,ny,nz),nx,ny,nz))popBlock(nx,ny,nz); }
  // gravity blocks
  if(!SOLID[id]){ const ab=w.getBlock(x,y+1,z); if((ab===SAND||ab===GRAVEL)&&!net.guest)startFall(x,y+1,z); }
  if((id===SAND||id===GRAVEL)&&!SOLID[w.getBlock(x,y-1,z)]&&!net.guest)startFall(x,y,z);
  // broken portal frames collapse
  if((old===PORTAL||old===OBSIDIAN)&&id!==PORTAL&&id!==OBSIDIAN){ for(const d of DIRV)if(w.getBlock(x+d[0],y+d[1],z+d[2])===PORTAL)w.setBlock(x+d[0],y+d[1],z+d[2],AIR); }
  if(old===END_CRYSTAL&&id!==END_CRYSTAL)explodeAt(x,y,z,2,false);
  // bookkeeping for growth and pressure plates
  if(GROW[id])w.grow.set(k,[x,y,z]); else w.grow.delete(k);
  if(railFamily(old)!==railFamily(id)&&!net.guest)reshapeRailsAround(w,x,y,z);
  observersSee(w,x,y,z);
  if((id===HOPPER||id===DROPPER||id===DISPENSER)&&old!==id&&!net.guest){ const prev=world; world=w; getTile(x,y,z,id); world=prev; }
  if((id===DETECTOR_RAIL||id===DETECTOR_RAIL_ON))w.plates.set(k,[x,y,z,-9]);
  if(id===LIGHTNING_ROD)(w.rods||(w.rods=new Map())).set(k,[x,y,z]);
  if(id===PLATE||id===PLATE_ON){ if(!w.plates.has(k))w.plates.set(k,[x,y,z,-9]); } else w.plates.delete(k);
  scheduleLiquidAround(x,y,z);
  rsNotify(x,y,z);
}
// scan a freshly generated chunk: loot chests, spawners, villagers, growables, plates
function onChunkCreated(c){
  const ox=c.cx*CX,oz=c.cz*CZ,w=world;
  if(c.lootChests)for(const [x,y,z,table] of c.lootChests){ const k=tkey(ox+x,y,oz+z); if(!w.tiles.has(k)&&c.blocks[idx(x,y,z)]===CHEST){ const t=getTile(ox+x,y,oz+z,CHEST); fillLoot(t,table); } }
  if(c.trials)for(const [x,y,z,mob] of c.trials){ const k=tkey(ox+x,y,oz+z); if(!w.tiles.has(k)&&c.blocks[idx(x,y,z)]===TRIAL_SPAWNER)w.tiles.set(k,{type:'trial',mob,state:'idle',spawned:0,total:0,cool:0,t:0}); }
  if(c.spawners)for(const [x,y,z,mob] of c.spawners){ const k=tkey(ox+x,y,oz+z); if(!w.tiles.has(k)&&c.blocks[idx(x,y,z)]===SPAWNER)w.tiles.set(k,{type:'spawner',mob,t:rand(2,5)}); }
  if(c.house){ const [x,y,z]=c.house; if(!w.mobs.some(m=>m.type==='villager'&&Math.abs(m.pos[0]-(ox+x+3))<24&&Math.abs(m.pos[2]-(oz+z-2))<24)){ spawnMob(w,'villager',ox+x+3.5,y+1,oz+z-1.5); if(hash3(c.cx,c.cz,99)<0.5)spawnMob(w,'villager',ox+x+5.5,y+1,oz+z-2.5); } }
  const B=c.blocks; for(let i=0;i<B.length;i++){ const b=B[i]; if(!GROW[b]&&b!==PLATE&&b!==PLATE_ON&&b!==LIGHTNING_ROD&&b!==DETECTOR_RAIL&&b!==DETECTOR_RAIL_ON)continue; const x=ox+(i&15),z=oz+((i>>4)&15),y=i>>8, k=tkey(x,y,z);
    if(b===LIGHTNING_ROD)(w.rods||(w.rods=new Map())).set(k,[x,y,z]); else if(GROW[b])w.grow.set(k,[x,y,z]); else w.plates.set(k,[x,y,z,-9]); }
}

// ---------------------------------------------------------------------
// LIQUIDS: water spreads 7 blocks, lava 3 (6 in the Nether); two water sources make a new source
// ---------------------------------------------------------------------
function scheduleLiquid(x,y,z){ const w=world,b=w.getBlock(x,y,z); if(!LIQ[b])return; const k=tkey(x,y,z); if(w.liqSet.has(k))return; w.liqSet.add(k);
  w.liq.push([x,y,z,w.time+(LIQ[b]===2?(w.dim==='nether'?0.4:1.2):0.25)]); }
function scheduleLiquidAround(x,y,z){ scheduleLiquid(x,y,z); for(const d of DIRV)scheduleLiquid(x+d[0],y+d[1],z+d[2]); }
const canEnter=b=>b===AIR||(WASHABLE[b]&&!LIQ[b]);
function liquidLevel(b,m,src){ return b===src?0:(m&8?0:m&7); }
function fillLiquid(x,y,z,fam,meta){ const b=world.getBlock(x,y,z); if(b!==AIR&&WASHABLE[b])dropBlockLoot(b,x,y,z); world.setBlock(x,y,z,fam===1?FLOW_WATER:FLOW_LAVA,true,meta); }
function liquidTick(x,y,z){ const w=world,b=w.getBlock(x,y,z),fam=LIQ[b]; if(!fam)return;
  const src=fam===1?WATER:LAVA, flow=fam===1?FLOW_WATER:FLOW_LAVA, maxL=fam===1?7:(w.dim==='nether'?6:3);
  if(fam===2){ for(const i of [0,1,2,4,5]){ const d=DIRV[i]; if(isWater(w.getBlock(x+d[0],y+d[1],z+d[2]))){ w.setBlock(x,y,z,b===LAVA?OBSIDIAN:COBBLE); sfx.hiss(); return; } } }
  const meta=w.getMeta(x,y,z); let level=liquidLevel(b,meta,src);
  if(b===flow){
    let exp=99,falling=false,srcN=0; if(LIQ[w.getBlock(x,y+1,z)]===fam){exp=0;falling=true;}
    for(const hd of HDIRS){ const d=DIRV[hd],nx=x+d[0],nz=z+d[2],nb=w.getBlock(nx,y,nz); if(LIQ[nb]!==fam)continue; if(nb===src)srcN++;
      const nm=w.getMeta(nx,y,nz); if(nb!==src&&(nm&8)){ const nbl=w.getBlock(nx,y-1,nz); if(canEnter(nbl)||LIQ[nbl]===fam)continue; }
      exp=Math.min(exp,liquidLevel(nb,nm,src)+1); }
    if(fam===1&&srcN>=2){ const bl=w.getBlock(x,y-1,z); if(SOLID[bl]||bl===WATER){ w.setBlock(x,y,z,WATER); return; } }
    if(exp>maxL){ w.setBlock(x,y,z,AIR); return; }
    const nmeta=falling?8:exp; if(nmeta!==meta){ w.setBlock(x,y,z,flow,true,nmeta); return; }
    level=falling?0:exp;
  }
  if(y<=0)return;
  const bl=w.getBlock(x,y-1,z);
  if(canEnter(bl)){ fillLiquid(x,y-1,z,fam,8); if(b!==src)return; }
  else if(LIQ[bl]&&LIQ[bl]!==fam){ w.setBlock(x,y-1,z,fam===1?(bl===LAVA?OBSIDIAN:COBBLE):STONE); sfx.hiss(); return; }
  else if(LIQ[bl]===fam){ if(bl!==src&&!(w.getMeta(x,y-1,z)&8))fillLiquid(x,y-1,z,fam,8); if(b!==src)return; }
  if(level+1>maxL)return;
  for(const hd of HDIRS){ const d=DIRV[hd],nx=x+d[0],nz=z+d[2],nb=w.getBlock(nx,y,nz);
    if(LIQ[nb]&&LIQ[nb]!==fam){ if(fam===1){w.setBlock(nx,y,nz,nb===LAVA?OBSIDIAN:COBBLE);sfx.hiss();} continue; }
    if(canEnter(nb))fillLiquid(nx,y,nz,fam,level+1);
    else if(nb===flow){ const nm=w.getMeta(nx,y,nz); if(!(nm&8)&&(nm&7)>level+1)fillLiquid(nx,y,nz,fam,level+1); } }
}
function updateLiquids(w){ if(net.guest)return; let n=0;
  for(let round=0;round<4&&n<600;round++){ const q=w.liq; w.liq=[]; const keep=[]; let did=false;
    for(const e of q){ if(e[3]>w.time||n>=600){keep.push(e);continue;} n++; did=true; w.liqSet.delete(tkey(e[0],e[1],e[2])); liquidTick(e[0],e[1],e[2]); }
    w.liq=keep.concat(w.liq); if(!did)break; } }

// ---------------------------------------------------------------------
// REDSTONE
//   sources: lever, button, pressure plate, redstone torch, block of redstone, repeater (front only)
//   wire carries power 15 → 0; solid blocks next to a lever/under a torch/in front of a repeater are
//   "strongly" powered (they power wire); blocks under or pointed at by live wire are "weakly" powered.
// ---------------------------------------------------------------------
let rsFrame=0; const rsStamp=new Map(), torchHist=new Map();
function rsSchedule(x,y,z,delay=0,apply){ const w=world,k=(apply===undefined?'':'a')+tkey(x,y,z); if(w.rsPending.has(k))return; w.rsPending.add(k); w.rsq.push([x,y,z,w.time+delay,apply,k]); }
function rsNotify(x,y,z){ if(net.guest)return;
  for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)for(let dz=-2;dz<=2;dz++){ if(Math.abs(dx)+Math.abs(dy)+Math.abs(dz)>3)continue; const b=world.getBlock(x+dx,y+dy,z+dz); if(!RS[b])continue;
    rsSchedule(x+dx,y+dy,z+dz,(b===RTORCH_ON||b===RTORCH_OFF)?0.1:0); } }
function emitsInto(sx,sy,sz,tx,ty,tz){ const b=world.getBlock(sx,sy,sz);
  if(b===LEVER_ON||b===BUTTON_ON||b===PLATE_ON||b===REDSTONE_BLOCK||b===DETECTOR_RAIL_ON)return 15;
  if(b===RTORCH_ON)return (tx===sx&&tz===sz&&ty===sy-1)?0:15;
  if(b===REPEATER_ON){ const d=DIRV[world.getMeta(sx,sy,sz)&7]; return (tx===sx+d[0]&&ty===sy&&tz===sz+d[2])?15:0; }
  if(b===COMPARATOR_ON){ const m=world.getMeta(sx,sy,sz),d=DIRV[m&7]; return (tx===sx+d[0]&&ty===sy&&tz===sz+d[2])?(m>>4)&15:0; }
  if(b===OBSERVER_ON){ const d=DIRV[OPP[world.getMeta(sx,sy,sz)&7]]; return (tx===sx+d[0]&&ty===sy+d[1]&&tz===sz+d[2])?15:0; }
  return 0; }
const conductive=b=>SOLID[b]&&!RS[b]&&!TRANSPARENT[b]&&b!==LEAVES;
function wireConnections(x,y,z){ const out=new Set(),upFree=!SOLID[world.getBlock(x,y+1,z)];
  for(const hd of HDIRS){ const d=DIRV[hd],nx=x+d[0],nz=z+d[2],nb=world.getBlock(nx,y,nz);
    if(RS[nb]&&!(nb===REPEATER_OFF||nb===REPEATER_ON)){out.add(hd);continue;}
    if(nb===REPEATER_OFF||nb===REPEATER_ON){ const f=world.getMeta(nx,y,nz)&7; if(f===hd||f===OPP[hd])out.add(hd); continue; }
    if(upFree&&RS_WIRE.has(world.getBlock(nx,y+1,nz))){out.add(hd);continue;}
    if(!SOLID[nb]&&RS_WIRE.has(world.getBlock(nx,y-1,nz)))out.add(hd); }
  return out; }
function wirePointsInto(x,y,z,dir){ const c=wireConnections(x,y,z); return c.size===0||c.has(dir)||(c.size===1&&c.has(OPP[dir])); }
function blockPowered(x,y,z,allowWeak){ const b=world.getBlock(x,y,z); if(!conductive(b))return false;
  for(let i=0;i<6;i++){ const d=DIRV[i],sx=x+d[0],sy=y+d[1],sz=z+d[2],sb=world.getBlock(sx,sy,sz);
    if(sb===RTORCH_ON){ if(i===3)return true; continue; }
    if(sb===LEVER_ON||sb===BUTTON_ON){ const ad=DIRV[world.getMeta(sx,sy,sz)&7]; if(sx+ad[0]===x&&sy+ad[1]===y&&sz+ad[2]===z)return true; continue; }
    if(sb===PLATE_ON||sb===DETECTOR_RAIL_ON){ if(i===2)return true; continue; }
    if(sb===REDSTONE_BLOCK)return true;
    if((sb===REPEATER_ON||sb===COMPARATOR_ON||sb===OBSERVER_ON)&&emitsInto(sx,sy,sz,x,y,z))return true;
    if(allowWeak&&RS_WIRE.has(sb)&&world.getMeta(sx,sy,sz)>0){ if(i===2)return true; if(i!==3&&wirePointsInto(sx,sy,sz,OPP[i]))return true; } }
  return false; }
function isPowered(x,y,z,skipDir=-1){ for(let i=0;i<6;i++){ if(i===skipDir)continue; const d=DIRV[i],sx=x+d[0],sy=y+d[1],sz=z+d[2],sb=world.getBlock(sx,sy,sz);
    if(emitsInto(sx,sy,sz,x,y,z)>0)return true;
    if(RS_WIRE.has(sb)&&world.getMeta(sx,sy,sz)>0){ if(i===2)return true; if(i!==3&&wirePointsInto(sx,sy,sz,OPP[i]))return true; }
    if(conductive(sb)&&blockPowered(sx,sy,sz,true))return true; }
  return false; }
function wireNeighbors(x,y,z){ const out=[],upFree=!SOLID[world.getBlock(x,y+1,z)];
  for(const hd of HDIRS){ const d=DIRV[hd],nx=x+d[0],nz=z+d[2];
    if(RS_WIRE.has(world.getBlock(nx,y,nz)))out.push([nx,y,nz]);
    else{ if(upFree&&RS_WIRE.has(world.getBlock(nx,y+1,nz)))out.push([nx,y+1,nz]); if(!SOLID[world.getBlock(nx,y,nz)]&&RS_WIRE.has(world.getBlock(nx,y-1,nz)))out.push([nx,y-1,nz]); } }
  return out; }
function wireNetwork(x,y,z){ const w=world,cells=new Map(),stack=[[x,y,z]];
  while(stack.length&&cells.size<1000){ const c=stack.pop(),k=tkey(c[0],c[1],c[2]); if(cells.has(k)||!RS_WIRE.has(w.getBlock(c[0],c[1],c[2])))continue; cells.set(k,{p:c,lvl:0}); for(const n of wireNeighbors(c[0],c[1],c[2]))stack.push(n); }
  const q=[];
  for(const c of cells.values()){ const [cx,cy,cz]=c.p;
    for(let i=0;i<6;i++){ const d=DIRV[i],sx=cx+d[0],sy=cy+d[1],sz=cz+d[2],e=emitsInto(sx,sy,sz,cx,cy,cz); if(e>c.lvl)c.lvl=e; if(c.lvl<15&&blockPowered(sx,sy,sz,false)){c.lvl=15;break;} }
    if(c.lvl)q.push(c); }
  for(let qi=0;qi<q.length;qi++){ const c=q[qi]; for(const n of wireNeighbors(c.p[0],c.p[1],c.p[2])){ const nc=cells.get(tkey(n[0],n[1],n[2])); if(nc&&nc.lvl<c.lvl-1){nc.lvl=c.lvl-1;q.push(nc);} } }
  for(const [k,c] of cells){ rsStamp.set(k,rsFrame); const want=c.lvl>0?WIRE_ON:WIRE_OFF; if(w.getBlock(c.p[0],c.p[1],c.p[2])!==want||w.getMeta(c.p[0],c.p[1],c.p[2])!==c.lvl)w.setBlock(c.p[0],c.p[1],c.p[2],want,true,c.lvl); } }
function torchBurnedOut(x,y,z){ const k=tkey(x,y,z),now=world.time; const h=(torchHist.get(k)||[]).filter(t=>now-t<2);
  if(h.length>=10){ torchHist.set(k,[]); if(world.getBlock(x,y,z)===RTORCH_ON)world.setBlock(x,y,z,RTORCH_OFF,true,world.getMeta(x,y,z)); rsSchedule(x,y,z,3); return true; }
  h.push(now); torchHist.set(k,h); return false; }
function rsUpdate(x,y,z,apply){ const w=world,b=w.getBlock(x,y,z),m=w.getMeta(x,y,z);
  if(apply!==undefined){ if(b===REPEATER_OFF||b===REPEATER_ON){ const want=apply?REPEATER_ON:REPEATER_OFF; if(b!==want)w.setBlock(x,y,z,want,true,m); }
    else if(b===COMPARATOR_OFF||b===COMPARATOR_ON){ const out=apply|0; w.setBlock(x,y,z,out>0?COMPARATOR_ON:COMPARATOR_OFF,true,(m&15)|out<<4); }
    else if(b===OBSERVER||b===OBSERVER_ON){ const want=apply?OBSERVER_ON:OBSERVER; if(b!==want){ w.setBlock(x,y,z,want,true,m); if(apply)rsSchedule(x,y,z,0.1,false); } }
    return; }
  if(b===COMPARATOR_OFF||b===COMPARATOR_ON){ comparatorUpdate(w,x,y,z,b,m); return; }
  if(b===DROPPER||b===DISPENSER){ const t=getTile(x,y,z,b),p=isPowered(x,y,z); if(p&&!t.powered)dispense(x,y,z,b,t); t.powered=p; return; }
  if(RS_WIRE.has(b)){ if(rsStamp.get(tkey(x,y,z))===rsFrame){ rsSchedule(x,y,z,0.05); return; } wireNetwork(x,y,z); return; }
  if(b===LAMP_OFF||b===LAMP_ON){ const want=isPowered(x,y,z)?LAMP_ON:LAMP_OFF; if(want!==b)w.setBlock(x,y,z,want); return; }
  if(b===RTORCH_ON||b===RTORCH_OFF){ const want=blockPowered(x,y-1,z,true)?RTORCH_OFF:RTORCH_ON; if(want!==b&&!torchBurnedOut(x,y,z))w.setBlock(x,y,z,want,true,m); return; }
  if(b===REPEATER_OFF||b===REPEATER_ON){ const f=m&7,d=DIRV[f],bx=x-d[0],bz=z-d[2],bb=w.getBlock(bx,y,bz);
    const inp=emitsInto(bx,y,bz,x,y,z)>0||(RS_WIRE.has(bb)&&w.getMeta(bx,y,bz)>0)||blockPowered(bx,y,bz,true);
    if(inp!==(b===REPEATER_ON))rsSchedule(x,y,z,(((m>>3)&3)+1)*0.1,inp); return; }
  if(PISTON_BODY.has(b)){ const f=m&7,ext=b===PISTON_EXT||b===STICKY_EXT,sticky=b===STICKY||b===STICKY_EXT,p=isPowered(x,y,z,f);
    if(p&&!ext)pistonExtend(x,y,z,f,sticky); else if(!p&&ext)pistonRetract(x,y,z,f,sticky); return; }
  if(b===POWERED_RAIL||b===POWERED_RAIL_ON){ const want=poweredRailState(w,x,y,z)?POWERED_RAIL_ON:POWERED_RAIL; if(want!==b){ w.setBlock(x,y,z,want,true,m); for(const d of RAIL_CONN[m&15]||[])for(const dy of [0,1,-1])rsSchedule(x+DIRV[d][0],y+dy,z+DIRV[d][2],0.05); } return; }
  if(b===TNT){ if(isPowered(x,y,z)){ w.setBlock(x,y,z,AIR); primeTNT(x,y,z); } return; }
  if(isDoor(b)){ const by=(b===DOOR_T||b===DOOR_T_O)?y-1:y,bm=w.getMeta(x,by,z),p=isPowered(x,by,z)||isPowered(x,by+1,z),last=(bm>>3)&1;
    if((p?1:0)!==last){ doorBusy=true; w.setBlock(x,by,z,w.getBlock(x,by,z),true,(bm&7)|(p?8:0)); doorBusy=false; toggleDoor(x,by,z,p); } return; }
}
function updateRedstone(w){ if(net.guest)return; rsFrame++; let n=0;
  for(let round=0;round<8&&n<800;round++){ const q=w.rsq; w.rsq=[]; const keep=[]; let did=false;
    for(const e of q){ if(e[3]>w.time||n>=800){keep.push(e);continue;} n++; did=true; w.rsPending.delete(e[5]); rsUpdate(e[0],e[1],e[2],e[4]); }
    w.rsq=keep.concat(w.rsq); if(!did)break; } }
// --- pistons ---
const UNPUSHABLE=new Set([BEDROCK,OBSIDIAN,PORTAL,END_PORTAL,END_FRAME,END_FRAME_EYE,SPAWNER,ENCHANT_TABLE,PISTON_EXT,STICKY_EXT,PISTON_HEAD,STICKY_HEAD,END_CRYSTAL]);
const pushable=b=>!UNPUSHABLE.has(b)&&!TILEBLK[b]&&!isDoor(b);
function pistonExtend(x,y,z,f,sticky){ const w=world,d=DIRV[f],line=[]; let cx=x+d[0],cy=y+d[1],cz=z+d[2];
  for(let i=0;;i++){ if(cy<1||cy>=CY-1)return; const b=w.getBlock(cx,cy,cz); if(b===AIR||LIQ[b]||WASHABLE[b])break; if(!pushable(b)||i>=12)return; line.push([cx,cy,cz,b,w.getMeta(cx,cy,cz)]); cx+=d[0];cy+=d[1];cz+=d[2]; }
  const end=w.getBlock(cx,cy,cz); pistonBusy=true;
  if(end!==AIR&&WASHABLE[end]&&!LIQ[end])dropBlockLoot(end,cx,cy,cz);
  for(let i=line.length-1;i>=0;i--){ const [lx,ly,lz,b,m]=line[i]; w.setBlock(lx+d[0],ly+d[1],lz+d[2],b,true,m); }
  w.setBlock(x+d[0],y+d[1],z+d[2],sticky?STICKY_HEAD:PISTON_HEAD,true,f); w.setBlock(x,y,z,sticky?STICKY_EXT:PISTON_EXT,true,f);
  pistonBusy=false; sfx.place(); pushEntities(line.map(l=>[l[0]+d[0],l[1]+d[1],l[2]+d[2]]).concat([[x+d[0],y+d[1],z+d[2]]]),d); }
function pistonRetract(x,y,z,f,sticky){ const w=world,d=DIRV[f],hx=x+d[0],hy=y+d[1],hz=z+d[2]; pistonBusy=true;
  if(PISTON_HEADS.has(w.getBlock(hx,hy,hz)))w.setBlock(hx,hy,hz,AIR);
  w.setBlock(x,y,z,sticky?STICKY:PISTON,true,f);
  if(sticky){ const bx=hx+d[0],by=hy+d[1],bz=hz+d[2],b=w.getBlock(bx,by,bz); if(b!==AIR&&!LIQ[b]&&!WASHABLE[b]&&pushable(b)){ const m=w.getMeta(bx,by,bz); w.setBlock(bx,by,bz,AIR); w.setBlock(hx,hy,hz,b,true,m); } }
  pistonBusy=false; sfx.place(); }
function pushEntities(cells,d){ for(const e of [player,...world.mobs]){ for(const [cx,cy,cz] of cells){
    if(e.pos[0]+e.w>cx&&e.pos[0]-e.w<cx+1&&e.pos[1]+e.h>cy&&e.pos[1]<cy+1&&e.pos[2]+e.w>cz&&e.pos[2]-e.w<cz+1){ if(d[1]>0)e.pos[1]=cy+1.01; else{e.pos[0]+=d[0]*1.01;e.pos[1]+=d[1]*1.01;e.pos[2]+=d[2]*1.01;} break; } } } }
// --- pressure plates & button timers (run on every client) ---
function entityOn(x,y,z){ const ins=e=>e.pos[0]+(e.w||0.3)>x&&e.pos[0]-(e.w||0.3)<x+1&&e.pos[2]+(e.w||0.3)>z&&e.pos[2]-(e.w||0.3)<z+1&&e.pos[1]>=y-0.05&&e.pos[1]<y+0.6;
  if(!player.dead&&!player.spectator&&ins(player))return true; for(const m of world.mobs)if(ins(m))return true; for(const it of world.items)if(ins(it))return true; for(const rp of net.remotesIn(world.dim))if(!rp.spec&&ins(rp))return true; return false; }
function updatePlates(w){ for(const [k,p] of w.plates){ const [x,y,z]=p,b=w.getBlock(x,y,z);
    if(b===DETECTOR_RAIL||b===DETECTOR_RAIL_ON){ if(!w.loaded(x,z))continue; const on=w.mobs.some(m=>m.def.cart&&Math.floor(m.pos[0])===x&&Math.floor(m.pos[2])===z&&Math.abs(m.pos[1]-y)<1); if(on)p[3]=w.time;
      const want=w.time-p[3]<0.5?DETECTOR_RAIL_ON:DETECTOR_RAIL; if(want!==b)w.setBlock(x,y,z,want,true,w.getMeta(x,y,z)); continue; }
    if(b!==PLATE&&b!==PLATE_ON){w.plates.delete(k);continue;} if(!w.loaded(x,z))continue;
    if(entityOn(x,y,z))p[3]=w.time; const want=w.time-p[3]<0.5?PLATE_ON:PLATE; if(want!==b)w.setBlock(x,y,z,want,true,w.getMeta(x,y,z)); } }
function updateTimers(w){ for(let i=w.timers.length-1;i>=0;i--){ const t=w.timers[i]; if(w.time<t.t)continue; w.timers.splice(i,1);
    if(t.kind==='button'&&w.getBlock(t.x,t.y,t.z)===BUTTON_ON)w.setBlock(t.x,t.y,t.z,BUTTON,true,w.getMeta(t.x,t.y,t.z)); } }

// ---------------------------------------------------------------------
// GROWTH: crops, saplings, sugar cane, nether wart, farmland moisture (every second)
// ---------------------------------------------------------------------
function updateGrowth(w,dt){ w.growT=(w.growT||0)+dt; if(w.growT<1)return; w.growT=0; if(net.guest)return;
  for(const [k,[x,y,z]] of w.grow){ if(!w.loaded(x,z))continue; const b=w.getBlock(x,y,z); if(!GROW[b]){w.grow.delete(k);continue;}
    if(b===FARMLAND||b===FARMLAND_WET){ const wet=waterNear(x,y,z,4); if(wet&&b===FARMLAND)w.setBlock(x,y,z,FARMLAND_WET); else if(!wet&&b===FARMLAND_WET)w.setBlock(x,y,z,FARMLAND);
      else if(!wet&&w.getBlock(x,y+1,z)===AIR&&Math.random()<0.02)w.setBlock(x,y,z,DIRT); continue; }
    const l=w.getLight(x,y,z),lv=Math.max(l&15,l>>4);
    if(b>=WHEAT0&&b<WHEAT3){ if(lv>=9&&Math.random()<(w.getBlock(x,y-1,z)===FARMLAND_WET?1/20:1/45))w.setBlock(x,y,z,b+1); }
    else if(b===SAPLING){ if(lv>=9&&Math.random()<1/60)growTree(x,y,z); }
    else if(b===SUGAR_CANE){ if(w.getBlock(x,y+1,z)===AIR&&Math.random()<1/25){ let h=1; while(w.getBlock(x,y-h,z)===SUGAR_CANE)h++; if(h<3)w.setBlock(x,y+1,z,SUGAR_CANE); } }
    else if(b===WART0||b===WART1){ if(Math.random()<1/35)w.setBlock(x,y,z,b+1); }
    else if(b===CARROTS0||b===POTATOES0){ if(lv>=9&&Math.random()<(w.getBlock(x,y-1,z)===FARMLAND_WET?1/50:1/110))w.setBlock(x,y,z,b+1); }
    else if(b===PUMPKIN_STEM||b===MELON_STEM){ if(lv>=9&&Math.random()<1/60){ const prev=world; world=w; growStemFruit(x,y,z,b); world=prev; } }
    else if(b>=COPPER_BLOCK&&b<COPPER_OXIDIZED){ if(Math.random()<1/420)w.setBlock(x,y,z,b+1); }   // copper slowly weathers
    else if(b===FIRE){ // fire burns out, eats flammable blocks next to it and jumps to nearby fuel; rain puts it out
      const below=w.getBlock(x,y-1,z),eternal=below===NETHERRACK,fuel=DIRV.map(d=>[x+d[0],y+d[1],z+d[2]]).filter(([a,c,e])=>FLAM[w.getBlock(a,c,e)]);
      if(w.dim==='over'&&rainLevel>0.5&&w.getSky(x,y,z)===15&&Math.random()<0.5){ w.setBlock(x,y,z,AIR); continue; }
      if(!eternal&&(!fuel.length&&(!SOLID[below]||Math.random()<0.15)||Math.random()<0.04)){ w.setBlock(x,y,z,AIR); continue; }
      if(difficulty()==='peaceful'&&!eternal&&Math.random()<0.5){ w.setBlock(x,y,z,AIR); continue; }
      for(const [a,c,e] of fuel)if(Math.random()<0.22){ const nb=w.getBlock(a,c,e); if(nb===TNT){ w.setBlock(a,c,e,AIR); primeTNT(a,c,e); } else w.setBlock(a,c,e,Math.random()<0.75?FIRE:AIR); }
      for(let k=0;k<2;k++)if(Math.random()<0.4){ const ax=x+rint(-1,1),ay=y+rint(-1,2),az=z+rint(-1,1); if(w.getBlock(ax,ay,az)===AIR&&DIRV.some(d=>FLAM[w.getBlock(ax+d[0],ay+d[1],az+d[2])]))w.setBlock(ax,ay,az,FIRE); }
      if(Math.random()<0.3)sfx.fire(); }
    else if(b===CACTUS){ if(w.getBlock(x,y+1,z)===AIR&&Math.random()<1/40){ let h=1; while(w.getBlock(x,y-h,z)===CACTUS)h++; if(h<3){ const prev=world; world=w; if(canStay(CACTUS,0,x,y+1,z))w.setBlock(x,y+1,z,CACTUS); world=prev; } } } } }
