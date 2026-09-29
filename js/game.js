import { CARD_FACES } from "./constants.js";
import { makeElement, shuffle } from "./dom.js";
import { openModal } from "./modal.js";
import { saveLeaderboardResult } from "./leaderboard.js";

export const createGame = ({ board, liveStatus, movesValue, pairsValue, newGameButton }) => {
  let cards = [];
  let firstCard = null;
  let moves = 0;
  let foundPairs = 0;
  let mismatchTimer = null;
  let isResolvingMismatch = false;
  let isGameComplete = false;

  const updateScore = () => {
    movesValue.textContent = String(moves);
    pairsValue.textContent = `${foundPairs} / ${CARD_FACES.length}`;
  };

  const setCardVisible = (card, visible, matched = false) => {
    card.isOpen = visible;
    const button = board.querySelector(`[data-card-id="${card.id}"]`);
    button.classList.toggle("is-open", visible);
    button.classList.toggle("is-matched", matched);
    button.setAttribute("aria-label", matched ? `${card.name}, matched` : visible ? card.name : "Hidden card");
    button.disabled = matched;
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

  const finishGame = () => {
    if (isGameComplete) return;
    isGameComplete = true;
    saveLeaderboardResult(moves, liveStatus);
    const message = makeElement("p", "modal-copy", `You found every pair in ${moves} ${moves === 1 ? "move" : "moves"}.`);
    openModal("Well done!", message, [
      { label: "Close" },
      { label: "New game", primary: true, onClick: startNewGame },
    ], newGameButton);
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

  newGameButton.addEventListener("click", startNewGame);
  startNewGame();
};
