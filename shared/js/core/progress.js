import { readSetting, writeSetting } from './storage.js';
import { emptyProgress, normalize } from '../logic/progress-model.js';

const KEY = 'kmg-progress';

export function loadProgress() {
  try {
    return normalize(JSON.parse(readSetting(KEY, 'null')));
  } catch (e) {
    return emptyProgress();
  }
}

export function saveProgress(state) {
  return writeSetting(KEY, JSON.stringify(state));
}

// Сбрасывает прогресс, но сохраняет настройку взрослого.
export function resetProgress() {
  const fresh = emptyProgress();
  fresh.adaptive = loadProgress().adaptive;
  saveProgress(fresh);
  return fresh;
}
