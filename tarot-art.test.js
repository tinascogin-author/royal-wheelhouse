import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {tarotArt,tarotImage} from './tarot-art.js';
import {princessLibrary} from './princess-library.js';
test('all 78 standard cards map to bundled JPEG artwork and offline cache entries',()=>{
 const hashes=Object.values(tarotArt).map(path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex'));assert.equal(new Set(hashes).size,78);
 const sw=readFileSync(new URL('./sw.js',import.meta.url),'utf8');assert.equal(Object.keys(tarotArt).length,78);const deck=princessLibrary.find(b=>b.type==='Tarot');
 for(const card of deck.entries){const path=tarotImage(card.name);assert.ok(path,card.name);const bytes=readFileSync(new URL(path,import.meta.url));assert.equal(bytes[0],255);assert.equal(bytes[1],216);assert.ok(bytes.length>1000);assert.ok(sw.includes(path));}assert.equal(tarotImage('Custom oracle card'),null);
});

