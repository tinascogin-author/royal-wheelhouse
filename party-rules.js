// Party draw pools are separate from visual animations and survive edited/deleted records.
import {normalize,randomIndex} from './core.js';
export const noRepeatTypes=['Words','Tarot','Potions','Poisons','Genre Genie','Story Spindle','Perspective Portal'];
export function usedNames(party,type,banks=[]){
 if(type==='Words')return party.used;
 if(party.usedByType?.[type])return party.usedByType[type];
 return party.results.filter(r=>(r.type||banks.find(b=>b.name===r.kind)?.type)===type).map(r=>normalize(r.cardName||r.value.replace(/ \((Upright|Reversed)\)$/,'')));
}
export function drawPool(bank,party,banks=[]){
 if(!noRepeatTypes.includes(bank.type))return bank.entries;
 const used=usedNames(party,bank.type,banks),remaining=bank.entries.filter(e=>!used.includes(normalize(e.name)));
 if(remaining.length||bank.type!=='Perspective Portal')return remaining;
 const last=party.lastDrawByType?.[bank.type]||used.at(-1);
 return bank.entries.length>1?bank.entries.filter(e=>normalize(e.name)!==last):bank.entries;
}
export function retireDraw(bank,entry,party,banks=[]){
 if(!noRepeatTypes.includes(bank.type))return;
 const used=usedNames(party,bank.type,banks);
 const exhausted=!bank.entries.some(e=>!used.includes(normalize(e.name)));
 if(bank.type==='Words')party.used.push(normalize(entry.name));
 else {party.usedByType ||= {};party.usedByType[bank.type]=bank.type==='Perspective Portal'&&exhausted?[normalize(entry.name)]:[...new Set([...used,normalize(entry.name)])];}
 party.lastDrawByType ||= {};party.lastDrawByType[bank.type]=normalize(entry.name);
}
export function chooseEntry(bank,party,banks=[],random=randomIndex){const pool=drawPool(bank,party,banks);if(!pool.length)throw Error('This collection is exhausted for this party. Start a new party for a fresh pool.');return pool[random(pool.length)];}
export function decreeChoice(party,handle){return party.writers?.find(w=>normalize(w.handle)===normalize(handle))?.decree||'';}
export function setDecreeChoice(party,handle,choice){if(!handle.trim())throw Error('Enter a Discord handle first.');if(!['','Yes','No'].includes(choice))throw Error('Invalid decree choice');party.writers ||= [];let writer=party.writers.find(w=>normalize(w.handle)===normalize(handle));if(!writer){writer={handle:handle.trim()};party.writers.push(writer);}writer.decree=choice;}
