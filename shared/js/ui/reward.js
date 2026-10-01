import { createEl } from '../core/dom.js';
import { sndWinGood } from '../core/sound.js';
import { speak } from '../core/voice.js';

export function showReward({ emoji }) {
  if (document.querySelector('.reward')) return;
  const previous = document.activeElement;
  const okBtn = createEl('button', { className: 'button orange', text: 'Ура!', attrs: { type: 'button' } });
  const overlay = createEl('div', { className: 'modal reward', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rewardTitle' } },
    createEl('div', { className: 'modal-box reward-box' },
      createEl('h2', { text: 'Молодец!', attrs: { id: 'rewardTitle' } }),
      createEl('div', { className: 'sticker', text: emoji, attrs: { 'aria-hidden': 'true' } }),
      createEl('p', { text: 'Ты отлично поиграл! Вот твоя наклейка.' }),
      okBtn));

  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    if (previous && previous.focus) previous.focus();
  };
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); okBtn.focus(); }
  }
  okBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  okBtn.focus();
  sndWinGood();
  speak('Молодец! Вот твоя наклейка');
}
