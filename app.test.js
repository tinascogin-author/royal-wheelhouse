import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as core from './core.js';
import * as sounds from './sounds.js';
import * as reveals from './magic-reveals.js';
class Element {
  constructor(){this.value='';this.textContent='';this.children=[];this.style={setProperty(){}};this.hidden=false;this.dataset={};this.attributes={};const classes=new Set();this.classList={add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},toggle(n,on){on?classes.add(n):classes.delete(n);},contains:n=>classes.has(n)};}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;this.value=children[0]?.value||'';}
  showModal(){this.open=true;}close(){this.open=false;}focus(){}select(){}
  setAttribute(name,value){this.attributes[name]=value;}
  click(){if(!this.disabled)this.onclick?.();}
}
const code=(await readFile(new URL('./app.js',import.meta.url),'utf8')).replace(/^import .*?;\r?\n/gm,'');
function boot(storage=new Map()){
  const elements=new Map(),timers=new Map();let reduced=true,nextTimer=0;
  const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  const tabs=['play','banks','archives'].map(id=>{const e=new Element();e.dataset.tab=id;return e;});
  const categories=['Tarot','Potions','Poisons','Genre Genie','Magic Mirror'].map(type=>{const e=new Element();e.dataset.category=type;return e;});
  const document={getElementById:get,createElement:()=>new Element(),querySelectorAll:s=>s==='nav button'?tabs:s==='[data-category]'?categories:s==='nav button, [data-category]'?[...tabs,...categories]:[],querySelector:s=>tabs.find(t=>s.includes(t.dataset.tab))||tabs[0]};
  const localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
  const context=vm.createContext({...core,...sounds,...reveals,document,localStorage,crypto:webcrypto,console,Date,Blob,URL,navigator:{clipboard:{writeText:async()=>{}}},matchMedia:()=>({matches:reduced}),setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id),confirm:()=>true,prompt:()=>null});
  vm.runInContext(code,context);
  return {get,storage,context,setReduced:value=>reduced=value,saved:()=>JSON.parse(storage.get('royal-wheelhouse-v1')),category:type=>categories.find(b=>b.dataset.category===type).click()};
}
test('word and curse persist before reveal; skip cannot reroll; new party preserves archive',()=>{
  const a=boot(),g=a.get;assert.equal(g('stageTitle').textContent,'The Royal Word Wheel');
  g('handle').value='@test-princess';g('handle').oninput();g('spin').click();
  let p=a.saved().parties[0];assert.equal(p.results.length,1);assert.equal(p.results[0].handle,'@test-princess');assert.equal(p.used.length,1);
  a.setReduced(false);g('spin').click();const before=a.saved().parties[0].results[1];
  assert.notEqual(before.value,p.results[0].value);assert.match(g('wheelDisc').style.transform,/rotate\(\d+deg\)/);
  g('skipGrid').click();assert.equal(g('wordReveal').textContent,before.value);assert.equal(a.saved().parties[0].results.length,2);
  g('consult').click();const curse=a.saved().parties[0].results[2].value;g('skip').click();assert.equal(g('ballReveal').textContent,curse==='Yes'?'YOU ARE CURSED!':'YOU ESCAPED!');
  g('newParty').click();g('date').value='2026-11-08';g('partyForm').onsubmit({preventDefault(){}});
  assert.equal(a.saved().parties.length,2);assert.equal(a.saved().parties[0].results.length,3);assert.equal(a.saved().parties[1].used.length,0);
  g('handle').value='@second';g('handle').oninput();const b=boot(a.storage);assert.equal(b.get('handle').value,'@second');
});
test('all new category buttons select the correct scene, collection, description, and record type',()=>{
  const a=boot(),g=a.get;g('handle').value='@royal';g('handle').oninput();a.setReduced(false);
  for(const type of ['Tarot','Potions','Poisons','Genre Genie']){
    a.category(type);const info=reveals.revealDetails[type];assert.equal(g('spin').textContent,info.button);assert.equal(g(info.scene).hidden,false);
    g('spin').click();const result=a.saved().parties[0].results.at(-1);assert.equal(result.type,type);assert.ok(result.description);
    if(type==='Tarot'){assert.ok(['Upright','Reversed'].includes(result.orientation));assert.equal(result.value,`${result.cardName} (${result.orientation})`);}
    assert.equal(g('handle').disabled,true);g('skipGrid').click();assert.equal(g('wordReveal').textContent,result.value);assert.equal(g('wordDescription').textContent,result.description);assert.equal(g(info.scene).classList.contains('completed'),true);assert.equal(g('handle').disabled,false);
    if(type==='Tarot'){assert.equal(g('tarotScene').classList.contains('reversed'),result.orientation==='Reversed');assert.match(g('tarotOrientation').textContent,/UPRIGHT|REVERSED/);}
  }
  assert.equal(a.saved().parties[0].used.length,0);
  a.category('Magic Mirror');assert.equal(g('spin').disabled,false);const original=g('replaceResult').value;g('spin').click();const mirror=a.saved().parties[0].results.at(-1);
  assert.equal(mirror.replacesId,original);assert.equal(a.saved().parties[0].results.find(r=>r.id===original).replacedById,mirror.id);g('skipGrid').click();
  assert.equal(g('mirrorText').textContent,mirror.value);assert.ok(!g('replaceResult').children.some(c=>c.value===mirror.id));
  assert.equal(boot(a.storage).saved().parties[0].results.at(-1).replacesId,original);
});
test('Mirror refuses a trade when current writer has no eligible result',()=>{
  const a=boot(),g=a.get;g('handle').value='@new';g('handle').oninput();a.category('Magic Mirror');assert.equal(g('spin').disabled,true);g('spin').onclick();assert.equal(a.saved().parties[0].results.length,0);
});
test('themed upload creates a separate collection and preserves selected type and existing bank',async()=>{
  const a=boot(),g=a.get,original=a.saved().banks[0],count=a.saved().banks.length;
  g('bankType').value='Poisons';await g('collectionFile').onchange({target:{files:[{name:'Winter Venom.txt',size:40,text:async()=> 'Snow crown | A royal frost\nStarlit dance\nSNOW CROWN'}],value:'file'}});
  assert.match(g('uploadStatus').textContent,/NEW collection/);g('saveBank').click();
  const s=a.saved();assert.equal(s.banks.length,count+1);assert.deepEqual(s.banks[0],original);assert.equal(s.banks.at(-1).name,'Winter Venom');assert.equal(s.banks.at(-1).type,'Poisons');assert.equal(s.banks.at(-1).entries.length,2);
});
test('sound choice survives reload, and legacy data gains Poisons only once',()=>{
  const a=boot();a.get('soundToggle').click();assert.equal(a.saved().settings.sound,false);const b=boot(a.storage);assert.equal(b.get('soundToggle').attributes['aria-pressed'],'false');
  const s=a.saved();delete s.features;delete s.settings;s.banks=s.banks.filter(b=>b.type!=='Poisons');s.banks.filter(b=>b.type==='Tarot').forEach(b=>b.entries.forEach(e=>delete e.reversedDescription));s.parties[0].results.push({id:'legacy-card',handle:'@legacy',kind:'Tarot',value:'The Moon',description:'Original historical meaning',time:'2026-11-08T12:00:00Z'});const original=structuredClone(s.parties);
  a.storage.set('royal-wheelhouse-v1',JSON.stringify(s));const c=boot(a.storage);assert.deepEqual(c.saved().parties,original);assert.equal(c.saved().banks.filter(b=>b.type==='Poisons').length,1);assert.equal(boot(a.storage).saved().banks.filter(b=>b.type==='Poisons').length,1);
  assert.ok(c.saved().banks.find(b=>b.type==='Tarot').entries.every(e=>e.reversedDescription));
});
