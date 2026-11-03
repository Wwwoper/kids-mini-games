import { shuffle } from '../core/rng.js';

export function pickRound(rounds, lastIdx = -1, rnd = Math.random) {
  if (!Array.isArray(rounds) || rounds.length === 0 || typeof rnd !== 'function') return null;
  let value;
  try {
    value = rnd();
  } catch {
    return null;
  }
  if (!Number.isFinite(value) || value < 0 || value >= 1) return null;
  if (rounds.length === 1) return { idx: 0, round: rounds[0] };
  const hasPrevious = Number.isInteger(lastIdx) && lastIdx >= 0 && lastIdx < rounds.length;
  const choices = rounds.length - (hasPrevious ? 1 : 0);
  let idx = Math.floor(value * choices);
  if (hasPrevious && idx >= lastIdx) idx += 1;
  return { idx, round: rounds[idx] };
}

export function buildRound(round) {
  if (!round || typeof round !== 'object' || Array.isArray(round)
    || !Array.isArray(round.cards) || round.cards.length !== 2
    || round.cards.some((id) => typeof id !== 'string' || id.trim() === '')
    || new Set(round.cards).size !== 2
    || typeof round.odd !== 'string' || round.odd.trim() === ''
    || round.cards.includes(round.odd)
    || typeof round.explain !== 'string' || round.explain.trim() === '') {
    return null;
  }
  return {
    oddId: round.odd,
    explain: round.explain,
    ids: shuffle([...round.cards, round.odd])
  };
}
