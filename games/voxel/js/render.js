'use strict';

// ---------------------------------------------------------------------
// RENDERER
// ---------------------------------------------------------------------
const canvas=document.getElementById('gl');const gl=canvas.getContext('webgl2',{antialias:false});
if(!gl){document.getElementById('title').innerHTML='<div class="panel"><h2>WebGL2 is not available in this browser.</h2><p class="sub">Try the latest Chrome, Edge or Firefox.</p></div>';throw new Error('no webgl2');}
// brightness option: 0 = moody, 1 = bright (same curve as the shader), above 1 lifts the darkest light
function gammaBr(b){ const g=Math.min(1,SETTINGS.bright); return b+((1-Math.pow(1-b,4))-b)*g; }
function compile(vs,fs){const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
const chunkProg=compile(`#version 300 es
precision highp float;
layout(location=0) in uvec3 a;
uniform mat4 uVP; uniform vec3 uOff; uniform float uSun; uniform float uLO; uniform float uAmb; uniform float uGamma;
out vec2 vUV; flat out float vLayer; out float vLight; out float vDist; flat out vec3 vTint;
const vec3 TINTS[${TINT_RGB.length}]=vec3[${TINT_RGB.length}](${TINT_RGB.map(c=>'vec3('+c.map(v=>v.toFixed(3)).join(',')+')').join(',')});
const float DL[6]=float[6](0.80,0.80,1.0,0.55,0.68,0.68);
const vec3 OFF[7]=vec3[7](vec3(0.0),vec3(1,0,0),vec3(-1,0,0),vec3(0,1,0),vec3(0,-1,0),vec3(0,0,1),vec3(0,0,-1));
void main(){
  vec3 p=vec3(float(a.x&511u),float((a.x>>9)&4095u),float((a.x>>21)&511u))*0.0625+uOff;
  int n=int(a.z&7u); float ao=float((a.z>>3)&3u); vLayer=float((a.z>>5)&511u); vTint=TINTS[int((a.z>>17)&31u)];
  vUV=vec2(float(a.y&4095u),float((a.y>>12)&4095u))*0.0625; p+=OFF[int((a.z>>14)&7u)]*0.0625;
  float sky=float((a.y>>24)&15u)/15.0, blk=float((a.y>>28)&15u)/15.0;
  float br=uLO>=0.0?uLO:max(sky*uSun,blk); br=mix(br,1.0-pow(1.0-br,4.0),uGamma); float lum=max(uAmb,0.03+0.97*(0.3*br+0.7*br*br));
  vLight=DL[n]*(0.45+0.55*ao/3.0)*lum;
  vec4 cp=uVP*vec4(p,1.0); vDist=cp.w; gl_Position=cp;
}`,`#version 300 es
precision highp float; precision highp sampler2DArray;
in vec2 vUV; flat in float vLayer; in float vLight; in float vDist; flat in vec3 vTint;
uniform sampler2DArray uTex; uniform vec3 uFog; uniform float uFogStart; uniform float uFogEnd; uniform int uMode;
out vec4 o;
void main(){ vec4 c=texture(uTex,vec3(vUV,vLayer)); c.rgb*=vTint;
  if(uMode==2){ if(c.a<0.05) discard; o=vec4(c.rgb*vLight,c.a); return; }
  if(uMode==0&&c.a<0.5) discard;
  float f=clamp((vDist-uFogStart)/(uFogEnd-uFogStart),0.0,1.0); o=vec4(mix(c.rgb*vLight,uFog,f),uMode==1?0.7:1.0); }`);
const lineProg=compile(`#version 300 es
layout(location=0) in vec3 p; uniform mat4 uVP; uniform vec3 uOff; void main(){gl_Position=uVP*vec4(p+uOff,1.0);}`,`#version 300 es
precision mediump float; out vec4 o; void main(){o=vec4(0.0,0.0,0.0,0.8);}`);
const entProg=compile(`#version 300 es
layout(location=0) in vec3 p; layout(location=1) in vec3 n; layout(location=2) in vec3 c;
uniform mat4 uM; uniform mat4 uVP; out vec3 vC; out float vS; out float vDist;
void main(){ vec3 wn=mat3(uM)*n; vS=wn.y>0.5?1.0:(wn.y<-0.5?0.5:(abs(wn.x)>0.5?0.8:0.66)); vC=c; vec4 cp=uVP*uM*vec4(p,1.0); vDist=cp.w; gl_Position=cp; }`,`#version 300 es
precision mediump float; in vec3 vC; in float vS; in float vDist; uniform float uLight; uniform vec4 uTint; uniform vec3 uFog; uniform float uFogStart; uniform float uFogEnd; out vec4 o;
void main(){ vec3 col=mix(vC*vS*uLight,uTint.rgb,uTint.a); float f=clamp((vDist-uFogStart)/(uFogEnd-uFogStart),0.0,1.0); o=vec4(mix(col,uFog,f),1.0); }`);
const U={};for(const [k,p] of Object.entries({vp:[chunkProg,'uVP'],off:[chunkProg,'uOff'],tex:[chunkProg,'uTex'],fog:[chunkProg,'uFog'],fs:[chunkProg,'uFogStart'],fe:[chunkProg,'uFogEnd'],mode:[chunkProg,'uMode'],sun:[chunkProg,'uSun'],lo:[chunkProg,'uLO'],amb:[chunkProg,'uAmb'],gamma:[chunkProg,'uGamma'],
  lvp:[lineProg,'uVP'],loff:[lineProg,'uOff'],eM:[entProg,'uM'],eVP:[entProg,'uVP'],eL:[entProg,'uLight'],eT:[entProg,'uTint'],eFog:[entProg,'uFog'],eFs:[entProg,'uFogStart'],eFe:[entProg,'uFogEnd']}))U[k]=gl.getUniformLocation(p[0],p[1]);

// --- textures ---
const TEX_SIZE=16,texData=new Uint8Array(TEX_SIZE*TEX_SIZE*NUM_LAYERS*4);
function paint(layer,fn){for(let y=0;y<TEX_SIZE;y++)for(let x=0;x<TEX_SIZE;x++){const r=hash3(x,y,layer*131+5),c=fn(x,y,r),o=((layer*TEX_SIZE+y)*TEX_SIZE+x)*4;texData[o]=clamp(c[0],0,255);texData[o+1]=clamp(c[1],0,255);texData[o+2]=clamp(c[2],0,255);texData[o+3]=c[3]??255;}}
const vary=(b,r,k)=>[b[0]+(r-0.5)*k,b[1]+(r-0.5)*k,b[2]+(r-0.5)*k];
const grassC=r=>vary([92,158,58],r,36),dirtC=r=>vary([134,96,67],r,28),stoneC=r=>vary([128,128,128],r,30),snowC=r=>vary([240,245,250],r,10),plankC=(y,r)=>vary(y%4===3?[150,112,65]:[185,143,88],r,14);
const oreC=(seed,col)=>(x,y,r)=>hash3(x>>1,y>>1,seed)>0.77?vary(col,r,20):stoneC(r);
const cobbleC=(x,y,r)=>{const e=hash3(x>>2,y>>2,41)*4;return((x&3)===0||(y&3)===0)?vary([90,90,90],r,20):vary([120+e*8,120+e*8,120+e*8],r,24);};
const border=(x,y)=>x===0||y===0||x===15||y===15;
paint(T.GRASS_TOP,(x,y,r)=>grassC(r));paint(T.GRASS_SIDE,(x,y,r)=>y<3||(y===3&&r>0.5)?grassC(r):dirtC(r));paint(T.DIRT,(x,y,r)=>dirtC(r));
paint(T.STONE,(x,y,r)=>r<0.08?vary([95,95,95],r,10):stoneC(r));paint(T.SAND,(x,y,r)=>vary([219,207,163],r,18));paint(T.WATER,(x,y,r)=>[...vary([40,95,220],r,20),200]);
paint(T.LOG_SIDE,(x,y,r)=>vary([105,78,45],r,16).map(v=>v+((x*5)%7<3?-18:8)));
paint(T.LOG_TOP,(x,y,r)=>{const d=Math.hypot(x-7.5,y-7.5);return d>7?vary([105,78,45],r,16):vary(Math.floor(d)%2?[160,130,80]:[125,95,58],r,10);});
paint(T.LEAVES,(x,y,r)=>vary([52,122,42],r,48));paint(T.SNOW,(x,y,r)=>snowC(r));paint(T.SNOW_SIDE,(x,y,r)=>y<3||(y===3&&r>0.5)?snowC(r):dirtC(r));
paint(T.PLANKS,(x,y,r)=>plankC(y,r));paint(T.COAL,oreC(99,[30,30,30]));paint(T.IRON,oreC(77,[215,170,140]));paint(T.GOLD_ORE,oreC(55,[250,215,60]));paint(T.DIAMOND_ORE,oreC(33,[90,230,240]));paint(T.EMERALD_ORE,oreC(21,[40,210,90]));
paint(T.BEDROCK,(x,y,r)=>vary([65,65,65],r,70));paint(T.GLASS,(x,y,r)=>border(x,y)?[225,240,255,255]:[235,245,255,(x+y)%9===0?255:30]);
paint(T.BRICK,(x,y,r)=>{const row=y>>2,mortar=y%4===3||((x+(row%2?2:0))%6===5);return mortar?vary([180,175,170],r,16):vary([168,70,52],r,24);});
paint(T.STONE_BRICK,(x,y,r)=>{const row=y>>3,mortar=y%8===7||((x+(row%2?4:0))%8===7);return mortar?vary([80,80,80],r,10):vary([135,135,135],r,18);});
paint(T.GRAVEL,(x,y,r)=>vary([128,124,120],r,60));paint(T.COBBLE,cobbleC);
paint(T.LAVA,(x,y,r)=>{const n=hash3(x>>1,y>>1,12);return n>0.6?vary([255,200,60],r,30):vary([225,90,20],r,40);});
paint(T.TORCH,(x,y,r)=>(x===7||x===8)?(y>=4&&y<=6?[255,220,80,255]:y>6&&y<=15?vary([120,90,50],r,20).concat([255]):[0,0,0,0]):[0,0,0,0]);
paint(T.GOLD_BLOCK,(x,y,r)=>vary(border(x,y)?[200,160,40]:[250,215,70],r,20));paint(T.DIAMOND_BLOCK,(x,y,r)=>vary(border(x,y)?[60,180,190]:[110,235,240],r,20));
paint(T.TABLE_TOP,(x,y,r)=>((x>=3&&x<=12&&(y===3||y===12))||(y>=3&&y<=12&&(x===3||x===12)))?vary([90,70,40],r,10):plankC(y,r));
paint(T.TABLE_SIDE,(x,y,r)=>y<3?vary([150,110,60],r,14):(x>=3&&x<=12&&y>=4&&y<=11)?(((x+y)&1)?vary([110,80,45],r,10):vary([190,160,110],r,10)):plankC(y,r));
paint(T.FURNACE_TOP,cobbleC);paint(T.FURNACE_SIDE,cobbleC);
paint(T.FURNACE_FRONT,(x,y,r)=>(x>=4&&x<=11&&y>=6&&y<=13)?(y<9?[25,25,25,255]:vary([50,50,50],r,10)):cobbleC(x,y,r));
paint(T.FURNACE_LIT,(x,y,r)=>(x>=4&&x<=11&&y>=6&&y<=13)?(y<9?[25,25,25,255]:vary(hash3(x,y,5)>0.4?[255,170,40]:[255,90,20],r,30)):cobbleC(x,y,r));
paint(T.CHEST_TOP,(x,y,r)=>border(x,y)?vary([80,55,25],r,10):vary([170,120,55],r,14));
paint(T.CHEST_SIDE,(x,y,r)=>(border(x,y)||y===7)?vary([80,55,25],r,10):vary([170,120,55],r,14));
paint(T.CHEST_FRONT,(x,y,r)=>(x>=7&&x<=8&&y>=6&&y<=9)?[90,90,90,255]:(border(x,y)||y===7)?vary([80,55,25],r,10):vary([170,120,55],r,14));
paint(T.WOOL,(x,y,r)=>vary([235,235,235],r,25));paint(T.BED_TOP,(x,y,r)=>y<5?vary([240,240,240],r,10):vary([190,40,40],r,20));paint(T.BED_SIDE,(x,y,r)=>y<8?vary([190,40,40],r,20):plankC(y,r));
paint(T.OBSIDIAN,(x,y,r)=>vary(hash3(x>>2,y>>2,61)>0.6?[45,25,60]:[20,12,30],r,14));
paint(T.NETHERRACK,(x,y,r)=>vary(hash3(x>>1,y>>1,62)>0.7?[150,60,55]:[110,40,40],r,24));
paint(T.GLOWSTONE,(x,y,r)=>vary(hash3(x>>1,y>>1,63)>0.5?[255,230,140]:[210,160,70],r,24));
paint(T.SOUL_SAND,(x,y,r)=>vary(hash3(x>>1,y>>1,64)>0.8?[40,30,25]:[85,65,50],r,18));
paint(T.QUARTZ_ORE,(x,y,r)=>hash3(x>>1,y>>1,65)>0.75?vary([240,235,230],r,10):vary([110,40,40],r,24));
paint(T.END_STONE,(x,y,r)=>vary(hash3(x>>1,y>>1,66)>0.5?[225,230,170]:[205,210,150],r,14));
paint(T.PORTAL,(x,y,r)=>[...vary([120,40,200],r,70),180]);
paint(T.END_PORTAL,(x,y,r)=>r>0.93?[200,255,230,255]:[...vary([5,10,20],r,10),240]);
paint(T.END_FRAME_TOP,(x,y,r)=>(x>=4&&x<=11&&y>=4&&y<=11)?vary([40,80,60],r,14):vary([200,200,150],r,14));
paint(T.END_FRAME_SIDE,(x,y,r)=>y<4?vary([200,200,150],r,14):vary([170,175,120],r,14));
paint(T.END_FRAME_EYE,(x,y,r)=>(x>=4&&x<=11&&y>=4&&y<=11)?(Math.hypot(x-7.5,y-7.5)<2.5?[40,220,120,255]:vary([20,40,30],r,14)):vary([200,200,150],r,14));
paint(T.END_CRYSTAL,(x,y,r)=>{const d=Math.abs(x-7.5)+Math.abs(y-7.5);return d<5?[230,120,255,255]:d<7?[255,230,255,255]:[0,0,0,0];});
paint(T.SPAWNER,(x,y,r)=>((x&3)===0||(y&3)===0)?vary([40,40,50],r,14):[0,0,0,0]);
paint(T.ENCHANT_TOP,(x,y,r)=>border(x,y)?vary([20,12,30],r,14):(x>=4&&x<=11&&y>=5&&y<=10)?vary([200,40,40],r,20):vary([40,120,110],r,16));
paint(T.ENCHANT_SIDE,(x,y,r)=>y<3?vary([40,120,110],r,16):vary(hash3(x>>2,y>>2,61)>0.6?[45,25,60]:[20,12,30],r,14));
paint(T.XP_ORB,(x,y,r)=>{const d=Math.hypot(x-7.5,y-7.5);return d<4?[160,255,80,255]:d<6?[90,220,60,255]:[0,0,0,0];});
for(let s=0;s<10;s++)paint(T['CRACK'+s],(x,y,r)=>{ let on=false;
  for(let k=0;k<=s;k++){const cx=Math.floor(hash3(k,1,s*7+3)*16),cy=Math.floor(hash3(k,2,s*7+3)*16),dx=hash3(k,3,s)>0.5?1:0,len=4+Math.floor(hash3(k,4,s)*6);
    for(let t=0;t<len;t++){const px=(cx+(dx?t:Math.round(Math.sin(t*1.3)*1.5)))&15,py=(cy+(dx?Math.round(Math.sin(t*1.1)*1.5):t))&15;if(px===x&&py===y)on=true;}}
  return on?[20,20,20,200]:[0,0,0,0];});
function maskTex(layer,rows,pal){paint(layer,(x,y,r)=>{const ch=(rows[y]||'')[x]||' ';if(ch===' ')return[0,0,0,0];return vary(pal[ch],r,18).concat([255]);});}
const PICK=['','     hhhhhhh    ','    hhhhhhhhh   ','   hhh    shhh  ','   hh    s  hh  ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  s             ',' s              '];
const SWORD=['            bb  ','           bbb  ','          bbb   ','         bbb    ','        bbb     ','       bbb      ','      bbb       ','  g  bbb        ','   ggbb         ','    gg          ','   s gg         ','  s             ',' s              '];
const AXE=['','        hhhh    ','       hhhhhh   ','      hhhhhhh   ','      hhhshh    ','       hhs h    ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  s             '];
const SHOVEL=['','          hhh   ','         hhhhh  ','         hhhhh  ','         shhh   ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  s             ','   s            '];
const HELM=['','','     hhhhhh     ','    hhhhhhhh    ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhh    hhh   ','   hhh    hhh   ','   hhh    hhh   '];
const CHESTP=['','  hhh      hhh  ','  hhh      hhh  ','  hhhhhhhhhhhh  ','  hhhhhhhhhhhh  ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   '];
const LEGS=['','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   ','   hhhh  hhhh   '];
const BOOTS=['','','','','   hhh    hhh   ','   hhh    hhh   ','   hhh    hhh   ','   hhh    hhh   ','  hhhh    hhhh  ',' hhhhh    hhhhh ',' hhhhh    hhhhh '];
const INGOT=['','','','','','      hhhhhhh   ','     hhhhhhhhh  ','    hhhhhhhhhh  ','   hhhhhhhhhh   ','   hhhhhhhhh    '];
const GEM=['','','','      hhhh      ','     hhhhhh     ','    hhhhhhhh    ','   hhhhhhhhhh   ','   hhhhhhhhhh   ','    hhhhhhhh    ','     hhhhhh     ','      hhhh      ','       hh       '];
const STK=['','             s  ','            s   ','           s    ','          s     ','         s      ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  s             '];
const MEAT=['','','','      mmmmm     ','    mmmmmmmmm   ','   mmmmmmmmmmm  ','   mmmmmmmmmmm  ','  mmmmmmmmmmmmm ','  mmmmmmmmmmmmm ','   mmmmmmmmmmm  ','   mmmmmmmmmmm  ','    mmmmmmmmm   ','      mmmmm     '];
const APL=['','        s       ','       s        ','     rrrrrr     ','    rrrrrrrr    ','   rrrrrrrrrr   ','   rrrrrrrrrr   ','   rrrrrrrrrr   ','   rrrrrrrrrr   ','    rrrrrrrr    ','     rrrrrr     '];
const ARW=['','            ff  ','           fff  ','          sff   ','         s      ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  hs            ',' hh             ','hh              '];
const BOWM=['','    bbbbbbb     ','   b       b    ','  b         b   ','  b          b  ',' b           b  ',' b            b ',' b            b ',' b            b ',' b           b  ','  b          b  ','  b         b   ','   b       b    ','    bbbbbbb     '];
const SHR=['','    hh      hh  ','    hh      hh  ','     hh    hh   ','      hh  hh    ','       hhhh     ','        hh      ','       hhhh     ','      hh  hh    ','     hh    hh   ','    hh      hh  ','   hh        hh '];
const FLNT=['','','','','     hhhhh      ','    hhhhhhh     ','   hhhhhhhhh    ','   hhhhhhhhh    ','    hhhhhhhh    ','     hhhhhh     ','       hhh      '];
const FSTEEL=['','     hhh        ','    h   h       ','    h           ','    h   h       ','     hhh        ','          ss    ','         ssss   ','        ssssss  ','       ssssss   ','        ssss    ','         ss     '];
const EYEM=['','','','      ggggg     ','     ggggggg    ','    gggwwwggg   ','    ggwwkwwgg   ','    ggwwkwwgg   ','    gggwwwggg   ','     ggggggg    ','      ggggg     '];
const ROD=['','            yy  ','           yyy  ','          yyy   ','         yyy    ','        yyy     ','       yyy      ','      yyy       ','     yyy        ','    yyy         ','   yyy          ','  yy            '];
const PWDR=['','','','','    y  y   y    ','   yyy yy yyy   ','    y yyyyy y   ','   yy yyyyy yy  ','    yyyyyyyyy   ','   y yyyyyyy y  ','      y y y     '];
const TIER={W:[160,120,70],S:[120,120,120],I:[220,220,220],D:[90,230,240]};const stickC=[120,90,50];
maskTex(T.I_STICK,STK,{s:stickC});maskTex(T.I_COAL,GEM,{h:[35,35,35]});maskTex(T.I_IRON,INGOT,{h:[220,220,220]});maskTex(T.I_GOLD,INGOT,{h:[250,215,60]});maskTex(T.I_DIAMOND,GEM,{h:[110,235,240]});
maskTex(T.I_EMERALD,GEM,{h:[50,220,100]});maskTex(T.I_QUARTZ,GEM,{h:[240,235,230]});maskTex(T.I_PEARL,GEM,{h:[30,90,80]});maskTex(T.I_FLINT,FLNT,{h:[50,50,55]});maskTex(T.I_FLINT_STEEL,FSTEEL,{h:[200,200,200],s:[60,60,60]});
maskTex(T.I_EYE,EYEM,{g:[40,200,120],w:[220,255,230],k:[10,10,10]});maskTex(T.I_ROD,ROD,{y:[255,200,60]});maskTex(T.I_POWDER,PWDR,{y:[255,180,40]});
for(const [k,c] of Object.entries(TIER)){maskTex(T['I_PICK_'+k],PICK,{h:c,s:stickC});maskTex(T['I_SWORD_'+k],SWORD,{b:c,g:[90,70,40],s:stickC});maskTex(T['I_AXE_'+k],AXE,{h:c,s:stickC});maskTex(T['I_SHOVEL_'+k],SHOVEL,{h:c,s:stickC});}
for(const k of ['I','D']){maskTex(T['I_HELM_'+k],HELM,{h:TIER[k]});maskTex(T['I_CHEST_'+k],CHESTP,{h:TIER[k]});maskTex(T['I_LEGS_'+k],LEGS,{h:TIER[k]});maskTex(T['I_BOOTS_'+k],BOOTS,{h:TIER[k]});}
maskTex(T.I_PORK,MEAT,{m:[240,150,150]});maskTex(T.I_PORK_C,MEAT,{m:[190,120,70]});maskTex(T.I_BEEF,MEAT,{m:[200,70,70]});maskTex(T.I_BEEF_C,MEAT,{m:[120,70,40]});
maskTex(T.I_MUTTON,MEAT,{m:[220,100,110]});maskTex(T.I_MUTTON_C,MEAT,{m:[150,90,60]});maskTex(T.I_ROTTEN,MEAT,{m:[120,110,60]});maskTex(T.I_APPLE,APL,{r:[220,40,40],s:[90,60,30]});
maskTex(T.I_ARROW,ARW,{f:[220,220,220],s:stickC,h:[200,200,200]});maskTex(T.I_BOW,BOWM,{b:[140,100,55]});maskTex(T.I_SHEARS,SHR,{h:[210,210,210]});
// --- farming, nether fortress, brewing, redstone textures ---
const CLEAR=[0,0,0,0], A=c=>c.concat([255]);
paint(T.FARMLAND,(x,y,r)=>vary(y%4<2?[96,66,42]:[120,85,55],r,14)); paint(T.FARMLAND_WET,(x,y,r)=>vary(y%4<2?[60,40,26]:[78,54,35],r,12));
paint(T.TALL_GRASS,(x,y,r)=>{const hgt=5+Math.floor(hash3(x,0,7)*10);return (x%2===0||hash3(x,1,7)>0.5)&&y>=16-hgt?A(vary([80,150,50],r,40)):CLEAR;});
const flower=(petal)=>(x,y,r)=>{const d=Math.hypot(x-7.5,y-5.5);if(d<1.3)return A([240,220,60]);if(d<3.4)return A(vary(petal,r,30));if((x===7||x===8)&&y>8)return A([60,130,40]);if(y===12&&(x===6||x===9))return A([70,140,45]);return CLEAR;};
paint(T.FLOWER_RED,flower([220,30,30])); paint(T.FLOWER_YELLOW,flower([250,220,40]));
paint(T.SAPLING,(x,y,r)=>{if((x===7||x===8)&&y>=9)return A(vary([110,80,45],r,16));const d=Math.hypot(x-7.5,y-6);return d<5&&hash3(x,y,8)>0.2?A(vary([50,130,40],r,40)):CLEAR;});
for(let s=0;s<4;s++)paint(T['WHEAT'+s],(x,y,r)=>{const hgt=4+s*3.5+hash3(x,2,9)*2; if(x%3===1||y<16-hgt)return CLEAR; const ripe=[[90,170,50],[140,180,60],[190,180,70],[210,175,80]][s]; return A(vary(s===3&&y<16-hgt+4?[170,130,50]:ripe,r,30));});
paint(T.CANE,(x,y,r)=>{const st=(x>=3&&x<=4)||(x>=8&&x<=9)||(x>=12&&x<=13); if(!st)return (x===5&&y%6===2)||(x===10&&y%7===4)?A([100,170,70]):CLEAR; return A(vary(y%5===0?[110,160,70]:[150,200,100],r,16));});
for(let s=0;s<3;s++)paint(T['WART'+s],(x,y,r)=>{const rad=1.5+s*1.3; for(const cx of [4,8,12]){const cy=15-rad; if(Math.hypot(x-cx,y-cy)<rad)return A(vary(s===2?[200,40,45]:[150,35,40],r,30));} return (x%4===0&&y>12)?A([110,30,30]):CLEAR;});
paint(T.NETHER_BRICK,(x,y,r)=>{const row=y>>2,mortar=y%4===3||((x+(row%2?4:0))%8===7);return mortar?vary([30,12,15],r,8):vary([70,30,35],r,16);});
paint(T.BREWING,(x,y,r)=>{if((x===7||x===8)&&y>=2&&y<=12)return A([110,110,110]);if(y>=13&&x>=2&&x<=13)return A(vary([70,70,75],r,14));if(y>=8&&y<=12&&((x>=2&&x<=4)||(x>=11&&x<=13)))return A(vary([170,200,230],r,20));if(y===1&&(x===7||x===8))return A([230,200,60]);return CLEAR;});
paint(T.REDSTONE_ORE,oreC(17,[200,25,25]));
const wire=(c)=>(x,y,r)=>((x>=6&&x<=9)||(y>=6&&y<=9))?A(vary(c,r,24)):CLEAR;
paint(T.WIRE_OFF,wire([95,12,10])); paint(T.WIRE_ON,wire([255,40,30]));
const rtorch=(c)=>(x,y,r)=>(x===7||x===8)?(y>=4&&y<=6?A(c):y>6&&y<=15?A(vary([120,90,50],r,20)):CLEAR):CLEAR;
paint(T.RTORCH_ON,rtorch([255,50,30])); paint(T.RTORCH_OFF,rtorch([90,30,30]));
const lever=(on)=>(x,y,r)=>{if(x>=4&&x<=11&&y>=9&&y<=14)return A(vary([110,110,110],r,20)); const t=(11-y)/8; if(y>=3&&y<=11){const hx=Math.round(8+(on?4:-4)*t); if(x===hx||x===hx+1)return A(y<=4?(on?[230,40,30]:[120,90,60]):[130,95,55]);} return CLEAR;};
paint(T.LEVER_OFF,lever(false)); paint(T.LEVER_ON,lever(true));
paint(T.BUTTON,(x,y,r)=>x>=5&&x<=10&&y>=6&&y<=9?A(vary(x===5||x===10||y===6||y===9?[95,95,95]:[140,140,140],r,14)):CLEAR);
paint(T.PLATE,(x,y,r)=>x>=1&&x<=14&&y>=1&&y<=14?A(vary(x===1||x===14||y===1||y===14?[100,100,100]:[150,150,150],r,12)):CLEAR);
paint(T.LAMP_OFF,(x,y,r)=>vary((x%5===0||y%5===0)?[60,40,25]:[110,75,45],r,14)); paint(T.LAMP_ON,(x,y,r)=>vary((x%5===0||y%5===0)?[200,130,50]:[255,215,130],r,20));
paint(T.TNT_SIDE,(x,y,r)=>y>=6&&y<=9?((y===7||y===8)&&x>=3&&x<=12&&x%3!==2?[40,40,40]:vary([235,235,230],r,10)):vary(x%4===0?[160,30,25]:[205,45,35],r,16));
paint(T.TNT_TOP,(x,y,r)=>Math.hypot(x-7.5,y-7.5)<2?[60,60,60]:vary([205,45,35],r,16)); paint(T.TNT_BOTTOM,(x,y,r)=>vary([170,35,30],r,16));
paint(T.PISTON_FRONT,(x,y,r)=>border(x,y)?vary([120,90,50],r,10):plankC(y,r));
paint(T.PISTON_SIDE,(x,y,r)=>y<4?plankC(y,r):cobbleC(x,y,r));
paint(T.PISTON_BACK,(x,y,r)=>(x>=5&&x<=10&&y>=5&&y<=10)?vary([190,190,195],r,14):cobbleC(x,y,r));
paint(T.PISTON_OPEN,(x,y,r)=>(x>=4&&x<=11&&y>=4&&y<=11)?((x>=6&&x<=9&&y>=6&&y<=9)?vary([150,120,70],r,10):[30,30,30]):cobbleC(x,y,r));
paint(T.PISTON_HEAD,(x,y,r)=>(x>=5&&x<=10&&y>=5&&y<=10)?vary([190,190,195],r,14):border(x,y)?vary([120,90,50],r,10):plankC(y,r));
paint(T.STICKY_FRONT,(x,y,r)=>(x>=3&&x<=12&&y>=3&&y<=12)?vary([110,200,90],r,30):border(x,y)?vary([120,90,50],r,10):plankC(y,r));
paint(T.STICKY_HEAD,(x,y,r)=>(x>=3&&x<=12&&y>=3&&y<=12)?vary([110,200,90],r,30):plankC(y,r));
const repeater=(on)=>(x,y,r)=>{ if(Math.hypot(x-7.5,y-3.5)<1.6||Math.hypot(x-7.5,y-10.5)<1.6)return A(on?[255,60,40]:[100,30,30]); if((x===7||x===8)&&y>=1&&y<=14)return A(on?[200,40,30]:[90,25,20]); if(y===2&&(x===6||x===9))return A(on?[200,40,30]:[90,25,20]); return A(vary([160,160,160],r,14)); };
paint(T.REPEATER_OFF,repeater(false)); paint(T.REPEATER_ON,repeater(true)); paint(T.I_REPEATER,repeater(false));
paint(T.REDSTONE_BLOCK,(x,y,r)=>vary(border(x,y)?[130,10,10]:hash3(x>>1,y>>1,44)>0.7?[220,40,30]:[180,20,15],r,16));
paint(T.DOOR_BOT,(x,y,r)=>(border(x,y)||x===7)?vary([110,80,45],r,10):(x===12&&y===2)?[60,60,60]:vary(x%3===0?[150,112,65]:[175,135,85],r,10));
paint(T.DOOR_TOP,(x,y,r)=>(border(x,y)||x===7||y===8)?vary([110,80,45],r,10):(y<8&&x>1&&x<14)?[190,215,240]:vary(x%3===0?[150,112,65]:[175,135,85],r,10));
const HOE=['','    hhhhhh      ','    hhhhhhs     ','          s     ','         s      ','        s       ','       s        ','      s         ','     s          ','    s           ','   s            ','  s             ',' s              '];
for(const [k,c] of Object.entries(TIER))maskTex(T['I_HOE_'+k],HOE,{h:c,s:stickC});
const SEEDM=['','','','','     s    s     ','   s    s    s  ','      s    s    ','  s   s  s      ','     s      s   ','   s   s  s     ','      s     s   ','    s    s      '];
const WHEATM=['','     y y y      ','    yy yy yy    ','     y y y      ','     yyyyy      ','      yyy       ','      ggg       ','      ggg       ','      ggg       ','     gg gg      ','    gg   gg     ','   gg     gg    '];
const BONEM=['','            ww  ','           wwww ','           www  ','          ww    ','         ww     ','        ww      ','       ww       ','      ww        ','     ww         ','  www           ',' wwww           ','  ww            '];
const BOTTLEM=['','      cccc      ','      gggg      ','      g  g      ','     gg  gg     ','    gffffffg    ','   gffffffffg   ','   gffffffffg   ','   gffffffffg   ','   gffffffffg   ','   gffffffffg   ','    gffffffg    ','     gggggg     '];
const BUCKETM=['','','  hhhhhhhhhhhh  ',' hwwwwwwwwwwwwh ',' hwwwwwwwwwwwwh ','  hddddddddddh  ','  hddddddddddh  ','  hddddddddddh  ','   hddddddddh   ','   hddddddddh   ','   hhhhhhhhhh   '];
const DOORM=['','    pppppppp    ','    pggggggp    ','    pggggggp    ','    pggggggp    ','    pppppppp    ','    pbbbbbbp    ','    pbbbbbbp    ','    pbbbbbbp    ','    pbbbbbkp    ','    pbbbbbbp    ','    pbbbbbbp    ','    pbbbbbbp    ','    pppppppp    '];
maskTex(T.I_SEEDS,SEEDM,{s:[120,160,60]}); maskTex(T.I_WHEAT,WHEATM,{y:[220,180,80],g:[180,160,70]}); maskTex(T.I_BREAD,MEAT,{m:[200,150,80]});
maskTex(T.I_BONE,BONEM,{w:[235,235,225]}); maskTex(T.I_BONE_MEAL,PWDR,{y:[240,240,235]}); maskTex(T.I_SUGAR,PWDR,{y:[250,250,250]}); maskTex(T.I_WART,GEM,{h:[170,35,40]});
maskTex(T.I_REDSTONE,PWDR,{y:[220,30,25]}); maskTex(T.I_GUNPOWDER,PWDR,{y:[85,85,85]});
const bottle=(layer,fill)=>maskTex(layer,BOTTLEM,{c:[130,95,55],g:[215,230,245],f:fill||[175,200,225]});
bottle(T.I_BOTTLE,null); bottle(T.I_WATER_BOTTLE,[55,90,225]); bottle(T.I_AWKWARD,[80,120,220]); bottle(T.I_POT_HEAL,[240,60,90]); bottle(T.I_POT_REGEN,[230,110,200]);
bottle(T.I_POT_STRENGTH,[170,40,40]); bottle(T.I_POT_SPEED,[120,195,235]); bottle(T.I_POT_FIRE,[245,150,50]); bottle(T.I_POT_NIGHT,[45,45,170]);
maskTex(T.I_BUCKET,BUCKETM,{h:[150,150,155],w:[70,70,75],d:[105,105,110]}); maskTex(T.I_WATER_BUCKET,BUCKETM,{h:[150,150,155],w:[50,90,225],d:[105,105,110]});
maskTex(T.I_LAVA_BUCKET,BUCKETM,{h:[150,150,155],w:[240,120,30],d:[105,105,110]}); maskTex(T.I_DOOR,DOORM,{p:[110,80,45],g:[190,215,240],b:[175,135,85],k:[60,60,60]});
// --- building blocks, nature, crops, decoration ---
paint(T.LADDER,(x,y,r)=>(x===2||x===3||x===12||x===13)?A(vary([120,88,50],r,16)):(y%4===1||y%4===2)&&x>3&&x<12?A(vary([150,112,65],r,14)):CLEAR);
paint(T.CACTUS_SIDE,(x,y,r)=>x===0||x===15?CLEAR:A(vary((x===4||x===11)?[45,110,40]:(y%4===0&&(x===3||x===12))?[230,230,190]:[70,150,55],r,16)));
paint(T.CACTUS_TOP,(x,y,r)=>x===0||x===15||y===0||y===15?CLEAR:A(vary(Math.hypot(x-7.5,y-7.5)<3?[120,180,80]:[80,160,60],r,16)));
paint(T.SANDSTONE_TOP,(x,y,r)=>vary([222,210,160],r,12)); paint(T.SANDSTONE_SIDE,(x,y,r)=>vary(y<3?[225,214,165]:y>12?[200,185,135]:(y%4===2?[205,192,140]:[218,205,155]),r,10));
paint(T.CLAY,(x,y,r)=>vary([158,164,176],r,16)); paint(T.MOSSY_COBBLE,(x,y,r)=>hash3(x>>1,y>>1,71)>0.6?vary([80,120,60],r,24):cobbleC(x,y,r));
paint(T.LAPIS_ORE,oreC(81,[40,70,190])); paint(T.LAPIS_BLOCK,(x,y,r)=>vary(border(x,y)?[30,50,140]:hash3(x>>1,y>>1,82)>0.8?[80,120,230]:[40,70,190],r,16));
paint(T.PUMPKIN_TOP,(x,y,r)=>Math.hypot(x-7.5,y-7.5)<1.6?[90,70,30]:vary([210,120,30],r,16)); paint(T.PUMPKIN_SIDE,(x,y,r)=>vary(x%4===0?[180,95,20]:[225,130,35],r,14));
paint(T.JACK_FACE,(x,y,r)=>{const eye=(y>=4&&y<=6)&&((x>=3&&x<=5)||(x>=10&&x<=12)),mouth=(y>=10&&y<=11&&x>=3&&x<=12)||(y===12&&(x===4||x===7||x===8||x===11)); return eye||mouth?vary([255,220,90],r,30):vary(x%4===0?[180,95,20]:[225,130,35],r,14);});
paint(T.MELON_TOP,(x,y,r)=>vary(Math.hypot(x-7.5,y-7.5)<2?[110,150,40]:[120,170,50],r,20)); paint(T.MELON_SIDE,(x,y,r)=>vary(x%5===0||x%5===1?[60,120,30]:[120,175,50],r,18));
paint(T.HAY_TOP,(x,y,r)=>vary(Math.hypot(x-7.5,y-7.5)%3<1?[170,140,40]:[205,175,60],r,20)); paint(T.HAY_SIDE,(x,y,r)=>vary(y===3||y===12?[150,40,30]:x%2?[205,175,60]:[180,150,45],r,16));
paint(T.BOOKSHELF,(x,y,r)=>{ if(y===0||y===15||y===7||y===8)return plankC(y,r); const book=Math.floor(x/2), cols=[[160,40,40],[40,80,160],[60,130,60],[150,110,40],[110,50,130],[40,120,120],[170,90,40],[90,90,90]];
  return vary((y===1||y===9)&&x%2===0?[40,30,20]:cols[(book+(y>8?3:0))%8],r,16); });
paint(T.ICE,(x,y,r)=>[...vary(hash3(x,y,90)>0.92?[235,245,255]:[150,190,245],r,14),190]); paint(T.PACKED_ICE,(x,y,r)=>vary(hash3(x>>1,y>>1,91)>0.7?[190,215,250]:[150,185,240],r,12));
paint(T.DEAD_BUSH,(x,y,r)=>{ const br=(y>=6&&((x+y)%5===0||(x-y+20)%6===0))||((x===7||x===8)&&y>9); return br?A(vary([140,100,50],r,20)):CLEAR; });
const crop=(col,tip,h)=>(x,y,r)=>{ if(x%3===1)return CLEAR; const ht=h+hash3(x,3,7)*3; if(y<16-ht)return CLEAR; return A(vary(y<16-ht+2&&tip?tip:col,r,26)); };
paint(T.CARROT0,crop([70,150,50],null,6)); paint(T.CARROT1,crop([70,160,50],[240,140,30],11)); paint(T.POTATO0,crop([80,150,60],null,5)); paint(T.POTATO1,crop([80,160,60],[210,180,110],10));
paint(T.STEM,(x,y,r)=>(x===7||x===8)&&y>4?A(vary([120,160,60],r,20)):(y===6&&x>8&&x<12)||(y===9&&x<7&&x>3)?A([110,150,50]):CLEAR);
paint(T.FIRE,(x,y,r)=>{ const f=hash3(x,0,93)*10+4+Math.sin(x*1.3)*2; if(y<16-f)return CLEAR; const k=(y-(16-f))/f; return A(k<0.3?[255,240,120]:k<0.6?[255,170,40]:[220,80,20]); });
paint(T.IRON_BLOCK,(x,y,r)=>vary(border(x,y)?[180,180,180]:[225,225,225],r,12)); paint(T.EMERALD_BLOCK,(x,y,r)=>vary(border(x,y)?[30,160,70]:[70,220,110],r,16)); paint(T.COAL_BLOCK,(x,y,r)=>vary([25,25,28],r,16));
paint(T.SPRUCE_LOG,(x,y,r)=>vary([70,48,28],r,14).map(v=>v+((x*7)%5<2?-12:6))); paint(T.SPRUCE_TOP,(x,y,r)=>{const d=Math.hypot(x-7.5,y-7.5);return d>7?vary([70,48,28],r,14):vary(Math.floor(d)%2?[140,105,65]:[110,80,48],r,10);});
paint(T.SPRUCE_LEAVES,(x,y,r)=>vary([45,90,55],r,40)); paint(T.JUNGLE_LOG,(x,y,r)=>vary([95,75,35],r,16).map(v=>v+((y*3+x)%6<2?-15:5))); paint(T.JUNGLE_LEAVES,(x,y,r)=>vary([45,140,35],r,50));
paint(T.VINE,(x,y,r)=>((x+Math.floor(y/3))%5===0||(x*3+y)%11===0)?A(vary([50,120,30],r,30)):CLEAR); paint(T.LILY,(x,y,r)=>{const d=Math.hypot(x-7.5,y-7.5);return d<7&&!(x>7&&Math.abs(y-7.5)<1)?A(vary([40,110,35],r,24)):CLEAR;});
// --- new item icons ---
const DYEM=['','','','      dd        ','     dddd  d    ','    dddddddd    ','   ddddddddd    ','   dddddddddd   ','    dddddddd    ','     dddddd     ','       dd       '];
const ROOT=['','           gg   ','          gggg  ','          ggg   ','         oo     ','        ooo     ','       ooo      ','      ooo       ','     ooo        ','    ooo         ','   oo           ','  o             '];
const LUMP=['','','','     pppp       ','    pppppp      ','   pppppppp     ','   ppppppppp    ','   ppppppppp    ','    pppppppp    ','     pppppp     '];
const SLICE=['','','','','  gggggggggggg  ','  rrrrrrrrrrrr  ','   rrkrrrrkrr   ','    rrrrrrrr    ','     rrkrrr     ','      rrrr      ','       rr       '];
const PIE=['','','','','   cccccccccc   ','  cooooooooooc  ','  cooooooooooc  ','  cccccccccccc  ','   cccccccccc   '];
const EGGM=['','','      eeee      ','     eeeeee     ','    eeeeeeee    ','    eeeeeeee    ','   eeeeeeeeee   ','   eeeeeeeeee   ','   eeeeeeeeee   ','    eeeeeeee    ','     eeeeee     '];
const FEATH=['','            ww  ','          wwww  ','        wwwww   ','       wwwww    ','      wwwww     ','     wwwww      ','    wwww        ','   www          ','  ss            ',' s              '];
const LEG=['','','','     mmmmm      ','    mmmmmmm     ','    mmmmmmmm    ','     mmmmmmm    ','      mmmmm     ','       bb       ','       bb       ','      bbbb      '];
const STR=['','  s             ','   s            ','    ss          ','      s         ','       s        ','        ss      ','          s     ','           s    ','            ss  '];
const BALL=['','','','      ssss      ','     ssssss     ','    ssssssss    ','    ssssssss    ','    ssssssss    ','     ssssss     ','      ssss      '];
const HIDE=['','','   llllllllll   ','  llllllllllll  ','  llllllllllll  ','   llllllllll   ','   llllllllll   ','  llllllllllll  ','  llllllllllll  ','   llllllllll   '];
const FROD=['','             s  ','            s t ','           s  t ','          s   t ','         s    t ','        s     t ','       s      t ','      s       t ','     s        h ','    s           ','   s            '];
const FISHM=['','','','','   ff      f    ','  ffff    ff    ',' ffkfffffffff   ',' ffffffffffff   ','  ffff    ff    ','   ff      f    '];
const DIAL=['','     cccccc     ','    cffffffc    ','   cfffnffffc   ','   cffffnfffc   ','   cfffffnffc   ','   cffffffffc   ','   cffffffffc   ','    cffffffc    ','     cccccc     '];
const SHLD=['','   pppppppppp   ','   pppppippppp  ','   pppppipppp   ','   pppiiiiippp  ','   pppppippppp  ','   pppppipppp   ','    ppppipppp   ','     pppippp    ','      ppppp     ','       ppp      '];
const BOOKM=['','','   bbbbbbbbbb   ','   bwwwwwwwwb   ','   bwwwwwwwwb   ','   bbbbbbbbbb   ','   bbbbbbbbbb   ','   bbbbbbbbbb   ','   bbbbbbbbbb   ','   bbbbbbbbbb   '];
const PAPERM=['','','    wwwwwwww    ','    wwwwwwww    ','    wkkkkkkw    ','    wwwwwwww    ','    wkkkkkww    ','    wwwwwwww    ','    wkkkkkkw    ','    wwwwwwww    '];
const FENCEM=['','  pp        pp  ','  pp        pp  ','  pppppppppppp  ','  pppppppppppp  ','  pp        pp  ','  pp        pp  ','  pppppppppppp  ','  pppppppppppp  ','  pp        pp  ','  pp        pp  ','  pp        pp  '];
const GATEM=['','','  pp        pp  ','  pppppppppppp  ','  pp  pppp  pp  ','  pp pp  pp pp  ','  pppppppppppp  ','  pp        pp  ','  pp        pp  '];
const PANEM=['','  gggggggggggg  ','  gwwwwwwwwwwg  ','  gw        g  ','  gw  w     g  ','  gw   w    g  ','  gw        g  ','  gw     w  g  ','  gw        g  ','  gggggggggggg  '];
const BRICKM=['','','','','','     bbbbbbb    ','    bbbbbbbbb   ','   bbbbbbbbb    ','   bbbbbbbb     '];
const BOATM=['','','','','','  b          b  ',' bbb        bbb ',' bbbbbbbbbbbbbb ','  bbbbbbbbbbbb  ','   bbbbbbbbbb   '];
maskTex(T.I_LAPIS,GEM,{h:[40,70,200]}); maskTex(T.I_DYE,DYEM,{d:[235,235,235]});
maskTex(T.I_CARROT,ROOT,{g:[70,160,50],o:[240,140,30]}); maskTex(T.I_POTATO,LUMP,{p:[200,165,95]}); maskTex(T.I_BAKED_POTATO,LUMP,{p:[190,130,50]});
maskTex(T.I_PUMPKIN_SEEDS,SEEDM,{s:[230,220,170]}); maskTex(T.I_MELON_SEEDS,SEEDM,{s:[40,30,25]}); maskTex(T.I_MELON_SLICE,SLICE,{g:[80,150,40],r:[230,60,60],k:[30,20,20]});
maskTex(T.I_PIE,PIE,{c:[200,150,80],o:[220,120,40]}); maskTex(T.I_EGG,EGGM,{e:[240,225,190]}); maskTex(T.I_FEATHER,FEATH,{w:[245,245,245],s:[200,200,200]});
maskTex(T.I_CHICKEN,LEG,{m:[240,190,170],b:[235,235,225]}); maskTex(T.I_CHICKEN_C,LEG,{m:[200,130,60],b:[235,235,225]}); maskTex(T.I_STRING,STR,{s:[235,235,235]});
maskTex(T.I_SPIDER_EYE,BALL,{s:[140,30,50]}); maskTex(T.I_SLIMEBALL,BALL,{s:[110,200,90]}); maskTex(T.I_LEATHER,HIDE,{l:[150,90,50]}); maskTex(T.I_SNOWBALL,BALL,{s:[245,250,255]});
maskTex(T.I_FISHING_ROD,FROD,{s:stickC,t:[220,220,220],h:[150,150,150]}); maskTex(T.I_FISH,FISHM,{f:[110,160,190],k:[20,20,20]}); maskTex(T.I_FISH_C,FISHM,{f:[190,130,70],k:[20,20,20]});
maskTex(T.I_COMPASS,DIAL,{c:[150,150,155],f:[220,220,225],n:[220,40,40]}); maskTex(T.I_CLOCK,DIAL,{c:[230,190,50],f:[250,240,200],n:[60,60,60]}); maskTex(T.I_SHIELD,SHLD,{p:[160,120,70],i:[150,150,155]});
const LEATHER_C=[150,90,50],GOLD_C=[250,215,60];
maskTex(T.I_HELM_L,HELM,{h:LEATHER_C}); maskTex(T.I_CHEST_L,CHESTP,{h:LEATHER_C}); maskTex(T.I_LEGS_L,LEGS,{h:LEATHER_C}); maskTex(T.I_BOOTS_L,BOOTS,{h:LEATHER_C});
maskTex(T.I_HELM_G,HELM,{h:GOLD_C}); maskTex(T.I_CHEST_G,CHESTP,{h:GOLD_C}); maskTex(T.I_LEGS_G,LEGS,{h:GOLD_C}); maskTex(T.I_BOOTS_G,BOOTS,{h:GOLD_C});
maskTex(T.I_BOOK,BOOKM,{b:[140,60,40],w:[240,235,220]}); maskTex(T.I_PAPER,PAPERM,{w:[240,240,230],k:[180,180,180]}); maskTex(T.I_FENCE,FENCEM,{p:[175,135,85]}); maskTex(T.I_GATE,GATEM,{p:[175,135,85]});
maskTex(T.I_PANE,PANEM,{g:[200,220,240],w:[245,250,255]}); maskTex(T.I_CLAY_BALL,BALL,{s:[160,165,180]}); maskTex(T.I_BRICK,BRICKM,{b:[170,80,55]}); maskTex(T.I_BOAT,BOATM,{b:[150,110,60]});
maskTex(T.I_CAKE,PIE,{c:[240,235,225],o:[200,50,50]});
// copper: orange → teal as it weathers
const COPPER_COLS=[[200,110,75],[165,125,95],[105,150,115],[80,170,140]];
paint(T.COPPER_ORE,(x,y,r)=>hash3(x>>1,y>>1,85)>0.72?vary(hash3(x,y,86)>0.5?[215,120,80]:[110,170,130],r,20):stoneC(r));
COPPER_COLS.forEach((c,i)=>paint(T['COPPER'+i],(x,y,r)=>{ const s=hash3(x>>1,y>>1,87+i); return vary(border(x,y)?c.map(v=>v*0.8):s>0.8?c.map(v=>v*1.12):c,r,16); }));
paint(T.LIGHTNING_ROD,(x,y,r)=>vary(COPPER_COLS[0],r,20));
paint(T.COPPER_TORCH,(x,y,r)=>(x===7||x===8)?(y>=4&&y<=6?A(y===4?[160,255,190]:[90,230,140]):y>6&&y<=15?A(vary([120,90,50],r,20)):CLEAR):CLEAR);
paint(T.COPPER_BARS,(x,y,r)=>(x%4===1||y===1||y===14)?A(vary(COPPER_COLS[0],r,20)):CLEAR);
const CU=[215,120,80];
maskTex(T.I_PICK_C,PICK,{h:CU,s:stickC}); maskTex(T.I_AXE_C,AXE,{h:CU,s:stickC}); maskTex(T.I_SHOVEL_C,SHOVEL,{h:CU,s:stickC}); maskTex(T.I_SWORD_C,SWORD,{b:CU,g:[90,70,40],s:stickC}); maskTex(T.I_HOE_C,HOE,{h:CU,s:stickC});
maskTex(T.I_HELM_C,HELM,{h:CU}); maskTex(T.I_CHEST_C,CHESTP,{h:CU}); maskTex(T.I_LEGS_C,LEGS,{h:CU}); maskTex(T.I_BOOTS_C,BOOTS,{h:CU});
maskTex(T.I_MACE,['','        hhhhh   ','       hhkhhhh  ','       hkhhhkh  ','       hhhhhhh  ','        hhhhh   ','       g        ','      g         ','     g          ','    g           ','   g            ','  g             ',' gg             '],{h:[75,75,85],k:[120,125,140],g:[150,210,230]});
maskTex(T.I_HEAVY_CORE,['','','','     hhhhhh     ','    hkhhhhkh    ','    hhhkkhhh    ','    hhkhhkhh    ','    hkhhhhkh    ','     hhhhhh     '],{h:[70,70,80],k:[130,135,150]});
maskTex(T.I_GUST_ROD,['','            gg  ','           ggg  ','          ggg   ','       w ggg    ','        ggg     ','       ggg w    ','      ggg       ','     ggg        ','  w ggg         ','   ggg          ','  gg            '],{g:[150,210,230],w:[230,250,255]});
maskTex(T.I_WIND_CHARGE,['','','     wwwww      ','    wbbbbbw     ','   wbbwwwbbw    ','   wbwbbbwbw    ','   wbwbwbwbw    ','   wbbwwwbbw    ','    wbbbbbw     ','     wwwww      '],{w:[230,250,255],b:[150,200,235]}); maskTex(T.I_RAW_COPPER,LUMP,{p:[200,115,75]}); maskTex(T.I_COPPER_INGOT,INGOT,{h:[215,120,80]});
maskTex(T.I_LIGHTNING_ROD,['','      cccc      ','      cccc      ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       ','       cc       '],{c:[215,120,80]});
const texArray=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D_ARRAY,texArray);
gl.texImage3D(gl.TEXTURE_2D_ARRAY,0,gl.RGBA,TEX_SIZE,TEX_SIZE,NUM_LAYERS,0,gl.RGBA,gl.UNSIGNED_BYTE,texData);gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.REPEAT);
const iconCache={};
function iconURL(itemId){const I=ITEMS[itemId],layer=I.icon,tint=I.tint??(itemId<256?TINT[itemId]:0),key=layer+'t'+tint;if(iconCache[key])return iconCache[key];const c=document.createElement('canvas');c.width=c.height=TEX_SIZE;const ctx=c.getContext('2d');const img=ctx.createImageData(TEX_SIZE,TEX_SIZE);
  img.data.set(texData.subarray(layer*TEX_SIZE*TEX_SIZE*4,(layer+1)*TEX_SIZE*TEX_SIZE*4)); if(tint){const t=TINT_RGB[tint];for(let p=0;p<img.data.length;p+=4)for(let k=0;k<3;k++)img.data[p+k]=Math.min(255,img.data[p+k]*t[k]);}
  ctx.putImageData(img,0,0);return iconCache[key]=c.toDataURL();}

function uploadMesh(part){if(part.n===0)return null;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Uint32Array(part.v),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribIPointer(0,3,gl.UNSIGNED_INT,12,0);const ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(part.i),gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,vbo,ibo,count:part.i.length};}
function freeMesh(m){if(!m)return;gl.deleteBuffer(m.vbo);gl.deleteBuffer(m.ibo);gl.deleteVertexArray(m.vao);}
function rebuildChunkMesh(world,ch){const m=meshChunk(world,ch);freeMesh(ch.opaque);freeMesh(ch.water);ch.opaque=uploadMesh(m.op);ch.water=uploadMesh(m.wa);ch.dirty=false;}
const cubeCache={},quadCache={};
function cubeMesh(layers,tint=0){const k=layers.join(',')+'t'+tint;if(cubeCache[k])return cubeCache[k];const v=[],i=[];let n=0;
  for(let f=0;f<6;f++){for(let c=0;c<4;c++){const p=CUBE_FACES[f][c];pushV(v,p[0],p[1],p[2],f,3,layers[f],UVS[c][0],UVS[c][1],0,0,tint);}i.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
  return cubeCache[k]=uploadMesh({v,i,n});}
// held / dropped / falling blocks: shaped blocks keep their shape, wool keeps its colour
function blockCube(id,meta=4){ if(SHAPE[id]){ const k='s'+id;if(cubeCache[k])return cubeCache[k]; const d={v:[],i:[],n:0},layers=[0,1,2,3,4,5].map(f=>texFor(id,0,f));
    for(const bx of shapeBoxes(id,SHAPE[id]===2?4:SHAPE[id]===5?0:0,dd=>(SHAPE[id]===3||SHAPE[id]===4)&&(dd===0||dd===1)?id:AIR,false))emitBox(d,0,0,0,bx,layers,TINT[id],null,null); return cubeCache[k]=uploadMesh(d); }
  return cubeMesh([0,1,2,3,4,5].map(f=>texFor(id,meta,f)),TINT[id]);}
function quadMesh(layer,tint=0){const k=layer+'t'+tint;if(quadCache[k])return quadCache[k];const v=[],P=[[0,0],[1,0],[1,1],[0,1]];for(let c=0;c<4;c++)pushV(v,P[c][0],P[c][1],0,2,3,layer,UVS[c][0],UVS[c][1],0,0,tint);return quadCache[k]=uploadMesh({v,i:[0,1,2,0,2,3],n:4});}
const boxVAO=gl.createVertexArray();gl.bindVertexArray(boxVAO);
{const e=-0.003,f=1.003,p=[e,e,e,f,e,e,f,e,f,e,e,f,e,f,e,f,f,e,f,f,f,e,f,f],i=[0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7];const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(i),gl.STATIC_DRAW);}
gl.bindVertexArray(null);
function mat4Mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;}
const mul=(...m)=>m.reduce((a,b)=>mat4Mul(a,b));
function perspective(fov,aspect,n,f){const t=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=t/aspect;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;}
function rotX(a){const c=Math.cos(a),s=Math.sin(a),o=new Float32Array(16);o[0]=1;o[5]=c;o[6]=s;o[9]=-s;o[10]=c;o[15]=1;return o;}
function rotY(a){const c=Math.cos(a),s=Math.sin(a),o=new Float32Array(16);o[0]=c;o[2]=-s;o[5]=1;o[8]=s;o[10]=c;o[15]=1;return o;}
function rotZ(a){const c=Math.cos(a),s=Math.sin(a),o=new Float32Array(16);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;o[10]=1;o[15]=1;return o;}
function translate(x,y,z){const o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;o[12]=x;o[13]=y;o[14]=z;return o;}
function scale(s){const o=new Float32Array(16);o[0]=o[5]=o[10]=s;o[15]=1;return o;}
function frustumPlanes(m){const r=i=>[m[i],m[i+4],m[i+8],m[i+12]];const r0=r(0),r1=r(1),r2=r(2),r3=r(3),P=[];const add=(a,s)=>P.push([r3[0]+s*a[0],r3[1]+s*a[1],r3[2]+s*a[2],r3[3]+s*a[3]]);add(r0,1);add(r0,-1);add(r1,1);add(r1,-1);add(r2,1);add(r2,-1);return P;}
function aabbInFrustum(P,minx,miny,minz,maxx,maxy,maxz){for(const p of P){const x=p[0]>0?maxx:minx,y=p[1]>0?maxy:miny,z=p[2]>0?maxz:minz;if(p[0]*x+p[1]*y+p[2]*z+p[3]<0)return false;}return true;}

// ---------------------------------------------------------------------
// MOB MODELS (pixel units, 16px = 1 block, forward = -z). Original designs.
// ---------------------------------------------------------------------
function legs4(y,xo,zo,sx,sz,col){return[{box:[-xo-sx,0,-zo-sz,-xo,y,-zo],col,anim:1},{box:[xo,0,-zo-sz,xo+sx,y,-zo],col,anim:-1},{box:[-xo-sx,0,zo,-xo,y,zo+sz],col,anim:-1},{box:[xo,0,zo,xo+sx,y,zo+sz],col,anim:1}];}
const humanoid=(leg,body,arm,head,eye)=>[{box:[-4,0,-2,0,12,2],col:leg,anim:1},{box:[0,0,-2,4,12,2],col:leg,anim:-1},{box:[-4,12,-2,4,24,2],col:body},{box:[-8,12,-2,-4,24,2],col:arm,anim:-1},{box:[4,12,-2,8,24,2],col:arm,anim:1},{box:[-4,24,-4,4,32,4],col:head},{box:[-3,27,-5,-1,29,-4],col:eye},{box:[1,27,-5,3,29,-4],col:eye}];
const MOB_TYPES={
  pig:{name:'Pig',w:0.45,h:0.9,hp:10,speed:1.6,passive:true,food:[CARROT,POTATO,WHEAT],xp:2,drops:[[PORK,1,2]],parts:[{box:[-5,6,-8,5,14,8],col:[240,160,165]},{box:[-4,8,-14,4,16,-8],col:[240,160,165]},{box:[-2,9,-15,2,12,-14],col:[220,120,130]},...legs4(6,1,3,4,4,[230,150,155])]},
  cow:{name:'Cow',w:0.45,h:1.4,hp:10,speed:1.4,passive:true,xp:2,drops:[[BEEF,1,3],[LEATHER,0,2]],parts:[{box:[-6,10,-9,6,20,9],col:[90,60,40]},{box:[-4,14,-16,4,22,-8],col:[110,75,50]},{box:[-6,14,-14,-4,16,-12],col:[230,230,230]},{box:[4,14,-14,6,16,-12],col:[230,230,230]},{box:[-3,10,2,3,12,8],col:[230,200,200]},...legs4(10,2,4,4,4,[80,55,38])]},
  sheep:{name:'Sheep',w:0.45,h:1.3,hp:8,speed:1.3,passive:true,xp:2,drops:[[MUTTON,1,2],[WOOL,1,1]],parts:[{box:[-4,8,-8,4,16,8],col:[230,200,200]},{box:[-5,7,-9,5,18,9],col:[235,235,235],wool:true},{box:[-3,12,-14,3,18,-8],col:[225,225,225]},{box:[-3,14,-15,3,17,-14],col:[200,170,170]},...legs4(8,1,4,3,3,[215,215,215])]},
  villager:{name:'Villager',w:0.3,h:1.9,hp:20,speed:1.4,passive:true,trader:true,xp:0,parts:[{box:[-4,0,-3,4,22,3],col:[110,80,60]},{box:[-6,12,-2,6,22,2],col:[130,95,70]},{box:[-4,22,-4,4,32,4],col:[200,160,130]},{box:[-1,24,-6,1,28,-4],col:[190,140,115]},{box:[-3,27,-5,-1,29,-4],col:[40,120,60]},{box:[1,27,-5,3,29,-4],col:[40,120,60]}]},
  zombie:{name:'Zombie',w:0.3,h:1.9,hp:20,speed:2.4,hostile:true,dmg:3,burns:true,xp:5,drops:[[ROTTEN,0,2]],parts:[{box:[-4,0,-2,0,12,2],col:[60,60,140],anim:1},{box:[0,0,-2,4,12,2],col:[60,60,140],anim:-1},{box:[-4,12,-2,4,24,2],col:[40,120,110]},{box:[-8,20,-14,-4,24,-2],col:[80,140,70]},{box:[4,20,-14,8,24,-2],col:[80,140,70]},{box:[-4,24,-4,4,32,4],col:[70,130,65]},{box:[-3,27,-5,-1,29,-4],col:[20,20,20]},{box:[1,27,-5,3,29,-4],col:[20,20,20]}]},
  skeleton:{name:'Skeleton',w:0.3,h:1.9,hp:20,speed:2.2,hostile:true,ranged:true,burns:true,xp:5,drops:[[ARROW,0,2],[BONE,0,2]],parts:[{box:[-3,0,-1,-1,12,1],col:[200,200,195],anim:1},{box:[1,0,-1,3,12,1],col:[200,200,195],anim:-1},{box:[-4,12,-1,4,24,1],col:[190,190,185]},{box:[-6,12,-1,-4,24,1],col:[200,200,195]},{box:[4,18,-12,6,24,-1],col:[200,200,195]},{box:[6,14,-13,7,26,-11],col:[130,95,55]},{box:[-4,24,-4,4,32,4],col:[210,210,205]},{box:[-3,27,-5,-1,29,-4],col:[30,30,30]},{box:[1,27,-5,3,29,-4],col:[30,30,30]}]},
  boomer:{name:'Boomer',w:0.35,h:1.6,hp:16,speed:2.7,hostile:true,fuse:true,xp:5,drops:[[GUNPOWDER,0,2]],parts:[{box:[-5,0,-3,-1,6,2],col:[70,40,30],anim:1},{box:[1,0,-3,5,6,2],col:[70,40,30],anim:-1},{box:[-5,6,-5,5,16,5],col:[225,95,40]},{box:[-4,16,-4,4,23,4],col:[250,205,70]},{box:[-3,18,-5,-1,20,-4],col:[20,20,20]},{box:[1,18,-5,3,20,-4],col:[20,20,20]},{box:[-1,23,-1,1,26,1],col:[120,120,120]},{box:[-2,26,-2,2,28,2],col:[255,80,40]}]},
  shade:{name:'Shade',w:0.3,h:2.8,hp:40,speed:3.6,neutral:true,stare:true,dmg:5,xp:5,drops:[[ENDER_PEARL,0,1]],parts:[{box:[-3,0,-1,-1,28,1],col:[15,15,20],anim:1},{box:[1,0,-1,3,28,1],col:[15,15,20],anim:-1},{box:[-4,28,-2,4,38,2],col:[20,20,25]},{box:[-6,10,-1,-4,38,1],col:[15,15,20]},{box:[4,10,-1,6,38,1],col:[15,15,20]},{box:[-4,38,-4,4,46,4],col:[20,20,25]},{box:[-3,41,-5,-1,42,-4],col:[200,80,255]},{box:[1,41,-5,3,42,-4],col:[200,80,255]}]},
  hogwalker:{name:'Hogwalker',w:0.35,h:1.9,hp:20,speed:2.6,neutral:true,dmg:4,xp:5,drops:[[ROTTEN,0,1],[GOLD_INGOT,0,1]],parts:humanoid([120,80,70],[150,95,85],[150,95,85],[200,130,120],[60,30,30]).concat([{box:[-2,25,-6,2,28,-4],col:[170,100,100]}])},
  ember:{name:'Ember',w:0.35,h:1.1,hp:20,speed:3,hostile:true,fly:true,ranged:true,fire:true,xp:10,drops:[[BLAZE_ROD,0,1]],parts:[{box:[-4,6,-4,4,14,4],col:[255,200,60]},{box:[-3,15,-3,3,17,3],col:[255,120,30]},{box:[-9,4,-1,-7,12,1],col:[240,150,40],spin:true},{box:[7,4,-1,9,12,1],col:[240,150,40],spin:true},{box:[-1,4,-9,1,12,-7],col:[240,150,40],spin:true},{box:[-1,4,7,1,12,9],col:[240,150,40],spin:true},{box:[-2,8,-5,-1,10,-4],col:[20,20,20]},{box:[1,8,-5,2,10,-4],col:[20,20,20]}]},
  dragon:{name:'Dragon',w:1.6,h:2.2,hp:200,speed:12,boss:true,fly:true,xp:500,parts:[{box:[-12,8,-20,12,24,20],col:[40,35,50]},{box:[-8,16,-40,8,28,-20],col:[45,40,55]},{box:[-7,20,-46,7,24,-40],col:[60,50,70]},{box:[-3,25,-43,-1,27,-41],col:[230,60,255]},{box:[1,25,-43,3,27,-41],col:[230,60,255]},{box:[-4,12,20,4,20,52],col:[40,35,50]},{box:[-2,14,52,2,18,70],col:[40,35,50]},
    {box:[12,22,-10,56,23,12],col:[70,30,90],axis:'z',anim:1,pivotPx:[12,22,0]},{box:[-56,22,-10,-12,23,12],col:[70,30,90],axis:'z',anim:-1,pivotPx:[-12,22,0]},{box:[-10,2,-8,-6,8,-2],col:[40,35,50]},{box:[6,2,-8,10,8,-2],col:[40,35,50]},{box:[-10,2,8,-6,8,14],col:[40,35,50]},{box:[6,2,8,10,8,14],col:[40,35,50]}]},
  charred:{name:'Charred skeleton',w:0.35,h:2.1,hp:20,speed:2.6,hostile:true,dmg:6,xp:5,drops:[[BONE,0,2],[COAL,0,1]],parts:humanoid([40,40,42],[50,50,52],[45,45,47],[58,58,60],[255,130,40])},
  chicken:{name:'Chicken',w:0.22,h:0.7,hp:4,speed:1.3,passive:true,chicken:true,flutter:true,food:[SEEDS,PUMPKIN_SEEDS,MELON_SEEDS,WHEAT],xp:1,drops:[[CHICKEN,1,1],[FEATHER,0,2]],
    parts:[{box:[-3,4,-4,3,10,4],col:[240,240,240]},{box:[-2,9,-6,2,15,-3],col:[245,245,245]},{box:[-2,11,-8,2,13,-6],col:[240,170,40]},{box:[-1,9,-7,1,11,-6],col:[210,40,40]},
      {box:[-3,12,-7,-1,13,-6],col:[20,20,20]},{box:[1,12,-7,3,13,-6],col:[20,20,20]},{box:[-4,6,-3,-3,10,3],col:[230,230,230],axis:'z',anim:0.6,pivotPx:[-3,10,0]},{box:[3,6,-3,4,10,3],col:[230,230,230],axis:'z',anim:-0.6,pivotPx:[3,10,0]},
      {box:[-2,0,-1,-1,4,0],col:[230,170,40],anim:1},{box:[1,0,-1,2,4,0],col:[230,170,40],anim:-1}]},
  spider:{name:'Spider',w:0.65,h:0.85,hp:16,speed:3.1,hostile:true,dayNeutral:true,climb:true,dmg:2,xp:5,drops:[[STRING,0,2],[SPIDER_EYE,0,1]],
    parts:[{box:[-5,4,2,5,11,12],col:[45,38,35]},{box:[-3,5,-4,3,9,2],col:[55,48,44]},{box:[-4,4,-10,4,11,-4],col:[40,35,32]},{box:[-3,8,-11,-1,10,-10],col:[220,30,30]},{box:[1,8,-11,3,10,-10],col:[220,30,30]},
      {box:[-2,6,-11,0,7,-10],col:[200,30,30]},{box:[0,6,-11,2,7,-10],col:[200,30,30]},
      ...[-3,-1,1,3].flatMap((z,i)=>[{box:[-16,5,z*1.4-0.5,-3,7,z*1.4+0.5],col:[40,34,30],axis:'z',anim:(i%2?0.35:-0.35),pivotPx:[-3,6,0]},{box:[3,5,z*1.4-0.5,16,7,z*1.4+0.5],col:[40,34,30],axis:'z',anim:(i%2?-0.35:0.35),pivotPx:[3,6,0]}])]},
  wolf:{name:'Wolf',w:0.3,h:0.85,hp:8,speed:3.2,neutral:true,wolf:true,dmg:3,xp:1,
    parts:[{box:[-3,6,-3,3,12,7],col:[205,205,200]},{box:[-4,6,-7,4,13,-2],col:[215,215,210]},{box:[-3,8,-12,3,14,-7],col:[220,220,215]},{box:[-1.5,8,-14,1.5,11,-12],col:[170,160,150]},
      {box:[-1,10,-15,1,11,-14],col:[30,30,30]},{box:[-3,14,-9,-1,16,-8],col:[200,200,195]},{box:[1,14,-9,3,16,-8],col:[200,200,195]},{box:[-2,11,-12.5,-1,12,-12],col:[20,20,20]},{box:[1,11,-12.5,2,12,-12],col:[20,20,20]},
      {box:[-1,9,7,1,11,13],col:[200,200,195]},{box:[-4,8.5,-7.5,4,10,-6.5],col:[200,30,30],collar:true},...legs4(6,1,4,2,2,[200,200,195])]},
  squid:{name:'Squid',w:0.4,h:0.8,hp:10,speed:1.4,passive:true,swim:true,xp:1,drops:[[DYE+14,1,3]],
    parts:[{box:[-4,5,-4,4,15,4],col:[50,70,110]},{box:[-3,10,-4.5,-1,12,-4],col:[230,230,230]},{box:[1,10,-4.5,3,12,-4],col:[230,230,230]},
      ...[[-3,-3],[0,-3],[3,-3],[-3,0],[3,0],[-3,3],[0,3],[3,3]].map(([x,z],i)=>({box:[x-0.8,0,z-0.8,x+0.8,5,z+0.8],col:[60,80,120],anim:i%2?0.5:-0.5,pivotPx:[x,5,z]}))]},
  slime:{name:'Slime',w:0.26,h:0.5,hp:4,speed:2,hostile:true,slime:true,xp:1,drops:[[SLIMEBALL,0,2]],
    parts:[{box:[-4,0,-4,4,8,4],col:[110,190,90]},{box:[-2.5,2,-2.5,2.5,6,2.5],col:[80,150,70]},{box:[-3,5,-4.3,-1,7,-4],col:[20,40,20]},{box:[1,5,-4.3,3,7,-4],col:[20,40,20]},{box:[0,2,-4.3,1,3,-4],col:[20,40,20]}]},
  boat:{name:'Boat',w:0.6,h:0.55,hp:4,speed:0,vehicle:true,drops:[[BOAT,1,1]],
    parts:[{box:[-7,0,-11,7,2,11],col:[130,95,55]},{box:[-8,2,-11,-6,8,11],col:[150,110,65]},{box:[6,2,-11,8,8,11],col:[150,110,65]},{box:[-6,2,-12,6,8,-10],col:[150,110,65]},{box:[-6,2,10,6,8,12],col:[150,110,65]},{box:[-6,5,-2,6,6,2],col:[120,85,48]}]},
  gust:{name:'Gust',w:0.35,h:1.4,hp:30,speed:3,hostile:true,fly:true,ranged:true,wind:true,xp:10,drops:[[GUST_ROD,1,2],[WIND_CHARGE,0,2]],
    parts:[{box:[-3,10,-3,3,16,3],col:[170,215,240]},{box:[-2,12,-3.4,-0.5,14,-3],col:[30,60,90]},{box:[0.5,12,-3.4,2,14,-3],col:[30,60,90]},{box:[-4,16,-4,4,18,4],col:[200,235,250]},
      {box:[-8,4,-1,-6,9,1],col:[150,200,230],spin:true},{box:[6,6,-1,8,11,1],col:[150,200,230],spin:true},{box:[-1,2,6,1,7,8],col:[150,200,230],spin:true},{box:[-1,0,-8,1,5,-6],col:[150,200,230],spin:true},
      {box:[-1.5,2,-1.5,1.5,10,1.5],col:[130,190,225]}]},
  windcharge:{parts:[{box:[-2,-2,-2,2,2,2],col:[200,235,250]},{box:[-3,-1,-1,3,1,1],col:[150,200,235]},{box:[-1,-1,-3,1,1,3],col:[150,200,235]}]},
  bobber:{parts:[{box:[-1.5,0,-1.5,1.5,1.5,1.5],col:[220,30,30]},{box:[-1.5,1.5,-1.5,1.5,3,1.5],col:[240,240,240]}]},
  snowball:{parts:[{box:[-1.5,-1.5,-1.5,1.5,1.5,1.5],col:[245,250,255]}]},
  egg:{parts:[{box:[-1.2,-1.5,-1.2,1.2,1.5,1.2],col:[240,225,190]}]},
  arrow:{parts:[{box:[-0.5,-0.5,-8,0.5,0.5,8],col:[200,200,200]},{box:[-1.5,-1.5,5,1.5,1.5,8],col:[230,230,230]}]},
  fireball:{parts:[{box:[-3,-3,-3,3,3,3],col:[255,170,40]},{box:[-2,-2,-5,2,2,5],col:[255,90,20]}]},
};
function buildMobGeom(def){ const v=[],i=[];let n=0;def.ranges=[];
  for(const part of def.parts){ const [x0,y0,z0,x1,y1,z1]=part.box.map(p=>p/16),c=part.col.map(v=>v/255);const start=i.length;
    const faces=[[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0]],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]],[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]]];
    for(const f of faces){const nr=f[4];for(let k=0;k<4;k++)v.push(...f[k],...nr,...c);i.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
    part.pivot=part.pivotPx?part.pivotPx.map(p=>p/16):[(x0+x1)/2,y1,(z0+z1)/2];def.ranges.push([start,i.length-start]); }
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,36,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,36,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,3,gl.FLOAT,false,36,24);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(i),gl.STATIC_DRAW);gl.bindVertexArray(null);def.vao=vao; }
// remote players in multiplayer: original look, one colour per player slot
const PLAYER_COLS=[[230,120,40],[60,160,90],[150,80,200],[220,200,60],[60,140,220],[220,70,90],[40,170,170],[235,235,235]];
PLAYER_COLS.forEach((c,i)=>{MOB_TYPES['player'+i]={parts:humanoid([60,55,70],c,[215,175,135],[215,175,135],[40,30,30]).concat([{box:[-4,31,-4,4,33,4],col:[70,45,30]}])};});
for(const d of Object.values(MOB_TYPES))buildMobGeom(d);

