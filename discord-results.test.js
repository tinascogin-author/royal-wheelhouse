import {test} from 'node:test';
import assert from 'node:assert/strict';
import {discordTranscript} from './discord-results.js';
import {chunks} from './core.js';
const result=(id,type,kind,value,extra={})=>({id,type,kind,value,handle:'@tina',description:'',...extra});
const party=()=>({date:'2026-11-10',decree:'Write boldly',curse:'A royal interruption',results:[result('c','Curse','Curse Crystal Ball','No'),result('w1','Words','The Royal Collection','Skeleton'),result('w2','Words','The Royal Collection','Software',{replacedById:'m'}),result('w3','Words','The Royal Collection','Door'),result('t','Tarot','Tarot','The Hanged Man (Upright)',{description:'Surrender, pause, a new perspective'}),result('m','Magic Mirror','Magic Mirror','Can only dream about places that no longer exist',{replacesId:'w2'})]});
test('Discord copies group each handle once, bold labels, combine words, and retain trade history without mutations',()=>{
 const p=party(),before=structuredClone(p),out=discordTranscript(p);assert.equal((out.match(/@tina/g)||[]).length,1);
 assert.ok(out.includes('**Curse Crystal Ball:** No'));assert.ok(out.includes('**The Royal Collection:** Skeleton, Software *[TRADED IN — see Mirror replacement]*, Door'));
 assert.ok(out.includes('**Tarot:** The Hanged Man (Upright) — Surrender, pause, a new perspective'));assert.ok(out.includes('**Magic Mirror:** Can only dream about places that no longer exist [MANDATORY — replaces Software]'));assert.deepEqual(p,before);
});
test('interleaved players group case-insensitively while custom banks, decree choices, extras, and costs are preserved',()=>{
 const p=party();p.results.splice(2,0,result('b','Words','Winter','Snow',{handle:'@bob',description:'A quiet night'}));p.results.push(result('x','Magic Mirror','Magic Mirror','Cannot wink',{handle:'@TINA',privilegeCost:2}));p.writers=[{handle:'@tina',decree:'No'},{handle:'@bob',decree:'Yes'}];const out=discordTranscript(p);assert.equal((out.match(/@tina/gi)||[]).length,1);assert.equal((out.match(/@bob/g)||[]).length,1);assert.ok(out.includes('**Royal Decree:** Declined'));assert.ok(out.includes('**Winter:** Snow — A quiet night'));assert.ok(out.includes('[2 privileges spent] [MANDATORY EXTRA — no trade]'));assert.ok(out.indexOf('**Magic Mirror:**')<out.indexOf('@bob'));
});
test('legacy word records combine and Discord chunks remain at most 1000 characters',()=>{
 const p=party();p.results.forEach(r=>delete r.type);p.results.push(result('long','Potions','Potions','A long potion',{description:'a'.repeat(2400)}));const out=discordTranscript(p,[{name:'The Royal Collection',type:'Words'},{name:'Magic Mirror',type:'Magic Mirror'}]);assert.ok(out.includes('Skeleton, Software'));const parts=chunks(out);assert.ok(parts.every(s=>s.length<=1000));assert.equal(parts.join('\n').replace(/\n/g,''),out.replace(/\n/g,''));
});
test('user text cannot break bold spinner labels and an empty party has a clear message',()=>{
 const p=party();p.results=[result('a','Words','Name ** trick','Word *star*')];assert.ok(discordTranscript(p).includes('**Name \\*\\* trick:** Word \\*star\\*'));p.results=[];assert.ok(discordTranscript(p).endsWith('No results yet.'));
});
