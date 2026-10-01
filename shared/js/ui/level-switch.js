import { createEl } from '../core/dom.js';
import { readSetting, writeSetting } from '../core/storage.js';

export const LEVEL_LABELS = {
  easy: 'Простой',
  hard: 'Сложный',
  veryHard: 'Очень сложный'
};

// container — группа кнопок. hints — { easy: '...', ... } (ключи задают список уровней).
// hintEl необязателен: если не передан, подсказкой управляет игра.
export function mountLevelSwitch({ container, hintEl = null, hints, storageKey, onChange }) {
  const ids = Object.keys(LEVEL_LABELS).filter((id) => id in hints);
  let level = readSetting(storageKey, 'easy');
  if (!ids.includes(level)) level = 'easy';

  const buttons = new Map();
  const choose = (id) => {
    level = id;
    writeSetting(storageKey, id);
    refresh();
    onChange(id);
  };
  ids.forEach((id) => {
    const btn = createEl('button', {
      className: 'button secondary',
      text: LEVEL_LABELS[id],
      attrs: { type: 'button', 'aria-pressed': 'false' }
    });
    btn.addEventListener('click', () => choose(id));
    buttons.set(id, btn);
  });
  container.replaceChildren(...buttons.values());

  function refresh() {
    buttons.forEach((btn, id) => btn.setAttribute('aria-pressed', String(id === level)));
    if (hintEl) hintEl.textContent = hints[level] || '';
  }
  refresh();

  return {
    ids,
    get: () => level,
    refresh,
    set(id) {
      if (ids.includes(id)) choose(id);
    }
  };
}
