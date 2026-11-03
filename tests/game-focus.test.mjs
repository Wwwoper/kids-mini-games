import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cases = [
  ['chto-poyavilos.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?rememberBtn\.focus\(\);/, 'remember button'],
  ['chto-propalo.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?rememberBtn\.focus\(\);/, 'remember button'],
  ['posledovatelnost.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?pileEl\.querySelector\('button'\)\?\.focus\(\);/, 'first sequence card'],
  ['skolko.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?optionsEl\.querySelector\('button'\)\?\.focus\(\);/, 'first answer option'],
  ['tretiy-lishniy.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?cardsEl\.querySelector\('button'\)\?\.focus\(\);/, 'first card'],
  ['uzor.html', /nextBtn\.addEventListener\('click', \(\) => \{[\s\S]*?newRound\(\);[\s\S]*?optionsEl\.querySelector\('button'\)\?\.focus\(\);/, 'first answer option']
];

for (const [file, pattern, target] of cases) {
  const html = await readFile(new URL(`../games/${file}`, import.meta.url), 'utf8');
  assert.match(html, pattern, `${file}: starting a new round must focus the ${target}`);
}

const appeared = await readFile(new URL('../games/chto-poyavilos.html', import.meta.url), 'utf8');
assert.match(appeared, /state\.phase = 'answer';[\s\S]*?render\(\);[\s\S]*?boardEl\.querySelector\('button'\)\?\.focus\(\);/,
  'the appeared-game answer phase must focus its first card after the transition');
const missing = await readFile(new URL('../games/chto-propalo.html', import.meta.url), 'utf8');
assert.match(missing, /state\.phase = 'answer';[\s\S]*?render\(\);[\s\S]*?optionsEl\.querySelector\('button'\)\?\.focus\(\);/,
  'the missing-game answer phase must focus its first option');

console.log('PASS game keyboard focus: new rounds and memory-to-answer transitions keep focus available');
