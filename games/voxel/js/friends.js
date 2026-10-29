'use strict';
// =====================================================================
// FRIENDS: every player has a permanent friend code (like ABCD-EFGH).
// Add a friend's code once; after that the friends list shows who is online
// and what they are playing, and "Join" connects straight into their world.
// Matchmaking goes through the free PeerJS service (needs internet); the game
// itself still runs peer-to-peer between the two browsers.
// =====================================================================
const PEER_PREFIX='voxsbx-';
function peerServerOpts(){ const o=lsGet('voxel-peer-server',null); // only for testing with a private server
  return o?{host:o.host,port:o.port,path:o.path||'/',secure:!!o.secure,key:o.key||'peerjs',debug:0}:{debug:0}; }
// wrap a PeerJS connection so net.js can treat it like a plain RTCDataChannel
function adaptConn(c){ const a={readyState:c.open?'open':'connecting',onopen:null,onmessage:null,onclose:null,
    send(s){ try{ c.send(s); }catch(e){} }, close(){ try{ c.close(); }catch(e){} }};
  const closed=()=>{ if(a.readyState==='closed')return; a.readyState='closed'; if(a.onclose)a.onclose(); };
  c.on('open',()=>{ if(a.readyState==='open')return; a.readyState='open'; if(a.onopen)a.onopen(); });
  c.on('data',d=>{ if(a.onmessage)a.onmessage({data:d}); }); c.on('close',closed); c.on('error',closed); return a; }

const friends={
  peer:null, status:'off', list:lsGet('voxel-friends',[]), incoming:[], requests:[], onchange:null, retryT:null, joinTarget:null, joinConn:null, joinTimer:null,
  save(){ lsSet('voxel-friends',this.list.map(f=>({code:f.code,name:f.name,skin:f.skin|0,added:f.added,seen:f.seen||0}))); },
  pid(code){ return PEER_PREFIX+String(code).replace(/[^A-Za-z0-9]/g,'').toLowerCase(); },
  normCode(s){ s=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,''); return s.length===8?s.slice(0,4)+'-'+s.slice(4):null; },
  me(){ return {name:PROFILE.name,skin:PROFILE.skin,code:PROFILE.code}; },
  changed(){ if(this.onchange)try{this.onchange();}catch(e){console.error(e);} },
  setStatus(s){ this.status=s; this.changed(); },
  statusText(){ return {off:'Starting...',connecting:'Connecting to the friends service...',online:'Online',reconnecting:'Reconnecting...',offline:'Offline: no internet connection, retrying...',
    'in use':'Your friend code is already open in another tab or window. Close it and reload.',unavailable:'Friends need the PeerJS library and a browser with WebRTC.'}[this.status]||this.status; },
  start(){ if(this.peer)return; if(typeof Peer==='undefined'||!window.RTCPeerConnection){ this.setStatus('unavailable'); return; }
    this.setStatus('connecting'); let p; try{ p=new Peer(this.pid(PROFILE.code),peerServerOpts()); }catch(e){ this.setStatus('offline'); this.scheduleRetry(); return; }
    this.peer=p;
    p.on('open',()=>{ if(this.peer!==p)return; this.retries=0; this.setStatus('online'); this.refresh(); });
    p.on('connection',c=>this.onConn(c));
    // lost the link to the matchmaking server after being online: try to get it back (games already running are not affected)
    p.on('disconnected',()=>{ if(this.peer!==p||p.destroyed||this.status!=='online')return; this.setStatus('reconnecting'); setTimeout(()=>{ if(this.peer===p&&!p.destroyed&&p.disconnected)try{p.reconnect();}catch(e){this.scheduleRetry();} },3000); });
    p.on('error',e=>this.onError(e,p)); },
  scheduleRetry(){ clearTimeout(this.retryT); this.retries=(this.retries||0)+1; this.retryT=setTimeout(()=>{ if(this.peer){ try{this.peer.destroy();}catch(e){} this.peer=null; } this.start(); },Math.min(60000,10000*this.retries)); },
  onError(e,p){ const t=e.type;
    if(t==='peer-unavailable'){ const m=/peer\s+(\S+)/i.exec(e.message||''),id=m&&m[1];
      for(const f of this.list)if(this.pid(f.code)===id){ f.online=false; f.state=null; f.checking=false; }
      if(this.joinTarget&&this.pid(this.joinTarget.code)===id)this.joinFail(this.joinTarget.name+' is offline right now.');
      this.changed(); return; }
    if(t==='unavailable-id'){ this.setStatus('in use'); try{p.destroy();}catch(_){} if(this.peer===p)this.peer=null; return; }
    if(['network','server-error','socket-error','socket-closed','disconnected'].includes(t)){ if(this.status!=='in use'&&this.peer===p){ this.setStatus('offline'); try{p.destroy();}catch(_){} this.peer=null; this.scheduleRetry(); } return; }
    if(t==='browser-incompatible'){ this.setStatus('unavailable'); return; } },
  // what friends see about me when they check
  myStatus(){ const playing=game.state==='playing'&&game.meta; return {t:'status',...this.me(),where:!playing?'menu':game.meta.remote?'guest':'world',
    world:playing?game.meta.name:null,mode:playing?modeLabel(game.meta):null,players:playing?1+net.remotes.size:0,host:playing&&game.meta.remote?net.hostName:null,
    joinable:!!(playing&&!game.meta.remote&&SETTINGS.allow!=='nobody')}; },
  refresh(){ if(this.status!=='online'||!this.peer)return; for(const f of this.list)this.ping(f); },
  ping(f){ if(f.checking)return; f.checking=true; let got=false; let c; try{ c=this.peer.connect(this.pid(f.code),{metadata:{k:'ping',...this.me()},serialization:'raw',reliable:true}); }catch(e){ f.checking=false; return; }
    if(!c){ f.checking=false; return; }
    const to=setTimeout(()=>{ f.checking=false; if(!got){ f.online=false; f.state=null; } try{c.close();}catch(e){} this.changed(); },12000);
    c.on('data',d=>{ let m; try{m=JSON.parse(d);}catch(e){return;} if(m.t!=='status')return; got=true; clearTimeout(to);
      f.online=true; f.state=m; f.name=cleanName(m.name); f.skin=(m.skin|0)%8; f.seen=Date.now(); f.checking=false; this.save(); this.changed(); setTimeout(()=>{try{c.close();}catch(e){}},300); });
    c.on('error',()=>{}); this.changed(); },
  // someone connected to me: a status check or a request to join my world
  onConn(c){ const md=c.metadata||{}, code=this.normCode(md.code); if(!code||code===PROFILE.code){ try{c.close();}catch(e){} return; }
    const name=cleanName(md.name), skin=(md.skin|0)%8, known=this.list.find(f=>f.code===code);
    if(known){ known.name=name; known.skin=skin; known.seen=Date.now(); known.online=true; this.save(); }
    else if(!this.incoming.some(r=>r.code===code)){ this.incoming.push({code,name,skin}); }
    this.changed();
    if(md.k==='ping'){ const send=()=>{ try{c.send(JSON.stringify(this.myStatus()));}catch(e){} setTimeout(()=>{try{c.close();}catch(e){}},4000); }; if(c.open)send(); else c.on('open',send); c.on('error',()=>{}); return; }
    if(md.k!=='join'){ try{c.close();}catch(e){} return; }
    const deny=why=>{ const send=()=>{ try{c.send(JSON.stringify({t:'denied',why}));}catch(e){} setTimeout(()=>{try{c.close();}catch(e){}},800); }; if(c.open)send(); else c.on('open',send); };
    if(game.state!=='playing'||!game.meta)return deny(PROFILE.name+' is not playing a world right now.');
    if(game.meta.remote)return deny(PROFILE.name+' is a guest in someone else\'s world. Join that player instead.');
    if(SETTINGS.allow==='nobody')return deny(PROFILE.name+' has closed their world to visitors.');
    if(SETTINGS.allow==='anyone'||known){ this.admit(c,md); return; }
    const req={c,md,code,name,skin}; this.requests.push(req); c.on('close',()=>{ this.requests=this.requests.filter(r=>r!==req); this.changed(); }); c.on('error',()=>{});
    addChat(`${name} (${code}) wants to join your world. Press Esc → Friends to let them in.`,'#8ff'); showMsg(name+' wants to join — press Esc → Friends'); sfx.xp(); this.changed(); },
  admit(c,md){ const a=adaptConn(c); if(!net.addHostPeer(a,{name:md.name,skin:md.skin,code:this.normCode(md.code)}))a.close(); },
  accept(req){ this.requests=this.requests.filter(r=>r!==req); if(!this.list.some(f=>f.code===req.code)){ this.list.push({code:req.code,name:req.name,skin:req.skin,added:Date.now(),seen:Date.now(),online:true}); this.save(); }
    this.incoming=this.incoming.filter(r=>r.code!==req.code); this.admit(req.c,req.md); this.changed(); },
  decline(req){ this.requests=this.requests.filter(r=>r!==req); const send=()=>{ try{req.c.send(JSON.stringify({t:'denied',why:PROFILE.name+' said no this time.'}));}catch(e){} setTimeout(()=>{try{req.c.close();}catch(e){}},800); };
    if(req.c.open)send(); else req.c.on('open',send); this.changed(); },
  add(codeText,name){ const code=this.normCode(codeText); if(!code)return 'A friend code looks like ABCD-EFGH.'; if(code===PROFILE.code)return 'That is your own friend code!';
    if(this.list.some(f=>f.code===code))return 'That friend is already in your list.';
    const inc=this.incoming.find(r=>r.code===code); const f={code,name:cleanName(name||(inc&&inc.name)||'Friend'),skin:inc?inc.skin:0,added:Date.now(),seen:0};
    this.list.push(f); this.incoming=this.incoming.filter(r=>r.code!==code); this.save(); if(this.status==='online')this.ping(f); this.changed(); return null; },
  remove(code){ this.list=this.list.filter(f=>f.code!==code); this.save(); this.changed(); },
  ignore(code){ this.incoming=this.incoming.filter(r=>r.code!==code); this.changed(); },
  // join a friend's world
  join(f){ if(this.status!=='online'||!this.peer)return 'You are not connected to the friends service yet.';
    this.cancelJoin(); this.joinTarget=f; let c; try{ c=this.peer.connect(this.pid(f.code),{metadata:{k:'join',...this.me()},serialization:'raw',reliable:true}); }catch(e){ return 'Could not start the connection.'; }
    if(!c)return 'Could not start the connection.';
    this.joinConn=c; net.joinVia(adaptConn(c),{name:f.name});
    this.joinTimer=setTimeout(()=>{ if(!net.guest&&this.joinTarget===f)this.joinFail(f.name+' did not answer. They may need to accept you (Esc → Friends in their game).'); },90000);
    return null; },
  joined(){ clearTimeout(this.joinTimer); this.joinTarget=null; this.joinConn=null; },
  cancelJoin(){ clearTimeout(this.joinTimer); if(this.joinTarget&&!net.guest)net.reset(); this.joinTarget=null; this.joinConn=null; },
  joinFail(msg){ const was=this.joinTarget; this.cancelJoin(); if(was)onGuestDisconnected(msg); },
};
