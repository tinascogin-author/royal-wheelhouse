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
  const showCrowd = phase === "draw" && Boolean(round.crowdCard);
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

function readParty() {
  const party = JSON.parse(localStorage.getItem(storageKey))?.party;
  round = party?.round;
  partyName.textContent = party?.name ?? "";
  roundLabel.textContent = round ? `@${round.artist} · ${round.category}` : "";
  updateDisplay();
}

window.addEventListener("storage", event => {
  if (event.key === storageKey || event.key === null) readParty();
});
readParty();
setInterval(updateDisplay, 200);
