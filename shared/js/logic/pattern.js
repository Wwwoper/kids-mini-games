import { shuffle, sample } from '../core/rng.js';

// cfg: { patterns: [{ p: 'AAB', shown: 5 }], options: M }
export function makeRound(list, cfg) {
  if (!Array.isArray(list) || !cfg || !Array.isArray(cfg.patterns)
    || !Number.isInteger(cfg.options) || cfg.options < 2
    || list.length < cfg.options || cfg.patterns.length === 0) return null;

  const { patterns, options: M } = cfg;
  const selected = patterns[Math.floor(Math.random() * patterns.length)];
  if (!selected || typeof selected.p !== 'string' || selected.p.length === 0
    || !Number.isInteger(selected.shown) || selected.shown < 1) return null;

  const { p, shown } = selected;
  const letters = [...new Set(p)];
  if (letters.length > list.length) return null;
  // Для M уникальных вариантов достаточно M разных карточек всего:
  // ответ плюс M - 1 отвлекающих вариантов.

  const symbols = sample(list, letters.length);
  const map = Object.fromEntries(letters.map((l, i) => [l, symbols[i]]));
  const full = Array.from({ length: shown + 1 }, (_, i) => map[p[i % p.length]]);
  const answer = full[shown];

  // Сначала символы самого узора (осмысленный выбор), затем случайные.
  const inPattern = shuffle(symbols.filter((s) => s.id !== answer.id));
  const rest = sample(list.filter((c) => !symbols.some((s) => s.id === c.id)), M);
  const distractors = [...inPattern, ...rest].slice(0, M - 1);

  return { pattern: p, shown: full.slice(0, shown), answer, options: shuffle([answer, ...distractors]) };
}
