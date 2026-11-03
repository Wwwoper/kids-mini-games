import assert from 'node:assert/strict';
import { resetProgress } from '../shared/js/core/progress.js';

const values = new Map([['kmg-progress', JSON.stringify({ v: 1, adaptive: false, days: {}, games: {}, recent: {}, stickers: [{ d: '2026-11-03', e: '⭐' }] })]]);
globalThis.localStorage = {
  getItem(key) { return values.has(key) ? values.get(key) : null; },
  setItem(key, value) { values.set(key, String(value)); }
};
const events = [];
globalThis.window = new EventTarget();
window.addEventListener('kmg:progress-reset', (event) => events.push(event.type));

const state = resetProgress();
assert.equal(state.adaptive, false, 'reset must preserve adaptive setting');
assert.deepEqual(state.stickers, [], 'reset must clear stickers');
assert.deepEqual(events, ['kmg:progress-reset'], 'reset must notify pending reward handlers');
assert.equal(JSON.parse(values.get('kmg-progress')).stickers.length, 0, 'reset state must be persisted');

console.log('PASS progress reset: pending reward cancellation event is dispatched');
