import { shuffle, sample } from '../core/rng.js';

// cfg — { N, shuffle }. Возвращает исходный набор S, новую карточку и итоговый набор.
// При shuffle: false исходные карточки сохраняют свои индексы, новая добавляется в конец.
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
    finalItems = [...S, newItem];
  }
  return { S, newItem, finalItems };
}
