import { NextResponse } from "next/server";
import { getSessionUser, canManage, checkCsrf, type SessionUser } from "./auth";

export type GuardResult =
  | { ok: true; user: SessionUser; form: FormData }
  | { ok: false; response: NextResponse };

/**
 * Общая проверка мутирующих запросов: сессия, роль и CSRF-токен.
 * На ошибке возвращает готовый ответ-редирект.
 */
export async function guardMutation(request: Request, opts: { manage?: boolean; errorPath: string }): Promise<GuardResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, response: NextResponse.redirect(new URL("/login", request.url), 303) };
  }
  if (opts.manage && !canManage(user)) {
    return { ok: false, response: NextResponse.redirect(new URL(`${opts.errorPath}?error=forbidden`, request.url), 303) };
  }
  const form = await request.formData();
  const csrf = String(form.get("sb_csrf") ?? "");
  if (!checkCsrf(user, csrf)) {
    return { ok: false, response: NextResponse.redirect(new URL(`${opts.errorPath}?error=csrf`, request.url), 303) };
  }
  return { ok: true, user, form };
}

/** Коды ошибок PostgreSQL, которые стоит показать понятным сообщением. */
export function pgErrorCode(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err) return String((err as { code: unknown }).code);
  return null;
}
