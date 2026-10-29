'use strict';

// ---------------------------------------------------------------------
// CHUNK — flat arrays for blocks, light (sky nibble | block nibble) and metadata
//   meta: liquid level / facing / attach direction / wire power / repeater delay
// ---------------------------------------------------------------------
const CX=16,CY=128,CZ=16,SEA_LEVEL=40; const idx=(x,y,z)=>(y*CZ+z)*CX+x;
class Chunk{ constructor(cx,cz){ const n=CX*CY*CZ; this.cx=cx;this.cz=cz;this.blocks=new Uint8Array(n);this.light=new Uint8Array(n);this.meta=new Uint8Array(n);this.generated=false;this.dirty=true;this.opaque=null;this.water=null; } }

let SEED=1;
function hash3(x,y,z){ let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(z|0,1274126177)+Math.imul(SEED,1013904223))|0; h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; }
const G2D=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[1,0],[-1,0],[0,1],[0,-1],[0,1],[0,-1]];
const G3D=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
class Simplex{
  constructor(seed){ const p=new Uint8Array(256);for(let i=0;i<256;i++)p[i]=i;let s=seed>>>0||1;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
    for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]];} this.perm=new Uint8Array(512);this.pm=new Uint8Array(512);for(let i=0;i<512;i++){this.perm[i]=p[i&255];this.pm[i]=this.perm[i]%12;} }
  noise2D(x,y){ const F2=0.3660254037844386,G2=0.21132486540518713;const s=(x+y)*F2,i=Math.floor(x+s),j=Math.floor(y+s),t=(i+j)*G2;const x0=x-(i-t),y0=y-(j-t);const i1=x0>y0?1:0,j1=x0>y0?0:1;
    const x1=x0-i1+G2,y1=y0-j1+G2,x2=x0-1+2*G2,y2=y0-1+2*G2;const ii=i&255,jj=j&255;let n=0;
    let t0=0.5-x0*x0-y0*y0;if(t0>0){t0*=t0;const g=G2D[this.pm[ii+this.perm[jj]]];n+=t0*t0*(g[0]*x0+g[1]*y0);}
    let t1=0.5-x1*x1-y1*y1;if(t1>0){t1*=t1;const g=G2D[this.pm[ii+i1+this.perm[jj+j1]]];n+=t1*t1*(g[0]*x1+g[1]*y1);}
    let t2=0.5-x2*x2-y2*y2;if(t2>0){t2*=t2;const g=G2D[this.pm[ii+1+this.perm[jj+1]]];n+=t2*t2*(g[0]*x2+g[1]*y2);} return 70*n; }
  noise3D(x,y,z){ const F3=1/3,G3=1/6;const s=(x+y+z)*F3,i=Math.floor(x+s),j=Math.floor(y+s),k=Math.floor(z+s),t=(i+j+k)*G3;const x0=x-(i-t),y0=y-(j-t),z0=z-(k-t);let i1,j1,k1,i2,j2,k2;
    if(x0>=y0){if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;}else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;}else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;}}
    else{if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;}else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;}else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;}}
    const x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3,x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3,x3=x0-1+3*G3,y3=y0-1+3*G3,z3=z0-1+3*G3;const ii=i&255,jj=j&255,kk=k&255,P=this.perm,M=this.pm;let n=0;
    let t0=0.6-x0*x0-y0*y0-z0*z0;if(t0>0){t0*=t0;const g=G3D[M[ii+P[jj+P[kk]]]];n+=t0*t0*(g[0]*x0+g[1]*y0+g[2]*z0);}
    let t1=0.6-x1*x1-y1*y1-z1*z1;if(t1>0){t1*=t1;const g=G3D[M[ii+i1+P[jj+j1+P[kk+k1]]]];n+=t1*t1*(g[0]*x1+g[1]*y1+g[2]*z1);}
    let t2=0.6-x2*x2-y2*y2-z2*z2;if(t2>0){t2*=t2;const g=G3D[M[ii+i2+P[jj+j2+P[kk+k2]]]];n+=t2*t2*(g[0]*x2+g[1]*y2+g[2]*z2);}
    let t3=0.6-x3*x3-y3*y3-z3*z3;if(t3>0){t3*=t3;const g=G3D[M[ii+1+P[jj+1+P[kk+1]]]];n+=t3*t3*(g[0]*x3+g[1]*y3+g[2]*z3);} return 32*n; }
}
function fbm2(n,x,y,oct,lac=2,gain=0.5){let a=1,f=1,s=0,norm=0;for(let i=0;i<oct;i++){s+=a*n.noise2D(x*f,y*f);norm+=a;a*=gain;f*=lac;}return s/norm;}
function spline(t,pts){if(t<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++){if(t<=pts[i][0]){const [a,va]=pts[i-1],[b,vb]=pts[i];return va+(vb-va)*(t-a)/(b-a);}}return pts[pts.length-1][1];}
const clamp=(v,a,b)=>v<a?a:v>b?b:v, rand=(a,b)=>a+Math.random()*(b-a), rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const hr=(x,y,z,a,b)=>a+Math.floor(hash3(x,y,z)*(b-a+1));   // deterministic int in [a,b]

