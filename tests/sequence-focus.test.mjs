import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../games/posledovatelnost.html', import.meta.url), 'utf8');
const pick = html.match(/function pick\(step, btn\) \{[\s\S]*?\n\}/)?.[0];

assert.ok(pick, 'the sequence game must define its card selection handler');
assert.match(pick, /render\(\);[\s\S]*?const nextStepIndex = state\.order\.indexOf\(state\.steps\[state\.placed\]\);[\s\S]*?pileEl\.children\[nextStepIndex\]\?\.focus\(\);/,
  'after a correct non-final answer, focus must move to the next expected card after re-render');
assert.match(pick, /if \(done\)[\s\S]*?nextBtn\.focus\(\);[\s\S]*?else \{[\s\S]*?pileEl\.children\[nextStepIndex\]\?\.focus\(\);/,
  'the final answer must continue to focus the next-round button');
assert.match(pick, /\} else \{[\s\S]*?btn\.classList\.add\('wrong'\)/,
  'an incorrect answer must keep the existing card in place for focus continuity');

console.log('PASS sequence keyboard focus: next expected card receives focus after a correct answer');
