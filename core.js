export function randomIndex(length, cryptoSource = globalThis.crypto) {
  if (!Number.isSafeInteger(length) || length < 1 || length > 4294967296) throw new Error('Invalid draw size');
  const limit = Math.floor(4294967296 / length) * length;
  const value = new Uint32Array(1);
  do { cryptoSource.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % length;
}
export const normalize = text => text.trim().toLocaleLowerCase('en-US');
export function available(bank, used) { return bank.entries.filter(e => bank.type !== 'Words' || !used.includes(normalize(e.name))); }
export function parseEntries(text,type='Words') {
  const seen = new Set();
  return text.split(/\r?\n/).filter(l => l.trim()).map(line => {
    const [name, ...rest] = line.split('|');
    return type==='Tarot'?{name:name.trim(),description:(rest[0]||'').trim(),reversedDescription:rest.slice(1).join('|').trim()}:{name:name.trim(),description:rest.join('|').trim()};
  }).filter(e => e.name && !seen.has(normalize(e.name)) && seen.add(normalize(e.name)));
}
export function formatEntries(entries,type='Words'){
  return entries.map(e=>e.name+(type==='Tarot'?' | '+e.description+' | '+(e.reversedDescription||''):(e.description?' | '+e.description:''))).join('\n');
}
export function drawTarot(entry,random=randomIndex){
  const orientation=random(2)===0?'Upright':'Reversed';
  const description=orientation==='Upright'?entry.description:(entry.reversedDescription||'No reversed meaning has been entered for this card. Add one in Collections.');
  return {...entry,orientation,description,displayName:`${entry.name} (${orientation})`};
}
export function chunks(text, max = 1000) {
  const result = [];
  while (text.length > max) {
    let cut = text.lastIndexOf('\n', max); if (cut < max / 2) cut = max;
    result.push(text.slice(0, cut)); text = text.slice(cut + (text[cut] === '\n' ? 1 : 0));
  }
  if (text) result.push(text); return result;
}
export function partyId(date) { const [y,m,d] = date.split('-'); return `PPP ${m}${d}${y}`; }
export const bankTypes = ['Words','Tarot','Potions','Poisons','Magic Mirror','Genre Genie'];
export function replacementChoices(party,handle) {
  return party.results.filter(r=>normalize(r.handle)===normalize(handle) && !r.replacedById && r.type!=='Magic Mirror' && r.kind!=='Magic Mirror');
}
export function addResult(party,result,replaceId) {
  if(replaceId){
    const original=replacementChoices(party,result.handle).find(r=>r.id===replaceId);
    if(!original || result.type!=='Magic Mirror')throw Error('Choose an active result for this writer to trade in.');
    result.replacesId=original.id;original.replacedById=result.id;
  }
  party.results.push(result);return result;
}
export function removeResult(party,id) {
  const result=party.results.find(r=>r.id===id);if(!result)return;
  if(result.replacedById)throw Error('Delete the Mirror replacement first to restore this original result.');
  if(result.replacesId){const original=party.results.find(r=>r.id===result.replacesId);if(original)delete original.replacedById;}
  party.results=party.results.filter(r=>r.id!==id);
}
export function validateBackup(s) {
  const str = x => typeof x === 'string';
  if (!s || s.version !== 1 || !Array.isArray(s.banks) || !s.banks.length || !Array.isArray(s.parties) || !s.parties.length) throw new Error('Unsupported backup');
  const ids = a => a.every(x => str(x.id)) && new Set(a.map(x=>x.id)).size === a.length;
  if (!ids(s.banks) || !ids(s.parties) || !s.parties.some(p => p.id === s.active)) throw new Error('Invalid IDs');
  if (!s.banks.every(b => str(b.name) && bankTypes.includes(b.type) && Array.isArray(b.entries) && b.entries.length && b.entries.every(e=>str(e.name)&&!!e.name.trim()&&str(e.description)&&(e.reversedDescription===undefined||str(e.reversedDescription))))) throw new Error('Invalid banks');
  if (!s.parties.every(p => str(p.date) && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && str(p.decree) && str(p.curse) && str(p.handle) && Array.isArray(p.used) && p.used.every(str) && Array.isArray(p.results) && ids(p.results) && p.results.every(r => ['handle','kind','value','description','time'].every(k=>str(r[k]))))) throw new Error('Invalid parties');
  for(const p of s.parties)for(const r of p.results){
    if(r.type!==undefined && ![...bankTypes,'Curse'].includes(r.type))throw Error('Invalid result type');
    if(r.orientation!==undefined && (r.type!=='Tarot'||!['Upright','Reversed'].includes(r.orientation)||!str(r.cardName)))throw Error('Invalid Tarot orientation');
    if(r.replacesId!==undefined){const original=p.results.find(x=>x.id===r.replacesId);if(!str(r.replacesId)||r.type!=='Magic Mirror'||!original||original.replacedById!==r.id||normalize(original.handle)!==normalize(r.handle)||original.id===r.id||original.type==='Magic Mirror'||r.replacedById)throw Error('Invalid Mirror trade');}
    if(r.replacedById!==undefined){const replacement=p.results.find(x=>x.id===r.replacedById);if(!str(r.replacedById)||!replacement||replacement.replacesId!==r.id)throw Error('Invalid Mirror history');}
  }
  if(s.settings!==undefined && (!s.settings||typeof s.settings.sound!=='boolean'))throw Error('Invalid sound setting');
  return s;
}
