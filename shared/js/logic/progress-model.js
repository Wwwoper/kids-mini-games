// Чистая модель прогресса: без DOM и localStorage, поэтому её можно тестировать.
export const RECENT_MAX = 5;
const MAX_STICKERS = 300;
const MAX_ERRORS = 60;
const MAX_DAYS = 60;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9-]{1,40}$/;

export const dateKey = (d = new Date()) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export function emptyProgress() {
  return { v: 1, adaptive: true, days: {}, games: {}, recent: {}, stickers: [] };
}

const num = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

// Приводит любые данные из localStorage к корректной структуре.
export function normalize(raw) {
  const s = emptyProgress();
  if (!raw || typeof raw !== 'object') return s;
  s.adaptive = raw.adaptive !== false;

  Object.entries(raw.days || {}).forEach(([key, v]) => {
    if (DAY_RE.test(key) && v && typeof v === 'object') {
      s.days[key] = { answers: num(v.answers), correct: num(v.correct), rounds: num(v.rounds), stars: num(v.stars) };
    }
  });

  Object.entries(raw.games || {}).forEach(([id, v]) => {
    if (!ID_RE.test(id) || !v || typeof v !== 'object') return;
    const errors = {};
    Object.entries(v.errors || {}).forEach(([k, n]) => {
      if (k !== '__proto__' && num(n) > 0) errors[k.slice(0, 80)] = num(n);
    });
    s.games[id] = { title: str(v.title, 60), answers: num(v.answers), correct: num(v.correct), rounds: num(v.rounds), errors };
  });

  Object.entries(raw.recent || {}).forEach(([id, list]) => {
    if (ID_RE.test(id) && Array.isArray(list)) {
      s.recent[id] = list.map((x) => (x === 1 ? 1 : 0)).slice(-RECENT_MAX);
    }
  });

  if (Array.isArray(raw.stickers)) {
    s.stickers = raw.stickers
      .filter((x) => x && DAY_RE.test(x.d) && typeof x.e === 'string' && x.e.length <= 8)
      .map((x) => ({ d: x.d, e: x.e }))
      .slice(-MAX_STICKERS);
  }
  return s;
}

function dayStat(state, day) {
  if (!state.days[day]) state.days[day] = { answers: 0, correct: 0, rounds: 0, stars: 0 };
  const keys = Object.keys(state.days).sort();
  while (keys.length > MAX_DAYS) delete state.days[keys.shift()];
  return state.days[day];
}

function gameStat(state, id, title) {
  if (!state.games[id]) state.games[id] = { title: '', answers: 0, correct: 0, rounds: 0, errors: {} };
  if (title) state.games[id].title = title;
  return state.games[id];
}

// Ответ ребёнка: correct — верно ли; errorKey — короткое описание ошибки.
export function recordAnswer(state, gameId, correct, errorKey, day, title = '') {
  const d = dayStat(state, day);
  const g = gameStat(state, gameId, title);
  d.answers += 1;
  g.answers += 1;
  if (correct) {
    d.correct += 1;
    g.correct += 1;
  } else if (errorKey && String(errorKey) !== '__proto__') {
    const key = String(errorKey).slice(0, 80);
    const previous = Object.hasOwn(g.errors, key) ? g.errors[key] : 0;
    g.errors[key] = previous + 1;
    const keys = Object.keys(g.errors);
    if (keys.length > MAX_ERRORS) {
      keys.sort((a, b) => g.errors[a] - g.errors[b]);
      delete g.errors[keys[0]];
    }
  }
  state.recent[gameId] = [...(state.recent[gameId] || []), correct ? 1 : 0].slice(-RECENT_MAX);
  return state;
}

// Раунд пройден успешно.
export function recordRound(state, gameId, day, title = '') {
  dayStat(state, day).rounds += 1;
  gameStat(state, gameId, title).rounds += 1;
  return state;
}

export function recordStar(state, day, emoji) {
  dayStat(state, day).stars += 1;
  state.stickers = [...state.stickers, { d: day, e: emoji }].slice(-MAX_STICKERS);
  return state;
}

export function clearRecent(state, gameId) {
  state.recent[gameId] = [];
  return state;
}

// 3 верных подряд → 'up'; 2 ошибки подряд → 'down'; иначе null.
export function evaluate(recent, levelIndex, levelCount) {
  const list = recent || [];
  const last3 = list.slice(-3);
  if (last3.length === 3 && last3.every((v) => v === 1) && levelIndex < levelCount - 1) return 'up';
  const last2 = list.slice(-2);
  if (last2.length === 2 && last2.every((v) => v === 0) && levelIndex > 0) return 'down';
  return null;
}

export function percent(state, gameId) {
  const g = state.games[gameId];
  return g && g.answers > 0 ? Math.round((g.correct / g.answers) * 100) : null;
}

export function topErrors(state, n = 3) {
  const all = [];
  Object.entries(state.games).forEach(([id, g]) => {
    Object.entries(g.errors).forEach(([label, count]) => all.push({ gameId: id, game: g.title || id, label, count }));
  });
  return all.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, n);
}

export function totalStars(state) {
  return Object.values(state.days).reduce((sum, d) => sum + d.stars, 0);
}
