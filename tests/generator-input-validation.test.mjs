import assert from 'node:assert/strict';
import { makeRound as makeAppeared } from '../shared/js/logic/appeared.js';
import { makeRound as makeMissing } from '../shared/js/logic/missing.js';
import { makeRound as makeCount } from '../shared/js/logic/count.js';

const cards = [
  { id: 'a', emoji: '🍎', label: 'яблоко' },
  { id: 'b', emoji: '🍐', label: 'груша' },
  { id: 'c', emoji: '🍊', label: 'апельсин' },
  { id: 'd', emoji: '🍋', label: 'лимон' }
];

for (const bad of [null, undefined, {}, { N: 0, shuffle: false }, { N: 2.5, shuffle: false }, { N: 2, shuffle: 'yes' }]) {
  assert.equal(makeAppeared(cards, bad), null, 'appeared rejects invalid config');
  assert.equal(makeMissing(cards, bad), null, 'missing rejects invalid config');
}
assert.equal(makeAppeared(null, { N: 2, shuffle: false }), null);
assert.equal(makeMissing(cards.slice(0, 2), { N: 2, M: 2, shuffle: false }), null);
assert.equal(makeAppeared([{ id: 'x' }, { id: 'x' }], { N: 1, shuffle: false }), null);
assert.equal(makeMissing([{ id: 'x' }, { id: 'x' }, { id: 'y' }], { N: 1, M: 2, shuffle: false }), null);

for (const bad of [null, undefined, {}, { min: -1, max: 2, options: 2, mode: 'mixed' },
  { min: 1, max: 2, options: 3, mode: 'mixed' }, { min: 1, max: 3, options: 2, mode: 'invalid' }]) {
  assert.equal(makeCount(cards, bad), null, 'count rejects invalid config');
}
assert.equal(makeCount([], { min: 1, max: 3, options: 2, mode: 'mixed' }), null);
assert.equal(makeCount([{ id: 'x' }], { min: 1, max: 3, options: 2, mode: 'mixed' }), null);
console.log('PASS: generator input validation');
