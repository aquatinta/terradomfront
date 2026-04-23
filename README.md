# Террадом — Фронтенд

React 19 + Vite + TailwindCSS 4 лендинг и веб-кабинеты платформы «Террадом».

## Быстрый старт

```bash
# 1. Установить зависимости (обязательно после git clone!)
pnpm install

# 2. Запустить dev-сервер
pnpm dev
```

Фронтенд будет доступен на `http://localhost:3000`.

---

## Подключение к бэкенду (Elixir/Phoenix)

В режиме разработки все запросы `/api/*` автоматически проксируются на
`http://localhost:4000` через Vite proxy — **CORS настраивать не нужно**.

### Шаг 1 — Запустить бэкенд

```bash
# В директории terradom-backend
mix deps.get
mix ecto.setup   # только первый раз
mix phx.server
```

Бэкенд должен быть доступен на `http://localhost:4000`.

### Шаг 2 — Запустить фронтенд

```bash
# В директории terradomfront
pnpm install     # обязательно после git clone
pnpm dev
```

Теперь `http://localhost:3000/api/...` → `http://localhost:4000/api/...` автоматически.

---

## Диагностика: фронтенд не видит бэкенд

Если API-запросы падают с ошибкой (net::ERR_CONNECTION_REFUSED, 502, 404), проверьте по порядку:

### 1. Бэкенд запущен?

```bash
curl http://localhost:4000/api/openapi
# Должен вернуть JSON со схемой OpenAPI
```

Если `Connection refused` — бэкенд не запущен. Запустите `mix phx.server`.

### 2. Зависимости установлены?

```bash
# В директории terradomfront
ls node_modules/  # должна быть непустой
# Если пустая или отсутствует:
pnpm install
```

### 3. VITE_API_URL не задан случайно?

```bash
# Проверьте наличие .env.local в корне terradomfront/
cat .env.local 2>/dev/null || echo "файл отсутствует (это нормально)"
```

Если файл существует и содержит `VITE_API_URL=...` — Vite proxy **не используется**.
Убедитесь, что указанный URL доступен и бэкенд разрешает CORS с `http://localhost:3000`.

### 4. Порт 4000 не занят другим процессом?

```bash
lsof -i :4000   # macOS/Linux
netstat -ano | findstr :4000  # Windows
```

### 5. Перезапустите Vite после изменений конфига

```bash
# Ctrl+C → pnpm dev
```

---

## Бэкенд на другом порту?

Создайте файл `.env.local` в корне проекта `terradomfront/`:

```env
VITE_API_URL=http://localhost:4001
```

> **Важно:** при задании `VITE_API_URL` Vite proxy **не используется** —
> axios обращается напрямую к указанному URL. В этом случае убедитесь,
> что в `config/dev.exs` бэкенда добавлен ваш origin в `cors_allowed_origins`.

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_URL` | URL Elixir бэкенда | не задана → Vite proxy → `localhost:4000` |

Файл `.env.local` **не коммитится** в git (добавлен в `.gitignore`).

---

## Production (Manus Hosting)

Задайте `VITE_API_URL` в настройках деплоя (Settings → Secrets):

```
VITE_API_URL=https://api.terradom.ru
```

---

## Структура проекта

```
client/
  src/
    pages/          ← Home, LoginPage, RegisterPage, CustomerDashboard, PartnerDashboard
    components/     ← Navbar, HeroSection, PartnerRegistrationModal, ProtectedRoute...
    contexts/       ← AuthContext, PartnerModalContext
    hooks/          ← useProjects, useDeals, useTenders, usePartnerDeals, useNotifications
    lib/
      api.ts        ← axios-клиент с interceptors и автообновлением токенов
      api.types.ts  ← TypeScript-типы всех API-ответов
      token.ts      ← Хранение JWT (access — память, refresh — localStorage)
```

## Команды

```bash
pnpm dev        # Dev-сервер с HMR на :3000
pnpm build      # Production сборка
pnpm check      # TypeScript проверка
pnpm format     # Prettier форматирование
```

---

## Как работает dev proxy

```
Browser → localhost:3000/api/auth/login
            ↓ Vite proxy (vite.config.ts)
         localhost:4000/api/auth/login  ← Elixir Phoenix
```

`baseURL` в `api.ts` = `"/api"` (без хоста).
Axios формирует относительные URL → браузер отправляет на `localhost:3000` → Vite проксирует на `localhost:4000`.
CORS не нужен, т.к. для браузера запрос идёт на тот же origin.
