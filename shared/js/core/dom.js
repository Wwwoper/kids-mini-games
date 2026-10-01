export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function setHidden(el, hidden) {
  el.hidden = Boolean(hidden);
}

// Безопасное создание элементов: только textContent, без innerHTML.
export function createEl(tag, opts = {}, ...children) {
  const el = document.createElement(tag);
  const { className, text, attrs, dataset, on } = opts;
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  }
  if (dataset) Object.assign(el.dataset, dataset);
  if (on) {
    for (const [type, handler] of Object.entries(on)) el.addEventListener(type, handler);
  }
  for (const child of children) {
    if (child !== null && child !== undefined) el.append(child);
  }
  return el;
}
