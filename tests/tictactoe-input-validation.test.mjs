import assert from 'node:assert/strict';
import { chooseComputerMove } from '../shared/js/logic/tictactoe.js';

const board = ['X', '', '', '', 'O', '', '', '', ''];
const validConfig = { strategy: 'minimax', mistakeChance: 0 };

for (const invalidBoard of [null, undefined, {}, '---------', Array(8).fill(''), [...board, ''], ['X', '', '', '', 'O', '', '', '', '?']]) {
  assert.equal(chooseComputerMove(invalidBoard, validConfig), null, 'invalid board should be rejected');
}

for (const invalidConfig of [null, undefined, {}, { strategy: 'unknown', mistakeChance: 0 },
  { strategy: 'minimax', mistakeChance: -0.1 }, { strategy: 'minimax', mistakeChance: 1.1 },
  { strategy: 'minimax', mistakeChance: NaN }]) {
  assert.equal(chooseComputerMove(board, invalidConfig), null, 'invalid config should be rejected');
}

assert.equal(chooseComputerMove(['X', 'X', 'X', '', 'O', '', '', '', ''], validConfig), null, 'finished game should not produce a move');
assert.equal(chooseComputerMove(board, validConfig, null), null, 'invalid random source should be rejected');
assert.equal(chooseComputerMove(board, validConfig, () => 1), null, 'out-of-range random value should be rejected');
assert.equal(chooseComputerMove(board, { strategy: 'simple', mistakeChance: 0 }), 2, 'simple strategy should still choose a valid move');

console.log('PASS tic-tac-toe input validation');
