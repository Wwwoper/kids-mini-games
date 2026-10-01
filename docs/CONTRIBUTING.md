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

## Добавить карточку

Допишите запись в `shared/js/content/cards.js`. См. `docs/CONTENT.md`.

## Добавить раунд «Третий лишний»

Добавьте объект в `shared/content/rounds-tretiy.json`. См. `docs/CONTENT.md`.

## Добавить новую игру

1. Логика генератора раундов — чистые функции в `shared/js/logic/<name>.js` (без DOM, чтобы их можно было тестировать).
2. Настройки уровней — в JSON в `shared/content/`.
3. Страница `games/<name>.html`: подключите `base.css`, `layout.css`, `cards.css`, вставьте стандартную шапку (`.nav`, `#toggles`, `#level`, `#levelHint`, `#status`) и вызовите `mountToggles`, `mountLevelSwitch`, `registerServiceWorker`. Образец — `games/chto-poyavilos.html`.
4. Запись в меню — ссылка в `index.html`.
5. Файлы в `service-worker.js` (`ASSETS`) и увеличение `VERSION`.
6. Проверки инвариантов в `tests/suite.js`.

## Релиз

```bash
git add .
git commit -m "feat: add new round to Tretiy Lishniy"
git push
```

GitHub Pages обновится за 30–60 секунд. Перед релизом увеличьте `VERSION` в `service-worker.js`, иначе у пользователей останется старый кэш, и обновите `CHANGELOG.md`.
