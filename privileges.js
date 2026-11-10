import {normalize} from './core.js';
export function balance(ledger,handle){return ledger.reduce((n,t)=>n+(normalize(t.to||'')===normalize(handle)?t.amount:0)-(normalize(t.from||'')===normalize(handle)?t.amount:0),0);}
export function transaction(ledger,{id,from='',to='',amount,note='',time}){
 from=from.trim();to=to.trim();if(!id||(!from&&!to)||!Number.isSafeInteger(amount)||amount<=0||normalize(from)===normalize(to))throw Error('Choose different writers and a positive whole number of privileges.');
 if(from&&balance(ledger,from)<amount)throw Error('Not enough Princess Privileges.');
 const t={id,from,to,amount,note,time};ledger.push(t);return t;
}
export function sprintAwards(rows){
 if(rows.some(r=>!r.handle.trim()||!Number.isSafeInteger(r.words)||r.words<0)||new Set(rows.map(r=>normalize(r.handle))).size!==rows.length)throw Error('Use unique handles and nonnegative whole word counts.');
 const sorted=rows.slice().sort((a,b)=>b.words-a.words);
 return sorted.map((r,i)=>({...r,rank:sorted.findIndex(x=>x.words===r.words)+1,points:r.words===0?0:Math.max(0,5-sorted.findIndex(x=>x.words===r.words))}));
}
