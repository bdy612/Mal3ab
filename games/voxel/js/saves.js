'use strict';
// =====================================================================
// GAME STATE, SETTINGS, PROFILE AND THE WORLD LIST (several save slots)
// Each world is stored as its own localStorage entry; the list keeps the
// name, game mode, difficulty, cheats, game rules and a small thumbnail.
// =====================================================================
const game={state:'title',meta:null,paused:false,view:0,hud:true,debug:false};
const DIFFS=['peaceful','easy','normal','hard','hardcore'];
const DIFF_NAMES={peaceful:'Peaceful',easy:'Easy',normal:'Normal',hard:'Hard',hardcore:'Hardcore'};
const DIFF_INFO={
  peaceful:'No monsters. Health and hunger fill back up on their own.',
  easy:'Monsters spawn but do less damage. Starving stops at 5 hearts.',
  normal:'Monsters do regular damage. Starving can take you down to half a heart.',
  hard:'Monsters hit about 1.5× harder. Starving can kill you.',
  hardcore:'Hard difficulty and only one life. When you die, the world can only be spectated.'};
const RULE_DEFAULTS={daylight:true,keepInv:false,mobSpawn:true};
const RULE_NAMES={daylight:'Daylight cycle',keepInv:'Keep inventory',mobSpawn:'Mob spawning'};

const lsGet=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v)); return true; }catch(e){ return false; } };

// --- options (shared by every world) ---
const SETTINGS=Object.assign({fov:70,sens:1,dist:6,bright:0.35,vol:0.8,invert:false,allow:'friends'},lsGet('voxel-settings',{}));
function saveSettings(){ lsSet('voxel-settings',SETTINGS); }

// --- profile: username, avatar colour and a permanent friend code ---
const CODE_CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode(){ const r=new Uint8Array(8); (window.crypto||{getRandomValues:a=>{for(let i=0;i<a.length;i++)a[i]=Math.random()*256;return a;}}).getRandomValues(r);
  let s=''; for(let i=0;i<8;i++){ s+=CODE_CHARS[r[i]%CODE_CHARS.length]; if(i===3)s+='-'; } return s; }
const PROFILE=Object.assign({name:'Player',skin:0,code:null},lsGet('voxel-profile',{}));
if(!PROFILE.code)PROFILE.code=makeCode();
function saveProfile(){ lsSet('voxel-profile',PROFILE); if(typeof net!=='undefined')net.name=PROFILE.name; }
function cleanName(s){ return String(s||'').replace(/[<>&"]/g,'').trim().slice(0,16)||'Player'; }

// --- world list ---
const WORLDS_KEY='voxel-worlds', WPFX='voxel-world-';
const randomSeed=()=>1+Math.floor(Math.random()*2147483000);
function seedFrom(text){ text=String(text??'').trim(); if(!text)return randomSeed(); if(/^-?\d+$/.test(text))return (Math.abs(parseInt(text,10))%2147483000)||1;
  let h=7; for(const c of text)h=(Math.imul(h,31)+c.charCodeAt(0))|0; return (Math.abs(h)%2147483000)||1; }
function newMeta(o){ return Object.assign({id:'w'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36),name:'New World',seed:randomSeed(),mode:'survival',diff:'normal',
  cheats:false,type:'default',bonus:false,rules:{...RULE_DEFAULTS},created:Date.now(),played:0,thumb:null,dead:false},o); }
let WORLDS=lsGet(WORLDS_KEY,null);
let storageWarned=false;
function storageFull(){ if(storageWarned)return; storageWarned=true; setTimeout(()=>storageWarned=false,30000);
  if(typeof showMsg==='function')showMsg('Browser storage is full! Delete or export old worlds from the world list.'); }
function saveIndex(){ if(!lsSet(WORLDS_KEY,WORLDS)){ // drop thumbnails first if space is tight
    for(const w of WORLDS)if(w.thumb&&(!game.meta||w.id!==game.meta.id))w.thumb=null; if(!lsSet(WORLDS_KEY,WORLDS))storageFull(); } }
function worldById(id){ return WORLDS.find(w=>w.id===id); }
if(!Array.isArray(WORLDS)){ WORLDS=[];
  // bring over the single world from the previous version of the game
  const old=lsGet('voxel-survival-v4',null);
  if(old&&old.seed){ const m=newMeta({name:'My World',seed:old.seed,mode:old.inv&&old.inv.creative?'creative':'survival',cheats:true,played:Date.now()});
    if(old.name&&PROFILE.name==='Player')PROFILE.name=cleanName(old.name);
    if(lsSet(WPFX+m.id,old)){ WORLDS.push(m); try{localStorage.removeItem('voxel-survival-v4');}catch(e){} } }
  saveIndex(); }
for(const w of WORLDS){ w.rules=Object.assign({},RULE_DEFAULTS,w.rules); if(!DIFFS.includes(w.diff))w.diff='normal'; }
saveProfile();

function deleteWorld(id){ try{localStorage.removeItem(WPFX+id);}catch(e){} WORLDS=WORLDS.filter(w=>w.id!==id); saveIndex(); }
function storageUsed(){ let n=0; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); n+=k.length+(localStorage.getItem(k)||'').length; } }catch(e){} return n*2; }
function fmtBytes(n){ return n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'; }
function fmtAgo(t){ if(!t)return 'never'; const s=(Date.now()-t)/1000; if(s<60)return 'just now'; if(s<3600)return Math.floor(s/60)+' min ago'; if(s<86400)return Math.floor(s/3600)+' h ago';
  if(s<86400*30)return Math.floor(s/86400)+' days ago'; return new Date(t).toLocaleDateString(); }
function modeLabel(m){ if(m.dead)return 'Hardcore · game over (spectate only)'; if(m.mode==='creative')return 'Creative'; return 'Survival · '+DIFF_NAMES[m.diff]; }

// export / import a world as a file (backup, or give it to a friend)
function exportWorld(meta){ const save=lsGet(WPFX+meta.id,null); const blob=new Blob([JSON.stringify({format:'voxel-sandbox-world',version:1,meta,save})],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=meta.name.replace(/[^\w\- ]+/g,'_')+'.voxworld.json'; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); }
function importWorldText(text){ let o; try{o=JSON.parse(text);}catch(e){ return 'That file is not a world file.'; }
  if(!o||o.format!=='voxel-sandbox-world'||!o.meta)return 'That file is not a world file.';
  const m=newMeta({...o.meta,id:undefined,played:Date.now()}); m.id='w'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36); m.rules=Object.assign({},RULE_DEFAULTS,m.rules);
  if(WORLDS.some(w=>w.name===m.name))m.name+=' (imported)';
  if(o.save&&!lsSet(WPFX+m.id,o.save))return 'Not enough browser storage to import this world.';
  WORLDS.unshift(m); saveIndex(); return null; }

// small screenshot for the world list (must run right after a frame is drawn)
const thumbCanvas=document.createElement('canvas'); thumbCanvas.width=160; thumbCanvas.height=90;
function captureThumb(){ try{ const c=thumbCanvas.getContext('2d'),gw=document.getElementById('gl'); const r=gw.width/gw.height,tr=160/90; let sw=gw.width,sh=gw.height,sx=0,sy=0;
    if(r>tr){sw=gw.height*tr;sx=(gw.width-sw)/2;}else{sh=gw.width/tr;sy=(gw.height-sh)/2;} c.drawImage(gw,sx,sy,sw,sh,0,0,160,90); return thumbCanvas.toDataURL('image/jpeg',0.7); }catch(e){ return null; } }

// rules / difficulty / cheats for whatever world is loaded (guests get the host's)
function difficulty(){ return game.meta?game.meta.diff:'normal'; }
function rule(name){ const r=game.meta&&game.meta.rules; return r&&name in r?!!r[name]:RULE_DEFAULTS[name]; }
function cheatsOn(){ return !!(game.meta&&game.meta.cheats&&game.meta.diff!=='hardcore'); }
function gameMode(){ return player.spectator?'spectator':inventory.creative?'creative':'survival'; }
function setGameMode(m){ inventory.creative=m==='creative'; player.spectator=m==='spectator'; player.fly=m==='spectator'?true:(m==='creative'?player.fly:false);
  if(m!=='survival'){player.hp=20;player.food=20;} if(typeof updateHotbar==='function')updateHotbar(); }
