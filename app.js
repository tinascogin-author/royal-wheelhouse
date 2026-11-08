import {randomIndex,normalize,available,parseEntries,chunks,partyId,validateBackup,addResult,removeResult,replacementChoices,drawTarot,formatEntries} from './core.js';
import {createSoundSystem} from './sounds.js';
import {createRevealStage,revealDetails} from './magic-reveals.js';
const $ = id => document.getElementById(id), key='royal-wheelhouse-v1';
const uid=()=>crypto.randomUUID();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const makeParty=(date=today(),decree='Write boldly. Delight the court.',curse='Include an unexpected royal interruption.')=>({id:uid(),date,decree,curse,handle:'',used:[],results:[]});
const bank=(name,type,text)=>({id:uid(),name,type,entries:parseEntries(text)});
function initial(){const p=makeParty();return {version:1,active:p.id,parties:[p],banks:[bank('The Royal Collection','Words','Velvet\nWhisper\nCrown\nMidnight\nThorn\nSecret\nLantern\nPromise\nStorm\nEmber\nRibbon\nMirror\nWander\nSpell\nGarden\nRebellion\nMoonlight\nKey\nMasquerade\nDragon\nHoney\nGhost\nSilver\nWildflower\nRuins\nLetter\nDagger\nWish\nOcean\nStarlight\nBetrayal\nTea\nCastle\nFeather\nDawn\nFable'),bank('Halloween','Words','Haunted\nPumpkin\nWitch\nCobweb\nGraveyard\nSpecter\nCauldron\nRaven\nFangs\nCandle'),bank('Thanksgiving','Words','Harvest\nGratitude\nFeast\nHomecoming\nCranberry\nHearth\nOrchard\nGathering\nCornucopia'),bank('Christmas','Words','Mistletoe\nSnowfall\nEvergreen\nSleigh\nGift\nGingerbread\nCarol\nHolly\nFrost'),bank('Tarot','Tarot','The Fool | A leap of faith and a new beginning.\nThe Magician | Turn intention into action.\nThe Moon | Uncertainty, dreams, and hidden truths.'),bank('Potions','Potions','Truth Serum | Your character cannot tell a lie for one scene.\nLiquid Courage | Attempt the thing your character fears most.\nMemory Mist | An important memory disappears.'),bank('Magic Mirror','Magic Mirror','The Other Side | Write a scene from your rival’s perspective.\nUnmasked | Reveal a secret your character has kept.\nReflection | Meet an alternate version of yourself.'),bank('Genre Genie','Genre Genie','Cozy mystery | A gentle puzzle in a close-knit community.\nSpace opera | A sweeping adventure among the stars.\nGothic romance | Love and dread in a haunting setting.') ]};}
let state;
try{const raw=localStorage.getItem(key);state=raw?validateBackup(JSON.parse(raw)):initial();}catch(e){state=initial();setTimeout(()=>toast('Saved data could not be loaded. Export any recovery data before continuing.'),100);}

function upgrade(s){
  const reversedSamples={
    'the fool':'Careless risks, poor preparation, or misplaced trust.',
    'the magician':'Deception, manipulation, or a gift that goes unused.',
    'the moon':'Uncertainty begins to clear, though misunderstandings may remain.'
  };
  for(const b of s.banks)if(b.type==='Tarot')for(const e of b.entries)if(e.reversedDescription===undefined)e.reversedDescription=reversedSamples[normalize(e.name)]||'';

  s.settings ||= {sound:true};s.features ||= {};
  if(!s.features.poisons){if(!s.banks.some(b=>b.type==='Poisons'))s.banks.push(bank('Poisons','Poisons','Poison of Grumbling | A complaint reaches the ears of the person it concerns.\nPoison of Exaggeration | A detail grows more impressive every time it is repeated.\nPoison of Echoes | A character accidentally repeats a secret aloud.'));s.features.poisons=true;}
  return s;
}
upgrade(state);
const sound=createSoundSystem(state.settings.sound),stage=createRevealStage($);
function renderSound(){$('soundToggle').textContent=sound.enabled?'♫ Sound on':'♫ Sound off';$('soundToggle').setAttribute('aria-pressed',String(sound.enabled));}
$('soundToggle').onclick=()=>{sound.setEnabled(!sound.enabled);state.settings.sound=sound.enabled;save();renderSound();};
renderSound();

let busy=false,finishReveal=null,editingNew=false,uploadedCollection=false;
const party=()=>state.parties.find(p=>p.id===state.active);
function save(){try{localStorage.setItem(key,JSON.stringify(state));$('storageStatus').textContent='✓ Saved on this device';return true;}catch(e){$('storageStatus').textContent='⚠ Save failed — export a backup now';toast('Storage is unavailable or full. Export a backup to keep your changes.');return false;}}
function toast(t){$('toast').textContent=t;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',4500);}
function element(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function selectedBank(){return state.banks.find(b=>b.id===$('playBank').value)||state.banks[0];}
function options(select,chosen){select.replaceChildren(...state.banks.map(b=>{const o=element('option',b.name);o.value=b.id;return o;}));if(state.banks.some(b=>b.id===chosen))select.value=chosen;}
function render(){const p=party();chooseStage(false);resetStage();$('partyId').value=partyId(p.date);$('handle').value=p.handle;$('decreeText').textContent=p.decree||'No decree has been issued.';$('curseText').textContent=p.curse||'No curse has been set.';options($('playBank'),$('playBank').value);renderGrid();renderResults();renderArchives();}
function resetStage(){stage.reset();$('wordReveal').textContent='Let fate choose.';$('wordDescription').textContent='';$('wordCaption').textContent='YOUR STORY BEGINS WITH…';$('wordCallout').classList.remove('revealed');$('ballReveal').textContent='Will you escape?';$('ballCaption').textContent='A QUESTION ONLY FATE CAN ANSWER';$('verdictCurse').textContent='';$('answer').textContent='✧';$('orb').classList.remove('cursed','escaped');$('sparkles').replaceChildren();}
function renderGrid(){
  const b=selectedBank(),entries=available(b,party().used);
  stage.configure(b.type);$('remaining').textContent=entries.length+' '+(b.type==='Words'?'words remaining':'entries');
  $('spin').disabled=busy||!entries.length;syncCategory(b.type);updateProgress();renderReplacements();
}
function syncCategory(type){
  $('chooseGrid').classList.toggle('selected',type==='Words');$('chooseGrid').setAttribute('aria-pressed',String(type==='Words'));
  document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b.dataset.category===type);b.setAttribute('aria-pressed',String(b.dataset.category===type));});
}
function updateProgress(){
  const names=state.banks.filter(b=>b.type==='Words').map(b=>b.name);
  const n=party().results.filter(r=>normalize(r.handle)===normalize(party().handle.trim())&&(r.type==='Words'||(!r.type&&names.includes(r.kind)))).length;
  $('wordProgress').textContent=selectedBank().type==='Words'?(party().handle.trim()?party().handle.trim()+' · '+n+' of 3 word prompts recorded':'Three words to tempt your imagination.'):'Every reveal is recorded in the Royal Registry.';
}
function renderReplacements(){
  const select=$('replaceResult'),chosen=select.value,choices=replacementChoices(party(),party().handle);
  select.replaceChildren(...choices.map(r=>{const o=element('option',r.kind+': '+r.value);o.value=r.id;return o;}));
  if(choices.some(r=>r.id===chosen))select.value=chosen;
  $('replacementHint').textContent=choices.length?'The Mirror’s challenge is mandatory. Your original stays in history.':'This writer needs an active result before using the Mirror.';
  if(selectedBank().type==='Magic Mirror')$('spin').disabled=busy||!choices.length||!available(selectedBank(),party().used).length;
}
function record(kind,value,description='',type=selectedBank().type,replaceId,metadata={}){
  const p=party(),r={id:uid(),handle:p.handle.trim(),kind,value,description,type,...metadata,time:new Date().toISOString()};
  addResult(p,r,replaceId);save();renderResults();return r;
}
function requireHandle(){if(!$('handle').value.trim()){toast('Enter the current victim’s Discord handle first.');$('handle').focus();return false;}party().handle=$('handle').value.trim();return true;}
function lock(on){busy=on;['spin','consult','newParty','setup','playBank','handle','chooseGrid','chooseCrystal','openRegistry','openCollections','replaceResult'].forEach(id=>$(id).disabled=on);document.querySelectorAll('nav button, [data-category]').forEach(b=>b.disabled=on);$('theater').classList.toggle('isRevealing',on);}
function burst(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('sparkles').replaceChildren(...Array.from({length:28},(_,i)=>{const s=element('i',i%3?'✦':'✧');const angle=i/28*Math.PI*2;s.style.setProperty('--x',`${Math.cos(angle)*(160+randomIndex(230))}px`);s.style.setProperty('--y',`${Math.sin(angle)*(120+randomIndex(190))}px`);s.style.setProperty('--delay',`${randomIndex(180)}ms`);return s;}));}
function completeReveal(){lock(false);$('spin').disabled=!available(selectedBank(),party().used).length;renderReplacements();$('skip').hidden=true;$('skipGrid').hidden=true;finishReveal=null;burst();}
$('spin').onclick=()=>{
  if(busy||!requireHandle())return;
  const b=selectedBank(),pool=available(b,party().used);if(!pool.length)return;
  const replaceId=b.type==='Magic Mirror'?$('replaceResult').value:undefined;
  if(b.type==='Magic Mirror'&&!replacementChoices(party(),party().handle).some(r=>r.id===replaceId))return toast('Choose an active result for this writer to trade in.');
  const traded=replaceId?party().results.find(r=>r.id===replaceId):null;
  const selected=pool[randomIndex(pool.length)],winner=b.type==='Tarot'?drawTarot(selected):selected;if(b.type==='Words')party().used.push(normalize(winner.name));
  record(b.name,winner.displayName||winner.name,winner.description,b.type,replaceId,b.type==='Tarot'?{orientation:winner.orientation,cardName:winner.name}:{});renderGrid();lock(true);
  let timer;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,info=revealDetails[b.type];
  $('wordCallout').classList.remove('revealed');$('wordCaption').textContent='THE COURT HOLDS ITS BREATH';$('wordReveal').textContent=info.waiting;$('wordDescription').textContent='';$('skipGrid').hidden=false;
  const animation=stage.start(b.type,reduced);sound.start(b.type,reduced?0:animation.duration,animation.degrees);
  finishReveal=()=>{if(!busy||!finishReveal)return;clearTimeout(timer);stage.finish(b.type,winner);sound.reveal(b.type);$('wordCaption').textContent=party().handle+(b.type==='Magic Mirror'?' · YOUR NEW MANDATORY CHALLENGE':' · YOUR ROYAL PROMPT');$('wordReveal').textContent=winner.displayName||winner.name;$('wordDescription').textContent=(traded?'Replaces “'+traded.value+'”. ':'')+winner.description;$('wordCallout').classList.add('revealed');completeReveal();};
  if(reduced)finishReveal();else timer=setTimeout(()=>finishReveal?.(),animation.duration);
};
$('consult').onclick=()=>{
  if(busy||!requireHandle())return;
  const outcome=randomIndex(2)===0?'Yes':'No';record('Curse Crystal Ball',outcome,'','Curse');lock(true);sound.start('Curse',4800);
  $('orb').classList.remove('cursed','escaped');$('orb').classList.add('thinking');$('answer').textContent='✧';$('ballCallout').classList.remove('revealed');$('ballCaption').textContent='THE FATES ARE DELIBERATING';$('ballReveal').textContent='The crystal awakens…';$('verdictCurse').textContent='';$('skip').hidden=false;
  let timer;
  finishReveal=()=>{if(!busy||!finishReveal)return;clearTimeout(timer);sound.reveal(outcome==='Yes'?'Cursed':'Escaped');$('answer').textContent=outcome==='Yes'?'☾':'✦';$('orb').classList.remove('thinking');$('orb').classList.add(outcome==='Yes'?'cursed':'escaped');$('ballCaption').textContent=`${party().handle} · THE PRINCESS HAS SPOKEN`;$('ballReveal').textContent=outcome==='Yes'?'YOU ARE CURSED!':'YOU ESCAPED!';$('verdictCurse').textContent=outcome==='Yes'?`Your curse: ${party().curse||'No curse has been set.'}`:`Mercy, this time. The court’s curse: ${party().curse||'No curse has been set.'}`;$('ballCallout').classList.add('revealed');completeReveal();};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)finishReveal();else timer=setTimeout(()=>finishReveal?.(),4800);
};
$('skip').onclick=$('skipGrid').onclick=()=>finishReveal?.();
function chooseStage(crystal){if(busy)return;document.querySelectorAll('[data-category]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});$('gridStage').hidden=crystal;$('crystalStage').hidden=!crystal;$('chooseGrid').classList.toggle('selected',!crystal);$('chooseCrystal').classList.toggle('selected',crystal);$('chooseGrid').setAttribute('aria-pressed',String(!crystal));$('chooseCrystal').setAttribute('aria-pressed',String(crystal));}
$('chooseGrid').onclick=()=>{const b=state.banks.find(b=>b.type==='Words');if(b)$('playBank').value=b.id;chooseStage(false);resetStage();renderGrid();};$('chooseCrystal').onclick=()=>chooseStage(true);
document.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{if(busy)return;const current=selectedBank(),b=current.type===button.dataset.category?current:state.banks.find(b=>b.type===button.dataset.category);if(!b)return toast('Add a collection of this type first.');$('playBank').value=b.id;chooseStage(false);resetStage();renderGrid();});
$('openCollections').onclick=()=>document.querySelector('[data-tab="banks"]').click();
$('collectionFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Please use a list smaller than 2 MB.');const entries=parseEntries(await file.text(),$('bankType').value);if(!entries.length)throw Error('No entries found.');uploadedCollection=true;$('bankName').value=file.name.replace(/\.txt$/i,'');$('entries').value=formatEntries(entries,$('bankType').value);$('uploadStatus').textContent=entries.length+' unique entries loaded. Save creates a NEW collection and preserves your existing lists.';}catch(err){toast(err.message);}e.target.value='';};
$('openRegistry').onclick=()=>$('registryDialog').showModal();$('closeRegistry').onclick=()=>$('registryDialog').close();
$('playBank').onchange=()=>{stage.reset();$('wordReveal').textContent='Let fate choose.';$('wordCaption').textContent='YOUR STORY BEGINS WITH…';$('wordDescription').textContent='';renderGrid();};
$('handle').oninput=()=>{party().handle=$('handle').value;save();updateProgress();renderReplacements();};
function renderResults(){const p=party();renderReplacements();$('registryCount').textContent=String(p.results.length);$('count').textContent=`· ${p.results.length}`;$('results').replaceChildren();if(!p.results.length)$('results').append(element('p','The chronicle is waiting. Spin for your first prompt.','empty'));p.results.slice().reverse().forEach(r=>{const row=element('div','','result'),d=element('div','','detail');d.append(element('strong',r.handle+' · '+r.value),element('small',r.kind+' · '+new Date(r.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})));if(r.description)d.append(element('div',r.description));if(r.replacedById){const replacement=p.results.find(x=>x.id===r.replacedById);d.append(element('small','TRADED IN → '+(replacement?.value||'Mirror challenge'),'tradeNote'));}if(r.replacesId){const original=p.results.find(x=>x.id===r.replacesId);d.append(element('small','MANDATORY · replaces '+(original?.value||'original result'),'tradeNote'));}const edit=element('button','Edit'),del=element('button','Delete');edit.onclick=()=>{const handle=prompt('Discord handle',r.handle);if(handle===null)return;if((r.replacesId||r.replacedById)&&normalize(handle)!==normalize(r.handle))return toast('A linked Mirror trade must stay with the same writer.');const value=prompt('Result',r.value);if(value===null)return;if(!handle.trim()||!value.trim())return toast('Handle and result cannot be empty.');const description=prompt('Description',r.description);if(description===null)return;Object.assign(r,{handle:handle.trim(),value:value.trim(),description});save();renderResults();};del.onclick=()=>{if(confirm('Delete this result? Its word stays retired for this party.')){try{removeResult(p,r.id);save();renderResults();renderArchives();updateProgress();}catch(err){toast(err.message);}}};row.append(d,edit,del);$('results').append(row);});}
function transcript(){const p=party();return ['♛ THE ROYAL WHEELHOUSE · '+partyId(p.date),'Royal Decree: '+p.decree,'Current Curse: '+p.curse,'',...p.results.map(r=>r.handle+' · '+r.kind+': '+r.value+(r.description?' — '+r.description:'')+(r.replacedById?' [TRADED IN — see Mirror replacement]':'')+(r.replacesId?' [MANDATORY — replaces '+(p.results.find(x=>x.id===r.replacesId)?.value||'original')+']':''))].join('\n');}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied to clipboard.');}catch{if(!$('chunkDialog').open)$('chunkDialog').showModal();$('chunkList').replaceChildren(element('p','Clipboard unavailable. Select and copy this text:'));const ta=element('textarea');ta.value=text;$('chunkList').append(ta);ta.focus();ta.select();}}
$('copyAll').onclick=()=>copy(transcript());$('chunks').onclick=()=>{const parts=chunks(transcript());$('chunkList').replaceChildren(...parts.map((text,i)=>{const div=element('div','','chunk'),ta=element('textarea');ta.value=text;ta.readOnly=true;const b=element('button',`Copy chunk ${i+1} · ${text.length} characters`);b.onclick=()=>copy(text);div.append(b,ta);return div;}));$('chunkDialog').showModal();};$('closeChunks').onclick=()=>$('chunkDialog').close();
function openEditor(isNew){editingNew=isNew;const p=party();$('editorTitle').textContent=isNew?'Begin a new party':'Edit this party';$('date').value=isNew?today():p.date;$('decree').value=p.decree;$('curse').value=p.curse;$('editor').showModal();}
$('newParty').onclick=()=>openEditor(true);$('setup').onclick=()=>openEditor(false);$('cancelEditor').onclick=()=>$('editor').close();$('partyForm').onsubmit=e=>{e.preventDefault();if(editingNew){const p=makeParty($('date').value,$('decree').value,$('curse').value);state.parties.push(p);state.active=p.id;}else Object.assign(party(),{date:$('date').value,decree:$('decree').value,curse:$('curse').value});save();$('editor').close();$('answer').textContent='✧';$('wordReveal').textContent='Let fate choose.';render();};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!==b.dataset.tab);document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n===b));if(b.dataset.tab==='banks')loadBank();if(b.dataset.tab==='archives')renderArchives();});
function loadBank(){uploadedCollection=false;options($('editBank'),$('editBank').value);const b=state.banks.find(x=>x.id===$('editBank').value);$('bankName').value=b.name;$('bankType').value=b.type;$('entries').value=formatEntries(b.entries,b.type);$('entryHelp').textContent=b.type==='Tarot'?'Tarot format: card name | upright meaning | reversed meaning. Each orientation is equally likely.':'One entry per line: name | optional description.';}
$('bankType').onchange=()=>{$('entryHelp').textContent=$('bankType').value==='Tarot'?'Tarot format: card name | upright meaning | reversed meaning. Each orientation is equally likely.':'One entry per line: name | optional description.';};$('editBank').onchange=loadBank;$('saveBank').onclick=()=>{const name=$('bankName').value.trim(),entries=parseEntries($('entries').value,$('bankType').value);if(!name||!entries.length)return toast('Give the bank a name and at least one entry.');let b;if(uploadedCollection){b={id:uid(),name,type:$('bankType').value,entries};state.banks.push(b);options($('editBank'),b.id);}else{b=state.banks.find(x=>x.id===$('editBank').value);Object.assign(b,{name,type:$('bankType').value,entries});}save();loadBank();render();toast('Collection saved.');};
$('addBank').onclick=()=>{const name=prompt('Name your new bank');if(!name?.trim())return;const b=bank(name.trim(),'Words','Your first word');state.banks.push(b);save();options($('editBank'),b.id);loadBank();render();};$('deleteBank').onclick=()=>{if(state.banks.length===1)return toast('Keep at least one bank.');if(confirm('Delete this bank? Saved results are preserved.')){state.banks=state.banks.filter(b=>b.id!==$('editBank').value);save();loadBank();render();}};
function renderArchives(){$('archiveList').replaceChildren(...state.parties.slice().reverse().map(p=>{const div=element('div','','archive'),text=element('div',`${partyId(p.date)}${p.id===state.active?' · Current party':''}`);text.append(element('small',` · ${p.results.length} results · ${p.date}`));const b=element('button',p.id===state.active?'Return to party':'Open party');b.onclick=()=>{state.active=p.id;save();render();$('answer').textContent='✧';$('wordReveal').textContent='Let fate choose.';document.querySelector('[data-tab="play"]').click();};div.append(text,b);return div;}));}
function download(data,name){const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=element('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>download(JSON.stringify(state,null,2),`royal-wheelhouse-${today()}.json`);$('import').onclick=()=>$('backupFile').click();$('backupFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw new Error('Backup exceeds 10 MB');const incoming=validateBackup(JSON.parse(await file.text()));if(confirm('Replace local parties and banks with this backup? A safety backup of your current data will download first.')){download(JSON.stringify(state,null,2),`royal-wheelhouse-before-import-${today()}.json`);state=upgrade(incoming);sound.setEnabled(state.settings.sound);renderSound();save();loadBank();render();toast('Backup restored.');}}catch(err){toast('Backup not imported: '+err.message);}e.target.value='';};
render();loadBank();save();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async reg=>{await navigator.serviceWorker.ready;$('offlineStatus').textContent='✦ Offline ready';}).catch(()=>$('offlineStatus').textContent='Offline install unavailable');}else $('offlineStatus').textContent='Use localhost or HTTPS for offline mode';
