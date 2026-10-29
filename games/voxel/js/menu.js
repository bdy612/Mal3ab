'use strict';
// =====================================================================
// MENUS: title screen (worlds, create world, friends, profile, options),
// the Esc pause menu (options, friends, cheats, controls) and the death screen.
// =====================================================================
const titleEl=document.getElementById('title'), pauseEl=document.getElementById('pause'), deathEl=document.getElementById('death');
function E(tag,attrs,...kids){ const e=document.createElement(tag);
  if(attrs)for(const [k,v] of Object.entries(attrs)){ if(v===false||v==null)continue; if(k==='class')e.className=v; else if(k==='style')e.style.cssText=v; else if(k.startsWith('on'))e[k]=v; else if(k==='html')e.innerHTML=v; else if(k==='value')e.value=v; else e.setAttribute(k,v===true?'':v); }
  for(const k of kids.flat(3)){ if(k==null||k===false)continue; e.appendChild(typeof k==='object'?k:document.createTextNode(String(k))); } return e; }
const btn=(label,on,cls='')=>E('button',{class:'mc '+cls,onclick:e=>{ audio(); sfx.click(); on(e); }},label);
function seg(opts,val,on){ const w=E('div',{class:'seg'}); const draw=()=>{ w.innerHTML=''; for(const [v,l] of opts)w.appendChild(E('button',{class:'mc'+(v===val?' on':''),onclick:()=>{ sfx.click(); val=v; draw(); on(v); }},l)); };
  draw(); w.set=v=>{val=v;draw();}; return w; }
function toggle(val,on,labels=['OFF','ON']){ const b=E('button',{class:'mc tog'}); const draw=()=>{ b.textContent=labels[val?1:0]; b.classList.toggle('on',!!val); };
  b.onclick=()=>{ if(b.disabled)return; sfx.click(); val=!val; draw(); on(val); }; draw(); b.set=v=>{val=v;draw();}; return b; }
const field=(label,ctl,hint)=>E('div',{class:'field'},E('span',null,label),ctl,hint?E('small',null,hint):null);
function slider(label,min,max,step,val,fmt,on){ const out=E('span',null,label+': '+fmt(val)); const i=E('input',{type:'range',min,max,step,value:val});
  i.oninput=()=>{ const v=+i.value; out.textContent=label+': '+fmt(v); on(v); }; return E('label',{class:'slider'},out,i); }
function esc(s){ return String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }

// --- screen switching ---
let cleanupFns=[], pauseStack=0;
function screenCleanup(){ for(const f of cleanupFns)try{f();}catch(e){} cleanupFns=[]; friends.onchange=null; }
function show(node,root=titleEl){ screenCleanup(); root.innerHTML=''; root.appendChild(node); root.scrollTop=0; if(node.onShow)node.onShow(); const f=node.querySelector('input.mci[autofocus]'); if(f)setTimeout(()=>f.focus(),0); }
function showTitle(msg){ titleEl.classList.remove('hidden'); pauseEl.classList.add('hidden'); deathEl.classList.add('hidden'); splashText=SPLASHES[Math.floor(Math.random()*SPLASHES.length)]; if(msg)show(messageScreen(msg)); else showHome(); }
// badges / status text update in place (re-drawing the whole menu would eat clicks)
function setBadge(el,n){ if(!el)return; let b=el.querySelector('.badge'); if(!n){ if(b)b.remove(); return; } if(!b){ b=E('span',{class:'badge'}); el.appendChild(b); } b.textContent=n; }
function showHome(){ show(homeScreen()); friends.onchange=()=>{ setBadge(document.getElementById('tFriendsBtn'),friends.incoming.length); const s=document.getElementById('tFriendsStatus'); if(s)s.textContent='Friends: '+friends.statusText(); }; }
function showPauseMain(note){ show(pauseMain(note),pauseEl); friends.onchange=()=>setBadge(document.getElementById('pFriendsBtn'),friends.requests.length); }
function hideTitle(){ screenCleanup(); titleEl.classList.add('hidden'); titleEl.innerHTML=''; }
function messageScreen(msg,buttons){ return E('div',{class:'panel'},E('h2',null,'Voxel Sandbox'),E('p',{class:'desc',style:'font-size:24px'},msg),
  ...(buttons||[btn('Back to title screen',()=>showHome(),'wide')])); }
function confirmScreen(title,text,yes,no,yesLabel='Delete',root=titleEl){ return E('div',{class:'panel'},E('h2',null,title),E('p',{class:'sub'},text),
  E('div',{class:'btnrow',style:'max-width:420px'},btn(yesLabel,yes,'danger'),btn('Cancel',no))); }

// --- avatar preview (the same colours as the in-game player model) ---
function avatarCanvas(skin,scale=3){ const c=E('canvas',{width:16*scale,height:32*scale,class:'ava-c'}),x=c.getContext('2d'),col=PLAYER_COLS[skin%PLAYER_COLS.length];
  const r=(cx,cy,w,h,rgb)=>{ x.fillStyle=`rgb(${rgb})`; x.fillRect(cx*scale,cy*scale,w*scale,h*scale); };
  r(4,0,8,8,[215,175,135]); r(4,0,8,2,[70,45,30]); r(5,4,2,2,[40,30,30]); r(9,4,2,2,[40,30,30]);
  r(4,8,8,12,col); r(0,8,4,12,[215,175,135]); r(12,8,4,12,[215,175,135]); r(0,8,4,4,col); r(12,8,4,4,col); r(4,20,4,12,[60,55,70]); r(8,20,4,12,[52,48,62]); return c; }
let splashText='Now with friends!';
const SPLASHES=['Now with friends!','Punch a tree!','100% blocks!','Mind the Boomers!','Redstone inside!','Also try farming!','Hardcore ready!','Peer to peer!','Bring torches!','Watch out for lava!','Don\'t dig straight down!','Night vision included!','Infinite-ish worlds!'];

// ---------------------------------------------------------------------
// TITLE SCREEN
// ---------------------------------------------------------------------
function homeScreen(){
  const req=friends.incoming.length;
  return E('div',{class:'panel home'},
    E('div',{class:'logo'},E('div',{class:'l1'},'VOXEL'),E('div',{class:'l2'},'SANDBOX'),E('div',{class:'splash'},splashText)),
    btn('Singleplayer',()=>show(worldsScreen()),'wide'),
    E('button',{class:'mc wide',id:'tFriendsBtn',onclick:()=>{sfx.click();show(friendsScreen(titleEl));}},'Friends & Multiplayer',req?E('span',{class:'badge'},req):null),
    E('div',{class:'pair'},btn('Profile',()=>show(profileScreen())),btn('Options',()=>show(optionsScreen(()=>showHome())))),
    E('div',{class:'foot'},E('span',null,'Playing as ',E('b',{style:'color:#ff8;font-weight:normal'},PROFILE.name),'  ·  friend code ',E('b',{style:'color:#ff8;font-weight:normal'},PROFILE.code)),
      E('span',{id:'tFriendsStatus'},`Friends: ${friends.statusText()}`))); }

let selWorld=null;
function worldsScreen(){
  let sel=selWorld&&worldById(selWorld)?selWorld:(WORLDS[0]&&WORLDS.slice().sort((a,b)=>(b.played||b.created)-(a.played||a.created))[0].id);
  const list=E('div',{class:'list'}), search=E('input',{class:'mci',placeholder:'Search worlds...',style:'width:100%;max-width:620px'}), note=E('div',{class:'note'});
  const playB=btn('Play Selected World',()=>{ const m=worldById(sel); if(m)playWorld(m); }), editB=btn('Edit',()=>{ const m=worldById(sel); if(m)show(editScreen(m)); },'sm'),
    delB=btn('Delete',()=>{ const m=worldById(sel); if(m)show(confirmScreen(`Delete "${m.name}"?`,'This world will be lost forever (a long time!). Export it first if you want a backup.',()=>{ deleteWorld(m.id); selWorld=null; show(worldsScreen()); },()=>show(worldsScreen()))); },'sm danger');
  const draw=()=>{ list.innerHTML=''; const q=search.value.toLowerCase(), ws=WORLDS.slice().sort((a,b)=>(b.played||b.created)-(a.played||a.created)).filter(w=>w.name.toLowerCase().includes(q));
    if(!ws.length)list.appendChild(E('div',{class:'empty'},WORLDS.length?'No worlds match your search.':'You have no worlds yet. Create one!'));
    for(const w of ws)list.appendChild(E('div',{class:'wrow'+(w.id===sel?' sel':''),onclick:()=>{ sel=selWorld=w.id; draw(); },ondblclick:()=>playWorld(w)},
      E('div',{class:'thumb',style:w.thumb?`background-image:url(${w.thumb})`:''}),
      E('div',{class:'winfo'},E('b',null,w.name),E('small',{style:w.dead?'color:#f77':w.diff==='hardcore'&&w.mode==='survival'?'color:#f99':''},modeLabel(w)+(w.cheats&&w.diff!=='hardcore'?' · Cheats':'')+(w.type==='flat'?' · Superflat':'')),
        E('small',null,`Last played ${fmtAgo(w.played||w.created)}`))));
    playB.disabled=editB.disabled=delB.disabled=!worldById(sel); };
  search.oninput=draw; draw();
  const imp=E('input',{type:'file',accept:'.json,application/json',style:'display:none',onchange:async e=>{ const f=e.target.files[0]; if(!f)return; const err=importWorldText(await f.text()); if(err){note.textContent=err;note.className='note err';} else show(worldsScreen()); }});
  note.textContent=`Worlds are saved in this browser (${fmtBytes(storageUsed())} used of about 5 MB). Edit → Export makes a backup file.`;
  return E('div',{class:'panel'},E('h2',null,'Select World'),search,list,
    E('div',{class:'btnrow'},playB,btn('Create New World',()=>show(createScreen()))),
    E('div',{class:'btnrow'},editB,delB,btn('Import',()=>imp.click(),'sm'),btn('Back',()=>showHome(),'sm')),imp,note); }

function nextWorldName(){ let n='New World',i=2; while(WORLDS.some(w=>w.name===n))n='New World ('+(i++)+')'; return n; }
function createScreen(){
  const o={mode:'survival',diff:'normal',cheats:false,cheatsTouched:false,type:'default',bonus:false,rules:{...RULE_DEFAULTS}};
  const nameI=E('input',{class:'mci',value:nextWorldName(),maxlength:32,style:'width:100%',autofocus:true}), seedI=E('input',{class:'mci',placeholder:'Leave blank for a random world',style:'width:100%'});
  const desc=E('p',{class:'desc'}), cheatsB=toggle(false,v=>{o.cheats=v;o.cheatsTouched=true;upd();});
  const diffSeg=seg(DIFFS.map(d=>[d,DIFF_NAMES[d]]),o.diff,v=>{o.diff=v;upd();}), diffF=field('Difficulty',diffSeg);
  const modeSeg=seg([['survival','Survival'],['creative','Creative']],o.mode,v=>{ o.mode=v; if(!o.cheatsTouched){o.cheats=v==='creative';cheatsB.set(o.cheats);} upd(); });
  const cheatHint=E('small',null,'');
  const upd=()=>{ diffF.style.display=o.mode==='survival'?'':'none'; const hc=o.mode==='survival'&&o.diff==='hardcore';
    desc.textContent=o.mode==='creative'?'Creative: unlimited blocks, flying, no damage. Build anything!':DIFF_INFO[o.diff];
    cheatsB.disabled=hc; cheatsB.set(o.cheats&&!hc); cheatHint.textContent=hc?'Hardcore worlds never allow cheats.':'Commands like /gamemode, /time and /give, plus the Cheats page in the pause menu (always day, night vision...).'; };
  upd();
  const create=()=>{ const hc=o.mode==='survival'&&o.diff==='hardcore'; const m=newMeta({name:(nameI.value.trim()||'New World').slice(0,32),seed:seedFrom(seedI.value),mode:o.mode,diff:o.mode==='creative'?'normal':o.diff,
      cheats:o.cheats&&!hc,type:o.type,bonus:o.bonus,rules:{...o.rules}}); WORLDS.unshift(m); saveIndex(); selWorld=m.id; playWorld(m); };
  nameI.onkeydown=e=>{ if(e.key==='Enter')create(); };
  return E('div',{class:'panel'},E('h2',null,'Create New World'),
    field('World name',nameI),
    field('Game mode',modeSeg),diffF,desc,
    E('div',{class:'field'},E('span',null,'Allow cheats'),E('div',{class:'row'},cheatsB),cheatHint),
    E('details',null,E('summary',null,'More world options...'),
      field('Seed',seedI,'Type any word or number: the same seed always makes the same world.'),
      E('div',{class:'two'},
        field('World type',seg([['default','Default'],['flat','Superflat']],o.type,v=>o.type=v)),
        field('Time',seg([[true,'Day & night'],[false,'Always day']],true,v=>{ o.rules.daylight=v; })),
        field('Keep inventory after death',toggle(false,v=>o.rules.keepInv=v)),
        field('Mob spawning',toggle(true,v=>o.rules.mobSpawn=v)),
        field('Bonus chest',toggle(false,v=>o.bonus=v),'A chest with tools and food next to you at the start.'))),
    E('div',{class:'btnrow'},btn('Create New World',create),btn('Cancel',()=>show(worldsScreen())))); }

function editScreen(m){
  const nameI=E('input',{class:'mci',value:m.name,maxlength:32,style:'width:100%'}), msg=E('div',{class:'note'}); const hc=m.diff==='hardcore'; const ed={cheats:m.cheats,diff:m.diff,rules:{...m.rules}};
  const save=()=>{ m.name=(nameI.value.trim()||m.name).slice(0,32); m.cheats=ed.cheats&&!hc; m.diff=ed.diff; m.rules=ed.rules; saveIndex(); show(worldsScreen()); };
  return E('div',{class:'panel'},E('h2',null,'Edit World'),
    field('World name',nameI),
    E('div',{class:'note'},`${modeLabel(m)} · ${m.type==='flat'?'Superflat':'Default'} world · seed ${m.seed} · created ${new Date(m.created).toLocaleDateString()}`),
    hc?E('p',{class:'desc'},'Hardcore: difficulty and cheats are locked.'):E('div',{class:'two'},
      field('Allow cheats',toggle(ed.cheats,v=>ed.cheats=v)),
      field('Difficulty',seg(['peaceful','easy','normal','hard'].map(d=>[d,DIFF_NAMES[d]]),ed.diff,v=>ed.diff=v))),
    E('div',{class:'two'},
      field('Time',seg([[true,'Day & night'],[false,'Always day']],ed.rules.daylight,v=>ed.rules.daylight=v)),
      field('Keep inventory',toggle(ed.rules.keepInv,v=>ed.rules.keepInv=v)),
      field('Mob spawning',toggle(ed.rules.mobSpawn,v=>ed.rules.mobSpawn=v))),
    E('div',{class:'btnrow'},btn('Export world file',()=>{ exportWorld(m); msg.textContent='Saved a backup file to your downloads. Import it from the world list any time.'; }),
      btn('Copy seed',()=>{ try{navigator.clipboard.writeText(String(m.seed));msg.textContent='Seed copied.';}catch(e){msg.textContent='Seed: '+m.seed;} })),msg,
    E('div',{class:'btnrow'},btn('Save',save),btn('Cancel',()=>show(worldsScreen())))); }

function profileScreen(){
  const nameI=E('input',{class:'mci',value:PROFILE.name,maxlength:16,style:'width:100%',autofocus:true}), skins=E('div',{class:'skins'});
  const drawSkins=()=>{ skins.innerHTML=''; PLAYER_COLS.forEach((_,i)=>{ const c=avatarCanvas(i,3); if(i===PROFILE.skin%PLAYER_COLS.length)c.classList.add('on'); c.onclick=()=>{ sfx.click(); PROFILE.skin=i; saveProfile(); drawSkins(); }; skins.appendChild(c); }); };
  drawSkins(); const msg=E('div',{class:'note'});
  nameI.oninput=()=>{ PROFILE.name=cleanName(nameI.value); saveProfile(); };
  return E('div',{class:'panel'},E('h2',null,'Profile'),
    field('Username',nameI,'Other players see this name above your head and in chat.'),
    field('Look',skins,'Pick your colours. Friends see them when you play together.'),
    E('div',{class:'field'},E('span',null,'Your friend code'),E('div',{class:'codebox'},E('span',{class:'code'},PROFILE.code),btn('Copy',()=>{ try{navigator.clipboard.writeText(PROFILE.code);msg.textContent='Copied! Send it to a friend.';}catch(e){msg.textContent=PROFILE.code;} })),
      E('small',null,'Give this code to friends so they can add you. It never changes.')),msg,
    btn('Done',()=>{ PROFILE.name=cleanName(nameI.value); saveProfile(); showHome(); },'wide')); }

function optionsScreen(back,root=titleEl){
  const pct=v=>Math.round(v*100)+'%', brightName=v=>v<=0.05?'Moody':v<0.95?Math.round(v*100)+'%':v<1.05?'Bright':v<1.45?'Brighter':'Full bright';
  return E('div',{class:'panel'},E('h2',null,'Options'),
    E('div',{class:'two'},
      slider('FOV',30,110,1,SETTINGS.fov,v=>v===70?'Normal':v>=110?'Quake Pro':v,v=>{SETTINGS.fov=v;saveSettings();}),
      slider('Render distance',2,12,1,SETTINGS.dist,v=>v+' chunks',v=>{SETTINGS.dist=v; if(game.state==='playing')renderDist=v; saveSettings();}),
      slider('Brightness',0,1.5,0.05,SETTINGS.bright,brightName,v=>{SETTINGS.bright=v;saveSettings();}),
      slider('Mouse sensitivity',0.2,3,0.05,SETTINGS.sens,pct,v=>{SETTINGS.sens=v;saveSettings();}),
      slider('Sound volume',0,1,0.05,SETTINGS.vol,v=>v===0?'Off':pct(v),v=>{SETTINGS.vol=v;saveSettings();}),
      field('Invert mouse',toggle(SETTINGS.invert,v=>{SETTINGS.invert=v;saveSettings();}))),
    E('p',{class:'note'},'Brightness above "Bright" also lights up pitch-black caves and nights. F3 shows coordinates and FPS · F5 changes the camera · F1 hides the HUD.'),
    btn('Done',back,'wide')); }

// --- friends (title screen and pause menu share this) ---
function friendsScreen(root){
  const inGame=root===pauseEl, hosting=game.state==='playing'&&game.meta&&!game.meta.remote;
  const status=E('div',{class:'note'}), list=E('div',{class:'list',style:'height:auto;min-height:110px;max-height:34vh'}), extra=E('div',{style:'width:100%;max-width:620px'});
  const addI=E('input',{class:'mci',placeholder:'Friend code, like ABCD-EFGH',maxlength:12,style:'flex:1;min-width:0'}), addMsg=E('div',{class:'note'});
  const add=()=>{ const err=friends.add(addI.value); addMsg.textContent=err||'Added! They show as online when they have the game open.'; addMsg.className='note '+(err?'err':'ok'); if(!err)addI.value=''; };
  addI.onkeydown=e=>{ if(e.key==='Enter')add(); };
  const back=()=>{ if(inGame)showPauseMain(); else showHome(); };
  const fRow=f=>{ const st=f.state, on=f.online&&st;
    let line, join=null;
    if(f.checking&&!st)line=E('span',null,E('i',{class:'dot busy'}),'Checking...');
    else if(!on)line=E('span',null,E('i',{class:'dot off'}),'Offline'+(f.seen?' · last seen '+fmtAgo(f.seen):''));
    else if(st.where==='world')line=E('span',null,E('i',{class:'dot on'}),`Playing "${st.world}" · ${st.mode} · ${st.players} player${st.players>1?'s':''}`);
    else if(st.where==='guest')line=E('span',null,E('i',{class:'dot on'}),`Playing in ${st.host||'someone'}'s world`);
    else line=E('span',null,E('i',{class:'dot on'}),'Online · in the menus');
    if(on&&st.where==='world'){ join=btn(st.joinable?'Join':'Closed',()=>{ if(inGame){ show(confirmScreen('Join '+f.name+'?','Your world will be saved and closed first.',()=>{ quitToTitle(); startJoin(f); },()=>show(friendsScreen(pauseEl),pauseEl),'Join',pauseEl),pauseEl); } else startJoin(f); }); join.disabled=!st.joinable; }
    const avatar=avatarCanvas(f.skin|0,1.5); avatar.className='ava';
    return E('div',{class:'frow'},avatar,E('div',{class:'who'},E('span',null,f.name+'  ',E('small',null,f.code)),E('small',null,line)),join,
      btn('✕',()=>show(confirmScreen('Remove '+f.name+'?','You can add them again later with their friend code.',()=>{ friends.remove(f.code); show(friendsScreen(root),root); },()=>show(friendsScreen(root),root),'Remove',root),root),'danger')); };
  const draw=()=>{ status.textContent='Friends service: '+friends.statusText(); status.className='note'+(friends.status==='online'?' ok':friends.status==='in use'||friends.status==='offline'?' err':'');
    list.innerHTML=''; if(!friends.list.length)list.appendChild(E('div',{class:'empty',style:'padding:20px'},'No friends yet. Ask a friend for their code and add it below.'));
    for(const f of friends.list.slice().sort((a,b)=>(b.online?1:0)-(a.online?1:0)||a.name.localeCompare(b.name)))list.appendChild(fRow(f));
    extra.innerHTML='';
    if(inGame&&friends.requests.length){ extra.appendChild(E('h3',{style:'margin:6px 0;font-weight:normal;color:#8ff'},'Wants to join your world'));
      for(const r of friends.requests.slice())extra.appendChild(E('div',{class:'frow'},E('div',{class:'who'},E('span',null,r.name+'  ',E('small',null,r.code))),btn('Let in',()=>{ friends.accept(r); draw(); }),btn('No',()=>{ friends.decline(r); draw(); },'danger'))); }
    if(friends.incoming.length){ extra.appendChild(E('h3',{style:'margin:6px 0;font-weight:normal;color:#ff8'},'Added you as a friend'));
      for(const r of friends.incoming.slice())extra.appendChild(E('div',{class:'frow'},E('div',{class:'who'},E('span',null,r.name+'  ',E('small',null,r.code))),btn('Add back',()=>{ friends.add(r.code,r.name); draw(); }),btn('Ignore',()=>{ friends.ignore(r.code); draw(); }))); }
    if(inGame&&net.role){ extra.appendChild(E('h3',{style:'margin:6px 0;font-weight:normal'},'Players in this world'));
      extra.appendChild(E('div',{class:'frow'},E('div',{class:'who'},E('span',null,net.name+(net.role==='host'?' (host, you)':' (you)')))));
      for(const r of net.remotes.values())extra.appendChild(E('div',{class:'frow'},E('div',{class:'who'},E('span',null,r.name+(net.role==='guest'&&r.id===0?' (host)':''))),net.role==='host'?btn('Kick',()=>{ net.kick(r.id); setTimeout(draw,600); },'danger'):null)); } };
  draw();
  const node=E('div',{class:'panel'},E('h2',null,'Friends'),
    E('div',{class:'codebox'},E('span',null,'Your friend code'),E('span',{class:'code'},PROFILE.code),btn('Copy',()=>{ try{navigator.clipboard.writeText(PROFILE.code);addMsg.textContent='Copied your code. Send it to a friend!';addMsg.className='note ok';}catch(e){} })),
    status,
    E('div',{class:'btnrow'},addI,btn('Add friend',add)),addMsg,
    list,extra,
    field(hosting?'Who can join this world':'Who can join my worlds',seg([['friends','Friends'],['anyone','Anyone with my code'],['nobody','Nobody']],SETTINGS.allow,v=>{SETTINGS.allow=v;saveSettings();}),
      'Friends join instantly. Anyone else asks first, and you choose Let in or No.'),
    E('div',{class:'btnrow'},btn('Refresh',()=>friends.refresh()),btn('Connect with codes...',()=>openCodesPanel()),btn(inGame?'Back':'Done',back)));
  node.onShow=()=>{ friends.onchange=draw; friends.refresh(); const iv=setInterval(()=>friends.refresh(),15000); cleanupFns.push(()=>clearInterval(iv)); };
  return node; }
function startJoin(f){ show(messageScreen(`Joining ${f.name}'s world...`,[btn('Cancel',()=>{ friends.cancelJoin(); show(friendsScreen(titleEl)); },'wide')]));
  const err=friends.join(f); if(err){ show(messageScreen(err,[btn('Back',()=>show(friendsScreen(titleEl)),'wide')])); return; }
  const t=setTimeout(()=>{ if(friends.joinTarget===f&&!net.guest){ const d=titleEl.querySelector('.desc'); if(d)d.textContent=`Waiting for ${f.name} to let you in... (if you are not on their friends list, they must press Let in)`; } },5000); cleanupFns.push(()=>clearTimeout(t)); }

// ---------------------------------------------------------------------
// PAUSE MENU (Esc)
// ---------------------------------------------------------------------
function openPause(note){ if(game.state!=='playing'||player.dead||window.__noPause)return; if(locked)document.exitPointerLock(); game.paused=true; game.wantThumb=!net.guest; pauseEl.classList.remove('hidden'); showPauseMain(note); }
function resumeGame(){ if(game.state!=='playing'||player.dead)return; screenCleanup(); pauseEl.classList.add('hidden'); pauseEl.innerHTML=''; game.paused=false;
  try{ const p=canvas.requestPointerLock(); if(p&&p.catch)p.catch(()=>{}); }catch(e){}
  setTimeout(()=>{ if(game.state==='playing'&&!locked&&!uiOpen&&!chatOpen&&!player.dead&&pauseEl.classList.contains('hidden')&&mpEl.classList.contains('hidden'))openPause('Click Back to Game (the browser needs a second after Esc before it can grab the mouse again).'); },700); }
function pauseBack(){ const p=pauseEl.firstElementChild; if(p&&!p.classList.contains('pmain')){ showPauseMain(); return true; } return false; }
function pauseMain(note){ const guest=game.meta&&game.meta.remote, req=friends.requests.length;
  const diffB=!guest&&game.meta&&!game.meta.dead&&game.meta.diff!=='hardcore'?btn('Difficulty: '+DIFF_NAMES[game.meta.diff],()=>{ const order=['peaceful','easy','normal','hard']; game.meta.diff=order[(order.indexOf(game.meta.diff)+1)%4]; saveIndex(); net.sendMeta(); showPauseMain(); },'wide'):null;
  const fb=E('button',{class:'mc',id:'pFriendsBtn',onclick:()=>{ sfx.click(); show(friendsScreen(pauseEl),pauseEl); }},'Friends',req?E('span',{class:'badge'},req):null);
  return E('div',{class:'panel pmain'},E('h2',null,'Game Menu'),note?E('p',{class:'desc'},note):null,
    btn('Back to Game',()=>resumeGame(),'wide'),
    E('div',{class:'pair'},btn('Options...',()=>show(optionsScreen(()=>showPauseMain(),pauseEl),pauseEl)),fb),
    E('div',{class:'pair'},cheatsOn()?btn('Cheats...',()=>show(cheatsScreen(),pauseEl)):null,btn('Controls',()=>show(helpScreen(),pauseEl))),
    diffB,
    btn(guest?'Disconnect':'Save and Quit to Title',()=>quitToTitle(),'wide'),
    E('div',{class:'note'},(guest?`Playing in ${net.hostName}'s world "${game.meta.name}"`:`${game.meta?game.meta.name:''} · ${game.meta?modeLabel(game.meta):''}`)+(net.role?' · multiplayer keeps running while this menu is open':' · game paused'))); }
function cheatsScreen(said){ const guest=game.meta&&game.meta.remote, host=!guest, msg=E('div',{class:'note ok'},said||'');
  const say=t=>{ msg.textContent=t; };
  return E('div',{class:'panel'},E('h2',null,'Cheats'),
    field('Game mode',seg([['survival','Survival'],['creative','Creative'],['spectator','Spectator']],gameMode(),v=>{ setGameMode(v); say('Game mode: '+v); }),'Spectator: fly through walls and watch, without touching anything.'),
    host?field('Time of day',E('div',{class:'seg'},...[['sunrise','Sunrise'],['noon','Day'],['sunset','Sunset'],['midnight','Night']].map(([k,l])=>btn(l,()=>{ setTimeOfDay(k); say('Time set to '+l.toLowerCase()); })))):null,
    E('div',{class:'two'},
      host?field('Daylight cycle',seg([[true,'Day & night'],[false,'Stop time']],rule('daylight'),v=>{ game.meta.rules.daylight=v; saveIndex(); net.sendMeta(); say(v?'The sun moves again.':'Time stopped. It stays like this.'); })):null,
      host?field('Always day',btn('Make it always day',()=>{ setTimeOfDay('noon'); game.meta.rules.daylight=false; saveIndex(); net.sendMeta(); show(cheatsScreen('It is always day now. No more night!'),pauseEl); })):null,
      field('Night vision',toggle(!!player.nightVision,v=>{ player.nightVision=v; say(v?'You can see in the dark.':'Night vision off.'); }),'See clearly in caves and at night.'),
      host?field('Keep inventory',toggle(rule('keepInv'),v=>{ game.meta.rules.keepInv=v; saveIndex(); net.sendMeta(); say(v?'You keep your items when you die.':'Items drop when you die.'); })):null,
      host?field('Mob spawning',toggle(rule('mobSpawn'),v=>{ game.meta.rules.mobSpawn=v; saveIndex(); net.sendMeta(); say(v?'Mobs spawn again.':'No new mobs will spawn.'); })):null,
      field('Health & hunger',btn('Heal and feed',()=>{ player.hp=20; player.food=20; player.air=15; say('Healed and fed!'); }))),
    msg,
    E('div',{class:'btnrow'},btn('Give items...',()=>{ pauseEl.classList.add('hidden'); screenCleanup(); game.paused=false; openUI('creative'); }),btn('Back',()=>showPauseMain()))); }
function helpScreen(){ const K=(k,t)=>[E('b',null,k),E('span',null,t)];
  return E('div',{class:'panel'},E('h2',null,'Controls & tips'),
    E('div',{class:'keys'},K('WASD','move'),K('Mouse','look'),K('Space','jump (swim up in water)'),K('W W','double-tap to sprint'),K('Shift','sneak (won\'t fall off edges)'),
      K('Left click','mine / attack (hold)'),K('Right click','place, use, eat, open, flip levers'),K('Middle click','pick block (creative)'),K('1-9 / wheel','choose hotbar slot'),
      K('E','inventory'),K('Q','drop item'),K('T  or  /','chat and commands'),K('F','fly (creative)'),K('F1','hide HUD'),K('F3','debug info'),K('F5','third person'),K('G','switch survival/creative (cheats)'),K('Esc','this menu')),
    E('p',{class:'note'},'Wood → crafting table → pickaxe → stone → copper & iron → diamonds → enchanting (bookshelves make it stronger) → Nether fortress → brewing → eyes of ender → the End.'),
    E('p',{class:'note'},'Mace: Heavy core (rare in dungeon, temple and stronghold chests) + Gust rod (from Gusts, underground). Hit while falling for a smash. Throw a wind charge at your feet to launch up first!'),
    E('p',{class:'note'},'Wolves: right-click with bones to tame, right-click to sit/follow. Boats: place on water, right-click to ride, Shift to get out. Fishing rod: cast, wait for the splash, right-click to reel in. Shield: hold right click to block.'),
    btn('Back',()=>showPauseMain(),'wide')); }

// ---------------------------------------------------------------------
// DEATH SCREEN
// ---------------------------------------------------------------------
const DEATH_MSG={mob:'You were slain',mobfire:'You were burnt by a fireball',explode:'You were blown up',fire:'You burned to death',fall:'You hit the ground too hard',drown:'You drowned',starve:'You starved to death',void:'You fell out of the world',cactus:'You were pricked to death'};
function showDeath(kind){ const hc=difficulty()==='hardcore'; game.paused=false; pauseEl.classList.add('hidden');
  if(hc&&game.meta&&!game.meta.remote){ game.meta.dead=true; saveIndex(); } saveWorld();
  deathEl.innerHTML=''; deathEl.appendChild(E('div',{class:'panel'},E('div',{class:'big'},hc?'Game over!':'You died!'),E('div',{class:'why'},(DEATH_MSG[kind]||'You died')+(player.level?` · score ${player.level}`:'')),
    hc?E('p',{class:'sub'},'This is hardcore: you only had one life. You can still fly around and look at your world.'):null,
    hc?btn('Spectate world',()=>{ deathEl.classList.add('hidden'); player.dead=false; player.hp=20; player.food=20; setGameMode('spectator'); saveWorld(); resumeGame(); },'wide')
      :btn('Respawn',()=>respawn(),'wide'),
    btn('Title screen',()=>{ if(!hc){ respawnSilently(); } quitToTitle(); },'wide')));
  deathEl.classList.remove('hidden'); }
function respawnSilently(){ if(world.dim!=='over')world=dims.over; player.pos=[...player.spawn]; player.vel=[0,0,0]; player.hp=20; player.food=20; player.air=15; player.dead=false; player.fallPeak=player.pos[1]; }
