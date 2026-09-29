const CARD_FACES = [
  { name: "Sun", symbol: "☀️" },
  { name: "Leaf", symbol: "🍃" },
  { name: "Mushroom", symbol: "🍄" },
  { name: "Flower", symbol: "🌼" },
  { name: "Moon", symbol: "🌙" },
  { name: "Butterfly", symbol: "🦋" },
  { name: "Berry", symbol: "🫐" },
  { name: "Acorn", symbol: "🌰" },
];
const LEADERBOARD_KEY = "memory-grove-leaderboard";
const MAX_LEADERBOARD_ENTRIES = 10;

const makeElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const createStat = (label, initialValue, valueId) => {
  const stat = makeElement("div", "stat");
  stat.append(
    makeElement("span", "stat-label", label),
    makeElement("span", "stat-value", initialValue),
  );
  stat.lastElementChild.id = valueId;
  return stat;
};

const openModal = (titleText, content, actions, returnFocusTo) => {
  const overlay = makeElement("div", "modal-overlay");
  overlay.setAttribute("role", "presentation");
  const dialog = makeElement("section", "modal");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "modal-title");
  const heading = makeElement("h2", "modal-title", titleText);
  heading.id = "modal-title";
  const actionRow = makeElement("div", "modal-actions");
  const previousOverflow = document.body.style.overflow;
  const close = () => {
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    document.body.style.overflow = previousOverflow;
    returnFocusTo.focus();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      const buttons = [...dialog.querySelectorAll("button")];
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }
  };

  for (const action of actions) {
    const button = makeElement(
      "button",
      action.primary ? "button button-primary" : "button",
      action.label,
    );
    button.type = "button";
    button.addEventListener("click", () => {
      close();
      action.onClick?.();
    });
    actionRow.append(button);
  }

  dialog.append(heading, content, actionRow);
  overlay.append(dialog);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.body.style.overflow = "hidden";
  document.body.append(overlay);
  document.addEventListener("keydown", onKeyDown);
  actionRow.firstElementChild.focus();
};

const shell = makeElement("main", "app-shell");
const header = makeElement("header", "site-header");
const brand = makeElement("div", "brand");
const brandMark = makeElement("span", "brand-mark", "✳");
brandMark.setAttribute("aria-hidden", "true");
brand.append(brandMark, makeElement("span", "", "Memory Grove"));

const headerActions = makeElement("div", "header-actions");
const newGameButton = makeElement("button", "button button-primary", "New game");
newGameButton.type = "button";
const leadersButton = makeElement("button", "button", "Leaderboard");
leadersButton.type = "button";
headerActions.append(newGameButton, leadersButton);
header.append(brand, headerActions);

const game = makeElement("section", "game");
game.setAttribute("aria-labelledby", "game-title");
game.append(
  makeElement("p", "eyebrow", "A little game for your mind"),
);
const title = makeElement("h1", "", "Find the matching pairs");
title.id = "game-title";
game.append(
  title,
  makeElement("p", "intro", "Turn over two cards at a time and see what you remember."),
);

const panel = makeElement("div", "game-panel");
const stats = makeElement("div", "stats");
stats.setAttribute("aria-label", "Game score");
stats.append(createStat("Moves", "0", "move-count"), createStat("Pairs found", "0 / 8", "pair-count"));
const board = makeElement("div", "board");
board.setAttribute("aria-label", "Memory game cards");
const liveStatus = makeElement("p", "sr-only");
liveStatus.setAttribute("aria-live", "polite");
panel.append(stats, board, liveStatus);
const footer = makeElement("p", "game-footer", "Choose a card to reveal its hidden symbol");
game.append(panel, footer);
shell.append(header, game);
document.body.append(shell);

let cards = [];
let firstCard = null;
let moves = 0;
let foundPairs = 0;
let mismatchTimer = null;
let isResolvingMismatch = false;
let isGameComplete = false;

const updateScore = () => {
  document.getElementById("move-count").textContent = String(moves);
  document.getElementById("pair-count").textContent = `${foundPairs} / ${CARD_FACES.length}`;
};

const renderCards = () => {
  board.replaceChildren();
  for (const card of cards) {
    const button = makeElement("button", "memory-card");
    button.type = "button";
    button.dataset.cardId = String(card.id);
    button.setAttribute("aria-label", "Hidden card");
    const face = makeElement("span", "card-face", card.symbol);
    face.setAttribute("aria-hidden", "true");
    button.append(face);
    button.addEventListener("click", () => selectCard(card));
    board.append(button);
  }
};

const setCardVisible = (card, visible, matched = false) => {
  card.isOpen = visible;
  const button = board.querySelector(`[data-card-id="${card.id}"]`);
  button.classList.toggle("is-open", visible);
  button.classList.toggle("is-matched", matched);
  button.setAttribute("aria-label", matched ? `${card.name}, matched` : visible ? card.name : "Hidden card");
  button.disabled = matched;
};

const startNewGame = () => {
  if (mismatchTimer !== null) {
    window.clearTimeout(mismatchTimer);
    mismatchTimer = null;
  }
  isResolvingMismatch = false;
  isGameComplete = false;
  firstCard = null;
  moves = 0;
  foundPairs = 0;
  cards = shuffle(CARD_FACES.flatMap((face) => [
    { ...face, id: `${face.name}-1`, isOpen: false, isMatched: false },
    { ...face, id: `${face.name}-2`, isOpen: false, isMatched: false },
  ]));
  liveStatus.textContent = "A new game has started.";
  updateScore();
  renderCards();
};

const selectCard = (card) => {
  if (isGameComplete || isResolvingMismatch || card.isOpen || card.isMatched) return;

  setCardVisible(card, true);
  if (firstCard === null) {
    firstCard = card;
    return;
  }

  moves += 1;
  updateScore();
  const previousCard = firstCard;
  firstCard = null;

  if (previousCard.name === card.name) {
    previousCard.isMatched = true;
    card.isMatched = true;
    setCardVisible(previousCard, true, true);
    setCardVisible(card, true, true);
    foundPairs += 1;
    updateScore();
    liveStatus.textContent = `Match found. ${foundPairs} of ${CARD_FACES.length} pairs found.`;
    if (foundPairs === CARD_FACES.length) finishGame();
    return;
  }

  isResolvingMismatch = true;
  liveStatus.textContent = "No match. The cards will close in one second.";
  mismatchTimer = window.setTimeout(() => {
    setCardVisible(previousCard, false);
    setCardVisible(card, false);
    mismatchTimer = null;
    isResolvingMismatch = false;
  }, 1000);
};

const readLeaderboard = () => {
  try {
    const savedResults = window.localStorage.getItem(LEADERBOARD_KEY);
    if (savedResults === null) return [];
    const parsedResults = JSON.parse(savedResults);
    if (!Array.isArray(parsedResults) || parsedResults.some((result) =>
      !Number.isSafeInteger(result.moves) ||
      result.moves < 1 ||
      typeof result.date !== "string" ||
      !Number.isSafeInteger(result.timestamp)
    )) {
      throw new Error("Leaderboard data has an invalid format.");
    }
    return parsedResults;
  } catch (error) {
    liveStatus.textContent = `Could not read saved leaderboard: ${error.message}`;
    return [];
  }
};

const addLeaderboardResult = () => {
  try {
    const result = { moves, date: new Date().toISOString().slice(0, 10), timestamp: Date.now() };
    const results = [...readLeaderboard(), result]
      .sort((first, second) => first.moves - second.moves || first.timestamp - second.timestamp)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(results));
  } catch (error) {
    liveStatus.textContent = `Could not save your result: ${error.message}`;
  }
};

const finishGame = () => {
  if (isGameComplete) return;
  isGameComplete = true;
  addLeaderboardResult();
  const message = makeElement("p", "modal-copy", `You found every pair in ${moves} ${moves === 1 ? "move" : "moves"}.`);
  openModal("Well done!", message, [
    { label: "Close" },
    { label: "New game", primary: true, onClick: startNewGame },
  ], newGameButton);
};

const openLeaderboard = () => {
  const content = makeElement("div", "leaderboard-content");
  const results = readLeaderboard();
  if (results.length === 0) {
    content.append(makeElement("p", "modal-copy", "No results yet. Find all eight pairs to join the leaderboard."));
  } else {
    const table = makeElement("table", "leaderboard-table");
    const tableHead = makeElement("thead");
    const headerRow = makeElement("tr");
    for (const label of ["Place", "Moves", "Date"]) {
      headerRow.append(makeElement("th", "", label));
    }
    tableHead.append(headerRow);
    const tableBody = makeElement("tbody");
    results.forEach((result, index) => {
      const row = makeElement("tr");
      row.append(
        makeElement("td", "", String(index + 1)),
        makeElement("td", "", String(result.moves)),
        makeElement("td", "", result.date.split("-").reverse().join(".")),
      );
      tableBody.append(row);
    });
    table.append(tableHead, tableBody);
    content.append(table);
  }
  openModal("Leaderboard", content, [{ label: "Close", primary: true }], leadersButton);
};

newGameButton.addEventListener("click", startNewGame);
leadersButton.addEventListener("click", openLeaderboard);
startNewGame();
