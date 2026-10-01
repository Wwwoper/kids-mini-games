import { createEl } from '../core/dom.js';

// item: { id, label, emoji } или null для закрытой карточки.
// tag: 'button' (интерактивная) или 'div' (только показ).
export function createCard(item, { tag = 'div', base = 'card', covered = false, onClick = null } = {}) {
  const attrs = {};
  if (tag === 'button') attrs.type = 'button';
  if (tag === 'div') attrs.role = 'img';
  const el = createEl(tag, { className: covered ? `${base} covered` : base, attrs });
  if (covered || !item) {
    el.setAttribute('aria-label', 'закрытая карточка');
  } else {
    el.textContent = item.emoji;
    el.setAttribute('aria-label', item.label);
  }
  if (onClick) el.addEventListener('click', () => onClick(item, el));
  return el;
}
