import { POOL, POOL_LIST } from '../shared/js/content/cards.js';
import { validateRound } from '../shared/js/content/loader.js';
import { buildRound } from '../shared/js/logic/tretiy.js';
import { makeRound as makeMissing } from '../shared/js/logic/missing.js';
import { makeRound as makeAppeared } from '../shared/js/logic/appeared.js';
import { makeRound as makeCount } from '../shared/js/logic/count.js';
import { makeRound as makePattern } from '../shared/js/logic/pattern.js';
import { makeRound as makeSequence, validateSequence } from '../shared/js/logic/sequence.js';
import { LINES, result, bestMinimaxMove, chooseComputerMove } from '../shared/js/logic/tictactoe.js';
import {
  emptyProgress, normalize, recordAnswer, recordRound, recordStar, clearRecent,
  evaluate, percent, topErrors, totalStars, RECENT_MAX
} from '../shared/js/logic/progress-model.js';

const REPEATS = 300;
const LEVEL_IDS = ['easy', 'hard', 'veryHard'];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function randomGame(oFirst) {
  const board = Array(9).fill('');
  let turn = oFirst ? 'O' : 'X';
  for (;;) {
    const end = result(board);
    if (end) return end.winner || 'draw';
    const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const pick = turn === 'O'
      ? bestMinimaxMove(board.slice())
      : free[Math.floor(Math.random() * free.length)];
    board[pick] = turn;
    turn = turn === 'X' ? 'O' : 'X';
  }
}

// data — содержимое JSON-файлов: rounds, memory, skolko, uzor, posledovatelnost.
export function runSuite({ rounds, memory, skolko, uzor, posledovatelnost, cleanForTTS = null }) {
  const tests = [];
  const test = (group, name, fn) => tests.push({ group, name, fn });

  test('Карточки', 'у каждой карточки есть label и emoji, emoji уникальны', () => {
    const emojis = new Set();
    for (const c of POOL_LIST) {
      assert(c.label && c.emoji, `пустые поля у ${c.id}`);
      assert(!emojis.has(c.emoji), `повтор emoji ${c.emoji}`);
      emojis.add(c.emoji);
    }
  });

  if (cleanForTTS) {
    test('Голос', 'cleanForTTS убирает эмодзи и тире', () => {
      const out = cleanForTTS('Верно! 🍎 Яблоко — фрукт');
      assert(!/[🍎—]/u.test(out), `осталось: ${out}`);
      assert(out.includes('Яблоко'), 'потерян текст');
    });
  }

  // ---- Третий лишний
  test('Третий лишний', 'во всех уровнях есть раунды', () => {
    LEVEL_IDS.forEach((lv) => assert(Array.isArray(rounds[lv]) && rounds[lv].length > 0, `пустой уровень ${lv}`));
  });
  test('Третий лишний', 'все раунды проходят validateRound', () => {
    const bad = [];
    LEVEL_IDS.forEach((lv) => rounds[lv].forEach((r, i) => {
      const errs = validateRound(r, POOL);
      if (errs.length) bad.push(`${lv}[${i}]: ${errs.join('; ')}`);
    }));
    assert(bad.length === 0, bad.join(' | '));
  });
  test('Третий лишний', 'в каждой тройке ровно один правильный id', () => {
    LEVEL_IDS.forEach((lv) => rounds[lv].forEach((r, i) => {
      const b = buildRound(r);
      assert(b.ids.length === 3, `${lv}[${i}]: не 3 карточки`);
      assert(new Set(b.ids).size === 3, `${lv}[${i}]: повтор id`);
      assert(b.ids.filter((id) => id === b.oddId).length === 1, `${lv}[${i}]: odd не один`);
    }));
  });
  test('Третий лишний', 'за 20 повторов правильный ответ не закреплён за одной позицией', () => {
    LEVEL_IDS.forEach((lv) => rounds[lv].forEach((r, i) => {
      const positions = new Set();
      for (let k = 0; k < 20; k++) {
        const b = buildRound(r);
        positions.add(b.ids.indexOf(b.oddId));
      }
      assert(positions.size > 1, `${lv}[${i}]: позиция всегда одна`);
    }));
  });
  test('Третий лишний', 'explain непустой', () => {
    LEVEL_IDS.forEach((lv) => rounds[lv].forEach((r, i) => assert(r.explain.trim().length > 0, `${lv}[${i}]`)));
  });
  test('Третий лишний', 'неоднозначные раунды про форму используют явно некруглый предмет', () => {
    const cases = [
      { pair: ['moon', 'plate'], odd: 'shoe' },
      { pair: ['egg', 'grape'], odd: 'shoe' }
    ];
    cases.forEach(({ pair, odd }) => {
      const round = rounds.veryHard.find((item) =>
        item.cards.length === pair.length && pair.every((id) => item.cards.includes(id))
      );
      assert(round && round.odd === odd, `для пары ${pair.join(' + ')} ожидается ${odd}`);
    });
  });
  test('Третий лишний', 'validateRound находит ошибки', () => {
    assert(validateRound({ cards: ['apple', 'nope'], odd: 'bus', explain: 'x' }, POOL).length > 0, 'неизвестный id');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'apple', explain: 'x' }, POOL).length > 0, 'odd среди cards');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'bus', explain: '  ' }, POOL).length > 0, 'пустой explain');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'bus', explain: 'ок' }, POOL).length === 0, 'валидный раунд отклонён');
  });

  // ---- Что пропало?
  Object.entries(memory['chto-propalo']).forEach(([lv, cfg]) => {
    test('Что пропало?', `уровень ${lv}: инварианты за ${REPEATS} раундов`, () => {
      for (let k = 0; k < REPEATS; k++) {
        const r = makeMissing(POOL_LIST, cfg);
        assert(r, 'раунд не создан');
        const sIds = r.S.map((c) => c.id);
        assert(new Set(sIds).size === cfg.N && r.S.length === cfg.N, 'S: повторы или не N');
        assert(sIds.includes(r.answer.id), 'answer ∉ S');
        const optIds = r.options.map((c) => c.id);
        assert(optIds.filter((id) => id === r.answer.id).length === 1, 'answer не ровно один раз в options');
        assert(optIds.every((id) => id === r.answer.id || !sIds.includes(id)), 'в options есть другая карта из S');
        assert(new Set(optIds).size === optIds.length, 'options: повторы');
        assert(r.options.length === cfg.M, 'options.length !== M');
        if (!cfg.shuffle) {
          assert(r.displayIds.filter((id) => id === null).length === 1, 'не ровно один null');
          assert(r.displayIds.length === cfg.N, 'displayIds.length !== N');
        } else {
          assert(!r.displayIds.includes(null) && r.displayIds.length === cfg.N - 1, 'shuffle: неверный displayIds');
          assert(!r.displayIds.includes(r.answer.id), 'shuffle: answer виден');
        }
      }
    });
  });

  // ---- Что появилось?
  Object.entries(memory['chto-poyavilos']).forEach(([lv, cfg]) => {
    test('Что появилось?', `уровень ${lv}: инварианты за ${REPEATS} раундов`, () => {
      for (let k = 0; k < REPEATS; k++) {
        const r = makeAppeared(POOL_LIST, cfg);
        assert(r, 'раунд не создан');
        const sIds = r.S.map((c) => c.id);
        const finalIds = r.finalItems.map((c) => c.id);
        assert(!sIds.includes(r.newItem.id) && POOL[r.newItem.id], 'newId ∉ pool \\ S');
        assert(finalIds.length === cfg.N + 1, 'finalItems.length !== N + 1');
        assert(sIds.every((id) => finalIds.includes(id)), 'S ⊄ finalItems');
        assert(finalIds.filter((id) => !sIds.includes(id)).length === 1, 'новых id не один');
        assert(new Set(finalIds).size === finalIds.length, 'повторы в finalItems');
        if (!cfg.shuffle) {
          assert(cfg.memCols === cfg.finCols, 'геометрия поля меняется между фазами');
          assert(sIds.every((id, index) => finalIds[index] === id), 'позиции старых карточек изменились');
          assert(finalIds[cfg.N] === r.newItem.id, 'новая карточка должна занимать последнюю ячейку');
        }
      }
    });
  });

  // ---- Котик и щенок
  test('Котик и щенок', 'result() находит победителя на всех 8 линиях', () => {
    LINES.forEach((line) => ['X', 'O'].forEach((p) => {
      const b = Array(9).fill('');
      line.forEach((i) => { b[i] = p; });
      const r = result(b);
      assert(r && r.winner === p && r.line.join() === line.join(), `линия ${line} для ${p}`);
    }));
  });
  test('Котик и щенок', 'result() различает ничью и незаконченную партию', () => {
    assert(result(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']).draw === true, 'ничья не найдена');
    assert(result(Array(9).fill('')) === null, 'пустое поле');
  });
  test('Котик и щенок', `bestMinimaxMove никогда не проигрывает (${REPEATS} партий, щенок ходит вторым)`, () => {
    for (let k = 0; k < REPEATS; k++) assert(randomGame(false) !== 'X', 'котик выиграл у минимакса');
  });
  test('Котик и щенок', `bestMinimaxMove никогда не проигрывает (${REPEATS} партий, щенок ходит первым)`, () => {
    for (let k = 0; k < REPEATS; k++) assert(randomGame(true) !== 'X', 'котик выиграл у минимакса');
  });
  test('Котик и щенок', 'chooseComputerMove всегда возвращает свободную клетку', () => {
    LEVEL_IDS.forEach((lv) => {
      for (let k = 0; k < 100; k++) {
        const b = Array(9).fill('').map(() => (Math.random() < 0.3 ? 'X' : ''));
        b[4] = 'X';
        if (!b.some((v) => !v) || result(b)) continue;
        const pick = chooseComputerMove(b, memory['tic-tac-toe'][lv]);
        assert(Number.isInteger(pick) && !b[pick], `${lv}: занятая клетка ${pick}`);
      }
    });
  });
  test('Котик и щенок', 'простой уровень выигрывает в один ход и блокирует', () => {
    const cfg = memory['tic-tac-toe'].easy;
    assert(chooseComputerMove(['O', 'O', '', 'X', 'X', '', '', '', ''], cfg) === 2, 'не выиграл');
    assert(chooseComputerMove(['X', 'X', '', '', 'O', '', '', '', ''], cfg) === 2, 'не заблокировал');
  });
  test('Котик и щенок', 'компьютер не выбирает ход на заполненном поле', () => {
    const fullDraw = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    const cfg = memory['tic-tac-toe'].easy;
    assert(chooseComputerMove(fullDraw, cfg) === null, 'easy вернул ход на заполненном поле');
    assert(chooseComputerMove(fullDraw, memory['tic-tac-toe'].veryHard) === null, 'minimax вернул ход на заполненном поле');
    assert(bestMinimaxMove(fullDraw) === null, 'bestMinimaxMove вернул ход на заполненном поле');
  });

  // ---- Сколько?
  const countItems = skolko.items.map((id) => (POOL[id] ? { id, ...POOL[id] } : null));
  test('Сколько?', 'все предметы из skolko.json есть в POOL', () => {
    assert(countItems.every(Boolean), 'неизвестный id предмета');
  });
  Object.entries(skolko.levels).forEach(([lv, cfg]) => {
    test('Сколько?', `уровень ${lv}: инварианты за ${REPEATS} раундов`, () => {
      const modes = new Set();
      for (let k = 0; k < REPEATS; k++) {
        const r = makeCount(countItems, cfg);
        assert(r, 'раунд не создан');
        modes.add(r.mode);
        assert(r.count >= cfg.min && r.count <= cfg.max, 'count вне диапазона');
        assert(r.options.length === cfg.options, 'неверное число вариантов');
        assert(r.options.filter((n) => n === r.count).length === 1, 'верный вариант не ровно один раз');
        assert(new Set(r.options).size === r.options.length, 'варианты повторяются');
        assert(r.options.every((n) => n >= cfg.min && n <= cfg.max), 'вариант вне диапазона');
      }
      if (cfg.mode === 'mixed') assert(modes.size === 2, 'mixed не даёт оба режима');
    });
  });

  // ---- Продолжи узор
  Object.entries(uzor.levels).forEach(([lv, cfg]) => {
    test('Продолжи узор', `уровень ${lv}: конфигурация узоров корректна`, () => {
      cfg.patterns.forEach(({ p, shown }) => {
        assert(shown >= p.length, `${p}: shown меньше периода`);
        const letters = [...new Set(p)];
        assert(letters.every((l) => p.slice(0, shown).includes(l) || [...Array(shown)].some((_, i) => p[i % p.length] === l)), `${p}: не все символы показаны`);
      });
    });
    test('Продолжи узор', `уровень ${lv}: инварианты за ${REPEATS} раундов`, () => {
      for (let k = 0; k < REPEATS; k++) {
        const r = makePattern(POOL_LIST, cfg);
        assert(r, 'раунд не создан');
        const def = cfg.patterns.find((x) => x.p === r.pattern);
        assert(def && r.shown.length === def.shown, 'неверная длина узора');
        const letters = [...new Set(r.pattern)];
        const map = {};
        r.shown.forEach((card, i) => {
          const l = r.pattern[i % r.pattern.length];
          if (map[l]) assert(map[l] === card.id, 'символ узора не постоянен');
          else map[l] = card.id;
        });
        assert(new Set(Object.values(map)).size === letters.length, 'разные буквы получили одну картинку');
        assert(r.answer.id === map[r.pattern[def.shown % r.pattern.length]], 'неверный ответ');
        const ids = r.options.map((c) => c.id);
        assert(ids.filter((id) => id === r.answer.id).length === 1, 'ответ не ровно один раз');
        assert(new Set(ids).size === ids.length && ids.length === cfg.options, 'варианты некорректны');
      }
    });
  });

  // ---- Что сначала, что потом?
  test('Что сначала, что потом?', 'все последовательности проходят validateSequence', () => {
    const bad = posledovatelnost.sequences.map((s) => validateSequence(s).join('; ')).filter(Boolean);
    assert(bad.length === 0, bad.join(' | '));
  });
  test('Что сначала, что потом?', 'все шаги используют локальные SVG-иллюстрации', () => {
    posledovatelnost.sequences.forEach((seq) => seq.steps.forEach((step) => {
      assert(step.image.startsWith('../shared/img/sequences/') && step.image.endsWith('.svg'), `${seq.title}: неверный путь ${step.image}`);
      assert(step.label.trim(), `${seq.title}: пустая подпись`);
    }));
  });
  test('Что сначала, что потом?', 'создание раунда завершается, даже если shuffle возвращает исходный порядок', () => {
    const originalRandom = Math.random;
    try {
      Math.random = () => 0;
      const r = makeSequence([{ title: 'Тест', steps: [
        { label: 'а', image: '../shared/img/sequences/a.svg' },
        { label: 'б', image: '../shared/img/sequences/b.svg' },
        { label: 'в', image: '../shared/img/sequences/c.svg' }
      ] }], { steps: 3 });
      assert(r && r.order.some((step, i) => step !== r.steps[i]), 'порядок не перемешан');
    } finally {
      Math.random = originalRandom;
    }
  });
  test('Что сначала, что потом?', 'validateSequence находит ошибки', () => {
    assert(validateSequence({ title: '', steps: [] }).length > 0, 'пустая');
    assert(validateSequence({ title: 'x', steps: [{ image: '../shared/img/sequences/a.svg', label: 'a' }, { image: '../shared/img/sequences/a.svg', label: 'b' }] }).length > 0, 'повтор image');
    assert(validateSequence({ title: 'x', steps: [{ image: 'https://example.com/a.svg', label: 'a' }, { image: '../shared/img/sequences/b.svg', label: 'b' }] }).length > 0, 'внешний URL');
  });
  Object.entries(posledovatelnost.levels).forEach(([lv, cfg]) => {
    test('Что сначала, что потом?', `уровень ${lv}: инварианты за ${REPEATS} раундов`, () => {
      for (let k = 0; k < REPEATS; k++) {
        const r = makeSequence(posledovatelnost.sequences, cfg);
        assert(r, 'раунд не создан');
        assert(r.steps.length === cfg.steps && r.order.length === cfg.steps, 'неверное число шагов');
        assert(r.order.every((s) => r.steps.includes(s)) && new Set(r.order).size === cfg.steps, 'order не перестановка');
        assert(r.order.some((s, i) => s !== r.steps[i]), 'порядок совпал с правильным');
        const seq = posledovatelnost.sequences.find((s) => s.title === r.title);
        const start = seq.steps.indexOf(r.steps[0]);
        assert(r.steps.every((s, i) => seq.steps[start + i] === s), 'шаги не подряд из оригинала');
      }
    });
  });

  // ---- Фаза 4: прогресс и адаптивная сложность
  test('Адаптивная сложность', 'три верных подряд предлагают следующий уровень', () => {
    assert(evaluate([0, 1, 1, 1], 0, 3) === 'up', 'нет up');
    assert(evaluate([1, 1], 0, 3) === null, 'рано');
    assert(evaluate([1, 1, 1], 2, 3) === null, 'выше последнего уровня');
  });
  test('Адаптивная сложность', 'две ошибки подряд предлагают предыдущий уровень', () => {
    assert(evaluate([1, 0, 0], 1, 3) === 'down', 'нет down');
    assert(evaluate([0, 1, 0], 1, 3) === null, 'ошибки не подряд');
    assert(evaluate([0, 0], 0, 3) === null, 'ниже первого уровня');
  });
  test('Адаптивная сложность', 'хранится не больше пяти последних ответов на игру', () => {
    const s = emptyProgress();
    for (let i = 0; i < 12; i++) recordAnswer(s, 'g', i % 2 === 0, 'x', '2026-10-01', 'Игра');
    assert(s.recent.g.length === RECENT_MAX, `длина ${s.recent.g.length}`);
    clearRecent(s, 'g');
    assert(s.recent.g.length === 0, 'не очистилось');
  });
  test('Прогресс', 'счётчики по дням, проценты, раунды и наклейки', () => {
    const s = emptyProgress();
    recordAnswer(s, 'a', true, null, '2026-10-01', 'A');
    recordAnswer(s, 'a', false, 'ошибка 1', '2026-10-01', 'A');
    recordAnswer(s, 'a', false, 'ошибка 1', '2026-10-02', 'A');
    recordAnswer(s, 'a', true, null, '2026-10-02', 'A');
    recordRound(s, 'a', '2026-10-02', 'A');
    recordStar(s, '2026-10-02', '🦄');
    assert(percent(s, 'a') === 50, 'процент');
    assert(percent(s, 'zzz') === null, 'нет данных');
    assert(s.days['2026-10-02'].rounds === 1 && s.days['2026-10-02'].stars === 1, 'счётчики дня');
    assert(totalStars(s) === 1 && s.stickers.length === 1, 'наклейки');
  });
  test('Прогресс', 'ошибки с именами свойств прототипа считаются корректно', () => {
    const s = emptyProgress();
    recordAnswer(s, 'a', false, 'constructor', '2026-10-01', 'A');
    recordAnswer(s, 'a', false, 'toString', '2026-10-01', 'A');
    const errors = topErrors(s, 3);
    assert(errors.length === 2, `ожидалось 2 ошибки, получено ${errors.length}`);
    assert(errors.every((item) => item.count === 1), 'счётчик ошибки искажён прототипом');
  });
  test('Прогресс', 'топ-3 ошибок отсортирован по частоте', () => {
    const s = emptyProgress();
    [['a', 'один', 1], ['a', 'два', 3], ['b', 'три', 2], ['b', 'четыре', 5]].forEach(([g, label, n]) => {
      for (let i = 0; i < n; i++) recordAnswer(s, g, false, label, '2026-10-01', g);
    });
    const top = topErrors(s, 3).map((e) => e.label);
    assert(top.join() === 'четыре,два,три', top.join());
  });
  test('Прогресс', 'normalize переживает испорченные данные', () => {
    [null, 'строка', 42, [], { days: 5, games: 'x', recent: [], stickers: 'y' },
      { days: { bad: { rounds: -5 } }, games: { 'Плохой Ключ': {} }, stickers: [{ d: 'x', e: 1 }] },
      JSON.parse('{"games":{"__proto__":{"answers":1}},"days":{"2026-10-01":{"rounds":"много"}}}')
    ].forEach((raw) => {
      const s = normalize(raw);
      assert(s.adaptive === true && typeof s.days === 'object' && Array.isArray(s.stickers), 'структура нарушена');
      assert(Object.values(s.days).every((d) => Number.isInteger(d.rounds) && d.rounds >= 0), 'мусор в days');
    });
  });
  test('Прогресс', 'normalize отклоняет календарно невозможные даты', () => {
    const s = normalize({
      days: {
        '2026-02-31': { rounds: 7 },
        '2024-02-29': { rounds: 2 },
        '2025-02-29': { rounds: 9 }
      },
      stickers: [
        { d: '2026-13-01', e: '⭐' },
        { d: '2024-02-29', e: '🌈' }
      ]
    });
    assert(JSON.stringify(Object.keys(s.days)) === JSON.stringify(['2024-02-29']), 'некорректные дни должны отбрасываться');
    assert(JSON.stringify(s.stickers) === JSON.stringify([{ d: '2024-02-29', e: '🌈' }]), 'наклейка с невозможной датой должна отбрасываться');
  });

  return tests.map(({ group, name, fn }) => {
    try {
      fn();
      return { group, name, ok: true };
    } catch (e) {
      return { group, name, ok: false, message: e.message };
    }
  });
}
