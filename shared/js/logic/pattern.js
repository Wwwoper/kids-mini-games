import { shuffle, sample } from '../core/rng.js';

// cfg: { patterns: [{ p: 'AAB', shown: 5 }], options: M }
export function makeRound(list, cfg) {
  const { patterns, options: M } = cfg;
  const { p, shown } = patterns[Math.floor(Math.random() * patterns.length)];
  const letters = [...new Set(p)];
  // Для M уникальных вариантов достаточно M разных карточек всего:
  // ответ плюс M - 1 отвлекающих вариантов.
  if (list.length < M) return null;

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
