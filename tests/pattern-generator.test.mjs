import assert from 'node:assert/strict';
import { makeRound } from '../shared/js/logic/pattern.js';

const cards = [
  { id: 'apple', label: 'яблоко', emoji: '🍎' },
  { id: 'pear', label: 'груша', emoji: '🍐' },
  { id: 'banana', label: 'банан', emoji: '🍌' }
];

// Двух символов узора и трёх карточек достаточно для трёх уникальных ответов.
// Старое условие ошибочно требовало пять карточек (letters.length + options).
const cfg = { patterns: [{ p: 'AB', shown: 4 }], options: 3 };
const round = makeRound(cards, cfg);

assert.ok(round, 'generator should accept the minimum pool size equal to options');
assert.equal(round.options.length, cfg.options);
assert.equal(round.options.filter((item) => item.id === round.answer.id).length, 1);
assert.equal(new Set(round.options.map((item) => item.id)).size, cfg.options);
assert.equal(round.shown.length, 4);

console.log('PASS pattern generator: accepts the minimum sufficient card pool');
