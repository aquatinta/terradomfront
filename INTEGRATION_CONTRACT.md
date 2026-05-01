# Контракт интеграции: Прототип ↔ Бэкенд

## Итоги анализа репозиториев

Бэкенд (`aquatinta/terradom`) — **Elixir / Phoenix**, полностью готов.
Фронтенд-кабинет (`aquatinta/terradomfront`) — **React + Vite**, уже содержит `api.ts`, `AuthContext`, хуки и Vite-прокси на `localhost:4000`.

Прототип (`terradom-prototype`) — **React + Vite**, текущий статус: все экраны работают на моковых данных.

---

## Что нужно сделать в прототипе

### 1. Добавить Vite-прокси (dev mode → localhost:4000)

В `vite.config.ts` прототипа добавить:
```ts
server: {
  proxy: {
    "/api": { target: "http://localhost:4000", changeOrigin: true }
  }
}
```

### 2. Скопировать из `terradomfront` готовые утилиты

| Файл | Откуда | Назначение |
|------|--------|------------|
| `lib/api.ts` | terradomfront | Axios-клиент с JWT + refresh |
| `lib/api.types.ts` | terradomfront | TypeScript-типы всех сущностей |
| `lib/token.ts` | terradomfront | Хранение access/refresh токенов |
| `contexts/AuthContext.tsx` | terradomfront | Провайдер аутентификации |

### 3. AuthScreen — реальный логин

**Текущее поведение:** при вводе 6 цифр → `navigate("projects")` (мок).

**Новое поведение:**
1. `POST /api/auth/login` → `{ phone, password }` (пока без OTP — пароль = телефон без `+`)
2. Сохранить `accessToken` (память) + `refreshToken` (localStorage)
3. Сохранить `user` в контекст
4. `navigate("projects")`

> **Примечание по OTP:** Бэкенд использует `phone + password`. OTP-интеграция (SMS) будет добавлена позже. Пока в прототипе: поле "OTP" = пароль пользователя.

### 4. ProjectsScreen — реальные данные

**GET /api/projects** → список проектов пользователя.

Маппинг ответа:
```
project.id          → p.id
project.name        → p.name
project.status      → p.status (draft | assembled | calculated | request_sent | ...)
project.geometry    → floor plan data
project.estimate    → смета
project.sync_version → для optimistic lock
project.updated_at  → дата изменения
```

**POST /api/projects** → создать новый проект (кнопка «Новый проект»).

### 5. CalcScreen — синхронизация сметы

После расчёта сметы:
- `PUT /api/projects/:id/estimate` → `{ estimate: { lineItems, total, totalMat, totalLabor }, syncVersion }`
- При успехе: обновить `syncVersion` в локальном стейте

### 6. Editor2DScreen — синхронизация геометрии

После изменения геометрии:
- `PUT /api/projects/:id/geometry` → `{ geometry: { walls, floors, ... }, syncVersion }`

### 7. CalcScreen — публикация на маркетплейс

Кнопка «Опубликовать на маркетплейс»:
- `POST /api/projects/:id/submit` → `{ syncVersion }`
- Статус проекта меняется: `draft` → `request_sent`
- Проект становится виден подрядчикам в тендерном фиде

### 8. MarketScreen — реальные подрядчики (тендерный фид)

**Для роли `partner`:** `GET /api/tenders?region=MSK&technology=aerated_concrete`

Маппинг тендера → карточка подрядчика (инверсия: подрядчик видит проекты заказчиков):
```
tender.id           → id
tender.project.name → название проекта
tender.budget_min/max → диапазон бюджета
tender.region       → регион
tender.technology   → специализация
tender.customer     → заказчик
```

**Для роли `customer`:** `GET /api/offers` → список предложений от подрядчиков по своим проектам.

### 9. DealsScreen — реальные сделки

**GET /api/deals** → список сделок пользователя.

Маппинг:
```
deal.id             → id
deal.status         → статус (active | completed | disputed)
deal.offer.total_price → сумма
deal.milestones     → этапы с суммами и статусами
```

### 10. ProfileScreen — реальный профиль

**GET /api/user/me** → данные пользователя.
**PATCH /api/user/me** → обновление профиля.

---

## Бизнес-логика появления проекта у подрядчиков

```
Заказчик создаёт проект (status: draft)
    ↓
Рисует план в 2D-редакторе
    ↓ PUT /api/projects/:id/geometry
Рассчитывает смету
    ↓ PUT /api/projects/:id/estimate
Нажимает «Опубликовать на маркетплейс»
    ↓ POST /api/projects/:id/submit
Проект переходит в status: request_sent
    ↓
Подрядчик видит тендер в GET /api/tenders
(фильтрация по region и technology из профиля партнёра)
    ↓
Подрядчик отправляет предложение
    ↓ POST /api/offers { projectId, totalPrice, comment }
Заказчик видит предложение в GET /api/offers
    ↓
Заказчик принимает предложение
    ↓ POST /api/offers/:id/accept
Атомарно создаётся сделка (Deal)
Все остальные офферы отклоняются
    ↓
Сделка появляется в GET /api/deals у обоих участников
```

---

## Синхронизация (Offline-First)

Для полной синхронизации использовать:
```
GET /api/sync?since=<ISO8601>
```

Ответ содержит все изменённые сущности: `projects`, `offers`, `deals`, `milestones`.
Хранить `serverTime` из ответа как следующий `since`.

---

## Контекст авторизации

Прототип должен иметь глобальный `AuthContext` (скопировать из `terradomfront`):
- `user: User | null`
- `isAuthenticated: boolean`
- `login(phone, password) → Promise<void>`
- `logout() → Promise<void>`
- `role: "customer" | "partner" | "supplier" | "admin"`

MarketScreen и DealsScreen рендерят разный контент в зависимости от роли.
