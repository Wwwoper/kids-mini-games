import assert from 'node:assert/strict';
import { POOL, getCard } from '../shared/js/content/cards.js';
import { validateRound } from '../shared/js/content/loader.js';

const valid = { cards: ['apple', 'pear'], odd: 'bus', explain: 'Пара и лишний предмет' };
assert.deepEqual(validateRound(valid, POOL), []);

for (const id of ['constructor', 'toString', '__proto__']) {
  const badCard = { ...valid, cards: [id, 'pear'] };
  assert.ok(validateRound(badCard, POOL).some((error) => error.includes(`«${id}»`)), `cards must reject inherited key ${id}`);
  const badOdd = { ...valid, odd: id };
  assert.ok(validateRound(badOdd, POOL).some((error) => error.includes(`«${id}»`)), `odd must reject inherited key ${id}`);
  assert.equal(getCard(id), null, `getCard must reject inherited key ${id}`);
}

assert.ok(validateRound({ ...valid, cards: [42, 'pear'] }, POOL).length > 0, 'card ids must be strings');
assert.ok(validateRound(valid, null).length > 0, 'missing pool must reject ids');

console.log('PASS content validation: rejects inherited and malformed card ids');
