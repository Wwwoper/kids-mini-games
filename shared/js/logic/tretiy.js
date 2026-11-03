import { shuffle } from '../core/rng.js';

export function pickRound(rounds, lastIdx = -1, rnd = Math.random) {
  if (!rounds.length) return null;
  if (rounds.length === 1) return { idx: 0, round: rounds[0] };
  const hasPrevious = Number.isInteger(lastIdx) && lastIdx >= 0 && lastIdx < rounds.length;
  const choices = rounds.length - (hasPrevious ? 1 : 0);
  let idx = Math.floor(rnd() * choices);
  if (hasPrevious && idx >= lastIdx) idx += 1;
  return { idx, round: rounds[idx] };
}

export function buildRound(round) {
  return {
    oddId: round.odd,
    explain: round.explain,
    ids: shuffle([...round.cards, round.odd])
  };
}
