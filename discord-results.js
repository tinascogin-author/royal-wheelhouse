import {normalize,partyId} from './core.js';
// Formatting is read-only: the detailed registry and saved result objects stay untouched.
const text=value=>String(value??'').replace(/[\\`*_~|\[\]]/g,'\\$&');
const label=value=>text(value).replace(/[\r\n]+/g,' ');
const order=['Curse','Words','Tarot','Potions','Poisons','Genre Genie','Story Spindle','Perspective Portal','Tense Tiara','Magic Mirror'];
export function discordTranscript(party,banks=[]){
 const writers=new Map();
 const writer=handle=>{const key=normalize(handle);if(!writers.has(key))writers.set(key,{handle,results:[],decree:''});return writers.get(key);};
 for(const r of party.results)writer(r.handle).results.push(r);
 for(const w of party.writers||[])if(w.decree)writer(w.handle).decree=w.decree;
 const header=['♛ THE ROYAL WHEELHOUSE · '+partyId(party.date),party.decreeEnabled===false?'Royal Decree: not offered':'Royal Decree: '+text(party.decree),'Current Curse: '+text(party.curse)];
 const sections=[];
 for(const w of writers.values()){
  const groups=new Map();
  for(const r of w.results){const type=r.type||banks.find(b=>b.name===r.kind)?.type||(r.kind==='Curse Crystal Ball'?'Curse':'');const key=JSON.stringify([type,r.kind]);if(!groups.has(key))groups.set(key,{type,name:r.kind,results:[]});groups.get(key).results.push(r);}
  const lines=[text(w.handle)];
  if(w.decree&&party.decreeEnabled!==false)lines.push('**Royal Decree:** '+(w.decree==='Yes'?'Accepted':'Declined'));
  for(const group of [...groups.values()].sort((a,b)=>{const rank=t=>order.includes(t)?order.indexOf(t):order.length;return rank(a.type)-rank(b.type);})){const values=group.results.map(r=>{
   let value=text(r.value)+(r.description?' — '+text(r.description):'');
   if(r.privilegeCost)value+=' ['+r.privilegeCost+' privileges spent]';
   if(r.replacedById)value+=' *[TRADED IN — see Mirror replacement]*';
   if(r.replacesId)value+=' [MANDATORY — replaces '+text(party.results.find(x=>x.id===r.replacesId)?.value||'original')+']';
   else if(group.type==='Magic Mirror')value+=' [MANDATORY EXTRA — no trade]';
   return value;
  });lines.push('**'+label(group.name)+':** '+values.join(group.type==='Words'?', ':'; '));}
  sections.push(lines.join('\n\n'));
 }
 return header.join('\n')+'\n\n'+(sections.length?sections.join('\n\n'):'No results yet.');
}
