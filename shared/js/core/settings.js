import { createEl } from './dom.js';
import { initSound, isSoundOn, toggleSound } from './sound.js';
import { initVoice, isVoiceOn, toggleVoice } from './voice.js';

// Создаёт кнопки 🔊 и 🗣️ внутри container и синхронизирует их с localStorage.
export function mountToggles(container) {
  initSound();
  initVoice();

  const soundBtn = createEl('button', {
    className: 'icon-btn',
    attrs: { type: 'button', 'aria-label': 'Звуки', title: 'Звуки' }
  });
  const voiceBtn = createEl('button', {
    className: 'icon-btn',
    attrs: { type: 'button', 'aria-label': 'Голос', title: 'Голос' }
  });

  const update = () => {
    soundBtn.textContent = isSoundOn() ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-pressed', String(isSoundOn()));
    voiceBtn.textContent = isVoiceOn() ? '🗣️' : '🤐';
    voiceBtn.setAttribute('aria-pressed', String(isVoiceOn()));
  };

  soundBtn.addEventListener('click', () => { toggleSound(); update(); });
  voiceBtn.addEventListener('click', () => { toggleVoice(); update(); });

  update();
  container.replaceChildren(soundBtn, voiceBtn);
}
