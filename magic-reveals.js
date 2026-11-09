export const revealDetails={
  'Story Spindle':{button:'WEAVE MY STORY',waiting:'The threads are finding their tale…',duration:4800,scene:'spindleScene',title:'The Story Spindle'},
  'Perspective Portal':{button:'OPEN MY PORTAL',waiting:'Whose eyes will tell your story…',duration:4600,scene:'portalScene',title:'The Perspective Portal'},
  'Tense Tiara':{button:'CROWN MY MOMENT',waiting:'Past, present, or yet to come…',duration:4200,scene:'tiaraScene',title:'The Tense Tiara'},
  Words:{button:'SPIN THE WHEEL',waiting:'Fate is turning…',duration:5700,scene:'wheelScene',title:'The Royal Word Wheel'},
  'Genre Genie':{button:'SPIN ME A STORY',waiting:'A new story is turning…',duration:5700,scene:'wheelScene',title:'The Genre Wheel'},
  Tarot:{button:'DRAW YOUR DESTINY',waiting:'The deck is choosing…',duration:4700,scene:'tarotScene',title:'The Enchanted Deck'},
  Potions:{button:'BREW MY FATE',waiting:'Your fate is brewing…',duration:5200,scene:'cauldronScene',title:'The Enchanted Cauldron'},
  Poisons:{button:'WHAT’S YOUR POISON?',waiting:'Something wicked is bubbling…',duration:4700,scene:'poisonScene',title:'The Poison Flask'},
  'Magic Mirror':{button:'MIRROR, MIRROR…',waiting:'The reflection is changing…',duration:4800,scene:'mirrorScene',title:'The Enchanted Mirror'}
};
export function createRevealStage($){
  const scenes=['wheelScene','tarotScene','cauldronScene','poisonScene','mirrorScene','spindleScene','portalScene','tiaraScene'];
  let angle=0,revealTimers=[],portalEntries=[];
  function configure(type,entries=[]){
    if(type==='Perspective Portal'){portalEntries=entries.slice(0,9);for(let i=0;i<9;i++)$('portalTile'+i).textContent=portalEntries[i]?.name||'✧';}
    const info=revealDetails[type]||revealDetails.Words;
    scenes.forEach(id=>$(id).hidden=id!==info.scene);
    $('spin').textContent=info.button;$('stageTitle').textContent=info.title;
    $('replacementControl').hidden=type!=='Magic Mirror';
    $('wheelScene').classList.toggle('genreWheel',type==='Genre Genie');
    return info;
  }
  function clearChase(){revealTimers.forEach(clearTimeout);revealTimers=[];}
  function reset(){clearChase();for(let i=0;i<9;i++)$('portalTile'+i).classList.remove('lit','chosen');scenes.forEach(id=>$(id).classList.remove('performing','completed','reversed'));$('tarotName').textContent='';$('tarotOrientation').textContent='';$('mirrorText').textContent='';$('spindleText').textContent='';$('portalText').textContent='';$('tiaraText').textContent='';['pastGem','presentGem','futureGem'].forEach(id=>$(id).classList.remove('chosen'));}
  function start(type,reduced){
    const info=revealDetails[type]||revealDetails.Words,scene=$(info.scene);
    reset();scene.classList.add('performing');
    let degrees=0;
    if(type==='Perspective Portal'&&!reduced){
      let time=0,step=0;while(time<info.duration-200){const tile=step%9;revealTimers.push(setTimeout(()=>{for(let i=0;i<9;i++)$('portalTile'+i).classList.toggle('lit',i===tile);},time));time+=65+step*7;step++;}
    }
    if(info.scene==='wheelScene'){
      // Decorative rotation is independent of the selected entry.
      degrees=1800+(angle%271);angle+=degrees;
      $('wheelDisc').style.transition=reduced?'none':'transform 5.6s cubic-bezier(.12,.72,.12,1)';
      $('wheelDisc').style.transform=`rotate(${angle}deg)`;
    }
    return {duration:info.duration,degrees};
  }
  function finish(type,entry){
    clearChase();for(let i=0;i<9;i++){$('portalTile'+i).classList.remove('lit');$('portalTile'+i).classList.toggle('chosen',type==='Perspective Portal'&&portalEntries[i]?.name===entry.name);}
    const scene=$((revealDetails[type]||revealDetails.Words).scene);
    scene.classList.remove('performing');scene.classList.add('completed');
    $('wheelDisc').style.transition='none';$('wheelDisc').style.transform=`rotate(${angle}deg)`;
    $('tarotName').textContent=type==='Tarot'?entry.name:'';
    $('tarotScene').classList.toggle('reversed',type==='Tarot'&&entry.orientation==='Reversed');
    $('tarotOrientation').textContent=type==='Tarot'?(entry.orientation==='Reversed'?'↓ REVERSED':'↑ UPRIGHT'):'';
    $('mirrorText').textContent=type==='Magic Mirror'?entry.name:'';
    $('spindleText').textContent=type==='Story Spindle'?entry.name:'';
    $('portalText').textContent=type==='Perspective Portal'?entry.name:'';
    $('tiaraText').textContent=type==='Tense Tiara'?entry.name:'';
    if(type==='Tense Tiara'){const gem={past:'pastGem',present:'presentGem',future:'futureGem'}[entry.name.toLowerCase()];if(gem)$(gem).classList.add('chosen');}
  }
  return {configure,reset,start,finish};
}
