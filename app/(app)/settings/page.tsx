import { getSessionUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/app/PageHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getDictionary, localeFromCookie } from "@/lib/i18n";
import { sql } from "@/lib/db";
import { Icon } from "@/components/Icon";
import Link from "next/link";

export const metadata = { title: "Настройки" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await getSessionUser();
  const jar = await cookies();
  const locale = localeFromCookie(jar.get("sb_locale")?.value);
  const t = getDictionary(locale);
  const sp = await searchParams;

  const pref = await sql`SELECT notify_email FROM users WHERE id = ${user!.id}`;
  const notifyEmail = Boolean((pref[0] as { notify_email: boolean } | undefined)?.notify_email);

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу.",
    password_current: "Текущий пароль введён неверно.",
    password_short: "Новый пароль не короче 8 символов и должен отличаться от текущего.",
    password_mismatch: "Новый пароль и подтверждение не совпадают.",
  };

  return (
    <>
      <PageHeader title={t["settings.title"]} description="Профиль, уведомления, внешний вид и язык интерфейса." />

      {sp.error && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{errors[sp.error] ?? "Ошибка. Повторите."}</p>}
      {sp.saved && <p role="status" className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Сохранено.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card card-pad lg:col-span-2" aria-label="Профиль">
          <h2 className="font-sans text-base font-bold">{t["settings.profile"]}</h2>
          <dl className="mt-3 divide-y divide-border text-sm">
            <div className="py-2.5"><dt className="text-xs font-bold uppercase text-text-2">ФИО</dt><dd className="mt-0.5">{user!.fullName}</dd></div>
            <div className="py-2.5"><dt className="text-xs font-bold uppercase text-text-2">Почта</dt><dd className="mt-0.5">{user!.email}</dd></div>
            <div className="py-2.5"><dt className="text-xs font-bold uppercase text-text-2">Роль</dt><dd className="mt-0.5">{user!.role === "admin" ? "Администратор (HR)" : user!.role === "manager" ? "Руководитель" : "Сотрудник"}</dd></div>
          </dl>

          <h2 className="mt-6 font-sans text-base font-bold">Уведомления</h2>
          <form method="POST" action="/api/settings/notifications" className="mt-3">
            <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm hover:border-brand">
              <input type="checkbox" name="notify_email" defaultChecked={notifyEmail} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
              <span>{t["settings.notifications"]}</span>
            </label>
            <button type="submit" className="btn btn-ghost btn-sm mt-3">Сохранить</button>
          </form>
          <p className="mt-3 text-[11px] leading-snug text-text-2">
            Отписка от уведомлений не требует объяснений. <Link href="/legal/delete-data" className="underline underline-offset-2 hover:text-text">Запросить удаление моих данных</Link>
          </p>
        </section>

        <section className="card card-pad lg:col-span-3" aria-label="Внешний вид и безопасность">
          <h2 className="font-sans text-base font-bold">{t["settings.theme"]}</h2>
          <div className="mt-2"><ThemeToggle locale={locale} /></div>

          <h2 className="mt-6 font-sans text-base font-bold">{t["settings.language"]}</h2>
          <div className="mt-2"><LanguageToggle /></div>

          <h2 className="mt-6 font-sans text-base font-bold">{t["settings.password"]}</h2>
          <form method="POST" action="/api/auth/change-password" className="mt-3 grid gap-3 sm:max-w-md">
            <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
            <div>
              <label className="label" htmlFor="current_password">Текущий пароль</label>
              <input className="input" id="current_password" name="current_password" type="password" required autoComplete="current-password" />
            </div>
            <div>
              <label className="label" htmlFor="new_password">Новый пароль</label>
              <input className="input" id="new_password" name="new_password" type="password" required minLength={8} autoComplete="new-password" placeholder="Не короче 8 символов" />
            </div>
            <div>
              <label className="label" htmlFor="confirm_password">Повторите новый пароль</label>
              <input className="input" id="confirm_password" name="confirm_password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-primary justify-self-start"><Icon name="lock" size={16} />Обновить пароль</button>
          </form>
        </section>
      </div>
    </>
  );
}
