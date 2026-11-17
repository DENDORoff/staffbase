import crypto from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

const SESSION_COOKIE = "sb_session";
const SESSION_TTL_HOURS = 8;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type Role = "admin" | "manager" | "employee";

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  employeeId: number | null;
  csrfToken: string;
}

/* ---------- Пароли: scrypt (node:crypto, без внешних зависимостей) ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const derived = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt$${N}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nStr, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = Number(nStr);
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = crypto.scryptSync(password, salt, expected.length, { N, r: 8, p: 1 });
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/* ---------- Сессии: в БД хранится SHA-256 токена, в cookie — сам токен ---------- */

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export interface LoginResult {
  ok: boolean;
  error?: "invalid" | "locked";
  lockMinutes?: number;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const normalized = email.trim().toLowerCase();
  const rows = await sql`
    SELECT id, password_hash, failed_attempts, locked_until
    FROM users WHERE email = ${normalized}`;
  if (rows.length === 0) return { ok: false, error: "invalid" };

  const user = rows[0] as {
    id: number;
    password_hash: string;
    failed_attempts: number;
    locked_until: string | null;
  };

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return { ok: false, error: "locked", lockMinutes: LOCK_MINUTES };
  }

  if (!verifyPassword(password, user.password_hash)) {
    const attempts = user.failed_attempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS;
    await sql`
      UPDATE users
      SET failed_attempts = ${attempts},
          locked_until = ${lock ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null}
      WHERE id = ${user.id}`;
    return { ok: false, error: lock ? "locked" : "invalid", lockMinutes: lock ? LOCK_MINUTES : undefined };
  }

  await sql`UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ${user.id}`;

  const token = crypto.randomBytes(32).toString("base64url");
  const csrf = crypto.randomBytes(16).toString("base64url");
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000);
  await sql`
    INSERT INTO sessions (user_id, token_hash, csrf_token, expires_at)
    VALUES (${user.id}, ${sha256(token)}, ${csrf}, ${expires.toISOString()})`;

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM sessions WHERE token_hash = ${sha256(token)}`;
  }
  jar.delete(SESSION_COOKIE);
}

/** Возвращает текущего пользователя по cookie или null. Побочным эффектом чистит протухшие сессии. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.employee_id, s.csrf_token, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha256(token)}`;
  if (rows.length === 0) return null;

  const row = rows[0] as {
    id: number;
    email: string;
    full_name: string;
    role: Role;
    employee_id: number | null;
    csrf_token: string;
    expires_at: string;
  };
  if (new Date(row.expires_at) <= new Date()) {
    await sql`DELETE FROM sessions WHERE token_hash = ${sha256(token)}`;
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    employeeId: row.employee_id,
    csrfToken: row.csrf_token,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthRequired();
  return user;
}

export class AuthRequired extends Error {}

/** Проверка CSRF-токена для мутирующих запросов. */
export function checkCsrf(user: SessionUser, token: string | null): boolean {
  if (!token) return false;
  const a = Buffer.from(user.csrfToken);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const roleLabel: Record<Role, string> = {
  admin: "Администратор (HR)",
  manager: "Руководитель",
  employee: "Сотрудник",
};

export function canManage(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "manager";
}
