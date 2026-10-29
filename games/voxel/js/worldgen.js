'use strict';
// ---------------------------------------------------------------------
// WORLD GENERATION — Overworld (biomes, caves, ores, plants, trees, villages, dungeons, stronghold)
// ---------------------------------------------------------------------
const BIOME={PLAINS:{surface:GRASS,trees:0.004,grass:0.12,pumpkins:0.0015},FOREST:{surface:GRASS,trees:0.03,grass:0.07,lily:0.03},DESERT:{surface:SAND,trees:0,grass:0,cactus:0.006,bush:0.006,temple:true},
  SNOW:{surface:SNOW,trees:0.012,grass:0,tree:'spruce',ice:true},TAIGA:{surface:GRASS,trees:0.035,grass:0.06,tree:'spruce'},JUNGLE:{surface:GRASS,trees:0.07,grass:0.25,tree:'jungle',melons:0.006,lily:0.05}};
const LOOT={mineshaft:[[RAIL,4,8],[TORCH,3,8],[IRON_INGOT,1,3],[GOLD_INGOT,0,2],[BREAD,1,3],[COAL,2,6],[REDSTONE,0,5],[LAPIS,0,6],[DIAMOND,1,1,0.25],[SADDLE,1,1,0.1],[MELON_SEEDS,0,3],[PUMPKIN_SEEDS,0,3],[MINECART,1,1,0.15],[POWERED_RAIL,1,3,0.3]],
  trial:[[ARROW,4,10],[BREAD,2,4],[IRON_INGOT,1,3],[WIND_CHARGE,2,5],[EMERALD,1,3],[COPPER_INGOT,2,6],[TRIAL_KEY,1,1,0.4]],
  trialReward:[[EMERALD,1,3],[ARROW,4,8],[IRON_INGOT,1,2],[BREAD,1,3],[WIND_CHARGE,1,3],[BAKED_POTATO,1,3]],
  vault:[[EMERALD,2,5],[DIAMOND,1,2,0.35],[IRON_INGOT,2,4],[WIND_CHARGE,3,6],[GOLD_INGOT,1,3],[SADDLE,1,1,0.15],[HEAVY_CORE,1,1,0.1],[SHIELD,1,1,0.2],[BOW,1,1,0.2]],
  temple:[[GOLD_INGOT,1,5],[EMERALD,0,3],[DIAMOND,0,2],[IRON_INGOT,1,4],[BONE,2,6],[ROTTEN,2,6],[GUNPOWDER,1,4],[ENDER_PEARL,0,1],[BOOK,0,2],[HEAVY_CORE,1,1,0.08],[SADDLE,1,1,0.2]],dungeon:[[HEAVY_CORE,1,1,0.15],[SADDLE,1,1,0.3],[POT_POISON,1,1,0.2],[COPPER_INGOT,0,4],[WIND_CHARGE,0,3],[IRON_INGOT,1,4],[COAL,2,6],[APPLE,1,3],[ARROW,2,8],[GOLD_INGOT,1,2],[DIAMOND,0,1],[ENDER_PEARL,0,1],[EMERALD,0,2],[BOW,0,1],[REDSTONE,0,4],[BONE,0,3],[GUNPOWDER,0,3],[BUCKET,0,1],[SEEDS,0,4]],
  stronghold:[[HEAVY_CORE,1,1,0.25],[ENDER_PEARL,1,2],[DIAMOND,1,3],[IRON_INGOT,2,5],[EMERALD,1,3],[APPLE,2,4],[GOLD_INGOT,1,3],[REDSTONE,1,5],[BREAD,1,3]],
  village:[[APPLE,1,4],[WOOL,1,3],[EMERALD,0,2],[IRON_INGOT,0,2],[COAL,1,4],[BREAD,1,3],[SEEDS,1,4],[WHEAT,1,5]],
  fortress:[[WART,2,5],[GOLD_INGOT,1,3],[IRON_INGOT,1,4],[DIAMOND,0,2],[FLINT_STEEL,0,1],[OBSIDIAN,0,3],[BLAZE_ROD,0,2]]};
// grows a tree into a block setter (used by world generation and by saplings)
function treeShape(x,y,z,th,put,canLeaf){ for(let i=1;i<=th;i++)put(x,y+i,z,LOG);
  for(let ly=y+th-2;ly<=y+th+1;ly++){const r=ly>=y+th?1:2;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){ if(r===2&&Math.abs(dx)===2&&Math.abs(dz)===2&&hash3(x+dx,ly,z+dz)>0.5)continue; if(ly===y+th+1&&Math.abs(dx)+Math.abs(dz)>1)continue; if(canLeaf(x+dx,ly,z+dz))put(x+dx,ly,z+dz,LEAVES);}} }
function spruceShape(x,y,z,th,put,canLeaf){ for(let i=1;i<=th;i++)put(x,y+i,z,SPRUCE_LOG);
  for(let ly=y+3;ly<=y+th+1;ly++){ const k=(y+th+1-ly), r=ly>y+th?0:k%2===0?1:Math.min(3,1+Math.floor(k/2)); for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){ if(Math.abs(dx)+Math.abs(dz)>r+1)continue; if((dx||dz||ly>y+th)&&canLeaf(x+dx,ly,z+dz))put(x+dx,ly,z+dz,SPRUCE_LEAVES); } } }
function jungleShape(x,y,z,th,put,canLeaf,vines){ for(let i=1;i<=th;i++)put(x,y+i,z,JUNGLE_LOG);
  for(let ly=y+th-2;ly<=y+th+1;ly++){ const r=ly>=y+th+1?1:ly===y+th?2:3; for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){ if(dx*dx+dz*dz>r*r+1)continue; if(canLeaf(x+dx,ly,z+dz))put(x+dx,ly,z+dz,JUNGLE_LEAVES); } }
  if(vines)for(const [dx,dz,f] of [[4,0,1],[-4,0,0],[0,4,5],[0,-4,4]]){ if(hash3(x+dx,y,z+dz)<0.5)continue; const n=2+Math.floor(hash3(x,dx,dz)*4); for(let i=0;i<n;i++){ const yy=y+th-1-i; if(canLeaf(x+dx,yy,z+dz))put(x+dx,yy,z+dz,VINE,f); } } }
class OverGen{
  constructor(seed,opts={}){this.flat=opts.type==='flat';if(this.flat)this.portalCenter=null;this.nA=new Simplex(seed);this.nB=new Simplex(seed*7+1);this.nC=new Simplex(seed*13+2);
    const a=hash3(1,2,3)*6.283,d=22+hash3(4,5,6)*14; this.stronghold=[Math.round(Math.cos(a)*d),Math.round(Math.sin(a)*d)];}   // chunk coords
  column(x,z){ if(this.flat)return {h:3,biome:BIOME.PLAINS,peak:false}; const cont=fbm2(this.nA,x*0.0015,z*0.0015,4),ero=(fbm2(this.nB,x*0.004+100,z*0.004,3)+1)*0.5,det=fbm2(this.nC,x*0.02,z*0.02,4);
    const base=spline(cont,[[-1,18],[-0.4,30],[-0.15,38],[0.1,44],[0.5,54],[1,80]]);
    // mountain ranges: large regions where ridged noise lifts the land up to ~60 blocks
    const mask=clamp((fbm2(this.nA,x*0.0011-400,z*0.0011+400,2)+0.05)/0.35,0,1), ridge=1-Math.abs(fbm2(this.nB,x*0.0028+300,z*0.0028-200,4));
    const mtn=cont>-0.2?mask*mask*Math.pow(ridge,2.2)*62:0;
    const h=clamp(Math.round(base+det*(3+18*ero)+mtn),4,CY-14);
    const temp=fbm2(this.nA,x*0.0025+777,z*0.0025-333,2),hum=fbm2(this.nB,x*0.0025-555,z*0.0025+999,2);
    const biome=h>92?BIOME.SNOW:temp<-0.3?BIOME.SNOW:(temp<-0.12&&hum>-0.1)?BIOME.TAIGA:(temp>0.25&&hum<-0.05)?BIOME.DESERT:(temp>0.18&&hum>0.22)?BIOME.JUNGLE:hum>0.05?BIOME.FOREST:BIOME.PLAINS;
    return {h,biome,peak:h>78}; }
  isCave(x,y,z){ const a=this.nA.noise3D(x*0.045,y*0.045,z*0.045); const cheese=this.nC.noise3D(x*0.03,y*0.03,z*0.03)>(y<24?0.62:0.72);
    if(Math.abs(a)>0.085)return cheese; return Math.abs(this.nB.noise3D(x*0.045,y*0.045,z*0.045))<0.085||cheese; }
  villageCenter(cx,cz){ const rx=Math.floor(cx/8),rz=Math.floor(cz/8); if(hash3(rx,rz,91)>0.65)return null; return [rx*8+1+Math.floor(hash3(rx,rz,92)*6),rz*8+1+Math.floor(hash3(rx,rz,93)*6)]; }
  generate(ch){
    const B=ch.blocks,ox=ch.cx*CX,oz=ch.cz*CZ,cols=new Array(CX*CZ);
    if(this.flat){ for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ B[idx(x,0,z)]=BEDROCK; B[idx(x,1,z)]=DIRT; B[idx(x,2,z)]=DIRT; B[idx(x,3,z)]=GRASS; } ch.generated=true; return; }
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){
      const wx=ox+x,wz=oz+z,c=this.column(wx,wz);cols[z*CX+x]=c;const h=c.h; let surface=c.biome.surface; if(c.peak&&h<=92&&hash3(wx,h,wz)<0.35)surface=STONE; if(h<=SEA_LEVEL+1)surface=h<SEA_LEVEL-4?GRAVEL:SAND; const underwater=h<=SEA_LEVEL+1;
      for(let y=0;y<CY;y++){ let b=AIR;
        if(y===0)b=BEDROCK; else if(y<h-3){ b=STONE;const r=hash3(wx,y,wz); if(r<0.011)b=COAL_ORE;else if(y<64&&r<0.017)b=IRON_ORE;else if(y<32&&r<0.0195)b=GOLD_ORE;else if(y<16&&r<0.0208)b=DIAMOND_ORE;else if(y<40&&r<0.0215)b=EMERALD_ORE;else if(y<20&&r<0.0245)b=REDSTONE_ORE;else if(y<32&&r<0.0262)b=LAPIS_ORE;else if(y<96&&r<0.034)b=COPPER_ORE; }
        else if(y<h)b=surface===SAND?(y>=h-2?SAND:c.biome===BIOME.DESERT?SANDSTONE:DIRT):DIRT; else if(y===h)b=underwater&&h<SEA_LEVEL-1&&hash3(wx,77,wz)<0.07?CLAY:surface; else if(y<=SEA_LEVEL)b=(y===SEA_LEVEL&&c.biome.ice)?ICE:WATER;
        if(b!==AIR&&b!==WATER&&b!==BEDROCK&&y>=2&&y<=h&&!(underwater&&y>SEA_LEVEL-3)&&this.isCave(wx,y,wz)) b=y<=10?(hash3(wx,y+99,wz)<0.12?OBSIDIAN:LAVA):AIR;
        B[idx(x,y,z)]=b; } }
    // trees (2-block margin keeps them inside the chunk)
    for(let z=3;z<CZ-3;z++)for(let x=3;x<CX-3;x++){ const c=cols[z*CX+x],h=c.h,wx=ox+x,wz=oz+z; if(c.biome.trees<=0||h<=SEA_LEVEL+1)continue;
      const top=B[idx(x,h,z)];if(top!==GRASS&&top!==SNOW)continue; if(hash3(wx,7,wz)>=c.biome.trees)continue; const kind=c.biome.tree,th=(kind==='spruce'?6:kind==='jungle'?8:4)+Math.floor(hash3(wx,9,wz)*(kind?4:3));if(h+th+2>=CY)continue;
      const put=(a,b,c2,v,m=0)=>{B[idx(a,b,c2)]=v;if(m)ch.meta[idx(a,b,c2)]=m;},can=(a,b,c2)=>B[idx(a,b,c2)]===AIR;
      if(kind==='spruce')spruceShape(x,h,z,th,put,can); else if(kind==='jungle')jungleShape(x,h,z,th,put,can,true); else treeShape(x,h,z,th,put,can); }
    // tall grass, flowers, sugar cane at the water's edge
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const c=cols[z*CX+x],h=c.h,wx=ox+x,wz=oz+z; if(h+3>=CY||B[idx(x,h+1,z)]!==AIR)continue; const top=B[idx(x,h,z)];
      if(top===GRASS){ const r=hash3(wx,11,wz),g=c.biome.grass; if(r<g)B[idx(x,h+1,z)]=TALL_GRASS; else if(r<g+0.004)B[idx(x,h+1,z)]=FLOWER_RED; else if(r<g+0.008)B[idx(x,h+1,z)]=FLOWER_YELLOW;
        else if(c.biome.pumpkins&&r<g+0.008+c.biome.pumpkins)B[idx(x,h+1,z)]=PUMPKIN; else if(c.biome.melons&&r<g+0.008+c.biome.melons)B[idx(x,h+1,z)]=MELON; }
      if(top===SAND&&c.biome===BIOME.DESERT&&h>SEA_LEVEL+1){ const r=hash3(wx,14,wz);
        if(r<c.biome.cactus&&x>0&&x<15&&z>0&&z<15&&B[idx(x+1,h+1,z)]===AIR&&B[idx(x-1,h+1,z)]===AIR&&B[idx(x,h+1,z+1)]===AIR&&B[idx(x,h+1,z-1)]===AIR){ const n=1+Math.floor(hash3(wx,15,wz)*3); for(let i=1;i<=n;i++)B[idx(x,h+i,z)]=CACTUS; }
        else if(r<c.biome.cactus+c.biome.bush)B[idx(x,h+1,z)]=DEAD_BUSH; }
      if(c.biome.lily&&h<SEA_LEVEL&&h>=SEA_LEVEL-3&&B[idx(x,SEA_LEVEL,z)]===WATER&&B[idx(x,SEA_LEVEL+1,z)]===AIR&&hash3(wx,16,wz)<c.biome.lily)B[idx(x,SEA_LEVEL+1,z)]=LILY;
      if((top===SAND||top===GRASS)&&h===SEA_LEVEL&&x>0&&x<15&&z>0&&z<15&&hash3(wx,12,wz)<0.3){
        if(B[idx(x+1,h,z)]===WATER||B[idx(x-1,h,z)]===WATER||B[idx(x,h,z+1)]===WATER||B[idx(x,h,z-1)]===WATER){ const n=1+Math.floor(hash3(wx,13,wz)*3); for(let i=1;i<=n;i++)B[idx(x,h+i,z)]=SUGAR_CANE; } } }
    ch.generated=true; this.mineshaft(ch,cols); this.trialChamber(ch,cols); this.structures(ch,cols);
  }
  // ---- structures (each piece is built fully inside its own chunk) ----
  // mineshafts: networks of 3×3 tunnels (6×6-chunk regions), wooden supports, rails, cobwebs and loot chests
  mineshaftAt(rx,rz){ return hash3(rx,rz,401)<0.4; }
  mineshaft(ch,cols){ const cx=ch.cx,cz=ch.cz,rx=Math.floor(cx/6),rz=Math.floor(cz/6); if(!this.mineshaftAt(rx,rz))return;
    const y0=16+Math.floor(hash3(rx,rz,402)*14), inR=(a,b)=>Math.floor(a/6)===rx&&Math.floor(b/6)===rz;
    const ex=(a,b)=>inR(a,b)&&inR(a+1,b)&&hash3(a,b,403)<0.6, ez=(a,b)=>inR(a,b)&&inR(a,b+1)&&hash3(a,b,404)<0.6;
    const E=ex(cx,cz),W=ex(cx-1,cz),S=ez(cx,cz),N=ez(cx,cz-1); if(!(E||W||S||N))return;
    const B=ch.blocks,M=ch.meta,get=(x,y,z)=>B[idx(x,y,z)],set=(x,y,z,b,m=0)=>{B[idx(x,y,z)]=b;M[idx(x,y,z)]=m;}, safe=(x,z)=>cols[z*CX+x].h>y0+6;
    const carve=(x,y,z)=>{ if(!safe(x,z))return; const b=get(x,y,z); if(b!==BEDROCK&&!LIQ[b])set(x,y,z,AIR); };
    const floor=(x,z)=>{ if(!safe(x,z))return; const b=get(x,y0-1,z); if(!SOLID[b]||LIQ[b])set(x,y0-1,z,PLANKS); };
    const rails=hash3(cx,cz,405)<0.65, corridor=(axis,a0,a1)=>{ for(let t=a0;t<=a1;t++){ for(let w=7;w<=9;w++)for(let y=y0;y<=y0+2;y++){ const x=axis?w:t,z=axis?t:w; carve(x,y,z); } for(let w=7;w<=9;w++)floor(axis?w:t,axis?t:w);
        const wx=(axis?8:t)+cx*16,wz=(axis?t:8)+cz*16,along=axis?wz:wx;
        if(((along%4)+4)%4===0){ for(const w of [7,9]){ const x=axis?w:t,z=axis?t:w; if(!safe(x,z))continue; set(x,y0,z,FENCE); set(x,y0+1,z,FENCE); } for(let w=7;w<=9;w++){ const x=axis?w:t,z=axis?t:w; if(safe(x,z))set(x,y0+2,z,PLANKS); }
          if(hash3(wx,y0,wz)<0.3&&safe(axis?8:t,axis?t:8))set(axis?8:t,y0+1,axis?t:8,AIR); }
        if(rails&&safe(axis?8:t,axis?t:8)&&get(axis?8:t,y0,axis?t:8)===AIR)set(axis?8:t,y0,axis?t:8,RAIL,axis?0:1);
        for(const w of [7,9]){ const x=axis?w:t,z=axis?t:w; if(safe(x,z)&&get(x,y0+2,z)===AIR&&hash3(wx+w,y0+2,wz)<0.07)set(x,y0+2,z,COBWEB); }
        if(hash3(wx,y0+9,wz)<0.025){ const x=axis?10:t,z=axis?t:10; if(safe(x,z)){ set(x,y0,z,CHEST); (ch.lootChests=ch.lootChests||[]).push([x,y0,z,'mineshaft']); } } } };
    if(E)corridor(0,8,15); if(W)corridor(0,0,8); if(S)corridor(1,8,15); if(N)corridor(1,0,8);
    for(let x=6;x<=10;x++)for(let z=6;z<=10;z++){ for(let y=y0;y<=y0+3;y++)carve(x,y,z); floor(x,z); }   // crossing room
    if(safe(8,8))set(8,y0+3,8,TORCH,0); }
  // trial chambers: a tuff-and-copper hall deep underground with trial spawners and vaults
  trialAt(cx,cz){ return hash3(cx,cz,501)<0.006; }
  trialChamber(ch,cols){ if(!this.trialAt(ch.cx,ch.cz))return; let minH=999; for(const c of cols)minH=Math.min(minH,c.h); if(minH<36)return;
    const y0=10+Math.floor(hash3(ch.cx,ch.cz,502)*6),B=ch.blocks,M=ch.meta,set=(x,y,z,b,m=0)=>{B[idx(x,y,z)]=b;M[idx(x,y,z)]=m;};
    for(let x=0;x<=15;x++)for(let z=0;z<=15;z++)for(let y=y0-1;y<=y0+8;y++){ const edge=x===0||x===15||z===0||z===15||y===y0-1||y===y0+8;
      set(x,y,z,edge?(y===y0-1?((x+z)%2?TUFF_BRICKS:[COPPER_BLOCK,COPPER_EXPOSED,COPPER_WEATHERED][Math.floor(hash3(x,y,z)*3)]):y===y0+8&&x%5===2&&z%5===2?GLOWSTONE:TUFF_BRICKS):AIR); }
    for(const [x,z] of [[3,3],[12,3],[3,12],[12,12]])for(let y=y0;y<y0+8;y++)set(x,y,z,y===y0+3?COPPER_BLOCK:TUFF);
    for(const [x,z] of [[3,3],[12,3],[3,12],[12,12]])for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])set(x+dx,y0+4,z+dz,COPPER_TORCH);
    const mobs=['zombie','skeleton','spider','gust','slime'],m1=mobs[Math.floor(hash3(ch.cx,ch.cz,503)*5)],m2=mobs[Math.floor(hash3(ch.cx,ch.cz,504)*5)];
    set(7,y0,7,COPPER_BLOCK); set(7,y0+1,7,TRIAL_SPAWNER); set(8,y0,8,COPPER_BLOCK); set(8,y0+1,8,AIR);
    set(7,y0,3,COPPER_BLOCK); set(7,y0+1,3,TRIAL_SPAWNER); ch.trials=[[7,y0+1,7,m1],[7,y0+1,3,m2]];
    set(5,y0,13,COPPER_BLOCK); set(5,y0+1,13,VAULT,5); set(10,y0,13,COPPER_BLOCK); set(10,y0+1,13,VAULT,5);
    for(const [x,z] of [[1,1],[14,1],[1,14],[14,14],[2,1],[1,2]])set(x,y0+6,z,COBWEB);
    set(14,y0+1,7,CHEST); (ch.lootChests=ch.lootChests||[]).push([14,y0+1,7,'trial']); }
  structures(ch,cols){
    const B=ch.blocks,M=ch.meta,cx=ch.cx,cz=ch.cz,set=(x,y,z,b,m=0)=>{if(y>=0&&y<CY){B[idx(x,y,z)]=b;M[idx(x,y,z)]=m;}};
    // desert temple: sandstone hall over a hidden treasure room (watch the pressure plate!)
    { const c=cols[7*CX+7],h=c.h; if(c.biome===BIOME.DESERT&&h>SEA_LEVEL+2&&h<CY-16&&hash3(cx,cz,95)<0.03&&!this.villageCenter(cx,cz)){
      for(let x=1;x<=13;x++)for(let z=1;z<=13;z++){ for(let y=h-3;y<=h;y++)set(x,y,z,SANDSTONE); for(let y=h+1;y<=h+11;y++)set(x,y,z,AIR); }
      for(let x=1;x<=13;x++)for(let z=1;z<=13;z++){ const edge=x===1||x===13||z===1||z===13; if(edge)for(let y=h+1;y<=h+6;y++)set(x,y,z,(y===h+3&&(x+z)%4===0)?SLAB_SAND:SANDSTONE); set(x,h+7,z,SANDSTONE); }
      for(let x=3;x<=11;x++)for(let z=3;z<=11;z++)if(x===3||x===11||z===3||z===11)set(x,h+8,z,SANDSTONE);
      for(let x=5;x<=9;x++)for(let z=5;z<=9;z++)set(x,h+9,z,(x===7&&z===7)?LAPIS_BLOCK:SANDSTONE);
      for(let x=6;x<=8;x++)for(let y=h+1;y<=h+3;y++)set(x,y,1,AIR);                       // entrance (-z side)
      for(let x=2;x<=12;x+=10)for(let z=2;z<=12;z+=10)for(let y=h+1;y<=h+6;y++)set(x,y,z,y%2?SANDSTONE:STAIRS_SAND,4);
      for(let x=5;x<=9;x++)for(let z=5;z<=9;z++)set(x,h,z,((x+z)&1)?SANDSTONE:SLAB_SAND+0);   // patterned floor
      set(7,h,7,AIR); set(6,h,7,AIR); set(8,h,7,AIR); set(7,h,6,AIR); set(7,h,8,AIR);       // the pit
      const r=h-12; for(let x=5;x<=9;x++)for(let z=5;z<=9;z++){ for(let y=r-2;y<=r+3;y++)set(x,y,z,(x===5||x===9||z===5||z===9||y===r-2)?SANDSTONE:AIR); }
      for(let y=r+1;y<h;y++){ set(7,y,7,AIR); set(6,y,7,SANDSTONE); set(8,y,7,SANDSTONE); set(7,y,6,SANDSTONE); set(7,y,8,SANDSTONE); }
      for(let x=6;x<=8;x++)for(let z=6;z<=8;z++)set(x,r-3,z,TNT); set(7,r-1,7,SANDSTONE); set(7,r,7,PLATE);
      set(7,r,5,CHEST); set(7,r,9,CHEST); set(5,r,7,CHEST); set(9,r,7,CHEST);
      ch.lootChests=(ch.lootChests||[]).concat([[7,r,5,'temple'],[7,r,9,'temple'],[5,r,7,'temple'],[9,r,7,'temple']]); ch.temple=[7,h,7]; } }
    // village houses with a small wheat farm
    const vc=this.villageCenter(cx,cz);
    if(vc&&Math.abs(cx-vc[0])<=1&&Math.abs(cz-vc[1])<=1&&hash3(cx,cz,94)<0.75){ const c=cols[7*CX+7],h=c.h;
      if(h>SEA_LEVEL+1&&h<CY-12&&c.biome!==BIOME.DESERT){ const x0=4,z0=4,w=7,d=7; ch.house=[x0,h,z0];
        for(let x=x0-1;x<=15;x++)for(let z=z0-1;z<=z0+d;z++){ for(let y=h-4;y<h;y++)if(!SOLID[B[idx(x,y,z)]])set(x,y,z,DIRT); set(x,h,z,(x<x0||z<z0||x>=x0+w||z>=z0+d)?GRASS:COBBLE); for(let y=h+1;y<=h+7;y++)set(x,y,z,AIR); }
        for(let x=x0;x<x0+w;x++)for(let z=z0;z<z0+d;z++){ const edge=x===x0||z===z0||x===x0+w-1||z===z0+d-1, corner=(x===x0||x===x0+w-1)&&(z===z0||z===z0+d-1);
          if(edge)for(let y=h+1;y<=h+3;y++)set(x,y,z,corner?LOG:(y===h+2&&(x===x0+3||z===z0+3))?GLASS:PLANKS); set(x,h+4,z,PLANKS); }
        set(x0+3,h+1,z0,DOOR_B,5);set(x0+3,h+2,z0,DOOR_T,5);              // door on the -z side
        set(x0+1,h+1,z0+1,TORCH); set(x0+5,h+1,z0+5,BED); set(x0+1,h+1,z0+5,CHEST,0); ch.lootChests=[[x0+1,h+1,z0+5,'village']]; set(x0+5,h+1,z0+1,CRAFTING_TABLE);
        for(let x=11;x<=15;x++)for(let z=3;z<=11;z++){ const border=x===11||x===15||z===3||z===11;
          set(x,h,z,border?LOG:x===13?WATER:FARMLAND_WET); if(!border&&x!==13)set(x,h+1,z,WHEAT0+hr(cx*16+x,h,cz*16+z,0,3)); } }
    }
    // dungeon: cobble room with a monster spawner and a loot chest
    if(hash3(cx,cz,95)<0.05){ const y0=hr(cx,cz,96,8,40),x0=5,z0=5;
      for(let x=x0-1;x<=x0+5;x++)for(let z=z0-1;z<=z0+5;z++)for(let y=y0-1;y<=y0+4;y++){ const wall=x===x0-1||x===x0+5||z===z0-1||z===z0+5||y===y0-1||y===y0+4; set(x,y,z,wall?(hash3(x,y,z)<0.3?STONE_BRICK:COBBLE):AIR); }
      set(x0+2,y0,z0+2,SPAWNER); set(x0,y0,z0,CHEST); ch.spawners=[[x0+2,y0,z0+2,(r=>r<0.35?'zombie':r<0.6?'skeleton':r<0.8?'spider':'gust')(hash3(cx,cz,97))]]; ch.lootChests=(ch.lootChests||[]).concat([[x0,y0,z0,'dungeon']]);
      if(hash3(cx,cz,98)<0.3){set(x0+4,y0,z0+4,CHEST,1);ch.lootChests.push([x0+4,y0,z0+4,'dungeon']);} }
    // stronghold: one per world, holds the End portal frame
    if(cx===this.stronghold[0]&&cz===this.stronghold[1]){ const y0=14,x0=3,z0=3;
      for(let x=x0-1;x<=x0+9;x++)for(let z=z0-1;z<=z0+9;z++)for(let y=y0-1;y<=y0+5;y++){ const wall=x===x0-1||x===x0+9||z===z0-1||z===z0+9||y===y0-1||y===y0+5; set(x,y,z,wall?STONE_BRICK:AIR); }
      for(let x=x0+2;x<=x0+6;x++)for(let z=z0+2;z<=z0+6;z++){ const ring=(x===x0+2||x===x0+6||z===z0+2||z===z0+6), corner=(x===x0+2||x===x0+6)&&(z===z0+2||z===z0+6); if(ring&&!corner)set(x,y0,z,END_FRAME); else if(!ring)set(x,y0-1,z,LAVA); }
      set(x0,y0,z0,CHEST); set(x0+8,y0,z0+8,CHEST,1); ch.lootChests=[[x0,y0,z0,'stronghold'],[x0+8,y0,z0+8,'stronghold']]; set(x0+8,y0,z0,TORCH); set(x0,y0,z0+8,TORCH); set(x0+4,y0+4,z0+4,GLOWSTONE);
      ch.spawners=[[x0+8,y0,z0+4,'zombie']]; set(x0+8,y0,z0+4,SPAWNER); }
    if(this.portalCenter===undefined){ const s=this.stronghold; this.portalCenter=[s[0]*CX+7,14,s[1]*CZ+7]; }
  }
}
// ---------------------------------------------------------------------
// Nether: netherrack caverns, lava sea, glowstone, quartz, soul sand, fortresses
// ---------------------------------------------------------------------
const FORT_Y=64;
class NetherGen{
  constructor(seed){this.nA=new Simplex(seed*3+7);this.nB=new Simplex(seed*5+11);}
  // fortress layout: one per 7x7-chunk region (60%), a cross of corridors with rooms at the centre and the four ends
  fortressPiece(cx,cz){ const R=7,rx=Math.floor(cx/R),rz=Math.floor(cz/R); if(hash3(rx,rz,71)>0.6)return null;
    const dx=cx-(rx*R+3),dz=cz-(rz*R+3);
    if(dx===0&&dz===0)return 'center'; if(dz===0&&Math.abs(dx)<=2)return 'cx'; if(dx===0&&Math.abs(dz)<=2)return 'cz';
    if(dz===0&&dx===3)return 'wart'; if(dz===0&&dx===-3)return 'blaze'; if(dx===0&&Math.abs(dz)===3)return dz>0?'chestS':'chestN'; return null; }
  fortressCenterNear(x,z){ const R=7,cx=Math.floor(x/16),cz=Math.floor(z/16); let best=null,bd=1e9;
    for(let rx=Math.floor(cx/R)-3;rx<=Math.floor(cx/R)+3;rx++)for(let rz=Math.floor(cz/R)-3;rz<=Math.floor(cz/R)+3;rz++){ if(hash3(rx,rz,71)>0.6)continue; const fx=(rx*R+3)*16+8,fz=(rz*R+3)*16+8,d=Math.hypot(fx-x,fz-z); if(d<bd){bd=d;best=[fx,FORT_Y,fz];} } return best; }
  generate(ch){ const B=ch.blocks,ox=ch.cx*CX,oz=ch.cz*CZ;
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const wx=ox+x,wz=oz+z; const soul=this.nB.noise2D(wx*0.05,wz*0.05)>0.45;
      for(let y=0;y<CY;y++){ let b;
        if(y===0||y===CY-1||(y===1&&hash3(wx,y,wz)<0.6)||(y===CY-2&&hash3(wx,y,wz)<0.6))b=BEDROCK;
        else{ const d=this.nA.noise3D(wx*0.04,y*0.05,wz*0.04)+(y<12?(12-y)*0.12:0)+(y>104?(y-104)*0.08:0); if(d>0.05){ b=NETHERRACK; const r=hash3(wx,y,wz); if(r<0.02)b=QUARTZ_ORE; else if(soul&&y>=31&&y<=36)b=SOUL_SAND; } else b=y<=31?LAVA:AIR; }
        B[idx(x,y,z)]=b; } }
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++)for(let y=2;y<CY-2;y++){ if(B[idx(x,y,z)]===AIR&&B[idx(x,y+1,z)]===NETHERRACK&&hash3(ox+x,y,oz+z)<0.012){ B[idx(x,y+1,z)]=GLOWSTONE; if(hash3(ox+x,y,oz+z+5)<0.5)B[idx(x,y,z)]=GLOWSTONE; } }
    ch.generated=true; const piece=this.fortressPiece(ch.cx,ch.cz); if(piece)this.buildFortress(ch,piece); }
  buildFortress(ch,piece){
    const B=ch.blocks,M=ch.meta,F=FORT_Y,NB=NETHER_BRICK; ch.fortress=true; ch.spawners=[]; ch.lootChests=[];
    const set=(x,y,z,b,m=0)=>{B[idx(x,y,z)]=b;M[idx(x,y,z)]=m;};
    const box=(x0,x1,y0,y1,z0,z1,b)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)set(x,y,z,b);};
    const pillar=(x0,x1,z0,z1)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)for(let y=F-1;y>1;y--){const b=B[idx(x,y,z)];if(b!==AIR&&!LIQ[b])break;set(x,y,z,NB);}};
    const corrX=(xa,xb)=>{ box(xa,xb,F,F,5,10,NB); box(xa,xb,F+1,F+4,5,5,NB); box(xa,xb,F+1,F+4,10,10,NB); box(xa,xb,F+1,F+4,6,9,AIR); box(xa,xb,F+5,F+5,5,10,NB);
      for(let x=xa;x<=xb;x++)if(x%4===2){set(x,F+2,5,AIR);set(x,F+3,5,AIR);set(x,F+2,10,AIR);set(x,F+3,10,AIR);} };
    const corrZ=(za,zb)=>{ box(5,10,F,F,za,zb,NB); box(5,5,F+1,F+4,za,zb,NB); box(10,10,F+1,F+4,za,zb,NB); box(6,9,F+1,F+4,za,zb,AIR); box(5,10,F+5,F+5,za,zb,NB);
      for(let z=za;z<=zb;z++)if(z%4===2){set(5,F+2,z,AIR);set(5,F+3,z,AIR);set(10,F+2,z,AIR);set(10,F+3,z,AIR);} };
    const room=(open)=>{ box(1,14,F,F,1,14,NB); box(1,14,F+1,F+6,1,14,NB); box(2,13,F+1,F+6,2,13,AIR); box(1,14,F+7,F+7,1,14,NB);
      if(open.includes('w')){corrX(0,0);box(1,1,F+1,F+4,6,9,AIR);} if(open.includes('e')){corrX(15,15);box(14,14,F+1,F+4,6,9,AIR);}
      if(open.includes('n')){corrZ(0,0);box(6,9,F+1,F+4,1,1,AIR);} if(open.includes('s')){corrZ(15,15);box(6,9,F+1,F+4,14,14,AIR);}
      pillar(2,3,2,3);pillar(12,13,2,3);pillar(2,3,12,13);pillar(12,13,12,13); };
    const chest=(x,z,m=0)=>{set(x,F+1,z,CHEST,m);ch.lootChests.push([x,F+1,z,'fortress']);};
    const spawner=(x,z,mob)=>{set(x,F+1,z,SPAWNER);ch.spawners.push([x,F+1,z,mob]);};
    if(piece==='cx'){corrX(0,15);pillar(3,4,6,9);pillar(11,12,6,9);}
    else if(piece==='cz'){corrZ(0,15);pillar(6,9,3,4);pillar(6,9,11,12);}
    else if(piece==='center'){room('wens');spawner(7,7,'ember');chest(3,3);}
    else if(piece==='blaze'){room('e');spawner(5,7,'ember');spawner(10,7,'ember');}
    else if(piece==='wart'){room('w');box(4,11,F,F,9,12,SOUL_SAND);for(let x=4;x<=11;x++)for(let z=9;z<=12;z++)set(x,F+1,z,WART0+hr(ch.cx*16+x,F,ch.cz*16+z,0,2));chest(12,3,1);}
    else if(piece==='chestN'){room('s');chest(4,4);chest(11,4,1);spawner(7,6,'charred');}
    else if(piece==='chestS'){room('n');chest(4,11);chest(11,11,1);spawner(7,9,'charred');}
  }
}
// ---------------------------------------------------------------------
// End: floating end-stone island, obsidian pillars with crystals, exit portal frame
// ---------------------------------------------------------------------
const END_EXIT_Y=64;
class EndGen{
  constructor(seed){this.n=new Simplex(seed*17+3);this.crystals=[];for(let k=0;k<8;k++){const a=k*Math.PI/4;this.crystals.push([Math.round(Math.cos(a)*38),76+((k*5)%8),Math.round(Math.sin(a)*38)]);}}
  generate(ch){ const B=ch.blocks,ox=ch.cx*CX,oz=ch.cz*CZ;
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const wx=ox+x,wz=oz+z,r=Math.hypot(wx,wz); if(r>=72)continue;
      const top=Math.round(60-Math.pow(r/72,2)*10+this.n.noise2D(wx*0.05,wz*0.05)*2.5), bot=Math.round(top-16+(r/72)*10+this.n.noise2D(wx*0.07+50,wz*0.07)*2);
      for(let y=Math.max(1,bot);y<=top;y++)B[idx(x,y,z)]=END_STONE; }
    for(const [px,py,pz] of this.crystals){ if(px+2<ox||px-2>=ox+CX||pz+2<oz||pz-2>=oz+CZ)continue;
      for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){ if(dx*dx+dz*dz>5)continue; const x=px+dx-ox,z=pz+dz-oz; if(x<0||x>=CX||z<0||z>=CZ)continue; for(let y=40;y<=py;y++)B[idx(x,y,z)]=OBSIDIAN; }
      if(px>=ox&&px<ox+CX&&pz>=oz&&pz<oz+CZ)B[idx(px-ox,py+1,pz-oz)]=END_CRYSTAL; }
    for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){ const lx=x-ox,lz=z-oz; if(lx<0||lx>=CX||lz<0||lz>=CZ)continue; const ring=Math.abs(x)===2||Math.abs(z)===2;
      for(let y=55;y<END_EXIT_Y-1;y++)B[idx(lx,y,lz)]=END_STONE; B[idx(lx,END_EXIT_Y-1,lz)]=ring?BEDROCK:END_STONE; B[idx(lx,END_EXIT_Y,lz)]=ring?BEDROCK:AIR; for(let y=END_EXIT_Y+1;y<END_EXIT_Y+6;y++)B[idx(lx,y,lz)]=AIR; }
    ch.generated=true; }
}
