import { BANKS, BRIEF, WHEELS } from './banks.js';
import { initialState, restoreState, key, handleKey, parse, available, nextRequired, newArtist, draw, drawBrief, pick, briefText, partyText, resultText } from './party.js';

const STORAGE = 'sketchy-wheelhouse-v1';
const $ = id => document.getElementById(id);
let state = initialState();
let startupError = '';
try {
  const raw = localStorage.getItem(STORAGE);
  if (raw) state = restoreState(JSON.parse(raw));
} catch {
  startupError = 'Saved party data could not be read. Restore a backup before making changes.';
}
let show = null;
let animation = null;
let noticeTimer;
let audio;
let notes = [];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const party = () => state.parties.find(item => item.id === state.active);
const current = () => party()?.artists.find(artist => artist.id === party().current);
const bank = name => state.banks[name];
const names = ['Curse Jar', ...WHEELS];
const displayHandle = artist => '@' + artist.handle.trim().replace(/^@+/, '').trim();

function element(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action) {
  const node = element('button', text);
  node.type = 'button';
  node.addEventListener('click', () => run(action));
  return node;
}

function notice(message) {
  clearTimeout(noticeTimer);
  const parent = $('dialog').open ? $('dialog') : document.body;
  parent.append($('notice'));
  $('notice').textContent = message;
  noticeTimer = setTimeout(() => { $('notice').textContent = ''; }, 5500);
}

function save(change) {
  if (startupError) throw new Error(startupError);
  const before = structuredClone(state);
  const result = change();
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
    return result;
  } catch (error) {
    state = before;
    if (error instanceof DOMException) {
      if ($('dialog').open) $('dialog').close();
      render();
      throw new Error('Changes could not be saved in this browser.');
    }
    throw error;
  }
}

function run(action) {
  try {
    const result = action();
    if (result?.catch) result.catch(error => notice(error.message));
  } catch (error) { notice(error.message); }
}

function createReel(entries, winner, moving) {
  const reel = $('reel');
  const list = entries.filter(entry => entry.title !== winner.title);
  const strips = moving ? Array.from({ length: 22 }, (_, index) => (list[index % list.length] ?? winner).title) : [];
  const filler = list.length ? list : [winner];
  const labels = [filler[0].title, filler[(1 % filler.length)].title, winner.title, ...strips, ...Array.from({ length: 3 }, (_, index) => filler[index % filler.length].title)];
  reel.replaceChildren(...labels.map(label => {
    const panel = element('div', label);
    panel.className = 'panel';
    return panel;
  }));
  const row = reel.firstElementChild.offsetHeight || 78;
  const end = -2.5 * row;
  reel.style.transform = 'translateY(' + end + 'px)';
  if (!moving) return null;
  return reel.animate([
    { transform: 'translateY(' + (end - strips.length * row) + 'px)' },
    { transform: 'translateY(' + end + 'px)' },
  ], { duration: 4000, easing: 'cubic-bezier(.10,.67,.21,1)' });
}

function render() {
  const active = party();
  const artist = current();
  const waiting = nextRequired(artist);
  const animating = !!animation;
  const briefRevealed = !!active?.theme && !(animating && show?.name === BRIEF);
  $('party-label').textContent = active ? 'Party · ' + active.date : 'No party open';
  $('spin-brief').hidden = briefRevealed;
  $('spin-brief').disabled = !active || animating || !available(active, bank(BRIEF)).length;
  $('party-brief').textContent = briefRevealed ? BRIEF + ' · ' + active.theme : '';
  const startArtist = $('artist-form').querySelector('button');
  startArtist.disabled = !briefRevealed || animating || !!waiting;
  $('handle').disabled = startArtist.disabled;
  $('copy-party').disabled = animating || !active?.artists.some(item => !nextRequired(item));
  $('records').disabled = !active || animating;
  for (const id of ['new-party', 'archives', 'backup', 'banks']) $(id).disabled = animating;
  $('sound').textContent = state.sound ? 'Sound On' : 'Sound Off';
  $('sound').setAttribute('aria-pressed', state.sound);
  $('artist-name').textContent = artist ? displayHandle(artist) : 'Assignment';
  $('theme').textContent = briefRevealed ? active.theme : '';
  const buttons = names.map(name => {
    const curse = name === 'Curse Jar';
    const completed = curse ? !!artist?.verdict : Object.hasOwn(artist?.results ?? {}, name);
    const ready = !!artist && !completed && (!waiting || name === waiting);
    const count = active && !curse ? available(active, bank(name)).length : null;
    const label = curse ? 'Rinse Your Fate' : name;
    const control = button(label + (completed ? ' ✓' : name === 'Creative Twist' && waiting === name ? ' · Required' : ''), () => spin(name));
    control.disabled = animating || !ready || count === 0;
    control.classList.toggle('live', !control.disabled);
    if (ready && count === 0) control.title = 'Add a fresh prompt in Prompt Banks';
    return control;
  });
  $('spins').replaceChildren(...buttons);
  const bankName = WHEELS.includes(waiting) ? waiting : WHEELS.includes(show?.name) ? show.name : null;
  $('available').textContent = bankName ? bankName + ' · ' + available(active, bank(bankName)).length + ' available of ' + bank(bankName).length : '';
  const dl = element('dl');
  const add = (label, value, cue) => {
    const description = element('dd', value);
    if (cue) description.append(element('small', cue));
    dl.append(element('dt', label), description);
  };
  if (artist?.verdict && !(animating && show.name === 'Curse Jar')) add('Curse Jar', artist.verdict);
  for (const name of WHEELS) {
    if (animating && show.name === name) continue;
    const entry = artist?.results[name];
    if (entry) add(name + (name === 'Creative Twist' && artist.verdict === 'CURSED' ? ' · Required' : ''), entry.title, entry.cue);
  }
  $('assignment').replaceChildren(dl);
  const wheelVisible = BANKS.includes(show?.name ?? waiting);
  $('jar').hidden = wheelVisible;
  $('wheel').hidden = !wheelVisible;
  $('jar').className = 'jar' + (animating && !wheelVisible ? ' spinning' : '') +
    (!animating && show?.entry.title === 'CURSED' ? ' cursed' : '') +
    (!animating && show?.entry.title === 'ESCAPED' ? ' escaped' : '');
  $('stage-label').textContent = show?.name ?? waiting ?? (artist ? 'Assignment complete' : 'The Studio');
  $('reveal').replaceChildren();
  if (show && !animating) {
    $('reveal').append(element('strong', show.entry.title));
    if (show.entry.cue) $('reveal').append(element('small', show.entry.cue));
  }
  if (!show && !artist) {
    if (!active) $('reveal').textContent = 'Open a new party to begin.';
    else if (briefRevealed) $('reveal').textContent = 'Enter a Discord handle and select Start Artist Turn.';
    else $('reveal').textContent = available(active, bank(BRIEF)).length ?
      'Spin the Artist’s Brief when everyone is ready.' : 'Add an Artist’s Brief in Prompt Banks.';
  }
  if (!show && waiting === 'Curse Jar') $('reveal').textContent = 'Select Rinse Your Fate to swirl the jar.';
  if (wheelVisible && !animating) {
    const entries = bank(show?.name ?? waiting);
    createReel(entries, show?.entry ?? available(active, entries)[0] ?? { title: 'Bank empty' }, false);
  }
  $('skip').hidden = !animating;
}

function stopSound() {
  for (const note of notes) {
    try { note.stop(); } catch { /* already ended */ }
  }
  notes = [];
}

function playSound(curse, seconds) {
  if (!state.sound || !window.AudioContext) return;
  try {
    audio ??= new AudioContext();
    audio.resume().catch(() => {});
    const start = audio.currentTime;
    const tone = (offset, frequency, type, length, volume, endFrequency = frequency) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start + offset);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + offset + length);
      gain.gain.setValueAtTime(volume, start + offset);
      gain.gain.exponentialRampToValueAtTime(.001, start + offset + length);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + length);
      oscillator.onended = () => { notes = notes.filter(note => note !== oscillator); };
      notes.push(oscillator);
    };
    if (curse && seconds > 0) {
      for (let offset = 0; offset < seconds; offset += .21) {
        tone(offset, 540 + Math.sin(offset * 8) * 190, 'sine', .15, .037, 190);
      }
    }
    if (!curse && seconds > 0) {
      for (let i = 1; i <= 20; i++) {
        const time = seconds * (1 - (1 - i / 21) ** (1 / .52));
        tone(time, 160 + (i % 3) * 24, 'triangle', .048, .11, 70);
      }
    }
    tone(seconds, curse ? 610 : 132, 'triangle', .22, .11, curse ? 490 : 69);
  } catch { /* the studio works without audio */ }
}

function finish() {
  if (!animation) return;
  clearTimeout(animation.timer);
  animation.motion?.cancel();
  animation = null;
  render();
  const nextControl = show?.name === BRIEF ? $('handle') : $('spins').querySelector('button.live');
  nextControl?.focus({ preventScroll: true });
}

function spin(name, replacementArtist) {
  if (animation) return;
  const active = party();
  const artist = replacementArtist ?? current();
  if (!active || !artist) return;
  const curse = name === 'Curse Jar';
  const entries = curse ? [] : available(active, bank(name));
  const result = save(() => {
    if (!curse) return draw(active, artist, name, bank(name), !!replacementArtist);
    if (nextRequired(artist) !== name) throw new Error('This artist already rinsed their fate.');
    artist.verdict = pick(['CURSED', 'ESCAPED']);
    return { title: artist.verdict };
  });
  if (replacementArtist && artist !== current()) {
    notice(displayHandle(artist) + ' drew ' + result.title + '.');
    records(artist.id);
    return;
  }
  if ($('dialog').open) $('dialog').close();
  revealSpin(name, result, entries);
}

function revealSpin(name, result, entries) {
  const curse = name === 'Curse Jar';
  show = { name, entry: result };
  const duration = reducedMotion.matches ? 0 : curse ? 3000 : 4000;
  if (!duration) {
    render();
    playSound(curse, 0);
    if (name === BRIEF) $('handle').focus();
    return;
  }
  animation = { timer: setTimeout(finish, duration) };
  render();
  playSound(curse, duration / 1000);
  if (!curse) animation.motion = createReel(entries, result, true);
  $('skip').focus({ preventScroll: true });
}

function open(title, ...contents) {
  $('dialog-title').textContent = title;
  $('dialog-body').replaceChildren(...contents);
  if (!$('dialog').open) $('dialog').showModal();
}

function field(label, control) {
  const node = element('label', label);
  node.append(control);
  return node;
}

function formWith(label, controls, action) {
  const form = element('form');
  const submit = element('button', label);
  submit.type = 'submit';
  form.append(...controls, submit);
  form.addEventListener('submit', event => {
    event.preventDefault();
    run(action);
  });
  return form;
}

function newPartyDialog() {
  const date = element('input');
  date.type = 'date';
  date.required = true;
  const now = new Date();
  date.value = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  open('New Party', formWith('Open Studio', [field('Party Date', date)], () => {
    save(() => {
      const id = crypto.randomUUID();
      state.parties.push({ id, date: date.value, theme: '', retired: [], artists: [], current: null });
      state.active = id;
    });
    show = null;
    $('dialog').close();
    render();
    $('spin-brief').focus();
  }));
}

function archives() {
  const rows = [...state.parties].reverse().map(item => {
    const row = element('div');
    row.className = 'record-row';
    row.append(element('span', item.date + (item.theme ? ' · ' + item.theme : '')), button(item.id === state.active ? 'Resume Party' : 'Open Party', () => {
      save(() => { state.active = item.id; });
      show = null;
      $('dialog').close();
      render();
    }));
    return row;
  });
  open('Archives', ...(rows.length ? rows : [element('p', 'No saved parties yet.')]));
}

function banks() {
  const select = element('select');
  for (const name of BANKS) select.add(new Option(name));
  const activeBank = nextRequired(current());
  if (WHEELS.includes(activeBank)) select.value = activeBank;
  const entries = element('textarea');
  entries.rows = 13;
  const load = () => {
    entries.value = bank(select.value).map(entry => entry.title + (entry.cue ? ' | ' + entry.cue : '')).join('\n');
  };
  select.addEventListener('change', load);
  load();
  open('Prompt Banks', formWith('Save Bank', [
    field('Wheel', select),
    field('One prompt per line. Add | and a cue if you like.', entries),
  ], () => {
    const prompts = entries.value.split(/\r?\n/).filter(line => line.trim()).map(parse);
    if (prompts.some(entry => !entry.title)) throw new Error('Each prompt needs a title.');
    if (new Set(prompts.map(entry => key(entry.title))).size !== prompts.length) throw new Error('Remove duplicate prompts before saving.');
    save(() => { state.banks[select.value] = prompts; });
    render();
    notice(select.value + ' bank saved.');
  }));
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notice('Copied for Discord.');
  } catch {
    const area = element('textarea');
    area.value = text;
    area.readOnly = true;
    area.rows = 14;
    open('Copy for Discord', area);
    area.select();
  }
}

function records(artistId) {
  const active = party();
  if (!active) return;
  const artist = active.artists.find(item => item.id === artistId);
  if (!artist) {
    const rows = active.artists.map(item => {
      const row = element('div');
      row.className = 'record-row';
      row.append(element('span', displayHandle(item) + (nextRequired(item) ? ' · In progress' : '')), button('View', () => records(item.id)));
      return row;
    });
    open('Party Records', ...(rows.length ? rows : [element('p', 'No artists have taken a turn yet.')]));
    return;
  }
  const actions = element('div');
  actions.className = 'actions';
  actions.append(button('All Records', () => records()), button('Edit Handle', () => editHandle(artist)),
    button('Copy for Discord', () => copy(briefText(active) + '\n\n' + resultText(artist))));
  const rows = WHEELS.filter(name => Object.hasOwn(artist.results, name)).map(name => {
    const row = element('div');
    row.className = 'record-row';
    row.append(element('span', name + ' — ' + artist.results[name].title),
      button('Edit', () => editResult(artist, name)), button('Respin', () => spin(name, artist)));
    return row;
  });
  open(displayHandle(artist), actions, element('p', artist.verdict ?? 'Curse Jar pending'), ...rows);
}

function editHandle(artist) {
  const input = element('input');
  input.value = artist.handle;
  input.required = true;
  input.maxLength = 80;
  open('Edit Handle', formWith('Save Handle', [field('Discord handle', input)], () => {
    const value = input.value.trim();
    if (!handleKey(value)) throw new Error('Enter a Discord handle.');
    if (party().artists.some(item => item !== artist && handleKey(item.handle) === handleKey(value))) {
      throw new Error('That handle already has a turn in this party.');
    }
    save(() => { artist.handle = value; });
    render();
    records(artist.id);
  }));
}

function editResult(artist, name) {
  const title = element('input');
  const cue = element('textarea');
  title.required = true;
  title.value = artist.results[name].title;
  cue.value = artist.results[name].cue;
  open('Edit ' + name, formWith('Save Result', [field('Prompt', title), field('Visual cue', cue)], () => {
    const value = title.value.trim();
    if (!value) throw new Error('Enter a prompt.');
    save(() => {
      const normalized = key(value);
      if (normalized !== key(artist.results[name].title) && party().retired.includes(normalized)) {
        throw new Error('That prompt has already been used in this party.');
      }
      if (!party().retired.includes(normalized)) party().retired.push(normalized);
      artist.results[name] = { title: value, cue: cue.value.trim() };
    });
    if (artist === current() && show?.name === name) show.entry = artist.results[name];
    render();
    records(artist.id);
  }));
}

function downloadBackup() {
  const link = element('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  link.download = 'sketchy-wheelhouse-backup.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function backup() {
  const file = element('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.required = true;
  open('Backup', button('Export Backup', downloadBackup), formWith('Restore Backup', [field('Sketchy Wheelhouse backup', file)], async () => {
    let data;
    try { data = JSON.parse(await file.files[0].text()); } catch { throw new Error('Choose a readable Sketchy Wheelhouse backup.'); }
    try { data = restoreState(data); } catch { throw new Error('That file is not a valid Sketchy Wheelhouse backup.'); }
    open('Restore Backup', element('p', 'Restoring replaces the parties and prompt banks saved in this browser.'),
      button('Export Current Backup', downloadBackup), button('Replace Saved Data', () => {
        localStorage.setItem(STORAGE, JSON.stringify(data));
        state = data;
        startupError = '';
        show = null;
        $('dialog').close();
        render();
        notice('Backup restored.');
      }));
  }));
}

$('artist-form').addEventListener('submit', event => {
  event.preventDefault();
  run(() => {
    if (!party() || nextRequired(current()) || animation) return;
    save(() => newArtist(party(), $('handle').value));
    $('handle').value = '';
    show = null;
    render();
    $('spins').querySelector('button').focus();
  });
});
$('new-party').onclick = newPartyDialog;
$('spin-brief').onclick = () => run(() => {
  const active = party();
  if (!active || animation || active.theme) return;
  const entries = available(active, bank(BRIEF));
  const result = save(() => drawBrief(active, entries));
  revealSpin(BRIEF, result, entries);
});
$('archives').onclick = archives;
$('banks').onclick = banks;
$('backup').onclick = backup;
$('records').onclick = () => records();
$('copy-party').onclick = () => run(() => copy(partyText(party())));
$('close-dialog').onclick = () => $('dialog').close();
$('dialog').addEventListener('close', () => {
  if (!$('dialog').open) document.body.append($('notice'));
});
$('sound').onclick = () => run(() => {
  save(() => { state.sound = !state.sound; });
  if (!state.sound) stopSound();
  render();
});
$('skip').onclick = () => {
  stopSound();
  const curse = show?.name === 'Curse Jar';
  finish();
  playSound(curse, 0);
};
render();
if (startupError) notice(startupError);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
