import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterLibrary,createStarterBanks,populateStarters} from './starter-library.js';
import {legacyStarters} from './legacy-starters.js';
import {available,normalize,validateBackup} from './core.js';
let id=0;const uid=()=>`library-test-${++id}`;
function state(banks){return {version:1,active:'party',banks,parties:[{id:'party',date:'2026-11-09',handle:'@princess',decree:'Keep me',curse:'Keep this too',used:['velvet'],results:[]} ]};}
test('starter libraries contain unique editable entries and all 78 Tarot cards with both meanings',()=>{
 const counts=Object.fromEntries(starterLibrary.map(b=>[b.name,b.entries.length]));
 assert.ok(counts['The Royal Collection']>=250);
 for(const name of ['Halloween','Thanksgiving','Christmas'])assert.equal(counts[name],60);
 for(const b of starterLibrary){assert.equal(new Set(b.entries.map(e=>normalize(e.name))).size,b.entries.length);assert.ok(b.entries.every(e=>e.name&&typeof e.description==='string'));}
 const tarot=starterLibrary.find(b=>b.type==='Tarot');assert.equal(tarot.entries.length,78);
 assert.ok(tarot.entries.every(e=>e.description&&e.reversedDescription&&e.description!==e.reversedDescription));
 for(const suit of ['Wands','Cups','Swords','Pentacles'])assert.equal(tarot.entries.filter(e=>e.name.endsWith(`of ${suit}`)).length,14);
 const a=createStarterBanks(uid),b=createStarterBanks(uid);a[0].entries[0].name='Custom';assert.notEqual(b[0].entries[0].name,'Custom');
});
test('legacy samples expand without resetting party history, ids, or word retirement',()=>{
 const s=state(structuredClone(legacyStarters).map(b=>({...b,id:uid()})));
 // The app has already filled these three reversal fields before library migration.
 const meanings=['Careless risks, poor preparation, or misplaced trust.','Deception, manipulation, or a gift that goes unused.','Uncertainty begins to clear, though misunderstandings may remain.'];
 s.banks.find(b=>b.type==='Tarot').entries.forEach((e,i)=>e.reversedDescription=meanings[i]);
 const parties=structuredClone(s.parties),bankId=s.banks[0].id;
 populateStarters(s,uid);assert.deepEqual(s.parties,parties);assert.equal(s.banks[0].id,bankId);assert.ok(s.banks[0].entries.length>250);
 assert.ok(!available(s.banks[0],s.parties[0].used).some(e=>normalize(e.name)==='velvet'));
 assert.equal(s.banks.find(b=>b.type==='Tarot').entries.length,78);
 validateBackup(s);const before=structuredClone(s);populateStarters(s,uid);assert.deepEqual(s,before);
 s.banks.pop();const count=s.banks.length;populateStarters(s,uid);assert.equal(s.banks.length,count);
});
test('modified, renamed, reordered, and custom-described collections remain untouched',()=>{
 for(const change of [b=>b.name='My favorites',b=>b.entries.reverse(),b=>b.entries[0].description='Princess wrote this',b=>b.entries.push({name:'New prompt',description:''})]){
  const b={...structuredClone(legacyStarters[0]),id:uid()};change(b);const original=structuredClone(b),s=state([b]);populateStarters(s,uid);assert.deepEqual(s.banks[0],original);assert.ok(s.banks.some(x=>x.id!==b.id&&x.type==='Words'&&x.entries.length>=250));
 }
});
import {princessLibrary} from './princess-library.js';
test('Princess collections retain supplied sizes and definitions and support new backup types',()=>{
 assert.deepEqual(Object.fromEntries(princessLibrary.map(b=>[b.type,b.entries.length])),{'Tarot':78,'Magic Mirror':233,'Story Spindle':14,'Perspective Portal':9,'Tense Tiara':3,'Genre Genie':34,'Potions':50,'Poisons':50});
 for(const type of ['Story Spindle','Perspective Portal','Potions','Poisons'])assert.ok(princessLibrary.find(b=>b.type===type).entries.every(e=>e.description));
 const s=state(createStarterBanks(uid));s.parties[0].results=['Story Spindle','Perspective Portal','Tense Tiara'].map(type=>({id:uid(),type,kind:type,handle:'@princess',value:'A saved result',description:'Definition',time:'2026-11-09T12:00:00Z'}));
 validateBackup(JSON.parse(JSON.stringify(s)));
 s.features={starterLibraryVersion:1};const b=s.banks.find(b=>b.type==='Magic Mirror');b.entries[0].name='My custom Mirror challenge';const saved=structuredClone(b);populateStarters(s,uid);assert.deepEqual(b,saved);assert.ok(s.banks.some(x=>x.name==='Royal Library — Magic Mirror'&&x.entries.length===233));
});
import {originalPerspectives} from './princess-library.js';
test('the seven-entry Portal upgrades in place to nine and preserves custom collections',()=>{
 const bank={id:'portal',name:'Perspective Portal',type:'Perspective Portal',entries:structuredClone(originalPerspectives)};
 const s=state([bank]);s.features={starterLibraryVersion:2};const parties=structuredClone(s.parties);populateStarters(s,uid);
 assert.equal(bank.id,'portal');assert.equal(bank.entries.length,9);assert.deepEqual(s.parties,parties);assert.equal(s.banks.length,1);
 assert.equal(bank.entries[7].name,'Third-Person Multiple');assert.equal(bank.entries[8].name,'First-Person Multiple');
 populateStarters(s,uid);assert.equal(s.banks.length,1);
 const custom=state([{...structuredClone(bank),entries:[{name:'My viewpoint',description:'My meaning'}]}]);custom.features={starterLibraryVersion:2};populateStarters(custom,uid);assert.equal(custom.banks[0].entries[0].name,'My viewpoint');assert.equal(custom.banks[1].entries.length,9);
});
