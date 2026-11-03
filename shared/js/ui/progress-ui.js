import { createEl } from '../core/dom.js';
import { loadProgress, saveProgress } from '../core/progress.js';
import {
  clearRecent, dateKey, evaluate, recordAnswer, recordRound, recordStar
} from '../logic/progress-model.js';
import { LEVEL_LABELS } from './level-switch.js';
import { showReward } from './reward.js';

export const ROUNDS_PER_REWARD = 5;
const STICKERS = ['🦄', '🐯', '🐼', '🐸', '🦁', '🐙', '🦋', '🐞', '🚀', '🌈', '🍭', '🎈', '🐳', '🦊', '🐧', '🌻'];

// Связывает игру со статистикой, адаптивной сложностью и наградами.
// host — пустой элемент, куда добавляется ненавязчивая подсказка о смене уровня.
export function createGameProgress({ gameId, title, host }) {
  let levelSwitch = null;
  let session = 0;
  let rewardTimer = null;
  const cancelPendingReward = () => {
    if (rewardTimer !== null) {
      clearTimeout(rewardTimer);
      rewardTimer = null;
    }
  };
  window.addEventListener('kmg:progress-reset', cancelPendingReward);
  const banner = createEl('div', { className: 'suggest', attrs: { role: 'status' } });
  banner.hidden = true;
  host.append(banner);

  function hideSuggest() {
    banner.hidden = true;
    banner.replaceChildren();
  }

  function offer(dir) {
    const idx = levelSwitch.ids.indexOf(levelSwitch.get());
    const target = levelSwitch.ids[dir === 'up' ? idx + 1 : idx - 1];
    const text = dir === 'up'
      ? `Отлично получается! Попробуем уровень «${LEVEL_LABELS[target]}»?`
      : `Можно попробовать полегче: уровень «${LEVEL_LABELS[target]}»?`;
    banner.replaceChildren(
      createEl('span', { text }),
      createEl('button', { className: 'button secondary', text: 'Попробовать', attrs: { type: 'button' }, on: { click: () => levelSwitch.set(target) } }),
      createEl('button', { className: 'button secondary', text: 'Остаться', attrs: { type: 'button' }, on: { click: hideSuggest } })
    );
    banner.hidden = false;
  }

  function answer(correct, errorKey = null, { adapt = true } = {}) {
    const state = loadProgress();
    recordAnswer(state, gameId, correct, errorKey, dateKey(), title);
    let verdict = null;
    if (adapt && state.adaptive && levelSwitch) {
      verdict = evaluate(state.recent[gameId], levelSwitch.ids.indexOf(levelSwitch.get()), levelSwitch.ids.length);
      if (verdict) clearRecent(state, gameId);
    }
    saveProgress(state);
    if (verdict) offer(verdict);
  }

  function roundWon() {
    const state = loadProgress();
    recordRound(state, gameId, dateKey(), title);
    saveProgress(state);
    session += 1;
    if (session % ROUNDS_PER_REWARD === 0) {
      cancelPendingReward();
      rewardTimer = setTimeout(() => {
        rewardTimer = null;
        const fresh = loadProgress();
        const emoji = STICKERS[Math.floor(Math.random() * STICKERS.length)];
        recordStar(fresh, dateKey(), emoji);
        saveProgress(fresh);
        showReward({ emoji });
      }, 1600);
    }
  }

  return {
    attach(ls) { levelSwitch = ls; },
    answer,
    wrong: (errorKey, opts) => answer(false, errorKey, opts),
    right: (opts) => { answer(true, null, opts); roundWon(); },
    roundWon,
    levelChanged() {
      const state = loadProgress();
      clearRecent(state, gameId);
      saveProgress(state);
      hideSuggest();
    }
  };
}
