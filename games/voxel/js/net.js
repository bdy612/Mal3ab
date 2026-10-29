'use strict';
// =====================================================================
// MULTIPLAYER: peer-to-peer WebRTC data channels, no game server needed.
// Friends connect through friend codes (friends.js) or, as a fallback, by swapping
// invite/reply codes by hand. The host's world is authoritative: it runs liquids,
// redstone, crops and furnaces and broadcasts every block change. Guests send their
// own edits, position and chat.
// =====================================================================
const RTC_CFG={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
async function encodeDesc(desc){ const json=JSON.stringify({t:desc.type,s:desc.sdp});
  if(window.CompressionStream){ const st=new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw')); const u8=new Uint8Array(await new Response(st).arrayBuffer()); let bin=''; for(const b of u8)bin+=String.fromCharCode(b); return 'Z'+btoa(bin); }
  return 'J'+btoa(unescape(encodeURIComponent(json))); }
async function decodeDesc(code){ code=(code||'').replace(/\s+/g,''); if(!code)throw new Error('empty code'); let json;
  if(code[0]==='Z'){ const u8=Uint8Array.from(atob(code.slice(1)),c=>c.charCodeAt(0)); const st=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw')); json=await new Response(st).text(); }
  else if(code[0]==='J') json=decodeURIComponent(escape(atob(code.slice(1)))); else throw new Error('not a game code');
  const o=JSON.parse(json); return {type:o.t,sdp:o.s}; }
function waitIce(pc){ return new Promise(res=>{ if(pc.iceGatheringState==='complete')return res(); const t=setTimeout(res,4000);
  pc.addEventListener('icegatheringstatechange',()=>{ if(pc.iceGatheringState==='complete'){clearTimeout(t);res();} }); }); }

const net={
  role:null, guest:false, name:'Player', myId:0, nextId:0, peers:[], pending:null, remotes:new Map(), applyKey:null, posT:0, timeT:0, hostName:'', leaving:false,
  remotesIn(dim){ const out=[]; for(const r of this.remotes.values())if(r.dim===dim&&r.pos)out.push(r); return out; },
  status(){ if(!this.role)return ''; const open=this.peers.filter(p=>p.dc&&p.dc.readyState==='open').length; return this.role==='host'?`   multiplayer: hosting, ${open} friend${open===1?'':'s'} connected`:`   multiplayer: guest in ${this.hostName||'a friend'}'s world${open?'':' (not connected)'}`; },
  send(peer,msg){ if(peer.dc&&peer.dc.readyState==='open')try{ peer.dc.send(typeof msg==='string'?msg:JSON.stringify(msg)); }catch(e){} },
  broadcast(msg,except){ const s=JSON.stringify(msg); for(const p of this.peers)if(p!==except&&(this.role!=='host'||p.welcomed))this.send(p,s); },
  localEdit(dim,x,y,z,v){ if(!this.role)return; if(this.applyKey===dim+','+x+','+y+','+z+','+v)return; this.broadcast({t:'blk',dim,x,y,z,v}); },
  sendTime(){ if(this.role==='host')this.broadcast({t:'time',dayTime}); },
  sendWeather(){ if(this.role==='host')this.broadcast({t:'weather',w:weatherState()}); },
  publicMeta(){ const m=game.meta||{}; return {name:m.name,mode:m.mode,diff:m.diff,cheats:!!m.cheats,type:m.type,rules:m.rules}; },
  sendMeta(){ if(this.role==='host')this.broadcast({t:'meta',meta:this.publicMeta()}); },
  chat(text){ addChat(`<${this.name}> ${text}`); if(this.role)this.broadcast({t:'chat',name:this.name,text}); },
  // containers (chests, furnaces, brewing stands) are shared: whoever changes one sends its full content
  sendTile(t){ if(!this.role||!t||!t.pos)return; this.broadcast({t:'tile',dim:world.dim,x:t.pos[0],y:t.pos[1],z:t.pos[2],data:t}); },
  requestTile(t){ if(this.role!=='guest'||!t||!t.pos)return; this.broadcast({t:'tilereq',dim:world.dim,x:t.pos[0],y:t.pos[1],z:t.pos[2]}); },
  applyTile(m){ const w=dims[m.dim]; if(!w||!m.data)return; const k=m.x+','+m.y+','+m.z; let t=w.tiles.get(k);
    if(t){ for(const key of Object.keys(t))if(!(key in m.data))delete t[key]; Object.assign(t,m.data); } else { t=m.data; w.tiles.set(k,t); }
    t.pos=[m.x,m.y,m.z]; if(typeof uiOpen!=='undefined'&&uiOpen&&ui.tile===t&&typeof refreshUI==='function')refreshUI(); },
  applyBlock(dim,x,y,z,v){ const w=dims[dim]; if(!w)return; const ck=w.key(x>>4,z>>4),c=w.chunks.get(ck);
    if(c&&c.generated){ this.applyKey=dim+','+x+','+y+','+z+','+v; const prev=world; world=w; try{ w.setBlock(x,y,z,v&255,true,v>>8); } finally { world=prev; this.applyKey=null; } }
    else { if(!w.edits.has(ck))w.edits.set(ck,new Map()); w.edits.get(ck).set(idx(x&15,y,z&15),v); } },
  // close every connection and forget all players
  reset(){ this.leaving=true; for(const p of this.peers.concat(this.pending?[this.pending]:[])){ try{p.dc&&p.dc.close&&p.dc.close();}catch(e){} try{p.pc&&p.pc.close();}catch(e){} }
    this.peers=[]; this.pending=null; this.remotes.clear(); this.role=null; this.guest=false; this.myId=0; this.hostName=''; this.helloT=0; this.leaving=false;
    if(typeof clearNameTags==='function')clearNameTags(); },
  // --- host side, manual codes ---
  async hostInvite(){ if(game.state!=='playing'||!game.meta||game.meta.remote)throw new Error('open one of your own worlds first'); if(this.role==='guest')throw new Error('you are a guest in another world');
    this.role='host'; const pc=new RTCPeerConnection(RTC_CFG), dc=pc.createDataChannel('game',{ordered:true}), peer={pc,dc,id:++this.nextId,name:'friend',skin:0};
    this.pending=peer; this.wire(peer,dc); pc.onconnectionstatechange=()=>{ if(pc.connectionState==='failed')mpSay('Connection failed: the two networks could not reach each other directly.'); };
    await pc.setLocalDescription(await pc.createOffer()); await waitIce(pc); return encodeDesc(pc.localDescription); },
  async hostAccept(code){ const peer=this.pending; if(!peer)throw new Error('create an invite first'); await peer.pc.setRemoteDescription(await decodeDesc(code)); this.peers.push(peer); this.pending=null; },
  // --- host side, friend codes (the connection object comes from friends.js) ---
  addHostPeer(dc,info){ if(this.role==='guest'||game.state!=='playing')return null; this.role='host';
    const peer={pc:null,dc,id:++this.nextId,name:cleanName(info.name),skin:info.skin|0,code:info.code||null}; this.peers.push(peer); this.wire(peer,dc); return peer; },
  kick(id){ const p=this.peers.find(p=>p.id===id); if(!p)return; this.send(p,{t:'kick'}); setTimeout(()=>{ try{p.dc.close&&p.dc.close();}catch(e){} try{p.pc&&p.pc.close();}catch(e){} },400); },
  // --- guest side ---
  async join(code){ if(this.role==='host')throw new Error('you are hosting a world — quit to the title screen first'); this.reset(); const pc=new RTCPeerConnection(RTC_CFG), peer={pc,dc:null,id:0,name:'host'};
    this.role='guest'; this.peers=[peer]; pc.ondatachannel=e=>{peer.dc=e.channel; this.wire(peer,e.channel);};
    await pc.setRemoteDescription(await decodeDesc(code)); await pc.setLocalDescription(await pc.createAnswer()); await waitIce(pc); return encodeDesc(pc.localDescription); },
  joinVia(dc,host){ this.reset(); this.role='guest'; this.hostName=host.name||'host'; const peer={pc:null,dc,id:0,name:this.hostName}; this.peers=[peer]; this.wire(peer,dc); },
  wire(peer,dc){
    dc.onopen=()=>{ if(this.role==='guest'&&!this.guest)this.send(peer,{t:'hello',name:this.name,skin:PROFILE.skin,code:PROFILE.code}); };
    dc.onclose=()=>{ if(!this.peers.includes(peer))return; this.peers=this.peers.filter(p=>p!==peer); if(this.leaving)return;
      if(this.role==='guest'){ const was=this.guest; this.reset(); onGuestDisconnected(peer.kicked?'You were removed from the world by the host.':was?'Lost connection to the host. They may have closed the world.':'Could not reach the host.'); }
      else { const r=this.remotes.get(peer.id); if(r)addChat(r.name+' left the game','#ff8'); this.remotes.delete(peer.id); this.broadcast({t:'leave',id:peer.id}); if(typeof friends!=='undefined')friends.changed(); } };
    dc.onmessage=e=>{ let m; try{m=JSON.parse(e.data);}catch(err){return;} this.onMsg(peer,m); };
    if(dc.readyState==='open')dc.onopen(); },
  onMsg(peer,m){
    if(this.role==='host'){
      if(m.t==='hello'){ if(peer.welcomed)return; if(game.state!=='playing'||!game.meta){ this.send(peer,{t:'denied',why:'The host is not in a world right now.'}); return; }
        peer.welcomed=true; peer.name=cleanName(m.name||peer.name); peer.skin=(m.skin|0)%PLAYER_COLS.length; addChat(peer.name+' joined the game','#ff8');
        const players=[{id:0,name:this.name,skin:PROFILE.skin}].concat([...this.remotes.values()].map(r=>({id:r.id,name:r.name,skin:r.skin})));
        this.send(peer,{t:'welcome',id:peer.id,seed:SEED,dayTime,dim:world.dim,at:player.pos,players,meta:this.publicMeta(),hostName:this.name});
        for(const [k,w] of Object.entries(dims)){ const flat=[]; for(const [ck,mp] of w.edits){const [cx,cz]=ck.split(',').map(Number);for(const [i,v] of mp)flat.push(cx,cz,i,v);}
          for(let i=0;i<flat.length;i+=8000)this.send(peer,{t:'edits',dim:k,data:flat.slice(i,i+8000)}); }
        this.send(peer,{t:'weather',w:weatherState()}); this.send(peer,{t:'ready'}); this.remotes.set(peer.id,{id:peer.id,name:peer.name,skin:peer.skin,dim:null,pos:null}); this.broadcast({t:'join',id:peer.id,name:peer.name,skin:peer.skin},peer);
        if(typeof friends!=='undefined')friends.changed(); return; }
      if(!peer.welcomed)return;
      if(m.t==='pos'){ m.id=peer.id; m.skin=peer.skin; this.updateRemote(m); this.broadcast(m,peer); return; }
      if(m.t==='blk'){ this.applyBlock(m.dim,m.x,m.y,m.z,m.v); this.broadcast(m,peer); return; }
      if(m.t==='tile'){ this.applyTile(m); this.broadcast(m,peer); return; }
      if(m.t==='tilereq'){ const w=dims[m.dim],t=w&&w.tiles.get(m.x+','+m.y+','+m.z); if(t)this.send(peer,{t:'tile',dim:m.dim,x:m.x,y:m.y,z:m.z,data:t}); return; }
      if(m.t==='chat'){ m.name=peer.name; addChat(`<${m.name}> ${m.text}`); this.broadcast(m,peer); return; }
      return; }
    // guest
    if(m.t==='welcome'){ if(this.guest)return; this.guest=true; this.myId=m.id; this.hostName=m.hostName||this.hostName; startGuestWorld(m); return; }
    if(m.t==='denied'){ this.reset(); onGuestDisconnected(m.why||'The host did not let you in.'); return; }
    if(m.t==='kick'){ peer.kicked=true; return; }
    if(m.t==='edits'){ const d=m.data; for(let i=0;i<d.length;i+=4){ const w=dims[m.dim],ck=d[i]+','+d[i+1],c=w.chunks.get(ck);
        if(c){ const li=d[i+2],x=d[i]*16+(li&15),z=d[i+1]*16+((li>>4)&15),y=li>>8; this.applyBlock(m.dim,x,y,z,d[i+3]); } else { if(!w.edits.has(ck))w.edits.set(ck,new Map()); w.edits.get(ck).set(d[i+2],d[i+3]); } } return; }
    if(m.t==='ready'){ showMsg('Joined '+this.hostName+'\'s world!'); return; }
    if(m.t==='meta'){ if(game.meta)Object.assign(game.meta,m.meta,{remote:true}); return; }
    if(m.t==='pos'){ if(m.id!==this.myId)this.updateRemote(m); return; }
    if(m.t==='blk'){ this.applyBlock(m.dim,m.x,m.y,m.z,m.v); return; }
    if(m.t==='tile'){ this.applyTile(m); return; }
    if(m.t==='chat'){ addChat(`<${m.name}> ${m.text}`); return; }
    if(m.t==='time'){ dayTime=m.dayTime; return; }
    if(m.t==='weather'){ if(dims.over)dims.over.flags.weather=m.w; return; }
    if(m.t==='bolt'){ lightning(m.x,m.z,false); return; }
    if(m.t==='join'){ this.remotes.set(m.id,{id:m.id,name:m.name,skin:m.skin|0,dim:null,pos:null}); addChat(m.name+' joined the game','#ff8'); return; }
    if(m.t==='leave'){ const r=this.remotes.get(m.id); if(r)addChat(r.name+' left the game','#ff8'); this.remotes.delete(m.id); return; }
  },
  updateRemote(m){ let r=this.remotes.get(m.id); if(!r){r={id:m.id,name:m.name||'player'};this.remotes.set(m.id,r);} if(m.name)r.name=m.name; if(m.skin!==undefined)r.skin=m.skin|0;
    if(!r.pos||r.dim!==m.dim){r.pos=[...m.p];} r.dim=m.dim; r.tpos=m.p; r.yaw=m.yaw; r.pitch=m.pitch; r.sneak=m.sneak; r.spec=!!m.spec; r.w=0.3; r.h=1.8; },
  update(dt){ if(!this.role)return;
    if(this.role==='guest'&&!this.guest){ this.helloT=(this.helloT||0)+dt; if(this.helloT>1){ this.helloT=0; for(const p of this.peers)this.send(p,{t:'hello',name:this.name,skin:PROFILE.skin,code:PROFILE.code}); } return; }
    if(game.state!=='playing')return;
    this.posT+=dt; if(this.posT>=0.1){ this.posT=0; this.broadcast({t:'pos',id:this.myId,name:this.name,skin:PROFILE.skin,dim:world.dim,p:player.pos.map(v=>Math.round(v*100)/100),yaw:player.yaw,pitch:player.pitch,sneak:player.sneak,spec:!!player.spectator}); }
    if(this.role==='host'){ this.timeT+=dt; if(this.timeT>10){this.timeT=0;this.sendTime();} }
    for(const r of this.remotes.values()){ if(!r.pos||!r.tpos)continue; const k=Math.min(1,dt*12),ox=r.pos[0],oz=r.pos[2]; for(let a=0;a<3;a++)r.pos[a]+=(r.tpos[a]-r.pos[a])*k; r.phase=(r.phase||0)+Math.hypot(r.pos[0]-ox,r.pos[2]-oz)*4; } },
};
