import { LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES } from "./constants.js";
import { makeElement } from "./dom.js";
import { openModal } from "./modal.js";

const readLeaderboard = (liveStatus) => {
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

export const saveLeaderboardResult = (moves, liveStatus) => {
  try {
    const completedAt = new Date();
    const date = [
      completedAt.getFullYear(),
      String(completedAt.getMonth() + 1).padStart(2, "0"),
      String(completedAt.getDate()).padStart(2, "0"),
    ].join("-");
    const result = { moves, date, timestamp: completedAt.getTime() };
    const results = [...readLeaderboard(liveStatus), result]
      .sort((first, second) => first.moves - second.moves || first.timestamp - second.timestamp)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(results));
  } catch (error) {
    liveStatus.textContent = `Could not save your result: ${error.message}`;
  }
};

export const createLeaderboard = (leadersButton, liveStatus) => {
  const openLeaderboard = () => {
    const content = makeElement("div", "leaderboard-content");
    const results = readLeaderboard(liveStatus);
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

  leadersButton.addEventListener("click", openLeaderboard);
};
