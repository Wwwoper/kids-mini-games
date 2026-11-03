import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pages = [
  'index.html',
  'stars.html',
  'games/chto-poyavilos.html',
  'games/chto-propalo.html',
  'games/kotik-i-shchenok.html',
  'games/posledovatelnost.html',
  'games/skolko.html',
  'games/tretiy-lishniy.html',
  'games/uzor.html',
];

for (const page of pages) {
  const html = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
  const divs = html.matchAll(/<div\b[^>]*>/g);
  for (const [openingTag] of divs) {
    if (!/\baria-label\s*=/.test(openingTag)) continue;
    assert.match(openingTag, /\brole\s*=\s*["']group["']/,
      `${page}: a named div must expose group semantics to assistive technology`);
  }
}

console.log('PASS accessibility: named div containers expose group semantics');
