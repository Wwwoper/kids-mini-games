import { shuffle, sample } from '../core/rng.js';

// cfg — { N, shuffle }. Возвращает исходный набор S, новую карточку и итоговый набор.
// При shuffle: false исходные карточки сохраняют относительный порядок, новая вставляется случайно.
export function makeRound(list, cfg) {
  if (!Array.isArray(list) || !cfg || !Number.isInteger(cfg.N) || cfg.N < 1
    || typeof cfg.shuffle !== 'boolean' || list.length < cfg.N + 1) return null;
  const ids = list.map((item) => item?.id);
  if (list.some((item) => typeof item?.id !== 'string' || !item.id
    || typeof item.label !== 'string' || !item.label.trim()
    || typeof item.emoji !== 'string' || !item.emoji.trim())
    || new Set(ids).size !== ids.length) return null;

  const { N, shuffle: doShuffle } = cfg;
  const S = sample(list, N);
  const others = list.filter((p) => !S.some((s) => s.id === p.id));
  const newItem = others[Math.floor(Math.random() * others.length)];

  let finalItems;
  if (doShuffle) {
    finalItems = shuffle([...S, newItem]);
  } else {
    const position = Math.floor(Math.random() * (S.length + 1));
    finalItems = [...S.slice(0, position), newItem, ...S.slice(position)];
  }
  return { S, newItem, finalItems };
}
