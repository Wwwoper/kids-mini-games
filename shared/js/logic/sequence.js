import { shuffle } from '../core/rng.js';

// Возвращает список ошибок последовательности (пустой — всё в порядке).
export function validateSequence(seq) {
  const errors = [];
  if (!seq || typeof seq.title !== 'string' || !seq.title.trim()) errors.push('title пустой');
  if (!seq || !Array.isArray(seq.steps) || seq.steps.length < 2) return [...errors, 'steps: нужно минимум 2 шага'];
  const emojis = new Set();
  seq.steps.forEach((s, i) => {
    if (!s || !s.emoji || !s.label) errors.push(`шаг ${i + 1}: нужны emoji и label`);
    else if (emojis.has(s.emoji)) errors.push(`шаг ${i + 1}: emoji повторяется`);
    else emojis.add(s.emoji);
  });
  return errors;
}

// cfg: { steps: n }. Берёт n подряд идущих шагов и перемешивает так, чтобы порядок не совпал.
export function makeRound(sequences, cfg) {
  const n = cfg.steps;
  const usable = sequences.filter((s) => s.steps.length >= n);
  if (!usable.length) return null;
  const seq = usable[Math.floor(Math.random() * usable.length)];
  const start = Math.floor(Math.random() * (seq.steps.length - n + 1));
  const steps = seq.steps.slice(start, start + n);
  let order;
  do {
    order = shuffle(steps);
  } while (n > 1 && order.every((s, i) => s === steps[i]));
  return { title: seq.title, steps, order };
}
