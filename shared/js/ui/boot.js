import { qs } from '../core/dom.js';
import { registerServiceWorker } from '../core/pwa.js';
import { mountToggles } from '../core/settings.js';

// Общий запуск страницы игры: переключатели звука и голоса + офлайн-режим.
export function bootGame() {
  mountToggles(qs('#toggles'));
  registerServiceWorker();
}
