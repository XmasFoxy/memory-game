import { createStat, makeElement } from "./dom.js";
import { createGame } from "./game.js";
import { createLeaderboard } from "./leaderboard.js";

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
game.append(makeElement("p", "eyebrow", "A little game for your mind"));
const title = makeElement("h1", "", "Find the matching pairs");
title.id = "game-title";
game.append(
  title,
  makeElement("p", "intro", "Turn over two cards at a time and see what you remember."),
);

const panel = makeElement("div", "game-panel");
const stats = makeElement("div", "stats");
stats.setAttribute("aria-label", "Game score");
const moves = createStat("Moves", "0", "move-count");
const pairs = createStat("Pairs found", "0 / 8", "pair-count");
stats.append(moves, pairs);
const board = makeElement("div", "board");
board.setAttribute("aria-label", "Memory game cards");
const liveStatus = makeElement("p", "sr-only");
liveStatus.setAttribute("aria-live", "polite");
panel.append(stats, board, liveStatus);
const footer = makeElement("p", "game-footer", "Choose a card to reveal its hidden symbol");
game.append(panel, footer);
shell.append(header, game);
document.body.append(shell);

createGame({
  board,
  liveStatus,
  movesValue: moves.lastElementChild,
  pairsValue: pairs.lastElementChild,
  newGameButton,
});
createLeaderboard(leadersButton, liveStatus);
