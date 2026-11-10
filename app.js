import {discordTranscript} from './discord-results.js';
import {palaceThemes,palaceTheme} from './palace-themes.js';
import {drawPool,retireDraw,decreeChoice,setDecreeChoice} from './party-rules.js';
import {balance,transaction,sprintAwards} from './privileges.js';
import {createStarterBanks,populateStarters} from './starter-library.js';
import {randomIndex,normalize,available,parseEntries,chunks,partyId,validateBackup,addResult,removeResult,replacementChoices,drawTarot,formatEntries} from './core.js';
import {createSoundSystem} from './sounds.js';
import {createRevealStage,revealDetails} from './magic-reveals.js';
const $ = id => document.getElementById(id), key='royal-wheelhouse-v1';
const uid=()=>crypto.randomUUID();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const makeParty=(date=today(),decree='Write boldly. Delight the court.',curse='Include an unexpected royal interruption.')=>({id:uid(),date,decree,curse,handle:'',used:[],results:[]});
const bank=(name,type,text)=>({id:uid(),name,type,entries:parseEntries(text)});
function initial(){const p=makeParty();return {version:1,active:p.id,parties:[p],banks:createStarterBanks(uid)};}
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
  populateStarters(s,uid);
  s.privileges ||= {ledger:[],prices:{}};
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
function render(){renderPalace();const p=party();chooseStage(false);resetStage();$('partyId').value=partyId(p.date);$('handle').value=p.handle;$('decreeText').textContent=p.decree||'No decree has been issued.';$('decreePanel').hidden=p.decreeEnabled===false||!p.decree;renderWriter();$('curseText').textContent=p.curse||'No curse has been set.';options($('playBank'),$('playBank').value);renderGrid();renderResults();renderArchives();}
function resetStage(){stage.reset();$('wordReveal').textContent='Let fate choose.';$('wordDescription').textContent='';$('wordCaption').textContent='YOUR STORY BEGINS WITH…';$('wordCallout').classList.remove('revealed');$('ballReveal').textContent='Will you escape?';$('ballCaption').textContent='A QUESTION ONLY FATE CAN ANSWER';$('verdictCurse').textContent='';$('answer').textContent='✧';$('orb').classList.remove('cursed','escaped');$('sparkles').replaceChildren();}
function renderGrid(){
  const b=selectedBank(),entries=drawPool(b,party(),state.banks);
  stage.configure(b.type,b.entries);$('remaining').textContent=entries.length+' '+(b.type==='Words'?'words remaining':'entries');
  $('spin').disabled=busy||!entries.length;$('remaining').title=b.type==='Perspective Portal'?'No repeats until the round finishes; then a fresh round starts.':'Used entries stay retired for this party.';syncCategory(b.type);updateProgress();renderReplacements();
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
  const extra=$('mirrorMode').value==='extra';$('tradeLabel').hidden=extra;
  $('replacementHint').textContent=extra?'Keep every existing result and add one mandatory Mirror challenge.':choices.length?'The Mirror’s challenge is mandatory. Your original stays in history.':'This writer needs an active result before using the Mirror.';
  if(selectedBank().type==='Magic Mirror')$('spin').disabled=busy||(!extra&&!choices.length)||!drawPool(selectedBank(),party(),state.banks).length;
}
function record(kind,value,description='',type=selectedBank().type,replaceId,metadata={}){
  const p=party(),r={id:uid(),handle:p.handle.trim(),kind,value,description,type,...metadata,time:new Date().toISOString()};
  addResult(p,r,replaceId);save();renderResults();return r;
}
function requireHandle(){if(!$('handle').value.trim()){toast('Enter the current victim’s Discord handle first.');$('handle').focus();return false;}party().handle=$('handle').value.trim();return true;}
function lock(on){busy=on;['spin','consult','newParty','setup','playBank','handle','chooseGrid','chooseCrystal','openRegistry','openCollections','replaceResult','mirrorMode','paymentMode','decreeChoice','openPrivileges'].forEach(id=>$(id).disabled=on);document.querySelectorAll('nav button, [data-category]').forEach(b=>b.disabled=on);$('theater').classList.toggle('isRevealing',on);}
function burst(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('sparkles').replaceChildren(...Array.from({length:28},(_,i)=>{const s=element('i',i%3?'✦':'✧');const angle=i/28*Math.PI*2;s.style.setProperty('--x',`${Math.cos(angle)*(160+randomIndex(230))}px`);s.style.setProperty('--y',`${Math.sin(angle)*(120+randomIndex(190))}px`);s.style.setProperty('--delay',`${randomIndex(180)}ms`);return s;}));}
function completeReveal(){lock(false);$('spin').disabled=!available(selectedBank(),party().used).length;renderReplacements();$('skip').hidden=true;$('skipGrid').hidden=true;finishReveal=null;burst();}
$('spin').onclick=()=>{
  if(busy||!requireHandle())return;
  const b=selectedBank(),pool=available(b,party().used);if(!pool.length)return;
  const replaceId=b.type==='Magic Mirror'&&$('mirrorMode').value!=='extra'?$('replaceResult').value:undefined;
  if(b.type==='Magic Mirror'&&$('mirrorMode').value!=='extra'&&!replacementChoices(party(),party().handle).some(r=>r.id===replaceId))return toast('Choose an active result for this writer to trade in.');
  const traded=replaceId?party().results.find(r=>r.id===replaceId):null;
  const selected=pool[randomIndex(pool.length)],winner=b.type==='Tarot'?drawTarot(selected):selected;
  let cost=0;try{if(party().privilegesEnabled&&$('paymentMode').value==='privileges'){cost=state.privileges.prices[b.type]??1;if(cost)transaction(state.privileges.ledger,{id:uid(),from:party().handle,amount:cost,note:'Spin: '+b.name,time:new Date().toISOString()});}}catch(err){toast(err.message);return;}
  retireDraw(b,winner,party(),state.banks);
  record(b.name,winner.displayName||winner.name,winner.description,b.type,replaceId,{...(b.type==='Tarot'?{orientation:winner.orientation,cardName:winner.name}:{}),...(cost?{privilegeCost:cost}:{})});renderPayment();renderGrid();lock(true);
  let timer;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,info=revealDetails[b.type];
  $('wordCallout').classList.remove('revealed');$('wordCaption').textContent='THE COURT HOLDS ITS BREATH';$('wordReveal').textContent=info.waiting;$('wordDescription').textContent='';$('skipGrid').hidden=false;
  const animation=stage.start(b.type,reduced,winner);sound.start(b.type,reduced?0:animation.duration,animation.degrees);
  finishReveal=()=>{if(!busy||!finishReveal)return;clearTimeout(timer);stage.finish(b.type,winner);sound.reveal(b.type);$('wordCaption').textContent=party().handle+(b.type==='Magic Mirror'?' · YOUR NEW MANDATORY CHALLENGE':' · YOUR ROYAL PROMPT');$('wordReveal').textContent=winner.displayName||winner.name;$('wordDescription').textContent=(traded?'Replaces “'+traded.value+'”. ':'')+winner.description;$('wordCallout').classList.add('revealed');completeReveal();};
  if(reduced)finishReveal();else timer=setTimeout(()=>finishReveal?.(),animation.duration);
};
$('consult').onclick=()=>{
  if(busy||!requireHandle())return;
  const outcome=randomIndex(2)===0?'Yes':'No';record('Curse Crystal Ball',outcome,outcome==='Yes'?'Curse: '+party().curse:'Escaped the curse.','Curse');lock(true);sound.start('Curse',4800);
  $('orb').classList.remove('cursed','escaped');$('orb').classList.add('thinking');$('answer').textContent='✧';$('ballCallout').classList.remove('revealed');$('ballCaption').textContent='THE FATES ARE DELIBERATING';$('ballReveal').textContent='The crystal awakens…';$('verdictCurse').textContent='';$('skip').hidden=false;
  let timer;
  finishReveal=()=>{if(!busy||!finishReveal)return;clearTimeout(timer);sound.reveal(outcome==='Yes'?'Cursed':'Escaped');$('answer').textContent=outcome==='Yes'?'☾':'✦';$('orb').classList.remove('thinking');$('orb').classList.add(outcome==='Yes'?'cursed':'escaped');$('ballCaption').textContent=`${party().handle} · THE PRINCESS HAS SPOKEN`;$('ballReveal').textContent=outcome==='Yes'?'YOU ARE CURSED!':'YOU ESCAPED!';$('verdictCurse').textContent=outcome==='Yes'?`Your curse: ${party().curse||'No curse has been set.'}`:`Mercy, this time. The court’s curse: ${party().curse||'No curse has been set.'}`;$('ballCallout').classList.add('revealed');completeReveal();};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)finishReveal();else timer=setTimeout(()=>finishReveal?.(),4800);
};
$('skip').onclick=$('skipGrid').onclick=()=>finishReveal?.();
function chooseStage(crystal){if(busy)return;document.querySelectorAll('[data-category]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});$('gridStage').hidden=crystal;$('crystalStage').hidden=!crystal;$('chooseGrid').classList.toggle('selected',!crystal);$('chooseCrystal').classList.toggle('selected',crystal);$('chooseGrid').setAttribute('aria-pressed',String(!crystal));$('chooseCrystal').setAttribute('aria-pressed',String(crystal));}
$('chooseGrid').onclick=()=>{const b=state.banks.find(b=>b.type==='Words');if(b)$('playBank').value=b.id;$('paymentMode').value='free';chooseStage(false);resetStage();renderGrid();};$('chooseCrystal').onclick=()=>chooseStage(true);
document.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{if(busy)return;const current=selectedBank(),b=current.type===button.dataset.category?current:state.banks.find(b=>b.type===button.dataset.category);if(!b)return toast('Add a collection of this type first.');$('playBank').value=b.id;chooseStage(false);resetStage();renderGrid();});
$('openCollections').onclick=()=>document.querySelector('[data-tab="banks"]').click();
$('collectionFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Please use a list smaller than 2 MB.');const entries=parseEntries(await file.text(),$('bankType').value);if(!entries.length)throw Error('No entries found.');uploadedCollection=true;$('bankName').value=file.name.replace(/\.txt$/i,'');$('entries').value=formatEntries(entries,$('bankType').value);$('uploadStatus').textContent=entries.length+' unique entries loaded. Save creates a NEW collection and preserves your existing lists.';}catch(err){toast(err.message);}e.target.value='';};
$('openRegistry').onclick=()=>$('registryDialog').showModal();$('closeRegistry').onclick=()=>$('registryDialog').close();
$('playBank').onchange=()=>{$('paymentMode').value='free';stage.reset();$('wordReveal').textContent='Let fate choose.';$('wordCaption').textContent='YOUR STORY BEGINS WITH…';$('wordDescription').textContent='';renderGrid();};
$('handle').oninput=()=>{party().handle=$('handle').value;$('paymentMode').value='free';save();updateProgress();renderReplacements();renderWriter();};
function renderResults(){const p=party();renderReplacements();$('registryCount').textContent=String(p.results.length);$('count').textContent=`· ${p.results.length}`;$('results').replaceChildren();if(!p.results.length)$('results').append(element('p','The chronicle is waiting. Spin for your first prompt.','empty'));p.results.slice().reverse().forEach(r=>{const row=element('div','','result'),d=element('div','','detail');d.append(element('strong',r.handle+' · '+r.value),element('small',r.kind+' · '+new Date(r.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})));if(r.description)d.append(element('div',r.description));if(r.type==='Magic Mirror'&&!r.replacesId)d.append(element('small','MANDATORY EXTRA · no result traded','tradeNote'));if(r.privilegeCost)d.append(element('small',r.privilegeCost+' Princess Privileges spent','tradeNote'));if(r.replacedById){const replacement=p.results.find(x=>x.id===r.replacedById);d.append(element('small','TRADED IN → '+(replacement?.value||'Mirror challenge'),'tradeNote'));}if(r.replacesId){const original=p.results.find(x=>x.id===r.replacesId);d.append(element('small','MANDATORY · replaces '+(original?.value||'original result'),'tradeNote'));}const edit=element('button','Edit'),del=element('button','Delete');edit.onclick=()=>{const handle=prompt('Discord handle',r.handle);if(handle===null)return;if((r.replacesId||r.replacedById)&&normalize(handle)!==normalize(r.handle))return toast('A linked Mirror trade must stay with the same writer.');const value=prompt('Result',r.value);if(value===null)return;if(!handle.trim()||!value.trim())return toast('Handle and result cannot be empty.');const description=prompt('Description',r.description);if(description===null)return;Object.assign(r,{handle:handle.trim(),value:value.trim(),description});save();renderResults();};del.onclick=()=>{if(confirm('Delete this result? Its word stays retired for this party.')){try{removeResult(p,r.id);save();renderResults();renderArchives();updateProgress();}catch(err){toast(err.message);}}};row.append(d,edit,del);$('results').append(row);});}
function transcript(){return discordTranscript(party(),state.banks);}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied to clipboard.');}catch{if(!$('chunkDialog').open)$('chunkDialog').showModal();$('chunkList').replaceChildren(element('p','Clipboard unavailable. Select and copy this text:'));const ta=element('textarea');ta.value=text;$('chunkList').append(ta);ta.focus();ta.select();}}
$('copyAll').onclick=()=>copy(transcript());$('chunks').onclick=()=>{const parts=chunks(transcript());$('chunkList').replaceChildren(...parts.map((text,i)=>{const div=element('div','','chunk'),ta=element('textarea');ta.value=text;ta.readOnly=true;const b=element('button',`Copy chunk ${i+1} · ${text.length} characters`);b.onclick=()=>copy(text);div.append(b,ta);return div;}));$('chunkDialog').showModal();};$('closeChunks').onclick=()=>$('chunkDialog').close();
function openEditor(isNew){editingNew=isNew;const p=party();$('editorTitle').textContent=isNew?'Begin a new party':'Edit this party';$('date').value=isNew?today():p.date;$('decree').value=p.decree;$('curse').value=p.curse;$('decreeEnabled').checked=p.decreeEnabled!==false;$('editor').showModal();}
$('newParty').onclick=()=>openEditor(true);$('setup').onclick=()=>openEditor(false);$('cancelEditor').onclick=()=>$('editor').close();$('partyForm').onsubmit=e=>{e.preventDefault();if(editingNew){const p=makeParty($('date').value,$('decree').value,$('curse').value);p.decreeEnabled=$('decreeEnabled').checked;state.parties.push(p);state.active=p.id;}else Object.assign(party(),{date:$('date').value,decree:$('decree').value,curse:$('curse').value,decreeEnabled:$('decreeEnabled').checked});save();$('editor').close();$('answer').textContent='✧';$('wordReveal').textContent='Let fate choose.';render();};
document.querySelectorAll('nav button[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!==b.dataset.tab);document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n===b));if(b.dataset.tab==='banks')loadBank();if(b.dataset.tab==='archives')renderArchives();});
function loadBank(){uploadedCollection=false;options($('editBank'),$('editBank').value);const b=state.banks.find(x=>x.id===$('editBank').value);$('bankName').value=b.name;$('bankType').value=b.type;$('entries').value=formatEntries(b.entries,b.type);$('entryHelp').textContent=b.type==='Tarot'?'Tarot format: card name | upright meaning | reversed meaning. Each orientation is equally likely.':'One entry per line: name | optional description.';}
$('bankType').onchange=()=>{$('entryHelp').textContent=$('bankType').value==='Tarot'?'Tarot format: card name | upright meaning | reversed meaning. Each orientation is equally likely.':'One entry per line: name | optional description.';};$('editBank').onchange=loadBank;$('saveBank').onclick=()=>{const name=$('bankName').value.trim(),entries=parseEntries($('entries').value,$('bankType').value);if(!name||!entries.length)return toast('Give the bank a name and at least one entry.');let b;if(uploadedCollection){b={id:uid(),name,type:$('bankType').value,entries};state.banks.push(b);options($('editBank'),b.id);}else{b=state.banks.find(x=>x.id===$('editBank').value);Object.assign(b,{name,type:$('bankType').value,entries});}save();loadBank();render();toast('Collection saved.');};
$('addBank').onclick=()=>{const name=prompt('Name your new bank');if(!name?.trim())return;const b=bank(name.trim(),'Words','Your first word');state.banks.push(b);save();options($('editBank'),b.id);loadBank();render();};$('deleteBank').onclick=()=>{if(state.banks.length===1)return toast('Keep at least one bank.');if(confirm('Delete this bank? Saved results are preserved.')){state.banks=state.banks.filter(b=>b.id!==$('editBank').value);save();loadBank();render();}};
function renderArchives(){$('archiveList').replaceChildren(...state.parties.slice().reverse().map(p=>{const div=element('div','','archive'),text=element('div',`${partyId(p.date)}${p.id===state.active?' · Current party':''}`);text.append(element('small',` · ${p.results.length} results · ${p.date}`));const b=element('button',p.id===state.active?'Return to party':'Open party');b.onclick=()=>{state.active=p.id;save();render();$('answer').textContent='✧';$('wordReveal').textContent='Let fate choose.';document.querySelector('[data-tab="play"]').click();};div.append(text,b);return div;}));}
function download(data,name){const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=element('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>download(JSON.stringify(state,null,2),`royal-wheelhouse-${today()}.json`);$('import').onclick=()=>$('backupFile').click();$('backupFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw new Error('Backup exceeds 10 MB');const incoming=validateBackup(JSON.parse(await file.text()));if(confirm('Replace local parties and banks with this backup? A safety backup of your current data will download first.')){download(JSON.stringify(state,null,2),`royal-wheelhouse-before-import-${today()}.json`);state=upgrade(incoming);sound.setEnabled(state.settings.sound);renderSound();save();loadBank();render();toast('Backup restored.');}}catch(err){toast('Backup not imported: '+err.message);}e.target.value='';};

function renderWriter(){const p=party();$('decreeChoice').value=decreeChoice(p,p.handle);$('decreeChoiceLabel').hidden=p.decreeEnabled===false||!p.decree;renderPayment();}
$('decreeChoice').onchange=()=>{try{setDecreeChoice(party(),$('handle').value,$('decreeChoice').value);save();}catch(err){toast(err.message);renderWriter();}};
$('mirrorMode').onchange=renderReplacements;
function renderPayment(){const enabled=!!party().privilegesEnabled;$('spinPayment').hidden=!enabled;const cost=state.privileges.prices[selectedBank().type]??1;$('balanceHint').textContent=party().handle.trim()?balance(state.privileges.ledger,party().handle)+' privileges · price '+cost:'';}
$('paymentMode').onchange=renderPayment;
let sprintDraft=[];
function renderPrivileges(){const p=party();$('privilegesEnabled').checked=!!p.privilegesEnabled;$('privilegesBody').hidden=!p.privilegesEnabled;$('sprintEntries').value=p.sprintText||'';$('sprintEntries').disabled=!!p.sprintAwarded;$('previewSprint').disabled=!!p.sprintAwarded;$('awardSprint').disabled=!!p.sprintAwarded||!sprintDraft.length;$('awardSprint').textContent=p.sprintAwarded?'Sprint points awarded ✓':'Award this party’s sprint points';
 const ledger=state.privileges.ledger,handles=[...new Set(ledger.flatMap(t=>[t.from,t.to]).filter(Boolean).map(normalize))];$('privilegeBalances').replaceChildren(...handles.map(h=>element('p',h+' · '+balance(ledger,h)+' privileges')));$('privilegeLedger').replaceChildren(...ledger.slice().reverse().map(t=>element('p',(t.from||'Princess')+' → '+(t.to||'Spent')+' · '+t.amount+' · '+t.note)));renderPayment();}
$('openPrivileges').onclick=()=>{sprintDraft=[];$('sprintPreview').replaceChildren();renderPrivileges();$('privilegesDialog').showModal();};$('closePrivileges').onclick=()=>$('privilegesDialog').close();
$('privilegesEnabled').onchange=()=>{party().privilegesEnabled=$('privilegesEnabled').checked;$('paymentMode').value='free';save();renderPrivileges();};
$('sprintEntries').oninput=()=>{party().sprintText=$('sprintEntries').value;sprintDraft=[];$('awardSprint').disabled=true;$('sprintPreview').replaceChildren();save();};
$('previewSprint').onclick=()=>{try{const rows=$('sprintEntries').value.split(/\r?\n/).filter(l=>l.trim()).map(l=>{const parts=l.split('|');if(parts.length!==2||!parts[1].trim())throw Error('Use @handle | word count on each line.');return {handle:parts[0].trim(),words:Number(parts[1])};});if(!rows.length)throw Error('Enter sprint word counts first.');sprintDraft=sprintAwards(rows);$('sprintPreview').replaceChildren(...sprintDraft.map(r=>element('p',r.rank+'. '+r.handle+' · '+r.words+' words → '+r.points+' privileges')));$('awardSprint').disabled=!!party().sprintAwarded;}catch(err){sprintDraft=[];$('awardSprint').disabled=true;toast(err.message);}};
$('awardSprint').onclick=()=>{if(party().sprintAwarded||!sprintDraft.length)return;for(const r of sprintDraft)if(r.points)transaction(state.privileges.ledger,{id:uid(),to:r.handle,amount:r.points,note:'Sprint '+partyId(party().date),time:new Date().toISOString()});party().sprintAwarded=true;save();renderPrivileges();toast('Sprint privileges awarded.');};
$('adjustPrivileges').onclick=()=>{try{const n=Number($('adjustAmount').value);transaction(state.privileges.ledger,{id:uid(),from:n<0?$('adjustHandle').value:'',to:n>0?$('adjustHandle').value:'',amount:Math.abs(n),note:$('adjustNote').value||'Princess’s adjustment',time:new Date().toISOString()});save();renderPrivileges();}catch(err){toast(err.message);}};
$('transferPrivileges').onclick=()=>{try{transaction(state.privileges.ledger,{id:uid(),from:$('transferFrom').value,to:$('transferTo').value,amount:Number($('transferAmount').value),note:$('transferNote').value||'Approved barter',time:new Date().toISOString()});save();renderPrivileges();}catch(err){toast(err.message);}};
$('priceType').replaceChildren(...['Words','Tarot','Potions','Poisons','Genre Genie','Story Spindle','Perspective Portal','Tense Tiara','Magic Mirror'].map(type=>{const o=element('option',type);o.value=type;return o;}));
$('priceType').onchange=()=>{$('spinPrice').value=state.privileges.prices[$('priceType').value]??1;};$('priceType').onchange();
$('savePrice').onclick=()=>{const cost=Number($('spinPrice').value);if(!$('spinPrice').value.trim()||!Number.isSafeInteger(cost)||cost<0)return toast('Use a nonnegative whole-number price.');state.privileges.prices[$('priceType').value]=cost;save();renderPayment();toast('Spin price saved.');};


function renderPalace(){
 const selected=palaceTheme(state.settings.palace);document.body.dataset.palace=selected;
 for(const [id,theme] of [['palaceClassic','classic'],['palaceChristmas','christmas'],['palaceHalloween','halloween']])$(id).setAttribute('aria-pressed',String(selected===theme));
 $('palaceStatus').textContent=palaceThemes[selected].name+' is decorating the palace.';
 $('decoratePalace').textContent=selected==='classic'?'✧ Decorate the Palace':'✧ '+palaceThemes[selected].name+' palace';
 $('palaceWeather').replaceChildren(...(selected==='classic'?[]:Array.from({length:14},(_,i)=>{const particle=element('i',selected==='christmas'?'❄':'✦');particle.style.setProperty('--drift-x',(i%2?94+(i%5):1+(i%5))+'vw');particle.style.setProperty('--drift-delay',(-i*1.7)+'s');particle.style.setProperty('--drift-duration',(18+i%5*3)+'s');return particle;})));
}
$('decoratePalace').onclick=()=>{renderPalace();$('palaceDialog').showModal();};$('closePalace').onclick=()=>$('palaceDialog').close();
for(const [id,theme] of [['palaceClassic','classic'],['palaceChristmas','christmas'],['palaceHalloween','halloween']])$(id).onclick=()=>{state.settings.palace=theme;save();renderPalace();};

render();loadBank();save();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async reg=>{await navigator.serviceWorker.ready;$('offlineStatus').textContent='✦ Offline ready';}).catch(()=>$('offlineStatus').textContent='Offline install unavailable');}else $('offlineStatus').textContent='Use localhost or HTTPS for offline mode';
