import assert from 'node:assert/strict';
import { buildRound, pickRound } from '../shared/js/logic/tretiy.js';

const valid = { cards: ['apple', 'pear'], odd: 'bus', explain: 'Это транспорт' };

for (const rounds of [null, undefined, {}, 'rounds', []]) {
  assert.equal(pickRound(rounds), null, 'invalid round list should be rejected');
}
for (const random of [null, 1, () => NaN, () => -0.1, () => 1, () => Infinity, () => { throw new Error('rng'); }]) {
  assert.equal(pickRound([valid, valid], -1, random), null, 'invalid random source should be rejected');
}
assert.equal(pickRound([valid], -1, () => 0).round, valid, 'single round should remain selectable');
assert.equal(pickRound([valid, valid], -1, () => 0).idx, 0, 'valid random value should select a round');

for (const round of [null, undefined, [], {}, { ...valid, cards: null },
  { ...valid, cards: ['apple'] }, { ...valid, cards: ['apple', 'apple'] },
  { ...valid, cards: ['apple', 'pear', 'bus'] }, { ...valid, odd: 'apple' },
  { ...valid, odd: null }, { ...valid, explain: '  ' }]) {
  assert.equal(buildRound(round), null, 'invalid round should be rejected');
}
const built = buildRound(valid);
assert.equal(built.oddId, 'bus');
assert.equal(built.explain, valid.explain);
assert.deepEqual(new Set(built.ids), new Set(['apple', 'pear', 'bus']));

console.log('PASS third-game input validation');
