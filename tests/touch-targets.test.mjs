import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../shared/css/base.css', import.meta.url), 'utf8');

const buttonRule = css.match(/\.button\s*\{([^}]*)\}/)?.[1] ?? '';
const iconButtonRule = css.match(/\.icon-btn\s*\{([^}]*)\}/)?.[1] ?? '';

assert.match(buttonRule, /min-height:\s*44px\s*;/,
  'common buttons and button links must have a minimum 44px height');
assert.match(iconButtonRule, /min-width:\s*44px\s*;/,
  'icon toggles must have a minimum 44px width');
assert.match(iconButtonRule, /min-height:\s*44px\s*;/,
  'icon toggles must have a minimum 44px height');

console.log('PASS touch targets: common and icon buttons have 44px minimum dimensions');
