export const makeElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

export const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const createStat = (label, initialValue, valueId) => {
  const stat = makeElement("div", "stat");
  stat.append(
    makeElement("span", "stat-label", label),
    makeElement("span", "stat-value", initialValue),
  );
  stat.lastElementChild.id = valueId;
  return stat;
};
