import assert from 'node:assert/strict';
import { makeRound } from '../shared/js/logic/appeared.js';

const cards = [
  { id: 'a', emoji: '🍎', label: 'яблоко' },
  { id: 'b', emoji: '🍐', label: 'груша' },
  { id: 'c', emoji: '🍊', label: 'апельсин' },
  { id: 'd', emoji: '🍋', label: 'лимон' }
];

const originalRandom = Math.random;
try {
  for (let position = 0; position <= 3; position++) {
    const values = [0, 0, 0, 0, (position + 0.1) / 4];
    Math.random = () => values.shift() ?? 0;

    const round = makeRound(cards, { N: 3, shuffle: false });
    assert.ok(round, `round should be generated for insertion position ${position}`);
    assert.equal(round.finalItems.length, 4);
    assert.equal(round.finalItems.filter((item) => item.id === round.newItem.id).length, 1);
    assert.equal(round.finalItems.indexOf(round.newItem), position, `new card should be inserted at ${position}`);

    const oldIdsInFinalOrder = round.finalItems
      .filter((item) => item.id !== round.newItem.id)
      .map((item) => item.id);
    assert.deepEqual(oldIdsInFinalOrder, round.S.map((item) => item.id), 'existing cards must keep their relative order');
  }
} finally {
  Math.random = originalRandom;
}

console.log('PASS: appeared game inserts the new card at every position while preserving old-card order');
