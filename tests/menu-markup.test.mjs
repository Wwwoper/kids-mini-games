import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const menuItems = [...html.matchAll(/<a class="menu-item"[\s\S]*?<\/a>/g)].map(([item]) => item);

assert.equal(menuItems.length, 7, 'the menu must contain all seven games');
for (const [index, item] of menuItems.entries()) {
  assert.match(item, /<div class="menu-copy">\s*<p class="menu-title">[\s\S]*?<p class="menu-hint">[\s\S]*?<\/div>/,
    `menu item ${index + 1} must group its title and hint in a flow-content container`);
  assert.doesNotMatch(item, /<span>\s*<p\b/, `menu item ${index + 1} must not place paragraphs inside a span`);
}

console.log('PASS menu markup: all seven menu items use valid content grouping');
