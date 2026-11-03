import { shuffle } from '../core/rng.js';

export function pickRound(rounds, lastIdx = -1, rnd = Math.random) {
  if (!rounds.length) return null;
  let idx = Math.floor(rnd() * rounds.length);
  if (rounds.length > 1 && idx === lastIdx) idx = (idx + 1) % rounds.length;
  return { idx, round: rounds[idx] };
}

export function buildRound(round) {
  return {
    oddId: round.odd,
    explain: round.explain,
    ids: shuffle([...round.cards, round.odd])
  };
}
