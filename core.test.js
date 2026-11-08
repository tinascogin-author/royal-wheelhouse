import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomIndex,parseEntries,available,chunks,partyId,validateBackup,replacementChoices,addResult,removeResult,drawTarot,formatEntries} from './core.js';
test('secure rejection sampling discards biased tail',()=>{let values=[4294967295,7];assert.equal(randomIndex(3,{getRandomValues(a){a[0]=values.shift();}}),1);assert.equal(values.length,0);});
test('words deduplicate and remain retired across banks',()=>{const entries=parseEntries('Moon | light\n moon | duplicate\nStar');assert.equal(entries.length,2);assert.equal(available({type:'Words',entries},['moon']).length,1);assert.equal(available({type:'Tarot',entries},['moon']).length,2);});
test('Discord chunks never exceed 1000 characters and preserve text',()=>{for(const text of ['a'.repeat(4001),'hello\n'.repeat(900)]){const parts=chunks(text);assert.ok(parts.every(s=>s.length<=1000));assert.equal(parts.join('').replaceAll('\n',''),text.replaceAll('\n',''));}});
test('party date formats correctly and corrupt backups reject',()=>{assert.equal(partyId('2026-11-08'),'PPP 11082026');assert.throws(()=>validateBackup({version:2}));assert.throws(()=>validateBackup({version:1,banks:[],parties:[]}));});
test('Tarot imports and editing round-trip upright and reversed meanings separately',()=>{
  const entries=parseEntries('The Moon | Uncertainty | Clarity\nThe Fool | A beginning | A careless risk','Tarot');
  assert.equal(entries[0].description,'Uncertainty');assert.equal(entries[0].reversedDescription,'Clarity');
  assert.deepEqual(parseEntries(formatEntries(entries,'Tarot'),'Tarot'),entries);
  assert.equal(parseEntries('Potion | A description | with a pipe')[0].description,'A description | with a pipe');
});
test('Tarot orientation uses its own random draw and selects the correct meaning without mutating the entry',()=>{
  const entry={name:'The Moon',description:'Uncertainty',reversedDescription:'Clarity'};const sizes=[];
  const up=drawTarot(entry,size=>{sizes.push(size);return 0;}),down=drawTarot(entry,size=>{sizes.push(size);return 1;});
  assert.deepEqual(sizes,[2,2]);assert.equal(up.orientation,'Upright');assert.equal(up.description,'Uncertainty');assert.equal(down.orientation,'Reversed');assert.equal(down.description,'Clarity');assert.equal(down.displayName,'The Moon (Reversed)');assert.equal(entry.description,'Uncertainty');
  const missing=drawTarot({name:'Custom',description:'Positive'},()=>1);assert.match(missing.description,/No reversed meaning/);assert.notEqual(missing.description,'Positive');
});
test('Mirror links only an eligible result for the same writer, preserves history and restores on deletion',()=>{
  const p={results:[{id:'word',handle:'@Royal',type:'Words',value:'Moon'},{id:'other',handle:'@other',type:'Potions',value:'Mist'}]};
  const mirror={id:'mirror',handle:'@royal',type:'Magic Mirror',value:'Cannot wink'};
  assert.throws(()=>addResult(p,mirror,'other'));assert.equal(p.results.length,2);
  addResult(p,mirror,'word');assert.equal(p.results[0].replacedById,'mirror');assert.equal(mirror.replacesId,'word');assert.equal(p.results[0].value,'Moon');
  assert.equal(replacementChoices(p,'@Royal').length,0);assert.throws(()=>removeResult(p,'word'));
  assert.throws(()=>addResult(p,{id:'again',handle:'@royal',type:'Magic Mirror'},'word'));
  removeResult(p,'mirror');assert.equal(p.results[0].replacedById,undefined);assert.equal(replacementChoices(p,'@Royal').length,1);
});
test('Poison collections and linked Mirror backups validate; broken trade references reject',()=>{
  const make=(id,type)=>({id,handle:'@writer',type,kind:type,value:'Result',description:'Meaning',time:'2026-11-08T12:00:00Z'});
  const p={id:'p',date:'2026-11-08',decree:'Write',curse:'Oops',handle:'@writer',used:[],results:[make('original','Poisons')]};
  addResult(p,make('mirror','Magic Mirror'),'original');
  const s={version:1,active:'p',settings:{sound:false},banks:[{id:'b',name:'Poisons',type:'Poisons',entries:[{name:'Venom',description:'A consequence'}]}],parties:[p]};
  assert.equal(validateBackup(s),s);const broken=structuredClone(s);broken.parties[0].results[1].replacesId='missing';assert.throws(()=>validateBackup(broken));
  s.banks.push({id:'tarot',name:'Tarot',type:'Tarot',entries:[{name:'Moon',description:'Upright meaning',reversedDescription:'Reversed meaning'}]});
  p.results.push({...make('card','Tarot'),orientation:'Reversed',cardName:'Moon',value:'Moon (Reversed)'});assert.equal(validateBackup(s),s);
  const invalid=structuredClone(s);invalid.parties[0].results.at(-1).orientation='Sideways';assert.throws(()=>validateBackup(invalid));
});
