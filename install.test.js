import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('./install.js',import.meta.url),'utf8');
function boot({standalone=false}={}){
  const elements=new Map(),listeners=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);};
  const window={matchMedia:()=>({matches:standalone}),addEventListener:(name,fn)=>listeners.set(name,fn)};
  const navigator={serviceWorker:{ready:Promise.resolve({})}};
  vm.runInNewContext(source,{window,document:{getElementById:get},navigator});return {get,listeners};
}
test('install help remains available without a native install event and reports offline readiness',async()=>{
  const {get}=boot();await Promise.resolve();get('installApp').onclick();assert.equal(get('installDialog').open,true);assert.equal(get('nativeInstall').hidden,true);assert.match(get('installStatus').textContent,/Chrome or Edge/);assert.match(get('installOfflineStatus').textContent,/Offline ready/);get('closeInstall').onclick();assert.equal(get('installDialog').open,false);
});
test('install prompt can be used once and does not claim installation when dismissed',async()=>{
  const {get,listeners}=boot();let prompted=0,prevented=false;
  listeners.get('beforeinstallprompt')({preventDefault(){prevented=true;},async prompt(){prompted++;},userChoice:Promise.resolve({outcome:'dismissed'})});
  assert.equal(prevented,true);assert.equal(get('nativeInstall').hidden,false);await get('nativeInstall').onclick();await get('nativeInstall').onclick();assert.equal(prompted,1);assert.match(get('installStatus').textContent,/dismissed/);assert.equal(get('installApp').textContent,'↓ Install app');
});
test('only an installed app event or standalone display reports that installation completed',async()=>{
  const {get,listeners}=boot();listeners.get('beforeinstallprompt')({preventDefault(){},async prompt(){},userChoice:Promise.resolve({outcome:'accepted'})});await get('nativeInstall').onclick();assert.match(get('installStatus').textContent,/requested/);listeners.get('appinstalled')();assert.equal(get('installApp').textContent,'✓ App installed');assert.equal(get('nativeInstall').hidden,true);assert.match(boot({standalone:true}).get('installStatus').textContent,/is installed/);
});
test('install icons are correctly sized PNG files and are included in the static build',async()=>{
  const manifest=JSON.parse(await readFile(new URL('./manifest.webmanifest',import.meta.url),'utf8'));
  for(const size of [192,512]){const icon=manifest.icons.find(i=>i.sizes===`${size}x${size}`);assert.ok(icon);const buffer=await readFile(new URL(icon.src,import.meta.url));assert.equal(buffer.readUInt32BE(16),size);assert.equal(buffer.readUInt32BE(20),size);}
  const build=await readFile(new URL('./build-preview.mjs',import.meta.url),'utf8');assert.match(build,/'install.js'/);
});
