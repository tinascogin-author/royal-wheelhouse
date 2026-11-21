import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BRIEF } from './banks.js';
import { initialState, newArtist, nextRequired, draw, drawBrief, restoreState, available, validate, partyText } from './party.js';

function setup() {
  const state = initialState();
  const party = { id: 'playtest', date: '2026-11-20', theme: 'Second Chances', artists: [], retired: [], current: null };
  state.parties.push(party);
  state.active = party.id;
  return { state, party, banks: state.banks };
}

test('new parties draw one shared brief before artist turns and retain it on restore', () => {
  const { state, party } = setup();
  party.theme = '';
  delete state.banks[BRIEF];
  assert.throws(() => newArtist(party, 'Painter'), /Brief first/);
  restoreState(state);
  assert.equal(state.banks[BRIEF].length, 12);
  const entry = { title: 'Little Luxuries', cue: 'Find one small pleasure.' };
  drawBrief(party, [entry]);
  newArtist(party, 'Painter');
  assert.throws(() => drawBrief(party, [entry]), /already has/);
  assert.equal(available(party, [entry]).length, 0);
  assert.equal(partyText(party), '**Artist’s Brief** — Little Luxuries · Find one small pleasure.');
  assert.equal(restoreState(JSON.parse(JSON.stringify(state))).parties[0].theme, entry.title);
});

test('curse precedes the three required wheels, then Creative Twist gates extras', () => {
  const { state, party, banks } = setup();
  const artist = newArtist(party, '@Painter');
  assert.equal(nextRequired(artist), 'Curse Jar');
  assert.throws(() => draw(party, artist, 'Subject', banks.Subject), /unavailable/);
  artist.verdict = 'CURSED';
  for (const name of ['Subject', 'Setting', 'Mood', 'Creative Twist']) {
    assert.equal(nextRequired(artist), name);
    assert.throws(() => draw(party, artist, 'Genre', banks.Genre), /unavailable/);
    draw(party, artist, name, banks[name]);
  }
  assert.equal(nextRequired(artist), null);
  draw(party, artist, 'Genre', banks.Genre);
  assert.match(partyText(party), /Second Chances\n\n\*\*@Painter\*\*\nCURSED/);
  assert.ok(validate(JSON.parse(JSON.stringify(state))));
});

test('escaped artist can choose twist, handles are unique, and respins retire prior results', () => {
  const { party, banks } = setup();
  const first = newArtist(party, '@Painter');
  first.verdict = 'ESCAPED';
  const original = draw(party, first, 'Subject', banks.Subject);
  const replacement = draw(party, first, 'Subject', banks.Subject, true);
  assert.notEqual(original.title, replacement.title);
  assert.equal(available(party, [original, replacement]).length, 0);
  assert.throws(() => newArtist(party, 'painter'), /already/);
  for (const name of ['Setting', 'Mood', 'Creative Twist']) draw(party, first, name, banks[name]);
  assert.equal(nextRequired(first), null);
  const second = newArtist(party, 'Sketcher');
  second.verdict = 'ESCAPED';
  assert.throws(() => draw(party, second, 'Subject', [original, replacement]), /fresh prompt/);
  assert.doesNotMatch(partyText(party), /Sketcher/);
});
