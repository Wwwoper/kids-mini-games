# Как внести изменения

## Запуск

ES-модули не работают через `file://`. Запустите сервер в корне проекта:

```bash
npx serve .
# или: python3 -m http.server 8000
```

## Стиль кода

Правила зафиксированы в `.editorconfig`: два пробела, одинарные кавычки в JS, двойные в HTML, точки с запятой, `camelCase` и `SCREAMING_SNAKE_CASE` для констант.

Запрещено: `eval`, `new Function`, `innerHTML` для данных, внешние сетевые запросы, глобальные переменные (кроме `window.__KMG_DEBUG__`). Доступ к `localStorage`, `speechSynthesis` и `AudioContext` — только через `storage.js`, `voice.js` и `sound.js`.

## Добавить карточку или раунд

Карточка — запись в `shared/js/content/cards.js`. Раунд «Третьего лишнего» — объект в `shared/content/rounds-tretiy.json`. Подробности в `docs/CONTENT.md`.

## Добавить новую игру

Образцы: `games/skolko.html`, `games/uzor.html`, `games/posledovatelnost.html`.

1. **JSON.** Создайте `shared/content/<имя>.json` с блоком `levels` (`easy`, `hard`, `veryHard`, у каждого `hint`).
2. **Логика.** Генератор раундов — чистые функции в `shared/js/logic/<имя>.js` без DOM, чтобы их можно было тестировать.
3. **HTML.** Скопируйте шапку любой игры из `games/`: подключите `base.css`, `layout.css`, `cards.css`, добавьте блоки `#toggles`, `#level`, `#levelHint`, `#status` и пустой `<div id="suggest"></div>`. Не копируйте общий код — импортируйте его из `shared/`.
4. **Статистика и награды.** Создайте `createGameProgress({ gameId, title, host })`. После верного ответа вызовите `progress.right()`, после ошибки — `progress.wrong('короткое описание ошибки')`, в `onChange` уровня — `progress.levelChanged()`, после создания переключателя — `progress.attach(levelSwitch)`. Адаптивная сложность, наклейки и экран взрослого заработают сами.
5. **Меню.** Добавьте ссылку `<a class="menu-item">` в `index.html`.
6. **Офлайн.** Добавьте новые файлы в `ASSETS` в `service-worker.js` и увеличьте `VERSION`.
7. **Тесты.** Добавьте проверки инвариантов в `tests/suite.js` и убедитесь, что `tests/generator.html` зелёный.

## Релиз

```bash
git add .
git commit -m "feat: add new round to Tretiy Lishniy"
git push
```

GitHub Pages обновится за 30–60 секунд. Перед релизом увеличьте `VERSION` в `service-worker.js`, иначе у пользователей останется старый кэш, и обновите `CHANGELOG.md`.
