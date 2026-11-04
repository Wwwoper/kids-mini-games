import assert from 'node:assert/strict';
import { chooseComputerMove } from '../shared/js/logic/tictactoe.js';

const easy = { strategy: 'simple', mistakeChance: 0.45 };
const noMistake = () => 0.9;

// When the puppy plays carefully, it still takes an immediate win.
const winningBoard = ['O', 'O', '', 'X', 'X', '', '', '', ''];
assert.equal(chooseComputerMove(winningBoard, easy, noMistake), 2);

// On easy mode it can overlook an immediate win and choose another free cell.
let rolls = [0.1, 0.3];
assert.equal(chooseComputerMove(winningBoard, easy, () => rolls.shift()), 5);

// It can also miss the player's immediate threat instead of always blocking it.
const blockingBoard = ['X', 'X', '', 'O', '', '', '', '', ''];
rolls = [0.1, 0.3];
assert.equal(chooseComputerMove(blockingBoard, easy, () => rolls.shift()), 4);

// With no mistake chance, the simple strategy retains its tactical behavior.
assert.equal(chooseComputerMove(blockingBoard, { ...easy, mistakeChance: 0 }, noMistake), 2);

console.log('PASS tic-tac-toe easy level: occasional tactical mistakes');
