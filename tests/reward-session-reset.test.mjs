import assert from 'node:assert/strict';

const values = new Map();
globalThis.localStorage = {
  getItem(key) { return values.has(key) ? values.get(key) : null; },
  setItem(key, value) { values.set(key, String(value)); }
};

class FakeElement {
  constructor() { this.children = []; this.hidden = false; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute() {}
}
globalThis.document = { createElement() { return new FakeElement(); } };
globalThis.window = new EventTarget();
let nextTimer = 1;
const scheduled = new Map();
globalThis.setTimeout = (fn) => { const id = nextTimer++; scheduled.set(id, fn); return id; };
globalThis.clearTimeout = (id) => scheduled.delete(id);

const { createGameProgress } = await import('../shared/js/ui/progress-ui.js');
const progress = createGameProgress({ gameId: 'test-game', title: 'Тест', host: new FakeElement() });
for (let i = 0; i < 4; i++) progress.roundWon();
assert.equal(scheduled.size, 0, 'four rounds must not schedule a reward');
window.dispatchEvent(new Event('kmg:progress-reset'));
progress.roundWon();
assert.equal(scheduled.size, 0, 'a reset must restart the reward counter');
for (let i = 0; i < 4; i++) progress.roundWon();
assert.equal(scheduled.size, 1, 'five rounds after reset must schedule exactly one reward');
console.log('PASS reward session counter resets with progress');
