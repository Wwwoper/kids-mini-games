import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../shared/css/layout.css', import.meta.url), 'utf8');
const menuItems = [...html.matchAll(/<a class="menu-item"[\s\S]*?<\/a>/g)].map(([item]) => item);

assert.equal(menuItems.length, 7, 'the home page must keep all seven games visible');
assert.doesNotMatch(html, /menu-emoji|🍎|🍐|🚌|🚀|🧸|🐱|🐶|3️⃣|🌱|🌸/u,
  'the game menu must not use ambiguous emoji combinations as previews');
for (const [index, item] of menuItems.entries()) {
  assert.match(item, /<svg class="menu-art"[^>]*aria-hidden="true"/,
    `menu item ${index + 1} must have a decorative visual preview`);
  assert.match(item, /<p class="menu-title">[\s\S]*?<p class="menu-hint">/,
    `menu item ${index + 1} must retain a readable title and action hint`);
}
assert.match(css, /\.menu\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  'wide screens must show a two-column game grid');
assert.match(css, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.menu\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  'narrow screens must show a single-column game list');
assert.match(css, /\.menu-item:focus-visible\s*\{[^}]*outline:\s*3px solid #92713a/,
  'keyboard focus must remain visible with a warm, non-blue outline');
assert.doesNotMatch(css, /\.menu-item:hover,\s*\.menu-item:focus-visible\s*\{[^}]*transform:/,
  'hover and keyboard focus must not shift the card position');

console.log('PASS menu design: illustrated cards, responsive grid and warm keyboard focus');
