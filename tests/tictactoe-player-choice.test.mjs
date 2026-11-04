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

test('tic-tac-toe: character choice is presented as a separate child-friendly step', () => {
  assert.match(html, /class="player-choice-panel" id="playerChoice"/);
  assert.match(html, /За кого играешь\?/);
  assert.doesNotMatch(html, /player-choice-instruction/);
});

test('tic-tac-toe: computer-mode hint uses correct accusative character forms', () => {
  assert.match(html, /object: 'котика'/);
  assert.match(html, /object: 'щенка'/);
  assert.match(html, /Ты играешь за \$\{human\.object\}\./);
  assert.doesNotMatch(html, /replace\('котиком', characterFor\('X'\)\.name\)/);
});
