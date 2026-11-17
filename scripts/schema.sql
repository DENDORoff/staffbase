-- StaffBase — схема базы данных (PostgreSQL 17, Neon)
-- Создаёт все таблицы, ограничения и индексы системы учёта сотрудников.

DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS data_deletion_requests CASCADE;

CREATE TABLE departments (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE positions (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL UNIQUE,
  salary_grade TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id               SERIAL PRIMARY KEY,
  personnel_number TEXT NOT NULL UNIQUE,
  last_name        TEXT NOT NULL,
  first_name       TEXT NOT NULL,
  middle_name      TEXT,
  position_id      INTEGER NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
  department_id    INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  hire_date        DATE NOT NULL,
  birth_date       DATE NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT,
  salary           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (salary >= 0),
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','vacation','sick_leave','terminated')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'employee'
                 CHECK (role IN ('admin','manager','employee')),
  employee_id    INTEGER UNIQUE REFERENCES employees(id) ON DELETE SET NULL,
  notify_email   BOOLEAN NOT NULL DEFAULT TRUE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE leaves (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('vacation','sick_leave')),
  starts_on   DATE NOT NULL,
  ends_on     DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','approved','rejected')),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on)
);

CREATE TABLE data_deletion_requests (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  reason     TEXT,
  status     TEXT NOT NULL DEFAULT 'new'
             CHECK (status IN ('new','processing','done','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_position   ON employees(position_id);
CREATE INDEX idx_employees_status     ON employees(status);
CREATE INDEX idx_employees_last_name  ON employees(last_name);
CREATE INDEX idx_leaves_employee      ON leaves(employee_id);
CREATE INDEX idx_leaves_status        ON leaves(status);
CREATE INDEX idx_sessions_expires     ON sessions(expires_at);
