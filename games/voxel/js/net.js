'use strict';
// =====================================================================
// MULTIPLAYER: peer-to-peer WebRTC data channels, no game server needed.
// The host creates an invite code per friend; the friend answers with a reply code.
// The host's world is authoritative: it runs liquids, redstone, crops and furnaces and
// broadcasts every block change. Guests send their own edits, position and chat.
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
  role:null, guest:false, name:'Player', myId:0, nextId:0, peers:[], pending:null, remotes:new Map(), applyKey:null, posT:0, timeT:0,
  remotesIn(dim){ const out=[]; for(const r of this.remotes.values())if(r.dim===dim&&r.pos)out.push(r); return out; },
  status(){ if(!this.role)return ''; const open=this.peers.filter(p=>p.dc&&p.dc.readyState==='open').length; return this.role==='host'?`   multiplayer: hosting, ${open} friend${open===1?'':'s'} connected`:`   multiplayer: guest${open?'':' (not connected)'}`; },
  send(peer,msg){ if(peer.dc&&peer.dc.readyState==='open')peer.dc.send(typeof msg==='string'?msg:JSON.stringify(msg)); },
  broadcast(msg,except){ const s=JSON.stringify(msg); for(const p of this.peers)if(p!==except)this.send(p,s); },
  localEdit(dim,x,y,z,v){ if(!this.role)return; if(this.applyKey===dim+','+x+','+y+','+z+','+v)return; this.broadcast({t:'blk',dim,x,y,z,v}); },
  sendTime(){ if(this.role==='host')this.broadcast({t:'time',dayTime}); },
  chat(text){ addChat(`<${this.name}> ${text}`); if(this.role)this.broadcast({t:'chat',name:this.name,text}); },
  applyBlock(dim,x,y,z,v){ const w=dims[dim]; if(!w)return; const ck=w.key(x>>4,z>>4),c=w.chunks.get(ck);
    if(c&&c.generated){ this.applyKey=dim+','+x+','+y+','+z+','+v; const prev=world; world=w; try{ w.setBlock(x,y,z,v&255,true,v>>8); } finally { world=prev; this.applyKey=null; } }
    else { if(!w.edits.has(ck))w.edits.set(ck,new Map()); w.edits.get(ck).set(idx(x&15,y,z&15),v); } },
  // --- host side ---
  async hostInvite(){ this.role='host'; const pc=new RTCPeerConnection(RTC_CFG), dc=pc.createDataChannel('game',{ordered:true}), peer={pc,dc,id:++this.nextId,name:'friend'};
    this.pending=peer; this.wire(peer,dc); pc.onconnectionstatechange=()=>{ if(pc.connectionState==='failed')mpSay('Connection failed: the two networks could not reach each other directly.'); };
    await pc.setLocalDescription(await pc.createOffer()); await waitIce(pc); return encodeDesc(pc.localDescription); },
  async hostAccept(code){ const peer=this.pending; if(!peer)throw new Error('create an invite first'); await peer.pc.setRemoteDescription(await decodeDesc(code)); this.peers.push(peer); this.pending=null; },
  // --- guest side ---
  async join(code){ if(this.role==='host')throw new Error('you are already hosting'); const pc=new RTCPeerConnection(RTC_CFG), peer={pc,dc:null,id:0,name:'host'};
    this.role='guest'; this.peers=[peer]; pc.ondatachannel=e=>{peer.dc=e.channel; this.wire(peer,e.channel);};
    await pc.setRemoteDescription(await decodeDesc(code)); await pc.setLocalDescription(await pc.createAnswer()); await waitIce(pc); return encodeDesc(pc.localDescription); },
  wire(peer,dc){
    dc.onopen=()=>{ if(this.role==='guest'&&!this.guest)this.send(peer,{t:'hello',name:this.name}); };
    dc.onclose=()=>{ this.peers=this.peers.filter(p=>p!==peer); if(this.role==='guest'){ addChat('Disconnected from the host. Reload the page to go back to your own world.','#f88'); this.remotes.clear(); }
      else { const r=this.remotes.get(peer.id); if(r)addChat(r.name+' left the game','#ff8'); this.remotes.delete(peer.id); this.broadcast({t:'leave',id:peer.id}); } };
    dc.onmessage=e=>{ let m; try{m=JSON.parse(e.data);}catch(err){return;} this.onMsg(peer,m); };
    if(dc.readyState==='open')dc.onopen(); },
  onMsg(peer,m){
    if(this.role==='host'){
      if(m.t==='hello'){ if(peer.welcomed)return; peer.welcomed=true; peer.name=String(m.name||'friend').slice(0,16); addChat(peer.name+' joined the game','#ff8');
        const players=[{id:0,name:this.name}].concat([...this.remotes.values()].map(r=>({id:r.id,name:r.name})));
        this.send(peer,{t:'welcome',id:peer.id,seed:SEED,dayTime,dim:world.dim,at:player.pos,players});
        for(const [k,w] of Object.entries(dims)){ const flat=[]; for(const [ck,mp] of w.edits){const [cx,cz]=ck.split(',').map(Number);for(const [i,v] of mp)flat.push(cx,cz,i,v);}
          for(let i=0;i<flat.length;i+=8000)this.send(peer,{t:'edits',dim:k,data:flat.slice(i,i+8000)}); }
        this.send(peer,{t:'ready'}); this.remotes.set(peer.id,{id:peer.id,name:peer.name,dim:null,pos:null}); this.broadcast({t:'join',id:peer.id,name:peer.name},peer); return; }
      if(m.t==='pos'){ m.id=peer.id; this.updateRemote(m); this.broadcast(m,peer); return; }
      if(m.t==='blk'){ this.applyBlock(m.dim,m.x,m.y,m.z,m.v); this.broadcast(m,peer); return; }
      if(m.t==='chat'){ addChat(`<${m.name}> ${m.text}`); this.broadcast(m,peer); return; }
      return; }
    // guest
    if(m.t==='welcome'){ saveWorld(); this.guest=true; this.myId=m.id; for(const w of Object.values(dims))for(const c of w.chunks.values()){freeMesh(c.opaque);freeMesh(c.water);} newWorld(m.seed,null); world=dims[m.dim]||dims.over; player.pos=[m.at[0]+1,m.at[1]+0.5,m.at[2]]; player.fallPeak=player.pos[1]; player.spawn=[...player.pos];
      dayTime=m.dayTime; for(const p of m.players)if(p.id!==this.myId)this.remotes.set(p.id,{id:p.id,name:p.name,dim:null,pos:null}); addChat('Connected! You are playing in the host\'s world.','#8f8'); mpEl.classList.add('hidden'); return; }
    if(m.t==='edits'){ const d=m.data; for(let i=0;i<d.length;i+=4){ const w=dims[m.dim],ck=d[i]+','+d[i+1],c=w.chunks.get(ck);
        if(c){ const li=d[i+2],x=d[i]*16+(li&15),z=d[i+1]*16+((li>>4)&15),y=li>>8; this.applyBlock(m.dim,x,y,z,d[i+3]); } else { if(!w.edits.has(ck))w.edits.set(ck,new Map()); w.edits.get(ck).set(d[i+2],d[i+3]); } } return; }
    if(m.t==='ready'){ showMsg('Joined the game!'); return; }
    if(m.t==='pos'){ if(m.id!==this.myId)this.updateRemote(m); return; }
    if(m.t==='blk'){ this.applyBlock(m.dim,m.x,m.y,m.z,m.v); return; }
    if(m.t==='chat'){ addChat(`<${m.name}> ${m.text}`); return; }
    if(m.t==='time'){ dayTime=m.dayTime; return; }
    if(m.t==='join'){ this.remotes.set(m.id,{id:m.id,name:m.name,dim:null,pos:null}); addChat(m.name+' joined the game','#ff8'); return; }
    if(m.t==='leave'){ const r=this.remotes.get(m.id); if(r)addChat(r.name+' left the game','#ff8'); this.remotes.delete(m.id); return; }
  },
  updateRemote(m){ let r=this.remotes.get(m.id); if(!r){r={id:m.id,name:m.name||'player'};this.remotes.set(m.id,r);} if(m.name)r.name=m.name;
    if(!r.pos||r.dim!==m.dim){r.pos=[...m.p];} r.dim=m.dim; r.tpos=m.p; r.yaw=m.yaw; r.pitch=m.pitch; r.sneak=m.sneak; r.w=0.3; r.h=1.8; },
  update(dt){ if(!this.role)return;
    if(this.role==='guest'&&!this.guest){ this.helloT=(this.helloT||0)+dt; if(this.helloT>2){ this.helloT=0; for(const p of this.peers)this.send(p,{t:'hello',name:this.name}); } return; }
    this.posT+=dt; if(this.posT>=0.1){ this.posT=0; this.broadcast({t:'pos',id:this.myId,name:this.name,dim:world.dim,p:player.pos.map(v=>Math.round(v*100)/100),yaw:player.yaw,pitch:player.pitch,sneak:player.sneak}); }
    if(this.role==='host'){ this.timeT+=dt; if(this.timeT>10){this.timeT=0;this.sendTime();} }
    for(const r of this.remotes.values()){ if(!r.pos||!r.tpos)continue; const k=Math.min(1,dt*12),ox=r.pos[0],oz=r.pos[2]; for(let a=0;a<3;a++)r.pos[a]+=(r.tpos[a]-r.pos[a])*k; r.phase=(r.phase||0)+Math.hypot(r.pos[0]-ox,r.pos[2]-oz)*4; } },
};
