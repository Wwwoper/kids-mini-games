import { shuffle } from '../core/rng.js';

export function pickRound(rounds, lastIdx = -1, rnd = Math.random) {
  let idx;
  do {
    idx = Math.floor(rnd() * rounds.length);
  } while (rounds.length > 1 && idx === lastIdx);
  return { idx, round: rounds[idx] };
}

export function buildRound(round) {
  return {
    oddId: round.odd,
    explain: round.explain,
    ids: shuffle([...round.cards, round.odd])
  };
}
