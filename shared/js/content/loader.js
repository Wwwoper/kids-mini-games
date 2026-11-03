export async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}: ${response.status}`);
  return response.json();
}

// Возвращает список ошибок. Пустой список — раунд корректен.
export function validateRound(round, pool) {
  const errors = [];
  const hasCard = (id) => typeof id === 'string'
    && pool != null
    && Object.prototype.hasOwnProperty.call(pool, id);
  if (!round || typeof round !== 'object') return ['раунд не объект'];
  const { cards, odd, explain } = round;
  if (!Array.isArray(cards) || cards.length !== 2) {
    errors.push('cards: нужно ровно 2 id');
  } else {
    cards.forEach((id) => { if (!hasCard(id)) errors.push(`cards: неизвестный id «${id}»`); });
    if (cards[0] === cards[1]) errors.push('cards: id повторяются');
  }
  if (!hasCard(odd)) {
    errors.push(`odd: неизвестный id «${odd}»`);
  } else if (Array.isArray(cards) && cards.includes(odd)) {
    errors.push('odd: лишняя карточка совпадает с одной из пары');
  }
  if (typeof explain !== 'string' || explain.trim() === '') errors.push('explain: пустое объяснение');
  return errors;
}
