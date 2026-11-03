import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../stars.html', import.meta.url), 'utf8');

assert.match(html, /role:\s*'img'/,
  'each sticker must be exposed as an image to assistive technology');
assert.match(html, /'aria-label':\s*`Наклейка \$\{s\.e\}`/,
  'each sticker label must include its displayed emoji instead of a generic repeated label');
assert.doesNotMatch(html, /'aria-label':\s*'наклейка'/,
  'a generic label hides the difference between collected stickers');

console.log('PASS accessibility: sticker labels identify their displayed emoji');
