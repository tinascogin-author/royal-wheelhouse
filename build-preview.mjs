import {mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const destination=resolve('dist');
mkdirSync(join(destination,'assets'),{recursive:true});
const files=['index.html','style.css','royal.css','enchanted.css','magic.css','layout.css','app.js','install.js','core.js','starter-library.js','legacy-starters.js','princess-library.js','new-reveals.css','sounds.js','magic-reveals.js','sw.js','manifest.webmanifest','icon.svg'];
for(const file of files)copyFileSync(file,join(destination,file));
for(const file of readdirSync('assets'))if(/\.(png|svg|webp)$/.test(file))copyFileSync(join('assets',file),join(destination,'assets',file));
console.log('Prepared static review copy in '+destination);
