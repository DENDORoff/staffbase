# StaffBase — система учёта сотрудников компании

Внутренняя корпоративная система ТОО «DeWorld StaffBase» (г. Павлодар): карточки сотрудников, справочники отделов и должностей, заявки на отпуска и больничные, дашборд и обмен данными в CSV.

Курсовая работа по дисциплине «Разработка программного обеспечения», ВКЭиК, группа ПО-314, студент Колот Д. Д., руководитель Соколова Е. В., Павлодар, 2026.

**Демо:** https://staffbase.deworld.su
**Репозиторий:** https://github.com/DENDORoff/staffbase

## Технологии

- **Next.js 16** (App Router, SSR) + **React 19** + **TypeScript**
- **Tailwind CSS 4**, собственные шрифты PT Sans / PT Serif (раздаются с сервера, OFL)
- **PostgreSQL 17** на **Neon** (serverless, регион `aws-eu-central-1`), клиент `@neondatabase/serverless`
- Развёртывание: **Vercel**
- Без ORM: запросы напрямую, **только параметризованные** (никакой склейки SQL)
- Авторизация: собственная, пароли — **scrypt + индивидуальная соль**, сессии — httpOnly cookie, в БД хранится SHA-256 токена; CSRF-токен в каждой сессии; лимит попыток входа (5 ошибок → блокировка на 15 минут)

## Требования

- Node.js ≥ 20 (разработка велась на v26)
- Доступ к Neon-проекту `staffbase` (или собственная строка подключения PostgreSQL)

## Быстрый старт

```bash
npm install
copy .env.example .env.local   # и вставить реальные DATABASE_URL и SESSION_SECRET
node scripts/seed.mjs          # пересоздаёт схему и заливает учебные данные
npm run dev                    # http://localhost:3000
```

Продакшн-запуск:

```bash
npm run build
npm start
```

## Учебные учётные записи

| Почта | Пароль | Роль |
|---|---|---|
| `hr@staffbase.kz` | `StaffBase2026` | Администратор (HR) |
| `manager@staffbase.kz` | `StaffBase2026` | Руководитель |
| `employee@staffbase.kz` | `StaffBase2026` | Сотрудник |

Первым делом смените пароли в разделе «Настройки».

## Структура проекта

```
app/                    страницы (App Router)
  (app)/                закрытая часть: dashboard, employees, departments, positions, leaves, settings, admin
  legal/                юридические страницы (конфиденциальность, условия, cookie, согласие, удаление данных, реквизиты)
  api/                  route handlers (мутации: формы POST → 303-редирект)
components/             переиспользуемые компоненты (AppNav, EmployeeForm, CookieBanner, Icon…)
lib/                    db, auth, guard (CSRF/роли), validation, i18n (RU/EN/KZ), csv, format
scripts/schema.sql      схема БД (таблицы, ключи, индексы)
scripts/seed.mjs        учебные данные (40 сотрудников, 5 отделов, 10 должностей)
```

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения Neon (pooler, `sslmode=require`) |
| `SESSION_SECRET` | резервный секрет приложения |

Файлы `.env*` в git не коммитятся (см. `.gitignore`).

## Проверка работоспособности

1. Войти под `employee@staffbase.kz` → открыть «Сотрудники», найти себя по фамилии.
2. Под `manager@staffbase.kz` согласовать заявку на странице «Отпуска и больничные».
3. Под `hr@staffbase.kz`: добавить сотрудника, выгрузить CSV, импортировать его обратно.
4. Пустой ввод в форму «Новый сотрудник» → сообщение об ошибке у поля, запись не создаётся.
