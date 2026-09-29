import { makeElement } from "./dom.js";

export const openModal = (titleText, content, actions, returnFocusTo) => {
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
