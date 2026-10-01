import { createEl } from '../core/dom.js';
import { loadProgress, resetProgress, saveProgress } from '../core/progress.js';
import { dateKey, percent, topErrors } from '../logic/progress-model.js';

const pluralTimes = (n) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'раза' : 'раз');

function openModal(label, opener) {
  const box = createEl('div', { className: 'modal-box adult-box' });
  const overlay = createEl('div', { className: 'modal', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': label } }, box);
  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    opener.focus();
  };
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = Array.from(box.querySelectorAll('button, input')).filter((el) => !el.disabled);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  return { box, close };
}

// Защита от ребёнка: простой вопрос на умножение.
function gate(modal, onPass) {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  const input = createEl('input', { className: 'gate-input', attrs: { type: 'number', inputmode: 'numeric', 'aria-label': 'Ответ', autocomplete: 'off' } });
  const msg = createEl('p', { className: 'gate-msg', attrs: { role: 'alert' } });
  const form = createEl('form', {},
    createEl('p', { text: `Сколько будет ${a} × ${b}?`, className: 'gate-q' }),
    input, msg,
    createEl('div', { className: 'modal-actions' },
      createEl('button', { className: 'button', text: 'Проверить', attrs: { type: 'submit' } }),
      createEl('button', { className: 'button secondary', text: 'Отмена', attrs: { type: 'button' }, on: { click: modal.close } })));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (Number(input.value) === a * b) onPass();
    else { msg.textContent = 'Неверно, попробуйте ещё раз.'; input.value = ''; input.focus(); }
  });
  modal.box.replaceChildren(createEl('h2', { text: 'Для взрослых' }), form);
  input.focus();
}

function panel(modal) {
  const state = loadProgress();
  const today = state.days[dateKey()] || { rounds: 0, stars: 0 };

  const rows = Object.entries(state.games).map(([id, g]) => {
    const pct = percent(state, id);
    return createEl('tr', {},
      createEl('td', { text: g.title || id }),
      createEl('td', { text: String(g.answers) }),
      createEl('td', { text: pct === null ? '—' : `${pct}%` }));
  });
  const table = rows.length
    ? createEl('table', { className: 'stats' },
      createEl('thead', {}, createEl('tr', {}, createEl('th', { text: 'Игра' }), createEl('th', { text: 'Ответов' }), createEl('th', { text: 'Верно' }))),
      createEl('tbody', {}, ...rows))
    : createEl('p', { text: 'Пока нет данных.' });

  const errors = topErrors(state, 3);
  const errList = errors.length
    ? createEl('ol', {}, ...errors.map((e) => createEl('li', { text: `${e.game}: ${e.label} — ${e.count} ${pluralTimes(e.count)}` })))
    : createEl('p', { text: 'Ошибок пока нет.' });

  const adaptive = createEl('input', { attrs: { type: 'checkbox', id: 'adaptiveToggle' } });
  adaptive.checked = state.adaptive;
  adaptive.addEventListener('change', () => {
    const fresh = loadProgress();
    fresh.adaptive = adaptive.checked;
    saveProgress(fresh);
  });

  let armed = false;
  let timer = null;
  const resetBtn = createEl('button', { className: 'button secondary', text: 'Сбросить прогресс', attrs: { type: 'button' } });
  resetBtn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      resetBtn.textContent = 'Нажмите ещё раз, чтобы сбросить';
      timer = setTimeout(() => { armed = false; resetBtn.textContent = 'Сбросить прогресс'; }, 4000);
      return;
    }
    clearTimeout(timer);
    resetProgress();
    panel(modal);
  });

  modal.box.replaceChildren(
    createEl('h2', { text: 'Для взрослых' }),
    createEl('p', { text: `Раундов сегодня: ${today.rounds}. Наклеек сегодня: ${today.stars}.` }),
    createEl('h3', { text: 'Верные ответы по играм' }), table,
    createEl('h3', { text: 'Частые ошибки' }), errList,
    createEl('label', { className: 'adaptive-label', attrs: { for: 'adaptiveToggle' } }, adaptive, ' Подсказывать смену уровня'),
    createEl('div', { className: 'modal-actions' }, resetBtn,
      createEl('button', { className: 'button', text: 'Закрыть', attrs: { type: 'button' }, on: { click: modal.close } })));
}

export function mountAdult(openBtn) {
  openBtn.addEventListener('click', () => {
    const modal = openModal('Для взрослых', openBtn);
    gate(modal, () => panel(modal));
  });
}
