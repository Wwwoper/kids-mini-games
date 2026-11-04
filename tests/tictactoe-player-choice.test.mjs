import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../games/kotik-i-shchenok.html', import.meta.url), 'utf8');

test('tic-tac-toe: player can choose either character and images are used instead of emojis', () => {
  assert.match(html, /id="playCat"/);
  assert.match(html, /id="playPuppy"/);
  assert.match(html, /playerCharacter = 'cat'/);
  assert.match(html, /playerCharacter = 'puppy'/);
  assert.match(html, /function characterFor\(side\)/);
  assert.match(html, /ttt-cat\.webp/);
  assert.match(html, /ttt-puppy\.webp/);
  assert.doesNotMatch(html, /🐱|🐶/);
  assert.doesNotMatch(html, /<h1>[^<]*🐾/);
});
