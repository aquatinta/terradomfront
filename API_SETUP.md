# Настройка API URL — Террадом

## Стратегия dev/prod

| Режим | Как работает | Что делать |
|-------|-------------|------------|
| **DEV** (локально) | `VITE_API_URL` **не задан** → Vite proxy перенаправляет `/api/*` → `localhost:4000` | Запустить Elixir backend: `mix phx.server` |
| **PROD** (деплой) | `VITE_API_URL` задан → axios идёт напрямую на бэкенд | Задать `VITE_API_URL` в Settings → Secrets |

## Локальная разработка

Elixir backend по умолчанию слушает порт `4000`. Просто запустите оба сервера:

```bash
# Терминал 1 — Elixir backend
cd terradom-backend
mix phx.server

# Терминал 2 — React frontend
cd terradomfront
pnpm dev
```

Vite автоматически проксирует все запросы `/api/*` на `http://localhost:4000`.
CORS настраивать не нужно — запросы идут с одного origin.

## Production (Manus Hosting)

1. Откройте **Settings → Secrets** в Management UI
2. Добавьте переменную:
   ```
   VITE_API_URL = https://api.terradom.ru
   ```
3. Нажмите **Publish** — фронтенд пересоберётся с новым URL

> **Важно:** `VITE_API_URL` — это переменная времени сборки (build-time).
> После изменения нужно пересобрать и переопубликовать проект.

## Другой порт бэкенда

Если Elixir запущен не на `4000`, создайте `.env.local` в корне проекта:

```
VITE_API_URL=http://localhost:4001
```

В этом случае Vite proxy не используется — axios идёт напрямую на указанный URL.
