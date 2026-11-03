import { shuffle, sample } from '../core/rng.js';

// list — массив карточек { id, label, emoji }. cfg — { N, M, shuffle }.
export function makeRound(list, cfg) {
  if (!Array.isArray(list) || !cfg || !Number.isInteger(cfg.N) || cfg.N < 1
    || !Number.isInteger(cfg.M) || cfg.M < 2 || typeof cfg.shuffle !== 'boolean'
    || list.length < cfg.N + cfg.M - 1) return null;
  const ids = list.map((item) => item?.id);
  if (ids.some((id) => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) return null;

  const { N, M, shuffle: doShuffle } = cfg;
  const S = sample(list, N);
  const hiddenIndex = Math.floor(Math.random() * N);
  const answer = S[hiddenIndex];
  const others = list.filter((p) => !S.some((s) => s.id === p.id));
  const distractors = sample(others, M - 1);
  const options = shuffle([answer, ...distractors]);

  let displayIds;
  if (doShuffle) {
    displayIds = shuffle(S.filter((c) => c.id !== answer.id)).map((c) => c.id);
  } else {
    displayIds = S.map((c, i) => (i === hiddenIndex ? null : c.id));
  }
  return { S, answer, hiddenIndex, displayIds, options };
}
