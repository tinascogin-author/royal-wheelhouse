import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('a new offline release downloads current files instead of saving stale HTTP-cache copies',async()=>{
  const source=await readFile(new URL('./sw.js',import.meta.url),'utf8');
  const handlers=new Map(),saved=new Map();let activated=false;
  const oldHttpCache=new Map([['./','old page without Install app'],['./app.js','old navigation handler']]);
  const currentNetwork=new Map([['./','new page with Install app'],['./app.js','new navigation handler']]);
  const cache={async addAll(requests){for(const r of requests){saved.set(r.url,r.cache==='reload'?(currentNetwork.get(r.url)||'current asset'):(oldHttpCache.get(r.url)||'current asset'));}}};
  class Request{constructor(url,{cache}){this.url=url;this.cache=cache;}}
  const self={addEventListener:(name,fn)=>handlers.set(name,fn),skipWaiting:async()=>{activated=true;}};
  vm.runInNewContext(source,{self,Request,caches:{open:async()=>cache}});
  let pending;handlers.get('install')({waitUntil(promise){pending=promise;}});await pending;
  assert.equal(saved.get('./'),'new page with Install app');assert.equal(saved.get('./app.js'),'new navigation handler');assert.equal(activated,true);
  assert.ok(saved.has('./install.js'));assert.ok(saved.has('./assets/icon-192.png'));assert.ok(saved.has('./assets/icon-512.png'));
});
