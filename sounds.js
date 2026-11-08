// All sound is synthesized locally. No audio files, downloads, or autoplay.
export function wheelClickTimes(degrees,duration){
  const cubic=(t,a,b)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;
  const times=[];
  for(let angle=30;angle<degrees;angle+=30){
    const fraction=angle/degrees;let lo=0,hi=1;
    for(let n=0;n<28;n++){const mid=(lo+hi)/2;if(cubic(mid,.72,1)<fraction)lo=mid;else hi=mid;}
    times.push(cubic((lo+hi)/2,.12,.12)*duration);
  }
  return times;
}
export function createSoundSystem(initial=true,environment=globalThis){
  const schedule=environment.setTimeout.bind(environment),cancel=environment.clearTimeout.bind(environment);
  let enabled=initial,context=null,timers=[],voices=[];
  function unlock(){if(!enabled)return;try{const AC=environment.AudioContext||environment.webkitAudioContext;if(!AC)return;context ||= new AC();context.resume?.().catch(()=>{});}catch{context=null;}}
  function tone(frequency=440,duration=.1,volume=.025,type='sine',slide){
    if(!enabled||!context||context.state==='closed')return;
    try{const now=context.currentTime,osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(context.destination);osc.start(now);osc.stop(now+duration+.02);voices.push(osc);osc.onended=()=>{voices=voices.filter(v=>v!==osc);osc.disconnect();gain.disconnect();};}catch{}
  }
  function later(fn,ms){timers.push(schedule(fn,ms));}
  function stop(){timers.forEach(cancel);timers=[];voices.forEach(v=>{try{v.stop();}catch{}});voices=[];}
  function start(kind,duration,degrees=2000){stop();unlock();if(!enabled||!context||duration<=0)return;
    if(kind==='Words'||kind==='Genre Genie'){wheelClickTimes(degrees,duration).forEach(ms=>later(()=>tone(900,.018,.025,'triangle',170),ms));return;}
    if(kind==='Tarot'){for(let i=0;i<10;i++)later(()=>tone(300+i*25,.055,.018,'triangle',100),i*240);return;}
    if(kind==='Potions'||kind==='Poisons'){for(let i=0;i<17;i++)later(()=>tone(160+(i%5)*42,.12,.025,'sine',400+(i%4)*90),i*(duration/18));return;}
    tone(kind==='Magic Mirror'?220:146,Math.min(duration/1000,4),.025,'sine',kind==='Magic Mirror'?440:220);
    for(let i=1;i<6;i++)later(()=>tone(440+i*55,.6,.013,'sine'),i*duration/7);
  }
  function reveal(kind){stop();unlock();if(!enabled||!context)return;
    if(kind==='Poisons')tone(540,.13,.05,'sine',100);
    const notes=kind==='Cursed'?[196,233.08,293.66]:[523.25,659.25,783.99,1046.5];
    notes.forEach((note,i)=>later(()=>tone(note,.65,.023,'sine'),i*95));
  }
  return {unlock,start,stop,reveal,setEnabled(value){enabled=!!value;if(!enabled)stop();else unlock();},get enabled(){return enabled;}};
}
