import { shuffle, sample } from '../core/rng.js';

export const NUMBER_WORDS = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять'];

// cfg: { min, max, options, mode: 'count-to-digit' | 'digit-to-count' | 'mixed' }
export function makeRound(list, cfg) {
  if (!Array.isArray(list) || !list.length || !cfg) return null;
  const { min, max, options: M } = cfg;
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max > 10 || max < min
    || !Number.isInteger(M) || M < 2 || max - min + 1 < M
    || !['count-to-digit', 'digit-to-count', 'mixed'].includes(cfg.mode)
    || list.some((item) => !item || typeof item.emoji !== 'string' || !item.emoji)) return null;
  const mode = cfg.mode === 'mixed'
    ? (Math.random() < 0.5 ? 'count-to-digit' : 'digit-to-count')
    : cfg.mode;
  const item = list[Math.floor(Math.random() * list.length)];
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const others = [];
  for (let n = min; n <= max; n++) if (n !== count) others.push(n);
  return { item, count, mode, options: shuffle([count, ...sample(others, M - 1)]) };
}
