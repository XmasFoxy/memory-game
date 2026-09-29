# Memory Grove

A small, responsive memory-matching game built with vanilla HTML, CSS, and JavaScript. Find all eight pairs in as few moves as you can. Completed games are saved locally in your browser.

## Play locally

1. Clone the repository and switch to the `memory-game` branch.
2. Open `index.html` in a modern browser, or serve the project directory:

   ```bash
   python -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

The game has no build step or third-party JavaScript dependencies. An internet connection is only needed to load the optional Google Fonts; system fonts are used as a fallback.

## How to play

- Select two cards to find a pair. A non-matching pair turns back over after one second.
- Use **New game** at any time to shuffle the cards and reset the score.
- Open **Leaderboard** to see the ten best completed games saved in this browser.
- Close a modal with its close button, by clicking outside it, or by pressing Escape.

## Implementation

The board and all interface elements are created with `document.createElement`. Game results are kept in `localStorage`; no account or server is required.
