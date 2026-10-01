import { shuffle, sample } from '../core/rng.js';

// cfg — { N, shuffle }. Возвращает исходный набор S, новую карточку и итоговый набор.
export function makeRound(list, cfg) {
  const { N, shuffle: doShuffle } = cfg;
  if (list.length < N + 1) return null;
  const S = sample(list, N);
  const others = list.filter((p) => !S.some((s) => s.id === p.id));
  const newItem = others[Math.floor(Math.random() * others.length)];

  let finalItems;
  if (doShuffle) {
    finalItems = shuffle([...S, newItem]);
  } else {
    finalItems = [...S];
    finalItems.splice(Math.floor(Math.random() * (N + 1)), 0, newItem);
  }
  return { S, newItem, finalItems };
}
