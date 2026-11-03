export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function result(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line };
  }
  return b.every(Boolean) ? { draw: true } : null;
}

// Компьютер играет за 'O'.
function minimax(b, isMax, depth) {
  const r = result(b);
  if (r && r.winner === 'O') return 10 - depth;
  if (r && r.winner === 'X') return depth - 10;
  if (r && r.draw) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = isMax ? 'O' : 'X';
    const score = minimax(b, !isMax, depth + 1);
    b[i] = '';
    best = isMax ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

export function bestMinimaxMove(b) {
  if (!b.some((cell) => !cell)) return null;
  let best = -Infinity;
  let moves = [];
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = 'O';
    const score = minimax(b, false, 0);
    b[i] = '';
    if (score > best) {
      best = score;
      moves = [i];
    } else if (score === best) {
      moves.push(i);
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

// Простой уровень: выиграть, если можно; иначе заблокировать; иначе по приоритету клеток.
export function easyMove(b) {
  if (!b.some((cell) => !cell)) return null;
  for (const player of ['O', 'X']) {
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      const test = b.slice();
      test[i] = player;
      const r = result(test);
      if (r && r.winner === player) return i;
    }
  }
  const pick = [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => !b[i]);
  return pick === undefined ? b.findIndex((v) => !v) : pick;
}

// cfg — { strategy: 'simple' | 'minimax', mistakeChance }
export function chooseComputerMove(board, cfg, rnd = Math.random) {
  if (!Array.isArray(board) || board.length !== 9
    || board.some((cell) => !['', 'X', 'O'].includes(cell))
    || result(board)) return null;
  if (!cfg || typeof cfg !== 'object'
    || !['simple', 'minimax'].includes(cfg.strategy)
    || !Number.isFinite(cfg.mistakeChance)
    || cfg.mistakeChance < 0 || cfg.mistakeChance > 1
    || typeof rnd !== 'function') return null;
  if (!board.some((cell) => !cell)) return null;
  if (cfg.strategy === 'simple') return easyMove(board);

  const mistakeRoll = rnd();
  if (!Number.isFinite(mistakeRoll) || mistakeRoll < 0 || mistakeRoll >= 1) return null;
  if (mistakeRoll < cfg.mistakeChance) {
    const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const moveRoll = rnd();
    if (!Number.isFinite(moveRoll) || moveRoll < 0 || moveRoll >= 1) return null;
    return free[Math.floor(moveRoll * free.length)];
  }
  return bestMinimaxMove(board.slice());
}
