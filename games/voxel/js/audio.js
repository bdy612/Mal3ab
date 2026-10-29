'use strict';
// ---------------------------------------------------------------------
// SOUND (tiny Web Audio synth)
// ---------------------------------------------------------------------
let actx=null; function audio(){ if(!actx){ try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} } return actx; }
function tone(f0,f1,dur,type,vol){const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),a.currentTime+dur);g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur);}
function noise(dur,vol,lp){const a=audio();if(!a)return;const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource();s.buffer=b;const g=a.createGain();g.gain.value=vol;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=lp||4000;s.connect(f);f.connect(g);g.connect(a.destination);s.start();}
const sfx={break:()=>noise(0.12,0.25,2500),place:()=>tone(320,200,0.07,'square',0.12),hurt:()=>tone(220,110,0.25,'sawtooth',0.2),mobhurt:()=>tone(400,250,0.15,'square',0.1),explode:()=>noise(0.7,0.7,800),
  pickup:()=>tone(700,1100,0.08,'sine',0.15),xp:()=>tone(1200,1800,0.06,'sine',0.08),eat:()=>noise(0.07,0.15,1500),bow:()=>noise(0.15,0.2,3000),craft:()=>tone(500,700,0.08,'triangle',0.12),hiss:()=>noise(0.4,0.12,6000),dig:()=>noise(0.05,0.08,2000),
  portal:()=>{tone(200,600,0.8,'sine',0.15);noise(0.8,0.1,1200);},enchant:()=>{tone(600,1500,0.4,'triangle',0.12);tone(900,1800,0.5,'sine',0.08);},roar:()=>{noise(1.2,0.5,400);tone(90,40,1.2,'sawtooth',0.3);},teleport:()=>tone(1500,300,0.2,'sine',0.12)};

