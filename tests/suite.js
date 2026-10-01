import { POOL, POOL_LIST } from '../shared/js/content/cards.js';
import { validateRound } from '../shared/js/content/loader.js';
import { buildRound } from '../shared/js/logic/tretiy.js';
import { makeRound as makeMissing } from '../shared/js/logic/missing.js';
import { makeRound as makeAppeared } from '../shared/js/logic/appeared.js';
import { LINES, result, bestMinimaxMove, chooseComputerMove } from '../shared/js/logic/tictactoe.js';

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

// rounds — содержимое rounds-tretiy.json, memory — содержимое levels-memory.json.
export function runSuite({ rounds, memory, cleanForTTS = null }) {
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
  test('Третий лишний', 'validateRound находит ошибки', () => {
    assert(validateRound({ cards: ['apple', 'nope'], odd: 'bus', explain: 'x' }, POOL).length > 0, 'неизвестный id');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'apple', explain: 'x' }, POOL).length > 0, 'odd среди cards');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'bus', explain: '  ' }, POOL).length > 0, 'пустой explain');
    assert(validateRound({ cards: ['apple', 'pear'], odd: 'bus', explain: 'ок' }, POOL).length === 0, 'валидный раунд отклонён');
  });

  // ---- Что пропало?
  const missingLevels = memory['chto-propalo'];
  Object.entries(missingLevels).forEach(([lv, cfg]) => {
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
  const appearedLevels = memory['chto-poyavilos'];
  Object.entries(appearedLevels).forEach(([lv, cfg]) => {
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
          assert(finalIds.filter((id) => id !== r.newItem.id).join() === sIds.join(), 'старый порядок нарушен');
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
    ['easy', 'hard', 'veryHard'].forEach((lv) => {
      for (let k = 0; k < 100; k++) {
        const b = Array(9).fill('').map(() => (Math.random() < 0.3 ? 'X' : ''));
        b[4] = 'X';
        const free = b.some((v) => !v);
        if (!free || result(b)) continue;
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

  const results = tests.map(({ group, name, fn }) => {
    try {
      fn();
      return { group, name, ok: true };
    } catch (e) {
      return { group, name, ok: false, message: e.message };
    }
  });
  return results;
}
