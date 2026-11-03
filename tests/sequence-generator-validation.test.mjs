import assert from 'node:assert/strict';
import { makeRound } from '../shared/js/logic/sequence.js';

const validSequence = {
  title: 'Рост растения',
  steps: [
    { label: 'семя', image: '../shared/img/sequences/seed.svg' },
    { label: 'росток', image: '../shared/img/sequences/sprout.svg' },
    { label: 'цветок', image: '../shared/img/sequences/flower.svg' }
  ]
};

for (const cfg of [null, undefined, {}, { steps: 0 }, { steps: 1 }, { steps: 2.5 }, { steps: '2' }]) {
  assert.equal(makeRound([validSequence], cfg), null, `invalid config should return null: ${JSON.stringify(cfg)}`);
}

for (const sequences of [null, undefined, {}, 'not-an-array']) {
  assert.equal(makeRound(sequences, { steps: 2 }), null, 'invalid sequence collection should return null');
}

assert.equal(makeRound([], { steps: 2 }), null, 'empty sequence collection should return null');
assert.equal(makeRound([{ title: 'broken', steps: [{ label: 'x', image: '' }] }], { steps: 2 }), null, 'malformed sequence should be ignored');
assert.equal(makeRound([validSequence], { steps: 4 }), null, 'sequence shorter than requested round should be ignored');

const round = makeRound([validSequence], { steps: 3 });
assert.ok(round, 'valid input should produce a round');
assert.equal(round.steps.length, 3);
assert.equal(round.order.length, 3);
assert.ok(round.order.every((step) => round.steps.includes(step)));
assert.equal(new Set(round.order).size, 3);
assert.ok(round.order.some((step, index) => step !== round.steps[index]));

console.log('PASS sequence generator input validation');
