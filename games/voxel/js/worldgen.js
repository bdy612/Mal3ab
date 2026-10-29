'use strict';
// ---------------------------------------------------------------------
// WORLD GENERATION — Overworld (biomes, caves, ores, plants, trees, villages, dungeons, stronghold)
// ---------------------------------------------------------------------
const BIOME={PLAINS:{surface:GRASS,trees:0.004,grass:0.12},FOREST:{surface:GRASS,trees:0.03,grass:0.07},DESERT:{surface:SAND,trees:0,grass:0},SNOW:{surface:SNOW,trees:0.012,grass:0}};
const LOOT={dungeon:[[IRON_INGOT,1,4],[COAL,2,6],[APPLE,1,3],[ARROW,2,8],[GOLD_INGOT,1,2],[DIAMOND,0,1],[ENDER_PEARL,0,1],[EMERALD,0,2],[BOW,0,1],[REDSTONE,0,4],[BONE,0,3],[GUNPOWDER,0,3],[BUCKET,0,1],[SEEDS,0,4]],
  stronghold:[[ENDER_PEARL,1,2],[DIAMOND,1,3],[IRON_INGOT,2,5],[EMERALD,1,3],[APPLE,2,4],[GOLD_INGOT,1,3],[REDSTONE,1,5],[BREAD,1,3]],
  village:[[APPLE,1,4],[WOOL,1,3],[EMERALD,0,2],[IRON_INGOT,0,2],[COAL,1,4],[BREAD,1,3],[SEEDS,1,4],[WHEAT,1,5]],
  fortress:[[WART,2,5],[GOLD_INGOT,1,3],[IRON_INGOT,1,4],[DIAMOND,0,2],[FLINT_STEEL,0,1],[OBSIDIAN,0,3],[BLAZE_ROD,0,2]]};
// grows a tree into a block setter (used by world generation and by saplings)
function treeShape(x,y,z,th,put,canLeaf){ for(let i=1;i<=th;i++)put(x,y+i,z,LOG);
  for(let ly=y+th-2;ly<=y+th+1;ly++){const r=ly>=y+th?1:2;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){ if(r===2&&Math.abs(dx)===2&&Math.abs(dz)===2&&hash3(x+dx,ly,z+dz)>0.5)continue; if(ly===y+th+1&&Math.abs(dx)+Math.abs(dz)>1)continue; if(canLeaf(x+dx,ly,z+dz))put(x+dx,ly,z+dz,LEAVES);}} }
class OverGen{
  constructor(seed){this.nA=new Simplex(seed);this.nB=new Simplex(seed*7+1);this.nC=new Simplex(seed*13+2);
    const a=hash3(1,2,3)*6.283,d=22+hash3(4,5,6)*14; this.stronghold=[Math.round(Math.cos(a)*d),Math.round(Math.sin(a)*d)];}   // chunk coords
  column(x,z){ const cont=fbm2(this.nA,x*0.0015,z*0.0015,4),ero=(fbm2(this.nB,x*0.004+100,z*0.004,3)+1)*0.5,det=fbm2(this.nC,x*0.02,z*0.02,4);
    const base=spline(cont,[[-1,18],[-0.4,30],[-0.15,38],[0.1,44],[0.5,54],[1,80]]);
    // mountain ranges: large regions where ridged noise lifts the land up to ~60 blocks
    const mask=clamp((fbm2(this.nA,x*0.0011-400,z*0.0011+400,2)+0.05)/0.35,0,1), ridge=1-Math.abs(fbm2(this.nB,x*0.0028+300,z*0.0028-200,4));
    const mtn=cont>-0.2?mask*mask*Math.pow(ridge,2.2)*62:0;
    const h=clamp(Math.round(base+det*(3+18*ero)+mtn),4,CY-14);
    const temp=fbm2(this.nA,x*0.0025+777,z*0.0025-333,2),hum=fbm2(this.nB,x*0.0025-555,z*0.0025+999,2);
    const biome=h>92?BIOME.SNOW:temp<-0.3?BIOME.SNOW:(temp>0.25&&hum<-0.05)?BIOME.DESERT:hum>0.05?BIOME.FOREST:BIOME.PLAINS;
    return {h,biome,peak:h>78}; }
  isCave(x,y,z){ const a=this.nA.noise3D(x*0.045,y*0.045,z*0.045); const cheese=this.nC.noise3D(x*0.03,y*0.03,z*0.03)>(y<24?0.62:0.72);
    if(Math.abs(a)>0.085)return cheese; return Math.abs(this.nB.noise3D(x*0.045,y*0.045,z*0.045))<0.085||cheese; }
  villageCenter(cx,cz){ const rx=Math.floor(cx/8),rz=Math.floor(cz/8); if(hash3(rx,rz,91)>0.65)return null; return [rx*8+1+Math.floor(hash3(rx,rz,92)*6),rz*8+1+Math.floor(hash3(rx,rz,93)*6)]; }
  generate(ch){
    const B=ch.blocks,ox=ch.cx*CX,oz=ch.cz*CZ,cols=new Array(CX*CZ);
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){
      const wx=ox+x,wz=oz+z,c=this.column(wx,wz);cols[z*CX+x]=c;const h=c.h; let surface=c.biome.surface; if(c.peak&&h<=92&&hash3(wx,h,wz)<0.35)surface=STONE; if(h<=SEA_LEVEL+1)surface=h<SEA_LEVEL-4?GRAVEL:SAND; const underwater=h<=SEA_LEVEL+1;
      for(let y=0;y<CY;y++){ let b=AIR;
        if(y===0)b=BEDROCK; else if(y<h-3){ b=STONE;const r=hash3(wx,y,wz); if(r<0.011)b=COAL_ORE;else if(y<64&&r<0.017)b=IRON_ORE;else if(y<32&&r<0.0195)b=GOLD_ORE;else if(y<16&&r<0.0208)b=DIAMOND_ORE;else if(y<40&&r<0.0215)b=EMERALD_ORE;else if(y<20&&r<0.0245)b=REDSTONE_ORE; }
        else if(y<h)b=(surface===SAND&&y>=h-2)?SAND:DIRT; else if(y===h)b=surface; else if(y<=SEA_LEVEL)b=WATER;
        if(b!==AIR&&b!==WATER&&b!==BEDROCK&&y>=2&&y<=h&&!(underwater&&y>SEA_LEVEL-3)&&this.isCave(wx,y,wz)) b=y<=10?(hash3(wx,y+99,wz)<0.12?OBSIDIAN:LAVA):AIR;
        B[idx(x,y,z)]=b; } }
    // trees (2-block margin keeps them inside the chunk)
    for(let z=2;z<CZ-2;z++)for(let x=2;x<CX-2;x++){ const c=cols[z*CX+x],h=c.h,wx=ox+x,wz=oz+z; if(c.biome.trees<=0||h<=SEA_LEVEL+1)continue;
      const top=B[idx(x,h,z)];if(top!==GRASS&&top!==SNOW)continue; if(hash3(wx,7,wz)>=c.biome.trees)continue; const th=4+Math.floor(hash3(wx,9,wz)*3);if(h+th+2>=CY)continue;
      treeShape(x,h,z,th,(a,b,c2,v)=>{B[idx(a,b,c2)]=v;},(a,b,c2)=>B[idx(a,b,c2)]===AIR); }
    // tall grass, flowers, sugar cane at the water's edge
    for(let z=0;z<CZ;z++)for(let x=0;x<CX;x++){ const c=cols[z*CX+x],h=c.h,wx=ox+x,wz=oz+z; if(h+3>=CY||B[idx(x,h+1,z)]!==AIR)continue; const top=B[idx(x,h,z)];
      if(top===GRASS){ const r=hash3(wx,11,wz),g=c.biome.grass; if(r<g)B[idx(x,h+1,z)]=TALL_GRASS; else if(r<g+0.004)B[idx(x,h+1,z)]=FLOWER_RED; else if(r<g+0.008)B[idx(x,h+1,z)]=FLOWER_YELLOW; }
      if((top===SAND||top===GRASS)&&h===SEA_LEVEL&&x>0&&x<15&&z>0&&z<15&&hash3(wx,12,wz)<0.3){
        if(B[idx(x+1,h,z)]===WATER||B[idx(x-1,h,z)]===WATER||B[idx(x,h,z+1)]===WATER||B[idx(x,h,z-1)]===WATER){ const n=1+Math.floor(hash3(wx,13,wz)*3); for(let i=1;i<=n;i++)B[idx(x,h+i,z)]=SUGAR_CANE; } } }
    ch.generated=true; this.structures(ch,cols);
  }
  // ---- structures (each piece is built fully inside its own chunk) ----
  structures(ch,cols){
    const B=ch.blocks,M=ch.meta,cx=ch.cx,cz=ch.cz,set=(x,y,z,b,m=0)=>{if(y>=0&&y<CY){B[idx(x,y,z)]=b;M[idx(x,y,z)]=m;}};
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
      set(x0+2,y0,z0+2,SPAWNER); set(x0,y0,z0,CHEST); ch.spawners=[[x0+2,y0,z0+2,hash3(cx,cz,97)<0.6?'zombie':'skeleton']]; ch.lootChests=(ch.lootChests||[]).concat([[x0,y0,z0,'dungeon']]);
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
