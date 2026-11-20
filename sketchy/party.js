import { WHEELS, REQUIRED, STARTERS } from './banks.js';

export const key = value => value.trim().normalize('NFKC').toLowerCase();
export const handleKey = value => key(value).replace(/^@+/, '').trim();
export const parse = line => {
  const [title, ...cue] = line.split('|');
  return { title: title.trim(), cue: cue.join('|').trim() };
};

export function initialState() {
  return {
    version: 1, active: null, sound: false, parties: [],
    banks: Object.fromEntries(WHEELS.map(name => [name, STARTERS[name].map(parse)])),
  };
}

export function nextRequired(artist) {
  if (!artist) return null;
  if (!artist.verdict) return 'Curse Jar';
  const required = artist.verdict === 'CURSED' ? [...REQUIRED, 'Creative Twist'] : REQUIRED;
  return required.find(name => !Object.hasOwn(artist.results, name)) ?? null;
}

export function available(party, entries) {
  return entries.filter(entry => !party.retired.includes(key(entry.title)));
}

export function pick(entries) {
  if (!entries.length) throw new Error('Add a fresh prompt to this bank before spinning.');
  const range = 2 ** 32;
  const limit = range - range % entries.length;
  const sample = new Uint32Array(1);
  do { crypto.getRandomValues(sample); } while (sample[0] >= limit);
  return entries[sample[0] % entries.length];
}

export function newArtist(party, handle) {
  const normalized = handleKey(handle);
  if (!normalized) throw new Error('Enter a Discord handle.');
  if (party.artists.some(artist => handleKey(artist.handle) === normalized)) {
    throw new Error('That artist already has a turn in this party.');
  }
  const artist = { id: crypto.randomUUID(), handle: handle.trim(), verdict: null, results: {} };
  party.artists.push(artist);
  party.current = artist.id;
  return artist;
}

export function draw(party, artist, wheel, entries, replacement = false) {
  const required = nextRequired(artist);
  const existing = Object.hasOwn(artist.results, wheel);
  if (!WHEELS.includes(wheel) || (replacement ? !existing : (existing || (required && wheel !== required)))) {
    throw new Error('That spin is unavailable.');
  }
  const entry = pick(available(party, entries));
  party.retired.push(key(entry.title));
  artist.results[wheel] = { ...entry };
  return entry;
}

export function resultText(artist) {
  return [
    '**@' + artist.handle.trim().replace(/^@+/, '').trim() + '**',
    artist.verdict,
    ...WHEELS.filter(wheel => Object.hasOwn(artist.results, wheel)).map(wheel => {
      const entry = artist.results[wheel];
      return '**' + wheel + '** — ' + entry.title + (entry.cue ? ' · ' + entry.cue : '');
    }),
  ].filter(Boolean).join('\n');
}

export function partyText(party) {
  return [
    '**Theme of the Week** — ' + party.theme,
    ...party.artists.filter(artist => !nextRequired(artist)).map(resultText),
  ].join('\n\n');
}

const string = value => typeof value === 'string';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const entry = value => record(value) && string(value.title) && !!value.title.trim() && string(value.cue);

export function validate(data) {
  if (!record(data) || data.version !== 1 || typeof data.sound !== 'boolean' ||
      !record(data.banks) || !WHEELS.every(name => Array.isArray(data.banks[name]) && data.banks[name].every(entry)) ||
      !Array.isArray(data.parties)) return false;
  const validArtist = artist => record(artist) && string(artist.id) &&
    string(artist.handle) && !!handleKey(artist.handle) && [null, 'CURSED', 'ESCAPED'].includes(artist.verdict) &&
    record(artist.results) && Object.entries(artist.results).every(([name, result]) => WHEELS.includes(name) && entry(result));
  const validParty = party => record(party) && string(party.id) && string(party.date) && /^\d{4}-\d{2}-\d{2}$/.test(party.date) &&
    string(party.theme) && Array.isArray(party.retired) && party.retired.every(string) &&
    Array.isArray(party.artists) && party.artists.every(validArtist) &&
    new Set(party.artists.map(artist => handleKey(artist.handle))).size === party.artists.length &&
    new Set(party.artists.map(artist => artist.id)).size === party.artists.length &&
    (party.current === null || party.artists.some(artist => artist.id === party.current));
  return data.parties.every(validParty) && new Set(data.parties.map(party => party.id)).size === data.parties.length &&
    (data.active === null || data.parties.some(party => party.id === data.active));
}
