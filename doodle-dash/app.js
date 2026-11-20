const banks = {
  "Book Titles": ["The Secret Garden", "A Wrinkle in Time", "Charlotte’s Web", "Treasure Island", "The Little Prince", "Anne of Green Gables"],
  "Writing & Storytelling": ["Plot twist", "Cliffhanger", "Writer’s block", "Flashback", "Unreliable narrator", "Happy ending"],
  "Genres, Tropes & Themes": ["Time travel", "Found family", "Haunted house", "Enemies to lovers", "Space opera", "Locked-room mystery"],
  "Art & Illustration": ["Self-portrait", "Watercolor", "Comic strip", "Stick figure", "Color wheel", "Still life"],
  Marketing: ["Book launch", "Book trailer", "Newsletter", "Street team", "Cover reveal", "Book signing"],
  "Editing & Reviewing": ["Red pen", "Beta reader", "Five-star review", "Typo", "Track changes", "Proofreading"],
};

const el = id => document.getElementById(id);
const storageKey = "doodle-dash-v1";
const phases = ["ready", "think", "draw-ready", "draw", "post", "guess", "score"];
const timed = new Set(["think", "draw", "guess"]);
const makeParty = name => ({ name, competitions: [], results: [], round: null });
const data = JSON.parse(localStorage.getItem(storageKey)) ?? {
  party: makeParty("Doodle Dash Party"), archive: [], competitions: [],
};
const oldBooksCategory = "Books & Titles";
const booksCategory = "Book Titles";
for (const party of [...data.archive, data.party]) {
  for (const round of [...party.results, party.round].filter(Boolean)) {
    if (round.category === oldBooksCategory) round.category = booksCategory;
  }
}
if (data.customPrompts?.[oldBooksCategory]) {
  const existing = new Map();
  for (const prompt of [...banks[booksCategory], ...(data.customPrompts[booksCategory] ?? []), ...data.customPrompts[oldBooksCategory]]) {
    const key = prompt.toLowerCase();
    if (!existing.has(key)) existing.set(key, prompt);
  }
  data.customPrompts[booksCategory] = [...existing.values()].slice(banks[booksCategory].length);
  delete data.customPrompts[oldBooksCategory];
}

const save = () => localStorage.setItem(storageKey, JSON.stringify(data));
const formatHandle = value => value.trim().replace(/^@+/, "").trim();
const setStatus = message => { el("status").textContent = message; };

const categoryNames = () => [...Object.keys(banks), ...(data.specialCategories ?? [])];
const categoryPrompts = category => {
  if (Object.hasOwn(data.promptBanks ?? {}, category)) return data.promptBanks[category];
  const starters = Object.hasOwn(banks, category) ? banks[category] : [];
  const custom = Object.hasOwn(data.customPrompts ?? {}, category) ? data.customPrompts[category] : [];
  return [...starters, ...custom];
};

function saveCategoryPrompts(category, prompts) {
  data.promptBanks = { ...data.promptBanks, [category]: prompts };
  save();
}

for (const category of categoryNames()) {
  el("category").add(new Option(category));
  el("prompt-category").add(new Option(category));
}

el("manage-prompts").addEventListener("click", () => {
  el("prompt-library").open = true;
  el("prompt-category").value = el("category").value;
  renderPromptList();
});

el("add-category").addEventListener("submit", event => {
  event.preventDefault();
  const input = el("category-name");
  const name = input.value.trim();
  if (!name || [oldBooksCategory, ...categoryNames()].some(category => category.toLowerCase() === name.toLowerCase())) {
    el("prompt-status").textContent = "Enter a new category name.";
    return;
  }
  (data.specialCategories ??= []).push(name);
  saveCategoryPrompts(name, []);
  el("category").add(new Option(name));
  el("prompt-category").add(new Option(name));
  el("prompt-category").value = name;
  input.value = "";
  renderPromptList();
  el("prompt-status").textContent = `Created ${name}. Add prompts to make it playable.`;
  el("prompt-input").focus();
});

const promptKey = prompt => prompt.trim().replace(/\s+/g, " ").toLowerCase();

el("check-prompt-duplicates").addEventListener("click", () => {
  const category = el("prompt-category").value;
  const prompts = categoryPrompts(category);
  const groups = new Map();
  prompts.forEach((prompt, index) => {
    const key = promptKey(prompt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(index + 1);
  });
  const duplicates = [...groups.values()].filter(rows => rows.length > 1);
  const matches = el("duplicate-matches");
  matches.replaceChildren(...duplicates.map(rows => {
    const item = document.createElement("li");
    item.textContent = `“${prompts[rows[0] - 1]}” · rows ${rows.join(", ")}`;
    return item;
  }));
  matches.hidden = duplicates.length === 0;
  el("duplicate-status").textContent = duplicates.length
    ? `Found ${duplicates.length} duplicate ${duplicates.length === 1 ? "group" : "groups"} in ${category}.`
    : `No duplicates found in ${category}.`;
});

function renderPromptList() {
  el("duplicate-status").textContent = "";
  el("duplicate-matches").hidden = true;
  const category = el("prompt-category").value;
  const prompts = categoryPrompts(category);
  const items = prompts.map((prompt, index) => {
    const item = document.createElement("li");
    const form = document.createElement("form");
    form.className = "edit-prompt";
    const input = document.createElement("input");
    input.value = prompt;
    input.required = true;
    input.setAttribute("aria-label", `Edit prompt: ${prompt}`);
    const update = document.createElement("button");
    update.type = "submit";
    update.textContent = "Save changes";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove prompt: ${prompt}`);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const replacement = input.value.trim();
      const key = promptKey(replacement);
      const duplicates = prompts.filter((_, position) => position !== index);
      if (!replacement || duplicates.some(entry => promptKey(entry) === key)) {
        el("prompt-status").textContent = "Enter a non-empty prompt that isn’t already in this category.";
        return;
      }
      saveCategoryPrompts(category, prompts.with(index, replacement));
      renderPromptList();
      el("prompt-status").textContent = "Prompt updated.";
    });
    remove.addEventListener("click", () => {
      if (!confirm(`Remove “${prompt}” from future draws?`)) return;
      saveCategoryPrompts(category, prompts.toSpliced(index, 1));
      renderPromptList();
      el("prompt-status").textContent = "Prompt removed.";
    });
    form.append(input, update, remove);
    item.append(form);
    return item;
  });
  el("prompt-list").replaceChildren(...items);
  el("prompts-empty").hidden = prompts.length > 0;
}

el("prompt-category").addEventListener("change", () => {
  el("prompt-status").textContent = "";
  renderPromptList();
});
el("add-prompts").addEventListener("submit", event => {
  event.preventDefault();
  const category = el("prompt-category").value;
  const input = el("prompt-input");
  const seen = new Set(categoryPrompts(category).map(promptKey));
  const additions = [];
  for (const line of input.value.split(/\r?\n/)) {
    const prompt = line.trim();
    const key = promptKey(prompt);
    if (!prompt || seen.has(key)) continue;
    additions.push(prompt);
    seen.add(key);
  }
  if (additions.length) {
    saveCategoryPrompts(category, [...categoryPrompts(category), ...additions]);
    input.value = "";
    renderPromptList();
  }
  el("prompt-status").textContent = additions.length
    ? `Added ${additions.length} to ${category}.`
    : "Enter at least one new prompt.";
});

function renderRound() {
  const { round, name } = data.party;
  const phase = round?.phase;
  el("party").textContent = name;
  el("round").textContent = round ? `@${round.artist} · ${round.category}` : "Ready to doodle?";
  el("phase").textContent = ({
    ready: "Send the prompt privately", think: "Think", "draw-ready": "Ready to draw", draw: "Draw",
    post: "Post the sketch", guess: "Guess", score: "Round complete",
  })[phase] ?? "Set up a round to begin.";
  el("instruction").textContent = ({
    ready: "DM the artist before starting the timer.",
    post: "Start guessing once the artist posts their sketch in Discord.",
    guess: "End guessing early as soon as someone gets it right.",
  })[phase] ?? "";
  const advance = el("advance");
  advance.hidden = !round || phase === "score";
  advance.textContent = ({
    ready: "Go · Think", think: "End thinking", "draw-ready": "Go · Draw", draw: "Finish drawing",
    post: "Go · Guess", guess: "End guessing",
  })[phase] ?? "";
  el("setup").hidden = Boolean(round);
  const privatePrompt = el("private");
  privatePrompt.hidden = phase !== "ready";
  privatePrompt.open = false;
  el("prompt").textContent = phase === "ready" ? round.prompt : "";
  el("score").hidden = phase !== "score";
  el("crowd-controls").hidden = !["draw-ready", "draw"].includes(phase);
  el("crowd-mode").value = round?.crowdMode ?? "off";
  renderCrowdCard(round);
  updateClock();
}

function moveTo(phase, started = Date.now()) {
  data.party.round.phase = phase;
  data.party.round.deadline = timed.has(phase) ? started + 60_000 : null;
  save();
  renderRound();
}

function updateClock() {
  const round = data.party.round;
  const remaining = round?.deadline ? Math.max(0, Math.ceil((round.deadline - Date.now()) / 1000)) : null;
  if (remaining === 0) {
    moveTo(phases[phases.indexOf(round.phase) + 1], round.deadline);
    return;
  }
  const seconds = remaining ?? (round?.phase === "score" ? 0 : 60);
  const display = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  if (el("clock").textContent !== display) el("clock").textContent = display;
}

function standings(results) {
  const counts = new Map();
  for (const { winner } of results) {
    const key = winner.toLowerCase();
    const entry = counts.get(key) ?? { winner, points: 0 };
    entry.points++;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => b.points - a.points || a.winner.localeCompare(b.winner));
}

function renderResults() {
  const { results } = data.party;
  el("results").replaceChildren(...results.map(({ artist, prompt, winner, guessed }) => {
    const item = document.createElement("li");
    item.textContent = `@${artist} drew “${prompt}” · @${winner} +1 (${guessed ? "correct guess" : "unguessed"})`;
    return item;
  }));
  el("copy-results").disabled = results.length === 0;
  el("competitions").replaceChildren(...data.competitions.map(competition => {
    const row = document.createElement("div");
    row.className = "competition";
    const label = document.createElement("label");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = data.party.competitions.includes(competition.id);
    check.addEventListener("change", () => {
      data.party.competitions = data.party.competitions.filter(id => id !== competition.id);
      if (check.checked) data.party.competitions.push(competition.id);
      save();
      renderResults();
    });
    label.append(check, " ", competition.name);
    const results = [...data.archive, data.party]
      .filter(party => party.competitions.includes(competition.id))
      .flatMap(party => party.results.slice(competition.baselines[party.id] ?? 0));
    const board = document.createElement("p");
    board.textContent = standings(results).map(({ winner, points }) => `@${winner} · ${points}`).join("  |  ") || "No points yet";
    const reset = document.createElement("button");
    reset.textContent = "Reset leaderboard";
    reset.addEventListener("click", () => {
      if (!confirm(`Reset the standings for ${competition.name}?`)) return;
      competition.baselines = Object.fromEntries([...data.archive, data.party].map(party => [party.id, party.results.length]));
      save();
      renderResults();
    });
    row.append(label, board, reset);
    return row;
  }));
}

function score(guessed) {
  const { round, results } = data.party;
  if (round?.phase !== "score") return;
  const winner = guessed ? formatHandle(el("guesser").value) : round.artist;
  if (!winner) { setStatus("Enter the guesser’s handle."); return; }
  if (guessed && winner.toLowerCase() === round.artist.toLowerCase()) {
    setStatus("Enter the handle of the person who guessed the artist’s prompt.");
    return;
  }
  results.push({ artist: round.artist, category: round.category, prompt: round.prompt, winner, guessed });
  data.party.round = null;
  el("guesser").value = "";
  save();
  renderRound();
  renderResults();
  setStatus(`@${winner} earned one useless point.`);
}

async function copy(value, message) {
  try {
    await navigator.clipboard.writeText(value);
    setStatus(message);
  } catch {
    window.prompt("Copy this text", value);
  }
}

const crowdCards = {
  discussion: [
    "Which fictional world would you visit for a weekend?",
    "What book would you hand to someone who says they don’t like reading?",
    "Which everyday object would make the worst magical artifact?",
    "What’s a trope you’ll never get tired of?",
  ],
  joke: [
    "Why did the pencil quit? It felt pointless.",
    "Why was the book cold? It left its jacket at home.",
    "Why did the illustrator bring a ladder? They wanted to draw on a higher level.",
    "Why do writers carry notebooks? Because ideas don’t come with a save button.",
  ],
};

const discussionCards = () => [...crowdCards.discussion, ...(data.discussionStarters ?? [])];

function renderDiscussionList() {
  el("discussion-list").replaceChildren(...discussionCards().map(card => {
    const item = document.createElement("li");
    item.textContent = card;
    return item;
  }));
}

function renderCrowdCard(round) {
  el("crowd-preview").textContent = round?.crowdCard ?? "";
  el("next-crowd-card").disabled = !round?.crowdCard;
}

el("add-discussion").addEventListener("submit", event => {
  event.preventDefault();
  const input = el("discussion-input");
  const card = input.value.trim();
  if (!card) return;
  if (discussionCards().some(existing => existing.toLowerCase() === card.toLowerCase())) {
    el("discussion-status").textContent = "That discussion starter is already on the list.";
    return;
  }
  (data.discussionStarters ??= []).push(card);
  save();
  renderDiscussionList();
  input.value = "";
  input.focus();
  el("discussion-status").textContent = "Discussion starter added.";
});

function changeCrowdCard() {
  const round = data.party.round;
  if (!round || !["draw-ready", "draw"].includes(round.phase)) return;
  const mode = el("crowd-mode").value;
  const cards = mode === "discussion" ? discussionCards() : crowdCards[mode];
  const index = ((round.crowdIndex ?? (data.party.results.length - 1)) + 1) % (cards?.length ?? 1);
  round.crowdMode = mode;
  round.crowdIndex = cards ? index : -1;
  round.crowdCard = cards?.[index] ?? "";
  renderCrowdCard(round);
  save();
}
el("crowd-mode").addEventListener("change", changeCrowdCard);
el("next-crowd-card").addEventListener("click", changeCrowdCard);

el("setup").addEventListener("submit", event => {
  event.preventDefault();
  if (data.party.round) return;
  const artist = formatHandle(el("artist").value);
  if (!artist) { setStatus("Enter the artist’s handle."); return; }
  const category = el("category").value;
  const bank = categoryPrompts(category);
  if (!bank.length) {
    setStatus("Add prompts to this category before spinning.");
    return;
  }
  const used = new Set(data.party.results.filter(result => result.category === category).map(result => result.prompt));
  const available = bank.filter(prompt => !used.has(prompt));
  const pool = available.length ? available : bank;
  const cards = discussionCards();
  const crowdIndex = data.party.results.length % cards.length;
  data.party.round = {
    artist, category, prompt: pool[Math.floor(Math.random() * pool.length)],
    phase: "ready", deadline: null, crowdMode: "discussion", crowdIndex, crowdCard: cards[crowdIndex],
  };
  setStatus("");
  save();
  renderRound();
});
el("advance").addEventListener("click", () => {
  const phase = data.party.round?.phase;
  if (phase && phase !== "score") moveTo(phases[phases.indexOf(phase) + 1]);
});
el("copy-prompt").addEventListener("click", () => copy(data.party.round.prompt, "Prompt copied for the artist’s DM."));
el("score").addEventListener("submit", event => { event.preventDefault(); score(true); });
el("no-guess").addEventListener("click", () => score(false));
el("add-competition").addEventListener("submit", event => {
  event.preventDefault();
  const input = el("competition-name");
  const name = input.value.trim();
  if (!name) return;
  if (data.competitions.some(item => item.name.toLowerCase() === name.toLowerCase())) {
    setStatus("That competition already exists.");
    return;
  }
  const id = crypto.randomUUID();
  data.competitions.push({ id, name, baselines: {} });
  data.party.competitions.push(id);
  input.value = "";
  save();
  renderResults();
});
const partyDialog = el("party-dialog");
const partyNameInput = el("party-name");
el("new-party").addEventListener("click", () => {
  partyNameInput.value = "Doodle Dash Party";
  partyNameInput.setCustomValidity("");
  el("unfinished-round").hidden = !data.party.round;
  partyDialog.showModal();
  partyNameInput.select();
});
el("cancel-party").addEventListener("click", () => partyDialog.close());
partyNameInput.addEventListener("input", () => partyNameInput.setCustomValidity(""));
el("party-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = partyNameInput.value.trim();
  if (!name) {
    partyNameInput.setCustomValidity("Enter a party name.");
    partyNameInput.reportValidity();
    return;
  }
  partyDialog.close();
  if (data.party.results.length) {
    data.party.round = null;
    data.archive.push(data.party);
  }
  data.party = { ...makeParty(name), id: crypto.randomUUID() };
  el("artist").value = "";
  el("guesser").value = "";
  setStatus("");
  save();
  renderRound();
  renderResults();
});
el("copy-results").addEventListener("click", () => {
  const { name, results } = data.party;
  const scoreboard = standings(results).map(({ winner, points }) => `${winner} — ${points}`);
  const rounds = results.map(({ artist, category, prompt, winner }) => `${artist} drew “${prompt}” [${category}] · ${winner} +1`);
  copy([name, "", "Useless points", ...scoreboard, "", "Rounds", ...rounds].join("\n"), "Party results copied for Discord.");
});

data.party.id ??= crypto.randomUUID();
save();
renderRound();
renderResults();
renderDiscussionList();
renderPromptList();
setInterval(updateClock, 200);
