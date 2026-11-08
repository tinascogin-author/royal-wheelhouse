export const revealDetails={
  Words:{button:'SPIN THE WHEEL',waiting:'Fate is turning…',duration:5700,scene:'wheelScene',title:'The Royal Word Wheel'},
  'Genre Genie':{button:'SPIN ME A STORY',waiting:'A new story is turning…',duration:5700,scene:'wheelScene',title:'The Genre Wheel'},
  Tarot:{button:'DRAW YOUR DESTINY',waiting:'The deck is choosing…',duration:4700,scene:'tarotScene',title:'The Enchanted Deck'},
  Potions:{button:'BREW MY FATE',waiting:'Your fate is brewing…',duration:5200,scene:'cauldronScene',title:'The Enchanted Cauldron'},
  Poisons:{button:'WHAT’S YOUR POISON?',waiting:'Something wicked is bubbling…',duration:4700,scene:'poisonScene',title:'The Poison Flask'},
  'Magic Mirror':{button:'MIRROR, MIRROR…',waiting:'The reflection is changing…',duration:4800,scene:'mirrorScene',title:'The Enchanted Mirror'}
};
export function createRevealStage($){
  const scenes=['wheelScene','tarotScene','cauldronScene','poisonScene','mirrorScene'];
  let angle=0;
  function configure(type){
    const info=revealDetails[type]||revealDetails.Words;
    scenes.forEach(id=>$(id).hidden=id!==info.scene);
    $('spin').textContent=info.button;$('stageTitle').textContent=info.title;
    $('replacementControl').hidden=type!=='Magic Mirror';
    $('wheelScene').classList.toggle('genreWheel',type==='Genre Genie');
    return info;
  }
  function reset(){scenes.forEach(id=>$(id).classList.remove('performing','completed','reversed'));$('tarotName').textContent='';$('tarotOrientation').textContent='';$('mirrorText').textContent='';}
  function start(type,reduced){
    const info=revealDetails[type]||revealDetails.Words,scene=$(info.scene);
    reset();scene.classList.add('performing');
    let degrees=0;
    if(info.scene==='wheelScene'){
      // Decorative rotation is independent of the selected entry.
      degrees=1800+(angle%271);angle+=degrees;
      $('wheelDisc').style.transition=reduced?'none':'transform 5.6s cubic-bezier(.12,.72,.12,1)';
      $('wheelDisc').style.transform=`rotate(${angle}deg)`;
    }
    return {duration:info.duration,degrees};
  }
  function finish(type,entry){
    const scene=$((revealDetails[type]||revealDetails.Words).scene);
    scene.classList.remove('performing');scene.classList.add('completed');
    $('wheelDisc').style.transition='none';$('wheelDisc').style.transform=`rotate(${angle}deg)`;
    $('tarotName').textContent=type==='Tarot'?entry.name:'';
    $('tarotScene').classList.toggle('reversed',type==='Tarot'&&entry.orientation==='Reversed');
    $('tarotOrientation').textContent=type==='Tarot'?(entry.orientation==='Reversed'?'↓ REVERSED':'↑ UPRIGHT'):'';
    $('mirrorText').textContent=type==='Magic Mirror'?entry.name:'';
  }
  return {configure,reset,start,finish};
}
