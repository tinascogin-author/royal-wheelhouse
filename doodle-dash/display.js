const storageKey = "doodle-dash-v1";
const phaseLabels = {
  ready: "The artist is getting their prompt",
  think: "Think",
  "draw-ready": "Get ready to draw",
  draw: "Draw",
  post: "Watch Discord for the sketch",
  guess: "Guess in Discord",
  score: "Guessing closed",
};
const partyName = document.getElementById("party");
const roundLabel = document.getElementById("round");
const phaseLabel = document.getElementById("phase");
const clock = document.getElementById("clock");
const crowdPanel = document.getElementById("crowd-panel");
const crowdTitle = document.getElementById("crowd-title");
const crowdCard = document.getElementById("crowd-card");
const layout = crowdPanel.parentElement;
let round;

function updateDisplay() {
  let phase = round?.phase;
  let deadline = round?.deadline;
  const now = Date.now();
  // Keep the display accurate even when Chrome throttles an unfocused host tab.
  if (phase === "think" && deadline <= now) {
    phase = "draw-ready";
    deadline = null;
  }
  if (deadline && deadline <= now) {
    phase = phase === "guess" ? "score" : "post";
    deadline = null;
  }
  const label = phaseLabels[phase] ?? "Waiting for the next round";
  if (phaseLabel.textContent !== label) phaseLabel.textContent = label;
  const showCrowd = ["draw-ready", "draw"].includes(phase) && Boolean(round.crowdCard);
  crowdPanel.hidden = !showCrowd;
  layout.classList.toggle("with-crowd", showCrowd);
  const card = showCrowd ? round.crowdCard : "";
  if (crowdCard.textContent !== card) crowdCard.textContent = card;
  crowdTitle.textContent = showCrowd && round.crowdMode === "joke" ? "Dad joke" : "Discuss in Discord";
  clock.hidden = !deadline;
  if (!deadline) return;
  const seconds = Math.ceil((deadline - now) / 1000);
  const value = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  if (clock.textContent !== value) clock.textContent = value;
}

function resultItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function renderResults(results) {
  const counts = new Map();
  for (const { winner } of results) {
    const key = winner.toLowerCase();
    const score = counts.get(key) ?? { winner, points: 0 };
    score.points++;
    counts.set(key, score);
  }
  const leaders = [...counts.values()]
    .sort((a, b) => b.points - a.points || a.winner.localeCompare(b.winner));
  document.getElementById("leaderboard").replaceChildren(...leaders.map(({ winner, points }) =>
    resultItem(`@${winner} · ${points} ${points === 1 ? "point" : "points"}`)));
  document.getElementById("completed-rounds").replaceChildren(...results.slice().reverse().map(
    ({ artist, prompt, winner, guessed }) =>
      resultItem(`@${artist} drew “${prompt}” · @${winner} +1 (${guessed ? "correct guess" : "unguessed"})`)));
  document.getElementById("leaderboard-empty").hidden = leaders.length > 0;
  document.getElementById("results-empty").hidden = results.length > 0;
}

function readParty() {
  const party = JSON.parse(localStorage.getItem(storageKey))?.party;
  round = party?.round;
  partyName.textContent = party?.name ?? "";
  roundLabel.textContent = round ? `@${round.artist} · ${round.category}` : "";
  renderResults(party?.results ?? []);
  updateDisplay();
}

window.addEventListener("storage", event => {
  if (event.key === storageKey || event.key === null) readParty();
});
readParty();
setInterval(updateDisplay, 200);
