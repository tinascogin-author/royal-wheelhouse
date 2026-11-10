import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawPool,retireDraw,chooseEntry,decreeChoice,setDecreeChoice,noRepeatTypes} from './party-rules.js';
import {balance,transaction,sprintAwards} from './privileges.js';
import {validateBackup} from './core.js';
const party=()=>({id:'p',date:'2026-11-10',decree:'A decree',curse:'A curse',handle:'@writer',used:[],results:[]});
const bank=type=>({id:type,name:type,type,entries:['Alpha','Beta','Gamma'].map(name=>({name,description:'Meaning'}))});
test('all requested categories draw without replacement and retain history through deletion and backups',()=>{
 for(const type of noRepeatTypes){const b=bank(type),p=party(),names=[];for(let i=0;i<3;i++){const e=chooseEntry(b,p,[b],n=>n-1);names.push(e.name);retireDraw(b,e,p,[b]);}assert.deepEqual(names,['Gamma','Beta','Alpha']);assert.equal(new Set(names).size,3);p.results=[];const restored=JSON.parse(JSON.stringify(p));if(type!=='Perspective Portal'){assert.equal(drawPool(b,restored,[b]).length,0);assert.throws(()=>chooseEntry(b,restored,[b]));}else assert.ok(drawPool(b,restored,[b]).every(e=>e.name!=='Alpha'));}
});
test('legacy Tarot draws retire the card across orientations and banks, and Curse stays independent',()=>{
 const b=bank('Tarot'),p=party();p.results=[{type:'Tarot',value:'Alpha (Reversed)',cardName:'Alpha'}];assert.deepEqual(drawPool(b,p,[b]).map(e=>e.name),['Beta','Gamma']);retireDraw(b,b.entries[1],p,[b]);p.results=[];assert.deepEqual(drawPool({...b,id:'custom'},p).map(e=>e.name),['Gamma']);assert.equal(drawPool(bank('Tense Tiara'),p).length,3);assert.equal(drawPool(bank('Magic Mirror'),p).length,3);
});
test('nine perspectives finish a round before repeats and never repeat across round boundaries',()=>{
 const b=bank('Perspective Portal');b.entries=Array.from({length:9},(_,i)=>({name:'View '+i,description:''}));const p=party();let last;
 for(let round=0;round<4;round++){const seen=new Set();for(let i=0;i<9;i++){const e=chooseEntry(b,p,[b],()=>0);assert.notEqual(e.name,last);assert.ok(!seen.has(e.name));seen.add(e.name);retireDraw(b,e,p,[b]);last=e.name;}assert.equal(seen.size,9);}
});
test('decree decisions stay per writer and never decide the curse',()=>{
 const p=party();setDecreeChoice(p,'@Alice','No');setDecreeChoice(p,'@Bob','Yes');assert.equal(decreeChoice(p,'@ALICE'),'No');assert.equal(decreeChoice(p,'@Bob'),'Yes');assert.equal(decreeChoice(p,'@new'),'');assert.equal(p.results.length,0);assert.equal(p.curse,'A curse');assert.throws(()=>setDecreeChoice(p,'','Yes'));
});
test('optional sprint awards handle ties, zero words, and invalid or duplicate handles',()=>{
 const ranked=sprintAwards([{handle:'A',words:50},{handle:'B',words:50},{handle:'C',words:30},{handle:'D',words:20},{handle:'E',words:10},{handle:'F',words:0}]);assert.deepEqual(ranked.map(r=>r.points),[5,5,3,2,1,0]);assert.throws(()=>sprintAwards([{handle:'A',words:1},{handle:'a',words:2}]));assert.throws(()=>sprintAwards([{handle:'A',words:-1}]));
});
test('ledger awards, payments, transfers, and adjustments preserve balances; invalid moves do not mutate',()=>{
 const ledger=[];let id=0;const t=args=>transaction(ledger,{id:String(++id),time:'2026-11-10',...args});t({to:'@A',amount:5});t({from:'@a',to:'@B',amount:2});t({from:'@B',amount:1});assert.equal(balance(ledger,'@A'),3);assert.equal(balance(ledger,'@b'),1);const before=JSON.stringify(ledger);for(const args of [{from:'@A',amount:4},{from:'@a',to:'@A',amount:1},{to:'@C',amount:1.2},{to:'',amount:1}])assert.throws(()=>t(args));assert.equal(JSON.stringify(ledger),before);
 const s={version:1,active:'p',banks:[bank('Words')],parties:[party()],privileges:{ledger,prices:{Words:2}}};validateBackup(JSON.parse(JSON.stringify(s)));s.privileges.ledger[0].amount=-1;assert.throws(()=>validateBackup(s));
});
